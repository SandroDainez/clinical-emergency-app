#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const src = fs.readFileSync(path.resolve(__dirname, "..", "sedation-engine.ts"), "utf8");
const fail = (m) => { console.error(`❌ Rocurônio segurança: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };

expect(src.includes('defaultDose: "1,2"'), "dose de ISR do rocurônio 1,2 mg/kg foi alterada");
expect(!src.includes("Manter sugamadex à beira leito SEMPRE que rocurônio em uso"), "regra universal de sugamadex à beira leito voltou ao módulo");
expect(src.includes("reversão rápida com sugamadex faça parte do plano de falha/despertar"), "disponibilidade imediata de sugamadex não está vinculada ao plano de via aérea/falha");
expect(src.includes("pré-calcular a dose e garantir disponibilidade imediata antes da indução"), "plano de reversão rápida não exige preparo prévio quando aplicável");
expect(!src.includes("reduzir dose 30–50%"), "redução percentual fixa de rocurônio com MgSO₄ voltou ao módulo");
expect(src.includes("Não aplicar redução percentual fixa universal"), "interação MgSO₄–rocurônio não explicita que não há redução fixa universal");
expect(src.includes("monitorização quantitativa/TOF"), "potencialização por MgSO₄ não direciona para monitorização neuromuscular");

console.log("✅ Rocurônio: dose de ISR preservada; sugamadex e MgSO₄ tratados de forma contextual e monitorizada.");
