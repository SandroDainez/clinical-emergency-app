#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const src=fs.readFileSync(path.join(root,'tce-decision-tree.ts'),'utf8');const failures=[];let ok=0;
const checks=[
['BTF current evidence caveat for classic ICP rules',/REAPRESENTADAS pela 4ª edição[^\n]+não atendem aos padrões atuais de evidência/],
['ICP decision not isolated checklist',/não um checklist isolado/],
['noninvasive methods treated as trends',/acompanhar TENDÊNCIAS/],
['no universal ONSD PI NPi cutoff',/Não usar PI, diâmetro da bainha ou NPi com um único cutoff universal/],
['old PI 2.13 cutoff absent',!/índice de pulsatilidade acima de 2,13/.test(src)],
['old ONSD 6mm cutoff absent',!/bainha do nervo óptico ao ultrassom acima de 6 mm/.test(src)],
['old NPi3 cutoff absent',!/NPi abaixo de 3/.test(src)],
['low-risk VTE tied to stable follow-up CT',/BAIXO risco[^\n]+em até 24 h se a TC de controle não mostrar progressão/],
['moderate-high VTE tied to stable follow-up CT',/MODERADO\/ALTO[^\n]+24–48 h se a TC de controle estiver estável/],
['postoperative VTE individualized by stable postop CT',/Após craniotomia\/craniectomia[^\n]+24–48 h se a hemorragia estiver estável na TC pós-operatória/],
['LMWH preferred when no contraindication',/Preferir heparina de baixo peso molecular à heparina não fracionada/],
['EEG duration individualized',/Interromper ou prolongar conforme achados, evolução e redução dos sedativos/],
['EEG 24h baseline and longer selected',/pelo menos 24 h[^\n]+24–48 h ou mais pode ser necessário/],
['old fixed coma 48h statement absent',!/paciente em coma pode exigir 48 h de monitorização/.test(src)],
['multimodal monitoring remains adjunctive',/Neuromonitorização multimodal[^\n]+complementar PIC\/PPC, TC e exame neurológico/],
['PbtO2 not universal standalone threshold',/PbtO₂[^\n]+não deve ser apresentado como cutoff universal isolado/],
['SjvO2 below 50 treated as avoidable threshold',/SjvO₂ < 50%[^\n]+limiar a evitar/]
];
for(const [name,rule] of checks){const pass=typeof rule==='boolean'?rule:rule.test(src);if(pass)ok++;else failures.push(name);}if(failures.length){console.error('❌ TCE monitorização UTI 2026:');for(const f of failures)console.error(' - '+f);process.exit(1);}console.log(`✅ TCE monitorização UTI 2026: ${ok} travas aprovadas.`);
