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
import { ModuleFinishPanel, ModuleFlowHero } from "./module-flow-shell";
import {
  getAppGuidelinesStatus,
  fetchRemoteMetadata,
  type AppGuidelinesStatus,
} from "../../lib/guidelines-version";

type EapProtocolScreenProps = {
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

export default function EapProtocolScreen({
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
}: EapProtocolScreenProps) {
  const isQuestion = state.type === "question";
  const isEnd = state.type === "end";
  const [activeTab, setActiveTab] = useState(0);
  const [guidelinesStatus, setGuidelinesStatus] = useState<AppGuidelinesStatus>(() =>
    getAppGuidelinesStatus()
  );

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const fieldValue = (id: string) => auxiliaryPanel?.fields.find((field) => field.id === id)?.value ?? "";
  const heroMetrics = [
    auxiliaryPanel?.metrics.find((m) => m.label === "PAM estimada"),
    auxiliaryPanel?.metrics.find((m) => m.label === "SpO₂/FiO₂ (aprox.)"),
    { label: "O₂ atual", value: fieldValue("fio2Fraction") || "Não informado" },
  ]
    .filter(Boolean)
    .map((metric, index) => ({
      label: metric!.label,
      value: metric!.value,
      accent: index === 0 ? "#0f766e" : index === 1 ? "#1d4ed8" : "#b45309",
    }));
  const finishSummaryLines = [
    { label: "Hipótese", value: fieldValue("hypothesis") || "—" },
    { label: "PA / FC / SpO₂", value: [fieldValue("systolicPressure") && `${fieldValue("systolicPressure")}/${fieldValue("diastolicPressure")} mmHg`, fieldValue("heartRate") && `FC ${fieldValue("heartRate")}`, fieldValue("oxygenSaturation") && `SpO₂ ${fieldValue("oxygenSaturation")}%`].filter(Boolean).join(" · ") || "—" },
    { label: "Condutas", value: fieldValue("treatmentDone") || "—" },
    { label: "VMNI / CPAP", value: fieldValue("nivCpap") || "—" },
    { label: "Monitorização", value: fieldValue("monitoring") || "—" },
    { label: "Resposta", value: fieldValue("clinicalResponse") || "—" },
  ].filter((row) => row.value !== "—");

  function handleNextStep() {
    if (!isLastTab) {
      setActiveTab((t) => t + 1);
    } else {
      onConfirmAction();
    }
  }

  return (
    <>
      <ModuleFlowHero
        eyebrow="Edema Agudo de Pulmão"
        title="EAP organizado por prioridades de atendimento"
        subtitle="Fluxo visual mais claro para suporte ventilatório, vasodilatação, diurético, monitorização e destino, sem alterar a lógica clínica do módulo."
        badgeText={`AHA/ESC EAP · Revisado ${formatReviewDate(guidelinesStatus.lastFullReview)} · ${guidelinesStatus.overallStatus}`}
        metrics={heroMetrics}
        progressLabel={state.phaseLabel && state.phaseStep && state.phaseTotal ? `${state.phaseLabel} — etapa ${state.phaseStep} de ${state.phaseTotal}` : `Etapa ${activeTab + 1} de ${TOTAL_TABS}`}
        stepTitle={state.text}
        hint={state.details?.[0]}
      />

      {auxiliaryPanel ? (
        <SepsisFormTabs
          auxiliaryPanel={auxiliaryPanel}
          fieldSections={auxiliaryFieldSections}
          metrics={auxiliaryPanel.metrics}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onFieldChange={onFieldChange}
          onPresetApply={onPresetApply}
          onUnitChange={onUnitChange}
          onActionRun={onActionRun}
          onStatusChange={onStatusChange}
          moduleMode="eap"
        />
      ) : null}

      {auxiliaryPanel && isLastTab && !isQuestion && !isEnd ? (
        <ModuleFinishPanel
          summaryTitle="Fechamento do atendimento"
          destination={fieldValue("destination")}
          summaryLines={finishSummaryLines}
          infoTitle="Essenciais da patologia"
          infoLines={[
            "No EAP cardiogênico, posição sentada, oxigenação adequada e VMNI precoce costumam reduzir o trabalho respiratório e evitar intubação.",
            "Nitroglicerina é central no EAP hipertensivo; em hipotensão ou choque, vasodilatação pode piorar o quadro.",
            "Furosemida ajuda quando há congestão e sobrecarga, mas não substitui a correção hemodinâmica e ventilatória inicial.",
            "Falha de VMNI, rebaixamento, exaustão respiratória ou piora hemodinâmica exigem preparo imediato para via aérea avançada e leito crítico.",
          ]}
          narrative={fieldValue("caseNarrative")}
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
            <Text style={styles.primaryButtonText}>Finalizar</Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>Episódio registrado. Reavaliar resposta ao tratamento se necessário.</Text>
      ) : null}
    </>
  );
}
