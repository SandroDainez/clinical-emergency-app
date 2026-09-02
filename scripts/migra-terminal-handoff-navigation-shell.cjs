#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "..", "components", "protocol-screen", "acls-decision-flow-screen.tsx");
let text = fs.readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 contexto, encontrados ${count}`);
  text = text.replace(before, after);
}

if (text.includes('prepareRegisteredTargetHandoff({') && text.includes('bindingProtocolId: currentModuleSlug')) {
  console.log("Migração terminal handoff navigation já aplicada; nenhuma alteração.");
  process.exit(0);
}

replaceOnce(
  'import { recordFlowAdvance, recordFlowDecision, recordFlowObservation } from "../../lib/clinical-runtime-bridge";\n',
  'import { recordFlowAdvance, recordFlowDecision, recordFlowObservation } from "../../lib/clinical-runtime-bridge";\nimport { prepareRegisteredTargetHandoff } from "../../lib/clinical-target-handoff-runtime";\n',
  "import do resolver"
);

replaceOnce(
`  const abrirOutroModulo = (slug: string) => {
    const origem = currentModuleSlug ? \`?from_module=\${currentModuleSlug}\` : "";
    router.push(\`/modulos/\${slug}\${origem}\` as never);
  };
`,
`  const abrirOutroModulo = (
    slug: string,
    handoff?: { fromNodeId: string; targetModuleId: string }
  ) => {
    if (handoff) {
      const attempt = prepareRegisteredTargetHandoff({
        fromProtocolId: tree.id,
        fromNodeId: handoff.fromNodeId,
        targetModuleId: handoff.targetModuleId,
      });
      if (!attempt.canProceedToDestination) return;
    }

    const origem = currentModuleSlug ? \`?from_module=\${currentModuleSlug}\` : "";
    router.push(\`/modulos/\${slug}\${origem}\` as never);
  };
`,
  "abrirOutroModulo"
);

replaceOnce(
`    recordFlowDecision({
      module: currentModuleSlug,
      nodeId: currentNodeId,
`,
`    recordFlowDecision({
      module: tree.id,
      bindingProtocolId: currentModuleSlug,
      nodeId: currentNodeId,
`,
  "recordFlowDecision canônico"
);

replaceOnce(
`      recordFlowAdvance({
        module: currentModuleSlug,
        nodeId: currentNode.id,
`,
`      recordFlowAdvance({
        module: tree.id,
        nodeId: currentNode.id,
`,
  "recordFlowAdvance canônico"
);

replaceOnce(
`        recordFlowObservation({
          module: currentModuleSlug,
          fieldId: field.id,
`,
`        recordFlowObservation({
          module: tree.id,
          fieldId: field.id,
`,
  "recordFlowObservation canônico"
);

replaceOnce(
`          <TransitionStep
            step={step}
            onOpenModule={(moduleId) => abrirOutroModulo(moduleId.replace(/_/g, "-"))}
          />
`,
`          <TransitionStep
            step={step}
            onOpenModule={(moduleId) =>
              abrirOutroModulo(moduleId.replace(/_/g, "-"), {
                fromNodeId: step.id,
                targetModuleId: moduleId,
              })
            }
          />
`,
  "TransitionStep handoff metadata"
);

fs.writeFileSync(file, text);
console.log("✅ Shell preparado para publicar handoff registrado antes da navegação terminal.");
