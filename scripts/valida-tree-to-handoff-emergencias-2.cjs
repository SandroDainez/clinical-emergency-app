#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cases = fs.readFileSync(path.join(root, "clinical-safety-cases", "handoff-trajetorias-executaveis.ts"), "utf8");
const runner = fs.readFileSync(path.join(root, "scripts", "test-tree-to-handoff-emergencias-2.cjs"), "utf8");

const required = [
  'id: "tachy-tree-cardioversion-pulseless-pcr-handoff"',
  'id: "brady-tree-atropine-pulseless-pcr-handoff"',
  '"unstable_cardioversion"',
  '"unstable_reavaliar"',
  '"unstable_sem_pulso"',
  '"atropine"',
  '"after_atropine"',
  '"bradi_sem_pulso"',
  'prepareAndPublishClinicalHandoff',
  'consumeClinicalHandoff("pcr-adulto"',
  'handoff de taquicardia foi consumido duas vezes',
  'handoff de bradicardia foi consumido duas vezes',
];

const errors = [];
for (const token of required) if (!cases.includes(token)) errors.push(`casos perderam ${token}`);

for (const token of [
  'require("typescript")',
  'createProgram',
  'runExecutableTreeToHandoffCases',
  'process.exit(1)',
]) {
  if (!runner.includes(token)) errors.push(`runner perdeu ${token}`);
}

if (/Math\.random|fetch\(|axios|openai|anthropic|gemini/i.test(cases + runner)) {
  errors.push("trajetórias árvore→handoff devem permanecer determinísticas e offline");
}

if (errors.length) {
  console.error("\n❌ proteção das trajetórias árvore → handoff inválida\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("\n✅ trajetórias reais até perda de pulso e handoff para PCR estruturalmente protegidas.\n");
