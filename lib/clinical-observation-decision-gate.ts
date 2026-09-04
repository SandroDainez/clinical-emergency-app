import {
  classifyObservationFreshness,
  getClinicalObservation,
  type ClinicalObservation,
  type ObservationFreshness,
} from "./clinical-observations";

export type ObservationDecisionPolicy = {
  decisionId: string;
  observationId: string;
  freshForMs: number;
  staleAfterMs: number;
};

export type ObservationDecisionResolution =
  | { status: "missing"; decisionId: string; observationId: string }
  | { status: "ready"; decisionId: string; observation: ClinicalObservation; freshness: Exclude<ObservationFreshness, "stale"> }
  | { status: "confirmation_required"; decisionId: string; observation: ClinicalObservation; freshness: "stale" }
  | { status: "confirmed_stale"; decisionId: string; observation: ClinicalObservation; freshness: "stale"; confirmedAt: number };

type StaleConfirmation = {
  decisionId: string;
  observationId: string;
  observationRecordedAt: number;
  confirmedAt: number;
};

const confirmations = new Map<string, StaleConfirmation>();

function confirmationKey(decisionId: string, observationId: string): string {
  return `${decisionId}::${observationId}`;
}

function assertPolicy(policy: ObservationDecisionPolicy): void {
  if (!policy.decisionId.trim()) throw new Error("decisionId obrigatório");
  if (!policy.observationId.trim()) throw new Error("observationId obrigatório");
  if (policy.freshForMs < 0) throw new Error("freshForMs não pode ser negativo");
  if (policy.staleAfterMs <= policy.freshForMs) throw new Error("staleAfterMs deve ser maior que freshForMs");
}

/**
 * Única porta segura para uma decisão reutilizar uma observação volátil.
 * A janela é declarada pela decisão consumidora; este runtime não inventa
 * validade clínica global. Dado stale nunca é devolvido como `ready`.
 */
export function resolveObservationForDecision(
  policy: ObservationDecisionPolicy,
  now: number = Date.now()
): ObservationDecisionResolution {
  assertPolicy(policy);
  const observation = getClinicalObservation(policy.observationId);
  if (!observation) return { status: "missing", decisionId: policy.decisionId, observationId: policy.observationId };

  const freshness = classifyObservationFreshness(observation, policy, now);
  if (freshness !== "stale") return { status: "ready", decisionId: policy.decisionId, observation, freshness };

  const confirmation = confirmations.get(confirmationKey(policy.decisionId, policy.observationId));
  if (confirmation?.observationRecordedAt === observation.recordedAt) {
    return {
      status: "confirmed_stale",
      decisionId: policy.decisionId,
      observation,
      freshness,
      confirmedAt: confirmation.confirmedAt,
    };
  }

  return { status: "confirmation_required", decisionId: policy.decisionId, observation, freshness };
}

/** Confirma somente a medição registrada agora, nunca futuras atualizações. */
export function confirmStaleObservationForDecision(
  policy: ObservationDecisionPolicy,
  now: number = Date.now()
): ObservationDecisionResolution {
  const pending = resolveObservationForDecision(policy, now);
  if (pending.status !== "confirmation_required") return pending;

  confirmations.set(confirmationKey(policy.decisionId, policy.observationId), {
    decisionId: policy.decisionId,
    observationId: policy.observationId,
    observationRecordedAt: pending.observation.recordedAt,
    confirmedAt: now,
  });
  return resolveObservationForDecision(policy, now);
}

export type ObservationDecisionConfirmationSnapshot = StaleConfirmation[];

export function exportObservationDecisionConfirmationsSnapshot(): ObservationDecisionConfirmationSnapshot {
  return [...confirmations.values()].map((item) => ({ ...item }));
}

export function restoreObservationDecisionConfirmationsSnapshot(snapshot: ObservationDecisionConfirmationSnapshot): void {
  clearObservationDecisionConfirmations();
  for (const item of snapshot) {
    if (!item.decisionId.trim() || !item.observationId.trim()) {
      throw new Error("Snapshot de confirmação de observação inválido");
    }
    if (!Number.isFinite(item.observationRecordedAt) || !Number.isFinite(item.confirmedAt)) {
      throw new Error("Snapshot de confirmação de observação com timestamp inválido");
    }
    confirmations.set(confirmationKey(item.decisionId, item.observationId), { ...item });
  }
}

/** Novo atendimento: nenhuma confirmação anterior pode sobreviver. */
export function clearObservationDecisionConfirmations(): void {
  confirmations.clear();
}
