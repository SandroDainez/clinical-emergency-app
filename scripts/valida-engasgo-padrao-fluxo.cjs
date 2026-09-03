const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const screen = fs.readFileSync(path.join(root, "components/protocol-screen/acls-choking-screen.tsx"), "utf8");
const catalog = fs.readFileSync(path.join(root, "clinical-modules.ts"), "utf8");

if (!screen.includes("<ClinicalShellHost")) throw new Error("Engasgo não usa o shell canônico de fluxo.");
if (!screen.includes('moduleSlug="ovace-adulto"')) throw new Error("Shell do Engasgo não declara o módulo canônico.");
if (screen.includes("<ReferenceBackHeader")) throw new Error("Engasgo ainda usa cabeçalho de referência.");
if (screen.indexOf("<ClinicalShellHost") > screen.indexOf("<ScrollView")) {
  throw new Error("Cabeçalho do Engasgo deve permanecer fora da rolagem.");
}
if (screen.indexOf("<View style={s.guideCard}>") > screen.indexOf("<View style={s.introCard}>")) {
  throw new Error("A decisão dominante deve vir antes do contexto de leitura.");
}

const entry = catalog.match(/id:\s*"ovace-adulto"[\s\S]*?presentation:\s*"([^"]+)"/);
if (entry?.[1] !== "flow") throw new Error("Engasgo deve permanecer classificado como fluxo.");

console.log("✅ Engasgo usa shell de fluxo e prioriza a decisão clínica sem alterar conduta.");
