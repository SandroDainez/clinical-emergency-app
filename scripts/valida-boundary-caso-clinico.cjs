#!/usr/bin/env node
const fs = require('node:fs');
const read = (p) => fs.readFileSync(p, 'utf8');
const issues = [];
const ok = (cond, msg) => cond ? console.log(`✅ ${msg}`) : issues.push(msg);

const session = read('lib/clinical-session-runtime.ts');
const resume = read('lib/module-session-navigation.ts');
const app = read('components/clinical-app.tsx');
const route = read('app/modulos/[id].tsx');

ok(session.includes('export function createClinicalCaseId'), 'runtime possui gerador de caseId explícito');
ok(app.includes('startClinicalCase(createClinicalCaseId(protocolId))'), 'ClinicalApp liga novo atendimento ao reset central');
ok(app.includes('if (!caseBoundaryReady) return null'), 'telas clínicas não montam antes do boundary do caso');
ok(app.includes('(continuingClinicalCase || resumeSession) && Boolean(active.caseId)'), 'continuação só preserva quando existe caso clínico ativo');
ok(route.includes('continuingClinicalCase={continuingClinicalCase}'), 'rota informa continuidade ao ClinicalApp');
ok(route.includes('sourceModuleId || (protocolId && isProtocolSessionMarkedForResume(protocolId))'), 'rota reconhece transição contextual ou retomada válida');
ok(resume.includes('const RESUME_TTL_MS = 30 * 60 * 1000'), 'retomada tem TTL explícito');
ok(resume.includes('type ResumeMarker = { caseId: string; markedAt: number }'), 'marcador de retomada carrega identidade do caso');
ok(resume.includes('marker.caseId === activeCaseId'), 'retomada exige o mesmo caseId ativo');
ok(resume.includes('now - marker.markedAt <= RESUME_TTL_MS'), 'retomada expirada é rejeitada');
ok(!resume.includes('new Set<string>()'), 'marcador legado sem identidade foi removido');
ok(resume.includes('preMarcacaoDeCausas.delete(protocolId)'), 'causas pré-marcadas são descartadas quando a retomada é inválida/consumida');

if (issues.length) {
  issues.forEach((issue) => console.error(`❌ ${issue}`));
  console.error(`\n❌ STATE-01/HND-01 — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ STATE-01/HND-01 — boundary de caso e retomada por identidade/TTL protegidos');