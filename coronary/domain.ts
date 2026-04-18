export type BinaryStatus = "yes" | "no" | "unknown";
export type CoronaryCategory =
  | "stable_angina"
  | "unstable_angina"
  | "nstemi"
  | "stemi"
  | "non_coronary"
  | "indeterminate";
export type CoronaryDecisionGate =
  | "eligible"
  | "blocked"
  | "correctable"
  | "needs_review"
  | "needs_serial_data";
export type ReperfusionStrategy =
  | "primary_pci"
  | "fibrinolysis"
  | "transfer_for_pci"
  | "pharmaco_invasive"
  | "no_reperfusion";
export type CoronaryDestination =
  | "cath_lab"
  | "icu_ccu"
  | "emergency_bay"
  | "monitored_ward"
  | "observation_chest_pain"
  | "discharge_followup"
  | "transfer_reference";
export type ThrombolysisContraCategory =
  | "absolute"
  | "relative"
  | "bleeding_risk"
  | "diagnostic_pending"
  | "hemodynamic_pending";
export type ContraStatus = "present" | "absent" | "unknown";

export type ThrombolysisContraDefinition = {
  id: string;
  category: ThrombolysisContraCategory;
  name: string;
  description: string;
  impact: string;
  correctable: boolean;
  correctionGuidance?: string;
};

export type CoronaryScoreResult = {
  label: string;
  value: number | null;
  tier: string;
  rationale: string[];
  missing: string[];
  impact: string;
};

export type CoronaryMedicationDecision = {
  label: string;
  status: "indicated" | "contraindicated" | "consider" | "withhold";
  rationale: string[];
};

export type CoronaryTherapyDecision = {
  gate: CoronaryDecisionGate;
  label: string;
  rationale: string[];
  blockers: string[];
  correctableItems: string[];
};

export type CoronaryDoseCalculation = {
  regimenId: string;
  title: string;
  lines: string[];
  caution: string[];
};

export type CoronaryAuditEntry = {
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

export type CoronarySnapshot = {
  patient: {
    responsibleClinician: string;
    patientName: string;
    patientId: string;
    age: number | null;
    sex: string;
    weightKg: number | null;
    estimatedWeight: boolean;
    heightCm: number | null;
    allergies: string;
    diabetes: BinaryStatus;
    hypertension: BinaryStatus;
    dyslipidemia: BinaryStatus;
    smoking: BinaryStatus;
    ckd: BinaryStatus;
    heartFailure: BinaryStatus;
    priorCad: BinaryStatus;
    priorPci: BinaryStatus;
    priorCabg: BinaryStatus;
    priorStroke: BinaryStatus;
    atrialFibrillation: BinaryStatus;
    anticoagulants: string;
    antiplatelets: string;
    medications: string;
    origin: string;
  };
  pain: {
    onsetTime: string;
    lastPainFreeTime: string;
    arrivalTime: string;
    chestPainType: string;
    location: string;
    radiation: string;
    durationMinutes: number | null;
    intensity: number | null;
    triggers: string;
    reliefFactors: string;
    effortRelated: BinaryStatus;
    restPain: BinaryStatus;
    recurrence: BinaryStatus;
    progressionRecent: BinaryStatus;
    dyspnea: BinaryStatus;
    diaphoresis: BinaryStatus;
    nauseaVomiting: BinaryStatus;
    syncope: BinaryStatus;
    palpitations: BinaryStatus;
    ischemicEquivalent: BinaryStatus;
    pleuriticPain: BinaryStatus;
    reproduciblePain: BinaryStatus;
    alternativeDiagnosisSigns: string;
    subjectiveClassification: string;
    painOngoing: BinaryStatus;
  };
  exam: {
    systolicPressure: number | null;
    diastolicPressure: number | null;
    meanArterialPressure: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    oxygenSaturation: number | null;
    temperature: number | null;
    peripheralPerfusion: string;
    congestion: BinaryStatus;
    crackles: BinaryStatus;
    murmur: BinaryStatus;
    b3: BinaryStatus;
    jugularDistension: BinaryStatus;
    edema: BinaryStatus;
    mentalStatus: string;
    shockSigns: BinaryStatus;
    killip: string;
    abcInstability: BinaryStatus;
    stabilizationActions: string;
  };
  ecg: {
    firstEcgTime: string;
    serialEcg: BinaryStatus;
    comparedPrior: BinaryStatus;
    stElevation: BinaryStatus;
    stDepression: BinaryStatus;
    twaveInversion: BinaryStatus;
    newBundleBranchBlock: BinaryStatus;
    rhythm: string;
    heartRate: number | null;
    territory: string;
    inferior: BinaryStatus;
    anterior: BinaryStatus;
    lateral: BinaryStatus;
    posterior: BinaryStatus;
    rvInvolvement: BinaryStatus;
    inconclusive: BinaryStatus;
    additionalLeadsNeeded: BinaryStatus;
    interpretationNotes: string;
  };
  biomarkers: {
    troponinType: string;
    troponin1Time: string;
    troponin1Value: number | null;
    labReference: number | null;
    troponin2Time: string;
    troponin2Value: number | null;
    troponin3Time: string;
    troponin3Value: number | null;
  };
  logistics: {
    cathLabAvailable: BinaryStatus;
    expectedPciDelayMin: number | null;
    fibrinolysisAvailable: BinaryStatus;
    diagnosisTime: string;
    decisionTime: string;
    reperfusionStartTime: string;
    transferTime: string;
  };
  contraindications: Record<string, { status: ContraStatus; correctionNotes: string; finalDecision: string }>;
  classification: {
    category: CoronaryCategory;
    rationale: string[];
  };
  scores: {
    heart: CoronaryScoreResult;
    timi: CoronaryScoreResult;
    grace: CoronaryScoreResult;
    killip: CoronaryScoreResult;
  };
  treatment: {
    reperfusion: CoronaryTherapyDecision;
    fibrinolysis: CoronaryTherapyDecision;
    invasiveStrategy: CoronaryTherapyDecision;
    medications: CoronaryMedicationDecision[];
    reperfusionStrategy: ReperfusionStrategy;
    selectedLyticId: string;
    selectedAnticoagId: string;
    lyticDose: CoronaryDoseCalculation;
    anticoagDose: CoronaryDoseCalculation;
    finalMedicalDecision: string;
    doubleCheckStatus: string;
  };
  destination: {
    recommended: CoronaryDestination;
    rationale: string[];
  };
};
