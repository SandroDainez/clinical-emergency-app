import { useEffect, useState } from "react";
import {
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

  function goTo(stepId: StepId) {
    setShowFinalSummary(false);
    setActiveStepIndex(getStepIndex(stepId));
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
    if (suggestedValue("treatmentAirway")) {
      onFieldChange("treatmentAirway", suggestedValue("treatmentAirway"));
    }
    if (suggestedValue("treatmentIvAccess")) {
      onFieldChange("treatmentIvAccess", suggestedValue("treatmentIvAccess"));
    }
    if (suggestedValue("treatmentMonitoring")) {
      onFieldChange("treatmentMonitoring", suggestedValue("treatmentMonitoring"));
    }
    if (suggestedValue("treatmentFluids")) {
      onFieldChange("treatmentFluids", suggestedValue("treatmentFluids"));
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
          <Text style={styles.cardTitle}>Checklist de reconhecimento</Text>
          <Text style={styles.cardText}>Marque os achados principais. O módulo assume probabilidade alta quando há padrão compatível.</Text>

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

          <View style={styles.inlineInputs}>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>PAS</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fv("systolicPressure")}
                onChangeText={(value) => onFieldChange("systolicPressure", value)}
                placeholder="Inserir"
                placeholderTextColor="#6b7280"
              />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>PAD</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fv("diastolicPressure")}
                onChangeText={(value) => onFieldChange("diastolicPressure", value)}
                placeholder="Inserir"
                placeholderTextColor="#6b7280"
              />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>SpO₂</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fv("spo2")}
                onChangeText={(value) => onFieldChange("spo2", value)}
                placeholder="Inserir"
                placeholderTextColor="#6b7280"
              />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>Peso kg</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fv("weightKg")}
                onChangeText={(value) => onFieldChange("weightKg", value)}
                placeholder="Inserir"
                placeholderTextColor="#6b7280"
              />
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.inputLabel}>GCS</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fv("gcs")}
                onChangeText={(value) => onFieldChange("gcs", value)}
                placeholder="Inserir"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          <View style={styles.summaryBox}>
            {renderSummaryRow("Classificação", classification || "Aguardando sinais suficientes")}
            {renderSummaryRow("Conduta imediata", immediateConduct)}
            {renderSummaryRow("PA", bpMetric)}
            {renderSummaryRow("PAM", mapMetric)}
          </View>

          <View style={[styles.alertBox, probableRecognition.probable ? styles.alertDanger : styles.alertNeutral]}>
            <Text style={styles.alertTitle}>
              {probableRecognition.probable ? "Provável anafilaxia" : "Dados ainda insuficientes"}
            </Text>
            <Text style={styles.alertText}>
              {probableRecognition.probable
                ? "Há elementos suficientes para tratar como anafilaxia. Não espere mais dados para fazer adrenalina IM."
                : "Se houver progressão respiratória, hipotensão ou combinação de pele com outro sistema, trate como anafilaxia."}
            </Text>
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
                onFieldChange("treatmentFluids", suggestedValue("treatmentFluids"));
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
          <Pressable style={styles.dangerAction} onPress={applySecondDose}>
            <Text style={styles.dangerActionText}>
              {hasSecondDose ? "2ª dose já registrada" : "Registrar 2ª dose IM"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.primaryAction}
            onPress={() => onFieldChange("treatmentFluids", escalationFluid)}>
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
            onPress={() => {
              if (refractoryVasopressor) {
                onFieldChange("treatmentVasopressor", refractoryVasopressor);
              }
              if (refractoryAirway) {
                onFieldChange("treatmentAirway", refractoryAirway);
              }
            }}>
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
