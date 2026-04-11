import { ACLS_COPY } from "./microcopy";

const ACLS_AUDIO_EVENT_MAP = {
  // Orientações de estado — curtas, diretivas, como um coordenador clínico.
  initial_recognition: "Checar resposta. Pedir ajuda. Acionar emergência.",
  assess_patient: "Checar pulso e respiração. Até dez segundos.",
  pulse_present_monitoring: "Pulso presente. Monitorar.",
  start_cpr: "Iniciar RCP. Cento a cento e vinte por minuto. Trinta e dois.",
  resume_cpr: "Retomar RCP. Dois minutos.",
  start_cpr_nonshockable: "RCP. Não chocável. Epinefrina agora.",
  prepare_rhythm: "Pausar RCP. Avaliar ritmo.",
  prepare_shock: "Carregar desfibrilador. Afastar todos.",
  prepare_epinephrine: "Preparar epinefrina 1 mg.",
  analyze_rhythm: "Ritmo? Chocável ou não chocável?",
  defibrillator_type: "Bifásico ou monofásico?",
  // Eventos de choque
  shock_biphasic_initial: "Chocável. Bifásico, duzentos joules. Afastar. Aplicar choque.",
  shock_monophasic_initial: "Chocável. Monofásico, trezentos e sessenta joules. Afastar. Aplicar choque.",
  shock_escalated: "Novo choque. Carga máxima. Afastar. Aplicar choque.",
  // Eventos de medicação
  epinephrine_now: "Epinefrina 1 mg. Agora.",
  epinephrine_repeat: "Repetir epinefrina 1 mg.",
  antiarrhythmic_now: "Antiarrítmico. Amiodarona 300 mg ou lidocaína.",
  antiarrhythmic_repeat: "Repetir antiarrítmico. Meia dose.",
  // Pós-parada e desfecho
  consider_airway: "Via aérea avançada. Avaliar necessidade.",
  review_hs_ts: "Revisar Hs e Ts.",
  confirm_rosc: "ROSC! Confirmar pulso. Cuidados pós-parada.",
  post_rosc_care: "Cuidados pós-parada.",
  post_rosc_hemodynamics: "Hemodinâmica. Volume e vasopressores.",
  post_rosc_ecg: "ECG de doze derivações.",
  post_rosc_neuro: "Avaliação neurológica.",
  end_protocol: ACLS_COPY.operational.actions.end,
} as const;

const SPEECH_MAP = ACLS_AUDIO_EVENT_MAP;

type SpeechMapKey = keyof typeof SPEECH_MAP;
type ClinicalSpeechPriority = "critical" | "normal";
type ClinicalSpeakPriority = "critical" | "main" | "precue" | "secondary";
type SpeechInterruptPolicy = "always" | "if_lower_priority" | "never";
type SpeechIntensity = "low" | "medium" | "high";

function resolveSpeechKey(key: string): SpeechMapKey | string {
  if (
    [
      "reconhecimento_inicial",
      "initial_recognition",
    ].includes(key)
  ) {
    return "initial_recognition";
  }

  if (
    [
      "checar_respiracao_pulso",
      "assess_patient",
    ].includes(key)
  ) {
    return "assess_patient";
  }

  if (
    [
      "monitorizar_com_pulso",
      "pulse_present_monitoring",
    ].includes(key)
  ) {
    return "pulse_present_monitoring";
  }

  if (["inicio", "start_cpr"].includes(key)) {
    return "start_cpr";
  }

  if (["rcp_1", "rcp_3", "resume_cpr"].includes(key)) {
    return "resume_cpr";
  }

  if (
    [
      "nao_chocavel_epinefrina",
      "nao_chocavel_ciclo",
      "start_cpr_nonshockable",
    ].includes(key)
  ) {
    return "start_cpr_nonshockable";
  }

  if (
    [
      "avaliar_ritmo_preparo",
      "avaliar_ritmo_2_preparo",
      "avaliar_ritmo_3_preparo",
      "avaliar_ritmo_nao_chocavel_preparo",
      "prepare_rhythm",
    ].includes(key)
  ) {
    return "prepare_rhythm";
  }

  if (
    [
      "prepare_shock",
    ].includes(key)
  ) {
    return "prepare_shock";
  }

  if (
    [
      "prepare_epinephrine",
    ].includes(key)
  ) {
    return "prepare_epinephrine";
  }

  if (
    [
      "avaliar_ritmo",
      "avaliar_ritmo_2",
      "avaliar_ritmo_3",
      "avaliar_ritmo_nao_chocavel",
      "reminder_reavaliar_ritmo",
      "analyze_rhythm",
    ].includes(key)
  ) {
    return "analyze_rhythm";
  }

  if (
    [
      "tipo_desfibrilador",
      "defibrillator_type",
    ].includes(key)
  ) {
    return "defibrillator_type";
  }

  if (
    [
      "choque_bi_1",
      "shock_biphasic_initial",
    ].includes(key)
  ) {
    return "shock_biphasic_initial";
  }

  if (
    [
      "choque_mono_1",
      "shock_monophasic_initial",
    ].includes(key)
  ) {
    return "shock_monophasic_initial";
  }

  if (
    [
      "choque_bi_1",
      "choque_mono_1",
      "choque_2",
      "choque_2_bifasico",
      "choque_2_monofasico",
      "choque_3",
      "choque_3_bifasico",
      "choque_3_monofasico",
      "shock",
      "shock_escalated",
    ].includes(key)
  ) {
    return "shock_escalated";
  }

  if (["reminder_epinefrina", "epinephrine_now"].includes(key)) {
    return "epinephrine_now";
  }

  if (["epinephrine_repeat"].includes(key)) {
    return "epinephrine_repeat";
  }

  if (["reminder_antiarritmico", "reminder_antiarritmico_1", "antiarrhythmic_now"].includes(key)) {
    return "antiarrhythmic_now";
  }

  if (["reminder_antiarritmico_2", "antiarrhythmic_repeat"].includes(key)) {
    return "antiarrhythmic_repeat";
  }

  if (["pos_rosc", "confirm_rosc"].includes(key)) {
    return "confirm_rosc";
  }

  if (["pos_rosc_via_aerea", "consider_airway"].includes(key)) {
    return "consider_airway";
  }

  if (["nao_chocavel_hs_ts", "review_hs_ts"].includes(key)) {
    return "review_hs_ts";
  }

  if (["post_rosc_care"].includes(key)) {
    return "post_rosc_care";
  }

  if (["pos_rosc_hemodinamica", "post_rosc_hemodynamics"].includes(key)) {
    return "post_rosc_hemodynamics";
  }

  if (["pos_rosc_ecg", "post_rosc_ecg"].includes(key)) {
    return "post_rosc_ecg";
  }

  if (["pos_rosc_neurologico", "post_rosc_neuro"].includes(key)) {
    return "post_rosc_neuro";
  }

  if (["encerrado", "end_protocol"].includes(key)) {
    return "end_protocol";
  }

  return key;
}

