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
 * `ClinicalTransitionContract.preserves` é a fonte de verdade dos fatos que
 * atravessam a troca de módulo. Este adapter evita manter uma segunda lista em
 * `ClinicalHandoffPreservationContract.requiredFacts`, que poderia divergir.
 *
 * A política de transferência continua explícita no consumidor: derivar fatos
 * não autoriza atrasar um destino urgente nem decide se contexto incompleto
 * pode bloquear a navegação.
 */
export function handoffPreservationFromTransition(input: {
  id: string;
  transitionId: string;
  transferPolicy?: ClinicalHandoffTransferPolicy;
}): ClinicalHandoffPreservationContract {
  const transition = findTransitionContract(input.transitionId);
  const requiredFacts = [...(transition.preserves ?? [])];

  if (!requiredFacts.length) {
    throw new Error(
      `Transição ${transition.id} não declara preserves[] para construir handoff`
    );
  }

  return {
    id: input.id,
    transitionId: transition.id,
    fromModule: transition.from,
    toModule: transition.to,
    requiredFacts,
    transferPolicy: input.transferPolicy,
  };
}
