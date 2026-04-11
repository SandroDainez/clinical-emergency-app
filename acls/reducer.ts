import { aclsProtocol } from "./protocol-runtime";
import {
  clearCycle,
  createClinicalClock,
  isCycleComplete,
  startNewCycle,
  type ClinicalClock,
} from "./clinical-clock";
import type {
  AclsClinicalIntent,
  AclsClinicalIntentConfidence,
  AclsDocumentationAction,
  AclsMedicationTracker,
  AclsReversibleCauseRecord,
  AclsSpeechIntensity,
  AclsTimelineEvent,
} from "./domain";
import type { AclsProtocolState } from "./protocol-schema";

type ACLSAlgorithmBranch =
  | "recognition"
  | "shockable"
  | "nonshockable"
  | "post_rosc"
  | "ended";

type ACLSClinicalPhase =
  | "RECOGNITION"
  | "SHOCK"
  | "CPR"
  | "RHYTHM_CHECK"
  | "POST_ROSC"
  | "ENDED";

type ACLSShockableFlowStep =
  | "not_started"
  | "shock_1"
  | "cpr_1"
  | "shock_2"
  | "cpr_2_with_epinephrine"
  | "shock_3"
  | "cpr_3_with_antiarrhythmic";

type ACLSCurrentRhythm =
  | "unknown"
  | "shockable"
  | "nonshockable"
  | "organized"
  | "rosc";

type ACLSTimer = {
  id: string;
  startedAt: number;
  duration: number;
  stateId: string;
  nextStateId?: string;
  completed: boolean;
};

type ACLSState = {
  protocolId: string;
  currentStateId: string;
  clock: ClinicalClock;
  algorithmBranch: ACLSAlgorithmBranch;
  clinicalPhase: ACLSClinicalPhase;
  clinicalIntent: AclsClinicalIntent;
  clinicalIntentConfidence: AclsClinicalIntentConfidence;
  currentRhythm: ACLSCurrentRhythm;
  shockableFlowStep: ACLSShockableFlowStep;
  timeline: AclsTimelineEvent[];
  timers: ACLSTimer[];
  protocolStartedAt?: number;
  stateEntrySequence: number;
  documentedExecutionKeys: string[];
  defibrillatorType?: "bifasico" | "monofasico";
  deliveredShockCount: number;
  lastShockAt?: number;
  cycleCount: number;
  initialCprStartedAt?: number;
  medications: Record<"adrenaline" | "antiarrhythmic", AclsMedicationTracker>;
  antiarrhythmicReminderStage: 0 | 1 | 2;
  advancedAirwaySecuredAt?: number;
  reversibleCauseRecords: Record<string, AclsReversibleCauseRecord>;
  emittedPreCueKeys: string[];
};

type ACLSEvent =
  | { type: "action_confirmed"; at: number }
  | { type: "question_answered"; at: number; input: string }
  | {
      type: "execution_recorded";
      at: number;
      actionId: AclsDocumentationAction["id"];
    }
  | { type: "timer_elapsed"; at: number; timerId: string }
  | {
      type: "medication_reminder_due";
      at: number;
      medicationId: "adrenaline";
    }
  | {
      type: "reversible_cause_status_updated";
      at: number;
      causeId: string;
      status: "suspeita" | "abordada";
    }
  | {
      type: "reversible_cause_notes_updated";
      at: number;
      causeId: string;
      field: "evidence" | "actionsTaken" | "responseObserved";
      value: string;
    }
  | {
      type: "voice_command_logged";
      at: number;
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
      errorCategory?: string;
    }
  | {
      type: "assistant_insight_logged";
      at: number;
      kind:
        | "ranking_generated"
        | "priority_changed"
        | "missing_data_highlighted"
        | "top_three_presented";
      summary: string;
      stateId: string;
      details?: Record<string, string | number | boolean | null | undefined>;
    }
  | {
      type: "pre_cue_due";
      at: number;
      kind: "prepare_rhythm" | "prepare_shock" | "prepare_epinephrine";
      source: "time";
      timerId: string;
    }
  | {
      type: "pre_cue_due";
      at: number;
      kind: "prepare_rhythm" | "prepare_shock" | "prepare_epinephrine";
      source: "transition" | "action";
      timerId?: string;
    }
  | { type: "session_reset" };

type Effect =
  | {
      type: "SPEAK";
      key: string;
      priority: "critical" | "main" | "precue" | "secondary";
      intensity: AclsSpeechIntensity;
      message?: string;
    }
  | {
      type: "LOG";
      key: string;
      eventId?: string;
      message?: string;
    }
  | {
      type: "ALERT";
      key: string;
      title: string;
      message: string;
    };

type ACLSReducerResult = {
  state: ACLSState;
  effects: Effect[];
};

const ADRENALINE_EARLIEST_REPEAT_MS = 3 * 60 * 1000;
const ADRENALINE_LATE_AFTER_MS = 5 * 60 * 1000;
const ADRENALINE_ELIGIBLE_STATE_IDS = [
  "nao_chocavel_epinefrina",
  "nao_chocavel_ciclo",
  "rcp_2",
  "rcp_3",
] as const;
const ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS = ["rcp_3", "avaliar_ritmo_3"] as const;
const PREPARE_RHYTHM_STATE_IDS = [
  "avaliar_ritmo_preparo",
  "avaliar_ritmo_2_preparo",
  "avaliar_ritmo_3_preparo",
  "avaliar_ritmo_nao_chocavel_preparo",
] as const;
const RHYTHM_DECISION_STATE_IDS = [
  "avaliar_ritmo",
  "avaliar_ritmo_2",
  "avaliar_ritmo_3",
  "avaliar_ritmo_nao_chocavel",
] as const;
const SHOCKABLE_STATE_IDS = [
  "choque_bi_1",
  "choque_mono_1",
  "rcp_1",
  "choque_2",
  "rcp_2",
  "choque_3",
  "rcp_3",
] as const;
const NON_SHOCKABLE_STATE_IDS = [
  "nao_chocavel_epinefrina",
  "nao_chocavel_ciclo",
  "avaliar_ritmo_nao_chocavel_preparo",
  "avaliar_ritmo_nao_chocavel",
  "nao_chocavel_hs_ts",
] as const;
type SpeakPriority = "critical" | "main" | "precue" | "secondary";

function throwInvariantViolation(
  state: ACLSState,
  effects: Effect[],
  at: number,
  issue: string,
  message: string,
  details?: Record<string, string | number | boolean | null | undefined>
): never {
  appendTimelineEvent(state, effects, at, "guard_rail_triggered", "user", {
    issue,
    ...details,
  });
  throw new Error(message);
}

function createMedicationTracker(
  id: "adrenaline" | "antiarrhythmic"
): AclsMedicationTracker {
  return {
    id,
    status: "idle",
    recommendedCount: 0,
    administeredCount: 0,
    pendingConfirmation: false,
    eligible: false,
  };
}

function createReversibleCauseRecords() {
  return Object.fromEntries(
    (aclsProtocol.reversibleCauses ?? []).map((cause) => [
      cause.id,
      {
        ...cause,
        status: "pendente" as const,
        suspected: false,
        evidence: [],
        actionsTaken: [],
        responseObserved: [],
      },
    ])
  );
}

function createInitialAclsState(): ACLSState {
  return {
    protocolId: aclsProtocol.id,
    currentStateId: aclsProtocol.initialState,
    clock: createClinicalClock(),
    algorithmBranch: "recognition",
    clinicalPhase: "RECOGNITION",
    clinicalIntent: "assess_patient",
    clinicalIntentConfidence: "low",
    currentRhythm: "unknown",
    shockableFlowStep: "not_started",
    timeline: [],
    timers: [],
    stateEntrySequence: 0,
    documentedExecutionKeys: [],
    deliveredShockCount: 0,
    cycleCount: 0,
    medications: {
      adrenaline: createMedicationTracker("adrenaline"),
      antiarrhythmic: createMedicationTracker("antiarrhythmic"),
    },
    antiarrhythmicReminderStage: 0,
    reversibleCauseRecords: createReversibleCauseRecords(),
    emittedPreCueKeys: [],
  };
}

