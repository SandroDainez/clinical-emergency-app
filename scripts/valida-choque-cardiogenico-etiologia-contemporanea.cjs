#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const i18n = fs.readFileSync(path.join(root, "lib/i18n/modules/choque.ts"), "utf8");
const i18nEinstein = fs.readFileSync(path.join(root, "lib/i18n/modules/choque-einstein.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!shock.includes("CERCA DE 80% DOS CHOQUES CARDIOGÊNICOS"), "summary ainda afirma 80% de SCA");
expect(!shock.includes("Cerca de 80% dos choques cardiogênicos"), "evidence ainda afirma 80% de SCA");
expect(!shock.includes("responde por até 30% dos casos"), "percentual fixo de IC descompensada ainda presente");
expect(shock.includes("CHOQUE CARDIOGÊNICO NÃO É SINÔNIMO DE IAM"), "summary contemporâneo não foi aplicado");
expect(shock.includes("não representa todo o espectro contemporâneo"), "evidence não preserva heterogeneidade etiológica");
expect(shock.includes("Obter ECG precocemente"), "ECG precoce deixou de ser orientado");
expect(shock.includes("ecocardiografia para definir o fenótipo"), "ecocardiografia precoce deixou de orientar fenótipo");
expect(i18n.includes("EL CHOQUE CARDIOGÉNICO NO ES SINÓNIMO DE INFARTO"), "tradução espanhola do summary não foi atualizada");
expect(i18nEinstein.includes("El síndrome coronario agudo es una causa crítica y tiempo-dependiente"), "tradução espanhola da evidência de SCA não foi atualizada");
expect(i18nEinstein.includes("El choque cardiogénico no relacionado con infarto es sustancial"), "tradução espanhola da etiologia não-IAM não foi atualizada");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ Choque cardiogênico: percentuais históricos removidos; etiologia contemporânea e traduções preservadas.");
