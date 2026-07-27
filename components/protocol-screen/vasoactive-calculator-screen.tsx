/**
 * vasoactive-calculator-screen.tsx
 *
 * Standalone vasoactive drug calculator.
 * Priority: accurate dose ↔ rate calculations, dilution management, drug associations.
 * No state machine / clinical flow.
 */

import { useState, useCallback, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  DRUGS,
  calcFromDose,
  calcFromRate,
  type Drug,
  type DrugKey,
  type Diluent,
} from "../../vasoactive-engine";
import {
  getSavedDilutions,
  saveDilution,
  deleteSavedDilution,
  type SavedDilution,
} from "../../lib/vasoactive-storage";
import { getAppGuidelinesStatus, getModuleGuidelinesStatus } from "../../lib/guidelines-version";
import { useTr } from "../../lib/use-tr";
import { trf } from "../../lib/i18n/trf";

// ─── Drug associations ─────────────────────────────────────────────────────────

type Association = {
  drug: string;
  dose: string;
  indication: string;
  tone: "info" | "warning" | "alert";
};

const ASSOCIATIONS: Record<DrugKey, Association[]> = {
  noradrenalina: [
    { drug: "Vasopressina", dose: "0,03 U/min (fixo)", indication: "Associar quando Nora ≥ 0,25 mcg/kg/min para poupar noradrenalina (SSC 2021)", tone: "info" },
    { drug: "Hidrocortisona", dose: "200 mg/dia IV contínuo", indication: "Choque persistente com Nora ≥ 0,25 mcg/kg/min sem resposta (SSC 2021)", tone: "warning" },
    { drug: "Dobutamina", dose: "2,5–5 mcg/kg/min", indication: "Se disfunção sistólica do VE coexistir (eco point-of-care)", tone: "info" },
    { drug: "Angiotensina II / Azul de metileno", dose: "Conforme protocolo", indication: "Dose excepcional > 3 mcg/kg/min refratária — uso excepcional com intensivista experiente", tone: "alert" },
  ],
  adrenalina: [
    { drug: "Noradrenalina", dose: "Conforme cálculo", indication: "Adrenalina é segunda linha — considerar substituição por nora quando estabilizado", tone: "warning" },
    { drug: "Vasopressina", dose: "0,03 U/min (fixo)", indication: "Choque vasoplégico refratário à adrenalina", tone: "info" },
  ],
  vasopressina: [
    { drug: "Noradrenalina", dose: "Continuar conforme dose", indication: "Vasopressina é ADJUVANTE — não substitui noradrenalina como vasopressor principal", tone: "warning" },
  ],
  dopamina: [
    { drug: "Noradrenalina (preferir)", dose: "Conforme cálculo", indication: "⚠️ SSC 2021: noradrenalina preferida ao invés de dopamina no choque séptico (De Backer NEJM 2010)", tone: "alert" },
  ],
  dobutamina: [
    { drug: "Noradrenalina", dose: "Conforme cálculo", indication: "Associar vasopressor se PAM < 65 — dobutamina sozinha não trata hipotensão vasoplégica", tone: "warning" },
    { drug: "Vasopressina", dose: "0,03 U/min (fixo)", indication: "Choque misto (cardiogênico + vasoplégico) — combinação frequente na UTI", tone: "info" },
    { drug: "Milrinona / Levosimendan", dose: "Conforme cálculo", indication: "Choque cardiogênico grave: considerar associação de inodilatador se resposta insuficiente", tone: "info" },
  ],
  milrinona: [
    { drug: "Noradrenalina", dose: "Conforme cálculo", indication: "Associar vasopressor se PAM < 65 — milrinona causa vasodilatação e pode hipotensão", tone: "warning" },
    { drug: "Dobutamina", dose: "2,5–10 mcg/kg/min", indication: "Choque cardiogênico refratário — combinação possível mas aumenta risco de arritmia", tone: "warning" },
  ],
  levosimendan: [
    { drug: "Noradrenalina", dose: "Conforme cálculo", indication: "Necessário suporte vasopressor se PA cair durante infusão (hipotensão frequente)", tone: "warning" },
    { drug: "Dobutamina (evitar)", dose: "—", indication: "Combinação geralmente desnecessária — levosimendan já tem efeito inotrópico", tone: "info" },
  ],
  nitroprussiato: [
    { drug: "⚠️ Cianeto — antídoto", dose: "Hidroxocobalamina 5 g IV ou tiossulfato de sódio", indication: "Toxicidade em doses > 2 mcg/kg/min por > 24–48h ou em IH/IR", tone: "alert" },
    { drug: "Nitroglicerina (alternativa)", dose: "5–200 mcg/min", indication: "NTG preferível quando: SCA associado, sem necessidade de efeito arterial intenso", tone: "info" },
  ],
  nitroglicerina: [
    { drug: "Furosemida", dose: "20–80 mg IV", indication: "EPA: associar diurético para remoção de volume junto com vasodilatação", tone: "info" },
    { drug: "Morfina (avaliar)", dose: "2–4 mg IV s/n", indication: "Ansiedade / dor isquêmica — uso com cautela (depressão respiratória)", tone: "warning" },
  ],
  fenilefrina: [
    { drug: "Noradrenalina (preferir em sepse)", dose: "Conforme cálculo", indication: "Noradrenalina tem melhor evidência em choque séptico — fenilefrina como alternativa", tone: "warning" },
    { drug: "Atropina / Marcapasso", dose: "Conforme protocolo", indication: "Bradicardia reflexa grave: > 40% de redução de FC — intervir", tone: "alert" },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(decimals).replace(".", ",");
}

function parsePt(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function drugByKey(key: DrugKey): Drug {
  return DRUGS.find((d) => d.key === key)!;
}

function parseMap(pas: string, pad: string): number | null {
  const sbp = parsePt(pas);
  const dbp = parsePt(pad);
  if (sbp == null || dbp == null) return null;
  return (sbp + 2 * dbp) / 3;
}

function buildInitialStrategy(tr: (pt: string) => string, drugKey: DrugKey, referral: {
  fromModule: string;
  reason: string;
  pas: string;
  pad: string;
  symptoms: string;
}): string[] {
  const strategy: string[] = [];
  const map = parseMap(referral.pas, referral.pad);
  const symptoms = referral.symptoms.toLowerCase();
  const fromAnaphylaxis = referral.fromModule === "anafilaxia";

  if (drugKey === "noradrenalina") {
    strategy.push("Droga de primeira linha na maioria dos choques vasoplégicos; alvo inicial habitual: PAM ≥ 65 mmHg.");
    strategy.push("Se acesso central ainda não existir, pode iniciar perifericamente por curto período em veia proximal, com vigilância estreita do sítio.");
    strategy.push("Se PAM continuar inadequada com noradrenalina baixa a moderada, considerar associar vasopressina.");
  }

  if (drugKey === "adrenalina") {
    strategy.push("Na anafilaxia, adrenalina em infusão é opção para choque refratário após adrenalina IM adequada, oxigênio e volume.");
    strategy.push("Não banalizar adrenalina EV: manter monitorização contínua e titular conforme perfusão, frequência cardíaca e arritmias.");
    strategy.push("Se a vasoplegia persistir apesar da adrenalina, discutir associação de outro vasopressor conforme contexto hemodinâmico.");
  }

  if (drugKey === "dobutamina") {
    strategy.push("Dobutamina não substitui vasopressor quando a PAM está baixa; associar noradrenalina se houver hipotensão.");
  }

  if (drugKey === "vasopressina") {
    strategy.push("Vasopressina é adjuvante, não vasopressor isolado principal; manter o vasopressor de base.");
  }

  if (fromAnaphylaxis) {
    strategy.push("Antes de escalar vasopressor, confirmar que a anafilaxia já recebeu adrenalina IM repetida quando indicada, O₂, posicionamento e cristalóide.");
  }

  if (map != null && map < 65) {
    strategy.push(trf(tr, "PAM estimada no encaminhamento ~ {0} mmHg: quadro ainda sugere hipoperfusão relevante, exigir titulação rápida e reavaliação frequente.", [Math.round(map)]));
  }

  if (symptoms.includes("filiforme") || symptoms.includes("extremidades frias")) {
    strategy.push("Sinais de hipoperfusão periférica reforçam necessidade de reavaliar resposta ao vasopressor junto com débito urinário, nível de consciência e lactato.");
  }

  return strategy;
}

// ─── Component ─────────────────────────────────────────────────────────────────

type CalcState = {
  selectedDrug: DrugKey;
  weightKg: string;
  ampoules: string;
  diluentMl: string;
  diluent: Diluent;
  presentationId: string;
  doseInput: string;
  rateInput: string;
  lastEdited: "dose" | "rate";
};

function initialState(drugKey: DrugKey = "noradrenalina"): CalcState {
  const drug = drugByKey(drugKey);
  const sol = drug.standardSolutions?.[0];
  return {
    selectedDrug: drugKey,
    weightKg: "",
    ampoules: sol?.ampoules ?? "1",
    diluentMl: sol?.diluentMl ?? "250",
    diluent: (sol?.diluent as Diluent) ?? drug.recommendedDiluent ?? "SG",
    presentationId: drug.presentations[0].id,
    doseInput: "",
    rateInput: "",
    lastEdited: "dose",
  };
}

export default function VasoactiveCalculatorScreen() {
  const tr = useTr();
  const params = useLocalSearchParams<{
    from_module?: string;
    reason?: string;
    weight_kg?: string;
    spo2?: string;
    gcs?: string;
    pas?: string;
    pad?: string;
    fc?: string;
    symptoms?: string;
    drug?: string;
  }>();
  const referral = {
    fromModule: Array.isArray(params.from_module) ? (params.from_module[0] ?? "") : (params.from_module ?? ""),
    reason: Array.isArray(params.reason) ? (params.reason[0] ?? "") : (params.reason ?? ""),
    weightKg: Array.isArray(params.weight_kg) ? (params.weight_kg[0] ?? "") : (params.weight_kg ?? ""),
    spo2: Array.isArray(params.spo2) ? (params.spo2[0] ?? "") : (params.spo2 ?? ""),
    gcs: Array.isArray(params.gcs) ? (params.gcs[0] ?? "") : (params.gcs ?? ""),
    pas: Array.isArray(params.pas) ? (params.pas[0] ?? "") : (params.pas ?? ""),
    pad: Array.isArray(params.pad) ? (params.pad[0] ?? "") : (params.pad ?? ""),
    fc: Array.isArray(params.fc) ? (params.fc[0] ?? "") : (params.fc ?? ""),
    symptoms: Array.isArray(params.symptoms) ? (params.symptoms[0] ?? "") : (params.symptoms ?? ""),
    drug: Array.isArray(params.drug) ? (params.drug[0] ?? "") : (params.drug ?? ""),
  };
  const initialDrug = referral.drug === "adrenalina"
    ? "adrenalina"
    : "noradrenalina";
  const initialWeight = referral.weightKg;
  const [calc, setCalc] = useState<CalcState>(() => ({
    ...initialState(initialDrug as DrugKey),
    weightKg: initialWeight,
  }));
  const [showRefPanel, setShowRefPanel] = useState(false);
  const [showAssocPanel, setShowAssocPanel] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [savedDilutions, setSavedDilutions] = useState<SavedDilution[]>(() =>
    getSavedDilutions(initialDrug as DrugKey)
  );

  const guidelinesStatus = getAppGuidelinesStatus();
  const moduleStatuses = getModuleGuidelinesStatus("drogas_vasoativas");
  const isStale = moduleStatuses.some((s) => s.isStale);
  const badgeColor = isStale ? "red" : moduleStatuses.some((s) => s.statusLabel === "Revisar em breve") ? "yellow" : "green";

  // ── Derived calculation ──────────────────────────────────────────────────────

  const drug = useMemo(() => drugByKey(calc.selectedDrug), [calc.selectedDrug]);
  const presentation = useMemo(
    () => drug.presentations.find((p) => p.id === calc.presentationId) ?? drug.presentations[0],
    [drug, calc.presentationId]
  );

  const amps = parsePt(calc.ampoules) ?? 0;
  const dilMl = parsePt(calc.diluentMl) ?? 0;
  const wt = parsePt(calc.weightKg) ?? 0;

  const finalVolMl = dilMl + amps * presentation.ampouleVolumeMl;
  const totalBase = amps * presentation.basePerAmpoule;
  const concPerMl = finalVolMl > 0 ? totalBase / finalVolMl : 0;

  const baseCalcParams = {
    weightKg: wt,
    ampoules: amps,
    ampouleVolumeMl: presentation.ampouleVolumeMl,
    basePerAmpoule: presentation.basePerAmpoule,
    diluentMl: dilMl,
    doseUnit: drug.doseUnit,
  };

  const doseVal = parsePt(calc.doseInput);
  const rateVal = parsePt(calc.rateInput);

  const fromDoseResult = useMemo(
    () => doseVal !== null && calc.lastEdited === "dose"
      ? calcFromDose({ ...baseCalcParams, dose: doseVal })
      : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calc.doseInput, calc.ampoules, calc.diluentMl, calc.weightKg, calc.presentationId, calc.selectedDrug, calc.lastEdited]
  );

  const fromRateResult = useMemo(
    () => rateVal !== null && calc.lastEdited === "rate"
      ? calcFromRate({ ...baseCalcParams, rateMlH: rateVal })
      : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calc.rateInput, calc.ampoules, calc.diluentMl, calc.weightKg, calc.presentationId, calc.selectedDrug, calc.lastEdited]
  );

  const displayRate = calc.lastEdited === "dose"
    ? (fromDoseResult ? fmt(fromDoseResult.rateMlH, 1) : (calc.doseInput ? "—" : ""))
    : calc.rateInput;

  const displayDose = calc.lastEdited === "rate"
    ? (fromRateResult ? fmt(fromRateResult.dose, 3) : (calc.rateInput ? "—" : ""))
    : calc.doseInput;

  const rateMlH = calc.lastEdited === "dose"
    ? (fromDoseResult?.rateMlH ?? null)
    : rateVal;

  const doseNum = calc.lastEdited === "rate"
    ? (fromRateResult?.dose ?? null)
    : doseVal;

  // Alert checks
  const vasopressinAlert = drug.vasopressinAlert && doseNum !== null && doseNum >= drug.vasopressinAlert.threshold;
  const highDoseAlert = drug.key === "noradrenalina" && doseNum !== null && doseNum > 1;
  const exceptionalDoseAlert = drug.key === "noradrenalina" && doseNum !== null && doseNum > 3;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const selectDrug = useCallback((key: DrugKey) => {
    setCalc((current) => ({
      ...initialState(key),
      weightKg: current.weightKg,
    }));
    setSavedDilutions(getSavedDilutions(key));
    setShowRefPanel(false);
    setShowAssocPanel(false);
  }, []);

  const applySolution = useCallback((solutionId: string) => {
    const sol = drug.standardSolutions?.find((s) => s.id === solutionId);
    if (!sol) return;
    setCalc((c) => ({
      ...c,
      ampoules: sol.ampoules,
      diluentMl: sol.diluentMl,
      diluent: sol.diluent as Diluent,
      presentationId: sol.presentationId,
      doseInput: "",
      rateInput: "",
      lastEdited: "dose",
    }));
  }, [drug]);

  const applySaved = useCallback((d: SavedDilution) => {
    setCalc((c) => ({
      ...c,
      ampoules: String(d.ampoules),
      diluentMl: String(d.diluentMl),
      diluent: d.diluent,
      doseInput: "",
      rateInput: "",
      lastEdited: "dose",
    }));
  }, []);

  const handleSaveDilution = () => {
    if (!saveLabel.trim() || amps <= 0 || dilMl <= 0) return;
    const entry = saveDilution(calc.selectedDrug, saveLabel.trim(), amps, dilMl, calc.diluent);
    setSavedDilutions((prev) => [...prev, entry]);
    setSaveLabel("");
    setShowSaveModal(false);
  };

  const handleDeleteSaved = (id: string) => {
    deleteSavedDilution(id);
    setSavedDilutions((prev) => prev.filter((d) => d.id !== id));
  };

  const isActiveSolution = (solutionId: string) => {
    const sol = drug.standardSolutions?.find((s) => s.id === solutionId);
    return sol?.ampoules === calc.ampoules && sol?.diluentMl === calc.diluentMl;
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const prepSteps: string[] = [];
  if (amps > 0 && dilMl > 0) {
    const mgTotal = totalBase / (drug.baseUnit === "U" ? 1 : 1000);
    const unitLabel = drug.baseUnit === "U" ? "U" : "mg";
    prepSteps.push(trf(tr, "Retirar {0} ampola{1} de {2} ({3} {4})", [amps, amps > 1 ? "s" : "", drug.name, fmt(mgTotal, drug.baseUnit === "U" ? 0 : 1), unitLabel]));
    prepSteps.push(trf(tr, "Adicionar {0} mL de {1}", [fmt(dilMl, 0), tr(calc.diluent === "SF" ? "SF 0,9%" : "SG 5%")]));
    prepSteps.push(trf(tr, "Volume final: {0} mL", [fmt(finalVolMl, 0)]));
    if (concPerMl > 0) {
      const concUnitLabel = drug.baseUnit === "U" ? "U/mL" : "mcg/mL";
      prepSteps.push(trf(tr, "Concentração: {0} {1}", [fmt(concPerMl, drug.baseUnit === "U" ? 3 : 2), concUnitLabel]));
    }
    if (rateMlH !== null && rateMlH > 0) {
      prepSteps.push(trf(tr, "Taxa na bomba: {0} mL/h", [fmt(rateMlH, 1)]));
    }
  }

  const assocList = ASSOCIATIONS[calc.selectedDrug] ?? [];
  const initialStrategy = buildInitialStrategy(tr, calc.selectedDrug, referral);

  return (
    <View style={s.screen}>
      {/* ── Header (voltar aos módulos fica na faixa do ecrã `modulos/[id]`) ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>{tr("💊 Drogas Vasoativas")}</Text>
        <Text
          style={[
            s.versionHint,
            badgeColor === "yellow" && s.versionWarn,
            badgeColor === "red" && s.versionAlert,
          ]}
          numberOfLines={1}>
          v{guidelinesStatus.version}
          {badgeColor !== "green" ? " · revisar" : ""}
        </Text>
      </View>

      {/* ── Body: sidebar + content ─────────────────────────────────────────── */}
      <View style={s.body}>
        {/* ── Sidebar ── */}
        <View style={s.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sidebarInner}>
            {DRUGS.map((d) => (
              <Pressable
                key={d.key}
                style={[s.sideItem, calc.selectedDrug === d.key && s.sideItemActive]}
                onPress={() => selectDrug(d.key)}>
                <Text style={s.sideEmoji}>{d.emoji}</Text>
                <Text style={[s.sideName, calc.selectedDrug === d.key && s.sideNameActive]}
                  numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {tr(d.name)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Main content ── */}
        <ScrollView style={s.mainScroll} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {referral.fromModule ? (
            <View style={s.referralCard}>
              <Text style={s.referralTitle}>{tr("Contexto encaminhado")}</Text>
              <Text style={s.referralLine}>Origem: {referral.fromModule}</Text>
              <Text style={s.referralLine}>{tr("Motivo")}: {referral.reason || "—"}</Text>
              <Text style={s.referralLine}>{tr("Droga sugerida")}: {initialDrug === "adrenalina" ? "Adrenalina" : "Noradrenalina"}</Text>
              <Text style={s.referralLine}>{tr("Peso")}: {initialWeight || "—"} kg</Text>
              <Text style={s.referralLine}>PA: {referral.pas || "—"}/{referral.pad || "—"} mmHg</Text>
              <Text style={s.referralLine}>FC: {referral.fc || "—"} bpm</Text>
              <Text style={s.referralLine}>SpO₂: {referral.spo2 || "—"}%</Text>
              <Text style={s.referralLine}>GCS: {referral.gcs || "—"}</Text>
              <Text style={s.referralLine}>{tr("Manifestações")}: {referral.symptoms || "—"}</Text>
            </View>
          ) : null}
          <View style={s.referralCard}>
            <Text style={s.referralTitle}>{tr("Estratégia inicial")}</Text>
            {initialStrategy.map((line) => (
              <Text key={line} style={s.referralLine}>• {tr(line)}</Text>
            ))}
          </View>

          {/* ── Patient weight ───────────────────────────────────────────────── */}
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
              />
            </View>
            {drug.doseUnit === "mcg/min" ? (
              <Text style={s.hint}>Dose de {drug.name} NÃO depende do peso</Text>
            ) : wt > 0 ? (
              <Text style={s.hint}>Paciente: {fmt(wt, 0)} kg</Text>
            ) : (
              <Text style={s.hintWarn}>{tr("⚠️ Informe o peso para calcular a dose em mcg/kg/min")}</Text>
            )}
            <Text style={s.hint}>
              {tr("Alvo hemodinâmico inicial habitual: PAM ≥ 65 mmHg, ajustando ao contexto clínico.")}
            </Text>
          </View>

          {/* ── Dilution ─────────────────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("DILUIÇÃO")}</Text>

            {/* Standard solutions */}
            {drug.standardSolutions && drug.standardSolutions.length > 0 && (
              <View style={s.dilSection}>
                <Text style={s.dilSectionLabel}>{tr("Diluições recomendadas")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.solRow}>
                  {drug.standardSolutions.map((sol) => (
                    <Pressable
                      key={sol.id}
                      style={[s.solChip, isActiveSolution(sol.id) && s.solChipActive]}
                      onPress={() => applySolution(sol.id)}>
                      <Text style={[s.solChipTxt, isActiveSolution(sol.id) && s.solChipTxtActive]}>
                        {tr(sol.label)}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Saved custom dilutions */}
            <View style={s.dilSection}>
              <View style={s.userDilHeader}>
                <Text style={s.userDilTitle}>{tr("Diluições do usuário")}</Text>
                <Pressable onPress={() => setShowSaveModal(true)} style={s.saveDilBtn}>
                  <Text style={s.saveDilBtnTxt}>{tr("+ Salvar atual")}</Text>
                </Pressable>
              </View>
              {savedDilutions.length === 0 ? (
                <Text style={s.userDilEmpty}>{tr("Nenhuma diluição salva. Configure abaixo e toque em \"+ Salvar atual\".")}</Text>
              ) : (
                <View style={s.userDilList}>
                  {savedDilutions.map((d) => (
                    <View key={d.id} style={s.userDilRow}>
                      <Pressable style={s.userDilApply} onPress={() => applySaved(d)}>
                        <Text style={s.userDilName}>📌 {d.label}</Text>
                        <Text style={s.userDilMeta}>{d.ampoules} amp · {d.diluentMl} mL {d.diluent} · {d.savedAt}</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeleteSaved(d.id)} style={s.userDilDel}>
                        <Text style={s.userDilDelTxt}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Custom fields */}
            <View style={s.dilFields}>
              <View style={s.dilField}>
                <Text style={s.fieldLabel}>{tr("Ampolas")}</Text>
                <TextInput
                  style={s.input}
                  value={calc.ampoules}
                  onChangeText={(v) => setCalc((c) => ({ ...c, ampoules: v, doseInput: "", rateInput: "" }))}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={s.dilField}>
                <Text style={s.fieldLabel}>{tr("Diluente (mL)")}</Text>
                <TextInput
                  style={s.input}
                  value={calc.diluentMl}
                  onChangeText={(v) => setCalc((c) => ({ ...c, diluentMl: v, doseInput: "", rateInput: "" }))}
                  keyboardType="decimal-pad"
                  placeholder="250"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={s.dilField}>
                <Text style={s.fieldLabel}>{tr("Tipo")}</Text>
                <View style={s.diluentSeg}>
                  {(["SF", "SG"] as Diluent[]).map((d) => (
                    <Pressable
                      key={d}
                      style={[s.diluentOpt, calc.diluent === d && s.diluentOptActive]}
                      onPress={() => setCalc((c) => ({ ...c, diluent: d }))}>
                      <Text style={[s.diluentOptTxt, calc.diluent === d && s.diluentOptTxtActive]}>{d}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* Concentration summary */}
            {amps > 0 && dilMl > 0 && (
              <View style={s.concGrid}>
                <View style={s.concCell}>
                  <Text style={s.concKey}>{tr("Ampolas")}</Text>
                  <Text style={s.concVal}>{amps} {amps === 1 ? "amp" : "amp"}</Text>
                </View>
                <View style={s.concDivider} />
                <View style={s.concCell}>
                  <Text style={s.concKey}>{tr("Diluente")}</Text>
                  <Text style={s.concVal}>{fmt(dilMl, 0)} mL</Text>
                </View>
                <View style={s.concDivider} />
                <View style={s.concCell}>
                  <Text style={s.concKey}>{tr("Vol. final")}</Text>
                  <Text style={s.concVal}>{fmt(finalVolMl, 0)} mL</Text>
                </View>
                <View style={s.concDivider} />
                <View style={s.concCell}>
                  <Text style={s.concKey}>{tr("Concentração")}</Text>
                  <Text style={[s.concVal, s.concValHighlight]}>
                    {fmt(concPerMl, drug.baseUnit === "U" ? 3 : 2)} {drug.baseUnit === "U" ? "U/mL" : "mcg/mL"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Calculator ───────────────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("CALCULAR")}</Text>

            {/* Inline weight — only for weight-based drugs, shown when weight is missing */}
            {drug.doseUnit === "mcg/kg/min" && (
              <View style={s.calcWeightRow}>
                <Text style={[s.calcWeightLabel, wt <= 0 && s.calcWeightLabelWarn]}>
                  {tr("Peso (kg)")}{wt <= 0 ? tr(" — obrigatório") : ` = ${fmt(wt, 0)} kg`}
                </Text>
                <TextInput
                  style={[s.calcWeightInput, wt <= 0 && s.calcWeightInputWarn]}
                  value={calc.weightKg}
                  onChangeText={(v) => setCalc((c) => ({ ...c, weightKg: v }))}
                  keyboardType="decimal-pad"
                  placeholder="ex: 70"
                  placeholderTextColor="#94a3b8"
                />
                <Text style={s.calcWeightUnit}>kg</Text>
              </View>
            )}

            <View style={s.calcGrid}>
              {/* Dose column */}
              <View style={s.calcCol}>
                <Text style={s.calcColLabel}>{tr("DOSE")}</Text>
                <View style={[s.calcInputRow, calc.lastEdited === "dose" && s.calcInputRowActive]}>
                  <TextInput
                    style={s.calcInput}
                    value={calc.lastEdited === "dose" ? calc.doseInput : displayDose}
                    onChangeText={(v) => setCalc((c) => ({ ...c, doseInput: v, lastEdited: "dose" }))}
                    onFocus={() => setCalc((c) => ({ ...c, lastEdited: "dose" }))}
                    keyboardType="decimal-pad"
                    placeholder="0,10"
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={s.calcUnit}>{drug.doseUnit}</Text>
                </View>
              </View>

              {/* Arrow */}
              <View style={s.calcArrow}>
                <Text style={s.calcArrowTxt}>⇄</Text>
              </View>

              {/* Rate column */}
              <View style={s.calcCol}>
                <Text style={s.calcColLabel}>{tr("TAXA")}</Text>
                <View style={[s.calcInputRow, calc.lastEdited === "rate" && s.calcInputRowActive]}>
                  <TextInput
                    style={s.calcInput}
                    value={calc.lastEdited === "rate" ? calc.rateInput : displayRate}
                    onChangeText={(v) => setCalc((c) => ({ ...c, rateInput: v, lastEdited: "rate" }))}
                    onFocus={() => setCalc((c) => ({ ...c, lastEdited: "rate" }))}
                    keyboardType="decimal-pad"
                    placeholder="7,5"
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={s.calcUnit}>mL/h</Text>
                </View>
              </View>
            </View>

            {/* Warning: weight required but missing */}
            {drug.doseUnit === "mcg/kg/min" && wt <= 0 && (calc.doseInput || calc.rateInput) && (
              <View style={s.calcMissingWeight}>
                <Text style={s.calcMissingWeightTxt}>
                  {tr("⚠️ Informe o peso do paciente acima para calcular a dose em mcg/kg/min.")}
                </Text>
              </View>
            )}

            {/* Dose alerts */}
            {exceptionalDoseAlert && (
              <View style={s.alertDanger}>
                <Text style={s.alertTxt}>
                  🔴 Dose excepcional ({">"}  3 mcg/kg/min) — limiar de relatos isolados em falência terapêutica. Eficiência muito reduzida. Estratégia multimodal obrigatória: vasopressina + hidrocortisona + avaliação de angiotensina II. Risco elevado de isquemia. Envolver equipe experiente.
                </Text>
              </View>
            )}
            {!exceptionalDoseAlert && highDoseAlert && (
              <View style={s.alertWarn}>
                <Text style={s.alertTxt}>
                  ⚠️ Dose alta ({">"} 1 mcg/kg/min) — marcador de gravidade, saturação progressiva de receptores alfa. Associar vasopressina 0,03 U/min e hidrocortisona 200 mg/dia se ainda não iniciados.
                </Text>
              </View>
            )}
            {!highDoseAlert && vasopressinAlert && (
              <View style={s.alertInfo}>
                <Text style={s.alertTxt}>{drug.vasopressinAlert!.message}</Text>
              </View>
            )}
          </View>

          {/* ── Preparo ──────────────────────────────────────────────────────── */}
          {prepSteps.length > 0 && (
            <View style={[s.card, s.prepCard]}>
              <Text style={s.cardLabel}>{tr("📋 PREPARO")}</Text>
              {prepSteps.map((step, i) => (
                <Text key={i} style={[s.prepStep, i === prepSteps.length - 1 && rateMlH !== null && s.prepStepRate]}>
                  {i + 1}. {tr(step)}
                </Text>
              ))}
              {presentation.notes && (
                <Text style={s.prepNote}>{tr(presentation.notes)}</Text>
              )}
            </View>
          )}

          {/* ── Reference (collapsible) ───────────────────────────────────────── */}
          <Pressable style={s.collapsible} onPress={() => setShowRefPanel((v) => !v)}>
            <Text style={s.collapseTitle}>{tr("ℹ️ Referência clínica")}</Text>
            <Text style={s.collapseChev}>{showRefPanel ? "▲" : "▼"}</Text>
          </Pressable>
          {showRefPanel && (
            <View style={s.collapseBody}>
              <View style={s.refRow}>
                <Text style={s.refKey}>{tr("Estratégia")}</Text>
                <Text style={s.refVal}>
                  {tr(drug.key === "noradrenalina"
                    ? "Primeira linha na vasoplegia/choque séptico; adicionar vasopressina se PAM seguir baixa."
                    : drug.key === "adrenalina"
                      ? "Reservar para contextos específicos como anafilaxia refratária, choque com componente beta necessário ou protocolo local."
                      : "Usar conforme contexto hemodinâmico e protocolo local.")}
                </Text>
              </View>
              <View style={s.refRow}>
                <Text style={s.refKey}>{tr("Acesso")}</Text>
                <Text style={s.refVal}>
                  {tr("Vasopressor periférico pode ser usado por curto período em veia proximal enquanto organiza acesso central, com vigilância frequente do sítio.")}
                </Text>
              </View>
              {drug.reference.usual && (
                <View style={s.refRow}>
                  <Text style={s.refKey}>{tr("Faixa usual")}</Text>
                  <Text style={s.refVal}>{tr(drug.reference.usual)}</Text>
                </View>
              )}
              {drug.reference.titration && (
                <View style={s.refRow}>
                  <Text style={s.refKey}>{tr("Titulação")}</Text>
                  <Text style={s.refVal}>{tr(drug.reference.titration)}</Text>
                </View>
              )}
              {drug.reference.max && (
                <View style={s.refRow}>
                  <Text style={s.refKey}>{tr("Dose máxima")}</Text>
                  <Text style={s.refVal}>{tr(drug.reference.max)}</Text>
                </View>
              )}
              {drug.reference.notes?.map((note, i) => (
                <View key={i} style={[s.refRow, s.refNote]}>
                  <Text style={s.refVal}>• {tr(note)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Associations (collapsible) ────────────────────────────────────── */}
          {assocList.length > 0 && (
            <>
              <Pressable style={s.collapsible} onPress={() => setShowAssocPanel((v) => !v)}>
                <Text style={s.collapseTitle}>{tr("🔗 Associações indicadas")}</Text>
                <Text style={s.collapseChev}>{showAssocPanel ? "▲" : "▼"}</Text>
              </Pressable>
              {showAssocPanel && (
                <View style={s.collapseBody}>
                  {assocList.map((a, i) => (
                    <View key={i} style={[
                      s.assocCard,
                      a.tone === "warning" && s.assocWarn,
                      a.tone === "alert" && s.assocAlert,
                    ]}>
                      <Text style={s.assocDrug}>{tr(a.drug)}</Text>
                      <Text style={s.assocDose}>{tr(a.dose)}</Text>
                      <Text style={s.assocIndication}>{tr(a.indication)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>

      {/* ── Save dilution modal ───────────────────────────────────────────── */}
      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{tr("Salvar diluição")}</Text>
            <Text style={s.modalSub}>
              {amps} amp · {dilMl} mL {calc.diluent} · {fmt(concPerMl, drug.baseUnit === "U" ? 3 : 1)} {drug.baseUnit === "U" ? "U/mL" : "mcg/mL"}
            </Text>
            <TextInput
              style={s.modalInput}
              value={saveLabel}
              onChangeText={setSaveLabel}
              placeholder={tr("Nome da diluição (ex: Padrão UTI)")}
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => { setShowSaveModal(false); setSaveLabel(""); }}>
                <Text style={s.modalCancelTxt}>{tr("Cancelar")}</Text>
              </Pressable>
              <Pressable style={[s.modalSave, !saveLabel.trim() && s.modalSaveDisabled]}
                onPress={handleSaveDilution}>
                <Text style={s.modalSaveTxt}>{tr("Salvar")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: "#1a1d23" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#1a1d23",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: { flex: 1, color: "#f1f5f9", fontSize: 16, fontWeight: "800" },
  versionHint: { fontSize: 11, fontWeight: "600", color: "rgba(241,245,249,0.55)", maxWidth: "42%" },
  versionWarn: { color: "rgba(254,243,199,0.95)" },
  versionAlert: { color: "rgba(254,202,202,0.95)" },

  // Layout
  body:             { flex: 1, flexDirection: "row" },

  // Sidebar
  sidebar:          { width: 86, backgroundColor: "#1e6fd9", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.12)" },
  sidebarInner:     { paddingVertical: 8, gap: 2 },
  sideItem:         { alignItems: "center", paddingVertical: 12, paddingHorizontal: 6, borderRadius: 10, marginHorizontal: 4 },
  sideItemActive:   { backgroundColor: "rgba(255,255,255,0.12)" },
  sideEmoji:        { fontSize: 20 },
  sideName:         { fontSize: 9, fontWeight: "700", color: "#94a3b8", textAlign: "center", marginTop: 3, lineHeight: 12 },
  sideNameActive:   { color: "#86efac" },

  // Main scroll
  mainScroll:       { flex: 1, backgroundColor: "#262a32" },
  scroll:           { padding: 14, gap: 12, paddingBottom: 28 },
  referralCard:     { backgroundColor: "#262a32", borderRadius: 14, padding: 14, gap: 4, borderWidth: 1, borderColor: "#3a404a" },
  referralTitle:    { fontSize: 12, fontWeight: "800", color: "#93c5fd", textTransform: "uppercase", letterSpacing: 0.7 },
  referralLine:     { fontSize: 12, color: "#94a3b8", lineHeight: 18 },
  card:             { backgroundColor: "#262a32", borderRadius: 14, padding: 14, gap: 10,
                      shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardLabel:        { fontSize: 10, fontWeight: "800", color: "#94a3b8", letterSpacing: 1 },
  cardHeaderRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  row:              { flexDirection: "row", alignItems: "center", gap: 12 },

  // Patient
  fieldLabel:       { fontSize: 12, fontWeight: "600", color: "#94a3b8", flex: 1 },
  input:            { flex: 1.5, borderWidth: 1.5, borderColor: "#3a404a", borderRadius: 10, padding: 10,
                      fontSize: 16, fontWeight: "700", color: "#f1f5f9", backgroundColor: "#262a32" },
  hint:             { fontSize: 11, color: "#94a3b8" },
  hintWarn:         { fontSize: 11, color: "#f59e0b", fontWeight: "600" },

  // Dilution sections
  dilSection:       { gap: 8 },
  dilSectionLabel:  { fontSize: 10, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase" },

  // Recommended solutions
  solRow:           { gap: 8, paddingVertical: 2 },
  solChip:          { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                      backgroundColor: "#262a32", borderWidth: 1.5, borderColor: "#3a404a" },
  solChipActive:    { backgroundColor: "rgba(77,154,255,0.15)", borderColor: "#4d9aff" },
  solChipTxt:       { fontSize: 11, fontWeight: "600", color: "#94a3b8" },
  solChipTxtActive: { color: "#4d9aff", fontWeight: "800" },

  // User dilutions
  userDilHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userDilTitle:     { fontSize: 12, fontWeight: "800", color: "#c4b5fd" },
  userDilEmpty:     { fontSize: 11, color: "#94a3b8", fontStyle: "italic", paddingVertical: 6 },
  userDilList:      { gap: 6 },
  userDilRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  userDilApply:     { flex: 1, backgroundColor: "#262a32", borderRadius: 10, padding: 10,
                      borderWidth: 1.5, borderColor: "#c4b5fd" },
  userDilName:      { fontSize: 13, fontWeight: "800", color: "#c4b5fd" },
  userDilMeta:      { fontSize: 10, color: "#c4b5fd", marginTop: 2 },
  userDilDel:       { padding: 8 },
  userDilDelTxt:    { color: "#f87171", fontWeight: "700", fontSize: 14 },

  saveDilBtn:       { backgroundColor: "#262a32", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#c4b5fd" },
  saveDilBtnTxt:    { fontSize: 11, fontWeight: "800", color: "#c4b5fd" },
  dilFields:        { flexDirection: "row", gap: 8 },
  dilField:         { flex: 1, gap: 4 },
  diluentSeg:       { flexDirection: "row", borderWidth: 1.5, borderColor: "#3a404a", borderRadius: 10, overflow: "hidden" },
  diluentOpt:       { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#262a32" },
  diluentOptActive: { backgroundColor: "#262a32" },
  diluentOptTxt:    { fontSize: 13, fontWeight: "700", color: "#94a3b8" },
  diluentOptTxtActive:{ color: "#f1f5f9" },
  concGrid:         { flexDirection: "row", backgroundColor: "#262a32", borderRadius: 10, borderWidth: 1, borderColor: "#3a404a", overflow: "hidden" },
  concCell:         { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4 },
  concDivider:      { width: 1, backgroundColor: "#3a404a" },
  concKey:          { fontSize: 9, fontWeight: "700", color: "#4d9aff", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 2 },
  concVal:          { fontSize: 13, fontWeight: "800", color: "#4d9aff", textAlign: "center" },
  concValHighlight: { color: "#f1f5f9", fontSize: 13 },

  // Calculator
  calcWeightRow:       { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#262a32", borderRadius: 10, borderWidth: 1, borderColor: "#3a404a", paddingHorizontal: 12, paddingVertical: 8 },
  calcWeightLabel:     { flex: 1, fontSize: 12, fontWeight: "600", color: "#94a3b8" },
  calcWeightLabelWarn: { color: "#d97706", fontWeight: "700" },
  calcWeightInput:     { width: 72, borderWidth: 1.5, borderColor: "#3a404a", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, fontWeight: "700", color: "#f1f5f9", backgroundColor: "#262a32", textAlign: "right" },
  calcWeightInputWarn: { borderColor: "#f59e0b", backgroundColor: "#262a32" },
  calcWeightUnit:      { fontSize: 12, fontWeight: "600", color: "#94a3b8", width: 22 },
  calcMissingWeight:   { backgroundColor: "#262a32", borderRadius: 8, borderWidth: 1, borderColor: "#fcd34d", padding: 10 },
  calcMissingWeightTxt:{ fontSize: 12, fontWeight: "600", color: "#fbbf24" },
  calcGrid:         { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  calcCol:          { flex: 1, gap: 6 },
  calcColLabel:     { fontSize: 10, fontWeight: "800", color: "#94a3b8", letterSpacing: 1, textAlign: "center" },
  calcInputRow:     { flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#3a404a", borderRadius: 12, overflow: "hidden", backgroundColor: "#262a32" },
  calcInputRowActive:{ borderColor: "#4d9aff", backgroundColor: "rgba(77,154,255,0.15)" },
  calcInput:        { flex: 1, padding: 12, fontSize: 20, fontWeight: "800", color: "#f1f5f9", textAlign: "right" },
  calcUnit:         { fontSize: 10, fontWeight: "700", color: "#94a3b8", paddingRight: 8, paddingLeft: 2 },
  calcArrow:        { paddingBottom: 12, alignItems: "center" },
  calcArrowTxt:     { fontSize: 20, color: "#cbd5e1" },

  // Alerts
  alertDanger:      { backgroundColor: "#3b0a0a", borderRadius: 10, padding: 12, borderWidth: 1.5, borderColor: "#f87171" },
  alertWarn:        { backgroundColor: "#262a32", borderRadius: 10, padding: 12, borderWidth: 1.5, borderColor: "#f59e0b" },
  alertInfo:        { backgroundColor: "#262a32", borderRadius: 10, padding: 12, borderWidth: 1.5, borderColor: "#3b82f6" },
  alertTxt:         { fontSize: 12, fontWeight: "600", color: "#f1f5f9", lineHeight: 18 },

  // Preparo
  prepCard:         { backgroundColor: "#1a2e1a", borderColor: "#4ade80", borderWidth: 1.5 },
  prepStep:         { fontSize: 13, color: "#f1f5f9", lineHeight: 20 },
  prepStepRate:     { fontWeight: "800", color: "#86efac", fontSize: 14 },
  prepNote:         { fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 4 },

  // Collapsible
  collapsible:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      backgroundColor: "#262a32", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                      shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  collapseTitle:    { fontSize: 13, fontWeight: "700", color: "#f1f5f9" },
  collapseChev:     { fontSize: 12, color: "#94a3b8" },
  collapseBody:     { backgroundColor: "#262a32", borderRadius: 12, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 10, marginTop: -6 },
  refRow:           { gap: 2 },
  refNote:          { paddingLeft: 4 },
  refKey:           { fontSize: 10, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.5 },
  refVal:           { fontSize: 12, color: "#94a3b8", lineHeight: 18 },

  // Associations
  assocCard:        { backgroundColor: "#262a32", borderRadius: 10, padding: 12, gap: 2, borderWidth: 1, borderColor: "#3a404a" },
  assocWarn:        { backgroundColor: "#262a32", borderColor: "#fbbf24" },
  assocAlert:       { backgroundColor: "#3b0a0a", borderColor: "#f87171" },
  assocDrug:        { fontSize: 13, fontWeight: "800", color: "#f1f5f9" },
  assocDose:        { fontSize: 12, fontWeight: "700", color: "#93c5fd" },
  assocIndication:  { fontSize: 11, color: "#94a3b8", lineHeight: 16 },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard:        { backgroundColor: "#262a32", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle:       { fontSize: 18, fontWeight: "800", color: "#f1f5f9" },
  modalSub:         { fontSize: 12, color: "#94a3b8" },
  modalInput:       { borderWidth: 1.5, borderColor: "#3a404a", borderRadius: 12, padding: 14, fontSize: 15, color: "#f1f5f9" },
  modalBtns:        { flexDirection: "row", gap: 10 },
  modalCancel:      { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#262a32" },
  modalCancelTxt:   { fontWeight: "700", color: "#94a3b8" },
  modalSave:        { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#1e6fd9" },
  modalSaveDisabled:{ backgroundColor: "#94a3b8" },
  modalSaveTxt:     { fontWeight: "700", color: "#f1f5f9" },
});
