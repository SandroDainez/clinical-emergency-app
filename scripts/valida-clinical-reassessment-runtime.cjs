#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const runtime = fs.readFileSync(path.resolve(__dirname, "../lib/clinical-reassessment-runtime.ts"), "utf8");
const session = fs.readFileSync(path.resolve(__dirname, "../lib/clinical-session-runtime.ts"), "utf8");
const failures = [];

for (const token of ["requireClinicalReassessment", "completeClinicalReassessment", "listPendingClinicalReassessments", "type: \"reassessment\""]) {
  if (!runtime.includes(token.replace(/\\"/g, '"'))) failures.push(`reassessment runtime sem ${token}`);
}
if (!/resumo obrigatório/.test(runtime)) failures.push("reavaliação pode ser concluída sem resumo");
if (!/clearPendingClinicalReassessments\(\)/.test(session)) failures.push("novo caso não limpa reavaliações pendentes");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("clinical reassessment runtime: OK");
