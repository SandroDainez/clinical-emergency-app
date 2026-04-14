import { Pressable, Text, View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import type {
  AuxiliaryPanel,
  ClinicalLogEntry,
  EncounterSummary,
  ProtocolState,
} from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, formatReviewDate, getOptionSublabel } from "./protocol-screen-utils";
import { setSessionFlowType, applyReturnAction } from "../../sepsis-engine";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";
import { openClinicalModule } from "../../lib/open-clinical-module";
import { markProtocolSessionForResume } from "../../lib/module-session-navigation";

type FlowType = "emergencia" | "uti_internado";

type SepsisProtocolScreenProps = {
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

function FlowSelector({ onSelect }: { onSelect: (ft: FlowType) => void }) {
  return (
    <View style={fs.overlay}>
      <View style={fs.card}>
        <Text style={fs.eyebrow}>Módulo Sepse</Text>
        <Text style={fs.title}>Qual é o contexto do atendimento?</Text>
        <Text style={fs.subtitle}>
          O fluxo e as condutas serão adaptados conforme a situação clínica.
        </Text>

        <Pressable style={[fs.option, fs.optionEmergency]} onPress={() => onSelect("emergencia")}>
          <Text style={fs.optionIcon}>🚑</Text>
          <View style={fs.optionBody}>
            <Text style={fs.optionTitle}>Primeiro Atendimento</Text>
            <Text style={fs.optionDesc}>
              Pronto-socorro, emergência, UPA — paciente chegando agora com suspeita de sepse.
              Fluxo de triagem, diagnóstico, estabilização e ATB inicial.
            </Text>
          </View>
        </Pressable>

        <Pressable style={[fs.option, fs.optionICU]} onPress={() => onSelect("uti_internado")}>
          <Text style={fs.optionIcon}>🏥</Text>
          <View style={fs.optionBody}>
            <Text style={fs.optionTitle}>Paciente Internado na UTI</Text>
            <Text style={fs.optionDesc}>
              Intensivista avaliando piora clínica, choque, resultados de cultura —
              escalonamento de ATB, drogas vasoativas e manejo avançado de órgãos.
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const fs = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#0a3b3d" },
  card: { width: "100%", maxWidth: 560, backgroundColor: "#f8f5ef", borderRadius: 30, padding: 26, gap: 16,
    borderWidth: 1, borderColor: "#5fb49c",
    shadowColor: "#021113", shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 10 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5, color: "#0f6b61", textTransform: "uppercase" },
  title: { fontSize: 28, fontWeight: "900", color: "#102128", lineHeight: 34, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, color: "#496067", lineHeight: 21, fontWeight: "600" },
  option: { flexDirection: "row", alignItems: "flex-start", gap: 14, borderRadius: 22, padding: 18, borderWidth: 1.5 },
  optionEmergency: { borderColor: "#8fe7dd", backgroundColor: "#e0fbf8" },
  optionICU: { borderColor: "#cfbdfd", backgroundColor: "#f2ebff" },
  optionIcon: { fontSize: 32, lineHeight: 40 },
  optionBody: { flex: 1, gap: 5 },
  optionTitle: { fontSize: 17, fontWeight: "900", color: "#102128" },
  optionDesc: { fontSize: 13, color: "#496067", lineHeight: 19, fontWeight: "600" },
});

/** Módulos auxiliares com indicação clínica dinâmica */
type ClinicalActionLink = {
  moduleId: "isr-rapida" | "drogas-vasoativas" | "ventilacao-mecanica";
  icon: string;
  label: string;
  sublabel: string;
  indication: string;   // quando mostrar
  urgent?: boolean;
};

const SEPSIS_ACTION_LINKS: ClinicalActionLink[] = [
  {
    moduleId: "isr-rapida",
    icon: "IOT",
    label: "ISR / Intubação",
    sublabel: "Via aérea difícil · Sequência rápida",
    indication: "intubation",
    urgent: true,
  },
  {
    moduleId: "drogas-vasoativas",
    icon: "VA",
    label: "Drogas Vasoativas",
    sublabel: "Noradrena · Vasopressina · Dobuta",
    indication: "vasopressor",
    urgent: true,
  },
  {
    moduleId: "ventilacao-mecanica",
    icon: "VM",
    label: "Ventilação Mecânica",
    sublabel: "Setup inicial · PEEP · Modos",
    indication: "ventilation",
  },
];

function SepsisProtocolScreen({
  auxiliaryPanel,
  auxiliaryFieldSections,
  canGoBack,
  clinicalLog,
  encounterSummary,
  options,
  state,
  isCurrentStateTimerRunning,
  actionButtonLabel,
  onFieldChange,
  onPresetApply,
  onUnitChange,
  onActionRun,
  onStatusChange,
  onGoBack,
  onConfirmAction,
  onRunTransition,
  onExportSummary,
  onPrintReport,
}: SepsisProtocolScreenProps) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const router = useRouter();
  const params = useLocalSearchParams<{ return_action?: string }>();
  const [flowType, setFlowType] = useState<FlowType | null>(
    () => (getProtocolUiState(encounterSummary.protocolId)?.flowType as FlowType | undefined) ?? null
  );
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );
  const isICU = flowType === "uti_internado";
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(
    () => getAppGuidelinesStatus()
  );

  // Reconhecer ação realizada em módulo externo ao retornar
  useEffect(() => {
    if (params.return_action) {
      applyReturnAction(params.return_action);
    }
  }, [params.return_action]);

  // Try to fetch remote metadata once on mount (no-op if REMOTE_METADATA_URL is null)
  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, {
      activeTab,
      flowType: flowType ?? undefined,
    });
  }, [activeTab, encounterSummary.protocolId, flowType]);

  function handleSelectFlow(ft: FlowType) {
    setSessionFlowType(ft);
    setFlowType(ft);
    setActiveTab(0);
  }
  const TOTAL_TABS = isICU ? 6 : 5;
  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabLabels = isICU
    ? ["Ex. Clínico", "Diagnóstico", "Estabilização", "Conduta", "UTI", ""]
    : ["Ex. Clínico", "Diagnóstico", "Estabilização", "Conduta", ""];

  function getFieldValue(fieldId: string) {
    return auxiliaryPanel?.fields.find((field) => field.id === fieldId)?.value ?? "";
  }

  function buildReferralRoute(link: ClinicalActionLink): Href {
    const suspectedSource = getFieldValue("suspectedSource");
    const oxygenTherapy = getFieldValue("oxygenTherapy");
    const intubationDecision = getFieldValue("intubationDecision");
    const respiratoryPattern = getFieldValue("respiratoryPattern");

    return {
      pathname: `/modulos/${link.moduleId}`,
      params: {
        from_module: "sepse-adulto",
        case_label: suspectedSource ? `Sepse · ${suspectedSource}` : "Sepse",
        reason:
          link.moduleId === "isr-rapida"
            ? "Insuficiência respiratória / necessidade de via aérea avançada"
            : link.moduleId === "drogas-vasoativas"
              ? "Hipotensão / choque séptico com necessidade de vasopressor"
              : "Suporte ventilatório invasivo / setup inicial da ventilação mecânica",
        age: getFieldValue("age"),
        sex: getFieldValue("sex"),
        weight_kg: getFieldValue("weightKg"),
        height_cm: getFieldValue("heightCm"),
        spo2: getFieldValue("oxygenSaturation"),
        gcs: getFieldValue("gcs") || getFieldValue("preIntubationGcs"),
        pas: getFieldValue("systolicPressure"),
        pad: getFieldValue("diastolicPressure"),
        fc: getFieldValue("heartRate"),
        symptoms: respiratoryPattern || getFieldValue("diagnosticHypothesis"),
        oxygen: oxygenTherapy || intubationDecision,
      },
    } as Href;
  }

  function handleNavigate(link: ClinicalActionLink) {
    markProtocolSessionForResume(encounterSummary.protocolId);
    void openClinicalModule(router, link.moduleId, buildReferralRoute(link));
  }

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((t) => t + 1);
    } else {
      onConfirmAction();
    }
  }

  // Show flow selector before the main form
  if (flowType === null) {
    return <FlowSelector onSelect={handleSelectFlow} />;
  }

  return (
    <>
      {/* ── Flow type badge ──────────────────────────────────────── */}
      <View style={styles.sepsisTopBar}>
        <Pressable
          onPress={() => setFlowType(null)}
          style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: isICU ? "#7c3aed" : "#3b82f6",
                   borderRadius: 20, alignSelf: "flex-start", marginBottom: 4 }}>
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
            {isICU ? "🏥 UTI — Paciente Internado" : "🚑 Primeiro Atendimento"} · Alterar
          </Text>
        </Pressable>

        {/* ── Guidelines version badge ─────────────────────────── */}
        <View style={{
          flexDirection: "row", alignItems: "center", marginBottom: 4,
          backgroundColor: guidelinesStatus.overallColor === "green" ? "#f0fdf4"
            : guidelinesStatus.overallColor === "yellow" ? "#fefce8" : "#fef2f2",
          borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
          borderWidth: 1,
          borderColor: guidelinesStatus.overallColor === "green" ? "#bbf7d0"
            : guidelinesStatus.overallColor === "yellow" ? "#fde68a" : "#fecaca",
          alignSelf: "flex-start",
        }}>
          <Text style={{
            fontSize: 10, fontWeight: "600",
            color: guidelinesStatus.overallColor === "green" ? "#166534"
              : guidelinesStatus.overallColor === "yellow" ? "#92400e" : "#991b1b",
          }}>
            {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"}{" "}
            SSC Sepse · Revisado {formatReviewDate(guidelinesStatus.lastFullReview)} · {guidelinesStatus.overallStatus}
          </Text>
        </View>
        {state.phaseLabel && state.phaseStep && state.phaseTotal ? (
          <View style={styles.sepsisTopBarPhase}>
            <View style={styles.phaseProgressBar}>
              {Array.from({ length: state.phaseTotal }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.phaseSegment,
                    i < state.phaseStep! ? styles.phaseSegmentActive : styles.phaseSegmentInactive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.phaseLabel}>
              Fase {state.phaseStep}/{state.phaseTotal} — {state.phaseLabel}
            </Text>
          </View>
        ) : null}
        <View style={styles.sepsisTopBarInfo}>
          <Text style={styles.sepsisTopBarStep} numberOfLines={1}>
            {state.text}
          </Text>
          {state.details?.[0] ? (
            <Text style={styles.sepsisTopBarHint} numberOfLines={2}>
              {state.details[0]}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ── Formulário em abas ─────────────────────────────────────── */}
      {auxiliaryPanel ? (
        <SepsisFormTabs
          auxiliaryPanel={auxiliaryPanel}
          fieldSections={auxiliaryFieldSections}
          metrics={auxiliaryPanel.metrics}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFieldChange={onFieldChange}
          onPresetApply={onPresetApply}
          onUnitChange={onUnitChange}
          onActionRun={onActionRun}
          onStatusChange={onStatusChange}
          flowType={flowType}
          onCtaAction={(actionId) => {
            if (actionId === "switch_to_emergencia") {
              handleSelectFlow("emergencia");
            }
          }}
        />
      ) : null}

      {/* ── Log clínico (somente ao finalizar) ────────────────────── */}
      {isEnd ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
        />
      ) : null}

      {/* ── Decisão clínica (estados do tipo question) ─────────────── */}
      {isQuestion ? (
        <View style={{ gap: 10 }}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </Pressable>
          ) : null}
          <DecisionGrid
            options={options.map((opt) => ({
              id: opt,
              label: formatOptionLabel(opt),
              sublabel: getOptionSublabel(opt),
            }))}
            title={state.text}
            onSelect={(id) => onRunTransition(id)}
          />
        </View>
      ) : null}

      {/* ── Ações clínicas — links para módulos auxiliares ────────── */}
      {auxiliaryPanel && !isEnd ? (
        <ClinicalActionsPanel
          panel={auxiliaryPanel}
          links={SEPSIS_ACTION_LINKS}
          onNavigate={(link) => handleNavigate(link)}
        />
      ) : null}

      {/* ── Avançar etapa ─────────────────────────────────────────── */}
      {!isQuestion && !isEnd && !isCurrentStateTimerRunning ? (
        <View style={styles.primaryActions}>
          {canGoBack && activeTab === 0 ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
          ) : activeTab > 0 ? (
            <Pressable style={styles.backButton} onPress={() => setActiveTab((t) => t - 1)}>
              <Text style={styles.backButtonText}>← Anterior</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.primaryButton} onPress={handleNextStep}>
            <Text style={styles.primaryButtonText}>
              {isLastTab ? "Finalizar" : `Próximo: ${tabLabels[activeTab]}`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>
          Atendimento finalizado. Reavaliar contexto clínico se necessário.
        </Text>
      ) : null}
    </>
  );
}

