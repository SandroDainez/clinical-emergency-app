#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const obrigatorios = [
  "lib/clinical-observations.ts",
  "lib/clinical-event-log.ts",
  "lib/clinical-transitions.ts",
  "lib/crisis-actions.ts",
  "lib/clinical-safety-contract.ts",
  "lib/evidence-governance.ts",
  "lib/drug-knowledge/types.ts",
  "components/ui-v2/clinical-cockpit-bar.tsx",
  "components/ui-v2/crisis-action-bar.tsx",
  "components/ui-v2/decision-prompt.tsx",
  "components/ui-v2/safety-gate.tsx",
  "components/ui-v2/reassessment-card.tsx",
];

const ausentes = obrigatorios.filter((rel) => !fs.existsSync(path.join(raiz, rel)));
if (ausentes.length) {
  console.error("❌ Emergências 2 core incompleto:");
  for (const rel of ausentes) console.error(` - ${rel}`);
  process.exit(1);
}

const decisionGrid = fs.readFileSync(
  path.join(raiz, "components/protocol-screen/template/DecisionGrid.tsx"),
  "utf8"
);
if (!/nao_sei|naoSei|não_sei/.test(decisionGrid)) {
  console.error("❌ DecisionGrid perdeu o tratamento visual do ramo 'não sei'.");
  process.exit(1);
}
if (!/design-system\/tokens/.test(decisionGrid)) {
  console.error("❌ DecisionGrid deixou de consumir o design system.");
  process.exit(1);
}

const roadmap = path.join(raiz, "EMERGENCIAS-2-ROADMAP.md");
if (!fs.existsSync(roadmap)) {
  console.error("❌ Roadmap do Emergências 2 ausente.");
  process.exit(1);
}

console.log(`✅ Emergências 2 core: ${obrigatorios.length} contratos/componentes presentes e DecisionGrid protegido.`);
