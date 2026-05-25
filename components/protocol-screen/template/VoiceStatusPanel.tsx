import { Pressable, Text, View } from "react-native";
import { ACLS_COPY } from "../../../acls/microcopy";
import type { VoiceConfirmation } from "../voice-command-card";
import { palette, spacing, typography } from "../design-tokens";

type VoiceStatusPanelProps = {
  statusLabel: string;
  note: string;
  commands: string[];
  confirmation: VoiceConfirmation | null;
  onToggleVoice: () => void;
  voiceModeEnabled: boolean;
  showToggleButton?: boolean;
};

function VoiceStatusPanel({
  statusLabel,
  note,
  commands,
  confirmation,
  onToggleVoice,
  voiceModeEnabled,
  showToggleButton = true,
}: VoiceStatusPanelProps) {
  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderRadius: 28,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: palette.borderStrong,
        gap: spacing.sm,
        shadowColor: "#07181a",
        shadowOpacity: 0.14,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ ...typography.title, color: palette.text, fontSize: 20 }}>
            {ACLS_COPY.operational.sections.voice}
          </Text>
          <Text style={{ ...typography.small, color: palette.textSecondary, lineHeight: 18 }}>{note}</Text>
        </View>

        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: voiceModeEnabled ? palette.primary : palette.border,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: voiceModeEnabled ? "rgba(24,183,160,0.08)" : "#edf2ef",
          }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              backgroundColor: voiceModeEnabled ? palette.primary : palette.border,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>{statusLabel.charAt(0)}</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          borderRadius: 20,
          padding: 14,
          backgroundColor: "#eef6f1",
          borderWidth: 1,
          borderColor: "rgba(95,180,156,0.2)",
          gap: 8,
        }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "900",
            color: palette.primaryDark,
            textTransform: "uppercase",
            letterSpacing: 1.1,
          }}>
          Estado atual
        </Text>
        <Text style={{ ...typography.body, color: palette.text }}>
          {voiceModeEnabled ? ACLS_COPY.operational.voice.active : ACLS_COPY.operational.voice.activate}
        </Text>
      </View>

      {confirmation ? (
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#f3a7b3",
            padding: spacing.sm,
            backgroundColor: "#ffe8eb",
            gap: spacing.sm,
          }}>
          <Text style={{ ...typography.body, color: palette.critical }}>{confirmation.prompt}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: 2 }}>
            <Pressable
              style={{
                flex: 1,
                borderRadius: 18,
                backgroundColor: "#102128",
                paddingVertical: 12,
              }}
              onPress={confirmation.onConfirm}>
              <Text style={{ ...typography.body, color: "#fff", textAlign: "center" }}>
                {ACLS_COPY.operational.labels.confirm}
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: "#f8f5ef",
                paddingVertical: 12,
              }}
              onPress={confirmation.onCancel}>
              <Text style={{ ...typography.body, color: palette.text, textAlign: "center" }}>
                {ACLS_COPY.operational.labels.cancel}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {commands.map((command) => (
          <View
            key={command}
            style={{
              borderRadius: 18,
              backgroundColor: "#f2eee5",
              borderWidth: 1,
              borderColor: palette.border,
              paddingHorizontal: 14,
              paddingVertical: 9,
            }}>
            <Text style={{ fontSize: 13, color: palette.text, fontWeight: "700" }}>{command}</Text>
          </View>
        ))}
      </View>

      {showToggleButton ? (
        <Pressable
          style={{
            alignSelf: "stretch",
            backgroundColor: voiceModeEnabled ? "#102128" : palette.primaryDark,
            borderRadius: 22,
            paddingVertical: 15,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
          onPress={onToggleVoice}>
          <Text style={{ ...typography.body, color: "#fff", letterSpacing: 0.3, fontWeight: "800" }}>
            {voiceModeEnabled ? ACLS_COPY.operational.voice.active : ACLS_COPY.operational.voice.activate}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default VoiceStatusPanel;
