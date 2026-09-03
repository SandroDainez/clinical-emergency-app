#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'lib/doses-isr.ts');
let src = fs.readFileSync(file, 'utf8');
const before = `export const ISR_AJUSTE_NO_INSTAVEL =\n  "No instável, INDIVIDUALIZAR o indutor e MANTER o bloqueador em dose adequada. Cetamina pode exigir dose menor quando a reserva hemodinâmica é muito baixa; etomidato 0,3 mg/kg permanece a dose de referência do cálculo, sem transformar dose plena ou redução em regra universal. Reduzir o bloqueador junto pode piorar as condições de laringoscopia e aumentar tentativas.";`;
const after = `export const ISR_AJUSTE_NO_INSTAVEL =\n  "No instável, INDIVIDUALIZAR o indutor e MANTER o bloqueador em dose adequada. Neste módulo, cetamina 1 mg/kg é a referência no instável e 0,5 mg/kg no choque grave; esses valores orientam o cálculo, mas não transformam índice de choque ou outro marcador isolado em gatilho automático de redução. Etomidato 0,3 mg/kg permanece a dose de referência do cálculo, sem tornar dose plena ou redução uma regra universal. Reduzir o bloqueador junto pode piorar as condições de laringoscopia e aumentar tentativas.";`;
if (!src.includes(after)) {
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`regra intermediária do instável: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}
console.log('✅ ISR: referências 1 mg/kg e 0,5 mg/kg preservadas sem virar gatilho automático.');
