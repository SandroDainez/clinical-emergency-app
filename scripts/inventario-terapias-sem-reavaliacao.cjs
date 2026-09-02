#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ignored = new Set(["node_modules", ".git", ".expo", "dist", "build"]);
const therapyTerms = /\b(tromb[oó]lise|alteplase|tenecteplase|adrenalina|epinefrina|amiodarona|cardiovers[aã]o|desfibrila[cç][aã]o|intuba[cç][aã]o|rocur[oô]nio|succinilcolina|vasopressor|norepinefrina|noradrenalina)\b/i;
const reassessmentTerms = /\b(reavali|recheck|repetir|resposta|ritmo|hemodin|monitor|p[oó]s[- ]|destino|uti|observa[cç][aã]o)\b/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/decision-tree\.tsx?$/.test(entry.name) || /decision-flow\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const findings = [];
for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8");
  const blocks = text.split(/\n\s*(?=[A-Za-z0-9_]+:\s*\{)/g);
  for (const block of blocks) {
    if (!/type:\s*["']action["']/.test(block)) continue;
    if (!therapyTerms.test(block)) continue;
    const id = (block.match(/^\s*([A-Za-z0-9_]+):\s*\{/) || [])[1] || "(id não extraído)";
    const next = (block.match(/\bnext:\s*["']([^"']+)["']/) || [])[1];
    const hasReassessmentLanguage = reassessmentTerms.test(block);
    findings.push({ file: path.relative(root, file), id, next, hasReassessmentLanguage });
  }
}

console.log("\nInventário — terapias críticas e sinal de reavaliação\n");
console.log(`Nós candidatos: ${findings.length}\n`);
for (const item of findings) {
  const marker = item.hasReassessmentLanguage ? "OK?" : "REVISAR";
  console.log(`${marker} ${item.file} :: ${item.id} -> ${item.next || "sem next literal"}`);
}

// Inventário, não gate: presença de palavra de reavaliação não prova que o fluxo
// realmente chega a um nó de reavaliação. A próxima etapa cruza isto com o grafo.
process.exit(0);
