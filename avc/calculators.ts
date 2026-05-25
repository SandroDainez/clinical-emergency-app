import { THROMBOLYTICS } from "./protocol-config";
import type { AvcDoseCalculation } from "./domain";

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function calculateThrombolyticDose(thrombolyticId: string, weightKg: number | null, estimatedWeight: boolean): AvcDoseCalculation {
  const drug = THROMBOLYTICS.find((item) => item.id === thrombolyticId) ?? THROMBOLYTICS[0];
  const caution: string[] = [];

  if (!weightKg || weightKg <= 0) {
    return {
      thrombolyticId: drug.id,
      totalDoseMg: null,
      bolusDoseMg: null,
      infusionDoseMg: null,
      infusionMinutes: drug.infusionMinutes ?? null,
      caution: [
        "Peso não informado: cálculo bloqueado até informar peso confiável.",
      ],
    };
  }

  if (estimatedWeight) {
    caution.push("Peso estimado: confirmar antes da administração.");
  }

  const rawTotal = Math.min(weightKg * drug.doseMgPerKg, drug.maxDoseMg);
  const totalDoseMg = roundToStep(rawTotal, drug.roundingStepMg);

  if (drug.bolusOnly) {
    return {
      thrombolyticId: drug.id,
      totalDoseMg,
      bolusDoseMg: totalDoseMg,
      infusionDoseMg: null,
      infusionMinutes: null,
      caution,
    };
  }

  const bolusDoseMg = roundToStep(totalDoseMg * (drug.bolusFraction ?? 0), drug.roundingStepMg);
  const infusionDoseMg = roundToStep(totalDoseMg - bolusDoseMg, drug.roundingStepMg);

  return {
    thrombolyticId: drug.id,
    totalDoseMg,
    bolusDoseMg,
    infusionDoseMg,
    infusionMinutes: drug.infusionMinutes ?? null,
    caution,
  };
}
