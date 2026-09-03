#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const file=path.resolve(__dirname,'valida-ventilacao.cjs');let src=fs.readFileSync(file,'utf8');
const before='    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",';
const after='    "tsc", "--ignoreConfig", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",';
if(!src.includes(after)){const n=src.split(before).length-1;if(n!==1)throw new Error(`invocação tsc do test:vm: esperado 1 alvo, encontrados ${n}`);src=src.replace(before,after);fs.writeFileSync(file,src);}
console.log('✅ test:vm: TypeScript CLI usa --ignoreConfig ao compilar arquivo explícito.');
