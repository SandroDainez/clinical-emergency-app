import type { AclsMode } from "./domain";
import type { DocumentationAction, ProtocolState } from "../clinical-engine";
import type { ResolvedAclsVoiceIntent } from "./voice-resolver";
import type { AclsVoiceIntent } from "./voice-intents";

type AclsVoiceCommand =
  | { kind: "register_execution"; actionId: DocumentationAction["id"]; actionTaken: string }
  | { kind: "run_transition"; input?: string; actionTaken: string }
  | { kind: "repeat_instruction"; actionTaken: string }
  | { kind: "open_reversible_causes"; actionTaken: string }
  | { kind: "silence_audio"; actionTaken: string }
  | { kind: "switch_mode"; mode: AclsMode; actionTaken: string };

type MapAclsVoiceIntentContext = {
  intent: AclsVoiceIntent;
  stateId: string;
  stateType: ProtocolState["type"];
  documentationActions: DocumentationAction[];
};

type AclsVoiceRuntimeStatus =
  | "idle"
  | "listening"
  | "transcript_received"
  | "pending_confirmation"
  | "executed"
  | "cancelled"
  | "rejected"
  | "timeout";

type AclsVoiceCommandHint = {
  intent: AclsVoiceIntent;
  label: string;
};

type PendingVoiceConfirmation = {
  transcript: string;
  intent: AclsVoiceIntent;
  confidence: number;
  actionTaken: string;
  expiresAt: number;
  prompt: string;
  command: AclsVoiceCommand;
};

type AclsVoiceRuntimeState = {
  modeEnabled: boolean;
  status: AclsVoiceRuntimeStatus;
  transcript: string;
  feedback: string;
  hints: AclsVoiceCommandHint[];
  pendingConfirmation: PendingVoiceConfirmation | null;
};

type CreatePendingVoiceConfirmationInput = {
  transcript: string;
  resolution: Extract<ResolvedAclsVoiceIntent, { kind: "matched" }>;
  command: AclsVoiceCommand;
  expiresAt: number;
  prompt: string;
  hints: AclsVoiceCommandHint[];
};

const VOICE_CONFIRMATION_TIMEOUT_MS = 8000;
const HIGH_CONFIDENCE_THRESHOLD = 0.9;

function hasDocumentationAction(
  documentationActions: DocumentationAction[],
  actionId: DocumentationAction["id"]
) {
  return documentationActions.some((action) => action.id === actionId);
}

function mapAclsVoiceIntentToCommand(
  context: MapAclsVoiceIntentContext
): AclsVoiceCommand | null {
  switch (context.intent) {
    case "confirm_cpr_started":
    case "go_to_next_step":
      return context.stateType === "action"
        ? { kind: "run_transition", actionTaken: "go_to_next_step" }
        : null;
    case "confirm_action":
      return context.stateType === "action"
        ? { kind: "run_transition", actionTaken: "confirm_action" }
        : null;
    case "confirm_shock_delivered":
      return hasDocumentationAction(context.documentationActions, "shock")
        ? { kind: "register_execution", actionId: "shock", actionTaken: "register_shock" }
        : null;
    case "confirm_epinephrine_administered":
      return hasDocumentationAction(context.documentationActions, "adrenaline")
        ? {
            kind: "register_execution",
            actionId: "adrenaline",
            actionTaken: "register_epinephrine",
          }
        : null;
    case "confirm_antiarrhythmic_administered":
      return hasDocumentationAction(context.documentationActions, "antiarrhythmic")
        ? {
            kind: "register_execution",
            actionId: "antiarrhythmic",
            actionTaken: "register_antiarrhythmic",
          }
        : null;
    case "select_shockable_rhythm":
      return { kind: "run_transition", input: "chocavel", actionTaken: "select_shockable_rhythm" };
    case "select_non_shockable_rhythm":
      return {
        kind: "run_transition",
        input: "nao_chocavel",
        actionTaken: "select_non_shockable_rhythm",
      };
    case "select_biphasic_defibrillator":
      return context.stateId === "tipo_desfibrilador"
        ? {
            kind: "run_transition",
            input: "bifasico",
            actionTaken: "select_biphasic_defibrillator",
          }
        : null;
    case "select_monophasic_defibrillator":
      return context.stateId === "tipo_desfibrilador"
        ? {
            kind: "run_transition",
            input: "monofasico",
            actionTaken: "select_monophasic_defibrillator",
          }
        : null;
    case "confirm_rosc":
      return { kind: "run_transition", input: "rosc", actionTaken: "confirm_rosc" };
    case "confirm_no_rosc":
      return context.stateId === "checar_respiracao_pulso"
        ? { kind: "run_transition", input: "sem_pulso", actionTaken: "confirm_no_rosc" }
        : null;
    case "confirm_pulse_present":
      return context.stateId === "checar_respiracao_pulso"
        ? { kind: "run_transition", input: "com_pulso", actionTaken: "confirm_pulse_present" }
        : null;
    case "end_current_flow":
      return context.stateType === "question"
        ? { kind: "run_transition", input: "encerrar", actionTaken: "end_current_flow" }
        : null;
    case "repeat_instruction":
      return { kind: "repeat_instruction", actionTaken: "repeat_instruction" };
    case "open_reversible_causes":
      return { kind: "open_reversible_causes", actionTaken: "open_reversible_causes" };
    case "silence_audio":
      return { kind: "silence_audio", actionTaken: "silence_audio" };
    case "switch_to_code_mode":
      return { kind: "switch_mode", mode: "code", actionTaken: "switch_to_code_mode" };
    case "switch_to_training_mode":
      return { kind: "switch_mode", mode: "training", actionTaken: "switch_to_training_mode" };
    default:
      return null;
  }
}

