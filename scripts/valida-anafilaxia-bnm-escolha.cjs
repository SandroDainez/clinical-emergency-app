#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'lib/doses-isr.ts'), 'utf8');
const falhas=[]; let ok=0;
function tem(n,l){if(!src.includes(n)) falhas.push(l); else ok++;}
function naoTem(n,l){if(src.includes(n)) falhas.push(l); else ok++;}

tem('WAO/EAACI não elegem um bloqueador neuromuscular específico', 'Deve ficar explícito que WAO/EAACI não elegem BNM específico.');
tem('Succinilcolina é opção quando não há contraindicação; rocurônio 1,2 mg/kg é alternativa válida', 'As duas opções devem permanecer contextuais.');
tem('Sugamadex reverte o bloqueio, mas não substitui adrenalina', 'Sugamadex não pode ser apresentado como tratamento substituto da anafilaxia.');
tem('não deve ser apresentado como terapia estabelecida da reação alérgica ao rocurônio', 'Incerteza sobre sugamadex na anafilaxia por rocurônio deve permanecer explícita.');
naoTem('SUCCINILCOLINA é a escolha padrão na anafilaxia/angioedema de via aérea', 'Não pode reaparecer hierarquia não suportada para succinilcolina.');
naoTem('Rocurônio SOMENTE se houver contraindicação à succinilcolina', 'Rocurônio não pode ser limitado a contraindicação da succinilcolina sem diretriz.');
naoTem('sugamadex 16 mg/kg é MANDATÓRIO à beira do leito', 'Sugamadex não pode ser regra universal mandatória fora de plano contextual de reversão.');
tem('Bloqueadores neuromusculares também podem ser desencadeantes de anafilaxia perioperatória', 'Risco dos próprios BNM deve permanecer declarado.');

if(falhas.length){console.error('\nAnafilaxia/BNM — falhas:\n');for(const f of falhas)console.error(`❌ ${f}`);process.exit(1);}
console.log(`\n✅ Anafilaxia/BNM: ${ok} verificações aprovadas.\n`);
