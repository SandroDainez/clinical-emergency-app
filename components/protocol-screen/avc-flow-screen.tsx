import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { avcDecisionTree } from "../../avc-decision-tree";

export default function AvcFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={avcDecisionTree}
      protocolLabel="AVC Agudo"
      headerTitle="AVC · Emergência"
      intro="Siga uma decisão por vez. O app preserva o contexto do atendimento e conduz do reconhecimento ao diagnóstico, reperfusão e destino."
      source="Baseado em AHA/ASA 2019 (Manejo Precoce do AVC Isquêmico Agudo)"
      currentModuleSlug="avc"
    />
  );
}
