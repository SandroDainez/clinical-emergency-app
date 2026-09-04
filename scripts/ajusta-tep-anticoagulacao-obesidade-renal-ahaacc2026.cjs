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
    'summary: "Iniciar IMEDIATAMENTE. NOACs são preferidos (ESC 2019 — Classe I).",',
    'summary: "AHA/ACC 2026: anticoagulação é a base do tratamento. Se elegível para via oral, preferir DOAC a antagonista da vitamina K; quando terapia parenteral inicial for necessária em C1–E1, preferir HBPM a HNF, salvo contraindicação/contexto específico.",'
  ],
  [
    '"Situações especiais — gestante: HBPM (NOAC contraindicado); câncer ativo: HBPM ou NOAC (rivaroxabana/apixabana); TIH: argatrobana/fondaparinux (suspender toda heparina); IRA TFG < 30: HNF preferida.",',
    '"SITUAÇÕES ESPECIAIS: gestação exige anticoagulante compatível com a gestação; em síndrome antifosfolípide trombótica estabelecida, AHA/ACC 2026 recomenda antagonista da vitamina K sobre DOAC. Na doença renal grave (ClCr <30 mL/min), se HBPM for utilizada, é razoável monitorar anti-Xa para orientar ajuste e reduzir sangramento; escolher agente e dose conforme função renal, bula e contexto, sem transformar ClCr <30 isoladamente em regra automática de HNF para todo TEP.",'
  ],
  [
    '"PESO E OBESIDADE: usar peso real para HBPM, sem teto empírico; considerar anti-Xa em casos selecionados. Em obesidade extrema (IMC > 40 kg/m² ou peso > 120 kg), apixabana e rivaroxabana podem ser consideradas conforme bula; os dados de dabigatrana e edoxabana são menos robustos nesse grupo. Não reduzir dose apenas pelo peso.",',
    '"OBESIDADE AHA/ACC 2026: em IMC >30 kg/m², DOAC é razoável sobre antagonista da vitamina K quando não contraindicado. Em obesidade classe III (IMC >40 kg/m²) tratada com HBPM, redução de dose pode ser razoável para reduzir sangramento; não crie automaticamente um teto universal. Em peso >150 kg ou IMC >40 kg/m², o benefício de monitorar anti-Xa rotineiramente para evitar níveis supraterapêuticos não está estabelecido.",'
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`Trecho-alvo não encontrado: ${from.slice(0, 120)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const es = new Map([
  [reps[0][1].split('"')[1], 'AHA/ACC 2026: la anticoagulación es la base del tratamiento. Si es elegible para vía oral, preferir DOAC frente a antagonista de vitamina K; cuando se requiera terapia parenteral inicial en C1–E1, preferir HBPM frente a HNF, salvo contraindicación/contexto específico.'],
  [reps[1][1].slice(1, -2), 'SITUACIONES ESPECIALES: el embarazo requiere un anticoagulante compatible con la gestación; en síndrome antifosfolípido trombótico establecido, AHA/ACC 2026 recomienda antagonista de vitamina K sobre DOAC. En enfermedad renal grave (ClCr <30 mL/min), si se utiliza HBPM, es razonable monitorizar anti-Xa para orientar el ajuste y reducir sangrado; elegir agente y dosis según función renal, ficha técnica y contexto, sin convertir ClCr <30 aisladamente en una regla automática de HNF para todo TEP.'],
  [reps[2][1].slice(1, -2), 'OBESIDAD AHA/ACC 2026: con IMC >30 kg/m², DOAC es razonable frente a antagonista de vitamina K cuando no esté contraindicado. En obesidad clase III (IMC >40 kg/m²) tratada con HBPM, una reducción de dosis puede ser razonable para reducir sangrado; no crear automáticamente un techo universal. Con peso >150 kg o IMC >40 kg/m², el beneficio de monitorizar anti-Xa rutinariamente para evitar niveles supraterapéuticos no está establecido.'],
]);
for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP AHA/ACC 2026: anticoagulação em obesidade e doença renal alinhada sem HNF automática nem regra antiga de peso.');
