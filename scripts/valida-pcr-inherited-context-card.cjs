#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const adapter = fs.readFileSync(path.join(root, "lib/pcr-handoff-context-adapter.ts"), "utf8");
const runtime = fs.readFileSync(path.join(root, "lib/pcr-inherited-context-runtime.ts"), "utf8");
const card = fs.readFileSync(path.join(root, "components/protocol-screen/pcr-inherited-context-card.tsx"), "utf8");
const migration = fs.readFileSync(path.join(root, "scripts/migra-pcr-inherited-context-card.cjs"), "utf8");

const errors = [];

for (const token of [
  'title: "Contexto imediatamente antes da PCR"',
  'value: fact ? formatValue(fact.value) : "Não registrado"',
  'recordedAt: fact?.recordedAt',
  'missing: !fact',
]) {
  if (!adapter.includes(token)) errors.push(`adapter sem ${token}`);
}

for (const token of [
  'consumeClinicalHandoff("pcr-adulto", contract.transitionId)',
  'return undefined;',
  'expectedFacts: contract.requiredFacts',
]) {
  if (!runtime.includes(token)) errors.push(`runtime sem ${token}`);
}

for (const token of [
  'A reanimação não deve ser atrasada para completar dados ausentes.',
  'accessibilityRole="summary"',
  'item.missing ? styles.missingValue : styles.value',
  'formatAge(item.recordedAt, now)',
]) {
  if (!card.includes(token)) errors.push(`card sem ${token}`);
}

for (const forbidden of ["Pressable", "onPress=", "router", "DecisionTreeEngine", "engine."]) {
  if (card.includes(forbidden)) errors.push(`card informativo ganhou comportamento proibido: ${forbidden}`);
}

for (const token of [
  'protocolId === "pcr_adulto"',
  'consumePcrInheritedContext()',
  'inheritedContext={pcrInheritedContext}',
  'inheritedContext?: PcrInheritedContextViewModel;',
  '<PcrInheritedContextCard model={inheritedContext} />',
]) {
  if (!migration.includes(token)) errors.push(`migração sem ${token}`);
}

if (errors.length) {
  console.error("\n❌ contexto herdado do PCR inválido\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\n✅ contexto herdado do PCR permanece informativo, temporal e não bloqueante.\n");
