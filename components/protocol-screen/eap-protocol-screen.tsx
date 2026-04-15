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

type EapProtocolScreenProps = {
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

export default function EapProtocolScreen({
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
}: EapProtocolScreenProps) {
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

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((t) => t + 1);
    } else {
      onConfirmAction();
    }
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
            {guidelinesStatus.overallColor === "green" ? "✓" : "⚠"} AHA/ESC EAP · Revisado {formatReviewDate(guidelinesStatus.lastFullReview)} · {guidelinesStatus.overallStatus}
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
              {state.phaseLabel} — {state.text}
            </Text>
          </View>
        ) : null}
        <View style={styles.sepsisTopBarInfo}>
          <Text style={styles.sepsisTopBarStep} numberOfLines={2}>
            {state.text}
          </Text>
          {state.details?.[0] ? (
            <Text style={styles.sepsisTopBarHint} numberOfLines={2}>
              {state.details[0]}
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
          moduleMode="eap"
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

      {!isQuestion && !isEnd && !isCurrentStateTimerRunning && isLastTab ? (
        <View style={styles.primaryActions}>
          <Pressable style={styles.primaryButton} onPress={handleNextStep}>
            <Text style={styles.primaryButtonText}>Finalizar</Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>Episódio registrado. Reavaliar resposta ao tratamento se necessário.</Text>
      ) : null}
    </>
  );
}
