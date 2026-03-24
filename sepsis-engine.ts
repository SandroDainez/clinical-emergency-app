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
    age: string;
    sex: string;
    weightKg: string;
    suspectedSource: string;
    symptomOnset: string;
    comorbidities: string;
    careSetting: string;
    mdrRisk: string;
    mrsaRisk: string;
    betaLactamAllergy: string;
    dialysisMode: string;
    heartRate: string;
    oxygenSaturation: string;
    mentalStatus: string;
    capillaryRefill: string;
    urineOutput: string;
    temperature: string;
    respiratoryRate: string;
    respiratoryPattern: string;
    systolicPressure: string;
    diastolicPressure: string;
    lactateValue: string;
    lactateUnit: string;
    creatinineValue: string;
    creatinineUnit: string;
    hypoperfusionSigns: string;
  };
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
      age: "",
      sex: "",
      weightKg: "",
      suspectedSource: "",
      symptomOnset: "",
      comorbidities: "",
      careSetting: "Comunitário",
      mdrRisk: "Baixo",
      mrsaRisk: "Não",
      betaLactamAllergy: "Não",
      dialysisMode: "Não",
      heartRate: "",
      oxygenSaturation: "",
      mentalStatus: "",
      capillaryRefill: "",
      urineOutput: "",
      temperature: "",
      respiratoryRate: "",
      respiratoryPattern: "",
      systolicPressure: "",
      diastolicPressure: "",
      lactateValue: "",
      lactateUnit: "mmol/L",
      creatinineValue: "",
      creatinineUnit: "mg/dL",
      hypoperfusionSigns: "",
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
    .split(",")
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
  return next.join(", ");
}

function getCalculatedMap() {
  const systolic = parseNumber(session.assessment.systolicPressure);
  const diastolic = parseNumber(session.assessment.diastolicPressure);

  if (systolic === null || diastolic === null) {
    return null;
  }

  return (systolic + 2 * diastolic) / 3;
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
      { label: "18", value: "18,0" },
      { label: "36", value: "36,0" },
      { label: "54", value: "54,0" },
    ];
  }

  return [
    { label: "2,0", value: "2,0" },
    { label: "4,0", value: "4,0" },
    { label: "6,0", value: "6,0" },
  ];
}

