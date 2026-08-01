/**
 * Trava do contexto do paciente — o que pode e o que NÃO pode ser reaproveitado.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * --------------------------
 * O pedido foi que o app pare de perguntar o que já sabe. A implementação
 * reaproveita valores entre módulos, e a decisão que sustenta tudo é a lista do
 * que entra:
 *
 *   ENTRA  — peso, altura, sexo, idade. Não mudam durante o atendimento.
 *   NÃO ENTRA — PA, FC, SpO₂, glicemia, lactato, pH, potássio, NIHSS, Glasgow.
 *
 * O segundo grupo é o que importa travar. Sinal vital muda de minuto a minuto, e
 * é por mudar que se mede. Preencher automaticamente uma PA de dez minutos atrás
 * como se fosse a de agora é PIOR do que perguntar: o médico vê um número
 * plausível, não tem motivo para duvidar, e decide conduta sobre um dado morto.
 *
 * Uma linha a mais na lista de compartilhados, feita sem pensar, produz
 * exatamente esse defeito — e ele é silencioso. Este teste existe para que essa
 * linha não passe.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "contexto-paciente-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "lib", "contexto-do-paciente.ts"),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const ctx = require(path.join(tempDir, "contexto-do-paciente.js"));

const falhas = [];
let ok = 0;

function checa(descricao, condicao) {
  if (condicao) ok++;
  else falhas.push(descricao);
}

// ── O que PODE ser reaproveitado ────────────────────────────────────────────
for (const campo of ["peso", "altura", "sexo", "idade", "pesoOrigem"]) {
  ctx.limparContextoDoPaciente();
  ctx.guardarNoContexto(campo, "70", "sepse-adulto");
  const lido = ctx.lerDoContexto(campo);
  checa(`"${campo}" deveria ser reaproveitável`, lido && lido.valor === "70");
  checa(`"${campo}" deveria registrar a origem`, lido && lido.origem === "sepse-adulto");
}

// ── O que NÃO PODE, de jeito nenhum ─────────────────────────────────────────
//
// Esta é a razão de ser do arquivo. Se alguém acrescentar um destes à lista de
// compartilhados, o app passa a exibir um sinal vital velho como se fosse atual.
const PROIBIDOS = [
  "pas", "pad", "fc", "spo2", "glicemia", "lactato", "ph", "potassio",
  "nihss", "gcs", "glasgow", "temp", "pf", "bicarbonate",
];
for (const campo of PROIBIDOS) {
  ctx.limparContextoDoPaciente();
  ctx.guardarNoContexto(campo, "60", "sepse-adulto");
  checa(
    `"${campo}" NÃO pode ser reaproveitado entre módulos — muda durante o atendimento`,
    ctx.lerDoContexto(campo) === undefined
  );
  checa(
    `"${campo}" não deveria constar da lista de compartilhados`,
    !ctx.CAMPOS_COMPARTILHADOS.includes(campo)
  );
}

// ── Higiene ─────────────────────────────────────────────────────────────────
ctx.limparContextoDoPaciente();
ctx.guardarNoContexto("peso", "   ", "x");
checa("valor em branco não deveria ser guardado", ctx.lerDoContexto("peso") === undefined);

ctx.guardarNoContexto("peso", "  82  ", "avc");
checa("valor deveria ser gravado sem espaços", ctx.lerDoContexto("peso")?.valor === "82");

ctx.guardarNoContexto("peso", "95", "tep");
checa("o mais recente deveria prevalecer", ctx.lerDoContexto("peso")?.valor === "95");

ctx.limparContextoDoPaciente();
checa("limpar deveria esquecer tudo — o próximo paciente não herda nada",
  ctx.lerDoContexto("peso") === undefined);

// A lista é fechada de propósito: o padrão é NÃO compartilhar.
checa(
  "a lista de compartilhados deveria ter exatamente os 5 campos previstos",
  ctx.CAMPOS_COMPARTILHADOS.length === 5
);

console.log("\nContexto do paciente\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
} else {
  console.log(`✅ ${ok} verificações — ${PROIBIDOS.length} campos voláteis confirmados fora do reaproveitamento`);
}
console.log("");

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