/** Detecta se uma indicação clínica está presente no painel */
function hasIndication(panel: AuxiliaryPanel, indication: string): boolean {
  const fields = panel.fields ?? [];
  const getVal = (id: string) =>
    fields.find((f) => f.id === id)?.value?.toString().toLowerCase() ?? "";

  switch (indication) {
    case "intubation": {
      const iot = getVal("intubationDecision");
      const diag = getVal("diagnosticHypothesis");
      const spo2 = parseFloat(getVal("oxygenSaturation").replace(",", "."));
      const ph = parseFloat(getVal("ph").replace(",", "."));
      return (
        /iot|intub|vm|ventilação/i.test(iot) ||
        /choque/i.test(diag) ||
        (!isNaN(spo2) && spo2 < 88) ||
        (!isNaN(ph) && ph < 7.2)
      );
    }
    case "vasopressor": {
      const vaso = getVal("vasopressorUse");
      const diag = getVal("diagnosticHypothesis");
      const map = (() => {
        const pas = parseFloat(getVal("systolicPressure").replace(",", "."));
        const pad = parseFloat(getVal("diastolicPressure").replace(",", "."));
        return !isNaN(pas) && !isNaN(pad) ? (pas + 2 * pad) / 3 : NaN;
      })();
      return (
        /noradrena|vasopres|dopamina|dobutamina/i.test(vaso) ||
        /choque/i.test(diag) ||
        (!isNaN(map) && map < 65)
      );
    }
    case "ventilation": {
      const iot = getVal("intubationDecision");
      const ventMode = getVal("ventilationMode");
      return /iot|intub|vm|ventila/i.test(iot) || ventMode.length > 0;
    }
    default:
      return false;
  }
}

