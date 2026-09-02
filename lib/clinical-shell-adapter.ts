import { getAllClinicalObservations, formatObservationAge } from "./clinical-observations";
import { peekClinicalInterruption } from "./clinical-interruption-session";
import { getCriticalTherapyReassessmentRule } from "./clinical-reassessment-policy";
import { listPendingClinicalReassessments } from "./clinical-reassessment-runtime";
import { crisisActionsForModule, type CrisisActionDefinition } from "./crisis-actions";

export type ClinicalShellMetric = {
  id: string;
  label: string;
  value: string;
  age?: string;
  attention?: boolean;
};

export type ClinicalShellReassessmentAlert = {
  id: string;
  title: string;
  signals: string[];
  elapsedLabel: string;
  overdue: boolean;
  pendingCount: number;
};

export type ClinicalShellSnapshot = {
  protocol: string;
  phase: string;
  step: number;
  metrics: ClinicalShellMetric[];
  crisisActions: CrisisActionDefinition[];
  returnContext?: string;
  reassessmentAlert?: ClinicalShellReassessmentAlert;
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

function formatElapsed(startedAt: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} h ${remainder} min` : `${hours} h`;
}

/**
 * Traduz o runtime clínico para dados puramente apresentacionais do shell.
 *
 * Não navega, não decide e não classifica elegibilidade. A única seleção feita
 * aqui é de apresentação: mantém no cockpit no máximo quatro observações mais
 * recentes, sempre acompanhadas da idade do dado, revela a origem de uma
 * interrupção ativa e mostra a obrigação de reavaliação mais antiga ainda
 * pendente. O adapter não conclui se a resposta clínica foi adequada.
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
      value: observation.unit ? `${observation.value} ${observation.unit}` : String(observation.value),
      age: formatObservationAge(observation, now),
    }));

  const interruption = peekClinicalInterruption();
  const returnContext =
    interruption && interruption.toModule === input.moduleSlug && interruption.returnModule
      ? interruption.returnLabel || interruption.returnModule
      : undefined;

  const pending = listPendingClinicalReassessments().sort((a, b) => a.startedAt - b.startedAt);
  const oldest = pending[0];
  const rule = oldest ? getCriticalTherapyReassessmentRule(oldest.therapyId) : undefined;
  const reassessmentAlert = oldest
    ? {
        id: oldest.id,
        title: rule?.label ? `Reavaliar após ${rule.label}` : `Reavaliar após ${oldest.therapyId}`,
        signals: [...(rule?.reassessmentSignals ?? [])],
        elapsedLabel: formatElapsed(oldest.startedAt, now),
        overdue: oldest.dueAt !== undefined && now > oldest.dueAt,
        pendingCount: pending.length,
      }
    : undefined;

  return {
    protocol: input.protocol,
    phase: input.phase,
    step: input.step,
    metrics,
    crisisActions: crisisActionsForModule(input.moduleSlug),
    returnContext,
    reassessmentAlert,
  };
}
