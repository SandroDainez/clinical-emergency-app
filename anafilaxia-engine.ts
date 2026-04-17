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
  heightCm: string;
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
  treatmentVasopressor: string;
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

/** Documentação explícita de ≥2 doses IM — não usar “repetir” (aparece em textos de 1ª dose). */
function hasTwoImDosesRecorded(a: Assessment): boolean {
  const t = a.treatmentAdrenaline.toLowerCase();
  return (
    t.includes("2 doses") ||
    t.includes("duas doses") ||
    t.includes("segunda dose") ||
    t.includes("2ª dose") ||
    t.includes("2 dose im") ||
    /\b2\s*ª\s*dose\b/.test(t)
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

function isAirwayAlreadySecured(a: Assessment): boolean {
  const v = a.treatmentAirway.toLowerCase();
  return (
    v.includes("realizada") ||
    v.includes("posicionada") ||
    v.includes("cricotireoidostomia") ||
    v.includes("bolsa-válvula-máscara mantida") ||
    v.includes("ventilação mecânica invasiva")
  );
}

function isAirwaySecured(a: Assessment): boolean {
  return isAirwayAlreadySecured(a);
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

function hasMinimumClassificationData(a: Assessment): boolean {
  const hasSymptoms = a.symptoms.trim().length > 0;
  if (!hasSymptoms) {
    return false;
  }

  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  const spo2 = parseNum(a.spo2);
  const gcs = parseNum(a.gcs);
  const knownExposure = a.exposureType.trim().length > 0 && !a.exposureType.toLowerCase().includes("desconhecido");
  const skin = hasSkinOrMucosaSymptoms(a);
  const gi = hasGiSymptoms(a);
  const vascular = hasVascularOrNeuroSymptoms(a);
  const airway = hasAirwaySevere(a);
  const respiratory = hasRespiratoryFailure(a) || hasBronchospasm(a);
  const shock = sbp != null && dbp != null ? (2 * dbp + sbp) / 3 < 65 || sbp < 90 : sbp != null ? sbp < 90 : false;
  const neuro = gcs != null && gcs <= 13;

  return Boolean(
    shock ||
      airway ||
      respiratory ||
      vascular ||
      neuro ||
      (spo2 != null && spo2 < 92) ||
      (skin && (respiratory || vascular || gi || knownExposure)) ||
      (knownExposure && [skin, respiratory, vascular, gi].filter(Boolean).length >= 2)
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
  if (!hasMinimumClassificationData(a)) {
    return {
      grade: 0,
      label: "Avaliação incompleta",
      sublabel: "Registre sinais suficientes para fechar a direção clínica",
      criteriaText:
        "Com sintomas isolados e poucos dados ainda não é possível graduar com segurança. Preencha manifestações, gatilho e sinais vitais principais para o módulo assumir a classificação.",
      tone: "info",
      adrenalineIndicated: false,
      adrenalineUrgency: "pending",
      adrenalineRationale: "Dados ainda insuficientes para classificação segura — complete a avaliação clínica sem atrasar condutas ABC se houver deterioração.",
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
    ? "Dois acessos periféricos calibrosos (≥ 16G) + via de infusão rápida"
    : "Acesso periférico único (≥ 18G)";
  const monitoringSuggestion =
    flags.shock || flags.coma
      ? "ECG contínuo + SpO₂ contínua + PA não invasiva a cada 2–3 min + FR + diurese"
      : flags.respiratoryFailure || flags.airway
        ? "ECG contínuo + SpO₂ contínua + PA não invasiva seriada + FR"
        : "SpO₂ contínua + PA seriada (5–10 min) + FC";

  const fluidVolume = w != null && w > 0 ? `${Math.round(w * 20)} mL` : "500–1000 mL";
  const fluidSuggestion = flags.shock
    ? `Ringer lactato ou SF 0,9% ${fluidVolume} em bolus EV rápido; reavaliar PA e perfusão`
    : "Sem bolus de rotina; hidratação conforme resposta clínica";

  const vasopressorSuggestion =
    flags.shock && a.treatmentAdrenaline?.toLowerCase().includes("ev")
      ? "Noradrenalina 0,1–0,3 mcg/kg/min — vasopressor de 2ª linha se refratário à adrenalina EV"
      : flags.shock
        ? "Adrenalina EV infusão contínua 0,05–0,1 mcg/kg/min — se choque refratário ≥ 2 doses IM"
        : "Não indicado no momento";

  const oxygenSuggestion =
    flags.airway || flags.respiratoryFailure || flags.shock || (spo2 != null && spo2 < 94)
      ? "Máscara com reservatório 10–15 L/min; titular para SpO₂ 94–98%"
      : spo2 != null && spo2 < 98
        ? "Cateter nasal 2–5 L/min; titular para SpO₂ 94–98%"
        : "Oxigênio se necessário; alvo SpO₂ 94–98%";

  const salbutamolSuggestion = flags.bronchospasm
    ? (parseNum(a.spo2) != null && parseNum(a.spo2)! < 90)
      ? "Salbutamol nebulizado contínuo (broncoespasmo grave)"
      : "Salbutamol nebulizado 5 mg — dose plena"
    : "Não realizado";

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
  /** Infusão EV / módulo vasoativos: choque refratário após 2 IM — não confundir com via aérea isolada. */
  const adrenalineIvSuggestion =
    flags.shock && hasTwoImDosesRecorded(a)
      ? "Refratário após 2 doses de adrenalina IM: considerar adrenalina EV em infusão 0,05–0,1 mcg/kg/min em monitorização contínua"
      : undefined;

  const investigationSuggestion =
    isUnknownOrIdiopathicTrigger(a) || flags.shock
      ? "Colher triptase aguda idealmente até 2 h do início, colher triptase basal depois e encaminhar para alergologia/imunologia"
      : "Colher triptase aguda idealmente até 2 h do início; documentar horário, tratamentos e provável gatilho";
  // Plano de observação — considera resposta clínica + gravidade + local
  const responseVal = (a.clinicalResponse ?? "").toLowerCase();
  const hasClearImprovement = responseVal.includes("melhora clara") || responseVal.includes("melhora completa");
  const hasPartialResponse  = responseVal.includes("parcial");
  const hasNoImprovement    = responseVal.includes("sem melhora") || responseVal.includes("piora");

  const observationSuggestion = (() => {
    if (hasNoImprovement || hasPartialResponse) {
      return "Manter em observação monitorizada (sala de emergência). Reavaliar a cada 30–60 min; considerar escalonamento de conduta.";
    }
    if (hasClearImprovement) {
      if (flags.shock || flags.airway || flags.coma || hasTwoImDosesRecorded(a)) {
        return "≥ 12 h em sala de observação monitorizada com ECG, SpO₂ e PA contínuos. Mínimo em área com suporte de emergência.";
      }
      if (flags.respiratoryFailure) {
        return "≥ 12 h em sala de observação com monitorização respiratória (SpO₂, FR, ausculta) — risco de reação bifásica.";
      }
      if (diagResult.grade === 2) {
        return "≥ 6 h em sala de observação com monitorização (ECG + SpO₂). Alta somente se assintomático e estável no final do período.";
      }
      if (diagResult.grade === 1) {
        return "≥ 2 h em sala de observação clínica. Alta segura se resolução completa, sem sintomas sistêmicos e acesso a emergência.";
      }
      return "≥ 6 h em sala de observação com monitorização. Estratificar risco antes da alta.";
    }
    // Sem resposta preenchida — baseado em flags
    if (flags.shock || flags.airway || flags.respiratoryFailure || flags.coma) {
      return "≥ 12 h em observação monitorizada (UTI ou emergência com suporte avançado).";
    }
    if (hasTwoImDosesRecorded(a)) {
      return "≥ 6 h em sala de observação com monitorização (ECG, SpO₂, PA seriada).";
    }
    return "Preencher resposta ao tratamento para sugestão personalizada de tempo e local de observação.";
  })();

  // Destino — considera resposta clínica + gravidade + via aérea avançada
  const destinationSuggestion = (() => {
    const rv = (a.clinicalResponse ?? "").toLowerCase();
    const hasClear    = rv.includes("melhora clara") || rv.includes("melhora completa");
    const hasPartial  = rv.includes("parcial");
    const hasNoImprove = rv.includes("sem melhora") || rv.includes("piora");

    // Critérios de UTI independentemente da resposta
    if (flags.coma || (flags.shock && !hasClear) || flags.airway) {
      return "UTI — instabilidade hemodinâmica, comprometimento de via aérea ou rebaixamento.";
    }
    if (hasNoImprove) {
      return "Sala de emergência / UTI — sem melhora. Reavaliar conduta e considerar internação.";
    }
    if (hasPartial) {
      return "Observação monitorizada prolongada — resposta parcial. Não liberar ainda.";
    }
    if (hasClear) {
      if (diagResult.grade >= 3 || hasTwoImDosesRecorded(a) || flags.respiratoryFailure) {
        return "Internação em sala de observação monitorizada (≥ 12 h). Reavaliar antes da alta.";
      }
      if (diagResult.grade === 2) {
        return "Observação em área monitorizada por ≥ 6 h. Alta se assintomático e estável.";
      }
      if (diagResult.grade === 1) {
        return "Alta com orientações após ≥ 2 h de observação clínica sem sintomas sistêmicos.";
      }
    }
    // Sem resposta preenchida
    if (flags.shock || flags.airway || flags.coma) return "UTI / sala de emergência avançada.";
    if (flags.respiratoryFailure || hasTwoImDosesRecorded(a)) return "Observação prolongada / sala de emergência.";
    return "Preencher resposta ao tratamento para sugestão personalizada de destino.";
  })();
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
    vasopressorSuggestion,
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
  const w = parseNum(a.weightKg);
  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  const flags = getSeverityFlags(a);

  // 1. Diagnóstico + classificação
  const gradePrefix =
    diagResult.grade === 4 ? "🔴 Grau IV" :
    diagResult.grade === 3 ? "🔴 Grau III" :
    diagResult.grade === 2 ? "🟠 Grau II" :
    diagResult.grade === 1 ? "🟡 Grau I" : "⚪ —";
  out.push({ label: "Classificação", value: `${gradePrefix} · ${diagResult.label}` });

  // 2. Conduta imediata — o que fazer AGORA
  const conductaImediata =
    diagResult.grade === 0
      ? "Completar avaliação clínica para classificar"
      : diagResult.grade === 1
        ? "Anti-H1 VO; adrenalina disponível mas não indicada agora"
        : diagResult.grade === 4 || flags.shock
          ? "🚨 Adrenalina IM + cristalóide IV + O₂ + decúbito — AGORA"
          : diagResult.grade === 3 || flags.airway
            ? "🚨 Adrenalina IM + O₂ + preparar via aérea — AGORA"
            : "Adrenalina IM na coxa lateral — administrar imediatamente";
  out.push({ label: "Conduta imediata", value: conductaImediata });

  // 3. Adrenalina IM — status
  const adrStatus =
    diagResult.adrenalineUrgency === "immediate" ? "✅ Indicada — administrar agora" :
    diagResult.adrenalineUrgency === "watch"     ? "⚠️ Não indicada — ter disponível" :
    "— Aguardando dados";
  out.push({ label: "Adrenalina IM", value: adrStatus });

  // 4. Dose — só se relevante
  if (diagResult.adrenalineUrgency === "immediate") {
    if (w != null && w > 0 && w < 300) {
      const mg = suggestedAdrenalineImMg(w);
      out.push({ label: "Dose (0,01 mg/kg)", value: `${mg} mg = ${mg} mL 1:1000` });
    } else {
      out.push({ label: "Dose IM adulto", value: "0,5 mg = 0,5 mL 1:1000" });
    }
  }

  // 5. PA + PAM — só se PAS/PAD preenchidos (PAM = PAD + (PAS−PAD)/3)
  if (sbp != null && dbp != null) {
    out.push({ label: "PA (PAS/PAD)", value: `${String(sbp).replace(".", ",")}/${String(dbp).replace(".", ",")} mmHg` });
    const pam = formatMap(sbp, dbp);
    const pamAlert = parseInt(pam, 10) < 65 ? " ⚠ < 65 mmHg" : "";
    out.push({ label: "PAM", value: `${pam.replace(".", ",")} mmHg${pamAlert}` });
  }

  // 6. Alertas de sistemas — só quando presentes
  if (flags.shock) {
    out.push({ label: "🚨 Circulação", value: "Choque anafilático — 2 acessos, bolus, vasopressor se refratário" });
  }
  if (flags.airway && !isAirwaySecured(a)) {
    out.push({ label: "🚨 Via aérea", value: "Risco alto — preparar via aérea definitiva urgente" });
  }
  if (isAirwaySecured(a)) {
    const airwayDone = a.treatmentAirway.includes("realizada") ? "IOT realizada" :
                       a.treatmentAirway.includes("posicionada") ? "Máscara laríngea" :
                       a.treatmentAirway.includes("cricotireoidostomia") ? "Cricotireoidostomia" :
                       "Via aérea avançada em curso";
    out.push({ label: "✅ Via aérea", value: airwayDone });
  }

  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
  const w = parseNum(a.weightKg);
  const suggestions = buildTreatmentSuggestions(a);
  const { diagResult } = suggestions;

  // ── 1. Quadro clínico ────────────────────────────────────────────────────────
  recs.push({
    title: "Quadro clínico",
    tone: "info",
    lines: [
      "Reação sistêmica grave de hipersensibilidade, de início súbito (minutos a poucas horas) após exposição a gatilho. Pode ser IgE-mediada, não-IgE-mediada ou idiopática.",
      "Gatilhos mais comuns: alimentos (amendoim, frutos do mar, leite, ovo), medicamentos (beta-lactâmicos, AINEs, quimioterápicos), veneno de inseto (abelha, vespa), contraste iodado, látex e exercício.",
      "Caracteriza-se por envolvimento sistêmico: pele/mucosas + ao menos um sistema (respiratório, cardiovascular ou GI). Em até 20% dos casos os sinais cutâneos podem estar ausentes.",
      "Reação bifásica ocorre em 1–20% dos casos (recidiva 1–72 h após resolução inicial), justificando observação prolongada mesmo após melhora clínica.",
    ],
  });

  // ── 2. Classificação (WAO / graus de gravidade) ──────────────────────────────
  recs.push({
    title: "Classificação — Graus de Gravidade (WAO 2020)",
    tone: "info",
    lines: [
      "Grau I — Reação cutânea/mucosa isolada (urticária, angioedema, eritema, prurido) sem envolvimento sistêmico. Não configura anafilaxia.",
      "Grau II — Anafilaxia moderada: envolvimento sistêmico leve a moderado (broncoespasmo leve, hipotensão leve, sintomas GI). Adrenalina IM indicada.",
      "Grau III — Anafilaxia grave: comprometimento importante de via aérea (estridor, edema de glote), broncoespasmo grave, hipotensão significativa ou síncope. Adrenalina IM urgente + suporte.",
      "Grau IV — Choque anafilático / PCR: colapso cardiovascular, hipotensão grave, inconsciência, parada respiratória ou cardiorrespiratória. Adrenalina IM/EV imediata + RCP se indicado.",
      `Caso atual: ${diagResult.grade > 0 ? `Grau ${diagResult.grade} — ${diagResult.label}` : "Avaliação incompleta — preencher dados para classificação."}`,
    ],
  });

  // ── 3. Sinais e sintomas por sistema ────────────────────────────────────────
  recs.push({
    title: "Sinais e sintomas por sistema",
    tone: "info",
    lines: [
      "Pele e mucosas (80–90%): urticária, angioedema, eritema generalizado, prurido, rubor facial. Ausência de sintomas cutâneos não exclui anafilaxia.",
      "Respiratório (40–60%): rinorreia, estridor (edema laríngeo), rouquidão, disfonia, dispneia, sibilos, broncoespasmo, insuficiência respiratória.",
      "Cardiovascular (30–35%): taquicardia, hipotensão, síncope, pulso filiforme, choque distributivo por vasodilatação e extravasamento capilar.",
      "Gastrointestinal (25–30%): náuseas, vômitos, dor abdominal em cólica, diarreia — especialmente em anafilaxia alimentar.",
      "Neurológico: ansiedade, agitação, sensação de morte iminente, rebaixamento do nível de consciência, convulsões em casos graves.",
      "Outros: conjuntivite, rinite, incontinência urinária, dor torácica (espasmo coronariano — síndrome de Kounis).",
    ],
  });

  // ── 4. Diagnóstico ──────────────────────────────────────────────────────────
  recs.push({
    title: "Como fazer o diagnóstico (critérios WAO)",
    tone: "info",
    lines: [
      "O diagnóstico é CLÍNICO. Anafilaxia é altamente provável quando qualquer um dos três critérios abaixo for satisfeito:",
      "Critério 1 — Início súbito com envolvimento de pele/mucosas + ao menos um de: comprometimento respiratório, hipotensão ou disfunção de órgão-alvo.",
      "Critério 2 — Exposição a alérgeno provável + ao menos dois de: pele/mucosas, respiratório, cardiovascular ou GI.",
      "Critério 3 — Hipotensão após exposição a alérgeno conhecido (PAS < 90 mmHg ou queda ≥ 30% do basal).",
      "Diagnóstico diferencial: urticária isolada, asma aguda, síncope vasovagal, angioedema hereditário (sem urticária), reação vasovagal pós-injeção, síndrome carcinoide.",
      "Triptase sérica — colher idealmente até 2 h do início; confirma mastocitose e anafilaxia grave, mas valor normal não exclui o diagnóstico.",
    ],
  });

  // ── 5. Tratamento ───────────────────────────────────────────────────────────
  recs.push({
    title: "Tratamento — Passo a passo",
    tone: diagResult.grade >= 3 ? "danger" : diagResult.grade === 2 ? "warning" : "info",
    lines: [
      "① ADRENALINA IM — 1ª LINHA IMEDIATA. Local: face lateral da coxa (vasto externo); absorção superior ao deltoide. Dose adulto: 0,5 mg (0,5 mL de 1:1000); criança: 0,01 mg/kg (máx 0,5 mg). Repetir a cada 5 min se necessário.",
      w != null && w > 0
        ? `   → Dose calculada para este paciente (${w} kg): ${suggestedAdrenalineImMg(w)} mg IM.`
        : "   → Preencher peso para dose personalizada.",
      "② POSIÇÃO — supino + MMII elevados se hipotensão; semi-reclinado se dispneia; decúbito lateral se vômitos ou rebaixamento. NUNCA sentar ou colocar em pé abruptamente.",
      "③ OXIGÊNIO — máscara com reservatório 10–15 L/min; alvo SpO₂ 94–98%. Titular conforme resposta. Cânula nasal de alto fluxo se disponível e SpO₂ refratária.",
      "④ ACESSO VENOSO — 2 acessos periféricos calibrosos (G14–16) se choque. Cristalóide: RL ou SF 0,9% 500–1000 mL em bolus rápido se hipotensão (pediatria: 20 mL/kg, repetir se necessário).",
      "⑤ MONITORIZAÇÃO — ECG contínuo, SpO₂, PA não invasiva seriada, FR, Glasgow. Acionar ajuda avançada e UTI precocemente em casos graves.",
      "⑥ ADRENALINA EV EM INFUSÃO CONTÍNUA — indicada se: refratário a ≥ 2 doses IM adequadas + reposição volêmica. Preparo: 1 mg em 100 mL SF 0,9% (10 mcg/mL). Dose inicial: 0,05–0,1 mcg/kg/min; titular até PA sistólica ≥ 90 mmHg. Obrigatório monitor contínuo e acesso venoso central.",
      "⑦ OUTRAS DROGAS VASOATIVAS — se choque refratário à adrenalina: noradrenalina EV 0,1–1 mcg/kg/min como alternativa ou complemento; vasopressina 0,03–0,04 U/min em choque vasoplégico refratário.",
      "⑧ VIA AÉREA AVANÇADA — IOT de sequência rápida indicada se: estridor progressivo, edema laríngeo em progressão, SpO₂ < 90% refratária a O₂, fadiga respiratória, GCS ≤ 8 ou risco iminente de perda de via aérea. Acionar módulo ISR.",
      "   → VENTILAÇÃO MECÂNICA: modo VC ou PCV; VT 6–8 mL/kg peso ideal; PEEP 5–8 cmH₂O; FR 12–16 irpm; FiO₂ 1,0 inicialmente, titular para SpO₂ 94–98%.",
      "⑨ VIA AÉREA CIRÚRGICA (cricotireoidostomia) — indicada como último recurso em via aérea 'não pode intubar, não pode oxigenar' (CICO). Técnica: incisão vertical na pele + horizontal na membrana cricotireóidea; inserir tubo 6.0 ou dispositivo de emergência.",
      "⑩ ADJUVANTES (nunca substituem adrenalina ou via aérea) — anti-H1 (cetirizina 10 mg VO ou difenidramina 25–50 mg EV) após estabilização hemodinâmica; corticoide (metilprednisolona 1–2 mg/kg EV) adjuvante para reação prolongada ou bifásica; salbutamol 2,5–5 mg nebulizado se broncoespasmo persistente; glucagon 1–2 mg EV/IM em pacientes com betabloqueador (reverter bradicardia refratária).",
    ],
  });

  // ── 6. Critérios de alta e internação ───────────────────────────────────────
  recs.push({
    title: "Critérios de alta e internação",
    tone: "warning",
    lines: [
      "INTERNAÇÃO em UTI/semi-intensiva: choque anafilático (grau IV), necessidade de adrenalina EV, IOT, hipotensão refratária, broncoespasmo grave, reação bifásica documentada, ou grau III com comorbidades.",
      "OBSERVAÇÃO HOSPITALAR prolongada (≥ 12 h): grau III, múltiplas doses de adrenalina IM, resposta incompleta, asma ou cardiopatia prévia, gatilho idiopático ou de absorção lenta.",
      "OBSERVAÇÃO MÍNIMA (6 h): grau II com boa resposta à adrenalina, sem comorbidades graves, acesso a serviço de emergência.",
      "ALTA COM OBSERVAÇÃO BREVE (≥ 2 h): grau I (reação cutânea isolada), resposta rápida e completa, ausência de sintomas sistêmicos, baixo risco.",
      `Recomendação para este caso: ${diagResult.observationMinHours > 0 ? `≥ ${diagResult.observationMinHours} h de observação após resolução dos sintomas.` : "Completar avaliação para definir tempo de observação."}`,
      "Alta CONTRAINDICADA se: permanece sintomático, hipotensão ortostática, sem acesso a autoinjetor, sem orientação adequada ou sem plano de ação documentado.",
    ],
  });

  // ── 7. Orientações de alta ──────────────────────────────────────────────────
  recs.push({
    title: "Orientações na alta",
    tone: "info",
    lines: [
      "Prescrever autoinjetor de adrenalina (2 unidades quando indicado) e treinar o paciente e familiares no uso correto antes da alta.",
      "Entregar plano de ação escrito com: quando usar, como usar, quando chamar emergência e como evitar o gatilho.",
      isLikelyDrugInducedAvoidable(a)
        ? "Reação medicamentosa: documentar alergia no prontuário, orientar evicção do fármaco e de medicamentos da mesma classe com reatividade cruzada."
        : "Orientar identificação e evicção rigorosa do gatilho identificado (dieta, ambiente, atividade física, medicamentos).",
      "Encaminhar para alergista/imunologista para investigação etiológica, triptase basal, testes cutâneos e imunoterapia se indicada.",
      "Colher triptase aguda (até 2 h) e triptase basal (24–72 h após) para rastreio de mastocitose sistêmica.",
      "Orientar uso de pulseira de identificação de alergia e cadastro em sistema de alertas médicos.",
      "Reavaliar: ortostatismo/tontura antes da alta, resolução sustentada dos sintomas e capacidade de deglutição.",
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
      heightCm: "",
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
      treatmentVasopressor: "",
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
  const { flags, diagResult } = suggestions;
  const adrDose = suggestions.adrenalineSuggestion;
  const w = parseNum(a.weightKg);
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
      id: "heightCm",
      label: "Altura (cm)",
      value: a.heightCm,
      keyboardType: "numeric",
      section: "Paciente e exposição",
      presets: [
        { label: "120", value: "120" },
        { label: "150", value: "150" },
        { label: "160", value: "160" },
        { label: "170", value: "170" },
        { label: "180", value: "180" },
        { label: "190", value: "190" },
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
      label: "Detalhe do gatilho (qual fármaco, alimento…)",
      value: a.exposureDetail,
      fullWidth: true,
      section: "Sinais vitais e exame clínico",
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
      section: "Sinais vitais e exame clínico",
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
      section: "Sinais vitais e exame clínico",
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
      section: "Sinais vitais e exame clínico",
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
      section: "Sinais vitais e exame clínico",
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
      section: "Sinais vitais e exame clínico",
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
      section: "Sinais vitais e exame clínico",
      presets: [
        { label: "15", value: "15" },
        { label: "13", value: "13" },
        { label: "9", value: "9" },
      ],
    },

    {
      id: "treatmentAdrenaline",
      label: "Adrenalina — dose sugerida por contexto",
      value: a.treatmentAdrenaline,
      fullWidth: true,
      section: "Tratamento na emergência",
      placeholder: "Ex.: 0,5 mg IM 10:15; 2ª dose 10:22…",
      suggestedValue: adrDose,
      suggestedLabel: `Sugestão por contexto: ${adrDose}`,
      helperText: (() => {
        const flags = suggestions.flags;
        const diagResult = suggestions.diagResult;
        if (diagResult.grade === 1)
          return "Reação cutânea/GI isolada — sem critérios de anafilaxia sistêmica. Adrenalina não indicada no momento; ter disponível.";
        if (diagResult.grade === 0)
          return "Preencha peso e manifestações para dose exata. Padrão adulto: 0,5 mg IM.";
        if (flags.shock && flags.airway)
          return "⚠ Choque + comprometimento de via aérea — adrenalina IM IMEDIATA e preparar IOT.";
        if (flags.shock)
          return "⚠ Choque anafilático identificado — adrenalina IM AGORA na coxa lateral.";
        if (flags.airway)
          return "⚠ Comprometimento de via aérea — adrenalina IM urgente; preparar via aérea avançada.";
        if (flags.respiratoryFailure)
          return "Insuficiência respiratória — adrenalina IM indicada imediatamente.";
        return w != null && w > 0
          ? `Dose calculada por peso (${w} kg): ${suggestedAdrenalineImMg(w)} mg IM na coxa lateral.`
          : "Dose padrão adulto: 0,5 mg IM na coxa lateral.";
      })(),
      presets: withSuggestedFirst([
        // 1ª dose — calculada por peso se disponível
        ...(w != null && w > 0 && w < 300
          ? [{ label: `${suggestedAdrenalineImMg(w)} mg IM — 1ª dose / coxa lateral`, value: `${suggestedAdrenalineImMg(w)} mg IM — 1ª dose` }]
          : [{ label: "0,5 mg IM — 1ª dose / coxa lateral (adulto)", value: "0,5 mg IM — 1ª dose" }]
        ),
        // 2ª dose (5 min após sem melhora)
        ...(w != null && w > 0 && w < 300
          ? [{ label: `${suggestedAdrenalineImMg(w)} mg IM — 2ª dose / 5 min após sem melhora`, value: `${suggestedAdrenalineImMg(w)} mg IM — 2ª dose (5 min após)` }]
          : [{ label: "0,5 mg IM — 2ª dose / 5 min após sem melhora", value: "0,5 mg IM — 2ª dose (5 min após)" }]
        ),
        { label: "2 doses IM realizadas — sem resposta adequada", value: "2 doses IM realizadas — sem resposta adequada" },
        // EV contínua — só exibe se refratário após 2 doses IM
        ...(suggestions.adrenalineIvSuggestion
          ? [{ label: "Adrenalina EV em infusão — refratário após 2 doses IM", value: "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min" }]
          : []),
      ], adrDose),
    },
    {
      id: "treatmentIvAccess",
      label: "Acesso venoso",
      value: a.treatmentIvAccess,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: flags.shock
        ? "⚠ Choque — obter 2 acessos periféricos calibrosos (≥16G) simultaneamente. IO se acesso impossível em < 60 s."
        : "Calibre mínimo recomendado ≥ 18G para infusão rápida de volume.",
      suggestedValue: suggestions.ivAccessSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.ivAccessSuggestion}`,
      presets: [
        { label: "1 acesso periférico — 18G (calibre padrão)", value: "Acesso periférico 18G" },
        { label: "1 acesso periférico — 16G (calibroso, preferencial no choque)", value: "Acesso periférico 16G" },
        { label: "2 acessos periféricos calibrosos (≥ 16G) — choque / instabilidade", value: "2 acessos periféricos ≥ 16G" },
        { label: "Acesso intraósseo (IO) — se periférico inviável / emergência", value: "Acesso intraósseo (IO)" },
        { label: "Acesso venoso central — reservar para choque refratário ou vasopressores", value: "Acesso venoso central" },
        { label: "Acesso periférico não obtido — tentar outra via", value: "Acesso venoso não obtido" },
      ],
    },
    {
      id: "treatmentMonitoring",
      label: "Monitorização",
      value: a.treatmentMonitoring,
      fullWidth: true,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: "Selecione todos os parâmetros monitorados. Frequência mínima recomendada ao lado de cada item.",
      suggestedValue: suggestions.monitoringSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.monitoringSuggestion}`,
      presets: [
        { label: "SpO₂ contínua — oximetria de pulso (parâmetro mínimo)", value: "SpO₂ contínua" },
        { label: "FC contínua — monitorização cardíaca / oxímetro", value: "FC contínua" },
        { label: "PA não invasiva — a cada 5 min (mínimo reação leve)", value: "PA a cada 5 min" },
        { label: "PA não invasiva — a cada 2–3 min (choque / instabilidade)", value: "PA a cada 2–3 min" },
        { label: "ECG contínuo — derivações completas (choque, arritmia, QTc)", value: "ECG contínuo" },
        { label: "FR — frequência respiratória seriada (≥ cada 5 min)", value: "FR seriada" },
        { label: "Capnografia (EtCO₂) — se IOT ou sedação", value: "Capnografia EtCO₂ (IOT)" },
        { label: "Diurese horária — cateterismo vesical se choque persistente", value: "Diurese horária (sondagem)" },
        { label: "Temperatura — avaliar a cada 30 min", value: "Temperatura seriada" },
        { label: "Glasgow — reavaliação neurológica seriada", value: "Glasgow seriado" },
      ],
    },
    {
      id: "treatmentFluids",
      label: "Cristalóide / volume",
      value: a.treatmentFluids,
      fullWidth: true,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: flags.shock
        ? `⚠ Choque presente — iniciar bolus imediato${w ? ` (20 mL/kg ≈ ${Math.round(w * 20)} mL)` : ""}. Reavaliar PA e perfusão após cada bolus.`
        : "Sem bolus de rotina na ausência de hipotensão. Iniciar se PA sistólica < 90 mmHg ou sinais de choque.",
      suggestedValue: suggestions.fluidSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.fluidSuggestion}`,
      presets: [
        { label: "Sem bolus — hemodinâmica estável", value: "Sem bolus — estável" },
        { label: "Ringer lactato 500 mL EV em bolus rápido (10–15 min)", value: "Ringer lactato 500 mL em bolus" },
        { label: "Ringer lactato 1000 mL EV em bolus (20 min)", value: "Ringer lactato 1000 mL em bolus" },
        { label: "Ringer lactato 2000 mL EV — choque grave / refratário", value: "Ringer lactato 2000 mL (choque grave)" },
        { label: "SF 0,9% 500 mL em bolus — alternativa", value: "SF 0,9% 500 mL em bolus" },
        { label: "SF 0,9% 1000 mL em bolus — alternativa", value: "SF 0,9% 1000 mL em bolus" },
        ...(w ? [{ label: `20 mL/kg em bolus — pediátrico / ajuste por peso (≈ ${Math.round(w * 20)} mL)`, value: `20 mL/kg em bolus (≈ ${Math.round(w * 20)} mL)` }] : []),
        { label: "Manutenção EV 125 mL/h após estabilização hemodinâmica", value: "Manutenção EV 125 mL/h após estabilização" },
      ],
    },
    {
      id: "treatmentAirway",
      label: "O₂ suplementar e via aérea",
      value: a.treatmentAirway || a.treatmentO2,
      fullWidth: true,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: "Selecione o O₂ em uso e a conduta de via aérea. Pode marcar mais de um.",
      suggestedValue: suggestions.airwaySuggestion !== "Sem indicação imediata de intubação"
        ? suggestions.airwaySuggestion
        : suggestions.oxygenSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.airwaySuggestion !== "Sem indicação imediata de intubação" ? suggestions.airwaySuggestion : suggestions.oxygenSuggestion}`,
      presets: [
        // ── O₂ suplementar inicial ──
        { label: "Cateter nasal — 2–5 L/min (FiO₂ ~24–44%)", value: "Cateter nasal 2–5 L/min" },
        { label: "Máscara simples — 5–10 L/min (FiO₂ ~35–55%)", value: "Máscara simples 5–10 L/min" },
        { label: "Máscara c/ reservatório — 10–15 L/min (FiO₂ ~60–100%) ★ Padrão anafilaxia", value: "Máscara com reservatório 10–15 L/min" },
        { label: "Cânula alto fluxo (CNAF) — 40–60 L/min", value: "Cânula nasal de alto fluxo 40–60 L/min" },
        { label: "Sem O₂ adicional — SpO₂ adequada em ar ambiente", value: "Sem O₂ adicional — SpO₂ adequada" },
        // ── Conduta de via aérea ──
        { label: "Via aérea de prontidão — monitorar evolução", value: "Via aérea de prontidão; monitorar evolução" },
        { label: "BVM em standby — pronto para ventilar se apneia", value: "BVM em standby" },
        { label: "Ventilação com BVM + O₂ 15 L/min (pré-IOT)", value: "Ventilação com bolsa-válvula-máscara mantida" },
        { label: "Preparar intubação de sequência rápida", value: "Preparar sequência rápida para IOT" },
        { label: "Intubação orotraqueal realizada", value: "Intubação orotraqueal realizada" },
        { label: "Máscara laríngea posicionada", value: "Máscara laríngea posicionada com ventilação efetiva" },
        { label: "VM invasiva iniciada após IOT", value: "Ventilação mecânica invasiva após IOT" },
        { label: "Cricotireoidostomia realizada (via aérea cirúrgica)", value: "Cricotireoidostomia realizada" },
      ],
    },
    {
      id: "treatmentSalbutamol",
      label: "Salbutamol / beta-2 agonista",
      value: a.treatmentSalbutamol,
      fullWidth: true,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: flags.bronchospasm
        ? "⚠ Broncoespasmo presente — salbutamol indicado. NÃO substitui adrenalina IM, que permanece 1ª linha."
        : "Indicado apenas se broncoespasmo. Adjuvante — não substitui adrenalina IM.",
      suggestedValue: suggestions.salbutamolSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.salbutamolSuggestion}`,
      presets: [
        { label: "Não indicado / não realizado", value: "Não realizado" },
        { label: "Salbutamol nebulizado 2,5 mg (0,5 mL) em SF 2,5 mL — 1ª dose", value: "Salbutamol nebulizado 2,5 mg — 1ª dose" },
        { label: "Salbutamol nebulizado 5 mg (1 mL) em SF 2 mL — dose plena adulto", value: "Salbutamol nebulizado 5 mg — dose plena" },
        { label: "Salbutamol 5 mg nebulizado — repetido a cada 20 min (até 3 doses)", value: "Salbutamol 5 mg nebulizado repetido (até 3 doses/h)" },
        { label: "Salbutamol nebulizado contínuo — broncoespasmo grave / refratário", value: "Salbutamol nebulizado contínuo (broncoespasmo grave)" },
        { label: "Aerossol dosimetrado (MDI) 4–8 puffs — alternativa se nebulizador indisponível", value: "Salbutamol MDI 4–8 puffs com espaçador" },
        { label: "Ipratrópio 0,5 mg nebulizado associado — broncoespasmo refratário ao salbutamol", value: "Ipratrópio 0,5 mg nebulizado associado" },
        { label: "Salbutamol EV — apenas UTI com monitorização contínua (casos refratários)", value: "Salbutamol EV — UTI (refratário à nebulização)" },
      ],
    },
    {
      id: "treatmentH1",
      label: "Anti-H1 (adjuvante pós-estabilização)",
      value: a.treatmentH1,
      fullWidth: true,
      section: "Tratamento na emergência",
      helperText: diagResult.grade === 1
        ? "Grau I (cutâneo isolado): anti-H1 pode ser 1ª linha. Para anafilaxia sistêmica, usar SÓ após estabilização hemodinâmica."
        : "⚠ Não substituem adrenalina. Usar apenas APÓS estabilização. Retardam diagnóstico se usados prematuramente.",
      suggestedValue: suggestions.h1Suggestion,
      suggestedLabel: `Sugestão: ${suggestions.h1Suggestion}`,
      presets: withSuggestedFirst([
        { label: "Não indicado na fase aguda — usar apenas após estabilização", value: "Não indicado na fase aguda" },
        { label: "Cetirizina 10 mg VO — 1ª geração, não sedante; usar após estabilização", value: "Cetirizina 10 mg VO após estabilização" },
        { label: "Loratadina 10 mg VO — não sedante; usar após estabilização", value: "Loratadina 10 mg VO após estabilização" },
        { label: "Difenidramina 25–50 mg EV/IM — 1ª geração (sedante); apenas se VO inviável", value: "Difenidramina 25–50 mg EV/IM (adjuvante, sedante)" },
        { label: "Ranitidina 50 mg EV (anti-H2) — associar ao anti-H1 em urticária/angioedema persistente", value: "Ranitidina 50 mg EV (anti-H2 associado)" },
      ], suggestions.h1Suggestion),
    },
    {
      id: "treatmentCorticoid",
      label: "Corticoide (adjuvante — não 1ª linha)",
      value: a.treatmentCorticoid,
      fullWidth: true,
      section: "Tratamento na emergência",
      helperText: "⚠ Não previnem recorrência bifásica de forma confiável. Ação tardia (horas). Usar como adjuvante, nunca substituindo adrenalina.",
      suggestedValue: suggestions.corticoidSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.corticoidSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Não indicado de rotina — usar apenas como adjuvante em casos selecionados", value: "Não indicado de rotina" },
        { label: "Hidrocortisona 200–500 mg EV — adjuvante em broncoespasmo / reação prolongada", value: "Hidrocortisona 200 mg EV (adjuvante)" },
        { label: "Metilprednisolona 1–2 mg/kg EV (máx 125 mg) — broncoespasmo grave ou asma associada", value: "Metilprednisolona 1–2 mg/kg EV (máx 125 mg)" },
        { label: "Dexametasona 10 mg EV — alternativa; menor risco de supressão adrenal", value: "Dexametasona 10 mg EV (adjuvante)" },
        { label: "Prednisolona 40–60 mg VO — se via oral possível após estabilização", value: "Prednisolona 40–60 mg VO (após estabilização)" },
      ], suggestions.corticoidSuggestion),
    },
    {
      id: "treatmentVasopressor",
      label: "Vasopressor / droga vasoativa",
      value: a.treatmentVasopressor,
      fullWidth: true,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: flags.shock
        ? "⚠ Choque presente — indicar vasopressor se refratário a ≥ 2 doses de adrenalina IM + volume adequado. Adrenalina EV é 1ª escolha; noradrenalina como 2ª linha. Glucagon se em uso de betabloqueador."
        : "Reservado para choque refratário a adrenalina IM e reposição volêmica adequada.",
      suggestedValue: suggestions.vasopressorSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.vasopressorSuggestion}`,
      presets: [
        { label: "Não indicado — hemodinâmica responsiva à adrenalina IM e volume", value: "Não indicado" },
        { label: "Adrenalina EV infusão — 0,05–0,1 mcg/kg/min (titular em UTI); 1ª linha no choque refratário", value: "Adrenalina EV 0,05–0,1 mcg/kg/min (infusão)" },
        { label: "Noradrenalina EV infusão — 0,1–0,3 mcg/kg/min; vasopressor de 2ª linha", value: "Noradrenalina EV 0,1–0,3 mcg/kg/min (2ª linha)" },
        { label: "Dopamina EV — 5–20 mcg/kg/min; alternativa se noradrenalina indisponível", value: "Dopamina EV 5–20 mcg/kg/min" },
        { label: "Vasopressina 0,03–0,04 U/min EV — associar se refratário a catecolaminas", value: "Vasopressina 0,03 U/min EV (refratário)" },
        { label: "Glucagon 1–2 mg EV/IM — específico se em uso de betabloqueador (reverte o bloqueio)", value: "Glucagon 1–2 mg EV/IM (betabloqueador)" },
        { label: "Metoxamina ou fenilefrina — vasopressor puro (sem inotropismo); considerar em taquicardia grave", value: "Fenilefrina / Metoxamina (vasopressor puro)" },
      ],
    },

    {
      id: "clinicalResponse",
      label: "Resposta ao tratamento",
      value: a.clinicalResponse,
      fullWidth: true,
      section: "Evolução e destino",
      helperText: "Registre a resposta após adrenalina IM + medidas iniciais. Avalie em 5–10 min.",
      presets: [
        { label: "Melhora completa — hemodinâmica e respiratória estáveis após 1ª dose de adrenalina", value: "Melhora completa após 1ª dose" },
        { label: "Melhora parcial — melhora dos sintomas mas mantém monitorização; pode precisar 2ª dose", value: "Melhora parcial — necessita monitorização" },
        { label: "Resposta lenta — melhora progressiva em 15–30 min; manter observação ativa", value: "Resposta lenta (melhora em 15–30 min)" },
        { label: "Sem resposta — refratário após 2 doses de adrenalina IM; acionar suporte avançado", value: "Sem resposta — refratário às doses IM" },
        { label: "Piora progressiva — deterioração hemodinâmica / respiratória; necessita UTI", value: "Piora progressiva — necessita UTI" },
        { label: "Reação bifásica — recrudescimento após intervalo livre; re-iniciar protocolo", value: "Reação bifásica — recrudescimento" },
      ],
    },
    {
      id: "observationPlan",
      label: "Plano de observação — tempo e local",
      value: a.observationPlan,
      fullWidth: true,
      section: "Evolução e destino",
      placeholder: "Ex.: 6 h em sala de observação monitorizada…",
      suggestedValue: suggestions.observationSuggestion,
      suggestedLabel: `Sugestão por contexto: ${suggestions.observationSuggestion}`,
      helperText: (() => {
        const rv = (a.clinicalResponse ?? "").toLowerCase();
        if (!rv) return "Preencha a resposta ao tratamento acima para sugestão personalizada de tempo e local.";
        if (rv.includes("sem melhora") || rv.includes("piora")) return "⚠ Sem melhora/piora — manter em observação monitorizada e reavaliar conduta.";
        if (rv.includes("parcial")) return "Resposta parcial — observação mínima 6–12 h em área monitorizada; reavaliar em 30–60 min.";
        if (rv.includes("melhora")) {
          if (suggestions.flags.shock || suggestions.flags.airway || hasTwoImDosesRecorded(a))
            return "Melhora após quadro grave — mínimo 12 h em observação monitorizada (risco de reação bifásica).";
          if (diagResult.grade === 2) return "Melhora após Grau II — mínimo 6 h em sala de observação com monitorização.";
          return "Melhora após Grau I — mínimo 2 h em observação clínica; alta se assintomático e acesso à emergência garantido.";
        }
        return "";
      })(),
      presets: withSuggestedFirst([
        { label: "2 h em observação clínica / triagem — baixo risco, Grau I, resolução completa", value: "2 h em sala de observação clínica. Alta se assintomático e acesso à emergência garantido." },
        { label: "6 h em observação monitorizada — Grau II ou múltiplos fatores de risco", value: "≥ 6 h em sala de observação com monitorização (ECG, SpO₂, PA seriada). Alta somente se estável." },
        { label: "12 h em observação monitorizada — Grau III/IV, choque, 2 doses de adrenalina", value: "≥ 12 h em sala de observação monitorizada (ECG, SpO₂, PA contínuos). Avaliar necessidade de UTI." },
        { label: "Internação em UTI — choque refratário, IOT, instabilidade persistente", value: "Internação em UTI. Monitorização invasiva e suporte avançado contínuo." },
        { label: "Manter em emergência e reavaliar — resposta parcial ou sem melhora", value: "Manter em sala de emergência. Reavaliar em 30–60 min. Considerar escalonamento." },
        { label: "24 h de monitorização — reação bifásica prévia, gatilho idiopático ou comorbidade grave", value: "Monitorização prolongada por 24 h em área com suporte de emergência disponível." },
      ], suggestions.observationSuggestion),
    },
    {
      id: "destination",
      label: "Destino — sugerido por contexto",
      value: a.destination,
      fullWidth: true,
      section: "Evolução e destino",
      suggestedValue: suggestions.destinationSuggestion,
      suggestedLabel: `Sugestão por contexto: ${suggestions.destinationSuggestion}`,
      helperText: (() => {
        const rv = (a.clinicalResponse ?? "").toLowerCase();
        if (!rv) return "Preencha a resposta ao tratamento para sugestão personalizada de destino.";
        const f = suggestions.flags;
        if (f.coma || f.airway) return "⚠ Via aérea comprometida ou rebaixamento — UTI indicada independentemente da resposta.";
        if (rv.includes("sem melhora") || rv.includes("piora")) return "⚠ Sem melhora / piora — não liberar. Reavaliar conduta e acionar suporte.";
        if (rv.includes("parcial")) return "Resposta parcial — manter em observação monitorizada. Não liberar ainda.";
        if (rv.includes("melhora")) {
          if (diagResult.grade >= 3 || hasTwoImDosesRecorded(a)) return "Melhora após quadro grave — internação em observação monitorizada ≥ 12 h antes de considerar alta.";
          if (diagResult.grade === 2) return "Melhora após Grau II — observação ≥ 6 h antes da alta. Verificar estabilidade e autoinjetor.";
          return "Melhora após Grau I — alta possível após ≥ 2 h de observação clínica sem sintomas sistêmicos.";
        }
        return "";
      })(),
      presets: withSuggestedFirst([
        { label: "Alta com orientações — Grau I, melhora completa ≥ 2 h, baixo risco", value: "Alta com orientações" },
        { label: "Alta após observação de 6 h — Grau II, melhora clara, estável", value: "Alta após observação de 6 h em área monitorizada" },
        { label: "Observação monitorizada ≥ 12 h — Grau III, choque ou 2 doses de adrenalina", value: "Internação em sala de observação monitorizada (≥ 12 h)" },
        { label: "UTI — choque refratário, IOT, instabilidade, Grau IV", value: "UTI / sala de emergência avançada" },
        { label: "Manter na emergência — resposta parcial ou sem melhora", value: "Manter em sala de emergência — reavaliar conduta" },
        { label: "Emergência com suporte avançado — via aérea comprometida", value: "Sala de emergência com suporte de via aérea avançada disponível" },
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
    (() => {
      // Build context-aware exam list — always include triptase aguda (recommended for diagnosis)
      const indicatedExams: string[] = [
        "Triptase aguda — colher até 2 h do início (recomendado para diagnóstico)",
        "Triptase basal — colher 24–72 h após o episódio",
        "Hemograma completo — admissão",
        "Glicemia — admissão",
        "Eletrólitos (Na, K) — admissão",
        "Ureia e creatinina — admissão",
        "ECG — admissão",
      ];
      if (flags.shock) indicatedExams.push("Lactato sérico — se choque ou hipoperfusão");
      if (flags.respiratoryFailure || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 92)) {
        indicatedExams.push("Gasometria arterial — dispneia grave ou SpO₂ < 92%");
      }
      const symptoms = (a.symptoms ?? "").toLowerCase();
      if (symptoms.includes("dor torácica") || symptoms.includes("peito")) {
        indicatedExams.push("Troponina — suspeita de síndrome de Kounis (dor torácica + anafilaxia)");
      }
      const suggestedInvestigation = indicatedExams.join(" | ");

      return {
        id: "investigationPlan",
        label: "Exames solicitados e tempos de coleta",
        value: a.investigationPlan,
        fullWidth: true,
        presetMode: "toggle_token" as const,
        section: "Sinais vitais e exame clínico",
        helperText: "⚠ Triptase aguda: colher AGORA — janela de 2 h do início dos sintomas. Selecione todos os exames indicados.",
        suggestedValue: suggestedInvestigation,
        suggestedLabel: "Sugestão: selecionar todos os indicados para este caso",
        presets: [
          { label: "⭐ Triptase aguda — colher AGORA (até 2 h do início) — recomendado para diagnóstico", value: "Triptase aguda — colher até 2 h do início (recomendado para diagnóstico)" },
          { label: "Triptase basal — colher 24–72 h após (comparação diagnóstica)", value: "Triptase basal — colher 24–72 h após o episódio" },
          { label: "Hemograma completo — admissão", value: "Hemograma completo — admissão" },
          { label: "Glicemia — admissão", value: "Glicemia — admissão" },
          { label: "Eletrólitos (Na, K) — admissão", value: "Eletrólitos (Na, K) — admissão" },
          { label: "Função renal (ureia, creatinina) — admissão", value: "Ureia e creatinina — admissão" },
          { label: "ECG — admissão", value: "ECG — admissão" },
          { label: "Gasometria arterial — dispneia grave ou SpO₂ < 92%", value: "Gasometria arterial — dispneia grave ou SpO₂ < 92%" },
          { label: "Troponina — suspeita de síndrome de Kounis (dor torácica + anafilaxia)", value: "Troponina — suspeita de síndrome de Kounis (dor torácica + anafilaxia)" },
          { label: "Lactato sérico — choque ou hipoperfusão", value: "Lactato sérico — se choque ou hipoperfusão" },
          { label: "Coagulograma — choque grave ou suspeita de CID", value: "Coagulograma — choque grave ou suspeita de CID" },
          { label: "RX de tórax — dispneia grave ou pós-intubação", value: "RX de tórax — dispneia grave ou pós-intubação" },
        ],
      };
    })(),
    ...((() => {
      const dest = (a.destination ?? suggestions.destinationSuggestion ?? "").toLowerCase();
      const isDischarge = dest.includes("alta");
      if (!isDischarge) return [];

      const isDrug = isLikelyDrugInducedAvoidable(a);
      const isFood = (a.exposureType ?? "").toLowerCase().includes("aliment");
      const isInsect = (a.exposureType ?? "").toLowerCase().includes("veneno") || (a.exposureType ?? "").toLowerCase().includes("inseto");
      const isIdiopathic = isUnknownOrIdiopathicTrigger(a);
      const needsAutoinjector = !isDrug;

      const lines: string[] = [];
      if (needsAutoinjector) {
        lines.push("💉 Prescrever 2 autoinjetores de adrenalina. Treinar paciente e familiar no uso correto antes da alta.");
      } else {
        lines.push("💊 Reação medicamentosa: documentar alergia no prontuário e orientar evicção do fármaco e classe com reatividade cruzada.");
      }
      if (isFood) {
        lines.push("🍽 Orientar leitura de rótulos, evicção rigorosa do alimento suspeito e atenção em restaurantes. Plano de ação escrito.");
      } else if (isInsect) {
        lines.push("🐝 Orientar evicção de ambientes com insetos, uso de roupas protetoras e carregar autoinjetor sempre. Considerar imunoterapia com veneno.");
      } else if (isIdiopathic) {
        lines.push("❓ Gatilho não identificado — encaminhar para alergologia para investigação etiológica completa. Risco de recorrência.");
      }
      lines.push("📋 Entregar plano de ação escrito com: quando usar o autoinjetor, como usá-lo, quando chamar emergência e orientações de retorno.");
      lines.push("🔄 Orientar retorno imediato ao pronto-socorro se recorrência dos sintomas (reação bifásica pode ocorrer em até 72 h).");
      lines.push("🏥 Encaminhar para alergologia/imunologia para investigação definitiva, testes cutâneos e imunoterapia se indicada.");
      if (suggestions.diagResult.grade >= 3 || suggestions.flags.shock) {
        lines.push("⚠ Quadro grave — reforçar urgência do encaminhamento especializado e importância de nunca sair sem autoinjetor.");
      }

      return [{
        id: "freeNotes",
        label: "Orientações de alta para este caso",
        value: a.freeNotes,
        fullWidth: true,
        section: "Evolução e destino",
        helperText: lines.join("\n"),
        presets: [
          { label: "✓ Autoinjetor prescrito e treinamento realizado", value: "Autoinjetor prescrito e treinamento realizado" },
          { label: "✓ Plano de ação escrito entregue ao paciente", value: "Plano de ação escrito entregue" },
          { label: "✓ Orientado retorno imediato se recorrência", value: "Orientado retorno imediato se recorrência" },
          { label: "✓ Encaminhamento para alergologia realizado", value: "Encaminhamento para alergologia realizado" },
          { label: "✓ Alergia documentada no prontuário", value: "Alergia documentada no prontuário" },
          { label: "✓ Familiar/acompanhante orientado", value: "Familiar/acompanhante orientado" },
        ],
      }];
    })()),
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "atendimento") return null;
  const a = session.assessment;
  const suggestions = buildTreatmentSuggestions(a);
  const { flags, diagResult } = suggestions;

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
    actions: [],
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
  const suggestions = buildTreatmentSuggestions(a);
  const { diagResult } = suggestions;

  const gradeLabel =
    diagResult.grade === 4 ? "Grau IV — Choque anafilático" :
    diagResult.grade === 3 ? "Grau III — Anafilaxia grave" :
    diagResult.grade === 2 ? "Grau II — Anafilaxia moderada" :
    diagResult.grade === 1 ? "Grau I — Reação alérgica isolada" :
    "Avaliação incompleta";

  const lines = [
    "════════════════════════════════════════",
    "   RESUMO CLÍNICO — ANAFILAXIA",
    `   ${new Date().toLocaleString("pt-BR")}`,
    "════════════════════════════════════════",
    "",
    "── PACIENTE ─────────────────────────────",
    `Idade: ${a.age || "—"}    Sexo: ${a.sex || "—"}    Peso: ${a.weightKg ? a.weightKg + " kg" : "—"}    Altura: ${a.heightCm ? a.heightCm + " cm" : "—"}`,
    "",
    "── EXPOSIÇÃO ────────────────────────────",
    `Gatilho: ${a.exposureType || "—"}${a.exposureDetail ? " — " + a.exposureDetail : ""}`,
    `Tempo desde o início: ${a.timeOnsetMin ? a.timeOnsetMin + " min" : "—"}`,
    "",
    "── QUADRO CLÍNICO ───────────────────────",
    `Classificação: ${gradeLabel}`,
    `Manifestações: ${a.symptoms || "—"}`,
    "",
    "── SINAIS VITAIS ────────────────────────",
    `PA: ${a.systolicPressure || "—"}/${a.diastolicPressure || "—"} mmHg`,
    `FC: ${a.heartRate || "—"} bpm    SpO₂: ${a.spo2 ? a.spo2 + "%" : "—"}`,
    `GCS: ${a.gcs || "—"}`,
    "",
    "── CONDUTAS REALIZADAS ──────────────────",
    `Adrenalina: ${a.treatmentAdrenaline || "—"}`,
    `O₂ / via aérea: ${a.treatmentAirway || a.treatmentO2 || "—"}`,
    `Volume / cristalóide: ${a.treatmentFluids || "—"}`,
    `Acesso venoso: ${a.treatmentIvAccess || "—"}`,
    `Monitorização: ${a.treatmentMonitoring || "—"}`,
    `Salbutamol: ${a.treatmentSalbutamol || "—"}`,
    `Vasopressor / vasoativo: ${a.treatmentVasopressor || "—"}`,
    `Adjuvantes: ${a.treatmentH1 || a.treatmentCorticoid ? [a.treatmentH1, a.treatmentCorticoid].filter(Boolean).join("; ") : "—"}`,
    "",
    "── EVOLUÇÃO ─────────────────────────────",
    `Resposta ao tratamento: ${a.clinicalResponse || "—"}`,
    `Plano de observação: ${a.observationPlan || "—"}`,
    `Destino: ${a.destination || "—"}`,
    `Alta / autoinjetor: ${a.dischargePlan || "—"}`,
    `Investigação: ${a.investigationPlan || "—"}`,
    `Notas: ${a.freeNotes || "—"}`,
    "",
    "════════════════════════════════════════",
    "App de Emergência Clínica — Uso profissional",
    "Conteúdo de apoio; seguir protocolo institucional.",
    "════════════════════════════════════════",
  ];

  return lines.join("\n");
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
