import type { CoronaryAuditEntry } from "./domain";

let auditCounter = 0;

export function createCoronaryAuditEntry(
  actor: string,
  kind: CoronaryAuditEntry["kind"],
  label: string,
  details?: string,
  metadata?: Record<string, string>
): CoronaryAuditEntry {
  auditCounter += 1;
  return {
    id: `coronary-audit-${auditCounter}`,
    timestamp: Date.now(),
    actor: actor || "Profissional não identificado",
    kind,
    label,
    details,
    metadata,
  };
}
