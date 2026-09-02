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
  if (debts.includes(`protocolId: "${protocolId}"`)) {
    throw new Error(`Dívida terminal obsoleta ainda registrada: ${protocolId}`);
  }
}

if (!trauma.includes('id: "destino"') || !trauma.includes('id: "uti"') || !trauma.includes('id: "observacao"')) {
  throw new Error("Politrauma perdeu nós explícitos de destino.");
}
if (!/disposition:\s*"icu"/.test(trauma) || !/disposition:\s*"observation"/.test(trauma)) {
  throw new Error("Politrauma perdeu disposition assistencial explícito.");
}

if (!ira.includes('id: "destino_monitorizado"') || !ira.includes('id: "destino_suporte"')) {
  throw new Error("IRA perdeu nós terminais explícitos.");
}
if (!/disposition:\s*"observation"/.test(ira) || !/disposition:\s*"icu"/.test(ira)) {
  throw new Error("IRA perdeu disposition assistencial explícito.");
}

console.log("Politrauma e IRA têm destinos assistenciais explícitos; debt registry permanece limpo.");
