import { Pressable, Text } from "react-native";
import { elevation, spacing, typography } from "../design-tokens";

type FixedFooterActionItem = {
  label: string;
  onPress: () => void;
};

type FixedFooterActionProps = {
  label: string;
  onPress: () => void;
  visible: boolean;
  actions?: FixedFooterActionItem[];
};

function FixedFooterAction({ label, onPress, visible, actions }: FixedFooterActionProps) {
  if (!visible) {
    return null;
  }

  const actionItems = actions && actions.length > 0 ? actions : [{ label, onPress }];

  return (
    <>
      {actionItems.map((action, index) => (
        <Pressable
          key={`${action.label}-${index}`}
          style={{
            position: "absolute",
            left: spacing.md,
            right: spacing.md,
            bottom: spacing.md + index * 88,
            borderRadius: 999,
            backgroundColor: "#102128",
            minHeight: 76,
            justifyContent: "center",
            alignItems: "center",
            ...elevation.footer,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
          onPress={action.onPress}>
          <Text style={{ ...typography.title, color: "#fff", letterSpacing: 0.4, fontWeight: "900" }}>{action.label}</Text>
        </Pressable>
      ))}
    </>
  );
}

export type { FixedFooterActionItem };

export default FixedFooterAction;
