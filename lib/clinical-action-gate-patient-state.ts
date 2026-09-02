import { evaluateClinicalActionAttempt, type ClinicalActionGateDecision } from "./clinical-action-gate";
import {
  assembleClinicalGateContextFromObservations,
  INITIAL_CLINICAL_GATE_FACT_BINDINGS,
  type ClinicalGateContextAssembly,
} from "./clinical-gate-context-adapter";

export type ClinicalActionGateFromPatientState = {
  decision: ClinicalActionGateDecision;
  contextAssembly: ClinicalGateContextAssembly;
};

/**
 * Única ponte Patient State → avaliação de ação.
 *
 * A UI não precisa conhecer ids de observação nem condições de gate. Dados
 * ausentes/stale continuam explicitamente separados no assembly e nunca são
 * convertidos em respostas clínicas implícitas.
 */
export function evaluateClinicalActionAttemptFromPatientState(input: {
  protocolId: string;
  nodeId?: string;
  actionId: string;
  now?: number;
}): ClinicalActionGateFromPatientState {
  const contextAssembly = assembleClinicalGateContextFromObservations(
    INITIAL_CLINICAL_GATE_FACT_BINDINGS,
    input.now
  );
  const decision = evaluateClinicalActionAttempt({
    protocolId: input.protocolId,
    nodeId: input.nodeId,
    actionId: input.actionId,
    context: contextAssembly.context,
  });
  return { decision, contextAssembly };
}
