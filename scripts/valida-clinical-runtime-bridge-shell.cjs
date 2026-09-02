#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const shell = fs.readFileSync("components/protocol-screen/acls-decision-flow-screen.tsx", "utf8");
const bridge = fs.readFileSync("lib/clinical-runtime-bridge.ts", "utf8");

assert.match(shell, /recordFlowAdvance, recordFlowDecision, recordFlowObservation/);
assert.match(shell, /const currentNodeId = engine\.getCurrentNode\(\)\.id;[\s\S]*?const next = engine\.choose\(optionId\);[\s\S]*?recordFlowDecision\(\{/);
assert.match(shell, /const currentNode = engine\.getCurrentNode\(\);[\s\S]*?const currentValues = engine\.getValues\(\);[\s\S]*?const next = engine\.advance\(\);/);
assert.match(shell, /currentNode\.type === "action"[\s\S]*?recordFlowAdvance\(\{/);
assert.match(shell, /currentNode\.type === "input"[\s\S]*?for \(const field of currentNode\.fields\)[\s\S]*?recordFlowObservation\(\{/);
assert.match(shell, /recordFlowObservation\([\s\S]*?fieldId: field\.id,[\s\S]*?unit: field\.unit/);

const setValueBlock = shell.match(/const handleSetValue = \(fieldId: string, value: string\) => \{[\s\S]*?\n  \};/);
assert.ok(setValueBlock, "handleSetValue ausente");
assert.doesNotMatch(setValueBlock[0], /recordFlowObservation/, "slider/digitação não deve gravar observação a cada mudança");

assert.doesNotMatch(bridge, /DecisionTreeEngine|engine\.choose|engine\.advance|router\./);

console.log("Clinical Runtime Bridge no shell: eventos/observações instrumentados sem poder de decisão e sem flooding por slider.");
