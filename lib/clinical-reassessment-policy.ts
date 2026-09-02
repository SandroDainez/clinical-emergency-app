export type CriticalTherapyReassessmentRule = {
  therapyId: string;
  label: string;
  reassessmentRequired: boolean;
  reassessmentWithinMinutes?: number;
  reassessmentSignals: readonly string[];
};

export const CRITICAL_THERAPY_REASSESSMENT: readonly CriticalTherapyReassessmentRule[] = [
  {
    therapyId: "fibrinolysis",
    label: "Fibrinólise",
    reassessmentRequired: true,
    reassessmentSignals: ["estado neurológico", "hemodinâmica", "sangramento", "resposta à reperfusão"],
  },
  {
    therapyId: "cardioversion",
    label: "Cardioversão elétrica",
    reassessmentRequired: true,
    reassessmentSignals: ["ritmo", "pulso", "pressão arterial", "perfusão"],
  },
  {
    therapyId: "intubation",
    label: "Intubação traqueal",
    reassessmentRequired: true,
    reassessmentSignals: ["capnografia", "oxigenação", "ventilação", "hemodinâmica"],
  },
  {
    therapyId: "vasopressor_start",
    label: "Início ou escalonamento de vasopressor",
    reassessmentRequired: true,
    reassessmentSignals: ["PAM", "perfusão", "frequência cardíaca", "efeitos adversos"],
  },
  {
    therapyId: "epinephrine_anaphylaxis",
    label: "Adrenalina na anafilaxia",
    reassessmentRequired: true,
    reassessmentSignals: ["via aérea", "respiração", "pressão arterial", "perfusão"],
  },
];

export function getCriticalTherapyReassessmentRule(therapyId: string): CriticalTherapyReassessmentRule | undefined {
  return CRITICAL_THERAPY_REASSESSMENT.find((rule) => rule.therapyId === therapyId);
}
