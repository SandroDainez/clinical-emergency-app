import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import type { AuxiliaryPanel, ClinicalLogEntry, EncounterSummary, ProtocolState } from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, getOptionSublabel } from "./protocol-screen-utils";
import { ModuleFinishPanel, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";
import { AVC_WINDOWS, CONTRAINDICATIONS, NIHSS_ITEMS, THROMBOLYTICS } from "../../avc/protocol-config";

type Props = {
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  canGoBack: boolean;
  clinicalLog: ClinicalLogEntry[];
  encounterSummary: EncounterSummary;
  options: string[];
  state: ProtocolState;
  isCurrentStateTimerRunning: boolean;
  onFieldChange: (fieldId: string, value: string) => void;
  onPresetApply: (fieldId: string, value: string) => void;
  onUnitChange: (fieldId: string, unit: string) => void;
  onActionRun: (actionId: string, requiresConfirmation?: boolean) => void;
  onStatusChange: (
    itemId: string,
    status: "pendente" | "solicitado" | "realizado",
    requiresConfirmation?: boolean
  ) => void;
  onGoBack: () => void;
  onExitModule: () => void;
  onConfirmAction: () => void;
  onRunTransition: (input?: string) => void;
  onExportSummary: () => void;
  onPrintReport: () => void;
};

const TABS = [
  { id: 0, icon: "🧑", label: "Dados", step: "1", phaseTitle: "Tempo, dados mínimos e risco basal", accent: "#0f766e" },
  { id: 1, icon: "🧠", label: "Avaliação", step: "2", phaseTitle: "Déficit focal, gravidade e NIHSS", accent: "#0369a1" },
  { id: 2, icon: "🚨", label: "Estabilização", step: "3", phaseTitle: "ABC, glicemia, pressão e monitorização", accent: "#7c3aed" },
  { id: 3, icon: "🧪", label: "Exames", step: "4", phaseTitle: "TC sem contraste primeiro; CTA e labs como apoio", accent: "#b45309" },
  { id: 4, icon: "💉", label: "Reperfusão", step: "5", phaseTitle: "Elegibilidade real do caso e trombolítico", accent: "#be123c" },
  { id: 5, icon: "🏥", label: "Seguimento", step: "6", phaseTitle: "Destino, monitorização e checklist", accent: "#1d4ed8" },
];

function fieldValue(panel: AuxiliaryPanel | null, id: string) {
  return panel?.fields.find((field) => field.id === id)?.value ?? "";
}

function metricValue(summary: EncounterSummary, label: string) {
  return summary.panelMetrics?.find((metric) => metric.label === label)?.value ?? "";
}

function compactValue(value: string, fallback: string, maxLength = 52) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function joinValues(values: string[], fallback: string, maxLength = 72) {
  const joined = values.map((value) => value.trim()).filter(Boolean).join(" · ");
  return compactValue(joined, fallback, maxLength);
}

function yesNoReview(value: string, yes: string, no: string, review: string) {
  if (value === "yes") return yes;
  if (value === "no") return no;
  return review;
}

function pressureValue(panel: AuxiliaryPanel | null) {
  const systolic = fieldValue(panel, "systolicPressure");
  const diastolic = fieldValue(panel, "diastolicPressure");
  return systolic && diastolic ? `${systolic}/${diastolic}` : "";
}

function firstDocumented(panel: AuxiliaryPanel | null, ids: string[]) {
  for (const id of ids) {
    const value = fieldValue(panel, id).trim();
    if (value) return value;
  }
  return "";
}

function missingLabels(panel: AuxiliaryPanel | null, fields: Array<[string, string]>) {
  return fields.filter(([, id]) => !fieldValue(panel, id).trim()).map(([label]) => label);
}

function extractRecommendationLines(lines: string[], prefix: string) {
  return lines
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.replace(prefix, "").trim())
    .filter(Boolean);
}

function parseScore(value: string) {
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
}

function classifyNihssForUi(total: number) {
  if (total <= 0) return "Sem déficit mensurável";
  if (total <= 4) return "AVC leve";
  if (total <= 9) return "AVC leve a moderado";
  if (total <= 15) return "AVC moderado";
  if (total <= 20) return "AVC moderado a grave";
  return "AVC grave";
}

function buildNihssSummary(panel: AuxiliaryPanel | null) {
  const scoredItems = NIHSS_ITEMS.map((item) => ({
    ...item,
    score: parseScore(fieldValue(panel, item.id)),
  }));
  const filledItems = scoredItems.filter((item) => item.score != null);
  const total = filledItems.reduce((sum, item) => sum + (item.score ?? 0), 0);
  const complete = filledItems.length === NIHSS_ITEMS.length;
  const abnormalItems = scoredItems.filter((item) => (item.score ?? 0) > 0);

  return {
    total,
    complete,
    filledCount: filledItems.length,
    missingCount: NIHSS_ITEMS.length - filledItems.length,
    severity: classifyNihssForUi(total),
    abnormalItems,
  };
}

function symptomTokens(value: string) {
  return value
    .split(" | ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasToken(value: string, token: string) {
  return value
    .split(" | ")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(token.trim().toLowerCase());
}

function labState(value: string, comparator: (n: number) => boolean) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  return comparator(parsed) ? "SIM" : "NÃO";
}

