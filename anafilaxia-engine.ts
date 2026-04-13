/**
 * Anafilaxia e choque anafilático — documentação e orientação (adrenalina IM, adjuvantes, observação).
 * Referência: prática alinhada a WAO/AAAAI; ajustar ao protocolo institucional.
 */

import raw from "./protocols/anafilaxia.json";
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

type Assessment = {
  age: string;
  sex: string;
  weightKg: string;
  exposureType: string;
  exposureDetail: string;
  timeOnsetMin: string;
  symptoms: string;
  heartRate: string;
  systolicPressure: string;
  diastolicPressure: string;
  spo2: string;
  gcs: string;
  treatmentAdrenaline: string;
  treatmentFluids: string;
  treatmentSalbutamol: string;
  treatmentH1: string;
  treatmentCorticoid: string;
  treatmentO2: string;
  treatmentIvAccess: string;
  treatmentMonitoring: string;
  treatmentHelp: string;
  treatmentPosition: string;
  treatmentAirway: string;
  clinicalResponse: string;
  observationPlan: string;
  destination: string;
  investigationPlan: string;
  dischargePlan: string;
  freeNotes: string;
};

type Session = {
  protocolId: string;
  currentStateId: string;
  previousStateIds: string[];
  history: Event[];
  pendingEffects: EngineEffect[];
  protocolStartedAt: number;
  assessment: Assessment;
};

const protocolData = raw as Protocol;

function toggleTokenValue(current: string, token: string): string {
  const parts = current
    .split(" | ")
    .map((t) => t.trim())
    .filter(Boolean);
  const lc = token.trim().toLowerCase();
  const exists = parts.some((t) => t.toLowerCase() === lc);
  return (exists ? parts.filter((t) => t.toLowerCase() !== lc) : [...parts, token.trim()]).join(" | ");
}

function parseNum(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatMap(sbp: number, dbp: number): string {
  return ((2 * dbp + sbp) / 3).toFixed(0).replace(".", ",");
}

/** Dose de adrenalina IM (mg) 0,01 mg/kg, máx. 0,5 mg/dose (referência comum). */
function suggestedAdrenalineImMg(weightKg: number): number {
  const d = 0.01 * weightKg;
  return Math.round(Math.min(d, 0.5) * 100) / 100;
}

function hasShock(a: Assessment): boolean {
  const sbp = parseNum(a.systolicPressure);
  if (sbp != null && sbp < 90) return true;
  if (sbp != null && parseNum(a.diastolicPressure) != null) {
    const map = (2 * parseNum(a.diastolicPressure)! + sbp!) / 3;
    if (map < 65) return true;
  }
  return a.symptoms.toLowerCase().includes("choque") || a.symptoms.toLowerCase().includes("hipotens");
}

function hasTwoImDosesRecorded(a: Assessment): boolean {
  const t = a.treatmentAdrenaline.toLowerCase();
  return (
    t.includes("2 doses") ||
    t.includes("segunda dose") ||
    t.includes("repetida") ||
    t.includes("repetir") ||
    t.includes("2ª dose")
  );
}

function isLikelyDrugInducedAvoidable(a: Assessment): boolean {
  return a.exposureType.toLowerCase().includes("medicamento");
}

function isUnknownOrIdiopathicTrigger(a: Assessment): boolean {
  const exposure = a.exposureType.toLowerCase();
  return exposure.includes("desconhecido") || exposure.includes("idiop");
}

function hasAirwaySevere(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("estridor") ||
    s.includes("edema de glote") ||
    s.includes("via aérea") ||
    s.includes("dispneia grave")
  );
}

function hasBronchospasm(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return s.includes("sibilos") || s.includes("broncoesp") || s.includes("dispneia");
}

function hasCyanosis(a: Assessment): boolean {
  return a.symptoms.toLowerCase().includes("cianose");
}

function hasRespiratoryFailure(a: Assessment): boolean {
  const spo2 = parseNum(a.spo2);
  if (spo2 != null && spo2 < 92) {
    return true;
  }
  return hasAirwaySevere(a) || hasBronchospasm(a) || hasCyanosis(a);
}

function hasComaOrSevereNeuro(a: Assessment): boolean {
  const gcs = parseNum(a.gcs);
  if (gcs != null && gcs <= 8) {
    return true;
  }
  return a.symptoms.toLowerCase().includes("coma");
}

function needsAdvancedAirwayDecision(a: Assessment): boolean {
  const spo2 = parseNum(a.spo2);
  const gcs = parseNum(a.gcs);
  const airwayPlan = a.treatmentAirway.toLowerCase();
  return (
    (gcs != null && gcs <= 8) ||
    (spo2 != null && spo2 < 90) ||
    (hasAirwaySevere(a) && hasRespiratoryFailure(a)) ||
    airwayPlan.includes("preparar sequência rápida") ||
    airwayPlan.includes("intubação orotraqueal recomendada")
  );
}

function isClinicalAssessmentComplete(a: Assessment): boolean {
  return Boolean(
    a.weightKg.trim() &&
      a.symptoms.trim() &&
      a.systolicPressure.trim() &&
      a.diastolicPressure.trim() &&
      a.spo2.trim() &&
      a.gcs.trim()
  );
}

function getSeverityFlags(a: Assessment) {
  return {
    examComplete: isClinicalAssessmentComplete(a),
    shock: hasShock(a),
    airway: hasAirwaySevere(a),
    respiratoryFailure: hasRespiratoryFailure(a),
    coma: hasComaOrSevereNeuro(a),
    cyanosis: hasCyanosis(a),
    bronchospasm: hasBronchospasm(a),
  };
}

// ─── Diagnostic classification ────────────────────────────────────────────────

type DiagnosticGrade = 0 | 1 | 2 | 3 | 4;

interface DiagnosticResult {
  grade: DiagnosticGrade;
  label: string;
  sublabel: string;
  criteriaText: string;
  tone: "info" | "warning" | "danger";
  adrenalineIndicated: boolean;
  /** "immediate" = administer now, "watch" = not now but have ready, "pending" = insufficient data */
  adrenalineUrgency: "immediate" | "watch" | "pending";
  adrenalineRationale: string;
  observationMinHours: number;
}

function hasSkinOrMucosaSymptoms(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("urticária") ||
    s.includes("angioedema") ||
    s.includes("prurido") ||
    s.includes("eritema") ||
    s.includes("rubor") ||
    s.includes("flushing") ||
    s.includes("pele")
  );
}

function hasGiSymptoms(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("náusea") ||
    s.includes("vómito") ||
    s.includes("dor abdominal") ||
    s.includes("diarreia") ||
    s.includes("cólica")
  );
}

function hasVascularOrNeuroSymptoms(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("síncope") ||
    s.includes("pré-síncope") ||
    s.includes("pulso filiforme") ||
    s.includes("extremidades frias") ||
    s.includes("ansiedade") ||
    s.includes("sensação de morte")
  );
}

