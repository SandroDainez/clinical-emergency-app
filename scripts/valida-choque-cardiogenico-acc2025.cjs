#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','shock-decision-tree.ts'),'utf8');const checks=[
['RV volume not automatic',src.includes('volume NÃO é tratamento automático')],
['RV small bolus only if underfilled',src.includes('testar pequena alíquota de fluido')],
['norepinephrine first line when hypotensive',src.includes('Na hipotensão, usar noradrenalina como vasopressor de primeira linha')],
['inotrope tied to persistent low output',src.includes('adicionar inotrópico quando baixo débito persistir')],
['fluids only with evidence of hypovolemia/responsiveness',src.includes('Dar fluido apenas quando houver evidência de hipovolemia ou provável responsividade')],
['MCS not universal routine',src.includes('Suporte circulatório mecânico NÃO é rotina universal')],
['early shock-team transfer preserved',src.includes('transferência precoce se o centro não dispuser de suporte avançado')],
['normotensive shock inotrope contextualized',src.includes('baixo débito objetivamente documentado com pressão preservada')],
['levosimendan not treated as universal equivalent',src.includes('Não tratar levosimendana como escolha equivalente universal')],
['old RV liberal-volume wording absent',!src.includes('responde bem à infusão de volume — o oposto do IAM de VE')],
['generic BIA Impella ECMO list removed',!src.includes('considerar suporte mecânico (BIA/Impella/ECMO)')]
];let f=0;for(const [n,o] of checks){if(o)console.log('✅ '+n);else{console.error('❌ '+n);f++}}if(f)process.exit(1);console.log(`\n✅ Choque cardiogênico ACC 2025 — ${checks.length} travas aprovadas`);
