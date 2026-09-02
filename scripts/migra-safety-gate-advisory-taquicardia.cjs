#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = {
  types: path.join(root, "core/decision-tree/types.ts"),
  engine: path.join(root, "core/decision-tree/engine.ts"),
  tree: path.join(root, "acls-tachycardia-tree.ts"),
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

transform(files.types, [
  {
    label: "ActionNode clinicalActionId",
    before: '  /** Decisão de origem quando este nó materializa uma descoberta guiada canônica. */\n  guidedDiscoveryOrigin?: string;\n  actions: string[];\n',
    after: '  /** Decisão de origem quando este nó materializa uma descoberta guiada canônica. */\n  guidedDiscoveryOrigin?: string;\n  /** Ação clínica canônica tentada/executada neste nó; usada por Safety Gates. */\n  clinicalActionId?: string;\n  actions: string[];\n',
  },
  {
    label: "Frontend action clinicalActionId",
    before: '      /** Decisão para a qual a descoberta guiada deve retornar. */\n      guidedDiscoveryOrigin?: string;\n      actions: string[];\n',
    after: '      /** Decisão para a qual a descoberta guiada deve retornar. */\n      guidedDiscoveryOrigin?: string;\n      /** Ação clínica canônica declarada pelo nó. */\n      clinicalActionId?: string;\n      actions: string[];\n',
  },
]);

transform(files.engine, [
  {
    label: "map clinicalActionId",
    before: '    guidedDiscoveryOrigin: node.guidedDiscoveryOrigin,\n    actions: node.actions.map(interpolate),\n',
    after: '    guidedDiscoveryOrigin: node.guidedDiscoveryOrigin,\n    clinicalActionId: node.clinicalActionId,\n    actions: node.actions.map(interpolate),\n',
  },
]);

transform(files.tree, [
  {
    label: "tachy action id",
    before: '    unstable_cardioversion: {\n      id: "unstable_cardioversion",\n      type: "action",\n      title: "Cardioversão sincronizada IMEDIATA",\n',
    after: '    unstable_cardioversion: {\n      id: "unstable_cardioversion",\n      type: "action",\n      clinicalActionId: "cardioversao_sincronizada",\n      title: "Cardioversão sincronizada IMEDIATA",\n',
  },
]);

transform(files.shell, [
  {
    label: "SafetyGate import",
    before: 'import { Card, ClinicalShellHost, GuidedDiscoveryCard, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";\n',
    after: 'import { Card, ClinicalShellHost, GuidedDiscoveryCard, InstrucaoResumida, NumericStepper, SafetyGate, Tag } from "../ui-v2";\nimport { evaluateClinicalActionAttemptFromPatientState } from "../../lib/clinical-action-gate-patient-state";\n',
  },
  {
    label: "ActionStep advisory state",
    before: '  const tr = useTr();\n  const v = useEstilosDoTema(criarEstilosV2);\n  const discovery =\n',
    after: '  const tr = useTr();\n  const v = useEstilosDoTema(criarEstilosV2);\n  const [dismissedAdvisoryId, setDismissedAdvisoryId] = useState<string | undefined>(undefined);\n  useEffect(() => setDismissedAdvisoryId(undefined), [step.id]);\n  const actionGate =\n    step.clinicalActionId && protocolId\n      ? evaluateClinicalActionAttemptFromPatientState({\n          protocolId,\n          nodeId: step.id,\n          actionId: step.clinicalActionId,\n        })\n      : undefined;\n  const advisory = actionGate?.decision.advisories.find(\n    (item) => item.policy.id !== dismissedAdvisoryId\n  );\n  const discovery =\n',
  },
  {
    label: "V2 advisory render",
    before: '      <View style={styles.stepStack}>\n        <Card tom="critical" style={v.cartao}>\n',
    after: '      <View style={styles.stepStack}>\n        {advisory ? (\n          <SafetyGate\n            title={tr(advisory.policy.title)}\n            message={tr(advisory.policy.message)}\n            primaryLabel={tr("Entendido — manter cardioversão sem atraso")}\n            onPrimary={() => setDismissedAdvisoryId(advisory.policy.id)}\n            severity="warning"\n          />\n        ) : null}\n        <Card tom="critical" style={v.cartao}>\n',
  },
]);

console.log("SafetyGate advisory da cardioversão preparado em workspace.");