function countWaoSystems(a: Assessment): { count: number; labels: string[] } {
  const labels: string[] = [];
  if (hasSkinOrMucosaSymptoms(a)) labels.push("pele/mucosa");
  if (hasRespiratoryFailure(a) || hasBronchospasm(a) || hasAirwaySevere(a)) labels.push("respiratório");
  if (hasShock(a) || hasVascularOrNeuroSymptoms(a) || hasComaOrSevereNeuro(a)) labels.push("cardiovascular/vascular");
  if (hasGiSymptoms(a)) labels.push("digestivo");
  return { count: labels.length, labels };
}

function buildDiagnosticResult(a: Assessment): DiagnosticResult {
  if (!isClinicalAssessmentComplete(a)) {
    return {
      grade: 0,
      label: "Avaliação incompleta",
      sublabel: "Preencha os parâmetros clínicos para classificação",
      criteriaText:
        "Peso, sintomas, PAS/PAD, SpO₂ e GCS são necessários para classificação diagnóstica e prescrição personalizada.",
      tone: "info",
      adrenalineIndicated: false,
      adrenalineUrgency: "pending",
      adrenalineRationale: "Dados insuficientes para indicação precisa — complete a avaliação clínica.",
      observationMinHours: 0,
    };
  }

  // Grade 4 — Anaphylactic shock / coma
  if (hasShock(a) || hasComaOrSevereNeuro(a)) {
    const hasComa = hasComaOrSevereNeuro(a);
    return {
      grade: 4,
      label: "Choque anafilático",
      sublabel: hasComa
        ? "Instabilidade hemodinâmica + rebaixamento de consciência — risco imediato de PCR"
        : "Instabilidade hemodinâmica grave — ameaça imediata à vida",
      criteriaText: hasComa
        ? "PA sistólica < 90 mmHg e/ou PAM < 65 mmHg com GCS ≤ 8. Risco de parada cardiorrespiratória."
        : "PA sistólica < 90 mmHg e/ou PAM < 65 mmHg e/ou sinais de hipoperfusão (pulso filiforme, extremidades frias, síncope).",
      tone: "danger",
      adrenalineIndicated: true,
      adrenalineUrgency: "immediate",
      adrenalineRationale:
        "Adrenalina IM IMEDIATA. Após 2 doses IM sem resposta + volume adequado: iniciar infusão EV 0,05–0,1 mcg/kg/min em monitorização contínua.",
      observationMinHours: 12,
    };
  }

  // Grade 3 — Severe anaphylaxis (airway compromise or SpO₂ < 92%)
  if (hasAirwaySevere(a) || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 92) || hasCyanosis(a)) {
    return {
      grade: 3,
      label: "Anafilaxia grave",
      sublabel: "Via aérea comprometida e/ou insuficiência respiratória grave",
      criteriaText:
        "Estridor, edema de glote, SpO₂ < 92% ou cianose — comprometimento grave de via aérea ou insuficiência respiratória com risco iminente.",
      tone: "danger",
      adrenalineIndicated: true,
      adrenalineUrgency: "immediate",
      adrenalineRationale:
        "Adrenalina IM imediata e urgente. Preparar via aérea avançada e acionar ajuda especializada agora — o edema laríngeo pode progredir em minutos.",
      observationMinHours: 12,
    };
  }

  // Check WAO anaphylaxis criteria for Grade 2
  const hasSkin = hasSkinOrMucosaSymptoms(a);
  const hasRespiratory = hasRespiratoryFailure(a) || hasBronchospasm(a);
  const hasVascular = hasVascularOrNeuroSymptoms(a);
  const hasGi = hasGiSymptoms(a);
  const hasKnownAllergen = a.exposureType.trim().length > 0;
  const { count: systemCount, labels: systemLabels } = countWaoSystems(a);

  // WAO criterion 1: skin/mucosa + respiratory or cardiovascular
  const meetsCriteria1 = hasSkin && (hasRespiratory || hasVascular);
  // WAO criterion 2: ≥ 2 systems after allergen exposure
  const meetsCriteria2 = hasKnownAllergen && systemCount >= 2;

  if (meetsCriteria1 || meetsCriteria2) {
    const criteriaUsed = meetsCriteria1
      ? "Critério 1 WAO: sintomas cutâneos/mucosos + comprometimento respiratório e/ou cardiovascular — início agudo."
      : `Critério 2 WAO: ${systemCount} sistemas acometidos após exposição ao gatilho (${systemLabels.join(", ")}).`;
    return {
      grade: 2,
      label: "Anafilaxia moderada",
      sublabel: "Critérios WAO preenchidos — sem choque nem comprometimento grave de via aérea",
      criteriaText: criteriaUsed,
      tone: "danger",
      adrenalineIndicated: true,
      adrenalineUrgency: "immediate",
      adrenalineRationale:
        "Adrenalina IM indicada agora — é primeira linha em TODA anafilaxia, inclusive apresentações moderadas. Reações moderadas podem progredir rapidamente para choque ou parada respiratória.",
      observationMinHours: 6,
    };
  }

  // Grade 1 — Isolated allergic reaction (skin/mucosa or GI only, no systemic)
  if (hasSkin || hasGi) {
    return {
      grade: 1,
      label: "Reação alérgica isolada",
      sublabel: "Sintomas limitados a pele/mucosa ou TGI — critérios WAO de anafilaxia não preenchidos",
      criteriaText: `Manifestações restritas a ${[hasSkin && "pele/mucosa", hasGi && "TGI"].filter(Boolean).join(" e ")} sem envolvimento de via aérea, circulação ou outro sistema. Não preenche critérios WAO de anafilaxia no momento.`,
      tone: "warning",
      adrenalineIndicated: false,
      adrenalineUrgency: "watch",
      adrenalineRationale:
        "Anti-H1 pode ser suficiente em reação cutânea/GI isolada sem critérios de anafilaxia. Manter em observação com adrenalina DISPONÍVEL — progressão pode ocorrer a qualquer momento. Administrar adrenalina IM IMEDIATAMENTE se surgir qualquer envolvimento sistêmico (via aérea, hemodinâmico ou neurológico).",
      observationMinHours: 2,
    };
  }

  // Fallback: symptoms present but unclear
  if (a.symptoms.trim().length > 0) {
    return {
      grade: 2,
      label: "Anafilaxia provável",
      sublabel: "Sintomas sistêmicos presentes — tratar como anafilaxia até exclusão",
      criteriaText:
        "Apresentação compatível com anafilaxia. Em caso de dúvida diagnóstica, tratar como anafilaxia é a conduta mais segura — o risco de não tratar supera o da adrenalina em dose adequada.",
      tone: "danger",
      adrenalineIndicated: true,
      adrenalineUrgency: "immediate",
      adrenalineRationale:
        "Adrenalina IM indicada — perante dúvida, tratar como anafilaxia é a conduta mais segura.",
      observationMinHours: 6,
    };
  }

  return {
    grade: 0,
    label: "Sem sintomas registrados",
    sublabel: "Registe as manifestações clínicas para classificação",
    criteriaText: "Sem manifestações documentadas. Complete a avaliação clínica.",
    tone: "info",
    adrenalineIndicated: false,
    adrenalineUrgency: "pending",
    adrenalineRationale: "Registe os sintomas para determinar indicação de adrenalina.",
    observationMinHours: 0,
  };
}

