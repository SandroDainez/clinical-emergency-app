import { getAllClinicalObservations, formatObservationAge } from "./clinical-observations";
import { getCrisisActionsForModule, type CrisisActionDefinition } from "./crisis-actions";

export type ClinicalShellMetric = {
  id: string;
  label: string;
  value: string;
  age?: string;
  attention?: boolean;
};

export type ClinicalShellSnapshot = {
  protocol: string;
  phase: string;
  step: number;
  metrics: ClinicalShellMetric[];
  crisisActions: CrisisActionDefinition[];
};

const LABELS: Record<string, string> = {
  pa: "PA",
  pas: "PAS",
  pad: "PAD",
  fc: "FC",
  fr: "FR",
  spo2: "SpO₂",
  glicemia: "Glicemia",
  glasgow: "Glasgow",
  temperatura: "Temp",
};

/**
 * Traduz o runtime clínico para dados puramente apresentacionais do shell.
 *
 * Não navega, não decide e não classifica elegibilidade. A única seleção feita
 * aqui é de apresentação: mantém no cockpit no máximo quatro observações mais
 * recentes, sempre acompanhadas da idade do dado.
 */
export function buildClinicalShellSnapshot(input: {
  protocol: string;
  phase: string;
  step: number;
  moduleSlug?: string;
  now?: number;
}): ClinicalShellSnapshot {
  const now = input.now ?? Date.now();
  const metrics = getAllClinicalObservations()
    .slice(0, 4)
    .map((observation) => ({
      id: observation.id,
      label: LABELS[observation.id.toLowerCase()] ?? observation.id,
      value: observation.unit ? `${observation.value} ${observation.unit}` : observation.value,
      age: formatObservationAge(observation, now),
    }));

  return {
    protocol: input.protocol,
    phase: input.phase,
    step: input.step,
    metrics,
    crisisActions: getCrisisActionsForModule(input.moduleSlug),
  };
}
