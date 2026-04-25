import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { type Href, useRouter } from "expo-router";

import { AppDesign } from "../../constants/app-design";
import { getClinicalModuleById } from "../../clinical-modules";
import { openClinicalModule } from "../../lib/open-clinical-module";
import {
  anaphylaxisDecisionTree,
  createAnaphylaxisDecisionEngine,
} from "../../anaphylaxis-decision-tree";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
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

const TREE_REGIONS: Array<{ id: TreeRegionId; label: string; hint: string; accent: string }> = [
  { id: "entry", label: "Entrada clínica", hint: "Reconhecimento e filtro inicial", accent: "#0f766e" },
  { id: "first_line", label: "Ação imediata", hint: "Adrenalina IM sem atraso", accent: "#1d4ed8" },
  { id: "severity", label: "Gravidade", hint: "Ramo moderado vs ameaça à vida", accent: "#7c3aed" },
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

type ClinicalInputs = {
  weightKg: string;
  heightCm: string;
  systolic: string;
  diastolic: string;
  respiratoryRate: string;
  oxygenSat: string;
  gcsEye: GlasgowValue;
  gcsVerbal: GlasgowValue;
  gcsMotor: GlasgowValue;
};

type ActionPlanStatus = "suggested" | "confirmed" | "adjusted";

type ActionPlanCard = {
  id: string;
  title: string;
  detail: string;
  rationale?: string;
  tone: "danger" | "warning" | "info" | "success";
  options?: string[];
  defaultChoice?: string;
};

type AssessmentFieldId =
  | "weightKg"
  | "heightCm"
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
  weightKg: { label: "Peso (kg)", placeholder: "Selecionar peso", customLabel: "Outro peso" },
  heightCm: { label: "Altura (cm)", placeholder: "Selecionar altura", customLabel: "Outra altura" },
  systolic: { label: "PAS", placeholder: "Selecionar PAS", customLabel: "Outra PAS" },
  diastolic: { label: "PAD", placeholder: "Selecionar PAD", customLabel: "Outra PAD" },
  respiratoryRate: { label: "FR", placeholder: "Selecionar FR", customLabel: "Outra FR" },
  oxygenSat: { label: "Sat O₂", placeholder: "Selecionar saturação", customLabel: "Outra saturação" },
  glasgow: { label: "GCS", placeholder: "Selecionar", customLabel: "Outro Glasgow" },
};

