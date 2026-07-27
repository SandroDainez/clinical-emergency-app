import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { eapDecisionTree } from "../../eap-decision-tree";

export default function EapFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={eapDecisionTree}
      protocolLabel="Edema Agudo de Pulmão"
      headerTitle="EAP · Emergência"
      intro="Fluxo interativo do edema agudo de pulmão. A primeira decisão separa cardiogênico × não-cardiogênico (SARA) — o tratamento é fundamentalmente diferente. No cardiogênico: posição e O₂/VNI, classificação pela PA sistólica, tratamento por perfil (vasodilatador / diurético / inotrópico-vasopressor no choque), causa (SCA, arritmia), reavaliação e destino. Na SARA: critérios de Berlim, ventilação protetora ARDSNet (VC por peso predito, Pplat ≤ 30, ΔP ≤ 15) e manobras de resgate (prona, BNM, ECMO)."
      source="ESC HF 2021 · AHA/ACC 2022 · ARDS Network · Berlim 2012 · UpToDate 2024"
      currentModuleSlug="edema-agudo-pulmao"
    />
  );
}
