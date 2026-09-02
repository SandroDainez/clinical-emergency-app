#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const classification = fs.readFileSync(path.join(root, "clinical-safety-cases/module-terminal-classification.ts"), "utf8");
const debts = fs.readFileSync(path.join(root, "clinical-safety-cases/missing-terminal-disposition-debts.ts"), "utf8");
const trauma = fs.readFileSync(path.join(root, "politrauma-decision-tree.ts"), "utf8");
const ira = fs.readFileSync(path.join(root, "ira-decision-tree.ts"), "utf8");

for (const protocolId of ["politrauma", "injuria_renal_aguda"]) {
  if (!classification.includes(`protocolId: "${protocolId}"`)) {
    throw new Error(`Care pathway não classificado: ${protocolId}`);
  }
  if (!debts.includes(`protocolId: "${protocolId}"`)) {
    throw new Error(`Dívida terminal não registrada: ${protocolId}`);
  }
}

for (const [source, protocolId] of [[trauma, "politrauma"], [ira, "injuria_renal_aguda"]]) {
  if (!source.includes(`id: "${protocolId}"`)) throw new Error(`protocolId real ausente: ${protocolId}`);
  if (/disposition:\s*"(discharge|observation|icu)"/.test(source)) {
    throw new Error(`${protocolId}: árvore ganhou disposition assistencial; revisar/remover dívida em vez de mantê-la obsoleta.`);
  }
  if (!source.includes('disposition: "other_module"')) {
    throw new Error(`${protocolId}: evidência de handoff other_module não encontrada.`);
  }
}

console.log("Dívidas terminais de politrauma e IRA permanecem explícitas e coerentes com as árvores atuais.");
