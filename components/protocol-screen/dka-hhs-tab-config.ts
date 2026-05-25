/**
 * CAD / EHH — abas, mapeamento de seções e texto do roteiro de emergência.
 */

export const DKA_HHS_SECTION_TO_TAB: Record<string, number> = {
  "Identificação do paciente": 0,
  "Diabetes, insulina e riscos": 0,
  "Sinais vitais e exame clínico": 1,
  "Primeiros minutos — emergência": 1,
  "Estabilização inicial": 3,
  "Hidratação orientada pelo caso": 3,
  Laboratório: 2,
  "Tratamento — condutas registradas": 3,
  "Evolução e destino": 4,
};

export type DkaHhsTabDef = {
  id: number;
  icon: string;
  label: string;
  step: string;
  /** Instruções detalhadas da aba (linhas com \n). */
  guide: string;
  /** Título curto para a barra de progresso no topo. */
  phaseTitle: string;
};

export const DKA_HHS_TABS: DkaHhsTabDef[] = [
  {
    id: 0,
    icon: "👤",
    label: "Paciente",
    step: "1",
    phaseTitle: "",
    guide: "",
  },
  {
    id: 1,
    icon: "🩺",
    label: "Sinais vitais e exame clínico",
    step: "2",
    phaseTitle: "",
    guide: "",
  },
  {
    id: 2,
    icon: "🔬",
    label: "Laboratório",
    step: "3",
    phaseTitle: "",
    guide: "",
  },
  {
    id: 3,
    icon: "💉",
    label: "Tratamento",
    step: "4",
    phaseTitle: "",
    guide: "",
  },
  {
    id: 4,
    icon: "📈",
    label: "Evolução",
    step: "5",
    phaseTitle: "",
    guide: "",
  },
];
