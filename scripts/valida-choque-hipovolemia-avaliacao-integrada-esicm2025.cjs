#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'shock-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/choque-einstein.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(tree.includes('inclusive hemorragia oculta'), 'perda oculta não ficou explícita na pergunta de hipovolemia');
expect(tree.includes('ausência de uma perda externa óbvia não exclui hipovolemia ou hemorragia oculta'), 'proteção contra falsa exclusão de hipovolemia ausente');
expect(tree.includes('NÃO separam de forma rígida o tipo de choque'), 'marcadores de cabeceira ainda podem ser lidos como classificador rígido');
expect(tree.includes('há sobreposição e fenótipos mistos'), 'sobreposição/mistura de fenótipos não ficou explícita');
expect(tree.includes('acompanhar enchimento capilar'), 'enchimento capilar seriado ESICM 2025 ausente');
expect(tree.includes('SvcO₂ deve ser interpretada em série'), 'interpretação seriada de SvcO2 ausente');
expect(tree.includes('ecocardiografia/POCUS como imagem de primeira linha'), 'eco/POCUS de primeira linha ausente na incerteza persistente');
expect(tree.includes('responsividade a fluido com variáveis dinâmicas'), 'variáveis dinâmicas de responsividade ausentes');
expect(tree.includes('Não usar um marcador estático isolado de pré-carga como prova de hipovolemia'), 'proteção contra marcador estático isolado ausente');
expect(!tree.includes('Perfil de cabeceira que separa os tipos:'), 'classificador rígido antigo ainda está ativo');
expect(!tree.includes('pressão de pulso < 25 mmHg, enchimento capilar > 3 s e SvcO₂ < 70% apontam para hipovolêmico'), 'limiares antigos ainda classificam o subtipo');
expect(i18n.includes('¿Hay pérdida de volumen conocida o probable'), 'ES: nova pergunta de hipovolemia ausente');
expect(i18n.includes('NO separan de forma rígida el tipo de shock'), 'ES: proteção contra classificador rígido ausente');
expect(i18n.includes('variables dinámicas'), 'ES: responsividade dinâmica ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ Choque hipovolemia: 14 travas ESICM 2025 aprovadas para avaliação integrada e responsividade dinâmica.');
