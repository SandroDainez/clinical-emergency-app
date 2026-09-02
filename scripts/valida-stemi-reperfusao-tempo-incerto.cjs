#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const treePath = path.join(root, "coronary-decision-tree.ts");
const migrationPath = path.join(root, "scripts/migra-stemi-reperfusao-tempo-incerto.cjs");
const classificationPath = path.join(root, "clinical-safety-cases/uncertainty-classification.ts");
const evidencePath = path.join(root, "protocol-evidence/sca.ts");

for (const p of [treePath, migrationPath, classificationPath, evidencePath]) {
  if (!fs.existsSync(p)) throw new Error(`Arquivo ausente: ${p}`);
}

const tree = fs.readFileSync(treePath, "utf8");
const migration = fs.readFileSync(migrationPath, "utf8");
const classification = fs.readFileSync(classificationPath, "utf8");
const evidence = fs.readFileSync(evidencePath, "utf8");

const issues = [];
if (!tree.includes('id: "stemi_reperfusao"')) issues.push("nó stemi_reperfusao ausente");
if (!tree.includes('label: "Sim — ICP primária em ≤ 120 min"')) issues.push("opção ICP ≤120 min ausente");
if (!tree.includes('label: "Não — ICP indisponível em tempo"')) issues.push("opção fibrinólise por atraso ausente");

for (const token of [
  'id: "nao_sei"',
  'stemi_reperfusao_tempo_incerto',
  "PRIMEIRO CONTATO MÉDICO",
  "120 min",
  'next: "stemi_reperfusao"',
]) {
  if (!migration.includes(token)) issues.push(`migração sem token: ${token}`);
}

if (!classification.includes('nodeId: "stemi_reperfusao"')) issues.push("stemi_reperfusao não classificado");
if (!classification.includes('classification: "unknown_required"')) issues.push("classificação unknown_required ausente");
if (!evidence.includes('id: "stemi_ppci_120min_fmc"')) issues.push("evidência do limiar de 120 min ausente");
if (!evidence.includes('{ nodeId: "stemi_reperfusao", recommendationIds: ["stemi_ppci_120min_fmc"] }')) {
  issues.push("binding de evidência de stemi_reperfusao ausente");
}

if (issues.length) {
  console.error("Falhas na preparação do ramo de tempo incerto no STEMI:\n- " + issues.join("\n- "));
  process.exit(1);
}
console.log("Preparação do ramo de tempo incerto no STEMI está estruturalmente consistente.");
