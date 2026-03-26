import type { DocumentationAction, ProtocolState } from "../clinical-engine";
import type { AclsVoiceIntent } from "./voice-intents";
import { getVoiceIntentDefinition } from "./voice-intents";
import type { AclsVoiceCommandHint } from "./voice-runtime";

type AclsVoicePolicyContext = {
  stateId: string;
  stateType: ProtocolState["type"];
  documentationActions: DocumentationAction[];
  hasReversibleCauses: boolean;
  stateOptions?: Record<string, string>;
};

const CONTINUOUS_CPR_STATE_IDS = new Set([
  "inicio",
  "rcp_1",
  "rcp_2",
  "rcp_3",
  "nao_chocavel_epinefrina",
  "nao_chocavel_ciclo",
]);
const CONFIRM_ONLY_STATE_IDS = new Set(["reconhecimento_inicial"]);
const CPR_START_CONFIRM_ONLY_STATE_IDS = new Set(["inicio"]);
const PREPARE_RHYTHM_CONFIRM_ONLY_STATE_IDS = new Set([
  "avaliar_ritmo_preparo",
  "avaliar_ritmo_2_preparo",
  "avaliar_ritmo_3_preparo",
  "avaliar_ritmo_nao_chocavel_preparo",
]);
const SHOCK_CONFIRM_ONLY_STATE_IDS = new Set([
  "choque_bi_1",
  "choque_mono_1",
  "choque_2",
  "choque_3",
]);

function getAllowedVoiceIntents(context: AclsVoicePolicyContext): AclsVoiceIntent[] {
  if (CONFIRM_ONLY_STATE_IDS.has(context.stateId)) {
    return ["confirm_action"];
  }

  if (PREPARE_RHYTHM_CONFIRM_ONLY_STATE_IDS.has(context.stateId)) {
    return ["confirm_action"];
  }

  if (CONTINUOUS_CPR_STATE_IDS.has(context.stateId)) {
    return [];
  }

  if (SHOCK_CONFIRM_ONLY_STATE_IDS.has(context.stateId)) {
    return context.documentationActions.some((action) => action.id === "shock")
      ? ["confirm_shock_delivered"]
      : [];
  }

  if (
    [
      "avaliar_ritmo",
      "avaliar_ritmo_2",
      "avaliar_ritmo_3",
      "avaliar_ritmo_nao_chocavel",
    ].includes(context.stateId)
  ) {
    return ["select_shockable_rhythm", "select_non_shockable_rhythm", "confirm_rosc"];
  }

  if (context.stateId === "tipo_desfibrilador") {
    return ["select_biphasic_defibrillator", "select_monophasic_defibrillator"];
  }

  if (context.stateId === "checar_respiracao_pulso") {
    return ["confirm_no_rosc", "confirm_pulse_present"];
  }

  for (const action of context.documentationActions) {
    if (action.id === "adrenaline") {
      return ["confirm_epinephrine_administered"];
    }

    if (action.id === "antiarrhythmic") {
      return ["confirm_antiarrhythmic_administered"];
    }
  }

  if (context.stateType === "action") {
    return ["confirm_action"];
  }

  return [];
}

function buildVoiceCommandHints(
  intents: AclsVoiceIntent[],
  maxItems = 4
): AclsVoiceCommandHint[] {
  return intents
    .map((intent) => {
      const definition = getVoiceIntentDefinition(intent);
      return {
        intent,
        label: definition.panelLabel,
        priority: definition.panelPriority ?? 99,
      };
    })
    .sort((left, right) => left.priority - right.priority)
    .slice(0, maxItems)
    .map(({ intent, label }) => ({ intent, label }));
}

export type { AclsVoicePolicyContext };
export { buildVoiceCommandHints, getAllowedVoiceIntents };
