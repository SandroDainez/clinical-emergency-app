#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const classification = fs.readFileSync(path.join(root, "clinical-safety-cases/module-terminal-classification.ts"), "utf8");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".expo", "dist", "build"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/decision-tree\.tsx?$/.test(entry.name) || /-tree\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const trees = new Map();
for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8");
  if (!/DecisionTreeDefinition/.test(text)) continue;
  const id = (text.match(/\bid:\s*["']([^"']+)["']\s*,\s*\n\s*version:/) || [])[1];
  if (id) trees.set(id, { file, text });
}

const entries = [];
for (const match of classification.matchAll(/protocolId:\s*"([^"]+)"[\s\S]*?mode:\s*"(care_pathway|procedural_subflow)"[\s\S]*?reviewedAt:/g)) {
  entries.push({ protocolId: match[1], mode: match[2] });
}

const failures = [];
const warnings = [];
for (const entry of entries) {
  const tree = trees.get(entry.protocolId);
  if (!tree) {
    failures.push(`${entry.protocolId}: árvore não localizada`);
    continue;
  }
  const dispositions = [...tree.text.matchAll(/disposition:\s*"(discharge|observation|icu|other_module)"/g)].map((m) => m[1]);
  const clinical = dispositions.filter((d) => d !== "other_module");

  if (entry.mode === "care_pathway" && clinical.length === 0) {
    failures.push(`${entry.protocolId}: care_pathway sem destino assistencial explícito`);
  }
  if (entry.mode === "procedural_subflow" && clinical.length > 0) {
    warnings.push(`${entry.protocolId}: procedural_subflow contém disposition assistencial (${[...new Set(clinical)].join(",")}); revisar semântica`);
  }
}

console.log("\nAuditoria terminal por papel do módulo\n");
for (const warning of warnings) console.log(`REVISAR: ${warning}`);
for (const failure of failures) console.error(`FALHA: ${failure}`);
console.log(`\nClassificados: ${entries.length} | revisões semânticas: ${warnings.length} | falhas: ${failures.length}`);

// Só falha para care_pathway classificado sem destino ou árvore classificada ausente.
// Procedural subflow com disposition assistencial é dívida semântica, não quebra o build
// até a migração de retorno estar implementada.
process.exit(failures.length ? 1 : 0);
