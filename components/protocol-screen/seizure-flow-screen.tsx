import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { seizureDecisionTree } from "../../seizure-decision-tree";

export default function SeizureFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={seizureDecisionTree}
      protocolLabel="Crises convulsivas"
      headerTitle="Crises convulsivas e mal epiléptico"
      intro="Protocolo tempo-dependente: estabilização e glicemia (0–5 min), benzodiazepínico em dose plena (5–20 min), antiepiléptico IV de 2ª linha (20–40 min) e anestésico com intubação e EEG contínuo no mal epiléptico refratário (40–60 min). Doses calculadas pelo peso."
      source="American Epilepsy Society (2016) / Neurocritical Care Society"
      currentModuleSlug="crises-convulsivas"
    />
  );
}
