import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { assertModuleGroupsCoverage, MODULE_AREA_LABELS } from "@/constants/module-area-labels";
import { MODULE_GROUPS } from "@/constants/module-groups";
import { getClinicalModules } from "../clinical-modules";
import { clearAuthRole, getAuthRole } from "../lib/auth-session";
import { openClinicalModule } from "../lib/open-clinical-module";
import { isModuleFree } from "../lib/subscription";
import { useSubscription } from "../lib/subscription-context";
import { supabase } from "../lib/supabase";

const BOTTOM_PAD = 32;

const AREA_PALETTE: Record<string, {
  accent: string; iconBg: string; badgeBg: string; badgeText: string;
}> = {
  ACLS:        { accent: "#60a5fa", iconBg: "#1e3a5f", badgeBg: "#1e3a5f", badgeText: "#93c5fd" },
  Sepse:       { accent: "#fbbf24", iconBg: "#451a03", badgeBg: "#451a03", badgeText: "#fcd34d" },
  Vasoativos:  { accent: "#f87171", iconBg: "#450a0a", badgeBg: "#450a0a", badgeText: "#fca5a5" },
  ISR:         { accent: "#a78bfa", iconBg: "#2e1065", badgeBg: "#2e1065", badgeText: "#c4b5fd" },
  EAP:         { accent: "#22d3ee", iconBg: "#164e63", badgeBg: "#164e63", badgeText: "#67e8f9" },
  "CAD / EHH": { accent: "#fb923c", iconBg: "#431407", badgeBg: "#431407", badgeText: "#fdba74" },
  VM:          { accent: "#818cf8", iconBg: "#1e1b4b", badgeBg: "#1e1b4b", badgeText: "#a5b4fc" },
  Anafilaxia:  { accent: "#f472b6", iconBg: "#500724", badgeBg: "#500724", badgeText: "#f9a8d4" },
  Módulo:      { accent: "#94a3b8", iconBg: "#1e293b", badgeBg: "#1e293b", badgeText: "#64748b" },
};

const MODULE_ICON: Record<string, string> = {
  "pcr-adulto":               "♥",
  "sepse-adulto":             "🦠",
  "drogas-vasoativas":        "💊",
  "isr-rapida":               "🫁",
  "edema-agudo-pulmao":       "💧",
  "cetoacidose-hiperosmolar": "🧪",
  "ventilacao-mecanica":      "💨",
  "anafilaxia":               "⚡",
  "avc":                      "🧠",
  "correcoes-eletroliticas":  "⚗️",
  "sindromes-coronarianas":   "🫀",
  "ritmos-acls":              "〜",
  "farmacologia-acls":        "Rx",
  "bradicardia-acls":         "↓♡",
  "taquicardia-acls":         "↑♡",
  "causas-reversiveis-acls":  "HT",
  "pos-pcr-acls":             "✓",
};

