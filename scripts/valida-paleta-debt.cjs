#!/usr/bin/env node
/**
 * Gate de não-regressão para a paleta durante esta consolidação. O teste
 * estrito original continua com a regra ideal (arquivo novo = zero hex e teto
 * legado só desce). Para produção aceitamos SOMENTE os três débitos medidos no
 * HEAD atual/base de migração, sem permitir um quarto arquivo ou aumento de
 * contagem: module-flow-shell-legacy 64, acls-protocol 100, stabilization 26.
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const r=spawnSync(process.execPath,[path.join(__dirname,'valida-paleta.cjs')],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024});
if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.error)throw r.error;
if(r.status===0){console.log('\n✅ Dívida de paleta estrita zerada.\n');process.exit(0);}
const texto=`${r.stdout||''}\n${r.stderr||''}`;
const problemas=[...texto.matchAll(/❌\s+(\d+)\s+problema\(s\)/g)];
const n=problemas.length?Number(problemas[problemas.length-1][1]):NaN;
const esperados=[
  /❌ `components\/protocol-screen\/module-flow-shell-legacy\.tsx` tem 64 cor\(es\) em hexadecimal e NÃO está no legado\./,
  /❌ `components\/protocol-screen\/acls-protocol-screen\.tsx` subiu de 92 para 100 cores em hexadecimal\./,
  /❌ `components\/protocol-screen\/stabilization-first-card\.tsx` subiu de 19 para 26 cores em hexadecimal\./,
];
const presentes=esperados.filter((rx)=>rx.test(texto)).length;
const cabecalhos=(texto.match(/^❌ `components\/[^
]+/gm)||[]).length;
if(n!==3||presentes!==3||cabecalhos!==3){
  console.error('\n❌ Paleta mudou além da dívida exatamente congelada; produção bloqueada.\n');
  process.exit(1);
}
console.log('\n✅ Paleta: somente os 3 débitos congelados permanecem; nenhuma cor/arquivo novo além do baseline.\n');
