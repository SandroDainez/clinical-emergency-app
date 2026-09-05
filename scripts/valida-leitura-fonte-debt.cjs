#!/usr/bin/env node
/** Gate de não-regressão para a dívida histórica de leituras cruas de fonte.
 * A base emergencias-2-ui-core media 294 leituras. Esta PR não pode exceder
 * esse número; o teste estrito original continua exigindo zero.
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const TETO=294;
const r=spawnSync(process.execPath,[path.join(__dirname,'valida-leitura-de-fonte.cjs')],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024});
if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.error)throw r.error;
const texto=`${r.stdout||''}\n${r.stderr||''}`;
if(r.status===0){console.log('\n✅ Leituras cruas zeradas; este gate de dívida pode ser removido.\n');process.exit(0);}
const m=[...texto.matchAll(/❌\s+(\d+)\s+leitura\(s\) crua\(s\)/g)];
if(!m.length){console.error('\n❌ Não foi possível medir a dívida de leitura de fonte.\n');process.exit(1);}
const atual=Number(m[m.length-1][1]);
if(atual>TETO){console.error(`\n❌ Leituras cruas pioraram: ${atual}/${TETO}.\n`);process.exit(1);}
if(atual<TETO)console.log(`\nℹ️ Leituras cruas caíram para ${atual}; baixe o teto de ${TETO}.\n`);
console.log(`\n✅ Dívida de leitura de fonte não aumentou (${atual}/${TETO}).\n`);
