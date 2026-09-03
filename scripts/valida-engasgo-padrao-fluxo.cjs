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
if (!screen.includes('testID="ovace-desfecho"')) throw new Error("Fluxo não registra o desfecho das manobras.");
if (!screen.includes('desfecho === "inconsciente"')) throw new Error("Ponte para PCR não depende do desfecho inconsciente.");
if (!screen.includes("accessibilityState={{ expanded: showSupport }}")) {
  throw new Error("Conteúdo de apoio não usa divulgação progressiva acessível.");
}
if (screen.indexOf("ovace-desfecho") > screen.indexOf("Apoio e sequência completa")) {
  throw new Error("A reavaliação operacional deve vir antes do conteúdo de apoio.");
}
if (screen.indexOf("Quando as compressões são TORÁCICAS") > screen.indexOf("ovace-desfecho")) {
  throw new Error("Exceção que muda a técnica deve aparecer antes da reavaliação das manobras.");
}

const entry = catalog.match(/id:\s*"ovace-adulto"[\s\S]*?presentation:\s*"([^"]+)"/);
if (entry?.[1] !== "flow") throw new Error("Engasgo deve permanecer classificado como fluxo.");

console.log("✅ Engasgo usa shell de fluxo e prioriza a decisão clínica sem alterar conduta.");
