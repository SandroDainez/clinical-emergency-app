#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','ventilation-decision-tree.ts'),'utf8');
const checks=[
 ['pneumotórax não fixa 14G/2º EIC como regra única',!src.includes('agulha 14G 2º EIC LMC')],
 ['pneumotórax reconhece 4º–5º EIC/axilar e 2º EIC/MCL conforme contexto',src.includes('4º–5º EIC linha axilar anterior ou 2º EIC linha médio-clavicular')],
 ['toracostomia aberta/finger aparece em instabilidade extrema',src.includes('toracostomia aberta/finger')],
 ['DP não é corte universal isolado',src.includes('15 cmH₂O não deve funcionar como corte universal isolado')],
 ['recrutamento de alta pressão não é rotina',src.includes('Manobras de recrutamento de alta pressão não são rotina')],
 ['recrutar com cautela legado saiu',!src.includes('recrutar com cautela')],
 ['auto-PEEP não exclui pneumotórax por resposta à manobra',src.includes('Não assumir auto-PEEP se a instabilidade persistir')],
 ['compressão manual do tórax é contextual',src.includes('compressão manual do tórax pode ser considerada por equipe experiente')],
];
const fail=checks.filter(([,ok])=>!ok);if(fail.length){console.error('\n❌ VM troubleshooting 2026:');for(const [n] of fail)console.error('   - '+n);process.exit(1);}console.log(`✅ VM troubleshooting 2026: ${checks.length} travas aprovadas.`);
