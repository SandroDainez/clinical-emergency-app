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
        borderRadius: 28,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: palette.borderStrong,
        gap: spacing.sm,
        shadowColor: "#07181a",
        shadowOpacity: 0.14,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      }}>
      <View style={{ gap: 4, marginBottom: 4 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "900",
            color: palette.muted,
            textTransform: "uppercase",
            letterSpacing: 1.1,
          }}>
          Checklist operacional
        </Text>
        <Text style={{ ...typography.title, color: palette.text, fontSize: 20 }}>{title || "Ação imediata"}</Text>
      </View>

      {items.map((item, index) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
            padding: 14,
            borderRadius: 20,
            backgroundColor: "#f2eee5",
            borderWidth: 1,
            borderColor: "rgba(75,135,217,0.16)",
          }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 14,
              backgroundColor: index === 0 ? "#102128" : palette.primaryDark,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 1,
            }}>
            <Text style={{ color: palette.primaryLight, fontWeight: "900", fontSize: 12 }}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "900",
                color: palette.primaryDark,
                textTransform: "uppercase",
                letterSpacing: 0.9,
              }}>
              Passo {index + 1}
            </Text>
            <Text style={{ ...typography.body, color: palette.text, lineHeight: 23 }}>{item}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default ActionChecklistCard;
