#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const transitions = fs.readFileSync(path.join(root, "lib/clinical-transitions.ts"), "utf8");
const contracts = fs.readFileSync(path.join(root, "lib/clinical-transition-contracts.ts"), "utf8");
const trauma = fs.readFileSync(path.join(root, "politrauma-decision-tree.ts"), "utf8");

for (const token of [
  '"module" | "external_service"',
  "externalLabel",
  'destinationKind === "external_service" && contract.mode !== "terminal"',
  'contract.mode === "terminal" && contract.returnLabel?.trim()',
]) {
  if (!transitions.includes(token)) throw new Error(`Contrato de handoff externo incompleto: ${token}`);
}

const id = 'id: "politrauma-damage-control"';
const start = contracts.indexOf(id);
if (start < 0) throw new Error("Contrato terminal do damage control ausente.");
const end = contracts.indexOf("},", start);
const entry = contracts.slice(start, end > start ? end : undefined);

for (const token of [
  'from: "politrauma"',
  'mode: "terminal"',
  'destinationKind: "external_service"',
  "externalLabel:",
]) {
  if (!entry.includes(token)) throw new Error(`Damage control sem ${token}`);
}
if (entry.includes("returnLabel:")) throw new Error("Damage control terminal não pode declarar retorno.");

for (const token of [
  'id: "damage_control"',
  'disposition: "other_module"',
  "Sala cirúrgica IMEDIATA",
  "angioembolização",
]) {
  if (!trauma.includes(token)) throw new Error(`Árvore do politrauma não sustenta handoff terminal: ${token}`);
}

console.log("Handoffs externos terminais coerentes com contrato e árvore real.");
