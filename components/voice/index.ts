import type { VoiceCaptureProvider } from "./voice-capture-provider";
import { createExpoVoiceCaptureProvider } from "./expo-voice-capture-provider";

// expo-speech-recognition handles all platforms (iOS, Android, Web).
// Run `npx expo install expo-speech-recognition` if not yet installed.
function createDefaultVoiceCaptureProvider(): VoiceCaptureProvider {
  return createExpoVoiceCaptureProvider();
}

export { createDefaultVoiceCaptureProvider };
export type { VoiceCaptureProvider, VoiceCaptureResult } from "./voice-capture-provider";
