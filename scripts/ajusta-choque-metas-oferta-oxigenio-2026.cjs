#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shockPath = path.join(root, "shock-decision-tree.ts");
const i18nPath = path.join(root, "lib/i18n/modules/choque-einstein.ts");
let shock = fs.readFileSync(shockPath, "utf8");
let i18n = fs.readFileSync(i18nPath, "utf8");

const replacements = [
  {
    from: "As metas valem para qualquer tipo de choque — o tipo define o tratamento, não o alvo.",
    to: "Os objetivos gerais são restaurar perfusão e oferta de oxigênio, mas os alvos numéricos NÃO são universais: devem seguir etiologia, sangramento/isquemia, comorbidades e resposta ao tratamento.",
  },
  {
    from: "Metas de oferta de O₂: hemoglobina ≥ 7 g/dL e saturação de pulso > 90%.",
    to: "Oferta de O₂: não usar hemoglobina ≥7 g/dL nem SpO₂ >90% como metas universais de todo choque. Em adultos hospitalizados hemodinamicamente estáveis, estratégia transfusional restritiva costuma considerar transfusão quando Hb <7 g/dL; esse limiar não se aplica automaticamente a hemorragia ativa/exsanguinante e deve ser individualizado em doença cardiovascular/isquemia. Oxigênio e alvo de saturação também devem seguir hipoxemia e contexto clínico, evitando tratar um número isolado como objetivo único de ressuscitação.",
  },
];

for (const { from, to } of replacements) {
  if (!shock.includes(from)) {
    console.error(`❌ Texto esperado não localizado em shock-decision-tree.ts: ${from}`);
    process.exit(1);
  }
  shock = shock.replace(from, to);
}
fs.writeFileSync(shockPath, shock);

const esMap = new Map([
  [
    replacements[0].to,
    "Los objetivos generales son restaurar la perfusión y el aporte de oxígeno, pero los objetivos numéricos NO son universales: deben ajustarse a la etiología, sangrado/isquemia, comorbilidades y respuesta al tratamiento.",
  ],
  [
    replacements[1].to,
    "Aporte de O₂: no usar hemoglobina ≥7 g/dL ni SpO₂ >90% como objetivos universales de todo choque. En adultos hospitalizados hemodinámicamente estables, una estrategia transfusional restrictiva suele considerar transfusión cuando Hb <7 g/dL; este umbral no se aplica automáticamente a hemorragia activa/exanguinante y debe individualizarse en enfermedad cardiovascular/isquemia. El oxígeno y el objetivo de saturación también deben seguir la hipoxemia y el contexto clínico, evitando tratar un número aislado como único objetivo de reanimación.",
  ],
]);

for (const [pt, es] of esMap) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf("\n};");
  if (idx < 0) {
    console.error("❌ Fechamento do dicionário choque-einstein não localizado.");
    process.exit(1);
  }
  const entry = `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(es)},`;
  i18n = i18n.slice(0, idx) + entry + i18n.slice(idx);
}
fs.writeFileSync(i18nPath, i18n);

console.log("✅ Choque: metas universais de Hb/SpO₂ substituídas por alvos contextuais.");
