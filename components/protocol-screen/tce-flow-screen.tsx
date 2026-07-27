import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { tceDecisionTree } from "../../tce-decision-tree";

export default function TceFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={tceDecisionTree}
      protocolLabel="TCE"
      headerTitle="TCE · Traumatismo cranioencefálico"
      intro="Classificação por Glasgow, indicação de tomografia (Canadian CT Head Rule), prevenção da lesão secundária (evitar hipotensão e hipóxia), reversão de anticoagulação e controle da hipertensão intracraniana com terapia hiperosmolar."
      source="ATLS / Brain Trauma Foundation (4ª ed.)"
      currentModuleSlug="tce"
    />
  );
}
