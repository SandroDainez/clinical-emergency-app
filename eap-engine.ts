/**
 * Módulo Edema agudo de pulmão (EAP) — roteiro resumido, ciclo curto.
 */

import raw from "./protocols/edema_agudo_pulmao.json";
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

type Protocol = {
  id: string;
  initialState: string;
  states: Record<string, State>;
};

type Event = { timestamp: number; type: string; data?: Record<string, string | undefined> };

type Assessment = {
  age: string;
  sex: string;
  weightKg: string;
  comorbidities: string;
  allergies: string;
  chiefComplaint: string;
  symptomOnset: string;
  heartRate: string;
  systolicPressure: string;
  diastolicPressure: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  fio2Fraction: string;
  gcs: string;
  pulmonaryExam: string;
  cardiacExam: string;
  hypothesis: string;
  treatmentDone: string;
  nivCpap: string;
  ivAccess: string;
  monitoring: string;
  clinicalResponse: string;
  destination: string;
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
  const map = (2 * dbp + sbp) / 3;
  return map.toFixed(0).replace(".", ",");
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  if (sbp != null && dbp != null && sbp > 0 && dbp > 0) {
    out.push({ label: "PAM estimada", value: `${formatMap(sbp, dbp)} mmHg` });
  }
  const spo2 = parseNum(a.oxygenSaturation);
  let fi = parseNum(a.fio2Fraction);
  if (fi != null && fi > 1) fi = fi / 100;
  if (spo2 != null && fi != null && fi > 0 && fi <= 1.0001) {
    const ratio = Math.round(spo2 / fi);
    out.push({ label: "SpO₂/FiO₂ (aprox.)", value: `${ratio}` });
  }
  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
  const sbp = parseNum(a.systolicPressure);
  const map =
    sbp != null && parseNum(a.diastolicPressure) != null
      ? (2 * parseNum(a.diastolicPressure)! + sbp) / 3
      : null;
  const spo2 = parseNum(a.oxygenSaturation);

  if (map != null && map > 90 && map < 180) {
    recs.push({
      title: "Vasodilatador — cenário hipertensivo",
      tone: "info",
      lines: [
        "Se PA preservada / hipertensão: nitrato (ex.: nitroglicerina SL ou IV conforme protocolo) com monitorização.",
        "Associar diurético de alça IV (furosemida) se não contraindicado — dose conforme uso prévio de diurético e função renal.",
        "Evitar excesso de redução pressórica; meta individualizada.",
      ],
    });
  }

  if (map != null && map < 65) {
    recs.push({
      title: "Hipotensão — cautela com vasodiladores",
      tone: "danger",
      lines: [
        "Priorizar suporte hemodinâmico e causa (choque cardiogênico vs distributivo).",
        "Vasodilatadores e morfina com cautela extrema; inotrópico/vasopressor conforme cenário.",
        "Considerar VM invasiva precoce se insuficiência respiratória grave.",
      ],
    });
  }

  if (spo2 != null && spo2 < 90) {
    recs.push({
      title: "Hipoxemia",
      tone: "warning",
      lines: [
        "Oxigenoterapia de alto fluxo; considerar VMNI (CPAP/BiPAP) se trabalho respiratório ou acidose.",
        "Intubação se falha da VMNI, rebaixamento ou fadiga.",
      ],
    });
  }

  recs.push({
    title: "VMNI / CPAP",
    tone: "info",
    lines: [
      "CPAP ou BiPAP reduz intubação em EAP cardiogênico quando tolerado hemodinamicamente.",
      "Contraindicações relativas: parada, vômitos incoercíveis, rebaixamento grave, choque refratário sem suporte adequado.",
    ],
  });

  return recs;
}

function getSuggestedTreatment(a: Assessment): { fieldId: string; value: string; label: string } | null {
  const map =
    parseNum(a.systolicPressure) != null && parseNum(a.diastolicPressure) != null
      ? (2 * parseNum(a.diastolicPressure)! + parseNum(a.systolicPressure)!) / 3
      : null;
  if (map == null) return null;
  if (map >= 65 && map < 200) {
    return {
      fieldId: "treatmentDone",
      value:
        "Posição sentada com pernas pendentes | Oxigenoterapia de alto fluxo | Acesso venoso periférico | Monitorização contínua",
      label: "Sugestão: posição + O₂ + acesso + monitor (ajustar)",
    };
  }
  return null;
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
      comorbidities: "",
      allergies: "",
      chiefComplaint: "",
      symptomOnset: "",
      heartRate: "",
      systolicPressure: "",
      diastolicPressure: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      fio2Fraction: "0,21",
      gcs: "",
      pulmonaryExam: "",
      cardiacExam: "",
      hypothesis: "",
      treatmentDone: "",
      nivCpap: "",
      ivAccess: "",
      monitoring: "",
      clinicalResponse: "",
      destination: "",
      freeNotes: "",
    },
  };
}

