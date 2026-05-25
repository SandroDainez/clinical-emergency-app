import type {
  AclsCaseLogEntry,
  AclsEffect,
  AclsLatencyTrace,
  AclsMedicationTracker,
  AclsOperationalMetrics,
  AclsPresentation,
  AclsPriority,
  AclsTimelineEvent,
} from "./acls/domain";
import type { ClinicalCoreWorkflowSnapshot } from "./core/clinical-workflow";

type EngineEffect =
  | AclsEffect
  | {
      type: "speak";
      message: string;
      suppressStateSpeech?: boolean;
    };

type ProtocolState = {
  type: "action" | "question" | "end";
  text: string;
  speak?: string;
  details?: string[];
  options?: Record<string, string>;
  /** Phase metadata — used by multi-phase protocols (e.g. sepsis) for progress indicators */
  phase?: string;
  phaseLabel?: string;
  phaseStep?: number;
  phaseTotal?: number;
  suggestedNextStep?: {
    input: string;
    label: string;
    rationale?: string;
  };
};

type TimerState = {
  duration: number;
  remaining: number;
};

type ReversibleCause = {
  id: string;
  label: string;
  actions: string[];
  status: "pendente" | "suspeita" | "abordada";
  evidence?: string[];
  actionsTaken?: string[];
  responseObserved?: string[];
};

type ClinicalLogEntry = {
  timestamp: number;
  kind: string;
  title: string;
  details?: string;
};

