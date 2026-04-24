import type {
  ActionNode,
  DecisionNode,
  DecisionTreeDefinition,
  DecisionTreeLogEntry,
  DecisionTreeNode,
  DecisionTreeValidationIssue,
  FrontendTreeStep,
  TransitionNode,
} from "./types";

function assertNodeExists(tree: DecisionTreeDefinition, nodeId: string): DecisionTreeNode {
  const node = tree.nodes[nodeId];
  if (!node) {
    throw new Error(`Decision tree "${tree.id}" references missing node "${nodeId}".`);
  }
  return node;
}

export function validateDecisionTree(tree: DecisionTreeDefinition): DecisionTreeValidationIssue[] {
  const issues: DecisionTreeValidationIssue[] = [];
  const nodeIds = new Set(Object.keys(tree.nodes));

  if (!nodeIds.has(tree.entryNodeId)) {
    issues.push({
      level: "error",
      nodeId: tree.entryNodeId,
      message: `Entry node "${tree.entryNodeId}" does not exist.`,
    });
  }

  for (const node of Object.values(tree.nodes)) {
    if (node.type === "decision") {
      if (!node.options.length) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: "Decision node must expose at least one option.",
        });
      }

      for (const option of node.options) {
        if (!nodeIds.has(option.next)) {
          issues.push({
            level: "error",
            nodeId: node.id,
            message: `Decision option "${option.id}" points to missing node "${option.next}".`,
          });
        }
      }
    }

    if (node.type === "action" && !nodeIds.has(node.next)) {
      issues.push({
        level: "error",
        nodeId: node.id,
        message: `Action node points to missing next node "${node.next}".`,
      });
    }

    if (node.type === "transition" && !node.targets.length) {
      issues.push({
        level: "warning",
        nodeId: node.id,
        message: "Transition node has no declared targets.",
      });
    }
  }

  const reachable = new Set<string>();
  const stack = [tree.entryNodeId];
  while (stack.length) {
    const nodeId = stack.pop();
    if (!nodeId || reachable.has(nodeId) || !nodeIds.has(nodeId)) continue;
    reachable.add(nodeId);
    const node = tree.nodes[nodeId];
    if (node.type === "decision") {
      node.options.forEach((option) => stack.push(option.next));
    } else if (node.type === "action") {
      stack.push(node.next);
    }
  }

  for (const nodeId of nodeIds) {
    if (!reachable.has(nodeId)) {
      issues.push({
        level: "warning",
        nodeId,
        message: `Node "${nodeId}" is unreachable from entry node.`,
      });
    }
  }

  return issues;
}

export class DecisionTreeEngine {
  private readonly tree: DecisionTreeDefinition;
  private currentNodeId: string;
  private readonly log: DecisionTreeLogEntry[] = [];

  constructor(tree: DecisionTreeDefinition) {
    const issues = validateDecisionTree(tree).filter((issue) => issue.level === "error");
    if (issues.length) {
      throw new Error(
        `Invalid decision tree "${tree.id}": ${issues.map((issue) => issue.message).join(" | ")}`
      );
    }

    this.tree = tree;
    this.currentNodeId = tree.entryNodeId;
    this.record("enter", this.getCurrentNode());
  }

  getCurrentNode(): DecisionTreeNode {
    return assertNodeExists(this.tree, this.currentNodeId);
  }

  getLog(): DecisionTreeLogEntry[] {
    return [...this.log];
  }

  reset(): DecisionTreeNode {
    this.currentNodeId = this.tree.entryNodeId;
    this.record("reset", this.getCurrentNode());
    this.record("enter", this.getCurrentNode());
    return this.getCurrentNode();
  }

  choose(optionId: string): DecisionTreeNode {
    const node = this.getCurrentNode();
    if (node.type !== "decision") {
      throw new Error(`Cannot answer node "${node.id}" because it is not a decision node.`);
    }

    const option = node.options.find((item) => item.id === optionId);
    if (!option) {
      throw new Error(`Decision node "${node.id}" does not contain option "${optionId}".`);
    }

    this.record("answer", node, option.id, option.label);
    this.currentNodeId = option.next;
    const nextNode = this.getCurrentNode();
    this.record("enter", nextNode);
    return nextNode;
  }

  advance(): DecisionTreeNode {
    const node = this.getCurrentNode();
    if (node.type !== "action") {
      throw new Error(`Cannot advance node "${node.id}" because it is not an action node.`);
    }

    this.record("advance", node);
    this.currentNodeId = node.next;
    const nextNode = this.getCurrentNode();
    this.record("enter", nextNode);
    return nextNode;
  }

  toFrontendStep(): FrontendTreeStep {
    const node = this.getCurrentNode();
    if (node.type === "decision") {
      return mapDecisionNode(node);
    }
    if (node.type === "action") {
      return mapActionNode(node);
    }
    return mapTransitionNode(node);
  }

  private record(
    event: DecisionTreeLogEntry["event"],
    node: DecisionTreeNode,
    optionId?: string,
    optionLabel?: string
  ) {
    this.log.push({
      timestamp: Date.now(),
      event,
      nodeId: node.id,
      nodeType: node.type,
      optionId,
      optionLabel,
    });
  }
}

function mapDecisionNode(node: DecisionNode): FrontendTreeStep {
  return {
    id: node.id,
    kind: "decision",
    title: node.title,
    question: node.question,
    summary: node.summary,
    evidence: node.evidence ?? [],
    options: node.options.map((option) => ({ id: option.id, label: option.label })),
  };
}

function mapActionNode(node: ActionNode): FrontendTreeStep {
  return {
    id: node.id,
    kind: "action",
    title: node.title,
    summary: node.summary,
    actions: [...node.actions],
    canContinue: true,
  };
}

function mapTransitionNode(node: TransitionNode): FrontendTreeStep {
  return {
    id: node.id,
    kind: "transition",
    title: node.title,
    summary: node.summary,
    disposition: node.disposition,
    exitCriteria: [...node.exitCriteria],
    targets: [...node.targets],
  };
}
