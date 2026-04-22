import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import * as defaultEngine from "../engine";
import { buildAclsScreenModel } from "../acls/screen-model";
import { createSpeechQueue } from "../acls/speech-queue";
import { getSpeechText } from "../acls/speech-map";
import {
  buildAclsDebrief,
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
  AclsTimelineEvent,
  AuxiliaryPanel,
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "../clinical-engine";
import {
  isSpeechOutputActive,
  speakText,
  stopSpeaking,
} from "./audio-session";
import { openClinicalModule } from "../lib/open-clinical-module";
import { markProtocolSessionForResume } from "../lib/module-session-navigation";
import { createDefaultVoiceCaptureProvider } from "./voice";
import { logClinicalSessionEvent } from "../lib/clinical-events";
import {
  clearCurrentClinicalSessionId,
  getCurrentClinicalSessionId,
} from "../lib/clinical-session-store";
import { completeClinicalSession } from "../lib/clinical-session-completion";
import {
  isAclsAiEnabled,
  requestAclsAiInsight,
  type AclsAiInsight,
} from "../lib/acls-ai";
import CprMetronomeCard from "./cpr-metronome-card";
import AclsProtocolScreen from "./protocol-screen/acls-protocol-screen";
import SepsisProtocolScreen from "./protocol-screen/sepsis-protocol-screen";
import EapProtocolScreen from "./protocol-screen/eap-protocol-screen";
import DkaHhsProtocolScreen from "./protocol-screen/dka-hhs-protocol-screen";
import VentilationProtocolScreen from "./protocol-screen/ventilation-protocol-screen";
import AnafilaxiaProtocolScreen from "./protocol-screen/anafilaxia-protocol-screen";
import AvcProtocolScreen from "./protocol-screen/avc-protocol-screen";
import CoronaryProtocolScreen from "./protocol-screen/coronary-protocol-screen";
import { styles } from "./protocol-screen/protocol-screen-styles";
import { groupAuxiliaryFieldsBySection } from "./protocol-screen/protocol-screen-utils";
import type { VoiceConfirmation } from "./protocol-screen/voice-command-card";

function areStringArraysEqual(left: string[] | undefined, right: string[] | undefined) {
  const leftItems = left ?? [];
  const rightItems = right ?? [];

  return (
    leftItems.length === rightItems.length &&
    leftItems.every((item, index) => item === rightItems[index])
  );
}

function areProtocolStatesEqual(left: ProtocolState, right: ProtocolState) {
  const leftOptions = Object.entries(left.options ?? {});
  const rightOptions = Object.entries(right.options ?? {});

  return (
    left.type === right.type &&
    left.text === right.text &&
    left.speak === right.speak &&
    areStringArraysEqual(left.details, right.details) &&
    leftOptions.length === rightOptions.length &&
    leftOptions.every(
      ([key, value], index) => key === rightOptions[index]?.[0] && value === rightOptions[index]?.[1]
    ) &&
    left.suggestedNextStep?.input === right.suggestedNextStep?.input &&
    left.suggestedNextStep?.label === right.suggestedNextStep?.label &&
    left.suggestedNextStep?.rationale === right.suggestedNextStep?.rationale
  );
}

function areTimersEqual(left: TimerState[], right: TimerState[]) {
  return (
    left.length === right.length &&
    left.every(
      (timer, index) =>
        timer.duration === right[index]?.duration && timer.remaining === right[index]?.remaining
    )
  );
}

function areDocumentationActionsEqual(left: DocumentationAction[], right: DocumentationAction[]) {
  return (
    left.length === right.length &&
    left.every(
      (action, index) => action.id === right[index]?.id && action.label === right[index]?.label
    )
  );
}

function areTimelineSnapshotsEqual(
  left: AclsTimelineEvent[],
  right: AclsTimelineEvent[]
) {
  if (left.length !== right.length) {
    return false;
  }

  return (
    left[left.length - 1]?.id === right[right.length - 1]?.id &&
    left[left.length - 1]?.timestamp === right[right.length - 1]?.timestamp
  );
}

function areClinicalLogEntriesEqual(left: ClinicalLogEntry[], right: ClinicalLogEntry[]) {
  if (left.length !== right.length) {
    return false;
  }

  return (
    left[left.length - 1]?.timestamp === right[right.length - 1]?.timestamp &&
    left[left.length - 1]?.title === right[right.length - 1]?.title &&
    left[left.length - 1]?.details === right[right.length - 1]?.details
  );
}

function areReversibleCausesEqual(left: ReversibleCause[], right: ReversibleCause[]) {
  return (
    left.length === right.length &&
    left.every((cause, index) => {
      const next = right[index];
      return (
        cause.id === next?.id &&
        cause.status === next?.status &&
        areStringArraysEqual(cause.evidence, next?.evidence) &&
        areStringArraysEqual(cause.actionsTaken, next?.actionsTaken) &&
        areStringArraysEqual(cause.responseObserved, next?.responseObserved)
      );
    })
  );
}

function areEncounterSummariesEqual(left: EncounterSummary, right: EncounterSummary) {
  return (
    left.protocolId === right.protocolId &&
    left.durationLabel === right.durationLabel &&
    left.currentStateId === right.currentStateId &&
    left.currentStateText === right.currentStateText &&
    left.shockCount === right.shockCount &&
    left.adrenalineSuggestedCount === right.adrenalineSuggestedCount &&
    left.adrenalineAdministeredCount === right.adrenalineAdministeredCount &&
    left.antiarrhythmicSuggestedCount === right.antiarrhythmicSuggestedCount &&
    left.antiarrhythmicAdministeredCount === right.antiarrhythmicAdministeredCount &&
    left.advancedAirwaySecured === right.advancedAirwaySecured &&
    areStringArraysEqual(left.suspectedCauses, right.suspectedCauses) &&
    areStringArraysEqual(left.addressedCauses, right.addressedCauses) &&
    areStringArraysEqual(left.lastEvents, right.lastEvents)
  );
}

const SHOCK_STATE_ENERGY_HINTS: Record<string, number> = {
  choque_bi_1: 200,
  choque_mono_1: 360,
  choque_2: 200,
  choque_3: 200,
};

function getShockEnergyHint(stateId: string) {
  return SHOCK_STATE_ENERGY_HINTS[stateId] ?? 200;
}

type ProtocolScreenProps = {
  engine?: ClinicalEngine;
  onRouteBack?: () => void;
};

export default function ProtocolScreen({
  engine = defaultEngine as ClinicalEngine,
  onRouteBack,
}: ProtocolScreenProps) {
  const router = useRouter();
  function getFieldValue(fieldId: string) {
    return auxiliaryPanel?.fields.find((field) => field.id === fieldId)?.value ?? "";
  }

  function buildAnafilaxiaReferralParams(target: "isr" | "vasoactive" | "ventilation") {
    const oxygenFallback = getFieldValue("treatmentO2") || getFieldValue("treatmentAirway");
    return {
      from_module: "anafilaxia",
      case_label: "Anafilaxia",
      reason:
        target === "isr"
          ? "Via aérea ameaçada / necessidade de IOT"
          : target === "vasoactive"
            ? "Necessidade de droga vasoativa / adrenalina EV"
            : "Pós-intubação — parametrização de ventilação mecânica",
      age: getFieldValue("age"),
      sex: getFieldValue("sex"),
      weight_kg: getFieldValue("weightKg"),
      height_cm: getFieldValue("heightCm"),
      spo2: getFieldValue("spo2"),
      gcs: getFieldValue("gcs"),
      pas: getFieldValue("systolicPressure"),
      pad: getFieldValue("diastolicPressure"),
      fc: getFieldValue("heartRate"),
      symptoms: getFieldValue("symptoms"),
      oxygen: oxygenFallback,
      drug: target === "vasoactive" ? "adrenalina" : undefined,
    };
  }

  function buildAnafilaxiaReferralRoute(target: "isr" | "vasoactive" | "ventilation"): Href {
    if (target === "isr") {
      return {
        pathname: "/modulos/isr-rapida",
        params: buildAnafilaxiaReferralParams(target),
      } as unknown as Href;
    }

    if (target === "vasoactive") {
      return {
        pathname: "/modulos/drogas-vasoativas",
        params: buildAnafilaxiaReferralParams(target),
      } as unknown as Href;
    }

    return {
      pathname: "/modulos/ventilacao-mecanica",
      params: buildAnafilaxiaReferralParams(target),
    } as unknown as Href;
  }
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

  const logSessionEvent = useCallback(
    async (eventType: string, eventLabel: string, eventData?: Record<string, any>) => {
      const sessionId = getCurrentClinicalSessionId();
      if (!sessionId) {
        return;
      }

      const { error } = await logClinicalSessionEvent(sessionId, eventType, eventLabel, eventData);

      if (error) {
        console.error("Falha ao registrar evento de sessão clínica", eventType, eventLabel, error);
      }
    },
    []
  );

  const logRhythmSelectionEvent = useCallback(
    (input?: string) => {
      const normalizedInput = input?.trim().toLowerCase();
      if (normalizedInput === "chocavel") {
        void logSessionEvent("rhythm_selected", "Ritmo chocável selecionado", { rhythm: "shockable" });
      } else if (normalizedInput === "nao_chocavel") {
        void logSessionEvent("rhythm_selected", "Ritmo não chocável selecionado", {
          rhythm: "non_shockable",
        });
      }
    },
    [logSessionEvent]
  );

  const logActionEvent = useCallback(
    (actionId: string, actionStateId: string) => {
      if (actionId === "shock") {
        const energy = getShockEnergyHint(actionStateId);
        void logSessionEvent("shock_performed", "Choque realizado", {
          stateId: actionStateId,
          joules: energy,
        });
        return;
      }

      const medicationSnapshot = engine.getMedicationSnapshot?.();

      if (actionId === "adrenaline") {
        const count = medicationSnapshot?.adrenaline?.administeredCount ?? 0;
        void logSessionEvent("medication_administered", "Adrenalina administrada", {
          medication: "epinephrine",
          dose: "1mg",
          count,
          stateId: actionStateId,
        });
        return;
      }

      if (actionId === "antiarrhythmic") {
        const count = medicationSnapshot?.antiarrhythmic?.administeredCount ?? 0;
        const dose = count <= 1 ? "300mg" : "150mg";
        void logSessionEvent("medication_administered", "Amiodarona administrada", {
          medication: "amiodarone",
          dose,
          count,
          stateId: actionStateId,
        });
        return;
      }

      if (actionId === "advanced_airway") {
        void logSessionEvent("advanced_airway_secured", "Intubação registrada", {
          airway: "intubacao_orotraqueal",
          stateId: actionStateId,
        });
      }
    },
    [engine, logSessionEvent]
  );
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
  const [showReversibleCauses, setShowReversibleCauses] = useState(false);
  const [showClinicalLog, setShowClinicalLog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [historyCases, setHistoryCases] = useState<PersistedAclsCase[]>(() =>
    listPersistedAclsCases()
  );
  const [selectedHistoryCase, setSelectedHistoryCase] = useState<PersistedAclsCase | null>(null);
  const [aiInsight, setAiInsight] = useState<AclsAiInsight | null>(null);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [aiErrorMessage, setAiErrorMessage] = useState<string>();
  const assistantRankingSignatureRef = useRef("");
  const assistantPresentedSignatureRef = useRef("");
  const aiSignatureRef = useRef("");
  const savedCaseIdRef = useRef("");
  const protocolCompletionLoggedRef = useRef(false);
  const voiceCaptureProviderRef = useRef(createDefaultVoiceCaptureProvider());
  const speechQueueRef = useRef(
    createSpeechQueue({
      getCurrentStateId: () => engine.getCurrentStateId(),
      isOutputActive: isSpeechOutputActive,
      onPlaybackStarted: (traceId, speakKey) => {
        engine.recordLatencyPlaybackStarted?.(traceId, speakKey);
      },
      play: async (message, cueId) => {
        await speakText(message, cueId);
      },
      stop: stopSpeaking,
    })
  );
  const [voiceState, setVoiceState] = useState<AclsVoiceRuntimeState>(
    createAclsVoiceRuntimeState()
  );
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

  const refreshStateFromEngine = useCallback(() => {
    const nextState = engine.getCurrentState();
    const nextStateId = engine.getCurrentStateId();
    const nextTimers = engine.getTimers();
    const nextTimeline = engine.getTimeline?.() ?? [];
    const nextReversibleCauses = engine.getReversibleCauses();
    const nextClinicalLog = engine.getClinicalLog();
    const nextDocumentationActions = engine.getDocumentationActions();
    const nextEncounterSummary = engine.getEncounterSummary();
    const nextAuxiliaryPanel = engine.getAuxiliaryPanel?.() ?? null;

    setState((current) => (areProtocolStatesEqual(current, nextState) ? current : nextState));
    setStateId((current) => (current === nextStateId ? current : nextStateId));
    setTimers((current) => (areTimersEqual(current, nextTimers) ? current : nextTimers));
    setTimeline((current) => (areTimelineSnapshotsEqual(current, nextTimeline) ? current : nextTimeline));
    setReversibleCauses((current) =>
      areReversibleCausesEqual(current, nextReversibleCauses) ? current : nextReversibleCauses
    );
    setClinicalLog((current) =>
      areClinicalLogEntriesEqual(current, nextClinicalLog) ? current : nextClinicalLog
    );
    setDocumentationActions((current) =>
      areDocumentationActionsEqual(current, nextDocumentationActions)
        ? current
        : nextDocumentationActions
    );
    setEncounterSummary((current) =>
      areEncounterSummariesEqual(current, nextEncounterSummary)
        ? current
        : nextEncounterSummary
    );
    setAuxiliaryPanel((current) =>
      current === nextAuxiliaryPanel ? current : nextAuxiliaryPanel
    );
  }, [engine]);

  const speakCurrentState = useCallback(async () => {
    const currentStateId = engine.getCurrentStateId();
    const presentation = engine.getPresentation?.();
    const message =
      presentation?.speak ?? engine.getCurrentState().speak ?? engine.getCurrentState().text;
    debugVoice("orientation_played", {
      stateId: currentStateId,
      cueId: presentation?.cueId ?? engine.getCurrentCueId?.() ?? currentStateId,
    });
    await speechQueueRef.current.enqueue({
      effect: {
        type: "SPEAK",
        key: presentation?.cueId ?? engine.getCurrentCueId?.() ?? currentStateId,
        message: getSpeechText(
          presentation?.cueId ?? engine.getCurrentCueId?.() ?? currentStateId,
          message
        ),
        cueId: presentation?.cueId ?? engine.getCurrentCueId?.() ?? currentStateId,
      },
      stateId: currentStateId,
    });
  }, [engine]);

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

  function runTransition(input?: string) {
    try {
      engine.next(input);
      refreshStateFromEngine();
      logRhythmSelectionEvent(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao avançar no protocolo";
      Alert.alert("Erro no fluxo", message);
    }
  }

  function goBackStage() {
    try {
      if (engine.canGoBack?.() && engine.goBack) {
        engine.goBack();
        refreshStateFromEngine();
        return;
      }

      onRouteBack?.();
      return;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao retornar etapa";
      Alert.alert("Erro no fluxo", message);
    }
  }

  function confirmCurrentAction() {
    const confirmedStep = stateId;
    runTransition();
    void logSessionEvent("step_confirmed", "Conduta confirmada", { step: confirmedStep });
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
      const actionStateId = stateId;
      setClinicalLog(engine.registerExecution(actionId));
      void logActionEvent(actionId, actionStateId);

      const nextStateHint = (state as ProtocolState & { next?: string }).next;
      const shouldAutoAdvanceAcls =
        encounterSummary.protocolId === "pcr_adulto" &&
        actionId === "shock" &&
        state.type === "action" &&
        Boolean(nextStateHint);

      if (shouldAutoAdvanceAcls) {
        engine.next();
        refreshStateFromEngine();
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

    let normalizedValue = value;
    if (fieldId === "heightCm") {
      const trimmed = value.trim().replace(",", ".");
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed) && parsed > 0 && parsed >= 1 && parsed <= 2.5) {
        normalizedValue = String(Math.round(parsed * 100));
      }
    }

    engine.updateAuxiliaryField(fieldId, normalizedValue);
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
    if (actionId === "open_rsi_module") {
      markProtocolSessionForResume(encounterSummary.protocolId);
      void openClinicalModule(router, "isr-rapida", buildAnafilaxiaReferralRoute("isr"));
      return;
    }

    if (actionId === "open_vasoactive_module") {
      markProtocolSessionForResume(encounterSummary.protocolId);
      void openClinicalModule(
        router,
        "drogas-vasoativas",
        buildAnafilaxiaReferralRoute("vasoactive")
      );
      return;
    }

    if (actionId === "open_ventilation_module") {
      markProtocolSessionForResume(encounterSummary.protocolId);
      void openClinicalModule(
        router,
        "ventilacao-mecanica",
        buildAnafilaxiaReferralRoute("ventilation")
      );
      return;
    }

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
        speechQueueRef.current.stop();
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

    if (encounterSummary.protocolId === "pcr_adulto") {
      void speakCurrentState();
    }
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
  const isEapFlow = encounterSummary.protocolId === "edema_agudo_pulmao";
  const isDkaHhsFlow = encounterSummary.protocolId === "cetoacidose_hiperosmolar";
  const isVentilationFlow = encounterSummary.protocolId === "ventilacao_mecanica";
  const isAnafilaxiaFlow = encounterSummary.protocolId === "anafilaxia";
  const isAvcFlow = encounterSummary.protocolId === "acidente_vascular_cerebral";
  const isCoronaryFlow = encounterSummary.protocolId === "sindromes_coronarianas";
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
  const presentation = engine.getPresentation?.();
  const actionButtonLabel = stateId.startsWith("pos_rosc")
    ? "Avançar etapa"
    : isSepsisFlow
      ? "Próximo passo"
      : "Confirmar conduta";
  const hidePrimaryActionButton =
    encounterSummary.protocolId === "pcr_adulto" &&
    state.type === "action" &&
    (presentation?.clinicalIntent === "perform_cpr" ||
      presentation?.clinicalIntent === "give_epinephrine" ||
      presentation?.clinicalIntent === "give_antiarrhythmic") &&
    isCurrentStateTimerRunning;
  const showCprMetronome =
    encounterSummary.protocolId === "pcr_adulto" &&
    isCurrentStateTimerRunning &&
    (presentation?.clinicalIntent === "perform_cpr" ||
      presentation?.clinicalIntent === "give_epinephrine" ||
      presentation?.clinicalIntent === "give_antiarrhythmic");
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

  const voiceDebugInfo = useMemo(() => {
    const debugMode =
      typeof globalThis !== "undefined" &&
      (globalThis as { __ACLS_VOICE_DEBUG__?: boolean }).__ACLS_VOICE_DEBUG__;

    if (!debugMode) {
      return undefined;
    }

    return {
      enabled: true,
      stateId,
      stateType: state.type,
      voiceStatus: voiceState.status,
      presentation: presentation?.cueId ?? stateId,
      voiceModeEnabled: voiceState.modeEnabled,
      allowedHints: voiceState.hints.map((hint) => hint.label),
      baseIntents: baseAllowedVoiceIntents,
    };
  }, [baseAllowedVoiceIntents, presentation, state.type, stateId, voiceState.hints, voiceState.modeEnabled, voiceState.status]);

  useEffect(() => {
    if (!voiceDebugInfo) {
      return;
    }

    console.debug("[acls:voice-debug]", voiceDebugInfo);
  }, [voiceDebugInfo]);
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
          debugLatencyEnabled: engine.isDebugLatencyEnabled?.() ?? false,
          caseLog: engine.getCaseLog?.() ?? [],
          encounterSummary,
          latencyMetrics: engine.getLatencyMetrics?.() ?? [],
          operationalMetrics: engine.getOperationalMetrics?.(),
          timeline: currentTimeline,
          reversibleCauses,
        })
      : null;
  const displayedDebrief = selectedHistoryCase?.debrief ?? debrief;
  const displayedEncounterSummary = selectedHistoryCase?.encounterSummary ?? encounterSummary;

  const buildAiContext = useCallback(
    () => ({
      stateId,
      stateText: state.text,
      clinicalIntent: presentation?.clinicalIntent,
      presentationCueId: presentation?.cueId ?? engine.getCurrentCueId?.() ?? stateId,
      suggestedNextStep: state.suggestedNextStep ?? null,
      timers: timers.map((timer) => ({
        duration: timer.duration,
        remaining: timer.remaining,
      })),
      documentationActions: documentationActions.map((action) => ({
        id: action.id,
        label: action.label,
      })),
      medicationSnapshot: engine.getMedicationSnapshot?.()
        ? {
            adrenaline: {
              status: engine.getMedicationSnapshot().adrenaline.status,
              recommendedCount: engine.getMedicationSnapshot().adrenaline.recommendedCount,
              administeredCount: engine.getMedicationSnapshot().adrenaline.administeredCount,
              pendingConfirmation: engine.getMedicationSnapshot().adrenaline.pendingConfirmation,
              lastRecommendedAt: engine.getMedicationSnapshot().adrenaline.lastRecommendedAt,
              lastAdministeredAt: engine.getMedicationSnapshot().adrenaline.lastAdministeredAt,
              nextDueAt: engine.getMedicationSnapshot().adrenaline.nextDueAt,
            },
            antiarrhythmic: {
              status: engine.getMedicationSnapshot().antiarrhythmic.status,
              recommendedCount: engine.getMedicationSnapshot().antiarrhythmic.recommendedCount,
              administeredCount: engine.getMedicationSnapshot().antiarrhythmic.administeredCount,
              pendingConfirmation:
                engine.getMedicationSnapshot().antiarrhythmic.pendingConfirmation,
              lastRecommendedAt: engine.getMedicationSnapshot().antiarrhythmic.lastRecommendedAt,
              lastAdministeredAt:
                engine.getMedicationSnapshot().antiarrhythmic.lastAdministeredAt,
              nextDueAt: engine.getMedicationSnapshot().antiarrhythmic.nextDueAt,
            },
          }
        : undefined,
      operationalMetrics: engine.getOperationalMetrics?.()
        ? {
            cyclesCompleted: engine.getOperationalMetrics()?.cyclesCompleted ?? 0,
            totalPcrDurationMs: engine.getOperationalMetrics()?.totalPcrDurationMs,
            timeSinceLastAdrenalineMs:
              engine.getOperationalMetrics()?.timeSinceLastAdrenalineMs,
            timeSinceLastShockMs: engine.getOperationalMetrics()?.timeSinceLastShockMs,
            nextAdrenalineDueInMs: engine.getOperationalMetrics()?.nextAdrenalineDueInMs,
          }
        : undefined,
      encounterSummary: {
        shockCount: encounterSummary.shockCount,
        adrenalineSuggestedCount: encounterSummary.adrenalineSuggestedCount,
        adrenalineAdministeredCount: encounterSummary.adrenalineAdministeredCount,
        antiarrhythmicSuggestedCount: encounterSummary.antiarrhythmicSuggestedCount,
        antiarrhythmicAdministeredCount: encounterSummary.antiarrhythmicAdministeredCount,
        advancedAirwaySecured: encounterSummary.advancedAirwaySecured,
        currentStateId: encounterSummary.currentStateId,
        currentStateText: encounterSummary.currentStateText,
        lastEvents: encounterSummary.lastEvents,
      },
      heuristicTopThree: reversibleCauseAssistantTopThree.map((cause) => ({
        id: cause.causeId,
        label: cause.label,
        explanation: cause.explanation,
      })),
      reversibleCauses: reversibleCauses.map((cause) => ({
        id: cause.id,
        label: cause.label,
        status: cause.status,
        evidence: cause.evidence ?? [],
        actionsTaken: cause.actionsTaken ?? [],
        responseObserved: cause.responseObserved ?? [],
      })),
      clinicalLogTail: clinicalLog.slice(-8).map((entry) => ({
        title: entry.title,
        details: entry.details,
      })),
    }),
    [
      clinicalLog,
      documentationActions,
      encounterSummary,
      engine,
      presentation,
      reversibleCauseAssistantTopThree,
      reversibleCauses,
      state.suggestedNextStep,
      state.text,
      stateId,
      timers,
    ]
  );

  const refreshAclsAiInsight = useCallback(async () => {
    if (encounterSummary.protocolId !== "pcr_adulto" || !supportsReversibleCauses || !isAclsAiEnabled()) {
      setAiInsight(null);
      setAiStatus("idle");
      setAiErrorMessage(undefined);
      return;
    }

    setAiStatus("loading");
    setAiErrorMessage(undefined);

    try {
      const insight = await requestAclsAiInsight(buildAiContext());
      setAiInsight(insight);
      setAiStatus(insight ? "ready" : "idle");
      if (insight) {
        void logSessionEvent("assistant_insight", "Assistente IA atualizado", {
          source: "openai",
          stateId,
          summary: insight.summary,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Assistente IA indisponível no momento";
      setAiStatus("error");
      setAiErrorMessage(message);
    }
  }, [
    buildAiContext,
    encounterSummary.protocolId,
    logSessionEvent,
    stateId,
    supportsReversibleCauses,
  ]);

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

  // Comandos de voz, captura e fila TTS do protocolo: somente ACLS (PCR adulto).
  if (!voiceControllerRef.current && encounterSummary.protocolId === "pcr_adulto") {
    voiceControllerRef.current = createAclsVoiceSessionController({
      provider: voiceCaptureProviderRef.current,
      getContext: () => voiceSessionContextRef.current,
      onRuntimeStateChange: setVoiceState,
      onVoiceEvent: registerVoiceEvent,
      onExecuteCommand: executeVoiceUiCommand,
      playOutput: async (message, cueId) => {
        await speechQueueRef.current.enqueue({
          effect: {
            type: "SPEAK",
            key: cueId ?? message,
            message: getSpeechText(cueId ?? message, message),
            cueId,
          },
          stateId: engine.getCurrentStateId(),
        });
      },
      stopOutput: () => speechQueueRef.current.stop(),
      isOutputActive: isSpeechOutputActive,
      debug: debugVoice,
    });
  }

  useEffect(() => {
    if (state.type === "end") {
      if (!protocolCompletionLoggedRef.current) {
        protocolCompletionLoggedRef.current = true;
        void logSessionEvent("protocol_completed", "Protocolo encerrado", {
          outcome: "completed",
          stateId,
        });
        const sessionId = getCurrentClinicalSessionId();
        if (sessionId) {
          void completeClinicalSession(sessionId);
        }
      }
    } else {
      protocolCompletionLoggedRef.current = false;
    }
  }, [state.type, stateId, logSessionEvent]);

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

    // Demais módulos: documentação silenciosa (sem fila TTS por efeitos de engine).
  }, [encounterSummary.protocolId, engine]);

  useEffect(() => {
    if (engine.subscribe) {
      return engine.subscribe(() => {
        refreshStateFromEngine();
      });
    }

    function refreshState() {
      engine.tick();
      refreshStateFromEngine();
    }

    const interval = setInterval(refreshState, 1000);

    return () => clearInterval(interval);
  }, [engine, refreshStateFromEngine]);

  useLayoutEffect(() => {
    engine.markLatencyStateCommitted?.();
    processEffects();
  });

  useEffect(() => {
    if (encounterSummary.protocolId !== "pcr_adulto") {
      return;
    }

    void voiceCaptureProviderRef.current.ensureReady?.();
  }, [encounterSummary.protocolId]);

  useEffect(() => {
    if (encounterSummary.protocolId !== "pcr_adulto") {
      return;
    }

    void voiceControllerRef.current?.syncTurn();
  }, [encounterSummary.protocolId, stateId]);

  // Fala inicial ao montar — somente ACLS.
  useEffect(() => {
    if (encounterSummary.protocolId !== "pcr_adulto") {
      return;
    }
    void speakCurrentState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const speechQueue = speechQueueRef.current;
    return () => {
      speechQueue.clear();
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
    if (
      encounterSummary.protocolId !== "pcr_adulto" ||
      !supportsReversibleCauses ||
      !showReversibleCauses ||
      !isAclsAiEnabled()
    ) {
      aiSignatureRef.current = "";
      setAiInsight(null);
      setAiStatus("idle");
      setAiErrorMessage(undefined);
      return;
    }

    const signature = JSON.stringify({
      stateId,
      actions: documentationActions.map((action) => action.id),
      topThree: reversibleCauseAssistantTopThreeSignature,
      currentState: encounterSummary.currentStateId,
      shocks: encounterSummary.shockCount,
      adrenaline: encounterSummary.adrenalineAdministeredCount,
      antiarrhythmic: encounterSummary.antiarrhythmicAdministeredCount,
      airway: encounterSummary.advancedAirwaySecured,
      timelineTail: currentTimeline.slice(-4).map((event) => `${event.type}:${event.stateId}`),
    });

    if (aiSignatureRef.current === signature) {
      return;
    }

    aiSignatureRef.current = signature;
    void refreshAclsAiInsight();
  }, [
    currentTimeline,
    documentationActions,
    encounterSummary,
    refreshAclsAiInsight,
    reversibleCauseAssistantTopThreeSignature,
    showReversibleCauses,
    stateId,
    supportsReversibleCauses,
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

    const persistedCase = buildPersistedAclsCase(
      encounterSummary,
      debrief,
      engine.getCaseLog?.() ?? []
    );
    if (savedCaseIdRef.current === persistedCase.id && state.type === "end") {
      return;
    }
    const cases = savePersistedAclsCase(persistedCase);
    setHistoryCases(cases);

    if (state.type === "end") {
      savedCaseIdRef.current = persistedCase.id;
    }
  }, [debrief, encounterSummary, engine, state.type]);

  useEffect(() => {
    const provider = voiceCaptureProviderRef.current;
    return () => {
      provider.stop();
      clearCurrentClinicalSessionId();
    };
  }, []);

  return (
    <View style={styles.screen}>
      {isSepsisFlow || isEapFlow || isDkaHhsFlow || isVentilationFlow || isAnafilaxiaFlow || isAvcFlow || isCoronaryFlow ? (
        <>
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
              onConfirmAction={confirmCurrentAction}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          ) : isEapFlow ? (
            <EapProtocolScreen
              actionButtonLabel={actionButtonLabel}
              auxiliaryFieldSections={auxiliaryFieldSections}
              auxiliaryPanel={auxiliaryPanel}
              canGoBack={Boolean(engine.canGoBack?.())}
              clinicalLog={clinicalLog}
              encounterSummary={encounterSummary}
              isCurrentStateTimerRunning={isCurrentStateTimerRunning}
              onActionRun={runAuxiliaryAction}
              onConfirmAction={confirmCurrentAction}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          ) : isDkaHhsFlow ? (
            <DkaHhsProtocolScreen
              actionButtonLabel={actionButtonLabel}
              auxiliaryFieldSections={auxiliaryFieldSections}
              auxiliaryPanel={auxiliaryPanel}
              canGoBack={Boolean(engine.canGoBack?.())}
              clinicalLog={clinicalLog}
              encounterSummary={encounterSummary}
              isCurrentStateTimerRunning={isCurrentStateTimerRunning}
              onActionRun={runAuxiliaryAction}
              onConfirmAction={confirmCurrentAction}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          ) : isVentilationFlow ? (
            <VentilationProtocolScreen
              actionButtonLabel={actionButtonLabel}
              auxiliaryFieldSections={auxiliaryFieldSections}
              auxiliaryPanel={auxiliaryPanel}
              canGoBack={Boolean(engine.canGoBack?.())}
              clinicalLog={clinicalLog}
              encounterSummary={encounterSummary}
              isCurrentStateTimerRunning={isCurrentStateTimerRunning}
              onActionRun={runAuxiliaryAction}
              onConfirmAction={confirmCurrentAction}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          ) : isAvcFlow ? (
            <AvcProtocolScreen
              auxiliaryFieldSections={auxiliaryFieldSections}
              auxiliaryPanel={auxiliaryPanel}
              canGoBack={Boolean(engine.canGoBack?.())}
              clinicalLog={clinicalLog}
              encounterSummary={encounterSummary}
              isCurrentStateTimerRunning={isCurrentStateTimerRunning}
              onActionRun={runAuxiliaryAction}
              onConfirmAction={confirmCurrentAction}
              onExitModule={onRouteBack ?? goBackStage}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          ) : isCoronaryFlow ? (
            <CoronaryProtocolScreen
              auxiliaryFieldSections={auxiliaryFieldSections}
              auxiliaryPanel={auxiliaryPanel}
              canGoBack={Boolean(engine.canGoBack?.())}
              clinicalLog={clinicalLog}
              encounterSummary={encounterSummary}
              isCurrentStateTimerRunning={isCurrentStateTimerRunning}
              onActionRun={runAuxiliaryAction}
              onConfirmAction={confirmCurrentAction}
              onExitModule={onRouteBack ?? goBackStage}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          ) : (
            <AnafilaxiaProtocolScreen
              actionButtonLabel={actionButtonLabel}
              auxiliaryFieldSections={auxiliaryFieldSections}
              auxiliaryPanel={auxiliaryPanel}
              canGoBack={Boolean(engine.canGoBack?.())}
              clinicalLog={clinicalLog}
              encounterSummary={encounterSummary}
              isCurrentStateTimerRunning={isCurrentStateTimerRunning}
              onActionRun={runAuxiliaryAction}
              onConfirmAction={confirmCurrentAction}
              onExportSummary={() => void exportEncounterSummary()}
              onFieldChange={updateAuxiliaryField}
              onGoBack={goBackStage}
              onPresetApply={applyAuxiliaryPreset}
              onPrintReport={printEncounterReport}
              onRunTransition={runTransition}
              onStatusChange={updateAuxiliaryStatus}
              onUnitChange={updateAuxiliaryUnit}
              options={options}
              state={state}
            />
          )}
        </>
      ) : (
        <>
          <AclsProtocolScreen
            actionButtonLabel={actionButtonLabel}
            auxiliaryFieldSections={auxiliaryFieldSections}
            auxiliaryPanel={auxiliaryPanel}
            clinicalLog={clinicalLog}
            debrief={displayedDebrief}
            documentationActions={documentationActions}
            medicationSnapshot={engine.getMedicationSnapshot?.()}
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
            onGoBack={goBackStage}
            onExitModule={onRouteBack ?? goBackStage}
            onOpenHistoryCase={(caseId) => {
              setSelectedHistoryCase(getPersistedAclsCase(caseId));
              setShowDebrief(true);
            }}
            onShowCurrentCase={() => {
              setSelectedHistoryCase(null);
              setShowDebrief(Boolean(debrief));
            }}
            onRegisterAdvancedAirway={() => registerDocumentationAction("advanced_airway")}
            onRefreshAi={() => {
              aiSignatureRef.current = "";
              void refreshAclsAiInsight();
            }}
            options={options}
            reversibleCauses={reversibleCauses}
            aiInsight={aiInsight}
            aiStatus={aiStatus}
            aiErrorMessage={aiErrorMessage}
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
            canGoBack={Boolean(engine.canGoBack?.())}
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
            voiceDebugInfo={voiceDebugInfo}
          />
          <CprMetronomeCard active={showCprMetronome} />
        </>
      )}
    </View>
  );
}
