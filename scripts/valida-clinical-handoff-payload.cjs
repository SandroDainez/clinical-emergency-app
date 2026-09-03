#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const payload = fs.readFileSync(path.join(raiz, "lib/clinical-handoff-payload.ts"), "utf8");
const contract = fs.readFileSync(path.join(raiz, "lib/clinical-handoff-contract.ts"), "utf8");
const runtime = fs.readFileSync(path.join(raiz, "lib/clinical-handoff-runtime.ts"), "utf8");
const pcr = fs.readFileSync(path.join(raiz, "lib/pcr-terminal-handoff-context.ts"), "utf8");
const session = fs.readFileSync(path.join(raiz, "lib/clinical-session-runtime.ts"), "utf8");

const erros = [];

for (const token of [
  "export type ClinicalHandoffPayload",
  "recordedAt: number",
  "sourceModule: string",
  "createClinicalHandoffPayload",
  "projectClinicalHandoffFacts",
]) {
  if (!payload.includes(token)) erros.push(`payload sem ${token}`);
}

for (const token of [
  "ClinicalHandoffPreservationContract",
  "requiredFacts",
  "buildClinicalHandoffPayload",
  "sem fatos obrigatórios",
]) {
  if (!contract.includes(token)) erros.push(`contract sem ${token}`);
}

for (const token of [
  "publishClinicalHandoff",
  "peekClinicalHandoff",
  "consumeClinicalHandoff",
  "clearClinicalHandoffs",
]) {
  if (!runtime.includes(token)) erros.push(`runtime sem ${token}`);
}

if (!runtime.includes("pending.splice(index, 1)")) erros.push("consume não remove exatamente um payload");
if (!runtime.includes("facts: payload.facts.map((fact) => ({ ...fact }))")) erros.push("runtime sem cópia defensiva dos fatos");

for (const token of [
  'transitionId: "taquicardia-sem-pulso-pcr-terminal"',
  'transitionId: "bradicardia-sem-pulso-pcr-terminal"',
  'targetModuleId: "pcr-adulto"',
  "handoffPreservationFromTransition",
  'transferPolicy: "do_not_delay_destination"',
]) {
  if (!pcr.includes(token)) erros.push(`PCR context sem ${token}`);
}

if (!session.includes('import { clearClinicalHandoffs } from "./clinical-handoff-runtime"')) {
  erros.push("session runtime não importa clearClinicalHandoffs");
}
if (!session.includes("clearClinicalHandoffs();")) erros.push("novo paciente não limpa handoff inbox");

const genericFiles = [payload, contract, runtime].join("\n");
for (const forbidden of ["acls-tachycardia-tree", "acls-bradycardia-tree", "unstable_sem_pulso", "bradi_sem_pulso"]) {
  if (genericFiles.includes(forbidden)) erros.push(`camada genérica acoplada à origem: ${forbidden}`);
}

if (erros.length) {
  console.error("\n❌ clinical handoff payload inválido\n");
  erros.forEach((erro) => console.error(`- ${erro}`));
  process.exit(1);
}

console.log("\n✅ handoff payload genérico, inbox e reset de sessão estruturalmente protegidos.\n");
