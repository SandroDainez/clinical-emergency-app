#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(__dirname, "..", "lib/i18n/modules/eap.ts");
let src = fs.readFileSync(file, "utf8");

const entries = [
  [
    "⛔ Não usar morfina/opioides de rotina no EAP/insuficiência cardíaca aguda (ESC 2021, Classe III); uso excepcional apenas para dor ou ansiedade graves/intratáveis quando outras medidas falharam.",
    "⛔ No usar morfina/opioides de rutina en el EAP/insuficiencia cardíaca aguda (ESC 2021, Clase III); uso excepcional solo para dolor o ansiedad graves/intratables cuando hayan fallado otras medidas."
  ],
  [
    "⛔ Morfina/opioides NÃO devem ser usados de rotina no EAP/insuficiência cardíaca aguda (ESC 2021, Classe III); reservar apenas para dor ou ansiedade graves/intratáveis que não possam ser controladas de outra forma.",
    "⛔ La morfina/los opioides NO deben usarse de rutina en el EAP/insuficiencia cardíaca aguda (ESC 2021, Clase III); reservarlos solo para dolor o ansiedad graves/intratables que no puedan controlarse de otra forma."
  ],
];

for (const [pt, es] of entries) {
  if (src.includes(`  ${JSON.stringify(pt)}:`)) continue;
  const anchor = "  // ── Evidência ──────────────────────────────────────────────────────────────\n";
  if (!src.includes(anchor)) throw new Error("Âncora de evidência do EAP não encontrada.");
  src = src.replace(anchor, `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n${anchor}`);
}

fs.writeFileSync(file, src);
console.log("✅ EAP: duas mensagens Classe III de morfina/opioides traduzidas integralmente para es-419.");