function getCreatininePresets(unit: string) {
  if (unit === "µmol/L") {
    return [
      { label: "88", value: "88" },
      { label: "177", value: "177" },
      { label: "265", value: "265" },
    ];
  }

  return [
    { label: "1,0", value: "1,0" },
    { label: "2,0", value: "2,0" },
    { label: "3,0", value: "3,0" },
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
  if (hasSourceToken(/dispositivo|vascular|cateter/)) {
    return "Dispositivo vascular";
  }
  if (hasSourceToken(/indefin/)) {
    return "Indefinido";
  }
  return "Não definido";
}

function getDominantSourceKey() {
  if (hasSourceToken(/pulmon/)) {
    return "pulmonar";
  }
  if (hasSourceToken(/urin/)) {
    return "urinario";
  }
  if (hasSourceToken(/abdominal/)) {
    return "abdominal";
  }
  if (hasSourceToken(/pele|partes moles/)) {
    return "pele_partes_moles";
  }
  if (hasSourceToken(/dispositivo|vascular|cateter/)) {
    return "dispositivo_vascular";
  }
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
  const cards: AuxiliaryPanelRecommendation[] = [
    {
      title: `Esquema sugerido • ${recommendation.focusLabel}`,
      lines: [recommendation.headline, "Componentes recomendados:", ...formatComponentLines(recommendation.regimen)],
    },
  ];

  const renalLines = recommendation.details.filter(
    (line) => /renal|ClCr|intervalo/.test(line)
  );
  if (renalLines.length > 0) {
    cards.push({
      title: "Ajuste renal",
      tone: "warning",
      lines: renalLines,
    });
  }

    const noteLines = recommendation.details.filter(
      (line) => /descalonamento|protocolo local|MRSA|MDR|alergia/.test(line)
    );
    if (noteLines.length > 0) {
      cards.push({
        title: "Observações",
        lines: noteLines,
      });
    }

    if (session.assessment.dialysisMode.trim() && session.assessment.dialysisMode.trim().toLowerCase() !== "não") {
      cards.push({
        title: "Modalidade de diálise",
        tone: "warning",
        lines: [
          "HD = hemodiálise intermitente; CRRT = diálise contínua renal; CAPD = diálise peritoneal contínua.",
          "As doses acima já incorporam os ajustes conhecidos para esses modos; confirme com protocolo local antes da manutenção.",
        ],
      });
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
        : `Inicie antimicrobiano precocemente após a avaliação inicial. ${antimicrobialRecommendation.headline}`
    );
    recommendations.push(...antimicrobialRecommendation.details);
  }
  if (shouldSuggestCrystalloid()) {
    recommendations.push(`Faça cristalóide 30 mL/kg. ${getInitialCrystalloidVolumeLabel()}`);
  }
  if (shouldSuggestVasopressor()) {
    recommendations.push("Inicie noradrenalina se a PAM seguir abaixo de 65 mmHg ou o choque estiver evidente.");
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

  if (session.currentStateId === "dados_iniciais_paciente") {
    return {
      ...template,
      details: [
        "Registrar os dados clínicos iniciais do caso.",
        "Identificar foco infeccioso suspeito, sinais vitais, perfusão, estado mental e exame respiratório.",
        "Usar esses achados para decidir a gravidade inicial e a urgência do bundle da primeira hora.",
      ],
    };
  }

  if (session.currentStateId === "bundle_primeira_hora") {
    return {
      ...template,
      details: [
        ...getBundleActionRecommendations(),
        `Itens ainda não realizados no bundle: ${getPendingBundleCount()}.`,
      ],
    };
  }

  if (session.currentStateId === "avaliacao_clinica_gravidade") {
    const scenario = getAutomaticScenario();
    return {
      ...template,
      details: [
        `Classificação sugerida: ${scenario === "suspeita_choque_septico" ? "sepse com suspeita de choque séptico" : scenario === "sepse_alto_risco" ? "sepse" : "infecção suspeita sem critérios suficientes para sepse"}.`,
        getAssessmentPrompt(),
        `Achados críticos destacados: ${getAssessmentSummary()}.`,
        `Gravidade sugerida com base nos dados disponíveis: ${getAutomaticScenarioReasoning()}.`,
      ],
    };
  }

  if (session.currentStateId === "ressuscitacao_hemodinamica") {
    return {
      ...template,
      details: [
        "Reavaliar perfusão de forma integrada: PAM, enchimento capilar, diurese, estado mental e lactato.",
        `Resumo clínico atual: ${getAssessmentSummary()}.`,
        session.bundle.fluidos === "realizado"
          ? "Ressuscitação volêmica já registrada. Julgar resposta clínica real."
          : shouldSuggestCrystalloid()
            ? `Faça cristalóide 30 mililitros por quilo agora. ${getInitialCrystalloidVolumeLabel()}`
            : `Cristaloide 30 mililitros por quilo pode ser necessário conforme resposta clínica. ${getInitialCrystalloidVolumeLabel()}`,
        shouldSuggestImmediateVasopressor()
          ? "O contexto sugere choque mais grave. Considere iniciar noradrenalina precocemente enquanto a ressuscitação volêmica é organizada."
          : shouldSuggestVasopressor()
            ? "Se a PAM seguir abaixo da meta apesar do volume, inicie noradrenalina."
            : "Neste momento, priorize reposição volêmica e reavalie se haverá necessidade de vasopressor.",
      ],
    };
  }

  if (session.currentStateId === "choque_septico") {
    return {
      ...template,
      details: [
        session.bundle.vasopressor === "realizado"
          ? "Noradrenalina já registrada. Reavaliar PAM e necessidade de associação."
          : "Faça noradrenalina agora. É o vasopressor de primeira linha se a PAM permanecer abaixo de 65 milímetros de mercúrio.",
        session.vasopressinSuggested
          ? "Vasopressina já foi sugerida como adição."
          : "Se a meta não for atingida, adicione vasopressina em vez de apenas escalar catecolamina.",
        session.inotropeConsidered
          ? "Inotrópico já foi considerado no contexto atual."
          : "Considere inotrópico se houver disfunção miocárdica com hipoperfusão persistente.",
      ],
    };
  }

  if (session.currentStateId === "reavaliacao_continua") {
    return {
      ...template,
      details: [
        "Reavaliar o que já foi feito, o que falta do bundle e a resposta hemodinâmica atual.",
        `Bundle atual: lactato ${getBundleStatusLabel(session.bundle.lactato).toLowerCase()}, culturas ${getBundleStatusLabel(session.bundle.culturas).toLowerCase()}, antimicrobiano ${getBundleStatusLabel(session.bundle.antibiotico).toLowerCase()}.`,
        `Achados clínicos mais recentes: ${getAssessmentSummary()}.`,
        "Se houver piora ou instabilidade, voltar para hemodinâmica ou choque séptico sem reiniciar o fluxo.",
      ],
    };
  }

  if (session.currentStateId === "source_control") {
    return template;
  }

  if (session.currentStateId === "definir_destino") {
    return template;
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

  if (session.currentStateId === "dados_iniciais_paciente") {
    const checks: Array<[keyof Session["assessment"], string]> = [
      ["age", "idade"],
      ["sex", "sexo"],
      ["weightKg", "peso"],
      ["suspectedSource", "foco suspeito"],
      ["symptomOnset", "início dos sintomas"],
      ["heartRate", "frequência cardíaca"],
      ["oxygenSaturation", "saturação"],
      ["temperature", "temperatura"],
      ["respiratoryRate", "frequência respiratória"],
      ["respiratoryPattern", "padrão respiratório"],
      ["mentalStatus", "estado mental"],
      ["capillaryRefill", "enchimento capilar"],
      ["urineOutput", "diurese"],
      ["systolicPressure", "PAS"],
      ["diastolicPressure", "PAD"],
      ["hypoperfusionSigns", "sinais de hipoperfusão"],
    ];

    for (const [key, label] of checks) {
      if (!session.assessment[key]?.trim()) {
        missing.push(label);
      }
    }
  }

  if (session.currentStateId === "bundle_primeira_hora") {
    for (const [itemId, status] of Object.entries(session.bundle)) {
      if (status !== "realizado") {
        missing.push(
          itemId === "lactato"
            ? "lactato"
            : itemId === "culturas"
              ? "culturas"
              : itemId === "antibiotico"
                ? "antimicrobiano"
                : itemId === "fluidos"
                  ? "cristaloide"
                  : "vasopressor"
        );
      }
    }
  }

  if (session.currentStateId === "source_control") {
    const hasMarkedFocus = Object.values(session.reversibleCauseStatuses).some(
      (status) => status === "suspeita" || status === "abordada"
    );
    if (!hasMarkedFocus) {
      missing.push("foco infeccioso provável");
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
    if (session.currentStateId === "avaliacao_clinica_gravidade") {
      applyAutomaticScenario();
    }

    if (session.currentStateId === "ressuscitacao_hemodinamica") {
      const map = getCalculatedMap();
      const lactate = getLactateMmolValue();
      const signs = session.assessment.hypoperfusionSigns.trim().toLowerCase();
      const hasHypoperfusion =
        !!signs && /(olig|enchimento|hipoperfus|frio|moteado|lento|confus|rebaix)/.test(signs);
      const shouldTreatAsShock =
        session.bundle.vasopressor !== "pendente" ||
        session.septicShockRecognized ||
        (map !== null && map < 65) ||
        (lactate !== null && lactate >= 4) ||
        (hasHypoperfusion && session.bundle.fluidos !== "pendente");

      setPerfusionState(shouldTreatAsShock ? "choque_septico" : "adequada");
      transitionToState(
        shouldTreatAsShock ? "choque_septico" : "reavaliacao_continua",
        "STATE_TRANSITIONED"
      );
      return getCurrentState();
    }

    if (session.currentStateId === "choque_septico") {
      if (session.bundle.vasopressor !== "realizado") {
        session.bundle.vasopressor = "solicitado";
      }
      transitionToState("source_control", "STATE_TRANSITIONED");
      return getCurrentState();
    }

    if (session.currentStateId === "reavaliacao_continua") {
      transitionToState("definir_destino", "STATE_TRANSITIONED");
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

  if (session.currentStateId === "ressuscitacao_hemodinamica") {
    if (
      normalized === "perfusao_adequada" ||
      normalized === "hipoperfusao_ou_hipotensao" ||
      normalized === "choque_septico"
    ) {
      setPerfusionState(normalized as PerfusionState);
    }
  }

  if (session.currentStateId === "definir_destino") {
    session.destination =
      normalized === "uti"
        ? "UTI"
        : normalized === "enfermaria"
          ? "Enfermaria"
          : normalized === "observacao_monitorizacao"
            ? "Observação / monitorização"
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
        ? `${getAntimicrobialRecommendation().headline} Meta ideal de até 1 hora desde o reconhecimento.`
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
      label: "Cristaloide 30 mL/kg",
      value: getBundleStatusLabel(session.bundle.fluidos),
      currentStatus: session.bundle.fluidos,
      helperText: shouldSuggestCrystalloid()
        ? `Faça cristalóide 30 mL/kg. ${getInitialCrystalloidVolumeLabel()}`
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
  return [
    {
      id: "age",
      section: "Contexto do paciente",
      label: "Idade",
      value: session.assessment.age,
      placeholder: "Ex.: 67",
      keyboardType: "numeric" as const,
      helperText: "Em anos.",
      presets: [
        { label: "30", value: "30" },
        { label: "50", value: "50" },
        { label: "70", value: "70" },
        { label: "85", value: "85" },
      ],
    },
    {
      id: "sex",
      section: "Contexto do paciente",
      label: "Sexo",
      value: session.assessment.sex,
      placeholder: "Ex.: feminino",
      helperText: "Campo livre curto.",
      presets: [
        { label: "Fem", value: "Feminino" },
        { label: "Masc", value: "Masculino" },
      ],
    },
    {
      id: "weightKg",
      section: "Contexto do paciente",
      label: "Peso (kg)",
      value: session.assessment.weightKg,
      placeholder: "Ex.: 72",
      keyboardType: "numeric" as const,
      helperText: "Útil para volume inicial.",
      presets: [
        { label: "60", value: "60" },
        { label: "80", value: "80" },
        { label: "100", value: "100" },
      ],
    },
    {
      id: "heartRate",
      section: "Sinais vitais",
      label: "FC (bpm)",
      value: session.assessment.heartRate,
      placeholder: "Ex.: 118",
      keyboardType: "numeric" as const,
      helperText: "Frequência cardíaca na chegada.",
      presets: [
        { label: "80", value: "80" },
        { label: "100", value: "100" },
        { label: "120", value: "120" },
        { label: "140", value: "140" },
      ],
    },
    {
      id: "oxygenSaturation",
      section: "Sinais vitais",
      label: "SpO2 (%)",
      value: session.assessment.oxygenSaturation,
      placeholder: "Ex.: 91",
      keyboardType: "numeric" as const,
      helperText: "Saturação periférica de oxigênio.",
      presets: [
        { label: "88", value: "88" },
        { label: "92", value: "92" },
        { label: "95", value: "95" },
        { label: "98", value: "98" },
      ],
    },
    {
      id: "symptomOnset",
      section: "Contexto do paciente",
      label: "Início dos sintomas",
      value: session.assessment.symptomOnset,
      placeholder: "Ex.: 6h, ontem, 2 dias",
      helperText: "Dado clínico resumido.",
      fullWidth: true,
      presets: [
        { label: "< 6h", value: "< 6 horas" },
        { label: "6-24h", value: "6 a 24 horas" },
        { label: "> 24h", value: "> 24 horas" },
        { label: "Dias", value: "Há alguns dias" },
      ],
    },
    {
      id: "suspectedSource",
      section: "Hipótese infecciosa",
      label: "Foco infeccioso suspeito",
      value: session.assessment.suspectedSource,
      placeholder: "Ex.: pulmonar, urinário, abdominal",
      helperText: "Permite marcar mais de uma hipótese de foco na avaliação inicial.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Pulmonar", value: "Pulmonar" },
        { label: "Urinário", value: "Urinário" },
        { label: "Abdominal", value: "Abdominal" },
        { label: "Pele", value: "Pele / partes moles" },
        { label: "Cateter", value: "Dispositivo vascular" },
        { label: "Indefinido", value: "Indefinido" },
      ],
    },
    {
      id: "comorbidities",
      section: "Hipótese infecciosa",
      label: "Comorbidades",
      value: session.assessment.comorbidities,
      placeholder: "Ex.: DRC, DM, cirrose",
      helperText: "Campo curto com comorbidades relevantes.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "DM", value: "DM" },
        { label: "DRC", value: "DRC" },
        { label: "Cirrose", value: "Cirrose" },
        { label: "Neoplasia", value: "Neoplasia" },
        { label: "Imunossup.", value: "Imunossupressão" },
        { label: "ICC", value: "ICC" },
      ],
    },
    {
      id: "careSetting",
      section: "Hipótese infecciosa",
      label: "Contexto assistencial",
      value: session.assessment.careSetting,
      placeholder: "Ex.: comunitário, assistência à saúde",
      helperText: "Ajuda a orientar o risco de resistência do esquema empírico.",
      fullWidth: true,
      presets: [
        { label: "Comunitário", value: "Comunitário" },
        { label: "Assist. saúde", value: "Assistência à saúde" },
        { label: "Hospitalar", value: "Hospitalar" },
        { label: "UTI", value: "UTI" },
      ],
    },
    {
      id: "dialysisMode",
      section: "Hipótese infecciosa",
      label: "Diálise",
      value: session.assessment.dialysisMode,
      placeholder: "Ex.: não",
      helperText: "Usado para ajuste automático quando houver referência para hemodiálise.",
      presets: [
        { label: "Não", value: "Não" },
        { label: "HD", value: "Hemodiálise" },
      ],
    },
    {
      id: "temperature",
      section: "Sinais vitais",
      label: "Temperatura (°C)",
      value: session.assessment.temperature,
      placeholder: "Ex.: 39,2",
      keyboardType: "numeric" as const,
      helperText: "Temperatura aferida na avaliação inicial.",
      presets: [
        { label: "35", value: "35,0" },
        { label: "37", value: "37,0" },
        { label: "39", value: "39,0" },
        { label: "40", value: "40,0" },
      ],
    },
    {
      id: "respiratoryRate",
      section: "Sinais vitais",
      label: "FR (irpm)",
      value: session.assessment.respiratoryRate,
      placeholder: "Ex.: 32",
      keyboardType: "numeric" as const,
      helperText: "Frequência respiratória na avaliação inicial.",
      presets: [
        { label: "18", value: "18" },
        { label: "24", value: "24" },
        { label: "30", value: "30" },
        { label: "40", value: "40" },
      ],
    },
    {
      id: "respiratoryPattern",
      section: "Sinais vitais",
      label: "Padrão respiratório",
      value: session.assessment.respiratoryPattern,
      placeholder: "Ex.: taquipneico, esforço",
      helperText: "Descrição curta do padrão ventilatório.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Eupneico", value: "Eupneico" },
        { label: "Taquipneico", value: "Taquipneico" },
        { label: "Esforço", value: "Esforço respiratório" },
        { label: "Uso de musculatura", value: "Uso de musculatura acessória" },
      ],
    },
    {
      id: "mentalStatus",
      section: "Perfusão e gravidade",
      label: "Estado mental",
      value: session.assessment.mentalStatus,
      placeholder: "Ex.: alerta, confuso, rebaixado",
      helperText: "Descrição curta do estado neurológico inicial.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Alerta", value: "Alerta" },
        { label: "Confuso", value: "Confusão" },
        { label: "Sonolento", value: "Sonolento" },
        { label: "Rebaixado", value: "Rebaixado" },
      ],
    },
    {
      id: "capillaryRefill",
      section: "Perfusão e gravidade",
      label: "Enchimento capilar",
      value: session.assessment.capillaryRefill,
      placeholder: "Ex.: normal, lento, > 3 s",
      helperText: "Avaliação periférica simples de perfusão.",
      presets: [
        { label: "Normal", value: "Normal" },
        { label: "Lento", value: "Lento" },
        { label: "> 3 s", value: "> 3 s" },
      ],
    },
    {
      id: "urineOutput",
      section: "Perfusão e gravidade",
      label: "Diurese / débito urinário",
      value: session.assessment.urineOutput,
      placeholder: "Ex.: preservada, reduzida, oligúria",
      helperText: "Achado clínico inicial de perfusão renal.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Preservada", value: "Preservada" },
        { label: "Reduzida", value: "Reduzida" },
        { label: "Oligúria", value: "Oligúria" },
        { label: "Anúria", value: "Anúria" },
      ],
    },
  ];
}

