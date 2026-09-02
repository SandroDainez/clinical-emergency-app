const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), "utf8");

const principal = ler("components/protocol-screen/acls-decision-flow-screen.tsx");
const card = ler("components/protocol-screen/clinical-input-step-card.tsx");
const fields = ler("components/protocol-screen/clinical-input-fields.tsx");
const field = ler("components/protocol-screen/clinical-input-field.tsx");

const falhas = [];
const exigir = (condicao, mensagem) => {
  if (!condicao) falhas.push(mensagem);
};

// ── Contratos que pertencem ao motor/chamador ───────────────────────────────
// A nova camada NÃO pode passar a decidir faixa nem continuidade sozinha.
exigir(
  /rangeForField:\s*\(field:\s*InputField\)\s*=>\s*ClinicalInputRange\s*\|\s*undefined/.test(fields),
  "ClinicalInputFields deixou de receber a faixa numérica pronta do chamador."
);
exigir(
  /canContinue:\s*boolean/.test(card) && /disabled=\{!canContinue\}/.test(card),
  "ClinicalInputStepCard deixou de obedecer ao canContinue fornecido pelo engine."
);
exigir(
  /faixaDeEntradaDe/.test(principal),
  "A resolução canônica de faixa saiu do shell antes da integração controlada."
);

// ── Valor numérico ──────────────────────────────────────────────────────────
exigir(/<NumericStepper/.test(field), "ClinicalInputField perdeu o NumericStepper.");
exigir(/min=\{numericRange\.min\}/.test(field), "NumericStepper não recebe mais o mínimo resolvido.");
exigir(/max=\{numericRange\.max\}/.test(field), "NumericStepper não recebe mais o máximo resolvido.");
exigir(/passo=\{numericRange\.passo\}/.test(field), "NumericStepper não recebe mais o passo resolvido.");
exigir(
  /onChange=\{\(next\)\s*=>\s*onChange\(String\(next\)\)\}/.test(field),
  "Valor numérico deixou de voltar ao chamador como string, contrato do TreeValues."
);
exigir(
  /onConfirmar=\{\(next\)\s*=>\s*onChange\(String\(next\)\)\}/.test(field),
  "Campo numérico deixou de confirmar o valor atual quando o usuário conclui o gesto sem alterar o número."
);

// O número inicial visível não pode ser gravado por conta própria.
exigir(
  /Number\(\(\(numericRange\.min \+ numericRange\.max\) \/ 2\)\.toFixed\(0\)\)/.test(field),
  "Campo numérico deixou de usar o ponto médio apenas como valor visual inicial."
);
exigir(
  !/useEffect\([\s\S]{0,300}onChange\(/.test(field),
  "ClinicalInputField parece gravar valor automaticamente por efeito; valor visual não pode virar dado clínico."
);

// ── Categoria fechada ───────────────────────────────────────────────────────
exigir(/<CategoricalSelector/.test(field), "ClinicalInputField perdeu o seletor categórico comum.");
exigir(
  /value:\s*item\.value[\s\S]{0,120}label:\s*tr\(item\.label\)/.test(field),
  "Presets categóricos deixaram de preservar value/label da árvore."
);
exigir(
  /onChange\(next\)/.test(field),
  "Seleção categórica deixou de devolver exatamente o valor escolhido ao chamador."
);

// ── Valor customizado ───────────────────────────────────────────────────────
exigir(/field\.allowCustom/.test(field), "Suporte a allowCustom desapareceu.");
exigir(/field\.customKeyboard === "numeric"/.test(field), "Teclado customizado deixou de respeitar customKeyboard.");
exigir(/customText\.trim\(\)/.test(field), "Valor customizado deixou de ser normalizado por trim antes de gravar.");

// ── Dado herdado ────────────────────────────────────────────────────────────
exigir(/inherited\?: boolean/.test(field), "ClinicalInputField perdeu a informação de campo herdado.");
exigir(/DADO HERDADO/.test(field), "Campo herdado deixou de ser explicitamente sinalizado na interface.");
exigir(
  /confira e ajuste se mudou/.test(field),
  "Campo herdado deixou de pedir conferência do valor reutilizado."
);

// ── Calculadora embutida ────────────────────────────────────────────────────
exigir(/renderCalculator\?: ReactNode/.test(field), "ClinicalInputField perdeu o slot de calculadora.");
exigir(/renderCalculator\?\:\s*\(field: InputField, value: string \| undefined\) => ReactNode/.test(fields), "ClinicalInputFields perdeu a composição da calculadora por campo.");
exigir(/\{renderCalculator\}/.test(field), "A calculadora recebida deixou de ser renderizada no campo.");

// ── Campos obrigatórios / continuidade ─────────────────────────────────────
exigir(
  /!field\.optional && values\[field\.id\] === undefined/.test(card),
  "Mensagem de pendência deixou de derivar apenas dos campos obrigatórios sem valor."
);
exigir(/onAdvance:\s*\(\)\s*=>\s*void/.test(card), "ClinicalInputStepCard perdeu o callback de avanço fornecido pelo shell.");
exigir(/onPress=\{onAdvance\}/.test(card), "Botão Continuar deixou de chamar diretamente o callback do shell.");

// ── Composição: IDs e callbacks não podem ser reinterpretados ───────────────
exigir(
  /onChange=\{\(next\)\s*=>\s*onSetValue\(field\.id, next\)\}/.test(fields),
  "ClinicalInputFields deixou de encaminhar field.id + valor sem transformação."
);
exigir(
  /inherited=\{inheritedFieldIds\?\.has\(field\.id\) \?\? false\}/.test(fields),
  "ClinicalInputFields deixou de identificar herdados pelo mesmo field.id."
);

if (falhas.length) {
  console.error("\n❌ Paridade do InputStep: falhou\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("✅ Paridade estrutural do InputStep preservada.");
console.log("   • ranges continuam externos à apresentação");
console.log("   • canContinue continua vindo do engine");
console.log("   • numéricos preservam min/max/passo, confirmam o valor atual e não gravam o valor visual sozinhos");
console.log("   • categorias preservam value/label da árvore");
console.log("   • Outro…, herdados e calculadoras continuam representados");
console.log("   • field.id e callbacks seguem sem reinterpretação");
