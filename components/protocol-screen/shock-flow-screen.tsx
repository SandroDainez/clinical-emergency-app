import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { shockDecisionTree } from "../../shock-decision-tree";

export default function ShockFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={shockDecisionTree}
      protocolLabel="Choque"
      headerTitle="Choque · Diagnóstico e conduta"
      intro="Diagnóstico diferencial do choque por perguntas binárias: hipovolêmico, obstrutivo (pneumotórax, tamponamento, TEP), cardiogênico e distributivo (séptico, anafilático, neurogênico). Cada diagnóstico traz mecanismo, sinais confirmatórios, próximas ações e link para o protocolo."
      source="Perfis hemodinâmicos — ATLS / Surviving Sepsis Campaign"
      currentModuleSlug="choque"
    />
  );
}
