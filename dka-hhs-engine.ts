/**
 * CAD (DKA) e EHH (HHS) — diferenciação e condutas por quadro (referência ADA / prática de emergência).
 */

import raw from "./protocols/cetoacidose_hiperosmolar.json";
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

type SyndromeClass = "dka" | "hhs" | "mixed" | "indeterminate";

type Assessment = {
  age: string;
  sex: string;
  weightKg: string;
  heightCm: string;
  dmType: string;
  insulinUse: string;
  sglt2i: string;
  comorbidities: string;
  allergies: string;
  spo2: string;
  oxygenTherapy: string;
  ivAccess: string;
  ecgDone: string;
  symptoms: string;
  heartRate: string;
  systolicPressure: string;
  diastolicPressure: string;
  respiratoryRate: string;
  temperature: string;
  gcs: string;
  examDehydration: string;
  examOther: string;
  glucose: string;
  ph: string;
  bicarb: string;
  sodium: string;
  chloride: string;
  potassium: string;
  creatinine: string;
  bun: string;
  ketones: string;
  lactate: string;
  precipitant: string;
  treatmentFluids: string;
  treatmentInsulin: string;
  treatmentPotassium: string;
  treatmentBicarb: string;
  treatmentOther: string;
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
  return ((2 * dbp + sbp) / 3).toFixed(0).replace(".", ",");
}

/** Osmolaridade sérica estimada (mOsm/kg): 2×Na + glicose/18 + ureia/2,8 */
function estimateOsm(na: number | null, gluMgDl: number | null, bunMgDl: number | null): number | null {
  if (na == null || gluMgDl == null) return null;
  let o = 2 * na + gluMgDl / 18;
  if (bunMgDl != null) o += bunMgDl / 2.8;
  return Math.round(o);
}

function anionGap(na: number | null, cl: number | null, hco3: number | null): number | null {
  if (na == null || cl == null || hco3 == null) return null;
  return Math.round((na - (cl + hco3)) * 10) / 10;
}

function ketosisPresent(a: Assessment): boolean {
  const k = a.ketones.toLowerCase();
  if (/posit|\+|presente|elev|alto|β|beta|corpos cet/i.test(k)) return true;
  const boh = parseNum(a.ketones);
  if (boh != null && boh > 3) return true;
  return false;
}

