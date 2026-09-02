#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const debts = fs.readFileSync(path.join(root, "clinical-safety-cases/terminal-semantic-debts.ts"), "utf8");
const rsi = fs.readFileSync(path.join(root, "rsi-decision-tree.ts"), "utf8");

for (const token of [
  'protocolId: "isr_rsi_adulto"',
  'nodeId: "adiar_iot"',
  'currentDisposition: "observation"',
]) {
  if (!debts.includes(token)) throw new Error(`Dívida terminal incompleta: ${token}`);
}

if (!rsi.includes('adiar_iot: {') || !rsi.includes('id: "adiar_iot"')) {
  throw new Error("Nó real adiar_iot não encontrado na ISR.");
}
const start = rsi.indexOf('adiar_iot: {');
const end = rsi.indexOf('\n    },', start);
const block = rsi.slice(start, end > start ? end : start + 1800);
if (!block.includes('disposition: "observation"')) {
  throw new Error("Dívida da ISR mudou: adiar_iot não usa mais observation; revisar/remover registry.");
}

console.log("Dívidas semânticas de terminal apontam para nós reais.");
