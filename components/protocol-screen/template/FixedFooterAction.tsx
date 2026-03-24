import { Pressable, Text } from "react-native";
import { elevation, palette, spacing, typography } from "../design-tokens";

type FixedFooterActionProps = {
  label: string;
  onPress: () => void;
  visible: boolean;
};

function FixedFooterAction({ label, onPress, visible }: FixedFooterActionProps) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      style={{
        position: "absolute",
        left: spacing.md,
        right: spacing.md,
        bottom: spacing.md,
        borderRadius: 28,
        backgroundColor: palette.primaryDark,
        height: 72,
        justifyContent: "center",
        alignItems: "center",
        ...elevation.footer,
        borderWidth: 1,
        borderColor: palette.primaryLight,
      }}
      onPress={onPress}>
      <Text style={{ ...typography.title, color: "#fff", letterSpacing: 1 }}>{label}</Text>
    </Pressable>
  );
}

export default FixedFooterAction;
