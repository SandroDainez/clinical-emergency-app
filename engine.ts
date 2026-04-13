import { deriveAclsPresentation } from "./acls/presentation";
import { getElapsedTime, isCycleComplete } from "./acls/clinical-clock";
import type {
  AclsClinicalIntent,
  AclsCaseLogEntry,
  AclsDocumentationAction,
  AclsEffect,
  AclsLatencyEventCategory,
  AclsLatencyTrace,
  AclsOperationalMetrics,
  AclsPresentation,
  AclsPriority,
  AclsTimelineEvent,
} from "./acls/domain";
import { createAclsOrchestrator } from "./acls/orchestrator";
import {
  createInitialAclsState,
  getCurrentCueIdForAclsState,
  getDocumentationActionsForAclsState,
  resolveDynamicAclsProtocolState,
  type ACLSEvent,
  type ACLSState,
} from "./acls/reducer";

type StateType = "action" | "question" | "end";

type ClinicalLogEntry = {
  timestamp: number;
  kind:
    | "pcr_started"
    | "voice_command"
    | "cycle_started"
    | "cycle_completed"
    | "shock"
    | "action_executed"
    | "adrenaline_reminder"
    | "antiarrhythmic_reminder"
    | "advanced_airway"
    | "reversible_cause_update"
    | "rosc"
    | "encerramento";
  title: string;
  details?: string;
};

type ProtocolState = {
  type: StateType;
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
  timer?: number;
  suggestedNextStep?: {
    input: string;
    label: string;
    rationale?: string;
  };
};

type TimerState = {
  duration: number;
  remaining: number;
};

type EncounterSummary = {
  protocolId: string;
  durationLabel: string;
  currentStateId: string;
  currentStateText: string;
  shockCount: number;
  adrenalineSuggestedCount: number;
  adrenalineAdministeredCount: number;
  antiarrhythmicSuggestedCount: number;
  antiarrhythmicAdministeredCount: number;
  advancedAirwaySecured?: boolean;
  suspectedCauses: string[];
  addressedCauses: string[];
  lastEvents: string[];
  panelMetrics?: {
    label: string;
    value: string;
  }[];
  metrics?: {
    label: string;
    value: string;
  }[];
};

const RUNTIME_SCHEDULER_INTERVAL_MS = 100;
const MAX_LATENCY_TRACE_ENTRIES = 300;
const MAX_HISTORY_ENTRIES = 100;
// Pre-cue desabilitado (0): o estado avaliar_ritmo_preparo já dispara o mesmo
// áudio no momento certo. Com 10000ms o áudio disparava ~10s antes do fim do
// ciclo, confundindo a equipe antes da transição real de tela.
const RHYTHM_PRE_CUE_LEAD_MS = 0;
const runtimeSubscribers = new Set<() => void>();
let runtimeScheduler: ReturnType<typeof setInterval> | null = null;
let debugLatencyEnabled = false;
let latencyTraceSequence = 0;
let currentDispatchTraceId: string | undefined;
let pendingLatencyCommitTraceIds: string[] = [];
let latencyTraces: AclsLatencyTrace[] = [];
let sessionHistory: Array<{ state: ACLSState; caseLog: AclsCaseLogEntry[] }> = [];

function upsertLatencyTrace(
  traceId: string,
  updater: (trace: AclsLatencyTrace) => AclsLatencyTrace | void
) {
  if (!debugLatencyEnabled) {
    return;
  }

  const index = latencyTraces.findIndex((trace) => trace.id === traceId);
  if (index === -1) {
    return;
  }

  const current = latencyTraces[index];
  const updatedTrace = updater(current);
  let next: AclsLatencyTrace = current;
  if (updatedTrace) {
    next = updatedTrace;
  }
  latencyTraces[index] = {
    ...next,
    latencies: {
      eventToStateMs:
        next.stateCommittedAt !== undefined
          ? next.stateCommittedAt - next.eventReceivedAt
          : next.stateAppliedAt !== undefined
            ? next.stateAppliedAt - next.eventReceivedAt
            : undefined,
      stateToEnqueueSpeakMs:
        next.stateCommittedAt !== undefined && next.speakEnqueuedAt !== undefined
          ? next.speakEnqueuedAt - next.stateCommittedAt
          : next.stateAppliedAt !== undefined && next.speakEnqueuedAt !== undefined
            ? next.speakEnqueuedAt - next.stateAppliedAt
            : undefined,
      enqueueToPlayMs:
        next.speakEnqueuedAt !== undefined && next.speakPlayStartedAt !== undefined
          ? next.speakPlayStartedAt - next.speakEnqueuedAt
          : undefined,
      totalEndToEndMs:
        next.speakPlayStartedAt !== undefined
          ? next.speakPlayStartedAt - next.eventReceivedAt
          : undefined,
    },
  };
}

