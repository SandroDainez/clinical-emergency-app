import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { poisoningDecisionTree } from "../../poisoning-decision-tree";

export default function PoisoningFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={poisoningDecisionTree}
      protocolLabel="Intoxicações exógenas"
      headerTitle="Intoxicações exógenas"
      intro="Estabilização e antídotos do coma, identificação da síndrome tóxica (opioide, colinérgica, anticolinérgica, simpaticomimética, sedativa), descontaminação com carvão ativado, antídotos específicos por tóxico e indicações de hemodiálise."
      source="Toxicologia de emergência — contatar o CIATox"
      currentModuleSlug="intoxicacoes-exogenas"
    />
  );
}
