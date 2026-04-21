import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import type { AuxiliaryPanel, ClinicalLogEntry, EncounterSummary, ProtocolState } from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, getOptionSublabel } from "./protocol-screen-utils";
import { ModuleFinishPanel, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";
import { calculateThrombolyticDose } from "../../avc/calculators";
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

type CustomOption = { label: string; value: string; detail?: string };
type CustomSheetState = {
  fieldId: string;
  title: string;
  value: string;
  options: CustomOption[];
  allowOther?: boolean;
  subtitle?: string;
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

function panelField(panel: AuxiliaryPanel | null, id: string) {
  return panel?.fields.find((field) => field.id === id) ?? null;
}

function fieldDisplayValue(panel: AuxiliaryPanel | null, id: string, fallback = "Selecionar") {
  const field = panelField(panel, id);
  if (!field) return fallback;
  const rawValue = field.value?.trim() ?? "";
  if (!rawValue) return field.placeholder ?? fallback;
  const matchedPreset = field.presets?.find((preset) => preset.value === rawValue);
  return matchedPreset?.label ?? rawValue;
}

function displayValueFromOptions(
  value: string,
  options: [string, string][],
  fallback = "Selecionar"
) {
  const normalized = value.trim();
  if (!normalized) return fallback;
  return options.find(([, optionValue]) => optionValue === normalized)?.[0] ?? normalized.replaceAll("_", " ");
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
  const normalized = value.trim();
  if (!normalized) return null;
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

function parseNumericField(panel: AuxiliaryPanel | null, id: string) {
  const rawValue = fieldValue(panel, id).trim().replace(",", ".");
  if (!rawValue) return null;
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function joinClinicalLines(lines: string[]) {
  return lines.filter(Boolean).join(" ");
}

function consciousnessSuggestsAirwayRisk(consciousnessLevel: string) {
  return ["Obnubilado", "Sem resposta adequada"].includes(consciousnessLevel);
}

function consciousnessNeedsCloseAirwayWatch(consciousnessLevel: string) {
  return ["Sonolento", "Confuso / não obedece plenamente"].includes(consciousnessLevel);
}

function buildStabilizationItems(panel: AuxiliaryPanel | null, onFieldChange: (fieldId: string, value: string) => void, onPresetApply: (fieldId: string, value: string) => void) {
  const airwayProtection = fieldValue(panel, "airwayProtection") === "yes";
  const abcInstability = fieldValue(panel, "abcInstability") === "yes";
  const oxygenSaturation = parseNumericField(panel, "oxygenSaturation");
  const systolic = parseNumericField(panel, "systolicPressure");
  const diastolic = parseNumericField(panel, "diastolicPressure");
  const heartRate = parseNumericField(panel, "heartRate");
  const respiratoryRate = parseNumericField(panel, "respiratoryRate");
  const glucoseCurrent = parseNumericField(panel, "glucoseCurrent");
  const consciousnessLevel = fieldValue(panel, "consciousnessLevel");
  const monitoringValue = fieldValue(panel, "monitoring");
  const venousAccess = fieldValue(panel, "venousAccess");
  const stabilizationActions = fieldValue(panel, "stabilizationActions");
  const map =
    systolic != null && diastolic != null
      ? Math.round((systolic + 2 * diastolic) / 3)
      : null;
  const hasAspirationRisk = hasToken(stabilizationActions, "Aspiração de vias aéreas");
  const highAirwayRiskFromConsciousness = consciousnessSuggestsAirwayRisk(consciousnessLevel);
  const watchAirwayFromConsciousness = consciousnessNeedsCloseAirwayWatch(consciousnessLevel);
  const hasMonitorCardiac = hasToken(monitoringValue, "Monitor cardíaco");
  const hasMonitorSpo2 = hasToken(monitoringValue, "SpO₂ contínua");
  const hasMonitorBp = hasToken(monitoringValue, "PA seriada");
  const hasSerialGlucose = hasToken(monitoringValue, "Glicemia seriada");
  const likelyNeedsEcg =
    (heartRate != null && (heartRate < 50 || heartRate > 120)) ||
    /FA|DAC|arritmia|dor torácica/i.test(`${fieldValue(panel, "comorbidities")} ${fieldValue(panel, "symptoms")}`);

  return [
    {
      id: "airway",
      label: "Risco de via aérea (proteção inadequada/rebaixamento)",
      hint: "Marque se o paciente não protege via aérea, rebaixou ou tem risco alto de broncoaspiração.",
      active: airwayProtection,
      toggle: () => onFieldChange("airwayProtection", airwayProtection ? "no" : "yes"),
      detail: airwayProtection
        ? joinClinicalLines([
            "Ação prioritária: via aérea ameaçada neste momento.",
            consciousnessLevel ? `Estado neurológico registrado: ${consciousnessLevel}.` : "",
            highAirwayRiskFromConsciousness
              ? "O nível de consciência já sugere alto risco de não proteger via aérea. Preparar pré-oxigenação, aspiração e intubação se houver secreções, vômitos, queda adicional da consciência ou falha para manter oxigenação/ventilação."
              : "Manter cabeceira a 30°, aspiração pronta, pré-oxigenação e preparo para via aérea avançada se o paciente não proteger secreções, vomitar ou rebaixar mais.",
            "No AVC, o NIHSS ajuda a estimar consciência, mas não existe corte fixo de NIHSS para intubação: a decisão deve se basear em proteção real de via aérea, bulbar/disfagia, vômitos/broncoaspiração e oxigenação/ventilação.",
            "Não avançar para reperfusão sem estabilizar esse risco.",
          ])
        : joinClinicalLines([
            "Sem falha de proteção de via aérea documentada agora.",
            consciousnessLevel ? `Último nível de consciência: ${consciousnessLevel}.` : "",
            highAirwayRiskFromConsciousness
              ? "Mesmo sem marcação manual, esse nível de consciência exige reavaliação imediata da proteção de via aérea. Se houver secreções, vômitos, disfagia importante ou queda ventilatória, tratar como possível indicação de via aérea avançada."
              : watchAirwayFromConsciousness
                ? "Esse nível de consciência pede vigilância estreita. Sonolência/confusão isolada não impõe intubação, mas deve disparar reavaliação se houver piora, vômitos ou incapacidade de obedecer/comunicar."
                : "Se houver rebaixamento, vômitos ou incapacidade de proteger secreções, reclassifique este item imediatamente antes da próxima etapa.",
            "No AVC, a indicação de intubação para proteção de via aérea depende do exame clínico atual e não de um valor isolado do NIHSS.",
          ]),
      tone: "danger" as const,
    },
    {
      id: "hypoxemia",
      label: "Hipoxemia / necessidade de O₂",
      hint: "Marque quando houver necessidade de oxigênio suplementar ou suspeita clínica de hipoxemia nesta etapa.",
      active: hasToken(stabilizationActions, "Oxigênio suplementar"),
      toggle: () => onPresetApply("stabilizationActions", "Oxigênio suplementar"),
      detail:
        hasToken(stabilizationActions, "Oxigênio suplementar")
          ? oxygenSaturation != null
            ? joinClinicalLines([
                `Oxigênio suplementar acionado com SpO₂ atual ${oxygenSaturation}%.`,
                "Objetivo imediato: levar para 94-98% com O₂ suplementar e reavaliar em 5-10 min.",
                oxygenSaturation < 90
                  ? "A dessaturação é importante. Se não houver resposta rápida ao dispositivo inicial, escalar oferta de O₂, reavaliar ventilação e considerar via aérea avançada conforme proteção de via aérea e esforço respiratório."
                  : oxygenSaturation < 94
                    ? "Se a hipoxemia for leve/moderada e o paciente proteger via aérea, começar com suporte de menor complexidade e titular conforme resposta; se não atingir a meta, escalar dispositivo e reavaliar ventilação."
                    : "Se a SpO₂ já está >94%, evitar excesso de oxigênio e manter apenas o suporte necessário.",
                respiratoryRate != null ? `FR atual ${respiratoryRate}/min; investigar esforço ventilatório, broncoaspiração ou fadiga.` : "",
                "No AVC isquêmico, oxigênio suplementar deve manter saturação >94%; em paciente não hipoxêmico, não há benefício em oferecer O₂ de rotina.",
              ])
            : "Oxigênio suplementar já foi marcado como necessário nesta etapa. Documente a SpO₂ assim que disponível; a meta prática é manter saturação >94% e escalar suporte se o paciente continuar hipoxêmico ou perder proteção de via aérea."
          : oxygenSaturation != null
            ? joinClinicalLines([
                `SpO₂ atual ${oxygenSaturation}%`,
                "Marque este card se foi necessário iniciar oxigênio suplementar ou se a avaliação clínica apontou hipoxemia durante estabilização, imagem ou transporte.",
                oxygenSaturation >= 94
                  ? "Sem hipoxemia documentada, o AVC isquêmico não pede oxigênio de rotina."
                  : "",
              ])
            : "SpO₂ ainda não informada. Sem saturação registrada, a estabilização respiratória fica incompleta antes da decisão de reperfusão.",
      tone: "info" as const,
    },
    {
      id: "vomit",
      label: "Vômitos persistentes / risco de broncoaspiração",
      hint: "Marque quando houver vômitos, sialorreia ou risco prático de aspiração.",
      active: hasAspirationRisk,
      toggle: () => onPresetApply("stabilizationActions", "Aspiração de vias aéreas"),
      detail: hasAspirationRisk
        ? "Risco de broncoaspiração já sinalizado. Manter jejum, cabeceira elevada, aspiração disponível e antiemético conforme protocolo; reavaliar necessidade de proteção de via aérea se houver recorrência."
        : "Sem broncoaspiração registrada agora. Se surgirem vômitos, sialorreia importante ou queda do nível de consciência, acione este bloco e trate antes de seguir o fluxo.",
      tone: "warning" as const,
    },
    {
      id: "hemo",
      label: "Instabilidade hemodinâmica (perfusão inadequada)",
      hint: "Marque se a prioridade é restaurar perfusão antes de pensar em trombólise.",
      active: abcInstability,
      toggle: () => onFieldChange("abcInstability", abcInstability ? "no" : "yes"),
      detail: abcInstability
        ? joinClinicalLines([
            "Instabilidade ABC já documentada.",
            systolic != null && diastolic != null ? `PA atual ${systolic}/${diastolic} mmHg${map != null ? ` (PAM ${map})` : ""}.` : "",
            heartRate != null ? `FC ${heartRate} bpm.` : "",
            map != null && map < 65
              ? "Prioridade: restaurar perfusão e investigar causa de hipoperfusão/choque, porque AVC isolado raramente explica instabilidade hemodinâmica importante."
              : (systolic != null && systolic >= 185) || (diastolic != null && diastolic >= 110)
                ? "Prioridade: controlar a instabilidade hemodinâmica e a pressão criticamente elevada antes da trombólise, além de investigar causas sistêmicas associadas."
                : "Prioridade: esclarecer e tratar a instabilidade hemodinâmica dominante antes da trombólise, porque AVC isolado raramente explica esse grau de repercussão sistêmica.",
          ])
        : joinClinicalLines([
            systolic != null && diastolic != null ? `Hemodinâmica registrada: PA ${systolic}/${diastolic} mmHg${map != null ? ` (PAM ${map})` : ""}.` : "Sem PA completa registrada.",
            map != null && map < 65 ? "PAM abaixo de 65 sugere perfusão inadequada e pede reclassificação imediata deste item." : "Sem instabilidade hemodinâmica marcada até aqui.",
          ]),
      tone: "violet" as const,
    },
    {
      id: "access",
      label: "Dois acessos venosos calibrosos",
      hint: "Marque quando já houver dois acessos periféricos confiáveis e funcionantes.",
      active: venousAccess === "2 acessos periféricos",
      toggle: () => onFieldChange("venousAccess", venousAccess === "2 acessos periféricos" ? "" : "2 acessos periféricos"),
      detail: venousAccess === "2 acessos periféricos"
        ? "Acesso venoso já adequado para coleta, anti-hipertensivos, correção de glicemia e eventual trombólise. Reconfirmar pérvio antes da fase de reperfusão."
        : venousAccess
          ? `Situação atual do acesso: ${venousAccess}. Se ainda não houver dois acessos confiáveis, resolva isso antes da medicação de maior risco.`
          : "Acesso venoso ainda não definido. O ideal é garantir dois acessos periféricos confiáveis antes de avançar para decisões terapêuticas críticas.",
      tone: "neutral" as const,
    },
    {
      id: "monitor",
      label: "Monitorização contínua ativa",
      hint: "Marque quando o caso já estiver em monitor cardíaco, PA seriada e oximetria contínua.",
      active: hasMonitorCardiac || hasMonitorSpo2 || hasMonitorBp,
      toggle: () => onPresetApply("monitoring", "Monitor cardíaco"),
      detail: joinClinicalLines([
        `Monitorização ativa: ${[
          hasMonitorCardiac ? "monitor cardíaco" : "",
          hasMonitorBp ? "PA seriada" : "",
          hasMonitorSpo2 ? "SpO₂ contínua" : "",
          hasSerialGlucose ? "glicemia seriada" : "",
        ].filter(Boolean).join(", ") || "nenhum item crítico registrado"}.`,
        glucoseCurrent != null ? `Glicemia atual ${glucoseCurrent}.` : "",
        !hasMonitorCardiac || !hasMonitorBp || !hasMonitorSpo2
          ? "Para um AVC agudo, o mínimo prático é monitor cardíaco, PA seriada e oximetria contínua durante estabilização, imagem e reperfusão."
          : "Cobertura básica de monitorização já documentada.",
      ]),
      tone: "neutral" as const,
    },
    {
      id: "ecg",
      label: "ECG já realizado e revisado",
      hint: likelyNeedsEcg
        ? "Marque quando o ECG já tiver sido feito; neste caso ele tem utilidade maior agora."
        : "Marque quando o ECG já tiver sido feito e revisado durante a estabilização.",
      active: hasToken(stabilizationActions, "ECG realizado e revisado"),
      toggle: () => onPresetApply("stabilizationActions", "ECG realizado e revisado"),
      detail: hasToken(stabilizationActions, "ECG realizado e revisado")
        ? joinClinicalLines([
            "ECG já marcado como realizado e revisado nesta etapa.",
            heartRate != null ? `FC atual ${heartRate} bpm.` : "",
            likelyNeedsEcg
              ? "Este perfil aumenta a utilidade do ECG para pesquisar FA, arritmia ou isquemia associada que mudem a interpretação do caso e do destino."
              : "Use esse registro para documentar que o rastreio elétrico já foi feito durante a estabilização.",
          ])
        : likelyNeedsEcg
          ? "Há maior utilidade clínica para ECG agora; marque este card depois que o exame for feito e revisado."
          : "Sem gatilho forte para ECG urgente a partir dos dados atuais, mas ele continua útil se houver suspeita de FA, arritmia, dor torácica ou instabilidade sem explicação clara.",
      tone: "neutral" as const,
    },
  ];
}

function labState(value: string, comparator: (n: number) => boolean) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "—";
  return comparator(parsed) ? "SIM" : "NÃO";
}

function normalizePlateletsValue(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed < 1000 ? parsed * 1000 : parsed;
}

function parseClock(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function dayContextOffsetUi(dayContext: string) {
  if (dayContext === "today") return 0;
  if (dayContext === "yesterday") return -1;
  if (dayContext === "day_before_yesterday") return -2;
  return null;
}

function elapsedMinutesWithContext(startDayContext: string, start: string, endDayContext: string, end: string) {
  const s = parseClock(start);
  const e = parseClock(end);
  const sd = dayContextOffsetUi(startDayContext);
  const ed = dayContextOffsetUi(endDayContext);
  if (s == null || e == null || sd == null || ed == null) return null;
  return (ed - sd) * 24 * 60 + (e - s);
}

function resolveReliableTimeAnchorUi(panel: AuxiliaryPanel | null) {
  const lkwTime = fieldValue(panel, "lastKnownWellTime");
  const lkwDay = fieldValue(panel, "lastKnownWellDayContext");
  if (lkwTime.trim() && lkwDay !== "unknown") {
    return { dayContext: lkwDay, time: lkwTime, source: "lkw" as const };
  }

  const onsetTime = fieldValue(panel, "symptomOnsetTime");
  const onsetDay = fieldValue(panel, "symptomOnsetDayContext");
  if (onsetTime.trim() && onsetDay !== "unknown") {
    return { dayContext: onsetDay, time: onsetTime, source: "onset" as const };
  }

  return null;
}

function inferPendingContraStatus(panel: AuxiliaryPanel | null, definitionId: string) {
  const ctResult = fieldValue(panel, "ctResult");
  const arrivalTime = fieldValue(panel, "arrivalTime");
  const arrivalDay = fieldValue(panel, "arrivalDayContext");
  const timePrecision = fieldValue(panel, "timePrecision");
  const timeAnchor = resolveReliableTimeAnchorUi(panel);
  const antithrombotics = fieldValue(panel, "antithrombotics");
  const usesHighRiskAnticoagulant =
    hasToken(antithrombotics, "Varfarina") ||
    hasToken(antithrombotics, "DOAC") ||
    hasToken(antithrombotics, "Heparina recente");
  const hasCoagLabs =
    fieldValue(panel, "inr").trim() !== "" ||
    fieldValue(panel, "aptt").trim() !== "" ||
    fieldValue(panel, "platelets").trim() !== "";
  const ctaResult = fieldValue(panel, "ctaResult");
  const lvoSuspicion = fieldValue(panel, "lvoSuspicion") === "yes";
  const ctaDone = fieldValue(panel, "ctaPerformed") === "yes" || ctaResult.trim() !== "";

  if (definitionId === "unknown_time") {
    const arrivalKnown = arrivalTime.trim() && arrivalDay !== "unknown";
    return !arrivalKnown || !timeAnchor || (timePrecision === "unknown" && !timeAnchor);
  }

  if (definitionId === "pending_ct") {
    return !ctResult.trim() || ctResult === "inconclusivo";
  }

  if (definitionId === "pending_labs_anticoag") {
    return usesHighRiskAnticoagulant && !hasCoagLabs;
  }

  if (definitionId === "needs_lvo_imaging") {
    return lvoSuspicion && !ctaDone;
  }

  return fieldValue(panel, `contra_${definitionId}_status`) === "present";
}

function formatTimingLabel(dayContext: string, time: string) {
  const normalizedTime = time.trim();
  const dayLabel =
    dayContext === "today"
      ? "hoje"
      : dayContext === "yesterday"
        ? "ontem"
        : dayContext === "day_before_yesterday"
          ? "anteontem"
          : dayContext === "unknown"
            ? "dia incerto"
            : "";
  if (dayLabel && normalizedTime) return `${dayLabel} às ${normalizedTime}`;
  return normalizedTime || dayLabel || "";
}

function buildFocalSummary(panel: AuxiliaryPanel | null, nihssSummary: ReturnType<typeof buildNihssSummary>) {
  const laterality = fieldValue(panel, "laterality");
  const disabling =
    fieldValue(panel, "disablingDeficit") === "yes"
      ? "déficit incapacitante"
      : fieldValue(panel, "disablingDeficit") === "no"
        ? "déficit não incapacitante"
        : "";
  const nihssPart = nihssSummary.filledCount ? `NIHSS ${nihssSummary.total}` : "";
  return [laterality, disabling, nihssPart].filter(Boolean).join(" · ") || "NIHSS e lateralidade pendentes";
}

function nihssDisplayLabel(id: string, fallback: string) {
  const labels: Record<string, string> = {
    nihss1a: "Nível de consciência (alerta ou rebaixado)",
    nihss1b: "Orientação (mês e idade)",
    nihss1c: "Comandos (olhos e mão)",
    nihss2: "Movimento dos olhos (desvio do olhar)",
    nihss3: "Campo visual (hemianopsia)",
    nihss4: "Face (assimetria facial)",
    nihss5a: "Braço esquerdo (força)",
    nihss5b: "Braço direito (força)",
    nihss6a: "Perna esquerda (força)",
    nihss6b: "Perna direita (força)",
    nihss7: "Ataxia (coordenação)",
    nihss8: "Sensibilidade (perda sensitiva)",
    nihss9: "Linguagem (afasia)",
    nihss10: "Disartria (articulação da fala)",
    nihss11: "Negligência / extinção (desatenção a um lado)",
  };
  return labels[id] ?? fallback.replace(/^\d+[a-z]?\.?\s*/i, "");
}

function buildNihssSheetSubtitle(itemId: string) {
  const item = NIHSS_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return "Selecione a pontuação que mais descreve o exame clínico.";
  return `${nihssDisplayLabel(item.id, item.label)}. ${item.description}`;
}

function buildAssessmentStatus(panel: AuxiliaryPanel | null, nihssSummary: ReturnType<typeof buildNihssSummary>) {
  const glucose = Number(fieldValue(panel, "glucoseInitial"));
  const systolic = Number(fieldValue(panel, "systolicPressure"));
  const diastolic = Number(fieldValue(panel, "diastolicPressure"));
  const mimic = fieldValue(panel, "strokeMimicConcern") === "yes";
  const hasNeurologicDeficit = nihssSummary.filledCount > 0 || fieldValue(panel, "disablingDeficit") === "yes";

  let headline = "Avaliação ainda incompleta: faltam dados para sustentar a suspeita clínica.";
  if (hasNeurologicDeficit && mimic) {
    headline = "Há déficit focal, mas existe possibilidade de mimetizador: reavaliar antes de assumir AVC isquêmico.";
  } else if (hasNeurologicDeficit && glucose > 0 && glucose < 70) {
    headline = "Déficit focal com hipoglicemia: corrigir glicemia e repetir exame neurológico.";
  } else if (hasNeurologicDeficit && ((systolic >= 185) || (diastolic >= 110))) {
    headline = "Suspeita clínica de AVC sustentada, mas a PA está acima da meta para trombólise.";
  } else if (hasNeurologicDeficit) {
    headline = "Suspeita clínica de AVC sustentada: seguir para imagem e decisão de reperfusão.";
  }

  const missing = [
    !fieldValue(panel, "glucoseInitial") ? "glicemia inicial" : "",
    !fieldValue(panel, "systolicPressure") || !fieldValue(panel, "diastolicPressure") ? "PA" : "",
    nihssSummary.filledCount === 0 ? "NIHSS" : "",
  ].filter(Boolean);

  return {
    headline,
    nihssLine: nihssSummary.filledCount
      ? `NIHSS atual: ${nihssSummary.total} (${nihssSummary.severity.toLowerCase()})`
      : "NIHSS atual: ainda não iniciado",
    symptomLine: `Déficit neurológico documentado: ${hasNeurologicDeficit ? "sim" : "não"}${fieldValue(panel, "laterality") ? ` · lateralidade ${fieldValue(panel, "laterality").toLowerCase()}` : ""}${mimic ? " · mimetizador em revisão" : ""}`,
    missingLine: missing.length ? `Pendências que mudam a leitura: ${missing.join(", ")}` : "",
  };
}

function buildObjectiveThrombolysisCriteria(panel: AuxiliaryPanel | null, nihssSummary: ReturnType<typeof buildNihssSummary>) {
  const ctResult = fieldValue(panel, "ctResult");
  const timeAnchor = resolveReliableTimeAnchorUi(panel);
  const lkwElapsed = timeAnchor
    ? elapsedMinutesWithContext(
        timeAnchor.dayContext,
        timeAnchor.time,
        fieldValue(panel, "arrivalDayContext"),
        fieldValue(panel, "arrivalTime")
      )
    : null;
  const systolic = Number(fieldValue(panel, "systolicPressure"));
  const diastolic = Number(fieldValue(panel, "diastolicPressure"));
  const glucose = Number(fieldValue(panel, "glucoseCurrent") || fieldValue(panel, "glucoseInitial"));
  const weight = Number(fieldValue(panel, "weightKg"));
  const mimicConcern = fieldValue(panel, "strokeMimicConcern") === "yes";
  const disabling = fieldValue(panel, "disablingDeficit") === "yes";
  const hasNeurologicDeficit = nihssSummary.filledCount > 0 || disabling;
  const absolutePresent = CONTRAINDICATIONS
    .filter((item) => item.category === "absolute")
    .filter((item) => autoContraStatus(panel, item.id) ?? fieldValue(panel, `contra_${item.id}_status`) === "present")
    .map((item) => item.name);

  const criteria = [
    {
      label: "TC sem hemorragia",
      status:
        ctResult === "sem_sangramento" ? "ok" : ctResult === "hemorragia" ? "no" : "pending",
      detail:
        ctResult === "sem_sangramento"
          ? "Hemorragia excluída."
          : ctResult === "hemorragia"
            ? "Hemorragia confirmada."
            : "TC ainda não liberou ramo isquêmico com segurança.",
    },
    {
      label: "Janela de 4,5h",
      status: lkwElapsed == null ? "pending" : lkwElapsed <= AVC_WINDOWS.ivTrombolysisMinutes ? "ok" : "no",
      detail:
        lkwElapsed == null
          ? "Horários insuficientes para calcular janela."
          : `${(lkwElapsed / 60).toFixed(1).replace(".0", "")} h desde ${timeAnchor?.source === "onset" ? "o início dos sintomas" : "a última vez normal"}.`,
    },
    {
      label: "PA abaixo de 185/110",
      status:
        !Number.isFinite(systolic) || !Number.isFinite(diastolic)
          ? "pending"
          : systolic <= AVC_WINDOWS.tPaMaxPressure.systolic && diastolic <= AVC_WINDOWS.tPaMaxPressure.diastolic
            ? "ok"
            : "no",
      detail:
        !Number.isFinite(systolic) || !Number.isFinite(diastolic)
          ? "PA ainda não registrada."
          : `PA atual ${systolic}/${diastolic} mmHg.`,
    },
    {
      label: "Glicemia entre 70 e 400 mg/dL",
      status:
        !Number.isFinite(glucose) || glucose <= 0
          ? "pending"
          : glucose >= 70 && glucose <= 400
            ? "ok"
            : "no",
      detail:
        !Number.isFinite(glucose) || glucose <= 0
          ? "Glicemia ainda não registrada."
          : `Glicemia atual ${glucose} mg/dL.`,
    },
    {
      label: "Déficit neurológico documentado",
      status:
        hasNeurologicDeficit
          ? "ok"
          : "no",
      detail:
        hasNeurologicDeficit
          ? `NIHSS preenchido em ${nihssSummary.filledCount}/${NIHSS_ITEMS.length} item(ns).`
          : "NIHSS ainda não documentou déficit neurológico.",
    },
    {
      label: "Sem contraindicação absoluta ativa",
      status: absolutePresent.length ? "no" : "ok",
      detail: absolutePresent.length ? absolutePresent.join(" · ") : "Nenhuma absoluta marcada até agora.",
    },
    {
      label: "Sem mimetizador dominante",
      status: mimicConcern ? "no" : "ok",
      detail: mimicConcern ? "Caso marcado como possível mimetizador." : "Sem mimetizador dominante documentado.",
    },
    {
      label: "Peso disponível para dose",
      status: Number.isFinite(weight) && weight > 0 ? "ok" : "pending",
      detail: Number.isFinite(weight) && weight > 0 ? `${weight} kg registrado.` : "Peso ainda não registrado.",
    },
  ] as const;

  const hasFail = criteria.some((item) => item.status === "no");
  const hasPending = criteria.some((item) => item.status === "pending");
  const summary =
    !hasFail && !hasPending
      ? "Tem critérios objetivos para trombólise com os dados atuais."
      : hasFail
        ? "Não tem critérios objetivos completos para trombólise com os dados atuais."
        : "Ainda não dá para afirmar objetivamente; existem critérios pendentes.";

  return { criteria, summary, hasFail, hasPending };
}

function autoContraStatus(panel: AuxiliaryPanel | null, definitionId: string) {
  const systolic = Number(fieldValue(panel, "systolicPressure"));
  const diastolic = Number(fieldValue(panel, "diastolicPressure"));
  const glucose = Number(fieldValue(panel, "glucoseCurrent") || fieldValue(panel, "glucoseInitial"));
  const ctResult = fieldValue(panel, "ctResult");
  const platelets = normalizePlateletsValue(fieldValue(panel, "platelets"));
  const inr = Number(fieldValue(panel, "inr").replace(",", "."));
  const aptt = Number(fieldValue(panel, "aptt").replace(",", "."));
  const antithrombotics = fieldValue(panel, "antithrombotics");

  if (definitionId === "severe_hypertension") {
    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null;
    return systolic > AVC_WINDOWS.tPaMaxPressure.systolic || diastolic > AVC_WINDOWS.tPaMaxPressure.diastolic;
  }

  if (definitionId === "critical_glucose") {
    if (!Number.isFinite(glucose) || glucose <= 0) return null;
    return glucose < 70 || glucose > 400;
  }

  if (definitionId === "ct_hemorrhage") {
    if (!ctResult.trim()) return null;
    return ctResult === "hemorragia";
  }

  if (definitionId === "known_coagulopathy") {
    const hasLabBlock =
      (platelets != null && platelets > 0 && platelets < 100000) ||
      (Number.isFinite(inr) && inr > 1.7) ||
      (Number.isFinite(aptt) && aptt > 40);
    const hasUnreversedHighRiskAnticoagulant =
      hasToken(antithrombotics, "DOAC") || hasToken(antithrombotics, "Heparina recente");
    if (!hasLabBlock && !hasUnreversedHighRiskAnticoagulant) return null;
    return hasLabBlock || hasUnreversedHighRiskAnticoagulant;
  }

  return null;
}

function autoContraDisplayState(panel: AuxiliaryPanel | null, definitionId: string) {
  const detected = autoContraStatus(panel, definitionId);

  if (definitionId === "ct_hemorrhage") {
    const ctResult = fieldValue(panel, "ctResult");
    if (!ctResult.trim() || ctResult === "inconclusivo") return "pending" as const;
    return detected ? ("detected" as const) : ("clear" as const);
  }

  if (definitionId === "known_coagulopathy") {
    const platelets = fieldValue(panel, "platelets").trim();
    const inr = fieldValue(panel, "inr").trim();
    const aptt = fieldValue(panel, "aptt").trim();
    const antithrombotics = fieldValue(panel, "antithrombotics").trim();
    const hasEvidence = Boolean(platelets || inr || aptt || antithrombotics);
    if (!hasEvidence) return "pending" as const;
    return detected ? ("detected" as const) : ("clear" as const);
  }

  return detected == null ? ("pending" as const) : detected ? ("detected" as const) : ("clear" as const);
}

function recommendationScenarioLabel(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("pós-trombólise") || normalized.includes("pré-trombólise")) return "Trombólise";
  if (normalized.includes("trombectomia") || normalized.includes("trombect")) return "Trombectomia";
  if (normalized.includes("hemorrág")) return "AVC hemorrágico";
  if (normalized.includes("sem trombólise") || normalized.includes("bloqueio corrigível")) return "AVC isquêmico sem reperfusão imediata";
  if (normalized.includes("destino") || normalized.includes("transição") || normalized.includes("uti") || normalized.includes("unidade monitorizada")) return "Destino e monitorização";
  return "Cuidados complementares";
}

function primaryRecommendationGroupLabel(
  ctResult: string,
  ivRecommendationTitle: string,
  thrombectomyRecommendationTitle: string
) {
  if (ctResult === "hemorragia") return "AVC hemorrágico";
  if (ivRecommendationTitle.toLowerCase().includes("pode trombolisar")) return "Trombólise";
  if (ivRecommendationTitle.toLowerCase().includes("precisa corrigir antes")) return "AVC isquêmico sem reperfusão imediata";
  if (
    thrombectomyRecommendationTitle.toLowerCase().includes("transferir") ||
    thrombectomyRecommendationTitle.toLowerCase().includes("depende de neurologia")
  ) {
    return "Trombectomia";
  }
  return "Destino e monitorização";
}

function recommendationGroupThemeStyle(label: string) {
  switch (label) {
    case "Trombólise":
      return {
        group: avcStyles.recommendationGroupThrombolysis,
        title: avcStyles.recommendationGroupTitleThrombolysis,
        badge: avcStyles.recommendationGroupBadgeThrombolysis,
        badgeText: avcStyles.recommendationGroupBadgeTextThrombolysis,
      };
    case "Trombectomia":
      return {
        group: avcStyles.recommendationGroupThrombectomy,
        title: avcStyles.recommendationGroupTitleThrombectomy,
        badge: avcStyles.recommendationGroupBadgeThrombectomy,
        badgeText: avcStyles.recommendationGroupBadgeTextThrombectomy,
      };
    case "AVC hemorrágico":
      return {
        group: avcStyles.recommendationGroupHemorrhagic,
        title: avcStyles.recommendationGroupTitleHemorrhagic,
        badge: avcStyles.recommendationGroupBadgeHemorrhagic,
        badgeText: avcStyles.recommendationGroupBadgeTextHemorrhagic,
      };
    case "AVC isquêmico sem reperfusão imediata":
      return {
        group: avcStyles.recommendationGroupIschemicReview,
        title: avcStyles.recommendationGroupTitleIschemicReview,
        badge: avcStyles.recommendationGroupBadgeIschemicReview,
        badgeText: avcStyles.recommendationGroupBadgeTextIschemicReview,
      };
    default:
      return {
        group: avcStyles.recommendationGroupDestination,
        title: avcStyles.recommendationGroupTitleDestination,
        badge: avcStyles.recommendationGroupBadgeDestination,
        badgeText: avcStyles.recommendationGroupBadgeTextDestination,
      };
  }
}

function buildHeroDetails(panel: AuxiliaryPanel | null, encounterSummary: EncounterSummary, activeTab: number) {
  const recommendations = panel?.recommendations ?? [];
  const ivCard = recommendations[0];
  const blockers = ivCard ? extractRecommendationLines(ivCard.lines, "Bloqueio:") : [];
  const corrections = ivCard ? extractRecommendationLines(ivCard.lines, "Correção:") : [];
  const focalSummary = buildFocalSummary(panel, buildNihssSummary(panel));
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
        { label: "Última vez normal", value: formatTimingLabel(fieldValue(panel, "lastKnownWellDayContext"), fieldValue(panel, "lastKnownWellTime")) || "Pendente", accent: "#0f766e" },
        { label: "Chegada", value: formatTimingLabel(fieldValue(panel, "arrivalDayContext"), fieldValue(panel, "arrivalTime")) || "Pendente", accent: "#0369a1" },
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
          : "Complete o NIHSS, registre a lateralidade e deixe explícito se o déficit é incapacitante.",
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
      badgeText: fieldValue(panel, "ctResult")
        ? `TC: ${displayValueFromOptions(fieldValue(panel, "ctResult"), [
            ["Sem sangramento", "sem_sangramento"],
            ["Hemorragia", "hemorragia"],
            ["Inconclusivo", "inconclusivo"],
          ])}`
        : "TC sem contraste pendente",
      subtitle: fieldValue(panel, "ctResult")
        ? examMissing.length
          ? `Imagem inicial registrada; ainda faltam ${examMissing.join(", ")} para completar o suporte diagnóstico.`
          : "Imagem e laboratório crítico já documentados para sustentar a decisão."
        : "Sem TC sem contraste documentada, esta fase ainda não responde a pergunta clínica principal.",
      metrics: [
        {
          label: "TC sem contraste",
          value: fieldValue(panel, "ctResult")
            ? displayValueFromOptions(fieldValue(panel, "ctResult"), [
                ["Sem sangramento", "sem_sangramento"],
                ["Hemorragia", "hemorragia"],
                ["Inconclusivo", "inconclusivo"],
              ])
            : "Pendente",
          accent: "#be123c",
        },
        { label: "Sinais precoces", value: fieldValue(panel, "earlyIschemiaSigns") || "Não descritos", accent: "#0369a1" },
        {
          label: "Grande vaso",
          value:
            (fieldValue(panel, "ctaResult")
              ? displayValueFromOptions(fieldValue(panel, "ctaResult"), [
                  ["Oclusão de grande vaso", "oclusao_grande_vaso"],
                  ["Sem oclusão de grande vaso", "sem_lvo"],
                  ["Inconclusivo", "inconclusivo"],
                  ["Não realizada", "nao_realizada"],
                ])
              : "") ||
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
  const [customSheet, setCustomSheet] = useState<CustomSheetState | null>(null);
  const [customOtherValue, setCustomOtherValue] = useState("");

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab });
  }, [activeTab, encounterSummary.protocolId]);

  useEffect(() => {
    setCustomOtherValue("");
  }, [customSheet?.fieldId]);

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
  const thrombolysisCriteria = useMemo(
    () => buildObjectiveThrombolysisCriteria(auxiliaryPanel, nihssSummary),
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
  const followUpRecommendationCards = recommendationCards.filter(
    (item, index) => index >= 2 && !item.title.startsWith("Calculadora")
  );
  const groupedFollowUpRecommendationCards = useMemo(() => {
    const grouped = new Map<string, typeof followUpRecommendationCards>();
    for (const recommendation of followUpRecommendationCards) {
      const label = recommendationScenarioLabel(recommendation.title);
      const current = grouped.get(label) ?? [];
      current.push(recommendation);
      grouped.set(label, current);
    }
    return Array.from(grouped.entries()).map(([label, cards]) => ({ label, cards }));
  }, [followUpRecommendationCards]);
  const activeRecommendationGroupLabel = useMemo(
    () =>
      primaryRecommendationGroupLabel(
        fieldValue(auxiliaryPanel, "ctResult"),
        ivRecommendation?.title || "",
        thrombectomyRecommendation?.title || ""
      ),
    [auxiliaryPanel, ivRecommendation, thrombectomyRecommendation]
  );
  const reperfusionBlockers = ivRecommendation ? extractRecommendationLines(ivRecommendation.lines, "Bloqueio:") : [];
  const reperfusionCorrections = ivRecommendation ? extractRecommendationLines(ivRecommendation.lines, "Correção:") : [];
  const absoluteContraItems = CONTRAINDICATIONS.filter((item) => item.category === "absolute");
  const manualAbsoluteContraItems = absoluteContraItems.filter((item) => !["ct_hemorrhage", "known_coagulopathy"].includes(item.id));
  const autoAbsoluteContraItems = absoluteContraItems.filter((item) => ["ct_hemorrhage", "known_coagulopathy"].includes(item.id));
  const relativeContraItems = CONTRAINDICATIONS.filter((item) => item.category === "relative");
  const manualRelativeContraItems = relativeContraItems.filter((item) => item.id !== "minor_non_disabling");
  const correctableContraItems = CONTRAINDICATIONS.filter((item) => item.category === "correctable");
  const pendingContraItems = CONTRAINDICATIONS.filter(
    (item) => item.category === "diagnostic_pending" || item.category === "lab_pending" || item.category === "hemodynamic_pending"
  );
  const selectedThrombolyticId = fieldValue(auxiliaryPanel, "selectedThrombolyticId") || "alteplase";
  const selectedThrombolytic = THROMBOLYTICS.find((item) => item.id === selectedThrombolyticId) ?? THROMBOLYTICS[0];
  const enteredWeight = Number(fieldValue(auxiliaryPanel, "weightKg"));
  const activePendingContraItems = pendingContraItems.filter((item) => inferPendingContraStatus(auxiliaryPanel, item.id));
  const thrombolyticDoseCards = THROMBOLYTICS.map((drug) => ({
    drug,
    dose: calculateThrombolyticDose(
      drug.id,
      Number.isFinite(enteredWeight) && enteredWeight > 0 ? enteredWeight : null,
      fieldValue(auxiliaryPanel, "estimatedWeight") === "yes"
    ),
  }));
  const glucoseDecisionValue = fieldValue(auxiliaryPanel, "glucoseCurrent") || fieldValue(auxiliaryPanel, "glucoseInitial");
  const systolicDecisionValue = fieldValue(auxiliaryPanel, "systolicPressure");
  const diastolicDecisionValue = fieldValue(auxiliaryPanel, "diastolicPressure");
  const decisionTimeAnchor = resolveReliableTimeAnchorUi(auxiliaryPanel);
  const lkwElapsed = decisionTimeAnchor
    ? elapsedMinutesWithContext(
        decisionTimeAnchor.dayContext,
        decisionTimeAnchor.time,
        fieldValue(auxiliaryPanel, "arrivalDayContext"),
        fieldValue(auxiliaryPanel, "arrivalTime")
      )
    : null;
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
  const glucoseNumeric = Number(glucoseDecisionValue);
  const glucoseLow = Number.isFinite(glucoseNumeric) && glucoseNumeric > 0 && glucoseNumeric < 70;
  const glucoseHigh = Number.isFinite(glucoseNumeric) && glucoseNumeric > 400;
  const showPressureCorrection = Number(systolicDecisionValue) > AVC_WINDOWS.tPaMaxPressure.systolic || Number(diastolicDecisionValue) > AVC_WINDOWS.tPaMaxPressure.diastolic;
  const showGlucoseCorrection = Number(glucoseDecisionValue) > 0 && (Number(glucoseDecisionValue) < 70 || Number(glucoseDecisionValue) > 400);
  const showThrombolyticCalculator = Boolean(doseRecommendation) && ivRecommendation && ivRecommendation.title !== "Não elegível no estado atual";
  const nonOkCriteria = thrombolysisCriteria.criteria.filter((item) => item.status !== "ok");
  const okCriteriaCount = thrombolysisCriteria.criteria.length - nonOkCriteria.length;
  const lowNihssWithoutDisabling = nihssSummary.total <= 5 && fieldValue(auxiliaryPanel, "disablingDeficit") !== "yes";
  const lowNihssWithDisabling = nihssSummary.total <= 5 && fieldValue(auxiliaryPanel, "disablingDeficit") === "yes";
  const minorStrokeGuidanceTitle = lowNihssWithDisabling
    ? "NIHSS baixo, mas déficit incapacitante documentado"
    : lowNihssWithoutDisabling
      ? "NIHSS baixo: confirmar se o déficit é realmente não incapacitante"
      : "NIHSS atual não sugere déficit menor como contraindicação relativa";
  const minorStrokeGuidanceText = lowNihssWithDisabling
    ? "NIHSS baixo isoladamente não contraindica trombólise. Como o caso já foi marcado como déficit incapacitante, este item não deve entrar como bloqueio relativo automático."
    : lowNihssWithoutDisabling
      ? "NIHSS baixo por si só não basta para contraindicar trombólise. Considere como relativa apenas se o déficit for de fato não incapacitante no mundo real; afasia, hemianopsia, paresia funcional, disartria impeditiva ou impacto ocupacional relevante favorecem tratar como déficit incapacitante."
      : "Se o NIHSS não é baixo, este item não precisa ser marcado. Use abaixo apenas as contraindicações relativas verdadeiramente individualizáveis do caso.";
  const uniqueCorrections = Array.from(new Set(reperfusionCorrections));
  const reperfusionBannerState =
    fieldValue(auxiliaryPanel, "ctResult") === "sem_sangramento"
      ? "ischemic_clear"
      : fieldValue(auxiliaryPanel, "ctResult") === "hemorragia"
        ? "hemorrhagic"
        : "pending";
  const pressureCorrectionGuidance = [
    "Meta imediata para liberar trombólise IV: PAS < 185 mmHg e PAD < 110 mmHg. Após trombólise, manter PA < 180/105 mmHg.",
    "Labetalol: 10-20 mg EV em 1-2 min; pode repetir 1 vez se necessário, com nova checagem pressórica em 5-10 min.",
    "Nicardipina: iniciar 5 mg/h EV e titular +2,5 mg/h a cada 5-15 min até a meta; máximo 15 mg/h.",
    "Clevidipina, se disponível: 1-2 mg/h EV, dobrando a dose a cada 2-5 min até a meta; máximo 21 mg/h.",
    "Evitar queda brusca da PA. Registre abaixo a pressão pós-correção; o critério hemodinâmico é reavaliado automaticamente com o novo valor.",
  ];
  const glucoseCorrectionGuidance = glucoseLow
    ? [
        "Hipoglicemia: se o paciente puder deglutir com segurança, ofertar 15-20 g de carboidrato oral e repetir glicemia em 15 min.",
        "Se houver jejum, rebaixamento ou risco de aspiração, usar glicose EV 25 g, por exemplo 50 mL de SG 50% ou 100-250 mL de SG 10%, e repetir glicemia em 15 min.",
        "Se não houver acesso venoso imediato, considerar glucagon 1 mg IM/SC/IN enquanto obtém acesso e reavalia o déficit neurológico.",
        "Após corrigir, documente a glicemia abaixo; o módulo reavalia automaticamente o bloqueio glicêmico.",
      ]
    : [
        "Hiperglicemia importante: preferir insulina para correção e monitorização seriada sem atrasar desnecessariamente a reperfusão.",
        "Paciente estável: usar insulina regular ou rápida SC conforme escala/correção institucional e repetir glicemia em 30-60 min.",
        "Se houver hiperglicemia muito alta, necessidade de controle fino ou suspeita de crise hiperglicêmica, considerar insulina regular EV em bomba, em geral 0,05-0,1 U/kg/h, com glicemia horária.",
        "Meta hospitalar prática: 140-180 mg/dL. Para liberar este critério do módulo, a glicemia precisa sair da faixa crítica e ficar documentada entre 70 e 400 mg/dL.",
      ];

  const stabilizationItems = buildStabilizationItems(auxiliaryPanel, onFieldChange, onPresetApply);

  const expandedStabilizationItems = stabilizationItems.filter((item) => item.active || expandedStabilization.includes(item.id));
  const hasActiveCriticalStabilizationItem = stabilizationItems.some(
    (item) => ["airway", "hypoxemia", "vomit", "hemo"].includes(item.id) && item.active
  );
  const stabilizationUrgencyField = panelField(auxiliaryPanel, "stabilizationUrgency");
  const stabilizationSummaryText = stabilizationUrgencyField?.helperText?.trim() || fieldValue(auxiliaryPanel, "stabilizationUrgency");

  const examCards = [
    {
      id: "ctResult",
      title: "TC de crânio sem contraste",
      value: displayValueFromOptions(fieldValue(auxiliaryPanel, "ctResult"), [
        ["Sem sangramento", "sem_sangramento"],
        ["Hemorragia", "hemorragia"],
        ["Inconclusivo", "inconclusivo"],
      ]),
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
      value: displayValueFromOptions(fieldValue(auxiliaryPanel, "ctaResult"), [
        ["Oclusão de grande vaso", "oclusao_grande_vaso"],
        ["Sem oclusão de grande vaso", "sem_lvo"],
        ["Inconclusivo", "inconclusivo"],
        ["Não realizada", "nao_realizada"],
      ]),
      detail: "AngioTC é complementar para seleção de trombectomia. Não deve atrasar trombólise IV quando já indicada.",
      options: [
        ["Oclusão de grande vaso", "oclusao_grande_vaso"],
        ["Sem oclusão de grande vaso", "sem_lvo"],
        ["Inconclusivo", "inconclusivo"],
        ["Não realizada", "nao_realizada"],
      ] as Array<[string, string]>,
    },
  ];

  const labCards = ["platelets", "inr", "aptt", "creatinine"]
    .map((id) => panelField(auxiliaryPanel, id))
    .filter((field): field is NonNullable<ReturnType<typeof panelField>> => field != null);

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
                  <Pressable
                    key={card.id}
                    style={[avcStyles.hemoCard, fieldValue(auxiliaryPanel, card.id) && avcStyles.hemoCardActive]}
                    onPress={() =>
                      setCustomSheet({
                        fieldId: card.id,
                        title: card.label,
                        value: fieldValue(auxiliaryPanel, card.id),
                        options: card.options.map((value) => ({ label: value, value })),
                        allowOther: true,
                      })
                    }>
                    <Text style={[avcStyles.hemoCardLabel, fieldValue(auxiliaryPanel, card.id) && avcStyles.hemoCardLabelActive]}>{card.label}</Text>
                    <Text style={[avcStyles.hemoCardValue, fieldValue(auxiliaryPanel, card.id) && avcStyles.hemoCardValueActive]}>{card.value}</Text>
                    <Text style={[avcStyles.hemoCardHint, fieldValue(auxiliaryPanel, card.id) && avcStyles.hemoCardHintActive]}>
                      Toque para selecionar ou informar outro valor.
                    </Text>
                  </Pressable>
                ))}
                <View style={[avcStyles.hemoCard, avcStyles.hemoCardReadOnly, assessmentPam != null && avcStyles.hemoCardActive]}>
                  <Text style={[avcStyles.hemoCardLabel, assessmentPam != null && avcStyles.hemoCardLabelActive]}>PAM calculada</Text>
                  <Text style={[avcStyles.hemoCardValue, assessmentPam != null && avcStyles.hemoCardValueActive]}>
                    {assessmentPam != null ? `${assessmentPam} mmHg` : "Aguardando PAS/PAD"}
                  </Text>
                  <Text style={[avcStyles.hemoCardHint, assessmentPam != null && avcStyles.hemoCardHintActive]}>
                    Calculada automaticamente a partir de PAS e PAD.
                  </Text>
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
              const selected = selectedOption != null;

              return (
                <Pressable
                  key={item.id}
                  style={[avcStyles.nihssScaleCard, selected && avcStyles.nihssScaleCardActive]}
                  onPress={() =>
                    setCustomSheet({
                      fieldId: item.id,
                      title: nihssDisplayLabel(item.id, item.label),
                      value: fieldValue(auxiliaryPanel, item.id),
                      subtitle: buildNihssSheetSubtitle(item.id),
                      options: item.options.map((option) => ({
                        label: `${option.score} ponto${option.score === 1 ? "" : "s"}`,
                        value: String(option.score),
                        detail: `${option.label}. ${option.description}`,
                      })),
                    })
                  }>
                  <View style={avcStyles.nihssScaleHeader}>
                    <Text style={avcStyles.nihssScaleTitle}>{nihssDisplayLabel(item.id, item.label)}</Text>
                    <Pressable
                      style={[avcStyles.nihssHelpPill, helpOpen && avcStyles.nihssHelpPillActive]}
                      onPress={() => setNihssHelpItemId((current) => (current === item.id ? null : item.id))}>
                      <Text style={[avcStyles.nihssHelpPillText, helpOpen && avcStyles.nihssHelpPillTextActive]}>Ajuda</Text>
                    </Pressable>
                  </View>

                  <Text style={[avcStyles.nihssSelectedText, selected && avcStyles.nihssSelectedTextActive]}>
                    {selectedOption
                      ? `Preenchido: ${selectedOption.score} — ${selectedOption.label}`
                      : "Selecione a pontuação que melhor descreve o exame"}
                  </Text>

                  {selectedOption ? (
                    <Text style={avcStyles.nihssOptionSummary}>{selectedOption.description}</Text>
                  ) : null}

                  {helpOpen ? (
                    <Text style={avcStyles.nihssHelpText}>
                      {item.description} {selectedOption?.description ?? ""}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {auxiliaryPanel && activeTab === 0 ? (
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
              const expanded = expandedStabilization.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={[
                    avcStyles.toggleCard,
                    item.active && avcStyles.toggleCardActive,
                    expanded && !item.active && avcStyles.toggleCardExpanded,
                  ]}
                  onPress={() => {
                    if (!("automatic" in item && item.automatic)) {
                      item.toggle();
                    }
                    setExpandedStabilization((current) =>
                      current.includes(item.id) ? current.filter((entry) => entry !== item.id) : [...current, item.id]
                    );
                  }}>
                  <View style={avcStyles.toggleTextBlock}>
                    <Text style={[avcStyles.toggleLabel, item.active && avcStyles.toggleLabelActive]}>{item.label}</Text>
                    <Text style={avcStyles.toggleSubLabel}>{item.hint}</Text>
                  </View>
                  <View style={[avcStyles.switchTrack, item.active && avcStyles.switchTrackOn]}>
                    <View style={[avcStyles.switchThumb, item.active && avcStyles.switchThumbOn]} />
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
              {stabilizationSummaryText
                ? `${stabilizationSummaryText}. ${
                    hasActiveCriticalStabilizationItem
                      ? "Há gatilhos ativos nesta etapa; resolva os itens destacados antes de considerar a fase de exames/reperfusão."
                      : "Sem gatilho maior ativo nos cartões acima; se os dados estiverem coerentes, o caso pode seguir para exames e decisão terapêutica."
                  }`
                : "Use os cartões acima para checar riscos de via aérea, oxigenação, perfusão, acesso e monitorização. Este bloco ajuda a decidir o que precisa ser tratado antes de avançar."}
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
              <Pressable
                key={card.id}
                style={[avcStyles.examCard, fieldValue(auxiliaryPanel, card.id) && avcStyles.examCardActive]}
                onPress={() =>
                  setCustomSheet({
                    fieldId: card.id,
                    title: card.title,
                    value: fieldValue(auxiliaryPanel, card.id),
                    subtitle: card.detail,
                    options: card.options.map(([label, value]) => ({
                      label,
                      value,
                    })),
                  })
                }>
                <Text style={[avcStyles.examCardTitle, fieldValue(auxiliaryPanel, card.id) && avcStyles.examCardTitleActive]}>{card.title}</Text>
                <Pressable
                  style={[avcStyles.examSelectBox, fieldValue(auxiliaryPanel, card.id) && avcStyles.examSelectBoxActive]}
                  onPress={() =>
                    setCustomSheet({
                      fieldId: card.id,
                      title: card.title,
                      value: fieldValue(auxiliaryPanel, card.id),
                      subtitle: card.detail,
                      options: card.options.map(([label, value]) => ({
                        label,
                        value,
                      })),
                    })
                  }>
                  <Text style={[avcStyles.examCardValue, fieldValue(auxiliaryPanel, card.id) && avcStyles.examCardValueActive]}>{card.value}</Text>
                  <Text style={[avcStyles.examSelectHint, fieldValue(auxiliaryPanel, card.id) && avcStyles.examSelectHintActive]}>
                    Toque nesta área para selecionar ou limpar o resultado.
                  </Text>
                </Pressable>
                <Text style={[avcStyles.examCardHint, fieldValue(auxiliaryPanel, card.id) && avcStyles.examCardHintActive]}>{card.detail}</Text>
              </Pressable>
            ))}
          </View>

          <View style={avcStyles.labGrid}>
            {labCards.map((card) => (
              <View key={card.id} style={[avcStyles.labCard, fieldValue(auxiliaryPanel, card.id) && avcStyles.labCardActive]}>
                <Text style={[avcStyles.labTitle, fieldValue(auxiliaryPanel, card.id) && avcStyles.labTitleActive]}>{card.label}</Text>
                <Pressable
                  style={[avcStyles.labValueBoxWide, fieldValue(auxiliaryPanel, card.id) && avcStyles.labValueBoxWideActive]}
                  onPress={() =>
                    setCustomSheet({
                      fieldId: card.id,
                      title: card.label,
                      value: card.value,
                      options: (card.presets ?? []).map((preset) => ({
                        label: preset.label,
                        value: preset.value,
                      })),
                      allowOther: true,
                    })
                  }>
                  <Text style={[avcStyles.labValueText, fieldValue(auxiliaryPanel, card.id) && avcStyles.labValueTextActive]}>
                    {fieldDisplayValue(auxiliaryPanel, card.id)}
                  </Text>
                </Pressable>
                <Text style={[avcStyles.labCardHint, fieldValue(auxiliaryPanel, card.id) && avcStyles.labCardHintActive]}>
                  {card.helperText ?? "Toque no card para selecionar um preset ou informar outro valor manualmente."}
                </Text>
              </View>
            ))}
          </View>

          <View style={avcStyles.quickResultsCard}>
            <Text style={avcStyles.quickResultsTitle}>Resultados críticos rápidos:</Text>
            <Text style={avcStyles.quickResultsLine}>
              Plaquetas &lt; 100.000: {(() => {
                const platelets = normalizePlateletsValue(fieldValue(auxiliaryPanel, "platelets"));
                return platelets == null ? "—" : platelets < 100000 ? "SIM" : "NÃO";
              })()}
            </Text>
            <Text style={avcStyles.quickResultsLine}>INR &gt; 1,7: {labState(fieldValue(auxiliaryPanel, "inr"), (n) => n > 1.7)}</Text>
            <Text style={avcStyles.quickResultsLine}>
              TTPa: {fieldDisplayValue(auxiliaryPanel, "aptt", "—")} | Creatinina: {fieldDisplayValue(auxiliaryPanel, "creatinine", "—")}
            </Text>
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
                ? `Imagem atual: ${displayValueFromOptions(fieldValue(auxiliaryPanel, "ctResult"), examCards[0].options)}. ${heroDetails.subtitle}`
                : "Imagem ainda não definida: este passo bloqueia decisão terapêutica definitiva."}
            </Text>
          </View>
        </View>
      ) : null}

      {activeTab === 4 ? (
        <View style={avcStyles.customPanel}>
          <View
            style={[
              avcStyles.priorityBanner,
              reperfusionBannerState === "ischemic_clear" && avcStyles.priorityBannerSuccess,
              reperfusionBannerState === "hemorrhagic" && avcStyles.priorityBannerDanger,
            ]}>
            <Text
              style={[
                avcStyles.priorityBannerTitle,
                reperfusionBannerState === "ischemic_clear" && avcStyles.priorityBannerTitleSuccess,
                reperfusionBannerState === "hemorrhagic" && avcStyles.priorityBannerTitleDanger,
              ]}>
              {reperfusionBannerState === "ischemic_clear"
                ? "Ramo isquêmico sem sangramento confirmado"
                : reperfusionBannerState === "hemorrhagic"
                  ? "Hemorragia confirmada na TC: trombólise intravenosa contraindicada"
                  : "Bloqueio crítico: TC de crânio sem contraste ainda não confirmou ramo isquêmico sem sangramento"}
            </Text>
            <Text
              style={[
                avcStyles.priorityBannerText,
                reperfusionBannerState === "ischemic_clear" && avcStyles.priorityBannerTextSuccess,
                reperfusionBannerState === "hemorrhagic" && avcStyles.priorityBannerTextDanger,
              ]}>
              {reperfusionBannerState === "ischemic_clear"
                ? "Hemorragia excluída na TC. Agora a decisão de trombólise depende da janela, pressão, glicemia e demais contraindicações."
                : reperfusionBannerState === "hemorrhagic"
                  ? "Com hemorragia documentada, o fluxo deve acompanhar conduta de AVC hemorrágico e não de reperfusão isquêmica."
                  : "A decisão de trombólise depende desta confirmação de imagem."}
            </Text>
          </View>

          <View style={avcStyles.reperfusionSummaryStack}>
            <View style={avcStyles.reperfusionStateCard}>
              <Text style={avcStyles.reperfusionStateTitle}>{ivRecommendation?.title || "Reperfusão IV em revisão"}</Text>
              <Text style={avcStyles.reperfusionStateText}>{thrombolysisCriteria.summary}</Text>
            </View>

            <View style={avcStyles.criteriaCard}>
              <Text style={avcStyles.criteriaTitle}>Critérios atuais para decisão de trombólise</Text>
              <Text style={avcStyles.criteriaLine}>Janela: {lkwElapsed != null ? `${(lkwElapsed / 60).toFixed(1).replace(".0", "")} h` : "- h"}</Text>
              <Text style={avcStyles.criteriaLine}>{okCriteriaCount} critério(s) já cumprem com os dados atuais.</Text>
              {(nonOkCriteria.length ? nonOkCriteria : thrombolysisCriteria.criteria.slice(0, 1)).map((item) => (
                <View key={item.label} style={avcStyles.criteriaItemRow}>
                  <View
                    style={[
                      avcStyles.criteriaStatusDot,
                      item.status === "ok" && avcStyles.criteriaStatusOk,
                      item.status === "no" && avcStyles.criteriaStatusNo,
                      item.status === "pending" && avcStyles.criteriaStatusPending,
                    ]}
                  />
                  <View style={avcStyles.criteriaItemTextBlock}>
                    <Text style={avcStyles.criteriaItemLabel}>
                      {item.label}: {item.status === "ok" ? "Cumpre" : item.status === "no" ? "Não cumpre" : "Pendente"}
                    </Text>
                    <Text style={avcStyles.criteriaItemDetail}>
                      {nonOkCriteria.length ? item.detail : "Todos os critérios objetivos visíveis estão preenchidos e favoráveis neste momento."}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {nonOkCriteria.length ? (
              <View style={avcStyles.pendingCard}>
                <Text style={avcStyles.pendingTitle}>Pendências atuais para liberar reperfusão: {nonOkCriteria.length}</Text>
                {nonOkCriteria.map((item) => (
                  <Text key={item.label} style={avcStyles.pendingLine}>• {item.label}</Text>
                ))}
              </View>
            ) : null}

            {uniqueCorrections.length ? (
              <View style={avcStyles.quickResultsCard}>
                <Text style={avcStyles.quickResultsTitle}>Correções acionáveis agora</Text>
                {uniqueCorrections.map((item) => (
                  <Text key={item} style={avcStyles.quickResultsLine}>• {item}</Text>
                ))}
              </View>
            ) : null}
          </View>

          <View style={avcStyles.reperfusionSection}>
            <View style={avcStyles.sectionStripDanger}>
              <Text style={avcStyles.sectionStripDangerText}>Contraindicações absolutas</Text>
            </View>
            <View style={avcStyles.reperfusionCardStack}>
              {autoAbsoluteContraItems.map((item) => {
                const displayState = autoContraDisplayState(auxiliaryPanel, item.id);
                const active = displayState === "detected";
                const clear = displayState === "clear";
                const subtitle =
                  displayState === "detected"
                    ? `${item.description} Detectado automaticamente conforme os dados atuais do caso.`
                    : displayState === "clear"
                      ? `${item.description} Não detectado com os dados atuais do caso.`
                      : `${item.description} Ainda depende de dados prévios desta etapa para conclusão automática.`;
                return (
                  <View
                    key={item.id}
                    style={[
                      avcStyles.reperfusionReviewCard,
                      active && avcStyles.reperfusionReviewCardDanger,
                      clear && avcStyles.reperfusionReviewCardClear,
                    ]}>
                    <View style={avcStyles.reperfusionReviewBody}>
                      <Text
                        style={[
                          avcStyles.reperfusionReviewTitle,
                          active && avcStyles.reperfusionReviewTitleDanger,
                          clear && avcStyles.reperfusionReviewTitleClear,
                        ]}>
                        {item.name}
                      </Text>
                      <Text style={avcStyles.reperfusionReviewText}>{subtitle}</Text>
                    </View>
                    <View
                      style={[
                        avcStyles.autoDetectedBadge,
                        active && avcStyles.autoDetectedBadgeDanger,
                        clear && avcStyles.autoDetectedBadgeClear,
                      ]}>
                      <Text
                        style={[
                          avcStyles.autoDetectedBadgeText,
                          active && avcStyles.autoDetectedBadgeTextDanger,
                          clear && avcStyles.autoDetectedBadgeTextClear,
                        ]}>
                        {active ? "Detectado" : clear ? "Normal" : "Pendente"}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {manualAbsoluteContraItems.map((item) => {
                const fieldId = `contra_${item.id}_status`;
                const active = fieldValue(auxiliaryPanel, fieldId) === "present";
                return (
                  <Pressable
                    key={item.id}
                    style={[avcStyles.reperfusionReviewCard, active && avcStyles.reperfusionReviewCardDanger]}
                    onPress={() => onFieldChange(fieldId, active ? "absent" : "present")}>
                    <View style={avcStyles.reperfusionReviewBody}>
                      <Text style={[avcStyles.reperfusionReviewTitle, active && avcStyles.reperfusionReviewTitleDanger]}>{item.name}</Text>
                      <Text style={avcStyles.reperfusionReviewText}>{item.description}</Text>
                    </View>
                    <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                      <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={avcStyles.reperfusionSection}>
            <View style={avcStyles.sectionStripWarning}>
              <Text style={avcStyles.sectionStripWarningText}>Contraindicações relativas</Text>
            </View>
            <View style={[avcStyles.reperfusionReviewCard, avcStyles.reperfusionReviewCardNeutral]}>
              <View style={avcStyles.reperfusionReviewBody}>
                <Text style={avcStyles.reperfusionReviewTitle}>{minorStrokeGuidanceTitle}</Text>
                <Text style={avcStyles.reperfusionReviewText}>{minorStrokeGuidanceText}</Text>
              </View>
            </View>
            <View style={avcStyles.reperfusionCardStack}>
              {manualRelativeContraItems.map((item) => {
                const fieldId = `contra_${item.id}_status`;
                const active = fieldValue(auxiliaryPanel, fieldId) === "present";
                return (
                  <Pressable
                    key={item.id}
                    style={[avcStyles.reperfusionReviewCard, active && avcStyles.reperfusionReviewCardWarn]}
                    onPress={() => onFieldChange(fieldId, active ? "absent" : "present")}>
                    <View style={avcStyles.reperfusionReviewBody}>
                      <Text style={[avcStyles.reperfusionReviewTitle, active && avcStyles.reperfusionReviewTitleWarn]}>{item.name}</Text>
                      <Text style={avcStyles.reperfusionReviewText}>{item.description}</Text>
                    </View>
                    <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                      <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={avcStyles.reperfusionSection}>
            <View style={avcStyles.sectionStripWarning}>
              <Text style={avcStyles.sectionStripWarningText}>Contraindicações potencialmente corrigíveis</Text>
            </View>
            <View style={avcStyles.reperfusionCardStack}>
              {correctableContraItems.map((item) => {
                const fieldId = `contra_${item.id}_status`;
                const inferredStatus = autoContraStatus(auxiliaryPanel, item.id);
                const active = inferredStatus ?? (fieldValue(auxiliaryPanel, fieldId) === "present");
                const isAutomatic = inferredStatus != null;
                return (
                  <Pressable
                    key={item.id}
                    style={[avcStyles.reperfusionReviewCard, active && avcStyles.reperfusionReviewCardWarn]}
                    onPress={() => {
                      if (!isAutomatic) {
                        onFieldChange(fieldId, active ? "absent" : "present");
                      }
                    }}>
                    <View style={avcStyles.reperfusionReviewBody}>
                      <Text style={[avcStyles.reperfusionReviewTitle, active && avcStyles.reperfusionReviewTitleWarn]}>{item.name}</Text>
                      <Text style={avcStyles.reperfusionReviewText}>
                        {isAutomatic
                          ? `${item.correctionGuidance || item.description} Detectado automaticamente conforme os dados atuais do caso.`
                          : item.correctionGuidance || item.description}
                      </Text>
                    </View>
                    {isAutomatic ? (
                      <View style={[avcStyles.autoDetectedBadge, active && avcStyles.autoDetectedBadgeActive]}>
                        <Text style={[avcStyles.autoDetectedBadgeText, active && avcStyles.autoDetectedBadgeTextActive]}>
                          {active ? "Detectado" : "Automático"}
                        </Text>
                      </View>
                    ) : (
                      <View style={[avcStyles.switchTrack, active && avcStyles.switchTrackOn]}>
                        <View style={[avcStyles.switchThumb, active && avcStyles.switchThumbOn]} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={avcStyles.reperfusionSection}>
            <View style={avcStyles.sectionStripInfo}>
              <Text style={avcStyles.sectionStripInfoText}>Pendências diagnósticas e laboratoriais</Text>
            </View>
            <View style={avcStyles.reperfusionCardStack}>
              {activePendingContraItems.length ? (
                activePendingContraItems.map((item) => (
                  <View key={item.id} style={[avcStyles.reperfusionReviewCard, avcStyles.reperfusionReviewCardInfo]}>
                    <View style={avcStyles.reperfusionReviewBody}>
                      <Text style={[avcStyles.reperfusionReviewTitle, avcStyles.reperfusionReviewTitleInfo]}>{item.name}</Text>
                      <Text style={avcStyles.reperfusionReviewText}>{item.correctionGuidance || item.description}</Text>
                    </View>
                    <View style={[avcStyles.autoDetectedBadge, avcStyles.autoDetectedBadgeActive]}>
                      <Text style={[avcStyles.autoDetectedBadgeText, avcStyles.autoDetectedBadgeTextActive]}>Ativa</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[avcStyles.reperfusionReviewCard, avcStyles.reperfusionReviewCardNeutral]}>
                  <View style={avcStyles.reperfusionReviewBody}>
                    <Text style={avcStyles.reperfusionReviewTitle}>Sem pendências diagnósticas/laboratoriais ativas</Text>
                    <Text style={avcStyles.reperfusionReviewText}>
                      Com os dados atuais, tempo, TC, anticoagulação/labs e avaliação vascular não geram pendência ativa nesta faixa.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {showPressureCorrection ? (
            <View style={avcStyles.correctionCard}>
              <Text style={avcStyles.correctionTitle}>Motivo de bloqueio corrigível e sugestões de correção</Text>
              {pressureCorrectionGuidance.map((line) => (
                <Text key={line} style={avcStyles.correctionLine}>• {line}</Text>
              ))}

              <View style={avcStyles.postCorrectionPanel}>
                <Text style={avcStyles.postCorrectionEyebrow}>Reavaliação após correção</Text>
                <Text style={avcStyles.postCorrectionHint}>Registre os valores pós-correção para liberar ou manter bloqueio da trombólise.</Text>
                <View style={avcStyles.reperfusionFieldStack}>
                  <View style={avcStyles.postCorrectionField}>
                    <Text style={avcStyles.postCorrectionLabel}>PAS pós-correção</Text>
                    <Pressable
                      style={[avcStyles.labValueBoxWide, systolicDecisionValue && avcStyles.labValueBoxWideActive]}
                      onPress={() =>
                        setCustomSheet({
                          fieldId: "systolicPressure",
                          title: "PAS pós-correção",
                          value: systolicDecisionValue,
                          options: ["160", "170", "180", "185"].map((value) => ({ label: value, value })),
                          allowOther: true,
                        })
                      }>
                      <Text style={[avcStyles.labValueText, systolicDecisionValue && avcStyles.labValueTextActive]}>
                        {systolicDecisionValue || "Selecionar"}
                      </Text>
                    </Pressable>
                    <Text style={[avcStyles.labCardHint, systolicDecisionValue && avcStyles.labCardHintActive]}>Toque para selecionar ou informar outro valor.</Text>
                  </View>
                  <View style={avcStyles.postCorrectionField}>
                    <Text style={avcStyles.postCorrectionLabel}>PAD pós-correção</Text>
                    <Pressable
                      style={[avcStyles.labValueBoxWide, diastolicDecisionValue && avcStyles.labValueBoxWideActive]}
                      onPress={() =>
                        setCustomSheet({
                          fieldId: "diastolicPressure",
                          title: "PAD pós-correção",
                          value: diastolicDecisionValue,
                          options: ["90", "100", "105", "110"].map((value) => ({ label: value, value })),
                          allowOther: true,
                        })
                      }>
                      <Text style={[avcStyles.labValueText, diastolicDecisionValue && avcStyles.labValueTextActive]}>
                        {diastolicDecisionValue || "Selecionar"}
                      </Text>
                    </Pressable>
                    <Text style={[avcStyles.labCardHint, diastolicDecisionValue && avcStyles.labCardHintActive]}>Toque para selecionar ou informar outro valor.</Text>
                  </View>
                </View>
              </View>

              <View style={pressureReady ? avcStyles.statusDecisionCardSuccess : avcStyles.statusDecisionCard}>
                <View style={avcStyles.statusDecisionHeader}>
                  <Text style={pressureReady ? avcStyles.statusDecisionTitleSuccess : avcStyles.statusDecisionTitle}>
                    {pressureReady ? "Critério hemodinâmico liberado" : "Bloqueio hemodinâmico mantido"}
                  </Text>
                  <View style={pressureReady ? avcStyles.statusDecisionBadgeSuccess : avcStyles.statusDecisionBadge}>
                    <Text style={pressureReady ? avcStyles.statusDecisionBadgeTextSuccess : avcStyles.statusDecisionBadgeText}>Decisão</Text>
                  </View>
                </View>
                <Text style={pressureReady ? avcStyles.statusDecisionTextSuccess : avcStyles.statusDecisionText}>
                  {pressureReady
                    ? `PA atual ${systolicDecisionValue}/${diastolicDecisionValue} mmHg. O valor corrigido já foi considerado válido no caso e o bloqueio pressórico para trombólise IV foi liberado.`
                    : `PA atual ${systolicDecisionValue || "—"}/${diastolicDecisionValue || "—"} mmHg. Enquanto permanecer acima de 185/110 mmHg, a trombólise IV continua bloqueada por critério hemodinâmico.`}
                </Text>
              </View>
            </View>
          ) : null}

          {showGlucoseCorrection ? (
            <View style={avcStyles.correctionCardBlue}>
              <Text style={avcStyles.correctionTitleBlue}>
                {glucoseLow ? "Hipoglicemia: corrigir e reavaliar" : glucoseHigh ? "Hiperglicemia: corrigir e reavaliar" : "Reavaliação após correções"}
              </Text>
              {glucoseCorrectionGuidance.map((line) => (
                <Text key={line} style={avcStyles.correctionLineBlue}>• {line}</Text>
              ))}
              <View style={avcStyles.postCorrectionField}>
                <Text style={avcStyles.postCorrectionLabel}>Glicemia pós-correção (mg/dL)</Text>
                <Pressable
                  style={[avcStyles.labValueBoxWide, fieldValue(auxiliaryPanel, "glucoseCurrent") && avcStyles.labValueBoxWideActive]}
                  onPress={() =>
                    setCustomSheet({
                      fieldId: "glucoseCurrent",
                      title: "Glicemia pós-correção (mg/dL)",
                      value: fieldValue(auxiliaryPanel, "glucoseCurrent"),
                      options: ["80", "120", "200", "300"].map((value) => ({ label: value, value })),
                      allowOther: true,
                    })
                  }>
                  <Text style={[avcStyles.labValueText, fieldValue(auxiliaryPanel, "glucoseCurrent") && avcStyles.labValueTextActive]}>
                    {fieldValue(auxiliaryPanel, "glucoseCurrent") || "Selecionar"}
                  </Text>
                </Pressable>
                <Text style={[avcStyles.labCardHint, fieldValue(auxiliaryPanel, "glucoseCurrent") && avcStyles.labCardHintActive]}>Toque para selecionar ou informar outro valor.</Text>
              </View>
              <View style={glucoseReady ? avcStyles.statusDecisionCardSuccess : avcStyles.statusDecisionCard}>
                <View style={avcStyles.statusDecisionHeader}>
                  <Text style={glucoseReady ? avcStyles.statusDecisionTitleSuccess : avcStyles.statusDecisionTitle}>
                    {glucoseReady ? "Critério glicêmico liberado" : "Bloqueio glicêmico mantido"}
                  </Text>
                  <View style={glucoseReady ? avcStyles.statusDecisionBadgeSuccess : avcStyles.statusDecisionBadge}>
                    <Text style={glucoseReady ? avcStyles.statusDecisionBadgeTextSuccess : avcStyles.statusDecisionBadgeText}>Decisão</Text>
                  </View>
                </View>
                <Text style={glucoseReady ? avcStyles.statusDecisionTextSuccess : avcStyles.statusDecisionText}>
                  {glucoseReady
                    ? `Glicemia atual ${glucoseDecisionValue} mg/dL. O valor corrigido já foi considerado válido no caso e o bloqueio glicêmico para trombólise IV foi liberado.`
                    : `Glicemia atual ${glucoseDecisionValue || "—"} mg/dL. Fora da faixa 70-400 mg/dL, a trombólise IV continua bloqueada por critério glicêmico.`}
                </Text>
              </View>
            </View>
          ) : null}

          {showThrombolyticCalculator ? (
            <View style={avcStyles.calculatorCard}>
              <Text style={avcStyles.calculatorTitle}>Calculadora do trombolítico</Text>
              <View style={avcStyles.reperfusionCardStack}>
                {thrombolyticDoseCards.map(({ drug, dose }) => {
                  const active = selectedThrombolyticId === drug.id;
                  return (
                    <Pressable
                      key={drug.id}
                      style={[avcStyles.reperfusionReviewCard, active && avcStyles.reperfusionReviewCardInfo]}
                      onPress={() => onFieldChange("selectedThrombolyticId", drug.id)}>
                      <View style={avcStyles.reperfusionReviewBody}>
                        <Text style={[avcStyles.reperfusionReviewTitle, active && avcStyles.reperfusionReviewTitleInfo]}>
                          {drug.label}{active ? " · selecionado" : ""}
                        </Text>
                        {dose.totalDoseMg != null ? (
                          <>
                            <Text style={avcStyles.calculatorLine}>• Dose total: {dose.totalDoseMg.toFixed(1)} mg</Text>
                            {dose.bolusDoseMg != null ? <Text style={avcStyles.calculatorLine}>• Bolus: {dose.bolusDoseMg.toFixed(1)} mg</Text> : null}
                            {dose.infusionDoseMg != null ? (
                              <Text style={avcStyles.calculatorLine}>• Infusão: {dose.infusionDoseMg.toFixed(1)} mg em {dose.infusionMinutes ?? 60} min</Text>
                            ) : null}
                          </>
                        ) : (
                          <Text style={avcStyles.calculatorLine}>• Peso ainda não disponível para cálculo.</Text>
                        )}
                        <Text style={avcStyles.calculatorLine}>• {drug.note}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={avcStyles.quickResultsFootnote}>Trombolítico selecionado no momento: {selectedThrombolytic.label}.</Text>
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

      {activeTab === 5 && !isQuestion && !isEnd ? (
        <View style={{ gap: 16 }}>
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

          {groupedFollowUpRecommendationCards.length ? (
            <View style={avcStyles.recommendationsBlock}>
              {groupedFollowUpRecommendationCards.map((group) => (
                <View
                  key={group.label}
                  style={[
                    avcStyles.recommendationGroup,
                    recommendationGroupThemeStyle(group.label).group,
                    group.label !== activeRecommendationGroupLabel && avcStyles.recommendationGroupSecondary,
                  ]}>
                  <View style={avcStyles.recommendationGroupHeader}>
                    <Text
                      style={[
                        avcStyles.recommendationGroupTitle,
                        recommendationGroupThemeStyle(group.label).title,
                        group.label === activeRecommendationGroupLabel && avcStyles.recommendationGroupTitleActive,
                      ]}>
                      {group.label}
                    </Text>
                    <View
                      style={[
                        avcStyles.recommendationGroupBadge,
                        recommendationGroupThemeStyle(group.label).badge,
                        group.label === activeRecommendationGroupLabel && avcStyles.recommendationGroupBadgeActive,
                      ]}>
                      <Text
                        style={[
                          avcStyles.recommendationGroupBadgeText,
                          recommendationGroupThemeStyle(group.label).badgeText,
                          group.label === activeRecommendationGroupLabel && avcStyles.recommendationGroupBadgeTextActive,
                        ]}>
                        {group.label === activeRecommendationGroupLabel ? "Principal" : "Resumo"}
                      </Text>
                    </View>
                  </View>
                  {group.cards.map((recommendation) => (
                    <View
                      key={`${recommendation.title}-${recommendation.priority}`}
                      style={[
                        avcStyles.recommendationCard,
                        recommendation.tone === "warning" && avcStyles.recommendationWarn,
                        recommendation.tone === "danger" && avcStyles.recommendationDanger,
                      ]}>
                      <Text style={avcStyles.recommendationEyebrow}>Prescrição e cuidados</Text>
                      <Text style={avcStyles.recommendationTitle}>{recommendation.title}</Text>
                      {(group.label === activeRecommendationGroupLabel
                        ? recommendation.lines
                        : recommendation.lines.slice(0, 2)
                      ).map((line) => (
                        <Text key={line} style={avcStyles.recommendationLine}>
                          • {line}
                        </Text>
                      ))}
                      {group.label !== activeRecommendationGroupLabel && recommendation.lines.length > 2 ? (
                        <Text style={avcStyles.recommendationLine}>• Demais orientações mantidas neste cenário.</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>
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

      {customSheet ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setCustomSheet(null)}>
          <Pressable style={avcStyles.customSheetBackdrop} onPress={() => setCustomSheet(null)} />
          <View style={avcStyles.customSheet}>
            <View style={avcStyles.customSheetHandle} />
            <View style={avcStyles.customSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={avcStyles.customSheetTitle}>{customSheet.title}</Text>
                <Text style={avcStyles.customSheetSubtitle}>{customSheet.subtitle ?? "Selecione uma opção para preencher o card"}</Text>
              </View>
              <Pressable style={avcStyles.customSheetClose} onPress={() => setCustomSheet(null)}>
                <Text style={avcStyles.customSheetCloseText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={avcStyles.customSheetOptions}>
                {customSheet.options.map((option) => {
                  const active = customSheet.value === option.value;
                  return (
                    <Pressable
                      key={`${customSheet.fieldId}-${option.value}`}
                      style={[avcStyles.customSheetOption, active && avcStyles.customSheetOptionActive]}
                      onPress={() => {
                        onFieldChange(customSheet.fieldId, active ? "" : option.value);
                        setCustomSheet(null);
                      }}>
                      <Text style={[avcStyles.customSheetOptionLabel, active && avcStyles.customSheetOptionLabelActive]}>
                        {option.label}
                      </Text>
                      {option.detail ? (
                        <Text style={[avcStyles.customSheetOptionDetail, active && avcStyles.customSheetOptionDetailActive]}>
                          {option.detail}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
              {customSheet.allowOther ? (
                <View style={avcStyles.customSheetOtherWrap}>
                  <Text style={avcStyles.customSheetOtherLabel}>Outro valor</Text>
                  <View style={avcStyles.customSheetOtherRow}>
                    <TextInput
                      value={customOtherValue}
                      onChangeText={setCustomOtherValue}
                      placeholder="Digite o valor"
                      keyboardType="numbers-and-punctuation"
                      style={avcStyles.customSheetOtherInput}
                      placeholderTextColor="#64748b"
                    />
                    <Pressable
                      style={avcStyles.customSheetOtherBtn}
                      onPress={() => {
                        if (!customOtherValue.trim()) return;
                        onFieldChange(customSheet.fieldId, customOtherValue.trim());
                        setCustomSheet(null);
                      }}>
                      <Text style={avcStyles.customSheetOtherBtnText}>Usar</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </Modal>
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
    alignItems: "flex-start",
    alignContent: "flex-start",
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
  hemoCardActive: {
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
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
  hemoCardLabelActive: {
    color: "#166534",
  },
  hemoCardValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  hemoCardValueActive: {
    color: "#166534",
  },
  hemoCardHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#475569",
  },
  hemoCardHintActive: {
    color: "#15803d",
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
    alignItems: "flex-start",
    alignContent: "flex-start",
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
  nihssScaleCardActive: {
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
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
  nihssSelectedTextActive: {
    color: "#166534",
  },
  nihssOptionSummary: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#334155",
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
  reperfusionSummaryStack: {
    gap: 12,
  },
  reperfusionSection: {
    gap: 10,
  },
  reperfusionCardStack: {
    gap: 10,
  },
  reperfusionReviewCard: {
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
  reperfusionReviewCardNeutral: {
    backgroundColor: "#f8fafc",
    borderColor: "#dbe4ee",
  },
  reperfusionReviewCardDanger: {
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  reperfusionReviewCardWarn: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  reperfusionReviewCardClear: {
    borderColor: "#4ade80",
    backgroundColor: "#ecfdf5",
  },
  reperfusionReviewCardInfo: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  reperfusionReviewBody: {
    flex: 1,
    gap: 4,
  },
  reperfusionReviewTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#334155",
  },
  reperfusionReviewTitleDanger: {
    color: "#991b1b",
  },
  reperfusionReviewTitleWarn: {
    color: "#92400e",
  },
  reperfusionReviewTitleClear: {
    color: "#166534",
  },
  reperfusionReviewTitleInfo: {
    color: "#1d4ed8",
  },
  reperfusionReviewText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "#64748b",
  },
  reperfusionFieldStack: {
    gap: 12,
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
    alignItems: "flex-start",
    alignContent: "flex-start",
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
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
  },
  toggleCardDanger: {
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  toggleCardClear: {
    borderColor: "#4ade80",
    backgroundColor: "#ecfdf5",
  },
  toggleCardStandalone: {
    flexBasis: "100%",
    flexGrow: 0,
    minWidth: 0,
    alignItems: "flex-start",
  },
  toggleCardExpanded: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  toggleLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#334155",
  },
  toggleLabelActive: {
    color: "#166534",
  },
  toggleLabelDanger: {
    color: "#991b1b",
  },
  toggleLabelClear: {
    color: "#166534",
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
    backgroundColor: "#16a34a",
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
  autoDetectedBadge: {
    minWidth: 110,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  autoDetectedBadgeActive: {
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7",
  },
  autoDetectedBadgeDanger: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },
  autoDetectedBadgeClear: {
    borderColor: "#22c55e",
    backgroundColor: "#dcfce7",
  },
  autoDetectedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },
  autoDetectedBadgeTextActive: {
    color: "#166534",
  },
  autoDetectedBadgeTextDanger: {
    color: "#b91c1c",
  },
  autoDetectedBadgeTextClear: {
    color: "#166534",
  },
  condutaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "flex-start",
    alignContent: "flex-start",
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
  statusDecisionCardSuccess: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
    padding: 16,
    gap: 8,
  },
  statusDecisionTitleSuccess: {
    fontSize: 18,
    fontWeight: "900",
    color: "#166534",
  },
  statusDecisionBadgeSuccess: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#86efac",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDecisionBadgeTextSuccess: {
    fontSize: 13,
    fontWeight: "900",
    color: "#166534",
  },
  statusDecisionTextSuccess: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#166534",
  },
  priorityBanner: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f43f5e",
    backgroundColor: "#fff1f2",
    padding: 16,
    gap: 4,
  },
  priorityBannerSuccess: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  priorityBannerDanger: {
    borderColor: "#f87171",
    backgroundColor: "#fef2f2",
  },
  priorityBannerTitle: {
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#881337",
  },
  priorityBannerTitleSuccess: {
    color: "#166534",
  },
  priorityBannerTitleDanger: {
    color: "#991b1b",
  },
  priorityBannerText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    color: "#7f1d1d",
  },
  priorityBannerTextSuccess: {
    color: "#166534",
  },
  priorityBannerTextDanger: {
    color: "#991b1b",
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
  criteriaItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
  },
  criteriaStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 5,
    backgroundColor: "#cbd5e1",
  },
  criteriaStatusOk: {
    backgroundColor: "#16a34a",
  },
  criteriaStatusNo: {
    backgroundColor: "#dc2626",
  },
  criteriaStatusPending: {
    backgroundColor: "#f59e0b",
  },
  criteriaItemTextBlock: {
    flex: 1,
    gap: 2,
  },
  criteriaItemLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
    color: "#312e81",
  },
  criteriaItemDetail: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#475569",
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
    alignItems: "flex-start",
    alignContent: "flex-start",
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
    alignItems: "flex-start",
    alignContent: "flex-start",
  },
  examCard: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 260,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 10,
  },
  examCardActive: {
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
  },
  examCardHeader: {
    gap: 6,
  },
  examSelectBox: {
    minHeight: 88,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: "center",
    gap: 8,
  },
  examSelectBoxActive: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  examCardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1f2937",
  },
  examCardTitleActive: {
    color: "#166534",
  },
  examCardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#334155",
  },
  examCardValueActive: {
    color: "#166534",
  },
  examCardHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  examCardHintActive: {
    color: "#15803d",
  },
  examSelectHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#64748b",
  },
  examSelectHintActive: {
    color: "#15803d",
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
    alignItems: "flex-start",
    alignContent: "flex-start",
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
  labCardActive: {
    borderColor: "#86efac",
    backgroundColor: "#ecfdf5",
  },
  labTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#334155",
  },
  labTitleActive: {
    color: "#166534",
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
  labValueTextActive: {
    color: "#166534",
  },
  labCardHint: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  labCardHintActive: {
    color: "#15803d",
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
  labValueBoxWideActive: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
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
  customSheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  customSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#fffdf7",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 14,
  },
  customSheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#cbd5e1",
  },
  customSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customSheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f2937",
  },
  customSheetSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    color: "#64748b",
  },
  customSheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  customSheetCloseText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#475569",
  },
  customSheetOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  customSheetOption: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 4,
  },
  customSheetOptionActive: {
    borderColor: "#0f172a",
    backgroundColor: "#0f172a",
  },
  customSheetOptionLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f2937",
  },
  customSheetOptionLabelActive: {
    color: "#ffffff",
  },
  customSheetOptionDetail: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  customSheetOptionDetailActive: {
    color: "#cbd5e1",
  },
  customSheetOtherWrap: {
    marginTop: 12,
    gap: 8,
  },
  customSheetOtherLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
  customSheetOtherRow: {
    flexDirection: "row",
    gap: 10,
  },
  customSheetOtherInput: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  customSheetOtherBtn: {
    minWidth: 72,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  customSheetOtherBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  recommendationsBlock: {
    gap: 10,
    marginBottom: 10,
  },
  recommendationGroup: {
    gap: 10,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#f8fbff",
  },
  recommendationGroupSecondary: {
    opacity: 0.8,
  },
  recommendationGroupThrombolysis: {
    borderColor: "#f5d58f",
    backgroundColor: "#fffaf0",
  },
  recommendationGroupThrombectomy: {
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  recommendationGroupHemorrhagic: {
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  recommendationGroupIschemicReview: {
    borderColor: "#c4b5fd",
    backgroundColor: "#faf5ff",
  },
  recommendationGroupDestination: {
    borderColor: "#a7f3d0",
    backgroundColor: "#ecfdf5",
  },
  recommendationGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recommendationGroupTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1e3a8a",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  recommendationGroupTitleActive: {
    color: "#991b1b",
  },
  recommendationGroupTitleThrombolysis: {
    color: "#9a3412",
  },
  recommendationGroupTitleThrombectomy: {
    color: "#1d4ed8",
  },
  recommendationGroupTitleHemorrhagic: {
    color: "#b91c1c",
  },
  recommendationGroupTitleIschemicReview: {
    color: "#6d28d9",
  },
  recommendationGroupTitleDestination: {
    color: "#047857",
  },
  recommendationGroupBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recommendationGroupBadgeActive: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },
  recommendationGroupBadgeThrombolysis: {
    borderColor: "#fdba74",
    backgroundColor: "#ffedd5",
  },
  recommendationGroupBadgeThrombectomy: {
    borderColor: "#93c5fd",
    backgroundColor: "#dbeafe",
  },
  recommendationGroupBadgeHemorrhagic: {
    borderColor: "#fca5a5",
    backgroundColor: "#fee2e2",
  },
  recommendationGroupBadgeIschemicReview: {
    borderColor: "#c4b5fd",
    backgroundColor: "#ede9fe",
  },
  recommendationGroupBadgeDestination: {
    borderColor: "#86efac",
    backgroundColor: "#dcfce7",
  },
  recommendationGroupBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recommendationGroupBadgeTextActive: {
    color: "#991b1b",
  },
  recommendationGroupBadgeTextThrombolysis: {
    color: "#9a3412",
  },
  recommendationGroupBadgeTextThrombectomy: {
    color: "#1d4ed8",
  },
  recommendationGroupBadgeTextHemorrhagic: {
    color: "#b91c1c",
  },
  recommendationGroupBadgeTextIschemicReview: {
    color: "#6d28d9",
  },
  recommendationGroupBadgeTextDestination: {
    color: "#047857",
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
