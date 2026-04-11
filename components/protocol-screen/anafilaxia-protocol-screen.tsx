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
import { formatOptionLabel } from "./protocol-screen-utils";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { ANAFILAXIA_TABS } from "./anafilaxia-tab-config";

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
  const [activeTab, setActiveTab] = useState(0);
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabMeta = ANAFILAXIA_TABS[activeTab];
  const nextTabLabel = ANAFILAXIA_TABS[activeTab + 1]?.label;

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
            {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"} Diretrizes v{guidelinesStatus.version} ·{" "}
            {guidelinesStatus.overallStatus}
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
        <View style={styles.actions}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
          ) : null}
          {options.map((option) => (
            <Pressable key={option} style={styles.optionButton} onPress={() => onRunTransition(option)}>
              <Text style={styles.optionButtonText}>{formatOptionLabel(option)}</Text>
            </Pressable>
          ))}
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
