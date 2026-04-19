import raw from "./protocols/acidente_vascular_cerebral.json";
import type {
  AuxiliaryPanel,
  AuxiliaryPanelField,
  AuxiliaryPanelRecommendation,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";
import { createAuditEntry } from "./avc/audit";
import { calculateThrombolyticDose } from "./avc/calculators";
import type { AvcAuditEntry, AvcCaseSnapshot, AvcContraSnapshot } from "./avc/domain";
import { buildDecisionSummaryText, evaluateAvcDecision } from "./avc/eligibility";
import { computeNihssTotal, classifyNihss, hasPotentiallyDisablingDeficit, isNihssComplete } from "./avc/nihss";
import { clearAvcDraft, loadAvcDraft, saveAvcDraft } from "./avc/persistence";
import { buildAvcPrescriptionTemplates } from "./avc/prescriptions";
import { AVC_DESTINATION_LABELS, CONTRAINDICATIONS, NIHSS_ITEMS, THROMBOLYTICS } from "./avc/protocol-config";

type State = {
  type: "action" | "end";
  text: string;
  details?: string[];
  next?: string;
  phase?: string;
  phaseLabel?: string;
  phaseStep?: number;
  phaseTotal?: number;
};

type Protocol = {
  id: string;
  initialState: string;
  states: Record<string, State>;
};

type Assessment = {
  responsibleClinician: string;
  patientName: string;
  patientId: string;
  age: string;
  sex: string;
  weightKg: string;
  estimatedWeight: string;
  heightCm: string;
  allergies: string;
  comorbidities: string;
  antithrombotics: string;
  renalFunction: string;
  glucoseInitial: string;
  arrivalTime: string;
  symptomOnsetTime: string;
  lastKnownWellTime: string;
  timePrecision: string;
  origin: string;
  symptoms: string;
  laterality: string;
  strokeMimicConcern: string;
  abcInstability: string;
  airwayProtection: string;
  disablingDeficit: string;
  systolicPressure: string;
  diastolicPressure: string;
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  oxygenSaturation: string;
  glucoseCurrent: string;
  consciousnessLevel: string;
  stabilizationActions: string;
  pressureControlActions: string;
  glucoseCorrectionActions: string;
  seizureManagement: string;
  venousAccess: string;
  monitoring: string;
  ctRequestedAt: string;
  ctPerformedAt: string;
  ctReadAt: string;
  ctResult: string;
  earlyIschemiaSigns: string;
  ctaPerformed: string;
  ctaResult: string;
  lvoSuspicion: string;
  lvoSite: string;
  imageDelayReason: string;
  platelets: string;
  inr: string;
  aptt: string;
  creatinine: string;
  selectedThrombolyticId: string;
  finalMedicalDecision: string;
  doubleCheckStatus: string;
  destinationOverride: string;
  postCareChecklist: string;
  auditComment: string;
} & Record<string, string>;

type Session = {
  protocolId: string;
  currentStateId: string;
  previousStateIds: string[];
  pendingEffects: EngineEffect[];
  protocolStartedAt: number;
  assessment: Assessment;
  auditTrail: AvcAuditEntry[];
  decisionSignature: string;
};

const protocolData = raw as Protocol;

function parseNum(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatElapsed(startedAt: number) {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function toggleTokenValue(current: string, token: string) {
  const values = current
    .split(" | ")
    .map((part) => part.trim())
    .filter(Boolean);
  const normalized = token.trim().toLowerCase();
  const exists = values.some((item) => item.toLowerCase() === normalized);
  return (exists ? values.filter((item) => item.toLowerCase() !== normalized) : [...values, token.trim()]).join(" | ");
}

function tokensFromValue(value: string) {
  return value
    .split(" | ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function deriveLateralityFromSymptoms(value: string) {
  const tokens = tokensFromValue(value);
  const hasRight = tokens.some((token) => /direit/i.test(token));
  const hasLeft = tokens.some((token) => /esquerd/i.test(token));
  const hasBilateral = tokens.some((token) => /bilateral/i.test(token));

  if (hasBilateral || (hasRight && hasLeft)) return "Bilateral";
  if (hasRight) return "Direita";
  if (hasLeft) return "Esquerda";
  return "";
}

function deriveMimicConcernFromSymptoms(value: string) {
  const tokens = tokensFromValue(value);
  return tokens.some((token) => token.toLowerCase().includes("mimetizador")) ? "yes" : "";
}

function deriveDisablingDeficitFromSymptoms(value: string) {
  const tokens = tokensFromValue(value);
  return tokens.some((token) => token.toLowerCase().includes("incapacitante")) ? "yes" : "";
}

function deriveConsciousnessFromNihss(a: Assessment) {
  const level1a = parseNum(a.nihss1a);
  const level1b = parseNum(a.nihss1b);
  const level1c = parseNum(a.nihss1c);

  if (level1a === 3) return "Sem resposta adequada";
  if (level1a === 2) return "Obnubilado";
  if (level1a === 1) return "Sonolento";
  if (level1a === 0 && ((level1b ?? 0) > 0 || (level1c ?? 0) > 0)) return "Confuso / não obedece plenamente";
  if (level1a === 0) return "Alerta";
  return "";
}

function buildImmediateStabilizationAlerts(a: Assessment) {
  const systolic = parseNum(a.systolicPressure);
  const diastolic = parseNum(a.diastolicPressure);
  const heartRate = parseNum(a.heartRate);
  const respiratoryRate = parseNum(a.respiratoryRate);
  const oxygenSaturation = parseNum(a.oxygenSaturation);
  const glucose = parseNum(a.glucoseCurrent) ?? parseNum(a.glucoseInitial);
  const temperature = parseNum(a.temperature);
  const alerts: string[] = [];
  const interventions: string[] = [];

  if (a.abcInstability === "yes") {
    alerts.push("Instabilidade ABC já documentada");
    interventions.push("Estabilizar ABC antes da reperfusão");
  }

  if (a.airwayProtection === "yes") {
    alerts.push("Via aérea sem proteção adequada");
    interventions.push("Proteger via aérea e prevenir aspiração");
  }

  if (oxygenSaturation != null && oxygenSaturation < 94) {
    alerts.push(`Hipoxemia (SpO₂ ${oxygenSaturation}%)`);
    interventions.push("Oxigênio suplementar e monitorização contínua");
  }

  if (respiratoryRate != null && (respiratoryRate < 10 || respiratoryRate > 30)) {
    alerts.push(`Padrão respiratório de risco (FR ${respiratoryRate})`);
    interventions.push("Reavaliar ventilação, esforço respiratório e via aérea");
  }

  if (glucose != null && glucose < 70) {
    alerts.push(`Hipoglicemia (${glucose} mg/dL)`);
    interventions.push("Corrigir glicemia imediatamente e repetir controle");
  } else if (glucose != null && glucose > 180) {
    alerts.push(`Hiperglicemia relevante (${glucose} mg/dL)`);
    interventions.push("Tratar hiperglicemia e repetir glicemia seriada");
  }

  if (systolic != null && systolic < 90) {
    alerts.push(`Hipotensão / choque (PAS ${systolic})`);
    interventions.push("Estabilizar perfusão e investigar causa não neurológica");
  } else if ((systolic != null && systolic >= 220) || (diastolic != null && diastolic >= 120)) {
    alerts.push(`PA criticamente elevada (${systolic ?? "?"}/${diastolic ?? "?"})`);
    interventions.push("Controle pressórico imediato antes de seguir");
  } else if ((systolic != null && systolic >= 185) || (diastolic != null && diastolic >= 110)) {
    alerts.push(`PA acima da meta para trombólise (${systolic ?? "?"}/${diastolic ?? "?"})`);
    interventions.push("Baixar PA para meta segura se reperfusão IV estiver em discussão");
  }

  if (heartRate != null && (heartRate < 40 || heartRate > 150)) {
    alerts.push(`FC em faixa de arritmia instável (${heartRate} bpm)`);
    interventions.push("Checar ritmo, ECG e tratar arritmia com instabilidade");
  }

  if (temperature != null && temperature >= 37.8) {
    alerts.push(`Febre (${temperature} °C)`);
    interventions.push("Controlar temperatura e pesquisar gatilho infeccioso");
  }

  if (/convuls/i.test(a.symptoms) || /convuls/i.test(a.seizureManagement)) {
    alerts.push("Convulsão / pós-ictal no contexto");
    interventions.push("Abortar crise, reavaliar mimetizador e proteger via aérea");
  }

  return {
    alerts,
    interventions: Array.from(new Set(interventions)),
    urgency:
      alerts[0] ??
      "Sem alerta crítico imediato documentado",
  };
}

function buildEmptyAssessment(): Assessment {
  const assessment: Assessment = {
    responsibleClinician: "",
    patientName: "",
    patientId: "",
    age: "",
    sex: "",
    weightKg: "",
    estimatedWeight: "",
    heightCm: "",
    allergies: "",
    comorbidities: "",
    antithrombotics: "",
    renalFunction: "",
    glucoseInitial: "",
    arrivalTime: "",
    symptomOnsetTime: "",
    lastKnownWellTime: "",
    timePrecision: "",
    origin: "",
    symptoms: "",
    laterality: "",
    strokeMimicConcern: "",
    abcInstability: "",
    airwayProtection: "",
    disablingDeficit: "",
    systolicPressure: "",
    diastolicPressure: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSaturation: "",
    glucoseCurrent: "",
    consciousnessLevel: "",
    stabilizationActions: "",
    pressureControlActions: "",
    glucoseCorrectionActions: "",
    seizureManagement: "",
    venousAccess: "",
    monitoring: "",
    ctRequestedAt: "",
    ctPerformedAt: "",
    ctReadAt: "",
    ctResult: "",
    earlyIschemiaSigns: "",
    ctaPerformed: "",
    ctaResult: "",
    lvoSuspicion: "",
    lvoSite: "",
    imageDelayReason: "",
    platelets: "",
    inr: "",
    aptt: "",
    creatinine: "",
    selectedThrombolyticId: "",
    finalMedicalDecision: "",
    doubleCheckStatus: "",
    destinationOverride: "",
    postCareChecklist: "",
    auditComment: "",
  };

  NIHSS_ITEMS.forEach((item) => {
    assessment[item.id] = "";
  });

  CONTRAINDICATIONS.forEach((item) => {
    assessment[`contra_${item.id}_status`] = "unknown";
    assessment[`contra_${item.id}_notes`] = "";
    assessment[`contra_${item.id}_final`] = "";
  });

  return assessment;
}

function serializeDraft(session: Session) {
  return {
    protocolId: session.protocolId,
    currentStateId: session.currentStateId,
    previousStateIds: session.previousStateIds,
    protocolStartedAt: session.protocolStartedAt,
    assessment: session.assessment,
    auditTrail: session.auditTrail,
    decisionSignature: session.decisionSignature,
  };
}

function buildContraMap(a: Assessment) {
  return Object.fromEntries(
    CONTRAINDICATIONS.map((item) => [
      item.id,
      {
        status: (a[`contra_${item.id}_status`] as AvcContraSnapshot["status"]) ?? "unknown",
        correctionNotes: a[`contra_${item.id}_notes`] ?? "",
        finalDecision: a[`contra_${item.id}_final`] ?? "",
      },
    ])
  ) as Record<string, AvcContraSnapshot>;
}

function buildSnapshot(a: Assessment): AvcCaseSnapshot {
  const scores = Object.fromEntries(
    NIHSS_ITEMS.map((item) => [item.id, parseNum(a[item.id])])
  ) as Record<string, number | null>;
  const meanArterialPressure =
    parseNum(a.systolicPressure) != null && parseNum(a.diastolicPressure) != null
      ? Math.round((parseNum(a.systolicPressure)! + 2 * parseNum(a.diastolicPressure)!) / 3)
      : null;
  const nihss = {
    scores,
    total: computeNihssTotal(scores),
    complete: isNihssComplete(scores),
    severity: classifyNihss(computeNihssTotal(scores)),
  };

  const base: AvcCaseSnapshot = {
    patient: {
      responsibleClinician: a.responsibleClinician,
      patientName: a.patientName,
      patientId: a.patientId,
      age: parseNum(a.age),
      sex: a.sex,
      weightKg: parseNum(a.weightKg),
      heightCm: parseNum(a.heightCm),
      allergies: a.allergies,
      comorbidities: a.comorbidities,
      antithrombotics: a.antithrombotics,
      renalFunction: a.renalFunction,
      glucoseInitial: parseNum(a.glucoseInitial),
      origin: a.origin,
    },
    timing: {
      arrivalTime: a.arrivalTime,
      symptomOnsetTime: a.symptomOnsetTime,
      lastKnownWellTime: a.lastKnownWellTime,
      timePrecision: (a.timePrecision as AvcCaseSnapshot["timing"]["timePrecision"]) || "unknown",
    },
    symptoms: {
      symptoms: a.symptoms,
      laterality: a.laterality,
      strokeMimicConcern: a.strokeMimicConcern as AvcCaseSnapshot["symptoms"]["strokeMimicConcern"],
      abcInstability: a.abcInstability as AvcCaseSnapshot["symptoms"]["abcInstability"],
      airwayProtection: a.airwayProtection as AvcCaseSnapshot["symptoms"]["airwayProtection"],
      disablingDeficit:
        a.disablingDeficit === "yes" || (a.disablingDeficit !== "no" && hasPotentiallyDisablingDeficit(scores))
          ? "yes"
          : (a.disablingDeficit as AvcCaseSnapshot["symptoms"]["disablingDeficit"]) || "unknown",
    },
    vitals: {
      systolicPressure: parseNum(a.systolicPressure),
      diastolicPressure: parseNum(a.diastolicPressure),
      meanArterialPressure,
      heartRate: parseNum(a.heartRate),
      respiratoryRate: parseNum(a.respiratoryRate),
      temperature: parseNum(a.temperature),
      oxygenSaturation: parseNum(a.oxygenSaturation),
      glucoseCurrent: parseNum(a.glucoseCurrent),
      consciousnessLevel: a.consciousnessLevel,
      stabilizationActions: a.stabilizationActions,
      pressureControlActions: a.pressureControlActions,
      glucoseCorrectionActions: a.glucoseCorrectionActions,
      seizureManagement: a.seizureManagement,
      venousAccess: a.venousAccess,
      monitoring: a.monitoring,
    },
    imaging: {
      ctRequestedAt: a.ctRequestedAt,
      ctPerformedAt: a.ctPerformedAt,
      ctReadAt: a.ctReadAt,
      ctResult: a.ctResult,
      earlyIschemiaSigns: a.earlyIschemiaSigns,
      ctaPerformed: a.ctaPerformed as AvcCaseSnapshot["imaging"]["ctaPerformed"],
      ctaResult: a.ctaResult,
      lvoSuspicion: a.lvoSuspicion as AvcCaseSnapshot["imaging"]["lvoSuspicion"],
      lvoSite: a.lvoSite,
      imageDelayReason: a.imageDelayReason,
    },
    labs: {
      platelets: parseNum(a.platelets),
      inr: parseNum(a.inr),
      aptt: parseNum(a.aptt),
      creatinine: parseNum(a.creatinine),
    },
    contraindications: buildContraMap(a),
    nihss,
    decision: {
      pathway: "undetermined",
      syndromeLabel: "AVC em definição",
      ivThrombolysis: { gate: "needs_review", label: "Em revisão", rationale: [], blockers: [], correctableItems: [] },
      thrombectomy: { gate: "needs_review", label: "Em revisão", rationale: [], blockers: [], correctableItems: [] },
      hemorrhagePlan: { gate: "needs_review", label: "Em revisão", rationale: [], blockers: [], correctableItems: [] },
      destination: { recommended: "observacao", rationale: [] },
      selectedThrombolyticId: a.selectedThrombolyticId || "alteplase",
      finalMedicalDecision: a.finalMedicalDecision,
      doubleCheckStatus: a.doubleCheckStatus,
    },
    dose: {
      thrombolyticId: a.selectedThrombolyticId || "alteplase",
      totalDoseMg: null,
      bolusDoseMg: null,
      infusionDoseMg: null,
      infusionMinutes: null,
      caution: [],
    },
  };

  const decision = evaluateAvcDecision(base);
  const dose = calculateThrombolyticDose(
    decision.selectedThrombolyticId,
    base.patient.weightKg,
    a.estimatedWeight === "yes"
  );
  return { ...base, decision, dose };
}

function buildMetrics(snapshot: AvcCaseSnapshot) {
  const metrics = [
    {
      label: "PA (PAS/PAD)",
      value:
        snapshot.vitals.systolicPressure != null && snapshot.vitals.diastolicPressure != null
          ? `${snapshot.vitals.systolicPressure}/${snapshot.vitals.diastolicPressure} mmHg`
          : "⚠️ PA pendente",
    },
    {
      label: "PAM",
      value: snapshot.vitals.meanArterialPressure != null ? `${snapshot.vitals.meanArterialPressure} mmHg` : "⚠️ PAM pendente",
    },
    {
      label: "NIHSS",
      value: snapshot.nihss.complete ? `${snapshot.nihss.total} · ${snapshot.nihss.severity}` : "⚠️ NIHSS incompleto",
    },
    {
      label: "Imagem",
      value: snapshot.imaging.ctResult ? snapshot.imaging.ctResult.split("_").join(" ") : "⚠️ TC pendente",
    },
    {
      label: "Reperfusão IV",
      value: snapshot.decision.ivThrombolysis.label,
    },
    {
      label: "Trombectomia",
      value: snapshot.decision.thrombectomy.label,
    },
  ];
  return metrics;
}

function buildRecommendations(snapshot: AvcCaseSnapshot): AuxiliaryPanelRecommendation[] {
  const recommendations: AuxiliaryPanelRecommendation[] = [];
  recommendations.push({
    title: snapshot.decision.ivThrombolysis.label,
    tone:
      snapshot.decision.ivThrombolysis.gate === "eligible"
        ? "info"
        : snapshot.decision.ivThrombolysis.gate === "correctable"
          ? "warning"
          : "danger",
    priority: "high",
    lines: [
      ...snapshot.decision.ivThrombolysis.rationale,
      ...snapshot.decision.ivThrombolysis.blockers.map((line) => `Bloqueio: ${line}`),
      ...snapshot.decision.ivThrombolysis.correctableItems.map((line) => `Correção: ${line}`),
    ],
  });

  recommendations.push({
    title: snapshot.decision.thrombectomy.label,
    tone:
      snapshot.decision.thrombectomy.gate === "eligible"
        ? "warning"
        : snapshot.decision.thrombectomy.gate === "needs_review"
          ? "warning"
          : "info",
    priority: "high",
    lines: [
      ...snapshot.decision.thrombectomy.rationale,
      ...snapshot.decision.thrombectomy.blockers.map((line) => `Bloqueio: ${line}`),
      ...snapshot.decision.thrombectomy.correctableItems.map((line) => `Pendência: ${line}`),
    ],
  });

  if (snapshot.decision.pathway === "hemorrhagic") {
    recommendations.push({
      title: snapshot.decision.hemorrhagePlan.label,
      tone: "danger",
      priority: "high",
      lines: snapshot.decision.hemorrhagePlan.rationale,
    });
  }

  if (snapshot.patient.weightKg != null) {
    const drug = THROMBOLYTICS.find((item) => item.id === snapshot.dose.thrombolyticId) ?? THROMBOLYTICS[0];
    const doseLines = [
      snapshot.dose.totalDoseMg != null ? `Dose total: ${snapshot.dose.totalDoseMg.toFixed(1)} mg` : "Dose total: peso pendente",
      snapshot.dose.bolusDoseMg != null ? `Bolus: ${snapshot.dose.bolusDoseMg.toFixed(1)} mg` : null,
      snapshot.dose.infusionDoseMg != null ? `Infusão: ${snapshot.dose.infusionDoseMg.toFixed(1)} mg em ${snapshot.dose.infusionMinutes} min` : null,
      ...snapshot.dose.caution,
      drug.note,
    ].filter(Boolean) as string[];

    recommendations.push({
      title: `Calculadora — ${drug.label}`,
      tone: "info",
      priority: "medium",
      lines: doseLines,
    });
  }

  for (const template of buildAvcPrescriptionTemplates(snapshot)) {
    recommendations.push({
      title: template.title,
      tone: template.tone,
      priority: "medium",
      lines: template.lines,
    });
  }

  return recommendations;
}

function actorName() {
  return session.assessment.responsibleClinician.trim() || "Profissional não identificado";
}

function persistCurrentSession() {
  saveAvcDraft(serializeDraft(session));
}

function buildHistoryLog(): ClinicalLogEntry[] {
  return session.auditTrail.map((entry) => ({
    timestamp: entry.timestamp,
    kind: entry.kind,
    title: entry.label,
    details: [entry.details, entry.metadata ? Object.entries(entry.metadata).map(([key, value]) => `${key}: ${value}`).join(" • ") : ""].filter(Boolean).join(" | "),
  }));
}

function field(label: string, id: keyof Assessment | string, value: string, section: string, extra?: Partial<AuxiliaryPanelField>): AuxiliaryPanelField {
  return {
    id: String(id),
    label,
    value,
    section,
    ...extra,
  };
}

function statusField(section: string, definitionId: string, label: string, helperText: string): AuxiliaryPanelField[] {
  return [
    field(label, `contra_${definitionId}_status`, session.assessment[`contra_${definitionId}_status`], section, {
      helperText,
      presets: [
        { label: "Ausente", value: "absent" },
        { label: "Presente", value: "present" },
        { label: "Desconhecido", value: "unknown" },
      ],
    }),
    field("Como corrigir / observação", `contra_${definitionId}_notes`, session.assessment[`contra_${definitionId}_notes`], section, {
      placeholder: "Registrar ação corretiva, motivo ou pendência",
      fullWidth: true,
    }),
    field("Decisão final por item", `contra_${definitionId}_final`, session.assessment[`contra_${definitionId}_final`], section, {
      placeholder: "Ex.: mantido bloqueio / corrigido e liberado / depende neurologia",
      fullWidth: true,
    }),
  ];
}

function buildFields(snapshot: AvcCaseSnapshot): AuxiliaryPanelField[] {
  const derivedConsciousness = deriveConsciousnessFromNihss(session.assessment);
  if (derivedConsciousness) {
    session.assessment.consciousnessLevel = derivedConsciousness;
  }
  const stabilizationAlerts = buildImmediateStabilizationAlerts(session.assessment);
  const fields: AuxiliaryPanelField[] = [
    field("Responsável pelo preenchimento", "responsibleClinician", session.assessment.responsibleClinician, "Responsável e identificação", { placeholder: "Nome / plantonista", fullWidth: true }),
    field("Paciente", "patientName", session.assessment.patientName, "Responsável e identificação", { placeholder: "Identificação do paciente" }),
    field("Registro / leito", "patientId", session.assessment.patientId, "Responsável e identificação", { placeholder: "Prontuário / leito" }),
    field("Idade (anos)", "age", session.assessment.age, "Responsável e identificação", {
      presets: ["18", "30", "40", "50", "60", "70", "80", "90"].map((value) => ({ label: value, value })),
    }),
    field("Sexo", "sex", session.assessment.sex, "Responsável e identificação", {
      presets: [
        { label: "Masculino", value: "Masculino" },
        { label: "Feminino", value: "Feminino" },
      ],
    }),
    field("Peso (kg)", "weightKg", session.assessment.weightKg, "Responsável e identificação", {
      presets: ["40", "50", "60", "70", "80", "90", "100", "120"].map((value) => ({ label: value, value })),
    }),
    field("Peso estimado?", "estimatedWeight", session.assessment.estimatedWeight, "Responsável e identificação", {
      presets: [
        { label: "Não", value: "no" },
        { label: "Sim", value: "yes" },
      ],
    }),
    field("Altura (cm)", "heightCm", session.assessment.heightCm, "Responsável e identificação", { keyboardType: "numeric" }),
    field("Hora de chegada", "arrivalTime", session.assessment.arrivalTime, "Tempos críticos", { placeholder: "HH:MM" }),
    field("Início dos sintomas", "symptomOnsetTime", session.assessment.symptomOnsetTime, "Tempos críticos", { placeholder: "HH:MM" }),
    field("Última vez normal", "lastKnownWellTime", session.assessment.lastKnownWellTime, "Tempos críticos", { placeholder: "HH:MM" }),
    field("Confiabilidade do horário", "timePrecision", session.assessment.timePrecision, "Tempos críticos", {
      presets: [
        { label: "Exato", value: "exact" },
        { label: "Estimado", value: "estimated" },
        { label: "Desconhecido", value: "unknown" },
      ],
    }),
    field("Origem do paciente", "origin", session.assessment.origin, "Tempos críticos", {
      presets: [
        { label: "SAMU", value: "SAMU" },
        { label: "Demanda espontânea", value: "Demanda espontânea" },
        { label: "Transferência", value: "Transferência" },
        { label: "Internado", value: "Internado" },
      ],
    }),
    field("Alergias", "allergies", session.assessment.allergies, "História clínica relevante", { fullWidth: true }),
    field("Comorbidades relevantes", "comorbidities", session.assessment.comorbidities, "História clínica relevante", {
      fullWidth: true,
      presetMode: "toggle_token",
      presets: [
        { label: "HAS", value: "HAS" },
        { label: "DM", value: "DM" },
        { label: "FA", value: "FA" },
        { label: "DAC", value: "DAC" },
        { label: "Insuficiência cardíaca", value: "Insuficiência cardíaca" },
        { label: "DRC", value: "DRC" },
        { label: "AVC prévio", value: "AVC prévio" },
        { label: "Neoplasia", value: "Neoplasia" },
      ],
    }),
    field("Antiagregantes / anticoagulantes", "antithrombotics", session.assessment.antithrombotics, "História clínica relevante", {
      fullWidth: true,
      presetMode: "toggle_token",
      presets: [
        { label: "Sem uso", value: "Sem uso" },
        { label: "AAS", value: "AAS" },
        { label: "Clopidogrel", value: "Clopidogrel" },
        { label: "Dupla antiagregação", value: "Dupla antiagregação" },
        { label: "Varfarina", value: "Varfarina" },
        { label: "DOAC", value: "DOAC" },
        { label: "Heparina recente", value: "Heparina recente" },
      ],
    }),
    field("Função renal / observação", "renalFunction", session.assessment.renalFunction, "História clínica relevante", {
      fullWidth: true,
      presets: [
        { label: "Sem DRC conhecida", value: "Sem DRC conhecida" },
        { label: "DRC leve/moderada", value: "DRC leve/moderada" },
        { label: "DRC avançada", value: "DRC avançada" },
        { label: "Em diálise", value: "Em diálise" },
        { label: "Creatinina pendente", value: "Creatinina pendente" },
      ],
    }),
    field("Glicemia capilar inicial", "glucoseInitial", session.assessment.glucoseInitial, "Tempos críticos", {
      keyboardType: "numeric",
      helperText: "Valor da chegada. Hipoglicemia e hiperglicemia podem simular ou agravar o déficit neurológico.",
    }),

    field("Sintomas atuais", "symptoms", session.assessment.symptoms, "Sintomas e quadro neurológico", {
      fullWidth: true,
      presetMode: "toggle_token",
      presets: [
        { label: "Hemiparesia direita", value: "Hemiparesia direita" },
        { label: "Hemiparesia esquerda", value: "Hemiparesia esquerda" },
        { label: "Paresia facial direita", value: "Paresia facial direita" },
        { label: "Paresia facial esquerda", value: "Paresia facial esquerda" },
        { label: "Afasia", value: "Afasia" },
        { label: "Disartria", value: "Disartria" },
        { label: "Desvio do olhar", value: "Desvio do olhar" },
        { label: "Hemianopsia", value: "Hemianopsia" },
        { label: "Ataxia", value: "Ataxia" },
        { label: "Rebaixamento de consciência", value: "Rebaixamento de consciência" },
        { label: "Convulsão", value: "Convulsão" },
        { label: "Cefaleia súbita", value: "Cefaleia súbita" },
        { label: "Déficit incapacitante", value: "Déficit incapacitante" },
        { label: "Possível mimetizador", value: "Possível mimetizador" },
      ],
    }),

    field("Prioridade clínica imediata", "stabilizationUrgency", stabilizationAlerts.urgency, "Gravidade e intervenções imediatas", {
      fullWidth: true,
      readOnly: true,
      helperText: stabilizationAlerts.alerts.length
        ? stabilizationAlerts.alerts.join(" · ")
        : "Sem gatilho crítico documentado até agora. Esta área deve responder se há algo a tratar antes de seguir para reperfusão.",
    }),
    field(
      "Intervenções sugeridas agora",
      "stabilizationSuggestedInterventions",
      stabilizationAlerts.interventions.join(" | "),
      "Gravidade e intervenções imediatas",
      {
        fullWidth: true,
        readOnly: true,
        presetMode: "toggle_token",
        helperText: stabilizationAlerts.interventions.length
          ? "Sugestões automáticas geradas a partir dos dados preenchidos nesta etapa."
          : "Sem intervenção automática sugerida. Se o caso estiver estável, prossiga com monitorização e documentação objetiva.",
      }
    ),
    field("ABC instável", "abcInstability", session.assessment.abcInstability, "Gravidade e intervenções imediatas", {
      helperText: "Marque instabilidade respiratória, hemodinâmica ou rebaixamento que exija abordagem antes da reperfusão.",
      presets: [
        { label: "Sim", value: "yes" },
        { label: "Não", value: "no" },
        { label: "Em revisão", value: "unknown" },
      ],
    }),
    field("Proteção de via aérea necessária", "airwayProtection", session.assessment.airwayProtection, "Gravidade e intervenções imediatas", {
      helperText: "Use este campo se o paciente não protege via aérea, tem rebaixamento importante ou risco de aspiração.",
      presets: [
        { label: "Sim", value: "yes" },
        { label: "Não", value: "no" },
        { label: "Em revisão", value: "unknown" },
      ],
    }),
    field("Nível de consciência (auto pelo NIHSS)", "consciousnessLevel", derivedConsciousness, "Gravidade e intervenções imediatas", {
      readOnly: true,
      helperText: derivedConsciousness
        ? "Resumo automático a partir dos itens 1a, 1b e 1c do NIHSS."
        : "Será preenchido automaticamente conforme os itens de consciência do NIHSS.",
    }),
    field("Glicemia atual", "glucoseCurrent", session.assessment.glucoseCurrent, "Gravidade e intervenções imediatas", {
      keyboardType: "numeric",
      helperText: "Valor atual para detectar hipoglicemia, hiperglicemia e necessidade de correção imediata antes da decisão neurológica.",
    }),
    field("SpO₂", "oxygenSaturation", session.assessment.oxygenSaturation, "Gravidade e intervenções imediatas", {
      keyboardType: "numeric",
      helperText: "Hipoxemia deve ser corrigida imediatamente; em AVC, alvo usual é SpO₂ ≥ 94%.",
    }),
    field("PAS", "systolicPressure", session.assessment.systolicPressure, "Gravidade e intervenções imediatas", {
      keyboardType: "numeric",
      helperText: "Hipotensão sugere outra causa/choque; pressão alta pode bloquear trombólise se acima da meta.",
    }),
    field("PAD", "diastolicPressure", session.assessment.diastolicPressure, "Gravidade e intervenções imediatas", {
      keyboardType: "numeric",
      helperText: "Use junto com PAS para definir risco hemodinâmico e meta pressórica antes da reperfusão.",
    }),
    field("FC", "heartRate", session.assessment.heartRate, "Gravidade e intervenções imediatas", {
      keyboardType: "numeric",
      helperText: "Taqui ou bradiarritmias graves podem exigir tratamento antes de seguir o fluxo do AVC.",
    }),
    field("FR", "respiratoryRate", session.assessment.respiratoryRate, "Gravidade e intervenções imediatas", {
      keyboardType: "numeric",
      helperText: "FR extrema aponta fadiga, broncoaspiração, insuficiência ventilatória ou crise convulsiva associada.",
    }),
    field("Temperatura", "temperature", session.assessment.temperature, "Gravidade e intervenções imediatas", {
      keyboardType: "decimal-pad",
      helperText: "Febre agrava lesão cerebral e deve ser corrigida quando presente.",
    }),

    field("Ações de estabilização", "stabilizationActions", session.assessment.stabilizationActions, "Condutas de estabilização", {
      fullWidth: true,
      presetMode: "toggle_token",
      helperText: "Registre apenas as medidas feitas agora para estabilizar o caso antes de seguir.",
      presets: [
        { label: "Cabeceira elevada", value: "Cabeceira elevada" },
        { label: "Oxigênio suplementar", value: "Oxigênio suplementar" },
        { label: "Aspiração de vias aéreas", value: "Aspiração de vias aéreas" },
        { label: "Reposicionamento de via aérea", value: "Reposicionamento de via aérea" },
        { label: "Acionada equipe avançada", value: "Acionada equipe avançada" },
      ],
    }),
    field("Controle pressórico", "pressureControlActions", session.assessment.pressureControlActions, "Condutas de estabilização", {
      fullWidth: true,
      presetMode: "toggle_token",
      helperText: "Documente conduta se a PA exigiu intervenção antes da decisão de trombólise.",
      presets: [
        { label: "Sem necessidade imediata", value: "Sem necessidade imediata" },
        { label: "Repetir PA seriada", value: "Repetir PA seriada" },
        { label: "Labetalol", value: "Labetalol" },
        { label: "Nicardipina", value: "Nicardipina" },
        { label: "Meta pressórica definida", value: "Meta pressórica definida" },
      ],
    }),
    field("Correção de glicemia", "glucoseCorrectionActions", session.assessment.glucoseCorrectionActions, "Condutas de estabilização", {
      fullWidth: true,
      presetMode: "toggle_token",
      helperText: "Preencha apenas se glicemia atual exigiu correção antes da interpretação neurológica.",
      presets: [
        { label: "Sem correção necessária", value: "Sem correção necessária" },
        { label: "Glicose EV", value: "Glicose EV" },
        { label: "Insulina", value: "Insulina" },
        { label: "Nova glicemia solicitada", value: "Nova glicemia solicitada" },
      ],
    }),
    field("Manejo de convulsão", "seizureManagement", session.assessment.seizureManagement, "Condutas de estabilização", {
      fullWidth: true,
      presetMode: "toggle_token",
      helperText: "Use se houve crise, atividade pós-ictal ou suspeita de mimetizador com convulsão.",
      presets: [
        { label: "Sem convulsão no momento", value: "Sem convulsão no momento" },
        { label: "Benzodiazepínico", value: "Benzodiazepínico" },
        { label: "Antiepiléptico", value: "Antiepiléptico" },
        { label: "EEG / neurologia acionados", value: "EEG / neurologia acionados" },
      ],
    }),
    field("Acesso venoso", "venousAccess", session.assessment.venousAccess, "Condutas de estabilização", {
      helperText: "Deixe explícito se já há acesso periférico confiável para exames e medicações.",
      presets: [
        { label: "1 acesso periférico", value: "1 acesso periférico" },
        { label: "2 acessos periféricos", value: "2 acessos periféricos" },
        { label: "Acesso difícil", value: "Acesso difícil" },
        { label: "Ainda não obtido", value: "Ainda não obtido" },
      ],
    }),
    field("Monitorização", "monitoring", session.assessment.monitoring, "Condutas de estabilização", {
      fullWidth: true,
      presetMode: "toggle_token",
      helperText: "Marque o que já está em monitorização contínua durante a estabilização.",
      presets: [
        { label: "Monitor cardíaco", value: "Monitor cardíaco" },
        { label: "PA seriada", value: "PA seriada" },
        { label: "SpO₂ contínua", value: "SpO₂ contínua" },
        { label: "Glicemia seriada", value: "Glicemia seriada" },
      ],
    }),
  ];

  const nihssSections: Record<string, string[]> = {
    "NIHSS — consciência": ["nihss1a", "nihss1b", "nihss1c"],
    "NIHSS — olhar e visão": ["nihss2", "nihss3"],
    "NIHSS — face e motricidade": ["nihss4", "nihss5a", "nihss5b", "nihss6a", "nihss6b"],
    "NIHSS — coordenação e sensibilidade": ["nihss7", "nihss8"],
    "NIHSS — linguagem": ["nihss9", "nihss10", "nihss11"],
  };

  Object.entries(nihssSections).forEach(([section, ids]) => {
    ids.forEach((id) => {
      const item = NIHSS_ITEMS.find((entry) => entry.id === id)!;
      fields.push(
        field(item.label, item.id, session.assessment[item.id], section, {
          helperText: item.description,
          presets: item.options.map((option) => ({
            label: `${option.score} — ${option.label}`,
            value: String(option.score),
          })),
        })
      );
    });
  });

  fields.push(
    field("TC sem contraste", "ctResult", session.assessment.ctResult, "Imagem e tempos de TC", {
      fullWidth: true,
      presets: [
        { label: "Sem sangramento", value: "sem_sangramento" },
        { label: "Hemorragia", value: "hemorragia" },
        { label: "Inconclusivo", value: "inconclusivo" },
      ],
      helperText: "⚠️ Campo crítico. A trombólise só pode ser considerada após excluir hemorragia na TC sem contraste.",
    }),
    field("Sinais precoces de isquemia", "earlyIschemiaSigns", session.assessment.earlyIschemiaSigns, "Imagem e tempos de TC", {
      fullWidth: true,
      presetMode: "toggle_token",
      presets: [
        { label: "Apagamento de sulcos", value: "Apagamento de sulcos" },
        { label: "Hipodensidade insular", value: "Hipodensidade insular" },
        { label: "Perda da diferenciação córtico-subcortical", value: "Perda da diferenciação córtico-subcortical" },
        { label: "Obscurecimento do núcleo lentiforme", value: "Obscurecimento do núcleo lentiforme" },
        { label: "Hipodensidade em território da ACM", value: "Hipodensidade em território da ACM" },
        { label: "Sinal da ACM hiperdensa", value: "Sinal da ACM hiperdensa" },
        { label: "Sem sinais precoces evidentes", value: "Sem sinais precoces evidentes" },
      ],
      helperText: "Marque os achados presentes. Se houver descrição fora da lista, complemente em Outros.",
    }),
    field("Suspeita clínica de grande vaso", "lvoSuspicion", session.assessment.lvoSuspicion, "Angiotomografia e grande vaso", {
      helperText: "Opcional. Use apenas se houver suspeita de LVO e necessidade de planejar trombectomia.",
      presets: [
        { label: "Sim", value: "yes" },
        { label: "Não", value: "no" },
        { label: "Indefinido", value: "unknown" },
      ],
    }),
    field("Resultado da AngioTC", "ctaResult", session.assessment.ctaResult, "Angiotomografia e grande vaso", {
      helperText: "Opcional. Não bloqueia a avaliação de trombólise IV se a TC sem contraste já excluiu hemorragia.",
      presets: [
        { label: "Oclusão de grande vaso", value: "oclusao_grande_vaso" },
        { label: "Sem LVO", value: "sem_lvo" },
        { label: "Inconclusivo", value: "inconclusivo" },
        { label: "Não realizada", value: "nao_realizada" },
      ],
    }),
    field("Plaquetas", "platelets", session.assessment.platelets, "Laboratório e anticoagulação", { keyboardType: "numeric" }),
    field("INR", "inr", session.assessment.inr, "Laboratório e anticoagulação", { keyboardType: "decimal-pad" }),
    field("TTPa / aPTT", "aptt", session.assessment.aptt, "Laboratório e anticoagulação", { keyboardType: "decimal-pad" }),
    field("Creatinina", "creatinine", session.assessment.creatinine, "Laboratório e anticoagulação", { keyboardType: "decimal-pad" })
  );

  CONTRAINDICATIONS.filter((item) => item.category === "absolute").forEach((item) => {
    fields.push(...statusField("Contraindicações absolutas", item.id, item.name, `${item.description} ${item.correctable && item.correctionGuidance ? `| ${item.correctionGuidance}` : ""}`));
  });
  CONTRAINDICATIONS.filter((item) => item.category === "relative").forEach((item) => {
    fields.push(...statusField("Contraindicações relativas", item.id, item.name, item.description));
  });
  CONTRAINDICATIONS.filter((item) => item.category === "correctable").forEach((item) => {
    fields.push(...statusField("Contraindicações potencialmente corrigíveis", item.id, item.name, `${item.description} | ${item.correctionGuidance ?? ""}`));
  });
  CONTRAINDICATIONS.filter((item) => item.category === "diagnostic_pending" || item.category === "lab_pending" || item.category === "hemodynamic_pending").forEach((item) => {
    fields.push(...statusField("Pendências diagnósticas e laboratoriais", item.id, item.name, `${item.description} | ${item.correctionGuidance ?? ""}`));
  });

  fields.push(
    field("Trombolítico preferido", "selectedThrombolyticId", session.assessment.selectedThrombolyticId, "Decisão terapêutica e prescrição", {
      presets: THROMBOLYTICS.map((drug) => ({ label: drug.label, value: drug.id })),
      helperText: "As doses e limites vêm da configuração clínica do módulo.",
    }),
    field("Decisão médica final", "finalMedicalDecision", session.assessment.finalMedicalDecision, "Decisão terapêutica e prescrição", {
      fullWidth: true,
      presets: [
        { label: "Trombólise IV", value: "Trombólise IV" },
        { label: "Trombectomia / transferência", value: "Trombectomia / transferência" },
        { label: "AVC hemorrágico — sem reperfusão", value: "AVC hemorrágico — sem reperfusão" },
        { label: "Sem reperfusão", value: "Sem reperfusão" },
      ],
    }),
    field("Dupla checagem de alto risco", "doubleCheckStatus", session.assessment.doubleCheckStatus, "Decisão terapêutica e prescrição", {
      helperText: "Registrar a segunda conferência antes de conduta de alto risco.",
      presets: [
        { label: "Pendente", value: "Pendente" },
        { label: "Conferido por dupla checagem", value: "Conferido por dupla checagem" },
      ],
    }),
    field("Checklist pós-conduta", "postCareChecklist", session.assessment.postCareChecklist, "Destino, checklist e auditoria", { fullWidth: true }),
    field("Destino manual / observação", "destinationOverride", session.assessment.destinationOverride, "Destino, checklist e auditoria", {
      fullWidth: true,
      placeholder: AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended],
    }),
    field("Comentário de auditoria", "auditComment", session.assessment.auditComment, "Destino, checklist e auditoria", { fullWidth: true }),
  );

  return fields;
}

function buildAuxiliaryPanel(snapshot: AvcCaseSnapshot): AuxiliaryPanel | null {
  if (session.currentStateId !== "avc_workflow") return null;
  return {
    title: "🧠 AVC",
    description: "Fluxo de AVC isquêmico e hemorrágico com verificação de segurança para reperfusão.",
    fields: buildFields(snapshot),
    metrics: buildMetrics(snapshot),
    actions: [],
    recommendations: buildRecommendations(snapshot),
  };
}

function buildEncounterSummary(snapshot: AvcCaseSnapshot): EncounterSummary {
  return {
    protocolId: session.protocolId,
    durationLabel: formatElapsed(session.protocolStartedAt),
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
      { label: "NIHSS", value: snapshot.nihss.complete ? `${snapshot.nihss.total}` : "Pendente" },
      { label: "Imagem", value: snapshot.imaging.ctResult || "Pendente" },
      { label: "Reperfusão IV", value: snapshot.decision.ivThrombolysis.label },
      { label: "Destino", value: AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended] },
    ],
    panelMetrics: [
      { label: "Paciente", value: snapshot.patient.patientName || "Não identificado" },
      { label: "LKW", value: snapshot.timing.lastKnownWellTime || "Não informado" },
      { label: "Chegada", value: snapshot.timing.arrivalTime || "Não informado" },
      { label: "PA", value: snapshot.vitals.systolicPressure != null && snapshot.vitals.diastolicPressure != null ? `${snapshot.vitals.systolicPressure}/${snapshot.vitals.diastolicPressure}` : "Não informada" },
      { label: "NIHSS", value: snapshot.nihss.complete ? `${snapshot.nihss.total} · ${snapshot.nihss.severity}` : "Incompleto" },
      { label: "Diagnóstico sindrômico", value: snapshot.decision.syndromeLabel },
      { label: "Trombólise", value: snapshot.decision.ivThrombolysis.label },
      { label: "Trombectomia", value: snapshot.decision.thrombectomy.label },
      { label: "Destino", value: AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended] },
    ],
  };
}

