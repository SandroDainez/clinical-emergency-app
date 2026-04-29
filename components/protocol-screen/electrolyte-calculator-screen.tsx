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

import { AppDesign } from "../../constants/app-design";
import { getAppGuidelinesStatus, getModuleGuidelinesStatus } from "../../lib/guidelines-version";
import { ModuleFlowContent, ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

type Sex = "male" | "female";
type CalciumMode = "total" | "ionized";
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

type SeverityTheme = {
  tone: "neutral" | "light" | "moderate" | "severe";
  text: string;
  border: string;
  background: string;
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
  | "ageYears"
  | "heightCm"
  | "current"
  | "glucose"
  | "albumin"
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

function estimateVolumeToTargetMl(args: {
  currentNa: number;
  targetNa: number;
  totalBodyWater: number;
  infusateNa: number;
}): number | null {
  const { currentNa, targetNa, totalBodyWater, infusateNa } = args;
  const deltaNeeded = currentNa - targetNa;
  if (deltaNeeded <= 0) return 0;

  const reductionPerLiter = (currentNa - infusateNa) / (totalBodyWater + 1);
  if (!Number.isFinite(reductionPerLiter) || reductionPerLiter <= 0) return null;

  return (deltaNeeded / reductionPerLiter) * 1000;
}

function getGlucoseCorrectedSodium(currentNa: number, glucose: number | null): number {
  return glucose && glucose > 100 ? currentNa + 1.6 * ((glucose - 100) / 100) : currentNa;
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

function getUnitConversionHint(electrolyte: ElectrolyteKey): string {
  switch (electrolyte) {
    case "sodium":
    case "potassium":
    case "chloride":
      return "Para esses íons, mEq/L e mmol/L são numericamente equivalentes na prática clínica.";
    case "calcium":
      return "Aqui o número muda ao trocar a unidade. O app converte automaticamente entre mg/dL e mmol/L.";
    case "magnesium":
      return "Aqui o número muda ao trocar a unidade. O app converte automaticamente entre mg/dL, mmol/L e mEq/L.";
    case "phosphate":
      return "Aqui o número muda ao trocar a unidade. O app converte automaticamente entre mg/dL e mmol/L.";
  }
}

function getMetricLabel(label: string): string {
  if (label === "TBW") return "Água corporal total";
  if (label === "HCO3-") return "Bicarbonato";
  if (label === "Na corrigido") return "Sódio corrigido";
  if (label === "Cl atual") return "Cloro atual";
  if (label === "Mg") return "Magnésio";
  if (label === "Mg atual") return "Magnésio atual";
  if (label === "Ca corrigido") return "Cálcio corrigido";
  return label;
}

function getCalciumModeLabel(mode: CalciumMode): string {
  return mode === "ionized" ? "Cálcio ionizado" : "Cálcio total";
}

const ADULT_IONIZED_CALCIUM_REFERENCE = {
  normalLowMmolL: 1.2,
  normalHighMmolL: 1.4,
  normalLowMgDl: 4.5,
  normalHighMgDl: 5.6,
  severeLowMgDl: 3.6,
  criticalHighMgDl: 6.5,
  pickerMinMgDl: 3.0,
  pickerMaxMgDl: 6.6,
} as const;

const ADULT_TOTAL_CALCIUM_REFERENCE = {
  normalLowMgDl: 8.5,
  normalHighMgDl: 10.5,
} as const;

const ADULT_SODIUM_REFERENCE = {
  normalLow: 135,
  normalHigh: 145,
} as const;

const ADULT_POTASSIUM_REFERENCE = {
  normalLow: 3.5,
  normalHigh: 5.2,
} as const;

const ADULT_MAGNESIUM_REFERENCE = {
  normalLowMgDl: 1.7,
  normalHighMgDl: 2.2,
} as const;

const ADULT_PHOSPHATE_REFERENCE = {
  normalLowMgDl: 2.8,
  normalHighMgDl: 4.5,
} as const;

const ADULT_CHLORIDE_REFERENCE = {
  normalLow: 98,
  normalHigh: 107,
} as const;

function getCalciumReferenceText(calciumMode: CalciumMode) {
  return calciumMode === "ionized"
    ? "Faixa adulta de referência do cálcio ionizado: 4,5-5,6 mg/dL (1,20-1,40 mmol/L)."
    : "Faixa adulta de referência do cálcio total: 8,5-10,5 mg/dL; interpretar albumina quando o valor não for ionizado.";
}

function getElectrolyteReferenceText(
  electrolyte: ElectrolyteKey,
  calciumMode: CalciumMode
): string {
  switch (electrolyte) {
    case "sodium":
      return "Faixa adulta de referência do sódio: 135-145 mEq/L.";
    case "potassium":
      return "Faixa adulta de referência do potássio: 3,5-5,2 mEq/L.";
    case "calcium":
      return getCalciumReferenceText(calciumMode);
    case "magnesium":
      return "Faixa adulta de referência do magnésio: 1,7-2,2 mg/dL.";
    case "phosphate":
      return "Faixa adulta de referência do fósforo: 2,8-4,5 mg/dL.";
    case "chloride":
      return "Faixa adulta de referência do cloro: 98-107 mEq/L.";
  }
}

function getBlockTitle(title: string): string {
  if (title === "Thresholds úteis") return "Pontos de gravidade";
  return title;
}

function expandClinicalText(text: string): string {
  return text
    .replace(/\bSF 0,9%\b/g, "solução de cloreto de sódio a 0,9%")
    .replace(/\bNaCl 3%\b/g, "solução de cloreto de sódio a 3%")
    .replace(/\bNaCl 20%\b/g, "solução de cloreto de sódio a 20%")
    .replace(/\bNaCl oral\b/g, "cloreto de sódio por via oral")
    .replace(/\bSG 5%\b/g, "solução de glicose a 5%")
    .replace(/\bD5W\b/g, "solução de glicose a 5% em água")
    .replace(/\bD5 0,45%\b/g, "solução de glicose a 5% com cloreto de sódio a 0,45%")
    .replace(/\bKCl 19,1%\b/g, "cloreto de potássio a 19,1%")
    .replace(/\bSIADH\b/g, "síndrome da secreção inapropriada de hormônio antidiurético")
    .replace(/\bEV\b/g, "intravenoso")
    .replace(/\bIV\b/g, "intravenoso")
    .replace(/\bECG\b/g, "eletrocardiograma")
    .replace(/\bUTI\b/g, "unidade de terapia intensiva")
    .replace(/\bCa x P\b/g, "produto cálcio-fósforo")
    .replace(/\bMg\b/g, "magnésio")
    .replace(/\bCa corrigido\b/g, "cálcio corrigido")
    .replace(/\bCa\b/g, "cálcio")
    .replace(/\bCl-\b/g, "cloro")
    .replace(/\bHCO3-\b/g, "bicarbonato");
}

function getDisplayBlockTitle(title: string): string {
  return expandClinicalText(getBlockTitle(title))
    .replace(/^Fase \d+: /, "")
    .replace(/^Cenário \d+: /, "")
    .replace(/^Opção \d+: /, "");
}

function getSeverityTheme(label: string): SeverityTheme {
  const normalized = label.trim().toLowerCase();

  if (/grave|emerg[eê]ncia|alto/.test(normalized)) {
    return {
      tone: "severe",
      text: "#b91c1c",
      border: "#fecaca",
      background: "#fef2f2",
    };
  }

  if (/^leve/.test(normalized)) {
    return {
      tone: "light",
      text: "#a16207",
      border: "#fde68a",
      background: "#fefce8",
    };
  }

  if (/moderad|importante/.test(normalized)) {
    return {
      tone: "moderate",
      text: "#c2410c",
      border: "#fdba74",
      background: "#fff7ed",
    };
  }

  return {
    tone: "neutral",
    text: "#0f766e",
    border: "#cfe0f7",
    background: "#eef4ff",
  };
}

function getSectionTheme(section: "solution" | "practical" | "reference") {
  switch (section) {
    case "solution":
      return {
        cardBg: "#eef4ff",
        cardBorder: "#bfd0ea",
        header: "#16356b",
        title: "#16356b",
        lineBg: "#ffffff",
        lineBorder: "#ccdbf3",
        lineAccent: "#2563eb",
        lineAccentSoft: "#dbeafe",
      };
    case "practical":
      return {
        cardBg: "#ecfdf5",
        cardBorder: "#a7f3d0",
        header: "#166534",
        title: "#166534",
        lineBg: "#ffffff",
        lineBorder: "#bbf7d0",
        lineAccent: "#059669",
        lineAccentSoft: "#d1fae5",
      };
    case "reference":
      return {
        cardBg: "#fff7ed",
        cardBorder: "#fdba74",
        header: "#9a3412",
        title: "#9a3412",
        lineBg: "#ffffff",
        lineBorder: "#fed7aa",
        lineAccent: "#ea580c",
        lineAccentSoft: "#ffedd5",
      };
  }
}

function isPriorityLine(line: string): boolean {
  return /(mL|mEq|h\b|min|bomba|bolus|controle|redosar|repetir|SF 0,9%|NaCl 3%|NaCl 20%|SG 5%|sonda|oral)/i.test(line);
}

function detectDisorderFromCurrent(
  electrolyte: ElectrolyteKey,
  current: number | null,
  calciumMode: CalciumMode
): boolean | null {
  if (current == null) return null;

  switch (electrolyte) {
    case "sodium":
      if (current < ADULT_SODIUM_REFERENCE.normalLow) return true;
      if (current > ADULT_SODIUM_REFERENCE.normalHigh) return false;
      return null;
    case "potassium":
      if (current < ADULT_POTASSIUM_REFERENCE.normalLow) return true;
      if (current > ADULT_POTASSIUM_REFERENCE.normalHigh) return false;
      return null;
    case "calcium":
      if (calciumMode === "ionized") {
        if (current < ADULT_IONIZED_CALCIUM_REFERENCE.normalLowMgDl) return true;
        if (current > ADULT_IONIZED_CALCIUM_REFERENCE.normalHighMgDl) return false;
        return null;
      }
      if (current < ADULT_TOTAL_CALCIUM_REFERENCE.normalLowMgDl) return true;
      if (current > ADULT_TOTAL_CALCIUM_REFERENCE.normalHighMgDl) return false;
      return null;
    case "magnesium":
      if (current < ADULT_MAGNESIUM_REFERENCE.normalLowMgDl) return true;
      if (current > ADULT_MAGNESIUM_REFERENCE.normalHighMgDl) return false;
      return null;
    case "phosphate":
      if (current < ADULT_PHOSPHATE_REFERENCE.normalLowMgDl) return true;
      if (current > ADULT_PHOSPHATE_REFERENCE.normalHighMgDl) return false;
      return null;
    case "chloride":
      if (current < ADULT_CHLORIDE_REFERENCE.normalLow) return true;
      if (current > ADULT_CHLORIDE_REFERENCE.normalHigh) return false;
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
      return ADULT_POTASSIUM_REFERENCE.normalHigh;
    case "hypocalcemia":
      return 8.2;
    case "hypercalcemia":
      return 11;
    case "hypomagnesemia":
      return ADULT_MAGNESIUM_REFERENCE.normalLowMgDl;
    case "hypermagnesemia":
      return ADULT_MAGNESIUM_REFERENCE.normalHighMgDl;
    case "hypophosphatemia":
      return ADULT_PHOSPHATE_REFERENCE.normalLowMgDl;
    case "hyperphosphatemia":
      return ADULT_PHOSPHATE_REFERENCE.normalHighMgDl;
    case "hypochloremia":
      return 103;
    case "hyperchloremia":
      return ADULT_CHLORIDE_REFERENCE.normalHigh;
  }
}

function deriveCalciumAutomaticTarget(disorder: DisorderKey, calciumMode: CalciumMode): number {
  if (disorder === "hypocalcemia") {
    return calciumMode === "ionized"
      ? ADULT_IONIZED_CALCIUM_REFERENCE.normalLowMgDl
      : ADULT_TOTAL_CALCIUM_REFERENCE.normalLowMgDl;
  }
  return calciumMode === "ionized"
    ? ADULT_IONIZED_CALCIUM_REFERENCE.normalHighMgDl
    : ADULT_TOTAL_CALCIUM_REFERENCE.normalHighMgDl;
}

function getEffectiveCalciumValue(
  current: number | null,
  calciumMode: CalciumMode,
  albumin: number | null
): number | null {
  if (current == null) return null;
  return calciumMode === "ionized" ? current : albumin != null ? current + 0.8 * (4 - albumin) : current;
}

function getSeveritySummary(
  disorder: DisorderKey,
  current: number | null,
  ecgChanges: boolean,
  calciumMode: CalciumMode,
  albumin: number | null
) {
  const effectiveCalcium = getEffectiveCalciumValue(current, calciumMode, albumin);
  const valueForSeverity =
    disorder === "hypocalcemia" || disorder === "hypercalcemia" ? effectiveCalcium : current;

  if (valueForSeverity == null) {
    return {
      label: "Aguardando valor",
      signs: "Preencha o valor atual para classificar gravidade e destacar sinais principais.",
    };
  }

  switch (disorder) {
    case "hyponatremia":
      if (valueForSeverity < 125) {
        return {
          label: "Grave",
          signs: "Maior risco de confusão, sonolência, convulsão e herniação iminente se queda for aguda.",
        };
      }
      if (valueForSeverity < 130) {
        return {
          label: "Moderada",
          signs: "Costuma cursar com náusea, cefaleia, mal-estar e alteração neurológica mais discreta.",
        };
      }
      return {
        label: "Leve",
        signs: "Costuma cursar com náusea, cefaleia, mal-estar e alteração neurológica mais discreta.",
      };
    case "hypernatremia":
      if (valueForSeverity > 155) {
        return {
          label: "Grave",
          signs: "Sede intensa, letargia, irritabilidade, mioclonia e convulsão; monitorização próxima.",
        };
      }
      if (valueForSeverity >= 151) {
        return {
          label: "Moderada",
          signs: "Sede, fraqueza, irritabilidade e desidratação são os achados mais comuns.",
        };
      }
      return {
        label: "Leve",
        signs: "Sede, fraqueza, irritabilidade e desidratação são os achados mais comuns.",
      };
    case "hypokalemia":
      if (valueForSeverity < 2.5) {
        return {
          label: "Grave",
          signs: "Fraqueza importante, íleo, paralisia, rabdomiólise e arritmia.",
        };
      }
      if (valueForSeverity < 3.0) {
        return {
          label: "Moderada",
          signs: "Cãibras, fraqueza, poliúria e palpitação são mais prováveis.",
        };
      }
      return {
        label: "Leve",
        signs: "Cãibras, fraqueza, poliúria e palpitação são mais prováveis.",
      };
    case "hyperkalemia":
      if (valueForSeverity > 6.5 || ecgChanges) {
        return {
          label: "Grave",
          signs: "Bradicardia, QRS alargado, bloqueios e risco de parada elétrica.",
        };
      }
      if (valueForSeverity >= 6.0) {
        return {
          label: "Moderada",
          signs: "Fraqueza, parestesias e progressão elétrica se o potássio continuar subindo.",
        };
      }
      return {
        label: "Leve",
        signs: "Fraqueza, parestesias e progressão elétrica se o potássio continuar subindo.",
      };
    case "hypocalcemia":
      if (
        (calciumMode === "ionized" &&
          valueForSeverity < ADULT_IONIZED_CALCIUM_REFERENCE.severeLowMgDl) ||
        (calciumMode === "total" && valueForSeverity < 7)
      ) {
        return {
          label: "Grave",
          signs: "Tetania, broncoespasmo, convulsão e QT longo.",
        };
      }
      if (
        (calciumMode === "ionized" &&
          valueForSeverity < ADULT_IONIZED_CALCIUM_REFERENCE.normalLowMgDl) ||
        (calciumMode === "total" && valueForSeverity < 8)
      ) {
        return {
          label: "Moderada",
          signs: "Parestesia perioral, câimbras e desconforto neuromuscular.",
        };
      }
      return {
        label: "Leve",
        signs: "Parestesia perioral, câimbras e desconforto neuromuscular.",
      };
    case "hypercalcemia":
      if (
        (calciumMode === "ionized" &&
          valueForSeverity >= ADULT_IONIZED_CALCIUM_REFERENCE.criticalHighMgDl) ||
        (calciumMode === "total" && valueForSeverity >= 14)
      ) {
        return {
          label: "Grave",
          signs: "Encefalopatia, desidratação importante, disfunção renal e maior chance de UTI.",
        };
      }
      if (
        (calciumMode === "ionized" &&
          valueForSeverity > ADULT_IONIZED_CALCIUM_REFERENCE.normalHighMgDl) ||
        (calciumMode === "total" && valueForSeverity >= 12)
      ) {
        return {
          label: "Moderada",
          signs: "Náusea, constipação, poliúria e fadiga predominam.",
        };
      }
      return {
        label: "Leve",
        signs: "Náusea, constipação, poliúria e fadiga predominam.",
      };
    case "hypomagnesemia":
      if (valueForSeverity < 1.0) {
        return {
          label: "Grave",
          signs: "QT longo, torsades, tremor, tetania e convulsão.",
        };
      }
      if (valueForSeverity < 1.2) {
        return {
          label: "Moderada",
          signs: "Tremor, fraqueza e piora de hipocalemia refratária.",
        };
      }
      return {
        label: "Leve",
        signs: "Tremor, fraqueza e piora de hipocalemia refratária.",
      };
    case "hypermagnesemia":
      if (valueForSeverity > 12) {
        return {
          label: "Grave",
          signs: "Hiporreflexia, sonolência, hipotensão e depressão respiratória.",
        };
      }
      if (valueForSeverity >= 7) {
        return {
          label: "Moderada",
          signs: "Rubor, letargia e reflexos diminuídos podem aparecer.",
        };
      }
      return {
        label: "Leve",
        signs: "Rubor, letargia e reflexos diminuídos podem aparecer.",
      };
    case "hypophosphatemia":
      if (valueForSeverity < 1) {
        return {
          label: "Grave",
          signs: "Fraqueza diafragmática, insuficiência respiratória, rabdomiólise e hemólise.",
        };
      }
      if (valueForSeverity < 2) {
        return {
          label: "Moderada",
          signs: "Fraqueza e queda de performance muscular são os sinais mais prováveis.",
        };
      }
      return {
        label: "Leve",
        signs: "Fraqueza e queda de performance muscular são os sinais mais prováveis.",
      };
    case "hyperphosphatemia":
      if (valueForSeverity >= 7) {
        return {
          label: "Grave",
          signs: "Pode coexistir com hipocalcemia sintomática, QT longo e maior risco de calcificação tecidual.",
        };
      }
      if (valueForSeverity >= 5.5) {
        return {
          label: "Moderada",
          signs: "Frequentemente assintomática, mas pode acompanhar hipocalcemia, prurido e disfunção renal.",
        };
      }
      return {
        label: "Leve",
        signs: "Muitas vezes o quadro aparece como hipocalcemia associada: parestesia, tetania e QT longo.",
      };
    case "hypochloremia":
      if (valueForSeverity < 90) {
        return {
          label: "Grave",
          signs: "Alcalose metabólica importante, fraqueza, hipoventilação e hipocalemia associada.",
        };
      }
      if (valueForSeverity < 95) {
        return {
          label: "Moderada",
          signs: "Pistas de alcalose metabólica: fraqueza, parestesia e hipocalemia associada.",
        };
      }
      return {
        label: "Leve",
        signs: "Pistas de alcalose metabólica: fraqueza, parestesia e hipocalemia associada.",
      };
    case "hyperchloremia":
      if (valueForSeverity >= 115) {
        return {
          label: "Grave",
          signs: "Acidose metabólica hiperclorêmica, taquipneia compensatória e piora renal mais provável.",
        };
      }
      if (valueForSeverity >= 110) {
        return {
          label: "Moderada",
          signs: "Carga de cloro acima do usual, com risco de acidose metabólica e piora renal.",
        };
      }
      return {
        label: "Leve",
        signs: "Carga de cloro acima do usual, com risco de acidose metabólica e piora renal.",
      };
  }
}

function buildPickerOptions(
  field: PickerFieldId,
  electrolyte: ElectrolyteKey,
  currentUnit: ElectrolyteUnit,
  magnesiumUnit: ElectrolyteUnit,
  calciumMode: CalciumMode
): string[] {
  const range = (start: number, end: number, step: number, decimals = 0) => {
    const values: string[] = [];
    for (let value = start; value <= end + 1e-9; value += step) {
      values.push(fmt(value, decimals));
    }
    return values;
  };

  const convertRangeFromCanonical = (
    start: number,
    end: number,
    step: number,
    canonicalElectrolyte: ElectrolyteKey,
    unit: ElectrolyteUnit,
    decimals = 1
  ) => {
    const values: string[] = [];
    for (let value = start; value <= end + 1e-9; value += step) {
      values.push(formatElectrolyteForUnit(value, canonicalElectrolyte, unit, decimals));
    }
    return [...new Set(values)];
  };

  switch (field) {
    case "weightKg":
      return range(40, 150, 5, 0);
    case "ageYears":
      return range(18, 100, 2, 0);
    case "heightCm":
      return range(140, 210, 5, 0);
    case "current":
      switch (electrolyte) {
        case "sodium":
          return range(110, 170, 2, 0);
        case "potassium":
          return range(2, 7, 0.2, 1);
        case "calcium":
          return calciumMode === "ionized"
            ? currentUnit === "mg/dL"
              ? range(
                  ADULT_IONIZED_CALCIUM_REFERENCE.pickerMinMgDl,
                  ADULT_IONIZED_CALCIUM_REFERENCE.pickerMaxMgDl,
                  0.1,
                  1
                )
              : convertRangeFromCanonical(
                  ADULT_IONIZED_CALCIUM_REFERENCE.pickerMinMgDl,
                  ADULT_IONIZED_CALCIUM_REFERENCE.pickerMaxMgDl,
                  0.1,
                  "calcium",
                  currentUnit,
                  2
                )
            : currentUnit === "mg/dL"
              ? range(6, 15, 0.5, 1)
              : convertRangeFromCanonical(6, 15, 0.5, "calcium", currentUnit, 2);
        case "magnesium":
          return currentUnit === "mg/dL"
            ? range(0.8, 6, 0.2, 1)
            : convertRangeFromCanonical(0.8, 6, 0.2, "magnesium", currentUnit, 2);
        case "phosphate":
          return currentUnit === "mg/dL"
            ? range(0.5, 8, 0.5, 1)
            : convertRangeFromCanonical(0.5, 8, 0.5, "phosphate", currentUnit, 2);
        case "chloride":
          return range(80, 120, 2, 0);
      }
    case "glucose":
      return range(60, 500, 20, 0);
    case "albumin":
      return range(2, 5, 0.5, 1);
    case "magnesiumCurrent":
      return magnesiumUnit === "mg/dL"
        ? range(1, 3, 0.2, 1)
        : convertRangeFromCanonical(1, 3, 0.2, "magnesium", magnesiumUnit, 2);
    case "potassiumCurrent":
      return range(2.5, 6, 0.5, 1);
    case "bicarbonate":
      return range(8, 40, 2, 0);
  }
}

function getInitialStrategyLines(disorder: DisorderKey, headline: string): string[] {
  switch (disorder) {
    case "hyponatremia":
      return [
        "Se houver neurogravidade, a prioridade é resgate com solução hipertônica e monitorização seriada.",
        "Sem neurogravidade, a conduta deve seguir o perfil volêmico e a causa de base.",
        "Em duração incerta ou crônica, a principal complicação iatrogênica é a sobrecorreção.",
      ];
    case "hypernatremia":
      return [
        "Se houver hipovolemia ou choque, estabilizar perfusão antes de focar na água livre.",
        "O déficit calculado é apenas estimativo; a resposta clínica depende das perdas em curso.",
        "Em duração incerta ou crônica, prefira correção gradual com redosagens seriadas.",
      ];
    case "hypokalemia":
      return [
        "Priorize via oral quando o paciente estiver estável e a via enteral for confiável.",
        "Hipocalemia profunda, sintomática ou com arritmia pede reposição monitorada.",
        "Hipomagnesemia reduz a probabilidade de correção sustentada e deve ser considerada precocemente.",
      ];
    case "hyperkalemia":
      return [
        "O risco imediato é elétrico: ECG alterado muda a urgência da conduta.",
        "A sequência clássica é estabilizar membrana, deslocar K para o intracelular e remover K do corpo.",
        "Se usar insulina, monitorar glicemia em série pelo risco de hipoglicemia.",
      ];
    case "hypocalcemia":
      return [
        "Interprete com cálcio ionizado ou corrigido pela albumina, não só pelo cálcio total isolado.",
        "Tetania, convulsão, laringoespasmo ou QT longo sustentam tratamento monitorado.",
        "Magnésio, fósforo e função renal costumam mudar a segurança e a resposta da correção.",
      ];
    case "hypercalcemia":
      return [
        "A gravidade depende do número e da clínica, especialmente desidratação, encefalopatia e lesão renal.",
        "Na forma grave, hidratação intravenosa é a base; se houver malignidade, terapia antirreabsortiva deve ser considerada precocemente.",
        "Não trate a hipercalcemia sem revisar a causa de base.",
      ];
    case "hypomagnesemia":
      return [
        "QT longo, torsades, convulsão ou hipocalemia refratária elevam a urgência.",
        "Investigue perdas gastrointestinais, diuréticos, álcool e inibidor de bomba de prótons.",
        "A resposta do potássio e do cálcio costuma depender do magnésio.",
      ];
    case "hypermagnesemia":
      return [
        "O risco principal é neuromuscular e hemodinâmico, não apenas laboratorial.",
        "Suspender fontes de magnésio é obrigatório; suporte e antagonismo com cálcio dependem da clínica.",
        "Com disfunção renal ou toxicidade importante, a discussão sobre diálise é mais precoce.",
      ];
    case "hypophosphatemia":
      return [
        "A decisão entre via oral e intravenosa depende de gravidade, sintomas e capacidade de absorção.",
        "Realimentação, cetoacidose e alcalose respiratória são causas clássicas de queda rápida do fósforo.",
        "Reveja cálcio, potássio e rim antes de escalar a reposição.",
      ];
    case "hyperphosphatemia":
      return [
        "Na prática, hiperfosfatemia costuma ser marcador de doença renal, lise celular ou excesso de carga.",
        "A conduta é tratar a causa de base e revisar necessidade de quelantes ou depuração.",
        "Olhe sempre o conjunto com cálcio e função renal.",
      ];
    case "hypochloremia":
      return [
        "Hipocloremia costuma ser parte de alcalose metabólica cloro-responsiva, não um alvo isolado.",
        "Volume, cloreto e potássio costumam caminhar juntos na correção.",
        "Bicarbonato e contexto de perdas digestivas ou diuréticos mudam a leitura clínica.",
      ];
    case "hyperchloremia":
      return [
        "Hipercloremia costuma refletir carga de cloro ou perda de bicarbonato.",
        "A tendência e o contexto de fluidoterapia pesam mais que um valor isolado.",
        "Reveja bicarbonato, função renal e a indicação clínica de soluções ricas em cloro.",
      ];
    default:
      return [headline];
  }
}

function getEvidenceBaseLines(disorder: DisorderKey): string[] {
  switch (disorder) {
    case "hyponatremia":
      return [
        "Base de referência: Hyponatraemia—treatment standard 2024 e revisão JAMA 2022.",
        "Ponto forte de consenso: foco inicial em sintomas neurológicos e prevenção de sobrecorreção.",
      ];
    case "hypernatremia":
      return [
        "Base de referência: revisões nefrológicas contemporâneas; a evidência é menos robusta que na hiponatremia.",
        "Ponto forte de consenso: corrigir com reavaliação seriada do estado volêmico e das perdas em curso.",
      ];
    case "hypokalemia":
    case "hyperkalemia":
      return [
        "Base de referência: UK Kidney Association Clinical Practice Guideline 2023 e revisões contemporâneas de reposição de potássio.",
        disorder === "hyperkalemia"
          ? "Ponto forte de consenso: ECG, monitorização e glicemia seriada após insulina são críticos."
          : "Ponto forte de consenso: a segurança da reposição depende de gravidade, magnésio, função renal e redosagem seriada.",
      ];
    case "hypocalcemia":
    case "hypercalcemia":
    case "hypophosphatemia":
    case "hyperphosphatemia":
      return [
        "Base de referência: Calcium and Phosphate Disorders Core Curriculum 2024.",
        disorder === "hypercalcemia"
          ? "Para hipercalcemia da malignidade, foi usada também a diretriz da Endocrine Society 2023."
          : "Ponto forte de consenso: interpretar o número junto com rim, cálcio ionizado/corrigido e causa de base.",
      ];
    case "hypomagnesemia":
    case "hypermagnesemia":
      return [
        "Base de referência: Magnesium Disorders Core Curriculum 2024.",
        "Ponto forte de consenso: a gravidade é sobretudo clínica e elétrica.",
      ];
    case "hypochloremia":
    case "hyperchloremia":
      return [
        "Base de referência: Metabolic alkalosis treatment standard 2024 e revisões de distúrbios ácido-base.",
        "Ponto forte de consenso: interpretar o cloro dentro do distúrbio ácido-base e da fluidoterapia.",
      ];
    default:
      return ["Base de referência: revisar guideline específica do distúrbio e integrar com o contexto clínico."];
  }
}

function getCompactMetricLabels(disorder: DisorderKey): string[] {
  switch (disorder) {
    case "hyponatremia":
      return ["Na corrigido", "Meta inicial"];
    case "hypernatremia":
      return ["Déficit hídrico até 140", "Meta inicial"];
    case "hypokalemia":
    case "hyperkalemia":
      return ["Potássio atual", "ECG", "K atual", "Magnésio atual", "Mg atual"];
    case "hypocalcemia":
    case "hypercalcemia":
      return ["Cálcio corrigido", "Cálcio ionizado", "Cálcio atual"];
    case "hypomagnesemia":
    case "hypermagnesemia":
      return ["Mg atual", "Magnésio atual"];
    case "hypophosphatemia":
    case "hyperphosphatemia":
      return ["Fósforo", "Fósforo atual"];
    case "hypochloremia":
    case "hyperchloremia":
      return ["Cl atual", "HCO3-"];
  }
}

function getImmediatePriorityLines(disorder: DisorderKey): string[] {
  switch (disorder) {
    case "hyponatremia":
      return [
        "Procure primeiro neurogravidade: convulsão, coma, rebaixamento importante ou desconforto respiratório.",
        "Se houver neurogravidade, o problema é encefalopatia por hiponatremia até prova em contrário.",
      ];
    case "hypernatremia":
      return [
        "Procure primeiro hipovolemia, hipotensão ou choque antes de focar na água livre.",
        "Letargia, irritabilidade, mioclonia ou convulsão aumentam a urgência da correção.",
      ];
    case "hypokalemia":
      return [
        "A urgência aumenta com fraqueza importante, arritmia, síncope, paralisia ou hipocalemia acentuada.",
        "Se o paciente tolera via oral e está estável, essa costuma ser a via preferida.",
        "Magnésio baixo pode impedir a subida sustentada do potássio.",
      ];
    case "hyperkalemia":
      return [
        "Avalie precocemente o eletrocardiograma: alterações elétricas modificam imediatamente a prioridade terapêutica.",
        "O risco principal é parada elétrica, não apenas o valor laboratorial.",
      ];
    case "hypocalcemia":
      return [
        "Tetania, laringoespasmo, convulsão ou QT longo são os sinais de maior gravidade.",
        "Não interprete cálcio total isoladamente se a albumina estiver alterada.",
      ];
    case "hypercalcemia":
      return [
        "Encefalopatia, desidratação importante e lesão renal definem maior urgência.",
        "Quadros graves pedem foco em volemia e causa de base.",
      ];
    case "hypomagnesemia":
      return [
        "QT longo, torsades, convulsão ou hipocalemia refratária são os cenários mais preocupantes.",
        "Magnésio baixo pode explicar por que potássio ou cálcio não corrigem.",
      ];
    case "hypermagnesemia":
      return [
        "Hiporreflexia, hipotensão, bradicardia e depressão respiratória são os sinais mais perigosos.",
        "A toxicidade é sobretudo clínica, não só numérica.",
      ];
    case "hypophosphatemia":
      return [
        "Fraqueza muscular, insuficiência respiratória e rabdomiólise aumentam a urgência.",
        "Hipofosfatemia acentuada em síndrome de realimentação ou cetoacidose exige atenção especial.",
      ];
    case "hyperphosphatemia":
      return [
        "Pense primeiro em disfunção renal, lise celular ou excesso de carga fosfatada.",
        "Muitas manifestações vêm da hipocalcemia associada, não do fósforo isolado.",
      ];
    case "hypochloremia":
      return [
        "Na prática, hipocloremia costuma sinalizar alcalose metabólica cloro-responsiva.",
        "O valor ganha sentido quando visto com bicarbonato, volume e potássio.",
      ];
    case "hyperchloremia":
      return [
        "Hipercloremia costuma refletir carga de cloro ou perda de bicarbonato.",
        "O contexto ácido-base importa mais que perseguir um número isolado.",
      ];
  }
}

function getMonitoringLines(disorder: DisorderKey): string[] {
  switch (disorder) {
    case "hyponatremia":
      return [
        "Repetir sódio e reavaliar neurológico após as intervenções iniciais.",
        "Monitorar a diurese para reconhecer precocemente a sobrecorreção.",
      ];
    case "hypernatremia":
      return [
        "Redosar sódio nas primeiras horas e recalcular conforme perdas em curso.",
        "Monitorar balanço hídrico e estado volêmico continuamente.",
      ];
    case "hypokalemia":
      return [
        "Repetir potássio e considerar ECG conforme gravidade clínica.",
        "Checar magnésio e função renal para estimar chance de resposta e segurança da reposição.",
      ];
    case "hyperkalemia":
      return [
        "Monitorar ECG e repetir potássio após o tratamento inicial.",
        "Se usar insulina, seguir glicemia seriada pelo risco de hipoglicemia.",
      ];
    case "hypocalcemia":
    case "hypercalcemia":
      return [
        "Seguir cálcio seriado junto com função renal e ECG quando indicado.",
        "Rever magnésio, fósforo e causa de base para evitar correção incompleta.",
      ];
    case "hypomagnesemia":
    case "hypermagnesemia":
      return [
        "Repetir magnésio e revisar ECG e função renal conforme gravidade.",
        "A resposta clínica pesa tanto quanto a nova dosagem.",
      ];
    case "hypophosphatemia":
    case "hyperphosphatemia":
      return [
        "Redosar fósforo com cálcio e função renal após a etapa inicial.",
        "Em disfunção renal, escalar tratamento com mais cautela.",
      ];
    case "hypochloremia":
    case "hyperchloremia":
      return [
        "Acompanhar bicarbonato, potássio, função renal e tendência do cloro.",
        "Rever a estratégia de fluidos e a causa de base, não só o eletrólito isolado.",
      ];
  }
}

function buildOperationalBlocks(args: {
  disorder: DisorderKey;
  current: number;
  calciumMode: CalciumMode;
  albumin: number | null;
  glucose: number | null;
  weightKg: number | null;
  sex: Sex;
  bicarbonate: number | null;
  magnesiumCurrent: number | null;
  potassiumCurrent: number | null;
  renalDysfunction: boolean;
  ecgChanges: boolean;
}): Pick<CalcResult, "strategy" | "practical" | "summary"> {
  const {
    disorder,
    current,
    calciumMode,
    albumin,
    glucose,
    weightKg,
    sex,
    bicarbonate,
    magnesiumCurrent,
    potassiumCurrent,
    renalDysfunction,
    ecgChanges,
  } = args;

  switch (disorder) {
    case "hyponatremia": {
      if (weightKg == null) {
        return {
          strategy: [
            {
              title: "Conduta direta",
              tone: "warning",
              lines: [
                "Se houver convulsão, coma, rebaixamento importante ou desconforto respiratório, tratar como neurogravidade e iniciar solução de cloreto de sódio a 3%.",
                "Para individualizar o cálculo de volume e o preparo da solução, preencher o peso corporal.",
              ],
            },
          ],
          practical: [
            {
              title: "Esquema prático inicial",
              lines: [
                "Bolus de referência: 150 mL de solução de cloreto de sódio a 3% em 10-20 minutos.",
                "Redosar sódio em 1-2 horas e repetir bolus se a neurogravidade persistir.",
              ],
            },
          ],
          summary: [],
        };
      }

      const correctedNa = getGlucoseCorrectedSodium(current, glucose);
      const totalBodyWater = tbw(weightKg, sex, false);
      const targetNa = Math.min(correctedNa + 6, 130);
      const deltaNeeded = Math.max(targetNa - correctedNa, 0);
      const deltaPerL3 = (513 - correctedNa) / (totalBodyWater + 1);
      const volume3PctMl = deltaPerL3 > 0 ? (deltaNeeded / deltaPerL3) * 1000 : 0;
      const emergencyBolusMl = 150;
      const nacl20FractionFor3Pct = (0.513 - 0.154) / (3.42 - 0.154);
      const nacl20ForTotalMl = volume3PctMl * nacl20FractionFor3Pct;
      const sf09ForTotalMl = Math.max(volume3PctMl - nacl20ForTotalMl, 0);
      const remainingMaintenanceMl = Math.max(volume3PctMl - emergencyBolusMl, 0);
      const maintenanceRateMlH = remainingMaintenanceMl > 0 ? remainingMaintenanceMl / 24 : 0;

      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: "warning",
            lines: [
              "Se houver neurogravidade, iniciar solução de cloreto de sódio a 3% sem postergar o tratamento à espera da normalização do sódio.",
              `Bolus inicial de referência: ${fmt(emergencyBolusMl, 0)} mL em 10-20 minutos.`,
              `Meta inicial prática: elevar o sódio até cerca de ${fmt(targetNa, 1)} mEq/L, evitando ultrapassar 8-10 mEq/L em 24 horas se duração for incerta ou crônica.`,
              "Se o perfil for hipovolêmico sem neurogravidade, restaurar volemia primeiro com solução isotônica.",
            ],
          },
          {
            title: "Soluções recomendadas",
            lines: [
              `Volume total estimado de solução de cloreto de sódio a 3% para a meta inicial: ${fmt(volume3PctMl, 0)} mL.`,
              remainingMaintenanceMl > 0
                ? `Após o bolus, o restante estimado é ${fmt(remainingMaintenanceMl, 0)} mL; infundir em 24 horas a cerca de ${fmt(maintenanceRateMlH, 1)} mL/h, sempre com redosagem seriada.`
                : "Após o bolus inicial, reavaliar; pode não ser necessário manter infusão hipertônica se a meta inicial já foi atingida.",
              "Em hiponatremia hipovolêmica, solução de cloreto de sódio a 0,9% é a escolha para ressuscitação e correção da causa.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo da solução mais usada",
            lines: [
              "Se houver apresentação pronta de solução de cloreto de sódio a 3%, utilizá-la diretamente.",
              `Se precisar manipular o volume total calculado, uma forma prática é: solução de cloreto de sódio a 0,9% ${fmt(sf09ForTotalMl, 0)} mL + solução de cloreto de sódio a 20% ${fmt(nacl20ForTotalMl, 1)} mL.`,
              "Redosar sódio e reavaliar exame neurológico 1-2 horas após cada bolus; depois acompanhar a cada 4 horas na manutenção.",
            ],
          },
        ],
        summary: [],
      };
    }
    case "hypernatremia": {
      if (weightKg == null) {
        return {
          strategy: [
            {
              title: "Conduta direta",
              lines: [
                "Se houver choque ou hipovolemia, ressuscitar primeiro com solução isotônica antes de focar na água livre.",
                "Para estimar água livre e volume recomendado de forma individualizada, preencher peso corporal.",
              ],
            },
          ],
          practical: [
            {
              title: "Soluções recomendadas",
              lines: [
                "Para reposição intravenosa de água livre, a solução de glicose a 5% é a opção de referência.",
                "Quando se quer uma solução hipotônica com sódio, a solução de cloreto de sódio a 0,45% é uma alternativa prática.",
              ],
            },
          ],
          summary: [],
        };
      }

      const totalBodyWater = tbw(weightKg, sex, false);
      const correctedNa = getGlucoseCorrectedSodium(current, glucose);
      const targetNa = Math.max(correctedNa - 8, 145);
      const waterToGoal = totalBodyWater * ((correctedNa / targetNa) - 1);
      const d5wVolumeMl = estimateVolumeToTargetMl({
        currentNa: correctedNa,
        targetNa,
        totalBodyWater,
        infusateNa: 0,
      });
      const halfSalineVolumeMl = estimateVolumeToTargetMl({
        currentNa: correctedNa,
        targetNa,
        totalBodyWater,
        infusateNa: 77,
      });
      const nacl20For1000Ml = 22.5;
      const nacl20For500Ml = 11.25;
      const nacl20For250Ml = 5.625;
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: "warning",
            lines: [
              "Hipernatremia exige corrigir a água livre de forma seriada, não em queda brusca.",
              glucose != null && glucose > 100
                ? `Sódio corrigido pela glicose: ${fmt(correctedNa, 1)} mEq/L; usar esse valor para interpretar o déficit real.`
                : "Se a glicemia não estiver elevada, interpretar o sódio medido diretamente.",
              `Meta inicial prática: reduzir para cerca de ${fmt(targetNa, 1)} mEq/L nas primeiras 24 horas.`,
              "Se houver instabilidade hemodinâmica, ressuscitar primeiro com solução de cloreto de sódio a 0,9%.",
            ],
          },
          {
            title: "Soluções recomendadas",
            lines: [
              `Déficit estimado de água livre até a meta inicial: ${fmt(waterToGoal, 2)} L.`,
              "Se o objetivo for reposição de água livre sem oferta adicional relevante de sódio, usar solução de glicose a 5% em água (D5W).",
              "Se for necessário oferecer água livre com algum teor de sódio, considerar solução de cloreto de sódio a 0,45%.",
              "Em instabilidade hemodinâmica ou hipovolemia importante, a reposição inicial continua sendo com solução isotônica; a água livre entra depois da restauração volêmica.",
            ],
          },
        ],
        practical: [
          {
            title: "Execução prática",
            lines: [
              d5wVolumeMl != null
                ? `Se a estratégia for água livre intravenosa, o volume inicial estimado de solução de glicose a 5% em água (D5W) para a meta das primeiras 24 horas é ${fmt(d5wVolumeMl, 0)} mL.`
                : "Se a estratégia for água livre intravenosa, recalcular o volume individualmente antes da prescrição.",
              halfSalineVolumeMl != null
                ? `Se a estratégia for solução de cloreto de sódio a 0,45%, o volume estimado para a mesma meta é ${fmt(halfSalineVolumeMl, 0)} mL; ele é maior que o de solução de glicose a 5% porque essa solução ainda contém sódio.`
                : "Se a estratégia for solução de cloreto de sódio a 0,45%, recalcular o volume individualmente antes da prescrição.",
              "Redosar sódio nas primeiras horas e recalcular após cada resultado.",
              "Monitorar balanço hídrico, diurese e perdas em curso; o cálculo inicial é só estimativa.",
            ],
          },
          {
            title: "Preparo da solução de cloreto de sódio a 0,45%",
            lines: [
              "Preferir apresentações comerciais prontas de solução de cloreto de sódio a 0,45% quando disponíveis.",
              "Se a instituição permitir manipulação estéril pela farmácia, a concentração final de 0,45% corresponde a 4,5 g/L de cloreto de sódio.",
              `Exemplo prático para 1.000 mL: ${fmt(nacl20For1000Ml, 1)} mL de cloreto de sódio a 20% + ${fmt(1000 - nacl20For1000Ml, 1)} mL de água para injeção.`,
              `Exemplo prático para 500 mL: ${fmt(nacl20For500Ml, 1)} mL de cloreto de sódio a 20% + ${fmt(500 - nacl20For500Ml, 1)} mL de água para injeção.`,
              `Exemplo prático para 250 mL: ${fmt(nacl20For250Ml, 1)} mL de cloreto de sódio a 20% + ${fmt(250 - nacl20For250Ml, 1)} mL de água para injeção.`,
              "Usar técnica asséptica e seguir o protocolo institucional de farmácia; não administrar cloreto de sódio concentrado sem diluição adequada.",
            ],
          },
        ],
        summary: [],
      };
    }
    case "hypokalemia": {
      const severe = current < 3;
      const automaticDose = severe ? 40 : 20;
      const automaticBagMl = severe ? 1000 : 500;
      const automaticHours = severe ? 4 : 2;
      const automaticPumpMlH = automaticBagMl / automaticHours;
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: current < 2.5 ? "danger" : "warning",
            lines: [
              "Se o paciente estiver estável e tolerar via enteral, preferir via oral.",
              current < 2.5
                ? "Se K estiver abaixo de 2,5 mEq/L, houver arritmia, paralisia ou síncope, priorizar reposição monitorada."
                : "Se K estiver entre 2,5 e 3,4 mEq/L, iniciar reposição e redosar antes de programar etapas adicionais.",
              magnesiumCurrent != null && magnesiumCurrent < 1.8
                ? "Magnésio baixo reduz a chance de resposta sustentada; corrigir magnésio em paralelo."
                : "Se magnésio não foi dosado, considerar sua avaliação precocemente, pois hipomagnesemia pode explicar hipocalemia refratária.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo da primeira etapa",
            lines: [
              `Dose inicial calculada: ${automaticDose} mEq de cloreto de potássio.`,
              "Diluições usuais e mais fáceis de ler à beira-leito: 10 mEq em 250 mL, 20 mEq em 500 mL e 40 mEq em 1000 mL de diluente.",
              "Essas apresentações mantêm a ordem de grandeza em 40 mEq/L e evitam confusão visual entre dose e volume final.",
              severe
                ? "Se a necessidade for 40 mEq, preferir duas bolsas de 20 mEq/500 mL ou uma bolsa total de 1000 mL, conforme acesso e monitorização."
                : "Se a necessidade for 20 mEq, 500 mL costuma ser a apresentação prática mais simples.",
              `Correr em ${fmt(automaticHours, 0)} horas, com bomba em cerca de ${fmt(automaticPumpMlH, 0)} mL/h para o volume escolhido.`,
            ],
          },
        ],
        summary: [],
      };
    }
    case "hyperkalemia":
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: ecgChanges || current >= 6.5 ? "danger" : "warning",
            lines: [
              "Se houver alteração de eletrocardiograma ou K em faixa grave, proteger o coração primeiro com cálcio.",
              "Depois deslocar potássio para dentro da célula com insulina regular + glicose; salbutamol entra como adjuvante, não como monoterapia.",
              "A etapa final é remover potássio do corpo e discutir terapia renal substitutiva se não houver resposta ou se houver oligúria.",
            ],
          },
        ],
        practical: [
          {
            title: "Esquema prático inicial",
            lines: [
              "Gluconato de cálcio a 10%: 30 mL IV em 5-10 minutos se o eletrocardiograma estiver alterado ou se a hipercalemia for grave.",
              "Insulina regular 10 U IV + glicose 25 g IV para deslocamento intracelular do potássio.",
              "Para entregar 25 g de glicose, usar 50 mL de glicose a 50% ou 250 mL de glicose a 10%, conforme o acesso e a rotina do serviço.",
              "Salbutamol nebulizado 10-20 mg como adjuvante.",
              "Se a glicemia basal estiver baixa ou limítrofe, manter vigilância glicêmica seriada após a insulina.",
            ],
          },
        ],
        summary: [],
      };
    case "hypocalcemia": {
      const effectiveCa = getEffectiveCalciumValue(current, calciumMode, albumin)!;
      const severe = calciumMode === "ionized" ? effectiveCa < 4 : effectiveCa < 7.6;
      const bolusMl = severe ? 20 : 10;
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: severe ? "danger" : "warning",
            lines: [
              "Se houver tetania, convulsão, laringoespasmo ou prolongamento do QT, tratar com base na apresentação clínica, sem aguardar refinamento laboratorial.",
              `Bolus inicial de referência: ${fmt(bolusMl, 0)} mL de gluconato de cálcio a 10%.`,
              "Depois do bolus, se necessário, seguir com infusão contínua e corrigir magnésio/fósforo conforme o contexto.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e alternativas",
            lines: [
              `Para o bolus, diluir ${fmt(bolusMl, 0)} mL de gluconato de cálcio a 10% em 50-100 mL de solução de glicose a 5% ou solução de cloreto de sódio a 0,9% e infundir em cerca de 10 minutos com monitorização cardíaca.`,
              severe
                ? "Se grave, a apresentação prática é 20 mL de gluconato de cálcio a 10% + 50-100 mL de diluente."
                : "Se menos grave, a apresentação prática é 10 mL de gluconato de cálcio a 10% + 50-100 mL de diluente.",
              "Se precisar de manutenção, usar 100 mL de gluconato de cálcio a 10% em 1 L de solução de cloreto de sódio a 0,9% ou solução de glicose a 5%, ajustando a 50-100 mL/h conforme resposta e ECG.",
            ],
          },
        ],
        summary: [],
      };
    }
    case "hypercalcemia":
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: "warning",
            lines: [
              "A base do tratamento inicial é expansão volêmica com solução de cloreto de sódio a 0,9%, ajustada à volemia e à diurese.",
              "Se o cálcio seguir alto após hidratação, o anti-reabsortivo mais direto é o ácido zoledrônico.",
              renalDysfunction
                ? "Com disfunção renal, hidratação e bisfosfonato exigem mais cautela e reavaliação frequente."
                : "Monitorar volemia, diurese e creatinina durante a expansão.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e execução",
            lines: [
              "Solução de cloreto de sódio a 0,9%: iniciar hidratação e ajustar para euvolemia, com meta prática de diurese em torno de 2 L/dia se tolerado.",
              "Ácido zoledrônico 4 mg IV em pelo menos 15 minutos após iniciar a hidratação, quando indicado.",
              "Apresentação comum: frasco 4 mg/5 mL; diluir em 100 mL de solução de cloreto de sódio a 0,9% ou de solução de glicose a 5% antes da infusão.",
            ],
          },
        ],
        summary: [],
      };
    case "hypomagnesemia": {
      const severe = current < 1.2;
      const doseG = severe ? 2 : 1;
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: severe ? "danger" : "warning",
            lines: [
              severe
                ? "Se houver torsades, convulsão ou instabilidade, tratar como prioridade elétrica."
                : "Se o paciente estiver estável, a reposição pode ser mais gradual.",
              `Dose inicial de referência: ${doseG} g de sulfato de magnésio intravenoso.`,
              renalDysfunction
                ? "Em disfunção renal, evitar doses sucessivas sem redosagem laboratorial."
                : "Redosar magnésio e decidir a próxima etapa pela clínica e pelo controle laboratorial.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e alternativas",
            lines: [
              `Preparar ${doseG} g de sulfato de magnésio 50% (${fmt(doseG * 2, 1)} mL da ampola de 500 mg/mL).`,
              severe
                ? "Se torsades/instabilidade: correr 2 g em 5-15 minutos com monitorização contínua."
                : "Se estável: correr 1-2 g em cerca de 1 hora.",
              `Diluição prática: ${severe ? "100" : "50-100"} mL de solução de cloreto de sódio a 0,9% ou solução de glicose a 5%, conforme a apresentação disponível e o acesso venoso.`,
            ],
          },
        ],
        summary: [],
      };
    }
    case "hypermagnesemia":
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: current >= 7 ? "danger" : "warning",
            lines: [
              "Suspender toda fonte de magnésio imediatamente.",
              "Se houver instabilidade hemodinâmica, depressão neuromuscular ou ECG alterado, antagonizar com cálcio e dar suporte.",
              renalDysfunction
                ? "Com disfunção renal, a indicação de diálise deve ser considerada mais precocemente."
                : "Sem depuração adequada, discutir diálise se a toxicidade persistir.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e execução",
            lines: [
              "Gluconato de cálcio a 10%: 10-20 mL intravenoso em 5-10 minutos como antagonismo inicial.",
              "Depois do cálcio, manter solução de cloreto de sódio a 0,9% se a volemia permitir e considerar diurético de alça após repleção volêmica quando a função renal responder.",
              "Monitorar reflexos, pressão, frequência cardíaca, função respiratória e ECG; se houver depuração ruim ou quadro grave, discutir diálise precocemente.",
            ],
          },
        ],
        summary: [],
      };
    case "hypophosphatemia": {
      const doseMmol = current < 1 ? 30 : current < 2 ? 15 : 0;
      const usePotassiumSalt = potassiumCurrent == null || potassiumCurrent < 4.5;
      return {
        strategy: [
          {
            title: "Conduta direta",
            tone: current < 1 ? "danger" : "warning",
            lines: [
              current < 1
                ? "Hipofosfatemia grave ou sintomática favorece reposição intravenosa."
                : "Hipofosfatemia moderada ou leve, com via enteral confiável, pode ser manejada por via oral.",
              usePotassiumSalt
                ? "Na ausência de hiperpotassemia, o fosfato de potássio costuma ser o sal preferencial."
                : "Com potássio já alto ou limítrofe, preferir fosfato de sódio.",
              renalDysfunction
                ? "Em disfunção renal, escalar reposição com mais cautela e redosagem precoce."
                : "Redosar fósforo após a etapa inicial antes de programar novas bolsas.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e alternativas",
            lines: [
              doseMmol > 0
                ? `Etapa inicial sugerida: ${doseMmol} mmol de fósforo intravenoso.`
                : "Se não houver indicação de via intravenosa, preferir reposição oral e reavaliar a evolução.",
              doseMmol > 0
                ? `${doseMmol} mmol correspondem a ${fmt(doseMmol / 3, 1)} mL do concentrado de fosfato 3 mmol/mL.`
                : "Se for usar intravenoso, redosar antes de repetir etapas.",
              "Apresentações práticas do concentrado: 15 mmol = 5 mL e 30 mmol = 10 mL do fosfato 3 mmol/mL.",
              "Na prática, 15 mmol costuma bastar para moderada; 30 mmol é a etapa inicial mais usada quando o fósforo está < 1 mg/dL ou há repercussão clínica.",
              "Infundir em 3-6 horas conforme protocolo local, com monitorização de fósforo, cálcio, potássio e função renal.",
            ],
          },
        ],
        summary: [],
      };
    }
    case "hyperphosphatemia":
      return {
        strategy: [
          {
            title: "Conduta direta",
            lines: [
              "Tratar a causa de base, suspender fontes de fósforo e revisar função renal.",
              "Considerar quelantes com as refeições e discutir depuração quando houver disfunção renal importante ou persistência do distúrbio.",
            ],
          },
        ],
        practical: [
          {
            title: "Cuidados práticos",
            lines: [
              "Monitorar fósforo, cálcio e função renal em série.",
              "Evitar administrar cálcio e fosfato na mesma linha pelo risco de precipitação.",
              "Se a hiperfosfatemia for grave ou houver falha clínica apesar do tratamento, discutir diálise.",
            ],
          },
        ],
        summary: [],
      };
    case "hypochloremia": {
      const goal = 103;
      const deficit = weightKg != null ? Math.max(0, 0.2 * weightKg * (goal - current)) : null;
      const salineLiters = deficit != null ? deficit / 154 : null;
      return {
        strategy: [
          {
            title: "Conduta direta",
            lines: [
              "Pensar primeiro em alcalose metabólica cloro-responsiva, perdas digestivas, diuréticos e déficit de volume.",
              potassiumCurrent != null && potassiumCurrent < 3.5
                ? "Se o potássio estiver baixo, parte importante da correção deve vir com cloreto de potássio."
                : "Se o problema for de volume e cloro, solução de cloreto de sódio a 0,9% é a referência prática.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e execução",
            lines: [
              salineLiters != null
                ? `Déficit estimado de cloro: ${fmt(deficit, 0)} mEq, equivalente a cerca de ${fmt(salineLiters, 2)} L de solução de cloreto de sódio a 0,9%.`
                : "O preenchimento do peso corporal permite estimar o volume de reposição.",
              "Se houver hipocalemia associada, preferir cloreto de potássio e repetir eletrólitos após a etapa inicial.",
              "Se houver depleção de volume, iniciar solução de cloreto de sódio a 0,9% e ajustar pela resposta clínica, cloro e bicarbonato.",
            ],
          },
        ],
        summary: [],
      };
    }
    case "hyperchloremia":
      return {
        strategy: [
          {
            title: "Conduta direta",
            lines: [
              "Suspender ou reduzir soluções ricas em cloro quando não houver mais indicação hemodinâmica clara.",
              "Se a causa for carga de cloro, preferir cristalóide balanceado na sequência.",
              bicarbonate != null && bicarbonate < 22
                ? "Bicarbonato baixo reforça acidose metabólica hiperclorêmica e pede revisão da causa de base."
                : "Nem toda hipercloremia isolada exige mais que interromper a carga e reavaliar.",
            ],
          },
        ],
        practical: [
          {
            title: "Preparo e execução",
            lines: [
              "Rever balanço hídrico, gasometria, bicarbonato e volume recente de solução de cloreto de sódio a 0,9%.",
              "Se houver acidose hiperclorêmica, a correção verdadeira é menos cloro entrando, mais água livre quando indicado e tratamento da causa.",
              "Se a carga de cloro foi iatrogênica, a próxima etapa costuma ser cristalóide balanceado, não mais solução salina a 0,9%.",
            ],
          },
        ],
        summary: [],
      };
  }
}

