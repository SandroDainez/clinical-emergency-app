#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const roots = ["app", "components"];
const findings = [];

function walk(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return;

  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      walk(relativePath);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;

    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes("from_module=")) {
        findings.push(`${relativePath}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

roots.forEach(walk);

if (findings.length > 0) {
  throw new Error(
    [
      "Navegação clínica com from_module hardcoded voltou à UI. Use executor/contrato canônico:",
      ...findings,
    ].join("\n")
  );
}

console.log("✅ UI assistencial não monta from_module manualmente; proveniência pertence aos executores canônicos.");