function buildSummaryText(snapshot: AvcCaseSnapshot) {
  const focalSummary = [snapshot.symptoms.symptoms, snapshot.symptoms.laterality].filter(Boolean).join(" · ");
  const lines = [
    "AVC — resumo clínico",
    `Duração da sessão: ${formatElapsed(session.protocolStartedAt)}`,
    "",
    `Profissional: ${snapshot.patient.responsibleClinician || "Não identificado"}`,
    `Paciente: ${snapshot.patient.patientName || "Não identificado"} ${snapshot.patient.patientId ? `(${snapshot.patient.patientId})` : ""}`,
    `Idade/sexo: ${snapshot.patient.age ?? "—"} / ${snapshot.patient.sex || "—"}`,
    `Peso/altura: ${snapshot.patient.weightKg ?? "—"} kg / ${snapshot.patient.heightCm ?? "—"} cm`,
    `Tempos: chegada ${snapshot.timing.arrivalTime || "—"} · início ${snapshot.timing.symptomOnsetTime || "—"} · LKW ${snapshot.timing.lastKnownWellTime || "—"} (${snapshot.timing.timePrecision})`,
    `Síndrome: ${snapshot.decision.syndromeLabel}`,
    `Quadro focal: ${focalSummary || "—"}`,
    `PA/FC/FR/SpO₂: ${snapshot.vitals.systolicPressure ?? "—"}/${snapshot.vitals.diastolicPressure ?? "—"} · FC ${snapshot.vitals.heartRate ?? "—"} · FR ${snapshot.vitals.respiratoryRate ?? "—"} · SpO₂ ${snapshot.vitals.oxygenSaturation ?? "—"}`,
    `Glicemia: inicial ${snapshot.patient.glucoseInitial ?? "—"} · atual ${snapshot.vitals.glucoseCurrent ?? "—"}`,
    `NIHSS: ${snapshot.nihss.complete ? `${snapshot.nihss.total} (${snapshot.nihss.severity})` : "incompleto"}`,
    `Imagem: TC ${snapshot.imaging.ctResult || "—"} · AngioTC ${snapshot.imaging.ctaResult || "—"}`,
    `Reperfusão IV: ${snapshot.decision.ivThrombolysis.label}`,
    `Trombectomia: ${snapshot.decision.thrombectomy.label}`,
    `Trombolítico: ${snapshot.dose.thrombolyticId} ${snapshot.dose.totalDoseMg != null ? `· ${snapshot.dose.totalDoseMg.toFixed(1)} mg` : "· cálculo pendente"}`,
    `Decisão médica final: ${snapshot.decision.finalMedicalDecision || "Não registrada"}`,
    `Destino sugerido: ${AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended]}`,
    `Checklist pós-conduta: ${session.assessment.postCareChecklist || "—"}`,
    "",
    "Justificativas principais:",
    ...snapshot.decision.ivThrombolysis.rationale.map((line) => `- ${line}`),
    ...snapshot.decision.ivThrombolysis.blockers.map((line) => `- Bloqueio: ${line}`),
    ...snapshot.decision.ivThrombolysis.correctableItems.map((line) => `- Correção: ${line}`),
  ];
  return lines.join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getStateTemplate(stateId: string): State {
  const template = protocolData.states[stateId];
  if (!template) throw new Error(`Estado AVC inválido: ${stateId}`);
  return template;
}

function createSession(): Session {
  const draft = loadAvcDraft<ReturnType<typeof serializeDraft>>();
  if (draft?.protocolId === protocolData.id) {
    return {
      protocolId: draft.protocolId,
      currentStateId: draft.currentStateId,
      previousStateIds: draft.previousStateIds ?? [],
      pendingEffects: [],
      protocolStartedAt: draft.protocolStartedAt ?? Date.now(),
      assessment: { ...buildEmptyAssessment(), ...(draft.assessment ?? {}) },
      auditTrail: draft.auditTrail ?? [],
      decisionSignature: draft.decisionSignature ?? "",
    };
  }

  const base: Session = {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    previousStateIds: [],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    assessment: buildEmptyAssessment(),
    auditTrail: [],
    decisionSignature: "",
  };
  base.auditTrail.push(createAuditEntry("Sistema", "protocol_started", "Módulo AVC iniciado"));
  return base;
}

let session: Session = createSession();

function recalculateDecision(reason: string) {
  const snapshot = buildSnapshot(session.assessment);
  const signature = buildDecisionSummaryText(snapshot);

  session.auditTrail.push(
    createAuditEntry(actorName(), "calculation_recomputed", "Elegibilidade recalculada", reason, {
      nihss: snapshot.nihss.complete ? String(snapshot.nihss.total) : "incomplete",
      ct: snapshot.imaging.ctResult || "pending",
      iv: snapshot.decision.ivThrombolysis.gate,
      mt: snapshot.decision.thrombectomy.gate,
    })
  );

  if (session.decisionSignature && session.decisionSignature !== signature) {
    session.auditTrail.push(
      createAuditEntry(actorName(), "decision_changed", "Decisão clínica alterada", signature)
    );
  }

  session.decisionSignature = signature;
  persistCurrentSession();
  return snapshot;
}

function consumeEffects(): EngineEffect[] {
  const effects = session.pendingEffects;
  session.pendingEffects = [];
  return effects;
}

function getCurrentState(): ProtocolState {
  return { ...getStateTemplate(session.currentStateId) };
}

function getCurrentStateId() {
  return session.currentStateId;
}

function transitionTo(nextId: string) {
  session.previousStateIds.push(session.currentStateId);
  session.currentStateId = nextId;
  session.auditTrail.push(createAuditEntry(actorName(), "state_changed", "Estado do protocolo alterado", nextId));
  persistCurrentSession();
}

function next(): ProtocolState {
  const current = getCurrentState();
  const currentTemplate = getStateTemplate(session.currentStateId);
  if (current.type === "end") return current;
  if (currentTemplate.next) {
    transitionTo(currentTemplate.next);
  }
  return getCurrentState();
}

function canGoBack() {
  return session.previousStateIds.length > 0;
}

function goBack(): ProtocolState {
  const previous = session.previousStateIds.pop();
  if (!previous) throw new Error("Sem etapa anterior");
  session.currentStateId = previous;
  persistCurrentSession();
  return getCurrentState();
}

function resetSession(): ProtocolState {
  clearAvcDraft();
  const base: Session = {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    previousStateIds: [],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    assessment: buildEmptyAssessment(),
    auditTrail: [],
    decisionSignature: "",
  };
  base.auditTrail.push(createAuditEntry("Sistema", "protocol_started", "Módulo AVC iniciado"));
  session = base;
  persistCurrentSession();
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
  return buildHistoryLog();
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  return buildAuxiliaryPanel(buildSnapshot(session.assessment));
}

function updateAuxiliaryField(fieldId: string, value: string): AuxiliaryPanel | null {
  const previousValue = session.assessment[fieldId] ?? "";
  session.assessment[fieldId] = value;

  if (fieldId === "symptoms") {
    session.assessment.laterality = deriveLateralityFromSymptoms(value);
    session.assessment.strokeMimicConcern = deriveMimicConcernFromSymptoms(value);
    if (deriveDisablingDeficitFromSymptoms(value) === "yes") {
      session.assessment.disablingDeficit = "yes";
    } else if (session.assessment.disablingDeficit === "yes") {
      session.assessment.disablingDeficit = "";
    }
  }

  if (["nihss1a", "nihss1b", "nihss1c"].includes(fieldId)) {
    session.assessment.consciousnessLevel = deriveConsciousnessFromNihss(session.assessment);
  }

  session.auditTrail.push(
    createAuditEntry(
      actorName(),
      fieldId.startsWith("contra_") && fieldId.endsWith("_notes") ? "correction_logged" : "field_updated",
      `Campo atualizado: ${fieldId}`,
      `${previousValue || "∅"} → ${value || "∅"}`,
      { fieldId }
    )
  );
  recalculateDecision(`Mudança em ${fieldId}`);
  return getAuxiliaryPanel();
}

function applyAuxiliaryPreset(fieldId: string, value: string): AuxiliaryPanel | null {
  const fieldDef = getAuxiliaryPanel()?.fields.find((fieldItem) => fieldItem.id === fieldId);
  if (!fieldDef) return getAuxiliaryPanel();
  if (fieldDef.presetMode === "toggle_token") {
    return updateAuxiliaryField(fieldId, toggleTokenValue(session.assessment[fieldId] ?? "", value));
  }
  return updateAuxiliaryField(fieldId, value);
}

function updateAuxiliaryUnit(): AuxiliaryPanel | null {
  return getAuxiliaryPanel();
}

function updateAuxiliaryStatus(): AuxiliaryPanel | null {
  return getAuxiliaryPanel();
}

function getEncounterSummary(): EncounterSummary {
  return buildEncounterSummary(buildSnapshot(session.assessment));
}

function getEncounterSummaryText(): string {
  return buildSummaryText(buildSnapshot(session.assessment));
}

function getEncounterReportHtml(): string {
  const body = getEncounterSummaryText()
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>AVC</title></head><body>${body}</body></html>`;
}

recalculateDecision("Inicialização do módulo");

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
