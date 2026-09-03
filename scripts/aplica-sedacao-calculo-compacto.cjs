#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function update(rel, fn) {
  const file = path.join(root, rel);
  const before = fs.readFileSync(file, 'utf8');
  const after = fn(before);
  if (after !== before) fs.writeFileSync(file, after);
}

function replaceOnce(src, label, before, after) {
  if (src.includes(after)) return src;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  return src.replace(before, after);
}

function replaceSection(src, label, startMarker, endMarker, replacement, appliedMarker) {
  if (src.includes(appliedMarker)) return src;
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`${label}: marcadores não encontrados`);
  return src.slice(0, start) + replacement + '\n\n' + src.slice(end);
}

update('components/protocol-screen/sedation-calculator-screen.tsx', (src0) => {
  let src = src0;
  src = replaceOnce(src, 'states',
    '  const [showStrategy, setShowStrategy] = useState(false);\n  const [showInfo, setShowInfo] = useState(false);',
    '  const [showStrategy, setShowStrategy] = useState(false);\n  const [showDilutionTools, setShowDilutionTools] = useState(false);\n  const [showBolusNotes, setShowBolusNotes] = useState(false);\n  const [showInfo, setShowInfo] = useState(false);');

  src = replaceOnce(src, 'reset-drug',
    '    setShowStrategy(false);\n    setShowInfo(false);',
    '    setShowStrategy(false);\n    setShowDilutionTools(false);\n    setShowBolusNotes(false);\n    setShowInfo(false);');

  src = replaceOnce(src, 'reset-mode',
    '  const selectMode = useCallback((m: SedMode) => {\n    setCalc((c) => ({ ...c, modeId: m.id, doseInput: m.defaultDose }));\n  }, []);',
    '  const selectMode = useCallback((m: SedMode) => {\n    setCalc((c) => ({ ...c, modeId: m.id, doseInput: m.defaultDose }));\n    setShowDilutionTools(false);\n    setShowBolusNotes(false);\n  }, []);');

  const dilution = `          {/* Diluição compacta: preset e concentração no fluxo principal; personalização sob demanda. */}
          {isInfusion && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("DILUIÇÃO")}</Text>

              <Text style={s.dilSectionLabel}>{tr("Diluições recomendadas")}</Text>
              <HorizontalChoiceSelector
                value={drug.standardSolutions.find((sol) => isActiveSolution(sol.id))?.id}
                options={drug.standardSolutions.map((sol) => ({ value: sol.id, label: tr(sol.label) }))}
                onChange={applySolution}
                accessibilityLabel={tr("Diluições recomendadas")}
                testID="sedacao-diluicoes"
              />

              {/* Resumo concentração permanece sempre visível antes da dose. */}
              {conc && (
                <View style={s.concGrid}>
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Ampolas")}</Text><Text style={s.concVal}>{amps}</Text></View>
                  <View style={s.concDivider} />
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Vol. final")}</Text><Text style={s.concVal}>{fmt(conc.finalVolumeMl, 0)} mL</Text></View>
                  <View style={s.concDivider} />
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Concentração")}</Text><Text style={[s.concVal, s.concValHi]}>{concLabel}</Text></View>
                </View>
              )}

              <Pressable style={s.strategySummary} onPress={() => setShowDilutionTools((v) => !v)}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={s.cardLabel}>{tr("PERSONALIZAR DILUIÇÃO")}</Text>
                  <Text style={s.strategyLead}>
                    {tr("Diluições salvas e preparo personalizado")}{savedDilutions.length ? " · " + savedDilutions.length + " " + tr("salva(s)") : ""}
                  </Text>
                </View>
                <Text style={s.principlesChevron}>{showDilutionTools ? "▲" : "▼"}</Text>
              </Pressable>

              {showDilutionTools ? (
                <View style={{ gap: 10 }}>
                  <View style={s.userDilHeader}>
                    <Text style={s.userDilTitle}>{tr("Diluições do usuário")}</Text>
                    <Pressable onPress={() => setShowSaveModal(true)} style={[s.saveDilBtn, amps <= 0 && s.saveDilBtnDisabled]} disabled={amps <= 0}>
                      <Text style={s.saveDilBtnTxt}>{tr("+ Salvar atual")}</Text>
                    </Pressable>
                  </View>
                  {savedDilutions.length === 0 ? (
                    <Text style={s.userDilEmpty}>{tr("Nenhuma diluição salva. Monte a sua abaixo (ampolas + diluente + tipo) e toque em \"+ Salvar atual\".")}</Text>
                  ) : (
                    <View style={s.userDilList}>
                      {savedDilutions.map((d) => (
                        <View key={d.id} style={s.userDilRow}>
                          <Pressable style={s.userDilApply} onPress={() => setCalc((c) => ({ ...c, ampoules: String(d.ampoules), diluentMl: String(d.diluentMl), diluent: d.diluent }))}>
                            <Text style={s.userDilName}>📌 {tr(d.label)}</Text>
                            <Text style={s.userDilMeta}>{d.ampoules} amp · {d.diluentMl} mL {d.diluent}</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteSaved(d.id)} style={s.userDilDel}><Text style={s.userDilDelTxt}>✕</Text></Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={s.dilSectionLabel}>{tr("Criar diluição personalizada")}</Text>
                  <View style={s.dilFields}>
                    <View style={s.dilField}>
                      <Text style={s.fieldLabel}>{tr("Ampolas")}</Text>
                      <NumericStepper
                        valor={Number(calc.ampoules.replace(",", ".")) || 1}
                        onChange={(n) => setCalc((c) => ({ ...c, ampoules: String(n) }))}
                        min={1}
                        max={20}
                        passo={1}
                        testID="slider-ampolas"
                      />
                    </View>
                    <View style={s.dilField}>
                      <Text style={s.fieldLabel}>{tr("Diluente (mL)")}</Text>
                      <NumericStepper
                        valor={Number(calc.diluentMl.replace(",", ".")) || 100}
                        onChange={(n) => setCalc((c) => ({ ...c, diluentMl: String(n) }))}
                        min={0}
                        max={500}
                        passo={1}
                        unidade="mL"
                        testID="slider-diluente"
                      />
                    </View>
                    <View style={s.dilField}>
                      <Text style={s.fieldLabel}>{tr("Tipo")}</Text>
                      <HorizontalChoiceSelector
                        value={calc.diluent}
                        options={(["SF", "SG"] as Diluent[]).map((d) => ({ value: d, label: d }))}
                        onChange={(d) => setCalc((c) => ({ ...c, diluent: d as Diluent }))}
                        accessibilityLabel={tr("Tipo de diluente")}
                        testID="sedacao-diluente"
                      />
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          )}`;

  src = replaceSection(
    src,
    'compact-dilution',
    '          {/* Diluição (apenas infusão) */}',
    '          {/* Bolus: apresentação pura */}',
    dilution,
    'Diluição compacta: preset e concentração no fluxo principal'
  );

  const bolus = `          {/* Bolus compacto: concentração no fluxo principal; notas clínicas sob demanda. */}
          {!isInfusion && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("APRESENTAÇÃO (BOLUS — AMPOLA PURA)")}</Text>
              <Text style={s.refLine}>{presentation.concentrationLabel}</Text>
              {mode.bolusNotes?.length ? (
                <>
                  <Pressable style={s.strategySummary} onPress={() => setShowBolusNotes((v) => !v)}>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={s.cardLabel}>{tr("NOTAS DO BOLUS")}</Text>
                      <Text style={s.strategyLead}>{tr("Indicação, contexto hemodinâmico e observações de administração")}</Text>
                    </View>
                    <Text style={s.principlesChevron}>{showBolusNotes ? "▲" : "▼"}</Text>
                  </Pressable>
                  {showBolusNotes ? (
                    <View style={{ gap: 6 }}>
                      {mode.bolusNotes.map((n) => <Text key={n} style={s.refLine}>• {tr(n)}</Text>)}
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          )}`;

  src = replaceSection(
    src,
    'compact-bolus',
    '          {/* Bolus: apresentação pura */}',
    '          {/* Dose */}',
    bolus,
    'Bolus compacto: concentração no fluxo principal'
  );

  return src;
});

update('lib/i18n/modules/sedacao.ts', (src) => {
  if (src.includes('"PERSONALIZAR DILUIÇÃO": "PERSONALIZAR DILUCIÓN"')) return src;
  const anchor = 'export const ES_SEDACAO: Record<string, string> = {';
  if (!src.includes(anchor)) throw new Error('sedacao translation anchor ausente');
  return src.replace(anchor, `${anchor}\n  "PERSONALIZAR DILUIÇÃO": "PERSONALIZAR DILUCIÓN",\n  "Diluições salvas e preparo personalizado": "Diluciones guardadas y preparación personalizada",\n  "salva(s)": "guardada(s)",\n  "NOTAS DO BOLUS": "NOTAS DEL BOLO",\n  "Indicação, contexto hemodinâmico e observações de administração": "Indicación, contexto hemodinámico y observaciones de administración",`);
});

console.log('✅ Sedoanalgesia: presets/concentração permanecem no fluxo principal; personalização da diluição e notas de bolus passam a ser expansíveis.');
