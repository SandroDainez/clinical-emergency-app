#!/usr/bin/env node
/**
 * Valida a FORMA dos casos-piloto antes de existir runner clínico completo.
 * Não promete que a árvore percorre o caso; promete que o catálogo não nasce
 * vazio, sem expectativa ou com campos incompatíveis com o contrato.
 */
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const rel = "clinical-safety-cases/pilotos.ts";
const p = path.join(raiz, rel);

if (!fs.existsSync(p)) {
  console.error(`❌ ${rel} não existe`);
  process.exit(1);
}

const src = fs.readFileSync(p, "utf8");
const falhas = [];

for (const id of ["avc-tempo-dependente-001", "anafilaxia-instavel-001", "isr-via-aerea-001"]) {
  if (!src.includes(`id: "${id}"`)) falhas.push(`caso piloto ausente: ${id}`);
}

for (const campo of ["moduleId:", "description:", "inputs:", "expectation:"]) {
  if (!src.includes(campo)) falhas.push(`catálogo não usa campo obrigatório ${campo}`);
}

if (/\bmodule:\s*"|\binput:\s*\{|mustNotSkip:|notes:/.test(src)) {
  falhas.push("catálogo contém forma antiga incompatível com ClinicalSafetyCase");
}

if (falhas.length) {
  falhas.forEach((f) => console.error(`❌ ${f}`));
  process.exit(1);
}

console.log("✅ catálogo piloto do Emergências 2.0 tem forma compatível com o contrato");
