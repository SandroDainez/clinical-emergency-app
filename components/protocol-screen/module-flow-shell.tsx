import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ReactNode } from "react-native";

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
  compactMobile?: boolean;
};

type ModuleFinishPanelProps = {
  summaryTitle: string;
  destination?: string;
  summaryLines: SummaryLine[];
  infoTitle: string;
  infoLines: string[];
  narrative?: string;
};

type ModuleFlowSidebarItem = {
  id: string | number;
  icon?: string;
  label: string;
  hint?: string;
  step?: string;
  accent?: string;
};

type ModuleFlowLayoutProps = {
  hero: ReactNode;
  items: ModuleFlowSidebarItem[];
  activeId: string | number;
  onSelect: (id: string | number) => void;
  children: ReactNode;
  footer?: ReactNode;
  sidebarEyebrow?: string;
  sidebarTitle?: string;
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
  compactMobile = false,
}: ModuleFlowHeroProps) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const mobileMinimal = compact && compactMobile;

  return (
    <View style={heroStyles.wrap}>
      <View style={[heroStyles.hero, mobileMinimal && heroStyles.heroCompactMobile]}>
        <Text style={heroStyles.eyebrow}>{eyebrow}</Text>
        <Text style={[heroStyles.title, mobileMinimal && heroStyles.titleCompactMobile]}>{title}</Text>
        <Text style={[heroStyles.subtitle, mobileMinimal && heroStyles.subtitleCompactMobile]}>{subtitle}</Text>

        <View style={[heroStyles.badgeRow, compact && heroStyles.badgeRowCompact]}>
          <View style={[heroStyles.badge, compact && heroStyles.badgeCompact]}>
            <Text style={[heroStyles.badgeText, compact && heroStyles.badgeTextCompact]}>{badgeText}</Text>
          </View>
          <View style={[heroStyles.badge, heroStyles.badgeMuted, compact && heroStyles.badgeCompact]}>
            <Text style={[heroStyles.badgeText, heroStyles.badgeMutedText, compact && heroStyles.badgeTextCompact]}>
              {progressLabel}
            </Text>
          </View>
        </View>

        <View style={[heroStyles.metricGrid, compact && heroStyles.metricGridCompact, mobileMinimal && heroStyles.metricGridCompactMobile]}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={[heroStyles.metricTile, compact && heroStyles.metricTileCompact, mobileMinimal && heroStyles.metricTileCompactMobile]}>
              <Text style={[heroStyles.metricLabel, mobileMinimal && heroStyles.metricLabelCompactMobile]}>{metric.label}</Text>
              <Text
                style={[heroStyles.metricValue, mobileMinimal && heroStyles.metricValueCompactMobile, metric.accent ? { color: metric.accent } : null]}
                numberOfLines={2}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[heroStyles.stepCard, mobileMinimal && heroStyles.stepCardCompactMobile]}>
        <Text style={heroStyles.stepEyebrow}>{progressLabel}</Text>
        <Text style={[heroStyles.stepTitle, mobileMinimal && heroStyles.stepTitleCompactMobile]}>{stepTitle}</Text>
        {hint ? <Text style={[heroStyles.stepHint, mobileMinimal && heroStyles.stepHintCompactMobile]}>{hint}</Text> : null}
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

