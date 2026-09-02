#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(root, "protocol-evidence", "tep.ts"), "utf8");
const tree = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");
const alteplase = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "alteplase.ts"), "utf8");
const failures = [];

for (const nodeId of ["estratificacao", "ar_trombolise"]) {
  if (!tree.includes(`${nodeId}: {`) || !tree.includes(`id: "${nodeId}"`)) {
    failures.push(`binding TEP aponta para nó inexistente: ${nodeId}`);
  }
  if (!registry.includes(`nodeId: "${nodeId}"`)) failures.push(`registry TEP sem binding ${nodeId}`);
}

for (const expected of [
  'indicationId: "tep_agudo_trombolise_sistemica"',
  'dose: "100 mg"',
  'rate: "infusão sistêmica em 2 h"',
]) {
  if (!alteplase.includes(expected)) failures.push(`alteplase TEP sem paridade: ${expected}`);
}

if (/indicationId:\s*"tep_pcr/.test(alteplase)) {
  failures.push("Drug Knowledge Base não deve inventar dose canônica de alteplase para PCR por TEP");
}

if (failures.length) {
  console.error("\n❌ Evidence governance — TEP\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("✅ TEP: evidence bindings e alteplase sistêmica preservam indicação e isolamento da PCR.");
