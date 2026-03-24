import { Text, View } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type StepSummaryCardProps = {
  title: string;
  instruction: string;
  nextStep?: string;
  progress: number;
};

function StepSummaryCard({ title, instruction, nextStep, progress }: StepSummaryCardProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={{
        backgroundColor: palette.heroGradientStart,
        borderRadius: 26,
        padding: spacing.xl,
        paddingBottom: spacing.md,
        shadowColor: palette.primary,
        shadowOpacity: 0.35,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 16 },
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        gap: spacing.sm,
      }}>
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: palette.heroGradientEnd,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 999,
        }}>
        <Text style={{ ...typography.heroTag, color: "#e0e7ff" }}>Etapa atual</Text>
      </View>
      <Text style={{ ...typography.heroTitle, color: "#ffffff" }}>{title}</Text>
      <Text style={{ ...typography.body, color: "#d0dcff" }}>{instruction}</Text>
      {nextStep ? (
        <Text style={{ ...typography.small, color: palette.primaryLight }}>{`Próximo passo: ${nextStep}`}</Text>
      ) : null}
      <View
        style={{
          marginTop: spacing.lg,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.2)",
          height: 10,
          overflow: "hidden",
        }}>
        <View
          style={{
            width: `${clampedProgress * 100}%`,
            height: 10,
            backgroundColor: palette.primaryLight,
          }}
        />
      </View>
      <Text style={{ ...typography.small, color: "rgba(255,255,255,0.7)" }}>{`${Math.round(clampedProgress * 100)}% concluído`}</Text>
    </View>
  );
}

export default StepSummaryCard;
