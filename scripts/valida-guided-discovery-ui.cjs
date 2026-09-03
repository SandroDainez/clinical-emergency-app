#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const card = fs.readFileSync(path.join(root, "components/ui-v2/guided-discovery-card.tsx"), "utf8");
const adapter = fs.readFileSync(path.join(root, "lib/guided-discovery-adapter.ts"), "utf8");
const registry = fs.readFileSync(path.join(root, "lib/guided-discovery-registry.ts"), "utf8");
const index = fs.readFileSync(path.join(root, "components/ui-v2/index.ts"), "utf8");
const showcase = fs.readFileSync(path.join(root, "app/dev/guided-discovery.tsx"), "utf8");

for (const token of ["missingInformation", "sufficientWhen", "steps.map", "readyInTree"]) {
  if (!adapter.includes(token)) throw new Error(`Adapter incompleto: ${token}`);
}
if (!adapter.includes("guidedDiscoveryFor")) throw new Error("Adapter deve consultar o registry canônico.");

for (const forbidden of ["DecisionTreeEngine", "expo-router", "router.push", "router.replace"] ) {
  if (card.includes(forbidden)) throw new Error(`Componente visual ganhou dependência proibida: ${forbidden}`);
}

for (const clinicalToken of ["anticoagulante", "120 min", "capnografia", "hipoperfusão"]) {
  if (card.toLowerCase().includes(clinicalToken.toLowerCase())) {
    throw new Error(`Componente visual duplicou conteúdo clínico: ${clinicalToken}`);
  }
}

if (!index.includes("GuidedDiscoveryCard")) throw new Error("GuidedDiscoveryCard não exportado no índice UI V2.");
if (!showcase.includes("guidedDiscoveryViewModel")) throw new Error("Showcase deve consumir o adapter, não texto clínico local.");
if (!showcase.includes('["avc", "hic_anticoag"]')) throw new Error("Showcase não cobre descoberta guiada de HIC.");
if (!showcase.includes('["tep", "estabilidade"]')) throw new Error("Showcase não cobre descoberta existente de TEP.");
if (!registry.includes("GUIDED_DISCOVERY_REGISTRY")) throw new Error("Registry canônico ausente.");

console.log("UI de descoberta guiada preserva fronteira domínio -> adapter -> apresentação.");
