#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(tree.includes('O risco hemorrágico é aceitável para trombólise sistêmica neste cenário?'), 'decisão ainda pergunta apenas contraindicação absoluta');
expect(!tree.includes('Trombólise sistêmica é PRIMEIRA LINHA no TEP de alto risco se não houver contraindicação absoluta'), 'frase legada de primeira linha ainda presente');
expect(tree.includes('em E1–E2, com risco hemorrágico aceitável'), 'E1–E2 + risco hemorrágico aceitável ausentes');
expect(tree.includes('em D1–D2 pode ser considerada'), 'D1–D2 não ficaram como consideração condicional');
expect(tree.includes('Em C3 o benefício é incerto'), 'incerteza de C3 ausente');
expect(tree.includes('em A1–C2 não usar trombólise sistêmica'), 'proteção A1–C2 ausente');
expect(tree.includes('Risco hemorrágico aceitável para trombólise'), 'opção de risco aceitável ausente');
expect(tree.includes('Risco hemorrágico inaceitável / contraindicação maior'), 'opção de risco inaceitável ausente');
expect(tree.includes('Risco incerto — revisar contraindicações'), 'ramo de risco incerto ausente');
expect(tree.includes('CONTRAINDICAÇÕES RELATIVAS'), 'lista de relativas foi removida');
expect(tree.includes('contraindicações relativas não devem funcionar como veto mecânico, mas também não desaparecem'), 'balanço em PCR foi perdido');
expect(i18n.includes('con riesgo hemorrágico aceptable'), 'ES: semântica de risco hemorrágico ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP AHA/ACC 2026: 12 travas de categoria + risco hemorrágico aprovadas.');
