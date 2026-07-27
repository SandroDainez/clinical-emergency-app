import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { eclampsiaDecisionTree } from "../../eclampsia-decision-tree";

export default function EclampsiaFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={eclampsiaDecisionTree}
      protocolLabel="Pré-eclâmpsia / Eclâmpsia"
      headerTitle="PE / Eclâmpsia"
      intro="Fluxo interativo da pré-eclâmpsia e eclâmpsia. O app conduz: reconhecimento, convulsão ativa (eclâmpsia → proteção, via aérea e MgSO₄ imediato), classificação (HAS gestacional / PE / PE grave / HELLP), sulfato de magnésio com tríade de segurança e antídoto (gluconato de cálcio), crise hipertensiva (hidralazina/labetalol/nifedipina), momento e via do parto, e manejo pós-parto/prevenção."
      source="ACOG 222 (2020/2023) · ISSHP 2018 · FIGO 2019 · Magpie · ASPRE · FEBRASGO 2021"
      currentModuleSlug="pre-eclampsia"
    />
  );
}
