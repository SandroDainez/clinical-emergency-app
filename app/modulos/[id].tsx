import { Redirect, useLocalSearchParams } from "expo-router";
import ClinicalApp from "../../components/clinical-app";
import { getClinicalModuleById } from "../../clinical-modules";

export default function ClinicalModuleScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const moduleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const clinicalModule = moduleId ? getClinicalModuleById(moduleId) : undefined;

  if (!clinicalModule) {
    return <Redirect href="/" />;
  }

  return <ClinicalApp engine={clinicalModule.engine} />;
}
