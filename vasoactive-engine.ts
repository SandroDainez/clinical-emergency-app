import protocol from "./protocols/drogas_vasoativas.json";
import type {
  AuxiliaryPanel,
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";

type StateType = "action" | "question" | "end";
type Diluent = "SF" | "SG";
type DoseUnit = "mcg/kg/min" | "mcg/min" | "mg/h" | "U/min";
type BaseUnit = "mcg" | "mg" | "U";
type DrugKey =
  | "noradrenalina"
  | "adrenalina"
  | "vasopressina"
  | "dopamina"
  | "dobutamina";
type CalculatorMode = "doseToRate" | "rateToDose";

type State = {
  type: StateType;
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
};

type Protocol = {
  id: string;
  initialState: string;
  states: Record<string, State>;
};

type Presentation = {
  id: string;
  label: string;
  container: "Ampola" | "Frasco-ampola";
  volumeLabel: string;
  concentrationLabel: string;
  ampouleVolumeMl: number;
  basePerAmpoule: number;
  notes?: string;
};

type StandardSolution = {
  id: string;
  label: string;
  diluent: Diluent;
  presentationId: string;
  ampoules: string;
  diluentMl: string;
};

type Drug = {
  key: DrugKey;
  name: string;
  emoji: string;
  baseUnit: BaseUnit;
  doseUnit: DoseUnit;
  recommendedDiluent?: Diluent;
  presentations: Presentation[];
  standardSolutions?: StandardSolution[];
  reference: {
    usual?: string;
    titration?: string;
    max?: string;
    notes?: string[];
  };
  vasopressinAlert?: {
    threshold: number;
    message: string;
  };
};

type Event = {
  timestamp: number;
  type: string;
  data?: Record<string, string | number | boolean | null | undefined>;
};

type Session = {
  protocolId: string;
  currentStateId: string;
  history: Event[];
  pendingEffects: EngineEffect[];
  protocolStartedAt: number;
  selectedDrugKey?: DrugKey;
  selectedSolutionId?: string;
  mode: CalculatorMode;
  diluent: Diluent;
  presentationId: string;
  ampoules: string;
  diluentMl: string;
  weightKg: string;
  doseInput: string;
  rateInput: string;
  confirmedConfigToken?: string;
  lastConfirmedAction?: "prepare" | "adjust";
  lastConfirmedSummary?: string;
  vasopressinAlertToken?: string;
};

type CalculationResult = {
  ampoules: number;
  diluentMl: number;
  finalVolumeMl: number;
  totalBase: number;
  concentration: number;
  weightKg: number;
  outRateMlH: number | null;
  outDose: number | null;
  currentDoseMcgKgMin: number | null;
  presentation: Presentation;
};

const protocolData = protocol as Protocol;

const DRUGS: Drug[] = [
  {
    key: "noradrenalina",
    name: "Noradrenalina",
    emoji: "🩸",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "nora-4mg-base-4ml",
        label: "Ampola 4 mL • 4 mg base por ampola",
        container: "Ampola",
        volumeLabel: "4 mL",
        concentrationLabel: "2 mg/mL hemitartarato",
        ampouleVolumeMl: 4,
        basePerAmpoule: 4000,
        notes:
          "Ampola 4 mL com 2 mg/mL de hemitartarato equivale a 4 mg de noradrenalina base.",
      },
    ],
    standardSolutions: [
      {
        id: "padrao-16",
        label: "16 mcg/mL • 4 mg em 250 mL nominal",
        diluent: "SG",
        presentationId: "nora-4mg-base-4ml",
        ampoules: "1",
        diluentMl: "250",
      },
      {
        id: "padrao-32",
        label: "32 mcg/mL • 8 mg em 250 mL nominal",
        diluent: "SG",
        presentationId: "nora-4mg-base-4ml",
        ampoules: "2",
        diluentMl: "250",
      },
      {
        id: "padrao-64",
        label: "64 mcg/mL • 16 mg em 250 mL final",
        diluent: "SG",
        presentationId: "nora-4mg-base-4ml",
        ampoules: "4",
        diluentMl: "234",
      },
    ],
    reference: {
      usual: "0,05–0,3 mcg/kg/min",
      titration: "Ajustar a cada 2–5 min conforme PAM e perfusão",
      max: "Pode chegar até cerca de 3 mcg/kg/min em cenários especiais com monitorização intensiva",
      notes: [
        "Objetivo inicial: PAM maior ou igual a 65 mmHg.",
        "Preferir acesso central; se periférico, vigiar extravasamento.",
      ],
    },
    vasopressinAlert: {
      threshold: 0.3,
      message:
        "Dose elevada de noradrenalina. Considerar associação de vasopressina conforme protocolo local.",
    },
  },
  {
    key: "adrenalina",
    name: "Adrenalina",
    emoji: "⚡",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "epi-1mg-1ml",
        label: "Ampola 1 mL • 1 mg por ampola",
        container: "Ampola",
        volumeLabel: "1 mL",
        concentrationLabel: "1 mg/mL",
        ampouleVolumeMl: 1,
        basePerAmpoule: 1000,
      },
    ],
    standardSolutions: [
      {
        id: "padrao-20",
        label: "20 mcg/mL • 2 mg em 100 mL final",
        diluent: "SG",
        presentationId: "epi-1mg-1ml",
        ampoules: "2",
        diluentMl: "98",
      },
      {
        id: "padrao-40",
        label: "40 mcg/mL • 4 mg em 100 mL final",
        diluent: "SG",
        presentationId: "epi-1mg-1ml",
        ampoules: "4",
        diluentMl: "96",
      },
    ],
    reference: {
      usual: "0,01–0,3 mcg/kg/min",
      titration: "Titular conforme choque refratário e resposta hemodinâmica",
      notes: [
        "Monitorar frequência cardíaca, pressão arterial e lactato.",
        "Risco de taquiarritmia e aumento de consumo miocárdico.",
      ],
    },
  },
  {
    key: "dobutamina",
    name: "Dobutamina",
    emoji: "💓",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "dobu-250mg-20ml",
        label: "Ampola 20 mL • 250 mg por ampola",
        container: "Ampola",
        volumeLabel: "20 mL",
        concentrationLabel: "12,5 mg/mL",
        ampouleVolumeMl: 20,
        basePerAmpoule: 250000,
      },
    ],
    standardSolutions: [
      {
        id: "padrao-2000",
        label: "2000 mcg/mL • 250 mg em 125 mL final",
        diluent: "SG",
        presentationId: "dobu-250mg-20ml",
        ampoules: "1",
        diluentMl: "105",
      },
      {
        id: "padrao-4000",
        label: "4000 mcg/mL • 500 mg em 125 mL final",
        diluent: "SG",
        presentationId: "dobu-250mg-20ml",
        ampoules: "2",
        diluentMl: "85",
      },
    ],
    reference: {
      usual: "2–20 mcg/kg/min",
      titration: "Ajustar por perfusão, diurese e resposta ecocardiográfica",
      notes: [
        "Se houver hipotensão, considerar associação com vasopressor.",
      ],
    },
  },
  {
    key: "dopamina",
    name: "Dopamina",
    emoji: "🧪",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "dopa-200mg-5ml",
        label: "Ampola 5 mL • 200 mg por ampola",
        container: "Ampola",
        volumeLabel: "5 mL",
        concentrationLabel: "40 mg/mL",
        ampouleVolumeMl: 5,
        basePerAmpoule: 200000,
      },
      {
        id: "dopa-400mg-10ml",
        label: "Ampola 10 mL • 400 mg por ampola",
        container: "Ampola",
        volumeLabel: "10 mL",
        concentrationLabel: "40 mg/mL",
        ampouleVolumeMl: 10,
        basePerAmpoule: 400000,
      },
    ],
    standardSolutions: [
      {
        id: "padrao-1600",
        label: "1600 mcg/mL • 400 mg em 250 mL final",
        diluent: "SG",
        presentationId: "dopa-400mg-10ml",
        ampoules: "1",
        diluentMl: "240",
      },
      {
        id: "padrao-3200",
        label: "3200 mcg/mL • 400 mg em 125 mL final",
        diluent: "SG",
        presentationId: "dopa-400mg-10ml",
        ampoules: "1",
        diluentMl: "115",
      },
    ],
    reference: {
      usual: "5–20 mcg/kg/min",
      notes: [
        "Maior risco de taquiarritmias; hoje é menos preferida que noradrenalina em muitos cenários.",
      ],
    },
  },
  {
    key: "vasopressina",
    name: "Vasopressina",
    emoji: "🧷",
    baseUnit: "U",
    doseUnit: "U/min",
    recommendedDiluent: "SF",
    presentations: [
      {
        id: "vaso-20u-1ml",
        label: "Ampola 1 mL • 20 U por ampola",
        container: "Ampola",
        volumeLabel: "1 mL",
        concentrationLabel: "20 U/mL",
        ampouleVolumeMl: 1,
        basePerAmpoule: 20,
      },
    ],
    standardSolutions: [
      {
        id: "padrao-0_2",
        label: "0,2 U/mL • 20 U em 100 mL final",
        diluent: "SF",
        presentationId: "vaso-20u-1ml",
        ampoules: "1",
        diluentMl: "99",
      },
      {
        id: "padrao-0_4",
        label: "0,4 U/mL • 20 U em 50 mL final",
        diluent: "SF",
        presentationId: "vaso-20u-1ml",
        ampoules: "1",
        diluentMl: "49",
      },
      {
        id: "padrao-1",
        label: "1 U/mL • 20 U em 20 mL final",
        diluent: "SF",
        presentationId: "vaso-20u-1ml",
        ampoules: "1",
        diluentMl: "19",
      },
    ],
    reference: {
      usual: "0,01–0,04 U/min",
      notes: [
        "Geralmente usada como adjuvante em choque vasoplégico.",
        "Costuma ser mantida em dose fixa, sem titulação agressiva.",
      ],
    },
  },
];

