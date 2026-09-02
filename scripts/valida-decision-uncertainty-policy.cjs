#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "../lib/decision-uncertainty-policy.ts");
const text = fs.readFileSync(file, "utf8");
const failures = [];

for (const token of ["unknown_required", "binary_observable", "guided_elsewhere", "rationale", "guidedNodeId", "reviewedAt"]) {
  if (!text.includes(token)) failures.push(`decision uncertainty policy sem ${token}`);
}
if (!/dispensar ramo de incerteza exige justificativa/.test(text)) {
  failures.push("policy não exige justificativa para dispensar ramo de incerteza");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("decision uncertainty policy: OK");
