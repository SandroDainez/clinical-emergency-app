import protocol from "./protocols/sepse_adulto.json";
import antimicrobialProtocol from "./protocols/sepse_antimicrobianos.json";
import type {
  AuxiliaryPanel,
  AuxiliaryPanelRecommendation,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
  AuxiliaryPanelStatusItem,
  SepsisHubData,
} from "./clinical-engine";

type StateType = "action" | "question" | "end";
type ReversibleCauseStatus = "pendente" | "suspeita" | "abordada";
type BundleStatus = "pendente" | "solicitado" | "realizado";
type Scenario =
  | "suspeita_choque_septico"
  | "sepse_alto_risco"
  | "sepse_risco_moderado";
type PerfusionState =
  | "nao_reavaliada"
  | "adequada"
  | "hipoperfusao_ou_hipotensao"
  | "choque_septico";
type MapState = "desconhecida" | "meta_atingida" | "abaixo_da_meta";
type BundleItemId =
  | "lactato"
  | "culturas"
  | "antibiotico"
  | "fluidos"
  | "vasopressor";

type State = {
  type: StateType;
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
};

type ProtocolReversibleCause = {
  id: string;
  label: string;
  actions: string[];
};

type Protocol = {
  id: string;
  initialState: string;
  reversibleCauses?: ProtocolReversibleCause[];
  states: Record<string, State>;
};

type AntimicrobialAdjustment = {
  maxCrCl: number;
  instruction: string;
  adjustedDose?: string;
  adjustedInterval?: string;
  note?: string;
};

type AntimicrobialDrug = {
  name: string;
  dose: string;
  interval: string;
  renalDefault?: string;
  renalAdjustments?: AntimicrobialAdjustment[];
  hemodialysisAdjustment?: {
    adjustedDose: string;
    adjustedInterval: string;
    note?: string;
  };
  dialysisAdjustments?: Partial<Record<
    "HD" | "CRRT" | "CAPD",
    {
      adjustedDose: string;
      adjustedInterval: string;
      note?: string;
    }
  >>;
};

type AntimicrobialRegimen = {
  title: string;
  drugs: AntimicrobialDrug[];
};

type AntimicrobialFocus = {
  label: string;
  baseRegimen: AntimicrobialRegimen;
  highRiskRegimen?: AntimicrobialRegimen;
  mrsaAddon?: AntimicrobialRegimen;
  betaLactamAllergyAlternative?: AntimicrobialRegimen;
};

type AntimicrobialProtocol = {
  defaultNotes: string[];
  focuses: Record<string, AntimicrobialFocus>;
};

type Event = {
  timestamp: number;
  type: string;
  data?: Record<string, string | number | boolean | undefined>;
};

type Session = {
  protocolId: string;
  currentStateId: string;
  previousStateIds: string[];
  history: Event[];
  pendingEffects: EngineEffect[];
  reversibleCauseStatuses: Record<string, ReversibleCauseStatus>;
  stateEntrySequence: number;
  recognitionAt?: number;
  scenario?: Scenario;
  antibioticDueAt?: number;
  antibioticReminderNextAt?: number;
  bundle: Record<BundleItemId, BundleStatus>;
  perfusionState: PerfusionState;
  mapState: MapState;
  septicShockRecognized: boolean;
  vasopressinSuggested: boolean;
  inotropeConsidered: boolean;
  sourceControlAddressed: boolean;
  destination?: string;
  assessment: {
    // ── Identificação ──────────────────────────────────────
    age: string;
    sex: string;
    weightKg: string;
    heightCm: string;           // novo — para calcular IMC
    // ── Apresentação clínica ───────────────────────────────
    arrivalTime: string;        // hora de chegada
    symptomOnset: string;       // início dos sintomas
    chiefComplaint: string;     // queixa principal
    historyPresentIllness: string; // HDA resumida
    // ── Antecedentes ───────────────────────────────────────
    comorbidities: string;
    currentMedications: string; // medicações de uso contínuo
    allergies: string;          // alergias (destaque para ATB)
    // ── Sinais vitais ──────────────────────────────────────
    heartRate: string;          // FC
    systolicPressure: string;   // PAS
    diastolicPressure: string;  // PAD  → PAM calculada automaticamente
    respiratoryRate: string;    // FR   → ponto qSOFA
    temperature: string;        // Temperatura
    oxygenSaturation: string;   // SpO2
    gcs: string;                // GCS  → ponto qSOFA
    mentalStatus: string;       // estado mental / confusão
    capillaryRefill: string;    // TEC
    urineOutput: string;        // Diurese
    // ── Exame físico ───────────────────────────────────────
    cardiacAuscultation: string;  // AC
    pulmonaryAuscultation: string; // AP
    abdominalExam: string;      // Abdome
    extremities: string;        // Extremidades
    hydrationStatus: string;    // Estado de hidratação
    skinMucosae: string;        // Pele e mucosas
    hypoperfusionSigns: string; // Sinais de hipoperfusão
    respiratoryPattern: string; // Padrão respiratório
    // ── Exames laboratoriais ───────────────────────────────
    lactateValue: string;
    lactateUnit: string;
    creatinineValue: string;
    creatinineUnit: string;
    // ── SOFA (Sepsis-3) — dados laboratoriais adicionais ────────────────
    platelets: string;       // Plaquetas (×10³/µL) — hemostasia SOFA
    bilirubinTotal: string;  // Bilirrubina total (mg/dL) — fígado SOFA
    pao2: string;            // PaO2 (mmHg) — gasometria, opcional
    urineOutputMlh: string;  // Diurese (mL/h) — rim SOFA (complementa creatinina)
    // ── Hemograma ─────────────────────────────────────────
    wbc: string;             // Leucócitos (×10³/µL)
    hemoglobin: string;      // Hemoglobina (g/dL)
    // ── Inflamação / biomarcadores ────────────────────────
    crp: string;             // PCR (mg/L)
    procalcitonin: string;   // Procalcitonina (ng/mL)
    // ── Coagulação ────────────────────────────────────────
    inr: string;             // INR
    // ── Ionograma ─────────────────────────────────────────
    sodium: string;          // Sódio (mEq/L)
    potassium: string;       // Potássio (mEq/L)
    // ── Gasometria ────────────────────────────────────────
    ph: string;              // pH
    paco2: string;           // PaCO2 (mmHg)
    hco3: string;            // HCO3 (mEq/L)
    baseExcess: string;      // BE (mEq/L)
    // ── Marcadores cardíacos ──────────────────────────────
    troponin: string;        // Troponina (ng/mL)
    bnp: string;             // BNP ou NT-proBNP (pg/mL)
    // ── Hipóteses e condutas ──────────────────────────────
    suspectedSource: string;    // foco infeccioso suspeito
    diagnosticHypothesis: string; // hipóteses diagnósticas
    requestedExams: string;     // exames complementares solicitados
    antibioticDetails: string;  // ATB selecionado + dose (livre)
    otherMeasures: string;      // demais condutas
    // ── Estabilização ──────────────────────────────────────────
    oxygenTherapy: string;      // Oxigenoterapia
    fluidResuscitation: string; // Ressuscitação volêmica
    vascularAccess: string;     // Acesso vascular
    vasopressorUse: string;     // Drogas vasoativas
    intubationDecision: string; // IOT / VM
    urinaryCatheter: string;    // Sondagem vesical
    clinicalMonitoring: string; // Monitorização
    stabilizationNotes: string; // Notas livres
    // ── Contexto antimicrobiano ────────────────────────────
    careSetting: string;
    mdrRisk: string;
    mrsaRisk: string;
    betaLactamAllergy: string;
    dialysisMode: string;
    // ── Conduta / destino ─────────────────────────────────
    patientDestination: string; // Destino do paciente
    additionalMeasures: string; // Outras condutas auto-sugeridas
    // ── Fluxo UTI — paciente já internado em piora ────────────
    icuScenario: string;                // Situação atual (novo/já tratado/pós-estab.)
    icuClinicalEvolution: string;       // Manifestação da piora
    icuComplication: string;            // Complicação infecciosa suspeita (VAP, CRBSI, etc.)
    sedationStatus: string;             // Status de sedação / nível de consciência
    rassScore: string;                  // RASS — Richmond Agitation-Sedation Scale
    preIntubationGcs: string;           // GCS pré-sedação ou última avaliação neurológica
    ventilationMode: string;            // Modo ventilatório atual
    ventilatorFio2: string;             // FiO2 atual no ventilador (%)
    ventilatorPeep: string;             // PEEP atual (cmH2O)
    icuAdmissionDays: string;           // Dias de internação UTI
    invasiveDevices: string;            // Dispositivos invasivos presentes
    currentAntibioticsRegimen: string;  // ATB em uso + dia de tratamento
    previousClinicalResponse: string;   // Resposta clínica ao ATB atual
    newCulturesOrdered: string;         // Novas culturas coletadas (hoje)?
    currentCulturesResult: string;      // Resultado de culturas
    antibioticEscalation: string;       // Decisão de ajuste ATB (auto-sugerida)
    currentVasopressorDoses: string;    // Vasopressores atuais + dose
    sofaTrend: string;                  // Tendência do SOFA (melhorando/piorando)
    icuManagementNotes: string;         // Notas adicionais UTI
    // ── Precauções de isolamento ──────────────────────────────
    isolationPrecautions: string;        // Tipo de isolamento implementado
    rectalSwabOrdered: string;           // Swab retal para rastreio de MDR
  };
  flowType?: "emergencia" | "uti_internado"; // Tipo de fluxo selecionado
};

const protocolData = protocol as Protocol;
const antimicrobialData = antimicrobialProtocol as AntimicrobialProtocol;
const ANTIBIOTIC_ONE_HOUR_MS = 60 * 60 * 1000;
const ANTIBIOTIC_REMINDER_INTERVAL_MS = 15 * 60 * 1000;

function createSession(): Session {
  return {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    previousStateIds: [],
    history: [],
    pendingEffects: [],
    reversibleCauseStatuses: {},
    stateEntrySequence: 0,
    antibioticReminderNextAt: undefined,
    bundle: {
      lactato: "pendente",
      culturas: "pendente",
      antibiotico: "pendente",
      fluidos: "pendente",
      vasopressor: "pendente",
    },
    perfusionState: "nao_reavaliada",
    mapState: "desconhecida",
    septicShockRecognized: false,
    vasopressinSuggested: false,
    inotropeConsidered: false,
    sourceControlAddressed: false,
    assessment: {
      // Identificação
      age: "",
      sex: "",
      weightKg: "",
      heightCm: "",
      // Apresentação
      arrivalTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      symptomOnset: "",
      chiefComplaint: "",
      historyPresentIllness: "",
      // Antecedentes
      comorbidities: "",
      currentMedications: "",
      allergies: "",
      // Sinais vitais
      heartRate: "",
      systolicPressure: "",
      diastolicPressure: "",
      respiratoryRate: "",
      temperature: "",
      oxygenSaturation: "",
      gcs: "",
      mentalStatus: "",
      capillaryRefill: "",
      urineOutput: "",
      // Exame físico
      cardiacAuscultation: "",
      pulmonaryAuscultation: "",
      abdominalExam: "",
      extremities: "",
      hydrationStatus: "",
      skinMucosae: "",
      hypoperfusionSigns: "",
      respiratoryPattern: "",
      // Laboratorial
      lactateValue: "",
      lactateUnit: "mmol/L",
      creatinineValue: "",
      creatinineUnit: "mg/dL",
      platelets: "",
      bilirubinTotal: "",
      pao2: "",
      urineOutputMlh: "",
      wbc: "",
      hemoglobin: "",
      crp: "",
      procalcitonin: "",
      inr: "",
      sodium: "",
      potassium: "",
      ph: "",
      paco2: "",
      hco3: "",
      baseExcess: "",
      troponin: "",
      bnp: "",
      // Hipóteses e condutas
      suspectedSource: "",
      diagnosticHypothesis: "",
      requestedExams: "",
      antibioticDetails: "",
      otherMeasures: "",
      oxygenTherapy: "",
      fluidResuscitation: "",
      vascularAccess: "",
      vasopressorUse: "",
      intubationDecision: "",
      urinaryCatheter: "",
      clinicalMonitoring: "",
      stabilizationNotes: "",
      // Contexto antimicrobiano
      careSetting: "Comunitário",
      mdrRisk: "Baixo",
      mrsaRisk: "Não",
      betaLactamAllergy: "Não",
      dialysisMode: "Não",
      patientDestination: "",
      additionalMeasures: "",
      icuScenario: "",
      icuClinicalEvolution: "",
      icuComplication: "",
      sedationStatus: "",
      rassScore: "",
      preIntubationGcs: "",
      ventilationMode: "",
      ventilatorFio2: "",
      ventilatorPeep: "",
      icuAdmissionDays: "",
      invasiveDevices: "",
      currentAntibioticsRegimen: "",
      previousClinicalResponse: "",
      newCulturesOrdered: "",
      currentCulturesResult: "",
      antibioticEscalation: "",
      currentVasopressorDoses: "",
      sofaTrend: "",
      icuManagementNotes: "",
      isolationPrecautions: "",
      rectalSwabOrdered: "",
    },
  };
}

let session = createSession();

function now() {
  return Date.now();
}

function logEvent(type: string, data?: Event["data"]) {
  session.history.push({
    timestamp: now(),
    type,
    data,
  });
}

function enqueueEffect(effect: EngineEffect) {
  session.pendingEffects.push(effect);
}

function getCurrentTemplate() {
  const state = protocolData.states[session.currentStateId];
  if (!state) {
    throw new Error(`Estado inválido: ${session.currentStateId}`);
  }
  return state;
}

function getReferenceTimestamp() {
  return session.recognitionAt ?? session.history[0]?.timestamp ?? now();
}

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatSecondsLabel(seconds: number) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function withRelativeTime(timestamp: number, details?: string) {
  const label = formatElapsedTime(timestamp - getReferenceTimestamp());
  return details ? `${label} • ${details}` : label;
}

function ensureRecognitionStarted() {
  if (session.recognitionAt !== undefined) {
    return;
  }

  session.recognitionAt = now();
  logEvent("SEPSIS_RECOGNIZED");
}

function getCurrentStateId() {
  return session.currentStateId;
}

function consumeEffects() {
  const effects = [...session.pendingEffects];
  session.pendingEffects = [];
  return effects;
}

function getTimers(): TimerState[] {
  if (!session.antibioticDueAt || session.bundle.antibiotico === "realizado") {
    return [];
  }

  const remainingMs = Math.max(0, session.antibioticDueAt - now());
  const durationSeconds = Math.ceil(ANTIBIOTIC_ONE_HOUR_MS / 1000);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return [
    {
      duration: durationSeconds,
      remaining: remainingSeconds,
    },
  ];
}

function getSepsisHubData(): SepsisHubData | null {
  if (session.protocolId !== protocolData.id) {
    return null;
  }

  const timer = getTimers()[0];
  const nextAlertMs =
    session.antibioticReminderNextAt && session.bundle.antibiotico !== "realizado"
      ? Math.max(0, session.antibioticReminderNextAt - now())
      : undefined;

  const summaryLines: string[] = [];
  summaryLines.push(session.assessment.age ? `${session.assessment.age} anos` : "Idade pendente");
  summaryLines.push(session.assessment.sex || "Sexo pendente");
  summaryLines.push(session.assessment.weightKg ? `${session.assessment.weightKg} kg` : "Peso pendente");
  summaryLines.push(
    session.assessment.symptomOnset
      ? `Início dos sintomas: ${session.assessment.symptomOnset}`
      : "Início dos sintomas pendente"
  );
  summaryLines.push(
    session.assessment.suspectedSource ? `Foco suspeito: ${session.assessment.suspectedSource}` : "Foco suspeito pendente"
  );
  summaryLines.push(
    session.assessment.comorbidities ? `Comorbidades: ${session.assessment.comorbidities}` : "Comorbidades pendentes"
  );

  return {
    recognitionElapsed: formatElapsedTime(now() - getReferenceTimestamp()),
    scenarioLabel: getScenarioLabel(),
    focusLabel: getSourceControlLabel(),
    patientSummary: summaryLines,
    assessmentSummary: getAssessmentSummary(),
    bundleItems: buildBundleStatusItems(),
    pendingBundleCount: getPendingBundleCount(),
    antibioticTimer: timer
      ? {
          durationLabel: formatSecondsLabel(timer.duration),
          remainingLabel: formatSecondsLabel(timer.remaining),
          nextAlertLabel: nextAlertMs ? formatElapsedTime(nextAlertMs) : undefined,
        }
      : undefined,
  };
}

function getReversibleCauses(): ReversibleCause[] {
  return (protocolData.reversibleCauses ?? []).map((cause) => ({
    ...cause,
    status: session.reversibleCauseStatuses[cause.id] ?? "pendente",
  }));
}

function getScenarioLabel() {
  if (session.scenario === "suspeita_choque_septico") {
    return "Sepse com suspeita de choque séptico";
  }
  if (session.scenario === "sepse_alto_risco") {
    return "Sepse";
  }
  if (session.scenario === "sepse_risco_moderado") {
    return "Infecção suspeita sem critérios suficientes para sepse";
  }
  return "Não definido";
}

function getPerfusionLabel() {
  if (session.perfusionState === "adequada") {
    return "Adequada";
  }
  if (session.perfusionState === "hipoperfusao_ou_hipotensao") {
    return "Hipoperfusão / hipotensão";
  }
  if (session.perfusionState === "choque_septico") {
    return "Choque séptico";
  }
  return "Ainda não reavaliada";
}

function getMapLabel() {
  if (session.mapState === "meta_atingida") {
    return "Meta atingida";
  }
  if (session.mapState === "abaixo_da_meta") {
    return "Abaixo de 65 mmHg";
  }
  return "Não reavaliada";
}

function getBundleStatusLabel(status: BundleStatus) {
  if (status === "solicitado") {
    return "Solicitado";
  }
  if (status === "realizado") {
    return "Realizado";
  }
  return "Pendente";
}

function getPendingBundleCount() {
  return Object.values(session.bundle).filter((status) => status !== "realizado").length;
}

function getSourceControlLabel() {
  return session.sourceControlAddressed ? "Abordado" : "Pendente";
}

function parseNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTokens(value: string) {
  return value
    .split(" | ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function toggleTokenValue(currentValue: string, token: string) {
  const items = normalizeTokens(currentValue);
  const normalizedToken = token.trim();
  const exists = items.some((item) => item.toLowerCase() === normalizedToken.toLowerCase());
  const next = exists
    ? items.filter((item) => item.toLowerCase() !== normalizedToken.toLowerCase())
    : [...items, normalizedToken];
  return next.join(" | ");
}

function getCalculatedMap() {
  const systolic = parseNumber(session.assessment.systolicPressure);
  const diastolic = parseNumber(session.assessment.diastolicPressure);

  if (systolic === null || diastolic === null) {
    return null;
  }

  return (systolic + 2 * diastolic) / 3;
}

function getCalculatedBmi() {
  const weight = parseNumber(session.assessment.weightKg);
  const heightCm = parseNumber(session.assessment.heightCm);

  if (weight === null || weight <= 0 || heightCm === null || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

function getBmiLabel() {
  const bmi = getCalculatedBmi();
  if (bmi === null) {
    return "Não calculado";
  }

  const category =
    bmi < 18.5
      ? "Baixo peso"
      : bmi < 25
        ? "Normal"
        : bmi < 30
          ? "Sobrepeso"
          : bmi < 35
            ? "Obesidade G1"
            : bmi < 40
              ? "Obesidade G2"
              : "Obesidade G3";

  return `${formatDecimal(bmi, 1)} kg/m² (${category})`;
}

function getQsofaScore() {
  let score = 0;

  const fr = parseNumber(session.assessment.respiratoryRate);
  if (fr !== null && fr >= 22) {
    score += 1;
  }

  const pas = parseNumber(session.assessment.systolicPressure);
  if (pas !== null && pas <= 100) {
    score += 1;
  }

  const mental = session.assessment.mentalStatus.trim().toLowerCase();
  const gcs = parseNumber(session.assessment.gcs);
  const hasAlteredMental =
    /confus|rebaixa|desorien|agita|sonolen|torpor|coma|glasgow/.test(mental) ||
    (gcs !== null && gcs < 15);
  if (hasAlteredMental) {
    score += 1;
  }

  return score;
}

function getQsofaLabel() {
  const score = getQsofaScore();
  const fr = parseNumber(session.assessment.respiratoryRate);
  const pas = parseNumber(session.assessment.systolicPressure);

  const gcsForLabel = parseNumber(session.assessment.gcs);
  if (fr === null && pas === null && gcsForLabel === null) {
    return "Preencher FR, PAS e GCS";
  }

  const risk =
    score >= 2 ? "⚠️ ALTO RISCO — ativar protocolo" : score === 1 ? "Risco intermediário" : "Baixo risco";
  return `qSOFA: ${score}/3 — ${risk}`;
}

// ── Classificação automática (Sepsis-3) ────────────────────────────────────
function getSuggestedMainDiagnosis(): { value: string; label: string } | null {
  const qsofa   = getQsofaScore();
  const map     = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const sofa    = calculateSofa2Score();

  const hasAnyData =
    session.assessment.respiratoryRate.trim() ||
    session.assessment.systolicPressure.trim() ||
    session.assessment.gcs.trim() ||
    session.assessment.lactateValue.trim();
  if (!hasAnyData) return null;

  // Choque séptico (Sepsis-3): necessidade de vasopressor para manter PAM ≥ 65 + lactato > 2 após volume adequado.
  const hasVasopressor = /noradrenalina|vasopressina|dopamina|dobutamina/i.test(
    session.assessment.vasopressorUse
  );
  if (hasVasopressor && lactate !== null && lactate > 2) {
    return { value: "Choque séptico", label: "Choque séptico — vasopressor + lactato > 2 após ressuscitação (Sepsis-3)" };
  }

  // Sepse: suspeita de infecção + disfunção orgânica confirmada
  // SOFA ≥ 2 é o critério formal. qSOFA é ferramenta de triagem, não critério diagnóstico.
  if (sofa !== null && sofa.total >= 2) {
    return { value: "Sepse", label: `Sepse — SOFA ${sofa.total} ≥ 2 (disfunção orgânica confirmada)` };
  }
  if (qsofa >= 2 || (lactate !== null && lactate >= 2)) {
    const basis = qsofa >= 2 ? `qSOFA ${qsofa}` : `lactato ${lactate?.toFixed(1)} mmol/L`;
    return { value: "Alto risco de sepse", label: `Alto risco de sepse — ${basis}; completar avaliação e SOFA` };
  }

  // Sepse possível / alto risco: qSOFA 1 com foco suspeito
  if (qsofa === 1 && session.assessment.suspectedSource.trim()) {
    return { value: "Sepse possível — alto risco", label: "Sepse possível — qSOFA 1 com foco suspeito (aguardar exames)" };
  }

  // Infecção suspeita sem critérios
  if (session.assessment.suspectedSource.trim() || session.assessment.chiefComplaint.trim()) {
    return { value: "Infecção suspeita sem critérios de sepse", label: "Infecção suspeita — sem critérios Sepsis-3 no momento" };
  }

  return null;
}

// ── FiO2 estimada a partir do modo de O2 selecionado ──────────────────────
function getEstimatedFio2(): number {
  const o2 = session.assessment.oxygenTherapy.toLowerCase();
  if (!o2 || /sem suporte|sem o2|não/i.test(o2)) return 0.21;
  if (/cateter nasal.*6|6.*l/i.test(o2))   return 0.44;
  if (/cateter nasal.*4|4.*l/i.test(o2))   return 0.36;
  if (/cateter nasal.*2|2.*l/i.test(o2))   return 0.28;
  if (/cateter nasal/i.test(o2))            return 0.32;
  if (/venturi/i.test(o2))                  return 0.40;
  if (/reservatório|reservat/i.test(o2))    return 0.85;
  if (/simples/i.test(o2))                  return 0.50;
  if (/vni|bipap|cpap|hfnc/i.test(o2))     return 0.50;
  if (/intubação|iot|vm/i.test(o2))         return 0.40;
  return 0.21;
}

// ── SOFA — Sepsis-3/SSC 2021 (com surrogate SpO₂/FiO₂) — cálculo por domínio ──────────────────────────────
// Retorna { total, respiratorio, cardiovascular, figado, rim, cerebro, hemostasia, missing }
function calculateSofa2Score(): {
  total: number;
  respiratorio: number;
  cardiovascular: number;
  figado: number;
  rim: number;
  cerebro: number;
  hemostasia: number;
  missing: string[];  // domínios sem dado disponível
} | null {
  const missing: string[] = [];
  let total = 0;

  // ── Respiratório: usa PaO2/FiO2 se disponível, senão SpO2/FiO2 ──────────
  let respScore = 0;
  const pao2 = parseNumber(session.assessment.pao2);
  const spo2Raw = session.assessment.oxygenSaturation.replace("%", "").replace(",", ".");
  const spo2 = parseNumber(spo2Raw);
  const fio2 = getEstimatedFio2();
  const hasAdvancedSupport = /vni|bipap|cpap|hfnc|intubação|iot|vm|ecmo/i.test(
    session.assessment.oxygenTherapy + " " + session.assessment.intubationDecision
  );

  if (pao2 !== null) {
    // SOFA respiratório (Singer JAMA 2016 / Vincent Crit Care Med 1996):
    // 0=PF≥400 · 1=300–399 · 2=200–299 · 3=100–199+suporte · 4=<100+suporte
    const pf = pao2 / fio2;
    if (pf >= 400) respScore = 0;
    else if (pf >= 300) respScore = 1;
    else if (pf >= 200) respScore = 2;                             // sempre 2, independente de suporte
    else if (pf >= 100) respScore = hasAdvancedSupport ? 3 : 2;   // 3 só com suporte ventilatório
    else respScore = hasAdvancedSupport ? 4 : 3;                   // 4 só com suporte ventilatório
  } else if (spo2 !== null) {
    // SpO2/FiO2 surrogate (Rice CCM 2007): SF 512/357/235/89 ≈ PF 400/300/200/100
    const sf = spo2 / fio2;
    if (sf >= 512) respScore = 0;
    else if (sf >= 357) respScore = 1;
    else if (sf >= 235) respScore = 2;                            // sempre 2
    else if (sf >= 89)  respScore = hasAdvancedSupport ? 3 : 2;
    else respScore = hasAdvancedSupport ? 4 : 3;
  } else {
    missing.push("Respiratório (SpO₂ pendente)");
  }
  total += respScore;

  // ── Cardiovascular: MAP + vasopressor (SOFA original: 0=MAP≥70 · 1=MAP<70 · 2=dopa≤5/dobuta · 3=norepi/epi≤0.1 · 4=>0.1)
  let cardScore = 0;
  const map = getCalculatedMap();
  const vasoUse = session.assessment.vasopressorUse.toLowerCase();
  const hasVaso = /noradrenalina|vasopressina|dopamina|dobutamina|epinefrina|adrenalina/i.test(vasoUse);
  const hasHighDoseVaso = /0[,.]2|alto|dose alta|>.*0[,.]1/i.test(vasoUse);
  if (map !== null) {
    if (map >= 70 && !hasVaso) {
      cardScore = 0;
    } else if (!hasVaso) {
      cardScore = 1;   // MAP < 70 sem vasopressor (score 1 per SOFA; antes MAP<65 dava 2 incorretamente)
    } else if (/dobutamina/i.test(vasoUse) && !/noradrenalina|vasopressina|dopamina/i.test(vasoUse)) {
      cardScore = 2;   // Dobutamina isolada (qualquer dose) = score 2
    } else if (hasHighDoseVaso) {
      cardScore = 4;   // Noradrena/Epi > 0.1 mcg/kg/min ou dopamina > 15
    } else {
      cardScore = 3;   // Noradrena/Epi ≤ 0.1 ou dopamina 5–15 (dose não especificada → conservador)
    }
  } else {
    missing.push("Cardiovascular (PA pendente)");
  }
  total += cardScore;

  // ── Fígado: Bilirrubina total (mg/dL) — SOFA: <1.2 · 1.2–1.9 · 2.0–5.9 · 6.0–11.9 · ≥12 ─
  let liverScore = 0;
  const bili = parseNumber(session.assessment.bilirubinTotal);
  if (bili !== null) {
    if (bili < 1.2)   liverScore = 0;
    else if (bili < 2.0)  liverScore = 1;   // 1.2–1.9
    else if (bili < 6.0)  liverScore = 2;   // 2.0–5.9 (corrigido: antes < 3)
    else if (bili < 12.0) liverScore = 3;   // 6.0–11.9
    else liverScore = 4;                    // ≥ 12
  } else {
    missing.push("Fígado (bilirrubina pendente)");
  }
  total += liverScore;

  // ── Rim: Creatinina (mg/dL) — SOFA-2: 1.2, 2.0, 3.5, 5.0 ───────────────
  let renalScore = 0;
  const creat = getCreatinineMgDlValue();
  const urineH = parseNumber(session.assessment.urineOutputMlh);
  const isOnDialysis = /hemodiálise|crrt|capd/i.test(session.assessment.dialysisMode);
  if (isOnDialysis) {
    renalScore = 4;
  } else if (creat !== null) {
    if (creat < 1.2)   renalScore = 0;
    else if (creat < 2.0)  renalScore = 1;
    else if (creat < 3.5)  renalScore = 2;
    else if (creat < 5.0)  renalScore = 3;
    else renalScore = 4;
    // Ajuste por diurese se disponível e mais grave
    if (urineH !== null) {
      const byUrine = urineH < 10 ? 4 : urineH < 20 ? 3 : 0;
      renalScore = Math.max(renalScore, byUrine);
    }
  } else if (urineH !== null) {
    renalScore = urineH < 10 ? 4 : urineH < 20 ? 3 : 0;
  } else {
    missing.push("Rim (creatinina pendente)");
  }
  total += renalScore;

  // ── Cérebro: GCS — SOFA-2 limiares: 15, 13-14, 10-12, 6-9, ≤5 ──────────
  let brainScore = 0;
  const gcs = parseNumber(session.assessment.gcs);
  if (gcs !== null) {
    if (gcs === 15) brainScore = 0;
    else if (gcs >= 13) brainScore = 1;
    else if (gcs >= 10) brainScore = 2;
    else if (gcs >= 6)  brainScore = 3;
    else brainScore = 4;
  } else {
    missing.push("Cérebro (GCS pendente)");
  }
  total += brainScore;

  // ── Hemostasia: Plaquetas (×10³/µL) — SOFA: ≥150 · 100–149 · 50–99 · 20–49 · <20 ──────
  let hemoScore = 0;
  const plt = parseNumber(session.assessment.platelets);
  if (plt !== null) {
    if (plt >= 150)      hemoScore = 0;
    else if (plt >= 100) hemoScore = 1;   // 100–149
    else if (plt >= 50)  hemoScore = 2;   // 50–99 (corrigido: antes ≥80)
    else if (plt >= 20)  hemoScore = 3;   // 20–49 (corrigido: antes ≥50)
    else hemoScore = 4;                   // < 20 (corrigido: antes <50)
  } else {
    missing.push("Hemostasia (plaquetas pendentes)");
  }
  total += hemoScore;

  // Só retorna null se NENHUM dado disponível
  const hasAnyData = missing.length < 6;
  if (!hasAnyData) return null;

  return { total, respiratorio: respScore, cardiovascular: cardScore,
    figado: liverScore, rim: renalScore, cerebro: brainScore,
    hemostasia: hemoScore, missing };
}

function getSofa2Label(): string {
  const result = calculateSofa2Score();
  if (!result) return "Dados insuficientes";
  const { total, missing } = result;
  const partial = missing.length > 0 ? ` (parcial — ${missing.length} dom. pendentes)` : "";
  const risk = total >= 11 ? "⚠️ Mortalidade >50%" :
               total >= 7  ? "⚠️ Mortalidade ~30%" :
               total >= 4  ? "Disfunção moderada" :
               total >= 2  ? "Disfunção orgânica — sepse" :
               "Baixo risco";
  return `SOFA: ${total}/24 — ${risk}${partial}`;
}

// ── Volume cristalóide (30 mL/kg) ─────────────────────────────────────────
function getFluidVolumeLabel() {
  const weight = parseNumber(session.assessment.weightKg);
  if (weight === null || weight <= 0) return "Aguardando peso";
  const vol = Math.round(weight * 30);
  return `${vol} mL`;
}

function getFluidVolumeHint() {
  const weight = parseNumber(session.assessment.weightKg);
  if (weight === null) return "Informe o peso para calcular";
  const caution = hasFluidOverloadRisk()
    ? " Risco de sobrecarga: prefira bolus fracionados com reavaliação dinâmica."
    : "";
  return `30 mL/kg × ${weight} kg = ${Math.round(weight * 30)} mL — preferir cristalóide balanceado (Ringer Lactato ou Plasma-Lyte) — SSC 2021.${caution}`;
}

// ── Alerta de IOT / ventilação mecânica ───────────────────────────────────
function getIntubationAlertLabel(): string | null {
  const gcs = parseNumber(session.assessment.gcs);
  const spo2Raw = session.assessment.oxygenSaturation.replace("%", "").replace(",", ".");
  const spo2 = parseNumber(spo2Raw);
  const fr = parseNumber(session.assessment.respiratoryRate);
  const reasons: string[] = [];

  if (gcs !== null && gcs <= 8) reasons.push(`GCS ${gcs}`);
  if (spo2 !== null && spo2 < 90) reasons.push(`SpO₂ ${spo2}%`);
  if (fr !== null && fr >= 35) reasons.push(`FR ${fr} irpm`);

  if (reasons.length === 0) return null;
  return `⚠️ IOT: ${reasons.join(" · ")}`;
}

// ── Alerta de vasopressor ─────────────────────────────────────────────────
function getVasopressorAlertLabel(): string | null {
  const map = getCalculatedMap();
  if (map === null) return null;
  if (map >= 65) return null;
  return `⚠️ Vasopressor: PAM ${Math.round(map)} mmHg`;
}

// ── Alerta de lactato ─────────────────────────────────────────────────────
function getLactateAlertLabel(): string | null {
  const mmol = getLactateMmolValue();
  if (mmol === null) return null;
  if (mmol >= 4) return `⚠️ Lactato ≥ 4 mmol/L — ressuscitação agressiva`;
  if (mmol >= 2) return `Lactato ≥ 2 mmol/L — sepse confirmada`;
  return null;
}

// ── Métricas clínicas completas (para dashboard do formulário) ────────────
function buildClinicalMetrics(): AuxiliaryPanel["metrics"] {
  const metrics: AuxiliaryPanel["metrics"] = [];

  // PAM
  const map = getCalculatedMap();
  metrics.push({
    label: "PAM",
    value: map !== null ? `${Math.round(map)} mmHg` : "Preencher PA",
  });

  // qSOFA (triagem rápida à beira-leito)
  metrics.push({ label: "qSOFA", value: getQsofaLabel() });

  // SOFA-2 (diagnóstico formal de disfunção orgânica — Sepsis-3 (SSC 2021))
  const sofaResult = calculateSofa2Score();
  if (sofaResult !== null) {
    const { total, missing } = sofaResult;
    const partialNote = missing.length > 0 ? `*` : "";
    const riskTag = total >= 11 ? " ⚠️ alto" : total >= 7 ? " ⚠️" : total >= 2 ? " disfunção" : "";
    metrics.push({
      label: `SOFA${partialNote}`,
      value: `${total}/24${riskTag}`,
    });
  } else {
    metrics.push({ label: "SOFA", value: "Exames pendentes" });
  }

  // IMC
  metrics.push({ label: "IMC", value: getBmiLabel() });

  // Volume cristalóide
  metrics.push({ label: "Vol. cristalóide", value: getFluidVolumeLabel() });

  // Alerta IOT
  const iotAlert = getIntubationAlertLabel();
  if (iotAlert) metrics.push({ label: "IOT", value: iotAlert });

  // Alerta vasopressor
  const vasoAlert = getVasopressorAlertLabel();
  if (vasoAlert) metrics.push({ label: "Vasopressor", value: vasoAlert });

  // Alerta lactato
  const lacAlert = getLactateAlertLabel();
  if (lacAlert) metrics.push({ label: "Lactato", value: lacAlert });

  // P/F ratio — apenas quando flowType é UTI e dados disponíveis
  if (session.flowType === "uti_internado") {
    const pao2Val = parseFloat(session.assessment.pao2);
    const fio2Vent = parseFloat(session.assessment.ventilatorFio2);
    if (!isNaN(pao2Val) && pao2Val > 0 && !isNaN(fio2Vent) && fio2Vent > 0) {
      const pf = Math.round(pao2Val / (fio2Vent / 100));
      const pfLabel = pf < 100 ? " SDRA grave" : pf < 200 ? " SDRA mod." : pf < 300 ? " SDRA leve" : " Normal";
      metrics.push({ label: "P/F (PaO₂/FiO₂)", value: `${pf} mmHg${pfLabel}` });
    }
    // RASS se disponível
    const rass = session.assessment.rassScore;
    if (rass) {
      const rassNum = parseInt(rass, 10);
      const rassLabel = !isNaN(rassNum) ? ` (${rassNum >= 0 ? "+" : ""}${rassNum})` : "";
      metrics.push({ label: "RASS", value: `${rass.split(" — ")[0]}${rassLabel ? "" : ""}` });
    }
  }

  return metrics;
}

function getLactateMmolValue() {
  const lactate = parseNumber(session.assessment.lactateValue);
  if (lactate === null) {
    return null;
  }

  if (session.assessment.lactateUnit === "mg/dL") {
    return lactate / 9.0;
  }

  return lactate;
}

function getCreatinineMgDlValue() {
  const creatinine = parseNumber(session.assessment.creatinineValue);
  if (creatinine === null) {
    return null;
  }

  if (session.assessment.creatinineUnit === "µmol/L") {
    return creatinine / 88.4;
  }

  return creatinine;
}

function formatDecimal(value: number, decimals = 1) {
  return value.toFixed(decimals).replace(".", ",");
}

function convertLactateValue(rawValue: string, fromUnit: string, toUnit: string) {
  const numericValue = parseNumber(rawValue);
  if (numericValue === null || fromUnit === toUnit) {
    return rawValue;
  }

  if (fromUnit === "mmol/L" && toUnit === "mg/dL") {
    return formatDecimal(numericValue * 9.0, 1);
  }

  if (fromUnit === "mg/dL" && toUnit === "mmol/L") {
    return formatDecimal(numericValue / 9.0, 1);
  }

  return rawValue;
}

function convertCreatinineValue(rawValue: string, fromUnit: string, toUnit: string) {
  const numericValue = parseNumber(rawValue);
  if (numericValue === null || fromUnit === toUnit) {
    return rawValue;
  }

  if (fromUnit === "mg/dL" && toUnit === "µmol/L") {
    return formatDecimal(numericValue * 88.4, 0);
  }

  if (fromUnit === "µmol/L" && toUnit === "mg/dL") {
    return formatDecimal(numericValue / 88.4, 2);
  }

  return rawValue;
}

function getLactatePresets(unit: string) {
  if (unit === "mg/dL") {
    return [
      { label: "9", value: "9,0" },
      { label: "14", value: "14,0" },
      { label: "18", value: "18,0" },
      { label: "27", value: "27,0" },
      { label: "36", value: "36,0" },
      { label: "45", value: "45,0" },
      { label: "54", value: "54,0" },
    ];
  }

  return [
    { label: "1,0", value: "1,0" },
    { label: "1,5", value: "1,5" },
    { label: "2,0", value: "2,0" },
    { label: "2,5", value: "2,5" },
    { label: "3,0", value: "3,0" },
    { label: "4,0", value: "4,0" },
    { label: "5,0", value: "5,0" },
    { label: "6,0", value: "6,0" },
    { label: "8,0", value: "8,0" },
    { label: "10,0", value: "10,0" },
  ];
}

function getCreatininePresets(unit: string) {
  if (unit === "µmol/L") {
    return [
      { label: "70", value: "70" },
      { label: "88", value: "88" },
      { label: "132", value: "132" },
      { label: "177", value: "177" },
      { label: "220", value: "220" },
      { label: "265", value: "265" },
      { label: "350", value: "350" },
    ];
  }

  return [
    { label: "0,8", value: "0,8" },
    { label: "1,0", value: "1,0" },
    { label: "1,2", value: "1,2" },
    { label: "1,5", value: "1,5" },
    { label: "2,0", value: "2,0" },
    { label: "2,5", value: "2,5" },
    { label: "3,0", value: "3,0" },
    { label: "4,0", value: "4,0" },
    { label: "5,0", value: "5,0" },
  ];
}

function getInitialCrystalloidVolumeMl() {
  const weight = parseNumber(session.assessment.weightKg);
  if (weight === null || weight <= 0) {
    return null;
  }

  return Math.round(weight * 30);
}

function getInitialCrystalloidVolumeLabel() {
  const volume = getInitialCrystalloidVolumeMl();
  if (volume === null) {
    return "Preencher peso para calcular o volume inicial.";
  }

  return `Volume inicial estimado: ${volume} mL para ${session.assessment.weightKg.trim()} kg.`;
}

function getSourceTokens() {
  return normalizeTokens(session.assessment.suspectedSource.toLowerCase());
}

/**
 * Infere o foco infeccioso suspeito a partir dos dados clínicos já preenchidos.
 * Retorna sugestão apenas quando há evidência suficiente (score ≥ 2).
 */
/**
 * Gera lista de exames recomendados com base no contexto clínico atual.
 * Retorna { value, label } para ser usado como suggestedValue no campo requestedExams.
 */
function buildRecommendedExams(): { value: string; label: string } | null {
  const a = session.assessment;
  const source = a.suspectedSource.toLowerCase();
  const diagnosis = a.diagnosticHypothesis.toLowerCase();
  const lactate = getLactateMmolValue();
  const sofa = calculateSofa2Score();
  const isShock = /choque/i.test(diagnosis) ||
    (/noradrenalina|vasopressina/i.test(a.vasopressorUse) && lactate !== null && lactate > 2);

  // Sem contexto suficiente, não sugere nada
  const hasContext = a.suspectedSource.trim() || a.diagnosticHypothesis.trim() ||
    a.chiefComplaint.trim() || a.respiratoryRate.trim() || a.systolicPressure.trim();
  if (!hasContext) return null;

  // ── Bundle obrigatório (SSC 2021 — Hour-1 Bundle) ─────────────────────────
  const bundle = [
    "Hemoculturas (2 pares — antes ATB)",
    "Lactato sérico",
    "Hemograma completo",
    "Função renal (Creatinina, Ureia)",
    "Eletrólitos (Na, K, Cl)",
    "PCR / Procalcitonina",
    "TGO/TGP / Bilirrubinas",
    "Coagulação (TP, TTPA, Fibrinogênio)",
    "Gasometria arterial",
    "Glicemia capilar",
  ];

  const focal: string[] = [];

  // ── Exames por foco infeccioso ─────────────────────────────────────────────
  if (/pulmonar|pneumonia|respirat/i.test(source)) {
    focal.push("RX Tórax (urgência)");
    focal.push("Escarro para Gram e cultura");
    if (isShock || (sofa !== null && sofa.total >= 3))
      focal.push("TC Tórax (se RX inconclusivo ou deterioração)");
  }

  if (/urinário|pielonefrite|uross/i.test(source)) {
    focal.push("Urina I + Gram urinário");
    focal.push("Urocultura (antes ATB)");
    focal.push("USG Rins e Vias Urinárias (descartar obstrução)");
  }

  if (/abdominal|biliar|perfurativo|peritonite|colangite/i.test(source)) {
    focal.push("USG Abdominal (emergência)");
    focal.push("TC Abdome/Pelve com contraste (se USG inconclusivo)");
    focal.push("Lipase/Amilase (se pancreatite suspeita)");
  }

  if (/pele|partes moles|fasceíte|celulite/i.test(source)) {
    focal.push("Cultura de secreção/lesão (swab ou aspirado)");
    focal.push("RX ou TC local (descartar gás nos tecidos — fasceíte necrosante)");
  }

  if (/snc|meninges|meningite|encefali/i.test(source)) {
    focal.push("TC Crânio sem contraste (antes de punção se indicado)");
    focal.push("Punção lombar (cultura + citologia + glicose + proteínas)");
  }

  if (/dispositivo|cateter|cvc/i.test(source)) {
    focal.push("Culturas pareadas (via CVC e periférica simultâneas)");
    focal.push("Retirada do cateter se indicada");
  }

  if (/endocardite/i.test(source)) {
    focal.push("Ecocardiograma transtorácico (urgência)");
    focal.push("Hemoculturas seriadas (3+ pares em 24h)");
  }

  // ── Extras por gravidade ───────────────────────────────────────────────────
  if (isShock) {
    focal.push("ECG (12 derivações)");
    focal.push("Ecocardiograma beira-leito (se disponível — avaliar função e volemia)");
    focal.push("Troponina / BNP (disfunção miocárdica associada à sepse)");
  }

  if (lactate !== null && lactate >= 4) {
    focal.push("Remensurar lactato em 2h (meta redução ≥10%)");
  }

  const allExams = [...bundle, ...focal];
  const value = allExams.join(", ");
  const label = `${allExams.length} exames recomendados para este contexto (SSC 2021 + foco ${a.suspectedSource || "a definir"})`;

  return { value, label };
}

function buildSuspectedSourceSuggestion(): { value: string; label: string } | null {
  const a = session.assessment;

  // Não sobrescrever se o usuário já preencheu manualmente
  if (a.suspectedSource.trim()) return null;

  const complaint    = (a.chiefComplaint ?? "").toLowerCase();
  const pulmonary    = a.pulmonaryAuscultation.toLowerCase();
  const abdominal    = a.abdominalExam.toLowerCase();
  const urine        = a.urineOutput.toLowerCase();
  const skin         = (a.skinMucosae + " " + a.extremities).toLowerCase();
  const cardiac      = a.cardiacAuscultation.toLowerCase();
  const comorbid     = a.comorbidities.toLowerCase();
  const respPattern  = a.respiratoryPattern.toLowerCase();
  const devices      = ((a.invasiveDevices ?? "") + " " + (a.icuComplication ?? "")).toLowerCase();

  const scores: Record<string, number> = {
    "Pulmonar": 0,
    "Urinário": 0,
    "Abdominal": 0,
    "Pele / partes moles": 0,
    "SNC / meninges": 0,
    "Dispositivo vascular": 0,
    "Endocardite suspeita": 0,
  };

  // ── Pulmonar ───────────────────────────────────────────────────────────────
  if (/tosse|dispneia|expectoração|secreção|pneumon|bronquit|pleuri|infiltrad/i.test(complaint))
    scores["Pulmonar"] += 3;
  if (/crepita|estertor|redução de mv|macicez|broncofonesia|sibilos/i.test(pulmonary))
    scores["Pulmonar"] += 3;
  if (/taquipneico|esforço respiratório|tiragem/i.test(respPattern))
    scores["Pulmonar"] += 1;
  const spo2 = parseNumber(a.oxygenSaturation);
  if (spo2 !== null && spo2 < 94) scores["Pulmonar"] += 1;

  // ── Urinário ───────────────────────────────────────────────────────────────
  if (/disúria|hematúria|urinári|micção|flanco|lombar|pielonefrite|itu|uroséps/i.test(complaint))
    scores["Urinário"] += 4;
  if (/oligúria|anúria|disúria|hematúria|concentrada|escura/i.test(urine))
    scores["Urinário"] += 2;
  if (/drc|litíase|uropatia|cateter vesical|sonda vesical/i.test(comorbid + " " + devices))
    scores["Urinário"] += 1;

  // ── Abdominal ──────────────────────────────────────────────────────────────
  if (/dor abdominal|vômito|náusea|diarreia|colangite|pancreatite|peritonite|abdome agudo/i.test(complaint))
    scores["Abdominal"] += 3;
  if (/defesa|irritação peritoneal|dor difusa|dor focal|rígido|peritonismo/i.test(abdominal))
    scores["Abdominal"] += 3;
  if (/cirrose|hepat|colecistite|diverticulite/i.test(comorbid))
    scores["Abdominal"] += 1;

  // ── Pele / partes moles ────────────────────────────────────────────────────
  if (/eritema|flogose|celulite|ferida|úlcera|abscesso|calor local|necros|fasceíte/i.test(complaint + " " + skin))
    scores["Pele / partes moles"] += 3;
  if (/diabet|imunossuprim|neutropenia|corticoid/i.test(comorbid))
    scores["Pele / partes moles"] += 1;

  // ── Dispositivo vascular / cateter ─────────────────────────────────────────
  if (/cvc|cateter venoso central|acesso venoso|crbsi|bacteremia por cateter/i.test(devices + " " + complaint))
    scores["Dispositivo vascular"] += 3;
  if (/bacteremia|corrente sanguínea/i.test(complaint))
    scores["Dispositivo vascular"] += 2;

  // ── Endocardite ────────────────────────────────────────────────────────────
  if (/endocardite|valv|sopro novo/i.test(cardiac + " " + complaint))
    scores["Endocardite suspeita"] += 3;
  if (/udiv|drogas injetáveis|usuário de droga/i.test(comorbid + " " + complaint))
    scores["Endocardite suspeita"] += 2;

  // ── SNC ────────────────────────────────────────────────────────────────────
  if (/cefaleia|rigidez nucal|meningismo|kernig|brudzinski|convulsão|foto|fonofobia/i.test(complaint))
    scores["SNC / meninges"] += 3;

  // Determinar foco com maior pontuação
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore < 2) return null;

  const [topFocus] = Object.entries(scores).sort(([, a], [, b]) => b - a);

  const labels: Record<string, string> = {
    "Pulmonar":              "Foco pulmonar sugerido — tosse, dispneia ou achados de ausculta presentes",
    "Urinário":              "Foco urinário sugerido — sintomas urinários ou diurese alterada",
    "Abdominal":             "Foco abdominal sugerido — dor, vômito ou irritação peritoneal",
    "Pele / partes moles":   "Foco pele/partes moles sugerido — sinais locais de infecção",
    "SNC / meninges":        "Foco SNC sugerido — cefaleia, rigidez nucal ou convulsão",
    "Dispositivo vascular":  "Foco cateter/dispositivo sugerido — dispositivo vascular presente",
    "Endocardite suspeita":  "Endocardite sugerida — sopro novo ou fator de risco identificado",
  };

  return { value: topFocus[0], label: labels[topFocus[0]] ?? topFocus[0] };
}

function hasSourceToken(pattern: RegExp) {
  return getSourceTokens().some((token) => pattern.test(token));
}

function hasComorbidityToken(pattern: RegExp) {
  return normalizeTokens(session.assessment.comorbidities.toLowerCase()).some((token) =>
    pattern.test(token)
  );
}

function hasRenalDysfunction() {
  const creatinine = getCreatinineMgDlValue();
  return (creatinine !== null && creatinine >= 2) || hasComorbidityToken(/drc/);
}

function hasFluidOverloadRisk() {
  const comorbidities = session.assessment.comorbidities.toLowerCase();
  const pulmonary = session.assessment.pulmonaryAuscultation.toLowerCase();
  const oxygen = parseNumber(session.assessment.oxygenSaturation);
  return (
    /ic|insufici[êe]ncia card|fra[cç][aã]o de eje[cç][aã]o|drc|dial/i.test(comorbidities) ||
    /crepita|estertor|edema agudo|congest/i.test(pulmonary) ||
    (oxygen !== null && oxygen < 92)
  );
}

function getEstimatedCrCl() {
  const age = parseNumber(session.assessment.age);
  const weight = parseNumber(session.assessment.weightKg);
  const creatinine = getCreatinineMgDlValue();
  const sex = session.assessment.sex.trim().toLowerCase();

  if (
    age === null ||
    age <= 0 ||
    weight === null ||
    weight <= 0 ||
    creatinine === null ||
    creatinine <= 0
  ) {
    return null;
  }

  let crCl = ((140 - age) * weight) / (72 * creatinine);
  if (/fem/.test(sex)) {
    crCl *= 0.85;
  }
  return Math.round(crCl);
}

function isHighMdrRisk() {
  const careSetting = session.assessment.careSetting.trim().toLowerCase();
  const mdrRisk = session.assessment.mdrRisk.trim().toLowerCase();
  return /assist|hospital|uti|institucionalizado/.test(careSetting) || /alto/.test(mdrRisk);
}

function hasMrsaRisk() {
  return /sim/.test(session.assessment.mrsaRisk.trim().toLowerCase());
}

function hasBetaLactamAllergy() {
  return /sim/.test(session.assessment.betaLactamAllergy.trim().toLowerCase());
}

function getDialysisModeKey() {
  const value = session.assessment.dialysisMode.trim().toLowerCase();
  if (value.includes("hd")) {
    return "HD";
  }
  if (value.includes("crrt")) {
    return "CRRT";
  }
  if (value.includes("capd") || value.includes("peritoneal")) {
    return "CAPD";
  }
  return "HD";
}

function isHemodialysis() {
  return getDialysisModeKey() === "HD";
}

function getDominantSourceLabel() {
  if (hasSourceToken(/pulmon/)) {
    return "Pulmonar";
  }
  if (hasSourceToken(/urin/)) {
    return "Urinário";
  }
  if (hasSourceToken(/abdominal/)) {
    return "Abdominal";
  }
  if (hasSourceToken(/pele|partes moles/)) {
    return "Pele / partes moles";
  }
  if (hasSourceToken(/snc|meningite|neurológi/)) {
    return "SNC";
  }
  if (hasSourceToken(/dispositivo|vascular|cateter/)) {
    return "Dispositivo vascular";
  }
  if (hasSourceToken(/indefin/)) {
    return "Indefinido";
  }
  return "Não definido";
}

function getDominantSourceKey() {
  // Prioridade 1: suspectedSource já preenchido
  if (hasSourceToken(/pulmon/)) return "pulmonar";
  if (hasSourceToken(/urin/)) return "urinario";
  if (hasSourceToken(/abdominal|biliar|periton/)) return "abdominal";
  if (hasSourceToken(/pele|partes moles|fasceíte|celulite/)) return "pele_partes_moles";
  if (hasSourceToken(/snc|mening|neurológi/)) return "snc";
  if (hasSourceToken(/dispositivo|vascular|cateter|cvc/)) return "dispositivo_vascular";
  if (hasSourceToken(/endocardite/)) return "dispositivo_vascular"; // proxy mais próximo

  // Prioridade 2: inferir da queixa principal se suspectedSource vazio
  const complaint = session.assessment.chiefComplaint.toLowerCase();
  const pulmonary = session.assessment.pulmonaryAuscultation.toLowerCase();
  const abdominal = session.assessment.abdominalExam.toLowerCase();
  const urine = session.assessment.urineOutput.toLowerCase();

  if (/tosse|dispneia|pneumon|bronquit|expectoração/i.test(complaint) ||
      /crepita|estertor|redução de mv/i.test(pulmonary)) return "pulmonar";
  if (/disúria|hematúria|flanco|pielonefrite|itu/i.test(complaint) ||
      /disúria|hematúria/i.test(urine)) return "urinario";
  if (/dor abdominal|vômito|peritonite|colangite|biliar/i.test(complaint) ||
      /defesa|irritação peritoneal/i.test(abdominal)) return "abdominal";
  if (/eritema|flogose|celulite|fasceíte|abscesso/i.test(complaint)) return "pele_partes_moles";
  if (/cefaleia|rigidez nucal|meningismo/i.test(complaint)) return "snc";

  return "indefinido";
}

function getMatchedRenalAdjustment(drug: AntimicrobialDrug) {
  const crCl = getEstimatedCrCl();
  if (crCl === null) {
    return null;
  }

  const sortedAdjustments = [...(drug.renalAdjustments ?? [])].sort(
    (left, right) => left.maxCrCl - right.maxCrCl
  );
  return sortedAdjustments.find((item) => crCl <= item.maxCrCl) ?? null;
}

function getRenalInstruction(drug: AntimicrobialDrug) {
  const crCl = getEstimatedCrCl();
  const matched = getMatchedRenalAdjustment(drug);
  if (matched) {
    return matched.instruction;
  }

  if (crCl === null) {
    return drug.renalDefault ?? "Revisar ajuste renal conforme função renal disponível.";
  }

  return (
    drug.renalDefault ??
    `ClCr estimado ${crCl} mL/min. Sem ajuste adicional evidente nesta referência-base.`
  );
}

function formatRegimenDrugs(regimen: AntimicrobialRegimen) {
  return regimen.drugs.map((drug) => {
    const dialysisMode = getDialysisModeKey();
    const dialysisAdjustment =
      drug.dialysisAdjustments?.[dialysisMode] ?? drug.hemodialysisAdjustment;
    if (dialysisAdjustment) {
      const modeLabel =
        dialysisMode === "HD"
          ? "hemodiálise"
          : dialysisMode === "CRRT"
            ? "CRRT"
            : "CAPD";
      return `${drug.name}: ${dialysisAdjustment.adjustedDose} ${dialysisAdjustment.adjustedInterval}. Ajuste automático para ${modeLabel} aplicado.${dialysisAdjustment.note ? ` ${dialysisAdjustment.note}` : ""}`;
    }

    const matched = getMatchedRenalAdjustment(drug);
    if (matched?.adjustedDose || matched?.adjustedInterval) {
      const adjustedDose = matched.adjustedDose ?? drug.dose;
      const adjustedInterval = matched.adjustedInterval ?? drug.interval;
      const adjustedNote = matched.note ? ` ${matched.note}` : "";
      return `${drug.name}: ${adjustedDose} ${adjustedInterval}. Ajuste renal automático aplicado.${adjustedNote}`;
    }

    const renalInstruction = getRenalInstruction(drug);
    return `${drug.name}: ${drug.dose} ${drug.interval}. ${renalInstruction}`;
  });
}

function formatComponentLines(regimen: AntimicrobialRegimen) {
  return formatRegimenDrugs(regimen).map((line) => `• ${line}`);
}

function getAntimicrobialRecommendation() {
  const focusKey = getDominantSourceKey();
  const focus = antimicrobialData.focuses[focusKey];
  const highMdrRisk = isHighMdrRisk();
  const mrsaRisk = hasMrsaRisk();
  const betaLactamAllergy = hasBetaLactamAllergy();
  const renalDysfunction = hasRenalDysfunction();
  const details: string[] = [];
  const regimen = betaLactamAllergy && focus.betaLactamAllergyAlternative
    ? focus.betaLactamAllergyAlternative
    : highMdrRisk && focus.highRiskRegimen
      ? focus.highRiskRegimen
      : focus.baseRegimen;
  const headline = `${focus.label}: ${regimen.title}.`;

  details.push(`Esquema-base sugerido: ${regimen.title}.`);
  details.push(...formatRegimenDrugs(regimen));

  if (mrsaRisk) {
    if (focus.mrsaAddon) {
      details.push(`Cobertura anti-MRSA sugerida: ${focus.mrsaAddon.title}.`);
      details.push(...formatRegimenDrugs(focus.mrsaAddon));
    } else {
      details.push("Há risco de MRSA; revisar necessidade de cobertura adicional conforme protocolo local.");
    }
  }

  if (highMdrRisk) {
    details.push(
      "Há contexto de assistência à saúde ou risco de MDR; preferir o esquema ampliado desta referência-base."
    );
  }

  if (betaLactamAllergy) {
    details.push(
      focus.betaLactamAllergyAlternative
        ? "Alergia a beta-lactâmico marcada: alternativa automática aplicada."
        : "Há alergia a beta-lactâmico; confirmar alternativa segura do protocolo local antes da administração."
    );
  }

  if (renalDysfunction) {
    details.push(
      `Há disfunção renal. ClCr estimado: ${getEstimatedCrCl() ?? "não calculado"} mL/min. Revisar dose e intervalo do esquema escolhido.`
    );
  }

  details.push(...antimicrobialData.defaultNotes);

  return {
    headline,
    details,
    renalAdjustmentRequired: renalDysfunction,
    regimenTitle: regimen.title,
    focusLabel: focus.label,
    hasMrsaAddon: mrsaRisk && !!focus.mrsaAddon,
    regimen,
  };
}

function buildAntimicrobialRecommendationCards(): AuxiliaryPanelRecommendation[] {
  const recommendation = getAntimicrobialRecommendation();
  const crCl = getEstimatedCrCl();
  const onDialysis = session.assessment.dialysisMode.trim().toLowerCase() !== "não"
    && session.assessment.dialysisMode.trim() !== "";
  const dialysisMode = getDialysisModeKey();

  // Badge contextual no título principal
  const contextBadges: string[] = [];
  if (onDialysis) contextBadges.push(`Diálise (${dialysisMode})`);
  else if (crCl !== null && crCl < 60) contextBadges.push(`ClCr ${crCl} mL/min`);
  if (hasBetaLactamAllergy()) contextBadges.push("Alergia beta-lact.");
  if (isHighMdrRisk()) contextBadges.push("MDR");
  if (hasMrsaRisk()) contextBadges.push("MRSA");
  const badgeStr = contextBadges.length > 0 ? ` [${contextBadges.join(" · ")}]` : "";

  const cards: AuxiliaryPanelRecommendation[] = [
    {
      title: `💊 ATB sugerido — ${recommendation.focusLabel}${badgeStr}`,
      tone: recommendation.renalAdjustmentRequired || onDialysis ? "warning" : "info",
      lines: [recommendation.regimenTitle, ...formatComponentLines(recommendation.regimen)],
    },
  ];

  // MRSA add-on
  if (recommendation.hasMrsaAddon) {
    const focus = antimicrobialData.focuses[getDominantSourceKey() as keyof typeof antimicrobialData.focuses];
    if (focus?.mrsaAddon) {
      cards.push({
        title: "➕ Cobertura anti-MRSA adicionada",
        tone: "warning",
        lines: [focus.mrsaAddon.title, ...formatComponentLines(focus.mrsaAddon)],
      });
    }
  }

  // Ajuste renal / diálise detalhado
  if (onDialysis) {
    const modeLabel = dialysisMode === "HD" ? "Hemodiálise intermitente (HD)"
      : dialysisMode === "CRRT" ? "Diálise contínua renal (CRRT)"
      : "Diálise peritoneal ambulatorial (CAPD)";
    const dialysisLines = recommendation.details.filter((l) =>
      /renal|ClCr|intervalo|pós-HD|CRRT|dialise|diálise/i.test(l)
    );
    cards.push({
      title: `⚠️ Ajuste para ${modeLabel}`,
      tone: "warning",
      lines: [
        "Doses já corrigidas conforme modo de TRS acima.",
        ...dialysisLines,
        "Confirmar com protocolo local e função residual antes de manutenção.",
      ],
    });
  } else if (crCl !== null && crCl < 60) {
  const renalLines = recommendation.details.filter(
    (line) => /renal|ClCr|intervalo/.test(line)
  );
  if (renalLines.length > 0) {
    cards.push({
        title: `⚠️ Ajuste renal — ClCr ${crCl} mL/min`,
      tone: "warning",
        lines: ["Doses ajustadas automaticamente para a função renal estimada.", ...renalLines],
    });
    }
  }

  // Observações clínicas
    const noteLines = recommendation.details.filter(
    (line) => /descalonamento|protocolo local|MRSA|MDR|alergia/i.test(line)
    );
    if (noteLines.length > 0) {
    cards.push({ title: "📋 Observações", lines: noteLines });
    }

  return cards;
}

function shouldSuggestCrystalloid() {
  const map = getCalculatedMap();
  const signs = session.assessment.hypoperfusionSigns.trim().toLowerCase();
  const hasHypoperfusion =
    !!signs && /(olig|enchimento|hipoperfus|frio|moteado|lento|confus|rebaix)/.test(signs);
  return (map !== null && map < 65) || hasHypoperfusion;
}

function shouldSuggestImmediateVasopressor() {
  const map = getCalculatedMap();
  const diastolic = parseNumber(session.assessment.diastolicPressure);
  const lactate = getLactateMmolValue();
  const signs = session.assessment.hypoperfusionSigns.trim().toLowerCase();
  const severeHypoperfusion =
    !!signs && /(moteado|frio|lento|olig|anur|rebaix|confus)/.test(signs);

  return (
    session.bundle.vasopressor === "realizado" ||
    session.septicShockRecognized ||
    (map !== null && map < 55) ||
    (diastolic !== null && diastolic < 45) ||
    (lactate !== null && lactate >= 4 && severeHypoperfusion)
  );
}

function shouldSuggestVasopressor() {
  const map = getCalculatedMap();
  if (shouldSuggestImmediateVasopressor()) {
    return true;
  }
  return (
    (map !== null && map < 65 && session.bundle.fluidos === "realizado") ||
    session.bundle.vasopressor !== "pendente" ||
    session.septicShockRecognized
  );
}

function shouldSuggestLactate() {
  const scenario = getAutomaticScenario();
  return scenario === "suspeita_choque_septico" || scenario === "sepse_alto_risco";
}

function shouldSuggestCultures() {
  return (
    shouldSuggestAntibiotic() &&
    !!session.assessment.suspectedSource.trim()
  );
}

function shouldSuggestAntibiotic() {
  const scenario = getAutomaticScenario();
  return scenario === "suspeita_choque_septico" || scenario === "sepse_alto_risco";
}

function getBundleActionRecommendations() {
  const recommendations: string[] = [];
  const antimicrobialRecommendation = getAntimicrobialRecommendation();
  const highLikelihoodSepsis = hasHighLikelihoodSepsis();

  if (shouldSuggestLactate()) {
    recommendations.push("Solicite lactato agora.");
  }
  if (shouldSuggestCultures()) {
    recommendations.push("Colete culturas antes do antimicrobiano se isso não causar atraso significativo.");
  }
  if (shouldSuggestAntibiotic()) {
    recommendations.push(
      session.scenario === "suspeita_choque_septico"
        ? `Inicie antimicrobiano agora, idealmente em até 1 hora. ${antimicrobialRecommendation.headline}`
        : highLikelihoodSepsis
          ? `Se a probabilidade de sepse for alta após avaliação rápida, inicie antimicrobiano idealmente em até 3 horas. ${antimicrobialRecommendation.headline}`
          : `Reavalie foco infeccioso e diagnósticos diferenciais antes de indicar antimicrobiano empírico. ${antimicrobialRecommendation.headline}`
    );
    recommendations.push(...antimicrobialRecommendation.details);
  }
  if (shouldSuggestCrystalloid()) {
    recommendations.push(`Faça Ringer Lactato 30 mL/kg (cristalóide balanceado — SSC 2021). ${getInitialCrystalloidVolumeLabel()}`);
  }
  if (shouldSuggestVasopressor()) {
    recommendations.push("Inicie noradrenalina se a PAM seguir abaixo de 65 mmHg ou o choque estiver evidente.");
  }
  if (session.assessment.suspectedSource.trim()) {
    recommendations.push("Acione controle de foco o mais cedo possível quando houver drenagem, desbridamento ou retirada de dispositivo.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Complete o bundle conforme os dados clínicos e laboratoriais forem ficando disponíveis.");
  }

  return recommendations;
}

function getAssessmentSummary() {
  const map = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const hypoperfusionSigns = session.assessment.hypoperfusionSigns.trim().toLowerCase();
  const respiratoryRate = parseNumber(session.assessment.respiratoryRate);
  const respiratoryPattern = session.assessment.respiratoryPattern.trim().toLowerCase();
  const temperature = parseNumber(session.assessment.temperature);
  const heartRate = parseNumber(session.assessment.heartRate);
  const oxygenSaturation = parseNumber(session.assessment.oxygenSaturation);
  const mentalStatus = session.assessment.mentalStatus.trim().toLowerCase();
  const capillaryRefill = session.assessment.capillaryRefill.trim().toLowerCase();
  const urineOutput = session.assessment.urineOutput.trim().toLowerCase();

  const findings: string[] = [];
  if (map !== null && map < 65) {
    findings.push("PAM abaixo de 65");
  }
  if (lactate !== null && lactate >= 2) {
    findings.push("lactato elevado");
  }
  const creatinine = getCreatinineMgDlValue();
  if (creatinine !== null && creatinine >= 2) {
    findings.push("creatinina elevada");
  }
  if (respiratoryRate !== null && respiratoryRate >= 22) {
    findings.push("taquipneia");
  }
  if (heartRate !== null && heartRate >= 100) {
    findings.push("taquicardia");
  }
  if (oxygenSaturation !== null && oxygenSaturation < 92) {
    findings.push("dessaturação");
  }
  if (temperature !== null && (temperature >= 38.3 || temperature < 36)) {
    findings.push("temperatura anormal");
  }
  if (respiratoryPattern && /(esfor|acess|taquipne)/.test(respiratoryPattern)) {
    findings.push("padrão respiratório alterado");
  }
  if (mentalStatus && /(confus|rebaix|agita|sonol)/.test(mentalStatus)) {
    findings.push("estado mental alterado");
  }
  if (capillaryRefill && /(lent|> ?3|prolong)/.test(capillaryRefill)) {
    findings.push("enchimento capilar lento");
  }
  if (urineOutput && /(olig|reduz|ausente|anur)/.test(urineOutput)) {
    findings.push("diurese reduzida");
  }
  if (hypoperfusionSigns && /(olig|enchimento|hipoperfus|frio|moteado|lento|confus|rebaix)/.test(hypoperfusionSigns)) {
    findings.push("sinais clínicos de hipoperfusão");
  }

  return findings.length > 0 ? findings.join(", ") : "Sem dados clínicos críticos destacados";
}

function getAssessmentPrompt() {
  const demographics: string[] = [];
  if (session.assessment.age.trim()) {
    demographics.push(`${session.assessment.age.trim()} anos`);
  }
  if (session.assessment.sex.trim()) {
    demographics.push(session.assessment.sex.trim());
  }
  if (session.assessment.weightKg.trim()) {
    demographics.push(`${session.assessment.weightKg.trim()} kg`);
  }

  const context: string[] = [];
  if (demographics.length > 0) {
    context.push(demographics.join(" • "));
  }
  if (session.assessment.symptomOnset.trim()) {
    context.push(`início dos sintomas: ${session.assessment.symptomOnset.trim()}`);
  }
  if (session.assessment.comorbidities.trim()) {
    context.push(`comorbidades: ${session.assessment.comorbidities.trim()}`);
  }
  if (session.assessment.suspectedSource.trim()) {
    context.push(`foco suspeito: ${session.assessment.suspectedSource.trim()}`);
  }
  if (session.assessment.careSetting.trim()) {
    context.push(`contexto assistencial: ${session.assessment.careSetting.trim()}`);
  }

  if (context.length === 0) {
    return "Registrar dados básicos do paciente, foco infeccioso suspeito e sinais de disfunção orgânica.";
  }

  return context.join(" • ");
}

function getAutomaticScenario(): Scenario {
  const map = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const creatinine = getCreatinineMgDlValue();
  const respiratoryRate = parseNumber(session.assessment.respiratoryRate);
  const hypoperfusionSigns = session.assessment.hypoperfusionSigns.trim().toLowerCase();
  const oxygenSaturation = parseNumber(session.assessment.oxygenSaturation);
  const mentalStatus = session.assessment.mentalStatus.trim().toLowerCase();
  const capillaryRefill = session.assessment.capillaryRefill.trim().toLowerCase();
  const urineOutput = session.assessment.urineOutput.trim().toLowerCase();

  const hasHypoperfusion =
    !!hypoperfusionSigns &&
    /(olig|enchimento|hipoperfus|frio|moteado|lento|confus|rebaix)/.test(hypoperfusionSigns);
  const hasBedsideDysfunction =
    (oxygenSaturation !== null && oxygenSaturation < 92) ||
    /(confus|rebaix|agita|sonol)/.test(mentalStatus) ||
    /(lent|> ?3|prolong)/.test(capillaryRefill) ||
    /(olig|reduz|ausente|anur)/.test(urineOutput);
  const severeHypotension = map !== null && map < 65;
  const highLactate = lactate !== null && lactate >= 4;
  const elevatedLactate = lactate !== null && lactate >= 2;
  const organDysfunction =
    elevatedLactate ||
    (creatinine !== null && creatinine >= 2) ||
    hasHypoperfusion ||
    hasBedsideDysfunction ||
    (respiratoryRate !== null && respiratoryRate >= 22);

  if (session.bundle.vasopressor !== "pendente" || session.septicShockRecognized) {
    return "suspeita_choque_septico";
  }

  if (severeHypotension || highLactate || (hasHypoperfusion && elevatedLactate)) {
    return "suspeita_choque_septico";
  }

  if (organDysfunction) {
    return "sepse_alto_risco";
  }

  return "sepse_risco_moderado";
}

function getAutomaticScenarioReasoning() {
  const map = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const creatinine = getCreatinineMgDlValue();
  const respiratoryRate = parseNumber(session.assessment.respiratoryRate);
  const heartRate = parseNumber(session.assessment.heartRate);
  const oxygenSaturation = parseNumber(session.assessment.oxygenSaturation);
  const reasons: string[] = [];

  if (map !== null && map < 65) {
    reasons.push("PAM abaixo de 65");
  }
  if (lactate !== null && lactate >= 4) {
    reasons.push("lactato maior ou igual a 4");
  } else if (lactate !== null && lactate >= 2) {
    reasons.push("lactato elevado");
  }
  if (creatinine !== null && creatinine >= 2) {
    reasons.push("creatinina elevada");
  }
  if (respiratoryRate !== null && respiratoryRate >= 22) {
    reasons.push("frequência respiratória elevada");
  }
  if (heartRate !== null && heartRate >= 100) {
    reasons.push("frequência cardíaca elevada");
  }
  if (oxygenSaturation !== null && oxygenSaturation < 92) {
    reasons.push("saturação baixa");
  }
  if (/confus|rebaix|agita|sonol/.test(session.assessment.mentalStatus.trim().toLowerCase())) {
    reasons.push("estado mental alterado");
  }
  if (/lent|> ?3|prolong/.test(session.assessment.capillaryRefill.trim().toLowerCase())) {
    reasons.push("enchimento capilar lento");
  }
  if (/olig|reduz|ausente|anur/.test(session.assessment.urineOutput.trim().toLowerCase())) {
    reasons.push("diurese reduzida");
  }
  if (/olig|enchimento|hipoperfus|frio|moteado|lento|confus|rebaix/.test(session.assessment.hypoperfusionSigns.trim().toLowerCase())) {
    reasons.push("sinais clínicos de hipoperfusão");
  }

  return reasons.length > 0 ? reasons.join(", ") : "dados clínicos iniciais sem critério forte de gravidade maior";
}

function hasConfirmedSepsisBySofa() {
  const sofa = calculateSofa2Score();
  return sofa !== null && sofa.total >= 2;
}

function hasHighLikelihoodSepsis() {
  const qsofa = getQsofaScore();
  const lactate = getLactateMmolValue();
  return hasConfirmedSepsisBySofa() || qsofa >= 2 || (lactate !== null && lactate >= 2);
}

function getScenarioSuggestionLabel() {
  const scenario = getAutomaticScenario();
  if (scenario === "suspeita_choque_septico") {
    return "Sepse com suspeita de choque séptico";
  }
  if (scenario === "sepse_alto_risco") {
    return "Sepse";
  }
  return "Infecção suspeita sem critérios suficientes para sepse";
}

function updateReversibleCauseStatus(causeId: string, status: ReversibleCauseStatus): ReversibleCause[] {
  const cause = (protocolData.reversibleCauses ?? []).find((item) => item.id === causeId);
  if (!cause) {
    throw new Error(`Foco infeccioso inválido: ${causeId}`);
  }

  session.reversibleCauseStatuses[causeId] = status;
  if (status === "abordada") {
    session.sourceControlAddressed = true;
  }

  logEvent("FOCUS_UPDATED", { causeId, status });
  return getReversibleCauses();
}

function setScenario(scenario: Scenario) {
  session.scenario = scenario;
  logEvent("SCENARIO_SET", { scenario });
  logEvent("BUNDLE_ACTIVATED", { scenario });

  if (scenario === "suspeita_choque_septico" || scenario === "sepse_alto_risco") {
    session.antibioticDueAt = now() + ANTIBIOTIC_ONE_HOUR_MS;
    session.antibioticReminderNextAt = now() + ANTIBIOTIC_REMINDER_INTERVAL_MS;
    if (session.bundle.antibiotico === "pendente") {
      session.bundle.antibiotico = "solicitado";
    }
    if (scenario === "suspeita_choque_septico") {
      session.bundle.fluidos = "solicitado";
      session.bundle.vasopressor = "solicitado";
      session.perfusionState = "choque_septico";
      session.mapState = "abaixo_da_meta";
      session.septicShockRecognized = true;
      logEvent("SEPTIC_SHOCK_RECOGNIZED");
      logEvent("VASOPRESSOR_SUGGESTED");
      enqueueEffect({
        type: "alert",
        title: "Sepse com suspeita de choque séptico",
        message:
          "Priorizar antimicrobiano em até 1 hora, ressuscitação volêmica e reavaliação para confirmar critérios de choque séptico conforme resposta ao volume, lactato e necessidade de vasopressor.",
      });
      enqueueEffect({
        type: "speak",
        message: "Sepse com suspeita de choque séptico",
        suppressStateSpeech: true,
      });
      return;
    }

    enqueueEffect({
      type: "alert",
      title: "Sepse",
      message:
        "Sepse exige bundle precoce. Priorizar antimicrobianos, reavaliar perfusão e completar as medidas iniciais sem atraso.",
    });
    enqueueEffect({
      type: "speak",
      message: "Bundle da primeira hora ativado",
      suppressStateSpeech: true,
    });
  }
}

function applyAutomaticScenario() {
  setScenario(getAutomaticScenario());
}

function setPerfusionState(state: PerfusionState) {
  session.perfusionState = state;
  logEvent("PERFUSION_REASSESSED", { status: state });

  if (state === "adequada") {
    session.mapState = session.mapState === "desconhecida" ? "meta_atingida" : session.mapState;
    return;
  }

  if (state === "hipoperfusao_ou_hipotensao") {
    if (session.bundle.fluidos === "pendente") {
      session.bundle.fluidos = "solicitado";
      logEvent("FLUIDS_SUGGESTED");
    }
    enqueueEffect({
      type: "alert",
      title: "Ressuscitação volêmica",
      message:
        "Há hipoperfusão ou hipotensão. Considerar pelo menos 30 mililitros por quilo de cristalóide nas primeiras horas quando apropriado.",
    });
    return;
  }

  session.septicShockRecognized = true;
  session.bundle.fluidos = session.bundle.fluidos === "realizado" ? "realizado" : "solicitado";
  session.bundle.vasopressor = session.bundle.vasopressor === "realizado" ? "realizado" : "solicitado";
  session.mapState = "abaixo_da_meta";
  logEvent("SEPTIC_SHOCK_RECOGNIZED");
  logEvent("VASOPRESSOR_SUGGESTED");
  enqueueEffect({
    type: "alert",
    title: "Choque séptico",
    message:
      "Hipotensão persistente após volume exige vasopressor. Noradrenalina é a primeira linha para meta de PAM maior ou igual a 65 milímetros de mercúrio.",
  });
  enqueueEffect({
    type: "speak",
    message: "Choque séptico reconhecido",
    suppressStateSpeech: true,
  });
}

function setMapState(state: MapState) {
  session.mapState = state;
  logEvent("MAP_REASSESSED", { status: state });
}

function updateBundleStatus(
  itemId: BundleItemId,
  status: BundleStatus,
  source: "panel" | "execution" = "panel"
) {
  if (session.bundle[itemId] === status) {
    return;
  }

  session.bundle[itemId] = status;
  logEvent("BUNDLE_ITEM_UPDATED", { itemId, status, source });

  if (itemId === "antibiotico" && status === "realizado") {
    session.antibioticDueAt = undefined;
    session.antibioticReminderNextAt = undefined;
  }

  if (itemId === "vasopressor" && status !== "pendente") {
    session.septicShockRecognized = true;
    session.perfusionState = "choque_septico";
    if (session.mapState === "desconhecida") {
      session.mapState = "abaixo_da_meta";
    }
  }
}

function getCurrentState(): ProtocolState {
  const template = getCurrentTemplate();

  if (session.currentStateId === "reconhecimento" || session.currentStateId === "qsofa_criterios") {
    return {
      ...template,
      details: [
        ...template.details ?? [],
        `Achados clínicos iniciais: ${getAssessmentSummary()}.`,
      ],
    };
  }

  if (session.currentStateId === "classificacao_gravidade") {
    const sofaConfirmed = hasConfirmedSepsisBySofa();
    const scenario = getAutomaticScenario();
    return {
      ...template,
      details: [
        `Classificação sugerida: ${scenario === "suspeita_choque_septico" ? "sepse com suspeita de choque séptico" : scenario === "sepse_alto_risco" ? sofaConfirmed ? "sepse confirmada por SOFA" : "alto risco de sepse — completar SOFA" : "infecção suspeita — avaliar critérios de sepse"}.`,
        getAssessmentPrompt(),
        `Achados críticos: ${getAssessmentSummary()}.`,
        `Base da classificação: ${getAutomaticScenarioReasoning()}.`,
      ],
    };
  }

  if (session.currentStateId === "bundle_1h") {
    const highLikelihoodSepsis = hasHighLikelihoodSepsis();
    return {
      ...template,
      details: [
        ...getBundleActionRecommendations(),
        session.scenario === "suspeita_choque_septico"
          ? "No choque séptico ou probabilidade muito alta, o antimicrobiano não deve atrasar: objetivo é até 1 hora."
          : highLikelihoodSepsis
            ? "Sem choque, faça avaliação rápida das causas infecciosas e não infecciosas; se a probabilidade de sepse seguir alta, objetivo é antibiótico em até 3 horas."
            : "Se a hipótese infecciosa ainda for incerta, continue reavaliação clínica e diagnósticos diferenciais antes de escalar ATB.",
        `Itens pendentes no bundle: ${getPendingBundleCount()}.`,
      ],
    };
  }

  if (session.currentStateId === "reavaliacao_volume") {
    return {
      ...template,
      details: [
        "Reavaliar perfusão de forma integrada: PAM, enchimento capilar, diurese, estado mental e lactato.",
        `Resumo clínico atual: ${getAssessmentSummary()}.`,
        session.bundle.fluidos === "realizado"
          ? "Ressuscitação volêmica já registrada. Avaliar resposta clínica real."
          : shouldSuggestCrystalloid()
            ? `Indicado cristalóide 30 mL/kg agora. ${getInitialCrystalloidVolumeLabel()}`
            : `Ringer Lactato 30 mL/kg conforme resposta clínica (cristalóide balanceado — SSC 2021). ${getInitialCrystalloidVolumeLabel()}`,
        shouldSuggestImmediateVasopressor()
          ? "Contexto sugere choque. Considere noradrenalina precocemente."
          : shouldSuggestVasopressor()
            ? "Se PAM <65 após volume, inicie noradrenalina."
            : "Reavaliar necessidade de vasopressor conforme resposta ao volume.",
      ],
    };
  }

  if (session.currentStateId === "vasopressor_indicado") {
    return {
      ...template,
      details: [
        session.bundle.vasopressor === "realizado"
          ? "Noradrenalina já registrada. Reavaliar PAM e necessidade de associação."
          : "Iniciar noradrenalina agora — vasopressor de 1ª linha. Meta PAM ≥65 mmHg.",
        session.vasopressinSuggested
          ? "Vasopressina já foi sugerida como adição."
          : "Se PAM inadequada com norad, adicionar vasopressina 0,03 U/min.",
        session.inotropeConsidered
          ? "Inotrópico já foi considerado no contexto atual."
          : "Considerar dobutamina se disfunção miocárdica com hipoperfusão persistente.",
      ],
    };
  }

  if (session.currentStateId === "choque_refratario") {
    return {
      ...template,
      details: [
        ...template.details ?? [],
        `Situação hemodinâmica atual: ${getAssessmentSummary()}.`,
      ],
    };
  }

  if (session.currentStateId === "monitorizacao_ativa") {
    return {
      ...template,
      details: [
        "Reavaliar o que já foi feito, o que falta do bundle e a resposta hemodinâmica atual.",
        `Bundle: lactato ${getBundleStatusLabel(session.bundle.lactato).toLowerCase()}, culturas ${getBundleStatusLabel(session.bundle.culturas).toLowerCase()}, antimicrobiano ${getBundleStatusLabel(session.bundle.antibiotico).toLowerCase()}.`,
        `Achados clínicos: ${getAssessmentSummary()}.`,
        "Se houver piora, retornar para vasopressor ou reavaliação hemodinâmica.",
      ],
    };
  }

  return template;
}

function transitionToState(stateId: string, eventType: string, data?: Event["data"]) {
  if (session.currentStateId !== stateId) {
    session.previousStateIds.push(session.currentStateId);
  }
  session.currentStateId = stateId;
  session.stateEntrySequence += 1;
  logEvent(eventType, { to: stateId, ...data });
}

function getMissingFieldsForCurrentStage() {
  const missing: string[] = [];

  if (session.currentStateId === "reconhecimento" || session.currentStateId === "acesso_coletas") {
    const checks: Array<[keyof Session["assessment"], string]> = [
      ["age", "idade"],
      ["sex", "sexo"],
      ["weightKg", "peso"],
      ["suspectedSource", "foco suspeito"],
      ["heartRate", "frequência cardíaca"],
      ["temperature", "temperatura"],
      ["respiratoryRate", "frequência respiratória"],
      ["mentalStatus", "estado mental"],
      ["systolicPressure", "PAS"],
      ["diastolicPressure", "PAD"],
    ];

    for (const [key, label] of checks) {
      if (!session.assessment[key]?.trim()) {
        missing.push(label);
      }
    }
  }

  if (session.currentStateId === "bundle_1h") {
    for (const [itemId, status] of Object.entries(session.bundle)) {
      if (status !== "realizado") {
        missing.push(
          itemId === "lactato"
            ? "lactato"
            : itemId === "culturas"
              ? "culturas / hemoculturas"
              : itemId === "antibiotico"
                ? "antimicrobiano"
                : itemId === "fluidos"
                  ? "cristaloide"
                  : "vasopressor"
        );
      }
    }
  }

  if (session.currentStateId === "controle_foco") {
    const hasMarkedFocus = Object.values(session.reversibleCauseStatuses).some(
      (status) => status === "suspeita" || status === "abordada"
    );
    if (!hasMarkedFocus) {
      missing.push("foco infeccioso identificado");
    }
  }

  return missing;
}

function enqueueStageCompletionWarning() {
  const missing = getMissingFieldsForCurrentStage();
  if (missing.length === 0) {
    return;
  }

  const preview = missing.slice(0, 4).join(", ");
  const suffix = missing.length > 4 ? ` e mais ${missing.length - 4}` : "";
  enqueueEffect({
    type: "alert",
    title: "Revisar etapa anterior",
    message: `Ainda não foram preenchidos ou marcados: ${preview}${suffix}. Se necessário, volte e revise esta etapa.`,
  });
}

function resolveNextStateId(options: Record<string, string> | undefined, input: string) {
  if (!options) {
    return undefined;
  }

  const normalized = input.trim().toLowerCase();
  for (const [key, nextStateId] of Object.entries(options)) {
    if (key.trim().toLowerCase() === normalized) {
      return nextStateId;
    }
  }
  return undefined;
}

function next(input?: string) {
  const state = getCurrentState();
  const template = getCurrentTemplate();

  if (state.type === "action") {
    ensureRecognitionStarted();
    enqueueStageCompletionWarning();

    // classificacao_gravidade is now a question state — skip special handling here.
    // reavaliacao_volume is also a question — handled below.

    if (session.currentStateId === "vasopressor_indicado") {
      if (session.bundle.vasopressor !== "realizado") {
        session.bundle.vasopressor = "solicitado";
      }
      transitionToState("avaliar_resposta_vasopressor", "STATE_TRANSITIONED");
      return getCurrentState();
    }

    if (session.currentStateId === "monitorizacao_ativa") {
      transitionToState("revisao_atb", "STATE_TRANSITIONED");
      return getCurrentState();
    }

    if (template.next) {
      transitionToState(template.next, "STATE_TRANSITIONED");
    }
    return getCurrentState();
  }

  if (state.type === "end") {
    return state;
  }

  if (!input) {
    throw new Error("Resposta necessária");
  }

  ensureRecognitionStarted();
  const normalized = input.trim().toLowerCase();
  const nextStateId = resolveNextStateId(state.options, normalized);
  if (!nextStateId) {
    throw new Error(`Resposta inválida: ${input}`);
  }

  enqueueStageCompletionWarning();

  // Classificação de gravidade: acionar cenário automaticamente ao confirmar
  if (session.currentStateId === "classificacao_gravidade") {
    if (normalized === "choque_septico" || normalized === "sepse") {
      const scenarioMap: Record<string, Scenario> = {
        choque_septico: "suspeita_choque_septico",
        sepse: "sepse_alto_risco",
      };
      setScenario(scenarioMap[normalized] ?? getAutomaticScenario());
    }
  }

  // Reavaliação de volume: registrar estado de perfusão
  if (session.currentStateId === "reavaliacao_volume") {
    if (normalized === "respondeu") {
      setPerfusionState("adequada");
    } else if (normalized === "nao_respondeu" || normalized === "sinais_congestao") {
      setPerfusionState("hipoperfusao_ou_hipotensao");
    }
  }

  // Resposta ao vasopressor
  if (session.currentStateId === "avaliar_resposta_vasopressor") {
    if (normalized === "pam_atingida") {
      session.mapState = "meta_atingida";
      setPerfusionState("adequada");
    }
  }

  // Destino final
  if (session.currentStateId === "definir_destino") {
    session.destination =
      normalized === "uti"
        ? "UTI"
        : normalized === "semi_intensiva"
          ? "Semi-intensiva"
        : normalized === "enfermaria"
          ? "Enfermaria"
            : normalized === "observacao"
              ? "Observação"
            : "Reavaliação em curso";
    logEvent("DESTINATION_DEFINED", { destination: session.destination });
  }

  logEvent("QUESTION_ANSWERED", { stateId: session.currentStateId, input: normalized });
  transitionToState(nextStateId, "QUESTION_TRANSITIONED", { input: normalized });
  return getCurrentState();
}

function canGoBack() {
  return session.previousStateIds.length > 0;
}

function goBack() {
  const previousStateId = session.previousStateIds.pop();
  if (!previousStateId) {
    return getCurrentState();
  }

  session.currentStateId = previousStateId;
  session.stateEntrySequence += 1;
  logEvent("STATE_RETURNED", { to: previousStateId });
  return getCurrentState();
}

function getDocumentationActions(): DocumentationAction[] {
  return [];
}

function registerExecution(
  actionId: "shock" | "adrenaline" | "antiarrhythmic" | DocumentationAction["id"]
) {
  const allowed = getDocumentationActions();
  if (!allowed.some((item) => item.id === actionId)) {
    throw new Error("Registro não disponível no estado atual.");
  }

  if (actionId === "antibiotic") {
    updateBundleStatus("antibiotico", "realizado", "execution");
    logEvent("ANTIBIOTIC_STARTED");
  }

  if (actionId === "fluids") {
    updateBundleStatus("fluidos", "realizado", "execution");
    logEvent("FLUIDS_STARTED");
  }

  if (actionId === "norepinephrine") {
    updateBundleStatus("vasopressor", "realizado", "execution");
    session.septicShockRecognized = true;
    session.perfusionState = "choque_septico";
    if (session.mapState === "desconhecida") {
      session.mapState = "abaixo_da_meta";
    }
    logEvent("NOREPINEPHRINE_STARTED");
  }

  logEvent("ACTION_EXECUTED", { actionId, stateId: session.currentStateId });
  return getClinicalLog();
}

// ── Recomendações contextuais de estabilização ─────────────────────────────
function buildStabilizationRecommendations(): AuxiliaryPanel["recommendations"] {
  const recs: AuxiliaryPanel["recommendations"] = [];
  const map         = getCalculatedMap();
  const qsofa       = getQsofaScore();
  const lactate     = getLactateMmolValue();
  const weight      = parseNumber(session.assessment.weightKg);
  const gcs         = parseNumber(session.assessment.gcs);
  const spo2Raw     = session.assessment.oxygenSaturation.replace("%","").replace(",",".");
  const spo2        = parseNumber(spo2Raw);
  const fr          = parseNumber(session.assessment.respiratoryRate);
  const scenario    = session.scenario ?? "";
  const shockOrHighRisk = (map !== null && map < 65) || qsofa >= 2 || scenario === "suspeita_choque_septico";

  // ── SOFA summary recommendation ─────────────────────────────────────────
  const sofaResult = calculateSofa2Score();
  if (sofaResult !== null) {
    const { total, respiratorio, cardiovascular, figado, rim, cerebro, hemostasia, missing } = sofaResult;
    const domainLines: string[] = [
      `🫁 Respiratório: ${respiratorio}/4`,
      `❤️ Cardiovascular: ${cardiovascular}/4`,
      `🟡 Fígado: ${figado}/4`,
      `🫘 Rim: ${rim}/4`,
      `🧠 Cérebro (GCS): ${cerebro}/4`,
      `🩸 Hemostasia (plaquetas): ${hemostasia}/4`,
    ];
    if (missing.length > 0) {
      domainLines.push(`⚪ Pendente: ${missing.join(", ")}`);
    }
    const riskMsg = total >= 11 ? "Mortalidade hospitalar estimada > 50% — cuidado intensivo imediato."
      : total >= 7 ? "Mortalidade estimada ~30% — escalonamento de suporte."
      : total >= 2 ? "Disfunção orgânica presente — sepse confirmada pelos critérios Sepsis-3."
      : total >= 1 ? "SOFA baixo — monitorar evolução e repetir quando exames completados."
      : "Sem disfunção orgânica aparente pelos dados disponíveis.";
    recs.push({
      title: `🧮 SOFA: ${total}/24 ${missing.length > 0 ? "(parcial)" : ""}`,
      tone: total >= 7 ? "danger" : total >= 2 ? "warning" : "info",
      priority: total >= 7 ? "high" : total >= 2 ? "high" : "medium",
      lines: [riskMsg, ...domainLines],
    });
  }

  // — Volume de ressuscitação —
  const volMl = weight ? Math.round(weight * 30) : null;
  const fluidUrgent = shouldSuggestCrystalloid();
  recs.push({
    title: "💧 Ressuscitação volêmica",
    tone: fluidUrgent ? "warning" : "info",
    priority: fluidUrgent ? "high" : "medium",
    lines: volMl
      ? [
          `${fluidUrgent ? "⚠️ Indicado agora. " : ""}Cristalóide ${volMl} mL (30 mL/kg × ${weight} kg).`,
          hasFluidOverloadRisk()
            ? "Há risco de sobrecarga: preferir bolus menores (250–500 mL) com reavaliação seriada de perfusão, ausculta e oxigenação."
            : "Infundir em bolus de 500 mL repetindo conforme resposta hemodinâmica.",
          "Reavaliar PAM, FR, diurese e lactato a cada 30 min.",
        ]
      : [
          "⚠️ Informe o peso para calcular o volume exato.",
          "Iniciar cristalóide 500 mL em bolus enquanto aguarda.",
        ],
  });

  // — Vasopressor —
  if (map !== null && map < 65) {
    recs.push({
      title: "🩸 Vasopressor — PAM < 65 mmHg",
      tone: "warning",
      priority: "high",
      lines: [
        `PAM atual: ${Math.round(map)} mmHg — abaixo da meta de 65 mmHg.`,
        "Noradrenalina é o vasopressor de 1ª escolha: iniciar 0,1–0,2 mcg/kg/min.",
        "Prefira acesso venoso central. Pode iniciar periférico temporariamente em emergência.",
        "Considerar vasopressina 0,03 U/min se dose ≥ 0,25 mcg/kg/min.",
      ],
    });
  } else if (scenario === "suspeita_choque_septico") {
    recs.push({
      title: "🩸 Vasopressor — choque séptico",
      tone: "warning",
      priority: "high",
      lines: [
        "Critérios de choque séptico presentes.",
        "Noradrenalina: 1ª escolha — iniciar 0,1 mcg/kg/min e titular.",
        "Vasopressina 0,03 U/min: adjuvante se noradrenalina ≥ 0,25 mcg/kg/min.",
        "Dobutamina: considerar se disfunção miocárdica associada.",
      ],
    });
  }

  recs.push({
    title: "🦠 Antimicrobiano e controle de foco",
    tone: session.scenario === "suspeita_choque_septico" ? "warning" : "info",
    priority: session.scenario === "suspeita_choque_septico" ? "high" : "medium",
    lines: [
      session.scenario === "suspeita_choque_septico"
        ? "Choque séptico ou alta probabilidade: administrar antimicrobiano imediatamente, idealmente em até 1 hora."
        : "Sem choque: fazer avaliação rápida das causas infecciosas e não infecciosas; se a probabilidade de sepse seguir alta, administrar antimicrobiano em até 3 horas.",
      "Coletar culturas antes do antimicrobiano se isso não provocar atraso clinicamente relevante.",
      "Controle de foco deve ser planejado precocemente quando houver coleção, obstrução, tecido infectado ou dispositivo potencialmente infectado.",
    ],
  });

  // — Intubação / VM —
  const iotReasons: string[] = [];
  if (gcs !== null && gcs <= 8) iotReasons.push(`GCS ${gcs} (≤8)`);
  if (spo2 !== null && spo2 < 90) iotReasons.push(`SpO₂ ${spo2}% (<90%)`);
  if (fr !== null && fr >= 35) iotReasons.push(`FR ${fr} irpm (≥35)`);
  if (iotReasons.length > 0) {
    recs.push({
      title: "🫁 Intubação orotraqueal — indicada",
      tone: "warning",
      priority: "high",
      lines: [
        `Critérios: ${iotReasons.join(" · ")}.`,
        "Pré-oxigenar com máscara com reservatório 10–15 L/min por ≥ 5 min.",
        "SRI: Ketamina 1–2 mg/kg IV + Succinilcolina 1,5 mg/kg IV.",
        "Meta ventilatória: VC 6 mL/kg de peso ideal · PEEP 5–8 · FiO₂ para SpO₂ ≥ 94%.",
      ],
    });
  } else if (spo2 !== null && spo2 < 94) {
    recs.push({
      title: "🫁 Suporte de O₂",
      tone: "warning",
      priority: "medium",
      lines: [
        `SpO₂ ${spo2}% — abaixo da meta (≥94%).`,
        "Progredir: cateter nasal 2–6 L/min → máscara Venturi → máscara c/ reservatório 10–15 L/min → VNI.",
        "Se sem melhora em 30–60 min ou piora do esforço respiratório, considerar IOT precoce.",
      ],
    });
  } else {
    recs.push({
      title: "🫁 Oxigenoterapia",
      tone: "info",
      priority: "low",
      lines: [
        "SpO₂ estável. Manter vigilância.",
        "Se SpO₂ < 94% ou FR > 22 irpm, iniciar cateter nasal 2–4 L/min.",
        "Meta: SpO₂ 94–98% (evitar hiperóxia).",
      ],
    });
  }

  // — Acesso vascular —
  recs.push({
    title: "🩺 Acesso vascular",
    tone: shockOrHighRisk ? "warning" : "info",
    priority: shockOrHighRisk ? "high" : "medium",
    lines: shockOrHighRisk
      ? [
          "2 acessos venosos periféricos calibrosos (≥ 18G) — imediato.",
          "Planejar CVC (jugular interna ou subclávia) para vasopressor e monitorização de PVC.",
          "Cateter arterial radial se vasopressor em uso para PA invasiva contínua.",
        ]
      : [
          "1 acesso venoso periférico calibroso (≥ 18G).",
          "Reservar acesso central se houver necessidade de vasopressor, nutrição ou PVC.",
        ],
  });

  // — Sondagem vesical —
  recs.push({
    title: "🚰 Sondagem vesical de demora (SVD)",
    tone: qsofa >= 2 ? "warning" : "info",
    priority: qsofa >= 2 ? "high" : "medium",
    lines: [
      "Instalar SVD para controle rigoroso de diurese.",
      "Meta: ≥ 0,5 mL/kg/h. Registrar balanço hídrico horário.",
      "Oligúria persistente sugere disfunção renal por hipoperfusão — reavaliar.",
    ],
  });

  // — Monitorização —
  const monLines = [
    "ECG contínuo (ritmo e FC)",
    "Oximetria de pulso contínua",
    shockOrHighRisk ? "PA invasiva (radial) + PANI de resgate" : "PANI a cada 15 min",
    "Temperatura seriada (2/2h)",
    "Diurese horária (meta ≥ 0,5 mL/kg/h)",
    "Glicemia capilar (meta 140–180 mg/dL — tratar se > 180)",
  ];
  if (lactate !== null && lactate >= 2) monLines.push("Lactato seriado em 2h — meta: redução ≥ 10%");
  recs.push({
    title: "📊 Monitorização contínua",
    tone: "info",
    priority: "medium",
    lines: monLines,
  });

  // — Alerta ATB — SSC 2021 framework diferenciado por gravidade —
  const isShock = (map !== null && map < 65) || scenario === "suspeita_choque_septico";
  const isSepsis = qsofa >= 2 || (lactate !== null && lactate >= 2);

  recs.push({
    title: isShock
      ? "⏱️ ATB imediato — Choque séptico (SSC 2021)"
      : isSepsis
        ? "⏱️ ATB em até 1 hora — Sepse confirmada (SSC 2021)"
        : "⏱️ ATB em até 3 horas — Sepse possível (SSC 2021)",
    tone: "warning",
    priority: "high",
    lines: isShock
      ? [
          "CHOQUE SÉPTICO: administrar ATB IMEDIATAMENTE — idealmente em até 1 hora (recomendação forte, SSC 2021).",
          "Não aguardar culturas se isso atrasar o tratamento.",
          "Coletar 2 pares de hemoculturas simultaneamente enquanto prepara o ATB.",
          "Confirme dose, diluição, via e velocidade de infusão.",
        ]
      : isSepsis
        ? [
            "SEPSE SEM CHOQUE: meta de 1ª dose em até 1 hora (recomendação forte, SSC 2021).",
            "Coletar hemoculturas (2 pares) ANTES do ATB — sem atrasar por isso.",
            "Cada hora de atraso aumenta mortalidade. Priorizar agora.",
            "Confirme dose, diluição, via e velocidade de infusão.",
          ]
        : [
            "SEPSE POSSÍVEL SEM CHOQUE: investigação rápida (até 3 horas) antes de iniciar ATB — recomendação condicional SSC 2021.",
            "Se suspeita de infecção persistir após avaliação rápida, administrar ATB em até 3 horas.",
            "Diferenciar causa infecciosa de não-infecciosa antes de iniciar se houver tempo.",
            "Se piora clínica, reduzir para meta de 1 hora.",
          ],
  });

  // — Controle do foco infeccioso —
  const source = session.assessment.suspectedSource.trim().toLowerCase();
  if (source.includes("abdominal") || source.includes("periton")) {
    recs.push({
      title: "🔪 Controle do foco — cirúrgico",
      tone: "warning",
      priority: "high",
      lines: [
        "Foco abdominal suspeito — acionar cirurgia geral imediatamente.",
        "Avaliar drenagem percutânea ou laparotomia conforme contexto.",
        "NÃO retardar o ATB aguardando a intervenção cirúrgica.",
      ],
    });
  } else if (source.includes("cateter")) {
    recs.push({
      title: "🔌 Controle do foco — cateter",
      tone: "warning",
      priority: "high",
      lines: [
        "Remover cateter suspeito imediatamente se possível.",
        "Coletar hemoculturas: 1 par pelo cateter + 1 par periférico antes de remover.",
        "Trocar acesso por sítio diferente após estabilização.",
      ],
    });
  }

  return recs;
}

// ── Auto-sugestão de contexto antimicrobiano ──────────────────────────────
function getAutoSuggestedBetaLactamAllergy(): { value: string; label: string } | null {
  const allergies = session.assessment.allergies.trim().toLowerCase();
  if (!allergies) return null;
  const betaLactamKw = ["penicilina", "amoxicilina", "ampicilina", "cefalosporina",
    "cefalexina", "ceftriaxona", "cefazolina", "imipenem", "meropenem", "beta-lactâmico",
    "beta lactam", "carbapeném"];
  const hasBetaLactam = betaLactamKw.some((kw) => allergies.includes(kw));
  if (hasBetaLactam) {
    return { value: "Sim", label: "Sim — alergia a beta-lactâmico registrada em Alergias" };
  }
  if (/sem alergia|nenhuma/i.test(allergies)) {
    return { value: "Não", label: "Não — sem alergias relevantes registradas" };
  }
  return { value: "Não", label: "Não — sem beta-lactâmico nas alergias registradas" };
}

function getAutoSuggestedMdrRisk(): { value: string; label: string } | null {
  const meds    = session.assessment.currentMedications.trim().toLowerCase();
  const care    = session.assessment.careSetting.trim().toLowerCase();
  const comorbid = session.assessment.comorbidities.trim().toLowerCase();
  const history = session.assessment.historyPresentIllness.trim().toLowerCase();
  if (!meds && !care && !comorbid && !history) return null;

  const hasRecentATB    = /antibiótico|atb prev|antibiot/i.test(meds);
  const isHealthAssoc   = /assist|hospitalar|uti/i.test(care) ||
                          /internação recente|hospitali/i.test(history);
  const isImmunosupp    = /imunossupres|neoplasia|quimio|corticóide|hiv|transplant/i.test(comorbid) ||
                          /imunossupres|quimio/i.test(meds);
  const isDialysis      = /diálise|hemodiálise|drc/i.test(comorbid);

  if (hasRecentATB || isHealthAssoc || isDialysis) {
    const reasons: string[] = [];
    if (hasRecentATB)   reasons.push("ATB prévio recente");
    if (isHealthAssoc)  reasons.push("origem hospitalar/assistencial");
    if (isDialysis)     reasons.push("diálise");
    return { value: "Alto", label: `Alto — ${reasons.join(" · ")}` };
  }
  if (isImmunosupp) {
    return { value: "Alto", label: "Alto — imunossupressão identificada" };
  }
  return { value: "Baixo", label: "Baixo — sem fatores de risco para MDR identificados" };
}

function getAutoSuggestedMrsaRisk(): { value: string; label: string } | null {
  const comorbid = session.assessment.comorbidities.trim().toLowerCase();
  const meds     = session.assessment.currentMedications.trim().toLowerCase();
  const care     = session.assessment.careSetting.trim().toLowerCase();
  const history  = session.assessment.historyPresentIllness.trim().toLowerCase();
  if (!comorbid && !meds && !care && !history) return null;

  const isUTI           = /uti/i.test(care);
  const isDialysis      = /diálise|hemodiálise|drc/i.test(comorbid);
  const isImmunosupp    = /imunossupres|neoplasia|hiv|transplant/i.test(comorbid);
  const hasFreqHosp     = /internação recente|hospitali/i.test(history);
  const hasImmunoMeds   = /imunossupres|quimio|corticóide/i.test(meds);

  if (isUTI || (isDialysis && hasFreqHosp) || isImmunosupp || hasImmunoMeds) {
    const reasons: string[] = [];
    if (isUTI)          reasons.push("UTI");
    if (isDialysis)     reasons.push("diálise");
    if (isImmunosupp)   reasons.push("imunossupressão");
    if (hasFreqHosp)    reasons.push("internações frequentes");
    return { value: "Sim", label: `Sim — ${reasons.join(" · ")}` };
  }
  return { value: "Não", label: "Não — sem fatores de risco para MRSA identificados" };
}

function getAutoSuggestedCareSetting(): { value: string; label: string } | null {
  const history  = session.assessment.historyPresentIllness.trim().toLowerCase();
  const comorbid = session.assessment.comorbidities.trim().toLowerCase();
  const meds     = session.assessment.currentMedications.trim().toLowerCase();
  if (!history && !comorbid && !meds) return null;

  if (/internação recente|(<90 dias)|hospitali/i.test(history)) {
    return { value: "Assistência à saúde", label: "Assistência à saúde — internação recente registrada" };
  }
  if (/hospitalar/i.test(history)) {
    return { value: "Hospitalar", label: "Hospitalar — contexto intra-hospitalar" };
  }
  return { value: "Comunitário", label: "Comunitário — sem indicativo de origem hospitalar" };
}

// ── Auto-sugestões para campos de Estabilização ───────────────────────────

function getAutoSuggestedOxygenTherapy(): { value: string; label: string } | null {
  const spo2Raw = session.assessment.oxygenSaturation.replace("%","").replace(",",".");
  const spo2 = parseNumber(spo2Raw);
  const fr   = parseNumber(session.assessment.respiratoryRate);
  const gcs  = parseNumber(session.assessment.gcs);

  if (spo2 === null && fr === null && gcs === null) return null;

  const intubInd = (gcs !== null && gcs <= 8) ||
    (spo2 !== null && spo2 < 90 && fr !== null && fr >= 35);
  if (intubInd) {
    return {
      value: "Intubação orotraqueal + Ventilação mecânica",
      label: `IOT indicada — ${gcs !== null && gcs <= 8 ? `GCS ${gcs} ≤ 8` : `SpO₂ ${spo2}% + FR ${fr} irpm`}`,
    };
  }
  if (spo2 !== null && spo2 < 90) {
    return { value: "O₂ máscara com reservatório 10–15 L/min", label: `SpO₂ ${spo2}% — máscara reservatório de alta concentração` };
  }
  if ((spo2 !== null && spo2 < 94) || (fr !== null && fr >= 28)) {
    return { value: "O₂ máscara com reservatório 10–15 L/min", label: `SpO₂ ${spo2 ?? "?"}% / FR ${fr ?? "?"}irpm — alto suporte de O₂` };
  }
  if (spo2 !== null && spo2 < 96) {
    return { value: "O₂ máscara simples 5–8 L/min", label: `SpO₂ ${spo2}% — suporte moderado de O₂` };
  }
  if (spo2 !== null && spo2 < 98) {
    return { value: "O₂ cateter nasal 2–4 L/min", label: `SpO₂ ${spo2}% — cateter nasal de baixo fluxo` };
  }
  return { value: "Sem suporte de O₂ no momento", label: `SpO₂ ${spo2 ?? "?"}% — sem necessidade de O₂ suplementar` };
}

function getAutoSuggestedFluidResuscitation(): { value: string; label: string } | null {
  const map     = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const weight  = parseNumber(session.assessment.weightKg);
  const fluidLabel = getFluidVolumeLabel();
  const overloadRisk = hasFluidOverloadRisk();

  if (map === null && lactate === null) return null;

  const isShock = map !== null && map < 65;
  const highLactate = lactate !== null && lactate >= 2;

  if (isShock || highLactate) {
    const basis = isShock ? `PAM ${Math.round(map!)} mmHg` : `Lactato ${lactate!.toFixed(1)} mmol/L`;
    const vol = weight ? fluidLabel : "30 mL/kg";
    return {
      value: overloadRisk
        ? `Cristalóide balanceado em bolus fracionados até ${vol} (30 mL/kg), com reavaliação frequente`
        : `Ringer Lactato (cristalóide balanceado) ${vol} (30 mL/kg) em 30 min — SSC 2021`,
      label: overloadRisk
        ? `${basis} — volume guiado por resposta, com cautela por risco de sobrecarga`
        : `${basis} — ressuscitação volêmica 30 mL/kg — Ringer Lactato (${vol})`,
    };
  }
  if (map !== null && map < 70) {
    return { value: "Ringer Lactato 500 mL em bolus — reavaliar", label: `PAM ${Math.round(map)} mmHg — bolus inicial e reavaliação` };
  }
  if (map !== null && map >= 70 && lactate !== null && lactate < 2) {
    return { value: "Reposição volêmica restritiva — sem sinais de hipoperfusão", label: `PAM ${Math.round(map)} mmHg, lactato < 2 — abordagem restritiva` };
  }
  return null;
}

function getAutoSuggestedVascularAccess(): { value: string; label: string } | null {
  const map    = getCalculatedMap();
  const qsofa  = getQsofaScore();
  const lactate = getLactateMmolValue();

  if (map === null && qsofa === 0) return null;

  const isShock = map !== null && map < 65;
  const highRisk = qsofa >= 2 || (lactate !== null && lactate >= 2);

  if (isShock) {
    return {
      value: "2 acessos venosos periféricos calibrosos | Cateter venoso central — jugular interna | Cateter arterial radial (PA invasiva contínua)",
      label: "Choque séptico — CVC + cateter arterial + 2× AVP calibrosos",
    };
  }
  if (highRisk) {
    return {
      value: "2 acessos venosos periféricos calibrosos",
      label: "Sepse de alto risco — 2 acessos periféricos calibrosos, avaliar CVC",
    };
  }
  return { value: "Acesso venoso periférico 18G", label: "Sepse possível — acesso periférico calibroso mínimo 18G" };
}

function getAutoSuggestedVasopressor(): { value: string; label: string } | null {
  const map    = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const oxygen = parseNumber(session.assessment.oxygenSaturation);
  const cardiacConcern = /ic|insufici[êe]ncia card|miocardi|fra[cç][aã]o de eje[cç][aã]o/i.test(
    session.assessment.comorbidities.toLowerCase()
  );

  if (map === null) return null;

  if (map < 65) {
    return {
      value: "Noradrenalina 0,1 mcg/kg/min — titular até PAM ≥ 65",
      label: `PAM ${Math.round(map)} mmHg — Noradrenalina 1ª linha (SSC 2021): iniciar 0,1 mcg/kg/min, titular PAM ≥ 65`,
    };
  }
  if (map < 70 && lactate !== null && lactate >= 2) {
    return {
      value: "Noradrenalina 0,1 mcg/kg/min — titular até PAM ≥ 65",
      label: `PAM limítrofe (${Math.round(map)}) + lactato ≥ 2 — avaliar noradrenalina precoce`,
    };
  }
  if (cardiacConcern && oxygen !== null && oxygen < 92) {
    return {
      value: "Reavaliar perfil hemodinâmico — considerar dobutamina se baixo débito e manter PAM com noradrenalina se necessário",
      label: "Hipoxemia + cardiopatia: diferenciar vasoplegia de baixo débito antes de escalar catecolamina",
    };
  }
  return { value: "Sem vasopressor necessário no momento", label: `PAM ${Math.round(map)} mmHg — sem indicação de vasopressor no momento` };
}

function getAutoSuggestedIntubation(): { value: string; label: string } | null {
  const gcs  = parseNumber(session.assessment.gcs);
  const spo2Raw = session.assessment.oxygenSaturation.replace("%","").replace(",",".");
  const spo2 = parseNumber(spo2Raw);
  const fr   = parseNumber(session.assessment.respiratoryRate);

  if (gcs === null && spo2 === null && fr === null) return null;

  if ((gcs !== null && gcs <= 8) || (spo2 !== null && spo2 < 90 && fr !== null && fr >= 35)) {
    const reason = gcs !== null && gcs <= 8 ? `GCS ${gcs}` : `SpO₂ ${spo2}% + FR ${fr}irpm`;
    return { value: "Intubação orotraqueal imediata (SRI)", label: `IOT imediata indicada — ${reason}` };
  }
  if ((spo2 !== null && spo2 < 94) || (fr !== null && fr >= 28)) {
    return {
      value: "VNI de prova — reavaliar em 30–60 min",
      label: `SpO₂ ${spo2 ?? "?"}% / FR ${fr ?? "?"}irpm — VNI como bridge, reavaliar IOT em 30–60 min`,
    };
  }
  if (fr !== null && fr >= 22) {
    return { value: "Sem indicação de IOT no momento", label: `FR ${fr}irpm — monitorar, sem indicação de IOT no momento` };
  }
  return { value: "Sem indicação de IOT no momento", label: "Parâmetros ventilatórios estáveis — sem indicação de IOT" };
}

function getAutoSuggestedUrinaryCatheter(): { value: string; label: string } | null {
  const map    = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const qsofa  = getQsofaScore();

  if (map === null && lactate === null && qsofa === 0) return null;

  const isShock = map !== null && map < 65;
  const highRisk = qsofa >= 2 || (lactate !== null && lactate >= 2);

  if (isShock || highRisk) {
    return {
      value: "Cateter vesical de demora — controle de diurese horária",
      label: isShock
        ? "Choque séptico — SVD obrigatório para controle de diurese horária (meta ≥ 0,5 mL/kg/h)"
        : "Sepse de alto risco — SVD para controle preciso de diurese",
    };
  }
  return { value: "Sem SVD — controle por outros meios", label: "Baixo risco — controle de diurese sem sondagem no momento" };
}

function getAutoSuggestedMonitoring(): { value: string; label: string } | null {
  const map    = getCalculatedMap();
  const qsofa  = getQsofaScore();
  const lactate = getLactateMmolValue();

  if (map === null && qsofa === 0) return null;

  const isShock = map !== null && map < 65;
  const isSepsis = qsofa >= 2 || (lactate !== null && lactate >= 2);

  if (isShock) {
    return {
      value: "ECG contínuo | Oximetria de pulso contínua | Pressão arterial invasiva (PAI) | Diurese horária (meta ≥ 0,5 mL/kg/h) | Lactato seriado em 2h (meta: ↓ ≥ 10%) | Glicemia capilar (meta 140–180 mg/dL) | Balanço hídrico horário",
      label: "Choque séptico — monitorização completa: ECG, SpO₂, PA invasiva, diurese, lactato seriado, glicemia, BH",
    };
  }
  if (isSepsis) {
    return {
      value: "ECG contínuo | Oximetria de pulso contínua | PANI a cada 15 min | Diurese horária (meta ≥ 0,5 mL/kg/h) | Lactato seriado em 2h (meta: ↓ ≥ 10%) | Glicemia capilar (meta 140–180 mg/dL)",
      label: "Sepse — ECG, SpO₂ contínua, PANI 15/15 min, diurese, lactato serial, glicemia",
    };
  }
  return {
    value: "ECG contínuo | Oximetria de pulso contínua | PANI a cada 15 min | Temperatura seriada (2/2h)",
    label: "Monitorização básica — ECG, SpO₂, PANI, temperatura",
  };
}

// ── Auto-sugestão: destino do paciente ───────────────────────────────────
function getAutoSuggestedPatientDestination(): { value: string; label: string } | null {
  const sofa    = calculateSofa2Score();
  const map     = getCalculatedMap();
  const qsofa   = getQsofaScore();
  const lactate = getLactateMmolValue();
  const gcs     = parseNumber(session.assessment.gcs);
  const oxygen  = parseNumber(session.assessment.oxygenSaturation);
  const needsVentilation = /intubação|iot|vm|vni/i.test(
    `${session.assessment.intubationDecision} ${session.assessment.oxygenTherapy}`
  );

  const isShock = (map !== null && map < 65) ||
    /noradrenalina|vasopressina/i.test(session.assessment.vasopressorUse);
  const sofaHigh = sofa !== null && sofa.total >= 6;
  const lattateMid  = lactate !== null && lactate >= 2;
  const lactateHigh = lactate !== null && lactate >= 4;
  const sofaMid  = sofa !== null && sofa.total >= 2;
  const gcsLow  = gcs !== null && gcs <= 12;

  if (isShock || sofaHigh || lactateHigh || gcsLow || needsVentilation || (oxygen !== null && oxygen < 90)) {
    const reason = isShock ? "choque séptico" : needsVentilation ? "suporte ventilatório" : sofaHigh ? `SOFA ${sofa!.total}` : lactateHigh ? `lactato ${lactate!.toFixed(1)} mmol/L` : gcsLow ? `GCS ${gcs}` : `SpO₂ ${oxygen}%`;
    return { value: "Internação imediata em UTI", label: `UTI urgente — ${reason} (alta morbimortalidade)` };
  }
  if (sofaMid || lattateMid || qsofa >= 2) {
    const reason = sofaMid ? `SOFA ${sofa!.total}` : lattateMid ? `lactato ${lactate!.toFixed(1)} mmol/L` : `qSOFA ${qsofa}`;
    return { value: "Internação em UTI ou semi-UTI", label: `UTI/semi-UTI — ${reason} — monitorização intensiva necessária` };
  }
  if (qsofa === 1) {
    return { value: "Internação em enfermaria com reavaliação em 4–6h", label: "Enfermaria — qSOFA 1 — reavaliação seriada obrigatória" };
  }
  return { value: "Observação 6–12h + alta com ATB VO se sem critérios de internação", label: "Baixo risco — observação e reavaliação antes de alta" };
}

// ── Auto-sugestão: outras condutas complementares ────────────────────────
function getAutoSuggestedAdditionalMeasures(): { value: string; label: string } | null {
  const map     = getCalculatedMap();
  const qsofa   = getQsofaScore();
  const lactate = getLactateMmolValue();
  const sofa    = calculateSofa2Score();
  const isShock = (map !== null && map < 65) ||
    /noradrenalina|vasopressina/i.test(session.assessment.vasopressorUse);
  const isSepsis = qsofa >= 2 || (lactate !== null && lactate >= 2);

  if (!isSepsis && !isShock) return null;

  const measures: string[] = [];

  measures.push("Controle glicêmico (meta 140–180 mg/dL)");
  if (isSepsis) {
    measures.push("Profilaxia de TVP: enoxaparina 40 mg SC 1x/dia (ClCr > 30) · ou HNF 5.000 UI SC 8/8h se ClCr < 30 mL/min");
    measures.push("Proteção gástrica: pantoprazol 40 mg IV 1x/dia (risco de úlcera de estresse)");
  }
  measures.push("Cabeceira elevada 30–45° (prevenir PAV e broncoaspiração)");

  if (isShock) {
    measures.push("Choque refratário a vasopressor: hidrocortisona 200 mg/dia IV contínuo — indicar se noradrenalina ≥ 0,25 mcg/kg/min (SSC 2021)");
    measures.push("Nutrição enteral precoce: iniciar em 24–48h pós-estabilização hemodinâmica");
  } else {
    measures.push("Nutrição: avaliar via oral ou enteral precoce conforme tolerância e risco");
  }

  if (session.assessment.suspectedSource.trim()) {
    measures.push("Controle de foco: avaliar necessidade de drenagem / desbridamento / remoção de dispositivo — idealmente em ≤ 6–12h quando anatomicamente possível (SSC 2021 — acionar cirurgião/especialista)");
  }

  measures.push("Descalonamento de ATB em 48–72h: aguardar culturas e antibiograma — reduzir espectro o mais cedo possível; usar Procalcitonina (PCT) seriada para guiar duração e de-escalada (SSC 2021 — recomendação fraca, evidência moderada)");

  if (lactate !== null && lactate >= 2) {
    measures.push("Remensurar lactato em 2h: meta ↓ ≥ 10% — persistência indica ressuscitação insuficiente");
  }

  const missingExams: string[] = [];
  if (!session.assessment.requestedExams.includes("Hemocultura")) {
    missingExams.push("Hemoculturas — 2 pares antes do ATB");
  }
  if (!session.assessment.requestedExams.includes("Lactato")) {
    missingExams.push("Lactato sérico (obrigatório no bundle SSC)");
  }
  if (!session.assessment.requestedExams.includes("Coagulação")) {
    missingExams.push("Coagulação — TP/TTPA/fibrinogênio (rastrear CIVD)");
  }
  if (missingExams.length > 0) {
    measures.push(`Exames pendentes recomendados: ${missingExams.join(" · ")}`);
  }

  if (isShock || (sofa !== null && sofa.total >= 2)) {
    measures.push("Comunicar UTI / time de resposta rápida — transferência prioritária");
  }

  return {
    value: measures.join(" | "),
    label: `${measures.length} condutas recomendadas baseadas no quadro clínico atual`,
  };
}

// ── Auto-sugestão UTI: escalonamento ATB baseado no esquema atual + culturas ──
function getAutoSuggestedAntibioticEscalation(): { value: string; label: string } | null {
  const cultures = session.assessment.currentCulturesResult.toLowerCase();
  const atb = session.assessment.currentAntibioticsRegimen.toLowerCase();
  const response = session.assessment.previousClinicalResponse.toLowerCase();
  const icuDays = parseInt(session.assessment.icuAdmissionDays, 10) || 0;
  const hasPoorResponse = response.includes("sem resposta") || response.includes("piora") || response.includes("parcial");

  // 1. Culture-directed (highest priority)
  if (cultures.includes("mrsa") || cultures.includes("meticilina")) {
    return { value: "Ajustar/confirmar cobertura MRSA — vancomicina 25–30 mg/kg ataque IV (alvo AUC/MIC 400–600)", label: "MRSA confirmado → garantir vancomicina ou linezolida" };
  }
  if (cultures.includes("kpc") || cultures.includes("carbapenemase")) {
    return { value: "Trocar para ceftazidima-avibactam 2,5g IV 8/8h (KPC) — ou meropeném 2g IV 8/8h em infusão estendida 3h se for apenas ESBL", label: "KPC/carbapenemase → ceftazidima-avibactam urgente" };
  }
  if (cultures.includes("esbl") && !cultures.includes("kpc")) {
    return { value: "Manter ou iniciar meropeném 1g IV 8/8h (ESBL confirmada) — não descalonar para cefalosporina", label: "ESBL → manter carbapenêmico" };
  }
  if (cultures.includes("pseudomonas")) {
    return { value: "Direcionar para antibiograma — cobrir Pseudomonas MDR: pip-tazo se sensível; meropeném se resistente; associar amicacina ou ciprofloxacino conforme resultado", label: "Pseudomonas → aguardar antibiograma para cobertura adequada" };
  }
  if (cultures.includes("acinetobacter")) {
    return { value: "Acinetobacter baumannii MDR → polimixina B 25.000 UI/kg/dia IV ÷ 12/12h + ampicilina-sulbactam 3g IV 4/4h (em dose alta)", label: "A. baumannii MDR → polimixina + sulbactam" };
  }
  if (cultures.includes("mssa") || (cultures.includes("s. aureus") && !cultures.includes("mrsa"))) {
    return { value: "Descalonar para oxacilina 2g IV 4/4h (MSSA confirmada) — superior à vancomicina; suspender vancomicina se em uso", label: "MSSA → descalonar para oxacilina" };
  }
  if (cultures.includes("candida") || cultures.includes("candidemia") || cultures.includes("fungemia")) {
    return { value: "Iniciar micafungina 100mg IV 1x/dia ou anidulafungina 200mg IV ataque → 100mg/dia — monitorar fundo de olho e ecocardiograma", label: "Candidemia → equinocandina precocemente" };
  }
  if (cultures.includes("negativas") && !hasPoorResponse) {
    return { value: "Culturas negativas com boa resposta após ≥ 72h → descalonar espectro (ex: meropeném → pip-tazo ou cefalosporina 3G conforme foco)", label: "Culturas negativas + melhora → descalonamento recomendado" };
  }

  // 2. ATB-regimen-guided escalation (when no culture result yet + poor response)
  if (hasPoorResponse) {
    if (atb.includes("pip") || atb.includes("piperacilina") || atb.includes("tazobactam")) {
      return { value: "Piperacilina-tazobactam com falha → escalonar para meropeném 1g IV 8/8h (cobrir ESBL e Pseudomonas mais resistente)", label: "Pip-tazo com falha → escalonar para meropeném" };
    }
    if ((atb.includes("meropeném") || atb.includes("meropen") || atb.includes("imipeném")) && !atb.includes("vancomicina") && !atb.includes("vanco")) {
      return { value: "Carbapenêmico com falha + sem cobertura MRSA → adicionar vancomicina 25–30 mg/kg ataque IV + colher novas culturas + buscar foco não drenado", label: "Carbapenêmico com falha → adicionar MRSA + buscar foco oculto" };
    }
    if ((atb.includes("meropeném") || atb.includes("imipeném")) && (atb.includes("vancomicina") || atb.includes("vanco"))) {
      const isLongICU = icuDays >= 7;
      return {
        value: isLongICU
          ? "Cobertura ampla com falha + UTI ≥ 7 dias → considerar: (1) ceftazidima-avibactam se KPC suspeita (2) adicionar equinocandina para Candida (3) buscar foco não drenado (4) etiologia não infecciosa?"
          : "Cobertura ampla com falha → rever foco (foco não drenado? cateter? dispositivo?), colher novas culturas e considerar equinocandina se fatores de risco para candidemia",
        label: "Broadspectrum com falha → busca de foco + considerar fungal",
      };
    }
    if (atb.includes("cefazolina") || atb.includes("oxacilina") || atb.includes("cefalexina")) {
      return { value: "Cefalosporina de 1G com falha → escalonar para pip-tazo 4,5g IV 6/6h (suspeita gram-negativo ou foco abdominal)", label: "Cefalosporina 1G com falha → escalonar cobertura gram-negativo" };
    }
    if (atb.includes("ceftriaxona") || atb.includes("cefepima")) {
      return { value: "Cefalosporina 3G/4G com falha → escalonar para pip-tazo 4,5g IV 6/6h ou meropeném 1g IV 8/8h conforme risco de ESBL/Pseudomonas", label: "Cefalo 3G/4G com falha → considerar carbapenêmico" };
    }
    // Generic fallback when ATB in use + poor response
    if (atb.trim()) {
      return { value: "Falha ao ATB atual → colher novas culturas de todos os sítios antes de modificar + ampliar espectro empiricamente + buscar foco não drenado", label: "Falha terapêutica → culturas + broadening empírico" };
    }
  }

  // 3. Risk-based (long ICU stay, no current ATB failure but risk factors)
  if (icuDays >= 14 && !atb.includes("equinocandina") && !atb.includes("micafungina") && !atb.includes("anidulafungina")) {
    return { value: "UTI ≥ 14 dias → alto risco de candidemia: considerar adicionar equinocandina empiricamente se piora inexplicada", label: `UTI há ${icuDays} dias → considerar antifúngico empírico` };
  }

  return null;
}

// ── Cards de manejo UTI: focados em piora do paciente já tratado ─────────────
function buildIcuManagementCards(): AuxiliaryPanel["recommendations"] {
  const recommendations: AuxiliaryPanel["recommendations"] = [];
  const scenario = session.assessment.icuScenario.toLowerCase();
  const complication = session.assessment.icuComplication.toLowerCase();
  const cultures = session.assessment.currentCulturesResult.toLowerCase();
  const atb = session.assessment.currentAntibioticsRegimen.toLowerCase();
  const response = session.assessment.previousClinicalResponse.toLowerCase();
  const devices = session.assessment.invasiveDevices.toLowerCase();
  const icuDays = parseInt(session.assessment.icuAdmissionDays, 10) || 0;
  const map = getCalculatedMap();
  const lactate = getLactateMmolValue();
  const vasopressor = session.assessment.currentVasopressorDoses.toLowerCase();
  const isNewPatient = scenario.includes("novo na uti") || scenario.includes("primeiro atendimento");

  // ── Card 0: NOVO PACIENTE NA UTI → Orientação obrigatória
  if (isNewPatient || !scenario) {
    recommendations.push({
      title: "🚑 Paciente Novo na UTI — Usar Primeiro Atendimento",
      lines: [
        "Este módulo UTI é para pacientes JÁ EM TRATAMENTO com piora clínica.",
        "",
        "Se o paciente está chegando agora à UTI pela 1ª vez:",
        "→ Selecione 'Primeiro Atendimento' (botão abaixo)",
        "→ Complete o bundle de sepse (ATB 1h, culturas, lactato, volume)",
        "→ Retorne a este fluxo UTI quando o paciente já estiver estabilizado e em tratamento",
        "",
        "Se for admissão UTI após atendimento inicial no PS/emergência e o bundle já foi cumprido:",
        "→ Marque 'Pós-estabilização — reavaliação' no campo acima e continue",
      ],
      tone: "danger",
      ctaButton: { label: "🚑 Ir para Primeiro Atendimento", actionId: "switch_to_emergencia" },
    });
    if (isNewPatient) return recommendations;
  }

  // ── Card 1: PROTOCOLO GERAL DE PIORA — Avaliação sistemática
  const hasPoorResponse = response.includes("sem resposta") || response.includes("piora") || response.includes("parcial");
  const hasDeterioration = scenario.includes("piora") || scenario.includes("já em tratamento");

  if (hasDeterioration || hasPoorResponse) {
    recommendations.push({
      title: "🔴 Piora Clínica — Investigação Sistemática",
      lines: [
        "PASSO 1 — Confirmar causa infecciosa vs. não-infecciosa:",
        "  → Novo exame físico completo (dispositivos, feridas, abdome, pulmões)",
        "  → Rever febre por fármaco (β-lactâmicos, vancomicina, anfotericina)",
        "  → Excluir TEP, TRALI, IAM tipo 2, DRESS",
        "",
        "PASSO 2 — Colher culturas ANTES de modificar ATB:",
        "  → 2 pares de hemoculturas + cultura do foco suspeito",
        "  → Trocar dispositivos suspeitos (CVC ≥ 7d, SVD ≥ 5d)",
        "",
        "PASSO 3 — Avaliar adequação do ATB atual:",
        "  → Espectro cobre o foco suspeito?",
        "  → Dose adequada ao peso e função renal?",
        "  → Sem resposta após 48–72h = falha → modificar",
        "",
        "PASSO 4 — Buscar foco não controlado:",
        "  → Coleção/abscesso não drenado? → cirurgia/intervenção",
        "  → Dispositivo infectado? → retirar/trocar",
      ],
      tone: "danger",
    });
  }

  // ── Card 2: COMPLICAÇÃO ESPECÍFICA — PAV
  if (complication.includes("pav") || complication.includes("pneumonia") || complication.includes("ventila")) {
    recommendations.push({
      title: "🫁 PAV — Pneumonia Associada à Ventilação",
      lines: [
        "Diagnóstico: febre nova + infiltrado novo no RX/TC + secreção traqueal purulenta + ↑ necessidade de O₂",
        "",
        "Coleta obrigatória:",
        "→ BAL ou mini-BAL (50mL SF colhido com cateter dirigido) OU aspirado traqueal quantitativo",
        "→ Hemoculturas (2 pares) antes de modificar ATB",
        "",
        "ATB empírico para PAV (confirmar com antibiograma):",
        icuDays >= 5
          ? "→ UTI ≥ 5 dias (PAV tardia — risco MDR):"
          : "→ PAV precoce (< 5 dias UTI, sem MDR):",
        icuDays >= 5
          ? "   Meropeném 1g IV 8/8h + Vancomicina (se MRSA) + considerar amicacina"
          : "   Ceftriaxona 2g IV 1x/dia OU amp-sulbactam 3g IV 6/6h",
        "",
        "Duração: 7 dias se boa resposta (não prolongar sem motivo)",
        "→ Reduzir FiO₂ / PEEP conforme melhora clínica e oxigenação",
      ],
      tone: "warning",
    });
  }

  // ── Card 3: COMPLICAÇÃO ESPECÍFICA — IVAS-CVC (bacteremia por cateter)
  if (complication.includes("ivas") || complication.includes("bacteremia") || complication.includes("cvc") || complication.includes("cateter venoso")) {
    recommendations.push({
      title: "🩸 IVAS-CVC — Bacteremia por Cateter",
      lines: [
        "Diagnóstico: febre + hemocultura positiva sem outro foco + CVC em uso",
        "",
        "Conduta imediata:",
        "→ Retirar CVC (SEMPRE em IVAS-CVC confirmada ou fortemente suspeita)",
        "→ Cultura de ponta do CVC (5 cm distal em meio sólido)",
        "→ Hemoculturas de 2 sítios (periférico + outro CVC se houver)",
        "→ Novo acesso em sítio diferente se necessário",
        "",
        "ATB empírico (até antibiograma):",
        "→ Gram-positivos: vancomicina 25–30 mg/kg ataque IV",
        "→ Gram-negativos: pip-tazo 4,5g IV 6/6h ou meropeném se MDR",
        "→ Candida (IVAS fúngica): micafungina 100mg/dia",
        "",
        "Ecocardiograma: indicado para S. aureus, Candida ou bacteremia persistente > 72h",
        "Duração: 7–14 dias (14d para S. aureus, Candida)",
      ],
      tone: "danger",
    });
  }

  // ── Card 4: COMPLICAÇÃO ESPECÍFICA — ITURSC
  if (complication.includes("itursc") || complication.includes("urin") || complication.includes("sonda vesical")) {
    recommendations.push({
      title: "🚽 ITURSC — Infecção Urinária por Cateter",
      lines: [
        "Diagnóstico: febre + urocultura ≥ 10³ UFC/mL com SVD em uso",
        "",
        "Conduta imediata:",
        "→ Trocar SVD e colher urocultura da nova sonda",
        "→ Hemoculturas se febre alta ou instabilidade",
        "",
        "ATB empírico (aguardar urocultura):",
        "→ Início simples: ceftriaxona 1–2g IV 1x/dia",
        "→ Risco MDR (UTI ≥ 5d ou ATB recente): pip-tazo 4,5g IV 6/6h",
        "→ Ajustar assim que antibiograma disponível",
        "",
        "Duração: 7 dias (14d se fungo, bacteremia associada)",
        "→ Retirar SVD o mais cedo possível (reduz recorrência)",
      ],
      tone: "warning",
    });
  }

  // ── Card 5: COMPLICAÇÃO ESPECÍFICA — Infecção abdominal
  if (complication.includes("abdominal") || complication.includes("peritonite") || complication.includes("abscesso")) {
    recommendations.push({
      title: "🫃 Infecção Intra-abdominal",
      lines: [
        "Conduta imediata:",
        "→ TC abdome/pelve com contraste para localizar coleção",
        "→ Drenagem percutânea (radiologia intervencionista) ou cirurgia se indicado",
        "→ Culturas intra-operatórias / material drenado",
        "",
        "ATB empírico (cobre gram-negativos + anaeróbios):",
        "→ Pip-tazo 4,5g IV 6/6h (comunitária ou hospitalar sem MDR)",
        "→ Meropeném 1g IV 8/8h se MDR ou falha anterior",
        "→ Adicionar fluconazol ou equinocandina se pós-operatório tardio ou Candida suspeita",
        "",
        "⚠️ ATB sozinho NÃO trata infecção abdominal drenável — controle de foco é obrigatório",
      ],
      tone: "warning",
    });
  }

  // ── Card 6: COMPLICAÇÃO ESPECÍFICA — Fungemia / candidemia
  if (complication.includes("fungi") || complication.includes("candida") || cultures.includes("candida") || cultures.includes("candidemia")) {
    recommendations.push({
      title: "🍄 Candidemia / Fungemia",
      lines: [
        "Conduta imediata:",
        "→ Iniciar equinocandina IMEDIATAMENTE (não aguardar especiação):",
        "   Micafungina 100mg IV 1x/dia OU Anidulafungina 200mg IV ataque → 100mg/dia",
        "→ Retirar CVC se possível (fonte mais comum de candidemia)",
        "→ Colher hemoculturas de controle a cada 24–48h (meta: negativas)",
        "→ Fundo de olho (descartar endoftalmite candidósica)",
        "→ Ecocardiograma (descartar endocardite fúngica)",
        "",
        "Duração: 14 dias após ÚLTIMA hemocultura negativa",
        "Stepdown VO (fluconazol) apenas após: estabilidade + C. albicans sensível + hemoculturas negativas",
      ],
      tone: "danger",
    });
  }

  // ── Card 7: ESCALAÇÃO ATB baseada em cultura
  const escalationSuggestion = getAutoSuggestedAntibioticEscalation();
  if (escalationSuggestion && (hasPoorResponse || cultures.trim())) {
    recommendations.push({
      title: "💊 Ajuste de ATB — Recomendação Automática",
      lines: [escalationSuggestion.value],
      tone:
        cultures.includes("kpc") || cultures.includes("acinetobacter") || cultures.includes("candida")
          ? "danger"
          : "warning",
    });
  }

  // ── Card 8: SUPORTE HEMODINÂMICO — choque refratário
  // SSC 2021: vasopressina e corticoterapia quando Nora ≥ 0,25 mcg/kg/min sem resposta adequada
  if (vasopressor.includes("0,25") || vasopressor.includes("0,5") || vasopressor.includes("refratário") || vasopressor.includes("refratario")) {
    const isHighDose = vasopressor.includes("0,5") || vasopressor.includes("refratário") || vasopressor.includes("refratario");
    recommendations.push({
      title: isHighDose ? "🔴 Choque Séptico Refratário" : "🟠 Choque Séptico — Escalada Vasopressora",
      lines: [
        isHighDose
          ? "Noradrenalina > 0,5 mcg/kg/min — choque vasoplégico refratário:"
          : "Noradrenalina ≥ 0,25 mcg/kg/min sem PAM ≥ 65 — escalar suporte (SSC 2021):",
        "→ Vasopressina 0,03 U/min IV fixo (adicionar para poupar noradrenalina — SSC 2021 forte)",
        "→ Hidrocortisona 200 mg/dia IV contínuo — indicar se choque persistente apesar de vasopressores (SSC 2021 ≥ 0,25 mcg/kg/min sem resposta)",
        ...(isHighDose ? [
          "→ Ecocardiograma point-of-care urgente:",
          "   - Excluir tamponamento, disfunção VD grave, hipo/hipervolemia",
          "   - Se disfunção VE: dobutamina 2,5–5 mcg/kg/min",
          "",
          "⚠️ Dose excepcional de noradrenalina (> 1–3 mcg/kg/min):",
          "   - Não existe dose máxima estabelecida (ICM 2024) — titular pelo efeito",
          "   - Acima de ~1 mcg/kg/min: saturação progressiva de receptores α1 reduz eficiência",
          "   - Estratégia multimodal obrigatória: vasopressina (se não iniciada) + hidrocortisona",
          "   - Considerar angiotensina II ou azul de metileno (choque vasoplegia refratária — uso excepcional com intensivista experiente)",
          "   - Risco crescente: isquemia digital/mesentérica, arritmias — monitorar continuamente",
        ] : []),
        "→ Meta PAM ≥ 65 mmHg (≥ 70–75 em HAS grave)",
        "→ Rever causa: foco não controlado? ATB inadequado? causa não-infecciosa?",
      ],
      tone: isHighDose ? "danger" : "warning",
    });
  } else if (map !== null && map < 65) {
    recommendations.push({
      title: "⚠️ PAM < 65 — Piora Hemodinâmica",
      lines: [
        `PAM atual: ${Math.round(map)} mmHg`,
        "→ Iniciar/escalonar noradrenalina",
        "→ Avaliar volemia: eco ou variação de pressão de pulso",
        "→ Ringer Lactato 250–500 mL se volume-responsivo e sem congestão (SSC 2021 — cristalóide balanceado)",
        "→ Confirmar CVC para vasopressor contínuo",
      ],
      tone: "danger",
    });
  }

  // ── Card 9: P/F ratio e manejo ventilatório
  const pao2 = parseFloat(session.assessment.pao2);
  const fio2Vent = parseFloat(session.assessment.ventilatorFio2) / 100;
  if (!isNaN(pao2) && !isNaN(fio2Vent) && fio2Vent > 0) {
    const pf = pao2 / fio2Vent;
    let pfTitle = "";
    let pfLines: string[] = [`Relação P/F atual: ${Math.round(pf)} mmHg`];
    let pfTone: "info" | "warning" | "danger" = "info";
    if (pf < 100) {
      pfTitle = "🫁 SDRA GRAVE (P/F < 100)";
      pfTone = "danger";
      pfLines.push(
        "→ Prona imediata ≥ 16h/dia (PROSEVA — reduz mortalidade em SDRA grave)",
        "→ PEEP alto conforme ARDSnet PEEP table (target driving pressure ≤ 15)",
        "→ Bloqueio neuromuscular 48h (cisatracúrio)",
        "→ Considerar ECMO VV em centro de referência",
      );
    } else if (pf < 200) {
      pfTitle = "🫁 SDRA MODERADA (P/F 100–200)";
      pfTone = "warning";
      pfLines.push(
        "→ VM protetora: VC 6 mL/kg PI, Pplatô ≤ 30, driving pressure ≤ 15",
        "→ PEEP moderado-alto (10–14 cmH₂O)",
        "→ Considerar prona se P/F < 150 apesar de PEEP otimizado",
      );
    } else if (pf < 300) {
      pfTitle = "🫁 SDRA LEVE / Hipoxemia (P/F 200–300)";
      pfTone = "warning";
      pfLines.push(
        "→ Otimizar PEEP mínimo eficaz",
        "→ Reduzir FiO₂ gradualmente (meta SpO₂ 92–96%)",
      );
    } else {
      pfTitle = "🫁 P/F Normal (≥ 300)";
      pfLines.push("→ Manter VM protetora e planejar desmame precoce");
    }
    recommendations.push({ title: pfTitle, lines: pfLines, tone: pfTone });
  }

  // ── Card 10: Desmame / extubação
  if (
    !vasopressor.includes("0,25") && !vasopressor.includes("0,5") && !vasopressor.includes("refrat") &&
    lactate !== null && lactate < 2 && map !== null && map >= 65
  ) {
    recommendations.push({
      title: "✅ Critérios de Desmame / Extubação",
      lines: [
        "Avaliar prontidão para SBT (Spontaneous Breathing Trial):",
        "→ Causa da IRpA revertida ou em melhora",
        "→ Hemodinâmica estável (PAM ≥ 65, vasopressor ≤ dose mínima)",
        "→ SpO₂ ≥ 92% com FiO₂ ≤ 40% e PEEP ≤ 8",
        "→ RASS 0 a −1, reflexo de tosse preservado",
        "→ Realizar PSV trial 30–120 min — se tolerado → extubação",
      ],
      tone: "info",
    });
  }

  return recommendations;
}

// ── Auto-sugestão: isolamento e swab retal ────────────────────────────────────
function getAutoSuggestedIsolation(): { isolation: string; swab: string; label: string } | null {
  const mdrRisk       = session.assessment.mdrRisk.toLowerCase();
  const careSetting   = session.assessment.careSetting.toLowerCase();
  const comorbidities = session.assessment.comorbidities.toLowerCase();
  const cultures      = session.assessment.currentCulturesResult.toLowerCase();
  const complication  = (session.assessment.icuComplication ?? "").toLowerCase();
  const suspectedSource = session.assessment.suspectedSource.toLowerCase();
  const atb           = session.assessment.currentAntibioticsRegimen.toLowerCase();
  const icuDays       = parseInt(session.assessment.icuAdmissionDays, 10) || 0;
  const isImmunocomp  = /neoplasia|imunossup|transplante|neutrop|hiv|quimio/i.test(session.assessment.comorbidities);

  // Culture-confirmed MDR organisms → contact isolation
  if (cultures.includes("kpc") || cultures.includes("carbapenemase") || cultures.includes("esbl") ||
      cultures.includes("acinetobacter") || cultures.includes("mrsa") || cultures.includes("vre")) {
    const organism = cultures.includes("kpc") || cultures.includes("carbapenemase") ? "KPC" :
                     cultures.includes("acinetobacter") ? "A. baumannii MDR" :
                     cultures.includes("mrsa") ? "MRSA" :
                     cultures.includes("vre") ? "VRE" : "ESBL";
    return {
      isolation: `Isolamento de contato — ${organism} confirmado`,
      swab: "Swab retal + swab nasal (rastreio de colonização e para mapa microbiológico da UTI)",
      label: `${organism} confirmado → isolamento de contato obrigatório`,
    };
  }

  // Candida / fungal → contact
  if (cultures.includes("candida") || cultures.includes("aspergillus")) {
    return {
      isolation: "Isolamento de contato — infecção fúngica (risco de disseminação ambiental e em imunossuprimidos)",
      swab: "Swab retal (rastreio de colonização por MDR bacteriano — frequente em candidemia)",
      label: "Candidemia/Aspergilose → contato + rastreio MDR",
    };
  }

  // Suspected/confirmed TB → airborne
  if (suspectedSource.includes("pulm") && /tb|tuberculose|bk|baar|mycobact/i.test(session.assessment.suspectedSource + session.assessment.historyPresentIllness)) {
    return {
      isolation: "Isolamento aéreo (airborne) — suspeita/confirmação de tuberculose pulmonar ativa",
      swab: "Swab retal não indicado para TB — coletar escarro induzido ou BAL para BAAR e cultura de micobactéria",
      label: "Suspeita TB → isolamento aéreo + quarto individual com pressão negativa",
    };
  }

  // Suspected meningococcal meningitis → droplet
  if (suspectedSource.includes("snc") || suspectedSource.includes("mening")) {
    return {
      isolation: "Isolamento de gotículas (droplet) — meningite/suspeita meningocócica · Manter por ≥ 24h após ATB",
      swab: "Swab retal não indicado aqui — considerar swab nasofaríngeo para N. meningitidis",
      label: "Suspeita de meningococcemia → isolamento de gotículas 24h",
    };
  }

  // High MDR risk (transfer from hospital, prior carbapenems, MDR history) → contact + swab
  const isHighMDR = mdrRisk.includes("alto") || mdrRisk.includes("alto") ||
    careSetting.includes("hospitalar") || careSetting.includes("longa permanência") ||
    icuDays >= 7 || atb.includes("carbapenêmico") || atb.includes("meropeném");

  if (isHighMDR) {
    return {
      isolation: "Isolamento de contato — alto risco de MDR (transferência hospitalar, uso prévio de carbapenêmico ou UTI ≥ 7 dias)",
      swab: "Swab retal colher AGORA — rastreio ativo de KPC, ESBL e VRE (admissão hospitalar ou piora com risco MDR)",
      label: "Alto risco MDR → isolamento de contato + swab retal",
    };
  }

  // Immunocompromised — evidence-based approach (2024 guidelines)
  if (isImmunocomp) {
    // Differentiate HSCT (still benefits from HEPA/positive pressure) vs. others
    const isHSCT = /transplante.*medula|hsct|tcth|tmo|células-tronco|stem cell/i.test(session.assessment.comorbidities + session.assessment.historyPresentIllness);
    if (isHSCT) {
      return {
        isolation: "Quarto individual com pressão positiva e filtro HEPA — HSCT alogênico / transplante de medula (recomendação mantida por IDSA/CDC/ECIL 2024 para prevenção de aspergilose invasiva durante neutropenia)",
        swab: "Swab retal + nasal indicados — rastreio de colonização por MDR na admissão e periodicamente",
        label: "HSCT/TMO — quarto HEPA + pressão positiva (evidência mantida)",
      };
    }
    // Other immunosuppressed (solid tumor chemo, HIV, solid organ transplant):
    // Strict reverse isolation (gowns+gloves+masks for all) NOT recommended by current guidelines
    // Evidence: multiple RCTs and Cochrane review showed NO benefit beyond standard precautions
    return {
      isolation: "Precauções padrão + quarto individual — imunossuprimido (neoplasia/quimioterapia/transplante sólido/HIV). ⚠️ Isolamento protetor reverso clássico (avental+luvas+máscara para toda equipe) foi descontinuado — NÃO é recomendado por IDSA/CDC/SHEA 2024 para não-HSCT (sem evidência de benefício)",
      swab: "Swab retal + nasal indicados na admissão — rastreio de MDR frequente em imunossuprimidos",
      label: "Imunossupressão (não-HSCT) → quarto individual + precauções padrão rigorosas",
    };
  }

  // Intermediate MDR risk
  if (mdrRisk.includes("intermedi") || careSetting.includes("ambulatório com contato") || icuDays >= 3) {
    return {
      isolation: "Precauções padrão — UTI. Avaliar necessidade de isolamento de contato conforme evolução microbiológica",
      swab: "Considerar swab retal na admissão UTI (protocolo PCIRAS) ou se transfer de outra instituição",
      label: "Risco MDR intermediário → avaliar swab retal na admissão",
    };
  }

  // ── Fallback por foco infeccioso (sepse comunitária baixo risco) ──────────
  const source = session.assessment.suspectedSource.toLowerCase();
  const complaint = session.assessment.chiefComplaint.toLowerCase();

  // Foco pulmonar → precauções de gotículas até excluir vírus respiratório
  if (/pulmon|pneumon/i.test(source) || /tosse|dispneia|expectoração/i.test(complaint)) {
    return {
      isolation: "Precauções de gotículas (máscara cirúrgica a < 1m) até excluir vírus respiratório (influenza, COVID-19, VSR). Após confirmação de etiologia bacteriana, precauções padrão são suficientes.",
      swab: "Swab retal não indicado — risco MDR baixo para sepse pulmonar comunitária. Coletar swab nasofaríngeo para painel viral respiratório se disponível.",
      label: "Foco pulmonar comunitário → gotículas até excluir vírus respiratório",
    };
  }

  // Foco urinário, abdominal, pele → precauções padrão
  if (/urin|abdominal|pele|partes moles/i.test(source)) {
    return {
      isolation: "Precauções padrão — higiene das mãos + EPI conforme procedimento (avental e luvas para contato com fluidos). Risco MDR baixo para sepse comunitária com este foco.",
      swab: "Swab retal não indicado no momento (sepse comunitária, baixo risco MDR). Reavaliar se houver uso de carbapenêmico ou internação prolongada.",
      label: "Foco não respiratório comunitário → precauções padrão",
    };
  }

  // Foco SNC → gotículas (meningocócica até excluir)
  if (/snc|mening/i.test(source)) {
    return {
      isolation: "Precauções de gotículas — manter por ≥ 24h após início do ATB (meningocócica até excluída). Quarto individual.",
      swab: "Swab retal não indicado para meningite — coletar swab nasofaríngeo para N. meningitidis se indicado.",
      label: "Suspeita meningite → gotículas 24h após ATB",
    };
  }

  // Sem foco definido → precauções padrão como mínimo
  return {
    isolation: "Precauções padrão enquanto foco infeccioso não identificado. Reavalie quando cultura/foco confirmado — escalone isolamento se MDR detectado.",
    swab: "Avaliar necessidade de swab retal após definição do contexto (internação hospitalar, uso de carbapenêmico ou MDR suspeito).",
    label: "Foco indefinido → precauções padrão + reavaliação após culturas",
  };
}

// ── Card de isolamento para painéis (emergência e UTI) ────────────────────────
function buildIsolationCard(): AuxiliaryPanelRecommendation | null {
  const suggestion = getAutoSuggestedIsolation();
  if (!suggestion) return null;

  const isAirborne   = suggestion.isolation.toLowerCase().includes("aéreo");
  const isDroplet    = suggestion.isolation.toLowerCase().includes("gotícula");
  const isHSCT      = suggestion.isolation.toLowerCase().includes("hepa") && suggestion.isolation.toLowerCase().includes("pressão positiva");
  const isImmunoStandard = suggestion.isolation.toLowerCase().includes("precauções padrão") && suggestion.isolation.toLowerCase().includes("imunossuprimido");
  const isContact    = suggestion.isolation.toLowerCase().includes("contato");

  let title = "🦠 Precauções de Isolamento";
  let tone: "info" | "warning" | "danger" = "warning";
  if (isAirborne)        { title = "🌬️ Isolamento Aéreo Indicado"; tone = "danger"; }
  else if (isDroplet)    { title = "💧 Isolamento de Gotículas Indicado"; tone = "danger"; }
  else if (isContact && suggestion.isolation.toLowerCase().includes("kpc")) { title = "⚠️ Isolamento de Contato — MDR Confirmado"; tone = "danger"; }
  else if (isHSCT)       { title = "🛡️ HSCT — Quarto HEPA + Pressão Positiva"; tone = "warning"; }
  else if (isImmunoStandard) { title = "🧪 Imunossuprimido — Precauções Padrão + Quarto Individual"; tone = "info"; }

  const lines: string[] = [
    `→ ${suggestion.isolation}`,
    "",
    "Medidas práticas:",
  ];

  if (isAirborne) {
    lines.push(
      "→ Quarto individual com pressão negativa (se disponível)",
      "→ Respirador N95/PFF2 para TODA a equipe que entrar no quarto",
      "→ Manter porta FECHADA o tempo todo",
      "→ Notificar CCIH/SCIH da instituição",
      "→ Transferir para quarto de isolamento o mais brevemente possível",
    );
  } else if (isDroplet) {
    lines.push(
      "→ Quarto individual ou coorte com pacientes semelhantes",
      "→ Máscara cirúrgica para equipe a < 1 metro do paciente",
      "→ Manter por ≥ 24h após início de ATB eficaz (meningococo)",
      "→ Visitantes: orientar uso de máscara e higiene das mãos",
    );
  } else if (isContact) {
    lines.push(
      "→ Quarto individual ou coorte de MDR",
      "→ Avental + luvas para TODO contato com paciente ou ambiente",
      "→ Higiene das mãos (SEMPRE): antes e após contato",
      "→ Equipamentos dedicados ao quarto (estetoscópio, esfigmomanômetro)",
      "→ Notificar CCIH/SCIH — registrar em prontuário",
      "→ Sinalização clara na porta do quarto",
    );
  } else if (isHSCT) {
    lines.push(
      "→ Quarto individual com pressão POSITIVA + filtro HEPA",
      "→ Precauções padrão para equipe (higiene das mãos rigorosa)",
      "⚠️ Avental/luvas/máscara para TODOS NÃO têm evidência adicional em HSCT",
      "→ Restrição de visitantes com infecção respiratória ativa",
      "→ Frutas/plantas NÃO permitidas (risco de Aspergillus/fungos)",
      "→ Rastreio periódico com swab para MDR",
    );
  } else if (isImmunoStandard) {
    lines.push(
      "→ Quarto individual (quando disponível)",
      "→ Higiene das mãos rigorosa para toda equipe",
      "⚠️ Isolamento protetor reverso clássico (avental+luvas+máscara para todos) DESCONTINUADO",
      "   Base: múltiplos ECRs e revisão Cochrane não demonstraram benefício em não-HSCT",
      "   Referência: IDSA / CDC / SHEA 2024 — não recomendam isolamento protetor para",
      "   quimioterapia convencional, transplante sólido ou HIV fora de neutropenia grave",
      "→ Visitantes com infecção ativa: restringir acesso",
    );
  } else {
    lines.push(
      "→ Precauções padrão: higiene das mãos, EPI conforme procedimento",
      "→ Reavaliar conforme resultado de culturas",
    );
  }

  lines.push("", `🧫 Swab retal: ${suggestion.swab}`);

  return { title, lines, tone };
}

function buildBundleStatusItems() {
  return [
    {
      id: "lactato",
      label: "Lactato",
      value: getBundleStatusLabel(session.bundle.lactato),
      currentStatus: session.bundle.lactato,
      helperText: shouldSuggestLactate()
        ? "Solicite lactato agora e considere redosagem se vier elevado."
        : "Solicitar conforme evolução clínica e necessidade de reavaliação.",
      options: [
        { id: "pendente", label: "Pendente", status: "pendente" as BundleStatus },
        { id: "solicitado", label: "Solicitado", status: "solicitado" as BundleStatus },
        { id: "realizado", label: "Realizado", status: "realizado" as BundleStatus },
      ],
    },
    {
      id: "culturas",
      label: "Culturas",
      value: getBundleStatusLabel(session.bundle.culturas),
      currentStatus: session.bundle.culturas,
      helperText: shouldSuggestCultures()
        ? "Colete culturas agora, antes do antimicrobiano, se isso não gerar atraso importante."
        : "Coletar quando houver indicação clínica e sem atrasar o tratamento.",
      options: [
        { id: "pendente", label: "Pendente", status: "pendente" as BundleStatus },
        { id: "solicitado", label: "Solicitado", status: "solicitado" as BundleStatus },
        { id: "realizado", label: "Realizado", status: "realizado" as BundleStatus },
      ],
    },
    {
      id: "antibiotico",
      label: "Antimicrobiano",
      value: getBundleStatusLabel(session.bundle.antibiotico),
      currentStatus: session.bundle.antibiotico,
      helperText: shouldSuggestAntibiotic()
        ? `${getAntimicrobialRecommendation().headline} Meta SSC 2021: imediato (choque) · 1h (sepse) · 3h (possível sepse sem choque).`
        : "Se a suspeita de sepse se confirmar, escolher esquema conforme foco, gravidade e protocolo local.",
      options: [
        { id: "pendente", label: "Pendente", status: "pendente" as BundleStatus },
        {
          id: "solicitado",
          label: "Solicitado",
          status: "solicitado" as BundleStatus,
        },
        {
          id: "realizado",
          label: "Realizado",
          status: "realizado" as BundleStatus,
        },
      ],
    },
    {
      id: "fluidos",
      label: "Ringer Lactato 30 mL/kg (bal.)",
      value: getBundleStatusLabel(session.bundle.fluidos),
      currentStatus: session.bundle.fluidos,
      helperText: shouldSuggestCrystalloid()
        ? `Faça Ringer Lactato 30 mL/kg (cristalóide balanceado — SSC 2021). ${getInitialCrystalloidVolumeLabel()}`
        : `${getInitialCrystalloidVolumeLabel()} Considerar se houver hipotensão ou hipoperfusão relevante.`,
      options: [
        { id: "pendente", label: "Pendente", status: "pendente" as BundleStatus },
        {
          id: "solicitado",
          label: "Solicitado",
          status: "solicitado" as BundleStatus,
        },
        {
          id: "realizado",
          label: "Realizado",
          status: "realizado" as BundleStatus,
        },
      ],
    },
    {
      id: "vasopressor",
      label: "Vasopressor",
      value: getBundleStatusLabel(session.bundle.vasopressor),
      currentStatus: session.bundle.vasopressor,
      helperText: shouldSuggestImmediateVasopressor()
        ? "Contexto de choque mais grave: considerar noradrenalina precocemente enquanto organiza a ressuscitação."
        : shouldSuggestVasopressor()
          ? "Inicie noradrenalina se a PAM seguir abaixo de 65 mmHg após ressuscitação volêmica."
          : "Neste momento, reservar vasopressor para hipotensão persistente após volume ou choque já evidente.",
      options: [
        { id: "pendente", label: "Pendente", status: "pendente" as BundleStatus },
        {
          id: "solicitado",
          label: "Solicitado",
          status: "solicitado" as BundleStatus,
        },
        {
          id: "realizado",
          label: "Realizado",
          status: "realizado" as BundleStatus,
        },
      ],
    },
  ];
}

function buildPatientAssessmentFields() {
  const map = getCalculatedMap();
  const mapHelper = map !== null
    ? `PAM calculada: ${Math.round(map)} mmHg${map < 65 ? " ⚠️ Abaixo da meta" : " ✓"}`
    : "PAM calculada automaticamente ao preencher PAS e PAD.";

  const bmiHelper = getCalculatedBmi() !== null
    ? `IMC: ${getBmiLabel()}`
    : "IMC calculado automaticamente ao preencher peso e altura.";

  return [
    // ─── IDENTIFICAÇÃO ──────────────────────────────────────────
    {
      id: "sex",
      section: "Identificação do paciente",
      label: "Sexo",
      value: session.assessment.sex,
      placeholder: "Ex.: feminino",
      helperText: "Sexo biológico — impacta cálculo de ClCr.",
      presets: [
        { label: "Feminino", value: "Feminino" },
        { label: "Masculino", value: "Masculino" },
      ],
    },
    {
      id: "age",
      section: "Identificação do paciente",
      label: "Idade (anos)",
      value: session.assessment.age,
      placeholder: "anos",
      keyboardType: "numeric" as const,
      helperText: "Usado no cálculo de ClCr (Cockcroft-Gault).",
      presets: [
        { label: "18", value: "18" },
        { label: "20", value: "20" },
        { label: "25", value: "25" },
        { label: "30", value: "30" },
        { label: "35", value: "35" },
        { label: "40", value: "40" },
        { label: "45", value: "45" },
        { label: "50", value: "50" },
        { label: "55", value: "55" },
        { label: "60", value: "60" },
        { label: "65", value: "65" },
        { label: "70", value: "70" },
        { label: "75", value: "75" },
        { label: "80", value: "80" },
      ],
    },
    {
      id: "weightKg",
      section: "Identificação do paciente",
      label: "Peso (kg)",
      value: session.assessment.weightKg,
      placeholder: "kg",
      keyboardType: "numeric" as const,
      helperText: "Cálculo de volume de cristalóide (30 mL/kg) e dose de medicamentos.",
      presets: [
        { label: "45", value: "45" },
        { label: "50", value: "50" },
        { label: "55", value: "55" },
        { label: "60", value: "60" },
        { label: "65", value: "65" },
        { label: "70", value: "70" },
        { label: "75", value: "75" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
      ],
    },
    {
      id: "heightCm",
      section: "Identificação do paciente",
      label: "Altura (cm)",
      value: session.assessment.heightCm,
      placeholder: "cm",
      keyboardType: "numeric" as const,
      helperText: bmiHelper,
      presets: [
        { label: "150", value: "150" },
        { label: "155", value: "155" },
        { label: "160", value: "160" },
        { label: "165", value: "165" },
        { label: "170", value: "170" },
        { label: "175", value: "175" },
        { label: "180", value: "180" },
        { label: "185", value: "185" },
        { label: "190", value: "190" },
      ],
    },

    // ─── APRESENTAÇÃO CLÍNICA ───────────────────────────────────
    {
      id: "arrivalTime",
      section: "Apresentação clínica",
      label: session.flowType === "uti_internado" ? "Hora da avaliação / piora" : "Hora de chegada",
      value: session.assessment.arrivalTime,
      placeholder: "Auto",
      helperText: session.flowType === "uti_internado"
        ? "Horário da avaliação atual ou início identificado da piora clínica."
        : "Preenchido automaticamente ao abrir o módulo.",
      presets: [
        { label: "Agora", value: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) },
        { label: "< 30 min", value: "< 30 min" },
        { label: "30–60 min", value: "30–60 min" },
        { label: "1–2h", value: "1–2h atrás" },
        { label: "> 2h", value: "> 2h atrás" },
      ],
    },
    {
      id: "symptomOnset",
      section: "Apresentação clínica",
      label: session.flowType === "uti_internado" ? "Início / piora dos sintomas" : "Início dos sintomas",
      value: session.assessment.symptomOnset,
      placeholder: session.flowType === "uti_internado" ? "Ex.: piora nas últimas 6h, desde ontem" : "Ex.: há 6 horas, ontem à noite",
      helperText: session.flowType === "uti_internado"
        ? "Quando iniciou a piora clínica atual ou o novo evento identificado."
        : "Tempo desde os primeiros sintomas.",
      fullWidth: true,
      presets: session.flowType === "uti_internado"
        ? [
            { label: "< 6h", value: "Piora nas últimas 6 horas" },
            { label: "6–12h", value: "Piora nas últimas 6–12 horas" },
            { label: "12–24h", value: "Piora nas últimas 12–24 horas" },
            { label: "> 24h", value: "Piora há mais de 24 horas" },
            { label: "Gradual (dias)", value: "Piora gradual ao longo de 2–5 dias" },
          ]
        : [
        { label: "< 6h", value: "< 6 horas" },
            { label: "6–24h", value: "6 a 24 horas" },
        { label: "> 24h", value: "> 24 horas" },
        { label: "Dias", value: "Há alguns dias" },
      ],
    },
    {
      id: "chiefComplaint",
      section: "Apresentação clínica",
      label: session.flowType === "uti_internado" ? "Motivo da avaliação atual" : "Queixa principal",
      value: session.assessment.chiefComplaint,
      placeholder: session.flowType === "uti_internado" ? "Ex.: piora hemodinâmica, febre nova, aumento de vasopressor" : "Ex.: febre, hipotensão, dispneia",
      helperText: session.flowType === "uti_internado"
        ? "Evento ou achado que motivou esta avaliação clínica."
        : "Motivo principal da procura ao atendimento.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: session.flowType === "uti_internado"
        ? [
            { label: "Piora hemodinâmica / mais vasopressor", value: "Piora hemodinâmica / necessidade de escalonamento de vasopressor" },
            { label: "Febre nova / pico febril em internado", value: "Febre nova ou pico febril em paciente internado" },
            { label: "Piora ventilatória / mais FiO₂ ou PEEP", value: "Piora ventilatória / aumento de FiO₂ ou PEEP" },
            { label: "Rebaixamento do nível de consciência", value: "Rebaixamento do nível de consciência" },
            { label: "Oligúria / piora renal aguda", value: "Oligúria ou piora da função renal" },
            { label: "Suspeita de nova infecção hospitalar", value: "Suspeita de nova infecção ou infecção não controlada" },
            { label: "Piora laboratorial / aumento do SOFA", value: "Piora laboratorial com aumento do SOFA" },
          ]
        : [
            { label: "Febre / calafrios / prostração", value: "Febre, calafrios e prostração" },
            { label: "Hipotensão / mal perfundido", value: "Hipotensão ou sinais de hipoperfusão" },
            { label: "Dispneia / desconforto respiratório", value: "Dispneia ou desconforto respiratório" },
            { label: "Confusão / delirium / rebaixamento", value: "Confusão mental, delirium ou rebaixamento" },
            { label: "Disúria / dor lombar / sintomas urinários", value: "Disúria, dor lombar ou sintomas urinários" },
            { label: "Dor abdominal / vômitos / distensão", value: "Dor abdominal, vômitos ou distensão" },
            { label: "Tosse / secreção / foco pulmonar", value: "Tosse, secreção e suspeita de foco pulmonar" },
            { label: "Lesão cutânea / celulite / partes moles", value: "Lesão cutânea ou infecção de pele/partes moles" },
          ],
    },
    {
      id: "historyPresentIllness",
      section: "Apresentação clínica",
      label: session.flowType === "uti_internado" ? "Contexto clínico atual" : "HDA — cenário clínico",
      value: session.assessment.historyPresentIllness,
      placeholder: session.flowType === "uti_internado" ? "Selecionar opções ou descrever" : "Selecionar opções ou complementar",
      helperText: session.flowType === "uti_internado"
        ? "Descrever o contexto da piora ou novo evento clínico para orientar as condutas."
        : "Selecione os elementos que descrevem melhor o cenário clínico.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: session.flowType === "uti_internado"
        ? [
            { label: "Sepse em tratamento sem resposta adequada", value: "Piora de sepse em tratamento na UTI — sem resposta ao ATB atual" },
            { label: "Novo episódio infeccioso em paciente internado", value: "Novo episódio séptico em paciente previamente estável" },
            { label: "Bacteremia relacionada a CVC", value: "Bacteremia provavelmente relacionada a cateter venoso central" },
            { label: "PAV / pneumonia associada à ventilação", value: "Suspeita de pneumonia associada à ventilação mecânica (PAV)" },
            { label: "ITU relacionada a sonda vesical", value: "ITU relacionada a sonda vesical (ITURSC)" },
            { label: "Infecção de ferida / sítio cirúrgico", value: "Infecção de sítio cirúrgico / ferida operatória" },
            { label: "Imunossuprimido com piora infecciosa", value: "Piora clínica em paciente imunossuprimido — ampliar cobertura" },
            { label: "Choque séptico refratário", value: "Choque séptico refratário com aumento de vasopressores" },
            { label: "Sepse com SDRA / disfunção multiorgânica", value: "SDRA associada a sepse — VM protetora e manejo multiorgânico" },
          ]
        : [
            { label: "Pulmonar / febre + tosse + dispneia", value: "Febre, tosse e dispneia progressiva" },
            { label: "Urinário / febre + disúria + lombalgia", value: "Febre com disúria e dor lombar" },
            { label: "Abdominal / dor + febre + sepse digestiva", value: "Febre e dor abdominal difusa" },
            { label: "Choque infeccioso / febre + hipotensão", value: "Hipotensão, febre e deterioração do estado geral" },
            { label: "Imunossuprimido sem foco claro", value: "Febre em imunossuprimido sem foco claro" },
            { label: "Pós-operatório com suspeita infecciosa", value: "Febre no pós-operatório" },
            { label: "Idoso com delirium e possível infecção", value: "Febre e confusão mental em idoso" },
            { label: "Pele / partes moles", value: "Febre com lesões em pele/partes moles" },
            { label: "SNC / meningite possível", value: "Febre, cefaleia e rigidez de nuca" },
            { label: "Evolução rápida em poucas horas", value: "Evolução rápida em poucas horas" },
            { label: "Evolução ao longo de dias", value: "Evolução há 2–5 dias" },
            { label: "Internação recente / risco MDR", value: "Internação hospitalar recente (<90 dias)" },
          ],
    },

    // ─── ANTECEDENTES ────────────────────────────────────────────
    {
      id: "comorbidities",
      section: "Antecedentes",
      label: "Comorbidades",
      value: session.assessment.comorbidities,
      placeholder: "Ex.: DM, HAS, DRC, cirrose",
      helperText: "Impacta classificação de risco e escolha do ATB.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "DM", value: "DM" },
        { label: "HAS", value: "HAS" },
        { label: "DRC", value: "DRC" },
        { label: "Cirrose", value: "Cirrose" },
        { label: "Neoplasia", value: "Neoplasia" },
        { label: "Imunossup.", value: "Imunossupressão" },
        { label: "ICC", value: "ICC" },
        { label: "DPOC", value: "DPOC" },
        { label: "HIV", value: "HIV" },
      ],
    },
    {
      id: "currentMedications",
      section: "Antecedentes",
      label: "Medicações de uso contínuo",
      value: session.assessment.currentMedications,
      placeholder: "Toque para selecionar",
      helperText: "Selecione as classes mais relevantes para o atendimento.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Nenhuma relevante", value: "Sem medicações relevantes" },
        { label: "ATB prévio", value: "Antibiótico prévio (<30 dias)" },
        { label: "Corticóide", value: "Corticóide sistêmico" },
        { label: "Imunossupressor", value: "Imunossupressor" },
        { label: "Quimioterapia", value: "Quimioterapia ativa" },
        { label: "Anticoagulante", value: "Anticoagulante" },
        { label: "Diurético", value: "Diurético" },
        { label: "IECA/BRA", value: "IECA/BRA" },
        { label: "Insulina", value: "Insulina" },
        { label: "AINE", value: "AINE" },
        { label: "Hipoglicemiante VO", value: "Hipoglicemiante oral" },
        { label: "Antifúngico", value: "Antifúngico em uso" },
      ],
    },
    {
      id: "allergies",
      section: "Antecedentes",
      label: "Alergias",
      value: session.assessment.allergies,
      placeholder: "Ex.: penicilina, dipirona, látex",
      helperText: "⚠️ Alergias a antimicrobianos impactam diretamente a escolha do ATB.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Nenhuma", value: "Sem alergias conhecidas" },
        { label: "Penicilina", value: "Penicilina" },
        { label: "Cefalosporina", value: "Cefalosporina" },
        { label: "Sulfa", value: "Sulfonamida" },
        { label: "Quinolona", value: "Quinolona" },
        { label: "Dipirona", value: "Dipirona" },
        { label: "AINEs", value: "AINEs" },
      ],
    },

    // ─── SINAIS VITAIS ───────────────────────────────────────────
    {
      id: "systolicPressure",
      section: "Sinais vitais",
      label: "PAS (mmHg)",
      value: session.assessment.systolicPressure,
      placeholder: "mmHg",
      keyboardType: "numeric" as const,
      helperText: "PAS ≤100 mmHg = 1 ponto qSOFA.",
      presets: [
        { label: "60", value: "60" },
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "130", value: "130" },
        { label: "140", value: "140" },
        { label: "150", value: "150" },
        { label: "160", value: "160" },
        { label: "180", value: "180" },
        { label: "200", value: "200" },
      ],
    },
    {
      id: "diastolicPressure",
      section: "Sinais vitais",
      label: "PAD (mmHg)",
      value: session.assessment.diastolicPressure,
      placeholder: "mmHg",
      keyboardType: "numeric" as const,
      helperText: mapHelper,
      presets: [
        { label: "30", value: "30" },
        { label: "40", value: "40" },
        { label: "50", value: "50" },
        { label: "60", value: "60" },
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
      ],
    },
    {
      id: "heartRate",
      section: "Sinais vitais",
      label: "FC (bpm)",
      value: session.assessment.heartRate,
      placeholder: "bpm",
      keyboardType: "numeric" as const,
      helperText: "Taquicardia ≥90 bpm é critério SIRS.",
      presets: [
        { label: "60", value: "60" },
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "130", value: "130" },
        { label: "140", value: "140" },
        { label: "150", value: "150" },
        { label: "160", value: "160" },
        { label: "170", value: "170" },
        { label: "180", value: "180" },
      ],
    },
    {
      id: "respiratoryRate",
      section: "Sinais vitais",
      label: "FR (irpm)",
      value: session.assessment.respiratoryRate,
      placeholder: "irpm",
      keyboardType: "numeric" as const,
      helperText: "FR ≥22 irpm = 1 ponto qSOFA.",
      presets: [
        { label: "14", value: "14" },
        { label: "16", value: "16" },
        { label: "18", value: "18" },
        { label: "20", value: "20" },
        { label: "22", value: "22" },
        { label: "24", value: "24" },
        { label: "28", value: "28" },
        { label: "32", value: "32" },
        { label: "36", value: "36" },
        { label: "40", value: "40" },
      ],
    },
    {
      id: "temperature",
      section: "Sinais vitais",
      label: "Temperatura (°C)",
      value: session.assessment.temperature,
      placeholder: "°C",
      keyboardType: "numeric" as const,
      helperText: "Febre ≥38°C ou hipotermia <36°C são critérios SIRS.",
      presets: [
        { label: "34", value: "34,0" },
        { label: "35", value: "35,0" },
        { label: "36", value: "36,0" },
        { label: "37", value: "37,0" },
        { label: "37,5", value: "37,5" },
        { label: "38", value: "38,0" },
        { label: "38,5", value: "38,5" },
        { label: "39", value: "39,0" },
        { label: "39,5", value: "39,5" },
        { label: "40", value: "40,0" },
        { label: "40,5", value: "40,5" },
      ],
    },
    {
      id: "oxygenSaturation",
      section: "Sinais vitais",
      label: "SpO2 (%)",
      value: session.assessment.oxygenSaturation,
      placeholder: "%",
      keyboardType: "numeric" as const,
      helperText: "Em ar ambiente ou com suporte de O2 (especificar).",
      presets: [
        { label: "80%", value: "80" },
        { label: "84%", value: "84" },
        { label: "88%", value: "88" },
        { label: "90%", value: "90" },
        { label: "92%", value: "92" },
        { label: "94%", value: "94" },
        { label: "96%", value: "96" },
        { label: "98%", value: "98" },
        { label: "99%", value: "99" },
      ],
    },
    {
      id: "gcs",
      section: "Sinais vitais",
      label: session.flowType === "uti_internado" ? "Glasgow (GCS) — pré-sedação ou atual" : "Glasgow (GCS)",
      value: session.assessment.gcs,
      placeholder: "3–15",
      keyboardType: "numeric" as const,
      helperText: session.flowType === "uti_internado"
        ? "Para pacientes sedados/intubados: registrar GCS antes da sedação ou o valor antes da IOT. Use a escala RASS na aba UTI para sedados."
        : "GCS <15 contribui para ponto qSOFA de alteração de consciência.",
      presets: [
        { label: "15", value: "15" },
        { label: "14", value: "14" },
        { label: "13", value: "13" },
        { label: "12", value: "12" },
        { label: "11", value: "11" },
        { label: "10", value: "10" },
        { label: "9", value: "9" },
        { label: "8", value: "8" },
        { label: "7", value: "7" },
        { label: "6", value: "6" },
        { label: "3", value: "3" },
        ...(session.flowType === "uti_internado"
          ? [{ label: "Inaval. (sedado)", value: "1" }]
          : []),
      ],
    },
    // "Estado mental / Consciência" removido: o GCS já captura o nível de
    // consciência de forma quantitativa (GCS <15 = 1 ponto qSOFA).
    // O campo mentalStatus permanece no assessment para sessões anteriores.
    {
      id: "capillaryRefill",
      section: "Exame físico",
      label: "Enchimento capilar (TEC)",
      value: session.assessment.capillaryRefill,
      placeholder: "Ex.: 2s, > 3s",
      helperText: "TEC >2s = sinal de hipoperfusão.",
      presets: [
        { label: "≤2s (normal)", value: "Normal (≤2s)" },
        { label: "2–3s", value: "Lento (2–3s)" },
        { label: "> 3s", value: "Prolongado (>3s)" },
      ],
    },
    {
      id: "urineOutput",
      section: "Exame físico",
      label: "Diurese / Débito urinário",
      value: session.assessment.urineOutput,
      placeholder: "Ex.: preservada, oligúria, < 0,5 mL/kg/h",
      helperText: "Oligúria <0,5 mL/kg/h = disfunção renal por hipoperfusão.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Preservada", value: "Preservada" },
        { label: "Reduzida", value: "Reduzida" },
        { label: "Oligúria", value: "Oligúria (<0,5 mL/kg/h)" },
        { label: "Anúria", value: "Anúria" },
      ],
    },

    // ─── EXAME FÍSICO ─────────────────────────────────────────────
    {
      id: "cardiacAuscultation",
      section: "Exame físico",
      label: "Ausculta cardíaca (AC)",
      value: session.assessment.cardiacAuscultation,
      placeholder: "Ex.: RCR 2T, sem sopros",
      helperText: "Ritmo, bulhas, sopros, galope.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "RCR 2T", value: "RCR 2T, sem sopros" },
        { label: "Taquicardia", value: "Taquicardia" },
        { label: "Sopro", value: "Sopro sistólico" },
        { label: "Galope", value: "Galope (B3/B4)" },
        { label: "Arritmia", value: "Arritmia" },
      ],
    },
    {
      id: "pulmonaryAuscultation",
      section: "Exame físico",
      label: "Ausculta pulmonar (AP)",
      value: session.assessment.pulmonaryAuscultation,
      placeholder: "Ex.: MV presente, creptos bases",
      helperText: "Murmúrio vesicular, ruídos adventícios, simetria.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Normal", value: "MV presente bilateralmente, sem ruídos" },
        { label: "Creptos", value: "Crepitações em bases" },
        { label: "Sibilos", value: "Sibilos difusos" },
        { label: "Redução MV", value: "Redução de MV" },
        { label: "Macicez", value: "Macicez à percussão" },
      ],
    },
    {
      id: "respiratoryPattern",
      section: "Exame físico",
      label: "Padrão respiratório",
      value: session.assessment.respiratoryPattern,
      placeholder: "Ex.: eupneico, taquipneico, esforço resp.",
      helperText: "Padrão ventilatório observado.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Eupneico", value: "Eupneico" },
        { label: "Taquipneico", value: "Taquipneico" },
        { label: "Esforço resp.", value: "Esforço respiratório" },
        { label: "Musculatura acess.", value: "Uso de musculatura acessória" },
        { label: "Tiragem", value: "Tiragem intercostal" },
      ],
    },
    {
      id: "abdominalExam",
      section: "Exame físico",
      label: "Abdome",
      value: session.assessment.abdominalExam,
      placeholder: "Ex.: flácido, ruídos presentes, sem irritação peritoneal",
      helperText: "Palpação, percussão, ausculta, sinais de irritação peritoneal.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Normal", value: "Flácido, RHA presentes, indolor" },
        { label: "Dor difusa", value: "Dor difusa à palpação" },
        { label: "Def. muscular", value: "Defesa muscular" },
        { label: "Irrit. peritoneal", value: "Irritação peritoneal" },
        { label: "Hepatoesplenomeg.", value: "Hepatoesplenomegalia" },
        { label: "Distendido", value: "Distendido" },
      ],
    },
    {
      id: "extremities",
      section: "Exame físico",
      label: "Extremidades",
      value: session.assessment.extremities,
      placeholder: "Ex.: frias, moteadas, edema 2+",
      helperText: "Temperatura, coloração, edemas, pulsos.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Normais", value: "Quentes, sem edema" },
        { label: "Frias", value: "Frias" },
        { label: "Moteadas", value: "Moteadas" },
        { label: "Cianose", value: "Cianose periférica" },
        { label: "Edema 1+", value: "Edema 1+" },
        { label: "Edema 2+", value: "Edema 2+" },
        { label: "Edema 3+", value: "Edema 3+" },
      ],
    },
    {
      id: "hydrationStatus",
      section: "Exame físico",
      label: "Estado de hidratação",
      value: session.assessment.hydrationStatus,
      placeholder: "Ex.: hidratado, desidratado 2+/4+",
      helperText:
        "Leve (1-2+): mucosas levemente secas, sede, urina concentrada, déficit ~3-5% do peso. " +
        "Moderado (2-3+): mucosas secas, turgor reduzido, olhos fundos, oligúria, déficit ~6-9%. " +
        "Grave (3-4+): prega cutânea, extremidades frias, taquicardia/hipotensão, oligúria/anúria, sonolento — déficit ≥10%.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Hidratado", value: "Hidratado" },
        { label: "Desid. leve", value: "Desidratado leve (1-2+/4+)" },
        { label: "Desid. mod.", value: "Desidratado moderado (2-3+/4+)" },
        { label: "Desid. grave", value: "Desidratado grave (3-4+/4+)" },
      ],
    },
    {
      id: "skinMucosae",
      section: "Exame físico",
      label: "Pele e mucosas",
      value: session.assessment.skinMucosae,
      placeholder: "Ex.: coradas, hidratadas, icterícia leve",
      helperText: "Coloração, turgor, presença de lesões, icterícia, petéquias.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Normal", value: "Coradas, hidratadas" },
        { label: "Pálidas", value: "Pálidas" },
        { label: "Ictéricas", value: "Ictéricas" },
        { label: "Cianóticas", value: "Cianóticas" },
        { label: "Petéquias", value: "Petéquias" },
        { label: "Rubor", value: "Hiperemiadas (rubor)" },
      ],
    },

    // ─── HIPÓTESES DIAGNÓSTICAS E FOCO ───────────────────────────
    {
      id: "suspectedSource",
      section: "Hipótese diagnóstica",
      label: "Foco infeccioso suspeito",
      value: session.assessment.suspectedSource,
      placeholder: "Ex.: pulmonar, urinário, abdominal",
      helperText: "Direciona a escolha empírica do antibiótico. O sistema sugere automaticamente com base nos dados clínicos preenchidos.",
      fullWidth: true,
      ...((() => {
        const s = buildSuspectedSourceSuggestion();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Pulmonar / pneumonia", value: "Pulmonar" },
        { label: "Urinário / pielonefrite / urossepse", value: "Urinário" },
        { label: "Abdominal / biliar / perfurativo", value: "Abdominal" },
        { label: "Pele / partes moles / fasceíte / celulite", value: "Pele / partes moles" },
        { label: "SNC / meningite / meningoencefalite", value: "SNC / meninges" },
        { label: "Cateter / corrente sanguínea / dispositivo vascular", value: "Dispositivo vascular" },
        { label: "Endocardite / bacteremia persistente", value: "Endocardite suspeita" },
        { label: "Osteoarticular / artrite séptica", value: "Osteoarticular" },
        { label: "Indefinido / foco ainda não localizado", value: "Indefinido" },
      ],
    },
    {
      id: "diagnosticHypothesis",
      section: "Hipótese diagnóstica",
      label: "Classificação diagnóstica (Sepsis-3)",
      value: session.assessment.diagnosticHypothesis,
      placeholder: "Classificação automática pelo sistema",
      helperText: "Gerado automaticamente pelos critérios Sepsis-3 (qSOFA, PAM, lactato). Confirme ou corrija.",
      fullWidth: true,
      ...((() => {
        const s = getSuggestedMainDiagnosis();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Choque séptico", value: "Choque séptico" },
        { label: "Sepse", value: "Sepse" },
        { label: "Sepse possível — alto risco", value: "Sepse possível — alto risco" },
        { label: "Infecção suspeita sem critérios", value: "Infecção suspeita sem critérios de sepse" },
        ...(session.flowType === "uti_internado" ? [
          { label: "Piora séptica em UTI", value: "Piora de sepse/choque séptico em UTI" },
          { label: "Falha terapêutica", value: "Falha terapêutica ao antibiótico atual" },
          { label: "Re-infecção em UTI", value: "Suspeita de re-infecção / nova infecção hospitalar" },
          { label: "PAV", value: "Pneumonia associada à ventilação mecânica (PAV)" },
          { label: "ITURSC", value: "ITU relacionada a cateter (ITURSC)" },
          { label: "Bacteremia por CVC", value: "Bacteremia relacionada a cateter venoso central" },
        ] : []),
      ],
    },

    // ─── EXAMES COMPLEMENTARES ───────────────────────────────────
    {
      id: "requestedExams",
      section: "Exames complementares",
      label: "Exames recomendados / solicitados",
      value: session.assessment.requestedExams,
      placeholder: "O sistema sugere automaticamente com base no contexto clínico",
      helperText: "Sugestão gerada pelo sistema conforme diagnóstico e foco suspeito (SSC 2021). Aceite a sugestão ou ajuste manualmente.",
      fullWidth: true,
      ...((() => {
        const r = buildRecommendedExams();
        return r ? { suggestedValue: r.value, suggestedLabel: r.label } : {};
      })()),
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Hemograma", value: "Hemograma" },
        { label: "PCR/PCT", value: "PCR/Procalcitonina" },
        { label: "Lactato", value: "Lactato arterial" },
        { label: "Hemocultura", value: "Hemoculturas (2 pares)" },
        { label: "Urocultura", value: "Urocultura + Urina I" },
        { label: "Creatinina/Ureia", value: "Função renal (Cr, Ureia)" },
        { label: "Bilirrubinas", value: "TGO/TGP/Bilirrubinas" },
        { label: "Coagulação", value: "TP, TTPA, INR" },
        { label: "Gasometria", value: "Gasometria arterial" },
        { label: "RX Tórax", value: "RX Tórax" },
        { label: "ECG", value: "ECG" },
        { label: "USG Abdominal", value: "USG Abdominal" },
        { label: "TC Tórax", value: "TC Tórax" },
        { label: "TC Abdome", value: "TC Abdome/Pelve" },
      ],
    },
    {
      id: "lactateValue",
      section: "Exames complementares",
      label: "Lactato",
      value: session.assessment.lactateValue,
      unit: session.assessment.lactateUnit,
      unitOptions: [
        { label: "mmol/L", value: "mmol/L" },
        { label: "mg/dL", value: "mg/dL" },
      ],
      placeholder: "Ex.: 3,8",
      keyboardType: "numeric" as const,
      helperText: "Lactato ≥2 mmol/L = critério de sepse. ≥4 = ressuscitação agressiva.",
      presets: getLactatePresets(session.assessment.lactateUnit),
    },
    {
      id: "creatinineValue",
      section: "Exames complementares",
      label: "Creatinina",
      value: session.assessment.creatinineValue,
      unit: session.assessment.creatinineUnit,
      unitOptions: [
        { label: "mg/dL", value: "mg/dL" },
        { label: "µmol/L", value: "µmol/L" },
      ],
      placeholder: "Ex.: 2,1",
      keyboardType: "numeric" as const,
      helperText: "Elevação de creatinina ≥0,3 mg/dL ou >1,5x basal = lesão renal aguda.",
      presets: getCreatininePresets(session.assessment.creatinineUnit),
    },

    // ─── SOFA (Sepsis-3) — exames laboratoriais adicionais ────────────────────────
    {
      id: "platelets",
      section: "Exames complementares",
      label: "Plaquetas (×10³/µL)",
      value: session.assessment.platelets,
      placeholder: "Ex.: 120",
      keyboardType: "numeric" as const,
      helperText: "SOFA hemostasia — limiares: <50 (grau 4) / <80 (3) / <100 (2) / <150 (1).",
      presets: [
        { label: "≥150", value: "180" },
        { label: "120", value: "120" },
        { label: "100", value: "100" },
        { label: "80", value: "80" },
        { label: "60", value: "60" },
        { label: "50", value: "50" },
        { label: "30", value: "30" },
        { label: "< 20", value: "15" },
      ],
    },
    {
      id: "bilirubinTotal",
      section: "Exames complementares",
      label: "Bilirrubina total (mg/dL)",
      value: session.assessment.bilirubinTotal,
      placeholder: "Ex.: 2,5",
      keyboardType: "numeric" as const,
      helperText: "SOFA fígado — limiares: ≥12 (grau 4) / ≥6 (3) / ≥3 (2) / ≥1,2 (1).",
      presets: [
        { label: "< 1,2", value: "0.8" },
        { label: "1,5", value: "1.5" },
        { label: "2,0", value: "2.0" },
        { label: "3,0", value: "3.0" },
        { label: "4,5", value: "4.5" },
        { label: "6,0", value: "6.0" },
        { label: "8,0", value: "8.0" },
        { label: "≥12", value: "12" },
      ],
    },
    {
      id: "pao2",
      section: "Exames complementares",
      label: "PaO₂ — gasometria (mmHg)",
      value: session.assessment.pao2,
      placeholder: "Ex.: 72 (opcional — usar SpO₂ se sem gasometria)",
      keyboardType: "numeric" as const,
      helperText: "SOFA respiratório — Se não disponível, o sistema usa SpO₂/FiO₂ como substituto.",
      presets: [
        { label: "≥ 80", value: "90" },
        { label: "72", value: "72" },
        { label: "65", value: "65" },
        { label: "55", value: "55" },
        { label: "45", value: "45" },
        { label: "38", value: "38" },
        { label: "< 30", value: "28" },
      ],
    },
    {
      id: "urineOutputMlh",
      section: "Exames complementares",
      label: "Diurese (mL/h)",
      value: session.assessment.urineOutputMlh,
      placeholder: "Ex.: 25",
      keyboardType: "numeric" as const,
      helperText: "SOFA rim — <20 mL/h (grau 3) / <10 mL/h (grau 4). Complementa creatinina.",
      presets: [
        { label: "≥0,5 mL/kg/h", value: "40" },
        { label: "30 mL/h", value: "30" },
        { label: "20 mL/h", value: "20" },
        { label: "15 mL/h", value: "15" },
        { label: "10 mL/h", value: "10" },
        { label: "< 10", value: "5" },
        { label: "Anúria", value: "0" },
      ],
    },

    // ─── Hemograma ────────────────────────────────────────────────────────────
    {
      id: "wbc",
      section: "Exames complementares",
      label: "Leucócitos (×10³/µL)",
      value: session.assessment.wbc,
      placeholder: "Ex.: 14,5",
      keyboardType: "numeric" as const,
      helperText: "SIRS: >12.000 ou <4.000 ou >10% bastões. Leucopenia em sepse grave indica mau prognóstico.",
      presets: [
        { label: "< 4.000", value: "3.5" },
        { label: "Normal", value: "8.0" },
        { label: "12.000", value: "12" },
        { label: "15.000", value: "15" },
        { label: "20.000", value: "20" },
        { label: "> 30.000", value: "32" },
      ],
    },
    {
      id: "hemoglobin",
      section: "Exames complementares",
      label: "Hemoglobina (g/dL)",
      value: session.assessment.hemoglobin,
      placeholder: "Ex.: 9,5",
      keyboardType: "numeric" as const,
      helperText: "Anemia agrava disfunção orgânica. Meta em sepse: Hb ≥7 g/dL (≥9 se isquemia ou SCA).",
      presets: [
        { label: "< 7", value: "6.5" },
        { label: "7–8", value: "7.5" },
        { label: "9–10", value: "9.5" },
        { label: "Normal", value: "13" },
      ],
    },

    // ─── Biomarcadores de inflamação ──────────────────────────────────────────
    {
      id: "crp",
      section: "Exames complementares",
      label: "PCR — Proteína C-Reativa (mg/L)",
      value: session.assessment.crp,
      placeholder: "Ex.: 120",
      keyboardType: "numeric" as const,
      helperText: "PCR >10 mg/L sugere processo inflamatório/infeccioso. Útil para monitorar resposta ao ATB (queda esperada em 48–72h).",
      presets: [
        { label: "< 10 (normal)", value: "5" },
        { label: "10–50", value: "30" },
        { label: "50–100", value: "80" },
        { label: "100–200", value: "150" },
        { label: "> 200", value: "250" },
      ],
    },
    {
      id: "procalcitonin",
      section: "Exames complementares",
      label: "Procalcitonina — PCT (ng/mL)",
      value: session.assessment.procalcitonin,
      placeholder: "Ex.: 2,4",
      keyboardType: "numeric" as const,
      helperText: "PCT <0,25: infecção bacteriana improvável. 0,25–0,5: possível. >0,5: provável. >2: alta probabilidade sepse bacteriana. >10: choque séptico. Usar seriada para guiar de-escalada.",
      presets: [
        { label: "< 0,25", value: "0.1" },
        { label: "0,5", value: "0.5" },
        { label: "2,0", value: "2.0" },
        { label: "5,0", value: "5.0" },
        { label: "> 10", value: "12" },
      ],
    },

    // ─── Coagulação ───────────────────────────────────────────────────────────
    {
      id: "inr",
      section: "Exames complementares",
      label: "INR",
      value: session.assessment.inr,
      placeholder: "Ex.: 1,8",
      keyboardType: "numeric" as const,
      helperText: "INR >1,5 sugere coagulopatia / disfunção hepática. INR >2,5 com plaquetas baixas: rastrear CIVD.",
      presets: [
        { label: "Normal (<1,2)", value: "1.1" },
        { label: "1,5", value: "1.5" },
        { label: "2,0", value: "2.0" },
        { label: "2,5", value: "2.5" },
        { label: "> 3,0", value: "3.2" },
      ],
    },

    // ─── Ionograma ────────────────────────────────────────────────────────────
    {
      id: "sodium",
      section: "Exames complementares",
      label: "Sódio (mEq/L)",
      value: session.assessment.sodium,
      placeholder: "Ex.: 132",
      keyboardType: "numeric" as const,
      helperText: "Hiponatremia (<135) frequente na sepse. Hipernatremia (>145) indica desidratação severa ou DI.",
      presets: [
        { label: "< 130", value: "128" },
        { label: "132", value: "132" },
        { label: "Normal (135–145)", value: "138" },
        { label: "148", value: "148" },
        { label: "> 150", value: "152" },
      ],
    },
    {
      id: "potassium",
      section: "Exames complementares",
      label: "Potássio (mEq/L)",
      value: session.assessment.potassium,
      placeholder: "Ex.: 5,8",
      keyboardType: "numeric" as const,
      helperText: "Hipercalemia (>5,5) = risco arrítmico — tratar antes de IOT se possível. Hipocalemia (<3,5) = repor.",
      presets: [
        { label: "< 3,0", value: "2.8" },
        { label: "3,5", value: "3.5" },
        { label: "Normal (3,5–5,0)", value: "4.2" },
        { label: "5,5", value: "5.5" },
        { label: "> 6,0", value: "6.3" },
      ],
    },

    // ─── Gasometria arterial ──────────────────────────────────────────────────
    {
      id: "ph",
      section: "Exames complementares",
      label: "pH — gasometria",
      value: session.assessment.ph,
      placeholder: "Ex.: 7,28",
      keyboardType: "numeric" as const,
      helperText: "pH <7,35 = acidose. pH <7,20 na sepse: emergência metabólica — ressuscitação agressiva e avaliar VM.",
      presets: [
        { label: "< 7,10", value: "7.08" },
        { label: "7,20", value: "7.20" },
        { label: "7,28", value: "7.28" },
        { label: "7,35 (limítrofe)", value: "7.35" },
        { label: "Normal (7,40)", value: "7.40" },
      ],
    },
    {
      id: "paco2",
      section: "Exames complementares",
      label: "PaCO₂ (mmHg)",
      value: session.assessment.paco2,
      placeholder: "Ex.: 28",
      keyboardType: "numeric" as const,
      helperText: "PaCO₂ baixo (<35) indica hiperventilação compensatória. PaCO₂ alto (>45) com acidose = insuficiência respiratória.",
      presets: [
        { label: "< 25", value: "22" },
        { label: "28", value: "28" },
        { label: "35 (normal baixo)", value: "35" },
        { label: "Normal (40)", value: "40" },
        { label: "> 50", value: "52" },
      ],
    },
    {
      id: "hco3",
      section: "Exames complementares",
      label: "HCO₃ (mEq/L)",
      value: session.assessment.hco3,
      placeholder: "Ex.: 16",
      keyboardType: "numeric" as const,
      helperText: "HCO₃ <18 = acidose metabólica. HCO₃ <15 indica comprometimento grave da reserva tampão.",
      presets: [
        { label: "< 12", value: "10" },
        { label: "16", value: "16" },
        { label: "18", value: "18" },
        { label: "22 (normal)", value: "22" },
        { label: "> 26", value: "28" },
      ],
    },
    {
      id: "baseExcess",
      section: "Exames complementares",
      label: "BE — Excesso de Base (mEq/L)",
      value: session.assessment.baseExcess,
      placeholder: "Ex.: −10",
      keyboardType: "numeric" as const,
      helperText: "BE < −2: acidose metabólica. BE < −10: grave. Monitorar melhora como resposta à ressuscitação.",
      presets: [
        { label: "< −15", value: "-16" },
        { label: "−10", value: "-10" },
        { label: "−5", value: "-5" },
        { label: "Normal (0 ± 2)", value: "0" },
      ],
    },

    // ─── Marcadores cardíacos ─────────────────────────────────────────────────
    {
      id: "troponin",
      section: "Exames complementares",
      label: "Troponina (ng/mL ou múltiplo do LSN)",
      value: session.assessment.troponin,
      placeholder: "Ex.: 0,08 ou 3× LSN",
      keyboardType: "decimal-pad" as const,
      helperText: "Elevação em sepse indica lesão miocárdica associada (não necessariamente SCA). Associada a pior prognóstico. Repetir em 3–6h se suspeita de SCA.",
      presets: [
        { label: "Normal", value: "Negativa" },
        { label: "Limite", value: "Limítrofe" },
        { label: "Elevada (1–3× LSN)", value: "Elevada (1–3× LSN)" },
        { label: "Muito elevada (>3× LSN)", value: "Muito elevada (>3× LSN)" },
      ],
    },
    {
      id: "bnp",
      section: "Exames complementares",
      label: "BNP / NT-proBNP (pg/mL)",
      value: session.assessment.bnp,
      placeholder: "Ex.: BNP 450 ou NT-proBNP 1200",
      keyboardType: "decimal-pad" as const,
      helperText: "BNP >100 ou NT-proBNP >300: disfunção ventricular possível. Elevado em sepse por sobrecarga volêmica ou cardiomiopatia séptica.",
      presets: [
        { label: "Normal BNP (<100)", value: "< 100" },
        { label: "BNP 100–400", value: "200" },
        { label: "BNP >400", value: "500" },
        { label: "NT-proBNP >1000", value: "NT-proBNP > 1000" },
      ],
    },

    // ─── ANTIMICROBIANO — Contexto (sempre antes do seletor) ─────────────
    {
      id: "careSetting",
      section: "Antimicrobiano",
      label: "Contexto de aquisição",
      value: session.assessment.careSetting,
      placeholder: "Auto-calculado",
      helperText: "Define espectro do ATB empírico: comunitário → cobertura padrão; hospitalar/UTI → cobertura ampliada.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedCareSetting();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Comunitário / sem contato recente com sistema de saúde", value: "Comunitário" },
        { label: "Assistência à saúde / hemodiálise / curativos / institucionalizado", value: "Assistência à saúde" },
        { label: "Hospitalar / após internação atual", value: "Hospitalar" },
        { label: "UTI / ambiente crítico com maior risco de MDR", value: "UTI" },
      ],
    },
    {
      id: "betaLactamAllergy",
      section: "Antimicrobiano",
      label: "Alergia a beta-lactâmico",
      value: session.assessment.betaLactamAllergy,
      placeholder: "Derivado de Alergias",
      helperText: "⚠️ Auto-detectado das alergias registradas. Confirme ou corrija.",
      ...((() => {
        const s = getAutoSuggestedBetaLactamAllergy();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Não", value: "Não" },
        { label: "Sim", value: "Sim" },
        { label: "Suspeita", value: "Suspeita (não confirmada)" },
      ],
    },
    {
      id: "mdrRisk",
      section: "Antimicrobiano",
      label: "Risco de MDR (multirresistência bacteriana)",
      value: session.assessment.mdrRisk,
      placeholder: "Auto-calculado",
      helperText: "Fatores: internação recente (<90 dias) · ATB prévio (<30 dias) · diálise · imunossupressão · UTI.",
      ...((() => {
        const s = getAutoSuggestedMdrRisk();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Baixo", value: "Baixo" },
        { label: "Alto", value: "Alto" },
      ],
    },
    {
      id: "mrsaRisk",
      section: "Antimicrobiano",
      label: "Risco de MRSA (S. aureus resistente à meticilina)",
      value: session.assessment.mrsaRisk,
      placeholder: "Auto-calculado",
      helperText: "Fatores: colonização prévia · internações frequentes · UTI · diálise · imunossupressão.",
      ...((() => {
        const s = getAutoSuggestedMrsaRisk();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Não", value: "Não" },
        { label: "Sim", value: "Sim" },
      ],
    },
    {
      id: "dialysisMode",
      section: "Antimicrobiano",
      label: "Terapia renal substitutiva",
      value: session.assessment.dialysisMode,
      placeholder: "Ex.: não",
      helperText: "Ajuste automático de dose de ATB e volume.",
      presets: [
        { label: "Não", value: "Não" },
        { label: "HD", value: "Hemodiálise" },
        { label: "CRRT", value: "CRRT" },
        { label: "CAPD", value: "CAPD" },
      ],
    },
    // ─── ATB SELETOR — vem depois do contexto (recomendação automática exibida entre contexto e este campo) ──
    {
      id: "antibioticDetails",
      section: "Antimicrobiano",
      label: "ATB recomendado / registrado",
      value: session.assessment.antibioticDetails,
      placeholder: "Sugestão gerada automaticamente com base no foco e contexto clínico",
      helperText: "O sistema sugere o esquema com doses ajustadas ao contexto. Aceite ou ajuste conforme protocolo local.",
      fullWidth: true,
      ...((() => {
        const rec = getAntimicrobialRecommendation();
        const drugsLine = rec.regimen.drugs
          .map((d) => `${d.name} ${d.dose} ${d.interval}`)
          .join(" + ");
        return {
          suggestedValue: drugsLine,
          suggestedLabel: `${rec.focusLabel}: ${rec.regimenTitle}`,
        };
      })()),
      presetMode: "toggle_token" as const,
      presets: [
        // Cobertura ampla / foco desconhecido
        { label: "Pip-Taz 4,5g IV 8/8h", value: "Piperacilina-tazobactam 4,5 g IV 8/8h" },
        { label: "Meropeném 1g IV 8/8h", value: "Meropeném 1 g IV 8/8h" },
        { label: "Ertapeném 1g IV 1x/dia", value: "Ertapeném 1 g IV 1x/dia" },
        // Foco pulmonar
        { label: "Amox-Clav + Azitro", value: "Amoxicilina-clavulanato 2,2 g IV 8/8h + Azitromicina 500 mg VO/IV 1x/dia" },
        { label: "Ceftriaxona 2g IV + Azitro", value: "Ceftriaxona 2 g IV 1x/dia + Azitromicina 500 mg 1x/dia" },
        { label: "Levoflox 750mg IV 1x/dia", value: "Levofloxacino 750 mg IV 1x/dia (alergia beta-lactâmico)" },
        // Foco urinário
        { label: "Ceftriaxona 2g IV 1x/dia", value: "Ceftriaxona 2 g IV 1x/dia" },
        { label: "Ciproflox 400mg IV 12/12h", value: "Ciprofloxacino 400 mg IV 12/12h" },
        // Foco abdominal
        { label: "Pip-Taz 4,5g + Metronidazol", value: "Piperacilina-tazobactam 4,5 g IV 8/8h + Metronidazol 500 mg IV 8/8h" },
        // MRSA
        { label: "Vancomicina 25mg/kg IV", value: "Vancomicina 25 mg/kg IV dose de ataque" },
        // Fúngico
        { label: "Micafungina 100mg IV", value: "Micafungina 100 mg IV 1x/dia" },
        { label: "Anid. 200mg IV 1x/dia", value: "Anidulafungina 200 mg IV 1x/dia (ataque)" },
      ],
    },
    {
      id: "oxygenTherapy",
      section: "Estabilização",
      label: "Oxigenoterapia",
      value: session.assessment.oxygenTherapy,
      placeholder: "Selecionar modo de O₂",
      helperText: getIntubationAlertLabel() ?? "Meta SpO₂ 94–98%.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      ...((() => {
        const s = getAutoSuggestedOxygenTherapy();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Sem O₂ no momento / ar ambiente", value: "Sem suporte de O₂ no momento" },
        { label: "Cateter nasal 2–4 L/min / hipoxemia leve", value: "O₂ cateter nasal 2–4 L/min" },
        { label: "Máscara simples 5–8 L/min / necessidade moderada", value: "O₂ máscara simples 5–8 L/min" },
        { label: "Máscara Venturi / FiO₂ mais controlada", value: "O₂ máscara Venturi FiO₂ 40%" },
        { label: "Máscara com reservatório 10–15 L/min / grave", value: "O₂ máscara com reservatório 10–15 L/min" },
        { label: "VNI / CPAP-BiPAP / esforço respiratório", value: "Ventilação não invasiva (VNI)" },
        { label: "IOT + VM / falência respiratória ou rebaixamento", value: "Intubação orotraqueal + Ventilação mecânica" },
      ],
    },
    {
      id: "fluidResuscitation",
      section: "Estabilização",
      label: "Ressuscitação volêmica",
      value: session.assessment.fluidResuscitation,
      placeholder: "Selecionar estratégia",
      helperText: getFluidVolumeHint(),
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedFluidResuscitation();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "500 mL bolus", value: "Ringer Lactato 500 mL em bolus — reavaliar" },
        { label: "250–500 mL fracionado", value: "Cristalóide balanceado 250–500 mL em bolus fracionados com reavaliação frequente" },
        { label: `${getFluidVolumeLabel()} (30 mL/kg)`, value: `Ringer Lactato ${getFluidVolumeLabel()} (30 mL/kg) em 30 min — SSC 2021` },
        { label: "Restritivo", value: "Reposição volêmica restritiva — sem sinais de hipoperfusão" },
        { label: "Sem volume agora", value: "Sem necessidade de volume no momento" },
      ],
    },
    {
      id: "vascularAccess",
      section: "Estabilização",
      label: "Acesso vascular",
      value: session.assessment.vascularAccess,
      placeholder: "Selecionar acessos",
      helperText: "Calibre mínimo ≥ 18G para infusão rápida.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      ...((() => {
        const s = getAutoSuggestedVascularAccess();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "AVP 18G", value: "Acesso venoso periférico 18G" },
        { label: "2× AVP calibroso", value: "2 acessos venosos periféricos calibrosos" },
        { label: "CVC jugular int.", value: "Cateter venoso central — jugular interna" },
        { label: "CVC subclávia", value: "Cateter venoso central — subclávia" },
        { label: "CVC femoral", value: "Cateter venoso central — femoral" },
        { label: "Cat. arterial radial", value: "Cateter arterial radial (PA invasiva contínua)" },
      ],
    },
    {
      id: "vasopressorUse",
      section: "Estabilização",
      label: "Drogas vasoativas",
      value: session.assessment.vasopressorUse,
      placeholder: "Selecionar vasopressor",
      helperText: getVasopressorAlertLabel() ?? "Indicar se PAM < 65 mmHg após volume.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      ...((() => {
        const s = getAutoSuggestedVasopressor();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Sem vasopressor", value: "Sem vasopressor necessário no momento" },
        { label: "Noradrenalina", value: "Noradrenalina 0,1 mcg/kg/min — titular até PAM ≥ 65" },
        { label: "Vasopressina", value: "Vasopressina 0,03 U/min (adjuvante à Nora)" },
        { label: "Dobutamina", value: "Dobutamina 2,5 mcg/kg/min (baixo débito / disfunção miocárdica)" },
        { label: "Dopamina", value: "Dopamina (alternativa se bradicardia)" },
      ],
    },
    {
      id: "intubationDecision",
      section: "Estabilização",
      label: "Decisão ventilatória / IOT",
      value: session.assessment.intubationDecision,
      placeholder: "Selecionar conduta",
      helperText: getIntubationAlertLabel() ?? "Indicar se GCS ≤ 8, SpO₂ < 90% ou FR ≥ 35.",
      ...((() => {
        const s = getAutoSuggestedIntubation();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Sem indicação agora", value: "Sem indicação de IOT no momento" },
        { label: "VNI de prova", value: "VNI de prova — reavaliar em 30–60 min" },
        { label: "IOT programado", value: "IOT programado — aguardar recurso/equipe" },
        { label: "IOT imediato", value: "Intubação orotraqueal imediata (SRI)" },
        { label: "VM protetora", value: "VM protetora: VC 6 mL/kg peso ideal · PEEP 5–8" },
      ],
    },
    {
      id: "urinaryCatheter",
      section: "Estabilização",
      label: "Sondagem vesical (SVD)",
      value: session.assessment.urinaryCatheter,
      placeholder: "Selecionar conduta",
      helperText: "Controle de diurese. Meta: ≥ 0,5 mL/kg/h.",
      ...((() => {
        const s = getAutoSuggestedUrinaryCatheter();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Instalar SVD", value: "Cateter vesical de demora — controle de diurese horária" },
        { label: "Não necessário", value: "Sem SVD — controle por outros meios" },
        { label: "Dificuldade técnica", value: "SVD tentada — dificuldade técnica — reavaliar" },
      ],
    },
    {
      id: "clinicalMonitoring",
      section: "Estabilização",
      label: "Monitorização",
      value: session.assessment.clinicalMonitoring,
      placeholder: "Selecionar itens",
      helperText: "Selecione todos os itens de monitorização ativos.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      ...((() => {
        const s = getAutoSuggestedMonitoring();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "ECG contínuo", value: "ECG contínuo" },
        { label: "SpO₂ contínua", value: "Oximetria de pulso contínua" },
        { label: "PANI 15 min", value: "PANI a cada 15 min" },
        { label: "PA invasiva", value: "Pressão arterial invasiva (PAI)" },
        { label: "Temp. seriada", value: "Temperatura seriada (2/2h)" },
        { label: "Diurese horária", value: "Diurese horária (meta ≥ 0,5 mL/kg/h)" },
        { label: "Glicemia capilar", value: "Glicemia capilar (meta 140–180 mg/dL)" },
        { label: "Lactato seriado", value: "Lactato seriado em 2h (meta: ↓ ≥ 10%)" },
        { label: "Balanço hídrico", value: "Balanço hídrico horário" },
      ],
    },
    {
      id: "stabilizationNotes",
      section: "Estabilização",
      label: "Observações / outras medidas",
      value: session.assessment.stabilizationNotes,
      placeholder: "Outras intervenções ou observações importantes...",
      helperText: "Registrar medidas não previstas acima.",
      fullWidth: true,
    },

    // ─── CONDUTAS E PLANO TERAPÊUTICO ────────────────────────────────────
    {
      id: "additionalMeasures",
      section: "Condutas e plano terapêutico",
      label: "Outras condutas recomendadas",
      value: session.assessment.additionalMeasures,
      placeholder: "Condutas sugeridas automaticamente — toque para revisar",
      helperText: "Gerado pelo sistema com base no quadro clínico. Aceite, edite ou complemente.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      ...((() => {
        const s = getAutoSuggestedAdditionalMeasures();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Controle glicêmico", value: "Controle glicêmico (meta 140–180 mg/dL)" },
        { label: "Profilaxia TVP", value: "Profilaxia de TVP: enoxaparina 40 mg SC 1x/dia" },
        { label: "Protetor gástrico", value: "Proteção gástrica: pantoprazol 40 mg IV 1x/dia" },
        { label: "Cabeceira 30–45°", value: "Cabeceira elevada 30–45°" },
        { label: "Hidrocortisona", value: "Hidrocortisona 200 mg/dia IV contínuo (choque refratário)" },
        { label: "Nutrição enteral", value: "Nutrição enteral precoce em 24–48h pós-estabilização" },
        { label: "Controle de foco", value: "Controle de foco — avaliar drenagem/desbridamento" },
        { label: "Reavaliação ATB 48h", value: "Descalonamento de ATB em 48–72h conforme culturas" },
        { label: "Lactato 2h", value: "Remensurar lactato em 2h — meta ↓ ≥ 10%" },
        { label: "Consulta UTI", value: "Comunicar UTI / time de resposta rápida" },
        { label: "Reavaliação 1h", value: "Reavaliação clínica em 1h" },
      ],
    },
    {
      id: "patientDestination",
      section: "Condutas e plano terapêutico",
      label: "Destino do paciente",
      value: session.assessment.patientDestination,
      placeholder: "Definir destino baseado na gravidade",
      helperText: "Recomendação automática baseada em SOFA (Sepsis-3), qSOFA, PAM e lactato.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedPatientDestination();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "UTI imediato", value: "Internação imediata em UTI" },
        { label: "UTI / semi-UTI", value: "Internação em UTI ou semi-UTI" },
        { label: "Enfermaria", value: "Internação em enfermaria com reavaliação em 4–6h" },
        { label: "Observação + alta", value: "Observação 6–12h + alta com ATB VO se sem critérios de internação" },
        { label: "Alta programada", value: "Alta hospitalar com ATB oral e retorno em 48h" },
      ],
    },
    {
      id: "isolationPrecautions",
      section: "Condutas e plano terapêutico",
      label: "Precauções de isolamento",
      value: session.assessment.isolationPrecautions,
      placeholder: "Tipo de isolamento indicado para este paciente",
      helperText: "Definir isolamento protege a equipe, outros pacientes e o próprio paciente.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedIsolation();
        return s ? { suggestedValue: s.isolation, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Precauções padrão", value: "Precauções padrão — higiene das mãos + EPI conforme procedimento" },
        { label: "Isolamento de contato", value: "Isolamento de contato — avental + luvas + quarto individual" },
        { label: "Gotículas (droplet)", value: "Isolamento de gotículas — máscara cirúrgica a < 1m + quarto individual" },
        { label: "Aéreo (airborne)", value: "Isolamento aéreo — N95/PFF2 + quarto pressão negativa + porta fechada" },
        { label: "Protetor — HSCT (HEPA + P+)", value: "Quarto HEPA + pressão positiva — HSCT/TMO com neutropenia (recomendação mantida)" },
        { label: "Padrão — imunossuprimido", value: "Precauções padrão + quarto individual — imunossuprimido não-HSCT (isolamento reverso descontinuado)" },
        { label: "Contato + gotículas", value: "Isolamento de contato + gotículas (COVID-19 ou vírus respiratório + MDR)" },
      ],
    },
    {
      id: "rectalSwabOrdered",
      section: "Condutas e plano terapêutico",
      label: "Swab retal para rastreio de MDR",
      value: session.assessment.rectalSwabOrdered,
      placeholder: "Status do swab retal",
      helperText: "Indicado em: admissão UTI, transfer de outra instituição, risco MDR alto, uso prévio de carbapenêmico.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedIsolation();
        return s ? { suggestedValue: s.swab, suggestedLabel: `Swab retal: ${s.label}` } : {};
      })()),
      presets: [
        { label: "Sim — coletado agora", value: "Swab retal coletado nesta admissão / avaliação" },
        { label: "Sim — coletado na admissão", value: "Swab retal coletado na admissão (protocolo PCIRAS)" },
        { label: "Pendente — solicitar", value: "Swab retal indicado — solicitar coleta" },
        { label: "Não indicado", value: "Swab retal não indicado no momento (baixo risco MDR)" },
        { label: "Já realizado (negativo)", value: "Swab retal previamente realizado — resultado negativo" },
        { label: "Já realizado (positivo MDR)", value: "Swab retal positivo para MDR — precauções de contato vigentes" },
      ],
    },
    {
      id: "otherMeasures",
      section: "Condutas e plano terapêutico",
      label: "Anotações / condutas livres",
      value: session.assessment.otherMeasures,
      placeholder: "Condutas adicionais ou observações não contempladas acima...",
      helperText: "Campo livre para registrar qualquer conduta ou nota complementar.",
      fullWidth: true,
    },

    // ─── UTI — 1. TRIAGEM: PACIENTE NOVO OU EM PIORA? ───────────────────────
    {
      id: "icuScenario",
      section: "UTI — Triagem do Atendimento",
      label: "Situação atual do paciente",
      value: session.assessment.icuScenario,
      placeholder: "Selecionar a situação que melhor descreve o caso",
      helperText: "⚠️ Este módulo UTI é para pacientes JÁ EM TRATAMENTO com piora clínica. Se o paciente está chegando agora → use o fluxo Primeiro Atendimento.",
      fullWidth: true,
      presets: [
        { label: "⚠️ Novo na UTI — usar 1º Atend.", value: "Novo na UTI — usar o fluxo Primeiro Atendimento para atendimento inicial" },
        { label: "Em tratamento — piora hemodin.", value: "Já em tratamento — piora hemodinâmica (choque, ↑ vasopressor)" },
        { label: "Em tratamento — piora ventilatória", value: "Já em tratamento — piora ventilatória (↑ FiO₂, ↑ PEEP, hipoxemia)" },
        { label: "Em tratamento — piora renal", value: "Já em tratamento — piora renal (oligúria, ↑ creatinina)" },
        { label: "Em tratamento — febre + piora lab.", value: "Já em tratamento — febre nova ou piora laboratorial (SOFA ↑)" },
        { label: "Em tratamento — piora neuro.", value: "Já em tratamento — piora neurológica (rebaixamento, agitação)" },
        { label: "Em tratamento — piora multissist.", value: "Já em tratamento — deterioração multissistêmica" },
        { label: "Pós-estabilização — reavaliação", value: "Pós-estabilização — reavaliação de resposta ao tratamento" },
      ],
    },
    {
      id: "icuAdmissionDays",
      section: "UTI — Triagem do Atendimento",
      label: "Dias de internação na UTI",
      value: session.assessment.icuAdmissionDays,
      placeholder: "Ex.: 5",
      keyboardType: "numeric" as const,
      helperText: "≥ 5 dias = risco elevado de MDR. ≥ 14 dias = alto risco MDR + Candida + MRSA.",
      presets: [
        { label: "1–2 dias", value: "2" }, { label: "3 dias", value: "3" },
        { label: "5 dias", value: "5" }, { label: "7 dias", value: "7" },
        { label: "10 dias", value: "10" }, { label: "14 dias", value: "14" },
        { label: "> 14 dias", value: "21" },
      ],
    },
    {
      id: "sofaTrend",
      section: "UTI — Triagem do Atendimento",
      label: "Tendência do SOFA vs. 24–48h atrás",
      value: session.assessment.sofaTrend,
      placeholder: "Comparar SOFA atual com avaliação anterior",
      helperText: "↑ ≥ 2 pts em 24–48h = nova disfunção orgânica → mudança de conduta urgente.",
      presets: [
        { label: "SOFA melhorando (↓)", value: "SOFA em queda — resposta clínica positiva" },
        { label: "SOFA estável", value: "SOFA estável — sem melhora nem piora significativa" },
        { label: "SOFA ↑ 1–2 pts", value: "SOFA aumentou 1–2 pts — atenção, reavaliação necessária" },
        { label: "SOFA ↑ ≥ 2 pts (urgente)", value: "SOFA aumentou ≥ 2 pts em 24h → revisar conduta urgente" },
        { label: "SOFA piora rápida", value: "Piora rápida do SOFA — nova disfunção orgânica emergindo" },
      ],
    },

    // ─── UTI — 2. QUAL É A COMPLICAÇÃO? ──────────────────────────────────────
    {
      id: "icuComplication",
      section: "UTI — Foco da Piora",
      label: "Complicação infecciosa suspeita",
      value: session.assessment.icuComplication,
      placeholder: "Identificar o foco responsável pela piora",
      helperText: "Definir a complicação orienta a coleta de culturas, troca de dispositivos e o ajuste do ATB.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "PAV (pneumonia VM)", value: "PAV — Pneumonia associada à ventilação mecânica" },
        { label: "IVAS-CVC (bacteremia CVC)", value: "IVAS-CVC — Bacteremia relacionada a cateter venoso central" },
        { label: "ITURSC (ITU cateter)", value: "ITURSC — Infecção urinária relacionada a sonda vesical" },
        { label: "Infecção abdominal", value: "Infecção intra-abdominal / peritonite secundária" },
        { label: "Infecção de ferida / sítio cirúrgico", value: "Infecção de sítio cirúrgico / ferida operatória" },
        { label: "Fungemia / candidemia", value: "Fungemia / candidemia — indicar equinocandina" },
        { label: "Endocardite", value: "Endocardite bacteriana — ecocardiograma urgente" },
        { label: "Meningite / SNC", value: "Meningite / infecção do SNC" },
        { label: "Pele / partes moles", value: "Infecção de pele e partes moles / escaras infectadas" },
        { label: "Causa não infecciosa", value: "Causa não infecciosa (TEP, TRALI, febre por fármaco, DRESS)" },
        { label: "Foco indefinido", value: "Foco indefinido — busca ativa em andamento" },
      ],
    },
    {
      id: "invasiveDevices",
      section: "UTI — Foco da Piora",
      label: "Dispositivos invasivos em uso",
      value: session.assessment.invasiveDevices,
      placeholder: "Selecionar dispositivos presentes + tempo estimado de uso",
      helperText: "CVC > 7 dias e SVD > 5 dias = principais focos potenciais de IVAS e ITURSC. Avaliar troca.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "CVC < 7 dias", value: "CVC < 7 dias" },
        { label: "CVC ≥ 7 dias (↑ risco IVAS)", value: "CVC ≥ 7 dias — considerar troca / avaliar IVAS-CVC" },
        { label: "TOT (VM)", value: "TOT — ventilação mecânica invasiva" },
        { label: "Traqueostomia", value: "Traqueostomia em uso" },
        { label: "SVD < 5 dias", value: "SVD < 5 dias" },
        { label: "SVD ≥ 5 dias (↑ risco ITURSC)", value: "SVD ≥ 5 dias — considerar troca / avaliar ITURSC" },
        { label: "Cateter arterial", value: "Cateter arterial (PA invasiva)" },
        { label: "Dreno / drenagem abdominal", value: "Dreno torácico ou drenagem abdominal" },
        { label: "Cateter CRRT/HD", value: "Cateter de diálise (CRRT/HD)" },
        { label: "SNE/SNG", value: "Sonda nasoenteral / nasogástrica" },
      ],
    },
    {
      id: "newCulturesOrdered",
      section: "UTI — Foco da Piora",
      label: "Novas culturas coletadas ANTES de mudar ATB?",
      value: session.assessment.newCulturesOrdered,
      placeholder: "Culturas de reavaliação — coletar antes de qualquer mudança",
      helperText: "Regra obrigatória: coletar culturas ANTES de escalonar ou trocar ATB.",
      fullWidth: true,
      presets: [
        { label: "Sim — hemoculturas (2 pares)", value: "Sim — 2 pares de hemoculturas colhidos antes de modificar ATB" },
        { label: "Sim — BAL / aspirado traqueal", value: "Sim — BAL ou aspirado traqueal colhido (suspeita PAV)" },
        { label: "Sim — urocultura", value: "Sim — urocultura colhida com nova SVD (ITURSC)" },
        { label: "Sim — cultura ponta de CVC", value: "Sim — ponta de CVC colhida após retirada (suspeita IVAS-CVC)" },
        { label: "Sim — cultura de secreção / ferida", value: "Sim — cultura de secreção ou sítio cirúrgico" },
        { label: "Sim — múltiplos sítios", value: "Sim — culturas de múltiplos sítios colhidas" },
        { label: "Aguardando resultado anterior", value: "Culturas anteriores ainda pendentes — aguardar resultado" },
        { label: "Não coletado — urgência clínica", value: "ATB modificado sem nova cultura — urgência clínica (registrar justificativa)" },
      ],
    },
    {
      id: "currentCulturesResult",
      section: "UTI — Foco da Piora",
      label: "Resultado de culturas disponível",
      value: session.assessment.currentCulturesResult,
      placeholder: "Resultado ou status atual — orientará o ATB definitivo",
      helperText: "Cultura positiva → direcionar ATB. Negativa após 72h com melhora → descalonar.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Aguardando resultado", value: "Culturas em processamento — aguardando resultado" },
        { label: "Negativo 72h (descalonar)", value: "Hemoculturas negativas após 72h — considerar descalonamento se melhora clínica" },
        { label: "S. aureus — MRSA", value: "MRSA confirmado — ajustar vancomicina (AUC/MIC 400–600)" },
        { label: "S. aureus — MSSA", value: "MSSA confirmada — descalonar para oxacilina 2g IV 4/4h" },
        { label: "Gram − (aguardar antibiograma)", value: "Bacilo gram-negativo — aguardar antibiograma completo" },
        { label: "Pseudomonas aeruginosa", value: "Pseudomonas aeruginosa — ajustar conforme antibiograma" },
        { label: "ESBL confirmada", value: "ESBL confirmada — manter ou iniciar carbapenêmico" },
        { label: "KPC / carbapenemase", value: "KPC confirmada → ceftazidima-avibactam 2,5g IV 8/8h" },
        { label: "Candida sp.", value: "Candidemia — iniciar micafungina 100mg IV/dia ou anidulafungina" },
        { label: "Acinetobacter baumannii MDR", value: "A. baumannii MDR → polimixina B ou ampicilina-sulbactam em doses altas" },
        { label: "Aspirado traqueal positivo (PAV)", value: "Aspirado traqueal com crescimento — direcionar para agente isolado" },
      ],
    },

    // ─── UTI — 3. ANTIBIOTICOTERAPIA EM USO ──────────────────────────────────
    {
      id: "currentAntibioticsRegimen",
      section: "UTI — Antibioticoterapia",
      label: "ATB em uso + dia de tratamento",
      value: session.assessment.currentAntibioticsRegimen,
      placeholder: "Ex.: Meropeném 1g 8/8h D5 · Vancomicina D5 · Fluconazol D3",
      helperText: "Registrar cada ATB com dose, intervalo e dia de tratamento. Planejar reavaliação aos D3, D5 e D7.",
      fullWidth: true,
    },
    {
      id: "previousClinicalResponse",
      section: "UTI — Antibioticoterapia",
      label: "Resposta clínica ao esquema atual",
      value: session.assessment.previousClinicalResponse,
      placeholder: "Como o paciente respondeu ao ATB atual?",
      helperText: "Sem resposta após 48–72h = falha terapêutica → modificar. Piora = mudar imediatamente.",
      fullWidth: true,
      presets: [
        { label: "Boa resposta clínica", value: "Boa resposta — afebre, estabilidade hemodinâmica, melhora laboratorial" },
        { label: "Resposta parcial / lenta", value: "Resposta parcial — melhora incompleta ou muito lenta" },
        { label: "Sem resposta (48–72h)", value: "Sem resposta após 48–72h — considerar falha terapêutica" },
        { label: "Piora apesar do ATB", value: "Piora clínica apesar do ATB atual → mudança urgente" },
        { label: "ATB < 48h (cedo para avaliar)", value: "ATB iniciado há < 48h — aguardar janela terapêutica" },
      ],
    },
    {
      id: "antibioticEscalation",
      section: "UTI — Antibioticoterapia",
      label: "Decisão de ajuste do ATB",
      value: session.assessment.antibioticEscalation,
      placeholder: "Conduta definida para o esquema antibiótico",
      helperText: "Sistema sugere automaticamente baseado nas culturas e no ATB em uso.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedAntibioticEscalation();
        return s ? { suggestedValue: s.value, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Manter — aguardar reavaliação", value: "Manter esquema atual — reavaliação em 24–48h" },
        { label: "Descalonar (culturas negativas)", value: "Descalonar — culturas negativas e boa resposta após ≥ 72h" },
        { label: "Pip-tazo → Meropeném", value: "Escalonar: trocar piperacilina-tazobactam por meropeném 1g 8/8h" },
        { label: "Meropeném → Ceftaz-avibactam", value: "Escalonar: trocar meropeném por ceftazidima-avibactam 2,5g 8/8h (KPC)" },
        { label: "Adicionar MRSA (Vanco)", value: "Adicionar cobertura MRSA — vancomicina 25–30 mg/kg ataque IV" },
        { label: "Adicionar antifúngico", value: "Adicionar equinocandina — micafungina 100mg/dia ou anidulafungina 200mg ataque" },
        { label: "MSSA → Oxacilina", value: "Descalonar para oxacilina 2g IV 4/4h (MSSA confirmada)" },
        { label: "Direcionar por antibiograma", value: "Direcionar para ATB conforme antibiograma disponível" },
        { label: "Suspender — não infeccioso", value: "Suspender ATB — diagnóstico não-infeccioso confirmado" },
      ],
    },

    // ─── UTI — 4. SUPORTE HEMODINÂMICO ───────────────────────────────────────
    {
      id: "currentVasopressorDoses",
      section: "UTI — Suporte Hemodinâmico",
      label: "Vasopressor(es) em uso + dose atual",
      value: session.assessment.currentVasopressorDoses,
      placeholder: "Ex.: Noradrenalina 0,2 mcg/kg/min — em aumento",
      helperText: "Dose > 0,25 mcg/kg/min sem resposta = choque refratário → associar vasopressina + hidrocortisona.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Sem vasopressor", value: "Sem vasopressor — hemodinâmica estável" },
        { label: "Nora 0,05–0,1 mcg/kg/min", value: "Noradrenalina 0,05–0,1 mcg/kg/min (dose baixa)" },
        { label: "Nora 0,1–0,25 mcg/kg/min", value: "Noradrenalina 0,1–0,25 mcg/kg/min (dose moderada)" },
        { label: "Nora 0,25–0,5 mcg/kg/min", value: "Noradrenalina 0,25–0,5 mcg/kg/min (dose alta)" },
        { label: "Nora > 0,5 (refratário)", value: "Noradrenalina > 0,5 mcg/kg/min — choque refratário" },
        { label: "+ Vasopressina 0,03 U/min", value: "Vasopressina 0,03 U/min (adjuvante — poupar noradrenalina)" },
        { label: "+ Dobutamina (disfunção VE)", value: "Dobutamina 2,5–10 mcg/kg/min (disfunção miocárdica séptica)" },
        { label: "+ Adrenalina (refratário)", value: "Adrenalina 0,05–0,3 mcg/kg/min (choque refratário total)" },
        { label: "Desmame em curso", value: "Desmame de vasopressor — PAM estável > 24h sem suporte" },
      ],
    },

    // ─── UTI — 5. VENTILAÇÃO MECÂNICA ────────────────────────────────────────
    {
      id: "ventilationMode",
      section: "UTI — Ventilação Mecânica",
      label: "Modo ventilatório atual",
      value: session.assessment.ventilationMode,
      placeholder: "Selecionar modo ventilatório",
      helperText: "VM protetora: VC 6 mL/kg PI · Pplatô ≤ 30 cmH₂O · driving pressure ≤ 15 cmH₂O.",
      fullWidth: true,
      presets: [
        { label: "Espontâneo s/ VM", value: "Ventilação espontânea sem suporte mecânico" },
        { label: "O₂ suplementar", value: "Ventilação espontânea com O₂ suplementar" },
        { label: "VNI (CPAP/BiPAP)", value: "VNI — CPAP ou BiPAP" },
        { label: "VCV — volume controlado", value: "VCV — VC 6 mL/kg PI · FR 14–18 irpm · PEEP titulado" },
        { label: "PCV — pressão controlada", value: "PCV — Pinsp titulada · PEEP titulado" },
        { label: "PSV — pressão suporte", value: "PSV — desmame ventilatório em andamento" },
        { label: "APRV (SDRA grave)", value: "APRV — SDRA moderada/grave (Phigh/Plow titulado)" },
        { label: "ECMO VV", value: "ECMO veno-venoso — SDRA grave refratária" },
      ],
    },
    {
      id: "ventilatorFio2",
      section: "UTI — Ventilação Mecânica",
      label: "FiO₂ atual no ventilador (%)",
      value: session.assessment.ventilatorFio2,
      placeholder: "Ex.: 60",
      keyboardType: "numeric" as const,
      helperText: "Inserir FiO₂ para cálculo automático da relação P/F. Alvo: menor FiO₂ para SpO₂ 92–96%.",
      presets: [
        { label: "21%", value: "21" }, { label: "30%", value: "30" },
        { label: "40%", value: "40" }, { label: "50%", value: "50" },
        { label: "60%", value: "60" }, { label: "70%", value: "70" },
        { label: "80%", value: "80" }, { label: "100%", value: "100" },
      ],
    },
    {
      id: "ventilatorPeep",
      section: "UTI — Ventilação Mecânica",
      label: "PEEP atual (cmH₂O)",
      value: session.assessment.ventilatorPeep,
      placeholder: "Ex.: 8",
      keyboardType: "numeric" as const,
      helperText: "SDRA moderada: PEEP 10–14 · SDRA grave: PEEP ≥ 14–18 (conforme ARDSnet PEEP table).",
      presets: [
        { label: "5", value: "5" }, { label: "8", value: "8" },
        { label: "10", value: "10" }, { label: "12", value: "12" },
        { label: "14", value: "14" }, { label: "16", value: "16" },
        { label: "18", value: "18" }, { label: "20", value: "20" },
      ],
    },

    // ─── UTI — 6. ESTADO NEUROLÓGICO / SEDAÇÃO ───────────────────────────────
    {
      id: "sedationStatus",
      section: "UTI — Sedação e Neurológico",
      label: "Estado de consciência / sedação",
      value: session.assessment.sedationStatus,
      placeholder: "Nível de consciência ou status de sedação",
      helperText: "Meta padrão UTI: RASS 0 a −2 (sedação leve). Despertar diário para avaliar necessidade.",
      fullWidth: true,
      presets: [
        { label: "Acordado e orientado", value: "Acordado e orientado — sem sedação" },
        { label: "Confuso / delirium", value: "Confuso ou delirium (encefalopatia séptica ou delirium de UTI)" },
        { label: "Sedado — avaliar RASS", value: "Sedado — avaliar RASS abaixo" },
        { label: "Sedado profundo / BNM", value: "Sedado profundo ou em uso de bloqueador neuromuscular" },
        { label: "Agitado — investigar causa", value: "Agitado — investigar dor, hipóxia, delirium, abstinência" },
        { label: "Coma / sem resposta", value: "Coma — sem resposta a estímulos" },
      ],
    },
    {
      id: "rassScore",
      section: "UTI — Sedação e Neurológico",
      label: "RASS — Richmond Agitation-Sedation Scale",
      value: session.assessment.rassScore,
      placeholder: "Selecionar nível RASS atual",
      helperText: "Meta UTI: RASS 0 a −2. RASS −3 a −5 = sedação profunda → avaliar despertar diário.",
      presets: [
        { label: "+4 — Combativo", value: "+4 — Combativo (risco para equipe)" },
        { label: "+3 — Muito agitado", value: "+3 — Muito agitado (remove dispositivos)" },
        { label: "+2 — Agitado", value: "+2 — Agitado (luta com ventilador)" },
        { label: "+1 — Inquieto", value: "+1 — Inquieto, ansioso" },
        { label: "0 — Alerta e calmo", value: "0 — Alerta e calmo ✓" },
        { label: "−1 — Sonolento", value: "−1 — Sonolento (abre olhos ao voz)" },
        { label: "−2 — Sed. leve ✓ meta", value: "−2 — Sedação leve (meta de UTI)" },
        { label: "−3 — Sed. moderada", value: "−3 — Sedação moderada (move ao voz)" },
        { label: "−4 — Sed. profunda", value: "−4 — Sedação profunda (move ao estímulo físico)" },
        { label: "−5 — Não responsivo", value: "−5 — Não responsivo a nenhum estímulo" },
      ],
    },
    {
      id: "preIntubationGcs",
      section: "UTI — Sedação e Neurológico",
      label: "GCS pré-sedação / último registro sem sedação",
      value: session.assessment.preIntubationGcs,
      placeholder: "GCS antes da sedação ou pré-IOT",
      helperText: "Para intubados: registrar GCS da avaliação mais recente sem sedação. Componente verbal = 1T (intubado).",
      presets: [
        { label: "15 — Normal", value: "GCS 15 — sem déficit neurológico" },
        { label: "13–14 — Rebaixamento leve", value: "GCS 13–14 — rebaixamento leve" },
        { label: "9–12 — Moderado", value: "GCS 9–12 — rebaixamento moderado" },
        { label: "≤ 8 — Grave", value: "GCS ≤ 8 — rebaixamento grave" },
        { label: "Não avaliável — sedado", value: "Não avaliável — sob sedação (registrar RASS acima)" },
        { label: "Não avaliável — BNM", value: "Não avaliável — bloqueio neuromuscular ativo" },
      ],
    },

    // ─── UTI — 7. NOTAS CLÍNICAS ─────────────────────────────────────────────
    {
      id: "icuManagementNotes",
      section: "UTI — Notas Clínicas",
      label: "Notas clínicas / decisões",
      value: session.assessment.icuManagementNotes,
      placeholder: "Ex.: limitação terapêutica discutida, comunicação com família, objetivo de cuidado...",
      helperText: "Registrar decisões de manejo, objetivos de cuidado e planejamento de alta.",
      fullWidth: true,
    },

    // ─── UTI — 8. ISOLAMENTO E SWAB RETAL ────────────────────────────────────
    {
      id: "isolationPrecautions",
      section: "UTI — Isolamento",
      label: "Precauções de isolamento",
      value: session.assessment.isolationPrecautions,
      placeholder: "Tipo de isolamento implementado",
      helperText: "Definir e documentar isolamento — protege equipe, outros pacientes e orienta CCIH.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedIsolation();
        return s ? { suggestedValue: s.isolation, suggestedLabel: s.label } : {};
      })()),
      presets: [
        { label: "Precauções padrão", value: "Precauções padrão vigentes" },
        { label: "Contato — MDR confirmado", value: "Isolamento de contato — MDR confirmado (avental + luvas + quarto individual)" },
        { label: "Contato — MDR suspeito", value: "Isolamento de contato preemptivo — aguardar resultado de swab/cultura" },
        { label: "Aéreo (TB/VAR/sarampo)", value: "Isolamento aéreo — N95/PFF2 + quarto pressão negativa + porta fechada" },
        { label: "Gotículas (Influenza/Meningo)", value: "Isolamento de gotículas — máscara cirúrgica a < 1m + quarto individual" },
        { label: "HSCT — HEPA + P+", value: "Quarto HEPA + pressão positiva — HSCT/TMO (recomendação vigente por IDSA/CDC/ECIL)" },
        { label: "Padrão — imunossuprimido", value: "Precauções padrão + quarto individual — imunossuprimido não-HSCT (isolamento reverso clássico descontinuado)" },
        { label: "Notificado CCIH", value: "CCIH/SCIH notificada — isolamento em curso" },
      ],
    },
    {
      id: "rectalSwabOrdered",
      section: "UTI — Isolamento",
      label: "Swab retal — rastreio de colonização por MDR",
      value: session.assessment.rectalSwabOrdered,
      placeholder: "Status do swab retal",
      helperText: "Indicado na admissão UTI, transfer, uso prévio de carbapenêmico ou UTI ≥ 7 dias.",
      fullWidth: true,
      ...((() => {
        const s = getAutoSuggestedIsolation();
        return s ? { suggestedValue: s.swab, suggestedLabel: `Swab retal: ${s.label}` } : {};
      })()),
      presets: [
        { label: "Coletado agora", value: "Swab retal coletado — aguardando resultado (KPC, ESBL, VRE)" },
        { label: "Coletado na admissão", value: "Swab retal coletado na admissão UTI (protocolo PCIRAS)" },
        { label: "Indicado — solicitar", value: "Swab retal indicado — solicitar coleta urgente" },
        { label: "Negativo (swab anterior)", value: "Swab retal anteriormente negativo para MDR" },
        { label: "Positivo — KPC", value: "Swab retal positivo para KPC — isolamento de contato obrigatório" },
        { label: "Positivo — ESBL", value: "Swab retal positivo para ESBL — isolamento de contato" },
        { label: "Positivo — VRE", value: "Swab retal positivo para VRE — isolamento de contato + notificar CCIH" },
        { label: "Não indicado", value: "Swab retal não indicado — baixo risco MDR, sem fatores de risco" },
      ],
    },
  ];
}

