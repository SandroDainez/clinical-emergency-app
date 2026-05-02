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
import { AppDesign } from "../../constants/app-design";

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
  visualStyle?: "classic" | "isr";
};

type ModuleFinishPanelProps = {
  summaryTitle: string;
  destination?: string;
  summaryLines: SummaryLine[];
  infoTitle: string;
  infoLines: string[];
  narrative?: string;
  visualStyle?: "classic" | "isr";
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
  visualStyle?: "classic" | "isr";
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
  visualStyle = "classic",
}: ModuleFlowHeroProps) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const phone = width < 430;
  const narrowPhone = width < 390;
  const tinyPhone = width < 361;
  const mobileMinimal = compact && (compactMobile || phone);
  const isRsiVisual = visualStyle === "isr";

  return (
    <View style={[heroStyles.wrap, compact && heroStyles.wrapCompact]}>
      <View
        style={[
          heroStyles.hero,
          isRsiVisual && heroStyles.heroRsi,
          compressed && heroStyles.heroCompressed,
          mobileMinimal && heroStyles.heroCompactMobile,
          narrowPhone && heroStyles.heroCompactNarrowPhone,
          tinyPhone && heroStyles.heroCompactTinyPhone,
        ]}>
        {eyebrow ? <Text style={heroStyles.eyebrow}>{eyebrow}</Text> : null}
        <Text
          style={[
            heroStyles.title,
            isRsiVisual && heroStyles.titleRsi,
            compressed && heroStyles.titleCompressed,
            mobileMinimal && heroStyles.titleCompactMobile,
            narrowPhone && heroStyles.titleCompactNarrowPhone,
            tinyPhone && heroStyles.titleCompactTinyPhone,
          ]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              heroStyles.subtitle,
              isRsiVisual && heroStyles.subtitleRsi,
              compressed && heroStyles.subtitleCompressed,
              mobileMinimal && heroStyles.subtitleCompactMobile,
              narrowPhone && heroStyles.subtitleCompactNarrowPhone,
              tinyPhone && heroStyles.subtitleCompactTinyPhone,
            ]}>
            {subtitle}
          </Text>
        ) : null}

        {badgeText || progressLabel ? (
          <View
            style={[
              heroStyles.badgeRow,
              compressed && heroStyles.badgeRowCompressed,
              compact && heroStyles.badgeRowCompact,
              tinyPhone && heroStyles.badgeRowNarrowMobile,
            ]}>
            {badgeText ? (
              <View
                style={[
                  heroStyles.badge,
                  isRsiVisual && heroStyles.badgeRsi,
                  compact && heroStyles.badgeCompact,
                  narrowPhone && heroStyles.badgeCompactNarrowPhone,
                ]}>
                <Text
                  style={[
                    heroStyles.badgeText,
                    isRsiVisual && heroStyles.badgeTextRsi,
                    compact && heroStyles.badgeTextCompact,
                    narrowPhone && heroStyles.badgeTextCompactNarrowPhone,
                  ]}>
                  {badgeText}
                </Text>
              </View>
            ) : null}
            {progressLabel ? (
              <View
                style={[
                  heroStyles.badge,
                  heroStyles.badgeMuted,
                  isRsiVisual && heroStyles.badgeMutedRsi,
                  compact && heroStyles.badgeCompact,
                  narrowPhone && heroStyles.badgeCompactNarrowPhone,
                ]}>
                <Text
                  style={[
                    heroStyles.badgeText,
                    heroStyles.badgeMutedText,
                    isRsiVisual && heroStyles.badgeMutedTextRsi,
                    compact && heroStyles.badgeTextCompact,
                    narrowPhone && heroStyles.badgeTextCompactNarrowPhone,
                  ]}>
                  {progressLabel}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {metrics.length ? (
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
                  isRsiVisual && heroStyles.metricTileRsi,
                  compressed && heroStyles.metricTileCompressed,
                  compact && heroStyles.metricTileCompact,
                  mobileMinimal && heroStyles.metricTileCompactMobile,
                  tinyPhone && heroStyles.metricTileTinyPhone,
                ]}>
                <Text
                  style={[
                    heroStyles.metricLabel,
                    isRsiVisual && heroStyles.metricLabelRsi,
                    compressed && heroStyles.metricLabelCompressed,
                    mobileMinimal && heroStyles.metricLabelCompactMobile,
                    narrowPhone && heroStyles.metricLabelCompactNarrowPhone,
                  ]}>
                  {metric.label}
                </Text>
                <Text
                  style={[
                    heroStyles.metricValue,
                    isRsiVisual && heroStyles.metricValueRsi,
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
        ) : null}
      </View>

      {showStepCard ? (
        <View
          style={[
            heroStyles.stepCard,
            isRsiVisual && heroStyles.stepCardRsi,
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
  visualStyle = "classic",
}: ModuleFinishPanelProps) {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const phone = width < 430;
  const isRsiVisual = visualStyle === "isr";

  return (
    <View style={[finishStyles.wrap, isRsiVisual && finishStyles.wrapRsi, phone && finishStyles.wrapPhone]}>
      <View style={[finishStyles.header, isRsiVisual && finishStyles.headerRsi, phone && finishStyles.headerPhone]}>
        <Text style={finishStyles.headerTitle}>{summaryTitle}</Text>
        {destination ? (
          <View style={[finishStyles.destinationBadge, isRsiVisual && finishStyles.destinationBadgeRsi]}>
            <Text style={[finishStyles.destinationBadgeText, isRsiVisual && finishStyles.destinationBadgeTextRsi]}>{destination}</Text>
          </View>
        ) : null}
      </View>

      <View style={[finishStyles.grid, compact && finishStyles.gridCompact, phone && finishStyles.gridPhone]}>
        <View style={[finishStyles.card, isRsiVisual && finishStyles.cardRsi, phone && finishStyles.cardPhone]}>
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

        <View style={[finishStyles.card, isRsiVisual && finishStyles.cardRsi, phone && finishStyles.cardPhone]}>
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

      <View style={[finishStyles.narrativeCard, isRsiVisual && finishStyles.narrativeCardRsi, phone && finishStyles.narrativeCardPhone]}>
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
  visualStyle = "classic",
}: ModuleFlowLayoutProps) {
  const { width } = useWindowDimensions();
  const useSidebar = width >= 920;
  const compact = width < 760;
  const compactNav = !useSidebar && compact;
  const narrowPhone = width < 390;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const resolvedEyebrow = contentEyebrow ?? (activeItem ? `Etapa ${activeIndex + 1} de ${items.length}` : undefined);
  const resolvedTitle = contentTitle ?? activeItem?.label;
  const resolvedHint = contentHint ?? activeItem?.hint;
  const isRsiVisual = visualStyle === "isr";
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
          isRsiVisual && layoutStyles.shellRsi,
          useSidebar ? layoutStyles.shellWide : layoutStyles.shellStacked,
          compact && layoutStyles.shellCompact,
        ]}>
        {useSidebar ? (
          <View
            style={[
              layoutStyles.sidebarCard,
              isRsiVisual && layoutStyles.sidebarCardRsi,
              layoutStyles.sidebarWide,
            ]}>
            <Text style={layoutStyles.sidebarEyebrow}>{sidebarEyebrow}</Text>
            <Text style={layoutStyles.sidebarTitle}>{sidebarTitle}</Text>
            <ScrollView
              style={layoutStyles.sidebarScroll}
              contentContainerStyle={layoutStyles.sidebarList}
              showsVerticalScrollIndicator={false}>
              {items.map((item, index) => {
                const active = item.id === activeId;
                const accent = item.accent ?? "#1d4ed8";
                return (
                  <Pressable
                    key={String(item.id)}
                    onPress={() => onSelect(item.id)}
                    style={[
                      layoutStyles.sideNavItem,
                      isRsiVisual && layoutStyles.sideNavItemRsi,
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
            </ScrollView>
          </View>
        ) : (
          <View
            style={[
              layoutStyles.sidebarCard,
              isRsiVisual && layoutStyles.sidebarCardRsi,
              layoutStyles.sidebarStacked,
              compact && layoutStyles.sidebarCardCompact,
              compactNav && layoutStyles.sidebarCardPhone,
            ]}>
            {!compactNav ? <Text style={layoutStyles.sidebarEyebrow}>{sidebarEyebrow}</Text> : null}
            <Text style={[layoutStyles.sidebarTitle, compactNav && layoutStyles.sidebarTitlePhone]}>
              {compactNav ? "Regiões do fluxo" : sidebarTitle}
            </Text>
            <ScrollView
              style={[layoutStyles.sidebarScroll, compactNav && layoutStyles.sidebarScrollCompactNav]}
              horizontal={compactNav}
              contentContainerStyle={[
                layoutStyles.sidebarList,
                compact && layoutStyles.sidebarListCompact,
                compactNav && layoutStyles.sidebarListHorizontal,
              ]}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}>
              {items.map((item, index) => {
                const active = item.id === activeId;
                const accent = item.accent ?? "#1d4ed8";
                return (
                  <Pressable
                    key={String(item.id)}
                    onPress={() => onSelect(item.id)}
                    style={[
                      layoutStyles.sideNavItem,
                      isRsiVisual && layoutStyles.sideNavItemRsi,
                      compact && layoutStyles.sideNavItemCompact,
                      compactNav && layoutStyles.sideNavItemHorizontal,
                      active && { borderColor: `${accent}55`, backgroundColor: "#ffffff" },
                    ]}>
                    <View style={[layoutStyles.sideNavStep, layoutStyles.sideNavStepCompact, { backgroundColor: active ? accent : "#e2e8f0" }]}>
                      <Text style={[layoutStyles.sideNavStepText, active && layoutStyles.sideNavStepTextActive]}>
                        {item.step ?? String(index + 1)}
                      </Text>
                    </View>
                    <View style={layoutStyles.sideNavBody}>
                      <Text
                        style={[
                          layoutStyles.sideNavLabel,
                          layoutStyles.sideNavLabelCompact,
                          compactNav && layoutStyles.sideNavLabelPhone,
                          active && { color: accent },
                        ]}>
                        {item.icon ? `${item.icon} ${item.label}` : item.label}
                      </Text>
                      {!compactNav && item.hint ? <Text style={[layoutStyles.sideNavHint, layoutStyles.sideNavHintCompact]}>{item.hint}</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={layoutStyles.contentPanel}>
          {showContentHeader && resolvedTitle ? (
            <View
            style={[
              layoutStyles.contentHeader,
              isRsiVisual && layoutStyles.contentHeaderRsi,
              compact && layoutStyles.contentHeaderCompact,
              narrowPhone && layoutStyles.contentHeaderNarrowMobile,
              compactNav && layoutStyles.contentHeaderPhone,
              ]}>
              <View style={layoutStyles.contentHeaderText}>
                {resolvedEyebrow ? <Text style={layoutStyles.contentEyebrow}>{resolvedEyebrow}</Text> : null}
                <Text style={[layoutStyles.contentTitle, compact && layoutStyles.contentTitleCompact]}>{resolvedTitle}</Text>
                {resolvedHint ? (
                  <Text style={[layoutStyles.contentHint, compact && layoutStyles.contentHintCompact]}>{resolvedHint}</Text>
                ) : null}
              </View>
              <View style={[layoutStyles.contentHeaderPill, isRsiVisual && layoutStyles.contentHeaderPillRsi, compact && layoutStyles.contentHeaderPillCompact]}>
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
  return (
    <ScrollView
      style={[layoutStyles.flowScroll, style]}
      contentContainerStyle={contentContainerStyle}
      nestedScrollEnabled
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
      {children}
    </ScrollView>
  );
}

const heroStyles = StyleSheet.create({
  wrap: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 6,
    gap: 8,
  },
  wrapCompact: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 6,
    gap: 8,
  },
  hero: {
    backgroundColor: "#8db4f2",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.16)",
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  heroRsi: {
    backgroundColor: AppDesign.accent.lime,
    borderColor: AppDesign.border.subtle,
    shadowColor: AppDesign.shadow.hero.shadowColor,
    shadowOffset: AppDesign.shadow.hero.shadowOffset,
    shadowOpacity: AppDesign.shadow.hero.shadowOpacity,
    shadowRadius: AppDesign.shadow.hero.shadowRadius,
    elevation: AppDesign.shadow.hero.elevation,
  },
  heroCompressed: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroCompactMobile: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#24415f",
  },
  title: {
    marginTop: 2,
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "900",
    color: "#12263a",
  },
  titleCompressed: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 21,
  },
  titleCompactMobile: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 19,
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
    marginTop: 2,
    fontSize: 12,
    lineHeight: 15,
    color: "#25496f",
    fontWeight: "600",
  },
  titleRsi: {
    color: "#1f2d4d",
  },
  subtitleRsi: {
    color: "#415a80",
  },
  subtitleCompressed: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 14,
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
    gap: 5,
    marginTop: 8,
  },
  badgeRowCompressed: {
    marginTop: 5,
    gap: 5,
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
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#cddbf3",
  },
  badgeRsi: {
    backgroundColor: "#ffffff",
    borderColor: AppDesign.border.subtle,
  },
  badgeMuted: {
    backgroundColor: "#dbe8ff",
  },
  badgeMutedRsi: {
    backgroundColor: AppDesign.accent.primaryMuted,
    borderColor: AppDesign.border.subtle,
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
    fontSize: 9,
    fontWeight: "900",
    color: "#23415e",
  },
  badgeTextRsi: {
    color: "#253a5c",
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
  badgeMutedTextRsi: {
    color: "#556b8a",
  },
  metricGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metricGridCompressed: {
    marginTop: 6,
    gap: 5,
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
    minWidth: 120,
    borderRadius: 14,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#cbdaf5",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricTileRsi: {
    backgroundColor: "#f7fbff",
    borderColor: AppDesign.border.subtle,
  },
  metricTileCompressed: {
    minWidth: 108,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
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
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#60758f",
  },
  metricLabelRsi: {
    color: "#6b7d96",
  },
  metricLabelCompressed: {
    fontSize: 9,
  },
  metricValue: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    color: "#1f4f88",
  },
  metricValueRsi: {
    color: "#2a5f9a",
  },
  metricValueCompressed: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
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
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e7df",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  stepCardRsi: {
    borderColor: AppDesign.border.subtle,
    shadowColor: AppDesign.shadow.card.shadowColor,
    shadowOffset: AppDesign.shadow.card.shadowOffset,
    shadowOpacity: AppDesign.shadow.card.shadowOpacity,
    shadowRadius: AppDesign.shadow.card.shadowRadius,
    elevation: AppDesign.shadow.card.elevation,
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
    marginTop: 2,
    fontSize: 14,
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
    marginTop: 4,
    fontSize: 11,
    lineHeight: 14,
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
  wrapRsi: {
    backgroundColor: AppDesign.surface.shellMint,
    borderColor: AppDesign.border.subtle,
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
  headerRsi: {
    backgroundColor: AppDesign.accent.limeDark,
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
  destinationBadgeRsi: {
    backgroundColor: "#ecfccb",
    borderWidth: 1,
    borderColor: "#b9df64",
  },
  destinationBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#d8fff4",
  },
  destinationBadgeTextRsi: {
    color: "#6a861d",
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
  cardRsi: {
    borderColor: AppDesign.border.subtle,
    shadowColor: AppDesign.shadow.card.shadowColor,
    shadowOffset: AppDesign.shadow.card.shadowOffset,
    shadowOpacity: AppDesign.shadow.card.shadowOpacity,
    shadowRadius: AppDesign.shadow.card.shadowRadius,
    elevation: AppDesign.shadow.card.elevation,
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
  narrativeCardRsi: {
    borderColor: AppDesign.border.subtle,
    shadowColor: AppDesign.shadow.card.shadowColor,
    shadowOffset: AppDesign.shadow.card.shadowOffset,
    shadowOpacity: AppDesign.shadow.card.shadowOpacity,
    shadowRadius: AppDesign.shadow.card.shadowRadius,
    elevation: AppDesign.shadow.card.elevation,
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
    flex: 1,
    minHeight: 0,
    gap: 8,
  },
  contentOnly: {
    flex: 1,
    minHeight: 0,
    gap: 8,
  },
  shell: {
    flex: 1,
    minHeight: 0,
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  shellRsi: {
    backgroundColor: "#dff7f3",
    borderRadius: 24,
    paddingTop: 10,
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
    minHeight: 0,
    flexShrink: 0,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    gap: 8,
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sidebarCardRsi: {
    borderColor: AppDesign.border.subtle,
    shadowColor: AppDesign.shadow.card.shadowColor,
    shadowOffset: AppDesign.shadow.card.shadowOffset,
    shadowOpacity: AppDesign.shadow.card.shadowOpacity,
    shadowRadius: AppDesign.shadow.card.shadowRadius,
    elevation: AppDesign.shadow.card.elevation,
  },
  sidebarWide: {
    width: 208,
    alignSelf: "stretch",
  },
  sidebarStacked: {
    width: "100%",
    minHeight: 0,
  },
  sidebarCardCompact: {
    borderRadius: 20,
    padding: 12,
    gap: 10,
  },
  sidebarCardPhone: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4,
  },
  sidebarEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#64748b",
  },
  sidebarTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  sidebarTitlePhone: {
    fontSize: 12,
  },
  sidebarList: {
    gap: 6,
  },
  sidebarListCompact: {
    gap: 8,
  },
  sidebarListHorizontal: {
    flexDirection: "row",
    gap: 4,
    paddingRight: 2,
  },
  sidebarScrollCompactNav: {
    flexGrow: 0,
    flexShrink: 0,
  },
  sidebarScroll: {
    flex: 1,
    minHeight: 0,
    flexShrink: 1,
  },
  sideNavItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#f7fbff",
  },
  sideNavItemRsi: {
    backgroundColor: AppDesign.surface.shellMint,
    borderColor: AppDesign.border.subtle,
  },
  sideNavItemCompact: {
    gap: 10,
    borderRadius: 16,
    padding: 10,
  },
  sideNavItemHorizontal: {
    width: 132,
    flexShrink: 0,
    alignSelf: "stretch",
  },
  sideNavStep: {
    width: 24,
    height: 24,
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
    gap: 2,
  },
  sideNavLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  sideNavLabelCompact: {
    fontSize: 14,
  },
  sideNavLabelPhone: {
    fontSize: 11,
    lineHeight: 14,
  },
  sideNavHint: {
    fontSize: 10,
    lineHeight: 13,
    color: "#64748b",
  },
  sideNavHintCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  contentPanel: {
    flex: 1,
    minHeight: 0,
    gap: 8,
    alignSelf: "stretch",
    overflow: Platform.OS === "web" ? "visible" : "hidden",
    minWidth: 0,
  },
  flowScroll: {
    flex: 1,
    minHeight: 0,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#ffffff",
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentHeaderRsi: {
    borderColor: AppDesign.border.subtle,
    shadowColor: AppDesign.shadow.card.shadowColor,
    shadowOffset: AppDesign.shadow.card.shadowOffset,
    shadowOpacity: AppDesign.shadow.card.shadowOpacity,
    shadowRadius: AppDesign.shadow.card.shadowRadius,
    elevation: AppDesign.shadow.card.elevation,
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
  contentHeaderPhone: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
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
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "900",
    color: "#0f172a",
  },
  contentTitleCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  contentHint: {
    fontSize: 12,
    lineHeight: 15,
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
  contentHeaderPillRsi: {
    backgroundColor: "#ecfccb",
    borderColor: "#b9df64",
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
  phaseGuideCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#cfe0ff",
    backgroundColor: "#f8fbff",
    padding: 16,
    gap: 10,
  },
  phaseGuideCardRsi: {
    borderColor: AppDesign.border.subtle,
    backgroundColor: "#f7fbff",
  },
  phaseGuideCardCompact: {
    borderRadius: 18,
    padding: 14,
  },
  phaseGuideEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f766e",
  },
  phaseGuideTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: "#163457",
  },
  phaseGuideList: {
    gap: 8,
  },
  phaseGuideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  phaseGuideBullet: {
    width: 18,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "900",
    color: "#1d4ed8",
  },
  phaseGuideText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#42566f",
    fontWeight: "700",
  },
  phaseGuideStrong: {
    color: "#163457",
    fontWeight: "900",
  },
});
