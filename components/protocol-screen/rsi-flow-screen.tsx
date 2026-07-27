import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { rsiDecisionTree } from "../../rsi-decision-tree";

export default function RsiFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={rsiDecisionTree}
      protocolLabel="ISR — Via aérea"
      headerTitle="ISR · Via aérea"
      intro="Fluxo interativo da intubação em sequência rápida (7 P's). O app conduz a sequência real: preparação (SOAP-ME), pré-oxigenação, predição de via aérea difícil, otimização hemodinâmica, indução (agente conforme a hemodinâmica), bloqueador neuromuscular, passagem do tubo, confirmação por capnografia e manejo pós-intubação. Doses calculadas por peso."
      source="Baseado em consensos de manejo de via aérea de emergência (ISR no adulto)"
      currentModuleSlug="isr-rapida"
    />
  );
}
