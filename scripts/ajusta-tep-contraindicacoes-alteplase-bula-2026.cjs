#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ciPath = path.join(root, 'lib/contraindicacao-trombolise.ts');
const treePath = path.join(root, 'tep-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/tep.ts');
let ci = fs.readFileSync(ciPath, 'utf8');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const oldList = 'CONTRAINDICAÇÕES À TROMBÓLISE NO TEP — confira item a item. ABSOLUTAS: doença intracraniana estrutural; hemorragia intracraniana; sangramento ativo; cirurgia cerebral ou de coluna recente; traumatismo craniano recente com fratura ou lesão encefálica; diátese hemorrágica; AVC isquêmico recente (a janela diverge entre as fontes — veja abaixo). RELATIVAS: PAS > 180 ou PAD > 110 mmHg; sangramento não intracraniano recente; cirurgia ou procedimento invasivo recente; AVC isquêmico há mais de 3 meses; anticoagulação em curso; RCP traumática; pericardite ou derrame pericárdico; retinopatia diabética; gravidez; idade > 65 anos; baixo peso corporal.';
const newList = 'CONTRAINDICAÇÕES À ALTEPLASE NO TEP — usar a bula do produto disponível e o protocolo local. A bula oficial do Activase para TEP/infarto orienta NÃO administrar quando o risco hemorrágico excede o benefício nas seguintes situações: sangramento interno ativo; história de AVC RECENTE; cirurgia intracraniana ou intraespinhal, ou traumatismo craniano grave, nos últimos 3 meses; condição intracraniana que aumente o risco de sangramento; diátese hemorrágica; hipertensão grave não controlada. Além disso, cirurgia/procedimento maior recente, doença cerebrovascular, sangramento gastrointestinal ou geniturinário recente, trauma recente, pericardite, endocardite, defeitos hemostáticos por doença hepática/renal grave, gravidez, retinopatia hemorrágica, idade avançada e anticoagulação oral aumentam o risco e exigem balanço individual. Não converta fatores de risco em veto automático fora do que a bula/protocolo define.';

const oldWindow = '⚠️ A JANELA DO AVC ISQUÊMICO RECENTE DIVERGE ENTRE AS FONTES, E ESTE APP NÃO ESCOLHE POR VOCÊ: o StatPearls (Thrombolytic Therapy) usa 3 MESES como contraindicação absoluta, e coloca o AVC de mais de 3 meses entre as relativas; o ESC 2019 de embolia pulmonar usa 6 MESES. Um paciente com AVC isquêmico há 4 meses é ABSOLUTAMENTE contraindicado por uma fonte e não pela outra. Decida pela referência que o seu serviço adota, registre qual usou — e, se houver tempo, discuta com quem vai assumir o paciente. ➜ Nas outras duas indicações deste app a janela é 3 meses, sem divergência.';
const newWindow = '⚠️ AVC RECENTE E TEP: não invente uma janela universal de 3 versus 6 meses a partir de fontes secundárias antigas. A bula oficial atual do Activase para TEP usa a expressão “história de AVC recente” como contraindicação, sem definir nessa seção um número de meses. Se o intervalo for clinicamente limítrofe, confira a bula da apresentação disponível e o protocolo institucional e discuta com PERT/equipe de reperfusão quando houver tempo; se a lise sistêmica não for aceitável, avalie alternativas de reperfusão conforme categoria, risco hemorrágico e recursos.';

for (const [from, to, label] of [[oldList, newList, 'CI_TEP_LISTA'], [oldWindow, newWindow, 'CI_TEP_JANELA_DIVERGE']]) {
  if (!ci.includes(from) && !ci.includes(to)) throw new Error(`${label}: texto-alvo não localizado`);
  if (ci.includes(from)) ci = ci.replace(from, to);
}

