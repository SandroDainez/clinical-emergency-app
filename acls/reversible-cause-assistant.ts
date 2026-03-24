import { aclsProtocol } from "./protocol-runtime";
import type { AclsOperationalMetrics, AclsTimelineEvent } from "./domain";
import type { EncounterSummary, ReversibleCause } from "../clinical-engine";

type ReversibleCauseId =
  | "hipovolemia"
  | "hipoxia"
  | "acidose"
  | "hipo_hipercalemia"
  | "hipotermia"
  | "pneumotorax_hipertensivo"
  | "tamponamento_cardiaco"
  | "toxinas"
  | "trombose_pulmonar"
  | "trombose_coronaria";

type ReversibleCauseSuspectedLevel = "low" | "medium" | "high";
type ReversibleCauseAssistantConfidence = "low" | "moderate";

type ReversibleCauseAssessment = {
  causeId: ReversibleCauseId;
  label: string;
  suspectedLevel: ReversibleCauseSuspectedLevel;
  supportingEvidence: string[];
  counterEvidence: string[];
  missingData: string[];
  suggestedChecks: string[];
  compatibleActions: string[];
  confidence: ReversibleCauseAssistantConfidence;
  explanation: string;
  score: number;
};

type ReversibleCauseAssistantInput = {
  stateId: string;
  reversibleCauses: ReversibleCause[];
  timeline: AclsTimelineEvent[];
  encounterSummary: EncounterSummary;
  operationalMetrics?: AclsOperationalMetrics;
};

type ReversibleCauseAssistantResult = {
  topThree: ReversibleCauseAssessment[];
  ranked: ReversibleCauseAssessment[];
  summary: {
    topThreeIds: ReversibleCauseId[];
    missingDataHighlights: string[];
  };
};

type ReversibleCauseFeatures = {
  currentRhythm: "shockable" | "nonshockable" | "unknown";
  cyclesCompleted: number;
  shocksDelivered: number;
  hasRepeatedShockableRhythm: boolean;
  hasPersistentNonShockableRhythm: boolean;
  hasDifficultVentilation: boolean;
  hasOxygenationCompromise: boolean;
  hasCapnographyMention: boolean;
  hasLowEtco2: boolean;
  hasHemorrhageOrVolumeLoss: boolean;
  hasPoorPerfusionContext: boolean;
  hasRenalOrMetabolicContext: boolean;
  hasHypothermiaContext: boolean;
  hasToxicExposureContext: boolean;
  hasTraumaOrPericardialContext: boolean;
  hasThoracicPressureContext: boolean;
  hasThromboembolicContext: boolean;
  hasIschemicCoronaryContext: boolean;
  manualSuspicionByCause: Partial<Record<ReversibleCauseId, boolean>>;
  addressedByCause: Partial<Record<ReversibleCauseId, boolean>>;
  improvementObservedByCause: Partial<Record<ReversibleCauseId, boolean>>;
  noImprovementObservedByCause: Partial<Record<ReversibleCauseId, boolean>>;
  actionSignalsByCause: Partial<Record<ReversibleCauseId, string[]>>;
  textualEvidenceByCause: Partial<Record<ReversibleCauseId, string[]>>;
  structuredEvidenceByCause: Partial<Record<ReversibleCauseId, string[]>>;
  availableDataPoints: Set<string>;
};

type SignalMatch = {
  label: string;
  matched: boolean;
};

type CauseRuleContext = {
  cause: ReversibleCause;
  features: ReversibleCauseFeatures;
};

type CauseMetadata = {
  supportInShockable?: boolean;
  supportInNonShockable?: boolean;
  supportAfterMultipleShocks?: boolean;
  evidenceSignals: Array<{ label: string; phrases: string[] }>;
  actionSignals: Array<{ label: string; phrases: string[] }>;
  requiredMissingData: string[];
  optionalMissingData?: string[];
  suggestedChecks: string[];
};

const HEURISTIC_WEIGHTS = {
  manual: {
    suspected: 6,
    addressed: 1,
  },
  evidence: {
    firstSignal: 2,
    additionalSignal: 1,
    cap: 4,
  },
  actions: {
    firstSignal: 1,
    additionalSignal: 0.5,
    cap: 2,
    addressedWithoutImprovementBonus: 1,
  },
  response: {
    noImprovement: 1,
    improved: -4,
  },
  context: {
    rhythmCompatible: 1,
    rhythmUnknown: 0,
    refractoryShockable: 1,
    repeatedCycles: 1,
    timelineSignal: 1,
  },
  thresholds: {
    high: 8,
    medium: 4,
  },
} as const;

