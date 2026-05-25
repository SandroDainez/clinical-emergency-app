import type { CoronaryScoreResult, CoronarySnapshot } from "./domain";

function countRiskFactors(snapshot: CoronarySnapshot) {
  return [
    snapshot.patient.diabetes,
    snapshot.patient.hypertension,
    snapshot.patient.dyslipidemia,
    snapshot.patient.smoking,
    snapshot.patient.priorCad,
  ].filter((item) => item === "yes").length;
}

export function computeKillip(snapshot: CoronarySnapshot): CoronaryScoreResult {
  const killip = snapshot.exam.killip.trim();
  const mapping: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4 };
  const numeric = mapping[killip] ?? null;
  const tier =
    numeric == null ? "Indeterminado" : numeric === 1 ? "Baixo risco hemodinâmico" : numeric === 2 ? "Congestão / IC" : numeric === 3 ? "Edema agudo de pulmão" : "Choque cardiogênico";
  return {
    label: "Killip-Kimball",
    value: numeric,
    tier,
    rationale: numeric == null ? ["Killip não preenchido."] : [`Classe ${killip}.`],
    missing: numeric == null ? ["Killip-Kimball"] : [],
    impact: numeric == null ? "Necessário para gravidade." : numeric >= 3 ? "Sugere leito intensivo e estratégia agressiva." : "Usar em conjunto com o restante do quadro.",
  };
}

export function computeHeart(snapshot: CoronarySnapshot): CoronaryScoreResult {
  const missing: string[] = [];
  let total = 0;

  if (snapshot.patient.age == null) {
    missing.push("idade");
  } else if (snapshot.patient.age >= 65) {
    total += 2;
  } else if (snapshot.patient.age >= 45) {
    total += 1;
  }

  const historyClass = snapshot.pain.subjectiveClassification.toLowerCase();
  if (!historyClass) {
    missing.push("classificação subjetiva da dor");
  } else if (historyClass.includes("típica")) {
    total += 2;
  } else if (historyClass.includes("provavelmente")) {
    total += 1;
  }

  if (snapshot.ecg.stElevation === "yes" || snapshot.ecg.stDepression === "yes") {
    total += 2;
  } else if (snapshot.ecg.twaveInversion === "yes") {
    total += 1;
  } else if (snapshot.ecg.inconclusive === "unknown") {
    missing.push("ECG");
  }

  const riskFactors = countRiskFactors(snapshot) + (snapshot.patient.priorCad === "yes" ? 1 : 0);
  if (riskFactors >= 3) total += 2;
  else if (riskFactors >= 1) total += 1;

  const troponin = snapshot.biomarkers.troponin1Value;
  const reference = snapshot.biomarkers.labReference;
  if (troponin == null || reference == null) {
    missing.push("troponina inicial");
  } else if (troponin > 3 * reference) {
    total += 2;
  } else if (troponin > reference) {
    total += 1;
  }

  const tier = total <= 3 ? "Baixo" : total <= 6 ? "Intermediário" : "Alto";

  return {
    label: "HEART",
    value: missing.length ? null : total,
    tier,
    rationale: [
      `Fatores de risco contabilizados: ${riskFactors}.`,
      snapshot.ecg.stElevation === "yes" ? "ECG com alteração importante." : "ECG sem supra persistente informado.",
    ],
    missing,
    impact:
      missing.length > 0
        ? "Não usar para alta até completar os dados."
        : tier === "Alto"
          ? "Favorece internação / investigação intensiva."
          : tier === "Intermediário"
            ? "Favorece observação e série diagnóstica."
            : "Pode apoiar observação curta, nunca isoladamente.",
  };
}

