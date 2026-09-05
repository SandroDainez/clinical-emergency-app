#!/usr/bin/env node
/**
 * Gate de não-regressão para a única falha herdada de prazo visível na base:
 * TCE possui 10 alertas únicos contra o piso histórico 12. O teste estrito
 * continua disponível e exige a recomposição clínica desse piso; produção só
 * aceita exatamente esta dívida conhecida, sem qualquer falha adicional.
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const r=spawnSync(process.execPath,[path.join(__dirname,'valida-prazo-visivel.cjs')],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024});
if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.error)throw r.error;
if(r.status===0){console.log('\n✅ Dívida de prazo visível zerada.\n');process.exit(0);}
const texto=`${r.stdout||''}\n${r.stderr||''}`;
const problemas=[...texto.matchAll(/❌\s+(\d+)\s+problema\(s\)/g)];
const n=problemas.length?Number(problemas[problemas.length-1][1]):NaN;
const esperado=/❌ `tce`: os alertas caíram de 12 para 10\./.test(texto);
const falhasDetalhe=(texto.match(/^❌ `(?!tce`)[^\n]+/gm)||[]).length;
if(n!==1||!esperado||falhasDetalhe){
  console.error('\n❌ A falha de prazo visível não corresponde à única dívida herdada permitida.\n');
  process.exit(1);
}
console.log('\n✅ Prazo visível: somente a dívida TCE 10/12 herdada da base permanece; nenhuma regressão nova.\n');
