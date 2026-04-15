/**
 * CAD / EHH — abas, mapeamento de seções e texto do roteiro de emergência.
 */

export const DKA_HHS_SECTION_TO_TAB: Record<string, number> = {
  "Identificação do paciente": 0,
  "Diabetes, insulina e riscos": 0,
  "Primeiros minutos — emergência": 1,
  "Apresentação clínica": 1,
  "Sinais vitais": 1,
  "Exame físico": 1,
  Laboratório: 2,
  "Tratamento — condutas registradas": 3,
  Monitorização: 3,
  "Evolução e destino": 4,
};

export type DkaHhsTabDef = {
  id: number;
  icon: string;
  label: string;
  step: string;
  /** Instruções detalhadas da aba (linhas com \n). */
  guide: string;
  /** Título curto para a barra de progresso no topo. */
  phaseTitle: string;
};

export const DKA_HHS_TABS: DkaHhsTabDef[] = [
  {
    id: 0,
    icon: "👤",
    label: "Paciente",
    step: "1",
    phaseTitle: "Quem é o paciente e qual o contexto do DM",
    guide: [
      "• Identificação: idade, sexo, peso (para dose de insulina e fluidos) e alergias.",
      "• Tipo de DM: DM1 predispõe a CAD; DM2 idoso a EHH — muitos casos são mistos.",
      "• Insulina / bomba: omissão ou falha de dispositivo é precipitante frequente.",
      "• iSGLT2: lembrar cetoacidose com glicemia menos elevada (“euglicêmico”).",
      "• Comorbidades (ICC, DRC, obesidade): ajustam velocidade de hidratação e risco de edema pulmonar.",
    ].join("\n"),
  },
  {
    id: 1,
    icon: "🩺",
    label: "Clínico + início",
    step: "2",
    phaseTitle: "Primeiros minutos, exame e gravidade",
    guide: [
      "• Vitais + GCS: hipotensão e taquicardia sugerem desidratação; GCS baixo = gravidade.",
      "• Exame: grau de desidratação, respiração em Kussmaul, foco neurológico se aplicável.",
    ].join("\n"),
  },
  {
    id: 2,
    icon: "🔬",
    label: "Laboratório",
    step: "3",
    phaseTitle: "Exames que classificam CAD × EHH",
    guide: [
      "• Glicemia capilar/central; gasometria (pH, HCO₃⁻); Na⁺, K⁺, Cl⁻; creatinina e ureia.",
      "• Cetonemia ou equivalente: CAD costuma ter cetose clara; EHH pode ter cetose leve.",
      "• O painel calcula osmolaridade estimada e gap aniônico — preencha para classificar.",
      "• K⁺ < 3,3 mEq/L: não iniciar insulina até repor potássio (risco de arritmia).",
    ].join("\n"),
  },
  {
    id: 3,
    icon: "💉",
    label: "Tratamento",
    step: "4",
    phaseTitle: "Volume, K⁺, insulina e precipitante",
    guide: [
      "• Ordem segura: expansão volêmica → K⁺ adequado → insulina IV contínua (protocolo local).",
      "• CAD: queda de glicemia alvo por hora; glicose + insulina quando aproximar da meta.",
      "• EHH: hidratação mais prolongada; correção osmótica lenta; tromboprofilaxia se indicada.",
      "• Registre precipitante (infecção, IAM, drogas, gestação…) e antibiótico/LMWH se usados.",
      "• Veja abaixo os cartões “CAD vs EHH” gerados automaticamente.",
    ].join("\n"),
  },
  {
    id: 4,
    icon: "📈",
    label: "Evolução",
    step: "5",
    phaseTitle: "Resposta, monitorização e destino",
    guide: [
      "• Monitorizar glicemia, K⁺, diurese e balanço; repetir gasometria/eletrólitos conforme gravidade.",
      "• Critérios de resolução e transição para insulina SC: seguir protocolo institucional.",
      "• Destino: UTI se instabilidade, alteração neurológica grave, acidose refratária ou comorbidades.",
      "• Notas livres: passagem de plantão e plano de alta.",
    ].join("\n"),
  },
];

/** Roteiro completo exibido no topo da tela (visão do fluxo real na emergência). */
export const DKA_HHS_FULL_ROTEIRO: { heading: string; lines: string[] }[] = [
  {
    heading: "1 — Recepção e estabilização inicial",
    lines: [
      "Monitor (cardíaco), SpO₂ e glicemia capilar.",
      "Acesso venoso calibroso; coleta: gasometria, eletrólitos, creatinina, hemograma; culturas se suspeita de infecção.",
      "ECG; hidratação com cristalóide isotônico (1ª hora: volume por peso, ajustar se ICC/IRC).",
      "Se K⁺ < 3,3 mEq/L: repor K⁺ IV antes de insulina contínua.",
    ],
  },
  {
    heading: "2 — História focada (aba Paciente)",
    lines: [
      "Tipo de DM, uso de insulina ou bomba, iSGLT2 (cetoacidose com glicemia menos alta).",
      "Comorbidades, alergias e tempo de sintomas.",
    ],
  },
  {
    heading: "3 — Exame clínico (aba Clínico)",
    lines: [
      "Desidratação, perfusão, frequência respiratória (Kussmaul na CAD), estado mental (sonolência no EHH).",
    ],
  },
  {
    heading: "4 — Laboratório (aba Laboratório)",
    lines: [
      "Confirmar acidose, cetose e hiperosmolaridade; classificar CAD vs EHH vs misto no painel.",
    ],
  },
  {
    heading: "5 — Tratamento (aba Tratamento)",
    lines: [
      "Reposição volêmica contínua; insulina IV após K⁺ seguro; metas de glicemia e eletrólitos.",
      "EHH: evitar queda rápida de osmolaridade/Na corrigido; considerar tromboprofilaxia.",
      "Tratar precipitante (ex.: antibiótico se sepse).",
    ],
  },
  {
    heading: "6 — Evolução e destino (aba Evolução)",
    lines: [
      "Registrar resposta clínica, critérios de melhora, transição para SC e alta/UTI.",
    ],
  },
];
