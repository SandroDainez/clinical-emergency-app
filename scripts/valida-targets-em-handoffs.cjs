#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const transitions = fs.readFileSync(path.join(raiz, "lib/clinical-transition-contracts.ts"), "utf8");
const contextual = fs.readFileSync(path.join(raiz, "lib/clinical-handoff-target-semantics.ts"), "utf8");

function getProtocolId(texto) {
  return texto.match(/export\s+const\s+\w+\s*:\s*DecisionTreeDefinition\s*=\s*\{[\s\S]{0,1600}?\bid\s*:\s*["']([^"']+)["']/)?.[1] ?? null;
}

function getNodes(texto) {
  const starts = [...texto.matchAll(/^    ([A-Za-z0-9_]+):\s*\{/gm)];
  return starts.map((m, i) => ({
    id: m[1],
    text: texto.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : texto.length),
  }));
}

function getTargets(texto) {
  return [...new Set([...texto.matchAll(/\bmoduleId\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]))];
}

function hasModuleTransition(from, to) {
  return [...transitions.matchAll(/\{[\s\S]*?\bfrom\s*:\s*["']([^"']+)["'][\s\S]*?\bto\s*:\s*["']([^"']+)["'][\s\S]*?\bdestinationKind\s*:\s*["']([^"']+)["'][\s\S]*?\}/g)]
    .some((m) => m[1] === from && m[2] === to && m[3] === "module");
}

function hasContextContract(protocolId, nodeId, target) {
  return [...contextual.matchAll(/\{[\s\S]*?\bfromProtocolId\s*:\s*["']([^"']+)["'][\s\S]*?\bfromNodeId\s*:\s*["']([^"']+)["'][\s\S]*?\btargetModuleId\s*:\s*["']([^"']+)["'][\s\S]*?\}/g)]
    .some((m) => m[1] === protocolId && m[2] === nodeId && m[3] === target);
}

const failures = [];
let destinations = 0;
let contextTargets = 0;

for (const entry of fs.readdirSync(raiz, { withFileTypes: true })) {
  if (!entry.isFile() || !/-tree\.ts$/.test(entry.name)) continue;
  const text = fs.readFileSync(path.join(raiz, entry.name), "utf8");
  if (!text.includes("DecisionTreeDefinition")) continue;
  const protocolId = getProtocolId(text);
  if (!protocolId) continue;

  for (const node of getNodes(text)) {
    if (!/\bdisposition\s*:\s*["']other_module["']/.test(node.text)) continue;
    const targets = getTargets(node.text);
    for (const target of targets) {
      if (hasModuleTransition(protocolId, target)) {
        destinations += 1;
        continue;
      }
      if (hasContextContract(protocolId, node.id, target)) {
        contextTargets += 1;
        continue;
      }
      failures.push(`${entry.name}: ${protocolId}/${node.id} -> ${target} não é destino de contrato nem target contextual classificado`);
    }
  }
}

if (failures.length) {
  console.error("\n❌ Targets dentro de handoffs sem classificação:\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

if (contextTargets !== 3) {
  console.error(`\n❌ Esperados 3 targets contextuais explícitos; encontrados ${contextTargets}.\n`);
  process.exit(1);
}

console.log(`\n✅ Targets em handoffs cobertos: ${destinations} destino(s) canônico(s) + ${contextTargets} target(s) contextual(is).\n`);
