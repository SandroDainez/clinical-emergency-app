#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const t=fs.readFileSync(path.resolve(__dirname,'..','ventilation-decision-tree.ts'),'utf8');const c=[];const ok=(n,v)=>c.push([n,!!v]);
ok('segurança não usa DP 15 como dupla obrigatória',t.includes('A mecânica ventilatória está segura para o cenário atual?')&&t.includes('não é corte universal isolado'));
ok('elegibilidade sem números universais',t.includes('Cortes isolados não substituem a avaliação clínica'));
ok('TRE com ou sem PS',t.includes('TRE pode ser realizado com ou sem pressão de suporte'));
ok('RSBI não obrigatório',t.includes('IRRS/RSBI não é obrigatório')&&t.includes('AARC 2024 não exige seu cálculo'));
ok('sucesso TRE por tolerância integrada',t.includes('não por um único corte'));
ok('falha TRE sem relógio universal',t.includes('Interromper o TRE se houver deterioração sustentada'));
ok('cuff leak só alto risco',t.includes('Teste de cuff leak NÃO é rotina para todos'));
ok('corticoide pelo menos 4h, sem esquema fixo',t.includes('pelo menos 4 h antes')&&!t.includes('dexametasona 8 mg IV/6 h × 24 h'));
ok('estridor sem espera 30 min',!t.includes('reintubar se sem melhora em 30 min')&&t.includes('não esperar um intervalo fixo'));
ok('falha TRE sem descanso obrigatório 24h',!t.includes('descansar 24 h')&&!t.includes('por ~24 h'));
ok('avaliação diária padronizada',t.includes('avaliação padronizada de prontidão pelo menos diariamente'));
const f=c.filter(([,v])=>!v);if(f.length){console.error('\n❌ VM/liberação-extubação 2026:');for(const [n] of f)console.error('   - '+n);process.exit(1);}console.log(`\n✅ VM/liberação-extubação 2026: ${c.length} verificações aprovadas.\n`);
