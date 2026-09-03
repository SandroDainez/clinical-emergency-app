#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(__dirname, "..", "sedation-engine.ts");
let src = fs.readFileSync(file, "utf8");

function replaceOnce(label, before, after) {
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

replaceOnce(
  "sugammadex-always",
  '        "Manter sugamadex à beira leito SEMPRE que rocurônio em uso.",',
  '        "Se rocurônio for escolhido em uma via aérea na qual reversão rápida com sugamadex faça parte do plano de falha/despertar, pré-calcular a dose e garantir disponibilidade imediata antes da indução. Isso não transforma sugamadex em requisito universal à beira leito durante toda infusão de rocurônio em UTI.",'
);
replaceOnce(
  "magnesium-fixed-reduction",
  '        "MgSO₄ potencializa — reduzir dose 30–50% (ex.: eclâmpsia). Monitorar TOF.",',
  '        "MgSO₄ potencializa e pode prolongar o bloqueio neuromuscular. Não aplicar redução percentual fixa universal: usar monitorização quantitativa/TOF quando possível e titular doses subsequentes à resposta clínica e neuromuscular.",'
);
replaceOnce(
  "rocuronium-reference",
  '    reference: "Miller\'s Anesthesia 9ª ed. · ASA Difficult Airway 2022.",',
  '    reference: "Miller\'s Anesthesia 9ª ed. · ESAIC Neuromuscular Blockade Guideline 2023 · Difficult Airway guidance · revisão de interação MgSO₄–BNM.",'
);

fs.writeFileSync(file, src);
console.log("✅ Rocurônio: sugamadex e interação com MgSO₄ contextualizados sem alterar dose de ISR.");
