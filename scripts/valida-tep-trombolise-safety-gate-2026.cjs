#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const issues = [];
const ok = (cond, msg) => { if (!cond) issues.push(msg); else console.log(`✅ ${msg}`); };

const tree = read('tep-decision-tree.ts');
const policies = read('lib/clinical-gate-registry.ts');
const triggers = read('lib/clinical-gate-trigger-registry.ts');
const bindings = read('lib/clinical-decision-observation-bindings.ts');
const candidates = read('clinical-safety-cases/gate-candidate-debts.ts');
const cases = read('clinical-safety-cases/gate-action-triggers.ts');

ok(/ar_trombolise:\s*\{[\s\S]*?clinicalActionId: "administrar_trombolise_sistemica_tep"/.test(tree), 'ar_trombolise expõe ação clínica canônica');
ok(policies.includes('id: "tep-lise-sistemica-categoria-inferior"'), 'policy TEP ativa existe');
ok(/id: "tep-lise-sistemica-categoria-inferior"[\s\S]*?level: "hard_stop"/.test(policies), 'policy TEP é hard_stop');
ok(/id: "tep-lise-sistemica-categoria-inferior"[\s\S]*?overrideAllowed: false/.test(policies), 'hard stop TEP não permite override');
ok(triggers.includes('id: "tep-systemic-thrombolysis-lower-category"'), 'trigger TEP ativo existe');
ok(triggers.includes('value: "a_b_c1_c2"'), 'trigger exige categoria inferior explicitamente registrada');
ok(!/tep-systemic-thrombolysis-lower-category[\s\S]*?operator: "missing"/.test(triggers), 'ausência de categoria não ativa hard stop');
ok(bindings.includes('observation: { id: "tep_categoria_reperfusao", value: "a_b_c1_c2" }'), 'categorias inferiores geram fato estruturado');
ok(bindings.includes('optionId: "int_alto"') && bindings.includes('value: "c3"'), 'C3 é registrado separadamente');
ok(bindings.includes('nodeId: "estabilidade"') && bindings.includes('optionId: "instavel"') && bindings.includes('value: "e"'), 'reclassificação para instabilidade sobrescreve com categoria alta');
ok(!candidates.includes('id: "tep-thrombolysis-for-isolated-ischemic-pain"'), 'candidato promovido saiu do backlog');
ok(cases.includes('TEP: A/B/C1/C2 explícito deve ativar um hard stop'), 'regressão executável cobre bloqueio A/B/C1/C2');
ok(cases.includes('TEP: C3 não pode ser bloqueado'), 'regressão executável cobre C3');
ok(cases.includes('TEP: deterioração/reclassificação para E deve resolver'), 'regressão executável cobre reclassificação para E');
ok(cases.includes('TEP: ausência de categoria não pode ser silenciosamente tratada'), 'regressão executável cobre fato ausente');
ok(tree.includes('NÃO trombolisar por dor torácica'), 'alerta clínico estático de dor isquêmica isolada foi preservado');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  console.error(`\n❌ TEP trombólise SafetyGate — ${issues.length} falha(s)`);
  process.exit(1);
}
console.log('\n✅ TEP trombólise SafetyGate 2026 — 16 travas aprovadas');
