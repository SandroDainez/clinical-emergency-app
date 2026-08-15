import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { METAS_POR_ESTADO_POS_ROSC } from "../../lib/metas-pos-parada";
import { FV_FINA_NA_CHECAGEM_DE_RITMO } from "../../lib/fv-fina";
import { ADRENALINA_NA_PARADA_APRESENTACAO } from "../../lib/adrenalina-na-parada";
import { useRouter, type Href } from "expo-router";
import {getCopy } from "../../acls/microcopy";
import { Header, Tag, TrackingPanel, type ItemDeAcompanhamento } from "../ui-v2";
import { useUiV2Enabled } from "../../lib/ui-v2-flag";
import { getPhaseNote } from "../../acls/phase-notes";
import type { AuxiliaryPanel, ClinicalLogEntry, DocumentationAction, EncounterSummary, ProtocolState, ReversibleCause } from "../../clinical-engine";
import type { AclsMedicationTracker } from "../../acls/domain";
import type { PersistedAclsCase } from "../../acls/case-history";
import type { AclsDebrief } from "../../acls/debrief";
import type { AclsScreenModel } from "../../acls/screen-model";
import type { ReversibleCauseAssessment } from "../../acls/reversible-cause-assistant";
import type {
  AclsVoiceCommandHint,
  AclsVoiceRuntimeStatus,
} from "../../acls/voice-runtime";
import AuxiliaryPanelCard from "./auxiliary-panel-card";
import ClinicalLogCard from "./clinical-log-card";
import CaseHistoryCard from "./case-history-card";
import DebriefCard from "./debrief-card";
import ReversibleCausesCard from "./reversible-causes-card";
import StepHeaderBar from "./template/StepHeaderBar";
import DecisionGrid from "./template/DecisionGrid";
import VoiceStatusPanel from "./template/VoiceStatusPanel";
import { styles } from "./protocol-screen-styles";
import { formatOptionLabel, getOptionSublabel } from "./protocol-screen-utils";
import { ModuleFlowHero } from "./module-flow-shell";
import { type VoiceConfirmation } from "./voice-command-card";
import HeroActionButton from "./template/HeroActionButton";
import CprGuidanceCard from "./cpr-guidance-card";
import { useScreenWakeLock } from "../use-screen-wake-lock";
import VoiceDebugOverlay, { type VoiceDebugInfo } from "../voice-debug-overlay";
import { fetchRemoteMetadata, getAppGuidelinesStatus, getModuleGuidelinesStatus, type AppGuidelinesStatus } from "../../lib/guidelines-version";
import { markProtocolSessionForResume } from "../../lib/module-session-navigation";
import { useTr } from "../../lib/use-tr";

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
  /** Sai do módulo diretamente, sem passar pelo engine.canGoBack */
  onExitModule: () => void;
  onShowCurrentCase: () => void;
  onRegisterAdvancedAirway: () => void;
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
  onExitModule,
  onShowCurrentCase,
  onRegisterAdvancedAirway,
  onCauseNotesChange,
  onCauseStatusChange,
  onExportSummary,
  onPrintReport,
  onConfirmAction,
  onRunTransition,
}: AclsProtocolScreenProps) {
  const tr = useTr();
  const ACLS_COPY = getCopy();
  const { width } = useWindowDimensions();
  const mobileHeroCompact = width < 560;
  // Mantém a tela acordada durante toda a reanimação (não apaga/bloqueia sozinha).
  useScreenWakeLock(true);
  const [showRecords, setShowRecords] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showPhaseNote, setShowPhaseNote] = useState(false);
  const [showRefModules, setShowRefModules] = useState(false);
  const router = useRouter();

  const ACLS_REF_MODULES: { route: Href; icon: string; label: string; sublabel: string }[] = [
    { route: "/modulos/ritmos-acls?from_module=pcr-adulto" as Href,           icon: "〜", label: tr("Ritmos de Parada"), sublabel: tr("FV · TV · AESP · Assistolia") },
    { route: "/modulos/farmacologia-acls?from_module=pcr-adulto" as Href,     icon: "Rx", label: tr("Farmacologia"),  sublabel: tr("Epinefrina · Amiodarona · +3") },
    { route: "/modulos/bradicardia-acls?from_module=pcr-adulto" as Href,      icon: "↓",  label: tr("Bradicardia"),   sublabel: tr("Instável · Atropina · MP-TC") },
    { route: "/modulos/taquicardia-acls?from_module=pcr-adulto" as Href,      icon: "↑",  label: tr("Taquicardia"),   sublabel: tr("Estável vs instável · CV") },
    { route: "/modulos/causas-reversiveis-acls?from_module=pcr-adulto" as Href, icon: "HT", label: tr("Hs e Ts"),     sublabel: tr("5H e 5T reversíveis") },
    { route: "/modulos/pcr-gestacao-acls?from_module=pcr-adulto" as Href,     icon: "OB", label: tr("PCR na Gestação"), sublabel: tr("Deslocamento uterino · 5 min") },
    { route: "/modulos/ovace-adulto?from_module=pcr-adulto" as Href,           icon: "VA", label: tr("Engasgo (OVACE)"), sublabel: tr("Golpes nas costas · 5+5") },
    { route: "/modulos/pos-pcr-acls?from_module=pcr-adulto" as Href,          icon: "✓",  label: tr("Pós-PCR"),       sublabel: tr("ROSC · Metas · Neurologia") },
  ];
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  const moduleId = encounterSummary.protocolId === "pcr_adulto" ? "pcr_adulto" : "drogas_vasoativas";
  const moduleLabel = encounterSummary.protocolId === "pcr_adulto" ? "AHA ACLS" : tr("Drogas Vasoativas");
  const aclsModuleStatuses = getModuleGuidelinesStatus(moduleId);
  const aclsIsStale = aclsModuleStatuses.some((s) => s.isStale);
  const aclsIsNearStale = !aclsIsStale && aclsModuleStatuses.some((s) => s.statusLabel === "Revisar em breve");
  const aclsBadgeColor = aclsIsStale ? "red" : aclsIsNearStale ? "yellow" : "green";
  const aclsLastReviewed = aclsModuleStatuses[0]?.guideline.last_reviewed ?? guidelinesStatus.lastFullReview;
  const aclsLastReviewedFormatted = aclsLastReviewed.split("-").reverse().join("/");
  const currentStateId = encounterSummary.currentStateId;
  const decisionOptions = options.map((option) => {
    const sub = getOptionSublabel(option, currentStateId);
    return {
      id: option,
      label: tr(formatOptionLabel(option, currentStateId)),
      sublabel: sub ? tr(sub) : sub,
    };
  });
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

  // Allow CTA for medication/documentation actions even when CPR timer is running.
  // This is the key fix: during a 2-min CPR cycle, if epinephrine or another
  // medication becomes due the user MUST be able to register it immediately —
  // blocking the CTA behind !isCurrentStateTimerRunning hid the button entirely.
  const isMedicationDocumentationAction = Boolean(heroDocumentationAction);
  const heroCtaEnabled =
    Boolean(heroDocumentationAction || screenModel.primaryActionLabel) &&
    (!isCurrentStateTimerRunning || isMedicationDocumentationAction) &&
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
  // Contador da próxima epinefrina.
  //
  // Antes exigia `isContinuousCprFocus`, e por isso SUMIA durante a checagem de
  // ritmo, o choque e o 1º ciclo pós-choque — enquanto o relógio continuava
  // correndo. Era o defeito reportado: "em alguns ciclos não aparece o card com
  // próxima dose de adrenalina".
  //
  // Exibir o contador é diferente de RECOMENDAR a droga: quando administrar
  // continua decidido pelo engine (canRemindAdrenaline), que segue intocado.
  // Aqui é só mostrar quanto falta, e isso vale em qualquer momento da parada.
  const showFutureAdrenalineStatus =
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
  const heroMetrics = [
    { label: tr("Estado atual"), value: tr(encounterSummary.currentStateText) },
    { label: tr("Choques"), value: String(encounterSummary.shockCount) },
    {
      label: tr("Epinefrina"),
      value: `${encounterSummary.adrenalineAdministeredCount} ${encounterSummary.adrenalineAdministeredCount === 1 ? tr("dose") : tr("doses")}`,
    },
    {
      label: tr("Antiarrítmico"),
      value:
        encounterSummary.antiarrhythmicAdministeredCount > 0
          ? `${encounterSummary.antiarrhythmicAdministeredCount} ${encounterSummary.antiarrhythmicAdministeredCount === 1 ? tr("dose") : tr("doses")}${encounterSummary.antiarrhythmicAdministeredCount === 1 ? " (300 mg)" : " (300+150)"}`
          : tr("Não administrado"),
    },
    {
      label: tr("Via aérea"),
      value: encounterSummary.advancedAirwaySecured ? tr("Avançada registrada") : tr("Não registrada"),
    },
  ];
  // ── Painel de acompanhamento em grid (Fase 5) ───────────────────────────────
  //
  // Mesmas informações do `heroMetrics` acima, mesma fonte de dados. O que muda é
  // a apresentação: grade com valor grande em vez de faixa de chips.
  //
  // O tom semântico vem de sinal que o ENGINE JÁ CALCULA — `suggestedCount >
  // administeredCount` significa que ele próprio já indicou a dose. Nenhum limiar
  // clínico é inventado aqui: isso seria decisão, e decisão não pertence à
  // camada de apresentação.
  const painelEmV2 = useUiV2Enabled("pcr-adulto");

  const adrenalinaPendente =
    encounterSummary.adrenalineSuggestedCount > encounterSummary.adrenalineAdministeredCount;
  const antiarritmicoPendente =
    encounterSummary.antiarrhythmicSuggestedCount > encounterSummary.antiarrhythmicAdministeredCount;

  // `resumo` marca o que aparece na faixa FECHADA. Só choques e epinefrina:
  // são os dois contadores que se olha de relance durante a parada, e cabem numa
  // linha ao lado do cronômetro. O estado atual ficou de fora de propósito — o
  // botão de ação logo abaixo já diz a mesma coisa, em corpo maior; repetir aqui
  // era gastar altura duas vezes com a mesma informação. Via aérea e
  // antiarrítmico são consulta, não decisão de relance, e abrem no toque.
  const itensDoPainel: ItemDeAcompanhamento[] = [
    { rotulo: heroMetrics[0].label, valor: heroMetrics[0].value, largura: "cheia" },
    {
      rotulo: heroMetrics[1].label,
      valor: heroMetrics[1].value,
      resumo: true,
      // Formas curtas para a faixa: com os rótulos longos, uma tela de 390 px
      // truncava "CHOQUES" em "CHO…" e "0 doses" em "0 d…".
      resumoRotulo: "CHOQ",
    },
    {
      rotulo: heroMetrics[2].label,
      valor: heroMetrics[2].value,
      tom: adrenalinaPendente ? "warning" : undefined,
      resumo: true,
      resumoRotulo: "EPI",
      // "0 doses" → "0". A unidade está no rótulo; repetir custa a largura que
      // faltava.
      resumoValor: String(medicationSnapshot?.adrenaline.administeredCount ?? 0),
    },
    {
      rotulo: heroMetrics[3].label,
      valor: heroMetrics[3].value,
      tom: antiarritmicoPendente ? "warning" : undefined,
    },
    { rotulo: heroMetrics[4].label, valor: heroMetrics[4].value, largura: "cheia" },
  ];

  // Compacto (mobile): estado + as condutas já realizadas, para o resumo ser completo.
  const displayedHeroMetrics = mobileHeroCompact
    ? [
        heroMetrics[0], // estado
        heroMetrics[1], // choques
        heroMetrics[2], // epinefrina
        heroMetrics[3], // antiarrítmico
        heroMetrics[4], // via aérea
      ]
    : heroMetrics;

  return (
    <View style={styles.screenWrapper}>
      {/* Cabeçalho compacto (Fase 6). Medição que motivou: com as três camadas
          antigas — cromado 61 px + StepHeaderBar 60 px + hero 140 px — o botão de
          ação principal começava em 832 px numa tela de 839 px. Numa parada, a
          ação primária ficava abaixo da dobra e exigia rolagem.

          O voltar é a MESMA função do StepHeaderBar, incluindo o desvio para
          `onShowCurrentCase` quando há caso histórico aberto. */}
      {painelEmV2 ? (
        <Header
          titulo={tr(ACLS_COPY.operational.ui.protocol)}
          etapa={tr(screenModel.title)}
          onVoltar={selectedHistoryCaseId ? onShowCurrentCase : onGoBack}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {painelEmV2 ? null : (
        <StepHeaderBar
          protocolLabel={ACLS_COPY.operational.ui.protocol}
          onBack={selectedHistoryCaseId ? onShowCurrentCase : onGoBack}
        />
        )}

        {/* O selo de atualização das diretrizes é informação clínica e não pode
            sair com o hero — vira etiqueta no topo do conteúdo. */}
        {painelEmV2 ? (
          <Tag
            label={`${aclsBadgeColor === "green" ? tr("Atualizado") : aclsIsNearStale ? tr("Revisar em breve") : tr("Desatualizado")} · ${tr("Revisado")} ${aclsLastReviewedFormatted}`}
          />
        ) : null}

        {painelEmV2 ? null : (
        <ModuleFlowHero
          eyebrow={moduleLabel}
          title={mobileHeroCompact ? tr("ACLS para decisão e registro") : tr("ACLS organizado para decisão, documentação e debrief")}

          badgeText={`${aclsBadgeColor === "green" ? tr("Atualizado") : aclsIsNearStale ? tr("Revisar em breve") : tr("Desatualizado")} · ${tr("Revisado")} ${aclsLastReviewedFormatted}`}
          // Com o painel novo ligado, a faixa de métricas do hero sai de cena para
          // as informações não aparecerem duas vezes.
          metrics={painelEmV2 ? [] : displayedHeroMetrics}
          progressLabel={encounterSummary.durationLabel}
          stepTitle={tr(screenModel.title)}
          hint={screenModel.details[0] ? tr(screenModel.details[0]) : undefined}
          compactMobile
        />
        )}
        {/* Contador da próxima epinefrina — ACIMA do conteúdo, logo após o painel.
            Estava no fim da tela, abaixo do card de conduta: durante a parada é
            um dos números mais consultados e exigia rolar para vê-lo. */}
        {showFutureAdrenalineStatus ? (
          <View style={aclsScreenStyles.epiCountdownCard}>
            <View style={aclsScreenStyles.epiCountdownLeft}>
              <Text style={aclsScreenStyles.epiCountdownEyebrow}>{tr("PRÓXIMA EPINEFRINA")}</Text>
              <Text style={aclsScreenStyles.epiCountdownTitle}>
                {screenModel.adrenalineStatusLabel ? tr("Epinefrina atrasada!") : tr("Próxima dose programada")}
              </Text>
              <Text style={aclsScreenStyles.epiCountdownNote}>
                {tr("Dose")} {(encounterSummary.adrenalineAdministeredCount ?? 0) + 1} · 1 mg IV/IO
              </Text>
              {/* R-48: a apresentação pertence à superfície de AÇÃO. Ela vivia
                  só no campo `source` do card da Farmacologia. */}
              <Text style={aclsScreenStyles.epiCountdownNote}>
                {tr(ADRENALINA_NA_PARADA_APRESENTACAO)}
              </Text>
            </View>
            <View style={[
              aclsScreenStyles.epiCountdownBadge,
              screenModel.adrenalineStatusLabel && aclsScreenStyles.epiCountdownBadgeLate,
            ]}>
              <Text style={aclsScreenStyles.epiCountdownValue}>
                {screenModel.adrenalineStatusLabel ? "!" : (screenModel.nextAdrenalineLabel ?? "—")}
              </Text>
              {!screenModel.adrenalineStatusLabel && (
                <Text style={aclsScreenStyles.epiCountdownUnit}>{tr("seg")}</Text>
              )}
            </View>
          </View>
        ) : null}
        {painelEmV2 ? (
          <TrackingPanel
            tempo={{ rotulo: tr("Tempo de parada"), valor: encounterSummary.durationLabel }}
            itens={itensDoPainel}
            testID="painel-acompanhamento-v2"
          />
        ) : null}
        <View style={styles.voiceTopRow}>
          {compactVoiceCommands.length > 0 ? (
            <View style={styles.voiceCompactCard}>
              <Text style={styles.voiceCompactTitle}>{ACLS_COPY.operational.sections.voice}</Text>
              <View style={styles.voiceCompactChips}>
                {compactVoiceCommands.map((hint) => (
                  <View key={hint.label} style={styles.voiceCompactChip}>
                    <Text style={styles.voiceCompactChipText}>{tr(hint.label)}</Text>
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
              ? (() => {
                  const doseNum = (medicationSnapshot?.adrenaline.administeredCount ?? 0) + 1;
                  return heroDocumentationIsPendingConfirmation
                    ? `Confirmar epinefrina — ${doseNum}ª dose`
                    : `Epinefrina — ${doseNum}ª dose (1 mg IV/IO)`;
                })()
              : heroDocumentationAction?.id === "antiarrhythmic"
                ? (() => {
                    const antCount = medicationSnapshot?.antiarrhythmic.administeredCount ?? 0;
                    return heroDocumentationIsPendingConfirmation
                      ? antCount >= 1
                        ? tr("Confirmar antiarrítmico — 2ª dose (150 mg)")
                        : tr("Confirmar antiarrítmico — 1ª dose (300 mg)")
                      : antCount >= 1
                        ? tr("Antiarrítmico — 2ª dose (150 mg IV/IO)")
                        : tr("Antiarrítmico — 1ª dose (300 mg IV/IO)");
                  })()
                : // ⚠️ R-53 — SE HÁ AÇÃO DE DOCUMENTAÇÃO, O RÓTULO VEM DELA.
                  //
                  // Este era o ponto exato do defeito: o `onPress` executa
                  // `heroDocumentationAction.id`, e o título caía para
                  // `primaryActionLabel` — outra fonte, com outra cadeia de
                  // fallback. Enquanto o handler dizia `rearrest`, o rótulo
                  // dizia "Cuidar ROSC".
                  //
                  // Excluir `rearrest` do fallback corrigiu O CASO; isto
                  // corrige a CLASSE: qualquer ação de documentação que chegue
                  // aqui (via aérea, antibiótico, volume) nomeia a si mesma.
                  // Rótulo e handler passam a ter uma fonte só, por construção.
                  heroDocumentationAction
                  ? tr(heroDocumentationAction.label)
                  : screenModel.primaryActionLabel ?? screenModel.title
          }
          // ⚠️ R-48/R-50 — A APRESENTAÇÃO ENTRA NO BOTÃO QUE OFERECE A DOSE.
          //
          // Eu a tinha posto em dois lugares que NÃO são este: o card "PRÓXIMA
          // EPINEFRINA" (que exige `administeredCount > 0`, ou seja, só depois
          // da 1ª dose) e o `ctaDetail` do foco contínuo de RCP (outro caminho
          // de render). Verificação por execução mostrou que nenhum dos dois
          // aparecia no momento em que o app OFERECE a primeira dose — que é
          // exatamente quando alguém aspira a ampola.
          detail={
            heroDocumentationAction?.id === "adrenaline"
              ? tr(ADRENALINA_NA_PARADA_APRESENTACAO)
              : isContinuousCprFocus
                ? undefined
                : screenModel.bannerDetail ?? screenModel.details[0]
          }
          priority={screenModel.bannerPriority}
          continuationLabel={isContinuousCprFocus ? undefined : heroContinuationLabel}
          ctaLabel={
            heroCtaEnabled
              ? heroDocumentationAction?.id === "adrenaline"
                ? heroDocumentationIsPendingConfirmation
                  ? tr("Confirmar dose aplicada")
                  : tr("Administrar agora")
                : heroDocumentationAction?.id === "antiarrhythmic"
                  ? heroDocumentationIsPendingConfirmation
                    ? tr("Confirmar dose aplicada")
                    : tr("Administrar agora")
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
        {documentationActions.some((a) => a.id === "rearrest") ? (
          <Pressable
            // A confirmação saiu daqui e foi para o PONTO DE ENTRADA da ação
            // (registerDocumentationAction, em protocol-screen.tsx). Aqui ela
            // protegia UM caminho; lá protege todos — inclusive o comando de
            // voz e o botão herói, que a contornavam. R-53.
            onPress={() => onDocumentationAction("rearrest")}
            style={({ pressed }) => ({
              marginTop: 6,
              borderRadius: 12,
              backgroundColor: pressed ? "rgba(248,113,113,0.14)" : "transparent",
              borderWidth: 1,
              borderColor: "#7f1d1d",
              paddingVertical: 9,
              paddingHorizontal: 14,
              alignItems: "center",
              alignSelf: "center",
            })}>
            <Text style={{ fontSize: 12.5, fontWeight: "700", color: "#fca5a5" }}>
              ↺ {tr("Perdeu o pulso — reiniciar RCP")}
            </Text>
          </Pressable>
        ) : null}
        {screenModel.timerVisible && screenModel.timerRemaining !== undefined ? (
          <View style={styles.timerSection}>
            <View style={[styles.timerBadge, aclsScreenStyles.timerBadgeEnhanced]}>
              <View style={aclsScreenStyles.timerTopRow}>
                <Text style={styles.timerLabel}>
                  {screenModel.timerLabel ? tr(screenModel.timerLabel) : ACLS_COPY.operational.ui.currentPhase}
                </Text>
                {/* Context chips: choques e epinefrina administrados */}
                <View style={aclsScreenStyles.timerContextChips}>
                  {encounterSummary.shockCount > 0 ? (
                    <View style={aclsScreenStyles.timerChip}>
                      <Text style={aclsScreenStyles.timerChipText}>⚡ {encounterSummary.shockCount}</Text>
                    </View>
                  ) : null}
                  {(encounterSummary.adrenalineAdministeredCount ?? 0) > 0 ? (
                    <View style={[aclsScreenStyles.timerChip, aclsScreenStyles.timerChipOrange]}>
                      <Text style={[aclsScreenStyles.timerChipText, aclsScreenStyles.timerChipTextOrange]}>
                        Epi ×{encounterSummary.adrenalineAdministeredCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <Text style={styles.timerValue}>{screenModel.timerRemaining}s</Text>
              <Text style={aclsScreenStyles.timerSubtext}>
                {tr("Manter RCP de alta qualidade — 100–120/min")}
              </Text>
            </View>
          </View>
        ) : null}
        {screenModel.prolongedResuscitationNote ? (
          <View style={styles.prolongedResuscitationCard}>
            <Text style={styles.prolongedResuscitationTitle}>{tr("Reanimação prolongada")}</Text>
            <Text style={styles.prolongedResuscitationText}>
              {tr(screenModel.prolongedResuscitationNote)}
            </Text>
            <Pressable
              onPress={() => {
                markProtocolSessionForResume(encounterSummary.protocolId);
                router.push("/modulos/causas-reversiveis-acls?from_module=pcr-adulto" as Href);
              }}
              style={({ pressed }) => [aclsScreenStyles.referenceShortcutCard, pressed && aclsScreenStyles.referenceShortcutCardPressed]}>
              <View style={aclsScreenStyles.referenceShortcutRow}>
                <Text style={aclsScreenStyles.referenceShortcutIcon}>HT</Text>
                <View>
                  <Text style={aclsScreenStyles.referenceShortcutTitle}>
                    {tr("Revisar Causas Reversíveis")}
                  </Text>
                  <Text style={aclsScreenStyles.referenceShortcutText}>
                    {tr("5 Hs e 5 Ts — retorna ao guia")}
                  </Text>
                </View>
              </View>
              <Text style={aclsScreenStyles.referenceShortcutChevron}>›</Text>
            </Pressable>
          </View>
        ) : null}
        {isContinuousCprFocus && cprPrimaryDocumentationAction ? (
          (() => {
            const isAdrenalineCpr = cprPrimaryDocumentationAction.id === "adrenaline";
            const isAntiarrhythmicCpr = cprPrimaryDocumentationAction.id === "antiarrhythmic";
            const doseNum = isAdrenalineCpr
              ? (medicationSnapshot?.adrenaline.administeredCount ?? 0) + 1
              : undefined;
            const antCount = isAntiarrhythmicCpr
              ? (medicationSnapshot?.antiarrhythmic.administeredCount ?? 0)
              : undefined;
            const isPendingAdr =
              isAdrenalineCpr &&
              medicationSnapshot?.adrenaline.pendingConfirmation &&
              medicationSnapshot?.adrenaline.status === "pending_confirmation";
            const isPendingAnt =
              isAntiarrhythmicCpr &&
              medicationSnapshot?.antiarrhythmic.pendingConfirmation &&
              medicationSnapshot?.antiarrhythmic.status === "pending_confirmation";

            let ctaTitle = "";
            let ctaDetail = "";
            let isConfirming = false;

            if (isAdrenalineCpr) {
              isConfirming = Boolean(isPendingAdr);
              ctaTitle = isConfirming
                ? `${tr("Confirmar — Epinefrina")} ${doseNum}ª ${tr("dose")}`
                : `${tr("Epinefrina")} ${doseNum}ª ${tr("dose")} — ${tr("Agora")}`;
              // ⚠️ A APRESENTAÇÃO PRECISA ESTAR NA 1ª DOSE, e é aqui que ela
              // é oferecida. Eu a tinha colocado só no card "PRÓXIMA
              // EPINEFRINA", que por construção exige `administeredCount > 0`:
              // ela só apareceria DEPOIS da primeira dose — exatamente a que
              // alguém aspira sem saber que é a ampola inteira.
              // Achado na verificação por execução (R-50), não na leitura.
              ctaDetail = `${tr("1 mg IV/IO · Não interromper RCP")} · ${tr(
                ADRENALINA_NA_PARADA_APRESENTACAO
              )}`;
            } else if (isAntiarrhythmicCpr) {
              isConfirming = Boolean(isPendingAnt);
              const antDoseNum = (antCount ?? 0) + 1;
              ctaTitle = isConfirming
                ? `${tr("Confirmar — Antiarrítmico")} ${antDoseNum}ª ${tr("dose")}`
                : `${tr("Antiarrítmico")} ${antDoseNum}ª ${tr("dose")} — ${tr("Agora")}`;
              ctaDetail =
                (antCount ?? 0) >= 1
                  ? tr("Amiodarona 150 mg IV/IO ou lidocaína 0,5–0,75 mg/kg")
                  : tr("Amiodarona 300 mg IV/IO ou lidocaína 1–1,5 mg/kg");
            } else {
              ctaTitle = tr(cprPrimaryDocumentationAction.label);
            }

            return (
              <Pressable
                style={({ pressed }) => [
                  aclsScreenStyles.urgentMedCtaCard,
                  isAdrenalineCpr && aclsScreenStyles.urgentMedCtaCardOrange,
                  isAntiarrhythmicCpr && aclsScreenStyles.urgentMedCtaCardAmber,
                  isConfirming && aclsScreenStyles.urgentMedCtaCardConfirming,
                  pressed && aclsScreenStyles.urgentMedCtaCardPressed,
                ]}
                onPress={() => onDocumentationAction(cprPrimaryDocumentationAction.id)}>
                <View style={aclsScreenStyles.urgentMedCtaContent}>
                  <Text style={aclsScreenStyles.urgentMedCtaEyebrow}>
                    {isConfirming ? tr("CONFIRMAR ADMINISTRAÇÃO") : tr("MEDICAÇÃO — AGORA")}
                  </Text>
                  <Text style={aclsScreenStyles.urgentMedCtaTitle}>{ctaTitle}</Text>
                  {ctaDetail ? (
                    <Text style={aclsScreenStyles.urgentMedCtaDetail}>{ctaDetail}</Text>
                  ) : null}
                </View>
                <Text style={aclsScreenStyles.urgentMedCtaArrow}>›</Text>
              </Pressable>
            );
          })()
        ) : null}
        <CprGuidanceCard
          stateId={currentStateId}
          // O card já sabia desenhar "Ciclo N" e nunca recebia o número: a tela
          // não tinha de onde tirá-lo. Agora o resumo carrega os ciclos.
          cycleNumber={encounterSummary.cyclesCompleted}
          advancedAirwaySecured={encounterSummary.advancedAirwaySecured}
          onRegisterAdvancedAirway={onRegisterAdvancedAirway}
        />
        {remainingInlineDocumentationActions.length > 0 && !isContinuousCprFocus ? (
          <View style={styles.compactSectionCard}>
            <Text style={styles.compactSectionTitle}>{ACLS_COPY.operational.sections.pending}</Text>
            <View style={styles.inlineDocumentationPassiveList}>
              {remainingInlineDocumentationActions.map((action) => (
                <View key={action.id} style={styles.inlineDocumentationPassiveItem}>
                  <Text style={styles.inlineDocumentationPassiveText}>{tr(action.label)}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.inlineDocumentationHint}>{tr("Registrar em Ferramentas.")}</Text>
            {screenModel.adrenalineStatusLabel ? (
              <Text style={styles.inlineDocumentationHint}>
                {tr(screenModel.adrenalineStatusLabel)}
              </Text>
            ) : screenModel.nextAdrenalineLabel ? (
              <Text style={styles.inlineDocumentationHint}>
                {ACLS_COPY.operational.ui.epinephrineIn} {screenModel.nextAdrenalineLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
        {hasDecisionFlow ? (
          <View style={[styles.compactSectionCard, aclsScreenStyles.decisionFlowCard]}>
            {screenModel.clinicalIntent === "analyze_rhythm" ? (
              <View style={aclsScreenStyles.rhythmCheckHeader}>
                <View style={aclsScreenStyles.rhythmCheckBadge}>
                  <Text style={aclsScreenStyles.rhythmCheckBadgeText}>{tr("AVALIAR RITMO")}</Text>
                </View>
                <View style={aclsScreenStyles.rhythmCheckStats}>
                  {encounterSummary.shockCount > 0 && (
                    <Text style={aclsScreenStyles.rhythmCheckStat}>⚡ {encounterSummary.shockCount} {encounterSummary.shockCount !== 1 ? tr("choques") : tr("choque")}</Text>
                  )}
                  {(encounterSummary.adrenalineAdministeredCount ?? 0) > 0 && (
                    <Text style={aclsScreenStyles.rhythmCheckStat}>
                      Epi ×{encounterSummary.adrenalineAdministeredCount}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={styles.compactSectionTitle}>
                {currentStateId === "checar_respiracao_pulso"
                  ? tr("Escolha respiração e pulso")
                  : ACLS_COPY.operational.labels.decide}
              </Text>
            )}
            {/* ⚠️ R-50 — A RESSALVA DA FV FINA PRECISA DE ELEMENTO PRÓPRIO.
                Colocá-la em `details` NÃO BASTA: esta tela renderiza apenas
                `details[0]`, e a lista já vem cortada em 3 por
                toConciseDetails. A ressalva chegava ao motor, passava em toda
                conferência de texto e NÃO APARECIA — escrita, versionada, e
                invisível exatamente no estado em que decide a conduta.
                Fica ACIMA da grade de decisão, que é onde se toca
                "chocável / não chocável". */}
            {screenModel.clinicalIntent === "analyze_rhythm" ? (
              <Text style={aclsScreenStyles.rhythmCheckCaveat}>
                {tr(FV_FINA_NA_CHECAGEM_DE_RITMO)}
              </Text>
            ) : null}
            <DecisionGrid
              options={decisionOptions}
              onSelect={onRunTransition}
              title={
                currentStateId === "checar_respiracao_pulso"
                  ? tr("Toque para definir respiração e pulso")
                  : screenModel.clinicalIntent === "analyze_rhythm"
                  ? tr("Qual o ritmo agora?")
                  : undefined
              }
            />
          </View>
        ) : null}
        {(() => {
          const note = getPhaseNote(currentStateId, {
            antiarrhythmicAdministeredCount: medicationSnapshot?.antiarrhythmic.administeredCount,
            antiarrhythmicPendingConfirmation: medicationSnapshot?.antiarrhythmic.pendingConfirmation,
            // Sem estes dois, a nota de fase dizia "epinefrina AGORA" enquanto o
            // card logo acima contava para a próxima dose.
            adrenalineAdministeredCount: medicationSnapshot?.adrenaline.administeredCount,
            adrenalineAguardandoProxima: Boolean(screenModel.nextAdrenalineLabel),
          });
          if (!note) return null;
          return (
            <Pressable
              onPress={() => setShowPhaseNote((v) => !v)}
              style={[aclsScreenStyles.phaseNoteCard, showPhaseNote && aclsScreenStyles.phaseNoteCardOpen]}>
              <View style={aclsScreenStyles.phaseNoteHeader}>
                <View style={aclsScreenStyles.phaseNoteHeaderMain}>
                  <View
                    style={[
                      aclsScreenStyles.phaseNoteIconWrap,
                      showPhaseNote && aclsScreenStyles.phaseNoteIconWrapOpen,
                    ]}>
                    <Text style={[aclsScreenStyles.phaseNoteIcon, showPhaseNote && aclsScreenStyles.phaseNoteIconOpen]}>ℹ</Text>
                  </View>
                  <Text
                    style={[aclsScreenStyles.phaseNoteHeading, showPhaseNote && aclsScreenStyles.phaseNoteHeadingOpen]}>
                    {tr(note.heading)}
                  </Text>
                </View>
                <Text
                  style={[aclsScreenStyles.phaseNoteToggle, showPhaseNote && aclsScreenStyles.phaseNoteToggleOpen]}>
                  {showPhaseNote ? tr("Fechar") : tr("Abrir")}
                </Text>
              </View>
              {showPhaseNote ? (
                <View style={aclsScreenStyles.phaseNoteBody}>
                  <Text style={aclsScreenStyles.phaseNoteBodyText}>
                    {tr(note.body)}
                  </Text>
                  {note.source ? (
                    <View style={aclsScreenStyles.phaseNoteSourceRow}>
                      <View style={aclsScreenStyles.phaseNoteSourceDot} />
                      <Text style={aclsScreenStyles.phaseNoteSourceText}>
                        {tr(note.source)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          );
        })()}
        {/* PONTEIRO CONTEXTUAL DO PÓS-PCR.
            O módulo estava disponível — como 8º chip de um acordeão
            FECHADO por padrão, entre Bradicardia e OVACE, idêntico em todas
            as fases. No instante do ROSC, que é quando ele passa a ser a
            próxima conduta, o app não o oferecia: mantinha-o escondido
            atrás de "RECURSOS ADICIONAIS".

            ⚠️ E A PRIMEIRA CORREÇÃO TAMBÉM NÃO APARECEU: eu o coloquei fora do
            acordeão, mas DENTRO do painel "Ferramentas", que é outro bloco
            recolhido. Ficou duplamente escondido, e só a verificação por
            execução mostrou (R-50 — truncamento e recolhimento se acumulam em
            camadas, e corrigir a camada que se conhece não basta).
            Agora está no fluxo principal, sem depender de nenhum toggle. */}
        {/* METAS DO PÓS-PARADA, no estado do fluxo em que cada uma vale.
            Fonte única em lib/metas-pos-parada — as mesmas constantes que o
            módulo de consulta exibe. O protocol.json tinha a SUA versão dos
            alvos, escrita para voz e separada da do módulo: concordavam hoje,
            que é o estado ANTES da divergência.

            ⚠️ BLOCO PRÓPRIO, e não `details`: injetar em `details` cairia em
            toConciseDetails (corta em 3) e no `details[0]` desta tela — R-50,
            o defeito que a FV fina já expôs duas vezes. */}
        {METAS_POR_ESTADO_POS_ROSC[currentStateId]?.length ? (
          <View style={aclsScreenStyles.metasPosParadaCard}>
            <Text style={aclsScreenStyles.metasPosParadaTitulo}>{tr("METAS")}</Text>
            {METAS_POR_ESTADO_POS_ROSC[currentStateId].map((meta) => (
              <Text key={meta} style={aclsScreenStyles.metasPosParadaTexto}>
                {tr(meta)}
              </Text>
            ))}
          </View>
        ) : null}

        {screenModel.clinicalIntent === "post_rosc_care" ? (
          <Pressable
            onPress={() => {
              markProtocolSessionForResume(encounterSummary.protocolId);
              router.push("/modulos/pos-pcr-acls?from_module=pcr-adulto" as Href);
            }}
            // `resourceCard` foi desenhado para a GRADE de recursos: tem
            // `flex: 1` e `minWidth: 44%`, e fora dela o cartão colapsava —
            // o Playwright o via como `hidden`. Estilo próprio, de largura
            // inteira, porque aqui ele não divide linha com ninguém.
            style={({ pressed }) => [
              aclsScreenStyles.posPcrCard,
              pressed && aclsScreenStyles.resourceCardPressed,
            ]}>
            <View style={aclsScreenStyles.resourceIconWrap}>
              <Text style={aclsScreenStyles.resourceIconText}>✓</Text>
            </View>
            <View style={aclsScreenStyles.resourceCopy}>
              <Text style={aclsScreenStyles.resourceTitle}>
                {tr("Cuidados pós-PCR")}
              </Text>
              <Text style={aclsScreenStyles.resourceSubtitle}>
                {tr("Metas de oxigenação, PAM, temperatura e neurologia — abrir agora")}
              </Text>
            </View>
            <Text style={aclsScreenStyles.resourceChevron}>›</Text>
          </Pressable>
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
              <Text style={styles.toolsSectionEyebrow}>{tr("Apoio")}</Text>
              <Text style={styles.toolsSectionTitle}>{tr("Ferramentas do caso")}</Text>
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
                        <Text style={styles.recordsActionButtonText}>{tr(action.label)}</Text>
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
            {sepsisPanelMetrics && sepsisPanelMetrics.length > 0 ? (
              <View style={styles.sepsisPanelCard}>
                <Text style={styles.sepsisPanelTitle}>{ACLS_COPY.operational.ui.clinicalPanel}</Text>
                <View style={styles.sepsisPanelGrid}>
                  {sepsisPanelMetrics.map((metric) => (
                    <View key={metric.label} style={styles.sepsisMetricItem}>
                      <Text style={styles.sepsisMetricLabel}>{tr(metric.label)}</Text>
                      <Text style={styles.sepsisMetricValue}>{tr(metric.value)}</Text>
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
                  <Text style={styles.secondaryButtonText}>{tr(showReversibleCauses ? reversibleCausesHideLabel : reversibleCausesActionLabel)}</Text>
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

            {/* ── Recursos adicionais ──────────────────────────── */}
            <View style={aclsScreenStyles.resourcesDividerRow}>
              <View style={aclsScreenStyles.resourcesDividerLine} />
              <Pressable
                onPress={() => setShowRefModules((v) => !v)}
                style={aclsScreenStyles.resourcesToggle}>
                <Text style={[aclsScreenStyles.resourcesToggleText, showRefModules && aclsScreenStyles.resourcesToggleTextOpen]}>
                  {tr("RECURSOS ADICIONAIS")}
                </Text>
                <Text style={[aclsScreenStyles.resourcesToggleChevron, showRefModules && aclsScreenStyles.resourcesToggleChevronOpen]}>
                  {showRefModules ? "▲" : "▼"}
                </Text>
              </Pressable>
              <View style={aclsScreenStyles.resourcesDividerLine} />
            </View>

            {showRefModules ? (
              <View style={aclsScreenStyles.resourcesGridWrap}>
                <View style={aclsScreenStyles.resourcesGrid}>
                  {ACLS_REF_MODULES.map((mod) => (
                    <Pressable
                      key={mod.label}
                      onPress={() => {
                        markProtocolSessionForResume(encounterSummary.protocolId);
                        router.push(mod.route);
                      }}
                      style={({ pressed }) => [aclsScreenStyles.resourceCard, pressed && aclsScreenStyles.resourceCardPressed]}>
                      <View style={aclsScreenStyles.resourceIconWrap}>
                        <Text style={aclsScreenStyles.resourceIconText}>
                          {mod.icon}
                        </Text>
                      </View>
                      <View style={aclsScreenStyles.resourceCopy}>
                        <Text style={aclsScreenStyles.resourceTitle}>
                          {mod.label}
                        </Text>
                        <Text style={aclsScreenStyles.resourceSubtitle}>
                          {mod.sublabel}
                        </Text>
                      </View>
                      <Text style={aclsScreenStyles.resourceChevron}>›</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={aclsScreenStyles.resourcesFootnote}>
                  {tr("Voltar retorna ao guia ACLS")}
                </Text>
              </View>
            ) : null}

          </View>
        ) : null}
        {showReversibleCauses ? (
          <ReversibleCausesCard
            assistantTopThree={reversibleCauseAssistantTopThree}
            causes={reversibleCauses}
            encounterSummary={encounterSummary}
            title={tr(reversibleCausesSectionTitle)}
            onNotesChange={onCauseNotesChange}
            onStatusChange={onCauseStatusChange}
            onOpenReferenceModule={() => {
              markProtocolSessionForResume(encounterSummary.protocolId);
              router.push("/modulos/causas-reversiveis-acls?from_module=pcr-adulto" as Href);
            }}
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

const aclsScreenStyles = StyleSheet.create({
  referenceShortcutCard: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fcd34d",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  referenceShortcutCardPressed: {
    backgroundColor: "#fef3c7",
  },
  referenceShortcutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  referenceShortcutIcon: {
    fontSize: 16,
  },
  referenceShortcutTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
    letterSpacing: -0.1,
  },
  referenceShortcutText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#b45309",
    lineHeight: 15,
  },
  referenceShortcutChevron: {
    fontSize: 14,
    color: "#d97706",
    fontWeight: "700",
  },
  phaseNoteCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 18,
    paddingVertical: 15,
    gap: 10,
    shadowColor: "#0369a1",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  phaseNoteCardOpen: {
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    shadowOpacity: 0.07,
    elevation: 2,
  },
  phaseNoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  phaseNoteHeaderMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  phaseNoteIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  phaseNoteIconWrapOpen: {
    backgroundColor: "#0ea5e9",
  },
  phaseNoteIcon: {
    fontSize: 13,
    color: "#0369a1",
  },
  phaseNoteIconOpen: {
    color: "#ffffff",
  },
  phaseNoteHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155", // paleta:manter — card claro (#f8fafc)
    flex: 1,
    lineHeight: 18,
  },
  phaseNoteHeadingOpen: {
    color: "#0369a1",
  },
  phaseNoteToggle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b", // paleta:manter — card claro (#f8fafc)
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
  },
  phaseNoteToggleOpen: {
    color: "#0369a1",
  },
  phaseNoteBody: {
    borderTopWidth: 1,
    borderTopColor: "#bae6fd",
    paddingTop: 12,
    gap: 10,
  },
  phaseNoteBodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#0c4a6e",
    fontWeight: "400",
  },
  phaseNoteSourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phaseNoteSourceDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#7dd3fc",
  },
  phaseNoteSourceText: {
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "600",
  },
  resourcesDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  resourcesDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  resourcesToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
   minHeight: 44, justifyContent: "center" },
  resourcesToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aab6c6",
    letterSpacing: 0.4,
  },
  resourcesToggleTextOpen: {
    color: "#0369a1",
  },
  resourcesToggleChevron: {
    fontSize: 10,
    color: "#aab6c6",
  },
  resourcesToggleChevronOpen: {
    color: "#0369a1",
  },
  resourcesGridWrap: {
    gap: 7,
  },
  resourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  // Metas do pós-parada: bloco de leitura, sem competir com a ação.
  metasPosParadaCard: {
    width: "100%",
    gap: 8,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
    backgroundColor: "#0b1a24",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  metasPosParadaTitulo: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#7dd3fc",
  },
  metasPosParadaTexto: {
    fontSize: 12,
    lineHeight: 18,
    color: "#e2e8f0",
  },
  // Cartão do Pós-PCR no ROSC: largura inteira, fora da grade.
  posPcrCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 11,
    paddingVertical: 12,
    marginBottom: 12,
  },
  resourceCard: {
    flex: 1,
    minWidth: "44%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 11,
    paddingVertical: 10,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  resourceCardPressed: {
    backgroundColor: "#f0f9ff",
    borderColor: "#7dd3fc",
    shadowOpacity: 0,
    elevation: 0,
  },
  resourceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#f0f9ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  resourceIconText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0369a1",
  },
  resourceCopy: {
    flex: 1,
    gap: 1,
  },
  resourceTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0c4a6e",
    letterSpacing: -0.1,
  },
  resourceSubtitle: {
    fontSize: 10,
    fontWeight: "500",
    color: "#0369a1",
    lineHeight: 13,
  },
  resourceChevron: {
    fontSize: 12,
    color: "#7dd3fc",
  },
  resourcesFootnote: {
    fontSize: 9,
    fontWeight: "600",
    color: "#cbd5e1",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // ── Timer aprimorado ──────────────────────────────────────
  timerBadgeEnhanced: {
    gap: 4,
  },
  timerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timerContextChips: {
    flexDirection: "row",
    gap: 6,
  },
  timerChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "#565e6c",
   minHeight: 44, justifyContent: "center" },
  timerChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#aab6c6",
    letterSpacing: 0.3,
  },
  timerChipOrange: {
    backgroundColor: "rgba(234,88,12,0.15)",
    borderColor: "#c2410c",
  },
  timerChipTextOrange: {
    color: "#fb923c",
  },
  timerSubtext: {
    fontSize: 11,
    fontWeight: "500",
    color: "#aab6c6",
    marginTop: 4,
  },

  // ── Epinefrina countdown ──────────────────────────────────
  epiCountdownCard: {
    borderRadius: 20,
    backgroundColor: "#1c1107",
    borderWidth: 1.5,
    borderColor: "#92400e",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#ea580c",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  epiCountdownLeft: {
    flex: 1,
    gap: 2,
  },
  epiCountdownEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#d97706",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  epiCountdownTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fef3c7",
    lineHeight: 22,
  },
  epiCountdownNote: {
    fontSize: 12,
    fontWeight: "500",
    color: "#b45309",
    lineHeight: 17,
  },
  epiCountdownBadge: {
    minWidth: 64,
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: "#451a03",
    borderWidth: 1.5,
    borderColor: "#c2410c",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 1,
  },
  epiCountdownBadgeLate: {
    backgroundColor: "#7f1d1d",
    borderColor: "#dc2626",
  },
  epiCountdownValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fdba74",
    lineHeight: 28,
  },
  epiCountdownUnit: {
    fontSize: 9,
    fontWeight: "700",
    color: "#b45309",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Urgente medicação durante CPR ─────────────────────────
  urgentMedCtaCard: {
    borderRadius: 22,
    backgroundColor: "#1c0a02",
    borderWidth: 2,
    borderColor: "#c2410c",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 96,
    shadowColor: "#ea580c",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  urgentMedCtaCardOrange: {
    backgroundColor: "#1c0a02",
    borderColor: "#c2410c",
    shadowColor: "#ea580c",
  },
  urgentMedCtaCardAmber: {
    backgroundColor: "#1c0f00",
    borderColor: "#b45309",
    shadowColor: "#d97706",
  },
  urgentMedCtaCardConfirming: {
    backgroundColor: "#0a1628",
    borderColor: "#1d4ed8",
    shadowColor: "#3b82f6",
  },
  urgentMedCtaCardPressed: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.85,
  },
  urgentMedCtaContent: {
    flex: 1,
    gap: 3,
  },
  urgentMedCtaEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fb923c",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  urgentMedCtaTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff7ed",
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  urgentMedCtaDetail: {
    fontSize: 12,
    fontWeight: "500",
    color: "#b45309",
    lineHeight: 17,
    marginTop: 1,
  },
  urgentMedCtaArrow: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fb923c",
    marginLeft: 4,
  },

  // ── Decisão de ritmo ──────────────────────────────────────
  decisionFlowCard: {
    gap: 12,
  },
  rhythmCheckHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rhythmCheckBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#383e4a",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  rhythmCheckBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#93c5fd",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rhythmCheckStats: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    justifyContent: "flex-end",
  },
  rhythmCheckStat: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aab6c6",
  },
  // Ressalva da FV fina: legível sem competir com a grade de decisão logo
  // abaixo. Cor de alerta suave e não vermelho de emergência — ela QUALIFICA
  // a escolha, não interrompe a conduta.
  rhythmCheckCaveat: {
    fontSize: 12,
    lineHeight: 17,
    color: "#fcd34d",
    backgroundColor: "#1c1917",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
