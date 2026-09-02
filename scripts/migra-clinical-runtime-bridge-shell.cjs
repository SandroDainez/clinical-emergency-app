#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const rel = "components/protocol-screen/acls-decision-flow-screen.tsx";
const file = path.join(root, rel);
let src = fs.readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  if (src.includes(after)) return;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: contexto esperado ${count}x (esperado 1)`);
  src = src.replace(before, after);
}

replaceOnce(
  'import { guardarNoContexto, lerDoContexto } from "../../lib/contexto-do-paciente";\n',
  'import { guardarNoContexto, lerDoContexto } from "../../lib/contexto-do-paciente";\nimport { recordFlowAdvance, recordFlowDecision, recordFlowObservation } from "../../lib/clinical-runtime-bridge";\n',
  "import runtime bridge"
);

replaceOnce(
`  const handleChoose = (optionId: string) => {\n    const next = engine.choose(optionId);\n    caminhoRef.current.push(next.id);\n`,
`  const handleChoose = (optionId: string) => {\n    const currentStep = engine.toFrontendStep();\n    const currentNodeId = engine.getCurrentNode().id;\n    const optionLabel =\n      currentStep.kind === "decision"\n        ? currentStep.options.find((option) => option.id === optionId)?.label\n        : undefined;\n    const next = engine.choose(optionId);\n    recordFlowDecision({\n      module: currentModuleSlug,\n      nodeId: currentNodeId,\n      optionId,\n      optionLabel,\n    });\n    caminhoRef.current.push(next.id);\n`,
  "instrument decision"
);

replaceOnce(
`  const handleAdvance = () => {\n    const next = engine.advance();\n    caminhoRef.current.push(next.id);\n    sync(next.title);\n  };\n`,
`  const handleAdvance = () => {\n    const currentNode = engine.getCurrentNode();\n    const currentValues = engine.getValues();\n    const next = engine.advance();\n\n    if (currentNode.type === "action") {\n      recordFlowAdvance({\n        module: currentModuleSlug,\n        nodeId: currentNode.id,\n        title: currentNode.title,\n      });\n    } else if (currentNode.type === "input") {\n      for (const field of currentNode.fields) {\n        const value = currentValues[field.id];\n        if (value === undefined) continue;\n        recordFlowObservation({\n          module: currentModuleSlug,\n          fieldId: field.id,\n          value,\n          unit: field.unit,\n        });\n      }\n    }\n\n    caminhoRef.current.push(next.id);\n    sync(next.title);\n  };\n`,
  "instrument advance"
);

for (const token of [
  "recordFlowDecision({",
  "recordFlowAdvance({",
  "recordFlowObservation({",
  "const next = engine.choose(optionId);",
  "const next = engine.advance();",
]) {
  if (!src.includes(token)) throw new Error(`pós-condição ausente: ${token}`);
}

fs.writeFileSync(file, src, "utf8");
console.log("Clinical Runtime Bridge ligado ao shell em workspace.");