function cloneAclsState(state: ACLSState): ACLSState {
  return {
    ...state,
    clock: { ...state.clock },
    timeline: [...state.timeline],
    timers: state.timers.map((timer) => ({ ...timer })),
    documentedExecutionKeys: [...state.documentedExecutionKeys],
    emittedPreCueKeys: [...state.emittedPreCueKeys],
    medications: {
      adrenaline: { ...state.medications.adrenaline },
      antiarrhythmic: { ...state.medications.antiarrhythmic },
    },
    reversibleCauseRecords: Object.fromEntries(
      Object.entries(state.reversibleCauseRecords).map(([causeId, cause]) => [
        causeId,
        {
          ...cause,
          actions: [...cause.actions],
          evidence: [...cause.evidence],
          actionsTaken: [...cause.actionsTaken],
          responseObserved: [...cause.responseObserved],
        },
      ])
    ),
  };
}

function getBaseProtocolState(stateId: string) {
  const state = aclsProtocol.states[stateId];

  if (!state) {
    throw new Error(`Estado inválido: ${stateId}`);
  }

  return state;
}

function resolveDynamicAclsProtocolState(state: ACLSState, stateId = state.currentStateId): AclsProtocolState {
  const current = getBaseProtocolState(stateId);

  if (stateId === "choque_2") {
    const isMonophasic = state.defibrillatorType === "monofasico";
    return {
      ...current,
      text: "Aplicar choque",
      speak: isMonophasic
        ? "Aplicar o choque agora. Monofásico, trezentos e sessenta joules"
        : "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior que a anterior",
      details: isMonophasic
        ? [
            "Monofásico: 360 joules",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ]
        : [
            "Bifásico: usar dose equivalente ou maior que a anterior; considerar escalonamento",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ],
    };
  }

  if (stateId === "choque_3") {
    const isMonophasic = state.defibrillatorType === "monofasico";
    return {
      ...current,
      text: "Aplicar choque",
      speak: isMonophasic
        ? "Aplicar o choque agora. Monofásico, trezentos e sessenta joules"
        : "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior e considerar escalonamento",
      details: isMonophasic
        ? [
            "Monofásico: 360 joules",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ]
        : [
            "Bifásico: usar dose equivalente ou maior; considerar escalonamento",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ],
    };
  }

  return current;
}

function appendTimelineEvent(
  state: ACLSState,
  effects: Effect[],
  at: number,
  type: AclsTimelineEvent["type"],
  origin: AclsTimelineEvent["origin"],
  details?: AclsTimelineEvent["details"]
) {
  const event: AclsTimelineEvent = {
    id: `${type}:${state.timeline.length + 1}:${at}`,
    timestamp: at,
    type,
    stateId: state.currentStateId,
    origin,
    details,
  };
  state.timeline.push(event);
  effects.push({ type: "LOG", key: type, eventId: event.id });
}

function hasEmittedPreCue(state: ACLSState, key: string) {
  return state.emittedPreCueKeys.includes(key);
}

function getPreCueIntensity(key: "prepare_rhythm" | "prepare_shock" | "prepare_epinephrine") {
  if (key === "prepare_rhythm") {
    return "medium" as const;
  }

  if (key === "prepare_epinephrine") {
    return "medium" as const;
  }

  return "high" as const;
}

function isRelevantPreCue(
  state: ACLSState,
  key: "prepare_rhythm" | "prepare_shock" | "prepare_epinephrine"
) {
  if (key === "prepare_rhythm") {
    const activeTimer = state.timers[0];
    return state.clinicalPhase === "CPR" && Boolean(activeTimer && !activeTimer.completed);
  }

  if (key === "prepare_shock") {
    return state.clinicalPhase === "SHOCK";
  }

  return canRemindAdrenaline(state) && !state.medications.adrenaline.pendingConfirmation;
}

function emitPreCue(
  state: ACLSState,
  effects: Effect[],
  at: number,
  key: "prepare_rhythm" | "prepare_shock" | "prepare_epinephrine",
  source: "time" | "transition" | "action"
) {
  if (hasEmittedPreCue(state, key)) {
    return;
  }

  if (!isRelevantPreCue(state, key)) {
    return;
  }

  state.emittedPreCueKeys.push(key);
  effects.push({
    type: "SPEAK",
    key,
    priority: "precue",
    intensity: getPreCueIntensity(key),
    message: key,
  });
  effects.push({
    type: "LOG",
    key: "pre_cue_emitted",
    message: `${source}:${key}`,
  });
}

function startTimer(
  state: ACLSState,
  effects: Effect[],
  at: number,
  duration: number,
  stateId: string,
  nextStateId?: string
) {
  state.clock = startNewCycle(state.clock, at);
  const timer: ACLSTimer = {
    id: `timer:${stateId}:${at}`,
    startedAt: at,
    duration,
    stateId,
    nextStateId,
    completed: false,
  };

  state.timers = [timer];
  effects.push({ type: "LOG", key: "timer_started", message: timer.id });
  appendTimelineEvent(state, effects, at, "timer_started", "system", {
    durationSeconds: duration,
    stateId,
    nextStateId,
  });
}

function getMedicationDoseLabel(
  medicationId: "adrenaline" | "antiarrhythmic",
  count: number
) {
  if (medicationId === "adrenaline") {
    return "Epinefrina 1 mg IV/IO";
  }

  return count <= 1
    ? "Amiodarona 300 mg IV/IO ou lidocaína 1 a 1,5 mg/kg IV/IO"
    : "Amiodarona 150 mg IV/IO ou lidocaína 0,5 a 0,75 mg/kg IV/IO";
}

function getSpeakPriorityForKey(key: string): SpeakPriority {
  if (["analyze_rhythm", "shock", "confirm_rosc"].includes(key)) {
    return "critical";
  }

  if (["start_cpr", "epinephrine_now", "antiarrhythmic_now"].includes(key)) {
    return "main";
  }

  if (["prepare_rhythm", "prepare_shock", "prepare_epinephrine"].includes(key)) {
    return "precue";
  }

  return "secondary";
}

function canRemindAdrenaline(state: ACLSState) {
  return ADRENALINE_ELIGIBLE_STATE_IDS.includes(
    state.currentStateId as (typeof ADRENALINE_ELIGIBLE_STATE_IDS)[number]
  );
}

function hasInitialNonShockableAdrenalineIndication(state: ACLSState) {
  return (
    state.currentStateId === "nao_chocavel_epinefrina" &&
    state.algorithmBranch === "nonshockable" &&
    state.medications.adrenaline.recommendedCount === 0 &&
    state.medications.adrenaline.administeredCount === 0
  );
}

function hasInitialShockableAdrenalineIndication(state: ACLSState) {
  return (
    state.currentStateId === "rcp_2" &&
    state.algorithmBranch === "shockable" &&
    state.shockableFlowStep === "cpr_2_with_epinephrine" &&
    state.medications.adrenaline.recommendedCount === 0 &&
    state.medications.adrenaline.administeredCount === 0
  );
}

function getAdrenalineNextEligibleTime(state: ACLSState) {
  return (
    state.medications.adrenaline.nextEligibleTime ??
    state.medications.adrenaline.nextDueAt
  );
}

function getAdrenalineLateAfterTime(state: ACLSState) {
  const adrenaline = state.medications.adrenaline;
  return (
    adrenaline.lateAfterTime ??
    (adrenaline.lastAdministeredAt !== undefined
      ? adrenaline.lastAdministeredAt + ADRENALINE_LATE_AFTER_MS
      : undefined)
  );
}

