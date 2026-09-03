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
  '        "⚠️ ANTES de escalar terapia: checar as causas EXTRACRANIANAS de PIC alta — febre, assincronia ventilatória, crise convulsiva, hipotensão, pneumotórax, compressão cervical (colar ou fixação do tubo apertados), hipertensão intra-abdominal, dor e bexigoma. Corrigir isso resolve muita PIC sem osmoterapia.",',
  '        "⚠️ Em paralelo à terapia urgente, checar causas EXTRACRANIANAS de PIC alta — febre, assincronia ventilatória, crise convulsiva, hipotensão, pneumotórax, compressão cervical (colar ou fixação do tubo apertados), hipertensão intra-abdominal, dor e bexigoma. Corrigir causas reversíveis pode reduzir a PIC, mas na herniação clínica essa checagem NÃO deve atrasar osmoterapia, drenagem de LCR quando disponível nem acionamento neurocirúrgico.",',
  'parallel reversible causes'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Terapia hiperosmolar — no TCE com PIC elevada/edema cerebral, a Neurocritical Care Society sugere solução hipertônica sobre manitol como manejo inicial quando não houver contraindicação. Regime do protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min. Concentração e dose variam entre protocolos: titular à resposta clínica/PIC e monitorar sódio, cloro e função renal. NaCl 20% 40 mL IV em 5 min é outro regime institucional; repetir apenas conforme resposta e protocolo neurocrítico, não por intervalo universal fixo.",',
  '        "Terapia hiperosmolar — no TCE com PIC elevada/edema cerebral, a Neurocritical Care Society sugere solução hipertônica sobre manitol como manejo inicial quando não houver contraindicação. Regime do protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min. Concentração e dose variam entre protocolos: titular à resposta clínica/PIC e monitorar sódio, cloro, equilíbrio ácido-base e função renal. Soluções mais concentradas (por exemplo 20–23,4%) existem em protocolos neurocríticos, mas a dose depende da apresentação, acesso vascular e protocolo institucional — não transformar um volume fixo em recomendação universal. Na 155–160 mEq/L e Cl 110–115 mEq/L devem ser entendidos como faixas superiores de segurança descritas pela NCS, não como metas terapêuticas a perseguir.",',
  'hypertonic saline safety'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Com derivação ventricular externa já instalada: drenar 5–10 mL de líquor e observar se a PIC cai abaixo de 22 mmHg.",',
  '        "Com derivação ventricular externa já instalada: usar drenagem de LCR como terapia da PIC conforme altura/configuração do dreno, resposta da PIC e protocolo neurocirúrgico. Não prescrever volume fixo universal. Quando o EVD estiver aberto para drenagem, a leitura de PIC pelo próprio sistema não representa a PIC verdadeira; se for necessária monitorização contínua simultânea, usar estratégia validada pelo serviço, como monitor independente.",',
  'EVD drainage'
);

