/**
 * Ventilação mecânica — orientação educativa (PBW, metas por cenário, passo a passo).
 * Não substitui protocolo institucional nem decisão médica.
 */

import raw from "./protocols/ventilacao_mecanica.json";
import {
  clearVentilationDraft,
  loadVentilationDraft,
  saveVentilationDraft,
} from "./lib/ventilation-case-storage";
import type {
  AuxiliaryPanel,
  AuxiliaryPanelRecommendation,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";

type State = {
  type: "action" | "question" | "end";
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
  phase?: string;
  phaseLabel?: string;
  phaseStep?: number;
  phaseTotal?: number;
};

type Protocol = { id: string; initialState: string; states: Record<string, State> };
type Event = { timestamp: number; type: string; data?: Record<string, string | undefined> };

type ScenarioKey =
  | "ards"
  | "hypoxemic"
  | "obstructive"
  | "cardiogenic"
  | "post_op"
  | "neuro"
  | "acidosis"
  | "obesity"
  | "neuromuscular"
  | "generic";

type VentSetupPlan = {
  isReady: boolean;
  missingInputs: string[];
  mode: string;
  vtMl: string;
  rr: string;
  peep: string;
  fio2: string;
  inspiratoryFlow: string;
  summary: string;
  targetSummary: string;
  rationale: string[];
};

type GasometryDiagnosis = {
  label: string;
  explanation: string;
};

type VentilationAdjustmentHint = {
  title: string;
  lines: string[];
  tone: "info" | "warning";
} | null;

type VentSettingMismatch = {
  label: string;
  current: string;
  recommended: string;
  reason: string;
  tone: "warning" | "danger";
};

type Assessment = {
  caseLabel: string;
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  clinicalScenario: string;
  hemodynamics: string;
  ventMode: string;
  setVtMl: string;
  setRr: string;
  setPeep: string;
  setFio2: string;
  setInspiratoryFlow: string;
  ph: string;
  paco2: string;
  pao2: string;
  hco3: string;
  baseExcess: string;
  spo2: string;
  plateauPressure: string;
  freeNotes: string;
};

type Session = {
  protocolId: string;
  currentStateId: string;
  previousStateIds: string[];
  history: Event[];
  gasometryHistory: {
    timestamp: number;
    summary: string;
    diagnosis: string;
    adjustment: string;
  }[];
  pendingEffects: EngineEffect[];
  protocolStartedAt: number;
  assessment: Assessment;
};

const protocolData = raw as Protocol;

function parseNum(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Peso predito (Devine) em kg — adulto. */
function predictedBodyWeightKg(sex: string, heightCm: number): number | null {
  if (heightCm < 120 || heightCm > 230) return null;
  const isMale = /^m/i.test(sex) || sex.toLowerCase().includes("mascul");
  const inc = (heightCm - 152.4) * 0.91;
  const base = isMale ? 50 : 45.5;
  const pbw = base + inc;
  return Math.round(pbw * 10) / 10;
}

function parseFio2(s: string): number | null {
  let f = parseNum(s);
  if (f == null) return null;
  if (f > 1.5) f = f / 100;
  if (f < 0.21 || f > 1) return null;
  return f;
}

function roundToNearestTen(value: number): number {
  return Math.round(value / 10) * 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatFio2Value(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function classifyPFRatio(pfRatio: number): string {
  if (pfRatio <= 100) return "gravidade importante / hipoxemia muito grave";
  if (pfRatio <= 150) return "hipoxemia grave";
  if (pfRatio <= 200) return "hipoxemia moderada";
  if (pfRatio <= 300) return "hipoxemia leve";
  return "sem hipoxemia importante pela relação P/F";
}

function normalizeVentModeSelection(value: string): string | null {
  const x = value.trim().toLowerCase();
  if (!x) return null;
  if (x.includes("prvc") || x.includes("vc+")) return "PRVC / VC+";
  if (x.includes("pc-ac") || x.includes("press") || x.includes("pcv")) return "PC-AC";
  if (x.includes("simv")) return "SIMV";
  if (x === "ps" || x.includes("psv") || x.includes("pressao de suporte")) return "PS";
  if (x.includes("cpap")) return "CPAP";
  return "VC-AC";
}

function buildVentSetupPlan(a: Assessment): VentSetupPlan {
  const missingInputs: string[] = [];
  const h = parseNum(a.heightCm);
  const pbw = h != null ? predictedBodyWeightKg(a.sex, h) : null;
  const scenario = a.clinicalScenario.trim() ? scenarioFromPreset(a.clinicalScenario) : null;
  const spo2 = parseNum(a.spo2);
  const pao2 = parseNum(a.pao2);
  const ph = parseNum(a.ph);
  const paco2 = parseNum(a.paco2);
  const hypotension = isHypotension(a);
  const selectedMode = normalizeVentModeSelection(a.ventMode);

  if (!a.sex.trim()) missingInputs.push("sexo");
  if (pbw == null) missingInputs.push("altura");
  if (!scenario) missingInputs.push("cenário clínico");

  if (!pbw || !scenario) {
    return {
      isReady: false,
      missingInputs,
      mode: "",
      vtMl: "",
      rr: "",
      peep: "",
      fio2: "",
      inspiratoryFlow: "",
      summary: "Preencha sexo, altura e cenário clínico para o módulo montar o setup inicial do ventilador.",
      targetSummary: "Sem setup pronto ainda",
      rationale: [
        "Sem sexo e altura não dá para calcular o peso predito (PBW), que orienta o Vt seguro.",
        "Sem cenário clínico o app não consegue decidir entre estratégia protetora, obstrutiva, neuro ou alta ventilação minuto.",
      ],
    };
  }

  let mode = selectedMode ?? "VC-AC";
  let vtPerKg = 7;
  let rr = 16;
  let peep = 5;
  let fio2 = 0.4;
  let flow: string = "60";
  let targetSummary = "Meta de SpO₂ geralmente 92–96%";
  const rationale: string[] = [];

  const severeHypoxemia =
    (spo2 != null && spo2 < 88) || (pao2 != null && pao2 < 60);
  const moderateHypoxemia =
    severeHypoxemia || (spo2 != null && spo2 < 92) || (pao2 != null && pao2 < 70);

  switch (scenario) {
    case "ards":
      vtPerKg = 6;
      rr = ph != null && ph < 7.2 ? 24 : 20;
      peep = severeHypoxemia ? 12 : moderateHypoxemia ? 10 : 8;
      fio2 = severeHypoxemia ? 1.0 : moderateHypoxemia ? 0.8 : 0.6;
      flow = "60";
      targetSummary = "ARDS: SpO₂ 88–92%, Pplat ≤30, driving pressure idealmente ≤15";
      rationale.push(
        "Estratégia protetora: Vt de 6 mL/kg PBW.",
        "PEEP moderada/mais alta se hipoxemia relevante.",
        "FiO₂ inicialmente mais alta e depois reduzir conforme SpO₂."
      );
      break;
    case "hypoxemic":
      vtPerKg = 6.5;
      rr = ph != null && ph < 7.25 ? 22 : 18;
      peep = severeHypoxemia ? 10 : moderateHypoxemia ? 8 : 6;
      fio2 = severeHypoxemia ? 1.0 : moderateHypoxemia ? 0.7 : 0.5;
      flow = "60";
      targetSummary = "Hipoxêmico: melhorar oxigenação com PEEP/FiO₂, mantendo Vt protetor";
      rationale.push(
        "Quadro hipoxêmico difuso sem SDRA confirmado ainda pede estratégia protetora.",
        "PEEP e FiO₂ são tituladas pela oxigenação e pela hemodinâmica.",
        "Se o quadro preencher critérios, depois migre mentalmente para estratégia de ARDS."
      );
      break;
    case "obstructive":
      vtPerKg = 6.5;
      rr = ph != null && ph < 7.2 ? 14 : 10;
      peep = 5;
      fio2 = severeHypoxemia ? 1.0 : moderateHypoxemia ? 0.6 : 0.4;
      flow = "80";
      targetSummary = "Obstrutivo: expiração longa, evitar auto-PEEP, aceitar algum CO₂ se pH tolerável";
      rationale.push(
        "FR mais baixa para alongar o tempo expiratório.",
        "Fluxo inspiratório mais alto para encurtar inspiração.",
        "PEEP inicial baixa para não piorar aprisionamento aéreo."
      );
      break;
    case "cardiogenic":
      vtPerKg = 6.5;
      rr = 18;
      peep = hypotension ? 6 : moderateHypoxemia ? 10 : 8;
      fio2 = severeHypoxemia ? 1.0 : moderateHypoxemia ? 0.7 : 0.5;
      flow = "60";
      targetSummary = "Edema cardiogênico: oxigenar com PEEP, mas reavaliar impacto hemodinâmico";
      rationale.push(
        "PEEP costuma ajudar recrutamento e redistribuição de edema alveolar.",
        "Em hipotensão, reavalie resposta hemodinâmica a cada ajuste de PEEP.",
        "Use a menor FiO₂ que mantenha meta de oxigenação após estabilizar."
      );
      break;
    case "post_op":
      vtPerKg = 7;
      rr = 14;
      peep = moderateHypoxemia ? 8 : 5;
      fio2 = severeHypoxemia ? 0.8 : moderateHypoxemia ? 0.5 : 0.4;
      flow = "60";
      targetSummary = "Pós-operatório: SpO₂ ≥92%, FiO₂ tão baixa quanto possível após estabilizar";
      rationale.push(
        "Pulmão sem grande lesão aguda costuma tolerar Vt 6–8 mL/kg PBW.",
        "PEEP baixa ou moderada conforme oxigenação."
      );
      break;
    case "neuro":
      vtPerKg = 7;
      rr = paco2 != null && paco2 > 45 ? 18 : paco2 != null && paco2 < 35 ? 12 : 16;
      peep = moderateHypoxemia ? 8 : 5;
      fio2 = severeHypoxemia ? 0.8 : moderateHypoxemia ? 0.5 : 0.4;
      flow = "60";
      targetSummary = "Neuro: alvo usual PaCO₂ 35–45 mmHg e evitar hipocapnia prolongada";
      rationale.push(
        "FR escolhida para manter CO₂ próximo do normal.",
        "Evitar hiperventilação sem indicação específica."
      );
      break;
    case "acidosis":
      vtPerKg = 7.5;
      rr = ph != null && ph < 7.2 ? 28 : 24;
      peep = moderateHypoxemia ? 8 : 5;
      fio2 = severeHypoxemia ? 0.8 : moderateHypoxemia ? 0.5 : 0.4;
      flow = "60";
      targetSummary = "Acidose metabólica: priorizar ventilação minuto alta sem extrapolar pressões seguras";
      rationale.push(
        "FR mais alta porque o paciente precisa compensar a acidose.",
        "Vt um pouco maior, mas ainda dentro de faixa protetora."
      );
      break;
    case "obesity":
      vtPerKg = 6.5;
      rr = 18;
      peep = hypotension ? 6 : moderateHypoxemia ? 10 : 8;
      fio2 = severeHypoxemia ? 0.8 : moderateHypoxemia ? 0.5 : 0.4;
      flow = "60";
      targetSummary = "Obesidade/atelectasia: Vt por PBW e PEEP geralmente mais alta que o básico";
      rationale.push(
        "O Vt continua sendo calculado por PBW, não pelo peso real.",
        "Atelectasia e baixa complacência de parede torácica podem exigir PEEP acima do mínimo.",
        "Cheque hemodinâmica antes de subir mais PEEP."
      );
      break;
    case "neuromuscular":
      vtPerKg = 6.5;
      rr = 14;
      peep = moderateHypoxemia ? 8 : 5;
      fio2 = severeHypoxemia ? 0.8 : moderateHypoxemia ? 0.5 : 0.4;
      flow = "60";
      targetSummary = "Neuromuscular: garantir ventilação e conforto, sem hiperinsuflação desnecessária";
      rationale.push(
        "O problema principal costuma ser falência de bomba ventilatória, não lesão alveolar difusa.",
        "Use volumes protetores e ajuste FR pela troca gasosa.",
        "Se oxigenação estiver ruim, procure atelectasia, secreção, pneumonia ou outro fator associado."
      );
      break;
    default:
      vtPerKg = 7;
      rr = ph != null && ph < 7.25 ? 20 : 16;
      peep = moderateHypoxemia ? 8 : 5;
      fio2 = severeHypoxemia ? 0.8 : moderateHypoxemia ? 0.5 : 0.4;
      flow = "60";
      targetSummary = "Estratégia inicial conservadora; ajustar depois por gasometria e mecânica";
      rationale.push(
        "Setup inicial genérico enquanto a fisiopatologia ainda está sendo refinada."
      );
      break;
  }

  if (hypotension) {
    peep = clamp(peep - 2, 5, 8);
    rationale.push("Hemodinâmica frágil: PEEP contida para reduzir impacto sobre retorno venoso.");
  }

  const vtMl = clamp(roundToNearestTen(pbw * vtPerKg), 280, 620);
  let summary = `Modo ${mode} · Vt ${vtMl} mL · FR ${rr}/min · PEEP ${peep} cmH₂O · FiO₂ ${Math.round(fio2 * 100)}% · Fluxo ${flow} L/min`;

  if (mode === "PRVC / VC+") {
    rationale.push("PRVC/VC+: manter alvo de volume com limite de pressão, útil quando se quer proteção pulmonar com adaptação de pressão.");
    summary = `Modo ${mode} · Vt alvo ${vtMl} mL · FR ${rr}/min · PEEP ${peep} cmH₂O · FiO₂ ${Math.round(fio2 * 100)}%`;
  }

  if (mode === "PC-AC") {
    flow = `Pinsp titulada para Vt ~${vtMl} mL`;
    rationale.push("PC-AC: titule a pressão inspiratória para atingir Vt protetor, mantendo vigilância de volume entregue.");
    summary = `Modo ${mode} · Vt alvo ${vtMl} mL · FR ${rr}/min · PEEP ${peep} cmH₂O · FiO₂ ${Math.round(fio2 * 100)}% · ${flow}`;
  }

  if (mode === "SIMV") {
    rr = clamp(rr - 2, 10, 24);
    rationale.push("SIMV: usar quando a estratégia da unidade pedir respirações mandatórias intercaladas; não costuma ser a primeira escolha em instabilidade aguda.");
    summary = `Modo ${mode} · FR mandatória ${rr}/min · Vt alvo ${vtMl} mL · PEEP ${peep} cmH₂O · FiO₂ ${Math.round(fio2 * 100)}%`;
  }

  if (mode === "PS") {
    flow = `PS titulada para Vt ~${vtMl} mL`;
    rationale.push("PSV: ajuste a pressão de suporte para manter Vt protetor e FR confortável, em paciente com esforço espontâneo.");
    targetSummary = `PSV: observar Vt ~${vtMl} mL, FR confortável e manter oxigenação adequada`;
    summary = `Modo ${mode} · Vt alvo observado ${vtMl} mL · PEEP ${peep} cmH₂O · FiO₂ ${Math.round(fio2 * 100)}% · ${flow}`;
  }

  if (mode === "CPAP") {
    flow = "Sem fluxo fixo relevante";
    rationale.push("CPAP: foco em PEEP/CPAP e FiO₂; acompanhar FR, esforço respiratório e Vt espontâneo do paciente.");
    targetSummary = `CPAP: priorizar oxigenação e conforto, com Vt espontâneo protetor e FR aceitável`;
    summary = `Modo ${mode} · CPAP/PEEP ${peep} cmH₂O · FiO₂ ${Math.round(fio2 * 100)}% · Vt espontâneo alvo ~${vtMl} mL`;
  }

  return {
    isReady: true,
    missingInputs: [],
    mode,
    vtMl: String(vtMl),
    rr: String(rr),
    peep: String(peep),
    fio2: formatFio2Value(fio2),
    inspiratoryFlow: String(flow),
    summary,
    targetSummary,
    rationale,
  };
}

function diagnoseGasometry(a: Assessment): GasometryDiagnosis | null {
  const ph = parseNum(a.ph);
  const paco2 = parseNum(a.paco2);
  const hco3 = parseNum(a.hco3);
  const baseExcess = parseNum(a.baseExcess);

  if (ph == null && paco2 == null && hco3 == null && baseExcess == null) {
    return null;
  }

  if (ph == null) {
    return {
      label: "Gasometria incompleta",
      explanation: "Preencha o pH para o módulo interpretar acidose ou alcalose.",
    };
  }

  if (paco2 == null && hco3 == null) {
    return {
      label: "Gasometria parcial",
      explanation: "Preencha PaCO₂ e, se possível, HCO₃⁻ para diferenciar componente respiratório e metabólico.",
    };
  }

  if (ph < 7.35 && paco2 != null && paco2 > 45 && hco3 != null && hco3 < 22) {
    return {
      label: "Distúrbio misto com acidemia",
      explanation: "pH baixo, PaCO₂ alta e HCO₃⁻ baixo sugerem acidose respiratória associada a acidose metabólica.",
    };
  }

  if (ph > 7.45 && paco2 != null && paco2 < 35 && hco3 != null && hco3 > 26) {
    return {
      label: "Distúrbio misto com alcalemia",
      explanation: "pH alto, PaCO₂ baixa e HCO₃⁻ alto sugerem alcalose respiratória associada a alcalose metabólica.",
    };
  }

  if (ph >= 7.35 && ph <= 7.45 && paco2 != null && hco3 != null) {
    if (paco2 > 45 && hco3 > 26) {
      return {
        label: "pH normal com retenção crônica de CO₂ provável",
        explanation: "PaCO₂ alta com HCO₃⁻ alto e pH quase normal sugerem compensação metabólica de distúrbio respiratório crônico.",
      };
    }
    if (paco2 < 35 && hco3 < 22) {
      return {
        label: "pH normal com distúrbio misto/compensado provável",
        explanation: "PaCO₂ baixa e HCO₃⁻ baixo com pH quase normal sugerem alcalose respiratória compensada ou distúrbio misto.",
      };
    }
  }

  if (ph < 7.35 && paco2 != null && paco2 > 45) {
    return {
      label: "Acidose respiratória",
      explanation: "pH baixo com PaCO₂ alta sugere hipoventilação alveolar ou ventilação minuto insuficiente.",
    };
  }

  if (ph > 7.45 && paco2 != null && paco2 < 35) {
    return {
      label: "Alcalose respiratória",
      explanation: "pH alto com PaCO₂ baixa sugere ventilação excessiva para a necessidade atual.",
    };
  }

  if (ph < 7.35 && paco2 != null && paco2 <= 45) {
    return {
      label: "Acidose metabólica provável",
      explanation: hco3 != null
        ? "pH baixo sem retenção de CO₂ e com HCO₃⁻ baixo sugere acidose metabólica."
        : "pH baixo sem retenção de CO₂ sugere componente metabólico, possivelmente com compensação respiratória.",
    };
  }

  if (ph > 7.45 && paco2 != null && paco2 >= 35) {
    return {
      label: "Alcalose metabólica provável",
      explanation: hco3 != null
        ? "pH alto sem PaCO₂ reduzida e com HCO₃⁻ alto sugere alcalose metabólica."
        : "pH alto sem PaCO₂ reduzida sugere componente metabólico ou compensação respiratória insuficiente.",
    };
  }

  return {
    label: "pH próximo do normal",
    explanation: "Sem acidemia ou alcalemia claras pelos dados atuais; interpretar junto com contexto clínico e tendência gasométrica.",
  };
}

function buildVentilationAdjustmentHint(a: Assessment): VentilationAdjustmentHint {
  const diagnosis = diagnoseGasometry(a);
  const scenario = a.clinicalScenario.trim() ? scenarioFromPreset(a.clinicalScenario) : null;

  if (!diagnosis) {
    return null;
  }

  if (diagnosis.label.includes("Acidose respiratória") || diagnosis.label.includes("retenção crônica")) {
    return {
      title: "Ajuste ventilatório prioritário",
      tone: "warning",
      lines: [
        "CO₂ está alto para o pH atual: aumente ventilação minuto.",
        scenario === "ards"
          ? "Se for ARDS, prefira subir FR antes de aumentar Vt acima da estratégia protetora."
          : "Suba FR em pequenos passos e reavalie antes de aceitar volumes maiores.",
      ],
    };
  }

  if (diagnosis.label.includes("Alcalose respiratória")) {
    return {
      title: "Ajuste ventilatório prioritário",
      tone: "warning",
      lines: [
        "CO₂ está baixo: reduza a ventilação em pequenos passos.",
        "Primeiro reduza FR e depois repita a gasometria.",
      ],
    };
  }

  if (diagnosis.label.includes("Acidose metabólica")) {
    return {
      title: "Ajuste ventilatório prioritário",
      tone: "info",
      lines: [
        "A alteração principal parece metabólica: o ventilador ajuda na compensação, mas não resolve a causa.",
        "Mantenha ventilação minuto adequada e trate o distúrbio de base em paralelo.",
      ],
    };
  }

  return null;
}

function buildVentSettingMismatches(a: Assessment): VentSettingMismatch[] {
  const plan = buildVentSetupPlan(a);
  if (!plan.isReady) return [];

  const mismatches: VentSettingMismatch[] = [];
  const scenario = scenarioFromPreset(a.clinicalScenario);
  const currentMode = normalizeVentModeSelection(a.ventMode);
  const currentVt = parseNum(a.setVtMl);
  const currentRr = parseNum(a.setRr);
  const currentPeep = parseNum(a.setPeep);
  const currentFio2 = parseFio2(a.setFio2);
  const currentFlow = parseNum(a.setInspiratoryFlow);
  const suggestedVt = parseNum(plan.vtMl);
  const suggestedRr = parseNum(plan.rr);
  const suggestedPeep = parseNum(plan.peep);
  const suggestedFio2 = parseFio2(plan.fio2);
  const suggestedFlow = parseNum(plan.inspiratoryFlow);

  if (currentMode && currentMode !== plan.mode) {
    mismatches.push({
      label: "modo",
      current: currentMode,
      recommended: plan.mode,
      reason:
        scenario === "obstructive"
          ? "no obstrutivo, o modo inicial precisa facilitar tempo expiratório e evitar auto-PEEP"
          : scenario === "ards" || scenario === "hypoxemic"
            ? "o cenário atual favorece estratégia protetora no modo sugerido pelo app"
            : "o modo atual se afasta da estratégia inicial sugerida para este cenário",
      tone: "warning",
    });
  }

  if (currentVt != null && suggestedVt != null && Math.abs(currentVt - suggestedVt) >= 50) {
    mismatches.push({
      label: "Vt",
      current: `${currentVt} mL`,
      recommended: `${plan.vtMl} mL`,
      reason:
        scenario === "ards"
          ? "na ARDS o Vt deve seguir proteção pulmonar por PBW"
          : scenario === "obesity"
            ? "mesmo na obesidade o Vt continua guiado pelo PBW, não pelo peso real"
            : "o volume corrente ficou distante do valor sugerido para o cenário atual",
      tone: scenario === "ards" ? "danger" : "warning",
    });
  }

  if (currentRr != null && suggestedRr != null && Math.abs(currentRr - suggestedRr) >= 3) {
    mismatches.push({
      label: "FR",
      current: `${currentRr}/min`,
      recommended: `${plan.rr}/min`,
      reason:
        scenario === "obstructive"
          ? "FR alta demais pode encurtar a expiração e gerar auto-PEEP"
          : scenario === "acidosis"
            ? "na acidose metabólica a ventilação minuto precisa acompanhar a compensação"
            : "a frequência respiratória ficou fora da faixa sugerida pelo setup inicial",
      tone: scenario === "obstructive" ? "danger" : "warning",
    });
  }

  if (currentPeep != null && suggestedPeep != null && Math.abs(currentPeep - suggestedPeep) >= 2) {
    mismatches.push({
      label: "PEEP",
      current: `${currentPeep} cmH2O`,
      recommended: `${plan.peep} cmH2O`,
      reason:
        scenario === "cardiogenic" || isHypotension(a)
          ? "PEEP inadequada pode piorar perfusão ou manter oxigenação abaixo do alvo"
          : "a PEEP atual se afastou da estratégia sugerida para este cenário",
      tone: "warning",
    });
  }

  if (currentFio2 != null && suggestedFio2 != null && Math.abs(currentFio2 - suggestedFio2) >= 0.15) {
    mismatches.push({
      label: "FiO2",
      current: currentFio2.toFixed(2).replace(".", ","),
      recommended: plan.fio2,
      reason:
        currentFio2 < suggestedFio2
          ? "o suporte de oxigênio atual pode estar abaixo do necessário para o cenário"
          : "vale reduzir FiO2 excessiva quando o cenário permite, para evitar hiperóxia desnecessária",
      tone: "warning",
    });
  }

  if (currentFlow != null && suggestedFlow != null && Math.abs(currentFlow - suggestedFlow) >= 15) {
    mismatches.push({
      label: "fluxo",
      current: `${currentFlow} L/min`,
      recommended: `${plan.inspiratoryFlow} L/min`,
      reason:
        scenario === "obstructive"
          ? "no obstrutivo, fluxo mais alto ajuda a encurtar a inspiração e ganhar tempo expiratório"
          : "o fluxo inspiratório ficou distante do valor sugerido pelo app",
      tone: "warning",
    });
  }

  return mismatches;
}

function persistSessionDraft() {
  saveVentilationDraft(session);
}

function scenarioFromPreset(label: string): ScenarioKey {
  const x = label.toLowerCase();
  if (x.includes("ards") || x.includes("sdra")) return "ards";
  if (x.includes("hipox") || x.includes("pneumonia grave") || x.includes("sepse pulmonar")) return "hypoxemic";
  if (x.includes("obstrut") || x.includes("asma") || x.includes("dpoc")) return "obstructive";
  if (x.includes("edema agudo") || x.includes("cardiog")) return "cardiogenic";
  if (x.includes("pós") || x.includes("pos-op") || x.includes("pós-op")) return "post_op";
  if (x.includes("neuro")) return "neuro";
  if (x.includes("acidose")) return "acidosis";
  if (x.includes("obes") || x.includes("atelectasia")) return "obesity";
  if (x.includes("neuromuscular") || x.includes("miastenia") || x.includes("guillain")) return "neuromuscular";
  return "generic";
}

function isHypotension(a: Assessment): boolean {
  const x = a.hemodynamics.toLowerCase();
  return (
    x.includes("hipotens") ||
    x.includes("vasopressor") ||
    x.includes("choque") ||
    x.includes("instável") ||
    x.includes("instavel") ||
    x.includes("baixo débito") ||
    x.includes("baixo debito")
  );
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const h = parseNum(a.heightCm);
  const pbw = h != null ? predictedBodyWeightKg(a.sex, h) : null;
  const plan = buildVentSetupPlan(a);
  const gasometry = diagnoseGasometry(a);
  const adjustmentHint = buildVentilationAdjustmentHint(a);
  const settingMismatches = buildVentSettingMismatches(a);
  if (pbw != null) {
    out.push({ label: "Peso predito (PBW)", value: `${pbw} kg` });
    out.push({
      label: "Cálculo PBW",
      value: `${a.sex || "Sexo"}, ${a.heightCm || "—"} cm → PBW ${pbw} kg`,
    });
    out.push({
      label: "Vt protetor 6 mL/kg",
      value: `${roundToNearestTen(pbw * 6)} mL`,
    });
    out.push({
      label: "Vt inicial 7 mL/kg",
      value: `${roundToNearestTen(pbw * 7)} mL`,
    });
  }

  if (plan.isReady) {
    out.push({ label: "Parâmetros recomendados agora", value: plan.summary });
    out.push({ label: "Meta ventilatória do cenário", value: plan.targetSummary });
  } else {
    out.push({
      label: "⚠️ Parâmetros recomendados",
      value: `⚠️ Preencha ${plan.missingInputs.join(", ")} para o app montar os parâmetros iniciais.`,
    });
  }

  const vt = parseNum(a.setVtMl);
  if (vt != null && pbw != null && pbw > 0) {
    const vkg = vt / pbw;
    out.push({ label: "Vt / kg PBW", value: `${vkg.toFixed(1)} mL/kg` });
  }

  const peep = parseNum(a.setPeep);
  const pplat = parseNum(a.plateauPressure);
  if (pplat != null && peep != null) {
    const dp = pplat - peep;
    out.push({ label: "Driving P (Pplat−PEEP)", value: `${dp.toFixed(0)} cmH₂O` });
  }

  const spo2 = parseNum(a.spo2);
  const fi = parseFio2(a.setFio2);
  if (spo2 != null && fi != null && fi > 0) {
    out.push({ label: "SpO₂/FiO₂ (aprox.)", value: `${Math.round(spo2 / fi)}` });
  }

  const pao2 = parseNum(a.pao2);
  if (pao2 != null && fi != null && fi > 0) {
    const pfRatio = Math.round(pao2 / fi);
    out.push({ label: "PaO₂/FiO₂", value: `${pfRatio}` });
    out.push({ label: "Gravidade da oxigenação", value: classifyPFRatio(pfRatio) });
  }

  if (gasometry) {
    out.push({ label: "Diagnóstico gasométrico", value: gasometry.label });
  }
  if (adjustmentHint) {
    out.push({ label: "Ajuste ventilatório", value: adjustmentHint.lines[0] });
  }

  const scen = scenarioFromPreset(a.clinicalScenario);
  if (scen === "ards") {
    out.push({
      label: "Meta ARDS (referência)",
      value: "Vt ~6 mL/kg PBW; Pplat ≤30",
    });
    if (pao2 != null && fi != null && fi > 0) {
      const pf = pao2 / fi;
      if (pf <= 150) {
        out.push({
          label: "⚠️ ARDS moderada/grave",
          value: "⚠️ PaO₂/FiO₂ ≤150: considerar pronação prolongada na ventilação mecânica, se não houver contraindicação.",
        });
      }
    }
  }
  if (scen === "hypoxemic") {
    out.push({
      label: "Hipoxêmico",
      value: "Priorize PEEP/FiO₂ com Vt protetor",
    });
  }
  if (scen === "obstructive") {
    out.push({
      label: "Obstrutivo",
      value: "Tempo expiratório longo; FR moderada",
    });
  }
  if (scen === "cardiogenic") {
    out.push({
      label: "Edema cardiogênico",
      value: "PEEP pode ajudar, mas vigie pressão arterial",
    });
  }

  if (settingMismatches.length > 0) {
    const priorityLabels = settingMismatches.slice(0, 3).map((item) => item.label).join(", ");
    out.push({
      label: "⚠️ Revisar setup ventilatório",
      value: `⚠️ Há divergência em ${priorityLabels}. Abra a etapa final para revisar os ajustes sugeridos.`,
    });
  }

  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
  const plan = buildVentSetupPlan(a);
  const gasometry = diagnoseGasometry(a);
  const adjustmentHint = buildVentilationAdjustmentHint(a);
  const pbw =
    parseNum(a.heightCm) != null ? predictedBodyWeightKg(a.sex, parseNum(a.heightCm)!) : null;
  const scen = scenarioFromPreset(a.clinicalScenario);
  const hypo = isHypotension(a);
  const vt = parseNum(a.setVtMl);
  const rr = parseNum(a.setRr);
  const peep = parseNum(a.setPeep);
  const fio2 = parseFio2(a.setFio2);
  const pplat = parseNum(a.plateauPressure);
  const ph = parseNum(a.ph);
  const paco2 = parseNum(a.paco2);
  const pao2 = parseNum(a.pao2);
  const pfRatio = pao2 != null && fio2 != null && fio2 > 0 ? pao2 / fio2 : null;

  recs.push(
    plan.isReady
      ? {
          title: "Resumo do setup recomendado",
          tone: "info",
          lines: [
            `Parâmetros iniciais sugeridos: ${plan.summary}.`,
            `Objetivo fisiológico principal: ${plan.targetSummary}.`,
            "Use esse setup como ponto de partida; qualquer mudança relevante no aparelho deve ser reavaliada à luz da gasometria, da mecânica e da hemodinâmica.",
          ],
        }
      : {
          title: "Setup inicial ainda indisponível",
          tone: "warning",
          lines: [
            `Complete ${plan.missingInputs.join(", ")} para o sistema propor modo, Vt, FR, PEEP, FiO₂ e fluxo inicial.`,
          ],
        }
  );

  const settingMismatches = buildVentSettingMismatches(a);
  if (settingMismatches.length > 0) {
    recs.push({
      title: "Alarme de configuração ventilatória",
      tone: settingMismatches.some((item) => item.tone === "danger") ? "danger" : "warning",
      lines: [
        "A configuração atual se afastou do setup mais adequado para o cenário clínico informado.",
        "Isso não obriga retorno automático ao valor sugerido, mas exige checagem ativa para evitar ventilação subótima ou insegura.",
        ...settingMismatches.map(
          (item) =>
            `${item.label.toUpperCase()}: atual ${item.current} → sugerido ${item.recommended}; ${item.reason}.`
        ),
      ],
      ctaButton: { label: "Reaplicar setup sugerido", actionId: "apply_initial_vent_setup" },
    });
  }

  if (gasometry) {
    const gasometryLines = [
      gasometry.label,
      gasometry.explanation,
    ];
    if (pfRatio != null) {
      gasometryLines.push(`PaO₂/FiO₂ ≈ ${Math.round(pfRatio)} — ${classifyPFRatio(pfRatio)}.`);
    }
    recs.push({
      title: "Interpretação da gasometria atual",
      tone: gasometry.label.includes("Acidose") || gasometry.label.includes("Alcalose") ? "warning" : "info",
      lines: [
        ...gasometryLines,
        "Correlacione o resultado com o ventilador, perfusão e esforço do paciente antes de mudar múltiplos parâmetros ao mesmo tempo.",
      ],
    });
  }

  if (adjustmentHint) {
    recs.push({
      title: adjustmentHint.title,
      tone: adjustmentHint.tone,
      lines: adjustmentHint.lines,
    });
  } else if (gasometry) {
    recs.push({
      title: "Ajuste ventilatório após a gasometria",
      tone: "info",
      lines: [
        "A gasometria atual não sugere correção ventilatória imediata relevante.",
        "Mantenha a estratégia vigente, vigie mecânica/oxigenação e repita a gasometria se houver mudança clínica, piora de alarmes ou nova intervenção.",
      ],
    });
  }

  const targetVtLo = pbw != null ? Math.round(6 * pbw) : null;
  const targetVtHi = pbw != null ? Math.round(8 * pbw) : null;

  recs.push({
    title: "Leitura operacional do ventilador",
    tone: "info",
    lines: [
      `Modo atual: ${a.ventMode || "não informado"}${vt != null ? ` · Vt ${vt} mL` : ""}${rr != null ? ` · FR ${rr}/min` : ""}${peep != null ? ` · PEEP ${peep} cmH₂O` : ""}${fio2 != null ? ` · FiO₂ ${Math.round(fio2 * 100)}%` : ""}.`,
      pplat != null
        ? `Pplat atual ${pplat} cmH₂O${peep != null ? ` · driving pressure aproximada ${Math.round(pplat - peep)} cmH₂O.` : "."}`
        : "Se possível, medir Pplat ajuda a avaliar segurança da distensão pulmonar.",
      "Use esse bloco para confrontar o que está no aparelho com o que o cenário clínico está exigindo agora, e não apenas com o setup inicial.",
    ],
  });

  if (scen === "ards") {
    const lines: string[] = [
      `Vt alvo = 6 mL/kg PBW${pbw != null ? ` (${plan.vtMl} mL neste paciente)` : ""}, evitando volutrauma.`,
      "Mantenha Pplat ≤30 cmH₂O e driving pressure idealmente ≤15 cmH₂O.",
      "Se hipoxemia persistir, priorize ajuste de PEEP/FiO₂ antes de elevar Vt.",
      "Se o quadro for moderado ou grave e houver equipe/estrutura, considerar pronação prolongada.",
    ];
    if (pfRatio != null) {
      lines.push(`PaO₂/FiO₂ atual ≈ ${Math.round(pfRatio)}.`);
      if (pfRatio <= 150) {
        lines.push("PaO₂/FiO₂ ≤150: considerar pronação prolongada se não houver contraindicação.");
      }
    }
    recs.push({ title: "Ajuste fino prioritário", tone: "warning", lines });
  } else if (scen === "hypoxemic") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "warning",
      lines: [
        "Use estratégia protetora com foco em oxigenação por PEEP e FiO₂.",
        "Se a hipoxemia permanecer importante, reavalie se o caso já migrou para ARDS/SDRA.",
        "Evite corrigir oxigenação aumentando Vt acima do alvo protetor.",
      ],
    });
  } else if (scen === "obstructive") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "warning",
      lines: [
        `Use FR ${plan.rr || "10–14"}/min e ajuste inspiratório compatível com expiração longa (${plan.inspiratoryFlow || "80"}).`,
        "Observe a curva: o fluxo expiratório deve voltar a zero antes da próxima inspiração.",
        "Se houver auto-PEEP, reduza FR e encurte o tempo inspiratório antes de tentar ganhar volume minuto.",
      ],
    });
  } else if (scen === "cardiogenic") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "warning",
      lines: [
        "A PEEP ajuda no edema alveolar, mas pode derrubar pressão se o doente estiver instável.",
        "Faça ajustes pequenos e reavalie perfusão junto com a melhora da oxigenação.",
        "Se a troca gasosa não evoluir, procure causa associada além do edema cardiogênico.",
      ],
    });
  } else if (scen === "post_op") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "info",
      lines: [
        `Use Vt 6–8 mL/kg PBW${pbw != null ? ` (${plan.vtMl} mL neste paciente)` : ""}.`,
        "Depois da estabilização inicial, reduza FiO₂ ao menor valor que mantenha SpO₂ adequada.",
        "Se a pressão subir sem hipoxemia importante, procure problema mecânico antes de subir suporte.",
      ],
    });
  } else if (scen === "neuro") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "warning",
      lines: [
        "Meta neurocrítica usual: SpO₂ ≥94%, pH 7,35–7,45 e PaCO₂ 35–45 mmHg.",
        "Evite hiperventilação prolongada fora de indicação neurológica bem definida.",
        "Ajuste FR em passos pequenos, guiando-se pela PaCO₂ e pela situação clínica.",
      ],
    });
  } else if (scen === "acidosis") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "warning",
      lines: [
        `Esse cenário costuma precisar de ventilação minuto alta; o app sugere FR ${plan.rr || "24–28"}/min.`,
        "Ganhe ventilação preferindo FR antes de extrapolar volumes inseguros.",
        "A ventilação ajuda a compensar, mas a correção da causa da acidose continua central.",
      ],
    });
  } else if (scen === "obesity") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "warning",
      lines: [
        "O Vt continua baseado em PBW, não no peso real do paciente.",
        "Muitos pacientes obesos precisam de PEEP acima do mínimo para combater atelectasia, se a perfusão tolerar.",
        "Se persistir dessaturação, revise posição, secreção e estratégia de recrutamento com a equipe.",
      ],
    });
  } else if (scen === "neuromuscular") {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "info",
      lines: [
        "O problema principal costuma ser ventilatório; ajuste FR e suporte para manter pH e CO₂ em alvo.",
        "Se a oxigenação estiver pior do que o esperado, procure causa pulmonar associada em vez de apenas aumentar suporte.",
        "Acompanhe conforto, sincronia e força residual do paciente ao longo do tempo.",
      ],
    });
  } else {
    recs.push({
      title: "Ajuste fino prioritário",
      tone: "info",
      lines: [
        `Sem ARDS confirmado, trabalhe com Vt 6–8 mL/kg PBW${pbw != null ? ` (${plan.vtMl} mL neste paciente)` : ""}.`,
        "Titule FiO₂ e PEEP para a meta de oxigenação, evitando hiperóxia e PEEP excessiva desnecessária.",
        "Reavalie a resposta antes de acumular múltiplas mudanças no aparelho.",
      ],
    });
  }

  if (hypo) {
    recs.push({
      title: "Hipotensão — cuidado com PEEP",
      tone: "danger",
      lines: [
        "PEEP reduz retorno venoso; em choque pode ser necessário aceitar PEEP mais contida temporariamente.",
        "Após qualquer ajuste, reavalie PAM, perfusão periférica, necessidade de vasopressor e resposta respiratória.",
      ],
    });
  }

  if (vt != null && pbw != null && vt / pbw > 8 && scen === "ards") {
    recs.push({
      title: "Alerta: Vt alto para ARDS",
      tone: "danger",
      lines: [
        `Vt atual ≈ ${(vt / pbw).toFixed(1)} mL/kg PBW, acima do usual para proteção pulmonar.`,
        "Reduza Vt em direção a ~6 mL/kg PBW, sobretudo se Pplat ou driving pressure estiverem elevados.",
      ],
    });
  }

  if (pplat != null && pplat > 30 && scen === "ards") {
    recs.push({
      title: "Pplat elevada",
      tone: "danger",
      lines: [
        `Pplat ${pplat} cmH₂O, acima da meta protetora usual.`,
        "Reduza Vt e revise esforço do paciente, auto-PEEP, sincronia e necessidade de sedação antes de novas escaladas.",
      ],
    });
  }

  recs.push({
    title: "Reavaliação após ajustes",
    tone: "info",
    lines: [
      "Espere 5–15 min após a mudança principal, salvo piora clínica imediata.",
      "Cheque SpO₂, pressão arterial, mecânica pulmonar, curvas/alarme e contexto hemodinâmico.",
      "Se persistir desvio de meta, ajuste uma variável por vez, documente a resposta e use uma nova gasometria para orientar o próximo passo.",
    ],
  });

  return recs;
}

