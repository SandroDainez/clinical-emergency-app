import type {
  AclsCaseLogEntry,
  AclsLatencyTrace,
  AclsOperationalMetrics,
  AclsTimelineEvent,
} from "./domain";
import { evaluateAclsCaseLog, type AclsCaseLogEvaluation } from "./case-log-evaluation";
import {
  analyzeAclsCase,
  type AclsClinicalCaseAnalysis,
} from "./clinical-case-analysis";
import { deriveVoiceTelemetryFromTimeline, summarizeVoiceTelemetryForCase } from "./voice-telemetry";
import type { EncounterSummary, ReversibleCause } from "../clinical-engine";

type AclsDebriefTimelineItem = {
  timestamp: number;
  timeLabel: string;
  title: string;
  detail: string;
  category: "clinical" | "medication" | "rhythm" | "voice" | "assistant";
};

type AclsReplayStep = {
  timestamp: number;
  timeLabel: string;
  event: string;
  context: string;
  actionTaken: string;
  observations?: string;
  filter: AclsReplayFilter;
  isCritical: boolean;
  blockLabel: string;
};

type AclsReplayFilter = "all" | "drugs" | "shocks" | "rhythm" | "voice" | "causes";

type AclsReplayBlock = {
  id: string;
  label: string;
  filter: AclsReplayFilter;
  steps: AclsReplayStep[];
};

type AclsDebriefCauseSummary = {
  causeId: string;
  label: string;
  timesPrioritized: number;
  firstPriorityAt?: number;
  firstPriorityLabel?: string;
  supportingSignals: string[];
  missingData: string[];
  relatedActions: string[];
};

type AclsOperationalIndicators = {
  timeToFirstShockMs?: number;
  timeToFirstShockLabel?: string;
  timeToFirstEpinephrineMs?: number;
  timeToFirstEpinephrineLabel?: string;
  totalCaseTimeMs?: number;
  totalCaseTimeLabel: string;
  cyclesCompleted: number;
  shocksDelivered: number;
  epinephrineAdministered: number;
  antiarrhythmicsAdministered: number;
  branchTransitions: number;
  roscOccurred: boolean;
  pendingOrDelayedItems: string[];
  operationalDeviations: string[];
  voiceRejectedCount: number;
  voiceTimeoutCount: number;
  voiceLowConfidenceCount: number;
  persistentPriorityCauses: string[];
};

type AclsDebriefSummary = {
  durationLabel: string;
  cyclesCompleted: number;
  shocksDelivered: number;
  epinephrineAdministered: number;
  antiarrhythmicsAdministered: number;
  advancedAirwaySecured: boolean;
  branchTransitions: string[];
  roscOccurred: boolean;
  topCauseSummaries: AclsDebriefCauseSummary[];
  highlightedMissingData: string[];
  operationalDeviations: string[];
  voiceSummary: ReturnType<typeof summarizeVoiceTelemetryForCase>;
  voiceTelemetry: ReturnType<typeof deriveVoiceTelemetryFromTimeline>;
  indicators: AclsOperationalIndicators;
};

type AclsDebrief = {
  summary: AclsDebriefSummary;
  clinicalAnalysis: AclsClinicalCaseAnalysis;
  timeline: AclsDebriefTimelineItem[];
  replaySteps: AclsReplayStep[];
  replayBlocks: AclsReplayBlock[];
  latencyDebug?: {
    enabled: boolean;
    events: AclsLatencyTrace[];
  };
};

type AclsDebriefExport = {
  metadata: {
    protocolId: string;
    durationLabel: string;
    currentStateId: string;
    currentStateText: string;
    generatedFrom: "post_case_debrief";
  };
  operationalSummary: {
    cyclesCompleted: number;
    shocksDelivered: number;
    epinephrineAdministered: number;
    antiarrhythmicsAdministered: number;
    advancedAirwaySecured: boolean;
    branchTransitions: string[];
    roscOccurred: boolean;
    operationalDeviations: string[];
    highlightedMissingData: string[];
    indicators: AclsOperationalIndicators;
  };
  voiceSummary: AclsDebriefSummary["voiceSummary"] & {
    telemetry: AclsDebriefSummary["voiceTelemetry"];
  };
  causesSummary: AclsDebriefCauseSummary[];
  timeline: AclsDebriefTimelineItem[];
  replaySteps: AclsReplayStep[];
  replayBlocks: AclsReplayBlock[];
  caseLog: AclsCaseLogEntry[];
  caseLogEvaluation: AclsCaseLogEvaluation;
  clinicalAnalysis: AclsClinicalCaseAnalysis;
  latencyDebug?: {
    enabled: boolean;
    events: AclsLatencyTrace[];
  };
};

