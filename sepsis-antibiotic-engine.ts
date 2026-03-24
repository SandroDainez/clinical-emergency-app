type SepsisAntibioticScenario =
  | "infeccao_sem_sepse"
  | "sepse_provavel"
  | "sepse_alto_risco"
  | "suspeita_choque_septico";

type SepsisAntibioticFocus =
  | "pulmonar"
  | "urinario"
  | "abdominal"
  | "pele_partes_moles"
  | "dispositivo_vascular"
  | "indefinido";

type SepsisAntibioticContext = "comunidade" | "hospitalar";
type SepsisRenalFunction = "normal" | "insuficiencia" | "dialise";
type SepsisDialysisMode = "HD" | "CRRT" | "CAPD" | null;

type SepsisAntibioticInput = {
  focus: SepsisAntibioticFocus;
  scenario: SepsisAntibioticScenario;
  context: SepsisAntibioticContext;
  mrsaRisk: boolean;
  mdrRisk: boolean;
  betaLactamAllergy: boolean;
  renalFunction: SepsisRenalFunction;
  dialysisMode: SepsisDialysisMode;
};

type SepsisAntibioticDrug = {
  name: string;
  dose: string;
  interval: string;
  rationale?: string;
  renalAdjustment?: string;
  dialysisAdjustment?: Partial<Record<Exclude<SepsisDialysisMode, null>, string>>;
};

type SepsisAntibioticRecommendation = {
  title: string;
  urgency: string;
  primary: SepsisAntibioticDrug[];
  alternatives: string[];
  addOn: string[];
  notes: string[];
  warnings: string[];
  references: string[];
};

type RegimenTemplate = {
  title: string;
  primary: SepsisAntibioticDrug[];
  alternatives: string[];
  notes?: string[];
};

const REFERENCES = [
  "SSC 2021: antimicrobianos imediatos em até 1 hora para choque séptico/alta probabilidade; investigação rápida e até 3 horas quando a sepse sem choque segue provável.",
  "ATS/IDSA CAP 2019: CAP grave pode usar beta-lactâmico + macrolídeo; MRSA/Pseudomonas dependem de fatores de risco.",
  "ATS/IDSA HAP/VAP 2016: HAP grave/hospitalar pede cobertura antipseudomonas; vancomicina ou linezolida quando há risco de MRSA.",
  "IDSA AMR 2024: carbapenêmicos são preferidos quando há alto risco ou confirmação de ESBL fora do trato urinário e em pacientes criticamente enfermos.",
  "IDSA cateter intravascular 2009: bacteremia relacionada a cateter frequentemente exige cobertura gram-positiva, incluindo MRSA, e remoção/troca do dispositivo."
];

function withDose(name: string, dose: string, interval: string, rationale?: string): SepsisAntibioticDrug {
  return { name, dose, interval, rationale };
}

function withRenal(
  drug: SepsisAntibioticDrug,
  renalAdjustment: string,
  dialysisAdjustment?: SepsisAntibioticDrug["dialysisAdjustment"]
) {
  return { ...drug, renalAdjustment, dialysisAdjustment };
}

