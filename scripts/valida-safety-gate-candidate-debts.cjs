#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const debts = read("clinical-safety-cases/gate-candidate-debts.ts");
const activePolicies = read("lib/clinical-gate-registry.ts");
const tep = read("tep-decision-tree.ts");
const tox = read("poisoning-decision-tree.ts");
const issues = [];
const expect = (ok, message) => { if (!ok) issues.push(message); };

const debtIds = [...debts.matchAll(/\n\s*id: "([^"]+)",\n\s*protocolId:/g)].map((m) => m[1]);
expect(debtIds.length === 4, `esperadas 4 dívidas iniciais de gate; encontradas ${debtIds.length}`);
expect(new Set(debtIds).size === debtIds.length, "há IDs duplicados em gate-candidate-debts");
for (const id of debtIds) {
  expect(!activePolicies.includes(`id: "${id}"`), `${id}: dívida apareceu no registry ativo sem promoção explícita`);
}

expect(debts.includes('protocolId: "intoxicacoes_exogenas"'), "dívidas toxicológicas perderam o id canônico da árvore");
expect(debts.includes('protocolId: "tep_2024"'), "dívidas de TEP perderam o id canônico da árvore");
expect(/tox_sedativo:\s*\{[\s\S]*?id: "tox_sedativo"[\s\S]*?type: "action"/.test(tox), "nó tox_sedativo não existe mais como action");
expect(tox.includes("FLUMAZENIL_NAO_USAR"), "fonte canônica FLUMAZENIL_NAO_USAR deixou de existir/ser consumida");
expect(/tox_alcool_toxico:\s*\{[\s\S]*?id: "tox_alcool_toxico"[\s\S]*?type: "action"/.test(tox), "nó tox_alcool_toxico não existe mais como action");
expect(/ar_suporte:\s*\{[\s\S]*?id: "ar_suporte"[\s\S]*?type: "action"/.test(tep), "nó ar_suporte do TEP mudou; reauditar dívida");
expect(tep.includes("EVITAR sedação profunda e ventilação mecânica sempre que possível"), "alerta de sedação/VM no TEP mudou; reauditar dívida");
expect(/tep_dor_isquemica:\s*\{[\s\S]*?id: "tep_dor_isquemica"[\s\S]*?type: "action"/.test(tep), "nó tep_dor_isquemica mudou; reauditar dívida");
expect(tep.includes("NÃO trombolisar por dor torácica"), "alerta de trombólise por dor isolada mudou; reauditar dívida");

function blockFor(id) {
  const start = debts.indexOf(`id: "${id}"`);
  if (start < 0) return "";
  const next = debts.indexOf("\n  {", start + 1);
  return debts.slice(start, next === -1 ? debts.length : next);
}

for (const id of ["tox-flumazenil-high-risk-context", "tox-toxic-alcohol-decontamination"]) {
  const block = blockFor(id);
  expect(block.includes("evidenceReview:"), `${id}: revisão de evidência concluída precisa ficar registrada`);
  expect(block.includes('reviewedAt: "2026-09-02"'), `${id}: data de revisão ausente`);
  expect(!block.includes('"needs_evidence_review"'), `${id}: não pode continuar marcado como evidence review pendente`);
}
expect(blockFor("tox-flumazenil-high-risk-context").includes('candidateLevel: "needs_level_review"'), "flumazenil: nível deve permanecer pendente até separar subcenários de risco");

const toxicAlcoholBlock = blockFor("tox-toxic-alcohol-decontamination");
const oldToxicAlcoholCopy = tox.includes("NÃO fazer carvão nem lavagem");
const reviewedToxicAlcoholCopy =
  tox.includes("Carvão ativado não tem papel em metanol/etilenoglicol.") &&
  tox.includes("Lavagem gástrica não é recomendada rotineiramente; benefício não demonstrado.");
expect(oldToxicAlcoholCopy || reviewedToxicAlcoholCopy, "álcool tóxico: árvore não está nem no estado antigo conhecido nem no texto revisado");
if (oldToxicAlcoholCopy) {
  expect(toxicAlcoholBlock.includes('"needs_tree_content_review"'), "álcool tóxico: texto antigo exige dívida explícita de conteúdo");
} else if (reviewedToxicAlcoholCopy) {
  expect(!toxicAlcoholBlock.includes('"needs_tree_content_review"'), "álcool tóxico: dívida de conteúdo deve sair quando o texto revisado entrar");
  expect(toxicAlcoholBlock.includes("summary de tox_alcool_toxico separa carvão ativado"), "álcool tóxico: debt registry não descreve o conteúdo já revisado");
}

for (const id of ["tep-high-risk-deep-sedation-ventilation", "tep-thrombolysis-for-isolated-ischemic-pain"]) {
  const block = blockFor(id);
  expect(block.includes('"needs_evidence_review"'), `${id}: revisão de evidência ainda deve permanecer pendente`);
  expect(!block.includes("evidenceReview:"), `${id}: não pode parecer revisado sem evidência registrada`);
}

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log(`✅ SafetyGate candidate debts sincronizados: 2 evidências revisadas + 2 pendentes; álcool tóxico em estado ${reviewedToxicAlcoholCopy ? "revisado" : "pré-migração"}.`);
