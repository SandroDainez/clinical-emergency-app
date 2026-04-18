import raw from "./protocols/sindromes_coronarianas.json";
import type {
  AuxiliaryPanel,
  AuxiliaryPanelField,
  AuxiliaryPanelRecommendation,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";
import { createCoronaryAuditEntry } from "./coronary/audit";
import { calculateAnticoagulation, calculateLyticDose } from "./coronary/calculators";
import { evaluateCoronaryStrategies } from "./coronary/classification";
import type {
  BinaryStatus,
  ContraStatus,
  CoronaryAuditEntry,
  CoronaryDestination,
  CoronarySnapshot,
} from "./coronary/domain";
import { loadCoronaryDraft, saveCoronaryDraft } from "./coronary/persistence";
import { buildCoronaryPrescriptionTemplates } from "./coronary/prescriptions";
import {
  ANTICOAG_REGIMENS,
  CORONARY_SECTION_TO_TAB,
  CORONARY_TABS,
  CORONARY_WINDOWS,
  DESTINATION_LABELS,
  LYTIC_REGIMENS,
  MEDICATION_LABELS,
  THROMBOLYSIS_CONTRAS,
} from "./coronary/protocol-config";

type State = {
  type: "action" | "end";
  text: string;
  details?: string[];
  next?: string;
  phase?: string;
  phaseLabel?: string;
  phaseStep?: number;
  phaseTotal?: number;
};

type Protocol = {
  id: string;
  initialState: string;
  states: Record<string, State>;
};

type Assessment = {
  responsibleClinician: string;
  patientName: string;
  patientId: string;
  age: string;
  sex: string;
  weightKg: string;
  estimatedWeight: string;
  heightCm: string;
  allergies: string;
  diabetes: string;
  hypertension: string;
  dyslipidemia: string;
  smoking: string;
  ckd: string;
  heartFailure: string;
  priorCad: string;
  priorPci: string;
  priorCabg: string;
  priorStroke: string;
  atrialFibrillation: string;
  anticoagulants: string;
  antiplatelets: string;
  medications: string;
  onsetTime: string;
  lastPainFreeTime: string;
  arrivalTime: string;
  origin: string;
  chestPainType: string;
  location: string;
  radiation: string;
  durationMinutes: string;
  intensity: string;
  triggers: string;
  reliefFactors: string;
  effortRelated: string;
  restPain: string;
  recurrence: string;
  progressionRecent: string;
  dyspnea: string;
  diaphoresis: string;
  nauseaVomiting: string;
  syncope: string;
  palpitations: string;
  ischemicEquivalent: string;
  pleuriticPain: string;
  reproduciblePain: string;
  alternativeDiagnosisSigns: string;
  subjectiveClassification: string;
  painOngoing: string;
  systolicPressure: string;
  diastolicPressure: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  peripheralPerfusion: string;
  congestion: string;
  crackles: string;
  murmur: string;
  b3: string;
  jugularDistension: string;
  edema: string;
  mentalStatus: string;
  shockSigns: string;
  killip: string;
  abcInstability: string;
  stabilizationActions: string;
  firstEcgTime: string;
  serialEcg: string;
  comparedPrior: string;
  stElevation: string;
  stDepression: string;
  twaveInversion: string;
  newBundleBranchBlock: string;
  ecgRhythm: string;
  ecgRate: string;
  territory: string;
  inferior: string;
  anterior: string;
  lateral: string;
  posterior: string;
  rvInvolvement: string;
  inconclusive: string;
  additionalLeadsNeeded: string;
  ecgNotes: string;
  troponinType: string;
  troponin1Time: string;
  troponin1Value: string;
  labReference: string;
  troponin2Time: string;
  troponin2Value: string;
  troponin3Time: string;
  troponin3Value: string;
  cathLabAvailable: string;
  expectedPciDelayMin: string;
  fibrinolysisAvailable: string;
  diagnosisTime: string;
  decisionTime: string;
  reperfusionStartTime: string;
  transferTime: string;
  selectedLyticId: string;
  selectedAnticoagId: string;
  finalMedicalDecision: string;
  doubleCheckStatus: string;
  destinationOverride: string;
  postCareChecklist: string;
  auditComment: string;
} & Record<string, string>;

type Session = {
  protocolId: string;
  currentStateId: string;
  previousStateIds: string[];
  pendingEffects: EngineEffect[];
  protocolStartedAt: number;
  assessment: Assessment;
  auditTrail: CoronaryAuditEntry[];
  decisionSignature: string;
};

const protocolData = raw as Protocol;

function parseNum(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBinary(value: string): BinaryStatus {
  return value === "yes" || value === "no" ? value : "unknown";
}

function formatElapsed(startedAt: number) {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function buildEmptyAssessment(): Assessment {
  const assessment: Assessment = {
    responsibleClinician: "",
    patientName: "",
    patientId: "",
    age: "",
    sex: "",
    weightKg: "",
    estimatedWeight: "no",
    heightCm: "",
    allergies: "",
    diabetes: "unknown",
    hypertension: "unknown",
    dyslipidemia: "unknown",
    smoking: "unknown",
    ckd: "unknown",
    heartFailure: "unknown",
    priorCad: "unknown",
    priorPci: "unknown",
    priorCabg: "unknown",
    priorStroke: "unknown",
    atrialFibrillation: "unknown",
    anticoagulants: "",
    antiplatelets: "",
    medications: "",
    onsetTime: "",
    lastPainFreeTime: "",
    arrivalTime: "",
    origin: "",
    chestPainType: "",
    location: "",
    radiation: "",
    durationMinutes: "",
    intensity: "",
    triggers: "",
    reliefFactors: "",
    effortRelated: "unknown",
    restPain: "unknown",
    recurrence: "unknown",
    progressionRecent: "unknown",
    dyspnea: "unknown",
    diaphoresis: "unknown",
    nauseaVomiting: "unknown",
    syncope: "unknown",
    palpitations: "unknown",
    ischemicEquivalent: "unknown",
    pleuriticPain: "unknown",
    reproduciblePain: "unknown",
    alternativeDiagnosisSigns: "",
    subjectiveClassification: "",
    painOngoing: "unknown",
    systolicPressure: "",
    diastolicPressure: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    temperature: "",
    peripheralPerfusion: "",
    congestion: "unknown",
    crackles: "unknown",
    murmur: "unknown",
    b3: "unknown",
    jugularDistension: "unknown",
    edema: "unknown",
    mentalStatus: "",
    shockSigns: "unknown",
    killip: "",
    abcInstability: "unknown",
    stabilizationActions: "",
    firstEcgTime: "",
    serialEcg: "unknown",
    comparedPrior: "unknown",
    stElevation: "unknown",
    stDepression: "unknown",
    twaveInversion: "unknown",
    newBundleBranchBlock: "unknown",
    ecgRhythm: "",
    ecgRate: "",
    territory: "",
    inferior: "unknown",
    anterior: "unknown",
    lateral: "unknown",
    posterior: "unknown",
    rvInvolvement: "unknown",
    inconclusive: "unknown",
    additionalLeadsNeeded: "unknown",
    ecgNotes: "",
    troponinType: "alta_sensibilidade",
    troponin1Time: "",
    troponin1Value: "",
    labReference: "",
    troponin2Time: "",
    troponin2Value: "",
    troponin3Time: "",
    troponin3Value: "",
    cathLabAvailable: "unknown",
    expectedPciDelayMin: "",
    fibrinolysisAvailable: "unknown",
    diagnosisTime: "",
    decisionTime: "",
    reperfusionStartTime: "",
    transferTime: "",
    selectedLyticId: "tenecteplase_stemi",
    selectedAnticoagId: "ufh_stemi",
    finalMedicalDecision: "",
    doubleCheckStatus: "",
    destinationOverride: "",
    postCareChecklist: "",
    auditComment: "",
  };

  THROMBOLYSIS_CONTRAS.forEach((item) => {
    assessment[`contra_${item.id}_status`] = "unknown";
    assessment[`contra_${item.id}_notes`] = "";
    assessment[`contra_${item.id}_final`] = "";
  });

  return assessment;
}

function serializeDraft(session: Session) {
  return {
    protocolId: session.protocolId,
    currentStateId: session.currentStateId,
    previousStateIds: session.previousStateIds,
    protocolStartedAt: session.protocolStartedAt,
    assessment: session.assessment,
    auditTrail: session.auditTrail,
    decisionSignature: session.decisionSignature,
  };
}

function buildContraMap(a: Assessment) {
  return Object.fromEntries(
    THROMBOLYSIS_CONTRAS.map((item) => [
      item.id,
      {
        status: (a[`contra_${item.id}_status`] as ContraStatus) ?? "unknown",
        correctionNotes: a[`contra_${item.id}_notes`] ?? "",
        finalDecision: a[`contra_${item.id}_final`] ?? "",
      },
    ])
  ) as CoronarySnapshot["contraindications"];
}

function buildSnapshot(a: Assessment): CoronarySnapshot {
  const meanArterialPressure =
    parseNum(a.systolicPressure) != null && parseNum(a.diastolicPressure) != null
      ? Math.round((parseNum(a.systolicPressure)! + 2 * parseNum(a.diastolicPressure)!) / 3)
      : null;

  const preliminary = {
    patient: {
      responsibleClinician: a.responsibleClinician,
      patientName: a.patientName,
      patientId: a.patientId,
      age: parseNum(a.age),
      sex: a.sex,
      weightKg: parseNum(a.weightKg),
      estimatedWeight: a.estimatedWeight === "yes",
      heightCm: parseNum(a.heightCm),
      allergies: a.allergies,
      diabetes: parseBinary(a.diabetes),
      hypertension: parseBinary(a.hypertension),
      dyslipidemia: parseBinary(a.dyslipidemia),
      smoking: parseBinary(a.smoking),
      ckd: parseBinary(a.ckd),
      heartFailure: parseBinary(a.heartFailure),
      priorCad: parseBinary(a.priorCad),
      priorPci: parseBinary(a.priorPci),
      priorCabg: parseBinary(a.priorCabg),
      priorStroke: parseBinary(a.priorStroke),
      atrialFibrillation: parseBinary(a.atrialFibrillation),
      anticoagulants: a.anticoagulants,
      antiplatelets: a.antiplatelets,
      medications: a.medications,
      origin: a.origin,
    },
    pain: {
      onsetTime: a.onsetTime,
      lastPainFreeTime: a.lastPainFreeTime,
      arrivalTime: a.arrivalTime,
      chestPainType: a.chestPainType,
      location: a.location,
      radiation: a.radiation,
      durationMinutes: parseNum(a.durationMinutes),
      intensity: parseNum(a.intensity),
      triggers: a.triggers,
      reliefFactors: a.reliefFactors,
      effortRelated: parseBinary(a.effortRelated),
      restPain: parseBinary(a.restPain),
      recurrence: parseBinary(a.recurrence),
      progressionRecent: parseBinary(a.progressionRecent),
      dyspnea: parseBinary(a.dyspnea),
      diaphoresis: parseBinary(a.diaphoresis),
      nauseaVomiting: parseBinary(a.nauseaVomiting),
      syncope: parseBinary(a.syncope),
      palpitations: parseBinary(a.palpitations),
      ischemicEquivalent: parseBinary(a.ischemicEquivalent),
      pleuriticPain: parseBinary(a.pleuriticPain),
      reproduciblePain: parseBinary(a.reproduciblePain),
      alternativeDiagnosisSigns: a.alternativeDiagnosisSigns,
      subjectiveClassification: a.subjectiveClassification,
      painOngoing: parseBinary(a.painOngoing),
    },
    exam: {
      systolicPressure: parseNum(a.systolicPressure),
      diastolicPressure: parseNum(a.diastolicPressure),
      meanArterialPressure,
      heartRate: parseNum(a.heartRate),
      respiratoryRate: parseNum(a.respiratoryRate),
      oxygenSaturation: parseNum(a.oxygenSaturation),
      temperature: parseNum(a.temperature),
      peripheralPerfusion: a.peripheralPerfusion,
      congestion: parseBinary(a.congestion),
      crackles: parseBinary(a.crackles),
      murmur: parseBinary(a.murmur),
      b3: parseBinary(a.b3),
      jugularDistension: parseBinary(a.jugularDistension),
      edema: parseBinary(a.edema),
      mentalStatus: a.mentalStatus,
      shockSigns: parseBinary(a.shockSigns),
      killip: a.killip,
      abcInstability: parseBinary(a.abcInstability),
      stabilizationActions: a.stabilizationActions,
    },
    ecg: {
      firstEcgTime: a.firstEcgTime,
      serialEcg: parseBinary(a.serialEcg),
      comparedPrior: parseBinary(a.comparedPrior),
      stElevation: parseBinary(a.stElevation),
      stDepression: parseBinary(a.stDepression),
      twaveInversion: parseBinary(a.twaveInversion),
      newBundleBranchBlock: parseBinary(a.newBundleBranchBlock),
      rhythm: a.ecgRhythm,
      heartRate: parseNum(a.ecgRate),
      territory: a.territory,
      inferior: parseBinary(a.inferior),
      anterior: parseBinary(a.anterior),
      lateral: parseBinary(a.lateral),
      posterior: parseBinary(a.posterior),
      rvInvolvement: parseBinary(a.rvInvolvement),
      inconclusive: parseBinary(a.inconclusive),
      additionalLeadsNeeded: parseBinary(a.additionalLeadsNeeded),
      interpretationNotes: a.ecgNotes,
    },
    biomarkers: {
      troponinType: a.troponinType,
      troponin1Time: a.troponin1Time,
      troponin1Value: parseNum(a.troponin1Value),
      labReference: parseNum(a.labReference),
      troponin2Time: a.troponin2Time,
      troponin2Value: parseNum(a.troponin2Value),
      troponin3Time: a.troponin3Time,
      troponin3Value: parseNum(a.troponin3Value),
    },
    logistics: {
      cathLabAvailable: parseBinary(a.cathLabAvailable),
      expectedPciDelayMin: parseNum(a.expectedPciDelayMin),
      fibrinolysisAvailable: parseBinary(a.fibrinolysisAvailable),
      diagnosisTime: a.diagnosisTime,
      decisionTime: a.decisionTime,
      reperfusionStartTime: a.reperfusionStartTime,
      transferTime: a.transferTime,
    },
    contraindications: buildContraMap(a),
    classification: {
      category: "indeterminate" as const,
      rationale: [],
    },
    scores: {
      heart: { label: "HEART", value: null, tier: "incompleto", rationale: [], missing: [], impact: "" },
      timi: { label: "TIMI", value: null, tier: "incompleto", rationale: [], missing: [], impact: "" },
      grace: { label: "GRACE", value: null, tier: "incompleto", rationale: [], missing: [], impact: "" },
      killip: { label: "Killip-Kimball", value: null, tier: "incompleto", rationale: [], missing: [], impact: "" },
    },
    treatment: {
      reperfusion: { gate: "needs_review", label: "Em revisão", rationale: [], blockers: [], correctableItems: [] },
      fibrinolysis: { gate: "needs_review", label: "Em revisão", rationale: [], blockers: [], correctableItems: [] },
      invasiveStrategy: { gate: "needs_review", label: "Em revisão", rationale: [], blockers: [], correctableItems: [] },
      medications: [],
      reperfusionStrategy: "no_reperfusion",
      selectedLyticId: a.selectedLyticId || "tenecteplase_stemi",
      selectedAnticoagId: a.selectedAnticoagId || "ufh_stemi",
      lyticDose: { regimenId: "", title: "", lines: [], caution: [] },
      anticoagDose: { regimenId: "", title: "", lines: [], caution: [] },
      finalMedicalDecision: a.finalMedicalDecision,
      doubleCheckStatus: a.doubleCheckStatus,
    },
    destination: {
      recommended: "observation_chest_pain" as CoronaryDestination,
      rationale: [],
    },
  } satisfies Omit<CoronarySnapshot, "classification" | "scores" | "treatment" | "destination"> & Record<string, unknown>;

  const evaluated = evaluateCoronaryStrategies(preliminary as CoronarySnapshot);
  const lyticDose = calculateLyticDose(
    a.selectedLyticId || "tenecteplase_stemi",
    preliminary.patient.weightKg
  );
  const anticoagDose = calculateAnticoagulation(
    a.selectedAnticoagId || "ufh_stemi",
    preliminary.patient.weightKg,
    preliminary.patient.age,
    preliminary.patient.ckd === "yes"
  );

  return {
    ...preliminary,
    classification: evaluated.classification,
    scores: evaluated.scores,
    treatment: {
      ...evaluated.treatment,
      selectedLyticId: a.selectedLyticId || "tenecteplase_stemi",
      selectedAnticoagId: a.selectedAnticoagId || "ufh_stemi",
      lyticDose,
      anticoagDose,
      finalMedicalDecision: a.finalMedicalDecision,
      doubleCheckStatus: a.doubleCheckStatus,
    },
    destination: {
      recommended: evaluated.destination.recommended as CoronaryDestination,
      rationale: evaluated.destination.rationale,
    },
  };
}

function field(
  label: string,
  id: keyof Assessment | string,
  value: string,
  section: string,
  extra?: Partial<AuxiliaryPanelField>
): AuxiliaryPanelField {
  return {
    id: String(id),
    label,
    value,
    section,
    ...extra,
  };
}

function binaryPresets(trueLabel = "Sim", falseLabel = "Não", unknownLabel = "Desconhecido") {
  return [
    { label: trueLabel, value: "yes" },
    { label: falseLabel, value: "no" },
    { label: unknownLabel, value: "unknown" },
  ];
}

function statusField(section: string, definitionId: string, label: string, helperText: string): AuxiliaryPanelField[] {
  return [
    field(label, `contra_${definitionId}_status`, session.assessment[`contra_${definitionId}_status`], section, {
      helperText,
      presets: [
        { label: "Ausente", value: "absent" },
        { label: "Presente", value: "present" },
        { label: "Desconhecido", value: "unknown" },
      ],
    }),
    field("Correção / observação", `contra_${definitionId}_notes`, session.assessment[`contra_${definitionId}_notes`], section, {
      fullWidth: true,
      placeholder: "Registrar correção, motivo de bloqueio ou revisão",
    }),
    field("Decisão final do item", `contra_${definitionId}_final`, session.assessment[`contra_${definitionId}_final`], section, {
      fullWidth: true,
      placeholder: "Ex.: mantido bloqueio / corrigido / segue em revisão",
    }),
  ];
}

function buildFields(snapshot: CoronarySnapshot): AuxiliaryPanelField[] {
  const fields: AuxiliaryPanelField[] = [
    field("Responsável pelo preenchimento", "responsibleClinician", session.assessment.responsibleClinician, "Responsável e identificação", {
      placeholder: "Nome / plantonista",
      fullWidth: true,
    }),
    field("Paciente", "patientName", session.assessment.patientName, "Responsável e identificação"),
    field("Registro / leito", "patientId", session.assessment.patientId, "Responsável e identificação"),
    field("Idade (anos)", "age", session.assessment.age, "Responsável e identificação", { keyboardType: "numeric" }),
    field("Sexo", "sex", session.assessment.sex, "Responsável e identificação", {
      presets: [
        { label: "Masculino", value: "Masculino" },
        { label: "Feminino", value: "Feminino" },
      ],
    }),
    field("Peso (kg)", "weightKg", session.assessment.weightKg, "Responsável e identificação", { keyboardType: "numeric" }),
    field("Peso estimado?", "estimatedWeight", session.assessment.estimatedWeight, "Responsável e identificação", {
      presets: [
        { label: "Não", value: "no" },
        { label: "Sim", value: "yes" },
      ],
    }),
    field("Altura (cm)", "heightCm", session.assessment.heightCm, "Responsável e identificação", { keyboardType: "numeric" }),

    field("Diabetes", "diabetes", session.assessment.diabetes, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Hipertensão", "hypertension", session.assessment.hypertension, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Dislipidemia", "dyslipidemia", session.assessment.dyslipidemia, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Tabagismo", "smoking", session.assessment.smoking, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Doença renal crônica", "ckd", session.assessment.ckd, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Insuficiência cardíaca", "heartFailure", session.assessment.heartFailure, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("DAC prévia", "priorCad", session.assessment.priorCad, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Angioplastia prévia", "priorPci", session.assessment.priorPci, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("CRM prévia", "priorCabg", session.assessment.priorCabg, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("AVC prévio", "priorStroke", session.assessment.priorStroke, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Fibrilação atrial", "atrialFibrillation", session.assessment.atrialFibrillation, "Fatores de risco e antecedentes", { presets: binaryPresets() }),
    field("Alergias", "allergies", session.assessment.allergies, "Fatores de risco e antecedentes", { fullWidth: true }),

    field("Anticoagulantes em uso", "anticoagulants", session.assessment.anticoagulants, "Medicações e tempos críticos", { fullWidth: true }),
    field("Antiagregantes em uso", "antiplatelets", session.assessment.antiplatelets, "Medicações e tempos críticos", { fullWidth: true }),
    field("Demais medicações", "medications", session.assessment.medications, "Medicações e tempos críticos", { fullWidth: true }),
    field("Início da dor", "onsetTime", session.assessment.onsetTime, "Medicações e tempos críticos", { placeholder: "HH:MM" }),
    field("Última vez sem dor", "lastPainFreeTime", session.assessment.lastPainFreeTime, "Medicações e tempos críticos", { placeholder: "HH:MM" }),
    field("Chegada ao serviço", "arrivalTime", session.assessment.arrivalTime, "Medicações e tempos críticos", { placeholder: "HH:MM" }),
    field("Origem", "origin", session.assessment.origin, "Medicações e tempos críticos", {
      presets: [
        { label: "SAMU", value: "SAMU" },
        { label: "Demanda espontânea", value: "Demanda espontânea" },
        { label: "Transferência", value: "Transferência" },
        { label: "Internado", value: "Internado" },
      ],
    }),

    field("Tipo da dor", "chestPainType", session.assessment.chestPainType, "Caracterização da dor"),
    field("Localização", "location", session.assessment.location, "Caracterização da dor"),
    field("Irradiação", "radiation", session.assessment.radiation, "Caracterização da dor"),
    field("Duração (min)", "durationMinutes", session.assessment.durationMinutes, "Caracterização da dor", { keyboardType: "numeric" }),
    field("Intensidade (0-10)", "intensity", session.assessment.intensity, "Caracterização da dor", { keyboardType: "numeric" }),
    field("Fatores desencadeantes", "triggers", session.assessment.triggers, "Caracterização da dor", { fullWidth: true }),
    field("Fatores de alívio", "reliefFactors", session.assessment.reliefFactors, "Caracterização da dor", { fullWidth: true }),
    field("Relacionada a esforço", "effortRelated", session.assessment.effortRelated, "Caracterização da dor", { presets: binaryPresets() }),
    field("Dor em repouso", "restPain", session.assessment.restPain, "Caracterização da dor", { presets: binaryPresets() }),
    field("Recorrente", "recurrence", session.assessment.recurrence, "Caracterização da dor", { presets: binaryPresets() }),
    field("Progressão recente", "progressionRecent", session.assessment.progressionRecent, "Caracterização da dor", { presets: binaryPresets() }),
    field("Classificação subjetiva", "subjectiveClassification", session.assessment.subjectiveClassification, "Caracterização da dor", {
      presets: [
        { label: "Típica", value: "típica" },
        { label: "Provavelmente anginosa", value: "provavelmente anginosa" },
        { label: "Pouco sugestiva", value: "pouco sugestiva" },
      ],
    }),

    field("Dispneia", "dyspnea", session.assessment.dyspnea, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Sudorese", "diaphoresis", session.assessment.diaphoresis, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Náuseas / vômitos", "nauseaVomiting", session.assessment.nauseaVomiting, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Síncope", "syncope", session.assessment.syncope, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Palpitações", "palpitations", session.assessment.palpitations, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Equivalente isquêmico", "ischemicEquivalent", session.assessment.ischemicEquivalent, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Dor pleurítica", "pleuriticPain", session.assessment.pleuriticPain, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Dor reproduzível à palpação", "reproduciblePain", session.assessment.reproduciblePain, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Dor ativa agora", "painOngoing", session.assessment.painOngoing, "Equivalentes isquêmicos e diagnósticos alternativos", { presets: binaryPresets() }),
    field("Sinais de diagnóstico alternativo", "alternativeDiagnosisSigns", session.assessment.alternativeDiagnosisSigns, "Equivalentes isquêmicos e diagnósticos alternativos", {
      fullWidth: true,
    }),

    field("PAS", "systolicPressure", session.assessment.systolicPressure, "Exame clínico e vitais", { keyboardType: "numeric" }),
    field("PAD", "diastolicPressure", session.assessment.diastolicPressure, "Exame clínico e vitais", { keyboardType: "numeric" }),
    field("FC", "heartRate", session.assessment.heartRate, "Exame clínico e vitais", { keyboardType: "numeric" }),
    field("FR", "respiratoryRate", session.assessment.respiratoryRate, "Exame clínico e vitais", { keyboardType: "numeric" }),
    field("SpO₂", "oxygenSaturation", session.assessment.oxygenSaturation, "Exame clínico e vitais", { keyboardType: "numeric" }),
    field("Temperatura", "temperature", session.assessment.temperature, "Exame clínico e vitais", { keyboardType: "decimal-pad" }),
    field("Perfusão periférica", "peripheralPerfusion", session.assessment.peripheralPerfusion, "Exame clínico e vitais"),
    field("Congestão", "congestion", session.assessment.congestion, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Estertores", "crackles", session.assessment.crackles, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Sopro", "murmur", session.assessment.murmur, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("B3", "b3", session.assessment.b3, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Turgência jugular", "jugularDistension", session.assessment.jugularDistension, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Edema", "edema", session.assessment.edema, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Estado mental", "mentalStatus", session.assessment.mentalStatus, "Exame clínico e vitais"),
    field("Sinais de choque", "shockSigns", session.assessment.shockSigns, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Killip-Kimball", "killip", session.assessment.killip, "Exame clínico e vitais", {
      presets: [
        { label: "I", value: "1" },
        { label: "II", value: "2" },
        { label: "III", value: "3" },
        { label: "IV", value: "4" },
      ],
    }),
    field("ABC instável", "abcInstability", session.assessment.abcInstability, "Exame clínico e vitais", { presets: binaryPresets() }),
    field("Estabilização inicial", "stabilizationActions", session.assessment.stabilizationActions, "Exame clínico e vitais", {
      fullWidth: true,
    }),

    field("Horário do 1º ECG", "firstEcgTime", session.assessment.firstEcgTime, "ECG estruturado", { placeholder: "HH:MM" }),
    field("ECG seriado", "serialEcg", session.assessment.serialEcg, "ECG estruturado", { presets: binaryPresets() }),
    field("Comparado com ECG prévio", "comparedPrior", session.assessment.comparedPrior, "ECG estruturado", { presets: binaryPresets() }),
    field("Supra de ST", "stElevation", session.assessment.stElevation, "ECG estruturado", { presets: binaryPresets() }),
    field("Infra de ST", "stDepression", session.assessment.stDepression, "ECG estruturado", { presets: binaryPresets() }),
    field("Inversão de T", "twaveInversion", session.assessment.twaveInversion, "ECG estruturado", { presets: binaryPresets() }),
    field("BRE novo / presumivelmente novo", "newBundleBranchBlock", session.assessment.newBundleBranchBlock, "ECG estruturado", { presets: binaryPresets("Sim", "Não", "Em revisão") }),
    field("Ritmo", "ecgRhythm", session.assessment.ecgRhythm, "ECG estruturado"),
    field("FC no ECG", "ecgRate", session.assessment.ecgRate, "ECG estruturado", { keyboardType: "numeric" }),
    field("Território provável", "territory", session.assessment.territory, "ECG estruturado"),
    field("Parede inferior", "inferior", session.assessment.inferior, "ECG estruturado", { presets: binaryPresets() }),
    field("Parede anterior", "anterior", session.assessment.anterior, "ECG estruturado", { presets: binaryPresets() }),
    field("Parede lateral", "lateral", session.assessment.lateral, "ECG estruturado", { presets: binaryPresets() }),
    field("Parede posterior", "posterior", session.assessment.posterior, "ECG estruturado", { presets: binaryPresets() }),
    field("Suspeita de VD", "rvInvolvement", session.assessment.rvInvolvement, "ECG estruturado", { presets: binaryPresets() }),
    field("ECG inconclusivo / normal", "inconclusive", session.assessment.inconclusive, "ECG estruturado", { presets: binaryPresets() }),
    field("Precisa derivações adicionais", "additionalLeadsNeeded", session.assessment.additionalLeadsNeeded, "ECG estruturado", { presets: binaryPresets() }),
    field("Interpretação / observações", "ecgNotes", session.assessment.ecgNotes, "ECG estruturado", { fullWidth: true }),

    field("Tipo de troponina", "troponinType", session.assessment.troponinType, "Troponina e biomarcadores", {
      presets: [
        { label: "Alta sensibilidade", value: "alta_sensibilidade" },
        { label: "Convencional", value: "convencional" },
      ],
    }),
    field("Troponina 1 — hora", "troponin1Time", session.assessment.troponin1Time, "Troponina e biomarcadores", { placeholder: "HH:MM" }),
    field("Troponina 1 — valor", "troponin1Value", session.assessment.troponin1Value, "Troponina e biomarcadores", { keyboardType: "decimal-pad" }),
    field("Limite de referência", "labReference", session.assessment.labReference, "Troponina e biomarcadores", { keyboardType: "decimal-pad" }),
    field("Troponina 2 — hora", "troponin2Time", session.assessment.troponin2Time, "Troponina e biomarcadores", { placeholder: "HH:MM" }),
    field("Troponina 2 — valor", "troponin2Value", session.assessment.troponin2Value, "Troponina e biomarcadores", { keyboardType: "decimal-pad" }),
    field("Troponina 3 — hora", "troponin3Time", session.assessment.troponin3Time, "Troponina e biomarcadores", { placeholder: "HH:MM" }),
    field("Troponina 3 — valor", "troponin3Value", session.assessment.troponin3Value, "Troponina e biomarcadores", { keyboardType: "decimal-pad" }),

    field("Hemodinâmica disponível", "cathLabAvailable", session.assessment.cathLabAvailable, "Logística de reperfusão", { presets: binaryPresets() }),
    field("Atraso estimado para PCI (min)", "expectedPciDelayMin", session.assessment.expectedPciDelayMin, "Logística de reperfusão", { keyboardType: "numeric" }),
    field("Trombólise disponível", "fibrinolysisAvailable", session.assessment.fibrinolysisAvailable, "Logística de reperfusão", { presets: binaryPresets() }),
    field("Hora do diagnóstico", "diagnosisTime", session.assessment.diagnosisTime, "Logística de reperfusão", { placeholder: "HH:MM" }),
    field("Hora da decisão", "decisionTime", session.assessment.decisionTime, "Logística de reperfusão", { placeholder: "HH:MM" }),
    field("Início da reperfusão", "reperfusionStartTime", session.assessment.reperfusionStartTime, "Logística de reperfusão", { placeholder: "HH:MM" }),
    field("Hora da transferência", "transferTime", session.assessment.transferTime, "Logística de reperfusão", { placeholder: "HH:MM" }),

    field("Categoria sugerida", "_classification", snapshot.classification.category, "Classificação clínica", {
      helperText: "Sugestão do sistema; nunca substitui a decisão médica final.",
      fullWidth: true,
    }),
    field("Justificativa da classificação", "_classification_rationale", snapshot.classification.rationale.join(" | "), "Classificação clínica", {
      fullWidth: true,
    }),
  ];

  THROMBOLYSIS_CONTRAS.forEach((item) => {
    fields.push(...statusField("Contraindicações à trombólise", item.id, item.name, `${item.description} | ${item.impact}`));
  });

  fields.push(
    field("Trombolítico preferido", "selectedLyticId", session.assessment.selectedLyticId, "Estratégia terapêutica e medicações", {
      presets: LYTIC_REGIMENS.map((item) => ({ label: item.label, value: item.id })),
    }),
    field("Anticoagulação preferida", "selectedAnticoagId", session.assessment.selectedAnticoagId, "Estratégia terapêutica e medicações", {
      presets: ANTICOAG_REGIMENS.map((item) => ({ label: item.label, value: item.id })),
    }),
    field("Decisão médica final", "finalMedicalDecision", session.assessment.finalMedicalDecision, "Estratégia terapêutica e medicações", {
      fullWidth: true,
      presets: [
        { label: "STEMI — angioplastia primária", value: "STEMI — angioplastia primária" },
        { label: "STEMI — trombólise", value: "STEMI — trombólise" },
        { label: "NSTEMI / UA — estratégia invasiva", value: "NSTEMI / UA — estratégia invasiva" },
        { label: "Observação com protocolo de dor torácica", value: "Observação com protocolo de dor torácica" },
        { label: "DAC crônica / angina estável", value: "DAC crônica / angina estável" },
      ],
    }),
    field("Dupla checagem", "doubleCheckStatus", session.assessment.doubleCheckStatus, "Estratégia terapêutica e medicações", {
      helperText: "Obrigatório antes de trombólise e decisões de alto risco.",
      presets: [
        { label: "Pendente", value: "Pendente" },
        { label: "Conferido por dupla checagem", value: "Conferido por dupla checagem" },
      ],
    }),
    field("Checklist pós-conduta", "postCareChecklist", session.assessment.postCareChecklist, "Destino, checklist e auditoria", {
      fullWidth: true,
    }),
    field("Destino manual / observação", "destinationOverride", session.assessment.destinationOverride, "Destino, checklist e auditoria", {
      fullWidth: true,
      placeholder: DESTINATION_LABELS[snapshot.destination.recommended],
    }),
    field("Comentário de auditoria", "auditComment", session.assessment.auditComment, "Destino, checklist e auditoria", {
      fullWidth: true,
    })
  );

  return fields;
}

function buildMetrics(snapshot: CoronarySnapshot) {
  return [
    {
      label: "PA (PAS/PAD)",
      value:
        snapshot.exam.systolicPressure != null && snapshot.exam.diastolicPressure != null
          ? `${snapshot.exam.systolicPressure}/${snapshot.exam.diastolicPressure} mmHg`
          : "⚠️ PA pendente",
    },
    {
      label: "PAM",
      value: snapshot.exam.meanArterialPressure != null ? `${snapshot.exam.meanArterialPressure} mmHg` : "⚠️ PAM pendente",
    },
    {
      label: "Categoria",
      value: snapshot.classification.category,
    },
    {
      label: "ECG",
      value: snapshot.ecg.stElevation === "yes" ? "Supra de ST" : snapshot.ecg.inconclusive === "yes" ? "⚠️ ECG inconclusivo" : "Sem supra",
    },
    {
      label: "Troponina",
      value: snapshot.biomarkers.troponin1Value != null ? `${snapshot.biomarkers.troponin1Value}` : "⚠️ Troponina pendente",
    },
    {
      label: "Estratégia",
      value: snapshot.treatment.reperfusion.label,
    },
  ];
}

function buildRecommendations(snapshot: CoronarySnapshot): AuxiliaryPanelRecommendation[] {
  const recommendations: AuxiliaryPanelRecommendation[] = [];
  const dangerTone = snapshot.classification.category === "stemi" ? "danger" : "warning";

  recommendations.push({
    title: snapshot.treatment.reperfusion.label,
    tone:
      snapshot.treatment.reperfusion.gate === "eligible"
        ? dangerTone
        : snapshot.treatment.reperfusion.gate === "correctable"
          ? "warning"
          : "danger",
    priority: "high",
    lines: [
      ...snapshot.treatment.reperfusion.rationale,
      ...snapshot.treatment.reperfusion.blockers.map((line) => `Bloqueio: ${line}`),
      ...snapshot.treatment.reperfusion.correctableItems.map((line) => `Correção: ${line}`),
    ],
  });

  recommendations.push({
    title: snapshot.treatment.invasiveStrategy.label,
    tone:
      snapshot.treatment.invasiveStrategy.gate === "eligible"
        ? "warning"
        : snapshot.treatment.invasiveStrategy.gate === "needs_serial_data"
          ? "warning"
          : "info",
    priority: "high",
    lines: [
      ...snapshot.treatment.invasiveStrategy.rationale,
      ...snapshot.treatment.invasiveStrategy.blockers.map((line) => `Bloqueio: ${line}`),
      ...snapshot.treatment.invasiveStrategy.correctableItems.map((line) => `Pendência: ${line}`),
    ],
  });

  recommendations.push({
    title: snapshot.treatment.fibrinolysis.label,
    tone:
      snapshot.treatment.fibrinolysis.gate === "eligible"
        ? "warning"
        : snapshot.treatment.fibrinolysis.gate === "blocked"
          ? "danger"
          : "info",
    priority: "medium",
    lines: [
      ...snapshot.treatment.fibrinolysis.rationale,
      ...snapshot.treatment.fibrinolysis.blockers.map((line) => `Bloqueio: ${line}`),
      ...snapshot.treatment.fibrinolysis.correctableItems.map((line) => `Correção: ${line}`),
    ],
  });

  recommendations.push({
    title: `Calculadora — ${snapshot.treatment.lyticDose.title || "Trombolítico"}`,
    tone: "info",
    priority: "medium",
    lines: [
      ...snapshot.treatment.lyticDose.lines,
      ...snapshot.treatment.lyticDose.caution,
      snapshot.patient.estimatedWeight ? "Atenção: peso estimado aumenta risco de erro de dose." : "",
    ].filter(Boolean),
  });

  recommendations.push({
    title: `Calculadora — ${snapshot.treatment.anticoagDose.title || "Anticoagulação"}`,
    tone: "info",
    priority: "medium",
    lines: [...snapshot.treatment.anticoagDose.lines, ...snapshot.treatment.anticoagDose.caution],
  });

  snapshot.treatment.medications.forEach((med) => {
    recommendations.push({
      title: med.label,
      tone:
        med.status === "indicated"
          ? "info"
          : med.status === "contraindicated"
            ? "danger"
            : "warning",
      priority: "low",
      lines: [
        `Status: ${med.status}`,
        ...med.rationale,
      ],
    });
  });

  buildCoronaryPrescriptionTemplates(snapshot).forEach((template) => {
    recommendations.push({
      title: template.title,
      tone: template.tone,
      priority: "medium",
      lines: template.lines,
    });
  });

  return recommendations.slice(0, 12);
}

function buildAuxiliaryPanel(snapshot: CoronarySnapshot): AuxiliaryPanel | null {
  if (session.currentStateId !== "coronary_workflow") return null;
  return {
    title: "❤️ Síndromes coronarianas",
    description: "Fluxo completo para STEMI, NSTEMI, angina instável e angina estável / DAC crônica.",
    fields: buildFields(snapshot),
    metrics: buildMetrics(snapshot),
    actions: [],
    recommendations: buildRecommendations(snapshot),
  };
}

function buildHistoryLog(): ClinicalLogEntry[] {
  return session.auditTrail.map((entry) => ({
    timestamp: entry.timestamp,
    kind: entry.kind,
    title: entry.label,
    details: [entry.details, entry.metadata ? Object.entries(entry.metadata).map(([key, value]) => `${key}: ${value}`).join(" • ") : ""]
      .filter(Boolean)
      .join(" | "),
  }));
}

function buildEncounterSummary(snapshot: CoronarySnapshot): EncounterSummary {
  return {
    protocolId: session.protocolId,
    durationLabel: formatElapsed(session.protocolStartedAt),
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
    metrics: [
      { label: "Categoria", value: snapshot.classification.category },
      { label: "ECG", value: snapshot.ecg.stElevation === "yes" ? "Supra" : snapshot.ecg.stDepression === "yes" ? "Infra" : "Sem supra" },
      { label: "Troponina", value: snapshot.biomarkers.troponin1Value != null ? `${snapshot.biomarkers.troponin1Value}` : "Pendente" },
      { label: "Destino", value: DESTINATION_LABELS[snapshot.destination.recommended] },
    ],
    panelMetrics: [
      { label: "Paciente", value: snapshot.patient.patientName || "Não identificado" },
      { label: "Dor início", value: snapshot.pain.onsetTime || "Não informado" },
      { label: "Chegada", value: snapshot.pain.arrivalTime || "Não informado" },
      { label: "1º ECG", value: snapshot.ecg.firstEcgTime || "Não informado" },
      { label: "Categoria", value: snapshot.classification.category },
      { label: "ECG", value: snapshot.ecg.stElevation === "yes" ? "Supra de ST" : snapshot.ecg.inconclusive === "yes" ? "Inconclusivo" : "Sem supra persistente" },
      { label: "Troponina", value: snapshot.biomarkers.troponin1Value != null ? `${snapshot.biomarkers.troponin1Value}` : "Pendente" },
      { label: "HEART", value: snapshot.scores.heart.value != null ? `${snapshot.scores.heart.value} · ${snapshot.scores.heart.tier}` : "Incompleto" },
      { label: "TIMI", value: snapshot.scores.timi.value != null ? `${snapshot.scores.timi.value} · ${snapshot.scores.timi.tier}` : "Incompleto" },
      { label: "GRACE", value: snapshot.scores.grace.value != null ? `${snapshot.scores.grace.value} · ${snapshot.scores.grace.tier}` : "Incompleto" },
      { label: "Killip", value: snapshot.scores.killip.value != null ? `${snapshot.scores.killip.value} · ${snapshot.scores.killip.tier}` : "Incompleto" },
      { label: "Reperfusão", value: snapshot.treatment.reperfusion.label },
      { label: "Destino", value: DESTINATION_LABELS[snapshot.destination.recommended] },
    ],
  };
}

function buildSummaryText(snapshot: CoronarySnapshot) {
  const lines = [
    "Síndromes Coronarianas — resumo clínico",
    `Duração da sessão: ${formatElapsed(session.protocolStartedAt)}`,
    "",
    `Profissional: ${snapshot.patient.responsibleClinician || "Não identificado"}`,
    `Paciente: ${snapshot.patient.patientName || "Não identificado"} ${snapshot.patient.patientId ? `(${snapshot.patient.patientId})` : ""}`,
    `Idade/sexo: ${snapshot.patient.age ?? "—"} / ${snapshot.patient.sex || "—"}`,
    `Peso/altura: ${snapshot.patient.weightKg ?? "—"} kg / ${snapshot.patient.heightCm ?? "—"} cm`,
    `Tempos: dor ${snapshot.pain.onsetTime || "—"} · última vez sem dor ${snapshot.pain.lastPainFreeTime || "—"} · chegada ${snapshot.pain.arrivalTime || "—"}`,
    `Categoria sugerida: ${snapshot.classification.category}`,
    `Dor: ${snapshot.pain.chestPainType || "—"} | ${snapshot.pain.subjectiveClassification || "—"}`,
    `ECG: 1º ECG ${snapshot.ecg.firstEcgTime || "—"} · supra ${snapshot.ecg.stElevation} · infra ${snapshot.ecg.stDepression} · território ${snapshot.ecg.territory || "—"}`,
    `Troponina: ${snapshot.biomarkers.troponin1Value ?? "—"} / ref ${snapshot.biomarkers.labReference ?? "—"} / delta 2ª ${snapshot.biomarkers.troponin2Value ?? "—"}`,
    `Scores: HEART ${snapshot.scores.heart.value ?? "—"} · TIMI ${snapshot.scores.timi.value ?? "—"} · GRACE ${snapshot.scores.grace.value ?? "—"} · Killip ${snapshot.scores.killip.value ?? "—"}`,
    `Reperfusão: ${snapshot.treatment.reperfusion.label}`,
    `Trombólise: ${snapshot.treatment.fibrinolysis.label}`,
    `Estratégia invasiva: ${snapshot.treatment.invasiveStrategy.label}`,
    `Trombolítico: ${snapshot.treatment.lyticDose.title || "—"} | ${snapshot.treatment.lyticDose.lines.join(" · ") || "cálculo pendente"}`,
    `Anticoagulação: ${snapshot.treatment.anticoagDose.title || "—"} | ${snapshot.treatment.anticoagDose.lines.join(" · ") || "cálculo pendente"}`,
    `Decisão médica final: ${snapshot.treatment.finalMedicalDecision || "Não registrada"}`,
    `Destino sugerido: ${DESTINATION_LABELS[snapshot.destination.recommended]}`,
    `Checklist pós-conduta: ${session.assessment.postCareChecklist || "—"}`,
    "",
    "Justificativas principais:",
    ...snapshot.treatment.reperfusion.rationale.map((line) => `- ${line}`),
    ...snapshot.treatment.reperfusion.blockers.map((line) => `- Bloqueio: ${line}`),
    ...snapshot.treatment.reperfusion.correctableItems.map((line) => `- Correção: ${line}`),
  ];

  return lines.join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function actorName() {
  return session.assessment.responsibleClinician.trim() || "Profissional não identificado";
}

function persistCurrentSession() {
  saveCoronaryDraft(serializeDraft(session));
}

function getStateTemplate(stateId: string): State {
  const template = protocolData.states[stateId];
  if (!template) throw new Error(`Estado coronariano inválido: ${stateId}`);
  return template;
}

function createSession(): Session {
  const draft = loadCoronaryDraft<ReturnType<typeof serializeDraft>>();
  if (draft?.protocolId === protocolData.id) {
    return {
      protocolId: draft.protocolId,
      currentStateId: draft.currentStateId,
      previousStateIds: draft.previousStateIds ?? [],
      pendingEffects: [],
      protocolStartedAt: draft.protocolStartedAt ?? Date.now(),
      assessment: { ...buildEmptyAssessment(), ...(draft.assessment ?? {}) },
      auditTrail: draft.auditTrail ?? [],
      decisionSignature: draft.decisionSignature ?? "",
    };
  }

  const base: Session = {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    previousStateIds: [],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    assessment: buildEmptyAssessment(),
    auditTrail: [],
    decisionSignature: "",
  };
  base.auditTrail.push(createCoronaryAuditEntry("Sistema", "protocol_started", "Módulo síndromes coronarianas iniciado"));
  return base;
}

let session: Session = createSession();

function buildDecisionSummary(snapshot: CoronarySnapshot) {
  return [
    snapshot.classification.category,
    snapshot.treatment.reperfusion.label,
    snapshot.treatment.fibrinolysis.label,
    snapshot.treatment.invasiveStrategy.label,
    snapshot.destination.recommended,
  ].join("|");
}

function recalculateDecision(reason: string) {
  const snapshot = buildSnapshot(session.assessment);
  const signature = buildDecisionSummary(snapshot);

  session.auditTrail.push(
    createCoronaryAuditEntry(actorName(), "calculation_recomputed", "Classificação e estratégia recalculadas", reason, {
      category: snapshot.classification.category,
      reperfusion: snapshot.treatment.reperfusion.gate,
      fibrinolysis: snapshot.treatment.fibrinolysis.gate,
      invasive: snapshot.treatment.invasiveStrategy.gate,
      destination: snapshot.destination.recommended,
    })
  );

  if (session.decisionSignature && session.decisionSignature !== signature) {
    session.auditTrail.push(
      createCoronaryAuditEntry(actorName(), "decision_changed", "Decisão clínica alterada", signature)
    );
  }

  session.decisionSignature = signature;
  persistCurrentSession();
  return snapshot;
}

function consumeEffects(): EngineEffect[] {
  const effects = session.pendingEffects;
  session.pendingEffects = [];
  return effects;
}

function getCurrentState(): ProtocolState {
  return { ...getStateTemplate(session.currentStateId) };
}

function getCurrentStateId() {
  return session.currentStateId;
}

function transitionTo(nextId: string) {
  session.previousStateIds.push(session.currentStateId);
  session.currentStateId = nextId;
  session.auditTrail.push(createCoronaryAuditEntry(actorName(), "state_changed", "Estado do protocolo alterado", nextId));
  persistCurrentSession();
}

function next(): ProtocolState {
  const current = getCurrentState();
  const currentTemplate = getStateTemplate(session.currentStateId);
  if (current.type === "end") return current;
  if (currentTemplate.next) {
    transitionTo(currentTemplate.next);
  }
  return getCurrentState();
}

function canGoBack() {
  return session.previousStateIds.length > 0;
}

function goBack(): ProtocolState {
  const previous = session.previousStateIds.pop();
  if (!previous) throw new Error("Sem etapa anterior");
  session.currentStateId = previous;
  persistCurrentSession();
  return getCurrentState();
}

function resetSession(): ProtocolState {
  session = createSession();
  persistCurrentSession();
  return getCurrentState();
}

function tick(): ProtocolState {
  return getCurrentState();
}

function getTimers(): TimerState[] {
  return [];
}

function getDocumentationActions(): DocumentationAction[] {
  return [];
}

function getReversibleCauses(): ReversibleCause[] {
  return [];
}

function updateReversibleCauseStatus(): ReversibleCause[] {
  return [];
}

function registerExecution(): ClinicalLogEntry[] {
  return getClinicalLog();
}

function getClinicalLog(): ClinicalLogEntry[] {
  return buildHistoryLog();
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  return buildAuxiliaryPanel(buildSnapshot(session.assessment));
}

function updateAuxiliaryField(fieldId: string, value: string): AuxiliaryPanel | null {
  const previousValue = session.assessment[fieldId] ?? "";
  session.assessment[fieldId] = value;
  session.auditTrail.push(
    createCoronaryAuditEntry(
      actorName(),
      fieldId.startsWith("contra_") && fieldId.endsWith("_notes") ? "correction_logged" : "field_updated",
      `Campo atualizado: ${fieldId}`,
      `${previousValue || "∅"} → ${value || "∅"}`,
      { fieldId }
    )
  );
  recalculateDecision(`Mudança em ${fieldId}`);
  return getAuxiliaryPanel();
}

function applyAuxiliaryPreset(fieldId: string, value: string): AuxiliaryPanel | null {
  return updateAuxiliaryField(fieldId, value);
}

function updateAuxiliaryUnit(): AuxiliaryPanel | null {
  return getAuxiliaryPanel();
}

function updateAuxiliaryStatus(): AuxiliaryPanel | null {
  return getAuxiliaryPanel();
}

function getEncounterSummary(): EncounterSummary {
  return buildEncounterSummary(buildSnapshot(session.assessment));
}

function getEncounterSummaryText(): string {
  return buildSummaryText(buildSnapshot(session.assessment));
}

function getEncounterReportHtml(): string {
  const body = getEncounterSummaryText()
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><title>Síndromes Coronarianas</title></head><body>${body}</body></html>`;
}

recalculateDecision("Inicialização do módulo");

export {
  applyAuxiliaryPreset,
  canGoBack,
  consumeEffects,
  getAuxiliaryPanel,
  getClinicalLog,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getReversibleCauses,
  getTimers,
  goBack,
  next,
  registerExecution,
  resetSession,
  tick,
  updateAuxiliaryField,
  updateAuxiliaryStatus,
  updateAuxiliaryUnit,
  updateReversibleCauseStatus,
};
