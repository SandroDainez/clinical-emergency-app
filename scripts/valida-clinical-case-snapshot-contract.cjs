#!/usr/bin/env node
const fs = require('node:fs');
const src = fs.readFileSync('lib/clinical-case-snapshot-contract.ts', 'utf8');
const issues = [];
const ok = (cond, msg) => cond ? console.log(`✅ ${msg}`) : issues.push(msg);

for (const domain of [
  '"engine"',
  '"event_log"',
  '"observations"',
  '"handoffs"',
  '"interruptions"',
  '"reassessments"',
  '"decision_confirmations"',
  '"vasopressor_reassessment"',
  '"patient_context"',
  '"module_ui"',
]) {
  ok(src.includes(domain), `domínio obrigatório ${domain} declarado`);
}

ok(src.includes('schemaVersion: 1'), 'snapshot possui versão explícita');
ok(src.includes('caseId: string'), 'snapshot carrega identidade do atendimento');
ok(src.includes('protocolId: string'), 'snapshot carrega protocolo de origem');
ok(src.includes('capturedAt: number'), 'snapshot carrega instante de captura');
ok(src.includes('status: "captured" | "unsupported"'), 'domínio incompleto é explícito, nunca inferido como vazio');
ok(src.includes('export function isClinicalCaseSnapshotRestorable'), 'contrato possui gate de restaurabilidade');
ok(src.includes('snapshot.domains[domain]?.status === "captured"'), 'restauração exige todos os domínios obrigatórios capturados');
ok(src.includes('snapshot.capturedAt < snapshot.startedAt'), 'snapshot temporalmente inválido é rejeitado');
ok(src.includes('export function listMissingClinicalSnapshotDomains'), 'contrato expõe lacunas de captura');
ok(!src.includes('status: "captured" | "unsupported" | "empty"'), 'não existe estado empty que possa mascarar domínio não capturado');

if (issues.length) {
  issues.forEach((issue) => console.error(`❌ ${issue}`));
  console.error(`\n❌ HND-02b contract — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ HND-02b contract — snapshot versionado e fail-closed protegido');