function classifySyndrome(a: Assessment): { klass: SyndromeClass; label: string; detailLines: string[] } {
  const g = parseNum(a.glucose);
  const ph = parseNum(a.ph);
  const hco3 = parseNum(a.bicarb);
  const na = parseNum(a.sodium);
  const cl = parseNum(a.chloride);
  const bun = parseNum(a.bun);
  const osm = estimateOsm(na, g, bun);
  const ag = anionGap(na, cl, hco3);
  const ket = ketosisPresent(a);

  const lines: string[] = [];
  if (g != null) lines.push(`Glicemia: ${g} mg/dL`);
  if (ph != null) lines.push(`pH: ${ph}`);
  if (hco3 != null) lines.push(`HCO₃⁻: ${hco3} mEq/L`);
  if (osm != null) lines.push(`Osm (est.): ${osm} mOsm/kg`);
  if (ag != null) lines.push(`GAP aniônico (est.): ${ag} mEq/L`);
  lines.push(ket ? "Cetose: positiva / informada" : "Cetose: ausente ou não informada");

  const acidosisDka = (ph != null && ph < 7.3) || (hco3 != null && hco3 < 18);
  const glicemiaDka = g == null || g >= 200;
  const hiperGlicHhs = g != null && g >= 600;
  const hiperOsmHhs = osm != null && osm >= 320;
  const semAcidoseGrave = (ph == null || ph >= 7.3) && (hco3 == null || hco3 >= 15);

  let klass: SyndromeClass = "indeterminate";

  const criterioMisto =
    acidosisDka && ket && hiperGlicHhs && hiperOsmHhs;

  if (criterioMisto) {
    klass = "mixed";
  } else if (acidosisDka && ket && glicemiaDka) {
    klass = "dka";
  } else if (hiperGlicHhs && hiperOsmHhs && semAcidoseGrave && !ket) {
    klass = "hhs";
  } else if (hiperGlicHhs && hiperOsmHhs && !acidosisDka) {
    klass = "hhs";
  } else if (acidosisDka && ket) {
    klass = "dka";
  } else if (hiperGlicHhs && hiperOsmHhs) {
    klass = "hhs";
  }

  const labels: Record<SyndromeClass, string> = {
    dka: "CAD (cetoacidose) — provável",
    hhs: "EHH (hiperosmolar) — provável",
    mixed: "Quadro misto (CAD + hiperosmolaridade)",
    indeterminate: "Classificação incerta — completar gasometria e íons",
  };

  return { klass, label: labels[klass], detailLines: lines };
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  if (sbp != null && dbp != null && sbp > 0 && dbp > 0) {
    out.push({ label: "PAM estimada", value: `${formatMap(sbp, dbp)} mmHg` });
  }
  const { klass, label } = classifySyndrome(a);
  out.push({ label: "Classificação", value: label });

  const na = parseNum(a.sodium);
  const glu = parseNum(a.glucose);
  const bun = parseNum(a.bun);
  const osm = estimateOsm(na, glu, bun);
  if (osm != null) out.push({ label: "Osmolaridade (est.)", value: `${osm}` });

  const cl = parseNum(a.chloride);
  const hco3 = parseNum(a.bicarb);
  const ag = anionGap(na, cl, hco3);
  if (ag != null) out.push({ label: "GAP aniônico", value: `${ag} (ref. ~8–12)` });
  if (ag != null && ag > 12) {
    out.push({
      label: "Importância do gap",
      value: "Elevado: sugere acidose por ânions não medidos; acompanhar fechamento na resolução da CAD",
    });
  }

  const k = parseNum(a.potassium);
  if (k != null && k < 3.3) {
    out.push({ label: "⚠️ Potássio", value: `< 3,3 — não iniciar insulina até corrigir` });
  }

  if (klass === "dka" || klass === "mixed") {
    out.push({
      label: "CAD — eixo",
      value: "Acidose + cetose; insulina IV após K⁺ seguro",
    });
  }
  if (klass === "hhs" || klass === "mixed") {
    out.push({
      label: "EHH — eixo",
      value: "Hiperglicemia + hiperosmolaridade; hidratação vigorosa; correção osmótica lenta",
    });
  }

  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const { klass } = classifySyndrome(a);
  const k = parseNum(a.potassium);
  const ph = parseNum(a.ph);
  const recs: AuxiliaryPanelRecommendation[] = [];

  recs.push({
    title: "Ordem na emergência (lembrete)",
    tone: "info",
    lines: [
      "1) Monitor + glicemia + acesso + exames.",
      "2) Expandir volume; corrigir K⁺ se < 3,3 antes de insulina IV.",
      "3) Insulina contínua e metas de glicemia; EHH: osmolaridade em queda lenta.",
      "4) Precipitante e destino (ver roteiro completo no topo da tela).",
    ],
  });

  recs.push({
    title: "Diferenças essenciais (referência)",
    tone: "info",
    lines: [
      "CAD: acidose metabólica (pH ↓ / HCO₃⁻ ↓) com cetose — mais comum em DM1; glicemia pode ser <600.",
      "EHH: hiperglicemia muito elevada + hiperosmolaridade, acidose leve ou ausente, cetose mínima — mais DM2 idoso.",
      "Misto: critérios de ambos (idoso DM2 com desidratação grave + cetose).",
    ],
  });

  recs.push({
    title: "Por que o anion gap importa",
    tone: "info",
    lines: [
      "Gap aniônico = Na⁺ − (Cl⁻ + HCO₃⁻); referência aproximada: 8–12 mEq/L.",
      "Na CAD, o gap costuma subir por acúmulo de cetonas; o fechamento do gap ajuda a indicar resolução metabólica.",
      "Se o bicarbonato melhora, mas o gap permanece aberto, ainda pode haver acidose em curso.",
    ],
  });

  if (k != null && k < 3.3) {
    recs.push({
      title: "Hipocalemia grave antes de insulina",
      tone: "danger",
      lines: [
        "K⁺ < 3,3 mEq/L: repor potássio IV antes de insulina contínua (risco de arritmia / piora da hipocalemia).",
        "Repetir K⁺ frequentemente após hidratação e início de insulina.",
      ],
    });
  }

  if (klass === "dka" || klass === "mixed") {
    recs.push({
      title: "Condutas — CAD (além da hidratação e monitorização)",
      tone: klass === "mixed" ? "warning" : "info",
      lines: [
        "Volume: SF 0,9% 15–20 mL/kg na 1ª hora (ajustar ICC/IRC); depois conforme balanço e Na corrigida.",
        "Insulina IV contínua: após expansão e K⁺ ≥ 3,3 — dose usual inicial ~0,1 U/kg/h (sem bolus IV de insulina regular na rotina atual ADA).",
        "Meta: queda da glicemia ~50–70 mg/dL/h; se não cair, revisar dose / obstrução IV; quando glicemia ~200 (CAD), considerar glicose + insulina para evitar hipocalemia.",
        "K⁺: manter 4–5 mEq/L; repor se <5,3 (protocolo local de mEq por K⁺ medido).",
        "Bicarbonato: considerar apenas se pH < 6,9 (debate; seguir protocolo institucional).",
        "Investigar precipitante: infecção, IAM, SCA, omissão de insulina, drogas, gestação, etc.",
      ],
    });
  }

  if (klass === "hhs" || klass === "mixed") {
    recs.push({
      title: "Condutas — EHH (além da hidratação e monitorização)",
      tone: klass === "mixed" ? "warning" : "info",
      lines: [
        "Volume: déficit maior que na CAD isolada — cristalóide com cuidado em cardiopatas; metade do volume nas primeiras 12h é referência comum (individualizar).",
        "Insulina: iniciar após hidratação inicial; doses iniciais frequentemente menores que na CAD pura (ex.: 0,05 U/kg/h) — titular conforme glicemia e protocolo.",
        "Correção da osmolaridade: lenta (risco de edema cerebral se mudança rápida de Na/glicemia).",
        "Tromboprofilaxia: EHH tem alto risco trombótico — avaliar heparina de baixo peso molecular se não contraindicado.",
        "Pesquisar precipitante: infecção, IAM, medicamentos, acidente vascular, etc.",
      ],
    });
  }

  if (klass === "indeterminate") {
    recs.push({
      title: "Completar avaliação",
      tone: "warning",
      lines: [
        "Obter/confirmar: gasometria venosa ou arterial, Na, K, Cl, creatinina, glicemia, cetonemia quando possível.",
        "Reclassificar automaticamente ao preencher os campos.",
      ],
    });
  }

  if (ph != null && ph < 6.9) {
    recs.push({
      title: "Acidose grave (pH < 6,9)",
      tone: "danger",
      lines: [
        "Considerar bicarbonato em regime institucional; monitorização intensiva; avaliar UTI.",
        "Risco elevado de complicações — não depender apenas de condutas automáticas.",
      ],
    });
  }

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
      dmType: "",
      insulinUse: "",
      sglt2i: "",
      comorbidities: "",
      allergies: "",
      spo2: "",
      oxygenTherapy: "",
      ivAccess: "",
      ecgDone: "",
      symptoms: "",
      heartRate: "",
      systolicPressure: "",
      diastolicPressure: "",
      respiratoryRate: "",
      temperature: "",
      gcs: "",
      examDehydration: "",
      examOther: "",
      glucose: "",
      ph: "",
      bicarb: "",
      sodium: "",
      chloride: "",
      potassium: "",
      creatinine: "",
      bun: "",
      ketones: "",
      lactate: "",
      precipitant: "",
      treatmentFluids: "",
      treatmentInsulin: "",
      treatmentPotassium: "",
      treatmentBicarb: "",
      treatmentOther: "",
      monitoring: "",
      clinicalResponse: "",
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
    title: ev.type === "PROTOCOL_STARTED" ? "Módulo CAD/EHH iniciado" : "Evento",
    details: ev.data ? JSON.stringify(ev.data) : undefined,
  }));
}

