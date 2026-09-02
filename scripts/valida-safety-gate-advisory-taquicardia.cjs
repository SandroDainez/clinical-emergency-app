#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const types = fs.readFileSync("core/decision-tree/types.ts", "utf8");
const engine = fs.readFileSync("core/decision-tree/engine.ts", "utf8");
const tree = fs.readFileSync("acls-tachycardia-tree.ts", "utf8");
const shell = fs.readFileSync("components/protocol-screen/acls-decision-flow-screen.tsx", "utf8");
const actionAdapter = fs.readFileSync("components/protocol-screen/clinical-action-step-adapter.tsx", "utf8");
const actionCard = fs.readFileSync("components/protocol-screen/clinical-action-step-card.tsx", "utf8");

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

// O piloto é advisory: a ação continua disponível sem depender de dismiss ou
// override. Depois da extração da apresentação para UI v2, o shell não contém
// mais o <Card> diretamente: ele deve manter SafetyGate ANTES do adapter, o
// adapter deve encaminhar o mesmo onAdvance e o card isolado deve continuar
// crítico e acionável. Esta cadeia protege a arquitetura atual sem acoplar o
// teste à implementação visual antiga do shell.
const actionStep = shell.match(/function ActionStep\([\s\S]*?\n}\n\n\/\*\*/)?.[0] ?? shell;
assert.match(actionStep, /<SafetyGate[\s\S]*?<ClinicalActionStepAdapter/);
assert.match(actionStep, /<ClinicalActionStepAdapter[\s\S]*?onAdvance=\{onAdvance\}/);
assert.match(actionAdapter, /<ClinicalActionStepCard[\s\S]*?onAdvance=\{onAdvance\}/);
assert.match(actionCard, /<Card tom="critical"/);
assert.match(actionCard, /onPress=\{onAdvance\}/);
assert.doesNotMatch(actionStep, /if \(advisory\) return/);
assert.doesNotMatch(actionStep, /overrideClinicalGate/);

console.log("SafetyGate advisory de cardioversão permanece visível antes da conduta, sem bloquear a ação ou exigir override.");
