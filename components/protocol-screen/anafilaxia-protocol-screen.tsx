import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type {
  AuxiliaryPanel,
  ClinicalLogEntry,
  EncounterSummary,
  ProtocolState,
} from "../../clinical-engine";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";

type Props = {
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  canGoBack: boolean;
  clinicalLog: ClinicalLogEntry[];
  encounterSummary: EncounterSummary;
  options: string[];
  state: ProtocolState;
  isCurrentStateTimerRunning: boolean;
  actionButtonLabel: string;
  onFieldChange: (fieldId: string, value: string) => void;
  onPresetApply: (fieldId: string, value: string) => void;
  onUnitChange: (fieldId: string, unit: string) => void;
  onActionRun: (actionId: string, requiresConfirmation?: boolean) => void;
  onStatusChange: (
    itemId: string,
    status: "pendente" | "solicitado" | "realizado",
    requiresConfirmation?: boolean
  ) => void;
  onGoBack: () => void;
  onConfirmAction: () => void;
  onRunTransition: (input?: string) => void;
  onExportSummary: () => void;
  onPrintReport: () => void;
};

type StepId =
  | "suspicion"
  | "recognition"
  | "epinephrine"
  | "support"
  | "reassessment"
  | "escalation"
  | "refractory"
  | "adjuncts"
  | "disposition";

type StepDefinition = {
  id: StepId;
  title: string;
  hint: string;
};

type NumericPickerFieldId = "age" | "weightKg" | "systolicPressure" | "diastolicPressure" | "spo2";

const STEPS: StepDefinition[] = [
  { id: "suspicion", title: "Suspeita de anafilaxia?", hint: "Comece com uma decisão simples." },
  {
    id: "recognition",
    title: "Reconhecimento",
    hint: "Marque achados e deixe o módulo inferir a probabilidade.",
  },
  {
    id: "epinephrine",
    title: "Adrenalina IM agora",
    hint: "A ação central desta etapa é epinefrina intramuscular.",
  },
  {
    id: "support",
    title: "Suporte inicial",
    hint: "Oxigênio, acesso, monitorização e volume conforme gravidade.",
  },
  {
    id: "reassessment",
    title: "Reavaliar em 5 minutos",
    hint: "Decida rápido se melhorou ou não.",
  },
  {
    id: "escalation",
    title: "Escalonar",
    hint: "Sem resposta adequada: repetir adrenalina IM e expandir volume.",
  },
  {
    id: "refractory",
    title: "Refratário",
    hint: "Manter tudo dentro do próprio módulo, sem abrir telas externas.",
  },
  {
    id: "adjuncts",
    title: "Adjuvantes",
    hint: "Medicações secundárias só depois das medidas que salvam vida.",
  },
  {
    id: "disposition",
    title: "Destino",
    hint: "Defina observação, local e orientações finais.",
  },
];

const RECOGNITION_PRESETS = [
  "Urticária / eritema / prurido",
  "Angioedema",
  "Dispneia / broncoespasmo",
  "Estridor / edema de glote",
  "Náuseas / vómitos / dor abdominal / diarreia",
  "Síncope / pré-síncope",
  "Pulso filiforme / extremidades frias",
  "Rebaixamento do nível de consciência",
];

const AIRWAY_PRESETS = [
  "Máscara com reservatório 10–15 L/min",
  "Cânula nasal de alto fluxo 40–60 L/min",
  "Ventilação com bolsa-válvula-máscara mantida",
];

const ACCESS_PRESETS = [
  "Acesso periférico 18G",
  "2 acessos periféricos ≥ 16G",
  "Acesso intraósseo (IO)",
];

const MONITORING_PRESETS = ["SpO₂ contínua", "FC contínua", "PA a cada 2–3 min", "ECG contínuo"];

const REFRACTORY_AIRWAY_PRESETS = [
  "Preparar sequência rápida para IOT",
  "Intubação orotraqueal realizada",
  "Máscara laríngea posicionada com ventilação efetiva",
  "Cricotireoidostomia realizada",
];

const NUMERIC_PICKER_CONFIG: Record<
  NumericPickerFieldId,
  { label: string; placeholder: string; options: string[]; keyboardType?: "numeric" }
