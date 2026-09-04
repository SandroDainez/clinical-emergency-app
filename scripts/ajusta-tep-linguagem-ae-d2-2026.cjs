#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'tep-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/tep.ts');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const reps = [
  [
    '"Sem hipotensão, sem alteração do estado mental e sem má perfusão, dor em aperto com irradiação não classifica TEP de alto risco."',
    '"Sem hipotensão, alteração do estado mental ou má perfusão, dor em aperto com irradiação NÃO define falência cardiopulmonar D/E por TEP."'
  ],
  [
    'title: "Achado isolado — ainda NÃO é alto risco",',
    'title: "Achado isolado — ainda NÃO define categoria D/E",'
  ],
  [
    '"O achado isolado não classifica como alto risco — a definição exige PAS < 90 mmHg, queda ≥ 40 mmHg por mais de 15 min, ou necessidade de vasopressor.",',
    '"O achado isolado não define sozinho categoria D/E. AHA/ACC 2026 inclui D1 (hipotensão transitória/recorrente) e D2 (hipoperfusão/choque normotensivo), além de E1–E2 com falência cardiopulmonar estabelecida. Portanto pressão preservada NÃO exclui deterioração relevante.",'
  ],
  [
    '"PROCURAR o risco intermediário-alto, que é o que descompensa: disfunção de VD na AngioTC ou no ecocardiograma, com troponina ou BNP elevados. Esse paciente fica em ambiente monitorizado, com trombólise de resgate pactuada.",',
    '"RECLASSIFICAR pela gravidade AHA/ACC 2026: integrar disfunção de VD, biomarcadores, sintomas, reserva cardiopulmonar, perfusão e tendência hemodinâmica para distinguir C de D. Não usar a antiga etiqueta intermediário-alto como autorização automática para trombólise.",'
  ],
  [
    '"REAVALIAR de perto. A deterioração no TEP é abrupta: se aparecer hipotensão, alteração do estado mental ou necessidade de vasopressor, passa a ser alto risco e a trombólise entra em discussão imediata.",',
    '"REAVALIAR de perto. Deterioração pode aparecer como D2 com hipoperfusão apesar de pressão preservada, D1 com hipotensão transitória/recorrente, ou E1–E2 com choque/falência cardiopulmonar. Se migrar para D/E, discutir terapia avançada conforme categoria, risco hemorrágico e recursos — sem esperar hipotensão persistente para reconhecer piora.",'
  ],
  [
    'title: "TEP alto risco — suporte + anticoagulação imediata",',
    'title: "TEP D/E — suporte + anticoagulação quando indicada",'
  ],
  [
    '"TEP de alto risco, por si só, NÃO torna HNF o anticoagulante parenteral preferido.',
    '"Categoria D/E, por si só, NÃO torna HNF o anticoagulante parenteral preferido.'
  ],
  [
    'title: "Alternativas à trombólise — alto risco",',
    'title: "Alternativas à trombólise — TEP D/E",'
  ],
  [
    '"ECMO venoarterial (VA-ECMO): TEP maciço com PCR/colapso refratário — ponte para cirurgia/trombólise.",',
    '"ECMO venoarterial (VA-ECMO): considerar em E2/choque refratário ou PCR por TEP conforme recursos e estratégia de reperfusão — ponte para recuperação ou intervenção definitiva.",'
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`TEP A–E: trecho não localizado: ${from.slice(0, 100)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const es = new Map([
  ['Sem hipotensão, alteração do estado mental ou má perfusão, dor em aperto com irradiação NÃO define falência cardiopulmonar D/E por TEP.', 'Sin hipotensión, alteración del estado mental ni mala perfusión, el dolor opresivo con irradiación NO define falla cardiopulmonar D/E por TEP.'],
  ['Achado isolado — ainda NÃO define categoria D/E', 'Hallazgo aislado — todavía NO define categoría D/E'],
  ['O achado isolado não define sozinho categoria D/E. AHA/ACC 2026 inclui D1 (hipotensão transitória/recorrente) e D2 (hipoperfusão/choque normotensivo), além de E1–E2 com falência cardiopulmonar estabelecida. Portanto pressão preservada NÃO exclui deterioração relevante.', 'El hallazgo aislado no define por sí solo categoría D/E. AHA/ACC 2026 incluye D1 (hipotensión transitoria/recurrente) y D2 (hipoperfusión/shock normotensivo), además de E1–E2 con falla cardiopulmonar establecida. Por tanto, una presión conservada NO excluye deterioro relevante.'],
  ['RECLASSIFICAR pela gravidade AHA/ACC 2026: integrar disfunção de VD, biomarcadores, sintomas, reserva cardiopulmonar, perfusão e tendência hemodinâmica para distinguir C de D. Não usar a antiga etiqueta intermediário-alto como autorização automática para trombólise.', 'RECLASIFICAR por gravedad AHA/ACC 2026: integrar disfunción de VD, biomarcadores, síntomas, reserva cardiopulmonar, perfusión y tendencia hemodinámica para distinguir C de D. No usar la antigua etiqueta intermedio-alto como autorización automática para trombólisis.'],
  ['REAVALIAR de perto. Deterioração pode aparecer como D2 com hipoperfusão apesar de pressão preservada, D1 com hipotensão transitória/recorrente, ou E1–E2 com choque/falência cardiopulmonar. Se migrar para D/E, discutir terapia avançada conforme categoria, risco hemorrágico e recursos — sem esperar hipotensão persistente para reconhecer piora.', 'REEVALUAR de cerca. El deterioro puede aparecer como D2 con hipoperfusión pese a presión conservada, D1 con hipotensión transitoria/recurrente, o E1–E2 con shock/falla cardiopulmonar. Si progresa a D/E, discutir terapia avanzada según categoría, riesgo hemorrágico y recursos, sin esperar hipotensión persistente para reconocer el empeoramiento.'],
  ['TEP D/E — suporte + anticoagulação quando indicada', 'TEP D/E — soporte + anticoagulación cuando esté indicada'],
  ['Alternativas à trombólise — TEP D/E', 'Alternativas a la trombólisis — TEP D/E'],
  ['ECMO venoarterial (VA-ECMO): considerar em E2/choque refratário ou PCR por TEP conforme recursos e estratégia de reperfusão — ponte para recuperação ou intervenção definitiva.', 'ECMO venoarterial (VA-ECMO): considerar en E2/shock refractario o paro por TEP según recursos y estrategia de reperfusión, como puente a recuperación o intervención definitiva.'],
]);
for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP: linguagem residual alto/intermediário-alto removida dos pontos de decisão e D2 normotensivo preservado explicitamente.');
