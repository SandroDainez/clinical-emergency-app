import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { iraDecisionTree } from "../../ira-decision-tree";

export default function IraFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={iraDecisionTree}
      protocolLabel="Injúria renal aguda"
      headerTitle="Injúria renal aguda"
      intro="Creatinina que subiu ou paciente que parou de urinar: os dois eixos do KDIGO (creatinina e diurese), a base de creatinina — inclusive quando você não a tem —, a exclusão da obstrução em primeiro lugar, hipoperfusão e nefrotóxico pelo que se observa, e quando a conversa sobre diálise precisa começar."
      source="KDIGO 2012 (Clinical Practice Guideline for Acute Kidney Injury)"
      currentModuleSlug="injuria-renal-aguda"
    />
  );
}
