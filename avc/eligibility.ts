import type {
  AvcCaseSnapshot,
  AvcContraSnapshot,
  AvcDecisionSnapshot,
  AvcTherapyDecision,
  ContraStatus,
  DestinationKey,
  StrokePathway,
} from "./domain";
import { AVC_DESTINATION_LABELS, AVC_WINDOWS, CONTRAINDICATIONS } from "./protocol-config";

function isYes(value: string) {
  return value.trim().toLowerCase() === "yes";
}

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function dayContextOffset(dayContext: AvcCaseSnapshot["timing"]["arrivalDayContext"]) {
  if (dayContext === "today") return 0;
  if (dayContext === "yesterday") return -1;
  if (dayContext === "day_before_yesterday") return -2;
  return null;
}

function elapsedMinutes(
  startDayContext: AvcCaseSnapshot["timing"]["arrivalDayContext"],
  start: string,
  endDayContext: AvcCaseSnapshot["timing"]["arrivalDayContext"],
  end: string
): number | null {
  const startM = parseTimeToMinutes(start);
  const endM = parseTimeToMinutes(end);
  const startDay = dayContextOffset(startDayContext);
  const endDay = dayContextOffset(endDayContext);
  if (startM == null || endM == null || startDay == null || endDay == null) return null;
  return (endDay - startDay) * 24 * 60 + (endM - startM);
}

function resolveReliableTimeAnchor(snapshot: AvcCaseSnapshot) {
  const lkwAvailable =
    Boolean(snapshot.timing.lastKnownWellTime) &&
    snapshot.timing.lastKnownWellDayContext !== "unknown";
  if (lkwAvailable) {
    return {
      dayContext: snapshot.timing.lastKnownWellDayContext,
      time: snapshot.timing.lastKnownWellTime,
      source: "lkw" as const,
    };
  }

  const onsetAvailable =
    Boolean(snapshot.timing.symptomOnsetTime) &&
    snapshot.timing.symptomOnsetDayContext !== "unknown";
  if (onsetAvailable) {
    return {
      dayContext: snapshot.timing.symptomOnsetDayContext,
      time: snapshot.timing.symptomOnsetTime,
      source: "onset" as const,
    };
  }

  return null;
}

function getContraStatus(snapshot: AvcCaseSnapshot, id: string): ContraStatus {
  return snapshot.contraindications[id]?.status ?? "unknown";
}

function describeContra(snapshot: AvcCaseSnapshot, id: string) {
  const item = CONTRAINDICATIONS.find((entry) => entry.id === id);
  const status = getContraStatus(snapshot, id);
  if (!item || status !== "present") return null;
  return `${item.name}: ${item.impact}`;
}

function buildTherapyDecision(
  label: string,
  gate: AvcTherapyDecision["gate"],
  rationale: string[],
  blockers: string[],
  correctableItems: string[]
): AvcTherapyDecision {
  return { label, gate, rationale, blockers, correctableItems };
}

function hasAutoCoagulopathy(snapshot: AvcCaseSnapshot) {
  const normalizedPlatelets =
    snapshot.labs.platelets != null && snapshot.labs.platelets < 1000
      ? snapshot.labs.platelets * 1000
      : snapshot.labs.platelets;
  const plateletsLow =
    normalizedPlatelets != null &&
    normalizedPlatelets < 100000;
  const inrHigh =
    snapshot.labs.inr != null &&
    snapshot.labs.inr > 1.7;
  const apttHigh =
    snapshot.labs.aptt != null &&
    snapshot.labs.aptt > 40;
  const antithrombotics = snapshot.patient.antithrombotics.toLowerCase();
  const highRiskAnticoagulant =
    antithrombotics.includes("doac") ||
    antithrombotics.includes("heparina recente");

  return plateletsLow || inrHigh || apttHigh || highRiskAnticoagulant;
}

function inferPathway(snapshot: AvcCaseSnapshot): StrokePathway {
  const ct = snapshot.imaging.ctResult.trim().toLowerCase();
  if (ct === "hemorragia") return "hemorrhagic";
  if (ct === "sem_sangramento") return "ischemic_confirmed";
  if (ct === "inconclusivo" || !ct) return "undetermined";
  return "ischemic_possible";
}

function inferSyndromeLabel(pathway: StrokePathway) {
  switch (pathway) {
    case "hemorrhagic":
      return "AVC hemorrágico confirmado";
    case "ischemic_confirmed":
      return "AVC isquêmico sem hemorragia na TC";
    case "ischemic_possible":
      return "AVC isquêmico provável";
    default:
      return "AVC em definição";
  }
}

