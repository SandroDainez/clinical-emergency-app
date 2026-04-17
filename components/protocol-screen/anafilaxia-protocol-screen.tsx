import { useEffect, useMemo, useState } from "react";
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
  AuxiliaryPanelField,
  ClinicalLogEntry,
  EncounterSummary,
  ProtocolState,
} from "../../clinical-engine";
import type {
  ClinicalCoreAction,
  ClinicalCoreAlert,
  ClinicalCoreStepId,
  ClinicalCoreWorkflowSnapshot,
  ClinicalCoreWorkflowStep,
} from "../../core/clinical-workflow";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";

type Props = {
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  canGoBack: boolean;
  clinicalLog: ClinicalLogEntry[];
  coreWorkflowSnapshot: ClinicalCoreWorkflowSnapshot | null;
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

type NumericPickerFieldId =
  | "age"
  | "weightKg"
  | "heightCm"
  | "timeOnsetMin"
  | "heartRate"
  | "systolicPressure"
  | "diastolicPressure"
  | "spo2";

type SelectionPickerFieldId =
  | "sex"
  | "exposureType"
  | "symptoms"
  | "investigationPlan"
  | "treatmentAdrenaline"
  | "treatmentIvAccess"
  | "treatmentMonitoring"
  | "treatmentFluids"
  | "treatmentAirway"
  | "treatmentSalbutamol"
  | "treatmentH1"
  | "treatmentCorticoid"
  | "treatmentVasopressor"
  | "clinicalResponse"
  | "observationPlan"
  | "destination"
  | "dischargePlan";

type GcsOption = { score: number; label: string; detail: string };

const NUMERIC_PICKER_CONFIG: Record<
  NumericPickerFieldId,
  { label: string; placeholder: string; options: string[]; keyboardType?: "numeric" }
> = {
  age: {
    label: "Idade",
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
  heightCm: {
    label: "Altura (cm)",
    placeholder: "Selecionar altura",
    options: ["150", "155", "160", "165", "170", "175", "180", "185", "190"],
    keyboardType: "numeric",
  },
  timeOnsetMin: {
    label: "Início (min)",
    placeholder: "Tempo desde o início",
    options: ["5", "10", "15", "30", "45", "60", "90", "120", "180"],
    keyboardType: "numeric",
  },
  heartRate: {
    label: "FC",
    placeholder: "Selecionar FC",
    options: ["60", "70", "80", "90", "100", "110", "120", "130", "140", "150", "160"],
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
    label: "SpO2 (%)",
    placeholder: "Selecionar SpO2",
    options: ["88", "90", "92", "94", "95", "96", "98", "100"],
    keyboardType: "numeric",
  },
};

const GCS_EYE_OPTIONS: GcsOption[] = [
  { score: 4, label: "4", detail: "Abre os olhos espontaneamente" },
  { score: 3, label: "3", detail: "Abre os olhos ao comando / voz" },
  { score: 2, label: "2", detail: "Abre os olhos a dor" },
  { score: 1, label: "1", detail: "Nao abre os olhos" },
];

const GCS_VERBAL_OPTIONS: GcsOption[] = [
  { score: 5, label: "5", detail: "Orientado, conversa normal" },
  { score: 4, label: "4", detail: "Confuso, mas fala frases" },
  { score: 3, label: "3", detail: "Palavras inapropriadas" },
  { score: 2, label: "2", detail: "Sons incompreensiveis" },
  { score: 1, label: "1", detail: "Sem resposta verbal" },
];

const GCS_MOTOR_OPTIONS: GcsOption[] = [
  { score: 6, label: "6", detail: "Obedece comandos" },
  { score: 5, label: "5", detail: "Localiza a dor" },
  { score: 4, label: "4", detail: "Retirada a dor" },
  { score: 3, label: "3", detail: "Flexao anormal" },
  { score: 2, label: "2", detail: "Extensao anormal" },
  { score: 1, label: "1", detail: "Sem resposta motora" },
];

const CORE_STEP_COPY: Record<
  ClinicalCoreStepId,
  { shortLabel: string; title: string; hint: string }
> = {
  patient_identification: {
    shortLabel: "Paciente",
    title: "Identificacao do paciente",
    hint: "Peso continua sendo dado critico e bloqueia o plano terapeutico.",
  },
  primary_assessment: {
    shortLabel: "ABCDE",
    title: "Avaliacao primaria",
    hint: "Registre rapidamente via aerea, respiracao, circulacao, Glasgow e exposicao.",
  },
  automatic_severity_detection: {
    shortLabel: "Gravidade",
    title: "Deteccao automatica de gravidade",
    hint: "Os alertas criticos aqui devem governar a prioridade da sala.",
  },
  immediate_intervention: {
    shortLabel: "Intervencao",
    title: "Intervencao imediata",
    hint: "Adrenalina IM e suporte inicial devem ficar visiveis sem depender de um fluxo paralelo.",
  },
  directed_clinical_evaluation: {
    shortLabel: "Avaliacao",
    title: "Avaliacao clinica dirigida",
    hint: "Feche gatilho, tempo de inicio e achados que sustentam a anafilaxia.",
  },
  diagnostic_hypotheses: {
    shortLabel: "Hipoteses",
    title: "Hipoteses diagnosticas",
    hint: "Use o ranking do snapshot como resumo do raciocinio atual.",
  },
  protocol_activation: {
    shortLabel: "Protocolo",
    title: "Ativacao do protocolo",
    hint: "A tela passa a assumir explicitamente quando o protocolo esta sugerido ou ativo.",
  },
  complementary_exams: {
    shortLabel: "Exames",
    title: "Exames complementares",
    hint: "Solicitacoes ficam amarradas ao passo central, nao mais escondidas no fluxo antigo.",
  },
  diagnosis: {
    shortLabel: "Diagnostico",
    title: "Diagnostico",
    hint: "A classificacao atual precisa aparecer como conclusao do fluxo central.",
  },
  treatment_plan: {
    shortLabel: "Plano",
    title: "Plano terapeutico",
    hint: "Se o peso estiver ausente, este passo permanece bloqueado e explicito.",
  },
  patient_destination: {
    shortLabel: "Destino",
    title: "Destino",
    hint: "Observacao, alta e orientacoes finais fecham o caso no mesmo fluxo.",
  },
};

const STEP_FIELDS: Partial<Record<ClinicalCoreStepId, string[]>> = {
  patient_identification: ["age", "sex", "weightKg", "heightCm"],
  primary_assessment: [
    "exposureType",
    "symptoms",
    "systolicPressure",
    "diastolicPressure",
    "heartRate",
    "spo2",
    "gcs",
  ],
  automatic_severity_detection: [],
  immediate_intervention: [
    "treatmentAdrenaline",
    "treatmentAirway",
    "treatmentIvAccess",
    "treatmentMonitoring",
    "treatmentFluids",
  ],
  directed_clinical_evaluation: ["exposureDetail", "timeOnsetMin", "symptoms", "freeNotes"],
  diagnostic_hypotheses: ["freeNotes"],
  protocol_activation: [],
  complementary_exams: ["investigationPlan"],
  diagnosis: ["clinicalResponse"],
  treatment_plan: [
    "treatmentAdrenaline",
    "treatmentAirway",
    "treatmentFluids",
    "treatmentSalbutamol",
    "treatmentH1",
    "treatmentCorticoid",
    "treatmentVasopressor",
    "clinicalResponse",
  ],
  patient_destination: ["observationPlan", "destination", "dischargePlan", "freeNotes"],
};

function splitTokens(value: string) {
  return value
    .split(" | ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSelectionPreview(values: string[], emptyLabel: string) {
  if (values.length === 0) return emptyLabel;
  if (values.length <= 2) return values.join(" | ");
  return `${values.slice(0, 2).join(" | ")} +${values.length - 2}`;
}

function getStatusTone(status: ClinicalCoreWorkflowStep["status"]) {
  if (status === "critical" || status === "blocked") return "danger";
  if (status === "completed") return "success";
  if (status === "ready" || status === "active") return "warning";
  return "neutral";
}

function getStatusLabel(status: ClinicalCoreWorkflowStep["status"]) {
  if (status === "pending") return "Pendente";
  if (status === "ready") return "Pronto";
  if (status === "active") return "Em andamento";
  if (status === "completed") return "Concluido";
  if (status === "blocked") return "Bloqueado";
  return "Critico";
}

function getAlertTone(severity: ClinicalCoreAlert["severity"]) {
  return severity === "critical" ? styles.alertCritical : styles.alertWarning;
}

function isNumericField(fieldId: string): fieldId is NumericPickerFieldId {
  return fieldId in NUMERIC_PICKER_CONFIG;
}

function isSelectionField(fieldId: string): fieldId is SelectionPickerFieldId {
  return [
    "sex",
    "exposureType",
    "symptoms",
    "investigationPlan",
    "treatmentAdrenaline",
    "treatmentIvAccess",
    "treatmentMonitoring",
    "treatmentFluids",
    "treatmentAirway",
    "treatmentSalbutamol",
    "treatmentH1",
    "treatmentCorticoid",
    "treatmentVasopressor",
    "clinicalResponse",
    "observationPlan",
    "destination",
    "dischargePlan",
  ].includes(fieldId);
}

function supportsToggleTokens(field?: AuxiliaryPanelField | null) {
  return field?.presetMode === "toggle_token";
}

function getFieldPlaceholder(field?: AuxiliaryPanelField | null) {
  return field?.placeholder ?? "Preencher";
}

function isLargeTextField(fieldId: string) {
  return ["freeNotes", "investigationPlan", "dischargePlan"].includes(fieldId);
}

function fieldSortWeight(fieldId: string) {
  const order = [
    "age",
    "sex",
    "weightKg",
    "heightCm",
    "exposureType",
    "exposureDetail",
    "timeOnsetMin",
    "symptoms",
    "heartRate",
    "systolicPressure",
    "diastolicPressure",
    "spo2",
    "gcs",
    "treatmentAdrenaline",
    "treatmentAirway",
    "treatmentIvAccess",
    "treatmentMonitoring",
    "treatmentFluids",
    "treatmentSalbutamol",
    "treatmentH1",
    "treatmentCorticoid",
    "treatmentVasopressor",
    "clinicalResponse",
    "investigationPlan",
    "observationPlan",
    "destination",
    "dischargePlan",
    "freeNotes",
  ];
  const index = order.indexOf(fieldId);
  return index === -1 ? 999 : index;
}

export default function AnafilaxiaProtocolScreen({
  auxiliaryPanel,
  canGoBack,
  clinicalLog,
  coreWorkflowSnapshot,
  encounterSummary,
  state,
  actionButtonLabel,
  onActionRun,
  onConfirmAction,
  onExportSummary,
  onFieldChange,
  onGoBack,
  onPresetApply,
  onPrintReport,
}: Props) {
  const initialStepIndex = getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0;
  const [activeStepIndex, setActiveStepIndex] = useState(initialStepIndex);
  const [numericPickerField, setNumericPickerField] = useState<NumericPickerFieldId | null>(null);
  const [numericPickerSearch, setNumericPickerSearch] = useState("");
  const [numericPickerCustomValue, setNumericPickerCustomValue] = useState("");
  const [selectionPickerField, setSelectionPickerField] = useState<SelectionPickerFieldId | null>(null);
  const [selectionPickerSearch, setSelectionPickerSearch] = useState("");
  const [selectionPickerCustomValue, setSelectionPickerCustomValue] = useState("");
  const [showGcsModal, setShowGcsModal] = useState(false);
  const [gcsEye, setGcsEye] = useState<number | null>(null);
  const [gcsVerbal, setGcsVerbal] = useState<number | null>(null);
  const [gcsMotor, setGcsMotor] = useState<number | null>(null);

  const fieldsById = useMemo(() => {
    const map = new Map<string, AuxiliaryPanelField>();
    for (const field of auxiliaryPanel?.fields ?? []) {
      map.set(field.id, field);
    }
    return map;
  }, [auxiliaryPanel]);

  const workflowSteps = coreWorkflowSnapshot?.steps ?? [];
  const safeStepIndex =
    workflowSteps.length > 0
      ? Math.min(Math.max(activeStepIndex, 0), workflowSteps.length - 1)
      : 0;
  const currentStep = workflowSteps[safeStepIndex] ?? null;
  const currentStepCopy = currentStep ? CORE_STEP_COPY[currentStep.id] : null;

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab: safeStepIndex });
  }, [encounterSummary.protocolId, safeStepIndex]);

  useEffect(() => {
    if (activeStepIndex !== safeStepIndex) {
      setActiveStepIndex(safeStepIndex);
    }
  }, [activeStepIndex, safeStepIndex]);

  const gcsTotal =
    gcsEye !== null && gcsVerbal !== null && gcsMotor !== null ? gcsEye + gcsVerbal + gcsMotor : null;

  const classificationMetric =
    auxiliaryPanel?.metrics.find((metric) => metric.label === "Classificação")?.value ?? "";
  const immediateConductMetric =
    auxiliaryPanel?.metrics.find((metric) => metric.label === "Conduta imediata")?.value ?? "";
  const blockingIssues = coreWorkflowSnapshot?.blockingIssues ?? [];
  const criticalAlerts = coreWorkflowSnapshot?.criticalAlerts ?? [];
  const activeProtocol = coreWorkflowSnapshot?.activeProtocol ?? null;
  const hypotheses = coreWorkflowSnapshot?.hypotheses ?? [];

  function fieldValue(fieldId: string) {
    return fieldsById.get(fieldId)?.value ?? "";
  }

  function fieldDef(fieldId: string) {
    return fieldsById.get(fieldId) ?? null;
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

  function openSelectionPicker(fieldId: SelectionPickerFieldId) {
    setSelectionPickerField(fieldId);
    setSelectionPickerSearch("");
    setSelectionPickerCustomValue("");
  }

  function closeSelectionPicker() {
    setSelectionPickerField(null);
    setSelectionPickerSearch("");
    setSelectionPickerCustomValue("");
  }

  function applyNumericPickerValue(value: string) {
    if (!numericPickerField) return;
    const normalizedValue = value.trim();
    if (!normalizedValue) return;
    onFieldChange(numericPickerField, normalizedValue);
    closeNumericPicker();
  }

  function applyGcsScore() {
    if (gcsTotal === null) return;
    onFieldChange("gcs", String(gcsTotal));
    setShowGcsModal(false);
  }

  function toggleFieldToken(fieldId: string, token: string) {
    onPresetApply(fieldId, token);
  }

  function applySelectionOption(fieldId: SelectionPickerFieldId, option: string) {
    const field = fieldDef(fieldId);
    if (supportsToggleTokens(field) || fieldId === "symptoms") {
      toggleFieldToken(fieldId, option);
      return;
    }

    onFieldChange(fieldId, option);
    closeSelectionPicker();
  }

  function applySelectionCustomValue() {
    if (!selectionPickerField) return;
    const normalizedValue = selectionPickerCustomValue.trim();
    if (!normalizedValue) {
      closeSelectionPicker();
      return;
    }

    const field = fieldDef(selectionPickerField);
    if (supportsToggleTokens(field) || selectionPickerField === "symptoms") {
      toggleFieldToken(selectionPickerField, normalizedValue);
      closeSelectionPicker();
      return;
    }

    onFieldChange(selectionPickerField, normalizedValue);
    closeSelectionPicker();
  }

  function applySuggestedFieldValue(fieldId: string) {
    const field = fieldDef(fieldId);
    const suggestedValue = field?.suggestedValue?.trim();
    if (!suggestedValue) return;

    if (supportsToggleTokens(field)) {
      onFieldChange(fieldId, suggestedValue);
      return;
    }

    onFieldChange(fieldId, suggestedValue);
  }

  function renderFieldControl(fieldId: string) {
    const field = fieldDef(fieldId);
    if (!field) return null;

    if (fieldId === "gcs") {
      return (
        <View key={fieldId} style={[styles.fieldCard, field.fullWidth && styles.fieldCardWide]}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {field.helperText ? <Text style={styles.fieldHelper}>{field.helperText}</Text> : null}
          </View>
          <Pressable style={styles.selectorButton} onPress={() => setShowGcsModal(true)}>
            <Text style={[styles.selectorValue, !field.value && styles.selectorPlaceholder]}>
              {field.value ? `GCS ${field.value}` : "Abrir Glasgow"}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (isNumericField(fieldId)) {
      return (
        <View key={fieldId} style={[styles.fieldCard, field.fullWidth && styles.fieldCardWide]}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {field.helperText ? <Text style={styles.fieldHelper}>{field.helperText}</Text> : null}
          </View>
          <Pressable style={styles.selectorButton} onPress={() => openNumericPicker(fieldId)}>
            <Text style={[styles.selectorValue, !field.value && styles.selectorPlaceholder]}>
              {field.value || NUMERIC_PICKER_CONFIG[fieldId].placeholder}
            </Text>
          </Pressable>
          {field.suggestedValue ? (
            <Pressable style={styles.secondaryChip} onPress={() => applySuggestedFieldValue(fieldId)}>
              <Text style={styles.secondaryChipText}>{field.suggestedLabel ?? `Aplicar sugestao`}</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    if (isSelectionField(fieldId)) {
      const preview = supportsToggleTokens(field)
        ? buildSelectionPreview(splitTokens(field.value), getFieldPlaceholder(field))
        : field.value || getFieldPlaceholder(field);

      return (
        <View key={fieldId} style={[styles.fieldCard, field.fullWidth && styles.fieldCardWide]}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {field.helperText ? <Text style={styles.fieldHelper}>{field.helperText}</Text> : null}
          </View>
          <Pressable style={styles.selectorButton} onPress={() => openSelectionPicker(fieldId)}>
            <Text style={[styles.selectorValue, !field.value && styles.selectorPlaceholder]}>{preview}</Text>
          </Pressable>
          {field.suggestedValue ? (
            <Pressable style={styles.secondaryChip} onPress={() => applySuggestedFieldValue(fieldId)}>
              <Text style={styles.secondaryChipText}>{field.suggestedLabel ?? `Aplicar sugestao`}</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    return (
      <View key={fieldId} style={[styles.fieldCard, field.fullWidth && styles.fieldCardWide]}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          {field.helperText ? <Text style={styles.fieldHelper}>{field.helperText}</Text> : null}
        </View>
        <TextInput
          multiline={isLargeTextField(fieldId)}
          numberOfLines={isLargeTextField(fieldId) ? 4 : 1}
          placeholder={getFieldPlaceholder(field)}
          placeholderTextColor="#7d8ba1"
          style={[styles.textInput, isLargeTextField(fieldId) && styles.textArea]}
          value={field.value}
          onChangeText={(value) => onFieldChange(fieldId, value)}
        />
        {field.suggestedValue ? (
          <Pressable style={styles.secondaryChip} onPress={() => applySuggestedFieldValue(fieldId)}>
            <Text style={styles.secondaryChipText}>{field.suggestedLabel ?? `Aplicar sugestao`}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  function renderSnapshotCards(step: ClinicalCoreWorkflowStep) {
    if (!step.cards || step.cards.length === 0) return null;

    return (
      <View style={styles.metricGrid}>
        {step.cards.map((card) => (
          <View key={`${step.id}-${card.label}`} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{card.label}</Text>
            <Text
              style={[
                styles.metricValue,
                card.emphasis === "danger"
                  ? styles.textDanger
                  : card.emphasis === "warning"
                    ? styles.textWarning
                    : null,
              ]}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  function renderAlerts(alerts: ClinicalCoreAlert[]) {
    if (alerts.length === 0) return null;

    return (
      <View style={styles.stack}>
        {alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, getAlertTone(alert.severity)]}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertText}>{alert.rationale}</Text>
            {alert.immediateActions.length > 0 ? (
              <View style={styles.listBlock}>
                {alert.immediateActions.map((item) => (
                  <Text key={item} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  function renderActions(actions: ClinicalCoreAction[]) {
    if (actions.length === 0) return null;

    return (
      <View style={styles.stack}>
        {actions.map((action) => (
          <View key={action.id} style={styles.actionRow}>
            <View style={styles.actionCopy}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionMeta}>
                Prioridade: {action.priority}
                {action.selected ? " • ja contemplada" : ""}
              </Text>
              {action.rationale ? <Text style={styles.actionRationale}>{action.rationale}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    );
  }

  function renderStepSpecificContent(step: ClinicalCoreWorkflowStep) {
    const fieldIds = [...(STEP_FIELDS[step.id] ?? [])]
      .filter((fieldId) => fieldsById.has(fieldId))
      .sort((left, right) => fieldSortWeight(left) - fieldSortWeight(right));

    return (
      <View style={styles.stack}>
        {step.id === "automatic_severity_detection" ? renderAlerts(criticalAlerts) : null}

        {step.id === "diagnostic_hypotheses" && hypotheses.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ranking atual</Text>
            <View style={styles.stack}>
              {hypotheses.map((item) => (
                <View key={item.id} style={styles.hypothesisCard}>
                  <Text style={styles.hypothesisLabel}>{item.label}</Text>
                  <Text style={styles.hypothesisMeta}>Probabilidade: {item.probability}</Text>
                  <Text style={styles.hypothesisRationale}>{item.rationale}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {step.id === "protocol_activation" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ativacao</Text>
            <Text style={styles.sectionText}>
              {activeProtocol
                ? `${activeProtocol.label}: ${activeProtocol.rationale}`
                : "Sem protocolo ativo ou sugerido neste momento."}
            </Text>
            {auxiliaryPanel?.actions?.length ? (
              <View style={styles.buttonRow}>
                {auxiliaryPanel.actions.map((action) => (
                  <Pressable
                    key={action.id}
                    style={styles.moduleButton}
                    onPress={() => onActionRun(action.id, action.requiresConfirmation)}>
                    <Text style={styles.moduleButtonText}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {fieldIds.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dados e condutas deste passo</Text>
            <View style={styles.fieldGrid}>{fieldIds.map((fieldId) => renderFieldControl(fieldId))}</View>
          </View>
        ) : null}

        {step.id === "immediate_intervention" || step.id === "treatment_plan" ? renderActions(step.actions ?? []) : null}

        {step.id === "patient_destination" && clinicalLog.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ultimos registros</Text>
            <View style={styles.stack}>
              {clinicalLog.slice(-4).reverse().map((entry) => (
                <View key={`${entry.timestamp}-${entry.title}`} style={styles.logRow}>
                  <Text style={styles.logTitle}>{entry.title}</Text>
                  {entry.details ? <Text style={styles.logDetail}>{entry.details}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  const numericPickerConfig = numericPickerField ? NUMERIC_PICKER_CONFIG[numericPickerField] : null;
  const filteredNumericOptions = numericPickerConfig
    ? numericPickerSearch.trim()
      ? numericPickerConfig.options.filter((option) => option.includes(numericPickerSearch.trim()))
      : numericPickerConfig.options
    : [];
  const selectionOptions = selectionPickerField
    ? fieldDef(selectionPickerField)?.presets?.map((preset) => preset.value) ?? []
    : [];
  const filteredSelectionOptions = selectionPickerSearch.trim()
    ? selectionOptions.filter((option) =>
        option.toLowerCase().includes(selectionPickerSearch.trim().toLowerCase())
      )
    : selectionOptions;

  if (state.type === "end") {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Anafilaxia</Text>
          <Text style={styles.heroTitle}>Atendimento encerrado</Text>
          <Text style={styles.heroText}>
            O fluxo central foi concluido. Use exportacao ou impressao se precisar fechar a documentacao.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton} onPress={onExportSummary}>
              <Text style={styles.primaryButtonText}>Exportar resumo</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onPrintReport}>
              <Text style={styles.secondaryButtonText}>Imprimir</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Anafilaxia</Text>
            <Text style={styles.heroTitle}>
              {currentStepCopy?.title ?? "Fluxo clinico central"}
            </Text>
            <Text style={styles.heroText}>
              {currentStepCopy?.hint ??
                "A tela usa o snapshot central como navegacao unica do caso."}
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeLabel}>Duracao</Text>
            <Text style={styles.heroBadgeValue}>{encounterSummary.durationLabel}</Text>
          </View>
        </View>

        <View style={styles.heroMetrics}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>Classificacao</Text>
            <Text style={styles.heroMetricValue}>{classificationMetric || "Em avaliacao"}</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>Conduta imediata</Text>
            <Text style={styles.heroMetricValue}>{immediateConductMetric || "Sem conduta fechada"}</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricLabel}>Progresso</Text>
            <Text style={styles.heroMetricValue}>
              {workflowSteps.length ? `${safeStepIndex + 1}/${workflowSteps.length}` : "—"}
            </Text>
          </View>
        </View>
      </View>

      {blockingIssues.length > 0 ? (
        <View style={[styles.alertCard, styles.alertCritical]}>
          <Text style={styles.alertTitle}>Blocking issues</Text>
          {blockingIssues.map((item) => (
            <Text key={item} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepRail}>
        {workflowSteps.map((step, index) => {
          const copy = CORE_STEP_COPY[step.id];
          const tone = getStatusTone(step.status);
          return (
            <Pressable
              key={step.id}
              style={[
                styles.stepPill,
                index === safeStepIndex && styles.stepPillActive,
                tone === "danger"
                  ? styles.stepPillDanger
                  : tone === "success"
                    ? styles.stepPillSuccess
                    : tone === "warning"
                      ? styles.stepPillWarning
                      : null,
              ]}
              onPress={() => setActiveStepIndex(index)}>
              <Text style={styles.stepPillIndex}>{index + 1}</Text>
              <Text style={styles.stepPillLabel}>{copy.shortLabel}</Text>
              <Text style={styles.stepPillStatus}>{getStatusLabel(step.status)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {currentStep ? (
        <>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{currentStep.title}</Text>
              <View
                style={[
                  styles.statusBadge,
                  getStatusTone(currentStep.status) === "danger"
                    ? styles.statusBadgeDanger
                    : getStatusTone(currentStep.status) === "success"
                      ? styles.statusBadgeSuccess
                      : getStatusTone(currentStep.status) === "warning"
                        ? styles.statusBadgeWarning
                        : null,
                ]}>
                <Text style={styles.statusBadgeText}>{getStatusLabel(currentStep.status)}</Text>
              </View>
            </View>
            <Text style={styles.sectionText}>{currentStep.summary}</Text>
            {currentStep.progressionBlocked ? (
              <Text style={styles.blockedText}>Este passo bloqueia progressao segura no fluxo.</Text>
            ) : null}
            {renderSnapshotCards(currentStep)}
            {currentStep.id !== "automatic_severity_detection" ? renderAlerts(currentStep.alerts ?? []) : null}
          </View>

          {renderStepSpecificContent(currentStep)}
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Snapshot indisponivel</Text>
          <Text style={styles.sectionText}>
            O engine ainda nao retornou os passos centrais da anafilaxia.
          </Text>
        </View>
      )}

      <View style={styles.footerCard}>
        <View style={styles.footerButtons}>
          {canGoBack ? (
            <Pressable style={styles.secondaryButton} onPress={onGoBack}>
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.secondaryButton} onPress={onExportSummary}>
            <Text style={styles.secondaryButtonText}>Exportar resumo</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onPrintReport}>
            <Text style={styles.secondaryButtonText}>Imprimir</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onConfirmAction}>
            <Text style={styles.primaryButtonText}>{actionButtonLabel}</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={numericPickerField !== null} transparent animationType="fade" onRequestClose={closeNumericPicker}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{numericPickerConfig?.label ?? "Selecionar valor"}</Text>
            <TextInput
              value={numericPickerSearch}
              onChangeText={setNumericPickerSearch}
              placeholder="Filtrar opcoes"
              placeholderTextColor="#7d8ba1"
              style={styles.modalInput}
            />
            <TextInput
              value={numericPickerCustomValue}
              onChangeText={setNumericPickerCustomValue}
              placeholder="Ou digitar valor"
              placeholderTextColor="#7d8ba1"
              keyboardType={numericPickerConfig?.keyboardType}
              style={styles.modalInput}
            />
            <ScrollView style={styles.modalList}>
              {filteredNumericOptions.map((option) => (
                <Pressable key={option} style={styles.modalOption} onPress={() => applyNumericPickerValue(option)}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable style={styles.secondaryButton} onPress={closeNumericPicker}>
                <Text style={styles.secondaryButtonText}>Fechar</Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={() => applyNumericPickerValue(numericPickerCustomValue)}>
                <Text style={styles.primaryButtonText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={selectionPickerField !== null} transparent animationType="fade" onRequestClose={closeSelectionPicker}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {selectionPickerField ? fieldDef(selectionPickerField)?.label ?? "Selecionar" : "Selecionar"}
            </Text>
            <TextInput
              value={selectionPickerSearch}
              onChangeText={setSelectionPickerSearch}
              placeholder="Filtrar opcoes"
              placeholderTextColor="#7d8ba1"
              style={styles.modalInput}
            />
            <TextInput
              value={selectionPickerCustomValue}
              onChangeText={setSelectionPickerCustomValue}
              placeholder="Adicionar valor customizado"
              placeholderTextColor="#7d8ba1"
              style={styles.modalInput}
            />
            <ScrollView style={styles.modalList}>
              {filteredSelectionOptions.map((option) => {
                const selected = selectionPickerField
                  ? splitTokens(fieldValue(selectionPickerField)).some((item) => item === option) ||
                    fieldValue(selectionPickerField) === option
                  : false;

                return (
                  <Pressable
                    key={option}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => selectionPickerField && applySelectionOption(selectionPickerField, option)}>
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable style={styles.secondaryButton} onPress={closeSelectionPicker}>
                <Text style={styles.secondaryButtonText}>Fechar</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={applySelectionCustomValue}>
                <Text style={styles.primaryButtonText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showGcsModal} transparent animationType="fade" onRequestClose={() => setShowGcsModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Calcular Glasgow</Text>
            <ScrollView style={styles.gcsScroll} contentContainerStyle={styles.gcsScrollContent}>
              <View style={styles.stack}>
                <View style={styles.gcsSection}>
                  <Text style={styles.gcsSectionTitle}>Olhos</Text>
                  {GCS_EYE_OPTIONS.map((option) => (
                    <Pressable
                      key={`eye-${option.score}`}
                      style={[styles.modalOption, gcsEye === option.score && styles.modalOptionSelected]}
                      onPress={() => setGcsEye(option.score)}>
                      <Text style={styles.modalOptionText}>{option.label} • {option.detail}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.gcsSection}>
                  <Text style={styles.gcsSectionTitle}>Verbal</Text>
                  {GCS_VERBAL_OPTIONS.map((option) => (
                    <Pressable
                      key={`verbal-${option.score}`}
                      style={[styles.modalOption, gcsVerbal === option.score && styles.modalOptionSelected]}
                      onPress={() => setGcsVerbal(option.score)}>
                      <Text style={styles.modalOptionText}>{option.label} • {option.detail}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.gcsSection}>
                  <Text style={styles.gcsSectionTitle}>Motor</Text>
                  {GCS_MOTOR_OPTIONS.map((option) => (
                    <Pressable
                      key={`motor-${option.score}`}
                      style={[styles.modalOption, gcsMotor === option.score && styles.modalOptionSelected]}
                      onPress={() => setGcsMotor(option.score)}>
                      <Text style={styles.modalOptionText}>{option.label} • {option.detail}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Text style={styles.gcsTotal}>Total: {gcsTotal ?? "—"}</Text>
              <Pressable style={styles.secondaryButton} onPress={() => setShowGcsModal(false)}>
                <Text style={styles.secondaryButtonText}>Fechar</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={applyGcsScore}>
                <Text style={styles.primaryButtonText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingBottom: 180,
    gap: 16,
  },
  stack: {
    gap: 12,
  },
  heroCard: {
    backgroundColor: "#0f3b49",
    borderRadius: 28,
    padding: 22,
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 205, 220, 0.28)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  heroCopy: {
    flex: 1,
    minWidth: 240,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#b7f1ff",
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: "#f4fbff",
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#d8eef5",
  },
  heroBadge: {
    minWidth: 120,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  heroBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#a7d3df",
  },
  heroBadgeValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  heroMetric: {
    flexGrow: 1,
    minWidth: 170,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    gap: 6,
  },
  heroMetricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a7d3df",
    textTransform: "uppercase",
  },
  heroMetricValue: {
    fontSize: 15,
    lineHeight: 20,
    color: "#ffffff",
    fontWeight: "700",
  },
  stepRail: {
    gap: 10,
    paddingRight: 8,
  },
  stepPill: {
    width: 128,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#eef4f8",
    borderWidth: 1,
    borderColor: "#c6d6e3",
    gap: 4,
  },
  stepPillActive: {
    borderColor: "#0f3b49",
    borderWidth: 2,
  },
  stepPillDanger: {
    backgroundColor: "#fff1f1",
    borderColor: "#f0b7b7",
  },
  stepPillSuccess: {
    backgroundColor: "#eefbf1",
    borderColor: "#bfe4c8",
  },
  stepPillWarning: {
    backgroundColor: "#fff8eb",
    borderColor: "#f0d7a4",
  },
  stepPillIndex: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5a7188",
  },
  stepPillLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#193245",
  },
  stepPillStatus: {
    fontSize: 12,
    color: "#5f7387",
  },
  card: {
    backgroundColor: "#fbf7ef",
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "#d8e2ea",
  },
  footerCard: {
    backgroundColor: "#edf4f8",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d2e2ec",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  sectionTitle: {
    flex: 1,
    minWidth: 220,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: "#173349",
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#31475b",
  },
  blockedText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#a62b2b",
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#e7eef4",
  },
  statusBadgeDanger: {
    backgroundColor: "#ffe1e1",
  },
  statusBadgeSuccess: {
    backgroundColor: "#def5e3",
  },
  statusBadgeWarning: {
    backgroundColor: "#fff0d1",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#274155",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 180,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#f3f8fb",
    borderWidth: 1,
    borderColor: "#d3e0ea",
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5b7285",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: "#173349",
  },
  textDanger: {
    color: "#a11d1d",
  },
  textWarning: {
    color: "#8a5a00",
  },
  alertCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  alertCritical: {
    backgroundColor: "#fff0f0",
    borderColor: "#efb3b3",
  },
  alertWarning: {
    backgroundColor: "#fff6e7",
    borderColor: "#f0d39b",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#173349",
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#31475b",
  },
  listBlock: {
    gap: 4,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    color: "#31475b",
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  fieldCard: {
    flexGrow: 1,
    minWidth: 220,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#f4f8fb",
    borderWidth: 1,
    borderColor: "#d4e1ea",
    gap: 10,
  },
  fieldCardWide: {
    minWidth: "100%",
  },
  fieldHeader: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#193245",
  },
  fieldHelper: {
    fontSize: 13,
    lineHeight: 18,
    color: "#556c80",
  },
  selectorButton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c8d7e3",
  },
  selectorValue: {
    fontSize: 14,
    lineHeight: 20,
    color: "#173349",
    fontWeight: "700",
  },
  selectorPlaceholder: {
    color: "#7d8ba1",
    fontWeight: "500",
  },
  textInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c8d7e3",
    color: "#173349",
    fontSize: 14,
  },
  textArea: {
    minHeight: 108,
    textAlignVertical: "top",
  },
  secondaryChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#deebf2",
  },
  secondaryChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#21465e",
  },
  actionRow: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#f7fbfd",
    borderWidth: 1,
    borderColor: "#d7e5ee",
  },
  actionCopy: {
    gap: 4,
  },
  actionLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#173349",
  },
  actionMeta: {
    fontSize: 12,
    color: "#597084",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  actionRationale: {
    fontSize: 14,
    lineHeight: 20,
    color: "#32495d",
  },
  hypothesisCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#f3f7fa",
    borderWidth: 1,
    borderColor: "#d4e1ea",
    gap: 4,
  },
  hypothesisLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#173349",
  },
  hypothesisMeta: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#5b7285",
  },
  hypothesisRationale: {
    fontSize: 14,
    lineHeight: 20,
    color: "#31475b",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  footerButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  moduleButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#e8f3f8",
    borderWidth: 1,
    borderColor: "#c7dbe6",
  },
  moduleButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#173349",
  },
  primaryButton: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0f3b49",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
  secondaryButton: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#dfeaf0",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#173349",
  },
  logRow: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: "#dde6ec",
    paddingTop: 10,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#173349",
  },
  logDetail: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4e6478",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 20, 27, 0.48)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    maxHeight: "90%",
    backgroundColor: "#fbf7ef",
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#d8e2ea",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#173349",
  },
  modalInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c8d7e3",
    color: "#173349",
    fontSize: 14,
  },
  modalList: {
    maxHeight: 320,
  },
  gcsScroll: {
    maxHeight: 420,
  },
  gcsScrollContent: {
    paddingBottom: 4,
  },
  modalOption: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e4ec",
    marginBottom: 8,
  },
  modalOptionSelected: {
    borderColor: "#0f3b49",
    backgroundColor: "#e8f4f7",
  },
  modalOptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#173349",
  },
  modalFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  gcsSection: {
    gap: 8,
  },
  gcsSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#173349",
  },
  gcsTotal: {
    marginRight: "auto",
    fontSize: 15,
    fontWeight: "800",
    color: "#173349",
  },
});
