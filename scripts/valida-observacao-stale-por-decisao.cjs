const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gate = fs.readFileSync(path.join(root, "lib/clinical-observation-decision-gate.ts"), "utf8");
const reset = fs.readFileSync(path.join(root, "lib/clinical-session-runtime.ts"), "utf8");

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

console.log("✅ Observação stale exige confirmação por decisão e por medição.");
