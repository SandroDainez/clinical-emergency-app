#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(__dirname, "..", "sedation-engine.ts");
let src = fs.readFileSync(file, "utf8");

function replaceOnce(label, before, after) {
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

replaceOnce(
  "etomidate-full-dose",
  '          "Dose PLENA também no instável: é o indutor hemodinamicamente neutro, e reduzi-lo perde justamente a vantagem.",',
  '          "ISR em adulto crítico: 0,2–0,3 mg/kg IV é faixa usada em estudos; o default deste módulo permanece 0,3 mg/kg. Não reduzir automaticamente apenas pela instabilidade, mas individualizar conforme idade, reserva fisiológica e fármacos concomitantes.",'
);
replaceOnce(
  "etomidate-max-ampoules",
  '      "Dose máxima usual: não exceder ~3 ampolas (30 mL) no adulto.",',
  '      "Evitar limites por número de ampolas: a dose deve permanecer baseada em mg/kg e individualização clínica; a bula descreve 0,2–0,6 mg/kg para indução, com 0,3 mg/kg como dose usual.",'
);
replaceOnce(
  "etomidate-reference",
  '    reference: "Bula Hypnomidate/ANVISA · The Walls Manual of Emergency Airway Management, 6ª ed. 2023.",',
  '    reference: "Bula de etomidato/Hypnomidate · SCCM RSI Guideline 2023 · estudos contemporâneos de etomidato vs cetamina em intubação de críticos.",'
);

fs.writeFileSync(file, src);
console.log("✅ Etomidato: default 0,3 mg/kg preservado; dose individualizada e heurística por ampolas removida.");
