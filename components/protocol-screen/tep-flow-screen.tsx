import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { tepDecisionTree } from "../../tep-decision-tree";

export default function TepFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={tepDecisionTree}
      protocolLabel="Tromboembolia Pulmonar"
      headerTitle="TEP · Emergência"
      intro="Fluxo interativo da tromboembolia pulmonar. A primeira decisão é a estabilidade: instável (alto risco) → suporte + HNF + trombólise imediata; estável → probabilidade pré-teste (Wells), D-dímero/AngioTC, estratificação de risco (disfunção de VD + biomarcadores + sPESI) e anticoagulação (NOAC 1ª linha) com opção de tratamento ambulatorial no baixo risco. Doses de HNF, enoxaparina e trombolítico calculadas pelo peso."
      source="ESC 2019 · AHA 2011 (updated) · ACCP/CHEST 2022 · ASH 2020 · UpToDate 2024"
      currentModuleSlug="tep"
    />
  );
}