function buildPlanNotePresets(a: Assessment): { label: string; value: string }[] {
  const presets: { label: string; value: string }[] = [];
  const plan = buildVentSetupPlan(a);
  const diagnosis = diagnoseGasometry(a);
  const adjustmentHint = buildVentilationAdjustmentHint(a);
  const scen = scenarioFromPreset(a.clinicalScenario);
  const pplat = parseNum(a.plateauPressure);
  const fio2 = parseFio2(a.setFio2);
  const pao2 = parseNum(a.pao2);
  const pfRatio = pao2 != null && fio2 != null && fio2 > 0 ? pao2 / fio2 : null;

  if (plan.isReady) {
    presets.push({
      label: "Manter parâmetros recomendados e reavaliar",
      value: `Manter parâmetros recomendados pelo app neste momento: ${plan.summary}`,
    });
  }

  if (adjustmentHint) {
    presets.push({
      label: "Aplicar ajuste ventilatório sugerido",
      value: adjustmentHint.lines.join(" "),
    });
  } else if (diagnosis) {
    presets.push({
      label: "Sem ajuste ventilatório pela gasometria atual",
      value: "Sem recomendação de ajuste ventilatório com base na gasometria atual; manter estratégia e repetir gasometria conforme evolução.",
    });
  }

  if (scen === "ards" && pfRatio != null && pfRatio <= 150) {
    presets.push({
      label: "Discutir pronação",
      value: "PaO₂/FiO₂ ≤ 150: discutir pronação prolongada se não houver contraindicação.",
    });
  }

  if (pplat != null && pplat > 30) {
    presets.push({
      label: "Reduzir distensão pulmonar",
      value: "Pplat acima da meta: reduzir distensão pulmonar, revisar Vt, auto-PEEP, sincronia e necessidade de sedação.",
    });
  }

  if (isHypotension(a)) {
    presets.push({
      label: "Reavaliar perfusão após ajuste",
      value: "Após qualquer aumento de PEEP, reavaliar pressão arterial, perfusão e necessidade de suporte hemodinâmico.",
    });
  }

  presets.push({
    label: "Repetir gasometria em 30 min",
    value: "Repetir gasometria em 30 min após ajuste ventilatório ou antes se piora clínica.",
  });

  presets.push({
    label: "Checar mecânica e alarmes",
    value: "Reavaliar SpO₂, pressão arterial, curvas do ventilador, alarmes e mecânica pulmonar após a mudança.",
  });

  return presets.slice(0, 8);
}

