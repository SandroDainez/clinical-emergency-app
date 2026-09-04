#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shockPath = path.join(root, "shock-decision-tree.ts");
const esPath = path.join(root, "lib/i18n/modules/choque.ts");
let shock = fs.readFileSync(shockPath, "utf8");
let es = fs.readFileSync(esPath, "utf8");

const oldCalcium = "Manter temperatura entre 35,7 e 37 °C; repor cálcio durante a transfusão maciça (o protocolo-fonte usa cloreto de cálcio a cada 2 hemocomponentes — seguir o regime institucional); suspender anticoagulantes, antiagregantes e fibrinolíticos.";
const newCalcium = "Na hemorragia grave/transfusão maciça, monitorar cálcio IONIZADO precocemente e de forma seriada e mantê-lo na faixa normal do laboratório (em geral 1,1–1,3 mmol/L). Corrigir hipocalcemia prontamente — especialmente Ca²⁺ ionizado <0,9 mmol/L — preferindo cloreto de cálcio quando apropriado. Não prescrever cálcio por número fixo universal de bolsas; titular por cálcio ionizado, ritmo de transfusão e contexto clínico. Prevenir/corrigir hipotermia e tratar a causa do sangramento.";
const txa = "Ácido tranexâmico no TRAUMA com sangramento ou risco de sangramento significativo: administrar o mais cedo possível e dentro de 3 h da lesão; regime da diretriz europeia: 1 g IV em 10 min seguido de 1 g IV em 8 h. Não aguardar tromboelastometria/viscoelastometria para iniciar TXA quando ele estiver indicado.";
const coag = "Coagulação: iniciar monitorização e suporte hemostático imediatamente. Usar PT/INR, fibrinogênio de Clauss, plaquetas e/ou viscoelastometria conforme disponibilidade e repetir conforme evolução. Se houver hemorragia maciça esperada, ativar protocolo de transfusão maciça/ressuscitação hemostática local; após os primeiros componentes, direcionar a terapia pelos resultados, evitando reposição empírica prolongada sem monitorização.";
const fibrinogen = "Fibrinogênio: se sangramento maior vier acompanhado de déficit funcional na viscoelastometria ou fibrinogênio de Clauss ≤1,5 g/L, repor com concentrado de fibrinogênio ou crioprecipitado; a diretriz europeia sugere dose inicial de 3–4 g, com redose guiada por viscoelastometria e/ou fibrinogênio laboratorial.";

if (!shock.includes(oldCalcium)) {
  console.error("❌ Linha antiga de cálcio não localizada; reauditar dx_hipovolemico atual.");
  process.exit(1);
}
shock = shock.replace(oldCalcium, newCalcium);
const acidemiaAnchor = '        "Acidemia no choque hemorrágico é sobretudo marcador de hipoperfusão:';
const idx = shock.indexOf(acidemiaAnchor);
if (idx < 0) {
  console.error("❌ Âncora de acidemia não localizada.");
  process.exit(1);
}
const insertion = `        ${JSON.stringify(txa)},\n        ${JSON.stringify(coag)},\n        ${JSON.stringify(fibrinogen)},\n`;
if (!shock.includes(txa)) shock = shock.slice(0, idx) + insertion + shock.slice(idx);
fs.writeFileSync(shockPath, shock);

const translations = [
  [newCalcium, "En la hemorragia grave/transfusión masiva, monitorizar el calcio IONIZADO precozmente y de forma seriada y mantenerlo en el rango normal del laboratorio (en general 1,1–1,3 mmol/L). Corregir la hipocalcemia de inmediato — especialmente Ca²⁺ ionizado <0,9 mmol/L — prefiriendo cloruro de calcio cuando corresponda. No prescribir calcio por un número fijo universal de bolsas; titular según calcio ionizado, ritmo de transfusión y contexto clínico. Prevenir/corregir hipotermia y tratar la causa del sangrado."],
  [txa, "Ácido tranexámico en TRAUMA con sangrado o riesgo de sangrado significativo: administrar lo antes posible y dentro de las 3 h de la lesión; régimen de la guía europea: 1 g IV en 10 min seguido de 1 g IV en 8 h. No esperar tromboelastometría/viscoelastometría para iniciar TXA cuando esté indicado."],
  [coag, "Coagulación: iniciar monitorización y soporte hemostático de inmediato. Usar PT/INR, fibrinógeno de Clauss, plaquetas y/o viscoelastometría según disponibilidad y repetir según evolución. Si se espera hemorragia masiva, activar el protocolo local de transfusión masiva/reanimación hemostática; después de los primeros componentes, dirigir la terapia por los resultados, evitando reposición empírica prolongada sin monitorización."],
  [fibrinogen, "Fibrinógeno: si el sangrado mayor se acompaña de déficit funcional en la viscoelastometría o fibrinógeno de Clauss ≤1,5 g/L, reponer con concentrado de fibrinógeno o crioprecipitado; la guía europea sugiere una dosis inicial de 3–4 g, con redosificación guiada por viscoelastometría y/o fibrinógeno de laboratorio."],
];
const marker = "\n};";
for (const [pt, tr] of translations) {
  if (es.includes(pt)) continue;
  const close = es.lastIndexOf(marker);
  if (close < 0) throw new Error("Fechamento de ES_CHOQUE não localizado");
  es = es.slice(0, close) + `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},` + es.slice(close);
}
fs.writeFileSync(esPath, es);

console.log("✅ Choque hemorrágico: cálcio ionizado, TXA, monitorização hemostática e fibrinogênio atualizados.");
