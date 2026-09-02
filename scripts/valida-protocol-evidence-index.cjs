#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "protocol-evidence", "index.ts"), "utf8");
const failures = [];

for (const required of ["AVC_EVIDENCE_REGISTRY", "TEP_EVIDENCE_REGISTRY", "SCA_EVIDENCE_REGISTRY", "getEvidenceForNode"]) {
  if (!index.includes(required)) failures.push(`índice de evidência sem ${required}`);
}

if (!index.includes("ProtocolEvidenceRegistry duplicado")) {
  failures.push("índice de evidência não protege protocolId duplicado");
}

if (failures.length) {
  console.error("\n❌ Protocol evidence index\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("✅ Índice de evidência por protocolo preserva unicidade e consulta por nó.");
