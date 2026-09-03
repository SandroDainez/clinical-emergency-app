#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function replaceOnce(rel, label, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, "utf8");
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

replaceOnce(
  "sedation-engine.ts",
  "fentanyl-duration-alert",
  '        "Infusões > 2–4 h prolongam o despertar — considerar remifentanil se precisar desmame rápido.",',
  '        "Infusões prolongadas podem atrasar o despertar por acúmulo e aumento da meia-vida contexto-sensível; não há um corte universal em 2–4 h. O efeito depende de duração, dose e fatores do paciente/doença crítica. Se recuperação rápida e previsível for prioridade, considerar remifentanil.",'
);
replaceOnce(
  "sedation-engine.ts",
  "fentanyl-strategy-context",
  '      "Meia-vida contexto-sensível aumenta com infusões longas.",',
  '      "Meia-vida contexto-sensível aumenta progressivamente com a duração da infusão; em pacientes críticos, distribuição e depuração podem variar amplamente.",'
);
replaceOnce(
  "sedation-engine.ts",
  "fentanyl-reference",
  '    reference: "PADIS 2018 · Miller\'s Anesthesia 9ª ed.",',
  '    reference: "PADIS 2018 · Miller\'s Anesthesia 9ª ed. · Hughes et al., Anesthesiology 1992 (context-sensitive half-time) · revisão sistemática de farmacocinética de opioides em UTI, 2025.",'
);

const i18nFile = path.join(root, "lib/i18n/modules/sedacao.ts");
let i18n = fs.readFileSync(i18nFile, "utf8");
const entries = [
  [
    "Infusões prolongadas podem atrasar o despertar por acúmulo e aumento da meia-vida contexto-sensível; não há um corte universal em 2–4 h. O efeito depende de duração, dose e fatores do paciente/doença crítica. Se recuperação rápida e previsível for prioridade, considerar remifentanil.",
    "Las infusiones prolongadas pueden retrasar el despertar por acumulación y aumento de la semivida sensible al contexto; no existe un punto de corte universal de 2–4 h. El efecto depende de la duración, la dosis y factores del paciente/la enfermedad crítica. Si una recuperación rápida y predecible es prioritaria, considerar remifentanilo."
  ],
  [
    "Meia-vida contexto-sensível aumenta progressivamente com a duração da infusão; em pacientes críticos, distribuição e depuração podem variar amplamente.",
    "La semivida sensible al contexto aumenta progresivamente con la duración de la infusión; en pacientes críticos, la distribución y la depuración pueden variar ampliamente."
  ],
];
for (const [pt, es] of entries) {
  const key = `  ${JSON.stringify(pt)}:`;
  if (i18n.includes(key)) continue;
  const close = "};";
  const at = i18n.lastIndexOf(close);
  if (at < 0) throw new Error("Fechamento do dicionário ES_SEDACAO não encontrado.");
  i18n = i18n.slice(0, at) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + i18n.slice(at);
}
fs.writeFileSync(i18nFile, i18n);

console.log("✅ Fentanil: removido limiar artificial de 2–4 h; acúmulo e recuperação passam a ser descritos como dependentes de contexto clínico.");
