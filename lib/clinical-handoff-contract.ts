import type { ClinicalHandoffPayload, ClinicalHandoffFact } from "./clinical-handoff-payload";
import { createClinicalHandoffPayload } from "./clinical-handoff-payload";

export type ClinicalHandoffTransferPolicy = "require_complete_context" | "do_not_delay_destination";

export type ClinicalHandoffPreservationContract = {
  id: string;
  transitionId: string;
  fromModule: string;
  toModule: string;
  requiredFacts: readonly string[];
  /**
   * Define apenas se a AUSÊNCIA de contexto pode segurar a transferência.
   * Não muda a obrigatoriedade documental dos fatos nem inventa valores.
   */
  transferPolicy?: ClinicalHandoffTransferPolicy;
};

export function buildClinicalHandoffPayload(
  contract: ClinicalHandoffPreservationContract,
  facts: readonly ClinicalHandoffFact[],
  now: number = Date.now()
): ClinicalHandoffPayload {
  const byId = new Map(facts.map((fact) => [fact.id, fact] as const));
  const missing = contract.requiredFacts.filter((id) => !byId.has(id));
  if (missing.length) {
    throw new Error(`Handoff ${contract.id} sem fatos obrigatórios: ${missing.join(", ")}`);
  }

  const selected = contract.requiredFacts.map((id) => ({ ...byId.get(id)! }));
  return createClinicalHandoffPayload({
    id: `${contract.id}:${now}`,
    transitionId: contract.transitionId,
    fromModule: contract.fromModule,
    toModule: contract.toModule,
    createdAt: now,
    facts: selected,
  });
}
