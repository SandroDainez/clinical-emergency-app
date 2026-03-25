type AclsStateType = "action" | "question" | "end";

type AclsPriority = "critical_now" | "due_now" | "prepare_now" | "monitor" | "reassess";

type AclsMode = "training" | "code";

type AclsMedicationId = "adrenaline" | "antiarrhythmic";

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
      message: string;
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

type AclsMedicationTracker = {
  id: AclsMedicationId;
  status: AclsMedicationStatus;
  recommendedCount: number;
  administeredCount: number;
  lastRecommendedAt?: number;
  lastAdministeredAt?: number;
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
  mode: AclsMode;
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
};

export type {
  AclsDocumentationAction,
  AclsEffect,
  AclsMedicationId,
  AclsMedicationStatus,
  AclsMedicationTracker,
  AclsMode,
  AclsOperationalMetrics,
  AclsPresentation,
  AclsPriority,
  AclsReversibleCauseRecord,
  AclsStateType,
  AclsTimelineEvent,
  AclsTimelineEventType,
};
