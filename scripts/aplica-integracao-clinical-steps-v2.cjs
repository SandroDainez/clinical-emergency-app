const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const alvo = path.join(raiz, "components/protocol-screen/acls-decision-flow-screen.tsx");
let fonte = fs.readFileSync(alvo, "utf8");

const falhar = (mensagem) => {
  console.error(`\n❌ Integração UI v2 abortada: ${mensagem}`);
  process.exit(1);
};

const substituirUmaVez = (antes, depois, rotulo) => {
  const primeira = fonte.indexOf(antes);
  if (primeira < 0) falhar(`âncora ausente: ${rotulo}`);
  if (fonte.indexOf(antes, primeira + antes.length) >= 0) {
    falhar(`âncora duplicada: ${rotulo}`);
  }
  fonte = fonte.slice(0, primeira) + depois + fonte.slice(primeira + antes.length);
};

const inserirDepois = (ancora, trecho, rotulo) => {
  const i = fonte.indexOf(ancora);
  if (i < 0) falhar(`âncora de import ausente: ${rotulo}`);
  if (fonte.indexOf(ancora, i + ancora.length) >= 0) falhar(`âncora de import duplicada: ${rotulo}`);
  fonte = fonte.slice(0, i + ancora.length) + trecho + fonte.slice(i + ancora.length);
};

const imports = `\nimport { ClinicalDecisionStepAdapter } from "./clinical-decision-step-adapter";\nimport { ClinicalActionStepAdapter } from "./clinical-action-step-adapter";\nimport { ClinicalInputStepAdapter } from "./clinical-input-step-adapter";\nimport { ClinicalTransitionStepAdapter } from "./clinical-transition-step-adapter";`;

if (!fonte.includes("ClinicalDecisionStepAdapter")) {
  inserirDepois(
    `} from "../../lib/flow-session";`,
    imports,
    "fim do import de flow-session"
  );
}

substituirUmaVez(
  `<DecisionStep step={step} onChoose={handleChoose} emV2={emV2} />`,
  `emV2 ? (\n            <ClinicalDecisionStepAdapter step={step} onChoose={handleChoose} />\n          ) : (\n            <DecisionStep step={step} onChoose={handleChoose} emV2={false} />\n          )`,
  "render DecisionStep"
);

substituirUmaVez(
  `<InputStep\n            step={step}\n            onSetValue={handleSetValue}\n            onAdvance={handleAdvance}\n            herdados={herdadosRef.current}\n          />`,
  `emV2 ? (\n          <ClinicalInputStepAdapter\n            step={step}\n            onSetValue={handleSetValue}\n            onAdvance={handleAdvance}\n            inheritedFieldIds={herdadosRef.current}\n          />\n        ) : (\n          <InputStep\n            step={step}\n            onSetValue={handleSetValue}\n            onAdvance={handleAdvance}\n            herdados={herdadosRef.current}\n          />\n        )`,
  "render InputStep"
);

const transitionLegacy = `<TransitionStep\n            step={step}\n            onOpenModule={(moduleId) =>\n              abrirOutroModulo(moduleId.replace(/_/g, "-"), {\n                fromNodeId: step.id,\n                targetModuleId: moduleId,\n              })\n            }\n          />`;
const transitionAdapter = `emV2 ? (\n          <ClinicalTransitionStepAdapter\n            step={step}\n            onOpenModule={(moduleId) =>\n              abrirOutroModulo(moduleId.replace(/_/g, "-"), {\n                fromNodeId: step.id,\n                targetModuleId: moduleId,\n              })\n            }\n          />\n        ) : (\n          ${transitionLegacy}\n        )`;
substituirUmaVez(transitionLegacy, transitionAdapter, "render TransitionStep");

const actionStart = `  if (emV2) {\n    return (\n      <View style={styles.stepStack}>\n        {advisory ? (`;
const actionLegacyStart = `\n  return (\n    <View style={styles.stepStack}>\n      <View style={styles.actionCard}>`;
const a = fonte.indexOf(actionStart);
if (a < 0) falhar("bloco V2 do ActionStep não encontrado");
const b = fonte.indexOf(actionLegacyStart, a);
if (b < 0) falhar("início do bloco legado do ActionStep não encontrado");

const actionV2 = `  if (emV2) {\n    return (\n      <View style={styles.stepStack}>\n        {advisory ? (\n          <SafetyGate\n            title={tr(advisory.policy.title)}\n            message={tr(advisory.policy.message)}\n            primaryLabel={tr("Entendido — manter cardioversão sem atraso")}\n            onPrimary={() => setDismissedAdvisoryId(advisory.policy.id)}\n            severity="warning"\n          />\n        ) : null}\n        <ClinicalActionStepAdapter\n          step={step}\n          evidence={\n            <>\n              <SeloDeForca procedencia={step.procedencia} />\n              {step.declaracoes.map((d, i) => (\n                <SeloDeForca key={i} procedencia={d.procedencia} afirmacao={d.afirmacao} />\n              ))}\n            </>\n          }\n          rationale={\n            <ListaDeCriterios\n              itens={step.porque}\n              rotuloAberto="Por que isto"\n              rotuloOculto="Ocultar o porquê"\n              estilos={{\n                lista: v.lista,\n                linha: v.linha,\n                marcador: v.marcador,\n                texto: v.itemTexto,\n                alternar: v.alternarCriterios,\n              }}\n            />\n          }\n          onAdvance={onAdvance}\n        />\n      </View>\n    );\n  }\n`;

fonte = fonte.slice(0, a) + actionV2 + fonte.slice(b);

const obrigatorios = [
  "ClinicalDecisionStepAdapter",
  "ClinicalActionStepAdapter",
  "ClinicalInputStepAdapter",
  "ClinicalTransitionStepAdapter",
  "evaluateClinicalActionAttemptFromPatientState",
  "guidedDiscoveryViewModel",
  "<SafetyGate",
  "prepareRegisteredTargetHandoff",
  "recordClinicalSafetyOverride",
];
for (const item of obrigatorios) {
  if (!fonte.includes(item)) falhar(`invariante ausente após patch: ${item}`);
}

fs.writeFileSync(alvo, fonte, "utf8");
console.log("✅ Integração dos clinical step adapters aplicada ao shell.");
console.log("   • Decision/Input/Transition: adapters apenas no ramo UI v2");
console.log("   • Action: gates/discovery/advisory continuam no ActionStep");
console.log("   • legado permanece disponível atrás da flag");