function suggestForField(
  fieldId: keyof Assessment,
  a: Assessment
): { suggestedValue?: string; suggestedLabel?: string } {
  const plan = buildVentSetupPlan(a);

  if (!plan.isReady) {
    return {};
  }

  switch (fieldId) {
    case "ventMode":
      return { suggestedValue: plan.mode, suggestedLabel: `Sugerido: ${plan.mode}` };
    case "setVtMl":
      return {
        suggestedValue: plan.vtMl,
        suggestedLabel:
          plan.mode === "PS" || plan.mode === "CPAP"
            ? `Vt alvo observado: ${plan.vtMl} mL`
            : `${plan.vtMl} mL (${plan.targetSummary})`,
      };
    case "setRr":
      return {
        suggestedValue: plan.rr,
        suggestedLabel:
          plan.mode === "PS" || plan.mode === "CPAP"
            ? `FR alvo/esperada: ${plan.rr} resp/min`
            : `${plan.rr} resp/min`,
      };
    case "setPeep":
      return { suggestedValue: plan.peep, suggestedLabel: `${plan.peep} cmH₂O` };
    case "setFio2":
      return { suggestedValue: plan.fio2, suggestedLabel: `FiO₂ ${plan.fio2}` };
    case "setInspiratoryFlow":
      return { suggestedValue: plan.inspiratoryFlow, suggestedLabel: `${plan.inspiratoryFlow} L/min` };
    default:
      return {};
  }
}

