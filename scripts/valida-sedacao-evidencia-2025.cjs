#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const src = fs.readFileSync(path.resolve(__dirname, "..", "sedation-engine.ts"), "utf8");
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

console.log("✅ Sedoanalgesia: mensagens de seleção de sedativo e alergia ao propofol alinhadas à evidência revisada, sem alterar dose.");
