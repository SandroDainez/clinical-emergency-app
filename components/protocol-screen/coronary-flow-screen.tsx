import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { coronaryDecisionTree } from "../../coronary-decision-tree";

export default function CoronaryFlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={coronaryDecisionTree}
      protocolLabel="Síndromes Coronarianas"
      headerTitle="SCA · Emergência"
      intro="Fluxo interativo da síndrome coronariana aguda. O app conduz a sequência real do atendimento: medidas imediatas + AAS, ECG ≤10 min, classificação STEMI x sem supra de ST, terapia antitrombótica/anti-isquêmica, reperfusão (ICP x fibrinólise, dose por peso) ou estratégia invasiva por risco e destino."
      // ⚠️ CORRIGIDO (correção final 2026-08-25) — o rodapé dizia "AHA/ACC e
      // ESC 2023", mas a ESC 2023 nunca foi a fonte deste módulo (grep no
      // arquivo inteiro não encontra nenhuma citação ESC). A fonte real,
      // já documentada no topo de `coronary-decision-tree.ts` desde a
      // primeira versão, é a ACC/AHA/ACEP/NAEMSP/SCAI 2025 Guideline for
      // the Management of Patients With Acute Coronary Syndromes
      // (Circulation, DOI 10.1161/CIR.0000000000001309) — texto completo
      // lido a partir do PDF oficial. Citar ESC 2023 sem ela nunca ter sido
      // de fato usada seria fabricar procedência, não corrigi-la.
      source="Baseado em ACC/AHA/ACEP/NAEMSP/SCAI 2025 (Síndromes Coronarianas Agudas)"
      currentModuleSlug="sindromes-coronarianas"
    />
  );
}
