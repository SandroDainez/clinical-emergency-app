import { anaphylaxisDecisionTree } from "../anaphylaxis-decision-tree";
import { avcDecisionTree } from "../avc-decision-tree";
import { rsiDecisionTree } from "../rsi-decision-tree";
import {
  findDispositionNodes,
  findReassessmentNodes,
} from "../lib/clinical-graph-audit";

export type PilotGraphAudit = {
  moduleId: string;
  reassessmentNodes: string[];
  dispositionNodes: string[];
};

/**
 * Medição dos três módulos-piloto sem criar hard stop prematuro.
 *
 * O objetivo inicial é tornar as lacunas visíveis. Depois da revisão clínica,
 * o que for requisito real vira expectativa explícita do teste executável.
 */
export function auditPilotGraphs(): PilotGraphAudit[] {
  return [
    ["avc", avcDecisionTree],
    ["anafilaxia", anaphylaxisDecisionTree],
    ["isr-rapida", rsiDecisionTree],
  ].map(([moduleId, tree]) => ({
    moduleId: moduleId as string,
    reassessmentNodes: findReassessmentNodes(tree as typeof avcDecisionTree),
    dispositionNodes: findDispositionNodes(tree as typeof avcDecisionTree),
  }));
}