const treeReps = [
  [
    '"Absolutas: AVC hemorrágico (qualquer tempo) ou isquêmico < 3 meses; neoplasia intracraniana; TCE grave/cirurgia intracraniana/espinhal recente; sangramento ativo; suspeita de dissecção de aorta; punção em sítio não compressível < 7 dias.",',
    '"ANTES DA LISE: conferir a lista detalhada de contraindicações abaixo e a bula/protocolo do produto utilizado. Não transformar uma janela histórica de 3 ou 6 meses para AVC prévio em regra universal se a própria bula vigente apenas disser AVC recente.",'
  ],
  [
    '"Idade > 75 anos; anticoagulação oral em uso; gestação e primeira semana pós-parto; RCP prolongada ou traumática; punção vascular não compressível; HAS grave não controlada (> 180/110); doença hepática avançada; endocardite infecciosa; úlcera péptica ativa; cirurgia de grande porte < 3 semanas; sangramento interno recente (2–4 semanas).",',
    '"RISCO HEMORRÁGICO: além das contraindicações da bula, pesar cirurgia/procedimento maior recente, doença cerebrovascular, sangramento gastrointestinal/geniturinário recente, trauma, pericardite, endocardite, doença hepática/renal com defeito hemostático, gravidez, retinopatia hemorrágica, idade avançada e anticoagulação oral. A decisão depende da categoria AHA/ACC, gravidade, possibilidade de alternativa e risco de sangramento.",'
  ],
];
for (const [from, to] of treeReps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`TEP: texto-alvo não localizado: ${from.slice(0, 90)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const es = new Map([
  [newList, 'CONTRAINDICACIONES PARA ALTEPLASA EN TEP — usar la ficha técnica del producto disponible y el protocolo local. La ficha oficial de Activase para TEP/infarto indica NO administrarla cuando el riesgo hemorrágico supera el beneficio en las siguientes situaciones: sangrado interno activo; antecedente de ACV RECIENTE; cirugía intracraneal o intraespinal, o traumatismo craneal grave, en los últimos 3 meses; condición intracraneal que aumente el riesgo de sangrado; diátesis hemorrágica; hipertensión grave no controlada. Además, cirugía/procedimiento mayor reciente, enfermedad cerebrovascular, sangrado gastrointestinal o genitourinario reciente, trauma reciente, pericarditis, endocarditis, defectos hemostáticos por enfermedad hepática/renal grave, embarazo, retinopatía hemorrágica, edad avanzada y anticoagulación oral aumentan el riesgo y requieren balance individual. No convertir factores de riesgo en veto automático fuera de lo definido por la ficha técnica/protocolo.'],
  [newWindow, '⚠️ ACV RECIENTE Y TEP: no inventar una ventana universal de 3 frente a 6 meses a partir de fuentes secundarias antiguas. La ficha oficial actual de Activase para TEP utiliza la expresión “antecedente de ACV reciente” como contraindicación, sin definir en esa sección un número de meses. Si el intervalo es clínicamente limítrofe, consultar la ficha técnica de la presentación disponible y el protocolo institucional y discutir con PERT/equipo de reperfusión cuando haya tiempo; si la lisis sistémica no es aceptable, valorar alternativas de reperfusión según categoría, riesgo hemorrágico y recursos.'],
  [treeReps[0][1].slice(1, -2), 'ANTES DE LA LISIS: revisar la lista detallada de contraindicaciones a continuación y la ficha técnica/protocolo del producto utilizado. No convertir una ventana histórica de 3 o 6 meses para ACV previo en una regla universal si la propia ficha vigente solo dice ACV reciente.'],
  [treeReps[1][1].slice(1, -2), 'RIESGO HEMORRÁGICO: además de las contraindicaciones de la ficha técnica, valorar cirugía/procedimiento mayor reciente, enfermedad cerebrovascular, sangrado gastrointestinal/genitourinario reciente, trauma, pericarditis, endocarditis, enfermedad hepática/renal con defecto hemostático, embarazo, retinopatía hemorrágica, edad avanzada y anticoagulación oral. La decisión depende de la categoría AHA/ACC, gravedad, posibilidad de alternativa y riesgo de sangrado.'],
]);
for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + i18n.slice(idx);
}

fs.writeFileSync(ciPath, ci);
fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP: contraindicações de alteplase ancoradas em bula oficial, sem falsa regra universal de 3 versus 6 meses.');