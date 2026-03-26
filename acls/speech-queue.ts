import {
  getSpeechIntensity,
  getSpeechInterruptPolicy,
  getSpeechPriority,
  getSpeechText,
  resolveSpeechKey,
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
  priority: SpeechPriority;
  silent: boolean;
  stateId?: string;
};

type ActiveSpeechItem = {
  intensity: SpeechIntensity;
  interruptPolicy: SpeechInterruptPolicy;
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

    if (item.interruptPolicy === "never") {
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

      if (item.stateId && deps.getCurrentStateId() !== item.stateId) {
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
      intensity: item.effect.intensity ?? clinicalIntensity,
      interruptPolicy:
        item.interrupt === true
          ? "always"
          : item.interruptPolicy ?? clinicalInterruptPolicy,
      priority: resolvedPriority,
      silent: Boolean(item.silent),
      stateId: item.stateId,
    };

    if (shouldInterruptCurrentPlayback(queueItem)) {
      interruptCurrentPlayback();
    }

    if (queueItem.priority === "critical") {
      queue.unshift(queueItem);
    } else {
      queue.push(queueItem);
    }

    await processQueue();
  }

  function clear() {
    queue = [];
    interruptCurrentPlayback();
  }

  return {
    clear,
    enqueue,
    stop: clear,
  };
}

export type { SpeechPriority, SpeechQueue, SpeechQueueEffect };
export { createSpeechQueue };
