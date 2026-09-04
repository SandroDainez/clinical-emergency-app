#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'shock-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/choque-einstein.ts');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const reps = [
  [
    "Ações: estabilização hemodinâmica com NORADRENALINA (vasopressor de escolha); considerar acrescentar inotrópico; evitar expansão volêmica — mais de 70% dos IAM de VE em choque já têm congestão e pioram com volume.",
    "Ações: na hipotensão, usar NORADRENALINA como vasopressor de primeira linha; considerar inotrópico quando houver baixo débito persistente apesar de pressão adequada. Na presença de congestão, NÃO usar expansão volêmica empírica como tratamento primário; reavaliar perfusão e congestão após cada intervenção."
  ],
  [
    "Baixo débito SEM congestão: aqui cabem alíquotas de volume.",
    "Baixo débito SEM congestão: ausência de congestão, sozinha, NÃO prova responsividade a volume."
  ],
  [
    "Mecanismo: baixo débito com pressão diastólica final do VE possivelmente baixa — o paciente pode tolerar bólus de fluido.",
    "Mecanismo: baixo débito sem congestão clínica pode coexistir com baixa pré-carga, mas também com falência de bomba sem responsividade a volume; confirmar o fenótipo antes de expandir."
  ],
  [
    "Ações: fluidos em PEQUENAS alíquotas, reavaliando a cada uma; estabilização hemodinâmica com noradrenalina; considerar acrescentar inotrópico.",
    "Ações: se houver baixa pré-carga provável ou responsividade demonstrada, testar PEQUENA alíquota e reavaliar imediatamente volume sistólico/perfusão e sinais de congestão; interromper se não houver benefício. Na hipotensão, usar noradrenalina; considerar inotrópico se baixo débito persistir com pressão adequada."
  ],
  [
    "// o perfil quente/frio — no VD, dar volume ajuda e diurético mata; na",
    "// o perfil quente/frio — no VD, tanto volume liberal quanto retirada indiscriminada podem piorar; na"
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`Trecho-alvo não encontrado: ${from.slice(0, 80)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const translations = new Map([
  [
    "Ações: na hipotensão, usar NORADRENALINA como vasopressor de primeira linha; considerar inotrópico quando houver baixo débito persistente apesar de pressão adequada. Na presença de congestão, NÃO usar expansão volêmica empírica como tratamento primário; reavaliar perfusão e congestão após cada intervenção.",
    "Acciones: ante hipotensión, usar NORADRENALINA como vasopresor de primera línea; considerar un inotrópico cuando persista bajo gasto a pesar de una presión adecuada. En presencia de congestión, NO usar expansión con volumen empírica como tratamiento primario; reevaluar perfusión y congestión después de cada intervención."
  ],
  [
    "Baixo débito SEM congestão: ausência de congestão, sozinha, NÃO prova responsividade a volume.",
    "Bajo gasto SIN congestión: la ausencia de congestión, por sí sola, NO demuestra respuesta a volumen."
  ],
  [
    "Mecanismo: baixo débito sem congestão clínica pode coexistir com baixa pré-carga, mas também com falência de bomba sem responsividade a volume; confirmar o fenótipo antes de expandir.",
    "Mecanismo: el bajo gasto sin congestión clínica puede coexistir con baja precarga, pero también con fallo de bomba sin respuesta a volumen; confirmar el fenotipo antes de expandir."
  ],
  [
    "Ações: se houver baixa pré-carga provável ou responsividade demonstrada, testar PEQUENA alíquota e reavaliar imediatamente volume sistólico/perfusão e sinais de congestão; interromper se não houver benefício. Na hipotensão, usar noradrenalina; considerar inotrópico se baixo débito persistir com pressão adequada.",
    "Acciones: si hay baja precarga probable o respuesta a volumen demostrada, probar una PEQUEÑA alícuota y reevaluar de inmediato volumen sistólico/perfusión y signos de congestión; suspender si no hay beneficio. Ante hipotensión, usar noradrenalina; considerar un inotrópico si persiste bajo gasto con presión adecuada."
  ],
]);

for (const [pt, es] of translations) {
  if (i18n.includes(`\"${pt}\"`)) continue;
  const marker = '  // ── Cardiogênico: frio e seco ──\n';
  const entry = `  ${JSON.stringify(pt)}:\n    ${JSON.stringify(es)},\n`;
  if (!i18n.includes(marker)) throw new Error('Marcador cardiogênico i18n não encontrado');
  i18n = i18n.replace(marker, marker + entry);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ Choque cardiogênico: perfis frio/úmido e frio/seco sem percentuais históricos nem volume inferido pela ausência isolada de congestão.');
