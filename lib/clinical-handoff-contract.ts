import type { ClinicalHandoffPayload, ClinicalHandoffFact } from "./clinical-handoff-payload";
import { createClinicalHandoffPayload } from "./clinical-handoff-payload";

export type ClinicalHandoffTransferPolicy = "require_complete_context" | "do_not_delay_destination";

export type ClinicalHandoffPreservationContract = {
  id: string;
  transitionId: string;
  fromModule: string;
  toModule: string;
  /** Fatos cuja ausência torna o contexto insuficiente para este contrato. */
  requiredFacts: readonly string[];
  /**
   * Fatos úteis que devem atravessar a transição quando já estiverem registrados,
   * mas cuja ausência não autoriza inventar valores nem bloquear o destino.
   */
  optionalFacts?: readonly string[];
  /**
   * Define apenas se a AUSÊNCIA de fatos obrigatórios pode segurar a transferência.
   * Não transforma fatos opcionais em obrigatórios e nunca inventa valores.
   */
  transferPolicy?: ClinicalHandoffTransferPolicy;
};

export function buildClinicalHandoffPayload(
  contract: ClinicalHandoffPreservationContract,
  facts: readonly ClinicalHandoffFact[],
  now: number = Date.now()
): ClinicalHandoffPayload {
  const byId = new Map(facts.map((fact) => [fact.id, fact] as const));
  const missingRequired = contract.requiredFacts.filter((id) => !byId.has(id));
  if (missingRequired.length) {
    throw new Error(
      `Handoff ${contract.id} sem fatos obrigatórios: ${missingRequired.join(", ")}`
    );
  }

  const requestedIds = [
    ...contract.requiredFacts,
    ...(contract.optionalFacts ?? []).filter((id) => !contract.requiredFacts.includes(id)),
  ];
  const selected = requestedIds
    .map((id) => byId.get(id))
    .filter((fact): fact is ClinicalHandoffFact => Boolean(fact))
    .map((fact) => ({ ...fact }));

  return createClinicalHandoffPayload({
    id: `${contract.id}:${now}`,
    transitionId: contract.transitionId,
    fromModule: contract.fromModule,
    toModule: contract.toModule,
    createdAt: now,
    facts: selected,
  });
}
