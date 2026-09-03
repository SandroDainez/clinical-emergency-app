#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tce-decision-tree.ts'), 'utf8');
const transitions = fs.readFileSync(path.join(root, 'lib/clinical-transition-contracts.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tce.ts'), 'utf8');

const checks = [
  ['legacy SjvO2 >55 target removed', !tree.includes('saturação venosa jugular acima de 55%')],
  ['BTF SjvO2 <50 threshold to avoid explicit', tree.includes('SjvO₂ < 50% como limiar a evitar')],
  ['PbtO2 not presented as universal outcome threshold', tree.includes('não sustenta um limiar universal de desfecho')],
  ['autoregulation tools explicitly adjunctive', tree.includes('podem ajudar a individualizar a PPC') && tree.includes('não devem substituir o quadro clínico')],
  ['neurosurgical handoff packet visible', tree.includes('HANDOFF NEUROCIRÚRGICO: informar explicitamente último Glasgow e pupilas')],
  ['handoff includes CT time and hemodynamics', tree.includes('achado e horário da TC') && tree.includes('tendência de PAS/PAM e oxigenação')],
  ['handoff includes ICP/CPP and osmotherapy', tree.includes('tendência da PIC/PPC') && tree.includes('última dose/horário de osmoterapia')],
  ['handoff includes ventilation sedation seizure EVD', tree.includes('ventilação/PaCO₂') && tree.includes('sedação/BNM') && tree.includes('crise/antisseizure') && tree.includes('presença/configuração de EVD')],
  ['terminal transition preserves CT time', transitions.includes('"horario_tc"')],
  ['terminal transition preserves reversal and osmotherapy', transitions.includes('"reversao_antitrombotica"') && transitions.includes('"osmoterapia_ultima_dose_horario"')],
  ['terminal transition preserves ICP/CPP and EVD', transitions.includes('"pic_ppc"') && transitions.includes('"evd_configuracao"')],
  ['new multimodal translation present', i18n.includes('Neuromonitorización multimodal cuando esté disponible')],
  ['new handoff translation present', i18n.includes('HANDOFF NEUROQUIRÚRGICO: informar explícitamente último Glasgow y pupilas')],
];
let failures = 0;
for (const [label, ok] of checks) {
  if (ok) console.log(`✅ ${label}`); else { console.error(`❌ ${label}`); failures++; }
}
if (failures) { console.error(`\n❌ ${failures} falha(s)`); process.exit(1); }
console.log(`\n✅ TCE neuromonitorização/handoff — ${checks.length} verificações positivas`);
