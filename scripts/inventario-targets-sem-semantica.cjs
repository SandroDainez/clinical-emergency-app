#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");

function getProtocolId(texto) {
  const m = texto.match(/export\s+const\s+\w+\s*:\s*DecisionTreeDefinition\s*=\s*\{[\s\S]{0,1600}?\bid\s*:\s*["']([^"']+)["']/);
  return m?.[1] ?? null;
}

function getNodes(texto) {
  const starts = [...texto.matchAll(/^    ([A-Za-z0-9_]+):\s*\{/gm)];
  return starts.map((m, i) => ({
    id: m[1],
    text: texto.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : texto.length),
  }));
}

function getDisposition(node) {
  return node.match(/\bdisposition\s*:\s*["']([^"']+)["']/)?.[1] ?? null;
}

function getTargets(node) {
  return [...node.matchAll(/\bmoduleId\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

function registryHas(protocolId, nodeId, target) {
  const blocks = [...registry.matchAll(/\{[\s\S]*?\bfromProtocolId\s*:\s*["']([^"']+)["'][\s\S]*?\bfromNodeId\s*:\s*["']([^"']+)["'][\s\S]*?\btargetModuleId\s*:\s*["']([^"']+)["'][\s\S]*?\}/g)];
  return blocks.some((m) => m[1] === protocolId && m[2] === nodeId && m[3] === target);
}

const uncovered = [];
const handoffSurface = [];
let classified = 0;

for (const entrada of fs.readdirSync(raiz, { withFileTypes: true })) {
  if (!entrada.isFile() || !/-tree\.ts$/.test(entrada.name)) continue;
  const texto = fs.readFileSync(path.join(raiz, entrada.name), "utf8");
  if (!texto.includes("DecisionTreeDefinition")) continue;
  const protocolId = getProtocolId(texto);
  if (!protocolId) continue;

  for (const node of getNodes(texto)) {
    const disposition = getDisposition(node.text);
    if (!disposition) continue;
    const targets = [...new Set(getTargets(node.text))];
    if (!targets.length) continue;

    for (const target of targets) {
      if (["icu", "observation", "discharge"].includes(disposition)) {
        if (registryHas(protocolId, node.id, target)) classified += 1;
        else uncovered.push({ file: entrada.name, protocolId, nodeId: node.id, disposition, target });
      } else if (disposition === "other_module") {
        handoffSurface.push({ file: entrada.name, protocolId, nodeId: node.id, target });
      }
    }
  }
}

console.log(`\nTargets terminais com semântica registrada: ${classified}`);
console.log(`Targets dentro de superfícies other_module (auditados separadamente): ${handoffSurface.length}`);
for (const item of handoffSurface) {
  console.log(`  ↪ ${item.protocolId}/${item.nodeId} -> ${item.target}`);
}

if (uncovered.length) {
  console.error(`\n❌ ${uncovered.length} target(s) em destinos assistenciais ainda sem semântica:\n`);
  for (const item of uncovered) {
    console.error(`- ${item.file}: ${item.protocolId}/${item.nodeId} [${item.disposition}] -> ${item.target}`);
  }
  process.exit(1);
}

console.log("\n✅ Nenhum target em UTI/observação/alta ficou sem contrato semântico.\n");
