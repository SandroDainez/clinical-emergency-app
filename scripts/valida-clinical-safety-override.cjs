#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "../lib/clinical-safety-override.ts");
const text = fs.readFileSync(file, "utf8");
const failures = [];

if (!/reason:\s*string/.test(text)) failures.push("override sem campo reason obrigatório");
if (!/motivo obrigatório/.test(text)) failures.push("override não rejeita motivo vazio");
if (!/type:\s*["']safety_override["']/.test(text)) failures.push("override não gera evento safety_override");
if (!/severity/.test(text)) failures.push("override não registra severity");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("clinical safety override: OK");
