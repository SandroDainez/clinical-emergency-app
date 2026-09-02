import { DecisionTreeEngine } from "../core/decision-tree/engine";
import type { DecisionTreeDefinition, TreeValues } from "../core/decision-tree/types";

export type ClinicalRunnerInstruction =
  | { type: "set"; field: string; value: string }
  | { type: "choose"; optionId: string }
  | { type: "advance" }
  | { type: "goto"; nodeId: string };

export type ClinicalRunnerResult = {
  visited: string[];
  finalNodeId: string;
  values: TreeValues;
};

/**
 * Runner determinístico de trajetória sobre uma árvore existente.
 *
 * Não contém heurística clínica. Executa somente instruções explícitas do caso
 * de teste usando a mesma DecisionTreeEngine do app. Isso permite validar
 * caminhos completos sem criar um segundo motor de decisão paralelo.
 */
export function runClinicalTrajectory(
  tree: DecisionTreeDefinition,
  instructions: readonly ClinicalRunnerInstruction[]
): ClinicalRunnerResult {
  const engine = new DecisionTreeEngine(tree);
  const visited = [engine.getCurrentNode().id];

  for (const instruction of instructions) {
    if (instruction.type === "set") {
      engine.setValue(instruction.field, instruction.value);
      continue;
    }

    if (instruction.type === "choose") {
      const next = engine.choose(instruction.optionId);
      visited.push(next.id);
      continue;
    }

    if (instruction.type === "advance") {
      const next = engine.advance();
      visited.push(next.id);
      continue;
    }

    const next = engine.goToNode(instruction.nodeId);
    visited.push(next.id);
  }

  return {
    visited,
    finalNodeId: engine.getCurrentNode().id,
    values: engine.getValues(),
  };
}

export function assertClinicalTrajectory(
  result: ClinicalRunnerResult,
  expectation: {
    mustVisit?: readonly string[];
    mustNotVisit?: readonly string[];
    finalNodeId?: string;
  }
): string[] {
  const issues: string[] = [];
  const visited = new Set(result.visited);

  for (const nodeId of expectation.mustVisit ?? []) {
    if (!visited.has(nodeId)) issues.push(`trajetória não visitou nó obrigatório: ${nodeId}`);
  }

  for (const nodeId of expectation.mustNotVisit ?? []) {
    if (visited.has(nodeId)) issues.push(`trajetória visitou nó proibido: ${nodeId}`);
  }

  if (expectation.finalNodeId && result.finalNodeId !== expectation.finalNodeId) {
    issues.push(`nó final esperado ${expectation.finalNodeId}; recebido ${result.finalNodeId}`);
  }

  return issues;
}
