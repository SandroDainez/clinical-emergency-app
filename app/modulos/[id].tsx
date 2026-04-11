import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import ClinicalApp from "../../components/clinical-app";
import { ModuleBackToHubLink } from "../../components/module-back-to-hub";
import { getClinicalModuleById } from "../../clinical-modules";
import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";

const AppDesign = DS.AppDesign;

export default function ClinicalModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const clinicalModule = moduleId ? getClinicalModuleById(moduleId) : undefined;

  if (!clinicalModule) {
    return <Redirect href="/" />;
  }

  function goToModulesHub() {
    router.replace(MODULES_HUB_HREF);
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.chrome}>
        <ModuleBackToHubLink onPress={goToModulesHub} />
        <Text style={styles.chromeTitle} numberOfLines={1}>
          {clinicalModule.title}
        </Text>
      </View>
      <View style={styles.appBody}>
        <ClinicalApp engine={clinicalModule.engine} onRouteBack={goToModulesHub} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  chrome: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.22)",
  },
  chromeTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: AppDesign.text.onDark,
    letterSpacing: -0.35,
  },
  appBody: {
    flex: 1,
  },
});
