import { Pressable, Text, View } from "react-native";
import type { AuxiliaryPanel, ClinicalLogEntry, EncounterSummary, ProtocolState, ReversibleCause, SepsisHubData } from "../../clinical-engine";
import type { AclsScreenModel } from "../../acls/screen-model";
import AuxiliaryPanelCard from "./auxiliary-panel-card";
import ClinicalLogCard from "./clinical-log-card";
import ProtocolHeaderCard from "./protocol-header-card";
import SepsisHub, { SepsisFocusChecklist } from "./sepsis-hub";
import { styles } from "./protocol-screen-styles";
import { formatOptionLabel } from "./protocol-screen-utils";

type SepsisProtocolScreenProps = {
  auxiliaryPanel: AuxiliaryPanel | null;
  auxiliaryFieldSections: [string, AuxiliaryPanel["fields"]][];
  canGoBack: boolean;
  clinicalLog: ClinicalLogEntry[];
  encounterSummary: EncounterSummary;
  options: string[];
  screenModel: AclsScreenModel;
  sepsisHubData: SepsisHubData | null;
  state: ProtocolState;
  reversibleCauses: ReversibleCause[];
  isCurrentStateTimerRunning: boolean;
  actionButtonLabel: string;
  onBundleStatusUpdate: (itemId: string, status: "pendente" | "solicitado" | "realizado") => void;
  onFocusStatusUpdate: (causeId: string, status: "suspeita" | "abordada") => void;
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

function SepsisProtocolScreen({
  auxiliaryPanel,
  auxiliaryFieldSections,
  canGoBack,
  clinicalLog,
  encounterSummary,
  options,
  screenModel,
  sepsisHubData,
  state,
  reversibleCauses,
  isCurrentStateTimerRunning,
  actionButtonLabel,
  onBundleStatusUpdate,
  onFocusStatusUpdate,
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
}: SepsisProtocolScreenProps) {
  return (
    <>
      <ProtocolHeaderCard screenModel={screenModel} stateType={state.type} />

      {sepsisHubData ? (
        <SepsisHub data={sepsisHubData} onStatusUpdate={onBundleStatusUpdate} />
      ) : null}
      <SepsisFocusChecklist causes={reversibleCauses} onUpdate={onFocusStatusUpdate} />

      <View style={styles.secondaryActions}>
        {auxiliaryPanel ? (
          <AuxiliaryPanelCard
            auxiliaryPanel={auxiliaryPanel}
            fieldSections={auxiliaryFieldSections}
            onFieldChange={onFieldChange}
            onPresetApply={onPresetApply}
            onUnitChange={onUnitChange}
            onActionRun={onActionRun}
            onStatusChange={onStatusChange}
          />
        ) : null}
      </View>

      {state.type === "end" ? (
        <ClinicalLogCard
          clinicalLog={clinicalLog}
          encounterSummary={encounterSummary}
          onExport={onExportSummary}
          onPrint={onPrintReport}
        />
      ) : null}

      {state.type === "action" && !isCurrentStateTimerRunning ? (
        <View style={styles.primaryActions}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Voltar etapa</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.primaryButton} onPress={onConfirmAction}>
            <Text style={styles.primaryButtonText}>{actionButtonLabel}</Text>
          </Pressable>
        </View>
      ) : null}

      {state.type === "question" ? (
        <View style={styles.actions}>
          {canGoBack ? (
            <Pressable style={styles.backButton} onPress={onGoBack}>
              <Text style={styles.backButtonText}>Voltar etapa</Text>
            </Pressable>
          ) : null}
          {options.map((option) => (
            <Pressable key={option} style={styles.optionButton} onPress={() => onRunTransition(option)}>
              <Text style={styles.optionButtonText}>{formatOptionLabel(option)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {state.type === "end" ? (
        <Text style={styles.endText}>
          Atendimento finalizado. Reavaliar contexto clínico se necessário.
        </Text>
      ) : null}
    </>
  );
}

export default SepsisProtocolScreen;
