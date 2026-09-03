#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const sedation = fs.readFileSync(path.join(root, "sedation-engine.ts"), "utf8");
const sedEs = fs.readFileSync(path.join(root, "lib/i18n/modules/sedacao.ts"), "utf8");
const fail = (m) => { console.error(`❌ Fentanil/contexto: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };

expect(!sedation.includes("Infusões > 2–4 h prolongam o despertar"), "limiar artificial >2–4 h voltou ao engine");
expect(sedation.includes("não há um corte universal em 2–4 h"), "engine não explicita ausência de corte universal");
expect(sedation.includes("duração, dose e fatores do paciente/doença crítica"), "engine perdeu determinantes clínicos do acúmulo");
expect(sedation.includes("recuperação rápida e previsível") && sedation.includes("remifentanil"), "mensagem prática de recuperação previsível/remifentanil ausente");
expect(sedation.includes("Meia-vida contexto-sensível aumenta progressivamente com a duração da infusão"), "conceito farmacocinético contextual ausente");
expect(sedEs.includes("no existe un punto de corte universal de 2–4 h"), "tradução ES não acompanha a correção do limiar");
expect(sedEs.includes("semivida sensible al contexto aumenta progresivamente"), "tradução ES perdeu o conceito de meia-vida contexto-sensível");

console.log("✅ Fentanil: recuperação pós-infusão descrita por contexto, sem limiar artificial de 2–4 h, com tradução alinhada.");