// Absorvido por buildPatientAssessmentFields() — mantido para compatibilidade
function buildInitialExamFields() {
  return buildPatientAssessmentFields().filter((f) =>
    ["systolicPressure", "diastolicPressure", "hypoperfusionSigns"].includes(f.id)
  );
}

// Absorvido por buildPatientAssessmentFields() — mantido para compatibilidade
function buildAntimicrobialContextFields() {
  return buildPatientAssessmentFields().filter((f) =>
    ["mdrRisk", "mrsaRisk", "betaLactamAllergy"].includes(f.id)
  );
}

// Absorvido por buildPatientAssessmentFields() — mantido para compatibilidade
function buildLaboratoryFields() {
  return buildPatientAssessmentFields().filter((f) =>
    ["lactateValue", "creatinineValue"].includes(f.id)
  );
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId === "concluido") {
    return null;
  }

  // Helper: merge ICU management cards into stabilization recs for UTI flow
  const icuCards: AuxiliaryPanelRecommendation[] = session.flowType === "uti_internado"
    ? buildIcuManagementCards() ?? []
    : [];

  // Isolation card — shown in both flows when relevant
  const isolationCard = buildIsolationCard();
  const allCards = isolationCard ? [...icuCards, isolationCard] : icuCards;

  if (
    session.currentStateId === "reconhecimento" ||
    session.currentStateId === "qsofa_criterios" ||
    session.currentStateId === "acesso_coletas"
  ) {
    return {
      title: "Roteiro de atendimento — Sepse",
      description: "Preencha os dados conforme avalia o paciente. PAM, IMC e qSOFA são calculados automaticamente.",
      fields: buildPatientAssessmentFields(),
      metrics: buildClinicalMetrics(),
      stabilizationRecommendations: buildStabilizationRecommendations(),
      recommendations: allCards.length > 0 ? allCards : undefined,
      actions: [],
    };
  }

  if (session.currentStateId === "classificacao_gravidade") {
    return {
      title: "Roteiro de atendimento — Classificação",
      description: "Dados clínicos e calculados para apoiar a decisão de gravidade.",
      fields: buildPatientAssessmentFields(),
      metrics: buildClinicalMetrics(),
      stabilizationRecommendations: buildStabilizationRecommendations(),
      recommendations: allCards.length > 0 ? allCards : undefined,
      actions: [],
    };
  }

  if (session.currentStateId === "bundle_1h") {
    return {
      title: "Roteiro de atendimento — Bundle 1ª hora",
      description: "Marcar cada item do bundle. Sugestão de ATB gerada automaticamente pelos dados acima.",
      fields: buildPatientAssessmentFields(),
      metrics: buildClinicalMetrics(),
      statusItems: buildBundleStatusItems(),
      recommendations: session.flowType === "uti_internado"
        ? [...allCards, ...buildAntimicrobialRecommendationCards()]
        : buildAntimicrobialRecommendationCards(),
      stabilizationRecommendations: buildStabilizationRecommendations(),
      actions: [],
    };
  }

  if (session.currentStateId === "reavaliacao_volume") {
    return {
      title: "Roteiro de atendimento — Reavaliação",
      description: "Atualizar sinais vitais e exames para guiar decisão sobre volume e vasopressor.",
      fields: buildPatientAssessmentFields(),
      metrics: buildClinicalMetrics(),
      stabilizationRecommendations: buildStabilizationRecommendations(),
      recommendations: allCards.length > 0 ? allCards : undefined,
      actions: [],
    };
  }

  if (
    session.currentStateId === "vasopressor_indicado" ||
    session.currentStateId === "avaliar_resposta_vasopressor" ||
    session.currentStateId === "choque_refratario"
  ) {
    return {
      title: "Roteiro de atendimento — Choque séptico",
      description: "Registrar vasopressor, condutas e escalada terapêutica quando necessário.",
      fields: buildPatientAssessmentFields(),
      metrics: [
        { label: "PAM estimada", value: getCalculatedMap() !== null ? `${Math.round(getCalculatedMap()!)} mmHg` : "Não calculada" },
        { label: "Perfusão", value: getPerfusionLabel() },
      ],
      statusItems: buildBundleStatusItems().filter((item) => item.id === "fluidos" || item.id === "vasopressor"),
      stabilizationRecommendations: buildStabilizationRecommendations(),
      recommendations: allCards.length > 0 ? allCards : undefined,
      actions: [
        ...(session.septicShockRecognized && !session.vasopressinSuggested && session.bundle.vasopressor !== "pendente"
          ? [{ id: "suggest_vasopressin", label: "Sugerir vasopressina", requiresConfirmation: true }]
          : []),
        ...(session.septicShockRecognized && !session.inotropeConsidered
          ? [{ id: "consider_inotrope", label: "Considerar inotrópico", requiresConfirmation: true }]
          : []),
      ],
    };
  }

  if (session.currentStateId === "controle_foco") {
    return {
      title: "Roteiro de atendimento — Controle de foco",
      description: "Identificar o foco e registrar as medidas de controle (drenagem, cirurgia, remoção de cateter).",
      fields: buildPatientAssessmentFields(),
      metrics: [
        { label: "Foco suspeito", value: session.assessment.suspectedSource || "Não definido" },
        { label: "PAM estimada", value: getCalculatedMap() !== null ? `${Math.round(getCalculatedMap()!)} mmHg` : "Não calculada" },
      ],
      stabilizationRecommendations: buildStabilizationRecommendations(),
      recommendations: allCards.length > 0 ? allCards : undefined,
      actions: [],
    };
  }

  if (session.currentStateId === "monitorizacao_ativa" || session.currentStateId === "revisao_atb") {
    return {
      title: "Roteiro de atendimento — Monitorização",
      description: "Atualizar os dados de resposta clínica e revisar o antimicrobiano.",
      fields: buildPatientAssessmentFields(),
      metrics: [
        { label: "Perfusão", value: getPerfusionLabel() },
        { label: "PAM", value: getCalculatedMap() !== null ? `${Math.round(getCalculatedMap()!)} mmHg` : getMapLabel() },
        { label: "Achados críticos", value: getAssessmentSummary() },
        { label: "Pendências no bundle", value: String(getPendingBundleCount()) },
      ],
      stabilizationRecommendations: buildStabilizationRecommendations(),
      recommendations: allCards.length > 0 ? allCards : undefined,
      actions: [],
    };
  }

  return null;
}