const FIELD_PRESETS: Record<Exclude<AssessmentFieldId, "glasgow">, PresetOption[]> = {
  weightKg: ["40", "50", "60", "70", "80", "90", "100", "120"].map((value) => ({ value, label: value })),
  heightCm: ["140", "150", "160", "170", "180", "190", "200", "210"].map((value) => ({ value, label: value })),
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
      { id: "resp", label: "Respiratório", hint: "dispneia, sibilância, estridor, hipoxemia" },
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

function treeRegionForNode(nodeId: string): TreeRegionId {
  switch (nodeId) {
    case "diagnostic_entry":
    case "not_anaphylaxis_exit":
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
                        onClinicalInputChange(fieldId as keyof ClinicalInputs, preset.value);
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

function renderDiagnosticSupport(
  nodeId: string,
  findingStates: Record<string, FindingState>,
  autoPositiveIds: Set<string>,
  autoReasons: Record<string, string[]>,
  clinicalInputs: ClinicalInputs,
  derivedMetrics: { map: number | null; gcsTotal: number | null },
  activeAssessmentField: AssessmentFieldId | null,
  onOpenAssessmentField: (fieldId: AssessmentFieldId) => void,
  onCloseAssessmentField: () => void,
  onClinicalInputChange: (field: keyof ClinicalInputs, value: string | GlasgowValue) => void,
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
  if (nodeId !== "diagnostic_entry") {
    return null;
  }

  return (
    <View style={styles.supportStack}>
      <View style={styles.assessmentCard}>
        <Text style={styles.assessmentTitle}>Dados iniciais para triagem rápida</Text>
        <Text style={styles.assessmentText}>
          Preencha peso, altura, PAS, PAD, FR, saturação e Glasgow. O sistema marca automaticamente como positivos os
          achados que conseguir inferir desses dados, e você revisa manualmente o restante.
        </Text>

        <View style={styles.assessmentGrid}>
          <ClinicalFieldButton
            label="Peso"
            value={clinicalInputs.weightKg ? `${clinicalInputs.weightKg} kg` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("weightKg")}
          />
          <ClinicalFieldButton
            label="Altura"
            value={clinicalInputs.heightCm ? `${clinicalInputs.heightCm} cm` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("heightCm")}
          />
          <ClinicalFieldButton
            label="PAS"
            value={clinicalInputs.systolic ? `${clinicalInputs.systolic} mmHg` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("systolic")}
          />
          <ClinicalFieldButton
            label="PAD"
            value={clinicalInputs.diastolic ? `${clinicalInputs.diastolic} mmHg` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("diastolic")}
          />
          <View style={[styles.inputCard, styles.metricCard]}>
            <Text style={styles.inputLabel}>PAM</Text>
            <Text style={styles.metricValue}>{derivedMetrics.map != null ? `${derivedMetrics.map} mmHg` : "Aguardando PAS/PAD"}</Text>
          </View>
          <ClinicalFieldButton
            label="FR"
            value={clinicalInputs.respiratoryRate ? `${clinicalInputs.respiratoryRate} irpm` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("respiratoryRate")}
          />
          <ClinicalFieldButton
            label="Sat O₂"
            value={clinicalInputs.oxygenSat ? `${clinicalInputs.oxygenSat}%` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("oxygenSat")}
          />
          <ClinicalFieldButton
            label="GCS"
            value={derivedMetrics.gcsTotal != null ? `Total ${derivedMetrics.gcsTotal}` : ""}
            placeholder="Selecionar"
            onPress={() => onOpenAssessmentField("glasgow")}
          />
        </View>

        <ClinicalFieldSheet
          fieldId={activeAssessmentField}
          visible={activeAssessmentField !== null}
          clinicalInputs={clinicalInputs}
          derivedMetrics={derivedMetrics}
          onClose={onCloseAssessmentField}
          onClinicalInputChange={onClinicalInputChange}
        />
      </View>

      <View style={styles.autoInfoCard}>
        <Text style={styles.autoInfoTitle}>Marcação automática dos cards</Text>
        <Text style={styles.autoInfoText}>
          Cards com selo <Text style={styles.autoInfoStrong}>Auto positivo</Text> foram identificados pelo sistema a partir
          dos dados preenchidos acima. Clique nos outros achados que ainda não foram identificados automaticamente.
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
                          {state === "yes" ? "Sim selecionado" : "Sim"}
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
  const estimatedDose = weight != null ? Math.min(0.5, Math.max(0.1, Math.round(weight * 0.01 * 100) / 100)) : null;
  const standardDose = estimatedDose != null ? (estimatedDose >= 0.4 ? "0,5 mg IM" : "0,3 mg IM") : "0,5 mg IM";
  const adrenalineDetail = estimatedDose != null
    ? `Dose guiada por peso: ${formatDoseMg(estimatedDose)} mg IM na face lateral da coxa (${weight} kg; máximo 0,5 mg).`
    : "Peso ainda não informado. Escolha a dose IM institucional mais adequada ao porte clínico, sem atrasar a aplicação.";

  switch (stepId) {
    case "immediate_im_epinephrine":
      return [
        {
          id: "adrenaline_im",
          title: "Adrenalina intramuscular imediata",
          detail: adrenalineDetail,
          rationale: "Primeira linha obrigatória quando a suspeita clínica de anafilaxia é alta.",
          tone: "danger",
          options: ["0,3 mg IM", "0,5 mg IM"],
          defaultChoice: standardDose,
        },
        {
          id: "monitoring",
          title: "Monitorização contínua",
          detail: "Iniciar oximetria, pressão arterial seriada e monitor cardíaco já nesta etapa.",
          rationale: hasShock || hasRespDistress ? "Há sinais objetivos de instabilidade que pedem vigilância estreita." : "Mesmo casos inicialmente responsivos podem piorar rapidamente.",
          tone: hasShock || hasRespDistress ? "danger" : "info",
          options: ["Monitorização contínua", "Monitorização seriada intensiva"],
          defaultChoice: hasShock || hasRespDistress ? "Monitorização contínua" : "Monitorização seriada intensiva",
        },
        {
          id: "oxygen_support",
          title: "Oxigênio suplementar",
          detail: hasRespDistress
            ? "O quadro favorece iniciar oxigênio imediatamente e escalar conforme saturação e esforço respiratório."
            : "Se a saturação permanecer adequada e sem desconforto respiratório, mantenha prontidão para ofertar O₂ se houver piora.",
          rationale: oxygenSat != null ? `Sat O₂ atual: ${oxygenSat}%` : "Sem saturação preenchida, a conduta precisa ser guiada pela clínica.",
          tone: hasRespDistress ? "warning" : "info",
          options: ["Sem O₂ adicional", "Cateter nasal", "Máscara com reservatório", "Alto fluxo"],
          defaultChoice: hasImpendingAirway ? "Máscara com reservatório" : hasRespDistress ? "Cateter nasal" : "Sem O₂ adicional",
        },
        {
          id: "venous_access",
          title: "Acesso venoso e fluido",
          detail: hasShock
            ? "Obter acesso venoso calibroso já na abordagem inicial e deixar cristalóide pronto para bolus."
            : "Garantir acesso venoso precoce para medicações e eventual expansão, mesmo sem choque neste momento.",
          rationale: hasShock ? "Hipotensão/má perfusão mudam a prioridade do suporte hemodinâmico." : "Acesso precoce evita atraso se o quadro piorar.",
          tone: hasShock ? "danger" : "info",
          options: ["Acesso venoso periférico", "Dois acessos calibrosos + cristalóide"],
          defaultChoice: hasShock ? "Dois acessos calibrosos + cristalóide" : "Acesso venoso periférico",
        },
        {
          id: "airway_plan",
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
          options: ["Sem intubação imediata", "Material + ISR de prontidão", "Intubação imediata / ISR"],
          defaultChoice: hasImpendingAirway || hasNeuroCompromise ? "Material + ISR de prontidão" : "Sem intubação imediata",
        },
      ];
    case "moderate_support_bundle":
      return [
        {
          id: "oxygen_moderate",
          title: "Oxigênio conforme necessidade",
          detail: hasRespDistress ? "Há suporte para manter O₂ suplementar nesta fase." : "Se não houver hipoxemia, mantenha apenas prontidão para oferecer O₂.",
          tone: hasRespDistress ? "warning" : "info",
          options: ["Sem O₂ adicional", "Cateter nasal", "Máscara com reservatório"],
          defaultChoice: hasRespDistress ? "Cateter nasal" : "Sem O₂ adicional",
        },
        {
          id: "iv_ready",
          title: "Acesso venoso precoce",
          detail: "Deixar acesso venoso e cristalóide prontos antes da reavaliação seguinte.",
          tone: "info",
          options: ["Acesso periférico", "Dois acessos periféricos"],
          defaultChoice: "Acesso periférico",
        },
        {
          id: "repeat_adrenaline_prep",
          title: "Preparar repetição de adrenalina IM",
          detail: "Se os sintomas persistirem ou piorarem, a segunda dose IM deve estar pronta para ser feita em 5 minutos.",
          tone: "warning",
          options: ["Preparar 0,3 mg IM", "Preparar 0,5 mg IM"],
          defaultChoice: standardDose.replace(" IM", " IM"),
        },
        {
          id: "bronchodilator",
          title: "Broncodilatador como adjuvante",
          detail: isYes("resp") ? "Pode ser útil se houver broncoespasmo persistente após adrenalina." : "Não é prioridade se não houver broncoespasmo persistente.",
          tone: isYes("resp") ? "info" : "success",
          options: ["Não necessário agora", "Nebulização com broncodilatador"],
          defaultChoice: isYes("resp") ? "Nebulização com broncodilatador" : "Não necessário agora",
        },
      ];
    case "severe_resuscitation_bundle":
      return [
        {
          id: "high_flow_o2",
          title: "Oxigênio em alta oferta",
          detail: "A apresentação grave favorece oferta imediata de O₂ em alta concentração.",
          tone: "danger",
          options: ["Máscara com reservatório", "Alto fluxo"],
          defaultChoice: hasImpendingAirway ? "Máscara com reservatório" : "Alto fluxo",
        },
        {
          id: "large_bore_access",
          title: "Acesso venoso calibroso",
          detail: "Obter acesso venoso calibroso para expansão, medicações e eventual escalonamento.",
          tone: "danger",
          options: ["Dois acessos calibrosos", "Acesso periférico + intraósseo se falha"],
          defaultChoice: "Dois acessos calibrosos",
        },
        {
          id: "fluid_bolus",
          title: "Cristalóide rápido",
          detail: "Na presença de hipotensão/má perfusão, deixar bolus de cristalóide isotônico em curso.",
          tone: "danger",
          options: ["500 mL", "1000 mL", "20 mL/kg"],
          defaultChoice: hasShock ? "20 mL/kg" : "500 mL",
        },
        {
          id: "airway_escalation",
          title: "Preparar via aérea avançada",
          detail: "Equipe, material e estratégia de falha devem estar prontos precocemente.",
          tone: "danger",
          options: ["ISR de prontidão", "Intubação imediata / ISR", "Ventilação bolsa-válvula-máscara"],
          defaultChoice: hasImpendingAirway || hasNeuroCompromise ? "Intubação imediata / ISR" : "ISR de prontidão",
        },
      ];
    case "repeat_im_epinephrine":
      return [
        {
          id: "second_adrenaline",
          title: "Segunda dose de adrenalina IM",
          detail: "Persistência de sintomas sem resolução pede nova dose IM agora.",
          tone: "danger",
          options: ["0,3 mg IM", "0,5 mg IM"],
          defaultChoice: standardDose,
        },
        {
          id: "recheck_vitals",
          title: "Reavaliar resposta em até 5 min",
          detail: "Checar PA, SpO₂, esforço respiratório, edema de via aérea e estado mental após a dose.",
          tone: "warning",
          options: ["Reavaliação em 5 min", "Reavaliação contínua"],
          defaultChoice: "Reavaliação em 5 min",
        },
      ];
    case "critical_escalation_bundle":
      return [
        {
          id: "epinephrine_iv",
          title: "Escalonar para adrenalina IV",
          detail: "Falha após medidas iniciais e instabilidade sustentada favorecem infusão titulada em ambiente monitorizado.",
          tone: "danger",
          options: ["Preparar infusão IV", "Infusão IV já iniciada"],
          defaultChoice: "Preparar infusão IV",
        },
        {
          id: "critical_airway",
          title: "Escalonamento de via aérea",
          detail: "Ameaça progressiva de via aérea ou falha de oxigenação exigem suporte avançado imediato.",
          tone: "danger",
          options: ["ISR imediata", "BVM enquanto prepara ISR", "Ventilação mecânica após IOT"],
          defaultChoice: hasImpendingAirway || hasNeuroCompromise ? "ISR imediata" : "BVM enquanto prepara ISR",
        },
        {
          id: "icu_destination",
          title: "Leito crítico / UTI",
          detail: "Essa etapa já assume monitorização intensiva e suporte avançado contínuo.",
          tone: "warning",
          options: ["Acionar UTI", "Acionar sala de emergência crítica"],
          defaultChoice: "Acionar UTI",
        },
      ];
    case "observation_phase":
      return [
        {
          id: "observation_monitor",
          title: "Observação monitorizada",
          detail: "Mesmo com melhora, o paciente ainda precisa de vigilância para recaída clínica.",
          tone: "info",
          options: ["Observação 4-6 h", "Observação prolongada 12-24 h"],
          defaultChoice: hasShock || hasRespDistress ? "Observação prolongada 12-24 h" : "Observação 4-6 h",
        },
        {
          id: "document_course",
          title: "Documentar gatilho e resposta",
          detail: "Registrar gatilho, doses de adrenalina, tempo de resposta e pendências para alta ou internação.",
          tone: "success",
          options: ["Documentar agora", "Documentado"],
          defaultChoice: "Documentar agora",
        },
      ];
    default:
      return [];
  }
}

export default function AnaphylaxisTreeScreen({ onRouteBack }: Props) {
  const router = useRouter();
  const [engine] = useState(() => createAnaphylaxisDecisionEngine());
  const [manualFindingStates, setManualFindingStates] = useState<Record<string, FindingState>>({});
  const [activeAssessmentField, setActiveAssessmentField] = useState<AssessmentFieldId | null>(null);
  const [actionPlanState, setActionPlanState] = useState<Record<string, { status: ActionPlanStatus; choice?: string }>>({});
  const [clinicalInputs, setClinicalInputs] = useState<ClinicalInputs>({
    weightKg: "",
    heightCm: "",
    systolic: "",
    diastolic: "",
    respiratoryRate: "",
    oxygenSat: "",
    gcsEye: undefined,
    gcsVerbal: undefined,
    gcsMotor: undefined,
  });
  const [revision, setRevision] = useState(0);
  const step = engine.toFrontendStep();
  const currentNode = engine.getCurrentNode();
  const canGoBack = engine.canGoBack();
  const treeRegionId = treeRegionForNode(step.id);
  const treeRegionIndex = TREE_REGIONS.findIndex((region) => region.id === treeRegionId);
  const log = engine.getLog();

  const derivedMetrics = useMemo(() => {
    const systolic = parseNumericInput(clinicalInputs.systolic);
    const diastolic = parseNumericInput(clinicalInputs.diastolic);
    const map = systolic != null && diastolic != null ? Math.round(diastolic + (systolic - diastolic) / 3) : null;
    const gcsTotal =
      clinicalInputs.gcsEye != null && clinicalInputs.gcsVerbal != null && clinicalInputs.gcsMotor != null
        ? clinicalInputs.gcsEye + clinicalInputs.gcsVerbal + clinicalInputs.gcsMotor
        : null;

    return { map, gcsTotal };
  }, [clinicalInputs]);

  const autoFindingContext = useMemo(() => {
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
  }, [clinicalInputs, derivedMetrics.gcsTotal, derivedMetrics.map]);

  const findingStates = useMemo(() => {
    const nextStates: Record<string, FindingState> = {};

    for (const group of DIAGNOSTIC_INTERACTIVE_GROUPS) {
      for (const item of group.items) {
        nextStates[item.id] = manualFindingStates[item.id] ?? (autoFindingContext.autoPositiveIds.has(item.id) ? "yes" : undefined);
      }
    }

    return nextStates;
  }, [manualFindingStates, autoFindingContext]);

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
        recommendedChoice: "Não — reação localizada apenas, por enquanto",
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

    return [
      {
        label: "Nó atual",
        value: step.title,
        accent: "#1a4f9c",
      },
      {
        label: "Região atual",
        value: TREE_REGIONS[treeRegionIndex]?.label ?? "Árvore",
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
  }, [log, step.title, treeRegionIndex]);

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

  function openAssessmentField(fieldId: AssessmentFieldId) {
    setActiveAssessmentField(fieldId);
  }

  function closeAssessmentField() {
    setActiveAssessmentField(null);
  }

  function setClinicalInputValue(field: keyof ClinicalInputs, value: string | GlasgowValue) {
    setClinicalInputs((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function setFindingState(findingId: string, value: Exclude<FindingState, undefined>) {
    setManualFindingStates((current) => {
      const autoState: FindingState = autoFindingContext.autoPositiveIds.has(findingId) ? "yes" : undefined;
      const effectiveState = current[findingId] ?? autoState;

      if (effectiveState === value) {
        if (current[findingId] === undefined) {
          return current;
        }

        const next = { ...current };
        delete next[findingId];
        return next;
      }

      if (autoState === value) {
        const next = { ...current };
        delete next[findingId];
        return next;
      }

      return {
        ...current,
        [findingId]: value,
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
            title="Anafilaxia organizada como árvore decisória"
            subtitle="Diagnóstico, adrenalina IM obrigatória, estratificação, loops de reavaliação, escalonamento e saída terminal em um fluxo desacoplado."
            badgeText="Árvore decisória v2"
            metrics={heroMetrics}
            progressLabel={`Região ${treeRegionIndex + 1} de ${TREE_REGIONS.length}`}
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
        sidebarEyebrow="Mapa da árvore"
        sidebarTitle="Blocos da decisão"
        contentEyebrow={`Região ${treeRegionIndex + 1} de ${TREE_REGIONS.length}`}
        contentTitle={step.title}
        contentHint={step.summary}
        contentBadgeText={step.kind === "transition" ? "Saída terminal" : "Fluxo clínico"}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step.kind === "decision" ? (
            <View style={styles.block}>
              <View style={styles.textCard}>
                <Text style={styles.blockKicker}>Pergunta clínica</Text>
                <Text style={styles.blockTitle}>{step.question}</Text>
                {renderDiagnosticSupport(
                  step.id,
                  findingStates,
                  autoFindingContext.autoPositiveIds,
                  autoFindingContext.autoReasons,
                  clinicalInputs,
                  derivedMetrics,
                  activeAssessmentField,
                  openAssessmentField,
                  closeAssessmentField,
                  setClinicalInputValue,
                  setFindingState,
                  diagnosticSuggestion,
                )}
              </View>

              <DecisionGrid
                title="Escolha a próxima ramificação"
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
                  <Text style={styles.planIntroTitle}>Condutas sugeridas para o quadro atual</Text>
                  <Text style={styles.planIntroText}>
                    Confirme os cards que condizem com o paciente e ajuste as alternativas quando a conduta sugerida precisar ser modificada.
                  </Text>
                </View>

                <View style={styles.actionPlanGrid}>
                  {actionPlanCards.map((card) => {
                    const cardKey = `${step.id}:${card.id}`;
                    const state = actionPlanState[cardKey];
                    const status = state?.status ?? "suggested";
                    const choice = state?.choice ?? card.defaultChoice;
                    return (
                      <View
                        key={cardKey}
                        style={[
                          styles.actionPlanCard,
                          card.tone === "danger" && styles.actionPlanCardDanger,
                          card.tone === "warning" && styles.actionPlanCardWarning,
                          card.tone === "info" && styles.actionPlanCardInfo,
                          card.tone === "success" && styles.actionPlanCardSuccess,
                          status === "confirmed" && styles.actionPlanCardConfirmed,
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
                              status === "confirmed" && styles.actionPlanBadgeConfirmed,
                              status === "adjusted" && styles.actionPlanBadgeAdjusted,
                            ]}>
                            <Text
                              style={[
                                styles.actionPlanBadgeText,
                                status === "confirmed" && styles.actionPlanBadgeTextConfirmed,
                                status === "adjusted" && styles.actionPlanBadgeTextAdjusted,
                              ]}>
                              {status === "confirmed" ? "Confirmada" : status === "adjusted" ? "Ajustada" : "Sugerida"}
                            </Text>
                          </View>
                        </View>

                        {card.rationale ? <Text style={styles.actionPlanRationale}>{card.rationale}</Text> : null}
                        {choice ? (
                          <View style={styles.actionPlanChoiceCard}>
                            <Text style={styles.actionPlanChoiceLabel}>Escolha atual</Text>
                            <Text style={styles.actionPlanChoiceValue}>{choice}</Text>
                          </View>
                        ) : null}

                        {card.options?.length ? (
                          <View style={styles.actionPlanOptions}>
                            {card.options.map((option) => {
                              const active = choice === option;
                              return (
                                <Pressable
                                  key={`${cardKey}:${option}`}
                                  style={[styles.actionPlanOptionChip, active && styles.actionPlanOptionChipActive]}
                                  onPress={() => updateActionPlanCard(cardKey, { status: "adjusted", choice: option })}>
                                  <Text style={[styles.actionPlanOptionChipText, active && styles.actionPlanOptionChipTextActive]}>
                                    {option}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        ) : null}

                        <View style={styles.actionPlanActions}>
                          <Pressable
                            style={[styles.actionPlanButton, styles.actionPlanConfirmButton]}
                            onPress={() => updateActionPlanCard(cardKey, { status: "confirmed", choice })}>
                            <Text style={styles.actionPlanConfirmButtonText}>Confirmar conduta</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.actionPlanButton, styles.actionPlanAdjustButton]}
                            onPress={() => updateActionPlanCard(cardKey, { status: status === "adjusted" ? "suggested" : "adjusted", choice })}>
                            <Text style={styles.actionPlanAdjustButtonText}>
                              {status === "adjusted" ? "Voltar ao sugerido" : "Marcar para ajuste"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
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
                <Text style={styles.blockTitle}>Critérios e destino deste ramo</Text>
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
                  <Text style={styles.secondaryButtonText}>Reiniciar árvore</Text>
                </Pressable>
                {onRouteBack ? (
                  <Pressable style={styles.ghostButton} onPress={onRouteBack}>
                    <Text style={styles.ghostButtonText}>Voltar aos módulos</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}
        </ScrollView>
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
  findingButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d7e4f5",
    backgroundColor: "#f8fbff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  findingButtonPressed: {
    opacity: 0.82,
  },
  findingButtonYesActive: {
    backgroundColor: "#e8f7ef",
    borderColor: "#44a26d",
    borderWidth: 2,
  },
  findingButtonNoActive: {
    backgroundColor: "#fff3f3",
    borderColor: "#d86b6b",
    borderWidth: 2,
  },
  findingButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#4b6070",
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
  actionPlanCardConfirmed: {
    boxShadow: "0 0 0 2px rgba(22,101,52,0.08)",
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
  actionPlanBadgeConfirmed: {
    backgroundColor: "#e8f7ef",
    borderColor: "#8ed0a5",
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
  actionPlanBadgeTextConfirmed: {
    color: "#116149",
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
  actionPlanChoiceCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe7f2",
    padding: 12,
    gap: 4,
  },
  actionPlanChoiceLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#60758f",
  },
  actionPlanChoiceValue: {
    fontSize: 14,
    lineHeight: 20,
    color: "#24384c",
    fontWeight: "800",
  },
  actionPlanOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionPlanOptionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d7e4f5",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionPlanOptionChipActive: {
    backgroundColor: "#eaf2ff",
    borderColor: "#8fb5f5",
  },
  actionPlanOptionChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#516579",
  },
  actionPlanOptionChipTextActive: {
    color: "#1d4ed8",
  },
  actionPlanActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionPlanButton: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionPlanConfirmButton: {
    backgroundColor: "#102128",
  },
  actionPlanAdjustButton: {
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#c9daf7",
  },
  actionPlanConfirmButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },
  actionPlanAdjustButtonText: {
    fontSize: 13,
    fontWeight: "900",
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
