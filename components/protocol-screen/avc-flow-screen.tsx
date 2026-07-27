import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { avcDecisionTree } from "../../avc-decision-tree";

export default function AvcFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={avcDecisionTree}
      protocolLabel="AVC Agudo"
      headerTitle="AVC · Emergência"
      intro="Fluxo interativo do AVC agudo. Responda a cada passo — o app conduz a sequência: tempo de início, TC, NIHSS, elegibilidade para trombólise (dose calculada por peso) e trombectomia."
      source="Baseado em AHA/ASA 2019 (Manejo Precoce do AVC Isquêmico Agudo)"
      currentModuleSlug="avc"
    />
  );
}
