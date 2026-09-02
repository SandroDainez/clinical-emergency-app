#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const contracts = fs.readFileSync(path.join(root, "lib/clinical-transition-contracts.ts"), "utf8");
const eap = fs.readFileSync(path.join(root, "eap-decision-tree.ts"), "utf8");
const anaf = fs.readFileSync(path.join(root, "anaphylaxis-decision-tree.ts"), "utf8");

const expected = [
  ["eap-ventilacao", "eap_2024", "ventilacao-mecanica"],
  ["eap-vasoativos", "eap_2024", "drogas-vasoativas"],
  ["anafilaxia-ventilacao", "anaphylaxis_v3", "ventilacao-mecanica"],
  ["anafilaxia-isr", "anaphylaxis_v3", "isr-rapida"],
  ["anafilaxia-vasoativos", "anaphylaxis_v3", "drogas-vasoativas"],
];

for (const [id, from, to] of expected) {
  const start = contracts.indexOf(`id: "${id}"`);
  if (start < 0) throw new Error(`Contrato ausente: ${id}`);
  const end = contracts.indexOf("},", start);
  const entry = contracts.slice(start, end > start ? end : undefined);
  for (const token of [
    `from: "${from}"`,
    `to: "${to}"`,
    'mode: "returnable"',
    'destinationKind: "module"',
    "returnLabel:",
  ]) {
    if (!entry.includes(token)) throw new Error(`${id}: contrato sem ${token}`);
  }
  if (entry.includes('mode: "terminal"') || entry.includes('destinationKind: "external_service"')) {
    throw new Error(`${id}: handoff retornável foi reclassificado como terminal externo.`);
  }
}

for (const token of [
  'id: "transicao_ventilacao"',
  'moduleId: "ventilacao-mecanica"',
  'id: "transicao_vasoativo"',
  'moduleId: "drogas-vasoativas"',
]) {
  if (!eap.includes(token)) throw new Error(`EAP perdeu aresta real: ${token}`);
}

for (const token of [
  'id: "transition_to_ventilation_module"',
  'moduleId: "ventilacao-mecanica"',
  'id: "transition_to_isr"',
  'moduleId: "isr-rapida"',
  'id: "transition_to_vasoactive_module"',
  'moduleId: "drogas-vasoativas"',
]) {
  if (!anaf.includes(token)) throw new Error(`Anafilaxia perdeu aresta real: ${token}`);
}

console.log("Handoffs retornáveis de EAP e Anafilaxia permanecem coerentes com as árvores reais.");
