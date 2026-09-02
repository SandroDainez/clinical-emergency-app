import { requireClinicalReassessment, completeClinicalReassessment } from "./clinical-reassessment-runtime";

const pendingByModule = new Map<string, string>();

/**
 * Início/escalonamento de vasopressor não vive em um único nó de árvore no app;
 * ocorre principalmente na calculadora/engine de vasoativos e em módulos que a
 * chamam. Por isso a obrigação é orientada a EVENTO, não a um nodeId inventado.
 */
export function recordVasopressorStartOrEscalation(input: {
  moduleId: string;
  now?: number;
}): string | undefined {
  const item = requireClinicalReassessment({
    therapyId: "vasopressor_start",
    module: input.moduleId,
    now: input.now,
  });
  if (!item) return undefined;
  pendingByModule.set(input.moduleId, item.id);
  return item.id;
}

export function recordVasopressorReassessment(input: {
  moduleId: string;
  summary: string;
  now?: number;
}): void {
  const reassessmentId = pendingByModule.get(input.moduleId);
  if (!reassessmentId) throw new Error(`Sem reavaliação de vasopressor pendente em ${input.moduleId}`);
  completeClinicalReassessment({ reassessmentId, summary: input.summary, now: input.now });
  pendingByModule.delete(input.moduleId);
}

export function clearVasopressorReassessmentState(): void {
  pendingByModule.clear();
}
