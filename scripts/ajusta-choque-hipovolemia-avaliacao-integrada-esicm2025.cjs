#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'shock-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/choque-einstein.ts');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const reps = [
  [
    'question: "Sangramento ativo, vômitos/diarreia, queimadura ou trauma com perda volêmica?",',
    'question: "Há perda volêmica conhecida ou provável — inclusive hemorragia oculta — ou forte suspeita clínica de hipovolemia?",'
  ],
  [
    '"Veias colabadas, resposta a volume, hematócrito/lactato, foco de perda evidente.",',
    '"Procure a fonte e o contexto: hemorragia externa ou interna, perdas gastrointestinais/renais, queimadura/terceiro espaço e outras causas de redução de volume efetivo. Integre tendência hemodinâmica, perfusão periférica, diurese, lactato quando pertinente e POCUS; ausência de uma perda externa óbvia não exclui hipovolemia ou hemorragia oculta.",'
  ],
  [
    '"Perfil de cabeceira que separa os tipos: extremidades FRIAS, pressão de pulso < 25 mmHg, enchimento capilar > 3 s e SvcO₂ < 70% apontam para hipovolêmico, cardiogênico ou obstrutivo. Extremidades QUENTES, pressão de pulso > 40 mmHg, enchimento capilar < 3 s e SvcO₂ normal ou alta apontam para distributivo.",',
    '"Temperatura das extremidades, pressão de pulso, enchimento capilar e SvcO₂ ajudam a caracterizar perfusão, mas NÃO separam de forma rígida o tipo de choque: há sobreposição e fenótipos mistos. ESICM 2025 recomenda acompanhar enchimento capilar; temperatura cutânea/moteado podem complementar, e SvcO₂ deve ser interpretada em série quando houver acesso venoso central.",'
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`Choque hipovolemia: trecho não localizado: ${from.slice(0, 110)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const insertion = '"Se o fenótipo continuar incerto ou o choque persistir após a terapia inicial, usar ecocardiografia/POCUS como imagem de primeira linha e avaliar responsividade a fluido com variáveis dinâmicas quando aplicáveis antes de continuar expansão. Não usar um marcador estático isolado de pré-carga como prova de hipovolemia.",';
if (!tree.includes(insertion.slice(1, -2))) {
  const anchor = '"Temperatura das extremidades, pressão de pulso, enchimento capilar e SvcO₂ ajudam a caracterizar perfusão, mas NÃO separam de forma rígida o tipo de choque: há sobreposição e fenótipos mistos. ESICM 2025 recomenda acompanhar enchimento capilar; temperatura cutânea/moteado podem complementar, e SvcO₂ deve ser interpretada em série quando houver acesso venoso central.",';
  if (!tree.includes(anchor)) throw new Error('Âncora do evidence q_hipovolemia não localizada');
  tree = tree.replace(anchor, `${anchor}\n        ${insertion}`);
}

const es = new Map([
  ['Há perda volêmica conhecida ou provável — inclusive hemorragia oculta — ou forte suspeita clínica de hipovolemia?', '¿Hay pérdida de volumen conocida o probable — incluida hemorragia oculta — o fuerte sospecha clínica de hipovolemia?'],
  ['Procure a fonte e o contexto: hemorragia externa ou interna, perdas gastrointestinais/renais, queimadura/terceiro espaço e outras causas de redução de volume efetivo. Integre tendência hemodinâmica, perfusão periférica, diurese, lactato quando pertinente e POCUS; ausência de uma perda externa óbvia não exclui hipovolemia ou hemorragia oculta.', 'Busque la fuente y el contexto: hemorragia externa o interna, pérdidas gastrointestinales/renales, quemadura/tercer espacio y otras causas de reducción del volumen efectivo. Integre tendencia hemodinámica, perfusión periférica, diuresis, lactato cuando corresponda y POCUS; la ausencia de una pérdida externa evidente no excluye hipovolemia ni hemorragia oculta.'],
  ['Temperatura das extremidades, pressão de pulso, enchimento capilar e SvcO₂ ajudam a caracterizar perfusão, mas NÃO separam de forma rígida o tipo de choque: há sobreposição e fenótipos mistos. ESICM 2025 recomenda acompanhar enchimento capilar; temperatura cutânea/moteado podem complementar, e SvcO₂ deve ser interpretada em série quando houver acesso venoso central.', 'La temperatura de las extremidades, la presión de pulso, el llenado capilar y la SvcO₂ ayudan a caracterizar la perfusión, pero NO separan de forma rígida el tipo de shock: existe superposición y fenotipos mixtos. ESICM 2025 recomienda monitorizar el llenado capilar; la temperatura cutánea/moteado pueden complementar, y la SvcO₂ debe interpretarse en serie cuando exista acceso venoso central.'],
  ['Se o fenótipo continuar incerto ou o choque persistir após a terapia inicial, usar ecocardiografia/POCUS como imagem de primeira linha e avaliar responsividade a fluido com variáveis dinâmicas quando aplicáveis antes de continuar expansão. Não usar um marcador estático isolado de pré-carga como prova de hipovolemia.', 'Si el fenotipo sigue incierto o el shock persiste tras la terapia inicial, usar ecocardiografía/POCUS como imagen de primera línea y evaluar respuesta a fluidos con variables dinámicas cuando sean aplicables antes de continuar la expansión. No usar un marcador estático aislado de precarga como prueba de hipovolemia.'],
]);
for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário choque-einstein não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ Choque: avaliação de hipovolemia reenquadrada como avaliação integrada, sem classificador rígido de cabeceira.');
