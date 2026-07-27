import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { coronaryDecisionTree } from "../../coronary-decision-tree";

export default function CoronaryFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={coronaryDecisionTree}
      protocolLabel="Síndromes Coronarianas"
      headerTitle="SCA · Emergência"
      intro="Fluxo interativo da síndrome coronariana aguda. O app conduz a sequência real do atendimento: medidas imediatas + AAS, ECG ≤10 min, classificação STEMI x sem supra de ST, terapia antitrombótica/anti-isquêmica, reperfusão (ICP x fibrinólise, dose por peso) ou estratégia invasiva por risco e destino."
      source="Baseado em AHA/ACC e ESC 2023 (Síndromes Coronarianas Agudas)"
      currentModuleSlug="sindromes-coronarianas"
    />
  );
}
