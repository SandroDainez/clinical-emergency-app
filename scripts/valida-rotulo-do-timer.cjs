#!/usr/bin/env node
/**
 * PROMETE: que o rótulo do cronômetro do ACLS venha do PRÓPRIO CRONÔMETRO, e que
 *   nenhum estado com timer ativo mostre o rótulo genérico.
 * NÃO PROMETE: que o rótulo esteja bem escrito, nem que o número esteja certo —
 *   quem garante o número é a invariante `multiple_active_timers` do reducer.
 * UNIVERSO: os estados com `timer` no `protocol.json`, derivados do arquivo — não
 *   listados aqui. Estado novo com timer entra sozinho.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-18) ────────────────────────────────────
 *
 * `getTimerLabel` lia `clinicalIntent` e nomeava 3 de 8 intents; os outros CINCO
 * caíam em "Tempo atual" — entre eles `give_epinephrine` e `give_antiarrhythmic`,
 * as telas de fármaco. Medido na tela: nelas o cronômetro de 2 min aparecia como
 * «Tempo atual», ao lado do cronômetro de parada. Número certo, nome que não diz
 * para onde ele conta (R-77).
 *
 * A causa era R-12 na camada de apresentação: o nome vinha do intent e o número do
 * timer. E o motor JÁ SABIA — `ACLSTimer` carrega `id`, `stateId` e `nextStateId`,
 * e `getTimers()` descartava os três na conversão.
 *
 * ⚠️ A MUTAÇÃO DESTA TRAVA É VOLTAR A DESCARTAR: `getTimers()` deixando de repassar
 * a identidade tem de reprovar, nomeando qual rótulo virou genérico.
 */
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

// ── 1 · O UNIVERSO, DERIVADO do protocolo ─────────────────────────────────
const protocolo = JSON.parse(lerFonte(path.join(appDir, "protocol.json")));
const estados = protocolo.states ?? protocolo;
const comTimer = Object.entries(estados)
  .filter(([, v]) => v && typeof v === "object" && v.timer)
  .map(([id, v]) => ({ id, timer: v.timer, next: v.next }));

if (comTimer.length < 3) {
  falhas.push(
    `só ${comTimer.length} estados com timer no protocol.json — esperado 5. ` +
    `A leitura do universo pode ter quebrado (R-15 item 9).`
  );
} else ok++;

// ── 2 · A IDENTIDADE CHEGA À CAMADA DE APRESENTAÇÃO ───────────────────────
const engine = lerFonte(path.join(appDir, "engine.ts"));
const conversao = engine.slice(engine.indexOf("function getTimers"), engine.indexOf("function getTimers") + 900);
for (const campo of ["id", "stateId", "nextStateId"]) {
  if (!new RegExp(`\\b${campo}:\\s*timer\\.${campo}`).test(conversao)) {
    falhas.push(
      `\`getTimers()\` voltou a DESCARTAR \`${campo}\` do timer.\n` +
      `      ⚠️ Sem a identidade, o rótulo volta a ser adivinhado pelo \`clinicalIntent\` — e\n` +
      `      3 de 8 intents são nomeados. Os OUTROS CINCO caem em «Tempo atual», incluindo\n` +
      `      \`give_epinephrine\` e \`give_antiarrhythmic\`: nas telas de fármaco o cronômetro\n` +
      `      de 2 min passa a se chamar "Tempo atual", ao lado do cronômetro de parada.\n` +
      `      O número segue certo; o NOME deixa de dizer para onde ele conta (R-77).`
    );
  } else ok++;
}

// ── 3 · O RÓTULO É DERIVADO, NÃO LISTADO ──────────────────────────────────
const modelo = lerFonte(path.join(appDir, "acls/screen-model.ts"));
const fn = modelo.slice(modelo.indexOf("function getTimerLabel"), modelo.indexOf("function getTimerLabel") + 700);
if (!/timer\?\.nextStateId/.test(fn)) {
  falhas.push(
    "`getTimerLabel` não deriva mais do `nextStateId` do timer.\n" +
    "      ⚠️ Acrescentar os intents que faltam NÃO é a correção: 5 de 8 no genérico não é\n" +
    "      um caso a tratar, é o padrão — nome vindo de uma fonte e número de outra (R-12).\n" +
    "      Todo timer ativo tem destino; é dele que o nome sai."
  );
} else ok++;

// ── 4 · TODO ESTADO COM TIMER LEVA A UM DESTINO QUE O RÓTULO NOMEIA ───────
//
// ⚠️ É isto que faz o fallback deixar de existir. Se um estado novo com timer
// apontar para outro lugar, o rótulo dele volta a ser genérico — e a trava avisa
// ANTES de a tela mentir.
for (const e of comTimer) {
  if (!String(e.next ?? "").startsWith("avaliar_ritmo")) {
    falhas.push(
      `o estado \`${e.id}\` inicia um timer e leva a \`${e.next}\`, que não é uma avaliação de ritmo.\n` +
      `      ⚠️ O rótulo dele cairá no genérico «Tempo atual». Decida como este cronômetro se\n` +
      `      chama ANTES de a tela mostrá-lo sem nome — e acrescente a regra em \`getTimerLabel\`.`
    );
  } else ok++;
}

// ── 5 · A TROCA DE COMPRESSOR VIVE EM UM LUGAR SÓ ─────────────────────────
const tela = lerFonte(path.join(appDir, "components/protocol-screen/acls-protocol-screen.tsx"));
const usos = (tela.match(/textoDaTrocaDeCompressor\(/g) ?? []).length;
if (usos !== 1) {
  falhas.push(
    `\`textoDaTrocaDeCompressor\` é chamada ${usos} vezes na tela do ACLS — deve ser UMA.\n` +
    `      ⚠️ A troca em dois lugares foi o defeito corrigido em 2026-08-18: ela vive DENTRO do\n` +
    `      bloco do cronômetro, por proximidade (R-89), e a linha separada saiu no mesmo commit.`
  );
} else ok++;

console.log("\nO cronômetro do ACLS diz para onde conta\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${comTimer.length} estados com timer, todos com destino nomeado\n`);
process.exit(0);
