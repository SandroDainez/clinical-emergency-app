#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const treeFiles = fs.readdirSync(root).filter((name) => name.endsWith("-decision-tree.ts"));
const evidenceDir = path.join(root, "protocol-evidence");
const registryFiles = fs.existsSync(evidenceDir)
  ? fs.readdirSync(evidenceDir).filter((name) => name.endsWith(".ts"))
  : [];

const actionableTypes = new Set(["action", "decision", "input", "transition"]);

function nodeIdsFromTree(text) {
  const ids = [];
  const regex = /\n\s{4}([A-Za-z0-9_]+):\s*\{[\s\S]{0,500}?\n\s{6}id:\s*["']([^"']+)["'][\s\S]{0,250}?\n\s{6}type:\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(text))) {
    const id = match[2];
    const type = match[3];
    if (actionableTypes.has(type)) ids.push(id);
  }
  return [...new Set(ids)];
}

function boundIdsFromRegistry(text) {
  return [...text.matchAll(/nodeId:\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

const registryByStem = new Map(
  registryFiles.map((file) => [file.replace(/\.ts$/, ""), fs.readFileSync(path.join(evidenceDir, file), "utf8")])
);

const rows = [];
for (const file of treeFiles.sort()) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const nodeIds = nodeIdsFromTree(text);
  const stem = file.replace(/-decision-tree\.ts$/, "");
  const registry = registryByStem.get(stem) ?? "";
  const bound = new Set(boundIdsFromRegistry(registry));
  const covered = nodeIds.filter((id) => bound.has(id));
  rows.push({
    file,
    actionable: nodeIds.length,
    covered: covered.length,
    missing: nodeIds.filter((id) => !bound.has(id)),
  });
}

console.log("\nCobertura de evidência por nó acionável\n");
for (const row of rows) {
  const pct = row.actionable ? Math.round((row.covered / row.actionable) * 100) : 0;
  console.log(`${row.file}: ${row.covered}/${row.actionable} (${pct}%)`);
  if (row.missing.length) console.log(`  sem binding: ${row.missing.slice(0, 20).join(", ")}${row.missing.length > 20 ? " …" : ""}`);
}

console.log("\nℹ️ Inventário informativo: cobertura zero não falha o build durante a migração.");
