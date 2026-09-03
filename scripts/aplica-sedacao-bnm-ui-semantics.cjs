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

const ui = 'components/protocol-screen/sedation-calculator-screen.tsx';

replaceOnce(ui, 'bnm-golden-rule',
'  "⚠️ REGRA DE OURO — antes de qualquer BNM: sedação PROFUNDA confirmada (RASS −5) e analgesia plena, mesmo sem causa aparente de dor. O paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar.",',
'  "⚠️ REGRA DE OURO — antes de qualquer BNM: garantir hipnose/sedação e analgesia adequadas ao contexto clínico. Em UTI, documentar a meta de sedação e avaliar a profundidade quando possível; não transformar RASS −5 em pré-requisito universal. O paciente paralisado e mal sedado pode permanecer consciente, com dor e sem conseguir avisar.",');

replaceOnce(ui, 'bnm-ards-indications',
'  "Indicações em UTI, e são poucas: SDRA grave nas primeiras 48 h com PaO₂/FiO₂ abaixo de 150 e assincronia ou drive intenso refratários à sedação; hipertensão intracraniana refratária; estado de mal refratário (só com EEG, porque o BNM mascara a crise); hipertermia maligna e síndrome neuroléptica maligna; e procedimentos específicos, como a intubação.",',
'  "Na SDRA, a SCCM 2026 sugere BNM quando PaO₂/FiO₂ < 150 e persiste hipoxemia e/ou não se atingem metas de ventilação mecânica apesar de analgesia/sedação adequadas; não usar bloqueio contínuo apenas pelo diagnóstico de SDRA. Outras indicações de BNM dependem do contexto, como procedimentos específicos, hipertensão intracraniana selecionada ou estado de mal refratário com monitorização eletroencefalográfica, porque a paralisia mascara atividade motora.",');

replaceOnce(ui, 'bnm-stop-rule',
'  "Plano de retirada desde o início: reavaliar diariamente. Na SDRA, suspender quando a PaO₂/FiO₂ estiver estável acima de 150.",',
'  "Plano de retirada desde o início: reavaliar diariamente se a indicação persiste e interromper quando o objetivo fisiológico puder ser mantido sem bloqueio. Não usar PaO₂/FiO₂ > 150 como gatilho universal de suspensão.",');

replaceOnce(ui, 'opioid-intermittent',
'  "Opioide preferencialmente INTERMITENTE, não em infusão contínua — menor dose diária e menos eventos adversos. Usar analgesia multimodal e adjuvantes não opioides para poupar opioide.",',
'  "Opioide deve ser titulado à necessidade e integrado à analgesia multimodal. Doses intermitentes podem reduzir exposição quando a dor é episódica; infusão contínua pode ser apropriada quando a dor é persistente ou recorrente. Evitar transformar uma via de administração em regra universal.",');

replaceOnce(ui, 'antipsychotic-delirium',
'  "Antipsicótico no delirium é só para AGITAÇÃO PERIGOSA, com risco de lesão ao paciente ou à equipe — não para tratar o delirium em si. Quetiapina 12,5–25 mg 2×/dia, olanzapina 2,5–5 mg 2×/dia, risperidona 0,5–1 mg 2×/dia ou haloperidol 0,25–0,5 mg.",',
'  "Antipsicótico não é tratamento rotineiro do delirium. O PADIS 2025 não estabelece recomendação a favor ou contra seu uso para tratar delirium; considerar uso individualizado e de curta duração apenas quando agitação perigosa ou sofrimento importante exigirem controle sintomático, após corrigir causas reversíveis e revisar risco de QT, efeitos extrapiramidais e interações.",');

replaceOnce(ui, 'haloperidol-fixed-regimen',
'  "Emergência com agitação perigosa: haloperidol 2,5–5 mg IV, repetível a cada 20 min, máximo 20 mg em 24 h — em ambiente monitorado, por risco de torsades de pointes.",',
'  "Agitação perigosa exige contenção clínica imediata e ambiente monitorado. Se um antipsicótico for escolhido, individualizar fármaco, dose e repetição conforme idade, fragilidade, comorbidades, QT e resposta; não aplicar um esquema IV fixo universal como tratamento do delirium.",');

replaceOnce(ui, 'magnesium-fixed-reduction',
'              <Text style={s.alertTxt}>{tr("⚠️ MgSO₄ potencializa o rocurônio — reduzir a dose em 30–50% e monitorar com TOF.")}</Text>',
'              <Text style={s.alertTxt}>{tr("⚠️ MgSO₄ pode potencializar e prolongar o bloqueio por rocurônio. Não aplicar redução percentual fixa universal: titular doses subsequentes à resposta clínica e neuromuscular e usar monitorização quantitativa/TOF quando disponível.")}</Text>');

