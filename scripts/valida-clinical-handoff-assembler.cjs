#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const assembler = fs.readFileSync(path.join(raiz, "lib/clinical-handoff-assembler.ts"), "utf8");
const orchestrator = fs.readFileSync(path.join(raiz, "lib/clinical-handoff-orchestrator.ts"), "utf8");
const observations = fs.readFileSync(path.join(raiz, "lib/clinical-observations.ts"), "utf8");
const events = fs.readFileSync(path.join(raiz, "lib/clinical-event-log.ts"), "utf8");

const erros = [];

for (const token of [
  'status: "complete"',
  'status: "incomplete"',
  'status: "unavailable"',
  "missingFacts",
  "resolvedFacts",
  "getAllClinicalObservations()",
  "listClinicalEvents()",
  "Object.prototype.hasOwnProperty.call(item.data, input.factId)",
  "buildClinicalHandoffPayload",
]) {
  if (!assembler.includes(token)) erros.push(`assembler sem ${token}`);
}

if (!assembler.includes("const observation = input.observationById.get(input.factId)")) {
  erros.push("assembler não prioriza observação por id exato");
}
if (!assembler.includes("eventsNewestFirst.find")) {
  erros.push("assembler não procura o evento mais recente");
}
if (!assembler.includes("missingFacts.push(factId)")) {
  erros.push("assembler não explicita fatos ausentes");
}
if (/infer|guess|estimate|approx/i.test(assembler)) {
  erros.push("assembler contém linguagem de inferência/aproximação; fatos ausentes não podem ser inventados");
}

for (const token of [
  "prepareAndPublishClinicalHandoff",
  'if (assembly.status === "complete")',
  "publishClinicalHandoff(assembly.payload)",
]) {
  if (!orchestrator.includes(token)) erros.push(`orchestrator sem ${token}`);
}
if (orchestrator.includes('result.status === "incomplete"') && orchestrator.includes("publishClinicalHandoff")) {
  erros.push("orchestrator aparenta publicar handoff incompleto");
}

for (const token of ["recordedAt: number", "originModule?: string"]) {
  if (!observations.includes(token)) erros.push(`observations sem ${token}`);
}
for (const token of ["occurredAt: number", "data?: Record<string, string | number | boolean | null>"]) {
  if (!events.includes(token)) erros.push(`event log sem ${token}`);
}

const generic = [assembler, orchestrator].join("\n");
for (const forbidden of ["acls-tachycardia-tree", "acls-bradycardia-tree", "unstable_sem_pulso", "bradi_sem_pulso"]) {
  if (generic.includes(forbidden)) erros.push(`assembler genérico acoplado à árvore de origem: ${forbidden}`);
}

if (erros.length) {
  console.error("\n❌ clinical handoff assembler inválido\n");
  erros.forEach((erro) => console.error(`- ${erro}`));
  process.exit(1);
}

console.log("\n✅ assembler distingue completo/incompleto/indisponível e só publica payload completo.\n");
