#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!tree.includes('provocado por fator transitório → 3 meses; não provocado/recorrente/trombofilia de alto risco → indefinido'), 'duração binária antiga ainda presente');
expect(tree.includes('fase inicial de tratamento dura 3–6 meses'), 'fase inicial 3–6 meses ausente');
expect(tree.includes('fator MAIOR reversível'), 'distinção de fator maior reversível ausente');
expect(tree.includes('fase estendida além de 3–6 meses'), 'fase estendida ausente');
expect(tree.includes('reavaliando periodicamente recorrência versus sangramento'), 'reavaliação periódica da fase estendida ausente');
expect(!tree.includes('Considerar apenas em TEP/TVP agudo com contraindicação absoluta TEMPORÁRIA'), 'filtro ainda restrito à regra antiga única');
expect(tree.includes('NÃO usar de rotina em paciente terapeuticamente anticoagulado'), 'filtro: proibição de rotina com anticoagulação ausente');
expect(tree.includes('preferir filtro recuperável'), 'filtro recuperável não priorizado');
expect(tree.includes('programar retirada assim que o risco de TEP diminuir e a anticoagulação puder ser retomada'), 'plano de retirada do filtro ausente');
expect(tree.includes('TEP recorrente apesar de anticoagulação terapêutica ótima'), 'filtro em recorrência apesar de anticoagulação ótima ausente');
expect(tree.includes('categorias D–E submetidas a terapia avançada, o benefício do filtro de rotina é incerto'), 'incerteza do filtro com terapia avançada D-E ausente');
expect(tree.includes('seguimento clínico na primeira semana após a alta'), 'seguimento na primeira semana ausente');
expect(tree.includes('consulta até 3 meses'), 'consulta até 3 meses ausente');
expect(tree.includes('em TODAS as consultas por pelo menos 1 ano'), 'screening sintomático por pelo menos 1 ano ausente');
expect(tree.includes('não fazer imagem de controle rotineira apenas para documentar resolução'), 'proteção contra imagem rotineira assintomática ausente');
expect(i18n.includes('la fase inicial de tratamiento dura 3–6 meses'), 'ES: duração 3–6 meses ausente');
expect(i18n.includes('preferir uno recuperable'), 'ES: filtro recuperável ausente');
expect(i18n.includes('durante al menos 1 año'), 'ES: seguimento por 1 ano ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP AHA/ACC 2026: 18 travas de duração, filtro de VCI e seguimento aprovadas.');
