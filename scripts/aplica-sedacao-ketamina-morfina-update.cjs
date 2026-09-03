#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function update(rel, replacements) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, "utf8");
  for (const [label, before, after] of replacements) {
    const count = src.split(before).length - 1;
    if (count === 0 && src.includes(after)) continue;
    if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
    src = src.replace(before, after);
  }
  fs.writeFileSync(file, src);
}

update("sedation-engine.ts", [
  [
    "ketamine-icp",
    '        "Pode elevar PIC — cautela em TCE grave (segura com ventilação controlada normal).",',
    '        "TCE/PIC: a preocupação histórica de aumento da pressão intracraniana não é sustentada de forma consistente pela evidência contemporânea; manter ventilação, oxigenação e hemodinâmica adequadas e monitorar conforme a gravidade neurológica.",'
  ],
  [
    "morphine-eap",
    '      "Opioide para analgesia moderada a intensa; útil também no edema agudo de pulmão (alívio + venodilatação).",',
    '      "Opioide para analgesia moderada a intensa. No edema agudo de pulmão/insuficiência cardíaca aguda, NÃO usar de rotina; considerar apenas dor ou ansiedade graves/intratáveis quando outras medidas não forem suficientes.",'
  ],
  [
    "morphine-reference",
    '    reference: "PADIS Guidelines 2018.",',
    '    reference: "SCCM PADIS 2018 · ESC Heart Failure Guidelines 2021/ACVC scientific statement sobre opioides na insuficiência cardíaca aguda.",'
  ],
]);

update("eap-decision-tree.ts", [
  [
    "eap-morphine-class",
    '        "Evitar morfina de rotina; reservar para angústia refratária (ESC 2021 IIb).",',
    '        "⛔ Morfina/opioides NÃO devem ser usados de rotina no EAP/insuficiência cardíaca aguda (ESC 2021, Classe III); reservar apenas para dor ou ansiedade graves/intratáveis que não possam ser controladas de outra forma.",'
  ],
]);

update("lib/morfina-dispneia.ts", [
  [
    "morphine-comment-class",
    " * O EAP já traz a ressalva de evidência (ESC 2021 IIb, evitar de rotina). O\n",
    " * O EAP traz a ressalva de evidência atual: ESC 2021 Classe III para uso\n * rotineiro de opioides, exceto dor ou ansiedade graves/intratáveis que não\n * possam ser manejadas de outra forma. O\n"
  ],
]);

console.log("✅ Sedoanalgesia/EAP: cetamina em TCE e morfina no EAP atualizadas sem alterar dose, preparo ou cálculo.");
