#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const treePath = path.resolve(__dirname, "../avc-decision-tree.ts");
const migrationPath = path.resolve(__dirname, "./migra-hic-anticoagulante-desconhecido.cjs");
const evidencePath = path.resolve(__dirname, "../protocol-evidence/avc.ts");

for (const file of [treePath, migrationPath, evidencePath]) {
  if (!fs.existsSync(file)) throw new Error(`Arquivo ausente: ${file}`);
}

const tree = fs.readFileSync(treePath, "utf8");
const migration = fs.readFileSync(migrationPath, "utf8");
const evidence = fs.readFileSync(evidencePath, "utf8");

const migrationTokens = [
  'id: "nao_sei"',
  'next: "hic_anticoag_descoberta"',
  'id: "hic_anticoag_descoberta"',
  'next: "hic_anticoag"',
  "NÃO USAR TP/INR/TTPa NORMAIS PARA 'EXCLUIR' DOAC",
  "não escolher um antídoto específico às cegas",
];
for (const token of migrationTokens) {
  if (!migration.includes(token)) throw new Error(`Migração HIC sem invariante: ${token}`);
}

if (!tree.includes('id: "hic_anticoag"')) {
  throw new Error("Nó hic_anticoag não existe na árvore real.");
}
if (!tree.includes('question: "O paciente usa anticoagulante?"')) {
  throw new Error("Pergunta real de anticoagulação não encontrada.");
}

const evidenceTokens = [
  'id: "hic_anticoagulante_identificar_e_reverter"',
  'nodeId: "hic_anticoag"',
  "AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage",
  'reviewedAt: "2026-09-02"',
];
for (const token of evidenceTokens) {
  if (!evidence.includes(token)) throw new Error(`Evidência HIC sem invariante: ${token}`);
}

console.log("OK: lacuna de anticoagulante desconhecido na HIC tem migração segura e evidência vinculada.");
