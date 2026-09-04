#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'shock-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/choque-einstein.ts'), 'utf8');

const failures = [];
let ok = 0;
const expect = (name, condition) => condition ? ok++ : failures.push(name);

expect('limiar rígido de 30% ausente', !/mantém a PA normal até que 30% da volemia/.test(tree));
expect('PA normal não exclui hemorragia', /pressão arterial normal NÃO exclui hemorragia importante/.test(tree));
expect('sem percentual fixo como limiar diagnóstico', /não use um percentual fixo de perda volêmica como limiar diagnóstico/.test(tree));
expect('avaliação multimodal inclui perfusão', /Integre perfusão periférica/.test(tree));
expect('avaliação multimodal inclui tendência hemodinâmica', /tendência hemodinâmica/.test(tree));
expect('avaliação multimodal inclui mecanismo\/fonte', /mecanismo\/fonte/.test(tree));
expect('avaliação multimodal inclui resposta à ressuscitação', /resposta à ressuscitação/.test(tree));
expect('tradução espanhola presente', /una presión arterial normal NO excluye una hemorragia importante/.test(i18n));

if (failures.length) {
  console.error('❌ Choque hemorrágico — PA compensada:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log(`✅ Choque hemorrágico — PA compensada: ${ok} travas aprovadas.`);
