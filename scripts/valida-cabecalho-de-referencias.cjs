const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const protocolDir = path.join(root, "components/protocol-screen");
const referenceScreens = [
  "acls-rhythms-screen.tsx",
  "acls-pharmacology-screen.tsx",
  "acls-reversible-causes-screen.tsx",
  "acls-pregnancy-screen.tsx",
  "acls-post-rosc-screen.tsx",
];

const canonical = fs.readFileSync(path.join(root, "components/ui-v2/reference-screen-header.tsx"), "utf8");
const adapter = fs.readFileSync(path.join(protocolDir, "reference-back-header.tsx"), "utf8");
const index = fs.readFileSync(path.join(root, "components/ui-v2/index.ts"), "utf8");

if (!canonical.includes("export function ReferenceScreenHeader")) throw new Error("Cabeçalho canônico ausente.");
if (!canonical.includes('tr("Consulta rápida")')) throw new Error("Função de consulta rápida não está visível.");
if (!canonical.includes('tr("Voltar ao atendimento")')) throw new Error("Retorno ao atendimento não está explícito.");
if (!adapter.includes("<ReferenceScreenHeader")) throw new Error("Adaptador não delega ao cabeçalho canônico.");
if (!index.includes("ReferenceScreenHeader,")) throw new Error("Barrel ui-v2 não exporta o cabeçalho.");

for (const file of referenceScreens) {
  const source = fs.readFileSync(path.join(protocolDir, file), "utf8");
  if (!source.includes("<ReferenceBackHeader")) throw new Error(`${file}: adaptador ausente.`);
}

console.log(`OK: ${referenceScreens.length} referências estáticas usam o cabeçalho canônico.`);