function updateAuxiliaryField(fieldId: string, value: string) {
  if (!(fieldId in session.assessment)) {
    return getAuxiliaryPanel();
  }

  session.assessment[fieldId as keyof Session["assessment"]] = value;

  if (fieldId === "systolicPressure" || fieldId === "diastolicPressure") {
    const map = getCalculatedMap();
    if (map !== null) {
      session.mapState = map < 65 ? "abaixo_da_meta" : "meta_atingida";
    }
  }

  if (fieldId === "lactateValue") {
    const lactate = getLactateMmolValue();
    if (lactate !== null && lactate >= 2 && session.bundle.lactato === "pendente") {
      session.bundle.lactato = "solicitado";
      logEvent("BUNDLE_ITEM_UPDATED", {
        itemId: "lactato",
        status: "solicitado",
        source: "field",
      });
    }
  }

  return getAuxiliaryPanel();
}

function applyAuxiliaryPreset(fieldId: string, value: string) {
  const field = getAuxiliaryPanel()?.fields.find((item) => item.id === fieldId);
  if (!field) {
    return getAuxiliaryPanel();
  }

  if (field.presetMode === "toggle_token") {
    const current = session.assessment[fieldId as keyof Session["assessment"]] as string;
    // If value contains the multi-token separator it is a "suggest-all" action → set directly
    if (value.includes(" | ")) {
      return updateAuxiliaryField(fieldId, value);
    }
    return updateAuxiliaryField(fieldId, toggleTokenValue(current, value));
  }

  return updateAuxiliaryField(fieldId, value);
}

