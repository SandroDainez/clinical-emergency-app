#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tce-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tce.ts'), 'utf8');

const checks = [
  ['stabilization no longer accepts SpO2 90 as target', tree.includes('Oxigenação: manter SpO₂ ≥ 94%') && !tree.includes('Oxigenação: manter SpO₂ ≥ 90% (idealmente ≥ 94%)')],
  ['PaO2 80-100 retained at stabilization', tree.includes('PaO₂ 80–100 mmHg como alvo inicial')],
  ['early seizure prophylaxis explicitly limited to first 7 days', tree.includes('primeiros 7 dias')],
  ['levetiracetam not claimed superior to phenytoin', tree.includes('não há evidência suficiente para afirmar superioridade do levetiracetam sobre fenitoína')],
  ['late seizure prophylaxis not recommended by inertia', tree.includes('Não manter profilaxia além de 7 dias apenas para prevenir crise tardia')],
  ['continuous EEG begins as soon as feasible when indicated', tree.includes('EEG contínuo: iniciar o mais cedo possível')],
  ['EEG duration individualized rather than fixed', tree.includes('24–48 h ou mais pode ser necessário') && tree.includes('não usar duração fixa universal')],
  ['new oxygenation translation present', i18n.includes('Oxigenación: mantener SpO₂ ≥ 94%')],
  ['new seizure translation present', i18n.includes('Profilaxis de crisis postraumática PRECOZ')],
  ['new EEG translation present', i18n.includes('EEG continuo: iniciarlo lo antes posible')],
];
let failures = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`✅ ${label}`);
  else { console.error(`❌ ${label}`); failures++; }
}
if (failures) { console.error(`\n❌ ${failures} falha(s)`); process.exit(1); }
console.log(`\n✅ TCE convulsões/EEG — ${checks.length} verificações positivas`);
