import { Pressable, Text, View } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type StepHeaderBarProps = {
  protocolLabel: string;
  onBack: () => void;
};

function StepHeaderBar({ protocolLabel, onBack }: StepHeaderBarProps) {
  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderRadius: 18,
        padding: spacing.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: palette.border,
        marginBottom: spacing.md,
      }}>
      <Pressable
        onPress={onBack}
        style={{
          backgroundColor: "#ffffff",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.primary,
        }}>
        <Text style={{ ...typography.small, color: palette.primary }}>Voltar</Text>
      </Pressable>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ ...typography.small, color: palette.muted }}>{protocolLabel}</Text>
        <Text style={{ ...typography.title, color: palette.text }}>ACLS · Emergência</Text>
      </View>
    </View>
  );
}

export default StepHeaderBar;
