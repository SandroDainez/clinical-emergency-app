const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(root, "lib/clinical-context-navigation.ts"), "utf8");
const screen = fs.readFileSync(path.join(root, "components/protocol-screen/acls-protocol-screen.tsx"), "utf8");

const contracts = [...registry.matchAll(/id:\s*"pcr-ref-[^"]+"[\s\S]*?fromModuleId:\s*"pcr-adulto"[\s\S]*?toModuleId:\s*"([^"]+)"[\s\S]*?semantic:\s*"reference"/g)];
if (contracts.length !== 8) throw new Error(`Esperados 8 atalhos contextuais ACLS; encontrados ${contracts.length}.`);
if (!registry.includes("buildClinicalContextHref")) throw new Error("Builder de rota contextual ausente.");
if (!screen.includes("ACLS_REFERENCE_NAVIGATION.map")) throw new Error("Tela de PCR não consome o registry contextual.");
if (!screen.includes("buildClinicalContextHref(contract)")) throw new Error("Tela de PCR ainda monta rota contextual por conta própria.");

const legacyRoutes = [
  "ritmos-acls?from_module=pcr-adulto",
  "farmacologia-acls?from_module=pcr-adulto",
  "bradicardia-acls?from_module=pcr-adulto",
  "taquicardia-acls?from_module=pcr-adulto",
  "pcr-gestacao-acls?from_module=pcr-adulto",
];
for (const route of legacyRoutes) {
  if (screen.includes(route)) throw new Error(`Rota contextual ainda hardcoded na tela: ${route}`);
}

console.log("✅ Oito atalhos ACLS centralizados como consultas contextuais, sem handoff artificial.");
