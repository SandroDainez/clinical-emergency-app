#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const file = path.resolve(__dirname, "..", "sedation-engine.ts");
let src = fs.readFileSync(file, "utf8");

function replaceOnce(before, after, label) {
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

replaceOnce(
  '      "Não usar em alergia a ovo ou soja.",',
  '      "Alergia alimentar a ovo ou soja, isoladamente, não exige evitar propofol; história de reação ao próprio propofol/formulação deve ser tratada como hipersensibilidade medicamentosa.",',
  "propofol-food-allergy"
);

replaceOnce(
  '    reference: "PADIS Guidelines 2018 (Crit Care Med).",',
  '    reference: "SCCM PADIS 2018 + Focused Update 2025 · AAAAI Drug Hypersensitivity Guidance / propofol e alergia alimentar, revisão 2024.",',
  "propofol-reference"
);

replaceOnce(
  '      "Ideal no desmame de VM e no delirium hiperativo; reduz consumo de opioide.",',
  '      "Preferir quando sedação leve e/ou redução de delirium são prioridades; útil quando agitação dificulta desmame/extubação.",',
  "dexmedetomidine-selection"
);

replaceOnce(
  '    reference: "MENDS2 trial (NEJM 2021).",',
  '    reference: "SCCM PADIS 2018 + Focused Update 2025 · MENDS2 (NEJM 2021).",',
  "dexmedetomidine-reference"
);

replaceOnce(
  '    reference: "MIDEX/PRODEX trials (JAMA 2012).",',
  '    reference: "SCCM PADIS 2018 + Focused Update 2025 · MIDEX/PRODEX (JAMA 2012).",',
  "midazolam-reference"
);

fs.writeFileSync(file, src);
console.log("✅ Sedoanalgesia: atualização de evidência aplicada sem alterar doses.");
