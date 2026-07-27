import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { dkaHhsDecisionTree } from "../../dka-hhs-decision-tree";

export default function DkaHhsFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={dkaHhsDecisionTree}
      protocolLabel="CAD / EHH"
      headerTitle="CAD · EHH"
      intro="Fluxo interativo da cetoacidose diabética e do estado hiperosmolar. O app conduz a sequência real: reconhecimento e diagnóstico, hidratação, checagem do potássio (que define o início da insulina), insulina IV (dose por peso), bicarbonato, ajuste ao atingir a meta glicêmica e critérios de resolução."
      source="Baseado nas diretrizes ADA (manejo de CAD e EHH no adulto)"
      currentModuleSlug="cetoacidose-hiperosmolar"
    />
  );
}