type BuildAclsDebriefInput = {
  debugLatencyEnabled?: boolean;
  encounterSummary: EncounterSummary;
  latencyMetrics?: AclsLatencyTrace[];
  operationalMetrics?: AclsOperationalMetrics;
  caseLog?: AclsCaseLogEntry[];
  timeline: AclsTimelineEvent[];
  reversibleCauses: ReversibleCause[];
};

function sortLatencyMetrics(metrics: AclsLatencyTrace[]) {
  return [...metrics].sort((left, right) => left.eventReceivedAt - right.eventReceivedAt);
}

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getReferenceTimestamp(timeline: AclsTimelineEvent[]) {
  return timeline[0]?.timestamp ?? Date.now();
}

function toTimeLabel(timestamp: number, referenceTimestamp: number) {
  return formatElapsedTime(timestamp - referenceTimestamp);
}

function buildBranchTransitions(timeline: AclsTimelineEvent[]) {
  return timeline
    .filter((event) => event.type === "question_answered")
    .filter((event) =>
      ["chocavel", "nao_chocavel", "rosc"].includes(String(event.details?.answer ?? ""))
    )
    .map((event) => {
      const answer = String(event.details?.answer ?? "");
      if (answer === "chocavel") {
        return "Mudança para ramo chocável";
      }
      if (answer === "nao_chocavel") {
        return "Mudança para ramo não chocável";
      }
      return "Transição para ROSC";
    });
}

function buildCauseSummaryMap(reversibleCauses: ReversibleCause[]) {
  return Object.fromEntries(
    reversibleCauses.map((cause) => [
      cause.id,
      {
        causeId: cause.id,
        label: cause.label,
        timesPrioritized: 0,
        supportingSignals: cause.evidence ?? [],
        missingData: [] as string[],
        relatedActions: cause.actionsTaken?.length
          ? cause.actionsTaken
          : cause.status === "abordada"
            ? cause.actions
            : [],
      },
    ])
  ) as Record<string, AclsDebriefCauseSummary>;
}

function buildCauseSummaries(
  timeline: AclsTimelineEvent[],
  reversibleCauses: ReversibleCause[]
) {
  const referenceTimestamp = getReferenceTimestamp(timeline);
  const causeMap = buildCauseSummaryMap(reversibleCauses);
  const missingDataCounter: Record<string, number> = {};

  for (const event of timeline) {
    if (event.type === "assistant_insight" && event.details?.kind === "ranking_generated") {
      const topThreeIds = String(event.details?.topThree ?? "")
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);
      for (const causeId of topThreeIds) {
        const cause = causeMap[causeId];
        if (!cause) {
          continue;
        }
        cause.timesPrioritized += 1;
        if (!cause.firstPriorityAt) {
          cause.firstPriorityAt = event.timestamp;
          cause.firstPriorityLabel = toTimeLabel(event.timestamp, referenceTimestamp);
        }
      }
    }

    if (event.type === "assistant_insight" && event.details?.kind === "missing_data_highlighted") {
      const missingItems = String(event.details?.missingData ?? "")
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);
      for (const item of missingItems) {
        missingDataCounter[item] = (missingDataCounter[item] ?? 0) + 1;
      }
    }
  }

  const manuallyDocumentedCauseIds = new Set(
    reversibleCauses
      .filter(
        (cause) =>
          cause.status !== "pendente" ||
          (cause.evidence?.length ?? 0) > 0 ||
          (cause.actionsTaken?.length ?? 0) > 0 ||
          (cause.responseObserved?.length ?? 0) > 0
      )
      .map((cause) => cause.id)
  );

  const topCauseSummaries = Object.values(causeMap)
    .filter((cause) => manuallyDocumentedCauseIds.has(cause.causeId))
    .sort((left, right) => right.timesPrioritized - left.timesPrioritized)
    .slice(0, 3);

  return {
    topCauseSummaries,
    highlightedMissingData: Object.entries(missingDataCounter)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([item]) => item),
  };
}

