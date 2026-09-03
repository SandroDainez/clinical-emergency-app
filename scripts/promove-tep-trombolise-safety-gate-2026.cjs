#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text);
function replaceOnce(rel, oldText, newText, label) {
  let s = read(rel);
  if (s.includes(newText)) return;
  if (!s.includes(oldText)) throw new Error(`${label}: trecho de origem não encontrado em ${rel}`);
  s = s.replace(oldText, newText);
  write(rel, s);
}

// 1) A superfície executável: o gate só intercepta a tentativa real de trombólise.
replaceOnce(
  'tep-decision-tree.ts',
  '    ar_trombolise: {\n      id: "ar_trombolise",\n      type: "action",',
  '    ar_trombolise: {\n      id: "ar_trombolise",\n      type: "action",\n      clinicalActionId: "administrar_trombolise_sistemica_tep",',
  'surface ar_trombolise'
);

// 2) Política ativa. Ausência de categoria NÃO bloqueia: somente classificação inferior explícita.
replaceOnce(
  'lib/clinical-gate-registry.ts',
  '] as const;\n\nexport function clinicalGateFor',
  `  {\n    id: "tep-lise-sistemica-categoria-inferior",\n    protocolId: "tep_2024",\n    nodeId: "ar_trombolise",\n    level: "hard_stop",\n    title: "Trombólise sistêmica não indicada nesta categoria de TEP",\n    message:\n      "A classificação registrada permanece A/B/C1/C2. Nestas categorias, a lise sistêmica causa dano sem benefício que justifique o risco; reclassifique se houve deterioração antes de administrar.",\n    rationale:\n      "A diretriz AHA/ACC 2026 recomenda contra trombólise sistêmica nas categorias A–C1 (Classe 3: Harm, A) e C2 (Classe 3: Harm, B-R). O bloqueio só é ativado quando uma categoria inferior foi explicitamente registrada; ausência de classificação não é convertida em contraindicação.",\n    overrideAllowed: false,\n    resolution:\n      "Voltar à estratificação/estabilidade e registrar a categoria atual. C3 não deve ser tratado como indicação automática; D/E exigem decisão de reperfusão contextual conforme risco e contraindicações.",\n    resolutionNodeId: "estabilidade",\n    source: {\n      reference: "2026 AHA/ACC/ACCP/ACEP/CHEST/SCAI/SHM/SIR/SVM/SVN Acute Pulmonary Embolism Guideline — Table 7",\n      version: "2026",\n      reviewedAt: "2026-09-03",\n    },\n  },\n] as const;\n\nexport function clinicalGateFor`,
  'policy registry'
);

// 3) Trigger estreito: só a categoria inferior explicitamente estabelecida dispara o hard stop.
replaceOnce(
  'lib/clinical-gate-trigger-registry.ts',
  '] as const;\n\nexport function activeClinicalGatesForAction',
  `  {\n    id: "tep-systemic-thrombolysis-lower-category",\n    gateId: "tep-lise-sistemica-categoria-inferior",\n    protocolId: "tep_2024",\n    nodeId: "ar_trombolise",\n    interactionKind: "action",\n    actionId: "administrar_trombolise_sistemica_tep",\n    when: { fact: "tep_categoria_reperfusao", operator: "equals", value: "a_b_c1_c2" },\n  },\n] as const;\n\nexport function activeClinicalGatesForAction`,
  'trigger registry'
);

// 4) Fato temporal estruturado. C3 e E sobrescrevem um estado inferior quando a decisão é refeita.
replaceOnce(
  'lib/clinical-decision-observation-bindings.ts',
  '] as const;\n\nexport function decisionObservationFor',
  `  {\n    protocolId: "tep_2024",\n    nodeId: "estratificacao",\n    optionId: "baixo",\n    observation: { id: "tep_categoria_reperfusao", value: "a_b_c1_c2" },\n  },\n  {\n    protocolId: "tep_2024",\n    nodeId: "estratificacao",\n    optionId: "int_baixo",\n    observation: { id: "tep_categoria_reperfusao", value: "a_b_c1_c2" },\n  },\n  {\n    protocolId: "tep_2024",\n    nodeId: "estratificacao",\n    optionId: "int_alto",\n    observation: { id: "tep_categoria_reperfusao", value: "c3" },\n  },\n  {\n    protocolId: "tep_2024",\n    nodeId: "estabilidade",\n    optionId: "instavel",\n    observation: { id: "tep_categoria_reperfusao", value: "e" },\n  },\n] as const;\n\nexport function decisionObservationFor`,
  'decision observations'
);