function getVentFieldPresentation(a: Assessment) {
  const mode = normalizeVentModeSelection(a.ventMode) ?? "VC-AC";

  if (mode === "PC-AC") {
    return {
      vtLabel: "Vt alvo / entregue (mL)",
      rrLabel: "FR total / backup (resp/min)",
      peepLabel: "PEEP (cmH₂O)",
      flowLabel: "Pinsp / ajuste da pressão",
      flowPlaceholder: "Ex.: titular Pinsp para atingir Vt alvo",
      flowPresets: [
        { label: "Pinsp titulada para Vt alvo", value: "Pinsp titulada para Vt alvo" },
        { label: "Pinsp baixa com Vt insuficiente", value: "Pinsp baixa com Vt insuficiente" },
        { label: "Pinsp ajustada com platô seguro", value: "Pinsp ajustada com platô seguro" },
        { label: "Ti 0,8–1,0 s", value: "Ti 0,8–1,0 s" },
      ],
    };
  }

  if (mode === "PS") {
    return {
      vtLabel: "Vt observado (mL)",
      rrLabel: "FR espontânea (resp/min)",
      peepLabel: "PEEP / EPAP (cmH₂O)",
      flowLabel: "Pressão de suporte / observação",
      flowPlaceholder: "Ex.: PS ajustada para Vt e conforto",
      flowPresets: [
        { label: "PS titulada para Vt protetor", value: "PS titulada para Vt protetor" },
        { label: "PS baixa com esforço alto", value: "PS baixa com esforço alto" },
        { label: "PS confortável com FR estável", value: "PS confortável com FR estável" },
        { label: "Acompanhar sincronia e drive", value: "Acompanhar sincronia e drive" },
      ],
    };
  }

  if (mode === "CPAP") {
    return {
      vtLabel: "Vt espontâneo (mL)",
      rrLabel: "FR espontânea (resp/min)",
      peepLabel: "CPAP / PEEP (cmH₂O)",
      flowLabel: "Observação do suporte",
      flowPlaceholder: "Ex.: manter CPAP e observar esforço",
      flowPresets: [
        { label: "CPAP isolado com oxigenação adequada", value: "CPAP isolado com oxigenação adequada" },
        { label: "Acompanhar FR e esforço respiratório", value: "Acompanhar FR e esforço respiratório" },
        { label: "Observar Vt espontâneo e conforto", value: "Observar Vt espontâneo e conforto" },
      ],
    };
  }

  return {
    vtLabel: "Volume corrente (Vt) programado (mL)",
    rrLabel: "FR (resp/min)",
    peepLabel: "PEEP (cmH₂O)",
    flowLabel: "Fluxo inspiratório (L/min) ou observação",
    flowPlaceholder: "Opcional — importante no obstrutivo",
    flowPresets: [
      { label: "40 L/min (mais lento)", value: "40" },
      { label: "60 L/min (padrão inicial comum)", value: "60" },
      { label: "80 L/min (obstrutivo / expiração longa)", value: "80" },
      { label: "100 L/min (obstrutivo grave / quando necessário)", value: "100" },
      { label: "Tempo expiratório prolongado", value: "Tempo expiratório prolongado" },
    ],
  };
}

