const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), "utf8");

const principal = ler("components/protocol-screen/acls-decision-flow-screen.tsx");
const card = ler("components/protocol-screen/clinical-action-step-card.tsx");
const adapter = ler("components/protocol-screen/clinical-action-step-adapter.tsx");

const falhas = [];
const exigir = (condicao, mensagem) => {
  if (!condicao) falhas.push(mensagem);
};

// A apresentação extraída não pode assumir decisões clínicas ou de segurança.
exigir(
  !/evaluateClinicalActionAttemptFromPatientState/.test(card),
  "ClinicalActionStepCard passou a avaliar gate clínico; isso deve permanecer no shell."
);
exigir(
  !/guidedDiscoveryViewModel/.test(card),
  "ClinicalActionStepCard passou a resolver guided discovery; isso deve permanecer no shell."
);
exigir(
  !/SafetyGate/.test(card),
  "ClinicalActionStepCard passou a renderizar gate de segurança diretamente."
);

// Conteúdo da conduta precisa ser recebido pronto, sem transformação semântica.
exigir(/actions:\s*readonly string\[\]/.test(card), "Card perdeu a lista de ações fornecida pelo step.");
exigir(/actions\.map\(\(item, index\)/.test(card), "Card deixou de renderizar cada ação na ordem recebida.");
exigir(/\{tr\(item\)\}/.test(card), "Texto da ação deixou de ser traduzido sem reinterpretação.");
exigir(/title:\s*string/.test(card), "Card perdeu o título recebido do step.");
exigir(/summary\?:\s*string/.test(card), "Card perdeu o resumo opcional recebido do step.");

// Evidência e justificativa continuam sendo slots compostos pelo chamador.
exigir(/evidence\?:\s*ReactNode/.test(card), "Card perdeu o slot de evidência/procedência.");
exigir(/rationale\?:\s*ReactNode/.test(card), "Card perdeu o slot de justificativa.");
exigir(/\{evidence\}/.test(card), "Evidência recebida deixou de ser renderizada.");
exigir(/\{rationale\}/.test(card), "Justificativa recebida deixou de ser renderizada.");

// O avanço deve continuar sendo callback externo e só pode ocorrer por ação explícita do usuário.
exigir(/onAdvance:\s*\(\)\s*=>\s*void/.test(card), "Card perdeu o callback externo de avanço.");
exigir(/onPress=\{onAdvance\}/.test(card), "Botão de conclusão deixou de chamar diretamente onAdvance.");
exigir(!/useEffect\([\s\S]{0,300}onAdvance\(/.test(card), "Card parece avançar automaticamente por efeito.");

// A semântica visual deve continuar distinguindo execução de navegação.
exigir(/Conduta — fazer agora/.test(card), "Card perdeu o rótulo de conduta imediata.");
exigir(/EXECUTE AGORA/.test(card), "Card perdeu o bloco visual dominante de execução.");
exigir(/ETAPA CONCLUÍDA/.test(card), "Card perdeu a separação visual da conclusão da etapa.");
exigir(/Feito — continuar/.test(card), "Card perdeu o rótulo de continuidade existente.");

// O adaptador só pode encaminhar um ActionStep já liberado pelo shell.
exigir(
  /step:\s*Extract<FrontendTreeStep,\s*\{ kind: "action" \}>/.test(adapter),
  "ClinicalActionStepAdapter deixou de receber o ActionStep diretamente."
);
exigir(/title=\{step\.title\}/.test(adapter), "Adapter deixou de encaminhar o título do step diretamente.");
exigir(/summary=\{step\.summary\}/.test(adapter), "Adapter deixou de encaminhar o resumo do step diretamente.");
exigir(/actions=\{step\.actions\}/.test(adapter), "Adapter deixou de encaminhar as ações do step diretamente.");
exigir(/evidence=\{evidence\}/.test(adapter), "Adapter deixou de encaminhar a evidência pronta.");
exigir(/rationale=\{rationale\}/.test(adapter), "Adapter deixou de encaminhar a justificativa pronta.");
exigir(/onAdvance=\{onAdvance\}/.test(adapter), "Adapter deixou de encaminhar onAdvance diretamente.");
exigir(!/protocolId/.test(adapter), "Adapter passou a receber protocolId e está invadindo a autoridade do shell.");
exigir(!/clinicalActionId/.test(adapter), "Adapter passou a conhecer clinicalActionId e está invadindo a autoridade do shell.");
exigir(!/evaluateClinicalActionAttemptFromPatientState/.test(adapter), "Adapter passou a avaliar gate clínico.");
exigir(!/guidedDiscoveryViewModel/.test(adapter), "Adapter passou a resolver guided discovery.");
exigir(!/SafetyGate/.test(adapter), "Adapter passou a renderizar SafetyGate.");

// O shell atual continua sendo a autoridade para gates, discovery, selos e porquê até a integração controlada.
exigir(/evaluateClinicalActionAttemptFromPatientState/.test(principal), "Shell perdeu a avaliação de gate antes da integração controlada.");
exigir(/guidedDiscoveryViewModel/.test(principal), "Shell perdeu guided discovery antes da integração controlada.");
exigir(/<SafetyGate/.test(principal), "Shell deixou de renderizar SafetyGate antes da integração controlada.");
exigir(/SeloDeForca/.test(principal), "Shell perdeu SeloDeForca antes da integração controlada.");
exigir(/step\.porque/.test(principal), "Shell perdeu o porquê da conduta antes da integração controlada.");

if (falhas.length) {
  console.error("\n❌ Paridade do ActionStep: falhou\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("✅ Paridade estrutural do ActionStep preservada.");
console.log("   • gates e guided discovery continuam no shell");
console.log("   • ações permanecem na mesma ordem e sem reinterpretação");
console.log("   • evidência e justificativa continuam compostas externamente");
console.log("   • adapter não conhece protocolId, clinicalActionId nem SafetyGate");
console.log("   • onAdvance permanece explícito e externo");
console.log("   • execução clínica e navegação continuam visualmente separadas");
