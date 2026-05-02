import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo } from "react";
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
  const params = useLocalSearchParams<{
    id?: string;
    from_module?: string;
    age?: string;
    sex?: string;
    weight_kg?: string;
    height_cm?: string;
    spo2?: string;
    case_label?: string;
  }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sourceModuleId = Array.isArray(params.from_module) ? params.from_module[0] : params.from_module;
  const clinicalModule = moduleId ? getClinicalModuleById(moduleId) : undefined;
  const sourceModule = sourceModuleId ? getClinicalModuleById(sourceModuleId) : undefined;
  const initialReferralFields = useMemo(() => {
    if (!moduleId) {
      return undefined;
    }

    const read = (value?: string | string[]) =>
      Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
    const normalizeHeightCm = (value: string) => {
      const trimmed = value.trim().replace(",", ".");
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed <= 0) return value;
      if (parsed >= 1 && parsed <= 2.5) return String(Math.round(parsed * 100));
      return value;
    };

    if (moduleId === "ventilacao-mecanica") {
      return {
        caseLabel: read(params.case_label),
        age: read(params.age),
        sex: read(params.sex),
        heightCm: normalizeHeightCm(read(params.height_cm)),
        weightKg: read(params.weight_kg),
        spo2: read(params.spo2),
      };
    }

    return undefined;
  }, [moduleId, params.age, params.case_label, params.height_cm, params.sex, params.spo2, params.weight_kg]);

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
        <View style={styles.chromeActions}>
          <ModuleBackToHubLink
            onPress={goBackTarget}
            label={sourceModule ? `← ${sourceModule.title}` : "← Módulos"}
            accessibilityLabel={sourceModule ? `Voltar para ${sourceModule.title}` : "Voltar aos módulos"}
          />
        </View>
        <Text style={styles.chromeTitle} numberOfLines={1}>
          {clinicalModule.title}
        </Text>
      </View>
      <View style={styles.appBody}>
        <ClinicalApp
          engine={clinicalModule.engine}
          onRouteBack={goBackTarget}
          initialReferralFields={initialReferralFields}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    backgroundColor: AppDesign.canvas.background,
  },
  chrome: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: AppDesign.surface.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppDesign.border.subtle,
  },
  chromeActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  chromeTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.35,
  },
  appBody: {
    flex: 1,
    minHeight: 0,
  },
});
