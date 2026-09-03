#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'tce-decision-tree.ts'), 'utf8');
const failures = [];
const checks = [
  ['aspirina monoterapia excluída da regra antitrombótica', /EXCETO aspirina em monoterapia|exceto aspirina em monoterapia/],
  ['antitrombótico tratado como considerar TC, não obrigação cega', /CONSIDERAR TC mesmo sem outra indicação|considerar TC mesmo sem outro critério/],
  ['intoxicação isolada não é TC automática', /Intoxicação isolada[^\n]+não TC automática|intoxicação isolada[^\n]+não é indicação automática de TC/],
  ['deterioração neurológica exige TC imediata', /Repetir TC IMEDIATAMENTE se houver deterioração neurológica/],
  ['TC seriada estável é individualizada', /individualizar TC seriada conforme tipo\/tamanho da lesão/],
  ['sem janela fixa universal de 6–12 h', /não impor janela fixa de 6–12 h a todos/],
  ['sem regra antiga cinco pedem TC', !/ESTES CINCO PEDEM TC/.test(src)],
  ['sem intoxicação igual a TC', !/intoxicação\s*=\s*TC/i.test(src)],
];
let ok = 0;
for (const [name, rule] of checks) {
  const pass = typeof rule === 'boolean' ? rule : rule.test(src);
  if (!pass) failures.push(name); else ok++;
}
if (failures.length) {
  console.error('❌ TCE imagem 2026:');
  for (const f of failures) console.error(' - ' + f);
  process.exit(1);
}
console.log(`✅ TCE imagem 2026: ${ok} travas aprovadas.`);
