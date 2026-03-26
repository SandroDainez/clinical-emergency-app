import { Pressable, Text, View } from "react-native";
import { ACLS_COPY } from "../../acls/microcopy";
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
    ? ACLS_COPY.operational.labels.listening
    : modeEnabled
      ? ACLS_COPY.operational.voice.active
      : available
        ? ACLS_COPY.operational.voice.inactive
        : ACLS_COPY.operational.labels.unavailable;

  return (
    <View style={styles.voiceCard}>
      <View style={styles.voiceCardHeader}>
        <Text style={styles.voiceCardTitle}>{ACLS_COPY.operational.sections.voice}</Text>
        <Text
          style={[
            styles.voiceStatusBadge,
            listening && styles.voiceStatusListening,
          ]}>
          {statusLabel}
        </Text>
      </View>

      <Text style={styles.voiceDescription}>
        {ACLS_COPY.operational.voice.activate} para seguir a fase atual.
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
          {modeEnabled
            ? ACLS_COPY.operational.voice.deactivate
            : ACLS_COPY.operational.voice.activate}
        </Text>
      </Pressable>

      {transcript ? (
        <View style={styles.voiceTranscriptBox}>
          <Text style={styles.voiceTranscriptLabel}>
            {ACLS_COPY.operational.labels.voiceCaptured}
          </Text>
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
              <Text style={styles.voiceConfirmationButtonText}>
                {ACLS_COPY.operational.labels.confirm}
              </Text>
            </Pressable>
            <Pressable
              style={styles.voiceConfirmationButtonAlt}
              onPress={confirmation.onCancel}>
              <Text style={styles.voiceConfirmationButtonTextAlt}>
                {ACLS_COPY.operational.labels.cancel}
              </Text>
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
          <Text style={styles.voiceTranscriptLabel}>{ACLS_COPY.operational.ui.commands}</Text>
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
