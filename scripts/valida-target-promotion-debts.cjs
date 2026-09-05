#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const semantics = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");
const transitions = fs.readFileSync(path.join(raiz, "lib/clinical-transition-contracts.ts"), "utf8");
const debts = fs.readFileSync(path.join(raiz, "clinical-safety-cases/target-promotion-debts.ts"), "utf8");

const erros = [];
const promovida =
  transitions.includes('id: "taquicardia-sem-pulso-pcr-terminal"') &&
  transitions.includes('id: "bradicardia-sem-pulso-pcr-terminal"');

if (promovida) {
  for (const id of ["taquicardia-sem-pulso-pcr-terminal", "bradicardia-sem-pulso-pcr-terminal"]) {
    if (!transitions.includes(`id: "${id}"`)) erros.push(`transition registry sem ${id}`);
  }
  if (!transitions.includes('to: "pcr-adulto"')) erros.push("handoffs promovidos não apontam para pcr-adulto");
  if (!transitions.includes('mode: "terminal"')) erros.push("handoffs promovidos perderam modo terminal");
  if (semantics.includes('fromNodeId: "unstable_sem_pulso"')) erros.push("candidate de taquicardia permaneceu após promoção");
  if (semantics.includes('fromNodeId: "bradi_sem_pulso"')) erros.push("candidate de bradicardia permaneceu após promoção");
  if (debts.includes('id: "tachy-pulseless-to-pcr"')) erros.push("dívida de taquicardia permaneceu aberta após promoção");
  if (debts.includes('id: "brady-pulseless-to-pcr"')) erros.push("dívida de bradicardia permaneceu aberta após promoção");
} else {
  const casos = [
    ["unstable_sem_pulso", "acls_tachycardia_2025"],
    ["bradi_sem_pulso", "acls_bradycardia_2025"],
  ];

  for (const [nodeId, protocolId] of casos) {
    if (!semantics.includes(`fromNodeId: "${nodeId}"`)) erros.push(`semantics sem ${nodeId}`);
    if (!semantics.includes(`fromProtocolId: "${protocolId}"`)) erros.push(`semantics sem protocolId ${protocolId}`);
    if (!semantics.includes('semantic: "handoff_candidate"')) erros.push("handoff_candidate ausente do registry");
    if (!semantics.includes('candidateMode: "terminal"')) erros.push("candidateMode terminal ausente");
    if (!debts.includes(`nodeId: "${nodeId}"`)) erros.push(`debt registry sem ${nodeId}`);
    if (!debts.includes(`protocolId: "${protocolId}"`)) erros.push(`debt registry sem ${protocolId}`);
  }

  if (!debts.includes('targetModuleId: "pcr-adulto"')) erros.push("dívidas não apontam para pcr-adulto");
  if (!debts.includes('expectedMode: "terminal"')) erros.push("dívidas sem modo terminal esperado");
}

if (erros.length) {
  console.error("\n❌ target promotion debts inválidas\n");
  erros.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log(promovida
  ? "✅ Promoções para PCR concluídas: contratos terminais ativos e dívidas/candidates removidos."
  : "✅ Candidatos de promoção para PCR permanecem explícitos, terminais e ainda não promovidos.");
