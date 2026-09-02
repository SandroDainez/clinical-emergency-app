import { getAllClinicalObservations, formatObservationAge } from "./clinical-observations";
import { peekClinicalInterruption } from "./clinical-interruption-session";
import { crisisActionsForModule, type CrisisActionDefinition } from "./crisis-actions";

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
  returnContext?: string;
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
 * recentes, sempre acompanhadas da idade do dado, e revela a origem de uma
 * interrupção ativa quando o módulo atual é o destino do topo da pilha.
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

  const interruption = peekClinicalInterruption();
  const returnContext =
    interruption && interruption.toModule === input.moduleSlug && interruption.returnModule
      ? interruption.returnLabel || interruption.returnModule
      : undefined;

  return {
    protocol: input.protocol,
    phase: input.phase,
    step: input.step,
    metrics,
    crisisActions: crisisActionsForModule(input.moduleSlug),
    returnContext,
  };
}
