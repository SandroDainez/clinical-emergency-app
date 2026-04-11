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
  treatmentH2: string;
  treatmentCorticoid: string;
  treatmentO2: string;
  treatmentIvAccess: string;
  clinicalResponse: string;
  observationPlan: string;
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

function hasAirwaySevere(a: Assessment): boolean {
  const s = a.symptoms.toLowerCase();
  return (
    s.includes("estridor") ||
    s.includes("edema de glote") ||
    s.includes("via aérea") ||
    s.includes("dispneia grave")
  );
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const w = parseNum(a.weightKg);
  if (w != null && w > 0 && w < 300) {
    const mg = suggestedAdrenalineImMg(w);
    out.push({
      label: "Adrenalina IM sugerida (1:1000)",
      value: `${mg} mg = ${mg} mL (máx. 0,5 mg/dose)`,
    });
  } else {
    out.push({
      label: "Adrenalina IM (adulto típico)",
      value: "0,5 mg IM (0,5 mL de 1:1000) — confirmar peso pediátrico",
    });
  }

  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  if (sbp != null && dbp != null) {
    out.push({ label: "PAM estimada", value: `${formatMap(sbp, dbp)} mmHg` });
  }

  if (hasShock(a)) {
    out.push({ label: "⚠️ Gravidade", value: "Possível choque — fluidos + adrenalina; monitorização" });
  }
  if (hasAirwaySevere(a)) {
    out.push({ label: "⚠️ Via aérea", value: "Risco alto — preparar via aérea definitiva" });
  }

  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
  const w = parseNum(a.weightKg);
  const shock = hasShock(a);
  const airway = hasAirwaySevere(a);

  recs.push({
    title: "1 — Adrenalina intramuscular (primeira linha)",
    tone: "danger",
    lines: [
      "Administrar o quanto antes na face lateral da coxa (vasto externo) — absorção mais fiável que no braço.",
      w != null && w > 0
        ? `Dose usual por peso: ${suggestedAdrenalineImMg(w)} mg IM (= ${suggestedAdrenalineImMg(w)} mL de adrenalina 1:1000). Repetir a cada 5–15 min se sintomas persistem (máx. por dose conforme protocolo local, frequentemente 0,5 mg).`
        : "Com peso desconhecido em adulto: frequentemente 0,5 mg IM (0,5 mL de 1:1000); criança: 0,01 mg/kg.",
      "Não substituir por antihistamínico ou corticoide como primeira intervenção.",
    ],
  });

  recs.push({
    title: "2 — Posição, oxigénio, acesso venoso",
    tone: "info",
    lines: [
      "Paciente em supino com pernas elevadas se hipotensão; se dispneia grave, semi-sentado pode ser necessário.",
      "Oxigênio de alto fluxo; monitorização contínua (ECG, SpO₂, PA).",
      "Acesso venoso periférico calibroso; duas vias se choque.",
    ],
  });

  if (shock) {
    recs.push({
      title: "3 — Choque anafilático",
      tone: "danger",
      lines: [
        "Expansão com cristalóide em bolus (ex.: 20 mL/kg em pediatria; adulto em bolus repetidos conforme resposta e cardiopatia).",
        "Repetir adrenalina IM enquanto necessário; se refratário: adrenalina IV em BOLUS diluído ou INFUSÃO contínua em ambiente monitorizado — seguir protocolo de UTI/emergência (risco de arritmias).",
        "Considerar início precoce de vasopressor se hipotensão persistente após volume e adrenalina.",
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
        "Adrenalina nebulizada pode ser adjuvante em alguns protocolos; não atrasa adrenalina IM/IV sistémica quando indicada.",
        "Evitar sedação excessiva sem preparação para ventilar/intubar.",
      ],
    });
  }

  recs.push({
    title: "5 — Terapêutica adjuvante (não substitui adrenalina)",
    tone: "warning",
    lines: [
      "H1 bloqueador (ex.: difenidramina IV) — efeito mais tardio; útil para urticária persistente.",
      "H2 bloqueador e corticoide: frequentemente utilizados; não devem atrasar adrenalina.",
      "Beta-2 inalado (salbutamol) se broncoespasmo importante.",
    ],
  });

  recs.push({
    title: "6 — Observação e alta",
    tone: "info",
    lines: [
      "Reação bifásica pode ocorrer (muitas referências: observar várias horas conforme gravidade e protocolo local).",
      "Educar sobre autoinjetor de adrenalina, identificação do alérgeno e plano escrito de emergência.",
      "Seguimento com alergologia/imunologia quando aplicável.",
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
      treatmentH2: "",
      treatmentCorticoid: "",
      treatmentO2: "",
      treatmentIvAccess: "",
      clinicalResponse: "",
      observationPlan: "",
      destination: "",
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
  return [
    { id: "age", label: "Idade (anos)", value: a.age, keyboardType: "numeric", section: "Paciente e exposição" },
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
    { id: "weightKg", label: "Peso (kg)", value: a.weightKg, keyboardType: "numeric", section: "Paciente e exposição" },
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
    },
    {
      id: "timeOnsetMin",
      label: "Tempo desde o início (minutos)",
      value: a.timeOnsetMin,
      keyboardType: "numeric",
      section: "Paciente e exposição",
    },

    {
      id: "symptoms",
      label: "Manifestações (marque todas)",
      value: a.symptoms,
      fullWidth: true,
      section: "Manifestações e vital",
      presetMode: "toggle_token",
      presets: [
        { label: "Urticária / prurido", value: "Urticária / prurido" },
        { label: "Angioedema (face, lábios, língua)", value: "Angioedema" },
        { label: "Dispneia / sibilos", value: "Dispneia / sibilos" },
        { label: "Estridor / edema de glote", value: "Estridor / edema de glote" },
        { label: "Hipotensão / choque", value: "Hipotensão / choque" },
        { label: "Síncope", value: "Síncope" },
        { label: "Náuseas / vómitos / dor abdominal", value: "Náuseas / vómitos / dor abdominal" },
        { label: "Sensação de morte iminente", value: "Sensação de morte iminente" },
      ],
    },
    { id: "heartRate", label: "FC (bpm)", value: a.heartRate, keyboardType: "numeric", section: "Manifestações e vital" },
    { id: "systolicPressure", label: "PAS (mmHg)", value: a.systolicPressure, keyboardType: "numeric", section: "Manifestações e vital" },
    { id: "diastolicPressure", label: "PAD (mmHg)", value: a.diastolicPressure, keyboardType: "numeric", section: "Manifestações e vital" },
    { id: "spo2", label: "SpO₂ (%)", value: a.spo2, keyboardType: "numeric", section: "Manifestações e vital" },
    { id: "gcs", label: "GCS", value: a.gcs, keyboardType: "numeric", section: "Manifestações e vital" },

    {
      id: "treatmentAdrenaline",
      label: "Adrenalina (doses / horários)",
      value: a.treatmentAdrenaline,
      fullWidth: true,
      section: "Tratamento na emergência",
      placeholder: "Ex.: 0,3 mg IM 10:15; repetida 10:25…",
    },
    {
      id: "treatmentIvAccess",
      label: "Acesso venoso",
      value: a.treatmentIvAccess,
      section: "Tratamento na emergência",
      presets: [
        { label: "Periférico", value: "Periférico" },
        { label: "Dois acessos", value: "Dois acessos" },
        { label: "Central", value: "Central" },
      ],
    },
    {
      id: "treatmentFluids",
      label: "Cristalóide / volume",
      value: a.treatmentFluids,
      fullWidth: true,
      section: "Tratamento na emergência",
      placeholder: "Bolus e totais",
    },
    {
      id: "treatmentO2",
      label: "Oxigênio",
      value: a.treatmentO2,
      section: "Tratamento na emergência",
      presets: [
        { label: "CN / máscara", value: "CN / máscara" },
        { label: "Alto fluxo", value: "Alto fluxo" },
        { label: "Reservatório", value: "Reservatório" },
      ],
    },
    {
      id: "treatmentSalbutamol",
      label: "Salbutamol / beta-2",
      value: a.treatmentSalbutamol,
      fullWidth: true,
      section: "Tratamento na emergência",
    },
    {
      id: "treatmentH1",
      label: "Anti-H1",
      value: a.treatmentH1,
      fullWidth: true,
      section: "Tratamento na emergência",
    },
    {
      id: "treatmentH2",
      label: "Anti-H2",
      value: a.treatmentH2,
      fullWidth: true,
      section: "Tratamento na emergência",
    },
    {
      id: "treatmentCorticoid",
      label: "Corticoide",
      value: a.treatmentCorticoid,
      fullWidth: true,
      section: "Tratamento na emergência",
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
    },
    {
      id: "destination",
      label: "Destino",
      value: a.destination,
      section: "Evolução e destino",
      presets: [
        { label: "Alta com orientações", value: "Alta com orientações" },
        { label: "Observação prolongada", value: "Observação prolongada" },
        { label: "Internamento / UTI", value: "Internamento / UTI" },
      ],
    },
    {
      id: "freeNotes",
      label: "Notas / prescrição de autoinjetor",
      value: a.freeNotes,
      fullWidth: true,
      section: "Evolução e destino",
    },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "atendimento") return null;
  const a = session.assessment;
  return {
    title: "Anafilaxia",
    description: hasShock(a) ? "Suspeita de componente hemodinâmico — priorizar adrenalina e volume." : "Registe exposição, adrenalina e observação.",
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
