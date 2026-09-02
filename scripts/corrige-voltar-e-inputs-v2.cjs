const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const alvo = path.join(raiz, "components/protocol-screen/acls-decision-flow-screen.tsx");
let fonte = fs.readFileSync(alvo, "utf8");

const falhar = (mensagem) => {
  console.error(`\n❌ Correção do shell abortada: ${mensagem}`);
  process.exit(1);
};

const substituirUmaVez = (antes, depois, rotulo) => {
  const primeira = fonte.indexOf(antes);
  if (primeira < 0) falhar(`âncora ausente: ${rotulo}`);
  if (fonte.indexOf(antes, primeira + antes.length) >= 0) falhar(`âncora duplicada: ${rotulo}`);
  fonte = fonte.slice(0, primeira) + depois + fonte.slice(primeira + antes.length);
};

substituirUmaVez(
  `          onBack={() => router.back()}\n          onPush={(href) => router.push(href)}`,
  `          onBack={() => (engine.canGoBack() ? handleBack() : router.back())}\n          onPush={(href) => router.push(href)}`,
  "Voltar do ClinicalShellHost"
);

substituirUmaVez(
  `          <StepHeaderBar protocolLabel={tr(protocolLabel)} onBack={() => router.back()} title={headerTitle ? tr(headerTitle) : undefined} />`,
  `          <StepHeaderBar\n            protocolLabel={tr(protocolLabel)}\n            onBack={() => (engine.canGoBack() ? handleBack() : router.back())}\n            title={headerTitle ? tr(headerTitle) : undefined}\n          />`,
  "Voltar do StepHeaderBar legado"
);

if ((fonte.match(/engine\.canGoBack\(\) \? handleBack\(\) : router\.back\(\)/g) ?? []).length !== 2) {
  falhar("o Voltar interno não ficou ligado nos dois cabeçalhos");
}

fs.writeFileSync(alvo, fonte, "utf8");
console.log("✅ Voltar usa o histórico interno do protocolo antes de sair do módulo.");
