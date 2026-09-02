#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contracts = fs.readFileSync(path.join(root, "lib/clinical-transition-contracts.ts"), "utf8");
const ira = fs.readFileSync(path.join(root, "ira-decision-tree.ts"), "utf8");
const trauma = fs.readFileSync(path.join(root, "politrauma-decision-tree.ts"), "utf8");

const expected = [
  ["ira-abcde-a-isr", ira, "abcde_a", "isr-rapida"],
  ["ira-abcde-b-vm", ira, "abcde_b", "ventilacao-mecanica"],
  ["ira-abcde-b-eap", ira, "abcde_b", "edema-agudo-pulmao"],
  ["ira-abcde-c-choque", ira, "abcde_c_perfusao", "choque"],
  ["ira-abcde-c-vasoativos", ira, "abcde_c_perfusao", "drogas-vasoativas"],
  ["ira-abcde-c-bradicardia", ira, "abcde_c_ritmo", "bradicardia-acls"],
  ["ira-abcde-c-taquicardia", ira, "abcde_c_ritmo", "taquicardia-acls"],
  ["ira-abcde-d-isr", ira, "abcde_d_rebaixamento", "isr-rapida"],
  ["ira-abcde-d-convulsao", ira, "abcde_d_convulsao", "crises-convulsivas"],
  ["politrauma-tce", trauma, "tce_transicao", "tce"],
];

for (const [contractId, source, nodeId, moduleId] of expected) {
  if (!contracts.includes(`id: "${contractId}"`)) throw new Error(`Contrato ausente: ${contractId}`);
  if (!contracts.includes(`to: "${moduleId}"`)) throw new Error(`Destino ausente no registry: ${contractId} -> ${moduleId}`);
  const nodeStart = source.indexOf(`${nodeId}: {`);
  if (nodeStart < 0) throw new Error(`Nó real ausente: ${nodeId}`);
  const window = source.slice(nodeStart, nodeStart + 2200);
  if (!window.includes('disposition: "other_module"')) throw new Error(`${nodeId}: deixou de ser handoff other_module`);
  if (!window.includes(`moduleId: "${moduleId}"`)) throw new Error(`${nodeId}: target real ${moduleId} não encontrado`);
}

const returnableCount = (contracts.match(/mode: "returnable"/g) || []).length;
if (returnableCount !== expected.length) {
  throw new Error(`Esperadas ${expected.length} arestas retornáveis iniciais; encontradas ${returnableCount}.`);
}
if ((contracts.match(/returnLabel:/g) || []).length !== expected.length) {
  throw new Error("Toda aresta retornável inicial precisa de returnLabel.");
}

console.log("Contratos iniciais de transição clínica correspondem aos targets reais de IRA e Politrauma.");
