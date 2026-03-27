import { Pressable, Text, View } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type DecisionGridProps = {
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
  title?: string;
};

function DecisionGrid({ options, onSelect, title }: DecisionGridProps) {
  if (options.length === 0) {
    return null;
  }

  function getOptionStyle(optionId: string) {
    if (optionId === "chocavel") {
      return {
        badge: "#7f1d1d",
        background: "#fff1f2",
        border: "#fecdd3",
        accent: "#dc2626",
      };
    }

    if (optionId === "nao_chocavel") {
      return {
        badge: "#1e3a8a",
        background: "#eff6ff",
        border: "#bfdbfe",
        accent: "#2563eb",
      };
    }

    if (optionId === "rosc" || optionId === "com_pulso") {
      return {
        badge: "#166534",
        background: "#ecfdf5",
        border: "#bbf7d0",
        accent: "#16a34a",
      };
    }

    return {
      badge: palette.text,
      background: palette.surface,
      border: palette.borderStrong,
      accent: palette.primaryLight,
    };
  }

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: palette.border,
        padding: spacing.md,
        gap: spacing.sm,
        shadowColor: "#0f172a",
        shadowOpacity: 0.05,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}>
      <View style={{ gap: 4 }}>
        <Text
          style={{
            ...typography.small,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            fontWeight: "800",
          }}>
          Escolha crítica
        </Text>
        <Text style={{ ...typography.title, color: palette.text }}>
          {title ?? "Toque para decidir a fase"}
        </Text>
      </View>
      {options.map((option) => (
        <Pressable
          key={option.id}
          style={({ pressed }) => {
            const optionStyle = getOptionStyle(option.id);

            return {
              minHeight: 92,
              backgroundColor: pressed ? optionStyle.accent : optionStyle.background,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: optionStyle.border,
              padding: spacing.md,
              justifyContent: "center",
              shadowColor: "#0f172a",
              shadowOpacity: pressed ? 0 : 0.03,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: pressed ? 0 : 1,
            };
          }}
          onPress={() => onSelect(option.id)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: getOptionStyle(option.id).accent,
              }}
            />
            <Text style={{ ...typography.headline, color: palette.text, flex: 1 }}>
              {option.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default DecisionGrid;
