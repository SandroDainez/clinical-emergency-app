/**
 * Ventilação mecânica — orientação educativa (PBW, metas por cenário, passo a passo).
 * Não substitui protocolo institucional nem decisão médica.
 */

import raw from "./protocols/ventilacao_mecanica.json";
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
  | "obstructive"
  | "post_op"
  | "neuro"
  | "acidosis"
  | "generic";

type Assessment = {
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
  spo2: string;
  plateauPressure: string;
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

function scenarioFromPreset(label: string): ScenarioKey {
  const x = label.toLowerCase();
  if (x.includes("ards") || x.includes("sdra")) return "ards";
  if (x.includes("obstrut") || x.includes("asma") || x.includes("dpoc")) return "obstructive";
  if (x.includes("pós") || x.includes("pos-op") || x.includes("pós-op")) return "post_op";
  if (x.includes("neuro")) return "neuro";
  if (x.includes("acidose")) return "acidosis";
  return "generic";
}

function isHypotension(a: Assessment): boolean {
  return a.hemodynamics.toLowerCase().includes("hipotens");
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const h = parseNum(a.heightCm);
  const pbw = h != null ? predictedBodyWeightKg(a.sex, h) : null;
  if (pbw != null) {
    out.push({ label: "Peso predito (PBW)", value: `${pbw} kg` });
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

  const scen = scenarioFromPreset(a.clinicalScenario);
  if (scen === "ards") {
    out.push({
      label: "Meta ARDS (referência)",
      value: "Vt ~6 mL/kg PBW; Pplat ≤30",
    });
  }
  if (scen === "obstructive") {
    out.push({
      label: "Obstrutivo",
      value: "Tempo expiratório longo; FR moderada",
    });
  }

  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
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

  recs.push({
    title: "Antes de tudo — segurança",
    tone: "danger",
    lines: [
      "Confirme modo (assistido/controlado), alarmes ativos e circuito sem vazamento.",
      "Se hipotensão ou choque: priorize perfusão; PEEP alto pode piorar débito — reduza PEEP com orientação e trate causa.",
      "Este módulo é educativo; decisões finais são do médico e do protocolo da unidade.",
    ],
  });

  const targetVtLo = pbw != null ? Math.round(6 * pbw) : null;
  const targetVtHi = pbw != null ? Math.round(8 * pbw) : null;

  recs.push({
    title: "Passo 1 — Entenda o que você está vendo no ventilador",
    tone: "info",
    lines: [
      "Modo: VC (volume) você escolhe o volume de cada respiração; PC (pressão) você escolhe a pressão inspiratória e o ventilador define o volume.",
      "Vt = volume corrente (mL). FR = frequência respiratória (respirações por minuto).",
      "PEEP = pressão no final da expiração (mantém alvéolos abertos). FiO₂ = fração de oxigênio (0,21 = ar ambiente).",
      "Pplat (platô) mede a distensão pulmonar na inspiração — peça pausa inspiratória / leitura no seu aparelho.",
    ],
  });

  if (scen === "ards") {
    const lines: string[] = [
      "Passo 2 — ARDS: proteção pulmonar",
      `Meta de Vt: ~6 mL/kg de peso predito${pbw != null ? ` (PBW ≈ ${pbw} kg → Vt alvo ≈ ${targetVtLo}–${targetVtHi} mL)` : " — preencha altura e sexo para calcular"}.`,
      "Se Pplat > 30 cmH₂O: reduza Vt primeiro (ex.: de 8 para 6 mL/kg PBW) e aceite hipercapnia permissiva se pH permitir.",
      "Se driving pressure (Pplat − PEEP) > 15: reveja volume, PEEP e complacência; busque ajuda especializada.",
      "PEEP e FiO₂: suba FiO₂ para SpO₂ 88–92% (ou alvo institucional); aumente PEEP gradualmente conforme tabela/protocolo local.",
    ];
    recs.push({ title: "ARDS — o que mudar primeiro", tone: "warning", lines });

    recs.push({
      title: "Passo 3 — Na prática, no teclado do ventilador",
      tone: "info",
      lines: [
        "Entre em menu de parâmetros do modo VC (ou equivalente).",
        "Ajuste Vt para o valor alvo em mL (não use peso corporal total para calcular Vt na ARDS).",
        "Defina FR para pH e PaCO₂ aceitáveis; se acidose: aumente FR (ou Vt mínimo se já limitado por Pplat).",
        "Após mudança, espere alguns minutos e repita gasometria; observe Pplat e SpO₂.",
      ],
    });
  } else if (scen === "obstructive") {
    recs.push({
      title: "Obstrutivo — tempo para expirar",
      tone: "warning",
      lines: [
        "Passo 2 — DPOC/asma: o ar fica preso (auto-PEEP). Precisa de expiração longa.",
        "Reduza FR (ex.: 10–14 irpm) e aumente tempo expiratório: relação I:E próxima de 1:3 a 1:5.",
        "Aumente fluxo inspiratório ou reduza tempo inspiratório para evitar inspiração longa demais.",
        "Use PEEP externa baixa no início; PEEP alta pode piorar auto-PEEP — individualize.",
        "Hipercapnia permissiva pode ser aceitável se pH > ~7,15 e paciente tolera (exceto se contraindicado).",
      ],
    });
    recs.push({
      title: "Passo 3 — No ventilador",
      tone: "info",
      lines: [
        "Localize FR (f) ou Total cycle e diminua passo a passo observando o tempo expiratório no gráfico (fluxo volta a zero).",
        "Ajuste I:E ou Tempo insp. para expiração mais longa que inspiração.",
        "Se pH baixo por acúmulo de CO₂: aumente FR com cuidado (piora auto-PEEP) — preferir broncodilatador e sedação adequada conforme prescrição.",
      ],
    });
  } else if (scen === "post_op") {
    recs.push({
      title: "Pós-operatório / pulmão “saudável”",
      tone: "info",
      lines: [
        "Passo 2 — Metas iniciais comuns",
        `Vt ${pbw != null ? `${targetVtLo}–${targetVtHi} mL (6–8 mL/kg PBW)` : "6–8 mL/kg PBW — calcule PBW"}.`,
        "FR 12–16; PEEP 5 cmH₂O em muitos casos; FiO₂ o menor que mantenha SpO₂ ≥ 92%.",
        "Se Pplat elevado sem ARDS: verifique tubo, secreção, broncoespasmo, pneumotórax.",
      ],
    });
  } else if (scen === "neuro") {
    recs.push({
      title: "Neuro — cuidado com CO₂",
      tone: "warning",
      lines: [
        "Passo 2 — Evite hipocapnia crônica (vasoconstrição cerebral).",
        "Meta muitas vezes PaCO₂ 35–45 mmHg (protocolo de neurointensiva se disponível).",
        "Hiperventilação breve só por indicação específica (ex.: herniação iminente) com monitorização.",
        "Ajuste FR e Vt em pequenos passos; repita gasometria.",
      ],
    });
  } else if (scen === "acidosis") {
    recs.push({
      title: "Acidose metabólica — alta demanda de ventilação",
      tone: "warning",
      lines: [
        "Passo 2 — O paciente “precisa” de ventilação para compensar; pode cansar.",
        "Volume minuto alto: FR elevada e/ou Vt maior — cuidado com barotrauma se Pplat alto.",
        "Trate a causa (ex.: sepse, DKA); não apenas “aumente a máquina”.",
        "Considere sedação/analgesia e relaxamento apenas se prescrito e monitorado.",
      ],
    });
  } else {
    recs.push({
      title: "Cenário geral",
      tone: "info",
      lines: [
        "Passo 2 — Ajuste conservador",
        `Vt inicial ${pbw != null ? `${targetVtLo}–${targetVtHi} mL` : "6–8 mL/kg PBW"}; FR para pH e conforto.`,
        "Titule FiO₂ e PEEP para SpO₂ alvo; evite oxigenoterapia excessiva sem necessidade.",
        "Reavalie gasometria e mecânica após mudanças.",
      ],
    });
  }

  if (hypo) {
    recs.push({
      title: "Hipotensão — cuidado com PEEP",
      tone: "danger",
      lines: [
        "PEEP reduz retorno venoso; em choque pode ser necessário reduzir PEEP temporariamente.",
        "Priorize volume, vasopressor e causa; só depois otimize oxigenação na VM.",
      ],
    });
  }

  if (vt != null && pbw != null && vt / pbw > 8 && scen === "ards") {
    recs.push({
      title: "Alerta: Vt alto para ARDS",
      tone: "danger",
      lines: [
        `Vt atual ≈ ${(vt / pbw).toFixed(1)} mL/kg PBW — acima do usual para proteção pulmonar.`,
        "Reduza Vt para ~6 mL/kg PBW se Pplat ou driving pressure elevados.",
      ],
    });
  }

  if (pplat != null && pplat > 30 && scen === "ards") {
    recs.push({
      title: "Pplat elevada",
      tone: "danger",
      lines: [
        `Pplat ${pplat} cmH₂O — meta típica ≤ 30 na estratégia protetora.`,
        "Reduza Vt; verifique esforço do paciente (sedação), auto-PEEP e acoplamento ao ventilador.",
      ],
    });
  }

  if (ph != null && paco2 != null) {
    if (ph < 7.2 && paco2 > 50) {
      recs.push({
        title: "Acidose respiratória importante",
        tone: "warning",
        lines: [
          "pH baixo com CO₂ alto: aumente ventilação (FR ou Vt dentro do seguro) ou trate obstrução/auto-PEEP.",
          "Se cenário ARDS limita Vt: aumente FR com atenção a tempo expiratório e Pplat.",
        ],
      });
    }
    if (ph > 7.45 && paco2 < 35 && scen === "neuro") {
      recs.push({
        title: "Alcalose / CO₂ baixo",
        tone: "warning",
        lines: [
          "Em neuro, hipocapnia prolongada pode reduzir perfusão cerebral — reduza FR ou Vt conforme seguro.",
        ],
      });
    }
  }

  recs.push({
    title: "Passo final — Reavaliar",
    tone: "info",
    lines: [
      "Após cada mudança: aguarde 5–15 minutos, nova gasometria, SpO₂, pressão arterial e conforto.",
      "Anote no prontuário o que alterou e por quê.",
      "Se alarme persistente ou piora: chame suporte / UTI.",
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
    title: ev.type === "PROTOCOL_STARTED" ? "VM — orientação iniciada" : "Evento",
    details: ev.data ? JSON.stringify(ev.data) : undefined,
  }));
}

function buildFields(a: Assessment): AuxiliaryPanel["fields"] {
  return [
    { id: "age", label: "Idade (anos)", value: a.age, keyboardType: "numeric", section: "Paciente e cenário" },
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
    },
    {
      id: "weightKg",
      label: "Peso real (kg)",
      value: a.weightKg,
      keyboardType: "numeric",
      section: "Paciente e cenário",
      helperText: "Para drogas; Vt na ARDS usa PBW pela altura",
    },
    {
      id: "clinicalScenario",
      label: "Cenário clínico principal",
      value: a.clinicalScenario,
      section: "Paciente e cenário",
      presets: [
        { label: "ARDS / SDRA", value: "ARDS / SDRA" },
        { label: "Obstrutivo (DPOC / asma)", value: "Obstrutivo (DPOC / asma)" },
        { label: "Pós-operatório / sem disfunção pulmonar aguda", value: "Pós-operatório / sem disfunção pulmonar aguda" },
        { label: "Neuro (lesão encefálica)", value: "Neuro (lesão encefálica)" },
        { label: "Acidose metabólica (alta demanda de VE)", value: "Acidose metabólica (alta demanda de VE)" },
        { label: "Outro / indeterminado", value: "Outro / indeterminado" },
      ],
    },
    {
      id: "hemodynamics",
      label: "Hemodinâmica",
      value: a.hemodynamics,
      section: "Paciente e cenário",
      presets: [
        { label: "Estável", value: "Estável" },
        { label: "Hipotensão / baixo débito", value: "Hipotensão / baixo débito" },
      ],
    },

    {
      id: "ventMode",
      label: "Modo no ventilador",
      value: a.ventMode,
      section: "Ventilador — ajustes atuais",
      presets: [
        { label: "VC-AC / volume controlado", value: "VC-AC" },
        { label: "PC-AC / pressão controlada", value: "PC-AC" },
        { label: "PRVC / VC+ / similar", value: "PRVC / VC+" },
        { label: "PS / espontâneo com apoio", value: "PS" },
        { label: "Ainda não iniciado / VMNI", value: "Não invasivo ainda" },
      ],
    },
    {
      id: "setVtMl",
      label: "Volume corrente (Vt) programado (mL)",
      value: a.setVtMl,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
    },
    {
      id: "setRr",
      label: "FR (resp/min)",
      value: a.setRr,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
    },
    {
      id: "setPeep",
      label: "PEEP (cmH₂O)",
      value: a.setPeep,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
    },
    {
      id: "setFio2",
      label: "FiO₂ (0,4 = 40%)",
      value: a.setFio2,
      keyboardType: "numeric",
      section: "Ventilador — ajustes atuais",
      placeholder: "0,21 a 1,0",
    },
    {
      id: "setInspiratoryFlow",
      label: "Fluxo inspiratório (L/min) ou observação",
      value: a.setInspiratoryFlow,
      fullWidth: true,
      section: "Ventilador — ajustes atuais",
      placeholder: "Opcional — importante no obstrutivo",
    },

    { id: "ph", label: "pH", value: a.ph, keyboardType: "numeric", section: "Gasometria e mecânica pulmonar" },
    {
      id: "paco2",
      label: "PaCO₂ (mmHg)",
      value: a.paco2,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
    },
    { id: "pao2", label: "PaO₂ (mmHg)", value: a.pao2, keyboardType: "numeric", section: "Gasometria e mecânica pulmonar" },
    { id: "spo2", label: "SpO₂ (%)", value: a.spo2, keyboardType: "numeric", section: "Gasometria e mecânica pulmonar" },
    {
      id: "plateauPressure",
      label: "Pressão de platô (Pplat, cmH₂O)",
      value: a.plateauPressure,
      keyboardType: "numeric",
      section: "Gasometria e mecânica pulmonar",
      helperText: "Pausa inspiratória / leitura no aparelho",
    },

    {
      id: "freeNotes",
      label: "Anotações / plano",
      value: a.freeNotes,
      fullWidth: true,
      section: "Anotações",
      placeholder: "Ex.: decisão de equipe, weaning, troca de tubo…",
    },
  ];
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  if (session.currentStateId !== "ajustes") return null;
  const a = session.assessment;
  return {
    title: "Ventilação mecânica",
    description: "Ajustes sugeridos com base no cenário; confirme com protocolo local.",
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
      { label: "Cenário", value: a.clinicalScenario || "—" },
      { label: "PBW", value: pbw != null ? `${pbw} kg` : "—" },
      { label: "Vt (set)", value: a.setVtMl || "—" },
    ],
  };
}

function getEncounterSummaryText(): string {
  const a = session.assessment;
  const pbw = parseNum(a.heightCm) != null ? predictedBodyWeightKg(a.sex, parseNum(a.heightCm)!) : null;
  return [
    "Ventilação mecânica — resumo",
    `Cenário: ${a.clinicalScenario || "—"}`,
    `PBW: ${pbw != null ? `${pbw} kg` : "—"}  Peso: ${a.weightKg || "—"} kg`,
    `Modo: ${a.ventMode || "—"}  Vt: ${a.setVtMl || "—"}  FR: ${a.setRr || "—"}  PEEP: ${a.setPeep || "—"}  FiO₂: ${a.setFio2 || "—"}`,
    `pH ${a.ph || "—"}  PaCO₂ ${a.paco2 || "—"}  PaO₂ ${a.pao2 || "—"}  SpO₂ ${a.spo2 || "—"}  Pplat ${a.plateauPressure || "—"}`,
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
  tick,
  updateAuxiliaryField,
  updateAuxiliaryStatus,
  updateAuxiliaryUnit,
  updateReversibleCauseStatus,
};

export type { ClinicalEngine } from "./clinical-engine";
