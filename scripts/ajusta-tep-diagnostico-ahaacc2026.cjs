#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = {
  shock: path.join(root, "shock-decision-tree.ts"),
  tep: path.join(root, "tep-decision-tree.ts"),
  shockI18n: path.join(root, "lib/i18n/modules/choque.ts"),
  tepI18n: path.join(root, "lib/i18n/modules/tep.ts"),
};

let shock = fs.readFileSync(files.shock, "utf8");
let tep = fs.readFileSync(files.tep, "utf8");
let shockI18n = fs.readFileSync(files.shockI18n, "utf8");
let tepI18n = fs.readFileSync(files.tepI18n, "utf8");

const oldShock = "Confirmar: ECO (dilatação/disfunção de VD, McConnell), AngioTC quando estável; D-dímero não exclui no alto risco.";
const newShock = "Diagnóstico: preferir AngioTC pulmonar quando factível. Em instabilidade, ecocardiografia/POCUS à beira leito ajuda a identificar disfunção/sobrecarga de VD e diagnósticos alternativos, mas NÃO confirma nem exclui TEP isoladamente; sinal de McConnell é achado de disfunção de VD e serve principalmente à estratificação. Em alta probabilidade clínica, avançar para imagem diagnóstica em vez de depender de D-dímero isolado.";

const oldTep = "AngioTC impossível: ecocardiograma à beira leito — dilatação/disfunção de VD + sinal de McConnell + TVP ao ultrassom = suficiente para indicar trombólise em extremis.";
const newTep = "Se a AngioTC for inviável pela instabilidade: usar ecocardiografia/POCUS à beira leito para avaliar disfunção de VD e diagnósticos alternativos e ultrassom venoso quando útil. Ecocardiograma, inclusive sinal de McConnell, NÃO confirma nem exclui TEP isoladamente; no colapso iminente, a decisão de reperfusão deve integrar probabilidade clínica, achados disponíveis, contraindicações e impossibilidade de imagem definitiva, sem transformar um único achado ecográfico em confirmação diagnóstica.";

if (!shock.includes(oldShock) && !shock.includes(newShock)) {
  throw new Error("Trecho diagnóstico antigo do TEP em shock-decision-tree.ts não localizado");
}
if (shock.includes(oldShock)) shock = shock.replace(oldShock, newShock);

if (!tep.includes(oldTep) && !tep.includes(newTep)) {
  throw new Error("Trecho diagnóstico antigo do TEP de alto risco não localizado");
}
if (tep.includes(oldTep)) tep = tep.replace(oldTep, newTep);

const translations = [
  {
    file: "shock",
    pt: newShock,
    es: "Diagnóstico: preferir angio-TC pulmonar cuando sea factible. En inestabilidad, la ecocardiografía/POCUS a pie de cama ayuda a identificar disfunción/sobrecarga del VD y diagnósticos alternativos, pero NO confirma ni excluye TEP de forma aislada; el signo de McConnell es un hallazgo de disfunción del VD y sirve principalmente para estratificación. Ante alta probabilidad clínica, avanzar a imagen diagnóstica en lugar de depender de un dímero D aislado.",
  },
  {
    file: "tep",
    pt: newTep,
    es: "Si la angio-TC es inviable por inestabilidad: usar ecocardiografía/POCUS a pie de cama para evaluar disfunción del VD y diagnósticos alternativos, y ultrasonido venoso cuando sea útil. El ecocardiograma, incluido el signo de McConnell, NO confirma ni excluye TEP de forma aislada; ante colapso inminente, la decisión de reperfusión debe integrar probabilidad clínica, hallazgos disponibles, contraindicaciones e imposibilidad de imagen definitiva, sin convertir un único hallazgo ecográfico en confirmación diagnóstica.",
  },
];

function appendTranslation(dict, pt, es) {
  if (dict.includes(JSON.stringify(pt))) return dict;
  const idx = dict.lastIndexOf("\n};");
  if (idx < 0) throw new Error("Fechamento de dicionário i18n não localizado");
  const entry = `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(es)},`;
  return dict.slice(0, idx) + entry + dict.slice(idx);
}

shockI18n = appendTranslation(shockI18n, translations[0].pt, translations[0].es);
tepI18n = appendTranslation(tepI18n, translations[1].pt, translations[1].es);

fs.writeFileSync(files.shock, shock);
fs.writeFileSync(files.tep, tep);
fs.writeFileSync(files.shockI18n, shockI18n);
fs.writeFileSync(files.tepI18n, tepI18n);

console.log("✅ TEP AHA/ACC 2026: eco/POCUS reposicionado para VD/estratificação, sem confirmação diagnóstica isolada.");
