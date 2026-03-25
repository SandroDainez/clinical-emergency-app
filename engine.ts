import { aclsProtocol } from "./acls/protocol-runtime";
import { deriveAclsPresentation } from "./acls/presentation";
import type {
  AclsDocumentationAction,
  AclsEffect,
  AclsMedicationTracker,
  AclsMode,
  AclsOperationalMetrics,
  AclsPresentation,
  AclsPriority,
  AclsReversibleCauseRecord,
  AclsTimelineEvent,
} from "./acls/domain";
import type { AclsProtocolState } from "./acls/protocol-schema";

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

type Timer = {
  id: string;
  startedAt: number;
  duration: number;
  stateId: string;
  nextStateId?: string;
  completed: boolean;
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

type ClinicalSession = {
  protocolId: string;
  currentStateId: string;
  algorithmBranch: "recognition" | "shockable" | "nonshockable" | "post_rosc" | "ended";
  currentRhythm: "unknown" | "shockable" | "nonshockable" | "organized" | "rosc";
  timeline: AclsTimelineEvent[];
  timers: Timer[];
  pendingEffects: AclsEffect[];
  protocolStartedAt?: number;
  stateEntrySequence: number;
  documentedExecutionKeys: string[];
  defibrillatorType?: "bifasico" | "monofasico";
  deliveredShockCount: number;
  lastShockAt?: number;
  cycleCount: number;
  medications: Record<"adrenaline" | "antiarrhythmic", AclsMedicationTracker>;
  antiarrhythmicReminderStage: 0 | 1 | 2;
  advancedAirwaySecuredAt?: number;
  reversibleCauseRecords: Record<string, AclsReversibleCauseRecord>;
};

const ADRENALINE_REMINDER_INTERVAL_MS = 4 * 60 * 1000;

function createMedicationTracker(
  id: "adrenaline" | "antiarrhythmic"
): AclsMedicationTracker {
  return {
    id,
    status: "idle",
    recommendedCount: 0,
    administeredCount: 0,
    pendingConfirmation: false,
    eligible: false,
  };
}

function createReversibleCauseRecords() {
  return Object.fromEntries(
    (aclsProtocol.reversibleCauses ?? []).map((cause) => [
      cause.id,
      {
        ...cause,
        status: "pendente" as const,
        suspected: false,
        evidence: [],
        actionsTaken: [],
        responseObserved: [],
      },
    ])
  );
}

function createSession(): ClinicalSession {
  return {
    protocolId: aclsProtocol.id,
    currentStateId: aclsProtocol.initialState,
    algorithmBranch: "recognition",
    currentRhythm: "unknown",
    timeline: [],
    timers: [],
    pendingEffects: [],
    stateEntrySequence: 0,
    documentedExecutionKeys: [],
    deliveredShockCount: 0,
    cycleCount: 0,
    medications: {
      adrenaline: createMedicationTracker("adrenaline"),
      antiarrhythmic: createMedicationTracker("antiarrhythmic"),
    },
    antiarrhythmicReminderStage: 0,
    reversibleCauseRecords: createReversibleCauseRecords(),
  };
}

let session = createSession();

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function now() {
  return Date.now();
}

function getReferenceTimestamp() {
  return session.protocolStartedAt ?? session.timeline[0]?.timestamp ?? now();
}

function createTimelineEvent(
  type: AclsTimelineEvent["type"],
  origin: AclsTimelineEvent["origin"],
  details?: AclsTimelineEvent["details"]
) {
  return {
    id: `${type}:${session.timeline.length + 1}:${now()}`,
    timestamp: now(),
    type,
    stateId: session.currentStateId,
    origin,
    details,
  } satisfies AclsTimelineEvent;
}

function appendTimelineEvent(
  type: AclsTimelineEvent["type"],
  origin: AclsTimelineEvent["origin"],
  details?: AclsTimelineEvent["details"]
) {
  const event = createTimelineEvent(type, origin, details);
  session.timeline.push(event);
  session.pendingEffects.push({ type: "log_event", eventId: event.id });
  return event;
}

function enqueueEffect(effect: AclsEffect) {
  session.pendingEffects.push(effect);
}

function getBaseState(stateId = session.currentStateId): AclsProtocolState {
  const state = aclsProtocol.states[stateId];

  if (!state) {
    throw new Error(`Estado inválido: ${stateId}`);
  }

  return state;
}

function resolveDynamicState(stateId = session.currentStateId): AclsProtocolState {
  const state = getBaseState(stateId);

  if (stateId === "choque_2") {
    const isMonophasic = session.defibrillatorType === "monofasico";
    return {
      ...state,
      text: "Aplicar choque",
      speak: isMonophasic
        ? "Aplicar o choque agora. Monofásico, trezentos e sessenta joules"
        : "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior que a anterior",
      details: isMonophasic
        ? [
            "Monofásico: 360 joules",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ]
        : [
            "Bifásico: usar dose equivalente ou maior que a anterior; considerar escalonamento",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ],
    };
  }

  if (stateId === "choque_3") {
    const isMonophasic = session.defibrillatorType === "monofasico";
    return {
      ...state,
      text: "Aplicar choque",
      speak: isMonophasic
        ? "Aplicar o choque agora. Monofásico, trezentos e sessenta joules"
        : "Aplicar o choque agora. Bifásico, usar carga equivalente ou maior e considerar escalonamento",
      details: isMonophasic
        ? [
            "Monofásico: 360 joules",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ]
        : [
            "Bifásico: usar dose equivalente ou maior; considerar escalonamento",
            "Aplicar choque",
            "Retomar RCP imediatamente por 2 minutos",
            "Não verificar pulso logo após o choque",
          ],
    };
  }

  return state;
}

function getCurrentState(): ProtocolState {
  return resolveDynamicState();
}

function getCurrentStateId() {
  return session.currentStateId;
}

function getCurrentCueId() {
  if (session.currentStateId === "choque_2") {
    return session.defibrillatorType === "monofasico"
      ? "choque_2_monofasico"
      : "choque_2_bifasico";
  }

  if (session.currentStateId === "choque_3") {
    return session.defibrillatorType === "monofasico"
      ? "choque_3_monofasico"
      : "choque_3_bifasico";
  }

  return session.currentStateId;
}

function getTimers() {
  return session.timers.map((timer) => {
    const elapsed = (now() - timer.startedAt) / 1000;
    const remaining = Math.max(0, timer.duration - elapsed);

    return {
      duration: timer.duration,
      remaining: Math.ceil(remaining),
    };
  });
}

function getMedicationSnapshot() {
  return {
    adrenaline: { ...session.medications.adrenaline },
    antiarrhythmic: { ...session.medications.antiarrhythmic },
  };
}

function getOperationalMetrics(): AclsOperationalMetrics {
  return {
    totalPcrDurationMs: session.protocolStartedAt ? now() - session.protocolStartedAt : undefined,
    timeSinceLastAdrenalineMs: session.medications.adrenaline.lastAdministeredAt
      ? now() - session.medications.adrenaline.lastAdministeredAt
      : undefined,
    timeSinceLastShockMs: session.lastShockAt ? now() - session.lastShockAt : undefined,
    cyclesCompleted: session.cycleCount,
    nextAdrenalineDueInMs: session.medications.adrenaline.nextDueAt
      ? Math.max(0, session.medications.adrenaline.nextDueAt - now())
      : undefined,
  };
}

function getDocumentationActions(): AclsDocumentationAction[] {
  const actions: AclsDocumentationAction[] = [];

  if (session.currentStateId.startsWith("choque_")) {
    actions.push({ id: "shock", label: "Registrar choque aplicado" });
  }

  const adrenaline = session.medications.adrenaline;
  if (
    adrenaline.pendingConfirmation &&
    [
      "nao_chocavel_epinefrina",
      "nao_chocavel_ciclo",
      "nao_chocavel_hs_ts",
      "avaliar_ritmo_nao_chocavel",
      "rcp_2",
      "rcp_3",
      "avaliar_ritmo_3",
    ].includes(session.currentStateId)
  ) {
    actions.push({ id: "adrenaline", label: "Registrar epinefrina administrada" });
  }

  const antiarrhythmic = session.medications.antiarrhythmic;
  if (
    antiarrhythmic.pendingConfirmation &&
    ["rcp_3", "avaliar_ritmo_3"].includes(session.currentStateId)
  ) {
    actions.push({ id: "antiarrhythmic", label: "Registrar antiarrítmico administrado" });
  }

  return actions;
}

function getPresentation(mode: AclsMode = "training"): AclsPresentation {
  return deriveAclsPresentation({
    mode,
    stateId: session.currentStateId,
    state: getCurrentState(),
    cueId: getCurrentCueId(),
    documentationActions: getDocumentationActions(),
    activeTimer: getTimers()[0],
    medications: getMedicationSnapshot(),
  });
}

function getPriority() {
  return getPresentation("training").banner?.priority ?? "monitor";
}

function getTimeline() {
  return [...session.timeline];
}

function getReversibleCauses() {
  return Object.values(session.reversibleCauseRecords).map((record) => ({
    id: record.id,
    label: record.label,
    actions: record.actions,
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
  const record = session.reversibleCauseRecords[causeId];

  if (!record) {
    appendTimelineEvent("guard_rail_triggered", "user", {
      issue: `reversible_cause_not_found:${causeId}`,
    });
    throw new Error(`Causa reversível inválida: ${causeId}`);
  }

  record.status = status;
  record.suspected = status === "suspeita";
  if (status === "abordada") {
    record.actionsTaken = record.actions.length > 0 ? [...record.actions] : record.actionsTaken;
  }

  appendTimelineEvent("reversible_cause_updated", "user", {
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
  const record = session.reversibleCauseRecords[causeId];

  if (!record) {
    appendTimelineEvent("guard_rail_triggered", "user", {
      issue: `reversible_cause_not_found:${causeId}`,
    });
    throw new Error(`Causa reversível inválida: ${causeId}`);
  }

  const normalizedItems = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  record[field] = normalizedItems;

  appendTimelineEvent("reversible_cause_updated", "user", {
    causeId,
    field,
    count: normalizedItems.length,
  });

  return getReversibleCauses();
}

function getClinicalLog(): ClinicalLogEntry[] {
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
        case "voice_command":
          {
            const outcomeTitleMap: Record<string, string> = {
              executed: "Comando de voz executado",
              confirmation_requested: "Comando de voz aguardando confirmação",
              confirmation_confirmed: "Confirmação de voz aceita",
              confirmation_cancelled: "Confirmação de voz cancelada",
              confirmation_expired: "Confirmação de voz expirada",
              commands_presented: "Comandos de voz disponíveis",
              rejected: "Comando de voz não executado",
              unknown: "Comando de voz não reconhecido",
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
              event.details?.errorCategory
                ? `erro ${event.details.errorCategory}`
                : undefined,
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
              title: Number(event.details?.count) === 1 ? "Primeira adrenalina sugerida" : "Repetir adrenalina",
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
  const causes = Object.values(session.reversibleCauseRecords);
  const operationalMetrics = getOperationalMetrics();
  const lastEvents = getClinicalLog()
    .slice(-5)
    .map((entry) => `${entry.title}${entry.details ? ` • ${entry.details}` : ""}`);

  return {
    protocolId: session.protocolId,
    durationLabel: formatElapsedTime((operationalMetrics.totalPcrDurationMs ?? 0)),
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

function startTimer(duration: number, stateId: string, nextStateId?: string) {
  const timer: Timer = {
    id: `timer:${stateId}:${now()}`,
    startedAt: now(),
    duration,
    stateId,
    nextStateId,
    completed: false,
  };

  session.timers = [timer];
  enqueueEffect({
    type: "start_timer",
    timerId: timer.id,
    durationSeconds: duration,
    stateId,
    nextStateId,
  });
  appendTimelineEvent("timer_started", "system", {
    durationSeconds: duration,
    stateId,
    nextStateId,
  });
}

function consumeEffects() {
  const effects = [...session.pendingEffects];
  session.pendingEffects = [];
  return effects;
}

function getMedicationDoseLabel(
  medicationId: "adrenaline" | "antiarrhythmic",
  count: number
) {
  if (medicationId === "adrenaline") {
    return "Epinefrina 1 mg IV/IO";
  }

  return count <= 1
    ? "Amiodarona 300 mg IV/IO ou lidocaína 1 a 1,5 mg/kg IV/IO"
    : "Amiodarona 150 mg IV/IO ou lidocaína 0,5 a 0,75 mg/kg IV/IO";
}

function canRemindAdrenaline() {
  return [
    "nao_chocavel_epinefrina",
    "nao_chocavel_ciclo",
    "nao_chocavel_hs_ts",
    "rcp_2",
    "rcp_3",
    "avaliar_ritmo_nao_chocavel",
    "avaliar_ritmo_3",
  ].includes(session.currentStateId);
}

function recommendMedication(
  medicationId: "adrenaline" | "antiarrhythmic",
  title: string,
  message: string,
  intervalMs?: number
) {
  const medication = session.medications[medicationId];
  medication.eligible = true;
  medication.status = "due_now";
  medication.pendingConfirmation = true;
  medication.recommendedCount += 1;
  medication.lastRecommendedAt = now();
  if (intervalMs) {
    medication.dueIntervalMs = intervalMs;
    medication.nextDueAt = now() + intervalMs;
  }

  enqueueEffect({
    type: "recommend_medication",
    medicationId,
    title,
    message,
  });
  enqueueEffect({
    type: "mark_medication_due_now",
    medicationId,
    title,
    message,
  });
  enqueueEffect({
    type: "alert",
    title,
    message,
  });
  enqueueEffect({
    type: "play_audio_cue",
    cueId:
      medicationId === "adrenaline"
        ? "reminder_epinefrina"
        : medication.recommendedCount === 1
          ? "reminder_antiarritmico_1"
          : "reminder_antiarritmico_2",
    message,
  });

  appendTimelineEvent("medication_due_now", "system", {
    medicationId,
    count: medication.recommendedCount,
  });

  if (intervalMs) {
    const nextDueAt = medication.nextDueAt ?? now() + intervalMs;
    medication.nextDueAt = nextDueAt;
    enqueueEffect({
      type: "schedule_recurring_reminder",
      medicationId,
      nextDueAt,
      intervalMs,
    });
    appendTimelineEvent("medication_scheduled", "system", {
      medicationId,
      nextDueAt,
      intervalMs,
    });
  }
}

function triggerInitialAdrenalineReminder() {
  if (session.medications.adrenaline.recommendedCount > 0) {
    return;
  }

  recommendMedication(
    "adrenaline",
    "Epinefrina agora",
    "Administrar epinefrina 1 mg IV IO",
    ADRENALINE_REMINDER_INTERVAL_MS
  );
}

function updateAdrenalineReminder() {
  const adrenaline = session.medications.adrenaline;

  if (!canRemindAdrenaline() || !adrenaline.nextDueAt) {
    return;
  }

  if (now() >= adrenaline.nextDueAt) {
    recommendMedication(
      "adrenaline",
      "Epinefrina agora",
      "Administrar epinefrina 1 mg IV IO",
      ADRENALINE_REMINDER_INTERVAL_MS
    );
  }
}

function updateAntiarrhythmicReminder() {
  if (session.currentStateId !== "rcp_3") {
    return;
  }

  if (session.antiarrhythmicReminderStage === 0) {
    session.antiarrhythmicReminderStage = 1;
    recommendMedication(
      "antiarrhythmic",
      "Antiarrítmico agora",
      "Considerar antiarrítmico: amiodarona 300 mg IV IO ou lidocaína 1 a 1,5 mg por kg IV IO"
    );
    return;
  }

  if (session.antiarrhythmicReminderStage === 1) {
    session.antiarrhythmicReminderStage = 2;
    recommendMedication(
      "antiarrhythmic",
      "Antiarrítmico agora",
      "Se persistir ritmo chocável, considerar nova dose de antiarrítmico: amiodarona 150 mg IV IO ou lidocaína 0,5 a 0,75 mg por kg IV IO"
    );
  }
}

function setAlgorithmContextForState(stateId: string) {
  if (stateId.startsWith("pos_rosc")) {
    session.algorithmBranch = "post_rosc";
    session.currentRhythm = "rosc";
    return;
  }

  if (stateId === "encerrado") {
    session.algorithmBranch = "ended";
    return;
  }

  if (
    [
      "choque_bi_1",
      "choque_mono_1",
      "rcp_1",
      "choque_2",
      "rcp_2",
      "choque_3",
      "rcp_3",
    ].includes(stateId)
  ) {
    session.algorithmBranch = "shockable";
    session.currentRhythm = "shockable";
    return;
  }

  if (
    [
      "nao_chocavel_epinefrina",
      "nao_chocavel_ciclo",
      "avaliar_ritmo_nao_chocavel",
      "nao_chocavel_hs_ts",
    ].includes(stateId)
  ) {
    session.algorithmBranch = "nonshockable";
    session.currentRhythm = "nonshockable";
    return;
  }

  session.algorithmBranch = "recognition";
}

function handleStateEntry(stateId: string) {
  setAlgorithmContextForState(stateId);

  if (stateId === "nao_chocavel_epinefrina" || stateId === "rcp_2") {
    triggerInitialAdrenalineReminder();
  } else {
    updateAdrenalineReminder();
  }

  updateAntiarrhythmicReminder();

  const presentation = getPresentation("training");
  if (presentation.banner) {
    enqueueEffect({
      type: "show_priority_banner",
      priority: presentation.banner.priority,
      title: presentation.banner.title,
      detail: presentation.banner.detail,
    });
  }

  const enteredState = resolveDynamicState(stateId);
  if (enteredState.type === "action" && enteredState.timer) {
    const activeTimer = session.timers[0];
    if (!activeTimer || activeTimer.stateId !== stateId || activeTimer.completed) {
      startTimer(enteredState.timer, stateId, enteredState.next);
    }
  }
}

function transitionToState(stateId: string, reason: string, data?: Record<string, string>) {
  session.currentStateId = stateId;
  session.stateEntrySequence += 1;
  appendTimelineEvent("state_transitioned", "system", {
    reason,
    to: stateId,
    ...data,
  });

  if (stateId === "pos_rosc") {
    appendTimelineEvent("rosc", "system");
  }

  if (stateId === "encerrado") {
    appendTimelineEvent("encerramento", "system");
  }

  handleStateEntry(stateId);
}

function resolveShockStateFromHistory() {
  if (!session.defibrillatorType) {
    return "tipo_desfibrilador";
  }

  if (session.deliveredShockCount <= 0) {
    return session.defibrillatorType === "monofasico" ? "choque_mono_1" : "choque_bi_1";
  }

  if (session.deliveredShockCount === 1) {
    return "choque_2";
  }

  return "choque_3";
}

function normalizeInput(input: string) {
  return input.trim().toLowerCase();
}

function resolveNextStateId(options: Record<string, string> | undefined, input: string) {
  if (!options) {
    return undefined;
  }

  const normalizedInput = normalizeInput(input);

  for (const [key, nextStateId] of Object.entries(options)) {
    if (normalizeInput(key) === normalizedInput) {
      return nextStateId;
    }
  }

  return undefined;
}

function tick() {
  const activeTimer = session.timers[0];

  if (!activeTimer || activeTimer.completed) {
    updateAdrenalineReminder();
    return getCurrentState();
  }

  const elapsed = (now() - activeTimer.startedAt) / 1000;
  if (elapsed < activeTimer.duration) {
    updateAdrenalineReminder();
    return getCurrentState();
  }

  activeTimer.completed = true;
  session.timers = [];
  session.cycleCount += 1;

  appendTimelineEvent("timer_completed", "system", {
    stateId: activeTimer.stateId,
    nextStateId: activeTimer.nextStateId,
  });
  appendTimelineEvent("reassessment_due", "system", {
    stateId: activeTimer.stateId,
  });
  enqueueEffect({
    type: "alert",
    title: "Tempo esgotado",
    message: "Reavaliar ritmo.",
  });
  enqueueEffect({
    type: "play_audio_cue",
    cueId: "reminder_reavaliar_ritmo",
    message: "Reavaliar ritmo",
    suppressStateSpeech: true,
  });

  if (activeTimer.nextStateId) {
    transitionToState(activeTimer.nextStateId, "STATE_AUTO_ADVANCED");
  }

  updateAdrenalineReminder();

  return getCurrentState();
}

function next(input?: string) {
  const state = getCurrentState();

  if (state.type === "action") {
    appendTimelineEvent("action_confirmed", "user", {
      stateId: session.currentStateId,
    });

    if (session.protocolStartedAt === undefined) {
      session.protocolStartedAt = now();
      appendTimelineEvent("protocol_started", "system");
    }

    if (state.timer) {
      const activeTimer = session.timers[0];
      if (!activeTimer || activeTimer.stateId !== session.currentStateId || activeTimer.completed) {
        startTimer(state.timer, session.currentStateId, state.next);
      }
      return getCurrentState();
    }

    if (state.next) {
      transitionToState(state.next, "STATE_TRANSITIONED");
    }

    return getCurrentState();
  }

  if (state.type === "question") {
    if (!input) {
      throw new Error("Resposta necessária");
    }

    const normalizedInput = normalizeInput(input);
    const nextState = resolveNextStateId(state.options, normalizedInput);

    if (!nextState) {
      appendTimelineEvent("guard_rail_triggered", "user", {
        issue: "invalid_question_answer",
        input: normalizedInput,
      });
      throw new Error(`Resposta inválida: ${input}`);
    }

    if (session.currentStateId === "tipo_desfibrilador") {
      session.defibrillatorType = normalizedInput === "monofasico" ? "monofasico" : "bifasico";
    }

    if (normalizedInput === "nao_chocavel") {
      session.currentRhythm = "nonshockable";
      session.algorithmBranch = "nonshockable";
    } else if (normalizedInput === "chocavel") {
      session.currentRhythm = "shockable";
      session.algorithmBranch = "shockable";
    } else if (normalizedInput === "rosc") {
      session.currentRhythm = "rosc";
      session.algorithmBranch = "post_rosc";
    }

    let resolvedNextState = nextState;
    if (normalizedInput === "chocavel") {
      resolvedNextState = resolveShockStateFromHistory();
    }

    appendTimelineEvent("question_answered", "user", {
      input: normalizedInput,
    });
    transitionToState(resolvedNextState, "QUESTION_TRANSITIONED", { input: normalizedInput });
  }

  return getCurrentState();
}

function registerExecution(actionId: AclsDocumentationAction["id"]) {
  if (actionId === "advanced_airway") {
    if (session.advancedAirwaySecuredAt !== undefined) {
      appendTimelineEvent("guard_rail_triggered", "user", {
        issue: "duplicate_advanced_airway",
        actionId,
      });
      throw new Error("Intubação já registrada neste caso");
    }

    session.advancedAirwaySecuredAt = now();
    appendTimelineEvent("advanced_airway_secured", "user", {
      airwayType: "intubacao_orotraqueal",
    });
    return getClinicalLog();
  }

  const availableAction = getDocumentationActions().find((action) => action.id === actionId);

  if (!availableAction) {
    appendTimelineEvent("guard_rail_triggered", "user", {
      issue: "action_not_available",
      actionId,
    });
    throw new Error("Registro não disponível para o estado atual");
  }

  const executionKey = `${session.stateEntrySequence}:${actionId}`;
  if (session.documentedExecutionKeys.includes(executionKey)) {
    appendTimelineEvent("guard_rail_triggered", "user", {
      issue: "duplicate_confirmation",
      actionId,
    });
    throw new Error("Conduta já registrada neste ciclo");
  }

  session.documentedExecutionKeys.push(executionKey);

  if (actionId === "shock") {
    session.deliveredShockCount += 1;
    session.lastShockAt = now();
    appendTimelineEvent("shock_applied", "user", {
      count: session.deliveredShockCount,
      defibrillatorType: session.defibrillatorType,
    });
    return getClinicalLog();
  }

  if (actionId === "adrenaline") {
    const medication = session.medications.adrenaline;
    medication.administeredCount += 1;
    medication.lastAdministeredAt = now();
    medication.pendingConfirmation = false;
    medication.status = "administered";
    medication.nextDueAt = now() + ADRENALINE_REMINDER_INTERVAL_MS;
    appendTimelineEvent("medication_administered", "user", {
      medicationId: "adrenaline",
      count: medication.administeredCount,
      doseLabel: getMedicationDoseLabel("adrenaline", medication.administeredCount),
    });
    return getClinicalLog();
  }

  const medication = session.medications.antiarrhythmic;
  medication.administeredCount += 1;
  medication.lastAdministeredAt = now();
  medication.pendingConfirmation = false;
  medication.status = medication.administeredCount >= 2 ? "completed" : "administered";
  appendTimelineEvent("medication_administered", "user", {
    medicationId: "antiarrhythmic",
    count: medication.administeredCount,
    doseLabel: getMedicationDoseLabel("antiarrhythmic", medication.administeredCount),
  });

  return getClinicalLog();
}

function resetSession() {
  session = createSession();
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
  appendTimelineEvent("voice_command", "user", {
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
  appendTimelineEvent("assistant_insight", "system", {
    kind: entry.kind,
    summary: entry.summary,
    stateId: entry.stateId,
    ...entry.details,
  });
}

export {
  consumeEffects,
  getClinicalLog,
  getCurrentCueId,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getMedicationSnapshot,
  getOperationalMetrics,
  getPresentation,
  getPriority,
  getReversibleCauses,
  getTimeline,
  getTimers,
  next,
  registerAssistantInsightEvent,
  registerVoiceCommandEvent,
  registerExecution,
  resetSession,
  tick,
  updateReversibleCauseNotes,
  updateReversibleCauseStatus,
};
