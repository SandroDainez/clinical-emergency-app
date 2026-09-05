#!/usr/bin/env node
/**
 * Executa a mesma cadeia de `test:all`, preservando inclusive a validação
 * completa de tradução em runtime, mas troca apenas a varredura i18n ABSOLUTA
 * pelo gate de não-regressão de dívida usado para produção.
 *
 * O `test:i18n` original permanece intocado e estrito para a frente de trabalho
 * que vai zerar as traduções históricas.
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

const alvo = 'npm run test:i18n';
const ocorrencias = original.split(alvo).length - 1;
if (ocorrencias !== 1) {
  console.error(`❌ Esperava exatamente 1 ocorrência de ${alvo} em test:all; encontrei ${ocorrencias}.`);
  process.exit(1);
}

const cadeia = original.replace(alvo, 'node ./scripts/valida-i18n-debt.cjs');
const comando = `npm run test:emergencias-2 && ${cadeia}`;

console.log('\n══ BARREIRA COMPLETA DE PRODUÇÃO ══');
console.log('Executando pretest: Emergências 2 + cadeia integral de test:all, com i18n congelado em dívida não crescente.\n');

const run = spawnSync(comando, {
  cwd: ROOT,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (run.error) throw run.error;
process.exit(run.status == null ? 1 : run.status);
