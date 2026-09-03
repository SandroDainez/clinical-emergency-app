#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'shock-decision-tree.ts'),'utf8');
const i18n=fs.readFileSync(path.join(root,'lib/i18n/modules/choque.ts'),'utf8');
const checks=[
['lactate not diagnostic in isolation',src.includes('não deve ser usado isoladamente para fechar o diagnóstico')],
['septic MAP 65 labeled as reference not universal',src.includes('No choque séptico, PAM 65 mmHg é o alvo inicial de referência')],
['fixed lactate normalization target removed',!src.includes('normalização do lactato (alvo < 2 mmol/L')],
['fixed 10 percent hourly lactate fall removed',!src.includes('queda esperada ≥ 10% por hora')],
['dynamic fluid responsiveness preferred',src.includes('Preferir variáveis dinâmicas')&&src.includes('elevação passiva das pernas')],
['reassessment after each fluid intervention',src.includes('reavaliar perfusão e sinais de congestão após cada intervenção')],
['arterial line tied to persistent shock or vasopressors',src.includes('choque não responder à terapia inicial e/ou houver necessidade de infusão vasopressora')],
['fixed norepinephrine arterial-line threshold removed',!src.includes('noradrenalina passar de 0,3–0,5 mcg/kg/min')],
['universal lab panel removed',!src.includes('Exames para todos:')],
['D-dimer not universal',src.includes('Não pedir D-dímero, fibrinogênio, troponina, radiografia ou ecocardiograma como painel obrigatório')],
['echo POCUS first-line imaging',src.includes('Ecocardiografia/POCUS é a modalidade de imagem de primeira linha')],
['ultrasound not standalone diagnosis',src.includes('não usar um achado ultrassonográfico isolado como diagnóstico definitivo')],
['MAP translation present',i18n.includes('Perfusión y presión: usar la PAM como objetivo inicial')],
['POCUS translation present',i18n.includes('La ecocardiografía/POCUS es la modalidad de imagen de primera línea')]
];
let fail=0;for(const [n,ok] of checks){if(ok)console.log('✅ '+n);else{console.error('❌ '+n);fail++;}}if(fail)process.exit(1);console.log(`\n✅ Choque ESICM 2025 — ${checks.length} verificações positivas`);