function buildOperationalDeviations(timeline: AclsTimelineEvent[]) {
  return timeline
    .filter((event) => event.type === "guard_rail_triggered")
    .map((event) => String(event.details?.issue ?? "desvio operacional"))
    .slice(-5);
}

function findFirstTimestamp(timeline: AclsTimelineEvent[], type: AclsTimelineEvent["type"], predicate?: (event: AclsTimelineEvent) => boolean) {
  return timeline.find((event) => event.type === type && (predicate ? predicate(event) : true))
    ?.timestamp;
}

function buildPendingOrDelayedItems(timeline: AclsTimelineEvent[]) {
  const items: string[] = [];
  const medicationDueEvents = timeline.filter((event) => event.type === "medication_due_now");
  const medicationAdminEvents = timeline.filter((event) => event.type === "medication_administered");

  for (const dueEvent of medicationDueEvents) {
    const medicationId = String(dueEvent.details?.medicationId ?? "");
    const matchedAdmin = medicationAdminEvents.find(
      (event) =>
        event.timestamp >= dueEvent.timestamp &&
        String(event.details?.medicationId ?? "") === medicationId
    );

    if (!matchedAdmin) {
      items.push(`${medicationId} sugerida sem registro de administração`);
      continue;
    }

    if (matchedAdmin.timestamp - dueEvent.timestamp > 5 * 60 * 1000) {
      items.push(`${medicationId} registrada com atraso relevante`);
    }
  }

  return Array.from(new Set(items)).slice(0, 5);
}

function buildOperationalIndicators(
  timeline: AclsTimelineEvent[],
  encounterSummary: EncounterSummary,
  operationalMetrics: AclsOperationalMetrics | undefined,
  causeSummary: { topCauseSummaries: AclsDebriefCauseSummary[] },
  voiceTelemetry: ReturnType<typeof deriveVoiceTelemetryFromTimeline>,
  operationalDeviations: string[]
): AclsOperationalIndicators {
  const referenceTimestamp = getReferenceTimestamp(timeline);
  const firstShockTimestamp = findFirstTimestamp(timeline, "shock_applied");
  const firstEpinephrineTimestamp = findFirstTimestamp(
    timeline,
    "medication_administered",
    (event) => String(event.details?.medicationId ?? "") === "adrenaline"
  );
  const totalCaseTimeMs =
    timeline.length > 0 ? timeline[timeline.length - 1].timestamp - referenceTimestamp : undefined;

  return {
    timeToFirstShockMs:
      firstShockTimestamp !== undefined ? firstShockTimestamp - referenceTimestamp : undefined,
    timeToFirstShockLabel:
      firstShockTimestamp !== undefined
        ? formatElapsedTime(firstShockTimestamp - referenceTimestamp)
        : undefined,
    timeToFirstEpinephrineMs:
      firstEpinephrineTimestamp !== undefined
        ? firstEpinephrineTimestamp - referenceTimestamp
        : undefined,
    timeToFirstEpinephrineLabel:
      firstEpinephrineTimestamp !== undefined
        ? formatElapsedTime(firstEpinephrineTimestamp - referenceTimestamp)
        : undefined,
    totalCaseTimeMs,
    totalCaseTimeLabel:
      totalCaseTimeMs !== undefined ? formatElapsedTime(totalCaseTimeMs) : encounterSummary.durationLabel,
    cyclesCompleted: operationalMetrics?.cyclesCompleted ?? 0,
    shocksDelivered: encounterSummary.shockCount,
    epinephrineAdministered: encounterSummary.adrenalineAdministeredCount,
    antiarrhythmicsAdministered: encounterSummary.antiarrhythmicAdministeredCount,
    branchTransitions: buildBranchTransitions(timeline).length,
    roscOccurred: timeline.some((event) => event.type === "rosc"),
    pendingOrDelayedItems: buildPendingOrDelayedItems(timeline),
    operationalDeviations,
    voiceRejectedCount: voiceTelemetry.rejectedCount,
    voiceTimeoutCount: voiceTelemetry.confirmationExpiredCount,
    voiceLowConfidenceCount: timeline.filter(
      (event) =>
        event.type === "voice_command" && event.details?.errorCategory === "low_confidence"
    ).length,
    persistentPriorityCauses: causeSummary.topCauseSummaries
      .filter((cause) => cause.timesPrioritized >= 2)
      .map((cause) => cause.label),
  };
}

