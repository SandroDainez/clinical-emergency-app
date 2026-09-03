#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'rsi-decision-tree.ts');
let src = fs.readFileSync(file, 'utf8');

function replaceOnce(label, before, after) {
  if (src.includes(after)) return;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

replaceOnce('indicacao-flow',
`        "Confirmar a indicação (mnemônico FLOW): Failure (falência ventilatória — apneia, PaCO₂ > 55 + pH < 7,20 refratário à VNI); Lungs (falência de oxigenação — SpO₂ < 90% com FiO₂ 1,0, SARA grave, EAP refratário); Obstruction (angioedema, epiglotite, trauma/queimadura de VA, anafilaxia); Work (FR > 35, musculatura acessória, paradoxo abdominal, fadiga). Também: GCS ≤ 8 com risco de aspiração.",`,
`        "Confirmar a indicação pela fisiologia e trajetória, não por um número isolado (FLOW): Failure — apneia ou falha ventilatória com hipercapnia/acidemia apesar do suporte adequado; Lungs — falha de oxigenação apesar de oxigênio/suporte não invasivo otimizados; Obstruction — obstrução de via aérea presente ou ameaçadora; Work — trabalho respiratório crescente, fadiga ou incapacidade de sustentar ventilação. Acrescentar incapacidade de proteger a via aérea por rebaixamento de consciência e deterioração previsível que torne a intubação posterior mais arriscada. PaCO₂, pH, SpO₂, frequência respiratória e GCS ajudam a medir gravidade, mas nenhum valor isolado é requisito universal para intubar.",`);

replaceOnce('otimizacao-pergunta',
`      question: "Há instabilidade (PAS < 90 / choque / hipoperfusão)?",`,
`      question: "Há instabilidade ou risco hemodinâmico relevante — hipotensão, choque ou hipoperfusão?",`);

replaceOnce('adiar-gatilhos',
`        "GATILHOS DE RETORNO IMEDIATO à intubação: rebaixamento, falha da VNI/HFN (SpO₂ < 90% ou FR subindo), estridor progressivo, fadiga.",`,
`        "GATILHOS DE RETORNO IMEDIATO à estratégia de via aérea: piora do nível de consciência/proteção da via aérea, deterioração da oxigenação apesar do suporte, trabalho respiratório ou frequência respiratória em ascensão, estridor/obstrução progressiva, fadiga ou instabilidade hemodinâmica. Não esperar um corte numérico isolado se a trajetória clínica estiver piorando.",`);

replaceOnce('adiar-reavaliacao',
`        "Reavaliação formal em intervalo curto e definido — adiar sem hora de reavaliar é abandonar.",`,
`        "Definir explicitamente quando e por quais sinais reavaliar, proporcionalmente ao risco e à velocidade de deterioração. Adiar sem plano de reavaliação é abandono; impor um intervalo universal também é inadequado.",`);

fs.writeFileSync(file, src);
console.log('✅ ISR: indicação, instabilidade direta e retorno após adiamento deixaram de depender de cortes numéricos isolados.');
