#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceOnce(rel, label, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes(after)) return;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

replaceOnce('rsi-decision-tree.ts', 'DAS-2025',
  '"Fonte deste módulo: The Walls Manual of Emergency Airway Management, 6ª ed., 2023 (7 P\\u2019s, LEMON/MOANS, máximo de 2 tentativas por operador) · plano de falha conforme DAS 2015 (planos A/B/C, CICO, cricotireoidostomia com bisturi).",',
  '"Fonte deste módulo: The Walls Manual of Emergency Airway Management, 6ª ed., 2023 (7 P\\u2019s, LEMON/MOANS) · Difficult Airway Society 2025: algoritmo linear A/B/C/D, oxigenação contínua durante o manejo, maximizar sucesso na primeira tentativa e confirmar ventilação com capnografia waveform.",');

replaceOnce('rsi-decision-tree.ts', 'preox-summary',
  'summary: "Maximizar a reserva de O₂ para tolerar apneia segura. Alvo SpO₂ ≥ 95% (idealmente ≥ 98%) antes de induzir.",',
  'summary: "Maximizar a reserva de O₂ e manter oxigenação durante toda a sequência. Escolher a interface conforme gravidade, fisiologia e dificuldade prevista — não encurtar a pré-oxigenação do paciente crítico a um tempo fixo.",');

replaceOnce('rsi-decision-tree.ts', 'preox-actions',
`      actions: [
        "Padrão: máscara não-reinalante (MNR) com reservatório, O₂ 15 L/min × 3–5 min (adulto saudável). Obeso/gestante/crítico: 30–90 s.",
        "Oxigenação apneica (mantida DURANTE a laringoscopia): cânula nasal 15 L/min ou alto fluxo nasal (HFN) 60 L/min — THRIVE prolonga a apneia segura.",
        "SpO₂ não sobe ou não tolera MNR: VNI (CPAP/BiPAP) PEEP 5–10 cmH₂O × 3 min para recrutamento alveolar.",
        "BVM com máscara apenas se as demais opções forem insuficientes (risco de insuflação gástrica).",
        "Posição: sniffing/ramped — alinhar meato auditivo aos ombros; cabeceira elevada 20–30°.",
      ],`,
`      actions: [
        "Pré-oxigenar com FiO₂ 1,0 e cabeceira elevada, usando a interface que entregue melhor oxigenação e vedação para aquele paciente. No crítico, obeso ou gestante, não substituir otimização por um atalho fixo de 30–90 s: induzir após obter a melhor reserva possível sem atrasar uma via aérea que esteja se deteriorando.",
        "Hipoxemia grave (PaO₂/FiO₂ < 150): preferir pré-oxigenação com ventilação não invasiva quando factível. Diretrizes SCCM sugerem VNI nesse grupo; a ATS 2026 recomenda HFNC ou VNI para reduzir hipoxemia peri-intubação.",
        "Se laringoscopia difícil é esperada ou a interface escolhida for HFNC, manter alto fluxo durante a tentativa quando possível; o DAS 2025 prioriza oxigenação contínua ao longo do manejo.",
        "Agitação/delirium impedindo máscara, VNI ou HFNC: considerar pré-oxigenação assistida por medicação, com monitorização e plano de via aérea já preparado.",
        "Entre indução e laringoscopia, ventilação suave com BVM pode ser usada para prevenir hipoxemia no crítico: vedação a duas mãos quando necessário, PEEP e o menor volume que produza elevação torácica. Individualizar ou evitar se o risco de regurgitação/aspiração for excepcionalmente alto.",
        "Posição: cabeceira elevada/semi-Fowler; no obeso, ramped com alinhamento do meato auditivo externo ao esterno/ombro para otimizar pré-oxigenação e laringoscopia.",
      ],`);