function buildFields(a: Assessment): AuxiliaryPanel["fields"] {
  return [
    {
      id: "age",
      label: "Idade (anos)",
      value: a.age,
      keyboardType: "numeric",
      section: "Identificação do paciente",
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
      section: "Identificação do paciente",
      presets: [
        { label: "Masculino", value: "Masculino" },
        { label: "Feminino", value: "Feminino" },
      ],
    },
    { id: "weightKg", label: "Peso (kg)", value: a.weightKg, keyboardType: "numeric", section: "Identificação do paciente", helperText: "Usado para volume inicial, insulina e reposição de potássio." },
    { id: "heightCm", label: "Altura (cm)", value: a.heightCm, keyboardType: "numeric", section: "Identificação do paciente", helperText: "Registrar junto ao peso para manter os dados antropométricos completos." },
    { id: "allergies", label: "Alergias medicamentosas", value: a.allergies, fullWidth: true, section: "Identificação do paciente", helperText: "Importa para antibióticos, antieméticos e outras medicações do atendimento." },

    {
      id: "dmType",
      label: "Tipo de DM",
      value: a.dmType,
      section: "Diabetes, insulina e riscos",
      presets: [
        { label: "DM1 / mais típico na CAD", value: "DM1" },
        { label: "DM2 / mais comum no EHH", value: "DM2" },
        { label: "Desconhecido / primeiro episódio de diabetes", value: "Desconhecido / primeiro episódio" },
      ],
    },
    {
      id: "insulinUse",
      label: "Uso de insulina (basal/bolus ou bomba)",
      value: a.insulinUse,
      section: "Diabetes, insulina e riscos",
      presets: [
        { label: "Em uso", value: "Em uso" },
        { label: "Não usa", value: "Não usa" },
        { label: "Bomba", value: "Bomba" },
      ],
    },
    {
      id: "sglt2i",
      label: "Inibidor SGLT2 (canagliflozina, dapagliflozina, empagliflozina…)",
      value: a.sglt2i,
      section: "Diabetes, insulina e riscos",
      presets: [
        { label: "Não usa", value: "Não" },
        { label: "Sim — risco de CAD com glicemia menos elevada", value: "Sim — euglicêmico DKA possível" },
      ],
    },
    {
      id: "comorbidities",
      label: "Comorbidades",
      value: a.comorbidities,
      section: "Diabetes, insulina e riscos",
      presetMode: "toggle_token",
      presets: [
        { label: "ICC", value: "ICC" },
        { label: "DRC", value: "DRC" },
        { label: "HAS", value: "HAS" },
        { label: "Obesidade", value: "Obesidade" },
        { label: "Doença hepática", value: "Doença hepática" },
      ],
    },

    { id: "spo2", label: "SpO₂ (%)", value: a.spo2, keyboardType: "numeric", section: "Primeiros minutos — emergência" },
    {
      id: "oxygenTherapy",
      label: "Oxigenoterapia",
      value: a.oxygenTherapy,
      section: "Primeiros minutos — emergência",
      presets: [
        { label: "Ar ambiente / sem O₂ no momento", value: "Ar ambiente" },
        { label: "Cateter nasal / hipoxemia leve", value: "CN por cateter" },
        { label: "Máscara / Venturi / necessidade moderada", value: "Máscara / Venturi" },
        { label: "VM não invasiva / desconforto respiratório", value: "VM não invasiva" },
      ],
    },
    {
      id: "ivAccess",
      label: "Acesso venoso",
      value: a.ivAccess,
      section: "Primeiros minutos — emergência",
      presets: [
        { label: "Ainda sem acesso", value: "Ainda sem acesso" },
        { label: "Periférico calibroso", value: "Periférico calibroso" },
        { label: "Dois acessos", value: "Dois acessos" },
        { label: "Central (se indicado)", value: "Central (se indicado)" },
      ],
    },
    {
      id: "ecgDone",
      label: "ECG realizado",
      value: a.ecgDone,
      section: "Primeiros minutos — emergência",
      presets: [
        { label: "Sim", value: "Sim" },
        { label: "Não / pendente", value: "Não / pendente" },
      ],
    },

    {
      id: "symptoms",
      label: "Sintomas",
      value: a.symptoms,
      fullWidth: true,
      section: "Apresentação clínica",
      presetMode: "toggle_token",
      presets: [
        { label: "Poliúria / polidipsia / desidratação progressiva", value: "Poliúria / polidipsia" },
        { label: "Náuseas / vômitos / intolerância oral", value: "Náuseas / vômitos" },
        { label: "Dor abdominal / pode simular abdome agudo", value: "Dor abdominal" },
        { label: "Dispneia / respiração de Kussmaul", value: "Dispneia / Kussmaul" },
        { label: "Alteração de consciência / sonolência / coma", value: "Alteração de consciência" },
      ],
    },
    {
      id: "systolicPressure",
      label: "PAS (mmHg)",
      value: a.systolicPressure,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "80", value: "80" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "130", value: "130" },
        { label: "140", value: "140" },
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
      ],
    },
    {
      id: "heartRate",
      label: "FC (bpm)",
      value: a.heartRate,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "70", value: "70" },
        { label: "90", value: "90" },
        { label: "100", value: "100" },
        { label: "110", value: "110" },
        { label: "120", value: "120" },
        { label: "130", value: "130" },
        { label: "140", value: "140" },
        { label: "150", value: "150" },
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
        { label: "18", value: "18" },
        { label: "24", value: "24" },
        { label: "30", value: "30" },
        { label: "36", value: "36" },
      ],
    },
    {
      id: "temperature",
      label: "Temperatura (°C)",
      value: a.temperature,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "35,5", value: "35,5" },
        { label: "36,5", value: "36,5" },
        { label: "37,5", value: "37,5" },
        { label: "39,0", value: "39,0" },
      ],
    },
    {
      id: "gcs",
      label: "GCS",
      value: a.gcs,
      keyboardType: "numeric",
      section: "Sinais vitais",
      presets: [
        { label: "15", value: "15" },
        { label: "13", value: "13" },
        { label: "10", value: "10" },
        { label: "8", value: "8" },
      ],
    },
    {
      id: "examDehydration",
      label: "Desidratação / perfusão",
      value: a.examDehydration,
      section: "Exame físico",
      presets: [
        { label: "Leve / sem choque", value: "Leve" },
        { label: "Moderada / hipovolemia clínica", value: "Moderada" },
        { label: "Grave / má perfusão / choque", value: "Grave" },
      ],
    },
    {
      id: "examOther",
      label: "Outros achados",
      value: a.examOther,
      fullWidth: true,
      section: "Exame físico",
      presetMode: "toggle_token",
      presets: [
        { label: "Hálito cetônico", value: "Hálito cetônico" },
        { label: "Dor abdominal difusa", value: "Dor abdominal difusa" },
        { label: "Sinais neurológicos focais", value: "Sinais neurológicos focais" },
      ],
    },

    {
      id: "glucose",
      label: "Glicemia (mg/dL)",
      value: a.glucose,
      keyboardType: "numeric",
      section: "Laboratório",
      presets: [
        { label: "250 (elevada)", value: "250" },
        { label: "400 (muito elevada)", value: "400" },
        { label: "600 (grave)", value: "600" },
        { label: "800 (extrema)", value: "800" },
      ],
    },
    {
      id: "ph",
      label: "pH (venoso/arterial)",
      value: a.ph,
      keyboardType: "numeric",
      section: "Laboratório",
      presets: [
        { label: "6,9", value: "6,9" },
        { label: "7,1", value: "7,1" },
        { label: "7,2", value: "7,2" },
        { label: "7,3", value: "7,3" },
      ],
    },
    {
      id: "bicarb",
      label: "HCO₃⁻ (mEq/L)",
      value: a.bicarb,
      keyboardType: "numeric",
      section: "Laboratório",
      helperText: "Normal ~22–28. Junto com Na⁺ e Cl⁻ ajuda a interpretar a acidose e o gap aniônico.",
      presets: [
        { label: "5 (acidose grave)", value: "5" },
        { label: "10 (baixo)", value: "10" },
        { label: "15 (baixo)", value: "15" },
        { label: "20 (baixo-normal)", value: "20" },
      ],
    },
    {
      id: "sodium",
      label: "Na⁺ (mEq/L)",
      value: a.sodium,
      keyboardType: "numeric",
      section: "Laboratório",
      helperText: "Normal ~135–145. Interpretar junto com glicemia e osmolaridade.",
      presets: [
        { label: "125 (hiponatremia)", value: "125" },
        { label: "135 (normal)", value: "135" },
        { label: "145 (limite superior)", value: "145" },
        { label: "155 (hipernatremia)", value: "155" },
      ],
    },
    {
      id: "chloride",
      label: "Cl⁻ (mEq/L)",
      value: a.chloride,
      keyboardType: "numeric",
      section: "Laboratório",
      helperText: "Normal ~98–106. Necessário para calcular o gap aniônico.",
      presets: [
        { label: "95 (baixo-normal)", value: "95" },
        { label: "100 (normal)", value: "100" },
        { label: "110 (elevado)", value: "110" },
      ],
    },
    {
      id: "potassium",
      label: "K⁺ (mEq/L)",
      value: a.potassium,
      keyboardType: "numeric",
      section: "Laboratório",
      helperText: "Normal ~3,5–5,0. Se < 3,3, não iniciar insulina até corrigir.",
      presets: [
        { label: "2,8 (hipocalemia grave)", value: "2,8" },
        { label: "3,3 (limiar crítico)", value: "3,3" },
        { label: "4,0 (normal)", value: "4,0" },
        { label: "5,5 (hipercalemia)", value: "5,5" },
      ],
    },
    {
      id: "creatinine",
      label: "Creatinina (mg/dL)",
      value: a.creatinine,
      keyboardType: "numeric",
      section: "Laboratório",
      presets: [
        { label: "0,8 (normal)", value: "0,8" },
        { label: "1,5 (elevada)", value: "1,5" },
        { label: "2,5 (IRA importante)", value: "2,5" },
        { label: "4,0 (grave)", value: "4,0" },
      ],
    },
    {
      id: "bun",
      label: "Ureia / BUN (mg/dL)",
      value: a.bun,
      keyboardType: "numeric",
      section: "Laboratório",
      presets: [
        { label: "20 (normal-alto)", value: "20" },
        { label: "40 (elevada)", value: "40" },
        { label: "80 (muito elevada)", value: "80" },
        { label: "120 (grave)", value: "120" },
      ],
    },
    {
      id: "ketones",
      label: "Cetonemia / β-hidroxibutirato ou cetonúria",
      value: a.ketones,
      fullWidth: true,
      section: "Laboratório",
      placeholder: "Positiva / negativa ou valor numérico",
      presets: [
        { label: "Negativa", value: "Negativa" },
        { label: "Traços", value: "Traços" },
        { label: "++", value: "++" },
        { label: "+++", value: "+++" },
        { label: "β-hidroxibutirato elevado", value: "β-hidroxibutirato elevado" },
      ],
    },
    {
      id: "lactate",
      label: "Lactato (opcional)",
      value: a.lactate,
      keyboardType: "numeric",
      section: "Laboratório",
      presets: [
        { label: "1,0 (normal)", value: "1,0" },
        { label: "2,0 (limite superior)", value: "2,0" },
        { label: "4,0 (elevado)", value: "4,0" },
      ],
    },

    {
      id: "precipitant",
      label: "Precipitante suspeito",
      value: a.precipitant,
      fullWidth: true,
      section: "Tratamento — condutas registradas",
      presetMode: "toggle_token",
      presets: [
        { label: "Infecção / principal precipitante do dia a dia", value: "Infecção" },
        { label: "Omissão de insulina / falha de bomba", value: "Omissão insulina / bomba" },
        { label: "IAM / SCA / evento cardiovascular agudo", value: "IAM / SCA" },
        { label: "Medicamento (corticoide, antipsicótico, SGLT2...)", value: "Medicamento (corticoide, etc.)" },
        { label: "Álcool / drogas / pancreatite associada", value: "Álcool / drogas" },
        { label: "Gestação", value: "Gestação" },
      ],
    },
    {
      id: "treatmentFluids",
      label: "Hidratação / cristalóide",
      value: a.treatmentFluids,
      fullWidth: true,
      section: "Tratamento — condutas registradas",
      presetMode: "toggle_token",
      presets: [
        { label: "SF 0,9% / expansão inicial conforme peso e perfusão", value: "SF 0,9% — bolus inicial conforme peso" },
        { label: "Cristaloide isotônico com reavaliação seriada", value: "Cristaloide isotônico com reavaliação seriada" },
        { label: "GL 5% quando glicemia atingir alvo com insulina em curso", value: "GL 5% quando glicemia alvo na CAD" },
      ],
    },
    {
      id: "treatmentInsulin",
      label: "Insulina IV",
      value: a.treatmentInsulin,
      fullWidth: true,
      section: "Tratamento — condutas registradas",
      placeholder: "U/kg/h, ajustes",
      presets: [
        { label: "0,05 U/kg/h / abordagem mais lenta", value: "0,05 U/kg/h" },
        { label: "0,1 U/kg/h / esquema mais usado na CAD", value: "0,1 U/kg/h" },
        { label: "Aguardar K antes de iniciar insulina", value: "Aguardando K antes de iniciar" },
      ],
    },
    {
      id: "treatmentPotassium",
      label: "Reposição de K⁺",
      value: a.treatmentPotassium,
      fullWidth: true,
      section: "Tratamento — condutas registradas",
      presets: [
        { label: "Sem reposição no momento", value: "Sem reposição" },
        { label: "20 mEq / reposição leve", value: "20 mEq" },
        { label: "40 mEq / reposição usual", value: "40 mEq" },
        { label: "Reposição vigorosa antes da insulina", value: "Reposição vigorosa antes da insulina" },
      ],
    },
    {
      id: "treatmentBicarb",
      label: "Bicarbonato (se utilizado)",
      value: a.treatmentBicarb,
      fullWidth: true,
      section: "Tratamento — condutas registradas",
      presets: [
        { label: "Não utilizado", value: "Não utilizado" },
        { label: "Bicarbonato IV", value: "Bicarbonato IV" },
      ],
    },
    {
      id: "treatmentOther",
      label: "Outras medicações (antibiótico, LMWH, etc.)",
      value: a.treatmentOther,
      fullWidth: true,
      section: "Tratamento — condutas registradas",
      presets: [
        { label: "Antibiótico", value: "Antibiótico" },
        { label: "HBPM / tromboprofilaxia", value: "HBPM / tromboprofilaxia" },
        { label: "Antiemético", value: "Antiemético" },
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
        { label: "Glicemia horária", value: "Glicemia horária" },
        { label: "K⁺ periódico", value: "K⁺ periódico" },
        { label: "Balanço hídrico", value: "Balanço hídrico" },
        { label: "Diurese", value: "Diurese" },
      ],
    },
    {
      id: "clinicalResponse",
      label: "Resposta clínica",
      value: a.clinicalResponse,
      section: "Evolução e destino",
      presets: [
        { label: "Melhora", value: "Melhora" },
        { label: "Estável", value: "Estável" },
        { label: "Piora", value: "Piora" },
      ],
    },
    {
      id: "destination",
      label: "Destino",
      value: a.destination,
      section: "Evolução e destino",
      presets: [
        { label: "UTI / caso grave ou instável", value: "UTI" },
        { label: "Observação intensiva / unidade intermediária", value: "Observação intensiva / intermediate" },
        { label: "Enfermaria / apenas se resolução adequada", value: "Enfermaria (caso selecionado)" },
      ],
    },
    {
      id: "freeNotes",
      label: "Transição SC / notas",
      value: a.freeNotes,
      fullWidth: true,
      section: "Evolução e destino",
      placeholder: "Critérios de resolução, esquema basal-bolus…",
      presets: [
        { label: "Planejar transição basal-bolus", value: "Planejar transição basal-bolus" },
        { label: "Reavaliar anion gap (fecha com resolução da CAD)", value: "Reavaliar anion gap" },
        { label: "Aguardando leito de UTI", value: "Aguardando leito de UTI" },
      ],
    },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "atendimento") return null;
  const a = session.assessment;
  return {
    title: "CAD / EHH — roteiro de emergência",
    description: classifySyndrome(a).label,
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
  const { label } = classifySyndrome(a);
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
      { label: "Peso", value: a.weightKg ? `${a.weightKg} kg` : "—" },
      { label: "Altura", value: a.heightCm ? `${a.heightCm} cm` : "—" },
      { label: "Classificação", value: label },
      { label: "Glicemia", value: a.glucose || "—" },
      { label: "pH", value: a.ph || "—" },
      { label: "Destino", value: a.destination || "—" },
    ],
  };
}