function isAdrenalineRepeatDue(state: ACLSState, at: number) {
  const adrenaline = state.medications.adrenaline;
  const nextEligibleTime = getAdrenalineNextEligibleTime(state);

  return (
    canRemindAdrenaline(state) &&
    adrenaline.administeredCount >= 1 &&
    !adrenaline.pendingConfirmation &&
    nextEligibleTime !== undefined &&
    at >= nextEligibleTime
  );
}

function maybeLogLateAdrenalineWarning(state: ACLSState, effects: Effect[], at: number) {
  const adrenaline = state.medications.adrenaline;
  const lateAfterTime = getAdrenalineLateAfterTime(state);

  if (
    state.currentRhythm === "rosc" ||
    state.algorithmBranch === "post_rosc" ||
    state.algorithmBranch === "ended" ||
    adrenaline.administeredCount < 1 ||
    lateAfterTime === undefined ||
    at < lateAfterTime
  ) {
    return;
  }

  if (adrenaline.lateWarningIssuedForDoseCount === adrenaline.administeredCount) {
    return;
  }

  adrenaline.lateWarningIssuedForDoseCount = adrenaline.administeredCount;
  appendTimelineEvent(state, effects, at, "guard_rail_triggered", "system", {
    issue: "epinephrine_late_after_five_minutes",
    medicationId: "adrenaline",
    lastDoseAt: adrenaline.lastAdministeredAt,
    nextEligibleTime: getAdrenalineNextEligibleTime(state),
    lateAfterTime,
    delayedByMs: at - lateAfterTime,
  });
}

function canRecommendAntiarrhythmic(state: ACLSState) {
  const antiarrhythmic = state.medications.antiarrhythmic;
  return antiarrhythmic.recommendedCount < 2 && antiarrhythmic.administeredCount < 2;
}

function clearArrestInterventionsForRosc(state: ACLSState) {
  state.timers = [];
  state.clock = clearCycle(state.clock);
  state.emittedPreCueKeys = [];

  for (const medication of Object.values(state.medications)) {
    medication.pendingConfirmation = false;
    medication.eligible = false;
    if (medication.status === "due_now" || medication.status === "pending_confirmation") {
      medication.status = medication.administeredCount > 0 ? "administered" : "idle";
    }
  }
}

function assertClinicalInvariants(state: ACLSState, effects: Effect[]) {
  const roscActive =
    state.algorithmBranch === "post_rosc" ||
    state.currentRhythm === "rosc" ||
    state.currentStateId.startsWith("pos_rosc");

  if (state.timers.length > 1) {
    throwInvariantViolation(
      state,
      effects,
      Date.now(),
      "multiple_active_timers",
      "O engine ACLS não pode manter mais de um timer ativo ao mesmo tempo",
      { timerCount: state.timers.length }
    );
  }

  if (state.timers.length === 1 && state.clinicalPhase !== "CPR") {
    throwInvariantViolation(
      state,
      effects,
      Date.now(),
      "timer_outside_cpr",
      "Timers clínicos do ACLS só podem existir durante CPR",
      {
        phase: state.clinicalPhase,
        stateId: state.currentStateId,
      }
    );
  }

  if (state.clinicalPhase === "SHOCK") {
    if (state.algorithmBranch !== "shockable" || state.currentRhythm !== "shockable") {
      throwInvariantViolation(
        state,
        effects,
        Date.now(),
        "shock_phase_outside_shockable_branch",
        "A fase de choque só pode existir no ramo chocável",
        {
          branch: state.algorithmBranch,
          rhythm: state.currentRhythm,
        }
      );
    }
  }

  const adrenaline = state.medications.adrenaline;
  const adrenalinePending =
    adrenaline.pendingConfirmation ||
    adrenaline.status === "due_now" ||
    adrenaline.status === "pending_confirmation";
  if (adrenalinePending) {
    if (roscActive) {
      throwInvariantViolation(
        state,
        effects,
        Date.now(),
        "epinephrine_active_after_rosc",
        "A epinefrina deve ser interrompida imediatamente após ROSC"
      );
    }

    if (state.algorithmBranch === "shockable" && state.deliveredShockCount < 2) {
      throwInvariantViolation(
        state,
        effects,
        Date.now(),
        "epinephrine_pending_before_second_shock",
        "No ramo chocável, a epinefrina só pode ficar ativa após o segundo choque",
        { deliveredShockCount: state.deliveredShockCount }
      );
    }
  }

  const antiarrhythmic = state.medications.antiarrhythmic;
  const antiarrhythmicPending =
    antiarrhythmic.pendingConfirmation ||
    antiarrhythmic.status === "due_now" ||
    antiarrhythmic.status === "pending_confirmation";
  if (antiarrhythmicPending) {
    if (roscActive) {
      throwInvariantViolation(
        state,
        effects,
        Date.now(),
        "antiarrhythmic_active_after_rosc",
        "Antiarrítmico deve ser interrompido imediatamente após ROSC"
      );
    }

    if (state.deliveredShockCount < 2) {
      throwInvariantViolation(
        state,
        effects,
        Date.now(),
        "antiarrhythmic_pending_outside_refractory_shockable_flow",
        "Antiarrítmico só pode ficar ativo em VF/TV sem pulso refratária",
        {
          stateId: state.currentStateId,
          deliveredShockCount: state.deliveredShockCount,
        }
      );
    }
  }

  if (antiarrhythmic.administeredCount > 2) {
    throwInvariantViolation(
      state,
      effects,
      Date.now(),
      "antiarrhythmic_above_max_doses",
      "O ACLS padrão não permite mais que duas doses de antiarrítmico",
      { administeredCount: antiarrhythmic.administeredCount }
    );
  }

  if (roscActive && state.timers.length > 0) {
    throwInvariantViolation(
      state,
      effects,
      Date.now(),
      "active_timer_after_rosc",
      "ROSC deve encerrar imediatamente o algoritmo de parada e seus timers",
      { timerCount: state.timers.length }
    );
  }
}

function recommendMedication(
  state: ACLSState,
  effects: Effect[],
  at: number,
  medicationId: "adrenaline" | "antiarrhythmic",
  title: string,
  message: string,
  intervalMs?: number,
  options?: {
    emitSpeak?: boolean;
  }
) {
  const medication = state.medications[medicationId];
  medication.eligible = true;
  medication.status = "due_now";
  medication.pendingConfirmation = true;
  medication.recommendedCount += 1;
  medication.lastRecommendedAt = at;

  if (intervalMs) {
    medication.dueIntervalMs = intervalMs;
  }

  effects.push({
    type: "ALERT",
    key: medicationId === "adrenaline" ? "epinephrine_now" : "antiarrhythmic_now",
    title,
    message,
  });
  if (options?.emitSpeak !== false) {
    effects.push({
      type: "SPEAK",
      key:
        medicationId === "adrenaline"
          ? "epinephrine_now"
          : medication.recommendedCount === 1
            ? "antiarrhythmic_now"
            : "antiarrhythmic_repeat",
      priority: getSpeakPriorityForKey(
        medicationId === "adrenaline"
          ? "epinephrine_now"
          : medication.recommendedCount === 1
            ? "antiarrhythmic_now"
            : "antiarrhythmic_repeat"
      ),
      intensity: medicationId === "adrenaline" ? "high" : "medium",
      message,
    });
  }

  appendTimelineEvent(state, effects, at, "medication_due_now", "system", {
    medicationId,
    count: medication.recommendedCount,
  });

  if (intervalMs && medicationId !== "adrenaline") {
    const nextDueAt = medication.nextDueAt ?? at + intervalMs;
    medication.nextDueAt = nextDueAt;
    effects.push({ type: "LOG", key: "medication_scheduled", message: medicationId });
    appendTimelineEvent(state, effects, at, "medication_scheduled", "system", {
      medicationId,
      nextDueAt,
      intervalMs,
    });
  }
}