const translations = [
  ['Fonte deste módulo: The Walls Manual of Emergency Airway Management, 6ª ed., 2023 (7 P’s, LEMON/MOANS) · Difficult Airway Society 2025: algoritmo linear A/B/C/D, oxigenação contínua durante o manejo, maximizar sucesso na primeira tentativa e confirmar ventilação com capnografia waveform.', 'Fuente de este módulo: The Walls Manual of Emergency Airway Management, 6.ª ed., 2023 (7 P, LEMON/MOANS) · Difficult Airway Society 2025: algoritmo lineal A/B/C/D, oxigenación continua durante el manejo, maximizar el éxito en el primer intento y confirmar la ventilación con capnografía de onda.'],
  ['Maximizar a reserva de O₂ e manter oxigenação durante toda a sequência. Escolher a interface conforme gravidade, fisiologia e dificuldade prevista — não encurtar a pré-oxigenação do paciente crítico a um tempo fixo.', 'Maximizar la reserva de O₂ y mantener la oxigenación durante toda la secuencia. Elegir la interfaz según gravedad, fisiología y dificultad prevista — no acortar la preoxigenación del paciente crítico a un tiempo fijo.'],
  ['Pré-oxigenar com FiO₂ 1,0 e cabeceira elevada, usando a interface que entregue melhor oxigenação e vedação para aquele paciente. No crítico, obeso ou gestante, não substituir otimização por um atalho fixo de 30–90 s: induzir após obter a melhor reserva possível sem atrasar uma via aérea que esteja se deteriorando.', 'Preoxigenar con FiO₂ 1,0 y cabecera elevada, usando la interfaz que proporcione mejor oxigenación y sellado para ese paciente. En el paciente crítico, obeso o gestante, no sustituir la optimización por un atajo fijo de 30–90 s: inducir tras obtener la mejor reserva posible sin retrasar una vía aérea que se esté deteriorando.'],
  ['Hipoxemia grave (PaO₂/FiO₂ < 150): preferir pré-oxigenação com ventilação não invasiva quando factível. Diretrizes SCCM sugerem VNI nesse grupo; a ATS 2026 recomenda HFNC ou VNI para reduzir hipoxemia peri-intubação.', 'Hipoxemia grave (PaO₂/FiO₂ < 150): preferir preoxigenación con ventilación no invasiva cuando sea factible. Las guías SCCM sugieren VNI en este grupo; ATS 2026 recomienda HFNC o VNI para reducir la hipoxemia periintubación.'],
  ['Se laringoscopia difícil é esperada ou a interface escolhida for HFNC, manter alto fluxo durante a tentativa quando possível; o DAS 2025 prioriza oxigenação contínua ao longo do manejo.', 'Si se espera laringoscopia difícil o la interfaz elegida es HFNC, mantener alto flujo durante el intento cuando sea posible; DAS 2025 prioriza la oxigenación continua durante el manejo.'],
  ['Agitação/delirium impedindo máscara, VNI ou HFNC: considerar pré-oxigenação assistida por medicação, com monitorização e plano de via aérea já preparado.', 'Agitación/delirium que impide mascarilla, VNI o HFNC: considerar preoxigenación asistida por medicación, con monitorización y plan de vía aérea ya preparado.'],
  ['Entre indução e laringoscopia, ventilação suave com BVM pode ser usada para prevenir hipoxemia no crítico: vedação a duas mãos quando necessário, PEEP e o menor volume que produza elevação torácica. Individualizar ou evitar se o risco de regurgitação/aspiração for excepcionalmente alto.', 'Entre la inducción y la laringoscopia, la ventilación suave con bolsa-válvula-mascarilla puede usarse para prevenir hipoxemia en el paciente crítico: sellado a dos manos cuando sea necesario, PEEP y el menor volumen que produzca elevación torácica. Individualizar o evitar si el riesgo de regurgitación/aspiración es excepcionalmente alto.'],
  ['Posição: cabeceira elevada/semi-Fowler; no obeso, ramped com alinhamento do meato auditivo externo ao esterno/ombro para otimizar pré-oxigenação e laringoscopia.', 'Posición: cabecera elevada/semi-Fowler; en obesidad, posición en rampa alineando el meato auditivo externo con esternón/hombro para optimizar preoxigenación y laringoscopia.'],
];

const file = path.join(root, 'lib/i18n/modules/isr.ts');
let src = fs.readFileSync(file, 'utf8');
for (const [pt, es] of translations) {
  const key = JSON.stringify(pt);
  if (!src.includes(key + ':')) {
    const anchor = 'export const ES_ISR: Record<string, string> = {';
    if (!src.includes(anchor)) throw new Error('i18n ISR anchor ausente');
    src = src.replace(anchor, `${anchor}\n  ${key}: ${JSON.stringify(es)},`);
  }
}
fs.writeFileSync(file, src);
console.log('✅ ISR: pré-oxigenação atualizada para SCCM/ATS/DAS, removendo 30–90 s fixos e veto rotineiro à BVM.');
