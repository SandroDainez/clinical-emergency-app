import { ACLS_COPY } from "./microcopy";

const SPEECH_MAP = {
  assess_patient: "Checar respiração e pulso",
  start_cpr: "Iniciar reanimação cardiopulmonar",
  start_cpr_nonshockable: "Manter reanimação e dar epinefrina",
  prepare_rhythm: "Preparar para ver ritmo",
  prepare_shock: "Preparar choque",
  prepare_epinephrine: "Preparar epinefrina",
  analyze_rhythm: "Verificar ritmo",
  defibrillator_type: "Escolher tipo de desfibrilador",
  shock_biphasic_initial: "Aplicar choque bifásico de duzentos joules ou carga máxima",
  shock_monophasic_initial: "Aplicar choque monofásico de trezentos e sessenta joules",
  shock_escalated: "Aplicar novo choque com carga maior ou máxima",
  epinephrine_now: "Dar epinefrina, um miligrama",
  epinephrine_repeat: "Repetir epinefrina, um miligrama",
  antiarrhythmic_now:
    "Dar antiarrítmico. Amiodarona, trezentos miligramas, ou lidocaína, um a um vírgula cinco miligrama por quilo",
  antiarrhythmic_repeat: "Repetir antiarrítmico com metade da dose anterior",
  consider_airway: "Considerar via aérea avançada",
  review_hs_ts: "Rever causas reversíveis, os Hs e Ts",
  confirm_rosc: "Confirmar retorno da circulação espontânea",
  post_rosc_care: "Iniciar cuidados pós parada",
  post_rosc_hemodynamics: "Ajustar hemodinâmica com volume e drogas vasoativas",
  post_rosc_ecg: "Realizar eletrocardiograma",
  post_rosc_neuro: "Avaliar estado neurológico",
  end_protocol: ACLS_COPY.operational.actions.end,
} as const;

type SpeechMapKey = keyof typeof SPEECH_MAP;
type ClinicalSpeechPriority = "critical" | "normal";
type SpeechInterruptPolicy = "always" | "if_lower_priority" | "never";
type SpeechIntensity = "low" | "medium" | "high";

function resolveSpeechKey(key: string): SpeechMapKey | string {
  if (
    [
      "reconhecimento_inicial",
      "checar_respiracao_pulso",
      "assess_patient",
    ].includes(key)
  ) {
    return "assess_patient";
  }

  if (
    [
      "inicio",
      "start_cpr",
    ].includes(key)
  ) {
    return "start_cpr";
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

function getSpeechPriority(key: string): ClinicalSpeechPriority {
  const resolvedKey = resolveSpeechKey(key);

  if (
    [
      "start_cpr",
      "start_cpr_nonshockable",
      "analyze_rhythm",
      "shock_biphasic_initial",
      "shock_monophasic_initial",
      "shock_escalated",
      "epinephrine_now",
      "epinephrine_repeat",
      "confirm_rosc",
    ].includes(
      resolvedKey
    )
  ) {
    return "critical";
  }

  return "normal";
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

export type { SpeechIntensity, SpeechInterruptPolicy, SpeechMapKey };
export {
  SPEECH_MAP,
  getSpeechIntensity,
  getSpeechInterruptPolicy,
  getSpeechPriority,
  getSpeechText,
  isPreCueKey,
  resolveSpeechKey,
};
