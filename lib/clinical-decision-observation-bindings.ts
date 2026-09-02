export type ClinicalDecisionObservationBinding = {
  protocolId: string;
  nodeId: string;
  optionId: string;
  observation: {
    id: string;
    value: string;
    unit?: string;
  };
};

/**
 * Somente fatos que a própria resposta declara literalmente entram aqui.
 *
 * Não usar este registry para inferir gravidade, elegibilidade ou intenção
 * terapêutica. Ele traduz uma resposta já dada em observação temporal para que
 * outros componentes possam reutilizar o fato com origem e timestamp.
 */
export const CLINICAL_DECISION_OBSERVATION_BINDINGS: readonly ClinicalDecisionObservationBinding[] = [
  {
    protocolId: "avc",
    nodeId: "tc_resultado",
    optionId: "isquemico",
    observation: { id: "hemorragia_intracraniana_aguda", value: "nao" },
  },
  {
    protocolId: "avc",
    nodeId: "tc_resultado",
    optionId: "hic",
    observation: { id: "hemorragia_intracraniana_aguda", value: "sim" },
  },
  {
    protocolId: "avc",
    nodeId: "tc_resultado",
    optionId: "hsa",
    observation: { id: "hemorragia_intracraniana_aguda", value: "sim" },
  },
  {
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    optionId: "nao_sei",
    observation: { id: "tempo_operacional_icp", value: "desconhecido" },
  },
  {
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    optionId: "icp",
    observation: { id: "tempo_operacional_icp", value: "confirmado" },
  },
  {
    protocolId: "sindromes-coronarianas",
    nodeId: "stemi_reperfusao",
    optionId: "fibrino",
    observation: { id: "tempo_operacional_icp", value: "confirmado" },
  },
] as const;

export function decisionObservationFor(input: {
  protocolId?: string;
  nodeId: string;
  optionId: string;
}): ClinicalDecisionObservationBinding["observation"] | undefined {
  if (!input.protocolId) return undefined;
  return CLINICAL_DECISION_OBSERVATION_BINDINGS.find(
    (binding) =>
      binding.protocolId === input.protocolId &&
      binding.nodeId === input.nodeId &&
      binding.optionId === input.optionId
  )?.observation;
}

export function validateClinicalDecisionObservationBindings(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const binding of CLINICAL_DECISION_OBSERVATION_BINDINGS) {
    const key = `${binding.protocolId}:${binding.nodeId}:${binding.optionId}`;
    if (seen.has(key)) issues.push(`${key}: binding duplicado`);
    seen.add(key);
    if (!binding.observation.id.trim()) issues.push(`${key}: observation id ausente`);
    if (!binding.observation.value.trim()) issues.push(`${key}: observation value ausente`);
  }

  return issues;
}