function parseDecimal(input: string) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  if (
    value === "." ||
    value === "," ||
    value.endsWith(".") ||
    value.endsWith(",")
  ) {
    const core = value.slice(0, -1);
    if (!core) {
      return null;
    }

    const parsedCore = Number(core.replace(",", "."));
    return Number.isFinite(parsedCore) ? parsedCore : null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, decimals = 2) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(decimals).replace(".", ",");
}

function createSession(): Session {
  const firstDrug = DRUGS[0];
  return {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    history: [
      {
        timestamp: Date.now(),
        type: "PROTOCOL_STARTED",
      },
    ],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    mode: "doseToRate",
    diluent: firstDrug.recommendedDiluent ?? "SF",
    presentationId: firstDrug.presentations[0].id,
    ampoules: "1",
    diluentMl: "250",
    weightKg: "80",
    doseInput: "0,05",
    rateInput: "",
  };
}

let session = createSession();

function getDrugByKey(key?: string) {
  return DRUGS.find((drug) => drug.key === key);
}

function getSelectedDrug() {
  return getDrugByKey(session.selectedDrugKey);
}

function getPresentation(drug: Drug, presentationId?: string) {
  return (
    drug.presentations.find((presentation) => presentation.id === presentationId) ??
    drug.presentations[0]
  );
}