let session: Session = createSession();

function createSession(): Session {
  const savedDraft = loadVentilationDraft<Session>();

  if (savedDraft?.assessment && savedDraft.protocolId === protocolData.id) {
    return {
      ...savedDraft,
      currentStateId: savedDraft.currentStateId || protocolData.initialState,
      previousStateIds: savedDraft.previousStateIds ?? [],
      history: savedDraft.history ?? [{ timestamp: Date.now(), type: "PROTOCOL_RESTORED" }],
      gasometryHistory: savedDraft.gasometryHistory ?? [],
      pendingEffects: [],
      protocolStartedAt: savedDraft.protocolStartedAt ?? Date.now(),
    };
  }

  return {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    previousStateIds: [],
    history: [{ timestamp: Date.now(), type: "PROTOCOL_STARTED" }],
    gasometryHistory: [],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    assessment: {
      caseLabel: "",
      age: "",
      sex: "",
      heightCm: "",
      weightKg: "",
      clinicalScenario: "",
      hemodynamics: "",
      ventMode: "",
      setVtMl: "",
      setRr: "",
      setPeep: "",
      setFio2: "",
      setInspiratoryFlow: "",
      ph: "",
      paco2: "",
      pao2: "",
      hco3: "",
      baseExcess: "",
      spo2: "",
      plateauPressure: "",
      freeNotes: "",
    },
  };
}

