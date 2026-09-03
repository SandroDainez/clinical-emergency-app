#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

// Migração one-shot, idempotente: existe para aplicar com segurança uma alteração
// pequena no shell compartilhado e depois permanecer apenas como registro de auditoria.
const root = path.resolve(__dirname, "..");
const file = path.join(root, "components", "protocol-screen", "acls-decision-flow-screen.tsx");
let source = fs.readFileSync(file, "utf8");

const importLine = 'import { ClinicalDispositionConfirmation } from "./clinical-disposition-confirmation";';
if (!source.includes(importLine)) {
  const anchor = 'import { ClinicalTransitionStepAdapter } from "./clinical-transition-step-adapter";';
  if (!source.includes(anchor)) throw new Error("Import anchor do transition adapter não encontrado.");
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const oldBlock = `        ) : (\n          emV2 ? (\n          <ClinicalTransitionStepAdapter\n            step={step}\n            onOpenModule={(moduleId) =>\n              abrirOutroModulo(moduleId.replace(/_/g, "-"), {\n                fromNodeId: step.id,\n                targetModuleId: moduleId,\n              })\n            }\n          />\n        ) : (\n          <TransitionStep\n            step={step}\n            onOpenModule={(moduleId) =>\n              abrirOutroModulo(moduleId.replace(/_/g, "-"), {\n                fromNodeId: step.id,\n                targetModuleId: moduleId,\n              })\n            }\n          />\n        )\n        )}`;

const newBlock = `        ) : (\n          <View style={styles.stepStack}>\n            {emV2 ? (\n              <ClinicalTransitionStepAdapter\n                step={step}\n                onOpenModule={(moduleId) =>\n                  abrirOutroModulo(moduleId.replace(/_/g, "-"), {\n                    fromNodeId: step.id,\n                    targetModuleId: moduleId,\n                  })\n                }\n              />\n            ) : (\n              <TransitionStep\n                step={step}\n                onOpenModule={(moduleId) =>\n                  abrirOutroModulo(moduleId.replace(/_/g, "-"), {\n                    fromNodeId: step.id,\n                    targetModuleId: moduleId,\n                  })\n                }\n              />\n            )}\n            <ClinicalDispositionConfirmation\n              protocolId={tree.id}\n              sourceNodeId={step.id}\n            />\n          </View>\n        )}`;

if (!source.includes("<ClinicalDispositionConfirmation")) {
  if (!source.includes(oldBlock)) {
    throw new Error("Bloco de transição esperado não encontrado; migração recusada.");
  }
  source = source.replace(oldBlock, newBlock);
}

if (!source.includes(importLine) || !source.includes("protocolId={tree.id}") || !source.includes("sourceNodeId={step.id}")) {
  throw new Error("Migração de confirmação de disposition ficou incompleta.");
}

fs.writeFileSync(file, source);
console.log("✅ Confirmação explícita de destino externo ligada ao shell compartilhado.");
