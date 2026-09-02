const fs = require("node:fs");
const assert = require("node:assert/strict");

const read = (path) => fs.readFileSync(path, "utf8");
const avc = read("avc-decision-tree.ts");
const sca = read("coronary-decision-tree.ts");
const registry = read("lib/guided-discovery-registry.ts");
const types = read("core/decision-tree/types.ts");
const engine = read("core/decision-tree/engine.ts");
const shell = read("components/protocol-screen/acls-decision-flow-screen.tsx");

assert.match(types, /guidedDiscoveryOrigin\?: string/);
assert.match(engine, /guidedDiscoveryOrigin: node\.guidedDiscoveryOrigin/);
assert.match(shell, /GuidedDiscoveryCard/);
assert.match(shell, /guidedDiscoveryViewModel\(protocolId, step\.guidedDiscoveryOrigin\)/);
assert.match(shell, /onReturn=\{onAdvance\}/);

assert.match(avc, /\{ id: "nao_sei", label: "Não sei — me ajude", next: "hic_anticoag_descoberta" \}/);
assert.match(avc, /hic_anticoag_descoberta:[\s\S]*?guidedDiscoveryOrigin: "hic_anticoag"[\s\S]*?next: "hic_anticoag"/);
assert.match(registry, /protocolId: "avc"[\s\S]*?decisionNodeId: "hic_anticoag"[\s\S]*?mode: "existing_node"[\s\S]*?guidedNodeId: "hic_anticoag_descoberta"/);

assert.match(sca, /\{ id: "nao_sei", label: "Não sei — me ajude", next: "stemi_reperfusao_descoberta" \}/);
assert.match(sca, /stemi_reperfusao_descoberta:[\s\S]*?guidedDiscoveryOrigin: "stemi_reperfusao"[\s\S]*?next: "stemi_reperfusao"/);
assert.match(registry, /protocolId: "sindromes-coronarianas"[\s\S]*?decisionNodeId: "stemi_reperfusao"[\s\S]*?mode: "existing_node"[\s\S]*?guidedNodeId: "stemi_reperfusao_descoberta"/);

// A camada visual não pode duplicar as instruções clínicas do registry.
assert.doesNotMatch(shell, /TP\/INR|anti-Xa|hemodinâmica\/central de transferência confirmou/);

console.log("guided discovery HIC/STEMI structural contracts: OK");
