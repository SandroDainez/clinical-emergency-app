export type PersistedClinicalCaseMarker = {
  caseId: string;
  protocolId?: string;
  startedAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "emergencias2:active-clinical-case:v1";

function getSessionStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function writeActiveClinicalCaseMarker(marker: PersistedClinicalCaseMarker): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(marker));
  } catch {
    // Persistência auxiliar nunca pode derrubar o atendimento em curso.
  }
}

export function readActiveClinicalCaseMarker(): PersistedClinicalCaseMarker | undefined {
  const storage = getSessionStorage();
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<PersistedClinicalCaseMarker>;
    if (typeof parsed.caseId !== "string" || !parsed.caseId.trim()) return undefined;
    if (typeof parsed.startedAt !== "number" || !Number.isFinite(parsed.startedAt)) return undefined;
    if (typeof parsed.updatedAt !== "number" || !Number.isFinite(parsed.updatedAt)) return undefined;
    return {
      caseId: parsed.caseId,
      protocolId: typeof parsed.protocolId === "string" ? parsed.protocolId : undefined,
      startedAt: parsed.startedAt,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return undefined;
  }
}

export function clearActiveClinicalCaseMarker(): void {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Sem efeito clínico: apenas remove a sentinela de reload quando disponível.
  }
}

/**
 * Sentinela fail-closed para reload: se existe marcador persistido, mas o runtime
 * em memória não possui mais o mesmo caseId, houve perda do estado volátil.
 *
 * Isto NÃO é reidratação do atendimento. O objetivo é impedir que o app trate
 * um reload como um caso novo silencioso e volte a oferecer intervenções já
 * realizadas sem reconciliação explícita.
 */
export function detectInterruptedClinicalCase(activeCaseId?: string): PersistedClinicalCaseMarker | undefined {
  const marker = readActiveClinicalCaseMarker();
  if (!marker) return undefined;
  if (activeCaseId && marker.caseId === activeCaseId) return undefined;
  return marker;
}
