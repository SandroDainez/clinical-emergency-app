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
import { useTr } from "../../lib/use-tr";

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
  subtitle?: string;
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
  const tr = useTr();
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
        <Text style={heroStyles.eyebrow}>{tr(eyebrow)}</Text>
        <Text
          style={[
            heroStyles.title,
            isRsiVisual && heroStyles.titleRsi,
            compressed && heroStyles.titleCompressed,
            mobileMinimal && heroStyles.titleCompactMobile,
            narrowPhone && heroStyles.titleCompactNarrowPhone,
            tinyPhone && heroStyles.titleCompactTinyPhone,
          ]}
          numberOfLines={2}>
          {tr(title)}
        </Text>
        <Text
          style={[
            heroStyles.subtitle,
            isRsiVisual && heroStyles.subtitleRsi,
            compressed && heroStyles.subtitleCompressed,
            mobileMinimal && heroStyles.subtitleCompactMobile,
            narrowPhone && heroStyles.subtitleCompactNarrowPhone,
            tinyPhone && heroStyles.subtitleCompactTinyPhone,
          ]}
          numberOfLines={2}>
          {subtitle ? tr(subtitle) : subtitle}
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
              {tr(badgeText)}
            </Text>
          </View>
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
              {tr(progressLabel)}
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
              key={tr(metric.label)}
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
                {tr(metric.label)}
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
                {tr(metric.value)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {showStepCard ? (
        <View
          style={[
            heroStyles.stepCard,
            isRsiVisual && heroStyles.stepCardRsi,
            mobileMinimal && heroStyles.stepCardCompactMobile,
            tinyPhone && heroStyles.stepCardCompactTinyPhone,
          ]}>
          <Text style={heroStyles.stepEyebrow}>{tr(progressLabel)}</Text>
          <Text
            style={[
              heroStyles.stepTitle,
              mobileMinimal && heroStyles.stepTitleCompactMobile,
              tinyPhone && heroStyles.stepTitleCompactTinyPhone,
            ]}>
            {tr(stepTitle)}
          </Text>
          {hint ? (
            <Text
              style={[
                heroStyles.stepHint,
                mobileMinimal && heroStyles.stepHintCompactMobile,
                tinyPhone && heroStyles.stepHintCompactTinyPhone,
              ]}>
              {tr(hint)}
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
  const tr = useTr();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const phone = width < 430;
  const isRsiVisual = visualStyle === "isr";

  return (
    <View style={[finishStyles.wrap, isRsiVisual && finishStyles.wrapRsi, phone && finishStyles.wrapPhone]}>
      <View style={[finishStyles.header, isRsiVisual && finishStyles.headerRsi, phone && finishStyles.headerPhone]}>
        <Text style={finishStyles.headerTitle}>{tr(summaryTitle)}</Text>
        {destination ? (
          <View style={[finishStyles.destinationBadge, isRsiVisual && finishStyles.destinationBadgeRsi]}>
            <Text style={[finishStyles.destinationBadgeText, isRsiVisual && finishStyles.destinationBadgeTextRsi]}>{tr(destination)}</Text>
          </View>
        ) : null}
      </View>

      <View style={[finishStyles.grid, compact && finishStyles.gridCompact, phone && finishStyles.gridPhone]}>
        <View style={[finishStyles.card, isRsiVisual && finishStyles.cardRsi, phone && finishStyles.cardPhone]}>
          <Text style={finishStyles.cardEyebrow}>{tr("Resumo clínico")}</Text>
          {summaryLines.length ? (
            <View style={finishStyles.rows}>
              {summaryLines.map((line) => (
                <View key={tr(line.label)} style={finishStyles.row}>
                  <Text style={finishStyles.rowLabel}>{tr(line.label)}</Text>
                  <Text style={finishStyles.rowValue}>{tr(line.value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={finishStyles.emptyText}>{tr("Preencha os campos desta etapa para gerar o resumo final.")}</Text>
          )}
        </View>

        <View style={[finishStyles.card, isRsiVisual && finishStyles.cardRsi, phone && finishStyles.cardPhone]}>
          <Text style={finishStyles.cardEyebrow}>{tr(infoTitle)}</Text>
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
        <Text style={finishStyles.cardEyebrow}>{tr("Relato do caso atendido")}</Text>
        <Text style={finishStyles.narrativeText}>
          {narrative?.trim() || "Use o campo de relato desta etapa para registrar apresentação, condutas, resposta e pendências do caso real."}
        </Text>
      </View>
    </View>
  );
}

/**
 * Frame de rolagem para telas de módulo que NÃO usam ModuleFlowLayout
 * (ex.: CAD/EHH, EAP, Ventilação — telas baseadas em SepsisFormTabs).
 * No WEB envolve o conteúdo num ScrollView com altura limitada à viewport;
 * no native mantém o conteúdo inline (o scroll do pai já resolve).
 */
export function ModuleWebScroll({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  if (Platform.OS === "web") {
    return (
      <ScrollView
        style={layoutStyles.screenScrollOuter}
        contentContainerStyle={[layoutStyles.screenScrollInner, contentStyle]}
        showsVerticalScrollIndicator>
        {children}
      </ScrollView>
    );
  }
  return <>{children}</>;
}

/**
 * Raiz da tela de módulo. No WEB, o conteúdo do módulo costuma ultrapassar a
 * altura da viewport; sem um ScrollView com altura limitada o conteúdo
 * transbordava e a página não rolava. Envolvemos tudo num ScrollView no web.
 * No native, mantém a View (o ScrollView/flex do pai já cuida do scroll).
 */
function FlowScreenRoot({ children }: { children: ReactNode }) {
  if (Platform.OS === "web") {
    return (
      <ScrollView
        style={layoutStyles.screenScrollOuter}
        contentContainerStyle={layoutStyles.screenScrollInner}
        showsVerticalScrollIndicator>
        {children}
      </ScrollView>
    );
  }
  return <View style={layoutStyles.screen}>{children}</View>;
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
  const tr = useTr();
  const { width, height } = useWindowDimensions();
  const useSidebar = width >= 920;
  const compact = width < 760;
  const narrowPhone = width < 390;
  const sidebarMaxHeight = Platform.OS === "web" && useSidebar ? Math.max(280, height - 220) : undefined;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const resolvedEyebrow = contentEyebrow ?? (activeItem ? `Etapa ${activeIndex + 1} de ${items.length}` : undefined);
  const resolvedTitle = contentTitle ?? activeItem?.label;
  const resolvedHint = contentHint ?? activeItem?.hint;
  const isRsiVisual = visualStyle === "isr";

  if (!items.length) {
    return (
      <FlowScreenRoot>
        {hero}
        <View style={layoutStyles.contentOnly}>{children}</View>
        {footer}
      </FlowScreenRoot>
    );
  }

  return (
    <FlowScreenRoot>
      {hero}
      <View
        style={[
          layoutStyles.shell,
          isRsiVisual && layoutStyles.shellRsi,
          useSidebar ? layoutStyles.shellWide : layoutStyles.shellStacked,
          compact && layoutStyles.shellCompact,
        ]}>
        {useSidebar ? (
          <View style={[layoutStyles.sidebarCard, isRsiVisual && layoutStyles.sidebarCardRsi, layoutStyles.sidebarWide]}>
            <Text style={layoutStyles.sidebarEyebrow}>{tr(sidebarEyebrow)}</Text>
            <Text style={layoutStyles.sidebarTitle}>{tr(sidebarTitle)}</Text>
            <ScrollView
              style={sidebarMaxHeight ? { maxHeight: sidebarMaxHeight } : undefined}
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
                        {item.icon ? `${item.icon} ${tr(item.label)}` : item.label}
                      </Text>
                      {item.hint ? <Text style={layoutStyles.sideNavHint}>{tr(item.hint)}</Text> : null}
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
            ]}>
            <Text style={layoutStyles.sidebarEyebrow}>{tr(sidebarEyebrow)}</Text>
            <Text style={layoutStyles.sidebarTitle}>{tr(sidebarTitle)}</Text>
            <ScrollView
              contentContainerStyle={[layoutStyles.sidebarList, compact && layoutStyles.sidebarListCompact]}
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
                      active && { borderColor: `${accent}55`, backgroundColor: "#ffffff" },
                    ]}>
                    <View style={[layoutStyles.sideNavStep, layoutStyles.sideNavStepCompact, { backgroundColor: active ? accent : "#e2e8f0" }]}>
                      <Text style={[layoutStyles.sideNavStepText, active && layoutStyles.sideNavStepTextActive]}>
                        {item.step ?? String(index + 1)}
                      </Text>
                    </View>
                    <View style={layoutStyles.sideNavBody}>
                      <Text style={[layoutStyles.sideNavLabel, layoutStyles.sideNavLabelCompact, active && { color: accent }]}>
                        {item.icon ? `${item.icon} ${tr(item.label)}` : item.label}
                      </Text>
                      {item.hint ? <Text style={[layoutStyles.sideNavHint, layoutStyles.sideNavHintCompact]}>{tr(item.hint)}</Text> : null}
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
              ]}>
              <View style={layoutStyles.contentHeaderText}>
                {resolvedEyebrow ? <Text style={layoutStyles.contentEyebrow}>{resolvedEyebrow}</Text> : null}
                <Text style={[layoutStyles.contentTitle, compact && layoutStyles.contentTitleCompact]}>{tr(resolvedTitle)}</Text>
                {resolvedHint ? (
                  <Text style={[layoutStyles.contentHint, compact && layoutStyles.contentHintCompact]}>{tr(resolvedHint)}</Text>
                ) : null}
              </View>
              <View style={[layoutStyles.contentHeaderPill, isRsiVisual && layoutStyles.contentHeaderPillRsi, compact && layoutStyles.contentHeaderPillCompact]}>
                <Text style={layoutStyles.contentHeaderPillText}>{tr(contentBadgeText)}</Text>
              </View>
            </View>
          ) : null}
          {children}
          {footer}
        </View>
      </View>
    </FlowScreenRoot>
  );
}

export function ModuleFlowContent({
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps,
  showsVerticalScrollIndicator,
}: ModuleFlowContentProps) {
  const tr = useTr();
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
    backgroundColor: "#1c1f24",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2a2e35",
    borderLeftWidth: 4,
    borderLeftColor: "#4d9aff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 5,
  },
  heroRsi: {
    backgroundColor: "#1c1f24",
    borderColor: "#2a2e35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
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
    color: "#94a3b8",
  },
  title: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    color: "#f1f5f9",
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
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: "#94a3b8",
    fontWeight: "600",
  },
  titleRsi: {
    color: "#f1f5f9",
  },
  subtitleRsi: {
    color: "#94a3b8",
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
    backgroundColor: "#1c1f24",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#2a2e35",
  },
  badgeRsi: {
    backgroundColor: "#1c1f24",
    borderColor: "#2a2e35",
  },
  badgeMuted: {
    backgroundColor: "rgba(14,116,144,0.15)",
  },
  badgeMutedRsi: {
    backgroundColor: "rgba(14,116,144,0.15)",
    borderColor: "#2a2e35",
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
    color: "#94a3b8",
  },
  badgeTextRsi: {
    color: "#94a3b8",
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
    color: "#4d9aff",
  },
  badgeMutedTextRsi: {
    color: "#4d9aff",
  },
  metricGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#1c1f24",
    borderWidth: 1,
    borderColor: "#2a2e35",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metricTileRsi: {
    backgroundColor: "#1c1f24",
    borderColor: "#2a2e35",
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
    color: "#94a3b8",
  },
  metricLabelRsi: {
    color: "#94a3b8",
  },
  metricLabelCompressed: {
    fontSize: 9,
  },
  metricValue: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    color: "#4d9aff",
    flexShrink: 1,
  },
  metricValueRsi: {
    color: "#4d9aff",
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
    backgroundColor: "#1c1f24",
    borderWidth: 1,
    borderColor: "#2a2e35",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  stepCardRsi: {
    borderColor: "#2a2e35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
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
    color: "#4d9aff",
  },
  stepTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "900",
    color: "#f1f5f9",
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
    color: "#94a3b8",
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
    backgroundColor: "#1c1f24",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#2a2e35",
    overflow: "hidden",
  },
  wrapRsi: {
    backgroundColor: "#1c1f24",
    borderColor: "#2a2e35",
  },
  wrapPhone: {
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 22,
  },
  header: {
    backgroundColor: "#1e6fd9",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  headerRsi: {
    backgroundColor: "#1e6fd9",
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
    backgroundColor: "#0d2a2d",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  destinationBadgeRsi: {
    backgroundColor: "#0d2a2d",
    borderWidth: 1,
    borderColor: "#4d9aff",
  },
  destinationBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#4d9aff",
  },
  destinationBadgeTextRsi: {
    color: "#4d9aff",
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
    backgroundColor: "#1c1f24",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2e35",
    padding: 14,
    gap: 10,
  },
  cardRsi: {
    borderColor: "#2a2e35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPhone: {
    borderRadius: 16,
    padding: 12,
  },
  narrativeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1c1f24",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2e35",
    padding: 14,
    gap: 8,
  },
  narrativeCardRsi: {
    borderColor: "#2a2e35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
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
    color: "#94a3b8",
  },
  rows: {
    gap: 8,
  },
  row: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2e35",
    gap: 4,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  rowValue: {
    fontSize: 13,
    lineHeight: 18,
    color: "#e2e8f0",
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
    backgroundColor: "#1e6fd9",
    marginTop: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#e2e8f0",
    fontWeight: "700",
  },
  narrativeText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#94a3b8",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#94a3b8",
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
  // Raiz scrollável no web — limita a altura à viewport e rola o conteúdo do módulo.
  screenScrollOuter: {
    flex: 1,
    minHeight: 0,
  },
  screenScrollInner: {
    gap: 14,
    paddingBottom: 28,
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
  shellRsi: {
    backgroundColor: "#121417",
    borderRadius: 32,
    paddingTop: 16,
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
    borderColor: "#2a2e35",
    backgroundColor: "#1c1f24",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  sidebarCardRsi: {
    borderColor: "#2a2e35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
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
    color: "#94a3b8",
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f1f5f9",
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
    borderColor: "#2a2e35",
    backgroundColor: "#1c1f24",
  },
  sideNavItemRsi: {
    backgroundColor: "#1c1f24",
    borderColor: "#2a2e35",
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
    color: "#94a3b8",
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
    color: "#e2e8f0",
  },
  sideNavLabelCompact: {
    fontSize: 14,
  },
  sideNavHint: {
    fontSize: 12,
    lineHeight: 17,
    color: "#94a3b8",
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
    borderColor: "#2a2e35",
    backgroundColor: "#1c1f24",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  contentHeaderRsi: {
    borderColor: "#2a2e35",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
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
    color: "#4d9aff",
  },
  contentTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: "#f1f5f9",
  },
  contentTitleCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  contentHint: {
    fontSize: 14,
    lineHeight: 20,
    color: "#94a3b8",
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
    backgroundColor: "rgba(14,116,144,0.15)",
    borderWidth: 1,
    borderColor: "#4d9aff",
  },
  contentHeaderPillRsi: {
    backgroundColor: "rgba(14,116,144,0.15)",
    borderColor: "#4d9aff",
  },
  contentHeaderPillCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contentHeaderPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4d9aff",
  },
});