function updateAuxiliaryUnit(fieldId: string, unit: string) {
  if (fieldId === "lactateValue") {
    session.assessment.lactateValue = convertLactateValue(
      session.assessment.lactateValue,
      session.assessment.lactateUnit,
      unit
    );
    session.assessment.lactateUnit = unit;
  }

  if (fieldId === "creatinineValue") {
    session.assessment.creatinineValue = convertCreatinineValue(
      session.assessment.creatinineValue,
      session.assessment.creatinineUnit,
      unit
    );
    session.assessment.creatinineUnit = unit;
  }

  return getAuxiliaryPanel();
}

function updateAuxiliaryStatus(itemId: string, status: BundleStatus) {
  const item = itemId as BundleItemId;
  if (!Object.prototype.hasOwnProperty.call(session.bundle, item)) {
    return getAuxiliaryPanel();
  }

  updateBundleStatus(item, status);

  if (item === "antibiotico" && status === "solicitado") {
    const recommendation = getAntimicrobialRecommendation();
    enqueueEffect({
      type: "alert",
      title: "Antimicrobianos",
      message: shouldSuggestAntibiotic()
        ? `Inicie antimicrobianos agora. ${recommendation.headline}`
        : "Revisar adequação do antimicrobiano conforme hipótese clínica e exames.",
    });
    enqueueEffect({
      type: "speak",
      message: "Iniciar antimicrobianos",
      suppressStateSpeech: true,
    });
  }

  if (item === "fluidos" && status === "solicitado") {
    enqueueEffect({
      type: "alert",
      title: "Cristaloide",
      message: shouldSuggestCrystalloid()
        ? `Faça Ringer Lactato 30 mililitros por quilo (cristalóide balanceado). ${getInitialCrystalloidVolumeLabel()}`
        : `Cristaloide 30 mililitros por quilo pode ser necessário conforme contexto. ${getInitialCrystalloidVolumeLabel()}`,
    });
  }

  if (item === "vasopressor" && status !== "pendente") {
    session.septicShockRecognized = true;
    session.perfusionState = "choque_septico";
    if (session.mapState === "desconhecida") {
      session.mapState = "abaixo_da_meta";
    }
    logEvent("SEPTIC_SHOCK_RECOGNIZED");
    logEvent("VASOPRESSOR_SUGGESTED");
    enqueueEffect({
      type: "alert",
      title: "Noradrenalina",
      message: shouldSuggestImmediateVasopressor()
        ? "Considere iniciar noradrenalina precocemente. O contexto atual sugere choque mais grave, com necessidade de restaurar PAM maior ou igual a 65 milímetros de mercúrio."
        : shouldSuggestVasopressor()
          ? "Inicie noradrenalina se a hipotensão persistir após ressuscitação volêmica adequada, para meta de PAM maior ou igual a 65 milímetros de mercúrio."
          : "Noradrenalina é a primeira linha se a PAM seguir abaixo da meta ou o choque ficar evidente.",
    });
    enqueueEffect({
      type: "speak",
      message: "Iniciar noradrenalina",
      suppressStateSpeech: true,
    });
  }

  return getAuxiliaryPanel();
}

