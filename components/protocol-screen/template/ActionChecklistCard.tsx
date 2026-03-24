import { Text, View } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type ActionChecklistCardProps = {
  title: string;
  items: string[];
};

function ActionChecklistCard({ title, items }: ActionChecklistCardProps) {
  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderRadius: 22,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: palette.borderStrong,
        gap: spacing.sm,
        shadowColor: "#0c1f3a",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      }}>
      <Text style={{ ...typography.title, color: palette.text }}>Ação imediata</Text>
      {items.map((item, index) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: spacing.sm,
            borderBottomWidth: index === items.length - 1 ? 0 : 1,
            borderBottomColor: palette.border,
          }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              backgroundColor: palette.primaryLight,
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>{index + 1}</Text>
          </View>
          <Text style={{ ...typography.body, color: palette.text }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default ActionChecklistCard;
