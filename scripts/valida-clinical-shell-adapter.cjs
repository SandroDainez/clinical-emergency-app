#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "lib", "clinical-shell-adapter.ts");
const text = fs.readFileSync(file, "utf8");
const failures = [];

if (!text.includes("crisisActionsForModule")) failures.push("adapter não usa o registro canônico de portas de crise");
if (!text.includes("formatObservationAge")) failures.push("adapter não carrega idade da observação");
if (!text.includes("slice(0, 4)")) failures.push("cockpit pode ultrapassar quatro métricas persistentes");
for (const forbidden of ["DecisionTreeEngine", "router.push", "router.replace", "choose(", "advance("]) {
  if (text.includes(forbidden)) failures.push(`adapter ultrapassou fronteira de apresentação: ${forbidden}`);
}

if (failures.length) {
  console.error("\n❌ Clinical shell adapter\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("✅ Clinical shell adapter preserva fronteira apresentacional e idade do dado.");
