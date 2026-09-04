#!/usr/bin/env node
const fs = require('node:fs');
const read = (p) => fs.readFileSync(p, 'utf8');
const issues = [];
const ok = (cond, msg) => cond ? console.log(`✅ ${msg}`) : issues.push(msg);

const eventLog = read('lib/clinical-event-log.ts');
const observations = read('lib/clinical-observations.ts');
const handoffs = read('lib/clinical-handoff-runtime.ts');
const interruptions = read('lib/clinical-interruption-session.ts');
const reassessments = read('lib/clinical-reassessment-runtime.ts');
const context = read('lib/contexto-do-paciente.ts');
const ui = read('lib/module-ui-state.ts');

ok(eventLog.includes('exportClinicalEventLogSnapshot'), 'event log exporta snapshot canônico');
ok(eventLog.includes('restoreClinicalEventLogSnapshot'), 'event log restaura snapshot canônico');
ok(eventLog.includes('for (const event of snapshot) appendClinicalEvent(event)'), 'restore do event log reutiliza validação append-only');

ok(observations.includes('exportClinicalObservationsSnapshot'), 'observações exportam snapshot');
ok(observations.includes('restoreClinicalObservationsSnapshot'), 'observações restauram snapshot');
ok(observations.includes('recordClinicalObservation(observation)'), 'restore de observações reutiliza normalização canônica');

ok(handoffs.includes('exportClinicalHandoffsSnapshot'), 'handoffs exportam snapshot');
ok(handoffs.includes('restoreClinicalHandoffsSnapshot'), 'handoffs restauram snapshot');
ok(handoffs.includes('publishClinicalHandoff(payload)'), 'restore de handoff preserva proteção contra duplicata');

ok(interruptions.includes('exportClinicalInterruptionsSnapshot'), 'interrupções exportam snapshot');
ok(interruptions.includes('restoreClinicalInterruptionsSnapshot'), 'interrupções restauram snapshot');
ok(interruptions.includes('Snapshot de interrupção clínica inválido'), 'interrupção inválida falha explicitamente');

ok(reassessments.includes('exportPendingClinicalReassessmentsSnapshot'), 'reavaliações pendentes exportam snapshot');
ok(reassessments.includes('restorePendingClinicalReassessmentsSnapshot'), 'reavaliações pendentes restauram snapshot');
ok(reassessments.includes('Snapshot de reavaliação clínica inválido'), 'reavaliação inválida falha explicitamente');

ok(context.includes('exportContextoDoPacienteSnapshot'), 'contexto estável do paciente exporta snapshot');
ok(context.includes('restoreContextoDoPacienteSnapshot'), 'contexto estável do paciente restaura snapshot');
ok(context.includes('ehCampoCompartilhado(entry.campo)'), 'restore mantém allowlist de campos compartilháveis');

ok(ui.includes('exportProtocolUiStateSnapshot'), 'estado UI exporta snapshot');
ok(ui.includes('restoreProtocolUiStateSnapshot'), 'estado UI restaura snapshot');
ok(ui.includes('protocolUiState.clear()'), 'restore de UI substitui, não mistura, estado anterior');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  console.error(`\n❌ HND-02b wave 1 — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ HND-02b wave 1 — 21 travas de export/restore dos stores básicos');
