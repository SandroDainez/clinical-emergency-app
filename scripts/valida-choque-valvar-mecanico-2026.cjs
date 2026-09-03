#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','shock-decision-tree.ts'),'utf8');const checks=[
['urgent echo and heart team',src.includes('ecocardiografia imediata')&&src.includes('Heart Team/equipe de choque precocemente')],
['pharmacology framed as bridge',src.includes('a terapia farmacológica é ponte para correção definitiva')],
['rigid dopamine AR recipe removed',!src.includes('Insuficiência aórtica: dopamina')],
['rigid MS amiodarone recipe removed',!src.includes('Estenose mitral: noradrenalina ± amiodarona')],
['routine IABP MR recipe removed',!src.includes('Insuficiência mitral: noradrenalina ± dobutamina ± balão intra-aórtico')],
['dynamic LVOTO contextualized',src.includes('obstrução dinâmica da via de saída do VE')&&src.includes('guiada por ecocardiografia')],
['mechanical MI complications require definitive intervention',src.includes('ruptura de músculo papilar')&&src.includes('cirurgia/intervenção estrutural imediata')],
['MCS described as selected bridge',src.includes('suporte vasoativo/MCS')&&src.includes('ponte selecionada pela anatomia e pelo fenótipo')],
['critical valve shock directs to valve center',src.includes('Heart Valve Centre/Heart Team')]
];let f=0;for(const [n,o] of checks){if(o)console.log('✅ '+n);else{console.error('❌ '+n);f++}}if(f)process.exit(1);console.log(`\n✅ Choque valvar/mecânico 2026 — ${checks.length} travas aprovadas`);
