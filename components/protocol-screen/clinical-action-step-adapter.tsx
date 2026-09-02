import type { ReactNode } from "react";

import type { FrontendTreeStep } from "../../core/decision-tree/types";
import { useTr } from "../../lib/use-tr";
import { ClinicalActionStepCard } from "./clinical-action-step-card";

export type ClinicalActionStepAdapterProps = {
  step: Extract<FrontendTreeStep, { kind: "action" }>;
  evidence?: ReactNode;
  rationale?: ReactNode;
  onAdvance: () => void;
};

/**
 * Adaptador de apresentação para uma conduta JÁ LIBERADA pelo shell.
 *
 * Gates, elegibilidade, guided discovery e qualquer avaliação clínica continuam
 * fora daqui. O adaptador somente encaminha o conteúdo do ActionStep para o card
 * visual e preserva o mesmo callback de avanço.
 */
export function ClinicalActionStepAdapter({
  step,
  evidence,
  rationale,
  onAdvance,
}: ClinicalActionStepAdapterProps) {
  const tr = useTr();

  return (
    <ClinicalActionStepCard
      title={step.title}
      summary={step.summary}
      actions={step.actions}
      evidence={evidence}
      rationale={rationale}
      onAdvance={onAdvance}
      tr={tr}
      testID="passo-de-conduta"
    />
  );
}