function getStateTemplate(stateId: string): State {
  const st = protocolData.states[stateId];
  if (!st) throw new Error(`Estado EAP inválido: ${stateId}`);
  return st;
}

function consumeEffects(): EngineEffect[] {
  const e = session.pendingEffects;
  session.pendingEffects = [];
  return e;
}

function getCurrentState(): ProtocolState {
  const t = getStateTemplate(session.currentStateId);
  return { ...t } as ProtocolState;
}

function getCurrentStateId(): string {
  return session.currentStateId;
}

function transitionTo(nextId: string) {
  session.previousStateIds.push(session.currentStateId);
  session.currentStateId = nextId;
  session.history.push({ timestamp: Date.now(), type: "STATE_CHANGED", data: { to: nextId } });
}

function next(input?: string): ProtocolState {
  const st = getCurrentState();
  if (st.type === "end") return st;

  if (st.type === "action" && session.currentStateId === "edema_agudo") {
    const tpl = getStateTemplate("edema_agudo");
    if (tpl.next) transitionTo(tpl.next);
    return getCurrentState();
  }

  if (st.type === "question" && input && st.options) {
    const nextId = st.options[input];
    if (nextId) transitionTo(nextId);
    return getCurrentState();
  }

  throw new Error("Transição inválida");
}

function canGoBack(): boolean {
  return session.previousStateIds.length > 0;
}

function goBack(): ProtocolState {
  const prev = session.previousStateIds.pop();
  if (!prev) throw new Error("Sem etapa anterior");
  session.currentStateId = prev;
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
    title: ev.type === "PROTOCOL_STARTED" ? "EAP iniciado" : "Evento",
    details: ev.data ? JSON.stringify(ev.data) : undefined,
  }));
}

