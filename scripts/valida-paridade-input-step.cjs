const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (relativo) => fs.readFileSync(path.join(raiz, relativo), "utf8");

const principal = ler("components/protocol-screen/acls-decision-flow-screen.tsx");
const adapter = ler("components/protocol-screen/clinical-input-step-adapter.tsx");
const card = ler("components/protocol-screen/clinical-input-step-card.tsx");
const fields = ler("components/protocol-screen/clinical-input-fields.tsx");
const field = ler("components/protocol-screen/clinical-input-field.tsx");

const falhas = [];
const exigir = (condicao, mensagem) => {
  if (!condicao) falhas.push(mensagem);
};

// ── Contratos que pertencem ao motor/chamador ───────────────────────────────
exigir(
  /rangeForField:\s*\(field:\s*InputField\)\s*=>\s*ClinicalInputRange\s*\|\s*undefined/.test(fields),
  "ClinicalInputFields deixou de receber a faixa numérica pronta do chamador."
);
exigir(
  /canContinue:\s*boolean/.test(card) && /disabled=\{!canContinue\}/.test(card),
  "ClinicalInputStepCard deixou de obedecer ao canContinue fornecido pelo engine."
);
exigir(
  /canContinue=\{step\.canContinue\}/.test(adapter),
  "O adaptador deixou de encaminhar canContinue diretamente do FrontendTreeStep."
);
exigir(
  /values=\{step\.values\}/.test(adapter) && /fields=\{step\.fields\}/.test(adapter),
  "O adaptador deixou de encaminhar fields/values diretamente do FrontendTreeStep."
);

// ── Resolução de faixa ──────────────────────────────────────────────────────
exigir(
  /faixaDeEntradaDe\(field\.id\)/.test(adapter),
  "O adaptador deixou de consultar a fonte canônica de faixas de entrada."
);
exigir(
  /field\.customKeyboard !== "numeric"/.test(adapter),
  "O adaptador deixou de restringir faixa numérica aos campos declarados como numéricos."
);
exigir(
  /if \(!declarada\) return undefined/.test(adapter),
  "Campo numérico sem faixa declarada deixou de falhar fechado."
);
exigir(
  !/field\.presets[\s\S]{0,300}Number\(preset\.value/.test(adapter),
  "O adaptador voltou a inferir faixa clínica a partir de presets."
);
exigir(
  /rangeForField=\{faixaNumerica\}/.test(adapter),
  "ClinicalInputStepAdapter deixou de fornecer sua resolução de faixa ao card."
);

// Enquanto o InputStep legado ainda estiver no shell, a fonte canônica também
// continua aparecendo nele. Depois da troca definitiva, esta exigência pode sair.
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
  /onChange=\{\(next\)\s*=>\s*setNumericDraft\(next\)\}/.test(field),
  "Movimento da barra deixou de atualizar apenas o rascunho local."
);
exigir(
  /onConfirmar=\{confirmarNumeroDaBarra\}/.test(field) && /onChange\(String\(numero\)\)/.test(field),
  "Confirmação da barra deixou de gravar string no contrato TreeValues."
);

