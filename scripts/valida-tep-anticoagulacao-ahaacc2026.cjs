#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const tep = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");
const i18n = fs.readFileSync(path.join(root, "lib/i18n/modules/tep.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!tep.includes("HNF é o anticoagulante de escolha no alto risco"), "TEP: HNF ainda aparece como escolha preferida universal no alto risco");
expect(!tep.includes("HBPM preferida à HNF na maioria das categorias C–E, exceto quando se planeja trombólise"), "TEP: exceção automática antiga para trombólise ainda presente");
expect(tep.includes("quando anticoagulação parenteral inicial for necessária nas categorias C1–E1, preferir HBPM à HNF"), "TEP: recomendação AHA/ACC 2026 C1–E1 ausente");
expect(tep.includes("suspeita C2 ou superior e o risco hemorrágico for baixo"), "TEP: anticoagulação antes de imagem atrasada em C2+ não ficou condicionada ao risco hemorrágico");
expect(tep.includes("TEP de alto risco, por si só, NÃO torna HNF o anticoagulante parenteral preferido"), "TEP: proteção contra preferência automática por HNF ausente");
expect(tep.includes("Após trombólise ou procedimento endovascular, HBPM também é preferida"), "TEP: preferência pós-procedimento/pós-trombólise ausente");
expect(tep.includes("durante a infusão trombolítica, seguir o protocolo específico"), "TEP: incerteza durante a própria infusão trombolítica não ficou explícita");
expect(tep.includes("planejamento de trombólise ou procedimento endovascular NÃO cria exceção automática a favor de HNF"), "TEP: planejamento de intervenção ainda poderia virar exceção automática para HNF");
expect(tep.includes("DOAC é preferido a antagonista da vitamina K quando elegível"), "TEP: preferência por DOAC na fase oral foi perdida");
expect(i18n.includes("AHA/ACC 2026 recomienda HBPM sobre HNF en categorías C1–E1"), "TEP ES: preferência HBPM/HNF ausente");
expect(i18n.includes("NO convierte a HNF en el anticoagulante parenteral preferido"), "TEP ES: proteção contra HNF universal ausente");
expect(i18n.includes("no hay evidencia suficiente para elegir HBPM sobre HNF en ese intervalo"), "TEP ES: incerteza durante infusão trombolítica ausente");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ TEP AHA/ACC 2026: 12 travas de anticoagulação parenteral aprovadas.");
