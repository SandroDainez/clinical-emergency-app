#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const tox = fs.readFileSync(path.join(root, "poisoning-decision-tree.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };
const block = tox.match(/tox_alcool_toxico:\s*\{[\s\S]*?\n\s*},\n/m)?.[0] ?? "";
expect(block !== "", "nó tox_alcool_toxico não localizado");
expect(block.includes("Carvão ativado não tem papel em metanol/etilenoglicol."), "summary não separa carvão ativado dos demais métodos");
expect(block.includes("Lavagem gástrica não é recomendada rotineiramente; benefício não demonstrado."), "summary não reflete posição atual sobre lavagem gástrica");
expect(!block.includes("NÃO fazer carvão nem lavagem"), "frase absoluta antiga permaneceu no nó");
if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ Álcool tóxico: carvão sem papel; lavagem não rotineira e sem benefício demonstrado.");