function getDestination(
  snapshot: AvcCaseSnapshot,
  pathway: StrokePathway,
  thrombectomyEligible: boolean,
  ivGate: AvcTherapyDecision["gate"]
): { recommended: DestinationKey; rationale: string[] } {
  const rationale: string[] = [];
  if (thrombectomyEligible) {
    rationale.push("Suspeita/confirmada oclusão de grande vaso com necessidade de via intervencionista.");
    return { recommended: "transferencia_trombectomia", rationale };
  }

  if (pathway === "hemorrhagic") {
    rationale.push("Hemorragia na TC exige monitorização neurológica intensiva e avaliação neurocirúrgica.");
    return { recommended: "uti", rationale };
  }

  if (ivGate === "eligible") {
    rationale.push("Pós-trombólise requer monitorização intensiva/unidade especializada.");
    return { recommended: "unidade_avc", rationale };
  }

  if (snapshot.symptoms.abcInstability === "yes" || snapshot.symptoms.airwayProtection === "yes") {
    rationale.push("Instabilidade clínica ou necessidade de proteção de via aérea.");
    return { recommended: "sala_vermelha", rationale };
  }

  rationale.push("Necessita observação monitorizada e reavaliação neurológica seriada.");
  return { recommended: "observacao", rationale };
}

export function evaluateAvcDecision(snapshot: AvcCaseSnapshot): AvcDecisionSnapshot {
  const pathway = inferPathway(snapshot);
  const syndromeLabel = inferSyndromeLabel(pathway);
  const blockers: string[] = [];
  const correctableItems: string[] = [];
  const rationale: string[] = [];

  const timeAnchor = resolveReliableTimeAnchor(snapshot);
  const lkwToArrival = timeAnchor
    ? elapsedMinutes(
        timeAnchor.dayContext,
        timeAnchor.time,
        snapshot.timing.arrivalDayContext,
        snapshot.timing.arrivalTime
      )
    : null;
  const timeUnknown =
    snapshot.timing.timePrecision === "unknown" && !timeAnchor ||
    !snapshot.timing.arrivalTime ||
    snapshot.timing.arrivalDayContext === "unknown" ||
    !timeAnchor;
  const nihssLow = snapshot.nihss.total <= 5;
  const pressureHigh =
    (snapshot.vitals.systolicPressure ?? 0) > AVC_WINDOWS.tPaMaxPressure.systolic ||
    (snapshot.vitals.diastolicPressure ?? 0) > AVC_WINDOWS.tPaMaxPressure.diastolic;
  const glucoseCritical =
    snapshot.vitals.glucoseCurrent != null &&
    (snapshot.vitals.glucoseCurrent < AVC_WINDOWS.glucoseHypoMgDl ||
      snapshot.vitals.glucoseCurrent > AVC_WINDOWS.glucoseHyperMgDl);
  const ctPending = pathway === "undetermined";
  const lvoConfirmed = snapshot.imaging.ctaResult === "oclusao_grande_vaso";
  const lvoSuspected = snapshot.imaging.lvoSuspicion === "yes";
  const ctaPending = lvoSuspected && snapshot.imaging.ctaPerformed !== "yes";

  if (pathway === "hemorrhagic") {
    const hemorrhagePlan = buildTherapyDecision(
      "Hemorragia: trombólise proibida",
      "blocked",
      [
        "TC mostra hemorragia intracraniana.",
        "Priorizar controle pressórico, reversão de anticoagulação e neurointensivismo/neurocirurgia conforme quadro.",
      ],
      ["Trombólise intravenosa contraindicada por hemorragia confirmada."],
      []
    );
    const fallbackDecision = buildTherapyDecision(
      "Terapia de reperfusão não aplicável",
      "blocked",
      ["Fluxo redirecionado para AVC hemorrágico."],
      ["Hemorragia em TC."],
      []
    );
    const destination = getDestination(snapshot, pathway, false, "blocked");
    return {
      pathway,
      syndromeLabel,
      ivThrombolysis: fallbackDecision,
      thrombectomy: fallbackDecision,
      hemorrhagePlan,
      destination,
      selectedThrombolyticId: snapshot.decision.selectedThrombolyticId,
      finalMedicalDecision: snapshot.decision.finalMedicalDecision,
      doubleCheckStatus: snapshot.decision.doubleCheckStatus,
    };
  }

  if (ctPending) {
    blockers.push("Hemorragia ainda não excluída por TC adequada.");
  }
  if (timeUnknown) {
    blockers.push("Horário de início/LKW desconhecido ou sem confiabilidade.");
  }

  if (hasAutoCoagulopathy(snapshot)) {
    correctableItems.push("Coagulopatia/anticoagulação incompatível detectada; rever exames, última dose e possibilidade de reversão.");
  }

  for (const item of CONTRAINDICATIONS) {
    if (item.id === "known_coagulopathy") continue;
    const description = describeContra(snapshot, item.id);
    if (!description) continue;
    if (item.correctable) {
      correctableItems.push(description);
    } else if (item.blocksThrombolysis) {
      blockers.push(description);
    }
  }

  if (!snapshot.nihss.complete && snapshot.symptoms.disablingDeficit !== "yes") {
    blockers.push("NIHSS incompleto sem justificativa de déficit incapacitante documentada.");
  }
  if (pressureHigh) {
    correctableItems.push("PA acima do limite para trombólise; controlar e reavaliar.");
  }
  if (glucoseCritical) {
    correctableItems.push("Glicemia crítica: corrigir antes de decidir reperfusão.");
  }
  if (snapshot.symptoms.strokeMimicConcern === "yes") {
    blockers.push("Possível mimetizador de AVC; revisar hipótese e correlações clínicas.");
  }

  if (lkwToArrival != null) {
    rationale.push(
      `Janela até a chegada: ${lkwToArrival} min desde ${
        timeAnchor?.source === "onset" ? "o início dos sintomas" : "a última vez normal"
      }.`
    );
    if (lkwToArrival > AVC_WINDOWS.ivTrombolysisMinutes) {
      blockers.push(`Fora da janela IV padrão (${AVC_WINDOWS.ivTrombolysisMinutes} min).`);
    }
  } else if (!timeUnknown) {
    blockers.push("Não foi possível calcular a janela temporal com os horários informados.");
  }

  if (nihssLow && snapshot.symptoms.disablingDeficit !== "yes") {
    rationale.push("NIHSS baixo: confirmar se o déficit é realmente incapacitante.");
  }

  const ivGate: AvcTherapyDecision["gate"] =
    blockers.length > 0
      ? "blocked"
      : correctableItems.length > 0
        ? "correctable"
        : ctPending
          ? "needs_imaging"
          : "eligible";

  const ivDecision = buildTherapyDecision(
    ivGate === "eligible"
      ? "Pode trombolisar"
      : ivGate === "correctable"
        ? "Precisa corrigir antes"
        : ivGate === "needs_imaging"
          ? "Depende de imagem"
          : "Não elegível no estado atual",
    ivGate,
    rationale.length ? rationale : ["Revisão baseada em tempo, imagem, NIHSS, hemodinâmica e contraindicações."],
    blockers,
    correctableItems
  );

  const thrombectomyBlockers: string[] = [];
  const thrombectomyRationale: string[] = [];
  const thrombectomyCorrectables: string[] = [];

  if (!lvoConfirmed) {
    if (ctaPending) {
      thrombectomyCorrectables.push("Suspeita de grande vaso sem angiotomografia concluída.");
    } else {
      thrombectomyBlockers.push("Sem confirmação de oclusão de grande vaso.");
    }
  }
  if (timeUnknown) {
    thrombectomyBlockers.push("Tempo/LKW incerto para estratégia de reperfusão.");
  }
  if (lkwToArrival != null) {
    if (lkwToArrival <= AVC_WINDOWS.thrombectomyEarlyMinutes) {
      thrombectomyRationale.push("Dentro da janela precoce para trombectomia.");
    } else if (lkwToArrival <= AVC_WINDOWS.thrombectomyExtendedMinutes) {
      thrombectomyRationale.push("Janela estendida possível; requer imagem/neurologia para seleção.");
      thrombectomyCorrectables.push("Revisar elegibilidade na janela estendida com neurologia/intervenção.");
    } else {
      thrombectomyBlockers.push("Fora da janela usual para trombectomia.");
    }
  }

  const thrombectomyGate: AvcTherapyDecision["gate"] =
    thrombectomyBlockers.length > 0
      ? "blocked"
      : thrombectomyCorrectables.length > 0
        ? "needs_review"
        : "eligible";

  const thrombectomyDecision = buildTherapyDecision(
    thrombectomyGate === "eligible"
      ? "Transferir / acionar trombectomia"
      : thrombectomyGate === "needs_review"
        ? "Depende de neurologia / imagem adicional"
        : "Trombectomia não recomendada agora",
    thrombectomyGate,
    thrombectomyRationale.length ? thrombectomyRationale : ["Elegibilidade dependente de oclusão de grande vaso e janela adequada."],
    thrombectomyBlockers,
    thrombectomyCorrectables
  );

  const hemorrhagePlan = buildTherapyDecision(
    "Sem hemorragia definida na TC",
    "needs_review",
    pathway === "undetermined"
      ? ["Neuroimagem ainda precisa excluir hemorragia com segurança."]
      : ["Fluxo hemorrágico permanece fechado enquanto a TC não mostrar hemorragia."],
    [],
    []
  );

  const destination = getDestination(snapshot, pathway, thrombectomyGate === "eligible", ivGate);

  return {
    pathway,
    syndromeLabel,
    ivThrombolysis: ivDecision,
    thrombectomy: thrombectomyDecision,
    hemorrhagePlan,
    destination,
    selectedThrombolyticId: snapshot.decision.selectedThrombolyticId,
    finalMedicalDecision: snapshot.decision.finalMedicalDecision,
    doubleCheckStatus: snapshot.decision.doubleCheckStatus,
  };
}

export function buildDecisionSummaryText(snapshot: AvcCaseSnapshot) {
  const destinationLabel = AVC_DESTINATION_LABELS[snapshot.decision.destination.recommended];
  return [
    `Síndrome: ${snapshot.decision.syndromeLabel}`,
    `Trombólise IV: ${snapshot.decision.ivThrombolysis.label}`,
    `Trombectomia: ${snapshot.decision.thrombectomy.label}`,
    `Destino sugerido: ${destinationLabel}`,
  ].join(" | ");
}
