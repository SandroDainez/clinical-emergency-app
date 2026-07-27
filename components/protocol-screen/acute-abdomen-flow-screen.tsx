import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { acuteAbdomenDecisionTree } from "../../acute-abdomen-decision-tree";

export default function AcuteAbdomenFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={acuteAbdomenDecisionTree}
      protocolLabel="Abdome agudo"
      headerTitle="Abdome agudo"
      intro="Exclusão das catástrofes abdominais (aneurisma roto, gravidez ectópica, isquemia mesentérica, perfuração), classificação do padrão (inflamatório, obstrutivo, perfurativo, vascular), exames dirigidos e definição do destino cirúrgico."
      source="Diretrizes de cirurgia de emergência (WSES) e literatura de referência"
      currentModuleSlug="abdome-agudo"
    />
  );
}
