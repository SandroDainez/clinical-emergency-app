import type { DocumentationAction, EngineEffect, ProtocolState } from "../clinical-engine";
import type {
  AclsVoiceCommand,
  AclsVoiceCommandHint,
  AclsVoiceRuntimeState,
} from "./voice-runtime";
import {
  VOICE_CONFIRMATION_TIMEOUT_MS,
  beginVoiceListening,
  createAclsVoiceRuntimeState,
  createPendingVoiceConfirmation,
  disableVoiceMode,
  enableVoiceMode,
  mapAclsVoiceIntentToCommand,
  markVoiceCancelled,
  markVoiceExecuted,
  markVoiceRejected,
  markVoiceTimeout,
  receiveVoiceTranscript,
  setVoiceHints,
  shouldRequireVoiceConfirmation,
} from "./voice-runtime";
import type { AclsVoiceIntent } from "./voice-intents";
import { getVoiceIntentDefinition } from "./voice-intents";
import type { ResolvedAclsVoiceIntent } from "./voice-resolver";
import { resolveAclsVoiceIntent } from "./voice-resolver";
import type { VoiceCaptureProvider } from "../components/voice/voice-capture-provider";

type VoiceExecutionResult = "same_state" | "state_changed";

type VoiceSessionDebugLog = (event: string, details?: Record<string, unknown>) => void;

type VoiceSessionTurnToken = {
  sessionId: number;
  turnId: number;
  stateId: string;
};

type AclsVoiceSessionContext = {
  stateId: string;
  stateType: ProtocolState["type"];
  documentationActions: DocumentationAction[];
  allowedIntents: AclsVoiceIntent[];
  baseHints: AclsVoiceCommandHint[];
  pendingConfirmationHints: AclsVoiceCommandHint[];
  presentationMessage: string;
  presentationCueId?: string;
};

type AclsVoiceSessionLogEntry = {
  transcript: string;
  intent?: string;
  confidence: number;
  outcome:
    | "unknown"
    | "rejected"
    | "confirmation_requested"
    | "confirmation_confirmed"
    | "confirmation_cancelled"
    | "confirmation_expired"
    | "commands_presented"
    | "executed"
    | "mode_enabled"
    | "mode_disabled";
  actionTaken: string;
  commands?: string;
  errorCategory?:
    | "unknown"
    | "low_confidence"
    | "invalid_for_state"
    | "confirmation_timeout"
    | "capture_failed";
};

type AclsVoiceSessionControllerDeps = {
  provider: VoiceCaptureProvider;
  getContext: () => AclsVoiceSessionContext;
  onRuntimeStateChange: (state: AclsVoiceRuntimeState) => void;
  onVoiceEvent: (entry: AclsVoiceSessionLogEntry) => void;
  onExecuteCommand: (command: AclsVoiceCommand) => Promise<VoiceExecutionResult>;
  playOutput: (message: string, cueId?: string) => Promise<void>;
  stopOutput: () => void;
  isOutputActive: () => boolean;
  debug?: VoiceSessionDebugLog;
  waitMs?: (ms: number) => Promise<void>;
};

const LISTEN_SETTLE_MS = 300;
const LISTEN_RETRY_MS = 250;

function defaultWait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getVoiceFeedbackMessage(reason: {
  category: "unknown" | "low_confidence" | "invalid_for_state" | "confirmation_timeout" | "capture_failed";
}) {
  switch (reason.category) {
    case "unknown":
      return "Não entendi, tente novamente. Comandos válidos mostrados abaixo.";
    case "low_confidence":
      return "Baixa confiança no comando. Comandos válidos mostrados abaixo.";
    case "invalid_for_state":
      return "Comando não válido neste passo. Comandos válidos mostrados abaixo.";
    case "confirmation_timeout":
      return "Confirmação expirada.";
    case "capture_failed":
      return "Falha ao captar o comando de voz.";
    default:
      return "Não foi possível usar o comando de voz.";
  }
}

class AclsVoiceSessionController {
  private runtime = createAclsVoiceRuntimeState();
  private sessionId = 0;
  private turnId = 0;
  private currentStateId: string | null = null;
  private spokenTurnKey: string | null = null;
  private suppressStateSpeechForStateId: string | null = null;
  private currentToken: VoiceSessionTurnToken | null = null;
  private speechQueue: Promise<void> = Promise.resolve();
  private confirmationTimeout: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(private readonly deps: AclsVoiceSessionControllerDeps) {
    this.emit();
  }

