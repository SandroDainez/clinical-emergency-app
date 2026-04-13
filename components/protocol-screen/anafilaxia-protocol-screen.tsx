import { Pressable, ScrollView, Text, View } from "react-native";
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
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { ANAFILAXIA_TABS } from "./anafilaxia-tab-config";
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

const TOTAL_TABS = 4;

export default function AnafilaxiaProtocolScreen(props: Props) {
  const {
    auxiliaryPanel,
    auxiliaryFieldSections,
    canGoBack,
    clinicalLog,
    encounterSummary,
    options,
    state,
    isCurrentStateTimerRunning,
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
  } = props;

  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab });
  }, [activeTab, encounterSummary.protocolId]);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabMeta = ANAFILAXIA_TABS[activeTab];
  const nextTabLabel = ANAFILAXIA_TABS[activeTab + 1]?.label;

  // ── Airway status banner ──────────────────────────────────────────────────
  const airwayField = auxiliaryPanel?.fields.find((f) => f.id === "treatmentAirway");
  const airwayValue = airwayField?.value ?? "";

  const AIRWAY_QUICK = [
    { label: "IOT realizada", value: "Intubação orotraqueal realizada", icon: "🫁", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
    { label: "Máscara laríngea", value: "Máscara laríngea posicionada com ventilação efetiva", icon: "😮‍💨", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
    { label: "BVM", value: "Ventilação com bolsa-válvula-máscara mantida", icon: "💨", color: "#0369a1", bg: "#eff6ff", border: "#93c5fd" },
    { label: "Cricotireoidostomia", value: "Cricotireoidostomia realizada", icon: "✂️", color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd" },
  ];

  const matchedAirway = AIRWAY_QUICK.find(
    (q) => airwayValue.toLowerCase().includes(q.value.split(" ")[0].toLowerCase()) ||
           airwayValue === q.value
  );
  const isAdvancedAirway = !!matchedAirway;
  const [airwayExpanded, setAirwayExpanded] = useState(false);

  function handleNextStep() {
    if (!isLastTab) setActiveTab((t) => t + 1);
    else onConfirmAction();
  }

  return (
    <>
      <View style={styles.sepsisTopBar}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            backgroundColor:
              guidelinesStatus.overallColor === "green"
                ? "#f0fdf4"
                : guidelinesStatus.overallColor === "yellow"
                  ? "#fefce8"
                  : "#fef2f2",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderWidth: 1,
            borderColor:
              guidelinesStatus.overallColor === "green"
                ? "#bbf7d0"
                : guidelinesStatus.overallColor === "yellow"
                  ? "#fde68a"
                  : "#fecaca",
            alignSelf: "flex-start",
          }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color:
                guidelinesStatus.overallColor === "green"
                  ? "#166534"
                  : guidelinesStatus.overallColor === "yellow"
                    ? "#92400e"
                    : "#991b1b",
            }}>
            {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"} WAO Anafilaxia · Revisado {formatReviewDate(guidelinesStatus.lastFullReview)} · {guidelinesStatus.overallStatus}
          </Text>
        </View>
        <View style={styles.sepsisTopBarPhase}>
          <View style={styles.phaseProgressBar}>
            {Array.from({ length: TOTAL_TABS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.phaseSegment,
                  i < activeTab + 1 ? styles.phaseSegmentActive : styles.phaseSegmentInactive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.phaseLabel}>
            Etapa {activeTab + 1} de {TOTAL_TABS} — {tabMeta?.phaseTitle ?? ""}
          </Text>
        </View>
        <View style={styles.sepsisTopBarInfo}>
          <Text style={styles.sepsisTopBarStep} numberOfLines={2}>
            {state.text}
          </Text>
          {state.details?.length ? (
            <Text style={styles.sepsisTopBarHint} numberOfLines={4}>
              {state.details.join(" ")}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ── Airway status banner — always visible across all tabs ── */}
      {!isEnd && (
        <View style={airwayBanner.wrap}>
          <Pressable
            style={[
              airwayBanner.row,
              isAdvancedAirway && { backgroundColor: matchedAirway!.bg, borderColor: matchedAirway!.border },
            ]}
            onPress={() => setAirwayExpanded((v) => !v)}>
            <Text style={[airwayBanner.icon]}>
              {isAdvancedAirway ? matchedAirway!.icon : "🫁"}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[airwayBanner.label, isAdvancedAirway && { color: matchedAirway!.color }]}>
                {isAdvancedAirway
                  ? `Via aérea — ${matchedAirway!.label}`
                  : "Via aérea — marcar aqui"}
              </Text>
              {isAdvancedAirway && (
                <Text style={[airwayBanner.sub, { color: matchedAirway!.color }]} numberOfLines={1}>
                  {airwayValue}
                </Text>
              )}
            </View>
            <Text style={[airwayBanner.chev, isAdvancedAirway && { color: matchedAirway!.color }]}>
              {airwayExpanded ? "▲" : "▼"}
            </Text>
          </Pressable>

          {airwayExpanded && (
            <View style={airwayBanner.panel}>
              <Text style={airwayBanner.panelLabel}>Selecione o suporte de via aérea em uso:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={airwayBanner.chips}>
                {AIRWAY_QUICK.map((q) => {
                  const active = airwayValue === q.value;
                  return (
                    <Pressable
                      key={q.value}
                      style={[
                        airwayBanner.chip,
                        { borderColor: q.border },
                        active && { backgroundColor: q.bg },
                      ]}
                      onPress={() => {
                        onPresetApply("treatmentAirway", active ? "Sem indicação imediata de intubação" : q.value);
                        setAirwayExpanded(false);
                      }}>
                      <Text style={[airwayBanner.chipTxt, { color: q.color }]}>
                        {q.icon} {q.label}
                      </Text>
                      {active && <Text style={[airwayBanner.chipCheck, { color: q.color }]}>✓</Text>}
                    </Pressable>
                  );
                })}
                <Pressable
                  style={[airwayBanner.chip, { borderColor: "#e2e8f0" }]}
                  onPress={() => {
                    onPresetApply("treatmentAirway", "Sem indicação imediata de intubação");
                    setAirwayExpanded(false);
                  }}>
                  <Text style={[airwayBanner.chipTxt, { color: "#475569" }]}>Sem via aérea avançada</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}
        </View>
      )}

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
          moduleMode="anafilaxia"
        />
      ) : null}

      {isEnd ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
        />
      ) : null}

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
              {isLastTab ? "Finalizar" : `Próximo: ${nextTabLabel ?? "…"}`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>
          Registo concluído. Garantir observação adequada e orientação sobre autoinjetor conforme protocolo.
        </Text>
      ) : null}
    </>
  );
}

import { StyleSheet } from "react-native";
const airwayBanner = StyleSheet.create({
  wrap:       { marginHorizontal: 12, marginBottom: 6 },
  row:        { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f8fafc",
                borderRadius: 10, borderWidth: 1.5, borderColor: "#e2e8f0",
                paddingHorizontal: 12, paddingVertical: 10 },
  icon:       { fontSize: 18 },
  label:      { fontSize: 12, fontWeight: "800", color: "#475569" },
  sub:        { fontSize: 11, fontWeight: "500", marginTop: 1 },
  chev:       { fontSize: 11, color: "#94a3b8" },
  panel:      { backgroundColor: "#ffffff", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
                padding: 12, gap: 8, marginTop: 4 },
  panelLabel: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  chips:      { gap: 8, paddingVertical: 2 },
  chip:       { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 9,
                borderRadius: 20, borderWidth: 1.5, backgroundColor: "#f8fafc" },
  chipTxt:    { fontSize: 13, fontWeight: "700" },
  chipCheck:  { fontSize: 13, fontWeight: "800", marginLeft: 2 },
});
