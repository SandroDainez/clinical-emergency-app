import type { AclsTimelineEvent } from "./domain";

type VoiceTelemetrySummary = {
  totalCommands: number;
  acceptedCount: number;
  rejectedCount: number;
  confirmationRequestedCount: number;
  confirmationAcceptedCount: number;
  confirmationCancelledCount: number;
  confirmationExpiredCount: number;
  acceptanceRate: number;
  rejectionRate: number;
  confirmationRequestRate: number;
  topUsedIntents: Array<{ intent: string; count: number }>;
  topRejectedIntents: Array<{ intent: string; count: number }>;
  topTimeoutIntents: Array<{ intent: string; count: number }>;
  unknownTranscripts: string[];
  errorStates: Array<{ stateId: string; count: number }>;
  modeActiveDurationMs: number;
  modeEnabledCount: number;
  modeDisabledCount: number;
  handsFreeActionCount: number;
};

type VoiceOperationalCaseSummary = {
  headline: string[];
  dominantIntents: string[];
  primaryFriction?: string;
};

function toCountList(counter: Record<string, number>, limit = 3) {
  return Object.entries(counter)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, count]) => ({ intent: key, count }));
}

function deriveVoiceTelemetryFromTimeline(timeline: AclsTimelineEvent[]): VoiceTelemetrySummary {
  const voiceEvents = timeline.filter((event) => event.type === "voice_command");
  const commandEvents = voiceEvents.filter(
    (event) =>
      !["commands_presented", "mode_enabled", "mode_disabled"].includes(
        String(event.details?.outcome ?? "")
      )
  );

  const counters = {
    accepted: 0,
    rejected: 0,
    confirmationRequested: 0,
    confirmationAccepted: 0,
    confirmationCancelled: 0,
    confirmationExpired: 0,
  };
  const usedIntentCounter: Record<string, number> = {};
  const rejectedIntentCounter: Record<string, number> = {};
  const timeoutIntentCounter: Record<string, number> = {};
  const errorStateCounter: Record<string, number> = {};
  const unknownTranscripts: string[] = [];
  let modeEnabledCount = 0;
  let modeDisabledCount = 0;
  let modeActiveDurationMs = 0;
  let activeModeStartedAt: number | null = null;

  for (const event of voiceEvents) {
    const outcome = String(event.details?.outcome ?? "");

    if (outcome === "mode_enabled") {
      modeEnabledCount += 1;
      activeModeStartedAt = event.timestamp;
    }

    if (outcome === "mode_disabled") {
      modeDisabledCount += 1;
      if (activeModeStartedAt !== null) {
        modeActiveDurationMs += Math.max(0, event.timestamp - activeModeStartedAt);
        activeModeStartedAt = null;
      }
    }
  }

  if (activeModeStartedAt !== null && voiceEvents[voiceEvents.length - 1]) {
    modeActiveDurationMs += Math.max(
      0,
      voiceEvents[voiceEvents.length - 1].timestamp - activeModeStartedAt
    );
  }

  for (const event of commandEvents) {
    const outcome = String(event.details?.outcome ?? "");
    const intent = String(event.details?.intent ?? "unknown");
    const stateId = event.stateId;

    if (intent !== "unknown") {
      usedIntentCounter[intent] = (usedIntentCounter[intent] ?? 0) + 1;
    }

    if (outcome === "executed" || outcome === "confirmation_confirmed") {
      counters.accepted += 1;
    }

    if (["rejected", "unknown"].includes(outcome)) {
      counters.rejected += 1;
      rejectedIntentCounter[intent] = (rejectedIntentCounter[intent] ?? 0) + 1;
      errorStateCounter[stateId] = (errorStateCounter[stateId] ?? 0) + 1;
    }

    if (outcome === "confirmation_requested") {
      counters.confirmationRequested += 1;
    }

    if (outcome === "confirmation_confirmed") {
      counters.confirmationAccepted += 1;
    }

    if (outcome === "confirmation_cancelled") {
      counters.confirmationCancelled += 1;
    }

    if (outcome === "confirmation_expired") {
      counters.confirmationExpired += 1;
      timeoutIntentCounter[intent] = (timeoutIntentCounter[intent] ?? 0) + 1;
      errorStateCounter[stateId] = (errorStateCounter[stateId] ?? 0) + 1;
    }

    if (outcome === "unknown" && event.details?.transcript) {
      unknownTranscripts.push(String(event.details.transcript));
    }
  }

  const totalCommands = commandEvents.length;

  return {
    totalCommands,
    acceptedCount: counters.accepted,
    rejectedCount: counters.rejected,
    confirmationRequestedCount: counters.confirmationRequested,
    confirmationAcceptedCount: counters.confirmationAccepted,
    confirmationCancelledCount: counters.confirmationCancelled,
    confirmationExpiredCount: counters.confirmationExpired,
    acceptanceRate: totalCommands > 0 ? counters.accepted / totalCommands : 0,
    rejectionRate: totalCommands > 0 ? counters.rejected / totalCommands : 0,
    confirmationRequestRate:
      totalCommands > 0 ? counters.confirmationRequested / totalCommands : 0,
    topUsedIntents: toCountList(usedIntentCounter),
    topRejectedIntents: toCountList(rejectedIntentCounter),
    topTimeoutIntents: toCountList(timeoutIntentCounter),
    unknownTranscripts,
    modeActiveDurationMs,
    modeEnabledCount,
    modeDisabledCount,
    handsFreeActionCount: counters.accepted,
    errorStates: Object.entries(errorStateCounter)
      .sort((left, right) => right[1] - left[1])
      .map(([stateId, count]) => ({ stateId, count })),
  };
}

function summarizeVoiceTelemetryForCase(
  telemetry: VoiceTelemetrySummary
): VoiceOperationalCaseSummary {
  const headline = [
    `${telemetry.totalCommands} comandos de voz registrados`,
    `${telemetry.acceptedCount} aceitos`,
    `${telemetry.rejectedCount} rejeitados`,
    `${telemetry.confirmationExpiredCount} timeout de confirmação`,
  ];

  const dominantIntents = telemetry.topUsedIntents.map((item) => item.intent);

  let primaryFriction: string | undefined;
  if (telemetry.topTimeoutIntents[0]) {
    primaryFriction = `timeout frequente em ${telemetry.topTimeoutIntents[0].intent}`;
  } else if (telemetry.topRejectedIntents[0]) {
    primaryFriction = `rejeição frequente em ${telemetry.topRejectedIntents[0].intent}`;
  } else if (telemetry.unknownTranscripts.length > 0) {
    primaryFriction = "transcrições não reconhecidas";
  }

  return {
    headline,
    dominantIntents,
    primaryFriction,
  };
}

export type { VoiceOperationalCaseSummary, VoiceTelemetrySummary };
export { deriveVoiceTelemetryFromTimeline, summarizeVoiceTelemetryForCase };
