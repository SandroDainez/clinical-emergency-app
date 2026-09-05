#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const scriptsDir = __dirname;

// Marcador lido pelo censo. Ele só é válido porque este runner realmente
// descobre o mesmo universo de instrumentos e falha se qualquer um falhar.
const COBRE_TODOS_OS_INSTRUMENTOS = true;
void COBRE_TODOS_OS_INSTRUMENTOS;

const ehInstrumento = (nome) => /^(valida|auditoria|mapa|censo)-/.test(nome) && nome.endsWith(".cjs");
const instrumentos = fs.readdirSync(scriptsDir)
  .filter(ehInstrumento)
  .filter((nome) => nome !== "censo-de-instrumentos.cjs")
  // A suite é a chamadora canônica deste runner no pretest:all. Incluí-la aqui
  // criaria recursão suite → total gate → suite → total gate.
  .filter((nome) => nome !== "valida-emergencias-2-suite.cjs")
  .sort();

const falhas = [];
for (const instrumento of instrumentos) {
  const result = spawnSync(process.execPath, [path.join(scriptsDir, instrumento)], {
    cwd: root,
    encoding: "utf8",
    timeout: 300000,
    env: { ...process.env, SKIP_TOTAL_INSTRUMENT_GATE: "1" },
  });

  if (result.status !== 0) {
    falhas.push({
      instrumento,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    });
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

console.log(`\n✅ Portão total de instrumentos: ${instrumentos.length}/${instrumentos.length} aprovados.\n`);
