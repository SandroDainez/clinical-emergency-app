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
  fio2Fraction: string;   // armazena dispositivo de O₂ ou fração direta (retrocompat.)
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

// Deriva FiO₂ estimada a partir do dispositivo de O₂ selecionado ou de valor direto.
function estimateFio2FromDevice(raw: string): number {
  const v = raw.trim().toLowerCase();
  if (!v) return 0.21;
  // Tenta interpretar como número direto (retrocompat. com "0,21" ou "40")
  const direct = parseNum(v);
  if (direct !== null) return direct > 1 ? direct / 100 : direct;
  // Deriva a partir do dispositivo
  if (/cateter.*6|6.*l/i.test(v))          return 0.44;
  if (/cateter.*4|4.*l/i.test(v))          return 0.36;
  if (/cateter.*2|2.*l/i.test(v))          return 0.28;
  if (/cateter nasal/i.test(v))            return 0.36;  // fluxo médio 4 L/min
  if (/venturi.*50|50%/i.test(v))          return 0.50;
  if (/venturi.*40|40%/i.test(v))          return 0.40;
  if (/venturi.*35|35%/i.test(v))          return 0.35;
  if (/venturi.*28|28%/i.test(v))          return 0.28;
  if (/venturi/i.test(v))                  return 0.40;
  if (/reservatório|reservat/i.test(v))    return 0.85;
  if (/simples/i.test(v))                  return 0.50;
  if (/alto fluxo|hfnc/i.test(v))         return 0.60;
  if (/vni|bipap|cpap/i.test(v))           return 0.50;
  if (/intubação|iot|vm\b/i.test(v))       return 0.40;
  return 0.21;
}

function buildMetrics(a: Assessment): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  if (sbp != null && dbp != null && sbp > 0 && dbp > 0) {
    out.push({ label: "PAM estimada", value: `${formatMap(sbp, dbp)} mmHg` });
  }
  const spo2 = parseNum(a.oxygenSaturation);
  const fi = estimateFio2FromDevice(a.fio2Fraction);
  if (spo2 != null && fi > 0) {
    const ratio = Math.round(spo2 / fi);
    out.push({ label: "SpO₂/FiO₂ (aprox.)", value: `${ratio}` });
  }
  return out;
}

