import {
  getClinicalObservation,
  getObservationAgeMs,
  type ClinicalObservation,
} from "./clinical-observations";
import type { ClinicalGateContext, ClinicalGateFactValue } from "./clinical-gate-trigger";

export type ClinicalGateFactBinding = {
  fact: string;
  observationId: string;
  /** Mapeamento literal: valor armazenado -> fato usado pelo gate. */
  values: Readonly<Record<string, Exclude<ClinicalGateFactValue, undefined | null>>>;
  /** Se definido, observação mais antiga não entra como fato atual. */
  maxAgeMs?: number;
};

export type ClinicalGateFactProblem = {
  fact: string;
  observationId: string;
  observation?: ClinicalObservation;
};

export type ClinicalGateContextAssembly = {
  context: ClinicalGateContext;
  missingFacts: readonly ClinicalGateFactProblem[];
  staleFacts: readonly ClinicalGateFactProblem[];
  unmappedFacts: readonly ClinicalGateFactProblem[];
};

/**
 * Constrói contexto de gate somente a partir de observações explícitas.
 *
 * Não interpreta texto livre, não consulta a árvore e não transforma ausência em
 * valor negativo. Observação stale fica fora do contexto e é devolvida como
 * problema separado para confirmação/recoleta pela camada chamadora.
 */
export function assembleClinicalGateContextFromObservations(
  bindings: readonly ClinicalGateFactBinding[],
  now: number = Date.now()
): ClinicalGateContextAssembly {
  const context: Record<string, ClinicalGateFactValue> = {};
  const missingFacts: ClinicalGateFactProblem[] = [];
  const staleFacts: ClinicalGateFactProblem[] = [];
  const unmappedFacts: ClinicalGateFactProblem[] = [];

  for (const binding of bindings) {
    const observation = getClinicalObservation(binding.observationId);
    if (!observation) {
      missingFacts.push({ fact: binding.fact, observationId: binding.observationId });
      continue;
    }

    if (binding.maxAgeMs !== undefined && getObservationAgeMs(observation, now) > binding.maxAgeMs) {
      staleFacts.push({ fact: binding.fact, observationId: binding.observationId, observation });
      continue;
    }

    const mapped = binding.values[observation.value];
    if (mapped === undefined) {
      unmappedFacts.push({ fact: binding.fact, observationId: binding.observationId, observation });
      continue;
    }

    context[binding.fact] = mapped;
  }

  return { context, missingFacts, staleFacts, unmappedFacts };
}

export const INITIAL_CLINICAL_GATE_FACT_BINDINGS: readonly ClinicalGateFactBinding[] = [
  {
    fact: "hemorragia_intracraniana_aguda",
    observationId: "hemorragia_intracraniana_aguda",
    values: { sim: true, nao: false },
  },
  {
    fact: "tempo_operacional_icp",
    observationId: "tempo_operacional_icp",
    values: { desconhecido: "desconhecido", confirmado: "confirmado" },
  },
  {
    fact: "sedacao",
    observationId: "sedacao",
    values: { realizada: "realizada", nao_realizada: "nao_realizada" },
  },
] as const;
