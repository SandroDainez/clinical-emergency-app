import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import {
  assertModuleGroupsCoverage,
  getModuleAreaLabel,
  MODULE_GRID_TWO_COL_MIN,
  MODULE_GROUPS,
} from "@/constants/module-area-labels";
import { getClinicalModules } from "../clinical-modules";
import { openClinicalModule } from "../lib/open-clinical-module";
import { ModuleGridCard } from "./module-grid-card";

const AppDesign = DS.AppDesign;
const BOTTOM_PAD = 28;

/** Ícones simples em texto para os sub-módulos ACLS */
const SUB_MODULE_ICONS: Record<string, string> = {
  "ritmos-acls": "〜",
  "farmacologia-acls": "Rx",
  "bradicardia-acls": "↓",
  "taquicardia-acls": "↑",
  "causas-reversiveis-acls": "HT",
  "pos-pcr-acls": "✓",
};

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const twoColumns = windowWidth >= MODULE_GRID_TWO_COL_MIN;

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

  const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m]));

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: BOTTOM_PAD + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.shellMint}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Módulos assistenciais</Text>
            <Text style={styles.pageSubtitle} numberOfLines={2}>
              Toque num cartão para abrir o fluxo diretamente.
            </Text>
          </View>

          <View style={styles.groupsContainer}>
            {MODULE_GROUPS.map((group) => {
              const subIdSet = new Set(group.subIds ?? []);
              const primaryIds = group.ids.filter((id) => !subIdSet.has(id));
              const subIds = group.subIds ?? [];

              return (
                <View key={group.title} style={styles.groupSection}>
                  {/* Cabeçalho do grupo */}
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
                  </View>

                  {/* Cards principais */}
                  <View style={[styles.primaryGrid, twoColumns && styles.primaryGridTwo]}>
                    {primaryIds.map((id) => {
                      const mod = moduleMap[id];
                      if (!mod) return null;
                      return (
                        <ModuleGridCard
                          key={id}
                          areaLabel={getModuleAreaLabel(id)}
                          title={mod.title}
                          description={mod.description}
                          twoColumns={twoColumns && primaryIds.length > 1}
                          onPress={() => {
                            void openClinicalModule(router, mod.id, mod.route as Href);
                          }}
                        />
                      );
                    })}
                  </View>

                  {/* Sub-módulos de referência */}
                  {subIds.length > 0 && (
                    <View style={styles.subSection}>
                      <View style={styles.subSectionHeader}>
                        <View style={styles.subSectionLine} />
                        <Text style={styles.subSectionLabel}>Referências</Text>
                        <View style={styles.subSectionLine} />
                      </View>
                      <View style={styles.subGrid}>
                        {subIds.map((id) => {
                          const mod = moduleMap[id];
                          if (!mod) return null;
                          const icon = SUB_MODULE_ICONS[id] ?? "›";
                          return (
                            <Pressable
                              key={id}
                              accessibilityRole="button"
                              accessibilityLabel={mod.title}
                              onPress={() => {
                                void openClinicalModule(router, mod.id, mod.route as Href);
                              }}
                              style={({ pressed }) => [styles.subCard, pressed && styles.subCardPressed]}>
                              <View style={styles.subCardIcon}>
                                <Text style={styles.subCardIconText}>{icon}</Text>
                              </View>
                              <View style={styles.subCardBody}>
                                <Text style={styles.subCardTitle} numberOfLines={1}>
                                  {mod.title}
                                </Text>
                                <Text style={styles.subCardDesc} numberOfLines={1}>
                                  {mod.description}
                                </Text>
                              </View>
                              <Text style={styles.subCardArrow}>›</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
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
    paddingTop: 10,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },
  shellMint: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 28,
    padding: 16,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  pageHeader: {
    gap: 6,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: AppDesign.text.secondary,
    fontWeight: "700",
  },

  // ── Grupos ────────────────────────────────────────────
  groupsContainer: {
    gap: 20,
  },
  groupSection: {
    gap: 10,
  },
  groupHeader: {
    gap: 2,
    paddingHorizontal: 2,
    paddingBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: AppDesign.accent.lime,
    paddingLeft: 10,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  groupSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: AppDesign.text.secondary,
  },
  primaryGrid: {
    gap: 12,
  },
  primaryGridTwo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // ── Sub-módulos ───────────────────────────────────────
  subSection: {
    gap: 8,
    marginTop: 2,
  },
  subSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subSectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  subSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subGrid: {
    gap: 6,
  },
  subCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  subCardPressed: {
    backgroundColor: "#f0f9ff",
    borderColor: "#7dd3fc",
  },
  subCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    alignItems: "center",
    justifyContent: "center",
  },
  subCardIconText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0369a1",
  },
  subCardBody: {
    flex: 1,
    gap: 2,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0c4a6e",
    letterSpacing: -0.1,
  },
  subCardDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: "#0369a1",
  },
  subCardArrow: {
    fontSize: 16,
    color: "#bae6fd",
    fontWeight: "700",
  },
});
