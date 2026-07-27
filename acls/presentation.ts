import type {
  AclsClinicalIntent,
  AclsClinicalIntentConfidence,
  AclsDocumentationAction,
  AclsPresentation,
  AclsPriority,
  AclsMedicationTracker,
} from "./domain";
import type { AclsProtocolState } from "./protocol-schema";
import { getSpeechText } from "./speech-map";
import { tr, formatOrdinal } from "./locales";
import { getActiveLocale } from "../lib/locale";

type PresentationInput = {
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

// ── Títulos por estado ────────────────────────────────────────────────────────
function getStateTitle(input: PresentationInput): string {
  const { stateId, clinicalIntent, state } = input;

  const loc = getActiveLocale();

  // Reconhecimento
  if (stateId === "reconhecimento_inicial") return tr("Suspeita de PCR");
  if (stateId === "checar_respiracao_pulso") return tr("Checar respiração e pulso");
  if (stateId === "monitorizar_com_pulso") return tr("Pulso presente — monitorar");

  // Início da RCP
  if (stateId === "inicio") return tr("INICIAR RCP agora");

  // Tipo de desfibrilador — CPR em andamento enquanto decide
  if (stateId === "tipo_desfibrilador") return tr("Manter RCP — Tipo de desfibrilador?");

  // Preparar para ver ritmo — pausar RCP
  if (
    [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
    ].includes(stateId)
  ) {
    return tr("Pausar RCP — verificar ritmo");
  }

  // Decisão de ritmo
  if (
    [
      "avaliar_ritmo",
      "avaliar_ritmo_2",
      "avaliar_ritmo_3",
      "avaliar_ritmo_nao_chocavel",
    ].includes(stateId)
  ) {
    return tr("Qual é o ritmo?");
  }

  // Choques — ação urgente
  if (stateId === "choque_bi_1") return tr("Aplicar choque bifásico");
  if (stateId === "choque_mono_1") return tr("Aplicar choque monofásico");
  if (stateId === "choque_2") return tr("Aplicar 2º choque");
  if (stateId === "choque_3") return tr("Aplicar 3º choque");

  // CPR chocável — imperativos
  if (stateId === "rcp_1") return tr("RETOMAR RCP — 1º ciclo pós-choque");
  if (stateId === "rcp_2") return tr("RETOMAR RCP + Epinefrina agora");
  if (stateId === "rcp_3") {
    // Ciclo refratário alterna a droga: amiodarona, epinefrina ou só RCP.
    if (clinicalIntent === "give_antiarrhythmic") return tr("RETOMAR RCP + Antiarrítmico");
    if (clinicalIntent === "give_epinephrine") {
      const dose = (input.medications.adrenaline.administeredCount ?? 0) + 1;
      return `${tr("RETOMAR RCP + Epinefrina")} ${formatOrdinal(dose, loc)} ${tr("dose")}`;
    }
    return tr("MANTER RCP — Investigar causas reversíveis");
  }

  // CPR não-chocável — imperativos
  if (stateId === "nao_chocavel_epinefrina") return tr("INICIAR RCP + Epinefrina 1 mg agora");
  if (stateId === "nao_chocavel_ciclo") return tr("MANTER RCP — Tratar causas reversíveis");
  if (stateId === "nao_chocavel_hs_ts") return tr("MANTER RCP — Causas reversíveis");

  // Pós-ROSC
  if (stateId === "pos_rosc") return tr("ROSC confirmado — Cuidados pós-parada");
  if (stateId === "pos_rosc_via_aerea") return tr("Via aérea e oxigenação");
  if (stateId === "pos_rosc_hemodinamica") return tr("Hemodinâmica — PAM ≥ 65 mmHg");
  if (stateId === "pos_rosc_ecg") return tr("ECG 12 derivações + imagem");
  if (stateId === "pos_rosc_neurologico") return tr("Avaliação neurológica e temperatura");
  if (stateId === "pos_rosc_destino") return tr("Destino — UTI ou referência");
  if (stateId === "pos_rosc_concluido") return tr("Cuidados pós-parada em andamento");
  if (stateId === "encerrado") return tr("Atendimento encerrado");

  // Fallback por intent
  switch (clinicalIntent) {
    case "deliver_shock":       return tr("Aplicar choque");
    case "give_epinephrine":    return `${tr("Epinefrina —")} ${formatOrdinal((input.medications.adrenaline.administeredCount ?? 0) + 1, loc)} ${tr("dose (1 mg IV/IO)")}`;
    case "give_antiarrhythmic": return tr("Antiarrítmico IV/IO");
    case "analyze_rhythm":      return tr("Analisar ritmo");
    case "perform_cpr":         return tr("MANTER RCP");
    case "post_rosc_care":      return tr("Cuidados pós-ROSC");
    case "end_protocol":        return tr("Encerrar caso");
    default:                    return tr(state.text);
  }
}

// ── Banner de prioridade ──────────────────────────────────────────────────────
function getPriorityBanner(input: PresentationInput) {
  const { clinicalIntent, activeTimer, stateId } = input;

  // Reconhecimento inicial
  if (stateId === "reconhecimento_inicial") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: tr("Suspeita de PCR"),
      detail: tr("Estimular · pedir ajuda · acionar emergência · solicitar desfibrilador"),
    };
  }

  // Checar respiração e pulso
  if (stateId === "checar_respiracao_pulso") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: tr("Checar respiração e pulso"),
      detail: tr("Máximo 10 s · dúvida = iniciar RCP · não perca tempo"),
    };
  }

  // Início da RCP — urgência máxima
  if (stateId === "inicio") {
    return {
      priority: "critical_now" as AclsPriority,
      title: tr("INICIAR RCP agora"),
      detail: tr("100–120/min · 5–6 cm · retorno completo · 30:2 sem via aérea avançada"),
    };
  }

  // Tipo de desfibrilador — CPR em andamento
  if (stateId === "tipo_desfibrilador") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: tr("Manter RCP — Tipo de desfibrilador?"),
      detail: tr("RCP em andamento enquanto prepara · selecione abaixo"),
    };
  }

  // Preparar para ver ritmo — pausar RCP
  if (
    [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
    ].includes(stateId)
  ) {
    return {
      priority: "reassess" as AclsPriority,
      title: tr("Pausar RCP — verificar ritmo"),
      detail: tr("Pausa mínima < 10 s · analisar monitor · retomar imediatamente após"),
    };
  }

  // Decisão de ritmo
  if (
    [
      "avaliar_ritmo",
      "avaliar_ritmo_2",
      "avaliar_ritmo_3",
      "avaliar_ritmo_nao_chocavel",
    ].includes(stateId)
  ) {
    return {
      priority: "reassess" as AclsPriority,
      title: tr("Qual é o ritmo?"),
      detail: tr("FV/TV = chocável · AESP/Assistolia = não chocável · pulso = ROSC"),
    };
  }

  // CPR ativa — separar por ciclo para dar contexto
  if (clinicalIntent === "perform_cpr") {
    let detail = tr("100–120/min · 5–6 cm · retorno completo · não interromper");
    if (stateId === "rcp_1") {
      detail = tr("1º ciclo pós-choque · garantir acesso IV/IO · epinefrina ainda NÃO indicada");
    } else if (stateId === "rcp_2") {
      detail = tr("Epinefrina 1 mg IV/IO agora · repetir a cada 3–5 min");
    } else if (stateId === "rcp_3") {
      detail = tr("Manter RCP de alta qualidade · investigar Hs e Ts · epinefrina a cada 3–5 min");
    } else if (stateId === "nao_chocavel_epinefrina") {
      detail = tr("Epinefrina 1 mg IV/IO agora · acesso IV prioritário · iniciar imediatamente");
    } else if (stateId === "nao_chocavel_ciclo") {
      detail = tr("Investigar Hs e Ts · epinefrina a cada 3–5 min");
    } else if (stateId === "nao_chocavel_hs_ts") {
      detail = tr("RCP em andamento · tratar causa identificada");
    } else if (activeTimer) {
      detail = tr("100–120/min · 5–6 cm · 30:2 sem via aérea avançada");
    }
    return {
      priority: "monitor" as AclsPriority,
      title: getStateTitle(input),
      detail,
    };
  }

  // Choque
  if (clinicalIntent === "deliver_shock") {
    return {
      priority: "critical_now" as AclsPriority,
      title: getStateTitle(input),
      detail: tr("AFASTAR TODOS · carregar nas compressões · retomar RCP imediatamente após"),
    };
  }

  // Epinefrina
  if (clinicalIntent === "give_epinephrine") {
    const epDoseNum = (input.medications.adrenaline.administeredCount ?? 0) + 1;
    return {
      priority: "due_now" as AclsPriority,
      title: `${tr("Epinefrina —")} ${formatOrdinal(epDoseNum, getActiveLocale())} ${tr("dose (1 mg IV/IO)")}`,
      detail: tr("Administrar agora · IV/IO em bolus · repetir a cada 3–5 min · não interromper RCP"),
    };
  }

  // Antiarrítmico
  if (clinicalIntent === "give_antiarrhythmic") {
    const antCount = input.medications.antiarrhythmic.recommendedCount;
    const isRepeatDose = antCount >= 2;
    return {
      priority: "due_now" as AclsPriority,
      title: isRepeatDose ? tr("Antiarrítmico — 2ª dose IV/IO") : tr("Antiarrítmico — 1ª dose IV/IO"),
      detail: isRepeatDose
        ? tr("Amiodarona 150 mg · ou lidocaína 0,5–0,75 mg/kg · RCP não interrompe")
        : tr("Amiodarona 300 mg · ou lidocaína 1–1,5 mg/kg · RCP não interrompe"),
    };
  }

  // Pós-ROSC
  if (clinicalIntent === "post_rosc_care") {
    return {
      priority: "monitor" as AclsPriority,
      title: getStateTitle(input),
      detail: tr("PCR resolvida — seguir o guia pós-parada estruturado"),
    };
  }

  // Encerrado
  if (clinicalIntent === "end_protocol") {
    return {
      priority: "monitor" as AclsPriority,
      title: tr("Atendimento encerrado"),
      detail: tr("Documentar condutas, desfecho e decisão médica"),
    };
  }

  // Pulso presente
  if (stateId === "monitorizar_com_pulso") {
    return {
      priority: "monitor" as AclsPriority,
      title: tr("Pulso presente — monitorar"),
      detail: tr("Reavaliar continuamente · acionar RCP imediatamente se perder pulso"),
    };
  }

  // Timer ativo sem classificação específica
  if (activeTimer) {
    return {
      priority: "monitor" as AclsPriority,
      title: tr("Manter RCP"),
      detail: tr("100–120/min · 5–6 cm · retorno completo · não interromper"),
    };
  }

  // Fallback genérico (nunca deve aparecer em fluxo normal)
  return {
    priority: "prepare_now" as AclsPriority,
    title: getStateTitle(input),
    detail: tr("Confirmar e avançar."),
  };
}