function classifyLatencyEvent(
  event: ACLSEvent,
  nextState?: ACLSState,
  speakKeys: string[] = []
): AclsLatencyEventCategory {
  const intent = nextState?.clinicalIntent;
  const actionId = "actionId" in event ? event.actionId : undefined;
  const input = "input" in event ? event.input : undefined;
  const medicationId = "medicationId" in event ? event.medicationId : undefined;

  if (
    actionId === "shock" ||
    input === "chocavel" ||
    intent === "deliver_shock" ||
    speakKeys.includes("shock")
  ) {
    return "shock";
  }

  if (intent === "analyze_rhythm" || speakKeys.includes("analyze_rhythm")) {
    return "rhythm";
  }

  if (
    actionId === "adrenaline" ||
    actionId === "antiarrhythmic" ||
    medicationId === "adrenaline" ||
    medicationId === "antiarrhythmic" ||
    intent === "give_epinephrine" ||
    intent === "give_antiarrhythmic" ||
    speakKeys.includes("epinephrine_now") ||
    speakKeys.includes("antiarrhythmic_now") ||
    speakKeys.includes("antiarrhythmic_repeat")
  ) {
    return "medication";
  }

  if (intent === "perform_cpr" || speakKeys.includes("start_cpr")) {
    return "cpr";
  }

  return "other";
}

function beginLatencyTrace(event: ACLSEvent) {
  if (!debugLatencyEnabled) {
    return undefined;
  }

  const traceId = `latency:${++latencyTraceSequence}:${now()}`;
  latencyTraces.push({
    id: traceId,
    eventType: event.type,
    eventCategory: classifyLatencyEvent(event),
    stateIdBefore: getSession().currentStateId,
    eventReceivedAt: now(),
    speakKeys: [],
    latencies: {},
  });

  if (latencyTraces.length > MAX_LATENCY_TRACE_ENTRIES) {
    latencyTraces = latencyTraces.slice(-MAX_LATENCY_TRACE_ENTRIES);
  }

  return traceId;
}

function handleReducerCompletedForLatency(
  nextState: ACLSState,
  effects: { type: string; key?: string }[],
  event: ACLSEvent
) {
  if (!debugLatencyEnabled || !currentDispatchTraceId) {
    return;
  }

  const speakKeys = effects
    .filter((effect) => effect.type === "SPEAK" && typeof effect.key === "string")
    .map((effect) => effect.key as string);

  upsertLatencyTrace(currentDispatchTraceId, (trace) => ({
    ...trace,
    reducerCompletedAt: now(),
    stateIdAfter: nextState.currentStateId,
    clinicalIntentAfter: nextState.clinicalIntent,
    eventCategory: classifyLatencyEvent(event, nextState, speakKeys),
    speakKeys,
  }));
}

function handleStateAppliedForLatency(state: ACLSState) {
  if (!debugLatencyEnabled || !currentDispatchTraceId) {
    return;
  }

  pendingLatencyCommitTraceIds.push(currentDispatchTraceId);
  upsertLatencyTrace(currentDispatchTraceId, (trace) => ({
    ...trace,
    stateAppliedAt: now(),
    stateIdAfter: state.currentStateId,
    clinicalIntentAfter: state.clinicalIntent,
  }));
}

const orchestrator = createAclsOrchestrator(createInitialAclsState(), {
  getCurrentDispatchTraceId: () => currentDispatchTraceId,
  onReducerCompleted: handleReducerCompletedForLatency,
  onStateApplied: handleStateAppliedForLatency,
});

function now() {
  return Date.now();
}

function getSession(): ACLSState {
  return orchestrator.getState();
}

function cloneSnapshot<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function pushHistorySnapshot() {
  sessionHistory.push({
    state: cloneSnapshot(getSession()),
    caseLog: cloneSnapshot(orchestrator.getCaseLog()),
  });

  if (sessionHistory.length > MAX_HISTORY_ENTRIES) {
    sessionHistory = sessionHistory.slice(-MAX_HISTORY_ENTRIES);
  }
}

