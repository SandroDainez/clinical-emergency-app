#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");
const transitions = fs.readFileSync(path.join(raiz, "lib/clinical-transition-contracts.ts"), "utf8");
const debts = fs.readFileSync(path.join(raiz, "clinical-safety-cases/target-promotion-debts.ts"), "utf8");
const tachy = fs.readFileSync(path.join(raiz, "acls-tachycardia-tree.ts"), "utf8");
const brady = fs.readFileSync(path.join(raiz, "acls-bradycardia-tree.ts"), "utf8");

const erros = [];
const promovida =
  transitions.includes('id: "taquicardia-sem-pulso-pcr-terminal"') &&
  transitions.includes('id: "bradicardia-sem-pulso-pcr-terminal"');

function trechoNo(texto, nodeId) {
  const marker = `    ${nodeId}: {`;
  const inicio = texto.indexOf(marker);
  if (inicio < 0) return null;
  const tail = texto.slice(inicio + marker.length);
  const sibling = tail.match(/\n    [A-Za-z0-9_]+:\s*\{/);
  const fim = sibling ? inicio + marker.length + sibling.index : texto.length;
  return texto.slice(inicio, fim);
}

if (promovida) {
  for (const [texto, nodeId] of [[tachy, "unstable_sem_pulso"], [brady, "bradi_sem_pulso"]]) {
    const no = trechoNo(texto, nodeId);
    if (!no) erros.push(`nó ${nodeId} não encontrado`);
    else {
      if (!no.includes('disposition: "other_module"')) erros.push(`${nodeId} não foi promovido para other_module`);
      if (!/Sem pulso|perdeu o pulso|perda de pulso|PCR/i.test(no)) erros.push(`${nodeId} não documenta estado atual sem pulso/PCR`);
    }
  }
  for (const id of ["taquicardia-sem-pulso-pcr-terminal", "bradicardia-sem-pulso-pcr-terminal"]) {
    if (!transitions.includes(`id: "${id}"`)) erros.push(`registry de transição sem ${id}`);
  }
  if (!transitions.includes('to: "pcr-adulto"')) erros.push("handoffs promovidos não apontam para pcr-adulto");
  if (!transitions.includes('mode: "terminal"')) erros.push("handoffs promovidos perderam modo terminal");
  if (registry.includes('fromNodeId: "unstable_sem_pulso"') || registry.includes('fromNodeId: "bradi_sem_pulso"')) {
    erros.push("candidatos antigos para PCR permaneceram no registry semântico após promoção");
  }
  if (debts.includes('tachy-pulseless-to-pcr') || debts.includes('brady-pulseless-to-pcr')) {
    erros.push("dívida de promoção para PCR permaneceu aberta após promoção");
  }
} else {
  const casos = [
    [tachy, "unstable_sem_pulso", "handoff_candidate", "terminal"],
    [tachy, "unstable_disposition", "contingency", null],
    [tachy, "stable_reassess", "contingency", null],
    [brady, "bradi_sem_pulso", "handoff_candidate", "terminal"],
  ];

  for (const [texto, nodeId, semantic, candidateMode] of casos) {
    const no = trechoNo(texto, nodeId);
    if (!no) {
      erros.push(`nó ${nodeId} não encontrado`);
      continue;
    }
    if (!no.includes('moduleId: "pcr-adulto"')) erros.push(`${nodeId} não aponta para pcr-adulto`);
    if (!registry.includes(`fromNodeId: "${nodeId}"`)) erros.push(`registry sem ${nodeId}`);
    if (!registry.includes(`semantic: "${semantic}"`)) erros.push(`${nodeId} sem semantic ${semantic}`);
    if (candidateMode && !registry.includes(`candidateMode: "${candidateMode}"`)) {
      erros.push(`${nodeId} candidato sem candidateMode ${candidateMode}`);
    }
  }
}

for (const nodeId of ["unstable_disposition", "stable_reassess"]) {
  const no = trechoNo(tachy, nodeId);
  if (no && !/Se perder o pulso|se o paciente perder o pulso/i.test(no)) {
    erros.push(`${nodeId} não documenta PCR como contingência futura`);
  }
}

if (!registry.includes('contingency')) erros.push("taxonomia de contingência não encontrada");

if (erros.length) {
  console.error("\n❌ semântica de targets para PCR inválida\n");
  erros.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log(promovida
  ? "✅ PCR: targets atuais sem pulso estão promovidos a handoffs terminais; contingências futuras permanecem separadas."
  : "✅ PCR: candidatos de handoff atual e contingências futuras permanecem semanticamente separados.");
