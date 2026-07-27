import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { politraumaDecisionTree } from "../../politrauma-decision-tree";

export default function PolitraumaFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={politraumaDecisionTree}
      protocolLabel="Politrauma"
      headerTitle="Politrauma · Atendimento inicial"
      intro="Atendimento ao traumatizado grave conforme o ATLS: controle da hemorragia exsanguinante (X) antes do ABCDE, avaliação primária, reanimação hemostática com transfusão 1:1:1, ácido tranexâmico, damage control e avaliação secundária."
      source="ATLS — Advanced Trauma Life Support / CRASH-2"
      currentModuleSlug="politrauma"
    />
  );
}
