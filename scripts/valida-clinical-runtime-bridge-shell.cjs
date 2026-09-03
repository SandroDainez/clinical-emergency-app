#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const shell = fs.readFileSync("components/protocol-screen/acls-decision-flow-screen.tsx", "utf8");
const bridge = fs.readFileSync("lib/clinical-runtime-bridge.ts", "utf8");

assert.match(shell, /recordFlowAdvance, recordFlowDecision, recordFlowObservation/);

// Decisão: registra a escolha no ponto em que ela é confirmada, antes de perder
// a identidade do nó atual. O bridge continua sem poder de navegação.
assert.match(
  shell,
  /const currentNodeId = engine\.getCurrentNode\(\)\.id;[\s\S]*?const next = engine\.choose\(optionId\);[\s\S]*?recordFlowDecision\(\{/
);

// Ação: avançar captura o nó que acabou de ser executado e registra o evento.
// Não exigimos variáveis intermediárias sem valor semântico (ex.: getValues),
// porque isso tornava a trava dependente da forma e não do comportamento.
const advanceBlock = shell.match(/const handleAdvance = \(\) => \{[\s\S]*?\n  \};/);
assert.ok(advanceBlock, "handleAdvance ausente");
assert.match(advanceBlock[0], /const currentNode = engine\.getCurrentNode\(\);/);
assert.match(advanceBlock[0], /const next = engine\.advance\(\);/);
assert.match(advanceBlock[0], /currentNode\.type === "action"[\s\S]*?recordFlowAdvance\(\{/);

// Input: a observação nasce quando o valor é confirmado no campo. Regravá-la no
// avanço mudaria recordedAt e faria um dado antigo parecer novo, portanto é uma
// regressão de segurança temporal.
const setValueBlock = shell.match(/const handleSetValue = \(fieldId: string, value: string\) => \{[\s\S]*?\n  \};/);
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

// O runtime bridge observa e audita; nunca decide nem navega.
assert.doesNotMatch(bridge, /DecisionTreeEngine|engine\.choose|engine\.advance|router\./);

console.log("Clinical Runtime Bridge no shell: decisão/ação/input instrumentados no ponto semântico correto, sem adulterar timestamps.");