const REGIMENS: Record<string, RegimenTemplate> = {
  cap_standard: {
    title: "Cobertura para foco pulmonar comunitário grave",
    primary: [
      withDose("Ceftriaxona", "2 g IV", "a cada 24 horas", "Base beta-lactâmica para CAP grave."),
      withDose("Azitromicina", "500 mg IV/VO", "a cada 24 horas", "Associação macrolídea para cobertura de atípicos."),
    ],
    alternatives: [
      "Ampicilina-sulbactam 3 g IV a cada 6 horas + azitromicina 500 mg IV/VO a cada 24 horas",
      "Levofloxacino 750 mg IV/VO a cada 24 horas quando a estratégia for monoterapia e o contexto local permitir"
    ],
  },
  pulmonary_hospital: {
    title: "Cobertura pulmonar hospitalar / risco de Pseudomonas",
    primary: [
      withRenal(
        withDose("Piperacilina-tazobactam", "4,5 g IV", "a cada 6 horas", "Cobre gram-negativos e Pseudomonas em pneumonia hospitalar."),
        "Se insuficiência renal, reduzir intervalo/dose conforme ClCr.",
        {
          HD: "2,25 g IV a cada 12 horas, com reforço pós-HD conforme protocolo local.",
          CRRT: "3,375 g IV a cada 8 horas costuma ser usado como base operacional.",
        }
      ),
    ],
    alternatives: [
      "Cefepime 2 g IV a cada 8 horas",
      "Meropenem 1 g IV a cada 8 horas quando MDR/ESBL for dominante ou o paciente estiver em choque"
    ],
  },
  urinary_standard: {
    title: "Cobertura urinária empírica inicial",
    primary: [
      withDose("Ceftriaxona", "2 g IV", "a cada 24 horas", "Opção prática para sepse urinária sem alto risco de resistência."),
    ],
    alternatives: [
      "Cefepime 2 g IV a cada 8 horas se contexto hospitalar com risco de gram-negativos resistentes",
      "Piperacilina-tazobactam 4,5 g IV a cada 6 horas se necessidade de cobertura ampliada"
    ],
  },
  urinary_high_risk: {
    title: "Cobertura urinária complicada / alto risco de ESBL",
    primary: [
      withRenal(
        withDose("Meropenem", "1 g IV", "a cada 8 horas", "Carbapenêmico preferido quando há risco importante de ESBL/MDR ou choque."),
        "Se insuficiência renal, reduzir intervalo/dose conforme ClCr.",
        {
          HD: "1 g IV a cada 24 horas, com dose alinhada à sessão de HD.",
          CRRT: "1 g IV a cada 8 horas é uma base frequente; ajustar à depuração local.",
        }
      ),
    ],
    alternatives: [
      "Cefepime 2 g IV a cada 8 horas se risco de ESBL não for dominante e o antibiograma local sustentar",
      "Ertapenem 1 g IV a cada 24 horas em cenário sem choque e sem suspeita de Pseudomonas"
    ],
  },
  abdominal_standard: {
    title: "Cobertura abdominal com entéricos e anaeróbios",
    primary: [
      withDose("Ceftriaxona", "2 g IV", "a cada 24 horas", "Base gram-negativa comum."),
      withDose("Metronidazol", "500 mg IV/VO", "a cada 8 horas", "Complemento anaeróbio."),
    ],
    alternatives: [
      "Ampicilina-sulbactam 3 g IV a cada 6 horas quando o perfil local permitir",
      "Piperacilina-tazobactam 4,5 g IV a cada 6 horas como opção única"
    ],
  },
  abdominal_high_risk: {
    title: "Cobertura abdominal grave / hospitalar / MDR",
    primary: [
      withRenal(
        withDose("Piperacilina-tazobactam", "4,5 g IV", "a cada 6 horas", "Monoterapia prática para foco abdominal com cobertura anaeróbia."),
        "Se insuficiência renal, revisar dose e intervalo.",
        {
          HD: "2,25 g IV a cada 12 horas, com reforço pós-HD conforme protocolo local.",
          CRRT: "3,375 g IV a cada 8 horas como ponto de partida operacional.",
        }
      ),
    ],
    alternatives: [
      "Meropenem 1 g IV a cada 8 horas se risco de ESBL/MDR for dominante ou houver choque refratário",
      "Cefepime 2 g IV a cada 8 horas + metronidazol 500 mg IV/VO a cada 8 horas"
    ],
  },
  skin_standard: {
    title: "Cobertura inicial de pele e partes moles",
    primary: [
      withDose("Cefazolina", "2 g IV", "a cada 8 horas", "Opção prática para foco cutâneo sem risco alto de MRSA/polimicrobiano."),
    ],
    alternatives: [
      "Ampicilina-sulbactam 3 g IV a cada 6 horas",
      "Clindamicina 600 a 900 mg IV a cada 8 horas se alergia importante e contexto selecionado"
    ],
  },
  skin_severe: {
    title: "Cobertura ampliada de pele/partes moles graves",
    primary: [
      withRenal(
        withDose("Piperacilina-tazobactam", "4,5 g IV", "a cada 6 horas", "Amplia cobertura quando há necrose, fasceíte, polimicrobiana ou choque."),
        "Se insuficiência renal, revisar dose e intervalo.",
        {
          HD: "2,25 g IV a cada 12 horas, com reforço pós-HD.",
        }
      ),
    ],
    alternatives: [
      "Meropenem 1 g IV a cada 8 horas se risco elevado de MDR",
      "Cefepime 2 g IV a cada 8 horas + metronidazol 500 mg IV/VO a cada 8 horas"
    ],
  },
  device_standard: {
    title: "Cobertura para bacteremia relacionada a dispositivo",
    primary: [
      withRenal(
        withDose("Vancomicina", "15 a 20 mg/kg IV", "conforme níveis e função renal", "Cobertura empírica para MRSA e estafilococos relacionados a cateter."),
        "Obrigatório monitorar função renal e níveis conforme protocolo local.",
        {
          HD: "Estratégia baseada em dose de ataque e manutenção guiada por níveis.",
          CRRT: "Ajuste guiado por níveis e depuração do circuito.",
        }
      ),
      withRenal(
        withDose("Cefepime", "2 g IV", "a cada 8 horas", "Adicionar gram-negativo em caso grave, hospitalar ou com choque."),
        "Se insuficiência renal, ajustar intervalo/dose conforme ClCr."
      ),
    ],
    alternatives: [
      "Vancomicina + piperacilina-tazobactam em cenário com foco incerto e necessidade de cobertura mais ampla",
      "Linezolida 600 mg IV/VO a cada 12 horas quando vancomicina não for apropriada para MRSA"
    ],
  },
  undefined_broad: {
    title: "Cobertura empírica ampla para foco ainda indefinido",
    primary: [
      withRenal(
        withDose("Piperacilina-tazobactam", "4,5 g IV", "a cada 6 horas", "Cobertura ampla prática enquanto o foco é esclarecido."),
        "Se insuficiência renal, revisar dose e intervalo.",
        {
          HD: "2,25 g IV a cada 12 horas, com reforço pós-HD.",
          CRRT: "3,375 g IV a cada 8 horas como base operacional.",
        }
      ),
    ],
    alternatives: [
      "Meropenem 1 g IV a cada 8 horas se o risco de MDR/ESBL for alto ou houver choque",
      "Cefepime 2 g IV a cada 8 horas + metronidazol 500 mg IV/VO a cada 8 horas"
    ],
  },
};

