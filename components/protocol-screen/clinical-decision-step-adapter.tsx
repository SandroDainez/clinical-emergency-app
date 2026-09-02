import type { FrontendTreeStep } from "../../core/decision-tree/types";
import { ClinicalDecisionStepCard } from "./clinical-decision-step-card";

export type ClinicalDecisionStepAdapterProps = {
  step: Extract<FrontendTreeStep, { kind: "decision" }>;
  onChoose: (id: string) => void;
};

/**
 * Adaptador entre o FrontendTreeStep de decisão e sua apresentação.
 *
 * Não escolhe opção, não altera IDs e não reinterpreta evidência. O engine/shell
 * continua sendo a autoridade; este adaptador apenas encaminha o step e o mesmo
 * callback de escolha ao componente visual.
 */
export function ClinicalDecisionStepAdapter({
  step,
  onChoose,
}: ClinicalDecisionStepAdapterProps) {
  return <ClinicalDecisionStepCard step={step} onChoose={onChoose} />;
}
