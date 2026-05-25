/** Módulo ventilação mecânica — abas e roteiro educativo. */

export const VENT_SECTION_TO_TAB: Record<string, number> = {
  "Paciente e cenário": 0,
  "Ventilador — ajustes atuais": 1,
  "Gasometria e mecânica pulmonar": 2,
  "Anotações": 3,
};

export type VentTabDef = {
  id: number;
  icon: string;
  label: string;
  step: string;
  phaseTitle: string;
  headline: string;
  description: string;
  guide: string;
};

export const VENT_TABS: VentTabDef[] = [
  {
    id: 0,
    icon: "🫁",
    label: "Cenário",
    step: "1",
    phaseTitle: "Dados a serem preenchidos para parâmetros ventilatórios iniciais",
    headline: "Dados a serem preenchidos para parâmetros ventilatórios iniciais",
    description:
      "Preencha os dados clínicos e fisiológicos principais para o sistema montar um ponto de partida ventilatório coerente com o cenário.",
    guide: "",
  },
  {
    id: 1,
    icon: "⚙️",
    label: "Ventilador",
    step: "2",
    phaseTitle: "Parâmetros ventilatórios iniciais",
    headline: "Parâmetros ventilatórios iniciais",
    description:
      "Confira o setup inicial, ajuste os parâmetros conforme o caso e deixe o sistema sinalizar quando a configuração se afastar do mais adequado.",
    guide: "",
  },
  {
    id: 2,
    icon: "🧪",
    label: "Gasometria",
    step: "3",
    phaseTitle: "Parâmetros gasométricos para ajuste de ventilação",
    headline: "Parâmetros gasométricos para ajuste de ventilação",
    description:
      "Informe gasometria e mecânica pulmonar quando houver necessidade de refinar ventilação, oxigenação ou proteção pulmonar.",
    guide: "",
  },
  {
    id: 3,
    icon: "📋",
    label: "Após ajustes",
    step: "4",
    phaseTitle: "Novos parâmetros ventilatórios após ajustes",
    headline: "Novos parâmetros ventilatórios após ajustes",
    description:
      "Revise os parâmetros recalculados, siga a orientação clínica do sistema para a situação atual e consolide o plano final de reavaliação.",
    guide: "",
  },
];