function runAuxiliaryAction(actionId: string) {
  if (actionId.startsWith("goto:")) {
    transitionToState(actionId.replace("goto:", ""), "STATE_TRANSITIONED", {
      source: "panel",
    });
    return getClinicalLog();
  }

  if (actionId === "suggest_vasopressin" && !session.vasopressinSuggested) {
    session.vasopressinSuggested = true;
    logEvent("VASOPRESSIN_SUGGESTED");
    enqueueEffect({
      type: "alert",
      title: "Vasopressina",
      message:
        "Se a PAM continuar inadequada com noradrenalina, adicionar vasopressina em vez de apenas aumentar catecolamina.",
    });
    enqueueEffect({
      type: "speak",
      message: "Considerar associação de vasopressina",
      suppressStateSpeech: true,
    });
  }

  if (actionId === "consider_inotrope" && !session.inotropeConsidered) {
    session.inotropeConsidered = true;
    logEvent("INOTROPE_CONSIDERED");
    enqueueEffect({
      type: "alert",
      title: "Inotrópico",
      message:
        "Se houver disfunção miocárdica com hipoperfusão persistente apesar de pressão adequada, considerar inotrópico.",
    });
    enqueueEffect({
      type: "speak",
      message: "Considerar inotrópico",
      suppressStateSpeech: true,
    });
  }

  return getClinicalLog();
}

