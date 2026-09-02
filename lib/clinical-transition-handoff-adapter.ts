import type {
  ClinicalHandoffPreservationContract,
  ClinicalHandoffTransferPolicy,
} from "./clinical-handoff-contract";
import { CLINICAL_TRANSITION_CONTRACTS } from "./clinical-transition-contracts";
import type { ClinicalTransitionContract } from "./clinical-transitions";

function findTransitionContract(transitionId: string): ClinicalTransitionContract {
  const transition = CLINICAL_TRANSITION_CONTRACTS.find((item) => item.id === transitionId);
  if (!transition) {
    throw new Error(`Transição clínica não encontrada para handoff: ${transitionId}`);
  }
  return transition;
}

/**
 * Deriva o contrato de preservação a partir da aresta clínica canônica.
 *
 * `ClinicalTransitionContract.preserves` é a fonte de verdade do conjunto de
 * fatos que pode atravessar a troca de módulo. O consumidor escolhe, dentro
 * desse conjunto, quais são realmente obrigatórios. Os demais permanecem
 * opcionais: viajam se já estiverem documentados, sem inferência e sem valor
 * inventado.
 */
export function handoffPreservationFromTransition(input: {
  id: string;
  transitionId: string;
  requiredFacts?: readonly string[];
  transferPolicy?: ClinicalHandoffTransferPolicy;
}): ClinicalHandoffPreservationContract {
  const transition = findTransitionContract(input.transitionId);
  const preservedFacts = [...(transition.preserves ?? [])];

  if (!preservedFacts.length) {
    throw new Error(
      `Transição ${transition.id} não declara preserves[] para construir handoff`
    );
  }

  const requiredFacts = [...(input.requiredFacts ?? [])];
  const invalidRequired = requiredFacts.filter((id) => !preservedFacts.includes(id));
  if (invalidRequired.length) {
    throw new Error(
      `Handoff ${input.id} exige fatos fora de preserves[]: ${invalidRequired.join(", ")}`
    );
  }

  return {
    id: input.id,
    transitionId: transition.id,
    fromModule: transition.from,
    toModule: transition.to,
    requiredFacts,
    optionalFacts: preservedFacts.filter((id) => !requiredFacts.includes(id)),
    transferPolicy: input.transferPolicy,
  };
}
