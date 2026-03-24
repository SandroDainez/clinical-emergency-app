import { Pressable, Text, View } from "react-native";
import type { VoiceConfirmation } from "../voice-command-card";
import { palette, spacing, typography } from "../design-tokens";

type VoiceStatusPanelProps = {
  statusLabel: string;
  note: string;
  commands: string[];
  confirmation: VoiceConfirmation | null;
  onToggleVoice: () => void;
  voiceModeEnabled: boolean;
};

function VoiceStatusPanel({ statusLabel, note, commands, confirmation, onToggleVoice, voiceModeEnabled }: VoiceStatusPanelProps) {
  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderRadius: 24,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: palette.borderStrong,
        gap: spacing.sm,
        shadowColor: "#0d1b2a",
        shadowOpacity: 0.1,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
      }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ ...typography.title, color: palette.text }}>Comando de voz</Text>
          <Text style={{ ...typography.small, color: palette.textSecondary }}>{note}</Text>
        </View>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: voiceModeEnabled ? palette.primary : palette.border,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              backgroundColor: voiceModeEnabled ? palette.primary : palette.border,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{statusLabel.charAt(0)}</Text>
          </View>
        </View>
      </View>
      {confirmation ? (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: palette.critical, padding: spacing.sm, backgroundColor: "#ffe5e5" }}>
          <Text style={{ ...typography.body, color: palette.critical }}>{confirmation.prompt}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
            <Pressable
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: palette.primaryDark,
                paddingVertical: 12,
              }}
              onPress={confirmation.onConfirm}>
              <Text style={{ ...typography.body, color: "#fff", textAlign: "center" }}>Confirmar</Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: palette.border,
                paddingVertical: 12,
              }}
              onPress={confirmation.onCancel}>
              <Text style={{ ...typography.body, color: palette.text, textAlign: "center" }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {commands.map((command) => (
          <View
            key={command}
            style={{
              borderRadius: 16,
              backgroundColor: palette.surfaceAlt,
              borderWidth: 1,
              borderColor: palette.borderStrong,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}>
            <Text style={{ fontSize: 13, color: palette.text }}>{command}</Text>
          </View>
        ))}
      </View>
      <Pressable
        style={{
          alignSelf: "stretch",
          backgroundColor: voiceModeEnabled ? palette.primaryDark : palette.primaryLight,
          borderRadius: 18,
          paddingVertical: 14,
          alignItems: "center",
        }}
        onPress={onToggleVoice}>
        <Text style={{ ...typography.body, color: "#fff", letterSpacing: 0.3 }}>
          {voiceModeEnabled ? "Modo voz ativo" : "Ativar modo voz"}
        </Text>
      </Pressable>
    </View>
  );
}

export default VoiceStatusPanel;
