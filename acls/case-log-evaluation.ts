import type { AclsCaseLogEntry } from "./domain";

type AclsCaseLogAlert = {
  code:
    | "delayed_first_shock"
    | "delayed_first_epinephrine"
    | "cycle_duration_out_of_range"
    | "missing_rhythm_checks";
  severity: "warning" | "error";
  message: string;
};

type AclsCaseLogEvaluation = {
  metrics: {
    timeToFirstShockMs?: number;
    timeToFirstShockLabel?: string;
    timeToFirstEpinephrineMs?: number;
    timeToFirstEpinephrineLabel?: string;
    averageCycleDurationMs?: number;
    averageCycleDurationLabel?: string;
    cycleDurationsMs: number[];
    rhythmCheckCount: number;
  };
  feedback: string[];
  alerts: AclsCaseLogAlert[];
};

function formatElapsedTime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getReferenceTimestamp(caseLog: AclsCaseLogEntry[]) {
  return caseLog[0]?.timestamp;
}

function getActionTimestamp(caseLog: AclsCaseLogEntry[], actionId: string) {
  return caseLog.find(
    (entry) =>
      entry.eventType === "execution_recorded" &&
      String(entry.eventDetails?.actionId ?? "") === actionId
  )?.timestamp;
}

function parseTimerStartedAt(timerId: string | undefined) {
  if (!timerId) {
    return undefined;
  }

  const segments = timerId.split(":");
  const startedAt = Number(segments[segments.length - 1]);
  return Number.isFinite(startedAt) ? startedAt : undefined;
}

function getCycleDurationsMs(caseLog: AclsCaseLogEntry[]) {
  return caseLog
    .filter((entry) => entry.eventType === "timer_elapsed")
    .map((entry) => {
      const startedAt = parseTimerStartedAt(
        typeof entry.eventDetails?.timerId === "string" ? entry.eventDetails.timerId : undefined
      );

      if (startedAt === undefined) {
        return undefined;
      }

      return entry.timestamp - startedAt;
    })
    .filter((value): value is number => value !== undefined);
}

function getRhythmCheckCount(caseLog: AclsCaseLogEntry[]) {
  return caseLog.filter((entry) => entry.eventType === "timer_elapsed").length;
}

function buildFeedback(evaluation: AclsCaseLogEvaluation["metrics"]) {
  const feedback: string[] = [];

  if (evaluation.timeToFirstShockLabel) {
    feedback.push(`Primeiro choque em ${evaluation.timeToFirstShockLabel}.`);
  }

  if (evaluation.timeToFirstEpinephrineLabel) {
    feedback.push(`Primeira epinefrina em ${evaluation.timeToFirstEpinephrineLabel}.`);
  }

  if (evaluation.averageCycleDurationLabel) {
    feedback.push(`Duração média dos ciclos em ${evaluation.averageCycleDurationLabel}.`);
  }

  if (evaluation.rhythmCheckCount > 0) {
    feedback.push(`Checagens de ritmo registradas: ${evaluation.rhythmCheckCount}.`);
  }

  return feedback;
}

function buildAlerts(metrics: AclsCaseLogEvaluation["metrics"]) {
  const alerts: AclsCaseLogAlert[] = [];

  if (metrics.timeToFirstShockMs !== undefined && metrics.timeToFirstShockMs > 120000) {
    alerts.push({
      code: "delayed_first_shock",
      severity: "warning",
      message: "Primeiro choque ocorreu após 2 minutos do início do caso.",
    });
  }

  if (
    metrics.timeToFirstEpinephrineMs !== undefined &&
    metrics.timeToFirstEpinephrineMs > 300000
  ) {
    alerts.push({
      code: "delayed_first_epinephrine",
      severity: "warning",
      message: "Primeira epinefrina ocorreu após a janela recomendada de 3 a 5 minutos.",
    });
  }

  if (metrics.cycleDurationsMs.some((duration) => Math.abs(duration - 120000) > 5000)) {
    alerts.push({
      code: "cycle_duration_out_of_range",
      severity: "warning",
      message: "Há ciclos com duração fora da faixa esperada de 2 minutos.",
    });
  }

  if (
    metrics.cycleDurationsMs.length > 0 &&
    metrics.rhythmCheckCount < metrics.cycleDurationsMs.length
  ) {
    alerts.push({
      code: "missing_rhythm_checks",
      severity: "error",
      message: "Nem todo ciclo concluído tem checagem de ritmo correspondente no log.",
    });
  }

  return alerts;
}

function evaluateAclsCaseLog(caseLog: AclsCaseLogEntry[]): AclsCaseLogEvaluation {
  const sorted = [...caseLog].sort((left, right) => left.timestamp - right.timestamp);
  const referenceTimestamp = getReferenceTimestamp(sorted);
  const firstShockTimestamp = getActionTimestamp(sorted, "shock");
  const firstEpinephrineTimestamp = getActionTimestamp(sorted, "adrenaline");
  const cycleDurationsMs = getCycleDurationsMs(sorted);
  const averageCycleDurationMs =
    cycleDurationsMs.length > 0
      ? Math.round(
          cycleDurationsMs.reduce((total, duration) => total + duration, 0) /
            cycleDurationsMs.length
        )
      : undefined;
  const metrics = {
    timeToFirstShockMs:
      firstShockTimestamp !== undefined && referenceTimestamp !== undefined
        ? firstShockTimestamp - referenceTimestamp
        : undefined,
    timeToFirstShockLabel:
      firstShockTimestamp !== undefined && referenceTimestamp !== undefined
        ? formatElapsedTime(firstShockTimestamp - referenceTimestamp)
        : undefined,
    timeToFirstEpinephrineMs:
      firstEpinephrineTimestamp !== undefined && referenceTimestamp !== undefined
        ? firstEpinephrineTimestamp - referenceTimestamp
        : undefined,
    timeToFirstEpinephrineLabel:
      firstEpinephrineTimestamp !== undefined && referenceTimestamp !== undefined
        ? formatElapsedTime(firstEpinephrineTimestamp - referenceTimestamp)
        : undefined,
    averageCycleDurationMs,
    averageCycleDurationLabel:
      averageCycleDurationMs !== undefined ? formatElapsedTime(averageCycleDurationMs) : undefined,
    cycleDurationsMs,
    rhythmCheckCount: getRhythmCheckCount(sorted),
  };

  return {
    metrics,
    feedback: buildFeedback(metrics),
    alerts: buildAlerts(metrics),
  };
}

export type { AclsCaseLogAlert, AclsCaseLogEvaluation };
export { evaluateAclsCaseLog };
