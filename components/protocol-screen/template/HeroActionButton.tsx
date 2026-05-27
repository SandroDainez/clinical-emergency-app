import { Pressable, Text, View } from "react-native";
import type { AclsScreenModel } from "../../../acls/screen-model";
import { spacing, typography } from "../design-tokens";

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
      badgeBackground: "#450a0a",
      badgeColor: "#fca5a5",
    };
  }

  if (priority === "due_now") {
    return {
      backgroundColor: "#7c2d12",
      borderColor: "#fdba74",
      badgeBackground: "#431407",
      badgeColor: "#fdba74",
    };
  }

  if (priority === "reassess") {
    return {
      backgroundColor: "#0e7490",
      borderColor: "#1e293b",
      badgeBackground: "rgba(14,116,144,0.3)",
      badgeColor: "#22d3ee",
    };
  }

  if (priority === "monitor") {
    return {
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      badgeBackground: "#14532d",
      badgeColor: "#86efac",
    };
  }

  return {
    backgroundColor: "#1e3a5f",
    borderColor: "#3b82f6",
    badgeBackground: "#1e3a5f",
    badgeColor: "#93c5fd",
  };
}

function getCtaBackground(priority?: NonNullable<AclsScreenModel["bannerPriority"]>): string {
  if (priority === "critical_now") return "#dc2626"; // bright red — shock
  if (priority === "due_now") return "#c2410c";      // bright orange — urgent medication
  if (priority === "prepare_now") return "#b45309";  // amber — prepare
  if (priority === "reassess") return "#0e7490";     // cyan — rhythm/ROSC
  return "#1d4ed8";                                  // blue — default action
}

function getCtaBackgroundPressed(priority?: NonNullable<AclsScreenModel["bannerPriority"]>): string {
  if (priority === "critical_now") return "#991b1b";
  if (priority === "due_now") return "#9a3412";
  if (priority === "prepare_now") return "#92400e";
  if (priority === "reassess") return "#0c4a6e";
  return "#1e40af";
}

function getCtaBorder(priority?: NonNullable<AclsScreenModel["bannerPriority"]>): string {
  if (priority === "critical_now") return "#fca5a5";
  if (priority === "due_now") return "#fdba74";
  if (priority === "prepare_now") return "#fcd34d";
  if (priority === "reassess") return "#22d3ee";
  return "#93c5fd";
}

function getCtaShadow(priority?: NonNullable<AclsScreenModel["bannerPriority"]>): string {
  if (priority === "critical_now") return "#dc2626";
  if (priority === "due_now") return "#ea580c";
  if (priority === "prepare_now") return "#d97706";
  if (priority === "reassess") return "#0e7490";
  return "#3b82f6";
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
          style={({ pressed }) => ({
            marginTop: spacing.sm,
            borderRadius: 20,
            minHeight: 80,
            backgroundColor: pressed
              ? getCtaBackgroundPressed(priority)
              : getCtaBackground(priority),
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderWidth: 2,
            borderColor: getCtaBorder(priority),
            shadowColor: getCtaShadow(priority),
            shadowOpacity: pressed ? 0 : 0.45,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: pressed ? 0 : 6,
          })}
          onPress={onPress}>
          <Text
            style={{
              ...typography.title,
              color: "#ffffff",
              fontSize: 22,
              lineHeight: 28,
              fontWeight: "800",
              textAlign: "center",
              letterSpacing: -0.3,
            }}>
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
