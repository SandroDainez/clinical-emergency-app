#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceAllExact(rel, label, before, after, expected) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes(after) && !src.includes(before)) return;
  const count = src.split(before).length - 1;
  if (count !== expected) throw new Error(`${rel} · ${label}: esperado ${expected} alvo(s), encontrados ${count}`);
  src = src.split(before).join(after);
  fs.writeFileSync(file, src);
}
function replaceOnce(rel, label, before, after) { replaceAllExact(rel, label, before, after, 1); }

replaceOnce('rsi-decision-tree.ts','fentanil-rigidez',
'"Fentanil {fenta} mcg IV (1–3 mcg/kg, 3 min antes): atenua a resposta simpática à laringoscopia. Indicado em coronariopatia, HAS grave, hipertensão intracraniana (HIC). Cuidado: rigidez torácica se > 5 mcg/kg.",',
'"Fentanil {fenta} mcg IV (1–3 mcg/kg, uso seletivo): pode atenuar a resposta simpática à laringoscopia quando essa resposta representar risco. Titular ao contexto hemodinâmico; rigidez torácica/laríngea é rara, favorecida por doses maiores e administração rápida, mas não existe limiar universal de 5 mcg/kg.",');

replaceAllExact('rsi-decision-tree.ts','ventilacao-apneia',
'"Injetar o indutor em bolus rápido e, em < 30 s, o bloqueador neuromuscular. NÃO ventilar no intervalo de apneia (salvo SpO₂ < 90%).",',
'"Administrar indutor e bloqueador em sequência sem atraso desnecessário. Manter oxigenação contínua; no paciente crítico ou com risco de dessaturação, ventilação suave com BVM entre indução e laringoscopia pode reduzir hipoxemia. Individualizar se houver risco excepcionalmente alto de regurgitação/aspiração.",',2);

replaceOnce('rsi-decision-tree.ts','rocuronio-evidence',
'"Rocurônio 1,2 mg/kg: início 45–60 s, duração 45–70 min. Antídoto: sugamadex 16 mg/kg reverte em < 3 min — com sugamadex disponível, mesma segurança que SCh.",',
'"Rocurônio 1,2 mg/kg: início 45–60 s e duração mais longa que a succinilcolina. A SCCM aceita rocurônio OU succinilcolina para ISR quando não há contraindicação à succinilcolina. Sugamadex pode reverter bloqueio profundo por rocurônio quando isso fizer parte do plano, mas não substitui a progressão de resgate da via aérea nem deve atrasar eFONA em CICO.",');

replaceOnce('rsi-decision-tree.ts','succ-summary',
'summary: "Início rápido e duração ultracurta (8–12 min). Máx 200 mg.",',
'summary: "Início rápido e duração ultracurta (8–12 min). Dose por peso; na obesidade usar peso corporal total/real, sem teto IV artificial de 200 mg.",');
replaceOnce('rsi-decision-tree.ts','succ-dose',
'"Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg; 2 mg/kg em obesos; máx 200 mg) em bolus ultrarrápido, logo após o indutor.",',
'"Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg) em bolus logo após o indutor. Na obesidade, calcular pelo peso corporal total/real; não aplicar automaticamente 2 mg/kg nem teto IV de 200 mg.",');

replaceOnce('rsi-decision-tree.ts','rocu-summary',
'summary: "Alternativa segura quando a SCh é contraindicada. Antídoto: sugamadex.",',
'summary: "Opção válida para ISR. Duração mais longa; planejar resgate e reversão conforme o contexto.",');
replaceOnce('rsi-decision-tree.ts','rocu-sugammadex',
'"ANTÍDOTO CICO: sugamadex {sugam} mg IV (16 mg/kg) reverte em < 3 min. Ter SEMPRE disponível quando usar rocurônio para ISR.",',
'"Se reversão imediata do bloqueio profundo fizer parte do plano de falha/despertar, pré-calcular sugamadex {sugam} mg IV (16 mg/kg) e garantir disponibilidade real. Em CICO, não esperar reversão farmacológica atrasar a sequência de resgate/eFONA.",');

