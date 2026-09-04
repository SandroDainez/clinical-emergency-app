export type ClinicalSnapshotDomain =
  | "engine"
  | "event_log"
  | "observations"
  | "handoffs"
  | "interruptions"
  | "reassessments"
  | "decision_confirmations"
  | "vasopressor_reassessment"
  | "patient_context"
  | "module_ui";

export const REQUIRED_CLINICAL_SNAPSHOT_DOMAINS: ClinicalSnapshotDomain[] = [
  "engine",
  "event_log",
  "observations",
  "handoffs",
  "interruptions",
  "reassessments",
  "decision_confirmations",
  "vasopressor_reassessment",
  "patient_context",
  "module_ui",
];

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ClinicalSnapshotDomainPayload = {
  status: "captured" | "unsupported";
  payload?: JsonValue;
};

export type ClinicalCaseSnapshotV1 = {
  schemaVersion: 1;
  caseId: string;
  protocolId: string;
  startedAt: number;
  capturedAt: number;
  domains: Record<ClinicalSnapshotDomain, ClinicalSnapshotDomainPayload>;
};

/**
 * Snapshot clínico só é restaurável quando TODOS os domínios obrigatórios foram
 * capturados. Isto impede a pior classe de falha de reidratação: reconstruir
 * apenas a tela/engine e perder silenciosamente droga já administrada, fatos,
 * handoffs ou reavaliações pendentes.
 */
export function isClinicalCaseSnapshotRestorable(
  snapshot: ClinicalCaseSnapshotV1
): boolean {
  if (snapshot.schemaVersion !== 1) return false;
  if (!snapshot.caseId.trim() || !snapshot.protocolId.trim()) return false;
  if (!Number.isFinite(snapshot.startedAt) || !Number.isFinite(snapshot.capturedAt)) return false;
  if (snapshot.capturedAt < snapshot.startedAt) return false;

  return REQUIRED_CLINICAL_SNAPSHOT_DOMAINS.every(
    (domain) => snapshot.domains[domain]?.status === "captured"
  );
}

/**
 * Enquanto qualquer store ainda não tiver export/import canônico, o caller deve
 * persistir no máximo um snapshot incompleto para diagnóstico/auditoria e manter
 * o runtime em fail-closed. Nunca converter "unsupported" em vazio por padrão.
 */
export function listMissingClinicalSnapshotDomains(
  snapshot: ClinicalCaseSnapshotV1
): ClinicalSnapshotDomain[] {
  return REQUIRED_CLINICAL_SNAPSHOT_DOMAINS.filter(
    (domain) => snapshot.domains[domain]?.status !== "captured"
  );
}
