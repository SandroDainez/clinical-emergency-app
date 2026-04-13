import { Pressable, Text, View } from "react-native";
import type { AclsScreenModel } from "../../../acls/screen-model";
import { AppDesign } from "../../../constants/app-design";
import { palette, spacing, typography } from "../design-tokens";

type HeroActionButtonProps = {
  title: string;
  detail?: string;
  priority?: NonNullable<AclsScreenModel["bannerPriority"]>;
  continuationLabel?: string;
  ctaLabel?: string;
  onPress?: () => void;
};

type Tone = {
  backgroundColor: string;
  borderColor: string;
  badgeBackground: string;
  badgeColor: string;
};

function getTone(priority?: NonNullable<AclsScreenModel["bannerPriority"]>): Tone {
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
      borderColor: AppDesign.border.mint,
      badgeBackground: AppDesign.accent.primaryMuted,
      badgeColor: palette.primaryDark,
    };
  }

  if (priority === "monitor") {
    return {
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      badgeBackground: AppDesign.accent.limeSoft,
      badgeColor: AppDesign.accent.limeDark,
    };
  }

  return {
    backgroundColor: "#1e3a5f",
    borderColor: "#3b82f6",
    badgeBackground: "#dbeafe",
    badgeColor: "#1e3a5f",
  };
}

function getBadgeLabel(priority?: NonNullable<AclsScreenModel["bannerPriority"]>): string {
  switch (priority) {
    case "critical_now":
      return "Crítico · Agora";
    case "due_now":
      return "Urgente · Agora";
    case "reassess":
      return "Verificar ritmo";
    case "monitor":
      return "Manter";
    case "prepare_now":
      return "Preparar";
    default:
      return "Ação";
  }
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
        borderRadius: 28,
        minHeight: 168,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xl,
        justifyContent: "center",
        marginVertical: spacing.xs,
        shadowColor: "#020617",
        shadowOpacity: 0.24,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
        borderWidth: 1,
        borderColor: tone.borderColor,
        gap: spacing.sm,
      }}>
      {priority ? (
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 5,
            backgroundColor: tone.badgeBackground,
          }}>
          <Text
            style={{
              ...typography.heroTag,
              color: tone.badgeColor,
              fontSize: 11,
              letterSpacing: 0.8,
            }}>
            {getBadgeLabel(priority)}
          </Text>
        </View>
      ) : null}

      <Text
        style={{
          ...typography.heroTitle,
          color: "#fff",
          fontSize: 30,
          lineHeight: 36,
          fontWeight: "800",
          letterSpacing: -0.3,
        }}>
        {title}
      </Text>

      {detail ? (
        <Text
          style={{
            color: "rgba(255,255,255,0.82)",
            fontSize: 15,
            lineHeight: 22,
            fontWeight: "500",
            letterSpacing: 0.1,
          }}>
          {detail}
        </Text>
      ) : null}

      {continuationLabel ? (
        <View
          style={{
            marginTop: 2,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}>
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.4)",
            }}
          />
          <Text
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              fontWeight: "500",
            }}>
            A seguir: {continuationLabel}
          </Text>
        </View>
      ) : null}

      {ctaLabel && onPress ? (
        <Pressable
          style={{
            marginTop: spacing.sm,
            borderRadius: 20,
            minHeight: 72,
            backgroundColor: "#ffffff",
            justifyContent: "center",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.85)",
          }}
          onPress={onPress}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 6,
            }}>
            Confirmar ação
          </Text>
          <Text
            style={{
              ...typography.title,
              color: tone.badgeColor,
              fontSize: 17,
              lineHeight: 22,
              fontWeight: "800",
            }}>
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