function triggerInitialAdrenalineReminder(
  state: ACLSState,
  effects: Effect[],
  at: number,
  options?: {
    emitSpeak?: boolean;
  }
) {
  if (
    !hasInitialNonShockableAdrenalineIndication(state) &&
    !hasInitialShockableAdrenalineIndication(state)
  ) {
    return;
  }

  recommendMedication(
    state,
    effects,
    at,
    "adrenaline",
    "Epinefrina agora",
    "Administrar epinefrina 1 mg IV IO",
    ADRENALINE_EARLIEST_REPEAT_MS,
    { emitSpeak: options?.emitSpeak }
  );
}

function updateAdrenalineReminder(state: ACLSState, effects: Effect[], at: number) {
  if (!isAdrenalineRepeatDue(state, at)) {
    return;
  }

  recommendMedication(
    state,
    effects,
    at,
    "adrenaline",
    "Epinefrina agora",
    "Administrar epinefrina 1 mg IV IO",
    ADRENALINE_EARLIEST_REPEAT_MS
  );
}

function updateAntiarrhythmicReminder(state: ACLSState, effects: Effect[], at: number) {
  if (state.currentStateId !== "rcp_3") {
    return;
  }

  if (!canRecommendAntiarrhythmic(state)) {
    return;
  }

  // Do not recommend a new dose while a previous recommendation is still pending confirmation.
  // This prevents double-announcement when cycling through rcp_3 without administration.
  if (state.medications.antiarrhythmic.pendingConfirmation) {
    return;
  }

  if (state.antiarrhythmicReminderStage === 0) {
    state.antiarrhythmicReminderStage = 1;
    recommendMedication(
      state,
      effects,
      at,
      "antiarrhythmic",
      "Antiarrítmico agora",
      "Considerar antiarrítmico: amiodarona 300 mg IV IO ou lidocaína 1 a 1,5 mg por kg IV IO"
    );
    return;
  }

  if (state.antiarrhythmicReminderStage === 1) {
    state.antiarrhythmicReminderStage = 2;
    recommendMedication(
      state,
      effects,
      at,
      "antiarrhythmic",
      "Antiarrítmico agora",
      "Se persistir ritmo chocável, considerar nova dose de antiarrítmico: amiodarona 150 mg IV IO ou lidocaína 0,5 a 0,75 mg por kg IV IO"
    );
  }
}

function setAlgorithmContextForState(state: ACLSState, stateId: string) {
  if (stateId.startsWith("pos_rosc")) {
    state.algorithmBranch = "post_rosc";
    state.clinicalPhase = "POST_ROSC";
    state.currentRhythm = "rosc";
    return;
  }

  if (stateId === "encerrado") {
    state.algorithmBranch = "ended";
    state.clinicalPhase = "ENDED";
    return;
  }

  if (SHOCKABLE_STATE_IDS.includes(stateId as (typeof SHOCKABLE_STATE_IDS)[number])) {
    state.algorithmBranch = "shockable";
    state.currentRhythm = "shockable";
    state.clinicalPhase = stateId.startsWith("choque_") ? "SHOCK" : "CPR";
    return;
  }

  if (
    NON_SHOCKABLE_STATE_IDS.includes(
      stateId as (typeof NON_SHOCKABLE_STATE_IDS)[number]
    )
  ) {
    state.algorithmBranch = "nonshockable";
    state.currentRhythm = "nonshockable";
    state.clinicalPhase = stateId.startsWith("avaliar_ritmo") ? "RHYTHM_CHECK" : "CPR";
    return;
  }

  if (
    [
      ...PREPARE_RHYTHM_STATE_IDS,
      ...RHYTHM_DECISION_STATE_IDS,
      "avaliar_ritmo",
      "checar_respiracao_pulso",
      "tipo_desfibrilador",
    ].includes(stateId)
  ) {
    state.clinicalPhase = stateId.startsWith("avaliar_ritmo") ? "RHYTHM_CHECK" : "RECOGNITION";
  } else {
    state.clinicalPhase = "RECOGNITION";
  }

  state.algorithmBranch = "recognition";
}

function deriveClinicalIntentForState(state: ACLSState): AclsClinicalIntent {
  if (state.clinicalPhase === "SHOCK") {
    return "deliver_shock";
  }

  if (state.clinicalPhase === "RHYTHM_CHECK") {
    return "analyze_rhythm";
  }

  if (state.clinicalPhase === "CPR") {
    return "perform_cpr";
  }

  const antiarrhythmic = state.medications.antiarrhythmic;
  if (
    canRecommendAntiarrhythmic(state) &&
    antiarrhythmic.pendingConfirmation &&
    ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS.includes(
      state.currentStateId as (typeof ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS)[number]
    )
  ) {
    return "give_antiarrhythmic";
  }

  const adrenaline = state.medications.adrenaline;
  if (adrenaline.pendingConfirmation && canRemindAdrenaline(state)) {
    return "give_epinephrine";
  }

  if (state.clinicalPhase === "POST_ROSC") {
    return "post_rosc_care";
  }

  if (state.clinicalPhase === "ENDED") {
    return "end_protocol";
  }

  return "assess_patient";
}

function deriveClinicalIntentConfidence(
  clinicalIntent: AclsClinicalIntent
): AclsClinicalIntentConfidence {
  switch (clinicalIntent) {
    case "deliver_shock":
    case "analyze_rhythm":
    case "give_epinephrine":
    case "give_antiarrhythmic":
      return "high";
    case "perform_cpr":
      return "medium";
    default:
      return "low";
  }
}

function syncDerivedState(state: ACLSState) {
  state.clinicalIntent = deriveClinicalIntentForState(state);
  state.clinicalIntentConfidence = deriveClinicalIntentConfidence(state.clinicalIntent);
}

function getCurrentCueIdForAclsState(state: ACLSState) {
  const adrenalineDueNow =
    state.medications.adrenaline.pendingConfirmation &&
    (state.medications.adrenaline.status === "due_now" ||
      state.medications.adrenaline.status === "pending_confirmation");

  if (state.currentStateId === "reconhecimento_inicial") {
    return "initial_recognition";
  }

  if (state.currentStateId === "checar_respiracao_pulso") {
    return "assess_patient";
  }

  if (state.currentStateId === "monitorizar_com_pulso") {
    return "pulse_present_monitoring";
  }

  if (state.currentStateId === "inicio") {
    return "start_cpr";
  }

  if (["nao_chocavel_epinefrina", "nao_chocavel_ciclo"].includes(state.currentStateId)) {
    return adrenalineDueNow ? "epinephrine_now" : "start_cpr";
  }

  if (
    PREPARE_RHYTHM_STATE_IDS.includes(
      state.currentStateId as (typeof PREPARE_RHYTHM_STATE_IDS)[number]
    )
  ) {
    return "prepare_rhythm";
  }

  if (
    RHYTHM_DECISION_STATE_IDS.includes(
      state.currentStateId as (typeof RHYTHM_DECISION_STATE_IDS)[number]
    )
  ) {
    return "analyze_rhythm";
  }

  if (state.currentStateId === "tipo_desfibrilador") {
    return "defibrillator_type";
  }

  if (state.currentStateId === "choque_bi_1") {
    return "shock_biphasic_initial";
  }

  if (state.currentStateId === "choque_mono_1") {
    return "shock_monophasic_initial";
  }

  if (state.currentStateId === "choque_2") {
    return "shock_escalated";
  }

  if (state.currentStateId === "choque_3") {
    return "shock_escalated";
  }

  if (state.currentStateId === "nao_chocavel_hs_ts") {
    return "review_hs_ts";
  }

  if (state.currentStateId === "pos_rosc") {
    return "confirm_rosc";
  }

  if (state.currentStateId === "pos_rosc_via_aerea") {
    return "consider_airway";
  }

  if (state.currentStateId === "pos_rosc_hemodinamica") {
    return "post_rosc_hemodynamics";
  }

  if (state.currentStateId === "pos_rosc_ecg") {
    return "post_rosc_ecg";
  }

  if (state.currentStateId === "pos_rosc_neurologico") {
    return "post_rosc_neuro";
  }

  if (["pos_rosc_destino", "pos_rosc_concluido"].includes(state.currentStateId)) {
    return "post_rosc_care";
  }

  if (state.currentStateId === "encerrado") {
    return "end_protocol";
  }

  return state.currentStateId;
}

