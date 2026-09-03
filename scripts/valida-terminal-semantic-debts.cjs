#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const debts = fs.readFileSync(path.join(root, "clinical-safety-cases/terminal-semantic-debts.ts"), "utf8");
const classification = fs.readFileSync(path.join(root, "clinical-safety-cases/module-terminal-classification.ts"), "utf8");
const rsi = fs.readFileSync(path.join(root, "rsi-decision-tree.ts"), "utf8");

if (!debts.includes("TERMINAL_SEMANTIC_DEBTS: readonly TerminalSemanticDebt[] = []")) {
  throw new Error("Registry de dívidas terminais deixou de estar explicitamente vazio.");
}
for (const token of ['protocolId: "isr_rsi_adulto"', 'mode: "embedded_care_pathway"']) {
  if (!classification.includes(token)) throw new Error(`Classificação terminal da ISR incompleta: ${token}`);
}

if (!rsi.includes('adiar_iot: {') || !rsi.includes('id: "adiar_iot"')) {
  throw new Error("Nó real adiar_iot não encontrado na ISR.");
}
const start = rsi.indexOf('adiar_iot: {');
const end = rsi.indexOf('\n    },', start);
const block = rsi.slice(start, end > start ? end : start + 1800);
if (!block.includes('disposition: "observation"')) {
  throw new Error("ISR mudou: adiar_iot não usa mais observation; revisar classificação embedded_care_pathway.");
}

console.log("Dívidas semânticas terminais zeradas; ISR permanece classificada como embedded_care_pathway.");
