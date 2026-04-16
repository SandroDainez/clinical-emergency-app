import { Pressable, Text, View } from "react-native";
import { useState, useEffect } from "react";
import type {
  AuxiliaryPanel,
  ClinicalLogEntry,
  EncounterSummary,
  ProtocolState,
} from "../../clinical-engine";
import ClinicalLogCard from "./clinical-log-card";
import SepsisFormTabs from "./sepsis-form-tabs";
import { styles } from "./protocol-screen-styles";
import DecisionGrid from "./template/DecisionGrid";
import { formatOptionLabel, formatReviewDate, getOptionSublabel } from "./protocol-screen-utils";
import { ModuleFinishPanel, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";
import { VENT_TABS } from "./ventilation-tab-config";

type Props = {
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  canGoBack: boolean;
  clinicalLog: ClinicalLogEntry[];
  encounterSummary: EncounterSummary;
  options: string[];
  state: ProtocolState;
  isCurrentStateTimerRunning: boolean;
  actionButtonLabel: string;
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

const TOTAL_TABS = 4;


export default function VentilationProtocolScreen(props: Props) {
  const {
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
  } = props;

  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const [activeTab, setActiveTab] = useState(0);
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );
  const visibleAuxiliaryPanel = auxiliaryPanel
    ? {
        ...auxiliaryPanel,
        actions: auxiliaryPanel.actions.filter((action) => {
          if (action.id === "apply_initial_vent_setup") {
            return activeTab === 0;
          }
          if (action.id === "record_gasometry_snapshot") {
            return activeTab === 2;
          }
          return false;
        }),
      }
    : null;

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabMeta = VENT_TABS[activeTab];
  const currentCaseLabel =
    auxiliaryFieldSections
      .flatMap(([, fields]) => fields)
      .find((field) => field.id === "caseLabel")?.value?.trim() || "Caso sem identificação";
  const selectedVentMode =
    auxiliaryFieldSections
      .flatMap(([, fields]) => fields)
      .find((field) => field.id === "ventMode")?.value?.trim() || "";

  function handleActionRun(actionId: string, requiresConfirmation?: boolean) {
    onActionRun(actionId, requiresConfirmation);

    if (actionId === "apply_initial_vent_setup") {
      setActiveTab(1);
    }
    if (actionId === "record_gasometry_snapshot") {
      setActiveTab(3);
    }
  }

  const gasometryEntries = clinicalLog.filter((entry) => entry.title === "Gasometria registrada").slice(0, 6);
  const fieldValue = (id: string) =>
    auxiliaryFieldSections.flatMap(([, fields]) => fields).find((field) => field.id === id)?.value?.trim() || "";
  const heroMetrics = [
    { label: "Caso atual", value: currentCaseLabel },
    { label: "Modo", value: selectedVentMode || "Não definido" },
    visibleAuxiliaryPanel?.metrics?.[0] ?? { label: "Setup", value: "Preencher dados para sugestão" },
  ].map((metric, index) => ({
    label: metric.label,
    value: metric.value,
    accent: index === 0 ? "#0f766e" : index === 1 ? "#1d4ed8" : "#b45309",
  }));
  const finishSummaryLines = [
    { label: "Modo", value: selectedVentMode || "—" },
    { label: "Peso / altura", value: [fieldValue("weightKg") && `${fieldValue("weightKg")} kg`, fieldValue("heightCm") && `${fieldValue("heightCm")} cm`].filter(Boolean).join(" · ") || "—" },
    { label: "VT / FR / PEEP", value: [fieldValue("tidalVolume"), fieldValue("respiratoryRate"), fieldValue("peep")].some(Boolean) ? `VT ${fieldValue("tidalVolume") || "—"} · FR ${fieldValue("respiratoryRate") || "—"} · PEEP ${fieldValue("peep") || "—"}` : "—" },
    { label: "FiO₂ / SpO₂", value: [fieldValue("fio2") && `FiO₂ ${fieldValue("fio2")}`, fieldValue("spo2") && `SpO₂ ${fieldValue("spo2")}%`].filter(Boolean).join(" · ") || "—" },
    { label: "Pressão de platô", value: fieldValue("plateauPressure") ? `${fieldValue("plateauPressure")} cmH₂O` : "—" },
    { label: "Plano final", value: fieldValue("freeNotes") || "—" },
  ].filter((row) => row.value !== "—");

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((t) => t + 1);
      return;
    }

    setActiveTab(2);
  }

  const sidebarItems = VENT_TABS.map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: tab.label,
    hint: tab.phaseTitle,
    step: tab.step,
    accent: tab.id === 0 ? "#0f766e" : tab.id === 1 ? "#1d4ed8" : tab.id === 2 ? "#7c3aed" : "#b45309",
  }));

  return (
    <ModuleFlowLayout
      hero={
      <View
        style={{
          marginHorizontal: 12,
          marginTop: 8,
          marginBottom: 2,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}>
        <Pressable
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#fecaca",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
          onPress={() => {
            onActionRun("start_new_vent_case");
            setActiveTab(0);
          }}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: "#b91c1c" }}>Novo caso</Text>
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <ModuleFlowHero
            eyebrow="Ventilação Mecânica"
            title="Ventilação organizada por setup e reavaliação"
            subtitle="O módulo mantém o cálculo de setup, gasometria seriada e ajuste ventilatório, agora com leitura visual mais clara por etapa."
            badgeText={`VM Protetora · Revisado ${formatReviewDate(guidelinesStatus.lastFullReview)} · ${guidelinesStatus.overallStatus}`}
            metrics={heroMetrics}
            progressLabel={`Etapa ${activeTab + 1} de ${TOTAL_TABS} — ${tabMeta?.phaseTitle ?? ""}`}
            stepTitle={tabMeta?.headline ?? state.text}
            hint={tabMeta?.description}
          />
        </View>
      </View>
      }
      items={sidebarItems}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(Number(id))}
      sidebarEyebrow="Navegação da ventilação"
      sidebarTitle="Etapas do módulo">

      {visibleAuxiliaryPanel ? (
        <>
          {activeTab === 1 && selectedVentMode ? (
            <View
              style={[
                styles.card,
                {
                  marginHorizontal: 8,
                  marginBottom: 8,
                  backgroundColor: "#ecfeff",
                  borderColor: "#a5f3fc",
                  gap: 6,
                },
              ]}>
              <Text style={[styles.sectionTitle, { color: "#0f766e" }]}>Modo ventilatório ativo</Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>{selectedVentMode}</Text>
              <Text style={{ fontSize: 13, lineHeight: 19, color: "#155e75", fontWeight: "600" }}>
                Os campos abaixo se adaptam ao modo selecionado para a tela ficar mais coerente com o ajuste que você está fazendo.
              </Text>
            </View>
          ) : null}

          <SepsisFormTabs
            auxiliaryPanel={visibleAuxiliaryPanel}
            fieldSections={auxiliaryFieldSections}
            metrics={visibleAuxiliaryPanel.metrics}
            activeTab={activeTab}
            externalNavigation
            onTabChange={setActiveTab}
            onFieldChange={onFieldChange}
            onPresetApply={onPresetApply}
            onUnitChange={onUnitChange}
            onActionRun={handleActionRun}
            onStatusChange={onStatusChange}
            moduleMode="ventilation"
          />
        </>
      ) : null}

      {activeTab >= 2 && gasometryEntries.length > 0 ? (
        <View style={[styles.card, { gap: 10 }]}>
          <Text style={styles.sectionTitle}>Gasometrias registradas</Text>
          {gasometryEntries.map((entry, index) => (
            <View
              key={`${entry.timestamp}-${entry.title}`}
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 12,
                padding: 12,
                gap: 6,
              }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#0369a1" }}>
                Gasometria {gasometryEntries.length - index}
                {" · "}
                {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: "#334155" }}>{entry.details}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!isEnd && !isQuestion && isLastTab ? (
        <ModuleFinishPanel
          summaryTitle="Fechamento do caso ventilatório"
          destination={selectedVentMode || undefined}
          summaryLines={finishSummaryLines}
          infoTitle="Essenciais da patologia"
          infoLines={[
            "Ventilação mecânica deve ser guiada por cenário clínico, peso/altura, mecânica pulmonar e gasometria seriada.",
            "PEEP, FiO₂, volume corrente e frequência respiratória precisam ser revistos em conjunto, não isoladamente.",
            "Pressão de platô e resposta gasométrica ajudam a detectar risco de volutrauma, hipoventilação e ajuste inadequado.",
            "Cada reavaliação precisa terminar com um plano explícito de ajuste e novo ponto de checagem.",
          ]}
          narrative={fieldValue("freeNotes")}
        />
      ) : null}

      {isEnd ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
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
            options={options.map((opt) => ({
              id: opt,
              label: formatOptionLabel(opt),
              sublabel: getOptionSublabel(opt),
            }))}
            title={state.text}
            onSelect={(id) => onRunTransition(id)}
          />
        </View>
      ) : null}

      {!isQuestion && !isEnd && !isCurrentStateTimerRunning && isLastTab ? (
        <View style={styles.primaryActions}>
          <Pressable style={styles.primaryButton} onPress={handleNextStep}>
            <Text style={styles.primaryButtonText}>Nova gasometria para reavaliar ajustes</Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={onConfirmAction}>
            <Text style={styles.backButtonText}>Encerrar caso</Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>
          Sessão encerrada. Guarde o resumo e revise alarmes e gasometria após mudanças no ventilador.
        </Text>
      ) : null}
    </ModuleFlowLayout>
  );
}
