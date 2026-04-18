import type {
  CoronaryCategory,
  CoronaryDecisionGate,
  CoronaryMedicationDecision,
  CoronarySnapshot,
  CoronaryTherapyDecision,
  ReperfusionStrategy,
} from "./domain";
import { CORONARY_WINDOWS, DESTINATION_LABELS, MEDICATION_LABELS, THROMBOLYSIS_CONTRAS } from "./protocol-config";
import { interpretTroponin } from "./biomarkers";
import { interpretEcg } from "./ecg";
import { computeGrace, computeHeart, computeKillip, computeTimi } from "./scores";

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function elapsedMinutes(start: string, end: string): number | null {
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  if (s == null || e == null) return null;
  return e >= s ? e - s : e + 1440 - s;
}

function hasTypicalFeatures(snapshot: CoronarySnapshot) {
  return (
    snapshot.pain.subjectiveClassification.toLowerCase().includes("típica") ||
    snapshot.pain.effortRelated === "yes" ||
    snapshot.pain.restPain === "yes" ||
    snapshot.pain.ischemicEquivalent === "yes"
  );
}

function isPositiveContra(snapshot: CoronarySnapshot, id: string) {
  return snapshot.contraindications[id]?.status === "present";
}

function buildDecision(
  label: string,
  gate: CoronaryDecisionGate,
  rationale: string[],
  blockers: string[],
  correctableItems: string[]
): CoronaryTherapyDecision {
  return { label, gate, rationale, blockers, correctableItems };
}

export function classifyCoronaryCase(snapshot: CoronarySnapshot): { category: CoronaryCategory; rationale: string[] } {
  const troponin = interpretTroponin(snapshot);
  const ecg = interpretEcg(snapshot);
  const rationale: string[] = [];

  if (ecg.hasStemiPattern) {
    rationale.push("ECG com padrão compatível com STEMI.");
    return { category: "stemi", rationale };
  }
  if (troponin.isPositive || troponin.isDynamic) {
    rationale.push("Troponina positiva/dinâmica sem supra persistente.");
    return { category: "nstemi", rationale };
  }
  if (hasTypicalFeatures(snapshot) && (snapshot.pain.restPain === "yes" || snapshot.pain.recurrence === "yes" || snapshot.pain.progressionRecent === "yes")) {
    rationale.push("Dor com características isquêmicas em repouso/recorrente sem biomarcador positivo.");
    return { category: "unstable_angina", rationale };
  }
  if (hasTypicalFeatures(snapshot) && snapshot.pain.effortRelated === "yes" && snapshot.pain.restPain !== "yes") {
    rationale.push("Sintomas estáveis relacionados a esforço, sem evidência de evento agudo.");
    return { category: "stable_angina", rationale };
  }
  if (snapshot.pain.reproduciblePain === "yes" || snapshot.pain.pleuriticPain === "yes") {
    rationale.push("Dor mais compatível com diagnóstico alternativo.");
    return { category: "non_coronary", rationale };
  }
  rationale.push("Dados insuficientes ou conflitantes para classificação segura.");
  return { category: "indeterminate", rationale };
}

