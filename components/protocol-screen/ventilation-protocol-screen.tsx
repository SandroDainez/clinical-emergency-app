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
import { formatOptionLabel, getOptionSublabel } from "./protocol-screen-utils";
import { ProtocolStepHeader } from "./template/ProtocolStepHeader";
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#0f172a",
            borderColor: "#1e3a5f",
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
          }}>
          <Text style={{ fontSize: 9, fontWeight: "800", color: "#3b82f6", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>
            CASO ATUAL
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#e2e8f0" }} numberOfLines={1}>
            {currentCaseLabel}
          </Text>
        </View>
        <Pressable
          style={{
            backgroundColor: "#1e293b",
            borderWidth: 1,
            borderColor: "#7f1d1d",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
          onPress={() => {
            onActionRun("start_new_vent_case");
            setActiveTab(0);
          }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#f87171" }}>Novo caso</Text>
        </Pressable>
      </View>
      <ProtocolStepHeader
        module={{ label: "VM", accentColor: "#0891b2", guidelinesLabel: "ARDSnet · PADIS 2018" }}
        state={state}
        guidelinesStatus={guidelinesStatus}
        metrics={visibleAuxiliaryPanel?.metrics}
      />

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
