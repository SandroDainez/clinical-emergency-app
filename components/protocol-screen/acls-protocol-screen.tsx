import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ACLS_COPY } from "../../acls/microcopy";
import type { AclsMode, AuxiliaryPanel, ClinicalLogEntry, DocumentationAction, EncounterSummary, ProtocolState, ReversibleCause } from "../../clinical-engine";
import type { PersistedAclsCase } from "../../acls/case-history";
import type { AclsDebrief } from "../../acls/debrief";
import type { AclsScreenModel } from "../../acls/screen-model";
import type { ReversibleCauseAssessment } from "../../acls/reversible-cause-assistant";
import type { AclsAiInsight } from "../../lib/acls-ai";
import type {
  AclsVoiceCommandHint,
  AclsVoiceRuntimeStatus,
} from "../../acls/voice-runtime";
import AuxiliaryPanelCard from "./auxiliary-panel-card";
import AclsModeToggle from "./acls-mode-toggle";
import ClinicalLogCard from "./clinical-log-card";
import CaseHistoryCard from "./case-history-card";
import DebriefCard from "./debrief-card";
import ReversibleCausesCard from "./reversible-causes-card";
import AclsAiAssistantCard from "./acls-ai-assistant-card";
import StepHeaderBar from "./template/StepHeaderBar";
import DecisionGrid from "./template/DecisionGrid";
import VoiceStatusPanel from "./template/VoiceStatusPanel";
import FixedFooterAction from "./template/FixedFooterAction";
import { styles } from "./protocol-screen-styles";
import { formatOptionLabel } from "./protocol-screen-utils";
import { type VoiceConfirmation } from "./voice-command-card";
import HeroActionButton from "./template/HeroActionButton";
import VoiceDebugOverlay, { type VoiceDebugInfo } from "../voice-debug-overlay";

type AclsProtocolScreenProps = {
  aclsMode: AclsMode;
  actionButtonLabel: string;
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  clinicalLog: ClinicalLogEntry[];
  historyCases: PersistedAclsCase[];
  debrief: AclsDebrief | null;
  documentationActions: DocumentationAction[];
  encounterSummary: EncounterSummary;
  options: string[];
  voiceAvailable: boolean;
  voiceModeEnabled: boolean;
  voiceStatus: AclsVoiceRuntimeStatus;
  voiceTranscript: string;
  voiceFeedback: string;
  voiceCommandHints: AclsVoiceCommandHint[];
  voiceConfirmation: VoiceConfirmation | null;
  screenModel: AclsScreenModel;
  voiceDebugInfo?: VoiceDebugInfo;
  sepsisPanelMetrics: EncounterSummary["panelMetrics"];
  showClinicalLog: boolean;
  showHistory: boolean;
  showReversibleCauses: boolean;
  showDebrief: boolean;
  selectedHistoryCaseId: string | null;
  canGoBack: boolean;
  state: ProtocolState;
  suggestedNextStep: ProtocolState["suggestedNextStep"];
  reversibleCauses: ReversibleCause[];
  aiInsight: AclsAiInsight | null;
  aiStatus: "idle" | "loading" | "ready" | "error";
  aiErrorMessage?: string;
  reversibleCauseAssistantTopThree: ReversibleCauseAssessment[];
  reversibleCausesActionLabel: string;
  reversibleCausesHideLabel: string;
  reversibleCausesSectionTitle: string;
  supportsReversibleCauses: boolean;
  hidePrimaryActionButton: boolean;
  isCurrentStateTimerRunning: boolean;
  onModeChange: (mode: AclsMode) => void;
  onFieldChange: (fieldId: string, value: string) => void;
  onPresetApply: (fieldId: string, value: string) => void;
  onUnitChange: (fieldId: string, unit: string) => void;
  onActionRun: (actionId: string, requiresConfirmation?: boolean) => void;
  onStatusChange: (
    itemId: string,
    status: "pendente" | "solicitado" | "realizado",
    requiresConfirmation?: boolean
  ) => void;
  onDocumentationAction: (actionId: DocumentationAction["id"]) => void;
  onToggleVoiceMode: () => void;
  onToggleReversibleCauses: () => void;
  onToggleClinicalLog: () => void;
  onToggleHistory: () => void;
  onToggleDebrief: () => void;
  onCopyDebriefText: () => void;
  onOpenHistoryCase: (caseId: string) => void;
  onGoBack: () => void;
  onRouteBack?: () => void;
  onShowCurrentCase: () => void;
  onRegisterAdvancedAirway: () => void;
  onRefreshAi: () => void;
  onCauseNotesChange: (
    causeId: string,
    field: "evidence" | "actionsTaken" | "responseObserved",
    value: string
  ) => void;
  onCauseStatusChange: (causeId: string, status: "suspeita" | "abordada") => void;
  onExportSummary: () => void;
  onPrintReport: () => void;
  onConfirmAction: () => void;
  onRunTransition: (input?: string) => void;
  onAdvanceTrainingCycle: () => void;
};