// Valor ausente não pode ganhar sugestão clínica; a barra continua visível em
// estado neutro e só passa a expor número após interação real.
exigir(
  !/\(numericRange\.min\s*\+\s*numericRange\.max\)\s*\/\s*2/.test(field),
  "ClinicalInputField voltou a inventar ponto médio para campo numérico vazio."
);
exigir(
  /const hasNumericValue = numericValue !== undefined && Number\.isFinite\(numericValue\)/.test(field),
  "Campo numérico perdeu a distinção entre valor real e ausência de informação."
);
exigir(
  /const valorVisivel = hasNumericValue \|\| numericDraft !== undefined/.test(field),
  "Estado visual da barra deixou de depender de dado real ou interação explícita."
);
exigir(
  /valorVisivel=\{valorVisivel\}/.test(field),
  "NumericStepper deixou de receber a semântica de valor ainda não informado."
);
exigir(
  /Valor ainda não informado — toque na barra para definir/.test(field),
  "Estado vazio do campo numérico deixou de ser explícito para o usuário."
);
exigir(
  /testID=\{testID \? `\$\{testID\}-numeric-pending` : undefined\}/.test(field),
  "Estado pendente do campo numérico perdeu identificação testável."
);
exigir(
  !/useEffect\([\s\S]{0,300}onChange\(/.test(field),
  "ClinicalInputField parece gravar valor automaticamente por efeito."
);

// Sem faixa, numérico falha fechado: não reaparece uma caixa de digitação.
exigir(
  /field\.customKeyboard === "numeric"[\s\S]{0,500}Campo numérico indisponível/.test(field),
  "Campo numérico sem faixa não exibe erro de configuração fail-closed."
);
exigir(
  /Este campo não pode usar caixa de digitação como alternativa/.test(field),
  "Falha fechada perdeu a proibição explícita de fallback por digitação."
);

// ── Categoria fechada / texto verdadeiro ────────────────────────────────────
exigir(/<CategoricalSelector/.test(field), "ClinicalInputField perdeu o seletor categórico comum.");
exigir(
  /value:\s*item\.value[\s\S]{0,120}label:\s*tr\(item\.label\)/.test(field),
  "Presets categóricos deixaram de preservar value/label da árvore."
);
exigir(
  /onChange\(next\)/.test(field),
  "Seleção categórica deixou de devolver exatamente o valor escolhido ao chamador."
);
exigir(/field\.allowCustom/.test(field), "Suporte a allowCustom desapareceu.");
exigir(/keyboardType="default"/.test(field), "Texto customizado verdadeiro deixou de usar teclado textual.");
exigir(/customText\.trim\(\)/.test(field), "Valor customizado deixou de ser normalizado por trim antes de gravar.");

// ── Dado herdado ────────────────────────────────────────────────────────────
exigir(/inherited\?: boolean/.test(field), "ClinicalInputField perdeu a informação de campo herdado.");
exigir(/DADO HERDADO/.test(field), "Campo herdado deixou de ser explicitamente sinalizado na interface.");
exigir(
  /confira e ajuste se mudou/.test(field),
  "Campo herdado deixou de pedir conferência do valor reutilizado."
);
exigir(
  /inheritedFieldIds=\{inheritedFieldIds\}/.test(adapter),
  "O adaptador deixou de encaminhar os campos herdados sem transformação."
);

// ── Calculadora embutida ────────────────────────────────────────────────────
exigir(/renderCalculator\?: ReactNode/.test(field), "ClinicalInputField perdeu o slot de calculadora.");
exigir(/renderCalculator\?\:\s*\(field: InputField, value: string \| undefined\) => ReactNode/.test(fields), "ClinicalInputFields perdeu a composição da calculadora por campo.");
exigir(/\{renderCalculator\}/.test(field), "A calculadora recebida deixou de ser renderizada no campo.");
exigir(/field\.calculadora/.test(adapter), "O adaptador deixou de respeitar a calculadora declarada pelo InputField.");
exigir(/calculadoraId=\{field\.calculadora\}/.test(adapter), "O adaptador deixou de passar o ID original da calculadora.");
exigir(
  /onTotal=\{\(total\)\s*=>\s*onSetValue\(field\.id, String\(total\)\)\}/.test(adapter),
  "Resultado da calculadora deixou de voltar pelo mesmo field.id + string."
);

// ── Campos obrigatórios / continuidade ─────────────────────────────────────
exigir(
  /!field\.optional && values\[field\.id\] === undefined/.test(card),
  "Mensagem de pendência deixou de derivar apenas dos campos obrigatórios sem valor."
);
exigir(/onAdvance:\s*\(\)\s*=>\s*void/.test(card), "ClinicalInputStepCard perdeu o callback de avanço fornecido pelo shell.");
exigir(/onPress=\{onAdvance\}/.test(card), "Botão Continuar deixou de chamar diretamente o callback do shell.");
exigir(/onAdvance=\{onAdvance\}/.test(adapter), "O adaptador deixou de encaminhar onAdvance diretamente ao card.");

// ── Composição: IDs e callbacks não podem ser reinterpretados ───────────────
exigir(
  /onChange=\{\(next\)\s*=>\s*onSetValue\(field\.id, next\)\}/.test(fields),
  "ClinicalInputFields deixou de encaminhar field.id + valor sem transformação."
);
exigir(
  /inherited=\{inheritedFieldIds\?\.has\(field\.id\) \?\? false\}/.test(fields),
  "ClinicalInputFields deixou de identificar herdados pelo mesmo field.id."
);
exigir(/onSetValue=\{onSetValue\}/.test(adapter), "O adaptador deixou de encaminhar onSetValue diretamente ao card.");

if (falhas.length) {
  console.error("\n❌ Paridade do InputStep: falhou\n");
  for (const falha of falhas) console.error(`- ${falha}`);
  process.exit(1);
}

console.log("✅ Paridade estrutural do InputStep preservada.");
console.log("   • adaptador encaminha fields, values, herdados e canContinue sem reinterpretar");
console.log("   • numéricos usam apenas faixas declaradas; presets não fabricam limites");
console.log("   • barra fica visível e neutra até dado real/interação, então confirma string no TreeValues");
console.log("   • numérico sem faixa falha fechado, sem caixa de digitação");
console.log("   • categorias e texto verdadeiro preservam value/label e allowCustom");
console.log("   • herdados e calculadoras continuam representados");
console.log("   • field.id e callbacks seguem sem reinterpretação");
