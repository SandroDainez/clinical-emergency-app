import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

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
  showStepCard?: boolean;
  compressed?: boolean;
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
  contentEyebrow?: string;
  contentTitle?: string;
  contentHint?: string;
  contentBadgeText?: string;
  showContentHeader?: boolean;
};

type ModuleFlowContentProps = Pick<
  ScrollViewProps,
  "children" | "keyboardShouldPersistTaps" | "showsVerticalScrollIndicator"
> & {
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
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
  showStepCard = true,
  compressed = false,
}: ModuleFlowHeroProps) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const phone = width < 430;
  const narrowPhone = width < 390;
  const tinyPhone = width < 361;
  const mobileMinimal = compact && (compactMobile || phone);

  return (
    <View style={[heroStyles.wrap, compact && heroStyles.wrapCompact]}>
      <View
        style={[
          heroStyles.hero,
          compressed && heroStyles.heroCompressed,
          mobileMinimal && heroStyles.heroCompactMobile,
          narrowPhone && heroStyles.heroCompactNarrowPhone,
          tinyPhone && heroStyles.heroCompactTinyPhone,
        ]}>
        <Text style={heroStyles.eyebrow}>{eyebrow}</Text>
        <Text
          style={[
            heroStyles.title,
            compressed && heroStyles.titleCompressed,
            mobileMinimal && heroStyles.titleCompactMobile,
            narrowPhone && heroStyles.titleCompactNarrowPhone,
            tinyPhone && heroStyles.titleCompactTinyPhone,
          ]}>
          {title}
        </Text>
        <Text
          style={[
            heroStyles.subtitle,
            compressed && heroStyles.subtitleCompressed,
            mobileMinimal && heroStyles.subtitleCompactMobile,
            narrowPhone && heroStyles.subtitleCompactNarrowPhone,
            tinyPhone && heroStyles.subtitleCompactTinyPhone,
          ]}>
          {subtitle}
        </Text>

        <View
          style={[
            heroStyles.badgeRow,
            compressed && heroStyles.badgeRowCompressed,
            compact && heroStyles.badgeRowCompact,
            tinyPhone && heroStyles.badgeRowNarrowMobile,
          ]}>
          <View
            style={[
              heroStyles.badge,
              compact && heroStyles.badgeCompact,
              narrowPhone && heroStyles.badgeCompactNarrowPhone,
            ]}>
            <Text
              style={[
                heroStyles.badgeText,
                compact && heroStyles.badgeTextCompact,
                narrowPhone && heroStyles.badgeTextCompactNarrowPhone,
              ]}>
              {badgeText}
            </Text>
          </View>
          <View
            style={[
              heroStyles.badge,
              heroStyles.badgeMuted,
              compact && heroStyles.badgeCompact,
              narrowPhone && heroStyles.badgeCompactNarrowPhone,
            ]}>
            <Text
              style={[
                heroStyles.badgeText,
                heroStyles.badgeMutedText,
                compact && heroStyles.badgeTextCompact,
                narrowPhone && heroStyles.badgeTextCompactNarrowPhone,
              ]}>
              {progressLabel}
            </Text>
          </View>
        </View>

        <View
          style={[
            heroStyles.metricGrid,
            compressed && heroStyles.metricGridCompressed,
            compact && heroStyles.metricGridCompact,
            mobileMinimal && heroStyles.metricGridCompactMobile,
            tinyPhone && heroStyles.metricGridTinyPhone,
          ]}>
          {metrics.map((metric) => (
            <View
              key={metric.label}
              style={[
                heroStyles.metricTile,
                compressed && heroStyles.metricTileCompressed,
                compact && heroStyles.metricTileCompact,
                mobileMinimal && heroStyles.metricTileCompactMobile,
                tinyPhone && heroStyles.metricTileTinyPhone,
              ]}>
              <Text
                style={[
                  heroStyles.metricLabel,
                  compressed && heroStyles.metricLabelCompressed,
                  mobileMinimal && heroStyles.metricLabelCompactMobile,
                  narrowPhone && heroStyles.metricLabelCompactNarrowPhone,
                ]}>
                {metric.label}
              </Text>
              <Text
                style={[
                  heroStyles.metricValue,
                  compressed && heroStyles.metricValueCompressed,
                  mobileMinimal && heroStyles.metricValueCompactMobile,
                  narrowPhone && heroStyles.metricValueCompactNarrowPhone,
                  metric.accent ? { color: metric.accent } : null,
                ]}
                numberOfLines={2}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {showStepCard ? (
        <View
          style={[
            heroStyles.stepCard,
            mobileMinimal && heroStyles.stepCardCompactMobile,
            tinyPhone && heroStyles.stepCardCompactTinyPhone,
          ]}>
          <Text style={heroStyles.stepEyebrow}>{progressLabel}</Text>
          <Text
            style={[
              heroStyles.stepTitle,
              mobileMinimal && heroStyles.stepTitleCompactMobile,
              tinyPhone && heroStyles.stepTitleCompactTinyPhone,
            ]}>
            {stepTitle}
          </Text>
          {hint ? (
            <Text
              style={[
                heroStyles.stepHint,
                mobileMinimal && heroStyles.stepHintCompactMobile,
                tinyPhone && heroStyles.stepHintCompactTinyPhone,
              ]}>
              {hint}
            </Text>
          ) : null}
        </View>
      ) : null}
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
  const phone = width < 430;

  return (
    <View style={[finishStyles.wrap, phone && finishStyles.wrapPhone]}>
      <View style={[finishStyles.header, phone && finishStyles.headerPhone]}>
        <Text style={finishStyles.headerTitle}>{summaryTitle}</Text>
        {destination ? (
          <View style={finishStyles.destinationBadge}>
            <Text style={finishStyles.destinationBadgeText}>{destination}</Text>
          </View>
        ) : null}
      </View>

      <View style={[finishStyles.grid, compact && finishStyles.gridCompact, phone && finishStyles.gridPhone]}>
        <View style={[finishStyles.card, phone && finishStyles.cardPhone]}>
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

        <View style={[finishStyles.card, phone && finishStyles.cardPhone]}>
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

      <View style={[finishStyles.narrativeCard, phone && finishStyles.narrativeCardPhone]}>
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
  contentEyebrow,
  contentTitle,
  contentHint,
  contentBadgeText = "Fluxo clínico",
  showContentHeader = true,
}: ModuleFlowLayoutProps) {
  const { width } = useWindowDimensions();
  const useSidebar = width >= 920;
  const compact = width < 760;
  const narrowPhone = width < 390;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const resolvedEyebrow = contentEyebrow ?? (activeItem ? `Etapa ${activeIndex + 1} de ${items.length}` : undefined);
  const resolvedTitle = contentTitle ?? activeItem?.label;
  const resolvedHint = contentHint ?? activeItem?.hint;

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
      <View
        style={[
          layoutStyles.shell,
          useSidebar ? layoutStyles.shellWide : layoutStyles.shellStacked,
          compact && layoutStyles.shellCompact,
        ]}>
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
          <View
            style={[
              layoutStyles.sidebarCard,
              layoutStyles.sidebarStacked,
              compact && layoutStyles.sidebarCardCompact,
            ]}>
            <Text style={layoutStyles.sidebarEyebrow}>{sidebarEyebrow}</Text>
            <Text style={layoutStyles.sidebarTitle}>{sidebarTitle}</Text>
            <View style={[layoutStyles.sidebarList, compact && layoutStyles.sidebarListCompact]}>
              {items.map((item, index) => {
                const active = item.id === activeId;
                const accent = item.accent ?? "#1d4ed8";
                return (
                  <Pressable
                    key={String(item.id)}
                    onPress={() => onSelect(item.id)}
                    style={[
                      layoutStyles.sideNavItem,
                      compact && layoutStyles.sideNavItemCompact,
                      active && { borderColor: `${accent}55`, backgroundColor: "#ffffff" },
                    ]}>
                    <View style={[layoutStyles.sideNavStep, layoutStyles.sideNavStepCompact, { backgroundColor: active ? accent : "#e2e8f0" }]}>
                      <Text style={[layoutStyles.sideNavStepText, active && layoutStyles.sideNavStepTextActive]}>
                        {item.step ?? String(index + 1)}
                      </Text>
                    </View>
                    <View style={layoutStyles.sideNavBody}>
                      <Text style={[layoutStyles.sideNavLabel, layoutStyles.sideNavLabelCompact, active && { color: accent }]}>
                        {item.icon ? `${item.icon} ${item.label}` : item.label}
                      </Text>
                      {item.hint ? <Text style={[layoutStyles.sideNavHint, layoutStyles.sideNavHintCompact]}>{item.hint}</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={layoutStyles.contentPanel}>
          {showContentHeader && resolvedTitle ? (
            <View
              style={[
                layoutStyles.contentHeader,
                compact && layoutStyles.contentHeaderCompact,
                narrowPhone && layoutStyles.contentHeaderNarrowMobile,
              ]}>
              <View style={layoutStyles.contentHeaderText}>
                {resolvedEyebrow ? <Text style={layoutStyles.contentEyebrow}>{resolvedEyebrow}</Text> : null}
                <Text style={[layoutStyles.contentTitle, compact && layoutStyles.contentTitleCompact]}>{resolvedTitle}</Text>
                {resolvedHint ? (
                  <Text style={[layoutStyles.contentHint, compact && layoutStyles.contentHintCompact]}>{resolvedHint}</Text>
                ) : null}
              </View>
              <View style={[layoutStyles.contentHeaderPill, compact && layoutStyles.contentHeaderPillCompact]}>
                <Text style={layoutStyles.contentHeaderPillText}>{contentBadgeText}</Text>
              </View>
            </View>
          ) : null}
          {children}
          {footer}
        </View>
      </View>
    </View>
  );
}

export function ModuleFlowContent({
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  showsVerticalScrollIndicator,
}: ModuleFlowContentProps) {
  if (Platform.OS === "web") {
    return <View style={contentContainerStyle}>{children}</View>;
  }

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
      {children}
    </ScrollView>
  );
}

const heroStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
    gap: 14,
  },
  wrapCompact: {
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 8,
    gap: 10,
  },
  hero: {
    backgroundColor: "#8db4f2",
    borderRadius: 32,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.16)",
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 5,
  },
  heroCompressed: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  heroCompactMobile: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroCompactNarrowPhone: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  heroCompactTinyPhone: {
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#24415f",
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#12263a",
  },
  titleCompressed: {
    marginTop: 4,
    fontSize: 23,
    lineHeight: 27,
  },
  titleCompactMobile: {
    marginTop: 4,
    fontSize: 22,
    lineHeight: 25,
  },
  titleCompactNarrowPhone: {
    fontSize: 20,
    lineHeight: 23,
  },
  titleCompactTinyPhone: {
    fontSize: 18,
    lineHeight: 21,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: "#25496f",
    fontWeight: "600",
  },
  subtitleCompressed: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  subtitleCompactMobile: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
  },
  subtitleCompactNarrowPhone: {
    fontSize: 11,
    lineHeight: 15,
  },
  subtitleCompactTinyPhone: {
    fontSize: 10,
    lineHeight: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  badgeRowCompressed: {
    marginTop: 8,
    gap: 6,
  },
  badgeRowCompact: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  badgeRowNarrowMobile: {
    flexDirection: "column",
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
  badgeCompactNarrowPhone: {
    paddingHorizontal: 8,
    paddingVertical: 5,
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
  badgeTextCompactNarrowPhone: {
    lineHeight: 12,
    fontSize: 9,
  },
  badgeMutedText: {
    color: "#45617f",
  },
  metricGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricGridCompressed: {
    marginTop: 10,
    gap: 8,
  },
  metricGridCompact: {
    gap: 8,
  },
  metricGridCompactMobile: {
    marginTop: 8,
    gap: 6,
  },
  metricGridTinyPhone: {
    flexDirection: "column",
  },
  metricTile: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 160,
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#cbdaf5",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricTileCompressed: {
    minWidth: 130,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricTileCompact: {
    flexBasis: "48%",
    minWidth: 0,
  },
  metricTileCompactMobile: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  metricTileTinyPhone: {
    flexBasis: "100%",
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#60758f",
  },
  metricLabelCompressed: {
    fontSize: 9,
  },
  metricValue: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    color: "#1f4f88",
  },
  metricValueCompressed: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
  },
  metricLabelCompactMobile: {
    fontSize: 9,
    letterSpacing: 0.4,
  },
  metricLabelCompactNarrowPhone: {
    fontSize: 8,
  },
  metricValueCompactMobile: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
  },
  metricValueCompactNarrowPhone: {
    fontSize: 10,
    lineHeight: 13,
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
  stepCardCompactTinyPhone: {
    paddingHorizontal: 10,
    paddingVertical: 7,
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
  stepTitleCompactTinyPhone: {
    fontSize: 12,
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
  stepHintCompactTinyPhone: {
    fontSize: 9,
    lineHeight: 12,
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
  wrapPhone: {
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 22,
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
  headerPhone: {
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  gridPhone: {
    padding: 12,
    gap: 10,
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
  cardPhone: {
    borderRadius: 16,
    padding: 12,
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
  narrativeCardPhone: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
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
    flex: Platform.OS === "web" ? 0 : 1,
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 0,
    gap: 14,
  },
  contentOnly: {
    flex: Platform.OS === "web" ? 0 : 1,
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 0,
    gap: 14,
  },
  shell: {
    flex: Platform.OS === "web" ? 0 : 1,
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 0,
    gap: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  shellCompact: {
    gap: 10,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  shellWide: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 0,
  },
  shellStacked: {
    flexDirection: "column",
    minHeight: 0,
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
    alignSelf: "flex-start",
  },
  sidebarStacked: {
    width: "100%",
  },
  sidebarCardCompact: {
    borderRadius: 20,
    padding: 12,
    gap: 10,
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
  sidebarListCompact: {
    gap: 8,
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
  sideNavItemCompact: {
    gap: 10,
    borderRadius: 16,
    padding: 10,
  },
  sideNavStep: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sideNavStepCompact: {
    width: 28,
    height: 28,
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
  sideNavLabelCompact: {
    fontSize: 14,
  },
  sideNavHint: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748b",
  },
  sideNavHintCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  contentPanel: {
    flex: Platform.OS === "web" ? 0 : 1,
    flexGrow: 1,
    flexShrink: 0,
    minHeight: 0,
    gap: 14,
    alignSelf: "stretch",
    overflow: Platform.OS === "web" ? "visible" : "hidden",
    minWidth: 0,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#ffffff",
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  contentHeaderCompact: {
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  contentHeaderNarrowMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  contentHeaderText: {
    flex: 1,
    gap: 4,
  },
  contentEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#0f766e",
  },
  contentTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  contentTitleCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  contentHint: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748b",
    fontWeight: "600",
  },
  contentHintCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  contentHeaderPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ecfccb",
    borderWidth: 1,
    borderColor: "#bef264",
  },
  contentHeaderPillCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contentHeaderPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4d7c0f",
  },
});
