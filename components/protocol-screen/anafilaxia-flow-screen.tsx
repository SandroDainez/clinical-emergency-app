import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { anaphylaxisDecisionTree } from "../../anaphylaxis-decision-tree";

export default function AnafilaxiaFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={anaphylaxisDecisionTree}
      protocolLabel="Anafilaxia"
      headerTitle="Anafilaxia · Emergência"
      intro="Fluxo interativo da anafilaxia. Responda a cada passo — o app conduz a sequência: reconhecimento, adrenalina IM imediata, estratificação de gravidade, pacotes de suporte, reavaliação e destino (incluindo transição para via aérea/ISR, ventilação ou drogas vasoativas quando indicado)."
      source="Baseado em diretrizes de anafilaxia (WAO/EAACI e AHA)"
      currentModuleSlug="anafilaxia"
    />
  );
}