function buildRecommendations(a: Assessment): AuxiliaryPanelRecommendation[] {
  const recs: AuxiliaryPanelRecommendation[] = [];
  const sbp  = parseNum(a.systolicPressure);
  const dbp  = parseNum(a.diastolicPressure);
  const spo2 = parseNum(a.oxygenSaturation);
  const hr   = parseNum(a.heartRate);
  const rr   = parseNum(a.respiratoryRate);
  const map  = sbp != null && dbp != null ? (2 * dbp + sbp) / 3 : null;

  const lung    = (a.pulmonaryExam  ?? "").toLowerCase();
  const card    = (a.cardiacExam    ?? "").toLowerCase();
  const hist    = (a.comorbidities  ?? "").toLowerCase();
  const hyp     = (a.hypothesis     ?? "").toLowerCase();

  const hasCreps       = /estert|crepitação|estertores/i.test(lung);
  const hasShock       = map != null && map < 65;
  const hasHypertension= sbp != null && sbp >= 160;
  const hasModeratePA  = sbp != null && sbp >= 100 && sbp < 160;
  const hasHypoxia     = spo2 != null && spo2 < 92;
  const hasTachy       = hr != null && hr > 100;
  const hasRespDistress= rr != null && rr >= 28;
  const hasCopd        = /dpoc|epoc|enfisema|bronquite crônica/i.test(hist);
  const hasCKD         = /renal crônica|irc|dialise|hemodiálise/i.test(hist);
  const hasSCA         = /sca|iam|isquemia|infart/i.test(hyp + " " + hist);
  const hasAFib        = /fibrilação atrial|fa |flutter|fa\b/i.test(card + " " + hist);
  const hasContraVaso  = hasShock;

  // ── 1. POSICIONAMENTO — sempre primeiro ───────────────────────────────
  recs.push({
    title: "🪑 Posicionamento",
    tone: "info",
    priority: "high",
    lines: [
      "Sentar o paciente com pernas pendentes — reduz retorno venoso e melhora dispneia imediatamente.",
      "Evitar decúbito dorsal. Se rebaixamento ou IOT, cabeceira 30–45°.",
    ],
  });

  // ── 2. VMNI ────────────────────────────────────────────────────────────
  if (!hasShock) {
    recs.push({
      title: hasCopd
        ? "💨 VMNI — BiPAP (DPOC associado)"
        : "💨 VMNI — CPAP (EAP cardiogênico)",
      tone: hasHypoxia ? "warning" : "info",
      priority: hasHypoxia ? "high" : "medium",
      lines: hasCopd
        ? [
            "Modo: BiPAP | IPAP 14 cmH₂O / EPAP 6 cmH₂O — ajustar por tolerância e gasometria.",
            "FiO₂: 0,40–0,60 → titular SpO₂ 88–92% (evitar hiperoxia em DPOC).",
            "Reavaliação clínica e gasometria em 30–60 min.",
            "Contraindicações: parada cardíaca, vômitos incoercíveis, rebaixamento grave (GCS ≤ 8), choque refratário.",
          ]
        : [
            "Modo: CPAP 8–10 cmH₂O → aumentar até 12 se necessário.",
            "FiO₂: 0,40–1,0 → titular SpO₂ ≥ 94%.",
            "Benefício: reduz intubação em EAP cardiogênico quando tolerado hemodinamicamente.",
            "Falha / indicação de IOT: deterioração, fadiga muscular, GCS caindo, SpO₂ < 88% sem melhora.",
          ],
    });
  }

  // ── 3. NITRATO ─────────────────────────────────────────────────────────
  if (!hasShock) {
    if (hasHypertension) {
      recs.push({
        title: "💊 Nitroglicerina — vasodilatador (hipertensão)",
        tone: "info",
        priority: "high",
        lines: [
          "Indicação: EAP hipertensivo (PAS ≥ 160 mmHg) — 1ª linha farmacológica.",
          "SL: Nitroglicerina 0,5 mg SL a cada 5 min (máx 3 doses) ou spray 400 mcg.",
          "IV: Nitroglicerina 10–20 mcg/min em bomba — titular até ↓ 25% da PAS/hora (máx 200 mcg/min).",
          "Preparação IV: 50 mg em 250 mL SG5% (200 mcg/mL) — 3 mL/h = 10 mcg/min.",
          "⚠️ Contraindic.: PAS < 90 mmHg, uso de inibidor de fosfodiesterase (sildenafila < 24–48 h), estenose aórtica grave.",
        ],
      });
    } else if (hasModeratePA) {
      recs.push({
        title: "💊 Nitroglicerina — vasodilatador (PA preservada)",
        tone: "info",
        priority: "medium",
        lines: [
          "Indicação: EAP com PA preservada (PAS 100–159 mmHg).",
          "SL: Nitroglicerina 0,5 mg SL a cada 5 min com monitorização.",
          "IV: Nitroglicerina 5–10 mcg/min → titular com cautela (risco de hipotensão).",
          "⚠️ Interromper se PAS < 90 mmHg ou queda > 30% do basal.",
        ],
      });
    }
  }

  // ── 4. FUROSEMIDA ──────────────────────────────────────────────────────
  if (hasCreps || /congestão|sobrecarga|ic|edema/i.test(hyp)) {
    const hasDiuUse = /furosemida|diurético|lasix/i.test(hist);
    recs.push({
      title: "💊 Furosemida — diurético de alça",
      tone: "info",
      priority: hasCreps ? "high" : "medium",
      lines: [
        hasDiuUse
          ? "Uso prévio de diurético: dobrar dose oral habitual IV (mínimo 40 mg IV)."
          : "Sem uso prévio: Furosemida 40 mg IV em bolus (lento).",
        hasCKD
          ? "DRC: doses maiores podem ser necessárias (60–120 mg IV) — monitorar função renal e K⁺."
          : "Função renal preservada: reavalie resposta urinária em 1–2 h.",
        "Meta: diurese 0,5–1 mL/kg/h nas primeiras horas.",
        "Monitorar: K⁺, Mg²⁺, função renal após 4–6 h.",
        hasShock ? "⚠️ Choque cardiogênico: furosemida pode piorar hemodinâmica — priorizar inotrópico/vasopressor." : "",
      ].filter(Boolean) as string[],
    });
  }

  // ── 5. MORFINA — uso seletivo e controverso ────────────────────────────
  if (!hasShock) {
    recs.push({
      title: "💊 Morfina — uso seletivo (controverso)",
      tone: "warning",
      priority: "low",
      lines: [
        "Dose: 2–4 mg IV lento; repetir a cada 5–15 min se necessário (máx 10–15 mg).",
        "Benefício: sedação, reduz ansiedade e trabalho respiratório em casos refratários.",
        "⚠️ Evidências atuais questionam benefício e associam a piores desfechos em EAP.",
        "Considerar apenas se agitação extrema e sem resposta ao tratamento padrão.",
        "Contraindic.: hipotensão, rebaixamento, insuficiência respiratória grave, DPOC.",
      ],
    });
  }

  // ── 6. CHOQUE CARDIOGÊNICO ────────────────────────────────────────────
  if (hasShock) {
    recs.push({
      title: "🚨 Dobutamina — inotrópico (choque cardiogênico)",
      tone: "danger",
      priority: "high",
      lines: [
        "Indicação: EAP com choque cardiogênico (PAM < 65 mmHg + sinais de hipoperfusão).",
        "Dose inicial: 2–3 mcg/kg/min IV contínuo → titular até 20 mcg/kg/min.",
        "Preparação: 250 mg em 250 mL SG5% (1 mg/mL) — 60 kg → 0,9 mL/h = 2,5 mcg/kg/min.",
        "Monitorar: FC (pode causar taquicardia), PA, ritmo.",
        "Associar vasopressor (noradrenalina) se PAM < 65 mesmo com dobutamina.",
      ],
    });
    recs.push({
      title: "🚨 Noradrenalina — vasopressor (hipotensão refratária)",
      tone: "danger",
      priority: "high",
      lines: [
        "Indicação: choque com hipotensão refratária (PAM < 65 após volume e dobutamina).",
        "Dose: 0,1–0,3 mcg/kg/min IV contínuo → titular até PAM ≥ 65 mmHg.",
        "Preparação: 8 mg em 250 mL SG5% (32 mcg/mL) — 60 kg → 11,3 mL/h = 0,1 mcg/kg/min.",
        "Acesso central preferencial (pode causar necrose periférica).",
      ],
    });
    recs.push({
      title: "⚠️ Vasodilatadores — contraindicados no choque",
      tone: "danger",
      priority: "high",
      lines: [
        "Nitroglicerina, morfina e furosemida em dose alta podem reduzir ainda mais a PA.",
        "Priorizar inotrópico e vasopressor antes de qualquer diurético.",
        "Considerar balão intra-aórtico ou dispositivo de assistência ventricular precoce.",
      ],
    });
  }

  // ── 7. SCA ASSOCIADO ──────────────────────────────────────────────────
  if (hasSCA) {
    recs.push({
      title: "🫀 EAP em contexto de SCA — conduta paralela",
      tone: "warning",
      priority: "high",
      lines: [
        "AAS 200–300 mg VO (morder e engolir) — se sem contraindicação.",
        "Inibidor P2Y12: Ticagrelor 180 mg VO ou Clopidogrel 300 mg VO (conforme protocolo).",
        "Anticoagulação: Heparina não fracionada 60–70 U/kg IV bolus (máx 5000 U) → manutenção.",
        "Acionar hemodinâmica / SAMU para reperfusão precoce (fibrinólise ou ICPP).",
        "ECG 12 derivações urgente + troponina seriada.",
      ],
    });
  }

  // ── 8. FA/FLUTTER com EAP ─────────────────────────────────────────────
  if (hasAFib && (hasTachy || hasCreps)) {
    recs.push({
      title: "💊 FA com EAP — controle de FC",
      tone: "warning",
      priority: "high",
      lines: [
        "Cardioversão elétrica urgente se instabilidade hemodinâmica (PAM < 65, choque).",
        "Amiodarona 150–300 mg IV em 30–60 min → 900 mg em 24 h (se não reversão elétrica).",
        "Metoprolol ou diltiazem IV apenas se PA estiver preservada e sem IC sistólica grave.",
        "Digoxina IV 0,5 mg em bolus lento (alternativa em IC sistólica com FA — início lento).",
        "Meta FC: < 110 bpm na fase aguda.",
      ],
    });
  }

  return recs;
}

