#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cases = [
  ["anaphylaxis-decision-tree.ts", "immediate_im_epinephrine", "severity_stratification"],
  ["rsi-decision-tree.ts", "intubacao", "confirmacao"],
  ["avc-decision-tree.ts", "trombolise", "isq_trombectomia_check"],
];

const failures = [];
for (const [file, therapy, reassessment] of cases) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const start = text.indexOf(`${therapy}: {`);
  if (start < 0) {
    failures.push(`${file}: terapia ${therapy} ausente`);
    continue;
  }
  const slice = text.slice(start, start + 7000);
  const next = slice.match(/next:\s*["']([^"']+)["']/)?.[1];
  if (next !== reassessment) {
    failures.push(`${file}: ${therapy} deveria seguir para ${reassessment}, encontrado ${next || "nenhum next simples"}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("OK — terapias críticas dos pilotos seguem diretamente para reavaliação explícita.");
