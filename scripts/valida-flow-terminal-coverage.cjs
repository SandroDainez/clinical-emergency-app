#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const modules = read("clinical-modules.ts");
const coverage = read("clinical-safety-cases/flow-terminal-coverage.ts");
const classification = read("clinical-safety-cases/module-terminal-classification.ts");
const contract = read("lib/clinical-module-terminal-contract.ts");

const flowIds = [];
const catalogBody = modules.slice(modules.indexOf("const CLINICAL_MODULES"));
for (const match of catalogBody.matchAll(/\{\s*\n\s*id:\s*"([^"]+)"[\s\S]*?presentation:\s*"flow"[\s\S]*?\n\s*\},/g)) {
  flowIds.push(match[1]);
}

const coverageIds = [...coverage.matchAll(/moduleId:\s*"([^"]+)"/g)].map((match) => match[1]);
const classifiedProtocolIds = new Set(
  [...classification.matchAll(/protocolId:\s*"([^"]+)"/g)].map((match) => match[1])
);
const coverageProtocolIds = [...coverage.matchAll(/protocolId:\s*"([^"]+)"/g)].map((match) => match[1]);

const issues = [];
const uniq = (items) => [...new Set(items)];

for (const id of uniq(flowIds)) {
  if (!coverageIds.includes(id)) issues.push(`Fluxo do catálogo sem cobertura terminal: ${id}`);
}
for (const id of uniq(coverageIds)) {
  if (!flowIds.includes(id)) issues.push(`Cobertura terminal aponta para módulo que não é flow no catálogo: ${id}`);
}
if (uniq(coverageIds).length !== coverageIds.length) {
  issues.push("FLOW_TERMINAL_COVERAGE contém moduleId duplicado");
}

for (const protocolId of coverageProtocolIds) {
  if (!classifiedProtocolIds.has(protocolId)) {
    issues.push(`Cobertura marcada como classificada sem contrato terminal real: ${protocolId}`);
  }
}

if (coverage.includes('status: "pending_semantic_review"')) {
  issues.push("Ainda existe flow com revisão semântica terminal pendente");
}

for (const token of [
  '| "crisis_pathway"',
  'entry.mode === "crisis_pathway"',
  'protocolId: "pcr_adulto"',
  'protocolId: "ovace_adulto"',
  'mode: "crisis_pathway"',
]) {
  const source = token.startsWith("entry.") || token.startsWith("| ") ? contract : classification;
  if (!source.includes(token)) issues.push(`Semântica terminal de crise incompleta: ${token}`);
}

if (issues.length) {
  console.error("❌ Cobertura terminal dos fluxos incompleta:\n");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`✅ Cobertura terminal: ${uniq(flowIds).length} fluxos do catálogo auditados e classificados; PCR/OVACE usam crisis_pathway sem disposition artificial.`);