function dispatch(event: ACLSEvent) {
  currentDispatchTraceId = beginLatencyTrace(event);
  try {
    pushHistorySnapshot();
    const result = orchestrator.dispatch(event);
    notifyRuntimeSubscribers();
    return result;
  } finally {
    currentDispatchTraceId = undefined;
  }
}

function notifyRuntimeSubscribers() {
  runtimeSubscribers.forEach((listener) => listener());
}

function stopRuntimeScheduler() {
  if (!runtimeScheduler) {
    return;
  }

  clearInterval(runtimeScheduler);
  runtimeScheduler = null;
}

function startRuntimeScheduler() {
  if (runtimeScheduler || runtimeSubscribers.size === 0) {
    return;
  }

  runtimeScheduler = setInterval(() => {
    tick();
    notifyRuntimeSubscribers();
  }, RUNTIME_SCHEDULER_INTERVAL_MS);
}

function subscribe(listener: () => void) {
  runtimeSubscribers.add(listener);
  listener();
  startRuntimeScheduler();

  return () => {
    runtimeSubscribers.delete(listener);
    if (runtimeSubscribers.size === 0) {
      stopRuntimeScheduler();
    }
  };
}

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getReferenceTimestamp() {
  const session = getSession();
  return session.protocolStartedAt ?? session.timeline[0]?.timestamp ?? now();
}

function getCurrentState(): ProtocolState {
  return resolveDynamicAclsProtocolState(getSession());
}

function getCurrentStateId() {
  return getSession().currentStateId;
}

function getCurrentCueId() {
  return getCurrentCueIdForAclsState(getSession());
}

function getClinicalIntent() {
  return getSession().clinicalIntent;
}

function getClinicalIntentConfidence() {
  return getSession().clinicalIntentConfidence;
}

function getTimers(): TimerState[] {
  const session = getSession();
  return session.timers.map((timer) => {
    const elapsed = getElapsedTime(session.clock, now()) / 1000;
    const remaining = Math.max(0, timer.duration - elapsed);

    return {
      duration: timer.duration,
      remaining: Math.ceil(remaining),
    };
  });
}

function getMedicationSnapshot() {
  const session = getSession();
  return {
    adrenaline: { ...session.medications.adrenaline },
    antiarrhythmic: { ...session.medications.antiarrhythmic },
  };
}

function getOperationalMetrics(): AclsOperationalMetrics {
  const session = getSession();
  const currentState = getCurrentState();
  const completedAt =
    currentState.type === "end"
      ? session.timeline[session.timeline.length - 1]?.timestamp ?? now()
      : undefined;
  const latestTimelineTimestamp = session.timeline[session.timeline.length - 1]?.timestamp;
  const baseNow = completedAt ?? now();
  const referenceNow =
    latestTimelineTimestamp !== undefined
      ? Math.max(baseNow, latestTimelineTimestamp)
      : baseNow;
  const adrenaline = session.medications.adrenaline;
  const nextEligibleTime = adrenaline.nextEligibleTime ?? adrenaline.nextDueAt;
  const lateAfterTime = adrenaline.lateAfterTime;
  const adrenalineTimingState =
    !adrenaline.eligible && adrenaline.administeredCount < 1
      ? "blocked"
      : adrenaline.pendingConfirmation && adrenaline.status === "pending_confirmation"
        ? "pending_confirmation"
        : adrenaline.pendingConfirmation || adrenaline.status === "due_now"
          ? "due_now"
          : lateAfterTime !== undefined && referenceNow >= lateAfterTime
            ? "late_due"
            : adrenaline.administeredCount >= 1 && nextEligibleTime !== undefined
              ? "future_due"
              : "blocked";
  const nextAdrenalineDueInMs =
    adrenalineTimingState !== "future_due" ||
    adrenaline.administeredCount < 1 ||
    nextEligibleTime === undefined
      ? undefined
      : Math.max(0, nextEligibleTime - referenceNow);
  const adrenalineLateByMs =
    adrenalineTimingState === "late_due" && lateAfterTime !== undefined
      ? Math.max(0, referenceNow - lateAfterTime)
      : undefined;

  return {
    totalPcrDurationMs: session.protocolStartedAt
      ? referenceNow - session.protocolStartedAt
      : undefined,
    timeSinceLastAdrenalineMs: session.clock.lastEpinephrineTime
      ? referenceNow - session.clock.lastEpinephrineTime
      : undefined,
    timeSinceLastShockMs: session.lastShockAt ? referenceNow - session.lastShockAt : undefined,
    cyclesCompleted: session.cycleCount,
    nextAdrenalineDueInMs,
    adrenalineTimingState,
    adrenalineLateByMs,
  };
}

