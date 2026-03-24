import type {
  AclsDocumentationAction,
  AclsMode,
  AclsPresentation,
  AclsPriority,
  AclsMedicationTracker,
} from "./domain";
import type { AclsProtocolState } from "./protocol-schema";

type PresentationInput = {
  mode: AclsMode;
  stateId: string;
  state: AclsProtocolState;
  cueId?: string;
  documentationActions: AclsDocumentationAction[];
  activeTimer?: {
    duration: number;
    remaining: number;
  };
  medications: Record<"adrenaline" | "antiarrhythmic", AclsMedicationTracker>;
};

function getPriorityBanner(input: PresentationInput) {
  const { stateId, documentationActions, activeTimer } = input;

  if (stateId.startsWith("choque_")) {
    return {
      priority: "critical_now" as AclsPriority,
      title: "Choque Agora",
      detail: "Aplicar desfibrilação e retomar RCP imediatamente.",
    };
  }

  if (documentationActions.some((action) => action.id === "adrenaline")) {
    return {
      priority: "due_now" as AclsPriority,
      title: "Epinefrina Agora",
      detail: "Administrar epinefrina 1 mg IV/IO no ponto atual do algoritmo.",
    };
  }

  if (documentationActions.some((action) => action.id === "antiarrhythmic")) {
    return {
      priority: "due_now" as AclsPriority,
      title: "Antiarrítmico Agora",
      detail: "Administrar amiodarona ou lidocaína para FV/TV sem pulso refratária.",
    };
  }

  if (stateId.startsWith("avaliar_ritmo")) {
    return {
      priority: "reassess" as AclsPriority,
      title: "Reavaliar Ritmo",
      detail: "Analisar ritmo com pausa mínima e decidir o próximo ramo do algoritmo.",
    };
  }

  if (activeTimer) {
    return {
      priority: "monitor" as AclsPriority,
      title: "Ciclo Em Andamento",
      detail: "Manter a conduta atual até a próxima reavaliação de ritmo.",
    };
  }

  return {
    priority: "prepare_now" as AclsPriority,
    title: "Próxima Conduta",
    detail: "Siga a etapa atual do protocolo e confirme a conduta assim que executada.",
  };
}

function toConciseDetails(details: string[]) {
  return details.slice(0, 3);
}

function deriveAclsPresentation(input: PresentationInput): AclsPresentation {
  const instruction = input.state.text;
  const speak = input.state.speak ?? instruction;
  const details = input.state.details ?? [];
  const banner = getPriorityBanner(input);

  return {
    mode: input.mode,
    title: instruction,
    instruction,
    speak,
    cueId: input.cueId,
    banner,
    details: input.mode === "code" ? toConciseDetails(details) : details,
    conciseDetails: toConciseDetails(details),
  };
}

export { deriveAclsPresentation };
