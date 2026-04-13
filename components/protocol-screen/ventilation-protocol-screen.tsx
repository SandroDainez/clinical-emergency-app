import { Pressable, Text, View } from "react-native";
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
import { VENT_TABS } from "./ventilation-tab-config";

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


export default function VentilationProtocolScreen(props: Props) {
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
  const [activeTab, setActiveTab] = useState(0);
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );
  const visibleAuxiliaryPanel = auxiliaryPanel
    ? {
        ...auxiliaryPanel,
        actions: auxiliaryPanel.actions.filter((action) => {
          if (action.id === "apply_initial_vent_setup") {
            return activeTab === 0;
          }
          if (action.id === "record_gasometry_snapshot") {
            return activeTab === 2;
          }
          return false;
        }),
      }
    : null;

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabMeta = VENT_TABS[activeTab];
  const nextTabLabel = VENT_TABS[activeTab + 1]?.label;
  const currentCaseLabel =
    auxiliaryFieldSections
      .flatMap(([, fields]) => fields)
      .find((field) => field.id === "caseLabel")?.value?.trim() || "Caso sem identificação";

  function handleActionRun(actionId: string, requiresConfirmation?: boolean) {
    onActionRun(actionId, requiresConfirmation);

    if (actionId === "apply_initial_vent_setup") {
      setActiveTab(1);
    }
    if (actionId === "record_gasometry_snapshot") {
      setActiveTab(3);
    }
  }

  const gasometryEntries = clinicalLog.filter((entry) => entry.title === "Gasometria registrada").slice(0, 6);

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((t) => t + 1);
      return;
    }

    setActiveTab(2);
  }

  return (
    <>
      <View style={styles.sepsisTopBar}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 8,
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#eff6ff",
              borderColor: "#bfdbfe",
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#1d4ed8", marginBottom: 2 }}>
              CASO ATUAL
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e3a8a" }} numberOfLines={1}>
              {currentCaseLabel}
            </Text>
          </View>
          <Pressable
            style={{
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#fecaca",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
            onPress={() => {
              onActionRun("start_new_vent_case");
              setActiveTab(0);
            }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#b91c1c" }}>Novo caso</Text>
          </Pressable>
        </View>
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
            {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"} VM Protetora · Revisado {formatReviewDate(guidelinesStatus.lastFullReview)} · {guidelinesStatus.overallStatus}
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

      {visibleAuxiliaryPanel ? (
        <SepsisFormTabs
          auxiliaryPanel={visibleAuxiliaryPanel}
          fieldSections={auxiliaryFieldSections}
          metrics={visibleAuxiliaryPanel.metrics}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFieldChange={onFieldChange}
          onPresetApply={onPresetApply}
          onUnitChange={onUnitChange}
          onActionRun={handleActionRun}
          onStatusChange={onStatusChange}
          moduleMode="ventilation"
        />
      ) : null}

      {activeTab >= 2 && gasometryEntries.length > 0 ? (
        <View style={[styles.card, { gap: 10 }]}>
          <Text style={styles.sectionTitle}>Gasometrias registradas</Text>
          {gasometryEntries.map((entry, index) => (
            <View
              key={`${entry.timestamp}-${entry.title}`}
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 12,
                padding: 12,
                gap: 6,
              }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#0369a1" }}>
                Gasometria {gasometryEntries.length - index}
                {" · "}
                {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: "#334155" }}>{entry.details}</Text>
            </View>
          ))}
        </View>
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
              {isLastTab ? "Nova gasometria" : `Próximo: ${nextTabLabel ?? "…"}`}
            </Text>
          </Pressable>
          {isLastTab ? (
            <Pressable style={styles.backButton} onPress={onConfirmAction}>
              <Text style={styles.backButtonText}>Encerrar caso</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>
          Sessão encerrada. Guarde o resumo e revise alarmes e gasometria após mudanças no ventilador.
        </Text>
      ) : null}
    </>
  );
}
