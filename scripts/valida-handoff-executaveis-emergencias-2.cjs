#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const casesPath = path.join(root, "clinical-safety-cases", "handoff-executaveis.ts");
const runnerPath = path.join(root, "scripts", "test-clinical-handoffs-emergencias-2.cjs");

const errors = [];
for (const file of [casesPath, runnerPath]) {
  if (!fs.existsSync(file)) errors.push(`arquivo ausente: ${path.relative(root, file)}`);
}

if (!errors.length) {
  const cases = fs.readFileSync(casesPath, "utf8");
  const runner = fs.readFileSync(runnerPath, "utf8");

  for (const token of [
    'id: "tachy-pulseless-handoff-complete-consume-once"',
    'id: "brady-pulseless-partial-context-published-with-missing-optional"',
    'id: "tachy-handoff-observation-wins-over-event"',
    "prepareAndPublishClinicalHandoff",
    "consumeClinicalHandoff",
    "listPendingClinicalHandoffs",
    "recordClinicalObservation",
    "appendClinicalEvent",
    "missingOptionalFacts",
  ]) {
    if (!cases.includes(token)) errors.push(`casos executáveis sem ${token}`);
  }

  if (cases.includes('id: "brady-pulseless-handoff-incomplete-not-published"')) {
    errors.push("caso legado ainda exige bloquear publicação de contexto PCR parcial");
  }

  for (const token of [
    "node_modules",
    "typescript",
    "handoff-executaveis.ts",
    "runExecutableClinicalHandoffCases",
    "issues.length",
    "fs.rmSync(temp",
  ]) {
    if (!runner.includes(token)) errors.push(`runner sem ${token}`);
  }

  if (/Math\.random|fetch\(|axios|openai|anthropic|gemini/i.test(cases + runner)) {
    errors.push("trajetórias de handoff devem permanecer determinísticas e offline");
  }
}

if (errors.length) {
  console.error("\n❌ validação estrutural dos handoffs executáveis falhou\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\n✅ casos e runner executáveis de handoff cobrem contexto completo, parcial e prioridade observacional.\n");
