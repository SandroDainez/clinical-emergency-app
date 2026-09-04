#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'shock-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/choque-einstein.ts');

let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const oldPt = 'Atenção: em boa parte dos pacientes a resposta compensatória mantém a PA normal até que 30% da volemia tenha sido perdida — PA normal não afasta hemorragia grave.';
const newPt = 'Atenção: pressão arterial normal NÃO exclui hemorragia importante. A resposta compensatória, a idade, medicamentos, gestação, reserva fisiológica e a velocidade da perda podem dissociar a pressão arterial da gravidade do sangramento; não use um percentual fixo de perda volêmica como limiar diagnóstico. Integre perfusão periférica, estado mental, tendência hemodinâmica, mecanismo/fonte, POCUS quando útil e resposta à ressuscitação.';

if (!tree.includes(oldPt) && !tree.includes(newPt)) {
  throw new Error('Frase-alvo sobre PA e 30% de volemia não encontrada.');
}
if (tree.includes(oldPt)) tree = tree.replace(oldPt, newPt);

const oldEsKey = `  "${oldPt}":\n    "Atención: en buena parte de los pacientes la respuesta compensatoria mantiene la PA normal hasta que se ha perdido el 30% de la volemia — una PA normal no descarta hemorragia grave.",`;
const newEsEntry = `  "${newPt}":\n    "Atención: una presión arterial normal NO excluye una hemorragia importante. La respuesta compensatoria, la edad, los medicamentos, el embarazo, la reserva fisiológica y la velocidad de la pérdida pueden disociar la presión arterial de la gravedad del sangrado; no use un porcentaje fijo de pérdida de volemia como umbral diagnóstico. Integre perfusión periférica, estado mental, tendencia hemodinámica, mecanismo/fuente, POCUS cuando sea útil y respuesta a la reanimación.",`;

if (i18n.includes(oldEsKey)) {
  i18n = i18n.replace(oldEsKey, newEsEntry);
} else if (!i18n.includes(`"${newPt}"`)) {
  const marker = '  // ── Hipovolêmico / hemorrágico ──\n';
  if (!i18n.includes(marker)) throw new Error('Marcador i18n hipovolêmico não encontrado.');
  i18n = i18n.replace(marker, marker + newEsEntry + '\n');
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ Choque hemorrágico: removido limiar rígido de 30% para PA normal; avaliação passa a ser multimodal e baseada em tendência/contexto.');