function withSuggestedFirst(
  items: { label: string; value: string }[],
  suggestedValue?: string
): { label: string; value: string }[] {
  if (!suggestedValue) {
    return items;
  }

  const exact = items.find((item) => item.value === suggestedValue);
  if (exact) {
    return [exact, ...items.filter((item) => item.value !== suggestedValue)];
  }

  return [{ label: suggestedValue, value: suggestedValue }, ...items];
}

function buildTreatmentSuggestions(a: Assessment) {
  const w = parseNum(a.weightKg);
  const spo2 = parseNum(a.spo2);
  const adrDose =
    w != null && w > 0 ? `${suggestedAdrenalineImMg(w)} mg IM` : "0,5 mg IM";
  const flags = getSeverityFlags(a);
  const diagResult = buildDiagnosticResult(a);

  const adrenalineSuggestion =
    diagResult.grade === 1
      ? "Não indicada no momento — reação cutânea/GI isolada sem critérios de anafilaxia. Ter disponível; administrar imediatamente se envolvimento sistêmico"
      : diagResult.grade === 0
        ? `${adrDose} — preencha avaliação para dose precisa`
        : flags.shock || flags.airway || flags.respiratoryFailure
          ? `${adrDose} AGORA; repetir em 5 min se problemas ABC persistirem`
          : `${adrDose} na coxa agora; repetir em 5 min se progressão`;
  const helpSuggestion =
    flags.shock || flags.airway || flags.respiratoryFailure || flags.coma
      ? "Acionar ajuda avançada / sala de emergência agora"
      : "Acionar apoio da equipa e manter reavaliação seriada";
  const positionSuggestion = flags.shock
    ? "Supino com membros inferiores elevados; evitar ortostatismo"
    : flags.respiratoryFailure || flags.airway
      ? "Semi-reclinado se facilitar ventilação, evitando colocar o paciente em pé"
      : "Preferir decúbito e evitar mudança brusca de postura";

  const ivAccessSuggestion = flags.shock
    ? "Dois acessos periféricos calibrosos"
    : "Acesso periférico";
  const monitoringSuggestion =
    flags.shock || flags.respiratoryFailure || flags.airway || flags.coma
      ? "Monitorização contínua: ECG, SpO₂, PA não invasiva seriada e FR"
      : "Monitorização mínima: oximetria de pulso, PA seriada e frequência cardíaca";

  const fluidVolume = w != null && w > 0 ? `${Math.round(w * 20)} mL` : "500–1000 mL";
  const fluidSuggestion = flags.shock
    ? `Ringer lactato ou SF 0,9% ${fluidVolume} em bolus; reavaliar PA e perfusão`
    : "Sem bolus de rotina; hidratação conforme resposta clínica";

  const oxygenSuggestion =
    flags.airway || flags.respiratoryFailure || flags.shock || (spo2 != null && spo2 < 94)
      ? "Máscara com reservatório 10–15 L/min; titular para SpO₂ 94–98%"
      : spo2 != null && spo2 < 98
        ? "Cateter nasal 2–5 L/min; titular para SpO₂ 94–98%"
        : "Oxigênio se necessário; alvo SpO₂ 94–98%";

  const salbutamolSuggestion = flags.bronchospasm
    ? "Salbutamol nebulizado 5 mg"
    : "Não indicado no momento";

  const h1Suggestion =
    diagResult.grade === 1
      ? "Anti-H1 de primeira linha: cetirizina 10 mg VO ou loratadina 10 mg VO — adequado para reação cutânea isolada sem anafilaxia"
      : "Não usar na fase inicial em anafilaxia; considerar apenas após estabilização se sintomas cutâneos persistentes";
  const corticoidSuggestion = flags.bronchospasm || flags.respiratoryFailure
    ? "Não de rotina; considerar apenas como adjuvante em broncoespasmo/asma ou reação refratária"
    : "Não indicado de rotina no atendimento inicial";
  const airwaySuggestion =
    flags.coma || flags.airway || (spo2 != null && spo2 < 90)
      ? "Intubação orotraqueal recomendada; preparar sequência rápida e ventilação mecânica"
      : flags.respiratoryFailure
        ? "Via aérea avançada de prontidão; considerar VM se piora ou fadiga"
        : "Sem indicação imediata de intubação";
  const adrenalineIvSuggestion =
    (flags.shock || (flags.respiratoryFailure && flags.airway)) && hasTwoImDosesRecorded(a)
      ? "Refratário após 2 doses de adrenalina IM: considerar adrenalina EV em infusão 0,05–0,1 mcg/kg/min em monitorização contínua"
      : undefined;

  const investigationSuggestion =
    isUnknownOrIdiopathicTrigger(a) || flags.shock
      ? "Colher triptase aguda idealmente até 2 h do início, colher triptase basal depois e encaminhar para alergologia/imunologia"
      : "Colher triptase aguda idealmente até 2 h do início; documentar horário, tratamentos e provável gatilho";
  const observationSuggestion = flags.shock || flags.airway || flags.respiratoryFailure || flags.coma
    ? "Observação por pelo menos 12 h após resolução dos sintomas"
    : hasTwoImDosesRecorded(a)
      ? "Observação por pelo menos 6 h após resolução dos sintomas"
      : "Se resolução completa e baixo risco: considerar 2 h; senão observar por pelo menos 6 h";

  const destinationSuggestion = flags.coma || flags.airway || flags.shock
    ? "UTI / sala de emergência avançada"
    : flags.respiratoryFailure
      ? "Observação prolongada / sala de emergência"
      : "Alta com orientações se estabilidade mantida";
  const dischargeSuggestion = isLikelyDrugInducedAvoidable(a)
    ? "Orientar retorno se recorrência, evitar o fármaco suspeito, documentar alergia e encaminhar para alergologia"
    : "Prescrever 2 autoinjetores, treinar uso, fornecer plano de ação e encaminhar para alergologia";

  return {
    flags,
    diagResult,
    adrenalineSuggestion,
    helpSuggestion,
    positionSuggestion,
    ivAccessSuggestion,
    monitoringSuggestion,
    fluidSuggestion,
    oxygenSuggestion,
    salbutamolSuggestion,
    h1Suggestion,
    corticoidSuggestion,
    airwaySuggestion,
    adrenalineIvSuggestion,
    investigationSuggestion,
    observationSuggestion,
    destinationSuggestion,
    dischargeSuggestion,
  };
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const diagResult = buildDiagnosticResult(a);

  // Diagnostic grade — shown first and most prominently
  const gradePrefix =
    diagResult.grade === 4 ? "🔴 Grau IV" :
    diagResult.grade === 3 ? "🔴 Grau III" :
    diagResult.grade === 2 ? "🟠 Grau II" :
    diagResult.grade === 1 ? "🟡 Grau I" :
    "⚪ —";
  out.push({ label: "Diagnóstico provável", value: `${gradePrefix} · ${diagResult.label}` });

  // Epinephrine status
  const adrStatus =
    diagResult.adrenalineUrgency === "immediate" ? "✅ Indicada — administrar agora" :
    diagResult.adrenalineUrgency === "watch"     ? "⚠️ Não indicada agora — ter disponível" :
    "— Completar avaliação";
  out.push({ label: "Adrenalina IM", value: adrStatus });

  // Dose calculation
  const w = parseNum(a.weightKg);
  if (w != null && w > 0 && w < 300) {
    const mg = suggestedAdrenalineImMg(w);
    out.push({
      label: "Dose calculada (0,01 mg/kg)",
      value: `${mg} mg = ${mg} mL de adrenalina 1:1000`,
    });
  } else {
    out.push({
      label: "Dose IM (adulto sem peso)",
      value: "0,5 mg IM — confirmar peso pediátrico",
    });
  }

  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  if (sbp != null && dbp != null) {
    out.push({ label: "PAM estimada", value: `${formatMap(sbp, dbp)} mmHg` });
  }

  if (diagResult.observationMinHours > 0) {
    out.push({
      label: "Observação mínima recomendada",
      value: `≥ ${diagResult.observationMinHours} h após resolução dos sintomas`,
    });
  }

  if (hasShock(a)) {
    out.push({ label: "⚠️ Circulação", value: "Choque — cristalóide em bolus + adrenalina; 2 acessos" });
  }
  if (hasAirwaySevere(a)) {
    out.push({ label: "⚠️ Via aérea", value: "Risco alto — preparar via aérea definitiva urgente" });
  }

  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
  const w = parseNum(a.weightKg);
  const suggestions = buildTreatmentSuggestions(a);
  const { flags, diagResult } = suggestions;
  const shock = flags.shock;
  const airway = flags.airway;

  // ── Diagnóstico provável — card sempre em primeiro ───────────────────────────
  const gradeTag =
    diagResult.grade === 4 ? "Grau IV" :
    diagResult.grade === 3 ? "Grau III" :
    diagResult.grade === 2 ? "Grau II" :
    diagResult.grade === 1 ? "Grau I" :
    "Avaliação pendente";

  recs.push({
    title: `DIAGNÓSTICO PROVÁVEL — ${gradeTag}: ${diagResult.label}`,
    tone: diagResult.tone,
    lines: [
      diagResult.sublabel,
      diagResult.criteriaText,
      `Adrenalina: ${diagResult.adrenalineRationale}`,
      diagResult.observationMinHours > 0
        ? `Observação mínima recomendada: ≥ ${diagResult.observationMinHours} h após resolução dos sintomas.`
        : "Preencha a avaliação clínica para recomendação personalizada de observação.",
    ],
  });

  if (!flags.examComplete) {
    recs.push({
      title: "⚠ Completar avaliação antes da prescrição detalhada",
      tone: "warning",
      lines: [
        "Preencha peso, manifestações, PAS/PAD, SpO₂ e GCS para o módulo priorizar condutas conforme gravidade real.",
        "Sem esses dados, o diagnóstico pode não detectar choque, insuficiência respiratória ou rebaixamento.",
      ],
    });
  }

  // ── Epinefrina — recomendação específica por grau ────────────────────────────
  if (diagResult.grade === 1) {
    recs.push({
      title: "1 — Adrenalina: NÃO indicada agora (reação isolada sem anafilaxia)",
      tone: "warning",
      lines: [
        "Reação cutânea/GI isolada sem critérios WAO de anafilaxia: anti-H1 de 1ª linha. Adrenalina não é necessária no momento.",
        "Manter adrenalina DISPONÍVEL e o paciente em observação — a apresentação pode evoluir para anafilaxia a qualquer momento.",
        "ADMINISTRAR ADRENALINA IM IMEDIATAMENTE se surgir qualquer sinal sistêmico: estridor, dispneia, sibilos, hipotensão, síncope ou rebaixamento.",
        w != null && w > 0
          ? `Dose de resgate preparada: ${suggestedAdrenalineImMg(w)} mg IM (${suggestedAdrenalineImMg(w)} mL de 1:1000) na face lateral da coxa.`
          : "Dose de resgate em adulto: 0,5 mg IM (0,5 mL de 1:1000) na face lateral da coxa.",
      ],
    });
  } else if (diagResult.grade >= 2) {
    recs.push({
      title: "1 — Adrenalina intramuscular AGORA (primeira e única linha)",
      tone: "danger",
      lines: [
        "Administrar IMEDIATAMENTE na face lateral da coxa (vasto externo) — absorção superior ao deltoide.",
        w != null && w > 0
          ? `Dose por peso: ${suggestedAdrenalineImMg(w)} mg IM (= ${suggestedAdrenalineImMg(w)} mL de adrenalina 1:1000). Repetir em 5 min se problemas ABC persistirem.`
          : "Adulto sem peso conhecido: 0,5 mg IM (0,5 mL de 1:1000). Criança: 0,01 mg/kg.",
        "Não substituir por anti-histamínico ou corticoide — esses medicamentos NÃO tratam os problemas de via aérea, respiração e circulação.",
      ],
    });
  } else {
    recs.push({
      title: "1 — Reconhecimento e adrenalina (critérios WAO)",
      tone: "info",
      lines: [
        "Tratar como anafilaxia quando houver início súbito com problemas de via aérea, respiração e/ou circulação — geralmente com pele/mucosa, mas estas podem faltar.",
        "A decisão de administrar adrenalina não exige preencher formalmente todos os critérios diagnósticos.",
        "Sintomas gastrointestinais isolados, sem problemas ABC, em geral não bastam para definir anafilaxia.",
      ],
    });
  }

  recs.push({
    title: "2 — Posição, oxigénio, acesso venoso",
    tone: "info",
    lines: [
      "Manter em decúbito; se hipotensão, preferir supino com membros inferiores elevados. Se dispneia importante, pode ser necessário semi-reclinar.",
      "Evitar colocar o paciente em pé ou permitir mudança brusca de postura.",
      "Oxigênio em alta concentração e monitorização contínua (ECG, SpO₂, PA, FR).",
      "Acesso venoso periférico calibroso; duas vias se choque.",
      "Chamar ajuda cedo e tratar em área com capacidade para lidar com problemas ABC.",
    ],
  });

  if (shock) {
    recs.push({
      title: "3 — Choque anafilático",
      tone: "danger",
      lines: [
        "Expansão com cristalóide em bolus (adulto: 500–1000 mL rápido; pediatria: 20 mL/kg), com reavaliação seriada da PA e perfusão.",
        "Repetir adrenalina IM em 5 min se persistirem problemas ABC; se refratário após 2 doses adequadas e volume, considerar adrenalina EV em infusão contínua em ambiente monitorizado.",
        "Se hipotensão persistir apesar de adrenalina e volume, tratar como anafilaxia refratária e considerar vasopressor/infusão.",
      ],
    });
  } else {
    recs.push({
      title: "3 — Sem choque evidente",
      tone: "info",
      lines: [
        "Manter observação após adrenalina; sintomas podem recidivar.",
        "Se piora hemodinâmica ou respiratória, tratar como acima e reavaliar continuamente.",
      ],
    });
  }

  if (airway) {
    recs.push({
      title: "4 — Via aérea comprometida",
      tone: "danger",
      lines: [
        "Chamar ajuda para via aérea avançada cedo; edema pode progredir rapidamente.",
        "Se estridor importante, edema progressivo, SpO₂ baixa ou fadiga: preparar sequência de intubação antecipadamente.",
        "Adrenalina nebulizada pode ser adjuvante no edema laríngeo, mas não atrasa adrenalina sistémica quando indicada.",
      ],
    });
  }

  if (flags.respiratoryFailure) {
    recs.push({
      title: "4B — Insuficiência respiratória",
      tone: "danger",
      lines: [
        "Ofertar oxigênio em alto fluxo imediatamente; alvo inicial de SpO₂ ≥ 94% salvo contraindicação específica.",
        "Se broncoespasmo, associar salbutamol nebulizado; se hipoxemia, cianose, rebaixamento ou fadiga: preparar intubação e ventilação mecânica.",
      ],
    });
  }

  if (flags.coma) {
    recs.push({
      title: "4C — Rebaixamento importante / coma",
      tone: "danger",
      lines: [
        "GCS ≤ 8 sugere incapacidade de proteger via aérea. Intubação orotraqueal deve ser considerada precocemente.",
        "Monitorizar continuamente e tratar como quadro grave, mesmo que a PA tenha melhorado temporariamente.",
      ],
    });
  }

  recs.push({
    title: "5 — Terapêutica adjuvante (não substitui adrenalina)",
    tone: "warning",
      lines: [
        "Anti-histamínicos são terceira linha e não tratam problemas ABC; considerar apenas após estabilização, sobretudo se sintomas cutâneos persistirem.",
        "Corticoide não é recomendado de rotina no tratamento inicial; se usado, deve ser apenas adjuvante e nunca atrasar adrenalina nem manejo da via aérea.",
        "Beta-2 inalado (salbutamol) se broncoespasmo importante.",
      ],
    });

  recs.push({
    title: "6 — Investigação, observação e alta",
    tone: "info",
    lines: [
      suggestions.investigationSuggestion,
      "Observação deve ser estratificada: cerca de 2 h apenas em muito baixo risco, 6 h se risco intermédio e pelo menos 12 h se reação grave, respiratória ou com múltiplas doses de adrenalina.",
      "Na alta, orientar sobre recorrência, prescrever autoinjetor quando indicado, treinar uso e encaminhar para alergologia/imunologia.",
    ],
  });

  recs.push({
    title: "7 — Checklist de alta",
    tone: "info",
    lines: [
      "Antes da alta, reavaliar ortostatismo/tontura, confirmar resolução sustentada e definir tempo mínimo de observação adequado ao risco.",
      isLikelyDrugInducedAvoidable(a)
        ? "Reação provavelmente medicamentosa: em geral documentar alergia, orientar evicção do fármaco e encaminhar; autoinjetor pode não ser obrigatório se o gatilho for claramente evitável."
        : "Se não for reação medicamentosa facilmente evitável, prescrever 2 autoinjetores, treinar paciente/família e entregar plano de ação.",
      "Garantir documentação do gatilho provável, horários das doses e encaminhamento para avaliação especializada.",
    ],
  });

  return recs;
}

