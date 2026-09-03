#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const t=fs.readFileSync(path.resolve(__dirname,'..','ventilation-decision-tree.ts'),'utf8');const c=[];const ok=(n,v)=>c.push([n,!!v]);
ok('pulmão normal sem números fixos universais',t.includes('parâmetros convencionais de FR/I:E/PEEP')&&!t.includes('FR 12–16; I:E 1:2; PEEP 5 cmH₂O'));
ok('SpO2 94-98 não é universal',t.includes('não impor SpO₂ 94–98% como faixa universal'));
ok('DP 15 não é universal no ramo normal',t.includes('sem corte universal isolado')&&!t.includes('driving pressure ≤ 15 — vale para todos'));
ok('fast-track 6h não é obrigação',t.includes('não deve obrigar extubação antes de critérios de segurança'));
ok('clorexidina não é bundle universal',t.includes('Clorexidina oral não é rotina universal')&&!t.includes('higiene oral com clorexidina'));
ok('traqueostomia não usa relógio 7-14 dias',t.includes('não usar 7–14 dias como relógio obrigatório')&&!t.includes('Traqueostomia se VM > 7–14 dias prevista'));
ok('observação pós-extubação sem janela obrigatória',t.includes('em vez de uma janela obrigatória de 24–48 h'));
const f=c.filter(([,v])=>!v);if(f.length){console.error('\n❌ VM fechamento 2026:');for(const [n] of f)console.error('   - '+n);process.exit(1);}console.log(`✅ VM fechamento 2026: ${c.length} travas aprovadas.`);