function getDocumentationActionsForAclsState(state: ACLSState): AclsDocumentationAction[] {
  const actions: AclsDocumentationAction[] = [];

  if (state.currentStateId.startsWith("choque_")) {
    actions.push({ id: "shock", label: "Registrar choque" });
  }

  const adrenaline = state.medications.adrenaline;
  if (adrenaline.pendingConfirmation && canRemindAdrenaline(state)) {
    actions.push({ id: "adrenaline", label: "Registrar epinefrina" });
  }

  const antiarrhythmic = state.medications.antiarrhythmic;
  if (
    canRecommendAntiarrhythmic(state) &&
    antiarrhythmic.pendingConfirmation &&
    ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS.includes(
      state.currentStateId as (typeof ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS)[number]
    )
  ) {
    actions.push({ id: "antiarrhythmic", label: "Registrar antiarrítmico" });
  }

  return actions;
}

function keepOnlyFirstSpeakEffect(effects: Effect[], fromIndex: number) {
  const speakPriorityWeight: Record<
    Extract<Effect, { type: "SPEAK" }>["priority"],
    number
  > = {
    critical: 4,
    main: 3,
    precue: 2,
    secondary: 1,
  };

  let selectedSpeakIndex = -1;
  let selectedSpeakWeight = -1;

  for (let index = fromIndex; index < effects.length; index += 1) {
    const effect = effects[index];
    if (effect?.type !== "SPEAK") {
      continue;
    }

    const weight = speakPriorityWeight[effect.priority];
    if (weight > selectedSpeakWeight) {
      selectedSpeakWeight = weight;
      selectedSpeakIndex = index;
    }
  }

  if (selectedSpeakIndex === -1) {
    return;
  }

  const preserved = effects.filter((effect, index) => {
    if (effect.type !== "SPEAK") {
      return true;
    }

    if (index < fromIndex) {
      return true;
    }

    return index === selectedSpeakIndex;
  });

  effects.length = 0;
  effects.push(...preserved);
}

function handleStateEntry(state: ACLSState, effects: Effect[], at: number, stateId: string) {
  const stateEntryEffectStartIndex = effects.length;
  setAlgorithmContextForState(state, stateId);

  if (
    state.medications.adrenaline.pendingConfirmation &&
    state.medications.adrenaline.status === "due_now" &&
    state.medications.adrenaline.lastRecommendedAt !== at
  ) {
    state.medications.adrenaline.status = "pending_confirmation";
  }

  if (
    state.medications.antiarrhythmic.pendingConfirmation &&
    state.medications.antiarrhythmic.status === "due_now" &&
    state.medications.antiarrhythmic.lastRecommendedAt !== at
  ) {
    state.medications.antiarrhythmic.status = "pending_confirmation";
  }

  if (stateId === "inicio" && state.initialCprStartedAt === undefined) {
    state.initialCprStartedAt = at;
  }

  if (stateId === "nao_chocavel_epinefrina") {
    triggerInitialAdrenalineReminder(state, effects, at, { emitSpeak: true });
  } else if (stateId === "rcp_2") {
    triggerInitialAdrenalineReminder(state, effects, at, { emitSpeak: true });
  } else {
    updateAdrenalineReminder(state, effects, at);
  }

  updateAntiarrhythmicReminder(state, effects, at);

  if (state.clinicalPhase === "SHOCK") {
    emitPreCue(state, effects, at, "prepare_shock", "transition");
  }

  if (
    PREPARE_RHYTHM_STATE_IDS.includes(stateId as (typeof PREPARE_RHYTHM_STATE_IDS)[number])
  ) {
    effects.push({
      type: "SPEAK",
      key: "prepare_rhythm",
      priority: getSpeakPriorityForKey("prepare_rhythm"),
      intensity: "medium",
      message: "Pausar RCP. Avaliar ritmo.",
    });
  } else if (
    RHYTHM_DECISION_STATE_IDS.includes(stateId as (typeof RHYTHM_DECISION_STATE_IDS)[number])
  ) {
    effects.push({
      type: "SPEAK",
      key: "analyze_rhythm",
      priority: getSpeakPriorityForKey("analyze_rhythm"),
      intensity: "medium",
      message: "Ritmo? Chocável, não chocável ou ROSC?",
    });
  } else {
    // State-specific orientation cues for states not covered by medication/rhythm effects above.
    // Priority ordering: critical (4) > main (3) > precue (2) > secondary (1).
    // keepOnlyFirstSpeakEffect will keep the highest-priority speak when multiple compete.
    // For CPR/fallback states, "secondary" ensures medication speaks always win when present.
    switch (stateId) {
      // --- Recognition / initial assessment ---
      case "reconhecimento_inicial":
        effects.push({ type: "SPEAK", key: "initial_recognition", priority: "main", intensity: "medium" });
        break;
      case "checar_respiracao_pulso":
        effects.push({ type: "SPEAK", key: "assess_patient", priority: "main", intensity: "medium" });
        break;
      case "monitorizar_com_pulso":
        effects.push({ type: "SPEAK", key: "pulse_present_monitoring", priority: "main", intensity: "medium" });
        break;
      // --- CPR start ---
      case "inicio":
        effects.push({ type: "SPEAK", key: "start_cpr", priority: "main", intensity: "high" });
        break;
      // --- Defibrillator selection ---
      case "tipo_desfibrilador":
        effects.push({ type: "SPEAK", key: "defibrillator_type", priority: "main", intensity: "medium" });
        break;
      // --- First shock ---
      case "choque_bi_1":
        effects.push({ type: "SPEAK", key: "shock_biphasic_initial", priority: "critical", intensity: "high" });
        break;
      case "choque_mono_1":
        effects.push({ type: "SPEAK", key: "shock_monophasic_initial", priority: "critical", intensity: "high" });
        break;
      // --- Rhythm evaluation prep (pause CPR cue) ---
      case "avaliar_ritmo_preparo":
      case "avaliar_ritmo_2_preparo":
      case "avaliar_ritmo_3_preparo":
      case "avaliar_ritmo_nao_chocavel_preparo":
        effects.push({ type: "SPEAK", key: "prepare_rhythm", priority: "main", intensity: "medium" });
        break;
      // --- Rhythm evaluation (prompt rhythm decision) ---
      case "avaliar_ritmo":
      case "avaliar_ritmo_2":
      case "avaliar_ritmo_3":
      case "avaliar_ritmo_nao_chocavel":
        effects.push({ type: "SPEAK", key: "analyze_rhythm", priority: "critical", intensity: "medium" });
        break;
      // --- Subsequent shocks ---
      case "choque_2":
      case "choque_3":
        effects.push({ type: "SPEAK", key: "shock_escalated", priority: "critical", intensity: "high" });
        break;
      // --- CPR cycles (secondary so medication speaks take precedence) ---
      case "rcp_1":
        effects.push({ type: "SPEAK", key: "resume_cpr", priority: "secondary", intensity: "medium" });
        break;
      // rcp_2: epinephrine speak (main) fires from medication tracker; this is fallback.
      case "rcp_2":
        effects.push({ type: "SPEAK", key: "resume_cpr", priority: "secondary", intensity: "medium" });
        break;
      case "rcp_3":
        // Antiarrhythmic speak (main) fires if indicated; this is fallback orientation.
        effects.push({ type: "SPEAK", key: "resume_cpr", priority: "secondary", intensity: "medium" });
        break;
      // --- Non-shockable initial (epinephrine speak fires from tracker; this is fallback) ---
      case "nao_chocavel_epinefrina":
        effects.push({ type: "SPEAK", key: "start_cpr_nonshockable", priority: "secondary", intensity: "medium" });
        break;
      // --- Non-shockable CPR cycles (secondary so epinephrine speaks take precedence) ---
      case "nao_chocavel_ciclo":
        effects.push({ type: "SPEAK", key: "resume_cpr", priority: "secondary", intensity: "medium" });
        break;
      // --- Non-shockable HS/TS reminder ---
      case "nao_chocavel_hs_ts":
        effects.push({ type: "SPEAK", key: "review_hs_ts", priority: "main", intensity: "medium" });
        break;
      // --- ROSC confirmed ---
      case "pos_rosc":
        effects.push({ type: "SPEAK", key: "confirm_rosc", priority: "critical", intensity: "high" });
        break;
      // --- Post-ROSC care phases ---
      case "pos_rosc_via_aerea":
        effects.push({ type: "SPEAK", key: "consider_airway", priority: "secondary", intensity: "medium" });
        break;
      case "pos_rosc_hemodinamica":
        effects.push({ type: "SPEAK", key: "post_rosc_hemodynamics", priority: "secondary", intensity: "medium" });
        break;
      case "pos_rosc_ecg":
        effects.push({ type: "SPEAK", key: "post_rosc_ecg", priority: "secondary", intensity: "medium" });
        break;
      case "pos_rosc_neurologico":
        effects.push({ type: "SPEAK", key: "post_rosc_neuro", priority: "secondary", intensity: "medium" });
        break;
      case "pos_rosc_destino":
        effects.push({ type: "SPEAK", key: "post_rosc_care", priority: "secondary", intensity: "medium" });
        break;
      case "pos_rosc_concluido":
        effects.push({ type: "SPEAK", key: "post_rosc_care", priority: "secondary", intensity: "medium" });
        break;
      // --- Protocol end ---
      case "encerrado":
        effects.push({ type: "SPEAK", key: "end_protocol", priority: "secondary", intensity: "medium" });
        break;
    }
  }

  const enteredState = resolveDynamicAclsProtocolState(state, stateId);
  if (enteredState.type === "action" && enteredState.timer) {
    const activeTimer = state.timers[0];
    if (!activeTimer || activeTimer.stateId !== stateId || activeTimer.completed) {
      const timerStartedAt =
        stateId === "nao_chocavel_epinefrina" && state.initialCprStartedAt !== undefined
          ? state.initialCprStartedAt
          : at;
      startTimer(state, effects, timerStartedAt, enteredState.timer, stateId, enteredState.next);
      if (stateId === "nao_chocavel_epinefrina") {
        state.initialCprStartedAt = undefined;
      }
    }
  }

  keepOnlyFirstSpeakEffect(effects, stateEntryEffectStartIndex);

  syncDerivedState(state);
}

