import { StyleSheet, Text, View } from "react-native";
import type { AuxiliaryPanelMetric, ProtocolState } from "../../../clinical-engine";
import type { AppGuidelinesStatus } from "../../../lib/guidelines-version";
import { formatReviewDate } from "../protocol-screen-utils";

type ModuleConfig = {
  label: string;
  accentColor: string;
  guidelinesLabel: string;
};

type Props = {
  module: ModuleConfig;
  state: ProtocolState;
  guidelinesStatus: AppGuidelinesStatus;
  metrics?: AuxiliaryPanelMetric[];
};

/**
 * Shared dark premium step header used across all clinical modules.
 * Shows module badge, phase progress, current step text, metrics strip and guidelines badge.
 */
export function ProtocolStepHeader({ module: mod, state, guidelinesStatus, metrics }: Props) {
  return (
    <View style={s.container}>
      {/* Module badge + guidelines row */}
      <View style={s.topRow}>
        <View style={[s.moduleBadge, { backgroundColor: mod.accentColor }]}>
          <Text style={s.moduleBadgeText}>{mod.label}</Text>
        </View>
        <GuidelinesBadge status={guidelinesStatus} label={mod.guidelinesLabel} />
      </View>

      {/* Phase progress */}
      {state.phaseLabel && state.phaseStep && state.phaseTotal ? (
        <View style={s.phaseRow}>
          <View style={s.phaseBar}>
            {Array.from({ length: state.phaseTotal }).map((_, i) => (
              <View
                key={i}
                style={[s.phaseSeg, i < state.phaseStep! ? s.phaseSegActive : s.phaseSegInactive]}
              />
            ))}
          </View>
          <Text style={s.phaseLabel}>
            Fase {state.phaseStep}/{state.phaseTotal} — {state.phaseLabel}
          </Text>
        </View>
      ) : null}

      {/* Current step */}
      <View style={s.stepBlock}>
        <Text style={s.stepText}>{state.text}</Text>
        {state.details?.[0] ? (
          <Text style={s.stepHint} numberOfLines={3}>{state.details[0]}</Text>
        ) : null}
      </View>

      {/* Metrics strip */}
      {metrics && metrics.length > 0 ? <MetricsStrip metrics={metrics} /> : null}
    </View>
  );
}

function GuidelinesBadge({ status, label }: { status: AppGuidelinesStatus; label: string }) {
  const isGreen = status.overallColor === "green";
  const isYellow = status.overallColor === "yellow";
  return (
    <View
      style={[
        s.guidelinesBadge,
        isGreen ? s.guidelinesBadgeGreen : isYellow ? s.guidelinesBadgeYellow : s.guidelinesBadgeRed,
      ]}>
      <Text
        style={[
          s.guidelinesText,
          isGreen ? s.guidelinesTextGreen : isYellow ? s.guidelinesTextYellow : s.guidelinesTextRed,
        ]}>
        {isGreen ? "✓" : "⚠"} {label} · {formatReviewDate(status.lastFullReview)} · {status.overallStatus}
      </Text>
    </View>
  );
}

function MetricsStrip({ metrics }: { metrics: AuxiliaryPanelMetric[] }) {
  return (
    <View style={s.metricsRow}>
      {metrics.slice(0, 6).map((m) => (
        <View key={m.label} style={s.metricChip}>
          <Text style={s.metricChipLabel}>{m.label}</Text>
          <Text style={s.metricChipValue}>{m.value || "—"}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#565e6c",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  moduleBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moduleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#ffffff",
  },
  guidelinesBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  guidelinesBadgeGreen: { backgroundColor: "#052e16", borderColor: "#166534" },
  guidelinesBadgeYellow: { backgroundColor: "#451a03", borderColor: "#92400e" },
  guidelinesBadgeRed: { backgroundColor: "#450a0a", borderColor: "#991b1b" },
  guidelinesText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.2 },
  guidelinesTextGreen: { color: "#4ade80" },
  guidelinesTextYellow: { color: "#fbbf24" },
  guidelinesTextRed: { color: "#fca5a5" },
  phaseRow: { gap: 4 },
  phaseBar: { flexDirection: "row", gap: 3 },
  phaseSeg: { flex: 1, height: 3, borderRadius: 2 },
  phaseSegActive: { backgroundColor: "#0891b2" },
  phaseSegInactive: { backgroundColor: "#383e4a" },
  phaseLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0891b2",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  stepBlock: { gap: 4 },
  stepText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 21,
  },
  stepHint: {
    fontSize: 12,
    color: "#aab6c6",
    lineHeight: 17,
    fontWeight: "500",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#565e6c",
  },
  metricChip: {
    backgroundColor: "#383e4a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 1,
    borderWidth: 1,
    borderColor: "#565e6c",
  },
  metricChipLabel: {
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#aab6c6",
  },
  metricChipValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#e2e8f0",
  },
});
