import { ACLS_COPY } from "./microcopy";

const SPEECH_MAP = {
  start_cpr: ACLS_COPY.operational.actions.cpr,
  prepare_rhythm: "Preparar ritmo",
  prepare_shock: "Preparar choque",
  prepare_epinephrine: "Preparar epinefrina",
  analyze_rhythm: ACLS_COPY.operational.actions.rhythm,
  shock: ACLS_COPY.operational.actions.shock,
  epinephrine_now: ACLS_COPY.operational.actions.epinephrine,
  antiarrhythmic_now: ACLS_COPY.operational.actions.antiarrhythmic,
  antiarrhythmic_repeat: "Repetir antiarrítmico",
} as const;

type SpeechMapKey = keyof typeof SPEECH_MAP;
type ClinicalSpeechPriority = "critical" | "normal";
type SpeechInterruptPolicy = "always" | "if_lower_priority" | "never";
type SpeechIntensity = "low" | "medium" | "high";

function resolveSpeechKey(key: string): SpeechMapKey | string {
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
      "choque_bi_1",
      "choque_mono_1",
      "choque_2",
      "choque_2_bifasico",
      "choque_2_monofasico",
      "choque_3",
      "choque_3_bifasico",
      "choque_3_monofasico",
      "shock",
    ].includes(key)
  ) {
    return "shock";
  }

  if (["reminder_epinefrina", "epinephrine_now"].includes(key)) {
    return "epinephrine_now";
  }

  if (["reminder_antiarritmico", "reminder_antiarritmico_1", "antiarrhythmic_now"].includes(key)) {
    return "antiarrhythmic_now";
  }

  if (["reminder_antiarritmico_2", "antiarrhythmic_repeat"].includes(key)) {
    return "antiarrhythmic_repeat";
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
    ["start_cpr", "analyze_rhythm", "shock", "epinephrine_now"].includes(
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

  if (["shock", "analyze_rhythm"].includes(resolvedKey)) {
    return "always";
  }

  return "never";
}

function getSpeechIntensity(key: string): SpeechIntensity {
  const resolvedKey = resolveSpeechKey(key);

  if (resolvedKey === "start_cpr") {
    return "low";
  }

  if (resolvedKey === "analyze_rhythm" || resolvedKey === "prepare_rhythm") {
    return "medium";
  }

  if (resolvedKey === "prepare_epinephrine") {
    return "medium";
  }

  if (
    ["shock", "prepare_shock", "epinephrine_now"].includes(resolvedKey)
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
