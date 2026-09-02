export type ClinicalGatePromotionRequirement =
  | "evidence_reviewed"
  | "facts_modeled"
  | "interaction_declared"
  | "level_resolved";

export type ClinicalGatePromotionReadiness = {
  candidateId: string;
  evidenceReviewed: boolean;
  factsModeled: boolean;
  interactionDeclared: boolean;
  levelResolved: boolean;
};

export type ClinicalGatePromotionAssessment = {
  ready: boolean;
  missing: readonly ClinicalGatePromotionRequirement[];
};

/**
 * Gate clínico só pode sair de dívida para policy ativa quando todos os quatro
 * eixos estiverem resolvidos. A função não decide medicina: apenas impede que
 * uma revisão parcial seja confundida com prontidão para ativação.
 */
export function assessClinicalGatePromotion(
  readiness: ClinicalGatePromotionReadiness
): ClinicalGatePromotionAssessment {
  const missing: ClinicalGatePromotionRequirement[] = [];
  if (!readiness.evidenceReviewed) missing.push("evidence_reviewed");
  if (!readiness.factsModeled) missing.push("facts_modeled");
  if (!readiness.interactionDeclared) missing.push("interaction_declared");
  if (!readiness.levelResolved) missing.push("level_resolved");
  return { ready: missing.length === 0, missing };
}

export function requireClinicalGatePromotionReady(
  readiness: ClinicalGatePromotionReadiness
): void {
  const assessment = assessClinicalGatePromotion(readiness);
  if (!assessment.ready) {
    throw new Error(
      `${readiness.candidateId}: SafetyGate ainda não pode ser promovido; faltam ${assessment.missing.join(", ")}`
    );
  }
}
