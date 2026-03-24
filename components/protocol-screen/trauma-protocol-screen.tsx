import ProtocolScreenTemplate, { type ProtocolTemplateContract } from "./template/ProtocolScreenTemplate";
import { type VoiceConfirmation } from "./voice-command-card";

type TraumaProtocolScreenProps = {
  onBack: () => void;
  onRunTransition: (input: string) => void;
  onConfirmAction: () => void;
  voiceStatusLabel: string;
  voiceNote: string;
  voiceCommands: string[];
  voiceConfirmation: VoiceConfirmation | null;
  voiceModeEnabled: boolean;
  onToggleVoice: () => void;
};

function TraumaProtocolScreen({
  onBack,
  onRunTransition,
  onConfirmAction,
  voiceStatusLabel,
  voiceNote,
  voiceCommands,
  voiceConfirmation,
  voiceModeEnabled,
  onToggleVoice,
}: TraumaProtocolScreenProps) {
  const actionItems = [
    "Garantir segurança da cena",
    "Aplicar torniquete proximal se hemorragia externa",
    "Monitorar via aérea e respiratória",
  ];

  const decisionOptions = [
    { id: "torniquete", label: "Hemorragia arterial" },
    { id: "controle", label: "Controle de via aérea" },
  ];

  const contract: ProtocolTemplateContract = {
    header: { protocolLabel: "Trauma crítico", onBack },
    summary: {
      title: "Controle inicial",
      instruction: "Estabilize o paciente, remova o sangramento e prepare a transferência imediata.",
      nextStep: "Rápida avaliação secundária",
      progress: 0.35,
    },
    checklist: { title: "Prioridades imediatas", items: actionItems },
    decisions: { options: decisionOptions, onSelect: onRunTransition },
    voice: {
      statusLabel: voiceStatusLabel,
      note: voiceNote,
      commands: voiceCommands,
      confirmation: voiceConfirmation,
      onToggleVoice,
      voiceModeEnabled,
    },
    footerAction: { label: "Confirmar conduta", onPress: onConfirmAction, visible: true },
  };

  return (
    <ProtocolScreenTemplate contract={contract} />
  );
}

export default TraumaProtocolScreen;
