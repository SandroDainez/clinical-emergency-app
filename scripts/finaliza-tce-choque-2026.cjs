#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const cp=require('node:child_process');const root=path.resolve(__dirname,'..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
function run(script){console.log(`\n▶ ${script}`);cp.execFileSync(process.execPath,[path.join(root,'scripts',script)],{stdio:'inherit'})}
let tce=read('tce-decision-tree.ts');
if(tce.includes('Monitorização multimodal quando disponível: saturação venosa jugular acima de 55%')) run('ajusta-tce-neuromonitorizacao-handoff-acs2024.cjs'); else console.log('↪ TCE neuromonitorização já aplicada.');
let shock=read('shock-decision-tree.ts');
if(shock.includes('Lactato acima de 2 mmol/L com pele alterada fecha hipoperfusão')) run('ajusta-choque-avaliacao-ressuscitacao-esicm2025.cjs'); else console.log('↪ Choque avaliação inicial já aplicada.');
shock=read('shock-decision-tree.ts');
if(shock.includes('bólus inicial de 500–1000 mL de cristaloide')) run('ajusta-choque-hemorragico-esicm2025.cjs'); else console.log('↪ Choque hemorrágico já aplicado.');
shock=read('shock-decision-tree.ts');
if(shock.includes('Murmúrio ausente + desvio de traqueia + timpanismo')) run('ajusta-choque-obstrutivo-erc2025.cjs'); else console.log('↪ Choque obstrutivo já aplicado.');
shock=read('shock-decision-tree.ts');
if(shock.includes('responde bem à infusão de volume — o oposto do IAM de VE')) run('ajusta-choque-cardiogenico-acc2025.cjs'); else console.log('↪ Choque cardiogênico já aplicado.');
shock=read('shock-decision-tree.ts');
if(shock.includes('Pele quente, pulso amplo, febre ou suspeita de infecção?')) run('ajusta-choque-distributivo-ssc2026.cjs'); else console.log('↪ Choque distributivo já aplicado.');
shock=read('shock-decision-tree.ts');
if(shock.includes('Insuficiência aórtica: dopamina;')) run('ajusta-choque-valvar-mecanico-2026.cjs'); else console.log('↪ Choque valvar/mecânico já aplicado.');
run('ajusta-choque-traducao-final-2026.cjs');
console.log('\n✅ Migrações finais TCE + Choque aplicadas/idempotentemente verificadas.');
