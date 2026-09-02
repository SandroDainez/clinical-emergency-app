import { assessClinicalGatePromotion, requireClinicalGatePromotionReady } from "../lib/clinical-gate-governance";

function expect(condition: boolean, message: string, issues: string[]) {
  if (!condition) issues.push(message);
}

export function runExecutableGatePromotionGovernanceCases(): string[] {
  const issues: string[] = [];

  const incomplete = assessClinicalGatePromotion({
    candidateId: "candidate-incomplete",
    evidenceReviewed: false,
    factsModeled: false,
    interactionDeclared: false,
    levelResolved: false,
  });
  expect(incomplete.ready === false, "Promoção incompleta não pode estar pronta", issues);
  expect(incomplete.missing.length === 4, "Promoção vazia deve declarar os quatro requisitos ausentes", issues);

  const evidenceOnly = assessClinicalGatePromotion({
    candidateId: "candidate-evidence-only",
    evidenceReviewed: true,
    factsModeled: false,
    interactionDeclared: false,
    levelResolved: false,
  });
  expect(evidenceOnly.ready === false, "Fonte revisada isoladamente não pode promover gate", issues);
  expect(!evidenceOnly.missing.includes("evidence_reviewed"), "Requisito já cumprido não pode permanecer ausente", issues);

  const ready = {
    candidateId: "candidate-ready",
    evidenceReviewed: true,
    factsModeled: true,
    interactionDeclared: true,
    levelResolved: true,
  } as const;
  const readyAssessment = assessClinicalGatePromotion(ready);
  expect(readyAssessment.ready === true, "Quatro eixos resolvidos devem marcar candidato como pronto", issues);
  expect(readyAssessment.missing.length === 0, "Candidato pronto não pode ter requisito ausente", issues);

  let threw = false;
  try {
    requireClinicalGatePromotionReady({
      candidateId: "candidate-blocked",
      evidenceReviewed: true,
      factsModeled: false,
      interactionDeclared: true,
      levelResolved: true,
    });
  } catch {
    threw = true;
  }
  expect(threw, "requireClinicalGatePromotionReady deve recusar candidato incompleto", issues);

  try {
    requireClinicalGatePromotionReady(ready);
  } catch {
    issues.push("requireClinicalGatePromotionReady não pode recusar candidato completo");
  }

  return issues;
}
