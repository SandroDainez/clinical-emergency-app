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
    '"DURAÇÃO: provocado por fator transitório → 3 meses; não provocado/recorrente/trombofilia de alto risco → indefinido (reavaliar risco de sangramento); câncer ativo → enquanto ativo.",',
    '"DURAÇÃO AHA/ACC 2026: a fase inicial de tratamento dura 3–6 meses. Se o primeiro TEP ocorreu por fator MAIOR reversível, em geral interromper ao fim dessa fase; sem fator maior reversível ou com fator persistente, considerar/continuar fase estendida além de 3–6 meses, reavaliando periodicamente recorrência versus sangramento. Não transformar “provocado = 3 meses” ou “não provocado = indefinido” em regra automática sem classificar o fator de risco.",'
  ],
  [
    '"FILTRO DE VEIA CAVA: não usar de rotina junto à anticoagulação. Considerar apenas em TEP/TVP agudo com contraindicação absoluta TEMPORÁRIA à anticoagulação — e já com plano de retirada assim que ela puder ser reiniciada.",',
    '"FILTRO DE VEIA CAVA AHA/ACC 2026: NÃO usar de rotina em paciente terapeuticamente anticoagulado. Se anticoagulação não puder ser tolerada e filtro for necessário, preferir filtro recuperável e programar retirada assim que o risco de TEP diminuir e a anticoagulação puder ser retomada. Em TEP recorrente apesar de anticoagulação terapêutica ótima, o filtro pode ser considerado; em categorias D–E submetidas a terapia avançada, o benefício do filtro de rotina é incerto.",'
  ],
  [
    '"Duração mínima 3 meses; reavaliar conforme o fator (provocado × não provocado).",',
    '"Fase inicial de anticoagulação: 3–6 meses. Definir eventual fase estendida pela presença de fator maior reversível, ausência de fator maior reversível, fator persistente, recorrência e risco hemorrágico; reavaliar periodicamente se continuar além da fase inicial.",'
  ],
  [
    '"Planejar duração da anticoagulação (3 meses se provocado; indefinido se não provocado/alto risco).",',
    '"Planejar a duração: fase inicial 3–6 meses; ao final, decidir interrupção versus fase estendida conforme fator maior reversível, fatores persistentes/ausentes, recorrência e risco de sangramento. Reavaliar periodicamente se mantida além da fase inicial.",'
  ],
  [
    '"Seguimento ambulatorial garantido em 5–7 dias; acesso à emergência.",',
    '"Garantir contato/seguimento clínico na primeira semana após a alta para educação, adesão, barreiras à anticoagulação e sangramento; programar também revisão até 3 meses.",'
  ],
  [
    '"Seguimento ambulatorial garantido em 5–7 dias e acesso à emergência.",',
    '"Garantir seguimento na primeira semana após a alta e acesso à emergência; programar consulta até 3 meses para revisar duração da anticoagulação, sintomas persistentes e necessidade de investigação adicional.",'
  ],
  [
    '"Investigar HPTEC (hipertensão pulmonar tromboembólica crônica) no seguimento se dispneia persistir > 3 meses (cintilografia V/Q).",',
    '"SEGUIMENTO PÓS-TEP: perguntar por dispneia e limitação funcional em TODAS as consultas por pelo menos 1 ano. Se sintomas persistirem após cerca de 3 meses de anticoagulação terapêutica, avaliar doença pulmonar tromboembólica crônica (CTEPD) e outras causas; não fazer imagem de controle rotineira apenas para documentar resolução em paciente assintomático de baixa suspeita.",'
  ],
  [
    '"Duração mínima de 3 meses; reavaliar fator provocador × não provocado.",',
    '"A fase inicial dura 3–6 meses; ao final, decidir se haverá fase estendida conforme fatores reversíveis/persistentes, recorrência e risco hemorrágico, com reavaliação periódica se mantida.",'
  ],
];

for (const [from, to] of reps) {
  if (tree.includes(from)) {
    tree = tree.replace(from, to);
  } else if (!tree.includes(to)) {
    console.warn(`ℹ️ Variante opcional não presente no runtime atual: ${from.slice(0, 100)}`);
  }
}

const es = new Map([
  [reps[0][1].slice(1, -2), 'DURACIÓN AHA/ACC 2026: la fase inicial de tratamiento dura 3–6 meses. Si el primer TEP ocurrió por un factor MAYOR reversible, en general suspender al final de esa fase; sin un factor mayor reversible o con un factor persistente, considerar/continuar una fase extendida más allá de 3–6 meses, reevaluando periódicamente recurrencia frente a sangrado. No convertir “provocado = 3 meses” o “no provocado = indefinido” en una regla automática sin clasificar el factor de riesgo.'],
  [reps[1][1].slice(1, -2), 'FILTRO DE VENA CAVA AHA/ACC 2026: NO usar de rutina en un paciente terapéuticamente anticoagulado. Si no puede tolerarse la anticoagulación y se necesita un filtro, preferir uno recuperable y programar su retirada en cuanto disminuya el riesgo de TEP y pueda reanudarse la anticoagulación. En TEP recurrente pese a anticoagulación terapéutica óptima, el filtro puede considerarse; en categorías D–E sometidas a terapia avanzada, el beneficio del filtro rutinario es incierto.'],
  [reps[6][1].slice(1, -2), 'SEGUIMIENTO POST-TEP: preguntar por disnea y limitación funcional en TODAS las consultas durante al menos 1 año. Si persisten síntomas después de aproximadamente 3 meses de anticoagulación terapéutica, evaluar enfermedad pulmonar tromboembólica crónica (CTEPD) y otras causas; no realizar imagen de control rutinaria solo para documentar resolución en un paciente asintomático con baja sospecha.'],
]);
for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP AHA/ACC 2026: duração, filtro de VCI e seguimento pós-alta alinhados sem regras binárias antigas.');
