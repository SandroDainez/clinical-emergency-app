/**
 * sedation-calculator-screen.tsx
 *
 * Calculadora de Sedoanalgesia, Analgesia e Bloqueadores Neuromusculares.
 * Espelha o padrão do módulo de Drogas Vasoativas (sidebar, diluição, cálculo
 * em tempo real, diluições salvas), adaptado para modos bolus/infusão, régua
 * de faixas de dose e atalhos clínicos (ACURASYS, MgSO₄ × rocurônio).
 */

import { useState, useCallback, useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import {
  SED_DRUGS,
  SED_GROUP_LABELS,
  sedConcentrationMcgPerMl,
  sedRateFromDose,
  sedBolus,
  type SedDrug,
  type SedMode,
  type SedGroup,
  type Diluent,
  type DoseRange,
  type InfusionUnit,
  type BolusUnit,
} from "../../sedation-engine";
import {
  getSavedDilutions,
  saveDilution,
  deleteSavedDilution,
  type SavedDilution,
} from "../../lib/vasoactive-storage";
import { useTr } from "../../lib/use-tr";

const TONE_COLOR: Record<DoseRange["tone"], string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
};

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(decimals).replace(".", ",");
}

function parsePt(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function drugByKey(key: string): SedDrug {
  return SED_DRUGS.find((d) => d.key === key)!;
}

function activeRange(ranges: DoseRange[] | undefined, dose: number | null): DoseRange | null {
  if (!ranges || dose == null) return null;
  for (const r of ranges) {
    if (r.upTo == null || dose < r.upTo) return r;
  }
  return ranges[ranges.length - 1] ?? null;
}

type CalcState = {
  drugKey: string;
  modeId: string;
  weightKg: string;
  ampoules: string;
  diluentMl: string;
  diluent: Diluent;
  presentationId: string;
  doseInput: string;
  mgSulfate: boolean;
};

function initialState(drugKey = "propofol"): CalcState {
  const drug = drugByKey(drugKey);
  const sol = drug.standardSolutions[0];
  const mode = drug.modes[0];
  return {
    drugKey,
    modeId: mode.id,
    weightKg: "",
    ampoules: sol.ampoules,
    diluentMl: sol.diluentMl,
    diluent: sol.diluent,
    presentationId: sol.presentationId,
    doseInput: mode.defaultDose,
    mgSulfate: false,
  };
}

export default function SedationCalculatorScreen() {
  const tr = useTr();
  const [calc, setCalc] = useState<CalcState>(() => initialState());
  const [showInfo, setShowInfo] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [savedDilutions, setSavedDilutions] = useState<SavedDilution[]>(() => getSavedDilutions("propofol"));

  const drug = useMemo(() => drugByKey(calc.drugKey), [calc.drugKey]);
  const mode: SedMode = useMemo(
    () => drug.modes.find((m) => m.id === calc.modeId) ?? drug.modes[0],
    [drug, calc.modeId]
  );
  const presentation = useMemo(
    () => drug.presentations.find((p) => p.id === calc.presentationId) ?? drug.presentations[0],
    [drug, calc.presentationId]
  );

  const amps = parsePt(calc.ampoules) ?? 0;
  const dilMl = parseFloat((calc.diluentMl || "0").replace(",", ".")) || 0;
  const wt = parsePt(calc.weightKg) ?? 0;
  const dose = parsePt(calc.doseInput);

  const conc = useMemo(
    () => sedConcentrationMcgPerMl(amps, presentation.basePerAmpoule, presentation.ampouleVolumeMl, dilMl),
    [amps, presentation, dilMl]
  );
  const concMcgPerMl = conc?.concMcgPerMl ?? 0;
  const concMgPerMl = concMcgPerMl / 1000;
  const pureConcMcgPerMl = presentation.basePerAmpoule / presentation.ampouleVolumeMl;

  // ── Result ──────────────────────────────────────────────────────────────
  const isInfusion = mode.kind === "infusion";
  const rate = isInfusion && dose != null
    ? sedRateFromDose(mode.unit as InfusionUnit, dose, wt, concMcgPerMl)
    : null;
  const bolus = !isInfusion && dose != null
    ? sedBolus(mode.unit as BolusUnit, dose, wt, pureConcMcgPerMl)
    : null;

  const range = activeRange(mode.ranges, dose);
  const overMax = range?.tone === "red" || (mode.ranges && range && range === mode.ranges[mode.ranges.length - 1] && range.tone === "orange");
  const needsWeight = mode.unit !== "mg/h" && mode.unit !== "mcg/h";
  const weightMissing = needsWeight && wt <= 0;

  // ── Handlers ────────────────────────────────────────────────────────────
  const selectDrug = useCallback((key: string) => {
    setCalc(() => initialState(key));
    setSavedDilutions(getSavedDilutions(key));
    setShowInfo(false);
    setShowRef(false);
  }, []);

  const selectMode = useCallback((m: SedMode) => {
    setCalc((c) => ({ ...c, modeId: m.id, doseInput: m.defaultDose }));
  }, []);

  const applySolution = useCallback((solId: string) => {
    const sol = drug.standardSolutions.find((s) => s.id === solId);
    if (!sol) return;
    setCalc((c) => ({ ...c, ampoules: sol.ampoules, diluentMl: sol.diluentMl, diluent: sol.diluent, presentationId: sol.presentationId }));
  }, [drug]);

  const applyAcurasys = useCallback(() => {
    if (!mode.acurasys) return;
    // garante diluição padrão (0,8 mg/mL) e dose fixa em mg/h → converter para mg/kg/h não é necessário:
    // a infusão ACURASYS é dose fixa; mostramos a taxa direto via mg/h equivalente.
    setCalc((c) => ({ ...c, doseInput: "ACURASYS" }));
  }, [mode]);

  const isActiveSolution = (solId: string) => {
    const sol = drug.standardSolutions.find((s) => s.id === solId);
    return sol?.ampoules === calc.ampoules && sol?.diluentMl === calc.diluentMl && sol?.diluent === calc.diluent;
  };

  const handleSaveDilution = () => {
    if (!saveLabel.trim() || amps <= 0) return;
    const entry = saveDilution(calc.drugKey, saveLabel.trim(), amps, dilMl, calc.diluent);
    setSavedDilutions((prev) => [...prev, entry]);
    setSaveLabel("");
    setShowSaveModal(false);
  };
  const handleDeleteSaved = (id: string) => {
    deleteSavedDilution(id);
    setSavedDilutions((prev) => prev.filter((d) => d.id !== id));
  };

  // ── ACURASYS fixed-rate handling ──────────────────────────────────────────
  const acurasysActive = mode.acurasys != null && calc.doseInput === "ACURASYS";
  const acurasysRate = acurasysActive && concMgPerMl > 0 ? mode.acurasys!.doseMgH / concMgPerMl : null;

  // ── Sidebar grouping ──────────────────────────────────────────────────────
  const groups: { group: SedGroup; drugs: SedDrug[] }[] = (["sedacao", "analgesia", "bnm"] as SedGroup[]).map((g) => ({
    group: g,
    drugs: SED_DRUGS.filter((d) => d.group === g),
  }));

  const concLabel = drug.displayUnit === "mcg/mL"
    ? `${fmt(concMcgPerMl, 2)} mcg/mL`
    : `${fmt(concMgPerMl, concMgPerMl < 1 ? 2 : 1)} mg/mL`;

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{tr("💉 Sedoanalgesia & BNM")}</Text>
      </View>

      <View style={s.body}>
        {/* ── Sidebar agrupada ── */}
        <View style={s.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sidebarInner}>
            {groups.map(({ group, drugs }) => (
              <View key={group} style={s.sideGroup}>
                <Text style={s.sideGroupLabel}>{SED_GROUP_LABELS[group]}</Text>
                {drugs.map((d) => (
                  <Pressable
                    key={d.key}
                    style={[s.sideItem, calc.drugKey === d.key && s.sideItemActive]}
                    onPress={() => selectDrug(d.key)}>
                    <Text style={s.sideEmoji}>{d.emoji}</Text>
                    <Text style={[s.sideName, calc.drugKey === d.key && s.sideNameActive]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
                      {tr(d.name)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Conteúdo ── */}
        <ScrollView style={s.mainScroll} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Cabeçalho do fármaco */}
          <View style={s.drugHeader}>
            <Text style={s.drugName}>{drug.emoji} {tr(drug.name)}</Text>
            <Text style={s.drugClass}>{tr(drug.className)}</Text>
          </View>

          {/* Estratégia */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("ESTRATÉGIA INICIAL")}</Text>
            {drug.strategy.map((line) => (
              <Text key={line} style={s.refLine}>• {tr(line)}</Text>
            ))}
          </View>

          {/* Paciente */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("PACIENTE")}</Text>
            <View style={s.row}>
              <Text style={s.fieldLabel}>{tr("Peso (kg)")}</Text>
              <TextInput
                style={s.input}
                value={calc.weightKg}
                onChangeText={(v) => setCalc((c) => ({ ...c, weightKg: v }))}
                keyboardType="decimal-pad"
                placeholder="ex: 70"
                placeholderTextColor="#94a3b8"
                accessibilityLabel={tr("Peso em quilogramas")}
              />
            </View>
            {weightMissing
              ? <Text style={s.hintWarn}>{tr("⚠️ Informe o peso para calcular esta dose.")}</Text>
              : !needsWeight ? <Text style={s.hint}>{tr("Dose por hora — não depende do peso.")}</Text> : null}
          </View>

          {/* Modo */}
          {drug.modes.length > 1 && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("MODO DE USO")}</Text>
              <View style={s.modeWrap}>
                {drug.modes.map((m) => (
                  <Pressable key={m.id} style={[s.modeChip, calc.modeId === m.id && s.modeChipActive]} onPress={() => selectMode(m)}>
                    <Text style={[s.modeChipTxt, calc.modeId === m.id && s.modeChipTxtActive]}>{tr(m.label)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Diluição (apenas infusão) */}
          {isInfusion && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("DILUIÇÃO")}</Text>

              <Text style={s.dilSectionLabel}>{tr("Diluições recomendadas")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.solRow}>
                {drug.standardSolutions.map((sol) => (
                  <Pressable key={sol.id} style={[s.solChip, isActiveSolution(sol.id) && s.solChipActive]} onPress={() => applySolution(sol.id)}>
                    <Text style={[s.solChipTxt, isActiveSolution(sol.id) && s.solChipTxtActive]}>{tr(sol.label)}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Diluições do usuário */}
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

              {/* Campos custom — criar a própria solução */}
              <Text style={s.dilSectionLabel}>{tr("Criar diluição personalizada")}</Text>
              <View style={s.dilFields}>
                <View style={s.dilField}>
                  <Text style={s.fieldLabel}>{tr("Ampolas")}</Text>
                  <TextInput style={s.input} value={calc.ampoules} onChangeText={(v) => setCalc((c) => ({ ...c, ampoules: v }))} keyboardType="decimal-pad" placeholderTextColor="#94a3b8" />
                </View>
                <View style={s.dilField}>
                  <Text style={s.fieldLabel}>{tr("Diluente (mL)")}</Text>
                  <TextInput style={s.input} value={calc.diluentMl} onChangeText={(v) => setCalc((c) => ({ ...c, diluentMl: v }))} keyboardType="decimal-pad" placeholderTextColor="#94a3b8" />
                </View>
                <View style={s.dilField}>
                  <Text style={s.fieldLabel}>{tr("Tipo")}</Text>
                  <View style={s.diluentSeg}>
                    {(["SF", "SG"] as Diluent[]).map((d) => (
                      <Pressable key={d} style={[s.diluentOpt, calc.diluent === d && s.diluentOptActive]} onPress={() => setCalc((c) => ({ ...c, diluent: d }))}>
                        <Text style={[s.diluentOptTxt, calc.diluent === d && s.diluentOptTxtActive]}>{d}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              {/* Resumo concentração */}
              {conc && (
                <View style={s.concGrid}>
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Ampolas")}</Text><Text style={s.concVal}>{amps}</Text></View>
                  <View style={s.concDivider} />
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Vol. final")}</Text><Text style={s.concVal}>{fmt(conc.finalVolumeMl, 0)} mL</Text></View>
                  <View style={s.concDivider} />
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Concentração")}</Text><Text style={[s.concVal, s.concValHi]}>{concLabel}</Text></View>
                </View>
              )}
            </View>
          )}

          {/* Bolus: apresentação pura */}
          {!isInfusion && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("APRESENTAÇÃO (BOLUS — AMPOLA PURA)")}</Text>
              <Text style={s.refLine}>{presentation.concentrationLabel}</Text>
              {mode.bolusNotes?.map((n) => <Text key={n} style={s.refLine}>• {n}</Text>)}
            </View>
          )}

          {/* Dose */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("DOSE")}</Text>
            {mode.acurasys && (
              <Pressable style={[s.acurasysBtn, acurasysActive && s.acurasysBtnActive]} onPress={applyAcurasys}>
                <Text style={s.acurasysTxt}>⭐ {mode.acurasys.label}</Text>
              </Pressable>
            )}
            {!acurasysActive && (
              <View style={s.calcInputRow}>
                <TextInput
                  style={s.calcInput}
                  value={calc.doseInput}
                  onChangeText={(v) => setCalc((c) => ({ ...c, doseInput: v }))}
                  keyboardType="decimal-pad"
                  placeholder={mode.defaultDose}
                  placeholderTextColor="#94a3b8"
                  accessibilityLabel={`Dose em ${mode.unit}`}
                />
                <Text style={s.calcUnit}>{mode.unit}</Text>
              </View>
            )}
            {acurasysActive && (
              <Pressable style={s.acurasysReset} onPress={() => setCalc((c) => ({ ...c, doseInput: mode.defaultDose }))}>
                <Text style={s.acurasysResetTxt}>{tr("Dose ACURASYS fixa: 37,5 mg/h · toque para voltar à dose por peso")}</Text>
              </Pressable>
            )}

            {/* Régua de faixas */}
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

          {/* MgSO4 checkbox (rocurônio) */}
          {drug.magnesiumInteraction && (
            <View style={s.mgRow}>
              <Switch value={calc.mgSulfate} onValueChange={(v) => setCalc((c) => ({ ...c, mgSulfate: v }))} />
              <Text style={s.mgTxt}>{tr("Paciente em sulfato de magnésio?")}</Text>
            </View>
          )}
          {drug.magnesiumInteraction && calc.mgSulfate && (
            <View style={s.alertWarn}>
              <Text style={s.alertTxt}>{tr("⚠️ MgSO₄ potencializa o rocurônio — reduzir a dose em 30–50% e monitorar com TOF.")}</Text>
            </View>
          )}

          {/* RESULTADO */}
          <View style={s.resultCard}>
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

          {/* Alerta clínico (sempre visível) */}
          <View style={[s.alertBox, drug.alert.tone === "danger" ? s.alertDanger : s.alertWarn]}>
            {drug.alert.lines.map((l, i) => (
              <Text key={i} style={s.alertTxt}>{i === 0 ? `${drug.alert.icon} ` : ""}{tr(l)}</Text>
            ))}
          </View>

          {/* Info clínica (collapsible) */}
          <Pressable style={s.collapsible} onPress={() => setShowInfo((v) => !v)}>
            <Text style={s.collapseTitle}>{tr("ℹ️ Informações clínicas")}</Text>
            <Text style={s.collapseChev}>{showInfo ? "▲" : "▼"}</Text>
          </Pressable>
          {showInfo && (
            <View style={s.collapseBody}>
              {drug.info.map((l, i) => <Text key={i} style={s.refLine}>• {tr(l)}</Text>)}
            </View>
          )}

          {/* Referência (collapsible) */}
          <Pressable style={s.collapsible} onPress={() => setShowRef((v) => !v)}>
            <Text style={s.collapseTitle}>{tr("📚 Referência")}</Text>
            <Text style={s.collapseChev}>{showRef ? "▲" : "▼"}</Text>
          </Pressable>
          {showRef && (
            <View style={s.collapseBody}>
              <Text style={s.refLine}>{tr(drug.reference)}</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>

      {/* Modal salvar diluição */}
      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{tr("Salvar diluição")}</Text>
            <Text style={s.modalSub}>{amps} amp · {fmt(dilMl, 0)} mL {calc.diluent} · {concLabel}</Text>
            <TextInput style={s.modalInput} value={saveLabel} onChangeText={setSaveLabel} placeholder={tr("Nome (ex: Padrão UTI)")} placeholderTextColor="#94a3b8" autoFocus />
            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => { setShowSaveModal(false); setSaveLabel(""); }}><Text style={s.modalCancelTxt}>{tr("Cancelar")}</Text></Pressable>
              <Pressable style={[s.modalSave, !saveLabel.trim() && s.modalSaveDisabled]} onPress={handleSaveDilution}><Text style={s.modalSaveTxt}>{tr("Salvar")}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#292e38" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)" },
  headerTitle: { color: "#f1f5f9", fontSize: 16, fontWeight: "800" },
  body: { flex: 1, flexDirection: "row" },

  sidebar: { width: 92, backgroundColor: "#1e1b4b", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.12)" },
  sidebarInner: { paddingVertical: 8 },
  sideGroup: { marginBottom: 8 },
  sideGroupLabel: { fontSize: 8.5, fontWeight: "900", color: "#a5b4fc", textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)", marginBottom: 2 },
  sideItem: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, marginHorizontal: 4 },
  sideItemActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  sideEmoji: { fontSize: 18 },
  sideName: { fontSize: 9, fontWeight: "700", color: "#cbd5e1", textAlign: "center", marginTop: 3, lineHeight: 12 },
  sideNameActive: { color: "#ffffff" },

  mainScroll: { flex: 1, backgroundColor: "#383e4a" },
  scroll: { padding: 14, gap: 12, paddingBottom: 28 },

  drugHeader: { gap: 2 },
  drugName: { fontSize: 20, fontWeight: "900", color: "#f1f5f9" },
  drugClass: { fontSize: 13, fontWeight: "600", color: "#a5b4fc" },

  card: { backgroundColor: "#383e4a", borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: "#565e6c" },
  cardLabel: { fontSize: 10, fontWeight: "800", color: "#aab6c6", letterSpacing: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#aab6c6", flex: 1 },
  input: { flex: 1.5, borderWidth: 1.5, borderColor: "#565e6c", borderRadius: 10, padding: 10, fontSize: 16, fontWeight: "700", color: "#f1f5f9", backgroundColor: "#383e4a" },
  hint: { fontSize: 11, color: "#aab6c6" },
  hintWarn: { fontSize: 11, color: "#f59e0b", fontWeight: "600" },

  modeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  modeChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: "#383e4a", borderWidth: 1.5, borderColor: "#565e6c" },
  modeChipActive: { backgroundColor: "rgba(99,102,241,0.2)", borderColor: "#818cf8" },
  modeChipTxt: { fontSize: 12, fontWeight: "700", color: "#aab6c6" },
  modeChipTxtActive: { color: "#c7d2fe" },

  dilSectionLabel: { fontSize: 10, fontWeight: "800", color: "#aab6c6", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 2 },
  userDilEmpty: { fontSize: 11, color: "#aab6c6", fontStyle: "italic", paddingVertical: 4 },
  saveDilBtnDisabled: { opacity: 0.4 },
  solRow: { gap: 8, paddingVertical: 2 },
  solChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#383e4a", borderWidth: 1.5, borderColor: "#565e6c", maxWidth: 230 },
  solChipActive: { backgroundColor: "rgba(99,102,241,0.15)", borderColor: "#818cf8" },
  solChipTxt: { fontSize: 11, fontWeight: "600", color: "#aab6c6" },
  solChipTxtActive: { color: "#c7d2fe", fontWeight: "800" },

  userDilHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userDilTitle: { fontSize: 12, fontWeight: "800", color: "#c4b5fd" },
  userDilList: { gap: 6 },
  userDilRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  userDilApply: { flex: 1, backgroundColor: "#383e4a", borderRadius: 10, padding: 10, borderWidth: 1.5, borderColor: "#c4b5fd" },
  userDilName: { fontSize: 13, fontWeight: "800", color: "#c4b5fd" },
  userDilMeta: { fontSize: 10, color: "#c4b5fd", marginTop: 2 },
  userDilDel: { padding: 8 },
  userDilDelTxt: { color: "#fca5a5", fontWeight: "700", fontSize: 14 },
  saveDilBtn: { backgroundColor: "#383e4a", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#c4b5fd" },
  saveDilBtnTxt: { fontSize: 11, fontWeight: "800", color: "#c4b5fd" },

  dilFields: { flexDirection: "row", gap: 8 },
  dilField: { flex: 1, gap: 4 },
  diluentSeg: { flexDirection: "row", borderWidth: 1.5, borderColor: "#565e6c", borderRadius: 10, overflow: "hidden" },
  diluentOpt: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#383e4a" },
  diluentOptActive: { backgroundColor: "#383e4a" },
  diluentOptTxt: { fontSize: 13, fontWeight: "700", color: "#aab6c6" },
  diluentOptTxtActive: { color: "#f1f5f9" },

  concGrid: { flexDirection: "row", backgroundColor: "#383e4a", borderRadius: 10, borderWidth: 1, borderColor: "#565e6c", overflow: "hidden" },
  concCell: { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4 },
  concDivider: { width: 1, backgroundColor: "#565e6c" },
  concKey: { fontSize: 9, fontWeight: "700", color: "#818cf8", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 2 },
  concVal: { fontSize: 13, fontWeight: "800", color: "#c7d2fe", textAlign: "center" },
  concValHi: { color: "#f1f5f9" },

  calcInputRow: { flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#818cf8", borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(99,102,241,0.12)" },
  calcInput: { flex: 1, padding: 12, fontSize: 22, fontWeight: "800", color: "#f1f5f9", textAlign: "right" },
  calcUnit: { fontSize: 11, fontWeight: "700", color: "#a5b4fc", paddingRight: 10, paddingLeft: 4 },

  acurasysBtn: { backgroundColor: "#383e4a", borderRadius: 10, borderWidth: 1.5, borderColor: "#facc15", padding: 12, alignItems: "center" },
  acurasysBtnActive: { backgroundColor: "rgba(250,204,21,0.18)" },
  acurasysTxt: { fontSize: 13, fontWeight: "800", color: "#fde047" },
  acurasysReset: { paddingVertical: 6 },
  acurasysResetTxt: { fontSize: 11, color: "#fde047", fontWeight: "600" },

  ruler: { gap: 8 },
  rulerBar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  rulerSeg: { flex: 1, opacity: 0.35, borderRadius: 3 },
  rulerSegActive: { opacity: 1 },
  rangeBox: { borderWidth: 1.5, borderRadius: 10, padding: 10, backgroundColor: "#383e4a" },
  rangeLabel: { fontSize: 13, fontWeight: "800" },
  rangeIndic: { fontSize: 11, color: "#aab6c6", marginTop: 2 },

  mgRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4 },
  mgTxt: { fontSize: 13, fontWeight: "600", color: "#cbd5e1" },

  resultCard: { backgroundColor: "#11261b", borderRadius: 16, borderWidth: 1.5, borderColor: "#22c55e", padding: 18, alignItems: "center", gap: 4 },
  resultLabel: { fontSize: 11, fontWeight: "800", color: "#86efac", letterSpacing: 1 },
  resultValue: { fontSize: 44, fontWeight: "900", color: "#f0fdf4", letterSpacing: -1 },
  resultUnit: { fontSize: 20, fontWeight: "700", color: "#86efac" },
  resultSub: { fontSize: 12, fontWeight: "600", color: "#bbf7d0", textAlign: "center" },
  resultWarn: { fontSize: 12, fontWeight: "700", color: "#fbbf24" },

  alertBox: { borderRadius: 12, padding: 12, borderWidth: 1.5, gap: 4 },
  alertDanger: { backgroundColor: "#3b0a0a", borderColor: "#fca5a5" },
  alertWarn: { backgroundColor: "#383e4a", borderColor: "#f59e0b" },
  alertTxt: { fontSize: 12, fontWeight: "600", color: "#f1f5f9", lineHeight: 18 },

  collapsible: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#383e4a", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: "#565e6c" },
  collapseTitle: { fontSize: 13, fontWeight: "700", color: "#f1f5f9" },
  collapseChev: { fontSize: 12, color: "#aab6c6" },
  collapseBody: { backgroundColor: "#383e4a", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 6, marginTop: -6, borderWidth: 1, borderColor: "#565e6c" },
  refLine: { fontSize: 12.5, color: "#aab6c6", lineHeight: 19 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#383e4a", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#f1f5f9" },
  modalSub: { fontSize: 12, color: "#aab6c6" },
  modalInput: { borderWidth: 1.5, borderColor: "#565e6c", borderRadius: 12, padding: 14, fontSize: 15, color: "#f1f5f9" },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#383e4a" },
  modalCancelTxt: { fontWeight: "700", color: "#aab6c6" },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#6366f1" },
  modalSaveDisabled: { backgroundColor: "#94a3b8" },
  modalSaveTxt: { fontWeight: "700", color: "#f1f5f9" },
});
