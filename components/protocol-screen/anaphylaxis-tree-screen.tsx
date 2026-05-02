import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { type Href, useRouter } from "expo-router";

import { AppDesign } from "../../constants/app-design";
import { getClinicalModuleById } from "../../clinical-modules";
import { openClinicalModule } from "../../lib/open-clinical-module";
import {
  anaphylaxisDecisionTree,
  createAnaphylaxisDecisionEngine,
} from "../../anaphylaxis-decision-tree";
import { ModuleFlowContent, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import DecisionGrid from "./template/DecisionGrid";

type Props = {
  onRouteBack?: () => void;
};

type TreeRegionId =
  | "entry"
  | "first_line"
  | "severity"
  | "reassessment"
  | "escalation"
  | "disposition";

const TREE_REGIONS: { id: TreeRegionId; label: string; hint: string; accent: string }[] = [
  { id: "entry", label: "Entrada clínica", hint: "Reconhecimento e filtro inicial", accent: "#0f766e" },
  { id: "first_line", label: "Ação imediata", hint: "Adrenalina IM sem atraso", accent: "#1d4ed8" },
  { id: "severity", label: "Reavaliação inicial", hint: "Resposta objetiva após 1ª adrenalina", accent: "#7c3aed" },
  { id: "reassessment", label: "Loops de reavaliação", hint: "Resposta após adrenalina", accent: "#b45309" },
  { id: "escalation", label: "Escalonamento crítico", hint: "Via aérea, infusão e UTI", accent: "#dc2626" },
  { id: "disposition", label: "Saídas terminais", hint: "Alta, observação, UTI ou transição", accent: "#15803d" },
];

const REGION_ANCHOR_NODE: Record<TreeRegionId, string> = {
  entry: "diagnostic_entry",
  first_line: "immediate_im_epinephrine",
  severity: "severity_stratification",
  reassessment: "reassessment_after_first_im",
  escalation: "critical_escalation_bundle",
  disposition: "observation_disposition",
};

const MODULE_ROUTE_BY_TARGET: Record<string, string> = {
  isr_rapida: "isr-rapida",
  ventilacao_mecanica: "ventilacao-mecanica",
  drogas_vasoativas: "drogas-vasoativas",
};

type FindingState = "yes" | "no" | undefined;
type GlasgowValue = 1 | 2 | 3 | 4 | 5 | 6 | undefined;
type AssessmentContextId = "initial" | "post_first_im" | "post_second_im";
type AssessmentTarget = { contextId: AssessmentContextId; fieldId: AssessmentFieldId } | null;

type ClinicalInputs = {
  age: string;
  sex: string;
  weightKg: string;
  heightCm: string;
  heartRate: string;
  systolic: string;
  diastolic: string;
  respiratoryRate: string;
  oxygenSat: string;
  gcsEye: GlasgowValue;
  gcsVerbal: GlasgowValue;
  gcsMotor: GlasgowValue;
};

type ActionPlanStatus = "suggested" | "adjusted";

type ActionPlanOption = {
  value: string;
  label: string;
  detail?: string;
};

type ActionPlanGroup = {
  id: string;
  title: string;
  hint: string;
};

type ActionPlanCard = {
  id: string;
  group: ActionPlanGroup;
  title: string;
  detail: string;
  rationale?: string;
  tone: "danger" | "warning" | "info" | "success";
  options?: ActionPlanOption[];
  defaultChoice?: string;
};

type ActiveActionPlanSheet = {
  cardKey: string;
  card: ActionPlanCard;
} | null;

type AssessmentFieldId =
  | "age"
  | "sex"
  | "weightKg"
  | "heightCm"
  | "heartRate"
  | "systolic"
  | "diastolic"
  | "respiratoryRate"
  | "oxygenSat"
  | "glasgow";

type PresetOption = {
  value: string;
  label: string;
};

const ASSESSMENT_FIELD_META: Record<AssessmentFieldId, { label: string; placeholder: string; customLabel: string }> = {
  age: { label: "Idade", placeholder: "Selecionar idade", customLabel: "Outra idade" },
  sex: { label: "Sexo", placeholder: "Selecionar sexo", customLabel: "Outro sexo" },
  weightKg: { label: "Peso (kg)", placeholder: "Selecionar peso", customLabel: "Outro peso" },
  heightCm: { label: "Altura (cm)", placeholder: "Selecionar altura", customLabel: "Outra altura" },
  heartRate: { label: "FC", placeholder: "Selecionar FC", customLabel: "Outra FC" },
  systolic: { label: "PAS", placeholder: "Selecionar PAS", customLabel: "Outra PAS" },
  diastolic: { label: "PAD", placeholder: "Selecionar PAD", customLabel: "Outra PAD" },
  respiratoryRate: { label: "FR", placeholder: "Selecionar FR", customLabel: "Outra FR" },
  oxygenSat: { label: "Sat O₂", placeholder: "Selecionar saturação", customLabel: "Outra saturação" },
  glasgow: { label: "GCS", placeholder: "Selecionar", customLabel: "Outro Glasgow" },
};

const FIELD_PRESETS: Record<Exclude<AssessmentFieldId, "glasgow">, PresetOption[]> = {
  age: ["18", "25", "30", "40", "50", "60", "70", "80"].map((value) => ({ value, label: value })),
  sex: [
    { value: "Masculino", label: "Masculino" },
    { value: "Feminino", label: "Feminino" },
  ],
  weightKg: ["40", "50", "60", "70", "80", "90", "100", "120"].map((value) => ({ value, label: value })),
  heightCm: ["140", "150", "160", "170", "180", "190", "200", "210"].map((value) => ({ value, label: value })),
  heartRate: ["50", "60", "70", "80", "90", "100", "110", "120", "140", "160"].map((value) => ({ value, label: value })),
  systolic: ["70", "80", "90", "100", "110", "120", "140", "160", "180", "200", "220"].map((value) => ({ value, label: value })),
  diastolic: ["40", "50", "60", "70", "80", "90", "100", "110", "120", "130", "140"].map((value) => ({ value, label: value })),
  respiratoryRate: ["8", "10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "40"].map((value) => ({ value, label: value })),
  oxygenSat: ["80", "84", "88", "90", "92", "94", "96", "98", "100"].map((value) => ({ value, label: `${value}%` })),
};

const GCS_EYE_OPTIONS = [
  { score: 4 as const, label: "4", detail: "Espontânea" },
  { score: 3 as const, label: "3", detail: "Ao chamado" },
  { score: 2 as const, label: "2", detail: "À dor" },
  { score: 1 as const, label: "1", detail: "Ausente" },
];

const GCS_VERBAL_OPTIONS = [
  { score: 5 as const, label: "5", detail: "Orientado" },
  { score: 4 as const, label: "4", detail: "Confuso" },
  { score: 3 as const, label: "3", detail: "Palavras" },
  { score: 2 as const, label: "2", detail: "Sons" },
  { score: 1 as const, label: "1", detail: "Ausente" },
];

const GCS_MOTOR_OPTIONS = [
  { score: 6 as const, label: "6", detail: "Obedece" },
  { score: 5 as const, label: "5", detail: "Localiza dor" },
  { score: 4 as const, label: "4", detail: "Retira" },
  { score: 3 as const, label: "3", detail: "Flexão" },
  { score: 2 as const, label: "2", detail: "Extensão" },
  { score: 1 as const, label: "1", detail: "Ausente" },
];

const DIAGNOSTIC_INTERACTIVE_GROUPS = [
  {
    id: "systems",
    title: "Achados por sistema",
    items: [
      { id: "skin", label: "Pele / mucosa", hint: "urticária, prurido, flushing, angioedema" },
      { id: "resp", label: "Respiratório inferior", hint: "dispneia, sibilância, broncoespasmo, hipoxemia" },
      { id: "circ", label: "Circulatório", hint: "hipotensão, síncope, colapso, má perfusão" },
      { id: "gi", label: "Gastrointestinal", hint: "dor abdominal intensa, vômitos repetidos, diarreia" },
    ],
  },
  {
    id: "severity",
    title: "Sinais de gravidade",
    items: [
      { id: "hypotension", label: "Hipotensão / choque", hint: "queda de PA, colapso, pele fria, má perfusão" },
      { id: "stridor", label: "Estridor / edema laríngeo", hint: "voz abafada, rouquidão, via aérea superior" },
      { id: "hypoxemia", label: "Hipoxemia / cianose", hint: "dessaturação, esforço respiratório importante" },
      { id: "neuro", label: "Rebaixamento / síncope", hint: "alteração do nível de consciência, desmaio" },
    ],
  },
] as const;

const REASSESSMENT_INTERACTIVE_GROUPS = [
  {
    id: "residual",
    title: "Sintomas nesta reavaliação",
    items: [
      { id: "skin", label: "Pele / mucosa", hint: "urticária, prurido, flushing, angioedema" },
      { id: "resp", label: "Respiratório inferior", hint: "dispneia, sibilância, broncoespasmo, hipoxemia" },
      { id: "gi", label: "Gastrointestinal", hint: "dor abdominal, vômitos, diarreia" },
    ],
  },
  {
    id: "severity",
    title: "Marcadores graves nesta reavaliação",
    items: [
      { id: "hypotension", label: "Hipotensão / choque", hint: "queda de PA, colapso, má perfusão" },
      { id: "stridor", label: "Estridor / edema laríngeo", hint: "voz abafada, rouquidão, via aérea superior" },
      { id: "hypoxemia", label: "Hipoxemia / falha respiratória", hint: "dessaturação, cianose, esforço importante" },
      { id: "neuro", label: "Rebaixamento / síncope", hint: "alteração de consciência ou perda de proteção de via aérea" },
    ],
  },
] as const;

function treeRegionForNode(nodeId: string): TreeRegionId {
  switch (nodeId) {
    case "diagnostic_entry":
    case "not_anaphylaxis_exit":
    case "localized_reaction_support":
      return "entry";
    case "immediate_im_epinephrine":
      return "first_line";
    case "severity_stratification":
    case "moderate_support_bundle":
    case "severe_resuscitation_bundle":
      return "severity";
    case "reassessment_after_first_im":
    case "repeat_im_epinephrine":
    case "reassessment_after_second_im":
    case "observation_phase":
      return "reassessment";
    case "critical_escalation_bundle":
    case "post_escalation_decision":
    case "transition_to_airway_module":
    case "transition_to_ventilation_module":
    case "transition_to_vasoactive_module":
      return "escalation";
    default:
      return "disposition";
  }
}

function ClinicalFieldButton({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  const hasValue = value.trim().length > 0;

  return (
    <Pressable style={[styles.selectorCard, hasValue && styles.selectorCardFilled]} onPress={onPress}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorRow}>
        <Text style={[styles.selectorValue, !hasValue && styles.selectorPlaceholder]}>
          {hasValue ? value : placeholder}
        </Text>
        <Text style={[styles.selectorChevron, hasValue && styles.selectorChevronFilled]}>›</Text>
      </View>
    </Pressable>
  );
}

function ActionPlanChoiceButton({
  value,
  valueLabel,
  placeholder,
  onPress,
}: {
  value: string;
  valueLabel: string;
  placeholder: string;
  onPress: () => void;
}) {
  const hasValue = value.trim().length > 0;

  return (
    <Pressable style={[styles.selectorCard, hasValue && styles.selectorCardFilled, styles.actionPlanSelectorButton]} onPress={onPress}>
      <Text style={styles.selectorLabel}>Conduta definida</Text>
      <View style={styles.selectorRow}>
        <Text style={[styles.selectorValue, !hasValue && styles.selectorPlaceholder]}>
          {hasValue ? valueLabel : placeholder}
        </Text>
        <Text style={[styles.selectorChevron, hasValue && styles.selectorChevronFilled]}>›</Text>
      </View>
    </Pressable>
  );
}

function actionOption(value: string, detail?: string): ActionPlanOption {
  return { value, label: value, detail };
}

function actionGroup(id: string, title: string, hint: string): ActionPlanGroup {
  return { id, title, hint };
}

function getActionPlanOption(card: ActionPlanCard, value: string | undefined) {
  if (!value || !card.options?.length) return undefined;
  return card.options.find((option) => option.value === value);
}

function getActionPlanChoiceLabel(card: ActionPlanCard, value: string | undefined) {
  if (!value) return "";
  return getActionPlanOption(card, value)?.label ?? value;
}

function createEmptyClinicalInputs(): ClinicalInputs {
  return {
    age: "",
    sex: "",
    weightKg: "",
    heightCm: "",
    heartRate: "",
    systolic: "",
    diastolic: "",
    respiratoryRate: "",
    oxygenSat: "",
    gcsEye: undefined,
    gcsVerbal: undefined,
    gcsMotor: undefined,
  };
}

function deriveMetricsFromInputs(clinicalInputs: ClinicalInputs) {
  const systolic = parseNumericInput(clinicalInputs.systolic);
  const diastolic = parseNumericInput(clinicalInputs.diastolic);
  const map = systolic != null && diastolic != null ? Math.round(diastolic + (systolic - diastolic) / 3) : null;
  const gcsTotal =
    clinicalInputs.gcsEye != null && clinicalInputs.gcsVerbal != null && clinicalInputs.gcsMotor != null
      ? clinicalInputs.gcsEye + clinicalInputs.gcsVerbal + clinicalInputs.gcsMotor
      : null;

  return { map, gcsTotal };
}

function assessmentContextForStep(stepId: string): AssessmentContextId {
  switch (stepId) {
    case "severity_stratification":
    case "moderate_support_bundle":
    case "severe_resuscitation_bundle":
    case "reassessment_after_first_im":
    case "repeat_im_epinephrine":
      return "post_first_im";
    case "reassessment_after_second_im":
    case "critical_escalation_bundle":
    case "post_escalation_decision":
    case "observation_phase":
    case "observation_disposition":
      return "post_second_im";
    default:
      return "initial";
  }
}

function buildAutoFindingContext(clinicalInputs: ClinicalInputs, derivedMetrics: { map: number | null; gcsTotal: number | null }) {
  const systolic = parseNumericInput(clinicalInputs.systolic);
  const respiratoryRate = parseNumericInput(clinicalInputs.respiratoryRate);
  const oxygenSat = parseNumericInput(clinicalInputs.oxygenSat);
  const autoPositiveIds = new Set<string>();
  const autoReasons: Record<string, string[]> = {};

  const mark = (findingId: string, reason: string) => {
    autoPositiveIds.add(findingId);
    autoReasons[findingId] = [...(autoReasons[findingId] ?? []), reason];
  };

  if (oxygenSat != null && oxygenSat <= 92) {
    mark("hypoxemia", `Sat O₂ ${oxygenSat}%`);
    mark("resp", `Sat O₂ ${oxygenSat}%`);
  }

  if (respiratoryRate != null && respiratoryRate >= 25) {
    mark("resp", `FR ${respiratoryRate} irpm`);
  }

  if (systolic != null && systolic < 90) {
    mark("circ", `PAS ${systolic} mmHg`);
    mark("hypotension", `PAS ${systolic} mmHg`);
  }

  if (derivedMetrics.map != null && derivedMetrics.map < 65) {
    mark("circ", `PAM ${derivedMetrics.map} mmHg`);
    mark("hypotension", `PAM ${derivedMetrics.map} mmHg`);
  }

  if (derivedMetrics.gcsTotal != null && derivedMetrics.gcsTotal <= 13) {
    mark("neuro", `Glasgow ${derivedMetrics.gcsTotal}`);
  }

  return { autoPositiveIds, autoReasons };
}

function mergeContextClinicalInputs(
  initialInputs: ClinicalInputs,
  contextInputs: ClinicalInputs,
  contextId: AssessmentContextId,
): ClinicalInputs {
  if (contextId === "initial") {
    return contextInputs;
  }

  return {
    ...contextInputs,
    age: contextInputs.age || initialInputs.age,
    sex: contextInputs.sex || initialInputs.sex,
    weightKg: contextInputs.weightKg || initialInputs.weightKg,
    heightCm: contextInputs.heightCm || initialInputs.heightCm,
  };
}

function ClinicalFieldSheet({
  fieldId,
  visible,
  clinicalInputs,
  derivedMetrics,
  onClose,
  onClinicalInputChange,
}: {
  fieldId: AssessmentFieldId | null;
  visible: boolean;
  clinicalInputs: ClinicalInputs;
  derivedMetrics: { map: number | null; gcsTotal: number | null };
  onClose: () => void;
  onClinicalInputChange: (field: keyof ClinicalInputs, value: string | GlasgowValue) => void;
}) {
  const [search, setSearch] = useState("");
  const [otherText, setOtherText] = useState("");
  const isGlasgow = fieldId === "glasgow";

  useEffect(() => {
    if (!visible || fieldId == null) {
      return;
    }

    setSearch("");
    if (!isGlasgow && fieldId in clinicalInputs) {
      const value = clinicalInputs[fieldId as keyof ClinicalInputs];
      setOtherText(typeof value === "string" ? value : "");
    } else {
      setOtherText("");
    }
  }, [visible, fieldId, clinicalInputs, isGlasgow]);

  if (!visible || fieldId == null) {
    return null;
  }

  const meta = ASSESSMENT_FIELD_META[fieldId];
  const presets = isGlasgow ? [] : FIELD_PRESETS[fieldId as Exclude<AssessmentFieldId, "glasgow">];
  const filteredPresets = presets.filter((preset) => preset.label.toLowerCase().includes(search.trim().toLowerCase()));

  const submitOther = () => {
    if (isGlasgow || !otherText.trim()) {
      return;
    }
    onClinicalInputChange(fieldId as keyof ClinicalInputs, otherText.trim());
    onClose();
  };

  const clearGlasgow = () => {
    onClinicalInputChange("gcsEye", undefined);
    onClinicalInputChange("gcsVerbal", undefined);
    onClinicalInputChange("gcsMotor", undefined);
    onClose();
  };

  const applyGlasgow = () => {
    if (derivedMetrics.gcsTotal == null) {
      return;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{meta.label}</Text>
            <Text style={styles.sheetContext}>{isGlasgow ? "Sinais vitais e exame clínico" : "Dados iniciais"}</Text>
          </View>
          <Pressable style={styles.sheetCloseButton} onPress={onClose}>
            <Text style={styles.sheetCloseText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {isGlasgow ? (
            <View style={styles.sheetGcsCard}>
              <Text style={styles.sheetGcsTitle}>Calculadora Glasgow</Text>
              <Text style={styles.sheetGcsHint}>Selecione ocular, verbal e motora. O total é calculado automaticamente.</Text>

              <View style={styles.gcsSection}>
                <Text style={styles.gcsSectionTitle}>Abertura ocular</Text>
                {GCS_EYE_OPTIONS.map((option) => (
                  <Pressable
                    key={`sheet-eye-${option.score}`}
                    style={[styles.sheetGcsOption, clinicalInputs.gcsEye === option.score && styles.sheetGcsOptionActive]}
                    onPress={() => onClinicalInputChange("gcsEye", option.score)}>
                    <Text style={[styles.sheetGcsScore, clinicalInputs.gcsEye === option.score && styles.sheetGcsScoreActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.sheetGcsOptionText, clinicalInputs.gcsEye === option.score && styles.sheetGcsOptionTextActive]}>
                      {option.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.gcsSection}>
                <Text style={styles.gcsSectionTitle}>Resposta verbal</Text>
                {GCS_VERBAL_OPTIONS.map((option) => (
                  <Pressable
                    key={`sheet-verbal-${option.score}`}
                    style={[styles.sheetGcsOption, clinicalInputs.gcsVerbal === option.score && styles.sheetGcsOptionActive]}
                    onPress={() => onClinicalInputChange("gcsVerbal", option.score)}>
                    <Text style={[styles.sheetGcsScore, clinicalInputs.gcsVerbal === option.score && styles.sheetGcsScoreActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.sheetGcsOptionText, clinicalInputs.gcsVerbal === option.score && styles.sheetGcsOptionTextActive]}>
                      {option.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.gcsSection}>
                <Text style={styles.gcsSectionTitle}>Resposta motora</Text>
                {GCS_MOTOR_OPTIONS.map((option) => (
                  <Pressable
                    key={`sheet-motor-${option.score}`}
                    style={[styles.sheetGcsOption, clinicalInputs.gcsMotor === option.score && styles.sheetGcsOptionActive]}
                    onPress={() => onClinicalInputChange("gcsMotor", option.score)}>
                    <Text style={[styles.sheetGcsScore, clinicalInputs.gcsMotor === option.score && styles.sheetGcsScoreActive]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.sheetGcsOptionText, clinicalInputs.gcsMotor === option.score && styles.sheetGcsOptionTextActive]}>
                      {option.detail}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.sheetGcsFooter}>
                <View>
                  <Text style={styles.sheetGcsTotalLabel}>Total Glasgow</Text>
                  <Text style={styles.sheetGcsTotalValue}>{derivedMetrics.gcsTotal ?? "—"}</Text>
                </View>
                <View style={styles.sheetGcsActions}>
                  <Pressable style={styles.sheetSecondaryButton} onPress={clearGlasgow}>
                    <Text style={styles.sheetSecondaryButtonText}>Limpar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.sheetPrimaryButton, derivedMetrics.gcsTotal == null && styles.sheetPrimaryButtonDisabled]}
                    onPress={applyGlasgow}>
                    <Text style={styles.sheetPrimaryButtonText}>Usar total</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <>
              {presets.length > 6 ? (
                <View style={styles.sheetSearchWrap}>
                  <Text style={styles.sheetSearchIcon}>🔍</Text>
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Buscar..."
                    placeholderTextColor="#7c8ba1"
                    style={styles.sheetSearchInput}
                  />
                </View>
              ) : null}

              <View style={styles.sheetCardGrid}>
                {filteredPresets.map((preset) => {
                  const selectedValue = String(clinicalInputs[fieldId as keyof ClinicalInputs] ?? "");
                  const active = selectedValue === preset.value;
                  return (
                    <Pressable
                      key={`${fieldId}-${preset.value}`}
                      style={[styles.sheetPresetCard, active && styles.sheetPresetCardActive]}
                      onPress={() => {
                        onClinicalInputChange(fieldId as keyof ClinicalInputs, active ? "" : preset.value);
                        onClose();
                      }}>
                      <Text style={[styles.sheetPresetValue, active && styles.sheetPresetValueActive]}>{preset.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sheetCustomWrap}>
                <Text style={styles.sheetCustomLabel}>Outro:</Text>
                <View style={styles.sheetCustomRow}>
                  <TextInput
                    value={otherText}
                    onChangeText={setOtherText}
                    placeholder="Descrever livremente..."
                    placeholderTextColor="#7c8ba1"
                    keyboardType="numbers-and-punctuation"
                    style={styles.sheetCustomInput}
                    returnKeyType="done"
                    onSubmitEditing={submitOther}
                  />
                  <Pressable style={[styles.sheetCustomAdd, !otherText.trim() && styles.sheetCustomAddDim]} onPress={submitOther}>
                    <Text style={styles.sheetCustomAddText}>+ Add</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function ActionPlanChoiceSheet({
  activeSheet,
  visible,
  currentChoice,
  onClose,
  onSelect,
}: {
  activeSheet: ActiveActionPlanSheet;
  visible: boolean;
  currentChoice: string;
  onClose: () => void;
  onSelect: (choice: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    if (!visible) return;
    setSearch("");
    if (activeSheet && currentChoice && !getActionPlanOption(activeSheet.card, currentChoice)) {
      setOtherText(currentChoice);
      return;
    }
    setOtherText("");
  }, [visible, activeSheet, currentChoice]);

  if (!visible || !activeSheet || !activeSheet.card.options?.length) {
    return null;
  }

  const recommendedOption = getActionPlanOption(activeSheet.card, activeSheet.card.defaultChoice);
  const alternativeOptions = activeSheet.card.options.filter((option) => option.value !== recommendedOption?.value);
  const filteredOptions = alternativeOptions.filter((option) =>
    `${option.label} ${option.detail ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const submitOther = () => {
    const value = otherText.trim();
    if (!value) return;
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle}>{activeSheet.card.title}</Text>
            <Text style={styles.sheetContext}>Recomendação clínica</Text>
          </View>
          <Pressable style={styles.sheetCloseButton} onPress={onClose}>
            <Text style={styles.sheetCloseText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.actionPlanSheetDetail}>{activeSheet.card.detail}</Text>
          {activeSheet.card.rationale ? (
            <Text style={styles.actionPlanSheetRationale}>{activeSheet.card.rationale}</Text>
          ) : null}

          {recommendedOption ? (
            <View style={styles.recommendedPlanCard}>
              <Text style={styles.recommendedPlanEyebrow}>Sugestão para este caso</Text>
              <Text style={styles.recommendedPlanTitle}>{recommendedOption.label}</Text>
              {recommendedOption.detail ? <Text style={styles.recommendedPlanText}>{recommendedOption.detail}</Text> : null}
              <Pressable
                style={styles.sheetPrimaryButton}
                onPress={() => {
                  onSelect(currentChoice === recommendedOption.value ? "" : recommendedOption.value);
                  onClose();
                }}>
                <Text style={styles.sheetPrimaryButtonText}>Usar esta conduta</Text>
              </Pressable>
            </View>
          ) : null}

          {alternativeOptions.length > 6 ? (
            <View style={styles.sheetSearchWrap}>
              <Text style={styles.sheetSearchIcon}>🔍</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar..."
                placeholderTextColor="#7c8ba1"
                style={styles.sheetSearchInput}
              />
            </View>
          ) : null}

          {filteredOptions.length ? <Text style={styles.sheetSectionTitle}>Editar conduta</Text> : null}
          <View style={styles.sheetCardGrid}>
            {filteredOptions.map((option) => {
              const active = currentChoice === option.value;
              return (
                <Pressable
                  key={`${activeSheet.cardKey}:${option.value}`}
                  style={[styles.sheetPresetCard, styles.actionPlanSheetPresetCard, active && styles.sheetPresetCardActive]}
                  onPress={() => {
                    onSelect(active ? "" : option.value);
                    onClose();
                  }}>
                  <Text style={[styles.sheetPresetValue, active && styles.sheetPresetValueActive]}>{option.label}</Text>
                  {option.detail ? (
                    <Text style={[styles.sheetPresetDetail, active && styles.sheetPresetDetailActive]}>{option.detail}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sheetCustomWrap}>
            <Text style={styles.sheetCustomLabel}>Outro:</Text>
            <View style={styles.sheetCustomRow}>
              <TextInput
                value={otherText}
                onChangeText={setOtherText}
                placeholder="Descrever conduta livremente..."
                placeholderTextColor="#7c8ba1"
                style={styles.sheetCustomInput}
                returnKeyType="done"
                onSubmitEditing={submitOther}
              />
              <Pressable style={[styles.sheetCustomAdd, !otherText.trim() && styles.sheetCustomAddDim]} onPress={submitOther}>
                <Text style={styles.sheetCustomAddText}>+ Add</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function renderDiagnosticSupport(
  nodeId: string,
  assessmentContextId: AssessmentContextId,
  findingStates: Record<string, FindingState>,
  autoPositiveIds: Set<string>,
  autoReasons: Record<string, string[]>,
  clinicalInputs: ClinicalInputs,
  derivedMetrics: { map: number | null; gcsTotal: number | null },
  activeAssessmentTarget: AssessmentTarget,
  onOpenAssessmentField: (contextId: AssessmentContextId, fieldId: AssessmentFieldId) => void,
  onCloseAssessmentField: () => void,
  onClinicalInputChange: (contextId: AssessmentContextId, field: keyof ClinicalInputs, value: string | GlasgowValue) => void,
  onSelectFinding: (findingId: string, value: Exclude<FindingState, undefined>) => void,
  suggestion: {
    title: string;
    text: string;
    tone: "neutral" | "caution" | "strong" | "danger";
    criteriaStatus: string;
    classification: string;
    nextStep: string;
    recommendedChoice: string;
  },
) {
  const isActiveContextSheet = activeAssessmentTarget?.contextId === assessmentContextId;

  const renderReassessmentInputBlock = (title: string, hint: string) => (
    <View style={styles.assessmentCard}>
      <Text style={styles.assessmentTitle}>{title}</Text>
      <Text style={styles.assessmentText}>{hint}</Text>

      <View style={styles.assessmentGrid}>
        <ClinicalFieldButton
          label="PAS"
          value={clinicalInputs.systolic ? `${clinicalInputs.systolic} mmHg` : ""}
          placeholder="Selecionar"
          onPress={() => onOpenAssessmentField(assessmentContextId, "systolic")}
        />
        <ClinicalFieldButton
          label="PAD"
          value={clinicalInputs.diastolic ? `${clinicalInputs.diastolic} mmHg` : ""}
          placeholder="Selecionar"
          onPress={() => onOpenAssessmentField(assessmentContextId, "diastolic")}
        />
        <View style={[styles.inputCard, styles.metricCard]}>
          <Text style={styles.inputLabel}>PAM</Text>
          <Text style={styles.metricValue}>{derivedMetrics.map != null ? `${derivedMetrics.map} mmHg` : "Aguardando PAS/PAD"}</Text>
        </View>
        <ClinicalFieldButton
          label="FC"
          value={clinicalInputs.heartRate ? `${clinicalInputs.heartRate} bpm` : ""}
          placeholder="Selecionar"
          onPress={() => onOpenAssessmentField(assessmentContextId, "heartRate")}
        />
        <ClinicalFieldButton
          label="FR"
          value={clinicalInputs.respiratoryRate ? `${clinicalInputs.respiratoryRate} irpm` : ""}
          placeholder="Selecionar"
          onPress={() => onOpenAssessmentField(assessmentContextId, "respiratoryRate")}
        />
        <ClinicalFieldButton
          label="Sat O₂"
          value={clinicalInputs.oxygenSat ? `${clinicalInputs.oxygenSat}%` : ""}
          placeholder="Selecionar"
          onPress={() => onOpenAssessmentField(assessmentContextId, "oxygenSat")}
        />
        <ClinicalFieldButton
          label="GCS"
          value={derivedMetrics.gcsTotal != null ? `Total ${derivedMetrics.gcsTotal}` : ""}
          placeholder="Selecionar"
          onPress={() => onOpenAssessmentField(assessmentContextId, "glasgow")}
        />
      </View>

      <ClinicalFieldSheet
        fieldId={isActiveContextSheet ? activeAssessmentTarget?.fieldId ?? null : null}
        visible={isActiveContextSheet}
        clinicalInputs={clinicalInputs}
        derivedMetrics={derivedMetrics}
        onClose={onCloseAssessmentField}
        onClinicalInputChange={(field, value) => onClinicalInputChange(assessmentContextId, field, value)}
      />
    </View>
  );

  const renderReassessmentFindingsBlock = (title: string) => (
    <View style={styles.interactiveSection}>
      {REASSESSMENT_INTERACTIVE_GROUPS.map((group) => (
        <View key={`${title}-${group.id}`} style={styles.interactiveGroup}>
          <Text style={styles.interactiveGroupTitle}>{group.title}</Text>
          <View style={styles.findingGrid}>
            {group.items.map((item) => {
              const state = findingStates[item.id];
              const isAutoPositive = autoPositiveIds.has(item.id);
              return (
                <View key={item.id} style={styles.findingCard}>
                  <View style={styles.findingHeader}>
                    <View style={styles.findingLabelRow}>
                      <Text style={styles.findingLabel}>{item.label}</Text>
                      {isAutoPositive ? (
                        <View style={styles.autoBadge}>
                          <Text style={styles.autoBadgeText}>Auto positivo</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.findingHint}>{item.hint}</Text>
                    {isAutoPositive && autoReasons[item.id]?.length ? (
                      <Text style={styles.autoReasonText}>{autoReasons[item.id].join(" · ")}</Text>
                    ) : null}
                  </View>
                  <View style={styles.findingSegmentedControl}>
                    <Pressable
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.findingButton,
                        styles.findingSegmentButton,
                        pressed && styles.findingButtonPressed,
                        state === "yes" && styles.findingButtonYesActive,
                      ]}
                      onPress={() => onSelectFinding(item.id, "yes")}>
                      <Text style={[styles.findingButtonText, styles.findingSegmentButtonText, state === "yes" && styles.findingButtonTextYesActive]}>
                        {isAutoPositive && state === "yes" ? "Auto / Sim" : "Sim"}
                      </Text>
                    </Pressable>
                    <Pressable
                      hitSlop={6}
                      style={({ pressed }) => [
                        styles.findingButton,
                        styles.findingSegmentButton,
                        pressed && styles.findingButtonPressed,
                        state === "no" && styles.findingButtonNoActive,
                      ]}
                      onPress={() => onSelectFinding(item.id, "no")}>
                      <Text style={[styles.findingButtonText, styles.findingSegmentButtonText, state === "no" && styles.findingButtonTextNoActive]}>
                        Não
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  if (nodeId === "severity_stratification") {
    const systolic = parseNumericInput(clinicalInputs.systolic);
    const oxygenSat = parseNumericInput(clinicalInputs.oxygenSat);
    const respiratoryRate = parseNumericInput(clinicalInputs.respiratoryRate);
    const severeChecks = [
      {
        label: "Choque / hipotensão persistente",
        active: findingStates.hypotension === "yes" || findingStates.circ === "yes" || (systolic != null && systolic < 90) || (derivedMetrics.map != null && derivedMetrics.map < 65),
        detail:
          systolic != null && derivedMetrics.map != null
            ? `PAS ${systolic} mmHg · PAM ${derivedMetrics.map} mmHg`
            : "Verificar PA, perfusão periférica, enchimento capilar e síncope/colapso.",
      },
      {
        label: "Via aérea superior ameaçada",
        active: findingStates.stridor === "yes",
        detail: "Estridor, voz abafada, rouquidão progressiva, edema laríngeo ou dificuldade para manter via aérea.",
      },
      {
        label: "Hipoxemia / insuficiência respiratória",
        active: findingStates.hypoxemia === "yes" || findingStates.resp === "yes" || (oxygenSat != null && oxygenSat <= 92) || (respiratoryRate != null && respiratoryRate >= 25),
        detail:
          oxygenSat != null || respiratoryRate != null
            ? `Sat O₂ ${oxygenSat != null ? `${oxygenSat}%` : "não informada"} · FR ${respiratoryRate != null ? `${respiratoryRate} irpm` : "não informada"}`
            : "Observar esforço respiratório, cianose, ausculta e necessidade de O₂ em alta oferta.",
      },
      {
        label: "Rebaixamento / risco neurológico",
        active: findingStates.neuro === "yes" || (derivedMetrics.gcsTotal != null && derivedMetrics.gcsTotal <= 13),
        detail: derivedMetrics.gcsTotal != null ? `Glasgow ${derivedMetrics.gcsTotal}` : "Checar síncope, confusão, rebaixamento ou incapacidade de proteger via aérea.",
      },
    ];
    const activeSevereChecks = severeChecks.filter((item) => item.active);
    const recommendedBranch = activeSevereChecks.length > 0
      ? "Sim — há ameaça imediata à vida"
      : "Não — segue sem choque/falência de via aérea";

    return (
      <View style={styles.supportStack}>
        {renderReassessmentInputBlock(
          "Dados da reavaliação após a 1ª adrenalina",
          "Registre aqui os sinais vitais e o exame deste momento. Esta etapa não deve reutilizar automaticamente os dados da entrada.",
        )}
        {renderReassessmentFindingsBlock("Reavaliação pós-1ª adrenalina")}
        <View style={styles.assessmentCard}>
          <Text style={styles.assessmentTitle}>Checagem objetiva após a 1ª adrenalina</Text>
          <Text style={styles.assessmentText}>
            Antes de escolher a conduta, confirme se ainda há ameaça imediata de via aérea, respiração, circulação ou consciência.
          </Text>

          <View style={styles.severityChecklist}>
            {severeChecks.map((item) => (
              <View
                key={item.label}
                style={[styles.severityCheckCard, item.active ? styles.severityCheckCardActive : styles.severityCheckCardInactive]}>
                <Text style={[styles.severityCheckStatus, item.active ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                  {item.active ? "Presente" : "Ausente / não evidente"}
                </Text>
                <Text style={styles.severityCheckTitle}>{item.label}</Text>
                <Text style={styles.severityCheckText}>{item.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.suggestionCard, activeSevereChecks.length > 0 ? styles.suggestionCardDanger : styles.suggestionCardStrong]}>
          <Text style={styles.suggestionTitle}>
            {activeSevereChecks.length > 0 ? "O sistema sugere conduta grave" : "O sistema sugere conduta moderada"}
          </Text>
          <Text style={styles.suggestionText}>
            {activeSevereChecks.length > 0
              ? "Há pelo menos um marcador maior de ameaça imediata à vida. O próximo passo deve priorizar ressuscitação, O₂ em alta oferta, acesso calibroso e preparo de via aérea."
              : "Até aqui não há marcador maior obrigatório de choque ou falência iminente de via aérea. O próximo passo pode seguir na conduta moderada, com suporte e nova reavaliação curta."}
          </Text>
          <View style={styles.suggestionSummaryGrid}>
            <View style={styles.suggestionSummaryItem}>
              <Text style={styles.suggestionSummaryLabel}>Conduta sugerida</Text>
              <Text style={styles.suggestionSummaryValue}>{recommendedBranch}</Text>
            </View>
            <View style={styles.suggestionSummaryItem}>
              <Text style={styles.suggestionSummaryLabel}>Marcadores maiores</Text>
              <Text style={styles.suggestionSummaryValue}>
                {activeSevereChecks.length > 0 ? activeSevereChecks.map((item) => item.label).join(" · ") : "Nenhum marcador maior identificado"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (nodeId === "reassessment_after_first_im" || nodeId === "reassessment_after_second_im") {
    const systolic = parseNumericInput(clinicalInputs.systolic);
    const oxygenSat = parseNumericInput(clinicalInputs.oxygenSat);
    const respiratoryRate = parseNumericInput(clinicalInputs.respiratoryRate);
    const hasShock = findingStates.hypotension === "yes" || findingStates.circ === "yes" || (systolic != null && systolic < 90) || (derivedMetrics.map != null && derivedMetrics.map < 65);
    const hasAirwayThreat = findingStates.stridor === "yes";
    const hasRespFailure =
      findingStates.hypoxemia === "yes" || (oxygenSat != null && oxygenSat <= 92) || (respiratoryRate != null && respiratoryRate >= 25);
    const hasNeuroRisk = findingStates.neuro === "yes" || (derivedMetrics.gcsTotal != null && derivedMetrics.gcsTotal <= 13);
    const severePersistence = hasShock || hasAirwayThreat || hasRespFailure || hasNeuroRisk;
    const residualSymptoms =
      findingStates.skin === "yes" || findingStates.gi === "yes" || findingStates.resp === "yes";
    const reassessmentLabel = nodeId === "reassessment_after_first_im" ? "5 minutos após a 1ª adrenalina" : "5 minutos após a 2ª adrenalina";
    const criticalReasons: string[] = [];
    const residualReasons: string[] = [];
    const missingData: string[] = [];

    if (hasShock) {
      criticalReasons.push(
        systolic != null || derivedMetrics.map != null
          ? `Perfusão ainda inadequada: PAS ${systolic != null ? `${systolic} mmHg` : "?"} · PAM ${derivedMetrics.map != null ? `${derivedMetrics.map} mmHg` : "?"}`
          : "Persistem hipotensão, choque ou sinais de má perfusão.",
      );
    }

    if (hasAirwayThreat) {
      criticalReasons.push("Há estridor, edema laríngeo ou ameaça progressiva à via aérea superior.");
    }

    if (hasRespFailure) {
      criticalReasons.push(
        oxygenSat != null || respiratoryRate != null
          ? `Respiração ainda ameaçada: Sat O₂ ${oxygenSat != null ? `${oxygenSat}%` : "?"} · FR ${respiratoryRate != null ? `${respiratoryRate} irpm` : "?"}`
          : "Persistem hipoxemia, broncoespasmo grave ou falha respiratória.",
      );
    }

    if (hasNeuroRisk) {
      criticalReasons.push(
        derivedMetrics.gcsTotal != null
          ? `Consciência ainda comprometida: Glasgow ${derivedMetrics.gcsTotal}.`
          : "Persistem síncope, rebaixamento ou risco de perda de proteção de via aérea.",
      );
    }

    if (findingStates.resp === "yes" && !hasRespFailure) {
      residualReasons.push("Persistem sintomas respiratórios, mas sem critério atual de falência respiratória.");
    }
    if (findingStates.skin === "yes") {
      residualReasons.push("Persistem manifestações cutâneo-mucosas.");
    }
    if (findingStates.gi === "yes") {
      residualReasons.push("Persistem sintomas gastrointestinais.");
    }

    if (systolic == null || derivedMetrics.map == null) missingData.push("PA/PAM");
    if (oxygenSat == null) missingData.push("Sat O₂");
    if (derivedMetrics.gcsTotal == null) missingData.push("Glasgow");

    const isFirstLoop = nodeId === "reassessment_after_first_im";
    const recommendation =
      isFirstLoop
        ? severePersistence
          ? "Piora, choque ou ameaça de via aérea"
          : residualSymptoms
            ? "Sintomas persistentes sem choque/falência de via aérea"
            : "Melhora importante / quase resolução"
        : severePersistence
          ? "Ainda instável ou refratário"
          : "Melhora clara / estabilizado";
    const recommendationRationale = severePersistence
      ? criticalReasons
      : residualSymptoms && isFirstLoop
        ? residualReasons
        : [
            isFirstLoop
              ? "Não há marcador maior de choque, ameaça de via aérea, falência respiratória ou rebaixamento."
              : "Depois da 2ª dose IM, o quadro parece hemodinamicamente e respiratoriamente controlado para seguir em observação monitorizada.",
            !isFirstLoop && residualReasons.length > 0
              ? `Ainda assim, manter observação porque restam sintomas: ${residualReasons.join(" · ")}`
              : "Mesmo com boa resposta, a próxima etapa continua sendo observação vigilante para recaída.",
          ];
    const branchCards = isFirstLoop
      ? [
          {
            label: "Melhora importante / quase resolução",
            active: !severePersistence && !residualSymptoms,
            status: !severePersistence && !residualSymptoms ? "Mais coerente agora" : "Não é o melhor encaixe",
            detail:
              "Escolha esta conduta apenas se os marcadores de gravidade sumiram e não restam sintomas clinicamente relevantes nesta checagem.",
            reasons: [
              "Sem choque, sem ameaça de via aérea, sem hipoxemia/fadiga e sem rebaixamento.",
              "Segue para observação; não significa alta imediata.",
            ],
          },
          {
            label: "Sintomas persistentes sem choque/falência de via aérea",
            active: !severePersistence && residualSymptoms,
            status: !severePersistence && residualSymptoms ? "Mais coerente agora" : "Não é o melhor encaixe",
            detail:
              "Use quando o paciente ainda está sintomático, mas sem instabilidade maior. O objetivo é repetir adrenalina IM e continuar monitorização curta.",
            reasons:
              residualReasons.length > 0
                ? residualReasons
                : ["Persistência sintomática sem marcador maior exige nova dose e nova reavaliação em curto intervalo."],
          },
          {
            label: "Piora, choque ou ameaça de via aérea",
            active: severePersistence,
            status: severePersistence ? "Mais coerente agora" : "Não é o melhor encaixe",
            detail:
              "Esta conduta é a correta se qualquer marcador maior persistiu ou apareceu na reavaliação, mesmo que outros sintomas tenham melhorado.",
            reasons:
              criticalReasons.length > 0
                ? criticalReasons
                : ["Basta um critério maior de instabilidade para priorizar escalonamento crítico."],
          },
        ]
      : [
          {
            label: "Melhora clara / estabilizado",
            active: !severePersistence,
            status: !severePersistence ? "Mais coerente agora" : "Não é o melhor encaixe",
            detail:
              "Depois da 2ª adrenalina IM, esta conduta exige controle hemodinâmico, respiratório e neurológico suficiente para seguir em observação monitorizada.",
            reasons: [
              "Sem marcador maior atual de choque, ameaça de via aérea, falha respiratória ou rebaixamento.",
              residualReasons.length > 0
                ? `Pode haver sintomas residuais leves, mas o destino seguinte continua sendo observação: ${residualReasons.join(" · ")}`
                : "Mesmo com resposta boa, o paciente ainda não sai do fluxo; entra em vigilância para recaída.",
            ],
          },
          {
            label: "Ainda instável ou refratário",
            active: severePersistence,
            status: severePersistence ? "Mais coerente agora" : "Não é o melhor encaixe",
            detail:
              "Após duas doses IM, persistência de instabilidade sugere anafilaxia refratária e justifica adrenalina IV, suporte avançado e UTI.",
            reasons:
              criticalReasons.length > 0
                ? criticalReasons
                : ["Persistência após duas doses IM muda o caso para escalonamento crítico."],
          },
        ];

    return (
      <View style={styles.supportStack}>
        {renderReassessmentInputBlock(
          isFirstLoop ? "Dados da reavaliação 5 min após a 1ª adrenalina" : "Dados da reavaliação 5 min após a 2ª adrenalina",
          "Atualize os dados deste momento antes de decidir a próxima conduta.",
        )}
        {renderReassessmentFindingsBlock("Loop de reavaliação")}
        <View style={styles.assessmentCard}>
          <View style={styles.reassessmentHeader}>
            <View style={styles.reassessmentHeaderText}>
              <Text style={styles.assessmentTitle}>Matriz da reavaliação</Text>
              <Text style={styles.assessmentText}>
                Compare o quadro atual com as condutas possíveis. O destaque mostra o encaixe mais coerente nesta janela clínica.
              </Text>
            </View>
            <View style={styles.reassessmentHeaderBadge}>
              <Text style={styles.reassessmentHeaderBadgeLabel}>Janela</Text>
              <Text style={styles.reassessmentHeaderBadgeValue}>{reassessmentLabel}</Text>
            </View>
          </View>
          <View style={styles.reassessmentMatrix}>
            {branchCards.map((card) => (
              <View
                key={card.label}
                style={[
                  styles.severityCheckCard,
                  styles.reassessmentDecisionCard,
                  card.active ? styles.severityCheckCardActive : styles.severityCheckCardInactive,
                  card.active && styles.reassessmentDecisionCardActive,
                ]}>
                <View style={styles.reassessmentDecisionHeader}>
                  <Text style={[styles.severityCheckStatus, card.active ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                    {card.status}
                  </Text>
                  {card.active ? (
                    <View style={styles.reassessmentDecisionPill}>
                      <Text style={styles.reassessmentDecisionPillText}>Conduta sugerida</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.severityCheckTitle}>{card.label}</Text>
                <Text style={styles.severityCheckText}>{card.detail}</Text>
                <View style={styles.reassessmentReasonsList}>
                  {card.reasons.map((reason) => (
                    <View key={`${card.label}:${reason}`} style={styles.reassessmentReasonRow}>
                      <View style={styles.reassessmentReasonDot} />
                      <Text style={styles.reassessmentReasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.suggestionCard, severePersistence ? styles.suggestionCardDanger : residualSymptoms ? styles.suggestionCardCaution : styles.suggestionCardStrong]}>
          <Text style={styles.suggestionTitle}>Síntese da decisão</Text>
          <Text style={styles.suggestionText}>
            {severePersistence
              ? "Persistem marcadores maiores de instabilidade. Um único critério maior já pesa a favor da conduta crítica."
              : residualSymptoms && isFirstLoop
                ? "Ainda há sintomas ativos, mas sem marcador maior obrigatório de choque ou falência iminente de via aérea."
                : "A resposta atual parece suficiente para sair do loop imediato e seguir em observação monitorizada."}
          </Text>
          <View style={styles.reassessmentSummaryLead}>
            <Text style={styles.reassessmentSummaryLeadLabel}>Próxima escolha sugerida</Text>
            <Text style={styles.reassessmentSummaryLeadValue}>{recommendation}</Text>
          </View>
          <View style={styles.suggestionSummaryGrid}>
            <View style={styles.suggestionSummaryItem}>
              <Text style={styles.suggestionSummaryLabel}>Base clínica usada</Text>
              <Text style={styles.suggestionSummaryValue}>{recommendationRationale.join(" · ")}</Text>
            </View>
            {missingData.length > 0 ? (
              <View style={styles.suggestionSummaryItem}>
                <Text style={styles.suggestionSummaryLabel}>Dados ainda faltantes</Text>
                <Text style={styles.suggestionSummaryValue}>
                  {`${missingData.join(" · ")}. A sugestão fica menos robusta sem esses campos.`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  if (nodeId === "post_escalation_decision") {
    const systolic = parseNumericInput(clinicalInputs.systolic);
    const oxygenSat = parseNumericInput(clinicalInputs.oxygenSat);
    const respiratoryRate = parseNumericInput(clinicalInputs.respiratoryRate);
    const airwayDominant = findingStates.stridor === "yes";
    const ventilationDominant =
      findingStates.hypoxemia === "yes" ||
      findingStates.resp === "yes" ||
      (oxygenSat != null && oxygenSat <= 90) ||
      (respiratoryRate != null && respiratoryRate >= 30);
    const hemodynamicDominant =
      findingStates.hypotension === "yes" ||
      findingStates.circ === "yes" ||
      (systolic != null && systolic < 90) ||
      (derivedMetrics.map != null && derivedMetrics.map < 65);
    const recommendation = airwayDominant
      ? "Necessita via aérea avançada / ISR"
      : ventilationDominant
        ? "Necessita fluxo de ventilação mecânica"
        : hemodynamicDominant
          ? "Necessita fluxo de infusão vasoativa"
          : "Estabilizou parcialmente, mas precisa de UTI";

    return (
      <View style={styles.supportStack}>
        <View style={styles.assessmentCard}>
          <Text style={styles.assessmentTitle}>Qual eixo crítico ainda predomina?</Text>
          <Text style={styles.assessmentText}>
            Depois do escalonamento, a saída crítica deve refletir qual suporte avançado segue dominando o quadro.
          </Text>
          <View style={styles.severityChecklist}>
            <View style={[styles.severityCheckCard, airwayDominant ? styles.severityCheckCardActive : styles.severityCheckCardInactive]}>
              <Text style={[styles.severityCheckStatus, airwayDominant ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                {airwayDominant ? "Predomina" : "Não predomina"}
              </Text>
              <Text style={styles.severityCheckTitle}>Via aérea superior</Text>
              <Text style={styles.severityCheckText}>Estridor, edema laríngeo, voz abafada progressiva ou necessidade de via aérea definitiva.</Text>
            </View>
            <View style={[styles.severityCheckCard, ventilationDominant ? styles.severityCheckCardActive : styles.severityCheckCardInactive]}>
              <Text style={[styles.severityCheckStatus, ventilationDominant ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                {ventilationDominant ? "Predomina" : "Não predomina"}
              </Text>
              <Text style={styles.severityCheckTitle}>Oxigenação / ventilação</Text>
              <Text style={styles.severityCheckText}>
                {`Sat O₂ ${oxygenSat != null ? `${oxygenSat}%` : "?"} · FR ${respiratoryRate != null ? `${respiratoryRate} irpm` : "?"} · observar fadiga, esforço e necessidade de ventilação.`}
              </Text>
            </View>
            <View style={[styles.severityCheckCard, hemodynamicDominant ? styles.severityCheckCardActive : styles.severityCheckCardInactive]}>
              <Text style={[styles.severityCheckStatus, hemodynamicDominant ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                {hemodynamicDominant ? "Predomina" : "Não predomina"}
              </Text>
              <Text style={styles.severityCheckTitle}>Perfusão / vasoativos</Text>
              <Text style={styles.severityCheckText}>
                {`PAS ${systolic != null ? `${systolic} mmHg` : "?"} · PAM ${derivedMetrics.map != null ? `${derivedMetrics.map} mmHg` : "?"} · reavaliar dependência de volume e adrenalina IV.`}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.suggestionCard, styles.suggestionCardDanger]}>
          <Text style={styles.suggestionTitle}>Transição crítica sugerida</Text>
          <Text style={styles.suggestionText}>
            O sistema orienta a saída crítica conforme o eixo de suporte que ainda domina o quadro após o escalonamento.
          </Text>
          <View style={styles.suggestionSummaryGrid}>
            <View style={styles.suggestionSummaryItem}>
              <Text style={styles.suggestionSummaryLabel}>Transição sugerida</Text>
              <Text style={styles.suggestionSummaryValue}>{recommendation}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (nodeId === "observation_disposition") {
    const oxygenSat = parseNumericInput(clinicalInputs.oxygenSat);
    const stillUnstable =
      findingStates.stridor === "yes" ||
      findingStates.hypotension === "yes" ||
      findingStates.hypoxemia === "yes" ||
      findingStates.neuro === "yes";
    const stillSymptomatic =
      findingStates.skin === "yes" ||
      findingStates.gi === "yes" ||
      findingStates.resp === "yes" ||
      findingStates.circ === "yes";
    const recommendation = stillUnstable
      ? "Precisa de UTI por gravidade ou risco de recaída"
      : stillSymptomatic
        ? "Precisa de observação monitorizada / enfermaria"
        : "Alta segura com orientação e retorno";

    return (
      <View style={styles.supportStack}>
        <View style={styles.assessmentCard}>
          <Text style={styles.assessmentTitle}>Checklist clínico para o destino final</Text>
          <Text style={styles.assessmentText}>
            Só considerar alta se a melhora for sustentada e sem nova ameaça de via aérea, respiração ou circulação.
          </Text>
          <View style={styles.severityChecklist}>
            <View style={[styles.severityCheckCard, stillUnstable ? styles.severityCheckCardActive : styles.severityCheckCardInactive]}>
              <Text style={[styles.severityCheckStatus, stillUnstable ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                {stillUnstable ? "Não apto à alta" : "Sem marcador maior"}
              </Text>
              <Text style={styles.severityCheckTitle}>Marcadores de gravidade residual</Text>
              <Text style={styles.severityCheckText}>Via aérea, hipotensão, hipoxemia, rebaixamento ou qualquer necessidade de suporte intensivo afastam alta.</Text>
            </View>
            <View style={[styles.severityCheckCard, stillSymptomatic ? styles.severityCheckCardActive : styles.severityCheckCardInactive]}>
              <Text style={[styles.severityCheckStatus, stillSymptomatic ? styles.severityCheckStatusActive : styles.severityCheckStatusInactive]}>
                {stillSymptomatic ? "Ainda sintomático" : "Sintomas resolvidos"}
              </Text>
              <Text style={styles.severityCheckTitle}>Resposta sustentada</Text>
              <Text style={styles.severityCheckText}>
                {`Sat O₂ ${oxygenSat != null ? `${oxygenSat}%` : "não informada"} · confirmar ausência de recrudescência respiratória, hemodinâmica ou edema de via aérea.`}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.suggestionCard, stillUnstable ? styles.suggestionCardDanger : stillSymptomatic ? styles.suggestionCardCaution : styles.suggestionCardStrong]}>
          <Text style={styles.suggestionTitle}>Destino mais seguro sugerido</Text>
          <Text style={styles.suggestionText}>
            {stillUnstable
              ? "Persistem marcadores de maior gravidade ou risco imediato. O fluxo favorece permanência em cuidado intensivo."
              : stillSymptomatic
                ? "Ainda há sintomas ou incerteza clínica suficiente para manter observação monitorizada."
                : "A evolução atual favorece alta apenas se a orientação, plano de retorno e critérios de segurança estiverem completos."}
          </Text>
          <View style={styles.suggestionSummaryGrid}>
            <View style={styles.suggestionSummaryItem}>
              <Text style={styles.suggestionSummaryLabel}>Destino sugerido</Text>
              <Text style={styles.suggestionSummaryValue}>{recommendation}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (nodeId !== "diagnostic_entry") {
    return null;
  }

  return (
      <View style={styles.supportStack}>
      <View style={styles.assessmentCard}>
        <Text style={styles.assessmentTitle}>Identificação e porte</Text>
        <Text style={styles.assessmentText}>
          Preencha idade, sexo, peso e altura para contextualizar o caso e estimar dose por peso quando necessário.
        </Text>

        <View style={styles.assessmentGrid}>
          <ClinicalFieldButton
            label="Idade"
            value={clinicalInputs.age ? `${clinicalInputs.age} anos` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "age")}
          />
          <ClinicalFieldButton
            label="Sexo"
            value={clinicalInputs.sex}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "sex")}
          />
          <ClinicalFieldButton
            label="Peso"
            value={clinicalInputs.weightKg ? `${clinicalInputs.weightKg} kg` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "weightKg")}
          />
          <ClinicalFieldButton
            label="Altura"
            value={clinicalInputs.heightCm ? `${clinicalInputs.heightCm} cm` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "heightCm")}
          />
        </View>
      </View>

      <View style={styles.assessmentCard}>
        <Text style={styles.assessmentTitle}>Sinais vitais iniciais</Text>
        <Text style={styles.assessmentText}>
          Registre PAS, PAD, PAM, FC, FR e Sat O₂. Esses dados orientam gravidade e conduta inicial.
        </Text>

        <View style={styles.assessmentGrid}>
          <ClinicalFieldButton
            label="PAS"
            value={clinicalInputs.systolic ? `${clinicalInputs.systolic} mmHg` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "systolic")}
          />
          <ClinicalFieldButton
            label="PAD"
            value={clinicalInputs.diastolic ? `${clinicalInputs.diastolic} mmHg` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "diastolic")}
          />
          <View style={[styles.inputCard, styles.metricCard]}>
            <Text style={styles.inputLabel}>PAM</Text>
            <Text style={styles.metricValue}>{derivedMetrics.map != null ? `${derivedMetrics.map} mmHg` : "Aguardando PAS/PAD"}</Text>
          </View>
          <ClinicalFieldButton
            label="FC"
            value={clinicalInputs.heartRate ? `${clinicalInputs.heartRate} bpm` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "heartRate")}
          />
          <ClinicalFieldButton
            label="FR"
            value={clinicalInputs.respiratoryRate ? `${clinicalInputs.respiratoryRate} irpm` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "respiratoryRate")}
          />
          <ClinicalFieldButton
            label="Sat O₂"
            value={clinicalInputs.oxygenSat ? `${clinicalInputs.oxygenSat}%` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "oxygenSat")}
          />
        </View>
      </View>

      <View style={styles.assessmentCard}>
        <Text style={styles.assessmentTitle}>Estado neurológico</Text>
        <Text style={styles.assessmentText}>
          Glasgow ajuda a identificar rebaixamento e risco de perda de via aérea.
        </Text>

        <View style={styles.assessmentGrid}>
          <ClinicalFieldButton
            label="GCS"
            value={derivedMetrics.gcsTotal != null ? `Total ${derivedMetrics.gcsTotal}` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField(assessmentContextId, "glasgow")}
          />
        </View>

        <ClinicalFieldSheet
          fieldId={activeAssessmentTarget?.contextId === assessmentContextId ? activeAssessmentTarget.fieldId : null}
          visible={activeAssessmentTarget?.contextId === assessmentContextId}
          clinicalInputs={clinicalInputs}
          derivedMetrics={derivedMetrics}
          onClose={onCloseAssessmentField}
          onClinicalInputChange={(field, value) => onClinicalInputChange(assessmentContextId, field, value)}
        />
      </View>

      <View style={styles.autoInfoCard}>
        <Text style={styles.autoInfoTitle}>Marcação automática</Text>
        <Text style={styles.autoInfoText}>
          Achados com selo <Text style={styles.autoInfoStrong}>Auto positivo</Text> foram inferidos pelos dados acima.
          Revise os demais e use <Text style={styles.autoInfoStrong}>Não</Text> se precisar corrigir a inferência.
        </Text>
      </View>

      <View style={styles.interactiveSection}>
        {DIAGNOSTIC_INTERACTIVE_GROUPS.map((group) => (
          <View key={group.id} style={styles.interactiveGroup}>
            <Text style={styles.interactiveGroupTitle}>{group.title}</Text>
            <View style={styles.findingGrid}>
              {group.items.map((item) => {
                const state = findingStates[item.id];
                const isAutoPositive = autoPositiveIds.has(item.id);
                return (
                  <View key={item.id} style={styles.findingCard}>
                    <View style={styles.findingHeader}>
                      <View style={styles.findingLabelRow}>
                        <Text style={styles.findingLabel}>{item.label}</Text>
                        {isAutoPositive ? (
                          <View style={styles.autoBadge}>
                            <Text style={styles.autoBadgeText}>Auto positivo</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.findingHint}>{item.hint}</Text>
                      {isAutoPositive && autoReasons[item.id]?.length ? (
                        <Text style={styles.autoReasonText}>{autoReasons[item.id].join(" · ")}</Text>
                      ) : null}
                    </View>
                    <View style={styles.findingActions}>
                      <Pressable
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.findingButton,
                          pressed && styles.findingButtonPressed,
                          state === "yes" && styles.findingButtonYesActive,
                        ]}
                        onPress={() => onSelectFinding(item.id, "yes")}>
                        <Text style={[styles.findingButtonText, state === "yes" && styles.findingButtonTextYesActive]}>
                          {isAutoPositive ? "Marcado automaticamente" : state === "yes" ? "Sim selecionado" : "Sim"}
                        </Text>
                      </Pressable>
                      <Pressable
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.findingButton,
                          pressed && styles.findingButtonPressed,
                          state === "no" && styles.findingButtonNoActive,
                        ]}
                        onPress={() => onSelectFinding(item.id, "no")}>
                        <Text style={[styles.findingButtonText, state === "no" && styles.findingButtonTextNoActive]}>
                          {state === "no" ? "Não selecionado" : "Não"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.suggestionCard,
          suggestion.tone === "danger" && styles.suggestionCardDanger,
          suggestion.tone === "strong" && styles.suggestionCardStrong,
          suggestion.tone === "caution" && styles.suggestionCardCaution,
        ]}>
        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
        <Text style={styles.suggestionText}>{suggestion.text}</Text>
        <View style={styles.suggestionSummaryGrid}>
          <View style={styles.suggestionSummaryItem}>
            <Text style={styles.suggestionSummaryLabel}>Critérios</Text>
            <Text style={styles.suggestionSummaryValue}>{suggestion.criteriaStatus}</Text>
          </View>
          <View style={styles.suggestionSummaryItem}>
            <Text style={styles.suggestionSummaryLabel}>Classificação</Text>
            <Text style={styles.suggestionSummaryValue}>{suggestion.classification}</Text>
          </View>
        </View>
        <View style={styles.suggestionNextCard}>
          <Text style={styles.suggestionNextLabel}>Próximo passo sugerido</Text>
          <Text style={styles.suggestionNextText}>{suggestion.nextStep}</Text>
          <Text style={styles.suggestionChoiceText}>Escolha sugerida abaixo: {suggestion.recommendedChoice}</Text>
        </View>
      </View>

    </View>
  );
}

function parseNumericInput(value: string) {
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  if (!normalized.trim()) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDoseMg(value: number) {
  return value.toFixed(value >= 0.3 ? 1 : 2).replace(".", ",");
}

function buildActionPlanCards(args: {
  stepId: string;
  clinicalInputs: ClinicalInputs;
  findingStates: Record<string, FindingState>;
  derivedMetrics: { map: number | null; gcsTotal: number | null };
}): ActionPlanCard[] {
  const { stepId, clinicalInputs, findingStates, derivedMetrics } = args;
  const isYes = (id: string) => findingStates[id] === "yes";
  const weight = parseNumericInput(clinicalInputs.weightKg);
  const systolic = parseNumericInput(clinicalInputs.systolic);
  const oxygenSat = parseNumericInput(clinicalInputs.oxygenSat);
  const respiratoryRate = parseNumericInput(clinicalInputs.respiratoryRate);
  const hasShock = isYes("hypotension") || isYes("circ") || (systolic != null && systolic < 90) || (derivedMetrics.map != null && derivedMetrics.map < 65);
  const hasRespDistress = isYes("resp") || isYes("hypoxemia") || (oxygenSat != null && oxygenSat <= 92) || (respiratoryRate != null && respiratoryRate >= 25);
  const hasImpendingAirway = isYes("stridor") || (oxygenSat != null && oxygenSat < 90);
  const hasNeuroCompromise = isYes("neuro") || (derivedMetrics.gcsTotal != null && derivedMetrics.gcsTotal <= 13);
  const hasCutaneousSymptoms = isYes("skin") || isYes("gi");
  const estimatedDose = weight != null ? Math.min(0.5, Math.max(0.1, Math.round(weight * 0.01 * 100) / 100)) : null;
  const standardDose = estimatedDose != null ? (estimatedDose >= 0.4 ? "0,5 mg IM" : "0,3 mg IM") : "0,5 mg IM";
  const adrenalineDetail = estimatedDose != null
    ? `Dose guiada por peso: ${formatDoseMg(estimatedDose)} mg IM na face lateral da coxa (${weight} kg; máximo 0,5 mg).`
    : "Peso ainda não informado. Escolha a dose IM institucional mais adequada ao porte clínico, sem atrasar a aplicação.";
  const adjuvantGroup = actionGroup("adjuvant", "Adjuvantes após estabilização", "Nunca substituem adrenalina e não tratam instabilidade hemodinâmica.");
  const h1AdjuvantCard: ActionPlanCard = {
    id: "antihistamine_adjuvant",
    group: adjuvantGroup,
    title: "Anti-H1 como adjuvante",
    detail: hasCutaneousSymptoms
      ? "Útil para urticária/prurido residuais após estabilização. Preferir via oral não sedante se o paciente estiver estável."
      : "Sem papel na correção de choque ou broncoespasmo; se a apresentação for localizada, pode aliviar sintomas cutâneos após estabilização.",
    rationale: "Antihistamínicos ajudam sintomas cutâneos, mas não tratam via aérea, respiração ou circulação.",
    tone: hasCutaneousSymptoms ? "info" : "success",
    options: [
      actionOption("Cetirizina VO", "Opção não sedante quando a via oral estiver liberada e o paciente estiver estável."),
      actionOption("Outro anti-H1 não sedante VO", "Alternativa equivalente para prurido/urticária persistentes após a fase aguda."),
      actionOption("Não indicado na fase aguda", "Se houver anafilaxia ativa, primeiro tratar a instabilidade com adrenalina e suporte."),
    ],
    defaultChoice: hasCutaneousSymptoms ? "Cetirizina VO" : "Não indicado na fase aguda",
  };
  const corticosteroidAdjuvantCard: ActionPlanCard = {
    id: "corticosteroid_adjuvant",
    group: adjuvantGroup,
    title: "Corticoide como adjuvante",
    detail: hasRespDistress
      ? "Pode ser considerado como adjuvante selecionado, sobretudo quando houver broncoespasmo persistente ou asma associada."
      : "Não é tratamento de primeira linha; se usado, deve ser encarado apenas como adjuvante após a estabilização clínica.",
    rationale: "O foco inicial permanece em adrenalina, oxigênio, volume e via aérea.",
    tone: hasRespDistress ? "warning" : "info",
    options: [
      actionOption("Hidrocortisona EV", "Opção adjuvante quando via oral não é possível ou o quadro respiratório ainda exige atenção."),
      actionOption("Dexametasona EV/IM/VO", "Alternativa adjuvante quando se quer dose única com duração mais longa."),
      actionOption("Não usar de rotina", "Conduta aceitável quando a prioridade é manter o foco na adrenalina e na monitorização."),
    ],
    defaultChoice: "Não usar de rotina",
  };
  const glucagonAdjuvantCard: ActionPlanCard = {
    id: "glucagon_adjuvant",
    group: adjuvantGroup,
    title: "Glucagon se uso de betabloqueador",
    detail: "Considere apenas se o paciente usa betabloqueador e responde inadequadamente à adrenalina.",
    rationale: "Adjuvante útil em anafilaxia refratária associada a betabloqueio, não como rotina.",
    tone: "warning",
    options: [
      actionOption("Não indicado por enquanto", "Se não houver betabloqueador ou se a resposta à adrenalina estiver adequada."),
      actionOption("Glucagon EV/IM", "Reservar para resposta inadequada à adrenalina em paciente sob betabloqueador."),
    ],
    defaultChoice: "Não indicado por enquanto",
  };

  switch (stepId) {
    case "immediate_im_epinephrine":
      return [
        {
          id: "adrenaline_im",
          group: actionGroup("now", "Fazer agora", "Primeiros minutos sem atraso."),
          title: "Adrenalina intramuscular imediata",
          detail: adrenalineDetail,
          rationale: "Primeira linha obrigatória quando a suspeita clínica de anafilaxia é alta.",
          tone: "danger",
          options: [
            actionOption("0,3 mg IM", "Opção prática para adulto menor porte quando a estimativa por peso cair perto de 0,3 mg."),
            actionOption("0,5 mg IM", "Dose máxima usual do adulto. Preferir quando o peso estimado aproxima ou atinge a dose teto."),
          ],
          defaultChoice: standardDose,
        },
        {
          id: "monitoring",
          group: actionGroup("now", "Fazer agora", "Primeiros minutos sem atraso."),
          title: "Monitorização contínua",
          detail: "Defina explicitamente como o paciente será monitorizado já nos primeiros minutos.",
          rationale: hasShock || hasRespDistress ? "Há sinais objetivos de instabilidade que pedem vigilância estreita." : "Mesmo casos inicialmente responsivos podem piorar rapidamente.",
          tone: hasShock || hasRespDistress ? "danger" : "info",
          options: [
            actionOption(
              "Monitorização contínua completa",
              "ECG contínuo + SpO₂ contínua + PA seriada a cada 2–5 min + rechecagem frequente de FR/perfusão enquanto houver instabilidade.",
            ),
            actionOption(
              "Monitorização seriada intensiva",
              "SpO₂ contínua + PA/FC/FR reavaliadas a cada 5–10 min se o paciente estiver sintomático, porém sem choque ou falência de via aérea.",
            ),
          ],
          defaultChoice: hasShock || hasRespDistress ? "Monitorização contínua completa" : "Monitorização seriada intensiva",
        },
        {
          id: "oxygen_support",
          group: actionGroup("support", "Suporte e prontidão", "Ajustes que acompanham a adrenalina."),
          title: "Oxigênio suplementar",
          detail: hasRespDistress
            ? "O quadro favorece iniciar oxigênio imediatamente e escalar conforme saturação e esforço respiratório."
            : "Se a saturação permanecer adequada e sem desconforto respiratório, mantenha prontidão para ofertar O₂ se houver piora.",
          rationale: oxygenSat != null ? `Sat O₂ atual: ${oxygenSat}%` : "Sem saturação preenchida, a conduta precisa ser guiada pela clínica.",
          tone: hasRespDistress ? "warning" : "info",
          options: [
            actionOption("Sem O₂ adicional", "Aceitável apenas se Sat O₂ estiver preservada, sem esforço respiratório e com vigilância para piora."),
            actionOption("Cateter nasal", "2–6 L/min. Pode servir em dessaturação leve sem ameaça de via aérea."),
            actionOption("Máscara com reservatório", "10–15 L/min. Preferir se houver hipoxemia, estridor, broncoespasmo importante ou qualquer sinal de gravidade."),
          ],
          defaultChoice: hasRespDistress || hasShock || hasImpendingAirway ? "Máscara com reservatório" : "Sem O₂ adicional",
        },
        {
          id: "venous_access",
          group: actionGroup("support", "Suporte e prontidão", "Ajustes que acompanham a adrenalina."),
          title: "Acesso venoso e fluido",
          detail: hasShock
            ? "Obter acesso venoso calibroso já na abordagem inicial e deixar cristalóide pronto para bolus."
            : "Garantir acesso venoso precoce para medicações e eventual expansão, mesmo sem choque neste momento.",
          rationale: hasShock
            ? "Hipotensão/má perfusão mudam a prioridade do suporte hemodinâmico. Acesso central não deve atrasar o manejo inicial."
            : "Acesso precoce evita atraso se o quadro piorar; acesso central não é a primeira escolha nesta etapa.",
          tone: hasShock ? "danger" : "info",
          options: [
            actionOption("Acesso venoso periférico", "1 acesso periférico funcionante, preferindo bom calibre se o quadro ainda estiver estável."),
            actionOption("Dois acessos calibrosos + cristalóide", "Dois periféricos 16G–18G se possível, com cristalóide isotônico pronto ou em bolus se houver hipotensão/má perfusão."),
            actionOption("Periférico + intraósseo se falha", "Se acesso periférico atrasar e o paciente estiver instável, considerar intraósseo em vez de esperar."),
          ],
          defaultChoice: hasShock ? "Dois acessos calibrosos + cristalóide" : "Acesso venoso periférico",
        },
        {
          id: "airway_plan",
          group: actionGroup("support", "Suporte e prontidão", "Ajustes que acompanham a adrenalina."),
          title: "Plano de via aérea",
          detail: hasImpendingAirway || hasNeuroCompromise
            ? "O quadro sugere preparar ISR/intubação precocemente enquanto mantém oxigenação e adrenalina."
            : "Sem indicação imediata de intubação, mas vale deixar equipe e material de via aérea em prontidão se houver progressão.",
          rationale: hasImpendingAirway
            ? "Estridor/hipoxemia importante aumenta risco de perda rápida da via aérea."
            : hasNeuroCompromise
              ? "Rebaixamento do nível de consciência reduz segurança da proteção de via aérea."
              : "A anafilaxia pode evoluir rapidamente mesmo após a primeira dose de adrenalina.",
          tone: hasImpendingAirway || hasNeuroCompromise ? "danger" : "warning",
          options: [
            actionOption("Sem intubação imediata", "Sem sinal atual de falência de via aérea, mantendo vigilância próxima."),
            actionOption("Material + ISR de prontidão", "Equipe e material preparados caso apareça progressão de edema/estridor."),
            actionOption("Intubação imediata / ISR", "Escolha se a via aérea já estiver ameaçada ou a proteção estiver comprometida."),
          ],
          defaultChoice: hasImpendingAirway || hasNeuroCompromise ? "Material + ISR de prontidão" : "Sem intubação imediata",
        },
      ];
    case "moderate_support_bundle":
      return [
        {
          id: "oxygen_moderate",
          group: actionGroup("support", "Manter suporte", "Consolidar suporte enquanto observa resposta."),
          title: "Oxigênio conforme necessidade",
          detail: hasRespDistress ? "Há suporte para manter O₂ suplementar nesta fase." : "Se não houver hipoxemia, mantenha apenas prontidão para oferecer O₂.",
          tone: hasRespDistress ? "warning" : "info",
          options: [
            actionOption("Sem O₂ adicional", "Se Sat O₂ estiver adequada e não houver desconforto respiratório."),
            actionOption("Cateter nasal", "2–6 L/min para necessidade leve de O₂."),
            actionOption("Máscara com reservatório", "Se a oxigenação cair ou o trabalho respiratório aumentar."),
          ],
          defaultChoice: hasRespDistress ? "Cateter nasal" : "Sem O₂ adicional",
        },
        {
          id: "iv_ready",
          group: actionGroup("support", "Manter suporte", "Consolidar suporte enquanto observa resposta."),
          title: "Acesso venoso precoce",
          detail: "Deixar acesso venoso e cristalóide prontos antes da reavaliação seguinte.",
          tone: "info",
          options: [
            actionOption("Acesso periférico", "Ao menos 1 acesso periférico pérvio para medicações e eventual hidratação."),
            actionOption("Dois acessos periféricos", "Se o caso estiver oscilando ou houver maior chance de precisar expansão rápida."),
          ],
          defaultChoice: "Acesso periférico",
        },
        {
          id: "repeat_adrenaline_prep",
          group: actionGroup("next", "Preparar próxima reavaliação", "Deixar a próxima decisão pronta."),
          title: "Preparar repetição de adrenalina IM",
          detail: "Se os sintomas persistirem ou piorarem, a segunda dose IM deve estar pronta para ser feita em 5 minutos.",
          tone: "warning",
          options: [
            actionOption("Preparar 0,3 mg IM", "Se a estimativa de dose continuar mais próxima de 0,3 mg."),
            actionOption("Preparar 0,5 mg IM", "Se o porte/peso do paciente justificar a dose máxima usual do adulto."),
          ],
          defaultChoice: standardDose.replace(" IM", " IM"),
        },
        {
          id: "bronchodilator",
          group: actionGroup("next", "Preparar próxima reavaliação", "Deixar a próxima decisão pronta."),
          title: "Broncodilatador como adjuvante",
          detail: isYes("resp") ? "Pode ser útil se houver broncoespasmo persistente após adrenalina." : "Não é prioridade se não houver broncoespasmo persistente.",
          tone: isYes("resp") ? "info" : "success",
          options: [
            actionOption("Não necessário agora", "Se não houver broncoespasmo persistente após adrenalina."),
            actionOption("Nebulização com broncodilatador", "Adjuvante para sibilância/broncoespasmo, sem substituir adrenalina."),
          ],
          defaultChoice: isYes("resp") ? "Nebulização com broncodilatador" : "Não necessário agora",
        },
        h1AdjuvantCard,
        corticosteroidAdjuvantCard,
      ];
    case "severe_resuscitation_bundle":
      return [
        {
          id: "high_flow_o2",
          group: actionGroup("resuscitation", "Ressuscitação agora", "Condutas imediatas da fase grave."),
          title: "Oxigênio em alta oferta",
          detail: "A apresentação grave favorece oferta imediata de O₂ em alta concentração.",
          tone: "danger",
          options: [
            actionOption("Máscara com reservatório", "10–15 L/min, opção imediata mais simples para alta FiO₂."),
            actionOption("Alto fluxo", "Se disponível e sem atrasar as demais medidas de ressuscitação."),
            actionOption("BVM se falha de oxigenação", "Ponte ventilatória enquanto organiza via aérea definitiva se a oxigenação estiver falhando."),
          ],
          defaultChoice: hasImpendingAirway ? "Máscara com reservatório" : "Alto fluxo",
        },
        {
          id: "large_bore_access",
          group: actionGroup("resuscitation", "Ressuscitação agora", "Condutas imediatas da fase grave."),
          title: "Acesso venoso calibroso",
          detail: "Obter acesso venoso calibroso para expansão, medicações e eventual escalonamento.",
          tone: "danger",
          options: [
            actionOption("Dois acessos calibrosos", "Preferir dois periféricos 16G–18G se tecnicamente possíveis."),
            actionOption("Acesso periférico + intraósseo se falha", "Não atrasar ressuscitação se o periférico for difícil e o paciente estiver instável."),
          ],
          defaultChoice: "Dois acessos calibrosos",
        },
        {
          id: "fluid_bolus",
          group: actionGroup("resuscitation", "Ressuscitação agora", "Condutas imediatas da fase grave."),
          title: "Cristalóide rápido",
          detail: "Na presença de hipotensão/má perfusão, deixar bolus de cristalóide isotônico em curso.",
          tone: "danger",
          options: [
            actionOption("500 mL", "Bolus inicial menor se houver preocupação com volume ou necessidade de titulação mais cautelosa."),
            actionOption("1000 mL", "Estratégia prática para adulto quando o peso não estiver disponível e houver hipotensão."),
            actionOption("20 mL/kg", "Melhor opção quando o peso é conhecido e o choque está mais evidente."),
          ],
          defaultChoice: hasShock ? "20 mL/kg" : "500 mL",
        },
        {
          id: "airway_escalation",
          group: actionGroup("airway", "Via aérea e falha de oxigenação", "Preparar perda de via aérea sem atraso."),
          title: "Preparar via aérea avançada",
          detail: "Equipe, material e estratégia de falha devem estar prontos precocemente.",
          tone: "danger",
          options: [
            actionOption("ISR de prontidão", "Material, drogas e operador experiente já organizados para intubação se houver piora."),
            actionOption("Intubação imediata / ISR", "Se já houver falência iminente de via aérea, hipoxemia importante ou rebaixamento que comprometa proteção."),
            actionOption("Ventilação bolsa-válvula-máscara", "Ponte enquanto a via aérea definitiva está sendo organizada."),
          ],
          defaultChoice: hasImpendingAirway || hasNeuroCompromise ? "Intubação imediata / ISR" : "ISR de prontidão",
        },
        h1AdjuvantCard,
        corticosteroidAdjuvantCard,
        glucagonAdjuvantCard,
      ];
    case "repeat_im_epinephrine":
      return [
        {
          id: "second_adrenaline",
          group: actionGroup("now", "Executar agora", "Ação imediata deste loop."),
          title: "Segunda dose de adrenalina IM",
          detail: "Persistência de sintomas sem resolução pede nova dose IM agora.",
          tone: "danger",
          options: [
            actionOption("0,3 mg IM", "Usar se a dose por peso estimada permanecer em torno de 0,3 mg."),
            actionOption("0,5 mg IM", "Dose máxima usual do adulto quando o porte clínico/peso sustentam 0,5 mg."),
          ],
          defaultChoice: standardDose,
        },
        {
          id: "recheck_vitals",
          group: actionGroup("now", "Executar agora", "Ação imediata deste loop."),
          title: "Reavaliar resposta em até 5 min",
          detail: "Checar PA, SpO₂, esforço respiratório, edema de via aérea e estado mental após a dose.",
          tone: "warning",
          options: [
            actionOption("Reavaliação em 5 min", "Padrão para nova decisão após a segunda adrenalina IM."),
            actionOption("Reavaliação contínua", "Se o paciente estiver muito lábil, já exigir vigilância minuto a minuto enquanto prepara escalonamento."),
          ],
          defaultChoice: "Reavaliação em 5 min",
        },
        h1AdjuvantCard,
        corticosteroidAdjuvantCard,
      ];
    case "critical_escalation_bundle":
      return [
        {
          id: "epinephrine_iv",
          group: actionGroup("advanced", "Suporte avançado", "Escalar suporte crítico contínuo."),
          title: "Escalonar para adrenalina IV",
          detail: "Falha após medidas iniciais e instabilidade sustentada favorecem infusão titulada em ambiente monitorizado.",
          tone: "danger",
          options: [
            actionOption("Preparar infusão IV", "Se o paciente segue refratário apesar de IM repetida e expansão inicial."),
            actionOption("Infusão IV já iniciada", "Quando a equipe habilitada já iniciou vasopressor/epinefrina titulada em ambiente monitorizado."),
          ],
          defaultChoice: "Preparar infusão IV",
        },
        {
          id: "critical_monitoring",
          group: actionGroup("advanced", "Suporte avançado", "Escalar suporte crítico contínuo."),
          title: "Monitorização crítica contínua",
          detail: "Nesta fase o paciente precisa de vigilância multiparamétrica contínua, não apenas rechecagens espaçadas.",
          tone: "danger",
          options: [
            actionOption("ECG + SpO₂ + PA ciclo curto", "Monitor cardíaco contínuo, oximetria contínua e PA seriada em ciclos curtos enquanto persistir instabilidade."),
            actionOption("Monitorização crítica em sala/UTI", "Quando o paciente já estiver em área crítica com vigilância contínua completa."),
          ],
          defaultChoice: "ECG + SpO₂ + PA ciclo curto",
        },
        {
          id: "critical_fluids",
          group: actionGroup("advanced", "Suporte avançado", "Escalar suporte crítico contínuo."),
          title: "Expansão e perfusão",
          detail: "Após cada bolus, decidir se ainda há espaço para volume ou se o eixo principal já é vasoativo.",
          tone: "danger",
          options: [
            actionOption("Repetir bolus guiado por perfusão", "Se ainda houver hipotensão, má perfusão ou resposta incompleta ao volume inicial."),
            actionOption("Manter volume e priorizar vasoativo", "Se a reposição já foi adequada e a pressão continua dependente de adrenalina/vasoativo."),
          ],
          defaultChoice: hasShock ? "Repetir bolus guiado por perfusão" : "Manter volume e priorizar vasoativo",
        },
        {
          id: "critical_airway",
          group: actionGroup("advanced", "Suporte avançado", "Escalar suporte crítico contínuo."),
          title: "Escalonamento de via aérea",
          detail: "Ameaça progressiva de via aérea ou falha de oxigenação exigem suporte avançado imediato.",
          tone: "danger",
          options: [
            actionOption("ISR imediata", "Quando a via aérea está ameaçada e já há necessidade de via aérea definitiva."),
            actionOption("BVM enquanto prepara ISR", "Ponte temporária enquanto equipe e material finalizam a intubação."),
            actionOption("Ventilação mecânica após IOT", "Se a intubação já foi realizada e o próximo passo é suporte ventilatório contínuo."),
          ],
          defaultChoice: hasImpendingAirway || hasNeuroCompromise ? "ISR imediata" : "BVM enquanto prepara ISR",
        },
        {
          id: "icu_destination",
          group: actionGroup("destination", "Destino crítico", "Definir onde o suporte vai continuar."),
          title: "Leito crítico / UTI",
          detail: "Essa etapa já assume monitorização intensiva e suporte avançado contínuo.",
          tone: "warning",
          options: [
            actionOption("Acionar UTI", "Destino preferencial se o paciente já entrou em anafilaxia refratária ou precisou de suporte avançado contínuo."),
            actionOption("Acionar sala de emergência crítica", "Se ainda estiver na sala de emergência e a estabilização crítica estiver em andamento."),
          ],
          defaultChoice: "Acionar UTI",
        },
        glucagonAdjuvantCard,
      ];
    case "observation_phase":
      return [
        {
          id: "observation_monitor",
          group: actionGroup("watch", "Vigiar evolução", "Monitorização e recaída."),
          title: "Observação monitorizada",
          detail: "Mesmo com melhora, o paciente ainda precisa de vigilância para recaída clínica.",
          tone: "info",
          options: [
            actionOption("Observação 4-6 h", "Para evolução favorável, sem hipotensão, sem comprometimento importante de via aérea e sem necessidade de doses repetidas."),
            actionOption("Observação prolongada 12-24 h", "Preferir se houve gravidade maior, adrenalina repetida, hipotensão, problema de via aérea ou preocupação relevante com recaída."),
          ],
          defaultChoice: hasShock || hasRespDistress ? "Observação prolongada 12-24 h" : "Observação 4-6 h",
        },
        {
          id: "observation_focus",
          group: actionGroup("watch", "Vigiar evolução", "Monitorização e recaída."),
          title: "Foco da reavaliação seriada",
          detail: "A observação deve procurar recaída respiratória, hemodinâmica ou edema de via aérea, e não apenas cumprir tempo.",
          tone: "info",
          options: [
            actionOption("Reavaliar PA/FC/FR/SpO₂ + via aérea em série", "A cada rodada, rever perfusão, respiração, edema de via aérea, ausculta e nível de consciência."),
            actionOption("Reavaliar também tolerância oral e deambulação", "Adicionar checagem funcional quando o paciente já estiver claramente melhorando e perto da alta."),
          ],
          defaultChoice: "Reavaliar PA/FC/FR/SpO₂ + via aérea em série",
        },
        {
          id: "discharge_readiness",
          group: actionGroup("destination", "Preparar destino", "Alta ou internação só depois da checagem final."),
          title: "Preparar critérios de alta segura",
          detail: "Antes de cogitar alta, deixe explícito se o paciente já preenche estabilidade sustentada e plano de segurança.",
          tone: "warning",
          options: [
            actionOption("Alta ainda não pronta", "Persistem sintomas, gravidade residual, necessidade de O₂/monitorização ou tempo insuficiente de observação."),
            actionOption("Iniciar checklist de alta segura", "Só se houver resolução sustentada, estabilidade hemodinâmica/respiratória e orientação de retorno bem definida."),
          ],
          defaultChoice: hasShock || hasRespDistress ? "Alta ainda não pronta" : "Iniciar checklist de alta segura",
        },
        {
          id: "document_course",
          group: actionGroup("destination", "Preparar destino", "Alta ou internação só depois da checagem final."),
          title: "Documentar gatilho e resposta",
          detail: "Registrar gatilho, doses de adrenalina, tempo de resposta e pendências para alta ou internação.",
          tone: "success",
          options: [
            actionOption("Documentar agora", "Ainda falta consolidar cronologia, doses, resposta e plano de observação/alta."),
            actionOption("Documentado", "Registro principal já foi feito e pode seguir para próximos passos."),
          ],
          defaultChoice: "Documentar agora",
        },
      ];
    default:
      return [];
  }
}

export default function AnaphylaxisTreeScreen({ onRouteBack }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [engine] = useState(() => createAnaphylaxisDecisionEngine());
  const [manualFindingStatesByContext, setManualFindingStatesByContext] = useState<Record<AssessmentContextId, Record<string, FindingState>>>({
    initial: {},
    post_first_im: {},
    post_second_im: {},
  });
  const [activeAssessmentTarget, setActiveAssessmentTarget] = useState<AssessmentTarget>(null);
  const [actionPlanState, setActionPlanState] = useState<Record<string, { status: ActionPlanStatus; choice?: string }>>({});
  const [activeActionPlanSheet, setActiveActionPlanSheet] = useState<ActiveActionPlanSheet>(null);
  const [clinicalInputsByContext, setClinicalInputsByContext] = useState<Record<AssessmentContextId, ClinicalInputs>>({
    initial: createEmptyClinicalInputs(),
    post_first_im: createEmptyClinicalInputs(),
    post_second_im: createEmptyClinicalInputs(),
  });
  const [revision, setRevision] = useState(0);
  const step = engine.toFrontendStep();
  const currentNode = engine.getCurrentNode();
  const canGoBack = engine.canGoBack();
  const assessmentContextId = assessmentContextForStep(step.id);
  const initialClinicalInputs = clinicalInputsByContext.initial;
  const treeRegionId = treeRegionForNode(step.id);
  const treeRegionIndex = TREE_REGIONS.findIndex((region) => region.id === treeRegionId);
  const log = engine.getLog();
  const clinicalInputs = mergeContextClinicalInputs(
    initialClinicalInputs,
    clinicalInputsByContext[assessmentContextId],
    assessmentContextId,
  );
  const derivedMetrics = useMemo(() => deriveMetricsFromInputs(clinicalInputs), [clinicalInputs]);
  const autoFindingContext = useMemo(
    () => buildAutoFindingContext(clinicalInputs, derivedMetrics),
    [clinicalInputs, derivedMetrics],
  );

  const findingStates = useMemo(() => {
    const nextStates: Record<string, FindingState> = {};
    const sourceGroups =
      assessmentContextId === "initial" ? DIAGNOSTIC_INTERACTIVE_GROUPS : REASSESSMENT_INTERACTIVE_GROUPS;
    const manualFindingStates = manualFindingStatesByContext[assessmentContextId] ?? {};

    for (const group of sourceGroups) {
      for (const item of group.items) {
        nextStates[item.id] = manualFindingStates[item.id] ?? (autoFindingContext.autoPositiveIds.has(item.id) ? "yes" : undefined);
      }
    }

    return nextStates;
  }, [assessmentContextId, manualFindingStatesByContext, autoFindingContext]);

  const diagnosticSuggestion = useMemo(() => {
    const isYes = (id: string) => findingStates[id] === "yes";
    const positiveSystems = ["skin", "resp", "circ", "gi"].filter(isYes);
    const severeFlags = ["hypotension", "stridor", "hypoxemia", "neuro"].filter(isYes);
    const selectedCount = Object.values(findingStates).filter(Boolean).length;
    const hasAirwayBreathingCirculation = isYes("resp") || isYes("circ") || severeFlags.length > 0;
    const hasMultiSystemPattern = positiveSystems.length >= 2;

    if (severeFlags.length > 0 || isYes("circ") || isYes("resp")) {
      return {
        tone: "danger" as const,
        title: "O quadro sugere anafilaxia grave",
        text: "Comprometimento respiratório, circulatório ou sinais de choque tornam a suspeita forte e favorecem não atrasar adrenalina IM e preparação para escalonamento.",
        criteriaStatus: "Critérios preenchidos / alta suspeita clínica",
        classification: "Anafilaxia grave ou choque anafilático",
        nextStep: "Prosseguir como anafilaxia. Selecione a opção positiva e avance para adrenalina IM imediata, monitorização e estratificação de gravidade.",
        recommendedChoice: "Sim — critérios preenchidos / alta suspeita",
      };
    }

    if ((isYes("skin") && hasMultiSystemPattern) || (isYes("gi") && (isYes("skin") || isYes("resp")))) {
      return {
        tone: "strong" as const,
        title: "Anafilaxia provável",
        text: "Mais de um sistema acometido em contexto compatível reforça critério clínico para tratar como anafilaxia.",
        criteriaStatus: "Critérios clínicos provavelmente preenchidos",
        classification: "Anafilaxia sem sinais imediatos de choque",
        nextStep: "Tratar como anafilaxia e avançar para adrenalina IM de primeira linha sem esperar piora clínica.",
        recommendedChoice: "Sim — critérios preenchidos / alta suspeita",
      };
    }

    if ((isYes("skin") || isYes("gi")) && positiveSystems.length === 1) {
      return {
        tone: "caution" as const,
        title: "Achados ainda inespecíficos",
        text: "Um único sistema isolado pode representar reação alérgica sem anafilaxia neste momento, mas exige reavaliação se surgirem sinais respiratórios, circulatórios ou progressão rápida.",
        criteriaStatus: "Critérios ainda incompletos",
        classification: "Reação alérgica possível, sem confirmação de anafilaxia",
        nextStep: "Se o quadro permanecer limitado a um único sistema e sem comprometimento respiratório/circulatório, considere a opção negativa. Reavalie imediatamente se houver progressão.",
        recommendedChoice: "Não — reação localizada apenas",
      };
    }

    if (selectedCount > 0 && !hasAirwayBreathingCirculation && !hasMultiSystemPattern) {
      return {
        tone: "caution" as const,
        title: "Suspeita ainda baixa para anafilaxia",
        text: "Os achados selecionados não configuram até aqui padrão clássico de anafilaxia sistêmica.",
        criteriaStatus: "Critérios não preenchidos até o momento",
        classification: "Quadro ainda não classificável como anafilaxia",
        nextStep: "Se não houver evolução clínica, a escolha mais coerente abaixo tende a ser a negativa. Mude imediatamente se surgirem respiração, circulação ou progressão rápida.",
        recommendedChoice: "Não — reação localizada apenas",
      };
    }

    return {
      tone: "neutral" as const,
      title: "Selecione os principais achados do paciente",
      text: "A síntese automática organiza a suspeita clínica com base nos dados preenchidos e nos cards revisados pelo usuário.",
      criteriaStatus: "Aguardando seleção de achados",
      classification: "Ainda sem classificação",
      nextStep: "Preencha os dados iniciais, revise os cards já marcados automaticamente e clique nos achados que o sistema ainda não conseguiu inferir.",
      recommendedChoice: "Definir após os achados",
    };
  }, [findingStates]);

  const actionPlanCards = useMemo(
    () =>
      step.kind === "action"
        ? buildActionPlanCards({
            stepId: step.id,
            clinicalInputs,
            findingStates,
            derivedMetrics,
          })
        : [],
    [step, clinicalInputs, findingStates, derivedMetrics],
  );

  const heroMetrics = useMemo(() => {
    const visitedNodes = new Set(log.filter((entry) => entry.event === "enter").map((entry) => entry.nodeId));
    const terminalCount = Object.values(anaphylaxisDecisionTree.nodes).filter((node) => node.type === "transition").length;
    const metrics = [
      {
        label: "Nó atual",
        value: step.title,
        accent: "#1a4f9c",
      },
      {
        label: "Região atual",
        value: TREE_REGIONS[treeRegionIndex]?.label ?? "Fluxo",
        accent: TREE_REGIONS[treeRegionIndex]?.accent ?? "#1d4ed8",
      },
      {
        label: "Nós visitados",
        value: `${visitedNodes.size}/${Object.keys(anaphylaxisDecisionTree.nodes).length}`,
        accent: "#7c3aed",
      },
      {
        label: "Saídas terminais",
        value: String(terminalCount),
        accent: "#15803d",
      },
    ];

    return compact ? [] : metrics;
  }, [compact, log, step.title, treeRegionIndex]);

  const actionPlanGroups = useMemo(() => {
    const groups: { group: ActionPlanGroup; cards: ActionPlanCard[] }[] = [];
    const byId = new Map<string, { group: ActionPlanGroup; cards: ActionPlanCard[] }>();

    for (const card of actionPlanCards) {
      if (!byId.has(card.group.id)) {
        const entry = { group: card.group, cards: [] as ActionPlanCard[] };
        byId.set(card.group.id, entry);
        groups.push(entry);
      }

      byId.get(card.group.id)?.cards.push(card);
    }

    return groups;
  }, [actionPlanCards]);

  async function handleTransition(targetModuleId: string) {
    const moduleId = MODULE_ROUTE_BY_TARGET[targetModuleId];
    if (!moduleId) {
      return;
    }

    const module = getClinicalModuleById(moduleId);
    if (!module) {
      return;
    }

    await openClinicalModule(router, moduleId, module.route as Href);
  }

  function rerender() {
    setRevision((value) => value + 1);
  }

  function openAssessmentField(contextId: AssessmentContextId, fieldId: AssessmentFieldId) {
    setActiveAssessmentTarget({ contextId, fieldId });
  }

  function closeAssessmentField() {
    setActiveAssessmentTarget(null);
  }

  function setClinicalInputValue(contextId: AssessmentContextId, field: keyof ClinicalInputs, value: string | GlasgowValue) {
    setClinicalInputsByContext((current) => ({
      ...current,
      [contextId]: {
        ...current[contextId],
        [field]: value,
      },
    }));
  }

  function setFindingState(findingId: string, value: Exclude<FindingState, undefined>) {
    setManualFindingStatesByContext((current) => {
      const contextManual = current[assessmentContextId] ?? {};
      const autoState: FindingState = autoFindingContext.autoPositiveIds.has(findingId) ? "yes" : undefined;
      const effectiveState = contextManual[findingId] ?? autoState;

      if (effectiveState === value) {
        if (contextManual[findingId] === undefined) {
          return current;
        }

        const nextContext = { ...contextManual };
        delete nextContext[findingId];
        return {
          ...current,
          [assessmentContextId]: nextContext,
        };
      }

      if (autoState === value) {
        const nextContext = { ...contextManual };
        delete nextContext[findingId];
        return {
          ...current,
          [assessmentContextId]: nextContext,
        };
      }

      return {
        ...current,
        [assessmentContextId]: {
          ...contextManual,
          [findingId]: value,
        },
      };
    });
  }

  function updateActionPlanCard(cardKey: string, next: { status?: ActionPlanStatus; choice?: string }) {
    setActionPlanState((current) => ({
      ...current,
      [cardKey]: {
        status: next.status ?? current[cardKey]?.status ?? "suggested",
        choice: next.choice ?? current[cardKey]?.choice,
      },
    }));
  }

  function jumpToRegion(regionId: string | number) {
    const anchorNodeId = REGION_ANCHOR_NODE[regionId as TreeRegionId];
    if (!anchorNodeId) {
      return;
    }

    engine.goToNode(anchorNodeId);
    rerender();
  }

  return (
    <View style={styles.screen}>
      <ModuleFlowLayout
        key={revision}
        visualStyle="isr"
        hero={
          <ModuleFlowHero
            visualStyle="isr"
            eyebrow="Anafilaxia"
            title={compact ? "Fluxo de anafilaxia" : "Anafilaxia organizada como fluxo decisório"}
            subtitle={
              compact
                ? ""
                : "Diagnóstico, adrenalina IM, reavaliação curta, escalonamento e destino final em um único fluxo."
            }
            badgeText={compact ? "Fluxo v2" : "Fluxo decisório v2"}
            metrics={heroMetrics}
            progressLabel={compact ? `${treeRegionIndex + 1}/${TREE_REGIONS.length}` : `Região ${treeRegionIndex + 1} de ${TREE_REGIONS.length}`}
            stepTitle={step.title}
            hint={step.summary}
            compactMobile
            compressed
            showStepCard={false}
          />
        }
        items={TREE_REGIONS.map((region, index) => ({
          id: region.id,
          label: region.label,
          hint: region.hint,
          step: String(index + 1),
          accent: region.accent,
        }))}
        activeId={treeRegionId}
        onSelect={jumpToRegion}
        sidebarEyebrow="Mapa do fluxo"
        sidebarTitle="Blocos da decisão"
        contentEyebrow={`Região ${treeRegionIndex + 1} de ${TREE_REGIONS.length}`}
        contentTitle={step.title}
        contentHint={step.summary}
        contentBadgeText={step.kind === "transition" ? "Saída terminal" : "Fluxo clínico"}>
        <ModuleFlowContent contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step.kind === "decision" ? (
            <View style={styles.block}>
              <View style={styles.textCard}>
                <Text style={styles.blockKicker}>Pergunta clínica</Text>
                <Text style={styles.blockTitle}>{step.question}</Text>
                {renderDiagnosticSupport(
                  step.id,
                  assessmentContextId,
                  findingStates,
                  autoFindingContext.autoPositiveIds,
                  autoFindingContext.autoReasons,
                  clinicalInputs,
                  derivedMetrics,
                  activeAssessmentTarget,
                  openAssessmentField,
                  closeAssessmentField,
                  setClinicalInputValue,
                  setFindingState,
                  diagnosticSuggestion,
                )}
              </View>

              <DecisionGrid
                title="Escolha a próxima conduta"
                options={step.options.map((option) => ({
                  id: option.id,
                  label: option.label,
                  sublabel: anaphylaxisDecisionTree.nodes[
                    (currentNode.type === "decision"
                      ? currentNode.options.find((item) => item.id === option.id)?.next
                      : step.id) ?? step.id
                  ]?.title,
                }))}
                onSelect={(optionId) => {
                  engine.choose(optionId);
                  rerender();
                }}
              />

              {canGoBack ? (
                <View style={styles.footerActions}>
                  <Pressable
                    style={styles.ghostButton}
                    onPress={() => {
                      engine.goBack();
                      rerender();
                    }}>
                    <Text style={styles.ghostButtonText}>Voltar ao bloco anterior</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : null}

          {step.kind === "action" ? (
            <View style={styles.block}>
              <View style={styles.actionCard}>
                <Text style={styles.blockKicker}>Ação obrigatória</Text>
                <Text style={styles.blockTitle}>Condutas deste bloco</Text>
                <Text style={styles.blockSupportText}>{step.summary}</Text>
                <View style={styles.planIntroCard}>
                  <Text style={styles.planIntroTitle}>Condutas organizadas por prioridade</Text>
                  <Text style={styles.planIntroText}>
                    Primeiro execute o que é imediato. Depois ajuste suporte e próxima checagem conforme a resposta clínica.
                  </Text>
                </View>

                <View style={styles.actionPlanSections}>
                  {actionPlanGroups.map(({ group, cards }) => (
                    <View key={group.id} style={styles.actionPlanSection}>
                      <View style={styles.actionPlanSectionHeader}>
                        <Text style={styles.actionPlanSectionTitle}>{group.title}</Text>
                        <Text style={styles.actionPlanSectionHint}>{group.hint}</Text>
                      </View>

                      <View style={styles.actionPlanGrid}>
                        {cards.map((card) => {
                          const cardKey = `${step.id}:${card.id}`;
                          const state = actionPlanState[cardKey];
                          const choice = state?.choice ?? card.defaultChoice ?? "";
                          const status =
                            choice && card.defaultChoice && choice !== card.defaultChoice
                              ? "adjusted"
                              : "suggested";
                          const isSelectable = Boolean(card.options?.length);
                          return (
                            <Pressable
                              key={cardKey}
                              disabled={!isSelectable}
                              onPress={() => {
                                if (!isSelectable) return;
                                setActiveActionPlanSheet({ cardKey, card });
                              }}
                              style={({ pressed }) => [
                                styles.actionPlanCard,
                                card.tone === "danger" && styles.actionPlanCardDanger,
                                card.tone === "warning" && styles.actionPlanCardWarning,
                                card.tone === "info" && styles.actionPlanCardInfo,
                                card.tone === "success" && styles.actionPlanCardSuccess,
                                isSelectable && styles.actionPlanCardInteractive,
                                pressed && isSelectable && styles.actionPlanCardPressed,
                                status === "adjusted" && styles.actionPlanCardAdjusted,
                              ]}>
                              <View style={styles.actionPlanHeader}>
                                <View style={styles.actionPlanHeaderText}>
                                  <Text style={styles.actionPlanTitle}>{card.title}</Text>
                                  <Text style={styles.actionPlanDetail}>{card.detail}</Text>
                                </View>
                                <View
                                  style={[
                                    styles.actionPlanBadge,
                                    status === "adjusted" && styles.actionPlanBadgeAdjusted,
                                  ]}>
                                  <Text
                                    style={[
                                      styles.actionPlanBadgeText,
                                      status === "adjusted" && styles.actionPlanBadgeTextAdjusted,
                                    ]}>
                                    {status === "adjusted" ? "Editada" : "Recomendada"}
                                  </Text>
                                </View>
                              </View>

                              {card.rationale ? <Text style={styles.actionPlanRationale}>{card.rationale}</Text> : null}
                              {card.options?.length ? (
                                <ActionPlanChoiceButton
                                  value={choice}
                                  valueLabel={getActionPlanChoiceLabel(card, choice)}
                                  placeholder="Selecionar conduta"
                                  onPress={() => setActiveActionPlanSheet({ cardKey, card })}
                                />
                              ) : null}
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
                <ActionPlanChoiceSheet
                  activeSheet={activeActionPlanSheet}
                  visible={activeActionPlanSheet !== null}
                  currentChoice={activeActionPlanSheet ? actionPlanState[activeActionPlanSheet.cardKey]?.choice ?? activeActionPlanSheet.card.defaultChoice ?? "" : ""}
                  onClose={() => setActiveActionPlanSheet(null)}
                  onSelect={(choice) => {
                    if (!activeActionPlanSheet) return;
                    updateActionPlanCard(activeActionPlanSheet.cardKey, {
                      status:
                        activeActionPlanSheet.card.defaultChoice && choice !== activeActionPlanSheet.card.defaultChoice
                          ? "adjusted"
                          : "suggested",
                      choice,
                    });
                  }}
                />
              </View>

              <Pressable style={styles.primaryButton} onPress={() => {
                engine.advance();
                rerender();
              }}>
                <Text style={styles.primaryButtonText}>Concluir bloco e continuar</Text>
              </Pressable>

              <View style={styles.footerActions}>
                {canGoBack ? (
                  <Pressable
                    style={styles.ghostButton}
                    onPress={() => {
                      engine.goBack();
                      rerender();
                    }}>
                    <Text style={styles.ghostButtonText}>Voltar ao bloco anterior</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {step.kind === "transition" ? (
            <View style={styles.block}>
              <View style={styles.transitionCard}>
                <Text style={styles.blockKicker}>Saída terminal</Text>
                <Text style={styles.blockTitle}>Critérios e destino desta conduta</Text>
                <Text style={styles.blockSupportText}>{step.summary}</Text>
                <Text style={styles.transitionDisposition}>Destino: {step.disposition}</Text>
                <View style={styles.evidenceList}>
                  {step.exitCriteria.map((line) => (
                    <View key={line} style={styles.evidenceRow}>
                      <View style={styles.evidenceDot} />
                      <Text style={styles.evidenceText}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.targetGrid}>
                {step.targets.map((target) => {
                  const hasRoute = Boolean(MODULE_ROUTE_BY_TARGET[target.moduleId]);
                  return (
                    <View key={target.moduleId} style={styles.targetCard}>
                      <Text style={styles.targetLabel}>{target.label}</Text>
                      <Text style={styles.targetReason}>{target.reason}</Text>
                      {hasRoute ? (
                        <Pressable style={styles.secondaryButton} onPress={() => void handleTransition(target.moduleId)}>
                          <Text style={styles.secondaryButtonText}>Abrir módulo</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={styles.footerActions}>
                {canGoBack ? (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => {
                      engine.goBack();
                      rerender();
                    }}>
                    <Text style={styles.secondaryButtonText}>Voltar ao bloco anterior</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.secondaryButton} onPress={() => {
                  engine.reset();
                  rerender();
                }}>
                  <Text style={styles.secondaryButtonText}>Reiniciar fluxo</Text>
                </Pressable>
                {onRouteBack ? (
                  <Pressable style={styles.ghostButton} onPress={onRouteBack}>
                    <Text style={styles.ghostButtonText}>Voltar aos módulos</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}
        </ModuleFlowContent>
      </ModuleFlowLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#dff7f3",
  },
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  block: {
    gap: 14,
  },
  actionPlanSections: {
    gap: 16,
  },
  actionPlanSection: {
    gap: 10,
  },
  actionPlanSectionHeader: {
    gap: 4,
  },
  actionPlanSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#103468",
  },
  actionPlanSectionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4f6785",
  },
  textCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 20,
    gap: 14,
    ...AppDesign.shadow.card,
  },
  actionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 20,
    gap: 16,
    ...AppDesign.shadow.card,
  },
  transitionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 20,
    gap: 12,
    ...AppDesign.shadow.card,
  },
  blockKicker: {
    fontSize: 11,
    fontWeight: "900",
    color: "#60758f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  blockTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: "#13263c",
  },
  blockSupportText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#5c7086",
    fontWeight: "700",
  },
  planIntroCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 14,
    gap: 6,
  },
  planIntroTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#163457",
  },
  planIntroText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#587085",
    fontWeight: "700",
  },
  severityChecklist: {
    gap: 10,
  },
  reassessmentMatrix: {
    gap: 10,
  },
  severityCheckCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  severityCheckCardActive: {
    backgroundColor: "#fff5f5",
    borderColor: "#fecaca",
  },
  severityCheckCardInactive: {
    backgroundColor: "#f8fbff",
    borderColor: "#dbe7f2",
  },
  severityCheckStatus: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  severityCheckStatusActive: {
    color: "#b91c1c",
  },
  severityCheckStatusInactive: {
    color: "#60758f",
  },
  severityCheckTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    color: "#13263c",
  },
  severityCheckText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#587085",
  },
  reassessmentDecisionCard: {
    gap: 8,
  },
  reassessmentDecisionCardActive: {
    borderWidth: 2,
  },
  reassessmentDecisionHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  reassessmentDecisionPill: {
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f2b6b6",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reassessmentDecisionPillText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: "#b91c1c",
  },
  reassessmentReasonsList: {
    gap: 6,
  },
  reassessmentReasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  reassessmentReasonDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: "#7b93b0",
  },
  reassessmentReasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#4d647d",
    fontWeight: "700",
  },
  supportStack: {
    gap: 14,
  },
  assessmentCard: {
    backgroundColor: "#eef6ff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#cfe0ff",
    padding: 16,
    gap: 14,
  },
  assessmentTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#163457",
  },
  assessmentText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#35506b",
    fontWeight: "700",
  },
  reassessmentHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  reassessmentHeaderText: {
    flex: 1,
    minWidth: 220,
    gap: 6,
  },
  reassessmentHeaderBadge: {
    minWidth: 132,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c7daf8",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  reassessmentHeaderBadgeLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  reassessmentHeaderBadgeValue: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    color: "#163457",
  },
  assessmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inputCard: {
    flexGrow: 1,
    flexBasis: 140,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d7e5f6",
    padding: 12,
    gap: 8,
  },
  metricCard: {
    justifyContent: "center",
  },
  selectorCard: {
    flexGrow: 1,
    flexBasis: 140,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d7e5f6",
    padding: 12,
    gap: 10,
  },
  selectorCardFilled: {
    borderColor: "#b8d0ee",
    backgroundColor: "#f8fbff",
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectorValue: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    color: "#163457",
  },
  selectorPlaceholder: {
    color: "#8ca0b3",
    fontWeight: "800",
  },
  selectorChevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#9cb0c4",
    fontWeight: "900",
  },
  selectorChevronFilled: {
    color: "#1d4ed8",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  inputField: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d6e2f0",
    backgroundColor: "#f8fbff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#13263c",
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 22,
    color: "#163457",
    fontWeight: "900",
  },
  gcsSection: {
    gap: 8,
  },
  gcsSectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#35506b",
  },
  gcsOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "86%",
    backgroundColor: "#fffdf8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#d7e5d9",
    overflow: "hidden",
  },
  sheetHandle: {
    width: 52,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#d0ddd6",
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#dce9e1",
  },
  sheetTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: "#1d2a3a",
  },
  sheetContext: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#2f7a67",
  },
  sheetCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef7f2",
  },
  sheetCloseText: {
    fontSize: 20,
    lineHeight: 20,
    color: "#506273",
    fontWeight: "700",
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sheetSearchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#d4e2d9",
    borderRadius: 18,
    backgroundColor: "#fffdf8",
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 16,
  },
  sheetSearchIcon: {
    fontSize: 16,
  },
  sheetSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },
  sheetCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  sheetPresetCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 98,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: "flex-start",
    ...AppDesign.shadow.card,
  },
  sheetPresetCardActive: {
    borderColor: "#1d4ed8",
    backgroundColor: "#eef4ff",
  },
  sheetPresetValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1f2937",
  },
  sheetPresetValueActive: {
    color: "#163e8f",
  },
  sheetCustomWrap: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#d4e2d9",
    borderRadius: 22,
    padding: 16,
    gap: 12,
    backgroundColor: "#fffdf8",
  },
  sheetCustomLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#5a6d7c",
  },
  sheetCustomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetCustomInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d4e2d9",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },
  sheetCustomAdd: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#9ca3af",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCustomAddDim: {
    opacity: 0.5,
  },
  sheetCustomAddText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
  sheetGcsCard: {
    borderWidth: 1,
    borderColor: "#dbe7f2",
    borderRadius: 22,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 14,
  },
  sheetGcsTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f2937",
  },
  sheetGcsHint: {
    fontSize: 14,
    lineHeight: 21,
    color: "#526377",
    fontWeight: "700",
  },
  sheetGcsOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sheetGcsOptionActive: {
    borderColor: "#1d4ed8",
    backgroundColor: "#eef4ff",
  },
  sheetGcsScore: {
    width: 22,
    fontSize: 18,
    fontWeight: "900",
    color: "#1f2937",
  },
  sheetGcsScoreActive: {
    color: "#163e8f",
  },
  sheetGcsOptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#445468",
    fontWeight: "700",
  },
  sheetGcsOptionTextActive: {
    color: "#163e8f",
  },
  sheetGcsFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 4,
  },
  sheetGcsTotalLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  sheetGcsTotalValue: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "900",
    color: "#13263c",
  },
  sheetGcsActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sheetSecondaryButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d7e5f6",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#475569",
  },
  sheetPrimaryButton: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetPrimaryButtonDisabled: {
    opacity: 0.45,
  },
  sheetPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  autoInfoCard: {
    backgroundColor: "#fff8ea",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f1d39b",
    padding: 14,
    gap: 6,
  },
  autoInfoTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#8a4b00",
  },
  autoInfoText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#7a5b2a",
    fontWeight: "700",
  },
  autoInfoStrong: {
    color: "#7a3d00",
    fontWeight: "900",
  },
  interactiveSection: {
    gap: 14,
  },
  interactiveGroup: {
    gap: 10,
  },
  interactiveGroupTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#163457",
  },
  findingGrid: {
    gap: 12,
  },
  findingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d8e6fb",
    padding: 14,
    gap: 12,
  },
  findingHeader: {
    gap: 4,
  },
  findingLabelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  findingLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#13263c",
  },
  autoBadge: {
    borderRadius: 999,
    backgroundColor: "#e8f7ef",
    borderWidth: 1,
    borderColor: "#8ed0a5",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  autoBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#116149",
  },
  findingHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#597088",
    fontWeight: "700",
  },
  autoReasonText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#116149",
    fontWeight: "800",
  },
  findingActions: {
    flexDirection: "row",
    gap: 10,
  },
  findingSegmentedControl: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 16,
    backgroundColor: "#eef4fb",
    borderWidth: 1,
    borderColor: "#d8e3f0",
  },
  findingButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  findingSegmentButton: {
    minHeight: 40,
  },
  findingButtonPressed: {
    opacity: 0.82,
  },
  findingButtonYesActive: {
    backgroundColor: "#e8f7ef",
    borderColor: "#44a26d",
  },
  findingButtonNoActive: {
    backgroundColor: "#fff3f3",
    borderColor: "#d86b6b",
  },
  findingButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#4b6070",
  },
  findingSegmentButtonText: {
    letterSpacing: 0.2,
  },
  findingButtonTextYesActive: {
    color: "#116149",
  },
  findingButtonTextNoActive: {
    color: "#9f2d2d",
  },
  suggestionCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d8e6fb",
    padding: 16,
    gap: 8,
  },
  suggestionCardDanger: {
    backgroundColor: "#fff1f1",
    borderColor: "#f2b6b6",
  },
  suggestionCardStrong: {
    backgroundColor: "#eef8ff",
    borderColor: "#bfd8ff",
  },
  suggestionCardCaution: {
    backgroundColor: "#fff8ea",
    borderColor: "#f1d39b",
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#13263c",
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#42566f",
    fontWeight: "700",
  },
  reassessmentSummaryLead: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 14,
    gap: 4,
  },
  reassessmentSummaryLeadLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  reassessmentSummaryLeadValue: {
    fontSize: 18,
    lineHeight: 24,
    color: "#163457",
    fontWeight: "900",
  },
  suggestionSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionSummaryItem: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 12,
    gap: 4,
  },
  suggestionSummaryLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  suggestionSummaryValue: {
    fontSize: 14,
    lineHeight: 20,
    color: "#24384c",
    fontWeight: "800",
  },
  suggestionNextCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 12,
    gap: 6,
  },
  suggestionNextLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  suggestionNextText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#24384c",
    fontWeight: "700",
  },
  suggestionChoiceText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#1a4f9c",
    fontWeight: "900",
  },
  evidenceList: {
    gap: 10,
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  evidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#7db7ff",
    marginTop: 7,
  },
  evidenceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#42566f",
    fontWeight: "700",
  },
  actionList: {
    gap: 10,
  },
  actionPlanGrid: {
    gap: 12,
  },
  actionPlanCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe7f2",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 12,
  },
  actionPlanCardDanger: {
    borderColor: "#f2b6b6",
    backgroundColor: "#fff7f7",
  },
  actionPlanCardWarning: {
    borderColor: "#f1d39b",
    backgroundColor: "#fffaf0",
  },
  actionPlanCardInfo: {
    borderColor: "#bfd8ff",
    backgroundColor: "#f8fbff",
  },
  actionPlanCardSuccess: {
    borderColor: "#b8e0c4",
    backgroundColor: "#f6fcf8",
  },
  actionPlanCardInteractive: {
    cursor: "pointer",
  },
  actionPlanCardPressed: {
    opacity: 0.92,
  },
  actionPlanCardAdjusted: {
    boxShadow: "0 0 0 2px rgba(37,99,235,0.08)",
  },
  actionPlanHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  actionPlanHeaderText: {
    flex: 1,
    gap: 4,
  },
  actionPlanTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    color: "#13263c",
  },
  actionPlanDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4f6478",
    fontWeight: "700",
  },
  actionPlanBadge: {
    borderRadius: 999,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#d5e2f3",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionPlanBadgeAdjusted: {
    backgroundColor: "#eef4ff",
    borderColor: "#9ebef7",
  },
  actionPlanBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#60758f",
  },
  actionPlanBadgeTextAdjusted: {
    color: "#1d4ed8",
  },
  actionPlanRationale: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6b7f92",
    fontWeight: "700",
  },
  actionPlanSelectorButton: {
    marginTop: 2,
  },
  actionPlanSheetDetail: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4f6478",
    fontWeight: "700",
    marginBottom: 10,
  },
  recommendedPlanCard: {
    backgroundColor: "#eef6ff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#cfe0ff",
    padding: 16,
    gap: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  recommendedPlanEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#1d4ed8",
  },
  recommendedPlanTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    color: "#163457",
  },
  recommendedPlanText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: "#47627d",
  },
  actionPlanSheetRationale: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7f92",
    fontWeight: "700",
    marginBottom: 16,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#60758f",
    marginTop: 6,
    marginBottom: 10,
  },
  actionPlanSheetPresetCard: {
    minHeight: 88,
  },
  sheetPresetDetail: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#587085",
  },
  sheetPresetDetailActive: {
    color: "#1d4ed8",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  actionIndex: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#dceaff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  actionIndexText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1a4f9c",
    lineHeight: 18,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#22363b",
    fontWeight: "700",
  },
  transitionDisposition: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a4f9c",
  },
  targetGrid: {
    gap: 12,
  },
  targetCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 16,
    gap: 8,
    ...AppDesign.shadow.card,
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#13263c",
  },
  targetReason: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4b6070",
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#102128",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eaf2ff",
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1a4f9c",
  },
  ghostButton: {
    minHeight: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#c7d5cf",
    backgroundColor: "#ffffff",
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#334155",
  },
  footerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
