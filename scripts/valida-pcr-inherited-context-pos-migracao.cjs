#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const parent = fs.readFileSync(path.join(root, "components/protocol-screen.tsx"), "utf8");
const screen = fs.readFileSync(path.join(root, "components/protocol-screen/acls-protocol-screen.tsx"), "utf8");
const card = fs.readFileSync(path.join(root, "components/protocol-screen/pcr-inherited-context-card.tsx"), "utf8");
const adapter = fs.readFileSync(path.join(root, "lib/pcr-handoff-context-adapter.ts"), "utf8");
const runtime = fs.readFileSync(path.join(root, "lib/pcr-inherited-context-runtime.ts"), "utf8");

const errors = [];
function requireToken(source, token, message) {
  if (!source.includes(token)) errors.push(message);
}

for (const token of [
  'import { consumePcrInheritedContext } from "../lib/pcr-inherited-context-runtime";',
  'const [pcrInheritedContext] = useState(() =>',
  'engine.getEncounterSummary().protocolId === "pcr_adulto"',
  'consumePcrInheritedContext()',
  'inheritedContext={pcrInheritedContext}',
]) requireToken(parent, token, `ProtocolScreen sem integração: ${token}`);

for (const token of [
  'import PcrInheritedContextCard from "./pcr-inherited-context-card";',
  'import type { PcrInheritedContextViewModel } from "../../lib/pcr-handoff-context-adapter";',
  'inheritedContext?: PcrInheritedContextViewModel;',
  'inheritedContext,',
  '<PcrInheritedContextCard model={inheritedContext} />',
]) requireToken(screen, token, `AclsProtocolScreen sem integração: ${token}`);

for (const token of [
  'A reanimação não deve ser atrasada para completar dados ausentes.',
  'accessibilityRole="summary"',
  '{item.value}',
  'item.missing ? styles.missingValue : styles.value',
]) requireToken(card, token, `card herdado perdeu segurança/apresentação: ${token}`);

for (const token of [
  'value: fact ? formatValue(fact.value) : "Não registrado"',
  'missing: !fact',
  'recordedAt: fact?.recordedAt',
]) requireToken(adapter, token, `adapter não representa ausência/tempo corretamente: ${token}`);

for (const forbidden of ["Pressable", "onPress=", "router", "DecisionTreeEngine", "engine."]) {
  if (card.includes(forbidden)) errors.push(`card herdado ganhou comportamento clínico proibido: ${forbidden}`);
}

requireToken(runtime, 'consumeClinicalHandoff("pcr-adulto", contract.transitionId)', "runtime não consome handoff PCR por transitionId");

const consumeOccurrences = (parent.match(/consumePcrInheritedContext\(\)/g) || []).length;
if (consumeOccurrences !== 1) errors.push(`ProtocolScreen deve consumir contexto herdado uma única vez; encontrado ${consumeOccurrences}`);

if (errors.length) {
  console.error("\n❌ integração visual do contexto herdado do PCR inválida\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\n✅ contexto herdado integrado ao PCR como informação opcional, consumida uma vez e sem bloquear RCP.\n");
