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
import type {
  ClinicalCoreAction,
  ClinicalCoreAlert,
  ClinicalCoreHypothesis,
  ClinicalCoreProtocolActivation,
  ClinicalCoreWorkflowSnapshot,
  ClinicalCoreWorkflowStep,
} from "./core/clinical-workflow";

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
  dischargeAutoInjectorReady: string;
  dischargeTrainingDone: string;
  dischargeSupervisionReady: string;
  dischargeEmergencyAccess: string;
  dischargeOralTolerance: string;
  dischargeOrthostaticCheck: string;
  dischargeSeniorReview: string;
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
  return (
    a.symptoms.toLowerCase().includes("choque") ||
    a.symptoms.toLowerCase().includes("hipotens") ||
    a.symptoms.toLowerCase().includes("má perfusão")
  );
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

function hasAnyImDoseRecorded(a: Assessment): boolean {
  const t = a.treatmentAdrenaline.toLowerCase();
  return (
    t.includes("mg im") ||
    t.includes("1ª dose") ||
    t.includes("1a dose") ||
    t.includes("primeira dose") ||
    t.includes("adrenalina im")
  );
}

function hasAdrenalineInfusionRecorded(a: Assessment): boolean {
  const t = a.treatmentAdrenaline.toLowerCase();
  return (
    t.includes("infusão") ||
    t.includes("infusao") ||
    t.includes("mcg/kg/min") ||
    t.includes("adrenalina ev")
  );
}

function getRecordedImDoseCount(a: Assessment): number {
  if (hasTwoImDosesRecorded(a)) return 2;
  if (hasAnyImDoseRecorded(a)) return 1;
  return 0;
}

function hasSupplementalOxygenRecorded(a: Assessment): boolean {
  const text = `${a.treatmentO2} | ${a.treatmentAirway}`.toLowerCase();
  return (
    text.includes("cateter nasal") ||
    text.includes("máscara") ||
    text.includes("mascara") ||
    text.includes("alto fluxo") ||
    text.includes("reservatório") ||
    text.includes("reservatorio") ||
    text.includes("bvm") ||
    text.includes("bolsa-válvula-máscara")
  );
}

function hasAirwayPreparationRecorded(a: Assessment): boolean {
  const text = a.treatmentAirway.toLowerCase();
  return (
    text.includes("prontidão") ||
    text.includes("prontidao") ||
    text.includes("preparar sequência rápida") ||
    text.includes("preparar sequencia rapida") ||
    text.includes("bvm em standby")
  );
}

type EvolutionFlowSummary = {
  currentPhase: string;
  currentWindow: string;
  currentFocus: string[];
  nextPhase: string;
  nextWindow: string;
  nextActions: string[];
};

function buildEvolutionFlowSummary(a: Assessment, suggestions: ReturnType<typeof buildTreatmentSuggestions>): EvolutionFlowSummary {
  const doseCount = getRecordedImDoseCount(a);
  const oxygenInUse = hasSupplementalOxygenRecorded(a);
  const airwayPrepared = hasAirwayPreparationRecorded(a);
  const airwaySecured = isAirwaySecured(a);
  const responseVal = (a.clinicalResponse ?? "").toLowerCase();
  const hasClearImprovement = responseVal.includes("melhora clara") || responseVal.includes("melhora completa");
  const hasPartialResponse = responseVal.includes("parcial") || responseVal.includes("resposta lenta");
  const hasNoImprovement = responseVal.includes("sem melhora") || responseVal.includes("sem resposta") || responseVal.includes("piora");
  const { flags } = suggestions;

  if (doseCount === 0) {
    return {
      currentPhase: "Fase 1 — atendimento inicial",
      currentWindow: "Agora",
      currentFocus: [
        "Aplicar 1ª dose de adrenalina IM imediatamente se anafilaxia está indicada.",
        oxygenInUse ? "Manter o O₂ já em uso e titular para SpO₂ 94–98%." : `Definir suporte de O₂ agora: ${suggestions.oxygenSuggestion}.`,
        airwaySecured
          ? "Via aérea avançada já estabelecida; seguir vigilância ventilatória."
          : airwayPrepared
            ? "Via aérea já preparada; proceder apenas se houver piora respiratória ou falha de resposta."
            : "Decidir se apenas observa com O₂ ou se já deixa a via aérea preparada conforme gravidade.",
      ],
      nextPhase: "Fase 2 — reavaliação após 1ª dose",
      nextWindow: "Reavaliar em 5 minutos após a 1ª dose",
      nextActions: [
        "Checar PA, SpO₂, FR, ausculta, estridor, fadiga e perfusão.",
        "Se melhora clara: manter O₂ conforme necessidade e migrar para observação.",
        "Se melhora parcial, sem melhora ou piora: indicar 2ª dose de adrenalina IM e reavaliar necessidade de escalonamento.",
      ],
    };
  }

  if (doseCount === 1 && !hasClearImprovement) {
    return {
      currentPhase: "Fase 2 — pós-1ª dose de adrenalina",
      currentWindow: "Janela crítica dos primeiros 5 minutos",
      currentFocus: [
        oxygenInUse ? "Manter o O₂ já selecionado, titulando para SpO₂ 94–98%." : `Se ainda não fez, iniciar O₂ agora: ${suggestions.oxygenSuggestion}.`,
        airwaySecured
          ? "Via aérea já assegurada; seguir ventilação e monitorização."
          : flags.coma || flags.airway || flags.respiratoryFailure
            ? "Manter ISR/IOT preparada; intubar se houver piora, fadiga, hipoxemia refratária ou perda iminente da via aérea."
            : "Sem IOT imediata; manter material e equipe prontos se o quadro evoluir.",
        "Monitorizar resposta hemodinâmica e respiratória sem atrasar o próximo passo.",
      ],
      nextPhase: "Fase 3 — decisão após a reavaliação da 1ª dose",
      nextWindow: "Ao completar 5 minutos da 1ª dose",
      nextActions: [
        "Se persistirem sinais respiratórios, hemodinâmicos ou resposta apenas parcial: aplicar 2ª dose de adrenalina IM.",
        "Se houver deterioração antes dos 5 minutos: escalar suporte imediatamente, inclusive via aérea, sem esperar o relógio.",
        "Se houver melhora clara: manter O₂ conforme necessidade e avançar para observação monitorizada.",
      ],
    };
  }

  if (doseCount >= 2 && !hasClearImprovement) {
    return {
      currentPhase: "Fase 3 — pós-2ª dose de adrenalina",
      currentWindow: "Nova reavaliação imediata em até 5 minutos após a 2ª dose",
      currentFocus: [
        oxygenInUse ? "Manter e titular o O₂ já instituído; não retirar suporte nesta fase." : `Instituir O₂ agora se ainda ausente: ${suggestions.oxygenSuggestion}.`,
        airwaySecured
          ? "Via aérea avançada já feita; reavaliar ventilação e perfusão enquanto define suporte vasoativo."
          : flags.coma || flags.airway || flags.respiratoryFailure
            ? "Se não houver melhora rápida após a 2ª dose, a decisão de IOT deve ser retomada imediatamente."
            : "Mesmo sem IOT, manter a via aérea preparada se persistirem sinais de risco.",
        hasAdrenalineInfusionRecorded(a)
          ? "Infusão de adrenalina já registrada; titular pela resposta clínica."
          : "Se seguir refratário após a 2ª dose e volume adequado, evoluir para adrenalina EV em infusão.",
      ],
      nextPhase: "Fase 4 — refratariedade ou recuperação",
      nextWindow: "Após a nova reavaliação de 5 minutos da 2ª dose",
      nextActions: [
        hasAdrenalineInfusionRecorded(a)
          ? "Se ainda instável apesar da infusão, considerar vasopressor complementar, UTI e revisão de diagnóstico diferencial."
          : "Se continuar instável: iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min e levar para ambiente de suporte avançado.",
        "Se mantiver falha ventilatória, estridor progressivo, fadiga ou hipoxemia refratária: proceder à IOT/estratégia definitiva.",
        "Se houver melhora clara após a 2ª dose: manter observação prolongada e não reduzir vigilância precocemente.",
      ],
    };
  }

  if (doseCount >= 2 && hasClearImprovement) {
    return {
      currentPhase: "Fase 4 — resposta após 2ª dose",
      currentWindow: "Pós-estabilização inicial",
      currentFocus: [
        oxygenInUse ? "Reduzir O₂ apenas se a saturação permanecer estável; não retirar abruptamente." : "O₂ não está registrado; usar apenas se necessário nesta fase.",
        airwaySecured ? "Via aérea avançada mantém o paciente em via de terapia intensiva/observação avançada." : "Sem necessidade imediata de IOT se houve recuperação sustentada.",
        "Manter monitorização contínua e procurar sinais de recorrência ou reação bifásica.",
      ],
      nextPhase: "Fase 5 — observação e destino",
      nextWindow: "Após estabilidade sustentada",
      nextActions: [
        "Definir tempo de observação conforme gravidade e número de doses usadas.",
        "Encaminhar para UTI/observação monitorizada se quadro grave, múltiplas doses ou via aérea avançada.",
        "Só discutir alta após resolução sustentada e plano seguro documentado.",
      ],
    };
  }

  return {
    currentPhase: "Fase 3 — resposta inicial após 1ª dose",
    currentWindow: "Pós-reavaliação imediata",
    currentFocus: [
      oxygenInUse ? "Manter ou desmamar O₂ conforme saturação e clínica." : "O₂ apenas se necessário nesta fase.",
      airwaySecured ? "Via aérea já tratada; seguir suporte avançado conforme necessidade." : "Sem indicação imediata de IOT se a melhora for sustentada.",
      "Monitorização ainda obrigatória nas próximas horas.",
    ],
    nextPhase: "Fase 4 — observação e prevenção de recorrência",
    nextWindow: "Após estabilização clínica",
    nextActions: [
      "Definir observação mínima conforme gravidade.",
      "Reavaliar periodicamente para detectar recaída precoce.",
      "Formalizar destino e orientações de alta apenas após estabilidade sustentada.",
    ],
  };
}

function isLikelyDrugInducedAvoidable(a: Assessment): boolean {
  return a.exposureType.toLowerCase().includes("medicamento");
}

function isUnknownOrIdiopathicTrigger(a: Assessment): boolean {
  const exposure = a.exposureType.toLowerCase();
  return exposure.includes("desconhecido") || exposure.includes("idiop");
}

function isAutoInjectorRequired(a: Assessment): boolean {
  const diagResult = buildDiagnosticResult(a);
  return diagResult.grade >= 2 && !isLikelyDrugInducedAvoidable(a);
}