function transitionToState(
  state: ACLSState,
  effects: Effect[],
  at: number,
  stateId: string,
  reason: string,
  data?: Record<string, string>
) {
  if (stateId.startsWith("pos_rosc")) {
    clearArrestInterventionsForRosc(state);
  }

  state.currentStateId = stateId;
  state.stateEntrySequence += 1;
  state.emittedPreCueKeys = [];
  appendTimelineEvent(state, effects, at, "state_transitioned", "system", {
    reason,
    to: stateId,
    ...data,
  });

  if (stateId === "pos_rosc") {
    appendTimelineEvent(state, effects, at, "rosc", "system");
  }

  if (stateId === "encerrado") {
    appendTimelineEvent(state, effects, at, "encerramento", "system");
  }

  handleStateEntry(state, effects, at, stateId);
}

function toReducerResult(state: ACLSState, effects: Effect[], at?: number): ACLSReducerResult {
  if (at !== undefined) {
    maybeLogLateAdrenalineWarning(state, effects, at);
  }
  syncDerivedState(state);
  assertClinicalInvariants(state, effects);
  return { state, effects };
}

function resolveShockStateFromHistory(state: ACLSState) {
  if (state.shockableFlowStep === "not_started" && !state.defibrillatorType) {
    return "tipo_desfibrilador";
  }

  if (state.shockableFlowStep === "not_started" || state.shockableFlowStep === "shock_1") {
    return state.defibrillatorType === "monofasico" ? "choque_mono_1" : "choque_bi_1";
  }

  if (state.shockableFlowStep === "cpr_1" || state.shockableFlowStep === "shock_2") {
    return "choque_2";
  }

  return "choque_3";
}

function advanceShockableFlowAfterShock(state: ACLSState) {
  switch (state.shockableFlowStep) {
    case "not_started":
    case "shock_1":
      state.shockableFlowStep = "cpr_1";
      return;
    case "cpr_1":
    case "shock_2":
      state.shockableFlowStep = "cpr_2_with_epinephrine";
      return;
    case "cpr_2_with_epinephrine":
    case "shock_3":
      state.shockableFlowStep = "cpr_3_with_antiarrhythmic";
      return;
    case "cpr_3_with_antiarrhythmic":
      return;
  }
}

function resolveShockableNextStateFromRhythmCheck(state: ACLSState) {
  switch (state.shockableFlowStep) {
    case "not_started":
    case "shock_1":
      state.shockableFlowStep = "shock_1";
      return !state.defibrillatorType ? "tipo_desfibrilador" : resolveShockStateFromHistory(state);
    case "cpr_1":
    case "shock_2":
      state.shockableFlowStep = "shock_2";
      return "choque_2";
    case "cpr_2_with_epinephrine":
    case "shock_3":
    case "cpr_3_with_antiarrhythmic":
      state.shockableFlowStep = "shock_3";
      return "choque_3";
  }
}

function resolveCprStateAfterShock(state: ACLSState) {
  switch (state.shockableFlowStep) {
    case "cpr_1":
      return "rcp_1";
    case "cpr_2_with_epinephrine":
      return "rcp_2";
    case "cpr_3_with_antiarrhythmic":
      return "rcp_3";
    default:
      throw new Error("Choque sem fase de CPR subsequente válida");
  }
}