function getSpeechText(key: string, fallback?: string) {
  const resolvedKey = resolveSpeechKey(key);
  return SPEECH_MAP[resolvedKey as SpeechMapKey] ?? fallback ?? resolvedKey;
}

function isPreCueKey(key: string) {
  const resolvedKey = resolveSpeechKey(key);
  return ["prepare_rhythm", "prepare_shock", "prepare_epinephrine"].includes(resolvedKey);
}

function getClinicalSpeakPriority(key: string): ClinicalSpeakPriority {
  const resolvedKey = resolveSpeechKey(key);

  if (
    [
      "analyze_rhythm",
      "shock_biphasic_initial",
      "shock_monophasic_initial",
      "shock_escalated",
      "confirm_rosc",
    ].includes(resolvedKey)
  ) {
    return "critical";
  }

  if (
    [
      "start_cpr",
      "start_cpr_nonshockable",
      "epinephrine_now",
      "antiarrhythmic_now",
    ].includes(resolvedKey)
  ) {
    return "main";
  }

  if (["prepare_rhythm", "prepare_shock", "prepare_epinephrine"].includes(resolvedKey)) {
    return "precue";
  }

  return "secondary";
}

function getSpeechPriority(key: string): ClinicalSpeechPriority {
  return getClinicalSpeakPriority(key) === "critical" ? "critical" : "normal";
}

function getSpeechInterruptPolicy(key: string, message?: string): SpeechInterruptPolicy {
  const resolvedKey = resolveSpeechKey(key);
  const normalizedMessage = (message ?? "").trim().toLowerCase();

  if (
    normalizedMessage.startsWith("confirmar") ||
    normalizedMessage.startsWith("baixa confiança no comando")
  ) {
    return "never";
  }

  if (isPreCueKey(resolvedKey)) {
    return "if_lower_priority";
  }

  if (
    [
      "shock_biphasic_initial",
      "shock_monophasic_initial",
      "shock_escalated",
      "analyze_rhythm",
      "confirm_rosc",
    ].includes(resolvedKey)
  ) {
    return "always";
  }

  return "never";
}

function getSpeechIntensity(key: string): SpeechIntensity {
  const resolvedKey = resolveSpeechKey(key);

  if (resolvedKey === "start_cpr" || resolvedKey === "start_cpr_nonshockable") {
    return "low";
  }

  if (resolvedKey === "analyze_rhythm" || resolvedKey === "prepare_rhythm") {
    return "medium";
  }

  if (resolvedKey === "prepare_epinephrine") {
    return "medium";
  }

  if (
    [
      "shock_biphasic_initial",
      "shock_monophasic_initial",
      "shock_escalated",
      "prepare_shock",
      "epinephrine_now",
      "epinephrine_repeat",
      "confirm_rosc",
    ].includes(resolvedKey)
  ) {
    return "high";
  }

  return "medium";
}

export type { ClinicalSpeakPriority, SpeechIntensity, SpeechInterruptPolicy, SpeechMapKey };
export {
  ACLS_AUDIO_EVENT_MAP,
  getClinicalSpeakPriority,
  SPEECH_MAP,
  getSpeechIntensity,
  getSpeechInterruptPolicy,
  getSpeechPriority,
  getSpeechText,
  isPreCueKey,
  resolveSpeechKey,
};
