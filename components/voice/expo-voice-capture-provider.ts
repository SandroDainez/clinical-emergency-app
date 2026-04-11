import type {
  CaptureVoiceOptions,
  VoiceCaptureProvider,
  VoiceCaptureResult,
} from "./voice-capture-provider";
import { createUnavailableVoiceCaptureProvider } from "./voice-capture-provider";

// Lazy-loaded to avoid crashing when the package is not installed.
// Run: npx expo install expo-speech-recognition
function loadExpoSpeechRecognition() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("expo-speech-recognition") as typeof import("expo-speech-recognition");
    return mod.ExpoSpeechRecognitionModule ?? null;
  } catch {
    return null;
  }
}

type SpeechModule = ReturnType<typeof loadExpoSpeechRecognition>;

function createExpoVoiceCaptureProvider(): VoiceCaptureProvider {
  const module: SpeechModule = loadExpoSpeechRecognition();

  if (!module) {
    return createUnavailableVoiceCaptureProvider();
  }

  const speech = module;

  let abortRequested = false;

  function stop() {
    abortRequested = true;
    try {
      speech.abort();
    } catch {}
  }

  async function captureOnce(options: CaptureVoiceOptions): Promise<VoiceCaptureResult> {
    abortRequested = false;

    return new Promise<VoiceCaptureResult>((resolve) => {
      let settled = false;
      let pendingTranscript: string | null = null;
      const subscriptions: { remove: () => void }[] = [];

      function cleanup() {
        for (const sub of subscriptions) {
          sub.remove();
        }
        subscriptions.length = 0;
      }

      function settle(result: VoiceCaptureResult) {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        options.onEnd?.();
        resolve(result);
      }

      // result: { isFinal: boolean; results: Array<{ transcript: string; confidence: number }> }
      subscriptions.push(
        speech.addListener("result", (event) => {
          if (settled) {
            return;
          }
          const transcript = event.results?.[0]?.transcript?.trim() ?? null;
          if (transcript && event.isFinal) {
            pendingTranscript = transcript;
            speech.stop();
          } else if (transcript && !event.isFinal) {
            // Keep the latest interim as pending, will be confirmed on end.
            pendingTranscript = transcript;
          }
        })
      );

      // error: { error: ExpoSpeechRecognitionErrorCode; message: string }
      subscriptions.push(
        speech.addListener("error", (event) => {
          if (abortRequested) {
            settle({
              kind: "error",
              error: "capture_failed",
              message: "Captura interrompida.",
            });
            return;
          }
          settle({
            kind: "error",
            error: event.error === "no-speech" || event.error === "speech-timeout"
              ? "no_speech"
              : "capture_failed",
            message: event.message ?? "Falha ao captar o comando de voz.",
          });
        })
      );

      subscriptions.push(
        speech.addListener("end", () => {
          settle(
            pendingTranscript
              ? { kind: "transcript", transcript: pendingTranscript }
              : { kind: "error", error: "no_speech", message: "Nenhum comando detectado." }
          );
        })
      );

      try {
        options.onStart?.();
        speech.start({
          lang: options.lang,
          interimResults: true,
          maxAlternatives: 1,
          continuous: false,
          requiresOnDeviceRecognition: false,
        });
      } catch {
        settle({
          kind: "error",
          error: "capture_failed",
          message: "Não foi possível iniciar o microfone.",
        });
      }
    });
  }

  return {
    id: "expo-speech-recognition",
    isAvailable: () => {
      try {
        return speech.isRecognitionAvailable();
      } catch {
        return false;
      }
    },
    captureOnce,
    stop,
  };
}

export { createExpoVoiceCaptureProvider };