const hicFile = path.join(root, 'lib/i18n/modules/tce-hic.ts');
let hic = fs.readFileSync(hicFile, 'utf8');
const anchor = '\n};\n';
if (!hic.endsWith(anchor)) throw new Error('Unexpected tce-hic i18n ending');
const hicEntries = [
  ['⚠️ Em paralelo à terapia urgente, checar causas EXTRACRANIANAS de PIC alta — febre, assincronia ventilatória, crise convulsiva, hipotensão, pneumotórax, compressão cervical (colar ou fixação do tubo apertados), hipertensão intra-abdominal, dor e bexigoma. Corrigir causas reversíveis pode reduzir a PIC, mas na herniação clínica essa checagem NÃO deve atrasar osmoterapia, drenagem de LCR quando disponível nem acionamento neurocirúrgico.', '⚠️ En paralelo con la terapia urgente, revisar causas EXTRACRANEALES de PIC elevada — fiebre, asincronía ventilatoria, crisis convulsiva, hipotensión, neumotórax, compresión cervical (collar o fijación del tubo apretados), hipertensión intraabdominal, dolor y globo vesical. Corregir causas reversibles puede reducir la PIC, pero ante herniación clínica esta revisión NO debe retrasar la osmoterapia, el drenaje de LCR cuando esté disponible ni la activación neuroquirúrgica.'],
  ['Terapia hiperosmolar — no TCE com PIC elevada/edema cerebral, a Neurocritical Care Society sugere solução hipertônica sobre manitol como manejo inicial quando não houver contraindicação. Regime do protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min. Concentração e dose variam entre protocolos: titular à resposta clínica/PIC e monitorar sódio, cloro, equilíbrio ácido-base e função renal. Soluções mais concentradas (por exemplo 20–23,4%) existem em protocolos neurocríticos, mas a dose depende da apresentação, acesso vascular e protocolo institucional — não transformar um volume fixo em recomendação universal. Na 155–160 mEq/L e Cl 110–115 mEq/L devem ser entendidos como faixas superiores de segurança descritas pela NCS, não como metas terapêuticas a perseguir.', 'Terapia hiperosmolar — en el TCE con PIC elevada/edema cerebral, la Neurocritical Care Society sugiere solución hipertónica sobre manitol como manejo inicial cuando no haya contraindicación. Régimen del protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) en 10–20 min. La concentración y la dosis varían entre protocolos: titular según la respuesta clínica/PIC y monitorizar sodio, cloro, equilibrio ácido-base y función renal. Existen soluciones más concentradas (por ejemplo 20–23,4%) en protocolos neurocríticos, pero la dosis depende de la presentación, el acceso vascular y el protocolo institucional; no convertir un volumen fijo en recomendación universal. Na 155–160 mEq/L y Cl 110–115 mEq/L deben entenderse como rangos superiores de seguridad descritos por la NCS, no como metas terapéuticas a perseguir.'],
  ['Com derivação ventricular externa já instalada: usar drenagem de LCR como terapia da PIC conforme altura/configuração do dreno, resposta da PIC e protocolo neurocirúrgico. Não prescrever volume fixo universal. Quando o EVD estiver aberto para drenagem, a leitura de PIC pelo próprio sistema não representa a PIC verdadeira; se for necessária monitorização contínua simultânea, usar estratégia validada pelo serviço, como monitor independente.', 'Con derivación ventricular externa ya instalada: usar el drenaje de LCR como terapia de la PIC según la altura/configuración del drenaje, la respuesta de la PIC y el protocolo neuroquirúrgico. No prescribir un volumen fijo universal. Cuando el DVE esté abierto para drenaje, la lectura de PIC del propio sistema no representa la PIC verdadera; si se necesita monitorización continua simultánea, usar una estrategia validada por el servicio, como un monitor independiente.']
];
for (const [pt, es] of hicEntries) {
  if (!hic.includes(JSON.stringify(pt))) hic = hic.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
}
fs.writeFileSync(hicFile, hic);

const runtimeFile = path.join(root, 'lib/i18n/modules/frases-montadas-em-runtime.ts');
let runtime = fs.readFileSync(runtimeFile, 'utf8');
if (!runtime.endsWith(anchor)) throw new Error('Unexpected runtime i18n ending');
const runtimeEntries = [
  ['Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos) · SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como alvo inicial) · PaCO₂ 35–40 mmHg na ausência de HIC · normotermia · glicemia 100–180 mg/dL · Na 135–145 mEq/L como alvo basal; evitar hiponatremia e não induzir hipernatremia profilática.', 'Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 y > 70 años; ≥ 100 para 50–69 años) · SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como objetivo inicial) · PaCO₂ 35–40 mmHg en ausencia de HIC · normotermia · glucemia 100–180 mg/dL · Na 135–145 mEq/L como objetivo basal; evitar hiponatremia y no inducir hipernatremia profiláctica.']
];
for (const [pt, es] of runtimeEntries) {
  if (!runtime.includes(JSON.stringify(pt))) runtime = runtime.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
}
fs.writeFileSync(runtimeFile, runtime);

console.log('✅ TCE HIC: osmoterapia, faixas de segurança, causas reversíveis e drenagem ventricular alinhadas sem criar metas artificiais.');
