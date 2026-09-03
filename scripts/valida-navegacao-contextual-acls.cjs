const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const registry = fs.readFileSync(path.join(root, "lib/clinical-context-navigation.ts"), "utf8");
const screen = fs.readFileSync(path.join(root, "components/protocol-screen/acls-protocol-screen.tsx"), "utf8");

const contracts = [...registry.matchAll(/id:\s*"pcr-ref-[^"]+"[\s\S]*?fromModuleId:\s*"pcr-adulto"[\s\S]*?toModuleId:\s*"([^"]+)"[\s\S]*?semantic:\s*"reference"/g)];
if (contracts.length !== 8) throw new Error(`Esperados 8 atalhos contextuais ACLS; encontrados ${contracts.length}.`);
if (!registry.includes("buildClinicalContextHref")) throw new Error("Builder de rota contextual ausente.");
if (!registry.includes("executeClinicalContextNavigation")) throw new Error("Executor canônico de navegação contextual ausente.");
if (!registry.includes("ClinicalContextNavigationResumePolicy")) throw new Error("Política de retomada não pertence ao contrato contextual.");
if (!registry.includes('resume: { protocolId: "pcr_adulto", suspectedCauses: ["hipoxia"] }')) {
  throw new Error("Transição OVACE → PCR perdeu a causa conhecida hipóxia na política do contrato.");
}
if (!registry.includes("markProtocolSessionForResume(")) {
  throw new Error("Executor contextual não prepara retomada da sessão.");
}
if (!registry.includes("navigate(buildClinicalContextHref(contract))")) {
  throw new Error("Executor contextual não é responsável pela rota final.");
}
if (!screen.includes("ACLS_REFERENCE_NAVIGATION.map")) throw new Error("Tela de PCR não consome o registry contextual.");
if (!screen.includes("buildClinicalContextHref(contract)")) throw new Error("Tela de PCR ainda não deriva atalhos do contrato contextual.");

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
  ["pcr-rosc-pos-pcr", "terminal_transition"],
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
if (screen.includes("causas-reversiveis-acls?from_module=pcr-adulto")) throw new Error("PCR ainda monta rota de Hs e Ts manualmente.");
if (screen.includes("pos-pcr-acls?from_module=pcr-adulto")) throw new Error("PCR ainda monta rota pós-ROSC manualmente.");
if (!screen.includes('getClinicalContextNavigation("pcr-rosc-pos-pcr")')) throw new Error("PCR não consome contrato terminal pós-ROSC.");

console.log("✅ Navegação ACLS centralizada: contratos têm semântica, política de sessão e executor canônico; telas legadas permanecem mapeadas para migração progressiva.");
