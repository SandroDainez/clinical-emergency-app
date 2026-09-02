#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const canonical = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "tenecteplase.ts"), "utf8");
const legacy = fs.readFileSync(path.join(root, "lib", "tenecteplase.ts"), "utf8");
const failures = [];

for (const required of [
  'id: "tenecteplase"',
  'dose: "0,25 mg/kg"',
  'maximum: "25 mg"',
  'route: "IV em bolus único"',
  "AHA/ASA 2026",
  "reviewedAt: \"2026-09-01\"",
]) {
  if (!canonical.includes(required)) failures.push(`entrada canônica perdeu dado obrigatório: ${required}`);
}

for (const required of ["TENECTEPLASE_REGIME_AVC", "0,25 mg/kg", "25 mg"]) {
  if (!legacy.includes(required)) failures.push(`fonte legada perdeu paridade durante migração: ${required}`);
}

if (!canonical.includes("apresentação comercial e preparo") && !canonical.includes("apresentação comercial")) {
  failures.push("entrada canônica perdeu separação entre apresentação e indicação");
}

if (failures.length) {
  console.error("\n❌ Drug Knowledge — tenecteplase\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("✅ Tenecteplase canônica mantém paridade do regime AVC e separação de fontes.");
