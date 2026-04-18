import type { CoronarySnapshot } from "./domain";

export function interpretTroponin(snapshot: CoronarySnapshot) {
  const ref = snapshot.biomarkers.labReference;
  const t1 = snapshot.biomarkers.troponin1Value;
  const t2 = snapshot.biomarkers.troponin2Value;
  const t3 = snapshot.biomarkers.troponin3Value;

  if (ref == null || t1 == null) {
    return {
      label: "Troponina pendente / incompleta",
      isPositive: false,
      isDynamic: false,
      lines: ["Sem valor inicial e limite de referência suficientes para classificar."],
    };
  }

  const values = [t1, t2, t3].filter((value) => value != null);
  const isPositive = values.some((value) => value > ref);
  const isDynamic =
    values.length >= 2 &&
    values.some((value, index) => index > 0 && Math.abs(value - values[index - 1]) >= ref * 0.2);

  return {
    label: isPositive ? (isDynamic ? "Troponina positiva e dinâmica" : "Troponina positiva") : values.length >= 2 ? "Troponina sem elevação significativa" : "Troponina inicial negativa / incompleta",
    isPositive,
    isDynamic,
    lines: [
      `Tipo: ${snapshot.biomarkers.troponinType || "não informado"}`,
      `Referência: ${ref}`,
      `Série: ${values.join(" → ")}`,
    ],
  };
}
