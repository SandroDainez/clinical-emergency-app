#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tce-decision-tree.ts'), 'utf8');
const hic = fs.readFileSync(path.join(root, 'lib/i18n/modules/tce-hic.ts'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'lib/i18n/modules/frases-montadas-em-runtime.ts'), 'utf8');
const alvos = fs.readFileSync(path.join(root, 'lib/alvos-tce.ts'), 'utf8');
const failures = [];
let ok = 0;
function yes(label, cond) { if (cond) { console.log(`✅ ${label}`); ok++; } else failures.push(label); }
function no(label, cond) { yes(label, !cond); }

yes('herniation check does not delay urgent therapy', tree.includes('NÃO deve atrasar osmoterapia, drenagem de LCR quando disponível nem acionamento neurocirúrgico'));
yes('HTS preferred over mannitol remains explicit', tree.includes('sugere solução hipertônica sobre manitol como manejo inicial'));
yes('3% HTS weight-based institutional regimen preserved', tree.includes('NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min'));
yes('concentrated saline has no universal fixed volume', tree.includes('não transformar um volume fixo em recomendação universal'));
yes('Na 155–160 is safety ceiling, not therapeutic target', tree.includes('faixas superiores de segurança descritas pela NCS, não como metas terapêuticas a perseguir'));
yes('chloride safety range included', tree.includes('Cl 110–115 mEq/L'));
yes('mannitol remains 0.25–1 g/kg intermittent response-guided', tree.includes('0,25–1 g/kg') && tree.includes('Repetição deve ser guiada pela resposta/PIC e segurança, não por relógio fixo'));
yes('osmolar gap has no mandatory cutoff', tree.includes('NÃO há evidência suficiente para um cutoff obrigatório'));
yes('EVD drainage has no fixed universal volume', tree.includes('Não prescrever volume fixo universal'));
yes('EVD open-system ICP limitation is explicit', tree.includes('Quando o EVD estiver aberto para drenagem, a leitura de PIC pelo próprio sistema não representa a PIC verdadeira'));
no('legacy fixed EVD 5–10 mL recipe removed', tree.includes('drenar 5–10 mL de líquor'));
no('legacy 20% NaCl 40 mL/5 min recipe removed', tree.includes('NaCl 20% 40 mL IV em 5 min'));
no('legacy fixed q4–6h osmotherapy removed from live tree', /repetível a cada 4–6 h/.test(tree));
yes('new HIC strings translated', hic.includes('faixas superiores de segurança') && hic.includes('rangos superiores de seguridad') && hic.includes('monitor independiente'));
yes('neuroprotection runtime translation fallback present', runtime.includes('SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como alvo inicial)'));
yes('source target now SpO2 94 after migration', alvos.includes('spo2: "≥ 94%"'));

console.log(`\nTCE HIC/OSMOTERAPIA — ${ok} verificações positivas`);
if (failures.length) {
  for (const f of failures) console.error(`❌ ${f}`);
  console.error(`\n❌ ${failures.length} problema(s)`);
  process.exit(1);
}
console.log('✅ bloco HIC/osmoterapia consistente com o recorte ACS/NCS e sem receitas universais perigosas.');