function getCurrentStateId() {
  return session.currentStateId;
}

function buildSolutionOptionKey(solution: StandardSolution) {
  return `solucao_padrao:${solution.id}:${solution.label}`;
}

function getStateTemplate(stateId: string) {
  const state = protocolData.states[stateId];
  if (!state) {
    throw new Error(`Estado inválido: ${stateId}`);
  }

  return state;
}

function getSolutionLabelById(drug: Drug, solutionId?: string) {
  const solution = drug.standardSolutions?.find((item) => item.id === solutionId);
  return solution ? solution.label : "Configuração manual";
}

function getModeLabel(mode: CalculatorMode) {
  return mode === "doseToRate" ? "Dose → mL/h" : "mL/h → dose";
}

function getConfigToken() {
  return [
    session.selectedDrugKey ?? "",
    session.selectedSolutionId ?? "manual",
    session.mode,
    session.diluent,
    session.presentationId,
    session.ampoules,
    session.diluentMl,
    session.weightKg,
    session.doseInput,
    session.rateInput,
  ].join("|");
}

function logEvent(type: string, data?: Event["data"]) {
  session.history.push({
    timestamp: Date.now(),
    type,
    data,
  });
}

function enqueueEffect(effect: EngineEffect) {
  session.pendingEffects.push(effect);
}

function consumeEffects() {
  const effects = [...session.pendingEffects];
  session.pendingEffects = [];
  return effects;
}

function applyDrugDefaults(drug: Drug) {
  session.selectedDrugKey = drug.key;
  session.selectedSolutionId = undefined;
  session.mode = "doseToRate";
  session.diluent = drug.recommendedDiluent ?? "SF";
  session.presentationId = drug.presentations[0].id;
  session.ampoules = "1";
  session.diluentMl = drug.key === "vasopressina" ? "99" : "250";
  session.weightKg = session.weightKg || "80";
  session.doseInput = drug.doseUnit === "U/min" ? "0,03" : "0,05";
  session.rateInput = "";
  session.confirmedConfigToken = undefined;
  session.lastConfirmedAction = undefined;
  session.lastConfirmedSummary = undefined;
  session.vasopressinAlertToken = undefined;
}

function applyStandardSolution(drug: Drug, solutionId: string) {
  const solution = drug.standardSolutions?.find((item) => item.id === solutionId);
  if (!solution) {
    throw new Error("Solução padrão inválida.");
  }

  session.selectedSolutionId = solutionId;
  session.diluent = solution.diluent;
  session.presentationId = solution.presentationId;
  session.ampoules = solution.ampoules;
  session.diluentMl = solution.diluentMl;
  session.confirmedConfigToken = undefined;
}

