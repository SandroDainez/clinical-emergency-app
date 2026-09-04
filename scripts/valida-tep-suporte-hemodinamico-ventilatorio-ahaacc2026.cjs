#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!tree.includes('máx 500–1.000 mL'), 'volume liberal antigo de até 1.000 mL ainda presente');
expect(!tree.includes('norepinefrina 0,1–1 mcg/kg/min'), 'faixa ampla antiga de norepinefrina ainda presente');
expect(tree.includes('pequenos bolus de até 500 mL com reavaliação imediata'), 'limite/reavaliação de volume até 500 mL ausente');
expect(tree.includes('Volume NÃO é rotina'), 'proteção contra expansão volêmica rotineira ausente');
expect(tree.includes('norepinefrina é geralmente o vasopressor de escolha'), 'norepinefrina como escolha no choque ausente');
expect(tree.includes('acima de cerca de 15 mcg/min de norepinefrina, a resistência vascular pulmonar pode aumentar'), 'cautela de escalada de norepinefrina/PVR ausente');
expect(tree.includes('considerar segundo vasopressor'), 'estratégia de segundo vasopressor ausente');
expect(tree.includes('preferir cânula nasal de alto fluxo'), 'HFNC preferida na hipoxemia moderada-grave ausente');
expect(tree.includes('Evitar sedação profunda e ventilação mecânica salvo indicação clínica forte'), 'proteção contra sedação/IOT banalizada ausente');
expect(tree.includes('vasopressor/inotrópico e estratégia de resgate hemodinâmico imediatamente disponíveis'), 'resgate hemodinâmico pré-intubação ausente');
expect(tree.includes('em categorias C–E, sedação profunda e ventilação mecânica devem ser evitadas salvo indicação clínica'), 'regra C-E de ventilação/sedação ausente');
expect(tree.includes('vasopressores, inotrópicos e/ou VA-ECMO devem estar prontamente disponíveis'), 'suporte avançado antes de sedação/intubação ausente');
expect(tree.includes('Em C2–E, vasodilatador pulmonar inalatório pode ser considerado'), 'vasodilatador pulmonar inalatório C2-E ausente');
expect(i18n.includes('bolos pequeños de hasta 500 mL'), 'ES: volume cauteloso até 500 mL ausente');
expect(i18n.includes('aproximadamente 15 mcg/min'), 'ES: cautela de norepinefrina ausente');
expect(i18n.includes('vasopresores, inotrópicos y/o VA-ECMO'), 'ES: suporte pré-intubação ausente');
expect(i18n.includes('vasodilatador pulmonar inhalado'), 'ES: vasodilatador inalatório ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP AHA/ACC 2026: 17 travas de suporte hemodinâmico e ventilatório aprovadas.');
