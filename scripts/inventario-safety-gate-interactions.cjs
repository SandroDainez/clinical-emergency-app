#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const candidateFiles = fs.readdirSync(root)
  .filter((name) => name.endsWith(".ts"))
  .filter((name) => /(?:decision-tree|acls-.*-tree)\.ts$/.test(name));

const declarations = [];
for (const file of candidateFiles) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of src.matchAll(/clinicalActionId:\s*"([^"]+)"/g)) {
    const before = src.slice(Math.max(0, match.index - 1200), match.index);
    const idMatches = [...before.matchAll(/id:\s*"([^"]+)"/g)];
    const typeMatches = [...before.matchAll(/type:\s*"(action|decision)"/g)];
    declarations.push({
      file,
      nodeOrOptionId: idMatches.at(-1)?.[1] ?? "?",
      nearbyNodeType: typeMatches.at(-1)?.[1] ?? "decision-option",
      actionId: match[1],
    });
  }
}

const registry = fs.readFileSync(path.join(root, "lib/clinical-gate-trigger-registry.ts"), "utf8");
const protectedActionIds = new Set([...registry.matchAll(/actionId:\s*"([^"]+)"/g)].map((m) => m[1]));
const uniqueActionIds = new Set(declarations.map((d) => d.actionId));
const unclassified = [...uniqueActionIds].filter((id) => !protectedActionIds.has(id));
const orphanTriggers = [...protectedActionIds].filter((id) => !uniqueActionIds.has(id));

console.log("SafetyGate interaction inventory");
console.log(`- tree files scanned: ${candidateFiles.length}`);
console.log(`- clinicalActionId declarations: ${declarations.length}`);
console.log(`- unique clinicalActionId values: ${uniqueActionIds.size}`);
console.log(`- trigger actionIds: ${protectedActionIds.size}`);
for (const item of declarations) {
  const protectedLabel = protectedActionIds.has(item.actionId) ? "protected" : "unclassified";
  console.log(`  ${protectedLabel}: ${item.file} :: ${item.nodeOrOptionId} :: ${item.actionId}`);
}
if (unclassified.length) {
  console.log(`- unclassified declared interactions (audit debt, not error): ${unclassified.join(", ")}`);
} else {
  console.log("- unclassified declared interactions: 0");
}
if (orphanTriggers.length) {
  console.error(`❌ trigger actionIds without tree declaration: ${orphanTriggers.join(", ")}`);
  process.exit(1);
}
console.log("✅ every trigger actionId maps to at least one declared tree interaction.");
