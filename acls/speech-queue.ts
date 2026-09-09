import {
  ORDEM_DOS_NIVEIS,
  deveTerminar,
  getNivelDeFala,
  getSpeechIntensity,
  getSpeechInterruptPolicy,
  getSpeechPriority,
  getSpeechText,
  resolveSpeechKey,
  type NivelDeFala,
  type SpeechIntensity,
  type SpeechInterruptPolicy,
} from "./speech-map";

type SpeechPriority = "critical" | "normal";

type SpeechQueueEffect = {
  type: "SPEAK";
  key: string;
  intensity?: SpeechIntensity;
  latencyTraceId?: string;
  message?: string;
  cueId?: string;
};

type SpeechQueueItem = {
  effect: SpeechQueueEffect;
  enqueuedAt: number;
  intensity: SpeechIntensity;
  interruptPolicy: SpeechInterruptPolicy;
  /** ⚠️ Nível clínico: ordena ⛔ só entre cues ⛔ ainda válidos. */
  nivel: NivelDeFala;
  /** ⚠️ Declarado no cue: energia de choque ⛔ ou dose/via ⛔ não se corta no meio. */
  mustFinish: boolean;
  priority: SpeechPriority;
  silent: boolean;
  stateId?: string;
};

type ActiveSpeechItem = {
  intensity: SpeechIntensity;
  interruptPolicy: SpeechInterruptPolicy;
  nivel: NivelDeFala;
  mustFinish: boolean;
  priority: SpeechPriority;
  key: string;
  stateId?: string;
};

type SpeechQueueDeps = {
  getCurrentStateId: () => string;
  isOutputActive: () => boolean;
  onPlaybackStarted?: (traceId: string, speakKey: string) => void;
  play: (message: string, cueId?: string) => Promise<void>;
  stop: () => void;
  now?: () => number;
  waitMs?: (ms: number) => Promise<void>;
};

type SpeechQueue = {
  clear: () => void;
  /**
   * ⚠️⚠️⚠️ ⛔ SINCRONIZAR COM O ESTADO CLÍNICO — ⛔ e ⛔ não com a fila.
   *
   * ⛔ Decisão do autor, 2026-09-09: *"⛔ não sincronizar áudio com a fila;
   * sincronizar áudio ⛔ com o ⛔ **⛔ estado clínico atual**."*
   */
  sincronizarComOEstado: (stateId: string) => void;
  enqueue: (item: {
    effect: SpeechQueueEffect;
    interrupt?: boolean;
    interruptPolicy?: SpeechInterruptPolicy;
    priority?: SpeechPriority;
    silent?: boolean;
    stateId?: string;
  }) => Promise<void>;
  stop: () => void;
};

function defaultWait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function hashDelaySeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 51;
  }
  return hash;
}

