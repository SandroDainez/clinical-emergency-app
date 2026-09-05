#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const canonical = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "amiodarona.ts"), "utf8");
const legacyPulse = fs.readFileSync(path.join(root, "lib", "amiodarona-com-pulso.ts"), "utf8");
const failures = [];

for (const token of ["pcr_fv_tv_sem_pulso", "300 mg", "150 mg", "IV/IO", "bolus"]) {
  if (!canonical.includes(token)) failures.push(`regime PCR perdeu token crítico: ${token}`);
}

// TV com pulso tem fonte única em lib/amiodarona-com-pulso.ts. A Drug KB deve
// CONSUMIR as constantes, não repetir os números — repetição foi exatamente o
// defeito que valida-farmacos-fonte-unica passou a bloquear.
for (const token of [
  "tv_com_pulso",
  "AMIODARONA_COM_PULSO_CARGA",
  "AMIODARONA_COM_PULSO_MANUTENCAO",
  "AMIODARONA_COM_PULSO_RECORRENCIA",
  'from "../amiodarona-com-pulso"',
]) {
  if (!canonical.includes(token)) failures.push(`regime com pulso deixou de consumir fonte canônica: ${token}`);
}
for (const token of ["150 mg IV em 10 min", "1 mg/min por 6 h", "0,5 mg/min por 18 h"]) {
  if (!legacyPulse.includes(token)) failures.push(`fonte canônica com pulso mudou durante migração: ${token}`);
}
if (!canonical.includes("ANVISA")) failures.push("apresentação brasileira sem procedência regulatória");
if (!canonical.includes("American Heart Association")) failures.push("regime de PCR sem fonte AHA");
if (!canonical.includes("FDA")) failures.push("regime com pulso sem fonte de bula");

if (failures.length) {
  console.error("\n❌ Drug Knowledge — amiodarona\n");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("✅ Amiodarona mantém PCR separado e TV com pulso consumindo a fonte única canônica.");
