import AclsDecisionFlowScreen from "./acls-decision-flow-screen";
import { coronaryV2DecisionTree } from "../../coronary-v2-decision-tree";

/**
 * ⚠️ MESMO SHELL DA V1, ÁRVORE DIFERENTE. A V2 não ganha componente próprio de
 * propósito: tudo o que o shell já sabe fazer — vereditos, faixa persistente,
 * marcos, retomada, ferramenta auxiliar, tradução — vale igual aqui. Um shell
 * paralelo duplicaria a camada que mais custou a ficar correta.
 */
export default function CoronaryV2FlowScreen() {
  return (
    <AclsDecisionFlowScreen
      tree={coronaryV2DecisionTree}
      protocolLabel="Coronarianas · V2"
      headerTitle="SCA V2 · Emergência"
      intro="Versão em avaliação: o atendimento organizado em três decisões clínicas, com o ECG guiado no ponto de cada decisão. Implementa o caminho crítico — entrada, ECG, STEMI, ICP ou fibrinólise e reavaliação. O módulo de Síndromes Coronarianas (V1) segue completo."
      source="Baseado em ACC/AHA/ACEP/NAEMSP/SCAI 2025 (Síndromes Coronarianas Agudas)"
      currentModuleSlug="sindromes-coronarianas-v2"
    />
  );
}
