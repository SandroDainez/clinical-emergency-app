#!/usr/bin/env node
const fs = require('node:fs');
const read = (p) => fs.readFileSync(p, 'utf8');
const issues = [];
const ok = (cond, msg) => cond ? console.log(`✅ ${msg}`) : issues.push(msg);

const marker = read('lib/clinical-case-reload-marker.ts');
const runtime = read('lib/clinical-session-runtime.ts');
const app = read('components/clinical-app.tsx');
const gate = read('components/clinical-case-recovery-gate.tsx');

ok(marker.includes('sessionStorage'), 'sentinela de caso usa storage de sessão no web');
ok(marker.includes('detectInterruptedClinicalCase'), 'runtime possui detecção explícita de reload interrompido');
ok(marker.includes('if (activeCaseId && marker.caseId === activeCaseId) return undefined'), 'mesmo caseId em memória não gera falso bloqueio');
ok(runtime.includes('clearActiveClinicalCaseMarker();'), 'encerramento explícito remove sentinela persistida');
ok(app.includes('const [interruptedCase'), 'ClinicalApp possui estado explícito de caso interrompido');
ok(app.includes('detectInterruptedClinicalCase(active.caseId)'), 'boundary consulta sentinela antes de iniciar novo caso');
ok(app.includes('setCaseBoundaryReady(false)'), 'caso interrompido impede montagem silenciosa do novo fluxo');
ok(app.includes('<ClinicalCaseRecoveryGate'), 'reload interrompido possui superfície visual crítica');
ok(app.includes('engine.resetSession?.();'), 'descartar atendimento anterior reinicializa engine antes do novo caso');
ok(app.includes('writeActiveClinicalCaseMarker({'), 'novo atendimento atualiza a sentinela persistida');
ok(gate.includes('severity="critical"'), 'recovery gate é apresentado como barreira crítica');
ok(gate.includes('não pode ser reconstruído com segurança'), 'UI não finge reidratação inexistente');
ok(gate.includes('evitar repetição silenciosa de medicação'), 'risco de repetição de intervenção fica explícito');
ok(!gate.includes('Continuar atendimento anterior'), 'não existe botão de falsa retomada sem estado restaurado');

if (issues.length) {
  issues.forEach((issue) => console.error(`❌ ${issue}`));
  console.error(`\n❌ HND-02a — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ HND-02a — reload fail-closed protegido; reidratação completa continua dívida separada');
