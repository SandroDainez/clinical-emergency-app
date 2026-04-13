import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as DS from "@/constants/app-design";
import ClinicalApp from "../../components/clinical-app";
import { ModuleBackToHubLink } from "../../components/module-back-to-hub";
import { getClinicalModuleById } from "../../clinical-modules";
import { consumeAirwayReturnHandoff } from "../../lib/module-return-handoff";
import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";

const AppDesign = DS.AppDesign;

export default function ClinicalModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; from_module?: string }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sourceModuleId = Array.isArray(params.from_module) ? params.from_module[0] : params.from_module;
  const clinicalModule = moduleId ? getClinicalModuleById(moduleId) : undefined;
  const sourceModule = sourceModuleId ? getClinicalModuleById(sourceModuleId) : undefined;

  if (!clinicalModule) {
    return <Redirect href="/" />;
  }

  function goToHub() {
    router.replace(MODULES_HUB_HREF);
  }

  function goBackTarget() {
    if (sourceModule?.route) {
      const sourceProtocolId = sourceModule.engine.getEncounterSummary().protocolId;
      const airwayReturnHandoff = sourceProtocolId
        ? consumeAirwayReturnHandoff(sourceProtocolId)
        : undefined;

      if (airwayReturnHandoff && sourceModule.engine.updateAuxiliaryField) {
        sourceModule.engine.updateAuxiliaryField("treatmentAirway", airwayReturnHandoff.airwayValue);
        if (airwayReturnHandoff.oxygenValue) {
          sourceModule.engine.updateAuxiliaryField("treatmentO2", airwayReturnHandoff.oxygenValue);
        }
      }

      router.replace(sourceModule.route as Href);
      return;
    }
    goToHub();
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.chrome}>
        <ModuleBackToHubLink
          onPress={goBackTarget}
          label={sourceModule ? `← ${sourceModule.title}` : "← Módulos"}
          accessibilityLabel={sourceModule ? `Voltar para ${sourceModule.title}` : "Voltar aos módulos"}
        />
        <Text style={styles.chromeTitle} numberOfLines={1}>
          {clinicalModule.title}
        </Text>
      </View>
      <View style={styles.appBody}>
        <ClinicalApp engine={clinicalModule.engine} onRouteBack={goBackTarget} />
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
