#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const avc = fs.readFileSync("avc-decision-tree.ts", "utf8");
const bindings = fs.readFileSync("lib/clinical-decision-observation-bindings.ts", "utf8");
const bridge = fs.readFileSync("lib/clinical-runtime-bridge.ts", "utf8");

for (const option of ["isquemico", "hic", "hsa"]) {
  assert.match(avc, new RegExp(`\\{ id: "${option}"[^}]*next:`), `tc_resultado perdeu opção ${option}`);
  assert.match(bindings, new RegExp(`nodeId: "tc_resultado"[\\s\\S]*?optionId: "${option}"`), `binding ausente para ${option}`);
}

assert.match(bindings, /optionId: "isquemico"[\s\S]*?observation: \{ id: "hemorragia_intracraniana_aguda", value: "nao" \}/);
assert.match(bindings, /optionId: "hic"[\s\S]*?observation: \{ id: "hemorragia_intracraniana_aguda", value: "sim" \}/);
assert.match(bindings, /optionId: "hsa"[\s\S]*?observation: \{ id: "hemorragia_intracraniana_aguda", value: "sim" \}/);
assert.match(bridge, /decisionObservationFor\(\{/);
assert.match(bridge, /if \(boundObservation\) \{[\s\S]*?recordFlowObservation\(\{/);

// O bridge pode observar uma decisão explicitamente vinculada, mas continua sem
// importar árvore/engine/router nem decidir o destino.
assert.doesNotMatch(bridge, /DecisionTreeEngine|engine\.choose|engine\.advance|router\./);

console.log("Decision observation bindings conferem com opções reais da TC e preservam fronteira observacional.");