function calculate(drug: Drug): CalculationResult {
  const presentation = getPresentation(drug, session.presentationId);
  const ampoules = parseDecimal(session.ampoules) ?? 0;
  const diluentMl = parseDecimal(session.diluentMl) ?? 0;
  const finalVolumeMl = diluentMl + ampoules * presentation.ampouleVolumeMl;
  const totalBase = ampoules * presentation.basePerAmpoule;
  const concentration = finalVolumeMl > 0 ? totalBase / finalVolumeMl : 0;
  const weightKg = parseDecimal(session.weightKg) ?? 0;
  const doseInput = parseDecimal(session.doseInput);
  const rateInput = parseDecimal(session.rateInput);

  const toMlH = (basePerMinute: number) => {
    if (concentration <= 0) {
      return null;
    }

    return (basePerMinute / concentration) * 60;
  };

  const fromMlH = (mlPerHour: number) => {
    if (concentration <= 0) {
      return null;
    }

    return (mlPerHour * concentration) / 60;
  };

  let outRateMlH: number | null = null;
  let outDose: number | null = null;

  if (session.mode === "doseToRate") {
    if (doseInput != null) {
      let basePerMinute = 0;

      if (drug.doseUnit === "mcg/kg/min") {
        if (weightKg > 0) {
          basePerMinute = doseInput * weightKg;
        }
      } else if (drug.doseUnit === "mcg/min") {
        basePerMinute = doseInput;
      } else if (drug.doseUnit === "mg/h") {
        basePerMinute = doseInput / 60;
      } else if (drug.doseUnit === "U/min") {
        basePerMinute = doseInput;
      }

      outRateMlH = toMlH(basePerMinute);
    }
  } else if (rateInput != null) {
    const basePerMinute = fromMlH(rateInput);

    if (basePerMinute != null) {
      if (drug.doseUnit === "mcg/kg/min") {
        outDose = weightKg > 0 ? basePerMinute / weightKg : null;
      } else if (drug.doseUnit === "mcg/min") {
        outDose = basePerMinute;
      } else if (drug.doseUnit === "mg/h") {
        outDose = basePerMinute * 60;
      } else if (drug.doseUnit === "U/min") {
        outDose = basePerMinute;
      }
    }
  }

  return {
    ampoules,
    diluentMl,
    finalVolumeMl,
    totalBase,
    concentration,
    weightKg,
    outRateMlH,
    outDose,
    currentDoseMcgKgMin:
      drug.key === "noradrenalina"
        ? session.mode === "doseToRate"
          ? doseInput
          : outDose
        : null,
    presentation,
  };
}

function buildConcentrationLabel(drug: Drug, calculation: CalculationResult) {
  if (calculation.concentration <= 0) {
    return "—";
  }

  if (drug.baseUnit === "U") {
    return `${formatNumber(calculation.concentration, 3)} U/mL`;
  }

  if (drug.baseUnit === "mg") {
    return `${formatNumber(calculation.concentration, 3)} mg/mL`;
  }

  return `${formatNumber(
    calculation.concentration,
    calculation.concentration < 100 ? 2 : 1
  )} mcg/mL`;
}

function buildPrimaryResultLabel(drug: Drug, calculation: CalculationResult) {
  if (session.mode === "doseToRate") {
    if (drug.doseUnit === "mcg/kg/min" && calculation.weightKg <= 0) {
      return "Informar peso em kg";
    }

    if (calculation.outRateMlH == null) {
      return "—";
    }

    return `${formatNumber(
      calculation.outRateMlH,
      calculation.outRateMlH < 10 ? 2 : 1
    )} mL/h`;
  }

  if (drug.doseUnit === "mcg/kg/min" && calculation.weightKg <= 0) {
    return "Informar peso em kg";
  }

  if (calculation.outDose == null) {
    return "—";
  }

  const decimals = drug.doseUnit === "U/min" ? 3 : 3;
  return `${formatNumber(calculation.outDose, decimals)} ${drug.doseUnit}`;
}

function buildReferenceLines(drug: Drug) {
  const details: string[] = [];

  if (drug.reference.usual) {
    details.push(`Faixa usual: ${drug.reference.usual}`);
  }

  if (drug.reference.titration) {
    details.push(`Titulação: ${drug.reference.titration}`);
  }

  if (drug.reference.max) {
    details.push(`Limite / observação: ${drug.reference.max}`);
  }

  if (drug.reference.notes?.length) {
    details.push(...drug.reference.notes);
  }

  return details;
}

function buildConfirmedSummary(drug: Drug, calculation: CalculationResult) {
  const result = buildPrimaryResultLabel(drug, calculation);
  const concentration = buildConcentrationLabel(drug, calculation);
  const targetLabel =
    session.mode === "doseToRate"
      ? `Dose alvo ${session.doseInput || "—"} ${drug.doseUnit}`
      : `Velocidade ${session.rateInput || "—"} mL/h`;

  return [
    `${drug.name}`,
    `${concentration}`,
    `${targetLabel}`,
    `${result}`,
    `${getSolutionLabelById(drug, session.selectedSolutionId)}`,
  ].join(" • ");
}

function validateCurrentConfiguration(drug: Drug, calculation: CalculationResult) {
  if (!session.selectedDrugKey) {
    throw new Error("Selecione uma droga antes de confirmar a conduta.");
  }

  if (calculation.finalVolumeMl <= 0 || calculation.concentration <= 0) {
    throw new Error("Defina ampolas e volume final válidos antes de confirmar.");
  }

  if (drug.doseUnit === "mcg/kg/min" && calculation.weightKg <= 0) {
    throw new Error("Informe o peso em kg para drogas dependentes de peso.");
  }

  if (session.mode === "doseToRate") {
    if (parseDecimal(session.doseInput) == null) {
      throw new Error("Informe a dose desejada antes de confirmar.");
    }

    if (calculation.outRateMlH == null) {
      throw new Error("Não foi possível calcular a velocidade da bomba.");
    }
  } else {
    if (parseDecimal(session.rateInput) == null) {
      throw new Error("Informe a velocidade da bomba antes de confirmar.");
    }

    if (calculation.outDose == null) {
      throw new Error("Não foi possível calcular a dose a partir da velocidade.");
    }
  }
}