function getEncounterSummaryText(): string {
  const a = session.assessment;
  const { label, detailLines } = classifySyndrome(a);
  return [
    "CAD / EHH — resumo",
    `Classificação: ${label}`,
    ...detailLines.map((l) => `• ${l}`),
    "",
    `Paciente — peso: ${a.weightKg ? `${a.weightKg} kg` : "—"} · altura: ${a.heightCm ? `${a.heightCm} cm` : "—"}`,
    "",
    `Emergência — SpO₂: ${a.spo2 || "—"} · O₂: ${a.oxygenTherapy || "—"} · Acesso: ${a.ivAccess || "—"} · ECG: ${a.ecgDone || "—"}`,
    "",
    `Tratamento — volume: ${a.treatmentFluids || "—"}`,
    `Insulina: ${a.treatmentInsulin || "—"}`,
    `K⁺: ${a.treatmentPotassium || "—"}`,
    `Destino: ${a.destination || "—"}`,
    `Notas: ${a.freeNotes || "—"}`,
  ].join("\n");
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getEncounterReportHtml(): string {
  const body = escapeHtml(getEncounterSummaryText()).replace(/\n/g, "<br/>");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>CAD/EHH</title></head><body><pre style="font-family:system-ui">${body}</pre></body></html>`;
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
