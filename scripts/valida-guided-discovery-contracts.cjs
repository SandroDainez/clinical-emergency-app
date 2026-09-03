#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contract = fs.readFileSync(path.join(root, "lib/guided-discovery-contract.ts"), "utf8");
const registry = fs.readFileSync(path.join(root, "lib/guided-discovery-registry.ts"), "utf8");
const reexport = fs.readFileSync(path.join(root, "clinical-safety-cases/guided-discovery.ts"), "utf8");
const policy = fs.readFileSync(path.join(root, "clinical-safety-cases/uncertainty-classification.ts"), "utf8");
const avc = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const sca = fs.readFileSync(path.join(root, "coronary-decision-tree.ts"), "utf8");
const tachy = fs.readFileSync(path.join(root, "acls-tachycardia-tree.ts"), "utf8");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const tep = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");

for (const token of [
  '"existing_node" | "prepared_plan"',
  "missingInformation",
  "sufficientWhen",
  "returnDecisionNodeId",
  "steps.length < 1 || entry.steps.length > 3",
]) {
  if (!contract.includes(token)) throw new Error(`Contrato de descoberta incompleto: ${token}`);
}

if (!reexport.includes('from "../lib/guided-discovery-registry"')) {
  throw new Error("Safety case deve reexportar o registry canônico de lib/.");
}

const expected = [
  ["avc", "hic_anticoag", "missing_history"],
  ["sindromes-coronarianas", "stemi_reperfusao", "external_operational_data"],
  ["taquicardia-acls", "assess_stability", "clinical_interpretation"],
  ["choque", "inicio", "clinical_interpretation"],
  ["tep", "estabilidade", "clinical_interpretation"],
];
for (const [protocolId, nodeId, source] of expected) {
  if (!registry.includes(`protocolId: "${protocolId}"`) || !registry.includes(`decisionNodeId: "${nodeId}"`)) {
    throw new Error(`Descoberta ausente: ${protocolId}:${nodeId}`);
  }
  if (!policy.includes(`protocolId: "${protocolId}"`) || !policy.includes(`nodeId: "${nodeId}"`) || !policy.includes(`source: "${source}"`)) {
    throw new Error(`Política não cobre origem esperada: ${protocolId}:${nodeId}:${source}`);
  }
}

for (const [text, id] of [
  [avc, "hic_anticoag"],
  [sca, "stemi_reperfusao"],
  [tachy, "assess_stability"],
  [tachy, "tqi_dados"],
  [shock, "inicio"],
  [shock, "choque_dados"],
  [tep, "estabilidade"],
  [tep, "tep_instab_dados"],
]) {
  if (!text.includes(`id: "${id}"`)) throw new Error(`Nó real ausente: ${id}`);
}

for (const [tree, guidedId] of [
  [avc, "hic_anticoag_descoberta"],
  [sca, "stemi_reperfusao_descoberta"],
]) {
  if (!tree.includes(`id: "${guidedId}"`)) {
    throw new Error(`Nó de descoberta existente ausente da árvore: ${guidedId}`);
  }
  if (!registry.includes(`guidedNodeId: "${guidedId}"`)) {
    throw new Error(`Registry não aponta para o nó de descoberta existente: ${guidedId}`);
  }
}

if (!tachy.includes('{ id: "guiado", label: OPCAO_GUIADA, next: "tqi_dados" }')) {
  throw new Error("Aresta guiada da taquicardia foi perdida.");
}
if (!shock.includes('{ id: "guiado", label: OPCAO_GUIADA, next: "choque_dados" }')) {
  throw new Error("Aresta guiada do choque foi perdida.");
}
if (!tep.includes('{ id: "guiado", label: OPCAO_GUIADA, next: "tep_instab_dados" }')) {
  throw new Error("Aresta guiada do TEP foi perdida.");
}

console.log("Contratos de descoberta guiada coerentes com política, registry canônico e árvores reais.");