function buildInitialExamFields() {
  return [
    {
      id: "systolicPressure",
      section: "Perfusão e gravidade",
      label: "PAS (mmHg)",
      value: session.assessment.systolicPressure,
      placeholder: "Ex.: 82",
      keyboardType: "numeric" as const,
      helperText: "Pressão arterial sistólica.",
      presets: [
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
      ],
    },
    {
      id: "diastolicPressure",
      section: "Perfusão e gravidade",
      label: "PAD (mmHg)",
      value: session.assessment.diastolicPressure,
      placeholder: "Ex.: 46",
      keyboardType: "numeric" as const,
      helperText: "Pressão arterial diastólica.",
      presets: [
        { label: "40", value: "40" },
        { label: "50", value: "50" },
        { label: "60", value: "60" },
        { label: "70", value: "70" },
      ],
    },
    {
      id: "hypoperfusionSigns",
      section: "Perfusão e gravidade",
      label: "Sinais de hipoperfusão",
      value: session.assessment.hypoperfusionSigns,
      placeholder: "Ex.: confusão, oligúria, TEC lento",
      helperText: "Campo curto com os achados clínicos mais relevantes.",
      fullWidth: true,
      presetMode: "toggle_token" as const,
      presets: [
        { label: "Confusão", value: "Confusão" },
        { label: "Oligúria", value: "Oligúria" },
        { label: "TEC lento", value: "TEC lento" },
        { label: "Extremidades frias", value: "Extremidades frias" },
        { label: "Pele moteada", value: "Pele moteada" },
        { label: "Sem sinais", value: "Sem sinais claros" },
      ],
    },
  ];
}

