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

const before = '        "Laudanosina acumula em IRA/IH (risco de convulsão). Sem antídoto específico. Refrigerar (perde potência em 14 dias a 25 °C).",';
const after = '        "Laudanosina pode acumular em infusões prolongadas, com concentrações maiores em disfunção renal/hepática. Efeito excitatório/convulsões são demonstrados em animais; em humanos, relatos são raros e geralmente têm fatores predisponentes, e a contribuição causal da laudanosina permanece incerta. Titular à necessidade e limitar exposição desnecessária. Sem antídoto específico. Refrigerar (perde potência em 14 dias a 25 °C).",';
replaceOnce('sedation-engine.ts', 'atracurium-laudanosine-human-causality', before, after);

const pt = after.trim().slice(1, -2);
const esText = 'La laudanosina puede acumularse con infusiones prolongadas, con concentraciones mayores en la disfunción renal/hepática. Los efectos excitatorios/convulsiones están demostrados en animales; en humanos, los informes son raros y suelen tener factores predisponentes, y la contribución causal de la laudanosina sigue siendo incierta. Titular según la necesidad y limitar la exposición innecesaria. Sin antídoto específico. Refrigerar (pierde potencia en 14 días a 25 °C).';
const i18nFile = path.join(root, 'lib/i18n/modules/sedacao.ts');
let es = fs.readFileSync(i18nFile, 'utf8');
if (!es.includes(`"${pt}"`)) {
  const marker = '\n};';
  const idx = es.lastIndexOf(marker);
  if (idx === -1) throw new Error('Fechamento ES_SEDACAO não encontrado.');
  es = es.slice(0, idx) + `\n  // ── Atracúrio · laudanosina ─────────────────────────────────────────────\n  ${JSON.stringify(pt)}: ${JSON.stringify(esText)},\n` + es.slice(idx);
  fs.writeFileSync(i18nFile, es);
}
console.log('✅ Atracúrio: risco de laudanosina preservado sem afirmar causalidade humana não demonstrada.');
