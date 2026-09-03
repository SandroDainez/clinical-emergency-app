#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','shock-decision-tree.ts'),'utf8');const checks=[
['sem bolus universal 500-1000',!src.includes('bólus inicial de 500–1000 mL de cristaloide')],
['hemorragico prioriza hemostasia e volume restritivo',src.includes('priorizar ressuscitação hemostática/hemocomponentes')&&src.includes('estratégia de volume restritiva')],
['classes ATLS não usadas como estimativa isolada',src.includes('NÃO deve estimar isoladamente a perda sanguínea nem determinar terapia')],
['permissive hypotension sem TCE 80-90/50-60',src.includes('PAS 80–90 mmHg (PAM 50–60 mmHg)')],
['TCE grave MAP 80',src.includes('TCE grave (Glasgow ≤8)')&&src.includes('PAM ≥80 mmHg')],
['sem alvo neuro Hb 9-10',!src.includes('em paciente neurológico agudo, 9–10 g/dL')],
['não esperar Hb isolada no exsanguinante',src.includes('não esperar uma hemoglobina isolada cair')],
['sem bicarbonato por cutoff isolado',!src.includes('bicarbonato de sódio 8,4% 1 mEq/kg apenas se pH < 7,1')&&src.includes('Não usar bicarbonato de sódio por um corte isolado')]
];let f=0;for(const [n,o] of checks){if(o)console.log('✅ '+n);else{console.error('❌ '+n);f++}}if(f)process.exit(1);console.log(`\n✅ Choque hemorrágico ESICM/trauma — ${checks.length} travas aprovadas`);
