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
  useWindowDimensions,
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
  preparoDaSolucao,
  preparoInicial,
  mesmoPreparo,
  type Drug,
  type DrugKey,
  type Diluent,
  type Preparo,
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
import { CalculatorScreenHeader } from "../ui-v2/calculator-screen-header";
import { CALCULATOR_VISUAL as CV } from "../ui-v2/calculator-visual-tokens";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";
import { RailDeModulo } from "./module-flow-shell";
import { TEMAS } from "../../design-system/tokens";
import { FAIXA_DE_ENTRADA } from "../../lib/faixas-de-entrada";

import { DOBUTAMINA_ATE_20, DOBUTAMINA_FAIXA_USUAL, DOBUTAMINA_INICIO } from "../../lib/dobutamina";
// ─── Drug associations ─────────────────────────────────────────────────────────

type Association = {
  drug: string;
  dose: string;
  indication: string;
  tone: "info" | "warning" | "alert";
};

const ASSOCIATIONS: Record<DrugKey, Association[]> = {
  noradrenalina: [
    { drug: "Vasopressina", dose: "0,03 U/min (dose fixa, não titular)", indication: "A partir de Nora ≥ 0,25 mcg/kg/min (faixa usual de início 0,25–0,5) — associar em vez de escalar. SSC 2021: recomendação fraca", tone: "warning" },
    { drug: "Hidrocortisona", dose: "200 mg/dia IV (50 mg 6/6 h ou contínuo)", indication: "Nora ≥ 0,25 mcg/kg/min há PELO MENOS 4 h (SSC 2021: recomendação fraca)", tone: "warning" },
    { drug: "Dobutamina", dose: "2,5–10 mcg/kg/min (início 2,5; até 20 se necessário)", indication: "Se disfunção sistólica do VE coexistir (eco point-of-care)", tone: "info" },
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
    { drug: "Dobutamina", dose: "2,5–10 mcg/kg/min (início 2,5; até 20 se necessário)", indication: "Choque cardiogênico refratário — combinação possível mas aumenta risco de arritmia", tone: "warning" },
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

/**
 * O estado da tela CONTÉM um preparo — não o reimplementa.
 *
 * Declarar `ampoules`/`diluentMl`/`diluent`/`presentationId` aqui de novo era
 * o convite para alguém preencher três deles e esquecer o quarto, que é o
 * defeito da dopamina em forma de tipo. Estendendo `Preparo`, o compilador
 * passa a exigir os quatro juntos.
 */
type CalcState = Preparo & {
  selectedDrug: DrugKey;
  weightKg: string;
  doseInput: string;
  rateInput: string;
  lastEdited: "dose" | "rate";
};

function initialState(drugKey: DrugKey = "noradrenalina"): CalcState {
  const drug = drugByKey(drugKey);
  return {
    selectedDrug: drugKey,
    weightKg: "",
    ...preparoInicial(drug),
    doseInput: "",
    rateInput: "",
    lastEdited: "dose",
  };
}

export default function VasoactiveCalculatorScreen({ onVoltar }: { onVoltar?: () => void }) {
  const { width: larguraDaTela } = useWindowDimensions();
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
      ...preparoDaSolucao(sol),
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

  /**
   * O atalho está ativo se o preparo na tela é o preparo dele — INTEIRO.
   *
   * Comparar só ampolas e diluente foi o que deixou o defeito da dopamina
   * invisível: o atalho aparecia marcado enquanto a conta rodava com outra
   * apresentação. Um atalho aceso é uma afirmação sobre o que está na bolsa.
   */
  const isActiveSolution = (solutionId: string) => {
    const sol = drug.standardSolutions?.find((s) => s.id === solutionId);
    if (!sol) return false;
    return mesmoPreparo(preparoDaSolucao(sol), calc);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  /**
   * O portão era `amps > 0 && dilMl > 0`, e com 0 mL de diluente a tela
   * escondia concentração e preparo — mas seguia exibindo a TAXA. Droga pura em
   * bomba é preparo legítimo (Sedoanalgesia tem soluções "Puro"); o defeito
   * nunca foi permitir 0 mL, foi mostrar a taxa sem os números que a explicam.
   * Agora basta haver ampola: se há taxa na tela, o preparo está junto dela.
   */
  const prepSteps: string[] = [];
  if (amps > 0) {
    const mgTotal = totalBase / (drug.baseUnit === "U" ? 1 : 1000);
    const unitLabel = drug.baseUnit === "U" ? "U" : "mg";
    prepSteps.push(trf(tr, "Retirar {0} ampola{1} de {2} ({3} {4})", [amps, amps > 1 ? "s" : "", drug.name, fmt(mgTotal, drug.baseUnit === "U" ? 0 : 1), unitLabel]));
    // Com 0 mL de diluente o passo viraria "Adicionar 0 mL de SG 5%" — instrução
    // para não fazer nada, escrita como se fosse etapa. Droga pura se declara,
    // não se dilui em zero.
    if (dilMl > 0) {
      prepSteps.push(trf(tr, "Adicionar {0} mL de {1}", [fmt(dilMl, 0), tr(calc.diluent === "SF" ? "SF 0,9%" : "SG 5%")]));
    } else {
      prepSteps.push(tr("SEM diluição — droga pura na bomba"));
    }
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
      {/* ⚠️ CABEÇALHO ÚNICO E COM SAÍDA — a rota não desenha mais cromado (I7).
          O comentário que estava aqui dizia "voltar aos módulos fica na faixa do
          ecrã modulos/[id]" — era a dependência exata que a inversão removeu, e
          sem esta linha a tela ficaria sem caminho de volta ao hub. */}
      <CalculatorScreenHeader
        title={tr("💊 Drogas Vasoativas")}
        onBack={onVoltar}
        right={
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
        }
      />

      {/* ── Body: sidebar + content ─────────────────────────────────────────── */}
      <View style={[s.body, larguraDaTela >= 920 && s.bodyLateral]}>
        {/* ── Sidebar ── */}
        {/* ⚠️ RAIL COMUM — antes eram 86 px fixos com rótulos de 9 px em
            #aab6c6 sobre #1e6fd9: 2,36:1, o "rail apagado" relatado pelo autor.
            E o `adjustsFontSizeToFit` que encolhia "Levosimendan" para caber era
            a confissão de que 86 px já eram apertados demais.

            O emoji vai pelo campo `icon`, a MESMA rota do glifo do íon nos
            Eletrólitos — sem rota nova. */}
        <RailDeModulo
          items={DRUGS.map((d) => ({
            id: d.key,
            // O emoji vai NO CÍRCULO (campo `simbolo`), não ao lado do nome:
            // "No"/"Ad" no círculo não identifica fármaco nenhum, e o emoji já
            // era o identificador visual desta lista.
            simbolo: d.emoji,
            label: d.name,
            accent: TEMAS.escuro.cores.primary,
          }))}
          activeId={calc.selectedDrug}
          onSelect={(id) => selectDrug(id as DrugKey)}
          eyebrow="Fármacos"
          titulo="Vasoativos e inotrópicos"
        />

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
                style={s.modalInput}
                value={calc.weightKg}
                onChangeText={(texto) => setCalc((c) => ({ ...c, weightKg: texto }))}
                keyboardType="numeric"
                placeholder={tr("Informe o peso")}
                placeholderTextColor="#94a3b8"
                accessibilityLabel={tr("Peso em quilogramas")}
              />
              {wt > 0 ? (
                <NumericStepper
                  valor={wt}
                  onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}
                  min={FAIXA_DE_ENTRADA.peso.min}
                  max={FAIXA_DE_ENTRADA.peso.max}
                  passo={FAIXA_DE_ENTRADA.peso.passo}
                  unidade="kg"
                  testID="slider-peso"
                />
              ) : null}
            </View>
            {/* A condição era `=== "mcg/min"`, o que cobria SÓ a nitroglicerina.
                A vasopressina é U/min — caía no ramo de baixo e a tela exibia
                "Paciente: 70 kg" logo acima do cálculo, sugerindo que o peso
                entrava na conta de uma dose que é FIXA. Agora a pergunta é a
                certa: a dose depende do peso, ou não? */}
            {drug.doseUnit !== "mcg/kg/min" ? (
              <Text style={s.hint}>
                {trf(tr, "Dose de {0} NÃO depende do peso", [drug.name])}
                {drug.doseUnit === "U/min" ? tr(" — é dose FIXA, não titular") : ""}
              </Text>
            ) : wt > 0 ? (
              <Text style={s.hint}>Paciente: {fmt(wt, 0)} kg</Text>
            ) : (
              <Text style={s.hintWarn}>{tr("⚠️ Informe o peso para calcular esta dose.")}</Text>
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
                <HorizontalChoiceSelector
                  value={drug.standardSolutions.find((sol) => isActiveSolution(sol.id))?.id}
                  options={drug.standardSolutions.map((sol) => ({ value: sol.id, label: tr(sol.label) }))}
                  onChange={applySolution}
                  accessibilityLabel={tr("Diluições recomendadas")}
                  testID="vasoativos-diluicoes"
                />
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
                <NumericStepper
                  valor={Number(calc.ampoules.replace(",", ".")) || 1}
                  onChange={(n) =>
                    setCalc((c) => ({ ...c, ampoules: String(n), doseInput: "", rateInput: "" }))
                  }
                  min={1}
                  max={20}
                  passo={1}
                  testID="slider-ampolas"
                />
              </View>
              <View style={s.dilField}>
                <Text style={s.fieldLabel}>{tr("Diluente (mL)")}</Text>
                <NumericStepper
                  valor={Number(calc.diluentMl.replace(",", ".")) || 250}
                  onChange={(n) =>
                    setCalc((c) => ({ ...c, diluentMl: String(n), doseInput: "", rateInput: "" }))
                  }
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
                  testID="vasoativos-diluente"
                />
              </View>
            </View>

            {/* Concentration summary */}
            {amps > 0 && (
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

            {/* O peso era pedido DUAS vezes: aqui e no card PACIENTE, no topo
                da mesma tela, gravando no mesmo campo. É a redundância que o
                usuário já apontou em outro módulo — "em cima já tem a
                informação e aqui embaixo pergunta de novo".
                Agora esta linha só CONFIRMA o que foi informado lá em cima, ou
                aponta para lá quando falta. */}
            {drug.doseUnit === "mcg/kg/min" && (
              <View style={s.calcWeightRow}>
                <Text style={[s.calcWeightLabel, wt <= 0 && s.calcWeightLabelWarn]}>
                  {wt > 0
                    ? `${tr("Peso")}: ${fmt(wt, 0)} kg`
                    : tr("Informe o peso no início da tela — a dose por kg depende dele")}
                </Text>
              </View>
            )}

            <View style={s.calcGrid}>
              {/* Dose column */}
              <View style={s.calcCol}>
                <Text style={s.calcColLabel}>{tr("DOSE")}</Text>
                <View style={[s.calcInputRow, calc.lastEdited === "dose" && s.calcInputRowActive]}>
                  <NumericStepper
                    valor={
                      Number(
                        (calc.lastEdited === "dose" ? calc.doseInput : displayDose).replace(",", ".")
                      ) || drug.faixaDeDose.min
                    }
                    onChange={(n) =>
                      setCalc((c) => ({
                        ...c,
                        doseInput: String(n).replace(".", ","),
                        lastEdited: "dose",
                      }))
                    }
                    min={drug.faixaDeDose.min}
                    max={drug.faixaDeDose.max}
                    passo={drug.faixaDeDose.passo}
                    unidade={drug.doseUnit}
                    testID="slider-dose"
                  />
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
                  <NumericStepper
                    valor={
                      Number(
                        (calc.lastEdited === "rate" ? calc.rateInput : displayRate).replace(",", ".")
                      ) || 0
                    }
                    onChange={(n) =>
                      setCalc((c) => ({
                        ...c,
                        rateInput: String(n).replace(".", ","),
                        lastEdited: "rate",
                      }))
                    }
                    min={0}
                    max={400}
                    passo={0.5}
                    unidade="mL/h"
                    testID="slider-taxa"
                  />
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

            {/* A vasopressina é o único vasopressor do módulo cuja dose NÃO se
                titula. Isso vivia só no painel de referência, recolhido — e
                painel fechado não avisa ninguém no momento em que a barra está
                sendo arrastada. */}
            {drug.doseUnit === "U/min" && (
              <View style={s.alertWarn}>
                <Text style={s.alertTxt}>
                  {tr("⚠️ Dose FIXA — não titular. A vasopressina é adjuvante para poupar noradrenalina, não vasopressor principal: 0,03 U/min no choque séptico (SSC 2021) e mantida até o desmame. A barra existe para conferir a taxa da bomba, não para escalar a dose.")}
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
            {/* LARANJA, não azul.
                Este aviso vinha em `alertInfo` — o mesmo azul das notas de
                rodapé —, e o que ele pede é uma DECISÃO: associar um segundo
                vasopressor. Lido como nota, passa batido justamente no momento
                em que a conduta muda.
                O vermelho fica reservado à dose excepcional (> 3 mcg/kg/min);
                se tudo virar vermelho, nada é vermelho. */}
            {!highDoseAlert && vasopressinAlert && (
              <View style={s.alertWarn}>
                {/* O ⚠️ vem do JSX, não do texto: o marcador é da FAIXA de
                    alerta, e prendê-lo à frase obrigaria a retraduzir a
                    mensagem inteira só para mudar um ícone. */}
                <Text style={s.alertTxt}>⚠️ {drug.vasopressinAlert!.message}</Text>
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
            <View style={[s.collapseCta, showRefPanel && s.collapseCtaOpen]}>
              <Text style={[s.collapseCtaText, showRefPanel && s.collapseCtaTextOpen]}>{showRefPanel ? tr("FECHAR") : tr("ABRIR")}</Text>
              <Text style={[s.collapseCtaArrow, showRefPanel && s.collapseCtaTextOpen]}>{showRefPanel ? "▲" : "▼"}</Text>
            </View>
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
                <View style={[s.collapseCta, showAssocPanel && s.collapseCtaOpen]}>
                  <Text style={[s.collapseCtaText, showAssocPanel && s.collapseCtaTextOpen]}>{showAssocPanel ? tr("FECHAR") : tr("ABRIR")}</Text>
                  <Text style={[s.collapseCtaArrow, showAssocPanel && s.collapseCtaTextOpen]}>{showAssocPanel ? "▲" : "▼"}</Text>
                </View>
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
  screen:           { flex: 1, backgroundColor: CV.cores.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: CV.cores.bg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: { flex: 1, color: CV.cores.text, fontSize: CV.tipo.body.fontSize, fontWeight: "800" },
  versionHint: { fontSize: CV.tipo.micro.fontSize, fontWeight: "600", color: "rgba(241,245,249,0.55)", maxWidth: "42%" },
  versionWarn: { color: "rgba(254,243,199,0.95)" },
  versionAlert: { color: "rgba(254,202,202,0.95)" },

  // Layout
  // Em tela estreita o rail vira tira no topo, então o corpo empilha; a partir
  // de 920 px o RailDeModulo volta a ser lateral e a linha faz sentido.
  body:             { flex: 1 },
  bodyLateral:      { flexDirection: "row" },

  // Sidebar

  // Main scroll
  mainScroll:       { flex: 1, backgroundColor: CV.cores.surface },
  scroll:           { padding: 14, gap: 12, paddingBottom: 28 },
  referralCard:     { backgroundColor: CV.cores.surface, borderRadius: CV.raio.card, padding: 14, gap: 4, borderWidth: 1, borderColor: CV.cores.border },
  referralTitle:    { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary, textTransform: "uppercase", letterSpacing: 0.7 },
  referralLine:     { fontSize: CV.tipo.label.fontSize, color: CV.cores.textSecondary, lineHeight: 18 },
  card:             { backgroundColor: CV.cores.surface, borderRadius: CV.raio.card, padding: 14, gap: 10,
                      shadowColor: CV.sombra.shadowColor, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardLabel:        { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.textSecondary, letterSpacing: 1 },
  cardHeaderRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  // A barra precisa de largura para ser arrastável. Estes contêineres foram
  // desenhados para caixas de digitação estreitas lado a lado; com a barra
  // dentro, ela ficava espremida num canto e o alvo de toque virava um risco.
  // Empilhar é o certo aqui: rótulo em cima, barra ocupando a linha inteira.
  row:              { gap: 8 },

  // Patient
  fieldLabel:       { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.textSecondary, flex: 1 },
  input:            { flex: 1.5, borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.input, padding: 10,
                      fontSize: CV.tipo.body.fontSize, fontWeight: "700", color: CV.cores.text, backgroundColor: CV.cores.surface },
  hint:             { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary },
  // Token `warning` do tema: 6,43:1 sobre o card. O #f59e0b anterior dava
  // 3,37:1 — e este texto é o que avisa que a dose por kg depende de um peso
  // que ninguém confirmou.
  hintWarn:         { fontSize: CV.tipo.micro.fontSize, color: CV.cores.warning, fontWeight: "600" },

  // Dilution sections
  dilSection:       { gap: 8 },
  dilSectionLabel:  { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.textSecondary, letterSpacing: 0.8, textTransform: "uppercase" },

  // Recommended solutions
  solRow:           { gap: 8, paddingVertical: 2 },
  solChip:          { paddingHorizontal: 12, paddingVertical: 8, borderRadius: CV.raio.input,
                      backgroundColor: CV.cores.surface, borderWidth: 1.5, borderColor: CV.cores.border , minHeight: 44, justifyContent: "center" },
  solChipActive:    { backgroundColor: CV.cores.surface, borderColor: CV.cores.primary },
  solChipTxt:       { fontSize: CV.tipo.micro.fontSize, fontWeight: "600", color: CV.cores.textSecondary },
  solChipTxtActive: { color: CV.cores.primary, fontWeight: "800" },

  // User dilutions
  userDilHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userDilTitle:     { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary },
  userDilEmpty:     { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary, fontStyle: "italic", paddingVertical: 6 },
  userDilList:      { gap: 6 },
  userDilRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  userDilApply:     { flex: 1, backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, padding: 10,
                      borderWidth: 1.5, borderColor: CV.cores.primary },
  userDilName:      { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary },
  userDilMeta:      { fontSize: CV.tipo.micro.fontSize, color: CV.cores.primary, marginTop: 2 },
  userDilDel:       { padding: 8 },
  userDilDelTxt:    { color: CV.cores.critical, fontWeight: "700", fontSize: 14 },

  saveDilBtn:       { backgroundColor: CV.cores.surface, borderRadius: CV.raio.botao, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: CV.cores.primary , minHeight: 44, justifyContent: "center" },
  saveDilBtnTxt:    { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.primary },
  dilFields:        { gap: 14 },
  dilField:         { gap: 6 },
  diluentSeg:       { flexDirection: "row", borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.input, overflow: "hidden" , minHeight: 44, justifyContent: "center" },
  diluentOpt:       { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: CV.cores.surface , minHeight: 44, justifyContent: "center" },
  diluentOptActive: { backgroundColor: CV.cores.surface },
  diluentOptTxt:    { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.textSecondary },
  diluentOptTxtActive:{ color: CV.cores.text },
  concGrid:         { flexDirection: "row", backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, borderWidth: 1, borderColor: CV.cores.border, overflow: "hidden" },
  concCell:         { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4 },
  concDivider:      { width: 1, backgroundColor: CV.cores.border },
  concKey:          { fontSize: CV.tipo.micro.fontSize, fontWeight: "700", color: CV.cores.primary, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 2 },
  concVal:          { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary, textAlign: "center" },
  concValHighlight: { color: CV.cores.text, fontSize: 13 },

  // Calculator
  calcWeightRow:       { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, borderWidth: 1, borderColor: CV.cores.border, paddingHorizontal: 12, paddingVertical: 8 },
  calcWeightLabel:     { flex: 1, fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.textSecondary },
  // Token `warning`: 6,43:1. O #d97706 dava 3,37:1 — e esta linha avisa que a
  // dose por kg depende de um peso que ninguém informou.
  calcWeightLabelWarn: { color: CV.cores.warning, fontWeight: "700" },
  calcWeightInput:     { width: 72, borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.botao, paddingHorizontal: 10, paddingVertical: 6, fontSize: CV.tipo.body.fontSize, fontWeight: "700", color: CV.cores.text, backgroundColor: CV.cores.surface, textAlign: "right" },
  calcWeightInputWarn: { borderColor: CV.cores.warning, backgroundColor: CV.cores.surface },
  calcWeightUnit:      { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.textSecondary, width: 22 },
  calcMissingWeight:   { backgroundColor: CV.cores.surface, borderRadius: CV.raio.botao, borderWidth: 1, borderColor: "#fcd34d", padding: 10 },
  calcMissingWeightTxt:{ fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.warning },
  calcGrid:         { gap: 14 },
  calcCol:          { gap: 6 },
  calcColLabel:     { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.textSecondary, letterSpacing: 1, textAlign: "center" },
  // Empilhado: o stepper dentro de uma linha ficava com 0 a 40 px de trilha.
  calcInputRow:     { alignItems: "stretch", borderWidth: 2, borderColor: CV.cores.border, borderRadius: CV.raio.input, overflow: "hidden", backgroundColor: CV.cores.surface, padding: 8, gap: 4 },
  calcInputRowActive:{ borderColor: CV.cores.primary, backgroundColor: CV.cores.surface },
  calcInput:        { flex: 1, padding: 12, fontSize: CV.tipo.section.fontSize, fontWeight: "800", color: CV.cores.text, textAlign: "right" },
  calcUnit:         { fontSize: CV.tipo.micro.fontSize, fontWeight: "700", color: CV.cores.textSecondary, paddingRight: 8, paddingLeft: 2 },
  calcArrow:        { paddingBottom: 12, alignItems: "center" },
  calcArrowTxt:     { fontSize: CV.tipo.section.fontSize, color: CV.cores.text },

  // Alerts
  alertDanger:      { backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, padding: 12, borderWidth: 1.5, borderColor: CV.cores.critical },
  // Fundo QUENTE, não o cinza neutro dos blocos comuns. Só a borda laranja
  // deixava o aviso com o mesmo peso visual de uma nota — e os dois avisos que
  // usam este estilo (associar vasopressina, dose > 1 mcg/kg/min) marcam pontos
  // em que a conduta muda. O vermelho segue exclusivo da dose excepcional.
  alertWarn:        { backgroundColor: "#3a2a0f", borderRadius: CV.raio.input, padding: 12, borderWidth: 1.5, borderColor: CV.cores.warning },
  alertInfo:        { backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, padding: 12, borderWidth: 1.5, borderColor: "#3b82f6" },
  alertTxt:         { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.text, lineHeight: 18 },

  // Preparo
  prepCard:         { backgroundColor: "#1a2e1a", borderColor: "#4ade80", borderWidth: 1.5 },
  prepStep:         { fontSize: CV.tipo.label.fontSize, color: CV.cores.text, lineHeight: 20 },
  prepStepRate:     { fontWeight: "800", color: CV.cores.success, fontSize: 14 },
  prepNote:         { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary, fontStyle: "italic", marginTop: 4 },

  // Collapsible
  collapsible:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, paddingHorizontal: 16, paddingVertical: 14,
                      shadowColor: CV.sombra.shadowColor, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  collapseTitle:    { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.text },
  collapseCta:      { minWidth: 78, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, borderRadius: CV.raio.botao, backgroundColor: CV.cores.primary, borderWidth: 1, borderColor: CV.cores.primary },
  collapseCtaOpen:  { backgroundColor: "transparent" },
  collapseCtaText:  { fontSize: CV.tipo.micro.fontSize, fontWeight: "900", color: "#1d2939", letterSpacing: 0.45 },
  collapseCtaTextOpen:{ color: CV.cores.primary },
  collapseCtaArrow: { fontSize: CV.tipo.micro.fontSize, fontWeight: "900", color: "#1d2939" },
  collapseBody:     { backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 10, marginTop: -6 },
  refRow:           { gap: 2 },
  refNote:          { paddingLeft: 4 },
  refKey:           { fontSize: CV.tipo.micro.fontSize, fontWeight: "700", color: CV.cores.textSecondary, letterSpacing: 0.5 },
  refVal:           { fontSize: CV.tipo.label.fontSize, color: CV.cores.textSecondary, lineHeight: 18 },

  // Associations
  assocCard:        { backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, padding: 12, gap: 2, borderWidth: 1, borderColor: CV.cores.border },
  assocWarn:        { backgroundColor: CV.cores.surface, borderColor: CV.cores.warning },
  assocAlert:       { backgroundColor: CV.cores.surface, borderColor: CV.cores.critical },
  assocDrug:        { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.text },
  assocDose:        { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.primary },
  assocIndication:  { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary, lineHeight: 16 },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard:        { backgroundColor: CV.cores.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle:       { fontSize: CV.tipo.section.fontSize, fontWeight: "800", color: CV.cores.text },
  modalSub:         { fontSize: CV.tipo.label.fontSize, color: CV.cores.textSecondary },
  modalInput:       { borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.input, padding: 14, fontSize: CV.tipo.body.fontSize, color: CV.cores.text },
  modalBtns:        { flexDirection: "row", gap: 10 },
  modalCancel:      { flex: 1, padding: 14, borderRadius: CV.raio.input, alignItems: "center", backgroundColor: CV.cores.surface },
  modalCancelTxt:   { fontWeight: "700", color: CV.cores.textSecondary },
  modalSave:        { flex: 1, padding: 14, borderRadius: CV.raio.input, alignItems: "center", backgroundColor: "#1e6fd9" },
  modalSaveDisabled:{ backgroundColor: CV.cores.textSecondary },
  modalSaveTxt:     { fontWeight: "700", color: CV.cores.text },
});
