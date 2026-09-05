const fs = require('node:fs');

function replaceOnce(path, oldText, newText, label) {
  const src = fs.readFileSync(path, 'utf8');
  const count = src.split(oldText).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: bloco esperado encontrado ${count} vez(es)`);
  }
  fs.writeFileSync(path, src.replace(oldText, newText));
}

const electrolytePath = 'components/protocol-screen/electrolyte-calculator-screen.tsx';
const electrolyteOld = `        <NumericStepper
          valor={
            temValor
              ? numero
              : // Sem valor escolhido o controle parte do MEIO da faixa, não de
                // um número que pareça sugestão clínica — e só grava quando o
                // médico arrasta. Mesma regra da árvore.
                Number(((faixa.min + faixa.max) / 2).toFixed(faixa.casas))
          }
          onChange={(n) => applyPickerValue(field, fmt(n, faixa.casas))}
          // Confirmar é GRAVAR o valor corrente: quem solta a barra no ponto de
          // partida informou aquele valor, e a tela precisa parar de dizer que
          // não sabe.
          onConfirmar={(n) => applyPickerValue(field, fmt(n, faixa.casas))}
          min={faixa.min}
          max={faixa.max}
          passo={faixa.passo}
          casas={faixa.casas}
          testID={\`slider-\${field}\`}
        />
        {/* ⚠️ O NÚMERO GRANDE NÃO É UM VALOR MEDIDO enquanto ninguém arrastou.
            A barra precisa partir de algum ponto, e o meio da faixa é o menos
            sugestivo — mas na tela ele aparece do mesmo tamanho de um valor
            informado. Dizer isso é a mesma regra do peso não confirmado nas
            Vasoativas: o app não finge que mediu o que não mediu. */}
        {!temValor ? (
          <Text style={styles.inputAindaNaoInformado}>
            {tr("⚠️ Ainda NÃO informado — a barra parte do meio da faixa. Arraste ou use −/+ para registrar o valor do paciente.")}
          </Text>
        ) : null}`;
const electrolyteNew = `        <NumericStepper
          valor={temValor ? numero : faixa.min}
          valorVisivel={temValor}
          onChange={(n) => applyPickerValue(field, fmt(n, faixa.casas))}
          onConfirmar={(n) => applyPickerValue(field, fmt(n, faixa.casas))}
          min={faixa.min}
          max={faixa.max}
          passo={faixa.passo}
          casas={faixa.casas}
          testID={\`slider-\${field}\`}
        />
        {/* Sem interação não existe valor clínico. O mínimo serve apenas como
            origem visual da trilha e fica oculto enquanto valorVisivel=false. */}
        {!temValor ? (
          <Text style={styles.inputAindaNaoInformado}>
            {tr("Valor ainda não informado — toque na barra para definir.")}
          </Text>
        ) : null}`;
replaceOnce(electrolytePath, electrolyteOld, electrolyteNew, 'eletrólitos');

const aclsPath = 'components/protocol-screen/acls-decision-flow-screen.tsx';
const aclsOld = `              {/* Campo numérico sem valor REAL permanece vazio. Uma barra exige
                  uma posição; usar ponto médio, mínimo ou qualquer default faria
                  a interface parecer possuir uma medida que ninguém informou.
                  Depois do primeiro valor explícito, a barra volta a ser o
                  controle rápido de ajuste. */}
              {faixa && valorNumerico !== undefined && Number.isFinite(valorNumerico) ? (
                <NumericStepper
                  valor={valorNumerico}
                  onChange={(n) => {
                    onSetValue(field.id, String(n));
                    setCustomOpen((s) => ({ ...s, [field.id]: false }));
                  }}
                  min={faixa.min}
                  max={faixa.max}
                  passo={faixa.passo}
                  unidade={field.unit}
                  testID={\`slider-\${field.id}\`}
                />
              ) : faixa ? (
                <View style={styles.customRow}>
                  <TextInput
                    value={customText[field.id] ?? ""}
                    onChangeText={(t) => setCustomText((s) => ({ ...s, [field.id]: t }))}
                    placeholder={tr("Digitar valor")}
                    placeholderTextColor="#64748b"
                    keyboardType="numeric"
                    style={styles.customInput}
                    returnKeyType="done"
                    testID={\`input-numerico-\${field.id}\`}
                    onSubmitEditing={() => {
                      const v = (customText[field.id] ?? "").trim();
                      if (v) onSetValue(field.id, v);
                    }}
                  />
                  <Pressable
                    testID={\`confirmar-numerico-\${field.id}\`}
                    onPress={() => {
                      const v = (customText[field.id] ?? "").trim();
                      if (v) onSetValue(field.id, v);
                    }}
                    style={({ pressed }) => [styles.customAdd, pressed && { opacity: 0.85 }]}>
                    <Text style={styles.customAddText}>OK</Text>
                  </Pressable>
                </View>
              ) : null}`;
const aclsNew = `              {/* Campo numérico usa sempre a barra. Enquanto não houve interação,
                  o mínimo é apenas a origem visual e não representa dado do paciente. */}
              {faixa ? (
                <NumericStepper
                  valor={valorNumerico !== undefined && Number.isFinite(valorNumerico) ? valorNumerico : faixa.min}
                  valorVisivel={valorNumerico !== undefined && Number.isFinite(valorNumerico)}
                  onChange={(n) => {
                    onSetValue(field.id, String(n));
                    setCustomOpen((s) => ({ ...s, [field.id]: false }));
                  }}
                  onConfirmar={(n) => {
                    onSetValue(field.id, String(n));
                    setCustomOpen((s) => ({ ...s, [field.id]: false }));
                  }}
                  min={faixa.min}
                  max={faixa.max}
                  passo={faixa.passo}
                  unidade={field.unit}
                  testID={\`slider-\${field.id}\`}
                />
              ) : null}`;
replaceOnce(aclsPath, aclsOld, aclsNew, 'ACLS input numérico');

const aclsSrc = fs.readFileSync(aclsPath, 'utf8');
const guarded = aclsSrc
  .replace(
    `{field.allowCustom ? (\n                      <Pressable`,
    `{field.allowCustom && field.customKeyboard !== "numeric" ? (\n                      <Pressable`
  )
  .replace(
    `{field.allowCustom && showingCustom ? (`,
    `{field.allowCustom && field.customKeyboard !== "numeric" && showingCustom ? (`
  )
  .replace(
    `keyboardType={field.customKeyboard === "numeric" ? "numeric" : "default"}`,
    `keyboardType="default"`
  );
if (guarded === aclsSrc) {
  throw new Error('ACLS: guardas categóricas não foram alteradas');
}
fs.writeFileSync(aclsPath, guarded);

console.log('✅ pendências de UI corrigidas em Eletrólitos e AclsDecisionFlowScreen');
