/**
 * sedation-engine.ts
 *
 * Dados clínicos e cálculo do módulo "Sedoanalgesia & BNM".
 * Espelha o padrão do vasoactive-engine: fármacos com apresentações, soluções
 * padrão, faixas de dose e cálculo dose↔taxa. Inclui modos bolus/infusão.
 *
 * Convenção interna: basePerAmpoule e concentração SEMPRE em mcg (base canônica).
 *   concMcgPerMl = (ampolas × basePerAmpoule) / volumeFinal
 *   concMgPerMl  = concMcgPerMl / 1000
 *
 * Fórmulas (não modificar):
 *   mcg/kg/min : taxa = (dose × peso × 60) / concMcgPerMl
 *   mcg/kg/h   : taxa = (dose × peso)       / concMcgPerMl
 *   mg/kg/h    : taxa = (dose × peso)       / concMgPerMl
 *   mg/h       : taxa = dose                / concMgPerMl
 *   mcg/h      : taxa = dose                / concMcgPerMl
 *   bolus mg/kg: total = dose × peso ; volume = total / concPuraMgPerMl
 *   bolus mcg/kg: total = dose × peso ; volume = total / concPuraMcgPerMl
 */

import type {
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";

export type SedGroup = "sedacao" | "analgesia" | "bnm";
export type Diluent = "SF" | "SG";
export type SedDisplayUnit = "mg/mL" | "mcg/mL";
export type InfusionUnit = "mcg/kg/min" | "mcg/kg/h" | "mg/kg/h" | "mg/h" | "mcg/h";
export type BolusUnit = "mg/kg" | "mcg/kg";

export type DoseRange = {
  /** Limite superior da faixa (exclusivo); null = sem teto (faixa final). */
  upTo: number | null;
  tone: "green" | "yellow" | "orange" | "red";
  label: string;
  indication: string;
};

export type SedMode = {
  id: string;
  label: string;
  kind: "infusion" | "bolus";
  /** Unidade da dose (taxa para infusão, por kg para bolus). */
  unit: InfusionUnit | BolusUnit;
  defaultDose: string;
  /** Faixas coloridas (infusão). */
  ranges?: DoseRange[];
  /** Faixa de referência do bolus (texto). */
  bolusNotes?: string[];
  /** Marca o atalho ACURASYS (cisatracúrio). */
  acurasys?: { label: string; doseMgH: number };
};

export type SedPresentation = {
  id: string;
  label: string;
  ampouleVolumeMl: number;
  basePerAmpoule: number; // em mcg
  concentrationLabel: string;
  notes?: string;
};

export type SedStandardSolution = {
  id: string;
  label: string;
  presentationId: string;
  ampoules: string;
  diluentMl: string;
  diluent: Diluent;
};

export type SedDrug = {
  key: string;
  group: SedGroup;
  name: string;
  className: string;
  emoji: string;
  displayUnit: SedDisplayUnit;
  pure?: boolean; // usado puro (propofol, fentanil)
  presentations: SedPresentation[];
  standardSolutions: SedStandardSolution[];
  modes: SedMode[];
  strategy: string[];
  alert: { icon: string; tone: "warn" | "danger"; lines: string[] };
  info: string[];
  reference: string;
  /** Rocurônio: lembrete de interação com MgSO₄. */
  magnesiumInteraction?: boolean;
};

// ─── Catálogo de fármacos ────────────────────────────────────────────────────

export const SED_DRUGS: SedDrug[] = [
  // ═══ GRUPO 1 — SEDAÇÃO ═══
  {
    key: "propofol",
    group: "sedacao",
    name: "Propofol",
    className: "Hipnótico IV",
    emoji: "🔵",
    displayUnit: "mg/mL",
    pure: true,
    presentations: [
      { id: "amp50", label: "Ampola 10 mg/mL · 50 mL", ampouleVolumeMl: 50, basePerAmpoule: 500000, concentrationLabel: "10 mg/mL (500 mg/50 mL)" },
      { id: "frasco20", label: "Frasco 10 mg/mL · 20 mL", ampouleVolumeMl: 20, basePerAmpoule: 200000, concentrationLabel: "10 mg/mL (200 mg/20 mL)" },
    ],
    standardSolutions: [
      { id: "puro50", label: "Puro · 1 amp 50 mL → 50 mL", presentationId: "amp50", ampoules: "1", diluentMl: "0", diluent: "SG" },
      { id: "puro100", label: "Puro · 2 amp → 100 mL", presentationId: "amp50", ampoules: "2", diluentMl: "0", diluent: "SG" },
    ],
    modes: [
      {
        id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mcg/kg/min", defaultDose: "30",
        ranges: [
          { upTo: 20, tone: "green", label: "Sedação leve (RASS −1/−2)", indication: "Desmame de VM, procedimentos" },
          { upTo: 50, tone: "yellow", label: "Sedação moderada (RASS −2/−3)", indication: "UTI padrão" },
          { upTo: 80, tone: "orange", label: "Sedação profunda (RASS −3/−4)", indication: "SARA, status epilepticus" },
          { upTo: null, tone: "red", label: "Dose alta — risco de síndrome do propofol", indication: "Máx 80 mcg/kg/min por < 48 h" },
        ],
      },
    ],
    strategy: [
      "Hipnótico de início ultrarrápido e despertar rápido — sedação de curta/média duração na UTI e em procedimentos.",
      "Titular pelo RASS; reduzir antes de avaliações neurológicas e despertar diário (SAT).",
      "Causa hipotensão dose-dependente — cuidado em instável; associar vasopressor se necessário.",
    ],
    alert: {
      icon: "⚠️", tone: "danger",
      lines: [
        "Síndrome do propofol: doses > 5 mg/kg/h (≈ 83 mcg/kg/min) por > 48 h — monitorar triglicerídeos, CPK e pH/lactato.",
        "Usar com cautela em crianças < 16 anos.",
      ],
    },
    info: [
      "Emulsão lipídica: 1 mL = ~1,1 kcal — descontar do suporte nutricional.",
      "Não usar em alergia a ovo ou soja.",
      "pH ácido — dor na injeção (lidocaína prévia reduz).",
      "Meia-vida contexto-sensível curta — acorda rápido após suspensão.",
    ],
    reference: "PADIS Guidelines 2018 (Crit Care Med).",
  },
  {
    key: "midazolam",
    group: "sedacao",
    name: "Midazolam",
    className: "Benzodiazepínico",
    emoji: "🟣",
    displayUnit: "mg/mL",
    presentations: [
      { id: "amp", label: "Ampola 5 mg/mL · 10 mL (50 mg)", ampouleVolumeMl: 10, basePerAmpoule: 50000, concentrationLabel: "5 mg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "1 mg/mL · 2 amp (100 mg) + 80 mL SF → 100 mL", presentationId: "amp", ampoules: "2", diluentMl: "80", diluent: "SF" },
      { id: "concentrado", label: "2 mg/mL · 4 amp (200 mg) + 60 mL SF → 100 mL", presentationId: "amp", ampoules: "4", diluentMl: "60", diluent: "SF" },
    ],
    modes: [
      {
        id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mg/kg/h", defaultDose: "0,05",
        ranges: [
          { upTo: 0.04, tone: "green", label: "Sedação leve (ansiolítico/hipnótico)", indication: "0,02–0,04 mg/kg/h — RASS −1" },
          { upTo: 0.1, tone: "yellow", label: "Sedação moderada — RASS −2/−3", indication: "0,04–0,10 mg/kg/h" },
          { upTo: 0.2, tone: "orange", label: "Sedação profunda — RASS −3/−4", indication: "0,10–0,20 mg/kg/h" },
          { upTo: null, tone: "red", label: "Dose alta — acúmulo após 24–48 h", indication: "> 0,20 mg/kg/h — preferir propofol/dexmedetomidina" },
        ],
      },
      {
        id: "bolus", label: "Bolus", kind: "bolus", unit: "mg/kg", defaultDose: "0,03",
        bolusNotes: [
          "Sedação / ansiólise: 0,01–0,05 mg/kg IV lento (titular).",
          "Crise convulsiva: 0,1–0,2 mg/kg IV (ou 10 mg IM/bucal se sem acesso).",
          "Início 1–3 min; pico em 3–5 min. Bolus rápido pode causar hipotensão/depressão respiratória.",
        ],
      },
    ],
    strategy: [
      "Benzodiazepínico para sedação — útil em abstinência alcoólica, status epilepticus e quando se deseja amnésia.",
      "Para sedação prolongada, preferir propofol ou dexmedetomidina (menos delirium — MIDEX/PRODEX).",
      "Titular pelo RASS; vigiar acúmulo em disfunção hepática/renal.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "Acúmulo significativo após 24–48 h (metabólito ativo 1-OH-midazolam).",
        "Maior incidência de delirium vs propofol/dexmedetomidina (MIDEX/PRODEX).",
      ],
    },
    info: [
      "Meia-vida aumenta em insuficiência hepática e renal.",
      "Bolus IV rápido pode causar hipotensão.",
      "Antídoto: flumazenil 0,2 mg IV (repetir até 1 mg).",
      "Infusão 0,02–0,2 mg/kg/h (≈ 1,4–14 mg/h em 70 kg). Bolus de sedação: 0,01–0,05 mg/kg.",
    ],
    reference: "MIDEX/PRODEX trials (JAMA 2012).",
  },
  {
    key: "cetamina",
    group: "sedacao",
    name: "Cetamina",
    className: "Anestésico dissociativo",
    emoji: "🟦",
    displayUnit: "mg/mL",
    presentations: [
      { id: "frasco", label: "Frasco 50 mg/mL · 10 mL (500 mg)", ampouleVolumeMl: 10, basePerAmpoule: 500000, concentrationLabel: "50 mg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "2 mg/mL · 1 amp (500 mg) + 240 mL SF → 250 mL", presentationId: "frasco", ampoules: "1", diluentMl: "240", diluent: "SF" },
      { id: "concentrado", label: "4 mg/mL · 2 amp (1.000 mg) + 230 mL SF → 250 mL", presentationId: "frasco", ampoules: "2", diluentMl: "230", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Indução / bolus", kind: "bolus", unit: "mg/kg", defaultDose: "1,5",
        bolusNotes: ["Indução: 1–2 mg/kg IV em 60 s.", "ISR (paciente instável): 1,5–2 mg/kg.", "Início ~30–60 s; duração 10–20 min."] },
      { id: "inf", label: "Sedação dissociativa (infusão)", kind: "infusion", unit: "mg/kg/h", defaultDose: "1",
        ranges: [
          { upTo: 1, tone: "green", label: "Sedação leve / analgesia", indication: "0,5–1 mg/kg/h" },
          { upTo: 2, tone: "yellow", label: "Sedação dissociativa", indication: "1–2 mg/kg/h" },
          { upTo: null, tone: "orange", label: "Dose alta — vigiar disforia/secreções", indication: "Reavaliar necessidade" },
        ] },
      { id: "adj", label: "Analgesia adjuvante (subanestésica)", kind: "infusion", unit: "mg/kg/h", defaultDose: "0,2",
        ranges: [
          { upTo: 0.3, tone: "green", label: "Opioid-sparing (subanestésica)", indication: "0,1–0,3 mg/kg/h" },
          { upTo: null, tone: "yellow", label: "Acima da faixa adjuvante", indication: "Reavaliar objetivo" },
        ] },
    ],
    strategy: [
      "Anestésico dissociativo com analgesia potente e broncodilatação; preserva drive e pressão (simpatomimético).",
      "Indutor de escolha no choque/instabilidade e no broncoespasmo grave.",
      "Reduz consumo de opioide (opioid-sparing) em dose subanestésica.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "Aumenta secreções (pré-medicar atropina 0,01 mg/kg se necessário).",
        "Pode elevar PIC — cautela em TCE grave (segura com ventilação controlada normal).",
        "Disforia pós-uso em adultos — mitigar com benzodiazepínico.",
      ],
    },
    info: [
      "✅ Broncoespasmo grave / status asmático.",
      "✅ Choque / instabilidade hemodinâmica (mantém PA).",
      "✅ ISR em paciente instável (indutor de escolha).",
      "✅ Analgesia em grande queimado / trauma e procedimentos dolorosos.",
    ],
    reference: "Miller's Anesthesia 9ª ed. · consensos de ISR.",
  },
  {
    key: "dexmedetomidina",
    group: "sedacao",
    name: "Dexmedetomidina",
    className: "Agonista α-2 (Precedex)",
    emoji: "🔷",
    displayUnit: "mcg/mL",
    presentations: [
      { id: "amp", label: "Ampola 100 mcg/mL · 2 mL (200 mcg)", ampouleVolumeMl: 2, basePerAmpoule: 200, concentrationLabel: "100 mcg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "1,6 mcg/mL · 2 amp (400 mcg) + 246 mL SF → 250 mL", presentationId: "amp", ampoules: "2", diluentMl: "246", diluent: "SF" },
      { id: "concentrado", label: "4 mcg/mL · 5 amp (1.000 mcg) + 240 mL SF → 250 mL", presentationId: "amp", ampoules: "5", diluentMl: "240", diluent: "SF" },
    ],
    modes: [
      {
        id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mcg/kg/h", defaultDose: "0,7",
        ranges: [
          { upTo: 0.4, tone: "green", label: "Ansiolítico / adjuvante sem sedação significativa", indication: "0,2–0,4 mcg/kg/h" },
          { upTo: 0.7, tone: "yellow", label: "Sedação leve (RASS 0/−1) — preserva drive", indication: "0,4–0,7 mcg/kg/h" },
          { upTo: 1.0, tone: "orange", label: "Sedação moderada (RASS −1/−2)", indication: "0,7–1,0 mcg/kg/h" },
          { upTo: null, tone: "red", label: "Dose máxima — bradicardia/hipotensão", indication: "Até 1,5 mcg/kg/h" },
        ],
      },
    ],
    strategy: [
      "Agonista α-2: sedação com analgesia preservando o drive respiratório — paciente comunicativo (RASS 0/−1).",
      "Ideal no desmame de VM e no delirium hiperativo; reduz consumo de opioide.",
      "Iniciar direto na manutenção (sem bolus de ataque em UTI).",
    ],
    alert: {
      icon: "⚠️", tone: "danger",
      lines: [
        "NÃO usar bolus de ataque em UTI (risco de bradicardia grave e hipotensão).",
        "Iniciar direto na dose de manutenção; monitorar FC e PA continuamente.",
      ],
    },
    info: [
      "✅ Desmame de VM (preserva drive respiratório).",
      "✅ Delirium hiperativo em UTI.",
      "✅ Opioid-sparing; sedação com paciente comunicativo.",
      "✅ Betabloqueados — sem interação relevante.",
    ],
    reference: "MENDS2 trial (NEJM 2021).",
  },

  // ═══ GRUPO 2 — ANALGESIA ═══
  {
    key: "fentanil",
    group: "analgesia",
    name: "Fentanil",
    className: "Opioide",
    emoji: "🟠",
    displayUnit: "mcg/mL",
    pure: true,
    presentations: [
      { id: "amp2", label: "Ampola 50 mcg/mL · 2 mL (100 mcg)", ampouleVolumeMl: 2, basePerAmpoule: 100, concentrationLabel: "50 mcg/mL" },
      { id: "amp10", label: "Ampola 50 mcg/mL · 10 mL (500 mcg)", ampouleVolumeMl: 10, basePerAmpoule: 500, concentrationLabel: "50 mcg/mL" },
    ],
    standardSolutions: [
      { id: "puro20", label: "Puro 50 mcg/mL → 20 mL (1.000 mcg)", presentationId: "amp10", ampoules: "2", diluentMl: "0", diluent: "SF" },
      { id: "puro50", label: "Puro 50 mcg/mL → 50 mL (2.500 mcg)", presentationId: "amp10", ampoules: "5", diluentMl: "0", diluent: "SF" },
      { id: "diluido", label: "10 mcg/mL · 5 amp (500 mcg) + 40 mL SF → 50 mL", presentationId: "amp2", ampoules: "5", diluentMl: "40", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Bolus", kind: "bolus", unit: "mcg/kg", defaultDose: "1",
        bolusNotes: ["Analgesia: 1–2 mcg/kg IV lento (2–3 min).", "Pré-intubação (atenuar resposta): 2–3 mcg/kg.", "Co-indutor ISR: 2–3 mcg/kg."] },
      { id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mcg/h", defaultDose: "75",
        ranges: [
          { upTo: 50, tone: "green", label: "Analgesia leve", indication: "Procedimentos, pós-op simples" },
          { upTo: 100, tone: "yellow", label: "Analgesia moderada — UTI padrão", indication: "50–100 mcg/h" },
          { upTo: 200, tone: "orange", label: "Analgesia intensa", indication: "Queimado, politrauma" },
          { upTo: null, tone: "red", label: "Alta dose — acúmulo (meia-vida contexto-sensível)", indication: "Considerar remifentanil" },
        ] },
    ],
    strategy: [
      "Opioide de 1ª linha para analgesia em VM (analgosedação) — analgesia primeiro, sedação depois.",
      "Bolus para pré-intubação e procedimentos; infusão para analgesia contínua.",
      "Meia-vida contexto-sensível aumenta com infusões longas.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "Rigidez torácica com bolus IV rápido em dose alta (> 5 mcg/kg).",
        "Infusões > 2–4 h prolongam o despertar — considerar remifentanil se precisar desmame rápido.",
      ],
    },
    info: [
      "Não tem metabólito ativo relevante — preferível à morfina em IRA.",
      "Antídoto: naloxona 0,4 mg IV (repetir a cada 2–3 min).",
      "1 mL = 50 mcg na apresentação padrão.",
    ],
    reference: "PADIS 2018 · Miller's Anesthesia 9ª ed.",
  },
  {
    key: "morfina",
    group: "analgesia",
    name: "Morfina",
    className: "Opioide",
    emoji: "🟡",
    displayUnit: "mg/mL",
    presentations: [
      { id: "amp", label: "Ampola 10 mg/mL · 1 mL (10 mg)", ampouleVolumeMl: 1, basePerAmpoule: 10000, concentrationLabel: "10 mg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "1 mg/mL · 10 amp (100 mg) + 90 mL SF → 100 mL", presentationId: "amp", ampoules: "10", diluentMl: "90", diluent: "SF" },
      { id: "sg", label: "1 mg/mL · 10 amp (100 mg) + 90 mL SG5% → 100 mL", presentationId: "amp", ampoules: "10", diluentMl: "90", diluent: "SG" },
      { id: "concentrado", label: "2 mg/mL · 20 amp (200 mg) + 80 mL SF → 100 mL", presentationId: "amp", ampoules: "20", diluentMl: "80", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Bolus", kind: "bolus", unit: "mg/kg", defaultDose: "0,05",
        bolusNotes: ["2–4 mg IV lento (5 min) — repetir a cada 4 h se necessário.", "Referência por peso: ~0,05–0,1 mg/kg."] },
      { id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mg/h", defaultDose: "3",
        ranges: [
          { upTo: 3, tone: "green", label: "Analgesia leve a moderada", indication: "1–3 mg/h" },
          { upTo: 6, tone: "yellow", label: "Analgesia moderada a intensa", indication: "3–6 mg/h" },
          { upTo: 10, tone: "orange", label: "Analgesia intensa — cuidado em IRA", indication: "6–10 mg/h" },
          { upTo: null, tone: "red", label: "Alta dose — acúmulo de M6G em IRA", indication: "Preferir fentanil em IRA" },
        ] },
    ],
    strategy: [
      "Opioide para analgesia moderada a intensa; útil também no edema agudo de pulmão (alívio + venodilatação).",
      "Evitar em insuficiência renal (acúmulo de M6G) — preferir fentanil.",
      "Histaminoliberação: pode causar hipotensão e broncoespasmo.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "Metabólito ativo (M6G) acumula em IRA — preferir fentanil.",
        "Histaminoliberação — hipotensão/broncoespasmo. Antídoto: naloxona 0,4 mg IV.",
      ],
    },
    info: [
      "Início de ação mais lento que o fentanil.",
      "Bolus de 2–4 mg costuma ser titulado pela dor e nível de consciência.",
    ],
    reference: "PADIS Guidelines 2018.",
  },

  // ═══ GRUPO 3 — BNM ═══
  {
    key: "rocuronio",
    group: "bnm",
    name: "Rocurônio",
    className: "BNM adespolarizante",
    emoji: "🔴",
    displayUnit: "mg/mL",
    magnesiumInteraction: true,
    presentations: [
      { id: "amp", label: "Ampola 10 mg/mL · 5 mL (50 mg)", ampouleVolumeMl: 5, basePerAmpoule: 50000, concentrationLabel: "10 mg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "2 mg/mL · 10 amp (500 mg) + 200 mL SF → 250 mL", presentationId: "amp", ampoules: "10", diluentMl: "200", diluent: "SF" },
      { id: "menor", label: "2 mg/mL · 5 amp (250 mg) + 100 mL SF → 125 mL", presentationId: "amp", ampoules: "5", diluentMl: "100", diluent: "SF" },
    ],
    modes: [
      { id: "isr", label: "Bolus — ISR / intubação", kind: "bolus", unit: "mg/kg", defaultDose: "1,2",
        bolusNotes: ["ISR: 1,2 mg/kg IV em bolus ultrarrápido (da ampola pura 10 mg/mL).", "Início 45–60 s; duração 45–70 min."] },
      { id: "vm", label: "Bolus — facilitação de VM", kind: "bolus", unit: "mg/kg", defaultDose: "0,6",
        bolusNotes: ["0,6 mg/kg IV.", "Início 90–120 s; duração 30–45 min."] },
      { id: "inf", label: "Infusão contínua — UTI", kind: "infusion", unit: "mg/kg/h", defaultDose: "0,4",
        ranges: [
          { upTo: 0.6, tone: "yellow", label: "Bloqueio contínuo (UTI)", indication: "0,3–0,6 mg/kg/h" },
          { upTo: null, tone: "orange", label: "Acima da faixa usual", indication: "Monitorar TOF" },
        ] },
    ],
    strategy: [
      "BNM adespolarizante de início rápido — alternativa à succinilcolina na ISR (1,2 mg/kg).",
      "Infusão contínua na UTI para SARA grave/assincronia refratária — sempre com sedação e analgesia plenas.",
      "Monitorar com neuroestimulador (TOF).",
    ],
    alert: {
      icon: "🚨", tone: "danger",
      lines: [
        "ANTÍDOTO SUGAMADEX — CICO/emergência: 16 mg/kg IV (70 kg = 1.120 mg); profunda: 4 mg/kg; moderada (T2): 2 mg/kg. Reversão < 3 min.",
        "Manter sugamadex à beira leito SEMPRE que rocurônio em uso.",
        "MgSO₄ potencializa — reduzir dose 30–50% (ex.: eclâmpsia). Monitorar TOF.",
      ],
    },
    info: [
      "NUNCA bloquear sem garantir sedação e analgesia adequadas (paciente acordado paralisado).",
      "Duração prolongada em hepatopatia.",
      "Bolus calculado a partir da ampola PURA (10 mg/mL).",
    ],
    reference: "Miller's Anesthesia 9ª ed. · ASA Difficult Airway 2022.",
  },
  {
    key: "cisatracurio",
    group: "bnm",
    name: "Cisatracúrio",
    className: "BNM adespolarizante",
    emoji: "🔴",
    displayUnit: "mg/mL",
    presentations: [
      { id: "amp", label: "Ampola 2 mg/mL · 10 mL (20 mg)", ampouleVolumeMl: 10, basePerAmpoule: 20000, concentrationLabel: "2 mg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "0,8 mg/mL · 10 amp (200 mg) + 150 mL SF → 250 mL", presentationId: "amp", ampoules: "10", diluentMl: "150", diluent: "SF" },
      { id: "alt", label: "1 mg/mL · 10 amp (200 mg) + 100 mL SF → 200 mL", presentationId: "amp", ampoules: "10", diluentMl: "100", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Bolus", kind: "bolus", unit: "mg/kg", defaultDose: "0,15",
        bolusNotes: ["0,15–0,2 mg/kg IV.", "Início 3–5 min; duração 45–60 min."] },
      { id: "inf", label: "Infusão contínua (SARA)", kind: "infusion", unit: "mg/kg/h", defaultDose: "0,18",
        ranges: [
          { upTo: 0.2, tone: "yellow", label: "Bloqueio contínuo na SARA", indication: "0,1–0,2 mg/kg/h" },
          { upTo: null, tone: "orange", label: "Acima da faixa usual", indication: "Monitorar TOF" },
        ],
        acurasys: { label: "Dose ACURASYS (37,5 mg/h)", doseMgH: 37.5 } },
    ],
    strategy: [
      "BNM de escolha para infusão prolongada em UTI — eliminação de Hofmann (independe de rim e fígado).",
      "Sem histaminoliberação relevante — mais seguro que atracúrio.",
      "Protocolo ACURASYS: 37,5 mg/h × 48 h na SARA grave.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "NÃO tem antídoto específico — aguardar metabolismo (Hofmann). Neostigmina com cautela para reversão parcial.",
        "Monitorar com TOF obrigatoriamente. Sempre com sedação e analgesia plenas.",
      ],
    },
    info: [
      "✅ BNM de escolha em UTI para infusão prolongada.",
      "✅ SARA grave — protocolo ACURASYS (37,5 mg/h × 48 h).",
      "✅ Eliminação de Hofmann — independe de função renal/hepática.",
      "ACURASYS (2010): benefício na SARA grave; ROSE (2019): neutro com sedação profunda equivalente. Considerar em dissincronia/drive excessivo/prona.",
    ],
    reference: "ACURASYS (NEJM 2010) / ROSE (NEJM 2019).",
  },
  {
    key: "atracurio",
    group: "bnm",
    name: "Atracúrio",
    className: "BNM adespolarizante",
    emoji: "🔴",
    displayUnit: "mg/mL",
    presentations: [
      { id: "amp", label: "Ampola 10 mg/mL · 5 mL (50 mg)", ampouleVolumeMl: 5, basePerAmpoule: 50000, concentrationLabel: "10 mg/mL" },
    ],
    standardSolutions: [
      { id: "padrao", label: "2 mg/mL · 10 amp (500 mg) + 200 mL SF → 250 mL", presentationId: "amp", ampoules: "10", diluentMl: "200", diluent: "SF" },
      { id: "menor", label: "1 mg/mL · 5 amp (250 mg) + 200 mL SF → 250 mL", presentationId: "amp", ampoules: "5", diluentMl: "200", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Bolus", kind: "bolus", unit: "mg/kg", defaultDose: "0,5",
        bolusNotes: ["0,4–0,5 mg/kg IV.", "Início 2–3 min; duração 20–35 min."] },
      { id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mg/kg/h", defaultDose: "0,4",
        ranges: [
          { upTo: 0.6, tone: "yellow", label: "Bloqueio contínuo", indication: "0,3–0,6 mg/kg/h" },
          { upTo: null, tone: "orange", label: "Acima da faixa usual", indication: "Monitorar TOF" },
        ] },
    ],
    strategy: [
      "BNM adespolarizante com eliminação de Hofmann; alternativa quando cisatracúrio indisponível.",
      "Preferir cisatracúrio na UTI (sem histaminoliberação).",
      "Refrigerar (2–8 °C); monitorar com TOF.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "Histaminoliberação dose-dependente — hipotensão, broncoespasmo, flushing (sobretudo em bolus rápido).",
        "Laudanosina acumula em IRA/IH (risco de convulsão). Sem antídoto específico. Refrigerar (perde potência em 14 dias a 25 °C).",
      ],
    },
    info: [
      "Preferir cisatracúrio na UTI (sem histaminoliberação).",
      "Sempre com sedação e analgesia plenas; monitorar TOF.",
    ],
    reference: "Miller's Anesthesia 9ª ed.",
  },
];

export const SED_GROUP_LABELS: Record<SedGroup, string> = {
  sedacao: "Sedação",
  analgesia: "Analgesia",
  bnm: "Bloqueadores neuromusculares",
};

// ─── Cálculo ─────────────────────────────────────────────────────────────────

export function sedConcentrationMcgPerMl(ampoules: number, basePerAmpoule: number, ampouleVolumeMl: number, diluentMl: number): { concMcgPerMl: number; finalVolumeMl: number; totalBaseMcg: number } | null {
  if (ampoules <= 0 || diluentMl < 0) return null;
  const finalVolumeMl = diluentMl + ampoules * ampouleVolumeMl;
  if (finalVolumeMl <= 0) return null;
  const totalBaseMcg = ampoules * basePerAmpoule;
  return { concMcgPerMl: totalBaseMcg / finalVolumeMl, finalVolumeMl, totalBaseMcg };
}

/** Infusão: taxa em mL/h a partir da dose. concMcgPerMl é a concentração da solução diluída. */
export function sedRateFromDose(unit: InfusionUnit, dose: number, weightKg: number, concMcgPerMl: number): number | null {
  if (dose <= 0 || concMcgPerMl <= 0) return null;
  const concMgPerMl = concMcgPerMl / 1000;
  switch (unit) {
    case "mcg/kg/min":
      if (weightKg <= 0) return null;
      return (dose * weightKg * 60) / concMcgPerMl;
    case "mcg/kg/h":
      if (weightKg <= 0) return null;
      return (dose * weightKg) / concMcgPerMl;
    case "mg/kg/h":
      if (weightKg <= 0) return null;
      return (dose * weightKg) / concMgPerMl;
    case "mg/h":
      return dose / concMgPerMl;
    case "mcg/h":
      return dose / concMcgPerMl;
  }
}

/** Bolus: dose total + volume a administrar, a partir da AMPOLA PURA. */
export function sedBolus(unit: BolusUnit, dose: number, weightKg: number, pureConcMcgPerMl: number): { totalMcg: number; totalMg: number; volumeMl: number } | null {
  if (dose <= 0 || weightKg <= 0 || pureConcMcgPerMl <= 0) return null;
  const totalBase = unit === "mg/kg" ? dose * weightKg * 1000 : dose * weightKg; // mcg
  const volumeMl = totalBase / pureConcMcgPerMl;
  return { totalMcg: totalBase, totalMg: totalBase / 1000, volumeMl };
}

// ─── ClinicalEngine stub (para registro/roteamento no hub) ───────────────────

const PROTOCOL_ID = "sedoanalgesia";
const STATIC_STATE: ProtocolState = { type: "action", text: "Sedoanalgesia & BNM" };

function consumeEffects(): EngineEffect[] { return []; }
function getClinicalLog(): ClinicalLogEntry[] { return []; }
function getCurrentState(): ProtocolState { return STATIC_STATE; }
function getCurrentStateId(): string { return "sedoanalgesia_inicio"; }
function getDocumentationActions(): DocumentationAction[] { return []; }
function getEncounterReportHtml(): string { return ""; }
function getEncounterSummary(): EncounterSummary {
  return {
    protocolId: PROTOCOL_ID,
    durationLabel: "Calculadora",
    currentStateId: "sedoanalgesia_inicio",
    currentStateText: "Sedoanalgesia & BNM",
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
  };
}
function getEncounterSummaryText(): string { return "Calculadora de sedoanalgesia, analgesia e BNM."; }
function getReversibleCauses(): ReversibleCause[] { return []; }
function getTimers(): TimerState[] { return []; }
function next(): ProtocolState { return STATIC_STATE; }
function registerExecution(): ClinicalLogEntry[] { return []; }
function resetSession(): ProtocolState { return STATIC_STATE; }
function tick(): ProtocolState { return STATIC_STATE; }
function updateReversibleCauseStatus(): ReversibleCause[] { return []; }

export {
  consumeEffects,
  getClinicalLog,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getReversibleCauses,
  getTimers,
  next,
  registerExecution,
  resetSession,
  tick,
  updateReversibleCauseStatus,
};

export type { ClinicalEngine };
