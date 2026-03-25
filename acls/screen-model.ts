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
  title: string;
  details: string[];
  bannerTitle?: string;
  bannerDetail?: string;
  bannerPriority?: NonNullable<AclsPresentation["banner"]>["priority"];
  timerVisible: boolean;
  timerRemaining?: number;
  showDocumentationActions: boolean;
  nextAdrenalineLabel?: string;
  mode: AclsMode;
  priorityConsistencyKey: string;
};

function buildAclsScreenModel(input: AclsScreenModelInput): AclsScreenModel {
  const activeTimer = input.timers[0];
  const nextAdrenalineLabel =
    input.operationalMetrics?.nextAdrenalineDueInMs !== undefined
      ? `${Math.ceil(input.operationalMetrics.nextAdrenalineDueInMs / 1000)}s`
      : undefined;

  return {
    title: input.presentation?.title ?? input.state.text,
    details: input.presentation?.details ?? (input.state.details ?? []),
    bannerTitle: input.presentation?.banner?.title,
    bannerDetail: input.presentation?.banner?.detail,
    bannerPriority: input.presentation?.banner?.priority,
    timerVisible: Boolean(activeTimer),
    timerRemaining: activeTimer?.remaining,
    showDocumentationActions: input.documentationActions.length > 0,
    nextAdrenalineLabel,
    mode: input.mode,
    priorityConsistencyKey: [
      input.presentation?.title ?? input.state.text,
      input.presentation?.banner?.title ?? "",
      input.presentation?.banner?.priority ?? "",
    ].join("|"),
  };
}

export type { AclsScreenModel, AclsScreenModelInput };
export { buildAclsScreenModel };
