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
import { CORONARY_TABS } from "./coronary-tab-config";

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
  onConfirmAction: () => void;
  onRunTransition: (input?: string) => void;
  onExportSummary: () => void;
  onPrintReport: () => void;
};

function fieldValue(panel: AuxiliaryPanel | null, id: string) {
  return panel?.fields.find((field) => field.id === id)?.value ?? "";
}

function metricValue(summary: EncounterSummary, label: string) {
  return summary.panelMetrics?.find((metric) => metric.label === label)?.value ?? "";
}

function DecisionCard({
  title,
  lines,
  tone,
}: {
  title: string;
  lines: string[];
  tone?: "info" | "warning" | "danger";
}) {
  return (
    <View
      style={[
        coronaryStyles.decisionCard,
        tone === "warning" && coronaryStyles.decisionWarn,
        tone === "danger" && coronaryStyles.decisionDanger,
      ]}>
      <Text style={coronaryStyles.decisionTitle}>{title}</Text>
      {lines.map((line) => (
        <Text key={line} style={coronaryStyles.decisionLine}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function TimelineCard({ panel }: { panel: AuxiliaryPanel | null }) {
  const rows = [
    ["Início da dor", fieldValue(panel, "onsetTime")],
    ["Chegada", fieldValue(panel, "arrivalTime")],
    ["Primeiro ECG", fieldValue(panel, "firstEcgTime")],
    ["Troponina 1", fieldValue(panel, "troponin1Time")],
    ["Troponina 2", fieldValue(panel, "troponin2Time")],
    ["Diagnóstico", fieldValue(panel, "diagnosisTime")],
    ["Decisão", fieldValue(panel, "decisionTime")],
    ["Reperfusão", fieldValue(panel, "reperfusionStartTime")],
    ["Transferência", fieldValue(panel, "transferTime")],
  ].filter(([, value]) => value);

  if (!rows.length) return null;

  return (
    <View style={coronaryStyles.timelineCard}>
      <Text style={coronaryStyles.timelineTitle}>Timeline crítica</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={coronaryStyles.timelineRow}>
          <Text style={coronaryStyles.timelineLabel}>{label}</Text>
          <Text style={coronaryStyles.timelineValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CoronaryProtocolScreen({
  auxiliaryPanel,
  auxiliaryFieldSections,
  canGoBack,
  clinicalLog,
  encounterSummary,
  options,
  state,
  isCurrentStateTimerRunning,
  onActionRun,
  onConfirmAction,
  onExportSummary,
  onFieldChange,
  onGoBack,
  onPresetApply,
  onPrintReport,
  onRunTransition,
  onStatusChange,
  onUnitChange,
}: Props) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const [activeTab, setActiveTab] = useState(
    () => getProtocolUiState(encounterSummary.protocolId)?.activeTab ?? 0
  );

  useEffect(() => {
    updateProtocolUiState(encounterSummary.protocolId, { activeTab });
  }, [activeTab, encounterSummary.protocolId]);

  const heroMetrics = useMemo(
    () =>
      [
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Categoria"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "ECG"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "GRACE"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Destino"),
      ]
        .filter(Boolean)
        .map((metric, index) => ({
          label: metric!.label,
          value: metric!.value,
          accent: index === 0 ? "#be123c" : index === 1 ? "#0369a1" : index === 2 ? "#7c3aed" : "#1d4ed8",
        })),
    [encounterSummary.panelMetrics]
  );

  const decisionCards = (auxiliaryPanel?.recommendations ?? []).slice(0, 4);
  const finishSummaryLines = [
    { label: "Categoria final", value: metricValue(encounterSummary, "Categoria") || "—" },
    { label: "ECG", value: metricValue(encounterSummary, "ECG") || "—" },
    { label: "HEART", value: metricValue(encounterSummary, "HEART") || "—" },
    { label: "GRACE", value: metricValue(encounterSummary, "GRACE") || "—" },
    { label: "Reperfusão", value: metricValue(encounterSummary, "Reperfusão") || "—" },
    { label: "Destino", value: metricValue(encounterSummary, "Destino") || "—" },
  ].filter((row) => row.value !== "—");

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="Síndromes coronarianas"
          title="Dor torácica organizada por estratificação, biomarcador e estratégia"
          subtitle="Fluxo completo para STEMI, NSTEMI, angina instável e angina estável, com bloqueios explícitos quando ECG, troponina, contraindicações ou logística ainda não permitem uma decisão segura."
          badgeText={metricValue(encounterSummary, "Categoria") || "Fluxo coronariano"}
          metrics={heroMetrics}
          progressLabel={`Etapa ${activeTab + 1} de ${CORONARY_TABS.length}`}
          stepTitle={CORONARY_TABS[activeTab]?.label ?? state.text}
          hint={CORONARY_TABS[activeTab]?.guide ?? state.details?.[0]}
          compactMobile
        />
      }
      items={[...CORONARY_TABS]}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(Number(id))}
      sidebarEyebrow="Navegação coronária"
      sidebarTitle="Etapas do protocolo"
      contentEyebrow={`Etapa ${activeTab + 1} de ${CORONARY_TABS.length}`}
      contentTitle={CORONARY_TABS[activeTab]?.label ?? state.text}
      contentHint={CORONARY_TABS[activeTab]?.guide ?? state.details?.[0]}
      contentBadgeText="Fluxo clínico">
      {activeTab === 0 || activeTab === 2 || activeTab === 4 || activeTab === 5 ? <TimelineCard panel={auxiliaryPanel} /> : null}

      {decisionCards.length > 0 ? (
        <View style={coronaryStyles.decisionGrid}>
          {decisionCards.map((rec) => (
            <DecisionCard key={rec.title} title={rec.title} lines={rec.lines} tone={rec.tone} />
          ))}
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
          moduleMode="coronary"
        />
      ) : null}

      {activeTab === 5 && !isQuestion && !isEnd ? (
        <ModuleFinishPanel
          summaryTitle="Fechamento do caso coronariano"
          destination={metricValue(encounterSummary, "Destino")}
          summaryLines={finishSummaryLines}
          infoTitle="Pontos obrigatórios de segurança"
          infoLines={[
            "Nunca assumir que dado ausente equivale a ECG normal, troponina negativa ou dor não coronariana.",
            "Trombólise, anticoagulação, dupla antiagregação e estratégia invasiva exigem revisão de contraindicações e contexto clínico.",
            "Se ECG for inconclusivo, troponina estiver pendente ou tempos forem incertos, a conduta automática deve permanecer bloqueada ou em revisão.",
            "A recomendação do sistema é separada da decisão médica final e deve ser acompanhada de dupla checagem nas condutas de alto risco.",
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

      {!isQuestion && !isEnd && !isCurrentStateTimerRunning && activeTab === CORONARY_TABS.length - 1 ? (
        <View style={styles.primaryActions}>
          <Pressable style={styles.primaryButton} onPress={onConfirmAction}>
            <Text style={styles.primaryButtonText}>Finalizar registro</Text>
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

const coronaryStyles = StyleSheet.create({
  decisionGrid: {
    gap: 12,
    marginBottom: 18,
  },
  decisionCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#d6e3f8",
    backgroundColor: "#f8fbff",
    padding: 16,
    gap: 6,
  },
  decisionWarn: {
    borderColor: "#facc15",
    backgroundColor: "#fffbea",
  },
  decisionDanger: {
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  decisionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#122033",
  },
  decisionLine: {
    fontSize: 13,
    lineHeight: 18,
    color: "#46566f",
  },
  timelineCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#cfd8ea",
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 10,
    marginBottom: 18,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#122033",
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7c93",
  },
  timelineValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#122033",
  },
});
