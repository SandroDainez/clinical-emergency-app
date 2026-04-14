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
  guide: string;
};

export const VENT_TABS: VentTabDef[] = [
  {
    id: 0,
    icon: "🫁",
    label: "Cenário",
    step: "1",
    phaseTitle: "Quem é o paciente e qual o problema pulmonar",
    guide: "",
  },
  {
    id: 1,
    icon: "⚙️",
    label: "Ventilador",
    step: "2",
    phaseTitle: "Quais parâmetros iniciar no ventilador e o que conferir no aparelho",
    guide: "",
  },
  {
    id: 2,
    icon: "🧪",
    label: "Gasometria",
    step: "3",
    phaseTitle: "O que o sangue mostra",
    guide: "",
  },
  {
    id: 3,
    icon: "📋",
    label: "Setup recomendado",
    step: "4",
    phaseTitle: "O que colocar agora no respirador e como reavaliar",
    guide: "",
  },
];
