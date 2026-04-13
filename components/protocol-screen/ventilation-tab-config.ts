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
    phaseTitle: "Quais parâmetros iniciar no ventilador e o que conferir no aparelho",
    guide: [
      "• Esta etapa mostra o setup inicial recomendado para começar a ventilação mecânica neste paciente.",
      "• Confira e ajuste modo, Vt, FR, PEEP, FiO₂ e fluxo antes de conectar ou logo após iniciar a VM.",
      "• Se o aparelho já estiver programado, compare com a sugestão do app e corrija o que estiver fora da estratégia desejada.",
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
    label: "Setup recomendado",
    step: "4",
    phaseTitle: "O que colocar agora no respirador e como reavaliar",
    guide: [
      "• Abaixo ficam as condutas principais do cenário, em ordem prática.",
      "• A primeira recomendação é o setup inicial que o app sugere para este paciente.",
      "• Depois de aplicar, reavalie gasometria, oxigenação, mecânica e hemodinâmica.",
    ].join("\n"),
  },
];
