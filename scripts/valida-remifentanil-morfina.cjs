#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "sedation-engine.ts"), "utf8");
const i18n = fs.readFileSync(path.join(root, "lib/i18n/modules/sedacao.ts"), "utf8");
const falhas = [];
let ok = 0;

const remi = src.match(/key: "remifentanil"[\s\S]*?(?=\n  \{\n    key: "morfina")/);
if (!remi) falhas.push("sedation-engine: remifentanil não existe como opção operacional antes da morfina.");
else {
  const b = remi[0];
  const checks = [
    [/group: "analgesia"/, "remifentanil não está no grupo analgesia"],
    [/Frasco-ampola 2 mg \(pó liofilizado\)/, "apresentação brasileira de 2 mg ausente"],
    [/Eurofarma[\s\S]*03\/07\/2026/, "fonte brasileira atualizada da apresentação não está declarada"],
    [/50 mcg\/mL · 1 fr \(2 mg\)[\s\S]*40 mL/, "solução adulta de 50 mcg/mL não está operacional"],
    [/unit: "mcg\/kg\/min"/, "unidade da infusão em UTI não é mcg/kg/min"],
    [/defaultDose: "0,1"/, "default de UTI não inicia em 0,1 mcg/kg/min"],
    [/0,10–0,15 mcg\/kg\/min/, "faixa inicial 0,10–0,15 não está visível"],
    [/incrementos de 0,025 mcg\/kg\/min/, "incremento de 0,025 não está visível"],
    [/intervalo mínimo de 5 min/, "intervalo mínimo de 5 min não está visível"],
    [/0,006–0,74 mcg\/kg\/min/, "faixa típica 0,006–0,74 não está declarada"],
    [/0,2 mcg\/kg\/min[\s\S]*sedativo apropriado/, "regra de acrescentar sedativo a 0,2 quando sedação é insuficiente não está declarada"],
    [/UTI: NÃO administrar em bolus/, "veto de bolus em UTI não está visível"],
    [/5–10 min após a descontinuação/, "ponte de analgesia antes da suspensão não está explícita"],
    [/terapia renal substitutiva[\s\S]*não exige ajuste inicial específico/, "semântica renal da bula não está declarada"],
    [/3 dias[\s\S]*não transformar 3 dias em teto automático/, "limitação de evidência >3 dias virou ou pode virar teto artificial"],
  ];
  for (const [re, msg] of checks) {
    if (!re.test(b)) falhas.push(msg); else ok++;
  }
  if (/kind: "bolus"/.test(b)) falhas.push("remifentanil ganhou modo bolus no bloco de UTI — a bula não recomenda bolus em UTI."); else ok++;
  if (/upTo: 0\.74[\s\S]{0,120}tone: "red"/.test(b)) falhas.push("0,74 foi transformado em fronteira vermelha/teto; a bula o descreve como limite da faixa típica, não teto farmacológico."); else ok++;
}

const morph = src.match(/key: "morfina"[\s\S]*?(?=\n  \/\/ ═══ GRUPO 3)/);
if (!morph) falhas.push("bloco da morfina não encontrado.");
else {
  const b = morph[0];
  if (/Evitar em insuficiência renal/.test(b)) falhas.push("morfina ainda usa veto absoluto 'Evitar em insuficiência renal'."); else ok++;
  if (!/M3G\/M6G[\s\S]*reduzir dose|M3G\/M6G[\s\S]*reduzir\/intervalar/.test(b)) falhas.push("morfina perdeu a conduta contextual para acúmulo renal de M3G/M6G."); else ok++;
  if (!/fentanil\/remifentanil/.test(b)) falhas.push("morfina renal não aponta alternativa sem metabólitos ativos relevantes."); else ok++;
}

for (const chave of [
  '"Remifentanil": "Remifentanilo"',
  '"Infusão contínua — UTI ventilada"',
  '"UTI: NÃO administrar em bolus.',
  '"Em disfunção renal significativa, sobretudo no uso contínuo/prolongado',
]) {
  if (!i18n.includes(chave)) falhas.push(`tradução ES ausente para: ${chave.slice(0, 55)}`); else ok++;
}

console.log("\nRemifentanil + morfina renal — caminho operacional e semântica contextual\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — remifentanil operacional em UTI e morfina renal sem veto absoluto\n`);
