#!/usr/bin/env node
/**
 * PROMETE: o início de um novo caso limpa contexto estável, observações voláteis
 * e event log no MESMO ponto de entrada. Não promete persistência/debrief.
 */
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const rel = "lib/clinical-session-runtime.ts";
const p = path.join(raiz, rel);
if (!fs.existsSync(p)) {
  console.error(`❌ ${rel} não existe`);
  process.exit(1);
}

const src = fs.readFileSync(p, "utf8");
const falhas = [];
for (const chamada of [
  "clearClinicalEventLog()",
  "clearClinicalObservations()",
  "limparContextoDoPaciente()",
]) {
  if (!src.includes(chamada)) falhas.push(`startClinicalCase não chama ${chamada}`);
}
if (!/export function startClinicalCase\b/.test(src)) falhas.push("startClinicalCase não exportado");
if (!/caseId\.trim\(\)/.test(src)) falhas.push("caseId não é normalizado/validado");

if (falhas.length) {
  falhas.forEach((f) => console.error(`❌ ${f}`));
  process.exit(1);
}
console.log("✅ novo caso limpa todos os estados transitórios conhecidos");
