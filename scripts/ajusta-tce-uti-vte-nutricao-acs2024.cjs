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
  '        "Profilaxia de TEV: usar compressão pneumática quando não houver contraindicação. Em TCE não operado com imagem de controle estável e baixo risco de progressão hemorrágica, considerar LMWH precocemente (frequentemente dentro de 24–48 h após demonstrar estabilidade); em hemorragia de maior risco, progressão, craniotomia/craniectomia, EVD ou outra intervenção intracraniana, individualizar o início em conjunto com trauma/neurocirurgia — não usar 24–48 h como relógio automático.",',
  '        "Profilaxia de TEV: iniciar compressão pneumática desde a admissão quando não houver contraindicação. Para TCE não operado de BAIXO risco, iniciar profilaxia farmacológica em até 24 h se a TC de controle não mostrar progressão; em TCE não operado de risco MODERADO/ALTO, iniciar em 24–48 h se a TC de controle estiver estável. Após craniotomia/craniectomia, considerar iniciar ou retomar em 24–48 h se a hemorragia estiver estável na TC pós-operatória. Preferir heparina de baixo peso molecular à heparina não fracionada quando não houver contraindicação; individualizar diante de progressão hemorrágica, coagulopatia ou outra razão clínica para adiar.",',
  'VTE prophylaxis'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Nutrição enteral precoce; profilaxia de úlcera de estresse; controle rigoroso de febre.",',
  '        "Nutrição: iniciar via enteral assim que clinicamente viável e avançar para atingir pelo menos reposição calórica basal até o 5º–7º dia pós-trauma. Profilaxia de sangramento gastrointestinal não deve ser automática apenas pelo diagnóstico de TCE: usar conforme fatores de risco de UTI e retirar quando a indicação desaparecer. Tratar febre e manter normotermia.",',
  'nutrition and stress ulcer prophylaxis'
);

const i18nFile = path.join(root, 'lib/i18n/modules/tce.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
const anchor = '\n};\n';
if (!i18n.endsWith(anchor)) throw new Error('Unexpected tce i18n ending');
const entries = [
  ['Profilaxia de TEV: iniciar compressão pneumática desde a admissão quando não houver contraindicação. Para TCE não operado de BAIXO risco, iniciar profilaxia farmacológica em até 24 h se a TC de controle não mostrar progressão; em TCE não operado de risco MODERADO/ALTO, iniciar em 24–48 h se a TC de controle estiver estável. Após craniotomia/craniectomia, considerar iniciar ou retomar em 24–48 h se a hemorragia estiver estável na TC pós-operatória. Preferir heparina de baixo peso molecular à heparina não fracionada quando não houver contraindicação; individualizar diante de progressão hemorrágica, coagulopatia ou outra razão clínica para adiar.', 'Profilaxis de TEV: iniciar compresión neumática desde el ingreso cuando no haya contraindicación. Para TCE no operado de BAJO riesgo, iniciar profilaxis farmacológica dentro de 24 h si la TC de control no muestra progresión; en TCE no operado de riesgo MODERADO/ALTO, iniciar en 24–48 h si la TC de control está estable. Tras craneotomía/craniectomía, considerar iniciar o reanudar en 24–48 h si la hemorragia está estable en la TC posoperatoria. Preferir heparina de bajo peso molecular a heparina no fraccionada cuando no haya contraindicación; individualizar ante progresión hemorrágica, coagulopatía u otra razón clínica para retrasar.'],
  ['Nutrição: iniciar via enteral assim que clinicamente viável e avançar para atingir pelo menos reposição calórica basal até o 5º–7º dia pós-trauma. Profilaxia de sangramento gastrointestinal não deve ser automática apenas pelo diagnóstico de TCE: usar conforme fatores de risco de UTI e retirar quando a indicação desaparecer. Tratar febre e manter normotermia.', 'Nutrición: iniciar vía enteral tan pronto como sea clínicamente viable y avanzar para alcanzar al menos el reemplazo calórico basal entre el 5.º y el 7.º día postrauma. La profilaxis de sangrado gastrointestinal no debe ser automática solo por el diagnóstico de TCE: usarla según factores de riesgo de UCI y retirarla cuando desaparezca la indicación. Tratar la fiebre y mantener normotermia.']
];
for (const [pt, es] of entries) {
  if (!i18n.includes(JSON.stringify(pt))) {
    i18n = i18n.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
  }
}
fs.writeFileSync(i18nFile, i18n);
console.log('✅ TCE UTI: profilaxia de TEV e nutrição alinhadas com ACS/BTF, sem relógio ou profilaxia GI universal.');
