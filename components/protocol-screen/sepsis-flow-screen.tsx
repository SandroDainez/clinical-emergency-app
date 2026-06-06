import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { sepsisDecisionTree } from "../../sepsis-decision-tree";

export default function SepsisFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={sepsisDecisionTree}
      protocolLabel="Sepse / Choque Séptico"
      headerTitle="Sepse · Emergência"
      intro="Fluxo interativo da sepse e do choque séptico (pacote da 1ª hora). O app conduz a sequência real: reconhecimento, lactato e culturas, antibiótico de amplo espectro ≤1 h, ressuscitação volêmica (30 mL/kg calculado por peso), vasopressor com alvo de PAM ≥65, controle do foco e reavaliação dinâmica."
      source="Baseado na Surviving Sepsis Campaign 2021 (pacote da 1ª hora)"
    />
  );
}
