#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const sedation = fs.readFileSync(path.join(root, "sedation-engine.ts"), "utf8");
const sedEs = fs.readFileSync(path.join(root, "lib/i18n/modules/sedacao.ts"), "utf8");
const fail = (m) => { console.error(`❌ Fentanil/rigidez: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };
expect(!sedation.includes("Rigidez torácica com bolus IV rápido em dose alta (> 5 mcg/kg)"), "corte artificial >5 mcg/kg voltou ao alerta");
expect(sedation.includes("Rigidez torácica/laríngea (wooden chest) é rara"), "alerta contextual de rigidez ausente");
expect(sedation.includes("dose alta e administração IV rápida") && sedation.includes("doses menores"), "fatores dose/velocidade e possibilidade em dose menor não estão explícitos");
expect(sedation.includes("não usar 5 mcg/kg como fronteira de segurança"), "engine não rejeita explicitamente o limiar artificial");
expect(sedEs.includes("no usar 5 mcg/kg como frontera de seguridad"), "tradução ES não acompanha o alerta contextual");
console.log("✅ Fentanil: rigidez torácica/laríngea protegida sem fronteira artificial de 5 mcg/kg.");
