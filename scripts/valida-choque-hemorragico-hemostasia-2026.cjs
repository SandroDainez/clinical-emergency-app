#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const es = fs.readFileSync(path.join(root, "lib/i18n/modules/choque.ts"), "utf8");
const failures = [];
const expect = (ok, msg) => { if (!ok) failures.push(msg); };

expect(!shock.includes("cloreto de cálcio a cada 2 hemocomponentes"), "regime fixo de cálcio a cada 2 bolsas ainda presente");
expect(shock.includes("monitorar cálcio IONIZADO precocemente e de forma seriada"), "monitorização seriada de cálcio ionizado ausente");
expect(shock.includes("1,1–1,3 mmol/L"), "faixa normal de cálcio ionizado ausente");
expect(shock.includes("Ca²⁺ ionizado <0,9 mmol/L"), "gatilho de correção rápida de hipocalcemia ausente");
expect(shock.includes("Não prescrever cálcio por número fixo universal de bolsas"), "proibição de calendário fixo de cálcio ausente");
expect(shock.includes("dentro de 3 h da lesão"), "janela de TXA em trauma ausente");
expect(shock.includes("1 g IV em 10 min seguido de 1 g IV em 8 h"), "regime de TXA europeu ausente");
expect(shock.includes("Não aguardar tromboelastometria/viscoelastometria para iniciar TXA"), "TXA ainda pode ser atrasado por VEM");
expect(shock.includes("PT/INR, fibrinogênio de Clauss, plaquetas e/ou viscoelastometria"), "monitorização hemostática precoce incompleta");
expect(shock.includes("ativar protocolo de transfusão maciça/ressuscitação hemostática local"), "MTP/ressuscitação hemostática não está explicitamente acionável");
expect(shock.includes("evitando reposição empírica prolongada sem monitorização"), "falta trava contra reposição empírica prolongada");
expect(shock.includes("fibrinogênio de Clauss ≤1,5 g/L"), "limiar de hipofibrinogenemia ausente");
expect(shock.includes("dose inicial de 3–4 g"), "dose inicial de fibrinogênio/crio ausente");
expect(shock.includes("redose guiada por viscoelastometria e/ou fibrinogênio laboratorial"), "redose dirigida de fibrinogênio ausente");
expect(es.includes("No prescribir calcio por un número fijo universal de bolsas"), "tradução espanhola de cálcio ausente");
expect(es.includes("No esperar tromboelastometría/viscoelastometría para iniciar TXA"), "tradução espanhola de TXA ausente");
expect(es.includes("fibrinógeno de Clauss ≤1,5 g/L"), "tradução espanhola de fibrinogênio ausente");

if (failures.length) {
  console.error("❌ Choque hemorrágico/hemostasia 2026:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log("✅ Choque hemorrágico/hemostasia 2026: 17 travas aprovadas.");
