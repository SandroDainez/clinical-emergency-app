#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'shock-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/choque-einstein.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };
expect(!tree.includes('mais de 70% dos IAM de VE em choque já têm congestão'), 'percentual histórico >70% ainda presente');
expect(tree.includes('Na presença de congestão, NÃO usar expansão volêmica empírica como tratamento primário'), 'frio/úmido não restringe expansão empírica');
expect(tree.includes('ausência de congestão, sozinha, NÃO prova responsividade a volume'), 'frio/seco ainda presume resposta a volume');
expect(tree.includes('baixa pré-carga provável ou responsividade demonstrada'), 'frio/seco não exige racional antes do fluido');
expect(tree.includes('testar PEQUENA alíquota e reavaliar imediatamente volume sistólico/perfusão'), 'prova pequena/reavaliação ausente');
expect(tree.includes('interromper se não houver benefício'), 'stop rule após prova de volume ausente');
expect(tree.includes('noradrenalina como vasopressor de primeira linha'), 'noradrenalina de primeira linha ausente');
expect(tree.includes('considerar inotrópico quando houver baixo débito persistente apesar de pressão adequada'), 'inotrópico não condicionado a baixo débito persistente');
expect(!tree.includes('no VD, dar volume ajuda e diurético mata'), 'comentário absoluto de VD ainda presente');
expect(i18n.includes('la ausencia de congestión, por sí sola, NO demuestra respuesta a volumen'), 'tradução ES frio/seco ausente');
expect(i18n.includes('NO usar expansión con volumen empírica como tratamiento primario'), 'tradução ES frio/úmido ausente');
expect(i18n.includes('suspender si no hay beneficio'), 'tradução ES stop rule ausente');
if (issues.length) {
  for (const issue of issues) console.error(`FAIL ${issue}`);
  process.exit(1);
}
console.log('Choque cardiogênico ACC 2025: 12 travas de fenótipo/volume aprovadas.');