function createAclsVoiceRuntimeState(hints: AclsVoiceCommandHint[] = []): AclsVoiceRuntimeState {
  return {
    modeEnabled: false,
    status: "idle",
    transcript: "",
    feedback: "",
    hints,
    pendingConfirmation: null,
  };
}

function enableVoiceMode(state: AclsVoiceRuntimeState): AclsVoiceRuntimeState {
  return {
    ...state,
    modeEnabled: true,
    status: "idle",
    feedback: "Modo voz ativo.",
  };
}

function disableVoiceMode(
  state: AclsVoiceRuntimeState,
  feedback = "Modo voz desativado."
): AclsVoiceRuntimeState {
  return {
    ...state,
    modeEnabled: false,
    status: "idle",
    feedback,
    pendingConfirmation: null,
  };
}

function setVoiceHints(
  state: AclsVoiceRuntimeState,
  hints: AclsVoiceCommandHint[]
): AclsVoiceRuntimeState {
  return {
    ...state,
    hints,
  };
}

function beginVoiceListening(state: AclsVoiceRuntimeState): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "listening",
    transcript: "",
    feedback: "",
  };
}

function receiveVoiceTranscript(
  state: AclsVoiceRuntimeState,
  transcript: string
): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "transcript_received",
    transcript,
    feedback: "",
  };
}

function createPendingVoiceConfirmation(
  state: AclsVoiceRuntimeState,
  input: CreatePendingVoiceConfirmationInput
): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "pending_confirmation",
    transcript: input.transcript,
    feedback: "Confirmação por voz pendente.",
    hints: input.hints,
    pendingConfirmation: {
      transcript: input.transcript,
      intent: input.resolution.intent,
      confidence: input.resolution.confidence,
      actionTaken: input.command.actionTaken,
      expiresAt: input.expiresAt,
      prompt: input.prompt,
      command: input.command,
    },
  };
}

function markVoiceExecuted(
  state: AclsVoiceRuntimeState,
  transcript: string,
  feedback = "Comando executado."
): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "executed",
    transcript,
    feedback,
    pendingConfirmation: null,
  };
}

function markVoiceCancelled(
  state: AclsVoiceRuntimeState,
  feedback = "Comando de voz cancelado."
): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "cancelled",
    feedback,
    pendingConfirmation: null,
  };
}

function markVoiceRejected(
  state: AclsVoiceRuntimeState,
  transcript: string,
  feedback: string
): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "rejected",
    transcript,
    feedback,
    pendingConfirmation: null,
  };
}

function markVoiceTimeout(
  state: AclsVoiceRuntimeState,
  feedback = "Confirmação de voz expirada."
): AclsVoiceRuntimeState {
  return {
    ...state,
    status: "timeout",
    feedback,
    pendingConfirmation: null,
  };
}

function isVoiceConfirmationExpired(
  state: AclsVoiceRuntimeState,
  currentTimestamp: number
) {
  return Boolean(
    state.pendingConfirmation &&
      state.pendingConfirmation.expiresAt <= currentTimestamp
  );
}

function shouldRequireVoiceConfirmation(
  resolution: Extract<ResolvedAclsVoiceIntent, { kind: "matched" | "low_confidence" }>
) {
  if (resolution.intent === "confirm_rosc") {
    return true;
  }

  if (resolution.kind === "low_confidence") {
    return true;
  }

  return resolution.requiresConfirmation || resolution.confidence < HIGH_CONFIDENCE_THRESHOLD;
}

export type {
  AclsVoiceCommand,
  AclsVoiceCommandHint,
  AclsVoiceRuntimeState,
  AclsVoiceRuntimeStatus,
  CreatePendingVoiceConfirmationInput,
  MapAclsVoiceIntentContext,
  PendingVoiceConfirmation,
};
export {
  VOICE_CONFIRMATION_TIMEOUT_MS,
  beginVoiceListening,
  createAclsVoiceRuntimeState,
  createPendingVoiceConfirmation,
  disableVoiceMode,
  enableVoiceMode,
  HIGH_CONFIDENCE_THRESHOLD,
  isVoiceConfirmationExpired,
  mapAclsVoiceIntentToCommand,
  markVoiceCancelled,
  markVoiceExecuted,
  markVoiceRejected,
  markVoiceTimeout,
  receiveVoiceTranscript,
  setVoiceHints,
  shouldRequireVoiceConfirmation,
};
