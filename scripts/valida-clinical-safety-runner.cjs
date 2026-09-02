#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "lib", "clinical-safety-runner.ts");
const text = fs.readFileSync(file, "utf8");
const failures = [];

if (!text.includes("new DecisionTreeEngine(tree)")) failures.push("runner não usa a mesma DecisionTreeEngine do app");
for (const instruction of ["set", "choose", "advance", "goto"]) {
  if (!text.includes(`type: \"${instruction}\"`)) failures.push(`runner perdeu instrução explícita ${instruction}`);
}
for (const forbidden of ["fetch(", "Math.random", "OpenAI", "anthropic", "llm", "prompt"]) {
  if (text.toLowerCase().includes(forbidden.toLowerCase())) failures.push(`runner ganhou dependência não determinística: ${forbidden}`);
}

if (failures.length) {
  console.error("\n❌ Clinical safety runner\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log("✅ Clinical safety runner usa o motor existente e permanece determinístico.");
