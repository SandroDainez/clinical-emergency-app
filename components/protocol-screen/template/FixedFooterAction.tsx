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

  const actionItems =
    actions && actions.length > 0 ? actions : [{ label, onPress }];

  return (
    <>
      {actionItems.map((action, index) => (
        <Pressable
          key={`${action.label}-${index}`}
          style={{
            position: "absolute",
            left: spacing.md,
            right: spacing.md,
            bottom: spacing.md + index * 84,
            borderRadius: 999,
            backgroundColor: "#0f172a",
            height: 72,
            justifyContent: "center",
            alignItems: "center",
            ...elevation.footer,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.12)",
          }}
          onPress={action.onPress}>
          <Text style={{ ...typography.title, color: "#fff", letterSpacing: 1 }}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </>
  );
}

export type { FixedFooterActionItem };

export default FixedFooterAction;
