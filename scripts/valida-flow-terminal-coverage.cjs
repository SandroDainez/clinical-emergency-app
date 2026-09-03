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
for (const tail of catalogBody.split("\n  {\n").slice(1)) {
  const end = tail.indexOf("\n  },");
  const block = end >= 0 ? tail.slice(0, end) : tail;
  if (!block.includes('presentation: "flow"')) continue;
  const id = block.match(/^\s*id:\s*"([^"]+)"/m)?.[1];
  if (id) flowIds.push(id);
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
]) {
  if (!contract.includes(token)) issues.push(`Contrato terminal de crise incompleto: ${token}`);
}
for (const protocolId of ["pcr_adulto", "ovace_adulto"]) {
  const start = classification.indexOf(`protocolId: "${protocolId}"`);
  const next = classification.indexOf("\n  {", start + 1);
  const block = start >= 0 ? classification.slice(start, next > start ? next : undefined) : "";
  if (!block.includes('mode: "crisis_pathway"')) {
    issues.push(`${protocolId}: não está classificado como crisis_pathway`);
  }
  if (!block.includes("requiresClinicalDisposition: false")) {
    issues.push(`${protocolId}: crisis_pathway voltou a exigir disposition artificial`);
  }
  if (!block.includes("requiresReturnToOrigin: false")) {
    issues.push(`${protocolId}: crisis_pathway voltou a prometer retorno artificial`);
  }
}

if (issues.length) {
  console.error("❌ Cobertura terminal dos fluxos incompleta:\n");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`✅ Cobertura terminal: ${uniq(flowIds).length} fluxos do catálogo auditados e classificados; PCR/OVACE usam crisis_pathway sem disposition artificial.`);
