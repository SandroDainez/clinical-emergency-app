import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ACLS_COPY } from "../../acls/microcopy";
import { getPhaseNote } from "../../acls/phase-notes";
import type { AuxiliaryPanel, ClinicalLogEntry, DocumentationAction, EncounterSummary, ProtocolState, ReversibleCause } from "../../clinical-engine";
import type { AclsMedicationTracker } from "../../acls/domain";
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
import ClinicalLogCard from "./clinical-log-card";
import CaseHistoryCard from "./case-history-card";
import DebriefCard from "./debrief-card";
import ReversibleCausesCard from "./reversible-causes-card";
import AclsAiAssistantCard from "./acls-ai-assistant-card";
import StepHeaderBar from "./template/StepHeaderBar";
import DecisionGrid from "./template/DecisionGrid";
import VoiceStatusPanel from "./template/VoiceStatusPanel";
import { styles } from "./protocol-screen-styles";
import { formatOptionLabel } from "./protocol-screen-utils";
import { type VoiceConfirmation } from "./voice-command-card";
import HeroActionButton from "./template/HeroActionButton";
import VoiceDebugOverlay, { type VoiceDebugInfo } from "../voice-debug-overlay";
import { getAppGuidelinesStatus, getModuleGuidelinesStatus } from "../../lib/guidelines-version";

type AclsProtocolScreenProps = {
  actionButtonLabel: string;
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  clinicalLog: ClinicalLogEntry[];
  historyCases: PersistedAclsCase[];
  debrief: AclsDebrief | null;
  documentationActions: DocumentationAction[];
  medicationSnapshot?: Record<"adrenaline" | "antiarrhythmic", AclsMedicationTracker>;
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
};