  dispose() {
    this.disposed = true;
    this.clearConfirmationTimeout();
    this.invalidateCurrentTurn("dispose");
    this.deps.stopOutput();
  }

  getState() {
    return this.runtime;
  }

  isModeEnabled() {
    return this.runtime.modeEnabled;
  }

  enableMode() {
    if (!this.deps.provider.isAvailable()) {
      this.updateRuntime((current) =>
        setVoiceHints(
          markVoiceRejected(
            current,
            "",
            "Reconhecimento de voz indisponível neste dispositivo."
          ),
          this.getContext().baseHints
        )
      );
      return;
    }

    this.sessionId += 1;
    this.updateRuntime((current) =>
      setVoiceHints(enableVoiceMode(current), this.getContext().baseHints)
    );
    this.debug("mode_enabled", this.getDebugContext());
    this.log({
      transcript: "",
      confidence: 1,
      outcome: "mode_enabled",
      actionTaken: "voice_mode_on",
      commands: this.getContext().baseHints.map((hint) => hint.label).join(" | "),
    });
    void this.syncTurn();
  }

  disableMode(feedback = "Modo voz desativado.") {
    this.sessionId += 1;
    this.invalidateCurrentTurn("disable_mode");
    this.deps.stopOutput();
    this.updateRuntime((current) =>
      setVoiceHints(disableVoiceMode(current, feedback), this.getContext().baseHints)
    );
    this.debug("mode_disabled", this.getDebugContext());
    this.log({
      transcript: "",
      confidence: 1,
      outcome: "mode_disabled",
      actionTaken: "voice_mode_off",
    });
  }

  confirmPendingByTouch() {
    const pending = this.runtime.pendingConfirmation;

    if (!pending) {
      return;
    }

    this.log({
      transcript: pending.transcript,
      intent: pending.intent,
      confidence: pending.confidence,
      outcome: "confirmation_confirmed",
      actionTaken: pending.actionTaken,
    });
    void this.executeMappedCommand(
      pending.transcript,
      pending.intent,
      pending.confidence,
      pending.command
    );
  }

  cancelPendingByTouch() {
    const pending = this.runtime.pendingConfirmation;

    if (!pending) {
      return;
    }

    this.log({
      transcript: pending.transcript,
      intent: pending.intent,
      confidence: pending.confidence,
      outcome: "confirmation_cancelled",
      actionTaken: pending.actionTaken,
    });
    this.clearPendingConfirmation();
    this.updateRuntime((current) =>
      setVoiceHints(markVoiceCancelled(current), this.getCurrentHints())
    );
  }

  async syncTurn() {
    if (this.disposed) {
      return;
    }

    const context = this.getContext();
    const stateChanged = this.currentStateId !== context.stateId;

    if (stateChanged) {
      const previousStateId = this.currentStateId;
      this.currentStateId = context.stateId;
      this.turnId += 1;
      this.currentToken = {
        sessionId: this.sessionId,
        turnId: this.turnId,
        stateId: context.stateId,
      };
      this.invalidateCurrentTurn("state_changed");
      this.clearPendingConfirmation();
      this.debug("state_changed", {
        from: previousStateId,
        to: context.stateId,
        turnId: this.turnId,
        sessionId: this.sessionId,
        allowedIntents: context.allowedIntents,
      });
    } else if (!this.currentToken) {
      this.currentToken = {
        sessionId: this.sessionId,
        turnId: this.turnId,
        stateId: context.stateId,
      };
    }

    this.updateRuntime((current) => setVoiceHints(current, this.getCurrentHints()));
    this.logCommandsPresented();

    const token = this.currentToken;

    if (!token) {
      return;
    }

    if (this.runtime.modeEnabled) {
      void this.runHalfDuplexTurn(token);
      return;
    }

    if (stateChanged) {
      await this.playStateOrientation(token);
    }
  }

  async handleEffects(effects: EngineEffect[]) {
    for (const effect of effects) {
      if (effect.type !== "speak" && effect.type !== "play_audio_cue") {
        continue;
      }

      if (effect.suppressStateSpeech) {
        this.suppressStateSpeechForStateId = this.getContext().stateId;
      }

      await this.enqueueOutput(async () => {
        this.debug("effect_audio_start", {
          stateId: this.getContext().stateId,
          type: effect.type,
          message: effect.message,
          cueId: effect.type === "play_audio_cue" ? effect.cueId : undefined,
        });
        await this.deps.playOutput(
          effect.message,
          effect.type === "play_audio_cue" ? effect.cueId : undefined
        );
        this.debug("effect_audio_end", {
          stateId: this.getContext().stateId,
          type: effect.type,
        });
      });
    }
  }

