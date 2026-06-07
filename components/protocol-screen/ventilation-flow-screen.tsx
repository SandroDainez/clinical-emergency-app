import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { ventilationDecisionTree } from "../../ventilation-decision-tree";

export default function VentilationFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={ventilationDecisionTree}
      protocolLabel="Ventilação Mecânica"
      headerTitle="Ventilação Mecânica"
      intro="Fluxo interativo da ventilação mecânica invasiva. O app conduz a sequência real: objetivos e modo, cálculo do peso predito (pela altura — define o volume corrente protetor), ajuste inicial, reconhecimento e manejo de SDRA (PEEP/prona), checagem de segurança (platô e driving pressure) e troubleshooting (DOPES)."
      source="Baseado em ventilação protetora (ARDSNet) e princípios de VM no adulto"
    />
  );
}