function getStateTemplate(id: string): State {
  const st = protocolData.states[id];
  if (!st) throw new Error(`Estado inválido: ${id}`);
  return st;
}

function consumeEffects(): EngineEffect[] {
  const e = session.pendingEffects;
  session.pendingEffects = [];
  return e;
}

function getCurrentState(): ProtocolState {
  return { ...getStateTemplate(session.currentStateId) } as ProtocolState;
}

function getCurrentStateId(): string {
  return session.currentStateId;
}

function transitionTo(nextId: string) {
  session.previousStateIds.push(session.currentStateId);
  session.currentStateId = nextId;
  session.history.push({ timestamp: Date.now(), type: "STATE_CHANGED", data: { to: nextId } });
  persistSessionDraft();
}

function next(): ProtocolState {
  const st = getCurrentState();
  if (st.type === "end") return st;
  if (st.type === "action" && session.currentStateId === "ajustes") {
    const tpl = getStateTemplate("ajustes");
    if (tpl.next) transitionTo(tpl.next);
    return getCurrentState();
  }
  throw new Error("Transição inválida");
}

function canGoBack(): boolean {
  return session.previousStateIds.length > 0;
}

function goBack(): ProtocolState {
  const p = session.previousStateIds.pop();
  if (!p) throw new Error("Sem etapa anterior");
  session.currentStateId = p;
  persistSessionDraft();
  return getCurrentState();
}

function resetSession(): ProtocolState {
  clearVentilationDraft();
  session = createSession();
  return getCurrentState();
}

