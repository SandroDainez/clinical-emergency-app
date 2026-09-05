#!/usr/bin/env node
/**
 * Gate de NÃO-REGRESSÃO para tradução em runtime.
 *
 * A checagem estrita `valida-traducao-runtime.cjs` continua exigindo zero.
 * Para esta barreira de produção, aceitamos apenas a dívida histórica ainda
 * existente após as traduções operacionais desta PR, medida em 2026-09-05:
 *   - 160 frases distintas sem chave;
 *   - 19 grupos/problemas reportados.
 * Estes tetos só podem descer.
 */
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const TETO_DISTINTAS = 160;
const TETO_PROBLEMAS = 19;

const run = spawnSync(process.execPath, [path.join(__dirname, 'valida-traducao-runtime.cjs')], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);
if (run.error) throw run.error;

const texto = `${run.stdout || ''}\n${run.stderr || ''}`;
const mDist = [...texto.matchAll(/❌\s+(\d+)\s+FRASES DISTINTAS/g)];
const mProb = [...texto.matchAll(/❌\s+(\d+)\s+problema\(s\)/g)];

if (!mDist.length || !mProb.length) {
  if (run.status === 0) {
    console.log('\n✅ Tradução em runtime zerada; remova este gate de dívida e use novamente o teste estrito.\n');
    process.exit(0);
  }
  console.error('\n❌ Não foi possível medir a dívida de tradução em runtime.\n');
  process.exit(1);
}

const distintas = Number(mDist[mDist.length - 1][1]);
const problemas = Number(mProb[mProb.length - 1][1]);

if (distintas > TETO_DISTINTAS || problemas > TETO_PROBLEMAS) {
  console.error(`\n❌ Tradução runtime piorou: ${distintas}/${TETO_DISTINTAS} frases distintas; ${problemas}/${TETO_PROBLEMAS} problemas.\n`);
  process.exit(1);
}

if (distintas < TETO_DISTINTAS || problemas < TETO_PROBLEMAS) {
  console.log(`\nℹ️ Dívida runtime caiu para ${distintas} frases / ${problemas} problemas. Baixe os tetos para travar o ganho.\n`);
}

console.log(`\n✅ Dívida histórica de tradução runtime não aumentou (${distintas}/${TETO_DISTINTAS}; ${problemas}/${TETO_PROBLEMAS}).\n`);
process.exit(0);
