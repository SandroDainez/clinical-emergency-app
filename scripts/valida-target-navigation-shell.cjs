#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const screen = fs.readFileSync(
  path.join(root, "components", "protocol-screen", "acls-decision-flow-screen.tsx"),
  "utf8"
);
const runtime = fs.readFileSync(path.join(root, "lib", "clinical-target-navigation.ts"), "utf8");

if (!runtime.includes("executeClinicalTargetNavigation")) {
  throw new Error("Executor canônico de target navigation ausente.");
}
if (!runtime.includes("prepareRegisteredTargetHandoff")) {
  throw new Error("Executor canônico deixou de respeitar prontidão do handoff registrado.");
}
if (!runtime.includes("buildClinicalTargetHref")) {
  throw new Error("Builder canônico de href dos targets ausente.");
}
if (!screen.includes('import { executeClinicalTargetNavigation } from "../../lib/clinical-target-navigation";')) {
  throw new Error("Shell compartilhado não importa o executor canônico de targets.");
}
if (!screen.includes("executeClinicalTargetNavigation(")) {
  throw new Error("Shell compartilhado não executa navegação de target pelo runtime canônico.");
}
if (screen.includes('import { prepareRegisteredTargetHandoff } from "../../lib/clinical-target-handoff-runtime";')) {
  throw new Error("Shell voltou a preparar handoff diretamente.");
}
if (screen.includes('`?from_module=${currentModuleSlug}`')) {
  throw new Error("Shell voltou a montar from_module manualmente.");
}

console.log("✅ Targets do shell usam executor canônico; prontidão e proveniência não ficam mais na UI.");
