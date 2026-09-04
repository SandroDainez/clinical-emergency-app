#!/usr/bin/env node
const fs = require('node:fs');

function replaceOnce(path, before, after) {
  const src = fs.readFileSync(path, 'utf8');
  if (!src.includes(before)) throw new Error(`${path}: trecho esperado não encontrado`);
  const next = src.replace(before, after);
  fs.writeFileSync(path, next);
}

replaceOnce(
  'lib/clinical-gate-trigger-registry.ts',
`export function activeClinicalGatesForAction(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  context: ClinicalGateContext;
}): ActiveClinicalGate[] {`,
`export function activeClinicalGatesForAction(input: {
  protocolId: string;
  nodeId?: string;
  interactionKind?: "action" | "decision";
  actionId: string;
  context: ClinicalGateContext;
}): ActiveClinicalGate[] {`
);
replaceOnce(
  'lib/clinical-gate-trigger-registry.ts',
`    if (trigger.protocolId !== input.protocolId) continue;
    if (trigger.nodeId && trigger.nodeId !== input.nodeId) continue;
    if (trigger.actionId !== input.actionId) continue;`,
`    if (trigger.protocolId !== input.protocolId) continue;
    if (trigger.nodeId && trigger.nodeId !== input.nodeId) continue;
    if (input.interactionKind && trigger.interactionKind !== input.interactionKind) continue;
    if (trigger.actionId !== input.actionId) continue;`
);

replaceOnce(
  'lib/clinical-action-gate.ts',
`export function evaluateClinicalActionAttempt(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  context: ClinicalGateContext;
}): ClinicalActionGateDecision {`,
`export function evaluateClinicalActionAttempt(input: {
  protocolId: string;
  nodeId?: string;
  interactionKind?: "action" | "decision";
  actionId: string;
  context: ClinicalGateContext;
}): ClinicalActionGateDecision {`
);

replaceOnce(
  'lib/clinical-action-gate-patient-state.ts',
`  nodeId?: string;
  actionId: string;
  now?: number;`,
`  nodeId?: string;
  interactionKind?: "action" | "decision";
  actionId: string;
  now?: number;`
);
replaceOnce(
  'lib/clinical-action-gate-patient-state.ts',
`    nodeId: input.nodeId,
    actionId: input.actionId,
    context: contextAssembly.context,`,
`    nodeId: input.nodeId,
    interactionKind: input.interactionKind,
    actionId: input.actionId,
    context: contextAssembly.context,`
);

replaceOnce(
  'components/protocol-screen/acls-decision-flow-screen.tsx',
`  const [pendingSoftStop, setPendingSoftStop] = useState<{ optionId: string; gateId: string; title: string; message: string; resolution: string } | undefined>(undefined);
  const [softStopReason, setSoftStopReason] = useState("");`,
`  const [pendingHardStop, setPendingHardStop] = useState<{ title: string; message: string; resolution: string } | undefined>(undefined);
  const [pendingSoftStop, setPendingSoftStop] = useState<{ optionId: string; gateId: string; title: string; message: string; resolution: string } | undefined>(undefined);
  const [softStopReason, setSoftStopReason] = useState("");`
);
replaceOnce(
  'components/protocol-screen/acls-decision-flow-screen.tsx',
`    const gate = evaluateClinicalActionAttemptFromPatientState({
      protocolId: currentModuleSlug,
      nodeId: currentStep.id,
      actionId: selected.clinicalActionId,
    }).decision.softStops[0];
    if (!gate) {
      commitDecision(optionId);
      return;
    }
    setSoftStopReason("");
    setPendingSoftStop({
      optionId,
      gateId: gate.policy.id,
      title: gate.policy.title,
      message: gate.policy.message,
      resolution: gate.policy.resolution,
    });`,
`    const decision = evaluateClinicalActionAttemptFromPatientState({
      protocolId: currentModuleSlug,
      nodeId: currentStep.id,
      interactionKind: "decision",
      actionId: selected.clinicalActionId,
    }).decision;
    const hardStop = decision.hardStops[0];
    if (hardStop) {
      setPendingSoftStop(undefined);
      setSoftStopReason("");
      setPendingHardStop({
        title: hardStop.policy.title,
        message: hardStop.policy.message,
        resolution: hardStop.policy.resolution,
      });
      return;
    }
    const softStop = decision.softStops[0];
    if (!softStop) {
      commitDecision(optionId);
      return;
    }
    setPendingHardStop(undefined);
    setSoftStopReason("");
    setPendingSoftStop({
      optionId,
      gateId: softStop.policy.id,
      title: softStop.policy.title,
      message: softStop.policy.message,
      resolution: softStop.policy.resolution,
    });`
);
replaceOnce(
  'components/protocol-screen/acls-decision-flow-screen.tsx',
`        {step.kind === "decision" ? (
          pendingSoftStop ? (`,
`        {step.kind === "decision" ? (
          pendingHardStop ? (
            <View style={styles.stepStack}>
              <SafetyGate
                title={tr(pendingHardStop.title)}
                message={tr(pendingHardStop.message)}
                primaryLabel={tr("Voltar e corrigir a condição de segurança")}
                onPrimary={() => setPendingHardStop(undefined)}
                severity="critical"
              />
              <Text style={styles.questionSummary}>{tr(pendingHardStop.resolution)}</Text>
            </View>
          ) : pendingSoftStop ? (`
);
replaceOnce(
  'components/protocol-screen/acls-decision-flow-screen.tsx',
`          protocolId,
          nodeId: step.id,
          actionId: step.clinicalActionId,`,
`          protocolId,
          nodeId: step.id,
          interactionKind: "action",
          actionId: step.clinicalActionId,`
);

console.log('✅ GATE-02: hard stop em decisão e interactionKind ligados ao runtime');