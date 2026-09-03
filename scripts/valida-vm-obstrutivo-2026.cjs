#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','ventilation-decision-tree.ts'),'utf8');
const checks=[
 ['sem PaCO2 60–70 como alvo fixo',!src.includes('PaCO₂ tolerar 60–70')],
 ['hipercapnia permissiva sem PaCO2 universal',src.includes('não existe PaCO₂-alvo universal')],
 ['PEEP externa não é fórmula universal',src.includes('PEEP externa: não aplicar uma fórmula universal')],
 ['PEEP externa contextualiza esforço/trigger e PEEPi',src.includes('DPOC com esforço espontâneo, auto-PEEP e dificuldade de disparo')&&src.includes('~50–80%')],
 ['FR titulada pela expiração e auto-PEEP',src.includes('titular pela expiração completa, auto-PEEP, pH e ventilação-minuto')],
 ['fluxo expiratório deve retornar a zero',src.includes('retorno do fluxo expiratório a zero')],
 ['MgSO4 apenas grave refratária',src.includes('grave que não responde ao tratamento inicial')&&src.includes('MgSO₄ IV 2 g')],
 ['ketamina não é broncodilatador comprovado',src.includes('não deve ser apresentada como broncodilatador específico de eficácia comprovada')],
];
const f=checks.filter(([,ok])=>!ok);if(f.length){console.error('\n❌ VM obstrutivo 2026:');for(const [n] of f)console.error('   - '+n);process.exit(1);}console.log(`✅ VM obstrutivo 2026: ${checks.length} travas aprovadas.`);
