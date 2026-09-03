#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const fail = (message) => {
  console.error(`❌ Drug KB AVC pilot: ${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

const types = read("lib/drug-knowledge/types.ts");
const tnk = read("lib/drug-knowledge/tenecteplase.ts");
const avcTree = read("avc-decision-tree.ts");
const protocol = read("avc/protocol-config.ts");

expect(types.includes('kind: "weight_based"'), "o contrato estruturado weight_based não existe");
for (const field of ["doseMgPerKg", "maxDoseMg", "roundingStepMg", "bolusOnly"]) {
  expect(types.includes(`${field}:`), `o contrato não declara ${field}`);
}

const rule = tnk.match(
  /TENECTEPLASE_AVC_WEIGHT_BASED\s*(?::\s*WeightBasedDrugCalculation)?\s*=\s*Object\.freeze\(\{([\s\S]*?)\}\)/
);
expect(rule, "a regra canônica estruturada da tenecteplase no AVC não foi encontrada");
const body = rule[1];
const numberField = (name) => {
  const match = body.match(new RegExp(`${name}:\\s*([0-9.]+)`));
  expect(match, `campo numérico ${name} ausente na regra canônica`);
  return Number(match[1]);
};
const doseMgPerKg = numberField("doseMgPerKg");
const maxDoseMg = numberField("maxDoseMg");
const roundingStepMg = numberField("roundingStepMg");
expect(/bolusOnly:\s*true/.test(body), "bolusOnly precisa permanecer true no regime de AVC");
expect(doseMgPerKg === 0.25, "paridade quebrada: doseMgPerKg deixou de ser 0.25");
expect(maxDoseMg === 25, "paridade quebrada: maxDoseMg deixou de ser 25");
expect(roundingStepMg === 0.1, "paridade quebrada: roundingStepMg deixou de ser 0.1");
expect(tnk.includes("calculation: TENECTEPLASE_AVC_WEIGHT_BASED"), "a indicação AVC não referencia a regra estruturada");

expect(avcTree.includes('from "./lib/drug-knowledge/tenecteplase"'), "o fluxo AVC não importa a regra da Drug KB");
expect(avcTree.includes("TENECTEPLASE_AVC_WEIGHT_BASED.doseMgPerKg * peso"), "o derive do AVC não consome doseMgPerKg da Drug KB");
expect(avcTree.includes("TENECTEPLASE_AVC_WEIGHT_BASED.maxDoseMg"), "o derive do AVC não consome o teto da Drug KB");
expect(!avcTree.includes("Math.min(0.25 * peso, 25)"), "o cálculo duplicado legado 0.25/25 ainda está ativo no derive");
expect(avcTree.includes('out.tnkDose = "0,25 mg/kg (máx 25)";'), "o comportamento de ausência/peso inválido foi alterado");

expect(protocol.includes('from "../lib/drug-knowledge/tenecteplase"'), "protocol-config do AVC não consome a Drug KB");
for (const field of ["doseMgPerKg", "maxDoseMg", "roundingStepMg", "bolusOnly"]) {
  expect(protocol.includes(`${field}: TENECTEPLASE_AVC_WEIGHT_BASED.${field}`), `protocol-config ainda não deriva ${field} da regra canônica`);
}

const legacyRound1 = (n) => Math.round(n * 10) / 10;
const legacyDose = (weight) => legacyRound1(Math.min(0.25 * weight, 25));
const kbDose = (weight) => {
  const raw = Math.min(doseMgPerKg * weight, maxDoseMg);
  return Math.round(raw / roundingStepMg) * roundingStepMg;
};

for (const weight of [0.1, 50, 99.9, 100, 100.1, 120]) {
  const legacy = legacyDose(weight);
  const canonical = kbDose(weight);
  expect(Math.abs(legacy - canonical) < 1e-9, `paridade matemática falhou em ${weight} kg: ${legacy} != ${canonical}`);
}

console.log("✅ Drug KB AVC pilot: fonte canônica estruturada, consumidor real e paridade 0.25 mg/kg / máx 25 mg / 0.1 mg preservadas.");
