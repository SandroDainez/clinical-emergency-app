#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "..", "poisoning-decision-tree.ts");
let src = fs.readFileSync(file, "utf8");
const before = '      summary: "Acidose com ânion gap alto + gap osmolar alto. NÃO fazer carvão nem lavagem.",\n';
const after = '      summary: "Acidose com ânion gap alto + gap osmolar alto. Carvão ativado não tem papel em metanol/etilenoglicol. Lavagem gástrica não é recomendada rotineiramente; benefício não demonstrado.",\n';
if (!src.includes(after)) {
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`contexto tox_alcool_toxico encontrado ${count}x; esperado 1`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src, "utf8");
}
console.log("Texto de descontaminação do álcool tóxico preparado em workspace.");
