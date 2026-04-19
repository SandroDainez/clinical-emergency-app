export type TimePrecision = "exact" | "estimated" | "unknown";
export type BinaryStatus = "yes" | "no" | "unknown";
export type ContraStatus = "present" | "absent" | "unknown";
export type ReperfusionGate = "eligible" | "blocked" | "correctable" | "needs_review" | "needs_imaging";
export type StrokePathway = "ischemic_possible" | "ischemic_confirmed" | "hemorrhagic" | "undetermined";
export type DestinationKey =
  | "uti"
  | "unidade_avc"
  | "sala_vermelha"
  | "transferencia_trombectomia"
  | "enfermaria"
  | "observacao";

export type NihssItemOption = {
  score: number;
  label: string;
  description: string;
};

export type NihssItemDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  options: NihssItemOption[];
};

export type ContraindicationCategory =
  | "absolute"
  | "relative"
  | "correctable"
  | "diagnostic_pending"
  | "lab_pending"
  | "hemodynamic_pending";

export type ContraindicationDefinition = {
  id: string;
  category: ContraindicationCategory;
  name: string;
  description: string;
  impact: string;
  correctable: boolean;
  correctionGuidance?: string;
  blocksThrombolysis: boolean;
  blocksThrombectomy?: boolean;
};

export type ThrombolyticDefinition = {
  id: string;
  label: string;
  doseMgPerKg: number;
  maxDoseMg: number;
  roundingStepMg: number;
  bolusFraction?: number;
  infusionMinutes?: number;
  bolusOnly?: boolean;
  note: string;
};

export type AvcPatientSnapshot = {
  responsibleClinician: string;
  patientName: string;
  patientId: string;
  age: number | null;
  sex: string;
  weightKg: number | null;
  heightCm: number | null;
  allergies: string;
  comorbidities: string;
  antithrombotics: string;
  renalFunction: string;
  glucoseInitial: number | null;
  origin: string;
};

export type AvcTimingSnapshot = {
  arrivalTime: string;
  symptomOnsetTime: string;
  lastKnownWellTime: string;
  timePrecision: TimePrecision;
};

export type AvcSymptomsSnapshot = {
  symptoms: string;
  laterality: string;
  strokeMimicConcern: BinaryStatus;
  abcInstability: BinaryStatus;
  airwayProtection: BinaryStatus;
  disablingDeficit: BinaryStatus;
};

export type AvcVitalsSnapshot = {
  systolicPressure: number | null;
  diastolicPressure: number | null;
  meanArterialPressure: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
  glucoseCurrent: number | null;
  consciousnessLevel: string;
  stabilizationActions: string;
  pressureControlActions: string;
  glucoseCorrectionActions: string;
  seizureManagement: string;
  venousAccess: string;
  monitoring: string;
};

export type AvcImagingSnapshot = {
  ctRequestedAt: string;
  ctPerformedAt: string;
  ctReadAt: string;
  ctResult: string;
  earlyIschemiaSigns: string;
  ctaPerformed: BinaryStatus;
  ctaResult: string;
  lvoSuspicion: BinaryStatus;
  lvoSite: string;
  imageDelayReason: string;
};

export type AvcLabsSnapshot = {
  platelets: number | null;
  inr: number | null;
  aptt: number | null;
  creatinine: number | null;
};

export type AvcContraSnapshot = {
  status: ContraStatus;
  correctionNotes: string;
  finalDecision: string;
};

export type AvcNihssSnapshot = {
  scores: Record<string, number | null>;
  total: number;
  complete: boolean;
  severity: string;
};

export type AvcTherapyDecision = {
  gate: ReperfusionGate;
  label: string;
  rationale: string[];
  blockers: string[];
  correctableItems: string[];
};

export type AvcDecisionSnapshot = {
  pathway: StrokePathway;
  syndromeLabel: string;
  ivThrombolysis: AvcTherapyDecision;
  thrombectomy: AvcTherapyDecision;
  hemorrhagePlan: AvcTherapyDecision;
  destination: {
    recommended: DestinationKey;
    rationale: string[];
  };
  selectedThrombolyticId: string;
  finalMedicalDecision: string;
  doubleCheckStatus: string;
};

export type AvcDoseCalculation = {
  thrombolyticId: string;
  totalDoseMg: number | null;
  bolusDoseMg: number | null;
  infusionDoseMg: number | null;
  infusionMinutes: number | null;
  caution: string[];
};

export type AvcAuditEntry = {
  id: string;
  timestamp: number;
  actor: string;
  kind:
    | "field_updated"
    | "calculation_recomputed"
    | "decision_changed"
    | "correction_logged"
    | "state_changed"
    | "protocol_started";
  label: string;
  details?: string;
  metadata?: Record<string, string>;
};

export type AvcCaseSnapshot = {
  patient: AvcPatientSnapshot;
  timing: AvcTimingSnapshot;
  symptoms: AvcSymptomsSnapshot;
  vitals: AvcVitalsSnapshot;
  imaging: AvcImagingSnapshot;
  labs: AvcLabsSnapshot;
  contraindications: Record<string, AvcContraSnapshot>;
  nihss: AvcNihssSnapshot;
  decision: AvcDecisionSnapshot;
  dose: AvcDoseCalculation;
};