// ── Detalhes filtrados por intent ─────────────────────────────────────────────
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
        (d) => /choque|desfibrila|retomar rcp|não verificar pulso|afastar|carga/i.test(d)
      );
    case "give_epinephrine":
      return details.filter(
        (d) => /epinefrina|compress|ventila|via aérea|causas reversíveis|iv|io/i.test(d)
      );
    case "give_antiarrhythmic":
      return details.filter(
        (d) => /antiarr|amiodarona|lidocaína|epinefrina|causas reversíveis/i.test(d)
      );
    case "analyze_rhythm":
      return details.filter(
        (d) => /ritmo|pulso|chocável|não chocável|rosc|pausar/i.test(d)
      );
    case "perform_cpr":
      return details.filter(
        (d) => /compress|ventila|via aérea|causas reversíveis|rcp|iv|io|retomar|manter/i.test(d)
      );
    default:
      return details;
  }
}

// ── Speech key ────────────────────────────────────────────────────────────────
function getIntentSpeechKey(input: PresentationInput) {
  const { clinicalIntent, stateId } = input;
  const adrenalineDueNow =
    input.medications.adrenaline.pendingConfirmation &&
    (input.medications.adrenaline.status === "due_now" ||
      input.medications.adrenaline.status === "pending_confirmation");

  if (stateId === "reconhecimento_inicial") return "initial_recognition";
  if (stateId === "checar_respiracao_pulso") return "assess_patient";
  if (stateId === "monitorizar_com_pulso") return "pulse_present_monitoring";
  if (stateId === "inicio") return "start_cpr";
  if (stateId === "tipo_desfibrilador") return "defibrillator_type";

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

  if (stateId === "choque_bi_1") return "shock_biphasic_initial";
  if (stateId === "choque_mono_1") return "shock_monophasic_initial";
  if (["choque_2", "choque_3"].includes(stateId)) return "shock_escalated";

  if (["nao_chocavel_epinefrina", "nao_chocavel_ciclo"].includes(stateId)) {
    return adrenalineDueNow ? "epinephrine_now" : "start_cpr";
  }

  if (stateId === "nao_chocavel_hs_ts") return "review_hs_ts";
  if (stateId === "pos_rosc") return "confirm_rosc";
  if (stateId === "pos_rosc_via_aerea") return "consider_airway";
  if (stateId === "pos_rosc_hemodinamica") return "post_rosc_hemodynamics";
  if (stateId === "pos_rosc_ecg") return "post_rosc_ecg";
  if (stateId === "pos_rosc_neurologico") return "post_rosc_neuro";
  if (stateId === "pos_rosc_destino" || stateId === "pos_rosc_concluido") return "post_rosc_care";
  if (stateId === "encerrado") return "end_protocol";

  switch (clinicalIntent) {
    case "perform_cpr":         return "resume_cpr";
    case "analyze_rhythm":      return "analyze_rhythm";
    case "give_epinephrine":    return "epinephrine_now";
    case "give_antiarrhythmic": return "antiarrhythmic_now";
    default:                    return undefined;
  }
}

// ── Derivar apresentação ──────────────────────────────────────────────────────
function deriveAclsPresentation(input: PresentationInput): AclsPresentation {
  const speechKey = getIntentSpeechKey(input);
  const instruction = getStateTitle(input);
  const speak = speechKey
    ? getSpeechText(speechKey, input.state.speak ?? instruction)
    : input.state.speak ?? instruction;
  const details = getIntentDetails(input);
  const banner = getPriorityBanner(input);

  return {
    clinicalIntent: input.clinicalIntent,
    clinicalIntentConfidence: input.clinicalIntentConfidence,
    title: instruction,
    instruction,
    speak,
    cueId: speechKey ?? input.cueId,
    banner,
    details: toConciseDetails(details),
    conciseDetails: toConciseDetails(details),
  };
}

export { deriveAclsPresentation };
