import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { avcDecisionTreeUx } from "../../avc-decision-tree-ux";

export default function AvcFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={avcDecisionTreeUx}
      protocolLabel="AVC Agudo"
      headerTitle="AVC · Emergência"
      intro="Siga uma decisão por vez. O app preserva o contexto do atendimento e conduz do reconhecimento ao diagnóstico, reperfusão e destino."
      source="Baseado em AHA/ASA 2019 (Manejo Precoce do AVC Isquêmico Agudo)"
      currentModuleSlug="avc"
    />
  );
}