function createSpeechQueue(deps: SpeechQueueDeps): SpeechQueue {
  let queue: SpeechQueueItem[] = [];
  let processing = false;
  let activePlaybackToken = 0;
  let activeItem: ActiveSpeechItem | null = null;
  let resolveInterruption: (() => void) | null = null;
  let lastSpokenKey: string | null = null;
  let lastSpokenStateId: string | null = null;
  let lastSpokenAt = 0;
  const duplicateThresholdMs = 1000;
  const sameStateThresholdMs = 2500;
  const continuousCprSilenceMs = 115000;

  function isSameCanonicalItem(left: SpeechQueueItem, right: SpeechQueueItem) {
    return (
      getResolvedKey(left) === getResolvedKey(right) &&
      (left.stateId ?? "") === (right.stateId ?? "") &&
      left.priority === right.priority
    );
  }

  function getNow() {
    return deps.now?.() ?? Date.now();
  }

  function getResolvedKey(item: SpeechQueueItem) {
    return resolveSpeechKey(item.effect.key);
  }

  function getHumanizedDelayMs(item: SpeechQueueItem) {
    if (item.priority === "critical") {
      return 0;
    }

    const seed = `${getResolvedKey(item)}:${item.stateId ?? ""}:${item.enqueuedAt}`;
    return 50 + hashDelaySeed(seed);
  }

  function isContinuousCprInstruction(item: SpeechQueueItem) {
    return getResolvedKey(item) === "start_cpr";
  }

  /**
   * ⚠️⚠️⚠️ ⛔ A PERGUNTA VEM ⛔ ANTES DA PRIORIDADE: ⛔ « ainda pertence ⛔ ao
   * estado atual? »
   *
   * ⛔ Decisão do autor, 2026-09-09: *"Prioridade ⛔ e validade temporal ⛔ são
   * dimensões diferentes. ⛔ Um `action` velho ⛔ continua sendo velho."*
   *
   * ⛔ ⛔ O conjunto ⛔ `STATE_INVARIANT_CUE_KEYS` ⛔ que morava aqui ⛔ era ⛔ uma
   * ⛔ **⛔ lista de nomes** — ⛔ e ⛔ lista de casos ⛔ é ⛔ como nasce ⛔ o
   * ⛔ caso seguinte. ⚠️ ⛔ Agora ⛔ a exceção ⛔ é ⛔ **⛔ declarada no cue**
   * (`deveTerminar`), ⛔ e ⛔ vale ⛔ para ⛔ os dois momentos: ⛔ o cue que
   * ⛔ ainda ⛔ não começou ⛔ e ⛔ o que ⛔ já está tocando.
   *
   * ⛔ ⛔ `analyze_rhythm` ⛔ e `confirm_rosc` ⛔ **⛔ perderam** ⛔ a invariância
   * ⛔ que tinham: ⛔ eles são `critical`, ⛔ e ⛔ `critical` ⛔ interrompe ⛔ e
   * ⛔ toca ⛔ **⛔ agora** — ⛔ não precisa ⛔ sobreviver ⛔ ao próprio estado
   * ⛔ para ⛔ ser ouvido. ⛔ A adrenalina, ⛔ que foi ⛔ o caso ⛔ que criou ⛔ a
   * lista, ⛔ continua protegida: ⛔ `epinephrine_now` ⛔ é ⛔ `mustFinish`.
   */
  function pertenceAoEstadoAtual(item: SpeechQueueItem) {
    if (!item.stateId) {
      return true;
    }
    return deps.getCurrentStateId() === item.stateId;
  }

  function aindaVale(item: SpeechQueueItem) {
    return pertenceAoEstadoAtual(item) || item.mustFinish;
  }

  function shouldSkipBySilencePolicy(item: SpeechQueueItem) {
    if (item.silent) {
      return true;
    }

    if (
      item.stateId &&
      item.stateId === lastSpokenStateId &&
      getResolvedKey(item) === lastSpokenKey &&
      getNow() - lastSpokenAt < sameStateThresholdMs
    ) {
      return true;
    }

    if (isContinuousCprInstruction(item) && getResolvedKey(item) === lastSpokenKey) {
      return getNow() - lastSpokenAt < continuousCprSilenceMs;
    }

    return false;
  }

  function shouldSkipDuplicate(item: SpeechQueueItem) {
    if (shouldSkipBySilencePolicy(item)) {
      return true;
    }

    if (item.priority === "critical") {
      return false;
    }

    if (item.effect.key !== lastSpokenKey) {
      return false;
    }

    return getNow() - lastSpokenAt < duplicateThresholdMs;
  }

  function hasPendingDuplicate(item: SpeechQueueItem) {
    return queue.some(
      (queued) =>
        isSameCanonicalItem(queued, item) &&
        Math.abs(queued.enqueuedAt - item.enqueuedAt) < duplicateThresholdMs
    );
  }

  function interruptCurrentPlayback() {
    activePlaybackToken += 1;
    activeItem = null;
    deps.stop();
    resolveInterruption?.();
    resolveInterruption = null;
  }

  function shouldInterruptCurrentPlayback(item: SpeechQueueItem) {
    if (!activeItem || !deps.isOutputActive()) {
      return false;
    }

    /**
     * ⚠️⚠️⚠️ ⛔ `critical` NOVO ⛔ VENCE ⛔ **⛔ TUDO** — ⛔ inclusive `mustFinish`.
     *
     * ⛔ Decisão do autor: *"`mustFinish` ⛔ não pode bloquear ⛔ um novo
     * `critical`; ⛔ nesse conflito, `critical` ⛔ vence."*
     *
     * ⛔ ⛔ E ⛔ isto vem ⛔ **⛔ antes** de `interruptPolicy === "never"`:
     * ⛔ uma dose ⛔ que ⛔ não pudesse ser cortada ⛔ **⛔ nem por uma parada
     * nova** ⛔ deixaria o app ⛔ falando o passado ⛔ durante a emergência
     * ⛔ seguinte.
     */
    if (item.nivel === "critical") {
      return true;
    }

    if (item.interruptPolicy === "never") {
      return false;
    }

    /** ⚠️ Fora do caso `critical`, ⛔ o que ⛔ deve terminar ⛔ termina. */
    if (activeItem.mustFinish) {
      return false;
    }

    if (activeItem.priority === "critical") {
      return false;
    }

    if (item.interruptPolicy === "always") {
      return true;
    }

    if (item.interruptPolicy === "if_lower_priority") {
      return activeItem.priority === "normal" && item.priority !== activeItem.priority;
    }

    return false;
  }

  async function waitForSilence(pollMs = 50) {
    while (deps.isOutputActive()) {
      await (deps.waitMs ?? defaultWait)(pollMs);
    }
  }

  async function processQueue() {
    if (processing) {
      return;
    }

    processing = true;

    while (queue.length > 0) {
      const item = queue.shift();

      if (!item) {
        continue;
      }

      if (!aindaVale(item)) {
        continue;
      }

      if (shouldSkipDuplicate(item)) {
        continue;
      }

      const playbackToken = activePlaybackToken;
      let interrupted = false;

      await waitForSilence(item.priority === "critical" ? 25 : 50);
      activeItem = {
        intensity: item.intensity,
        interruptPolicy: item.interruptPolicy,
        nivel: item.nivel,
        mustFinish: item.mustFinish,
        priority: item.priority,
        key: getResolvedKey(item),
        stateId: item.stateId,
      };

      const interruptionPromise = new Promise<void>((resolve) => {
        resolveInterruption = () => {
          interrupted = true;
          resolve();
        };
      });

      const humanizedDelayMs = getHumanizedDelayMs(item);
      if (humanizedDelayMs > 0) {
        await Promise.race([(deps.waitMs ?? defaultWait)(humanizedDelayMs), interruptionPromise]);
      }

      if (interrupted || playbackToken !== activePlaybackToken) {
        if (resolveInterruption) {
          resolveInterruption = null;
        }
        if (playbackToken === activePlaybackToken) {
          activeItem = null;
        }
        continue;
      }

      if (!aindaVale(item)) {
        activeItem = null;
        if (resolveInterruption) {
          resolveInterruption = null;
        }
        continue;
      }

      if (item.effect.latencyTraceId) {
        deps.onPlaybackStarted?.(item.effect.latencyTraceId, getResolvedKey(item));
      }

      const playPromise = deps
        .play(getSpeechText(item.effect.key, item.effect.message), item.effect.cueId)
        .catch(() => undefined);

      await Promise.race([playPromise, interruptionPromise]);

      if (resolveInterruption) {
        resolveInterruption = null;
      }

      if (!interrupted && playbackToken === activePlaybackToken) {
        lastSpokenKey = getResolvedKey(item);
        lastSpokenStateId = item.stateId ?? null;
        lastSpokenAt = getNow();
        await waitForSilence(item.priority === "critical" ? 25 : 50);
      }

      if (playbackToken === activePlaybackToken) {
        activeItem = null;
      }
    }

    processing = false;
  }

  async function enqueue(item: {
    effect: SpeechQueueEffect;
    interrupt?: boolean;
    interruptPolicy?: SpeechInterruptPolicy;
    priority?: SpeechPriority;
    silent?: boolean;
    stateId?: string;
  }) {
    const clinicalPriority = getSpeechPriority(item.effect.key);
    const clinicalIntensity = getSpeechIntensity(item.effect.key);
    const clinicalInterruptPolicy = getSpeechInterruptPolicy(item.effect.key, item.effect.message);
    const resolvedPriority = item.priority ?? clinicalPriority;
    const queueItem: SpeechQueueItem = {
      effect: item.effect,
      enqueuedAt: getNow(),
      nivel: getNivelDeFala(item.effect.key),
      mustFinish: deveTerminar(item.effect.key),
      intensity: item.effect.intensity ?? clinicalIntensity,
      interruptPolicy:
        item.interrupt === true
          ? "always"
          : item.interruptPolicy ?? clinicalInterruptPolicy,
      priority: resolvedPriority,
      silent: Boolean(item.silent),
      stateId: item.stateId,
    };

    if (hasPendingDuplicate(queueItem)) {
      return;
    }

    if (shouldInterruptCurrentPlayback(queueItem)) {
      interruptCurrentPlayback();
    }

    /**
     * ⚠️⚠️ ORDEM ⛔ ENTRE OS VÁLIDOS: `critical > action > guidance > explanation`.
     *
     * ⛔ Inserção ⛔ **⛔ estável**: dentro do mesmo nível, ⛔ quem chegou antes
     * ⛔ fala antes. ⛔ Um `unshift` para tudo que é crítico ⛔ inverteria ⛔ dois
     * críticos ⛔ seguidos — ⛔ e ⛔ a ordem ⛔ entre eles ⛔ é clínica.
     */
    const posicao = queue.findIndex(
      (naFila) => ORDEM_DOS_NIVEIS[naFila.nivel] > ORDEM_DOS_NIVEIS[queueItem.nivel]
    );
    if (posicao === -1) {
      queue.push(queueItem);
    } else {
      queue.splice(posicao, 0, queueItem);
    }

    await processQueue();
  }

  function clear() {
    queue = [];
    interruptCurrentPlayback();
  }

  /**
   * ⚠️⚠️⚠️ ⛔ A TELA MUDOU: ⛔ o que era do estado anterior ⛔ **⛔ para**.
   *
   * ⛔ MEDIDO em produção (2026-09-09): a tela avançava ⛔ e o áudio seguia
   * falando ⛔ o passo anterior ⛔ por ⛔ segundos. ⛔ Sem isto, ⛔ o descarte
   * ⛔ só acontecia ⛔ quando o item ⛔ **⛔ saía da fila** — ⛔ tarde demais
   * ⛔ para ⛔ o que ⛔ já estava ⛔ tocando.
   *
   * ⛔ ⛔ `mustFinish` ⛔ sobrevive ⛔ aqui — ⛔ energia ⛔ e dose ⛔ não se cortam
   * ⛔ no meio. ⛔ Mas ⛔ um `critical` novo ⛔ passa ⛔ por cima ⛔ dele, ⛔ pelo
   * caminho ⛔ do `enqueue`.
   */
  function sincronizarComOEstado(stateId: string) {
    /**
     * ⚠️⚠️ ⛔ QUEM DECIDE VALIDADE ⛔ É ⛔ **⛔ UM SÓ** — ⛔ `aindaVale`, ⛔ no
     * desenfileiramento.
     *
     * ⛔ ⛔ Havia aqui ⛔ um `queue.filter` ⛔ que ⛔ descartava ⛔ os pendentes
     * obsoletos ⛔ **⛔ de novo**. ⛔ Funcionava — ⛔ e ⛔ era ⛔ por isso ⛔ que
     * ⛔ **⛔ nenhuma das duas** cópias ⛔ podia ser provada: ⛔ mutar ⛔ uma
     * ⛔ deixava ⛔ a outra ⛔ segurando ⛔ o teste ⛔ verde.
     *
     * ⚠️ ⛔ O que ⛔ **⛔ só** este momento sabe ⛔ é ⛔ que a tela mudou
     * ⛔ **⛔ agora** — ⛔ e ⛔ por isso ⛔ ele cuida ⛔ do que ⛔ **⛔ já está
     * tocando**, ⛔ que ⛔ o desenfileiramento ⛔ **⛔ nunca** alcançaria.
     */
    if (
      activeItem &&
      activeItem.stateId &&
      activeItem.stateId !== stateId &&
      !activeItem.mustFinish &&
      deps.isOutputActive()
    ) {
      interruptCurrentPlayback();
    }
  }

  return {
    clear,
    enqueue,
    sincronizarComOEstado,
    stop: clear,
  };
}

export type { SpeechPriority, SpeechQueue, SpeechQueueEffect };
export { createSpeechQueue };
