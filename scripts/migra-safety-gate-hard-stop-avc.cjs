#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = {
  tree: path.join(root, "avc-decision-tree.ts"),
  shell: path.join(root, "components/protocol-screen/acls-decision-flow-screen.tsx"),
};

function transform(file, transforms) {
  let src = fs.readFileSync(file, "utf8");
  for (const { before, after, label } of transforms) {
    if (src.includes(after)) continue;
    const count = src.split(before).length - 1;
    if (count !== 1) throw new Error(`${label}: contexto esperado ${count}x (esperado 1)`);
    src = src.replace(before, after);
  }
  fs.writeFileSync(file, src, "utf8");
}

transform(files.tree, [
  {
    label: "AVC trombolise clinicalActionId",
    before: '    trombolise: {\n      id: "trombolise",\n      type: "action",\n      title: "Trombólise IV — dose calculada",\n',
    after: '    trombolise: {\n      id: "trombolise",\n      type: "action",\n      clinicalActionId: "administrar_trombolise_iv",\n      title: "Trombólise IV — dose calculada",\n',
  },
]);

transform(files.shell, [
  {
    label: "handleGateResolution",
    before: '  const handleSetValue = (fieldId: string, value: string) => {\n',
    after: '  const handleGateResolution = (nodeId: string) => {\n    const next = engine.goToNode(nodeId);\n    caminhoRef.current.push(next.id);\n    sync(next.title);\n  };\n\n  const handleSetValue = (fieldId: string, value: string) => {\n',
  },
  {
    label: "ActionStep resolution prop",
    before: '            onAdvance={handleAdvance}\n            emV2={emV2}\n            protocolId={currentModuleSlug}\n',
    after: '            onAdvance={handleAdvance}\n            onResolveGate={handleGateResolution}\n            emV2={emV2}\n            protocolId={currentModuleSlug}\n',
  },
  {
    label: "ActionStep signature resolution prop",
    before: 'function ActionStep({\n  step,\n  onAdvance,\n  emV2,\n  protocolId,\n}: {\n  step: Extract<FrontendTreeStep, { kind: "action" }>;\n  onAdvance: () => void;\n  emV2?: boolean;\n  protocolId?: string;\n}) {\n',
    after: 'function ActionStep({\n  step,\n  onAdvance,\n  onResolveGate,\n  emV2,\n  protocolId,\n}: {\n  step: Extract<FrontendTreeStep, { kind: "action" }>;\n  onAdvance: () => void;\n  onResolveGate: (nodeId: string) => void;\n  emV2?: boolean;\n  protocolId?: string;\n}) {\n',
  },
  {
    label: "ActionStep hard stop selection",
    before: '  const advisory = actionGate?.decision.advisories.find(\n    (item) => item.policy.id !== dismissedAdvisoryId\n  );\n  const discovery =\n',
    after: '  const advisory = actionGate?.decision.advisories.find(\n    (item) => item.policy.id !== dismissedAdvisoryId\n  );\n  const hardStop = actionGate?.decision.hardStops[0];\n  const discovery =\n',
  },
  {
    label: "ActionStep hard stop render",
    before: '  if (emV2) {\n',
    after: '  if (hardStop) {\n    const resolutionNodeId = hardStop.policy.resolutionNodeId;\n    return (\n      <View style={styles.stepStack}>\n        <SafetyGate\n          title={tr(hardStop.policy.title)}\n          message={tr(hardStop.policy.message)}\n          primaryLabel={tr(hardStop.policy.resolution)}\n          onPrimary={() => {\n            if (resolutionNodeId) onResolveGate(resolutionNodeId);\n          }}\n          severity="critical"\n        />\n      </View>\n    );\n  }\n\n  if (emV2) {\n',
  },
]);

console.log("Hard stop visual do AVC preparado em workspace.");