  private getContext() {
    return this.deps.getContext();
  }

  private getCurrentHints() {
    const context = this.getContext();
    return this.runtime.pendingConfirmation
      ? context.pendingConfirmationHints
      : context.baseHints;
  }

  private emit() {
    this.deps.onRuntimeStateChange(this.runtime);
  }

  private updateRuntime(
    updater: (current: AclsVoiceRuntimeState) => AclsVoiceRuntimeState
  ) {
    this.runtime = updater(this.runtime);
    this.emit();
  }

  private log(entry: AclsVoiceSessionLogEntry) {
    this.deps.onVoiceEvent(entry);
  }

  private debug(event: string, details?: Record<string, unknown>) {
    this.deps.debug?.(event, details);
  }

  private getDebugContext() {
    const context = this.getContext();
    return {
      sessionId: this.sessionId,
      turnId: this.turnId,
      stateId: context.stateId,
      allowedIntents: context.allowedIntents,
      modeEnabled: this.runtime.modeEnabled,
    };
  }

  private getTurnKey(token: VoiceSessionTurnToken) {
    return `${token.sessionId}:${token.turnId}:${token.stateId}`;
  }

  private isCurrentToken(token: VoiceSessionTurnToken) {
    return (
      !this.disposed &&
      this.runtime.modeEnabled &&
      this.currentToken?.sessionId === token.sessionId &&
      this.currentToken.turnId === token.turnId &&
      this.currentToken.stateId === token.stateId
    );
  }

  private invalidateCurrentTurn(reason: string) {
    this.deps.provider.stop();
    this.debug("listening_invalidated", {
      reason,
      ...this.getDebugContext(),
    });
  }

  private clearConfirmationTimeout() {
    if (this.confirmationTimeout) {
      clearTimeout(this.confirmationTimeout);
      this.confirmationTimeout = null;
    }
  }

  private clearPendingConfirmation() {
    this.clearConfirmationTimeout();
    if (!this.runtime.pendingConfirmation) {
      return;
    }

    this.updateRuntime((current) => ({
      ...current,
      pendingConfirmation: null,
      hints: this.getCurrentHints(),
    }));
  }

  private scheduleConfirmationTimeout() {
    this.clearConfirmationTimeout();
    const pending = this.runtime.pendingConfirmation;

    if (!pending) {
      return;
    }

    this.confirmationTimeout = setTimeout(() => {
      if (!this.runtime.pendingConfirmation) {
        return;
      }

      this.log({
        transcript: pending.transcript,
        intent: pending.intent,
        confidence: pending.confidence,
        outcome: "confirmation_expired",
        actionTaken: pending.actionTaken,
        errorCategory: "confirmation_timeout",
      });
      this.updateRuntime((current) =>
        setVoiceHints(markVoiceTimeout(current), this.getCurrentHints())
      );
    }, Math.max(0, pending.expiresAt - Date.now()));
  }

  private async enqueueOutput(task: () => Promise<void>) {
    const nextTask = this.speechQueue
      .catch(() => undefined)
      .then(async () => {
        this.deps.provider.stop();
        await task();
      });

    this.speechQueue = nextTask;
    await nextTask;
  }

  private async waitForOutputToSettle() {
    await this.speechQueue.catch(() => undefined);

    while (this.deps.isOutputActive()) {
      await (this.deps.waitMs ?? defaultWait)(100);
    }

    await (this.deps.waitMs ?? defaultWait)(LISTEN_SETTLE_MS);
  }

  private async playStateOrientation(token: VoiceSessionTurnToken) {
    if (this.suppressStateSpeechForStateId === token.stateId) {
      this.suppressStateSpeechForStateId = null;
      this.spokenTurnKey = this.getTurnKey(token);
      return;
    }

    const turnKey = this.getTurnKey(token);
    const context = this.getContext();

    if (this.spokenTurnKey === turnKey) {
      return;
    }

    this.spokenTurnKey = turnKey;
    await this.enqueueOutput(async () => {
      if (!this.isCurrentToken(token) && this.runtime.modeEnabled) {
        return;
      }

      this.debug("audio_start", {
        ...this.getDebugContext(),
        cueId: context.presentationCueId ?? context.stateId,
      });
      await this.deps.playOutput(
        context.presentationMessage,
        context.presentationCueId ?? context.stateId
      );
      this.debug("audio_end", {
        ...this.getDebugContext(),
        cueId: context.presentationCueId ?? context.stateId,
      });
    });
  }

