#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const migration = fs.readFileSync(path.join(raiz, "scripts/migra-pcr-handoffs-terminais.cjs"), "utf8");
const context = fs.readFileSync(path.join(raiz, "lib/pcr-terminal-handoff-context.ts"), "utf8");
const debts = fs.readFileSync(path.join(raiz, "clinical-safety-cases/target-promotion-debts.ts"), "utf8");
const targets = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");
const tachy = fs.readFileSync(path.join(raiz, "acls-tachycardia-tree.ts"), "utf8");
const brady = fs.readFileSync(path.join(raiz, "acls-bradycardia-tree.ts"), "utf8");
const transitions = fs.readFileSync(path.join(raiz, "lib/clinical-transition-contracts.ts"), "utf8");

const erros = [];
function exige(source, token, message) {
  if (!source.includes(token)) erros.push(message);
}
function trechoNo(source, nodeId) {
  const marker = `    ${nodeId}: {`;
  const start = source.indexOf(marker);
  if (start < 0) return "";
  const end = source.indexOf("\n    ", start + marker.length);
  return source.slice(start, end > start ? end : source.length);
}

// Estado atual: dívida ainda aberta e árvores ainda NÃO migradas.
const tachyNode = trechoNo(tachy, "unstable_sem_pulso");
const bradyNode = trechoNo(brady, "bradi_sem_pulso");
exige(tachyNode, 'disposition: "icu"', "taquicardia sem pulso já parece migrada; revisar esta trava de preparação");
exige(bradyNode, 'disposition: "icu"', "bradicardia sem pulso já parece migrada; revisar esta trava de preparação");
exige(targets, 'id: "taquicardia-sem-pulso-pcr"', "candidate de taquicardia ausente antes da migração");
exige(targets, 'id: "bradicardia-sem-pulso-pcr"', "candidate de bradicardia ausente antes da migração");
exige(debts, 'id: "tachy-pulseless-to-pcr"', "dívida de taquicardia ausente antes da migração");
exige(debts, 'id: "brady-pulseless-to-pcr"', "dívida de bradicardia ausente antes da migração");

// Contratos de contexto e política crítica.
for (const token of [
  'id: "tachy-pulseless-context"',
  'transitionId: "taquicardia-sem-pulso-pcr-terminal"',
  '"energia_ultima_cardioversao"',
  '"numero_cardioversoes"',
  '"antiarritmico_em_curso"',
  'id: "brady-pulseless-context"',
  'transitionId: "bradicardia-sem-pulso-pcr-terminal"',
  '"atropina_administrada"',
  '"marcapasso_em_uso"',
  '"captura_marcapasso"',
  '"cronotropico_em_curso"',
  '"tempo_perda_pulso"',
  '"suspeita_causa_reversivel"',
  'transferPolicy: "do_not_delay_destination"',
]) exige(context, token, `contrato de contexto ausente/incompleto: ${token}`);
exige(debts, 'contextContractId: "tachy-pulseless-context"', "dívida de taquicardia não aponta ao contexto preparado");
exige(debts, 'contextContractId: "brady-pulseless-context"', "dívida de bradicardia não aponta ao contexto preparado");

// A migração preparada deve mudar as duas árvores, criar contratos terminais e limpar estado transitório.
for (const token of [
  'replaceDispositionInNode(next.tachy, "unstable_sem_pulso")',
  'replaceDispositionInNode(next.brady, "bradi_sem_pulso")',
  'id: "taquicardia-sem-pulso-pcr-terminal"',
  'id: "bradicardia-sem-pulso-pcr-terminal"',
  'mode: "terminal"',
  'destinationKind: "module"',
  'removeObjectById(next.targets, "taquicardia-sem-pulso-pcr")',
  'removeObjectById(next.targets, "bradicardia-sem-pulso-pcr")',
  'removeObjectById(next.debts, "tachy-pulseless-to-pcr")',
  'removeObjectById(next.debts, "brady-pulseless-to-pcr")',
  '"energia_ultima_cardioversao"',
  '"captura_marcapasso"',
  'transferPolicy: "do_not_delay_destination"',
]) exige(migration, token, `migração preparada incompleta: ${token}`);

// Registry vivo ainda não deve fingir que a migração ocorreu.
if (transitions.includes('id: "taquicardia-sem-pulso-pcr-terminal"') || transitions.includes('id: "bradicardia-sem-pulso-pcr-terminal"')) {
  erros.push("registry vivo já contém os handoffs PCR; esta trava ainda descreve o estado pré-execução");
}

if (erros.length) {
  console.error("\n❌ migração terminal para PCR inconsistente\n");
  erros.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log("\n✅ migração taquicardia/bradicardia → PCR alinhada aos contratos atuais, com política de não atrasar PCR, e ainda não executada.\n");
