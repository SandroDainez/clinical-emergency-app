#!/usr/bin/env node
const fs = require('node:fs');
const read = p => fs.readFileSync(p, 'utf8');
const issues = [];
const ok = (c,m) => c ? console.log(`✅ ${m}`) : issues.push(m);

const reg = read('lib/clinical-gate-trigger-registry.ts');
const patient = read('lib/clinical-action-gate-patient-state.ts');
const ui = read('components/protocol-screen/acls-decision-flow-screen.tsx');

ok(reg.includes('interactionKind?: "action" | "decision"'), 'registry aceita superfície de interação explícita');
ok(reg.includes('trigger.interactionKind !== input.interactionKind'), 'registry filtra trigger pelo interactionKind');
ok(patient.includes('interactionKind?: "action" | "decision"'), 'ponte Patient State recebe interactionKind');
ok(patient.includes('interactionKind: input.interactionKind'), 'ponte encaminha interactionKind ao gate runtime');
ok(ui.includes('interactionKind: "decision"'), 'decisão clínica avalia gates como decision');
ok(ui.includes('interactionKind: "action"'), 'ActionNode avalia gates como action');
ok(ui.includes('const hardStop = decision.hardStops[0]'), 'handleChoose inspeciona hard stop antes de soft stop');
ok(ui.includes('setPendingHardStop({'), 'hard stop de decisão ganha estado visual próprio');
ok(ui.includes('severity="danger"'), 'hard stop de decisão é apresentado como bloqueio crítico');
ok(!ui.includes('recordClinicalSafetyOverride({ module: currentModuleSlug, gateId: pendingHardStop'), 'hard stop de decisão não oferece override');

if (issues.length) {
  issues.forEach(i => console.error(`❌ ${i}`));
  console.error(`\n❌ GATE-02 — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ GATE-02 — decisão hard-stop e interactionKind protegidos');