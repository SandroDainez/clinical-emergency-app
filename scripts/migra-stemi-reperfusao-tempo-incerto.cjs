#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const target = path.resolve(__dirname, "../coronary-decision-tree.ts");
if (!fs.existsSync(target)) throw new Error(`Árvore coronária não encontrada: ${target}`);

let source = fs.readFileSync(target, "utf8");
const original = source;

const oldOptions = `      options: [\n        { id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },\n        { id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },\n      ],\n    },`;

const newOptions = `      options: [\n        { id: "icp", label: "Sim — ICP primária em ≤ 120 min", next: "stemi_icp" },\n        { id: "fibrino", label: "Não — ICP indisponível em tempo", next: "stemi_fibrino_check" },\n        { id: "nao_sei", label: "Não sei o tempo real — confirmar agora", next: "stemi_reperfusao_tempo_incerto" },\n      ],\n    },`;

const beforeIcp = `    stemi_icp: {`;
const guidedNode = `    stemi_reperfusao_tempo_incerto: {\n      id: "stemi_reperfusao_tempo_incerto",\n      type: "action",\n      title: "Confirmar o tempo real até a ICP",\n      summary: "Não transforme tempo desconhecido em decisão de reperfusão. Obtenha agora a estimativa real do primeiro contato médico até o primeiro dispositivo.",\n      actions: [\n        "Acionar imediatamente a hemodinâmica/central de transferência e confirmar aceitação, transporte e disponibilidade real da sala.",\n        "Estimar o intervalo do PRIMEIRO CONTATO MÉDICO até o primeiro dispositivo, incluindo os atrasos reais de transferência — não usar apenas o tempo de transporte.",\n        "Se a ICP puder ocorrer em até 120 min do primeiro contato médico, seguir para ICP primária.",\n        "Se a ICP não puder ocorrer em até 120 min e o STEMI estiver na janela apropriada, avaliar fibrinólise sem demora, após checar contraindicações.",\n        "Enquanto confirma a estratégia, manter as medidas iniciais do STEMI e preparar em paralelo a reperfusão; não classificar disponibilidade por suposição.",\n      ],\n      next: "stemi_reperfusao",\n    },\n\n`;

function replaceOnce(label, from, to) {
  const first = source.indexOf(from);
  if (first < 0) {
    if (source.includes(to)) return;
    throw new Error(`${label}: contexto esperado não encontrado; abortando.`);
  }
  if (source.indexOf(from, first + from.length) >= 0) {
    throw new Error(`${label}: contexto apareceu mais de uma vez; abortando.`);
  }
  source = source.replace(from, to);
}

replaceOnce("opções de reperfusão", oldOptions, newOptions);
if (!source.includes('id: "stemi_reperfusao_tempo_incerto"')) {
  replaceOnce("inserção do nó guiado", beforeIcp, guidedNode + beforeIcp);
}

if (source === original) {
  console.log("Ramo de tempo incerto da reperfusão já estava aplicado.");
  process.exit(0);
}

const required = [
  'id: "stemi_reperfusao"',
  'id: "nao_sei"',
  'next: "stemi_reperfusao_tempo_incerto"',
  'id: "stemi_reperfusao_tempo_incerto"',
  'next: "stemi_reperfusao"',
  "120 min",
  "PRIMEIRO CONTATO MÉDICO",
];
for (const token of required) {
  if (!source.includes(token)) throw new Error(`Invariante ausente após migração: ${token}`);
}

fs.writeFileSync(target, source, "utf8");
console.log("Ramo guiado de tempo incerto da reperfusão STEMI aplicado com retorno à decisão.");
