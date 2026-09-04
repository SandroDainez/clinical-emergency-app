import type { ClinicalHandoffPayload } from "./clinical-handoff-payload";

const pending: ClinicalHandoffPayload[] = [];

export function publishClinicalHandoff(payload: ClinicalHandoffPayload): void {
  if (pending.some((item) => item.id === payload.id)) {
    throw new Error(`Handoff duplicado: ${payload.id}`);
  }
  pending.push({
    ...payload,
    facts: payload.facts.map((fact) => ({ ...fact })),
  });
}

export function peekClinicalHandoff(
  toModule: string,
  transitionId?: string
): ClinicalHandoffPayload | undefined {
  const payload = pending.find(
    (item) => item.toModule === toModule && (!transitionId || item.transitionId === transitionId)
  );
  return payload
    ? { ...payload, facts: payload.facts.map((fact) => ({ ...fact })) }
    : undefined;
}

/** Consome exatamente um payload pendente destinado ao módulo atual. */
export function consumeClinicalHandoff(
  toModule: string,
  transitionId?: string
): ClinicalHandoffPayload | undefined {
  const index = pending.findIndex(
    (item) => item.toModule === toModule && (!transitionId || item.transitionId === transitionId)
  );
  if (index < 0) return undefined;
  const [payload] = pending.splice(index, 1);
  return { ...payload, facts: payload.facts.map((fact) => ({ ...fact })) };
}

export function listPendingClinicalHandoffs(): ClinicalHandoffPayload[] {
  return pending.map((payload) => ({
    ...payload,
    facts: payload.facts.map((fact) => ({ ...fact })),
  }));
}

export function exportClinicalHandoffsSnapshot(): ClinicalHandoffPayload[] {
  return listPendingClinicalHandoffs();
}

export function restoreClinicalHandoffsSnapshot(snapshot: ClinicalHandoffPayload[]): void {
  clearClinicalHandoffs();
  for (const payload of snapshot) publishClinicalHandoff(payload);
}

export function clearClinicalHandoffs(): void {
  pending.length = 0;
}