function buildFields(a: Assessment): AuxiliaryPanel["fields"] {
  const sug = getSuggestedTreatment(a);
  return [
    {
      id: "age",
      label: "Idade",
      value: a.age,
      keyboardType: "numeric",
      placeholder: "anos",
      section: "Identificação",
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
      section: "Identificação",
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
      section: "Identificação",
      presets: [
        { label: "50", value: "50" },
        { label: "70", value: "70" },
        { label: "90", value: "90" },
        { label: "110", value: "110" },
      ],
    },
    {
      id: "comorbidities",
      label: "Comorbidades / IC",
      value: a.comorbidities,
      section: "Comorbidades e risco",
      presetMode: "toggle_token",
      helperText: "Selecione as comorbidades presentes.",
      presets: [
        { label: "IC com FE reduzida", value: "IC com FE reduzida" },
        { label: "HAS", value: "HAS" },
        { label: "DAC / IAM prévio", value: "DAC / IAM prévio" },
        { label: "FA", value: "FA" },
        { label: "DRC", value: "DRC" },
        { label: "DM", value: "DM" },
        { label: "Sem comorbidade conhecida", value: "Sem comorbidade conhecida" },
      ],
    },
    {
      id: "allergies",
      label: "Alergias",
      value: a.allergies,
      fullWidth: true,
      section: "Comorbidades e risco",
      placeholder: "NKDA ou descrever",
      presets: [
        { label: "Sem alergias conhecidas", value: "Sem alergias conhecidas" },
        { label: "Alergia a nitrato", value: "Alergia a nitrato" },
        { label: "Alergia a furosemida", value: "Alergia a furosemida" },
      ],
    },
    {
      id: "chiefComplaint",
      label: "Queixa / início",
      value: a.chiefComplaint,
      fullWidth: true,
      section: "Apresentação",
      presetMode: "toggle_token",
      helperText: "Escolha os elementos que melhor descrevem o quadro respiratório e hemodinâmico.",
      presets: [
        { label: "Dispneia súbita / piora rápida respiratória", value: "Dispneia súbita" },
        { label: "Ortopneia / não tolera decúbito", value: "Ortopneia" },
        { label: "Expectoração rosada / espumosa", value: "Expectoração rosada / espumosa" },
        { label: "Dor torácica associada / avaliar SCA", value: "Dor torácica associada" },
        { label: "Desperta à noite com falta de ar", value: "Dispneia paroxística noturna" },
      ],
    },
    {
      id: "symptomOnset",
      label: "Tempo de evolução",
      value: a.symptomOnset,
      section: "Apresentação",
      placeholder: "ex.: minutos / horas",
      presets: [
        { label: "30 min", value: "30 min" },
        { label: "1 h", value: "1 h" },
        { label: "6 h", value: "6 h" },
        { label: "24 h", value: "24 h" },
      ],
    },
    {
      id: "systolicPressure",
      label: "PAS (mmHg)",
      value: a.systolicPressure,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "140", value: "140" },
        { label: "160", value: "160" },
        { label: "180", value: "180" },
        { label: "200", value: "200" },
      ],
    },
    {
      id: "diastolicPressure",
      label: "PAD (mmHg)",
      value: a.diastolicPressure,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "40", value: "40" },
        { label: "50", value: "50" },
        { label: "60", value: "60" },
        { label: "70", value: "70" },
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
      ],
    },
    {
      id: "heartRate",
      label: "FC (bpm)",
      value: a.heartRate,
      keyboardType: "numeric",
      section: "Sinais vitais",
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
      id: "respiratoryRate",
      label: "FR (irpm)",
      value: a.respiratoryRate,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "20", value: "20" },
        { label: "28", value: "28" },
        { label: "35", value: "35" },
        { label: "40", value: "40" },
      ],
    },
    {
      id: "oxygenSaturation",
      label: "SpO₂ (%)",
      value: a.oxygenSaturation,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "82", value: "82" },
        { label: "88", value: "88" },
        { label: "92", value: "92" },
        { label: "96", value: "96" },
      ],
    },
    {
      id: "fio2Fraction",
      label: "FiO₂ (fração)",
      value: a.fio2Fraction,
      keyboardType: "numeric",
      helperText: "Ar ambiente 0,21; máscara conforme dispositivo",
      section: "Sinais vitais",
    },
    { id: "gcs", label: "GCS (opcional)", value: a.gcs, keyboardType: "numeric", section: "Sinais vitais" },
    {
      id: "pulmonaryExam",
      label: "Ausculta pulmonar",
      value: a.pulmonaryExam,
      fullWidth: true,
      section: "Exame físico",
      presetMode: "toggle_token",
      presets: [
        { label: "Estertores finos bilaterais", value: "Estertores finos bilaterais" },
        { label: "Redução de MV global", value: "Redução de MV global" },
        { label: "Sibilos", value: "Sibilos" },
      ],
    },
    {
      id: "cardiacExam",
      label: "Cardiovascular",
      value: a.cardiacExam,
      fullWidth: true,
      section: "Exame físico",
      presetMode: "toggle_token",
      presets: [
        { label: "B3 / B4", value: "B3 / B4" },
        { label: "Estase jugular", value: "Estase jugular" },
        { label: "Edema de MMII", value: "Edema de MMII" },
        { label: "Taquicardia", value: "Taquicardia" },
      ],
    },
    {
      id: "hypothesis",
      label: "Hipótese principal",
      value: a.hypothesis,
      fullWidth: true,
      section: "Diagnóstico diferencial",
      helperText: "Escolha a hipótese dominante para orientar nitrato, VMNI, diurético e investigação paralela.",
      presets: [
        { label: "EAP cardiogênico hipertensivo / congestão aguda", value: "EAP cardiogênico provável" },
        { label: "Sobrecarga volêmica / retenção hídrica", value: "Sobrecarga volêmica" },
        { label: "EAP em contexto de SCA / isquemia miocárdica", value: "EAP em contexto de SCA (avaliar)" },
        { label: "Outro / indeterminado / revisar diferencial", value: "Outro / indeterminado" },
      ],
    },
    {
      id: "treatmentDone",
      label: "Condutas realizadas / planejadas",
      value: a.treatmentDone,
      fullWidth: true,
      section: "Tratamento imediato",
      presetMode: "toggle_token",
      suggestedValue: sug?.value,
      suggestedLabel: sug?.label,
      presets: [
        { label: "Posição sentada / reduzir retorno venoso", value: "Posição sentada, pernas pendentes" },
        { label: "Oxigenoterapia / alto fluxo se necessário", value: "Oxigenoterapia / alto fluxo" },
        { label: "Nitrato SL ou IV / se PAS permitir", value: "Nitrato (SL ou IV)" },
        { label: "Furosemida IV / se congestão confirmada", value: "Furosemida IV" },
        { label: "Morfina IV (cautela e uso seletivo)", value: "Morfina IV (cautela)" },
        { label: "VMNI (CPAP/BiPAP) / hipoxemia ou esforço respiratório", value: "VMNI (CPAP/BiPAP)" },
      ],
    },
    {
      id: "nivCpap",
      label: "VMNI — parâmetros / tolerância",
      value: a.nivCpap,
      fullWidth: true,
      section: "Tratamento imediato",
      placeholder: "IPAP/EPAP ou CPAP, FiO₂, tempo",
      helperText: "Registre o suporte aplicado e se houve boa adaptação à interface.",
      presets: [
        { label: "CPAP 10 cmH₂O / início comum", value: "CPAP 10 cmH₂O" },
        { label: "CPAP 12 cmH₂O / mais recrutamento", value: "CPAP 12 cmH₂O" },
        { label: "BiPAP 14/8 / suporte pressórico", value: "BiPAP 14/8" },
        { label: "Boa tolerância à VMNI", value: "Boa tolerância à VMNI" },
        { label: "Má tolerância / considerar ajuste ou IOT", value: "Má tolerância à VMNI" },
      ],
    },
    {
      id: "ivAccess",
      label: "Acesso vascular",
      value: a.ivAccess,
      section: "Monitorização",
      presets: [
        { label: "2 vias periféricas calibrosas", value: "2 vias periféricas calibrosas" },
        { label: "Acesso central", value: "Acesso central" },
      ],
    },
    {
      id: "monitoring",
      label: "Monitorização",
      value: a.monitoring,
      fullWidth: true,
      section: "Monitorização",
      presetMode: "toggle_token",
      presets: [
        { label: "ECG contínuo", value: "ECG contínuo" },
        { label: "Oximetria contínua", value: "Oximetria contínua" },
        { label: "PA invasiva", value: "PA invasiva" },
        { label: "Diurese horária", value: "Diurese horária" },
      ],
    },
    {
      id: "clinicalResponse",
      label: "Resposta ao tratamento",
      value: a.clinicalResponse,
      fullWidth: true,
      section: "Evolução e destino",
      presets: [
        { label: "Melhora clínica", value: "Melhora clínica" },
        { label: "Estável", value: "Estável" },
        { label: "Piora — revisar VMNI / IOT", value: "Piora — revisar VMNI / IOT" },
      ],
    },
    {
      id: "destination",
      label: "Destino",
      value: a.destination,
      section: "Evolução e destino",
      presets: [
        { label: "UTI / unidade coronariana", value: "UTI / coronariana" },
        { label: "Observação / unidade intermediária", value: "Observação / intermediate care" },
        { label: "Enfermaria / apenas se caso leve e estável", value: "Enfermaria (caso leve estável)" },
      ],
    },
    { id: "freeNotes", label: "Notas", value: a.freeNotes, fullWidth: true, section: "Evolução e destino", placeholder: "Ex.: troponina, RX, decisão de IOT…" },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "edema_agudo") return null;
  const a = session.assessment;
  const metrics = buildMetrics(a);
  const recommendations = buildRecommendations(a);
  return {
    title: "🫁 Edema agudo de pulmão",
    description: "Registro rápido — ciclo de tratamento curto",
    fields: buildFields(a),
    metrics,
    actions: [],
    recommendations,
  };
}

