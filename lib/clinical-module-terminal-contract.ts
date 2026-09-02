export type ClinicalModuleTerminalMode =
  | "care_pathway"
  | "procedural_subflow"
  | "embedded_care_pathway";

export type ClinicalModuleTerminalContract = {
  protocolId: string;
  mode: ClinicalModuleTerminalMode;
  /** Linhas de cuidado autônomas ou embutíveis precisam de destino assistencial próprio. */
  requiresClinicalDisposition: boolean;
  /** Subfluxos e linhas embutíveis precisam saber devolver o controle ao protocolo de origem. */
  requiresReturnToOrigin: boolean;
  rationale: string;
  reviewedAt: string;
};

export function validateClinicalModuleTerminalContracts(
  entries: readonly ClinicalModuleTerminalContract[]
): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry.protocolId)) issues.push(`${entry.protocolId}: contrato terminal duplicado`);
    seen.add(entry.protocolId);

    if (!entry.protocolId.trim()) issues.push("protocolId ausente");
    if (!entry.rationale.trim()) issues.push(`${entry.protocolId}: justificativa ausente`);
    if (!entry.reviewedAt.trim()) issues.push(`${entry.protocolId}: reviewedAt ausente`);

    if (entry.mode === "care_pathway") {
      if (!entry.requiresClinicalDisposition) {
        issues.push(`${entry.protocolId}: care_pathway exige destino assistencial`);
      }
      if (entry.requiresReturnToOrigin) {
        issues.push(`${entry.protocolId}: care_pathway não deve depender de retorno à origem`);
      }
    }

    if (entry.mode === "procedural_subflow") {
      if (entry.requiresClinicalDisposition) {
        issues.push(`${entry.protocolId}: procedural_subflow não deve inventar alta/UTI própria`);
      }
      if (!entry.requiresReturnToOrigin) {
        issues.push(`${entry.protocolId}: procedural_subflow exige retorno explícito à origem`);
      }
    }

    if (entry.mode === "embedded_care_pathway") {
      if (!entry.requiresClinicalDisposition) {
        issues.push(`${entry.protocolId}: embedded_care_pathway exige destino assistencial quando aberto diretamente`);
      }
      if (!entry.requiresReturnToOrigin) {
        issues.push(`${entry.protocolId}: embedded_care_pathway exige retorno quando chamado por outro protocolo`);
      }
    }
  }

  return issues;
}
