#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ignored = new Set(["node_modules", ".git", ".expo", "dist", "web-build"]);
const extensions = new Set([".ts", ".tsx", ".js", ".cjs", ".json"]);
const patterns = [
  { id: "amiodarona_pcr_300", re: /amiodarona[^\n]{0,100}300\s*mg|300\s*mg[^\n]{0,100}amiodarona/gi },
  { id: "amiodarona_pulso_150", re: /amiodarona[^\n]{0,100}150\s*mg|150\s*mg[^\n]{0,100}amiodarona/gi },
  { id: "tnk_avc_025", re: /(?:tenecteplase|TNK)[^\n]{0,120}0[,.]25\s*mg\/kg/gi },
  { id: "alteplase_avc_09", re: /alteplase[^\n]{0,120}0[,.]9\s*mg\/kg/gi },
  { id: "rocuronio", re: /rocur[oô]nio[^\n]{0,120}\d[,.]?\d*\s*mg\/kg/gi },
  { id: "succinilcolina", re: /succinilcolina[^\n]{0,120}\d[,.]?\d*\s*mg\/kg/gi },
];

const hits = new Map(patterns.map((p) => [p.id, []]));

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!extensions.has(path.extname(entry.name))) continue;
    const rel = path.relative(root, full);
    if (rel.startsWith("scripts" + path.sep + "inventario-doses-criticas-duplicadas")) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const pattern of patterns) {
      pattern.re.lastIndex = 0;
      if (pattern.re.test(text)) hits.get(pattern.id).push(rel);
    }
  }
}

walk(root);
console.log("\nInventário — doses críticas potencialmente duplicadas\n");
for (const pattern of patterns) {
  const files = [...new Set(hits.get(pattern.id))].sort();
  console.log(`${pattern.id}: ${files.length} arquivo(s)`);
  files.forEach((file) => console.log(`  - ${file}`));
}
console.log("\nEste inventário mede duplicação; não altera conduta e não falha o build.");
