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

  // Reconhecimento
  if (stateId === "reconhecimento_inicial") return "Suspeita de PCR";
  if (stateId === "checar_respiracao_pulso") return "Checar respiração e pulso";
  if (stateId === "monitorizar_com_pulso") return "Pulso presente — monitorar";

  // Início da RCP
  if (stateId === "inicio") return "INICIAR RCP agora";

  // Tipo de desfibrilador — CPR em andamento enquanto decide
  if (stateId === "tipo_desfibrilador") return "Manter RCP — Tipo de desfibrilador?";

  // Preparar para ver ritmo — pausar RCP
  if (
    [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
    ].includes(stateId)
  ) {
    return "Pausar RCP — verificar ritmo";
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
    return "Qual é o ritmo?";
  }

  // Choques — ação urgente
  if (stateId === "choque_bi_1") return "Aplicar choque bifásico";
  if (stateId === "choque_mono_1") return "Aplicar choque monofásico";
  if (stateId === "choque_2") return "Aplicar 2º choque";
  if (stateId === "choque_3") return "Aplicar 3º choque";

  // CPR chocável — imperativos
  if (stateId === "rcp_1") return "RETOMAR RCP — 1º ciclo pós-choque";
  if (stateId === "rcp_2") return "RETOMAR RCP + Epinefrina agora";
  if (stateId === "rcp_3") {
    // Ciclo refratário alterna a droga: amiodarona, epinefrina ou só RCP.
    if (clinicalIntent === "give_antiarrhythmic") return "RETOMAR RCP + Antiarrítmico";
    if (clinicalIntent === "give_epinephrine") {
      const dose = (input.medications.adrenaline.administeredCount ?? 0) + 1;
      return `RETOMAR RCP + Epinefrina ${dose}ª dose`;
    }
    return "MANTER RCP — Investigar causas reversíveis";
  }

  // CPR não-chocável — imperativos
  if (stateId === "nao_chocavel_epinefrina") return "INICIAR RCP + Epinefrina 1 mg agora";
  if (stateId === "nao_chocavel_ciclo") return "MANTER RCP — Tratar causas reversíveis";
  if (stateId === "nao_chocavel_hs_ts") return "MANTER RCP — Causas reversíveis";

  // Pós-ROSC
  if (stateId === "pos_rosc") return "ROSC confirmado — Cuidados pós-parada";
  if (stateId === "pos_rosc_via_aerea") return "Via aérea e oxigenação";
  if (stateId === "pos_rosc_hemodinamica") return "Hemodinâmica — PAM ≥ 65 mmHg";
  if (stateId === "pos_rosc_ecg") return "ECG 12 derivações + imagem";
  if (stateId === "pos_rosc_neurologico") return "Avaliação neurológica e temperatura";
  if (stateId === "pos_rosc_destino") return "Destino — UTI ou referência";
  if (stateId === "pos_rosc_concluido") return "Cuidados pós-parada em andamento";
  if (stateId === "encerrado") return "Atendimento encerrado";

  // Fallback por intent
  switch (clinicalIntent) {
    case "deliver_shock":       return "Aplicar choque";
    case "give_epinephrine":    return `Epinefrina — ${(input.medications.adrenaline.administeredCount ?? 0) + 1}ª dose (1 mg IV/IO)`;
    case "give_antiarrhythmic": return "Antiarrítmico IV/IO";
    case "analyze_rhythm":      return "Analisar ritmo";
    case "perform_cpr":         return "MANTER RCP";
    case "post_rosc_care":      return "Cuidados pós-ROSC";
    case "end_protocol":        return "Encerrar caso";
    default:                    return state.text;
  }
}