const additions = [
['Fentanil {fenta} mcg IV (1–3 mcg/kg, uso seletivo): pode atenuar a resposta simpática à laringoscopia quando essa resposta representar risco. Titular ao contexto hemodinâmico; rigidez torácica/laríngea é rara, favorecida por doses maiores e administração rápida, mas não existe limiar universal de 5 mcg/kg.','Fentanilo {fenta} mcg IV (1–3 mcg/kg, uso selectivo): puede atenuar la respuesta simpática a la laringoscopia cuando esa respuesta represente riesgo. Titular según el contexto hemodinámico; la rigidez torácica/laríngea es rara, favorecida por dosis mayores y administración rápida, pero no existe un umbral universal de 5 mcg/kg.'],
['Administrar indutor e bloqueador em sequência sem atraso desnecessário. Manter oxigenação contínua; no paciente crítico ou com risco de dessaturação, ventilação suave com BVM entre indução e laringoscopia pode reduzir hipoxemia. Individualizar se houver risco excepcionalmente alto de regurgitação/aspiração.','Administrar inductor y bloqueante en secuencia sin demora innecesaria. Mantener oxigenación continua; en el paciente crítico o con riesgo de desaturación, la ventilación suave con bolsa-válvula-mascarilla entre inducción y laringoscopia puede reducir la hipoxemia. Individualizar si existe riesgo excepcionalmente alto de regurgitación/aspiración.'],
['Rocurônio 1,2 mg/kg: início 45–60 s e duração mais longa que a succinilcolina. A SCCM aceita rocurônio OU succinilcolina para ISR quando não há contraindicação à succinilcolina. Sugamadex pode reverter bloqueio profundo por rocurônio quando isso fizer parte do plano, mas não substitui a progressão de resgate da via aérea nem deve atrasar eFONA em CICO.','Rocuronio 1,2 mg/kg: inicio 45–60 s y duración más prolongada que la succinilcolina. SCCM acepta rocuronio O succinilcolina para ISR cuando no hay contraindicación a succinilcolina. Sugammadex puede revertir bloqueo profundo por rocuronio cuando forme parte del plan, pero no sustituye la progresión del rescate de vía aérea ni debe retrasar eFONA en CICO.'],
['Início rápido e duração ultracurta (8–12 min). Dose por peso; na obesidade usar peso corporal total/real, sem teto IV artificial de 200 mg.','Inicio rápido y duración ultracorta (8–12 min). Dosis por peso; en obesidad usar peso corporal total/real, sin un techo IV artificial de 200 mg.'],
['Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg) em bolus logo após o indutor. Na obesidade, calcular pelo peso corporal total/real; não aplicar automaticamente 2 mg/kg nem teto IV de 200 mg.','Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg) en bolo inmediatamente tras el inductor. En obesidad, calcular por peso corporal total/real; no aplicar automáticamente 2 mg/kg ni un techo IV de 200 mg.'],
['Opção válida para ISR. Duração mais longa; planejar resgate e reversão conforme o contexto.','Opción válida para ISR. Duración más prolongada; planificar rescate y reversión según el contexto.'],
['Se reversão imediata do bloqueio profundo fizer parte do plano de falha/despertar, pré-calcular sugamadex {sugam} mg IV (16 mg/kg) e garantir disponibilidade real. Em CICO, não esperar reversão farmacológica atrasar a sequência de resgate/eFONA.','Si la reversión inmediata del bloqueo profundo forma parte del plan de falla/despertar, precalcular sugammadex {sugam} mg IV (16 mg/kg) y garantizar disponibilidad real. En CICO, no esperar la reversión farmacológica ni retrasar la secuencia de rescate/eFONA.']
];
const i18nFile=path.join(root,'lib/i18n/modules/isr.ts');
let i18n=fs.readFileSync(i18nFile,'utf8');
for(const [pt,es] of additions){
 const key=JSON.stringify(pt); if(!i18n.includes(key+':')) i18n=i18n.replace('export const ES_ISR: Record<string, string> = {',`export const ES_ISR: Record<string, string> = {\n  ${key}: ${JSON.stringify(es)},`);
}
fs.writeFileSync(i18nFile,i18n);
console.log('✅ ISR: prosa de succinilcolina/rocurônio e ventilação peri-indução alinhada às fontes atuais e à Sedoanalgesia.');