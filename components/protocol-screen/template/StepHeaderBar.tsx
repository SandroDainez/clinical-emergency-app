import { Pressable, Text, View } from "react-native";

import { palette, spacing, typography } from "../design-tokens";
import { useTr } from "../../../lib/use-tr";

type StepHeaderBarProps = {
  protocolLabel: string;
  onBack: () => void;
  /** Título grande à direita (default "ACLS · Emergência"). */
  title?: string;
};

function StepHeaderBar({ protocolLabel, onBack, title = "ACLS · Emergência" }: StepHeaderBarProps) {
  const tr = useTr();
  return (
    <View
      style={{
        backgroundColor: "#262a32",
        borderRadius: 22,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3a404a",
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}>
      <Pressable
        onPress={onBack}
        style={{
          backgroundColor: "rgba(77,154,255,0.15)",
          paddingHorizontal: spacing.md,
          paddingVertical: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#4d9aff",
        }}>
        <Text style={{ ...typography.small, color: "#4d9aff", fontWeight: "800" }}>
          {tr("Voltar")}
        </Text>
      </Pressable>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        <Text style={{ ...typography.small, color: palette.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {tr(protocolLabel)}
        </Text>
        <Text style={{ ...typography.title, color: palette.text }}>{tr(title)}</Text>
      </View>
    </View>
  );
}

export default StepHeaderBar;
