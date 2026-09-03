#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tce-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tce.ts'), 'utf8');
const checks = [
  ['mechanical VTE prophylaxis from admission', tree.includes('iniciar compressão pneumática desde a admissão')],
  ['low-risk nonoperative TBI within 24 h only after stable follow-up CT', tree.includes('BAIXO risco') && tree.includes('em até 24 h se a TC de controle não mostrar progressão')],
  ['moderate/high-risk nonoperative TBI 24-48 h after stable CT', tree.includes('MODERADO/ALTO') && tree.includes('iniciar em 24–48 h se a TC de controle estiver estável')],
  ['post craniotomy/craniectomy 24-48 h conditional on stable postop CT', tree.includes('Após craniotomia/craniectomia') && tree.includes('24–48 h se a hemorragia estiver estável na TC pós-operatória')],
  ['LMWH preferred over UFH when appropriate', tree.includes('Preferir heparina de baixo peso molecular à heparina não fracionada')],
  ['nutrition reaches basal caloric replacement by day 5-7', tree.includes('reposição calórica basal até o 5º–7º dia pós-trauma')],
  ['stress-ulcer prophylaxis is not automatic for TBI alone', tree.includes('não deve ser automática apenas pelo diagnóstico de TCE')],
  ['VTE translation present', i18n.includes('Profilaxis de TEV: iniciar compresión neumática desde el ingreso')],
  ['nutrition translation present', i18n.includes('Nutrición: iniciar vía enteral tan pronto como sea clínicamente viable')],
];
let failures = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`✅ ${label}`); else { console.error(`❌ ${label}`); failures++; }
}
if (failures) process.exit(1);
console.log(`\n✅ TCE UTI/VTE/nutrição — ${checks.length} verificações positivas`);
