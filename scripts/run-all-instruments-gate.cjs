#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const scriptsDir = __dirname;

const COBRE_TODOS_OS_INSTRUMENTOS = true;
void COBRE_TODOS_OS_INSTRUMENTOS;

const ehInstrumento = (nome) => /^(valida|auditoria|mapa|censo)-/.test(nome) && nome.endsWith(".cjs");

const SUBSTITUIDOS_POR_GATE_DE_NAO_REGRESSAO = new Set([
  "valida-paleta.cjs",
  "valida-prazo-visivel.cjs",
  "valida-leitura-de-fonte.cjs",
  "valida-traducao-runtime.cjs",
  "valida-traducao-composta.cjs",
]);

const MEDICOES_NAO_BLOQUEANTES = new Set([
  "mapa-de-calculadoras.cjs",
]);

const instrumentos = fs.readdirSync(scriptsDir)
  .filter(ehInstrumento)
  .filter((nome) => nome !== "censo-de-instrumentos.cjs")
  .filter((nome) => nome !== "valida-emergencias-2-suite.cjs")
  .filter((nome) => !SUBSTITUIDOS_POR_GATE_DE_NAO_REGRESSAO.has(nome))
  .filter((nome) => !MEDICOES_NAO_BLOQUEANTES.has(nome))
  .sort();

const inventario = spawnSync("npm", ["run", "audit:inventario"], {
  cwd: root,
  encoding: "utf8",
  timeout: 300000,
  env: { ...process.env, SKIP_TOTAL_INSTRUMENT_GATE: "1" },
});
if (inventario.status !== 0) {
  console.error("\n❌ Portão total: não foi possível gerar o inventário clínico exigido pela rastreabilidade.\n");
  if (inventario.stdout) console.error(inventario.stdout);
  if (inventario.stderr) console.error(inventario.stderr);
  process.exit(1);
}

const falhas = [];
for (const instrumento of instrumentos) {
  const result = spawnSync(process.execPath, [path.join(scriptsDir, instrumento)], {
    cwd: root,
    encoding: "utf8",
    timeout: 300000,
    env: { ...process.env, SKIP_TOTAL_INSTRUMENT_GATE: "1" },
  });

  if (result.status !== 0) {
    falhas.push({ instrumento, status: result.status, signal: result.signal, stdout: result.stdout ?? "", stderr: result.stderr ?? "" });
  }
}

if (falhas.length) {
  console.error(`\n❌ Portão total de instrumentos: ${falhas.length}/${instrumentos.length} falharam.\n`);
  for (const falha of falhas) {
    console.error(`--- ${falha.instrumento} · status=${falha.status ?? "null"}${falha.signal ? ` · signal=${falha.signal}` : ""}`);
    const saida = `${falha.stdout}\n${falha.stderr}`.trim().split("\n").slice(-16).join("\n");
    if (saida) console.error(saida);
  }
  process.exit(1);
}

console.log(
  `\n✅ Portão total de instrumentos: ${instrumentos.length}/${instrumentos.length} gates bloqueantes aprovados` +
  ` · ${SUBSTITUIDOS_POR_GATE_DE_NAO_REGRESSAO.size} estrito(s) cobertos por gate de não-regressão` +
  ` · ${MEDICOES_NAO_BLOQUEANTES.size} medição(ões) não bloqueante(s).\n`
);
