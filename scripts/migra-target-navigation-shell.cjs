#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "components", "protocol-screen", "acls-decision-flow-screen.tsx");
let source = fs.readFileSync(file, "utf8");

if (
  source.includes('import { executeClinicalTargetNavigation } from "../../lib/clinical-target-navigation";') &&
  !source.includes('import { prepareRegisteredTargetHandoff } from "../../lib/clinical-target-handoff-runtime";') &&
  !source.includes('`?from_module=${currentModuleSlug}`')
) {
  console.log("✅ Navegação de targets do shell já está centralizada.");
  process.exit(0);
}

const oldImport = 'import { prepareRegisteredTargetHandoff } from "../../lib/clinical-target-handoff-runtime";';
const newImport = 'import { executeClinicalTargetNavigation } from "../../lib/clinical-target-navigation";';
if (!source.includes(oldImport)) {
  throw new Error("Import legado de prepareRegisteredTargetHandoff não encontrado; migração recusada.");
}
source = source.replace(oldImport, newImport);

const start = source.indexOf("  const abrirOutroModulo = (");
const end = source.indexOf("\n  const comecarDoInicio = () => {", start);
if (start === -1 || end === -1) {
  throw new Error("Bloco abrirOutroModulo não encontrado com fronteiras esperadas.");
}

const replacement = `  const abrirOutroModulo = (\n    slug: string,\n    handoff?: { fromNodeId: string; targetModuleId: string }\n  ) => {\n    executeClinicalTargetNavigation(\n      {\n        fromModuleId: currentModuleSlug,\n        targetModuleId: slug,\n        handoff: handoff\n          ? {\n              fromProtocolId: tree.id,\n              fromNodeId: handoff.fromNodeId,\n              targetModuleId: handoff.targetModuleId,\n            }\n          : undefined,\n      },\n      (href) => router.push(href as never)\n    );\n  };\n`;

source = `${source.slice(0, start)}${replacement}${source.slice(end)}`;

if (source.includes('`?from_module=${currentModuleSlug}`')) {
  throw new Error("Migração deixou montagem manual de from_module no shell.");
}
if (!source.includes("executeClinicalTargetNavigation(")) {
  throw new Error("Executor canônico não foi inserido no shell.");
}

fs.writeFileSync(file, source);
console.log("✅ Shell compartilhado migrado para executeClinicalTargetNavigation.");