function getCurrentState(): ProtocolState {
  const template = getStateTemplate(session.currentStateId);
  const drug = getSelectedDrug();

  if (session.currentStateId === "selecionar_preparo" && drug) {
    const options: Record<string, string> = {};

    for (const solution of drug.standardSolutions ?? []) {
      options[buildSolutionOptionKey(solution)] = "selecionar_modo";
    }

    options.configuracao_manual_sf = "selecionar_modo";
    options.configuracao_manual_sg = "selecionar_modo";

    return {
      ...template,
      text: `Qual solução deseja usar para ${drug.name}?`,
      speak: `Selecionar solução para ${drug.name}`,
      details: [
        "Escolha uma solução padrão ou montagem manual.",
        `Diluente preferencial: ${drug.recommendedDiluent ?? "conforme protocolo local"}.`,
      ],
      options,
    };
  }

  if (session.currentStateId === "selecionar_modo" && drug) {
    return {
      ...template,
      text: `Como deseja calcular ${drug.name}?`,
      speak: `Definir modo de cálculo para ${drug.name}`,
      details: [
        `Solução: ${getSolutionLabelById(drug, session.selectedSolutionId)}`,
        "Escolha entre calcular a taxa da bomba a partir da dose ou converter mL por hora em dose.",
      ],
      options: {
        dose_para_velocidade: "configurar_infusao",
        velocidade_para_dose: "configurar_infusao",
      },
    };
  }

  if (session.currentStateId === "configurar_infusao" && drug) {
    const calculation = calculate(drug);
    return {
      ...template,
      text: `Configurar ${drug.name}`,
      speak:
        session.lastConfirmedAction === "adjust"
          ? `Ajustar dose de ${drug.name}`
          : `Iniciar ${drug.name}`,
      details: [
        `Modo: ${getModeLabel(session.mode)}`,
        `Concentração atual: ${buildConcentrationLabel(drug, calculation)}`,
        "Use o painel para revisar preparo, concentração e resultado.",
        "Confirme a sugestão no painel antes de avançar.",
      ],
    };
  }

  if (session.currentStateId === "revisar_infusao" && drug) {
    const details = session.lastConfirmedSummary
      ? [
          `Conduta confirmada: ${session.lastConfirmedSummary}`,
          "Revisar perfusão, hemodinâmica e metas clínicas antes de aplicar.",
        ]
      : [
          "Nenhum preparo confirmado ainda.",
          "Retorne para configurar a infusão.",
        ];

    return {
      ...template,
      text: `Revisar conduta para ${drug.name}`,
      speak: `Revisar conduta para ${drug.name}`,
      details,
    };
  }

  return template;
}

function getTimers(): TimerState[] {
  return [];
}

function getDocumentationActions(): DocumentationAction[] {
  return [];
}

function getReversibleCauses(): ReversibleCause[] {
  return [];
}

function updateReversibleCauseStatus(): ReversibleCause[] {
  return [];
}

function registerExecution(): ClinicalLogEntry[] {
  return getClinicalLog();
}

function resetSession() {
  session = createSession();
  return getCurrentState();
}

function transitionTo(nextStateId: string) {
  session.currentStateId = nextStateId;
  logEvent("STATE_CHANGED", { to: nextStateId });
  return getCurrentState();
}

