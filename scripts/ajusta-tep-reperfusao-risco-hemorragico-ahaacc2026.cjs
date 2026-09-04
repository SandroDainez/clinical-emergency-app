#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'tep-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/tep.ts');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const replacements = [
  [
    'question: "Há contraindicação ABSOLUTA à trombólise?",',
    'question: "O risco hemorrágico é aceitável para trombólise sistêmica neste cenário?",'
  ],
  [
    '"Trombólise sistêmica é PRIMEIRA LINHA no TEP de alto risco se não houver contraindicação absoluta.",',
    '"AHA/ACC 2026: em E1–E2, com risco hemorrágico aceitável e quando terapia avançada está sendo considerada, trombólise sistêmica + anticoagulação é razoável sobre anticoagulação isolada; em D1–D2 pode ser considerada para prevenir deterioração. Em C3 o benefício é incerto; em A1–C2 não usar trombólise sistêmica sobre anticoagulação devido ao maior risco de sangramento grave e hemorragia intracraniana.",'
  ],
  [
    '{ id: "sem", label: "Sem contraindicação absoluta", next: "ar_trombolise" },',
    '{ id: "sem", label: "Risco hemorrágico aceitável para trombólise", next: "ar_trombolise" },'
  ],
  [
    '{ id: "com", label: "Há contraindicação absoluta", next: "ar_alternativas" },',
    '{ id: "com", label: "Risco hemorrágico inaceitável / contraindicação maior", next: "ar_alternativas" },'
  ],
  [
    '{ id: "nao_sei", label: "Não sei dizer — abrir a lista", next: "ci_tep_lista" },',
    '{ id: "nao_sei", label: "Risco incerto — revisar contraindicações", next: "ci_tep_lista" },'
  ],
];

for (const [from, to] of replacements) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`Trecho-alvo não encontrado: ${from}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const pt = replacements[1][1].slice(1, -2);
const es = 'AHA/ACC 2026: en E1–E2, con riesgo hemorrágico aceptable y cuando se considera terapia avanzada, trombólisis sistémica + anticoagulación es razonable frente a anticoagulación sola; en D1–D2 puede considerarse para prevenir deterioro. En C3 el beneficio es incierto; en A1–C2 no usar trombólisis sistémica sobre anticoagulación por el mayor riesgo de sangrado grave y hemorragia intracraneal.';
if (!i18n.includes(JSON.stringify(pt))) {
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(es)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP AHA/ACC 2026: decisão de reperfusão deixa de usar apenas “contraindicação absoluta” e passa a exigir risco hemorrágico aceitável por categoria.');
