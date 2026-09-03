#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const flowShell = fs.readFileSync("components/protocol-screen/acls-decision-flow-screen.tsx", "utf8");
const sharedShell = fs.readFileSync("components/ui-v2/clinical-shell-host.tsx", "utf8");
const bridge = fs.readFileSync("lib/clinical-runtime-bridge.ts", "utf8");
const session = fs.readFileSync("lib/clinical-session-runtime.ts", "utf8");

assert.match(flowShell, /recordFlowAdvance, recordFlowDecision, recordFlowObservation/);

// Decisão: registra a escolha no ponto em que ela é confirmada, antes de perder
// a identidade do nó atual. O bridge continua sem poder de navegação.
assert.match(
  flowShell,
  /const currentNodeId = engine\.getCurrentNode\(\)\.id;[\s\S]*?const next = engine\.choose\(optionId\);[\s\S]*?recordFlowDecision\(\{/
);

// Ação: avançar captura o nó que acabou de ser executado e registra o evento.
const advanceBlock = flowShell.match(/const handleAdvance = \(\) => \{[\s\S]*?\n  \};/);
assert.ok(advanceBlock, "handleAdvance ausente");
assert.match(advanceBlock[0], /const currentNode = engine\.getCurrentNode\(\);/);
assert.match(advanceBlock[0], /const next = engine\.advance\(\);/);
assert.match(advanceBlock[0], /currentNode\.type === "action"[\s\S]*?recordFlowAdvance\(\{/);

// Input: a observação nasce quando o valor é confirmado no campo. Regravá-la no
// avanço mudaria recordedAt e faria um dado antigo parecer novo.
const setValueBlock = flowShell.match(/const handleSetValue = \(fieldId: string, value: string\) => \{[\s\S]*?\n  \};/);
assert.ok(setValueBlock, "handleSetValue ausente");
assert.match(setValueBlock[0], /recordFlowObservation\(\{/);
assert.match(setValueBlock[0], /fieldId,/);
assert.match(setValueBlock[0], /value,/);
assert.match(setValueBlock[0], /unit: field\?\.unit/);
assert.doesNotMatch(
  advanceBlock[0],
  /recordFlowObservation\(/,
  "handleAdvance não pode regravar observações e adulterar a idade do dado"
);

// Lifecycle do atendimento: o caso nasce depois de limpar o log anterior e o
// primeiro ingresso de cada módulo é observado pelo shell compartilhado.
assert.match(session, /clearClinicalEventLog\(\);[\s\S]*?recordClinicalCaseStarted\(\{ caseId: id, now \}\);/);
assert.match(bridge, /export function recordClinicalCaseStarted/);
assert.match(bridge, /type: "case_started"/);
assert.match(bridge, /export function recordProtocolStarted/);
assert.match(bridge, /event\.type === "protocol_started" && event\.module === module/);
assert.match(bridge, /type: "protocol_started"/);
assert.match(sharedShell, /recordProtocolStarted/);
assert.match(
  sharedShell,
  /useEffect\(\(\) => \{[\s\S]*?if \(!moduleSlug\) return;[\s\S]*?recordProtocolStarted\(\{ module: moduleSlug, label: protocol \}\);[\s\S]*?\}, \[moduleSlug, protocol\]\);/
);
assert.match(sharedShell, /resolveClinicalResume\(moduleSlug\)/);
assert.match(bridge, /type: "protocol_resumed"/);

// O runtime bridge observa e audita; nunca decide nem navega.
assert.doesNotMatch(bridge, /DecisionTreeEngine|engine\.choose|engine\.advance|router\./);

console.log("Clinical Runtime Bridge integrado: decisão/ação/input + lifecycle de caso/protocolo no shell compartilhado, sem navegação ou decisão clínica.");
