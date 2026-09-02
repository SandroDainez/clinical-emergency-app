#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(root, "protocol-evidence", "sca.ts"), "utf8");
const tree = fs.readFileSync(path.join(root, "coronary-decision-tree.ts"), "utf8");
const tnk = fs.readFileSync(path.join(root, "lib", "drug-knowledge", "tenecteplase.ts"), "utf8");
const failures = [];

for (const nodeId of ["entry", "stemi_fibrinolise"]) {
  if (!tree.includes(`id: "${nodeId}"`)) failures.push(`SCA registry aponta para nó inexistente: ${nodeId}`);
  if (!registry.includes(`nodeId: "${nodeId}"`)) failures.push(`SCA registry sem binding ${nodeId}`);
}

for (const token of ["<60 kg: 30 mg", "60–69 kg: 35 mg", "70–79 kg: 40 mg", "80–89 kg: 45 mg", "≥90 kg: 50 mg"]) {
  if (!tnk.includes(token)) failures.push(`TNK STEMI sem faixa padrão: ${token}`);
}

const canonicalStemi = tnk.split('indicationId: "stemi_fibrinolise_padrao"')[1] ?? "";
if (/≥\s*75|75 anos|metade da dose|half/i.test(canonicalStemi)) {
  failures.push("regra etária condicional foi promovida indevidamente a regime padrão universal do TNK no STEMI");
}

if (failures.length) {
  console.error("\n❌ Evidence governance — SCA\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("✅ SCA: regime padrão de TNK e bindings preservados sem meia-dose etária universal.");
