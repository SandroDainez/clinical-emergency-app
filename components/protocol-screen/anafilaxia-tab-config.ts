/** Anafilaxia / choque anafilático — abas. */

export const ANAFILAXIA_SECTION_TO_TAB: Record<string, number> = {
  "Paciente e exposição": 0,
  "Manifestações e vital": 1,
  "Tratamento na emergência": 2,
  "Evolução e destino": 3,
};

export type AnafilaxiaTabDef = {
  id: number;
  icon: string;
  label: string;
  step: string;
  phaseTitle: string;
  guide: string;
};

export const ANAFILAXIA_TABS: AnafilaxiaTabDef[] = [
  {
    id: 0,
    icon: "🧬",
    label: "Exposição",
    step: "1",
    phaseTitle: "Quem é o paciente e o que desencadeou",
    guide: "",
  },
  {
    id: 1,
    icon: "🩺",
    label: "Clínico",
    step: "2",
    phaseTitle: "Pele, vias aéreas, circulação, digestivo",
    guide: "",
  },
  {
    id: 2,
    icon: "💉",
    label: "Tratamento",
    step: "3",
    phaseTitle: "O que já foi feito na sala",
    guide: "",
  },
  {
    id: 3,
    icon: "📋",
    label: "Evolução",
    step: "4",
    phaseTitle: "Resposta, observação e alta",
    guide: "",
  },
];
