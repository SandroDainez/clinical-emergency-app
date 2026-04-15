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
        borderRadius: 36,
        padding: spacing.xl + 4,
        shadowColor: "#021113",
        shadowOpacity: 0.3,
        shadowRadius: 32,
        shadowOffset: { width: 0, height: 18 },
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        gap: spacing.md,
      }}>
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: "rgba(125,183,255,0.16)",
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(125,183,255,0.24)",
        }}>
        <Text style={{ ...typography.heroTag, color: palette.primaryLight }}>Etapa atual</Text>
      </View>
      <Text style={{ ...typography.heroTitle, color: "#ffffff" }}>{title}</Text>
      <Text style={{ ...typography.body, color: "rgba(245,247,244,0.82)", lineHeight: 24 }}>{instruction}</Text>
      {nextStep ? (
        <Text style={{ ...typography.small, color: "#9cc2ff" }}>{`Próximo passo: ${nextStep}`}</Text>
      ) : null}
      <View
        style={{
          marginTop: spacing.lg,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.14)",
          height: 12,
          overflow: "hidden",
        }}>
        <View
          style={{
            width: `${clampedProgress * 100}%`,
            height: 12,
            backgroundColor: palette.primaryLight,
          }}
        />
      </View>
      <Text style={{ ...typography.small, color: "rgba(255,255,255,0.7)" }}>{`${Math.round(clampedProgress * 100)}% concluído`}</Text>
    </View>
  );
}

export default StepSummaryCard;
