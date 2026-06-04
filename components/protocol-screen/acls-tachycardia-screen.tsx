import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { tachycardiaDecisionTree } from "../../acls-tachycardia-tree";

export default function AclsTachycardiaScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={tachycardiaDecisionTree}
      protocolLabel="Taquicardia ACLS"
      intro="Algoritmo interativo de taquicardia no adulto com pulso. Responda a cada passo — o app conduz a sequência exata do ACLS: estável vs instável, largura do QRS e regularidade."
      source="Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)"
    />
  );
}
