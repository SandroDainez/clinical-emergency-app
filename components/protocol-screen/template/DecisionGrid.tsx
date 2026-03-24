import { Pressable, Text, View } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type DecisionGridProps = {
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
};

function DecisionGrid({ options, onSelect }: DecisionGridProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => (
        <Pressable
          key={option.id}
          style={({ pressed }) => ({
            flexBasis: "48%",
            minHeight: 110,
            backgroundColor: pressed ? "#142a66" : palette.surface,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: palette.borderStrong,
            padding: spacing.md,
            justifyContent: "center",
            shadowColor: "#0f172a",
            shadowOpacity: 0.08,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
          })}
          onPress={() => onSelect(option.id)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                backgroundColor: palette.primaryLight,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{option.label.charAt(0)}</Text>
            </View>
            <Text style={{ ...typography.title, color: palette.text }}>{option.label}</Text>
          </View>
          <Text style={{ ...typography.body, color: palette.textSecondary, marginTop: spacing.xs }}>Selecionar para validar o caminho</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default DecisionGrid;
