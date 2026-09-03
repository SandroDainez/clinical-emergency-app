#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "sedation-engine.ts"), "utf8");
const eap = fs.readFileSync(path.join(root, "eap-decision-tree.ts"), "utf8");
const morphine = fs.readFileSync(path.join(root, "lib/morfina-dispneia.ts"), "utf8");
const fail = (m) => { console.error(`❌ Sedação evidência 2025: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };

expect(!src.includes('"Não usar em alergia a ovo ou soja."'), "texto absoluto e desatualizado sobre alergia a ovo/soja voltou ao propofol");
expect(
  src.includes("Alergia alimentar a ovo ou soja, isoladamente, não exige evitar propofol"),
  "correção sobre alergia alimentar e propofol ausente"
);
expect(
  src.includes("Preferir quando sedação leve e/ou redução de delirium são prioridades"),
  "seleção de dexmedetomidina não reflete o PADIS Focused Update 2025"
);
expect(
  (src.match(/Focused Update 2025/g) || []).length >= 3,
  "propofol, midazolam e dexmedetomidina precisam apontar para a atualização PADIS 2025"
);
expect(
  src.includes("história de reação ao próprio propofol/formulação deve ser tratada como hipersensibilidade medicamentosa"),
  "o texto de propofol perdeu a distinção entre alergia alimentar e reação ao fármaco/formulação"
);

expect(
  !src.includes("Pode elevar PIC — cautela em TCE grave"),
  "aviso histórico de aumento de PIC pela cetamina voltou ao módulo"
);
expect(
  src.includes("a preocupação histórica de aumento da pressão intracraniana não é sustentada de forma consistente pela evidência contemporânea"),
  "mensagem atualizada sobre cetamina/TCE ausente"
);

expect(
  !src.includes("útil também no edema agudo de pulmão (alívio + venodilatação)"),
  "morfina voltou a ser apresentada como terapia útil de rotina no EAP"
);
expect(
  src.includes("No edema agudo de pulmão/insuficiência cardíaca aguda, NÃO usar de rotina"),
  "restrição moderna de morfina no EAP ausente da Sedoanalgesia"
);
expect(
  eap.includes("ESC 2021, Classe III"),
  "EAP não registra a recomendação Classe III para opioides de rotina"
);
expect(
  !eap.includes("ESC 2021 IIb"),
  "classificação desatualizada IIb de morfina ainda aparece no EAP"
);
expect(
  morphine.includes("ESC 2021 Classe III para uso"),
  "fonte única da morfina não documenta a governança Classe III atual"
);

console.log("✅ Sedoanalgesia/EAP: seleção de sedativo, alergia ao propofol, cetamina em TCE e morfina no EAP alinhadas à evidência revisada, sem alterar doses.");
