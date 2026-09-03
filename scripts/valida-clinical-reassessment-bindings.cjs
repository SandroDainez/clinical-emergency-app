#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const bindings = fs.readFileSync(path.join(root, "lib/clinical-reassessment-bindings.ts"), "utf8");

const files = {
  anafilaxia: fs.readFileSync(path.join(root, "anaphylaxis-decision-tree.ts"), "utf8"),
  "isr-rapida": fs.readFileSync(path.join(root, "rsi-decision-tree.ts"), "utf8"),
  avc: fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8"),
};

const expected = [
  ["anafilaxia", "immediate_im_epinephrine", "severity_stratification", "epinephrine_anaphylaxis"],
  ["isr-rapida", "intubacao", "confirmacao", "intubation"],
  ["avc", "trombolise", "isq_trombectomia_check", "fibrinolysis"],
];

const failures = [];
for (const [moduleId, therapyNode, reassessmentNode, therapyId] of expected) {
  for (const token of [moduleId, therapyNode, reassessmentNode, therapyId]) {
    if (!bindings.includes(`"${token}"`)) failures.push(`binding ausente: ${moduleId} / ${token}`);
  }
  const tree = files[moduleId];
  for (const node of [therapyNode, reassessmentNode]) {
    if (!new RegExp(`id:\\s*["']${node}["']`).test(tree)) {
      failures.push(`${moduleId}: nó real ausente: ${node}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("OK — bindings de reavaliação apontam para nós reais dos três módulos-piloto.");