function buildDebriefTimeline(timeline: AclsTimelineEvent[]) {
  const referenceTimestamp = getReferenceTimestamp(timeline);

  return timeline
    .filter((event) =>
      [
        "protocol_started",
        "shock_applied",
        "medication_administered",
        "advanced_airway_secured",
        "reassessment_due",
        "rosc",
        "assistant_insight",
        "voice_command",
      ].includes(event.type)
    )
    .filter((event) => {
      if (event.type !== "voice_command") {
        return true;
      }
      return ["executed", "confirmation_expired", "rejected"].includes(
        String(event.details?.outcome ?? "")
      );
    })
    .map((event): AclsDebriefTimelineItem => {
      const timeLabel = toTimeLabel(event.timestamp, referenceTimestamp);

      switch (event.type) {
        case "protocol_started":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: "Início de RCP",
            detail: "Protocolo iniciado",
            category: "clinical",
          };
        case "shock_applied":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: `Choque ${event.details?.count ?? "?"}`,
            detail: String(event.details?.defibrillatorType ?? "desfibrilação registrada"),
            category: "rhythm",
          };
        case "medication_administered":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title:
              event.details?.medicationId === "adrenaline"
                ? "Epinefrina administrada"
                : "Antiarrítmico administrado",
            detail: `${String(event.details?.doseLabel ?? "Dose registrada")} • dose ${event.details?.count ?? 1}`,
            category: "medication",
          };
        case "advanced_airway_secured":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: "Intubação registrada",
            detail: "Via aérea avançada confirmada no atendimento",
            category: "clinical",
          };
        case "reassessment_due":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: "Reavaliação de ritmo",
            detail: "Fim de ciclo com reavaliação indicada",
            category: "rhythm",
          };
        case "rosc":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: "ROSC",
            detail: "Retorno da circulação espontânea",
            category: "clinical",
          };
        case "assistant_insight":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: "Insight de Hs/Ts",
            detail: String(event.details?.summary ?? event.details?.kind ?? "assistente"),
            category: "assistant",
          };
        case "voice_command":
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: "Evento de voz",
            detail: [
              event.details?.intent ? `intent ${event.details.intent}` : "intent desconhecida",
              event.details?.outcome ? `resultado ${event.details.outcome}` : undefined,
            ]
              .filter(Boolean)
              .join(" • "),
            category: "voice",
          };
        default:
          return {
            timestamp: event.timestamp,
            timeLabel,
            title: event.type,
            detail: "",
            category: "clinical",
          };
      }
    });
}

function mapReplayFilter(item: AclsDebriefTimelineItem): AclsReplayFilter {
  switch (item.category) {
    case "medication":
      return "drugs";
    case "voice":
      return "voice";
    case "assistant":
      return "causes";
    case "rhythm":
      return item.title.startsWith("Choque") ? "shocks" : "rhythm";
    default:
      return "all";
  }
}

function isCriticalReplayItem(item: AclsDebriefTimelineItem) {
  return (
    item.title === "Início de RCP" ||
    item.title.startsWith("Choque") ||
    item.title === "Epinefrina administrada" ||
    item.title === "Antiarrítmico administrado" ||
    item.title === "Reavaliação de ritmo" ||
    item.title === "ROSC" ||
    item.title === "Insight de Hs/Ts" ||
    item.title === "Evento de voz"
  );
}

function buildReplayBlockLabel(item: AclsDebriefTimelineItem) {
  if (item.title === "Início de RCP") {
    return "Início";
  }
  if (item.title.startsWith("Choque")) {
    return "Choques";
  }
  if (item.title === "Epinefrina administrada" || item.title === "Antiarrítmico administrado") {
    return "Drogas";
  }
  if (item.title === "Reavaliação de ritmo" || item.title === "ROSC") {
    return "Ritmo e desfecho";
  }
  if (item.title === "Insight de Hs/Ts") {
    return "Hs e Ts";
  }
  if (item.title === "Evento de voz") {
    return "Voz";
  }
  return "Outros marcos";
}

