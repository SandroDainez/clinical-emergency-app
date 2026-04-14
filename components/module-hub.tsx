import { type Href, useRouter } from "expo-router";
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

const AREA_PALETTE: Record<string, {
  accent: string;
  soft: string;
  softBorder: string;
  badge: string;
  badgeText: string;
  iconBg: string;
}> = {
  ACLS: { accent: "#1d4ed8", soft: "#eff6ff", softBorder: "#bfdbfe", badge: "#dbeafe", badgeText: "#1e40af", iconBg: "#dbeafe" },
  Sepse: { accent: "#b45309", soft: "#fffbeb", softBorder: "#fde68a", badge: "#fef3c7", badgeText: "#92400e", iconBg: "#fde68a" },
  Vasoativos: { accent: "#b91c1c", soft: "#fff1f2", softBorder: "#fecdd3", badge: "#fecdd3", badgeText: "#9f1239", iconBg: "#fee2e2" },
  ISR: { accent: "#6d28d9", soft: "#faf5ff", softBorder: "#ddd6fe", badge: "#ede9fe", badgeText: "#5b21b6", iconBg: "#ede9fe" },
  EAP: { accent: "#0e7490", soft: "#f0fdfa", softBorder: "#99f6e4", badge: "#ccfbf1", badgeText: "#155e75", iconBg: "#ccfbf1" },
  "CAD / EHH": { accent: "#c2410c", soft: "#fff7ed", softBorder: "#fdba74", badge: "#fed7aa", badgeText: "#9a3412", iconBg: "#ffedd5" },
  VM: { accent: "#4338ca", soft: "#eef2ff", softBorder: "#c7d2fe", badge: "#c7d2fe", badgeText: "#3730a3", iconBg: "#e0e7ff" },
  Anafilaxia: { accent: "#be185d", soft: "#fdf2f8", softBorder: "#f9a8d4", badge: "#fbcfe8", badgeText: "#9d174d", iconBg: "#fce7f3" },
  Módulo: { accent: "#475569", soft: "#f8fafc", softBorder: "#e2e8f0", badge: "#e2e8f0", badgeText: "#334155", iconBg: "#f1f5f9" },
};