function getUrgencyLabel(scenario: SepsisAntibioticScenario) {
  if (scenario === "suspeita_choque_septico" || scenario === "sepse_alto_risco") {
    return "Administrar agora, idealmente dentro de 1 hora do reconhecimento.";
  }
  if (scenario === "sepse_provavel") {
    return "Investigar rápido e iniciar dentro de 3 horas se a hipótese infecciosa persistir.";
  }
  return "Não iniciar automaticamente. Reavaliar probabilidade infecciosa e diagnósticos alternativos.";
}

function getAntiMrsaAddon(focus: SepsisAntibioticFocus) {
  if (focus === "pulmonar") {
    return "Linezolida 600 mg IV/VO a cada 12 horas ou vancomicina 15 a 20 mg/kg IV guiada por níveis se houver risco de MRSA.";
  }
  return "Vancomicina 15 a 20 mg/kg IV guiada por níveis, ou linezolida 600 mg IV/VO a cada 12 horas quando apropriado, se houver risco de MRSA.";
}

function applyRenalProfile(drug: SepsisAntibioticDrug, renalFunction: SepsisRenalFunction, dialysisMode: SepsisDialysisMode) {
  if (renalFunction === "dialise" && dialysisMode && drug.dialysisAdjustment?.[dialysisMode]) {
    return `${drug.name}: ${drug.dialysisAdjustment[dialysisMode]}`;
  }

  if (renalFunction === "insuficiencia" && drug.renalAdjustment) {
    return `${drug.name}: ${drug.renalAdjustment}`;
  }

  return `${drug.name}: ${drug.dose}, ${drug.interval}`;
}

