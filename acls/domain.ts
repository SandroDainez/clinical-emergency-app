type AclsStateType = "action" | "question" | "end";

type AclsPriority = "critical_now" | "due_now" | "prepare_now" | "monitor" | "reassess";
type AclsSpeechIntensity = "low" | "medium" | "high";
type AclsClinicalIntentConfidence = "low" | "medium" | "high";
type AclsClinicalIntent =
  | "assess_patient"
  | "perform_cpr"
  | "deliver_shock"
  | "analyze_rhythm"
  | "give_epinephrine"
  | "give_antiarrhythmic"
  | "post_rosc_care"
  | "end_protocol";

type AclsMedicationId = "adrenaline" | "antiarrhythmic";
type AclsLatencyEventCategory = "shock" | "rhythm" | "cpr" | "medication" | "other";

type AclsMedicationStatus =
  | "idle"
  | "recommended"
  | "due_now"
  | "pending_confirmation"
  | "administered"
  | "completed";

type AclsDocumentationAction = {
  id: "shock" | "adrenaline" | "antiarrhythmic" | "advanced_airway";
  label: string;
};

type AclsEffect =
  | {
      type: "start_timer";
      timerId: string;
      durationSeconds: number;
      stateId: string;
      nextStateId?: string;
    }
  | {
      type: "show_priority_banner";
      priority: AclsPriority;
      title: string;
      detail: string;
    }
  | {
      type: "recommend_medication";
      medicationId: AclsMedicationId;
      title: string;
      message: string;
    }
  | {
      type: "mark_medication_due_now";
      medicationId: AclsMedicationId;
      title: string;
      message: string;
    }
  | {
      type: "schedule_recurring_reminder";
      medicationId: AclsMedicationId;
      nextDueAt: number;
      intervalMs: number;
    }
  | {
      type: "log_event";
      eventId: string;
    }
  | {
      type: "play_audio_cue";
      cueId?: string;
      latencyTraceId?: string;
      message: string;
      intensity?: AclsSpeechIntensity;
      suppressStateSpeech?: boolean;
    }
  | {
      type: "require_confirmation";
      actionId: AclsDocumentationAction["id"];
      title: string;
      message: string;
    }
  | {
      type: "alert";
      title: string;
      message: string;
    };

type AclsTimelineEventType =
  | "protocol_started"
  | "assistant_insight"
  | "voice_command"
  | "state_transitioned"
  | "question_answered"
  | "action_confirmed"
  | "timer_started"
  | "timer_completed"
  | "shock_indicated"
  | "shock_applied"
  | "medication_recommended"
  | "medication_due_now"
  | "medication_administered"
  | "medication_scheduled"
  | "advanced_airway_secured"
  | "reassessment_due"
  | "reversible_cause_updated"
  | "guard_rail_triggered"
  | "rosc"
  | "encerramento";

type AclsTimelineEvent = {
  id: string;
  timestamp: number;
  type: AclsTimelineEventType;
  stateId: string;
  origin: "user" | "system";
  details?: Record<string, string | number | boolean | null | undefined>;
};

type AclsCaseLogEntry = {
  id: string;
  timestamp: number;
  stateId: string;
  eventType: string;
  eventDetails?: Record<string, string | number | boolean | null | undefined>;
  speak?: {
    key: string;
    intensity?: AclsSpeechIntensity;
    message?: string;
  };
  speakEffects: {
    key: string;
    intensity?: AclsSpeechIntensity;
    message?: string;
  }[];
};

type AclsLatencyTrace = {
  id: string;
  eventType: string;
  eventCategory: AclsLatencyEventCategory;
  stateIdBefore: string;
  stateIdAfter?: string;
  clinicalIntentAfter?: AclsClinicalIntent;
  eventReceivedAt: number;
  reducerCompletedAt?: number;
  stateAppliedAt?: number;
  stateCommittedAt?: number;
  speakEnqueuedAt?: number;
  speakPlayStartedAt?: number;
  speakKeys: string[];
  latencies: {
    eventToStateMs?: number;
    stateToEnqueueSpeakMs?: number;
    enqueueToPlayMs?: number;
    totalEndToEndMs?: number;
  };
};

type AclsMedicationTracker = {
  id: AclsMedicationId;
  status: AclsMedicationStatus;
  recommendedCount: number;
  administeredCount: number;
  lastRecommendedAt?: number;
  lastAdministeredAt?: number;
  lastAdministeredCycleCount?: number;
  nextEligibleTime?: number;
  lateAfterTime?: number;
  lateWarningIssuedForDoseCount?: number;
  nextDueAt?: number;
  dueIntervalMs?: number;
  pendingConfirmation: boolean;
  eligible: boolean;
};

type AclsReversibleCauseRecord = {
  id: string;
  label: string;
  actions: string[];
  status: "pendente" | "suspeita" | "abordada";
  suspected: boolean;
  evidence: string[];
  actionsTaken: string[];
  responseObserved: string[];
};

type AclsPresentation = {
  clinicalIntent: AclsClinicalIntent;
  clinicalIntentConfidence: AclsClinicalIntentConfidence;
  title: string;
  instruction: string;
  speak: string;
  cueId?: string;
  banner?: {
    priority: AclsPriority;
    title: string;
    detail: string;
  };
  details: string[];
  conciseDetails: string[];
};

type AclsOperationalMetrics = {
  totalPcrDurationMs?: number;
  timeSinceLastAdrenalineMs?: number;
  timeSinceLastShockMs?: number;
  cyclesCompleted: number;
  nextAdrenalineDueInMs?: number;
  adrenalineTimingState?:
    | "blocked"
    | "due_now"
    | "pending_confirmation"
    | "future_due"
    | "late_due";
  adrenalineLateByMs?: number;
};

export type {
  AclsClinicalIntent,
  AclsCaseLogEntry,
  AclsDocumentationAction,
  AclsEffect,
  AclsLatencyEventCategory,
  AclsLatencyTrace,
  AclsClinicalIntentConfidence,
  AclsMedicationId,
  AclsMedicationStatus,
  AclsMedicationTracker,
  AclsOperationalMetrics,
  AclsPresentation,
  AclsPriority,
  AclsReversibleCauseRecord,
  AclsSpeechIntensity,
  AclsStateType,
  AclsTimelineEvent,
  AclsTimelineEventType,
};
