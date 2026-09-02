const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), "utf8");

const principal = ler("components/protocol-screen/acls-decision-flow-screen.tsx");
const adapter = ler("components/protocol-screen/clinical-decision-step-adapter.tsx");
const card = ler("components/protocol-screen/clinical-decision-step-card.tsx");

const falhas = [];
const exigir = (condicao, mensagem) => {
  if (!condicao) falhas.push(mensagem);
};

// Adaptador e card são apresentação: não podem decidir, navegar ou avaliar clínica.
for (const [nome, fonte] of [["adapter", adapter], ["card", card]]) {
  exigir(!/DecisionTreeEngine/.test(fonte), `${nome} passou a conhecer o DecisionTreeEngine.`);
  exigir(!/evaluateClinicalActionAttemptFromPatientState/.test(fonte), `${nome} passou a avaliar gate clínico.`);
  exigir(!/guidedDiscoveryViewModel/.test(fonte), `${nome} passou a resolver guided discovery.`);
  exigir(!/router\.(push|replace)/.test(fonte), `${nome} passou a navegar diretamente.`);
  exigir(!/clinicalActionId/.test(fonte), `${nome} passou a conhecer clinicalActionId.`);
}

// O adaptador precisa ser pass-through puro do step e callback.
exigir(/step:\s*Extract<FrontendTreeStep,\s*\{\s*kind:\s*"decision"\s*\}>/.test(adapter), "Adapter perdeu o tipo exato de DecisionStep.");
exigir(/onChoose:\s*\(id: string\) => void/.test(adapter), "Adapter perdeu o callback onChoose.");
exigir(/<ClinicalDecisionStepCard[\s\S]*step=\{step\}/.test(adapter), "Adapter deixou de encaminhar o step intacto ao card.");
exigir(/onChoose=\{onChoose\}/.test(adapter), "Adapter deixou de encaminhar onChoose diretamente.");

// O card precisa preservar todos os dados clínicos visíveis já produzidos pelo engine.
exigir(/tr\(step\.title\)/.test(card), "Card perdeu o título do step.");
exigir(/tr\(step\.question\)/.test(card), "Card perdeu a pergunta do step.");
exigir(/step\.summary/.test(card), "Card perdeu o resumo opcional.");
exigir(/itens=\{step\.evidence\}/.test(card), "Card deixou de renderizar evidências diretamente do step.");
exigir(/itens=\{step\.comparativo\}/.test(card), "Card deixou de renderizar comparativo diretamente do step.");

// Opções devem manter identidade e texto; só tradução visual do label é permitida.
exigir(/step\.options\.map\(\(option\) => \(\{ id: option\.id, label: tr\(option\.label\) \}\)\)/.test(card), "Opções deixaram de preservar id/label diretamente do step.");
exigir(/onSelect=\{onChoose\}/.test(card), "DecisionGrid deixou de devolver a escolha diretamente ao callback externo.");

// O shell continua sendo a autoridade de decisão até a integração controlada.
exigir(/engine\.choose\(optionId\)/.test(principal), "Shell perdeu engine.choose antes da integração controlada.");
exigir(/recordFlowDecision/.test(principal), "Shell perdeu o registro da decisão antes da integração controlada.");
exigir(/commitDecision/.test(principal), "Shell perdeu a função de commit da decisão.");

if (falhas.length) {
  console.error("\n❌ Paridade do DecisionStep: falhou\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("✅ Paridade estrutural do DecisionStep preservada.");
console.log("   • engine e registro de decisão continuam no shell");
console.log("   • adapter é pass-through de step/onChoose");
console.log("   • pergunta, resumo, evidências e comparativo permanecem intactos");
console.log("   • option.id e option.label continuam vindos diretamente do step");