function isChecklistReady(value: string): boolean {
  const v = value.toLowerCase();
  return v.includes("sim") || v.includes("pronto") || v.includes("adequado") || v.includes("confirmado");
}

function hasSafeDischargeChecklist(a: Assessment): boolean {
  const autoInjectorReady = isChecklistReady(a.dischargeAutoInjectorReady);
  const autoInjectorNotRequired =
    a.dischargeAutoInjectorReady.toLowerCase().includes("não se aplica") ||
    a.dischargeAutoInjectorReady.toLowerCase().includes("nao se aplica") ||
    a.dischargeAutoInjectorReady.toLowerCase().includes("não indicado") ||
    a.dischargeAutoInjectorReady.toLowerCase().includes("nao indicado");
  return (
    isChecklistReady(a.dischargeTrainingDone) &&
    isChecklistReady(a.dischargeSupervisionReady) &&
    isChecklistReady(a.dischargeEmergencyAccess) &&
    isChecklistReady(a.dischargeOralTolerance) &&
    isChecklistReady(a.dischargeOrthostaticCheck) &&
    isChecklistReady(a.dischargeSeniorReview) &&
    (isAutoInjectorRequired(a) ? autoInjectorReady : autoInjectorReady || autoInjectorNotRequired)
  );
}

function getDischargeChecklistMissingItems(a: Assessment): string[] {
  const missing: string[] = [];
  const autoInjectorReady = isChecklistReady(a.dischargeAutoInjectorReady);
  const autoInjectorNotRequired =
    a.dischargeAutoInjectorReady.toLowerCase().includes("não se aplica") ||
    a.dischargeAutoInjectorReady.toLowerCase().includes("nao se aplica") ||
    a.dischargeAutoInjectorReady.toLowerCase().includes("não indicado") ||
    a.dischargeAutoInjectorReady.toLowerCase().includes("nao indicado");
  if (!(isAutoInjectorRequired(a) ? autoInjectorReady : autoInjectorReady || autoInjectorNotRequired)) {
    missing.push("autoinjetor");
  }
  if (!isChecklistReady(a.dischargeTrainingDone)) missing.push("treinamento");
  if (!isChecklistReady(a.dischargeSupervisionReady)) missing.push("supervisão");
  if (!isChecklistReady(a.dischargeEmergencyAccess)) missing.push("acesso à emergência");
  if (!isChecklistReady(a.dischargeOralTolerance)) missing.push("via oral");
  if (!isChecklistReady(a.dischargeOrthostaticCheck)) missing.push("ortostatismo");
  if (!isChecklistReady(a.dischargeSeniorReview)) missing.push("revisão clínica final");
  return missing;
}

function isDischargeBlockedByContext(a: Assessment): boolean {
  const diagResult = buildDiagnosticResult(a);
  const response = (a.clinicalResponse ?? "").toLowerCase();
  const destination = (a.destination ?? "").toLowerCase();
  const hasCompleteImprovement = response.includes("melhora completa");

  if (!hasCompleteImprovement) return true;
  if (getSeverityFlags(a).shock || getSeverityFlags(a).airway || getSeverityFlags(a).coma) return true;
  if (getRecordedImDoseCount(a) > 1) return true;
  if (isUnknownOrIdiopathicTrigger(a)) return true;
  if (
    destination.includes("observação") ||
    destination.includes("observacao") ||
    destination.includes("emergência") ||
    destination.includes("emergencia") ||
    destination.includes("uti") ||
    destination.includes("internação") ||
    destination.includes("internacao")
  ) return true;
  return diagResult.grade >= 3;
}

function hasAirwaySevere(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("estridor") ||
    s.includes("edema de glote") ||
    s.includes("obstrução de via aérea") ||
    s.includes("via aérea") ||
    s.includes("dispneia grave")
  );
}

function hasAirwayWarning(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    hasAirwaySevere(a) ||
    s.includes("edema de língua") ||
    s.includes("edema de lábios") ||
    s.includes("rouquidão") ||
    s.includes("disfonia") ||
    s.includes("sensação de obstrução de via aérea")
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

function getOxygenSupportSuggestion(a: Assessment, flags: ReturnType<typeof getSeverityFlags>): string {
  const spo2 = parseNum(a.spo2);
  if (flags.airway || flags.shock || flags.coma || (spo2 != null && spo2 < 90)) {
    return "Máscara com reservatório 10–15 L/min agora; titular para SpO₂ 94–98%";
  }
  if (flags.respiratoryFailure || flags.airwayWarning || (spo2 != null && spo2 < 94)) {
    return "Máscara com reservatório 10–15 L/min; reavaliar resposta em 5 min e escalar se necessário";
  }
  if (spo2 != null && spo2 < 98) {
    return "Cateter nasal 2–5 L/min; titular para SpO₂ 94–98%";
  }
  return "Sem O₂ adicional se SpO₂ adequada em ar ambiente; alvo SpO₂ 94–98%";
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
    airwayWarning: hasAirwayWarning(a),
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
    s.includes("edema de lábios") ||
    s.includes("edema de língua") ||
    s.includes("pele")
  );
}

