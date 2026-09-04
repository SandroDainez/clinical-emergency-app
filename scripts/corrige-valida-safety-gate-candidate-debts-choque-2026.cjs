#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "valida-safety-gate-candidate-debts.cjs");
let text = fs.readFileSync(file, "utf8");
const oldLine = 'expect(shock.includes("evitar expansão volêmica"), "choque cardiogênico: alerta de evitar expansão volêmica deixou de existir");';
const newLine = 'expect(/(?:evitar expansão volêmica|NÃO usar expansão volêmica empírica)/.test(shock), "choque cardiogênico: proteção contra expansão volêmica empírica no fenótipo congesto deixou de existir");';

if (text.includes(newLine)) {
  console.log("✅ Validator de dívida de gate já está na semântica atual.");
  process.exit(0);
}
if (!text.includes(oldLine)) {
  console.error("❌ Assert antigo de expansão volêmica não localizado; reauditar validator antes de alterar.");
  process.exit(1);
}
text = text.replace(oldLine, newLine);
fs.writeFileSync(file, text);
console.log("✅ SafetyGate candidate validator: assert de choque cardiogênico atualizado para semântica atual.");
