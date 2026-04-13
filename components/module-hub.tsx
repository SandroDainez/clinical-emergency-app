import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import { assertModuleGroupsCoverage, MODULE_AREA_LABELS } from "@/constants/module-area-labels";
import { MODULE_GROUPS } from "@/constants/module-groups";
import { getClinicalModules } from "../clinical-modules";
import { openClinicalModule } from "../lib/open-clinical-module";

const AppDesign = DS.AppDesign;
const BOTTOM_PAD = 32;

// ── Paleta por área ────────────────────────────────────────────────────────
const AREA_PALETTE: Record<string, {
  accent: string; bg: string; badge: string; badgeText: string; iconBg: string;
}> = {
  ACLS:        { accent: "#1d4ed8", bg: "#eff6ff", badge: "#dbeafe", badgeText: "#1e40af", iconBg: "#dbeafe" },
  Sepse:       { accent: "#b45309", bg: "#fffbeb", badge: "#fde68a", badgeText: "#92400e", iconBg: "#fef3c7" },
  Vasoativos:  { accent: "#b91c1c", bg: "#fff1f2", badge: "#fecdd3", badgeText: "#9f1239", iconBg: "#fee2e2" },
  ISR:         { accent: "#6d28d9", bg: "#faf5ff", badge: "#ede9fe", badgeText: "#4c1d95", iconBg: "#ede9fe" },
  EAP:         { accent: "#0e7490", bg: "#f0fdfa", badge: "#ccfbf1", badgeText: "#134e4a", iconBg: "#ccfbf1" },
  "CAD / EHH": { accent: "#c2410c", bg: "#fff7ed", badge: "#fed7aa", badgeText: "#7c2d12", iconBg: "#ffedd5" },
  VM:          { accent: "#4338ca", bg: "#eef2ff", badge: "#c7d2fe", badgeText: "#312e81", iconBg: "#e0e7ff" },
  Anafilaxia:  { accent: "#be185d", bg: "#fdf2f8", badge: "#fbcfe8", badgeText: "#831843", iconBg: "#fce7f3" },
  Módulo:      { accent: "#475569", bg: "#f8fafc", badge: "#e2e8f0", badgeText: "#1e293b", iconBg: "#f1f5f9" },
};

// ── Ícone por módulo ───────────────────────────────────────────────────────
const MODULE_ICON: Record<string, string> = {
  "pcr-adulto":            "♥",
  "sepse-adulto":          "🦠",
  "drogas-vasoativas":     "💊",
  "isr-rapida":            "🫁",
  "edema-agudo-pulmao":    "💧",
  "cetoacidose-hiperosmolar": "🧪",
  "ventilacao-mecanica":   "💨",
  "anafilaxia":            "⚡",
  "ritmos-acls":           "〜",
  "farmacologia-acls":     "Rx",
  "bradicardia-acls":      "↓♡",
  "taquicardia-acls":      "↑♡",
  "causas-reversiveis-acls": "HT",
  "pos-pcr-acls":          "✓",
};

