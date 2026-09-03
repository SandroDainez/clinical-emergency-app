const fs = require('fs');

const file = 'components/protocol-screen/clinical-calculators-screen.tsx';
let src = fs.readFileSync(file, 'utf8');

const before = `              {FAIXA_DE_ENTRADA[inp.id] ? (\n                <NumericStepper\n                  valor={\n                    Number((values[key] ?? "").replace(",", ".")) ||\n                    FAIXA_DE_ENTRADA[inp.id].min\n                  }\n                  onChange={(n) => setVal(key, String(n).replace(".", ","))}\n                  min={FAIXA_DE_ENTRADA[inp.id].min}\n                  max={FAIXA_DE_ENTRADA[inp.id].max}\n                  passo={FAIXA_DE_ENTRADA[inp.id].passo}\n                  unidade={inp.unit ? tr(inp.unit) : undefined}\n                  testID={\`slider-\${inp.id}\`}\n                />\n              ) : (\n                <TextInput\n                  style={s.input}\n                  value={values[key] ?? ""}\n                  onChangeText={(v) => setVal(key, v)}\n                  keyboardType="decimal-pad"\n                  placeholder={inp.placeholder ? tr(inp.placeholder) : ""}\n                  placeholderTextColor="#64748b"\n                  accessibilityLabel={tr(inp.label)}\n                />\n              )}`;

const after = `              {FAIXA_DE_ENTRADA[inp.id] ? (\n                (() => {\n                  const texto = values[key] ?? "";\n                  const numerico = Number(texto.replace(",", "."));\n                  const informado = texto.trim().length > 0 && Number.isFinite(numerico);\n                  return informado ? (\n                    <NumericStepper\n                      valor={numerico}\n                      onChange={(n) => setVal(key, String(n).replace(".", ","))}\n                      min={FAIXA_DE_ENTRADA[inp.id].min}\n                      max={FAIXA_DE_ENTRADA[inp.id].max}\n                      passo={FAIXA_DE_ENTRADA[inp.id].passo}\n                      unidade={inp.unit ? tr(inp.unit) : undefined}\n                      testID={\`slider-\${inp.id}\`}\n                    />\n                  ) : (\n                    <View style={s.emptyNumericField}>\n                      <Text style={s.emptyNumericLabel}>{tr("Valor ainda não informado")}</Text>\n                      <TextInput\n                        style={s.input}\n                        value={texto}\n                        onChangeText={(v) => setVal(key, v)}\n                        keyboardType="decimal-pad"\n                        placeholder={inp.placeholder ? tr(inp.placeholder) : tr("Digitar valor")}\n                        placeholderTextColor="#64748b"\n                        accessibilityLabel={tr(inp.label)}\n                        testID={\`input-\${inp.id}\`}\n                      />\n                    </View>\n                  );\n                })()\n              ) : (\n                <TextInput\n                  style={s.input}\n                  value={values[key] ?? ""}\n                  onChangeText={(v) => setVal(key, v)}\n                  keyboardType="decimal-pad"\n                  placeholder={inp.placeholder ? tr(inp.placeholder) : ""}\n                  placeholderTextColor="#64748b"\n                  accessibilityLabel={tr(inp.label)}\n                />\n              )}`;

if (!src.includes(before)) throw new Error('âncora do NumericStepper não encontrada');
src = src.replace(before, after);

const styleAnchor = `  fieldHelper: { fontSize: 11, lineHeight: 16, color: "#aab6c6", marginTop: 6 },\n`;
if (!src.includes(styleAnchor)) throw new Error('âncora de estilo não encontrada');
src = src.replace(
  styleAnchor,
  `${styleAnchor}  emptyNumericField: { gap: 8 },\n  emptyNumericLabel: { fontSize: 12, fontWeight: "700", color: "#aab6c6" },\n`
);

const forbidden = `Number((values[key] ?? "").replace(",", ".")) ||\n                    FAIXA_DE_ENTRADA[inp.id].min`;
if (src.includes(forbidden)) throw new Error('fallback numérico mínimo ainda presente');
if (!src.includes('Valor ainda não informado')) throw new Error('estado vazio explícito ausente');

fs.writeFileSync(file, src);
console.log('✓ Calculadoras Clínicas: inputs numéricos não fabricam valor mínimo');
