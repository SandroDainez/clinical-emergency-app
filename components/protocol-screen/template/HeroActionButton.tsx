import { Pressable, Text } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type HeroActionButtonProps = {
  label: string;
  onPress: () => void;
  visible: boolean;
};

export default function HeroActionButton({ label, onPress, visible }: HeroActionButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      style={{
        backgroundColor: palette.primary,
        borderRadius: 28,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: spacing.sm,
        shadowColor: palette.primaryDark,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
      }}
      onPress={onPress}>
      <Text style={{ ...typography.headline, color: "#fff", textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}
