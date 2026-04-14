/** Anafilaxia / choque anafilático — abas. */

export const ANAFILAXIA_SECTION_TO_TAB: Record<string, number> = {
  "Paciente e exposição": 0,
  "Sinais vitais e exame clínico": 1,
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
    label: "Paciente",
    step: "1",
    phaseTitle: "Dados do paciente e exposição",
    guide: "",
  },
  {
    id: 1,
    icon: "🩺",
    label: "Clínico",
    step: "2",
    phaseTitle: "Sinais vitais e exame clínico básico",
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
