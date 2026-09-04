#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const tep = fs.readFileSync(path.join(root, "tep-decision-tree.ts"), "utf8");
const shockI18n = fs.readFileSync(path.join(root, "lib/i18n/modules/choque.ts"), "utf8");
const tepI18n = fs.readFileSync(path.join(root, "lib/i18n/modules/tep.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!shock.includes("Confirmar: ECO (dilatação/disfunção de VD, McConnell)"), "choque: eco ainda aparece como confirmação de TEP");
expect(shock.includes("preferir AngioTC pulmonar quando factível"), "choque: AngioTC não ficou como exame diagnóstico preferido");
expect(shock.includes("NÃO confirma nem exclui TEP isoladamente"), "choque: limite diagnóstico do eco/POCUS ausente");
expect(shock.includes("sinal de McConnell é achado de disfunção de VD"), "choque: McConnell não foi reposicionado como achado de VD");
expect(shock.includes("Em alta probabilidade clínica, avançar para imagem diagnóstica"), "choque: estratégia de alta probabilidade perdeu imagem diagnóstica");

expect(!tep.includes("= suficiente para indicar trombólise em extremis"), "TEP: combinação eco/TVP ainda é tratada como confirmação suficiente automática");
expect(tep.includes("Se a AngioTC for inviável pela instabilidade"), "TEP alto risco: cenário sem AngioTC não ficou explícito");
expect(tep.includes("Ecocardiograma, inclusive sinal de McConnell, NÃO confirma nem exclui TEP isoladamente"), "TEP: limite do eco não ficou explícito");
expect(tep.includes("probabilidade clínica, achados disponíveis, contraindicações e impossibilidade de imagem definitiva"), "TEP: decisão de reperfusão em colapso perdeu integração contextual");
expect(tep.includes("sem transformar um único achado ecográfico em confirmação diagnóstica"), "TEP: proteção contra confirmação por achado isolado ausente");
expect(tep.includes("Não retardar a reperfusão por exames se o colapso for iminente"), "TEP: proteção contra atraso de reperfusão em colapso foi perdida");

expect(shockI18n.includes("NO confirma ni excluye TEP de forma aislada"), "choque ES: tradução do limite diagnóstico ausente");
expect(tepI18n.includes("NO confirma ni excluye TEP de forma aislada"), "TEP ES: tradução do limite diagnóstico ausente");
expect(tepI18n.includes("sin convertir un único hallazgo ecográfico en confirmación diagnóstica"), "TEP ES: proteção contra confirmação por achado isolado ausente");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ TEP AHA/ACC 2026: 14 travas diagnósticas aprovadas.");
