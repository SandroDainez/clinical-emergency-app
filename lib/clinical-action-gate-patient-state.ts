import { evaluateClinicalActionAttempt, type ClinicalActionGateDecision } from "./clinical-action-gate";
import {
  assembleClinicalGateContextFromObservations,
  INITIAL_CLINICAL_GATE_FACT_BINDINGS,
  type ClinicalGateContextAssembly,
} from "./clinical-gate-context-adapter";
import { observationDecisionPoliciesForAction } from "./clinical-observation-consumer-bindings";

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
 *
 * Janelas temporais também não são globais: somente bindings da ação/decisão
 * consumidora podem fornecer uma ObservationDecisionPolicy. Assim, o mesmo
 * dado pode ter exigências temporais diferentes em decisões diferentes sem
 * adulterar a observação original.
 */
export function evaluateClinicalActionAttemptFromPatientState(input: {
  protocolId: string;
  nodeId?: string;
  interactionKind?: "action" | "decision";
  actionId: string;
  now?: number;
}): ClinicalActionGateFromPatientState {
  const decisionPolicies = observationDecisionPoliciesForAction({
    protocolId: input.protocolId,
    nodeId: input.nodeId,
    actionId: input.actionId,
  });
  const contextAssembly = assembleClinicalGateContextFromObservations(
    INITIAL_CLINICAL_GATE_FACT_BINDINGS,
    input.now,
    decisionPolicies
  );
  const decision = evaluateClinicalActionAttempt({
    protocolId: input.protocolId,
    nodeId: input.nodeId,
    interactionKind: input.interactionKind,
    actionId: input.actionId,
    context: contextAssembly.context,
  });
  return { decision, contextAssembly };
}
