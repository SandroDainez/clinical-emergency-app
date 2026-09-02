#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const transitions = fs.readFileSync(path.join(root, "lib/clinical-transitions.ts"), "utf8");
const contracts = fs.readFileSync(path.join(root, "lib/clinical-transition-contracts.ts"), "utf8");
const trauma = fs.readFileSync(path.join(root, "politrauma-decision-tree.ts"), "utf8");
const tce = fs.readFileSync(path.join(root, "tce-decision-tree.ts"), "utf8");

for (const token of [
  '"module" | "external_service"',
  "externalLabel",
  'destinationKind === "external_service" && contract.mode !== "terminal"',
  'contract.mode === "terminal" && contract.returnLabel?.trim()',
]) {
  if (!transitions.includes(token)) throw new Error(`Contrato de handoff externo incompleto: ${token}`);
}

function getEntry(id) {
  const marker = `id: "${id}"`;
  const start = contracts.indexOf(marker);
  if (start < 0) throw new Error(`Contrato terminal ausente: ${id}`);
  const next = contracts.indexOf("\n  {", start + marker.length);
  return contracts.slice(start, next > start ? next : undefined);
}

for (const [id, from] of [
  ["politrauma-damage-control", "politrauma"],
  ["tce-neurocirurgia", "tce"],
]) {
  const entry = getEntry(id);
  for (const token of [
    `from: "${from}"`,
    'mode: "terminal"',
    'destinationKind: "external_service"',
    "externalLabel:",
  ]) {
    if (!entry.includes(token)) throw new Error(`${id} sem ${token}`);
  }
  if (entry.includes("returnLabel:")) throw new Error(`${id}: terminal externo não pode declarar retorno.`);
}

for (const token of [
  'id: "damage_control"',
  'disposition: "other_module"',
  "Sala cirúrgica IMEDIATA",
  "angioembolização",
]) {
  if (!trauma.includes(token)) throw new Error(`Árvore do politrauma não sustenta handoff terminal: ${token}`);
}

for (const token of [
  'id: "neurocirurgia"',
  'disposition: "other_module"',
  "Neurocirurgia IMEDIATA",
]) {
  if (!tce.includes(token)) throw new Error(`Árvore do TCE não sustenta handoff terminal: ${token}`);
}

console.log("Handoffs externos terminais coerentes com contrato e árvores reais.");
