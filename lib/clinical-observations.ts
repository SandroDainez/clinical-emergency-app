export type ClinicalObservationSource = "manual" | "device" | "derived" | "imported";

export type ClinicalObservation = {
  id: string;
  value: string;
  unit?: string;
  recordedAt: number;
  source: ClinicalObservationSource;
  originModule?: string;
};

export type ObservationFreshness = "fresh" | "aging" | "stale";

/**
 * Observações clínicas voláteis do atendimento atual.
 *
 * Diferente de `contexto-do-paciente.ts`, este registro PODE guardar sinais
 * vitais e exames porque nunca os apresenta como "atuais" sem o horário.
 * A idade do dado viaja junto com o valor e deve ser exibida ao usuário.
 *
 * Este arquivo ainda não substitui nenhum fluxo existente; é a base segura para
 * a migração progressiva do Patient State 2.0.
 */
const observations = new Map<string, ClinicalObservation>();

export function recordClinicalObservation(observation: ClinicalObservation): void {
  if (!observation.id.trim()) return;
  if (!observation.value.trim()) return;
  observations.set(observation.id, {
    ...observation,
    id: observation.id.trim(),
    value: observation.value.trim(),
  });
}

export function getClinicalObservation(id: string): ClinicalObservation | undefined {
  return observations.get(id);
}

export function getAllClinicalObservations(): ClinicalObservation[] {
  return [...observations.values()].sort((a, b) => b.recordedAt - a.recordedAt);
}

export function getObservationAgeMs(
  observation: ClinicalObservation,
  now: number = Date.now()
): number {
  return Math.max(0, now - observation.recordedAt);
}

export function classifyObservationFreshness(
  observation: ClinicalObservation,
  options: { freshForMs: number; staleAfterMs: number },
  now: number = Date.now()
): ObservationFreshness {
  const age = getObservationAgeMs(observation, now);
  if (age <= options.freshForMs) return "fresh";
  if (age >= options.staleAfterMs) return "stale";
  return "aging";
}

export function formatObservationAge(
  observation: ClinicalObservation,
  now: number = Date.now()
): string {
  const seconds = Math.floor(getObservationAgeMs(observation, now) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function exportClinicalObservationsSnapshot(): ClinicalObservation[] {
  return getAllClinicalObservations();
}

export function restoreClinicalObservationsSnapshot(snapshot: ClinicalObservation[]): void {
  clearClinicalObservations();
  for (const observation of snapshot) recordClinicalObservation(observation);
}

/** Novo paciente: nenhum sinal vital/exame pode sobreviver. */
export function clearClinicalObservations(): void {
  observations.clear();
}
