#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const bindings = fs.readFileSync(path.join(root, "lib/clinical-reassessment-bindings.ts"), "utf8");
const tree = fs.readFileSync(path.join(root, "acls-tachycardia-tree.ts"), "utf8");
const failures = [];
for (const token of ["taquicardia-acls", "unstable_cardioversion", "unstable_reavaliar", 'therapyId: "cardioversion"']) {
  if (!bindings.includes(token)) failures.push(`binding ausente: ${token}`);
}
if (!/unstable_cardioversion:[\s\S]*?next:\s*["']unstable_reavaliar["']/.test(tree)) {
  failures.push("cardioversão instável não aponta diretamente para unstable_reavaliar");
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("OK — cardioversão exige reavaliação explícita");
