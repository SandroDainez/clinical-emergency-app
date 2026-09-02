#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(root, "protocol-evidence", "avc.ts"), "utf8");
const tree = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const failures = [];

for (const nodeId of ["tempo", "tc", "isq_janela"]) {
  if (!tree.includes(`${nodeId}: {`) && !tree.includes(`id: "${nodeId}"`)) {
    failures.push(`binding aponta para nó inexistente no AVC: ${nodeId}`);
  }
  if (!registry.includes(`nodeId: "${nodeId}"`)) failures.push(`registry perdeu binding: ${nodeId}`);
}
for (const token of ["2026", "reviewedAt", "avc_tenecteplase_025_max25", "0,25 mg/kg", "máximo 25 mg"]) {
  if (!registry.includes(token)) failures.push(`registry AVC perdeu token de governança: ${token}`);
}
if (registry.includes("DecisionTreeEngine") || registry.includes("router.")) {
  failures.push("registry de evidência ultrapassou fronteira de governança");
}

if (failures.length) {
  console.error("\n❌ Evidence registry — AVC\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log("✅ Registry de evidência do AVC está vinculado a nós reais e versionado.");
