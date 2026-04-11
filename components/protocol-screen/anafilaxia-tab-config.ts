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
    guide: [
      "• Peso serve para calcular adrenalina IM (0,01 mg/kg, máx. 0,5 mg por dose em muitos protocolos).",
      "• Registe o provável alérgeno: alimento, veneno, fármaco, contraste, exercício, idiopático…",
      "• Tempo entre exposição e sintomas ajuda a gravidade e evolução.",
    ].join("\n"),
  },
  {
    id: 1,
    icon: "🩺",
    label: "Clínico",
    step: "2",
    phaseTitle: "Pele, vias aéreas, circulação, digestivo",
    guide: [
      "• Anafilaxia é sistémica: pele + pelo menos outro sistema (ou hipotensão isolada).",
      "• Estridor, dispneia, sibilos, hipotensão, taquicardia, síncope = gravidade.",
      "• Marque tudo o que observar — orienta o reforço de tratamento.",
    ].join("\n"),
  },
  {
    id: 2,
    icon: "💉",
    label: "Tratamento",
    step: "3",
    phaseTitle: "O que já foi feito na sala",
    guide: [
      "• A droga de primeira linha é adrenalina IM (coxa lateral), não antihistamínico isolado.",
      "• Registe horários e doses de adrenalina, fluidos, broncodilatador, corticoide.",
      "• Choque: expansão com cristalóide; adrenalina IV em infusão só com protocolo e monitorização.",
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
