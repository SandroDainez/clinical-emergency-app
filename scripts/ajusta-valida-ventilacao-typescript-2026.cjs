#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const file=path.resolve(__dirname,'valida-ventilacao.cjs');let src=fs.readFileSync(file,'utf8');
const oldHead='    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",';
const newHead='    "tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--resolveJsonModule",';
if(!src.includes(newHead)){const n=src.split(oldHead).length-1;if(n!==1)throw new Error(`cabeçalho tsc do test:vm: esperado 1 alvo, encontrados ${n}`);src=src.replace(oldHead,newHead);}
src=src.replace('    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",','    "--esModuleInterop", "--moduleResolution", "node16", "--skipLibCheck",');
fs.writeFileSync(file,src);
console.log('✅ test:vm: TypeScript CLI usa --ignoreConfig + module/moduleResolution node16.');
