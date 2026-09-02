#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const classification = fs.readFileSync(path.join(root, "clinical-safety-cases/module-terminal-classification.ts"), "utf8");
const contract = fs.readFileSync(path.join(root, "lib/clinical-module-terminal-contract.ts"), "utf8");
const graphAudit = fs.readFileSync(path.join(root, "lib/clinical-graph-audit.ts"), "utf8");
const avc = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const anaphylaxis = fs.readFileSync(path.join(root, "anaphylaxis-decision-tree.ts"), "utf8");
const rsi = fs.readFileSync(path.join(root, "rsi-decision-tree.ts"), "utf8");

for (const token of [
  '"care_pathway" | "procedural_subflow"',
  "requiresClinicalDisposition",
  "requiresReturnToOrigin",
]) {
  if (!contract.includes(token)) throw new Error(`Contrato terminal incompleto: ${token}`);
}

for (const [text, protocolId] of [
  [avc, "avc_agudo_2024"],
  [anaphylaxis, "anaphylaxis_v3"],
  [rsi, "isr_rsi_adulto"],
]) {
  if (!text.includes(`id: "${protocolId}"`)) throw new Error(`protocolId real não encontrado: ${protocolId}`);
  if (!classification.includes(`protocolId: "${protocolId}"`)) throw new Error(`classificação terminal ausente: ${protocolId}`);
}

if (!classification.includes('protocolId: "avc_agudo_2024"') || !classification.includes('mode: "care_pathway"')) {
  throw new Error("AVC deve ser care_pathway.");
}
if (!classification.includes('protocolId: "anaphylaxis_v3"')) {
  throw new Error("Anafilaxia deve estar classificada.");
}
if (!classification.includes('protocolId: "isr_rsi_adulto"') || !classification.includes('mode: "procedural_subflow"')) {
  throw new Error("ISR deve ser procedural_subflow.");
}

if (!graphAudit.includes('node.disposition !== "other_module"')) {
  throw new Error("Auditor de destino voltou a contar other_module como disposição assistencial.");
}
if (!graphAudit.includes('node.disposition === "other_module"')) {
  throw new Error("Auditor perdeu inventário separado de handoffs para outros módulos.");
}

for (const source of [avc, anaphylaxis]) {
  if (!/disposition:\s*"(discharge|observation|icu)"/.test(source)) {
    throw new Error("Care pathway piloto sem disposition assistencial explícita.");
  }
}

console.log("Classificação terminal dos pilotos coerente com árvores reais e auditor de grafo.");
