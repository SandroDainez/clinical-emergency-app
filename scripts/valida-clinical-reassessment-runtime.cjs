#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const runtime = fs.readFileSync(path.resolve(__dirname, "../lib/clinical-reassessment-runtime.ts"), "utf8");
const session = fs.readFileSync(path.resolve(__dirname, "../lib/clinical-session-runtime.ts"), "utf8");
const shell = fs.readFileSync(path.resolve(__dirname, "../components/protocol-screen/acls-decision-flow-screen.tsx"), "utf8");
const bindings = fs.readFileSync(path.resolve(__dirname, "../lib/clinical-reassessment-bindings.ts"), "utf8");
const failures = [];

for (const token of ["requireClinicalReassessment", "completeClinicalReassessment", "listPendingClinicalReassessments", "type: \"reassessment\""]) {
  if (!runtime.includes(token.replace(/\\"/g, '"'))) failures.push(`reassessment runtime sem ${token}`);
}
if (!/resumo obrigatório/.test(runtime)) failures.push("reavaliação pode ser concluída sem resumo");
if (!/clearPendingClinicalReassessments\(\)/.test(session)) failures.push("novo caso não limpa reavaliações pendentes");
if (!shell.includes('import { observeClinicalNodeForReassessment } from "../../lib/clinical-reassessment-node-runtime"')) {
  failures.push("shell real não importa o observer de reavaliação por nó");
}
if (!shell.includes("observeClinicalNodeForReassessment({")) {
  failures.push("shell real não observa a entrada nos nós para abrir/fechar reavaliações");
}
if (!bindings.includes('moduleId: "isr-rapida"')) {
  failures.push("binding de ISR não usa o slug real isr-rapida");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("clinical reassessment runtime: OK");
