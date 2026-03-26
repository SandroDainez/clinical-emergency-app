import type {
  AclsClinicalIntent,
  AclsClinicalIntentConfidence,
  AclsDocumentationAction,
  AclsMode,
  AclsPresentation,
  AclsPriority,
  AclsMedicationTracker,
} from "./domain";
import type { AclsProtocolState } from "./protocol-schema";
import { getSpeechText } from "./speech-map";

type PresentationInput = {
  mode: AclsMode;
  clinicalIntent: AclsClinicalIntent;
  clinicalIntentConfidence: AclsClinicalIntentConfidence;
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

function getIntentTitle(clinicalIntent: AclsClinicalIntent, fallback: string) {
  switch (clinicalIntent) {
    case "deliver_shock":
      return "Aplicar choque";
    case "give_epinephrine":
      return "Dar epinefrina";
    case "give_antiarrhythmic":
      return "Dar antiarrítmico";
    case "analyze_rhythm":
      return "Ver ritmo";
    case "perform_cpr":
      return "Manter RCP";
    case "post_rosc_care":
      return "Cuidar ROSC";
    case "end_protocol":
      return "Encerrar caso";
    default:
      return fallback;
  }
}

function getPriorityBanner(input: PresentationInput) {
  const { clinicalIntent, activeTimer } = input;

  if (clinicalIntent === "perform_cpr") {
    return {
      priority: "monitor" as AclsPriority,
      title: "Manter RCP",
      detail: activeTimer
        ? "Comprimir até ritmo."
        : "Comprimir sem pausa.",
    };
  }

  if (clinicalIntent === "deliver_shock") {
    return {
      priority: "critical_now" as AclsPriority,
      title: "Aplicar choque",
      detail: "Chocar e retomar.",
    };
  }

  if (clinicalIntent === "give_epinephrine") {
    return {
      priority: "due_now" as AclsPriority,
      title: "Dar epinefrina",
      detail: "Dar 1 mg.",
    };
  }

  if (clinicalIntent === "give_antiarrhythmic") {
    return {
      priority: "due_now" as AclsPriority,
      title: "Dar antiarrítmico",
      detail: "Dar antiarrítmico.",
    };
  }

  if (clinicalIntent === "analyze_rhythm") {
    return {
      priority: "reassess" as AclsPriority,
      title: "Ver ritmo",
      detail: "Pausar e decidir.",
    };
  }

  if (activeTimer) {
    return {
      priority: "monitor" as AclsPriority,
      title: "Manter fase",
      detail: "Manter até mudar.",
    };
  }

  return {
    priority: "prepare_now" as AclsPriority,
    title: "Próxima ação",
    detail: "Agir agora.",
  };
}

function toConciseDetails(details: string[]) {
  return details.slice(0, 3);
}

function getIntentDetails(input: PresentationInput) {
  const details = input.state.details ?? [];

  switch (input.clinicalIntent) {
    case "deliver_shock":
      return details.filter(
        (detail) =>
          /choque|desfibrila|retomar rcp|não verificar pulso/i.test(detail)
      );
    case "give_epinephrine":
      return details.filter(
        (detail) =>
          /epinefrina|compress|ventila|via aérea|causas reversíveis/i.test(detail)
      );
    case "give_antiarrhythmic":
      return details.filter(
        (detail) =>
          /antiarr|amiodarona|lidocaína|epinefrina|causas reversíveis/i.test(detail)
      );
    case "analyze_rhythm":
      return details.filter(
        (detail) =>
          /ritmo|pulso|chocável|não chocável|rosc/i.test(detail)
      );
    case "perform_cpr":
      return details.filter(
        (detail) =>
          /compress|ventila|via aérea|causas reversíveis/i.test(detail)
      );
    default:
      return details;
  }
}

function getIntentSpeechKey(clinicalIntent: AclsClinicalIntent) {
  switch (clinicalIntent) {
    case "perform_cpr":
      return "start_cpr";
    case "deliver_shock":
      return "shock";
    case "analyze_rhythm":
      return "analyze_rhythm";
    case "give_epinephrine":
      return "epinephrine_now";
    case "give_antiarrhythmic":
      return "antiarrhythmic_now";
    default:
      return undefined;
  }
}

function deriveAclsPresentation(input: PresentationInput): AclsPresentation {
  const speechKey = getIntentSpeechKey(input.clinicalIntent);
  const instruction = getIntentTitle(input.clinicalIntent, input.state.text);
  const speak = speechKey ? getSpeechText(speechKey, input.state.speak ?? instruction) : input.state.speak ?? instruction;
  const details = getIntentDetails(input);
  const banner = getPriorityBanner(input);

  return {
    mode: input.mode,
    clinicalIntent: input.clinicalIntent,
    clinicalIntentConfidence: input.clinicalIntentConfidence,
    title: instruction,
    instruction,
    speak,
    cueId: speechKey ?? input.cueId,
    banner,
    details: input.mode === "code" ? toConciseDetails(details) : details,
    conciseDetails: toConciseDetails(details),
  };
}

export { deriveAclsPresentation };