// 5) Regressões executáveis do gate.
replaceOnce(
  'clinical-safety-cases/gate-action-triggers.ts',
  '  return issues;\n}',
  `  const tepLower = evaluateClinicalActionAttempt({\n    protocolId: "tep_2024",\n    nodeId: "ar_trombolise",\n    actionId: "administrar_trombolise_sistemica_tep",\n    context: { tep_categoria_reperfusao: "a_b_c1_c2" },\n  });\n  expect(tepLower.hardStops.length === 1, "TEP: A/B/C1/C2 explícito deve ativar um hard stop de lise sistêmica", issues);\n  expect(tepLower.canProceedWithoutOverride === false, "TEP: categoria inferior explícita deve bloquear lise sistêmica", issues);\n  expect(canProceedAfterRecordedOverrides(tepLower, new Set(["tep-lise-sistemica-categoria-inferior"])) === false, "TEP: hard stop de categoria não pode ser liberado por override", issues);\n\n  const tepC3 = evaluateClinicalActionAttempt({\n    protocolId: "tep_2024",\n    nodeId: "ar_trombolise",\n    actionId: "administrar_trombolise_sistemica_tep",\n    context: { tep_categoria_reperfusao: "c3" },\n  });\n  expect(tepC3.evaluations.length === 0, "TEP: C3 não pode ser bloqueado pelo gate específico de A/B/C1/C2", issues);\n\n  const tepE = evaluateClinicalActionAttempt({\n    protocolId: "tep_2024",\n    nodeId: "ar_trombolise",\n    actionId: "administrar_trombolise_sistemica_tep",\n    context: { tep_categoria_reperfusao: "e" },\n  });\n  expect(tepE.evaluations.length === 0, "TEP: deterioração/reclassificação para E deve resolver o hard stop de categoria inferior", issues);\n\n  const tepMissing = evaluateClinicalActionAttempt({\n    protocolId: "tep_2024",\n    nodeId: "ar_trombolise",\n    actionId: "administrar_trombolise_sistemica_tep",\n    context: {},\n  });\n  expect(tepMissing.evaluations.length === 0, "TEP: ausência de categoria não pode ser silenciosamente tratada como categoria inferior", issues);\n\n  return issues;\n}`,
  'gate trigger cases'
);

// 6) A dívida deixa de ser candidata porque agora tem fato + superfície + policy executável.
{
  const rel = 'clinical-safety-cases/gate-candidate-debts.ts';
  let s = read(rel);
  const marker = '  {\n    id: "tep-thrombolysis-for-isolated-ischemic-pain",';
  if (s.includes(marker)) {
    const start = s.indexOf(marker);
    const end = s.indexOf('\n  },\n] as const;', start);
    if (end < 0) throw new Error('candidate debt TEP: fechamento não encontrado');
    s = s.slice(0, start) + s.slice(end + '\n  },'.length);
    write(rel, s);
  }
}

// 7) Atualiza a trava do backlog: 3 candidatos continuam pendentes; o TEP promovido deve estar ativo.
{
  const rel = 'scripts/valida-safety-gate-candidate-debts.cjs';
  let s = read(rel);
  s = s.replace('expect(debtIds.length === 4, `esperadas 4 dívidas iniciais de gate; encontradas ${debtIds.length}`);', 'expect(debtIds.length === 3, `esperadas 3 dívidas remanescentes de gate; encontradas ${debtIds.length}`);');
  const start = s.indexOf('const thrombolysisPainBlock = blockFor("tep-thrombolysis-for-isolated-ischemic-pain")');
  if (start >= 0) {
    const end = s.indexOf('\n\nif (issues.length)', start);
    if (end < 0) throw new Error('candidate validator: fim do bloco TEP não encontrado');
    s = s.slice(0, start) + 'expect(!debtIds.includes("tep-thrombolysis-for-isolated-ischemic-pain"), "TEP trombólise: candidato promovido não pode permanecer como dívida");\nexpect(activePolicies.includes(\'id: "tep-lise-sistemica-categoria-inferior"\'), "TEP trombólise: policy promovida deve existir no registry ativo");' + s.slice(end);
  }
  s = s.replace('console.log("✅ SafetyGate candidate debts: 4/4 evidências revisadas; nenhum candidato promovido ao registry ativo.");', 'console.log("✅ SafetyGate candidate debts: 3 dívidas remanescentes; gate de trombólise por categoria promovido explicitamente.");');
  write(rel, s);
}

console.log('✅ TEP 2026: hard stop de trombólise sistêmica em categoria inferior explicitamente estabelecida foi instrumentado.');
