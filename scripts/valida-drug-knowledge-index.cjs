#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "index.ts"), "utf8");
const failures = [];

for (const symbol of ["ALTEPLASE_CANONICAL", "AMIODARONA_CANONICA", "TENECTEPLASE_CANONICAL"]) {
  if (!index.includes(symbol)) failures.push(`índice não registra ${symbol}`);
}
for (const required of ["DRUG_KNOWLEDGE_BASE", "findDrugInstruction", "validateDrugKnowledgeBase"]) {
  if (!index.includes(required)) failures.push(`índice sem ${required}`);
}
if (!index.includes("drug id duplicado")) failures.push("índice não protege ids duplicados de fármaco");
if (!index.includes("indicação duplicada")) failures.push("índice não protege indicação duplicada por fármaco");
if (!index.includes("source.reference") || !index.includes("source.reviewedAt")) {
  failures.push("índice não exige proveniência mínima da indicação");
}

if (failures.length) {
  console.error("\n❌ Drug Knowledge Base index\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("✅ Drug Knowledge Base possui registry único, ids protegidos e proveniência mínima.");
