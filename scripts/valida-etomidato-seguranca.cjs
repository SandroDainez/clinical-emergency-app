#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const src = fs.readFileSync(path.resolve(__dirname, "..", "sedation-engine.ts"), "utf8");
const fail = (m) => { console.error(`❌ Etomidato segurança: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };

expect(src.includes('defaultDose: "0,3"'), "default de indução 0,3 mg/kg foi alterado");
expect(!src.includes("Dose PLENA também no instável"), "etomidato voltou a impor dose plena categórica no instável");
expect(src.includes("0,2–0,3 mg/kg IV é faixa usada em estudos"), "faixa contemporânea de RSI 0,2–0,3 mg/kg não está explicitada");
expect(src.includes("Não reduzir automaticamente apenas pela instabilidade"), "texto perdeu a distinção entre individualização e redução automática por choque");
expect(!src.includes("Dose máxima usual: não exceder ~3 ampolas"), "limite por número de ampolas voltou ao etomidato");
expect(src.includes("Evitar limites por número de ampolas"), "governança por mg/kg do etomidato ausente");
expect(src.includes("0,2–0,6 mg/kg para indução"), "faixa descrita em bula não aparece na informação de individualização");

console.log("✅ Etomidato: 0,3 mg/kg preservado como default, faixa 0,2–0,3 contextualizada e heurística por ampolas removida.");
