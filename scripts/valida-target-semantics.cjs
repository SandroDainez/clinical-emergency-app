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
];

function trechoNo(texto, nodeId) {
  const inicio = texto.indexOf(`${nodeId}: {`);
  if (inicio < 0) return null;
  const proximo = texto.indexOf("\n    ", inicio + nodeId.length + 4);
  return texto.slice(inicio, proximo > inicio ? proximo : texto.length);
}

const erros = [];
for (const [arquivo, protocolId, nodeId, target, semantic] of casos) {
  const texto = fs.readFileSync(path.join(raiz, arquivo), "utf8");
  if (!texto.includes(`id: \"${protocolId}\"`)) erros.push(`${arquivo}: protocolId ${protocolId} não encontrado`);
  const no = trechoNo(texto, nodeId);
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
  if (!registry.includes(`fromNodeId: \"${nodeId}\"`) || !registry.includes(`targetModuleId: \"${target}\"`) || !registry.includes(`semantic: \"${semantic}\"`)) {
    erros.push(`registry sem contrato esperado ${protocolId}/${nodeId} -> ${target} (${semantic})`);
  }
}

if (!registry.includes('export type ClinicalTargetSemantic = "reference" | "adjunctive_module"')) {
  erros.push("taxonomia reference/adjunctive_module ausente");
}

if (erros.length) {
  console.error("\n❌ target semantics inválida\n");
  erros.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log(`\n✅ ${casos.length} targets terminais classificados sem promover links a handoffs.\n`);
