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
    else if (/decision-tree\.tsx?$/.test(entry.name) || /-tree\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const rows = [];
for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8");
  if (!/DecisionTreeDefinition/.test(text)) continue;
  const protocolId = (text.match(/\bid:\s*["']([^"']+)["']\s*,\s*\n\s*version:/) || [])[1];
  if (!protocolId) continue;

  const dispositions = [...text.matchAll(/disposition:\s*["'](discharge|observation|icu|other_module)["']/g)].map((m) => m[1]);
  const unique = [...new Set(dispositions)];
  const clinical = unique.filter((d) => d !== "other_module");
  rows.push({
    file: path.relative(root, file),
    protocolId,
    clinicalDisposition: clinical,
    hasOtherModule: unique.includes("other_module"),
  });
}

rows.sort((a, b) => a.protocolId.localeCompare(b.protocolId));
console.log("\nInventário de terminais por módulo\n");
for (const row of rows) {
  const clinical = row.clinicalDisposition.length ? row.clinicalDisposition.join(",") : "NENHUM";
  console.log(`${row.protocolId} | ${row.file} | destino=${clinical} | other_module=${row.hasOtherModule ? "sim" : "não"}`);
}

const withoutClinical = rows.filter((row) => row.clinicalDisposition.length === 0);
console.log(`\nÁrvores encontradas: ${rows.length}`);
console.log(`Sem destino assistencial explícito: ${withoutClinical.length}`);
for (const row of withoutClinical) console.log(`REVISAR: ${row.protocolId} | ${row.file}`);

// Inventário: não falha o build. A classificação humana decide se o módulo é
// care_pathway (destino obrigatório) ou procedural_subflow (retorno obrigatório).
process.exit(0);