const translations = [
  [
    '⚠️ REGRA DE OURO — antes de qualquer BNM: garantir hipnose/sedação e analgesia adequadas ao contexto clínico. Em UTI, documentar a meta de sedação e avaliar a profundidade quando possível; não transformar RASS −5 em pré-requisito universal. O paciente paralisado e mal sedado pode permanecer consciente, com dor e sem conseguir avisar.',
    '⚠️ REGLA DE ORO — antes de cualquier BNM: garantizar hipnosis/sedación y analgesia adecuadas al contexto clínico. En UCI, documentar la meta de sedación y evaluar la profundidad cuando sea posible; no convertir RASS −5 en un requisito universal. El paciente paralizado y mal sedado puede permanecer consciente, con dolor y sin poder avisar.'
  ],
  [
    'Na SDRA, a SCCM 2026 sugere BNM quando PaO₂/FiO₂ < 150 e persiste hipoxemia e/ou não se atingem metas de ventilação mecânica apesar de analgesia/sedação adequadas; não usar bloqueio contínuo apenas pelo diagnóstico de SDRA. Outras indicações de BNM dependem do contexto, como procedimentos específicos, hipertensão intracraniana selecionada ou estado de mal refratário com monitorização eletroencefalográfica, porque a paralisia mascara atividade motora.',
    'En el SDRA, la SCCM 2026 sugiere BNM cuando PaO₂/FiO₂ < 150 y persiste hipoxemia y/o no se alcanzan las metas de ventilación mecánica pese a analgesia/sedación adecuadas; no usar bloqueo continuo solo por el diagnóstico de SDRA. Otras indicaciones de BNM dependen del contexto, como procedimientos específicos, hipertensión intracraneal seleccionada o estado epiléptico refractario con monitorización electroencefalográfica, porque la parálisis enmascara la actividad motora.'
  ],
  [
    'Plano de retirada desde o início: reavaliar diariamente se a indicação persiste e interromper quando o objetivo fisiológico puder ser mantido sem bloqueio. Não usar PaO₂/FiO₂ > 150 como gatilho universal de suspensão.',
    'Plan de retirada desde el inicio: reevaluar a diario si la indicación persiste e interrumpir cuando el objetivo fisiológico pueda mantenerse sin bloqueo. No usar PaO₂/FiO₂ > 150 como disparador universal de suspensión.'
  ],
  [
    'Opioide deve ser titulado à necessidade e integrado à analgesia multimodal. Doses intermitentes podem reduzir exposição quando a dor é episódica; infusão contínua pode ser apropriada quando a dor é persistente ou recorrente. Evitar transformar uma via de administração em regra universal.',
    'El opioide debe titularse según la necesidad e integrarse a la analgesia multimodal. Las dosis intermitentes pueden reducir la exposición cuando el dolor es episódico; la infusión continua puede ser apropiada cuando el dolor es persistente o recurrente. Evitar convertir una vía de administración en una regla universal.'
  ],
  [
    'Antipsicótico não é tratamento rotineiro do delirium. O PADIS 2025 não estabelece recomendação a favor ou contra seu uso para tratar delirium; considerar uso individualizado e de curta duração apenas quando agitação perigosa ou sofrimento importante exigirem controle sintomático, após corrigir causas reversíveis e revisar risco de QT, efeitos extrapiramidais e interações.',
    'El antipsicótico no es tratamiento rutinario del delirium. PADIS 2025 no establece una recomendación a favor ni en contra de su uso para tratar delirium; considerar un uso individualizado y de corta duración solo cuando la agitación peligrosa o un sufrimiento importante exijan control sintomático, tras corregir causas reversibles y revisar riesgo de QT, efectos extrapiramidales e interacciones.'
  ],
  [
    'Agitação perigosa exige contenção clínica imediata e ambiente monitorado. Se um antipsicótico for escolhido, individualizar fármaco, dose e repetição conforme idade, fragilidade, comorbidades, QT e resposta; não aplicar um esquema IV fixo universal como tratamento do delirium.',
    'La agitación peligrosa exige contención clínica inmediata y un entorno monitorizado. Si se elige un antipsicótico, individualizar fármaco, dosis y repetición según edad, fragilidad, comorbilidades, QT y respuesta; no aplicar un esquema IV fijo universal como tratamiento del delirium.'
  ],
  [
    '⚠️ MgSO₄ pode potencializar e prolongar o bloqueio por rocurônio. Não aplicar redução percentual fixa universal: titular doses subsequentes à resposta clínica e neuromuscular e usar monitorização quantitativa/TOF quando disponível.',
    '⚠️ MgSO₄ puede potenciar y prolongar el bloqueo por rocuronio. No aplicar una reducción porcentual fija universal: titular las dosis posteriores según la respuesta clínica y neuromuscular y usar monitorización cuantitativa/TOF cuando esté disponible.'
  ],
];

const i18nFile = path.join(root, 'lib/i18n/modules/sedacao.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
for (const [pt, es] of translations) {
  if (i18n.includes(JSON.stringify(pt) + ':')) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx === -1) throw new Error('Fechamento ES_SEDACAO não encontrado.');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}: ${JSON.stringify(es)},` + i18n.slice(idx);
}
fs.writeFileSync(i18nFile, i18n);

console.log('✅ Sedoanalgesia UI: BNM alinhado à SCCM 2026; retiradas regras universais de RASS −5, P/F de suspensão, redutor fixo de MgSO₄, opioide intermitente e esquema fixo de antipsicótico.');
