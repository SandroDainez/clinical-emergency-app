#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const classification = fs.readFileSync(path.join(root, "clinical-safety-cases/module-terminal-classification.ts"), "utf8");
const contract = fs.readFileSync(path.join(root, "lib/clinical-module-terminal-contract.ts"), "utf8");
const graphAudit = fs.readFileSync(path.join(root, "lib/clinical-graph-audit.ts"), "utf8");

for (const token of [
  '"embedded_care_pathway"',
  "requiresClinicalDisposition",
  "requiresReturnToOrigin",
]) {
  if (!contract.includes(token)) throw new Error(`Contrato terminal incompleto: ${token}`);
}

const expected = [
  ["avc-decision-tree.ts", "avc_agudo_2024", "care_pathway"],
  ["anaphylaxis-decision-tree.ts", "anaphylaxis_v3", "care_pathway"],
  ["tep-decision-tree.ts", "tep_2024", "care_pathway"],
  ["shock-decision-tree.ts", "choque", "care_pathway"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "care_pathway"],
  ["tce-decision-tree.ts", "tce", "care_pathway"],
  ["seizure-decision-tree.ts", "mal_epileptico", "care_pathway"],
  ["eap-decision-tree.ts", "eap_2024", "care_pathway"],
  ["rsi-decision-tree.ts", "isr_rsi_adulto", "embedded_care_pathway"],
];

for (const [file, protocolId, mode] of expected) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (!text.includes(`id: "${protocolId}"`)) throw new Error(`protocolId real não encontrado: ${protocolId}`);
  if (!classification.includes(`protocolId: "${protocolId}"`)) throw new Error(`classificação terminal ausente: ${protocolId}`);
  const entryStart = classification.indexOf(`protocolId: "${protocolId}"`);
  const entryEnd = classification.indexOf("reviewedAt", entryStart);
  const entry = classification.slice(entryStart, entryEnd);
  if (!entry.includes(`mode: "${mode}"`)) throw new Error(`modo terminal incorreto: ${protocolId}`);
  if ((mode === "care_pathway" || mode === "embedded_care_pathway") && !/disposition:\s*"(discharge|observation|icu)"/.test(text)) {
    throw new Error(`Linha de cuidado sem disposition assistencial explícita: ${protocolId}`);
  }
  if (mode === "embedded_care_pathway" && (!entry.includes("requiresClinicalDisposition: true") || !entry.includes("requiresReturnToOrigin: true"))) {
    throw new Error(`${protocolId}: embedded_care_pathway precisa de destino próprio e retorno à origem.`);
  }
}

if (!graphAudit.includes('node.disposition !== "other_module"')) {
  throw new Error("Auditor de destino voltou a contar other_module como disposição assistencial.");
}
if (!graphAudit.includes('node.disposition === "other_module"')) {
  throw new Error("Auditor perdeu inventário separado de handoffs para outros módulos.");
}

console.log("Classificação terminal ampliada coerente com árvores reais e módulos embutíveis.");
