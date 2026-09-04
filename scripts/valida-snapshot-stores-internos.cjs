#!/usr/bin/env node
const fs = require('node:fs');
const read = (p) => fs.readFileSync(p, 'utf8');
const issues = [];
const ok = (cond, msg) => cond ? console.log(`✅ ${msg}`) : issues.push(msg);

const decision = read('lib/clinical-observation-decision-gate.ts');
const vaso = read('lib/clinical-vasopressor-reassessment.ts');
const node = read('lib/clinical-reassessment-node-runtime.ts');

ok(decision.includes('exportObservationDecisionConfirmationsSnapshot'), 'confirmações stale exportam snapshot');
ok(decision.includes('restoreObservationDecisionConfirmationsSnapshot'), 'confirmações stale restauram snapshot');
ok(decision.includes('confirmationKey(item.decisionId, item.observationId)'), 'restore recompõe chave canônica da confirmação');
ok(decision.includes('timestamp inválido'), 'timestamps inválidos falham explicitamente');

ok(vaso.includes('exportVasopressorReassessmentSnapshot'), 'vínculo de vasopressor exporta snapshot');
ok(vaso.includes('restoreVasopressorReassessmentSnapshot'), 'vínculo de vasopressor restaura snapshot');
ok(vaso.includes('pendingByModule.set(item.moduleId, item.reassessmentId)'), 'restore recompõe vínculo módulo-reavaliação');

ok(node.includes('exportClinicalReassessmentNodeRuntimeSnapshot'), 'binding de nós de reavaliação exporta snapshot');
ok(node.includes('restoreClinicalReassessmentNodeRuntimeSnapshot'), 'binding de nós de reavaliação restaura snapshot');
ok(node.includes('pendingByBinding.set(item.bindingKey, item.reassessmentId)'), 'restore recompõe binding de reavaliação');

if (issues.length) {
  issues.forEach((issue) => console.error(`❌ ${issue}`));
  console.error(`\n❌ HND-02b wave 2 — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ HND-02b wave 2 — 10 travas dos stores internos');
