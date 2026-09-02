#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contracts = fs.readFileSync(path.join(root, "lib/clinical-transition-contracts.ts"), "utf8");

const count = (re) => [...contracts.matchAll(re)].length;
const returnable = count(/mode:\s*"returnable"/g);
const terminal = count(/mode:\s*"terminal"/g);
const externalTerminal = count(/destinationKind:\s*"external_service"/g);
const returnLabels = count(/returnLabel:/g);
const hasTachyPcr = contracts.includes('id: "taquicardia-sem-pulso-pcr-terminal"');
const hasBradyPcr = contracts.includes('id: "bradicardia-sem-pulso-pcr-terminal"');

if (hasTachyPcr !== hasBradyPcr) {
  throw new Error("Migração PCR parcial: apenas um dos dois contratos terminais está presente.");
}

const pcrTerminalModules = hasTachyPcr && hasBradyPcr ? 2 : 0;
const expectedTotal = 15 + 2 + pcrTerminalModules;
const total = returnable + terminal;

if (returnable !== 15) {
  throw new Error(`Esperadas 15 transições retornáveis; encontradas ${returnable}.`);
}
if (returnLabels !== returnable) {
  throw new Error(`Toda transição retornável deve ter returnLabel: returnable=${returnable}, labels=${returnLabels}.`);
}
if (externalTerminal !== 2) {
  throw new Error(`Esperados 2 handoffs terminais externos; encontrados ${externalTerminal}.`);
}
if (terminal !== 2 + pcrTerminalModules) {
  throw new Error(`Contagem terminal incoerente: esperado ${2 + pcrTerminalModules}, encontrado ${terminal}.`);
}
if (total !== expectedTotal) {
  throw new Error(`Total de contratos incoerente: esperado ${expectedTotal}, encontrado ${total}.`);
}

const state = pcrTerminalModules === 2 ? "pós-migração PCR" : "pré-migração PCR";
console.log(`✅ Registry coerente (${state}): ${returnable} retornáveis + ${externalTerminal} externos terminais + ${pcrTerminalModules} módulos PCR terminais = ${total}.`);
