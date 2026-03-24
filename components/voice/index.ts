import type { VoiceCaptureProvider } from "./voice-capture-provider";
import { createUnavailableVoiceCaptureProvider } from "./voice-capture-provider";
import { createWebVoiceCaptureProvider } from "./web-voice-capture-provider";

function createDefaultVoiceCaptureProvider(): VoiceCaptureProvider {
  if (typeof window !== "undefined") {
    return createWebVoiceCaptureProvider();
  }

  return createUnavailableVoiceCaptureProvider();
}

export { createDefaultVoiceCaptureProvider };
export type { VoiceCaptureProvider, VoiceCaptureResult } from "./voice-capture-provider";
