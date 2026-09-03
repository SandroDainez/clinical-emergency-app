#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shell = fs.readFileSync(
  path.join(root, "components", "protocol-screen", "acls-decision-flow-screen.tsx"),
  "utf8"
);
const navigation = fs.readFileSync(path.join(root, "lib", "clinical-target-navigation.ts"), "utf8");
const runtime = fs.readFileSync(path.join(root, "lib", "clinical-target-handoff-runtime.ts"), "utf8");
const bridge = fs.readFileSync(path.join(root, "lib", "clinical-runtime-bridge.ts"), "utf8");

const errors = [];

for (const token of [
  'import { executeClinicalTargetNavigation } from "../../lib/clinical-target-navigation";',
  "fromProtocolId: tree.id",
  "fromNodeId: handoff.fromNodeId",
  "targetModuleId: handoff.targetModuleId",
  "module: tree.id",
  "bindingProtocolId: currentModuleSlug",
  "fromNodeId: step.id",
  "targetModuleId: moduleId",
]) {
  if (!shell.includes(token)) errors.push(`shell sem ${token}`);
}

if (shell.includes('import { prepareRegisteredTargetHandoff } from "../../lib/clinical-target-handoff-runtime";')) {
  errors.push("shell voltou a preparar handoff diretamente");
}
if (/targetModuleId\s*===\s*["']pcr-adulto["']|slug\s*===\s*["']pcr-adulto["']/.test(shell)) {
  errors.push("shell não pode decidir handoff por hardcode de PCR");
}

for (const token of [
  "prepareRegisteredTargetHandoff({",
  "fromProtocolId: input.handoff.fromProtocolId",
  "fromNodeId: input.handoff.fromNodeId",
  "targetModuleId: input.handoff.targetModuleId",
  "if (handoffAttempt && !handoffAttempt.canProceedToDestination)",
  "navigate(href)",
]) {
  if (!navigation.includes(token)) errors.push(`executor de navegação sem ${token}`);
}

const readinessIndex = navigation.indexOf("if (handoffAttempt && !handoffAttempt.canProceedToDestination)");
const navigateIndex = navigation.indexOf("navigate(href)");
if (readinessIndex < 0 || navigateIndex < 0 || readinessIndex > navigateIndex) {
  errors.push("executor precisa bloquear handoff inválido antes de navegar");
}

for (const token of [
  "PCR_TERMINAL_HANDOFF_CONTEXTS.find",
  "fromProtocolId === input.fromProtocolId",
  "fromNodeId === input.fromNodeId",
  "targetModuleId === input.targetModuleId",
  "prepareClinicalHandoffTransfer",
  "matched: false",
]) {
  if (!runtime.includes(token)) errors.push(`resolver sem ${token}`);
}

if (!bridge.includes("bindingProtocolId?: string")) {
  errors.push("Runtime Bridge sem separação de bindingProtocolId");
}
if (!bridge.includes("protocolId: input.bindingProtocolId ?? input.module")) {
  errors.push("Runtime Bridge não preserva fallback de bindings existentes");
}

if (errors.length) {
  console.error("\n❌ navegação terminal com handoff inválida\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\n✅ shell delega navegação ao executor canônico, que bloqueia handoffs inválidos antes da rota e preserva slug separado do protocolId canônico.\n");
