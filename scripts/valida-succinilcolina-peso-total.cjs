#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const doses = fs.readFileSync(path.join(root, 'lib/doses-isr.ts'), 'utf8');
const sed = fs.readFileSync(path.join(root, 'sedation-engine.ts'), 'utf8');
const es = fs.readFileSync(path.join(root, 'lib/i18n/modules/sedacao.ts'), 'utf8');
const falhas=[]; let ok=0;
function tem(h,n,l){if(!h.includes(n)) falhas.push(l); else ok++;}
function naoTem(h,n,l){if(h.includes(n)) falhas.push(l); else ok++;}

tem(doses, 'succinilcolina: { min: 1, max: 1.5 }', 'Fonte numérica deve manter 1–1,5 mg/kg.');
tem(doses, 'em obesidade, calcular pelo peso corporal total/real', 'Fonte textual deve declarar peso corporal total/real na obesidade.');
naoTem(doses, 'obeso: 2', 'Não pode reaparecer dose automática de 2 mg/kg para obesidade.');
naoTem(doses, 'SUCCINILCOLINA_TETO_MG', 'Não pode reaparecer teto IV absoluto de 200 mg sem fonte.');
naoTem(sed, '2 mg/kg em obeso', 'Sedoanalgesia não pode recomendar 2 mg/kg só por obesidade.');
naoTem(sed, 'TETO 200 mg', 'Sedoanalgesia não pode impor teto IV de 200 mg.');
tem(sed, 'peso corporal total/real', 'Sedoanalgesia deve declarar descritor de peso na obesidade.');
tem(sed, 'frascos de 100 mg e 500 mg', 'Fonte de apresentação deve reconhecer as duas apresentações brasileiras.');
tem(sed, '500 mg não deve ser tratada como equivalente sem conferir a reconstituição', 'App deve alertar que a apresentação de 500 mg muda concentração após reconstituição.');
tem(es, 'peso corporal total/real', 'Tradução ES deve preservar o descritor de peso.');

if(falhas.length){console.error('\nSuccinilcolina/peso total — falhas:\n');for(const f of falhas)console.error(`❌ ${f}`);process.exit(1);}
console.log(`\n✅ Succinilcolina/peso total: ${ok} verificações aprovadas.\n`);