function pickTemplate(input: SepsisAntibioticInput) {
  const severe = input.scenario === "suspeita_choque_septico" || input.scenario === "sepse_alto_risco";
  const hospital = input.context === "hospitalar";
  const highRisk = input.mdrRisk || hospital || severe;

  switch (input.focus) {
    case "pulmonar":
      return highRisk ? REGIMENS.pulmonary_hospital : REGIMENS.cap_standard;
    case "urinario":
      return highRisk ? REGIMENS.urinary_high_risk : REGIMENS.urinary_standard;
    case "abdominal":
      return highRisk ? REGIMENS.abdominal_high_risk : REGIMENS.abdominal_standard;
    case "pele_partes_moles":
      return highRisk ? REGIMENS.skin_severe : REGIMENS.skin_standard;
    case "dispositivo_vascular":
      return REGIMENS.device_standard;
    default:
      return REGIMENS.undefined_broad;
  }
}

function buildBetaLactamAllergyWarning(input: SepsisAntibioticInput, template: RegimenTemplate) {
  if (!input.betaLactamAllergy) {
    return [];
  }

  const fallback =
    input.focus === "pulmonar"
      ? "Levofloxacino 750 mg IV/VO a cada 24 horas + cobertura anti-MRSA quando indicada."
      : input.focus === "dispositivo_vascular"
        ? "Vancomicina + aztreonam 2 g IV a cada 8 horas pode ser uma estratégia operacional temporária, dependendo do protocolo local."
        : "Aztreonam 2 g IV a cada 8 horas combinado ao complemento necessário do foco pode ser considerado, mas exige revisão local.";

  return [
    `Alergia a beta-lactâmico marcada: o esquema-base (${template.title}) deve ser revisto antes da administração.`,
    `Alternativa operacional pública reconhecida: ${fallback}`,
    "Se a alergia for grave/imediata, não automatizar a escolha final sem revisão do protocolo institucional."
  ];
}

function getContextNotes(input: SepsisAntibioticInput) {
  const notes = [
    input.context === "hospitalar"
      ? "Contexto hospitalar aumenta peso para gram-negativos resistentes e Pseudomonas."
      : "Contexto comunitário favorece esquemas mais focados quando o quadro permite.",
  ];

  if (input.mdrRisk) {
    notes.push("Risco de MDR marcado: preferir ampliar cobertura inicial e revisar cultura/antibiograma cedo.");
  }

  if (input.renalFunction !== "normal") {
    notes.push("Função renal alterada: doses e intervalos abaixo exigem conferência antes da manutenção.");
  }

  return notes;
}

function recommendSepsisAntibiotics(input: SepsisAntibioticInput): SepsisAntibioticRecommendation {
  const template = pickTemplate(input);
  const warnings = [
    "Ajustar conforme função renal, protocolos locais, microbiologia institucional, alergias reais e controle de foco.",
    "A recomendação é apoio à decisão; não substituir julgamento do médico assistente nem ID/stewardship quando disponíveis.",
    ...buildBetaLactamAllergyWarning(input, template),
  ];

  const addOn: string[] = [];
  if (input.mrsaRisk) {
    addOn.push(getAntiMrsaAddon(input.focus));
  }

  if (input.focus === "abdominal") {
    addOn.push("Priorizar controle de foco: drenagem, abordagem cirúrgica ou retirada de dispositivo, quando indicado.");
  }

  if (input.focus === "dispositivo_vascular") {
    addOn.push("Retirar ou trocar o dispositivo suspeito assim que houver acesso alternativo seguro.");
  }

  const notes = [
    ...getContextNotes(input),
    ...(template.notes ?? []),
    ...template.primary.map((drug) => applyRenalProfile(drug, input.renalFunction, input.dialysisMode)),
  ];

  return {
    title: template.title,
    urgency: getUrgencyLabel(input.scenario),
    primary: template.primary,
    alternatives: template.alternatives,
    addOn,
    notes,
    warnings,
    references: REFERENCES,
  };
}

export type {
  SepsisAntibioticContext,
  SepsisAntibioticDrug,
  SepsisAntibioticFocus,
  SepsisAntibioticInput,
  SepsisAntibioticRecommendation,
  SepsisAntibioticScenario,
  SepsisDialysisMode,
  SepsisRenalFunction,
};

export { recommendSepsisAntibiotics };
