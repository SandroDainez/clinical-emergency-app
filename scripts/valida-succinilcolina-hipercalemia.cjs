#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const sedation = read("sedation-engine.ts");
const rsi = read("rsi-decision-tree.ts");
const sedEs = read("lib/i18n/modules/sedacao.ts");
const rsiEs = read("lib/i18n/modules/isr.ts");
const fail = (m) => { console.error(`❌ Succinilcolina/hipercalemia: ${m}`); process.exit(1); };
const expect = (c, m) => { if (!c) fail(m); };

for (const [name, src] of [["sedation-engine", sedation], ["ISR", rsi]]) {
  expect(!src.includes("hipercalemia (K⁺ > 5,5)"), `${name} voltou a usar K⁺ > 5,5 como corte universal`);
  expect(src.includes("hipercalemia conhecida ou suspeita clinicamente relevante"), `${name} perdeu a formulação contextual de hipercalemia`);
  expect(src.includes("fase aguda") && src.includes("denervação") && src.includes("imobilização prolongada"), `${name} perdeu os estados de up-regulation relevantes`);
}
expect(sedation.includes("não usar um corte isolado de K⁺ como regra universal"), "Sedoanalgesia não explicita a governança sem corte isolado");
expect(rsi.includes("não usar K⁺ > 5,5 como corte universal"), "ISR não explicita que 5,5 não é corte universal");
expect(sedEs.includes("no usar un punto de corte aislado de K⁺ como regla universal"), "tradução ES da Sedoanalgesia não foi sincronizada");
expect(rsiEs.includes("no usar K⁺ > 5,5 como punto de corte universal"), "tradução ES do ISR não foi sincronizada");
expect(!sedEs.includes("Dose PLENA também no instável"), "tradução ES ainda carrega texto antigo do etomidato");
expect(!sedEs.includes("Dose máxima usual: não exceder ~3 ampolas"), "tradução ES ainda carrega heurística antiga do etomidato");

console.log("✅ Succinilcolina: risco de hipercalemia contextual, sem corte universal de K⁺; ISR/Sedoanalgesia e traduções alinhados.");
