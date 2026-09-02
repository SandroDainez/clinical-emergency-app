#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const drug = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "alteplase.ts"), "utf8");
const legacy = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const evidence = fs.readFileSync(path.join(root, "protocol-evidence", "avc.ts"), "utf8");
const failures = [];

for (const required of ["0,9 mg/kg", "90 mg", "10%", "60 min", "avc_isquemico_ivt"]) {
  if (!drug.includes(required)) failures.push(`alteplase canônica sem ${required}`);
}

for (const forbidden of ["TEP", "IAM", "100 mg em 2 h", "50 mg em bolus"]) {
  if (drug.includes(forbidden)) failures.push(`entrada AVC misturou outro contexto: ${forbidden}`);
}

for (const legacyToken of ["0,9 mg/kg", "90", "alteplaseBolus", "alteplaseInfusao"]) {
  if (!legacy.includes(legacyToken)) failures.push(`fonte legada do AVC não contém ${legacyToken}`);
}

if (!evidence.includes("avc_alteplase_09_max90")) failures.push("registry do AVC sem recomendação canônica de alteplase");
if (!evidence.includes('nodeId: "isq_janela"')) failures.push("alteplase não está vinculada ao nó de reperfusão do AVC");

if (failures.length) {
  console.error("\n❌ Alteplase canônica — paridade e isolamento de indicação\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("✅ Alteplase no AVC preserva dose legada e permanece isolada de TEP/IAM.");
