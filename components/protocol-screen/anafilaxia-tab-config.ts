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
    guide: [
      "• O módulo classifica automaticamente o grau (I–IV) com base nos parâmetros — veja o card de DIAGNÓSTICO PROVÁVEL.",
      "• Grau I (reação isolada): pele/mucosa ou TGI sem envolvimento sistêmico — anti-H1 pode bastar.",
      "• Grau II–IV (anafilaxia): ≥ 2 sistemas ou choque — adrenalina IM é obrigatória e imediata.",
      "• Estridor, SpO₂ < 92%, síncope, PA < 90 = gravidade → grau III ou IV.",
    ].join("\n"),
  },
  {
    id: 2,
    icon: "💉",
    label: "Tratamento",
    step: "3",
    phaseTitle: "O que já foi feito na sala",
    guide: [
      "• Grau I: anti-H1 de 1ª linha; adrenalina disponível mas não administrada de imediato.",
      "• Grau II–IV: adrenalina IM na coxa lateral é sempre a 1ª intervenção — não substituir por anti-H1.",
      "• Choque (Grau IV): expansão com cristalóide; adrenalina EV em infusão só com protocolo e monitorização.",
      "• Registe horários e doses de cada intervenção para o resumo de atendimento.",
    ].join("\n"),
  },
  {
    id: 3,
    icon: "📋",
    label: "Evolução",
    step: "4",
    phaseTitle: "Resposta, observação e alta",
    guide: [
      "• Após melhora, período de observação prolongado (muitas diretrizes: várias horas).",
      "• Educar sobre autoinjetor e plano de ação; destino seguro.",
      "• Veja os cartões de conduta abaixo com o passo a passo completo.",
    ].join("\n"),
  },
];
