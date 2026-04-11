import { type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import {
  assertModuleGroupsCoverage,
  getModuleAreaLabel,
  MODULE_GRID_TWO_COL_MIN,
  MODULE_GROUPS,
} from "@/constants/module-area-labels";
import { ModuleGridCard } from "./module-grid-card";
import { getClinicalModules } from "../clinical-modules";
import { openClinicalModule } from "../lib/open-clinical-module";

const AppDesign = DS.AppDesign;

void MODULE_GROUPS;

const BOTTOM_PAD = 28;

export default function ModuleHub() {
  const modules = getClinicalModules();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const twoColumns = windowWidth >= MODULE_GRID_TWO_COL_MIN;

  useEffect(() => {
    assertModuleGroupsCoverage(modules.map((m) => m.id));
  }, [modules]);

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

          <View style={styles.grid} accessibilityRole="list">
            {modules.map((module) => (
              <ModuleGridCard
                key={module.id}
                areaLabel={getModuleAreaLabel(module.id)}
                title={module.title}
                description={module.description}
                twoColumns={twoColumns}
                onPress={() => {
                  void openClinicalModule(router, module.id, module.route as Href);
                }}
              />
            ))}
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
    fontSize: 14,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
