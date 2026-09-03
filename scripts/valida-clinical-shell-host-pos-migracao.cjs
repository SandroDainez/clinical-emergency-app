#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const target = fs.readFileSync(
  path.join(root, "components/protocol-screen/acls-decision-flow-screen.tsx"),
  "utf8"
);

const required = [
  "ClinicalShellHost",
  "<ClinicalShellHost",
  "protocol={tr(protocolLabel)}",
  "phase={step.title ? tr(step.title) : undefined}",
  "step={stepCount}",
  "moduleSlug={currentModuleSlug}",
  "onBack={() => (engine.canGoBack() ? handleBack() : router.back())}",
  "onPush={(href) => router.push(href)}",
  "{emV2 ? null : (",
  "<StepHeaderBar",
  "const handleChoose",
  "const handleAdvance",
  "const handleSetValue",
  "const prazos =",
];

const errors = [];
for (const token of required) {
  if (!target.includes(token)) errors.push(`shell migrado sem invariante: ${token}`);
}

if (target.includes('import { Card, Header, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";')) {
  errors.push("import antigo de Header permanece após migração");
}
if (!/import\s*\{[^}]*ClinicalShellHost[^}]*\}\s*from\s*["']\.\.\/ui-v2["']/.test(target)) {
  errors.push("ClinicalShellHost deixou de ser importado pelo índice ui-v2");
}
if (target.includes("<Header\n")) {
  errors.push("render V2 antigo de Header permanece após migração");
}

if (errors.length) {
  console.error("\n❌ ClinicalShellHost pós-migração inválido\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\n✅ ClinicalShellHost integrado ao shell compartilhado com fallback, handlers e timers preservados.\n");
