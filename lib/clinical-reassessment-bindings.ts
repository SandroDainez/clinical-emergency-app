export type ClinicalReassessmentBinding = {
  moduleId: string;
  therapyNodeId: string;
  reassessmentNodeId: string;
  therapyId: string;
  label: string;
};

/**
 * Primeiros bindings reais entre terapia crítica e reavaliação explícita.
 *
 * Não alteram a árvore. O runtime observa a visita aos nós existentes e mantém
 * uma obrigação pendente entre o nó de terapia e o nó de reavaliação.
 */
export const CLINICAL_REASSESSMENT_BINDINGS: readonly ClinicalReassessmentBinding[] = [
  {
    moduleId: "anafilaxia",
    therapyNodeId: "immediate_im_epinephrine",
    reassessmentNodeId: "severity_stratification",
    therapyId: "epinephrine_anaphylaxis",
    label: "Reavaliar resposta após adrenalina IM",
  },
  {
    moduleId: "isr",
    therapyNodeId: "intubacao",
    reassessmentNodeId: "confirmacao",
    therapyId: "intubation",
    label: "Confirmar posição traqueal após passagem do tubo",
  },
  {
    moduleId: "avc",
    therapyNodeId: "trombolise",
    reassessmentNodeId: "isq_trombectomia_check",
    therapyId: "fibrinolysis",
    label: "Reavaliar estratégia de reperfusão após trombólise",
  },
] as const;

export function reassessmentBindingForNode(moduleId: string, nodeId: string):
  | { role: "therapy" | "reassessment"; binding: ClinicalReassessmentBinding }
  | undefined {
  for (const binding of CLINICAL_REASSESSMENT_BINDINGS) {
    if (binding.moduleId !== moduleId) continue;
    if (binding.therapyNodeId === nodeId) return { role: "therapy", binding };
    if (binding.reassessmentNodeId === nodeId) return { role: "reassessment", binding };
  }
  return undefined;
}
