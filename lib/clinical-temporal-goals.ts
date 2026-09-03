import type { ClinicalEvent, ClinicalEventType } from "./clinical-event-log";

export type ClinicalTemporalGoalStatus =
  | "met"
  | "missed"
  | "pending"
  | "not_evaluable";

export type ClinicalTemporalGoalEventMatcher = {
  type: ClinicalEventType;
  module?: string;
  dataEquals?: Record<string, string | number | boolean | null>;
};

export type ClinicalTemporalGoalDeadline =
  | {
      /** Prazo explícito relativo ao evento de início. */
      kind: "elapsed_ms";
      maxElapsedMs: number;
      /** Referência auditável da regra; não permite número clínico órfão. */
      source: string;
    }
  | {
      /**
       * O produtor do evento já conhece o instante-limite e o publica no data.
       * Preferível quando o próprio runtime clínico calcula a janela.
       */
      kind: "event_data_timestamp";
      dataKey: string;
      source: string;
    };

export type ClinicalTemporalGoalContract = {
  id: string;
  label: string;
  start: ClinicalTemporalGoalEventMatcher;
  success: ClinicalTemporalGoalEventMatcher;
  deadline?: ClinicalTemporalGoalDeadline;
  /** Evento que prova violação sem o debrief precisar recalcular regra clínica. */
  failure?: ClinicalTemporalGoalEventMatcher;
};

export type ClinicalTemporalGoalResult = {
  goalId: string;
  label: string;
  status: ClinicalTemporalGoalStatus;
  startedAt?: number;
  completedAt?: number;
  deadlineAt?: number;
  elapsedMs?: number;
  source?: string;
  reason: string;
};

function matches(event: ClinicalEvent, matcher: ClinicalTemporalGoalEventMatcher): boolean {
  if (event.type !== matcher.type) return false;
  if (matcher.module && event.module !== matcher.module) return false;

  for (const [key, expected] of Object.entries(matcher.dataEquals ?? {})) {
    if (event.data?.[key] !== expected) return false;
  }
  return true;
}

function resolveDeadlineAt(
  startEvent: ClinicalEvent,
  deadline: ClinicalTemporalGoalDeadline | undefined
): number | undefined {
  if (!deadline) return undefined;

  if (deadline.kind === "elapsed_ms") {
    if (!Number.isFinite(deadline.maxElapsedMs) || deadline.maxElapsedMs < 0) {
      throw new Error("Meta temporal com maxElapsedMs inválido");
    }
    if (!deadline.source.trim()) {
      throw new Error("Meta temporal numérica sem fonte declarada");
    }
    return startEvent.occurredAt + deadline.maxElapsedMs;
  }

  if (!deadline.source.trim()) {
    throw new Error("Meta temporal baseada em timestamp sem fonte declarada");
  }
  const raw = startEvent.data?.[deadline.dataKey];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : undefined;
}

/**
 * Deriva debrief temporal sem incorporar guideline dentro do analisador.
 *
 * - regra/limiar pertence ao contrato (com fonte) OU chega pronta do runtime;
 * - evento de falha explícito prevalece sobre inferência;
 * - sem deadline disponível, o resultado é `not_evaluable`, não "adequado";
 * - ausência de sucesso antes de um prazo ainda futuro é `pending`.
 */
export function evaluateClinicalTemporalGoals(
  events: readonly ClinicalEvent[],
  goals: readonly ClinicalTemporalGoalContract[],
  now: number = Date.now()
): ClinicalTemporalGoalResult[] {
  const ordered = [...events].sort((a, b) => a.occurredAt - b.occurredAt);

  return goals.map((goal) => {
    if (!goal.id.trim() || !goal.label.trim()) {
      throw new Error("Meta temporal sem id ou label");
    }

    const startEvent = ordered.find((event) => matches(event, goal.start));
    if (!startEvent) {
      return {
        goalId: goal.id,
        label: goal.label,
        status: "not_evaluable",
        source: goal.deadline?.source,
        reason: "Evento de início da meta não foi documentado",
      };
    }

    const failureEvent = goal.failure
      ? ordered.find(
          (event) => event.occurredAt >= startEvent.occurredAt && matches(event, goal.failure!)
        )
      : undefined;
    const successEvent = ordered.find(
      (event) => event.occurredAt >= startEvent.occurredAt && matches(event, goal.success)
    );
    const deadlineAt = resolveDeadlineAt(startEvent, goal.deadline);

    if (failureEvent && (!successEvent || failureEvent.occurredAt <= successEvent.occurredAt)) {
      return {
        goalId: goal.id,
        label: goal.label,
        status: "missed",
        startedAt: startEvent.occurredAt,
        completedAt: successEvent?.occurredAt,
        deadlineAt,
        elapsedMs: successEvent ? successEvent.occurredAt - startEvent.occurredAt : undefined,
        source: goal.deadline?.source,
        reason: `Violação temporal documentada: ${failureEvent.label}`,
      };
    }

    if (deadlineAt === undefined) {
      return {
        goalId: goal.id,
        label: goal.label,
        status: "not_evaluable",
        startedAt: startEvent.occurredAt,
        completedAt: successEvent?.occurredAt,
        elapsedMs: successEvent ? successEvent.occurredAt - startEvent.occurredAt : undefined,
        source: goal.deadline?.source,
        reason: "Prazo da meta não está disponível no evento/contrato",
      };
    }

    if (successEvent) {
      const elapsedMs = successEvent.occurredAt - startEvent.occurredAt;
      return {
        goalId: goal.id,
        label: goal.label,
        status: successEvent.occurredAt <= deadlineAt ? "met" : "missed",
        startedAt: startEvent.occurredAt,
        completedAt: successEvent.occurredAt,
        deadlineAt,
        elapsedMs,
        source: goal.deadline?.source,
        reason:
          successEvent.occurredAt <= deadlineAt
            ? "Ação concluída dentro do prazo declarado"
            : "Ação concluída após o prazo declarado",
      };
    }

    return {
      goalId: goal.id,
      label: goal.label,
      status: now > deadlineAt ? "missed" : "pending",
      startedAt: startEvent.occurredAt,
      deadlineAt,
      source: goal.deadline?.source,
      reason:
        now > deadlineAt
          ? "Prazo declarado expirou sem conclusão documentada"
          : "Aguardando conclusão antes do prazo declarado",
    };
  });
}
