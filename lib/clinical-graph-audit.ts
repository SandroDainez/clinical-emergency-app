import type { DecisionTreeDefinition, DecisionTreeNode, ProximoNo } from "../core/decision-tree/types";

function nextIds(node: DecisionTreeNode): string[] {
  if (node.type === "decision") return node.options.map((option) => option.next);
  if (node.type === "action" || node.type === "input") {
    const next: ProximoNo = node.next;
    return typeof next === "string" ? [next] : [...next.possiveis];
  }
  return [];
}

export function reachableNodeIds(tree: DecisionTreeDefinition, startId = tree.entryNodeId): string[] {
  const visited = new Set<string>();
  const queue = [startId];

  while (queue.length) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    const node = tree.nodes[id];
    if (!node) continue;
    visited.add(id);
    for (const next of nextIds(node)) if (!visited.has(next)) queue.push(next);
  }

  return [...visited];
}

export function findReachableNodes(
  tree: DecisionTreeDefinition,
  predicate: (node: DecisionTreeNode) => boolean,
  startId = tree.entryNodeId
): string[] {
  return reachableNodeIds(tree, startId).filter((id) => {
    const node = tree.nodes[id];
    return Boolean(node && predicate(node));
  });
}

export function findReassessmentNodes(tree: DecisionTreeDefinition): string[] {
  const pattern = /(reavali|reassess|resposta|response)/i;
  return findReachableNodes(tree, (node) => {
    const text = [node.id, node.title, "summary" in node ? node.summary : undefined]
      .filter(Boolean)
      .join(" ");
    return pattern.test(text);
  });
}

export function findDispositionNodes(tree: DecisionTreeDefinition): string[] {
  const pattern = /(alta|uti|observa|transfer|intern|destino|disposition|hemodin|centro cir)/i;
  return findReachableNodes(tree, (node) => {
    if (node.type !== "transition") return false;
    const text = [node.id, node.title, node.summary, ...node.targets.map((target) => target.label)]
      .filter(Boolean)
      .join(" ");
    return pattern.test(text);
  });
}

export function auditReassessmentAndDisposition(tree: DecisionTreeDefinition): string[] {
  const issues: string[] = [];
  if (!findReassessmentNodes(tree).length) {
    issues.push(`${tree.id}: nenhum nó alcançável de reavaliação foi detectado`);
  }
  if (!findDispositionNodes(tree).length) {
    issues.push(`${tree.id}: nenhum nó alcançável de destino foi detectado`);
  }
  return issues;
}
