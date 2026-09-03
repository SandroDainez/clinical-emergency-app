#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

// Completa remoções que o helper idempotente principal não consegue representar
// com `after=""` sem ambiguidade.
{
  const file = path.join(root, 'rsi-decision-tree.ts');
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace('    out.lido = round1(MG_POR_KG.lidocaina * peso);\n', '');
  src = src.replace('    out.lido = mgPorKg(MG_POR_KG.lidocaina);\n', '');
  fs.writeFileSync(file, src);
}

const regraPt = "No instável, INDIVIDUALIZAR o indutor e MANTER o bloqueador em dose adequada. Neste módulo, cetamina 1 mg/kg é a referência no instável e 0,5 mg/kg no choque grave; esses valores orientam o cálculo, mas não transformam índice de choque ou outro marcador isolado em gatilho automático de redução. Etomidato 0,3 mg/kg permanece a dose de referência do cálculo, sem tornar dose plena ou redução uma regra universal. Reduzir o bloqueador junto pode piorar as condições de laringoscopia e aumentar tentativas.";
const regraEs = "En el paciente inestable, INDIVIDUALIZAR el inductor y MANTENER el bloqueante en una dosis adecuada. En este módulo, ketamina 1 mg/kg es la referencia en el paciente inestable y 0,5 mg/kg en el choque grave; estos valores orientan el cálculo, pero no convierten el índice de choque ni otro marcador aislado en un disparador automático de reducción. Etomidato 0,3 mg/kg sigue siendo la dosis de referencia del cálculo, sin convertir la dosis plena ni la reducción en una regla universal. Reducir también el bloqueante puede empeorar las condiciones de laringoscopia y aumentar los intentos.";

{
  const file = path.join(root, 'lib/doses-isr.ts');
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace('  fentanilMcg: 2,\n  lidocaina: 1.5,', '  fentanilMcg: 2,');

  const before = `export const ISR_AJUSTE_NO_INSTAVEL =\n  "No instável, INDIVIDUALIZAR o indutor e MANTER o bloqueador em dose adequada. Cetamina pode exigir dose menor quando a reserva hemodinâmica é muito baixa; etomidato 0,3 mg/kg permanece a dose de referência do cálculo, sem transformar dose plena ou redução em regra universal. Reduzir o bloqueador junto pode piorar as condições de laringoscopia e aumentar tentativas.";`;
  const after = `export const ISR_AJUSTE_NO_INSTAVEL =\n  ${JSON.stringify(regraPt)};`;
  if (!src.includes(after)) {
    const count = src.split(before).length - 1;
    if (count !== 1) throw new Error(`regra intermediária do instável: esperado 1 alvo, encontrados ${count}`);
    src = src.replace(before, after);
  }
  fs.writeFileSync(file, src);
}

{
  const file = path.join(root, 'scripts/valida-isr.cjs');
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace('    ["lido", 1.5, "lidocaína — pré-tratamento"],\n', '');
  fs.writeFileSync(file, src);
}

{
  const file = path.join(root, 'lib/i18n/modules/isr.ts');
  let src = fs.readFileSync(file, 'utf8');
  const key = JSON.stringify(regraPt);
  if (!src.includes(`${key}:`)) {
    const anchor = '\n};\n';
    const pos = src.lastIndexOf(anchor);
    if (pos < 0) throw new Error('isr.ts: fechamento do dicionário não encontrado');
    src = src.slice(0, pos) + `  ${key}: ${JSON.stringify(regraEs)},\n` + src.slice(pos);
  }
  fs.writeFileSync(file, src);
}

console.log('✅ ISR: referências de cetamina preservadas, lidocaína removida e regra do instável traduzida integralmente.');