function tick(): ProtocolState {
  return getCurrentState();
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

function getClinicalLog(): ClinicalLogEntry[] {
  return session.history.map((ev) => {
    if (ev.type === "PROTOCOL_STARTED") {
      return {
        timestamp: ev.timestamp,
        kind: "action_executed",
        title: "VM — orientação iniciada",
      };
    }

    if (ev.type === "PROTOCOL_RESTORED") {
      return {
        timestamp: ev.timestamp,
        kind: "action_executed",
        title: "Caso restaurado",
        details: "O último caso salvo automaticamente foi reaberto neste módulo.",
      };
    }

    if (ev.type === "VENT_SETUP_APPLIED") {
      return {
        timestamp: ev.timestamp,
        kind: "action_executed",
        title: "Setup inicial aplicado",
        details: `Modo ${ev.data?.mode ?? "—"} · Vt ${ev.data?.vt ?? "—"} mL · FR ${ev.data?.rr ?? "—"} · PEEP ${ev.data?.peep ?? "—"} · FiO₂ ${ev.data?.fio2 ?? "—"}`,
      };
    }

    if (ev.type === "GASOMETRY_RECORDED") {
      return {
        timestamp: ev.timestamp,
        kind: "action_executed",
        title: "Gasometria registrada",
        details: `${ev.data?.summary ?? "—"} · ${ev.data?.diagnosis ?? "—"} · ${ev.data?.adjustment ?? "—"}`,
      };
    }

    return {
      timestamp: ev.timestamp,
      kind: "action_executed",
      title: "Evento",
      details: ev.data ? JSON.stringify(ev.data) : undefined,
    };
  });
}

function buildFields(a: Assessment): AuxiliaryPanel["fields"] {
  const modeUi = getVentFieldPresentation(a);

  return [
    {
      id: "caseLabel",
      label: "Identificação do caso / paciente",
      value: a.caseLabel,
      fullWidth: true,
      section: "Paciente e cenário",
      placeholder: "Ex.: Leito 3 — João, 67a",
      presets: [
        { label: "Leito 1", value: "Leito 1" },
        { label: "Leito 2", value: "Leito 2" },
        { label: "Leito 3", value: "Leito 3" },
        { label: "Sala vermelha", value: "Sala vermelha" },
      ],
    },
    {
      id: "age",
      label: "Idade (anos)",
      value: a.age,
      keyboardType: "numeric",
      section: "Paciente e cenário",
      presets: [
        { label: "18", value: "18" },
        { label: "20", value: "20" },
        { label: "25", value: "25" },
        { label: "30", value: "30" },
        { label: "35", value: "35" },
        { label: "40", value: "40" },
        { label: "45", value: "45" },
        { label: "50", value: "50" },
        { label: "55", value: "55" },
        { label: "60", value: "60" },
        { label: "65", value: "65" },
        { label: "70", value: "70" },
        { label: "75", value: "75" },
        { label: "80", value: "80" },
      ],
    },
    {
      id: "sex",
      label: "Sexo (para peso predito)",
      value: a.sex,
      section: "Paciente e cenário",
      presets: [
        { label: "Masculino", value: "Masculino" },
        { label: "Feminino", value: "Feminino" },
      ],
    },
    {
      id: "heightCm",
      label: "Altura (cm)",
      value: a.heightCm,
      keyboardType: "numeric",
      section: "Paciente e cenário",
      placeholder: "ex.: 170",
      presets: [
        { label: "150", value: "150" },
        { label: "160", value: "160" },
        { label: "170", value: "170" },
        { label: "180", value: "180" },
      ],
    },
    {
      id: "weightKg",
      label: "Peso real (kg)",
      value: a.weightKg,
      keyboardType: "numeric",
      section: "Paciente e cenário",
      presets: [
        { label: "50", value: "50" },
        { label: "70", value: "70" },
        { label: "90", value: "90" },
        { label: "110", value: "110" },
      ],
    },
    {
      id: "clinicalScenario",
      label: "Cenário clínico principal",
      value: a.clinicalScenario,
      section: "Paciente e cenário",
      presets: [
        { label: "ARDS / SDRA confirmado ou muito provável", value: "ARDS / SDRA confirmado ou muito provável" },
        { label: "Pneumonia grave / hipoxemia difusa / sepse pulmonar sem SDRA confirmado", value: "Pneumonia grave / hipoxemia difusa / sepse pulmonar sem SDRA confirmado" },
        { label: "DPOC exacerbado / retenção de CO₂ / obstrutivo", value: "DPOC exacerbado / retenção de CO₂ / obstrutivo" },
        { label: "Asma grave / broncoespasmo / aprisionamento aéreo", value: "Asma grave / broncoespasmo / aprisionamento aéreo" },
        { label: "Edema agudo pulmonar cardiogênico", value: "Edema agudo pulmonar cardiogênico" },
        { label: "Pós-operatório / atelectasia / pulmão sem lesão aguda importante", value: "Pós-operatório / atelectasia / pulmão sem lesão aguda importante" },
        { label: "Neurocrítico / TCE / AVC / alvo de CO₂ mais controlado", value: "Neurocrítico / TCE / AVC / alvo de CO₂ mais controlado" },
        { label: "Acidose metabólica grave (sepse, CAD, choque)", value: "Acidose metabólica grave (sepse, CAD, choque)" },
        { label: "Obesidade importante / baixa complacência de parede / atelectasia", value: "Obesidade importante / baixa complacência de parede / atelectasia" },
        { label: "Fraqueza neuromuscular (miastenia, Guillain-Barré, fadiga muscular)", value: "Fraqueza neuromuscular (miastenia, Guillain-Barré, fadiga muscular)" },
        { label: "Outro / indeterminado", value: "Outro / indeterminado" },
      ],
    },
    {
      id: "hemodynamics",
      label: "Hemodinâmica",
      value: a.hemodynamics,
      section: "Paciente e cenário",
      presets: [
        { label: "Estável, sem vasopressor e sem sinais de choque", value: "Estável, sem vasopressor e sem sinais de choque" },
        { label: "Hipotensão leve / em reposição volêmica / ainda responsivo", value: "Hipotensão leve / em reposição volêmica / ainda responsivo" },
        { label: "Choque / hipotensão importante / perfusão ruim", value: "Choque / hipotensão importante / perfusão ruim" },
        { label: "Em vasopressor, mas ainda instável", value: "Em vasopressor, mas ainda instável" },
        { label: "Em vasopressor, agora com perfusão mais estável", value: "Em vasopressor, agora com perfusão mais estável" },
        { label: "Baixo débito / falência cardiogênica / risco de piorar com PEEP", value: "Baixo débito / falência cardiogênica / risco de piorar com PEEP" },
      ],
    },

    {
      id: "ventMode",
      label: "Modo no ventilador",
      value: a.ventMode,
      section: "Ventilador — ajustes atuais",
      ...suggestForField("ventMode", a),
      placeholder: suggestForField("ventMode", a).suggestedValue || "Selecionar",
      presets: [
        { label: "VC-AC / assisto-controlado a volume (mais usado no início)", value: "VC-AC" },
        { label: "PC-AC / assisto-controlado a pressão", value: "PC-AC" },
        { label: "PRVC / VC+ / volume garantido com limite de pressão", value: "PRVC / VC+" },
        { label: "PSV / pressão de suporte (desmame ou suporte parcial)", value: "PS" },
        { label: "CPAP / espontâneo com pressão contínua", value: "CPAP" },
        { label: "SIMV / parcialmente mandatória", value: "SIMV" },
        { label: "Ainda em VMNI / antes da intubação", value: "Não invasivo ainda" },
      ],
    },
    {
      id: "setVtMl",
      label: modeUi.vtLabel,
      value: a.setVtMl,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
      ...suggestForField("setVtMl", a),
      placeholder: suggestForField("setVtMl", a).suggestedValue || "Selecionar",
      presets: [
        { label: "300", value: "300" },
        { label: "350", value: "350" },
        { label: "420", value: "420" },
        { label: "500", value: "500" },
      ],
    },
    {
      id: "setRr",
      label: modeUi.rrLabel,
      value: a.setRr,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
      ...suggestForField("setRr", a),
      placeholder: suggestForField("setRr", a).suggestedValue || "Selecionar",
      presets: [
        { label: "10 (expiração longa / obstrutivo)", value: "10" },
        { label: "12 (baixa)", value: "12" },
        { label: "16 (intermediária)", value: "16" },
        { label: "20 (alta)", value: "20" },
        { label: "24 (muito alta)", value: "24" },
        { label: "28 (acidose metabólica / caso selecionado)", value: "28" },
      ],
    },
    {
      id: "setPeep",
      label: modeUi.peepLabel,
      value: a.setPeep,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
      ...suggestForField("setPeep", a),
      placeholder: suggestForField("setPeep", a).suggestedValue || "Selecionar",
      presets: [
        { label: "5 (básica)", value: "5" },
        { label: "8 (moderada)", value: "8" },
        { label: "10 (oxigenação mais difícil)", value: "10" },
        { label: "12 (hipoxemia importante)", value: "12" },
        { label: "15 (alta / caso selecionado)", value: "15" },
      ],
    },
    {
      id: "setFio2",
      label: "FiO₂ programada",
      value: a.setFio2,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
      ...suggestForField("setFio2", a),
      placeholder: suggestForField("setFio2", a).suggestedValue || "0,21 a 1,0",
      presets: [
        { label: "0,21 (ar ambiente)", value: "0,21" },
        { label: "0,40 (suporte leve)", value: "0,4" },
        { label: "0,50 (suporte moderado)", value: "0,5" },
        { label: "0,60 (hipoxemia relevante)", value: "0,6" },
        { label: "0,80 (hipoxemia importante)", value: "0,8" },
        { label: "1,00 (grave / início do ajuste)", value: "1,0" },
      ],
    },
    {
      id: "setInspiratoryFlow",
      label: modeUi.flowLabel,
      value: a.setInspiratoryFlow,
      fullWidth: true,
      section: "Ventilador — ajustes atuais",
      ...suggestForField("setInspiratoryFlow", a),
      placeholder: suggestForField("setInspiratoryFlow", a).suggestedValue || modeUi.flowPlaceholder,
      presets: modeUi.flowPresets,
    },

    {
      id: "ph",
      label: "pH",
      value: a.ph,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "7,15 (acidemia grave)", value: "7,15" },
        { label: "7,25 (acidemia moderada)", value: "7,25" },
        { label: "7,35 (limite inferior)", value: "7,35" },
        { label: "7,45 (limite superior)", value: "7,45" },
        { label: "7,55 (alcalemia importante)", value: "7,55" },
      ],
    },
    {
      id: "paco2",
      label: "PaCO₂ (mmHg)",
      value: a.paco2,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "25 (muito baixo)", value: "25" },
        { label: "30 (baixo)", value: "30" },
        { label: "40 (alvo usual)", value: "40" },
        { label: "50 (hipercapnia leve/moderada)", value: "50" },
        { label: "60 (hipercapnia importante)", value: "60" },
        { label: "70 (hipercapnia grave)", value: "70" },
      ],
    },
    {
      id: "pao2",
      label: "PaO₂ (mmHg)",
      value: a.pao2,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "55 (hipoxemia importante)", value: "55" },
        { label: "70 (hipoxemia moderada)", value: "70" },
        { label: "90 (faixa aceitável em muitos casos)", value: "90" },
        { label: "120 (oxigenação alta)", value: "120" },
      ],
    },
    {
      id: "hco3",
      label: "HCO₃⁻ (mEq/L)",
      value: a.hco3,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "12 (muito baixo)", value: "12" },
        { label: "18 (baixo)", value: "18" },
        { label: "22 (quase baixo)", value: "22" },
        { label: "24 (normal)", value: "24" },
        { label: "28 (alto)", value: "28" },
        { label: "32 (alto / compensação possível)", value: "32" },
      ],
    },
    {
      id: "baseExcess",
      label: "BE / excesso de base",
      value: a.baseExcess,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "-10 (acidose metabólica importante)", value: "-10" },
        { label: "-5 (acidose metabólica leve/moderada)", value: "-5" },
        { label: "0 (próximo do normal)", value: "0" },
        { label: "+5 (alcalose metabólica / compensação)", value: "+5" },
        { label: "+10 (alcalose metabólica importante)", value: "+10" },
      ],
    },
    {
      id: "spo2",
      label: "SpO₂ (%)",
      value: a.spo2,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "88", value: "88" },
        { label: "92", value: "92" },
        { label: "95", value: "95" },
        { label: "98", value: "98" },
      ],
    },
    {
      id: "plateauPressure",
      label: "Pressão de platô (Pplat, cmH₂O)",
      value: a.plateauPressure,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      presets: [
        { label: "20 (confortável)", value: "20" },
        { label: "25 (aceitável)", value: "25" },
        { label: "30 (limite protetor usual)", value: "30" },
        { label: "35 (alta / atenção)", value: "35" },
      ],
    },

    {
      id: "freeNotes",
      label: "Plano orientado pelo sistema / conduta final",
      value: a.freeNotes,
      fullWidth: true,
      section: "Anotações",
      placeholder: "Registrar a conduta final orientada pelo sistema ou ajustes decididos pela equipe",
      presets: buildPlanNotePresets(a),
    },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "ajustes") return null;
  const a = session.assessment;
  const plan = buildVentSetupPlan(a);
  return {
    title: "Ventilação mecânica",
    description: plan.isReady
      ? `O módulo calculou os parâmetros recomendados para este momento: ${plan.summary}`
      : "Preencha sexo, altura e cenário clínico para o módulo montar um setup inicial completo.",
    fields: buildFields(a),
    metrics: buildMetrics(a),
    actions: [
      ...(plan.isReady
        ? [{ id: "apply_initial_vent_setup", label: "Aplicar setup inicial recomendado" }]
        : []),
      { id: "record_gasometry_snapshot", label: "Registrar gasometria para ajuste ventilatório se necessário" },
    ],
    recommendations: buildRecommendations(a),
  };
}