let session: Session = createSession();

function createSession(): Session {
  return {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    previousStateIds: [],
    history: [{ timestamp: Date.now(), type: "PROTOCOL_STARTED" }],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    assessment: {
      age: "",
      sex: "",
      weightKg: "",
      exposureType: "",
      exposureDetail: "",
      timeOnsetMin: "",
      symptoms: "",
      heartRate: "",
      systolicPressure: "",
      diastolicPressure: "",
      spo2: "",
      gcs: "",
      treatmentAdrenaline: "",
      treatmentFluids: "",
      treatmentSalbutamol: "",
      treatmentH1: "",
      treatmentCorticoid: "",
      treatmentO2: "",
      treatmentIvAccess: "",
      treatmentMonitoring: "",
      treatmentHelp: "",
      treatmentPosition: "",
      treatmentAirway: "",
      clinicalResponse: "",
      observationPlan: "",
      destination: "",
      investigationPlan: "",
      dischargePlan: "",
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
}

function next(): ProtocolState {
  const st = getCurrentState();
  if (st.type === "end") return st;
  if (st.type === "action" && session.currentStateId === "atendimento") {
    const tpl = getStateTemplate("atendimento");
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
  return getCurrentState();
}

function resetSession(): ProtocolState {
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
  return session.history.map((ev) => ({
    timestamp: ev.timestamp,
    kind: "action_executed",
    title: ev.type === "PROTOCOL_STARTED" ? "Anafilaxia — módulo iniciado" : "Evento",
    details: ev.data ? JSON.stringify(ev.data) : undefined,
  }));
}

function buildFields(a: Assessment): AuxiliaryPanel["fields"] {
  const suggestions = buildTreatmentSuggestions(a);
  const adrDose = suggestions.adrenalineSuggestion;
  return [
    {
      id: "age",
      label: "Idade (anos)",
      value: a.age,
      keyboardType: "numeric",
      section: "Paciente e exposição",
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
      label: "Sexo",
      value: a.sex,
      section: "Paciente e exposição",
      presets: [
        { label: "Masculino", value: "Masculino" },
        { label: "Feminino", value: "Feminino" },
      ],
    },
    {
      id: "weightKg",
      label: "Peso (kg)",
      value: a.weightKg,
      keyboardType: "numeric",
      section: "Paciente e exposição",
      presets: [
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "40", value: "40" },
        { label: "60", value: "60" },
        { label: "80", value: "80" },
        { label: "100", value: "100" },
      ],
    },
    {
      id: "exposureType",
      label: "Tipo de exposição / gatilho",
      value: a.exposureType,
      section: "Paciente e exposição",
      presets: [
        { label: "Alimento", value: "Alimento" },
        { label: "Medicamento", value: "Medicamento" },
        { label: "Veneno / inseto", value: "Veneno / inseto" },
        { label: "Contraste / procedimento", value: "Contraste / procedimento" },
        { label: "Exercício / idiopático", value: "Exercício / idiopático" },
        { label: "Desconhecido", value: "Desconhecido" },
      ],
    },
    {
      id: "exposureDetail",
      label: "Detalhe (qual fármaco, alimento…)",
      value: a.exposureDetail,
      fullWidth: true,
      section: "Paciente e exposição",
      placeholder: "Ex.: amoxicilina, amendoim…",
      presets: [
        { label: "Amoxicilina", value: "Amoxicilina" },
        { label: "Dipirona", value: "Dipirona" },
        { label: "Amendoim", value: "Amendoim" },
        { label: "Leite", value: "Leite" },
        { label: "Picada de abelha", value: "Picada de abelha" },
        { label: "Contraste iodado", value: "Contraste iodado" },
      ],
    },
    {
      id: "timeOnsetMin",
      label: "Tempo desde o início (minutos)",
      value: a.timeOnsetMin,
      keyboardType: "numeric",
      section: "Paciente e exposição",
      presets: [
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "30", value: "30" },
        { label: "60", value: "60" },
        { label: "120", value: "120" },
      ],
    },

    {
      id: "symptoms",
      label: "Manifestações presentes",
      value: a.symptoms,
      fullWidth: true,
      section: "Manifestações e vital",
      presetMode: "toggle_token",
      presets: [
        { label: "Insuficiência respiratória", value: "Insuficiência respiratória" },
        { label: "Estridor / edema de glote", value: "Estridor / edema de glote" },
        { label: "Dispneia / broncoespasmo", value: "Dispneia / broncoespasmo" },
        { label: "Sensação de obstrução de via aérea", value: "Sensação de obstrução de via aérea" },
        { label: "Rebaixamento do nível de consciência", value: "Rebaixamento do nível de consciência" },
        { label: "Síncope / pré-síncope", value: "Síncope / pré-síncope" },
        { label: "Pulso filiforme / extremidades frias", value: "Pulso filiforme / extremidades frias" },
        { label: "Angioedema (lábios, pálpebras, língua)", value: "Angioedema" },
        { label: "Urticária / eritema / prurido", value: "Urticária / eritema / prurido" },
        { label: "Disfonia", value: "Disfonia" },
        { label: "Náuseas / vómitos / dor abdominal / diarreia", value: "Náuseas / vómitos / dor abdominal / diarreia" },
        { label: "Ansiedade / sensação de morte iminente", value: "Ansiedade / sensação de morte iminente" },
      ],
    },
    {
      id: "systolicPressure",
      label: "PAS (mmHg)",
      value: a.systolicPressure,
      keyboardType: "numeric",
      section: "Manifestações e vital",
      presets: [
        { label: "60", value: "60" },
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "130", value: "130" },
        { label: "140", value: "140" },
        { label: "160", value: "160" },
      ],
    },
    {
      id: "diastolicPressure",
      label: "PAD (mmHg)",
      value: a.diastolicPressure,
      keyboardType: "numeric",
      section: "Manifestações e vital",
      presets: [
        { label: "30", value: "30" },
        { label: "40", value: "40" },
        { label: "50", value: "50" },
        { label: "60", value: "60" },
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
      ],
    },
    {
      id: "heartRate",
      label: "FC (bpm)",
      value: a.heartRate,
      keyboardType: "numeric",
      section: "Manifestações e vital",
      presets: [
        { label: "60", value: "60" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "130", value: "130" },
        { label: "140", value: "140" },
        { label: "160", value: "160" },
      ],
    },
    {
      id: "spo2",
      label: "SpO₂ (%)",
      value: a.spo2,
      keyboardType: "numeric",
      section: "Manifestações e vital",
      presets: [
        { label: "88", value: "88" },
        { label: "92", value: "92" },
        { label: "95", value: "95" },
        { label: "98", value: "98" },
      ],
    },
    {
      id: "gcs",
      label: "GCS",
      value: a.gcs,
      keyboardType: "numeric",
      section: "Manifestações e vital",
      presets: [
        { label: "15", value: "15" },
        { label: "13", value: "13" },
        { label: "9", value: "9" },
      ],
    },

    {
      id: "treatmentAdrenaline",
      label: "Adrenalina (doses / horários)",
      value: a.treatmentAdrenaline,
      fullWidth: true,
      section: "Tratamento na emergência",
      placeholder: "Ex.: 0,3 mg IM 10:15; repetida 10:25…",
      suggestedValue: adrDose,
      suggestedLabel: `Sugestão principal: ${adrDose}`,
      presets: withSuggestedFirst([
        { label: "0,3 mg IM agora; repetir em 5 min se necessário", value: "0,3 mg IM agora; repetir em 5 min se necessário" },
        { label: "0,5 mg IM agora; repetir em 5 min se necessário", value: "0,5 mg IM agora; repetir em 5 min se necessário" },
        { label: "2 doses de adrenalina IM realizadas sem resposta adequada", value: "2 doses de adrenalina IM realizadas sem resposta adequada" },
        ...(suggestions.adrenalineIvSuggestion
          ? [{ label: "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min", value: "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min" }]
          : []),
      ], adrDose),
    },
    {
      id: "treatmentHelp",
      label: "Ajuda / suporte avançado",
      value: a.treatmentHelp,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.helpSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.helpSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Acionar ajuda avançada / sala de emergência agora", value: "Acionar ajuda avançada / sala de emergência agora" },
        { label: "Chamar anestesia / intensivista para via aérea difícil", value: "Chamar anestesia / intensivista para via aérea difícil" },
        { label: "Acionar equipa e preparar material de reanimação", value: "Acionar equipa e preparar material de reanimação" },
      ], suggestions.helpSuggestion),
    },
    {
      id: "treatmentPosition",
      label: "Posicionamento",
      value: a.treatmentPosition,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.positionSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.positionSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Supino com membros inferiores elevados; evitar ortostatismo", value: "Supino com membros inferiores elevados; evitar ortostatismo" },
        { label: "Semi-reclinado se facilitar ventilação, evitando colocar o paciente em pé", value: "Semi-reclinado se facilitar ventilação, evitando colocar o paciente em pé" },
        { label: "Decúbito lateral se vómitos / risco de broncoaspiração", value: "Decúbito lateral se vómitos / risco de broncoaspiração" },
      ], suggestions.positionSuggestion),
    },
    {
      id: "treatmentIvAccess",
      label: "Acesso venoso",
      value: a.treatmentIvAccess,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.ivAccessSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.ivAccessSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Periférico", value: "Periférico" },
        { label: "Dois acessos periféricos calibrosos", value: "Dois acessos periféricos calibrosos" },
        { label: "Central", value: "Central" },
      ], suggestions.ivAccessSuggestion),
    },
    {
      id: "treatmentMonitoring",
      label: "Monitorização mínima indicada",
      value: a.treatmentMonitoring,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.monitoringSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.monitoringSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Monitorização contínua: ECG, SpO₂, PA não invasiva seriada e FR", value: "Monitorização contínua: ECG, SpO₂, PA não invasiva seriada e FR" },
        { label: "Monitorização mínima: oximetria de pulso, PA seriada e frequência cardíaca", value: "Monitorização mínima: oximetria de pulso, PA seriada e frequência cardíaca" },
        { label: "ECG contínuo + oximetria de pulso", value: "ECG contínuo + oximetria de pulso" },
        { label: "PA a cada 3–5 min + oximetria contínua", value: "PA a cada 3–5 min + oximetria contínua" },
      ], suggestions.monitoringSuggestion),
    },
    {
      id: "treatmentFluids",
      label: "Cristalóide / volume",
      value: a.treatmentFluids,
      fullWidth: true,
      section: "Tratamento na emergência",
      placeholder: "Bolus e totais",
      suggestedValue: suggestions.fluidSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.fluidSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Ringer lactato 500 mL em bolus", value: "Ringer lactato 500 mL em bolus" },
        { label: "Ringer lactato 1000 mL em bolus", value: "Ringer lactato 1000 mL em bolus" },
        { label: "SF 0,9% 500 mL em bolus", value: "SF 0,9% 500 mL em bolus" },
        { label: "SF 0,9% 1000 mL em bolus", value: "SF 0,9% 1000 mL em bolus" },
        { label: "20 mL/kg em bolus", value: "20 mL/kg em bolus" },
        { label: "Sem bolus adicional no momento", value: "Sem bolus adicional no momento" },
      ], suggestions.fluidSuggestion),
    },
    {
      id: "treatmentO2",
      label: "Oxigênio",
      value: a.treatmentO2,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.oxygenSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.oxygenSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Cateter nasal 2–5 L/min", value: "Cateter nasal 2–5 L/min" },
        { label: "Máscara simples 5–10 L/min", value: "Máscara simples 5–10 L/min" },
        { label: "Máscara com reservatório 10–15 L/min", value: "Máscara com reservatório 10–15 L/min" },
        { label: "Cânula nasal de alto fluxo 40–60 L/min", value: "Cânula nasal de alto fluxo 40–60 L/min" },
        { label: "Ventilar com bolsa-válvula-máscara + O₂ a 15 L/min", value: "Ventilar com bolsa-válvula-máscara + O₂ a 15 L/min" },
      ], suggestions.oxygenSuggestion),
    },
    {
      id: "treatmentAirway",
      label: "Via aérea / ventilação",
      value: a.treatmentAirway,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.airwaySuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.airwaySuggestion}`,
      presets: withSuggestedFirst([
        { label: "Sem indicação imediata de intubação", value: "Sem indicação imediata de intubação" },
        { label: "Preparar sequência rápida para IOT", value: "Preparar sequência rápida para IOT" },
        { label: "Intubação orotraqueal recomendada agora", value: "Intubação orotraqueal recomendada agora" },
        { label: "Ventilação mecânica invasiva após IOT", value: "Ventilação mecânica invasiva após IOT" },
        { label: "Bolsa-válvula-máscara enquanto organiza via aérea", value: "Bolsa-válvula-máscara enquanto organiza via aérea" },
      ], suggestions.airwaySuggestion),
    },
    {
      id: "treatmentSalbutamol",
      label: "Salbutamol / beta-2",
      value: a.treatmentSalbutamol,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.salbutamolSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.salbutamolSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Não realizado", value: "Não realizado" },
        { label: "Salbutamol nebulizado 5 mg", value: "Salbutamol nebulizado 5 mg" },
        { label: "Aerossol dosimetrado", value: "Aerossol dosimetrado" },
      ], suggestions.salbutamolSuggestion),
    },
    {
      id: "treatmentH1",
      label: "Anti-H1",
      value: a.treatmentH1,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.h1Suggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.h1Suggestion}`,
      presets: withSuggestedFirst([
        { label: "Não usar na fase inicial; considerar após estabilização se pele persistente", value: "Não usar na fase inicial; considerar após estabilização se pele persistente" },
        { label: "Cetirizina 10 mg VO após estabilização", value: "Cetirizina 10 mg VO após estabilização" },
        { label: "Loratadina 10 mg VO após estabilização", value: "Loratadina 10 mg VO após estabilização" },
        { label: "Clorfeniramina se VO inviável, apenas como adjuvante", value: "Clorfeniramina se VO inviável, apenas como adjuvante" },
      ], suggestions.h1Suggestion),
    },
    {
      id: "treatmentCorticoid",
      label: "Corticoide",
      value: a.treatmentCorticoid,
      fullWidth: true,
      section: "Tratamento na emergência",
      suggestedValue: suggestions.corticoidSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.corticoidSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Não indicado de rotina no atendimento inicial", value: "Não indicado de rotina no atendimento inicial" },
        { label: "Hidrocortisona 200 mg IV como adjuvante", value: "Hidrocortisona 200 mg IV como adjuvante" },
        { label: "Metilprednisolona 125 mg IV como adjuvante", value: "Metilprednisolona 125 mg IV como adjuvante" },
        { label: "Dexametasona 10 mg IV como adjuvante", value: "Dexametasona 10 mg IV como adjuvante" },
      ], suggestions.corticoidSuggestion),
    },

    {
      id: "clinicalResponse",
      label: "Resposta ao tratamento",
      value: a.clinicalResponse,
      section: "Evolução e destino",
      presets: [
        { label: "Melhora clara", value: "Melhora clara" },
        { label: "Parcial", value: "Parcial" },
        { label: "Sem melhora / piora", value: "Sem melhora / piora" },
      ],
    },
    {
      id: "observationPlan",
      label: "Plano de observação",
      value: a.observationPlan,
      fullWidth: true,
      section: "Evolução e destino",
      placeholder: "Ex.: 6 h em observação…",
      suggestedValue: suggestions.observationSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.observationSuggestion}`,
      presets: withSuggestedFirst([
        { label: "2 h após resolução completa se baixo risco e alta segura", value: "2 h após resolução completa se baixo risco e alta segura" },
        { label: "Pelo menos 6 h após resolução dos sintomas", value: "Pelo menos 6 h após resolução dos sintomas" },
        { label: "Pelo menos 12 h após resolução dos sintomas", value: "Pelo menos 12 h após resolução dos sintomas" },
        { label: "Monitorização prolongada por 24 h", value: "Monitorização prolongada por 24 h" },
      ], suggestions.observationSuggestion),
    },
    {
      id: "destination",
      label: "Destino",
      value: a.destination,
      section: "Evolução e destino",
      suggestedValue: suggestions.destinationSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.destinationSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Alta com orientações", value: "Alta com orientações" },
        { label: "Observação prolongada", value: "Observação prolongada" },
        { label: "Sala de emergência / observação monitorizada", value: "Sala de emergência / observação monitorizada" },
        { label: "UTI / sala de emergência avançada", value: "UTI / sala de emergência avançada" },
      ], suggestions.destinationSuggestion),
    },
    {
      id: "dischargePlan",
      label: "Alta segura / autoinjetor",
      value: a.dischargePlan,
      fullWidth: true,
      section: "Evolução e destino",
      suggestedValue: suggestions.dischargeSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.dischargeSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Prescrever 2 autoinjetores, treinar uso, fornecer plano de ação e encaminhar para alergologia", value: "Prescrever 2 autoinjetores, treinar uso, fornecer plano de ação e encaminhar para alergologia" },
        { label: "Orientar retorno se recorrência, evitar o fármaco suspeito, documentar alergia e encaminhar para alergologia", value: "Orientar retorno se recorrência, evitar o fármaco suspeito, documentar alergia e encaminhar para alergologia" },
        { label: "Alta apenas após resolução sustentada e observação adequada ao risco", value: "Alta apenas após resolução sustentada e observação adequada ao risco" },
      ], suggestions.dischargeSuggestion),
    },
    {
      id: "investigationPlan",
      label: "Investigação e seguimento",
      value: a.investigationPlan,
      fullWidth: true,
      section: "Evolução e destino",
      suggestedValue: suggestions.investigationSuggestion,
      suggestedLabel: `Sugestão principal: ${suggestions.investigationSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Colher triptase aguda idealmente até 2 h do início", value: "Colher triptase aguda idealmente até 2 h do início" },
        { label: "Colher triptase basal em outro momento para comparação", value: "Colher triptase basal em outro momento para comparação" },
        { label: "Encaminhar para alergologia / imunologia", value: "Encaminhar para alergologia / imunologia" },
        { label: "Documentar gatilho provável, horários e resposta às condutas", value: "Documentar gatilho provável, horários e resposta às condutas" },
      ], suggestions.investigationSuggestion),
    },
    {
      id: "freeNotes",
      label: "Notas / prescrição de autoinjetor",
      value: a.freeNotes,
      fullWidth: true,
      section: "Evolução e destino",
      presets: [
        { label: "Orientado autoinjetor", value: "Orientado autoinjetor" },
        { label: "Plano de ação entregue", value: "Plano de ação entregue" },
        { label: "Seguimento com alergologia", value: "Seguimento com alergologia" },
        { label: "Prescritos 2 autoinjetores + treino", value: "Prescritos 2 autoinjetores + treino" },
        { label: "Orientado retorno imediato se recorrência", value: "Orientado retorno imediato se recorrência" },
      ],
    },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "atendimento") return null;
  const a = session.assessment;
  const suggestions = buildTreatmentSuggestions(a);
  const { flags, diagResult } = suggestions;
  const advancedAirwayDecision = needsAdvancedAirwayDecision(a);

  const gradeLabel =
    diagResult.grade === 4 ? "Grau IV — Choque anafilático" :
    diagResult.grade === 3 ? "Grau III — Anafilaxia grave" :
    diagResult.grade === 2 ? "Grau II — Anafilaxia moderada" :
    diagResult.grade === 1 ? "Grau I — Reação alérgica isolada" :
    null;

  const descBase =
    !flags.examComplete
      ? "Complete peso, manifestações, PAS/PAD, SpO₂ e GCS para diagnóstico e condutas personalizadas."
      : diagResult.grade === 4 && flags.coma
        ? "CHOQUE ANAFILÁTICO com rebaixamento — via aérea ameaçada, intubação precoce e adrenalina IM/EV imediatas."
        : diagResult.grade === 4
          ? "CHOQUE ANAFILÁTICO — adrenalina IM imediata, dois acessos, cristalóide em bolus. Considerar adrenalina EV se refratário."
          : diagResult.grade === 3
            ? "ANAFILAXIA GRAVE — via aérea comprometida. Adrenalina IM urgente e preparar IOT/VM agora."
            : diagResult.grade === 2
              ? "ANAFILAXIA MODERADA — adrenalina IM agora. Observação ≥ 6 h. Pode progredir para choque."
              : diagResult.grade === 1
                ? "REAÇÃO ALÉRGICA ISOLADA — sem critérios de anafilaxia. Anti-H1 de 1ª linha; ter adrenalina disponível."
                : "Registe as manifestações clínicas para diagnóstico e condutas personalizadas.";

  return {
    title: "Anafilaxia",
    description: gradeLabel ? `${gradeLabel}: ${descBase}` : descBase,
    fields: buildFields(a),
    metrics: buildMetrics(a),
    actions:
      [
        ...(advancedAirwayDecision
          ? [
              {
                id: "open_rsi_module",
                label: "Abrir fluxo de via aérea avançada",
              },
            ]
          : []),
        ...(suggestions.adrenalineIvSuggestion
          ? [
              {
                id: "open_vasoactive_module",
                label: "Abrir módulo de drogas vasoativas",
              },
            ]
          : []),
      ],
    recommendations: buildRecommendations(a),
  };
}