const RHYTHM_STATES = {
  shockable: [
    "choque_bi_1",
    "choque_mono_1",
    "rcp_1",
    "choque_2",
    "rcp_2",
    "choque_3",
    "rcp_3",
    "avaliar_ritmo_2",
    "avaliar_ritmo_3",
  ],
  nonshockable: [
    "nao_chocavel_epinefrina",
    "nao_chocavel_ciclo",
    "avaliar_ritmo_nao_chocavel",
    "nao_chocavel_hs_ts",
  ],
} as const;

const CAUSE_METADATA: Record<ReversibleCauseId, CauseMetadata> = {
  hipovolemia: {
    supportInNonShockable: true,
    evidenceSignals: [
      { label: "Perda ou hemorragia registrada", phrases: ["hemorragia", "sangramento", "perda", "hipovolemia"] },
      { label: "Contexto de desidratação ou choque por volume", phrases: ["desidratacao", "perda volêmica", "choque distributivo", "volume"] },
    ],
    actionSignals: [
      { label: "Reposição volêmica já considerada", phrases: ["volume", "reposicao", "cristaloide"] },
      { label: "Controle de sangramento ou avaliação de perdas", phrases: ["hemorragia", "sangramento"] },
    ],
    requiredMissingData: ["perdas ou hemorragia ativa", "resposta à reposição volêmica"],
    optionalMissingData: ["história recente de desidratação"],
    suggestedChecks: ["revisar perdas ou hemorragia", "confirmar resposta à reposição volêmica"],
  },
  hipoxia: {
    supportInShockable: true,
    supportInNonShockable: true,
    evidenceSignals: [
      { label: "Problema de oxigenação registrado", phrases: ["hipoxia", "dessaturacao", "baixa saturacao", "saturacao baixa"] },
      { label: "Problema ventilatório ou de via aérea registrado", phrases: ["ventilacao", "via aerea", "intubacao dificil", "bvm", "capnografia"] },
      { label: "Assimetria ou dificuldade ventilatória observada", phrases: ["dificuldade ventilatoria", "expansibilidade reduzida", "assimetria ventilatoria"] },
    ],
    actionSignals: [
      { label: "Ventilação já foi revista", phrases: ["ventilacao", "bolsa-valvula-mascara", "bvm", "oxigenio"] },
      { label: "Via aérea ou capnografia já foram abordadas", phrases: ["via aerea", "capnografia", "etco2"] },
    ],
    requiredMissingData: ["confirmação de via aérea eficaz", "capnografia ou ETCO2", "expansibilidade torácica"],
    optionalMissingData: ["saturação documentada"],
    suggestedChecks: ["reavaliar ventilação eficaz", "confirmar capnografia e via aérea", "verificar expansibilidade torácica"],
  },
  acidose: {
    supportInNonShockable: true,
    evidenceSignals: [
      { label: "Acidose ou hidrogênio registrados", phrases: ["acidose", "hidrogenio", "metabolica"] },
      { label: "Gasometria ou hipoperfusão sugerem acidose", phrases: ["gasometria", "lactato", "hipoperfusao"] },
    ],
    actionSignals: [
      { label: "Ventilação ou correção da causa já foram revistas", phrases: ["ventilacao", "corrigir causa"] },
      { label: "Gasometria já foi considerada", phrases: ["gasometria"] },
    ],
    requiredMissingData: ["gasometria", "sinais de hipoventilação ou baixa perfusão"],
    optionalMissingData: ["tendência do lactato"],
    suggestedChecks: ["considerar gasometria", "revisar perfusão e ventilação"],
  },
  hipo_hipercalemia: {
    supportInShockable: true,
    supportInNonShockable: true,
    supportAfterMultipleShocks: true,
    evidenceSignals: [
      { label: "Distúrbio do potássio foi registrado", phrases: ["potassio", "hipercalemia", "hipocalemia"] },
      { label: "Contexto renal ou metabólico favorece distúrbio eletrolítico", phrases: ["renal", "dialise", "metabolico"] },
      { label: "ECG compatível foi mencionado", phrases: ["ecg", "onda t", "qrs alargado"] },
    ],
    actionSignals: [
      { label: "Correção eletrolítica já foi considerada", phrases: ["calcio", "insulina", "glicose", "correcao"] },
      { label: "ECG ou avaliação laboratorial já foram revisados", phrases: ["ecg", "potassio"] },
    ],
    requiredMissingData: ["contexto renal ou metabólico", "ECG compatível"],
    optionalMissingData: ["potássio sérico recente"],
    suggestedChecks: ["revisar ECG e contexto metabólico", "confirmar se há suspeita de distúrbio de potássio"],
  },
  hipotermia: {
    supportInNonShockable: true,
    evidenceSignals: [
      { label: "Temperatura baixa ou hipotermia registradas", phrases: ["hipotermia", "temperatura", "frio"] },
      { label: "Exposição ao frio ou imersão registradas", phrases: ["exposicao", "imersao", "ambiente frio"] },
    ],
    actionSignals: [
      { label: "Reaquecimento já foi considerado", phrases: ["reaquecimento", "temperatura"] },
    ],
    requiredMissingData: ["temperatura central", "contexto de exposição ao frio"],
    optionalMissingData: ["tempo de exposição"],
    suggestedChecks: ["medir temperatura central", "verificar contexto de exposição ou imersão"],
  },
  pneumotorax_hipertensivo: {
    supportInNonShockable: true,
    supportInShockable: true,
    evidenceSignals: [
      { label: "Assimetria ventilatória foi registrada", phrases: ["assimetria", "assimetria ventilatoria", "expansibilidade reduzida"] },
      { label: "Pressão intratorácica elevada ou tórax hipertensivo sugeridos", phrases: ["pneumotorax", "hipertensivo", "torax"] },
    ],
    actionSignals: [
      { label: "Descompressão torácica já foi considerada", phrases: ["descompressao", "agulha", "dreno"] },
    ],
    requiredMissingData: ["assimetria ventilatória", "sinais de pressão intratorácica elevada"],
    optionalMissingData: ["resposta após descompressão"],
    suggestedChecks: ["reavaliar expansão torácica", "verificar necessidade de descompressão"],
  },
  tamponamento_cardiaco: {
    supportInNonShockable: true,
    evidenceSignals: [
      { label: "Tamponamento ou derrame pericárdico registrados", phrases: ["tamponamento", "pericardio", "derrame pericardico"] },
      { label: "Contexto de trauma ou ultrassom sugestivo", phrases: ["trauma", "ultrassom", "eco"] },
    ],
    actionSignals: [
      { label: "Pericardiocentese ou drenagem já foram consideradas", phrases: ["pericardiocentese", "drenagem"] },
      { label: "Ultrassom dirigido já foi considerado", phrases: ["ultrassom", "eco"] },
    ],
    requiredMissingData: ["sinais sugestivos registrados", "resposta hemodinâmica", "avaliação dirigida disponível"],
    optionalMissingData: ["contexto de trauma"],
    suggestedChecks: ["avaliar ultrassom dirigido se disponível", "revisar contexto de trauma ou derrame pericárdico"],
  },
  toxinas: {
    supportInShockable: true,
    supportAfterMultipleShocks: true,
    evidenceSignals: [
      { label: "Exposição tóxica ou overdose registrada", phrases: ["toxina", "intoxicacao", "overdose"] },
      { label: "Medicamento ou antídoto sugerem intoxicação", phrases: ["medicamento", "antidoto", "toxico"] },
    ],
    actionSignals: [
      { label: "Antídoto ou suporte específico já foram considerados", phrases: ["antidoto", "toxico"] },
    ],
    requiredMissingData: ["exposição medicamentosa ou tóxica", "história de intoxicação"],
    optionalMissingData: ["possível antídoto disponível"],
    suggestedChecks: ["investigar exposição tóxica", "revisar possibilidade de antídoto"],
  },
  trombose_pulmonar: {
    supportInNonShockable: true,
    supportAfterMultipleShocks: true,
    evidenceSignals: [
      { label: "TEP ou embolia pulmonar registrados", phrases: ["tep", "embolia", "trombose pulmonar"] },
      { label: "Fatores de risco tromboembólicos mencionados", phrases: ["tromboembolico", "imobilizacao", "tvp"] },
    ],
    actionSignals: [
      { label: "Trombólise já foi considerada", phrases: ["trombolise", "tep"] },
    ],
    requiredMissingData: ["contexto de TEP maciço", "fatores de risco tromboembólicos"],
    optionalMissingData: ["sinais prévios de TVP"],
    suggestedChecks: ["revisar contexto de TEP", "avaliar fatores de risco tromboembólicos"],
  },
  trombose_coronaria: {
    supportInShockable: true,
    supportAfterMultipleShocks: true,
    evidenceSignals: [
      { label: "Contexto isquêmico ou IAM registrado", phrases: ["iam", "isquemico", "coronaria"] },
      { label: "ECG ou reperfusão sugerem trombose coronariana", phrases: ["st", "ecg", "reperfusao"] },
    ],
    actionSignals: [
      { label: "Estratégia coronariana já foi considerada", phrases: ["reperfusao", "coronaria"] },
    ],
    requiredMissingData: ["contexto isquêmico", "ECG ou história coronariana"],
    optionalMissingData: ["estratégia de reperfusão após ROSC"],
    suggestedChecks: ["revisar contexto isquêmico", "planejar ECG ou reperfusão após ROSC se aplicável"],
  },
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferCurrentRhythm(stateId: string): "shockable" | "nonshockable" | "unknown" {
  if (RHYTHM_STATES.shockable.includes(stateId as (typeof RHYTHM_STATES.shockable)[number])) {
    return "shockable";
  }

  if (
    RHYTHM_STATES.nonshockable.includes(
      stateId as (typeof RHYTHM_STATES.nonshockable)[number]
    )
  ) {
    return "nonshockable";
  }

  return "unknown";
}

function collectSignalMatches(items: string[], signals: CauseMetadata["evidenceSignals"]): SignalMatch[] {
  const normalizedItems = items.map(normalizeText);
  return signals.map((signal) => ({
    label: signal.label,
    matched: signal.phrases.some((phrase) =>
      normalizedItems.some((item) => item.includes(normalizeText(phrase)))
    ),
  }));
}

function scoreSignalMatches(matches: SignalMatch[], weights: { firstSignal: number; additionalSignal: number; cap: number }) {
  const matchedCount = matches.filter((match) => match.matched).length;
  if (matchedCount === 0) {
    return 0;
  }

  const score =
    weights.firstSignal + Math.max(0, matchedCount - 1) * weights.additionalSignal;
  return Math.min(score, weights.cap);
}

function getMatchedLabels(matches: SignalMatch[]) {
  return matches.filter((match) => match.matched).map((match) => match.label);
}

function getTimelineText(timeline: AclsTimelineEvent[]) {
  return timeline
    .flatMap((event) => Object.values(event.details ?? {}))
    .filter((value): value is string => typeof value === "string")
    .map(normalizeText);
}

function hasAnyPhrase(items: string[], phrases: string[]) {
  return phrases.some((phrase) =>
    items.some((item) => item.includes(normalizeText(phrase)))
  );
}

function buildAvailableDataPoints(
  cause: ReversibleCause,
  features: ReversibleCauseFeatures
) {
  const available = new Set<string>();
  const evidenceText = (cause.evidence ?? []).map(normalizeText);
  const actionText = (cause.actionsTaken ?? []).map(normalizeText);

  if (features.hasDifficultVentilation) {
    available.add("expansibilidade torácica");
    available.add("confirmação de via aérea eficaz");
  }

  if (features.hasCapnographyMention || features.hasLowEtco2) {
    available.add("capnografia ou ETCO2");
  }

  if (features.hasOxygenationCompromise) {
    available.add("saturação documentada");
  }

  if (features.hasHemorrhageOrVolumeLoss) {
    available.add("perdas ou hemorragia ativa");
  }

  if (features.noImprovementObservedByCause[cause.id as ReversibleCauseId]) {
    available.add("resposta à reposição volêmica");
    available.add("resposta após descompressão");
    available.add("resposta hemodinâmica");
  }

  if (features.hasPoorPerfusionContext) {
    available.add("sinais de hipoventilação ou baixa perfusão");
  }

  if (features.hasRenalOrMetabolicContext) {
    available.add("contexto renal ou metabólico");
  }

  if (features.hasHypothermiaContext) {
    available.add("temperatura central");
    available.add("contexto de exposição ao frio");
  }

  if (features.hasToxicExposureContext) {
    available.add("exposição medicamentosa ou tóxica");
    available.add("história de intoxicação");
  }

  if (features.hasTraumaOrPericardialContext) {
    available.add("sinais sugestivos registrados");
    available.add("avaliação dirigida disponível");
    available.add("contexto de trauma");
  }

  if (features.hasThoracicPressureContext) {
    available.add("assimetria ventilatória");
    available.add("sinais de pressão intratorácica elevada");
  }

  if (features.hasThromboembolicContext) {
    available.add("contexto de TEP maciço");
    available.add("fatores de risco tromboembólicos");
  }

  if (features.hasIschemicCoronaryContext) {
    available.add("contexto isquêmico");
    available.add("ECG ou história coronariana");
  }

  if (hasAnyPhrase(evidenceText, ["ecg", "supra st", "onda t", "qrs alargado"])) {
    available.add("ECG compatível");
  }

  if (hasAnyPhrase(evidenceText, ["potassio", "hipercalemia", "hipocalemia"])) {
    available.add("potássio sérico recente");
  }

  if (hasAnyPhrase(evidenceText, ["gasometria", "lactato"])) {
    available.add("gasometria");
    available.add("tendência do lactato");
  }

  if (hasAnyPhrase(actionText, ["ultrassom", "eco"])) {
    available.add("avaliação dirigida disponível");
  }

  return available;
}

function buildMissingData(
  metadata: CauseMetadata,
  cause: ReversibleCause,
  features: ReversibleCauseFeatures
) {
  const available = buildAvailableDataPoints(cause, features);
  const required = metadata.requiredMissingData.filter((item) => !available.has(item));
  const optional = (metadata.optionalMissingData ?? []).filter((item) => !available.has(item));
  return [...required.slice(0, 2), ...optional.slice(0, 1)];
}

function buildCauseFeatureFlags(
  causeId: ReversibleCauseId,
  features: ReversibleCauseFeatures
) {
  switch (causeId) {
    case "hipoxia":
      return {
        labels: [
          features.hasDifficultVentilation ? "Ventilação difícil registrada" : null,
          features.hasOxygenationCompromise ? "Oxigenação comprometida registrada" : null,
          features.hasLowEtco2 ? "ETCO2/capnografia compatível com ventilação ou perfusão inadequada" : null,
        ].filter(Boolean) as string[],
      };
    case "hipovolemia":
      return {
        labels: [
          features.hasHemorrhageOrVolumeLoss ? "Perda volêmica ou hemorragia registradas" : null,
          features.hasPoorPerfusionContext ? "Perfusão comprometida registrada" : null,
        ].filter(Boolean) as string[],
      };
    case "acidose":
      return {
        labels: [
          features.hasPoorPerfusionContext ? "Hipoperfusão registrada" : null,
          features.hasLowEtco2 ? "Capnografia/ETCO2 alterados disponíveis" : null,
        ].filter(Boolean) as string[],
      };
    case "hipo_hipercalemia":
      return {
        labels: [
          features.hasRenalOrMetabolicContext ? "Contexto renal ou metabólico registrado" : null,
          features.hasRepeatedShockableRhythm ? "Ritmo chocável recorrente mantém distúrbio eletrolítico plausível" : null,
        ].filter(Boolean) as string[],
      };
    case "hipotermia":
      return {
        labels: [features.hasHypothermiaContext ? "Contexto compatível com hipotermia registrado" : null].filter(Boolean) as string[],
      };
    case "pneumotorax_hipertensivo":
      return {
        labels: [
          features.hasDifficultVentilation ? "Ventilação difícil ou assimetria ventilatória registradas" : null,
          features.hasThoracicPressureContext ? "Contexto torácico compatível registrado" : null,
        ].filter(Boolean) as string[],
      };
    case "tamponamento_cardiaco":
      return {
        labels: [features.hasTraumaOrPericardialContext ? "Contexto de trauma ou pericárdio registrado" : null].filter(Boolean) as string[],
      };
    case "toxinas":
      return {
        labels: [features.hasToxicExposureContext ? "Contexto compatível com toxinas registrado" : null].filter(Boolean) as string[],
      };
    case "trombose_pulmonar":
      return {
        labels: [features.hasThromboembolicContext ? "Contexto tromboembólico registrado" : null].filter(Boolean) as string[],
      };
    case "trombose_coronaria":
      return {
        labels: [
          features.hasIschemicCoronaryContext ? "Contexto isquêmico ou coronariano registrado" : null,
          features.hasRepeatedShockableRhythm ? "Ritmo chocável recorrente mantém causa coronariana plausível" : null,
        ].filter(Boolean) as string[],
      };
  }
}

function extractReversibleCauseFeatures(
  input: ReversibleCauseAssistantInput
): ReversibleCauseFeatures {
  const currentRhythm = inferCurrentRhythm(input.stateId);
  const timelineText = getTimelineText(input.timeline);
  const allCauseText = input.reversibleCauses.flatMap((cause) => [
    ...(cause.evidence ?? []).map(normalizeText),
    ...(cause.actionsTaken ?? []).map(normalizeText),
    ...(cause.responseObserved ?? []).map(normalizeText),
  ]);
  const combinedText = [...timelineText, ...allCauseText];
  const manualSuspicionByCause: Partial<Record<ReversibleCauseId, boolean>> = {};
  const addressedByCause: Partial<Record<ReversibleCauseId, boolean>> = {};
  const improvementObservedByCause: Partial<Record<ReversibleCauseId, boolean>> = {};
  const noImprovementObservedByCause: Partial<Record<ReversibleCauseId, boolean>> = {};
  const actionSignalsByCause: Partial<Record<ReversibleCauseId, string[]>> = {};
  const textualEvidenceByCause: Partial<Record<ReversibleCauseId, string[]>> = {};
  const structuredEvidenceByCause: Partial<Record<ReversibleCauseId, string[]>> = {};

  for (const cause of input.reversibleCauses) {
    const causeId = cause.id as ReversibleCauseId;
    manualSuspicionByCause[causeId] = cause.status === "suspeita";
    addressedByCause[causeId] = cause.status === "abordada";

    const responseItems = (cause.responseObserved ?? []).map(normalizeText);
    improvementObservedByCause[causeId] = responseItems.some((item) => item.includes("melhora"));
    noImprovementObservedByCause[causeId] = responseItems.some(
      (item) =>
        item.includes("sem resposta") ||
        item.includes("sem melhora") ||
        item.includes("persist")
    );

    actionSignalsByCause[causeId] = (cause.actionsTaken ?? []).filter(Boolean);
    textualEvidenceByCause[causeId] = (cause.evidence ?? []).filter(Boolean);
    structuredEvidenceByCause[causeId] = [];
  }

  const features: ReversibleCauseFeatures = {
    currentRhythm,
    cyclesCompleted: input.operationalMetrics?.cyclesCompleted ?? 0,
    shocksDelivered: input.encounterSummary.shockCount,
    hasRepeatedShockableRhythm:
      currentRhythm === "shockable" && input.encounterSummary.shockCount >= 2,
    hasPersistentNonShockableRhythm:
      currentRhythm === "nonshockable" && (input.operationalMetrics?.cyclesCompleted ?? 0) >= 2,
    hasDifficultVentilation: hasAnyPhrase(combinedText, [
      "dificuldade ventilatoria",
      "ventilacao dificil",
      "via aerea dificil",
      "assimetria ventilatoria",
      "expansibilidade reduzida",
    ]),
    hasOxygenationCompromise: hasAnyPhrase(combinedText, [
      "dessaturacao",
      "saturacao baixa",
      "baixa saturacao",
      "hipoxia",
      "hipoxemia",
    ]),
    hasCapnographyMention: hasAnyPhrase(combinedText, ["capnografia", "etco2"]),
    hasLowEtco2: hasAnyPhrase(combinedText, ["etco2 baixo", "capnografia baixa", "etco2 reduzido"]),
    hasHemorrhageOrVolumeLoss: hasAnyPhrase(combinedText, [
      "hemorragia",
      "sangramento",
      "perda volêmica",
      "perda volemica",
      "hipovolemia",
    ]),
    hasPoorPerfusionContext: hasAnyPhrase(combinedText, [
      "hipoperfusao",
      "baixa perfusao",
      "choque",
      "lactato",
    ]),
    hasRenalOrMetabolicContext: hasAnyPhrase(combinedText, [
      "renal",
      "dialise",
      "metabolico",
      "metabólico",
      "hipercalemia",
      "hipocalemia",
    ]),
    hasHypothermiaContext: hasAnyPhrase(combinedText, [
      "hipotermia",
      "temperatura baixa",
      "imersao",
      "frio",
      "exposicao ao frio",
    ]),
    hasToxicExposureContext: hasAnyPhrase(combinedText, [
      "toxina",
      "intoxicacao",
      "overdose",
      "medicamento",
      "antidoto",
    ]),
    hasTraumaOrPericardialContext: hasAnyPhrase(combinedText, [
      "trauma",
      "pericardio",
      "derrame pericardico",
      "tamponamento",
      "ultrassom",
      "eco",
    ]),
    hasThoracicPressureContext: hasAnyPhrase(combinedText, [
      "pneumotorax",
      "hipertensivo",
      "descompressao",
      "agulha",
      "dreno",
      "torax",
    ]),
    hasThromboembolicContext: hasAnyPhrase(combinedText, [
      "tep",
      "embolia",
      "trombose pulmonar",
      "tromboembolico",
      "tvp",
    ]),
    hasIschemicCoronaryContext: hasAnyPhrase(combinedText, [
      "iam",
      "isquemico",
      "coronaria",
      "supra st",
      "reperfusao",
    ]),
    manualSuspicionByCause,
    addressedByCause,
    improvementObservedByCause,
    noImprovementObservedByCause,
    actionSignalsByCause,
    textualEvidenceByCause,
    structuredEvidenceByCause,
    availableDataPoints: new Set<string>(),
  };

  for (const cause of input.reversibleCauses) {
    const labels = buildCauseFeatureFlags(cause.id as ReversibleCauseId, features).labels;
    if (labels.length > 0) {
      features.structuredEvidenceByCause[cause.id as ReversibleCauseId] = labels;
    }
  }

  return features;
}

function buildExplanation(parts: {
  supportingEvidence: string[];
  counterEvidence: string[];
  missingData: string[];
}) {
  const segments: string[] = [];

  if (parts.supportingEvidence[0]) {
    segments.push(parts.supportingEvidence[0]);
  }

  if (parts.counterEvidence[0]) {
    segments.push(`Reduz suspeita: ${parts.counterEvidence[0].toLowerCase()}`);
  }

  if (parts.missingData[0]) {
    segments.push(`Falta checar ${parts.missingData[0].toLowerCase()}`);
  }

  return segments.length > 0
    ? segments.join(". ")
    : "Sem sinais suficientes para priorizar esta causa agora";
}

function buildAssessment(context: CauseRuleContext): ReversibleCauseAssessment {
  const metadata = CAUSE_METADATA[context.cause.id as ReversibleCauseId];
  const evidenceItems = context.cause.evidence ?? [];
  const actionItems = context.cause.actionsTaken ?? [];
  const responseItems = (context.cause.responseObserved ?? []).map(normalizeText);
  const structuredFeatureLabels =
    context.features.structuredEvidenceByCause[context.cause.id as ReversibleCauseId] ?? [];
  const supportingEvidence: string[] = [];
  const counterEvidence: string[] = [];
  const compatibleActions = [...context.cause.actions];
  const suggestedChecks = [...metadata.suggestedChecks];
  let score = 0;

  if (context.features.manualSuspicionByCause[context.cause.id as ReversibleCauseId]) {
    score += HEURISTIC_WEIGHTS.manual.suspected;
    supportingEvidence.push("Suspeita manual prévia");
  }

  if (context.features.addressedByCause[context.cause.id as ReversibleCauseId]) {
    score += HEURISTIC_WEIGHTS.manual.addressed;
    supportingEvidence.push("Já foi abordada durante o caso");
  }

  const evidenceMatches = collectSignalMatches(evidenceItems, metadata.evidenceSignals);
  const actionMatches = collectSignalMatches(actionItems, metadata.actionSignals);
  const evidenceScore = scoreSignalMatches(evidenceMatches, HEURISTIC_WEIGHTS.evidence);
  const actionScore = scoreSignalMatches(actionMatches, HEURISTIC_WEIGHTS.actions);

  score += evidenceScore;
  score += actionScore;

  structuredFeatureLabels.forEach((label) => supportingEvidence.push(label));
  getMatchedLabels(evidenceMatches).forEach((label) => supportingEvidence.push(label));
  getMatchedLabels(actionMatches).forEach((label) => supportingEvidence.push(label));

  if (
    context.features.addressedByCause[context.cause.id as ReversibleCauseId] &&
    actionScore > 0 &&
    !context.features.improvementObservedByCause[context.cause.id as ReversibleCauseId]
  ) {
    score += HEURISTIC_WEIGHTS.actions.addressedWithoutImprovementBonus;
    supportingEvidence.push("Ação registrada sem melhora clara");
  }

  if (context.features.noImprovementObservedByCause[context.cause.id as ReversibleCauseId]) {
    score += HEURISTIC_WEIGHTS.response.noImprovement;
    supportingEvidence.push("Sem resposta clara após abordagem registrada");
  }

  if (context.features.improvementObservedByCause[context.cause.id as ReversibleCauseId]) {
    score += HEURISTIC_WEIGHTS.response.improved;
    counterEvidence.push("houve melhora após a abordagem");
  }

  if (
    (context.features.currentRhythm === "shockable" && metadata.supportInShockable) ||
    (context.features.currentRhythm === "nonshockable" && metadata.supportInNonShockable)
  ) {
    score += HEURISTIC_WEIGHTS.context.rhythmCompatible;
    supportingEvidence.push(
      `Compatível com o contexto atual de ritmo ${context.features.currentRhythm === "shockable" ? "chocável" : "não chocável"}`
    );
  }

  if (metadata.supportAfterMultipleShocks && context.features.shocksDelivered >= 2) {
    score += HEURISTIC_WEIGHTS.context.refractoryShockable;
    supportingEvidence.push("Permanece plausível após múltiplos choques");
  }

  if (context.features.cyclesCompleted >= 2) {
    score += HEURISTIC_WEIGHTS.context.repeatedCycles;
    supportingEvidence.push("A PCR persiste após ciclos repetidos de RCP");
  }

  const textualSignalLabels = getMatchedLabels(evidenceMatches);
  const missingData = buildMissingData(metadata, context.cause, context.features);
  const suspectedLevel: ReversibleCauseSuspectedLevel =
    score >= HEURISTIC_WEIGHTS.thresholds.high
      ? "high"
      : score >= HEURISTIC_WEIGHTS.thresholds.medium
        ? "medium"
        : "low";

  const confidence: ReversibleCauseAssistantConfidence =
    context.features.manualSuspicionByCause[context.cause.id as ReversibleCauseId] ||
    structuredFeatureLabels.length >= 1 ||
    evidenceMatches.filter((match) => match.matched).length >= 2
      ? "moderate"
      : "low";

  if (
    structuredFeatureLabels.length === 0 &&
    textualSignalLabels.length > 0 &&
    !supportingEvidence.includes("Há contexto compatível registrado ao longo do caso")
  ) {
    score += HEURISTIC_WEIGHTS.context.timelineSignal;
    supportingEvidence.push("Evidência textual compatível registrada");
  }

  return {
    causeId: context.cause.id as ReversibleCauseId,
    label: context.cause.label,
    suspectedLevel,
    supportingEvidence: Array.from(new Set(supportingEvidence)).slice(0, 4),
    counterEvidence: Array.from(new Set(counterEvidence)).slice(0, 2),
    missingData,
    suggestedChecks,
    compatibleActions,
    confidence,
    explanation: buildExplanation({
      supportingEvidence,
      counterEvidence,
      missingData,
    }),
    score,
  };
}

function evaluateReversibleCauseAssistant(
  input: ReversibleCauseAssistantInput
): ReversibleCauseAssistantResult {
  const features = extractReversibleCauseFeatures(input);

  const ranked = input.reversibleCauses
    .map((cause) =>
      buildAssessment({
        cause,
        features,
      })
    )
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (left.suspectedLevel !== right.suspectedLevel) {
        return left.suspectedLevel === "high" ? -1 : right.suspectedLevel === "high" ? 1 : 0;
      }
      return left.label.localeCompare(right.label, "pt-BR");
    });

  const topThree = ranked.slice(0, 3);

  return {
    topThree,
    ranked,
    summary: {
      topThreeIds: topThree.map((item) => item.causeId),
      missingDataHighlights: Array.from(
        new Set(topThree.flatMap((item) => item.missingData))
      ).slice(0, 3),
    },
  };
}

function buildAssistantInsightSummary(result: ReversibleCauseAssistantResult) {
  if (result.topThree.length === 0) {
    return "Nenhuma causa reversível priorizada";
  }

  return `Top 3 agora: ${result.topThree.map((item) => item.label).join(", ")}`;
}

function buildCompatibleActionsByCause() {
  return Object.fromEntries(
    (aclsProtocol.reversibleCauses ?? []).map((cause) => [cause.id, cause.actions])
  );
}

export type {
  ReversibleCauseAssessment,
  ReversibleCauseAssistantConfidence,
  ReversibleCauseFeatures,
  ReversibleCauseAssistantInput,
  ReversibleCauseAssistantResult,
  ReversibleCauseId,
  ReversibleCauseSuspectedLevel,
};
export {
  HEURISTIC_WEIGHTS,
  buildAssistantInsightSummary,
  buildCompatibleActionsByCause,
  extractReversibleCauseFeatures,
  evaluateReversibleCauseAssistant,
  inferCurrentRhythm,
  normalizeText,
};
