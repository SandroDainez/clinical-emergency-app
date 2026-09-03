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

function replaceSection(src, label, startMarker, endMarker, replacement, appliedMarker) {
  if (src.includes(appliedMarker)) return src;
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`${label}: marcadores não encontrados`);
  return src.slice(0, start) + replacement + '\n\n' + src.slice(end);
}

update('components/protocol-screen/sedation-calculator-screen.tsx', (src0) => {
  let src = src0;

  const patientMode = `          {/* Núcleo responsivo: paciente + modo lado a lado em telas largas; empilhado no mobile. */}
          <View style={[s.quickGrid, larguraDaTela < 920 && s.quickGridStack]}>
            <View style={s.quickGridItem}>
              <View style={s.card}>
                <Text style={s.cardLabel}>{tr("PACIENTE")}</Text>
                <View style={s.row}>
                  <Text style={s.fieldLabel}>{tr("Peso (kg)")}</Text>
                  <TextInput
                    style={s.modalInput}
                    value={calc.weightKg}
                    onChangeText={(texto) => setCalc((c) => ({ ...c, weightKg: texto }))}
                    keyboardType="numeric"
                    placeholder={tr("Informe o peso")}
                    placeholderTextColor="#94a3b8"
                    accessibilityLabel={tr("Peso em quilogramas")}
                  />
                  {parsePt(calc.weightKg) !== null ? (
                    <NumericStepper
                      valor={Number(calc.weightKg.replace(",", "."))}
                      onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}
                      min={FAIXA_DE_ENTRADA.peso.min}
                      max={FAIXA_DE_ENTRADA.peso.max}
                      passo={FAIXA_DE_ENTRADA.peso.passo}
                      unidade="kg"
                      testID="slider-peso"
                    />
                  ) : null}
                </View>
                {weightMissing
                  ? <Text style={s.hintWarn}>{tr("⚠️ Informe o peso para calcular esta dose.")}</Text>
                  : !needsWeight ? <Text style={s.hint}>{tr("Dose por hora — não depende do peso.")}</Text> : null}
              </View>
            </View>

            {drug.modes.length > 1 ? (
              <View style={s.quickGridItem}>
                <View style={s.card}>
                  <Text style={s.cardLabel}>{tr("MODO DE USO")}</Text>
                  <HorizontalChoiceSelector
                    value={calc.modeId}
                    options={drug.modes.map((m) => ({ value: m.id, label: tr(m.label) }))}
                    onChange={(id) => {
                      const next = drug.modes.find((m) => m.id === id);
                      if (next) selectMode(next);
                    }}
                    accessibilityLabel={tr("Modo de uso")}
                    testID="sedacao-modo"
                  />
                </View>
              </View>
            ) : null}
          </View>`;

  src = replaceSection(
    src,
    'patient-mode-grid',
    '          {/* Paciente */}',
    '          {/* Diluição compacta: preset e concentração no fluxo principal; personalização sob demanda. */}',
    patientMode,
    'Núcleo responsivo: paciente + modo lado a lado'
  );

  const doseResult = `          {/* Núcleo responsivo: dose + resultado lado a lado em telas largas; alertas continuam logo abaixo. */}
          <View style={[s.quickGrid, larguraDaTela < 920 && s.quickGridStack]}>
            <View style={s.quickGridItem}>
              <View style={s.card}>
                <Text style={s.cardLabel}>{tr("DOSE")}</Text>
                {mode.acurasys && (
                  <Pressable style={[s.acurasysBtn, acurasysActive && s.acurasysBtnActive]} onPress={applyAcurasys}>
                    <Text style={s.acurasysTxt}>⭐ {mode.acurasys.label}</Text>
                  </Pressable>
                )}
                {!acurasysActive && (
                  <View style={s.calcInputRow}>
                    <NumericStepper
                      valor={Number(calc.doseInput.replace(",", ".")) || faixaDaBarra(mode).min}
                      onChange={(n) =>
                        setCalc((c) => ({ ...c, doseInput: String(n).replace(".", ",") }))
                      }
                      min={faixaDaBarra(mode).min}
                      max={faixaDaBarra(mode).max}
                      passo={faixaDaBarra(mode).passo}
                      unidade={mode.unit}
                      testID="slider-dose"
                    />
                  </View>
                )}
                {acurasysActive && (
                  <Pressable style={s.acurasysReset} onPress={() => setCalc((c) => ({ ...c, doseInput: mode.defaultDose }))}>
                    <Text style={s.acurasysResetTxt}>{tr("Dose ACURASYS fixa: 37,5 mg/h · toque para voltar à dose por peso")}</Text>
                  </Pressable>
                )}

                {mode.ranges && mode.ranges.length > 1 && !acurasysActive && (
                  <View style={s.ruler}>
                    <View style={s.rulerBar}>
                      {mode.ranges.map((r, i) => (
                        <View key={i} style={[s.rulerSeg, { backgroundColor: TONE_COLOR[r.tone] }, range === r && s.rulerSegActive]} />
                      ))}
                    </View>
                    {range && (
                      <View style={[s.rangeBox, { borderColor: TONE_COLOR[range.tone] }]}>
                        <Text style={[s.rangeLabel, { color: TONE_COLOR[range.tone] }]}>{range.label}</Text>
                        <Text style={s.rangeIndic}>{range.indication}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {drug.magnesiumInteraction && (
                <View style={s.mgRow}>
                  <Switch value={calc.mgSulfate} onValueChange={(v) => setCalc((c) => ({ ...c, mgSulfate: v }))} />
                  <Text style={s.mgTxt}>{tr("Paciente em sulfato de magnésio?")}</Text>
                </View>
              )}
              {drug.magnesiumInteraction && calc.mgSulfate && (
                <View style={s.alertWarn}>
                  <Text style={s.alertTxt}>{tr("⚠️ MgSO₄ pode potencializar e prolongar o bloqueio por rocurônio. Não aplicar redução percentual fixa universal: titular doses subsequentes à resposta clínica e neuromuscular e usar monitorização quantitativa/TOF quando disponível.")}</Text>
                </View>
              )}
            </View>

            <View style={s.quickGridItem}>
              <View style={[s.resultCard, s.resultCardFill]}>
                {isInfusion ? (
                  <>
                    <Text style={s.resultLabel}>{tr("TAXA NA BOMBA")}</Text>
                    <Text style={s.resultValue}>
                      {acurasysActive ? fmt(acurasysRate, 1) : weightMissing ? "—" : fmt(rate, 1)} <Text style={s.resultUnit}>mL/h</Text>
                    </Text>
                    {acurasysActive && <Text style={s.resultSub}>ACURASYS 37,5 mg/h · conc {concLabel}</Text>}
                  </>
                ) : (
                  <>
                    <Text style={s.resultLabel}>{tr("BOLUS — ADMINISTRAR")}</Text>
                    <Text style={s.resultValue}>
                      {weightMissing ? "—" : fmt(bolus?.volumeMl, 1)} <Text style={s.resultUnit}>mL</Text>
                    </Text>
                    {bolus && !weightMissing && (
                      <Text style={s.resultSub}>
                        Dose total: {mode.unit === "mg/kg" ? `${fmt(bolus.totalMg, 0)} mg` : `${fmt(bolus.totalMcg, 0)} mcg`} · {presentation.concentrationLabel}
                      </Text>
                    )}
                  </>
                )}
                {weightMissing && <Text style={s.resultWarn}>{tr("Informe o peso para calcular.")}</Text>}
              </View>
            </View>
          </View>`;

  src = replaceSection(
    src,
    'dose-result-grid',
    '          {/* Dose */}',
    '          {/* Alerta clínico (sempre visível) */}',
    doseResult,
    'Núcleo responsivo: dose + resultado lado a lado'
  );

  if (!src.includes('quickGrid: { flexDirection: "row"')) {
    const styleAnchor = '  strategyLead: { fontSize: CV.tipo.label.fontSize, lineHeight: CV.tipo.body.lineHeight, fontWeight: "700", color: CV.cores.text },';
    if (!src.includes(styleAnchor)) throw new Error('style anchor ausente');
    src = src.replace(styleAnchor, `${styleAnchor}\n  quickGrid: { flexDirection: "row", gap: 12, alignItems: "stretch" },\n  quickGridStack: { flexDirection: "column" },\n  quickGridItem: { flex: 1, minWidth: 0, gap: 10 },\n  resultCardFill: { flex: 1, justifyContent: "center", minHeight: 150 },`);
  }

  return src;
});

console.log('✅ Sedoanalgesia: paciente/modo e dose/resultado agora usam grade responsiva em telas largas, mantendo empilhamento no mobile.');
