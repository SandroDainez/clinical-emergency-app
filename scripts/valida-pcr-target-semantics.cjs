#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");
const tachy = fs.readFileSync(path.join(raiz, "acls-tachycardia-tree.ts"), "utf8");
const brady = fs.readFileSync(path.join(raiz, "acls-bradycardia-tree.ts"), "utf8");

function trechoNo(texto, nodeId) {
  const inicio = texto.indexOf(`${nodeId}: {`);
  if (inicio < 0) return null;
  const proximo = texto.indexOf("\n    ", inicio + nodeId.length + 4);
  return texto.slice(inicio, proximo > inicio ? proximo : texto.length);
}

const erros = [];
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

for (const nodeId of ["unstable_sem_pulso", "bradi_sem_pulso"]) {
  const texto = nodeId.startsWith("bradi") ? brady : tachy;
  const no = trechoNo(texto, nodeId);
  if (no && !/Sem pulso|perdeu o pulso|perda de pulso|PCR/i.test(no)) {
    erros.push(`${nodeId} não documenta estado atual sem pulso/PCR`);
  }
}

for (const nodeId of ["unstable_disposition", "stable_reassess"]) {
  const no = trechoNo(tachy, nodeId);
  if (no && !/Se perder o pulso|se o paciente perder o pulso/i.test(no)) {
    erros.push(`${nodeId} não documenta PCR como contingência futura`);
  }
}

if (!registry.includes('handoff_candidate') || !registry.includes('contingency')) {
  erros.push("taxonomia ampliada de targets não encontrada");
}

if (erros.length) {
  console.error("\n❌ semântica de targets para PCR inválida\n");
  erros.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log("\n✅ targets para PCR distinguem handoff atual de contingência futura.\n");
