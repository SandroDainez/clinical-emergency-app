#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const alvosPath = path.join(root, "lib/alvos-tce.ts");
const i18nPath = path.join(root, "lib/i18n/modules/tce.ts");
let alvos = fs.readFileSync(alvosPath, "utf8");
let i18n = fs.readFileSync(i18nPath, "utf8");

const oldText = "HIPERVENTILAÇÃO DE 3ª LINHA — PaCO₂ 25–34 mmHg (protocolo institucional Einstein/SBIBAE, CPTW263.2) — e ela NÃO é a hiperventilação-ponte da herniação. ⚠️ DESCER ABAIXO DE PaCO₂ 30 SÓ COM MONITORIZAÇÃO ADICIONAL DE OXIGENAÇÃO CEREBRAL — saturação venosa jugular ou PtiO₂. Sem essa monitorização, o piso é 30 mmHg. O motivo do piso: a hiperventilação baixa a PIC por VASOCONSTRIÇÃO CEREBRAL, isto é, cortando fluxo — abaixo de 30 a queda de fluxo passa a produzir isquemia em tecido que já está em risco, e é por isso que não se desce \\\"só um pouco mais\\\" quando a PIC não cede. ⚠️ A LITERATURA ABERTA NÃO SUSTENTA ABAIXO DE 30 SEM MONITORIZAÇÃO: o consenso de hiperventilação no TCE adulto coloca a hiperventilação controlada como terapia de tier 2 com alvo 33–36 mmHg, dizendo \\\"avoid values <30 mmHg\\\" e \\\"should never decrease below PaCO2 values of 30 mmHg\\\". O 25–34 vem do protocolo institucional citado por este módulo, e vale COM a monitorização que ele mesmo exige.";
const newText = "HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.";

if (!alvos.includes(oldText)) {
  console.error("❌ Texto antigo TCE_HIPERVENTILACAO_TERCEIRA_LINHA não localizado; reauditar fonte atual.");
  process.exit(1);
}
alvos = alvos.replace(oldText, newText);
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
