import { Pressable, Text, View } from "react-native";

import { AppDesign } from "../../../constants/app-design";
import { palette, spacing, typography } from "../design-tokens";

type StepHeaderBarProps = {
  protocolLabel: string;
  onBack: () => void;
};

function StepHeaderBar({ protocolLabel, onBack }: StepHeaderBarProps) {
  return (
    <View
      style={{
        backgroundColor: "#f8f5ef",
        borderRadius: 26,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: AppDesign.border.mint,
        marginBottom: spacing.md,
        shadowColor: "#07181a",
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      }}>
      <Pressable
        onPress={onBack}
        style={{
          backgroundColor: "#dbe9e2",
          paddingHorizontal: spacing.md,
          paddingVertical: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: AppDesign.border.mint,
        }}>
        <Text style={{ ...typography.small, color: AppDesign.accent.teal, fontWeight: "900" }}>← Voltar</Text>
      </Pressable>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Text style={{ ...typography.small, color: palette.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {protocolLabel}
        </Text>
        <Text style={{ ...typography.title, color: palette.text, fontSize: 16 }}>Clinical Emergency</Text>
      </View>
    </View>
  );
}

export default StepHeaderBar;
