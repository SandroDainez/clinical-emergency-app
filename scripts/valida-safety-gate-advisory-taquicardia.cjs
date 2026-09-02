#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const types = fs.readFileSync("core/decision-tree/types.ts", "utf8");
const engine = fs.readFileSync("core/decision-tree/engine.ts", "utf8");
const tree = fs.readFileSync("acls-tachycardia-tree.ts", "utf8");
const shell = fs.readFileSync("components/protocol-screen/acls-decision-flow-screen.tsx", "utf8");

assert.match(types, /clinicalActionId\?: string/);
assert.match(engine, /clinicalActionId: node\.clinicalActionId/);
assert.match(tree, /unstable_cardioversion:[\s\S]*?clinicalActionId: "cardioversao_sincronizada"/);
assert.match(shell, /SafetyGate/);
assert.match(shell, /evaluateClinicalActionAttemptFromPatientState/);
assert.match(shell, /step\.clinicalActionId && protocolId/);
assert.match(shell, /actionId: step\.clinicalActionId/);
assert.match(shell, /actionGate\?\.decision\.advisories/);
assert.match(shell, /Entendido — manter cardioversão sem atraso/);
assert.match(shell, /onPrimary=\{\(\) => setDismissedAdvisoryId\(advisory\.policy\.id\)\}/);

// O piloto é advisory: o card clínico e o avanço continuam renderizados sem
// depender de dismiss/override. Não pode haver lógica que condicione onAdvance.
const actionStep = shell.match(/function ActionStep\([\s\S]*?\n}\n\n\/\*\*/)?.[0] ?? shell;
assert.match(actionStep, /<SafetyGate[\s\S]*?<Card tom="critical"/);
assert.match(actionStep, /onPress=\{onAdvance\}/);
assert.doesNotMatch(actionStep, /if \(advisory\) return/);
assert.doesNotMatch(actionStep, /overrideClinicalGate/);

console.log("SafetyGate advisory de cardioversão permanece visível sem bloquear a ação ou exigir override.");