function validateExecutionAllowed(
  state: ACLSState,
  effects: Effect[],
  actionId: AclsDocumentationAction["id"],
  at: number
) {
  if (actionId === "shock" && state.clinicalPhase !== "SHOCK") {
    throwInvariantViolation(
      state,
      effects,
      at,
      "shock_outside_shock_phase",
      "Choque só pode ser registrado na fase de choque",
      { phase: state.clinicalPhase }
    );
  }

  if (
    actionId === "shock" &&
    (state.algorithmBranch !== "shockable" || state.currentRhythm !== "shockable")
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "shock_outside_shockable_rhythm",
      "Desfibrilação só pode ocorrer em ritmo chocável",
      {
        branch: state.algorithmBranch,
        rhythm: state.currentRhythm,
      }
    );
  }

  if (
    actionId === "adrenaline" &&
    !["cpr_2_with_epinephrine", "cpr_3_with_antiarrhythmic"].includes(state.shockableFlowStep) &&
    state.algorithmBranch !== "nonshockable"
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "epinephrine_outside_eligible_flow",
      "Epinefrina não disponível nesta fase do fluxo ACLS",
      {
        phase: state.clinicalPhase,
        branch: state.algorithmBranch,
        shockableFlowStep: state.shockableFlowStep,
      }
    );
  }

  if (actionId === "adrenaline" && state.clinicalPhase !== "CPR") {
    throwInvariantViolation(
      state,
      effects,
      at,
      "epinephrine_outside_cpr",
      "Epinefrina só pode ser registrada durante CPR",
      { phase: state.clinicalPhase }
    );
  }

  if (actionId === "adrenaline" && state.currentRhythm === "rosc") {
    throwInvariantViolation(
      state,
      effects,
      at,
      "epinephrine_after_rosc",
      "Epinefrina deve parar imediatamente após ROSC"
    );
  }

  if (
    actionId === "adrenaline" &&
    state.algorithmBranch === "shockable" &&
    state.deliveredShockCount < 2
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "epinephrine_before_initial_defibrillation_attempts",
      "No ritmo chocável, a epinefrina só pode ser registrada após as tentativas iniciais de desfibrilação",
      { deliveredShockCount: state.deliveredShockCount }
    );
  }

  if (
    actionId === "adrenaline" &&
    state.medications.adrenaline.lastAdministeredAt !== undefined &&
    at - state.medications.adrenaline.lastAdministeredAt < ADRENALINE_EARLIEST_REPEAT_MS
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "epinephrine_before_min_interval",
      "Epinefrina não pode ser repetida antes de 3 minutos",
      {
        elapsedMs: at - state.medications.adrenaline.lastAdministeredAt,
      }
    );
  }

  if (
    actionId === "adrenaline" &&
    state.medications.adrenaline.lastAdministeredCycleCount === state.cycleCount
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "epinephrine_duplicate_same_cycle",
      "Epinefrina não pode ser registrada duas vezes no mesmo ciclo",
      { cycleCount: state.cycleCount }
    );
  }

  if (
    actionId === "antiarrhythmic" &&
    state.shockableFlowStep !== "cpr_3_with_antiarrhythmic"
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "antiarrhythmic_outside_refractory_shockable_flow",
      "Antiarrítmico só pode ser registrado após o terceiro choque",
      {
        phase: state.clinicalPhase,
        shockableFlowStep: state.shockableFlowStep,
      }
    );
  }

  if (
    actionId === "antiarrhythmic" &&
    (state.algorithmBranch !== "shockable" || state.currentRhythm !== "shockable")
  ) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "antiarrhythmic_outside_shockable_rhythm",
      "Antiarrítmico só pode ser usado em VF/TV sem pulso refratária",
      {
        branch: state.algorithmBranch,
        rhythm: state.currentRhythm,
      }
    );
  }

  if (actionId === "antiarrhythmic" && state.deliveredShockCount < 2) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "antiarrhythmic_before_refractory_threshold",
      "Antiarrítmico não pode ser registrado antes de 2 choques",
      { deliveredShockCount: state.deliveredShockCount }
    );
  }

  if (actionId === "antiarrhythmic" && state.currentRhythm === "rosc") {
    throwInvariantViolation(
      state,
      effects,
      at,
      "antiarrhythmic_after_rosc",
      "Antiarrítmico deve parar imediatamente após ROSC"
    );
  }

  if (actionId === "antiarrhythmic" && state.medications.antiarrhythmic.administeredCount >= 2) {
    throwInvariantViolation(
      state,
      effects,
      at,
      "antiarrhythmic_max_doses_reached",
      "Antiarrítmico já atingiu o máximo de duas doses no fluxo ACLS padrão",
      {
        phase: state.clinicalPhase,
        administeredCount: state.medications.antiarrhythmic.administeredCount,
      }
    );
  }
}

function normalizeInput(input: string) {
  return input.trim().toLowerCase();
}

function resolveNextStateId(options: Record<string, string> | undefined, input: string) {
  if (!options) {
    return undefined;
  }

  const normalizedInput = normalizeInput(input);

  for (const [key, nextStateId] of Object.entries(options)) {
    if (normalizeInput(key) === normalizedInput) {
      return nextStateId;
    }
  }

  return undefined;
}