function getDocumentationActions(): AclsDocumentationAction[] {
  return getDocumentationActionsForAclsState(getSession());
}

function getPresentation(): AclsPresentation {
  const session = getSession();
  return deriveAclsPresentation({
    clinicalIntent: session.clinicalIntent,
    clinicalIntentConfidence: session.clinicalIntentConfidence,
    stateId: session.currentStateId,
    state: getCurrentState(),
    cueId: getCurrentCueId(),
    documentationActions: getDocumentationActions(),
    activeTimer: getTimers()[0],
    medications: getMedicationSnapshot(),
  });
}

function getPriority(): AclsPriority {
  return getPresentation().banner?.priority ?? "monitor";
}

function getTimeline(): AclsTimelineEvent[] {
  const session = getSession();
  return [...session.timeline];
}

function getCaseLog(): AclsCaseLogEntry[] {
  return orchestrator.getCaseLog();
}

function getReversibleCauses() {
  const session = getSession();
  return Object.values(session.reversibleCauseRecords).map((record) => ({
    id: record.id,
    label: record.label,
    actions: [...record.actions],
    status: record.status,
    evidence: [...record.evidence],
    actionsTaken: [...record.actionsTaken],
    responseObserved: [...record.responseObserved],
  }));
}

function updateReversibleCauseStatus(
  causeId: string,
  status: "suspeita" | "abordada"
) {
  dispatch({
    type: "reversible_cause_status_updated",
    at: now(),
    causeId,
    status,
  });
  return getReversibleCauses();
}

function updateReversibleCauseNotes(
  causeId: string,
  field: "evidence" | "actionsTaken" | "responseObserved",
  value: string
) {
  dispatch({
    type: "reversible_cause_notes_updated",
    at: now(),
    causeId,
    field,
    value,
  });
  return getReversibleCauses();
}