function buildReplaySteps(timeline: AclsTimelineEvent[]) {
  return buildDebriefTimeline(timeline).map((item) => ({
    timestamp: item.timestamp,
    timeLabel: item.timeLabel,
    event: item.title,
    context: item.category,
    actionTaken: item.detail,
    filter: mapReplayFilter(item),
    isCritical: isCriticalReplayItem(item),
    blockLabel: buildReplayBlockLabel(item),
    observations:
      item.category === "assistant"
        ? "Insight assistivo derivado do caso"
        : item.category === "voice"
          ? "Interação operacional por voz"
          : undefined,
  }));
}

function buildReplayBlocks(replaySteps: AclsReplayStep[]) {
  const blocks: AclsReplayBlock[] = [];

  for (const step of replaySteps) {
    const existing = blocks[blocks.length - 1];
    if (existing && existing.label === step.blockLabel) {
      existing.steps.push(step);
      continue;
    }

    blocks.push({
      id: `${step.blockLabel}:${step.timestamp}`,
      label: step.blockLabel,
      filter: step.filter,
      steps: [step],
    });
  }

  return blocks;
}

function filterReplaySteps(replaySteps: AclsReplayStep[], filter: AclsReplayFilter) {
  if (filter === "all") {
    return replaySteps;
  }

  return replaySteps.filter((step) => step.filter === filter);
}

function filterReplayBlocks(replayBlocks: AclsReplayBlock[], filter: AclsReplayFilter) {
  if (filter === "all") {
    return replayBlocks;
  }

  return replayBlocks
    .map((block) => ({
      ...block,
      steps: block.steps.filter((step) => step.filter === filter),
    }))
    .filter((block) => block.steps.length > 0);
}

function buildAclsDebrief(input: BuildAclsDebriefInput): AclsDebrief {
  const timeline = [...input.timeline].sort((left, right) => left.timestamp - right.timestamp);
  const voiceTelemetry = deriveVoiceTelemetryFromTimeline(timeline);
  const voiceSummary = summarizeVoiceTelemetryForCase(voiceTelemetry);
  const causeSummary = buildCauseSummaries(timeline, input.reversibleCauses);
  const operationalDeviations = buildOperationalDeviations(timeline);
  const indicators = buildOperationalIndicators(
    timeline,
    input.encounterSummary,
    input.operationalMetrics,
    causeSummary,
    voiceTelemetry,
    operationalDeviations
  );

  const replaySteps = buildReplaySteps(timeline);

  return {
    summary: {
      durationLabel: input.encounterSummary.durationLabel,
      cyclesCompleted: input.operationalMetrics?.cyclesCompleted ?? 0,
      shocksDelivered: input.encounterSummary.shockCount,
      epinephrineAdministered: input.encounterSummary.adrenalineAdministeredCount,
      antiarrhythmicsAdministered: input.encounterSummary.antiarrhythmicAdministeredCount,
      advancedAirwaySecured: timeline.some((event) => event.type === "advanced_airway_secured"),
      branchTransitions: buildBranchTransitions(timeline),
      roscOccurred: timeline.some((event) => event.type === "rosc"),
      topCauseSummaries: causeSummary.topCauseSummaries,
      highlightedMissingData: causeSummary.highlightedMissingData,
      operationalDeviations,
      voiceSummary,
      voiceTelemetry,
      indicators,
    },
    clinicalAnalysis: analyzeAclsCase({
      caseLog: input.caseLog ?? [],
      timeline,
      latencyMetrics: input.latencyMetrics ?? [],
    }),
    timeline: buildDebriefTimeline(timeline),
    replaySteps,
    replayBlocks: buildReplayBlocks(replaySteps),
    latencyDebug: input.debugLatencyEnabled
      ? {
          enabled: true,
          events: sortLatencyMetrics(input.latencyMetrics ?? []),
        }
      : undefined,
  };
}

