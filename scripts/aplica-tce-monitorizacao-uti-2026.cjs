#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const file=path.resolve(__dirname,'..','tce-decision-tree.ts');
function rep(before,after,label){let s=fs.readFileSync(file,'utf8');if(s.includes(after))return false;const n=s.split(before).length-1;if(n!==1)throw new Error(`${label}: esperado 1 alvo, encontrado ${n}`);s=s.replace(before,after);fs.writeFileSync(file,s);return true;}
rep(
'"Profilaxia de TVP (mecânica imediata; farmacológica após 24–48 h com sangramento estável, em conjunto com a neurocirurgia).",',
'"Profilaxia de TEV: usar compressão pneumática quando não houver contraindicação. Em TCE não operado com imagem de controle estável e baixo risco de progressão hemorrágica, considerar LMWH precocemente (frequentemente dentro de 24–48 h após demonstrar estabilidade); em hemorragia de maior risco, progressão, craniotomia/craniectomia, EVD ou outra intervenção intracraniana, individualizar o início em conjunto com trauma/neurocirurgia — não usar 24–48 h como relógio automático.",',
'profilaxia TEV');
rep(
'"Indicação de PIC invasiva: TCE grave (Glasgow 3–8) com TC alterada; ou TC normal com 2 de 3 — idade acima de 40 anos, PAS abaixo de 90 mmHg, postura anômala ao exame.",',
'"Monitorização invasiva da PIC: a BTF recomenda manejar o TCE grave usando informação da PIC. As regras clássicas — GCS 3–8 com TC alterada; ou TC normal com ≥2 entre idade >40 anos, postura motora anômala e PAS <90 mmHg — são REAPRESENTADAS pela 4ª edição para reconhecer alto risco, mas derivam de recomendações antigas que não atendem aos padrões atuais de evidência. Usar quadro clínico, TC, possibilidade de exame neurológico, necessidade de sedação/intervenção e decisão neurocirúrgica, não um checklist isolado.",',
'PIC invasiva');
rep(
'"Sem monitor de PIC disponível, os métodos não invasivos ajudam a decidir se vale escalar: Doppler transcraniano com índice de pulsatilidade acima de 2,13; bainha do nervo óptico ao ultrassom acima de 6 mm; pupilometria com NPi abaixo de 3. Todos com acurácia menor que a PIC invasiva, que é o padrão-ouro.",',
'"Sem monitor invasivo de PIC disponível, Doppler transcraniano, ultrassom da bainha do nervo óptico e pupilometria quantitativa podem acrescentar informação e acompanhar TENDÊNCIAS, especialmente quando combinados ao exame e à TC. Não usar PI, diâmetro da bainha ou NPi com um único cutoff universal para diagnosticar/excluir HIC ou decidir terapia isoladamente; técnica, dispositivo, população e contexto alteram os valores. Deterioração clínica/hernição deve ser tratada pelo quadro global sem esperar um teste não invasivo.",',
'monitorizacao nao invasiva');
rep(
'"EEG contínuo é mais sensível que o intermitente para crise não convulsiva, que causa lesão secundária e eleva a PIC. Cerca de metade das crises aparece na primeira hora, mas o paciente em coma pode exigir 48 h de monitorização.",',
'"EEG contínuo é preferível quando há suspeita relevante de crise não convulsiva, coma/alteração inexplicada ou necessidade de acompanhar terapia que depende do EEG. A duração deve seguir probabilidade pré-teste, achados iniciais, sedação e evolução: em geral são necessárias pelo menos 24 h para rastreio adequado, e pacientes com coma, descargas periódicas ou forte suspeita podem precisar 48 h ou mais — não impor 48 h a todo TCE em coma.",',
'EEG continuo');
console.log('✅ TCE monitorização UTI 2026: PIC, métodos não invasivos, TEV e EEG contextualizados.');
