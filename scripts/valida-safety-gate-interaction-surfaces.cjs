#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const triggerRegistry = read("lib/clinical-gate-trigger-registry.ts");
const policyRegistry = read("lib/clinical-gate-registry.ts");
const avc = read("avc-decision-tree.ts");
const tachy = read("acls-tachycardia-tree.ts");
const coronary = read("coronary-decision-tree.ts");
const issues = [];
const expect = (ok, message) => { if (!ok) issues.push(message); };

const cases = [
  {
    label: "AVC trombólise",
    gateId: "avc-ivt-hemorragia-aguda",
    interactionKind: "action",
    nodeId: "trombolise",
    actionId: "administrar_trombolise_iv",
    tree: avc,
    nodePattern: /trombolise:\s*\{[\s\S]*?id: "trombolise"[\s\S]*?type: "action"[\s\S]*?clinicalActionId: "administrar_trombolise_iv"/,
  },
  {
    label: "STEMI reperfusão",
    gateId: "sca-tempo-icp-nao-confirmado",
    interactionKind: "decision",
    nodeId: "stemi_reperfusao",
    actionId: "definir_estrategia_reperfusao",
    tree: coronary,
    nodePattern: /stemi_reperfusao:\s*\{[\s\S]*?id: "stemi_reperfusao"[\s\S]*?type: "decision"[\s\S]*?options:\s*\[[\s\S]*?id: "icp"[^\n]*clinicalActionId: "definir_estrategia_reperfusao"[\s\S]*?id: "fibrino"[^\n]*clinicalActionId: "definir_estrategia_reperfusao"/,
  },
  {
    label: "Taquicardia cardioversão",
    gateId: "taquicardia-sedacao-cardioversao",
    interactionKind: "action",
    nodeId: "unstable_cardioversion",
    actionId: "cardioversao_sincronizada",
    tree: tachy,
    nodePattern: /unstable_cardioversion:\s*\{[\s\S]*?id: "unstable_cardioversion"[\s\S]*?type: "action"[\s\S]*?clinicalActionId: "cardioversao_sincronizada"/,
  },
];

for (const item of cases) {
  const escapedGate = item.gateId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedNode = item.nodeId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedAction = item.actionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const triggerPattern = new RegExp(
    `gateId: "${escapedGate}"[\\s\\S]*?nodeId: "${escapedNode}"[\\s\\S]*?interactionKind: "${item.interactionKind}"[\\s\\S]*?actionId: "${escapedAction}"`
  );
  expect(triggerPattern.test(triggerRegistry), `${item.label}: trigger não preserva superfície/nó/actionId`);
  expect(item.nodePattern.test(item.tree), `${item.label}: árvore real não corresponde à superfície declarada`);
  expect(policyRegistry.includes(`id: "${item.gateId}"`), `${item.label}: policy ausente`);
}

const policyIds = [...policyRegistry.matchAll(/\n\s*id: "([^"]+)",\n\s*protocolId:/g)].map((m) => m[1]);
const gateIds = [...triggerRegistry.matchAll(/gateId: "([^"]+)"/g)].map((m) => m[1]);
for (const policyId of policyIds) {
  expect(gateIds.includes(policyId), `Policy ${policyId} ficou sem trigger`);
}
for (const gateId of new Set(gateIds)) {
  expect(policyIds.includes(gateId), `Trigger aponta para policy inexistente ${gateId}`);
}

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log(`✅ SafetyGate surfaces: ${cases.length} pilotos coerentes; ${policyIds.length} policies cobertas sem órfãs.`);
