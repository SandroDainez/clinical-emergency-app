import { listClinicalEvents } from "./clinical-event-log";
import {
  evaluateClinicalTemporalGoals,
  type ClinicalTemporalGoalContract,
  type ClinicalTemporalGoalResult,
} from "./clinical-temporal-goals";

export type ClinicalTemporalDebrief = {
  generatedAt: number;
  goals: ClinicalTemporalGoalResult[];
  summary: {
    met: number;
    missed: number;
    pending: number;
    notEvaluable: number;
  };
};

/**
 * Gera automaticamente a seção temporal do debrief a partir do Event Log
 * append-only do atendimento atual.
 *
 * Esta função deliberadamente não contém metas clínicas. O chamador fornece
 * contratos temporais revisados; o debrief apenas mede e classifica os eventos.
 */
export function buildClinicalTemporalDebrief(
  goals: readonly ClinicalTemporalGoalContract[],
  now: number = Date.now()
): ClinicalTemporalDebrief {
  const results = evaluateClinicalTemporalGoals(listClinicalEvents(), goals, now);

  return {
    generatedAt: now,
    goals: results,
    summary: {
      met: results.filter((item) => item.status === "met").length,
      missed: results.filter((item) => item.status === "missed").length,
      pending: results.filter((item) => item.status === "pending").length,
      notEvaluable: results.filter((item) => item.status === "not_evaluable").length,
    },
  };
}
