#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const tachy = fs.readFileSync(path.join(raiz, "acls-tachycardia-tree.ts"), "utf8");
const brady = fs.readFileSync(path.join(raiz, "acls-bradycardia-tree.ts"), "utf8");
const transitions = fs.readFileSync(path.join(raiz, "lib/clinical-transition-contracts.ts"), "utf8");
const targets = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");
const debts = fs.readFileSync(path.join(raiz, "clinical-safety-cases/target-promotion-debts.ts"), "utf8");
const context = fs.readFileSync(path.join(raiz, "lib/pcr-terminal-handoff-context.ts"), "utf8");

const erros = [];
function node(source, nodeId) {
  const marker = `    ${nodeId}: {`;
  const start = source.indexOf(marker);
  if (start < 0) return "";
  const end = source.indexOf("\n    ", start + marker.length);
  return source.slice(start, end > start ? end : source.length);
}
function exige(source, token, message) {
  if (!source.includes(token)) erros.push(message);
}

exige(node(tachy, "unstable_sem_pulso"), 'disposition: "other_module"', "taquicardia sem pulso não é handoff other_module");
exige(node(brady, "bradi_sem_pulso"), 'disposition: "other_module"', "bradicardia sem pulso não é handoff other_module");

for (const id of ["taquicardia-sem-pulso-pcr-terminal", "bradicardia-sem-pulso-pcr-terminal"]) {
  exige(transitions, `id: "${id}"`, `registry sem ${id}`);
}
for (const token of [
  'to: "pcr-adulto"',
  'mode: "terminal"',
  'destinationKind: "module"',
  '"tempo_perda_pulso"',
  '"suspeita_causa_reversivel"',
]) exige(transitions, token, `registry terminal PCR sem ${token}`);

if (targets.includes('id: "taquicardia-sem-pulso-pcr"')) erros.push("candidate de taquicardia permaneceu após promoção");
if (targets.includes('id: "bradicardia-sem-pulso-pcr"')) erros.push("candidate de bradicardia permaneceu após promoção");
if (debts.includes('id: "tachy-pulseless-to-pcr"')) erros.push("dívida de taquicardia permaneceu aberta");
if (debts.includes('id: "brady-pulseless-to-pcr"')) erros.push("dívida de bradicardia permaneceu aberta");

for (const token of [
  'transitionId: "taquicardia-sem-pulso-pcr-terminal"',
  'transitionId: "bradicardia-sem-pulso-pcr-terminal"',
  'transferPolicy: "do_not_delay_destination"',
]) exige(context, token, `contexto PCR perdeu ${token}`);

if (erros.length) {
  console.error("\n❌ handoffs terminais para PCR não fecharam a migração\n");
  erros.forEach((erro) => console.error(`- ${erro}`));
  process.exit(1);
}
console.log("\n✅ taquicardia/bradicardia sem pulso promovidas a handoffs terminais para PCR, sem dívida residual.\n");
