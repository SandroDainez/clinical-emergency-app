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
    phaseTitle: "Entender o doente antes de montar o ventilador",
    headline: "Entender o doente antes de montar o ventilador",
    description:
      "Preencha os dados clínicos e fisiológicos principais para o sistema montar um ponto de partida ventilatório coerente com o cenário.",
    guide: "Preencha peso, gasometria inicial e contexto clínico antes de aceitar qualquer ajuste sugerido.",
  },
  {
    id: 1,
    icon: "⚙️",
    label: "Ventilador",
    step: "2",
    phaseTitle: "Montar o setup inicial com segurança",
    headline: "Montar o setup inicial com segurança",
    description:
      "Confira o setup inicial, ajuste os parâmetros conforme o caso e deixe o sistema sinalizar quando a configuração se afastar do mais adequado.",
    guide: "Use esta fase para ajustar modo, volume, frequência, PEEP e FiO₂ com base no objetivo clínico do caso.",
  },
  {
    id: 2,
    icon: "🧪",
    label: "Gasometria",
    step: "3",
    phaseTitle: "Rever ventilação depois da resposta do paciente",
    headline: "Rever ventilação depois da resposta do paciente",
    description:
      "Informe gasometria e mecânica pulmonar quando houver necessidade de refinar ventilação, oxigenação ou proteção pulmonar.",
    guide: "Preencha a resposta do paciente para decidir se precisa ventilar mais, oxigenar mais ou proteger melhor o pulmão.",
  },
  {
    id: 3,
    icon: "📋",
    label: "Após ajustes",
    step: "4",
    phaseTitle: "Conferir o plano final e a próxima reavaliação",
    headline: "Conferir o plano final e a próxima reavaliação",
    description:
      "Revise os parâmetros recalculados, siga a orientação clínica do sistema para a situação atual e consolide o plano final de reavaliação.",
    guide: "Saia desta fase com parâmetros revistos, meta definida e horário claro para nova checagem.",
  },
];
