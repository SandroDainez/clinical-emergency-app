import type { ClinicalGatePolicy } from "./clinical-gate-policy";

export type ClinicalGateFactValue = string | number | boolean | null | undefined;
export type ClinicalGateContext = Readonly<Record<string, ClinicalGateFactValue>>;

export type ClinicalGateCondition =
  | { fact: string; operator: "equals"; value: Exclude<ClinicalGateFactValue, undefined> }
  | { fact: string; operator: "not_equals"; value: Exclude<ClinicalGateFactValue, undefined> }
  | { fact: string; operator: "missing" };

/**
 * Liga uma política de segurança a uma AÇÃO tentada.
 *
 * O nodeId sozinho nunca ativa gate: ele só restringe onde aquela ação pode ser
 * reconhecida. A condição é avaliada sobre fatos explícitos do caso; ausência de
 * fato não pode ser transformada silenciosamente em presença/ausência clínica.
 */
export type ClinicalGateTrigger = {
  id: string;
  gateId: string;
  protocolId: string;
  nodeId?: string;
  actionId: string;
  when: ClinicalGateCondition;
};

export type ActiveClinicalGate = {
  trigger: ClinicalGateTrigger;
  policy: ClinicalGatePolicy;
};

export function conditionMatches(
  condition: ClinicalGateCondition,
  context: ClinicalGateContext
): boolean {
  const actual = context[condition.fact];
  const missing = actual === undefined || actual === null;
  if (condition.operator === "missing") return missing;
  if (missing) return false;
  if (condition.operator === "equals") return actual === condition.value;
  return actual !== condition.value;
}

export function validateClinicalGateTriggers(
  triggers: readonly ClinicalGateTrigger[],
  policies: readonly ClinicalGatePolicy[]
): string[] {
  const issues: string[] = [];
  const triggerIds = new Set<string>();
  const policyById = new Map(policies.map((policy) => [policy.id, policy]));

  for (const trigger of triggers) {
    if (!trigger.id.trim()) issues.push("trigger de gate sem id");
    if (triggerIds.has(trigger.id)) issues.push(`${trigger.id}: trigger duplicado`);
    triggerIds.add(trigger.id);
    if (!trigger.gateId.trim()) issues.push(`${trigger.id}: gateId ausente`);
    if (!trigger.protocolId.trim()) issues.push(`${trigger.id}: protocolId ausente`);
    if (!trigger.actionId.trim()) issues.push(`${trigger.id}: actionId ausente`);
    if (!trigger.when.fact.trim()) issues.push(`${trigger.id}: fato de ativação ausente`);

    const policy = policyById.get(trigger.gateId);
    if (!policy) {
      issues.push(`${trigger.id}: política ${trigger.gateId} inexistente`);
      continue;
    }
    if (policy.protocolId && policy.protocolId !== trigger.protocolId) {
      issues.push(`${trigger.id}: protocolId diverge da política ${trigger.gateId}`);
    }
    if (policy.nodeId && trigger.nodeId && policy.nodeId !== trigger.nodeId) {
      issues.push(`${trigger.id}: nodeId diverge da política ${trigger.gateId}`);
    }
  }

  return issues;
}
