const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");

function ler(rel) {
  return fs.readFileSync(path.join(raiz, rel), "utf8");
}
function gravar(rel, fonte) {
  fs.writeFileSync(path.join(raiz, rel), fonte, "utf8");
}
function falhar(msg) {
  console.error(`\n❌ Patch de valores vazios abortado: ${msg}`);
  process.exit(1);
}
function substituirUmaVez(fonte, antes, depois, rotulo) {
  const i = fonte.indexOf(antes);
  if (i < 0) falhar(`âncora ausente: ${rotulo}`);
  if (fonte.indexOf(antes, i + antes.length) >= 0) falhar(`âncora duplicada: ${rotulo}`);
  return fonte.slice(0, i) + depois + fonte.slice(i + antes.length);
}

// ── Ventilação: altura realmente vazia; barra só depois de altura válida. ──
{
  const rel = "components/protocol-screen/ventilator-configurator-card.tsx";
  let fonte = ler(rel);

  fonte = substituirUmaVez(
    fonte,
    `  const pat = PATOLOGIAS.find((p) => p.id === patId) ?? PATOLOGIAS[0];\n\n  const calc = useMemo(() => {`,
    `  const pat = PATOLOGIAS.find((p) => p.id === patId) ?? PATOLOGIAS[0];\n  const alturaNumerica = Number(String(altura).replace(",", "."));\n  const alturaValida =\n    Number.isFinite(alturaNumerica) &&\n    alturaNumerica >= FAIXA_DE_ENTRADA.altura.min &&\n    alturaNumerica <= FAIXA_DE_ENTRADA.altura.max;\n\n  const calc = useMemo(() => {`,
    "estado de altura válida"
  );

  fonte = substituirUmaVez(
    fonte,
    `            <NumericStepper\n              valor={Number(String(altura).replace(",", ".")) || 170}\n              onChange={(n) => { setCustomAltura(String(n)); setAltura(String(n)); }}\n              min={FAIXA_DE_ENTRADA.altura.min}\n              max={FAIXA_DE_ENTRADA.altura.max}\n              passo={FAIXA_DE_ENTRADA.altura.passo}\n              unidade="cm"\n              testID="slider-altura"\n            />`,
    `            <TextInput\n              style={s.customInput}\n              value={customAltura}\n              onChangeText={(texto) => { setCustomAltura(texto); setAltura(texto); }}\n              keyboardType="numeric"\n              placeholder={tr("Informe a altura")}\n              placeholderTextColor="#94a3b8"\n              accessibilityLabel={tr("Altura em centímetros")}\n            />\n            {alturaValida ? (\n              <NumericStepper\n                valor={alturaNumerica}\n                onChange={(n) => { setCustomAltura(String(n)); setAltura(String(n)); }}\n                min={FAIXA_DE_ENTRADA.altura.min}\n                max={FAIXA_DE_ENTRADA.altura.max}\n                passo={FAIXA_DE_ENTRADA.altura.passo}\n                unidade="cm"\n                testID="slider-altura"\n              />\n            ) : null}`,
    "altura sem fallback"
  );

  gravar(rel, fonte);
}

// ── Sedação: peso vazio; cálculo continua bloqueado até dado real. ──
{
  const rel = "components/protocol-screen/sedation-calculator-screen.tsx";
  let fonte = ler(rel);

  const antes = `              <NumericStepper\n                valor={Number(calc.weightKg.replace(",", ".")) || 70}\n                onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}\n                // ⚠️ TERCEIRA OCORRÊNCIA DO MESMO BURACO, e a de maior\n                // consequência: aqui \`weightMissing\` BLOQUEIA O CÁLCULO — a\n                // dose vira "—". O paciente de 70 kg que soltasse a barra no\n                // ponto de partida (70) ficava sem dose, porque o valor não\n                // "mudou" e nada era gravado.\n                onConfirmar={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}\n                min={FAIXA_DE_ENTRADA.peso.min}\n                max={FAIXA_DE_ENTRADA.peso.max}\n                passo={FAIXA_DE_ENTRADA.peso.passo}\n                unidade="kg"\n                testID="slider-peso"\n              />`;

  const depois = `              <TextInput\n                style={s.modalInput}\n                value={calc.weightKg}\n                onChangeText={(texto) => setCalc((c) => ({ ...c, weightKg: texto }))}\n                keyboardType="numeric"\n                placeholder={tr("Informe o peso")}\n                placeholderTextColor="#94a3b8"\n                accessibilityLabel={tr("Peso em quilogramas")}\n              />\n              {parsePt(calc.weightKg) !== null ? (\n                <NumericStepper\n                  valor={Number(calc.weightKg.replace(",", "."))}\n                  onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}\n                  min={FAIXA_DE_ENTRADA.peso.min}\n                  max={FAIXA_DE_ENTRADA.peso.max}\n                  passo={FAIXA_DE_ENTRADA.peso.passo}\n                  unidade="kg"\n                  testID="slider-peso"\n                />\n              ) : null}`;

  fonte = substituirUmaVez(fonte, antes, depois, "peso da sedação sem fallback");
  gravar(rel, fonte);
}

// ── Vasoativos: peso vazio; remover mensagem que dizia que a barra partia de 70. ──
{
  const rel = "components/protocol-screen/vasoactive-calculator-screen.tsx";
  let fonte = ler(rel);

  const antes = `              <NumericStepper\n                valor={Number(calc.weightKg.replace(",", ".")) || 70}\n                onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}\n                // ⚠️ MESMO BURACO DOS ELETRÓLITOS, e este é o precedente: o\n                // aviso "peso ainda NÃO confirmado" só saía quando o número\n                // mudava, então confirmar 70 kg — a barra parte de 70 — era\n                // impossível. Paciente de 70 kg existe.\n                onConfirmar={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}\n                min={FAIXA_DE_ENTRADA.peso.min}\n                max={FAIXA_DE_ENTRADA.peso.max}\n                passo={FAIXA_DE_ENTRADA.peso.passo}\n                unidade="kg"\n                testID="slider-peso"\n              />`;

  const depois = `              <TextInput\n                style={s.modalInput}\n                value={calc.weightKg}\n                onChangeText={(texto) => setCalc((c) => ({ ...c, weightKg: texto }))}\n                keyboardType="numeric"\n                placeholder={tr("Informe o peso")}\n                placeholderTextColor="#94a3b8"\n                accessibilityLabel={tr("Peso em quilogramas")}\n              />\n              {wt > 0 ? (\n                <NumericStepper\n                  valor={wt}\n                  onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}\n                  min={FAIXA_DE_ENTRADA.peso.min}\n                  max={FAIXA_DE_ENTRADA.peso.max}\n                  passo={FAIXA_DE_ENTRADA.peso.passo}\n                  unidade="kg"\n                  testID="slider-peso"\n                />\n              ) : null}`;

  fonte = substituirUmaVez(fonte, antes, depois, "peso dos vasoativos sem fallback");
  fonte = substituirUmaVez(
    fonte,
    `<Text style={s.hintWarn}>{tr("⚠️ Peso ainda NÃO confirmado — a barra parte de 70 kg, que é ponto de partida, não medida. Ajuste ou toque para confirmar.")}</Text>`,
    `<Text style={s.hintWarn}>{tr("⚠️ Informe o peso para calcular esta dose.")}</Text>`,
    "aviso de peso dos vasoativos"
  );

  gravar(rel, fonte);
}

console.log("✅ Calculadoras especiais não exibem altura/peso fictícios antes da informação real.");
