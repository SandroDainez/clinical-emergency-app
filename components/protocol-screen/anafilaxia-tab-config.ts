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
    phaseTitle: "Quem é o paciente e o que desencadeou a reação",
    guide: "Preencha identificação, exposição provável e contexto da reação antes de classificar a gravidade.",
  },
  {
    id: 1,
    icon: "🩺",
    label: "Clínico",
    step: "2",
    phaseTitle: "Como o paciente está agora",
    guide: "Registre sinais vitais, via aérea, respiração, circulação e achados de pele para definir a gravidade.",
  },
  {
    id: 2,
    icon: "💉",
    label: "Tratamento",
    step: "3",
    phaseTitle: "O que já foi feito e o que falta fazer",
    guide: "Confirme adrenalina, oxigênio, fluidos e medidas de suporte antes de seguir para a reavaliação.",
  },
  {
    id: 3,
    icon: "📋",
    label: "Evolução",
    step: "4",
    phaseTitle: "Resposta ao tratamento e destino final",
    guide: "Decida entre observação, internação ou alta segura conforme a resposta clínica e o risco de recaída.",
  },
];
