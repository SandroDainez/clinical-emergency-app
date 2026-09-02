import type { ClinicalEvent } from "./clinical-event-log";
import type { ClinicalObservation } from "./clinical-observations";
import {
  assembleClinicalHandoff,
  type ClinicalHandoffAssemblyResult,
} from "./clinical-handoff-assembler";
import type { ClinicalHandoffPreservationContract } from "./clinical-handoff-contract";
import { publishClinicalHandoff } from "./clinical-handoff-runtime";

export type ClinicalHandoffTransferReadiness = {
  assembly: ClinicalHandoffAssemblyResult;
  canProceedToDestination: boolean;
  contextPublished: boolean;
  missingFacts: readonly string[];
};

/**
 * Prepara contexto para uma transferência clínica sem confundir documentação
 * com prioridade assistencial.
 *
 * - contexto completo: publica payload e libera destino;
 * - contexto incompleto + require_complete_context: não libera destino;
 * - contexto incompleto + do_not_delay_destination: libera destino imediatamente,
 *   mas mantém `missingFacts` explícitos e não publica um payload fingidamente completo.
 */
export function prepareClinicalHandoffTransfer(input: {
  contract: ClinicalHandoffPreservationContract;
  observations?: readonly ClinicalObservation[];
  events?: readonly ClinicalEvent[];
  now?: number;
}): ClinicalHandoffTransferReadiness {
  const assembly = assembleClinicalHandoff(input);
  if (assembly.status === "complete") {
    publishClinicalHandoff(assembly.payload);
    return {
      assembly,
      canProceedToDestination: true,
      contextPublished: true,
      missingFacts: [],
    };
  }

  const doNotDelay = input.contract.transferPolicy === "do_not_delay_destination";
  return {
    assembly,
    canProceedToDestination: doNotDelay,
    contextPublished: false,
    missingFacts: [...assembly.missingFacts],
  };
}

/**
 * Compatibilidade: prepara e publica somente quando todos os fatos obrigatórios
 * existem. Use `prepareClinicalHandoffTransfer` quando a decisão de prosseguir
 * para o destino também precisar ser conhecida.
 */
export function prepareAndPublishClinicalHandoff(input: {
  contract: ClinicalHandoffPreservationContract;
  observations?: readonly ClinicalObservation[];
  events?: readonly ClinicalEvent[];
  now?: number;
}): ClinicalHandoffAssemblyResult {
  return prepareClinicalHandoffTransfer(input).assembly;
}
