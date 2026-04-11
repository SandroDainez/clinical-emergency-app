// Pre-recorded audio files are intentionally disabled.
// The app uses TTS synthesis (browser SpeechSynthesis / expo-speech) with the
// phrases defined in acls/speech-map.ts and protocol.json instead.
// To re-enable pre-recorded audio, uncomment the entries below and ensure the
// MP3 files in assets/audio/final-acls/ match the current script.
const WEB_AUDIO_CUES: Record<string, number> = {};

export { WEB_AUDIO_CUES };
