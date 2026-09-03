#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, 'valida-ventilacao.cjs');
let s = fs.readFileSync(file, 'utf8');
const from = '    "tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--resolveJsonModule",';
const to = '    "tsc", "--module", "node16", "--target", "es2020", "--resolveJsonModule",';
if (!s.includes(from)) throw new Error('Expected --ignoreConfig invocation not found in valida-ventilacao.cjs');
s = s.replace(from, to);
fs.writeFileSync(file, s);
console.log('✅ valida-ventilacao: removida opção --ignoreConfig incompatível com TypeScript atual.');
