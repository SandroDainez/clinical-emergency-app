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
    guide: [
      "• Sexo e altura servem para calcular o peso predito (PBW) — usado na Vt segura.",
      "• Peso real: para drogas e referência; na ARDS a Vt é por PBW, não pelo peso de balança.",
      "• Escolha o cenário que mais se aproxima: isso muda RR, tempo inspiratório e PEEP.",
    ].join("\n"),
  },
  {
    id: 1,
    icon: "⚙️",
    label: "Ventilador",
    step: "2",
    phaseTitle: "O que está programado hoje no aparelho",
    guide: [
      "• Se ainda não iniciou VM, deixe em branco e use só a aba de orientação depois.",
      "• Anote modo (VC/PC), Vt ou pressão alvo, FR, FiO₂ e PEEP — o app compara com o ideal.",
      "• Pplat (pressão de platô) é fundamental se disponível: proteção pulmonar.",
    ].join("\n"),
  },
  {
    id: 2,
    icon: "🧪",
    label: "Gasometria",
    step: "3",
    phaseTitle: "O que o sangue mostra",
    guide: [
      "• pH e PaCO₂ guiam FR e volume minuto (alcalose/ acidose respiratória).",
      "• PaO₂ ou SpO₂ com FiO₂ ajudam a decidir PEEP vs FiO₂.",
      "• Se não tiver gasometria, prenda o que tiver (ex.: só SpO₂).",
    ].join("\n"),
  },
  {
    id: 3,
    icon: "📋",
    label: "Passo a passo",
    step: "4",
    phaseTitle: "Como ajustar o ventilador (explicação simples)",
    guide: [
      "• Abaixo aparecem cartões numerados: leia na ordem.",
      "• Cada passo diz o que procurar na tela do ventilador e o que mudar.",
      "• Em dúvida, peça ajuda a fisioterapia / médico e confira alarmes.",
    ].join("\n"),
  },
];