function buildDisplayResult(args: {
  electrolyte: ElectrolyteKey;
  disorder: DisorderKey;
  current: number | null;
  currentUnit: ElectrolyteUnit;
  calciumMode: CalciumMode;
  albumin: number | null;
  glucose: number | null;
  weightKg: number | null;
  sex: Sex;
  bicarbonate: number | null;
  magnesiumCurrent: number | null;
  potassiumCurrent: number | null;
  renalDysfunction: boolean;
  ecgChanges: boolean;
}): CalcResult {
  const { electrolyte, disorder, current, currentUnit, calciumMode, albumin, glucose, weightKg, sex, bicarbonate, magnesiumCurrent, potassiumCurrent, renalDysfunction, ecgChanges } = args;

  if (current == null) {
    return {
      headline: "Preencha o valor atual para habilitar a interpretação clínica.",
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

  const interpretedCurrent =
    disorder === "hypocalcemia" || disorder === "hypercalcemia"
      ? getEffectiveCalciumValue(current, calciumMode, albumin)
      : current;
  const severity = getSeveritySummary(disorder, current, ecgChanges, calciumMode, albumin);
  const displayCurrent = `${fmt(convertCanonicalElectrolyteValue(interpretedCurrent, electrolyte, currentUnit), currentUnit === "mg/dL" ? 2 : 1)} ${currentUnit}`;
  const metrics: Metric[] = [{ label: "Valor atual", value: displayCurrent }, { label: "Classificação", value: severity.label }];
  const alerts: ResultBlock[] = [];
  const operational = buildOperationalBlocks({
    disorder,
    current,
    calciumMode,
    albumin,
    glucose,
    weightKg,
    sex,
    bicarbonate,
    magnesiumCurrent,
    potassiumCurrent,
    renalDysfunction,
    ecgChanges,
  });

  switch (disorder) {
    case "hyponatremia": {
      const correctedNa = glucose && glucose > 100 ? current + 1.6 * ((glucose - 100) / 100) : current;
      metrics.unshift({ label: "Na corrigido", value: `${fmt(correctedNa, 1)} mEq/L` });
      if (correctedNa < 120) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Hiponatremia grave ou sintomática exige monitorização estreita e atenção especial ao risco de sobrecorreção."],
        });
      }
      break;
    }
    case "hypernatremia": {
      const correctedNa = getGlucoseCorrectedSodium(current, glucose);
      if (glucose != null && glucose > 100) {
        metrics.unshift({ label: "Na corrigido", value: `${fmt(correctedNa, 1)} mEq/L` });
      }
      const waterDeficit = weightKg != null ? tbw(weightKg, sex, false) * ((correctedNa / 140) - 1) : null;
      if (waterDeficit != null && Number.isFinite(waterDeficit) && waterDeficit > 0) {
        metrics.unshift({ label: "Déficit hídrico até 140", value: `${fmt(waterDeficit, 2)} L` });
      }
      if (correctedNa >= 160) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Hipernatremia importante pede reavaliação mais próxima e correção monitorada."],
        });
      }
      break;
    }
    case "hypokalemia":
      metrics.push({
        label: "Magnésio atual",
        value: magnesiumCurrent != null ? `${fmt(convertCanonicalElectrolyteValue(magnesiumCurrent, "magnesium", "mg/dL"), 1)} mg/dL` : "não informado",
      });
      if (current < 2.5) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Hipocalemia acentuada aumenta o risco de arritmia, paralisia e necessidade de reposição monitorada."],
        });
      }
      if (magnesiumCurrent == null) {
        alerts.push({
          title: "Dado importante ausente",
          tone: "warning",
          lines: ["Magnésio não foi informado; isso limita a leitura da chance de resposta à reposição de potássio."],
        });
      } else if (magnesiumCurrent < 1.8) {
        alerts.push({
          title: "Magnésio associado",
          tone: "warning",
          lines: ["Hipomagnesemia favorece hipocalemia refratária e deve ser corrigida precocemente no plano terapêutico."],
        });
      }
      break;
    case "hyperkalemia":
      metrics.unshift({ label: "ECG", value: ecgChanges ? "alterado" : "sem alteração informada" });
      if (ecgChanges || current >= 6.5) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["ECG alterado ou K ≥ 6,5 mmol/L deve ser tratado como emergência elétrica."],
        });
      }
      break;
    case "hypocalcemia":
      if (
        (calciumMode === "ionized" &&
          (interpretedCurrent ?? 0) < ADULT_IONIZED_CALCIUM_REFERENCE.severeLowMgDl) ||
        (calciumMode === "total" && (interpretedCurrent ?? 0) < 7)
      ) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Tetania, convulsão, laringoespasmo ou QT longo sustentam tratamento monitorado."],
        });
      }
      break;
    case "hypercalcemia":
      metrics.push({ label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" });
      if (
        (calciumMode === "ionized" &&
          (interpretedCurrent ?? 0) >= ADULT_IONIZED_CALCIUM_REFERENCE.criticalHighMgDl) ||
        (calciumMode === "total" && (interpretedCurrent ?? 0) >= 14)
      ) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Hipercalcemia grave pode cursar com encefalopatia, desidratação e lesão renal."],
        });
      }
      break;
    case "hypomagnesemia":
      if (current < 1.2) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Hipomagnesemia acentuada aumenta o risco elétrico e pode tornar potássio ou cálcio refratários à correção."],
        });
      }
      break;
    case "hypermagnesemia":
      if (current >= 7) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Hiporreflexia, hipotensão, bradicardia ou depressão respiratória mudam a urgência."],
        });
      }
      break;
    case "hypophosphatemia":
      metrics.push({ label: "Potássio atual", value: potassiumCurrent != null ? `${fmt(potassiumCurrent, 1)} mEq/L` : "não informado" });
      if (current < 1) {
        alerts.push({
          title: "Prioridade máxima",
          tone: "danger",
          lines: ["Fósforo < 1 mg/dL aumenta risco de fraqueza respiratória, disfunção miocárdica e rabdomiólise."],
        });
      }
      break;
    case "hyperphosphatemia":
      metrics.push({ label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" });
      break;
    case "hypochloremia":
      metrics.push({ label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" });
      metrics.push({ label: "Potássio atual", value: potassiumCurrent != null ? `${fmt(potassiumCurrent, 1)} mEq/L` : "não informado" });
      break;
    case "hyperchloremia":
      metrics.push({ label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" });
      metrics.push({ label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" });
      break;
  }

  return {
    headline: expandClinicalText(
      {
        hyponatremia: "Hiponatremia: diferencie neurogravidade, cronicidade presumida e perfil volêmico antes de tratar.",
        hypernatremia: "Hipernatremia: primeiro avalie volemia e perdas em curso; depois corrija a água livre de forma seriada.",
        hypokalemia: "Hipocalemia: a urgência depende do número, dos sintomas, do ECG e da via disponível para reposição.",
        hyperkalemia: "Hipercalemia: o risco imediato é elétrico; estabilize, desloque o potássio e remova o excesso do corpo.",
        hypocalcemia: "Hipocalcemia: interprete com cálcio ionizado ou corrigido pela albumina e decida pela clínica.",
        hypercalcemia: "Hipercalcemia: confirme a medida relevante e defina se o quadro é grave o suficiente para hidratação e tratamento causal.",
        hypomagnesemia: "Hipomagnesemia: assume maior relevância quando há instabilidade elétrica ou refratariedade de K ou Ca.",
        hypermagnesemia: "Hipermagnesemia: o risco é neuromuscular e hemodinâmico, sobretudo quando há depuração renal ruim.",
        hypophosphatemia: "Hipofosfatemia: decida entre via oral e intravenosa pela gravidade, sintomas e absorção.",
        hyperphosphatemia: "Hiperfosfatemia: geralmente é problema de rim, lise celular ou excesso de carga e o tratamento é causal.",
        hypochloremia: "Hipocloremia: costuma sinalizar alcalose metabólica cloro-responsiva, e não um alvo isolado.",
        hyperchloremia: "Hipercloremia: geralmente reflete carga de cloro ou perda de bicarbonato; reveja a causa e a fluidoterapia.",
      }[disorder]
    ),
    metrics,
    alerts,
    strategy: operational.strategy,
    practical: operational.practical,
    summary: [
      ...operational.summary,
      {
        title: "Resumo clínico",
        lines: [severity.signs],
      },
    ],
  };
}


export default function ElectrolyteCalculatorScreen() {
  useWindowDimensions();
  const moduleGuidelines = getModuleGuidelinesStatus("correcoes_eletroliticas");
  const guidelineStatus = moduleGuidelines.length
    ? moduleGuidelines[0]
    : getAppGuidelinesStatus().guidelineStatuses[0] ?? null;
  const [electrolyte, setElectrolyte] = useState<ElectrolyteKey>("sodium");
  const [isHypo, setIsHypo] = useState(true);
  const [sex, setSex] = useState<Sex>("male");
  const [weightKg, setWeightKg] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [current, setCurrent] = useState("");
  const [glucose, setGlucose] = useState("");
  const [albumin, setAlbumin] = useState("");
  const [calciumMode, setCalciumMode] = useState<CalciumMode>("total");
  const [currentUnit, setCurrentUnit] = useState<ElectrolyteUnit>(getDefaultUnit("sodium"));
  const [magnesiumCurrent, setMagnesiumCurrent] = useState("");
  const [magnesiumUnit, setMagnesiumUnit] = useState<ElectrolyteUnit>("mg/dL");
  const [potassiumCurrent, setPotassiumCurrent] = useState("");
  const [bicarbonate, setBicarbonate] = useState("");
  const [renalDysfunction, setRenalDysfunction] = useState(false);
  const [ecgChanges, setEcgChanges] = useState(false);
  const [pickerField, setPickerField] = useState<PickerFieldId | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCustomValue, setPickerCustomValue] = useState("");

  const electrolyteMeta = ELECTROLYTES.find((item) => item.key === electrolyte)!;
  const disorder = isHypo ? electrolyteMeta.hypo : electrolyteMeta.hyper;
  const parsedCurrent = normalizeElectrolyteValue(current, electrolyte, currentUnit);
  const automaticTarget =
    electrolyte === "calcium"
      ? deriveCalciumAutomaticTarget(disorder, calciumMode)
      : deriveAutomaticTarget(disorder, parsedCurrent);
  const automaticTargetDisplay =
    automaticTarget != null ? formatElectrolyteForUnit(automaticTarget, electrolyte, currentUnit, currentUnit === "mg/dL" ? 1 : 1) : "";
  const automaticTargetLabel =
    disorder === "hyponatremia" || disorder === "hypernatremia" ? "Meta inicial (24 h)" : "Meta / alvo";
  const severitySummary = getSeveritySummary(disorder, parsedCurrent, ecgChanges, calciumMode, parseNumber(albumin));

  function applyDisorderPreset(nextElectrolyte: ElectrolyteKey, nextIsHypo: boolean) {
    setElectrolyte(nextElectrolyte);
    setIsHypo(nextIsHypo);
    setWeightKg("");
    setAgeYears("");
    setHeightCm("");
    setCurrent("");
    setGlucose("");
    setAlbumin("");
    setCalciumMode("total");
    setCurrentUnit(getDefaultUnit(nextElectrolyte));
    setMagnesiumCurrent("");
    setMagnesiumUnit("mg/dL");
    setPotassiumCurrent("");
    setBicarbonate("");
    setRenalDysfunction(false);
    setEcgChanges(false);

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
    const inferred = detectDisorderFromCurrent(electrolyte, parsedCurrent, calciumMode);
    if (inferred == null || inferred === isHypo) return;
    setIsHypo(inferred);
  }, [parsedCurrent, electrolyte, isHypo, calciumMode]);

  const result = useMemo(
    () =>
      buildDisplayResult({
        electrolyte,
        disorder,
        calciumMode,
        currentUnit,
        sex,
        weightKg: parseNumber(weightKg),
        current: parsedCurrent,
        glucose: parseNumber(glucose),
        albumin: parseNumber(albumin),
        magnesiumCurrent: normalizeElectrolyteValue(magnesiumCurrent, "magnesium", magnesiumUnit),
        potassiumCurrent: parseNumber(potassiumCurrent),
        bicarbonate: parseNumber(bicarbonate),
        renalDysfunction,
        ecgChanges,
      }),
    [
      albumin,
      calciumMode,
      currentUnit,
      disorder,
      ecgChanges,
      electrolyte,
      bicarbonate,
      glucose,
      magnesiumCurrent,
      magnesiumUnit,
      potassiumCurrent,
      renalDysfunction,
      sex,
      weightKg,
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
        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
      </Pressable>
    );
  }

  function renderBlockLines(lines: string[], section: "solution" | "practical" | "reference") {
    const theme = getSectionTheme(section);
    return lines.map((line) => {
      const expandedLine = expandClinicalText(line);
      const priority = isPriorityLine(expandedLine);
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
          <Text style={[styles.resultLine, priority && styles.resultLinePriority]}>{expandedLine}</Text>
        </View>
      );
    });
  }

  function openPicker(field: PickerFieldId) {
    setPickerField(field);
    setPickerSearch("");
    setPickerCustomValue("");
  }

  function closePicker() {
    setPickerField(null);
    setPickerSearch("");
    setPickerCustomValue("");
  }

  function getPickerFieldValue(field: PickerFieldId) {
    switch (field) {
      case "weightKg":
        return weightKg;
      case "ageYears":
        return ageYears;
      case "heightCm":
        return heightCm;
      case "current":
        return current;
      case "glucose":
        return glucose;
      case "albumin":
        return albumin;
      case "magnesiumCurrent":
        return magnesiumCurrent;
      case "potassiumCurrent":
        return potassiumCurrent;
      case "bicarbonate":
        return bicarbonate;
    }
  }

  function clearPickerValue(field: PickerFieldId) {
    switch (field) {
      case "weightKg":
        setWeightKg("");
        break;
      case "ageYears":
        setAgeYears("");
        break;
      case "heightCm":
        setHeightCm("");
        break;
      case "current":
        setCurrent("");
        break;
      case "glucose":
        setGlucose("");
        break;
      case "albumin":
        setAlbumin("");
        break;
      case "magnesiumCurrent":
        setMagnesiumCurrent("");
        break;
      case "potassiumCurrent":
        setPotassiumCurrent("");
        break;
      case "bicarbonate":
        setBicarbonate("");
        break;
    }
  }

  function applyPickerValue(field: PickerFieldId, value: string) {
    const normalized = value.trim();
    if (!normalized) return;

    if (getPickerFieldValue(field) === normalized) {
      clearPickerValue(field);
      closePicker();
      return;
    }

    closePicker();

    switch (field) {
      case "weightKg":
        setWeightKg(normalized);
        break;
      case "ageYears":
        setAgeYears(normalized);
        break;
      case "heightCm":
        setHeightCm(normalized);
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

  function getPickerLabel(field: PickerFieldId) {
    switch (field) {
      case "weightKg":
        return "Peso (kg)";
      case "ageYears":
        return "Idade (anos)";
      case "heightCm":
        return "Altura (cm)";
      case "current":
        return electrolyte === "calcium"
          ? `${getCalciumModeLabel(calciumMode)} (${currentUnit})`
          : `Valor atual (${currentUnit})`;
      case "glucose":
        return "Glicemia (mg/dL)";
      case "albumin":
        return "Albumina (g/dL)";
      case "magnesiumCurrent":
        return `Magnésio atual (${magnesiumUnit})`;
      case "potassiumCurrent":
        return "Potássio atual (mEq/L)";
      case "bicarbonate":
        return "Bicarbonato (mEq/L)";
    }
  }

  const pickerOptions = pickerField ? buildPickerOptions(pickerField, electrolyte, currentUnit, magnesiumUnit, calciumMode) : [];
  const filteredPickerOptions = pickerSearch.trim()
    ? pickerOptions.filter((option) => option.toLowerCase().includes(pickerSearch.toLowerCase()))
    : pickerOptions;
  const selectedPickerValue = pickerField ? getPickerFieldValue(pickerField) : "";

  function input(
    label: string,
    value: string,
    field: PickerFieldId,
    placeholder?: string,
    containerStyle?: object
  ) {
    return (
      <Pressable style={[styles.inputField, containerStyle]} onPress={() => openPicker(field)}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputPicker}>
          <Text style={[styles.inputPickerValue, !value && styles.inputPickerPlaceholder]}>
            {value || placeholder || "Selecionar"}
          </Text>
        </View>
      </Pressable>
    );
  }

  function renderInlineUnitSelector(args: {
    title: string;
    units: ElectrolyteUnit[];
    selectedUnit: ElectrolyteUnit;
    onSelect: (unit: ElectrolyteUnit) => void;
    hint: string;
  }) {
    const { title, units, selectedUnit, onSelect, hint } = args;
    return (
      <View style={styles.inlineUnitSelector}>
        <Text style={styles.inlineUnitTitle}>{title}</Text>
        <View style={styles.rowWrap}>
          {units.map((unit) => renderPill(unit, selectedUnit === unit, () => onSelect(unit)))}
        </View>
        <Text style={styles.inlineUnitHint}>{hint}</Text>
      </View>
    );
  }

  const showGlucose = disorder === "hyponatremia" || disorder === "hypernatremia";
  const showCalciumMode = electrolyte === "calcium";
  const showAlbumin = electrolyte === "calcium" && calciumMode === "total";
  const showMagnesiumCurrent = disorder === "hypokalemia";
  const showPotassiumCurrent = disorder === "hypophosphatemia" || disorder === "hypochloremia";
  const showBicarbonate =
    disorder === "hypophosphatemia" ||
    disorder === "hypochloremia" ||
    disorder === "hyperchloremia";
  const showRenalToggle =
    disorder === "hypernatremia" ||
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
    if (!showMagnesiumCurrent && magnesiumCurrent) setMagnesiumCurrent("");
    if (!showPotassiumCurrent && potassiumCurrent) setPotassiumCurrent("");
    if (!showBicarbonate && bicarbonate) setBicarbonate("");
    if (!showEcgToggle && ecgChanges) setEcgChanges(false);
  }, [
    showGlucose,
    showAlbumin,
    showMagnesiumCurrent,
    showPotassiumCurrent,
    showBicarbonate,
    showEcgToggle,
    glucose,
    albumin,
    magnesiumCurrent,
    potassiumCurrent,
    bicarbonate,
    ecgChanges,
  ]);

  const displayMetrics = result.metrics
    .filter((metric, index) => {
      const normalizedLabel = getMetricLabel(metric.label);
      return index === 0 || getCompactMetricLabels(disorder).includes(metric.label) || getCompactMetricLabels(disorder).includes(normalizedLabel);
    })
    .slice(0, 3)
    .map((metric) => ({
      ...metric,
      label: getMetricLabel(metric.label),
    }));
  const severityTheme = getSeverityTheme(severitySummary.label);
  const referenceBlocks = [...result.alerts, ...result.summary, { title: "Base de referência", lines: getEvidenceBaseLines(disorder) }];
  const importantNowLines = [...result.alerts.flatMap((block) => block.lines), ...getImmediatePriorityLines(disorder)].slice(0, 3);
  const understandingLines = getInitialStrategyLines(disorder, result.headline).slice(0, 3).map(expandClinicalText);
  const monitoringLines = getMonitoringLines(disorder);
  const navigationItems = ELECTROLYTES.map((item) => ({
    id: item.key,
    icon: item.icon,
    label: item.label,
    hint: `${getDisorderLabel(item.hypo)} / ${getDisorderLabel(item.hyper)}`,
    accent: item.accent,
  }));
  const heroMetrics = [
    { label: "Eletrólito", value: electrolyteMeta.label, accent: electrolyteMeta.accent },
    { label: "Distúrbio", value: isHypo ? getDisorderLabel(electrolyteMeta.hypo) : getDisorderLabel(electrolyteMeta.hyper), accent: severityTheme.text },
    { label: "Classificação", value: severitySummary.label, accent: severityTheme.text },
    { label: "Status", value: guidelineStatus?.statusLabel ?? "Revisar", accent: guidelineStatus?.statusLabel === "Atualizado" ? "#047857" : "#b45309" },
  ];

  return (
    <View style={styles.screen}>
      <ModuleFlowLayout
        hero={
          <ModuleFlowHero
            eyebrow="Correções eletrolíticas"
            title="Calculadora alinhada ao padrão dos módulos"
            subtitle="Mesmo herói, mesma navegação e mesma hierarquia de leitura para reduzir a troca de contexto entre protocolos e calculadoras."
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
        contentHint={severitySummary.signs}
        contentBadgeText="Correção guiada">
        <ModuleFlowContent style={styles.mainScroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>ESTRATÉGIA INICIAL</Text>
              <View style={styles.rowWrap}>
                {renderPill(getDisorderLabel(electrolyteMeta.hypo), isHypo, () => applyDisorderPreset(electrolyte, true))}
                {renderPill(getDisorderLabel(electrolyteMeta.hyper), !isHypo, () => applyDisorderPreset(electrolyte, false))}
              </View>
              <View
                style={[
                  styles.clinicalSummaryCard,
                  {
                    borderColor: severityTheme.border,
                    backgroundColor: severityTheme.background,
                  },
                ]}>
                <Text style={styles.clinicalSummaryLabel}>Classificação atual</Text>
                <Text style={[styles.clinicalSummaryValue, { color: severityTheme.text }]}>{severitySummary.label}</Text>
                <Text style={styles.clinicalSummaryText}>{severitySummary.signs}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>PACIENTE</Text>
              <View style={styles.patientPrimaryGrid}>
                {input("Peso (kg)", weightKg, "weightKg", "70", styles.patientPrimaryItem)}
                {input("Idade (anos)", ageYears, "ageYears", "adulto", styles.patientPrimaryItem)}
                {input("Altura (cm)", heightCm, "heightCm", "170", styles.patientPrimaryItem)}
                <View style={[styles.selectorCard, styles.patientPrimaryItem]}>
                  <Text style={styles.inputLabel}>Sexo e água corporal</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Masculino", sex === "male", () => setSex("male"))}
                    {renderPill("Feminino", sex === "female", () => setSex("female"))}
                  </View>
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.inputGroup}>
                  {input(
                    electrolyte === "calcium" ? getCalciumModeLabel(calciumMode) : "Valor atual",
                    current,
                    "current",
                    "Selecionar"
                  )}
                  {renderInlineUnitSelector({
                    title: "Unidade deste eletrólito",
                    units: getAllowedUnits(electrolyte),
                    selectedUnit: currentUnit,
                    onSelect: handleCurrentUnitChange,
                    hint: `${getUnitConversionHint(electrolyte)} ${getElectrolyteReferenceText(electrolyte, calciumMode)}`,
                  })}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{automaticTargetLabel}</Text>
                  <View style={[styles.inputPicker, styles.inputPickerLocked]}>
                    <Text style={styles.inputPickerValue}>
                      {automaticTargetDisplay ? `${automaticTargetDisplay} ${currentUnit}` : "Automático"}
                    </Text>
                  </View>
                </View>
                {showGlucose ? input("Glicemia (mg/dL)", glucose, "glucose", "se disponível", styles.inputGroup) : null}
                {showAlbumin ? input("Albumina (g/dL)", albumin, "albumin", "Selecionar", styles.inputGroup) : null}
                {showMagnesiumCurrent ? (
                  <View style={styles.inputGroup}>
                    {input("Magnésio atual", magnesiumCurrent, "magnesiumCurrent", "se disponível")}
                    {renderInlineUnitSelector({
                      title: "Unidade do magnésio",
                      units: getAllowedUnits("magnesium"),
                      selectedUnit: magnesiumUnit,
                      onSelect: handleMagnesiumUnitChange,
                      hint: getUnitConversionHint("magnesium"),
                    })}
                  </View>
                ) : null}
                {showPotassiumCurrent
                  ? input("Potássio atual (mEq/L)", potassiumCurrent, "potassiumCurrent", "se relevante", styles.inputGroup)
                  : null}
                {showBicarbonate
                  ? input("Bicarbonato (mEq/L)", bicarbonate, "bicarbonate", "se disponível", styles.inputGroup)
                  : null}
              </View>

              {showCalciumMode ? (
                <>
                  <Text style={styles.fieldSectionLabel}>Tipo de cálcio</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Cálcio total", calciumMode === "total", () => setCalciumMode("total"))}
                    {renderPill("Cálcio ionizado", calciumMode === "ionized", () => setCalciumMode("ionized"))}
                  </View>
                  <View style={styles.contextHintCard}>
                    <Text style={styles.contextHintText}>{getCalciumReferenceText(calciumMode)}</Text>
                  </View>
                </>
              ) : null}

              {showRenalToggle ? (
                <>
                  <Text style={styles.fieldSectionLabel}>Função renal</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Sem disfunção", !renalDysfunction, () => setRenalDysfunction(false))}
                    {renderPill("Com disfunção", renalDysfunction, () => setRenalDysfunction(true))}
                  </View>
                </>
              ) : null}

              {showEcgToggle ? (
                <>
                  <Text style={styles.fieldSectionLabel}>ECG</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Sem alteração", !ecgChanges, () => setEcgChanges(false))}
                    {renderPill("Com alteração", ecgChanges, () => setEcgChanges(true))}
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>CÁLCULO RÁPIDO</Text>
              <Text style={styles.headline}>{expandClinicalText(result.headline)}</Text>
              <View style={styles.metricGrid}>
                {displayMetrics.map((metric) => (
                  <View key={`${metric.label}-${metric.value}`} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.guidanceGrid}>
              <View
                style={[
                  styles.guidanceCard,
                  styles.guidanceCardCritical,
                  {
                    borderColor: severityTheme.border,
                    backgroundColor: severityTheme.background,
                  },
                ]}>
                <Text style={[styles.guidanceEyebrow, { color: severityTheme.text }]}>O QUE IMPORTA AGORA</Text>
                <Text style={styles.guidanceTitle}>Prioridade imediata</Text>
                {importantNowLines.map((line) => (
                  <View key={line} style={styles.guidanceRow}>
                    <View style={[styles.guidanceBar, { backgroundColor: severityTheme.text }]} />
                    <Text style={styles.guidanceText}>{expandClinicalText(line)}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.guidanceCard, styles.guidanceCardInfo]}>
                <Text style={styles.guidanceEyebrow}>COMO INTERPRETAR</Text>
                <Text style={styles.guidanceTitle}>Leitura clínica</Text>
                {understandingLines.map((line) => (
                  <View key={line} style={styles.guidanceRow}>
                    <View style={[styles.guidanceBar, { backgroundColor: "#2563eb" }]} />
                    <Text style={styles.guidanceText}>{expandClinicalText(line)}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.guidanceCard, styles.guidanceCardSafe]}>
                <Text style={styles.guidanceEyebrow}>SEGURANÇA</Text>
                <Text style={styles.guidanceTitle}>Monitorização</Text>
                {monitoringLines.map((line) => (
                  <View key={line} style={styles.guidanceRow}>
                    <View style={[styles.guidanceBar, { backgroundColor: "#059669" }]} />
                    <Text style={styles.guidanceText}>{expandClinicalText(line)}</Text>
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
                <Text style={[styles.cardLabel, { color: getSectionTheme("solution").header }]}>CONDUTA DIRETA</Text>
                {result.strategy.map((block) => (
                  <View key={block.title} style={styles.blockGroup}>
                    <Text style={[styles.blockTitle, { color: getSectionTheme("solution").title }]}>
                      {getDisplayBlockTitle(block.title)}
                    </Text>
                    {renderBlockLines(block.lines, "solution")}
                  </View>
                ))}
              </View>
            )}

            {result.practical.length > 0 && (
              <View
                style={[
                  styles.card,
                  styles.resultCard,
                  {
                    backgroundColor: getSectionTheme("practical").cardBg,
                    borderColor: getSectionTheme("practical").cardBorder,
                  },
                ]}>
                <Text style={[styles.cardLabel, { color: getSectionTheme("practical").header }]}>PREPARO E EXECUÇÃO</Text>
                {result.practical.map((block) => (
                  <View key={block.title} style={styles.blockGroup}>
                    <Text style={[styles.blockTitle, { color: getSectionTheme("practical").title }]}>
                      {getDisplayBlockTitle(block.title)}
                    </Text>
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
                <Text style={[styles.cardLabel, { color: getSectionTheme("reference").header }]}>PONTOS-CHAVE</Text>
                {referenceBlocks.map((block) => (
                  <View key={block.title} style={styles.blockGroup}>
                    <Text style={[styles.blockTitle, { color: getSectionTheme("reference").title }]}>{getDisplayBlockTitle(block.title)}</Text>
                    {renderBlockLines(block.lines, "reference")}
                  </View>
                ))}
              </View>
            )}
        </ModuleFlowContent>
      </ModuleFlowLayout>

      <Modal visible={pickerField != null} transparent animationType="slide" onRequestClose={closePicker}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closePicker} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pickerField ? getPickerLabel(pickerField) : "Selecionar"}</Text>
              <Pressable onPress={closePicker} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder="Buscar..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView contentContainerStyle={styles.modalOptions}>
              {filteredPickerOptions.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.modalOption, selectedPickerValue === option && styles.modalOptionSelected]}
                  onPress={() => pickerField && applyPickerValue(pickerField, option)}>
                  <Text style={[styles.modalOptionText, selectedPickerValue === option && styles.modalOptionTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalCustomSection}>
              <Text style={styles.modalCustomLabel}>Outro valor:</Text>
              <View style={styles.modalCustomRow}>
                <TextInput
                  value={pickerCustomValue}
                  onChangeText={setPickerCustomValue}
                  placeholder="Ex.: 125"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  style={styles.modalCustomInput}
                />
                <Pressable
                  style={[styles.modalAddButton, !pickerCustomValue.trim() && styles.modalAddButtonDisabled]}
                  onPress={() => pickerField && applyPickerValue(pickerField, pickerCustomValue)}
                  disabled={!pickerCustomValue.trim()}>
                  <Text style={styles.modalAddButtonText}>+ Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppDesign.canvas.background },
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
  versionHint: { fontSize: 11, fontWeight: "700", maxWidth: "42%" },
  versionOk: { color: AppDesign.accent.teal },
  versionWarn: { color: "#a16207" },
  versionAlert: { color: "#b91c1c" },
  bodyWrap: { flex: 1, alignItems: "center", paddingHorizontal: 12, paddingVertical: 14 },
  body: {
    flex: 1,
    flexDirection: "row",
    gap: 14,
    width: "100%",
    maxWidth: 1120,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  bodyCompact: { maxWidth: "100%", borderRadius: 0, gap: 10 },
  sidebar: {
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
  sidebarCompact: { width: 74 },
  sidebarInner: { paddingVertical: 12, paddingHorizontal: 8, gap: 8 },
  sideItem: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 6, borderRadius: 16, marginHorizontal: 0 },
  sideItemActive: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dbe7f8", ...AppDesign.shadow.card },
  sideIconShell: {
    width: 56,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 8,
    gap: 1,
  },
  sideGlyph: { fontSize: 13 },
  sideEmoji: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  sideName: { fontSize: 9, fontWeight: "700", color: "#64748b", textAlign: "center", marginTop: 5, lineHeight: 12 },
  sideNameActive: { color: "#334155" },
  mainScroll: { flex: 1, minHeight: 0, backgroundColor: "transparent" },
  scroll: { flexGrow: 1, padding: 16, gap: 14, paddingBottom: 28, width: "100%" },
  card: { backgroundColor: "#ffffff", borderRadius: 24, padding: 16, gap: 12, borderWidth: 1, borderColor: AppDesign.border.subtle, ...AppDesign.shadow.card },
  cardLabel: { fontSize: 10, fontWeight: "800", color: "#64748b", letterSpacing: 1 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: "#e0f2fe", borderWidth: 1, borderColor: "#bae6fd" },
  statusChipText: { fontSize: 13, fontWeight: "800", color: "#0c4a6e" },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#bfd0ea",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#eef4ff",
  },
  pillPrimary: {
    backgroundColor: "#e3ecff",
  },
  pillSelected: {
    backgroundColor: "#102128",
    borderColor: "#102128",
  },
  pillPrimarySelected: {
    backgroundColor: "#173767",
    borderColor: "#173767",
  },
  pillPressed: {
    opacity: 0.88,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#21406d",
  },
  pillTextSelected: {
    color: "#f5f7fb",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  patientPrimaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  patientPrimaryItem: {
    flexBasis: "23%",
    flexGrow: 1,
    minWidth: 180,
  },
  inputField: {
    gap: 6,
  },
  inputGroup: {
    flexBasis: "48%",
    minWidth: 150,
    gap: 6,
  },
  inlineUnitSelector: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8e6fb",
    backgroundColor: "#f8fbff",
    padding: 12,
    gap: 10,
  },
  inlineUnitTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#64748b",
  },
  inlineUnitHint: {
    fontSize: 12,
    lineHeight: 17,
    color: "#526377",
    fontWeight: "700",
  },
  contextHintCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#f8fbff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contextHintText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#526377",
    fontWeight: "700",
  },
  selectorCard: {
    minWidth: 220,
    gap: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#34465f",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bfd0ea",
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#102128",
    fontWeight: "700",
  },
  inputPicker: {
    borderWidth: 1,
    borderColor: "#bfd0ea",
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  inputPickerLocked: {
    backgroundColor: "#f1f5f9",
  },
  inputPickerValue: {
    fontSize: 16,
    color: "#102128",
    fontWeight: "700",
  },
  inputPickerPlaceholder: {
    color: "#7a8aa6",
  },
  fieldSectionLabel: { fontSize: 10, fontWeight: "800", color: "#64748b", letterSpacing: 1, marginTop: 2 },
  clinicalSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cfe0f7",
    backgroundColor: "#eef4ff",
    padding: 12,
    gap: 4,
  },
  clinicalSummaryLabel: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#64748b",
  },
  clinicalSummaryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#16356b",
  },
  clinicalSummaryText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "600",
  },
  headline: {
    fontSize: 16,
    lineHeight: 23,
    color: "#20364c",
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
    borderColor: "#ccdbf3",
    backgroundColor: "#eef4ff",
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#687b96",
  },
  metricValue: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: "#16356b",
  },
  guidanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  guidanceCard: {
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 250,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    backgroundColor: "#ffffff",
  },
  guidanceCardCritical: {
    shadowColor: "#c2410c",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  guidanceCardInfo: {
    borderColor: "#bfdbfe",
    backgroundColor: "#f8fbff",
  },
  guidanceCardSafe: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f4fff8",
  },
  guidanceEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#5b6b82",
  },
  guidanceTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    color: "#16324f",
  },
  guidanceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  guidanceBar: {
    width: 6,
    minHeight: 26,
    borderRadius: 999,
  },
  guidanceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#22384f",
    fontWeight: "700",
  },
  blockGroup: { gap: 6 },
  blockTitle: { fontSize: 15, fontWeight: "800", color: "#16356b" },
  resultCard: {
    gap: 12,
  },
  solutionBlock: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cfe0f7",
    backgroundColor: "rgba(255,255,255,0.56)",
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
  resultTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  resultLine: {
    fontSize: 15,
    lineHeight: 22,
    color: "#23384f",
    fontWeight: "600",
    flex: 1,
  },
  resultLinePriority: {
    color: "#102128",
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.42)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    maxHeight: "86%",
    backgroundColor: "#f8f5ef",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#d6e0ef",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#102128",
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#475569",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    borderRadius: 16,
    backgroundColor: "#fffdfa",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    padding: 0,
  },
  modalOptions: {
    gap: 10,
    paddingBottom: 8,
  },
  modalOption: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#eef4ff",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  modalOptionSelected: {
    backgroundColor: AppDesign.accent.primaryMuted,
    borderColor: AppDesign.accent.primary,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#334155",
  },
  modalOptionTextSelected: {
    color: AppDesign.accent.teal,
  },
  modalCustomSection: {
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#d6e0ef",
  },
  modalCustomLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  modalCustomRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalCustomInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    borderRadius: 16,
    backgroundColor: "#fffdfa",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "700",
  },
  modalAddButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    minWidth: 78,
  },
  modalAddButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  modalAddButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },
});
