const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gate = fs.readFileSync(path.join(root, "lib/clinical-observation-decision-gate.ts"), "utf8");
const consumers = fs.readFileSync(path.join(root, "lib/clinical-observation-consumer-bindings.ts"), "utf8");
const adapter = fs.readFileSync(path.join(root, "lib/clinical-gate-context-adapter.ts"), "utf8");
const patientStateGate = fs.readFileSync(path.join(root, "lib/clinical-action-gate-patient-state.ts"), "utf8");
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

// A validade pertence exclusivamente à decisão consumidora. O adapter de fatos
// não pode voltar a inventar TTL global para uma observação clínica.
if (adapter.includes("maxAgeMs")) {
  throw new Error("Validade global reapareceu no ClinicalGateFactBinding; use policy da decisão consumidora.");
}
if (!adapter.includes("resolveObservationForDecision(policy, now)")) {
  throw new Error("Adapter não encaminha política da decisão ao runtime de stale.");
}
if (!adapter.includes("decisionPolicies: readonly ObservationDecisionPolicy[] = []")) {
  throw new Error("Adapter não expõe policies explícitas por decisão consumidora.");
}

for (const contract of [
  "ClinicalObservationConsumerBinding",
  "protocolId: string",
  "actionId: string",
  "decisionId: string",
  "observationId: string",
  "freshForMs: number",
  "staleAfterMs: number",
  "observationDecisionPoliciesForAction",
  "validateClinicalObservationConsumerBindings",
]) {
  if (!consumers.includes(contract)) throw new Error(`Binding consumidor incompleto: ${contract}`);
}

if (!consumers.includes("CLINICAL_OBSERVATION_CONSUMER_BINDINGS: readonly ClinicalObservationConsumerBinding[]")) {
  throw new Error("Registry canônico de consumidores de observações ausente.");
}
if (!consumers.includes("começa vazio de propósito")) {
  throw new Error("Registry precisa documentar por que não existem TTLs clínicos arbitrários iniciais.");
}

for (const contract of [
  "observationDecisionPoliciesForAction",
  "protocolId: input.protocolId",
  "nodeId: input.nodeId",
  "actionId: input.actionId",
  "decisionPolicies",
]) {
  if (!patientStateGate.includes(contract)) {
    throw new Error(`Patient State não liga consumidor ao gate temporal: ${contract}`);
  }
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

console.log("✅ Freshness pertence à decisão consumidora; stale exige confirmação por decisão/medição e possui gate visual.");
