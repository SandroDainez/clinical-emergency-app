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
  'tce-decision-tree.ts',
  '        "Oxigenação: manter SpO₂ ≥ 90% (idealmente ≥ 94%). UM episódio de hipóxia já piora o prognóstico.",',
  '        "Oxigenação: manter SpO₂ ≥ 94% e, quando houver gasometria, usar PaO₂ 80–100 mmHg como alvo inicial. Evitar qualquer episódio de hipóxia.",',
  'stabilization oxygenation'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Profilaxia de convulsão precoce: fenitoína ou levetiracetam por 7 dias em alto risco (BTF) — reduz crise precoce, não altera epilepsia tardia.",',
  '        "Profilaxia de crise pós-traumática PRECOCE: considerar fármaco antisseizure nos pacientes com TCE em que o risco de crise precoce justifique a exposição ao medicamento. A BTF sustenta fenitoína para reduzir crises nos primeiros 7 dias quando o benefício superar os riscos; não há evidência suficiente para afirmar superioridade do levetiracetam sobre fenitoína. Não manter profilaxia além de 7 dias apenas para prevenir crise tardia, salvo se houver crise, status epiléptico ou outra indicação neurológica específica.",',
  'early seizure prophylaxis'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "EEG contínuo é preferível quando há suspeita relevante de crise não convulsiva, coma/alteração inexplicada ou necessidade de acompanhar terapia que depende do EEG. A duração deve seguir probabilidade pré-teste, achados iniciais, sedação e evolução: em geral são necessárias pelo menos 24 h para rastreio adequado, e pacientes com coma, descargas periódicas ou forte suspeita podem precisar 48 h ou mais — não impor ...',
  '        "EEG contínuo: iniciar o mais cedo possível quando houver suspeita de crise não convulsiva/status, alteração de consciência sem explicação suficiente, TCE grave com alto risco eletrográfico ou quando a terapia depende do EEG (por exemplo, barbitúrico). Como regra prática, pelo menos 24 h costuma ser necessário para rastreio; em TCE com coma, hemorragia intracraniana, descargas periódicas, sedação importante ou forte suspeita, 24–48 h ou mais pode ser necessário. Interromper ou prolongar conforme achados, evolução e redução dos sedativos — não usar duração fixa universal.",',
  'continuous EEG'
);

const i18nFile = path.join(root, 'lib/i18n/modules/tce.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
const anchor = '\n};\n';
if (!i18n.endsWith(anchor)) throw new Error('Unexpected tce i18n ending');
const entries = [
  ['Oxigenação: manter SpO₂ ≥ 94% e, quando houver gasometria, usar PaO₂ 80–100 mmHg como alvo inicial. Evitar qualquer episódio de hipóxia.', 'Oxigenación: mantener SpO₂ ≥ 94% y, cuando haya gasometría, usar PaO₂ 80–100 mmHg como objetivo inicial. Evitar cualquier episodio de hipoxia.'],
  ['Profilaxia de crise pós-traumática PRECOCE: considerar fármaco antisseizure nos pacientes com TCE em que o risco de crise precoce justifique a exposição ao medicamento. A BTF sustenta fenitoína para reduzir crises nos primeiros 7 dias quando o benefício superar os riscos; não há evidência suficiente para afirmar superioridade do levetiracetam sobre fenitoína. Não manter profilaxia além de 7 dias apenas para prevenir crise tardia, salvo se houver crise, status epiléptico ou outra indicação neurológica específica.', 'Profilaxis de crisis postraumática PRECOZ: considerar un fármaco antiepiléptico en pacientes con TCE cuyo riesgo de crisis precoz justifique la exposición al medicamento. La BTF respalda fenitoína para reducir crisis durante los primeros 7 días cuando el beneficio supere los riesgos; no hay evidencia suficiente para afirmar superioridad de levetiracetam sobre fenitoína. No mantener profilaxis más allá de 7 días solo para prevenir crisis tardías, salvo que exista crisis, estatus epiléptico u otra indicación neurológica específica.'],
  ['EEG contínuo: iniciar o mais cedo possível quando houver suspeita de crise não convulsiva/status, alteração de consciência sem explicação suficiente, TCE grave com alto risco eletrográfico ou quando a terapia depende do EEG (por exemplo, barbitúrico). Como regra prática, pelo menos 24 h costuma ser necessário para rastreio; em TCE com coma, hemorragia intracraniana, descargas periódicas, sedação importante ou forte suspeita, 24–48 h ou mais pode ser necessário. Interromper ou prolongar conforme achados, evolução e redução dos sedativos — não usar duração fixa universal.', 'EEG continuo: iniciarlo lo antes posible cuando exista sospecha de crisis no convulsiva/estatus, alteración de conciencia sin explicación suficiente, TCE grave con alto riesgo electrográfico o cuando la terapia dependa del EEG (por ejemplo, barbitúrico). Como regla práctica, suelen ser necesarias al menos 24 h para el cribado; en TCE con coma, hemorragia intracraneal, descargas periódicas, sedación importante o sospecha alta, pueden ser necesarias 24–48 h o más. Interrumpir o prolongar según hallazgos, evolución y reducción de sedantes; no usar una duración fija universal.']
];
for (const [pt, es] of entries) {
  if (!i18n.includes(JSON.stringify(pt))) {
    i18n = i18n.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
  }
}
fs.writeFileSync(i18nFile, i18n);
console.log('✅ TCE: oxigenação, profilaxia de crise precoce e EEG contínuo atualizados.');
