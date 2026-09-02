#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const runtime = fs.readFileSync(path.join(root, "lib/clinical-vasopressor-reassessment.ts"), "utf8");
const session = fs.readFileSync(path.join(root, "lib/clinical-session-runtime.ts"), "utf8");
const failures = [];
for (const token of ["vasopressor_start", "requireClinicalReassessment", "completeClinicalReassessment", "pendingByModule"]) {
  if (!runtime.includes(token)) failures.push(`runtime de vasopressor sem ${token}`);
}
if (!session.includes("clearVasopressorReassessmentState")) {
  failures.push("novo atendimento não limpa estado de reavaliação de vasopressor");
}
if (/(DecisionTreeEngine|router\.|fetch\(|Math\.random)/.test(runtime)) {
  failures.push("runtime de vasopressor ganhou dependência proibida");
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("OK — vasopressor abre obrigação de reavaliar sem inventar nó de árvore");
