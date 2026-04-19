import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import type { AuxiliaryPanel, ClinicalLogEntry, EncounterSummary, ProtocolState } from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, getOptionSublabel } from "./protocol-screen-utils";
import { ModuleFinishPanel, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import { getProtocolUiState, updateProtocolUiState } from "../../lib/module-ui-state";
import { NIHSS_ITEMS } from "../../avc/protocol-config";

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

function buildHeroDetails(panel: AuxiliaryPanel | null, encounterSummary: EncounterSummary, activeTab: number) {
  const recommendations = panel?.recommendations ?? [];
  const ivCard = recommendations[0];
  const blockers = ivCard ? extractRecommendationLines(ivCard.lines, "Bloqueio:") : [];
  const corrections = ivCard ? extractRecommendationLines(ivCard.lines, "Correção:") : [];
  const focalSummary = joinValues([fieldValue(panel, "symptoms"), fieldValue(panel, "laterality")], "Quadro focal pendente");
  const stabilizationSummary = firstDocumented(panel, [
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
        { label: "Ação imediata", value: compactValue(stabilizationSummary, "Sem conduta documentada"), accent: "#0369a1" },
        {
          label: "Parâmetros",
          value: joinValues(
            [
              pressure ? `PA ${pressure}` : "",
              fieldValue(panel, "glucoseCurrent") ? `glicemia ${fieldValue(panel, "glucoseCurrent")}` : "",
              fieldValue(panel, "oxygenSaturation") ? `SpO₂ ${fieldValue(panel, "oxygenSaturation")}` : "",
              fieldValue(panel, "consciousnessLevel") ? fieldValue(panel, "consciousnessLevel") : "",
            ],
            "PA, glicemia, SpO₂ e consciência pendentes"
          ),
          accent: "#0f766e",
        },
      ],
      subtitle:
        fieldValue(panel, "abcInstability") === "yes"
          ? "ABC instável documentado: a prioridade desta fase é estabilizar antes de discutir reperfusão."
          : fieldValue(panel, "airwayProtection") === "yes"
            ? "Há necessidade de proteção de via aérea; resolva isso antes de seguir para decisão de reperfusão."
            : stabilizationSummary
              ? `Conduta registrada: ${compactValue(stabilizationSummary, "Sem conduta documentada", 96)}`
              : "Esta fase precisa registrar o que foi feito em via aérea, pressão, glicemia e monitorização.",
      badgeText:
        fieldValue(panel, "abcInstability") === "yes"
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

  const finishSummaryLines = [
    { label: "Diagnóstico sindrômico", value: metricValue(encounterSummary, "Diagnóstico sindrômico") || "—" },
    { label: "NIHSS", value: metricValue(encounterSummary, "NIHSS") || "—" },
    { label: "Trombólise", value: metricValue(encounterSummary, "Trombólise") || "—" },
    { label: "Trombectomia", value: metricValue(encounterSummary, "Trombectomia") || "—" },
    { label: "Destino", value: metricValue(encounterSummary, "Destino") || "—" },
  ].filter((row) => row.value !== "—");

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
            <View style={avcStyles.nihssBadge}>
              <Text style={avcStyles.nihssBadgeText}>Tabela de escore NIHSS</Text>
            </View>
            <Text style={avcStyles.nihssTitle}>
              {nihssSummary.complete ? `${nihssSummary.total} pontos` : "Complete o NIHSS"}
            </Text>
            <Text style={avcStyles.nihssSubtitle}>
              {nihssSummary.complete
                ? `${nihssSummary.severity}. Quanto maior a pontuação, maior o déficit neurológico observado.`
                : `Preenchido em ${nihssSummary.filledCount}/${NIHSS_ITEMS.length} itens. Faltam ${nihssSummary.missingCount} para fechar a gravidade.`}
            </Text>
          </View>

          <View style={avcStyles.nihssGrid}>
            <View style={avcStyles.nihssMetricTile}>
              <Text style={avcStyles.nihssMetricLabel}>Gravidade</Text>
              <Text style={avcStyles.nihssMetricValue}>{nihssSummary.severity}</Text>
            </View>
            <View style={avcStyles.nihssMetricTile}>
              <Text style={avcStyles.nihssMetricLabel}>Itens preenchidos</Text>
              <Text style={avcStyles.nihssMetricValue}>
                {nihssSummary.filledCount}/{NIHSS_ITEMS.length}
              </Text>
            </View>
            <View style={avcStyles.nihssMetricTile}>
              <Text style={avcStyles.nihssMetricLabel}>Déficit incapacitante</Text>
              <Text style={avcStyles.nihssMetricValue}>
                {fieldValue(auxiliaryPanel, "disablingDeficit") === "yes"
                  ? "Sim"
                  : fieldValue(auxiliaryPanel, "disablingDeficit") === "no"
                    ? "Não"
                    : "Em revisão"}
              </Text>
            </View>
          </View>

          <View style={avcStyles.nihssExplanation}>
            <Text style={avcStyles.nihssExplanationTitle}>Como interpretar rápido</Text>
            <Text style={avcStyles.nihssExplanationText}>
              `0` não exclui AVC. Escore baixo ainda pode ser grave se houver afasia, hemianopsia ou déficit funcional incapacitante.
            </Text>
          </View>

          <View style={avcStyles.nihssFindings}>
            <Text style={avcStyles.nihssFindingsTitle}>Principais alterações pontuadas</Text>
            {nihssSummary.abnormalItems.length > 0 ? (
              <View style={avcStyles.nihssChipWrap}>
                {nihssSummary.abnormalItems.slice(0, 6).map((item) => (
                  <View key={item.id} style={avcStyles.nihssChip}>
                    <Text style={avcStyles.nihssChipText}>
                      {item.shortLabel} +{item.score}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={avcStyles.nihssFindingsText}>
                Nenhum item pontuado até agora. Se o quadro clínico for convincente, siga documentando item a item.
              </Text>
            )}
          </View>
        </View>
      ) : null}

      {auxiliaryPanel ? (
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
    borderWidth: 1.5,
    borderColor: "#c4b5fd",
    backgroundColor: "#faf5ff",
    padding: 16,
    gap: 14,
    shadowColor: "#581c87",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  nihssHeader: {
    gap: 6,
  },
  nihssBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#6d28d9",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nihssBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  nihssTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#3b0764",
  },
  nihssSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#5b21b6",
  },
  nihssGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  nihssMetricTile: {
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    padding: 12,
    gap: 4,
  },
  nihssMetricLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#7c3aed",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nihssMetricValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: "#1f2937",
  },
  nihssExplanation: {
    borderRadius: 18,
    backgroundColor: "#ede9fe",
    padding: 12,
    gap: 4,
  },
  nihssExplanationTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#5b21b6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nihssExplanationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#4c1d95",
  },
  nihssFindings: {
    gap: 8,
  },
  nihssFindingsTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#5b21b6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nihssFindingsText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#6b21a8",
  },
  nihssChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nihssChip: {
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c4b5fd",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  nihssChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4c1d95",
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
