import { prepareClinicalHandoffTransfer, type ClinicalHandoffTransferReadiness } from "./clinical-handoff-orchestrator";
import {
  PCR_TERMINAL_HANDOFF_CONTEXTS,
  type PcrTerminalHandoffContextContract,
} from "./pcr-terminal-handoff-context";

export type ClinicalTargetHandoffAttempt =
  | {
      matched: false;
      canProceedToDestination: true;
    }
  | {
      matched: true;
      contract: PcrTerminalHandoffContextContract;
      readiness: ClinicalHandoffTransferReadiness;
      canProceedToDestination: boolean;
    };

/**
 * Resolve um clique de `target` contra contratos de handoff que têm contexto
 * preservável registrado.
 *
 * Importante: a ausência de contrato significa apenas que o target mantém o
 * comportamento normal de navegação. Este runtime NÃO promove referências,
 * adjuntos ou contingências a handoff por semelhança de moduleId.
 */
export function prepareRegisteredTargetHandoff(input: {
  fromProtocolId: string;
  fromNodeId: string;
  targetModuleId: string;
  now?: number;
}): ClinicalTargetHandoffAttempt {
  const contract = PCR_TERMINAL_HANDOFF_CONTEXTS.find(
    (item) =>
      item.fromProtocolId === input.fromProtocolId &&
      item.fromNodeId === input.fromNodeId &&
      item.targetModuleId === input.targetModuleId
  );

  if (!contract) {
    return {
      matched: false,
      canProceedToDestination: true,
    };
  }

  const readiness = prepareClinicalHandoffTransfer({
    contract,
    now: input.now,
  });

  return {
    matched: true,
    contract,
    readiness,
    canProceedToDestination: readiness.canProceedToDestination,
  };
}
