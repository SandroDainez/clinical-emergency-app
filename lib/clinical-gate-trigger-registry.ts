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
    nodeId: "tc_resultado",
    actionId: "administrar_trombolise_iv",
    when: { fact: "hemorragia_intracraniana_aguda", operator: "equals", value: true },
  },
  {
    id: "sca-commit-reperfusion-without-pci-time",
    gateId: "sca-tempo-icp-nao-confirmado",
    protocolId: "sca",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    when: { fact: "tempo_operacional_icp", operator: "equals", value: "desconhecido" },
  },
  {
    id: "tachy-cardioversion-without-sedation",
    gateId: "taquicardia-sedacao-cardioversao",
    protocolId: "taquicardia-acls",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    when: { fact: "sedacao", operator: "not_equals", value: "realizada" },
  },
] as const;

export function activeClinicalGatesForAction(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  context: ClinicalGateContext;
}): ActiveClinicalGate[] {
  return CLINICAL_GATE_TRIGGER_REGISTRY.flatMap((trigger) => {
    if (trigger.protocolId !== input.protocolId) return [];
    if (trigger.nodeId && trigger.nodeId !== input.nodeId) return [];
    if (trigger.actionId !== input.actionId) return [];
    if (!conditionMatches(trigger.when, input.context)) return [];

    const policy = CLINICAL_GATE_REGISTRY.find((entry) => entry.id === trigger.gateId);
    if (!policy) return [];
    return [{ trigger, policy }];
  });
}

export function validateClinicalGateTriggerRegistry(): string[] {
  return validateClinicalGateTriggers(CLINICAL_GATE_TRIGGER_REGISTRY, CLINICAL_GATE_REGISTRY);
}