function buildBundleItemLog(event: Event): ClinicalLogEntry[] {
  const itemId = event.data?.itemId as BundleItemId | undefined;
  const status = event.data?.status as BundleStatus | undefined;

  if (!itemId || !status) {
    return [];
  }

  const titles: Record<BundleItemId, Record<BundleStatus, string>> = {
    lactato: {
      pendente: "Lactato pendente",
      solicitado: "Lactato solicitado",
      realizado: "Lactato realizado",
    },
    culturas: {
      pendente: "Culturas pendentes",
      solicitado: "Culturas solicitadas",
      realizado: "Culturas realizadas",
    },
    antibiotico: {
      pendente: "Antimicrobiano pendente",
      solicitado: "Antimicrobiano sugerido",
      realizado: "Antimicrobiano iniciado",
    },
    fluidos: {
      pendente: "Cristaloide pendente",
      solicitado: "Fluidos sugeridos",
      realizado: "Fluidos iniciados",
    },
    vasopressor: {
      pendente: "Vasopressor pendente",
      solicitado: "Noradrenalina sugerida",
      realizado: "Noradrenalina iniciada",
    },
  };

  const details: Record<BundleItemId, Record<BundleStatus, string>> = {
    lactato: {
      pendente: "Revisar necessidade de dosagem.",
      solicitado: "Mensuração de lactato solicitada.",
      realizado: "Lactato registrado como realizado.",
    },
    culturas: {
      pendente: "Revisar coleta microbiológica.",
      solicitado: "Culturas solicitadas antes do antimicrobiano quando possível.",
      realizado: "Culturas registradas como coletadas.",
    },
    antibiotico: {
      pendente: "Antimicrobiano ainda não registrado.",
      solicitado: "Antimicrobiano priorizado no bundle.",
      realizado: "Antimicrobiano registrado como iniciado.",
    },
    fluidos: {
      pendente: "Ressuscitação volêmica ainda pendente.",
      solicitado: "Ressuscitação volêmica indicada no contexto atual.",
      realizado: "Cristaloide registrado como iniciado.",
    },
    vasopressor: {
      pendente: "Vasopressor ainda não iniciado.",
      solicitado: "Noradrenalina sugerida pelo contexto hemodinâmico.",
      realizado: "Noradrenalina registrada como iniciada.",
    },
  };

  return [
    {
      timestamp: event.timestamp,
      kind:
        itemId === "antibiotico"
          ? "antibiotic_reminder"
          : itemId === "fluidos"
            ? "fluid_reminder"
            : itemId === "vasopressor"
              ? "vasopressor_reminder"
              : "action_executed",
      title: titles[itemId][status],
      details: details[itemId][status],
    },
  ];
}

