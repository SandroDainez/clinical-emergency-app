import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import * as defaultEngine from "../engine";
import { buildAclsScreenModel } from "../acls/screen-model";
import {
  buildAclsDebrief,
  buildAclsDebriefJsonExport,
  buildAclsDebriefTextExport,
} from "../acls/debrief";
import {
  buildPersistedAclsCase,
  getPersistedAclsCase,
  listPersistedAclsCases,
  savePersistedAclsCase,
  type PersistedAclsCase,
} from "../acls/case-history";
import {
  buildAssistantInsightSummary,
  evaluateReversibleCauseAssistant,
} from "../acls/reversible-cause-assistant";
import { deriveVoiceTelemetryFromTimeline } from "../acls/voice-telemetry";
import { buildVoiceCommandHints, getAllowedVoiceIntents } from "../acls/voice-policy";
import {
  createAclsVoiceRuntimeState,
  type AclsVoiceCommand,
  type AclsVoiceRuntimeState,
} from "../acls/voice-runtime";
import {
  createAclsVoiceSessionController,
  type AclsVoiceSessionContext,
} from "../acls/voice-session-controller";
import type {
  AclsMode,
  AuxiliaryPanel,
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  SepsisHubData,
  TimerState,
} from "../clinical-engine";
import {
  isSpeechOutputActive,
  speakText,
  stopSpeaking,
} from "./audio-session";
import { createDefaultVoiceCaptureProvider } from "./voice";
import CprMetronomeCard from "./cpr-metronome-card";
import AclsProtocolScreen from "./protocol-screen/acls-protocol-screen";
import SepsisProtocolScreen from "./protocol-screen/sepsis-protocol-screen";
import { styles } from "./protocol-screen/protocol-screen-styles";
import { groupAuxiliaryFieldsBySection } from "./protocol-screen/protocol-screen-utils";
import type { VoiceConfirmation } from "./protocol-screen/voice-command-card";

function getEffectCueId(message: string) {
  const effectCueIds: Record<string, string> = {
    "Reavaliar ritmo": "reminder_reavaliar_ritmo",
    "Administrar epinefrina 1 mg IV IO": "reminder_epinefrina",
    "Considerar antiarrítmico: amiodarona 300 mg IV IO ou lidocaína 1 a 1,5 mg por kg IV IO":
      "reminder_antiarritmico_1",
    "Se persistir ritmo chocável, considerar nova dose de antiarrítmico: amiodarona 150 mg IV IO ou lidocaína 0,5 a 0,75 mg por kg IV IO":
      "reminder_antiarritmico_2",
  };

  return effectCueIds[message];
}

type ProtocolScreenProps = {
  engine?: ClinicalEngine;
};

