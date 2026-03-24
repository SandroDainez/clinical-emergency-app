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

function getAllowedVoiceIntents(context: AclsVoicePolicyContext): AclsVoiceIntent[] {
  const allowed = new Set<AclsVoiceIntent>([
    "repeat_instruction",
    "silence_audio",
    "switch_to_code_mode",
    "switch_to_training_mode",
  ]);

  if (context.hasReversibleCauses) {
    allowed.add("open_reversible_causes");
  }

  if (context.stateType === "action") {
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
