import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

type HeroMetric = {
  label: string;
  value: string;
  accent?: string;
};

type SummaryLine = {
  label: string;
  value: string;
};

type ModuleFlowHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  badgeText: string;
  metrics: HeroMetric[];
  progressLabel: string;
  stepTitle: string;
  hint?: string;
};

type ModuleFinishPanelProps = {
  summaryTitle: string;
  destination?: string;
  summaryLines: SummaryLine[];
  infoTitle: string;
  infoLines: string[];
  narrative?: string;
};

export function ModuleFlowHero({
  eyebrow,
  title,
  subtitle,
  badgeText,
  metrics,
  progressLabel,
  stepTitle,
  hint,
}: ModuleFlowHeroProps) {
  const { width } = useWindowDimensions();
  const compact = width < 760;

  return (
    <View style={heroStyles.wrap}>
      <View style={heroStyles.hero}>
        <Text style={heroStyles.eyebrow}>{eyebrow}</Text>
        <Text style={heroStyles.title}>{title}</Text>
        <Text style={heroStyles.subtitle}>{subtitle}</Text>

        <View style={heroStyles.badgeRow}>
          <View style={heroStyles.badge}>
            <Text style={heroStyles.badgeText}>{badgeText}</Text>
          </View>
          <View style={[heroStyles.badge, heroStyles.badgeMuted]}>
            <Text style={[heroStyles.badgeText, heroStyles.badgeMutedText]}>{progressLabel}</Text>
          </View>
        </View>

        <View style={[heroStyles.metricGrid, compact && heroStyles.metricGridCompact]}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={[heroStyles.metricTile, compact && heroStyles.metricTileCompact]}>
              <Text style={heroStyles.metricLabel}>{metric.label}</Text>
              <Text
                style={[heroStyles.metricValue, metric.accent ? { color: metric.accent } : null]}
                numberOfLines={2}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={heroStyles.stepCard}>
        <Text style={heroStyles.stepEyebrow}>{progressLabel}</Text>
        <Text style={heroStyles.stepTitle}>{stepTitle}</Text>
        {hint ? <Text style={heroStyles.stepHint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

export function ModuleFinishPanel({
  summaryTitle,
  destination,
  summaryLines,
  infoTitle,
  infoLines,
  narrative,
}: ModuleFinishPanelProps) {
  const { width } = useWindowDimensions();
  const compact = width < 760;

  return (
    <View style={finishStyles.wrap}>
      <View style={finishStyles.header}>
        <Text style={finishStyles.headerTitle}>{summaryTitle}</Text>
        {destination ? (
          <View style={finishStyles.destinationBadge}>
            <Text style={finishStyles.destinationBadgeText}>{destination}</Text>
          </View>
        ) : null}
      </View>

      <View style={[finishStyles.grid, compact && finishStyles.gridCompact]}>
        <View style={finishStyles.card}>
          <Text style={finishStyles.cardEyebrow}>Resumo clínico</Text>
          {summaryLines.length ? (
            <View style={finishStyles.rows}>
              {summaryLines.map((line) => (
                <View key={line.label} style={finishStyles.row}>
                  <Text style={finishStyles.rowLabel}>{line.label}</Text>
                  <Text style={finishStyles.rowValue}>{line.value}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={finishStyles.emptyText}>Preencha os campos desta etapa para gerar o resumo final.</Text>
          )}
        </View>

        <View style={finishStyles.card}>
          <Text style={finishStyles.cardEyebrow}>{infoTitle}</Text>
          <View style={finishStyles.infoList}>
            {infoLines.map((line) => (
              <View key={line} style={finishStyles.infoRow}>
                <View style={finishStyles.infoDot} />
                <Text style={finishStyles.infoText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={finishStyles.narrativeCard}>
        <Text style={finishStyles.cardEyebrow}>Relato do caso atendido</Text>
        <Text style={finishStyles.narrativeText}>
          {narrative?.trim() || "Use o campo de relato desta etapa para registrar apresentação, condutas, resposta e pendências do caso real."}
        </Text>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
    gap: 10,
  },
  hero: {
    backgroundColor: "#8db4f2",
    borderRadius: 28,
    padding: 18,
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 5,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#24415f",
  },
  title: {
    marginTop: 6,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    color: "#12263a",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#25496f",
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#cddbf3",
  },
  badgeMuted: {
    backgroundColor: "#dbe8ff",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#23415e",
  },
  badgeMutedText: {
    color: "#45617f",
  },
  metricGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricGridCompact: {
    flexDirection: "column",
  },
  metricTile: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 140,
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#cbdaf5",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricTileCompact: {
    minWidth: 0,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#60758f",
  },
  metricValue: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    color: "#1f4f88",
  },
  stepCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e7df",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  stepEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#7a9a3f",
  },
  stepTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "900",
    color: "#13263b",
  },
  stepHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#5a6f83",
    fontWeight: "600",
  },
});

const finishStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: "#f8f5ef",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#c7d8d0",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#102128",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  destinationBadge: {
    borderRadius: 999,
    backgroundColor: "#173e38",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  destinationBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#d8fff4",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  gridCompact: {
    flexDirection: "column",
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe7e1",
    padding: 14,
    gap: 10,
  },
  narrativeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fffdfa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe7e1",
    padding: 14,
    gap: 8,
  },
  cardEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#657d75",
  },
  rows: {
    gap: 8,
  },
  row: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ebf1ee",
    gap: 4,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#60758f",
    textTransform: "uppercase",
  },
  rowValue: {
    fontSize: 13,
    lineHeight: 18,
    color: "#20353b",
    fontWeight: "700",
  },
  infoList: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  infoDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#5fb49c",
    marginTop: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#20353b",
    fontWeight: "700",
  },
  narrativeText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#354a52",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#60758f",
    fontWeight: "700",
  },
});
