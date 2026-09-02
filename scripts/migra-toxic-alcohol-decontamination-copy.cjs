#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function replaceExactlyOnce(file, before, after, label) {
  let src = fs.readFileSync(file, "utf8");
  if (src.includes(after)) return;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: contexto encontrado ${count}x; esperado 1`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src, "utf8");
}

replaceExactlyOnce(
  path.join(root, "poisoning-decision-tree.ts"),
  '      summary: "Acidose com ânion gap alto + gap osmolar alto. NÃO fazer carvão nem lavagem.",\n',
  '      summary: "Acidose com ânion gap alto + gap osmolar alto. Carvão ativado não tem papel em metanol/etilenoglicol. Lavagem gástrica não é recomendada rotineiramente; benefício não demonstrado.",\n',
  "tox_alcool_toxico summary"
);

replaceExactlyOnce(
  path.join(root, "clinical-safety-cases/gate-candidate-debts.ts"),
  '    status: ["needs_action_surface", "needs_tree_content_review"],\n    riskStatement: "Carvão ativado não tem papel em metanol/etilenoglicol; já a proibição absoluta de lavagem gástrica precisa ser reescrita para refletir que a técnica não é rotineira e raramente é indicada, em vez de afirmar impossibilidade universal.",\n    currentTreeEvidence: "O summary de tox_alcool_toxico contém literalmente \'NÃO fazer carvão nem lavagem\'.",\n',
  '    status: ["needs_action_surface"],\n    riskStatement: "Carvão ativado não tem papel em metanol/etilenoglicol; lavagem gástrica não é recomendada rotineiramente e seu benefício não foi demonstrado, portanto ainda é preciso decidir se algum desses pontos merece uma superfície de SafetyGate.",\n    currentTreeEvidence: "O summary de tox_alcool_toxico separa carvão ativado (sem papel em metanol/etilenoglicol) de lavagem gástrica (não rotineira; benefício não demonstrado).",\n',
  "toxic alcohol debt"
);

console.log("Texto de álcool tóxico e dívida correspondente preparados em workspace.");
