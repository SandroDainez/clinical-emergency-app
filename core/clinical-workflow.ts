type ClinicalCoreStepId =
  | "patient_identification"
  | "primary_assessment"
  | "automatic_severity_detection"
  | "immediate_intervention"
  | "directed_clinical_evaluation"
  | "diagnostic_hypotheses"
  | "protocol_activation"
  | "complementary_exams"
  | "diagnosis"
  | "treatment_plan"
  | "patient_destination";

type ClinicalCoreStepStatus =
  | "pending"
  | "ready"
  | "active"
  | "completed"
  | "blocked"
  | "critical";

type ClinicalCorePriority = "immediate" | "urgent" | "routine";

type ClinicalCoreCard = {
  label: string;
  value: string;
  emphasis?: "default" | "warning" | "danger";
};

type ClinicalCoreAction = {
  id: string;
  label: string;
  priority: ClinicalCorePriority;
  rationale?: string;
  selected?: boolean;
};

type ClinicalCoreAlert = {
  id: string;
  severity: "warning" | "critical";
  title: string;
  rationale: string;
  immediateActions: string[];
};

type ClinicalCoreHypothesis = {
  id: string;
  label: string;
  probability: "low" | "moderate" | "high";
  rationale: string;
};

type ClinicalCoreProtocolActivation = {
  protocolId: string;
  label: string;
  status: "available" | "suggested" | "active";
  rationale: string;
};

type ClinicalCorePatientIdentity = {
  age: string;
  weightKg: string;
  heightCm?: string;
  sex?: string;
};

type ClinicalCoreWorkflowStep = {
  id: ClinicalCoreStepId;
  title: string;
  status: ClinicalCoreStepStatus;
  summary: string;
  required?: boolean;
  progressionBlocked?: boolean;
  cards?: ClinicalCoreCard[];
  actions?: ClinicalCoreAction[];
  alerts?: ClinicalCoreAlert[];
};

type ClinicalCoreWorkflowSnapshot = {
  workflowId: "core_clinical_flow";
  protocolId: string;
  protocolLabel: string;
  patient: ClinicalCorePatientIdentity;
  blockingIssues: string[];
  criticalAlerts: ClinicalCoreAlert[];
  hypotheses: ClinicalCoreHypothesis[];
  activeProtocol: ClinicalCoreProtocolActivation | null;
  steps: ClinicalCoreWorkflowStep[];
};

export type {
  ClinicalCoreAction,
  ClinicalCoreAlert,
  ClinicalCoreCard,
  ClinicalCoreHypothesis,
  ClinicalCorePatientIdentity,
  ClinicalCorePriority,
  ClinicalCoreProtocolActivation,
  ClinicalCoreStepId,
  ClinicalCoreStepStatus,
  ClinicalCoreWorkflowSnapshot,
  ClinicalCoreWorkflowStep,
};
