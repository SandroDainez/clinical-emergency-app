#!/usr/bin/env node
const fs=require('node:fs'); const path=require('node:path'); const root=path.resolve(__dirname,'..');
const tree=fs.readFileSync(path.join(root,'rsi-decision-tree.ts'),'utf8'); const es=fs.readFileSync(path.join(root,'lib/i18n/modules/isr.ts'),'utf8');
const checks=[]; const ok=(n,v)=>checks.push([n,Boolean(v)]);
ok('sem fentanil >5 como limiar',!tree.includes('rigidez torácica se > 5 mcg/kg'));
ok('fentanil contextual',tree.includes('não existe limiar universal de 5 mcg/kg'));
ok('sem veto rotineiro à ventilação peri-indução',!tree.includes('NÃO ventilar no intervalo de apneia'));
ok('BVM peri-indução contextual em ambos nós',(tree.match(/ventilação suave com BVM entre indução e laringoscopia/g)||[]).length===2);
ok('succinilcolina sem 2 mg/kg automático',!tree.includes('1–1,5 mg/kg; 2 mg/kg em obesos; máx 200 mg'));
ok('succinilcolina peso total/real',tree.includes('Na obesidade, calcular pelo peso corporal total/real'));
ok('sem resumo max 200',!tree.includes('Início rápido e duração ultracurta (8–12 min). Máx 200 mg.'));
ok('rocurônio não é apenas alternativa por contraindicação',tree.includes('Opção válida para ISR. Duração mais longa'));
ok('SCCM aceita ambos',tree.includes('SCCM aceita rocurônio OU succinilcolina'));
ok('sem antídoto CICO',!tree.includes('ANTÍDOTO CICO'));
ok('sem SEMPRE sugamadex',!tree.includes('Ter SEMPRE disponível quando usar rocurônio para ISR'));
ok('eFONA não atrasada',tree.includes('não esperar reversão farmacológica atrasar a sequência de resgate/eFONA'));
ok('tradução succinilcolina',es.includes('En obesidad, calcular por peso corporal total/real'));
ok('tradução CICO/eFONA',es.includes('no esperar la reversión farmacológica ni retrasar la secuencia de rescate/eFONA'));
const failed=checks.filter(([,v])=>!v); if(failed.length){console.error('\n❌ ISR/coerência BNM-ventilação:'); for(const[n]of failed)console.error(' - '+n); process.exit(1);} console.log(`\n✅ ISR/coerência BNM-ventilação: ${checks.length} verificações aprovadas.\n`);