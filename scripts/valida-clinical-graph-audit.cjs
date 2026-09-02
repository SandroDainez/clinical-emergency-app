#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "lib", "clinical-graph-audit.ts");

if (!fs.existsSync(file)) {
  console.error("❌ lib/clinical-graph-audit.ts ausente");
  process.exit(1);
}

const src = fs.readFileSync(file, "utf8");
const required = [
  "reachableNodeIds",
  "findReassessmentNodes",
  "findDispositionNodes",
  "auditReassessmentAndDisposition",
];

const missing = required.filter((token) => !src.includes(token));
if (missing.length) {
  for (const token of missing) console.error(`❌ auditoria de grafo perdeu: ${token}`);
  process.exit(1);
}

if (/fetch\(|axios|openai|anthropic|gemini|Math\.random/i.test(src)) {
  console.error("❌ auditoria de grafo deve permanecer determinística e offline");
  process.exit(1);
}

console.log("✅ auditoria clínica de grafo preservada");
