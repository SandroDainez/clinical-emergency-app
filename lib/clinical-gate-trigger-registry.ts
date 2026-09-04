import { CLINICAL_GATE_REGISTRY } from "./clinical-gate-registry";
import {
  conditionMatches,
  validateClinicalGateTriggers,
  type ActiveClinicalGate,
  type ClinicalGateContext,
  type ClinicalGateTrigger,
} from "./clinical-gate-trigger";

export const CLINICAL_GATE_TRIGGER_REGISTRY: readonly ClinicalGateTrigger[] = [
  {
    id: "avc-ivt-when-acute-hemorrhage",
    gateId: "avc-ivt-hemorragia-aguda",
    protocolId: "avc",
    nodeId: "trombolise",
    interactionKind: "action",
    actionId: "administrar_trombolise_iv",
    when: { fact: "hemorragia_intracraniana_aguda", operator: "equals", value: true },
  },
  {
    id: "sca-commit-reperfusion-without-pci-time",
    gateId: "sca-tempo-icp-nao-confirmado",
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    interactionKind: "decision",
    actionId: "definir_estrategia_reperfusao",
    when: { fact: "tempo_operacional_icp", operator: "equals", value: "desconhecido" },
  },
  {
    id: "tachy-cardioversion-without-sedation",
    gateId: "taquicardia-sedacao-cardioversao",
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    interactionKind: "action",
    actionId: "cardioversao_sincronizada",
    when: { fact: "sedacao", operator: "not_equals", value: "realizada" },
  },
  {
    id: "tachy-cardioversion-sedation-missing",
    gateId: "taquicardia-sedacao-cardioversao",
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    interactionKind: "action",
    actionId: "cardioversao_sincronizada",
    when: { fact: "sedacao", operator: "missing" },
  },
  {
    id: "tep-systemic-thrombolysis-lower-category",
    gateId: "tep-lise-sistemica-categoria-inferior",
    protocolId: "tep",
    nodeId: "ar_trombolise",
    interactionKind: "action",
    actionId: "administrar_trombolise_sistemica_tep",
    when: { fact: "tep_categoria_reperfusao", operator: "equals", value: "a_b_c1_c2" },
  },
] as const;

export function activeClinicalGatesForAction(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  context: ClinicalGateContext;
}): ActiveClinicalGate[] {
  const byGateId = new Map<string, ActiveClinicalGate>();

  for (const trigger of CLINICAL_GATE_TRIGGER_REGISTRY) {
    if (trigger.protocolId !== input.protocolId) continue;
    if (trigger.nodeId && trigger.nodeId !== input.nodeId) continue;
    if (trigger.actionId !== input.actionId) continue;
    if (!conditionMatches(trigger.when, input.context)) continue;

    const policy = CLINICAL_GATE_REGISTRY.find((entry) => entry.id === trigger.gateId);
    if (!policy) continue;
    if (!byGateId.has(policy.id)) byGateId.set(policy.id, { trigger, policy });
  }

  return [...byGateId.values()];
}

export function validateClinicalGateTriggerRegistry(): string[] {
  return validateClinicalGateTriggers(CLINICAL_GATE_TRIGGER_REGISTRY, CLINICAL_GATE_REGISTRY);
}
