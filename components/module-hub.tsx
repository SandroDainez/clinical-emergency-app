import { Link, type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import { assertModuleGroupsCoverage, MODULE_AREA_LABELS } from "@/constants/module-area-labels";
import { MODULE_GROUPS } from "@/constants/module-groups";
import { getClinicalModules } from "../clinical-modules";
import { openClinicalModule } from "../lib/open-clinical-module";

const AppDesign = DS.AppDesign;
const BOTTOM_PAD = 32;
const Hybrid = {
  bg: "#050505",
  panel: "rgba(13,16,24,0.84)",
  panelSoft: "rgba(255,255,255,0.05)",
  border: "rgba(124,145,255,0.18)",
  borderStrong: "rgba(123,176,255,0.34)",
  text: "#f5f7fb",
  muted: "#91a0b5",
  softText: "#c8d2e1",
  accent: "#95bbff",
  glowA: "rgba(92,141,255,0.2)",
  glowB: "rgba(0,204,255,0.1)",
};

const AREA_PALETTE: Record<
  string,
  {
    accent: string;
    soft: string;
    border: string;
    badge: string;
    badgeText: string;
    iconBg: string;
  }
> = {
  ACLS: { accent: "#3b82f6", soft: "#e9f2ff", border: "#a9c8ff", badge: "#dbeafe", badgeText: "#1e40af", iconBg: "#dceaff" },
  Sepse: { accent: "#d97706", soft: "#fff3dd", border: "#f7c77a", badge: "#ffefbf", badgeText: "#9a5a04", iconBg: "#ffe7b2" },
  Vasoativos: { accent: "#ef4444", soft: "#ffe7e8", border: "#f3aaaa", badge: "#ffd2d5", badgeText: "#9f1239", iconBg: "#ffd8db" },
  Eletrólitos: { accent: "#0f766e", soft: "#ddfbf7", border: "#7ce7db", badge: "#c9faf3", badgeText: "#115e59", iconBg: "#d5f9f3" },
  ISR: { accent: "#8b5cf6", soft: "#f2ebff", border: "#cfbdfd", badge: "#e8ddff", badgeText: "#5b21b6", iconBg: "#ebdfff" },
  EAP: { accent: "#0ea5a4", soft: "#e0fbf8", border: "#8fe7dd", badge: "#c8f7f0", badgeText: "#115e59", iconBg: "#cbf4ee" },
  "CAD / EHH": { accent: "#f97316", soft: "#fff0e6", border: "#fdba74", badge: "#ffe0c7", badgeText: "#9a3412", iconBg: "#ffe6d4" },
  VM: { accent: "#4f46e5", soft: "#ecedff", border: "#b8bcff", badge: "#d9dbff", badgeText: "#3730a3", iconBg: "#e3e6ff" },
  Anafilaxia: { accent: "#db2777", soft: "#ffebf5", border: "#f6a8cb", badge: "#ffd3e7", badgeText: "#9d174d", iconBg: "#ffe0ef" },
  Módulo: { accent: "#5b6b73", soft: "#edf2ef", border: "#c4d5cd", badge: "#dbe9e2", badgeText: "#334155", iconBg: "#e7efeb" },
};

const MODULE_ICON: Record<string, string> = {
  "pcr-adulto": "♥",
  "sepse-adulto": "🦠",
  "drogas-vasoativas": "💊",
  "correcoes-eletroliticas": "🧂",
  "isr-rapida": "🫁",
  "edema-agudo-pulmao": "💧",
  "cetoacidose-hiperosmolar": "🧪",
  "ventilacao-mecanica": "💨",
  anafilaxia: "⚡",
  "ritmos-acls": "〜",
  "farmacologia-acls": "Rx",
  "bradicardia-acls": "↓",
  "taquicardia-acls": "↑",
  "causas-reversiveis-acls": "HT",
  "pos-pcr-acls": "✓",
};

function getPalette(areaLabel: string) {
  return AREA_PALETTE[areaLabel] ?? AREA_PALETTE["Módulo"];
}

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

  const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m]));
  const allSubIds = new Set(MODULE_GROUPS.flatMap((g) => g.subIds ?? []));
  const primaryModules = modules
    .filter((m) => !allSubIds.has(m.id))
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }));

  const aclsGroup = MODULE_GROUPS.find((g) => g.subIds && g.subIds.length > 0);
  const aclsSubIds = aclsGroup?.subIds ?? [];
  const featuredModule = primaryModules.find((mod) => mod.id === "pcr-adulto");
  const regularModules = primaryModules.filter((mod) => mod.id !== "pcr-adulto");
  const isWide = width >= 920;
  const isMedium = width >= 700;
  const isCompact = width < 560;
  const useDualColumn = width >= 360;
  const cardBasis = isWide || useDualColumn ? "48.5%" : "100%";

  function openModule(moduleId: string, route: string) {
    void openClinicalModule(router, moduleId, route as Href);
  }

  function renderAclsFeature() {
    if (!featuredModule) return null;
    const palette = getPalette(MODULE_AREA_LABELS[featuredModule.id] ?? "ACLS");

    return (
      <View
        style={[
          styles.featureCard,
          { backgroundColor: Hybrid.panel, borderColor: Hybrid.border },
        ]}>
        <View style={[styles.featureGlowLarge, { backgroundColor: `${palette.accent}12` }]} pointerEvents="none" />
        <View style={[styles.featureGlowSmall, { backgroundColor: `${palette.accent}18` }]} pointerEvents="none" />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={featuredModule.title}
          onPress={() => openModule(featuredModule.id, featuredModule.route)}
          style={({ pressed }) => [styles.featureMainAction, pressed && styles.cardPressed]}>
          <View style={styles.featureHeader}>
            <View style={styles.featureTitleBlock}>
              <View style={[styles.featureBadge, { backgroundColor: palette.badge }]}>
                <Text style={[styles.featureBadgeText, { color: palette.badgeText }]}>Fluxo em Destaque</Text>
              </View>
              <Text style={styles.featureTitle}>{featuredModule.title}</Text>
              <Text style={styles.featureDescription}>{featuredModule.description}</Text>
            </View>

            <View style={styles.featureRight}>
              <View style={[styles.featureIconWrap, { backgroundColor: palette.iconBg }]}>
                <Text style={[styles.featureIconText, { color: palette.accent }]}>
                  {MODULE_ICON[featuredModule.id] ?? "•"}
                </Text>
              </View>
              <Text style={[styles.featureArrow, { color: palette.accent }]}>›</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Fluxo principal</Text>
              <Text style={styles.metricValue}>PCR + pós-ROSC</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Apoio rápido</Text>
              <Text style={styles.metricValue}>{aclsSubIds.length} atalhos ACLS</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Uso típico</Text>
              <Text style={styles.metricValue}>Loop operacional</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Referências ACLS</Text>
          <View style={styles.subGrid}>
            {aclsSubIds.map((subId) => {
              const mod = moduleMap[subId];
              if (!mod) return null;

              return (
                <Pressable
                  key={subId}
                  accessibilityRole="button"
                  accessibilityLabel={mod.title}
                  onPress={() => openModule(mod.id, mod.route)}
                  style={({ pressed }) => [styles.subCard, pressed && styles.cardPressed]}>
                  <View style={styles.subCardLeft}>
                    <View style={styles.subIconBox}>
                      <Text style={styles.subIconText}>{MODULE_ICON[subId] ?? "›"}</Text>
                    </View>
                    <Text style={styles.subCardTitle} numberOfLines={1}>
                      {mod.title}
                    </Text>
                  </View>
                  <Text style={styles.subCardArrow}>›</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  function renderModuleCard(mod: (typeof modules)[0]) {
    const areaLabel = MODULE_AREA_LABELS[mod.id] ?? "Módulo";
    const palette = getPalette(areaLabel);
    const icon = MODULE_ICON[mod.id] ?? "•";

    return (
      <Pressable
        key={mod.id}
        accessibilityRole="button"
        accessibilityLabel={mod.title}
        onPress={() => openModule(mod.id, mod.route)}
        style={({ pressed }) => [
          styles.moduleCard,
          { width: cardBasis, backgroundColor: Hybrid.panelSoft, borderColor: Hybrid.border },
          pressed && styles.cardPressed,
        ]}>
        <View style={styles.moduleTopRow}>
          <View style={[styles.moduleIconBox, { backgroundColor: palette.iconBg }]}>
            <Text style={[styles.moduleIconText, { color: palette.accent }]}>{icon}</Text>
          </View>
          <View style={[styles.areaPill, { backgroundColor: palette.badge }]}>
            <Text style={[styles.areaPillText, { color: palette.badgeText }]}>{areaLabel}</Text>
          </View>
        </View>

        <View style={styles.moduleBody}>
          <Text style={styles.moduleTitle}>{mod.title}</Text>
          <Text style={styles.moduleDesc}>{mod.description}</Text>
        </View>

        <View style={styles.moduleFooter}>
          <Text style={[styles.moduleFooterText, { color: palette.accent }]}>Abrir módulo</Text>
          <Text style={[styles.moduleFooterArrow, { color: palette.accent }]}>›</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroTopline}>
            <View style={styles.heroToplineLeft}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Central de módulos</Text>
              </View>
              <Link href="/" replace asChild>
                <Pressable style={({ pressed }) => [styles.homePill, pressed && styles.cardPressed]}>
                  <Text style={styles.homePillText}>Apresentação</Text>
                </Pressable>
              </Link>
            </View>
            <Text style={[styles.heroMeta, isCompact && styles.heroMetaCompact]}>
              Navegação clínica em bloco, não em lista genérica
            </Text>
          </View>

          <View style={[styles.heroRow, isCompact && styles.heroRowCompact]}>
            <View style={[styles.heroCopy, isCompact && styles.heroCopyCompact]}>
              <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>
                Escolha o fluxo clínico num ambiente com mais densidade visual e mais valor percebido.
              </Text>
              <Text style={[styles.heroSub, isCompact && styles.heroSubCompact]}>
                ACLS fica em evidência, os demais módulos entram em uma grade com ritmo melhor e cada área ganha mais
                identidade sem virar carnaval visual.
              </Text>
            </View>

            <View style={[styles.heroStats, isCompact && styles.heroStatsCompact]}>
              <View style={[styles.heroStatCard, isCompact && styles.heroStatCardCompact]}>
                <Text style={styles.heroStatValue}>{primaryModules.length}</Text>
                <Text style={styles.heroStatLabel}>protocolos</Text>
              </View>
              <View style={[styles.heroStatCard, isCompact && styles.heroStatCardCompact]}>
                <Text style={styles.heroStatValue}>{aclsSubIds.length}</Text>
                <Text style={styles.heroStatLabel}>atalhos ACLS</Text>
              </View>
            </View>
          </View>
        </View>

        {renderAclsFeature()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos assistenciais</Text>
          <Text style={styles.sectionSub}>
            {isMedium
              ? "Grade viva com cards mais fortes e mais respiro."
              : useDualColumn
                ? "Cards menores em duas colunas para acelerar a leitura no celular."
                : "Coluna única com hierarquia preservada."}
          </Text>
        </View>

        <View style={[styles.grid, (!isMedium && !useDualColumn) && styles.gridSingle]}>{regularModules.map((mod) => renderModuleCard(mod))}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Hybrid.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 18,
    maxWidth: 1180,
    width: "100%",
    alignSelf: "center",
    gap: 18,
  },
  hero: {
    backgroundColor: Hybrid.panel,
    borderRadius: 38,
    padding: 24,
    borderWidth: 1,
    borderColor: Hybrid.border,
    gap: 14,
    ...AppDesign.shadow.hero,
  },
  heroTopline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  heroToplineLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  heroBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(149,187,255,0.12)",
    borderWidth: 1,
    borderColor: Hybrid.borderStrong,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: Hybrid.accent,
  },
  homePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Hybrid.panelSoft,
    borderWidth: 1,
    borderColor: Hybrid.border,
  },
  homePillText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: Hybrid.text,
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: Hybrid.muted,
  },
  heroMetaCompact: {
    width: "100%",
  },
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroRowCompact: {
    flexDirection: "column",
  },
  heroCopy: {
    flexGrow: 1,
    flexBasis: 480,
    gap: 8,
    minWidth: 0,
  },
  heroCopyCompact: {
    flexBasis: "auto",
    width: "100%",
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -1,
  },
  heroTitleCompact: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 15,
    lineHeight: 23,
    color: Hybrid.softText,
    maxWidth: 700,
    fontWeight: "600",
  },
  heroSubCompact: {
    fontSize: 14,
    lineHeight: 21,
  },
  heroStats: {
    flexDirection: "row",
    gap: 10,
    flexShrink: 0,
  },
  heroStatsCompact: {
    width: "100%",
  },
  heroStatCard: {
    minWidth: 120,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Hybrid.panelSoft,
    borderWidth: 1,
    borderColor: Hybrid.border,
  },
  heroStatCardCompact: {
    flex: 1,
    minWidth: 0,
  },
  heroStatValue: {
    fontSize: 28,
    fontWeight: "900",
    color: Hybrid.text,
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Hybrid.muted,
  },
  featureCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    ...AppDesign.shadow.hero,
  },
  featureMainAction: {
    gap: 14,
  },
  featureGlowLarge: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 999,
  },
  featureGlowSmall: {
    position: "absolute",
    left: -30,
    bottom: -80,
    width: 180,
    height: 180,
    borderRadius: 999,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  featureTitleBlock: {
    flex: 1,
    gap: 8,
  },
  featureBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  featureTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.9,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: Hybrid.softText,
    fontWeight: "600",
  },
  featureRight: {
    alignItems: "center",
    gap: 8,
  },
  featureIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconText: {
    fontSize: 30,
    fontWeight: "900",
  },
  featureArrow: {
    fontSize: 34,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: 120,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: Hybrid.border,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: Hybrid.muted,
  },
  metricValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "900",
    color: Hybrid.text,
  },
  subSection: {
    gap: 12,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Hybrid.text,
  },
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  subCard: {
    flexBasis: 160,
    flexGrow: 1,
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Hybrid.panelSoft,
    borderWidth: 1,
    borderColor: Hybrid.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  subIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(149,187,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  subIconText: {
    fontSize: 16,
    fontWeight: "900",
    color: Hybrid.accent,
  },
  subCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: Hybrid.text,
  },
  subCardArrow: {
    fontSize: 20,
    color: Hybrid.softText,
    marginLeft: 8,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.6,
  },
  sectionSub: {
    fontSize: 13,
    color: Hybrid.muted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridSingle: {
    flexDirection: "column",
  },
  moduleCard: {
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    minHeight: 176,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    ...AppDesign.shadow.card,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ translateY: 1 }, { scale: 0.992 }],
  },
  moduleTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  moduleIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleIconText: {
    fontSize: 22,
    fontWeight: "900",
  },
  areaPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  areaPillText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  moduleBody: {
    gap: 8,
    marginTop: 14,
    minWidth: 0,
  },
  moduleTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    color: Hybrid.text,
    letterSpacing: -0.6,
  },
  moduleDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Hybrid.softText,
    fontWeight: "600",
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Hybrid.border,
  },
  moduleFooterText: {
    fontSize: 14,
    fontWeight: "900",
  },
  moduleFooterArrow: {
    fontSize: 24,
    fontWeight: "700",
  },
});
