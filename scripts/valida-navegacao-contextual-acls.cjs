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

for (const [id, semantic] of [
  ["ovace-inconsciente-pcr", "terminal_transition"],
  ["gestacao-pcr-adulto", "returnable_subflow"],
  ["gestacao-pre-eclampsia-referencia", "reference"],
]) {
  const expression = new RegExp(`id:\\s*"${id}"[\\s\\S]*?semantic:\\s*"${semantic}"`);
  if (!expression.test(registry)) throw new Error(`${id}: semântica ${semantic} ausente.`);
}

const choking = fs.readFileSync(path.join(root, "components/protocol-screen/acls-choking-screen.tsx"), "utf8");
const pregnancy = fs.readFileSync(path.join(root, "components/protocol-screen/acls-pregnancy-screen.tsx"), "utf8");
if (choking.includes("pcr-adulto?from_module=ovace-adulto")) throw new Error("Engasgo ainda monta a rota de PCR manualmente.");
if (pregnancy.includes("?from_module=pcr-gestacao-acls")) throw new Error("Gestação ainda monta rotas clínicas manualmente.");
if (!choking.includes('getClinicalContextNavigation("ovace-inconsciente-pcr")')) throw new Error("Engasgo não consome contrato terminal.");
if (!pregnancy.includes('getClinicalContextNavigation("gestacao-pcr-adulto")')) throw new Error("Gestação não consome contrato do subfluxo PCR.");

console.log("✅ Navegação ACLS centralizada: 8 consultas, 1 transição terminal, 1 subfluxo retornável e 1 consulta obstétrica.");
