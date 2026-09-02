#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const tree = read("avc-decision-tree.ts");
const shell = read("components/protocol-screen/acls-decision-flow-screen.tsx");
const registry = read("lib/clinical-gate-registry.ts");
const triggers = read("lib/clinical-gate-trigger-registry.ts");
const issues = [];

function expect(condition, message) {
  if (!condition) issues.push(message);
}

expect(
  /trombolise:\s*\{[\s\S]*?id: "trombolise"[\s\S]*?type: "action"[\s\S]*?clinicalActionId: "administrar_trombolise_iv"/.test(tree),
  "AVC: nó trombolise não declara clinicalActionId administrar_trombolise_iv"
);
expect(
  /id: "avc-ivt-hemorragia-aguda"[\s\S]*?nodeId: "trombolise"[\s\S]*?level: "hard_stop"[\s\S]*?resolutionNodeId: "tc_resultado"/.test(registry),
  "AVC: policy hard stop não está ancorada em trombolise com resolução tc_resultado"
);
expect(
  /id: "avc-ivt-when-acute-hemorrhage"[\s\S]*?nodeId: "trombolise"[\s\S]*?actionId: "administrar_trombolise_iv"/.test(triggers),
  "AVC: trigger não está centrado na ação de trombólise"
);
expect(shell.includes("const hardStop = actionGate?.decision.hardStops[0];"), "Shell: hard stop não é selecionado da decisão de gate");
expect(shell.includes("if (hardStop)"), "Shell: hard stop não interrompe a renderização da conduta");
expect(shell.includes('severity="critical"'), "Shell: hard stop não usa apresentação crítica");
expect(shell.includes("hardStop.policy.resolutionNodeId"), "Shell: resolução do hard stop não vem da policy");
expect(shell.includes("onResolveGate(resolutionNodeId)"), "Shell: saída segura não navega pelo resolutionNodeId declarado");
expect(shell.includes("onResolveGate={handleGateResolution}"), "Shell: ActionStep não recebe handler de resolução");
expect(shell.includes("engine.goToNode(nodeId)"), "Shell: resolução não usa navegação explícita do engine");

const hardStopIndex = shell.indexOf("if (hardStop)");
const actionCardIndex = shell.indexOf('<Card tom="critical" style={v.cartao}>', hardStopIndex);
expect(hardStopIndex >= 0 && actionCardIndex > hardStopIndex, "Shell: hard stop precisa ser avaliado antes do card de conduta/dose");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}

console.log("✅ AVC hard stop visual: ação real, bloqueio sem override e retorno seguro declarativo.");
