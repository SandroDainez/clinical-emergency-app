import {
  getClinicalObservation,
  type ClinicalObservation,
} from "./clinical-observations";
import {
  resolveObservationForDecision,
  type ObservationDecisionPolicy,
  type ObservationDecisionResolution,
} from "./clinical-observation-decision-gate";
import type { ClinicalGateContext, ClinicalGateFactValue } from "./clinical-gate-trigger";

export type ClinicalGateFactBinding = {
  fact: string;
  observationId: string;
  /** Mapeamento literal: valor armazenado -> fato usado pelo gate. */
  values: Readonly<Record<string, Exclude<ClinicalGateFactValue, undefined | null>>>;
};

export type ClinicalGateFactProblem = {
  fact: string;
  observationId: string;
  observation?: ClinicalObservation;
  decisionResolution?: ObservationDecisionResolution;
};

export type ClinicalGateContextAssembly = {
  context: ClinicalGateContext;
  missingFacts: readonly ClinicalGateFactProblem[];
  staleFacts: readonly ClinicalGateFactProblem[];
  unmappedFacts: readonly ClinicalGateFactProblem[];
  decisionResolutions: readonly ObservationDecisionResolution[];
};

/**
 * Constrói contexto de gate somente a partir de observações explícitas.
 *
 * Não interpreta texto livre, não consulta a árvore e não transforma ausência em
 * valor negativo. Validade temporal nunca pertence ao fato global: quando a
 * ação consumidora possui uma `ObservationDecisionPolicy`, a reutilização passa
 * obrigatoriamente por `resolveObservationForDecision`. Sem política explícita,
 * a observação continua sendo um fato registrado com timestamp, sem TTL inventado.
 */
export function assembleClinicalGateContextFromObservations(
  bindings: readonly ClinicalGateFactBinding[],
  now: number = Date.now(),
  decisionPolicies: readonly ObservationDecisionPolicy[] = []
): ClinicalGateContextAssembly {
  const context: Record<string, ClinicalGateFactValue> = {};
  const missingFacts: ClinicalGateFactProblem[] = [];
  const staleFacts: ClinicalGateFactProblem[] = [];
  const unmappedFacts: ClinicalGateFactProblem[] = [];
  const decisionResolutions: ObservationDecisionResolution[] = [];

  for (const binding of bindings) {
    const policy = decisionPolicies.find((candidate) => candidate.observationId === binding.observationId);
    const decisionResolution = policy ? resolveObservationForDecision(policy, now) : undefined;
    if (decisionResolution) decisionResolutions.push(decisionResolution);

    if (decisionResolution?.status === "missing") {
      missingFacts.push({
        fact: binding.fact,
        observationId: binding.observationId,
        decisionResolution,
      });
      continue;
    }

    if (decisionResolution?.status === "confirmation_required") {
      staleFacts.push({
        fact: binding.fact,
        observationId: binding.observationId,
        observation: decisionResolution.observation,
        decisionResolution,
      });
      continue;
    }

    const observation = decisionResolution
      ? decisionResolution.observation
      : getClinicalObservation(binding.observationId);

    if (!observation) {
      missingFacts.push({ fact: binding.fact, observationId: binding.observationId });
      continue;
    }

    const mapped = binding.values[observation.value];
    if (mapped === undefined) {
      unmappedFacts.push({
        fact: binding.fact,
        observationId: binding.observationId,
        observation,
        decisionResolution,
      });
      continue;
    }

    context[binding.fact] = mapped;
  }

  return { context, missingFacts, staleFacts, unmappedFacts, decisionResolutions };
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
  {
    fact: "tep_categoria_reperfusao",
    observationId: "tep_categoria_reperfusao",
    values: {
      a_b_c1_c2: "a_b_c1_c2",
      c3: "c3",
      e: "e",
    },
  },
] as const;