> = {
  age: {
    label: "Idade (anos)",
    placeholder: "Selecionar idade",
    options: ["18", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80"],
    keyboardType: "numeric",
  },
  weightKg: {
    label: "Peso (kg)",
    placeholder: "Selecionar peso",
    options: ["20", "30", "40", "50", "60", "70", "80", "90", "100", "120", "140"],
    keyboardType: "numeric",
  },
  systolicPressure: {
    label: "PAS",
    placeholder: "Selecionar PAS",
    options: ["60", "70", "80", "90", "100", "110", "120", "130", "140", "150", "160", "180", "200"],
    keyboardType: "numeric",
  },
  diastolicPressure: {
    label: "PAD",
    placeholder: "Selecionar PAD",
    options: ["30", "40", "50", "60", "70", "80", "90", "100", "110", "120"],
    keyboardType: "numeric",
  },
  spo2: {
    label: "SpO₂ (%)",
    placeholder: "Selecionar SpO₂",
    options: ["88", "90", "92", "94", "95", "96", "98", "100"],
    keyboardType: "numeric",
  },
};

const MONITORING_PRESET_MAP = [
  { match: ["ecg contínuo"], value: "ECG contínuo" },
  { match: ["spo₂ contínua", "spo2 contínua"], value: "SpO₂ contínua" },
  { match: ["fc", "frequência cardíaca"], value: "FC contínua" },
  { match: ["pa não invasiva a cada 2–3 min", "pa não invasiva a cada 2-3 min"], value: "PA a cada 2–3 min" },
  { match: ["pa não invasiva seriada", "pa seriada", "5–10 min", "5-10 min"], value: "PA a cada 5 min" },
  { match: ["fr"], value: "FR seriada" },
  { match: ["diurese"], value: "Diurese horária (sondagem)" },
  { match: ["capnografia", "etco₂", "etco2"], value: "Capnografia EtCO₂ (IOT)" },
  { match: ["temperatura"], value: "Temperatura seriada" },
  { match: ["glasgow"], value: "Glasgow seriado" },
];

const FLUID_PRESET_MAP = [
  { match: ["sem bolus"], value: "Sem bolus — estável" },
  { match: ["ringer lactato", "1600 ml", "20 ml/kg"], value: "20 mL/kg em bolus" },
  { match: ["ringer lactato", "500 ml"], value: "Ringer lactato 500 mL em bolus" },
  { match: ["ringer lactato", "1000 ml"], value: "Ringer lactato 1000 mL em bolus" },
  { match: ["ringer lactato", "2000 ml"], value: "Ringer lactato 2000 mL (choque grave)" },
  { match: ["sf 0,9%", "500 ml"], value: "SF 0,9% 500 mL em bolus" },
  { match: ["sf 0,9%", "1000 ml"], value: "SF 0,9% 1000 mL em bolus" },
  { match: ["manutenção", "125 ml/h"], value: "Manutenção EV 125 mL/h após estabilização" },
];

type GcsOption = { score: number; label: string; detail: string };

const GCS_EYE_OPTIONS: GcsOption[] = [
  { score: 4, label: "4", detail: "Abre os olhos espontaneamente" },
  { score: 3, label: "3", detail: "Abre os olhos ao comando / voz" },
  { score: 2, label: "2", detail: "Abre os olhos à dor" },
  { score: 1, label: "1", detail: "Não abre os olhos" },
];

const GCS_VERBAL_OPTIONS: GcsOption[] = [
  { score: 5, label: "5", detail: "Orientado, conversa normal" },
  { score: 4, label: "4", detail: "Confuso, mas fala frases" },
  { score: 3, label: "3", detail: "Palavras inapropriadas" },
  { score: 2, label: "2", detail: "Sons incompreensíveis" },
  { score: 1, label: "1", detail: "Sem resposta verbal" },
];

const GCS_MOTOR_OPTIONS: GcsOption[] = [
  { score: 6, label: "6", detail: "Obedece comandos" },
  { score: 5, label: "5", detail: "Localiza a dor" },
  { score: 4, label: "4", detail: "Retirada à dor" },
  { score: 3, label: "3", detail: "Flexão anormal" },
  { score: 2, label: "2", detail: "Extensão anormal" },
  { score: 1, label: "1", detail: "Sem resposta motora" },
];

function parseNum(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getStepIndex(stepId: StepId) {
  return STEPS.findIndex((step) => step.id === stepId);
}

function splitTokens(value: string) {
  return value
    .split(" | ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function includesToken(value: string, token: string) {
  return splitTokens(value).some((item) => item.toLowerCase() === token.toLowerCase());
}

function containsAny(value: string, options: string[]) {
  const lower = value.toLowerCase();
  return options.some((item) => lower.includes(item.toLowerCase()));
}

function uniqueTokens(tokens: string[]) {
  return [...new Set(tokens.filter(Boolean))];
}

function inferAirwayTokens(suggestion: string) {
  const lower = suggestion.toLowerCase();
  const tokens: string[] = [];

  if (lower.includes("máscara com reservatório")) tokens.push("Máscara com reservatório 10–15 L/min");
  if (lower.includes("cateter nasal")) tokens.push("Cateter nasal 2–5 L/min");
  if (lower.includes("alto fluxo")) tokens.push("Cânula nasal de alto fluxo 40–60 L/min");
  if (lower.includes("sem o₂") || lower.includes("sem o2")) tokens.push("Sem O₂ adicional — SpO₂ adequada");
  if (lower.includes("intubação orotraqueal")) tokens.push("Preparar sequência rápida para IOT");
  if (lower.includes("ventilação mecânica")) tokens.push("Ventilação com bolsa-válvula-máscara mantida");
  if (lower.includes("via aérea avançada de prontidão")) tokens.push("Via aérea de prontidão; monitorar evolução");
  if (lower.includes("bvm")) tokens.push("BVM em standby");

  return uniqueTokens(tokens);
}

function inferRefractoryAirwayTokens(suggestion: string) {
  const lower = suggestion.toLowerCase();
  const tokens: string[] = [];

  if (lower.includes("intubação orotraqueal") || lower.includes("sequência rápida")) {
    tokens.push("Preparar sequência rápida para IOT");
  }
  if (lower.includes("ventilação mecânica")) {
    tokens.push("Ventilação com bolsa-válvula-máscara mantida");
  }
  if (lower.includes("máscara laríngea")) {
    tokens.push("Máscara laríngea posicionada com ventilação efetiva");
  }
  if (lower.includes("cricotireoidostomia")) {
    tokens.push("Cricotireoidostomia realizada");
  }

  return uniqueTokens(tokens);
}

function inferIvAccessTokens(suggestion: string) {
  const lower = suggestion.toLowerCase();
  const tokens: string[] = [];

  if (lower.includes("dois acessos") || lower.includes("2 acessos")) tokens.push("2 acessos periféricos ≥ 16G");
  if (lower.includes("único") || lower.includes("unico") || lower.includes("18g")) tokens.push("Acesso periférico 18G");
  if (lower.includes("16g") && !tokens.includes("2 acessos periféricos ≥ 16G")) tokens.push("Acesso periférico 16G");
  if (lower.includes("intraósseo") || lower.includes("io")) tokens.push("Acesso intraósseo (IO)");

  return uniqueTokens(tokens);
}

function inferVasopressorTokens(suggestion: string) {
  const lower = suggestion.toLowerCase();
  const tokens: string[] = [];

  if (lower.includes("adrenalina ev")) tokens.push("Adrenalina EV 0,05–0,1 mcg/kg/min (infusão)");
  if (lower.includes("noradrenalina")) tokens.push("Noradrenalina EV 0,1–0,3 mcg/kg/min (2ª linha)");
  if (lower.includes("dopamina")) tokens.push("Dopamina EV 5–20 mcg/kg/min");
  if (lower.includes("vasopressina")) tokens.push("Vasopressina 0,03 U/min EV (refratário)");
  if (lower.includes("glucagon")) tokens.push("Glucagon 1–2 mg EV/IM (betabloqueador)");
  if (lower.includes("fenilefrina") || lower.includes("metoxamina")) {
    tokens.push("Fenilefrina / Metoxamina (vasopressor puro)");
  }
  if (lower.includes("não indicado")) tokens.push("Não indicado");

  return uniqueTokens(tokens);
}

function inferMonitoringTokens(suggestion: string) {
  const lower = suggestion.toLowerCase();
  return uniqueTokens(
    MONITORING_PRESET_MAP.filter((entry) => entry.match.some((item) => lower.includes(item))).map((entry) => entry.value)
  );
}

function inferFluidTokens(suggestion: string) {
  const lower = suggestion.toLowerCase();
  const directMatches = FLUID_PRESET_MAP.filter((entry) => entry.match.every((item) => lower.includes(item))).map(
    (entry) => entry.value
  );

  return uniqueTokens(directMatches);
}

function extractFluidVolumeMl(text: string) {
  const match = text.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*ml/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveSuggestedFluidValues(
  fluidSuggestion: string,
  fieldPresets: { label: string; value: string }[] | undefined
) {
  const lowerSuggestion = fluidSuggestion.toLowerCase();
  const fluidTokens = inferFluidTokens(fluidSuggestion);
  const suggestedVolumeMl = extractFluidVolumeMl(fluidSuggestion);

  const fluidPresetMatches = findPresetValues(fieldPresets, (presetText) => {
    if (lowerSuggestion.includes("sem bolus")) {
      return presetText.includes("sem bolus");
    }

    if (lowerSuggestion.includes("20 ml/kg")) {
      return presetText.includes("20 ml/kg");
    }

    if (suggestedVolumeMl !== null && presetText.includes(`≈ ${Math.round(suggestedVolumeMl)} ml`)) {
      return true;
    }

    if (lowerSuggestion.includes("ringer lactato")) {
      if (presetText.includes("20 ml/kg")) {
        return true;
      }
      if (suggestedVolumeMl !== null) {
        if (suggestedVolumeMl >= 1800) return presetText.includes("ringer lactato") && presetText.includes("2000");
        if (suggestedVolumeMl >= 900) return presetText.includes("ringer lactato") && presetText.includes("1000");
        return presetText.includes("ringer lactato") && presetText.includes("500");
      }
      return presetText.includes("ringer lactato");
    }

    if (lowerSuggestion.includes("sf 0,9%")) {
      if (suggestedVolumeMl !== null) {
        if (suggestedVolumeMl >= 900) return presetText.includes("sf 0,9%") && presetText.includes("1000");
        return presetText.includes("sf 0,9%") && presetText.includes("500");
      }
      return presetText.includes("sf 0,9%");
    }

    return false;
  });

  return uniqueTokens([...fluidPresetMatches, ...fluidTokens]);
}

function findPresetValues(fieldPresets: { label: string; value: string }[] | undefined, matcher: (text: string) => boolean) {
  if (!fieldPresets) {
    return [];
  }

  return fieldPresets.filter((preset) => matcher(`${preset.label} ${preset.value}`.toLowerCase())).map((preset) => preset.value);
}

function suggestedImDose(weightKg: string) {
  const weight = parseNum(weightKg);
  if (weight && weight > 0 && weight < 300) {
    return (Math.round(Math.min(weight * 0.01, 0.5) * 100) / 100).toFixed(2).replace(".", ",");
  }

  return "0,5";
}

function buildRecognitionSummary(
  symptoms: string,
  systolicPressure: string,
  spo2: string,
  exposureType: string,
  classificationMetric: string
) {
  const sbp = parseNum(systolicPressure);
  const oxygen = parseNum(spo2);
  const lowerSymptoms = symptoms.toLowerCase();
  const lowerExposure = exposureType.toLowerCase();
  const lowerMetric = classificationMetric.toLowerCase();

  const skin = containsAny(lowerSymptoms, ["urticária", "eritema", "prurido", "angioedema"]);
  const respiratory = containsAny(lowerSymptoms, [
    "dispneia",
    "broncoespasmo",
    "estridor",
    "edema de glote",
    "obstrução de via aérea",
  ]);
  const gastrointestinal = containsAny(lowerSymptoms, ["náusea", "vómitos", "dor abdominal", "diarreia"]);
  const circulation =
    containsAny(lowerSymptoms, ["síncope", "pré-síncope", "pulso filiforme", "extremidades frias"]) ||
    (sbp !== null && sbp < 90);
  const lowOxygen = oxygen !== null && oxygen < 92;
  const immediateTrigger = Boolean(lowerExposure && !lowerExposure.includes("desconhecido"));

  const positiveSignals = [skin, respiratory, gastrointestinal, circulation, lowOxygen, immediateTrigger].filter(
    Boolean
  ).length;

  const probable =
    lowerMetric.includes("anafilaxia") ||
    (skin && (respiratory || circulation || gastrointestinal)) ||
    respiratory ||
    circulation ||
    lowOxygen ||
    positiveSignals >= 3;

  return {
    probable,
    skin,
    respiratory,
    gastrointestinal,
    circulation,
    lowOxygen,
    positiveSignals,
  };
}

function buildRecognitionAlert(classificationMetric: string, probable: boolean) {
  const normalizedMetric = classificationMetric.trim();
  const lowerMetric = normalizedMetric.toLowerCase();

  if (lowerMetric.includes("choque anafil")) {
    return {
      title: normalizedMetric,
      text: "Há critérios de choque anafilático nesta avaliação. Priorize adrenalina IM imediata, expansão volêmica e suporte avançado sem atraso.",
    };
  }

  if (lowerMetric.includes("grau") && lowerMetric.includes("anafil")) {
    return {
      title: normalizedMetric,
      text: "A classificação já fechou anafilaxia nesta etapa. Mantenha a conduta compatível com a gravidade e não espere novos dados para iniciar tratamento.",
    };
  }

  if (probable) {
    return {
      title: "Provável anafilaxia",
      text: "Há elementos suficientes para tratar como anafilaxia. Não espere mais dados para fazer adrenalina IM.",
    };
  }

  return {
    title: "Dados ainda insuficientes",
    text: "Se houver progressão respiratória, hipotensão ou combinação de pele com outro sistema, trate como anafilaxia.",
  };
}

function renderSummaryRow(label: string, value: string) {
  return (
    <View key={label} style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value || "—"}</Text>
    </View>
  );
}

export default function AnafilaxiaProtocolScreen(props: Props) {
  const {
    auxiliaryPanel,
    encounterSummary,
    state,
    onFieldChange,
    onPresetApply,
    onConfirmAction,
    onGoBack,
  } = props;

  const initialStepIndex = getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0;
  const [activeStepIndex, setActiveStepIndex] = useState(initialStepIndex);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [showGcsModal, setShowGcsModal] = useState(false);
  const [gcsEye, setGcsEye] = useState<number | null>(null);
  const [gcsVerbal, setGcsVerbal] = useState<number | null>(null);
  const [gcsMotor, setGcsMotor] = useState<number | null>(null);
  const [numericPickerField, setNumericPickerField] = useState<NumericPickerFieldId | null>(null);
  const [numericPickerSearch, setNumericPickerSearch] = useState("");
  const [numericPickerCustomValue, setNumericPickerCustomValue] = useState("");

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab: activeStepIndex });
  }, [activeStepIndex, encounterSummary.protocolId]);

  const currentStep = STEPS[activeStepIndex] ?? STEPS[0];
  const fv = (fieldId: string) => auxiliaryPanel?.fields.find((field) => field.id === fieldId)?.value ?? "";
  const fieldDef = (fieldId: string) => auxiliaryPanel?.fields.find((field) => field.id === fieldId);
  const suggestedValue = (fieldId: string) => fieldDef(fieldId)?.suggestedValue ?? "";
  const metricValue = (label: string) =>
    auxiliaryPanel?.metrics.find((metric) => metric.label === label)?.value ?? "";

  const classification = metricValue("Classificação");
  const immediateConduct = metricValue("Conduta imediata");
  const bpMetric = metricValue("PA (PAS/PAD)");
  const mapMetric = metricValue("PAM");
  const probableRecognition = buildRecognitionSummary(
    fv("symptoms"),
    fv("systolicPressure"),
    fv("spo2"),
    fv("exposureType"),
    classification
  );
  const adrenalineRecorded = fv("treatmentAdrenaline");
  const hasFirstDose = adrenalineRecorded.toLowerCase().includes("1ª dose");
  const hasSecondDose = adrenalineRecorded.toLowerCase().includes("2ª dose");
  const isEnd = state.type === "end";
  const escalationFluid = suggestedValue("treatmentFluids");
  const refractoryVasopressor = suggestedValue("treatmentVasopressor");
  const refractoryAirway = suggestedValue("treatmentAirway");
  const adjunctSalbutamol = suggestedValue("treatmentSalbutamol");
  const adjunctH1 = suggestedValue("treatmentH1");
  const adjunctCorticoid = suggestedValue("treatmentCorticoid");
  const observationSuggestion = suggestedValue("observationPlan");
  const destinationSuggestion = suggestedValue("destination");
  const dischargeSuggestion = suggestedValue("dischargePlan");
  const examSuggestion = suggestedValue("investigationPlan");
  const gcsTotal =
    gcsEye !== null && gcsVerbal !== null && gcsMotor !== null ? gcsEye + gcsVerbal + gcsMotor : null;
  const recognitionAlert = buildRecognitionAlert(classification, probableRecognition.probable);
  const numericPickerConfig = numericPickerField ? NUMERIC_PICKER_CONFIG[numericPickerField] : null;
  const filteredNumericPickerOptions = numericPickerConfig
    ? numericPickerSearch.trim()
      ? numericPickerConfig.options.filter((option) => option.toLowerCase().includes(numericPickerSearch.toLowerCase()))
      : numericPickerConfig.options
    : [];

  function goTo(stepId: StepId) {
    setShowFinalSummary(false);
    setActiveStepIndex(getStepIndex(stepId));
  }

  function openGcsModal() {
    setGcsEye(null);
    setGcsVerbal(null);
    setGcsMotor(null);
    setShowGcsModal(true);
  }

  function applyGcsScore() {
    if (gcsTotal === null) {
      return;
    }
    onFieldChange("gcs", String(gcsTotal));
    setShowGcsModal(false);
  }

  function openNumericPicker(fieldId: NumericPickerFieldId) {
    setNumericPickerField(fieldId);
    setNumericPickerSearch("");
    setNumericPickerCustomValue("");
  }

  function closeNumericPicker() {
    setNumericPickerField(null);
    setNumericPickerSearch("");
    setNumericPickerCustomValue("");
  }

  function applyNumericPickerValue(value: string) {
    if (!numericPickerField) {
      return;
    }
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return;
    }
    onFieldChange(numericPickerField, normalizedValue);
    closeNumericPicker();
  }

  function toggleTokenField(fieldId: string, token: string) {
    onPresetApply(fieldId, token);
  }

  function applyFirstDose() {
    onPresetApply("treatmentAdrenaline", `${suggestedImDose(fv("weightKg"))} mg IM — 1ª dose`);
  }

  function applySecondDose() {
    onPresetApply("treatmentAdrenaline", `${suggestedImDose(fv("weightKg"))} mg IM — 2ª dose (5 min após)`);
  }

  function markRefractory() {
    onPresetApply("treatmentAdrenaline", "2 doses IM realizadas — sem resposta adequada");
    onFieldChange("clinicalResponse", "Sem resposta — refratário às doses IM");
    goTo("refractory");
  }

  function setImprovedResponse() {
    onFieldChange("clinicalResponse", "Melhora parcial — necessita monitorização");
    goTo("adjuncts");
  }

  function setNotImprovedResponse() {
    onFieldChange("clinicalResponse", "Sem resposta — refratário às doses IM");
    goTo("escalation");
  }

  function applyAutomaticSupport() {
    const airwayTokens = inferAirwayTokens(suggestedValue("treatmentAirway"));
    const accessTokens = inferIvAccessTokens(suggestedValue("treatmentIvAccess"));
    const monitoringTokens = inferMonitoringTokens(suggestedValue("treatmentMonitoring"));
    const fluidSuggestion = suggestedValue("treatmentFluids");
    const fluidValues = resolveSuggestedFluidValues(fluidSuggestion, fieldDef("treatmentFluids")?.presets);

    if (airwayTokens.length > 0) {
      onFieldChange("treatmentAirway", airwayTokens.join(" | "));
    }
    if (accessTokens.length > 0) {
      onFieldChange("treatmentIvAccess", accessTokens.join(" | "));
    }
    if (monitoringTokens.length > 0) {
      onFieldChange("treatmentMonitoring", monitoringTokens.join(" | "));
    }
    if (fluidValues.length > 0) {
      onFieldChange("treatmentFluids", fluidValues.join(" | "));
    }
  }

  function applySuggestedFluids(fluidSuggestion: string) {
    const fluidValues = resolveSuggestedFluidValues(fluidSuggestion, fieldDef("treatmentFluids")?.presets);

    if (fluidValues.length > 0) {
      onFieldChange("treatmentFluids", fluidValues.join(" | "));
      return true;
    }

    return false;
  }

  function applySuggestedRefractoryCare() {
    const vasopressorTokens = inferVasopressorTokens(refractoryVasopressor);
    const airwayTokens = inferRefractoryAirwayTokens(refractoryAirway);

    if (vasopressorTokens.length > 0) {
      onFieldChange("treatmentVasopressor", vasopressorTokens.join(" | "));
    }
    if (airwayTokens.length > 0) {
      onFieldChange("treatmentAirway", airwayTokens.join(" | "));
    }
  }

  function applyAutomaticAdjuncts() {
    if (suggestedValue("treatmentSalbutamol")) {
      onFieldChange("treatmentSalbutamol", suggestedValue("treatmentSalbutamol"));
    }
    if (suggestedValue("treatmentH1")) {
      onFieldChange("treatmentH1", suggestedValue("treatmentH1"));
    }
    if (suggestedValue("treatmentCorticoid")) {
      onFieldChange("treatmentCorticoid", suggestedValue("treatmentCorticoid"));
    }
  }

  function applyAutomaticDisposition() {
    if (suggestedValue("investigationPlan")) {
      onFieldChange("investigationPlan", suggestedValue("investigationPlan"));
    }
    if (suggestedValue("observationPlan")) {
      onFieldChange("observationPlan", suggestedValue("observationPlan"));
    }
    if (suggestedValue("destination")) {
      onFieldChange("destination", suggestedValue("destination"));
    }
    if (suggestedValue("dischargePlan")) {
      onFieldChange("dischargePlan", suggestedValue("dischargePlan"));
    }
  }

  const finalSummaryRows = [
    ["Classificação", classification],
    ["Conduta imediata", immediateConduct || "Adrenalina IM"],
    ["PA", bpMetric],
    ["PAM", mapMetric],
    ["Adrenalina", fv("treatmentAdrenaline")],
    ["Suporte", [fv("treatmentAirway"), fv("treatmentIvAccess"), fv("treatmentMonitoring"), fv("treatmentFluids")].filter(Boolean).join(" | ")],
    ["Resposta", fv("clinicalResponse")],
    ["Refratário / vasoativo", [fv("treatmentVasopressor"), fv("treatmentAirway")].filter(Boolean).join(" | ")],
    ["Adjuvantes", [fv("treatmentSalbutamol"), fv("treatmentH1"), fv("treatmentCorticoid")].filter(Boolean).join(" | ")],
    ["Exames", fv("investigationPlan")],
    ["Observação", fv("observationPlan")],
    ["Destino", fv("destination")],
    ["Alta segura", fv("dischargePlan")],
  ];

  if (isEnd) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Anafilaxia</Text>
          <Text style={styles.heroTitle}>Atendimento registrado</Text>
          <Text style={styles.heroHint}>
            O fluxo foi encerrado. Reabra o módulo se precisar reiniciar a sequência.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Anafilaxia</Text>
        <Text style={styles.heroProgress}>
          Passo {activeStepIndex + 1} de {STEPS.length}
        </Text>
        <Text style={styles.heroTitle}>{currentStep.title}</Text>
        <Text style={styles.heroHint}>{currentStep.hint}</Text>
      </View>

      <View style={styles.statusStrip}>
        <View style={styles.statusPill}>
          <Text style={styles.statusLabel}>Classificação</Text>
          <Text style={styles.statusValue}>{classification || "Em avaliação"}</Text>
        </View>
        <View style={[styles.statusPill, styles.statusPillPrimary]}>
          <Text style={styles.statusLabel}>Adrenalina IM</Text>
          <Text style={styles.statusValue}>{adrenalineRecorded || "Ainda não registrada"}</Text>
        </View>
      </View>

      {currentStep.id === "suspicion" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>O quadro sugere reação sistêmica aguda após exposição?</Text>
          <Text style={styles.cardText}>
            Se há pele/mucosa associada a respiração, circulação ou trato gastrointestinal, trate como provável anafilaxia.
          </Text>
          <Pressable style={styles.primaryAction} onPress={() => goTo("recognition")}>
            <Text style={styles.primaryActionText}>Sim, seguir como anafilaxia</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryAction}
            onPress={() => {
              onFieldChange("destination", "Manter avaliação de diagnóstico diferencial");
              goTo("disposition");
            }}>
            <Text style={styles.secondaryActionText}>Não tenho certeza</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "recognition" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reconhecimento</Text>
          <Text style={styles.cardText}>
            Preencha primeiro os dados rápidos para classificação. Depois marque gatilho e achados principais.
          </Text>

          <View style={styles.inlineInputs}>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Idade (anos)</Text>
              <Pressable style={styles.inputButton} onPress={() => openNumericPicker("age")}>
                <Text style={[styles.inputButtonValue, !fv("age") && styles.inputButtonPlaceholder]}>
                  {fv("age") || NUMERIC_PICKER_CONFIG.age.placeholder}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>PAS</Text>
              <Pressable style={styles.inputButton} onPress={() => openNumericPicker("systolicPressure")}>
                <Text style={[styles.inputButtonValue, !fv("systolicPressure") && styles.inputButtonPlaceholder]}>
                  {fv("systolicPressure") || NUMERIC_PICKER_CONFIG.systolicPressure.placeholder}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>PAD</Text>
              <Pressable style={styles.inputButton} onPress={() => openNumericPicker("diastolicPressure")}>
                <Text style={[styles.inputButtonValue, !fv("diastolicPressure") && styles.inputButtonPlaceholder]}>
                  {fv("diastolicPressure") || NUMERIC_PICKER_CONFIG.diastolicPressure.placeholder}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>SpO₂</Text>
              <Pressable style={styles.inputButton} onPress={() => openNumericPicker("spo2")}>
                <Text style={[styles.inputButtonValue, !fv("spo2") && styles.inputButtonPlaceholder]}>
                  {fv("spo2") || NUMERIC_PICKER_CONFIG.spo2.placeholder}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Peso kg</Text>
              <Pressable style={styles.inputButton} onPress={() => openNumericPicker("weightKg")}>
                <Text style={[styles.inputButtonValue, !fv("weightKg") && styles.inputButtonPlaceholder]}>
                  {fv("weightKg") || NUMERIC_PICKER_CONFIG.weightKg.placeholder}
                </Text>
              </Pressable>
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Glasgow</Text>
              <Pressable style={styles.inputButton} onPress={openGcsModal}>
                <Text style={[styles.inputButtonValue, !fv("gcs") && styles.inputButtonPlaceholder]}>
                  {fv("gcs") ? `GCS ${fv("gcs")}` : "Abrir passos do Glasgow"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.summaryBox}>
            {renderSummaryRow("Classificação", classification || "— · Avaliação incompleta")}
            {renderSummaryRow("Conduta imediata", immediateConduct)}
            {renderSummaryRow("PA", bpMetric)}
            {renderSummaryRow("PAM", mapMetric)}
          </View>

          <View style={[styles.alertBox, probableRecognition.probable ? styles.alertDanger : styles.alertNeutral]}>
            <Text style={styles.alertTitle}>{recognitionAlert.title}</Text>
            <Text style={styles.alertText}>{recognitionAlert.text}</Text>
          </View>

          <Text style={styles.inputLabel}>Gatilho</Text>
          <View style={styles.choiceRow}>
            {["Alimento", "Medicamento", "Veneno / inseto", "Desconhecido"].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  fv("exposureType") === option && styles.choiceChipActive,
                ]}
                onPress={() => onFieldChange("exposureType", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    fv("exposureType") === option && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Achados</Text>
          <View style={styles.choiceWrap}>
            {RECOGNITION_PRESETS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("symptoms"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("symptoms", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("symptoms"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.primaryAction} onPress={() => goTo("epinephrine")}>
            <Text style={styles.primaryActionText}>Próximo: adrenalina IM</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "epinephrine" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>A ação central é adrenalina IM</Text>
          <Text style={styles.heroDose}>{suggestedImDose(fv("weightKg"))} mg IM na coxa lateral</Text>
          <Text style={styles.cardText}>
            Adrenalina é a primeira medida que muda desfecho. Anti-histamínico e corticoide não entram antes dela.
          </Text>
          <Pressable style={styles.dangerAction} onPress={applyFirstDose}>
            <Text style={styles.dangerActionText}>
              {hasFirstDose ? "1ª dose já registrada" : "Registrar 1ª dose IM agora"}
            </Text>
          </Pressable>
          <Pressable style={styles.primaryAction} onPress={() => goTo("support")}>
            <Text style={styles.primaryActionText}>Seguir para suporte inicial</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "support" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Suporte inicial</Text>
          <Text style={styles.cardText}>O aplicativo sugere o pacote inicial com base na gravidade e nos sinais já registrados.</Text>

          <View style={styles.summaryBox}>
            {renderSummaryRow("O₂ / via aérea sugeridos", suggestedValue("treatmentAirway"))}
            {renderSummaryRow("Acesso sugerido", suggestedValue("treatmentIvAccess"))}
            {renderSummaryRow("Monitorização sugerida", suggestedValue("treatmentMonitoring"))}
            {renderSummaryRow("Cristalóide sugerido", suggestedValue("treatmentFluids"))}
          </View>

          <Pressable style={styles.primaryAction} onPress={applyAutomaticSupport}>
            <Text style={styles.primaryActionText}>Aplicar suporte sugerido</Text>
          </Pressable>

          <Text style={styles.inputLabel}>Oxigênio / ventilação inicial</Text>
          <View style={styles.choiceWrap}>
            {AIRWAY_PRESETS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("treatmentAirway"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("treatmentAirway", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("treatmentAirway"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Acesso</Text>
          <View style={styles.choiceWrap}>
            {ACCESS_PRESETS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("treatmentIvAccess"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("treatmentIvAccess", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("treatmentIvAccess"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Monitorização</Text>
          <View style={styles.choiceWrap}>
            {MONITORING_PRESETS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("treatmentMonitoring"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("treatmentMonitoring", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("treatmentMonitoring"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.primaryAction}
            onPress={() => {
              if (!fv("treatmentFluids")) {
                applySuggestedFluids(suggestedValue("treatmentFluids"));
              }
              goTo("reassessment");
            }}>
            <Text style={styles.primaryActionText}>Reavaliar em 5 minutos</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "reassessment" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Houve melhora clínica?</Text>
          <Text style={styles.cardText}>
            Reavalie perfusão, trabalho respiratório, estridor, sibilância e pressão arterial.
          </Text>
          <Pressable style={styles.primaryAction} onPress={setImprovedResponse}>
            <Text style={styles.primaryActionText}>Melhorou</Text>
          </Pressable>
          <Pressable style={styles.dangerAction} onPress={setNotImprovedResponse}>
            <Text style={styles.dangerActionText}>Não melhorou</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "escalation" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Escalonar agora</Text>
          <Text style={styles.heroDose}>{suggestedImDose(fv("weightKg"))} mg IM novamente</Text>
          <Text style={styles.cardText}>
            Sem resposta rápida: repetir adrenalina IM e ampliar volume. Depois reavaliar sem demora.
          </Text>
          <View style={styles.summaryBox}>
            {renderSummaryRow("Cristalóide indicado agora", escalationFluid)}
          </View>
          <Text style={styles.cardText}>
            Expanda em alíquotas com reavaliação clínica e hemodinâmica após cada etapa. Em cardiopatia, disfunção renal,
            extremos de idade ou risco de congestão, prefira volumes menores e titulação mais estreita.
          </Text>
          <Pressable style={styles.dangerAction} onPress={applySecondDose}>
            <Text style={styles.dangerActionText}>
              {hasSecondDose ? "2ª dose já registrada" : "Registrar 2ª dose IM"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.primaryAction}
            onPress={() => applySuggestedFluids(escalationFluid)}>
            <Text style={styles.primaryActionText}>Aplicar cristalóide e volume sugeridos</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => goTo("reassessment")}>
            <Text style={styles.secondaryActionText}>Voltar para reavaliação</Text>
          </Pressable>
          <Pressable style={styles.ghostAction} onPress={markRefractory}>
            <Text style={styles.ghostActionText}>Permanece refratário após duas doses</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "refractory" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manejo refratário dentro do módulo</Text>
          <Text style={styles.cardText}>
            Se não respondeu a duas doses IM e volume, avance para adrenalina EV titulada, vasopressor e estratégia de via aérea.
          </Text>

          <View style={styles.summaryBox}>
            {renderSummaryRow("Melhor vasoativo agora", refractoryVasopressor)}
            {renderSummaryRow("Melhor estratégia de via aérea", refractoryAirway)}
          </View>

          <Pressable
            style={styles.primaryAction}
            onPress={applySuggestedRefractoryCare}>
            <Text style={styles.primaryActionText}>Aplicar conduta refratária sugerida</Text>
          </Pressable>

          <Text style={styles.inputLabel}>Vasopressor / infusão</Text>
          <View style={styles.choiceWrap}>
            {[
              "Adrenalina EV 0,05–0,1 mcg/kg/min (infusão)",
              "Noradrenalina EV 0,1–0,3 mcg/kg/min (2ª linha)",
              "Glucagon 1–2 mg EV/IM (betabloqueador)",
            ].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("treatmentVasopressor"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("treatmentVasopressor", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("treatmentVasopressor"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Via aérea</Text>
          <View style={styles.choiceWrap}>
            {REFRACTORY_AIRWAY_PRESETS.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("treatmentAirway"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("treatmentAirway", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("treatmentAirway"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.primaryAction} onPress={() => goTo("adjuncts")}>
            <Text style={styles.primaryActionText}>Seguir após suporte avançado</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "adjuncts" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adjuvantes ficam em segundo plano</Text>
          <Text style={styles.cardText}>
            Só use depois de adrenalina, suporte e reavaliação. O app prioriza o que faz sentido no contexto atual.
          </Text>

          <View style={styles.summaryBox}>
            {renderSummaryRow("Broncoespasmo", adjunctSalbutamol)}
            {renderSummaryRow("Anti-H1", adjunctH1)}
            {renderSummaryRow("Corticoide", adjunctCorticoid)}
          </View>

          <Pressable style={styles.primaryAction} onPress={applyAutomaticAdjuncts}>
            <Text style={styles.primaryActionText}>Aplicar adjuvantes sugeridos</Text>
          </Pressable>

          <Text style={styles.inputLabel}>Broncoespasmo</Text>
          <View style={styles.choiceWrap}>
            {[
              "Salbutamol nebulizado 5 mg — dose plena",
              "Ipratrópio 0,5 mg nebulizado associado",
            ].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  includesToken(fv("treatmentSalbutamol"), option) && styles.choiceChipActive,
                ]}
                onPress={() => toggleTokenField("treatmentSalbutamol", option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    includesToken(fv("treatmentSalbutamol"), option) && styles.choiceChipTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Anti-H1 / corticoide</Text>
          <View style={styles.choiceWrap}>
            {[
              { fieldId: "treatmentH1", value: "Cetirizina 10 mg VO após estabilização" },
              { fieldId: "treatmentH1", value: "Difenidramina 25–50 mg EV/IM (adjuvante, sedante)" },
              { fieldId: "treatmentCorticoid", value: "Hidrocortisona 200 mg EV (adjuvante)" },
              { fieldId: "treatmentCorticoid", value: "Metilprednisolona 1–2 mg/kg EV (máx 125 mg)" },
            ].map((option) => {
              const active = includesToken(fv(option.fieldId), option.value);
              return (
                <Pressable
                  key={`${option.fieldId}-${option.value}`}
                  style={[styles.choiceChip, active && styles.choiceChipActive]}
                  onPress={() => toggleTokenField(option.fieldId, option.value)}>
                  <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                    {option.value}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.primaryAction} onPress={() => goTo("disposition")}>
            <Text style={styles.primaryActionText}>Definir destino</Text>
          </Pressable>
        </View>
      ) : null}

      {currentStep.id === "disposition" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destino e observação</Text>
          <Text style={styles.cardText}>
            O fechamento segue a lógica do atendimento: exames indicados, observação, destino e alta segura.
          </Text>

          <View style={styles.summaryBox}>
            {renderSummaryRow("Exames indicados", examSuggestion)}
            {renderSummaryRow("Observação sugerida", observationSuggestion)}
            {renderSummaryRow("Destino sugerido", destinationSuggestion)}
            {renderSummaryRow("Alta segura sugerida", dischargeSuggestion)}
          </View>

          <Pressable style={styles.primaryAction} onPress={applyAutomaticDisposition}>
            <Text style={styles.primaryActionText}>Aplicar fechamento sugerido</Text>
          </Pressable>

          <Text style={styles.inputLabel}>Exames de confirmação / apoio</Text>
          <View style={styles.choiceWrap}>
            {splitTokens(examSuggestion).map((option) => {
              const active = includesToken(fv("investigationPlan"), option);
              return (
                <Pressable
                  key={option}
                  style={[styles.choiceChip, active && styles.choiceChipActive]}
                  onPress={() => toggleTokenField("investigationPlan", option)}>
                  <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Observação</Text>
          <View style={styles.choiceWrap}>
            {[
              "2 h em sala de observação clínica. Alta se assintomático e acesso à emergência garantido.",
              "≥ 6 h em sala de observação com monitorização (ECG, SpO₂, PA seriada). Alta somente se estável.",
              "≥ 12 h em sala de observação monitorizada (ECG, SpO₂, PA contínuos). Avaliar necessidade de UTI.",
            ].map((option) => {
              const active = fv("observationPlan") === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.choiceChip, active && styles.choiceChipActive]}
                  onPress={() => onFieldChange("observationPlan", option)}>
                  <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Destino</Text>
          <View style={styles.choiceWrap}>
            {[
              "Alta com orientações",
              "Internação em sala de observação monitorizada (≥ 12 h)",
              "UTI / sala de emergência avançada",
              "Manter em sala de emergência — reavaliar conduta",
            ].map((option) => {
              const active = fv("destination") === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.choiceChip, active && styles.choiceChipActive]}
                  onPress={() => onFieldChange("destination", option)}>
                  <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Alta segura</Text>
          <View style={styles.choiceWrap}>
            {[
              "Prescrever 2 autoinjetores, treinar uso, fornecer plano de ação e encaminhar para alergologia",
              "Orientar retorno se recorrência, evitar o fármaco suspeito, documentar alergia e encaminhar para alergologia",
            ].map((option) => {
              const active = fv("dischargePlan") === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.choiceChip, active && styles.choiceChipActive]}
                  onPress={() => onFieldChange("dischargePlan", option)}>
                  <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summaryBox}>
            {finalSummaryRows.map(([label, value]) => renderSummaryRow(label, value))}
          </View>

          {showFinalSummary ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>Resumo final do atendimento</Text>
              <Text style={styles.alertText}>
                Revise o percurso completo antes de encerrar. Esse resumo reúne o que foi feito do início ao fim.
              </Text>
              <View style={styles.summaryBox}>
                {finalSummaryRows.map(([label, value]) => renderSummaryRow(label, value))}
              </View>
              <Pressable style={styles.primaryAction} onPress={onConfirmAction}>
                <Text style={styles.primaryActionText}>Confirmar e encerrar</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable style={styles.primaryAction} onPress={() => setShowFinalSummary(true)}>
            <Text style={styles.primaryActionText}>Ver resumo antes de finalizar</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.footerNav}>
        <Pressable
          style={[styles.footerButton, activeStepIndex === 0 && styles.footerButtonDisabled]}
          disabled={activeStepIndex === 0}
          onPress={() => setActiveStepIndex((current) => Math.max(0, current - 1))}>
          <Text style={styles.footerButtonText}>Voltar</Text>
        </Pressable>
        <Pressable style={styles.footerButton} onPress={onGoBack}>
          <Text style={styles.footerButtonText}>Sair do módulo</Text>
        </Pressable>
      </View>

      <Modal visible={showGcsModal} transparent animationType="slide" onRequestClose={() => setShowGcsModal(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalScrim} onPress={() => setShowGcsModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.modalTitle}>Calculadora Glasgow</Text>
                <Text style={styles.modalHint}>Selecione ocular, verbal e motora para calcular o total.</Text>
              </View>
              <Pressable style={styles.modalCloseButton} onPress={() => setShowGcsModal(false)}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.gcsCard}>
                <Text style={styles.gcsSectionTitle}>Abertura ocular</Text>
                {GCS_EYE_OPTIONS.map((option) => (
                  <Pressable
                    key={`eye-${option.score}`}
                    style={[styles.gcsOption, gcsEye === option.score && styles.gcsOptionActive]}
                    onPress={() => setGcsEye(option.score)}>
                    <Text style={[styles.gcsScore, gcsEye === option.score && styles.gcsScoreActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.gcsOptionText, gcsEye === option.score && styles.gcsOptionTextActive]}>
                      {option.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.gcsCard}>
                <Text style={styles.gcsSectionTitle}>Resposta verbal</Text>
                {GCS_VERBAL_OPTIONS.map((option) => (
                  <Pressable
                    key={`verbal-${option.score}`}
                    style={[styles.gcsOption, gcsVerbal === option.score && styles.gcsOptionActive]}
                    onPress={() => setGcsVerbal(option.score)}>
                    <Text style={[styles.gcsScore, gcsVerbal === option.score && styles.gcsScoreActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.gcsOptionText, gcsVerbal === option.score && styles.gcsOptionTextActive]}>
                      {option.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.gcsCard}>
                <Text style={styles.gcsSectionTitle}>Resposta motora</Text>
                {GCS_MOTOR_OPTIONS.map((option) => (
                  <Pressable
                    key={`motor-${option.score}`}
                    style={[styles.gcsOption, gcsMotor === option.score && styles.gcsOptionActive]}
                    onPress={() => setGcsMotor(option.score)}>
                    <Text style={[styles.gcsScore, gcsMotor === option.score && styles.gcsScoreActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.gcsOptionText, gcsMotor === option.score && styles.gcsOptionTextActive]}>
                      {option.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.gcsFooter}>
              <View>
                <Text style={styles.gcsTotalLabel}>Total Glasgow</Text>
                <Text style={styles.gcsTotalValue}>{(gcsTotal ?? fv("gcs")) || "—"}</Text>
              </View>
              <Pressable
                style={[styles.gcsApplyButton, gcsTotal === null && styles.gcsApplyButtonDisabled]}
                onPress={applyGcsScore}>
                <Text style={styles.gcsApplyButtonText}>Usar total</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={numericPickerField != null} transparent animationType="slide" onRequestClose={closeNumericPicker}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalScrim} onPress={closeNumericPicker} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.modalTitle}>{numericPickerConfig?.label ?? "Selecionar valor"}</Text>
              </View>
              <Pressable style={styles.modalCloseButton} onPress={closeNumericPicker}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </Pressable>
            </View>

            <View style={styles.pickerSearchWrap}>
              <TextInput
                value={numericPickerSearch}
                onChangeText={setNumericPickerSearch}
                placeholder="Buscar..."
                style={styles.pickerSearchInput}
                placeholderTextColor="#64748b"
                autoCorrect={false}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              <View style={styles.pickerGrid}>
                {filteredNumericPickerOptions.map((option) => {
                  const active = numericPickerField ? fv(numericPickerField) === option : false;
                  return (
                    <Pressable
                      key={option}
                      style={[styles.pickerOption, active && styles.pickerOptionActive]}
                      onPress={() => applyNumericPickerValue(option)}>
                      <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextActive]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.customValueWrap}>
                <Text style={styles.customValueLabel}>Outro valor</Text>
                <View style={styles.customValueRow}>
                  <TextInput
                    value={numericPickerCustomValue}
                    onChangeText={setNumericPickerCustomValue}
                    placeholder="Ex.: 72"
                    keyboardType={numericPickerConfig?.keyboardType ?? "numeric"}
                    style={styles.customValueInput}
                    placeholderTextColor="#64748b"
                    returnKeyType="done"
                    onSubmitEditing={() => applyNumericPickerValue(numericPickerCustomValue)}
                  />
                  <Pressable
                    style={[styles.customValueButton, !numericPickerCustomValue.trim() && styles.customValueButtonDisabled]}
                    onPress={() => applyNumericPickerValue(numericPickerCustomValue)}
                    disabled={!numericPickerCustomValue.trim()}>
                    <Text style={styles.customValueButtonText}>Usar</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#07111f",
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
    backgroundColor: "#0f1f3a",
    borderRadius: 28,
    padding: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#213a66",
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroProgress: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#f8fafc",
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
  },
  heroHint: {
    color: "#dbe7ff",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  statusStrip: {
    gap: 10,
  },
  statusPill: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 4,
  },
  statusPillPrimary: {
    borderColor: "#ef4444",
    backgroundColor: "#211216",
  },
  statusLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusValue: {
    color: "#f8fafc",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 28,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
  },
  cardText: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  heroDose: {
    color: "#b91c1c",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
  },
  inputLabel: {
    color: "#0f172a",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  choiceChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  choiceChipText: {
    color: "#1e293b",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  choiceChipTextActive: {
    color: "#f8fafc",
  },
  inlineInputs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inlineField: {
    flexGrow: 1,
    flexBasis: 150,
    gap: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  inputButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "center",
  },
  inputButtonValue: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  inputButtonPlaceholder: {
    color: "#6b7280",
  },
  alertBox: {
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  alertDanger: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  alertNeutral: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  alertTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "900",
  },
  alertText: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  primaryAction: {
    backgroundColor: "#0f172a",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  primaryActionText: {
    color: "#f8fafc",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  dangerAction: {
    backgroundColor: "#dc2626",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  dangerActionText: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryAction: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  secondaryActionText: {
    color: "#0f172a",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.4)",
  },
  modalScrim: {
    flex: 1,
  },
  modalSheet: {
    maxHeight: "88%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 14,
  },
  modalHandle: {
    alignSelf: "center",
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
  },
  modalHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
  },
  modalHint: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  modalCloseButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800",
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  pickerSearchWrap: {
    paddingHorizontal: 16,
  },
  pickerSearchInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickerOption: {
    flexBasis: "48%",
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: "center",
  },
  pickerOptionActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ecfeff",
  },
  pickerOptionText: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  pickerOptionTextActive: {
    color: "#0f766e",
  },
  customValueWrap: {
    gap: 8,
    paddingTop: 6,
  },
  customValueLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  customValueRow: {
    flexDirection: "row",
    gap: 10,
  },
  customValueInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
  customValueButton: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  customValueButtonDisabled: {
    opacity: 0.45,
  },
  customValueButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  gcsCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbe4ee",
    gap: 10,
  },
  gcsSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    textTransform: "uppercase",
  },
  gcsOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gcsOptionActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ecfeff",
  },
  gcsScore: {
    width: 28,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  gcsScoreActive: {
    color: "#0f766e",
  },
  gcsOptionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
  },
  gcsOptionTextActive: {
    color: "#115e59",
    fontWeight: "600",
  },
  gcsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 12,
  },
  gcsTotalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
  },
  gcsTotalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  gcsApplyButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  gcsApplyButtonDisabled: {
    opacity: 0.45,
  },
  gcsApplyButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  ghostAction: {
    alignItems: "center",
    paddingVertical: 10,
  },
  ghostActionText: {
    color: "#b91c1c",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  summaryBox: {
    backgroundColor: "#e2e8f0",
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  summaryRow: {
    gap: 4,
  },
  summaryLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  footerNav: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  footerButton: {
    flex: 1,
    backgroundColor: "#13233f",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#243b63",
  },
  footerButtonDisabled: {
    opacity: 0.45,
  },
  footerButtonText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
});
