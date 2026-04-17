import * as Speech from "expo-speech";
// eslint-disable-next-line import/no-unresolved
import { Asset } from "expo-asset";
import { Platform } from "react-native";
import { WEB_AUDIO_CUES } from "./web-audio-cues";
import type { Audio as ExpoAudioModule } from "expo-av";

type SpeechSnapshot = {
  text: string;
  at: number;
};

type WebAudioElement = HTMLAudioElement & {
  playsInline?: boolean;
};

let lastSpeechSnapshot: SpeechSnapshot | null = null;
let activeWebAudio: HTMLAudioElement | null = null;
let activeWebUtterance: SpeechSynthesisUtterance | null = null;
let activeNativeSound: ExpoAudioModule.Sound | null = null;
let webAudioPrimed = false;
let webAudioPrimePromise: Promise<void> | null = null;

// Tracks native speech state since expo-speech has no synchronous isSpeaking().
let isNativeSpeaking = false;

const WEB_AUDIO_VERSION = "acls-20260324-final2";
const SILENT_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

function debugAudio(event: string, details?: Record<string, unknown>) {
  if (Platform.OS !== "web") {
    return;
  }

  console.log("[audio-session]", event, details ?? {});
}

function isWebSpeechAvailable() {
  return Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window;
}

function rememberSpeech(text: string) {
  lastSpeechSnapshot = {
    text,
    at: Date.now(),
  };
}

async function stopSpeaking() {
  // Stop native MP3 sound (expo-av)
  if (activeNativeSound) {
    try {
      await activeNativeSound.stopAsync();
      await activeNativeSound.unloadAsync();
    } catch {
      // ignore
    }
    activeNativeSound = null;
  }

  if (isWebSpeechAvailable()) {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    if (activeWebAudio) {
      activeWebAudio.pause();
      activeWebAudio.currentTime = 0;
      activeWebAudio = null;
    }

    activeWebUtterance = null;
    return;
  }

  isNativeSpeaking = false;
  Speech.stop();
}

function getPreferredBrowserVoice() {
  if (!isWebSpeechAvailable()) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  return (
    voices.find((voice) => voice.name.toLowerCase() === "google português do brasil") ??
    voices.find((voice) => voice.name.toLowerCase() === "google português") ??
    voices.find((voice) => voice.name.toLowerCase() === "luciana") ??
    null
  );
}

function preloadWebAudio() {
  if (!isWebSpeechAvailable() || webAudioPrimed) {
    return;
  }

  debugAudio("preload_register_unlock");
  window.speechSynthesis.getVoices();

  const unlock = () => {
    if (webAudioPrimed || webAudioPrimePromise) {
      return;
    }

    webAudioPrimePromise = (async () => {
      debugAudio("unlock_start");
      try {
        const audio = new Audio(SILENT_WAV_DATA_URI) as WebAudioElement;
        audio.preload = "auto";
        audio.muted = false;
        audio.volume = 0.001;
        audio.playsInline = true;
        await audio.play().catch(() => undefined);
        audio.pause();
        audio.currentTime = 0;
        debugAudio("unlock_audio_primed");
      } catch {
        debugAudio("unlock_audio_failed");
      }

      try {
        const utterance = new SpeechSynthesisUtterance("");
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.cancel();
        debugAudio("unlock_tts_primed");
      } catch {
        debugAudio("unlock_tts_failed");
      }

      webAudioPrimed = true;
      webAudioPrimePromise = null;
      debugAudio("unlock_complete");
    })();
  };

  const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "click"];
  const handleFirstGesture = () => {
    for (const eventName of events) {
      window.removeEventListener(eventName, handleFirstGesture);
    }
    unlock();
  };

  for (const eventName of events) {
    window.addEventListener(eventName, handleFirstGesture, { once: true });
  }
}

