#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const policy = fs.readFileSync(path.join(root, "clinical-safety-cases/uncertainty-classification.ts"), "utf8");
const avc = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const isr = fs.readFileSync(path.join(root, "rsi-decision-tree.ts"), "utf8");
const tachy = fs.readFileSync(path.join(root, "acls-tachycardia-tree.ts"), "utf8");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");

const requiredPolicyTokens = [
  'nodeId: "isq_pa_check"',
  'classification: "binary_observable"',
  'nodeId: "confirmacao"',
  'nodeId: "hic_anticoag"',
  'classification: "unknown_required"',
  'nodeId: "assess_stability"',
  'guidedNodeId: "tqi_dados"',
  'nodeId: "inicio"',
  'guidedNodeId: "choque_dados"',
];
for (const token of requiredPolicyTokens) {
  if (!policy.includes(token)) throw new Error(`Classificação de incerteza incompleta: ${token}`);
}

const realNodes = [
  [avc, "isq_pa_check"],
  [avc, "hic_anticoag"],
  [isr, "confirmacao"],
  [tachy, "assess_stability"],
  [tachy, "tqi_dados"],
  [shock, "inicio"],
  [shock, "choque_dados"],
];
for (const [text, id] of realNodes) {
  if (!text.includes(`id: "${id}"`)) throw new Error(`Nó classificado não existe: ${id}`);
}

if (!tachy.includes('{ id: "guiado", label: OPCAO_GUIADA, next: "tqi_dados" }')) {
  throw new Error("Taquicardia perdeu a aresta guiada assess_stability -> tqi_dados.");
}
if (!shock.includes('{ id: "guiado", label: OPCAO_GUIADA, next: "choque_dados" }')) {
  throw new Error("Choque perdeu a aresta guiada inicio -> choque_dados.");
}

console.log("Primeira classificação de incerteza aponta para nós e arestas reais.");
