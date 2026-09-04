#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const alvos = fs.readFileSync(path.join(root, "lib/alvos-tce.ts"), "utf8");
const tree = fs.readFileSync(path.join(root, "tce-decision-tree.ts"), "utf8");
const i18n = fs.readFileSync(path.join(root, "lib/i18n/modules/tce.ts"), "utf8");
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!alvos.includes("HIPERVENTILAÇÃO DE 3ª LINHA — PaCO₂ 25–34 mmHg"), "alvo institucional 25–34 ainda aparece como 3ª linha");
expect(alvos.includes("PaCO₂ 32–35 mmHg é opção de tier 2"), "SIBICC tier 2 32–35 ausente");
expect(alvos.includes("PaCO₂ 30–32 mmHg aparece apenas no tier 3"), "SIBICC tier 3 30–32 ausente");
expect(alvos.includes("somente quando não há hipoxia tecidual cerebral"), "condição de oxigenação cerebral do algoritmo multimodal ausente");
expect(alvos.includes("Evitar PaCO₂ <30 mmHg"), "piso de segurança <30 ausente");
expect(alvos.includes("NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada"), "proibição BTF de hiperventilação profilática intensa ausente");
expect(alvos.includes("reverter a hipocapnia assim que a medida de resgate deixar de ser necessária"), "reversão precoce da medida de resgate ausente");
expect(tree.includes("TCE_HIPERVENTILACAO_TERCEIRA_LINHA"), "árvore deixou de consumir a fonte canônica de hiperventilação refratária");
expect(tree.includes("TCE_HIPERVENTILACAO_PROIBIDA"), "proibição profilática canônica deixou de ser consumida");
expect(i18n.includes("HIPERVENTILACIÓN EN HIC REFRACTARIA"), "tradução espanhola da nova linha de resgate ausente");
expect(i18n.includes("PaCO₂ 30–32 mmHg aparece solo en el tier 3"), "tradução espanhola perdeu o tier 3");

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log("✅ TCE hiperventilação SIBICC/BTF: 11 travas aprovadas.");