// ── Auto-sugestão de hipótese diagnóstica ──────────────────────────────────
function suggestHypothesis(a: Assessment): { value: string; label: string } | null {
  const sbp  = parseNum(a.systolicPressure);
  const dbp  = parseNum(a.diastolicPressure);
  const hr   = parseNum(a.heartRate);
  const spo2 = parseNum(a.oxygenSaturation);
  const map  = sbp != null && dbp != null ? (2 * dbp + sbp) / 3 : null;
  const lung = (a.pulmonaryExam  ?? "").toLowerCase();
  const card = (a.cardiacExam   ?? "").toLowerCase();
  const cc   = (a.chiefComplaint ?? "").toLowerCase();
  const hist = (a.comorbidities  ?? "").toLowerCase();

  const hasCreps    = /estert|crepitação|crepitante|estertores/i.test(lung);
  const hasJvd      = /estase jugular|jugular/i.test(card);
  const hasEdema    = /edema.*mm|mmii.*edema/i.test(card);
  const hasTachy    = hr != null && hr > 100;
  const hasHypo     = map != null && map < 65;
  const hasHyper    = sbp != null && sbp >= 160;
  const hasHypoxia  = spo2 != null && spo2 < 92;
  const hasSCA      = /dor.*peito|torac|angina|isquemia|iam|sca|infart/i.test(cc + " " + hist);
  const hasIC       = /insuficiência cardíaca|ic.*prévia|ic descompens|icc|cardiomiopatia/i.test(hist);
  const hasDial     = /dialise|hemodiálise|renal crônica|irc|dialítico/i.test(hist);
  const hasSepsis   = /sepse|infecção|febre|pneumonia/i.test(cc);

  // Dados insuficientes
  const hasData = sbp != null || spo2 != null || hasCreps || hasJvd;
  if (!hasData) return null;

  // Choque cardiogênico: hipotensão + sinais de congestão
  if (hasHypo && (hasCreps || hasJvd || hasEdema)) {
    return {
      value: "EAP cardiogênico com choque (PAM < 65 mmHg) — avaliar inotrópico/vasopressor",
      label: "Sugestão: EAP + choque cardiogênico (hipotensão + congestão)",
    };
  }

  // EAP em contexto de SCA / isquemia
  if (hasSCA && (hasCreps || hasHypoxia)) {
    return {
      value: "EAP em contexto de SCA / isquemia miocárdica",
      label: "Sugestão: EAP + SCA (dor torácica / isquemia + congestão)",
    };
  }

  // EAP cardiogênico hipertensivo — forma mais comum
  if (hasHyper && hasCreps) {
    return {
      value: "EAP cardiogênico hipertensivo — congestão aguda",
      label: "Sugestão: EAP cardiogênico hipertensivo (PA alta + estertores)",
    };
  }

  // Sobrecarga volêmica (ex.: renal, dialítico, IC crônica descompensada)
  if ((hasIC || hasDial) && (hasCreps || hasEdema)) {
    return {
      value: "Sobrecarga volêmica / descompensação de IC crônica",
      label: "Sugestão: sobrecarga volêmica (IC prévia ou renal + congestão)",
    };
  }

  // EAP cardiogênico com PA normal-preservada
  if ((hasCreps || hasHypoxia) && (hasJvd || hasEdema || hasTachy)) {
    return {
      value: "EAP cardiogênico provável — PA preservada",
      label: "Sugestão: EAP cardiogênico (estertores + sinais de congestão)",
    };
  }

  // EAP por sepse/SDRA
  if (hasSepsis && hasHypoxia) {
    return {
      value: "SDRA / EAP não cardiogênico — origem infecciosa (avaliar)",
      label: "Sugestão: EAP não cardiogênico (infecção + hipoxemia)",
    };
  }

  // Hipoxemia sem diagnóstico claro
  if (hasHypoxia && !hasCreps) {
    return {
      value: "Outro / indeterminado — investigar diferencial (embolia, SDRA, pneumonia)",
      label: "Sugestão: hipoxemia sem congestão evidente — ampliar diferencial",
    };
  }

  // Dados presentes mas padrão inconclusivo
  if (hasCreps) {
    return {
      value: "EAP cardiogênico provável — aguardar mais dados",
      label: "Sugestão: EAP provável (estertores bilaterais isolados)",
    };
  }

  return null;
}

