import { Pressable, Text, View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
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
import { setSessionFlowType } from "../../sepsis-engine";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";

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
  overlay:       { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f8fafc" },
  card:          { width: "100%", maxWidth: 480, backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 16,
                   shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 8 },
  eyebrow:       { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, color: "#ef4444", textTransform: "uppercase" },
  title:         { fontSize: 22, fontWeight: "800", color: "#0f172a", lineHeight: 28 },
  subtitle:      { fontSize: 13, color: "#64748b", lineHeight: 18 },
  option:        { flexDirection: "row", alignItems: "flex-start", gap: 14, borderRadius: 14, padding: 16, borderWidth: 2 },
  optionEmergency: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  optionICU:     { borderColor: "#7c3aed", backgroundColor: "#f5f3ff" },
  optionIcon:    { fontSize: 32, lineHeight: 40 },
  optionBody:    { flex: 1, gap: 4 },
  optionTitle:   { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  optionDesc:    { fontSize: 12, color: "#475569", lineHeight: 17 },
});

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

export default SepsisProtocolScreen;
