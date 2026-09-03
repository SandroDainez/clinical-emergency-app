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
import { TEMAS } from "../../design-system/tokens";

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

/**
 * Texto legível sobre uma cor de fundo qualquer — escolhido, não escrito.
 *
 * ⚠️ Existe para não inventar paleta. Os acentos vêm do dado de cada módulo, e
 * alguns pedem texto claro (#2563eb) enquanto outros pedem escuro (#0891b2).
 * Fixar uma das duas cores reprovaria metade: o cloro dava 3,36:1 com o claro e
 * dá 5,08:1 com o escuro. A função devolve o TOKEN que contrasta mais, entre os
 * dois que o tema já tem.
 */
function textoSobre(fundo: string): string {
  const hex = fundo.replace("#", "");
  const cheio = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const canal = (i: number) => {
    const v = parseInt(cheio.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const l = 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
  const contra = (outra: number) => {
    const [a, b] = l > outra ? [l, outra] : [outra, l];
    return (a + 0.05) / (b + 0.05);
  };
  // Os dois tokens de texto do tema escuro — nada de cor escrita aqui.
  return contra(0.9067) >= contra(0.0058) ? TEMAS.escuro.cores.text : TEMAS.escuro.cores.onPrimary;
}

type ModuleFlowSidebarItem = {
  id: string | number;
  icon?: string;
  label: string;
  hint?: string;
  step?: string;
  accent?: string;
  /**
   * Símbolo do item — o que o médico PROCURA na lista (Na, K, Ca…).
   *
   * ⚠️ Sem isto o círculo mostrava o ÍNDICE (1, 2, 3…), que não significa nada
   * numa lista de eletrólitos: a ordem é arbitrária e ninguém decora que o
   * potássio é "o 2". O dado já trazia o símbolo e ele morria aqui.
   */
  simbolo?: string;
};


/**
 * RAIL DE MÓDULO — a navegação lateral, agora em UM componente só.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * O app tinha QUATRO navegações laterais com a mesma função e três aparências:
 * Calculadoras (#0c2a3a, 96 px), Sedoanalgesia (#1e1b4b, 92 px), Vasoativas
 * (#1e6fd9, 86 px, rótulos de 9 px em 2,36:1 — o "rail apagado" que o autor
 * relatou) e a do `ModuleFlowLayout`. Divergência sem causa.
 *
 * ⚠️ E A MEDIÇÃO MOSTROU QUE NÃO ERA SÓ ESTÉTICA: o rail permanente consome de
 * 86 a 96 px de uma tela de 375 — 23 a 26% —, e é o que esmagava as barras
 * numéricas das três telas (0 px, 2 px, 40 px). Convergir devolve a largura.
 *
 * Em tela estreita o rail vira LISTA HORIZONTAL no topo, seguindo o mesmo
 * limiar do `ModuleFlowLayout` (920 px). O autor decidiu a troca: uma rolagem
 * para trocar de fármaco custa menos que não conseguir titular o fármaco
 * escolhido — e titular é a razão de ser do módulo.
 *
 * O `icon` é a MESMA ROTA por onde o glifo do íon chegou nos Eletrólitos. É a
 * segunda vez que o mesmo campo serve para uma necessidade diferente, e isso é
 * o argumento contra a próxima tentação de criar rota nova.
 */
export function RailDeModulo({
  items,
  activeId,
  onSelect,
  eyebrow = "Navegação do módulo",
  titulo,
}: {
  items: ModuleFlowSidebarItem[];
  activeId: string | number;
  onSelect: (id: string | number) => void;
  eyebrow?: string;
  titulo?: string;
}) {
  const tr = useTr();
  const { width } = useWindowDimensions();
  const lateral = width >= 920;

  const lista = (
    <ScrollView
      horizontal={!lateral}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={!lateral}
      persistentScrollbar={!lateral}
      contentContainerStyle={lateral ? layoutStyles.sidebarList : railStyles.tiraConteudo}>
      {items.map((item, index) => {
        const active = item.id === activeId;
        const accent = item.accent ?? TEMAS.escuro.cores.primary;
        return (
          <Pressable
            key={String(item.id)}
            onPress={() => onSelect(item.id)}
            style={[
              layoutStyles.sideNavItem,
              !lateral && railStyles.itemNaTira,
              active && layoutStyles.sideNavItemAtivo,
            ]}>
            <View style={[layoutStyles.sideNavStep, { backgroundColor: accent }]}>
              <Text
                testID={`rail-simbolo-${String(item.id)}`}
                style={[layoutStyles.sideNavStepText, { color: textoSobre(accent) }]}>
                {item.simbolo ?? item.step ?? String(index + 1)}
              </Text>
            </View>
            <View style={layoutStyles.sideNavBody}>
              <Text style={[layoutStyles.sideNavLabel, active && layoutStyles.sideNavLabelAtivo]}>
                {item.icon ? `${item.icon} ${tr(item.label)}` : tr(item.label)}
              </Text>
              {item.hint && lateral ? (
                <Text style={layoutStyles.sideNavHint}>{tr(item.hint)}</Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[layoutStyles.sidebarCard, lateral ? railStyles.lateral : railStyles.tira]}>
      <Text style={layoutStyles.sidebarEyebrow}>{tr(eyebrow)}</Text>
      {titulo ? <Text style={layoutStyles.sidebarTitle}>{tr(titulo)}</Text> : null}
      {lista}
    </View>
  );
}

const railStyles = StyleSheet.create({
  lateral: { width: 300 },
  tira: { width: "100%" },
  tiraConteudo: { flexDirection: "row", gap: 10, paddingVertical: 2, paddingBottom: 10 },
  itemNaTira: { minWidth: 190 },
});

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
              heroStyles.metricsInline,
              compressed && heroStyles.metricsInlineCompressed,
              compact && heroStyles.metricsInlineCompact,
              narrowPhone && heroStyles.metricsInlineNarrowPhone,
              tinyPhone && heroStyles.metricsInlineTinyPhone,
            ]}>
            {metrics.map((metric) => (
              <View
                key={`${metric.label}-${metric.value}`}
                style={[
                  heroStyles.metricInline,
                  compressed && heroStyles.metricInlineCompressed,
                  compact && heroStyles.metricInlineCompact,
                  narrowPhone && heroStyles.metricInlineNarrowPhone,
                  tinyPhone && heroStyles.metricInlineTinyPhone,
                ]}>
                <Text
                  style={[
                    heroStyles.metricInlineValue,
                    compressed && heroStyles.metricInlineValueCompressed,
                    compact && heroStyles.metricInlineValueCompact,
                    narrowPhone && heroStyles.metricInlineValueNarrowPhone,
                    tinyPhone && heroStyles.metricInlineValueTinyPhone,
                    metric.accent ? { color: metric.accent } : null,
                  ]}
                  numberOfLines={1}>
                  {metric.value}
                </Text>
                <Text
                  style={[
                    heroStyles.metricInlineLabel,
                    compressed && heroStyles.metricInlineLabelCompressed,
                    compact && heroStyles.metricInlineLabelCompact,
                    narrowPhone && heroStyles.metricInlineLabelNarrowPhone,
                    tinyPhone && heroStyles.metricInlineLabelTinyPhone,
                  ]}
                  numberOfLines={1}>
                  {tr(metric.label)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {showStepCard ? (
        <View
          style={[
            heroStyles.stepCard,
            isRsiVisual && heroStyles.stepCardRsi,
            compressed && heroStyles.stepCardCompressed,
            mobileMinimal && heroStyles.stepCardCompactMobile,
            tinyPhone && heroStyles.stepCardCompactTinyPhone,
          ]}>
          <View style={heroStyles.stepAccent} />
          <View
            style={[
              heroStyles.stepCopy,
              compressed && heroStyles.stepCopyCompressed,
              mobileMinimal && heroStyles.stepCopyCompactMobile,
            ]}>
            <Text
              style={[
                heroStyles.stepLabel,
                isRsiVisual && heroStyles.stepLabelRsi,
                compressed && heroStyles.stepLabelCompressed,
                mobileMinimal && heroStyles.stepLabelCompactMobile,
              ]}>
              {tr(progressLabel)}
            </Text>
            <Text
              style={[
                heroStyles.stepTitle,
                isRsiVisual && heroStyles.stepTitleRsi,
                compressed && heroStyles.stepTitleCompressed,
                mobileMinimal && heroStyles.stepTitleCompactMobile,
                narrowPhone && heroStyles.stepTitleCompactNarrowPhone,
              ]}
              numberOfLines={2}>
              {tr(stepTitle)}
            </Text>
            {hint ? <Text style={heroStyles.stepHint}>{tr(hint)}</Text> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function ModuleFlowContent({
  children,
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  style,
  contentContainerStyle,
}: ModuleFlowContentProps) {
  return (
    <ScrollView
      style={[layoutStyles.contentScroll, style]}
      contentContainerStyle={[layoutStyles.contentScrollBody, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
      {children}
    </ScrollView>
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
  const isRsiVisual = visualStyle === "isr";

  return (
    <View style={finishStyles.wrapper}>
      <View style={[finishStyles.summaryCard, isRsiVisual && finishStyles.summaryCardRsi]}>
        <Text style={[finishStyles.summaryTitle, isRsiVisual && finishStyles.summaryTitleRsi]}>
          {tr(summaryTitle)}
        </Text>
        {destination ? <Text style={finishStyles.destination}>{tr(destination)}</Text> : null}
        {summaryLines.map((line) => (
          <View key={`${line.label}-${line.value}`} style={finishStyles.summaryRow}>
            <Text style={finishStyles.summaryLabel}>{tr(line.label)}</Text>
            <Text style={finishStyles.summaryValue}>{tr(line.value)}</Text>
          </View>
        ))}
      </View>

      <View style={finishStyles.infoCard}>
        <Text style={finishStyles.infoTitle}>{tr(infoTitle)}</Text>
        {infoLines.map((line) => (
          <Text key={line} style={finishStyles.infoLine}>
            • {tr(line)}
          </Text>
        ))}
        {narrative ? <Text style={finishStyles.narrative}>{tr(narrative)}</Text> : null}
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
  sidebarEyebrow = "Etapas",
  sidebarTitle,
  contentEyebrow = "Passo atual",
  contentTitle,
  contentHint,
  contentBadgeText,
  showContentHeader = true,
  visualStyle = "classic",
}: ModuleFlowLayoutProps) {
  const tr = useTr();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const phone = width < 430;
  const narrowPhone = width < 390;
  const tinyPhone = width < 361;
  const sidebarCompact = width < 920;
  const isRsiVisual = visualStyle === "isr";

  return (
    <View style={layoutStyles.shell}>
      <View
        style={[
          layoutStyles.body,
          compact && layoutStyles.bodyCompact,
          tinyPhone && layoutStyles.bodyTinyPhone,
        ]}>
        <View
          style={[
            layoutStyles.sidebarCard,
            sidebarCompact && layoutStyles.sidebarCardCompact,
            tinyPhone && layoutStyles.sidebarCardTinyPhone,
          ]}>
          <Text style={layoutStyles.sidebarEyebrow}>{tr(sidebarEyebrow)}</Text>
          {sidebarTitle ? (
            <Text style={layoutStyles.sidebarTitle}>{tr(sidebarTitle)}</Text>
          ) : null}
          <View
            style={[
              layoutStyles.sidebarList,
              sidebarCompact && layoutStyles.sidebarListCompact,
              tinyPhone && layoutStyles.sidebarListTinyPhone,
            ]}>
            {items.map((item, index) => {
              const active = item.id === activeId;
              const accent = item.accent ?? TEMAS.escuro.cores.primary;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelect(item.id)}
                  style={[
                    layoutStyles.sideNavItem,
                    sidebarCompact && layoutStyles.sideNavItemCompact,
                    tinyPhone && layoutStyles.sideNavItemTinyPhone,
                    active && layoutStyles.sideNavItemAtivo,
                  ]}>
                  <View
                    style={[
                      layoutStyles.sideNavStep,
                      sidebarCompact && layoutStyles.sideNavStepCompact,
                      tinyPhone && layoutStyles.sideNavStepTinyPhone,
                      { backgroundColor: accent },
                    ]}>
                    <Text
                      testID={`layout-rail-simbolo-${String(item.id)}`}
                      style={[
                        layoutStyles.sideNavStepText,
                        sidebarCompact && layoutStyles.sideNavStepTextCompact,
                        { color: textoSobre(accent) },
                      ]}>
                      {item.simbolo ?? item.step ?? String(index + 1)}
                    </Text>
                  </View>
                  <View
                    style={[
                      layoutStyles.sideNavBody,
                      sidebarCompact && layoutStyles.sideNavBodyCompact,
                    ]}>
                    <Text
                      style={[
                        layoutStyles.sideNavLabel,
                        sidebarCompact && layoutStyles.sideNavLabelCompact,
                        tinyPhone && layoutStyles.sideNavLabelTinyPhone,
                        active && layoutStyles.sideNavLabelAtivo,
                      ]}
                      numberOfLines={2}>
                      {item.icon ? `${item.icon} ${tr(item.label)}` : tr(item.label)}
                    </Text>
                    {item.hint && !sidebarCompact ? (
                      <Text style={layoutStyles.sideNavHint}>{tr(item.hint)}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            layoutStyles.contentCard,
            isRsiVisual && layoutStyles.contentCardRsi,
            compact && layoutStyles.contentCardCompact,
            tinyPhone && layoutStyles.contentCardTinyPhone,
          ]}>
          {showContentHeader ? (
            <View
              style={[
                layoutStyles.contentHeader,
                isRsiVisual && layoutStyles.contentHeaderRsi,
                compact && layoutStyles.contentHeaderCompact,
                tinyPhone && layoutStyles.contentHeaderTinyPhone,
              ]}>
              <View style={layoutStyles.contentTitleWrap}>
                <Text
                  style={[
                    layoutStyles.contentEyebrow,
                    isRsiVisual && layoutStyles.contentEyebrowRsi,
                  ]}>
                  {tr(contentEyebrow)}
                </Text>
                {contentTitle ? (
                  <Text
                    style={[
                      layoutStyles.contentTitle,
                      isRsiVisual && layoutStyles.contentTitleRsi,
                      compact && layoutStyles.contentTitleCompact,
                      narrowPhone && layoutStyles.contentTitleNarrowPhone,
                      tinyPhone && layoutStyles.contentTitleTinyPhone,
                    ]}
                    numberOfLines={2}>
                    {tr(contentTitle)}
                  </Text>
                ) : null}
                {contentHint ? (
                  <Text style={layoutStyles.contentHint} numberOfLines={2}>
                    {tr(contentHint)}
                  </Text>
                ) : null}
              </View>
              {contentBadgeText ? (
                <View style={layoutStyles.contentBadge}>
                  <Text style={layoutStyles.contentBadgeText}>{tr(contentBadgeText)}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          {children}
        </View>
      </View>
      {footer ? <View style={layoutStyles.footer}>{footer}</View> : null}
    </View>
  );
}

const heroStyles = StyleSheet.create({
  wrap: { gap: 14 },
  wrapCompact: { gap: 8 },
  hero: {
    minHeight: 176,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1d4ed8",
    backgroundColor: "#0f2d45",
    padding: 24,
    ...Platform.select({
      web: { boxShadow: "0 18px 34px rgba(8, 47, 73, 0.18)" } as any,
      default: {},
    }),
  },
  heroCompressed: { minHeight: 136, paddingVertical: 16 },
  heroCompactMobile: { minHeight: 110, padding: 14, gap: 5 },
  heroCompactNarrowPhone: { minHeight: 104, paddingHorizontal: 12, paddingVertical: 12 },
  heroCompactTinyPhone: { minHeight: 96, paddingHorizontal: 10, paddingVertical: 10 },
  heroRsi: {
    borderColor: "#38bdf8",
    backgroundColor: "#082f49",
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#7dd3fc",
  },
  title: {
    marginTop: 8,
    color: "#ffffff",
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  titleCompressed: { marginTop: 4, fontSize: 28, lineHeight: 33 },
  titleCompactMobile: { marginTop: 2, fontSize: 20, lineHeight: 24, letterSpacing: -0.35 },
  titleCompactNarrowPhone: { fontSize: 18, lineHeight: 22 },
  titleCompactTinyPhone: { fontSize: 17, lineHeight: 20 },
  titleRsi: { color: "#f0f9ff" },
  subtitle: {
    marginTop: 8,
    color: "#bae6fd",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    maxWidth: 760,
  },
  subtitleCompressed: { marginTop: 4, fontSize: 14, lineHeight: 19 },
  subtitleCompactMobile: { marginTop: 1, fontSize: 12, lineHeight: 15, maxWidth: "100%" },
  subtitleCompactNarrowPhone: { fontSize: 11, lineHeight: 14 },
  subtitleCompactTinyPhone: { fontSize: 10.5, lineHeight: 13 },
  subtitleRsi: { color: "#bae6fd" },
  badgeRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  badgeRowCompressed: { marginTop: 10 },
  badgeRowCompact: { marginTop: 8, alignItems: "flex-end" },
  badgeRowNarrowMobile: { marginTop: 6, gap: 7 },
  badge: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  badgeCompact: { minHeight: 32, paddingHorizontal: 10, paddingVertical: 4 },
  badgeCompactNarrowPhone: { minHeight: 29, paddingHorizontal: 8, paddingVertical: 3 },
  badgeRsi: { backgroundColor: "#e0f2fe" },
  badgeText: { color: "#12365a", fontSize: 12, fontWeight: "900", letterSpacing: 0.7 },
  badgeTextCompact: { fontSize: 10.5 },
  badgeTextCompactNarrowPhone: { fontSize: 10 },
  badgeTextRsi: { color: "#075985" },
  metricsInline: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  metricsInlineCompressed: { gap: 5 },
  metricsInlineCompact: { gap: 4 },
  metricsInlineNarrowPhone: { gap: 3 },
  metricsInlineTinyPhone: { gap: 2 },
  metricInline: {
    minWidth: 82,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metricInlineCompressed: { minWidth: 72, paddingHorizontal: 10, paddingVertical: 6 },
  metricInlineCompact: { minWidth: 58, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 12 },
  metricInlineNarrowPhone: { minWidth: 50, paddingHorizontal: 6, paddingVertical: 4 },
  metricInlineTinyPhone: { minWidth: 46, paddingHorizontal: 5, paddingVertical: 3 },
  metricInlineValue: { color: "#ffffff", fontSize: 16, lineHeight: 20, fontWeight: "900" },
  metricInlineValueCompressed: { fontSize: 14, lineHeight: 18 },
  metricInlineValueCompact: { fontSize: 12, lineHeight: 15 },
  metricInlineValueNarrowPhone: { fontSize: 11, lineHeight: 14 },
  metricInlineValueTinyPhone: { fontSize: 10.5, lineHeight: 13 },
  metricInlineLabel: { marginTop: 1, color: "#bae6fd", fontSize: 10, lineHeight: 13, fontWeight: "700" },
  metricInlineLabelCompressed: { fontSize: 9, lineHeight: 12 },
  metricInlineLabelCompact: { fontSize: 8.5, lineHeight: 11 },
  metricInlineLabelNarrowPhone: { fontSize: 8, lineHeight: 10 },
  metricInlineLabelTinyPhone: { fontSize: 7.5, lineHeight: 9 },
  stepCard: {
    flexDirection: "row",
    minHeight: 88,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  stepCardCompressed: { minHeight: 70 },
  stepCardCompactMobile: { minHeight: 58, borderRadius: 15 },
  stepCardCompactTinyPhone: { minHeight: 52, borderRadius: 13 },
  stepCardRsi: { borderColor: "#bae6fd", backgroundColor: "#f0f9ff" },
  stepAccent: { width: 6, backgroundColor: "#0ea5e9" },
  stepCopy: { flex: 1, paddingHorizontal: 18, paddingVertical: 14 },
  stepCopyCompressed: { paddingVertical: 10 },
  stepCopyCompactMobile: { paddingHorizontal: 12, paddingVertical: 8 },
  stepLabel: {
    color: "#0369a1",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  stepLabelCompressed: { fontSize: 9, lineHeight: 12 },
  stepLabelCompactMobile: { fontSize: 8.5, lineHeight: 11 },
  stepLabelRsi: { color: "#0369a1" },
  stepTitle: {
    marginTop: 3,
    color: "#0f172a",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.25,
  },
  stepTitleCompressed: { fontSize: 17, lineHeight: 21 },
  stepTitleCompactMobile: { marginTop: 1, fontSize: 14, lineHeight: 17 },
  stepTitleCompactNarrowPhone: { fontSize: 13, lineHeight: 16 },
  stepTitleRsi: { color: "#082f49" },
  stepHint: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
});

const layoutStyles = StyleSheet.create({
  shell: { gap: 14 },
  body: { flexDirection: "row", gap: 14, alignItems: "stretch" },
  bodyCompact: { gap: 10 },
  bodyTinyPhone: { gap: 8 },
  sidebarCard: {
    width: 220,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: "#eaf3ff",
    borderWidth: 1,
    borderColor: "#cfe3fb",
    padding: 14,
    gap: 10,
  },
  sidebarCardCompact: { width: 156, padding: 10, gap: 7 },
  sidebarCardTinyPhone: { width: 132, padding: 8, gap: 6 },
  sidebarEyebrow: {
    color: "#1d4ed8",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sidebarTitle: {
    color: "#0f172a",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  sidebarList: { gap: 8 },
  sidebarListCompact: { gap: 6 },
  sidebarListTinyPhone: { gap: 5 },
  sideNavItem: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  sideNavItemCompact: {
    minHeight: 58,
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sideNavItemTinyPhone: { minHeight: 52, gap: 6, paddingHorizontal: 7, paddingVertical: 5 },
  sideNavItemAtivo: {
    backgroundColor: "#ffffff",
    borderColor: "#bfdbfe",
  },
  sideNavStep: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sideNavStepCompact: { width: 32, height: 32, borderRadius: 16 },
  sideNavStepTinyPhone: { width: 28, height: 28, borderRadius: 14 },
  sideNavStepText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  sideNavStepTextCompact: { fontSize: 10.5 },
  sideNavBody: { flex: 1, minWidth: 0 },
  sideNavBodyCompact: { flex: 1, minWidth: 0 },
  sideNavLabel: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  sideNavLabelCompact: { fontSize: 11, lineHeight: 14 },
  sideNavLabelTinyPhone: { fontSize: 10, lineHeight: 13 },
  sideNavLabelAtivo: { color: "#0f172a", fontWeight: "900" },
  sideNavHint: { marginTop: 2, color: "#64748b", fontSize: 10, lineHeight: 14 },
  contentCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    overflow: "hidden",
  },
  contentCardCompact: { borderRadius: 16 },
  contentCardTinyPhone: { borderRadius: 14 },
  contentCardRsi: { borderColor: "#bae6fd" },
  contentHeader: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fbff",
  },
  contentHeaderCompact: { minHeight: 72, paddingHorizontal: 13, paddingVertical: 10 },
  contentHeaderTinyPhone: { minHeight: 64, paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  contentHeaderRsi: { backgroundColor: "#f0f9ff", borderBottomColor: "#bae6fd" },
  contentTitleWrap: { flex: 1, minWidth: 0 },
  contentEyebrow: {
    color: "#2563eb",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  contentEyebrowRsi: { color: "#0284c7" },
  contentTitle: {
    marginTop: 3,
    color: "#0f172a",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
  },
  contentTitleCompact: { fontSize: 16, lineHeight: 20 },
  contentTitleNarrowPhone: { fontSize: 14, lineHeight: 18 },
  contentTitleTinyPhone: { fontSize: 13, lineHeight: 16 },
  contentTitleRsi: { color: "#082f49" },
  contentHint: { marginTop: 3, color: "#64748b", fontSize: 11, lineHeight: 15 },
  contentBadge: {
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contentBadgeText: { color: "#1d4ed8", fontSize: 10, fontWeight: "900" },
  contentScroll: { flex: 1 },
  contentScrollBody: { padding: 18, gap: 14 },
  footer: { marginTop: 2 },
});

const finishStyles = StyleSheet.create({
  wrapper: { gap: 14 },
  summaryCard: {
    borderRadius: 20,
    backgroundColor: "#0f2d45",
    borderWidth: 1,
    borderColor: "#1d4ed8",
    padding: 18,
    gap: 10,
  },
  summaryCardRsi: { backgroundColor: "#082f49", borderColor: "#38bdf8" },
  summaryTitle: { color: "#ffffff", fontSize: 20, lineHeight: 25, fontWeight: "900" },
  summaryTitleRsi: { color: "#f0f9ff" },
  destination: { color: "#bae6fd", fontSize: 13, lineHeight: 18, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    paddingTop: 9,
  },
  summaryLabel: { color: "#bae6fd", fontSize: 11, fontWeight: "700" },
  summaryValue: { flex: 1, color: "#ffffff", fontSize: 12, fontWeight: "900", textAlign: "right" },
  infoCard: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    padding: 16,
    gap: 8,
  },
  infoTitle: { color: "#0f172a", fontSize: 16, lineHeight: 21, fontWeight: "900" },
  infoLine: { color: "#334155", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  narrative: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});
