#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(tree.includes('não define sozinho categoria D/E'), 'achado isolado não foi reenquadrado para D/E');
expect(tree.includes('D2 (hipoperfusão/choque normotensivo)'), 'proteção explícita de D2 normotensivo ausente');
expect(tree.includes('pressão preservada NÃO exclui deterioração relevante'), 'pressão preservada ainda pode mascarar deterioração sem alerta');
expect(tree.includes('Não usar a antiga etiqueta intermediário-alto como autorização automática para trombólise'), 'proteção contra etiqueta intermediário-alto ausente');
expect(tree.includes('sem esperar hipotensão persistente para reconhecer piora'), 'fluxo ainda pode exigir hipotensão persistente antes de reconhecer piora');
expect(tree.includes('title: "TEP D/E — suporte + anticoagulação quando indicada"'), 'título do ramo crítico ainda usa rótulo antigo');
expect(tree.includes('title: "Alternativas à trombólise — TEP D/E"'), 'título de reperfusão alternativa ainda usa rótulo antigo');
expect(tree.includes('E2/choque refratário ou PCR por TEP'), 'VA-ECMO não ficou ligada ao fenótipo E2/PCR');
expect(!tree.includes('O achado isolado não classifica como alto risco — a definição exige PAS < 90 mmHg'), 'regra antiga dependente de hipotensão persiste');
expect(!tree.includes('PROCURAR o risco intermediário-alto, que é o que descompensa'), 'etiqueta intermediário-alto ainda decide conduta');
expect(!tree.includes('passa a ser alto risco e a trombólise entra em discussão imediata'), 'deterioração ainda está expressa no modelo antigo');
expect(!tree.includes('title: "TEP alto risco — suporte + anticoagulação imediata"'), 'título legado alto risco ainda ativo');
expect(!tree.includes('TEP maciço com PCR/colapso refratário'), 'termo maciço ainda orienta VA-ECMO no runtime');
expect(i18n.includes('Hallazgo aislado — todavía NO define categoría D/E'), 'ES: título D/E ausente');
expect(i18n.includes('shock normotensivo'), 'ES: proteção D2 normotensivo ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP A–E: 15 travas de linguagem/segurança aprovadas, incluindo D2 normotensivo.');