function getPalette(areaLabel: string) {
  return AREA_PALETTE[areaLabel] ?? AREA_PALETTE["Módulo"];
}

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useSubscription();
  const role = getAuthRole();

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAuthRole();
    // On web a full reload is more reliable than router.replace inside a tabs stack
    if (typeof window !== "undefined") {
      window.location.replace("/");
    } else {
      router.replace("/");
    }
  }

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

  const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m]));
  const allSubIds = new Set(MODULE_GROUPS.flatMap((g) => g.subIds ?? []));
  const primaryModules = modules
    .filter((m) => !allSubIds.has(m.id))
    .sort((a, b) => {
      if (a.id === "pcr-adulto") return -1;
      if (b.id === "pcr-adulto") return 1;
      return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
    });

  const aclsGroup = MODULE_GROUPS.find((g) => g.subIds && g.subIds.length > 0);
  const aclsSubIds = aclsGroup?.subIds ?? [];

  function renderSubModules(parentId: string) {
    if (parentId !== "pcr-adulto" || aclsSubIds.length === 0) return null;
    return (
      <View style={s.subSection}>
        <View style={s.subDivider}>
          <View style={s.subDividerLine} />
          <Text style={s.subDividerLabel}>REFERÊNCIAS ACLS</Text>
          <View style={s.subDividerLine} />
        </View>
        <View style={s.subGrid}>
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
                style={({ pressed }) => [s.subCard, pressed && s.subCardPressed]}>
                <View style={s.subCardIconBox}>
                  <Text style={s.subCardIconText}>{icon}</Text>
                </View>
                <Text style={s.subCardTitle} numberOfLines={1}>{mod.title}</Text>
                <Text style={s.subCardArrow}>›</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderPcrHeroCard(mod: (typeof modules)[0]) {
    function handlePress() {
      void openClinicalModule(router, mod.id, mod.route as Href);
    }
    return (
      <View key={mod.id} style={s.heroWrapper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mod.title}
          onPress={handlePress}
          style={({ pressed }) => [s.heroCard, pressed && s.heroCardPressed]}>

          {/* Top row: badge + icon */}
          <View style={s.heroTopRow}>
            <View style={s.heroBadgeRow}>
              <View style={s.heroEyebrowBadge}>
                <Text style={s.heroEyebrowText}>★ PROTOCOLO PRINCIPAL</Text>
              </View>
              <View style={s.heroAclsBadge}>
                <Text style={s.heroAclsText}>AHA · ACLS 2024</Text>
              </View>
            </View>
            <View style={s.heroIconBox}>
              <Text style={s.heroIconText}>♥</Text>
            </View>
          </View>

          {/* Title + description */}
          <Text style={s.heroTitle}>{mod.title}</Text>
          <Text style={s.heroDesc}>{mod.description}</Text>

          {/* Sub-modules chips */}
          <View style={s.heroChips}>
            {aclsSubIds.slice(0, 4).map((subId) => {
              const sub = moduleMap[subId];
              if (!sub) return null;
              return (
                <View key={subId} style={s.heroChip}>
                  <Text style={s.heroChipText}>{MODULE_ICON[subId] ?? "·"} {sub.title}</Text>
                </View>
              );
            })}
            {aclsSubIds.length > 4 && (
              <View style={s.heroChip}>
                <Text style={s.heroChipText}>+{aclsSubIds.length - 4} mais</Text>
              </View>
            )}
          </View>

          {/* CTA */}
          <View style={s.heroCta}>
            <Text style={s.heroCtaText}>Iniciar protocolo ACLS →</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  function renderCard(mod: (typeof modules)[0]) {
    const areaLabel: string = MODULE_AREA_LABELS[mod.id] ?? "Módulo";
    const palette = getPalette(areaLabel);
    const icon = MODULE_ICON[mod.id] ?? "•";
    const isLocked = !isModuleFree(mod.id) && !isPremium;

    function handlePress() {
      if (isLocked) {
        router.push("/paywall");
      } else {
        void openClinicalModule(router, mod.id, mod.route as Href);
      }
    }

    return (
      <View key={mod.id} style={[s.cardWrapper, isLocked && s.cardWrapperLocked]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mod.title}
          onPress={handlePress}
          style={({ pressed }) => [
            s.card,
            { borderLeftColor: isLocked ? "#334155" : palette.accent },
            pressed && s.cardPressed,
            isLocked && s.cardLocked,
          ]}>
          <View style={[s.iconBox, { backgroundColor: isLocked ? "#1e293b" : palette.iconBg }]}>
            <Text style={[s.iconText, { color: isLocked ? "#475569" : palette.accent }]}>
              {isLocked ? "🔒" : icon}
            </Text>
          </View>
          <View style={s.cardBody}>
            {isLocked ? (
              <View style={s.proBadge}>
                <Text style={s.proBadgeText}>PRO</Text>
              </View>
            ) : (
              <View style={[s.badge, { backgroundColor: palette.badgeBg }]}>
                <Text style={[s.badgeText, { color: palette.badgeText }]}>{areaLabel}</Text>
              </View>
            )}
            <Text
              style={[s.cardTitle, isLocked && s.cardTitleLocked]}
              numberOfLines={1}>
              {mod.title}
            </Text>
            <Text style={[s.cardDesc, isLocked && s.cardDescLocked]} numberOfLines={2}>
              {mod.description}
            </Text>
          </View>
          <Text style={[s.cardArrow, { color: isLocked ? "#334155" : palette.accent }]}>
            {isLocked ? "›" : "›"}
          </Text>
        </Pressable>
        {renderSubModules(mod.id)}
      </View>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={s.header}>
          {/* account bar — logout + admin link */}
          <View style={s.accountBar}>
            {role === "admin" && (
              <Pressable
                style={({ pressed }) => [s.accountBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push("/admin-users")}>
                <Text style={s.accountBtnAdmin}>⚙ Admin</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [s.accountBtn, pressed && { opacity: 0.7 }]}
              onPress={() => void handleLogout()}>
              <Text style={s.accountBtnLogout}>Sair</Text>
            </Pressable>
          </View>

          <View style={s.headerTop}>
            <View style={s.appBadge}>
              <Text style={s.appBadgeText}>EMERGÊNCIA</Text>
            </View>
            {isPremium ? (
              <View style={s.proBadgeHeader}>
                <Text style={s.proBadgeHeaderText}>✓ PRO</Text>
              </View>
            ) : (
              <View style={s.guidelinesBadge}>
                <Text style={s.guidelinesText}>✓ Diretrizes atualizadas</Text>
              </View>
            )}
          </View>
          <Text style={s.headerTitle}>Protocolos clínicos</Text>
          <Text style={s.headerSub}>
            {primaryModules.length} módulos · baseado em evidências · AHA · ESC · ADA · WAO
          </Text>
          {!isPremium && (
            <Pressable
              style={({ pressed }) => [s.upgradeBar, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/paywall")}>
              <Text style={s.upgradeBarText}>
                🔒 7 módulos desbloqueados com o plano Pro — ver planos →
              </Text>
            </Pressable>
          )}
        </View>

        <View style={s.list}>
          {primaryModules.map((mod) =>
            mod.id === "pcr-adulto" ? renderPcrHeroCard(mod) : renderCard(mod)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0f1a" },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 14,
    paddingTop: 14,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },

  header: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    gap: 6,
  },
  accountBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  accountBtn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0a0f1a",
  },
  accountBtnAdmin: {
    fontSize: 12,
    fontWeight: "700",
    color: "#22d3ee",
  },
  accountBtnLogout: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  appBadge: {
    backgroundColor: "#0e7490",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  appBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#ffffff",
  },
  guidelinesBadge: {
    backgroundColor: "#052e16",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#166534",
  },
  guidelinesText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#4ade80",
    letterSpacing: 0.2,
  },
  proBadgeHeader: {
    backgroundColor: "#0d2a2d",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#0e7490",
  },
  proBadgeHeaderText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#22d3ee",
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    lineHeight: 17,
  },
  upgradeBar: {
    backgroundColor: "#0d2a2d",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0e7490",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  upgradeBarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#67e8f9",
    lineHeight: 17,
  },

  list: { gap: 8 },

  cardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardWrapperLocked: {
    borderColor: "#334155",
    shadowOpacity: 0.15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderLeftWidth: 4,
    backgroundColor: "#1e293b",
  },
  cardLocked: {
    backgroundColor: "#161d2e",
  },
  cardPressed: { backgroundColor: "#273448" },
  cardTitleLocked: { color: "#94a3b8" },
  cardDescLocked: { color: "#64748b" },

  proBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#431407",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: "#92400e",
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#fbbf24",
    textTransform: "uppercase",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: { fontSize: 17, fontWeight: "700", lineHeight: 21 },

  cardBody: { flex: 1, gap: 3 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#f1f5f9", letterSpacing: -0.3 },
  cardDesc: { fontSize: 13, fontWeight: "500", color: "#94a3b8", lineHeight: 19 },
  cardArrow: { fontSize: 22, fontWeight: "600", lineHeight: 24, flexShrink: 0 },

  subSection: {
    borderTopWidth: 1,
    borderTopColor: "#1e3a5f",
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 8,
    gap: 6,
  },
  subDivider: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  subDividerLine: { flex: 1, height: 1, backgroundColor: "#1e3a5f" },
  subDividerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#3b82f6",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  subGrid: { gap: 5 },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  subCardPressed: { backgroundColor: "#1e293b" },
  subCardIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#1e3a5f",
    alignItems: "center",
    justifyContent: "center",
  },
  subCardIconText: { fontSize: 11, fontWeight: "800", color: "#60a5fa" },
  subCardTitle: { flex: 1, fontSize: 13, fontWeight: "700", color: "#cbd5e1", letterSpacing: -0.1 },
  subCardArrow: { fontSize: 16, color: "#3b82f6", fontWeight: "700" },

  // ── PCR Hero Card ────────────────────────────────────────────
  heroWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  heroCard: {
    backgroundColor: "#0d1f3c",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#2563eb",
    gap: 12,
  },
  heroCardPressed: { backgroundColor: "#0f2548" },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroBadgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  heroEyebrowBadge: {
    backgroundColor: "#1d4ed8",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  heroEyebrowText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#bfdbfe",
    textTransform: "uppercase",
  },
  heroAclsBadge: {
    backgroundColor: "#0f172a",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#1e3a5f",
  },
  heroAclsText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#60a5fa",
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  heroIconText: { fontSize: 22 },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f1f5f9",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  heroDesc: {
    fontSize: 14,
    color: "#93c5fd",
    lineHeight: 20,
    fontWeight: "500",
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heroChip: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#1e3a5f",
  },
  heroChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#60a5fa",
  },
  heroCta: {
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 2,
  },
  heroCtaText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
});
