#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const engineFile = path.join(root, "sedation-engine.ts");
let engine = fs.readFileSync(engineFile, "utf8");
const before = '        "Rigidez torácica com bolus IV rápido em dose alta (> 5 mcg/kg).",';
const after = '        "Rigidez torácica/laríngea (wooden chest) é rara, mas pode comprometer a ventilação; é favorecida por dose alta e administração IV rápida, porém também foi descrita com doses menores — não usar 5 mcg/kg como fronteira de segurança. Administrar bolus lentamente e reconhecer ventilação difícil súbita após fentanil.",';
const count = engine.split(before).length - 1;
if (count === 1) engine = engine.replace(before, after);
else if (count !== 0 || !engine.includes(after)) throw new Error(`fentanil-rigidez: esperado 1 alvo, encontrados ${count}`);
fs.writeFileSync(engineFile, engine);

const i18nFile = path.join(root, "lib/i18n/modules/sedacao.ts");
let i18n = fs.readFileSync(i18nFile, "utf8");
const pt = "Rigidez torácica/laríngea (wooden chest) é rara, mas pode comprometer a ventilação; é favorecida por dose alta e administração IV rápida, porém também foi descrita com doses menores — não usar 5 mcg/kg como fronteira de segurança. Administrar bolus lentamente e reconhecer ventilação difícil súbita após fentanil.";
const es = "La rigidez torácica/laríngea (wooden chest) es rara, pero puede comprometer la ventilación; se favorece por dosis altas y administración IV rápida, aunque también se ha descrito con dosis menores — no usar 5 mcg/kg como frontera de seguridad. Administrar los bolos lentamente y reconocer la dificultad ventilatoria súbita tras fentanilo.";
if (!i18n.includes(`  ${JSON.stringify(pt)}:`)) {
  const at = i18n.lastIndexOf("};");
  if (at < 0) throw new Error("Fechamento do dicionário ES_SEDACAO não encontrado.");
  i18n = i18n.slice(0, at) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + i18n.slice(at);
  fs.writeFileSync(i18nFile, i18n);
}
console.log("✅ Fentanil: rigidez torácica/laríngea descrita por dose/velocidade sem corte artificial de 5 mcg/kg.");
