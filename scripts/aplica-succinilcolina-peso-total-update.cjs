#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceOnce(rel, label, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

replaceOnce('lib/doses-isr.ts','numeric-source',
'  succinilcolina: { min: 1, max: 1.5, obeso: 2 },',
'  succinilcolina: { min: 1, max: 1.5 },');
replaceOnce('lib/doses-isr.ts','remove-unsupported-cap',
'/** Teto absoluto da succinilcolina, em mg. */\nexport const SUCCINILCOLINA_TETO_MG = 200;\n\n',
'');
replaceOnce('lib/doses-isr.ts','canonical-text',
'  succinilcolina: `${MG_POR_KG.succinilcolina.min.toString().replace(".", ",")}–${mgPorKg(MG_POR_KG.succinilcolina.max)} (${mgPorKg(MG_POR_KG.succinilcolina.obeso)} em obeso; máx ${SUCCINILCOLINA_TETO_MG} mg)`,',
'  succinilcolina: `${MG_POR_KG.succinilcolina.min.toString().replace(".", ",")}–${mgPorKg(MG_POR_KG.succinilcolina.max)}; em obesidade, calcular pelo peso corporal total/real`,');

replaceOnce('rsi-decision-tree.ts','remove-cap-import',
'  MG_POR_KG,\n  SUCCINILCOLINA_TETO_MG,\n  mgPorKg,',
'  MG_POR_KG,\n  mgPorKg,');
replaceOnce('rsi-decision-tree.ts','derive-low-no-cap',
'    out.succLow = round1(Math.min(MG_POR_KG.succinilcolina.min * peso, SUCCINILCOLINA_TETO_MG));',
'    out.succLow = round1(MG_POR_KG.succinilcolina.min * peso);');
replaceOnce('rsi-decision-tree.ts','derive-high-no-cap',
'    out.succHigh = round1(Math.min(MG_POR_KG.succinilcolina.max * peso, SUCCINILCOLINA_TETO_MG));',
'    out.succHigh = round1(MG_POR_KG.succinilcolina.max * peso);');

replaceOnce('sedation-engine.ts','sedation-bolus-note',
'          "ISR: 1–1,5 mg/kg IV em bólus ultrarrápido (2 mg/kg em obeso). TETO 200 mg.",',
'          "ISR: 1–1,5 mg/kg IV em bólus ultrarrápido. Em obesidade, calcular pelo peso corporal total/real; não aumentar automaticamente para 2 mg/kg apenas por obesidade. Não aplicar teto IV absoluto de 200 mg: a bula brasileira não traz esse teto para via IV.",');
replaceOnce('sedation-engine.ts','presentation-source',
'        fonte: "Cloreto de suxametônio 100 mg, pó para solução injetável, frasco-ampola (Succinil Colin — União Química, registro ANVISA 1.0497.0206.003-6). É PÓ: a concentração depende do volume de reconstituição; este app assume 10 mL → 10 mg/mL." },',
'        fonte: "Cloreto de suxametônio, pó para solução injetável (Succinil Colin — União Química, registro ANVISA 1.0497.0206). A bula brasileira lista frascos de 100 mg e 500 mg. Este cálculo usa o frasco de 100 mg reconstituído em 10 mL → 10 mg/mL; a apresentação de 500 mg não deve ser tratada como equivalente sem conferir a reconstituição, pois em 10 mL resulta 50 mg/mL." },');

const ptOld = 'ISR: 1–1,5 mg/kg IV em bólus ultrarrápido (2 mg/kg em obeso). TETO 200 mg.';
const ptNew = 'ISR: 1–1,5 mg/kg IV em bólus ultrarrápido. Em obesidade, calcular pelo peso corporal total/real; não aumentar automaticamente para 2 mg/kg apenas por obesidade. Não aplicar teto IV absoluto de 200 mg: a bula brasileira não traz esse teto para via IV.';
const esNew = 'ISR: 1–1,5 mg/kg IV en bolo ultrarrápido. En obesidad, calcular según el peso corporal total/real; no aumentar automáticamente a 2 mg/kg solo por obesidad. No aplicar un techo IV absoluto de 200 mg: el prospecto brasileño no establece ese techo para la vía IV.';
const i18nFile = path.join(root, 'lib/i18n/modules/sedacao.ts');
let es = fs.readFileSync(i18nFile, 'utf8');
const oldKeyIdx = es.indexOf(JSON.stringify(ptOld) + ':');
if (oldKeyIdx !== -1) {
  const lineEnd = es.indexOf('\n', oldKeyIdx);
  es = es.slice(0, oldKeyIdx) + `  ${JSON.stringify(ptNew)}: ${JSON.stringify(esNew)},` + es.slice(lineEnd);
} else if (!es.includes(JSON.stringify(ptNew))) {
  const marker = '\n};';
  const idx = es.lastIndexOf(marker);
  if (idx === -1) throw new Error('Fechamento ES_SEDACAO não encontrado.');
  es = es.slice(0, idx) + `\n  // ── Succinilcolina · obesidade/peso total ───────────────────────────────\n  ${JSON.stringify(ptNew)}: ${JSON.stringify(esNew)},\n` + es.slice(idx);
}
fs.writeFileSync(i18nFile, es);

console.log('✅ Succinilcolina: fonte canônica e derive ISR corrigidos para 1–1,5 mg/kg por peso corporal total na obesidade; removidos 2 mg/kg automático e teto IV de 200 mg.');
