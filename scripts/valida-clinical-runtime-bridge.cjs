#!/usr/bin/env node
/**
 * PROMETE: a ponte do fluxo legado para o Clinical Core continua apenas
 * registrando telemetria; não pode ganhar import de engine clínico nem alterar
 * árvore/rota. Também exige que decisão, observação e transição gerem eventos.
 */
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const rel = "lib/clinical-runtime-bridge.ts";
const p = path.join(raiz, rel);

if (!fs.existsSync(p)) {
  console.error(`❌ ${rel} não existe`);
  process.exit(1);
}

const src = fs.readFileSync(p, "utf8");
const falhas = [];

for (const nome of [
  "recordFlowDecision",
  "recordFlowAdvance",
  "recordFlowObservation",
  "recordProtocolTransition",
]) {
  if (!new RegExp(`export function ${nome}\\b`).test(src)) {
    falhas.push(`faltou export ${nome}`);
  }
}

if (!/appendClinicalEvent\s*\(/.test(src)) falhas.push("bridge não grava event log");
if (!/recordClinicalObservation\s*\(/.test(src)) falhas.push("bridge não grava observações temporais");
if (/DecisionTreeEngine|engine\.choose|engine\.advance|router\./.test(src)) {
  falhas.push("bridge ganhou poder de decisão/navegação; ele deve ser observador, não controlador");
}

if (falhas.length) {
  falhas.forEach((f) => console.error(`❌ ${f}`));
  process.exit(1);
}

console.log("✅ Clinical Runtime Bridge preserva fronteira observacional");