function getClinicalLog(): ClinicalLogEntry[] {
  const session = getSession();
  return session.timeline
    .map((event): ClinicalLogEntry | null => {
      switch (event.type) {
        case "protocol_started":
          return {
            timestamp: event.timestamp,
            kind: "pcr_started",
            title: "PCR iniciada",
            details: "Protocolo ativado e compressões iniciadas",
          };
        case "timer_started":
          return {
            timestamp: event.timestamp,
            kind: "cycle_started",
            title: "Ciclo em andamento",
            details: `${event.details?.stateId ?? "estado"} • timer de ${event.details?.durationSeconds ?? "?"}s`,
          };
        case "timer_completed":
          return {
            timestamp: event.timestamp,
            kind: "cycle_completed",
            title: "Fim do ciclo",
            details: `${event.details?.stateId ?? "estado desconhecido"}`,
          };
        case "state_transitioned":
          if (event.details?.to === "pos_rosc") {
            return {
              timestamp: event.timestamp,
              kind: "rosc",
              title: "ROSC",
              details: "Retorno da circulação espontânea confirmado",
            };
          }
          if (event.details?.to === "encerrado") {
            return {
              timestamp: event.timestamp,
              kind: "encerramento",
              title: "Atendimento encerrado",
              details: "Encerramento conforme decisão do médico assistente",
            };
          }
          if (String(event.details?.to ?? "").startsWith("choque_")) {
            return {
              timestamp: event.timestamp,
              kind: "shock",
              title: "Choque indicado",
              details: String(event.details?.to),
            };
          }
          return null;
        case "voice_command": {
          const outcomeTitleMap: Record<string, string> = {
            executed: "Comando de voz executado",
            confirmation_requested: "Comando de voz aguardando confirmação",
            confirmation_confirmed: "Confirmação de voz aceita",
            confirmation_cancelled: "Confirmação de voz cancelada",
            confirmation_expired: "Confirmação de voz expirada",
            commands_presented: "Comandos de voz disponíveis",
            rejected: "Comando de voz não executado",
            unknown: "Comando de voz não reconhecido",
            mode_enabled: "Modo de voz ativado",
            mode_disabled: "Modo de voz desativado",
          };
          return {
            timestamp: event.timestamp,
            kind: "voice_command",
            title: outcomeTitleMap[String(event.details?.outcome ?? "rejected")] ?? "Evento de voz",
            details: [
              event.details?.intent ? `intent ${event.details.intent}` : "intent desconhecida",
              event.details?.actionTaken ? `ação ${event.details.actionTaken}` : "sem ação",
              event.details?.transcript ? `fala "${event.details.transcript}"` : undefined,
              event.details?.commands ? `comandos ${event.details.commands}` : undefined,
              event.details?.errorCategory ? `erro ${event.details.errorCategory}` : undefined,
              event.details?.confidence !== undefined
                ? `confiança ${event.details.confidence}`
                : undefined,
            ]
              .filter(Boolean)
              .join(" • "),
          };
        }
        case "shock_applied":
          return {
            timestamp: event.timestamp,
            kind: "action_executed",
            title: "Choque aplicado",
            details: `Choque ${event.details?.count ?? 1}`,
          };
        case "medication_due_now":
          if (event.details?.medicationId === "adrenaline") {
            return {
              timestamp: event.timestamp,
              kind: "adrenaline_reminder",
              title:
                Number(event.details?.count) === 1
                  ? "Primeira adrenalina sugerida"
                  : "Repetir adrenalina",
              details: "Administrar epinefrina 1 mg IV/IO",
            };
          }
          return {
            timestamp: event.timestamp,
            kind: "antiarrhythmic_reminder",
            title:
              Number(event.details?.count) === 1
                ? "Primeiro antiarrítmico sugerido"
                : "Segunda dose de antiarrítmico sugerida",
            details:
              Number(event.details?.count) === 1
                ? "Amiodarona 300 mg IV/IO ou lidocaína 1 a 1,5 mg/kg IV/IO"
                : "Amiodarona 150 mg IV/IO ou lidocaína 0,5 a 0,75 mg/kg IV/IO",
          };
        case "medication_administered":
          return {
            timestamp: event.timestamp,
            kind: "action_executed",
            title:
              event.details?.medicationId === "adrenaline"
                ? "Epinefrina administrada"
                : "Antiarrítmico administrado",
            details:
              event.details?.medicationId === "adrenaline"
                ? `${String(event.details?.doseLabel ?? "Epinefrina 1 mg IV/IO")} • dose ${event.details?.count ?? 1}`
                : `${String(event.details?.doseLabel ?? "Antiarrítmico")} • dose ${event.details?.count ?? 1}`,
          };
        case "advanced_airway_secured":
          return {
            timestamp: event.timestamp,
            kind: "advanced_airway",
            title: "Via aérea avançada registrada",
            details: "Intubação orotraqueal confirmada",
          };
        case "reversible_cause_updated": {
          const causeId = String(event.details?.causeId ?? "");
          const cause = session.reversibleCauseRecords[causeId];
          return {
            timestamp: event.timestamp,
            kind: "reversible_cause_update",
            title: "Causa reversível atualizada",
            details: `${cause?.label ?? causeId} • ${event.details?.status ?? "desconhecido"}`,
          };
        }
        case "rosc":
          return {
            timestamp: event.timestamp,
            kind: "rosc",
            title: "ROSC",
            details: "Retorno da circulação espontânea confirmado",
          };
        case "encerramento":
          return {
            timestamp: event.timestamp,
            kind: "encerramento",
            title: "Atendimento encerrado",
            details: "Encerramento conforme decisão do médico assistente",
          };
        default:
          return null;
      }
    })
    .filter((entry): entry is ClinicalLogEntry => Boolean(entry))
    .map((entry) => ({
      ...entry,
      details: entry.details
        ? `${formatElapsedTime(entry.timestamp - getReferenceTimestamp())} • ${entry.details}`
        : formatElapsedTime(entry.timestamp - getReferenceTimestamp()),
    }));
}

