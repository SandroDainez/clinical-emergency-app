#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const files = {
  types: path.join(root, "core/decision-tree/types.ts"),
  engine: path.join(root, "core/decision-tree/engine.ts"),
  tree: path.join(root, "coronary-decision-tree.ts"),
  shell: path.join(root, "components/protocol-screen/acls-decision-flow-screen.tsx"),
};
function transform(file, transforms) {
  let src = fs.readFileSync(file, "utf8");
  for (const { before, after, label } of transforms) {
    if (src.includes(after)) continue;
    const count = src.split(before).length - 1;
    if (count !== 1) throw new Error(`${label}: contexto ${count}x (esperado 1)`);
    src = src.replace(before, after);
  }
  fs.writeFileSync(file, src, "utf8");
}
transform(files.types, [
  { label: "DecisionOption action id", before: '  next: string;\n  /** Opcional: torna a opção visível apenas se a expressão de guarda for verdadeira. */\n', after: '  next: string;\n  /** Ação clínica canônica que esta escolha tenta executar; usada por Safety Gates. */\n  clinicalActionId?: string;\n  /** Opcional: torna a opção visível apenas se a expressão de guarda for verdadeira. */\n' },
  { label: "Frontend decision option action id", before: '      options: Array<{ id: string; label: string }>;\n', after: '      options: Array<{ id: string; label: string; clinicalActionId?: string }>;\n' },
]);
transform(files.engine, [
  { label: "map DecisionOption action id", before: '.map((option) => ({ id: option.id, label: interpolate(option.label) })),\n', after: '.map((option) => ({ id: option.id, label: interpolate(option.label), clinicalActionId: option.clinicalActionId })),\n' },
]);
transform(files.tree, [
  { label: "STEMI ICP action id", before: '{ id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },', after: '{ id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp", clinicalActionId: "definir_estrategia_reperfusao" },' },
  { label: "STEMI fibrino action id", before: '{ id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },', after: '{ id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check", clinicalActionId: "definir_estrategia_reperfusao" },' },
]);
transform(files.shell, [
  { label: "override import", before: 'import { recordFlowAdvance, recordFlowDecision, recordFlowObservation } from "../../lib/clinical-runtime-bridge";\n', after: 'import { recordFlowAdvance, recordFlowDecision, recordFlowObservation } from "../../lib/clinical-runtime-bridge";\nimport { recordClinicalSafetyOverride } from "../../lib/clinical-safety-override";\n' },
  { label: "pending soft stop state", before: '  const [trail, setTrail] = useState<string[]>(() => [engine.toFrontendStep().title]);\n', after: '  const [trail, setTrail] = useState<string[]>(() => [engine.toFrontendStep().title]);\n  const [pendingSoftStop, setPendingSoftStop] = useState<{ optionId: string; gateId: string; title: string; message: string; resolution: string } | undefined>(undefined);\n  const [softStopReason, setSoftStopReason] = useState("");\n' },
  { label: "commit decision extraction", before: '  const handleChoose = (optionId: string) => {\n    const currentStep = engine.toFrontendStep();\n    const currentNodeId = engine.getCurrentNode().id;\n', after: '  const commitDecision = (optionId: string) => {\n    const currentStep = engine.toFrontendStep();\n    const currentNodeId = engine.getCurrentNode().id;\n' },
  { label: "handleChoose gated", before: '    sync(next.title);\n  };\n\n  const handleAdvance = () => {\n', after: '    sync(next.title);\n  };\n\n  const handleChoose = (optionId: string) => {\n    const currentStep = engine.toFrontendStep();\n    if (currentStep.kind !== "decision") return;\n    const selected = currentStep.options.find((option) => option.id === optionId);\n    if (!selected?.clinicalActionId || !currentModuleSlug) {\n      commitDecision(optionId);\n      return;\n    }\n    const gate = evaluateClinicalActionAttemptFromPatientState({\n      protocolId: currentModuleSlug,\n      nodeId: currentStep.id,\n      actionId: selected.clinicalActionId,\n    }).decision.softStops[0];\n    if (!gate) {\n      commitDecision(optionId);\n      return;\n    }\n    setSoftStopReason("");\n    setPendingSoftStop({\n      optionId,\n      gateId: gate.policy.id,\n      title: gate.policy.title,\n      message: gate.policy.message,\n      resolution: gate.policy.resolution,\n    });\n  };\n\n  const handleAdvance = () => {\n' },
  { label: "decision soft stop render", before: '        {step.kind === "decision" ? (\n          <DecisionStep step={step} onChoose={handleChoose} emV2={emV2} />\n', after: '        {step.kind === "decision" ? (\n          pendingSoftStop ? (\n            <View style={styles.stepStack}>\n              <SafetyGate\n                title={tr(pendingSoftStop.title)}\n                message={tr(pendingSoftStop.message)}\n                primaryLabel={tr("Voltar e confirmar o tempo real da ICP")}\n                onPrimary={() => { setPendingSoftStop(undefined); setSoftStopReason(""); commitDecision("nao_sei"); }}\n                severity="warning"\n              />\n              <TextInput\n                value={softStopReason}\n                onChangeText={setSoftStopReason}\n                placeholder={tr("Motivo clínico/operacional para prosseguir sem o dado confirmado")}\n                multiline\n                style={styles.customInput}\n              />\n              <Pressable\n                accessibilityRole="button"\n                disabled={!softStopReason.trim()}\n                onPress={() => {\n                  const pending = pendingSoftStop;\n                  const reason = softStopReason.trim();\n                  if (!pending || !reason) return;\n                  recordClinicalSafetyOverride({ module: currentModuleSlug, gateId: pending.gateId, reason, severity: "warning" });\n                  setPendingSoftStop(undefined); setSoftStopReason(""); commitDecision(pending.optionId);\n                }}\n                style={[styles.advanceButton, !softStopReason.trim() && styles.controlButtonDisabled]}>\n                <Text style={styles.advanceButtonText}>{tr("Prosseguir por exceção — registrar justificativa")}</Text>\n              </Pressable>\n            </View>\n          ) : (\n            <DecisionStep step={step} onChoose={handleChoose} emV2={emV2} />\n          )\n' },
  { label: "decision ternary closure", before: '        ) : step.kind === "action" ? (\n', after: '          )\n        ) : step.kind === "action" ? (\n' },
]);
console.log("Soft stop visual do STEMI preparado em workspace.");
