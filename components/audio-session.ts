import * as Speech from "expo-speech";
import { Platform } from "react-native";
import { WEB_AUDIO_CUES } from "./web-audio-cues";
import { Asset } from "expo-asset";

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

// Tracks native speech state since expo-speech has no synchronous isSpeaking().
let isNativeSpeaking = false;

const WEB_AUDIO_VERSION = "acls-20260324-final1";

function isWebSpeechAvailable() {
  return Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window;
}

function rememberSpeech(text: string) {
  lastSpeechSnapshot = {
    text,
    at: Date.now(),
  };
}

function stopSpeaking() {
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
  return;
}

async function speakText(text: string, cueId?: string) {
  if (!text.trim()) {
    return;
  }

  rememberSpeech(text);

  // --- Web ---
  if (isWebSpeechAvailable()) {
    const cueModule = cueId ? WEB_AUDIO_CUES[cueId] : undefined;

    if (cueModule) {
      const asset = Asset.fromModule(cueModule);
      const uri = asset.uri ? `${asset.uri}?v=${WEB_AUDIO_VERSION}` : undefined;

      if (uri) {
        stopSpeaking();
        const audio = new Audio(`${uri}&play=${Date.now()}`) as WebAudioElement;
        audio.preload = "auto";
        audio.muted = false;
        audio.volume = 1;
        audio.playsInline = true;
        audio.currentTime = 0;
        activeWebAudio = audio;
        audio.onerror = () => {
          console.error("Erro no elemento de áudio web:", {
            cueId,
            text,
            uri,
            networkState: audio.networkState,
            readyState: audio.readyState,
            error: audio.error?.message ?? audio.error?.code ?? "unknown",
          });
        };
        try {
          await new Promise<void>((resolve) => {
            let settled = false;
            audio.onended = () => {
              if (activeWebAudio === audio) {
                activeWebAudio = null;
              }
              if (!settled) {
                settled = true;
                resolve();
              }
            };
            audio.onerror = () => {
              if (activeWebAudio === audio) {
                activeWebAudio = null;
              }
              if (!settled) {
                settled = true;
                resolve();
              }
            };
            audio.play().catch(() => {
              if (activeWebAudio === audio) {
                activeWebAudio = null;
              }
              if (!settled) {
                settled = true;
                resolve();
              }
            });
          });
        } catch (error) {
          console.error("Falha ao tocar áudio web:", { cueId, text, uri, error });
        }
        return;
      }
    }

    const browserVoice = getPreferredBrowserVoice();

    if (browserVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = browserVoice.lang;
      utterance.voice = browserVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      stopSpeaking();
      activeWebUtterance = utterance;
      await new Promise<void>((resolve) => {
        let settled = false;
        utterance.onend = () => {
          if (activeWebUtterance === utterance) {
            activeWebUtterance = null;
          }
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        utterance.onerror = () => {
          if (activeWebUtterance === utterance) {
            activeWebUtterance = null;
          }
          if (!settled) {
            settled = true;
            resolve();
          }
        };
        window.speechSynthesis.speak(utterance);
      });
      return;
    }

    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    return;
  }

  // --- Native (iOS / Android) ---
  stopSpeaking();
  isNativeSpeaking = true;
  await new Promise<void>((resolve) => {
    Speech.speak(text, {
      language: "pt-BR",
      rate: 0.95,
      pitch: 1,
      onDone: () => {
        isNativeSpeaking = false;
        resolve();
      },
      onError: () => {
        isNativeSpeaking = false;
        resolve();
      },
      onStopped: () => {
        isNativeSpeaking = false;
        resolve();
      },
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