function getPalette(areaLabel: string) {
  return AREA_PALETTE[areaLabel] ?? AREA_PALETTE["Módulo"];
}

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

  const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m]));

  // IDs que são sub-módulos ACLS (não aparecem como cards individuais)
  const allSubIds = new Set(MODULE_GROUPS.flatMap((g) => g.subIds ?? []));

  // Módulos primários — ordenados alfabeticamente (sem sub-módulos)
  const primaryModules = modules
    .filter((m) => !allSubIds.has(m.id))
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }));

  // Sub-módulos ACLS
  const aclsGroup = MODULE_GROUPS.find((g) => g.subIds && g.subIds.length > 0);
  const aclsSubIds = aclsGroup?.subIds ?? [];

  function renderSubModules(parentId: string) {
    if (parentId !== "pcr-adulto" || aclsSubIds.length === 0) return null;
    return (
      <View style={styles.subSection}>
        <View style={styles.subDivider}>
          <View style={styles.subDividerLine} />
          <Text style={styles.subDividerLabel}>REFERÊNCIAS ACLS</Text>
          <View style={styles.subDividerLine} />
        </View>
        <View style={styles.subGrid}>
          {aclsSubIds.map((subId) => {
            const mod = moduleMap[subId];
            if (!mod) return null;
            const icon = MODULE_ICON[subId] ?? "›";
            return (
              <Pressable
                key={subId}
                accessibilityRole="button"
                accessibilityLabel={mod.title}
                onPress={() => void openClinicalModule(router, mod.id, mod.route as Href)}
                style={({ pressed }) => [styles.subCard, pressed && styles.subCardPressed]}>
                <View style={styles.subCardIconBox}>
                  <Text style={styles.subCardIconText}>{icon}</Text>
                </View>
                <Text style={styles.subCardTitle} numberOfLines={1}>{mod.title}</Text>
                <Text style={styles.subCardArrow}>›</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderCard(mod: (typeof modules)[0]) {
    const areaLabel: string = MODULE_AREA_LABELS[mod.id] ?? "Módulo";
    const palette = getPalette(areaLabel);
    const icon = MODULE_ICON[mod.id] ?? "•";
    const isAcls = mod.id === "pcr-adulto";

    return (
      <View
        key={mod.id}
        style={[styles.cardWrapper, isAcls && { borderColor: palette.accent + "40" }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mod.title}
          onPress={() => void openClinicalModule(router, mod.id, mod.route as Href)}
          style={({ pressed }) => [
            styles.card,
            { borderLeftColor: palette.accent },
            pressed && styles.cardPressed,
          ]}>
          {/* Ícone */}
          <View style={[styles.iconBox, { backgroundColor: palette.iconBg }]}>
            <Text style={[styles.iconText, { color: palette.accent }]}>{icon}</Text>
          </View>

          {/* Corpo */}
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <View style={[styles.badge, { backgroundColor: palette.badge }]}>
                <Text style={[styles.badgeText, { color: palette.badgeText }]}>{areaLabel}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{mod.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{mod.description}</Text>
          </View>

          {/* Seta */}
          <Text style={[styles.cardArrow, { color: palette.accent }]}>›</Text>
        </Pressable>

        {/* Sub-módulos embutidos (apenas PCR Adulto) */}
        {renderSubModules(mod.id)}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* ── Cabeçalho ─────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Módulos assistenciais</Text>
          <Text style={styles.headerSub}>{primaryModules.length} protocolos · toque para abrir</Text>
        </View>

        {/* ── Cards ─────────────────────────────────────── */}
        <View style={styles.list}>
          {primaryModules.map((mod) => renderCard(mod))}
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
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 14,
    paddingTop: 14,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },

  // ── Cabeçalho ────────────────────────────────────────────
  header: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    gap: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: "600",
    color: AppDesign.text.secondary,
  },

  // ── Lista ────────────────────────────────────────────────
  list: { gap: 8 },

  // ── Wrapper (permite bordas extras no card ACLS) ─────────
  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8eef4",
    shadowColor: "#0f172a",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // ── Card ─────────────────────────────────────────────────
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderLeftWidth: 4,
    backgroundColor: "#fff",
  },
  cardPressed: {
    backgroundColor: "#f8fafc",
  },

  // Ícone circular
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },

  // Corpo
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    lineHeight: 17,
  },
  cardArrow: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 24,
    flexShrink: 0,
  },

  // ── Sub-módulos ACLS ─────────────────────────────────────
  subSection: {
    borderTopWidth: 1,
    borderTopColor: "#e0f2fe",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
    gap: 6,
  },
  subDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  subDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#bae6fd",
  },
  subDividerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  subGrid: {
    gap: 5,
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  subCardPressed: {
    backgroundColor: "#e0f2fe",
  },
  subCardIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  subCardIconText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  subCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0c4a6e",
    letterSpacing: -0.1,
  },
  subCardArrow: {
    fontSize: 16,
    color: "#7dd3fc",
    fontWeight: "700",
  },
});