export function evaluateCoronaryStrategies(snapshot: CoronarySnapshot) {
  const ecg = interpretEcg(snapshot);
  const troponin = interpretTroponin(snapshot);
  const classification = classifyCoronaryCase(snapshot);
  const heart = computeHeart(snapshot);
  const timi = computeTimi(snapshot);
  const grace = computeGrace(snapshot);
  const killip = computeKillip(snapshot);
  const blockers: string[] = [];
  const correctables: string[] = [];
  const rationale: string[] = [];

  const onsetToArrival = elapsedMinutes(snapshot.pain.onsetTime, snapshot.pain.arrivalTime);
  const diagnosisDelay = elapsedMinutes(snapshot.pain.arrivalTime, snapshot.logistics.diagnosisTime);

  if (!snapshot.ecg.firstEcgTime) blockers.push("Primeiro ECG não registrado.");
  if (snapshot.ecg.inconclusive === "yes") blockers.push("ECG inconclusivo para decisão automática.");
  if (snapshot.exam.abcInstability === "yes") correctables.push("Instabilidade clínica: priorizar estabilização antes da estratégia definitiva.");
  if (diagnosisDelay != null) rationale.push(`Tempo chegada-diagnóstico: ${diagnosisDelay} min.`);
  if (onsetToArrival != null) rationale.push(`Tempo início da dor-chegada: ${onsetToArrival} min.`);

  const stemi = classification.category === "stemi";
  const lyticBlockers = THROMBOLYSIS_CONTRAS.filter((item) => isPositiveContra(snapshot, item.id)).map((item) => `${item.name}: ${item.impact}`);
  const lyticCorrectables = THROMBOLYSIS_CONTRAS.filter((item) => isPositiveContra(snapshot, item.id) && item.correctable).map((item) => `${item.name}: ${item.correctionGuidance ?? item.description}`);

  let reperfusionStrategy: ReperfusionStrategy = "no_reperfusion";

  const reperfusion = (() => {
    if (!stemi) {
      return buildDecision("Sem reperfusão imediata", "needs_review", ["Fluxo não classificado como STEMI."], [], []);
    }
    if (snapshot.logistics.cathLabAvailable === "yes" && (snapshot.logistics.expectedPciDelayMin ?? 999) <= CORONARY_WINDOWS.primaryPciTargetMin) {
      reperfusionStrategy = "primary_pci";
      return buildDecision("STEMI: reperfusão imediata com angioplastia primária", "eligible", [...rationale, "Hemodinâmica disponível dentro do alvo de tempo."], blockers, correctables);
    }
    if (snapshot.logistics.cathLabAvailable !== "yes" && snapshot.logistics.fibrinolysisAvailable === "yes") {
      if (lyticBlockers.length > 0) {
        reperfusionStrategy = "transfer_for_pci";
        return buildDecision("Trombólise contraindicada", "blocked", ["STEMI sem PCI imediata local; trombólise bloqueada pelas contraindicações abaixo."], lyticBlockers, lyticCorrectables);
      }
      reperfusionStrategy = "fibrinolysis";
      return buildDecision("STEMI: considerar trombólise", "eligible", [...rationale, "Sem PCI dentro do alvo; fibrinólise disponível."], blockers, correctables);
    }
    reperfusionStrategy = "transfer_for_pci";
    return buildDecision("Transferir para hemodinâmica", "correctable", ["Sem angioplastia primária em tempo adequado no local."], blockers, ["Organizar transferência imediata ou avaliar fibrinólise se elegível."]);
  })();

  const fibrinolysis = (() => {
    if (!stemi) {
      return buildDecision("Trombólise não indicada", "blocked", ["Sem STEMI confirmado."], ["Classificação não compatível com STEMI."], []);
    }
    if (lyticBlockers.length > 0) {
      return buildDecision("Trombólise contraindicada", "blocked", ["Existem contraindicações absolutas/relativas não resolvidas."], lyticBlockers, lyticCorrectables);
    }
    if (snapshot.logistics.fibrinolysisAvailable !== "yes") {
      return buildDecision("Trombólise indisponível", "blocked", ["Fibrinolítico não disponível no fluxo local."], ["Sem fibrinolítico configurado/disponível."], []);
    }
    return buildDecision("Trombólise elegível", "eligible", ["Sem contraindicações bloqueadoras registradas."], [], []);
  })();

  const invasiveStrategy = (() => {
    if (classification.category === "nstemi" || classification.category === "unstable_angina") {
      if (snapshot.exam.shockSigns === "yes" || killip.value === 4) {
        return buildDecision("NSTEMI/UA de altíssimo risco", "eligible", ["Choque/instabilidade indica estratégia invasiva imediata."], [], []);
      }
      if ((grace.value ?? 0) >= 140 || (timi.value ?? 0) >= 5 || snapshot.ecg.stDepression === "yes" || troponin.isPositive) {
        return buildDecision("NSTEMI de alto risco", "eligible", ["Risco clínico/biomarcadores/ECG favorecem estratégia invasiva precoce."], [], []);
      }
      return buildDecision("Estratégia seletiva / observação", "needs_serial_data", ["Necessita série de ECG/troponina e reavaliação de risco."], [], []);
    }
    if (classification.category === "stable_angina") {
      return buildDecision("Fluxo ambulatorial / DAC crônica", "needs_review", ["Quadro mais compatível com angina estável ou DAC crônica."], [], []);
    }
    return buildDecision("Estratégia invasiva em revisão", "needs_review", ["Completar classificação clínica antes da decisão."], ["ECG, troponina ou quadro ainda insuficientes."], []);
  })();

  const medications: CoronaryMedicationDecision[] = [
    {
      label: MEDICATION_LABELS.asa,
      status: snapshot.patient.allergies.toLowerCase().includes("aas") ? "contraindicated" : "indicated",
      rationale: snapshot.patient.allergies.toLowerCase().includes("aas") ? ["Alergia a AAS registrada."] : ["SCA / DAC provável favorece AAS se não houver contraindicação."],
    },
    {
      label: MEDICATION_LABELS.p2y12,
      status: stemi || classification.category === "nstemi" || classification.category === "unstable_angina" ? "indicated" : "consider",
      rationale: stemi ? ["Reperfusão / SCA aguda favorece dupla antiagregação conforme estratégia."] : ["Avaliar de acordo com risco e estratégia invasiva."],
    },
    {
      label: MEDICATION_LABELS.anticoag,
      status: stemi || classification.category === "nstemi" ? "indicated" : classification.category === "unstable_angina" ? "consider" : "withhold",
      rationale: ["Anticoagulação depende da classificação, sangramento e estratégia de reperfusão."],
    },
    {
      label: MEDICATION_LABELS.nitrate,
      status: snapshot.exam.systolicPressure != null && snapshot.exam.systolicPressure < 90 ? "contraindicated" : "consider",
      rationale: snapshot.exam.systolicPressure != null && snapshot.exam.systolicPressure < 90 ? ["Hipotensão: evitar nitrato."] : ["Usar apenas se dor/isquemia e sem contraindicações hemodinâmicas."],
    },
    {
      label: MEDICATION_LABELS.betaBlocker,
      status: snapshot.exam.shockSigns === "yes" || killip.value === 4 ? "contraindicated" : "consider",
      rationale: snapshot.exam.shockSigns === "yes" || killip.value === 4 ? ["Choque / IC grave: betabloqueador pode piorar." ] : ["Considerar se hemodinamicamente estável e sem contraindicações."],
    },
    {
      label: MEDICATION_LABELS.statin,
      status: classification.category === "non_coronary" ? "consider" : "indicated",
      rationale: ["Alta intensidade é favorecida em SCA e DAC estabelecida, salvo contraindicação."],
    },
    {
      label: MEDICATION_LABELS.aceiArb,
      status: killip.value != null && killip.value >= 2 ? "consider" : "consider",
      rationale: ["Avaliar conforme pressão, função renal, FEVE e fase do atendimento."],
    },
  ];

  let destination = "observation_chest_pain";
  const destinationRationale: string[] = [];

  if (stemi && reperfusionStrategy === "primary_pci") {
    destination = "cath_lab";
    destinationRationale.push("STEMI com estratégia de angioplastia primária.");
  } else if (stemi && (reperfusionStrategy === "fibrinolysis" || reperfusionStrategy === "transfer_for_pci")) {
    destination = "transfer_reference";
    destinationRationale.push("STEMI sem PCI imediata local exige fibrinólise/transferência.");
  } else if (classification.category === "nstemi" || classification.category === "unstable_angina") {
    if (snapshot.exam.shockSigns === "yes" || killip.value === 4 || (grace.value ?? 0) >= 140) {
      destination = "icu_ccu";
      destinationRationale.push("Síndrome coronariana aguda de alto risco.");
    } else {
      destination = "monitored_ward";
      destinationRationale.push("SCA sem supra / angina instável requer internação monitorizada.");
    }
  } else if (classification.category === "stable_angina") {
    destination = "discharge_followup";
    destinationRationale.push("Fluxo ambulatorial / DAC crônica sem evidência de evento agudo.");
  } else if (classification.category === "non_coronary") {
    destination = "observation_chest_pain";
    destinationRationale.push("Dor torácica alternativa, manter segurança diagnóstica antes de alta.");
  } else {
    destination = "observation_chest_pain";
    destinationRationale.push("Classificação indeterminada: observar com protocolo de dor torácica.");
  }

  return {
    classification,
    scores: {
      heart,
      timi,
      grace,
      killip,
    },
    treatment: {
      reperfusion,
      fibrinolysis,
      invasiveStrategy,
      medications,
      reperfusionStrategy,
    },
    destination: {
      recommended: destination,
      rationale: destinationRationale,
      label: DESTINATION_LABELS[destination],
    },
    ecg,
    troponin,
  };
}