// ── Banner de prioridade ──────────────────────────────────────────────────────
function getPriorityBanner(input: PresentationInput) {
  const { clinicalIntent, activeTimer, stateId } = input;

  // Reconhecimento inicial
  if (stateId === "reconhecimento_inicial") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: "Suspeita de PCR",
      detail: "Estimular · pedir ajuda · acionar emergência · solicitar desfibrilador",
    };
  }

  // Checar respiração e pulso
  if (stateId === "checar_respiracao_pulso") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: "Checar respiração e pulso",
      detail: "Máximo 10 s · dúvida = iniciar RCP · não perca tempo",
    };
  }

  // Início da RCP — urgência máxima
  if (stateId === "inicio") {
    return {
      priority: "critical_now" as AclsPriority,
      title: "INICIAR RCP agora",
      detail: "100–120/min · 5–6 cm · retorno completo · 30:2 sem via aérea avançada",
    };
  }

  // Tipo de desfibrilador — CPR em andamento
  if (stateId === "tipo_desfibrilador") {
    return {
      priority: "prepare_now" as AclsPriority,
      title: "Manter RCP — Tipo de desfibrilador?",
      detail: "RCP em andamento enquanto prepara · selecione abaixo",
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
      title: "Pausar RCP — verificar ritmo",
      detail: "Pausa < 5 s · analisar monitor · retomar imediatamente após",
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
      title: "Qual é o ritmo?",
      detail: "FV/TV = chocável · AESP/Assistolia = não chocável · pulso = ROSC",
    };
  }

  // CPR ativa — separar por ciclo para dar contexto
  if (clinicalIntent === "perform_cpr") {
    let detail = "100–120/min · 5–6 cm · retorno completo · não interromper";
    if (stateId === "rcp_1") {
      detail = "1º ciclo pós-choque · garantir acesso IV/IO · epinefrina ainda NÃO indicada";
    } else if (stateId === "rcp_2") {
      detail = "Epinefrina 1 mg IV/IO agora · repetir a cada 3–5 min";
    } else if (stateId === "rcp_3") {
      detail = "Manter RCP de alta qualidade · investigar Hs e Ts · epinefrina a cada 3–5 min";
    } else if (stateId === "nao_chocavel_epinefrina") {
      detail = "Epinefrina 1 mg IV/IO agora · acesso IV prioritário · iniciar imediatamente";
    } else if (stateId === "nao_chocavel_ciclo") {
      detail = "Investigar Hs e Ts · epinefrina a cada 3–5 min";
    } else if (stateId === "nao_chocavel_hs_ts") {
      detail = "RCP em andamento · tratar causa identificada";
    } else if (activeTimer) {
      detail = "100–120/min · 5–6 cm · 30:2 sem via aérea avançada";
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
      detail: "AFASTAR TODOS · carregar nas compressões · retomar RCP imediatamente após",
    };
  }

  // Epinefrina
  if (clinicalIntent === "give_epinephrine") {
    const epDoseNum = (input.medications.adrenaline.administeredCount ?? 0) + 1;
    return {
      priority: "due_now" as AclsPriority,
      title: `Epinefrina — ${epDoseNum}ª dose (1 mg IV/IO)`,
      detail: "Administrar agora · IV/IO em bolus · repetir a cada 3–5 min · não interromper RCP",
    };
  }

  // Antiarrítmico
  if (clinicalIntent === "give_antiarrhythmic") {
    const antCount = input.medications.antiarrhythmic.recommendedCount;
    const isRepeatDose = antCount >= 2;
    return {
      priority: "due_now" as AclsPriority,
      title: isRepeatDose ? "Antiarrítmico — 2ª dose IV/IO" : "Antiarrítmico — 1ª dose IV/IO",
      detail: isRepeatDose
        ? "Amiodarona 150 mg · ou lidocaína 0,5–0,75 mg/kg · RCP não interrompe"
        : "Amiodarona 300 mg · ou lidocaína 1–1,5 mg/kg · RCP não interrompe",
    };
  }

  // Pós-ROSC
  if (clinicalIntent === "post_rosc_care") {
    return {
      priority: "monitor" as AclsPriority,
      title: getStateTitle(input),
      detail: "PCR resolvida — seguir protocolo pós-parada estruturado",
    };
  }

  // Encerrado
  if (clinicalIntent === "end_protocol") {
    return {
      priority: "monitor" as AclsPriority,
      title: "Atendimento encerrado",
      detail: "Documentar condutas, desfecho e decisão médica",
    };
  }

  // Pulso presente
  if (stateId === "monitorizar_com_pulso") {
    return {
      priority: "monitor" as AclsPriority,
      title: "Pulso presente — monitorar",
      detail: "Reavaliar continuamente · acionar RCP imediatamente se perder pulso",
    };
  }

  // Timer ativo sem classificação específica
  if (activeTimer) {
    return {
      priority: "monitor" as AclsPriority,
      title: "Manter RCP",
      detail: "100–120/min · 5–6 cm · retorno completo · não interromper",
    };
  }

  // Fallback genérico (nunca deve aparecer em fluxo normal)
  return {
    priority: "prepare_now" as AclsPriority,
    title: getStateTitle(input),
    detail: "Confirmar e avançar.",
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