function updateAuxiliaryField(fieldId: string, value: string): AuxiliaryPanel | null {
  const key = fieldId as keyof Assessment;
  if (key in session.assessment) session.assessment[key] = value as never;
  return getAuxiliaryPanel();
}

function applyAuxiliaryPreset(fieldId: string, value: string): AuxiliaryPanel | null {
  const panel = getAuxiliaryPanel();
  const field = panel?.fields.find((f) => f.id === fieldId);
  if (!field) return getAuxiliaryPanel();
  if (field.presetMode === "toggle_token") {
    const cur = session.assessment[fieldId as keyof Assessment] as string;
    if (value.includes(" | ")) return updateAuxiliaryField(fieldId, value);
    return updateAuxiliaryField(fieldId, toggleTokenValue(cur, value));
  }
  return updateAuxiliaryField(fieldId, value);
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
      { label: "Exposição", value: a.exposureType || "—" },
      { label: "PAS", value: a.systolicPressure || "—" },
      { label: "Destino", value: a.destination || "—" },
    ],
  };
}

function getEncounterSummaryText(): string {
  const a = session.assessment;
  const w = parseNum(a.weightKg);
  const adr =
    w != null && w > 0
      ? `${suggestedAdrenalineImMg(w)} mg IM sugerida (1:1000)`
      : "Peso — / dose conforme protocolo";
  return [
    "Anafilaxia — resumo",
    `Exposição: ${a.exposureType} ${a.exposureDetail || ""}`,
    `Sintomas: ${a.symptoms || "—"}`,
    `PA ${a.systolicPressure}/${a.diastolicPressure}  FC ${a.heartRate}  SpO₂ ${a.spo2}`,
    `Adrenalina: ${a.treatmentAdrenaline || "—"} (${adr})`,
    `Resposta: ${a.clinicalResponse || "—"}  Destino: ${a.destination || "—"}`,
    `Notas: ${a.freeNotes || "—"}`,
  ].join("\n");
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getEncounterReportHtml(): string {
  const body = escapeHtml(getEncounterSummaryText()).replace(/\n/g, "<br/>");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Anafilaxia</title></head><body><pre style="font-family:system-ui">${body}</pre></body></html>`;
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
  tick,
  updateAuxiliaryField,
  updateAuxiliaryStatus,
  updateAuxiliaryUnit,
  updateReversibleCauseStatus,
};

export type { ClinicalEngine } from "./clinical-engine";
