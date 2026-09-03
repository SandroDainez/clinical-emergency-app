#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const file=path.resolve(__dirname,'..','tce-decision-tree.ts');
function rep(before,after,label){let s=fs.readFileSync(file,'utf8');if(s.includes(after))return false;const n=s.split(before).length-1;if(n!==1)throw new Error(`${label}: esperado 1 alvo, encontrado ${n}`);s=s.replace(before,after);fs.writeFileSync(file,s);return true;}
rep(
'"HIC refratária — 3ª ETAPA, medidas de RESGATE (maior risco, e é por isso que vêm por último): titular sedação até surto-supressão no EEG (surtos de 5–20 s, ou 50% do traçado em supressão); tiopental em bólus de 5–15 mg/kg em 30 min a 2 h, seguido de 1–4 mg/kg/h; hipotermia moderada com temperatura central de 32–34 °C.",',
'"HIC refratária — 3ª ETAPA, medidas de RESGATE de maior risco: após revisar causas reversíveis, terapias dos tiers anteriores e opções neurocirúrgicas, considerar barbitúrico em dose alta para PIC refratária apenas com estabilidade hemodinâmica e monitorização intensiva/EEG contínuo. A BTF recomenda barbitúrico nesse contexto, mas não impõe um agente, esquema de dose ou padrão universal de surto-supressão; seguir protocolo neurocrítico local e titular à PIC/EEG/tolerância hemodinâmica.",',
'barbiturico tier3');
rep(
'"⚠️ A hipotermia moderada controla a PIC refratária, mas NÃO se associa a melhor desfecho neurológico — e a hiperventilação moderada aumenta o risco de isquemia cerebral. Ambas pedem monitorização adicional, idealmente oximetria cerebral.",',
'"TEMPERATURA: nos tiers 1–2, manter normotermia controlada com temperatura central 36,0–37,5 °C e tratar febre. Se a PIC permanecer refratária apesar dos tiers 1–2, hipotermia terapêutica <36 °C pode ser considerada de forma selecionada pela equipe neurocrítica; se usada, manter o alvo o mais próximo possível da fisiologia. Não impor 32–34 °C como alvo universal nem uma ordem obrigatória entre hipotermia, barbitúrico e craniectomia. Hiperventilação permanece medida de resgate e exige monitorização cerebral quando disponível.",',
'temperatura refrataria');
rep(
'"TC de controle em 6–12 h ou a qualquer deterioração; exame neurológico seriado.",',
'"Exame neurológico seriado; repetir TC IMEDIATAMENTE diante de deterioração. Em paciente estável com lesão conhecida, individualizar imagem de controle conforme padrão da lesão, evolução, coagulação, intervenção planejada e protocolo neurocirúrgico — sem janela fixa universal.",',
'TC UTI');
rep(
'"HIC REFRATÁRIA: a escalada em etapas está no passo de conduta da herniação — 1ª etapa (medidas gerais, osmoterapia, drenagem), 2ª (sedação profunda, natremia mais alta, craniectomia) e 3ª (surto-supressão, hipotermia). Aqui se MANTÉM o que foi escalado e se reavalia a cada piora.",',
'"HIC REFRATÁRIA: a escalada em etapas está no passo de conduta da herniação — 1ª etapa (medidas gerais, osmoterapia e drenagem quando disponível), 2ª (aprofundar sedação, ajustar osmoterapia pela resposta e reavaliar opção neurocirúrgica) e 3ª (resgates selecionados de maior risco, como barbitúrico, hipotermia terapêutica e hiperventilação monitorizada). Aqui se mantém apenas o que demonstrar benefício sobre a PIC e tolerância clínica, com reavaliação contínua.",',
'resumo tiers UTI');
console.log('✅ TCE HIC refratária 2026: barbitúrico, temperatura e TC seriada contextualizados.');