async function playWebCueAudio(uri: string): Promise<boolean> {
  debugAudio("web_mp3_attempt", { uri });
  const audio = new Audio(`${uri}&play=${Date.now()}`) as WebAudioElement;
  audio.preload = "auto";
  audio.muted = false;
  audio.volume = 1;
  audio.playsInline = true;
  audio.currentTime = 0;
  activeWebAudio = audio;

  try {
    await audio.play();
    debugAudio("web_mp3_play_started", { uri });
  } catch (error) {
    if (activeWebAudio === audio) {
      activeWebAudio = null;
    }
    console.warn("[audio-session] MP3 web bloqueado ou indisponível, usando fallback TTS:", error);
    debugAudio("web_mp3_play_failed", {
      uri,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }

  return await new Promise<boolean>((resolve) => {
    let settled = false;

    audio.onended = () => {
      if (activeWebAudio === audio) activeWebAudio = null;
      if (!settled) {
        settled = true;
        debugAudio("web_mp3_ended", { uri });
        resolve(true);
      }
    };

    audio.onerror = () => {
      if (activeWebAudio === audio) activeWebAudio = null;
      if (!settled) {
        settled = true;
        debugAudio("web_mp3_error", { uri });
        resolve(false);
      }
    };
  });
}

async function speakWebFallback(text: string) {
  const browserVoice = getPreferredBrowserVoice();
  debugAudio("web_tts_attempt", {
    hasVoice: Boolean(browserVoice),
    text,
  });

  if (browserVoice) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = browserVoice.lang;
    utterance.voice = browserVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    activeWebUtterance = utterance;

    await new Promise<void>((resolve) => {
      let settled = false;
      utterance.onend = () => {
        if (activeWebUtterance === utterance) activeWebUtterance = null;
        if (!settled) {
          settled = true;
          debugAudio("web_tts_ended", { text, voice: browserVoice.name });
          resolve();
        }
      };
      utterance.onerror = () => {
        if (activeWebUtterance === utterance) activeWebUtterance = null;
        if (!settled) {
          settled = true;
          debugAudio("web_tts_error", { text, voice: browserVoice.name });
          resolve();
        }
      };
      debugAudio("web_tts_started", { text, voice: browserVoice.name });
      window.speechSynthesis.speak(utterance);
    });
    return;
  }

  debugAudio("web_tts_started_default_voice", { text });
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

// ─── Native MP3 playback via expo-av ─────────────────────────────────────────

async function playNativeMp3(cueModule: number): Promise<boolean> {
  try {
    const { Audio: ExpoAudio } = await import("expo-av");

    await ExpoAudio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    });

    const asset = Asset.fromModule(cueModule);
    if (!asset.localUri && !asset.uri) {
      await asset.downloadAsync().catch(() => undefined);
    }
    debugAudio("native_asset_resolved", {
      uri: asset.uri,
      localUri: asset.localUri,
    });

    if (!asset.localUri && !asset.uri) {
      return false;
    }

    const { sound } = await ExpoAudio.Sound.createAsync(
      { uri: asset.localUri ?? asset.uri! },
      { shouldPlay: true, volume: 1.0 }
    );

    activeNativeSound = sound;

    await new Promise<void>((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          resolve();
          return;
        }
        if (status.didJustFinish) {
          resolve();
        }
      });
    });

    try {
      await sound.unloadAsync();
    } catch {
      // ignore
    }
    if (activeNativeSound === sound) {
      activeNativeSound = null;
    }

    return true;
  } catch (err) {
    console.warn("[audio-session] Falha ao reproduzir MP3 nativo:", err);
    return false;
  }
}

// ─── Main speak function ──────────────────────────────────────────────────────

async function speakText(text: string, cueId?: string) {
  if (!text.trim()) {
    return;
  }

  rememberSpeech(text);

  const cueModule = cueId ? WEB_AUDIO_CUES[cueId] : undefined;

  // ── Web ────────────────────────────────────────────────────────────────────
  if (isWebSpeechAvailable()) {
    preloadWebAudio();
    debugAudio("speak_web", { text, cueId, primed: webAudioPrimed });
    await stopSpeaking();

    if (cueModule) {
      const asset = Asset.fromModule(cueModule);
      debugAudio("web_asset_resolve_start", { cueId });
      if (!asset.localUri && !asset.uri) {
        await asset.downloadAsync().catch((error: unknown) => {
          debugAudio("web_asset_download_failed", {
            cueId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
      const assetUri = asset.localUri ?? asset.uri;
      debugAudio("web_asset_resolved", {
        cueId,
        uri: asset.uri,
        localUri: asset.localUri,
      });
      const uri = assetUri ? `${assetUri}?v=${WEB_AUDIO_VERSION}` : undefined;

      if (uri) {
        try {
          const played = await playWebCueAudio(uri);
          if (played) {
            return;
          }
        } catch (error) {
          console.error("[audio-session] Falha ao tocar áudio web:", { cueId, uri, error });
        }
      }
    }

    await speakWebFallback(text);
    return;
  }

  // ── Native (iOS / Android) — MP3 first, TTS fallback ─────────────────────
  stopSpeaking();

  if (cueModule) {
    const played = await playNativeMp3(cueModule);
    if (played) return;
  }

  // TTS fallback for missing or failed MP3
  isNativeSpeaking = true;
  await new Promise<void>((resolve) => {
    Speech.speak(text, {
      language: "pt-BR",
      rate: 0.95,
      pitch: 1,
      onDone: () => { isNativeSpeaking = false; resolve(); },
      onError: () => { isNativeSpeaking = false; resolve(); },
      onStopped: () => { isNativeSpeaking = false; resolve(); },
    });
  });
}

function wasRecentlySpoken(text: string, thresholdMs = 1000) {
  if (!lastSpeechSnapshot) {
    return false;
  }

  return (
    lastSpeechSnapshot.text === text && Date.now() - lastSpeechSnapshot.at < thresholdMs
  );
}

function isSpeechOutputActive() {
  if (activeNativeSound) {
    return true;
  }

  if (isWebSpeechAvailable()) {
    const synthesisActive =
      window.speechSynthesis.speaking ||
      window.speechSynthesis.pending ||
      Boolean(activeWebUtterance);
    const audioActive = Boolean(activeWebAudio);
    return synthesisActive || audioActive;
  }

  return isNativeSpeaking;
}

export {
  isSpeechOutputActive,
  isWebSpeechAvailable,
  preloadWebAudio,
  speakText,
  stopSpeaking,
  wasRecentlySpoken,
};
