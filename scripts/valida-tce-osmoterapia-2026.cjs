#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const src=fs.readFileSync(path.join(root,'tce-decision-tree.ts'),'utf8');
const failures=[];let ok=0;
const checks=[
 ['HTS preferida sobre manitol',/NCS sugere solução hipertônica sobre manitol|Neurocritical Care Society sugere solução hipertônica sobre manitol/],
 ['regime 3% rotulado como institucional',/Regime do protocolo institucional citado: NaCl 3%/],
 ['NaCl20 sem intervalo universal',/NaCl 20% 40 mL IV em 5 min[^\n]+não por intervalo universal fixo/],
 ['manitol como alternativa',/Manitol 20%:[^\n]+alternativa eficaz/],
 ['manitol sem relógio fixo',/Repetição deve ser guiada pela resposta\/PIC e segurança, não por relógio fixo/],
 ['gap osmolar sem cutoff obrigatório',/NÃO há evidência suficiente para um cutoff obrigatório/],
 ['20 mOsm não é limite validado',/20 mOsm\/kg[^\n]+não é um limite validado/],
 ['sem alvo fixo de natremia na HIC',/Não perseguir um alvo fixo de natremia apenas para tratar a PIC/],
 ['monitorização Na Cl renal',/monitorar sódio, cloro e função renal/],
 ['regra antiga gap acima 20 ausente',!/não há benefício adicional com gap acima de 20/.test(src)],
];
for(const [name,rule] of checks){const pass=typeof rule==='boolean'?rule:rule.test(src);if(pass)ok++;else failures.push(name);}if(failures.length){console.error('❌ TCE osmoterapia 2026:');for(const f of failures)console.error(' - '+f);process.exit(1);}console.log(`✅ TCE osmoterapia 2026: ${ok} travas aprovadas.`);
