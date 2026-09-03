#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const alvos = fs.readFileSync(path.join(root, 'lib/alvos-tce.ts'), 'utf8');
const tree = fs.readFileSync(path.join(root, 'tce-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tce.ts'), 'utf8');

const checks = [
  ['SpO2 94 em fonte única', alvos.includes('spo2: "≥ 94%"')],
  ['PaO2 80-100 em neuroproteção', alvos.includes('PaO₂ 80–100 mmHg como alvo inicial')],
  ['PIC <22 e PPC 60-70 mantidos', alvos.includes('PIC < 22 mmHg') && alvos.includes('PPC 60–70 mmHg')],
  ['Na basal 135-145 explícito', alvos.includes('Na 135–145 mEq/L como alvo basal')],
  ['sem SpO2 90 em alvos vivos', !alvos.includes('SpO₂ ≥ 90%') && !alvos.includes('spo2: "≥ 90%"')],
  ['TC normal sem repetição automática por antitrombótico', tree.includes('TC normal não cria indicação automática de repetição apenas por anticoagulação/antiagregação')],
  ['antiagregação sem plaquetas/DDAVP de rotina', tree.includes('não usar plaquetas ou desmopressina apenas para reverter antiagregação')],
  ['DDAVP perioperatória rotulada', tree.includes('desmopressina 0,4 mcg/kg IV pode ser considerada no contexto perioperatório')],
  ['sódio sem hipernatremia profilática', tree.includes('não perseguir hipernatremia profilática')],
  ['traduções novas presentes', i18n.includes('Una TC normal no crea una indicación automática') && i18n.includes('SpO₂ ≥ 94%')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
