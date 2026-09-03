#!/usr/bin/env node
const fs = require("node:fs");

const path = "ventilation-decision-tree.ts";
let source = fs.readFileSync(path, "utf8");

const replacements = [
  {
    before: `          id: "altura",\n          label: "Altura",\n          unit: "cm",`,
    after: `          id: "altura",\n          label: "Altura",\n          required: true,\n          unit: "cm",`,
    label: "altura",
  },
  {
    before: `          id: "sexo",\n          label: "Sexo",\n          presets: [`,
    after: `          id: "sexo",\n          label: "Sexo",\n          required: true,\n          presets: [`,
    label: "sexo",
  },
];

for (const replacement of replacements) {
  const matches = source.split(replacement.before).length - 1;
  if (matches !== 1) {
    throw new Error(`Âncora ${replacement.label} esperada exatamente 1 vez; encontrada ${matches}`);
  }
  source = source.replace(replacement.before, replacement.after);
}

if (!source.includes('id: "altura",\n          label: "Altura",\n          required: true,')) {
  throw new Error("Altura não ficou obrigatória");
}
if (!source.includes('id: "sexo",\n          label: "Sexo",\n          required: true,')) {
  throw new Error("Sexo não ficou obrigatório");
}

fs.writeFileSync(path, source);
console.log("✅ Altura e sexo agora são obrigatórios antes do cálculo de PBW.");
