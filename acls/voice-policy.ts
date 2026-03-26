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

  if (CPR_START_CONFIRM_ONLY_STATE_IDS.has(context.stateId)) {
    return ["confirm_cpr_started"];
  }

  if (SHOCK_CONFIRM_ONLY_STATE_IDS.has(context.stateId)) {
    return context.documentationActions.some((action) => action.id === "shock")
      ? ["confirm_shock_delivered"]
      : [];
  }

  const allowed = new Set<AclsVoiceIntent>([
    "repeat_instruction",
    "silence_audio",
    "switch_to_code_mode",
    "switch_to_training_mode",
  ]);

  if (context.hasReversibleCauses) {
    allowed.add("open_reversible_causes");
  }

  if (context.stateType === "action" && !CONTINUOUS_CPR_STATE_IDS.has(context.stateId)) {
    allowed.add("go_to_next_step");
    allowed.add("confirm_action");
  }

  if (context.stateId === "inicio") {
    allowed.add("confirm_cpr_started");
  }

  if (
    [
      "avaliar_ritmo",
      "avaliar_ritmo_2",
      "avaliar_ritmo_3",
      "avaliar_ritmo_nao_chocavel",
    ].includes(context.stateId)
  ) {
    allowed.add("select_shockable_rhythm");
    allowed.add("select_non_shockable_rhythm");
    allowed.add("confirm_rosc");
  }

  if (context.stateId === "tipo_desfibrilador") {
    allowed.add("select_biphasic_defibrillator");
    allowed.add("select_monophasic_defibrillator");
  }

  if (context.stateId === "checar_respiracao_pulso") {
    allowed.add("confirm_no_rosc");
    allowed.add("confirm_pulse_present");
    allowed.add("end_current_flow");
  }

  const optionIntentMap: Record<string, AclsVoiceIntent> = {
    sem_pulso: "confirm_no_rosc",
    com_pulso: "confirm_pulse_present",
    encerrar: "end_current_flow",
  };

  for (const optionId of Object.keys(context.stateOptions ?? {})) {
    const mappedIntent = optionIntentMap[optionId];
    if (mappedIntent) {
      allowed.add(mappedIntent);
    }
  }

  for (const action of context.documentationActions) {
    if (action.id === "shock") {
      allowed.add("confirm_shock_delivered");
    }

    if (action.id === "adrenaline") {
      allowed.add("confirm_epinephrine_administered");
    }

    if (action.id === "antiarrhythmic") {
      allowed.add("confirm_antiarrhythmic_administered");
    }
  }

  return [...allowed];
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
