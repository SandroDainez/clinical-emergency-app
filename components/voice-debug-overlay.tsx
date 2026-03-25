import { Text, View } from "react-native";
import { palette, spacing, typography } from "./protocol-screen/design-tokens";

export type VoiceDebugInfo = {
  enabled: boolean;
  stateId: string;
  voiceStatus: string;
  presentation: string;
  voiceModeEnabled: boolean;
  allowedHints: string[];
  baseIntents: string[];
};

export default function VoiceDebugOverlay({ info }: { info?: VoiceDebugInfo }) {
  if (!info?.enabled) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: "rgba(30,64,175,0.85)",
        borderRadius: 16,
        padding: spacing.sm,
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
      }}>
      <Text style={{ ...typography.small, color: palette.surface }}>DEBUG VOZ</Text>
      <Text style={{ ...typography.body, color: "#fff" }}>stateId: {info.stateId}</Text>
      <Text style={{ ...typography.body, color: "#fff" }}>status: {info.voiceStatus}</Text>
      <Text style={{ ...typography.body, color: "#fff" }}>cue: {info.presentation}</Text>
      <Text style={{ ...typography.small, color: "#d1d5db" }}>
        hints: {info.allowedHints.join(", ") || "nenhum"}
      </Text>
      <Text style={{ ...typography.small, color: "#d1d5db" }}>
        intents: {info.baseIntents.join(", ") || "nenhum"}
      </Text>
      <Text style={{ ...typography.small, color: "#d1d5db" }}>
        modo: {info.voiceModeEnabled ? "ativo" : "inativo"}
      </Text>
    </View>
  );
}
