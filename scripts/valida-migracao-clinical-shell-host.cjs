#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const migration = fs.readFileSync(path.join(root, "scripts/migra-clinical-shell-host.cjs"), "utf8");
const host = fs.readFileSync(path.join(root, "components/ui-v2/clinical-shell-host.tsx"), "utf8");
const index = fs.readFileSync(path.join(root, "components/ui-v2/index.ts"), "utf8");

const migrationRequired = [
  "replaceExactlyOnce",
  "ClinicalShellHost",
  "<StepHeaderBar",
  "const handleChoose",
  "const handleAdvance",
  "const handleSetValue",
  "const prazos =",
  "abortando sem alterar arquivo",
];
for (const token of migrationRequired) {
  if (!migration.includes(token)) throw new Error(`Migração do shell sem trava: ${token}`);
}

if (!index.includes('ClinicalShellHost') || !index.includes('from "./clinical-shell-host"')) {
  throw new Error("ClinicalShellHost não está exportado pelo índice ui-v2.");
}

const hostRequired = [
  "onBack: () => void",
  "onPush: (href: Href) => void",
  "buildClinicalShellSnapshot",
  "beginCrisisRoute(route)",
  "onPush(route.href as Href)",
  "reassessmentAlert={snapshot.reassessmentAlert}",
];
for (const token of hostRequired) {
  if (!host.includes(token)) throw new Error(`Host sem contrato esperado: ${token}`);
}

if (/DecisionTreeEngine/.test(host)) {
  throw new Error("ClinicalShellHost não pode importar DecisionTreeEngine.");
}

console.log("Migração ClinicalShellHost preparada com fallback e invariantes preservados.");