function getEncounterSummary(): EncounterSummary {
  const session = getSession();
  const causes = Object.values(session.reversibleCauseRecords);
  const operationalMetrics = getOperationalMetrics();
  const lastEvents = getClinicalLog()
    .slice(-5)
    .map((entry) => `${entry.title}${entry.details ? ` • ${entry.details}` : ""}`);

  return {
    protocolId: session.protocolId,
    durationLabel: formatElapsedTime(operationalMetrics.totalPcrDurationMs ?? 0),
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: session.deliveredShockCount,
    adrenalineSuggestedCount: session.medications.adrenaline.recommendedCount,
    adrenalineAdministeredCount: session.medications.adrenaline.administeredCount,
    antiarrhythmicSuggestedCount: session.medications.antiarrhythmic.recommendedCount,
    antiarrhythmicAdministeredCount: session.medications.antiarrhythmic.administeredCount,
    advancedAirwaySecured: session.advancedAirwaySecuredAt !== undefined,
    suspectedCauses: causes.filter((cause) => cause.status === "suspeita").map((cause) => cause.label),
    addressedCauses: causes.filter((cause) => cause.status === "abordada").map((cause) => cause.label),
    lastEvents,
    metrics: [
      { label: "Choques aplicados", value: String(session.deliveredShockCount) },
      {
        label: "Epinefrina",
        value: `${session.medications.adrenaline.administeredCount}/${session.medications.adrenaline.recommendedCount}`,
      },
      {
        label: "Antiarrítmico",
        value: `${session.medications.antiarrhythmic.administeredCount}/${session.medications.antiarrhythmic.recommendedCount}`,
      },
      {
        label: "Via aérea avançada",
        value: session.advancedAirwaySecuredAt !== undefined ? "Sim" : "Não",
      },
      {
        label: "Ciclos",
        value: String(operationalMetrics.cyclesCompleted),
      },
      {
        label: "Próx. epinefrina",
        value:
          operationalMetrics.nextAdrenalineDueInMs !== undefined
            ? `${Math.ceil(operationalMetrics.nextAdrenalineDueInMs / 1000)}s`
            : "N/A",
      },
    ],
  };
}