function getClinicalLog(): ClinicalLogEntry[] {
  return session.history
    .flatMap((event): ClinicalLogEntry[] => {
      switch (event.type) {
        case "SEPSIS_RECOGNIZED":
          return [
            {
              timestamp: event.timestamp,
              kind: "action_executed",
              title: "Suspeita de sepse reconhecida",
              details: "Sepse tratada como emergência médica.",
            },
          ];
        case "SCENARIO_SET":
          return [
            {
              timestamp: event.timestamp,
              kind: "action_executed",
              title: "Gravidade inicial definida",
              details: getScenarioLabel(),
            },
          ];
        case "BUNDLE_ACTIVATED":
          return [
            {
              timestamp: event.timestamp,
              kind: "action_executed",
              title: "Bundle da primeira hora ativado",
              details: "Lactato, culturas, antimicrobianos, fluidos e vasopressor permanecem visíveis no painel.",
            },
          ];
        case "BUNDLE_ITEM_UPDATED":
          return buildBundleItemLog(event);
        case "PERFUSION_REASSESSED":
          return [
            {
              timestamp: event.timestamp,
              kind: "perfusion_reassessment",
              title: "Perfusão reavaliada",
              details: getPerfusionLabel(),
            },
          ];
        case "SEPTIC_SHOCK_RECOGNIZED":
          return [
            {
              timestamp: event.timestamp,
              kind: "vasopressor_reminder",
              title: "Choque séptico reconhecido",
              details: "Persistência de hipotensão ou hipoperfusão após volume.",
            },
          ];
        case "VASOPRESSOR_SUGGESTED":
          return [
            {
              timestamp: event.timestamp,
              kind: "vasopressor_reminder",
              title: "Noradrenalina sugerida",
              details: "Primeira linha para meta de PAM maior ou igual a 65 mmHg.",
            },
          ];
        case "VASOPRESSIN_SUGGESTED":
          return [
            {
              timestamp: event.timestamp,
              kind: "vasopressor_reminder",
              title: "Vasopressina sugerida",
              details: "Adicionar se a PAM continuar inadequada.",
            },
          ];
        case "INOTROPE_CONSIDERED":
          return [
            {
              timestamp: event.timestamp,
              kind: "vasopressor_reminder",
              title: "Inotrópico considerado",
              details: "Reavaliar disfunção miocárdica e hipoperfusão persistente.",
            },
          ];
        case "MAP_REASSESSED":
          return [
            {
              timestamp: event.timestamp,
              kind: "perfusion_reassessment",
              title: "PAM reavaliada",
              details: getMapLabel(),
            },
          ];
        case "FOCUS_UPDATED": {
          const cause = (protocolData.reversibleCauses ?? []).find((item) => item.id === event.data?.causeId);
          return [
            {
              timestamp: event.timestamp,
              kind: "reversible_cause_update",
              title: "Foco infeccioso marcado",
              details: `${cause?.label ?? event.data?.causeId} • ${event.data?.status}`,
            },
          ];
        }
        case "ANTIBIOTIC_REMINDER_TRIGGERED":
          return [
            {
              timestamp: event.timestamp,
              kind: "antibiotic_reminder",
              title: "Lembrete de antimicrobiano",
              details: "Meta de 1 hora atingida sem antibiótico registrado como realizado.",
            },
          ];
        case "DESTINATION_DEFINED":
          return [
            {
              timestamp: event.timestamp,
              kind: "action_executed",
              title: "Destino definido",
              details: `${event.data?.destination ?? "Destino não definido"}.`,
            },
          ];
        case "QUESTION_TRANSITIONED":
          if (event.data?.to === "concluido") {
            return [
              {
                timestamp: event.timestamp,
                kind: "encerramento",
                title: "Plano clínico inicial registrado",
                details: "Prosseguir com reavaliação clínica contínua e controle do foco.",
              },
            ];
          }
          return [];
        default:
          return [];
      }
    })
    .map((entry) => ({
      ...entry,
      details: withRelativeTime(entry.timestamp, entry.details),
    }));
}

function getEncounterSummary(): EncounterSummary {
  const suspectedCauses = getReversibleCauses()
    .filter((cause) => cause.status === "suspeita")
    .map((cause) => cause.label);
  const addressedCauses = getReversibleCauses()
    .filter((cause) => cause.status === "abordada")
    .map((cause) => cause.label);
  const durationLabel = formatElapsedTime(now() - getReferenceTimestamp());

  return {
    protocolId: session.protocolId,
    durationLabel,
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses,
    addressedCauses,
    lastEvents: getClinicalLog()
      .slice(-5)
      .map((entry) => `${entry.title}${entry.details ? ` • ${entry.details}` : ""}`),
    panelMetrics: [
      { label: "Paciente", value: [session.assessment.age && `${session.assessment.age} a`, session.assessment.sex, session.assessment.weightKg && `${session.assessment.weightKg} kg`].filter(Boolean).join(" • ") || "Dados básicos pendentes" },
      { label: "Tempo desde reconhecimento", value: durationLabel },
      { label: "Início dos sintomas", value: session.assessment.symptomOnset || "Não informado" },
      { label: "PAS/PAD", value: session.assessment.systolicPressure && session.assessment.diastolicPressure ? `${session.assessment.systolicPressure}/${session.assessment.diastolicPressure}` : "Não informadas" },
      { label: "PAM calculada", value: getCalculatedMap() !== null ? `${Math.round(getCalculatedMap()!)} mmHg` : "Não calculada" },
      { label: "Lactato atual", value: session.assessment.lactateValue ? `${session.assessment.lactateValue} ${session.assessment.lactateUnit}` : "Não informado" },
      { label: "Creatinina", value: session.assessment.creatinineValue ? `${session.assessment.creatinineValue} ${session.assessment.creatinineUnit}` : "Não informada" },
      { label: "ClCr estimado", value: getEstimatedCrCl() !== null ? `${getEstimatedCrCl()} mL/min` : "Não calculado" },
      { label: "Comorbidades", value: session.assessment.comorbidities || "Não informadas" },
      { label: "Contexto assistencial", value: session.assessment.careSetting || "Não informado" },
      { label: "Diálise", value: session.assessment.dialysisMode || "Não informada" },
      { label: "Risco MDR", value: session.assessment.mdrRisk || "Não informado" },
      { label: "Risco MRSA", value: session.assessment.mrsaRisk || "Não informado" },
      { label: "Alergia beta-lactâmico", value: session.assessment.betaLactamAllergy || "Não informada" },
      { label: "Lactato", value: getBundleStatusLabel(session.bundle.lactato) },
      { label: "Culturas", value: getBundleStatusLabel(session.bundle.culturas) },
      { label: "Antimicrobiano", value: getBundleStatusLabel(session.bundle.antibiotico) },
      { label: "Fluidos", value: getBundleStatusLabel(session.bundle.fluidos) },
      { label: "Vasopressor", value: getBundleStatusLabel(session.bundle.vasopressor) },
      { label: "PAM alvo", value: "65 mmHg" },
      { label: "Foco suspeito", value: session.assessment.suspectedSource || "Não registrado" },
      { label: "Foco / source control", value: getSourceControlLabel() },
      { label: "Destino", value: session.destination ?? "Pendente" },
    ],
    metrics: [
      { label: "Cenário inicial", value: getScenarioLabel() },
      { label: "Perfusão", value: getPerfusionLabel() },
      { label: "Choque séptico", value: session.septicShockRecognized ? "Reconhecido" : "Não reconhecido" },
      { label: "PAM", value: getMapLabel() },
      { label: "Vasopressina", value: session.vasopressinSuggested ? "Sugerida" : "Não sugerida" },
      { label: "Inotrópico", value: session.inotropeConsidered ? "Considerado" : "Não considerado" },
      { label: "Bundle pendente", value: String(getPendingBundleCount()) },
      { label: "Focos suspeitos", value: String(suspectedCauses.length) },
      { label: "Focos abordados", value: String(addressedCauses.length) },
    ],
  };
}

function getEncounterSummaryText() {
  const summary = getEncounterSummary();
  const lines = [
    "Resumo clínico do atendimento",
    `Protocolo: ${summary.protocolId}`,
    `Duração: ${summary.durationLabel}`,
    `Estado atual: ${summary.currentStateText} (${summary.currentStateId})`,
  ];

  for (const metric of summary.metrics ?? []) {
    lines.push(`${metric.label}: ${metric.value}`);
  }

  lines.push("", "Últimos eventos:");
  for (const event of summary.lastEvents) {
    lines.push(`- ${event}`);
  }

  return lines.join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEncounterReportHtml() {
  const summary = getEncounterSummary();
  const metrics = (summary.metrics ?? [])
    .map(
      (metric) =>
        `<div><div class="label">${escapeHtml(metric.label)}</div><div class="value">${escapeHtml(metric.value)}</div></div>`
    )
    .join("");
  const logItems = getClinicalLog()
    .slice()
    .reverse()
    .map((entry) => {
      const details = entry.details ? `<div class="entry-details">${escapeHtml(entry.details)}</div>` : "";
      return `<div class="entry"><div class="entry-title">${escapeHtml(entry.title)}</div>${details}</div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório clínico - ${escapeHtml(summary.protocolId)}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; margin: 32px; line-height: 1.45; }
      h1, h2 { margin: 0 0 12px; }
      .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
      .section { margin-top: 28px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; }
      .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
      .value { font-size: 16px; font-weight: 700; margin-top: 2px; }
      .entry { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
      .entry-title { font-size: 15px; font-weight: 700; }
      .entry-details { font-size: 14px; color: #374151; margin-top: 4px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="eyebrow">Apoio à decisão clínica</div>
    <h1>Relatório clínico do atendimento</h1>
    <div class="section grid">
      <div><div class="label">Protocolo</div><div class="value">${escapeHtml(summary.protocolId)}</div></div>
      <div><div class="label">Duração</div><div class="value">${escapeHtml(summary.durationLabel)}</div></div>
      <div><div class="label">Estado atual</div><div class="value">${escapeHtml(summary.currentStateText)}</div></div>
      <div><div class="label">Identificador</div><div class="value">${escapeHtml(summary.currentStateId)}</div></div>
      ${metrics}
    </div>
    <div class="section">
      <h2>Log clínico</h2>
      ${logItems || "<div class=\"entry\"><div class=\"entry-details\">Nenhum evento clínico registrado.</div></div>"}
    </div>
  </body>
</html>`;
}

function maybeTriggerAntibioticReminder() {
  if (!session.antibioticReminderNextAt || session.bundle.antibiotico === "realizado") {
    return;
  }

  const nowTime = now();
  if (nowTime < session.antibioticReminderNextAt) {
    return;
  }

  const intervalsMissed = Math.max(
    1,
    Math.floor((nowTime - session.antibioticReminderNextAt) / ANTIBIOTIC_REMINDER_INTERVAL_MS) + 1
  );
  session.antibioticReminderNextAt += intervalsMissed * ANTIBIOTIC_REMINDER_INTERVAL_MS;

  logEvent("ANTIBIOTIC_REMINDER_TRIGGERED");
  enqueueEffect({
    type: "alert",
    title: "Lembrete de antimicrobiano",
    message: "Antimicrobiano ainda não registrado como realizado. Rever agora a meta de 1 hora.",
  });
  enqueueEffect({
    type: "speak",
    message: "Revisar antibiótico agora",
  });
}

function tick() {
  maybeTriggerAntibioticReminder();
  return getCurrentState();
}

function resetSession() {
  session = createSession();
  return getCurrentState();
}

function setSessionFlowType(ft: "emergencia" | "uti_internado") {
  session.flowType = ft;
  return getAuxiliaryPanel();
}

/**
 * Processa ações realizadas em módulos externos ao retornar ao Sepse.
 * O parâmetro `action` vem da query string `return_action` na rota.
 * Ex: return_action=intubated → marca intubação como realizada.
 */
function applyReturnAction(action: string) {
  if (!action) return;
  if (/^intubated$/i.test(action)) {
    if (!session.assessment.intubationDecision.trim()) {
      session.assessment.intubationDecision = "IOT realizada — retornou do módulo ISR";
    } else {
      session.assessment.intubationDecision += " · IOT realizada (módulo ISR)";
    }
    session.history.push({ timestamp: Date.now(), type: "RETURN_ACTION", data: { action } });
    persistSessionDraft();
  }
  if (/^vasopressor_started$/i.test(action)) {
    if (!session.assessment.vasopressorUse.trim()) {
      session.assessment.vasopressorUse = "Vasopressor iniciado — retornou do módulo Drogas Vasoativas";
    }
    session.history.push({ timestamp: Date.now(), type: "RETURN_ACTION", data: { action } });
    persistSessionDraft();
  }
  if (/^ventilation_started$/i.test(action)) {
    if (!session.assessment.ventilationMode.trim()) {
      session.assessment.ventilationMode = "VM iniciada — retornou do módulo Ventilação";
    }
    session.history.push({ timestamp: Date.now(), type: "RETURN_ACTION", data: { action } });
    persistSessionDraft();
  }
}

export {
  canGoBack,
  consumeEffects,
  goBack,
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
  getSepsisHubData,
  next,
  registerExecution,
  resetSession,
  runAuxiliaryAction,
  tick,
  updateAuxiliaryField,
  applyAuxiliaryPreset,
  updateAuxiliaryUnit,
  updateAuxiliaryStatus,
  updateReversibleCauseStatus,
  setSessionFlowType,
  applyReturnAction,
};
