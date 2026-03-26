import type { AclsCaseLogEntry, AclsEffect } from "./domain";
import { isPreCueKey } from "./speech-map";
import {
  createInitialAclsState,
  reduceAclsState,
  type ACLSEvent,
  type ACLSState,
  type Effect as ReducerEffect,
} from "./reducer";

type ACLSOrchestrator = {
  consumeEffects: () => AclsEffect[];
  dispatch: (event: ACLSEvent) => ACLSState;
  getCaseLog: () => AclsCaseLogEntry[];
  getState: () => ACLSState;
  handleEffects: (effects: ReducerEffect[]) => void;
  restore: (nextState: ACLSState, nextCaseLog?: AclsCaseLogEntry[]) => ACLSState;
  reset: () => ACLSState;
};

type ACLSOrchestratorDeps = {
  onEffectsHandled?: (effects: ReducerEffect[]) => void;
  onReducerCompleted?: (state: ACLSState, effects: ReducerEffect[], event: ACLSEvent) => void;
  onStateApplied?: (state: ACLSState) => void;
  getCurrentDispatchTraceId?: () => string | undefined;
};

function mapReducerEffectToAclsEffects(
  effect: ReducerEffect,
  latencyTraceId?: string
): AclsEffect[] {
  if (effect.type === "LOG") {
    return effect.eventId ? [{ type: "log_event", eventId: effect.eventId }] : [];
  }

  if (effect.type === "ALERT") {
    return [{ type: "alert", title: effect.title, message: effect.message }];
  }

  const suppressStateSpeech = isPreCueKey(effect.key);

  return [
    {
      type: "play_audio_cue",
      cueId: effect.key,
      latencyTraceId,
      message: effect.message ?? effect.key,
      intensity: effect.intensity,
      suppressStateSpeech,
    },
  ];
}

function normalizeCaseLogValue(
  value: unknown
): string | number | boolean | null | undefined {
  if (value === null || value === undefined) {
    return value === null ? null : undefined;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return JSON.stringify(value);
}

function buildEventDetails(event: ACLSEvent) {
  const entries = Object.entries(event)
    .filter(([key]) => key !== "type" && key !== "at")
    .map(([key, value]) => [key, normalizeCaseLogValue(value)] as const)
    .filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries) as Record<
    string,
    string | number | boolean | null | undefined
  >;
}

function buildCaseLogEntry(
  existingEntries: AclsCaseLogEntry[],
  state: ACLSState,
  event: ACLSEvent,
  effects: ReducerEffect[]
): AclsCaseLogEntry {
  const speakEffects = effects
    .filter((effect): effect is Extract<ReducerEffect, { type: "SPEAK" }> => effect.type === "SPEAK")
    .map((effect) => ({
      key: effect.key,
      intensity: effect.intensity,
      message: effect.message,
    }));
  const timestamp =
    "at" in event && typeof event.at === "number"
      ? event.at
      : state.timeline[state.timeline.length - 1]?.timestamp ?? Date.now();

  return {
    id: `${event.type}:${existingEntries.length + 1}:${timestamp}`,
    timestamp,
    stateId: state.currentStateId,
    eventType: event.type,
    eventDetails: buildEventDetails(event),
    speak: speakEffects[0],
    speakEffects,
  };
}

function createAclsOrchestrator(
  initialState: ACLSState = createInitialAclsState(),
  deps: ACLSOrchestratorDeps = {}
): ACLSOrchestrator {
  let state = initialState;
  let caseLog: AclsCaseLogEntry[] = [];
  let pendingEffects: AclsEffect[] = [];

  function handleEffects(effects: ReducerEffect[]) {
    deps.onEffectsHandled?.(effects);
    pendingEffects.push(
      ...effects.flatMap((effect) =>
        mapReducerEffectToAclsEffects(effect, deps.getCurrentDispatchTraceId?.())
      )
    );
  }

  function dispatch(event: ACLSEvent) {
    const result = reduceAclsState(state, event);
    deps.onReducerCompleted?.(result.state, result.effects, event);
    state = result.state;
    caseLog.push(buildCaseLogEntry(caseLog, state, event, result.effects));
    deps.onStateApplied?.(state);
    handleEffects(result.effects);
    return state;
  }

  function consumeEffects() {
    const effects = [...pendingEffects];
    pendingEffects = [];
    return effects;
  }

  function getState() {
    return state;
  }

  function getCaseLog() {
    return [...caseLog];
  }

  function reset() {
    state = createInitialAclsState();
    caseLog = [];
    pendingEffects = [];
    return state;
  }

  function restore(nextState: ACLSState, nextCaseLog: AclsCaseLogEntry[] = []) {
    state = nextState;
    caseLog = [...nextCaseLog];
    pendingEffects = [];
    deps.onStateApplied?.(state);
    return state;
  }

  return {
    consumeEffects,
    dispatch,
    getCaseLog,
    getState,
    handleEffects,
    restore,
    reset,
  };
}

export type { ACLSOrchestrator };
export { createAclsOrchestrator };
