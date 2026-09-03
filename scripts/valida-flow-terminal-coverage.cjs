#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const modules = read("clinical-modules.ts");
const coverage = read("clinical-safety-cases/flow-terminal-coverage.ts");
const classification = read("clinical-safety-cases/module-terminal-classification.ts");

const flowIds = [];
for (const match of modules.matchAll(/\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?presentation:\s*"flow"[\s\S]*?\}/g)) {
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

for (const block of coverage.matchAll(/\{[\s\S]*?moduleId:\s*"([^"]+)"[\s\S]*?status:\s*"pending_semantic_review"[\s\S]*?\}/g)) {
  const text = block[0];
  const moduleId = block[1];
  if (!/rationale:\s*/.test(text)) issues.push(`${moduleId}: pending_semantic_review sem rationale`);
  if (!/reviewedAt:\s*"\d{4}-\d{2}-\d{2}"/.test(text)) issues.push(`${moduleId}: pending_semantic_review sem reviewedAt`);
}

for (const expected of ["pcr-adulto", "ovace-adulto"]) {
  const marker = new RegExp(`moduleId:\\s*"${expected}"[\\s\\S]*?status:\\s*"pending_semantic_review"`);
  if (!marker.test(coverage)) issues.push(`${expected}: dívida semântica terminal deixou de estar explícita`);
}

if (issues.length) {
  console.error("❌ Cobertura terminal dos fluxos incompleta:\n");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`✅ Cobertura terminal: ${uniq(flowIds).length} fluxos do catálogo auditados; ${coverageProtocolIds.length} classificados e 2 dívidas semânticas explícitas.`);
