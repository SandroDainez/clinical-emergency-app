import { reassessmentBindingForNode } from "./clinical-reassessment-bindings";
import {
  completeClinicalReassessment,
  requireClinicalReassessment,
} from "./clinical-reassessment-runtime";

const pendingByBinding = new Map<string, string>();

function bindingKey(moduleId: string, therapyNodeId: string): string {
  return `${moduleId}:${therapyNodeId}`;
}

/**
 * Observa a visita a nós já existentes e espelha a obrigação de reavaliação.
 *
 * Não navega, não escolhe opções e não altera a DecisionTreeEngine.
 */
export function observeClinicalNodeForReassessment(input: {
  moduleId: string;
  nodeId: string;
  summary?: string;
  now?: number;
}): void {
  const match = reassessmentBindingForNode(input.moduleId, input.nodeId);
  if (!match) return;

  const key = bindingKey(match.binding.moduleId, match.binding.therapyNodeId);

  if (match.role === "therapy") {
    if (pendingByBinding.has(key)) return;
    const pending = requireClinicalReassessment({
      therapyId: match.binding.therapyId,
      module: input.moduleId,
      now: input.now,
    });
    if (pending) pendingByBinding.set(key, pending.id);
    return;
  }

  const pendingId = pendingByBinding.get(key);
  if (!pendingId) return;

  completeClinicalReassessment({
    reassessmentId: pendingId,
    summary: input.summary?.trim() || match.binding.label,
    now: input.now,
  });
  pendingByBinding.delete(key);
}

export function clearClinicalReassessmentNodeRuntime(): void {
  pendingByBinding.clear();
}