export function ModuleFlowLayout({
  hero,
  items,
  activeId,
  onSelect,
  children,
  footer,
  sidebarEyebrow = "Navegação do módulo",
  sidebarTitle = "Etapas do atendimento",
}: ModuleFlowLayoutProps) {
  const { width } = useWindowDimensions();
  const useSidebar = width >= 920;

  if (!items.length) {
    return (
      <View style={layoutStyles.screen}>
        {hero}
        <View style={layoutStyles.contentOnly}>{children}</View>
        {footer}
      </View>
    );
  }

  return (
    <View style={layoutStyles.screen}>
      {hero}
      <View style={[layoutStyles.shell, useSidebar ? layoutStyles.shellWide : layoutStyles.shellStacked]}>
        {useSidebar ? (
          <View style={[layoutStyles.sidebarCard, layoutStyles.sidebarWide]}>
            <Text style={layoutStyles.sidebarEyebrow}>{sidebarEyebrow}</Text>
            <Text style={layoutStyles.sidebarTitle}>{sidebarTitle}</Text>
            <View style={layoutStyles.sidebarList}>
              {items.map((item, index) => {
                const active = item.id === activeId;
                const accent = item.accent ?? "#1d4ed8";
                return (
                  <Pressable
                    key={String(item.id)}
                    onPress={() => onSelect(item.id)}
                    style={[
                      layoutStyles.sideNavItem,
                      active && { borderColor: `${accent}55`, backgroundColor: "#ffffff" },
                    ]}>
                    <View style={[layoutStyles.sideNavStep, { backgroundColor: active ? accent : "#e2e8f0" }]}>
                      <Text style={[layoutStyles.sideNavStepText, active && layoutStyles.sideNavStepTextActive]}>
                        {item.step ?? String(index + 1)}
                      </Text>
                    </View>
                    <View style={layoutStyles.sideNavBody}>
                      <Text style={[layoutStyles.sideNavLabel, active && { color: accent }]}>
                        {item.icon ? `${item.icon} ${item.label}` : item.label}
                      </Text>
                      {item.hint ? <Text style={layoutStyles.sideNavHint}>{item.hint}</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={[layoutStyles.sidebarCard, layoutStyles.sidebarStacked]}>
            <Text style={layoutStyles.sidebarEyebrow}>{sidebarEyebrow}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={layoutStyles.mobileNavRow}>
              {items.map((item, index) => {
                const active = item.id === activeId;
                const accent = item.accent ?? "#1d4ed8";
                return (
                  <Pressable
                    key={String(item.id)}
                    onPress={() => onSelect(item.id)}
                    style={[
                      layoutStyles.mobileChip,
                      active && { borderColor: accent, backgroundColor: "#ffffff" },
                    ]}>
                    <Text style={[layoutStyles.mobileChipStep, active && { color: accent }]}>
                      {item.step ?? String(index + 1)}
                    </Text>
                    <Text style={[layoutStyles.mobileChipLabel, active && { color: accent }]}>
                      {item.icon ? `${item.icon} ${item.label}` : item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={layoutStyles.contentPanel}>
          {children}
          {footer}
        </View>
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
  heroCompactMobile: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  titleCompactMobile: {
    marginTop: 3,
    fontSize: 15,
    lineHeight: 18,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#25496f",
    fontWeight: "600",
  },
  subtitleCompactMobile: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 13,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  badgeRowCompact: {
    flexDirection: "row",
    alignItems: "stretch",
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
  badgeCompact: {
    flex: 1,
    width: undefined,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#23415e",
  },
  badgeTextCompact: {
    flexShrink: 1,
    lineHeight: 13,
    fontSize: 10,
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
  metricGridCompactMobile: {
    marginTop: 8,
    gap: 6,
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
  metricTileCompactMobile: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 7,
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
  metricLabelCompactMobile: {
    fontSize: 9,
    letterSpacing: 0.4,
  },
  metricValueCompactMobile: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
  },
  stepCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e7df",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  stepCardCompactMobile: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  stepTitleCompactMobile: {
    fontSize: 13,
    marginTop: 3,
  },
  stepHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#5a6f83",
    fontWeight: "600",
  },
  stepHintCompactMobile: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 13,
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

const layoutStyles = StyleSheet.create({
  screen: {
    gap: 12,
  },
  contentOnly: {
    gap: 12,
  },
  shell: {
    gap: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  shellWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  shellStacked: {
    flexDirection: "column",
  },
  sidebarCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#ffffff",
    gap: 14,
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  sidebarWide: {
    width: 280,
  },
  sidebarStacked: {
    width: "100%",
  },
  sidebarEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#64748b",
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  sidebarList: {
    gap: 10,
  },
  sideNavItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#f7fbff",
  },
  sideNavStep: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sideNavStepText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#475569",
  },
  sideNavStepTextActive: {
    color: "#ffffff",
  },
  sideNavBody: {
    flex: 1,
    gap: 3,
  },
  sideNavLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  sideNavHint: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748b",
  },
  mobileNavRow: {
    gap: 8,
  },
  mobileChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#f7fbff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
    minWidth: 108,
  },
  mobileChipStep: {
    fontSize: 10,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  mobileChipLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  contentPanel: {
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
});
