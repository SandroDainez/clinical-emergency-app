import type { AvcAuditEntry } from "./domain";

let auditCounter = 0;

export function createAuditEntry(
  actor: string,
  kind: AvcAuditEntry["kind"],
  label: string,
  details?: string,
  metadata?: Record<string, string>
): AvcAuditEntry {
  auditCounter += 1;
  return {
    id: `avc-audit-${auditCounter}`,
    timestamp: Date.now(),
    actor: actor || "Profissional não identificado",
    kind,
    label,
    details,
    metadata,
  };
}
