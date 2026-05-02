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
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
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
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowContent, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import PresetSelectionSheet from "./preset-selection-sheet";

function normalizeHeightCmInput(value: string) {
  const trimmed = value.trim().replace(",", ".");
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return value;
  if (parsed >= 1 && parsed <= 2.5) return String(Math.round(parsed * 100));
  return value;
}

function sanitizeNumericInput(value: string) {
  return value.replace(/[^0-9.,]/g, "");
}

function parseHeightCm(value: string): number | null {
  const parsed = parsePt(value);
  if (parsed == null) return null;
  return parsed >= 1 && parsed <= 2.5 ? Math.round(parsed * 100) : parsed;
}

const PATIENT_WEIGHT_PRESETS = ["50", "60", "70", "80", "90", "100", "120"];
const PATIENT_HEIGHT_PRESETS = ["150", "160", "170", "180", "190", "200"];
type SelectionSheetMode = "weight" | "height" | "solution" | null;

// ─── Drug associations ─────────────────────────────────────────────────────────

type Association = {
  drug: string;
  dose: string;
  indication: string;
  tone: "info" | "warning" | "alert";
};

const ASSOCIATIONS: Record<DrugKey, Association[]> = {
  noradrenalina: [
    { drug: "Vasopressina", dose: "0,03 U/min (fixo)", indication: "Avaliar associação quando Nora estiver na faixa de 0,25 a 0,5 mcg/kg/min, conforme necessidade clínica, para poupar noradrenalina (SSC 2021)", tone: "warning" },
    { drug: "Hidrocortisona", dose: "200 mg/dia IV contínuo", indication: "Choque persistente com Nora ≥ 0,25 mcg/kg/min sem resposta (SSC 2021)", tone: "warning" },
    { drug: "Dobutamina", dose: "2,5–5 mcg/kg/min", indication: "Se disfunção sistólica do VE coexistir (eco point-of-care)", tone: "info" },
    {
      drug: "Azul de metileno",
      dose: "1–2 mg/kg IV em 20–60 min; alguns protocolos usam infusão 0,25–0,5 mg/kg/h",
      indication:
        "Resgate em vasoplegia refratária apesar de noradrenalina alta e vasopressina. Pode elevar PAM e poupar catecolaminas por bloquear a via NO/sGC/cGMP. Não é rotina: evidência ainda limitada e heterogênea; evitar em deficiência de G6PD, gestação e risco de síndrome serotoninérgica; pode interferir na SpO2 e pigmentar secreções.",
      tone: "warning",
    },
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

function formatContainerLabel(container: Drug["presentations"][number]["container"], amount: number) {
  const singular = container === "Frasco-ampola" ? "frasco-ampola" : "ampola";
  return amount === 1 ? singular : `${singular}s`;
}

function parseMap(pas: string, pad: string): number | null {
  const sbp = parsePt(pas);
  const dbp = parsePt(pad);
  if (sbp == null || dbp == null) return null;
  return (sbp + 2 * dbp) / 3;
}

function buildInitialStrategy(drugKey: DrugKey, referral: {
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
    strategy.push(`PAM estimada no encaminhamento ~ ${Math.round(map)} mmHg: quadro ainda sugere hipoperfusão relevante, exigir titulação rápida e reavaliação frequente.`);
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
  heightCm: string;
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
    heightCm: "",
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
  useWindowDimensions();
  const params = useLocalSearchParams<{
    from_module?: string;
    reason?: string;
    weight_kg?: string;
    height_cm?: string;
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
    heightCm: Array.isArray(params.height_cm) ? (params.height_cm[0] ?? "") : (params.height_cm ?? ""),
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
  const initialHeight = normalizeHeightCmInput(referral.heightCm);
  const [calc, setCalc] = useState<CalcState>(() => ({
    ...initialState(initialDrug as DrugKey),
    weightKg: initialWeight,
    heightCm: initialHeight,
  }));
  const [showRefPanel, setShowRefPanel] = useState(false);
  const [showAssocPanel, setShowAssocPanel] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [selectionSheetMode, setSelectionSheetMode] = useState<SelectionSheetMode>(null);
  const [selectionSheetOtherValue, setSelectionSheetOtherValue] = useState("");
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
  const heightCm = parseHeightCm(calc.heightCm);

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

  const doseFieldValue = calc.lastEdited === "rate" ? displayDose : calc.doseInput;
  const rateFieldValue = calc.lastEdited === "dose" ? displayRate : calc.rateInput;

  const rateMlH = calc.lastEdited === "dose"
    ? (fromDoseResult?.rateMlH ?? null)
    : rateVal;

  const doseNum = calc.lastEdited === "rate"
    ? (fromRateResult?.dose ?? null)
    : doseVal;
  const currentSolution = drug.standardSolutions?.find((sol) => sol.id === calc.presentationId) ?? null;
  const sheetOptions = selectionSheetMode === "weight"
    ? PATIENT_WEIGHT_PRESETS.map((value) => ({ value, label: value }))
    : selectionSheetMode === "height"
      ? PATIENT_HEIGHT_PRESETS.map((value) => ({ value, label: value }))
      : selectionSheetMode === "solution"
        ? (drug.standardSolutions ?? []).map((sol) => ({
            value: sol.id,
            label: sol.label,
            detail: `${sol.ampoules} amp · ${sol.diluentMl} mL ${sol.diluent}`,
          }))
        : [];

  // Alert checks
  const vasopressinAlert = drug.vasopressinAlert && doseNum !== null && doseNum >= drug.vasopressinAlert.threshold;
  const highDoseAlert = drug.key === "noradrenalina" && doseNum !== null && doseNum > 1;
  const exceptionalDoseAlert = drug.key === "noradrenalina" && doseNum !== null && doseNum > 3;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const selectDrug = useCallback((key: DrugKey) => {
    setCalc((current) => ({
      ...initialState(key),
      weightKg: current.weightKg,
      heightCm: current.heightCm,
    }));
    setSavedDilutions(getSavedDilutions(key));
    setShowRefPanel(false);
    setShowAssocPanel(false);
  }, []);

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

  // ── Render ────────────────────────────────────────────────────────────────────

  const prepSteps: string[] = [];
  if (amps > 0 && dilMl > 0) {
    const mgTotal = totalBase / (drug.baseUnit === "U" ? 1 : 1000);
    const unitLabel = drug.baseUnit === "U" ? "U" : "mg";
    const containerLabel = formatContainerLabel(presentation.container, amps);
    prepSteps.push(
      `Adicionar ${amps} ${containerLabel} de ${drug.name} (${fmt(mgTotal, drug.baseUnit === "U" ? 0 : 1)} ${unitLabel}) em ${fmt(dilMl, 0)} mL de ${calc.diluent === "SF" ? "SF 0,9%" : "SG 5%"}`
    );
    prepSteps.push(`Volume final: ${fmt(finalVolMl, 0)} mL`);
    if (concPerMl > 0) {
      const concUnitLabel = drug.baseUnit === "U" ? "U/mL" : "mcg/mL";
      prepSteps.push(`Concentração: ${fmt(concPerMl, drug.baseUnit === "U" ? 3 : 2)} ${concUnitLabel}`);
    }
    if (rateMlH !== null && rateMlH > 0) {
      prepSteps.push(`Taxa na bomba: ${fmt(rateMlH, 1)} mL/h`);
    }
  }

  const assocList = ASSOCIATIONS[calc.selectedDrug] ?? [];
  const initialStrategy = buildInitialStrategy(calc.selectedDrug, referral);
  const navigationItems = DRUGS.map((item) => ({
    id: item.key,
    icon: item.emoji,
    label: item.name,
    hint: item.doseUnit === "mcg/min" ? "Dose fixa" : item.doseUnit,
    accent: "#1d4ed8",
  }));
  const heroMetrics = [
    { label: "Droga ativa", value: drug.name, accent: "#b91c1c" },
    { label: "Origem", value: referral.fromModule || "Cálculo direto", accent: "#0f766e" },
    { label: "Peso", value: initialWeight ? `${initialWeight} kg` : "Informar paciente", accent: initialWeight ? "#047857" : "#b45309" },
    { label: "Meta", value: "PAM ≥ 65 mmHg", accent: "#1d4ed8" },
  ];

  return (
    <View style={s.screen}>
      <ModuleFlowLayout
        hero={
          <ModuleFlowHero
            eyebrow="Drogas vasoativas"
            title="Cálculo organizado no padrão do app"
            subtitle="Mesma hierarquia visual dos protocolos: cabeçalho único, navegação lateral fixa e área de conteúdo consistente."
            badgeText={`v${guidelinesStatus.version}${badgeColor !== "green" ? " · revisar" : ""}`}
            metrics={heroMetrics}
            progressLabel="Calculadora vasoativa"
            stepTitle={drug.name}
            hint="Selecione a droga na lateral e revise diluição, dose, bomba e referências sem trocar de layout."
            compactMobile
          />
        }
        items={navigationItems}
        activeId={calc.selectedDrug}
        onSelect={(id) => selectDrug(id as DrugKey)}
        sidebarEyebrow="Navegação vasoativa"
        sidebarTitle="Drogas disponíveis"
        contentEyebrow="Calculadora"
        contentTitle={drug.name}
        contentHint={drug.doseUnit === "mcg/min" ? "Dose independente do peso" : `Titulação em ${drug.doseUnit}`}
        contentBadgeText="Cálculo clínico">
        <ModuleFlowContent style={s.mainScroll} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {referral.fromModule ? (
            <View style={s.referralCard}>
              <Text style={s.referralTitle}>Contexto encaminhado</Text>
              <Text style={s.referralLine}>Origem: {referral.fromModule}</Text>
              <Text style={s.referralLine}>Motivo: {referral.reason || "—"}</Text>
              <Text style={s.referralLine}>Droga sugerida: {initialDrug === "adrenalina" ? "Adrenalina" : "Noradrenalina"}</Text>
              <Text style={s.referralLine}>Peso: {initialWeight || "—"} kg</Text>
              <Text style={s.referralLine}>Altura: {initialHeight || "—"} cm</Text>
              <Text style={s.referralLine}>PA: {referral.pas || "—"}/{referral.pad || "—"} mmHg</Text>
              <Text style={s.referralLine}>FC: {referral.fc || "—"} bpm</Text>
              <Text style={s.referralLine}>SpO₂: {referral.spo2 || "—"}%</Text>
              <Text style={s.referralLine}>GCS: {referral.gcs || "—"}</Text>
              <Text style={s.referralLine}>Manifestações: {referral.symptoms || "—"}</Text>
            </View>
          ) : null}
          <View style={s.referralCard}>
            <Text style={s.referralTitle}>Estratégia inicial</Text>
            {initialStrategy.map((line) => (
              <Text key={line} style={s.referralLine}>• {line}</Text>
            ))}
          </View>

          {/* ── Patient weight ───────────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>PACIENTE</Text>
            <View style={s.selectorGrid}>
              <Pressable
                style={[s.selectorCard, calc.weightKg && s.selectorCardFilled]}
                onPress={() => {
                  setSelectionSheetMode("weight");
                  setSelectionSheetOtherValue(calc.weightKg);
                }}>
                <Text style={s.selectorLabel}>Peso (kg)</Text>
                <Text style={[s.selectorValue, !calc.weightKg && s.selectorPlaceholder]}>
                  {calc.weightKg || "Selecionar peso"}
                </Text>
              </Pressable>
              <Pressable
                style={[s.selectorCard, calc.heightCm && s.selectorCardFilled]}
                onPress={() => {
                  setSelectionSheetMode("height");
                  setSelectionSheetOtherValue(calc.heightCm);
                }}>
                <Text style={s.selectorLabel}>Altura (cm)</Text>
                <Text style={[s.selectorValue, !calc.heightCm && s.selectorPlaceholder]}>
                  {calc.heightCm || "Selecionar altura"}
                </Text>
              </Pressable>
            </View>
            {drug.doseUnit === "mcg/min" ? (
              <Text style={s.hint}>Dose de {drug.name} NÃO depende do peso</Text>
            ) : wt > 0 ? (
              <Text style={s.hint}>Paciente: {fmt(wt, 0)} kg</Text>
            ) : (
              <Text style={s.hintWarn}>⚠️ Informe o peso para calcular a dose em mcg/kg/min</Text>
            )}
            <Text style={s.hint}>
              Alvo hemodinâmico inicial habitual: PAM ≥ 65 mmHg, ajustando ao contexto clínico.
            </Text>
          </View>

          {/* ── Dilution ─────────────────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>DILUIÇÃO</Text>

            {/* Standard solutions */}
            {drug.standardSolutions && drug.standardSolutions.length > 0 && (
              <View style={s.dilSection}>
                <Text style={s.dilSectionLabel}>Diluições recomendadas</Text>
                <Pressable
                  style={[s.selectorCard, currentSolution && s.selectorCardFilled]}
                  onPress={() => {
                    setSelectionSheetMode("solution");
                    setSelectionSheetOtherValue("");
                  }}>
                  <Text style={s.selectorLabel}>Diluição pronta</Text>
                  <Text style={[s.selectorValue, !currentSolution && s.selectorPlaceholder]}>
                    {currentSolution?.label || "Selecionar diluição"}
                  </Text>
                  {currentSolution ? (
                    <Text style={s.selectorHint}>
                      {currentSolution.ampoules} amp · {currentSolution.diluentMl} mL {currentSolution.diluent}
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            )}

            {/* Saved custom dilutions */}
            <View style={s.dilSection}>
              <View style={s.userDilHeader}>
                <Text style={s.userDilTitle}>Diluições do usuário</Text>
                <Pressable onPress={() => setShowSaveModal(true)} style={s.saveDilBtn}>
                  <Text style={s.saveDilBtnTxt}>+ Salvar atual</Text>
                </Pressable>
              </View>
              {savedDilutions.length === 0 ? (
                <Text style={s.userDilEmpty}>Nenhuma diluição salva. Configure abaixo e toque em &quot;+ Salvar atual&quot;.</Text>
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
                <Text style={s.fieldLabel}>Ampolas</Text>
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
                <Text style={s.fieldLabel}>Diluente (mL)</Text>
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
                <Text style={s.fieldLabel}>Tipo</Text>
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
                  <Text style={s.concKey}>Ampolas</Text>
                  <Text style={s.concVal}>{amps} {amps === 1 ? "amp" : "amp"}</Text>
                </View>
                <View style={s.concDivider} />
                <View style={s.concCell}>
                  <Text style={s.concKey}>Diluente</Text>
                  <Text style={s.concVal}>{fmt(dilMl, 0)} mL</Text>
                </View>
                <View style={s.concDivider} />
                <View style={s.concCell}>
                  <Text style={s.concKey}>Vol. final</Text>
                  <Text style={s.concVal}>{fmt(finalVolMl, 0)} mL</Text>
                </View>
                <View style={s.concDivider} />
                <View style={s.concCell}>
                  <Text style={s.concKey}>Concentração</Text>
                  <Text style={[s.concVal, s.concValHighlight]}>
                    {fmt(concPerMl, drug.baseUnit === "U" ? 3 : 2)} {drug.baseUnit === "U" ? "U/mL" : "mcg/mL"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ── Calculator ───────────────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardLabel}>CALCULAR</Text>

            {/* Inline weight — only for weight-based drugs, shown when weight is missing */}
            {drug.doseUnit === "mcg/kg/min" && (
              <View style={s.calcWeightRow}>
                <Text style={[s.calcWeightLabel, wt <= 0 && s.calcWeightLabelWarn]}>
                  Peso (kg){wt <= 0 ? " — obrigatório" : ` = ${fmt(wt, 0)} kg`}
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
            <Text style={s.hint}>Altura: {heightCm ? `${fmt(heightCm, 0)} cm` : "—"}</Text>

            <View style={s.calcGrid}>
              {/* Dose column */}
              <View style={s.calcCol}>
                <Text style={s.calcColLabel}>DOSE</Text>
                <Pressable
                  onPress={() => setCalc((c) => ({ ...c, lastEdited: "dose" }))}
                  style={[s.calcInputRow, calc.lastEdited === "dose" && s.calcInputRowActive]}>
                  {calc.lastEdited === "dose" ? (
                    <TextInput
                      style={s.calcInput}
                      value={doseFieldValue}
                      onChangeText={(v) => setCalc((c) => ({ ...c, doseInput: v, lastEdited: "dose" }))}
                      onFocus={() => setCalc((c) => ({ ...c, lastEdited: "dose" }))}
                      keyboardType="decimal-pad"
                      placeholder="0,10"
                      placeholderTextColor="#94a3b8"
                    />
                  ) : (
                    <Text style={[s.calcInput, s.calcReadout, !doseFieldValue && s.calcReadoutEmpty]}>
                      {doseFieldValue || "—"}
                    </Text>
                  )}
                  <Text style={s.calcUnit}>{drug.doseUnit}</Text>
                </Pressable>
              </View>

              {/* Arrow */}
              <View style={s.calcArrow}>
                <Text style={s.calcArrowTxt}>⇄</Text>
              </View>

              {/* Rate column */}
              <View style={s.calcCol}>
                <Text style={s.calcColLabel}>TAXA</Text>
                <Pressable
                  onPress={() => setCalc((c) => ({ ...c, lastEdited: "rate" }))}
                  style={[s.calcInputRow, calc.lastEdited === "rate" && s.calcInputRowActive]}>
                  {calc.lastEdited === "rate" ? (
                    <TextInput
                      style={s.calcInput}
                      value={rateFieldValue}
                      onChangeText={(v) => setCalc((c) => ({ ...c, rateInput: v, lastEdited: "rate" }))}
                      onFocus={() => setCalc((c) => ({ ...c, lastEdited: "rate" }))}
                      keyboardType="decimal-pad"
                      placeholder="7,5"
                      placeholderTextColor="#94a3b8"
                    />
                  ) : (
                    <Text style={[s.calcInput, s.calcReadout, !rateFieldValue && s.calcReadoutEmpty]}>
                      {rateFieldValue || "—"}
                    </Text>
                  )}
                  <Text style={s.calcUnit}>mL/h</Text>
                </Pressable>
              </View>
            </View>

            {/* Warning: weight required but missing */}
            {drug.doseUnit === "mcg/kg/min" && wt <= 0 && (calc.doseInput || calc.rateInput) && (
              <View style={s.calcMissingWeight}>
                <Text style={s.calcMissingWeightTxt}>
                  ⚠️ Informe o peso do paciente acima para calcular a dose em mcg/kg/min.
                </Text>
              </View>
            )}

            {/* Dose alerts */}
            {exceptionalDoseAlert && (
              <View style={s.alertDanger}>
                <Text style={s.alertTxt}>
                  🔴 Dose excepcional ({">"}  3 mcg/kg/min) — limiar de relatos isolados em falência terapêutica. Eficiência muito reduzida. Estratégia multimodal obrigatória: vasopressina + hidrocortisona + avaliação de azul de metileno em contexto de vasoplegia refratária. Risco elevado de isquemia. Envolver equipe experiente.
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
              <View style={s.alertVasopressin}>
                <Text style={s.alertTxt}>{drug.vasopressinAlert!.message}</Text>
              </View>
            )}
          </View>

          {/* ── Preparo ──────────────────────────────────────────────────────── */}
          {prepSteps.length > 0 && (
            <View style={[s.card, s.prepCard]}>
              <Text style={s.cardLabel}>📋 PREPARO</Text>
              {prepSteps.map((step, i) => (
                <Text key={i} style={[s.prepStep, i === prepSteps.length - 1 && rateMlH !== null && s.prepStepRate]}>
                  {i + 1}. {step}
                </Text>
              ))}
              {presentation.notes && (
                <Text style={s.prepNote}>{presentation.notes}</Text>
              )}
            </View>
          )}

          {/* ── Reference (collapsible) ───────────────────────────────────────── */}
          <Pressable style={s.collapsible} onPress={() => setShowRefPanel((v) => !v)}>
            <Text style={s.collapseTitle}>ℹ️ Referência clínica</Text>
            <Text style={s.collapseChev}>{showRefPanel ? "▲" : "▼"}</Text>
          </Pressable>
          {showRefPanel && (
            <View style={s.collapseBody}>
              <View style={s.refRow}>
                <Text style={s.refKey}>Estratégia</Text>
                <Text style={s.refVal}>
                  {drug.key === "noradrenalina"
                    ? "Primeira linha na vasoplegia/choque séptico; adicionar vasopressina se PAM seguir baixa."
                    : drug.key === "adrenalina"
                      ? "Reservar para contextos específicos como anafilaxia refratária, choque com componente beta necessário ou protocolo local."
                      : "Usar conforme contexto hemodinâmico e protocolo local."}
                </Text>
              </View>
              <View style={s.refRow}>
                <Text style={s.refKey}>Acesso</Text>
                <Text style={s.refVal}>
                  Vasopressor periférico pode ser usado por curto período em veia proximal enquanto organiza acesso central, com vigilância frequente do sítio.
                </Text>
              </View>
              {drug.reference.usual && (
                <View style={s.refRow}>
                  <Text style={s.refKey}>Faixa usual</Text>
                  <Text style={s.refVal}>{drug.reference.usual}</Text>
                </View>
              )}
              {drug.reference.titration && (
                <View style={s.refRow}>
                  <Text style={s.refKey}>Titulação</Text>
                  <Text style={s.refVal}>{drug.reference.titration}</Text>
                </View>
              )}
              {drug.reference.max && (
                <View style={s.refRow}>
                  <Text style={s.refKey}>Dose máxima</Text>
                  <Text style={s.refVal}>{drug.reference.max}</Text>
                </View>
              )}
              {drug.reference.notes?.map((note, i) => (
                <View key={i} style={[s.refRow, s.refNote]}>
                  <Text style={s.refVal}>• {note}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Associations (collapsible) ────────────────────────────────────── */}
          {assocList.length > 0 && (
            <>
              <Pressable style={s.collapsible} onPress={() => setShowAssocPanel((v) => !v)}>
                <Text style={s.collapseTitle}>🔗 Associações indicadas</Text>
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
                      <Text style={s.assocDrug}>{a.drug}</Text>
                      <Text style={s.assocDose}>{a.dose}</Text>
                      <Text style={s.assocIndication}>{a.indication}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={{ height: 32 }} />
        </ModuleFlowContent>
      </ModuleFlowLayout>

      <PresetSelectionSheet
        visible={selectionSheetMode !== null}
        title={
          selectionSheetMode === "weight"
            ? "Peso (kg)"
            : selectionSheetMode === "height"
              ? "Altura (cm)"
              : "Diluições recomendadas"
        }
        subtitle={
          selectionSheetMode === "weight"
            ? "Selecionar peso"
            : selectionSheetMode === "height"
              ? "Selecionar altura"
              : "Selecionar diluição pronta"
        }
        currentValue={selectionSheetMode === "weight"
          ? calc.weightKg
          : selectionSheetMode === "height"
            ? calc.heightCm
            : selectionSheetMode === "solution"
              ? calc.presentationId
              : ""}
        options={sheetOptions}
        allowOther={selectionSheetMode === "weight" || selectionSheetMode === "height"}
        otherLabel={selectionSheetMode === "weight" ? "Outro peso" : "Outra altura"}
        otherValue={selectionSheetOtherValue}
        otherPlaceholder={selectionSheetMode === "weight" ? "Ex.: 72" : "Ex.: 170"}
        onClose={() => {
          setSelectionSheetMode(null);
          setSelectionSheetOtherValue("");
        }}
        onSelect={(value) => {
          if (selectionSheetMode === "weight") {
            setCalc((c) => ({ ...c, weightKg: value }));
          } else if (selectionSheetMode === "height") {
            setCalc((c) => ({ ...c, heightCm: value ? normalizeHeightCmInput(value) : "" }));
          } else if (selectionSheetMode === "solution") {
            const sol = drug.standardSolutions?.find((item) => item.id === value);
            setCalc((c) => ({
              ...c,
              presentationId: value,
              ampoules: sol?.ampoules ?? c.ampoules,
              diluentMl: sol?.diluentMl ?? c.diluentMl,
              diluent: (sol?.diluent as Diluent | undefined) ?? c.diluent,
              doseInput: "",
              rateInput: "",
              lastEdited: "dose",
            }));
          }
        }}
        onOtherValueChange={(value) => setSelectionSheetOtherValue(sanitizeNumericInput(value))}
        onOtherSubmit={() => {
          const value = selectionSheetOtherValue.trim();
          if (!value) return;
          if (selectionSheetMode === "weight") {
            setCalc((c) => ({ ...c, weightKg: value }));
          } else if (selectionSheetMode === "height") {
            setCalc((c) => ({ ...c, heightCm: normalizeHeightCmInput(value) }));
          }
          setSelectionSheetMode(null);
          setSelectionSheetOtherValue("");
        }}
      />

      {/* ── Save dilution modal ───────────────────────────────────────────── */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowSaveModal(false);
          setSaveLabel("");
        }}>
        <View style={s.modalOverlay}>
          <Pressable
            style={s.modalBackdrop}
            onPress={() => {
              setShowSaveModal(false);
              setSaveLabel("");
            }}
          />
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Salvar diluição</Text>
            <Text style={s.modalSub}>
              {amps} amp · {dilMl} mL {calc.diluent} · {fmt(concPerMl, drug.baseUnit === "U" ? 3 : 1)} {drug.baseUnit === "U" ? "U/mL" : "mcg/mL"}
            </Text>
            <TextInput
              style={s.modalInput}
              value={saveLabel}
              onChangeText={setSaveLabel}
              placeholder="Nome da diluição (ex: Protocolo UTI)"
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => { setShowSaveModal(false); setSaveLabel(""); }}>
                <Text style={s.modalCancelTxt}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.modalSave, !saveLabel.trim() && s.modalSaveDisabled]}
                onPress={handleSaveDilution}>
                <Text style={s.modalSaveTxt}>Salvar</Text>
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
  screen:           { flex: 1, backgroundColor: AppDesign.canvas.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: AppDesign.accent.lime,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 118, 110, 0.16)",
  },
  headerTitle: { flex: 1, color: AppDesign.text.primary, fontSize: 20, fontWeight: "800" },
  versionHint: { fontSize: 11, fontWeight: "700", color: AppDesign.accent.teal, maxWidth: "42%" },
  versionWarn: { color: "#a16207" },
  versionAlert: { color: "#b91c1c" },

  // Layout
  bodyWrap:         { flex: 1, alignItems: "center", paddingHorizontal: 12, paddingVertical: 14 },
  bodyWrapCompact:  { paddingHorizontal: 0, paddingBottom: 0 },
  body:             { flex: 1, flexDirection: "row", gap: 14, width: "100%", maxWidth: 1120, overflow: "visible", backgroundColor: "transparent" },
  bodyCompact:      { maxWidth: "100%", borderRadius: 0, gap: 10 },

  // Sidebar
  sidebar:          {
    width: 104,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    shadowColor: "#2b4a7a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  sidebarCompact:   { width: 74 },
  sidebarInner:     { paddingVertical: 12, paddingHorizontal: 8, gap: 8 },
  sideItem:         { alignItems: "center", paddingVertical: 12, paddingHorizontal: 6, borderRadius: 16, marginHorizontal: 0 },
  sideItemActive:   { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#a7f3d0" },
  sideEmoji:        { fontSize: 20 },
  sideName:         { fontSize: 9, fontWeight: "700", color: "#64748b", textAlign: "center", marginTop: 3, lineHeight: 12 },
  sideNameActive:   { color: AppDesign.accent.teal },

  // Main scroll
  mainScroll:       { flex: 1, minHeight: 0, backgroundColor: "transparent" },
  scroll:           { flexGrow: 1, padding: 16, gap: 14, paddingBottom: 28, width: "100%" },
  referralCard:     { backgroundColor: "#ffffff", borderRadius: 24, padding: 16, gap: 6, borderWidth: 1, borderColor: AppDesign.border.subtle, ...AppDesign.shadow.card },
  referralTitle:    { fontSize: 12, fontWeight: "800", color: AppDesign.accent.teal, textTransform: "uppercase", letterSpacing: 0.7 },
  referralLine:     { fontSize: 13, color: "#334155", lineHeight: 19 },
  card:             { backgroundColor: "#ffffff", borderRadius: 24, padding: 16, gap: 12, borderWidth: 1, borderColor: AppDesign.border.subtle,
                      ...AppDesign.shadow.card },
  cardLabel:        { fontSize: 10, fontWeight: "800", color: "#64748b", letterSpacing: 1 },
  cardHeaderRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  row:              { flexDirection: "row", alignItems: "center", gap: 12 },

  // Patient
  fieldLabel:       { fontSize: 12, fontWeight: "600", color: "#64748b", flex: 1 },
  input:            { flex: 1.5, borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, padding: 12,
                      fontSize: 16, fontWeight: "700", color: "#0f172a", backgroundColor: "#f8fafc" },
  selectorGrid:     { gap: 10 },
  selectorCard:     { borderRadius: 18, borderWidth: 1.5, borderColor: "#dbe5f0", backgroundColor: "#f8fafc", paddingHorizontal: 14, paddingVertical: 14, gap: 4 },
  selectorCardFilled:{ backgroundColor: AppDesign.accent.primaryMuted, borderColor: AppDesign.accent.primary },
  selectorLabel:    { fontSize: 12, fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6 },
  selectorValue:    { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  selectorPlaceholder:{ color: "#94a3b8" },
  selectorHint:     { fontSize: 12, fontWeight: "700", color: "#476769" },
  hint:             { fontSize: 11, color: "#94a3b8" },
  hintWarn:         { fontSize: 11, color: "#f59e0b", fontWeight: "600" },

  // Dilution sections
  dilSection:       { gap: 8 },
  dilSectionLabel:  { fontSize: 10, fontWeight: "800", color: "#475569", letterSpacing: 0.8, textTransform: "uppercase" },

  // User dilutions
  userDilHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userDilTitle:     { fontSize: 12, fontWeight: "800", color: "#7c3aed" },
  userDilEmpty:     { fontSize: 11, color: "#94a3b8", fontStyle: "italic", paddingVertical: 6 },
  userDilList:      { gap: 6 },
  userDilRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  userDilApply:     { flex: 1, backgroundColor: "#faf5ff", borderRadius: 12, padding: 12,
                      borderWidth: 1.5, borderColor: "#c4b5fd" },
  userDilName:      { fontSize: 13, fontWeight: "800", color: "#5b21b6" },
  userDilMeta:      { fontSize: 10, color: "#7c3aed", marginTop: 2 },
  userDilDel:       { padding: 8 },
  userDilDelTxt:    { color: "#ef4444", fontWeight: "700", fontSize: 14 },

  saveDilBtn:       { backgroundColor: "#f5f3ff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#c4b5fd" },
  saveDilBtnTxt:    { fontSize: 11, fontWeight: "800", color: "#7c3aed" },
  dilFields:        { flexDirection: "row", gap: 8 },
  dilField:         { flex: 1, gap: 4 },
  diluentSeg:       { flexDirection: "row", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, overflow: "hidden" },
  diluentOpt:       { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#f8fafc" },
  diluentOptActive: { backgroundColor: "#0f172a" },
  diluentOptTxt:    { fontSize: 13, fontWeight: "700", color: "#475569" },
  diluentOptTxtActive:{ color: "#ffffff" },
  concGrid:         { flexDirection: "row", backgroundColor: "#f0f9ff", borderRadius: 16, borderWidth: 1, borderColor: "#bae6fd", overflow: "hidden" },
  concCell:         { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4 },
  concDivider:      { width: 1, backgroundColor: "#bae6fd" },
  concKey:          { fontSize: 9, fontWeight: "700", color: "#0369a1", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 2 },
  concVal:          { fontSize: 13, fontWeight: "800", color: "#0369a1", textAlign: "center" },
  concValHighlight: { color: "#0c4a6e", fontSize: 13 },

  // Calculator
  calcWeightRow:       { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 12, paddingVertical: 8 },
  calcWeightLabel:     { flex: 1, fontSize: 12, fontWeight: "600", color: "#475569" },
  calcWeightLabelWarn: { color: "#d97706", fontWeight: "700" },
  calcWeightInput:     { width: 72, borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15, fontWeight: "700", color: "#0f172a", backgroundColor: "#ffffff", textAlign: "right" },
  calcWeightInputWarn: { borderColor: "#f59e0b", backgroundColor: "#fffbeb" },
  calcWeightUnit:      { fontSize: 12, fontWeight: "600", color: "#94a3b8", width: 22 },
  calcMissingWeight:   { backgroundColor: "#fffbeb", borderRadius: 8, borderWidth: 1, borderColor: "#fcd34d", padding: 10 },
  calcMissingWeightTxt:{ fontSize: 12, fontWeight: "600", color: "#92400e" },
  calcGrid:         { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  calcCol:          { flex: 1, gap: 6 },
  calcColLabel:     { fontSize: 10, fontWeight: "800", color: "#64748b", letterSpacing: 1, textAlign: "center" },
  calcInputRow:     { flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#e2e8f0", borderRadius: 16, overflow: "hidden", backgroundColor: "#f8fafc" },
  calcInputRowActive:{ borderColor: AppDesign.accent.primary, backgroundColor: AppDesign.accent.primaryMuted },
  calcInput:        { flex: 1, padding: 12, fontSize: 20, fontWeight: "800", color: "#0f172a", textAlign: "right" },
  calcReadout:      { textAlignVertical: "center", includeFontPadding: false as never },
  calcReadoutEmpty: { color: "#94a3b8" },
  calcUnit:         { fontSize: 10, fontWeight: "700", color: "#94a3b8", paddingRight: 8, paddingLeft: 2 },
  calcArrow:        { paddingBottom: 12, alignItems: "center" },
  calcArrowTxt:     { fontSize: 20, color: "#cbd5e1" },

  // Alerts
  alertDanger:      { backgroundColor: "#fef2f2", borderRadius: 16, padding: 12, borderWidth: 1.5, borderColor: "#ef4444" },
  alertWarn:        { backgroundColor: "#fffbeb", borderRadius: 16, padding: 12, borderWidth: 1.5, borderColor: "#f59e0b" },
  alertInfo:        { backgroundColor: "#eff6ff", borderRadius: 16, padding: 12, borderWidth: 1.5, borderColor: "#3b82f6" },
  alertVasopressin: { backgroundColor: "#fff7ed", borderRadius: 16, padding: 12, borderWidth: 1.5, borderColor: "#fb923c" },
  alertTxt:         { fontSize: 12, fontWeight: "600", color: "#374151", lineHeight: 18 },

  // Preparo
  prepCard:         { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", borderWidth: 1.5 },
  prepStep:         { fontSize: 13, color: "#374151", lineHeight: 20 },
  prepStepRate:     { fontWeight: "800", color: "#14532d", fontSize: 14 },
  prepNote:         { fontSize: 11, color: "#64748b", fontStyle: "italic", marginTop: 4 },

  // Collapsible
  collapsible:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      backgroundColor: "#ffffff", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: AppDesign.border.subtle,
                      ...AppDesign.shadow.card },
  collapseTitle:    { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  collapseChev:     { fontSize: 12, color: "#94a3b8" },
  collapseBody:     { backgroundColor: "#ffffff", borderRadius: 18, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16, gap: 10, marginTop: -6, borderWidth: 1, borderColor: AppDesign.border.subtle },
  refRow:           { gap: 2 },
  refNote:          { paddingLeft: 4 },
  refKey:           { fontSize: 10, fontWeight: "700", color: "#64748b", letterSpacing: 0.5 },
  refVal:           { fontSize: 12, color: "#334155", lineHeight: 18 },

  // Associations
  assocCard:        { backgroundColor: "#f8fafc", borderRadius: 16, padding: 12, gap: 2, borderWidth: 1, borderColor: "#e2e8f0" },
  assocWarn:        { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  assocAlert:       { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  assocDrug:        { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  assocDose:        { fontSize: 12, fontWeight: "700", color: "#1d4ed8" },
  assocIndication:  { fontSize: 11, color: "#64748b", lineHeight: 16 },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBackdrop:    { ...StyleSheet.absoluteFillObject },
  modalCard:        { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle:       { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  modalSub:         { fontSize: 12, color: "#64748b" },
  modalInput:       { borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, fontSize: 15, color: "#0f172a" },
  modalBtns:        { flexDirection: "row", gap: 10 },
  modalCancel:      { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#f1f5f9" },
  modalCancelTxt:   { fontWeight: "700", color: "#475569" },
  modalSave:        { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#0f172a" },
  modalSaveDisabled:{ backgroundColor: "#94a3b8" },
  modalSaveTxt:     { fontWeight: "700", color: "#ffffff" },
});
