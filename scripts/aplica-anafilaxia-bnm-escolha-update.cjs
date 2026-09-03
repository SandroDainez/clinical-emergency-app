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
function appendTranslations(rel, entries) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  let block = '';
  for (const [pt, es] of entries) {
    if (!src.includes(JSON.stringify(pt) + ':')) block += `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n`;
  }
  if (!block) return;
  const idx = src.lastIndexOf('\n};');
  if (idx === -1) throw new Error(`${rel}: fechamento do dicionário não encontrado.`);
  src = src.slice(0, idx) + '\n  // ── BNM em anafilaxia · escolha contextual ──────────────────────────────\n' + block + src.slice(idx);
  fs.writeFileSync(file, src);
}

const BLOQUEADOR = 'Na anafilaxia/angioedema com necessidade de ISR, WAO/EAACI não elegem um bloqueador neuromuscular específico. Escolher entre succinilcolina e rocurônio conforme contraindicações, duração esperada do bloqueio, risco de via aérea difícil/CICO e disponibilidade real do plano de reversão/resgate. Succinilcolina é opção quando não há contraindicação; rocurônio 1,2 mg/kg é alternativa válida, lembrando que sua paralisia pode durar 45–70 min. A escolha do BNM nunca deve atrasar a garantia da via aérea.';
const ROC = 'Se rocurônio 1,2 mg/kg for escolhido e a reversão rápida fizer parte do plano de falha/despertar, lembrar que a paralisia pode durar 45–70 min, pré-calcular sugamadex 16 mg/kg e garantir disponibilidade imediata antes da indução. Sugamadex reverte o bloqueio, mas não substitui adrenalina nem o tratamento padrão da anafilaxia e não deve ser apresentado como terapia estabelecida da reação alérgica ao rocurônio.';
const LASTRO = 'Lastro: WAO e EAACI orientam tratamento da anafilaxia e garantia da via aérea, mas NÃO elegem succinilcolina ou rocurônio como bloqueador preferencial. Por isso o app não deve transformar uma preferência local em regra de diretriz: a escolha depende do paciente, da via aérea e dos recursos de resgate disponíveis. Bloqueadores neuromusculares também podem ser desencadeantes de anafilaxia perioperatória e apresentam reatividade cruzada variável.';

replaceOnce('lib/doses-isr.ts','anaphylaxis-nmba-choice',
'export const ANAFILAXIA_BLOQUEADOR =\n  "SUCCINILCOLINA é a escolha padrão na anafilaxia/angioedema de via aérea. O rocurônio 1,2 mg/kg compromete 45–70 min, e o resgate com sugamadex depende de ele estar disponível, dentro do prazo e de alguém ir buscá-lo — três condições que falham sob pressão. Nenhuma das contraindicações reais da succinilcolina (queimado crônico, imobilização prolongada, doença neuromuscular) é típica deste paciente, e a hipercalemia não é preocupação relevante na anafilaxia aguda.";',
`export const ANAFILAXIA_BLOQUEADOR =\n  ${JSON.stringify(BLOQUEADOR)};`);
replaceOnce('lib/doses-isr.ts','anaphylaxis-rocuronium-choice',
'export const ANAFILAXIA_BLOQUEADOR_ROCURONIO =\n  "Rocurônio SOMENTE se houver contraindicação à succinilcolina — e nesse caso o sugamadex 16 mg/kg é MANDATÓRIO à beira do leito, não opcional: sem ele, a paralisia dura 45–70 min num paciente cuja via aérea pode fechar.";',
`export const ANAFILAXIA_BLOQUEADOR_ROCURONIO =\n  ${JSON.stringify(ROC)};`);
replaceOnce('lib/doses-isr.ts','anaphylaxis-evidence-lastro',
'export const ANAFILAXIA_BLOQUEADOR_LASTRO =\n  "Lastro desta escolha: WAO e EAACI NÃO fazem recomendação sobre qual bloqueador usar na anafilaxia — tratam a via aérea de forma geral. Esta é uma decisão de raciocínio clínico do app, não uma citação de diretriz. A posição contrária existe (revisões defendem que, com sugamadex, a succinilcolina não deveria mais ser usada para intubação) e é opinião de revisão, não recomendação de diretriz. Questão em debate legítimo.";',
`export const ANAFILAXIA_BLOQUEADOR_LASTRO =\n  ${JSON.stringify(LASTRO)};`);

const translations = [
  [BLOQUEADOR, 'En la anafilaxia/angioedema con necesidad de ISR, WAO/EAACI no eligen un bloqueador neuromuscular específico. Elegir entre succinilcolina y rocuronio según contraindicaciones, duración esperada del bloqueo, riesgo de vía aérea difícil/CICO y disponibilidad real del plan de reversión/rescate. La succinilcolina es una opción si no hay contraindicaciones; rocuronio 1,2 mg/kg es una alternativa válida, recordando que su parálisis puede durar 45–70 min. La elección del BNM nunca debe retrasar asegurar la vía aérea.'],
  [ROC, 'Si se elige rocuronio 1,2 mg/kg y la reversión rápida forma parte del plan de falla/despertar, recordar que la parálisis puede durar 45–70 min, precalcular sugammadex 16 mg/kg y garantizar disponibilidad inmediata antes de la inducción. Sugammadex revierte el bloqueo, pero no sustituye la adrenalina ni el tratamiento estándar de la anafilaxia y no debe presentarse como terapia establecida de la reacción alérgica al rocuronio.'],
  [LASTRO, 'Fundamento: WAO y EAACI orientan el tratamiento de la anafilaxia y asegurar la vía aérea, pero NO eligen succinilcolina o rocuronio como bloqueador preferente. Por ello la app no debe convertir una preferencia local en regla de guía: la elección depende del paciente, la vía aérea y los recursos de rescate disponibles. Los bloqueadores neuromusculares también pueden desencadenar anafilaxia perioperatoria y presentan reactividad cruzada variable.'],
];
appendTranslations('lib/i18n/modules/anafilaxia.ts', translations);
appendTranslations('lib/i18n/modules/isr.ts', translations);

console.log('✅ Anafilaxia/BNM: hierarquia não suportada removida e traduções PT→ES sincronizadas.');
