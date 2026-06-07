import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { eapDecisionTree } from "../../eap-decision-tree";

export default function EapFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={eapDecisionTree}
      protocolLabel="Edema Agudo de Pulmão"
      headerTitle="EAP · Emergência"
      intro="Fluxo interativo do edema agudo de pulmão cardiogênico. O app conduz a sequência real: posição e O₂/VNI, classificação pela PA sistólica (hipertensivo / normotenso / hipotenso-choque), tratamento conforme o perfil, investigação e tratamento da causa (SCA, arritmia), reavaliação e destino."
      source="Baseado nas diretrizes de Insuficiência Cardíaca Aguda (ESC 2021)"
    />
  );
}
