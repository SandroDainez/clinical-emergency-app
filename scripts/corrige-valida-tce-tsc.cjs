#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, 'valida-tce.cjs');
let s = fs.readFileSync(file, 'utf8');
const from = '      "tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--esModuleInterop",';
const to = '      "tsc", "--module", "node16", "--target", "es2020", "--esModuleInterop",';
if (!s.includes(from)) throw new Error('Expected --ignoreConfig invocation not found in valida-tce.cjs');
s = s.replace(from, to);
fs.writeFileSync(file, s);
console.log('✅ valida-tce: removida opção --ignoreConfig incompatível com a versão atual do TypeScript.');
