#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(raiz, "lib/clinical-target-semantics.ts"), "utf8");

const casos = [
  ["shock-decision-tree.ts", "choque", "dx_tep", "tep", "reference"],
  ["shock-decision-tree.ts", "choque", "dx_cardio_vd", "sindromes-coronarianas", "reference"],
  ["shock-decision-tree.ts", "choque", "dx_cardio_vd", "drogas-vasoativas", "adjunctive_module"],
  ["shock-decision-tree.ts", "choque", "dx_cardio_frio_umido", "sindromes-coronarianas", "reference"],
  ["shock-decision-tree.ts", "choque", "dx_cardio_frio_umido", "drogas-vasoativas", "adjunctive_module"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "dx_tep", "tep", "reference"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "dx_anafilaxia", "anafilaxia", "reference"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "dx_asma", "ventilacao-mecanica", "adjunctive_module"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "dx_dpoc", "ventilacao-mecanica", "adjunctive_module"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "dx_eap", "edema-agudo-pulmao", "reference"],
  ["dyspnea-decision-tree.ts", "insuficiencia_respiratoria", "dx_sara", "ventilacao-mecanica", "adjunctive_module"],
  ["seizure-decision-tree.ts", "mal_epileptico", "nao_convulsivo", "isr-rapida", "adjunctive_module"],
  ["seizure-decision-tree.ts", "mal_epileptico", "nao_convulsivo", "pre-eclampsia", "reference"],
  ["seizure-decision-tree.ts", "mal_epileptico", "uti", "isr-rapida", "adjunctive_module"],
  ["seizure-decision-tree.ts", "mal_epileptico", "uti", "sedoanalgesia", "adjunctive_module"],
  ["seizure-decision-tree.ts", "mal_epileptico", "uti", "ventilacao-mecanica", "adjunctive_module"],
  ["tce-decision-tree.ts", "tce", "uti", "ventilacao-mecanica", "adjunctive_module"],
  ["tce-decision-tree.ts", "tce", "uti", "sedoanalgesia", "adjunctive_module"],
  ["tce-decision-tree.ts", "tce", "uti", "drogas-vasoativas", "adjunctive_module"],
];

function nodeMap(texto) {
  const starts = [...texto.matchAll(/^    ([A-Za-z0-9_]+):\s*\{/gm)];
  const map = new Map();
  for (let i = 0; i < starts.length; i += 1) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : texto.length;
    map.set(starts[i][1], texto.slice(start, end));
  }
  return map;
}

const erros = [];
const cache = new Map();
for (const [arquivo, protocolId, nodeId, target, semantic] of casos) {
  const texto = cache.get(arquivo)?.texto ?? fs.readFileSync(path.join(raiz, arquivo), "utf8");
  const nodes = cache.get(arquivo)?.nodes ?? nodeMap(texto);
  cache.set(arquivo, { texto, nodes });

  if (!texto.includes(`id: \"${protocolId}\"`)) erros.push(`${arquivo}: protocolId ${protocolId} não encontrado`);
  const no = nodes.get(nodeId);
  if (!no) {
    erros.push(`${arquivo}: nó ${nodeId} não encontrado`);
    continue;
  }
  if (!/disposition: \"(icu|observation|discharge)\"/.test(no)) {
    erros.push(`${arquivo}:${nodeId} não é destino assistencial; revisar semântica de target`);
  }
  if (!no.includes(`moduleId: \"${target}\"`)) {
    erros.push(`${arquivo}:${nodeId} não aponta para ${target}`);
  }

  const expected = `fromProtocolId: \"${protocolId}\"`;
  const nodeExpected = `fromNodeId: \"${nodeId}\"`;
  const targetExpected = `targetModuleId: \"${target}\"`;
  const semanticExpected = `semantic: \"${semantic}\"`;
  const blocks = [...registry.matchAll(/\{[\s\S]*?\}/g)].map((m) => m[0]);
  if (!blocks.some((block) => block.includes(expected) && block.includes(nodeExpected) && block.includes(targetExpected) && block.includes(semanticExpected))) {
    erros.push(`registry sem contrato esperado ${protocolId}/${nodeId} -> ${target} (${semantic})`);
  }
}

for (const semantic of ["reference", "adjunctive_module", "contingency", "handoff_candidate"]) {
  if (!registry.includes(`\"${semantic}\"`)) erros.push(`taxonomia sem ${semantic}`);
}

if (erros.length) {
  console.error("\n❌ target semantics inválida\n");
  erros.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log(`\n✅ ${casos.length} targets terminais classificados sem promover links a handoffs.\n`);
