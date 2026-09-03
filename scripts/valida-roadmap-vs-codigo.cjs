const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const roadmap = fs.readFileSync(path.join(root, "EMERGENCIAS-2-ROADMAP.md"), "utf8");
const catalog = fs.readFileSync(path.join(root, "clinical-modules.ts"), "utf8");
const transitions = fs.readFileSync(path.join(root, "lib/clinical-transition-contracts.ts"), "utf8");

const entries = [...catalog.matchAll(/id:\s*"([^"]+)"[\s\S]*?route:\s*"([^"]+)"[\s\S]*?presentation:\s*"(flow|reference|calculator)"/g)]
  .map((match) => match[3]);
const counts = entries.reduce((acc, presentation) => {
  acc[presentation] = (acc[presentation] ?? 0) + 1;
  return acc;
}, {});

const expectedCatalogLine = `${counts.flow} fluxos assistenciais, ${counts.reference} referências e ${counts.calculator} calculadoras`;
if (!roadmap.includes(expectedCatalogLine)) {
  throw new Error(`Roadmap não reflete o catálogo atual: esperado “${expectedCatalogLine}”.`);
}

const transitionCount = [...transitions.matchAll(/\n  \{\n    id:/g)].length;
if (!roadmap.includes(`${transitionCount} transições explícitas`)) {
  throw new Error(`Roadmap não registra as ${transitionCount} transições explícitas atuais.`);
}

if (/19 fluxos assistenciais, 8 referências/.test(roadmap)) {
  throw new Error("Roadmap voltou à classificação antiga dos módulos.");
}

console.log(`✅ Roadmap alinhado ao código: ${expectedCatalogLine}; ${transitionCount} transições explícitas.`);