function AclsProtocolScreen({
  actionButtonLabel,
  auxiliaryPanel,
  auxiliaryFieldSections,
  clinicalLog,
  historyCases,
  debrief,
  documentationActions,
  medicationSnapshot,
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
  onShowCurrentCase,
  onRegisterAdvancedAirway,
  onRefreshAi,
  onCauseNotesChange,
  onCauseStatusChange,
  onExportSummary,
  onPrintReport,
  onConfirmAction,
  onRunTransition,
}: AclsProtocolScreenProps) {
  const [showRecords, setShowRecords] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showPhaseNote, setShowPhaseNote] = useState(false);
  const guidelinesStatus = getAppGuidelinesStatus();
  const moduleId = encounterSummary.protocolId === "pcr_adulto" ? "pcr_adulto" : "drogas_vasoativas";
  const moduleLabel = encounterSummary.protocolId === "pcr_adulto" ? "AHA ACLS" : "Drogas Vasoativas";
  const aclsModuleStatuses = getModuleGuidelinesStatus(moduleId);
  const aclsIsStale = aclsModuleStatuses.some((s) => s.isStale);
  const aclsIsNearStale = !aclsIsStale && aclsModuleStatuses.some((s) => s.statusLabel === "Revisar em breve");
  const aclsBadgeColor = aclsIsStale ? "red" : aclsIsNearStale ? "yellow" : "green";
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
  const isContinuousCprFocus = screenModel.clinicalIntent === "perform_cpr";
  const preferredDocumentationAction =
    documentationActions.find((action) => action.id === "adrenaline") ??
    documentationActions.find((action) => action.id === "antiarrhythmic");
  const heroDocumentationAction =
    isContinuousCprFocus
      ? undefined
      : preferredDocumentationAction ??
        (screenModel.primaryActionType === "documentation" && screenModel.primaryDocumentationActionId
          ? documentationActions.find(
              (action) => action.id === screenModel.primaryDocumentationActionId
            )
          : undefined);
  const heroDocumentationIsPendingConfirmation =
    heroDocumentationAction?.id === "adrenaline"
      ? medicationSnapshot?.adrenaline.pendingConfirmation &&
        medicationSnapshot?.adrenaline.status === "pending_confirmation"
      : heroDocumentationAction?.id === "antiarrhythmic"
        ? medicationSnapshot?.antiarrhythmic.pendingConfirmation &&
          medicationSnapshot?.antiarrhythmic.status === "pending_confirmation"
        : false;

  const heroCtaEnabled =
    Boolean(heroDocumentationAction || screenModel.primaryActionLabel) &&
    !isCurrentStateTimerRunning &&
    !suppressHeroForContinuousCpr &&
    !hasDecisionFlow;
  const topDocumentationActions =
    heroCtaEnabled && screenModel.showDocumentationActions
      ? documentationActions.filter((action) => action.id !== heroDocumentationAction?.id)
      : !heroCtaEnabled && screenModel.primaryActionType === "documentation" && screenModel.primaryDocumentationActionId
        ? documentationActions.filter((action) => action.id === screenModel.primaryDocumentationActionId)
        : screenModel.showDocumentationActions
          ? documentationActions
          : [];
  const secondaryDocumentationActions = topDocumentationActions.slice(0, 3);
  const inlineDocumentationActions = secondaryDocumentationActions;
  const urgentDocumentationAction =
    inlineDocumentationActions.find((action) => action.id === "adrenaline") ??
    inlineDocumentationActions.find((action) => action.id === "antiarrhythmic");
  const adrenalineTracker = medicationSnapshot?.adrenaline;
  const showFutureAdrenalineStatus =
    isContinuousCprFocus &&
    !inlineDocumentationActions.some((action) => action.id === "adrenaline") &&
    (adrenalineTracker?.administeredCount ?? 0) > 0 &&
    Boolean(screenModel.nextAdrenalineLabel);
  const cprPrimaryDocumentationAction =
    isContinuousCprFocus
      ? inlineDocumentationActions.find((action) => action.id === "adrenaline") ??
        inlineDocumentationActions.find((action) => action.id === "antiarrhythmic") ??
        inlineDocumentationActions[0]
      : undefined;
  const remainingInlineDocumentationActions = urgentDocumentationAction
    ? inlineDocumentationActions.filter((action) => action.id !== urgentDocumentationAction.id)
    : inlineDocumentationActions;
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

        {/* ── Guidelines version badge ─────────────────────── */}
        <View style={{
          flexDirection: "row", alignItems: "center", marginHorizontal: 12, marginBottom: 6,
          backgroundColor: aclsBadgeColor === "green" ? "#f0fdf4" : aclsBadgeColor === "yellow" ? "#fefce8" : "#fef2f2",
          borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
          borderWidth: 1,
          borderColor: aclsBadgeColor === "green" ? "#bbf7d0" : aclsBadgeColor === "yellow" ? "#fde68a" : "#fecaca",
          alignSelf: "flex-start",
        }}>
          <Text style={{
            fontSize: 10, fontWeight: "600",
            color: aclsBadgeColor === "green" ? "#166534" : aclsBadgeColor === "yellow" ? "#92400e" : "#991b1b",
          }}>
            {aclsBadgeColor === "green" ? "✓" : "⚠"}{" "}
            {moduleLabel} · v{guidelinesStatus.version} · {aclsIsStale ? "Desatualizado" : aclsIsNearStale ? "Revisar em breve" : "Atualizado"}
          </Text>
        </View>
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
            style={[
              styles.voiceQuickToggleButton,
              voiceModeEnabled && styles.voiceQuickToggleButtonActive,
            ]}>
            <Text
              style={[
                styles.voiceQuickToggleButtonText,
                voiceModeEnabled && styles.voiceQuickToggleButtonTextActive,
              ]}>
              {voiceModeEnabled
                ? ACLS_COPY.operational.voice.active
                : ACLS_COPY.operational.voice.activate}
            </Text>
          </Pressable>
        </View>
        <HeroActionButton
          title={
            heroDocumentationAction?.id === "adrenaline"
              ? heroDocumentationIsPendingConfirmation
                ? "Confirmar epinefrina"
                : "Dar epinefrina"
              : heroDocumentationAction?.id === "antiarrhythmic"
                ? heroDocumentationIsPendingConfirmation
                  ? "Confirmar antiarrítmico"
                  : "Dar antiarrítmico"
                : screenModel.primaryActionLabel ?? screenModel.title
          }
          detail={isContinuousCprFocus ? undefined : screenModel.bannerDetail ?? screenModel.details[0]}
          priority={screenModel.bannerPriority}
          continuationLabel={isContinuousCprFocus ? undefined : heroContinuationLabel}
          ctaLabel={
            heroCtaEnabled
              ? heroDocumentationAction?.id === "adrenaline"
                ? heroDocumentationIsPendingConfirmation
                  ? "Confirmar dose aplicada"
                  : "Administrar agora"
                : heroDocumentationAction?.id === "antiarrhythmic"
                  ? heroDocumentationIsPendingConfirmation
                    ? "Confirmar dose aplicada"
                    : "Administrar agora"
                  : (screenModel.primaryActionCtaLabel ?? screenModel.primaryActionLabel ?? actionButtonLabel)
              : undefined
          }
          onPress={
            heroCtaEnabled
              ? () => {
                  if (heroDocumentationAction?.id) {
                    onDocumentationAction(heroDocumentationAction.id);
                    return;
                  }

                  onConfirmAction();
                }
              : undefined
          }
        />
        {(() => {
          const note = getPhaseNote(currentStateId);
          if (!note) return null;
          return (
            <Pressable
              onPress={() => setShowPhaseNote((v) => !v)}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#dbe4ea",
                backgroundColor: "#f8fafc",
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 8,
              }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#0ea5e9" }} />
                  <Text style={{ fontSize: 12, fontWeight: "800", color: "#0369a1", textTransform: "uppercase", letterSpacing: 0.5, flex: 1 }}>
                    {note.heading}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, marginLeft: 8 }}>
                  {showPhaseNote ? "Ocultar" : "Ver orientação"}
                </Text>
              </View>
              {showPhaseNote ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 14, lineHeight: 21, color: "#1e3a5f", fontWeight: "500" }}>
                    {note.body}
                  </Text>
                  {note.source ? (
                    <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "600" }}>
                      Referência: {note.source}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          );
        })()}
        {screenModel.timerVisible && screenModel.timerRemaining !== undefined ? (
          <View style={styles.timerSection}>
            <View style={styles.timerBadge}>
              <Text style={styles.timerLabel}>
                {screenModel.timerLabel ?? ACLS_COPY.operational.ui.currentPhase}
              </Text>
              <Text style={styles.timerValue}>{screenModel.timerRemaining}s</Text>
            </View>
          </View>
        ) : null}
        {screenModel.prolongedResuscitationNote ? (
          <View style={styles.prolongedResuscitationCard}>
            <Text style={styles.prolongedResuscitationTitle}>Reanimação prolongada</Text>
            <Text style={styles.prolongedResuscitationText}>
              {screenModel.prolongedResuscitationNote}
            </Text>
          </View>
        ) : null}
        {isContinuousCprFocus && cprPrimaryDocumentationAction ? (
          <View style={styles.compactSectionCard}>
            <Text style={styles.compactSectionTitle}>{ACLS_COPY.operational.sections.pending}</Text>
            <View style={styles.inlineDocumentationActions}>
              <Pressable
                style={styles.inlineDocumentationButton}
                onPress={() => onDocumentationAction(cprPrimaryDocumentationAction.id)}>
                <Text style={styles.inlineDocumentationButtonText}>
                  {cprPrimaryDocumentationAction.id === "adrenaline"
                    ? medicationSnapshot?.adrenaline.pendingConfirmation &&
                      medicationSnapshot?.adrenaline.status === "pending_confirmation"
                      ? "Confirmar epinefrina"
                      : "Dar epinefrina"
                    : cprPrimaryDocumentationAction.id === "antiarrhythmic"
                      ? medicationSnapshot?.antiarrhythmic.pendingConfirmation &&
                        medicationSnapshot?.antiarrhythmic.status === "pending_confirmation"
                        ? "Confirmar antiarrítmico"
                        : "Dar antiarrítmico"
                      : cprPrimaryDocumentationAction.label}
                </Text>
              </Pressable>
            </View>
            {remainingInlineDocumentationActions.length > 0 ? (
              <Text style={styles.inlineDocumentationHint}>Outras pendências em Ferramentas.</Text>
            ) : null}
            {screenModel.adrenalineStatusLabel ? (
              <Text style={styles.inlineDocumentationHint}>
                {screenModel.adrenalineStatusLabel}
              </Text>
            ) : screenModel.nextAdrenalineLabel ? (
              <Text style={styles.inlineDocumentationHint}>
                {ACLS_COPY.operational.ui.epinephrineIn} {screenModel.nextAdrenalineLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
        {showFutureAdrenalineStatus ? (
          <View style={styles.compactSectionCard}>
            <Text style={styles.compactSectionTitle}>Epinefrina</Text>
            <Text style={styles.inlineDocumentationButtonText}>Dose administrada</Text>
            <Text style={styles.inlineDocumentationHint}>
              {screenModel.adrenalineStatusLabel ??
                `${ACLS_COPY.operational.ui.epinephrineIn} ${screenModel.nextAdrenalineLabel}`}
            </Text>
          </View>
        ) : null}
        {remainingInlineDocumentationActions.length > 0 && !isContinuousCprFocus ? (
          <View style={styles.compactSectionCard}>
            <Text style={styles.compactSectionTitle}>{ACLS_COPY.operational.sections.pending}</Text>
            <View style={styles.inlineDocumentationPassiveList}>
              {remainingInlineDocumentationActions.map((action) => (
                <View key={action.id} style={styles.inlineDocumentationPassiveItem}>
                  <Text style={styles.inlineDocumentationPassiveText}>{action.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.inlineDocumentationHint}>Registrar em Ferramentas.</Text>
            {screenModel.adrenalineStatusLabel ? (
              <Text style={styles.inlineDocumentationHint}>
                {screenModel.adrenalineStatusLabel}
              </Text>
            ) : screenModel.nextAdrenalineLabel ? (
              <Text style={styles.inlineDocumentationHint}>
                {ACLS_COPY.operational.ui.epinephrineIn} {screenModel.nextAdrenalineLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
        {hasDecisionFlow ? (
          <View style={styles.compactSectionCard}>
            <Text style={styles.compactSectionTitle}>
              {currentStateId === "checar_respiracao_pulso"
                ? "Escolha respiração e pulso"
                : screenModel.clinicalIntent === "analyze_rhythm"
                ? ACLS_COPY.operational.ui.chooseRhythm
                : ACLS_COPY.operational.labels.decide}
            </Text>
            <DecisionGrid
              options={decisionOptions}
              onSelect={onRunTransition}
              title={
                currentStateId === "checar_respiracao_pulso"
                  ? "Toque para definir respiração e pulso"
                  : undefined
              }
            />
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
            <View style={styles.toolsSectionHeader}>
              <Text style={styles.toolsSectionEyebrow}>Apoio</Text>
              <Text style={styles.toolsSectionTitle}>Ferramentas do caso</Text>
            </View>
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
    </View>
  );
}

export default AclsProtocolScreen;
