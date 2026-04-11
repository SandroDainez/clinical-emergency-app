import type {
  AclsOperationalMetrics,
  AclsPresentation,
  DocumentationAction,
  EncounterSummary,
  ProtocolState,
  TimerState,
} from "../clinical-engine";

type AclsScreenModelInput = {
  state: ProtocolState;
  stateId: string;
  presentation?: AclsPresentation;
  timers: TimerState[];
  documentationActions: DocumentationAction[];
  encounterSummary: EncounterSummary;
  operationalMetrics?: AclsOperationalMetrics;
};

type AclsScreenModel = {
  clinicalIntent?: AclsPresentation["clinicalIntent"];
  clinicalIntentConfidence?: AclsPresentation["clinicalIntentConfidence"];
  title: string;
  details: string[];
  bannerTitle?: string;
  bannerDetail?: string;
  bannerPriority?: NonNullable<AclsPresentation["banner"]>["priority"];
  timerVisible: boolean;
  timerLabel?: string;
  timerRemaining?: number;
  showDocumentationActions: boolean;
  primaryActionLabel?: string;
  primaryActionCtaLabel?: string;
  primaryActionType?: "confirm_state" | "documentation";
  primaryDocumentationActionId?: DocumentationAction["id"];
  nextAdrenalineLabel?: string;
  adrenalineStatusLabel?: string;
  /** Shown when resuscitation has been ongoing for many cycles without ROSC. */
  prolongedResuscitationNote?: string;
  priorityConsistencyKey: string;
};

function getConciseActionLabel(
  input: AclsScreenModelInput,
  primaryDocumentationAction?: DocumentationAction
) {
  const intent = input.presentation?.clinicalIntent;

  if (primaryDocumentationAction?.id === "shock" || intent === "deliver_shock") {
    return "Aplicar choque";
  }

  if (intent === "analyze_rhythm") {
    return "Ver ritmo";
  }

  if (primaryDocumentationAction?.id === "adrenaline" || intent === "give_epinephrine") {
    return "Dar epinefrina";
  }

  if (
    primaryDocumentationAction?.id === "antiarrhythmic" ||
    intent === "give_antiarrhythmic"
  ) {
    return "Dar antiarrítmico";
  }

  if (intent === "perform_cpr") {
    return "Manter RCP";
  }

  if (intent === "post_rosc_care") {
    return "Cuidar ROSC";
  }

  if (intent === "end_protocol") {
    return "Encerrar caso";
  }

  return input.state.type === "action" ? "Confirmar" : undefined;
}

function getDetailedActionCtaLabel(
  input: AclsScreenModelInput,
  primaryDocumentationAction?: DocumentationAction
) {
  const intent = input.presentation?.clinicalIntent;

  if (input.stateId === "inicio") {
    return "Confirmar (100–120/min, 5–6 cm, retorno total do tórax, 30:2 sem via aérea avançada, 1 ventilação/6 s com via aérea avançada)";
  }

  if (primaryDocumentationAction?.id === "shock" || intent === "deliver_shock") {
    return "Aplicar choque (afastar todos, ninguém em contato, retomar RCP após o choque)";
  }

  return getConciseActionLabel(input, primaryDocumentationAction);
}

function getTimerLabel(input: AclsScreenModelInput) {
  const intent = input.presentation?.clinicalIntent;

  if (intent === "perform_cpr") {
    return "Próximo ritmo";
  }

  if (intent === "analyze_rhythm") {
    return "Ver ritmo";
  }

  if (intent === "deliver_shock") {
    return "Aplicar choque";
  }

  return "Tempo atual";
}

function getPrimaryDocumentationAction(
  input: AclsScreenModelInput
): DocumentationAction | undefined {
  const actions = input.documentationActions;
  const intent = input.presentation?.clinicalIntent;

  if (intent === "perform_cpr") {
    return undefined;
  }

  if (intent === "deliver_shock") {
    return actions.find((action) => action.id === "shock");
  }

  if (intent === "give_epinephrine") {
    return actions.find((action) => action.id === "adrenaline");
  }

  if (intent === "give_antiarrhythmic") {
    return actions.find((action) => action.id === "antiarrhythmic");
  }

  return actions[0];
}

const PROLONGED_CYCLE_THRESHOLD = 5;
const PROLONGED_DURATION_MS = 20 * 60 * 1000; // 20 minutes