function ClinicalActionsPanel({
  panel,
  links,
  onNavigate,
}: {
  panel: AuxiliaryPanel;
  links: ClinicalActionLink[];
  onNavigate: (link: ClinicalActionLink) => void;
}) {
  const visibleLinks = links.filter((l) => hasIndication(panel, l.indication));
  if (visibleLinks.length === 0) return null;

  return (
    <View style={cap.container}>
      <View style={cap.dividerRow}>
        <View style={cap.dividerLine} />
        <Text style={cap.dividerLabel}>AÇÕES CLÍNICAS INDICADAS</Text>
        <View style={cap.dividerLine} />
      </View>
      <View style={cap.grid}>
        {visibleLinks.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => onNavigate(link)}
            style={({ pressed }) => [
              cap.card,
              link.urgent && cap.cardUrgent,
              pressed && cap.cardPressed,
            ]}>
            <View style={[cap.iconBox, link.urgent && cap.iconBoxUrgent]}>
              <Text style={[cap.iconText, link.urgent && cap.iconTextUrgent]}>
                {link.icon}
              </Text>
            </View>
            <View style={cap.cardBody}>
              <Text style={[cap.cardLabel, link.urgent && cap.cardLabelUrgent]}>
                {link.label}
              </Text>
              <Text style={cap.cardSub}>{link.sublabel}</Text>
            </View>
            <Text style={cap.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
      <Text style={cap.hint}>Voltar retorna ao protocolo Sepse</Text>
    </View>
  );
}

const cap = StyleSheet.create({
  container:      { gap: 8 },
  dividerRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: "#fecaca" },
  dividerLabel:   { fontSize: 10, fontWeight: "700", color: "#ef4444", letterSpacing: 0.8 },
  grid:           { gap: 7 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#ffffff", borderRadius: 12,
    borderWidth: 1, borderColor: "#e2e8f0",
    paddingHorizontal: 12, paddingVertical: 10,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardUrgent:     { borderColor: "#fca5a5", backgroundColor: "#fff7f7" },
  cardPressed:    { opacity: 0.85 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0",
    alignItems: "center", justifyContent: "center",
  },
  iconBoxUrgent:  { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  iconText:       { fontSize: 10, fontWeight: "800", color: "#64748b" },
  iconTextUrgent: { color: "#dc2626" },
  cardBody:       { flex: 1, gap: 2 },
  cardLabel:      { fontSize: 13, fontWeight: "700", color: "#0f172a", letterSpacing: -0.1 },
  cardLabelUrgent:{ color: "#dc2626" },
  cardSub:        { fontSize: 10, fontWeight: "500", color: "#64748b", lineHeight: 13 },
  arrow:          { fontSize: 16, color: "#cbd5e1", fontWeight: "700" },
  hint:           { fontSize: 9, fontWeight: "600", color: "#cbd5e1", textAlign: "center", letterSpacing: 0.3 },
});

export default SepsisProtocolScreen;
