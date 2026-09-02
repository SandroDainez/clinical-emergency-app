const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const alvo = path.join(raiz, "components/protocol-screen/acls-decision-flow-screen.tsx");
let fonte = fs.readFileSync(alvo, "utf8");

const falhar = (mensagem) => {
  console.error(`\n❌ Remoção da estabilização duplicada abortada: ${mensagem}`);
  process.exit(1);
};

const antes = `{estabilizacaoNoFluxo ? null : (\n          <StabilizationFirstCard\n            compacto={emV2}\n            currentModuleSlug={currentModuleSlug}\n            onOpenModule={(slug) => abrirOutroModulo(slug)}\n          />\n        )}`;

const depois = `{estabilizacaoNoFluxo || emV2 ? null : (\n          <StabilizationFirstCard\n            compacto={false}\n            currentModuleSlug={currentModuleSlug}\n            onOpenModule={(slug) => abrirOutroModulo(slug)}\n          />\n        )}`;

const primeira = fonte.indexOf(antes);
if (primeira < 0) falhar("bloco canônico de StabilizationFirstCard não encontrado");
if (fonte.indexOf(antes, primeira + antes.length) >= 0) {
  falhar("bloco de StabilizationFirstCard apareceu mais de uma vez");
}

fonte = fonte.slice(0, primeira) + depois + fonte.slice(primeira + antes.length);

if (!fonte.includes("estabilizacaoNoFluxo || emV2 ? null")) {
  falhar("a UI v2 não ficou protegida contra a renderização duplicada");
}

fs.writeFileSync(alvo, fonte, "utf8");
console.log("✅ UI v2 usa uma única porta de deterioração; card legado preservado fora da UI v2.");
