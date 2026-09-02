#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const policy = fs.readFileSync(path.join(root, "lib/clinical-gate-policy.ts"), "utf8");
const registry = fs.readFileSync(path.join(root, "lib/clinical-gate-registry.ts"), "utf8");
const runtime = fs.readFileSync(path.join(root, "lib/clinical-gate-runtime.ts"), "utf8");
const avc = fs.readFileSync(path.join(root, "avc-decision-tree.ts"), "utf8");
const sca = fs.readFileSync(path.join(root, "coronary-decision-tree.ts"), "utf8");
const tachy = fs.readFileSync(path.join(root, "acls-tachycardia-tree.ts"), "utf8");

for (const token of ['"hard_stop" | "soft_stop" | "advisory"', "hard stop não pode permitir override", "hard stop exige fonte explícita"]) {
  if (!policy.includes(token)) throw new Error(`Política de gate incompleta: ${token}`);
}

for (const token of [
  'id: "avc-ivt-hemorragia-aguda"',
  'level: "hard_stop"',
  'overrideAllowed: false',
  'id: "sca-tempo-icp-nao-confirmado"',
  'level: "soft_stop"',
  'overrideAllowed: true',
  'id: "taquicardia-sedacao-cardioversao"',
  'level: "advisory"',
]) {
  if (!registry.includes(token)) throw new Error(`Registry de gate incompleto: ${token}`);
}

if (!runtime.includes('hard stop não admite override')) throw new Error("Runtime deve recusar override de hard stop.");
if (!runtime.includes('advisory não bloqueia e não usa override')) throw new Error("Runtime deve recusar override de advisory.");

for (const [text, id] of [[avc, "tc_resultado"], [sca, "stemi_reperfusao"], [tachy, "unstable_cardioversion"]]) {
  if (!text.includes(`id: "${id}"`)) throw new Error(`Nó real do gate ausente: ${id}`);
}

console.log("Política hard/soft/advisory aponta para nós reais e protege override.");