function next(input?: string) {
  const state = getCurrentState();
  const template = getStateTemplate(session.currentStateId);

  if (state.type === "action") {
    if (session.currentStateId === "configurar_infusao") {
      if (session.confirmedConfigToken !== getConfigToken()) {
        throw new Error("Confirme o preparo ou ajuste no painel antes de avançar.");
      }
    }

    if (!template.next) {
      throw new Error("Não há próximo estado configurado.");
    }

    if (session.currentStateId === "introducao") {
      logEvent("INTRO_COMPLETED");
    }

    return transitionTo(template.next);
  }

  if (state.type === "end") {
    return state;
  }

  if (!input) {
    throw new Error("Resposta inválida.");
  }

  if (session.currentStateId === "selecionar_droga") {
    const drug = getDrugByKey(input);
    if (!drug) {
      throw new Error("Droga inválida.");
    }

    applyDrugDefaults(drug);
    logEvent("DRUG_SELECTED", { drug: drug.name });
    return transitionTo("selecionar_preparo");
  }

  if (session.currentStateId === "selecionar_preparo") {
    const drug = getSelectedDrug();
    if (!drug) {
      throw new Error("Selecione uma droga antes da solução.");
    }

    if (input.startsWith("solucao_padrao:")) {
      const [, solutionId] = input.split(":", 3);
      applyStandardSolution(drug, solutionId);
      logEvent("SOLUTION_SELECTED", {
        drug: drug.name,
        solution: getSolutionLabelById(drug, solutionId),
      });
      return transitionTo("selecionar_modo");
    }

    if (input === "configuracao_manual_sf" || input === "configuracao_manual_sg") {
      session.selectedSolutionId = undefined;
      session.diluent = input === "configuracao_manual_sf" ? "SF" : "SG";
      session.confirmedConfigToken = undefined;
      logEvent("SOLUTION_SELECTED", {
        drug: drug.name,
        solution: `Configuração manual ${session.diluent}`,
      });
      return transitionTo("selecionar_modo");
    }

    throw new Error("Opção de solução inválida.");
  }

  if (session.currentStateId === "selecionar_modo") {
    if (input !== "dose_para_velocidade" && input !== "velocidade_para_dose") {
      throw new Error("Modo inválido.");
    }

    session.mode = input === "dose_para_velocidade" ? "doseToRate" : "rateToDose";
    session.confirmedConfigToken = undefined;
    logEvent("MODE_SELECTED", { mode: getModeLabel(session.mode) });
    return transitionTo("configurar_infusao");
  }

  const nextStateId = state.options?.[input];
  if (!nextStateId) {
    throw new Error("Resposta inválida.");
  }

  if (session.currentStateId === "revisar_infusao" && input === "concluir") {
    logEvent("MODULE_COMPLETED", {
      drug: getSelectedDrug()?.name ?? "Não definida",
    });
  }

  return transitionTo(nextStateId);
}

function buildAuxiliaryActions(drug: Drug) {
  const actions = [];

  if (drug.presentations.length > 1) {
    for (const presentation of drug.presentations) {
      actions.push({
        id: `presentation:${presentation.id}`,
        label: presentation.label,
      });
    }
  }

  actions.push({
    id: "diluent:SF",
    label: "Usar SF",
  });
  actions.push({
    id: "diluent:SG",
    label: "Usar SG",
  });
  actions.push({
    id: session.mode === "doseToRate" ? "confirm_prepare" : "confirm_adjust",
    label:
      session.mode === "doseToRate"
        ? "Confirmar preparo e taxa"
        : "Confirmar revisão de ajuste",
    requiresConfirmation: true,
  });

  return actions;
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  const drug = getSelectedDrug();
  if (!drug) {
    return null;
  }

  if (
    session.currentStateId !== "configurar_infusao" &&
    session.currentStateId !== "revisar_infusao"
  ) {
    return null;
  }

  const calculation = calculate(drug);
  const concentrationLabel = buildConcentrationLabel(drug, calculation);
  const resultLabel = buildPrimaryResultLabel(drug, calculation);

  return {
    title: `${drug.emoji} ${drug.name}`,
    description: `${getSolutionLabelById(drug, session.selectedSolutionId)} • ${getModeLabel(
      session.mode
    )}`,
    fields: [
      {
        id: "weightKg",
        label: "Peso (kg)",
        value: session.weightKg,
        placeholder: "80",
        keyboardType: "numeric",
        helperText:
          drug.doseUnit === "mcg/kg/min"
            ? "Obrigatório para drogas dependentes de peso."
            : "Opcional para esta droga.",
      },
      {
        id: "ampoules",
        label: "Número de ampolas",
        value: session.ampoules,
        placeholder: "1",
        keyboardType: "numeric",
      },
      {
        id: "diluentMl",
        label: "Volume do diluente (mL)",
        value: session.diluentMl,
        placeholder: "250",
        keyboardType: "numeric",
        helperText: `Diluente atual: ${session.diluent}`,
      },
      {
        id: session.mode === "doseToRate" ? "doseInput" : "rateInput",
        label:
          session.mode === "doseToRate"
            ? `Dose alvo (${drug.doseUnit})`
            : "Velocidade da bomba (mL/h)",
        value: session.mode === "doseToRate" ? session.doseInput : session.rateInput,
        placeholder: session.mode === "doseToRate" ? "0,05" : "5",
        keyboardType: "numeric",
        helperText:
          session.mode === "doseToRate"
            ? "Aceita 0,05 ou 0.05."
            : "Use a velocidade programada na bomba.",
      },
    ],
    metrics: [
      { label: "Apresentação", value: calculation.presentation.label },
      { label: "Concentração", value: concentrationLabel },
      {
        label: "Volume final",
        value:
          calculation.finalVolumeMl > 0
            ? `${formatNumber(calculation.finalVolumeMl, 0)} mL`
            : "—",
      },
      {
        label: `Total (${drug.baseUnit})`,
        value:
          calculation.totalBase > 0
            ? formatNumber(
                calculation.totalBase,
                drug.baseUnit === "U" ? 2 : calculation.totalBase < 10000 ? 1 : 0
              )
            : "—",
      },
      { label: "Resultado principal", value: resultLabel },
      ...(drug.reference.usual
        ? [{ label: "Faixa usual", value: drug.reference.usual }]
        : []),
    ],
    actions: buildAuxiliaryActions(drug),
  };
}

