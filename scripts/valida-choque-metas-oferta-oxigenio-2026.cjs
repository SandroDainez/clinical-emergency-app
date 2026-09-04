#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const shock = fs.readFileSync(path.join(root, "shock-decision-tree.ts"), "utf8");
const i18n = fs.readFileSync(path.join(root, "lib/i18n/modules/choque-einstein.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!shock.includes("As metas valem para qualquer tipo de choque — o tipo define o tratamento, não o alvo."), "summary ainda afirma alvos universais");
expect(!shock.includes("Metas de oferta de O₂: hemoglobina ≥ 7 g/dL e saturação de pulso > 90%."), "Hb/SpO₂ ainda aparecem como metas universais");
expect(shock.includes("os alvos numéricos NÃO são universais"), "individualização de alvos não ficou explícita");
expect(shock.includes("hemodinamicamente estáveis"), "limiar transfusional restritivo perdeu seu contexto de estabilidade");
expect(shock.includes("Hb <7 g/dL"), "referência restritiva de Hb <7 g/dL ausente");
expect(shock.includes("não se aplica automaticamente a hemorragia ativa/exsanguinante"), "exceção de hemorragia ativa ausente");
expect(shock.includes("individualizado em doença cardiovascular/isquemia"), "individualização cardiovascular/isquêmica ausente");
expect(shock.includes("Oxigênio e alvo de saturação também devem seguir hipoxemia e contexto clínico"), "SpO₂ contextual não ficou explícita");
expect(i18n.includes("Los objetivos generales son restaurar la perfusión"), "tradução espanhola do summary ausente");
expect(i18n.includes("no usar hemoglobina ≥7 g/dL ni SpO₂ >90% como objetivos universales"), "tradução espanhola do alerta Hb/SpO₂ ausente");
expect(i18n.includes("hemorragia activa/exanguinante"), "tradução espanhola perdeu exceção hemorrágica");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ Choque: 11 travas para metas contextuais de oferta de O₂ aprovadas.");
