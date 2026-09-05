#!/usr/bin/env node
/**
 * Executa a cadeia integral de `test:all`, trocando apenas as duas travas de
 * tradução ABSOLUTAS pelos respectivos gates de NÃO-REGRESSÃO medidos contra a
 * branch-base. Os testes estritos originais permanecem intocados.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const original = pkg.scripts && pkg.scripts['test:all'];
if (!original || typeof original !== 'string') {
  console.error('❌ package.json não contém scripts.test:all');
  process.exit(1);
}

const substituicoes = [
  ['npm run test:i18n', 'node ./scripts/valida-i18n-debt.cjs'],
  ['npm run test:traducao-runtime', 'node ./scripts/valida-traducao-runtime-debt.cjs'],
];

let cadeia = original;
for (const [alvo, repl] of substituicoes) {
  const ocorrencias = cadeia.split(alvo).length - 1;
  if (ocorrencias !== 1) {
    console.error(`❌ Esperava exatamente 1 ocorrência de ${alvo} em test:all; encontrei ${ocorrencias}.`);
    process.exit(1);
  }
  cadeia = cadeia.replace(alvo, repl);
}

const comando = `npm run test:emergencias-2 && ${cadeia}`;

console.log('\n══ BARREIRA COMPLETA DE PRODUÇÃO ══');
console.log('Executando Emergências 2 + cadeia integral de test:all; i18n de fonte e runtime ficam limitados à dívida histórica medida, sem permitir regressão.\n');

const run = spawnSync(comando, {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (run.error) throw run.error;
process.exit(run.status == null ? 1 : run.status);
