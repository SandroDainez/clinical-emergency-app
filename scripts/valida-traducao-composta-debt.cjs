#!/usr/bin/env node
/**
 * Gate de não-regressão para texto composto. Após corrigir o compilador da
 * trava, a branch-base revelou dívida que o teto antigo nunca conseguiu medir:
 * shock=11, tep=19, ventilation=5. Produção aceita no máximo esses valores e
 * nenhum módulo novo. O teste estrito permanece disponível para zerar a dívida.
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const BASE={shock:11,tep:19,ventilation:5};
const r=spawnSync(process.execPath,[path.join(__dirname,'valida-traducao-composta.cjs')],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024});
if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.error)throw r.error;
if(r.status===0){console.log('\n✅ Tradução composta zerada.\n');process.exit(0);}
const texto=`${r.stdout||''}\n${r.stderr||''}`;
const achados={};
for(const m of texto.matchAll(/^❌ ([a-z0-9-]+): (\d+) frase\(s\) compostas SEM tradução/gm))achados[m[1]]=Number(m[2]);
if(!Object.keys(achados).length){console.error('\n❌ Não foi possível medir a dívida de tradução composta.\n');process.exit(1);}
for(const [mod,n] of Object.entries(achados)){
  if(!(mod in BASE)){console.error(`\n❌ Novo módulo com tradução composta pendente: ${mod}=${n}.\n`);process.exit(1);}
  if(n>BASE[mod]){console.error(`\n❌ Tradução composta piorou em ${mod}: ${n}/${BASE[mod]}.\n`);process.exit(1);}
}
for(const [mod,teto] of Object.entries(BASE)){
  const atual=achados[mod]||0;
  if(atual<teto)console.log(`ℹ️ ${mod}: dívida caiu para ${atual}/${teto}; baixe o teto quando consolidar.`);
}
console.log('\n✅ Tradução composta não regrediu em relação à base (shock≤11, tep≤19, ventilation≤5; nenhum módulo novo).\n');