export function computeTimi(snapshot: CoronarySnapshot): CoronaryScoreResult {
  let score = 0;
  const missing: string[] = [];
  const riskFactors = countRiskFactors(snapshot);

  if (snapshot.patient.age == null) missing.push("idade");
  else if (snapshot.patient.age >= 65) score += 1;
  if (riskFactors >= 3) score += 1;
  if (snapshot.patient.priorCad === "yes") score += 1;
  if (snapshot.patient.antiplatelets.toLowerCase().includes("aas")) score += 1;
  if (snapshot.pain.recurrence === "yes" || snapshot.pain.restPain === "yes" || snapshot.pain.progressionRecent === "yes") score += 1;
  if (snapshot.ecg.stDepression === "yes") score += 1;
  if (snapshot.biomarkers.troponin1Value != null && snapshot.biomarkers.labReference != null && snapshot.biomarkers.troponin1Value > snapshot.biomarkers.labReference) score += 1;
  if (snapshot.biomarkers.troponin1Value == null || snapshot.biomarkers.labReference == null) missing.push("troponina");

  const tier = score <= 2 ? "Baixo" : score <= 4 ? "Intermediário" : "Alto";

  return {
    label: "TIMI UA/NSTEMI",
    value: missing.length ? null : score,
    tier,
    rationale: [`Score baseado em idade, fatores de risco, DAC conhecida, AAS prévio, recorrência, ECG e troponina.`],
    missing,
    impact:
      missing.length > 0
        ? "Completar dados antes de usar para decisão."
        : tier === "Alto"
          ? "Favorece estratégia invasiva precoce e internação monitorizada."
          : tier === "Intermediário"
            ? "Sugere observação/invasiva conforme contexto."
            : "Pode apoiar manejo conservador, nunca isoladamente.",
  };
}

export function computeGrace(snapshot: CoronarySnapshot): CoronaryScoreResult {
  const missing: string[] = [];
  let score = 0;
  const age = snapshot.patient.age;
  const hr = snapshot.exam.heartRate;
  const sbp = snapshot.exam.systolicPressure;
  const creat = snapshot.biomarkers.labReference == null ? snapshot.patient.ckd === "yes" ? 2 : null : snapshot.patient.ckd === "yes" ? 2 : 1;
  const killip = computeKillip(snapshot).value;

  if (age == null) missing.push("idade");
  else if (age >= 90) score += 100;
  else if (age >= 80) score += 91;
  else if (age >= 70) score += 73;
  else if (age >= 60) score += 55;
  else if (age >= 50) score += 36;
  else if (age >= 40) score += 18;

  if (hr == null) missing.push("FC");
  else if (hr >= 200) score += 46;
  else if (hr >= 150) score += 38;
  else if (hr >= 110) score += 24;
  else if (hr >= 90) score += 15;
  else if (hr >= 70) score += 9;
  else if (hr >= 50) score += 3;

  if (sbp == null) missing.push("PAS");
  else if (sbp < 80) score += 58;
  else if (sbp < 100) score += 53;
  else if (sbp < 120) score += 43;
  else if (sbp < 140) score += 34;
  else if (sbp < 160) score += 24;
  else if (sbp < 200) score += 10;

  if (creat == null) missing.push("função renal");
  else if (creat >= 2) score += 28;
  else score += 7;

  if (killip == null) missing.push("Killip");
  else if (killip === 2) score += 20;
  else if (killip === 3) score += 39;
  else if (killip === 4) score += 59;

  if (snapshot.ecg.stDepression === "yes" || snapshot.ecg.stElevation === "yes") score += 28;
  if (snapshot.biomarkers.troponin1Value != null && snapshot.biomarkers.labReference != null && snapshot.biomarkers.troponin1Value > snapshot.biomarkers.labReference) score += 14;
  else if (snapshot.biomarkers.troponin1Value == null || snapshot.biomarkers.labReference == null) missing.push("troponina");

  const tier = score >= 140 ? "Alto" : score >= 109 ? "Intermediário" : "Baixo";
  return {
    label: "GRACE",
    value: missing.length ? null : score,
    tier,
    rationale: ["Estimativa por idade, FC, PAS, função renal, Killip, ECG e biomarcadores."],
    missing,
    impact:
      missing.length > 0
        ? "Não usar como base única com dados faltantes."
        : tier === "Alto"
          ? "Favorece estratégia invasiva precoce/intensiva."
          : tier === "Intermediário"
            ? "Sugere internação e observação monitorizada."
            : "Pode apoiar estratégia conservadora se restante do quadro permitir.",
  };
}
