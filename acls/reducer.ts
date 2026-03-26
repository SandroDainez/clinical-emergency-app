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

const ADRENALINE_REMINDER_INTERVAL_MS = 4 * 60 * 1000;
const ADRENALINE_ELIGIBLE_STATE_IDS = [
  "nao_chocavel_epinefrina",
  "nao_chocavel_ciclo",
  "nao_chocavel_hs_ts",
  "rcp_2",
  "rcp_3",
  "avaliar_ritmo_nao_chocavel",
  "avaliar_ritmo_3",
] as const;
const ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS = ["rcp_3", "avaliar_ritmo_3"] as const;
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
  "avaliar_ritmo_nao_chocavel",
  "nao_chocavel_hs_ts",
] as const;

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

function canRemindAdrenaline(state: ACLSState) {
  return ADRENALINE_ELIGIBLE_STATE_IDS.includes(
    state.currentStateId as (typeof ADRENALINE_ELIGIBLE_STATE_IDS)[number]
  );
}

function recommendMedication(
  state: ACLSState,
  effects: Effect[],
  at: number,
  medicationId: "adrenaline" | "antiarrhythmic",
  title: string,
  message: string,
  intervalMs?: number
) {
  const medication = state.medications[medicationId];
  medication.eligible = true;
  medication.status = "due_now";
  medication.pendingConfirmation = true;
  medication.recommendedCount += 1;
  medication.lastRecommendedAt = at;

  if (intervalMs) {
    medication.dueIntervalMs = intervalMs;
    medication.nextDueAt = at + intervalMs;
  }

  effects.push({
    type: "ALERT",
    key: medicationId === "adrenaline" ? "epinephrine_now" : "antiarrhythmic_now",
    title,
    message,
  });
  effects.push({
    type: "SPEAK",
    key:
      medicationId === "adrenaline"
        ? "epinephrine_now"
        : medication.recommendedCount === 1
          ? "antiarrhythmic_now"
          : "antiarrhythmic_repeat",
    intensity: medicationId === "adrenaline" ? "high" : "medium",
    message,
  });

  appendTimelineEvent(state, effects, at, "medication_due_now", "system", {
    medicationId,
    count: medication.recommendedCount,
  });

  if (intervalMs) {
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

function triggerInitialAdrenalineReminder(state: ACLSState, effects: Effect[], at: number) {
  if (state.medications.adrenaline.recommendedCount > 0) {
    return;
  }

  recommendMedication(
    state,
    effects,
    at,
    "adrenaline",
    "Epinefrina agora",
    "Administrar epinefrina 1 mg IV IO",
    ADRENALINE_REMINDER_INTERVAL_MS
  );
}

function updateAdrenalineReminder(state: ACLSState, effects: Effect[], at: number) {
  const adrenaline = state.medications.adrenaline;

  if (!canRemindAdrenaline(state) || !adrenaline.nextDueAt || at < adrenaline.nextDueAt) {
    return;
  }

  recommendMedication(
    state,
    effects,
    at,
    "adrenaline",
    "Epinefrina agora",
    "Administrar epinefrina 1 mg IV IO",
    ADRENALINE_REMINDER_INTERVAL_MS
  );
}

function updateAntiarrhythmicReminder(state: ACLSState, effects: Effect[], at: number) {
  if (state.currentStateId !== "rcp_3") {
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
      "avaliar_ritmo",
      "avaliar_ritmo_2",
      "avaliar_ritmo_3",
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
  if (["reconhecimento_inicial", "checar_respiracao_pulso"].includes(state.currentStateId)) {
    return "assess_patient";
  }

  if (state.currentStateId === "inicio") {
    return "start_cpr";
  }

  if (["nao_chocavel_epinefrina", "nao_chocavel_ciclo"].includes(state.currentStateId)) {
    return "start_cpr_nonshockable";
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
    antiarrhythmic.pendingConfirmation &&
    ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS.includes(
      state.currentStateId as (typeof ANTIARRHYTHMIC_ELIGIBLE_STATE_IDS)[number]
    )
  ) {
    actions.push({ id: "antiarrhythmic", label: "Registrar antiarrítmico" });
  }

  return actions;
}

function handleStateEntry(state: ACLSState, effects: Effect[], at: number, stateId: string) {
  setAlgorithmContextForState(state, stateId);

  if (stateId === "inicio" && state.initialCprStartedAt === undefined) {
    state.initialCprStartedAt = at;
  }

  if (stateId === "nao_chocavel_epinefrina" || stateId === "rcp_2") {
    triggerInitialAdrenalineReminder(state, effects, at);
  } else {
    updateAdrenalineReminder(state, effects, at);
  }

  updateAntiarrhythmicReminder(state, effects, at);

  if (state.clinicalPhase === "SHOCK") {
    emitPreCue(state, effects, at, "prepare_shock", "transition");
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

function toReducerResult(state: ACLSState, effects: Effect[]): ACLSReducerResult {
  syncDerivedState(state);
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

function validateExecutionAllowed(
  state: ACLSState,
  effects: Effect[],
  actionId: AclsDocumentationAction["id"],
  at: number
) {
  if (actionId === "shock" && state.clinicalPhase !== "SHOCK") {
    appendTimelineEvent(state, effects, at, "guard_rail_triggered", "user", {
      issue: "shock_outside_shock_phase",
      phase: state.clinicalPhase,
    });
    throw new Error("Choque só pode ser registrado na fase de choque");
  }

  if (
    actionId === "adrenaline" &&
    !["cpr_2_with_epinephrine", "cpr_3_with_antiarrhythmic"].includes(state.shockableFlowStep) &&
    state.algorithmBranch !== "nonshockable"
  ) {
    appendTimelineEvent(state, effects, at, "guard_rail_triggered", "user", {
      issue: "epinephrine_outside_eligible_flow",
      phase: state.clinicalPhase,
      branch: state.algorithmBranch,
      shockableFlowStep: state.shockableFlowStep,
    });
    throw new Error("Epinefrina não disponível nesta fase do fluxo ACLS");
  }

  if (
    actionId === "antiarrhythmic" &&
    state.shockableFlowStep !== "cpr_3_with_antiarrhythmic"
  ) {
    appendTimelineEvent(state, effects, at, "guard_rail_triggered", "user", {
      issue: "antiarrhythmic_outside_refractory_shockable_flow",
      phase: state.clinicalPhase,
      shockableFlowStep: state.shockableFlowStep,
    });
    throw new Error("Antiarrítmico só pode ser registrado após o terceiro choque");
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
    return toReducerResult(createInitialAclsState(), []);
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
        return toReducerResult(nextState, effects);
      }

      if (current.next) {
        transitionToState(nextState, effects, event.at, current.next, "STATE_TRANSITIONED");
      }

      return toReducerResult(nextState, effects);
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
        if (nextState.currentStateId === "avaliar_ritmo") {
          nextState.initialCprStartedAt = undefined;
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

      return toReducerResult(nextState, effects);
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
        return toReducerResult(nextState, effects);
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
        return toReducerResult(nextState, effects);
      }

      if (event.actionId === "adrenaline") {
        const medication = nextState.medications.adrenaline;
        medication.administeredCount += 1;
        medication.lastAdministeredAt = event.at;
        medication.pendingConfirmation = false;
        medication.status = "administered";
        medication.nextDueAt = event.at + ADRENALINE_REMINDER_INTERVAL_MS;
        nextState.clock = {
          ...nextState.clock,
          lastEpinephrineTime: event.at,
        };
        appendTimelineEvent(nextState, effects, event.at, "medication_administered", "user", {
          medicationId: "adrenaline",
          count: medication.administeredCount,
          doseLabel: getMedicationDoseLabel("adrenaline", medication.administeredCount),
        });
        return toReducerResult(nextState, effects);
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
      return toReducerResult(nextState, effects);
    }
    case "timer_elapsed": {
      const activeTimer = nextState.timers[0];

      if (!activeTimer || activeTimer.id !== event.timerId || activeTimer.completed) {
        return toReducerResult(nextState, effects);
      }

      if (!isCycleComplete(nextState.clock, event.at)) {
        return toReducerResult(nextState, effects);
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
      effects.push({
        type: "ALERT",
        key: "analyze_rhythm",
        title: "Tempo esgotado",
        message: "Reavaliar ritmo.",
      });
      effects.push({
        type: "SPEAK",
        key: "analyze_rhythm",
        intensity: "medium",
        message: "Reavaliar ritmo",
      });

      if (activeTimer.nextStateId) {
        transitionToState(nextState, effects, event.at, activeTimer.nextStateId, "STATE_AUTO_ADVANCED");
      }

      return toReducerResult(nextState, effects);
    }
    case "medication_reminder_due": {
      if (event.medicationId === "adrenaline") {
        updateAdrenalineReminder(nextState, effects, event.at);
      }
      return toReducerResult(nextState, effects);
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
      return toReducerResult(nextState, effects);
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
      return toReducerResult(nextState, effects);
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
      return toReducerResult(nextState, effects);
    }
    case "assistant_insight_logged": {
      appendTimelineEvent(nextState, effects, event.at, "assistant_insight", "system", {
        kind: event.kind,
        summary: event.summary,
        stateId: event.stateId,
        ...event.details,
      });
      return toReducerResult(nextState, effects);
    }
    case "pre_cue_due": {
      if (event.source === "time") {
        const activeTimer = nextState.timers[0];
        if (!activeTimer || activeTimer.id !== event.timerId || activeTimer.completed) {
          return toReducerResult(nextState, effects);
        }
      }

      emitPreCue(nextState, effects, event.at, event.kind, event.source);
      return toReducerResult(nextState, effects);
    }
    default: {
      return toReducerResult(nextState, effects);
    }
  }
}

export type { ACLSEvent, ACLSReducerResult, ACLSState, ACLSTimer, Effect };
export {
  ADRENALINE_REMINDER_INTERVAL_MS,
  createInitialAclsState,
  getCurrentCueIdForAclsState,
  getDocumentationActionsForAclsState,
  reduceAclsState,
  resolveDynamicAclsProtocolState,
};
