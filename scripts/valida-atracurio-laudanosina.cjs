#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'sedation-engine.ts'), 'utf8');
const es = fs.readFileSync(path.join(root, 'lib/i18n/modules/sedacao.ts'), 'utf8');
const falhas = [];
let ok = 0;
function tem(h, n, l){ if(!h.includes(n)) falhas.push(l); else ok++; }
function naoTem(h,n,l){ if(h.includes(n)) falhas.push(l); else ok++; }

tem(src, 'Laudanosina pode acumular em infusões prolongadas', 'Atracúrio deve manter o alerta de acúmulo de laudanosina.');
tem(src, 'contribuição causal da laudanosina permanece incerta', 'Atracúrio deve explicitar incerteza de causalidade humana.');
tem(src, 'convulsões são demonstrados em animais', 'Atracúrio deve distinguir evidência animal da humana.');
naoTem(src, 'Laudanosina acumula em IRA/IH (risco de convulsão)', 'Formulação causal antiga não pode reaparecer.');
tem(es, 'la contribución causal de la laudanosina sigue siendo incierta', 'Tradução ES deve preservar a incerteza de causalidade.');

if(falhas.length){ console.error('\nAtracúrio/laudanosina — falhas:\n'); for(const f of falhas) console.error(`❌ ${f}`); process.exit(1); }
console.log(`\n✅ Atracúrio/laudanosina: ${ok} verificações aprovadas.\n`);
