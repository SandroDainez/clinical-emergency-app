#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const inventory = fs.readFileSync(path.join(root, "scripts/inventario-decisoes-sem-nao-sei.cjs"), "utf8");
const tachy = fs.readFileSync(path.join(root, "acls-tachycardia-tree.ts"), "utf8");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const tep = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");

if (!inventory.includes("id:\\s*[\"']guiado[\"']")) {
  throw new Error("Inventário não reconhece opção guiada como saída de incerteza.");
}
if (!inventory.includes("OPCAO_GUIADA")) {
  throw new Error("Inventário não reconhece o rótulo canônico OPCAO_GUIADA.");
}

const realGuidedEdges = [
  [tachy, 'id: "guiado"', 'next: "tqi_dados"'],
  [shock, 'id: "guiado"', 'next: "choque_dados"'],
  [tep, 'id: "guiado"', 'next: "tep_instab_dados"'],
];
for (const [text, idToken, nextToken] of realGuidedEdges) {
  if (!text.includes(idToken) || !text.includes(nextToken)) {
    throw new Error(`Aresta guiada real ausente: ${idToken} -> ${nextToken}`);
  }
}

console.log("Inventário reconhece caminhos guiados sem apagar a validação das arestas reais.");
