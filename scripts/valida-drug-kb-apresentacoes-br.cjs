#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const fail = (message) => {
  console.error(`❌ Drug KB apresentações BR: ${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const alteplase = read("lib/drug-knowledge/alteplase.ts");
const amiodarona = read("lib/drug-knowledge/amiodarona.ts");
const tenecteplase = read("lib/drug-knowledge/tenecteplase.ts");

for (const mg of [10, 20, 50]) {
  expect(
    alteplase.includes(`Actilyse ${mg} mg — pó liofilizado + ${mg} mL de diluente`),
    `apresentação brasileira Actilyse ${mg} mg/${mg} mL ausente`
  );
}
const alteplaseConcentrationCount = (alteplase.match(/concentration: "1 mg\/mL após reconstituição"/g) || []).length;
expect(alteplaseConcentrationCount === 3, `esperadas 3 apresentações de alteplase a 1 mg/mL; encontradas ${alteplaseConcentrationCount}`);
const alteplaseSourceCount = (alteplase.match(/ANVISA\/CMED — lista oficial de apresentações comercializadas no Brasil/g) || []).length;
expect(alteplaseSourceCount === 3, `as 3 apresentações de alteplase precisam manter proveniência ANVISA/CMED; encontradas ${alteplaseSourceCount}`);
expect(alteplase.includes('reviewedAt: "2026-09-03"'), "data de revisão das apresentações brasileiras de alteplase não está registrada");

expect(amiodarona.includes('label: "Solução injetável 50 mg/mL — ampola 3 mL"'), "apresentação brasileira injetável de amiodarona 50 mg/mL em ampola de 3 mL ausente");
expect(amiodarona.includes('vialAmount: "150 mg/3 mL"'), "conteúdo total de 150 mg/3 mL da amiodarona não está protegido");
expect(amiodarona.includes("ANVISA — rótulo aprovado de cloridrato de amiodarona solução injetável 50 mg/mL, ampola 3 mL"), "proveniência ANVISA da apresentação de amiodarona ausente");
expect(amiodarona.includes('version: "registro 1.0041.0206.001-9"'), "registro ANVISA da apresentação de amiodarona ausente");
expect(amiodarona.includes('reviewedAt: "2026-09-03"'), "data de revisão da apresentação brasileira de amiodarona não está registrada");

for (const [mg, ml, units] of [[40, 8, "8.000"], [50, 10, "10.000"]]) {
  expect(
    tenecteplase.includes(`Metalyse ${mg} mg — pó liofilizado + ${ml} mL de diluente`),
    `apresentação brasileira Metalyse ${mg} mg/${ml} mL ausente`
  );
  expect(
    tenecteplase.includes(`vialAmount: "${mg} mg (${units} U)"`),
    `conteúdo do frasco Metalyse ${mg} mg não está protegido`
  );
}
const tenecteplaseConcentrationCount = (tenecteplase.match(/concentration: "5 mg\/mL após reconstituição"/g) || []).length;
expect(tenecteplaseConcentrationCount === 2, `esperadas 2 apresentações de tenecteplase a 5 mg/mL; encontradas ${tenecteplaseConcentrationCount}`);
const tenecteplaseSourceCount = (tenecteplase.match(/ANVISA\/CMED \+ bula profissional brasileira — Metalyse/g) || []).length;
expect(tenecteplaseSourceCount === 2, `as 2 apresentações de tenecteplase precisam manter proveniência brasileira; encontradas ${tenecteplaseSourceCount}`);
expect(tenecteplase.includes('reviewedAt: "2026-09-03"'), "data de revisão das apresentações brasileiras de tenecteplase não está registrada");

console.log("✅ Drug KB apresentações BR: alteplase, amiodarona e tenecteplase possuem apresentações brasileiras verificadas e protegidas por proveniência.");
