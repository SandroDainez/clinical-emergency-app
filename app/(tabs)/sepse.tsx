import ClinicalApp from "../../components/clinical-app";
import * as sepsisEngine from "../../sepsis-engine";

export default function SepsisScreen() {
  return <ClinicalApp engine={sepsisEngine} />;
}
