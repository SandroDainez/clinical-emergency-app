import type { AclsCaseLogEntry, AclsLatencyTrace, AclsTimelineEvent } from "./domain";
import { evaluateAclsCaseLog } from "./case-log-evaluation";

type AclsClinicalCaseAnalysis = {
  summary: string;
  strengths: string[];
  delaysOrDeviations: string[];
  improvementSuggestions: string[];
};

type AnalyzeAclsCaseInput = {
  caseLog: AclsCaseLogEntry[];
  timeline: AclsTimelineEvent[];
  latencyMetrics?: AclsLatencyTrace[];
};

function appendUnique(target: string[], value: string | undefined) {
  if (!value || target.includes(value)) {
    return;
  }

  target.push(value);
}

function buildCriticalLatencyObservations(latencyMetrics: AclsLatencyTrace[]) {
  const criticalEvents = latencyMetrics.filter(
    (item) => item.eventCategory === "shock" || item.eventCategory === "rhythm"
  );
  const delayedCriticalEvents = criticalEvents.filter(
    (item) => (item.latencies.totalEndToEndMs ?? 0) > 100
  );

  return {
    allCriticalWithinTarget:
      criticalEvents.length > 0 &&
      criticalEvents.every((item) => (item.latencies.totalEndToEndMs ?? 0) <= 100),
    delayedCriticalEvents,
  };
}

function buildSummary(
  strengths: string[],
  delaysOrDeviations: string[],
  feedback: string[]
) {
  if (delaysOrDeviations.length === 0 && strengths.length > 0) {
    return "Fluxo ACLS consistente, sem atrasos ou desvios relevantes no caso analisado.";
  }

  if (delaysOrDeviations.length === 0) {
    return feedback.length > 0
      ? `Caso com registro suficiente e sem desvios relevantes. ${feedback[0]}`
      : "Caso sem desvios relevantes no log analisado.";
  }

  return `Caso com ${delaysOrDeviations.length} atraso(s) ou desvio(s) relevante(s). Priorizar revisão de ritmo, choque e medicações no próximo treinamento.`;
}

function analyzeAclsCase({
  caseLog,
  timeline,
  latencyMetrics = [],
}: AnalyzeAclsCaseInput): AclsClinicalCaseAnalysis {
  const sortedCaseLog = [...caseLog].sort((left, right) => left.timestamp - right.timestamp);
  const sortedTimeline = [...timeline].sort((left, right) => left.timestamp - right.timestamp);
  const evaluation = evaluateAclsCaseLog(sortedCaseLog);
  const strengths: string[] = [];
  const delaysOrDeviations: string[] = [];
  const improvementSuggestions: string[] = [];

  if (
    evaluation.metrics.timeToFirstShockMs !== undefined &&
    evaluation.metrics.timeToFirstShockMs <= 120000
  ) {
    appendUnique(strengths, "Primeiro choque dentro da janela de 2 minutos.");
  }

  if (
    evaluation.metrics.timeToFirstEpinephrineMs !== undefined &&
    evaluation.metrics.timeToFirstEpinephrineMs <= 300000
  ) {
    appendUnique(strengths, "Primeira epinefrina dentro da janela esperada.");
  }

  if (
    evaluation.metrics.averageCycleDurationMs !== undefined &&
    Math.abs(evaluation.metrics.averageCycleDurationMs - 120000) <= 5000
  ) {
    appendUnique(strengths, "Ciclos mantidos próximos de 2 minutos.");
  }

  if (
    evaluation.metrics.cycleDurationsMs.length > 0 &&
    evaluation.metrics.rhythmCheckCount >= evaluation.metrics.cycleDurationsMs.length
  ) {
    appendUnique(strengths, "Checagens de ritmo registradas ao fim dos ciclos.");
  }

  const latencyObservations = buildCriticalLatencyObservations(latencyMetrics);
  if (latencyObservations.allCriticalWithinTarget) {
    appendUnique(strengths, "Eventos críticos com latência perceptiva abaixo de 100 ms.");
  }

  for (const alert of evaluation.alerts) {
    appendUnique(delaysOrDeviations, alert.message);

    if (alert.code === "delayed_first_shock") {
      appendUnique(
        improvementSuggestions,
        "Antecipar desfibrilação no primeiro ritmo chocável."
      );
    }

    if (alert.code === "delayed_first_epinephrine") {
      appendUnique(
        improvementSuggestions,
        "Registrar epinefrina dentro da janela de 3 a 5 minutos quando indicada."
      );
    }

    if (alert.code === "cycle_duration_out_of_range") {
      appendUnique(
        improvementSuggestions,
        "Reforçar ciclos de 2 minutos com reavaliação no tempo previsto."
      );
    }

    if (alert.code === "missing_rhythm_checks") {
      appendUnique(
        improvementSuggestions,
        "Garantir checagem de ritmo ao fim de cada ciclo concluído."
      );
    }
  }

  for (const event of sortedTimeline) {
    if (event.type !== "guard_rail_triggered") {
      continue;
    }

    const issue = String(event.details?.issue ?? "Desvio operacional registrado.");
    appendUnique(delaysOrDeviations, issue);
    appendUnique(
      improvementSuggestions,
      "Revisar guard rails disparados e evitar ações fora da fase clínica."
    );
  }

  for (const delayedEvent of latencyObservations.delayedCriticalEvents) {
    appendUnique(
      delaysOrDeviations,
      `Latência perceptiva elevada em ${delayedEvent.eventCategory} (${delayedEvent.latencies.totalEndToEndMs} ms).`
    );
  }

  if (latencyObservations.delayedCriticalEvents.length > 0) {
    appendUnique(
      improvementSuggestions,
      "Reduzir latência perceptiva em eventos críticos como ritmo e choque."
    );
  }

  if (
    strengths.length === 0 &&
    delaysOrDeviations.length === 0 &&
    evaluation.feedback.length > 0
  ) {
    appendUnique(strengths, evaluation.feedback[0]);
  }

  return {
    summary: buildSummary(strengths, delaysOrDeviations, evaluation.feedback),
    strengths,
    delaysOrDeviations,
    improvementSuggestions,
  };
}

export type { AclsClinicalCaseAnalysis, AnalyzeAclsCaseInput };
export { analyzeAclsCase };
