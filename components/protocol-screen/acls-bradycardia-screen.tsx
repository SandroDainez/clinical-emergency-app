import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { bradycardiaDecisionTree } from "../../acls-bradycardia-tree";

export default function AclsBradycardiaScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={bradycardiaDecisionTree}
      protocolLabel="Bradicardia ACLS"
      intro="Algoritmo interativo de bradicardia no adulto com pulso. Responda a cada passo — o app conduz a sequência exata do ACLS, da identificação ao marcapasso definitivo."
      source="Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)"
      currentModuleSlug="bradicardia-acls"
    />
  );
}