function buildProlongedResuscitationNote(input: AclsScreenModelInput): string | undefined {
  const metrics = input.operationalMetrics;
  const stateId = input.stateId;

  // Only show during active resuscitation loops (not post-ROSC, not ended)
  const isActiveArrest =
    !stateId.startsWith("pos_rosc") &&
    stateId !== "encerrado" &&
    stateId !== "monitorizar_com_pulso" &&
    input.encounterSummary.currentStateId !== "encerrado";

  if (!isActiveArrest || !metrics) {
    return undefined;
  }

  const cycles = metrics.cyclesCompleted ?? 0;
  const durationMs = metrics.totalPcrDurationMs;

  const isProlongedByCycles = cycles >= PROLONGED_CYCLE_THRESHOLD;
  const isProlongedByTime = durationMs !== undefined && durationMs >= PROLONGED_DURATION_MS;

  if (!isProlongedByCycles && !isProlongedByTime) {
    return undefined;
  }

  const durationMinutes =
    durationMs !== undefined ? Math.floor(durationMs / 60000) : undefined;

  if (durationMinutes !== undefined && durationMinutes >= 20) {
    return `Reanimação em curso há ${durationMinutes} min (${cycles} ciclo${cycles !== 1 ? "s" : ""}). Considerar causas reversíveis e decisão de encerramento conforme contexto clínico.`;
  }

  return `${cycles} ciclo${cycles !== 1 ? "s" : ""} sem ROSC. Revisar causas reversíveis. Discutir encerramento se indicado.`;
}

function buildAclsScreenModel(input: AclsScreenModelInput): AclsScreenModel {
  const activeTimer = input.timers[0];
  const primaryDocumentationAction = getPrimaryDocumentationAction(input);
  const primaryAction =
    primaryDocumentationAction ??
    (input.state.type === "action"
      ? {
          id: undefined,
          label: input.state.text,
        }
      : undefined);
  const nextAdrenalineLabel =
    input.operationalMetrics?.adrenalineTimingState === "future_due" &&
    input.operationalMetrics?.nextAdrenalineDueInMs !== undefined
      ? `${Math.ceil(input.operationalMetrics.nextAdrenalineDueInMs / 1000)}s`
      : undefined;
  const adrenalineStatusLabel =
    input.operationalMetrics?.adrenalineTimingState === "late_due"
      ? "Epinefrina atrasada"
      : undefined;
  const primaryActionLabel = getConciseActionLabel(input, primaryDocumentationAction);
  const primaryActionCtaLabel = getDetailedActionCtaLabel(input, primaryDocumentationAction);
  const prolongedResuscitationNote = buildProlongedResuscitationNote(input);

  return {
    clinicalIntent: input.presentation?.clinicalIntent,
    clinicalIntentConfidence: input.presentation?.clinicalIntentConfidence,
    title: input.presentation?.title ?? input.state.text,
    details: input.presentation?.details ?? (input.state.details ?? []),
    bannerTitle: input.presentation?.banner?.title,
    bannerDetail: input.presentation?.banner?.detail,
    bannerPriority: input.presentation?.banner?.priority,
    timerVisible: Boolean(activeTimer),
    timerLabel: activeTimer ? getTimerLabel(input) : undefined,
    timerRemaining: activeTimer?.remaining,
    showDocumentationActions:
      input.presentation?.clinicalIntent === "perform_cpr"
        ? input.documentationActions.length > 0
        : input.documentationActions.length > 1,
    primaryActionLabel: primaryActionLabel ?? primaryAction?.label,
    primaryActionCtaLabel: primaryActionCtaLabel ?? primaryAction?.label,
    primaryActionType: primaryDocumentationAction ? "documentation" : input.state.type === "action" ? "confirm_state" : undefined,
    primaryDocumentationActionId: primaryDocumentationAction?.id,
    nextAdrenalineLabel,
    adrenalineStatusLabel,
    prolongedResuscitationNote,
    priorityConsistencyKey: [
      input.presentation?.clinicalIntent ?? "",
      input.presentation?.clinicalIntentConfidence ?? "",
      input.presentation?.title ?? input.state.text,
      input.presentation?.banner?.title ?? "",
      input.presentation?.banner?.priority ?? "",
    ].join("|"),
  };
}

export type { AclsScreenModel, AclsScreenModelInput };
export { buildAclsScreenModel };