export default function ProtocolScreen({
  engine = defaultEngine as ClinicalEngine,
}: ProtocolScreenProps) {
  function debugVoice(event: string, details?: Record<string, unknown>) {
    if (
      typeof globalThis === "undefined" ||
      !(globalThis as typeof globalThis & { __ACLS_VOICE_DEBUG__?: boolean })
        .__ACLS_VOICE_DEBUG__
    ) {
      return;
    }

    console.debug("[ACLS voice]", event, details ?? {});
  }
  const [state, setState] = useState<ProtocolState>(engine.getCurrentState());
  const [stateId, setStateId] = useState<string>(engine.getCurrentStateId());
  const [timers, setTimers] = useState<TimerState[]>(engine.getTimers());
  const [timeline, setTimeline] = useState(engine.getTimeline?.() ?? []);
  const [reversibleCauses, setReversibleCauses] = useState<ReversibleCause[]>(
    engine.getReversibleCauses()
  );
  const [clinicalLog, setClinicalLog] = useState<ClinicalLogEntry[]>(engine.getClinicalLog());
  const [documentationActions, setDocumentationActions] = useState<DocumentationAction[]>(
    engine.getDocumentationActions()
  );
  const [encounterSummary, setEncounterSummary] = useState<EncounterSummary>(
    engine.getEncounterSummary()
  );
  const [auxiliaryPanel, setAuxiliaryPanel] = useState<AuxiliaryPanel | null>(
    engine.getAuxiliaryPanel?.() ?? null
  );
  const [sepsisHubData, setSepsisHubData] = useState<SepsisHubData | null>(
    engine.getSepsisHubData?.() ?? null
  );
  const [showReversibleCauses, setShowReversibleCauses] = useState(false);
  const [showClinicalLog, setShowClinicalLog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [historyCases, setHistoryCases] = useState<PersistedAclsCase[]>(() =>
    listPersistedAclsCases()
  );
  const [selectedHistoryCase, setSelectedHistoryCase] = useState<PersistedAclsCase | null>(null);
  const [aclsMode, setAclsMode] = useState<AclsMode>("training");
  const skipNextStateSpeech = useRef(false);
  const assistantRankingSignatureRef = useRef("");
  const assistantPresentedSignatureRef = useRef("");
  const savedCaseIdRef = useRef("");
  const voiceCaptureProviderRef = useRef(createDefaultVoiceCaptureProvider());
  const [voiceState, setVoiceState] = useState<AclsVoiceRuntimeState>(
    createAclsVoiceRuntimeState()
  );
  const previousStateIdRef = useRef(stateId);
  const voiceSessionContextRef = useRef<AclsVoiceSessionContext>({
    stateId,
    stateType: state.type,
    documentationActions,
    allowedIntents: [],
    baseHints: [],
    pendingConfirmationHints: [],
    presentationMessage: state.speak ?? state.text,
    presentationCueId: stateId,
  });
  const voiceControllerRef = useRef<ReturnType<typeof createAclsVoiceSessionController> | null>(
    null
  );

  function refreshStateFromEngine() {
    setState(engine.getCurrentState());
    setStateId(engine.getCurrentStateId());
    setTimers(engine.getTimers());
    setTimeline(engine.getTimeline?.() ?? []);
    setReversibleCauses(engine.getReversibleCauses());
    setClinicalLog(engine.getClinicalLog());
    setDocumentationActions(engine.getDocumentationActions());
    setEncounterSummary(engine.getEncounterSummary());
    setAuxiliaryPanel(engine.getAuxiliaryPanel?.() ?? null);
    setSepsisHubData(engine.getSepsisHubData?.() ?? null);
  }

  const speakCurrentState = useCallback(async () => {
    const currentStateId = engine.getCurrentStateId();
    const presentation = engine.getPresentation?.(aclsMode);
    const message =
      presentation?.speak ?? engine.getCurrentState().speak ?? engine.getCurrentState().text;
    debugVoice("orientation_played", {
      stateId: currentStateId,
      cueId: presentation?.cueId ?? engine.getCurrentCueId?.() ?? currentStateId,
    });
    await speakText(
      message,
      presentation?.cueId ?? engine.getCurrentCueId?.() ?? currentStateId
    );
  }, [aclsMode, engine]);

  const registerVoiceEvent = useCallback((entry: {
    transcript: string;
    intent?: string;
    confidence: number;
    outcome:
      | "unknown"
      | "rejected"
      | "confirmation_requested"
      | "confirmation_confirmed"
      | "confirmation_cancelled"
      | "confirmation_expired"
      | "commands_presented"
      | "executed"
      | "mode_enabled"
      | "mode_disabled";
    actionTaken: string;
    commands?: string;
    errorCategory?:
      | "unknown"
      | "low_confidence"
      | "invalid_for_state"
      | "confirmation_timeout"
      | "capture_failed";
  }) => {
    engine.registerVoiceCommandEvent?.(entry);
    setClinicalLog(engine.getClinicalLog());
  }, [engine]);

  function handleBundleStatusUpdate(
    itemId: string,
    status: "pendente" | "solicitado" | "realizado"
  ) {
    engine.updateAuxiliaryStatus?.(itemId, status);
    refreshStateFromEngine();
  }

  function handleFocusStatusUpdate(causeId: string, status: "suspeita" | "abordada") {
    engine.updateReversibleCauseStatus(causeId, status);
    refreshStateFromEngine();
  }

  function runTransition(input?: string) {
    try {
      engine.next(input);
      refreshStateFromEngine();
      processEffects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao avançar no protocolo";
      Alert.alert("Erro no fluxo", message);
    }
  }

  function goBackStage() {
    if (!engine.goBack) {
      return;
    }

    try {
      engine.goBack();
      refreshStateFromEngine();
      processEffects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao retornar etapa";
      Alert.alert("Erro no fluxo", message);
    }
  }

  function confirmCurrentAction() {
    runTransition();
  }

  function setCauseStatus(causeId: string, status: "suspeita" | "abordada") {
    try {
      setReversibleCauses(engine.updateReversibleCauseStatus(causeId, status));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar causa reversível";
      Alert.alert("Erro", message);
    }
  }

  function updateCauseNotes(
    causeId: string,
    field: "evidence" | "actionsTaken" | "responseObserved",
    value: string
  ) {
    if (!engine.updateReversibleCauseNotes) {
      return;
    }

    try {
      setReversibleCauses(engine.updateReversibleCauseNotes(causeId, field, value));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar registro clínico";
      Alert.alert("Erro", message);
    }
  }

  async function exportEncounterSummary() {
    const summaryText = engine.getEncounterSummaryText();

    if (typeof window !== "undefined") {
      const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resumo-clinico.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(summaryText);
        } catch {}
      }

      Alert.alert("Resumo exportado", "Arquivo gerado e conteúdo copiado quando suportado.");
      return;
    }

    Alert.alert("Resumo clínico", summaryText);
  }

  async function copyDebriefText() {
    if (!displayedDebrief) {
      return;
    }

    const text = buildAclsDebriefTextExport(displayedDebrief, displayedEncounterSummary);

    if (typeof window !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        Alert.alert("Debrief copiado", "Resumo do debrief copiado para a área de transferência.");
        return;
      } catch {}
    }

    Alert.alert("Debrief", text);
  }

  function viewDebriefJson() {
    if (!displayedDebrief) {
      return;
    }

    const json = buildAclsDebriefJsonExport(displayedDebrief, displayedEncounterSummary);

    if (typeof window !== "undefined") {
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "debrief-acls.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Alert.alert("Debrief JSON", "Arquivo JSON gerado para o debrief.");
      return;
    }

    Alert.alert("Debrief JSON", json);
  }

  function printEncounterReport() {
    const reportHtml = engine.getEncounterReportHtml();

    if (typeof window !== "undefined") {
      const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");

      if (!printWindow) {
        Alert.alert("Impressão indisponível", "Não foi possível abrir a janela do relatório.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    Alert.alert("Relatório clínico", engine.getEncounterSummaryText());
  }

  function registerDocumentationAction(actionId: DocumentationAction["id"]) {
    try {
      setClinicalLog(engine.registerExecution(actionId));

      const nextStateHint = (state as ProtocolState & { next?: string }).next;
      const shouldAutoAdvanceAcls =
        encounterSummary.protocolId === "pcr_adulto" &&
        state.type === "action" &&
        Boolean(nextStateHint);

      if (shouldAutoAdvanceAcls) {
        engine.next();
        refreshStateFromEngine();
        processEffects();
        return;
      }

      refreshStateFromEngine();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao registrar conduta executada";
      Alert.alert("Erro no registro", message);
    }
  }

  function updateAuxiliaryField(fieldId: string, value: string) {
    if (!engine.updateAuxiliaryField) {
      return;
    }

    engine.updateAuxiliaryField(fieldId, value);
    refreshStateFromEngine();
  }

  function applyAuxiliaryPreset(fieldId: string, value: string) {
    if (engine.applyAuxiliaryPreset) {
      engine.applyAuxiliaryPreset(fieldId, value);
      refreshStateFromEngine();
      return;
    }

    updateAuxiliaryField(fieldId, value);
  }

  function updateAuxiliaryUnit(fieldId: string, unit: string) {
    if (!engine.updateAuxiliaryUnit) {
      return;
    }

    engine.updateAuxiliaryUnit(fieldId, unit);
    refreshStateFromEngine();
  }

  function runAuxiliaryAction(actionId: string, requiresConfirmation?: boolean) {
    if (!engine.runAuxiliaryAction) {
      return;
    }

    try {
      engine.runAuxiliaryAction?.(actionId);
      refreshStateFromEngine();
      processEffects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao executar ação auxiliar";
      Alert.alert("Erro", message);
    }
  }

  function updateAuxiliaryStatus(
    itemId: string,
    status: "pendente" | "solicitado" | "realizado",
    requiresConfirmation?: boolean
  ) {
    if (!engine.updateAuxiliaryStatus) {
      return;
    }

    try {
      engine.updateAuxiliaryStatus?.(itemId, status);
      refreshStateFromEngine();
      processEffects();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao atualizar item clínico";
      Alert.alert("Erro", message);
    }
  }

  async function executeVoiceUiCommand(command: AclsVoiceCommand) {
    const previousStateId = engine.getCurrentStateId();

    switch (command.kind) {
      case "register_execution":
        registerDocumentationAction(command.actionId);
        break;
      case "run_transition":
        runTransition(command.input);
        break;
      case "repeat_instruction":
        await speakCurrentState();
        break;
      case "open_reversible_causes":
        setShowReversibleCauses(true);
        break;
      case "silence_audio":
        stopSpeaking();
        break;
      case "switch_mode":
        setAclsMode(command.mode);
        break;
    }

    return engine.getCurrentStateId() !== previousStateId ? "state_changed" : "same_state";
  }

  function toggleVoiceMode() {
    if (voiceControllerRef.current?.isModeEnabled()) {
      voiceControllerRef.current.disableMode();
      return;
    }

    voiceControllerRef.current?.enableMode();
  }

  const activeTimer = timers[0];
  const isCurrentStateTimed =
    state.type === "action" &&
    Boolean((state as ProtocolState & { timer?: unknown }).timer);
  const isCurrentStateTimerRunning =
    isCurrentStateTimed && Boolean(activeTimer) && engine.getCurrentStateId() === stateId;
  const options = Object.keys(state.options ?? {});
  const suggestedNextStep = state.suggestedNextStep;
  const isSepsisFlow = encounterSummary.protocolId === "sepse_adulto";
  const supportsReversibleCauses =
    reversibleCauses.length > 0 && !stateId.startsWith("pos_rosc") && state.type !== "end";
  const baseAllowedVoiceIntents = useMemo(
    () =>
      encounterSummary.protocolId === "pcr_adulto"
        ? getAllowedVoiceIntents({
            stateId,
            stateType: state.type,
            documentationActions,
            hasReversibleCauses: supportsReversibleCauses,
            stateOptions: state.options ?? {},
          })
        : [],
    [
      documentationActions,
      encounterSummary.protocolId,
      state.type,
      stateId,
      supportsReversibleCauses,
      state.options,
    ]
  );
  const baseVoiceHints = useMemo(
    () => buildVoiceCommandHints(baseAllowedVoiceIntents),
    [baseAllowedVoiceIntents]
  );
  const pendingConfirmationHints = useMemo(
    () =>
      buildVoiceCommandHints(
        ["confirm_pending_voice_action", "cancel_pending_voice_action"],
        2
      ),
    []
  );
  const reversibleCausesActionLabel =
    isSepsisFlow ? "Ver controle de foco" : "Ver 5 Hs e 5 Ts";
  const reversibleCausesHideLabel =
    isSepsisFlow ? "Ocultar controle de foco" : "Ocultar causas reversíveis";
  const reversibleCausesSectionTitle =
    isSepsisFlow ? "Controle de foco infeccioso" : "Causas reversíveis";
  const sepsisPanelMetrics = isSepsisFlow ? [] : encounterSummary.panelMetrics ?? [];
  const auxiliaryFieldSections = groupAuxiliaryFieldsBySection(auxiliaryPanel);
  const actionButtonLabel = stateId.startsWith("pos_rosc")
    ? "Avançar etapa"
    : isSepsisFlow
      ? "Próximo passo"
      : "Confirmar conduta";
  const hidePrimaryActionButton =
    encounterSummary.protocolId === "pcr_adulto" &&
    state.type === "action" &&
    documentationActions.length > 0;
  const showCprMetronome =
    encounterSummary.protocolId === "pcr_adulto" &&
    ["inicio", "rcp_1", "rcp_2", "rcp_3", "nao_chocavel_ciclo"].includes(stateId);
  const voiceAvailable =
    encounterSummary.protocolId === "pcr_adulto" &&
    voiceCaptureProviderRef.current.isAvailable();
  const voiceConfirmation: VoiceConfirmation | null = voiceState.pendingConfirmation
    ? {
        prompt: voiceState.pendingConfirmation.prompt,
        onConfirm: () => voiceControllerRef.current?.confirmPendingByTouch(),
        onCancel: () => voiceControllerRef.current?.cancelPendingByTouch(),
      }
    : null;
  const presentation = engine.getPresentation?.(aclsMode);
  const currentTimeline = timeline;
  const reversibleCauseAssistantResult =
    encounterSummary.protocolId === "pcr_adulto" && supportsReversibleCauses
      ? evaluateReversibleCauseAssistant({
          stateId,
          reversibleCauses,
          timeline: currentTimeline,
          encounterSummary,
          operationalMetrics: engine.getOperationalMetrics?.(),
        })
      : {
          topThree: [],
          ranked: [],
          summary: {
            topThreeIds: [],
            missingDataHighlights: [],
          },
        };
  const reversibleCauseAssistantTopThree = reversibleCauseAssistantResult.topThree;
  const reversibleCauseAssistantTopThreeSignature =
    reversibleCauseAssistantResult.summary.topThreeIds.join("|");
  const reversibleCauseAssistantMissingDataSignature =
    reversibleCauseAssistantResult.summary.missingDataHighlights.join("|");
  const reversibleCauseAssistantSummary = buildAssistantInsightSummary(
    reversibleCauseAssistantResult
  );
  const reversibleCauseAssistantRankedCount = reversibleCauseAssistantResult.ranked.length;
  const reversibleCauseAssistantMissingDataLabel =
    reversibleCauseAssistantResult.summary.missingDataHighlights.length > 0
      ? `Dados faltantes: ${reversibleCauseAssistantResult.summary.missingDataHighlights.join(", ")}`
      : "";
  const screenModel = buildAclsScreenModel({
    mode: aclsMode,
    state,
    stateId,
    presentation,
    timers,
    documentationActions,
    encounterSummary,
    operationalMetrics: engine.getOperationalMetrics?.(),
  });
  const debrief =
    encounterSummary.protocolId === "pcr_adulto" &&
    (state.type === "end" || stateId.startsWith("pos_rosc"))
      ? buildAclsDebrief({
          encounterSummary,
          operationalMetrics: engine.getOperationalMetrics?.(),
          timeline: currentTimeline,
          reversibleCauses,
        })
      : null;
  const displayedDebrief = selectedHistoryCase?.debrief ?? debrief;
  const displayedEncounterSummary = selectedHistoryCase?.encounterSummary ?? encounterSummary;

  voiceSessionContextRef.current = {
    stateId,
    stateType: state.type,
    documentationActions,
    allowedIntents: baseAllowedVoiceIntents,
    baseHints: baseVoiceHints,
    pendingConfirmationHints,
    presentationMessage: presentation?.speak ?? state.speak ?? state.text,
    presentationCueId: presentation?.cueId ?? engine.getCurrentCueId?.() ?? stateId,
  };

  if (!voiceControllerRef.current) {
    voiceControllerRef.current = createAclsVoiceSessionController({
      provider: voiceCaptureProviderRef.current,
      getContext: () => voiceSessionContextRef.current,
      onRuntimeStateChange: setVoiceState,
      onVoiceEvent: registerVoiceEvent,
      onExecuteCommand: executeVoiceUiCommand,
      playOutput: async (message, cueId) => {
        await speakText(message, cueId);
      },
      stopOutput: stopSpeaking,
      isOutputActive: isSpeechOutputActive,
      debug: debugVoice,
    });
  }

  const processEffects = useCallback(() => {
    const effects = engine.consumeEffects() as EngineEffect[];

    for (const effect of effects) {
      if (effect.type === "alert") {
        Alert.alert(effect.title, effect.message);
      }
    }

    if (encounterSummary.protocolId === "pcr_adulto") {
      void voiceControllerRef.current?.handleEffects(effects);
      return;
    }

    for (const effect of effects) {
      if (effect.type === "speak") {
        if (effect.suppressStateSpeech) {
          skipNextStateSpeech.current = true;
        }
        void speakText(effect.message, getEffectCueId(effect.message));
      }

      if (effect.type === "play_audio_cue") {
        if (effect.suppressStateSpeech) {
          skipNextStateSpeech.current = true;
        }
        void speakText(effect.message, effect.cueId ?? getEffectCueId(effect.message));
      }
    }
  }, [encounterSummary.protocolId, engine]);

  useEffect(() => {
    function refreshState() {
      setState(engine.getCurrentState());
      setStateId(engine.getCurrentStateId());
      setTimers(engine.getTimers());
      setTimeline(engine.getTimeline?.() ?? []);
      setReversibleCauses(engine.getReversibleCauses());
      setClinicalLog(engine.getClinicalLog());
      setDocumentationActions(engine.getDocumentationActions());
      setEncounterSummary(engine.getEncounterSummary());
      setAuxiliaryPanel(engine.getAuxiliaryPanel?.() ?? null);
      setSepsisHubData(engine.getSepsisHubData?.() ?? null);
    }

    const interval = setInterval(() => {
      engine.tick();
      refreshState();
      processEffects();
    }, 1000);

    return () => clearInterval(interval);
  }, [engine, processEffects]);

  useEffect(() => {
    if (encounterSummary.protocolId !== "pcr_adulto") {
      const previousStateId = previousStateIdRef.current;
      const stateChanged = previousStateId !== stateId;
      previousStateIdRef.current = stateId;

      if (!stateChanged || skipNextStateSpeech.current) {
        skipNextStateSpeech.current = false;
        return;
      }

      void speakCurrentState();
      return;
    }

    void voiceControllerRef.current?.syncTurn();
  }, [encounterSummary.protocolId, speakCurrentState, stateId]);

  useEffect(() => {
    return () => {
      voiceControllerRef.current?.dispose();
      voiceControllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (encounterSummary.protocolId !== "pcr_adulto" || !supportsReversibleCauses) {
      assistantRankingSignatureRef.current = "";
      assistantPresentedSignatureRef.current = "";
      return;
    }

    const rankingSignature = `${stateId}:${reversibleCauseAssistantTopThreeSignature}:${reversibleCauseAssistantMissingDataSignature}`;

    if (assistantRankingSignatureRef.current !== rankingSignature) {
      if (assistantRankingSignatureRef.current) {
        engine.registerAssistantInsightEvent?.({
          kind: "priority_changed",
          summary: reversibleCauseAssistantSummary,
          stateId,
          details: {
            topThree: reversibleCauseAssistantTopThreeSignature,
          },
        });
      }

      engine.registerAssistantInsightEvent?.({
        kind: "ranking_generated",
        summary: reversibleCauseAssistantSummary,
        stateId,
        details: {
          topThree: reversibleCauseAssistantTopThreeSignature,
          rankedCount: reversibleCauseAssistantRankedCount,
        },
      });

      if (reversibleCauseAssistantResult.summary.missingDataHighlights.length > 0) {
        engine.registerAssistantInsightEvent?.({
          kind: "missing_data_highlighted",
          summary: reversibleCauseAssistantMissingDataLabel,
          stateId,
          details: {
            topThree: reversibleCauseAssistantTopThreeSignature,
            missingData: reversibleCauseAssistantMissingDataSignature,
          },
        });
      }

      assistantRankingSignatureRef.current = rankingSignature;
    }
  }, [
    encounterSummary.protocolId,
    engine,
    reversibleCauseAssistantMissingDataSignature,
    reversibleCauseAssistantMissingDataLabel,
    reversibleCauseAssistantRankedCount,
    reversibleCauseAssistantSummary,
    reversibleCauseAssistantTopThreeSignature,
    reversibleCauseAssistantResult.summary.missingDataHighlights.length,
    stateId,
    supportsReversibleCauses,
  ]);

  useEffect(() => {
    if (
      encounterSummary.protocolId !== "pcr_adulto" ||
      !supportsReversibleCauses ||
      !showReversibleCauses
    ) {
      assistantPresentedSignatureRef.current = "";
      return;
    }

    const presentedSignature = `${stateId}:${reversibleCauseAssistantTopThreeSignature}`;

    if (assistantPresentedSignatureRef.current === presentedSignature) {
      return;
    }

    engine.registerAssistantInsightEvent?.({
      kind: "top_three_presented",
      summary: reversibleCauseAssistantSummary,
      stateId,
      details: {
        topThree: reversibleCauseAssistantTopThreeSignature,
      },
    });
    assistantPresentedSignatureRef.current = presentedSignature;
  }, [
    encounterSummary.protocolId,
    engine,
    reversibleCauseAssistantSummary,
    showReversibleCauses,
    stateId,
    supportsReversibleCauses,
    reversibleCauseAssistantTopThreeSignature,
  ]);

  useEffect(() => {
    if (!debrief) {
      setShowDebrief(false);
      return;
    }

    const voiceTelemetry = deriveVoiceTelemetryFromTimeline(currentTimeline);
    if (state.type === "end" || stateId.startsWith("pos_rosc") || voiceTelemetry.totalCommands > 0) {
      setShowDebrief(true);
    }
  }, [currentTimeline, debrief, state.type, stateId]);

  useEffect(() => {
    if (!debrief || encounterSummary.protocolId !== "pcr_adulto") {
      return;
    }

    const persistedCase = buildPersistedAclsCase(encounterSummary, debrief);
    if (savedCaseIdRef.current === persistedCase.id && state.type === "end") {
      return;
    }
    const cases = savePersistedAclsCase(persistedCase);
    setHistoryCases(cases);

    if (state.type === "end") {
      savedCaseIdRef.current = persistedCase.id;
    }
  }, [debrief, encounterSummary, state.type]);

  useEffect(() => {
    const provider = voiceCaptureProviderRef.current;
    return () => {
      provider.stop();
    };
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {isSepsisFlow ? (
          <SepsisProtocolScreen
            actionButtonLabel={actionButtonLabel}
            auxiliaryFieldSections={auxiliaryFieldSections}
            auxiliaryPanel={auxiliaryPanel}
            canGoBack={Boolean(engine.canGoBack?.())}
            clinicalLog={clinicalLog}
            encounterSummary={encounterSummary}
            isCurrentStateTimerRunning={isCurrentStateTimerRunning}
            onActionRun={runAuxiliaryAction}
            onBundleStatusUpdate={handleBundleStatusUpdate}
            onConfirmAction={confirmCurrentAction}
            onExportSummary={() => void exportEncounterSummary()}
            onFieldChange={updateAuxiliaryField}
            onFocusStatusUpdate={handleFocusStatusUpdate}
            onGoBack={goBackStage}
            onPresetApply={applyAuxiliaryPreset}
            onPrintReport={printEncounterReport}
            onRunTransition={runTransition}
            onStatusChange={updateAuxiliaryStatus}
            onUnitChange={updateAuxiliaryUnit}
            options={options}
            reversibleCauses={reversibleCauses}
            screenModel={screenModel}
            sepsisHubData={sepsisHubData}
            state={state}
          />
        ) : (
          <AclsProtocolScreen
            aclsMode={aclsMode}
            actionButtonLabel={actionButtonLabel}
            auxiliaryFieldSections={auxiliaryFieldSections}
            auxiliaryPanel={auxiliaryPanel}
            clinicalLog={clinicalLog}
            debrief={displayedDebrief}
            documentationActions={documentationActions}
            historyCases={historyCases}
            encounterSummary={encounterSummary}
            hidePrimaryActionButton={hidePrimaryActionButton}
            isCurrentStateTimerRunning={isCurrentStateTimerRunning}
            onActionRun={runAuxiliaryAction}
            onCauseNotesChange={updateCauseNotes}
            onCauseStatusChange={setCauseStatus}
            onConfirmAction={confirmCurrentAction}
            onDocumentationAction={registerDocumentationAction}
            onExportSummary={() => void exportEncounterSummary()}
            onFieldChange={updateAuxiliaryField}
            onModeChange={setAclsMode}
            onPresetApply={applyAuxiliaryPreset}
            onPrintReport={printEncounterReport}
            onRunTransition={runTransition}
            onToggleVoiceMode={toggleVoiceMode}
            onStatusChange={updateAuxiliaryStatus}
            onCopyDebriefText={() => void copyDebriefText()}
            onToggleClinicalLog={() => setShowClinicalLog((current) => !current)}
            onToggleHistory={() => setShowHistory((current) => !current)}
            onToggleDebrief={() => setShowDebrief((current) => !current)}
            onToggleReversibleCauses={() => setShowReversibleCauses((current) => !current)}
            onUnitChange={updateAuxiliaryUnit}
            onViewDebriefJson={viewDebriefJson}
            onOpenHistoryCase={(caseId) => {
              setSelectedHistoryCase(getPersistedAclsCase(caseId));
              setShowDebrief(true);
            }}
            onShowCurrentCase={() => {
              setSelectedHistoryCase(null);
              setShowDebrief(Boolean(debrief));
            }}
            options={options}
            reversibleCauses={reversibleCauses}
            reversibleCauseAssistantTopThree={reversibleCauseAssistantTopThree}
            reversibleCausesActionLabel={reversibleCausesActionLabel}
            reversibleCausesHideLabel={reversibleCausesHideLabel}
            reversibleCausesSectionTitle={reversibleCausesSectionTitle}
            screenModel={screenModel}
            sepsisPanelMetrics={sepsisPanelMetrics}
            showClinicalLog={showClinicalLog}
            showHistory={showHistory}
            showDebrief={showDebrief}
            showReversibleCauses={showReversibleCauses}
            selectedHistoryCaseId={selectedHistoryCase?.id ?? null}
            state={state}
            suggestedNextStep={suggestedNextStep}
            supportsReversibleCauses={supportsReversibleCauses}
            voiceAvailable={voiceAvailable}
            voiceModeEnabled={voiceState.modeEnabled}
            voiceConfirmation={voiceConfirmation}
            voiceCommandHints={voiceState.hints}
            voiceFeedback={voiceState.feedback}
            voiceStatus={voiceState.status}
            voiceTranscript={voiceState.transcript}
          />
        )}
      </ScrollView>
      <CprMetronomeCard active={showCprMetronome} />
    </View>
  );
}
