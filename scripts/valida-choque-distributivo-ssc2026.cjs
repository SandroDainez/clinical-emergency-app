#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','shock-decision-tree.ts'),'utf8');const checks=[
['distributive gate not dependent on warm skin',src.includes('mesmo que a pele não esteja quente')],
['septic shock lactate not standalone diagnosis',src.includes('lactato ajuda na estratificação')&&src.includes('não deve ser usado isoladamente')],
['antimicrobial immediate ideally within 1h in septic shock',src.includes('antimicrobiano imediatamente, idealmente em até 1 h')],
['30 mL/kg contextualized over first 3h',src.includes('pelo menos 30 mL/kg de cristaloide nas primeiras 3 h')&&src.includes('individualizando por comorbidades')],
['unstable shock permits concurrent pressor and fluids',src.includes('vasopressor pode ser iniciado em paralelo aos fluidos')],
['peripheral vasopressor allowed',src.includes('por acesso periférico enquanto se obtém acesso definitivo')],
['norepinephrine first line',src.includes('Noradrenalina é primeira linha')],
['MAP 65 initial with older adult nuance',src.includes('PAM 65 mmHg')&&src.includes('≥65 anos, 60–65 mmHg')],
['vasopressin then epinephrine ladder',src.includes('adicionar vasopressina')&&src.includes('considerar adrenalina')],
['inotrope only with cardiac dysfunction persistent hypoperfusion',src.includes('disfunção cardíaca com hipoperfusão persistente')&&src.includes('considerar dobutamina')],
['warm skin no longer universal septic phenotype',src.includes('a pele pode deixar de ser quente conforme o choque evolui')]
];let f=0;for(const [n,o] of checks){if(o)console.log('✅ '+n);else{console.error('❌ '+n);f++}}if(f)process.exit(1);console.log(`\n✅ Choque distributivo SSC 2026 — ${checks.length} travas aprovadas`);