function buildAclsDebriefExport(
  debrief: AclsDebrief,
  encounterSummary: EncounterSummary,
  caseLog: AclsCaseLogEntry[] = []
): AclsDebriefExport {
  const caseLogEvaluation = evaluateAclsCaseLog(caseLog);

  return {
    metadata: {
      protocolId: encounterSummary.protocolId,
      durationLabel: debrief.summary.durationLabel,
      currentStateId: encounterSummary.currentStateId,
      currentStateText: encounterSummary.currentStateText,
      generatedFrom: "post_case_debrief",
    },
    operationalSummary: {
      cyclesCompleted: debrief.summary.cyclesCompleted,
      shocksDelivered: debrief.summary.shocksDelivered,
      epinephrineAdministered: debrief.summary.epinephrineAdministered,
      antiarrhythmicsAdministered: debrief.summary.antiarrhythmicsAdministered,
      advancedAirwaySecured: debrief.summary.advancedAirwaySecured,
      branchTransitions: debrief.summary.branchTransitions,
      roscOccurred: debrief.summary.roscOccurred,
      operationalDeviations: debrief.summary.operationalDeviations,
      highlightedMissingData: debrief.summary.highlightedMissingData,
      indicators: debrief.summary.indicators,
    },
    voiceSummary: {
      ...debrief.summary.voiceSummary,
      telemetry: debrief.summary.voiceTelemetry,
    },
    causesSummary: debrief.summary.topCauseSummaries,
    timeline: debrief.timeline,
    replaySteps: debrief.replaySteps,
    replayBlocks: debrief.replayBlocks,
    caseLog: [...caseLog].sort((left, right) => left.timestamp - right.timestamp),
    caseLogEvaluation,
    clinicalAnalysis: debrief.clinicalAnalysis,
    latencyDebug: debrief.latencyDebug
      ? {
          enabled: debrief.latencyDebug.enabled,
          events: sortLatencyMetrics(debrief.latencyDebug.events),
        }
      : undefined,
  };
}

