const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gate = fs.readFileSync(path.join(root, "lib/clinical-observation-decision-gate.ts"), "utf8");
const reset = fs.readFileSync(path.join(root, "lib/clinical-session-runtime.ts"), "utf8");
const card = fs.readFileSync(path.join(root, "components/ui-v2/stale-observation-confirmation-card.tsx"), "utf8");
const uiIndex = fs.readFileSync(path.join(root, "components/ui-v2/index.ts"), "utf8");

for (const contract of [
  "ObservationDecisionPolicy",
  "resolveObservationForDecision",
  "confirmStaleObservationForDecision",
  "clearObservationDecisionConfirmations",
  'status: "confirmation_required"',
  'status: "confirmed_stale"',
]) {
  if (!gate.includes(contract)) throw new Error(`Contrato stale ausente: ${contract}`);
}

if (!gate.includes("observationRecordedAt: pending.observation.recordedAt")) {
  throw new Error("Confirmação stale não está vinculada à medição exata.");
}
if (!gate.includes("staleAfterMs <= policy.freshForMs")) {
  throw new Error("Política não protege janelas temporais inválidas.");
}
if (!reset.includes("clearObservationDecisionConfirmations")) {
  throw new Error("Reset do atendimento não limpa confirmações de observações stale.");
}
for (const visibleContract of [
  "DADO ANTIGO · CONFIRMAÇÃO OBRIGATÓRIA",
  "INFORMAR NOVA MEDIDA",
  "CONFIRMAR ESTA MEDIÇÃO",
  "há {age}",
  "onConfirm",
  "onRemeasure",
]) {
  if (!card.includes(visibleContract)) throw new Error(`Interface stale incompleta: ${visibleContract}`);
}
if (!card.includes('accessibilityRole="alert"')) throw new Error("Gate stale não é anunciado como alerta.");
if (!uiIndex.includes("StaleObservationConfirmationCard,")) throw new Error("Gate stale não foi exportado pela UI v2.");

console.log("✅ Observação stale exige confirmação por decisão/medição e possui gate visual obrigatório.");