// ── Auto-sugestão de dispositivo de O₂ ────────────────────────────────────
function suggestO2Device(a: Assessment): { value: string; label: string } | null {
  const spo2 = parseNum(a.oxygenSaturation);
  const sbp  = parseNum(a.systolicPressure);
  const dbp  = parseNum(a.diastolicPressure);
  const map  = sbp != null && dbp != null ? (2 * dbp + sbp) / 3 : null;
  const rr   = parseNum(a.respiratoryRate);
  const lung = (a.pulmonaryExam ?? "").toLowerCase();

  if (spo2 == null) return null;

  const hasRespDistress = (rr != null && rr >= 30) ||
    /esforço|tiragem|musculatura acess|sibilos/i.test(lung);
  const hasHypotension  = map != null && map < 65;

  // Hipoxemia grave → VMNI ou alto fluxo
  if (spo2 < 88 || (spo2 < 92 && hasRespDistress && !hasHypotension)) {
    return {
      value: "VNI (CPAP/BiPAP)",
      label: `Sugestão: VNI (SpO₂ ${spo2}% + esforço resp.) — CPAP/BiPAP`,
    };
  }
  if (spo2 < 88) {
    return {
      value: "Cânula de alto fluxo (HFNC)",
      label: `Sugestão: alto fluxo (SpO₂ ${spo2}% — hipoxemia grave)`,
    };
  }
  // Hipoxemia moderada → máscara com reservatório
  if (spo2 < 92) {
    return {
      value: "Máscara com reservatório 10–15 L/min",
      label: `Sugestão: máscara com reservatório (SpO₂ ${spo2}%)`,
    };
  }
  // Hipoxemia leve → máscara simples
  if (spo2 < 94) {
    return {
      value: "Máscara simples 5–10 L/min",
      label: `Sugestão: máscara simples (SpO₂ ${spo2}%)`,
    };
  }
  // SpO₂ 94–96% → cateter nasal
  if (spo2 < 97) {
    return {
      value: "Cateter nasal 2–4 L/min",
      label: `Sugestão: cateter nasal (SpO₂ ${spo2}%)`,
    };
  }
  // SpO₂ ≥ 97%
  return {
    value: "Ar ambiente — FiO₂ 0,21",
    label: `Sugestão: sem O₂ suplementar (SpO₂ ${spo2}%)`,
  };
}

