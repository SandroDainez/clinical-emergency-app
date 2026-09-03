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

import {
  ANTIDOTO_NAO_CRUZA_DE_CLASSE,
  FLUMAZENIL_APRESENTACAO,
  FLUMAZENIL_NAO_USAR,
  FLUMAZENIL_RESSEDACAO,
  NALOXONA_PROCEDENCIA_DECIDE,
  NALOXONA_TITULADA_IATROGENICA,
  NALOXONA_VIGILANCIA_APOS_REVERSAO,
} from "./poisoning-decision-tree";
import { FORA_DE_ESCOPO_PEDIATRICO } from "./lib/escopo-pediatrico";
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
  /**
   * De onde veio esta apresentação — bula ou registro. OBRIGATÓRIO (R-5).
   *
   * O mesmo campo existe em vasoactive-engine, e por lá nasceu do mesmo
   * defeito: a dopamina entrou com a ampola norte-americana (40 mg/mL) num app
   * brasileiro, fator 8, e nada denunciou porque tudo o mais era coerente.
   *
   * Aqui as 11 apresentações conferem com o mercado brasileiro — verificado
   * uma a uma —, e o campo existe para que a próxima não entre copiada de
   * referência estrangeira. `npm run test:sedacao` recusa o build sem ele.
   */
  fonte: string;
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
      { id: "amp50", label: "Ampola 10 mg/mL · 50 mL", ampouleVolumeMl: 50, basePerAmpoule: 500000, concentrationLabel: "10 mg/mL (500 mg/50 mL)",
        fonte: "Propofol 1% (10 mg/mL) — emulsão injetável, Fresenius Kabi / B. Braun; bula ANVISA. ⚠️ EXISTE TAMBÉM propofol 2% (20 mg/mL, Fresenius Kabi): o dobro da concentração. Este app assume o 1% — confira o rótulo (R-6)." },
      { id: "frasco20", label: "Frasco 10 mg/mL · 20 mL", ampouleVolumeMl: 20, basePerAmpoule: 200000, concentrationLabel: "10 mg/mL (200 mg/20 mL)",
        fonte: "Propofol 1% (10 mg/mL), frasco/ampola 20 mL — bula ANVISA. Mesma ressalva do 2%." },
    ],
    standardSolutions: [
      // Os rótulos diziam só "Puro · 1 amp 50 mL → 50 mL": sem a concentração,
      // que TODA outra solução do módulo anuncia (o fentanil puro já dizia
      // "Puro 50 mcg/mL"). Quem lê a bolsa precisa ver o que vai nela sem ter
      // de saber de cor a apresentação do propofol.
      { id: "puro50", label: "Puro 10 mg/mL · 1 amp (500 mg) → 50 mL", presentationId: "amp50", ampoules: "1", diluentMl: "0", diluent: "SG" },
      { id: "puro100", label: "Puro 10 mg/mL · 2 amp (1.000 mg) → 100 mL", presentationId: "amp50", ampoules: "2", diluentMl: "0", diluent: "SG" },
    ],
    modes: [
      // ── #5: A REGRA É UMA, E VALE PARA TODOS OS QUE INDUZEM ─────────────
      //
      // A cetamina tinha "Indução / bolus" e o propofol não tinha bólus nenhum
      // — a pior das três opções, porque o módulo tratava dois indutores de
      // formas diferentes sem dizer por quê.
      //
      // A escolha foi DECLARAR indução para todos, e não para nenhum, por três
      // razões: (1) o módulo já calculava bólus para 5 das 9 drogas, incluindo
      // o "Bolus — ISR / intubação" do rocurônio, que é dose de ISR calculada
      // aqui; (2) tirar isso removeria o que a calculadora faz de mais útil à
      // beira do leito — converter kg em mg; (3) a divisão que funciona é o ISR
      // decidindo QUAL agente e QUANDO, e este módulo calculando QUANTO.
      //
      // Os números vêm de lib/doses-isr.ts (fonte única, R-12) e test:sedacao
      // recusa o build se divergirem.
      {
        id: "bolus", label: "Indução / bolus", kind: "bolus", unit: "mg/kg", defaultDose: "1,5",
        bolusNotes: [
          "Indução (estável): 1,5–2 mg/kg IV — início 15–45 s.",
          "Idoso ou reserva limitada: 1 mg/kg.",
          "ISR no INSTÁVEL: EVITAR — hipotensão dose-dependente. Preferir cetamina 1 mg/kg (0,5 no choque grave) ou etomidato 0,3 mg/kg.",
        ],
      },
      {
        id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mcg/kg/min", defaultDose: "30",
        ranges: [
          { upTo: 20, tone: "green", label: "Sedação leve (RASS −1/−2)", indication: "Desmame de VM, procedimentos" },
          { upTo: 50, tone: "yellow", label: "Faixa usual de manutenção em UTI", indication: "5–50 mcg/kg/min, titulada à resposta" },
          { upTo: 66.7, tone: "orange", label: "Acima da faixa usual — ainda até 4 mg/kg/h", indication: "50–66,7 mcg/kg/min: intensificar vigilância hemodinâmica e reavaliar a menor dose eficaz" },
          { upTo: null, tone: "red", label: "Acima do limite recomendado em bula para sedação em UTI", indication: "> 66,7 mcg/kg/min (> 4 mg/kg/h): usar apenas se o benefício superar o risco e reavaliar continuamente" },
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
        "Síndrome de infusão do propofol é associada sobretudo a dose alta e exposição prolongada; a bula brasileira limita sedação em UTI a 4 mg/kg/h (≈ 66,7 mcg/kg/min), salvo benefício > risco. Em uso prolongado/alta dose, monitorar triglicerídeos, CPK e pH/lactato.",
        "Usar com cautela em crianças < 16 anos.",
      ],
    },
    info: [
      "Emulsão lipídica: 1 mL = ~1,1 kcal — descontar do suporte nutricional.",
      "Alergia alimentar a ovo ou soja, isoladamente, não exige evitar propofol; história de reação ao próprio propofol/formulação deve ser tratada como hipersensibilidade medicamentosa.",
      "pH ácido — dor na injeção (lidocaína prévia reduz).",
      "Meia-vida contexto-sensível curta — acorda rápido após suspensão.",
    ],
    reference: "SCCM PADIS 2018 + Focused Update 2025 · AAAAI Drug Hypersensitivity Guidance / propofol e alergia alimentar, revisão 2024.",
  },
  {
    key: "midazolam",
    group: "sedacao",
    name: "Midazolam",
    className: "Benzodiazepínico",
    emoji: "🟣",
    displayUnit: "mg/mL",
    presentations: [
      { id: "amp", label: "Ampola 5 mg/mL · 10 mL (50 mg)", ampouleVolumeMl: 10, basePerAmpoule: 50000, concentrationLabel: "5 mg/mL",
        fonte: "Midazolam 5 mg/mL, ampola 10 mL — Dormonid (Roche), Dormire (Cristália), Dormium (União Química); bula ANVISA. ⚠️ EXISTE TAMBÉM midazolam 1 mg/mL em ampola de 5 mL: CINCO vezes menos concentrado. Este app assume o 5 mg/mL — confira o rótulo (R-6)." },
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
          { upTo: 0.1, tone: "yellow", label: "Faixa usual de manutenção em bula", indication: "0,02–0,10 mg/kg/h, titulada ao alvo de sedação" },
          { upTo: 0.2, tone: "orange", label: "Acima da faixa usual — sedação profunda", indication: "0,10–0,20 mg/kg/h: doses maiores podem ocasionalmente ser necessárias, com maior risco de acúmulo e despertar tardio" },
          // ── DOIS EIXOS, e o vermelho é só do primeiro ────────────────────
          //
          // O teto de 0,20 existe para DESENCORAJAR sedação profunda
          // desnecessária — e essa razão não se aplica quando a supressão é o
          // objetivo. Sedação em UTI é titulada por RASS com meta de paciente
          // acordado; midazolam no status refratário é anestesia terapêutica,
          // com IOT e EEG contínuo, mirando supressão da atividade elétrica.
          //
          // O módulo de Convulsões manda 0,05–2 mg/kg/h — DEZ VEZES este teto —
          // e está certo. Sem declarar os dois eixos, o app marcaria de vermelho
          // a dose correta do status.
          { upTo: null, tone: "red", label: "Dose muito alta para sedação titulada por RASS", indication: "> 0,20 mg/kg/h — não é um teto farmacológico universal; reavaliar indicação e acúmulo. NÃO se aplica ao STATUS EPILÉPTICO REFRATÁRIO, que é outro objetivo: 0,05–2 mg/kg/h titulado por EEG, com IOT e meta de supressão da atividade elétrica." },
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
      FLUMAZENIL_APRESENTACAO,
      FLUMAZENIL_NAO_USAR,
      FLUMAZENIL_RESSEDACAO,
      ANTIDOTO_NAO_CRUZA_DE_CLASSE,
      "Bula: manutenção usual 0,02–0,10 mg/kg/h; doses maiores podem ocasionalmente ser necessárias e devem ser tituladas individualmente. Bolus de sedação: 0,01–0,05 mg/kg.",
    ],
    reference: "SCCM PADIS 2018 + Focused Update 2025 · MIDEX/PRODEX (JAMA 2012).",
  },
  {
    key: "cetamina",
    group: "sedacao",
    name: "Cetamina",
    className: "Anestésico dissociativo",
    emoji: "🟦",
    displayUnit: "mg/mL",
    presentations: [
      { id: "frasco", label: "Frasco 50 mg/mL · 10 mL (500 mg)", ampouleVolumeMl: 10, basePerAmpoule: 500000, concentrationLabel: "50 mg/mL",
        fonte: "Cetamina 50 mg/mL, frasco-ampola 10 mL (Ketamin — Cristália) — bula ANVISA." },
    ],
    standardSolutions: [
      { id: "padrao", label: "2 mg/mL · 1 amp (500 mg) + 240 mL SF → 250 mL", presentationId: "frasco", ampoules: "1", diluentMl: "240", diluent: "SF" },
      { id: "concentrado", label: "4 mg/mL · 2 amp (1.000 mg) + 230 mL SF → 250 mL", presentationId: "frasco", ampoules: "2", diluentMl: "230", diluent: "SF" },
    ],
    modes: [
      // A nota antiga dizia "ISR (paciente instável): 1,5–2 mg/kg" — a faixa
      // CHEIA de indução, rotulada como a do instável. O módulo de ISR, para o
      // MESMO paciente, manda 1 mg/kg (0,5 no choque grave). Um mandava reduzir,
      // o outro mandava dose plena, a um clique de distância. Os números agora
      // seguem lib/doses-isr.ts (fonte única, R-12) e `npm run test:isr` recusa
      // o build se divergirem.
      { id: "bolus", label: "Indução / bolus", kind: "bolus", unit: "mg/kg", defaultDose: "1,5",
        bolusNotes: ["Indução (estável): 1,5 mg/kg IV em 60 s (até 2 mg/kg no broncoespasmo).", "ISR no INSTÁVEL: reduzir para 1 mg/kg (0,5 mg/kg no choque grave) e MANTER a dose do bloqueador — dose plena de indutor no chocado é hipotensão pós-intubação.", "Início ~30–60 s; duração 10–20 min."] },
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
        "TCE/PIC: a preocupação histórica de aumento da pressão intracraniana não é sustentada de forma consistente pela evidência contemporânea; manter ventilação, oxigenação e hemodinâmica adequadas e monitorar conforme a gravidade neurológica.",
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
      { id: "amp", label: "Ampola 100 mcg/mL · 2 mL (200 mcg)", ampouleVolumeMl: 2, basePerAmpoule: 200, concentrationLabel: "100 mcg/mL",
        fonte: "Dexmedetomidina 100 mcg/mL, ampola 2 mL (Precedex; genéricos Eurofarma, Cristália) — bula ANVISA. ⚠️ EXISTE TAMBÉM apresentação PRONTA PARA USO a 4 mcg/mL em bolsa/frasco (DEX Bolsa — Cristália; Hospira 100 mL): 25 vezes menos concentrada, e não se dilui. Este app assume o concentrado de 100 mcg/mL (R-6)." },
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
          { upTo: 0.7, tone: "yellow", label: "Manutenção recomendada em bula brasileira", indication: "0,2–0,7 mcg/kg/h, titulada ao efeito clínico" },
          { upTo: 1.4, tone: "orange", label: "Acima da posologia recomendada — faixa estudada", indication: "0,7–1,4 mcg/kg/h: doses até 1,4 foram estudadas, mas ultrapassam a manutenção recomendada na bula; exigir justificativa/protocolo e vigilância de FC/PA" },
          { upTo: null, tone: "red", label: "Acima da faixa revisada", indication: "> 1,4 mcg/kg/h: reavaliar indicação e fonte antes de prosseguir" },
        ],
      },
    ],
    strategy: [
      "Agonista α-2: sedação com analgesia preservando o drive respiratório — paciente comunicativo (RASS 0/−1).",
      "Preferir quando sedação leve e/ou redução de delirium são prioridades; útil quando agitação dificulta desmame/extubação.",
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
    reference: "SCCM PADIS 2018 + Focused Update 2025 · MENDS2 (NEJM 2021).",
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
      { id: "amp2", label: "Ampola 50 mcg/mL · 2 mL (100 mcg)", ampouleVolumeMl: 2, basePerAmpoule: 100, concentrationLabel: "50 mcg/mL",
        fonte: "Citrato de fentanila 50 mcg/mL, ampola 2 mL (Fentanest — Cristália; genéricos Hipolabor, União Química) — bula ANVISA." },
      { id: "amp10", label: "Ampola 50 mcg/mL · 10 mL (500 mcg)", ampouleVolumeMl: 10, basePerAmpoule: 500, concentrationLabel: "50 mcg/mL",
        fonte: "Citrato de fentanila 50 mcg/mL, ampola 10 mL — bula ANVISA." },
    ],
    standardSolutions: [
      { id: "puro20", label: "Puro 50 mcg/mL → 20 mL (1.000 mcg)", presentationId: "amp10", ampoules: "2", diluentMl: "0", diluent: "SF" },
      { id: "puro50", label: "Puro 50 mcg/mL → 50 mL (2.500 mcg)", presentationId: "amp10", ampoules: "5", diluentMl: "0", diluent: "SF" },
      { id: "diluido", label: "10 mcg/mL · 5 amp (500 mcg) + 40 mL SF → 50 mL", presentationId: "amp2", ampoules: "5", diluentMl: "40", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Bolus", kind: "bolus", unit: "mcg/kg", defaultDose: "1",
        // O pré-tratamento dizia 2–3 mcg/kg aqui e 1–3 no módulo de ISR — mesma
        // indicação, faixas diferentes. Unificado em 1–3 (o clássico do Walls é
        // 3; a faixa cobre a titulação no limítrofe), vigiado por test:isr.
        bolusNotes: ["Analgesia: 1–2 mcg/kg IV lento (2–3 min).", "Pré-intubação (atenuar resposta): 1–3 mcg/kg.", "Co-indutor ISR: 2–3 mcg/kg."] },
      { id: "inf", label: "Infusão contínua", kind: "infusion", unit: "mcg/h", defaultDose: "75",
        ranges: [
          { upTo: 50, tone: "green", label: "Analgesia leve", indication: "25–50 mcg/h — procedimentos, pós-op simples" },
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
      // Contexto IATROGÊNICO: o opioide é este, a dose é conhecida e o paciente
      // está monitorizado. Dose de superdose aqui reverte tudo de uma vez.
      NALOXONA_PROCEDENCIA_DECIDE,
      NALOXONA_TITULADA_IATROGENICA,
      NALOXONA_VIGILANCIA_APOS_REVERSAO,
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
      { id: "amp", label: "Ampola 10 mg/mL · 1 mL (10 mg)", ampouleVolumeMl: 1, basePerAmpoule: 10000, concentrationLabel: "10 mg/mL",
        fonte: "Sulfato de morfina 10 mg/mL, ampola 1 mL (Dimorf — Cristália; genérico Hipolabor) — bula ANVISA. Existe também 1 mg/mL (IV já diluída) — mesma via, concentração menor." },
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
      "Opioide para analgesia moderada a intensa. No edema agudo de pulmão/insuficiência cardíaca aguda, NÃO usar de rotina; considerar apenas dor ou ansiedade graves/intratáveis quando outras medidas não forem suficientes.",
      "Evitar em insuficiência renal (acúmulo de M6G) — preferir fentanil.",
      "Histaminoliberação: pode causar hipotensão e broncoespasmo.",
    ],
    /**
     * ── POR QUE 0,1 E 0,2 mg/mL NÃO ESTÃO NA LISTA DE APRESENTAÇÕES ──────────
     *
     * Elas existem no Brasil (Dimorf 0,1 e 0,2 mg/mL) e são de via PERIDURAL /
     * INTRATECAL — sem conservantes, formuladas para o neuroeixo.
     *
     * Declará-las como opção SELECIONÁVEL num módulo que calcula infusão IV
     * seria pior que omiti-las: convidaria ao erro dos dois lados. 10 mg/mL por
     * via intratecal é catastrófico; 0,2 mg/mL por via IV é subdose de 50×.
     *
     * O R-6 diz que uma tela que oferece uma opção está AFIRMANDO. Aqui a regra
     * vale ao contrário: oferecer a ampola peridural entre as opções de infusão
     * IV afirmaria que ela serve para isso. Então ela entra NOMEADA, com a via
     * explícita e o veto — como aviso, nunca como escolha.
     */
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "⚠️ VIA — Dimorf 0,1 e 0,2 mg/mL são apresentações PERIDURAL/INTRATECAL, sem conservantes. NÃO usar para as doses IV deste módulo: 0,2 mg/mL por via IV é subdose de 50×, e a ampola de 10 mg/mL por via intratecal é catastrófica. Conferir a via impressa na ampola antes de aspirar.",
        "Metabólito ativo (M6G) acumula em IRA — preferir fentanil.",
        "Histaminoliberação — hipotensão/broncoespasmo.",
        NALOXONA_PROCEDENCIA_DECIDE,
        NALOXONA_TITULADA_IATROGENICA,
        NALOXONA_VIGILANCIA_APOS_REVERSAO,
      ],
    },
    info: [
      "Início de ação mais lento que o fentanil.",
      "Bolus de 2–4 mg costuma ser titulado pela dor e nível de consciência.",
    ],
    reference: "SCCM PADIS 2018 · ESC Heart Failure Guidelines 2021/ACVC scientific statement sobre opioides na insuficiência cardíaca aguda.",
  },

  // ═══ GRUPO 3 — BNM ═══
  {
    key: "etomidato",
    group: "sedacao",
    name: "Etomidato",
    className: "Hipnótico não-barbitúrico (agonista GABA-A)",
    emoji: "🟣",
    displayUnit: "mg/mL",
    // Ausência apontada pelo D-4b: os dois agentes mais específicos da ISR não
    // existiam neste módulo, e é dele que o ISR depende para calcular mg.
    presentations: [
      { id: "amp", label: "Ampola 2 mg/mL · 10 mL (20 mg)", ampouleVolumeMl: 10, basePerAmpoule: 20000, concentrationLabel: "2 mg/mL",
        fonte: "Etomidato 2 mg/mL, ampola 10 mL — referência Hypnomidate; genéricos Blau e Cristália. Bula ANVISA." },
    ],
    standardSolutions: [
      { id: "puro", label: "Puro 2 mg/mL · 1 amp (20 mg) → 10 mL", presentationId: "amp", ampoules: "1", diluentMl: "0", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Indução / bolus", kind: "bolus", unit: "mg/kg", defaultDose: "0,3",
        bolusNotes: [
          "Indução: 0,3 mg/kg IV — início 15–45 s, duração 5–10 min.",
          "Dose PLENA também no instável: é o indutor hemodinamicamente neutro, e reduzi-lo perde justamente a vantagem.",
          "NÃO tem modo de infusão: uso em bólus único. Infusão contínua causa supressão adrenal sustentada.",
        ],
      },
    ],
    strategy: [
      "Hipnótico de ação curta, hemodinamicamente NEUTRO — indutor de escolha quando a pressão não tolera propofol.",
      "Não tem efeito analgésico: associar opioide.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "Supressão adrenal transitória após dose única (relevância clínica debatida no choque séptico) — NUNCA em infusão contínua.",
        "Mioclonias em até 1/3 dos pacientes; podem ser confundidas com convulsão.",
        "Sem analgesia: bólus isolado deixa o paciente hipnótico e com dor.",
      ],
    },
    info: [
      "✅ ISR no paciente hipotenso ou com reserva cardíaca limitada.",
      "✅ Procedimento curto (< 10 min).",
      "Dose máxima usual: não exceder ~3 ampolas (30 mL) no adulto.",
    ],
    reference: "Bula Hypnomidate/ANVISA · The Walls Manual of Emergency Airway Management, 6ª ed. 2023.",
  },
  {
    key: "succinilcolina",
    group: "bnm",
    name: "Succinilcolina",
    className: "BNM despolarizante",
    emoji: "⚡",
    displayUnit: "mg/mL",
    presentations: [
      // Pó liofilizado: a concentração DEPENDE de quanto se reconstitui. O app
      // assume 10 mL (10 mg/mL), que é a reconstituição usual — e diz isso,
      // porque assumir em silêncio é o que o R-6 proíbe.
      { id: "fa", label: "Frasco-ampola 100 mg (pó) → 10 mL = 10 mg/mL", ampouleVolumeMl: 10, basePerAmpoule: 100000, concentrationLabel: "10 mg/mL (reconstituído em 10 mL)",
        fonte: "Cloreto de suxametônio 100 mg, pó para solução injetável, frasco-ampola (Succinil Colin — União Química, registro ANVISA 1.0497.0206.003-6). É PÓ: a concentração depende do volume de reconstituição; este app assume 10 mL → 10 mg/mL." },
    ],
    standardSolutions: [
      { id: "recon10", label: "10 mg/mL · 1 fr (100 mg) + 10 mL → 10 mL", presentationId: "fa", ampoules: "1", diluentMl: "0", diluent: "SF" },
    ],
    modes: [
      { id: "bolus", label: "Bolus — ISR / intubação", kind: "bolus", unit: "mg/kg", defaultDose: "1,5",
        bolusNotes: [
          "ISR: 1–1,5 mg/kg IV em bólus ultrarrápido (2 mg/kg em obeso). TETO 200 mg.",
          "Início 45–60 s; duração ultracurta 8–12 min. SEM antídoto.",
          "Aguardar as fasciculações cessarem antes da laringoscopia.",
        ],
      },
    ],
    strategy: [
      "BNM despolarizante de início mais rápido e duração mais curta — o padrão histórico da ISR.",
      "A duração curta NÃO é resgate confiável no paciente crítico: a dessaturação costuma chegar antes do retorno da ventilação espontânea adequada.",
    ],
    alert: {
      icon: "🚨", tone: "danger",
      lines: [
        "CONTRAINDICAÇÕES ABSOLUTAS (usar rocurônio): hipercalemia (K⁺ > 5,5) ou risco; queimadura grave > 24 h até 1 ano; imobilização prolongada > 48–72 h (TCE, AVC, lesão medular); rabdomiólise/esmagamento; distrofias musculares (Duchenne/Becker); miotonia; hipertermia maligna pessoal ou familiar; pseudocolinesterase atípica OU inibição adquirida da colinesterase (organofosforado); trauma ocular aberto.",
        "NUNCA bloquear sem garantir sedação e analgesia adequadas — o paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar. Monitorar TOF quando houver.",
        FORA_DE_ESCOPO_PEDIATRICO,
      ],
    },
    info: [
      "✅ ISR quando não há contraindicação — inclusive na anafilaxia/angioedema de via aérea (ver lib/doses-isr.ts).",
      "SEM antídoto: a única saída é o tempo. Por isso o plano de resgate precisa estar pronto ANTES do bólus.",
    ],
    reference: "Bula Succinil Colin/ANVISA · The Walls Manual of Emergency Airway Management, 6ª ed. 2023.",
  },
  {
    key: "rocuronio",
    group: "bnm",
    name: "Rocurônio",
    className: "BNM adespolarizante",
    emoji: "🔴",
    displayUnit: "mg/mL",
    magnesiumInteraction: true,
    presentations: [
      { id: "amp", label: "Ampola 10 mg/mL · 5 mL (50 mg)", ampouleVolumeMl: 5, basePerAmpoule: 50000, concentrationLabel: "10 mg/mL",
        fonte: "Brometo de rocurônio 10 mg/mL, ampola 5 mL (Esmeron — MSD; genéricos Cristália, Blau) — bula ANVISA." },
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
        // Este aviso estava em `info`, enquanto no cisatracúrio e no atracúrio
        // vivia em `alert`. Mesmo risco, mesma classe, pesos visuais
        // diferentes — e o de MENOR peso era justamente o do rocurônio, que é
        // o mais dado em bólus por quem está com pressa. Ver R-16.
        "NUNCA bloquear sem garantir sedação e analgesia adequadas — o paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar. Monitorar TOF.",
        "ANTÍDOTO SUGAMADEX — CICO/emergência: 16 mg/kg IV (70 kg = 1.120 mg); profunda: 4 mg/kg; moderada (T2): 2 mg/kg. Reversão < 3 min.",
        "Manter sugamadex à beira leito SEMPRE que rocurônio em uso.",
        "MgSO₄ potencializa — reduzir dose 30–50% (ex.: eclâmpsia). Monitorar TOF.",
      ],
    },
    info: [
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
      { id: "amp", label: "Ampola 2 mg/mL · 10 mL (20 mg)", ampouleVolumeMl: 10, basePerAmpoule: 20000, concentrationLabel: "2 mg/mL",
        fonte: "Besilato de cisatracúrio 2 mg/mL, ampola 5 ou 10 mL (CIS — Cristália; Cisauni — União Química) — bula ANVISA. A apresentação de 5 mg/mL em frasco de 30 mL (Nimbex Forte) tem documento na ANVISA por fabricante espanhol, mas NÃO se confirmou comercialização no Brasil; o que circula aqui é 2 mg/mL." },
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
          // ── DOIS REGIMES DISTINTOS, não uma faixa só ────────────────────
          //
          // 0,1–0,2 mg/kg/h é infusão TITULADA POR TOF. O ACURASYS usou 37,5
          // mg/h de DOSE FIXA, sem titulação, por 48 h — em 70 kg isso é
          // ~0,54 mg/kg/h, quase três vezes o topo desta faixa. O módulo
          // apresentava os dois como se fossem a mesma coisa, e a contradição
          // de 2,7× ficava para o leitor resolver.
          { upTo: 0.2, tone: "yellow", label: "Bloqueio contínuo titulado por TOF", indication: "0,1–0,2 mg/kg/h — o regime usual da UTI" },
          { upTo: null, tone: "orange", label: "Acima da faixa titulada — só no protocolo de dose fixa", indication: "O ACURASYS usa 37,5 mg/h FIXO (~0,54 mg/kg/h em 70 kg), sem titulação, 48 h. É protocolo específico com EVIDÊNCIA CONFLITANTE, não alternativa equivalente — ver o alerta. Fora dele, monitorar TOF." },
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
      "REGIME DE DOSE FIXA (ACURASYS, NEJM 2010): cisatracúrio 37,5 mg/h × 48 h, SEM titulação por TOF, na SDRA grave precoce (P/F < 150). É um protocolo específico — não a mesma coisa que a infusão titulada de 0,1–0,2 mg/kg/h.",
      "✅ Eliminação de Hofmann — independe de função renal/hepática.",
      "⚠️ EVIDÊNCIA CONFLITANTE — o ROSE (NEJM 2019, 1.006 pacientes, PETAL Network) reavaliou o ACURASYS com protocolos modernos: bloqueio precoce + sedação PROFUNDA contra cuidado usual SEM bloqueio de rotina e com sedação LEVE. Foi interrompido por futilidade; mortalidade em 90 dias igual (43%), com MAIS fraqueza adquirida na UTI e mais eventos cardiovasculares graves no braço bloqueado. O uso ROTINEIRO de BNM na SDRA deixou de ser recomendação forte — o regime de dose fixa é opção em situação selecionada (dissincronia grave, drive excessivo, prona), não conduta corrente.",
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
      { id: "amp", label: "Ampola 10 mg/mL · 5 mL (50 mg)", ampouleVolumeMl: 5, basePerAmpoule: 50000, concentrationLabel: "10 mg/mL",
        fonte: "Besilato de atracúrio 10 mg/mL, ampola 5 mL (Tracrium; genéricos Cristália, União Química) — bula ANVISA. Refrigerar." },
    ],
    standardSolutions: [
      { id: "padrao", label: "2 mg/mL · 10 amp (500 mg) + 200 mL SF → 250 mL", presentationId: "amp", ampoules: "10", diluentMl: "200", diluent: "SF" },
      // Era "5 amp + 200 mL → 250 mL": 5 × 5 mL + 200 = 225 mL, não 250, e a
      // concentração real dava 1,11 mg/mL, não 1. Única das 20 soluções do
      // módulo cuja aritmética não fechava.
      { id: "menor", label: "1 mg/mL · 5 amp (250 mg) + 225 mL SF → 250 mL", presentationId: "amp", ampoules: "5", diluentMl: "225", diluent: "SF" },
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
        // Terceiro caso da mesma assimetria (R-16): o aviso vivia em `info`
        // aqui também. A varredura só o encontrou comparando os três BNM lado a
        // lado — lendo o atracúrio sozinho, o aviso estava lá e parecia bastar.
        "NUNCA bloquear sem garantir sedação e analgesia adequadas — o paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar. Monitorar TOF.",
      ],
    },
    info: [
      "Preferir cisatracúrio na UTI (sem histaminoliberação).",
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

/**
 * Limites da BARRA de dose de um modo.
 *
 * A tela tinha caixa de digitação; o padrão do app é barra. Aqui os limites são
 * DERIVADOS do que o próprio módulo já declara, e não escritos à mão modo a
 * modo — são mais de vinte modos, e vinte pares de números copiados é onde um
 * dia entra um errado sem ninguém notar.
 *
 * A derivação tem uma armadilha conhecida: neste app, barra que herda limites
 * de valores curados já produziu faixa apertada demais para registrar o
 * paciente real. Por isso a regra NÃO é "o maior valor declarado" — é o maior
 * valor declarado MAIS FOLGA, e a folga existe justamente para a barra alcançar
 * o que a diretriz descreve como excepcional.
 *
 * `ranges` (infusão) já cobre o espectro de uso em faixas de gravidade: a última
 * faixa numerada é o limite alto conhecido, e a barra vai a 1,5× dele. Para
 * bolus, que não tem faixas, o ponto de referência é a dose padrão, e a barra
 * vai a 4× — bolus de indução varia muito com hemodinâmica e com o fármaco.
 *
 * Os limites dizem o que a barra ALCANÇA, não o que é seguro. Quem julga a dose
 * são as faixas coloridas e os avisos, que continuam aparecendo.
 */
export function faixaDaBarra(mode: SedMode): { min: number; max: number; passo: number } {
  const padrao = Number(String(mode.defaultDose).replace(",", ".")) || 1;

  const declarados = (mode.ranges ?? [])
    .map((r) => r.upTo)
    .filter((n): n is number => typeof n === "number");

  const teto = declarados.length ? Math.max(...declarados) * 1.5 : padrao * 4;

  // O passo acompanha a ordem de grandeza: dose de 0,05 mg/kg/h precisa de
  // 0,01; dose de 75 mcg/h com passo 0,01 exigiria centenas de toques.
  const passo = teto <= 1 ? 0.01 : teto <= 10 ? 0.05 : teto <= 100 ? 1 : 5;

  // O mínimo nunca é zero numa infusão em curso: zero é "desligado", e quem
  // arrasta até lá sem querer não percebe. Começa num passo.
  return { min: passo, max: Number(teto.toFixed(2)), passo };
}

/**
 * ── AGITAÇÃO: PROCURAR CAUSA ANTES DE SEDAR — FONTE ÚNICA, DONA AQUI ─────────
 *
 * Vive na Sedoanalgesia porque é aqui que a titulação acontece, contra a meta
 * (RASS −2 a 0, PADIS 2018) e contra a indicação. A calculadora do RASS CONSOME
 * esta frase.
 *
 * ── O QUE ELA CORRIGE (R-19) ─────────────────────────────────────────────────
 *
 * A tela do RASS mandava "aumentar sedação/analgesia" na agitação — indicação
 * terapêutica a partir de uma escala que só mede profundidade. Sedar sem
 * procurar causa mascara o problema que está causando a agitação, e é
 * exatamente o erro que a escala existe para prevenir.
 *
 * A ventilação assincrônica está na lista de propósito: é frequente no paciente
 * em VM e o tratamento é AJUSTAR O VENTILADOR, não aumentar o sedativo.
 */
export const RASS_AGITACAO_PROCURAR_CAUSA =
  "Agitação manda procurar CAUSA antes de sedar. Dor não tratada, delirium, hipóxia, hipoglicemia, retenção urinária, abstinência (álcool, benzodiazepínico, opioide, nicotina), tubo mal posicionado e VENTILAÇÃO ASSINCRÔNICA produzem agitação — e a assincronia se trata ajustando o ventilador, não subindo o sedativo. Sedar sem procurar mascara o problema que está causando a agitação, que é exatamente o erro que esta escala existe para prevenir. Analgesia primeiro. Abrir o módulo Sedoanalgesia, que titula contra a meta e a indicação.";

/** Faixas do RASS mais profundas que a meta padrão — descrevem, não mandam ajustar. */
export const SEDACAO_ABAIXO_DA_META =
  "Mais profundo que a meta padrão de sedação leve (RASS −2 a 0, PADIS 2018). Existem indicações legítimas para descer — bloqueio neuromuscular, hipertensão intracraniana, SDRA grave, procedimento — e nesses casos a profundidade é o objetivo, não um desvio. Fora delas, sedação profunda associa-se a mais dias de ventilação, mais delirium e síndrome pós-terapia intensiva. Abrir o módulo Sedoanalgesia, que titula contra a meta e a indicação declarada.";

/** RASS −5: a escala não distingue sedação de bloqueio de lesão. */
export const RASS_NAO_DESPERTA =
  "Não desperta a estímulo físico. Pode ser sedação profunda, bloqueio neuromuscular em curso ou lesão neurológica — a escala não distingue os três. Sob bloqueio, RASS −5 é o alvo correto e não indica excesso de sedativo. Abrir o módulo Sedoanalgesia.";
