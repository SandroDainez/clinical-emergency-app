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
    '"Suporte: O₂ (IOT se insuficiência respiratória grave); fluidos CAUTELOSOS — SF 0,9% 500 mL (máx 500–1.000 mL): sobrecarga piora a função do VD.",',
    '"SUPORTE RESPIRATÓRIO: na hipoxemia moderada-grave, preferir cânula nasal de alto fluxo ao cateter nasal convencional. Evitar sedação profunda e ventilação mecânica salvo indicação clínica forte, porque indução e pressão positiva podem precipitar colapso do VD. Se intubação for inevitável, ter vasopressor/inotrópico e estratégia de resgate hemodinâmico imediatamente disponíveis.",'
  ],
  [
    '"Vasopressor: norepinefrina 0,1–1 mcg/kg/min para PAM ≥ 65. Dobutamina se baixo débito com PA mantida. Evitar hipóxia/hipercapnia.",',
    '"HEMODINÂMICA AHA/ACC 2026: norepinefrina é geralmente o vasopressor de escolha quando há hipotensão/choque; associar inotrópico conforme baixo débito e perfusão. Volume NÃO é rotina: apenas se houver preocupação clínica com pré-carga reduzida, em pequenos bolus de até 500 mL com reavaliação imediata; evitar cargas maiores ou indiscriminadas por risco de sobrecarga do VD.",'
  ],
  [
    '"AHA/ACC 2026: preferir cateter nasal de ALTO FLUXO ao cateter comum na hipoxemia moderada-grave; EVITAR sedação profunda e ventilação mecânica sempre que possível (risco de colapso hemodinâmico).",',
    '"AHA/ACC 2026: em categorias C–E, sedação profunda e ventilação mecânica devem ser evitadas salvo indicação clínica. Se houver necessidade de sedação para intubação, vasopressores, inotrópicos e/ou VA-ECMO devem estar prontamente disponíveis conforme recursos. Em C2–E, vasodilatador pulmonar inalatório pode ser considerado para reduzir a pós-carga do VD; não confundir com vasodilatação sistêmica indiscriminada.",'
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) throw new Error(`Trecho-alvo não encontrado: ${from.slice(0, 120)}`);
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const es = new Map([
  [reps[0][1].slice(1, -2), 'SOPORTE RESPIRATORIO: en hipoxemia moderada-grave, preferir cánula nasal de alto flujo frente a cánula nasal convencional. Evitar sedación profunda y ventilación mecánica salvo indicación clínica fuerte, porque la inducción y la presión positiva pueden precipitar colapso del VD. Si la intubación es inevitable, disponer de vasopresor/inotrópico y estrategia de rescate hemodinámico de inmediato.'],
  [reps[1][1].slice(1, -2), 'HEMODINÁMICA AHA/ACC 2026: la norepinefrina es generalmente el vasopresor de elección cuando existe hipotensión/shock; asociar inotrópico según bajo gasto y perfusión. El volumen NO es rutinario: solo si existe preocupación clínica por precarga reducida, en bolos pequeños de hasta 500 mL con reevaluación inmediata; evitar cargas mayores o indiscriminadas por riesgo de sobrecarga del VD.'],
  [reps[2][1].slice(1, -2), 'AHA/ACC 2026: en categorías C–E, deben evitarse la sedación profunda y la ventilación mecánica salvo indicación clínica. Si se requiere sedación para intubación, deben estar disponibles vasopresores, inotrópicos y/o VA-ECMO según recursos. En C2–E, puede considerarse un vasodilatador pulmonar inhalado para reducir la poscarga del VD; no confundir con vasodilatación sistémica indiscriminada.'],
]);
for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP AHA/ACC 2026: suporte hemodinâmico/ventilatório alinhado, sem carga volêmica indiscriminada nem intubação banalizada.');