// ── Auto-sugestão de parâmetros de VMNI ───────────────────────────────────
function suggestVni(a: Assessment): { value: string; label: string } | null {
  const spo2 = parseNum(a.oxygenSaturation);
  const sbp  = parseNum(a.systolicPressure);
  const dbp  = parseNum(a.diastolicPressure);
  const map  = sbp != null && dbp != null ? (2 * dbp + sbp) / 3 : null;
  const rr   = parseNum(a.respiratoryRate);
  const lung = (a.pulmonaryExam ?? "").toLowerCase();

  const hasRespDistress = (rr != null && rr >= 28) ||
    /esforço|tiragem|musculatura acess/i.test(lung);
  const hasHypoxia      = spo2 != null && spo2 < 92;
  const hasSevereHypoxia= spo2 != null && spo2 < 88;
  const hasHypotension  = map != null && map < 65;
  const hist            = (a.comorbidities ?? "").toLowerCase();
  const hasCopd         = /dpoc|epoc|enfisema|bronquite crônica/i.test(hist);

  if (!hasHypoxia && !hasRespDistress) return null;
  if (hasHypotension) return null; // contraindicação relativa

  // DPOC → BiPAP por hipercápnia potencial
  if (hasCopd || hasSevereHypoxia) {
    return {
      value: "BiPAP 14/6 — FiO₂ ajustar para SpO₂ 88–92%",
      label: "Sugestão: BiPAP (DPOC ou hipoxemia grave — risco hipercápnia)",
    };
  }
  // EAP cardiogênico → CPAP é primeira linha
  return {
    value: "CPAP 10 cmH₂O — boa tolerância",
    label: "Sugestão: CPAP 10 cmH₂O (EAP cardiogênico — primeira linha)",
  };
}