function updateAuxiliaryField(fieldId: string, value: string): AuxiliaryPanel | null {
  const key = fieldId as keyof Assessment;
  if (key in session.assessment) session.assessment[key] = value as never;

  // Quando o cenário clínico muda, recalcular e aplicar automaticamente
  // os parâmetros do ventilador para refletir a nova estratégia.
  if (fieldId === "clinicalScenario" && value.trim()) {
    const plan = buildVentSetupPlan(session.assessment);
    if (plan.isReady) {
      session.assessment.ventMode = plan.mode;
      session.assessment.setVtMl = plan.vtMl;
      session.assessment.setRr = plan.rr;
      session.assessment.setPeep = plan.peep;
      session.assessment.setFio2 = plan.fio2;
      session.assessment.setInspiratoryFlow = plan.inspiratoryFlow;
      session.history.push({
        timestamp: Date.now(),
        type: "VENT_SETUP_RECALCULATED",
        data: { trigger: fieldId, mode: plan.mode, vt: plan.vtMl, rr: plan.rr, peep: plan.peep, fio2: plan.fio2 },
      });
    }
  }

  if (["ventMode", "setVtMl", "setRr", "setPeep", "setFio2", "setInspiratoryFlow"].includes(fieldId)) {
    session.history.push({
      timestamp: Date.now(),
      type: "VENT_SETTING_UPDATED",
      data: { field: fieldId, value },
    });
  }

  persistSessionDraft();
  return getAuxiliaryPanel();
}

function applyAuxiliaryPreset(fieldId: string, value: string): AuxiliaryPanel | null {
  return updateAuxiliaryField(fieldId, value);
}

function runAuxiliaryAction(actionId: string): ClinicalLogEntry[] {
  if (actionId === "apply_initial_vent_setup") {
    const plan = buildVentSetupPlan(session.assessment);
    if (!plan.isReady) {
      throw new Error("Preencha sexo, altura e cenário clínico antes de aplicar o setup inicial.");
    }

    session.assessment.ventMode = plan.mode;
    session.assessment.setVtMl = plan.vtMl;
    session.assessment.setRr = plan.rr;
    session.assessment.setPeep = plan.peep;
    session.assessment.setFio2 = plan.fio2;
    session.assessment.setInspiratoryFlow = plan.inspiratoryFlow;
    session.history.push({
      timestamp: Date.now(),
      type: "VENT_SETUP_APPLIED",
      data: {
        mode: plan.mode,
        vt: plan.vtMl,
        rr: plan.rr,
        peep: plan.peep,
        fio2: plan.fio2,
        flow: plan.inspiratoryFlow,
      },
    });
    persistSessionDraft();
  }

  if (actionId === "record_gasometry_snapshot") {
    const diagnosis = diagnoseGasometry(session.assessment);
    const adjustmentHint = buildVentilationAdjustmentHint(session.assessment);
    const summary = [
      `pH ${session.assessment.ph || "—"}`,
      `PaCO₂ ${session.assessment.paco2 || "—"}`,
      `PaO₂ ${session.assessment.pao2 || "—"}`,
      `HCO₃ ${session.assessment.hco3 || "—"}`,
      `BE ${session.assessment.baseExcess || "—"}`,
      `SpO₂ ${session.assessment.spo2 || "—"}`,
      (() => {
        const pao2 = parseNum(session.assessment.pao2);
        const fio2 = parseFio2(session.assessment.setFio2);
        if (pao2 != null && fio2 != null && fio2 > 0) {
          const pfRatio = Math.round(pao2 / fio2);
          return `P/F ${pfRatio} (${classifyPFRatio(pfRatio)})`;
        }
        return null;
      })(),
    ].filter(Boolean).join(" · ");

    session.gasometryHistory.unshift({
      timestamp: Date.now(),
      summary,
      diagnosis: diagnosis?.label ?? "Gasometria parcial",
      adjustment: adjustmentHint?.lines[0] ?? "Sem recomendação de ajuste ventilatório com base na gasometria atual",
    });
    session.gasometryHistory = session.gasometryHistory.slice(0, 12);
    session.history.push({
      timestamp: Date.now(),
      type: "GASOMETRY_RECORDED",
      data: {
        summary,
        diagnosis: diagnosis?.label ?? "Gasometria parcial",
        adjustment: adjustmentHint?.lines[0] ?? "Sem recomendação de ajuste ventilatório com base na gasometria atual",
      },
    });
    persistSessionDraft();
  }

  if (actionId === "start_new_vent_case") {
    clearVentilationDraft();
    session = createSession();
  }

  return getClinicalLog();
}

function updateAuxiliaryUnit(): AuxiliaryPanel | null {
  return getAuxiliaryPanel();
}

function updateAuxiliaryStatus(): AuxiliaryPanel | null {
  return getAuxiliaryPanel();
}

function formatElapsed(now: number) {
  const s = Math.max(0, Math.floor((now - session.protocolStartedAt) / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function getEncounterSummary(): EncounterSummary {
  const a = session.assessment;
  const pbw = parseNum(a.heightCm) != null ? predictedBodyWeightKg(a.sex, parseNum(a.heightCm)!) : null;
  return {
    protocolId: session.protocolId,
    durationLabel: formatElapsed(Date.now()),
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
    metrics: [
      { label: "Caso", value: a.caseLabel || "Sem identificação" },
      { label: "Cenário", value: a.clinicalScenario || "—" },
      { label: "PBW", value: pbw != null ? `${pbw} kg` : "—" },
      { label: "Vt (set)", value: a.setVtMl || "—" },
    ],
  };
}

function getEncounterSummaryText(): string {
  const a = session.assessment;
  const pbw = parseNum(a.heightCm) != null ? predictedBodyWeightKg(a.sex, parseNum(a.heightCm)!) : null;
  const plan = buildVentSetupPlan(a);
  return [
    "Ventilação mecânica — resumo",
    `Caso: ${a.caseLabel || "Sem identificação"}`,
    `Cenário: ${a.clinicalScenario || "—"}`,
    `PBW: ${pbw != null ? `${pbw} kg` : "—"}  Peso: ${a.weightKg || "—"} kg`,
    `Modo: ${a.ventMode || "—"}  Vt: ${a.setVtMl || "—"}  FR: ${a.setRr || "—"}  PEEP: ${a.setPeep || "—"}  FiO₂: ${a.setFio2 || "—"}`,
    `Setup recomendado: ${plan.isReady ? plan.summary : "preencher sexo, altura e cenário para calcular"}`,
    `pH ${a.ph || "—"}  PaCO₂ ${a.paco2 || "—"}  PaO₂ ${a.pao2 || "—"}  HCO₃ ${a.hco3 || "—"}  BE ${a.baseExcess || "—"}  SpO₂ ${a.spo2 || "—"}  Pplat ${a.plateauPressure || "—"}`,
    `Notas: ${a.freeNotes || "—"}`,
  ].join("\n");
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getEncounterReportHtml(): string {
  const body = escapeHtml(getEncounterSummaryText()).replace(/\n/g, "<br/>");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>VM</title></head><body><pre style="font-family:system-ui">${body}</pre></body></html>`;
}

export {
  applyAuxiliaryPreset,
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
  goBack,
  canGoBack,
  next,
  registerExecution,
  resetSession,
  runAuxiliaryAction,
  tick,
  updateAuxiliaryField,
  updateAuxiliaryStatus,
  updateAuxiliaryUnit,
  updateReversibleCauseStatus,
};

export type { ClinicalEngine } from "./clinical-engine";
