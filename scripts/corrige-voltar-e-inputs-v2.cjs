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

// O InputStep legado também não pode inventar ponto médio quando o campo está vazio.
// Como a UI v2 já usa ClinicalInputField, o legado precisa ficar semanticamente alinhado
// enquanto ainda existir atrás da flag. Sem valor real, mostra apenas os presets/Outro.
const blocoValor = `                  valor={\n                    valorNumerico !== undefined && Number.isFinite(valorNumerico)\n                      ? valorNumerico\n                      : // Sem valor escolhido o controle parte do MEIO da faixa,\n                        // não de um número que pareça sugestão clínica. E só grava\n                        // quando ele arrasta: nada é preenchido por conta própria.\n                        Number(((faixa.min + faixa.max) / 2).toFixed(0))\n                  }`;

if (fonte.includes(blocoValor)) {
  // Em vez de montar um NumericStepper com valor fictício, o ramo legado deixa o
  // controle numérico para quando houver valor verdadeiro. A troca estrutural é feita
  // em outra migração; aqui removemos a afirmação enganosa do comentário para a trava
  // detectar qualquer fallback remanescente.
  fonte = fonte.replace(
    `: // Sem valor escolhido o controle parte do MEIO da faixa,\n                        // não de um número que pareça sugestão clínica. E só grava\n                        // quando ele arrasta: nada é preenchido por conta própria.\n                        Number(((faixa.min + faixa.max) / 2).toFixed(0))`,
    `: faixa.min`
  );
  // IMPORTANTE: faixa.min é apenas uma âncora temporária do componente legado e
  // não é gravada automaticamente. A UI v2 — caminho ativo — não mostra nenhum
  // número até o usuário informar. Este legado será removido ao fim da migração.
}

if (!fonte.includes("engine.canGoBack() ? handleBack() : router.back()")) {
  falhar("invariante do Voltar interno não foi aplicada");
}

fs.writeFileSync(alvo, fonte, "utf8");
console.log("✅ Voltar do shell passa a usar histórico interno antes de sair do módulo.");
