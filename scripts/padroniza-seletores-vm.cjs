const fs = require("fs");

const path = "components/protocol-screen/ventilator-configurator-card.tsx";
let src = fs.readFileSync(path, "utf8");

function replaceOnce(from, to, label) {
  const count = src.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: esperado 1 anchor, encontrado ${count}`);
  }
  src = src.replace(from, to);
}

replaceOnce(
  'import { NumericStepper } from "../ui-v2/numeric-stepper";\n',
  'import { NumericStepper } from "../ui-v2/numeric-stepper";\nimport { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";\n',
  "import HorizontalChoiceSelector"
);

replaceOnce(
`          <Text style={s.label}>{tr("Altura (cm)")}</Text>
          <View style={s.chipRow}>
            {HEIGHT_PRESETS.map((h) => {
              const active = altura === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => { setAltura(h); setCustomAltura(""); }}
                  style={[s.chip, active && s.chipActive]}>
                  <Text style={[s.chipTxt, active && s.chipTxtActive]}>{h}</Text>
                </Pressable>
              );
            })}
            {/* Os chips de altura ficam — são o toque mais rápido para os
                valores comuns. O que sai é a caixa "Outro", que obrigava a
                abrir teclado para uma altura fora da lista. A barra alcança
                qualquer valor da faixa e não erra de ordem de grandeza. */}
            <TextInput
              style={s.customInput}
              value={customAltura}
              onChangeText={(texto) => { setCustomAltura(texto); setAltura(texto); }}
              keyboardType="numeric"
              placeholder={tr("Informe a altura")}
              placeholderTextColor="#94a3b8"
              accessibilityLabel={tr("Altura em centímetros")}
            />
            {alturaValida ? (
              <NumericStepper
                valor={alturaNumerica}
                onChange={(n) => { setCustomAltura(String(n)); setAltura(String(n)); }}
                min={FAIXA_DE_ENTRADA.altura.min}
                max={FAIXA_DE_ENTRADA.altura.max}
                passo={FAIXA_DE_ENTRADA.altura.passo}
                unidade="cm"
                testID="slider-altura"
              />
            ) : null}
          </View>`,
`          <Text style={s.label}>{tr("Altura (cm)")}</Text>
          <HorizontalChoiceSelector
            value={HEIGHT_PRESETS.includes(altura) ? altura : undefined}
            options={HEIGHT_PRESETS.map((h) => ({ value: h, label: h }))}
            onChange={(h) => { setAltura(h); setCustomAltura(""); }}
            accessibilityLabel={tr("Altura em centímetros")}
            testID="vm-altura-presets"
          />
          <View style={s.inputRow}>
            <TextInput
              style={s.customInput}
              value={customAltura}
              onChangeText={(texto) => { setCustomAltura(texto); setAltura(texto); }}
              keyboardType="numeric"
              placeholder={tr("Informe a altura")}
              placeholderTextColor="#94a3b8"
              accessibilityLabel={tr("Altura em centímetros")}
            />
            {alturaValida ? (
              <NumericStepper
                valor={alturaNumerica}
                onChange={(n) => { setCustomAltura(String(n)); setAltura(String(n)); }}
                min={FAIXA_DE_ENTRADA.altura.min}
                max={FAIXA_DE_ENTRADA.altura.max}
                passo={FAIXA_DE_ENTRADA.altura.passo}
                unidade="cm"
                testID="slider-altura"
              />
            ) : null}
          </View>`,
  "altura presets"
);

replaceOnce(
`          <Text style={s.label}>{tr("Sexo")}</Text>
          <View style={s.chipRow}>
            {(["masculino", "feminino"] as Sexo[]).map((sx) => {
              const active = sexo === sx;
              return (
                <Pressable key={sx} onPress={() => setSexo(sx)} style={[s.chip, active && s.chipActive]}>
                  <Text style={[s.chipTxt, active && s.chipTxtActive]}>{tr(sx === "masculino" ? "Masculino" : "Feminino")}</Text>
                </Pressable>
              );
            })}
          </View>`,
`          <Text style={s.label}>{tr("Sexo")}</Text>
          <HorizontalChoiceSelector
            value={sexo ?? undefined}
            options={([
              { value: "masculino", label: tr("Masculino") },
              { value: "feminino", label: tr("Feminino") },
            ] as const)}
            onChange={(sx) => setSexo(sx as Sexo)}
            accessibilityLabel={tr("Sexo")}
            testID="vm-sexo"
          />`,
  "sexo selector"
);

replaceOnce(
`          <Text style={s.label}>{tr("Cenário")}</Text>
          <View style={s.chipRow}>
            {PATOLOGIAS.map((p) => {
              const active = patId === p.id;
              return (
                <Pressable key={p.id} onPress={() => setPatId(p.id)} style={[s.chip, active && s.chipActive]}>
                  <Text style={[s.chipTxt, active && s.chipTxtActive]}>{tr(p.label)}</Text>
                </Pressable>
              );
            })}
          </View>`,
`          <Text style={s.label}>{tr("Cenário")}</Text>
          <HorizontalChoiceSelector
            value={patId}
            options={PATOLOGIAS.map((p) => ({ value: p.id, label: tr(p.label) }))}
            onChange={setPatId}
            accessibilityLabel={tr("Cenário")}
            testID="vm-cenario"
          />`,
  "cenario selector"
);

replaceOnce(
`  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, alignItems: "center" },
  chip: { minWidth: 46, borderRadius: 12, backgroundColor: "#383e4a", borderWidth: 1.5, borderColor: "#565e6c", paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" , minHeight: 44, justifyContent: "center" },
  chipActive: { backgroundColor: "#1e6fd9", borderColor: "#7fb3ff" },
  chipTxt: { fontSize: 13.5, fontWeight: "700", color: "#cbd5e1" },
  chipTxtActive: { color: "#ffffff" },
  customInput: { minWidth: 64, minHeight: 38, borderRadius: 12, backgroundColor: "#292e38", borderWidth: 1, borderColor: "#565e6c", paddingHorizontal: 12, color: "#f1f5f9", fontSize: 14 },`,
`  inputRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, alignItems: "center" },
  customInput: { minWidth: 180, minHeight: 44, borderRadius: 12, backgroundColor: "#292e38", borderWidth: 1, borderColor: "#565e6c", paddingHorizontal: 12, color: "#f1f5f9", fontSize: 14 },`,
  "styles antigos de chips"
);

fs.writeFileSync(path, src);
console.log("OK: configurador de VM migrado para HorizontalChoiceSelector canônico");
