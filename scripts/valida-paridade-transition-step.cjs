const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), "utf8");

const principal = ler("components/protocol-screen/acls-decision-flow-screen.tsx");
const card = ler("components/protocol-screen/clinical-transition-step-card.tsx");

const falhas = [];
const exigir = (condicao, mensagem) => {
  if (!condicao) falhas.push(mensagem);
};

// O card é apresentação: não pode decidir destino nem executar handoff.
exigir(!/prepareRegisteredTargetHandoff/.test(card), "ClinicalTransitionStepCard passou a executar handoff; isso deve permanecer no shell.");
exigir(!/router\.(push|replace)/.test(card), "ClinicalTransitionStepCard passou a navegar diretamente.");
exigir(!/currentModuleSlug/.test(card), "ClinicalTransitionStepCard passou a conhecer o módulo de origem.");

// Contrato recebido do FrontendTreeStep de transição.
exigir(/disposition:\s*TransitionStep\["disposition"\]/.test(card), "Card perdeu o disposition recebido do step.");
exigir(/exitCriteria:\s*readonly string\[\]/.test(card), "Card perdeu os critérios de saída recebidos do step.");
exigir(/targets:\s*TransitionStep\["targets"\]/.test(card), "Card perdeu os destinos recebidos do step.");
exigir(/onOpenModule:\s*\(moduleId: string\) => void/.test(card), "Card perdeu o callback externo de abertura de módulo.");

// Critérios devem ser apresentados na ordem recebida, sem interpretação.
exigir(/exitCriteria\.map\(\(item, index\)/.test(card), "Critérios de saída deixaram de ser renderizados na ordem recebida.");
exigir(/\{tr\(item\)\}/.test(card), "Texto de critério deixou de ser traduzido sem reinterpretação.");

// Destinos devem preservar moduleId, label e reason exatamente do target.
exigir(/targets\.map\(\(target\)/.test(card), "Destinos deixaram de ser renderizados diretamente do array recebido.");
exigir(/key=\{target\.moduleId\}/.test(card), "Destino deixou de usar o moduleId original como identidade.");
exigir(/tr\(target\.label\)/.test(card), "Rótulo do destino deixou de vir do target.");
exigir(/tr\(target\.reason\)/.test(card), "Motivo do destino deixou de vir do target.");
exigir(/onPress=\{\(\) => onOpenModule\(target\.moduleId\)\}/.test(card), "Card deixou de devolver exatamente o moduleId escolhido ao chamador.");

// O shell continua sendo dono do handoff/roteamento até a integração controlada.
exigir(/prepareRegisteredTargetHandoff/.test(principal), "Shell perdeu a preparação do handoff antes da integração controlada.");
exigir(/abrirOutroModulo/.test(principal), "Shell perdeu a função de navegação entre módulos.");
exigir(/targetModuleId:\s*moduleId/.test(principal) || /targetModuleId:\s*step\.targets/.test(principal) || /targetModuleId/.test(principal), "Shell perdeu o targetModuleId do handoff.");

if (falhas.length) {
  console.error("\n❌ Paridade do TransitionStep: falhou\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("✅ Paridade estrutural do TransitionStep preservada.");
console.log("   • destino e critérios continuam vindo do step");
console.log("   • moduleId, label e reason permanecem intactos");
console.log("   • navegação e handoff continuam fora do componente visual");
