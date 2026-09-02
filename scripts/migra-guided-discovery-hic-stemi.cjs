const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function write(path, content) {
  fs.writeFileSync(path, content);
}

function replaceOnce(path, before, after, already) {
  let content = read(path);
  if (already && content.includes(already)) return false;
  const count = content.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${path}: contexto esperado ocorreu ${count} vez(es), esperado 1`);
  }
  content = content.replace(before, after);
  write(path, content);
  return true;
}

let changed = false;

changed = replaceOnce(
  "core/decision-tree/types.ts",
  'export type ActionNode = BaseNode & {\n  type: "action";\n  actions: string[];',
  'export type ActionNode = BaseNode & {\n  type: "action";\n  /** Decisão de origem quando este nó materializa uma descoberta guiada canônica. */\n  guidedDiscoveryOrigin?: string;\n  actions: string[];',
  'guidedDiscoveryOrigin?: string;\n  actions: string[];'
) || changed;

changed = replaceOnce(
  "core/decision-tree/types.ts",
  '      kind: "action";\n      title: string;\n      summary?: string;\n      actions: string[];',
  '      kind: "action";\n      title: string;\n      summary?: string;\n      /** Decisão para a qual a descoberta guiada deve retornar. */\n      guidedDiscoveryOrigin?: string;\n      actions: string[];',
  'kind: "action";\n      title: string;\n      summary?: string;\n      /** Decisão para a qual a descoberta guiada deve retornar. */'
) || changed;

changed = replaceOnce(
  "core/decision-tree/engine.ts",
  '    summary: node.summary ? interpolate(node.summary) : undefined,\n    actions: node.actions.map(interpolate),',
  '    summary: node.summary ? interpolate(node.summary) : undefined,\n    guidedDiscoveryOrigin: node.guidedDiscoveryOrigin,\n    actions: node.actions.map(interpolate),',
  'guidedDiscoveryOrigin: node.guidedDiscoveryOrigin,'
) || changed;

changed = replaceOnce(
  "components/protocol-screen/acls-decision-flow-screen.tsx",
  'import { Card, ClinicalShellHost, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";',
  'import { Card, ClinicalShellHost, GuidedDiscoveryCard, InstrucaoResumida, NumericStepper, Tag } from "../ui-v2";\nimport { guidedDiscoveryViewModel } from "../../lib/guided-discovery-adapter";',
  'GuidedDiscoveryCard, InstrucaoResumida'
) || changed;

changed = replaceOnce(
  "components/protocol-screen/acls-decision-flow-screen.tsx",
  '<ActionStep step={step} onAdvance={handleAdvance} emV2={emV2} />',
  '<ActionStep\n            step={step}\n            onAdvance={handleAdvance}\n            emV2={emV2}\n            protocolId={currentModuleSlug}\n          />',
  'protocolId={currentModuleSlug}'
) || changed;

changed = replaceOnce(
  "components/protocol-screen/acls-decision-flow-screen.tsx",
  'function ActionStep({\n  step,\n  onAdvance,\n  emV2,\n}: {\n  step: Extract<FrontendTreeStep, { kind: "action" }>;\n  onAdvance: () => void;\n  emV2?: boolean;\n}) {\n  const tr = useTr();\n  const v = useEstilosDoTema(criarEstilosV2);\n\n  if (emV2) {',
  'function ActionStep({\n  step,\n  onAdvance,\n  emV2,\n  protocolId,\n}: {\n  step: Extract<FrontendTreeStep, { kind: "action" }>;\n  onAdvance: () => void;\n  emV2?: boolean;\n  protocolId?: string;\n}) {\n  const tr = useTr();\n  const v = useEstilosDoTema(criarEstilosV2);\n  const discovery =\n    step.guidedDiscoveryOrigin && protocolId\n      ? guidedDiscoveryViewModel(protocolId, step.guidedDiscoveryOrigin)\n      : undefined;\n\n  if (discovery) {\n    return (\n      <View style={styles.stepStack}>\n        <GuidedDiscoveryCard\n          eyebrow={tr(discovery.eyebrow)}\n          title={tr(discovery.title)}\n          sourceLabel={tr(discovery.sourceLabel)}\n          steps={discovery.steps.map((item) => ({\n            ...item,\n            label: tr(item.label),\n            detail: tr(item.detail),\n          }))}\n          sufficientWhen={tr(discovery.sufficientWhen)}\n          returnLabel={tr("Voltar à decisão")}\n          onReturn={onAdvance}\n        />\n      </View>\n    );\n  }\n\n  if (emV2) {',
  'const discovery =\n    step.guidedDiscoveryOrigin && protocolId'
) || changed;

changed = replaceOnce(
  "avc-decision-tree.ts",
  '      options: [\n        { id: "sim", label: "Sim — em anticoagulante", next: "hic_reversao" },\n        { id: "nao", label: "Não anticoagulado", next: "hic_pic" },\n      ],\n    },\n\n    hic_reversao:',
  '      options: [\n        { id: "sim", label: "Sim — em anticoagulante", next: "hic_reversao" },\n        { id: "nao", label: "Não anticoagulado", next: "hic_pic" },\n        { id: "nao_sei", label: "Não sei — me ajude", next: "hic_anticoag_descoberta" },\n      ],\n    },\n\n    hic_anticoag_descoberta: {\n      id: "hic_anticoag_descoberta",\n      type: "action",\n      title: "Descobrir anticoagulação",\n      summary: "Obter a informação que falta e retornar à decisão de reversão.",\n      guidedDiscoveryOrigin: "hic_anticoag",\n      actions: [],\n      natureza: "organizacao_do_atendimento",\n      next: "hic_anticoag",\n    },\n\n    hic_reversao:',
  'id: "hic_anticoag_descoberta"'
) || changed;

changed = replaceOnce(
  "coronary-decision-tree.ts",
  '      options: [\n        { id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },\n        { id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },\n      ],\n    },\n\n    stemi_icp:',
  '      options: [\n        { id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },\n        { id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },\n        { id: "nao_sei", label: "Não sei — me ajude", next: "stemi_reperfusao_descoberta" },\n      ],\n    },\n\n    stemi_reperfusao_descoberta: {\n      id: "stemi_reperfusao_descoberta",\n      type: "action",\n      title: "Descobrir tempo real até a ICP",\n      summary: "Obter a informação operacional que falta e retornar à decisão de reperfusão.",\n      guidedDiscoveryOrigin: "stemi_reperfusao",\n      actions: [],\n      natureza: "organizacao_do_atendimento",\n      next: "stemi_reperfusao",\n    },\n\n    stemi_icp:',
  'id: "stemi_reperfusao_descoberta"'
) || changed;

let registry = read("lib/guided-discovery-registry.ts");
if (!registry.includes('guidedNodeId: "hic_anticoag_descoberta"')) {
  registry = registry.replace(
    'decisionNodeId: "hic_anticoag",\n    source: "missing_history",\n    mode: "prepared_plan",',
    'decisionNodeId: "hic_anticoag",\n    source: "missing_history",\n    mode: "existing_node",\n    guidedNodeId: "hic_anticoag_descoberta",'
  );
  changed = true;
}
if (!registry.includes('guidedNodeId: "stemi_reperfusao_descoberta"')) {
  registry = registry.replace(
    'protocolId: "sca",\n    decisionNodeId: "stemi_reperfusao",\n    source: "external_operational_data",\n    mode: "prepared_plan",',
    'protocolId: "sindromes-coronarianas",\n    decisionNodeId: "stemi_reperfusao",\n    source: "external_operational_data",\n    mode: "existing_node",\n    guidedNodeId: "stemi_reperfusao_descoberta",'
  );
  changed = true;
}
write("lib/guided-discovery-registry.ts", registry);

console.log(changed ? "guided discovery migration applied" : "guided discovery migration already applied");