// ── Auto-sugestão de monitorização ───────────────────────────────────────
function suggestMonitoring(a: Assessment): { value: string; label: string } | null {
  const sbp = parseNum(a.systolicPressure);
  const dbp = parseNum(a.diastolicPressure);
  const map = sbp != null && dbp != null ? (2 * dbp + sbp) / 3 : null;
  const spo2 = parseNum(a.oxygenSaturation);

  const hasHypotension = map != null && map < 65;
  const hasHypoxia     = spo2 != null && spo2 < 92;

  const base = "ECG contínuo | Oximetria contínua | PA não invasiva a cada 5 min | Diurese horária";
  if (hasHypotension) {
    return {
      value: base + " | PA invasiva (arterial line) | Gasometria arterial seriada",
      label: "Sugestão: monitorização intensiva (hipotensão)",
    };
  }
  if (hasHypoxia) {
    return {
      value: base + " | Gasometria arterial | Capnografia se VNI",
      label: "Sugestão: monitorização com ênfase respiratória (hipoxemia)",
    };
  }
  return {
    value: base,
    label: "Sugestão: monitorização padrão EAP",
  };
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
      fio2Fraction: "",
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
  const sug       = getSuggestedTreatment(a);
  const hypSug    = suggestHypothesis(a);
  const o2Sug     = suggestO2Device(a);
  const vniSug    = suggestVni(a);
  const monSug    = suggestMonitoring(a);
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
      label: "O₂ em uso / FiO₂",
      value: a.fio2Fraction,
      fullWidth: true,
      placeholder: "Selecionar dispositivo de O₂",
      helperText: "FiO₂ estimada automaticamente para o cálculo SpO₂/FiO₂.",
      section: "Sinais vitais",
      ...(o2Sug ? { suggestedValue: o2Sug.value, suggestedLabel: o2Sug.label } : {}),
      presets: [
        { label: "Ar ambiente (sem O₂)", value: "Ar ambiente — FiO₂ 0,21" },
        { label: "Cateter nasal 2 L/min", value: "Cateter nasal 2 L/min" },
        { label: "Cateter nasal 4 L/min", value: "Cateter nasal 4 L/min" },
        { label: "Cateter nasal 6 L/min", value: "Cateter nasal 6 L/min" },
        { label: "Máscara simples 5–10 L/min", value: "Máscara simples 5–10 L/min" },
        { label: "Máscara c/ reservatório 10–15 L/min", value: "Máscara com reservatório 10–15 L/min" },
        { label: "Venturi 28%", value: "Máscara Venturi 28%" },
        { label: "Venturi 35%", value: "Máscara Venturi 35%" },
        { label: "Venturi 40%", value: "Máscara Venturi 40%" },
        { label: "Venturi 50%", value: "Máscara Venturi 50%" },
        { label: "Alto fluxo / HFNC", value: "Cânula de alto fluxo (HFNC)" },
        { label: "VNI / CPAP-BiPAP", value: "VNI (CPAP/BiPAP)" },
        { label: "IOT + VM", value: "Intubação orotraqueal + VM" },
      ],
    },
    { id: "gcs", label: "GCS (opcional)", value: a.gcs, keyboardType: "numeric", section: "Sinais vitais" },
    {
      id: "pulmonaryExam",
      label: "Ausculta pulmonar",
      value: a.pulmonaryExam,
      fullWidth: true,
      section: "Exame físico",
      presetMode: "toggle_token",
      placeholder: "Selecionar achados — múltipla escolha",
      presets: [
        // Murmúrio vesicular
        { label: "MV normal bilateral", value: "MV presente bilateralmente, sem ruídos adventícios" },
        { label: "MV ↓ bilateral", value: "MV diminuído bilateralmente" },
        { label: "MV ↓ base D", value: "MV diminuído em base direita" },
        { label: "MV ↓ base E", value: "MV diminuído em base esquerda" },
        { label: "MV abolido base D", value: "MV abolido em base direita" },
        { label: "MV abolido base E", value: "MV abolido em base esquerda" },
        // Crepitações (estertores)
        { label: "Estertores finos bases", value: "Estertores finos em bases bilaterais" },
        { label: "Estertores finos base D", value: "Estertores finos em base direita" },
        { label: "Estertores finos base E", value: "Estertores finos em base esquerda" },
        { label: "Estertores grossos bilat.", value: "Estertores grossos bilaterais" },
        { label: "Estertores difusos", value: "Estertores difusos bilaterais" },
        // Sibilos e roncos
        { label: "Sibilos difusos", value: "Sibilos difusos bilaterais" },
        { label: "Sibilos expiratórios", value: "Sibilos expiratórios difusos" },
        { label: "Roncos difusos", value: "Roncos difusos" },
        { label: "Roncos + sibilos", value: "Roncos e sibilos difusos" },
        // Percussão e consolidação
        { label: "Macicez base D", value: "Macicez à percussão em base direita" },
        { label: "Macicez base E", value: "Macicez à percussão em base esquerda" },
        { label: "Macicez bilateral", value: "Macicez bilateral" },
        { label: "Sopro tubular", value: "Sopro tubular — consolidação" },
        { label: "Egofonia", value: "Egofonia" },
        // Pneumotórax
        { label: "Timpanismo", value: "Timpanismo — suspeita de pneumotórax" },
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
      label: "Hipótese diagnóstica",
      value: a.hypothesis,
      fullWidth: true,
      section: "Diagnóstico diferencial",
      ...(hypSug ? { suggestedValue: hypSug.value, suggestedLabel: hypSug.label } : {}),
      helperText: hypSug
        ? "Sugestão baseada no contexto clínico — confirme ou ajuste."
        : "Preencha sinais vitais, ausculta e exame cardiovascular para sugestão automática.",
      presets: [
        { label: "EAP cardiogênico hipertensivo", value: "EAP cardiogênico hipertensivo — congestão aguda" },
        { label: "EAP cardiogênico — PA preservada", value: "EAP cardiogênico provável — PA preservada" },
        { label: "EAP + choque cardiogênico", value: "EAP cardiogênico com choque (PAM < 65 mmHg) — avaliar inotrópico/vasopressor" },
        { label: "EAP em contexto de SCA", value: "EAP em contexto de SCA / isquemia miocárdica" },
        { label: "Sobrecarga volêmica / IC descompensada", value: "Sobrecarga volêmica / descompensação de IC crônica" },
        { label: "SDRA / EAP não cardiogênico", value: "SDRA / EAP não cardiogênico — origem infecciosa (avaliar)" },
        { label: "Outro / indeterminado", value: "Outro / indeterminado — investigar diferencial (embolia, SDRA, pneumonia)" },
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
      helperText: vniSug
        ? "Parâmetros sugeridos pelo contexto — ajustar conforme resposta."
        : "Registre o modo (CPAP/BiPAP), pressões, FiO₂ e tolerância.",
      ...(vniSug ? { suggestedValue: vniSug.value, suggestedLabel: vniSug.label } : {}),
      presets: [
        // CPAP (EAP cardiogênico — 1ª linha)
        { label: "CPAP 8 cmH₂O (início)", value: "CPAP 8 cmH₂O — início" },
        { label: "CPAP 10 cmH₂O", value: "CPAP 10 cmH₂O" },
        { label: "CPAP 12 cmH₂O (↑ recrutamento)", value: "CPAP 12 cmH₂O — maior recrutamento alveolar" },
        // BiPAP (DPOC, hipercápnia, esforço)
        { label: "BiPAP 12/6", value: "BiPAP IPAP 12 / EPAP 6 cmH₂O" },
        { label: "BiPAP 14/6", value: "BiPAP IPAP 14 / EPAP 6 cmH₂O" },
        { label: "BiPAP 14/8", value: "BiPAP IPAP 14 / EPAP 8 cmH₂O" },
        { label: "BiPAP 16/8 (↑ suporte)", value: "BiPAP IPAP 16 / EPAP 8 cmH₂O — maior suporte pressórico" },
        // FiO₂ VMNI
        { label: "FiO₂ 0,40 (VMNI)", value: "FiO₂ 0,40 na VMNI" },
        { label: "FiO₂ 0,60 (VMNI)", value: "FiO₂ 0,60 na VMNI" },
        { label: "FiO₂ 1,0 (VMNI)", value: "FiO₂ 1,0 na VMNI" },
        // Resposta
        { label: "Boa tolerância", value: "Boa tolerância à VMNI" },
        { label: "Má tolerância / ajustar", value: "Má tolerância à VMNI — ajustar interface ou considerar IOT" },
        { label: "SpO₂ melhorou", value: "SpO₂ melhorou com VMNI" },
        { label: "SpO₂ não melhorou / IOT", value: "Sem melhora de SpO₂ — indicar IOT" },
      ],
    },
    {
      id: "ivAccess",
      label: "Acesso vascular",
      value: a.ivAccess,
      section: "Monitorização",
      presetMode: "toggle_token",
      presets: [
        { label: "1 via periférica", value: "1 via periférica calibrosa" },
        { label: "2 vias periféricas", value: "2 vias periféricas calibrosas" },
        { label: "Acesso central (CVC)", value: "Acesso venoso central (CVC)" },
        { label: "Cateter arterial", value: "Cateter arterial (PA invasiva)" },
        { label: "Sonda vesical", value: "Sonda vesical de demora" },
        { label: "Sonda nasogástrica", value: "Sonda nasogástrica" },
      ],
    },
    {
      id: "monitoring",
      label: "Monitorização",
      value: a.monitoring,
      fullWidth: true,
      section: "Monitorização",
      presetMode: "toggle_token",
      ...(monSug ? { suggestedValue: monSug.value, suggestedLabel: monSug.label } : {}),
      helperText: monSug
        ? "Parâmetros sugeridos pelo contexto — confirme os aplicáveis."
        : "Selecionar parâmetros de monitorização.",
      presets: [
        // Básicos
        { label: "ECG contínuo", value: "ECG contínuo" },
        { label: "Oximetria contínua", value: "Oximetria contínua" },
        { label: "PA não invasiva 5 min", value: "PA não invasiva a cada 5 min" },
        { label: "PA não invasiva 15 min", value: "PA não invasiva a cada 15 min" },
        { label: "Temperatura", value: "Temperatura" },
        { label: "Glicemia capilar", value: "Glicemia capilar" },
        // Respiratório / intensivo
        { label: "Capnografia (EtCO₂)", value: "Capnografia (EtCO₂)" },
        { label: "Gasometria arterial", value: "Gasometria arterial" },
        { label: "Gasometria arterial seriada", value: "Gasometria arterial seriada" },
        { label: "PA invasiva (arterial)", value: "PA invasiva (arterial line)" },
        { label: "Diurese horária", value: "Diurese horária" },
        // Cardiológico
        { label: "ECG 12 derivações", value: "ECG 12 derivações" },
        { label: "Troponina seriada", value: "Troponina seriada" },
        { label: "BNP / NT-proBNP", value: "BNP / NT-proBNP" },
        // Imagem
        { label: "RX tórax portátil", value: "Raio-X tórax portátil" },
        { label: "Eco point-of-care", value: "Ecocardiograma beira-leito (POCUS)" },
        // Laboratorial
        { label: "Lactato", value: "Lactato sérico" },
        { label: "Função renal / eletrólitos", value: "Função renal e eletrólitos (ureia, creatinina, Na, K)" },
        { label: "Hemograma", value: "Hemograma completo" },
        { label: "Coagulograma", value: "Coagulograma (TP, TTPA)" },
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