  private async runHalfDuplexTurn(token: VoiceSessionTurnToken) {
    if (!this.isCurrentToken(token)) {
      return;
    }

    if (!this.runtime.pendingConfirmation) {
      await this.playStateOrientation(token);
    }

    await this.waitForOutputToSettle();

    while (this.isCurrentToken(token)) {
      const allowedIntents = this.runtime.pendingConfirmation
        ? (["confirm_pending_voice_action", "cancel_pending_voice_action"] as AclsVoiceIntent[])
        : this.getContext().allowedIntents;

      if (allowedIntents.length === 0) {
        return;
      }

      const result = await this.listenOnce(token, allowedIntents);

      if (result !== "continue") {
        return;
      }
    }
  }

  private async listenOnce(
    token: VoiceSessionTurnToken,
    allowedIntents: AclsVoiceIntent[]
  ): Promise<"continue" | "state_changed" | "aborted"> {
    this.debug("listening_start", {
      ...this.getDebugContext(),
      allowedIntents,
    });

    const result = await this.deps.provider.captureOnce({
      lang: "pt-BR",
      onStart: () => {
        this.updateRuntime((current) => beginVoiceListening(current));
        this.debug("provider_start", this.getDebugContext());
      },
      onEnd: () => {
        this.debug("provider_end", this.getDebugContext());
      },
    });

    if (!this.isCurrentToken(token)) {
      this.debug("transcript_discarded", {
        reason: "token_outdated_after_capture",
        token,
        current: this.currentToken,
      });
      return "aborted";
    }

    if (result.kind === "error") {
      if (result.error === "no_speech") {
        await (this.deps.waitMs ?? defaultWait)(LISTEN_RETRY_MS);
        return "continue";
      }

      const feedback = getVoiceFeedbackMessage({ category: "capture_failed" });
      this.updateRuntime((current) =>
        setVoiceHints(markVoiceRejected(current, "", feedback), this.getCurrentHints())
      );
      this.log({
        transcript: "",
        confidence: 0,
        outcome: "rejected",
        actionTaken: "capture_failed",
        commands: this.getCurrentHints().map((hint) => hint.label).join(" | "),
        errorCategory: "capture_failed",
      });
      return "continue";
    }

    return this.handleTranscript(token, result.transcript, allowedIntents);
  }

  private async handleTranscript(
    token: VoiceSessionTurnToken,
    transcript: string,
    allowedIntents: AclsVoiceIntent[]
  ): Promise<"continue" | "state_changed" | "aborted"> {
    if (!this.isCurrentToken(token)) {
      this.debug("transcript_discarded", {
        reason: "token_outdated_before_resolve",
        transcript,
        token,
        current: this.currentToken,
      });
      return "aborted";
    }

    this.debug("transcript_received", {
      ...this.getDebugContext(),
      transcript,
      allowedIntents,
    });
    this.updateRuntime((current) => receiveVoiceTranscript(current, transcript));

    const resolution = resolveAclsVoiceIntent({
      transcript,
      stateId: token.stateId,
      allowedIntents,
    });

    return this.resolveTranscript(token, transcript, resolution);
  }

