import type {
  ActionNode,
  DecisionNode,
  DecisionTreeDefinition,
  DecisionTreeLogEntry,
  DecisionTreeNode,
  DecisionTreeValidationIssue,
  FrontendTreeStep,
  InputNode,
  TransitionNode,
  TreeValues,
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

    if (node.type === "input") {
      if (!node.fields.length) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: "Input node must expose at least one field.",
        });
      }
      if (!nodeIds.has(node.next)) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `Input node points to missing next node "${node.next}".`,
        });
      }
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
    } else if (node.type === "action" || node.type === "input") {
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
  private history: string[] = [];
  private values: Record<string, string> = {};

  constructor(tree: DecisionTreeDefinition) {
    const issues = validateDecisionTree(tree).filter((issue) => issue.level === "error");
    if (issues.length) {
      throw new Error(
        `Invalid decision tree "${tree.id}": ${issues.map((issue) => issue.message).join(" | ")}`
      );
    }

    this.tree = tree;
    this.currentNodeId = tree.entryNodeId;
    this.history = [tree.entryNodeId];
    this.record("enter", this.getCurrentNode());
  }

  getCurrentNode(): DecisionTreeNode {
    return assertNodeExists(this.tree, this.currentNodeId);
  }

  getLog(): DecisionTreeLogEntry[] {
    return [...this.log];
  }

  // ── Valores coletados + derivados ───────────────────────────────────────────
  getValues(): TreeValues {
    return { ...this.values, ...this.getDerived() };
  }

  private getDerived(): Record<string, string> {
    try {
      return this.tree.derive?.({ ...this.values }) ?? {};
    } catch {
      return {};
    }
  }

  setValue(fieldId: string, value: string): void {
    if (value.trim().length === 0) {
      delete this.values[fieldId];
    } else {
      this.values[fieldId] = value;
    }
    this.record("value", this.getCurrentNode(), undefined, undefined, fieldId, value);
  }

  /** Substitui tokens {chave} pelos valores coletados/derivados. */
  private interpolate(text: string): string {
    const all = this.getValues();
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const v = all[key];
      return v !== undefined && v !== "" ? v : match;
    });
  }

  reset(): DecisionTreeNode {
    this.currentNodeId = this.tree.entryNodeId;
    this.history = [this.tree.entryNodeId];
    this.values = {};
    this.record("reset", this.getCurrentNode());
    this.record("enter", this.getCurrentNode());
    return this.getCurrentNode();
  }

  canGoBack(): boolean {
    return this.history.length > 1;
  }

  goToNode(nodeId: string): DecisionTreeNode {
    const nextNode = assertNodeExists(this.tree, nodeId);
    if (this.currentNodeId === nodeId) {
      return nextNode;
    }

    this.currentNodeId = nodeId;
    this.history.push(nodeId);
    this.record("enter", nextNode);
    return nextNode;
  }

  goBack(): DecisionTreeNode {
    if (!this.canGoBack()) {
      return this.getCurrentNode();
    }

    this.history = this.history.slice(0, -1);
    this.currentNodeId = this.history[this.history.length - 1];
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
    this.history.push(option.next);
    const nextNode = this.getCurrentNode();
    this.record("enter", nextNode);
    return nextNode;
  }

  advance(): DecisionTreeNode {
    const node = this.getCurrentNode();
    if (node.type !== "action" && node.type !== "input") {
      throw new Error(`Cannot advance node "${node.id}" because it is not an action/input node.`);
    }

    this.record("advance", node);
    this.currentNodeId = node.next;
    this.history.push(node.next);
    const nextNode = this.getCurrentNode();
    this.record("enter", nextNode);
    return nextNode;
  }

  toFrontendStep(): FrontendTreeStep {
    const node = this.getCurrentNode();
    if (node.type === "decision") {
      return mapDecisionNode(node, this.getValues(), (t) => this.interpolate(t));
    }
    if (node.type === "action") {
      return mapActionNode(node, (t) => this.interpolate(t));
    }
    if (node.type === "input") {
      return mapInputNode(node, this.values, (t) => this.interpolate(t));
    }
    return mapTransitionNode(node, (t) => this.interpolate(t));
  }

  private record(
    event: DecisionTreeLogEntry["event"],
    node: DecisionTreeNode,
    optionId?: string,
    optionLabel?: string,
    fieldId?: string,
    value?: string
  ) {
    this.log.push({
      timestamp: 0,
      event,
      nodeId: node.id,
      nodeType: node.type,
      optionId,
      optionLabel,
      fieldId,
      value,
    });
  }
}

function mapDecisionNode(
  node: DecisionNode,
  values: TreeValues,
  interpolate: (t: string) => string
): FrontendTreeStep {
  return {
    id: node.id,
    kind: "decision",
    title: interpolate(node.title),
    question: interpolate(node.question),
    summary: node.summary ? interpolate(node.summary) : undefined,
    evidence: (node.evidence ?? []).map(interpolate),
    options: node.options
      .filter((option) => !option.showIf || option.showIf(values))
      .map((option) => ({ id: option.id, label: interpolate(option.label) })),
  };
}

function mapActionNode(node: ActionNode, interpolate: (t: string) => string): FrontendTreeStep {
  return {
    id: node.id,
    kind: "action",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    actions: node.actions.map(interpolate),
    canContinue: true,
  };
}

function mapInputNode(
  node: InputNode,
  rawValues: Record<string, string>,
  interpolate: (t: string) => string
): FrontendTreeStep {
  const canContinue = node.fields.every(
    (f) => f.optional || (rawValues[f.id] !== undefined && rawValues[f.id] !== "")
  );
  return {
    id: node.id,
    kind: "input",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    intro: node.intro ? interpolate(node.intro) : undefined,
    fields: node.fields,
    values: { ...rawValues },
    canContinue,
  };
}

function mapTransitionNode(
  node: TransitionNode,
  interpolate: (t: string) => string
): FrontendTreeStep {
  return {
    id: node.id,
    kind: "transition",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    disposition: node.disposition,
    exitCriteria: node.exitCriteria.map(interpolate),
    targets: [...node.targets],
  };
}
