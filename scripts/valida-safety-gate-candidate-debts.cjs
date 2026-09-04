#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const debts = read("clinical-safety-cases/gate-candidate-debts.ts");
const activePolicies = read("lib/clinical-gate-registry.ts");
const tep = read("tep-decision-tree.ts");
const tox = read("poisoning-decision-tree.ts");
const tce = read("tce-decision-tree.ts");
const shock = read("shock-decision-tree.ts");
const issues = [];
const expect = (ok, message) => { if (!ok) issues.push(message); };

const debtIds = [...debts.matchAll(/\n\s*id: "([^"]+)",\n\s*protocolId:/g)].map((m) => m[1]);
expect(debtIds.length === 5, `esperadas 5 dívidas remanescentes de gate; encontradas ${debtIds.length}`);
expect(new Set(debtIds).size === debtIds.length, "há IDs duplicados em gate-candidate-debts");
for (const id of debtIds) {
  expect(!activePolicies.includes(`id: "${id}"`), `${id}: dívida apareceu no registry ativo sem promoção explícita`);
}

expect(debts.includes('protocolId: "intoxicacoes_exogenas"'), "dívidas toxicológicas perderam o id canônico da árvore");
expect(debts.includes('protocolId: "tep_2024"'), "dívidas de TEP perderam o id canônico da árvore");
expect(debts.includes('protocolId: "tce"'), "dívida de TCE perdeu o id canônico da árvore");
expect(debts.includes('protocolId: "choque"'), "dívida de choque perdeu o id canônico da árvore");