function parseClock(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function elapsedMinutesUi(start: string, end: string) {
  const s = parseClock(start);
  const e = parseClock(end);
  if (s == null || e == null) return null;
  return e >= s ? e - s : e + 24 * 60 - s;
}

function nihssDisplayLabel(id: string, fallback: string) {
  const labels: Record<string, string> = {
    nihss1a: "Nível de consciência",
    nihss1b: "Orientação (perguntas simples)",
    nihss1c: "Obedece comandos",
    nihss2: "Movimento dos olhos",
    nihss3: "Campo visual",
    nihss4: "Assimetria facial",
    nihss5a: "Força do braço esquerdo",
    nihss5b: "Força do braço direito",
    nihss6a: "Força da perna esquerda",
    nihss6b: "Força da perna direita",
    nihss7: "Ataxia",
    nihss8: "Sensibilidade",
    nihss9: "Linguagem",
    nihss10: "Disartria",
    nihss11: "Negligência / extinção",
  };
  return labels[id] ?? fallback.replace(/^\d+[a-z]?\.?\s*/i, "");
}

function buildAssessmentStatus(panel: AuxiliaryPanel | null, nihssSummary: ReturnType<typeof buildNihssSummary>) {
  const symptoms = symptomTokens(fieldValue(panel, "symptoms"));
  const glucose = Number(fieldValue(panel, "glucoseInitial"));
  const systolic = Number(fieldValue(panel, "systolicPressure"));
  const diastolic = Number(fieldValue(panel, "diastolicPressure"));
  const mimic = fieldValue(panel, "strokeMimicConcern") === "yes";

  let headline = "Avaliação ainda incompleta: faltam dados para sustentar a suspeita clínica.";
  if (symptoms.length > 0 && mimic) {
    headline = "Há déficit focal, mas existe possibilidade de mimetizador: reavaliar antes de assumir AVC isquêmico.";
  } else if (symptoms.length > 0 && glucose > 0 && glucose < 70) {
    headline = "Déficit focal com hipoglicemia: corrigir glicemia e repetir exame neurológico.";
  } else if (symptoms.length > 0 && ((systolic >= 185) || (diastolic >= 110))) {
    headline = "Suspeita clínica de AVC sustentada, mas a PA está acima da meta para trombólise.";
  } else if (symptoms.length > 0) {
    headline = "Suspeita clínica de AVC sustentada: seguir para imagem e decisão de reperfusão.";
  }

  const missing = [
    !symptoms.length ? "sintomas focais" : "",
    !fieldValue(panel, "glucoseInitial") ? "glicemia inicial" : "",
    !fieldValue(panel, "systolicPressure") || !fieldValue(panel, "diastolicPressure") ? "PA" : "",
    nihssSummary.filledCount === 0 ? "NIHSS" : "",
  ].filter(Boolean);

  return {
    headline,
    nihssLine: nihssSummary.filledCount
      ? `NIHSS atual: ${nihssSummary.total} (${nihssSummary.severity.toLowerCase()})`
      : "NIHSS atual: ainda não iniciado",
    symptomLine: `Sintomas focais marcados: ${symptoms.length}${mimic ? " · mimetizador em revisão" : ""}`,
    missingLine: missing.length ? `Pendências que mudam a leitura: ${missing.join(", ")}` : "",
  };
}

function buildHeroDetails(panel: AuxiliaryPanel | null, encounterSummary: EncounterSummary, activeTab: number) {
  const recommendations = panel?.recommendations ?? [];
  const ivCard = recommendations[0];
  const blockers = ivCard ? extractRecommendationLines(ivCard.lines, "Bloqueio:") : [];
  const corrections = ivCard ? extractRecommendationLines(ivCard.lines, "Correção:") : [];
  const focalSummary = joinValues([fieldValue(panel, "symptoms"), fieldValue(panel, "laterality")], "Quadro focal pendente");
  const stabilizationSummary = firstDocumented(panel, [
    "stabilizationSuggestedInterventions",
    "stabilizationActions",
    "pressureControlActions",
    "glucoseCorrectionActions",
    "seizureManagement",
    "monitoring",
  ]);
  const pressure = pressureValue(panel);
  const dataMissing = missingLabels(panel, [
    ["LKW", "lastKnownWellTime"],
    ["chegada", "arrivalTime"],
    ["glicemia inicial", "glucoseInitial"],
    ["PA", "systolicPressure"],
    ["peso", "weightKg"],
  ]);
  const examMissing = missingLabels(panel, [
    ["TC", "ctResult"],
    ["plaquetas", "platelets"],
    ["INR", "inr"],
  ]);
  const followUpNarrative = firstDocumented(panel, ["postCareChecklist", "auditComment", "finalMedicalDecision"]);

  const perTab = [
    {
      badgeText: dataMissing.length ? `Faltam: ${dataMissing.slice(0, 2).join(" e ")}` : metricValue(encounterSummary, "Diagnóstico sindrômico") || "Dados mínimos prontos",
      subtitle: dataMissing.length
        ? `Sem ${dataMissing.join(", ")}, a decisão automática perde confiabilidade.`
        : "Base mínima preenchida para seguir com avaliação neurológica e imagem sem ruído.",
      metrics: [
        { label: "Última vez normal", value: fieldValue(panel, "lastKnownWellTime") || "Pendente", accent: "#0f766e" },
        { label: "Chegada", value: fieldValue(panel, "arrivalTime") || "Pendente", accent: "#0369a1" },
        { label: "Glicemia", value: fieldValue(panel, "glucoseInitial") || "Pendente", accent: "#b45309" },
        {
          label: "PA",
          value:
            fieldValue(panel, "systolicPressure") && fieldValue(panel, "diastolicPressure")
              ? `${fieldValue(panel, "systolicPressure")}/${fieldValue(panel, "diastolicPressure")}`
              : "Pendente",
          accent: "#be123c",
        },
      ],
    },
    {
      badgeText: focalSummary,
      subtitle:
        metricValue(encounterSummary, "NIHSS") && fieldValue(panel, "disablingDeficit")
          ? `${metricValue(encounterSummary, "NIHSS")} · ${yesNoReview(fieldValue(panel, "disablingDeficit"), "déficit incapacitante documentado", "déficit não incapacitante documentado", "capacidade funcional ainda em revisão")}.`
          : "Registre quadro focal, complete o NIHSS e deixe explícito se o déficit é incapacitante.",
      metrics: [
        { label: "NIHSS", value: metricValue(encounterSummary, "NIHSS") || "Incompleto", accent: "#7c3aed" },
        {
          label: "Quadro focal",
          value: focalSummary,
          accent: "#0369a1",
        },
        {
          label: "Déficit incapacitante",
          value:
            fieldValue(panel, "disablingDeficit") === "yes"
              ? "Sim"
              : fieldValue(panel, "disablingDeficit") === "no"
                ? "Não"
                : "Em revisão",
          accent: "#be123c",
        },
      ],
    },
    {
      metrics: [
        {
          label: "Prioridade",
          value: fieldValue(panel, "stabilizationUrgency") || "Sem alerta crítico",
          accent: "#be123c",
        },
        {
          label: "ABC",
          value:
            fieldValue(panel, "abcInstability") === "yes"
              ? "Instável"
              : fieldValue(panel, "abcInstability") === "no"
                ? "Sem instabilidade"
                : "Em revisão",
          accent: "#be123c",
        },
        {
          label: "Via aérea",
          value:
            fieldValue(panel, "airwayProtection") === "yes"
              ? "Precisa proteção"
              : fieldValue(panel, "airwayProtection") === "no"
                ? "Sem proteção"
                : "Em revisão",
          accent: "#b45309",
        },
        { label: "Intervenção agora", value: compactValue(stabilizationSummary, "Sem conduta documentada"), accent: "#0369a1" },
        {
          label: "Parâmetros",
          value: joinValues(
            [
              pressure ? `PA ${pressure}` : "",
              fieldValue(panel, "glucoseCurrent") ? `glicemia ${fieldValue(panel, "glucoseCurrent")}` : "",
              fieldValue(panel, "oxygenSaturation") ? `SpO₂ ${fieldValue(panel, "oxygenSaturation")}` : "",
              fieldValue(panel, "consciousnessLevel") ? `consciência ${fieldValue(panel, "consciousnessLevel")}` : "",
            ],
            "PA, glicemia, SpO₂ e consciência pendentes"
          ),
          accent: "#0f766e",
        },
      ],
      subtitle:
        fieldValue(panel, "stabilizationUrgency")
          ? `Leitura automática da estabilização: ${compactValue(fieldValue(panel, "stabilizationUrgency"), "Sem alerta crítico", 96)}.`
          : fieldValue(panel, "abcInstability") === "yes"
            ? "ABC instável documentado: a prioridade desta fase é estabilizar antes de discutir reperfusão."
            : fieldValue(panel, "airwayProtection") === "yes"
              ? "Há necessidade de proteção de via aérea; resolva isso antes de seguir para decisão de reperfusão."
              : stabilizationSummary
                ? `Conduta registrada: ${compactValue(stabilizationSummary, "Sem conduta documentada", 96)}`
                : "Esta fase precisa registrar o que foi feito em via aérea, pressão, glicemia e monitorização.",
      badgeText:
        fieldValue(panel, "stabilizationUrgency")
          ? fieldValue(panel, "stabilizationUrgency")
          : fieldValue(panel, "abcInstability") === "yes"
            ? "Instabilidade clínica em primeiro plano"
            : fieldValue(panel, "airwayProtection") === "yes"
              ? "Via aérea precisa ser protegida"
              : stabilizationSummary
                ? "Estabilização em andamento"
                : "Estabilização ainda sem conduta registrada",
    },
    {
      badgeText: fieldValue(panel, "ctResult") ? `TC: ${fieldValue(panel, "ctResult")}` : "TC sem contraste pendente",
      subtitle: fieldValue(panel, "ctResult")
        ? examMissing.length
          ? `Imagem inicial registrada; ainda faltam ${examMissing.join(", ")} para completar o suporte diagnóstico.`
          : "Imagem e laboratório crítico já documentados para sustentar a decisão."
        : "Sem TC sem contraste documentada, esta fase ainda não responde a pergunta clínica principal.",
      metrics: [
        { label: "TC sem contraste", value: fieldValue(panel, "ctResult") || "Pendente", accent: "#be123c" },
        { label: "Sinais precoces", value: fieldValue(panel, "earlyIschemiaSigns") || "Não descritos", accent: "#0369a1" },
        {
          label: "LVO / grande vaso",
          value:
            fieldValue(panel, "ctaResult") ||
            (fieldValue(panel, "lvoSuspicion") === "yes"
              ? "Suspeita clínica"
              : fieldValue(panel, "lvoSuspicion") === "no"
                ? "Sem suspeita"
                : "Em revisão"),
          accent: "#b45309",
        },
        {
          label: "Labs críticos",
          value:
            fieldValue(panel, "platelets") || fieldValue(panel, "inr") || fieldValue(panel, "aptt")
              ? `Plaquetas ${fieldValue(panel, "platelets") || "—"} · INR ${fieldValue(panel, "inr") || "—"}`
              : "Pendentes",
          accent: "#0f766e",
        },
      ],
    },
    {
      badgeText: metricValue(encounterSummary, "Trombólise") || "Reperfusão em revisão",
      subtitle: blockers.length
        ? `Bloqueio principal: ${blockers[0]}`
        : corrections.length
          ? `Correção prioritária: ${corrections[0]}`
          : "Sem bloqueio dominante documentado no momento; revise a decisão final e o trombolítico escolhido.",
      metrics: [
        { label: "Trombólise", value: metricValue(encounterSummary, "Trombólise") || "Em revisão", accent: "#be123c" },
        { label: "Trombectomia", value: metricValue(encounterSummary, "Trombectomia") || "Em revisão", accent: "#0369a1" },
        { label: "Bloqueio", value: compactValue(blockers[0] || "", "Nenhum bloqueio explícito"), accent: "#b45309" },
        { label: "Correção", value: compactValue(corrections[0] || "", "Nenhuma correção pendente"), accent: "#0f766e" },
      ],
    },
    {
      badgeText: metricValue(encounterSummary, "Destino") || "Seguimento em definição",
      subtitle: followUpNarrative
        ? `Fechamento registrado: ${compactValue(followUpNarrative, "Sem fechamento", 96)}`
        : "Esta fase deve fechar destino, checklist pós-conduta e a decisão médica final sem texto genérico.",
      metrics: [
        { label: "Destino", value: metricValue(encounterSummary, "Destino") || "Em definição", accent: "#1d4ed8" },
        { label: "Trombólise", value: metricValue(encounterSummary, "Trombólise") || "Em revisão", accent: "#be123c" },
        { label: "Trombectomia", value: metricValue(encounterSummary, "Trombectomia") || "Em revisão", accent: "#0369a1" },
        { label: "Dupla checagem", value: fieldValue(panel, "doubleCheckStatus") || "Pendente", accent: "#0f766e" },
      ],
    },
  ][activeTab];

  return perTab;
}

export default function AvcProtocolScreen({
  auxiliaryPanel,
  auxiliaryFieldSections,
  canGoBack,
  clinicalLog,
  encounterSummary,
  options,
  state,
  isCurrentStateTimerRunning,
  onFieldChange,
  onPresetApply,
  onUnitChange,
  onActionRun,
  onStatusChange,
  onGoBack,
  onExitModule,
  onConfirmAction,
  onRunTransition,
  onExportSummary,
  onPrintReport,
}: Props) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const TOTAL_TABS = TABS.length;
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );
  const isLastTab = activeTab === TOTAL_TABS - 1;
  const nextTabLabel = TABS[activeTab + 1]?.label;
  const [nihssHelpItemId, setNihssHelpItemId] = useState<string | null>(null);
  const [expandedStabilization, setExpandedStabilization] = useState<string[]>([]);
  const [expandedExamCard, setExpandedExamCard] = useState<string | null>(null);

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab });
  }, [activeTab, encounterSummary.protocolId]);

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((tab) => tab + 1);
      return;
    }
    onConfirmAction();
  }

  const heroDetails = useMemo(
    () => buildHeroDetails(auxiliaryPanel, encounterSummary, activeTab),
    [auxiliaryPanel, encounterSummary, activeTab]
  );
  const nihssSummary = useMemo(() => buildNihssSummary(auxiliaryPanel), [auxiliaryPanel]);
  const assessmentStatus = useMemo(
    () => buildAssessmentStatus(auxiliaryPanel, nihssSummary),
    [auxiliaryPanel, nihssSummary]
  );

  const finishSummaryLines = [
    { label: "Diagnóstico sindrômico", value: metricValue(encounterSummary, "Diagnóstico sindrômico") || "—" },
    { label: "NIHSS", value: metricValue(encounterSummary, "NIHSS") || "—" },
    { label: "Trombólise", value: metricValue(encounterSummary, "Trombólise") || "—" },
    { label: "Trombectomia", value: metricValue(encounterSummary, "Trombectomia") || "—" },
    { label: "Destino", value: metricValue(encounterSummary, "Destino") || "—" },
  ].filter((row) => row.value !== "—");
  const assessmentSystolic = Number(fieldValue(auxiliaryPanel, "systolicPressure"));
  const assessmentDiastolic = Number(fieldValue(auxiliaryPanel, "diastolicPressure"));
  const assessmentPam =
    Number.isFinite(assessmentSystolic) &&
    assessmentSystolic > 0 &&
    Number.isFinite(assessmentDiastolic) &&
    assessmentDiastolic > 0
      ? Math.round((assessmentSystolic + 2 * assessmentDiastolic) / 3)
      : null;

  const recommendationCards = auxiliaryPanel?.recommendations ?? [];
  const ivRecommendation = recommendationCards[0];
  const thrombectomyRecommendation = recommendationCards[1];
  const doseRecommendation = recommendationCards.find((item) => item.title.startsWith("Calculadora"));
  const reperfusionBlockers = ivRecommendation ? extractRecommendationLines(ivRecommendation.lines, "Bloqueio:") : [];
  const reperfusionCorrections = ivRecommendation ? extractRecommendationLines(ivRecommendation.lines, "Correção:") : [];
  const absoluteContraItems = CONTRAINDICATIONS.filter((item) => item.category === "absolute");
  const relativeContraItems = CONTRAINDICATIONS.filter((item) => item.category === "relative");
  const correctableContraItems = CONTRAINDICATIONS.filter((item) => item.category === "correctable");
  const pendingContraItems = CONTRAINDICATIONS.filter(
    (item) => item.category === "diagnostic_pending" || item.category === "lab_pending" || item.category === "hemodynamic_pending"
  );
  const selectedThrombolyticId = fieldValue(auxiliaryPanel, "selectedThrombolyticId") || "alteplase";
  const selectedThrombolytic = THROMBOLYTICS.find((item) => item.id === selectedThrombolyticId) ?? THROMBOLYTICS[0];
  const glucoseDecisionValue = fieldValue(auxiliaryPanel, "glucoseCurrent") || fieldValue(auxiliaryPanel, "glucoseInitial");
  const systolicDecisionValue = fieldValue(auxiliaryPanel, "systolicPressure");
  const diastolicDecisionValue = fieldValue(auxiliaryPanel, "diastolicPressure");
  const lkwElapsed = elapsedMinutesUi(fieldValue(auxiliaryPanel, "lastKnownWellTime"), fieldValue(auxiliaryPanel, "arrivalTime"));
  const within45 = lkwElapsed != null && lkwElapsed <= AVC_WINDOWS.ivTrombolysisMinutes;
  const within24 = lkwElapsed != null && lkwElapsed <= AVC_WINDOWS.thrombectomyExtendedMinutes;
  const pressureReady =
    Number(systolicDecisionValue) > 0 &&
    Number(diastolicDecisionValue) > 0 &&
    Number(systolicDecisionValue) <= AVC_WINDOWS.tPaMaxPressure.systolic &&
    Number(diastolicDecisionValue) <= AVC_WINDOWS.tPaMaxPressure.diastolic;
  const glucoseReady =
    Number(glucoseDecisionValue) > 0 &&
    Number(glucoseDecisionValue) >= 70 &&
    Number(glucoseDecisionValue) <= 400;
  const showPressureCorrection = Number(systolicDecisionValue) > AVC_WINDOWS.tPaMaxPressure.systolic || Number(diastolicDecisionValue) > AVC_WINDOWS.tPaMaxPressure.diastolic;
  const showGlucoseCorrection = Number(glucoseDecisionValue) > 0 && (Number(glucoseDecisionValue) < 70 || Number(glucoseDecisionValue) > 400);
  const showThrombolyticCalculator = Boolean(doseRecommendation) && ivRecommendation && ivRecommendation.title !== "Não elegível no estado atual";

  const stabilizationItems = [
    {
      id: "airway",
      label: "Risco de via aérea (proteção inadequada/rebaixamento)",
      active: fieldValue(auxiliaryPanel, "airwayProtection") === "yes",
      toggle: () => onFieldChange("airwayProtection", fieldValue(auxiliaryPanel, "airwayProtection") === "yes" ? "no" : "yes"),
      detail:
        "Conduta imediata: via aérea ameaçada. Cabeceira 30°, aspiração, pré-oxigenação e preparo para via aérea avançada se proteção inadequada/rebaixamento.",
      tone: "danger" as const,
    },
    {
      id: "hypoxemia",
      label: "SpO₂ < 94%",
      active: Number(fieldValue(auxiliaryPanel, "oxygenSaturation")) > 0 && Number(fieldValue(auxiliaryPanel, "oxygenSaturation")) < 94,
      toggle: () => setExpandedStabilization((current) => current.includes("hypoxemia") ? current.filter((item) => item !== "hypoxemia") : [...current, "hypoxemia"]),
      detail:
        "Conduta imediata: hipoxemia. O2 suplementar para meta de SpO₂ 94-98% com reavaliação em 5-10 min e investigação de insuficiência ventilatória/broncoaspiração.",
      tone: "info" as const,
    },
    {
      id: "vomit",
      label: "Vômitos persistentes / risco de broncoaspiração",
      active: hasToken(fieldValue(auxiliaryPanel, "stabilizationActions"), "Aspiração de vias aéreas"),
      toggle: () => onPresetApply("stabilizationActions", "Aspiração de vias aéreas"),
      detail:
        "Conduta imediata: vômitos/aspiração. Jejum, cabeceira 30°, proteção de via aérea e antiemético conforme protocolo, com reavaliação frequente.",
      tone: "warning" as const,
    },
    {
      id: "hemo",
      label: "Instabilidade hemodinâmica (perfusão inadequada)",
      active: fieldValue(auxiliaryPanel, "abcInstability") === "yes",
      toggle: () => onFieldChange("abcInstability", fieldValue(auxiliaryPanel, "abcInstability") === "yes" ? "no" : "yes"),
      detail:
        "Conduta imediata: instabilidade hemodinâmica. Cristaloide isotônico em bolus de 250-500 mL, reavaliar perfusão/PAM, repetir conforme resposta e manter monitorização contínua.",
      tone: "violet" as const,
    },
    {
      id: "access",
      label: "Dois acessos venosos calibrosos",
      active: fieldValue(auxiliaryPanel, "venousAccess") === "2 acessos periféricos",
      toggle: () => onFieldChange("venousAccess", fieldValue(auxiliaryPanel, "venousAccess") === "2 acessos periféricos" ? "" : "2 acessos periféricos"),
      detail:
        "Conduta imediata: garantir dois acessos venosos periféricos confiáveis para coleta, glicemia, anti-hipertensivos e eventual trombólise.",
      tone: "neutral" as const,
    },
    {
      id: "monitor",
      label: "Monitorização contínua ativa",
      active: hasToken(fieldValue(auxiliaryPanel, "monitoring"), "Monitor cardíaco"),
      toggle: () => onPresetApply("monitoring", "Monitor cardíaco"),
      detail:
        "Conduta imediata: manter monitor cardíaco, PA seriada e oximetria contínua durante estabilização, imagem e reperfusão.",
      tone: "neutral" as const,
    },
    {
      id: "ecg",
      label: "ECG já realizado e revisado",
      active: hasToken(fieldValue(auxiliaryPanel, "monitoring"), "PA seriada"),
      toggle: () => setExpandedStabilization((current) => current.includes("ecg") ? current.filter((item) => item !== "ecg") : [...current, "ecg"]),
      detail:
        "Conduta imediata: registrar ECG se houver suspeita de arritmia, FA, isquemia associada ou instabilidade sem explicação clara.",
      tone: "neutral" as const,
    },
  ];

  const expandedStabilizationItems = stabilizationItems.filter((item) => item.active || expandedStabilization.includes(item.id));

  const examCards = [
    {
      id: "ctResult",
      title: "TC de crânio sem contraste",
      value: fieldValue(auxiliaryPanel, "ctResult") || "Selecionar",
      detail: "Exame primordial para excluir hemorragia e decidir trombólise IV. Não atrasar TC por exames laboratoriais.",
      options: [
        ["Sem sangramento", "sem_sangramento"],
        ["Hemorragia", "hemorragia"],
        ["Inconclusivo", "inconclusivo"],
      ] as Array<[string, string]>,
    },
    {
      id: "ctaResult",
      title: "AngioTC: oclusão de grande vaso",
      value: fieldValue(auxiliaryPanel, "ctaResult") || "Selecionar",
      detail: "AngioTC é complementar para seleção de trombectomia. Não deve atrasar trombólise IV quando já indicada.",
      options: [
        ["Oclusão de grande vaso", "oclusao_grande_vaso"],
        ["Sem LVO", "sem_lvo"],
        ["Inconclusivo", "inconclusivo"],
        ["Não realizada", "nao_realizada"],
      ] as Array<[string, string]>,
    },
  ];

  const labCards = [
    { id: "platelets", title: "Plaquetas (/mm3)", options: ["80000", "100000", "150000", "250000"] },
    { id: "inr", title: "INR", options: ["1", "1,3", "1,7", "2"] },
    { id: "aptt", title: "TTPa (s)", options: ["30", "35", "40", "50"] },
    { id: "creatinine", title: "Creatinina (mg/dL)", options: ["0,8", "1", "1,5", "2,5"] },
  ];

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="Acidente vascular cerebral"
          title="AVC organizado por segurança clínica e tempos críticos"
          subtitle={heroDetails.subtitle}
          badgeText={heroDetails.badgeText}
          metrics={heroDetails.metrics}
          progressLabel={`Etapa ${activeTab + 1} de ${TABS.length}`}
          stepTitle={TABS[activeTab]?.label ?? state.text}
          hint={TABS[activeTab]?.phaseTitle ?? state.details?.[0]}
          compactMobile
          compressed
          showStepCard={false}
        />
      }
      items={TABS}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(Number(id))}
      sidebarEyebrow="Navegação do AVC"
      sidebarTitle="Etapas do protocolo"
      showContentHeader={false}>
      {activeTab === 1 ? (
        <View style={avcStyles.nihssCard}>
          <View style={avcStyles.nihssHeader}>
            <View style={avcStyles.assessmentStatusCard}>
              <Text style={avcStyles.assessmentStatusEyebrow}>Status da avaliação</Text>
              <Text style={avcStyles.assessmentStatusHeadline}>{assessmentStatus.headline}</Text>
              <Text style={avcStyles.assessmentStatusLine}>{assessmentStatus.nihssLine}</Text>
              <Text style={avcStyles.assessmentStatusLine}>{assessmentStatus.symptomLine}</Text>
              {assessmentStatus.missingLine ? (
                <Text style={avcStyles.assessmentStatusFootnote}>{assessmentStatus.missingLine}</Text>
              ) : null}
            </View>

            <View style={avcStyles.hemoPanel}>
              <Text style={avcStyles.hemoPanelTitle}>Hemodinâmica e glicemia da avaliação</Text>
              <View style={avcStyles.hemoGrid}>
                {[
                  { id: "systolicPressure", label: "PAS", value: fieldValue(auxiliaryPanel, "systolicPressure") || "Selecionar", options: ["90", "120", "140", "160", "180", "185", "200", "220"] },
                  { id: "diastolicPressure", label: "PAD", value: fieldValue(auxiliaryPanel, "diastolicPressure") || "Selecionar", options: ["60", "80", "90", "100", "110", "120", "130"] },
                  { id: "heartRate", label: "FC", value: fieldValue(auxiliaryPanel, "heartRate") || "Selecionar", options: ["50", "60", "80", "100", "120", "150"] },
                  { id: "glucoseInitial", label: "Glicemia capilar inicial", value: fieldValue(auxiliaryPanel, "glucoseInitial") || "Selecionar", options: ["50", "60", "70", "90", "120", "180", "250", "300"] },
                ].map((card) => (
                  <View key={card.id} style={avcStyles.hemoCard}>
                    <Text style={avcStyles.hemoCardLabel}>{card.label}</Text>
                    <Text style={avcStyles.hemoCardValue}>{card.value}</Text>
                    <View style={avcStyles.examOptionsRow}>
                      {card.options.map((value) => (
                        <Pressable
                          key={`${card.id}-${value}`}
                          style={[avcStyles.examChip, fieldValue(auxiliaryPanel, card.id) === value && avcStyles.examChipActive]}
                          onPress={() => onFieldChange(card.id, value)}>
                          <Text style={[avcStyles.examChipText, fieldValue(auxiliaryPanel, card.id) === value && avcStyles.examChipTextActive]}>
                            {value}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
                <View style={[avcStyles.hemoCard, avcStyles.hemoCardReadOnly]}>
                  <Text style={avcStyles.hemoCardLabel}>PAM calculada</Text>
                  <Text style={avcStyles.hemoCardValue}>{assessmentPam != null ? `${assessmentPam} mmHg` : "Aguardando PAS/PAD"}</Text>
                  <Text style={avcStyles.hemoCardHint}>Calculada automaticamente a partir de PAS e PAD.</Text>
                </View>
              </View>
            </View>

            <View style={avcStyles.nihssBanner}>
              <Text style={avcStyles.nihssBannerTitle}>NIHSS = gravidade neurológica</Text>
              <Text style={avcStyles.nihssBannerSubtitle}>
                {nihssSummary.filledCount
                  ? `Pontuação atual: ${nihssSummary.total} (${nihssSummary.severity.toLowerCase()})`
                  : "Pontuação atual: ainda não iniciada"}
              </Text>
            </View>
          </View>

          <View style={avcStyles.nihssIntro}>
            <Text style={avcStyles.nihssIntroTitle}>Escala neurológica de gravidade</Text>
            <Text style={avcStyles.nihssIntroText}>
              Clique direto no número de cada item. O significado da opção escolhida aparece logo abaixo.
            </Text>
          </View>

          <View style={avcStyles.nihssScaleGrid}>
            {NIHSS_ITEMS.map((item) => {
              const selectedValue = fieldValue(auxiliaryPanel, item.id);
              const selectedScore = parseScore(selectedValue);
              const selectedOption = item.options.find((option) => option.score === selectedScore);
              const helpOpen = nihssHelpItemId === item.id;

              return (
                <View key={item.id} style={avcStyles.nihssScaleCard}>
                  <View style={avcStyles.nihssScaleHeader}>
                    <Text style={avcStyles.nihssScaleTitle}>{nihssDisplayLabel(item.id, item.label)}</Text>
                    <Pressable
                      style={[avcStyles.nihssHelpPill, helpOpen && avcStyles.nihssHelpPillActive]}
                      onPress={() => setNihssHelpItemId((current) => (current === item.id ? null : item.id))}>
                      <Text style={[avcStyles.nihssHelpPillText, helpOpen && avcStyles.nihssHelpPillTextActive]}>Ajuda</Text>
                    </Pressable>
                  </View>

                  <View style={avcStyles.nihssOptionRow}>
                    {item.options.map((option) => {
                      const active = option.score === selectedScore;
                      return (
                        <Pressable
                          key={`${item.id}-${option.score}`}
                          style={[avcStyles.nihssScoreBtn, active && avcStyles.nihssScoreBtnActive]}
                          onPress={() => onFieldChange(item.id, String(option.score))}>
                          <Text style={[avcStyles.nihssScoreBtnText, active && avcStyles.nihssScoreBtnTextActive]}>
                            {option.score}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={avcStyles.nihssSelectedText}>
                    {selectedOption
                      ? `Selecionado: ${selectedOption.score} — ${selectedOption.label}`
                      : "Selecione a pontuação do item"}
                  </Text>

                  {helpOpen ? (
                    <Text style={avcStyles.nihssHelpText}>
                      {item.description} {selectedOption?.description ?? ""}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {auxiliaryPanel && activeTab !== 2 && activeTab !== 3 && activeTab !== 4 ? (
        <SepsisFormTabs
          auxiliaryPanel={auxiliaryPanel}
          fieldSections={auxiliaryFieldSections}
          metrics={auxiliaryPanel.metrics}
          activeTab={activeTab}
          externalNavigation
          onTabChange={setActiveTab}
          onFieldChange={onFieldChange}
          onPresetApply={onPresetApply}
          onUnitChange={onUnitChange}
          onActionRun={onActionRun}
          onStatusChange={onStatusChange}
          moduleMode="avc"
        />
      ) : null}

      {activeTab === 2 ? (
        <View style={avcStyles.customPanel}>
          <Text style={avcStyles.customPanelTitle}>Estabilização imediata</Text>
          <View style={avcStyles.toggleGrid}>
            {stabilizationItems.map((item) => {
              const highlighted = item.active || expandedStabilization.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={[avcStyles.toggleCard, highlighted && avcStyles.toggleCardActive]}
                  onPress={() => {
                    item.toggle();
                    setExpandedStabilization((current) =>
                      current.includes(item.id) ? current.filter((entry) => entry !== item.id) : [...current, item.id]
                    );
                  }}>
                  <Text style={avcStyles.toggleLabel}>{item.label}</Text>
                  <View style={[avcStyles.switchTrack, highlighted && avcStyles.switchTrackOn]}>
                    <View style={[avcStyles.switchThumb, highlighted && avcStyles.switchThumbOn]} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={avcStyles.condutaGrid}>
            {expandedStabilizationItems.map((item) => (
              <View
                key={item.id}
                style={[
                  avcStyles.condutaCard,
                  item.tone === "danger" && avcStyles.condutaDanger,
                  item.tone === "warning" && avcStyles.condutaWarning,
                  item.tone === "info" && avcStyles.condutaInfo,
                  item.tone === "violet" && avcStyles.condutaViolet,
                ]}>
                <Text style={avcStyles.condutaText}>{item.detail}</Text>
              </View>
            ))}
          </View>

          <View style={avcStyles.statusDecisionCard}>
            <View style={avcStyles.statusDecisionHeader}>
              <Text style={avcStyles.statusDecisionTitle}>Status da estabilização</Text>
              <View style={avcStyles.statusDecisionBadge}>
                <Text style={avcStyles.statusDecisionBadgeText}>Decisão</Text>
              </View>
            </View>
            <Text style={avcStyles.statusDecisionText}>
              {fieldValue(auxiliaryPanel, "stabilizationUrgency")
                ? `Manter avanço da estabilização conforme necessidade clínica. Leitura atual: ${fieldValue(auxiliaryPanel, "stabilizationUrgency")}.`
                : "Manter avanço da estabilização conforme necessidade clínica. Este bloco é recomendação e não critério isolado de bloqueio da trombólise."}
            </Text>
          </View>
        </View>
      ) : null}

      {activeTab === 3 ? (
        <View style={avcStyles.customPanel}>
          <Text style={avcStyles.customPanelTitle}>Exames e resultados críticos</Text>
          <View style={avcStyles.priorityBanner}>
            <Text style={avcStyles.priorityBannerTitle}>Prioridade máxima: TC de crânio sem contraste</Text>
            <Text style={avcStyles.priorityBannerText}>
              Exame primordial para excluir hemorragia e decidir trombólise IV. Não atrasar TC por exames laboratoriais.
            </Text>
          </View>

          <View style={avcStyles.examGrid}>
            {examCards.map((card) => (
              <View key={card.id} style={avcStyles.examCard}>
                <Pressable
                  style={avcStyles.examCardHeader}
                  onPress={() => setExpandedExamCard((current) => (current === card.id ? null : card.id))}>
                  <Text style={avcStyles.examCardTitle}>{card.title}</Text>
                  <Text style={avcStyles.examCardValue}>{card.value}</Text>
                </Pressable>
                <Text style={avcStyles.examCardHint}>{card.detail}</Text>
                {expandedExamCard === card.id ? (
                  <View style={avcStyles.examOptionsRow}>
                    {card.options.map(([label, value]) => (
                      <Pressable
                        key={value}
                        style={[avcStyles.examChip, fieldValue(auxiliaryPanel, card.id) === value && avcStyles.examChipActive]}
                        onPress={() => onFieldChange(card.id, value)}>
                        <Text style={[avcStyles.examChipText, fieldValue(auxiliaryPanel, card.id) === value && avcStyles.examChipTextActive]}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          <View style={avcStyles.labGrid}>
            {labCards.map((card) => (
              <View key={card.id} style={avcStyles.labCard}>
                <Text style={avcStyles.labTitle}>{card.title}</Text>
                <View style={avcStyles.labValueBoxWide}>
                  <Text style={avcStyles.labValueText}>{fieldValue(auxiliaryPanel, card.id) || "Selecionar"}</Text>
                </View>
                <View style={avcStyles.examOptionsRow}>
                  {card.options.map((value) => (
                    <Pressable
                      key={value}
                      style={[avcStyles.examChip, fieldValue(auxiliaryPanel, card.id) === value && avcStyles.examChipActive]}
                      onPress={() => onFieldChange(card.id, value.replace(",", "."))}>
                      <Text style={[avcStyles.examChipText, fieldValue(auxiliaryPanel, card.id) === value.replace(",", ".") && avcStyles.examChipTextActive]}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={avcStyles.quickResultsCard}>
            <Text style={avcStyles.quickResultsTitle}>Resultados críticos rápidos:</Text>
            <Text style={avcStyles.quickResultsLine}>Plaquetas &lt; 100.000: {labState(fieldValue(auxiliaryPanel, "platelets"), (n) => n < 100000)}</Text>
            <Text style={avcStyles.quickResultsLine}>INR &gt; 1,7: {labState(fieldValue(auxiliaryPanel, "inr"), (n) => n > 1.7)}</Text>
            <Text style={avcStyles.quickResultsLine}>TTPa: {fieldValue(auxiliaryPanel, "aptt") || "—"} s | Creatinina: {fieldValue(auxiliaryPanel, "creatinine") || "—"} mg/dL</Text>
            <Text style={avcStyles.quickResultsFootnote}>
              TC de crânio não deve ser atrasada por exames laboratoriais. Coagulação é crucial quando há suspeita de anticoagulação/coagulopatia.
            </Text>
          </View>

          <View style={avcStyles.statusDecisionCard}>
            <View style={avcStyles.statusDecisionHeader}>
              <Text style={avcStyles.statusDecisionTitle}>Interpretação de imagem</Text>
              <View style={avcStyles.statusDecisionBadge}>
                <Text style={avcStyles.statusDecisionBadgeText}>Decisão</Text>
              </View>
            </View>
            <Text style={avcStyles.statusDecisionText}>
              {fieldValue(auxiliaryPanel, "ctResult")
                ? `Imagem atual: ${fieldValue(auxiliaryPanel, "ctResult")}. ${heroDetails.subtitle}`
                : "Imagem ainda não definida: este passo bloqueia decisão terapêutica definitiva."}
            </Text>
          </View>
        </View>
      ) : null}

      {activeTab === 4 ? (
        <View style={avcStyles.customPanel}>
          <View style={avcStyles.priorityBanner}>
            <Text style={avcStyles.priorityBannerTitle}>
              {fieldValue(auxiliaryPanel, "ctResult") === "sem_sangramento"
                ? "Ramo isquêmico sem sangramento confirmado"
                : "Bloqueio crítico: TC de crânio sem contraste ainda não confirmou ramo isquêmico sem sangramento"}
            </Text>
            <Text style={avcStyles.priorityBannerText}>
              A decisão de trombólise depende desta confirmação de imagem.
            </Text>
          </View>

          <View style={avcStyles.sectionStripDanger}>
            <Text style={avcStyles.sectionStripDangerText}>Contraindicações absolutas (marcar se presentes)</Text>
          </View>
          <View style={avcStyles.toggleGrid}>
            {absoluteContraItems.map((item) => {
              const fieldId = `contra_${item.id}_status`;
              const active = fieldValue(auxiliaryPanel, fieldId) === "present";
              return (
                <Pressable
                  key={item.id}
                  style={[avcStyles.toggleCard, active && avcStyles.toggleCardActive]}
                  onPress={() => onFieldChange(fieldId, active ? "absent" : "present")}>
                  <View style={avcStyles.toggleTextBlock}>
                    <Text style={avcStyles.toggleLabel}>{item.name}</Text>
                    <Text style={avcStyles.toggleSubLabel}>{item.description}</Text>
                  </View>
                  <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                    <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={avcStyles.sectionStripWarning}>
            <Text style={avcStyles.sectionStripWarningText}>Contraindicações relativas</Text>
          </View>
          <View style={avcStyles.toggleGrid}>
            {relativeContraItems.map((item) => {
              const fieldId = `contra_${item.id}_status`;
              const active = fieldValue(auxiliaryPanel, fieldId) === "present";
              return (
                <Pressable
                  key={item.id}
                  style={[avcStyles.toggleCard, active && avcStyles.toggleCardActive]}
                  onPress={() => onFieldChange(fieldId, active ? "absent" : "present")}>
                  <View style={avcStyles.toggleTextBlock}>
                    <Text style={avcStyles.toggleLabel}>{item.name}</Text>
                    <Text style={avcStyles.toggleSubLabel}>{item.description}</Text>
                  </View>
                  <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                    <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={avcStyles.sectionStripWarning}>
            <Text style={avcStyles.sectionStripWarningText}>Contraindicações potencialmente corrigíveis</Text>
          </View>
          <View style={avcStyles.toggleGrid}>
            {correctableContraItems.map((item) => {
              const fieldId = `contra_${item.id}_status`;
              const active = fieldValue(auxiliaryPanel, fieldId) === "present";
              return (
                <Pressable
                  key={item.id}
                  style={[avcStyles.toggleCard, active && avcStyles.toggleCardActive]}
                  onPress={() => onFieldChange(fieldId, active ? "absent" : "present")}>
                  <View style={avcStyles.toggleTextBlock}>
                    <Text style={avcStyles.toggleLabel}>{item.name}</Text>
                    <Text style={avcStyles.toggleSubLabel}>{item.correctionGuidance || item.description}</Text>
                  </View>
                  <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                    <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={avcStyles.sectionStripInfo}>
            <Text style={avcStyles.sectionStripInfoText}>Pendências diagnósticas e laboratoriais</Text>
          </View>
          <View style={avcStyles.toggleGrid}>
            {pendingContraItems.map((item) => {
              const fieldId = `contra_${item.id}_status`;
              const active = fieldValue(auxiliaryPanel, fieldId) === "present";
              return (
                <Pressable
                  key={item.id}
                  style={[avcStyles.toggleCard, active && avcStyles.toggleCardActive]}
                  onPress={() => onFieldChange(fieldId, active ? "absent" : "present")}>
                  <View style={avcStyles.toggleTextBlock}>
                    <Text style={avcStyles.toggleLabel}>{item.name}</Text>
                    <Text style={avcStyles.toggleSubLabel}>{item.correctionGuidance || item.description}</Text>
                  </View>
                  <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                    <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={avcStyles.reperfusionStateCard}>
            <Text style={avcStyles.reperfusionStateTitle}>{ivRecommendation?.title || "Reperfusão IV em revisão"}</Text>
            <Text style={avcStyles.reperfusionStateText}>
              {reperfusionCorrections.length
                ? "Aguardando conclusão das correções/reavaliações para decisão final."
                : ivRecommendation?.lines?.[0] || "Revisar tempo, imagem, contraindicações e correções pendentes."}
            </Text>
          </View>

          <View style={avcStyles.criteriaCard}>
            <Text style={avcStyles.criteriaTitle}>Critérios atuais para decisão de trombólise</Text>
            <Text style={avcStyles.criteriaLine}>Janela: {lkwElapsed != null ? `${(lkwElapsed / 60).toFixed(1).replace(".0", "")} h` : "- h"}</Text>
            <Text style={avcStyles.criteriaLine}>Dentro de 4,5h: {within45 ? "Sim" : "Não"}</Text>
            <Text style={avcStyles.criteriaLine}>Dentro de 24h: {within24 ? "Sim" : "Não"}</Text>
            <Text style={avcStyles.criteriaLine}>PA para trombólise (&lt; 185 / &lt; 110): {pressureReady ? "OK" : "Não"}</Text>
            <Text style={avcStyles.criteriaLine}>Glicemia para decisão (70-400 mg/dL): {glucoseReady ? "OK" : "Não"}</Text>
          </View>

          {reperfusionBlockers.length || reperfusionCorrections.length ? (
            <View style={avcStyles.pendingCard}>
              <Text style={avcStyles.pendingTitle}>
                Pendências atuais para liberar reperfusão: {reperfusionBlockers.length + reperfusionCorrections.length}
              </Text>
              {[...reperfusionBlockers, ...reperfusionCorrections].map((item) => (
                <Text key={item} style={avcStyles.pendingLine}>• {item}</Text>
              ))}
            </View>
          ) : null}

          {showPressureCorrection ? (
            <View style={avcStyles.correctionCard}>
              <Text style={avcStyles.correctionTitle}>Motivo de bloqueio corrigível e sugestões de correção</Text>
              <Text style={avcStyles.correctionLine}>
                1. PA acima da meta: reduzir para &lt; 185/&lt;110 mmHg com estratégia institucional e reavaliar elegibilidade.
              </Text>
              <Text style={avcStyles.correctionLine}>
                2. Quando PA entrar na meta e estiver registrada no card, o critério hemodinâmico é liberado automaticamente.
              </Text>

              <View style={avcStyles.postCorrectionPanel}>
                <Text style={avcStyles.postCorrectionEyebrow}>Reavaliação após correção</Text>
                <Text style={avcStyles.postCorrectionHint}>
                  Registre os valores pós-correção para liberar ou manter bloqueio da trombólise.
                </Text>
                <View style={avcStyles.postCorrectionRow}>
                  <View style={avcStyles.postCorrectionField}>
                    <Text style={avcStyles.postCorrectionLabel}>PAS pós-correção</Text>
                    <TextInput
                      value={systolicDecisionValue}
                      onChangeText={(value) => onFieldChange("systolicPressure", value)}
                      keyboardType="numbers-and-punctuation"
                      style={avcStyles.postCorrectionInput}
                      placeholder="Digite a PAS"
                      placeholderTextColor="#64748b"
                    />
                    <View style={avcStyles.examOptionsRow}>
                      {["160", "170", "180", "185"].map((value) => (
                        <Pressable key={value} style={avcStyles.examChip} onPress={() => onFieldChange("systolicPressure", value)}>
                          <Text style={avcStyles.examChipText}>{value}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View style={avcStyles.postCorrectionField}>
                    <Text style={avcStyles.postCorrectionLabel}>PAD pós-correção</Text>
                    <TextInput
                      value={diastolicDecisionValue}
                      onChangeText={(value) => onFieldChange("diastolicPressure", value)}
                      keyboardType="numbers-and-punctuation"
                      style={avcStyles.postCorrectionInput}
                      placeholder="Digite a PAD"
                      placeholderTextColor="#64748b"
                    />
                    <View style={avcStyles.examOptionsRow}>
                      {["90", "100", "105", "110"].map((value) => (
                        <Pressable key={value} style={avcStyles.examChip} onPress={() => onFieldChange("diastolicPressure", value)}>
                          <Text style={avcStyles.examChipText}>{value}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {showGlucoseCorrection ? (
            <View style={avcStyles.correctionCardBlue}>
              <Text style={avcStyles.correctionTitleBlue}>Reavaliação após correções</Text>
              <Text style={avcStyles.correctionLineBlue}>
                Registre os valores pós-correção para liberar ou manter bloqueio da trombólise.
              </Text>
              <View style={avcStyles.postCorrectionField}>
                <Text style={avcStyles.postCorrectionLabel}>Glicemia pós-correção (mg/dL)</Text>
                <TextInput
                  value={fieldValue(auxiliaryPanel, "glucoseCurrent")}
                  onChangeText={(value) => onFieldChange("glucoseCurrent", value)}
                  keyboardType="numbers-and-punctuation"
                  style={avcStyles.postCorrectionInput}
                  placeholder="Digite a glicemia pós-correção"
                  placeholderTextColor="#64748b"
                />
                <View style={avcStyles.examOptionsRow}>
                  {["80", "120", "200", "300"].map((value) => (
                    <Pressable key={value} style={avcStyles.examChip} onPress={() => onFieldChange("glucoseCurrent", value)}>
                      <Text style={avcStyles.examChipText}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={avcStyles.statusDecisionCard}>
                <View style={avcStyles.statusDecisionHeader}>
                  <Text style={avcStyles.statusDecisionTitle}>Registrar glicemia pós-correção</Text>
                  <View style={avcStyles.statusDecisionBadge}>
                    <Text style={avcStyles.statusDecisionBadgeText}>Decisão</Text>
                  </View>
                </View>
                <Text style={avcStyles.statusDecisionText}>
                  Quando a glicemia entrar na faixa 70-400 mg/dL e for registrada no card, o critério glicêmico é reavaliado automaticamente.
                </Text>
              </View>
            </View>
          ) : null}

          {showThrombolyticCalculator ? (
            <View style={avcStyles.calculatorCard}>
              <Text style={avcStyles.calculatorTitle}>Calculadora do trombolítico</Text>
              <View style={avcStyles.examOptionsRow}>
                {THROMBOLYTICS.map((drug) => (
                  <Pressable
                    key={drug.id}
                    style={[avcStyles.examChip, selectedThrombolyticId === drug.id && avcStyles.examChipActive]}
                    onPress={() => onFieldChange("selectedThrombolyticId", drug.id)}>
                    <Text style={[avcStyles.examChipText, selectedThrombolyticId === drug.id && avcStyles.examChipTextActive]}>
                      {drug.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={avcStyles.calculatorDrugLabel}>{selectedThrombolytic.label}</Text>
              {doseRecommendation?.lines.map((line) => (
                <Text key={line} style={avcStyles.calculatorLine}>• {line}</Text>
              ))}
            </View>
          ) : null}

          <View style={avcStyles.statusDecisionCardBlue}>
            <View style={avcStyles.statusDecisionHeader}>
              <Text style={avcStyles.statusDecisionTitleBlue}>{thrombectomyRecommendation?.title || "Trombectomia em revisão"}</Text>
              <View style={avcStyles.statusDecisionBadgeBlue}>
                <Text style={avcStyles.statusDecisionBadgeTextBlue}>Decisão</Text>
              </View>
            </View>
            <Text style={avcStyles.statusDecisionTextBlue}>
              {thrombectomyRecommendation?.lines?.[0] || "Reavaliar imagem e evolução neurológica; se houver suspeita de grande vaso, não atrasar CTA/transferência."}
            </Text>
          </View>
        </View>
      ) : null}

      {activeTab === 4 && auxiliaryPanel?.recommendations?.length ? (
        <View style={avcStyles.recommendationsBlock}>
          {auxiliaryPanel.recommendations.map((recommendation) => (
            <View
              key={`${recommendation.title}-${recommendation.priority}`}
              style={[
                avcStyles.recommendationCard,
                recommendation.tone === "warning" && avcStyles.recommendationWarn,
                recommendation.tone === "danger" && avcStyles.recommendationDanger,
              ]}>
              <Text style={avcStyles.recommendationEyebrow}>
                {recommendation.title.startsWith("Calculadora") ? "Dose calculada" : "Leitura do caso"}
              </Text>
              <Text style={avcStyles.recommendationTitle}>{recommendation.title}</Text>
              {recommendation.lines.map((line) => (
                <Text key={line} style={avcStyles.recommendationLine}>
                  • {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {activeTab === 5 && !isQuestion && !isEnd ? (
        <ModuleFinishPanel
          summaryTitle="Fechamento do caso AVC"
          destination={metricValue(encounterSummary, "Destino")}
          summaryLines={finishSummaryLines}
          infoTitle="Pontos obrigatórios de segurança"
          infoLines={[
            "Nunca assumir dado ausente como normal: se imagem, janela, contraindicações ou NIHSS estiverem incompletos, a decisão deve permanecer em revisão.",
            "Trombólise só deve ser mantida quando hemorragia estiver excluída, janela validada e bloqueios resolvidos/documentados.",
            "Em hemorragia, o fluxo muda automaticamente para controle pressórico, reversão de anticoagulação e destino intensivo.",
            "Toda decisão final deve ser separada da recomendação do sistema e acompanhada de dupla checagem em condutas de alto risco.",
          ]}
          narrative={fieldValue(auxiliaryPanel, "auditComment")}
        />
      ) : null}

      {isQuestion ? (
        <View style={{ gap: 10 }}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </Pressable>
          ) : null}
          <DecisionGrid
            options={options.map((option) => ({
              id: option,
              label: formatOptionLabel(option),
              sublabel: getOptionSublabel(option),
            }))}
            title={state.text}
            onSelect={(id) => onRunTransition(id)}
          />
        </View>
      ) : null}

      {!isQuestion && !isEnd && !isCurrentStateTimerRunning ? (
        <View style={styles.primaryActions}>
          {activeTab === 0 ? (
            <Pressable style={styles.backButton} onPress={onExitModule}>
              <Text style={styles.backButtonText}>← Módulos</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.backButton} onPress={() => setActiveTab((tab) => tab - 1)}>
              <Text style={styles.backButtonText}>← Anterior</Text>
            </Pressable>
          )}
          <Pressable style={styles.primaryButton} onPress={handleNextStep}>
            <Text style={styles.primaryButtonText}>
              {isLastTab ? "Finalizar" : `Próximo: ${nextTabLabel ?? "…"}`}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
        />
      ) : null}
    </ModuleFlowLayout>
  );
}

const avcStyles = StyleSheet.create({
  wrap: {},
  nihssCard: {
    marginBottom: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#cfe7de",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  nihssHeader: {
    gap: 12,
  },
  assessmentStatusCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
    padding: 18,
    gap: 8,
  },
  assessmentStatusEyebrow: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#064e3b",
  },
  assessmentStatusHeadline: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: "#052e2b",
  },
  assessmentStatusLine: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "500",
    color: "#083344",
  },
  assessmentStatusFootnote: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#0f766e",
  },
  hemoPanel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 12,
  },
  hemoPanelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  hemoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  hemoCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 240,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#f8fafc",
    padding: 14,
    gap: 10,
  },
  hemoCardReadOnly: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  hemoCardLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#334155",
  },
  hemoCardValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  hemoCardHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#475569",
  },
  nihssBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
    padding: 14,
    gap: 2,
  },
  nihssBannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#166534",
  },
  nihssBannerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: "#166534",
  },
  nihssIntro: {
    gap: 4,
  },
  nihssIntroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  nihssIntroText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "500",
    color: "#64748b",
  },
  nihssScaleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  nihssScaleCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 10,
  },
  nihssScaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  nihssScaleTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    color: "#1f2937",
  },
  nihssHelpPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nihssHelpPillActive: {
    backgroundColor: "#e2e8f0",
    borderColor: "#94a3b8",
  },
  nihssHelpPillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  nihssHelpPillTextActive: {
    color: "#0f172a",
  },
  nihssOptionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nihssScoreBtn: {
    minWidth: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  nihssScoreBtnActive: {
    borderColor: "#0f172a",
    backgroundColor: "#0f172a",
  },
  nihssScoreBtnText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#334155",
  },
  nihssScoreBtnTextActive: {
    color: "#ffffff",
  },
  nihssSelectedText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#475569",
  },
  nihssHelpText: {
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    padding: 10,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#475569",
  },
  customPanel: {
    gap: 14,
    marginBottom: 10,
  },
  customPanelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  toggleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toggleCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleCardActive: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  toggleLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#334155",
  },
  toggleTextBlock: {
    flex: 1,
    gap: 4,
  },
  toggleSubLabel: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#64748b",
  },
  switchTrack: {
    width: 68,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  switchTrackOn: {
    backgroundColor: "#2563eb",
  },
  switchThumb: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  switchThumbOn: {
    alignSelf: "flex-end",
  },
  condutaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  condutaCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 260,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    padding: 14,
  },
  condutaDanger: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },
  condutaWarning: {
    borderColor: "#fde68a",
    backgroundColor: "#fff7ed",
  },
  condutaInfo: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  condutaViolet: {
    borderColor: "#d8b4fe",
    backgroundColor: "#faf5ff",
  },
  condutaText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: "#334155",
  },
  statusDecisionCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#facc15",
    backgroundColor: "#fffdf5",
    padding: 16,
    gap: 8,
  },
  statusDecisionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusDecisionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#422006",
  },
  statusDecisionBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#facc15",
    backgroundColor: "#fff7cc",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDecisionBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#854d0e",
  },
  statusDecisionText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: "#57534e",
  },
  priorityBanner: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f43f5e",
    backgroundColor: "#fff1f2",
    padding: 16,
    gap: 4,
  },
  priorityBannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#881337",
  },
  priorityBannerText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#7f1d1d",
  },
  sectionStripDanger: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionStripDangerText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#9f1239",
  },
  sectionStripWarning: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionStripWarningText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#92400e",
  },
  sectionStripInfo: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionStripInfoText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  reperfusionStateCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f59e0b",
    backgroundColor: "#fff7ed",
    padding: 16,
    gap: 4,
  },
  reperfusionStateTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#78350f",
    textTransform: "uppercase",
  },
  reperfusionStateText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#78350f",
  },
  criteriaCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#a5b4fc",
    backgroundColor: "#eef2ff",
    padding: 16,
    gap: 4,
  },
  criteriaTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#312e81",
    textTransform: "uppercase",
  },
  criteriaLine: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#312e81",
  },
  pendingCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fb7185",
    backgroundColor: "#fff1f2",
    padding: 16,
    gap: 6,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#881337",
    textTransform: "uppercase",
  },
  pendingLine: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#7f1d1d",
  },
  correctionCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f59e0b",
    backgroundColor: "#fffaf0",
    padding: 16,
    gap: 8,
  },
  correctionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#9a3412",
  },
  correctionLine: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#7c2d12",
  },
  correctionCardBlue: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#7dd3fc",
    backgroundColor: "#ecfeff",
    padding: 16,
    gap: 8,
  },
  correctionTitleBlue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#155e75",
  },
  correctionLineBlue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#0f766e",
  },
  postCorrectionPanel: {
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fed7aa",
    padding: 14,
    gap: 10,
  },
  postCorrectionEyebrow: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f766e",
  },
  postCorrectionHint: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#475569",
  },
  postCorrectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  postCorrectionField: {
    flex: 1,
    minWidth: 260,
    gap: 8,
  },
  postCorrectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
  },
  postCorrectionInput: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  calculatorCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#d8b4fe",
    backgroundColor: "#faf5ff",
    padding: 16,
    gap: 8,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#581c87",
  },
  calculatorDrugLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#4c1d95",
  },
  calculatorLine: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#5b21b6",
  },
  statusDecisionCardBlue: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#7dd3fc",
    backgroundColor: "#f0f9ff",
    padding: 16,
    gap: 8,
  },
  statusDecisionTitleBlue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1e3a8a",
  },
  statusDecisionBadgeBlue: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#7dd3fc",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDecisionBadgeTextBlue: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1d4ed8",
  },
  statusDecisionTextBlue: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: "#475569",
  },
  examGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  examCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 260,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 8,
  },
  examCardHeader: {
    gap: 4,
  },
  examCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1f2937",
  },
  examCardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  examCardHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  examOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  examChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  examChipActive: {
    borderColor: "#0f172a",
    backgroundColor: "#0f172a",
  },
  examChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  examChipTextActive: {
    color: "#ffffff",
  },
  labGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  labCard: {
    flexBasis: "24%",
    flexGrow: 1,
    minWidth: 200,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 10,
  },
  labTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#334155",
  },
  labValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labAdjustBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  labAdjustBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#334155",
  },
  labValueBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  labValueText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
  },
  labValueBoxWide: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  quickResultsCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#f8fafc",
    padding: 14,
    gap: 4,
  },
  quickResultsTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#334155",
  },
  quickResultsLine: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#475569",
  },
  quickResultsFootnote: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#475569",
  },
  recommendationsBlock: {
    gap: 10,
    marginBottom: 10,
  },
  recommendationCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 8,
  },
  recommendationWarn: {
    borderColor: "#f5d58f",
    backgroundColor: "#fff9eb",
  },
  recommendationDanger: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },
  recommendationEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  recommendationTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: "#0f172a",
  },
  recommendationLine: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#334155",
  },
});