function updateAuxiliaryField(fieldId: string, value: string) {
  if (
    fieldId !== "weightKg" &&
    fieldId !== "ampoules" &&
    fieldId !== "diluentMl" &&
    fieldId !== "doseInput" &&
    fieldId !== "rateInput"
  ) {
    return getAuxiliaryPanel();
  }

  session[fieldId] = value;
  return getAuxiliaryPanel();
}

function getActionSpeech(drug: Drug, actionId: string) {
  if (actionId === "confirm_adjust") {
    return `Ajustar dose de ${drug.name} conforme perfusão`;
  }

  if (drug.key === "noradrenalina") {
    return "Iniciar noradrenalina";
  }

  if (drug.key === "adrenalina") {
    return "Iniciar adrenalina";
  }

  if (drug.key === "vasopressina") {
    return "Iniciar vasopressina";
  }

  return `Iniciar ${drug.name}`;
}

function runAuxiliaryAction(actionId: string) {
  const drug = getSelectedDrug();
  if (!drug) {
    throw new Error("Selecione uma droga antes de usar o painel.");
  }

  if (actionId.startsWith("presentation:")) {
    session.presentationId = actionId.replace("presentation:", "");
    session.confirmedConfigToken = undefined;
    logEvent("PRESENTATION_SELECTED", {
      drug: drug.name,
      presentation: getPresentation(drug, session.presentationId).label,
    });
    return getClinicalLog();
  }

  if (actionId === "diluent:SF" || actionId === "diluent:SG") {
    session.diluent = actionId.replace("diluent:", "") as Diluent;
    session.selectedSolutionId = undefined;
    session.confirmedConfigToken = undefined;
    logEvent("DILUENT_SELECTED", {
      drug: drug.name,
      diluent: session.diluent,
    });
    return getClinicalLog();
  }

  if (actionId !== "confirm_prepare" && actionId !== "confirm_adjust") {
    return getClinicalLog();
  }

  const calculation = calculate(drug);
  validateCurrentConfiguration(drug, calculation);
  const summary = buildConfirmedSummary(drug, calculation);
  const title =
    actionId === "confirm_prepare" ? "Preparo sugerido" : "Ajuste sugerido";
  const primaryResult = buildPrimaryResultLabel(drug, calculation);
  const details = [
    summary,
    ...buildReferenceLines(drug).slice(0, 2),
  ].join("\n");

  session.confirmedConfigToken = getConfigToken();
  session.lastConfirmedAction = actionId === "confirm_prepare" ? "prepare" : "adjust";
  session.lastConfirmedSummary = summary;

  enqueueEffect({
    type: "alert",
    title,
    message: details,
  });
  enqueueEffect({
    type: "speak",
    message: getActionSpeech(drug, actionId),
    suppressStateSpeech: true,
  });

  logEvent(actionId === "confirm_prepare" ? "PREPARATION_CONFIRMED" : "ADJUSTMENT_CONFIRMED", {
    drug: drug.name,
    summary,
    result: primaryResult,
    concentration: buildConcentrationLabel(drug, calculation),
  });

  const alertToken = `${drug.key}:${session.mode}:${calculation.currentDoseMcgKgMin ?? ""}`;
  if (
    drug.vasopressinAlert &&
    calculation.currentDoseMcgKgMin != null &&
    calculation.currentDoseMcgKgMin >= drug.vasopressinAlert.threshold &&
    session.vasopressinAlertToken !== alertToken
  ) {
    session.vasopressinAlertToken = alertToken;
    enqueueEffect({
      type: "alert",
      title: "Atenção clínica",
      message: drug.vasopressinAlert.message,
    });
    enqueueEffect({
      type: "speak",
      message: "Considerar associação de vasopressina",
      suppressStateSpeech: true,
    });
    logEvent("VASOPRESSIN_ASSOCIATION_SUGGESTED", {
      drug: drug.name,
      threshold: drug.vasopressinAlert.threshold,
    });
  }

  return getClinicalLog();
}

