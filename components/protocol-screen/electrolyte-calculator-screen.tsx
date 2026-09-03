import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { MAGNESIO_TORSADES_COM_PULSO } from "../../lib/magnesio-torsades";
import {
  AGUARDANDO_VALOR,
  APOIAM_SINTOMATICO,
  CONTEXTO_NAO_SEI,
  CONTEXTO_OPCOES,
  CONTEXTO_PERGUNTA,
  type ContextoClinico,
  corteDoDegrau,
  degrauDeGravidade,
  textoDaReferencia,
  GRAVIDADE_POR_DISTURBIO,
  EXIGEM_COMPATIBILIDADE,
  IONIZADO_NOTAS,
  NUCLEO_SINTOMATICO,
  SINTOMATICO_CONDICAO,
  SINTOMATICO_PERGUNTA,
} from "../../lib/eletrolitos/gravidade";
// ⚠️ QUAL CÁLCIO — a tela usava DOIS (bruto para gravidade, ajustado para dose).
import { rotuloComUnidade, type UnidadeDeCampo } from "../../lib/eletrolitos/unidade-de-campo";
import {
  CALCIO_ONDE_ACHAR,
  CALCIO_OPCOES,
  CALCIO_PERGUNTA,
  calcioParaClassificar,
  type TipoDeCalcio,
} from "../../lib/eletrolitos/calcio";
// ⚠️ O NÚMERO VEM DO DADO, A FRASE É MOLDURA (R-107). Enquanto `154 mEq/L` e
// `8–10 mEq/L em 24 h` moravam dentro da frase traduzível, cada um tinha uma
// segunda cópia em espanhol, escrita noutro momento, sem nada entre as duas.
import {
  CLORETO_10_CALCIO,
  D5W_AGUA_LIVRE,
  GLUCONATO_10_CALCIO,
  LIMITE_CORRECAO_24H,
  LIMITE_CORRECAO_HORA,
  MEIO_A_MEIO_SODIO,
  NACL_09_CLORETO,
  NACL_09_SODIO,
  NACL_20_SODIO,
  numero as numeroDaRef,
  RAZAO_CLORETO_GLUCONATO,
  RESSUSCITACAO_CRISTALOIDE,
  texto as textoDaRef,
  UREIA_ORAL_SIADH,
  VELOCIDADE_HIPOVOLEMICO,
} from "../../lib/eletrolitos/referencias";
// ⚠️ LIMIARES E DOSES DA HIPERCALEMIA POR IMPORTAÇÃO, NÃO POR LITERAL.
// Saíram desta tela para `lib/hipercalemia.ts` quando o módulo renal passou a
// precisar dos mesmos números. Os valores não mudaram — a fonte é que passou a
// ser única, para que as duas telas não possam divergir.
import {
  gravidadeDeHipercalemia,
  HIPERCALEMIA_DESLOCAR_BETA2,
  HIPERCALEMIA_DESLOCAR_INSULINA,
  HIPERCALEMIA_GLICOSE_PADRAO,
  HIPERCALEMIA_JANELA_HIPOGLICEMIA,
  HIPERCALEMIA_JANELA_PORQUE,
  K_GRAVE,
} from "../../lib/hipercalemia";