function reduceAclsState(state: ACLSState, event: ACLSEvent): ACLSReducerResult {
  if (event.type === "session_reset") {
    return toReducerResult(createInitialAclsState(), [], undefined);
  }

  const nextState = cloneAclsState(state);
  const effects: Effect[] = [];

  switch (event.type) {
    case "action_confirmed": {
      const current = resolveDynamicAclsProtocolState(nextState);
      appendTimelineEvent(nextState, effects, event.at, "action_confirmed", "user", {
        stateId: nextState.currentStateId,
      });

      if (nextState.protocolStartedAt === undefined) {
        nextState.protocolStartedAt = event.at;
        appendTimelineEvent(nextState, effects, event.at, "protocol_started", "system");
      }

      if (current.type !== "action") {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: "invalid_action_confirmation_state",
          stateId: nextState.currentStateId,
        });
        throw new Error("Confirmação inválida para o estado atual");
      }

      if (current.timer) {
        const activeTimer = nextState.timers[0];
        if (!activeTimer || activeTimer.stateId !== nextState.currentStateId || activeTimer.completed) {
          startTimer(
            nextState,
            effects,
            event.at,
            current.timer,
            nextState.currentStateId,
            current.next
          );
        }
        return toReducerResult(nextState, effects, event.at);
      }

      if (current.next) {
        transitionToState(nextState, effects, event.at, current.next, "STATE_TRANSITIONED");
      }

      return toReducerResult(nextState, effects, event.at);
    }
    case "question_answered": {
      const current = resolveDynamicAclsProtocolState(nextState);
      if (current.type !== "question") {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: "invalid_question_answer_state",
          stateId: nextState.currentStateId,
        });
        throw new Error("Resposta inválida para o estado atual");
      }

      const normalizedInput = normalizeInput(event.input);
      const nextProtocolStateId = resolveNextStateId(current.options, normalizedInput);

      if (!nextProtocolStateId) {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: "invalid_question_answer",
          input: normalizedInput,
        });
        throw new Error(`Resposta inválida: ${event.input}`);
      }

      if (nextState.currentStateId === "tipo_desfibrilador") {
        nextState.defibrillatorType =
          normalizedInput === "monofasico" ? "monofasico" : "bifasico";
      }

      if (normalizedInput === "nao_chocavel") {
        nextState.currentRhythm = "nonshockable";
        nextState.algorithmBranch = "nonshockable";
      } else if (normalizedInput === "chocavel") {
        nextState.currentRhythm = "shockable";
        nextState.algorithmBranch = "shockable";
        if (nextState.currentStateId === "avaliar_ritmo" || nextState.currentStateId === "avaliar_ritmo_nao_chocavel") {
          nextState.initialCprStartedAt = undefined;
        }
        // Defer epinephrine when entering the shockable branch before 2 shocks:
        // ACLS guidelines state epinephrine should not be given before 2 defibrillation
        // attempts. Clear pending state to prevent invariant violations.
        const adrenalineTracker = nextState.medications.adrenaline;
        if (
          (adrenalineTracker.pendingConfirmation ||
            adrenalineTracker.status === "due_now" ||
            adrenalineTracker.status === "pending_confirmation") &&
          nextState.deliveredShockCount < 2
        ) {
          adrenalineTracker.pendingConfirmation = false;
          adrenalineTracker.eligible = false;
          if (
            adrenalineTracker.status === "due_now" ||
            adrenalineTracker.status === "pending_confirmation"
          ) {
            adrenalineTracker.status =
              adrenalineTracker.administeredCount > 0 ? "administered" : "idle";
          }
          appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "system", {
            issue: "epinephrine_deferred_on_shockable_transition",
            deliveredShockCount: nextState.deliveredShockCount,
            administeredCount: adrenalineTracker.administeredCount,
          });
        }
      } else if (normalizedInput === "rosc") {
        nextState.currentRhythm = "rosc";
        nextState.algorithmBranch = "post_rosc";
        nextState.initialCprStartedAt = undefined;
      }

      const resolvedNextStateId =
        normalizedInput === "chocavel"
          ? resolveShockableNextStateFromRhythmCheck(nextState)
          : nextProtocolStateId;

      appendTimelineEvent(nextState, effects, event.at, "question_answered", "user", {
        input: normalizedInput,
      });
      transitionToState(nextState, effects, event.at, resolvedNextStateId, "QUESTION_TRANSITIONED", {
        input: normalizedInput,
      });

      return toReducerResult(nextState, effects, event.at);
    }
    case "execution_recorded": {
      if (event.actionId === "advanced_airway") {
        if (nextState.advancedAirwaySecuredAt !== undefined) {
          appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
            issue: "duplicate_advanced_airway",
            actionId: event.actionId,
          });
          throw new Error("Intubação já registrada neste caso");
        }

        nextState.advancedAirwaySecuredAt = event.at;
        appendTimelineEvent(nextState, effects, event.at, "advanced_airway_secured", "user", {
          airwayType: "intubacao_orotraqueal",
        });
        return toReducerResult(nextState, effects, event.at);
      }

      const availableAction = getDocumentationActionsForAclsState(nextState).find(
        (action) => action.id === event.actionId
      );

      if (!availableAction) {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: "action_not_available",
          actionId: event.actionId,
        });
        throw new Error("Registro não disponível para o estado atual");
      }

      const executionKey = `${nextState.stateEntrySequence}:${event.actionId}`;
      if (nextState.documentedExecutionKeys.includes(executionKey)) {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: "duplicate_confirmation",
          actionId: event.actionId,
        });
        throw new Error("Conduta já registrada neste ciclo");
      }

      nextState.documentedExecutionKeys.push(executionKey);
      validateExecutionAllowed(nextState, effects, event.actionId, event.at);

      if (event.actionId === "shock") {
        nextState.deliveredShockCount += 1;
        nextState.lastShockAt = event.at;
        advanceShockableFlowAfterShock(nextState);
        appendTimelineEvent(nextState, effects, event.at, "shock_applied", "user", {
          count: nextState.deliveredShockCount,
          defibrillatorType: nextState.defibrillatorType,
          shockableFlowStep: nextState.shockableFlowStep,
        });
        transitionToState(
          nextState,
          effects,
          event.at,
          resolveCprStateAfterShock(nextState),
          "SHOCK_AUTO_RESUME_CPR"
        );
        return toReducerResult(nextState, effects, event.at);
      }

      if (event.actionId === "adrenaline") {
        const medication = nextState.medications.adrenaline;
        medication.administeredCount += 1;
        medication.lastAdministeredAt = event.at;
        medication.lastAdministeredCycleCount = nextState.cycleCount;
        medication.pendingConfirmation = false;
        medication.status = "administered";
        medication.nextEligibleTime = event.at + ADRENALINE_EARLIEST_REPEAT_MS;
        medication.lateAfterTime = event.at + ADRENALINE_LATE_AFTER_MS;
        medication.lateWarningIssuedForDoseCount = undefined;
        medication.nextDueAt = medication.nextEligibleTime;
        nextState.clock = {
          ...nextState.clock,
          lastEpinephrineTime: event.at,
        };
        effects.push({ type: "LOG", key: "medication_scheduled", message: "adrenaline" });
        appendTimelineEvent(nextState, effects, event.at, "medication_administered", "user", {
          medicationId: "adrenaline",
          count: medication.administeredCount,
          doseLabel: getMedicationDoseLabel("adrenaline", medication.administeredCount),
        });
        appendTimelineEvent(nextState, effects, event.at, "medication_scheduled", "system", {
          medicationId: "adrenaline",
          nextDueAt: medication.nextEligibleTime,
          intervalMs: ADRENALINE_EARLIEST_REPEAT_MS,
        });
        return toReducerResult(nextState, effects, event.at);
      }

      const medication = nextState.medications.antiarrhythmic;
      medication.administeredCount += 1;
      medication.lastAdministeredAt = event.at;
      medication.pendingConfirmation = false;
      medication.status = medication.administeredCount >= 2 ? "completed" : "administered";
      appendTimelineEvent(nextState, effects, event.at, "medication_administered", "user", {
        medicationId: "antiarrhythmic",
        count: medication.administeredCount,
        doseLabel: getMedicationDoseLabel("antiarrhythmic", medication.administeredCount),
      });
      return toReducerResult(nextState, effects, event.at);
    }
    case "timer_elapsed": {
      const activeTimer = nextState.timers[0];

      if (!activeTimer || activeTimer.id !== event.timerId || activeTimer.completed) {
        return toReducerResult(nextState, effects, event.at);
      }

      if (!isCycleComplete(nextState.clock, event.at)) {
        return toReducerResult(nextState, effects, event.at);
      }

      activeTimer.completed = true;
      nextState.timers = [];
      nextState.clock = clearCycle(nextState.clock);
      nextState.cycleCount += 1;

      appendTimelineEvent(nextState, effects, event.at, "timer_completed", "system", {
        stateId: activeTimer.stateId,
        nextStateId: activeTimer.nextStateId,
      });
      appendTimelineEvent(nextState, effects, event.at, "reassessment_due", "system", {
        stateId: activeTimer.stateId,
      });

      if (activeTimer.nextStateId) {
        transitionToState(nextState, effects, event.at, activeTimer.nextStateId, "STATE_AUTO_ADVANCED");
      }

      return toReducerResult(nextState, effects, event.at);
    }
    case "medication_reminder_due": {
      if (event.medicationId === "adrenaline") {
        updateAdrenalineReminder(nextState, effects, event.at);
      }
      return toReducerResult(nextState, effects, event.at);
    }
    case "reversible_cause_status_updated": {
      const record = nextState.reversibleCauseRecords[event.causeId];
      if (!record) {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: `reversible_cause_not_found:${event.causeId}`,
        });
        throw new Error(`Causa reversível inválida: ${event.causeId}`);
      }

      record.status = event.status;
      record.suspected = event.status === "suspeita";
      if (event.status === "abordada") {
        record.actionsTaken = record.actions.length > 0 ? [...record.actions] : record.actionsTaken;
      }

      appendTimelineEvent(nextState, effects, event.at, "reversible_cause_updated", "user", {
        causeId: event.causeId,
        status: event.status,
      });
      return toReducerResult(nextState, effects, event.at);
    }
    case "reversible_cause_notes_updated": {
      const record = nextState.reversibleCauseRecords[event.causeId];
      if (!record) {
        appendTimelineEvent(nextState, effects, event.at, "guard_rail_triggered", "user", {
          issue: `reversible_cause_not_found:${event.causeId}`,
        });
        throw new Error(`Causa reversível inválida: ${event.causeId}`);
      }

      record[event.field] = event.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      appendTimelineEvent(nextState, effects, event.at, "reversible_cause_updated", "user", {
        causeId: event.causeId,
        field: event.field,
        count: record[event.field].length,
      });
      return toReducerResult(nextState, effects, event.at);
    }
    case "voice_command_logged": {
      appendTimelineEvent(nextState, effects, event.at, "voice_command", "user", {
        transcript: event.transcript,
        intent: event.intent,
        confidence: event.confidence,
        outcome: event.outcome,
        actionTaken: event.actionTaken,
        commands: event.commands,
        errorCategory: event.errorCategory,
      });
      return toReducerResult(nextState, effects, event.at);
    }
    case "assistant_insight_logged": {
      appendTimelineEvent(nextState, effects, event.at, "assistant_insight", "system", {
        kind: event.kind,
        summary: event.summary,
        stateId: event.stateId,
        ...event.details,
      });
      return toReducerResult(nextState, effects, event.at);
    }
    case "pre_cue_due": {
      if (event.source === "time") {
        const activeTimer = nextState.timers[0];
        if (!activeTimer || activeTimer.id !== event.timerId || activeTimer.completed) {
          return toReducerResult(nextState, effects, event.at);
        }
      }

      emitPreCue(nextState, effects, event.at, event.kind, event.source);
      return toReducerResult(nextState, effects, event.at);
    }
    default: {
      return toReducerResult(nextState, effects, undefined);
    }
  }
}

export type { ACLSEvent, ACLSReducerResult, ACLSState, ACLSTimer, Effect };
export {
  ADRENALINE_EARLIEST_REPEAT_MS,
  ADRENALINE_LATE_AFTER_MS,
  createInitialAclsState,
  getCurrentCueIdForAclsState,
  getDocumentationActionsForAclsState,
  reduceAclsState,
  resolveDynamicAclsProtocolState,
};