function getEncounterSummaryText() {
  const summary = getEncounterSummary();

  const lines = [
    "Resumo clínico do atendimento",
    `Protocolo: ${summary.protocolId}`,
    `Duração: ${summary.durationLabel}`,
    `Estado atual: ${summary.currentStateText} (${summary.currentStateId})`,
    `Choques aplicados: ${summary.shockCount}`,
    `Epinefrina sugerida: ${summary.adrenalineSuggestedCount}`,
    `Epinefrina administrada: ${summary.adrenalineAdministeredCount}`,
    `Antiarrítmico sugerido: ${summary.antiarrhythmicSuggestedCount}`,
    `Antiarrítmico administrado: ${summary.antiarrhythmicAdministeredCount}`,
    `Via aérea avançada: ${summary.advancedAirwaySecured ? "Sim" : "Não"}`,
    `Causas suspeitas: ${summary.suspectedCauses.length > 0 ? summary.suspectedCauses.join(", ") : "Nenhuma"}`,
    `Causas abordadas: ${summary.addressedCauses.length > 0 ? summary.addressedCauses.join(", ") : "Nenhuma"}`,
    "",
    "Últimos eventos:",
  ];

  for (const event of summary.lastEvents) {
    lines.push(`- ${event}`);
  }

  return lines.join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEncounterReportHtml() {
  const summary = getEncounterSummary();
  const clinicalLog = getClinicalLog().slice().reverse();
  const logItems = clinicalLog
    .map((entry) => {
      const details = entry.details ? `<div class="entry-details">${escapeHtml(entry.details)}</div>` : "";
      return `<div class="entry"><div class="entry-title">${escapeHtml(entry.title)}</div>${details}</div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório clínico - ${escapeHtml(summary.protocolId)}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #111827; margin: 32px; line-height: 1.45; }
      h1, h2 { margin: 0 0 12px; }
      .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
      .section { margin-top: 28px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; }
      .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
      .value { font-size: 16px; font-weight: 700; margin-top: 2px; }
      .entry { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; }
      .entry-title { font-size: 15px; font-weight: 700; }
      .entry-details { font-size: 14px; color: #374151; margin-top: 4px; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <div class="eyebrow">Apoio à decisão clínica</div>
    <h1>Relatório clínico do atendimento</h1>
    <div class="section grid">
      <div><div class="label">Protocolo</div><div class="value">${escapeHtml(summary.protocolId)}</div></div>
      <div><div class="label">Duração</div><div class="value">${escapeHtml(summary.durationLabel)}</div></div>
      <div><div class="label">Estado atual</div><div class="value">${escapeHtml(summary.currentStateText)}</div></div>
      <div><div class="label">Identificador</div><div class="value">${escapeHtml(summary.currentStateId)}</div></div>
      <div><div class="label">Choques aplicados</div><div class="value">${summary.shockCount}</div></div>
      <div><div class="label">Epinefrina</div><div class="value">${summary.adrenalineAdministeredCount} administradas / ${summary.adrenalineSuggestedCount} sugeridas</div></div>
      <div><div class="label">Antiarrítmico</div><div class="value">${summary.antiarrhythmicAdministeredCount} administrados / ${summary.antiarrhythmicSuggestedCount} sugeridos</div></div>
    </div>
    <div class="section">
      <h2>Log clínico</h2>
      ${logItems || "<div class=\"entry\"><div class=\"entry-details\">Nenhum evento clínico registrado.</div></div>"}
    </div>
  </body>
</html>`;
}

function getCaseLogExport() {
  return JSON.stringify(
    {
      protocolId: getSession().protocolId,
      generatedAt: now(),
      entries: getCaseLog(),
    },
    null,
    2
  );
}

function setDebugLatencyEnabled(enabled: boolean) {
  debugLatencyEnabled = enabled;
  if (!enabled) {
    latencyTraces = [];
    pendingLatencyCommitTraceIds = [];
    currentDispatchTraceId = undefined;
  }
}

function clearLatencyMetrics() {
  latencyTraces = [];
  pendingLatencyCommitTraceIds = [];
}

function markLatencyStateCommitted() {
  if (!debugLatencyEnabled || pendingLatencyCommitTraceIds.length === 0) {
    return;
  }

  const committedAt = now();
  const traceIds = [...pendingLatencyCommitTraceIds];
  pendingLatencyCommitTraceIds = [];
  traceIds.forEach((traceId) => {
    upsertLatencyTrace(traceId, (trace) => ({
      ...trace,
      stateCommittedAt: trace.stateCommittedAt ?? committedAt,
    }));
  });
}

function recordLatencySpeakEnqueued(traceId: string, speakKey: string) {
  if (!debugLatencyEnabled) {
    return;
  }

  upsertLatencyTrace(traceId, (trace) => ({
    ...trace,
    speakEnqueuedAt: trace.speakEnqueuedAt ?? now(),
    speakKeys: trace.speakKeys.includes(speakKey) ? trace.speakKeys : [...trace.speakKeys, speakKey],
  }));
}

function recordLatencyPlaybackStarted(traceId: string, speakKey: string) {
  if (!debugLatencyEnabled) {
    return;
  }

  upsertLatencyTrace(traceId, (trace) => ({
    ...trace,
    speakPlayStartedAt: trace.speakPlayStartedAt ?? now(),
    speakKeys: trace.speakKeys.includes(speakKey) ? trace.speakKeys : [...trace.speakKeys, speakKey],
  }));
}

function getLatencyMetrics() {
  return latencyTraces.map((trace) => ({
    ...trace,
    speakKeys: [...trace.speakKeys],
    latencies: { ...trace.latencies },
  }));
}

function getLatencyMetricsExport() {
  return JSON.stringify(
    {
      protocolId: getSession().protocolId,
      debugLatencyEnabled,
      generatedAt: now(),
      traces: getLatencyMetrics(),
    },
    null,
    2
  );
}

function isDebugLatencyEnabled() {
  return debugLatencyEnabled;
}

function consumeEffects(): AclsEffect[] {
  return orchestrator.consumeEffects();
}

function maybeDispatchAdrenalineReminder(currentTime: number) {
  const session = getSession();
  const adrenaline = session.medications.adrenaline;
  const nextEligibleTime = adrenaline.nextEligibleTime ?? adrenaline.nextDueAt;
  const isAdrenalineEligibleState =
    session.currentStateId === "nao_chocavel_epinefrina" ||
    session.currentStateId === "nao_chocavel_ciclo" ||
    session.currentStateId === "rcp_2" ||
    session.currentStateId === "rcp_3";

  if (
    !nextEligibleTime ||
    currentTime < nextEligibleTime ||
    adrenaline.administeredCount < 1 ||
    adrenaline.pendingConfirmation ||
    !isAdrenalineEligibleState
  ) {
    return;
  }

  dispatch({
    type: "medication_reminder_due",
    at: currentTime,
    medicationId: "adrenaline",
  });
}

function maybeDispatchCyclePreCue(currentTime: number) {
  const session = getSession();
  const activeTimer = session.timers[0];
  const nextRhythmCheck = session.clock.nextRhythmCheck;

  if (
    !activeTimer ||
    activeTimer.completed ||
    nextRhythmCheck === undefined ||
    currentTime < nextRhythmCheck - RHYTHM_PRE_CUE_LEAD_MS ||
    currentTime >= nextRhythmCheck
  ) {
    return;
  }

  dispatch({
    type: "pre_cue_due",
    at: currentTime,
    kind: "prepare_rhythm",
    source: "time",
    timerId: activeTimer.id,
  });
}

function tick() {
  const session = getSession();
  const currentTime = now();
  const activeTimer = session.timers[0];

  maybeDispatchCyclePreCue(currentTime);

  if (activeTimer && !activeTimer.completed && isCycleComplete(session.clock, currentTime)) {
      dispatch({
        type: "timer_elapsed",
        at: currentTime,
        timerId: activeTimer.id,
      });
  }

  maybeDispatchAdrenalineReminder(currentTime);

  return getCurrentState();
}

function next(input?: string) {
  const state = getCurrentState();

  if (state.type === "action") {
    dispatch({ type: "action_confirmed", at: now() });
    const nextState = getCurrentState();
    if (input && nextState.type === "question") {
      dispatch({
        type: "question_answered",
        at: now(),
        input,
      });
      return getCurrentState();
    }
    return nextState;
  }

  if (state.type === "question") {
    if (!input) {
      throw new Error("Resposta necessária");
    }

    dispatch({
      type: "question_answered",
      at: now(),
      input,
    });
  }

  return getCurrentState();
}

function registerExecution(actionId: AclsDocumentationAction["id"]) {
  dispatch({
    type: "execution_recorded",
    at: now(),
    actionId,
  });
  return getClinicalLog();
}

function canGoBack() {
  return sessionHistory.length > 0;
}

function goBack() {
  if (!canGoBack()) {
    return getCurrentState();
  }

  const currentState = getSession();
  let previousSnapshot = sessionHistory.pop();

  while (
    previousSnapshot &&
    previousSnapshot.state.currentStateId === currentState.currentStateId &&
    previousSnapshot.state.stateEntrySequence === currentState.stateEntrySequence &&
    sessionHistory.length > 0
  ) {
    previousSnapshot = sessionHistory.pop();
  }

  if (!previousSnapshot) {
    return getCurrentState();
  }

  currentDispatchTraceId = undefined;
  pendingLatencyCommitTraceIds = [];
  orchestrator.restore(previousSnapshot.state, previousSnapshot.caseLog);
  notifyRuntimeSubscribers();
  return getCurrentState();
}

function resetSession() {
  orchestrator.reset();
  sessionHistory = [];
  pendingLatencyCommitTraceIds = [];
  currentDispatchTraceId = undefined;
  notifyRuntimeSubscribers();
  return getCurrentState();
}

function registerVoiceCommandEvent(entry: {
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
  errorCategory?: string;
}) {
  dispatch({
    type: "voice_command_logged",
    at: now(),
    transcript: entry.transcript,
    intent: entry.intent,
    confidence: entry.confidence,
    outcome: entry.outcome,
    actionTaken: entry.actionTaken,
    commands: entry.commands,
    errorCategory: entry.errorCategory,
  });
}

function registerAssistantInsightEvent(entry: {
  kind:
    | "ranking_generated"
    | "priority_changed"
    | "missing_data_highlighted"
    | "top_three_presented";
  summary: string;
  stateId: string;
  details?: Record<string, string | number | boolean | null | undefined>;
}) {
  dispatch({
    type: "assistant_insight_logged",
    at: now(),
    kind: entry.kind,
    summary: entry.summary,
    stateId: entry.stateId,
    details: entry.details,
  });
}

export type { ACLSEvent, ACLSState };

export {
  clearLatencyMetrics,
  getCaseLog,
  getCaseLogExport,
  goBack,
  getClinicalIntent,
  getClinicalIntentConfidence,
  canGoBack,
  consumeEffects,
  getClinicalLog,
  getCurrentCueId,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getLatencyMetrics,
  getLatencyMetricsExport,
  isDebugLatencyEnabled,
  getMedicationSnapshot,
  getOperationalMetrics,
  getPresentation,
  getPriority,
  getReversibleCauses,
  getTimeline,
  getTimers,
  markLatencyStateCommitted,
  next,
  recordLatencyPlaybackStarted,
  recordLatencySpeakEnqueued,
  setDebugLatencyEnabled,
  subscribe,
  registerAssistantInsightEvent,
  registerVoiceCommandEvent,
  registerExecution,
  resetSession,
  tick,
  updateReversibleCauseNotes,
  updateReversibleCauseStatus,
};