type VoiceCommandLogEntry = {
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

type AssistantInsightLogEntry = {
  kind:
    | "ranking_generated"
    | "priority_changed"
    | "missing_data_highlighted"
    | "top_three_presented";
  summary: string;
  stateId: string;
  details?: Record<string, string | number | boolean | null | undefined>;
};

type DocumentationAction = {
  id:
    | "shock"
    | "adrenaline"
    | "antiarrhythmic"
    | "advanced_airway"
    | "antibiotic"
    | "fluids"
    | "norepinephrine";
  label: string;
};

type AuxiliaryPanelField = {
  id: string;
  label: string;
  value: string;
  section?: string;
  unit?: string;
  unitOptions?: {
    label: string;
    value: string;
  }[];
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  helperText?: string;
  fullWidth?: boolean;
  presetMode?: "replace" | "toggle_token";
  presets?: {
    label: string;
    value: string;
  }[];
  suggestedValue?: string;
  suggestedLabel?: string;
  readOnly?: boolean;
};

type AuxiliaryPanelMetric = {
  label: string;
  value: string;
};

type AuxiliaryPanelAction = {
  id: string;
  label: string;
  requiresConfirmation?: boolean;
};

type AuxiliaryPanelStatusOption = {
  id: string;
  label: string;
  status: "pendente" | "solicitado" | "realizado";
  requiresConfirmation?: boolean;
};

type AuxiliaryPanelStatusItem = {
  id: string;
  label: string;
  value: string;
  currentStatus?: "pendente" | "solicitado" | "realizado";
  options: AuxiliaryPanelStatusOption[];
  helperText?: string;
};

type AuxiliaryPanelRecommendation = {
  title: string;
  tone?: "info" | "warning" | "danger";
  priority?: "high" | "medium" | "low";
  lines: string[];
  ctaButton?: { label: string; actionId: string };
};

type AuxiliaryPanel = {
  title: string;
  description?: string;
  fields: AuxiliaryPanelField[];
  metrics: AuxiliaryPanelMetric[];
  actions: AuxiliaryPanelAction[];
  statusItems?: AuxiliaryPanelStatusItem[];
  recommendations?: AuxiliaryPanelRecommendation[];
  stabilizationRecommendations?: AuxiliaryPanelRecommendation[];
};

type AntibioticTimerStatus = {
  running: boolean;
  elapsedLabel: string;
  nextAlertInLabel: string;
};

type EncounterSummary = {
  protocolId: string;
  durationLabel: string;
  currentStateId: string;
  currentStateText: string;
  shockCount: number;
  adrenalineSuggestedCount: number;
  adrenalineAdministeredCount: number;
  antiarrhythmicSuggestedCount: number;
  antiarrhythmicAdministeredCount: number;
  advancedAirwaySecured?: boolean;
  suspectedCauses: string[];
  addressedCauses: string[];
  lastEvents: string[];
  panelMetrics?: {
    label: string;
    value: string;
  }[];
  metrics?: {
    label: string;
    value: string;
  }[];
};

type ClinicalEngine = {
  clearLatencyMetrics?: () => void;
  consumeEffects: () => EngineEffect[];
  getCaseLog?: () => AclsCaseLogEntry[];
  getLatencyMetrics?: () => AclsLatencyTrace[];
  getLatencyMetricsExport?: () => string;
  isDebugLatencyEnabled?: () => boolean;
  subscribe?: (listener: () => void) => () => void;
  getClinicalLog: () => ClinicalLogEntry[];
  getCurrentCueId?: () => string;
  getClinicalIntentConfidence?: () => "low" | "medium" | "high";
  getCurrentState: () => ProtocolState;
  getCurrentStateId: () => string;
  getDocumentationActions: () => DocumentationAction[];
  getEncounterReportHtml: () => string;
  getEncounterSummary: () => EncounterSummary;
  getEncounterSummaryText: () => string;
  getCoreWorkflowSnapshot?: () => ClinicalCoreWorkflowSnapshot | null;
  getMedicationSnapshot?: () => Record<"adrenaline" | "antiarrhythmic", AclsMedicationTracker>;
  getOperationalMetrics?: () => AclsOperationalMetrics;
  getPresentation?: () => AclsPresentation;
  getPriority?: () => AclsPriority;
  getReversibleCauses: () => ReversibleCause[];
  getTimers: () => TimerState[];
  getTimeline?: () => AclsTimelineEvent[];
  getAuxiliaryPanel?: () => AuxiliaryPanel | null;
  canGoBack?: () => boolean;
  goBack?: () => ProtocolState;
  next: (input?: string) => ProtocolState;
  markLatencyStateCommitted?: () => void;
  recordLatencyPlaybackStarted?: (traceId: string, speakKey: string) => void;
  recordLatencySpeakEnqueued?: (traceId: string, speakKey: string) => void;
  registerExecution: (actionId: DocumentationAction["id"]) => ClinicalLogEntry[];
  resetSession: () => ProtocolState;
  setDebugLatencyEnabled?: (enabled: boolean) => void;
  runAuxiliaryAction?: (actionId: string) => ClinicalLogEntry[];
  tick: () => ProtocolState;
  updateAuxiliaryField?: (fieldId: string, value: string) => AuxiliaryPanel | null;
  applyAuxiliaryPreset?: (fieldId: string, value: string) => AuxiliaryPanel | null;
  updateAuxiliaryUnit?: (fieldId: string, unit: string) => AuxiliaryPanel | null;
  updateAuxiliaryStatus?: (itemId: string, status: "pendente" | "solicitado" | "realizado") => AuxiliaryPanel | null;
  updateReversibleCauseStatus: (
    causeId: string,
    status: "suspeita" | "abordada"
  ) => ReversibleCause[];
  updateReversibleCauseNotes?: (
    causeId: string,
    field: "evidence" | "actionsTaken" | "responseObserved",
    value: string
  ) => ReversibleCause[];
  getSepsisHubData?: () => SepsisHubData | null;
  registerAssistantInsightEvent?: (entry: AssistantInsightLogEntry) => void;
  registerVoiceCommandEvent?: (entry: VoiceCommandLogEntry) => void;
};

type SepsisTimerInfo = {
  durationLabel: string;
  remainingLabel: string;
  nextAlertLabel?: string;
};

type SepsisHubData = {
  recognitionElapsed: string;
  scenarioLabel: string;
  focusLabel: string;
  patientSummary: string[];
  assessmentSummary: string;
  bundleItems: AuxiliaryPanelStatusItem[];
  pendingBundleCount: number;
  antibioticTimer?: SepsisTimerInfo;
};

export type {
  AclsOperationalMetrics,
  AclsPresentation,
  AclsPriority,
  AclsTimelineEvent,
  ClinicalCoreWorkflowSnapshot,
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  AssistantInsightLogEntry,
  VoiceCommandLogEntry,
  ProtocolState,
  ReversibleCause,
  TimerState,
  AuxiliaryPanel,
  AuxiliaryPanelAction,
  AuxiliaryPanelField,
  AuxiliaryPanelMetric,
  AuxiliaryPanelRecommendation,
  AuxiliaryPanelStatusItem,
  AuxiliaryPanelStatusOption,
  SepsisHubData,
};
