import { Redirect, useLocalSearchParams, useRouter, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ClinicalApp from "../../components/clinical-app";
import { ModuleBackToHubLink } from "../../components/module-back-to-hub";
import { getClinicalModuleById, getClinicalModules } from "../../clinical-modules";
import { consumeAirwayReturnHandoff } from "../../lib/module-return-handoff";
import { MODULES_HUB_HREF } from "../../lib/modules-hub-route";
import { useTr } from "../../lib/use-tr";

/**
 * Ids de módulo a pré-renderizar na exportação web (`web.output: "static"`).
 *
 * Sem isto o build gera um único HTML para o template `/modulos/[id]`, sem id
 * concreto: a tela do módulo não tem o que renderizar e o HTML sai diferente do
 * que o cliente monta — era a causa do hydration mismatch (React #418) nas 28
 * rotas, com flash da landing antes de cada módulo.
 *
 * Enumerando os ids, cada módulo ganha o seu próprio HTML já com o conteúdo
 * certo: o primeiro render do cliente encontra exatamente o mesmo, e a página
 * continua indexável. Não afeta iOS/Android — em nativo não há pré-render.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return getClinicalModules().map((clinicalModule) => ({ id: clinicalModule.id }));
}

export default function ClinicalModuleScreen() {
  const tr = useTr();
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
          label={sourceModule ? `← ${tr(sourceModule.title)}` : `← ${tr("Módulos")}`}
          accessibilityLabel={sourceModule ? `${tr("Voltar para")} ${tr(sourceModule.title)}` : tr("Voltar aos módulos")}
        />
        <Text style={styles.chromeTitle} numberOfLines={1}>
          {tr(clinicalModule.title)}
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
    backgroundColor: "#1a1d23",
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
    color: "#f8fafc",
    letterSpacing: -0.35,
  },
  appBody: {
    flex: 1,
  },
});
