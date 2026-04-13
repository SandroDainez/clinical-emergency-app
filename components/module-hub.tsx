import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import { assertModuleGroupsCoverage } from "@/constants/module-area-labels";
import { getClinicalModules } from "../clinical-modules";
import { openClinicalModule } from "../lib/open-clinical-module";

const AppDesign = DS.AppDesign;
const BOTTOM_PAD = 28;

/** Cor de acento por área — faixa lateral e badge */
const AREA_COLORS: Record<string, { accent: string; bg: string; badge: string; text: string }> = {
  ACLS:       { accent: "#0369a1", bg: "#f0f9ff", badge: "#dbeafe", text: "#1e40af" },
  Sepse:      { accent: "#b45309", bg: "#fffbeb", badge: "#fde68a", text: "#92400e" },
  Vasoativos: { accent: "#b91c1c", bg: "#fff1f2", badge: "#fecdd3", text: "#9f1239" },
  ISR:        { accent: "#6d28d9", bg: "#faf5ff", badge: "#ede9fe", text: "#4c1d95" },
  EAP:        { accent: "#0e7490", bg: "#f0fdfa", badge: "#ccfbf1", text: "#134e4a" },
  "CAD / EHH": { accent: "#c2410c", bg: "#fff7ed", badge: "#fed7aa", text: "#7c2d12" },
  VM:         { accent: "#4338ca", bg: "#eef2ff", badge: "#c7d2fe", text: "#312e81" },
  Anafilaxia: { accent: "#be185d", bg: "#fdf2f8", badge: "#fbcfe8", text: "#831843" },
  Módulo:     { accent: "#475569", bg: "#f8fafc", badge: "#e2e8f0", text: "#1e293b" },
};

function getAreaColors(label: string) {
  return AREA_COLORS[label] ?? AREA_COLORS["Módulo"];
}

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

  // Sort all modules alphabetically by title
  const sorted = [...modules].sort((a, b) =>
    a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" })
  );

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
          <Text style={styles.headerSub}>
            {sorted.length} protocolos · toque para abrir
          </Text>
        </View>

        {/* ── Lista de módulos ───────────────────────────── */}
        <View style={styles.list}>
          {sorted.map((mod, index) => {
            // Derive the area label from the area labels map
            const { MODULE_AREA_LABELS } = require("@/constants/module-area-labels");
            const areaLabel: string = MODULE_AREA_LABELS[mod.id] ?? "Módulo";
            const colors = getAreaColors(areaLabel);

            return (
              <Pressable
                key={mod.id}
                accessibilityRole="button"
                accessibilityLabel={mod.title}
                onPress={() => void openClinicalModule(router, mod.id, mod.route as Href)}
                style={({ pressed }) => [
                  styles.card,
                  { borderLeftColor: colors.accent },
                  pressed && [styles.cardPressed, { backgroundColor: colors.bg }],
                ]}>

                {/* Faixa de acento esquerda já via borderLeft */}
                <View style={styles.cardInner}>
                  {/* Badge de área */}
                  <View style={[styles.badge, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>{areaLabel}</Text>
                  </View>

                  {/* Conteúdo */}
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {mod.title}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {mod.description}
                    </Text>
                  </View>

                  {/* Seta */}
                  <Text style={[styles.cardArrow, { color: colors.accent }]}>›</Text>
                </View>
              </Pressable>
            );
          })}
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
    paddingHorizontal: 16,
    paddingTop: 14,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },

  // ── Cabeçalho ───────────────────────────────────────────
  header: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
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

  // ── Lista ───────────────────────────────────────────────
  list: {
    gap: 7,
  },

  // ── Card ────────────────────────────────────────────────
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8eef4",
    borderLeftWidth: 4,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: {
    borderColor: "#cbd5e1",
    shadowOpacity: 0.03,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
    minWidth: 44,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  cardBody: {
    flex: 1,
    gap: 3,
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
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
});
