#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = path.join(root, 'tce-decision-tree.ts');

function replaceExact(before, after, label) {
  let s = fs.readFileSync(tree, 'utf8');
  if (s.includes(after)) return false;
  const count = s.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrado ${count}`);
  s = s.replace(before, after);
  fs.writeFileSync(tree, s);
  return true;
}

replaceExact(
  '"Terapia hiperosmolar — Salina hipertônica 3%: {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min (preferida se hipotenso/hipovolêmico). Alternativa: NaCl 20% 40 mL IV em 5 min, repetível a cada 4–6 h, mantendo sódio sérico abaixo de 160 mEq/L.",',
  '"Terapia hiperosmolar — no TCE com PIC elevada/edema cerebral, a Neurocritical Care Society sugere solução hipertônica sobre manitol como manejo inicial quando não houver contraindicação. Regime do protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min. Concentração e dose variam entre protocolos: titular à resposta clínica/PIC e monitorar sódio, cloro e função renal. NaCl 20% 40 mL IV em 5 min é outro regime institucional; repetir apenas conforme resposta e protocolo neurocrítico, não por intervalo universal fixo.",',
  'salina hipertônica'
);

replaceExact(
  '"OU Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min, repetível a cada 4–6 h — cuidado: diurese osmótica e hipotensão; manter volemia.",',
  '"Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min permanece alternativa eficaz quando solução hipertônica não é apropriada ou não está disponível. Repetição deve ser guiada pela resposta/PIC e segurança, não por relógio fixo; vigiar volemia, pressão arterial e função renal por diurese osmótica e risco de hipotensão/lesão renal.",',
  'manitol'
);

replaceExact(
  '"Monitorar o GAP OSMOLAR durante o manitol: não há benefício adicional com gap acima de 20. Gap = osmolaridade medida − calculada; calculada = 2 × Na + glicemia/18 + ureia/6, com a UREIA em mg/dL como os laboratórios brasileiros reportam. A forma \\\"ureia/2,8\\\" do protocolo-fonte pressupõe nitrogênio ureico (BUN); aplicá-la à ureia total superestima o cálculo em cerca de 2 vezes.",',
  '"Durante manitol, monitorar função renal, volemia e carga osmótica. A NCS sugere usar o GAP OSMOLAR em vez de um limiar isolado de osmolaridade para acompanhar risco de acúmulo/lesão renal, mas NÃO há evidência suficiente para um cutoff obrigatório; 20 mOsm/kg é usado em alguns protocolos, porém não é um limite validado. Gap = osmolaridade medida − calculada; ao calcular com ureia total em mg/dL, usar a fórmula compatível com o laboratório local e não confundir ureia com BUN.",',
  'gap osmolar'
);

replaceExact(
  '"HIC REFRATÁRIA às medidas acima — 2ª ETAPA: aprofundar sedação e analgesia, terapia hiperosmolar para natremia mais alta, e avaliação de craniectomia descompressiva com o neurocirurgião. ⚠️ Antes de subir de etapa, refazer a checagem das causas extracranianas — a resistência ao tratamento costuma ter causa remediável.",',
  '"HIC REFRATÁRIA às medidas acima — 2ª ETAPA: aprofundar sedação e analgesia, repetir/ajustar terapia hiperosmolar guiada pela PIC e pela resposta clínica e avaliar craniectomia descompressiva com o neurocirurgião. Não perseguir um alvo fixo de natremia apenas para tratar a PIC; evitar hipernatremia/hipercloremia graves e monitorar função renal. ⚠️ Antes de subir de etapa, refazer a checagem das causas extracranianas — a resistência ao tratamento costuma ter causa remediável.",',
  'segunda etapa HIC'
);

console.log('✅ TCE osmoterapia 2026: HTS/manitol, gap osmolar e natremia contextualizados.');