function updateAuxiliaryField(fieldId: string, value: string): AuxiliaryPanel | null {
  const key = fieldId as keyof Assessment;
  if (key in session.assessment) {
    session.assessment[key] = value as never;
  }
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
      { label: "PAS/PAD", value: `${a.systolicPressure || "—"}/${a.diastolicPressure || "—"}` },
      { label: "SpO₂", value: a.oxygenSaturation || "—" },
      { label: "Destino", value: a.destination || "—" },
    ],
  };
}

function getEncounterSummaryText(): string {
  const a = session.assessment;
  const lines = [
    "Edema agudo de pulmão — resumo",
    `Duração sessão: ${formatElapsed(Date.now())}`,
    "",
    `Queixa: ${a.chiefComplaint || "—"}`,
    `PA: ${a.systolicPressure}/${a.diastolicPressure}  FC: ${a.heartRate}  SpO₂: ${a.oxygenSaturation}`,
    `Condutas: ${a.treatmentDone || "—"}`,
    `Resposta: ${a.clinicalResponse || "—"}`,
    `Destino: ${a.destination || "—"}`,
    `Notas: ${a.freeNotes || "—"}`,
  ];
  return lines.join("\n");
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getEncounterReportHtml(): string {
  const t = getEncounterSummaryText().split("\n").map((l) => `<p>${escapeHtml(l)}</p>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>EAP</title></head><body>${t}</body></html>`;
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
