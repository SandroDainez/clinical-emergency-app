export type ClinicalGateLevel = "hard_stop" | "soft_stop" | "advisory";

export type ClinicalGatePolicy = {
  id: string;
  protocolId?: string;
  nodeId?: string;
  level: ClinicalGateLevel;
  title: string;
  message: string;
  /** Por que este nível de bloqueio é apropriado. */
  rationale: string;
  /** Hard stop não admite override. Soft stop exige motivo. Advisory nunca bloqueia. */
  overrideAllowed: boolean;
  /** O que precisa acontecer para o gate deixar de estar ativo. */
  resolution: string;
  /** Nó seguro para o qual a UI pode retornar quando a política declara um. */
  resolutionNodeId?: string;
  source?: {
    reference: string;
    version?: string;
    reviewedAt: string;
  };
};

export function validateClinicalGatePolicies(entries: readonly ClinicalGatePolicy[]): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry.id.trim()) issues.push("gate sem id");
    if (seen.has(entry.id)) issues.push(`${entry.id}: gate duplicado`);
    seen.add(entry.id);
    if (!entry.title.trim()) issues.push(`${entry.id}: título ausente`);
    if (!entry.message.trim()) issues.push(`${entry.id}: mensagem ausente`);
    if (!entry.rationale.trim()) issues.push(`${entry.id}: justificativa ausente`);
    if (!entry.resolution.trim()) issues.push(`${entry.id}: resolução ausente`);
    if (entry.resolutionNodeId !== undefined && !entry.resolutionNodeId.trim()) {
      issues.push(`${entry.id}: resolutionNodeId vazio`);
    }
    if (entry.level === "hard_stop" && entry.overrideAllowed) {
      issues.push(`${entry.id}: hard stop não pode permitir override`);
    }
    if (entry.level === "soft_stop" && !entry.overrideAllowed) {
      issues.push(`${entry.id}: soft stop deve permitir override com motivo`);
    }
    if (entry.level === "advisory" && entry.overrideAllowed) {
      issues.push(`${entry.id}: advisory não usa override porque não bloqueia`);
    }
    if (entry.level === "hard_stop" && !entry.source) {
      issues.push(`${entry.id}: hard stop exige fonte explícita`);
    }
  }

  return issues;
}

export function gateBlocks(level: ClinicalGateLevel): boolean {
  return level !== "advisory";
}

export function gateNeedsOverrideReason(policy: ClinicalGatePolicy): boolean {
  return policy.level === "soft_stop" && policy.overrideAllowed;
}
