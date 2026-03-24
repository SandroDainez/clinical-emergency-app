import type {
  CaptureVoiceOptions,
  VoiceCaptureProvider,
  VoiceCaptureResult,
} from "./voice-capture-provider";
import { createUnavailableVoiceCaptureProvider } from "./voice-capture-provider";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult:
    | ((
        event: {
          results: ArrayLike<
            ArrayLike<{
              transcript: string;
            }>
          >;
        }
      ) => void)
    | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getWebSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    (window as typeof window & { SpeechRecognition?: SpeechRecognitionConstructor })
      .SpeechRecognition ??
    (
      window as typeof window & {
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }
    ).webkitSpeechRecognition ??
    null
  );
}

function createWebVoiceCaptureProvider(): VoiceCaptureProvider {
  const SpeechRecognition = getWebSpeechRecognitionConstructor();

  if (!SpeechRecognition) {
    return createUnavailableVoiceCaptureProvider();
  }

  let activeRecognition: SpeechRecognitionLike | null = null;

  function stop() {
    activeRecognition?.stop();
    activeRecognition = null;
  }

  async function captureOnce(options: CaptureVoiceOptions): Promise<VoiceCaptureResult> {
    const Recognition = getWebSpeechRecognitionConstructor();

    if (!Recognition) {
      return {
        kind: "error",
        error: "not_available",
        message: "Reconhecimento de voz indisponível neste dispositivo.",
      };
    }

    return new Promise<VoiceCaptureResult>((resolve) => {
      let settled = false;
      let pendingTranscript: string | null = null;
      const recognition = new Recognition();
      activeRecognition = recognition;
      recognition.lang = options.lang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onerror = (event) => {
        if (settled) {
          return;
        }
        settled = true;
        options.onEnd?.();
        resolve({
          kind: "error",
          error: event.error === "no-speech" ? "no_speech" : "capture_failed",
          message:
            event.error === "no-speech"
              ? "Nenhum comando detectado."
              : "Falha ao captar o comando de voz.",
        });
      };
      recognition.onend = () => {
        activeRecognition = null;
        if (!settled) {
          settled = true;
          options.onEnd?.();
          resolve(
            pendingTranscript
              ? { kind: "transcript", transcript: pendingTranscript }
              : {
                  kind: "error",
                  error: "no_speech",
                  message: "Nenhum comando detectado.",
                }
          );
          return;
        }
        options.onEnd?.();
      };
      recognition.onresult = (event) => {
        if (settled) {
          return;
        }
        pendingTranscript = event.results[0]?.[0]?.transcript?.trim() ?? null;
        recognition.stop();
      };

      try {
        options.onStart?.();
        recognition.start();
      } catch {
        settled = true;
        activeRecognition = null;
        options.onEnd?.();
        resolve({
          kind: "error",
          error: "capture_failed",
          message: "Não foi possível iniciar o microfone.",
        });
      }
    });
  }

  return {
    id: "web-speech-recognition",
    isAvailable: () => Boolean(getWebSpeechRecognitionConstructor()),
    captureOnce,
    stop,
  };
}

export type { SpeechRecognitionConstructor, SpeechRecognitionLike };
export { createWebVoiceCaptureProvider, getWebSpeechRecognitionConstructor };
