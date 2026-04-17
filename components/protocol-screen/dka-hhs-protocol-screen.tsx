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
import { DKA_HHS_TABS } from "./dka-hhs-tab-config";

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

const TOTAL_TABS = 5;

export default function DkaHhsProtocolScreen(props: Props) {
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

  useEffect(() => {
    fetchRemoteMetadata().then((remote) => {
      if (remote) setGuidelinesStatus(getAppGuidelinesStatus(remote));
    });
  }, []);

  const isLastTab = activeTab === TOTAL_TABS - 1;
  const tabMeta = DKA_HHS_TABS[activeTab];
  const fieldValue = (id: string) => auxiliaryPanel?.fields.find((field) => field.id === id)?.value ?? "";
  const heroMetrics = [
    auxiliaryPanel?.metrics.find((m) => m.label === "Classificação"),
    auxiliaryPanel?.metrics.find((m) => m.label === "Osmolaridade (est.)"),
    auxiliaryPanel?.metrics.find((m) => m.label === "GAP aniônico"),
  ]
    .filter(Boolean)
    .map((metric, index) => ({
      label: metric!.label,
      value: metric!.value,
      accent: index === 0 ? "#0f766e" : index === 1 ? "#1d4ed8" : "#7c3aed",
    }));

  const finishSummaryLines = [
    { label: "Classificação", value: auxiliaryPanel?.metrics.find((m) => m.label === "Classificação")?.value ?? "—" },
    { label: "Glicemia", value: fieldValue("glucose") ? `${fieldValue("glucose")} mg/dL` : "—" },
    { label: "Acidose", value: [fieldValue("ph") && `pH ${fieldValue("ph")}`, fieldValue("bicarb") && `HCO₃⁻ ${fieldValue("bicarb")}`].filter(Boolean).join(" · ") || "—" },
    { label: "Conduta hídrica", value: fieldValue("treatmentFluids") || "—" },
    { label: "Insulina IV", value: fieldValue("treatmentInsulin") || "—" },
    { label: "Potássio", value: fieldValue("treatmentPotassium") || "—" },
    { label: "Resposta", value: fieldValue("clinicalResponse") || "—" },
  ].filter((row) => row.value !== "—");

  function handleNextStep() {
    if (!isLastTab) setActiveTab((t) => t + 1);
    else onConfirmAction();
  }

  const sidebarItems = DKA_HHS_TABS.map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: tab.label,
    hint: tab.phaseTitle || tab.label,
    step: tab.step,
    accent: tab.id === 0 ? "#0f766e" : tab.id === 1 ? "#0369a1" : tab.id === 2 ? "#7c3aed" : tab.id === 3 ? "#b45309" : "#be123c",
  }));

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
        eyebrow="CAD / EHH"
        title="Emergência hiperglicêmica organizada por etapas"
        subtitle="Avaliação, laboratório, condutas e transição final em um fluxo mais limpo, mantendo o engine clínico atual."
        badgeText={`ADA CAD/HHS · Revisado ${formatReviewDate(guidelinesStatus.lastFullReview)} · ${guidelinesStatus.overallStatus}`}
        metrics={heroMetrics}
        progressLabel={tabMeta?.phaseTitle ? `Etapa ${activeTab + 1} de ${TOTAL_TABS} — ${tabMeta.phaseTitle}` : `Etapa ${activeTab + 1} de ${TOTAL_TABS}`}
        stepTitle={state.text}
        hint={state.details?.join(" ")}
        showStepCard={false}
        />
      }
      items={sidebarItems}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(Number(id))}
      sidebarEyebrow="Navegação CAD/EHH"
      sidebarTitle="Etapas do protocolo"
      contentEyebrow={`Etapa ${activeTab + 1} de ${TOTAL_TABS}`}
      contentTitle={tabMeta?.label ?? state.text}
      contentHint={state.details?.join(" ") || tabMeta?.phaseTitle}
      contentBadgeText="Fluxo clínico">

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
          moduleMode="dka_hhs"
        />
      ) : null}

      {auxiliaryPanel && isLastTab && !isQuestion && !isEnd ? (
        <ModuleFinishPanel
          summaryTitle="Fechamento do atendimento"
          destination={fieldValue("destination")}
          summaryLines={finishSummaryLines}
          infoTitle="Essenciais da patologia"
          infoLines={[
            "CAD é resolvida por hidratação, correção de K, insulina IV e fechamento progressivo do gap aniônico.",
            "No EHH, a correção osmótica deve ser mais lenta; a reposição volêmica costuma ser o eixo inicial principal.",
            "Nunca iniciar insulina se K < 3,3 mEq/L; primeiro corrigir potássio e reavaliar.",
            "A transição para SC exige estabilidade clínica, resolução metabólica e sobreposição da basal antes de desligar a IV.",
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
            <Text style={styles.primaryButtonText}>Finalizar atendimento</Text>
          </Pressable>
        </View>
      ) : null}

      {isEnd ? (
        <Text style={styles.endText}>
          Atendimento registrado. Continuar monitorização e critérios de resolução conforme protocolo.
        </Text>
      ) : null}
    </ModuleFlowLayout>
  );
}
