#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'tep-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/tep.ts');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const reps = [
  [
    '"⚠️ EM PCR OU COLAPSO IMINENTE, AS CONTRAINDICAÇÕES RELATIVAS TORNAM-SE ACEITÁVEIS — a conta inverte: o risco de sangrar perde para o risco de morrer nos próximos minutos. As absolutas continuam absolutas; a lista das duas está abaixo.",',
    '"⚠️ EM PCR OU COLAPSO IMINENTE, A RELAÇÃO RISCO–BENEFÍCIO MUDA, mas não transforme isso numa regra automática de ignorar contraindicações. AHA 2025 considera fibrinólise razoável no TEP confirmado como causa da parada e possível no TEP suspeito; a decisão deve integrar probabilidade de TEP, risco hemorrágico, alternativas disponíveis e possibilidade de embolectomia/ECLS.",'
  ],
  [
    '"⚠️ EM PCR OU COLAPSO IMINENTE, AS RELATIVAS TORNAM-SE ACEITÁVEIS — a conta inverte: o risco de sangrar perde para o risco de morrer nos próximos minutos. Fora dessa situação, com relativa e sem absoluta, pese o tamanho do TEP contra o sítio de sangramento e considere a via de CATETER, que usa dose menor.",',
    '"⚠️ PCR/colapso iminente exige decisão individual rápida: contraindicações relativas não devem funcionar como veto mecânico, mas também não desaparecem. No TEP confirmado em parada, AHA 2025 considera fibrinólise, embolectomia cirúrgica e embolectomia mecânica opções razoáveis; em TEP apenas suspeito, fibrinólise pode ser considerada. Se houver recurso, discutir embolectomia/ECLS conforme o cenário.",'
  ],
  [
    '"NA PRÁTICA, quando NÃO há protocolo institucional: alteplase 50 mg IV em BÓLUS durante a RCP é o esquema mais usado e mais descrito. Pode-se repetir 50 mg 15–20 min depois se a parada persistir. É o que orienta o ERC e o que aparece nas séries publicadas — não é dose chancelada pela AHA. Registre a decisão e a fonte no prontuário.",',
    '"DOSE NA PCR: AHA 2025 não define um esquema ótimo. ERC 2025 relata sobrevivência/ROSC com alteplase 50 mg IV em bólus, com ou sem 50 mg adicionais após 30 min, ou 0,6–1,0 mg/kg IV (máx. 100 mg), mas afirma que a evidência é insuficiente para recomendar uma estratégia de dose ótima. Se houver protocolo institucional validado, siga-o e registre a estratégia utilizada.",'
  ],
  [
    '"Se houver ROSC sem ter completado 100 mg, o restante pode ser infundido em 1 h, conforme a resposta e o risco hemorrágico.",',
    '"Após ROSC, NÃO complete automaticamente uma dose total de 100 mg apenas porque foi iniciado um esquema durante a parada: a estratégia ótima de fibrinólise na PCR não está estabelecida. Reavaliar sangramento, hemodinâmica, diagnóstico e necessidade de terapia adicional conforme protocolo/equipe especializada.",'
  ],
  [
    '"Por que o bólus de 50 mg e não os 100 mg em 2 h: em parada não existe circulação para sustentar uma infusão de 2 h, e a diretriz de TEP de 2026 (AHA/ACC/CHEST) registra que doses de 25–50 mg têm eficácia comparável para recuperar o VD com menos sangramento grave, inclusive intracraniano, do que 100 mg.",',
    '"⚠️ NÃO extrapolar os estudos de dose reduzida do TEP agudo fora da parada para afirmar que 50 mg em bólus é a dose estabelecida da PCR. AHA/ACC 2026 admite que doses sistêmicas menores podem reduzir sangramento em TEP agudo, mas isso não resolve a estratégia ótima durante RCP.",'
  ],
  [
    '"MANTER RCP por 60–90 MIN após a fibrinólise antes de considerar encerrar — o trombolítico precisa de tempo e de compressões para chegar ao trombo. Encerrar aos 20 min desperdiça a droga que acabou de ser dada. (ERC; não há evidência de alta qualidade sobre a duração ideal.)",',
    '"DURAÇÃO DA RCP APÓS FIBRINÓLISE: ERC 2025 recomenda continuar RCP por pelo menos 60–90 min. AHA 2025 considera a duração ótima incerta; portanto registre o horário da fibrinólise e evite encerrar precocemente sem considerar essa diferença entre diretrizes e o contexto clínico.",'
  ],
  [
    '"Alternativa citada em diretriz de TEP (não de PCR): regime acelerado 0,6 mg/kg em 15 min, máximo 50 mg.",',
    '"Não apresente o regime acelerado de TEP fora da parada como alternativa equivalente e validada para PCR; os esquemas observados durante RCP e a evidência sobre dose ótima continuam heterogêneos.",'
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`Trecho-alvo não encontrado: ${from.slice(0, 120)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const esPairs = new Map([
  [reps[2][1].slice(1, -2), 'DOSIS EN PCR: AHA 2025 no define un esquema óptimo. ERC 2025 describe supervivencia/ROSC con alteplasa 50 mg IV en bolo, con o sin 50 mg adicionales después de 30 min, o 0,6–1,0 mg/kg IV (máx. 100 mg), pero afirma que la evidencia es insuficiente para recomendar una estrategia de dosis óptima. Si existe un protocolo institucional validado, sígalo y registre la estrategia utilizada.'],
  [reps[3][1].slice(1, -2), 'Después del ROSC, NO completar automáticamente una dosis total de 100 mg solo porque se inició un esquema durante el paro: la estrategia óptima de fibrinólisis en PCR no está establecida. Reevaluar sangrado, hemodinamia, diagnóstico y necesidad de terapia adicional según protocolo/equipo especializado.'],
  [reps[5][1].slice(1, -2), 'DURACIÓN DE LA RCP DESPUÉS DE FIBRINÓLISIS: ERC 2025 recomienda continuar la RCP durante al menos 60–90 min. AHA 2025 considera incierta la duración óptima; por lo tanto registre la hora de la fibrinólisis y evite terminar precozmente sin considerar esta diferencia entre guías y el contexto clínico.'],
]);
for (const [pt, es] of esPairs) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(es)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP/PCR: fibrinólise alinhada AHA 2025 + ERC 2025 sem dose ótima inventada nem repetição em 15–20 min.');
