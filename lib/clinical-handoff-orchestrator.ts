import type { ClinicalEvent } from "./clinical-event-log";
import type { ClinicalObservation } from "./clinical-observations";
import {
  assembleClinicalHandoff,
  type ClinicalHandoffAssemblyResult,
} from "./clinical-handoff-assembler";
import type { ClinicalHandoffPreservationContract } from "./clinical-handoff-contract";
import { publishClinicalHandoff } from "./clinical-handoff-runtime";

/**
 * Prepara e publica um handoff somente quando todos os fatos obrigatórios já
 * existem no estado clínico/event log.
 *
 * Resultado incompleto nunca é publicado silenciosamente. A camada de UI pode
 * usar `missingFacts` para pedir os dados faltantes ou registrar explicitamente
 * que eles são desconhecidos antes de tentar novamente.
 */
export function prepareAndPublishClinicalHandoff(input: {
  contract: ClinicalHandoffPreservationContract;
  observations?: readonly ClinicalObservation[];
  events?: readonly ClinicalEvent[];
  now?: number;
}): ClinicalHandoffAssemblyResult {
  const result = assembleClinicalHandoff(input);
  if (result.status === "complete") {
    publishClinicalHandoff(result.payload);
  }
  return result;
}
