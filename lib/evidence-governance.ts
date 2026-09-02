export type ClinicalEvidence = {
  reference: string;
  version?: string;
  year?: number;
  reviewedAt: string;
  reviewer?: string;
};

export type ActionableRecommendation = {
  id: string;
  statement: string;
  evidence: ClinicalEvidence;
};

export type ProtocolVersion = {
  protocolId: string;
  clinicalVersion: string;
  publishedAt: string;
  recommendations: readonly ActionableRecommendation[];
};

export function validateProtocolVersion(version: ProtocolVersion): string[] {
  const issues: string[] = [];
  if (!version.protocolId) issues.push("protocolId ausente");
  if (!version.clinicalVersion) issues.push("clinicalVersion ausente");
  if (!version.publishedAt) issues.push("publishedAt ausente");

  for (const recommendation of version.recommendations) {
    if (!recommendation.id) issues.push("recomendação sem id");
    if (!recommendation.statement) issues.push(`${recommendation.id || "recomendação"}: texto ausente`);
    if (!recommendation.evidence.reference) issues.push(`${recommendation.id}: fonte ausente`);
    if (!recommendation.evidence.reviewedAt) issues.push(`${recommendation.id}: reviewedAt ausente`);
  }
  return issues;
}

/**
 * Regra de segurança: um atendimento iniciado numa versão clínica permanece
 * preso a ela. Atualização de conteúdo não deve trocar a regra no meio do caso.
 */
export function sameClinicalVersionAtRuntime(
  startedVersion: string,
  currentVersion: string
): string {
  return startedVersion || currentVersion;
}
