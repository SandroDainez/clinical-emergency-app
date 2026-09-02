#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shell = fs.readFileSync(
  path.join(root, "components", "protocol-screen", "acls-decision-flow-screen.tsx"),
  "utf8"
);
const runtime = fs.readFileSync(path.join(root, "lib", "clinical-target-handoff-runtime.ts"), "utf8");
const bridge = fs.readFileSync(path.join(root, "lib", "clinical-runtime-bridge.ts"), "utf8");

const errors = [];

for (const token of [
  'import { prepareRegisteredTargetHandoff } from "../../lib/clinical-target-handoff-runtime";',
  "fromProtocolId: tree.id",
  "fromNodeId: handoff.fromNodeId",
  "targetModuleId: handoff.targetModuleId",
  "if (!attempt.canProceedToDestination) return;",
  "module: tree.id",
  "bindingProtocolId: currentModuleSlug",
  "fromNodeId: step.id",
  "targetModuleId: moduleId",
]) {
  if (!shell.includes(token)) errors.push(`shell sem ${token}`);
}

if (/targetModuleId\s*===\s*["']pcr-adulto["']|slug\s*===\s*["']pcr-adulto["']/.test(shell)) {
  errors.push("shell não pode decidir handoff por hardcode de PCR");
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

const resolverIndex = shell.indexOf("prepareRegisteredTargetHandoff({");
const pushIndex = shell.indexOf("router.push(`/modulos/${slug}${origem}` as never)");
if (resolverIndex < 0 || pushIndex < 0 || resolverIndex > pushIndex) {
  errors.push("resolver precisa executar antes do router.push");
}

if (errors.length) {
  console.error("\n❌ navegação terminal com handoff inválida\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\n✅ shell prepara apenas handoffs registrados antes da navegação e preserva slug separado do protocolId canônico.\n");
