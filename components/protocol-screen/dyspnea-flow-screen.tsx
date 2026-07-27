import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { dyspneaDecisionTree } from "../../dyspnea-decision-tree";

export default function DyspneaFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={dyspneaDecisionTree}
      protocolLabel="Insuficiência respiratória"
      headerTitle="Insuficiência respiratória · Diferencial"
      intro="Diagnóstico diferencial da dispneia aguda guiado por perguntas: início súbito (pneumotórax, TEP, anafilaxia) × gradual (asma, DPOC, EAP, pneumonia, SARA, insuficiência hipercápnica). Cada diagnóstico traz exames prioritários, tratamento imediato, critérios de IOT e link para o protocolo."
      source="Insuficiência respiratória aguda — diagnóstico diferencial e suporte"
      currentModuleSlug="insuficiencia-respiratoria"
    />
  );
}
