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
    phaseTitle: "Quem é o paciente e qual o contexto da descompensação",
    guide: "Confirme identificação, diabetes prévio, uso de insulina e fatores que podem ter precipitado CAD ou EHH.",
  },
  {
    id: 1,
    icon: "🩺",
    label: "Sinais vitais e exame clínico",
    step: "2",
    phaseTitle: "Como o paciente chega à sala",
    guide: "Registre nível de consciência, hidratação, perfusão, respiração e sinais vitais antes da conduta.",
  },
  {
    id: 2,
    icon: "🔬",
    label: "Laboratório",
    step: "3",
    phaseTitle: "Entender a gravidade pelos exames",
    guide: "Cheque glicose, gasometria, cetonas, sódio, potássio e função renal antes de avançar no tratamento.",
  },
  {
    id: 3,
    icon: "💉",
    label: "Tratamento",
    step: "4",
    phaseTitle: "Organizar fluido, potássio e insulina na ordem certa",
    guide: "Use esta fase para decidir reposição volêmica, correção de potássio e início seguro da insulina.",
  },
  {
    id: 4,
    icon: "📈",
    label: "Evolução",
    step: "5",
    phaseTitle: "Checar resposta e definir o próximo destino",
    guide: "Só conclua quando a resposta estiver clara e o plano de UTI, enfermaria ou transição estiver decidido.",
  },
];
