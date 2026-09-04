#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const alvosPath = path.join(root, "lib/alvos-tce.ts");
const i18nPath = path.join(root, "lib/i18n/modules/tce.ts");
let alvos = fs.readFileSync(alvosPath, "utf8");
let i18n = fs.readFileSync(i18nPath, "utf8");

const newText = "HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.";

const constantRe = /export const TCE_HIPERVENTILACAO_TERCEIRA_LINHA =\n\s*"[\s\S]*?";\n/;
const match = alvos.match(constantRe)?.[0] ?? "";
if (!match || !match.includes("PaCO₂ 25–34 mmHg")) {
  console.error("❌ Constante antiga TCE_HIPERVENTILACAO_TERCEIRA_LINHA não localizada com o alvo 25–34; reauditar fonte atual.");
  process.exit(1);
}
alvos = alvos.replace(
  constantRe,
  `export const TCE_HIPERVENTILACAO_TERCEIRA_LINHA =\n  ${JSON.stringify(newText)};\n`
);
fs.writeFileSync(alvosPath, alvos);

const esText = "HIPERVENTILACIÓN EN HIC REFRACTARIA — usar solo como RESCATE, no como rutina. En el algoritmo SIBICC, la hiperventilación leve con PaCO₂ 32–35 mmHg es una opción de tier 2; PaCO₂ 30–32 mmHg aparece solo en el tier 3 y, en el algoritmo con monitorización de oxígeno cerebral, únicamente cuando no hay hipoxia tisular cerebral. Evitar PaCO₂ <30 mmHg y NO usar PaCO₂ ≤25 mmHg de forma profiláctica o prolongada. Reevaluar PIC, PPC y oxigenación cerebral cuando esté disponible y revertir la hipocapnia en cuanto la medida de rescate deje de ser necesaria.";
if (!i18n.includes(newText)) {
  const marker = "\n};";
  const idx = i18n.lastIndexOf(marker);
  if (idx < 0) {
    console.error("❌ Fechamento do dicionário TCE não localizado.");
    process.exit(1);
  }
  const entry = `\n  ${JSON.stringify(newText)}:\n    ${JSON.stringify(esText)},`;
  i18n = i18n.slice(0, idx) + entry + i18n.slice(idx);
  fs.writeFileSync(i18nPath, i18n);
}

console.log("✅ TCE: hiperventilação refratária alinhada ao SIBICC sem alvo institucional 25–34 universal.");
