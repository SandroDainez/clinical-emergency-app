import type { FrontendTreeStep } from "../../core/decision-tree/types";
import { useTr } from "../../lib/use-tr";
import { ClinicalTransitionStepCard } from "./clinical-transition-step-card";

export type ClinicalTransitionStepAdapterProps = {
  step: Extract<FrontendTreeStep, { kind: "transition" }>;
  onOpenModule: (moduleId: string) => void;
};

/**
 * Adaptador entre o FrontendTreeStep de transição e sua apresentação.
 *
 * Não decide destino, não executa handoff e não conhece roteamento. Recebe do
 * shell o callback que abre o módulo e encaminha, sem transformação, os dados
 * que o engine já expôs no step.
 */
export function ClinicalTransitionStepAdapter({
  step,
  onOpenModule,
}: ClinicalTransitionStepAdapterProps) {
  const tr = useTr();

  return (
    <ClinicalTransitionStepCard
      title={step.title}
      summary={step.summary}
      disposition={step.disposition}
      exitCriteria={step.exitCriteria}
      targets={step.targets}
      onOpenModule={onOpenModule}
      tr={tr}
      testID="passo-de-transicao"
    />
  );
}
