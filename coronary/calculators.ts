import { ANTICOAG_REGIMENS, LYTIC_REGIMENS } from "./protocol-config";
import type { CoronaryDoseCalculation } from "./domain";

export function calculateLyticDose(regimenId: string, weightKg: number | null): CoronaryDoseCalculation {
  const lytic = LYTIC_REGIMENS.find((item) => item.id === regimenId) ?? LYTIC_REGIMENS[0];
  if (!weightKg || weightKg <= 0) {
    return {
      regimenId: lytic.id,
      title: lytic.label,
      lines: ["Peso não informado: cálculo bloqueado até obter peso confiável."],
      caution: ["Confirmar peso antes de trombólise."],
    };
  }

  if (lytic.id === "tenecteplase_stemi") {
    const band = lytic.weightBands.find((item) => weightKg <= item.maxKg) ?? lytic.weightBands[lytic.weightBands.length - 1];
    return {
      regimenId: lytic.id,
      title: lytic.label,
      lines: [`Dose em bolus único: ${band.doseMg} mg`, lytic.note],
      caution: ["Confirmar indicação e contraindicações antes da administração."],
    };
  }

  const phaseTwo = Math.min(weightKg * 0.75, 50);
  const phaseThree = Math.min(weightKg * 0.5, 35);
  return {
    regimenId: lytic.id,
    title: lytic.label,
    lines: [
      "15 mg em bolus IV imediato",
      `${phaseTwo.toFixed(1)} mg em 30 min`,
      `${phaseThree.toFixed(1)} mg em 60 min`,
      lytic.note,
    ],
    caution: ["Conferir protocolo local e dose total máxima antes de administrar."],
  };
}

export function calculateAnticoagulation(regimenId: string, weightKg: number | null, age: number | null, ckd: boolean): CoronaryDoseCalculation {
  const regimen = ANTICOAG_REGIMENS.find((item) => item.id === regimenId) ?? ANTICOAG_REGIMENS[0];
  if (!weightKg || weightKg <= 0) {
    return {
      regimenId: regimen.id,
      title: regimen.label,
      lines: ["Peso não informado: cálculo bloqueado."],
      caution: ["Confirmar peso e função renal."],
    };
  }

  if (regimen.id === "ufh_stemi") {
    const bolus = Math.min(weightKg * regimen.bolusPerKg, regimen.bolusMax);
    const infusion = Math.min(weightKg * regimen.infusionPerKgHour, regimen.infusionMaxHour);
    return {
      regimenId: regimen.id,
      title: regimen.label,
      lines: [`Bolus: ${Math.round(bolus)} U IV`, `Infusão: ${Math.round(infusion)} U/h`, regimen.note],
      caution: ["Monitorar TTPa/anti-Xa conforme protocolo."],
    };
  }

  const elderly = age != null && age >= 75;
  if (ckd) {
    return {
      regimenId: regimen.id,
      title: regimen.label,
      lines: [
        "Sem bolus IV",
        `${weightKg.toFixed(0)} mg SC a cada 24 h`,
        regimen.note,
      ],
      caution: ["Ajustado para disfunção renal importante; confirmar protocolo institucional."],
    };
  }

  if (elderly) {
    return {
      regimenId: regimen.id,
      title: regimen.label,
      lines: ["Sem bolus IV", `${(weightKg * 0.75).toFixed(0)} mg SC a cada 12 h`, regimen.note],
      caution: ["Idade ≥ 75 anos: sem bolus IV."],
    };
  }

  return {
    regimenId: regimen.id,
    title: regimen.label,
    lines: ["30 mg IV em bolus", `${weightKg.toFixed(0)} mg SC a cada 12 h`, regimen.note],
    caution: ["Confirmar função renal e sangramento antes de iniciar."],
  };
}