function getClinicalLog(): ClinicalLogEntry[] {
  return session.history.map((event) => {
    switch (event.type) {
      case "PROTOCOL_STARTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Módulo de drogas vasoativas iniciado",
          details: "Ferramenta prática de preparo e ajuste de infusões contínuas.",
        };
      case "DRUG_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Droga selecionada",
          details: String(event.data?.drug ?? ""),
        };
      case "SOLUTION_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Solução selecionada",
          details: `${event.data?.drug ?? ""} • ${event.data?.solution ?? ""}`,
        };
      case "MODE_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Modo de cálculo definido",
          details: String(event.data?.mode ?? ""),
        };
      case "PRESENTATION_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Apresentação farmacológica selecionada",
          details: String(event.data?.presentation ?? ""),
        };
      case "DILUENT_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Diluente ajustado",
          details: `${event.data?.drug ?? ""} • ${event.data?.diluent ?? ""}`,
        };
      case "PREPARATION_CONFIRMED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Preparo confirmado",
          details: String(event.data?.summary ?? ""),
        };
      case "ADJUSTMENT_CONFIRMED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Ajuste confirmado",
          details: String(event.data?.summary ?? ""),
        };
      case "VASOPRESSIN_ASSOCIATION_SUGGESTED":
        return {
          timestamp: event.timestamp,
          kind: "vasopressor_reminder",
          title: "Associação de vasopressina sugerida",
          details: "Dose elevada de noradrenalina com necessidade de estratégia poupadora de catecolamina.",
        };
      case "MODULE_COMPLETED":
        return {
          timestamp: event.timestamp,
          kind: "encerramento",
          title: "Módulo concluído",
          details: `Droga final: ${event.data?.drug ?? "não definida"}`,
        };
      default:
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Atualização do módulo",
          details: event.type,
        };
    }
  });
}

function formatElapsedTime(timestamp: number) {
  const totalSeconds = Math.max(
    0,
    Math.floor((timestamp - session.protocolStartedAt) / 1000)
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getEncounterSummary(): EncounterSummary {
  const drug = getSelectedDrug();
  const calculation = drug ? calculate(drug) : null;
  const concentration = drug && calculation ? buildConcentrationLabel(drug, calculation) : "—";
  const result = drug && calculation ? buildPrimaryResultLabel(drug, calculation) : "—";
  const durationLabel = formatElapsedTime(Date.now());
  const log = getClinicalLog();

  return {
    protocolId: session.protocolId,
    durationLabel,
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: log.slice(-3).map((entry) => entry.title),
    metrics: [
      { label: "Droga", value: drug?.name ?? "Não definida" },
      { label: "Solução", value: drug ? getSolutionLabelById(drug, session.selectedSolutionId) : "—" },
      { label: "Modo", value: getModeLabel(session.mode) },
      { label: "Concentração", value: concentration },
      { label: "Resultado", value: result },
      {
        label: "Status",
        value:
          session.lastConfirmedAction === "prepare"
            ? "Preparo confirmado"
            : session.lastConfirmedAction === "adjust"
              ? "Ajuste confirmado"
              : "Pendente de confirmação",
      },
    ],
    panelMetrics: [
      { label: "Droga", value: drug?.name ?? "Não definida" },
      { label: "Concentração", value: concentration },
      { label: "Resultado", value: result },
      { label: "Modo", value: getModeLabel(session.mode) },
    ],
  };
}

function getEncounterSummaryText() {
  const summary = getEncounterSummary();
  const lines = [
    `Módulo: Drogas Vasoativas`,
    `Duração: ${summary.durationLabel}`,
    `Estado atual: ${summary.currentStateText}`,
  ];

  for (const metric of summary.metrics ?? []) {
    lines.push(`${metric.label}: ${metric.value}`);
  }

  if (session.lastConfirmedSummary) {
    lines.push(`Última conduta confirmada: ${session.lastConfirmedSummary}`);
  }

  lines.push("");
  lines.push("Log clínico:");
  for (const entry of getClinicalLog()) {
    lines.push(`- ${formatElapsedTime(entry.timestamp)} • ${entry.title}${entry.details ? ` — ${entry.details}` : ""}`);
  }

  return lines.join("\n");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getEncounterReportHtml() {
  const summary = getEncounterSummary();
  const rows = (summary.metrics ?? [])
    .map(
      (metric) =>
        `<tr><td>${escapeHtml(metric.label)}</td><td>${escapeHtml(metric.value)}</td></tr>`
    )
    .join("");
  const log = getClinicalLog()
    .map(
      (entry) =>
        `<li><strong>${escapeHtml(formatElapsedTime(entry.timestamp))} • ${escapeHtml(
          entry.title
        )}</strong>${entry.details ? `<br/>${escapeHtml(entry.details)}` : ""}</li>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório clínico • Drogas vasoativas</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; color: #111827; }
      h1, h2 { margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      td { border: 1px solid #d1d5db; padding: 10px; vertical-align: top; }
      ul { padding-left: 20px; }
      li { margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <h1>Relatório clínico • Drogas vasoativas</h1>
    <p>Duração: ${escapeHtml(summary.durationLabel)}</p>
    <p>Estado atual: ${escapeHtml(summary.currentStateText)}</p>
    <h2>Resumo operacional</h2>
    <table><tbody>${rows}</tbody></table>
    <h2>Log clínico</h2>
    <ul>${log}</ul>
  </body>
</html>`;
}

function tick() {
  return getCurrentState();
}

export {
  consumeEffects,
  getAuxiliaryPanel,
  getClinicalLog,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getReversibleCauses,
  getTimers,
  next,
  registerExecution,
  resetSession,
  runAuxiliaryAction,
  tick,
  updateAuxiliaryField,
  updateReversibleCauseStatus,
};

export type { ClinicalEngine };