function hasGiSymptoms(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("náusea") ||
    s.includes("vômito") ||
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
    s.includes("tontura") ||
    s.includes("hipotens") ||
    s.includes("pulso filiforme") ||
    s.includes("extremidades frias") ||
    s.includes("má perfusão") ||
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

  // Grade 4 — Anaphylactic shock
  if (hasShock(a)) {
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

  // Grade 3 — Severe anaphylaxis (airway compromise, severe hypoxemia or severe neurologic compromise)
  if (hasAirwaySevere(a) || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 92) || hasCyanosis(a) || hasComaOrSevereNeuro(a)) {
    const hasSevereNeuro = hasComaOrSevereNeuro(a);
    return {
      grade: 3,
      label: "Anafilaxia grave",
      sublabel: hasSevereNeuro
        ? "Comprometimento neurológico importante e/ou falência respiratória grave"
        : "Via aérea comprometida e/ou insuficiência respiratória grave",
      criteriaText: hasSevereNeuro
        ? "Estridor, edema de glote, SpO₂ < 92%, cianose ou GCS ≤ 8 — anafilaxia grave com risco iminente, exigindo suporte avançado imediato."
        : "Estridor, edema de glote, SpO₂ < 92% ou cianose — comprometimento grave de via aérea ou insuficiência respiratória com risco iminente.",
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
  const hasKnownAllergen =
    a.exposureType.trim().length > 0 &&
    !a.exposureType.toLowerCase().includes("desconhecido") &&
    !a.exposureType.toLowerCase().includes("idiop");
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
  const doseCount = getRecordedImDoseCount(a);

  const responseVal = (a.clinicalResponse ?? "").toLowerCase();
  const hasResponseAssessment = responseVal.trim().length > 0;
  const hasClearImprovement = responseVal.includes("melhora clara") || responseVal.includes("melhora completa");
  const hasPartialResponse = responseVal.includes("parcial") || responseVal.includes("resposta lenta");
  const hasNoImprovement = responseVal.includes("sem melhora") || responseVal.includes("sem resposta") || responseVal.includes("piora");
  const needsSecondImDose =
    diagResult.adrenalineUrgency === "immediate" &&
    doseCount === 1 &&
    hasResponseAssessment &&
    (hasPartialResponse || hasNoImprovement);
  const needsAdrenalineInfusion =
    flags.shock &&
    doseCount >= 2 &&
    !hasAdrenalineInfusionRecorded(a) &&
    hasResponseAssessment &&
    (hasNoImprovement || hasPartialResponse);

  const adrenalineSuggestion =
    diagResult.grade === 1
      ? "Não indicada no momento — reação cutânea/GI isolada sem critérios de anafilaxia. Ter disponível; administrar imediatamente se envolvimento sistêmico"
      : diagResult.grade === 0
        ? `${adrDose} — preencha avaliação para dose precisa`
        : needsAdrenalineInfusion
          ? "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min — refratário após 2 doses IM e reposição volêmica"
          : needsSecondImDose
            ? `${adrDose} IM — 2ª dose agora (5 min após a 1ª se resposta insuficiente)`
        : flags.shock || flags.airway || flags.respiratoryFailure
          ? `${adrDose} AGORA; reavaliar em 5 min e repetir se problemas ABC persistirem`
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
    ? `Ringer lactato ou SF 0,9% em alíquotas até ${fluidVolume}; reavaliar PA, perfusão e congestão após cada etapa. Em cardiopatia, disfunção renal ou risco de sobrecarga, usar volumes menores e titular.`
    : "Sem bolus de rotina; hidratação conforme resposta clínica";

  const vasopressorSuggestion =
    flags.shock && hasAdrenalineInfusionRecorded(a)
      ? "Noradrenalina EV em infusão — considerar apenas se choque persistir apesar de adrenalina EV titulada + volume adequado"
      : flags.shock && doseCount >= 2 && hasResponseAssessment && (hasNoImprovement || hasPartialResponse)
        ? "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min — primeira escolha no choque refratário após 2 doses IM + volume"
      : flags.shock
        ? "Ainda não indicar droga vasoativa antes de reavaliar resposta à adrenalina IM e ao volume"
        : "Não indicado no momento";

  const oxygenSuggestion = getOxygenSupportSuggestion(a, flags);

  const salbutamolSuggestion = flags.bronchospasm
    ? (w != null && w > 0 && w < 20)
      ? "Salbutamol nebulizado 2,5 mg — adjuvante se broncoespasmo persistir após adrenalina"
      : "Salbutamol nebulizado 5 mg — adjuvante se broncoespasmo persistir após adrenalina"
    : "Não realizado";

  const h1Suggestion =
    diagResult.grade === 1
      ? "Cetirizina VO após estabilização — preferir anti-H1 não sedante em reação cutânea isolada"
      : "Não usar na fase inicial em anafilaxia; considerar apenas após estabilização se prurido/urticária persistirem";
  const corticoidSuggestion = flags.bronchospasm || flags.respiratoryFailure
    ? "Não de rotina; considerar apenas como adjuvante se asma/broncoespasmo importante, reação prolongada ou preocupação de via aérea"
    : "Não indicado de rotina no atendimento inicial";
  const airwaySuggestion =
    flags.coma
      ? "Oxigênio alto fluxo + BVM se necessário; preparar ISR/IOT imediatamente por rebaixamento importante"
      : flags.airway || (spo2 != null && spo2 < 90)
        ? "Máscara com reservatório 10–15 L/min + adrenalina IM agora; preparar ISR/IOT e proceder se não houver melhora rápida ou se houver deterioração"
      : flags.respiratoryFailure
        ? "Máscara com reservatório 10–15 L/min + vigilância intensiva; preparar via aérea avançada se não melhorar após adrenalina ou se houver fadiga/piora"
        : flags.airwayWarning
          ? `${oxygenSuggestion} + observar resposta à adrenalina por 5 min; manter equipe e material prontos se houver progressão`
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
  const dischargeChecklistComplete = hasSafeDischargeChecklist(a);
  const dischargeChecklistMissing = getDischargeChecklistMissingItems(a);
  const hasHighRecurrenceRisk =
    hasTwoImDosesRecorded(a) ||
    flags.shock ||
    flags.airway ||
    flags.coma ||
    flags.respiratoryFailure ||
    isUnknownOrIdiopathicTrigger(a);
  // Plano de observação — considera resposta clínica + gravidade + local
  const observationSuggestion = (() => {
    if (!hasResponseAssessment) {
      if (doseCount === 0) return "Primeiro registrar resposta após a 1ª dose; até lá manter em sala de emergência com reavaliação em 5 min.";
      if (doseCount === 1) return "Reavaliar 5 min após a 1ª dose antes de definir tempo final de observação.";
      return "Após 2 doses IM, manter em área monitorizada enquanto define necessidade de infusão EV/UTI.";
    }
    if (hasNoImprovement || hasPartialResponse) {
      return doseCount >= 2
        ? "Manter em sala de emergência/área monitorizada contínua; reavaliar imediatamente para escalonamento (adrenalina EV, UTI e suporte avançado)."
        : "Manter em sala de emergência com monitorização contínua; reavaliar agora e considerar 2ª dose de adrenalina IM se ainda não feita.";
    }
    if (hasClearImprovement) {
      if (flags.shock || flags.airway || flags.coma || doseCount > 2) {
        return "≥ 12 h após resolução dos sintomas em área monitorizada/UTI, com ECG, SpO₂ e PA contínuos; não indicar alta precoce.";
      }
      if (hasHighRecurrenceRisk) {
        return "≥ 12 h após resolução dos sintomas em sala de observação monitorizada; risco aumentado de recorrência/bifásica.";
      }
      if (diagResult.grade === 2 || doseCount === 2) {
        return "≥ 6 h após resolução completa dos sintomas em área monitorizada; alta só se mantiver estabilidade sustentada ao final.";
      }
      if (diagResult.grade === 1 && doseCount <= 1) {
        return "Observação rápida por pelo menos 2 h após resolução dos sintomas; considerar alta apenas se mantiver-se completamente assintomático.";
      }
      return "≥ 6 h em sala de observação com monitorização. Estratificar risco antes da alta.";
    }
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
    const hasNoImprove = rv.includes("sem melhora") || rv.includes("sem resposta") || rv.includes("piora");

    if (!hasResponseAssessment) {
      if (flags.coma || flags.airway || flags.shock) return "Sala de emergência com suporte avançado / UTI em avaliação — ainda sem reavaliação terapêutica completa.";
      return "Permanecer em observação monitorizada até registrar resposta ao tratamento.";
    }
    if (flags.coma || (flags.shock && !hasClear) || flags.airway) {
      return "UTI / sala de emergência avançada — instabilidade hemodinâmica, comprometimento de via aérea ou rebaixamento.";
    }
    if (hasNoImprove) {
      return doseCount >= 2
        ? "UTI / sala de emergência avançada — refratário após doses IM; considerar adrenalina EV e suporte avançado."
        : "Sala de emergência monitorizada — ainda não apto para alta; reavaliar e considerar 2ª dose/adicional.";
    }
    if (hasPartial) {
      return hasHighRecurrenceRisk
        ? "Internação em área monitorizada / observação prolongada — resposta parcial e risco aumentado; não liberar."
        : "Sala de observação monitorizada — resposta parcial; manter vigilância e não liberar ainda.";
    }
    if (hasClear) {
      if (flags.shock || flags.airway || flags.coma) {
        return "Internação em UTI ou área monitorizada de alta complexidade — melhora inicial não autoriza alta após quadro grave.";
      }
      if (diagResult.grade >= 3 || hasHighRecurrenceRisk) {
        return "Internação/observação monitorizada prolongada (idealmente ≥ 12 h) — manter por risco de recorrência e gravidade prévia.";
      }
      if (diagResult.grade === 2) {
        return dischargeChecklistComplete
          ? "Observação em área monitorizada por ≥ 6 h; considerar alta apenas se permanecer assintomático, estável e com checklist de segurança completo."
          : `Observação em área monitorizada por ≥ 6 h; ainda não apto para alta até completar checklist de segurança (${dischargeChecklistMissing.join(", ")}).`;
      }
      if (diagResult.grade === 1) {
        return dischargeChecklistComplete
          ? "Alta possível após observação curta (≥ 2 h) apenas se resolução completa, baixo risco e checklist de segurança completo."
          : `Baixo risco, mas alta ainda depende de completar checklist de segurança (${dischargeChecklistMissing.join(", ")}) e confirmar estabilidade.`;
      }
    }
    if (flags.shock || flags.airway || flags.respiratoryFailure || flags.coma) {
      return "UTI ou sala de emergência com suporte avançado.";
    }
    if (hasTwoImDosesRecorded(a)) return "Observação prolongada em área monitorizada / sala de emergência.";
    return "Preencher resposta ao tratamento para sugestão personalizada de destino.";
  })();
  const dischargeSuggestion = (() => {
    if (!hasClearImprovement) {
      return "Alta contraindicada no momento — manter em observação/internação até resolução sustentada e critérios de segurança completos.";
    }
    if (flags.shock || flags.airway || flags.coma || doseCount > 1 || isUnknownOrIdiopathicTrigger(a)) {
      return "Alta contraindicada por enquanto — quadro grave/risco aumentado; completar observação prolongada e reavaliar critérios de segurança antes de liberar.";
    }
    if (!dischargeChecklistComplete) {
      return `Alta ainda não segura — faltam itens obrigatórios do checklist de alta: ${dischargeChecklistMissing.join(", ")}.`;
    }
    if (diagResult.grade >= 2 && !isLikelyDrugInducedAvoidable(a)) {
      return "Se mantiver estabilidade ao fim da observação: prescrever 2 autoinjetores, treinar uso, entregar plano de ação escrito, orientar retorno e encaminhar para alergologia.";
    }
    if (diagResult.grade >= 2 && isLikelyDrugInducedAvoidable(a)) {
      return "Se mantiver estabilidade ao fim da observação: documentar alergia medicamentosa, orientar evicção estrita, orientar retorno e encaminhar para alergologia.";
    }
    return "Alta apenas se assintomático, hemodinamicamente estável, sem recorrência no período de observação e com orientação/retorno assegurados.";
  })();

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

function getSecondDoseContext(a: Assessment): string {
  const diagResult = buildDiagnosticResult(a);
  const flags = getSeverityFlags(a);
  const doseCount = getRecordedImDoseCount(a);
  const responseVal = (a.clinicalResponse ?? "").toLowerCase();
  const hasResponseAssessment = responseVal.trim().length > 0;
  const hasClearImprovement = responseVal.includes("melhora clara") || responseVal.includes("melhora completa");
  const hasPartialResponse = responseVal.includes("parcial") || responseVal.includes("resposta lenta");
  const hasNoImprovement = responseVal.includes("sem melhora") || responseVal.includes("sem resposta") || responseVal.includes("piora");

  if (diagResult.adrenalineUrgency !== "immediate") {
    return "2ª dose não é a decisão central neste momento porque o caso ainda não pede adrenalina IM imediata; reclassifique se houver progressão sistêmica.";
  }

  if (doseCount === 0) {
    return "Nenhuma dose IM registrada ainda. Primeiro passo: aplicar a 1ª dose; a decisão sobre 2ª dose vem na reavaliação clínica de 5 min.";
  }

  if (doseCount === 1) {
    if (!hasResponseAssessment) {
      return "1ª dose já feita. Reavalie em 5 min e responda objetivamente: houve melhora suficiente ou ainda persistem choque, comprometimento de via aérea, hipóxia ou resposta parcial?";
    }
    if (hasClearImprovement) {
      return "2ª dose não indicada neste momento: houve resposta clínica satisfatória após a 1ª dose. Manter observação estreita porque recorrência ainda pode acontecer.";
    }
    if (hasPartialResponse || hasNoImprovement) {
      return "2ª dose IM indicada agora: 1ª dose já aplicada e a reavaliação após 5 min mostrou melhora parcial ou ausência de resposta.";
    }
    if (flags.shock || flags.airway || flags.respiratoryFailure) {
      return "2ª dose IM indicada agora apenas se, na reavaliação real após 5 min, ainda persistirem instabilidade hemodinâmica, comprometimento de via aérea ou desconforto respiratório relevante.";
    }
    return "Após a 1ª dose, repetir só se a reavaliação de 5 min mostrar resposta incompleta ou manutenção de sinais respiratórios/hemodinâmicos.";
  }

  if (hasPartialResponse || hasNoImprovement || flags.shock) {
    return "2 doses IM já foram feitas. Se o paciente segue instável, o próximo passo não é uma 3ª dose automática: é escalar suporte e considerar adrenalina EV em infusão em ambiente monitorizado.";
  }

  return "A 2ª dose já foi realizada. Se houve estabilização, manter observação prolongada e vigilância para recorrência ou reação bifásica.";
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
    out.push({ label: "2ª dose", value: getSecondDoseContext(a) });
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
  const { diagResult, flags } = suggestions;
  const evolutionFlow = buildEvolutionFlowSummary(a, suggestions);
  const responseVal = (a.clinicalResponse ?? "").toLowerCase();
  const doseCount = getRecordedImDoseCount(a);
  const hasResponseAssessment = responseVal.trim().length > 0;
  const hasClearImprovement = responseVal.includes("melhora clara") || responseVal.includes("melhora completa");
  const hasPartialResponse = responseVal.includes("parcial") || responseVal.includes("resposta lenta");
  const hasNoImprovement = responseVal.includes("sem melhora") || responseVal.includes("sem resposta") || responseVal.includes("piora");
  const needsSecondImDose =
    diagResult.adrenalineUrgency === "immediate" &&
    doseCount === 1 &&
    hasResponseAssessment &&
    (hasPartialResponse || hasNoImprovement);
  const needsAdrenalineInfusion =
    flags.shock &&
    doseCount >= 2 &&
    !hasAdrenalineInfusionRecorded(a) &&
    hasResponseAssessment &&
    (hasNoImprovement || hasPartialResponse);

  recs.push({
    title: "Conduta prioritária neste momento",
    tone: needsAdrenalineInfusion || flags.shock || flags.coma ? "danger" : diagResult.grade >= 2 ? "warning" : "info",
    lines: [
      needsAdrenalineInfusion
        ? "Iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min sob monitorização contínua, após 2 doses IM adequadas e reposição volêmica."
        : needsSecondImDose
          ? getSecondDoseContext(a)
          : doseCount === 1 && !hasResponseAssessment
            ? getSecondDoseContext(a)
            : diagResult.adrenalineUrgency === "immediate"
              ? `Aplicar adrenalina IM agora (${w != null && w > 0 ? `${suggestedAdrenalineImMg(w)} mg` : "0,5 mg"}), sem atrasar por exames ou adjuvantes.`
              : "Adrenalina IM não é a conduta principal neste momento; manter disponível e reclassificar se houver progressão.",
      flags.airway || flags.respiratoryFailure || flags.shock || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 94)
        ? `Oxigênio suplementar agora: ${suggestions.oxygenSuggestion}.`
        : "Oxigênio apenas se necessário, titulando para SpO₂ 94–98%.",
      flags.coma
        ? "Via aérea definitiva deve ser preparada imediatamente por rebaixamento importante."
        : flags.airway || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 90)
          ? "Preparar ISR/IOT desde já, mas não antecipar a intubação se o paciente ainda ventila e pode responder à adrenalina; proceder se houver piora, estridor progressivo, fadiga ou hipoxemia refratária."
          : flags.airwayWarning || flags.respiratoryFailure
            ? "Manter material e equipe de via aérea prontos enquanto observa a resposta inicial à adrenalina e ao oxigênio."
            : "Sem indicação imediata de via aérea avançada neste momento.",
    ],
  });

  recs.push({
    title: evolutionFlow.currentPhase,
    tone: needsAdrenalineInfusion || flags.shock || flags.coma ? "danger" : needsSecondImDose || diagResult.grade >= 2 ? "warning" : "info",
    lines: [
      `Janela atual: ${evolutionFlow.currentWindow}.`,
      ...evolutionFlow.currentFocus,
      `Próxima fase: ${evolutionFlow.nextPhase}.`,
      `Quando decidir de novo: ${evolutionFlow.nextWindow}.`,
      ...evolutionFlow.nextActions,
    ],
  });

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
      "Grau III — Anafilaxia grave: comprometimento importante de via aérea, hipoxemia importante ou comprometimento neurológico relevante, mesmo sem choque estabelecido. Adrenalina IM urgente + suporte.",
      "Grau IV — Choque anafilático: colapso cardiovascular, hipotensão grave ou hipoperfusão. Adrenalina IM imediata, volume e escalonamento intensivo se refratário.",
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
      "① ADRENALINA IM — 1ª linha imediata. Aplicar na face lateral da coxa. Adulto: 0,5 mg (0,5 mL de 1:1000); criança: 0,01 mg/kg (máx 0,5 mg). Reavaliar em cerca de 5 min e repetir IM apenas se a resposta seguir insuficiente ou se persistirem problemas de via aérea, respiração ou circulação.",
      w != null && w > 0
        ? `   → Dose calculada para este paciente (${w} kg): ${suggestedAdrenalineImMg(w)} mg IM.`
        : "   → Preencher peso para dose personalizada.",
      "② POSIÇÃO — supino com membros inferiores elevados se hipotensão; semi-reclinado se dispneia; decúbito lateral se vômitos ou rebaixamento. Evitar sentar ou levantar abruptamente.",
      "③ OXIGÊNIO E MONITORIZAÇÃO — ofertar O₂ suplementar quando houver hipoxemia, desconforto respiratório, choque ou ameaça de via aérea. Manter SpO₂, PA, FC, FR e ECG conforme gravidade.",
      "④ ACESSO E VOLUME — se hipotensão/choque, obter acesso periférico calibroso e fazer cristalóide em bolus, reavaliando perfusão e sinais de sobrecarga após cada etapa.",
      "⑤ REAVALIAÇÃO EM 5 MIN — depois da 1ª dose, decidir se houve resposta suficiente ou se precisa 2ª dose IM. Não pular direto para vasopressor sem essa reavaliação.",
      "⑥ ESCALONAMENTO — se seguir em choque após 2 doses IM adequadas e volume, considerar adrenalina EV em infusão em ambiente monitorizado e com equipa habituada ao manejo.",
      "⑦ VIA AÉREA AVANÇADA — indicar se houver estridor progressivo, edema laríngeo em progressão, hipoxemia refratária, fadiga respiratória, GCS ≤ 8 ou risco iminente de perda de via aérea.",
      "⑧ ADJUVANTES — nunca substituem adrenalina. Anti-H1 apenas após estabilização para pele/prurido; beta-2 inalatório se broncoespasmo persistente; corticoide apenas como adjuvante selecionado; glucagon se uso de betabloqueador com resposta inadequada.",
    ],
  });

  // ── 6. Critérios de alta e internação ───────────────────────────────────────
  recs.push({
    title: "Critérios de alta e internação",
    tone: "warning",
    lines: [
      "Internar em área monitorizada/UTI se houver choque, ameaça de via aérea, necessidade de adrenalina EV, IOT, resposta incompleta ou piora.",
      "Manter observação prolongada (geralmente ≥ 12 h) se houve quadro grave, mais de 1 dose de adrenalina, resposta parcial, gatilho desconhecido/idiopático ou risco aumentado de recorrência.",
      "Manter observação monitorizada (geralmente ≥ 6 h) na anafilaxia com boa resposta inicial, antes de discutir alta.",
      "Alta após observação breve (geralmente ≥ 2 h) só para reação alérgica isolada, totalmente resolvida, sem progressão e com checklist de segurança completo.",
      `Recomendação para este caso: ${diagResult.observationMinHours > 0 ? `≥ ${diagResult.observationMinHours} h de observação após resolução dos sintomas.` : "Completar avaliação para definir tempo de observação."}`,
      "Alta contraindicada se: permanece sintomático, há hipotensão/tonteira ao ortostatismo, checklist incompleto ou gravidade/risco ainda incompatíveis com saída segura.",
    ],
  });

  // ── 7. Orientações de alta ──────────────────────────────────────────────────
  recs.push({
    title: "Orientações na alta",
    tone: "info",
    lines: [
      isAutoInjectorRequired(a)
        ? "Prescrever 2 autoinjetores de adrenalina e treinar paciente/familiares no uso correto antes da alta."
        : "Avaliar se há indicação real de autoinjetor neste caso; quando não houver, documentar claramente o motivo.",
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
      dischargeAutoInjectorReady: "",
      dischargeTrainingDone: "",
      dischargeSupervisionReady: "",
      dischargeEmergencyAccess: "",
      dischargeOralTolerance: "",
      dischargeOrthostaticCheck: "",
      dischargeSeniorReview: "",
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
  const doseCount = getRecordedImDoseCount(a);
  const responseVal = (a.clinicalResponse ?? "").toLowerCase();
  const hasResponseAssessment = responseVal.trim().length > 0;
  const hasClearImprovement = responseVal.includes("melhora clara") || responseVal.includes("melhora completa");
  const hasPartialResponse = responseVal.includes("parcial") || responseVal.includes("resposta lenta");
  const hasNoImprovement = responseVal.includes("sem melhora") || responseVal.includes("sem resposta") || responseVal.includes("piora");
  const needsSecondImDose =
    diagResult.adrenalineUrgency === "immediate" &&
    doseCount === 1 &&
    hasResponseAssessment &&
    (hasPartialResponse || hasNoImprovement);
  const needsAdrenalineInfusion =
    flags.shock &&
    doseCount >= 2 &&
    !hasAdrenalineInfusionRecorded(a) &&
    hasResponseAssessment &&
    (hasNoImprovement || hasPartialResponse);
  const dischargeBlocked = isDischargeBlockedByContext(a);
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
      section: "Sinais vitais e exame clínico",
      presetMode: "toggle_token",
      presets: [
        { label: "Insuficiência respiratória", value: "Insuficiência respiratória" },
        { label: "Estridor / edema de glote", value: "Estridor / edema de glote" },
        { label: "Dispneia / broncoespasmo", value: "Dispneia / broncoespasmo" },
        { label: "Sensação de obstrução de via aérea", value: "Sensação de obstrução de via aérea" },
        { label: "Síncope / pré-síncope", value: "Síncope / pré-síncope" },
        { label: "Pulso filiforme / extremidades frias", value: "Pulso filiforme / extremidades frias" },
        { label: "Cianose", value: "Cianose" },
        { label: "Angioedema (lábios, pálpebras, língua)", value: "Angioedema" },
        { label: "Urticária / eritema / prurido", value: "Urticária / eritema / prurido" },
        { label: "Disfonia (rouquidão / voz abafada)", value: "Disfonia / rouquidão" },
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
        if (needsAdrenalineInfusion)
          return "⚠ Choque refratário após 2 doses IM: iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min e manter monitorização contínua.";
        if (needsSecondImDose)
          return `⚠ ${getSecondDoseContext(a)}`;
        if (flags.shock && flags.airway)
          return "⚠ Choque + comprometimento de via aérea — adrenalina IM IMEDIATA, oxigênio alto fluxo e preparar IOT se não houver melhora rápida ou se houver deterioração.";
        if (flags.shock)
          return "⚠ Choque anafilático identificado — adrenalina IM AGORA na coxa lateral.";
        if (flags.airway)
          return "⚠ Comprometimento de via aérea — adrenalina IM urgente, oxigênio e preparo de via aérea avançada.";
        if (flags.airwayWarning)
          return "⚠ Sinais de alerta de via aérea — adrenalina IM agora, O₂ alto fluxo e reavaliação em 5 min; preparar material se houver progressão.";
        if (flags.respiratoryFailure)
          return "Insuficiência respiratória — adrenalina IM indicada imediatamente.";
        return `${w != null && w > 0
          ? `Dose calculada por peso (${w} kg): ${suggestedAdrenalineImMg(w)} mg IM na coxa lateral.`
          : "Dose padrão adulto: 0,5 mg IM na coxa lateral."} ${getSecondDoseContext(a)}`;
      })(),
      presets: withSuggestedFirst([
        // 1ª dose — calculada por peso se disponível
        ...(w != null && w > 0 && w < 300
          ? [{ label: `${suggestedAdrenalineImMg(w)} mg IM — 1ª dose / Aplicar na coxa lateral agora · primeira linha em anafilaxia`, value: `${suggestedAdrenalineImMg(w)} mg IM — 1ª dose` }]
          : [{ label: "0,5 mg IM — 1ª dose / Aplicar na coxa lateral agora · dose padrão adulto", value: "0,5 mg IM — 1ª dose" }]
        ),
        // 2ª dose (5 min após sem melhora)
        ...(w != null && w > 0 && w < 300
          ? [{ label: `${suggestedAdrenalineImMg(w)} mg IM — 2ª dose / Repetir 5 min após a 1ª se resposta insuficiente`, value: `${suggestedAdrenalineImMg(w)} mg IM — 2ª dose (5 min após)` }]
          : [{ label: "0,5 mg IM — 2ª dose / Repetir 5 min após a 1ª se resposta insuficiente", value: "0,5 mg IM — 2ª dose (5 min após)" }]
        ),
        { label: "2 doses IM realizadas — sem resposta adequada / Marcar refratariedade antes de migrar para infusão EV", value: "2 doses IM realizadas — sem resposta adequada" },
        // EV contínua — só exibe se refratário após 2 doses IM
        ...(suggestions.adrenalineIvSuggestion
          ? [{ label: "Adrenalina EV em infusão / 0,05–0,1 mcg/kg/min · choque refratário após 2 doses IM", value: "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min" }]
          : []),
      ], adrDose),
    },
    {
      id: "treatmentIvAccess",
      label: "Acesso venoso",
      value: a.treatmentIvAccess,
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
        ? `⚠ Choque presente — iniciar expansão imediata${w ? ` (meta inicial até 20 mL/kg ≈ ${Math.round(w * 20)} mL)` : ""}. Reavaliar PA, perfusão e sinais de congestão após cada alíquota; reduza volumes se cardiopatia, disfunção renal ou risco de sobrecarga.`
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
      helperText:
        flags.airway || flags.coma || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 90)
          ? "⚠ Via aérea ameaçada — iniciar O₂ alto fluxo e preparar IOT. Se ainda houver ventilação/perfusão, observar a resposta muito breve à adrenalina; não atrasar IOT se houver piora."
          : flags.airwayWarning || flags.respiratoryFailure
            ? "Sinais de alerta de via aérea: priorize O₂ alto fluxo, vigilância contínua e reavaliação em 5 min após adrenalina. Preparar IOT apenas se não houver melhora ou se houver piora."
            : "Selecione o O₂ em uso e a conduta de via aérea. Pode marcar mais de um.",
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
      label: "Broncodilatador inalatório (beta-2 agonista)",
      value: a.treatmentSalbutamol,
      fullWidth: true,
      presetMode: "toggle_token" as const,
      section: "Tratamento na emergência",
      helperText: flags.bronchospasm
        ? "⚠ Usar apenas se houver sibilância/broncoespasmo persistente APÓS adrenalina IM. Não substitui adrenalina. Nebulização: dose total no copo do nebulizador, completar com SF conforme rotina do serviço e ofertar até acabar a névoa. 2,5 mg costuma corresponder a 0,5 mL da solução 5 mg/mL; 5 mg costuma corresponder a 1 mL da solução 5 mg/mL. MDI = bombinha spray de 100 mcg/jato; usar 1 jato por vez no espaçador, com 4–8 jatos ao todo. Ipratrópio: usar JUNTO ao salbutamol, não isolado. Salbutamol contínuo não é rotina na anafilaxia; se persistir broncoespasmo importante apesar de adrenalina e doses repetidas, tratar como asma grave/refratariedade com RT/UTI e protocolo local."
        : "Usar apenas se houver broncoespasmo persistente após adrenalina. Não é tratamento de rotina da anafilaxia sem sibilância.",
      suggestedValue: suggestions.salbutamolSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.salbutamolSuggestion}`,
      presets: [
        { label: "Não indicado agora / Sem sibilância ou broncoespasmo persistente após adrenalina", value: "Não realizado" },
        { label: "Salbutamol nebulizado 2,5 mg / Preferir se < 20 kg ou menor porte · em geral 0,5 mL da solução 5 mg/mL no nebulizador", value: "Salbutamol nebulizado 2,5 mg — em geral 0,5 mL da solução 5 mg/mL" },
        { label: "Salbutamol nebulizado 5 mg / Preferir em adulto ou ≥ 20 kg · em geral 1 mL da solução 5 mg/mL no nebulizador", value: "Salbutamol nebulizado 5 mg — em geral 1 mL da solução 5 mg/mL" },
        { label: "Salbutamol MDI 4–8 jatos (100 mcg/jato) com espaçador / Bombinha spray · 1 jato por vez no espaçador, repetir até 4–8 jatos", value: "Salbutamol MDI 4–8 jatos com espaçador" },
        { label: "Associar ipratrópio nebulizado / Adjuvante se broncoespasmo importante ou resposta incompleta ao salbutamol", value: "Ipratrópio nebulizado associado" },
        { label: "Ipratrópio 500 mcg nebulizado / Adulto ou > 12 anos · em geral 2 mL da solução 250 mcg/mL, junto ao salbutamol", value: "Ipratrópio 500 mcg nebulizado associado ao salbutamol" },
        { label: "Ipratrópio 250 mcg nebulizado / 2–12 anos · em geral 1 mL da solução 250 mcg/mL, junto ao salbutamol", value: "Ipratrópio 250 mcg nebulizado associado ao salbutamol" },
        { label: "Ipratrópio 125 mcg nebulizado / < 2 anos · em geral 0,5 mL da solução 250 mcg/mL, junto ao salbutamol", value: "Ipratrópio 125 mcg nebulizado associado ao salbutamol" },
        { label: "Broncoespasmo refratário / Persistindo após adrenalina adequada + salbutamol repetido, acionar RT/UTI, ofertar O₂, monitorizar e seguir protocolo local de asma grave; nebulização contínua só nesse contexto monitorizado", value: "Broncoespasmo refratário — acionar RT/UTI e seguir protocolo local de asma grave" },
      ],
    },
    {
      id: "treatmentH1",
      label: "Anti-H1 / anti-histamínico (adjuvante pós-estabilização)",
      value: a.treatmentH1,
      fullWidth: true,
      section: "Tratamento na emergência",
      helperText: diagResult.grade === 1
        ? "Reação cutânea isolada: anti-H1 pode ser útil para urticária/prurido. Preferir opção VO não sedante. Em anafilaxia sistêmica, usar só após estabilização."
        : "⚠ Não tratam hipotensão, broncoespasmo nem edema de via aérea. Usar apenas APÓS estabilização e apenas para prurido/urticária persistentes. Preferir anti-H1 não sedante por VO.",
      suggestedValue: suggestions.h1Suggestion,
      suggestedLabel: `Sugestão: ${suggestions.h1Suggestion}`,
      presets: withSuggestedFirst([
        { label: "Não usar na fase inicial da anafilaxia sistêmica / reservar para sintomas cutâneos após estabilização", value: "Não indicado na fase inicial da anafilaxia sistêmica" },
        { label: "Cetirizina VO / Preferir se via oral possível e paciente estável · adulto 10–20 mg; 6–11 a 5–10 mg; 2–5 a 2,5–5 mg", value: "Cetirizina VO após estabilização (preferir anti-H1 não sedante)" },
        { label: "Loratadina VO / Alternativa não sedante se cetirizina indisponível · adulto 10 mg", value: "Loratadina VO após estabilização" },
        { label: "Difenidramina EV/IM / Se via oral inviável e urticária/prurido relevantes · 1 mg/kg até 50 mg", value: "Difenidramina EV/IM 1 mg/kg (máx 50 mg) se VO inviável" },
        { label: "Evitar anti-H1 sedativo como rotina / sedação pode confundir avaliação clínica", value: "Evitar anti-H1 sedativo de rotina" },
      ], suggestions.h1Suggestion),
    },
    {
      id: "treatmentCorticoid",
      label: "Corticoide (adjuvante — não 1ª linha)",
      value: a.treatmentCorticoid,
      fullWidth: true,
      section: "Tratamento na emergência",
      helperText: "⚠ Não usar de rotina na fase inicial. Início de ação em horas; não revertem broncoespasmo/choque rapidamente e não previnem de forma confiável reação bifásica. Considerar apenas se asma/broncoespasmo importante, reação prolongada ou preocupação de via aérea.",
      suggestedValue: suggestions.corticoidSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.corticoidSuggestion}`,
      presets: withSuggestedFirst([
        { label: "Não indicado de rotina / não usar no lugar da adrenalina", value: "Não indicado de rotina" },
        { label: "Prednisolona VO / Após estabilização se broncoespasmo, asma associada ou reação prolongada · 1 mg/kg (máx 50 mg)", value: "Prednisolona VO 1 mg/kg (máx 50 mg) após estabilização" },
        { label: "Hidrocortisona EV / Se via oral inviável ou quadro mais grave com sibilância/asma · 5 mg/kg (máx 200 mg)", value: "Hidrocortisona EV 5 mg/kg (máx 200 mg) como adjuvante" },
        { label: "Dexametasona EV/IM/VO / Alternativa quando se deseja dose única mais prolongada · 0,5 mg/kg (máx 16 mg)", value: "Dexametasona 0,5 mg/kg (máx 16 mg) como adjuvante" },
        { label: "Reforço / documentar que corticoide foi usado apenas como adjuvante, não como tratamento principal", value: "Corticoide usado apenas como adjuvante — adrenalina segue tratamento principal" },
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
        ? hasAdrenalineInfusionRecorded(a)
          ? "Choque persistente apesar de adrenalina EV: considerar noradrenalina como adjuvante/2ª linha e discutir protocolo local/UTI. Glucagon apenas se uso de betabloqueador."
          : hasTwoImDosesRecorded(a) && (a.clinicalResponse ?? "").trim()
            ? "Choque refratário após 2 doses de adrenalina IM + volume adequado: adrenalina EV em infusão é a 1ª escolha. Noradrenalina fica para persistência do choque apesar da adrenalina EV."
            : hasAnyImDoseRecorded(a)
              ? "Choque presente, mas antes de droga vasoativa é obrigatório reavaliar resposta à adrenalina IM e ao volume. Se mantiver instabilidade após 2 doses IM + volume, migrar para adrenalina EV em infusão."
              : "Primeiro passo no choque anafilático é adrenalina IM imediata + oxigênio + volume. Não iniciar vasopressor antes dessa etapa, salvo contexto de UTI/protocolo local muito específico."
        : "Reservado para choque refratário após adrenalina IM e reposição volêmica adequada.",
      suggestedValue: suggestions.vasopressorSuggestion,
      suggestedLabel: `Sugestão: ${suggestions.vasopressorSuggestion}`,
      presets: (() => {
        if (!flags.shock) {
          return [
            { label: "Não indicado agora / sem choque refratário documentado", value: "Não indicado no momento" },
          ];
        }
        if (!hasTwoImDosesRecorded(a) || !(a.clinicalResponse ?? "").trim()) {
          return [
            { label: "Não indicado agora / reavaliar resposta à adrenalina IM e ao volume antes de escalar", value: "Não indicado no momento" },
            { label: "Suporte avançado acionado / caso grave em reavaliação contínua", value: "Suporte avançado acionado / reavaliação contínua" },
            { label: "Glucagon EV/IM / considerar apenas se uso de betabloqueador e resposta inadequada à adrenalina", value: "Glucagon 1–2 mg EV/IM se betabloqueador" },
          ];
        }
        if (hasAdrenalineInfusionRecorded(a)) {
          return [
            { label: "Adrenalina EV em infusão já iniciada / manter titulação pela resposta", value: "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min — 1ª escolha no choque refratário" },
            { label: "Noradrenalina EV em infusão / considerar se choque persistir apesar de adrenalina EV titulada · discutir com UTI/protocolo local", value: "Noradrenalina EV em infusão — 2ª linha / adjuvante ao choque refratário" },
            { label: "Glucagon EV/IM / considerar se uso de betabloqueador e resposta inadequada à adrenalina", value: "Glucagon 1–2 mg EV/IM se betabloqueador" },
            { label: "Suporte avançado / documentar que vasoativo foi iniciado em ambiente monitorizado e com protocolo local", value: "Vasoativo iniciado em ambiente monitorizado / suporte avançado" },
          ];
        }
        return [
          { label: "Não indicado agora / se houver estabilização após 2 doses IM + volume", value: "Não indicado no momento" },
          { label: "Adrenalina EV em infusão / primeira escolha no choque refratário após 2 doses IM + volume · iniciar 0,05–0,1 mcg/kg/min", value: "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min — 1ª escolha no choque refratário" },
          { label: "Noradrenalina EV em infusão / considerar se choque persistir apesar de adrenalina EV titulada · discutir com UTI/protocolo local", value: "Noradrenalina EV em infusão — 2ª linha / adjuvante ao choque refratário" },
          { label: "Glucagon EV/IM / considerar se uso de betabloqueador e resposta inadequada à adrenalina", value: "Glucagon 1–2 mg EV/IM se betabloqueador" },
          { label: "Suporte avançado / documentar que vasoativo foi iniciado em ambiente monitorizado e com protocolo local", value: "Vasoativo iniciado em ambiente monitorizado / suporte avançado" },
        ];
      })(),
    },

    {
      id: "clinicalResponse",
      label: "Resposta ao tratamento",
      value: a.clinicalResponse,
      fullWidth: true,
      section: "Evolução e destino",
      helperText: (() => {
        const doseCount = getRecordedImDoseCount(a);
        if (doseCount === 0) return "Passo atual: aplicar 1ª dose e só depois reavaliar.";
        if (doseCount === 1) return `Passo atual: ${getSecondDoseContext(a)}`;
        return `Passo atual: ${getSecondDoseContext(a)}`;
      })(),
      presets: (() => {
        const doseCount = getRecordedImDoseCount(a);
        if (doseCount === 0) {
          return [
            { label: "Aguardando 1ª dose / ainda não é o momento de julgar resposta", value: "Aguardando 1ª dose — resposta ainda não avaliada" },
          ];
        }
        if (doseCount >= 2) {
          return [
            { label: "Melhora completa após 2ª dose — estabilização sustentada", value: "Melhora completa após 2ª dose" },
            { label: "Melhora parcial após 2ª dose — ainda instável, manter suporte avançado", value: "Melhora parcial após 2ª dose" },
            { label: "Sem resposta após 2ª dose — refratário às doses IM", value: "Sem resposta — refratário às doses IM" },
            { label: "Piora progressiva após 2ª dose — choque/respiratório persistente", value: "Piora progressiva — necessita UTI" },
            { label: "Reação bifásica — recrudescimento após intervalo livre; re-iniciar protocolo", value: "Reação bifásica — recrudescimento" },
          ];
        }
        return [
          { label: "Melhora completa após 1ª dose — hemodinâmica e respiração estabilizaram", value: "Melhora completa após 1ª dose" },
          { label: "Melhora parcial após 1ª dose — melhorou, mas ainda requer monitorização/reavaliação", value: "Melhora parcial — necessita monitorização" },
          { label: "Resposta lenta após 1ª dose — melhora progressiva em 15–30 min, manter vigilância", value: "Resposta lenta (melhora em 15–30 min)" },
          { label: "Sem resposta após 1ª dose — considerar 2ª dose se mantiver critérios clínicos", value: "Sem resposta após 1ª dose" },
          { label: "Piora progressiva após 1ª dose — deterioração hemodinâmica/respiratória", value: "Piora progressiva — necessita UTI" },
          { label: "Reação bifásica — recrudescimento após intervalo livre; re-iniciar protocolo", value: "Reação bifásica — recrudescimento" },
        ];
      })(),
    },
    {
      id: "observationPlan",
      label: "Plano de observação — tempo e local",
      value: a.observationPlan,
      fullWidth: true,
      section: "Evolução e destino",
      placeholder: "Ex.: 6 h em sala de observação monitorizada…",
      suggestedValue: suggestions.observationSuggestion,
      suggestedLabel: `Próximo passo sugerido: ${suggestions.observationSuggestion}`,
      helperText: (() => {
        const doseCount = getRecordedImDoseCount(a);
        const rv = (a.clinicalResponse ?? "").toLowerCase();
        if (!rv) {
          if (doseCount === 0) return "Ainda cedo para fechar observação: primeiro tratar e reavaliar.";
          if (doseCount === 1) return "Reavalie a resposta da 1ª dose antes de decidir observação final.";
          return "Após 2 doses IM, mantenha monitorizado enquanto decide escalonamento.";
        }
        if (rv.includes("sem melhora") || rv.includes("sem resposta") || rv.includes("piora")) return "⚠ Não liberar. Manter monitorizado e reavaliar escalonamento agora.";
        if (rv.includes("parcial")) return "Resposta parcial: não liberar. Manter observação monitorizada.";
        if (rv.includes("melhora")) {
          if (suggestions.flags.shock || suggestions.flags.airway || suggestions.flags.coma || doseCount > 1 || isUnknownOrIdiopathicTrigger(a))
            return "Melhora, mas segue alto risco: observação prolongada em área monitorizada.";
          if (diagResult.grade === 2) return "Melhora após Grau II: observar pelo menos 6 h antes de discutir alta.";
          return "Melhora em baixo risco: observar pelo menos 2 h após resolução total.";
        }
        return "";
      })(),
      presets: withSuggestedFirst([
        { label: "Observação curta / ≥ 2 h após resolução — apenas baixo risco, resposta rápida a 1 dose e critérios de alta completos", value: "Observação curta: pelo menos 2 h após resolução completa dos sintomas, se baixo risco e alta segura." },
        { label: "Observação monitorizada / ≥ 6 h após resolução — anafilaxia moderada ou necessidade de 2 doses IM", value: "Observação monitorizada: pelo menos 6 h após resolução dos sintomas, com ECG/SpO₂/PA seriada." },
        { label: "Observação prolongada / ≥ 12 h — choque, comprometimento respiratório importante, > 1 dose de adrenalina ou risco de recorrência", value: "Observação prolongada: pelo menos 12 h em área monitorizada com suporte de emergência." },
        { label: "UTI / suporte avançado contínuo — instabilidade persistente, IOT ou necessidade de infusão EV", value: "Internação em UTI / área de alta complexidade para monitorização contínua e suporte avançado." },
        { label: "Permanecer na emergência e reavaliar imediatamente — resposta parcial, sem resposta ou piora", value: "Permanecer na sala de emergência para reavaliação imediata e possível escalonamento." },
      ], suggestions.observationSuggestion),
    },
    {
      id: "destination",
      label: "Destino — sugerido por contexto",
      value: a.destination,
      fullWidth: true,
      section: "Evolução e destino",
      suggestedValue: suggestions.destinationSuggestion,
      suggestedLabel: `Destino provável agora: ${suggestions.destinationSuggestion}`,
      helperText: (() => {
        const rv = (a.clinicalResponse ?? "").toLowerCase();
        const doseCount = getRecordedImDoseCount(a);
        if (!rv) return "Sem reavaliação ainda: o padrão é permanecer monitorizado.";
        const f = suggestions.flags;
        if (f.coma || f.airway || f.shock) return "⚠ Quadro grave: pensar em UTI ou área de alta complexidade.";
        if (rv.includes("sem melhora") || rv.includes("sem resposta") || rv.includes("piora")) return "⚠ Sem resposta/piora: não liberar. Permanecer em emergência/UTI conforme instabilidade.";
        if (rv.includes("parcial")) return "Resposta parcial: manter em observação monitorizada ou internação.";
        if (rv.includes("melhora")) {
          if (diagResult.grade >= 3 || doseCount > 1 || isUnknownOrIdiopathicTrigger(a)) return "Melhora após caso de maior risco: manter internação/observação prolongada.";
          if (diagResult.grade === 2) return "Melhora após Grau II: destino habitual é observação monitorizada.";
          return "Melhora em quadro leve: alta só se completar observação mínima e checklist.";
        }
        return "";
      })(),
      presets: withSuggestedFirst([
        { label: "Alta com orientações — apenas baixo risco, resposta completa, observação concluída e plano de segurança pronto", value: "Alta com orientações e plano de segurança completo" },
        { label: "Observação monitorizada / unidade de observação — resposta boa, mas ainda exige tempo de vigilância", value: "Unidade de observação / área monitorizada até completar tempo de vigilância." },
        { label: "Internação em área monitorizada — quadro moderado/grave, > 1 dose de adrenalina ou risco de recorrência", value: "Internação em área monitorizada para vigilância prolongada." },
        { label: "UTI / emergência avançada — choque refratário, via aérea crítica, necessidade de infusão EV ou instabilidade persistente", value: "UTI / sala de emergência avançada" },
        { label: "Permanecer na emergência — resposta parcial, sem resposta ou piora", value: "Permanecer na sala de emergência para reavaliação e escalonamento" },
      ], suggestions.destinationSuggestion),
    },
    {
      id: "dischargePlan",
      label: "Alta segura / autoinjetor",
      value: a.dischargePlan,
      fullWidth: true,
      section: "Evolução e destino",
      suggestedValue: suggestions.dischargeSuggestion,
      suggestedLabel: `Decisão final sugerida: ${suggestions.dischargeSuggestion}`,
      helperText: (() => {
        const rv = (a.clinicalResponse ?? "").toLowerCase();
        const doseCount = getRecordedImDoseCount(a);
        if (dischargeBlocked) return "⚠ Alta bloqueada pelo contexto atual. Enquanto o destino provável for observação, emergência, internação ou UTI, os cards de alta abaixo ficam bloqueados.";
        if (!rv.includes("melhora completa")) return "⚠ Alta contraindicada sem resolução completa e sustentada dos sintomas.";
        if (suggestions.flags.shock || suggestions.flags.airway || suggestions.flags.coma) return "⚠ Alta contraindicada após quadro grave até completar observação prolongada e reavaliação especializada.";
        if (doseCount > 1) return "⚠ Mais de uma dose de adrenalina aumenta o risco de recorrência; não indicar alta precoce.";
        if (isUnknownOrIdiopathicTrigger(a)) return "⚠ Gatilho incerto/idiopático aumenta risco de recorrência; considerar observação mais longa e cautela antes da alta.";
        if (!hasSafeDischargeChecklist(a)) return `⚠ Antes de liberar, complete o checklist abaixo. Faltando: ${getDischargeChecklistMissingItems(a).join(", ")}.`;
        if (diagResult.grade >= 2 && !isLikelyDrugInducedAvoidable(a)) return "Alta só com autoinjetor, treinamento prático, plano escrito, orientação de retorno e seguimento em alergologia.";
        if (diagResult.grade >= 2 && isLikelyDrugInducedAvoidable(a)) return "Mesmo em gatilho medicamentoso, só dar alta se estável, com alergia documentada, evicção orientada e retorno assegurado.";
        return "Critérios mínimos: assintomático, estável, sem recorrência durante a observação, checklist completo e acesso rápido à emergência.";
      })(),
      presets: withSuggestedFirst([
        { label: "Alta contraindicada agora / manter observação ou internação até completar critérios de segurança", value: "Alta contraindicada no momento" },
        { label: "Alta segura após anafilaxia não medicamentosa / prescrever 2 autoinjetores, treinar uso, entregar plano escrito e orientar retorno", value: "Alta segura com 2 autoinjetores, treinamento, plano de ação escrito e orientação de retorno" },
        { label: "Alta segura após anafilaxia medicamentosa / documentar alergia, orientar evicção estrita, orientar retorno e encaminhar para alergologia", value: "Alta segura com alergia medicamentosa documentada, evicção orientada e seguimento" },
        { label: "Checklist de alta concluído / assintomático, estável, sem recorrência, supervisão domiciliar e acesso a emergência", value: "Checklist de alta concluído — critérios de segurança atendidos" },
      ], suggestions.dischargeSuggestion),
    },
    {
      id: "dischargeAutoInjectorReady",
      label: "Checklist alta — autoinjetor disponível",
      value: a.dischargeAutoInjectorReady,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Checklist de alta fica indisponível enquanto o caso ainda exige observação/emergência/UTI."
        : isAutoInjectorRequired(a)
          ? "Pergunta-chave: o paciente sai com 2 autoinjetores quando isso é indicado para este caso?"
          : "Pergunta-chave: neste caso o autoinjetor foi disponibilizado ou a não indicação foi documentada?",
      presets: [
        { label: "Sim — 2 autoinjetores prescritos/entregues", value: "Sim — autoinjetor disponível" },
        { label: "Não indicado neste caso — documentado em prontuário", value: "Não indicado neste caso — documentado" },
        { label: "Não — ainda sem autoinjetor", value: "Não — autoinjetor ainda indisponível" },
        { label: "Não se aplica — gatilho medicamentoso evitável", value: "Não se aplica — gatilho medicamentoso evitável" },
      ],
    },
    {
      id: "dischargeTrainingDone",
      label: "Checklist alta — treinamento realizado",
      value: a.dischargeTrainingDone,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Liberar checklist só depois que o caso realmente entrar em fase de alta."
        : "Pergunta-chave: paciente/familiar sabem usar o autoinjetor e receberam plano escrito?",
      presets: [
        { label: "Sim — treinamento e plano escrito realizados", value: "Sim — treinamento realizado" },
        { label: "Não — treinamento pendente", value: "Não — treinamento pendente" },
      ],
    },
    {
      id: "dischargeSupervisionReady",
      label: "Checklist alta — supervisão pós-alta",
      value: a.dischargeSupervisionReady,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Supervisão pós-alta só deve ser avaliada quando a alta for uma possibilidade real."
        : "Pergunta-chave: haverá supervisão adequada após a saída?",
      presets: [
        { label: "Sim — supervisão adequada disponível", value: "Sim — supervisão adequada" },
        { label: "Não — sem supervisão adequada", value: "Não — sem supervisão adequada" },
      ],
    },
    {
      id: "dischargeEmergencyAccess",
      label: "Checklist alta — acesso à emergência",
      value: a.dischargeEmergencyAccess,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Acesso à emergência será checado quando o caso realmente puder sair."
        : "Pergunta-chave: consegue voltar rapidamente à emergência se piorar?",
      presets: [
        { label: "Sim — acesso rápido à emergência", value: "Sim — acesso rápido à emergência" },
        { label: "Não — acesso difícil/remoto", value: "Não — acesso difícil à emergência" },
      ],
    },
    {
      id: "dischargeOralTolerance",
      label: "Checklist alta — via oral segura",
      value: a.dischargeOralTolerance,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Via oral segura entra na decisão apenas quando a alta estiver em discussão."
        : "Pergunta-chave: deglutição e via oral estão seguras?",
      presets: [
        { label: "Sim — tolera via oral", value: "Sim — via oral adequada" },
        { label: "Não — via oral ainda inadequada", value: "Não — via oral inadequada" },
      ],
    },
    {
      id: "dischargeOrthostaticCheck",
      label: "Checklist alta — ortostatismo / tontura",
      value: a.dischargeOrthostaticCheck,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Ortostatismo deve ser testado apenas quando a saída estiver próxima."
        : "Pergunta-chave: levantou sem tontura ou instabilidade?",
      presets: [
        { label: "Adequado — sem tontura/instabilidade ao ortostatismo", value: "Adequado — ortostatismo sem tontura" },
        { label: "Inadequado — tontura/instabilidade presente", value: "Inadequado — ortostatismo com tontura" },
      ],
    },
    {
      id: "dischargeSeniorReview",
      label: "Checklist alta — revisão clínica final",
      value: a.dischargeSeniorReview,
      section: "Evolução e destino",
      readOnly: dischargeBlocked,
      helperText: dischargeBlocked
        ? "Alta bloqueada neste momento. Revisão clínica final de alta só faz sentido quando o paciente realmente puder sair."
        : "Pergunta-chave: a decisão final foi revista por clínico experiente?",
      presets: [
        { label: "Confirmado — caso revisto e alta/observação definidas", value: "Confirmado — revisão clínica final realizada" },
        { label: "Pendente — aguarda revisão clínica final", value: "Pendente — revisão clínica final" },
      ],
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
        indicatedExams.push("Troponina — suspeita de síndrome de Kounis (dor torácica + anafilaxia; pesquisa lesão miocárdica/vasoespasmo coronariano)");
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
          { label: "Troponina — suspeita de síndrome de Kounis (dor torácica + anafilaxia; pesquisa lesão miocárdica/vasoespasmo coronariano)", value: "Troponina — suspeita de síndrome de Kounis (dor torácica + anafilaxia; pesquisa lesão miocárdica/vasoespasmo coronariano)" },
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
        ? "CHOQUE ANAFILÁTICO com rebaixamento — adrenalina IM imediata, oxigênio e preparo imediato para via aérea definitiva."
        : diagResult.grade === 4
          ? "CHOQUE ANAFILÁTICO — adrenalina IM imediata, dois acessos, cristalóide em bolus. Considerar adrenalina EV se refratário."
          : diagResult.grade === 3
            ? "ANAFILAXIA GRAVE — oxigênio + adrenalina IM urgente; preparar IOT/VM e proceder se não houver melhora rápida ou houver deterioração."
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

function buildCoreSeverityAlerts(a: Assessment): ClinicalCoreAlert[] {
  const suggestions = buildTreatmentSuggestions(a);
  const { flags, diagResult } = suggestions;
  const alerts: ClinicalCoreAlert[] = [];

  if (flags.shock) {
    alerts.push({
      id: "anaphylaxis_shock",
      severity: "critical",
      title: "Choque anafilatico detectado",
      rationale: "Hipotensao e/ou hipoperfusao exigem adrenalina IM imediata e reposicao titulada.",
      immediateActions: [
        "Adrenalina IM agora",
        "Cristaloide em aliquotas com reavaliacao",
        "Monitorizacao continua e ajuda avancada",
      ],
    });
  }

  if (flags.airway || flags.coma || (parseNum(a.spo2) != null && parseNum(a.spo2)! < 90)) {
    alerts.push({
      id: "anaphylaxis_airway_threat",
      severity: "critical",
      title: "Ameaca imediata de via aerea",
      rationale: "Estridor, edema de glote, hipoxemia grave ou coma mudam a prioridade para suporte avancado.",
      immediateActions: [
        "Oxigenio de alto fluxo",
        "Preparar via aerea avancada",
        "Acionar suporte especializado",
      ],
    });
  } else if (flags.airwayWarning || flags.respiratoryFailure) {
    alerts.push({
      id: "anaphylaxis_airway_warning",
      severity: "warning",
      title: "Via aerea sob vigilancia",
      rationale: "Ha sinais de alerta respiratorios, mas ainda cabe observar resposta inicial a adrenalina e oxigenio.",
      immediateActions: [
        "Mascara com reservatorio",
        "Reavaliar em 5 minutos",
        "Manter material de IOT pronto",
      ],
    });
  }

  if (diagResult.adrenalineUrgency === "immediate" && !a.treatmentAdrenaline.trim()) {
    alerts.push({
      id: "anaphylaxis_epinephrine_due",
      severity: "critical",
      title: "Adrenalina IM ainda nao registrada",
      rationale: diagResult.adrenalineRationale,
      immediateActions: [
        "Administrar adrenalina IM na coxa",
        "Registrar dose e horario",
      ],
    });
  }

  return alerts;
}

function buildCoreImmediateActions(a: Assessment): ClinicalCoreAction[] {
  const suggestions = buildTreatmentSuggestions(a);
  const actions: ClinicalCoreAction[] = [];

  if (suggestions.diagResult.adrenalineUrgency === "immediate") {
    actions.push({
      id: "adrenaline_im",
      label: suggestions.adrenalineSuggestion,
      priority: "immediate",
      rationale: suggestions.diagResult.adrenalineRationale,
      selected: Boolean(a.treatmentAdrenaline.trim()),
    });
  }

  actions.push({
    id: "oxygen_airway",
    label: suggestions.oxygenSuggestion,
    priority: suggestions.flags.airway || suggestions.flags.respiratoryFailure ? "immediate" : "urgent",
    rationale: suggestions.airwaySuggestion,
    selected: Boolean(a.treatmentO2.trim() || a.treatmentAirway.trim()),
  });

  actions.push({
    id: "iv_access",
    label: suggestions.ivAccessSuggestion,
    priority: suggestions.flags.shock ? "immediate" : "urgent",
    rationale: "O protocolo depende de acesso rapido para fluidos, monitorizacao e eventual escalonamento.",
    selected: Boolean(a.treatmentIvAccess.trim()),
  });

  actions.push({
    id: "crystalloid",
    label: suggestions.fluidSuggestion,
    priority: suggestions.flags.shock ? "immediate" : "routine",
    rationale: "Reposicao titulada conforme perfusao e risco de sobrecarga.",
    selected: Boolean(a.treatmentFluids.trim()),
  });

  actions.push({
    id: "monitoring",
    label: suggestions.monitoringSuggestion,
    priority: "urgent",
    rationale: "Reavaliacao frequente e obrigatoria nas fases iniciais da anafilaxia.",
    selected: Boolean(a.treatmentMonitoring.trim()),
  });

  return actions;
}

function buildDirectedEvaluationSummary(a: Assessment): string {
  const trigger = a.exposureType.trim() || "Gatilho nao definido";
  const symptomSummary = a.symptoms.trim() || "Sintomas ainda nao registrados";
  return `${trigger}. ${symptomSummary}`;
}

function buildCoreHypotheses(a: Assessment): ClinicalCoreHypothesis[] {
  const diagResult = buildDiagnosticResult(a);
  const hypotheses: ClinicalCoreHypothesis[] = [];

  if (diagResult.grade >= 2) {
    hypotheses.push({
      id: "anaphylaxis",
      label: diagResult.label,
      probability: diagResult.grade >= 3 ? "high" : "moderate",
      rationale: diagResult.criteriaText,
    });
  } else if (diagResult.grade === 1) {
    hypotheses.push({
      id: "isolated_allergic_reaction",
      label: diagResult.label,
      probability: "high",
      rationale: diagResult.criteriaText,
    });
  } else {
    hypotheses.push({
      id: "under_evaluation",
      label: "Hipotese em avaliacao",
      probability: "low",
      rationale: "Ainda faltam dados clinicos para fechar o raciocinio diagnostico.",
    });
  }

  return hypotheses;
}

function buildProtocolActivation(a: Assessment): ClinicalCoreProtocolActivation {
  const diagResult = buildDiagnosticResult(a);
  return {
    protocolId: session.protocolId,
    label: "Anafilaxia",
    status: diagResult.grade >= 2 ? "active" : diagResult.grade === 1 ? "suggested" : "available",
    rationale:
      diagResult.grade >= 2
        ? "O caso ja preenche criterio clinico para conduzir dentro do protocolo de anafilaxia."
        : diagResult.grade === 1
          ? "Ha reacao alergica isolada; manter o protocolo disponivel caso haja progressao sistemica."
          : "A anafilaxia segue como possibilidade clinica e a avaliacao dirigida deve continuar.",
  };
}

function getCoreWorkflowSnapshot(): ClinicalCoreWorkflowSnapshot {
  const a = session.assessment;
  const suggestions = buildTreatmentSuggestions(a);
  const diagResult = suggestions.diagResult;
  const flags = suggestions.flags;
  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  const pam = sbp != null && dbp != null ? `${formatMap(sbp, dbp)} mmHg` : "—";
  const weightMissing = !a.weightKg.trim();
  const criticalAlerts = buildCoreSeverityAlerts(a);
  const immediateActions = buildCoreImmediateActions(a);
  const hypotheses = buildCoreHypotheses(a);
  const activeProtocol = buildProtocolActivation(a);

  const steps: ClinicalCoreWorkflowStep[] = [
    {
      id: "patient_identification",
      title: "Patient Identification",
      status: weightMissing ? "blocked" : a.age.trim() ? "completed" : "active",
      summary: weightMissing
        ? "Peso ausente: bloqueia calculos de dose e progressao segura."
        : "Dados essenciais de identificacao disponiveis para conduzir o caso.",
      required: true,
      progressionBlocked: weightMissing,
      cards: [
        { label: "Idade", value: a.age || "—" },
        { label: "Peso", value: a.weightKg ? `${a.weightKg} kg` : "Obrigatorio", emphasis: weightMissing ? "danger" : "default" },
        { label: "Altura", value: a.heightCm ? `${a.heightCm} cm` : "—" },
        { label: "Sexo", value: a.sex || "—" },
      ],
    },
    {
      id: "primary_assessment",
      title: "Primary Assessment (ABCDE)",
      status: hasMinimumClassificationData(a) ? "completed" : "active",
      summary: "Organiza os achados iniciais do caso antes do fechamento diagnostico.",
      cards: [
        { label: "A", value: flags.airway ? "Comprometida" : flags.airwayWarning ? "Alerta de via aerea" : "Sem dado critico registrado", emphasis: flags.airway ? "danger" : flags.airwayWarning ? "warning" : "default" },
        { label: "B", value: a.spo2 ? `SpO2 ${a.spo2}%${flags.respiratoryFailure ? " + insuficiencia respiratoria" : ""}` : "Respiracao sem parametrizacao objetiva", emphasis: flags.respiratoryFailure ? "danger" : "default" },
        { label: "C", value: sbp != null && dbp != null ? `${a.systolicPressure}/${a.diastolicPressure} mmHg · PAM ${pam}` : "Circulacao sem PA completa", emphasis: flags.shock ? "danger" : "default" },
        { label: "D", value: a.gcs ? `GCS ${a.gcs}` : "Sem GCS registrado", emphasis: flags.coma ? "danger" : "default" },
        { label: "E", value: a.exposureType || "Gatilho ainda nao definido" },
      ],
    },
    {
      id: "automatic_severity_detection",
      title: "Automatic Severity Detection",
      status: criticalAlerts.some((alert) => alert.severity === "critical") ? "critical" : diagResult.grade > 0 ? "completed" : "active",
      summary: diagResult.grade > 0 ? `${diagResult.label}: ${diagResult.sublabel}` : "O sistema ainda precisa de mais dados para graduar o caso.",
      alerts: criticalAlerts,
    },
    {
      id: "immediate_intervention",
      title: "Immediate Intervention Layer",
      status: immediateActions.some((action) => action.priority === "immediate" && !action.selected) ? "critical" : "active",
      summary: "Intervencoes de alto impacto devem permanecer visiveis durante todo o atendimento.",
      actions: immediateActions,
    },
    {
      id: "directed_clinical_evaluation",
      title: "Directed Clinical Evaluation",
      status: a.symptoms.trim() ? "completed" : "active",
      summary: buildDirectedEvaluationSummary(a),
      cards: [
        { label: "Gatilho", value: a.exposureType || "—" },
        { label: "Detalhe", value: a.exposureDetail || "—" },
        { label: "Inicio", value: a.timeOnsetMin ? `${a.timeOnsetMin} min` : "—" },
        { label: "Achados", value: a.symptoms || "—" },
      ],
    },
    {
      id: "diagnostic_hypotheses",
      title: "Diagnostic Hypotheses Engine",
      status: hypotheses[0]?.probability === "high" ? "completed" : "active",
      summary: hypotheses.map((item) => `${item.label} (${item.probability})`).join(" · "),
      cards: hypotheses.map((item) => ({
        label: item.label,
        value: item.rationale,
        emphasis: item.probability === "high" ? "danger" : item.probability === "moderate" ? "warning" : "default",
      })),
    },
    {
      id: "protocol_activation",
      title: "Protocol Activation",
      status: activeProtocol.status === "active" ? "completed" : activeProtocol.status === "suggested" ? "ready" : "pending",
      summary: activeProtocol.rationale,
      cards: [{ label: activeProtocol.label, value: activeProtocol.status }],
    },
    {
      id: "complementary_exams",
      title: "Complementary Exams",
      status: a.investigationPlan.trim() ? "completed" : "ready",
      summary: suggestions.investigationSuggestion,
      cards: [
        { label: "Plano atual", value: a.investigationPlan || "Nenhum exame confirmado ainda" },
        { label: "Sugestao", value: suggestions.investigationSuggestion },
      ],
    },
    {
      id: "diagnosis",
      title: "Diagnosis",
      status: diagResult.grade > 0 ? "completed" : "active",
      summary: diagResult.grade > 0 ? diagResult.criteriaText : "A avaliacao segue aberta.",
      cards: [
        { label: "Provavel/final", value: diagResult.label, emphasis: diagResult.tone === "danger" ? "danger" : diagResult.tone === "warning" ? "warning" : "default" },
        { label: "Urgencia adrenalina", value: diagResult.adrenalineUrgency },
      ],
    },
    {
      id: "treatment_plan",
      title: "Treatment Plan",
      status: weightMissing ? "blocked" : "active",
      summary: weightMissing
        ? "O peso precisa ser preenchido para fechar doseamento de forma segura."
        : "Plano de tratamento montado com base na gravidade e no peso do paciente.",
      progressionBlocked: weightMissing,
      cards: [
        { label: "Adrenalina IM", value: suggestions.adrenalineSuggestion, emphasis: diagResult.adrenalineUrgency === "immediate" ? "danger" : "default" },
        { label: "Oxigenio / via aerea", value: suggestions.airwaySuggestion },
        { label: "Volume", value: suggestions.fluidSuggestion },
        { label: "Dose baseada no peso", value: parseNum(a.weightKg) != null ? `${suggestedAdrenalineImMg(parseNum(a.weightKg)!)} mg IM` : "Peso obrigatorio para dose precisa" },
      ],
      actions: immediateActions,
    },
    {
      id: "patient_destination",
      title: "Patient Destination",
      status: a.destination.trim() ? "completed" : "ready",
      summary: suggestions.destinationSuggestion,
      cards: [
        { label: "Observacao", value: suggestions.observationSuggestion },
        { label: "Destino sugerido", value: suggestions.destinationSuggestion, emphasis: flags.shock || flags.airway || flags.coma ? "danger" : "default" },
        { label: "Destino registrado", value: a.destination || "—" },
      ],
    },
  ];

  return {
    workflowId: "core_clinical_flow",
    protocolId: session.protocolId,
    protocolLabel: "Anafilaxia",
    patient: {
      age: a.age,
      weightKg: a.weightKg,
      heightCm: a.heightCm || undefined,
      sex: a.sex || undefined,
    },
    blockingIssues: weightMissing ? ["Peso obrigatorio para todos os calculos de dose."] : [],
    criticalAlerts,
    hypotheses,
    activeProtocol,
    steps,
  };
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
  getCoreWorkflowSnapshot,
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