function buildAntimicrobialContextFields() {
  return [
    {
      id: "mdrRisk",
      section: "Contexto antimicrobiano",
      label: "Risco de MDR",
      value: session.assessment.mdrRisk,
      placeholder: "Ex.: baixo",
      helperText: "Usar o contexto clínico e epidemiológico local.",
      presets: [
        { label: "Baixo", value: "Baixo" },
        { label: "Alto", value: "Alto" },
      ],
    },
    {
      id: "mrsaRisk",
      section: "Contexto antimicrobiano",
      label: "Risco de MRSA",
      value: session.assessment.mrsaRisk,
      placeholder: "Ex.: não",
      helperText: "Marcar quando houver fatores de risco para cobertura anti-MRSA.",
      presets: [
        { label: "Não", value: "Não" },
        { label: "Sim", value: "Sim" },
      ],
    },
    {
      id: "betaLactamAllergy",
      section: "Contexto antimicrobiano",
      label: "Alergia a beta-lactâmico",
      value: session.assessment.betaLactamAllergy,
      placeholder: "Ex.: não",
      helperText: "Impacta a escolha do esquema empírico.",
      presets: [
        { label: "Não", value: "Não" },
        { label: "Sim", value: "Sim" },
      ],
    },
  ];
}

function buildLaboratoryFields() {
  return [
    {
      id: "lactateValue",
      section: "Exames",
      label: "Lactato",
      value: session.assessment.lactateValue,
      unit: session.assessment.lactateUnit,
      unitOptions: [
        { label: "mmol/L", value: "mmol/L" },
        { label: "mg/dL", value: "mg/dL" },
      ],
      placeholder: "Ex.: 4,2",
      keyboardType: "numeric" as const,
      helperText: "Conversão automática para interpretação clínica.",
      presets: getLactatePresets(session.assessment.lactateUnit),
    },
    {
      id: "creatinineValue",
      section: "Exames",
      label: "Creatinina",
      value: session.assessment.creatinineValue,
      unit: session.assessment.creatinineUnit,
      unitOptions: [
        { label: "mg/dL", value: "mg/dL" },
        { label: "µmol/L", value: "µmol/L" },
      ],
      placeholder: "Ex.: 2,0",
      keyboardType: "numeric" as const,
      helperText: "Conversão automática para interpretação clínica.",
      presets: getCreatininePresets(session.assessment.creatinineUnit),
    },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId === "concluido") {
    return null;
  }

  if (session.currentStateId === "dados_iniciais_paciente") {
    return {
      title: "Dados do paciente",
      description: "Registrar os achados principais do exame clínico inicial e dos sinais vitais.",
      fields: [...buildPatientAssessmentFields(), ...buildInitialExamFields()],
      metrics: [
        {
          label: "PAM calculada",
          value: getCalculatedMap() !== null ? `${Math.round(getCalculatedMap()!)} mmHg` : "Não calculada",
        },
        {
          label: "Gravidade sugerida",
          value: getScenarioSuggestionLabel(),
        },
      ],
      actions: [],
    };
  }

  if (session.currentStateId === "bundle_primeira_hora") {
    const antimicrobialRecommendation = getAntimicrobialRecommendation();
    return {
      title: "Bundle da primeira hora",
      description: "Marcar cada item do bundle e revisar o contexto antimicrobiano do caso atual.",
      fields: buildAntimicrobialContextFields(),
      metrics: [
        { label: "Foco dominante", value: getDominantSourceLabel() },
        { label: "Risco MDR", value: session.assessment.mdrRisk || "Não definido" },
        { label: "Risco MRSA", value: session.assessment.mrsaRisk || "Não definido" },
        { label: "Diálise", value: session.assessment.dialysisMode || "Não definida" },
        { label: "ClCr estimado", value: getEstimatedCrCl() !== null ? `${getEstimatedCrCl()} mL/min` : "Não calculado" },
        {
          label: "Disfunção renal",
          value: antimicrobialRecommendation.renalAdjustmentRequired ? "Sugerida" : "Sem sinal forte",
        },
      ],
      statusItems: buildBundleStatusItems(),
      recommendations: buildAntimicrobialRecommendationCards(),
      actions: [],
    };
  }

  if (session.currentStateId === "ressuscitacao_hemodinamica") {
    return {
      title: "Ressuscitação hemodinâmica",
      description: "Revisar perfusão, pressão arterial, lactato, creatinina e sinais clínicos.",
      fields: [...buildInitialExamFields(), ...buildLaboratoryFields()],
      metrics: [],
      actions: [],
    };
  }

  if (session.currentStateId === "choque_septico") {
    return {
      title: "Choque séptico",
      description: "Registrar suporte hemodinâmico e escalar vasopressor quando necessário.",
      fields: [...buildInitialExamFields(), ...buildLaboratoryFields()],
      metrics: [],
      statusItems: buildBundleStatusItems().filter((item) => item.id === "fluidos" || item.id === "vasopressor"),
      actions: [
        ...(session.septicShockRecognized &&
        !session.vasopressinSuggested &&
        session.bundle.vasopressor !== "pendente"
          ? [{ id: "suggest_vasopressin", label: "Sugerir vasopressina", requiresConfirmation: true }]
          : []),
        ...(session.septicShockRecognized && !session.inotropeConsidered
          ? [{ id: "consider_inotrope", label: "Considerar inotrópico", requiresConfirmation: true }]
          : []),
      ],
    };
  }

  if (session.currentStateId === "reavaliacao_continua") {
    return {
      title: "Reavaliação clínica",
      description: "Conferir resposta clínica, pendências do bundle e necessidade de nova intervenção.",
      fields: [...buildInitialExamFields(), ...buildLaboratoryFields()],
      metrics: [
        { label: "Perfusão", value: getPerfusionLabel() },
        { label: "PAM", value: getCalculatedMap() !== null ? `${Math.round(getCalculatedMap()!)} mmHg` : getMapLabel() },
        { label: "Achados críticos", value: getAssessmentSummary() },
        { label: "Bundle pendente", value: String(getPendingBundleCount()) },
      ],
      actions: [],
    };
  }

  if (session.currentStateId === "source_control") {
    return {
      title: "Controle de foco",
      description: "Revisar o foco infeccioso provável e marcar o que já foi abordado.",
      fields: [],
      metrics: [],
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
    return updateAuxiliaryField(fieldId, toggleTokenValue(session.assessment[fieldId as keyof Session["assessment"]], value));
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
        ? `Faça cristalóide 30 mililitros por quilo. ${getInitialCrystalloidVolumeLabel()}`
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
};
