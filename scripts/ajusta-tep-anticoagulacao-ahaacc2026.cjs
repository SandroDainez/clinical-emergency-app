#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const tepPath = path.join(root, "tep-decision-tree.ts");
const i18nPath = path.join(root, "lib/i18n/modules/tep.ts");
let tep = fs.readFileSync(tepPath, "utf8");
let i18n = fs.readFileSync(i18nPath, "utf8");

const replacements = [
  [
    "Se instável: iniciar anticoagulação com HNF e considerar trombólise IMEDIATAMENTE — não aguardar AngioTC se a instabilidade impedir.",
    "Se houver indicação de anticoagulação e não houver contraindicação, iniciar anticoagulação terapêutica precocemente. AHA/ACC 2026: quando anticoagulação parenteral inicial for necessária nas categorias C1–E1, preferir HBPM à HNF; se a imagem estiver atrasada em suspeita C2 ou superior e o risco hemorrágico for baixo, anticoagulação terapêutica pode ser iniciada antes da confirmação. Não atrasar terapia avançada necessária por busca de imagem no colapso iminente."
  ],
  [
    "Emergência com risco de morte. Suporte hemodinâmico cauteloso + HNF JÁ.",
    "Emergência com risco de morte. Suporte hemodinâmico cauteloso + anticoagulação terapêutica quando indicada e não contraindicada."
  ],
  [
    "HNF IV imediata: bolus {hnfBolus} U (80 U/kg, máx 10.000) + {hnfInf} U/h (18 U/kg/h); alvo TTPa 60–100 s. Iniciar ANTES da AngioTC se risco de morte iminente.",
    "Anticoagulação parenteral: AHA/ACC 2026 recomenda HBPM sobre HNF nas categorias C1–E1 quando terapia parenteral inicial é necessária. Se HBPM for inadequada por contraindicação específica ou se o protocolo institucional definir HNF em situação excepcional, usar esquema e monitorização apropriados. Em suspeita C2 ou superior, com baixo risco hemorrágico e atraso de imagem, a anticoagulação terapêutica pode preceder a confirmação."
  ],
  [
    "HNF é o anticoagulante de escolha no alto risco (permite interrupção rápida se for trombolisar).",
    "TEP de alto risco, por si só, NÃO torna HNF o anticoagulante parenteral preferido. AHA/ACC 2026 recomenda HBPM sobre HNF nas categorias C1–E1 e também após trombólise ou procedimento endovascular; durante a própria infusão trombolítica, a evidência é insuficiente para preferir HBPM a HNF, portanto seguir o protocolo periprocedural específico."
  ],
  [
    "Anticoagulação de manutenção: DOAC preferido a antagonista da vitamina K (AHA/ACC 2026); HBPM preferida à HNF na maioria das categorias C–E, exceto quando se planeja trombólise ou há instabilidade que exija reversão rápida.",
    "Anticoagulação: DOAC é preferido a antagonista da vitamina K quando elegível. Para anticoagulação parenteral inicial, AHA/ACC 2026 recomenda HBPM sobre HNF nas categorias C1–E1; planejamento de trombólise ou procedimento endovascular NÃO cria exceção automática a favor de HNF. Após trombólise ou procedimento endovascular, HBPM também é preferida; durante a infusão trombolítica, seguir o protocolo específico porque não há evidência suficiente para escolher HBPM sobre HNF nesse intervalo."
  ],
];

for (const [from, to] of replacements) {
  if (!tep.includes(from) && !tep.includes(to)) {
    throw new Error(`Trecho-alvo não encontrado: ${from.slice(0, 100)}`);
  }
  if (tep.includes(from)) tep = tep.replace(from, to);
}

const es = new Map([
  [replacements[0][1], "Si existe indicación de anticoagulación y no hay contraindicación, iniciar anticoagulación terapéutica precozmente. AHA/ACC 2026: cuando se necesite anticoagulación parenteral inicial en categorías C1–E1, preferir HBPM a HNF; si la imagen se retrasa en sospecha C2 o superior y el riesgo hemorrágico es bajo, puede iniciarse anticoagulación terapéutica antes de la confirmación. No retrasar una terapia avanzada necesaria buscando imagen ante colapso inminente."],
  [replacements[1][1], "Emergencia con riesgo de muerte. Soporte hemodinámico cauteloso + anticoagulación terapéutica cuando esté indicada y no contraindicada."],
  [replacements[2][1], "Anticoagulación parenteral: AHA/ACC 2026 recomienda HBPM sobre HNF en categorías C1–E1 cuando se necesita terapia parenteral inicial. Si HBPM no es adecuada por una contraindicación específica o el protocolo institucional define HNF en una situación excepcional, usar el esquema y la monitorización apropiados. En sospecha C2 o superior, con bajo riesgo hemorrágico y demora de imagen, la anticoagulación terapéutica puede preceder a la confirmación."],
  [replacements[3][1], "El TEP de alto riesgo, por sí solo, NO convierte a HNF en el anticoagulante parenteral preferido. AHA/ACC 2026 recomienda HBPM sobre HNF en categorías C1–E1 y también después de trombólisis o procedimiento endovascular; durante la propia infusión trombolítica, la evidencia es insuficiente para preferir HBPM a HNF, por lo que debe seguirse el protocolo periprocedimiento específico."],
  [replacements[4][1], "Anticoagulación: DOAC se prefiere a antagonista de vitamina K cuando el paciente es elegible. Para anticoagulación parenteral inicial, AHA/ACC 2026 recomienda HBPM sobre HNF en categorías C1–E1; planear trombólisis o un procedimiento endovascular NO crea una excepción automática a favor de HNF. Después de trombólisis o procedimiento endovascular, HBPM también es preferida; durante la infusión trombolítica, seguir el protocolo específico porque no hay evidencia suficiente para elegir HBPM sobre HNF en ese intervalo."],
]);

for (const [pt, tr] of es) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf("\n};");
  if (idx < 0) throw new Error("Fechamento do dicionário TEP não localizado");
  const entry = `\n  ${JSON.stringify(pt)}:\n    ${JSON.stringify(tr)},`;
  i18n = i18n.slice(0, idx) + entry + i18n.slice(idx);
}

fs.writeFileSync(tepPath, tep);
fs.writeFileSync(i18nPath, i18n);
console.log("✅ TEP AHA/ACC 2026: HBPM reposicionada sobre HNF sem exceção automática por alto risco/intervenção.");
