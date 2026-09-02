#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const contratos = fs.readFileSync(path.join(raiz, "lib/clinical-transition-contracts.ts"), "utf8");

const casos = [
  {
    arquivo: "shock-decision-tree.ts",
    fromId: "choque",
    deveTerTarget: "drogas-vasoativas",
  },
  {
    arquivo: "dyspnea-decision-tree.ts",
    fromId: "insuficiencia_respiratoria",
    deveTerTarget: "tep",
  },
  {
    arquivo: "seizure-decision-tree.ts",
    fromId: "mal_epileptico",
  },
  {
    arquivo: "eclampsia-decision-tree.ts",
    fromId: "pre_eclampsia_eclampsia_2024",
  },
];

const falhas = [];

for (const caso of casos) {
  const caminho = path.join(raiz, caso.arquivo);
  if (!fs.existsSync(caminho)) {
    falhas.push(`${caso.arquivo}: arquivo ausente`);
    continue;
  }

  const texto = fs.readFileSync(caminho, "utf8");

  if (/disposition\s*:\s*["']other_module["']/.test(texto)) {
    falhas.push(`${caso.arquivo}: apareceu disposition=other_module; revisar semântica antes de criar contrato`);
  }

  if (caso.deveTerTarget) {
    const alvo = new RegExp(`moduleId\\s*:\\s*["']${caso.deveTerTarget}["']`);
    if (!alvo.test(texto)) {
      falhas.push(`${caso.arquivo}: target de apoio ${caso.deveTerTarget} não foi encontrado`);
    }
  }

  const origemNoRegistry = new RegExp(`from\\s*:\\s*["']${caso.fromId}["']`);
  if (origemNoRegistry.test(contratos)) {
    falhas.push(`${caso.arquivo}: ${caso.fromId} entrou no registry apesar de não possuir handoff other_module explícito`);
  }
}

if (falhas.length) {
  console.error("\n❌ targets e handoffs ficaram semanticamente misturados:\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("\n✅ Targets de apoio permanecem separados de handoffs clínicos explícitos.");
console.log("   Choque, insuficiência respiratória, crises convulsivas e pré-eclâmpsia/eclâmpsia não foram promovidos a contratos de interrupção apenas por conterem links para outros módulos.\n");