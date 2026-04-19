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

const TABS = [
  { id: 0, icon: "🧑", label: "Paciente", step: "1", phaseTitle: "Identificação, tempos e origem", accent: "#0f766e" },
  { id: 1, icon: "🧠", label: "Quadro", step: "2", phaseTitle: "Sintomas, estabilidade e sinais vitais", accent: "#0369a1" },
  { id: 2, icon: "📏", label: "NIHSS", step: "3", phaseTitle: "Escala neurológica completa", accent: "#7c3aed" },
  { id: 3, icon: "🧪", label: "Imagem", step: "4", phaseTitle: "TC, CTA e laboratórios", accent: "#b45309" },
  { id: 4, icon: "💉", label: "Reperfusão", step: "5", phaseTitle: "Elegibilidade e trombolítico", accent: "#be123c" },
  { id: 5, icon: "🏥", label: "Destino", step: "6", phaseTitle: "Destino, checklist e auditoria", accent: "#1d4ed8" },
];

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
        avcStyles.decisionCard,
        tone === "warning" && avcStyles.decisionWarn,
        tone === "danger" && avcStyles.decisionDanger,
      ]}>
      <Text style={avcStyles.decisionTitle}>{title}</Text>
      {lines.map((line) => (
        <Text key={line} style={avcStyles.decisionLine}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function TimelineCard({ panel }: { panel: AuxiliaryPanel | null }) {
  const rows = [
    ["Última vez normal", fieldValue(panel, "lastKnownWellTime")],
    ["Chegada", fieldValue(panel, "arrivalTime")],
    ["TC solicitada", fieldValue(panel, "ctRequestedAt")],
    ["TC realizada", fieldValue(panel, "ctPerformedAt")],
    ["TC interpretada", fieldValue(panel, "ctReadAt")],
    ["Decisão médica", fieldValue(panel, "finalMedicalDecision")],
  ].filter(([, value]) => value);

  if (!rows.length) return null;

  return (
    <View style={avcStyles.timelineCard}>
      <Text style={avcStyles.timelineTitle}>Timeline crítica do caso</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={avcStyles.timelineRow}>
          <Text style={avcStyles.timelineLabel}>{label}</Text>
          <Text style={avcStyles.timelineValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
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
  onConfirmAction,
  onRunTransition,
  onExportSummary,
  onPrintReport,
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
        encounterSummary.panelMetrics?.find((metric) => metric.label === "NIHSS"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Diagnóstico sindrômico"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Trombólise"),
        encounterSummary.panelMetrics?.find((metric) => metric.label === "Destino"),
      ]
        .filter(Boolean)
        .map((metric, index) => ({
          label: metric!.label,
          value: metric!.value,
          accent: index === 0 ? "#7c3aed" : index === 1 ? "#0369a1" : index === 2 ? "#be123c" : "#1d4ed8",
        })),
    [encounterSummary.panelMetrics]
  );

  const decisionCards = (auxiliaryPanel?.recommendations ?? []).slice(0, 2);
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
          subtitle="Fluxo de avaliação e conduta com bloqueios explícitos de segurança."
          badgeText={metricValue(encounterSummary, "Diagnóstico sindrômico") || "Fluxo AVC"}
          metrics={heroMetrics}
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
      {activeTab === 0 ? <TimelineCard panel={auxiliaryPanel} /> : null}

      {decisionCards.length > 0 ? (
        <View style={avcStyles.decisionGrid}>
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
          moduleMode="avc"
        />
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

      {!isQuestion && !isEnd && !isCurrentStateTimerRunning && activeTab === TABS.length - 1 ? (
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

const avcStyles = StyleSheet.create({
  decisionGrid: {
    gap: 8,
    marginBottom: 8,
  },
  decisionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#f8fbff",
    padding: 12,
    gap: 4,
  },
  decisionWarn: {
    borderColor: "#f5d58f",
    backgroundColor: "#fff9eb",
  },
  decisionDanger: {
    borderColor: "#f3b0b0",
    backgroundColor: "#fff1f1",
  },
  decisionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  decisionLine: {
    fontSize: 12,
    lineHeight: 16,
    color: "#334155",
    fontWeight: "600",
  },
  timelineCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe7f3",
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 6,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbe7f3",
    paddingBottom: 8,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  timelineValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
});
