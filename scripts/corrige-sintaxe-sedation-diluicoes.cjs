#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'components/protocol-screen/sedation-calculator-screen.tsx');
let src = fs.readFileSync(file, 'utf8');

const broken = '{tr("Nenhuma diluição salva. Monte a sua abaixo (ampolas + diluente + tipo) e toque em "+ Salvar atual".")}';
const fixed = '{tr(\'Nenhuma diluição salva. Monte a sua abaixo (ampolas + diluente + tipo) e toque em "+ Salvar atual".\')}';

if (!src.includes(broken) && !src.includes(fixed)) {
  throw new Error('Trecho quebrado da mensagem de diluição não foi localizado.');
}
if (src.includes(broken)) src = src.replace(broken, fixed);

fs.writeFileSync(file, src);
console.log('✅ Sintaxe da mensagem de diluições da calculadora de sedação corrigida.');
