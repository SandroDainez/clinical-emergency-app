type VoiceCaptureResult =
  | {
      kind: "transcript";
      transcript: string;
    }
  | {
      kind: "error";
      error: "not_available" | "no_speech" | "capture_failed";
      message: string;
    };

type CaptureVoiceOptions = {
  lang: string;
  onStart?: () => void;
  onEnd?: () => void;
};

type VoiceCaptureProvider = {
  id: string;
  isAvailable: () => boolean;
  captureOnce: (options: CaptureVoiceOptions) => Promise<VoiceCaptureResult>;
  stop: () => void;
};

function createUnavailableVoiceCaptureProvider(): VoiceCaptureProvider {
  return {
    id: "unavailable",
    isAvailable: () => false,
    captureOnce: async () => ({
      kind: "error",
      error: "not_available",
      message: "Reconhecimento de voz indisponível neste dispositivo.",
    }),
    stop: () => {},
  };
}

export type { CaptureVoiceOptions, VoiceCaptureProvider, VoiceCaptureResult };
export { createUnavailableVoiceCaptureProvider };
