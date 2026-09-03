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
['VTE requires stable imaging and risk',/imagem de controle estável e baixo risco de progressão hemorrágica/],
['VTE 24-48 not automatic clock',/não usar 24–48 h como relógio automático/],
['EEG duration individualized',/A duração deve seguir probabilidade pré-teste, achados iniciais, sedação e evolução/],
['EEG 24h baseline and longer selected',/pelo menos 24 h[^\n]+48 h ou mais/],
['old fixed coma 48h statement absent',!/paciente em coma pode exigir 48 h de monitorização/.test(src)]
];
for(const [name,rule] of checks){const pass=typeof rule==='boolean'?rule:rule.test(src);if(pass)ok++;else failures.push(name);}if(failures.length){console.error('❌ TCE monitorização UTI 2026:');for(const f of failures)console.error(' - '+f);process.exit(1);}console.log(`✅ TCE monitorização UTI 2026: ${ok} travas aprovadas.`);