function AclsProtocolScreen({
  aclsMode,
  actionButtonLabel,
  auxiliaryPanel,
  auxiliaryFieldSections,
  clinicalLog,
  historyCases,
  debrief,
  documentationActions,
  encounterSummary,
  options,
  voiceAvailable,
  voiceModeEnabled,
  voiceStatus,
  voiceTranscript,
  voiceFeedback,
  voiceCommandHints,
  voiceConfirmation,
  screenModel,
  voiceDebugInfo,
  sepsisPanelMetrics,
  showClinicalLog,
  showHistory,
  showReversibleCauses,
  showDebrief,
  selectedHistoryCaseId,
  canGoBack,
  state,
  suggestedNextStep,
  reversibleCauses,
  aiInsight,
  aiStatus,
  aiErrorMessage,
  reversibleCauseAssistantTopThree,
  reversibleCausesActionLabel,
  reversibleCausesHideLabel,
  reversibleCausesSectionTitle,
  supportsReversibleCauses,
  hidePrimaryActionButton,
  isCurrentStateTimerRunning,
  onModeChange,
  onFieldChange,
  onPresetApply,
  onUnitChange,
  onActionRun,
  onStatusChange,
  onDocumentationAction,
  onToggleVoiceMode,
  onToggleReversibleCauses,
  onToggleClinicalLog,
  onToggleHistory,
  onToggleDebrief,
  onCopyDebriefText,
  onOpenHistoryCase,
  onGoBack,
  onRouteBack,
  onShowCurrentCase,
  onRegisterAdvancedAirway,
  onRefreshAi,
  onCauseNotesChange,
  onCauseStatusChange,
  onExportSummary,
  onPrintReport,
  onConfirmAction,
  onRunTransition,
  onAdvanceTrainingCycle,
}: AclsProtocolScreenProps) {
  const [showRecords, setShowRecords] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const currentStateId = encounterSummary.currentStateId;
  const decisionOptions = options.map((option) => ({
    id: option,
    label: formatOptionLabel(option, currentStateId),
  }));
  const hasDecisionFlow = decisionOptions.length > 0;
  const heroContinuationLabel =
    !hasDecisionFlow &&
    suggestedNextStep?.label &&
    screenModel.clinicalIntent !== "perform_cpr" &&
    screenModel.clinicalIntent !== "end_protocol"
      ? formatOptionLabel(suggestedNextStep.label, currentStateId)
      : undefined;
  const suppressHeroForContinuousCpr =
    screenModel.clinicalIntent === "perform_cpr" && screenModel.showDocumentationActions;

  const heroCtaEnabled =
    Boolean(screenModel.primaryActionLabel) &&
    !isCurrentStateTimerRunning &&
    !suppressHeroForContinuousCpr &&
    !hasDecisionFlow;
  const topDocumentationActions =
    heroCtaEnabled && screenModel.showDocumentationActions
      ? documentationActions.filter((action) => action.id !== screenModel.primaryDocumentationActionId)
      : !heroCtaEnabled && screenModel.primaryActionType === "documentation" && screenModel.primaryDocumentationActionId
        ? documentationActions.filter((action) => action.id === screenModel.primaryDocumentationActionId)
        : screenModel.showDocumentationActions
          ? documentationActions
          : [];
  const secondaryDocumentationActions = topDocumentationActions.slice(0, 3);
  const registerableActions = [
    ...secondaryDocumentationActions.map((action) => ({
      id: action.id,
      label: action.label,
      type: "documentation" as const,
    })),
    ...(!encounterSummary.advancedAirwaySecured
      ? [{
          id: "advanced_airway",
          label: ACLS_COPY.operational.ui.registerAirway,
          type: "airway" as const,
        }]
      : []),
  ];
  const voiceStatusLabel =
    voiceStatus === "listening"
      ? ACLS_COPY.operational.labels.listening
      : voiceModeEnabled
        ? ACLS_COPY.operational.voice.active
        : voiceAvailable
          ? ACLS_COPY.operational.voice.inactive
          : ACLS_COPY.operational.labels.unavailable;
  const voiceNote =
    voiceFeedback ||
    (voiceTranscript
      ? ACLS_COPY.operational.labels.voiceCaptured
      : ACLS_COPY.operational.labels.waitingVoice);
  const compactVoiceCommands = voiceModeEnabled ? voiceCommandHints.slice(0, 3) : [];

  return (
    <View style={styles.screenWrapper}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StepHeaderBar
          protocolLabel={ACLS_COPY.operational.ui.protocol}
          onBack={selectedHistoryCaseId ? onShowCurrentCase : onGoBack}
        />
        <View style={styles.voiceTopRow}>
          {compactVoiceCommands.length > 0 ? (
            <View style={styles.voiceCompactCard}>
              <Text style={styles.voiceCompactTitle}>{ACLS_COPY.operational.sections.voice}</Text>
              <View style={styles.voiceCompactChips}>
                {compactVoiceCommands.map((hint) => (
                  <View key={hint.label} style={styles.voiceCompactChip}>
                    <Text style={styles.voiceCompactChipText}>{hint.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <Pressable
            onPress={onToggleVoiceMode}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: voiceModeEnabled ? "#0f766e" : "#93c5fd",
              backgroundColor: voiceModeEnabled ? "#ccfbf1" : "#eff6ff",
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: voiceModeEnabled ? "#115e59" : "#1d4ed8",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}>
              {voiceModeEnabled
                ? ACLS_COPY.operational.voice.active
                : ACLS_COPY.operational.voice.activate}
            </Text>
          </Pressable>
        </View>
        <HeroActionButton
          title={screenModel.primaryActionLabel ?? screenModel.title}
          detail={screenModel.bannerDetail ?? screenModel.details[0]}
          priority={screenModel.bannerPriority}
          continuationLabel={heroContinuationLabel}
          ctaLabel={
            heroCtaEnabled
              ? (screenModel.primaryActionCtaLabel ?? screenModel.primaryActionLabel ?? actionButtonLabel)
              : undefined
          }
          onPress={
            heroCtaEnabled
              ? () => {
                  if (
                    screenModel.primaryActionType === "documentation" &&
                    screenModel.primaryDocumentationActionId
                  ) {
                    onDocumentationAction(screenModel.primaryDocumentationActionId);
                    return;
                  }

                  onConfirmAction();
                }
              : undefined
          }
        />
        {screenModel.timerVisible && screenModel.timerRemaining !== undefined ? (
          <View style={styles.timerSection}>
            <View style={styles.timerBadge}>
              <Text style={styles.timerLabel}>
                {screenModel.timerLabel ?? ACLS_COPY.operational.ui.currentPhase}
              </Text>
              <Text style={styles.timerValue}>{screenModel.timerRemaining}s</Text>
            </View>
            {aclsMode === "training" ? (
              <Pressable style={styles.trainingAdvanceButton} onPress={onAdvanceTrainingCycle}>
                <Text style={styles.trainingAdvanceButtonText}>Treinamento: avançar ciclo</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {hasDecisionFlow ? (
          <View style={styles.compactSectionCard}>
            <Text style={styles.compactSectionTitle}>
              {screenModel.clinicalIntent === "analyze_rhythm"
                ? ACLS_COPY.operational.ui.chooseRhythm
                : ACLS_COPY.operational.labels.decide}
            </Text>
            <DecisionGrid options={decisionOptions} onSelect={onRunTransition} />
          </View>
        ) : null}
        <View style={styles.secondaryActionsFooter}>
          <Pressable style={styles.toolsToggleCard} onPress={() => setShowTools((current) => !current)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toolsToggleTitle}>{ACLS_COPY.operational.sections.tools}</Text>
              <Text style={styles.toolsToggleText}>
                {ACLS_COPY.operational.assistant.toolsNote}
              </Text>
            </View>
            <Text style={styles.toolsToggleAction}>
              {showTools ? ACLS_COPY.operational.ui.hide : ACLS_COPY.operational.ui.open}
            </Text>
          </Pressable>
        </View>
        {showTools ? (
          <View style={styles.toolsSectionCard}>
            {registerableActions.length > 0 ? (
              <View style={styles.recordsSectionCard}>
                <Pressable
                  style={styles.recordsToggle}
                  onPress={() => setShowRecords((current) => !current)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordsToggleTitle}>{ACLS_COPY.operational.ui.records}</Text>
                    <Text style={styles.recordsToggleText}>
                      {registerableActions.length} item{registerableActions.length > 1 ? "s" : ""} disponível
                    </Text>
                  </View>
                  <Text style={styles.recordsToggleAction}>
                    {showRecords ? ACLS_COPY.operational.ui.hide : ACLS_COPY.operational.ui.open}
                  </Text>
                </Pressable>
                {showRecords ? (
                  <View style={styles.recordsActionsList}>
                    {registerableActions.map((action) => (
                      <Pressable
                        key={action.id}
                        style={styles.recordsActionButton}
                        onPress={() => {
                          if (action.type === "airway") {
                            onRegisterAdvancedAirway();
                            return;
                          }

                          onDocumentationAction(action.id as DocumentationAction["id"]);
                        }}>
                        <Text style={styles.recordsActionButtonText}>{action.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
            <VoiceStatusPanel
              statusLabel={voiceStatusLabel}
              note={voiceNote}
              commands={voiceCommandHints.map((hint) => hint.label)}
              confirmation={voiceConfirmation}
              onToggleVoice={onToggleVoiceMode}
              voiceModeEnabled={voiceModeEnabled}
              showToggleButton={false}
            />
            <VoiceDebugOverlay info={voiceDebugInfo} />
            <AclsAiAssistantCard
              insight={aiInsight}
              status={aiStatus}
              errorMessage={aiErrorMessage}
              onRefresh={onRefreshAi}
            />
            <View style={styles.modeToggleWrapper}>
              <AclsModeToggle mode={aclsMode} onChange={onModeChange} />
            </View>
            {sepsisPanelMetrics && sepsisPanelMetrics.length > 0 ? (
              <View style={styles.sepsisPanelCard}>
                <Text style={styles.sepsisPanelTitle}>{ACLS_COPY.operational.ui.clinicalPanel}</Text>
                <View style={styles.sepsisPanelGrid}>
                  {sepsisPanelMetrics.map((metric) => (
                    <View key={metric.label} style={styles.sepsisMetricItem}>
                      <Text style={styles.sepsisMetricLabel}>{metric.label}</Text>
                      <Text style={styles.sepsisMetricValue}>{metric.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            {auxiliaryPanel ? (
              <AuxiliaryPanelCard
                auxiliaryPanel={auxiliaryPanel}
                fieldSections={auxiliaryFieldSections}
                onFieldChange={onFieldChange}
                onPresetApply={onPresetApply}
                onUnitChange={onUnitChange}
                onActionRun={onActionRun}
                onStatusChange={onStatusChange}
              />
            ) : null}
            <View style={styles.toolsButtonsGrid}>
              {supportsReversibleCauses ? (
                <Pressable style={styles.secondaryButton} onPress={onToggleReversibleCauses}>
                  <Text style={styles.secondaryButtonText}>{showReversibleCauses ? reversibleCausesHideLabel : reversibleCausesActionLabel}</Text>
                </Pressable>
              ) : null}
              <Pressable style={styles.secondaryButton} onPress={onToggleClinicalLog}>
                <Text style={styles.secondaryButtonText}>
                  {showClinicalLog
                    ? ACLS_COPY.operational.ui.hideClinicalLog
                    : ACLS_COPY.operational.ui.showClinicalLog}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={onToggleHistory}>
                <Text style={styles.secondaryButtonText}>
                  {showHistory
                    ? ACLS_COPY.operational.ui.hideHistory
                    : ACLS_COPY.operational.ui.showHistory}
                </Text>
              </Pressable>
              {debrief ? (
                <Pressable style={styles.secondaryButton} onPress={onToggleDebrief}>
                  <Text style={styles.secondaryButtonText}>
                    {showDebrief
                      ? ACLS_COPY.operational.ui.hideDebrief
                      : ACLS_COPY.operational.ui.showDebrief}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
        {showReversibleCauses ? (
          <ReversibleCausesCard
            assistantTopThree={reversibleCauseAssistantTopThree}
            causes={reversibleCauses}
            encounterSummary={encounterSummary}
            title={reversibleCausesSectionTitle}
            onNotesChange={onCauseNotesChange}
            onStatusChange={onCauseStatusChange}
          />
        ) : null}
        {showClinicalLog ? (
          <ClinicalLogCard clinicalLog={clinicalLog} encounterSummary={encounterSummary} onExport={onExportSummary} onPrint={onPrintReport} />
        ) : null}
        {showHistory ? (
          <CaseHistoryCard cases={historyCases} selectedCaseId={selectedHistoryCaseId} onOpenCase={onOpenHistoryCase} onShowCurrentCase={onShowCurrentCase} />
        ) : null}
        {showDebrief && debrief ? <DebriefCard debrief={debrief} onCopyText={onCopyDebriefText} /> : null}
      </ScrollView>
        <FixedFooterAction
        visible={false}
        onPress={onConfirmAction}
        label={screenModel.primaryActionCtaLabel ?? screenModel.primaryActionLabel ?? actionButtonLabel}
      />
    </View>
  );
}

export default AclsProtocolScreen;
