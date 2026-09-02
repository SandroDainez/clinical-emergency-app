#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "clinical-safety-cases", "executaveis.ts");

if (!fs.existsSync(file)) {
  console.error("❌ clinical-safety-cases/executaveis.ts ausente");
  process.exit(1);
}

const src = fs.readFileSync(file, "utf8");
const required = [
  "runClinicalTrajectory",
  "assertClinicalTrajectory",
  "avcDecisionTree",
  "anaphylaxisDecisionTree",
  "rsiDecisionTree",
  'id: "avc-isquemico-inicial"',
  'id: "anafilaxia-grau2-adrenalina"',
  'id: "isr-preoxigenacao"',
];

const missing = required.filter((token) => !src.includes(token));
if (missing.length) {
  for (const token of missing) console.error(`❌ caso executável perdeu: ${token}`);
  process.exit(1);
}

if (/Math\.random|fetch\(|axios|openai|anthropic|gemini/i.test(src)) {
  console.error("❌ casos executáveis devem permanecer determinísticos e offline");
  process.exit(1);
}

console.log("✅ casos executáveis do Emergências 2.0 preservados");
