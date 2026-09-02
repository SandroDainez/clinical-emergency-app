#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ignored = new Set(["node_modules", ".git", ".expo", "dist", "build"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/decision-tree\.tsx?$/.test(entry.name) || /decision-flow\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(root);
const findings = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  // Inventário deliberadamente conservador: procura blocos textuais de decisão
  // e marca os que não contêm nenhum id/rótulo reconhecível de incerteza.
  const blocks = text.split(/\n\s*(?=[A-Za-z0-9_]+:\s*\{)/g);
  for (const block of blocks) {
    if (!/type:\s*["']decision["']/.test(block)) continue;
    const id = (block.match(/^\s*([A-Za-z0-9_]+):\s*\{/) || [])[1] || "(id não extraído)";
    const hasUnknown = /(nao_sei|não sei|nao sei|incerto|indeterminado|não consigo avaliar|nao consigo avaliar)/i.test(block);
    if (!hasUnknown) {
      findings.push({
        file: path.relative(root, file),
        id,
      });
    }
  }
}

console.log("\nInventário — decisões potencialmente sem ramo de incerteza\n");
console.log(`Arquivos examinados: ${files.length}`);
console.log(`Decisões para revisão humana: ${findings.length}\n`);
for (const item of findings) console.log(`${item.file} :: ${item.id}`);

// Inventário não falha o build: alguns nós são legitimamente binários porque a
// pergunta é observável diretamente. A saída serve de fila para classificação
// clínica posterior em obrigatório / dispensável / já guiado em outro nó.
process.exit(0);