  private async resolveTranscript(
    token: VoiceSessionTurnToken,
    transcript: string,
    resolution: ResolvedAclsVoiceIntent
  ): Promise<"continue" | "state_changed" | "aborted"> {
    this.debug("intent_resolved", {
      ...this.getDebugContext(),
      transcript,
      kind: resolution.kind,
      intent: "intent" in resolution ? resolution.intent : undefined,
      confidence: resolution.confidence,
    });

    if (resolution.kind === "unknown") {
      const message = getVoiceFeedbackMessage({ category: "unknown" });
      this.updateRuntime((current) =>
        setVoiceHints(markVoiceRejected(current, transcript, message), this.getCurrentHints())
      );
      this.log({
        transcript,
        confidence: 0,
        outcome: "unknown",
        actionTaken: "none",
        commands: this.getCurrentHints().map((hint) => hint.label).join(" | "),
        errorCategory: "unknown",
      });
      return "continue";
    }

    const pending = this.runtime.pendingConfirmation;

    if (
      pending &&
      resolution.kind === "matched" &&
      resolution.intent === "confirm_pending_voice_action"
    ) {
      this.log({
        transcript,
        intent: resolution.intent,
        confidence: resolution.confidence,
        outcome: "confirmation_confirmed",
        actionTaken: pending.actionTaken,
      });
      const outcome = await this.executeMappedCommand(
        pending.transcript,
        pending.intent,
        pending.confidence,
        pending.command
      );
      return outcome === "state_changed" ? "state_changed" : "continue";
    }

    if (
      pending &&
      resolution.kind === "matched" &&
      resolution.intent === "cancel_pending_voice_action"
    ) {
      this.log({
        transcript,
        intent: resolution.intent,
        confidence: resolution.confidence,
        outcome: "confirmation_cancelled",
        actionTaken: pending.actionTaken,
      });
      this.clearPendingConfirmation();
      this.updateRuntime((current) =>
        setVoiceHints(markVoiceCancelled(current), this.getCurrentHints())
      );
      return "continue";
    }

    const context = this.getContext();
    const command = mapAclsVoiceIntentToCommand({
      intent: resolution.intent,
      stateId: context.stateId,
      stateType: context.stateType,
      documentationActions: context.documentationActions,
    });

    if (!command) {
      const message = getVoiceFeedbackMessage({ category: "invalid_for_state" });
      this.updateRuntime((current) =>
        setVoiceHints(markVoiceRejected(current, transcript, message), this.getCurrentHints())
      );
      this.log({
        transcript,
        intent: resolution.intent,
        confidence: resolution.confidence,
        outcome: "rejected",
        actionTaken: "invalid_for_state",
        commands: this.getCurrentHints().map((hint) => hint.label).join(" | "),
        errorCategory: "invalid_for_state",
      });
      return "continue";
    }

    if (shouldRequireVoiceConfirmation(resolution) && !this.runtime.modeEnabled) {
      const prompt =
        resolution.kind === "low_confidence"
          ? `Baixa confiança no comando. ${getVoiceIntentDefinition(
              resolution.intent
            ).confirmationPrompt ?? "Confirmar ação?"}`
          : getVoiceIntentDefinition(resolution.intent).confirmationPrompt ??
            `Confirmar ${resolution.intent.replace(/_/g, " ")}?`;

      this.updateRuntime((current) =>
        createPendingVoiceConfirmation(current, {
          transcript,
          resolution:
            resolution.kind === "matched"
              ? resolution
              : {
                  ...resolution,
                  kind: "matched",
                  requiresConfirmation: true,
                },
          command,
          expiresAt: Date.now() + VOICE_CONFIRMATION_TIMEOUT_MS,
          prompt,
          hints: this.getContext().pendingConfirmationHints,
        })
      );
      this.scheduleConfirmationTimeout();
      this.log({
        transcript,
        intent: resolution.intent,
        confidence: resolution.confidence,
        outcome: "confirmation_requested",
        actionTaken: command.actionTaken,
        commands: this.getContext().pendingConfirmationHints
          .map((hint) => hint.label)
          .join(" | "),
        errorCategory: resolution.kind === "low_confidence" ? "low_confidence" : undefined,
      });
      return "continue";
    }

    const outcome = await this.executeMappedCommand(
      transcript,
      resolution.intent,
      resolution.confidence,
      command
    );
    return outcome === "state_changed" ? "state_changed" : "continue";
  }

  private async executeMappedCommand(
    transcript: string,
    intent: AclsVoiceIntent,
    confidence: number,
    command: AclsVoiceCommand
  ) {
    this.clearPendingConfirmation();
    const outcome = await this.deps.onExecuteCommand(command);
    this.updateRuntime((current) =>
      setVoiceHints(markVoiceExecuted(current, transcript), this.getCurrentHints())
    );
    this.log({
      transcript,
      intent,
      confidence,
      outcome: "executed",
      actionTaken: command.actionTaken,
    });

    if (outcome === "state_changed") {
      return "state_changed" as const;
    }

    await this.waitForOutputToSettle();
    return "same_state" as const;
  }

  private logCommandsPresented() {
    const hints = this.getCurrentHints();

    if (hints.length === 0) {
      return;
    }

    this.log({
      transcript: "",
      confidence: 1,
      outcome: "commands_presented",
      actionTaken: "voice_commands_panel",
      commands: hints.map((hint) => hint.label).join(" | "),
    });
  }
}

function createAclsVoiceSessionController(
  deps: AclsVoiceSessionControllerDeps
) {
  return new AclsVoiceSessionController(deps);
}

export type {
  AclsVoiceSessionContext,
  AclsVoiceSessionControllerDeps,
  AclsVoiceSessionLogEntry,
  VoiceExecutionResult,
  VoiceSessionTurnToken,
};
export { AclsVoiceSessionController, createAclsVoiceSessionController };
