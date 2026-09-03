#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'components/protocol-screen/sedation-calculator-screen.tsx'), 'utf8');

const checks = [
  ['segurança contextual BNM', ui.includes('Garantir hipnose/sedação + analgesia antes do bloqueio')],
  ['segurança contextual analgesia', ui.includes('Avaliar dor · titular ao efeito · usar analgesia multimodal')],
  ['sedação leve contextualizada', ui.includes('sedação leve quando apropriada') && !ui.includes('sedação leve como padrão')],
  ['estratégia tem estado expansível', ui.includes('showStrategy') && ui.includes('setShowStrategy')],
  ['estratégia resumida usa primeira linha', ui.includes('drug.strategy[0] ?? "Abrir estratégia clínica"')],
  ['estratégia não ocupa card permanente', ui.includes('style={s.strategySummary}') && ui.includes('{showStrategy ? (')],
  ['troca de fármaco fecha estratégia', ui.includes('setShowStrategy(false)')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) { console.error(`❌ ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`\n✅ Sedoanalgesia/UI hierarchy: ${checks.length} verificações aprovadas.\n`);
