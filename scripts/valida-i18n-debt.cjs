#!/usr/bin/env node
/**
 * Gate de regressão para o deploy enquanto a dívida histórica de tradução é
 * eliminada separadamente.
 *
 * `npm run test:i18n` continua ESTRITO e continua falhando enquanto existir
 * qualquer literal sem tradução. Este wrapper não muda essa promessa.
 * Ele serve apenas para a barreira de produção: a branch que estamos integrando
 * não pode aumentar a dívida existente na base e, após as traduções desta PR,
 * o teto medido é 561. O teto só pode descer.
 */
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const TETO = 561;
const run = spawnSync(process.execPath, [path.join(__dirname, 'varredura-pt.cjs')], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);
if (run.error) throw run.error;

const texto = `${run.stdout || ''}\n${run.stderr || ''}`;
const matches = [...texto.matchAll(/SEM TRADUÇÃO:\s*(\d+)/g)];
if (!matches.length) {
  console.error('\n❌ Não foi possível medir a dívida de tradução.\n');
  process.exit(1);
}

const atual = Number(matches[matches.length - 1][1]);
if (atual > TETO) {
  console.error(`\n❌ Dívida de tradução aumentou: ${atual}/${TETO}. O teto só pode descer.\n`);
  process.exit(1);
}
if (atual < TETO) {
  console.log(`\nℹ️ Dívida de tradução caiu para ${atual}. Baixe o TETO de ${TETO} para ${atual} antes do próximo deploy.\n`);
}
console.log(`\n✅ Dívida histórica de tradução não aumentou (${atual}/${TETO}).\n`);
process.exit(0);
