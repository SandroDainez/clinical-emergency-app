import type {
  AclsOperationalMetrics,
  AclsPresentation,
  DocumentationAction,
  EncounterSummary,
  ProtocolState,
  TimerState,
} from "../clinical-engine";
import { tr } from "./locales";

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
    return tr("Aplicar choque");
  }

  if (intent === "analyze_rhythm") {
    return tr("Ver ritmo");
  }

  if (primaryDocumentationAction?.id === "adrenaline" || intent === "give_epinephrine") {
    return tr("Dar epinefrina");
  }

  if (
    primaryDocumentationAction?.id === "antiarrhythmic" ||
    intent === "give_antiarrhythmic"
  ) {
    return tr("Dar antiarrítmico");
  }

  if (intent === "perform_cpr") {
    return tr("Manter RCP");
  }

  if (intent === "post_rosc_care") {
    return tr("Cuidar ROSC");
  }

  if (intent === "end_protocol") {
    return tr("Encerrar caso");
  }

  return input.state.type === "action" ? tr("Confirmar") : undefined;
}

function getDetailedActionCtaLabel(
  input: AclsScreenModelInput,
  primaryDocumentationAction?: DocumentationAction
) {
  const intent = input.presentation?.clinicalIntent;

  if (input.stateId === "inicio") {
    return tr("Iniciar RCP de alta qualidade agora");
  }

  if (primaryDocumentationAction?.id === "shock" || intent === "deliver_shock") {
    return tr("Afastar todos e aplicar choque");
  }

  return getConciseActionLabel(input, primaryDocumentationAction);
}

/**
 * O NOME DO CRONÔMETRO VEM DO PRÓPRIO CRONÔMETRO — não do intent da tela.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-18) ────────────────────────────────────
 *
 * Esta função lia `clinicalIntent` e nomeava 3 dos 8 intents; os outros CINCO
 * caíam em `return tr("Tempo atual")`. Entre eles, `give_epinephrine` e
 * `give_antiarrhythmic` — as telas de fármaco.
 *
 * Medido na tela, nos dois ramos: nelas o cronômetro de 2 min aparece como
 * «Tempo atual», ao lado do cronômetro de parada, que também está na tela. O
 * número está certo — é o único timer clínico, garantido por invariante do
 * reducer (`multiple_active_timers`). O NOME é que não dizia para onde ele conta.
 *
 * ⚠️ E A CAUSA ERA R-12 NA CAMADA DE APRESENTAÇÃO: o nome vinha de uma fonte (o
 * intent) e o número de outra (o timer). Quando as duas casavam, o nome calhava
 * de descrever o cronômetro certo; quando não casavam, virava genérico — e o
 * número continuava sendo de um cronômetro específico, que sabe perfeitamente
 * para onde conta.
 *
 * ── POR QUE NÃO HÁ MAIS FALLBACK ──────────────────────────────────────────
 *
 * Todo timer ativo tem destino: os CINCO estados que iniciam timer no
 * `protocol.json` levam a um estado de avaliação de ritmo.
 *
 *     rcp_1 · rcp_2 · rcp_3                   → avaliar_ritmo_*_preparo
 *     nao_chocavel_epinefrina · _ciclo        → avaliar_ritmo_nao_chocavel_preparo
 *
 * Então o rótulo é derivado do `nextStateId`, e não de uma lista de intents que
 * precisa ser mantida em dia. Intent novo não volta a cair no genérico, porque
 * não há genérico.
 *
 * ⚠️ O `?? tr("Tempo atual")` do fim NÃO é fallback de rótulo: só existe para o
 * caso de o timer chegar sem identidade — o que hoje é impossível pela invariante,
 * e amanhã seria bug de outro lugar. `test:ausencias` não se aplica; quem guarda
 * isto é `valida-rotulo-do-timer`, cuja mutação é voltar a descartar a identidade.
 */
function getTimerLabel(input: AclsScreenModelInput) {
  const timer = input.timers[0];

  if (timer?.nextStateId?.startsWith("avaliar_ritmo")) {
    return tr("Próximo ritmo");
  }

  // Mantidos: o intent descreve melhor a AÇÃO da tela quando ela é a própria
  // checagem ou o choque, e nesses estados não há timer de ciclo correndo.
  const intent = input.presentation?.clinicalIntent;
  if (intent === "analyze_rhythm") return tr("Ver ritmo");
  if (intent === "deliver_shock") return tr("Aplicar choque");

  return tr("Tempo atual");
}

/**
 * Ações que NUNCA podem ser escolhidas como primárias por fallback.
 *
 * Critério: reiniciam ou descartam o episódio. Elas existem, têm botão e têm
 * confirmação — o que não podem é ser promovidas a "próximo passo" só por
 * serem a única coisa na lista.
 */
const ACOES_DESTRUTIVAS = new Set<string>(["rearrest"]);

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

  // ⚠️ AÇÃO DESTRUTIVA NUNCA É O FALLBACK — R-53.
  //
  // No `pos_rosc` a única ação de documentação disponível é `rearrest`. Sem
  // este filtro, `actions[0]` a devolvia como ação PRIMÁRIA, e o botão herói
  // passava a executá-la — enquanto exibia o rótulo "Cuidar ROSC", que vem de
  // `primaryActionLabel`, outra fonte. Rótulo e handler de fontes
  // independentes: o botão dizia uma coisa e fazia outra.
  //
  // Efeitos: um toque no controle mais proeminente da tela reiniciava a RCP do
  // zero, e os SEIS estados `pos_rosc_*` ficavam inalcançáveis pela navegação
  // principal — o motor os tinha, a tela nunca chegava neles.
  //
  // A re-parada tem botão PRÓPRIO, com confirmação. Ela é exceção destrutiva,
  // nunca o próximo passo natural.
  return actions.find((action) => !ACOES_DESTRUTIVAS.has(action.id));
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
    return `${tr("Reanimação em curso há")} ${durationMinutes} min (${cycles} ${cycles !== 1 ? tr("ciclos") : tr("ciclo")}). ${tr("Considerar causas reversíveis e decisão de encerramento conforme contexto clínico.")}`;
  }

  return `${cycles} ${cycles !== 1 ? tr("ciclos") : tr("ciclo")} ${tr("sem ROSC. Revisar causas reversíveis. Discutir encerramento se indicado.")}`;
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
      ? tr("Epinefrina atrasada")
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
