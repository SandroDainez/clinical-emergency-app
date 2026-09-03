#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceRequired(file, from, to, label) {
  const full = path.join(root, file);
  let s = fs.readFileSync(full, 'utf8');
  if (!s.includes(from)) throw new Error(`Missing expected text (${label}) in ${file}`);
  s = s.replace(from, to);
  fs.writeFileSync(full, s);
}

replaceRequired(
  'lib/alvos-tce.ts',
  '  "Metas mantidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada pela autorregulação quando disponível; SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais; PaCO₂ 35–40 mmHg na ausência de HIC; PAS ≥ 110 mmHg para 15–49 e >70 anos e ≥ 100 mmHg para 50–69 anos; normotermia; glicemia 100–180 mg/dL; Na 135–145 mEq/L como alvo basal.";',
  '  "Metas mantidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada pela autorregulação quando disponível; SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais; PaCO₂ 35–40 mmHg na ausência de HIC; PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos); normotermia; glicemia 100–180 mg/dL; Na 135–145 mEq/L como alvo basal.";',
  'ICU PAS stratification label'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Manter as metas da estabilização: PAS por faixa etária, SpO₂ ≥ 90%, normocapnia e cabeceira a 30°.",',
  '        "Manter as metas da estabilização: PAS por faixa etária, SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais, normocapnia na ausência de HIC e cabeceira a 30°.",',
  'neurosurgery oxygenation target'
);

const i18nFile = path.join(root, 'lib/i18n/modules/tce.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
const anchor = '\n};\n';
if (!i18n.endsWith(anchor)) throw new Error('Unexpected tce i18n ending');
const entries = [
  ['Metas mantidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada pela autorregulação quando disponível; SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais; PaCO₂ 35–40 mmHg na ausência de HIC; PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos); normotermia; glicemia 100–180 mg/dL; Na 135–145 mEq/L como alvo basal.', 'Metas mantenidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada por la autorregulación cuando esté disponible; SpO₂ ≥ 94% y PaO₂ 80–100 mmHg como objetivos iniciales; PaCO₂ 35–40 mmHg en ausencia de HIC; PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 y > 70 años; ≥ 100 para 50–69 años); normotermia; glucemia 100–180 mg/dL; Na 135–145 mEq/L como objetivo basal.'],
  ['Manter as metas da estabilização: PAS por faixa etária, SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais, normocapnia na ausência de HIC e cabeceira a 30°.', 'Mantener las metas de estabilización: PAS por grupo etario, SpO₂ ≥ 94% y PaO₂ 80–100 mmHg como objetivos iniciales, normocapnia en ausencia de HIC y cabecera a 30°.']
];
for (const [pt, es] of entries) {
  if (!i18n.includes(JSON.stringify(pt))) {
    i18n = i18n.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
  }
}
fs.writeFileSync(i18nFile, i18n);
console.log('✅ TCE: regressões residuais de PAS estratificada e SpO2 90 corrigidas.');
