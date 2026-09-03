#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'rsi-decision-tree.ts'), 'utf8');
const doses = fs.readFileSync(path.join(root, 'lib/doses-isr.ts'), 'utf8');
const checks = [];
const ok = (name, value) => checks.push([name, Boolean(value)]);

ok('sem corte rígido de índice de choque 0,8/0,9', !tree.includes('0,9 é o limiar do desfecho mais grave') && tree.includes('NÃO deve funcionar como corte isolado de 0,8 ou 0,9'));
ok('sem bolus rotineiro de cristaloide como prevenção', tree.includes('bolus rotineiro antes da intubação não reduziu colapso cardiovascular'));
ok('push-dose sem regra fixa nos nós corrigidos',
  !tree.includes('Ter push-dose pressor à mão para hipotensão pós-indução (ex.: noradrenalina 8–12 mcg IV em bolus, repetir conforme resposta).') &&
  !tree.includes('Manter vasopressor/push-dose disponível (noradrenalina 8–12 mcg IV em bolus).') &&
  tree.includes('push-dose pode ser ponte em cenário selecionado'));
ok('infusão titulável priorizada quando factível', tree.includes('Preferir infusão titulável quando houver tempo'));
ok('dose do indutor individualizada', tree.includes('não sustenta uma regra universal de dose plena ou de redução automática'));
ok('bloqueador não é reduzido por arrasto', tree.includes('bloqueador continua em dose adequada'));
ok('lidocaína IV retirada como pré-tratamento rotineiro', tree.includes('Lidocaína IV NÃO é pré-tratamento rotineiro da ISR'));
ok('sem token lido na árvore', !tree.includes('out.lido =') && !tree.includes('{lido}'));
ok('sem lidocaína na fonte numérica ISR', !doses.includes('lidocaina: 1.5'));
ok('regra do instável deixou de ser universal', doses.includes('INDIVIDUALIZAR o indutor') && !doses.includes('A prática recomendada é REDUZIR o indutor em pelo menos 50%'));
ok('referências de cetamina permanecem explícitas', doses.includes('cetamina 1 mg/kg') && doses.includes('0,5 mg/kg no choque grave'));
ok('fentanil seletivo preservado', tree.includes('Fentanil {fenta} mcg IV (1–3 mcg/kg, uso seletivo)'));
ok('salbutamol no broncoespasmo preservado', tree.includes('Em asma/broncoespasmo: salbutamol inalatório antes da indução.'));

const failed = checks.filter(([,v]) => !v);
if (failed.length) {
  console.error('\n❌ ISR/hemodinâmica-pré-tratamento 2026:');
  for (const [name] of failed) console.error(`   - ${name}`);
  process.exit(1);
}
console.log(`\n✅ ISR/hemodinâmica-pré-tratamento 2026: ${checks.length} verificações aprovadas.\n`);
