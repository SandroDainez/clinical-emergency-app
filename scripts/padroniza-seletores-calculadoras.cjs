const fs = require("fs");

function patchFile(path, operations) {
  let src = fs.readFileSync(path, "utf8");
  for (const { from, to, label } of operations) {
    const count = src.split(from).length - 1;
    if (count !== 1) throw new Error(`${path} · ${label}: esperado 1 anchor, encontrado ${count}`);
    src = src.replace(from, to);
  }
  fs.writeFileSync(path, src);
}

patchFile("components/protocol-screen/sedation-calculator-screen.tsx", [
  {
    label: "import selector",
    from: 'import { NumericStepper } from "../ui-v2/numeric-stepper";\n',
    to: 'import { NumericStepper } from "../ui-v2/numeric-stepper";\nimport { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";\n',
  },
  {
    label: "modo de uso",
    from: `              <View style={s.modeWrap}>\n                {drug.modes.map((m) => (\n                  <Pressable key={m.id} style={[s.modeChip, calc.modeId === m.id && s.modeChipActive]} onPress={() => selectMode(m)}>\n                    <Text style={[s.modeChipTxt, calc.modeId === m.id && s.modeChipTxtActive]}>{tr(m.label)}</Text>\n                  </Pressable>\n                ))}\n              </View>`,
    to: `              <HorizontalChoiceSelector\n                value={calc.modeId}\n                options={drug.modes.map((m) => ({ value: m.id, label: tr(m.label) }))}\n                onChange={(id) => {\n                  const next = drug.modes.find((m) => m.id === id);\n                  if (next) selectMode(next);\n                }}\n                accessibilityLabel={tr("Modo de uso")}\n                testID="sedacao-modo"\n              />`,
  },
  {
    label: "diluicoes recomendadas",
    from: `              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.solRow}>\n                {drug.standardSolutions.map((sol) => (\n                  <Pressable key={sol.id} style={[s.solChip, isActiveSolution(sol.id) && s.solChipActive]} onPress={() => applySolution(sol.id)}>\n                    <Text style={[s.solChipTxt, isActiveSolution(sol.id) && s.solChipTxtActive]}>{tr(sol.label)}</Text>\n                  </Pressable>\n                ))}\n              </ScrollView>`,
    to: `              <HorizontalChoiceSelector\n                value={drug.standardSolutions.find((sol) => isActiveSolution(sol.id))?.id}\n                options={drug.standardSolutions.map((sol) => ({ value: sol.id, label: tr(sol.label) }))}\n                onChange={applySolution}\n                accessibilityLabel={tr("Diluições recomendadas")}\n                testID="sedacao-diluicoes"\n              />`,
  },
  {
    label: "tipo diluente",
    from: `                  <View style={s.diluentSeg}>\n                    {(["SF", "SG"] as Diluent[]).map((d) => (\n                      <Pressable key={d} style={[s.diluentOpt, calc.diluent === d && s.diluentOptActive]} onPress={() => setCalc((c) => ({ ...c, diluent: d }))}>\n                        <Text style={[s.diluentOptTxt, calc.diluent === d && s.diluentOptTxtActive]}>{d}</Text>\n                      </Pressable>\n                    ))}\n                  </View>`,
    to: `                  <HorizontalChoiceSelector\n                    value={calc.diluent}\n                    options={(["SF", "SG"] as Diluent[]).map((d) => ({ value: d, label: d }))}\n                    onChange={(d) => setCalc((c) => ({ ...c, diluent: d as Diluent }))}\n                    accessibilityLabel={tr("Tipo de diluente")}\n                    testID="sedacao-diluente"\n                  />`,
  },
]);

patchFile("components/protocol-screen/vasoactive-calculator-screen.tsx", [
  {
    label: "import selector",
    from: 'import { NumericStepper } from "../ui-v2/numeric-stepper";\n',
    to: 'import { NumericStepper } from "../ui-v2/numeric-stepper";\nimport { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";\n',
  },
  {
    label: "diluicoes recomendadas",
    from: `                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.solRow}>\n                  {drug.standardSolutions.map((sol) => (\n                    <Pressable\n                      key={sol.id}\n                      style={[s.solChip, isActiveSolution(sol.id) && s.solChipActive]}\n                      onPress={() => applySolution(sol.id)}>\n                      <Text style={[s.solChipTxt, isActiveSolution(sol.id) && s.solChipTxtActive]}>\n                        {tr(sol.label)}\n                      </Text>\n                    </Pressable>\n                  ))}\n                </ScrollView>`,
    to: `                <HorizontalChoiceSelector\n                  value={drug.standardSolutions.find((sol) => isActiveSolution(sol.id))?.id}\n                  options={drug.standardSolutions.map((sol) => ({ value: sol.id, label: tr(sol.label) }))}\n                  onChange={applySolution}\n                  accessibilityLabel={tr("Diluições recomendadas")}\n                  testID="vasoativos-diluicoes"\n                />`,
  },
  {
    label: "tipo diluente",
    from: `                <View style={s.diluentSeg}>\n                  {(["SF", "SG"] as Diluent[]).map((d) => (\n                    <Pressable\n                      key={d}\n                      style={[s.diluentOpt, calc.diluent === d && s.diluentOptActive]}\n                      onPress={() => setCalc((c) => ({ ...c, diluent: d }))}>\n                      <Text style={[s.diluentOptTxt, calc.diluent === d && s.diluentOptTxtActive]}>{d}</Text>\n                    </Pressable>\n                  ))}\n                </View>`,
    to: `                <HorizontalChoiceSelector\n                  value={calc.diluent}\n                  options={(["SF", "SG"] as Diluent[]).map((d) => ({ value: d, label: d }))}\n                  onChange={(d) => setCalc((c) => ({ ...c, diluent: d as Diluent }))}\n                  accessibilityLabel={tr("Tipo de diluente")}\n                  testID="vasoativos-diluente"\n                />`,
  },
]);

console.log("OK: seletores de Sedoanalgesia e Vasoativos migrados para o componente canônico");
