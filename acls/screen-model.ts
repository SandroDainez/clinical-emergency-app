import type {
  AclsMode,
  AclsOperationalMetrics,
  AclsPresentation,
  DocumentationAction,
  EncounterSummary,
  ProtocolState,
  TimerState,
} from "../clinical-engine";

type AclsScreenModelInput = {
  mode: AclsMode;
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
  primaryActionType?: "confirm_state" | "documentation";
  primaryDocumentationActionId?: DocumentationAction["id"];
  nextAdrenalineLabel?: string;
  mode: AclsMode;
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
    input.operationalMetrics?.nextAdrenalineDueInMs !== undefined
      ? `${Math.ceil(input.operationalMetrics.nextAdrenalineDueInMs / 1000)}s`
      : undefined;
  const primaryActionLabel = getConciseActionLabel(input, primaryDocumentationAction);

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
    primaryActionType: primaryDocumentationAction ? "documentation" : input.state.type === "action" ? "confirm_state" : undefined,
    primaryDocumentationActionId: primaryDocumentationAction?.id,
    nextAdrenalineLabel,
    mode: input.mode,
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
