import { Pressable, Text, View } from "react-native";
import type { AclsScreenModel } from "../../../acls/screen-model";
import { palette, spacing, typography } from "../design-tokens";

type HeroActionButtonProps = {
  title: string;
  detail?: string;
  priority?: NonNullable<AclsScreenModel["bannerPriority"]>;
  continuationLabel?: string;
  ctaLabel?: string;
  onPress?: () => void;
};

function getTone(priority?: NonNullable<AclsScreenModel["bannerPriority"]>) {
  if (priority === "critical_now") {
    return {
      backgroundColor: "#7f1d1d",
      borderColor: "#fca5a5",
      badgeBackground: "#fee2e2",
      badgeColor: "#7f1d1d",
    };
  }

  if (priority === "due_now") {
    return {
      backgroundColor: "#7c2d12",
      borderColor: "#fdba74",
      badgeBackground: "#ffedd5",
      badgeColor: "#9a3412",
    };
  }

  if (priority === "reassess") {
    return {
      backgroundColor: palette.primaryDark,
      borderColor: "#93c5fd",
      badgeBackground: "#dbeafe",
      badgeColor: "#1e3a8a",
    };
  }

  return {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    badgeBackground: "#dbeafe",
    badgeColor: "#1e3a8a",
  };
}

export default function HeroActionButton({
  title,
  detail,
  priority,
  continuationLabel,
  ctaLabel,
  onPress,
}: HeroActionButtonProps) {
  const tone = getTone(priority);

  return (
    <View
      style={{
        backgroundColor: tone.backgroundColor,
        borderRadius: 24,
        minHeight: 156,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        justifyContent: "center",
        marginVertical: spacing.xs,
        shadowColor: "#020617",
        shadowOpacity: 0.22,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        borderWidth: 1,
        borderColor: tone.borderColor,
        gap: spacing.sm,
      }}>
      {priority ? (
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: tone.badgeBackground,
          }}>
          <Text style={{ ...typography.heroTag, color: tone.badgeColor }}>
            Agora
          </Text>
        </View>
      ) : null}

      <Text style={{ ...typography.heroTitle, color: "#fff" }}>{title}</Text>

      {detail ? (
        <Text
          style={{
            ...typography.body,
            color: "#dbeafe",
            fontWeight: "600",
          }}>
          {detail}
        </Text>
      ) : null}

      {continuationLabel ? (
        <Text
          style={{
            ...typography.small,
            color: "#bfdbfe",
            fontSize: 13,
          }}>
          Depois: {continuationLabel}
        </Text>
      ) : null}

      {ctaLabel && onPress ? (
        <Pressable
          style={{
            marginTop: spacing.sm,
            borderRadius: 18,
            minHeight: 64,
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
          }}
          onPress={onPress}>
          <Text
            style={{
              ...typography.small,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 4,
            }}>
            Toque para seguir
          </Text>
          <Text style={{ ...typography.title, color: tone.badgeColor, textAlign: "center" }}>
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