expect(/tox_sedativo:\s*\{[\s\S]*?id: "tox_sedativo"[\s\S]*?type: "action"/.test(tox), "nó tox_sedativo não existe mais como action");
expect(tox.includes("FLUMAZENIL_NAO_USAR"), "fonte canônica FLUMAZENIL_NAO_USAR deixou de existir/ser consumida");
expect(/tox_alcool_toxico:\s*\{[\s\S]*?id: "tox_alcool_toxico"[\s\S]*?type: "action"/.test(tox), "nó tox_alcool_toxico não existe mais como action");
expect(/ar_suporte:\s*\{[\s\S]*?id: "ar_suporte"[\s\S]*?type: "action"/.test(tep), "nó ar_suporte do TEP mudou; reauditar dívida");
expect(
  tep.includes("EVITAR sedação profunda e ventilação mecânica sempre que possível") ||
    tep.includes("sedação profunda e ventilação mecânica devem ser evitadas salvo indicação clínica") ||
    tep.includes("Evitar sedação profunda e ventilação mecânica salvo indicação clínica forte"),
  "alerta de sedação/VM no TEP mudou; reauditar dívida"
);
expect(/tce_grave:\s*\{[\s\S]*?id: "tce_grave"[\s\S]*?type: "action"/.test(tce), "nó tce_grave mudou; reauditar dívida de hiperventilação");
expect(tce.includes("TCE_HIPERVENTILACAO_PROIBIDA"), "TCE: proibição canônica de hiperventilação profilática deixou de ser consumida");
expect(/dx_cardio_frio_umido:\s*\{[\s\S]*?id: "dx_cardio_frio_umido"[\s\S]*?type: "transition"/.test(shock), "choque: fenótipo frio/úmido mudou; reauditar dívida de fluido");
expect(/(?:evitar expansão volêmica|NÃO usar expansão volêmica empírica)/.test(shock), "choque cardiogênico: proteção contra expansão volêmica empírica no fenótipo congesto deixou de existir");

function blockFor(id) {
  const start = debts.indexOf(`id: "${id}"`);
  if (start < 0) return "";
  const next = debts.indexOf("\n  {", start + 1);
  return debts.slice(start, next === -1 ? debts.length : next);
}

for (const id of debtIds) {
  const block = blockFor(id);
  expect(block.includes("evidenceReview:"), `${id}: revisão de evidência concluída precisa ficar registrada`);
  expect(/reviewedAt: "2026-09-0[23]"/.test(block), `${id}: data de revisão esperada ausente`);
  expect(!block.includes('"needs_evidence_review"'), `${id}: não pode continuar marcado como evidence review pendente`);
}

expect(blockFor("tox-flumazenil-high-risk-context").includes('candidateLevel: "needs_level_review"'), "flumazenil: nível deve permanecer pendente até separar subcenários de risco");
expect(blockFor("tep-high-risk-deep-sedation-ventilation").includes('candidateLevel: "soft_stop"'), "TEP sedação/VM: evidência revisada deve resolver o candidato para soft_stop contextual");
expect(blockFor("tep-high-risk-deep-sedation-ventilation").includes('"needs_fact_model"') && blockFor("tep-high-risk-deep-sedation-ventilation").includes('"needs_action_surface"'), "TEP sedação/VM: fatos e superfície ainda precisam permanecer pendentes");

const tceHyperventilationBlock = blockFor("tce-prophylactic-severe-hyperventilation");
expect(tceHyperventilationBlock.includes('candidateLevel: "hard_stop"'), "TCE hiperventilação profilática intensa: candidato deve ser hard_stop somente no estado estreito revisado");
expect(tceHyperventilationBlock.includes('"needs_fact_model"') && tceHyperventilationBlock.includes('"needs_action_surface"'), "TCE hiperventilação: fatos e superfície ainda precisam permanecer pendentes");
expect(tceHyperventilationBlock.includes("PaCO₂ ≤25 mmHg"), "TCE hiperventilação: fronteira BTF de PaCO₂ ≤25 precisa permanecer explícita");
expect(tceHyperventilationBlock.includes("nunca contra hiperventilação de resgate"), "TCE hiperventilação: gate não pode bloquear terapia temporizadora de resgate");

const cardiogenicFluidBlock = blockFor("choque-cardiogenico-fluid-bolus-with-congestion");
expect(cardiogenicFluidBlock.includes('candidateLevel: "soft_stop"'), "choque cardiogênico congesto: candidato deve permanecer soft_stop contextual");
expect(cardiogenicFluidBlock.includes('"needs_fact_model"') && cardiogenicFluidBlock.includes('"needs_action_surface"'), "choque cardiogênico: fatos e superfície ainda precisam permanecer pendentes");
expect(cardiogenicFluidBlock.includes("tratamento primário"), "choque cardiogênico: dívida deve distinguir fluido primário de pequena prova responsiva");
expect(cardiogenicFluidBlock.includes("não hard stop universal"), "choque cardiogênico: proteção não pode virar veto universal a qualquer fluido");

const toxicAlcoholBlock = blockFor("tox-toxic-alcohol-decontamination");
const reviewedToxicAlcoholCopy =
  tox.includes("Carvão ativado não tem papel em metanol/etilenoglicol.") &&
  tox.includes("Lavagem gástrica não é recomendada rotineiramente; benefício não demonstrado.");
expect(reviewedToxicAlcoholCopy, "álcool tóxico: texto revisado deve permanecer na árvore");
expect(!toxicAlcoholBlock.includes('"needs_tree_content_review"'), "álcool tóxico: dívida de conteúdo não pode reaparecer após correção");
expect(toxicAlcoholBlock.includes("summary de tox_alcool_toxico separa carvão ativado"), "álcool tóxico: debt registry não descreve o conteúdo já revisado");

expect(!debtIds.includes("tep-thrombolysis-for-isolated-ischemic-pain"), "TEP trombólise: candidato promovido não pode permanecer como dívida");
expect(activePolicies.includes('id: "tep-lise-sistemica-categoria-inferior"'), "TEP trombólise: policy promovida deve existir no registry ativo");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ SafetyGate candidate debts: 5 dívidas revisadas; TCE e choque agora têm fronteiras explícitas sem promoção prematura.");