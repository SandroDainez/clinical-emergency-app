import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import type { VoiceConfirmation } from "../voice-command-card";
import ActionChecklistCard from "./ActionChecklistCard";
import DecisionGrid from "./DecisionGrid";
import FixedFooterAction from "./FixedFooterAction";
import StepHeaderBar from "./StepHeaderBar";
import StepSummaryCard from "./StepSummaryCard";
import VoiceStatusPanel from "./VoiceStatusPanel";
import { styles } from "../protocol-screen-styles";

type ProtocolHeaderConfig = {
  protocolLabel: string;
  onBack: () => void;
};

type ProtocolSummaryConfig = {
  title: string;
  instruction: string;
  nextStep?: string;
  progress: number;
};

type ProtocolChecklistConfig = {
  title: string;
  items: string[];
};

type DecisionOption = {
  id: string;
  label: string;
};

type ProtocolDecisionsConfig = {
  options: DecisionOption[];
  onSelect: (id: string) => void;
};

type ProtocolVoiceConfig = {
  statusLabel: string;
  note: string;
  commands: string[];
  confirmation: VoiceConfirmation | null;
  onToggleVoice: () => void;
  voiceModeEnabled: boolean;
};

type ProtocolFooterActionConfig = {
  label: string;
  onPress: () => void;
  visible: boolean;
};

export type ProtocolTemplateContract = {
  header: ProtocolHeaderConfig;
  summary: ProtocolSummaryConfig;
  checklist: ProtocolChecklistConfig;
  decisions: ProtocolDecisionsConfig;
  voice: ProtocolVoiceConfig;
  footerAction: ProtocolFooterActionConfig;
  secondarySections?: ReactNode[];
};

type ProtocolScreenTemplateProps = {
  contract: ProtocolTemplateContract;
  children?: ReactNode;
};

function ProtocolScreenTemplate({ contract, children }: ProtocolScreenTemplateProps) {
  const { header, summary, checklist, decisions, voice, footerAction, secondarySections } = contract;

  return (
    <View style={styles.screenWrapper}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StepHeaderBar protocolLabel={header.protocolLabel} onBack={header.onBack} />
        <StepSummaryCard title={summary.title} instruction={summary.instruction} nextStep={summary.nextStep} progress={summary.progress} />
        <ActionChecklistCard title={checklist.title} items={checklist.items} />
        <DecisionGrid options={decisions.options} onSelect={decisions.onSelect} />
        <VoiceStatusPanel
          statusLabel={voice.statusLabel}
          note={voice.note}
          commands={voice.commands}
          confirmation={voice.confirmation}
          onToggleVoice={voice.onToggleVoice}
          voiceModeEnabled={voice.voiceModeEnabled}
        />
        {secondarySections?.map((section, index) => (
          <View key={`section-${index}`} style={styles.secondarySection}>
            {section}
          </View>
        ))}
        {children}
      </ScrollView>
      <FixedFooterAction label={footerAction.label} onPress={footerAction.onPress} visible={footerAction.visible} />
    </View>
  );
}

export default ProtocolScreenTemplate;
