import { Pressable, ScrollView, Text, View } from "react-native";
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
import ProtocolHeaderCard from "./protocol-header-card";
import ReversibleCausesCard from "./reversible-causes-card";
import StepHeaderBar from "./template/StepHeaderBar";
import StepSummaryCard from "./template/StepSummaryCard";
import ActionChecklistCard from "./template/ActionChecklistCard";
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
  onShowCurrentCase: () => void;
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
  onShowCurrentCase,
  onRefreshAi,
  onCauseNotesChange,
  onCauseStatusChange,
  onExportSummary,
  onPrintReport,
  onConfirmAction,
  onRunTransition,
}: AclsProtocolScreenProps) {
  const showHeroAction = state.type === "action" && !isCurrentStateTimerRunning && !hidePrimaryActionButton;
  const topDocumentationActions = documentationActions;
  const stepProgressValue = state.type === "action" ? 0.78 : 0.42;
  const primaryChecklist = screenModel.details.slice(0, 3);
  const decisionOptions = options.map((option) => ({ id: option, label: formatOptionLabel(option) }));
  const voiceStatusLabel =
    voiceStatus === "listening"
      ? "Ouvindo"
      : voiceModeEnabled
        ? "Modo voz ativo"
        : voiceAvailable
          ? "Modo voz inativo"
          : "Indisponível";
  const voiceNote = voiceFeedback || (voiceTranscript ? "Transcrição capturada" : "Aguardando comando");

  return (
    <View style={styles.screenWrapper}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StepHeaderBar protocolLabel="ACLS · Adulto" onBack={onShowCurrentCase} />
        <ProtocolHeaderCard screenModel={screenModel} stateType={state.type} />
        <StepSummaryCard
          title={screenModel.title}
          instruction={screenModel.details[0] ?? state.text}
          nextStep={suggestedNextStep?.label}
          progress={stepProgressValue}
        />
        {decisionOptions.length > 0 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Decisão crítica agora</Text>
            <Text style={styles.summaryText}>Selecione o ritmo ou desfecho desta fase antes de seguir.</Text>
          </View>
        ) : null}
        {topDocumentationActions.length > 0 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Registre agora</Text>
            <Text style={styles.summaryText}>Choque, medicações e intubação ficam fixados aqui até serem confirmados.</Text>
          </View>
        ) : null}
        <HeroActionButton
          label={actionButtonLabel}
          onPress={onConfirmAction}
          visible={showHeroAction}
        />
        {topDocumentationActions.map((action) => (
          <HeroActionButton
            key={action.id}
            label={action.label}
            onPress={() => onDocumentationAction(action.id)}
            visible
          />
        ))}
        <ActionChecklistCard title="Ação imediata" items={primaryChecklist} />
        <DecisionGrid options={decisionOptions} onSelect={onRunTransition} />
        <VoiceStatusPanel
          statusLabel={voiceStatusLabel}
          note={voiceNote}
          commands={voiceCommandHints.map((hint) => hint.label)}
          confirmation={voiceConfirmation}
          onToggleVoice={onToggleVoiceMode}
          voiceModeEnabled={voiceModeEnabled}
        />
        <VoiceDebugOverlay info={voiceDebugInfo} />
        <View style={styles.modeToggleWrapper}>
          <AclsModeToggle mode={aclsMode} onChange={onModeChange} />
        </View>
        {sepsisPanelMetrics && sepsisPanelMetrics.length > 0 ? (
          <View style={styles.sepsisPanelCard}>
            <Text style={styles.sepsisPanelTitle}>Painel clínico</Text>
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
        <View style={styles.secondaryActionsFooter}>
          {supportsReversibleCauses ? (
            <Pressable style={styles.secondaryButton} onPress={onToggleReversibleCauses}>
              <Text style={styles.secondaryButtonText}>{showReversibleCauses ? reversibleCausesHideLabel : reversibleCausesActionLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.secondaryButton} onPress={onToggleClinicalLog}>
            <Text style={styles.secondaryButtonText}>{showClinicalLog ? "Ocultar log clínico" : "Ver log clínico"}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onToggleHistory}>
            <Text style={styles.secondaryButtonText}>{showHistory ? "Ocultar histórico" : "Ver histórico"}</Text>
          </Pressable>
          {debrief ? (
            <Pressable style={styles.secondaryButton} onPress={onToggleDebrief}>
              <Text style={styles.secondaryButtonText}>{showDebrief ? "Ocultar debrief" : "Ver debrief"}</Text>
            </Pressable>
          ) : null}
        </View>
        {showReversibleCauses ? (
          <ReversibleCausesCard
            aiInsight={aiInsight}
            aiStatus={aiStatus}
            aiErrorMessage={aiErrorMessage}
            assistantTopThree={reversibleCauseAssistantTopThree}
            causes={reversibleCauses}
            encounterSummary={encounterSummary}
            title={reversibleCausesSectionTitle}
            onRefreshAi={onRefreshAi}
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
        visible={!showHeroAction && state.type === "action" && !isCurrentStateTimerRunning && !hidePrimaryActionButton}
        onPress={onConfirmAction}
        label={actionButtonLabel}
      />
    </View>
  );
}

export default AclsProtocolScreen;
