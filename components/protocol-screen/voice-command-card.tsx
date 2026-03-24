import { Pressable, Text, View } from "react-native";
import type {
  AclsVoiceCommandHint,
  AclsVoiceRuntimeStatus,
} from "../../acls/voice-runtime";
import { styles } from "./protocol-screen-styles";

type VoiceConfirmation = {
  prompt: string;
  onConfirm: () => void;
  onCancel: () => void;
};

type VoiceCommandCardProps = {
  available: boolean;
  modeEnabled: boolean;
  status: AclsVoiceRuntimeStatus;
  transcript: string;
  feedback: string;
  commandHints: AclsVoiceCommandHint[];
  confirmation: VoiceConfirmation | null;
  emphasizeHints: boolean;
  onToggleMode: () => void;
};

function VoiceCommandCard({
  available,
  modeEnabled,
  status,
  transcript,
  feedback,
  commandHints,
  confirmation,
  emphasizeHints,
  onToggleMode,
}: VoiceCommandCardProps) {
  const listening = status === "listening";
  const statusLabel = listening
    ? "Ouvindo"
    : modeEnabled
      ? "Voz ativa"
      : available
        ? "Voz inativa"
        : "Indisponível";

  return (
    <View style={styles.voiceCard}>
      <View style={styles.voiceCardHeader}>
        <Text style={styles.voiceCardTitle}>Comando de voz</Text>
        <Text
          style={[
            styles.voiceStatusBadge,
            listening && styles.voiceStatusListening,
          ]}>
          {statusLabel}
        </Text>
      </View>

      <Text style={styles.voiceDescription}>
        Ative o modo voz para manter escuta guiada pela etapa atual sem mudar a lógica clínica.
      </Text>

      <Pressable
        style={[
          styles.voicePrimaryButton,
          !available && styles.voicePrimaryButtonDisabled,
        ]}
        onPress={onToggleMode}
        disabled={!available}>
        <Text
          style={[
            styles.voicePrimaryButtonText,
            !available && styles.voicePrimaryButtonTextDisabled,
          ]}>
          {modeEnabled ? "Desativar modo voz" : "Ativar modo voz"}
        </Text>
      </Pressable>

      {transcript ? (
        <View style={styles.voiceTranscriptBox}>
          <Text style={styles.voiceTranscriptLabel}>Transcrição</Text>
          <Text style={styles.voiceTranscriptText}>{transcript}</Text>
        </View>
      ) : null}

      {feedback ? <Text style={styles.voiceFeedbackText}>{feedback}</Text> : null}

      {confirmation ? (
        <View style={styles.voiceConfirmationCard}>
          <Text style={styles.voiceConfirmationTitle}>{confirmation.prompt}</Text>
          <View style={styles.voiceConfirmationActions}>
            <Pressable
              style={styles.voiceConfirmationButton}
              onPress={confirmation.onConfirm}>
              <Text style={styles.voiceConfirmationButtonText}>Confirmar</Text>
            </Pressable>
            <Pressable
              style={styles.voiceConfirmationButtonAlt}
              onPress={confirmation.onCancel}>
              <Text style={styles.voiceConfirmationButtonTextAlt}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {commandHints.length > 0 ? (
        <View
          style={[
            styles.voiceTranscriptBox,
            emphasizeHints && styles.voiceTranscriptBoxHighlighted,
          ]}>
          <Text style={styles.voiceTranscriptLabel}>Comandos válidos</Text>
          {commandHints.map((hint) => (
            <Text key={hint.intent} style={styles.voiceTranscriptText}>
              • {hint.label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export type { VoiceConfirmation };
export default VoiceCommandCard;