function buildAclsDebriefTextExport(
  debrief: AclsDebrief,
  encounterSummary: EncounterSummary
) {
  const lines = [
    "Debrief pós-caso ACLS",
    `Protocolo: ${encounterSummary.protocolId}`,
    `Duração: ${debrief.summary.durationLabel}`,
    `Estado final: ${encounterSummary.currentStateText} (${encounterSummary.currentStateId})`,
    "",
    "Análise clínica",
    `- ${debrief.clinicalAnalysis.summary}`,
    `- Pontos fortes: ${
      debrief.clinicalAnalysis.strengths.length > 0
        ? debrief.clinicalAnalysis.strengths.join(" | ")
        : "Nenhum destaque"
    }`,
    `- Atrasos/desvios: ${
      debrief.clinicalAnalysis.delaysOrDeviations.length > 0
        ? debrief.clinicalAnalysis.delaysOrDeviations.join(" | ")
        : "Nenhum destaque"
    }`,
    `- Melhorias: ${
      debrief.clinicalAnalysis.improvementSuggestions.length > 0
        ? debrief.clinicalAnalysis.improvementSuggestions.join(" | ")
        : "Nenhuma sugestão"
    }`,
    "",
    "Resumo rápido",
    `- Ciclos: ${debrief.summary.cyclesCompleted}`,
    `- Choques: ${debrief.summary.shocksDelivered}`,
    `- Epinefrina administrada: ${debrief.summary.epinephrineAdministered}`,
    `- Antiarrítmicos administrados: ${debrief.summary.antiarrhythmicsAdministered}`,
    `- Via aérea avançada: ${debrief.summary.advancedAirwaySecured ? "Registrada" : "Não registrada"}`,
    `- ROSC: ${debrief.summary.roscOccurred ? "Sim" : "Não"}`,
    `- Tempo até primeiro choque: ${debrief.summary.indicators.timeToFirstShockLabel ?? "Indisponível"}`,
    `- Tempo até primeira epinefrina: ${debrief.summary.indicators.timeToFirstEpinephrineLabel ?? "Indisponível"}`,
    `- Transições de ramo: ${
      debrief.summary.branchTransitions.length > 0
        ? debrief.summary.branchTransitions.join(" | ")
        : "Nenhuma registrada"
    }`,
    "",
    "Timeline resumida",
  ];

  for (const item of debrief.timeline) {
    lines.push(`- ${item.timeLabel} • ${item.title} • ${item.detail}`);
  }

  lines.push("", "Hs e Ts registradas");
  if (debrief.summary.topCauseSummaries.length === 0) {
    lines.push("- Nenhuma H ou T foi registrada manualmente no caso");
  } else {
    for (const cause of debrief.summary.topCauseSummaries) {
      lines.push(
        `- ${cause.label}${cause.firstPriorityLabel ? ` • ${cause.firstPriorityLabel}` : ""} • priorizada ${cause.timesPrioritized}x`
      );
      if (cause.supportingSignals.length > 0) {
        lines.push(`  Sustentação: ${cause.supportingSignals.slice(0, 2).join(" | ")}`);
      }
      if (cause.relatedActions.length > 0) {
        lines.push(`  Ações relacionadas: ${cause.relatedActions.slice(0, 2).join(" | ")}`);
      }
    }
  }

  lines.push("", "Telemetria de voz");
  for (const item of debrief.summary.voiceSummary.headline) {
    lines.push(`- ${item}`);
  }
  if (debrief.summary.voiceSummary.primaryFriction) {
    lines.push(`- Principal atrito: ${debrief.summary.voiceSummary.primaryFriction}`);
  }
  if (debrief.summary.voiceSummary.dominantIntents.length > 0) {
    lines.push(
      `- Intents mais usadas: ${debrief.summary.voiceSummary.dominantIntents.join(" | ")}`
    );
  }

  if (debrief.latencyDebug?.enabled) {
    lines.push("", "Latência perceptiva");
    if (debrief.latencyDebug.events.length === 0) {
      lines.push("- Nenhuma métrica de latência registrada");
    } else {
      for (const item of debrief.latencyDebug.events) {
        lines.push(
          `- ${item.eventType} [${item.eventCategory}] • event->state ${item.latencies.eventToStateMs ?? "n/a"}ms • state->enqueue ${item.latencies.stateToEnqueueSpeakMs ?? "n/a"}ms • enqueue->play ${item.latencies.enqueueToPlayMs ?? "n/a"}ms • total ${item.latencies.totalEndToEndMs ?? "n/a"}ms`
        );
      }
    }
  }

  lines.push("", "Indicadores operacionais");
  lines.push(`- Tempo total do caso: ${debrief.summary.indicators.totalCaseTimeLabel}`);
  lines.push(`- Rejeições de voz: ${debrief.summary.indicators.voiceRejectedCount}`);
  lines.push(`- Timeout de voz: ${debrief.summary.indicators.voiceTimeoutCount}`);
  lines.push(`- Baixa confiança na voz: ${debrief.summary.indicators.voiceLowConfidenceCount}`);
  lines.push(
    `- Pendências/atrasos: ${
      debrief.summary.indicators.pendingOrDelayedItems.length > 0
        ? debrief.summary.indicators.pendingOrDelayedItems.join(" | ")
        : "Nenhum destaque"
    }`
  );

  lines.push("", "Observações finais");
  lines.push(
    `- Dados faltantes frequentes: ${
      debrief.summary.highlightedMissingData.length > 0
        ? debrief.summary.highlightedMissingData.join(" | ")
        : "Nenhum destaque"
    }`
  );
  lines.push(
    `- Desvios operacionais: ${
      debrief.summary.operationalDeviations.length > 0
        ? debrief.summary.operationalDeviations.join(" | ")
        : "Nenhum desvio registrado"
    }`
  );

  return lines.join("\n");
}

function buildAclsDebriefJsonExport(
  debrief: AclsDebrief,
  encounterSummary: EncounterSummary,
  caseLog: AclsCaseLogEntry[] = []
) {
  return JSON.stringify(buildAclsDebriefExport(debrief, encounterSummary, caseLog), null, 2);
}

export type {
  AclsDebrief,
  AclsDebriefCauseSummary,
  AclsClinicalCaseAnalysis,
  AclsDebriefExport,
  AclsReplayBlock,
  AclsReplayFilter,
  AclsOperationalIndicators,
  AclsDebriefSummary,
  AclsDebriefTimelineItem,
  AclsReplayStep,
  BuildAclsDebriefInput,
};
export {
  buildAclsDebrief,
  buildAclsDebriefExport,
  buildAclsDebriefJsonExport,
  buildAclsDebriefTextExport,
  buildDebriefTimeline,
  filterReplayBlocks,
  filterReplaySteps,
  buildReplayBlocks,
  buildReplaySteps,
};