import { getAppGuidelinesStatus, getModuleGuidelinesStatus } from "../../lib/guidelines-version";
import { ModuleFlowContent, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";
import { useTr } from "../../lib/use-tr";
import { trf } from "../../lib/i18n/trf";
import { CalculatorScreenHeader } from "../ui-v2/calculator-screen-header";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import {
  FAIXA_DE_ENTRADA,
  faixaPorUnidadeDe,
  type FaixaDeEntrada,
} from "../../lib/faixas-de-entrada";

type Sex = "male" | "female";
type Access = "peripheral" | "central";
type PhosphateSalt = "potassium" | "sodium";
type ElectrolyteKey = "sodium" | "potassium" | "calcium" | "magnesium" | "phosphate" | "chloride";
type ElectrolyteUnit = "mEq/L" | "mmol/L" | "mg/dL";
type DisorderKey =
  | "hyponatremia"
  | "hypernatremia"
  | "hypokalemia"
  | "hyperkalemia"
  | "hypocalcemia"
  | "hypercalcemia"
  | "hypomagnesemia"
  | "hypermagnesemia"
  | "hypophosphatemia"
  | "hyperphosphatemia"
  | "hypochloremia"
  | "hyperchloremia";

type ResultBlock = {
  title: string;
  tone?: "info" | "warning" | "danger";
  lines: string[];
};

type Metric = {
  label: string;
  value: string;
};

type CalcResult = {
  headline: string;
  metrics: Metric[];
  alerts: ResultBlock[];
  strategy: ResultBlock[];
  practical: ResultBlock[];
  summary: ResultBlock[];
};

type PickerFieldId =
  | "weightKg"
  | "current"
  | "glucose"
  | "albumin"
  | "bagVolumeMl"
  | "infusionHours"
  | "magnesiumCurrent"
  | "potassiumCurrent"
  | "bicarbonate";

const ELECTROLYTES: {
  key: ElectrolyteKey;
  label: string;
  short: string;
  icon: string;
  glyph: string;
  accent: string;
  soft: string;
  border: string;
  hypo: DisorderKey;
  hyper: DisorderKey;
}[] = [
  {
    key: "sodium",
    label: "Sódio",
    short: "Na+",
    icon: "Na",
    glyph: "🧂",
    accent: "#2563eb",
    soft: "#eef4ff",
    border: "#bfdbfe",
    hypo: "hyponatremia",
    hyper: "hypernatremia",
  },
  {
    key: "potassium",
    label: "Potássio",
    short: "K+",
    icon: "K",
    glyph: "⚡",
    accent: "#7c3aed",
    soft: "#f3e8ff",
    border: "#d8b4fe",
    hypo: "hypokalemia",
    hyper: "hyperkalemia",
  },
  {
    key: "calcium",
    label: "Cálcio",
    short: "Ca",
    icon: "Ca",
    glyph: "🦴",
    accent: "#0f766e",
    soft: "#ecfeff",
    border: "#99f6e4",
    hypo: "hypocalcemia",
    hyper: "hypercalcemia",
  },
  {
    key: "magnesium",
    label: "Magnésio",
    short: "Mg",
    icon: "Mg",
    glyph: "🔩",
    accent: "#db2777",
    soft: "#fdf2f8",
    border: "#f9a8d4",
    hypo: "hypomagnesemia",
    hyper: "hypermagnesemia",
  },
  {
    key: "phosphate",
    label: "Fósforo",
    short: "P",
    icon: "P",
    glyph: "🧪",
    accent: "#0f766e",
    soft: "#ecfdf5",
    border: "#86efac",
    hypo: "hypophosphatemia",
    hyper: "hyperphosphatemia",
  },
  {
    key: "chloride",
    label: "Cloro",
    short: "Cl-",
    icon: "Cl",
    glyph: "💧",
    accent: "#0891b2",
    soft: "#ecfeff",
    border: "#a5f3fc",
    hypo: "hypochloremia",
    hyper: "hyperchloremia",
  },
];

function fmt(value: number | null | undefined, decimals = 1): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(decimals).replace(".", ",");
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDefaultUnit(electrolyte: ElectrolyteKey): ElectrolyteUnit {
  switch (electrolyte) {
    case "sodium":
    case "potassium":
    case "chloride":
      return "mEq/L";
    case "calcium":
    case "magnesium":
    case "phosphate":
      return "mg/dL";
  }
}

function getAllowedUnits(electrolyte: ElectrolyteKey): ElectrolyteUnit[] {
  switch (electrolyte) {
    case "sodium":
    case "potassium":
    case "chloride":
      return ["mEq/L", "mmol/L"];
    case "calcium":
      return ["mg/dL", "mmol/L"];
    case "magnesium":
      return ["mg/dL", "mmol/L", "mEq/L"];
    case "phosphate":
      return ["mg/dL", "mmol/L"];
  }
}

function normalizeElectrolyteValue(
  value: string,
  electrolyte: ElectrolyteKey,
  unit: ElectrolyteUnit
): number | null {
  const parsed = parseNumber(value);
  if (parsed == null) return null;

  switch (electrolyte) {
    case "sodium":
    case "potassium":
    case "chloride":
      return parsed;
    case "calcium":
      return unit === "mmol/L" ? parsed * 4 : parsed;
    case "magnesium":
      if (unit === "mmol/L") return parsed * 2.43;
      if (unit === "mEq/L") return (parsed / 2) * 2.43;
      return parsed;
    case "phosphate":
      return unit === "mmol/L" ? parsed * 3.1 : parsed;
  }
}

function convertCanonicalElectrolyteValue(
  value: number | null | undefined,
  electrolyte: ElectrolyteKey,
  unit: ElectrolyteUnit
): number | null {
  if (value == null || !Number.isFinite(value)) return null;

  switch (electrolyte) {
    case "sodium":
    case "potassium":
    case "chloride":
      return value;
    case "calcium":
      return unit === "mmol/L" ? value / 4 : value;
    case "magnesium":
      if (unit === "mmol/L") return value / 2.43;
      if (unit === "mEq/L") return (value / 2.43) * 2;
      return value;
    case "phosphate":
      return unit === "mmol/L" ? value / 3.1 : value;
  }
}

function formatElectrolyteForUnit(
  value: number | null | undefined,
  electrolyte: ElectrolyteKey,
  unit: ElectrolyteUnit,
  decimals = 1
): string {
  return fmt(convertCanonicalElectrolyteValue(value, electrolyte, unit), decimals);
}

function tbw(weightKg: number, sex: Sex, elderly: boolean): number {
  if (sex === "male") return weightKg * (elderly ? 0.5 : 0.6);
  return weightKg * (elderly ? 0.45 : 0.5);
}

function calculateAutomaticPlannedVolumeL(args: {
  disorder: DisorderKey;
  weightKg: number | null;
  current: number | null;
  sex: Sex;
  elderly: boolean;
  target: number | null;
}) {
  const { disorder, weightKg, current, sex, elderly, target } = args;

  if (disorder !== "hypernatremia" || weightKg == null || current == null) return null;

  const totalBodyWater = tbw(weightKg, sex, elderly);
  const goal = target ?? Math.max(current - 8, 145);
  const waterToGoal = totalBodyWater * ((current / goal) - 1);

  if (!Number.isFinite(waterToGoal) || waterToGoal <= 0) return null;
  return waterToGoal;
}

function lineWithVolume(amountLabel: string, volumeMl: number, solutionLabel: string): string {
  return `${amountLabel} (${fmt(volumeMl, 1)} mL de ${solutionLabel})`;
}

function getElectrolyteLabel(key: ElectrolyteKey): string {
  return ELECTROLYTES.find((item) => item.key === key)?.label ?? "Eletrólito";
}

function getDisorderLabel(disorder: DisorderKey): string {
  const labels: Record<DisorderKey, string> = {
    hyponatremia: "Hiponatremia",
    hypernatremia: "Hipernatremia",
    hypokalemia: "Hipocalemia",
    hyperkalemia: "Hipercalemia",
    hypocalcemia: "Hipocalcemia",
    hypercalcemia: "Hipercalcemia",
    hypomagnesemia: "Hipomagnesemia",
    hypermagnesemia: "Hipermagnesemia",
    hypophosphatemia: "Hipofosfatemia",
    hyperphosphatemia: "Hiperfosfatemia",
    hypochloremia: "Hipocloremia",
    hyperchloremia: "Hipercloremia",
  };
  return labels[disorder];
}

function getMetricLabel(label: string): string {
  if (label === "TBW") return "Água corporal total";
  if (label === "HCO3-") return "Bicarbonato";
  return label;
}

function getBlockTitle(title: string): string {
  if (title === "Thresholds úteis") return "Pontos de gravidade";
  return title;
}

function getSectionTheme(section: "solution" | "practical" | "reference") {
  switch (section) {
    case "solution":
      return {
        cardBg: "#0f172a",
        cardBorder: "#334155",
        header: "#93c5fd",
        title: "#93c5fd",
        lineBg: "#1e293b",
        lineBorder: "#334155",
        lineAccent: "#0e7490",
        lineAccentSoft: "rgba(77,154,255,0.15)",
      };
    case "practical":
      return {
        cardBg: "#14532d",
        cardBorder: "#334155",
        header: "#4ade80",
        title: "#4ade80",
        lineBg: "#1e293b",
        lineBorder: "#334155",
        lineAccent: "#4ade80",
        lineAccentSoft: "rgba(74,222,128,0.15)",
      };
    case "reference":
      return {
        cardBg: "#1e293b",
        cardBorder: "#334155",
        header: "#fb923c",
        title: "#fb923c",
        lineBg: "#1e293b",
        lineBorder: "#334155",
        lineAccent: "#fb923c",
        lineAccentSoft: "rgba(251,146,60,0.15)",
      };
  }
}

function isPriorityLine(line: string): boolean {
  return /(mL|mEq|h\b|min|bomba|bolus|controle|redosar|repetir|SF 0,9%|NaCl 3%|NaCl 20%|SG 5%|sonda|oral)/i.test(line);
}

function detectDisorderFromCurrent(electrolyte: ElectrolyteKey, current: number | null): boolean | null {
  if (current == null) return null;

  switch (electrolyte) {
    case "sodium":
      if (current < 135) return true;
      if (current > 145) return false;
      return null;
    case "potassium":
      if (current < 3.5) return true;
      if (current > 5) return false;
      return null;
    case "calcium":
      if (current < 8.5) return true;
      if (current > 10.5) return false;
      return null;
    case "magnesium":
      if (current < 1.7) return true;
      if (current > 2.5) return false;
      return null;
    case "phosphate":
      if (current < 2.5) return true;
      if (current > 4.5) return false;
      return null;
    case "chloride":
      if (current < 98) return true;
      if (current > 107) return false;
      return null;
  }
}

function deriveAutomaticTarget(disorder: DisorderKey, current: number | null): number | null {
  if (current == null) return null;

  switch (disorder) {
    case "hyponatremia":
      return Math.min(current + 6, 130);
    case "hypernatremia":
      return Math.max(current - 8, 145);
    case "hypokalemia":
      return 4;
    case "hyperkalemia":
      return 5.2;
    case "hypocalcemia":
      return 8.2;
    case "hypercalcemia":
      return 11;
    case "hypomagnesemia":
      return 1.8;
    case "hypermagnesemia":
      return 2.4;
    case "hypophosphatemia":
      return 2.8;
    case "hyperphosphatemia":
      return 4.5;
    case "hypochloremia":
      return 103;
    case "hyperchloremia":
      return 108;
  }
}

/**
 * A GRAVIDADE VEM DO DADO — este componente não classifica mais.
 *
 * ⚠️ Eram 127 linhas de `switch` com 25 cortes numéricos escritos aqui dentro.
 * Cada corte é uma afirmação clínica ("grave começa em 120"), e enquanto morava
 * no JSX não tinha onde declarar procedência nem instrumento que a enxergasse.
 * Foi para `lib/eletrolitos/gravidade.ts` SEM MUDAR NENHUM NÚMERO — mover
 * conteúdo não decide conteúdo.
 */
function getSeveritySummary(
  disorder: DisorderKey,
  current: number | null,
  ecgChanges: boolean,
  sintomatico: boolean | null = null,
  ensaio: "total" | "ajustado" | "ionico" | null = null,
  contexto: ContextoClinico | null = null
) {
  const degrau = degrauDeGravidade(disorder, current, ecgChanges, sintomatico, ensaio, contexto);
  if (!degrau) return { label: AGUARDANDO_VALOR.rotulo, signs: AGUARDANDO_VALOR.sinais };
  return { label: degrau.rotulo, signs: degrau.sinais };
}

/**
 * Faixa da barra de arrastar de cada campo desta tela.
 *
 * Os limites vêm da GRANDEZA, não da lista de opções que existia antes. A lista
 * era estreita — potássio ia de 2 a 7, e o K de 8,5 que leva à parada ficava
 * fora; sódio começava em 110, e a hiponatremia de 105 ficava fora; peso ia de
 * 40 a 150 de 5 em 5, então 47 kg exigia digitar.
 *
 * Como em lib/faixas-de-entrada.ts: são limites de ENTRADA, não de normalidade
 * nem de gravidade. Existem para o médico alcançar arrastando o valor que o
 * paciente tem, e nada aqui deve ser lido como recomendação.
 *
 * Os campos com unidade alternativa (cálcio, magnésio, fósforo em mmol/L) têm
 * os limites convertidos pelo mesmo conversor do resto da tela, para que a
 * barra acompanhe a unidade escolhida.
 */
/**
 * Faixa de cada campo numérico — DA FONTE ÚNICA, não escrita aqui.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-16) ─────────────────────────────────────
 *
 * Este arquivo mantinha as nove faixas à mão, e QUATRO já divergiam de
 * `FAIXA_DE_ENTRADA` em silêncio:
 *
 *   glicemia  passo 5   × passo 1        albumina   mín 1   × mín 0,5
 *   bicarbonato mín 4, passo 1 × mín 2, passo 0,5   sódio  máx 185 × 190
 *   cloro     70–140    × 60–150
 *
 * É o mesmo defeito que a auditoria clínica perseguiu em dose de fármaco: dois
 * lugares com o mesmo número, e um deles envelhece sozinho.
 *
 * ⚠️ CRITÉRIO DA CONVERGÊNCIA, decidido pelo autor: FAIXA MAIS LARGA, PASSO
 * MAIS FINO. Num app de emergência, não conseguir registrar o paciente real
 * custa mais que permitir um valor implausível — HCO₃ de 2 existe na
 * cetoacidose grave, Na de 190 existe na hipernatremia extrema, e é justamente
 * esse paciente que faz alguém abrir o módulo. O extremo é SINALIZADO pela
 * classificação de gravidade, não aceito em silêncio.
 *
 * Ca, Mg e P têm faixa POR UNIDADE (mg/dL × mmol/L × mEq/L) e por isso a fonte
 * única ganhou o eixo `FAIXA_POR_UNIDADE` — deixá-los de fora seria abrir
 * exceção exatamente onde a conversão de unidade é a maior fonte de erro.
 */
function faixaDoPicker(
  field: PickerFieldId,
  electrolyte: ElectrolyteKey,
  currentUnit: ElectrolyteUnit,
  magnesiumUnit: ElectrolyteUnit
): { min: number; max: number; passo: number; casas: number } {
  const casasDe = (passo: number) => (passo >= 1 ? 0 : String(passo).split(".")[1]?.length ?? 1);
  const daFonte = (f: FaixaDeEntrada | undefined, reserva: { min: number; max: number; passo: number }) => {
    const faixa = f ?? reserva;
    return { min: faixa.min, max: faixa.max, passo: faixa.passo, casas: casasDe(faixa.passo) };
  };

  /** Grandeza do campo "valor atual", que muda com o eletrólito selecionado. */
  const idDoAtual: Record<ElectrolyteKey, string> = {
    sodium: "na",
    potassium: "k",
    calcium: "ca",
    magnesium: "mg",
    phosphate: "p",
    chloride: "cl",
  };

  switch (field) {
    case "weightKg":
      return daFonte(FAIXA_DE_ENTRADA.peso, { min: 30, max: 250, passo: 1 });
    case "current": {
      const id = idDoAtual[electrolyte];
      const porUnidade = faixaPorUnidadeDe(id, currentUnit);
      return daFonte(porUnidade ?? FAIXA_DE_ENTRADA[id], { min: 0, max: 200, passo: 1 });
    }
    case "glucose":
      return daFonte(FAIXA_DE_ENTRADA.glicemia, { min: 20, max: 1200, passo: 1 });
    case "albumin":
      return daFonte(FAIXA_DE_ENTRADA.alb, { min: 0.5, max: 6, passo: 0.1 });
    case "bagVolumeMl":
      return daFonte(FAIXA_DE_ENTRADA.volumeDaBolsa, { min: 50, max: 2000, passo: 10 });
    case "infusionHours":
      return daFonte(FAIXA_DE_ENTRADA.horasDeInfusao, { min: 1, max: 24, passo: 1 });
    case "magnesiumCurrent":
      return daFonte(faixaPorUnidadeDe("mg", magnesiumUnit), { min: 0.4, max: 10, passo: 0.1 });
    case "potassiumCurrent":
      return daFonte(FAIXA_DE_ENTRADA.k, { min: 1.5, max: 9, passo: 0.1 });
    case "bicarbonate":
      return daFonte(FAIXA_DE_ENTRADA.hco3, { min: 2, max: 50, passo: 0.5 });
  }
}

function getInitialStrategyLines(disorder: DisorderKey, headline: string): string[] {
  switch (disorder) {
    case "hyponatremia":
      return [];
    case "hypernatremia":
      return [
        "Fase 1: se houver hipovolemia ou choque, estabilizar perfusão antes de focar na água livre.",
        "Fase 2: após estabilização, programar a correção ao longo de 24 horas e recalcular com sódio seriado.",
      ];
    default:
      return [headline];
  }
}

function calculateResult(tr: (pt: string) => string, args: {
  electrolyte: ElectrolyteKey;
  disorder: DisorderKey;
  sex: Sex;
  elderly: boolean;
  access: Access;
  weightKg: number | null;
  current: number | null;
  target: number | null;
  glucose: number | null;
  albumin: number | null;
  /** ⚠️ QUAL cálcio o médico informou — a dose e a gravidade usam o MESMO. */
  tipoDeCalcio: TipoDeCalcio;
  bagVolumeMl: number | null;
  infusionHours: number | null;
  plannedVolumeL: number | null;
  phosphateSalt: PhosphateSalt;
  magnesiumCurrent: number | null;
  potassiumCurrent: number | null;
  bicarbonate: number | null;
  renalDysfunction: boolean;
  ecgChanges: boolean;
}): CalcResult {
  const {
    electrolyte,
    disorder,
    sex,
    elderly,
    access,
    weightKg,
    current,
    target,
    glucose,
    albumin,
    tipoDeCalcio,
    bagVolumeMl,
    infusionHours,
    plannedVolumeL,
    phosphateSalt,
    magnesiumCurrent,
    potassiumCurrent,
    bicarbonate,
    renalDysfunction,
    ecgChanges,
  } = args;

  if (weightKg == null || current == null) {
    return {
      headline: "Preencha pelo menos peso e valor atual para destravar o cálculo.",
      metrics: [
        { label: "Eletrólito", value: getElectrolyteLabel(electrolyte) },
        { label: "Distúrbio", value: getDisorderLabel(disorder) },
      ],
      alerts: [],
      strategy: [],
      practical: [],
      summary: [],
    };
  }

  const totalBodyWater = tbw(weightKg, sex, elderly);
  const hours = infusionHours;
  const bagMl = bagVolumeMl;
  const plannedL = plannedVolumeL;

  switch (disorder) {
    case "hyponatremia": {
      const correctedNa =
        glucose && glucose > 100 ? current + 1.6 * ((glucose - 100) / 100) : current;
      const goal = target ?? Math.min(correctedNa + 6, 130);
      const deltaNeeded = Math.max(goal - correctedNa, 0);
      const severe = correctedNa < 120;
      const sodiumDeficit = totalBodyWater * deltaNeeded;
      const deltaPerL3 = (513 - correctedNa) / (totalBodyWater + 1);
      const volume3PctMl = deltaPerL3 > 0 ? (deltaNeeded / deltaPerL3) * 1000 : 0;
      const emergencyBolusMl = 150;
      const emergencyBolusMinutes = severe ? "10–20 min" : "20–30 min";
      const remainingMaintenanceMl = Math.max(volume3PctMl - emergencyBolusMl, 0);
      const maintenanceRateMlH = remainingMaintenanceMl > 0 ? remainingMaintenanceMl / 24 : 0;
      const nacl20FractionFor3Pct = (0.513 - 0.154) / (3.42 - 0.154);
      const nacl20ForTotalMl = volume3PctMl * nacl20FractionFor3Pct;
      const sf09ForTotalMl = Math.max(volume3PctMl - nacl20ForTotalMl, 0);
      const deltaPerL09 = (154 - correctedNa) / (totalBodyWater + 1);
      return {
        headline: "Hiponatremia: decidir pela gravidade neurológica e pela cronicidade presumida antes de escolher o ritmo de correção.",
        metrics: [
          { label: "Na corrigido", value: `${fmt(correctedNa, 1)} mEq/L` },
          { label: "TBW", value: `${fmt(totalBodyWater, 1)} L` },
          { label: "Meta inicial", value: `${fmt(goal, 1)} mEq/L` },
          { label: "Déficit estimado", value: `${fmt(sodiumDeficit, 0)} mEq` },
        ],
        alerts: severe
          ? [
              {
                title: "Alerta de segurança",
                tone: "danger",
                lines: [
                  "Na corrigido < 120 mEq/L exige redosagem precoce e vigilância para neurogravidade e sobrecorreção.",
                ],
              },
            ]
          : [],
        strategy: [
          {
            title: "Fase 1: resgate emergencial",
            lines: [
              trf(tr, "Solução hipertônica alvo do caso: cloreto de sódio a 3% com volume total calculado de {0} mL para a meta inicial.", [fmt(volume3PctMl, 0)]),
              `Se houver bolsa pronta de NaCl 3%, usar diretamente esse volume total em bomba de infusão.`,
              trf(tr, "Alternativa para o mesmo volume final: SF 0,9% {0} mL + NaCl 20% {1} mL.", [fmt(sf09ForTotalMl, 0), fmt(nacl20ForTotalMl, 1)]),
              trf(tr, "Se houver neurogravidade, iniciar {0} mL em {1} e redosar sódio em 1–2 h ou antes se piora clínica.", [fmt(emergencyBolusMl, 0), emergencyBolusMinutes]),
              "Se convulsão, rebaixamento importante ou herniação iminente: repetir bolus após reavaliação clínica e novo sódio.",
              trf(tr, "Se houver desidratação, sinais de hipovolemia ou instabilidade hemodinâmica: priorizar reposição volêmica com SF 0,9% {0}, repetir conforme perfusão, e só depois seguir a correção dirigida do sódio.", [textoDaRef(RESSUSCITACAO_CRISTALOIDE)]),
            ],
            tone: "warning",
          },
          {
            title: "Fase 2: manutenção nas próximas 24 h",
            lines: [
              trf(tr, "Meta automática inicial: Na {0} mEq/L, com elevação desejada de {1} mEq/L.", [fmt(goal, 1), fmt(deltaNeeded, 1)]),
              trf(tr, "Volume total calculado para a primeira meta: {0} mL de NaCl 3%.", [fmt(volume3PctMl, 0)]),
              remainingMaintenanceMl > 0
                ? trf(tr, "Após o bolus inicial, o restante calculado é {0} mL; infundir em 24 h por bomba contínua a cerca de {1} mL/h.", [fmt(remainingMaintenanceMl, 0), fmt(maintenanceRateMlH, 1)])
                : "Após o bolus inicial, reavaliar; pode não ser necessário correr manutenção hipertônica se a meta inicial já foi atingida.",
              "Controlar sódio sérico e exame neurológico a cada 4 h na manutenção, recalculando a velocidade conforme a resposta.",
              trf(tr, "Evitar ultrapassar {0} em 24 h se duração incerta ou crônica; se alto risco de desmielinização, mirar ainda menos.", [textoDaRef(LIMITE_CORRECAO_24H)]),
            ],
          },
          {
            title: "Cenário 3: SF 0,9% ou cristalóide balanceado",
            lines: [
              "Se o contexto for hiponatremia hipovolêmica, a solução de escolha pode ser SF 0,9% ou cristalóide balanceado, desde que o objetivo inicial seja restaurar volume e perfusão.",
              trf(tr, "Velocidade de referência: {3} quando o quadro é hipovolêmico sem neurogravidade; para {0} kg isso corresponde a ~ {1}–{2} mL/h.", [fmt(weightKg, 0), fmt(weightKg * 0.5, 0), fmt(weightKg, 0), textoDaRef(VELOCIDADE_HIPOVOLEMICO)]),
              "Se houver instabilidade hemodinâmica, ressuscitar em etapas com isotônico e reavaliar sódio frequentemente, porque a natremia pode subir rápido após o bloqueio fisiológico de ADH se desfazer.",
              "No módulo, considere SF 0,9% quando quiser maior previsibilidade e cristalóide balanceado quando o contexto clínico favorecer menor carga de cloro.",
            ],
          },
          {
            title: "Cenário 4: SIADH com restrição hídrica + ureia",
            lines: [
              "Se o perfil clínico for euvolêmico/SIADH sem neurogravidade, a estratégia pode ser reduzir água livre e aumentar soluto, em vez de usar isotônico de rotina.",
              trf(tr, "Ureia oral: {3}; para {0} kg isso equivale a ~ {1}–{2} g/dia, divididos em 2–3 tomadas.", [fmt(weightKg, 0), fmt(weightKg * 0.25, 0), fmt(weightKg * 0.5, 0), textoDaRef(UREIA_ORAL_SIADH)]),
              "A ureia funciona como osmótico renal, favorecendo excreção de água livre; é estratégia de manutenção e não substitui o resgate com NaCl 3% se houver neurogravidade.",
              "Associar restrição hídrica e monitorar sódio seriado; se a resposta estiver excessiva, frear para evitar sobrecorreção.",
            ],
          },
          {
            title: "Cenário 5: SIADH com NaCl oral + diurético de alça",
            lines: [
              "Alternativa de segunda linha em SIADH/moderada-profunda: combinar aumento de soluto com diurético de alça.",
              "Na prática do módulo: comprimidos de NaCl oral em doses fracionadas + furosemida em baixa dose, especialmente quando a restrição hídrica isolada falha.",
              "A lógica é aumentar a oferta de soluto e reduzir a capacidade de concentração urinária; exige acompanhamento de volume, potássio e função renal.",
              "Evitar se o cenário real for hipovolemia, porque pode agravar depleção volêmica.",
            ],
          },
          {
            title: "Cenário 6: resgate de sobrecorreção com D5W + desmopressina",
            lines: [
              "Se o sódio estiver subindo além do limite planejado, interromper a estratégia em curso e considerar relowering controlado.",
              trf(tr, "D5W pode ser usado para repor água livre; referência prática: ~ {2}, o que para {0} kg corresponde a ~ {1} mL/h.", [fmt(weightKg, 0), fmt(weightKg * 3, 0), textoDaRef(D5W_AGUA_LIVRE)]),
              "Desmopressina pode ser associada para travar a diurese aquosa e evitar que a correção siga acelerando.",
              "Esse cenário é de segurança e não de tratamento inicial rotineiro; usar com monitorização laboratorial estreita.",
            ],
            tone: "warning",
          },
        ],
        practical: [
          {
            title: "Controles e condutas associadas",
            lines: [
              "Controles obrigatórios: sódio sérico e exame neurológico 1–2 h após cada bolus e depois a cada 4 h na fase de manutenção.",
              "Monitorar diurese, balanço hídrico, glicemia e causa de base para evitar sobrecorreção e necessidade de frear a subida do sódio.",
              "Se houver diurese aquosa súbita ou subida mais rápida que a meta, reavaliar imediatamente a taxa e a estratégia.",
              trf(tr, "Referência isotônica: NaCl 0,9% tem {1} e eleva ~ {0} mEq/L por litro neste caso; não substitui o resgate da neurogravidade.", [fmt(deltaPerL09, 2), textoDaRef(NACL_09_SODIO)]),
              "Em hipovolemia, isotônico ou cristalóide balanceado fazem sentido como correção da causa; em SIADH, isotônico puro pode não resolver e às vezes piora a natremia.",
            ],
          },
        ],
        summary: [
          {
            title: "Resumo clínico",
            lines: [
              severe
                ? "Na < 120 mEq/L aumenta a chance de neurogravidade, mas a decisão do resgate continua sendo clínica."
                : "Sem neurogravidade, a correção costuma ser mais lenta e guiada pela causa de base.",
              "Hiperglicemia pode mascarar a intensidade da hiponatremia; interpretar sempre o sódio corrigido.",
              "O objetivo inicial não é normalizar o sódio, e sim retirar o paciente da zona de risco com segurança.",
              // #6: até aqui o módulo tinha procedência para os FÁRMACOS (bulas)
              // e nenhuma para as ESTRATÉGIAS de correção. Bula não é diretriz.
              "Fonte da estratégia de correção do sódio: Spasovski G, et al. Clinical practice guideline on diagnosis and treatment of hyponatraemia. Intensive Care Med. 2014;40:320–331 (ESICM · ESE · ERA-EDTA/ERBP) — de onde vêm o teto de correção, o bólus de resgate na neurogravidade e a conduta na sobrecorreção.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypernatremia": {
      const goal = target ?? Math.max(current - 8, 145);
      const dropNeeded = Math.max(current - goal, 0);
      const severe = current >= 160;
      const waterDeficitTo140 = totalBodyWater * ((current / 140) - 1);
      const waterToGoal = totalBodyWater * ((current / goal) - 1);
      const deltaPerLD5W = (0 - current) / (totalBodyWater + 1);
      const litersD5W = deltaPerLD5W < 0 ? dropNeeded / Math.abs(deltaPerLD5W) : 0;
      const plannedWaterL = plannedL != null ? Math.min(plannedL, waterToGoal) : waterToGoal;
      const plannedWaterMl = plannedWaterL != null ? plannedWaterL * 1000 : null;
      const deltaPerLHalfHalf = (77 - current) / (totalBodyWater + 1);
      const litersHalfHalf = deltaPerLHalfHalf < 0 ? dropNeeded / Math.abs(deltaPerLHalfHalf) : 0;
      const targetInfusateNa =
        plannedWaterL && plannedWaterL > 0
          ? Math.max(0, Math.min(154, current - (dropNeeded / plannedWaterL) * (totalBodyWater + 1)))
          : 0;
      const targetInfusateNaDisplay = targetInfusateNa < 10 ? 0 : targetInfusateNa;
      const sf09ForHalfHalfMl = plannedWaterMl != null ? plannedWaterMl / 2 : null;
      const waterForHalfHalfMl = plannedWaterMl != null ? plannedWaterMl / 2 : null;
      const nacl20mlPerLiter = targetInfusateNa / 3.42;
      const nacl20ForPlannedL = plannedWaterL != null ? nacl20mlPerLiter * plannedWaterL : null;
      const waterWithNaCl20Ml = plannedWaterMl != null && nacl20ForPlannedL != null ? Math.max(plannedWaterMl - nacl20ForPlannedL, 0) : null;
      const remainingIvAfterHalfLiterEnteral = Math.max(litersD5W - 0.5, 0);
      const remainingIvAfterOneLiterEnteral = Math.max(litersD5W - 1, 0);
      return {
        headline: "Hipernatremia: definir primeiro o cenário final da água livre, ressuscitar se necessário e então corrigir de forma seriada.",
        metrics: [
          { label: "TBW", value: `${fmt(totalBodyWater, 1)} L` },
          { label: "Déficit hídrico até 140", value: `${fmt(waterDeficitTo140, 2)} L` },
          { label: "Água para meta", value: `${fmt(waterToGoal, 2)} L` },
          { label: "Meta inicial", value: `${fmt(goal, 1)} mEq/L` },
        ],
        alerts: [
          // ── PARIDADE COM A HIPONATREMIA ────────────────────────────────
          //
          // O limite de 8 mEq/24 h já estava NO CÓDIGO (goal = max(Na − 8, 145))
          // e nunca era dito. Medido no bloco: "edema cerebral" 0×,
          // "sobrecorreção" 0×, limite explícito 0× — contra 4× de
          // sobrecorreção e o nome do dano (desmielinização) do lado da
          // hiponatremia, na mesma tela.
          //
          // O critério aqui é paridade: o mesmo cuidado dos dois lados, com o
          // dano NOMEADO. Na hiponatremia corrigida rápido o dano é
          // desmielinização osmótica; na hipernatremia corrigida rápido é
          // EDEMA CEREBRAL — o cérebro adaptado à hipertonicidade absorve água
          // quando o plasma cai depressa.
          {
            title: "Velocidade de correção",
            tone: "danger" as const,
            lines: [
              trf(tr, "Não baixar o sódio mais que {0} em 24 h (≈ {1}). Na hipernatremia CRÔNICA ou de duração incerta, ficar no limite inferior.", [textoDaRef(LIMITE_CORRECAO_24H), textoDaRef(LIMITE_CORRECAO_HORA)]),
              "O dano da correção rápida é EDEMA CEREBRAL, com convulsão e rebaixamento: o cérebro adaptado à hipertonicidade acumulou osmóis, e quando o plasma cai depressa a água entra na célula. É o espelho da desmielinização da hiponatremia — mesma pressa, dano oposto.",
              "A meta automática desta tela já respeita o teto de 8 mEq/L em 24 h. Reavaliar o sódio a cada 4 h e recalcular: se estiver caindo mais rápido que o previsto, reduzir a velocidade ou trocar por solução com mais sódio.",
              "Hipernatremia AGUDA (instalada em < 48 h, tipicamente iatrogênica ou por perda súbita de água livre) tolera correção mais rápida — o cérebro ainda não se adaptou. A distinção agudo × crônico vem antes da escolha da velocidade.",
            ],
          },
          ...(severe
            ? [
                {
                  title: "Alerta de segurança",
                  tone: "danger" as const,
                  lines: ["Na >= 160 mEq/L pede monitorização mais próxima e reavaliação seriada nas primeiras horas."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal reduz a confiabilidade do plano teórico isolado; acompanhar balanço e resposta real."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Cenário 1: SG 5% / água livre EV",
            lines: [
              trf(tr, "Volume total de água livre para a meta inicial: ~ {0} L.", [fmt(waterToGoal, 2)]),
              plannedWaterL != null
                ? trf(tr, "Volume programado automaticamente para a etapa inicial: {0} L ({1} mL), correspondente à meta segura das primeiras 24 h.", [fmt(plannedWaterL, 2), fmt(plannedWaterMl, 0)])
                : "Preencha peso e sódio atual para destravar o volume automático da etapa inicial.",
              trf(tr, "Se a opção for endovenosa pura, usar SG 5%; cada litro tende a reduzir ~ {0} mEq/L neste caso.", [fmt(Math.abs(deltaPerLD5W), 2)]),
              plannedWaterMl != null
                ? trf(tr, "Para esta etapa, programar {0} mL de SG 5% se a escolha for água livre EV pura.", [fmt(plannedWaterMl, 0)])
                : "Sem volume calculado, o SG 5% continua sendo a opção de água livre EV mais direta.",
              "É a opção mais simples quando o cenário final é água livre pura e não há necessidade de manter sódio no fluido infundido.",
            ],
            tone: "warning",
          },
          {
            title: "Cenário 2: SF 0,9% + água destilada",
            lines: [
              `Se a escolha for solução intermediária fixa tipo SF 0,45%, usar 50% de SF 0,9% + 50% de água destilada.`,
              plannedWaterL != null && sf09ForHalfHalfMl != null && waterForHalfHalfMl != null
                ? trf(tr, "Para o volume programado automaticamente desta etapa ({0} L), preparar SF 0,9% {1} mL + água destilada {2} mL.", [fmt(plannedWaterL, 2), fmt(sf09ForHalfHalfMl, 0), fmt(waterForHalfHalfMl, 0)])
                : "Quando o cálculo automático estiver disponível, a mistura fixa de SF 0,45% será sempre metade SF 0,9% e metade água destilada.",
              trf(tr, "Essa mistura gera solução final com ~{1} de sódio e tende a reduzir ~ {0} mEq/L por litro neste caso.", [fmt(Math.abs(deltaPerLHalfHalf), 2), textoDaRef(MEIO_A_MEIO_SODIO)]),
              "Se houver bolsa pronta de 0,45% NaCl ou D5 0,45%, ela pode cumprir o mesmo papel prático dessa solução intermediária, conforme o contexto glicêmico e institucional.",
              trf(tr, "Se fosse necessário corrigir toda a meta inicial apenas com essa solução, o volume teórico seria ~ {0} L; por isso muitas vezes corrigimos só parte agora e reavaliamos.", [fmt(litersHalfHalf, 2)]),
            ],
            tone: "warning",
          },
          {
            title: "Cenário 3: água destilada + NaCl 20%",
            lines: [
              targetInfusateNa < 10
                ? plannedWaterL != null
                  ? trf(tr, "Para o volume programado automaticamente desta etapa ({0} L), o sódio final calculado ficou próximo de 0 mEq/L; na prática isso equivale a água livre e não exige acrescentar NaCl 20%.", [fmt(plannedWaterL, 2)])
                  : "Se o sódio final calculado da etapa ficar muito próximo de 0 mEq/L, na prática isso equivale a água livre e não exige acrescentar NaCl 20%."
                : plannedWaterL != null && waterWithNaCl20Ml != null && nacl20ForPlannedL != null
                  ? trf(tr, "Para programar {0} L com sódio final alvo de ~ {1} mEq/L, usar água destilada {2} mL + NaCl 20% {3} mL.", [fmt(plannedWaterL, 2), fmt(targetInfusateNaDisplay, 0), fmt(waterWithNaCl20Ml, 0), fmt(nacl20ForPlannedL, 1)])
                  : "Preencha peso e sódio atual para destravar o preparo customizado com água destilada + NaCl 20%.",
              trf(tr, "Em 1 litro, isso corresponde a água destilada {0} mL + NaCl 20% {1} mL.", [fmt(Math.max(1000 - nacl20mlPerLiter, 0), 0), fmt(nacl20mlPerLiter, 1)]),
              trf(tr, "NaCl 20% contém ~{0} de sódio; montar sempre em volume final definido e com conferência farmacêutica/enfermagem.", [textoDaRef(NACL_20_SODIO)]),
            ],
          },
          {
            title: "Cenário 4: água por sonda ou via oral",
            lines: [
              trf(tr, "Se a via enteral/oral for segura, a água pode substituir parte do volume EV; a meta total de água livre continua sendo ~ {0} L para esta primeira queda.", [fmt(waterToGoal, 2)]),
              trf(tr, "Cada 500 mL de água por sonda/oral reduz em 500 mL o volume EV; se forem dados 500 mL por sonda, o restante EV cai para ~ {0} L.", [fmt(remainingIvAfterHalfLiterEnteral, 2)]),
              trf(tr, "Se forem dados 1,0 L por sonda/oral, o restante EV de água livre passa para ~ {0} L.", [fmt(remainingIvAfterOneLiterEnteral, 2)]),
              "Sempre recalcular o plano endovenoso quando entrar água por sonda ou via oral; não somar os volumes sem compensação.",
            ],
          },
        ],
        practical: [
          {
            title: "Velocidade, volemia e controles",
            lines: [
              severe
                ? "Se Na >= 160 mEq/L, assumir distúrbio importante e trabalhar com reavaliações mais próximas no início da correção."
                : "Se Na < 160 mEq/L e paciente estável, manter estratégia conservadora com reavaliação seriada.",
              trf(tr, "Meta usual: cair ~ {0} mEq/L em 24 h; em quadros claramente agudos a queda pode ser um pouco mais rápida, desde que monitorada.", [fmt(Math.min(dropNeeded, 10), 1)]),
              trf(tr, "Se houver desidratação, hipovolemia ou instabilidade hemodinâmica, ressuscitar primeiro com SF 0,9% {0} por etapa e repetir conforme perfusão, antes de focar na água livre.", [textoDaRef(RESSUSCITACAO_CRISTALOIDE)]),
              "Repetir sódio a cada 2–4 h no início da correção, recalcular após cada resultado e rever balanço hídrico/diurese.",
              renalDysfunction
                ? "Se houver disfunção renal, o plano precisa considerar menor capacidade de depurar sódio e água; acompanhar balanço e resposta real, não só o cálculo."
                : "Se o paciente estiver poliúrico ou com perda renal contínua de água, o déficit calculado subestima a necessidade real e o plano precisa incorporar as perdas em curso.",
            ],
          },
        ],
        summary: [
          {
            title: "Leitura de beira-leito",
            lines: [
              "Sede intensa, irritabilidade, fraqueza, letargia, mioclonias e convulsão.",
              "Quadros agudos elevam risco de hemorragia intracraniana; quadros crônicos toleram valores mais altos, mas não correção rápida.",
              "Pergunta prática: o cenário final é água livre pura, solução intermediária ou fluido customizado com sódio definido?",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypokalemia": {
      const goal = target ?? 4;
      const delta = Math.max(goal - current, 0);
      const roughDeficit = current < 3.5 ? ((3.5 - current) / 0.3) * 100 : 0;
      const severe = current < 2.5;
      const acidemia = bicarbonate != null && bicarbonate < 22;
      const magnesiumLow = magnesiumCurrent != null && magnesiumCurrent < 1.8;
      const magnesiumSevere = magnesiumCurrent != null && magnesiumCurrent < 1.2;
      const maxRate = access === "central" ? 20 : 10;
      const maxConcentration = access === "central" ? 80 : 40;
      const suggestedDose =
        access === "central"
          ? current < 2.5
            ? 80
            : current < 3
              ? 60
              : 40
          : current < 2.5
            ? 40
            : current < 3
              ? 40
              : 20;
      const kclMl = suggestedDose / 2.5; // KCl 19,1% = 2,5 mEq/mL (191 mg/mL ÷ 74,55)
      const rateMekPerH = hours != null && hours > 0 ? suggestedDose / hours : null;
      const finalConcentration = bagMl != null && bagMl > 0 ? suggestedDose / (bagMl / 1000) : null;
      return {
        headline: "Hipocalemia: dose pelo risco elétrico, pelo acesso e pelo magnésio, não só pelo valor sérico.",
        metrics: [
          { label: "Meta", value: `${fmt(goal, 1)} mEq/L` },
          { label: "Δ desejado", value: `${fmt(delta, 1)} mEq/L` },
          { label: "Déficit total rough", value: `${fmt(roughDeficit, 0)} mEq` },
          { label: "Acesso", value: access === "central" ? "Central" : "Periférico" },
          { label: "Taxa prática", value: `até ${fmt(maxRate, 0)} mEq/h` },
          { label: "Mg", value: magnesiumCurrent != null ? `${fmt(magnesiumCurrent, 1)} mg/dL` : "não informado" },
        ],
        alerts: [
          ...(finalConcentration != null && finalConcentration > maxConcentration
            ? [
                {
                  title: "Alerta de acesso",
                  tone: "danger" as const,
                  lines: [
                    access === "peripheral"
                      ? "Concentração final acima de ~40 mEq/L em acesso periférico aumenta risco de flebite e erro operacional."
                      : "Concentração final acima de ~80 mEq/L em acesso central pede checagem rigorosa da etapa e monitorização contínua.",
                  ],
                },
              ]
            : []),
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["K < 2,5 mEq/L pede reposição monitorada e redosagem mais precoce."],
                },
              ]
            : []),
          ...(magnesiumLow
            ? [
                {
                  title: "Magnésio associado",
                  tone: "warning" as const,
                  lines: [
                    magnesiumSevere
                      ? "Mg muito baixo reforça risco arrítmico e reduz a chance de o K subir de forma sustentada; corrigir magnésio em paralelo."
                      : "Mg baixo favorece hipocalemia refratária; considerar reposição concomitante em vez de tratar só o K.",
                  ],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Com disfunção renal, não empilhar ampolas sem novo controle laboratorial."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição prática inicial",
            lines: [
              trf(tr, "Dose operacional sugerida agora: {0} mEq de KCl ({1} mL de KCl 19,1% / 2,5 mEq/mL).", [suggestedDose, fmt(kclMl, 1)]),
              rateMekPerH != null
                ? trf(tr, "Se esta etapa for programada em {0} h, isso equivale a {1} mEq/h.", [fmt(hours, 1), fmt(rateMekPerH, 1)])
                : "Defina o tempo da etapa para converter a dose total em taxa horária.",
              access === "peripheral"
                ? finalConcentration != null
                  ? trf(tr, "No acesso periférico, a estratégia desta tela é conservadora: até 10 mEq/h e concentração final até ~40 mEq/L. Na bolsa planejada: {0} mEq/L.", [fmt(finalConcentration, 0)])
                  : "No acesso periférico, a estratégia desta tela é conservadora: até 10 mEq/h e concentração final até ~40 mEq/L; defina bolsa e tempo para checar a etapa."
                : finalConcentration != null
                  ? trf(tr, "No acesso central com ECG contínuo, a etapa pode subir até ~20 mEq/h e tolera concentrações maiores (referência prática ~80 mEq/L). Na bolsa planejada: {0} mEq/L.", [fmt(finalConcentration, 0)])
                  : "No acesso central com ECG contínuo, a etapa pode subir até ~20 mEq/h e tolera concentrações maiores (referência prática ~80 mEq/L).",
              magnesiumLow
                ? magnesiumSevere
                  ? "Como o magnésio está claramente baixo, a reposição de Mg precisa entrar junto; tratar só o K tende a falhar."
                  : "Como o magnésio está baixo, vale repor Mg em paralelo para evitar hipocalemia refratária."
                : "Se houver suspeita de deficiência de Mg e ele ainda não foi dosado, a reposição de K pode parecer insuficiente mesmo com dose adequada.",
              severe
                ? "K < 2,5 mEq/L deve ser lido como distúrbio grave, com reposição monitorada e redosagem mais precoce."
                : "Se K entre 2,5 e 3 mEq/L, a reposição ainda é relevante, mas o cenário clínico decide o quanto correr agora.",
              renalDysfunction
                ? "Se houver disfunção renal, fracionar mais a reposição e redosar antes de acumular carga excessiva."
                : acidemia
                  ? "Se houver acidemia, lembrar que parte do K pode subir ao corrigir o pH; o número atual pode subestimar a variabilidade do caso."
                  : "Sem disfunção renal evidente, o ritmo de reposição pode seguir mais de perto o acesso e a clínica.",
            ],
            tone: finalConcentration != null && finalConcentration > maxConcentration ? "danger" : "warning",
          },
          {
            title: "Contexto clínico",
            lines: [
              acidemia
                ? "Com bicarbonato baixo, a leitura de redistribuição muda; parte do distúrbio pode acompanhar acidose e não apenas perda corporal total."
                : "Alcalose, beta-agonista e insulina podem baixar o K por redistribuição; diarreia, diurético e hiperaldosteronismo sugerem perda real.",
              "Se houver íleo, arritmia, fraqueza importante ou rabdomiólise, o limiar para reposição IV monitorada é menor.",
              "A maior parte do déficit é intracelular; o número sérico subestima o problema quando a queda é importante.",
            ],
          },
        ],
        practical: [
          {
            title: "Exemplo de preparo",
            lines: [
              bagMl != null
                ? trf(tr, "Se a etapa escolhida for {0} mEq, adicionar {1} mL de KCl 19,1% na bolsa final de {2} mL.", [suggestedDose, fmt(kclMl, 1), fmt(bagMl, 0)])
                : trf(tr, "Dose total estimada da etapa: {0} mEq; escolha a bolsa final para converter isso em preparo prático.", [suggestedDose]),
              bagMl != null && hours != null && hours > 0
                ? trf(tr, "Se essa bolsa correr em {0} h, bomba ≈ {1} mL/h.", [fmt(hours, 1), fmt(bagMl / hours, 1)])
                : "Defina tempo e bolsa final para calcular a bomba em mL/h da etapa programada.",
              access === "peripheral"
                ? "Via periférica: preferir etapas menores e mais diluídas; se a necessidade prática ultrapassar esse limite, o acesso central muda a execução."
                : "Via central: permite etapa mais concentrada e mais rápida, mas exige ECG contínuo e checagem operacional mais rígida.",
              magnesiumLow
                ? magnesiumSevere
                  ? "Mg concomitante sugerido: considerar 2 g de sulfato de magnésio IV na etapa inicial, com redosagem conforme rim e controle."
                  : "Mg concomitante sugerido: considerar 1–2 g de sulfato de magnésio IV se o objetivo for quebrar refratariedade do K."
                : "Se o magnésio não foi dosado, vale lembrar dele quando o K não responder como esperado.",
              lineWithVolume("40 mEq de KCl", 16, "KCl 19,1% (2,5 mEq/mL)"),
              lineWithVolume("20 mEq de KCl", 8, "KCl 19,1% (2,5 mEq/mL)"),
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Fraqueza, câimbras, íleo, poliúria e arritmias.",
              "Se K < 2,5 mEq/L, alteração de ECG, paralisia ou rabdomiólise: correção mais agressiva e monitorada.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hyperkalemia": {
      const severity = gravidadeDeHipercalemia(current ?? undefined, ecgChanges);
      // ⚠️ O LIMIAR DE 126 mg/dL SAIU DAQUI TAMBÉM (2026-08-20).
  //
  // Ele ramificava o esquema de glicose e NÃO TEM FRASE DE FONTE no repositório
  // — é o corte diagnóstico de diabetes em jejum, herdado por vizinhança. O
  // módulo renal já tinha parado de usá-lo; deixar vivo aqui era manter o mesmo
  // defeito, na mesma direção insegura, numa tela que residentes abrem em
  // produção. Número errado não espera número melhor para ser consertado.
  //
  // A glicemia informada continua servindo para o AVISO de vigilância — que
  // agora aparece sempre, porque a hipoglicemia ocorre também com glicemia
  // basal normal.
      const acidemia = bicarbonate != null && bicarbonate < 22;
      return {
        headline: "Hipercalemia é manejo em três frentes: estabilizar membrana, fazer shift e remover potássio do corpo.",
        metrics: [
          { label: "Gravidade", value: severity },
          { label: "ECG", value: ecgChanges ? "Alterado" : "Sem alteração informada" },
          { label: "Glicemia", value: glucose != null ? `${fmt(glucose, 0)} mg/dL` : "não informada" },
          { label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" },
        ],
        alerts: [
          ...((ecgChanges || current >= K_GRAVE)
            ? [
                {
                  title: "Emergência",
                  tone: "danger" as const,
                  lines: ["ECG alterado ou K >= 6,5 mEq/L: tratar imediatamente como emergência elétrica."],
                },
              ]
            : []),
          {
            title: "Risco de hipoglicemia",
            tone: "warning" as const,
            // ⚠️ SEM CONDIÇÃO: o aviso aparece sempre. Ele era exibido só quando
            // a glicemia estava abaixo de 126 — e a hipoglicemia acontece também
            // com a glicose administrada e com glicemia basal de qualquer valor.
            lines: [HIPERCALEMIA_JANELA_HIPOGLICEMIA, HIPERCALEMIA_JANELA_PORQUE],
          },
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal reduz remoção corporal do K e baixa o limiar para discutir TRS."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Estabilização de membrana",
            lines: [
              lineWithVolume("30 mL de gluconato de cálcio 10%", 30, "gluconato de cálcio 10%"),
              "Infundir em 10 minutos se houver alteração de ECG ou hipercalemia grave; repetir se ECG não melhorar.",
              "Se o ECG é o problema, o cálcio entra antes da discussão etiológica completa.",
            ],
            tone: "danger",
          },
          {
            title: "Shift intracelular",
            lines: [
              HIPERCALEMIA_DESLOCAR_INSULINA,
  HIPERCALEMIA_GLICOSE_PADRAO,
  HIPERCALEMIA_JANELA_HIPOGLICEMIA,
  HIPERCALEMIA_JANELA_PORQUE,
              lineWithVolume("25 g de glicose", 50, "glicose hipertônica 50%"),
              HIPERCALEMIA_GLICOSE_PADRAO,
              HIPERCALEMIA_JANELA_HIPOGLICEMIA,
              HIPERCALEMIA_DESLOCAR_BETA2,
              acidemia
                ? "Se acidose metabólica coexistente, bicarbonato pode entrar como adjuvante em cenários selecionados, mas não substitui cálcio/insulina/TRS."
                : "Sem acidose relevante, o pilar do shift continua sendo insulina e beta-agonista.",
            ],
            tone: "warning",
          },
          {
            title: "Remoção de potássio",
            lines: [
              "Interromper fontes de K, tratar acidose/IRA, considerar diurético se houver diurese.",
              renalDysfunction
                ? "Com disfunção renal/oligúria, o limiar para discutir terapia renal substitutiva deve ser mais baixo."
                : "Se oligúria, refratariedade ou hipercalemia persistente: discutir terapia renal substitutiva.",
            ],
          },
        ],
        practical: [
          {
            title: "Como usar no plantão",
            lines: [
              "ECG primeiro, depois cálcio se houver alteração ou K muito alto.",
              "Repetir potássio após a fase de shift; o paciente pode 'rebote' se não remover K do corpo.",
              "Se pseudohipercalemia for possível, repetir amostra sem garrote prolongado e sem hemólise.",
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Fraqueza, parestesia, bloqueios, QRS largo, bradicardia e risco de parada.",
              "Se K ≥ 6,5 mEq/L ou ECG alterado, tratar como emergência mesmo antes da causa definitiva.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypocalcemia": {
      // ⚠️ O CORTE VEM DO DADO, na hora — nunca escrito na frase (R-95).
      const corteDaGravidade = corteDoDegrau("hypocalcemia", GRAVIDADE_POR_DISTURBIO.hypocalcemia[0]) ?? "";
      const leitura = calcioParaClassificar({ tipo: tipoDeCalcio, valor: current, albumina: albumin });
      // ⚠️ O MESMO CÁLCIO DA GRAVIDADE — antes esta linha corrigia por conta
      // própria enquanto a classificação usava o bruto, dentro do mesmo card.
      const correctedCa =
        calcioParaClassificar({ tipo: tipoDeCalcio, valor: current, albumina: albumin }).valor ?? current;
      const doseG = correctedCa < 7 || current < 7 ? 2 : 1;
      const severe = correctedCa < 7 || current < 7;
      const volumeMl = doseG * 10;
      const elementalMeq = volumeMl * 0.465;
      // ── OS DOIS SAIS, e a razão é clínica, não de disponibilidade ────────
      //
      // O módulo só oferecia gluconato. O app JÁ usa cloreto de cálcio em
      // politrauma, choque e PCR na gestante — quem viu a droga lá e abre esta
      // tela encontra só gluconato, e a leitura natural é que são
      // intercambiáveis. Não são: 1 g de cloreto ≈ 3 g de gluconato em cálcio
      // elementar, e trocar 1:1 erra por ~3× em uma das direções.
      //
      // Conferido por cálculo: gluconato 10% = 0,465 mEq/mL de Ca elementar
      // (100 mg/mL × 40,08/430,4 ÷ 20,04); cloreto 10% = 1,361 mEq/mL
      // (100 mg/mL × 40,08/147,0 ÷ 20,04). Razão 2,93×.
      const volumeCloretoMl = volumeMl / 2.93;
      const elementalMgGluconato = volumeMl * 9.31;
      const elementalMgCloreto = volumeCloretoMl * 27.3;
      const estimatedBagMl = severe ? 100 : 50;
      return {
        headline: "Hipocalcemia relevante pede corrigir cálcio e ler o contexto: magnésio, fósforo, albumina e instabilidade elétrica.",
        metrics: [
          { label: "Ca corrigido", value: `${fmt(correctedCa, 2)} mg/dL` },
          { label: "Dose sugerida", value: `${doseG} g` },
          { label: "Cálcio elementar", value: `${fmt(elementalMeq, 1)} mEq` },
        ],
        alerts: severe
          ? [
              {
                title: "Alerta de gravidade",
                tone: "danger",
                lines: ["Hipocalcemia nesta faixa pede atenção para QT longo, tetania e convulsão."],
              },
            ]
          : [],
        strategy: [
          {
            title: "Resgate IV",
            lines: [
              trf(tr, "Necessidade estimada da etapa inicial: {0} g de gluconato de cálcio 10% ({1} mL da solução 10%) = ~{2} mg de cálcio ELEMENTAR.", [doseG, fmt(volumeMl, 0), fmt(elementalMgGluconato, 0)]),
              trf(tr, "⚠️ MESMA quantidade de cálcio elementar com CLORETO de cálcio 10%: apenas {0} mL (~{1} mg elementar). 1 mL de cloreto tem {2} mEq de Ca contra {3} mEq do gluconato — o cloreto é ~{4}× mais concentrado em cálcio elementar. Trocar um pelo outro na proporção 1:1 erra por {4}× em uma das direções.", [fmt(volumeCloretoMl, 1), fmt(elementalMgCloreto, 0), numeroDaRef(CLORETO_10_CALCIO), numeroDaRef(GLUCONATO_10_CALCIO), String(RAZAO_CLORETO_GLUCONATO).replace(".", ",")]),
              "QUAL DOS DOIS — é escolha por CONTEXTO, não por disponibilidade. CLORETO: preferido na PCR, na hipercalemia com alteração de ECG e na hipocalcemia com instabilidade — entrega mais cálcio elementar mais rápido. Exige acesso CENTRAL de preferência: é muito mais esclerosante e a extravasação causa necrose. GLUCONATO: preferido em acesso periférico e quando não há urgência elétrica, por ser bem menos irritante.",
              trf(tr, "Como preparo prático, essa etapa costuma ser diluída em {0} mL de SF 0,9% ou SG 5%.", [estimatedBagMl]),
              `Se a etapa for corrida em 10–20 minutos, a velocidade costuma ficar dentro do limite operacional para adultos.`,
              // ⚠️ O NÚMERO SAIU DA FRASE. Ele dizia `< 7 mg/dL`, que deixou de
              // ser o corte quando ele passou a morar na unidade da fonte
              // (< 1,9 mmol/L ≈ 7,62). A prosa envelheceu ao lado do dado — R-95
              // na forma em que a segunda cópia está DENTRO DA FRASE. Agora o
              // valor vem do dado, e `test:texto-vs-corte` impede a volta.
              severe
                ? trf(tr, "Se o cálcio estiver abaixo do corte de gravidade ({0}), ou houver tetania, convulsão ou QT longo, a reposição IV ganha prioridade prática.", [corteDaGravidade])
                // ⚠️ E ESTE RAMO NÃO AFIRMA MAIS ESTADO QUE NINGUÉM VERIFICOU.
                // Ele dizia "a hipocalcemia é menos intensa e o paciente estável"
                // — inclusive quando não havia valor ou quando o médico informou
                // ionizado, que não classifica por número. Conclusão por queda
                // (R-111): dizia "está bem" onde a resposta era "não sei".
                : leitura.valor == null
                  ? "Sem valor classificável, o app NÃO afirma que o quadro é leve: informe o cálcio e o ensaio para que a gravidade seja lida."
                  : "O cálcio não alcançou o corte de gravidade. Isso não é o mesmo que quadro estável: o contexto, a causa e os sintomas definem o restante da correção.",
              renalDysfunction
                ? "Em DRC/IRA, pesar melhor a relação com fósforo e evitar tratar só o número fora do contexto."
                : "Sem disfunção renal importante, a causa imediata costuma direcionar mais do que a limitação de depuração.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto clínico",
            lines: [
              "Hipomagnesemia pode impedir correção sustentada do cálcio; fósforo alto e DRC mudam a interpretação e a segurança da reposição.",
              "Albumina baixa pode reduzir o cálcio total sem necessariamente traduzir a mesma gravidade do cálcio ionizado.",
              "Se houver broncoespasmo, laringoespasmo, tetania ou instabilidade elétrica, tratar pela clínica e não pelo perfeccionismo laboratorial.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalência prática",
            lines: [
              trf(tr, "Dose total estimada da etapa: {0} g; a redosagem define se será necessário repetir outra etapa depois.", [doseG]),
              lineWithVolume("1 g de gluconato de cálcio 10%", 10, "gluconato de cálcio 10%"),
              lineWithVolume("2 g de gluconato de cálcio 10%", 20, "gluconato de cálcio 10%"),
              trf(tr, "1 mL contém ~{2} de cálcio elementar; {0} mL fornecem ~{1} mEq.", [fmt(volumeMl, 0), fmt(elementalMeq, 1), numeroDaRef(GLUCONATO_10_CALCIO) + " mEq"]),
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Parestesia perioral, cãibra, tetania, broncoespasmo, QT longo e convulsão.",
              "Se houver instabilidade elétrica ou tetania franca, tratar antes de aguardar cálcio corrigido final.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypercalcemia": {
      const calcitoninUnits = weightKg * 4;
      const calcitoninMl = calcitoninUnits / 200;
      // ⚠️ MESMO CÁLCIO da gravidade, pela mesma razão da hipocalcemia.
      const calcioLido =
        calcioParaClassificar({ tipo: tipoDeCalcio, valor: current, albumina: albumin }).valor ?? current;
      const severe = calcioLido >= 14;
      return {
        headline: "Hipercalcemia importante é sobretudo problema de volume, rim e causa de base; o laboratório acompanha a reversão clínica.",
        metrics: [
          { label: "Cálcio atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Peso", value: `${fmt(weightKg, 0)} kg` },
          { label: "Calcitonina 4 UI/kg", value: `${fmt(calcitoninUnits, 0)} UI` },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Ca >= 14 mg/dL aumenta a chance de deterioração neurológica, renal e necessidade de ambiente monitorado."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Com disfunção renal, expansão volêmica e anti-reabsortivo exigem leitura mais conservadora."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Medidas iniciais",
            lines: [
              "Se hipovolêmico, SF 0,9% com reavaliação seriada; evitar cloreto em excesso se já houver hipercloremia importante.",
              `Calcitonina 4 UI/kg = ${fmt(calcitoninUnits, 0)} UI (${fmt(calcitoninMl, 2)} mL se apresentação 200 UI/mL).`,
              lineWithVolume("Ácido zoledrônico 4 mg", 5, "frasco 4 mg/5 mL"),
              severe
                ? "Ca >= 14 mg/dL reforça gravidade e aumenta a chance de precisar ambiente monitorado/UTI."
                : "Se Ca < 14 mg/dL, sintomas e função renal ajudam a definir urgência e local de cuidado.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal",
            lines: [
              renalDysfunction
                ? "Em DRC ou IRA, hidratação e anti-reabsortivo exigem leitura mais cuidadosa da volemia, da creatinina e do risco de sobrecarga."
                : "Mesmo sem disfunção renal evidente, monitorar creatinina e diurese durante a expansão volêmica.",
              "Calcitonina ajuda nas primeiras horas; o anti-reabsortivo sustenta a queda depois.",
              "Quando malignidade, hiperparatireoidismo ou vitamina D estão em jogo, tratar a causa é parte da correção real.",
            ],
          },
        ],
        practical: [
          {
            title: "Uso prático",
            lines: [
              "Calcitonina ajuda mais rápido; bisfosfonato corrige a médio prazo.",
              "Monitorar creatinina, volume urinário e ECG.",
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Desidratação, náusea, constipação, poliúria, encefalopatia e QT curto.",
              "Se Ca muito alto com alteração neurológica ou renal, pensar em manejo de UTI.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypomagnesemia": {
      const severe = current < 1.2;
      const verySevere = current < 1;
      const doseG = severe ? 2 : 1;
      const volumeMl = doseG * 2;
      const meq = volumeMl * 4.06;
      const estimatedDilutionMl = severe ? 100 : 50;
      return {
        headline: "Hipomagnesemia: dose pelo contexto elétrico e renal, não só pelo número isolado.",
        metrics: [
          { label: "Mg atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Dose IV sugerida", value: `${doseG} g` },
          { label: "Equivalente", value: `${fmt(meq, 1)} mEq` },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Mg < 1,2 mg/dL com clínica compatível pede reposição IV monitorada."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal aumenta o risco de acúmulo ao repetir magnésio."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição IV inicial",
            lines: [
              trf(tr, "Necessidade estimada da etapa inicial: {0} g de sulfato de magnésio 50% ({1} mL da ampola 50% / 500 mg/mL).", [doseG, fmt(volumeMl, 1)]),
              severe
                // #4 revisto na auditoria da Taquicardia: a unificação em
                // "1–2 g" ERA O DEFEITO, não a correção. Ela igualou dois
                // cenários que a fonte separa — no torsades COM pulso a carga
                // é 2 g em 10–20 min, e o tempo existe porque magnésio rápido
                // causa hipotensão e bradicardia em quem já pode estar
                // instável; SEM pulso é 1–2 g em 1–2 min, porque ali não há
                // pressão a proteger.
                //
                // Aqui o paciente da calculadora TEM pulso. Consome a fonte
                // única em vez de reescrever a faixa (R-48).
                ? MAGNESIO_TORSADES_COM_PULSO
                : "Se estável: correr 1–2 g em 1 h e repetir conforme resposta e função renal.",
              // A PORTA, e não as doses. Sulfatação é outro objetivo — profilaxia
              // e tratamento de convulsão eclâmptica, com tríade de segurança e
              // antídoto — e os esquemas (Pritchard, Zuspan) vivem no módulo
              // próprio. Repeti-los aqui criaria a segunda cópia de um número
              // que já diverge fácil (R-12).
              "⚠️ GESTANTE OU PUÉRPERA COM SÍNDROME HIPERTENSIVA: estas doses são de REPOSIÇÃO de magnésio e NÃO servem para sulfatação. Pré-eclâmpsia e eclâmpsia usam esquema próprio (Pritchard ou Zuspan), com dose de ataque muito maior, tríade de segurança e gluconato de cálcio como antídoto — ver o módulo de Pré-eclâmpsia e eclâmpsia.",
              trf(tr, "Como preparo prático, essa etapa pode ser diluída em ~{0} mL de SF 0,9% ou SG 5%.", [estimatedDilutionMl]),
              verySevere
                ? "Se Mg < 1 mg/dL, repleção adicional nas próximas 12–24 h costuma ser necessária mesmo após a dose inicial."
                : "Se Mg entre 1,2 e 1,6 mg/dL, o alvo é quebrar o ciclo clínico e reavaliar, não normalizar em uma única bolsa.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal e arrítmico",
            lines: [
              renalDysfunction
                ? "Em disfunção renal, evitar empilhar doses sem redosagem seriada; a mesma ampola que corrige pode acumular."
                : "Sem disfunção renal importante, reposições seriadas tendem a ser mais previsíveis, mas ainda exigem controle laboratorial.",
              "Se houver torsades, QT longo ou hipocalemia refratária, tratar o Mg como prioridade elétrica mesmo antes do resultado de controle.",
              "Perdas GI, alcoolismo, diuréticos e aminoglicosídeos sugerem déficit corporal total maior do que o valor sérico mostra.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalência prática",
            lines: [
              trf(tr, "Dose total estimada da etapa: {0} g; etapas adicionais dependem de redosagem e contexto renal.", [doseG]),
              lineWithVolume("1 g de sulfato de magnésio", 2, "sulfato de magnésio 50%"),
              lineWithVolume("2 g de sulfato de magnésio", 4, "sulfato de magnésio 50%"),
              "Cada mL da solução 50% contém ~500 mg e ~4,06 mEq de magnésio.",
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Tremor, hiperreflexia, tetania, convulsão, QT longo e torsades.",
              "Se Mg < 1,2 mg/dL, alteração elétrica ou convulsão: preferir reposição IV monitorada.",
              "Se K baixo persistente, procurar e corrigir Mg concomitante.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypermagnesemia": {
      return {
        headline: "Hipermagnesemia grave é quadro de bloqueio neuromuscular e hemodinâmico: antagonizar, eliminar e monitorar.",
        metrics: [
          { label: "Mg atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Risco clínico", value: current >= 4.9 ? "alto" : "moderado" },
          { label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" },
        ],
        alerts: [
          ...(current >= 4.9
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Nível alto de magnésio com clínica compatível pode evoluir com bloqueio neuromuscular e depressão respiratória."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal aumenta a chance de persistência e necessidade de diálise."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Antagonismo e suporte",
            lines: [
              lineWithVolume("1 g de gluconato de cálcio 10%", 10, "gluconato de cálcio 10%"),
              lineWithVolume("2 g de gluconato de cálcio 10%", 20, "gluconato de cálcio 10%"),
              renalDysfunction
                ? "Associar suporte ventilatório e hemodinâmico; com rim disfuncionante, a chance de precisar diálise é mais alta."
                : "Associar suporte ventilatório e hemodinâmico conforme quadro; considerar diurético/diálise se rim não depura.",
            ],
            tone: "danger",
          },
        ],
        practical: [
          {
            title: "Pontos de gravidade",
            lines: [
              "Perda do reflexo patelar costuma aparecer em níveis altos; depressão respiratória e hipotensão marcam intoxicação importante.",
              "Suspender toda fonte de magnésio e repetir dosagem seriada.",
            ],
          },
        ],
        summary: [
          {
            title: "Sinais e sintomas-chave",
            lines: [
              "Hiporreflexia, rubor, hipotensão, bradicardia, sonolência e depressão respiratória.",
              "Se houver apneia ou bloqueio importante, escalar suporte e considerar TRS rapidamente.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypophosphatemia": {
      const mmol = current / 3.1;
      const severe = current < 1;
      const moderate = current < 2;
      const doseMmol = severe ? 30 : moderate ? 15 : 0;
      const volumeMl = doseMmol / 3;
      const viaPotassium = phosphateSalt === "potassium";
      const potassiumDelivered = viaPotassium ? doseMmol * (4.4 / 3) : 0;
      const sodiumDelivered = viaPotassium ? 0 : doseMmol * (4 / 3);
      const maxRate = access === "central" ? 15 : 6.8;
      const minHours = doseMmol > 0 ? doseMmol / maxRate : 0;
      const plannedPhosphateRate = hours != null && hours > 0 && doseMmol > 0 ? doseMmol / hours : null;
      return {
        headline: "Hipofosfatemia: decidir pela gravidade, pelo potássio e pelo contexto renal antes de escolher o sal.",
        metrics: [
          { label: "Fósforo", value: `${fmt(current, 2)} mg/dL` },
          { label: "≈ mmol/L", value: `${fmt(mmol, 2)} mmol/L` },
          { label: "Dose sugerida", value: `${fmt(doseMmol, 0)} mmol` },
          { label: "Sal", value: viaPotassium ? "Fosfato de potássio" : "Fosfato de sódio" },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Fósforo < 1 mg/dL aumenta risco de falência muscular, respiratória e miocárdica."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Com disfunção renal, fósforo IV exige redosagem mais precoce e mais parcimônia."],
                },
              ]
            : []),
          ...(access === "peripheral" && doseMmol > 15
            ? [
                {
                  title: "Atenção de acesso",
                  tone: "warning" as const,
                  lines: ["Dose alta de fósforo em acesso periférico pede atenção extra ao tempo mínimo e tolerância do acesso."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição IV",
            lines: [
              trf(tr, "Necessidade estimada da etapa inicial: {0} mmol de fósforo ({1} mL do concentrado 3 mmol/mL).", [fmt(doseMmol, 0), fmt(volumeMl, 1)]),
              viaPotassium
                ? trf(tr, "{0} mmol de fosfato de potássio também entregam ~{1} mEq de K.", [fmt(doseMmol, 0), fmt(potassiumDelivered, 1)])
                : trf(tr, "{0} mmol de fosfato de sódio também entregam ~{1} mEq de Na.", [fmt(doseMmol, 0), fmt(sodiumDelivered, 1)]),
              viaPotassium
                ? potassiumCurrent != null && potassiumCurrent >= 4.5
                  ? "Com K normal-alto, reavaliar se o melhor sal não passa a ser o fosfato de sódio."
                  : "Com K baixo, o fosfato de potássio costuma fazer mais sentido por corrigir dois problemas de uma vez."
                : potassiumCurrent != null && potassiumCurrent < 3.5
                  ? "Como o K está baixo, o fosfato de sódio pode perder a oportunidade de corrigir a hipocalemia associada."
                  : "Fosfato de sódio é útil quando o potássio já está adequado ou quando se quer evitar carga adicional de K.",
              access === "central"
                ? "Acesso central: máximo prático de 15 mmol/h para o fósforo."
                : "Acesso periférico: máximo prático de 6,8 mmol/h para o fósforo.",
              doseMmol > 0
                ? plannedPhosphateRate != null
                  ? trf(tr, "Se esta etapa for programada em {0} h, a taxa fica ~ {1} mmol/h; o tempo mínimo por segurança segue sendo ≈ {2} h.", [fmt(hours, 1), fmt(plannedPhosphateRate, 1), fmt(minHours, 1)])
                  : trf(tr, "Para essa dose, o tempo mínimo por segurança é ≈ {0} h; defina a duração da etapa se quiser converter em mmol/h.", [fmt(minHours, 1)])
                : "Se fósforo > 2 mg/dL e quadro estável, considerar via oral / observação.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal e ácido-base",
            lines: [
              renalDysfunction
                ? "Em insuficiência renal, a indicação de fósforo IV precisa ser mais restrita e sempre acompanhada de redosagem precoce."
                : "Sem disfunção renal importante, o risco de acúmulo é menor, mas a redosagem ainda define a próxima etapa.",
              bicarbonate != null && bicarbonate > 28
                ? "Bicarbonato alto sugere alcalose; isso pode reforçar componente de redistribuição do fósforo."
                : "Cetoacidose, realimentação e alcalose respiratória podem derrubar o fósforo por redistribuição; o contexto ajuda a não supertratar.",
              "Se houver hipocalcemia significativa, lembrar do risco de produto Ca x P alto e de precipitação tecidual.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalência prática",
            lines: [
              doseMmol > 0
                ? trf(tr, "Dose total estimada da etapa: {0} mmol; a necessidade total do dia pode ser maior e depende da redosagem.", [fmt(doseMmol, 0)])
                : "Sem indicação clara de etapa IV inicial, a reavaliação clínica pode apontar via oral ou observação.",
              lineWithVolume("15 mmol de fósforo", 5, "fosfato 3 mmol/mL"),
              lineWithVolume("30 mmol de fósforo", 10, "fosfato 3 mmol/mL"),
              lineWithVolume("45 mmol de fósforo", 15, "fosfato 3 mmol/mL"),
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Fraqueza, insuficiência respiratória, disfunção miocárdica, rabdomiólise e hemólise.",
              severe
                ? "Se o fósforo estiver abaixo do corte de gravidade, tratar como distúrbio grave mesmo antes da falência muscular se a clínica for compatível."
                : moderate
                  ? "Se fósforo entre 1 e 2 mg/dL, a decisão entre via IV e oral depende de sintomas, via enteral e contexto clínico."
                  // ⚠️ NÃO AFIRMA MAIS UM VALOR QUE NINGUÉM VERIFICOU. O ramo
                  // final dizia "fósforo > 2 mg/dL", mas ele é só "nem severe
                  // nem moderate" — o que inclui não haver valor (R-111).
                  : "Fora das faixas acima, o app não conclui pelo número: a conduta depende de sintomas, via enteral e contexto clínico.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hyperphosphatemia": {
      return {
        headline: "Hiperfosfatemia é sobretudo problema renal e de produto cálcio-fósforo; a conduta é reduzir carga, quelar quando indicado e depurar quando necessário.",
        metrics: [
          { label: "Fósforo atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Atenção", value: "Ca x P e função renal" },
          { label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" },
        ],
        alerts: renalDysfunction
          ? [
              {
                title: "Atenção renal",
                tone: "danger",
                lines: ["Hiperfosfatemia com disfunção renal informada aumenta o risco de persistência e necessidade de depuração."],
              },
            ]
          : [],
        strategy: [
          {
            title: "Conduta prática",
            lines: [
              "Suspender fontes exógenas de fósforo e revisar função renal.",
              "Considerar quelantes conforme contexto e indicação nefrológica, especialmente se o intestino ainda é a principal via de entrada.",
              renalDysfunction
                ? "Com disfunção renal, o limiar para discutir terapia renal substitutiva fica mais baixo."
                : "Se doença renal grave, hipocalcemia sintomática, rabdomiólise importante ou fósforo muito alto persistente: discutir terapia renal substitutiva.",
            ],
            tone: "warning",
          },
        ],
        practical: [
          {
            title: "Como pensar",
            lines: [
              "Avaliar cálcio, magnésio, potássio, função renal e acidose associada.",
              "Evitar infundir cálcio junto com fosfato na mesma linha pela precipitação.",
            ],
          },
        ],
        summary: [
          {
            title: "Sinais e sintomas-chave",
            lines: [
              "Muitas vezes o problema se manifesta pela hipocalcemia associada: tetania, QT longo, parestesias.",
              "Hiperfosfatemia importante em IRA costuma vir em pacote com outros distúrbios.",
            ],
          },
        ],
      };
    }
    case "hypochloremia": {
      const goal = target ?? 103;
      const deficit = Math.max(0, 0.2 * weightKg * (goal - current));
      const salineLiters = deficit / 154;
      const marked = current < 95;
      const metabolicAlkalosis = bicarbonate != null && bicarbonate > 28;
      return {
        headline: "Hipocloremia útil à beira-leito costuma significar alcalose metabólica cloro-sensível até prova em contrário.",
        metrics: [
          { label: "Cl atual", value: `${fmt(current, 1)} mEq/L` },
          { label: "Meta operacional", value: `${fmt(goal, 1)} mEq/L` },
          { label: "Déficit rough", value: `${fmt(deficit, 0)} mEq de Cl-` },
          { label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" },
        ],
        alerts: [
          ...(metabolicAlkalosis
            ? [
                {
                  title: "Alerta ácido-base",
                  tone: "warning" as const,
                  lines: ["HCO3- elevado reforça alcalose metabólica cloro-sensível e aumenta o peso da reposição de cloreto."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal reduz a utilidade de corrigir só o cloro sem reavaliar volume e potássio."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição orientada por cloreto",
            lines: [
              trf(tr, "Déficit rough de cloro: ~{0} mEq.", [fmt(deficit, 0)]),
              trf(tr, "Isso corresponde a ~{0} L de SF 0,9% se a estratégia for só cloreto de sódio.", [fmt(salineLiters, 2)]),
              potassiumCurrent != null && potassiumCurrent < 3.5
                ? "Como o potássio está baixo, parte da correção pode ser melhor feita com KCl em vez de só SF."
                : "Se sódio não permitir mais cloreto de sódio, pensar em KCl ou ajuste de solução conforme contexto.",
              marked
                ? "Cl < 95 mEq/L reforça leitura de alcalose cloro-sensível, sobretudo se houver vômitos, sucção gástrica ou diurético."
                : "Em hipocloremia menos intensa, o contexto de volume e bicarbonato decide mais do que o número isolado.",
              metabolicAlkalosis
                ? "HCO3- elevado reforça a leitura de alcalose metabólica associada e aumenta o peso da reposição de cloreto."
                : "Sem HCO3- elevado, vale checar se a queda do cloro faz parte de outro distúrbio misto.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto ácido-base e renal",
            lines: [
              metabolicAlkalosis
                ? "Se o bicarbonato está alto ou há hipoventilação compensatória, a alcalose metabólica associada ganha força."
                : "Sem bicarbonato alto, a interpretação da hipocloremia precisa de mais contexto ácido-base.",
              renalDysfunction
                ? "Na presença de IRA/DRC, corrigir cloreto sem olhar volume e potássio pode piorar sobrecarga e não resolver a fisiologia."
                : "Sem disfunção renal importante, volume, vômitos, diurético e potássio costumam explicar mais o quadro.",
              "A urina cloro baixa sugere forma cloro-responsiva; urina cloro alta empurra a investigação para perdas renais/mineralocorticoide.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalências",
            lines: [
              trf(tr, "SF 0,9% contém {0} de cloreto.", [textoDaRef(NACL_09_CLORETO)]),
              lineWithVolume("20 mEq de KCl", 8, "KCl 19,1% / 2,5 mEq/mL"),
              lineWithVolume("40 mEq de KCl", 16, "KCl 19,1% / 2,5 mEq/mL"),
            ],
          },
        ],
        summary: [
          {
            title: "Leitura prática",
            lines: [
              "Muitas vezes o quadro é o da alcalose metabólica: hipoventilação, fraqueza, parestesias e arritmias se coexistir hipocalemia.",
              "A pergunta prática é: o paciente precisa de cloreto, de volume, de potássio ou dos três?",
            ],
          },
        ],
      };
    }
    case "hyperchloremia": {
      const excess = Math.max(0, 0.2 * weightKg * (current - 108));
      const marked = current >= 115;
      const metabolicAcidosis = bicarbonate != null && bicarbonate < 22;
      return {
        headline: "Hipercloremia é geralmente problema de carga de cloro ou acidose associada, não falta de uma droga corretiva.",
        metrics: [
          { label: "Cl atual", value: `${fmt(current, 1)} mEq/L` },
          { label: "Excesso rough", value: `${fmt(excess, 0)} mEq de Cl-` },
          { label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" },
        ],
        alerts: [
          ...(metabolicAcidosis
            ? [
                {
                  title: "Alerta ácido-base",
                  tone: "danger" as const,
                  lines: ["HCO3- baixo com hipercloremia sugere acidose metabólica hiperclorêmica até prova em contrário."],
                },
              ]
            : []),
          ...(marked
            ? [
                {
                  title: "Alerta de carga",
                  tone: "warning" as const,
                  lines: ["Cl >= 115 mEq/L pede revisão ativa da carga recente de cloro e do balanço hídrico."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal pode sustentar hipercloremia e acidose apesar de retirar a carga exógena."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Conduta prática",
            lines: [
              "Suspender/ reduzir soluções ricas em cloro se já não houver indicação hemodinâmica clara.",
              "Preferir cristalóide balanceado quando o problema é carga de cloro; se houver hipernatremia associada, integrar com a estratégia de água livre.",
              metabolicAcidosis
                ? "HCO3- baixo reforça leitura de acidose metabólica hiperclorêmica e pede revisão da causa de base."
                : "Reavaliar gasometria e função renal; nem toda hipercloremia isolada exige intervenção além de parar a carga.",
              marked
                ? "Cl >= 115 mEq/L pede revisão agressiva do balanço hídrico e da carga recente de SF, bicarbonato perdido ou TRS."
                : "Se a elevação é mais discreta, a tendência e a gasometria valem mais que um número isolado.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal e ácido-base",
            lines: [
              renalDysfunction
                ? "Na injúria renal, a hipercloremia pode refletir incapacidade de depurar carga administrada e piorar acidose/vasoconstrição renal."
                : "Sem disfunção renal importante, excesso de SF e perdas digestivas de bicarbonato sobem na lista.",
              metabolicAcidosis
                ? "Em diarreia ou acidose tubular renal, o alvo não é só baixar o cloro, mas corrigir a perda de bicarbonato e a causa de base."
                : "Se bicarbonato estiver normal e o paciente recebeu muito SF, a explicação mais provável continua sendo iatrogênica.",
              renalDysfunction
                ? "Com rim disfuncionante, a tendência do cloro importa tanto quanto o valor isolado."
                : "Com rim preservado, retirar a carga de cloro costuma resolver grande parte do problema.",
            ],
          },
        ],
        practical: [
          {
            title: "Como pensar",
            lines: [
              "O número rough acima mostra a magnitude da carga acumulada no compartimento extracelular.",
              "A correção verdadeira é fisiológica: menos cloro entrando, mais água livre quando indicado, e tratar a causa da acidose.",
            ],
          },
        ],
        summary: [
          {
            title: "Sinais e sintomas-chave",
            lines: [
              "Taquipneia compensatória, piora da acidose, fraqueza e disfunção renal associada.",
              "Olhar o conjunto com bicarbonato, sódio e volume administrado nas últimas horas.",
            ],
          },
        ],
      };
    }
  }
}

export default function ElectrolyteCalculatorScreen({ onVoltar }: { onVoltar?: () => void }) {
  const tr = useTr();
  useWindowDimensions();
  const moduleGuidelines = getModuleGuidelinesStatus("correcoes_eletroliticas");
  const guidelineStatus = moduleGuidelines.length
    ? moduleGuidelines[0]
    : getAppGuidelinesStatus().guidelineStatuses[0] ?? null;
  const [electrolyte, setElectrolyte] = useState<ElectrolyteKey>("sodium");
  const [isHypo, setIsHypo] = useState(true);
  const [sex, setSex] = useState<Sex>("male");
  const [access, setAccess] = useState<Access>("peripheral");
  const [weightKg, setWeightKg] = useState("");
  const [current, setCurrent] = useState("");
  const [glucose, setGlucose] = useState("");
  const [albumin, setAlbumin] = useState("");
  // ⚠️ O CAMPO PERGUNTA QUAL CÁLCIO. Antes ele pedia "Cálcio (mg/dL)" e a tela
  // decidia sozinha — com dois cálcios diferentes em dois lugares.
  const [tipoDeCalcio, setTipoDeCalcio] = useState<TipoDeCalcio>("total");
  // ⚠️ SINTOMA PRIMEIRO, NÚMERO DEPOIS — decisão do autor: "a presença de
  // manifestações clínicas relevantes deve prevalecer sobre uma classificação
  // exclusivamente numérica". `null` = ninguém respondeu ainda.
  const [temSintomaDeCalcio, setTemSintomaDeCalcio] = useState<boolean | null>(null);
  // ⚠️ EIXO `contexto_clinico`: o mesmo magnésio é achado esperado numa gestante
  // em sulfato e é hipermagnesemia a investigar fora dela.
  const [contextoClinico, setContextoClinico] = useState<ContextoClinico | null>(null);
  const [bagVolumeMl, setBagVolumeMl] = useState("");
  const [infusionHours, setInfusionHours] = useState("");
  const [phosphateSalt, setPhosphateSalt] = useState<PhosphateSalt>("potassium");
  const [currentUnit, setCurrentUnit] = useState<ElectrolyteUnit>(getDefaultUnit("sodium"));
  const [magnesiumCurrent, setMagnesiumCurrent] = useState("");
  const [magnesiumUnit, setMagnesiumUnit] = useState<ElectrolyteUnit>("mg/dL");
  const [potassiumCurrent, setPotassiumCurrent] = useState("");
  const [bicarbonate, setBicarbonate] = useState("");
  const [renalDysfunction, setRenalDysfunction] = useState(false);
  const [ecgChanges, setEcgChanges] = useState(false);
  // A busca e o campo "outro valor" saíram da interface junto com a lista — a
  // barra cobre a faixa inteira. Os estados continuam apenas porque
  // applyPickerValue os limpa ao fechar; some com eles quando essa função for
  // simplificada.
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(0);

  const electrolyteMeta = ELECTROLYTES.find((item) => item.key === electrolyte)!;
  const disorder = isHypo ? electrolyteMeta.hypo : electrolyteMeta.hyper;
  const parsedCurrent = normalizeElectrolyteValue(current, electrolyte, currentUnit);
  const automaticTarget = deriveAutomaticTarget(disorder, parsedCurrent);
  const automaticTargetDisplay =
    automaticTarget != null ? formatElectrolyteForUnit(automaticTarget, electrolyte, currentUnit, currentUnit === "mg/dL" ? 1 : 1) : "";
  const automaticPlannedVolumeL = calculateAutomaticPlannedVolumeL({
    disorder,
    weightKg: parseNumber(weightKg),
    current: parsedCurrent,
    sex,
    elderly: false,
    target: automaticTarget,
  });
  // ⚠️ UM CÁLCIO SÓ, para gravidade e para dose. `calcioParaClassificar` devolve
  // null quando não há valor utilizável (iônico sem cortes definidos), e a tela
  // diz o que falta em vez de classificar pelo número errado.
  const ehCalcio = disorder === "hypocalcemia" || disorder === "hypercalcemia";
  const leituraDoCalcio = ehCalcio
    ? calcioParaClassificar({ tipo: tipoDeCalcio, valor: parsedCurrent, albumina: parseNumber(albumin) })
    : { valor: parsedCurrent, aviso: null };
  // ⚠️ AS DUAS UNIDADES NA TELA (decisão do autor): quem digita em mg/dL vê
  // onde o corte da fonte cai. O texto é SAÍDA — a comparação nunca o usa.
  const ehMagnesio = disorder === "hypermagnesemia" || disorder === "hypomagnesemia";
  const degrauAtual = ehCalcio || ehMagnesio || disorder === "hypophosphatemia"
    ? degrauDeGravidade(
        disorder,
        leituraDoCalcio.valor,
        ecgChanges,
        disorder === "hypocalcemia" ? temSintomaDeCalcio : null,
        ehCalcio ? (tipoDeCalcio === "ionico" ? "ionico" : "total") : null
      )
    : null;
  const corteExibido = degrauAtual ? corteDoDegrau(disorder, degrauAtual) : null;
  const condutaDoDegrau = degrauAtual?.conduta?.texto ?? null;
  const severitySummary = getSeveritySummary(
    disorder,
    leituraDoCalcio.valor,
    ecgChanges,
    disorder === "hypocalcemia" ? temSintomaDeCalcio : null,
    // ⚠️ O ENSAIO VIAJA JUNTO: é ele que impede o corte do total/ajustado de
    // alcançar um valor de ionizado.
    ehCalcio ? (tipoDeCalcio === "ionico" ? "ionico" : "total") : null,
    contextoClinico
  );
  const hypernatremiaVolumeSummary = useMemo(() => {
    if (disorder !== "hypernatremia") return null;

    const weight = parseNumber(weightKg);
    const currentNa = parsedCurrent;
    const targetNa = automaticTarget;

    if (weight == null || currentNa == null || targetNa == null) {
      return {
        helper:
          "Esse número representa água livre equivalente. O volume infundido e o efeito no sódio dependem da solução escolhida.",
        scenario: "Preencha peso e sódio para comparar SG 5%, solução tipo SF 0,45% e mistura customizada.",
      };
    }

    const totalBodyWater = tbw(weight, sex, false);
    const freeWaterL = automaticPlannedVolumeL;
    const dropNeeded = Math.max(currentNa - targetNa, 0);
    const deltaPerLD5W = (0 - currentNa) / (totalBodyWater + 1);
    const deltaPerLHalfHalf = (77 - currentNa) / (totalBodyWater + 1);
    const litersD5W = deltaPerLD5W < 0 ? dropNeeded / Math.abs(deltaPerLD5W) : null;
    const litersHalfHalf = deltaPerLHalfHalf < 0 ? dropNeeded / Math.abs(deltaPerLHalfHalf) : null;

    const scenario =
      freeWaterL != null
        ? trf(tr, "Com agua livre EV, o volume infundido fica proximo do valor mostrado: ~ {0} L.", [fmt(freeWaterL, 2)])
        : litersHalfHalf != null
          ? trf(tr, "Com solucao hipotonicamente efetiva, o volume total para a mesma meta tende a ser maior: ~ {0} L no total.", [fmt(litersHalfHalf, 2)])
          : "Se entrar agua por sonda/oral, esse valor vira meta total de agua livre e o volume EV precisa ser compensado."

    return {
      helper: "Esse número representa água livre equivalente, não um volume universal válido para qualquer fluido.",
      scenario,
      litersD5W,
      litersHalfHalf,
    };
  }, [automaticPlannedVolumeL, automaticTarget, disorder, parsedCurrent, sex, weightKg]);

  function applyDisorderPreset(nextElectrolyte: ElectrolyteKey, nextIsHypo: boolean) {
    setElectrolyte(nextElectrolyte);
    setIsHypo(nextIsHypo);
    setWeightKg("");
    setCurrent("");
    setGlucose("");
    setAlbumin("");
    setBagVolumeMl("");
    setInfusionHours("");
    setCurrentUnit(getDefaultUnit(nextElectrolyte));
    setMagnesiumCurrent("");
    setMagnesiumUnit("mg/dL");
    setPotassiumCurrent("");
    setBicarbonate("");
    setRenalDysfunction(false);
    setEcgChanges(false);
    setAccess("peripheral");
    setPhosphateSalt("potassium");

    if (nextElectrolyte === "sodium" && nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "sodium" && !nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "potassium" && nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "potassium" && !nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "calcium" && nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "calcium" && !nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "magnesium" && nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "magnesium" && !nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "phosphate" && nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "phosphate" && !nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "chloride" && nextIsHypo) {
      return;
    }
    if (nextElectrolyte === "chloride" && !nextIsHypo) {
      return;
    }
  }

  function handleCurrentUnitChange(nextUnit: ElectrolyteUnit) {
    if (current.trim()) {
      const canonical = normalizeElectrolyteValue(current, electrolyte, currentUnit);
      if (canonical != null) {
        setCurrent(formatElectrolyteForUnit(canonical, electrolyte, nextUnit, nextUnit === "mg/dL" ? 1 : 2));
      }
    }
    setCurrentUnit(nextUnit);
  }

  function handleMagnesiumUnitChange(nextUnit: ElectrolyteUnit) {
    if (magnesiumCurrent.trim()) {
      const canonical = normalizeElectrolyteValue(magnesiumCurrent, "magnesium", magnesiumUnit);
      if (canonical != null) {
        setMagnesiumCurrent(formatElectrolyteForUnit(canonical, "magnesium", nextUnit, nextUnit === "mg/dL" ? 1 : 2));
      }
    }
    setMagnesiumUnit(nextUnit);
  }

  useEffect(() => {
    const inferred = detectDisorderFromCurrent(electrolyte, parseNumber(current));
    if (inferred == null || inferred === isHypo) return;
    setIsHypo(inferred);
  }, [current, electrolyte, isHypo]);

  useEffect(() => {
    setSelectedStrategyIndex(0);
  }, [electrolyte, isHypo, current]);

  const result = useMemo(
    () =>
      calculateResult(tr, {
        electrolyte,
        disorder,
        sex,
        elderly: false,
        access,
        weightKg: parseNumber(weightKg),
        current: parsedCurrent,
        target: automaticTarget,
        glucose: parseNumber(glucose),
        albumin: parseNumber(albumin),
        tipoDeCalcio,
        bagVolumeMl: parseNumber(bagVolumeMl),
        infusionHours: parseNumber(infusionHours),
        plannedVolumeL: automaticPlannedVolumeL,
        phosphateSalt,
        magnesiumCurrent: normalizeElectrolyteValue(magnesiumCurrent, "magnesium", magnesiumUnit),
        potassiumCurrent: parseNumber(potassiumCurrent),
        bicarbonate: parseNumber(bicarbonate),
        renalDysfunction,
        ecgChanges,
      }),
    [
      access,
      albumin,
      bagVolumeMl,
      disorder,
      ecgChanges,
      electrolyte,
      bicarbonate,
      glucose,
      infusionHours,
      magnesiumCurrent,
      magnesiumUnit,
      phosphateSalt,
      automaticPlannedVolumeL,
      potassiumCurrent,
      renalDysfunction,
      sex,
      weightKg,
      automaticTarget,
      parsedCurrent,
    ]
  );

  function renderPill(
    label: string,
    selected: boolean,
    onPress: () => void,
    tone: "primary" | "neutral" = "neutral"
  ) {
    return (
      <Pressable
        key={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          tone === "primary" && styles.pillPrimary,
          selected && styles.pillSelected,
          selected && tone === "primary" && styles.pillPrimarySelected,
          pressed && styles.pillPressed,
        ]}>
        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{tr(label)}</Text>
      </Pressable>
    );
  }

  function renderBlockLines(lines: string[], section: "solution" | "practical" | "reference") {
    const theme = getSectionTheme(section);
    return lines.map((line) => {
      const priority = isPriorityLine(line);
      return (
        <View
          key={line}
          style={[
            styles.lineCard,
            {
              backgroundColor: priority ? theme.lineAccentSoft : theme.lineBg,
              borderColor: priority ? theme.lineAccent : theme.lineBorder,
            },
          ]}>
          <View style={[styles.lineAccent, { backgroundColor: priority ? theme.lineAccent : theme.lineBorder }]} />
          <Text style={[styles.resultLine, priority && styles.resultLinePriority]}>{tr(line)}</Text>
        </View>
      );
    });
  }


  function applyPickerValue(field: PickerFieldId, value: string) {
    const normalized = value.trim();
    if (!normalized) return;

    switch (field) {
      case "weightKg":
        setWeightKg(normalized);
        break;
      case "current":
        setCurrent(normalized);
        break;
      case "glucose":
        setGlucose(normalized);
        break;
      case "albumin":
        setAlbumin(normalized);
        break;
      case "bagVolumeMl":
        setBagVolumeMl(normalized);
        break;
      case "infusionHours":
        setInfusionHours(normalized);
        break;
      case "magnesiumCurrent":
        setMagnesiumCurrent(normalized);
        break;
      case "potassiumCurrent":
        setPotassiumCurrent(normalized);
        break;
      case "bicarbonate":
        setBicarbonate(normalized);
        break;
    }

  }

  /** Mantido como apelido: a barra grava a cada arrasto, e não há mais modal. */

  /** Valor já escolhido, para a barra abrir onde o usuário parou. */
  function valorAtualDoPicker(field: PickerFieldId): string {
    switch (field) {
      case "weightKg": return weightKg;
      case "current": return current;
      case "glucose": return glucose;
      case "albumin": return albumin;
      case "bagVolumeMl": return bagVolumeMl;
      case "infusionHours": return infusionHours;
      case "magnesiumCurrent": return magnesiumCurrent;
      case "potassiumCurrent": return potassiumCurrent;
      case "bicarbonate": return bicarbonate;
    }
  }

  function getPickerLabel(field: PickerFieldId) {
    switch (field) {
      case "weightKg":
        return "Peso (kg)";
      case "current":
        return trf(tr, "Valor atual ({0})", [currentUnit]);
      case "glucose":
        return "Glicemia (mg/dL)";
      case "albumin":
        return "Albumina (g/dL)";
      case "bagVolumeMl":
        return "Bolsa final (mL)";
      case "infusionHours":
        return "Tempo da infusão (h)";
      case "magnesiumCurrent":
        return trf(tr, "Magnésio atual ({0})", [magnesiumUnit]);
      case "potassiumCurrent":
        return "Potássio atual (mEq/L)";
      case "bicarbonate":
        return "Bicarbonato (mEq/L)";
    }
  }


  /**
   * Campo numérico — BARRA INLINE, no padrão canônico da árvore de decisão.
   *
   * ── O DEFEITO QUE ORIGINOU (2026-08-16) ───────────────────────────────────
   *
   * Aqui o campo era uma CAIXA que abria um MODAL, e a barra ficava lá dentro.
   * O componente certo já estava em uso — só estava a um toque de distância,
   * num app cuja premissa é a beira do leito. Decisão do autor: o modal morre.
   *
   * ⚠️ E EMPILHADO, NÃO EM LINHA. Nas Calculadoras Clínicas o mesmo
   * NumericStepper aparece esmagado porque o rótulo divide a linha com ele
   * (`fieldRow: row` + `fieldLabel: flex:1`), e o slider fica com largura
   * residual. Rótulo em cima, controle ocupando a largura inteira — como na
   * árvore, que é onde ele funciona.
   */
  /**
   * ⚠️ `unidade` É OBRIGATÓRIA, e o rótulo é DERIVADO dela (R-119).
   *
   * Antes o nome vinha pronto — `input("Peso (kg)", …)` — e a unidade morava
   * dentro do texto: traduzível, ilegível para qualquer trava, e capaz de virar
   * "(lb)" numa tradução sem que nada percebesse.
   */
  function input(
    nome: string,
    unidade: UnidadeDeCampo,
    value: string,
    field: PickerFieldId,
    placeholder?: string
  ) {
    const label = rotuloComUnidade(nome, unidade);
    const faixa = faixaDoPicker(field, electrolyte, currentUnit, magnesiumUnit);
    const numero = Number(String(value).replace(",", "."));
    const temValor = value !== "" && Number.isFinite(numero);
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{tr(label)}</Text>
        <NumericStepper
          valor={
            temValor
              ? numero
              : // Sem valor escolhido o controle parte do MEIO da faixa, não de
                // um número que pareça sugestão clínica — e só grava quando o
                // médico arrasta. Mesma regra da árvore.
                Number(((faixa.min + faixa.max) / 2).toFixed(faixa.casas))
          }
          onChange={(n) => applyPickerValue(field, fmt(n, faixa.casas))}
          // Confirmar é GRAVAR o valor corrente: quem solta a barra no ponto de
          // partida informou aquele valor, e a tela precisa parar de dizer que
          // não sabe.
          onConfirmar={(n) => applyPickerValue(field, fmt(n, faixa.casas))}
          min={faixa.min}
          max={faixa.max}
          passo={faixa.passo}
          casas={faixa.casas}
          testID={`slider-${field}`}
        />
        {/* ⚠️ O NÚMERO GRANDE NÃO É UM VALOR MEDIDO enquanto ninguém arrastou.
            A barra precisa partir de algum ponto, e o meio da faixa é o menos
            sugestivo — mas na tela ele aparece do mesmo tamanho de um valor
            informado. Dizer isso é a mesma regra do peso não confirmado nas
            Vasoativas: o app não finge que mediu o que não mediu. */}
        {!temValor ? (
          <Text style={styles.inputAindaNaoInformado}>
            {tr("⚠️ Ainda NÃO informado — a barra parte do meio da faixa. Arraste ou use −/+ para registrar o valor do paciente.")}
          </Text>
        ) : null}
      </View>
    );
  }

  const showGlucose = disorder === "hyponatremia" || disorder === "hyperkalemia";
  // ⚠️ A ALBUMINA ACOMPANHA O CÁLCIO TOTAL — nos DOIS distúrbios de cálcio, e
  // não só na hipocalcemia: a hipercalcemia lê o mesmo corte no mesmo cálcio.
  const showAlbumin = (disorder === "hypocalcemia" || disorder === "hypercalcemia") && tipoDeCalcio === "total";
  const showAccess = disorder === "hypokalemia" || disorder === "hypophosphatemia";
  const showBag = disorder === "hypokalemia";
  const showHours = disorder === "hypokalemia";
  const showVolumePlan = disorder === "hypernatremia";
  const showPhosphateSalt = disorder === "hypophosphatemia";
  const showMagnesiumCurrent = disorder === "hypokalemia";
  const showPotassiumCurrent = disorder === "hypophosphatemia" || disorder === "hypochloremia";
  const showBicarbonate =
    disorder === "hypokalemia" ||
    disorder === "hyperkalemia" ||
    disorder === "hypophosphatemia" ||
    disorder === "hypochloremia" ||
    disorder === "hyperchloremia";
  const showRenalToggle =
    disorder === "hypernatremia" ||
    disorder === "hypokalemia" ||
    disorder === "hyperkalemia" ||
    disorder === "hypocalcemia" ||
    disorder === "hypercalcemia" ||
    disorder === "hypomagnesemia" ||
    disorder === "hypermagnesemia" ||
    disorder === "hypophosphatemia" ||
    disorder === "hyperphosphatemia" ||
    disorder === "hypochloremia" ||
    disorder === "hyperchloremia";
  const showEcgToggle = disorder === "hyperkalemia";

  useEffect(() => {
    if (!showGlucose && glucose) setGlucose("");
    if (!showAlbumin && albumin) setAlbumin("");
    if (!showBag && bagVolumeMl) setBagVolumeMl("");
    if (!showHours && infusionHours) setInfusionHours("");
    if (!showMagnesiumCurrent && magnesiumCurrent) setMagnesiumCurrent("");
    if (!showPotassiumCurrent && potassiumCurrent) setPotassiumCurrent("");
    if (!showBicarbonate && bicarbonate) setBicarbonate("");
    if (!showPhosphateSalt && phosphateSalt !== "potassium") setPhosphateSalt("potassium");
    if (!showEcgToggle && ecgChanges) setEcgChanges(false);
  }, [
    showGlucose,
    showAlbumin,
    showBag,
    showHours,
    showVolumePlan,
    showMagnesiumCurrent,
    showPotassiumCurrent,
    showBicarbonate,
    showPhosphateSalt,
    showEcgToggle,
    glucose,
    albumin,
    tipoDeCalcio,
    bagVolumeMl,
    infusionHours,
    magnesiumCurrent,
    potassiumCurrent,
    bicarbonate,
    phosphateSalt,
    ecgChanges,
  ]);

  const leadLines = getInitialStrategyLines(disorder, result.headline);
  const displayMetrics = result.metrics.map((metric) => ({
    ...metric,
    label: getMetricLabel(metric.label),
  }));
  const selectedStrategy = result.strategy[selectedStrategyIndex] ?? null;
  const prepBlocks = result.practical;
  const referenceBlocks = result.summary;
  /**
   * ⚠️ A DISTINÇÃO ENTRE OS ÍONS JÁ EXISTIA NO DADO E MORRIA AQUI.
   *
   * `ELECTROLYTES` declara `glyph` (🧂 ⚡ …), `accent`, `soft` e `border` para
   * cada eletrólito desde sempre. A navegação passava só `icon` e `accent` — e
   * o `accent` o shell usava como COR DE TEXTO no item ativo (1,60:1), enquanto
   * o círculo mostrava o ÍNDICE: 1, 2, 3, 4, 5, 6.
   *
   * Numa lista de eletrólitos o índice não significa nada — a ordem é
   * arbitrária e ninguém decora que o potássio é "o 2". O que o médico procura
   * é o SÍMBOLO. Agora ele vai no círculo, com o acento como fundo, e o glifo
   * acompanha o rótulo.
   */
  const navigationItems = ELECTROLYTES.map((item) => ({
    id: item.key,
    icon: item.glyph,
    simbolo: item.icon,
    label: item.label,
    hint: `${tr(getDisorderLabel(item.hypo))} / ${tr(getDisorderLabel(item.hyper))}`,
    accent: item.accent,
  }));
  const heroMetrics = [
    { label: "Eletrólito", value: electrolyteMeta.label, accent: electrolyteMeta.accent },
    { label: "Distúrbio", value: tr(isHypo ? getDisorderLabel(electrolyteMeta.hypo) : getDisorderLabel(electrolyteMeta.hyper)), accent: isHypo ? "#1d4ed8" : "#b91c1c" },
    { label: "Classificação", value: severitySummary.label, accent: "#0f766e" },
    { label: "Status", value: guidelineStatus?.statusLabel ?? "Revisar", accent: guidelineStatus?.statusLabel === "Atualizado" ? "#047857" : "#b45309" },
  ];

  return (
    <View style={styles.screen}>
      {/* ⚠️ CABEÇALHO ÚNICO E COM SAÍDA — mesmo `Header` dos 19 módulos de fluxo,
          que na tela aparecem como « ← / Módulo · Passo N ». A rota não desenha
          mais cromado (I7), e esta tela era a única sem título PRÓPRIO nenhum:
          ficaria sem nome e sem caminho de volta ao hub.

          ⚠️ E ela foi FALSO NEGATIVO da minha medição por coordenada: o herói
          abaixo já mostrava o nome do módulo, mas sem borda inferior — o critério
          geométrico não o contou (R-83). O `eyebrow` do herói ainda repete o nome
          logo abaixo deste cabeçalho; é repetição de CONTEÚDO, não segundo
          cabeçalho, e está anotada como dívida em vez de editada em silêncio. */}
      <CalculatorScreenHeader
        title={tr("Correções eletrolíticas")}
        onBack={onVoltar}
      />
      <ModuleFlowLayout
        hero={
          <ModuleFlowHero
            eyebrow="Correções eletrolíticas"
            title={tr("Calculadora alinhada ao padrão dos módulos")}
            subtitle="Mesmo herói, mesma navegação e mesma hierarquia de leitura para reduzir a troca de contexto entre guias e calculadoras."
            badgeText={guidelineStatus?.statusLabel ?? "Revisar"}
            metrics={heroMetrics}
            progressLabel="Correção guiada"
            stepTitle={electrolyteMeta.label}
            hint="Selecione o eletrólito na lateral e siga o raciocínio clínico mantendo o mesmo padrão visual do app."
            compactMobile
          />
        }
        items={navigationItems}
        activeId={electrolyte}
        onSelect={(id) => applyDisorderPreset(id as ElectrolyteKey, true)}
        sidebarEyebrow="Navegação laboratorial"
        sidebarTitle="Eletrólitos"
        contentEyebrow="Calculadora"
        contentTitle={electrolyteMeta.label}
        contentHint={tr(severitySummary.signs)}
        contentBadgeText="Correção guiada">
        <ModuleFlowContent style={styles.mainScroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{tr("ESTRATÉGIA INICIAL")}</Text>
              <View style={styles.rowWrap}>
                {renderPill(getDisorderLabel(electrolyteMeta.hypo), isHypo, () => applyDisorderPreset(electrolyte, true))}
                {renderPill(getDisorderLabel(electrolyteMeta.hyper), !isHypo, () => applyDisorderPreset(electrolyte, false))}
              </View>
              <View style={styles.clinicalSummaryCard}>
                <Text style={styles.clinicalSummaryLabel}>{tr("Classificação atual")}</Text>
                <Text style={styles.clinicalSummaryValue}>{tr(severitySummary.label)}</Text>
                <Text style={styles.clinicalSummaryText}>{tr(severitySummary.signs)}</Text>
                {corteExibido ? (
                  <Text style={styles.clinicalSummaryText}>{trf(tr, "Corte desta faixa: {0}", [corteExibido])}</Text>
                ) : null}
                {/* ⚠️ CONDUTA EM LUGAR PRÓPRIO — não em `sinais`. A classificação
                    diz o que o caso É; isto diz o que muda a urgência. */}
                {/* ⚠️ BLOCO SEPARADO DA CLASSIFICAÇÃO, com "aproximadamente"
                    visível: são números que ORIENTAM a leitura da tendência e
                    NÃO decidem o degrau (R-120). Misturá-los com o rótulo os
                    transformaria em corte aos olhos de quem lê. */}
                {degrauAtual?.referencias?.length ? (
                  <>
                    <Text style={styles.clinicalSummaryLabel}>
                      {tr("Referência de progressão — orienta, não classifica")}
                    </Text>
                    {degrauAtual.referencias.map((r) => (
                      <Text key={r.manifestacao} style={styles.referralLine}>
                        • {tr(r.manifestacao)}: {textoDaReferencia(r)}
                      </Text>
                    ))}
                    <Text style={styles.referralLine}>
                      {tr("⚠️ Faixas APROXIMADAS: não são limites absolutos nem recomendação graduada. A decisão considera sintomas, função renal e a TENDÊNCIA da concentração.")}
                    </Text>
                  </>
                ) : null}
                {condutaDoDegrau ? (
                  <Text style={styles.referralLine}>{tr(condutaDoDegrau)}</Text>
                ) : null}
                {leituraDoCalcio.aviso ? (
                  <Text style={styles.clinicalSummaryText}>{tr(leituraDoCalcio.aviso)}</Text>
                ) : null}
              </View>
              {leadLines.map((line) => (
                <Text key={line} style={styles.referralLine}>• {line}</Text>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>{tr("PACIENTE")}</Text>
              <View style={styles.formGrid}>
                {input("Peso", "kg", weightKg, "weightKg", "70")}
                {input(tr("Valor atual"), currentUnit as UnidadeDeCampo, current, "current", "Selecionar")}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{tr("Meta / alvo")}</Text>
                  <View style={[styles.inputPicker, styles.inputPickerLocked]}>
                    <Text style={styles.inputPickerValue}>
                      {automaticTargetDisplay ? `${automaticTargetDisplay} ${currentUnit}` : "Automático"}
                    </Text>
                  </View>
                </View>
                {showGlucose ? input("Glicemia", "mg/dL", glucose, "glucose", "opcional") : null}
                {ehMagnesio ? (
                  <View style={styles.inputGroup}>
                    {/* ⚠️ O CONTEXTO VEM ANTES DO NÚMERO: ele muda a leitura do
                        mesmo valor, e é por isso que o corte por número saiu. */}
                    <Text style={styles.inputLabel}>{tr(CONTEXTO_PERGUNTA)}</Text>
                    <View style={styles.rowWrap}>
                      {CONTEXTO_OPCOES.map((o) =>
                        renderPill(tr(o.rotulo), contextoClinico === o.valor, () => setContextoClinico(o.valor))
                      )}
                      {renderPill(tr("Não sei"), contextoClinico === null, () => setContextoClinico(null))}
                    </View>
                    {contextoClinico === null ? (
                      <Text style={styles.referralLine}>{tr(CONTEXTO_NAO_SEI)}</Text>
                    ) : null}
                  </View>
                ) : null}
                {disorder === "hypocalcemia" ? (
                  <View style={styles.inputGroup}>
                    {/* ⚠️ VEM ANTES DO NÚMERO, de propósito: é o critério que decide. */}
                    <Text style={styles.inputLabel}>{tr(SINTOMATICO_PERGUNTA)}</Text>
                    <Text style={styles.referralLine}>{tr(SINTOMATICO_CONDICAO)}</Text>
                    <View style={styles.rowWrap}>
                      {renderPill(tr("Sim"), temSintomaDeCalcio === true, () => setTemSintomaDeCalcio(true))}
                      {renderPill(tr("Não"), temSintomaDeCalcio === false, () => setTemSintomaDeCalcio(false))}
                      {renderPill(tr("Quais são?"), temSintomaDeCalcio === null, () => setTemSintomaDeCalcio(null))}
                    </View>
                    {temSintomaDeCalcio === null ? (
                      <>
                        <Text style={styles.inputLabel}>{tr("Definem hipocalcemia sintomática")}</Text>
                        {NUCLEO_SINTOMATICO.map((c) =>
                          c.tipo === "clinico" ? (
                            <Text key={c.texto} style={styles.referralLine}>• {tr(c.texto)}</Text>
                          ) : null
                        )}
                        <Text style={styles.inputLabel}>{tr("Aparecem, mas não definem")}</Text>
                        {APOIAM_SINTOMATICO.map((c) =>
                          c.tipo === "clinico" ? (
                            <Text key={c.texto} style={styles.referralLine}>• {tr(c.texto)}</Text>
                          ) : null
                        )}
                        <Text style={styles.inputLabel}>{tr("Possíveis na hipocalcemia grave — exigem compatibilidade")}</Text>
                        <Text style={styles.referralLine}>
                          {tr("⚠️ ALTAMENTE INESPECÍFICAS no paciente crítico: lembre-as quando o cálcio JÁ estiver baixo. Nunca concluem hipocalcemia sozinhas.")}
                        </Text>
                        {EXIGEM_COMPATIBILIDADE.map((c) =>
                          c.tipo === "clinico" ? (
                            <Text key={c.texto} style={styles.referralLine}>• {tr(c.texto)}</Text>
                          ) : null
                        )}
                      </>
                    ) : null}
                  </View>
                ) : null}
                {ehCalcio ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{tr(CALCIO_PERGUNTA)}</Text>
                    <View style={styles.rowWrap}>
                      {CALCIO_OPCOES.map((o) =>
                        renderPill(tr(o.rotulo), tipoDeCalcio === o.valor, () => setTipoDeCalcio(o.valor))
                      )}
                    </View>
                  </View>
                ) : null}
                {ehCalcio && tipoDeCalcio === "ionico"
                  ? IONIZADO_NOTAS.map((linha) => (
                      <Text key={linha} style={styles.referralLine}>• {tr(linha)}</Text>
                    ))
                  : null}
                {ehCalcio && tipoDeCalcio === "nao_sei"
                  ? CALCIO_ONDE_ACHAR.map((linha) => (
                      <Text key={linha} style={styles.referralLine}>• {tr(linha)}</Text>
                    ))
                  : null}
                {showAlbumin ? input("Albumina", "g/dL", albumin, "albumin", "Selecionar") : null}
                {showBag ? input("Bolsa final", "mL", bagVolumeMl, "bagVolumeMl", "Selecionar") : null}
                {showHours ? input("Tempo da infusão", "h", infusionHours, "infusionHours", "Selecionar") : null}
                {showMagnesiumCurrent ? input(tr("Magnésio atual"), magnesiumUnit as UnidadeDeCampo, magnesiumCurrent, "magnesiumCurrent", "se disponível") : null}
                {showVolumePlan ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{tr("Água livre alvo (L)")}</Text>
                    <View style={[styles.inputPicker, styles.inputPickerLocked]}>
                      <Text style={styles.inputPickerValue}>
                        {automaticPlannedVolumeL != null ? fmt(automaticPlannedVolumeL, 2) : "Automático"}
                      </Text>
                    </View>
                    {hypernatremiaVolumeSummary ? (
                      <View style={styles.inlineInfoCard}>
                        <Text style={styles.inlineInfoText}>{tr(hypernatremiaVolumeSummary.helper)}</Text>
                        <Text style={styles.inlineInfoTextStrong}>{tr(hypernatremiaVolumeSummary.scenario)}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
                {showPotassiumCurrent ? input("Potássio atual", "mEq/L", potassiumCurrent, "potassiumCurrent", "se relevante") : null}
                {showBicarbonate ? input("Bicarbonato", "mEq/L", bicarbonate, "bicarbonate", "se disponível") : null}
              </View>

              <Text style={styles.fieldSectionLabel}>{tr("Unidade do eletrólito")}</Text>
              <View style={styles.rowWrap}>
                {getAllowedUnits(electrolyte).map((unit) =>
                  renderPill(unit, currentUnit === unit, () => handleCurrentUnitChange(unit))
                )}
              </View>

              {showMagnesiumCurrent ? (
                <>
                  <Text style={styles.fieldSectionLabel}>{tr("Unidade do magnésio")}</Text>
                  <View style={styles.rowWrap}>
                    {getAllowedUnits("magnesium").map((unit) =>
                      renderPill(unit, magnesiumUnit === unit, () => handleMagnesiumUnitChange(unit))
                    )}
                  </View>
                </>
              ) : null}

              <Text style={styles.fieldSectionLabel}>{tr("Sexo e água corporal")}</Text>
              <View style={styles.rowWrap}>
                {renderPill("Masculino", sex === "male", () => setSex("male"))}
                {renderPill("Feminino", sex === "female", () => setSex("female"))}
              </View>

              {showAccess ? (
                <>
                  <Text style={styles.fieldSectionLabel}>{tr("Acesso")}</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Periférico", access === "peripheral", () => setAccess("peripheral"))}
                    {renderPill("Central", access === "central", () => setAccess("central"))}
                  </View>
                </>
              ) : null}

              {showRenalToggle ? (
                <>
                  <Text style={styles.fieldSectionLabel}>{tr("Função renal")}</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Sem disfunção", !renalDysfunction, () => setRenalDysfunction(false))}
                    {renderPill("Com disfunção", renalDysfunction, () => setRenalDysfunction(true))}
                  </View>
                </>
              ) : null}

              {showPhosphateSalt ? (
                <>
                  <Text style={styles.fieldSectionLabel}>{tr("Sal fosfatado")}</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Fosfato de K", phosphateSalt === "potassium", () => setPhosphateSalt("potassium"))}
                    {renderPill("Fosfato de Na", phosphateSalt === "sodium", () => setPhosphateSalt("sodium"))}
                  </View>
                </>
              ) : null}

              {showEcgToggle ? (
                <>
                  <Text style={styles.fieldSectionLabel}>{tr("ECG")}</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Sem alteração", !ecgChanges, () => setEcgChanges(false))}
                    {renderPill("Com alteração", ecgChanges, () => setEcgChanges(true))}
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>{tr("CÁLCULO RÁPIDO")}</Text>
              <Text style={styles.headline}>{tr(result.headline)}</Text>
              <View style={styles.metricGrid}>
                {displayMetrics.map((metric) => (
                  <View key={`${tr(metric.label)}-${tr(metric.value)}`} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{tr(metric.label)}</Text>
                    <Text style={styles.metricValue}>{tr(metric.value)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {result.strategy.length > 0 && (
              <View
                style={[
                  styles.card,
                  styles.resultCard,
                  {
                    backgroundColor: getSectionTheme("solution").cardBg,
                    borderColor: getSectionTheme("solution").cardBorder,
                  },
                ]}>
                <Text style={[styles.cardLabel, { color: getSectionTheme("solution").header }]}>{tr("SOLUÇÃO DE INFUSÃO")}</Text>
                <View style={styles.rowWrap}>
                  {result.strategy.map((block, index) =>
                    renderPill(
                      block.title.replace(/^Fase \d+: /, "").replace(/^Cenário \d+: /, ""),
                      selectedStrategyIndex === index,
                      () => setSelectedStrategyIndex(index),
                      index === 0 ? "primary" : "neutral"
                    )
                  )}
                </View>
                {selectedStrategy ? (
                  <View style={[styles.blockGroup, styles.solutionBlock]}>
                    <Text style={[styles.blockTitle, { color: getSectionTheme("solution").title }]}>{tr(getBlockTitle(selectedStrategy.title))}</Text>
                    {renderBlockLines(selectedStrategy.lines, "solution")}
                  </View>
                ) : null}
              </View>
            )}

            {prepBlocks.length > 0 && (
              <View
                style={[
                  styles.card,
                  styles.resultCard,
                  {
                    backgroundColor: getSectionTheme("practical").cardBg,
                    borderColor: getSectionTheme("practical").cardBorder,
                  },
                ]}>
                <Text style={[styles.cardLabel, { color: getSectionTheme("practical").header }]}>{tr("MEDIDAS GERAIS E CONTROLES")}</Text>
                {prepBlocks.map((block) => (
                  <View key={block.title} style={styles.blockGroup}>
                    <Text style={[styles.blockTitle, { color: getSectionTheme("practical").title }]}>{tr(getBlockTitle(block.title))}</Text>
                    {renderBlockLines(block.lines, "practical")}
                  </View>
                ))}
              </View>
            )}

            {referenceBlocks.length > 0 && (
              <View
                style={[
                  styles.card,
                  styles.resultCard,
                  {
                    backgroundColor: getSectionTheme("reference").cardBg,
                    borderColor: getSectionTheme("reference").cardBorder,
                  },
                ]}>
                <Text style={[styles.cardLabel, { color: getSectionTheme("reference").header }]}>{tr("INFORMAÇÕES COMPLEMENTARES")}</Text>
                {referenceBlocks.map((block) => (
                  <View key={block.title} style={styles.blockGroup}>
                    <Text style={[styles.blockTitle, { color: getSectionTheme("reference").title }]}>{tr(getBlockTitle(block.title))}</Text>
                    {renderBlockLines(block.lines, "reference")}
                  </View>
                ))}
              </View>
            )}
        </ModuleFlowContent>
      </ModuleFlowLayout>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#292e38" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: "#14532d",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(77,154,255,0.16)",
  },
  headerTitle: { flex: 1, color: "#f1f5f9", fontSize: 20, fontWeight: "800" },
  versionHint: { fontSize: 11, fontWeight: "700", maxWidth: "42%" },
  versionWarn: { color: "#fbbf24" },
  versionAlert: { color: "#fca5a5" },
  body: {
    flex: 1,
    flexDirection: "row",
    gap: 14,
    width: "100%",
    maxWidth: 1120,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  sidebar: {
    width: 104,
    backgroundColor: "#383e4a",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#565e6c",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  sidebarInner: { paddingVertical: 12, paddingHorizontal: 8, gap: 8 },
  sideItem: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 6, borderRadius: 16, marginHorizontal: 0 },
  sideItemActive: { backgroundColor: "#383e4a", borderWidth: 1, borderColor: "#565e6c", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  sideEmoji: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  sideName: { fontSize: 9, fontWeight: "700", color: "#aab6c6", textAlign: "center", marginTop: 5, lineHeight: 12 },
  sideNameActive: { color: "#aab6c6" },
  mainScroll: { flex: 1, minHeight: 0, backgroundColor: "transparent" },
  scroll: { flexGrow: 1, padding: 16, gap: 14, paddingBottom: 28, width: "100%" },
  card: { backgroundColor: "#383e4a", borderRadius: 24, padding: 16, gap: 12, borderWidth: 1, borderColor: "#565e6c", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  cardLabel: { fontSize: 10, fontWeight: "800", color: "#aab6c6", letterSpacing: 1 },
  referralLine: { fontSize: 13, color: "#aab6c6", lineHeight: 19 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#565e6c",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#383e4a",
   minHeight: 44, justifyContent: "center" },
  pillPrimary: {
    backgroundColor: "rgba(77,154,255,0.15)",
  },
  pillSelected: {
    backgroundColor: "#1e6fd9",
    borderColor: "#7fb3ff",
  },
  pillPrimarySelected: {
    backgroundColor: "#1e6fd9",
    borderColor: "#7fb3ff",
  },
  pillPressed: {
    opacity: 0.88,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#aab6c6",
  },
  pillTextSelected: {
    color: "#f1f5f9",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  /**
   * ⚠️ LARGURA INTEIRA, e o motivo é medido, não estético.
   *
   * Este campo era `flexBasis: 48%` — duas colunas —, o que servia para a
   * CAIXA que existia antes. Com a barra no lugar dela, 48% de 375 px deixa
   * ~165 px, e os botões −/+ (44 px cada, alvo mínimo de toque) comem quase
   * tudo: sobra uma bolinha, que é exatamente o defeito das Calculadoras
   * Clínicas visto na tela (lá a causa é o rótulo em `flex: 1` na mesma linha;
   * aqui era a coluna).
   *
   * Empilhado e inteiro, como na árvore de decisão — que é onde o mesmo
   * componente funciona.
   */
  inputGroup: {
    flexBasis: "100%",
    gap: 6,
  },
  inputAindaNaoInformado: { fontSize: 11.5, lineHeight: 16, color: "#aab6c6", fontWeight: "600" },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#aab6c6",
  },
  input: {
    borderWidth: 1,
    borderColor: "#565e6c",
    borderRadius: 18,
    backgroundColor: "#383e4a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#f1f5f9",
    fontWeight: "700",
  },
  inputPicker: {
    borderWidth: 1,
    borderColor: "#565e6c",
    borderRadius: 18,
    backgroundColor: "#383e4a",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  inputPickerLocked: {
    backgroundColor: "#383e4a",
  },
  inputPickerValue: {
    fontSize: 16,
    color: "#f1f5f9",
    fontWeight: "700",
  },
  inlineInfoCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#383e4a",
    padding: 10,
    gap: 6,
  },
  inlineInfoText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#aab6c6",
    fontWeight: "600",
  },
  inlineInfoTextStrong: {
    fontSize: 12,
    lineHeight: 17,
    color: "#f1f5f9",
    fontWeight: "800",
  },
  fieldSectionLabel: { fontSize: 10, fontWeight: "800", color: "#aab6c6", letterSpacing: 1, marginTop: 2 },
  clinicalSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#383e4a",
    padding: 12,
    gap: 4,
  },
  clinicalSummaryLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#aab6c6",
  },
  clinicalSummaryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f1f5f9",
  },
  clinicalSummaryText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#aab6c6",
    fontWeight: "600",
  },
  headline: {
    fontSize: 16,
    lineHeight: 23,
    color: "#f1f5f9",
    fontWeight: "700",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flexBasis: "48%",
    minWidth: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#383e4a",
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#aab6c6",
  },
  metricValue: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: "#f1f5f9",
  },
  blockGroup: { gap: 6 },
  blockTitle: { fontSize: 15, fontWeight: "800", color: "#f1f5f9" },
  resultCard: {
    gap: 12,
  },
  solutionBlock: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "rgba(30,41,59,0.56)",
    padding: 12,
    gap: 8,
  },
  lineCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  lineAccent: {
    width: 5,
    borderRadius: 999,
    alignSelf: "stretch",
    minHeight: 24,
  },
  resultLine: {
    fontSize: 15,
    lineHeight: 22,
    color: "#aab6c6",
    fontWeight: "600",
    flex: 1,
  },
  resultLinePriority: {
    color: "#f1f5f9",
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "86%",
    backgroundColor: "#383e4a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#565e6c",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#f1f5f9",
  },
});
