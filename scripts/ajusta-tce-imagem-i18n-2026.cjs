#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'lib', 'i18n', 'modules', 'tce.ts');
let s = fs.readFileSync(file, 'utf8');
const pairs = [
  ["⚠️ NÃO transformar a Canadian CT Head Rule em regra universal. Déficit focal, convulsão pós-trauma, suspeita de fratura e outros sinais de alto risco indicam TC. Em anticoagulante ou antiagregante (EXCETO aspirina em monoterapia), considerar TC mesmo sem outro critério; intoxicação isolada torna o exame menos confiável e exige julgamento/observação, mas não é indicação automática de TC por si só.", "⚠️ NO convertir la Canadian CT Head Rule en una regla universal. Déficit focal, convulsión postraumática, sospecha de fractura y otros signos de alto riesgo indican TC. En anticoagulantes o antiagregantes (EXCEPTO aspirina en monoterapia), considerar TC incluso sin otro criterio; la intoxicación aislada hace menos confiable el examen y exige juicio/observación, pero no es una indicación automática de TC por sí sola."],
  ["Fora da Canadian CT Head Rule: déficit focal, convulsão pós-trauma e sinais de fratura/lesão grave têm indicação própria de TC. Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), o NICE recomenda CONSIDERAR TC mesmo sem outra indicação; coagulopatia aumenta o risco. Intoxicação isolada reduz a confiabilidade do exame e exige julgamento clínico/observação, não TC automática apenas por esse motivo.", "Fuera de la Canadian CT Head Rule: déficit focal, convulsión postraumática y signos de fractura/lesión grave tienen indicación propia de TC. En anticoagulantes o antiagregantes (excepto aspirina en monoterapia), NICE recomienda CONSIDERAR TC incluso sin otra indicación; la coagulopatía aumenta el riesgo. La intoxicación aislada reduce la confiabilidad del examen y exige juicio clínico/observación, no TC automática solo por ese motivo."],
  ["Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), considerar TC mesmo sem outro critério conforme risco e possibilidade de seguimento. Após TC normal, não impor observação prolongada apenas pelo fármaco: decidir pela evolução clínica, confiabilidade do exame, supervisão disponível e capacidade de retorno.", "En anticoagulantes o antiagregantes (excepto aspirina en monoterapia), considerar TC incluso sin otro criterio según riesgo y posibilidad de seguimiento. Tras una TC normal, no imponer observación prolongada solo por el fármaco: decidir según evolución clínica, confiabilidad del examen, supervisión disponible y capacidad de retorno."],
  ["Repetir TC IMEDIATAMENTE se houver deterioração neurológica. Em paciente estável com lesão já conhecida, individualizar TC seriada conforme tipo/tamanho da lesão, gravidade do TCE, exame neurológico, anticoagulação/coagulopatia, intervenção planejada e protocolo neurocirúrgico — não impor janela fixa de 6–12 h a todos.", "Repetir TC INMEDIATAMENTE si hay deterioro neurológico. En paciente estable con lesión ya conocida, individualizar la TC seriada según tipo/tamaño de la lesión, gravedad del TCE, examen neurológico, anticoagulación/coagulopatía, intervención planificada y protocolo neuroquirúrgico; no imponer una ventana fija de 6–12 h a todos."]
];
let added = 0;
for (const [pt, es] of pairs) {
  const key = JSON.stringify(pt) + ':';
  if (s.includes(key)) continue;
  const idx = s.lastIndexOf('\n};');
  if (idx < 0) throw new Error('fim do dicionário TCE não encontrado');
  s = s.slice(0, idx) + `\n  ${JSON.stringify(pt)}: ${JSON.stringify(es)},` + s.slice(idx);
  added++;
}
fs.writeFileSync(file, s);
console.log(`✅ TCE imagem 2026 i18n: ${added} novas chaves.`);