const MODULE_ICON: Record<string, string> = {
  "pcr-adulto": "♥",
  "sepse-adulto": "🦠",
  "drogas-vasoativas": "💊",
  "isr-rapida": "🫁",
  "edema-agudo-pulmao": "💧",
  "cetoacidose-hiperosmolar": "🧪",
  "ventilacao-mecanica": "💨",
  "anafilaxia": "⚡",
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
  const isMedium = width >= 680;
  const cardBasis = isWide ? "48.8%" : "100%";

  function openModule(moduleId: string, route: string) {
    void openClinicalModule(router, moduleId, route as Href);
  }

  function renderAclsFeature() {
    if (!featuredModule) return null;
    const palette = getPalette(MODULE_AREA_LABELS[featuredModule.id] ?? "ACLS");

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={featuredModule.title}
        onPress={() => openModule(featuredModule.id, featuredModule.route)}
        style={({ pressed }) => [
          styles.featureCard,
          { backgroundColor: palette.soft, borderColor: palette.softBorder },
          pressed && styles.featurePressed,
        ]}>
        <View style={styles.featureOrnamentWrap} pointerEvents="none">
          <View style={[styles.featureOrbLarge, { backgroundColor: `${palette.accent}16` }]} />
          <View style={[styles.featureOrbSmall, { backgroundColor: `${palette.accent}24` }]} />
        </View>

        <View style={styles.featureHeader}>
          <View style={styles.featureTitleBlock}>
            <View style={[styles.featureBadge, { backgroundColor: palette.badge }]}>
              <Text style={[styles.featureBadgeText, { color: palette.badgeText }]}>ACLS</Text>
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

        <View style={styles.featureMetrics}>
          <View style={styles.featureMetric}>
            <Text style={styles.featureMetricLabel}>Fluxo principal</Text>
            <Text style={styles.featureMetricValue}>PCR + pós-ROSC</Text>
          </View>
          <View style={styles.featureMetric}>
            <Text style={styles.featureMetricLabel}>Referências rápidas</Text>
            <Text style={styles.featureMetricValue}>{aclsSubIds.length} módulos embutidos</Text>
          </View>
          <View style={styles.featureMetric}>
            <Text style={styles.featureMetricLabel}>Uso</Text>
            <Text style={styles.featureMetricValue}>Loop operacional</Text>
          </View>
        </View>

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
                  style={({ pressed }) => [styles.subCard, pressed && styles.subCardPressed]}>
                  <View style={styles.subCardLeft}>
                    <View style={styles.subIconBox}>
                      <Text style={styles.subIconText}>{MODULE_ICON[subId] ?? "›"}</Text>
                    </View>
                    <Text style={styles.subCardTitle} numberOfLines={1}>{mod.title}</Text>
                  </View>
                  <Text style={styles.subCardArrow}>›</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Pressable>
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
          {
            backgroundColor: palette.soft,
            borderColor: palette.softBorder,
            width: cardBasis,
          },
          pressed && styles.moduleCardPressed,
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
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Central de módulos</Text>
              <Text style={styles.heroTitle}>Escolha o fluxo clínico sem cara de lista genérica.</Text>
              <Text style={styles.heroSub}>
                ACLS em destaque e os demais módulos distribuídos em uma grade mais equilibrada para web e desktop.
              </Text>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{primaryModules.length}</Text>
                <Text style={styles.heroStatLabel}>Protocolos</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>{aclsSubIds.length}</Text>
                <Text style={styles.heroStatLabel}>Atalhos ACLS</Text>
              </View>
            </View>
          </View>
        </View>

        {renderAclsFeature()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos assistenciais</Text>
          <Text style={styles.sectionSub}>
            {isMedium ? "Grade em blocos com mais respiro visual." : "Cards simplificados em coluna única."}
          </Text>
        </View>

        <View style={[styles.grid, !isMedium && styles.gridSingle]}>
          {regularModules.map((mod) => renderModuleCard(mod))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 18,
    paddingTop: 18,
    maxWidth: 1080,
    width: "100%",
    alignSelf: "center",
    gap: 16,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: "#e8f6ef",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    ...AppDesign.shadow.card,
  },
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroCopy: {
    flexGrow: 1,
    flexBasis: 420,
    gap: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#0f766e",
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    maxWidth: 640,
  },
  heroStats: {
    flexDirection: "row",
    gap: 10,
  },
  heroStatCard: {
    minWidth: 108,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#ffffffcc",
    borderWidth: 1,
    borderColor: "#dbeafe",
    alignItems: "center",
    gap: 2,
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1d4ed8",
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featureCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    gap: 18,
    ...AppDesign.shadow.card,
  },
  featurePressed: {
    opacity: 0.95,
  },
  featureOrnamentWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  featureOrbLarge: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    right: -40,
    top: -40,
  },
  featureOrbSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 999,
    right: 120,
    bottom: -40,
  },
  featureHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  featureTitleBlock: {
    flexGrow: 1,
    flexBasis: 360,
    gap: 8,
  },
  featureBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featureBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  featureTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.7,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    maxWidth: 700,
  },
  featureRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 92,
  },
  featureIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconText: {
    fontSize: 28,
    fontWeight: "900",
  },
  featureArrow: {
    fontSize: 28,
    fontWeight: "700",
  },
  featureMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureMetric: {
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#ffffffb8",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    gap: 4,
  },
  featureMetricLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featureMetricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  subSection: {
    gap: 10,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  subGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  subCard: {
    flexGrow: 1,
    flexBasis: 200,
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffffd9",
    borderWidth: 1,
    borderColor: "rgba(191,219,254,0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  subCardPressed: {
    opacity: 0.92,
  },
  subCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  subIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  subIconText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  subCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  subCardArrow: {
    fontSize: 16,
    fontWeight: "700",
    color: "#60a5fa",
  },
  sectionHeader: {
    gap: 4,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.4,
  },
  sectionSub: {
    fontSize: 13,
    color: "rgba(248,250,252,0.72)",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  gridSingle: {
    justifyContent: "flex-start",
  },
  moduleCard: {
    minHeight: 224,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    gap: 14,
    ...AppDesign.shadow.card,
  },
  moduleCardPressed: {
    transform: [{ scale: 0.995 }],
  },
  moduleTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  moduleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleIconText: {
    fontSize: 24,
    fontWeight: "900",
  },
  areaPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  areaPillText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  moduleBody: {
    gap: 8,
    flex: 1,
  },
  moduleTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.6,
  },
  moduleDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    fontWeight: "600",
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.18)",
    paddingTop: 12,
  },
  moduleFooterText: {
    fontSize: 14,
    fontWeight: "800",
  },
  moduleFooterArrow: {
    fontSize: 20,
    fontWeight: "700",
  },
});
