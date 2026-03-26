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

function getStateTitle(input: PresentationInput) {
  if (input.stateId === "reconhecimento_inicial") {
    return "Suspeita de PCR";
  }

  if (input.stateId === "checar_respiracao_pulso") {
    return "Checar respiração e pulso";
  }

  if (
    [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
    ].includes(input.stateId)
  ) {
    return "Preparar para ver ritmo";
  }

  return getIntentTitle(input.clinicalIntent, input.state.text);
}

function getPriorityBanner(input: PresentationInput) {
  const { clinicalIntent, activeTimer } = input;

  if (input.stateId === "reconhecimento_inicial") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: "Suspeita de PCR",
      detail: "Avaliar responsividade.",
    };
  }

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
    const isRhythmPrepareState = [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
    ].includes(input.stateId);

    return {
      priority: "reassess" as AclsPriority,
      title: isRhythmPrepareState ? "Preparar para ver ritmo" : "Ver ritmo",
      detail: isRhythmPrepareState ? "Monitor / desfibrilador." : "Pausar e decidir.",
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
  if (input.stateId === "reconhecimento_inicial") {
    return [
      "Na suspeita de PCR, avaliar responsividade.",
      "Chamar ajuda e acionar emergência.",
      "Solicitar desfibrilador ou DEA.",
    ];
  }

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

function getIntentSpeechKey(input: PresentationInput) {
  const { clinicalIntent, stateId } = input;

  if (stateId === "reconhecimento_inicial") {
    return "initial_recognition";
  }

  if (stateId === "checar_respiracao_pulso") {
    return "assess_patient";
  }

  if (stateId === "monitorizar_com_pulso") {
    return "pulse_present_monitoring";
  }

  if (stateId === "tipo_desfibrilador") {
    return "defibrillator_type";
  }

  if (
    [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
    ].includes(stateId)
  ) {
    return "prepare_rhythm";
  }

  if (stateId === "choque_bi_1") {
    return "shock_biphasic_initial";
  }

  if (stateId === "choque_mono_1") {
    return "shock_monophasic_initial";
  }

  if (["choque_2", "choque_3"].includes(stateId)) {
    return "shock_escalated";
  }

  if (["nao_chocavel_epinefrina", "nao_chocavel_ciclo"].includes(stateId)) {
    return "start_cpr_nonshockable";
  }

  if (stateId === "nao_chocavel_hs_ts") {
    return "review_hs_ts";
  }

  if (stateId === "pos_rosc") {
    return "confirm_rosc";
  }

  if (stateId === "pos_rosc_via_aerea") {
    return "consider_airway";
  }

  if (stateId === "pos_rosc_hemodinamica") {
    return "post_rosc_hemodynamics";
  }

  if (stateId === "pos_rosc_ecg") {
    return "post_rosc_ecg";
  }

  if (stateId === "pos_rosc_neurologico") {
    return "post_rosc_neuro";
  }

  if (stateId === "pos_rosc_destino" || stateId === "pos_rosc_concluido") {
    return "post_rosc_care";
  }

  if (stateId === "encerrado") {
    return "end_protocol";
  }

  switch (clinicalIntent) {
    case "perform_cpr":
      return "start_cpr";
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
  const speechKey = getIntentSpeechKey(input);
  const instruction = getStateTitle(input);
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
