import type { AclsVoiceIntent } from "./voice-intents";
import { getVoiceIntentDefinition } from "./voice-intents";

type ResolveAclsVoiceIntentInput = {
  transcript: string;
  stateId: string;
  allowedIntents: AclsVoiceIntent[];
};

type ResolvedAclsVoiceIntent =
  | {
      kind: "matched";
      transcript: string;
      normalizedTranscript: string;
      stateId: string;
      intent: AclsVoiceIntent;
      confidence: number;
      requiresConfirmation: boolean;
      matchedPhrase: string;
    }
  | {
      kind: "low_confidence";
      transcript: string;
      normalizedTranscript: string;
      stateId: string;
      intent: AclsVoiceIntent;
      confidence: number;
      matchedPhrase: string;
    }
  | {
      kind: "unknown";
      transcript: string;
      normalizedTranscript: string;
      stateId: string;
      confidence: 0;
    };

const LOW_CONFIDENCE_THRESHOLD = 0.78;

function normalizeVoiceTranscript(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\bepi\b/g, "epinefrina")
    .replace(/\badren\b/g, "adrenalina")
    .replace(/\brosc\b/g, "retorno da circulacao espontanea")
    .replace(/\bfv\b/g, "fibrilacao ventricular")
    .replace(/\btv\b/g, "taquicardia ventricular")
    .replace(/\baesp\b/g, "atividade eletrica sem pulso")
    .replace(/\bnao chocavel\b/g, "ritmo nao chocavel")
    .replace(/\bchocavel\b/g, "ritmo chocavel")
    .replace(/\bchoque dado\b/g, "choque aplicado")
    .replace(/\bchoque feito\b/g, "choque aplicado")
    .replace(/\bchoque realizado\b/g, "choque aplicado")
    .replace(/\bcontinua sem pulso\b/g, "sem pulso")
    .replace(/\bsem rosc\b/g, "sem pulso")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreMatch(transcript: string, phrase: string) {
  if (transcript === phrase) {
    return 1;
  }

  if (transcript.includes(phrase) || phrase.includes(transcript)) {
    return 0.9;
  }

  const transcriptTokens = new Set(transcript.split(" ").filter(Boolean));
  const phraseTokens = phrase.split(" ").filter(Boolean);
  const sharedTokens = phraseTokens.filter((token) => transcriptTokens.has(token)).length;
  if (sharedTokens > 0 && sharedTokens === phraseTokens.length) {
    return 0.82;
  }

  return 0;
}

function resolveAclsVoiceIntent(
  input: ResolveAclsVoiceIntentInput
): ResolvedAclsVoiceIntent {
  const normalizedTranscript = normalizeVoiceTranscript(input.transcript);

  if (!normalizedTranscript) {
    return {
      kind: "unknown",
      transcript: input.transcript,
      normalizedTranscript,
      stateId: input.stateId,
      confidence: 0,
    };
  }

  let bestMatch:
    | {
        intent: AclsVoiceIntent;
        confidence: number;
        matchedPhrase: string;
        requiresConfirmation: boolean;
      }
    | undefined;

  for (const intent of input.allowedIntents) {
    const definition = getVoiceIntentDefinition(intent);

    for (const phrase of definition.phrases) {
      const normalizedPhrase = normalizeVoiceTranscript(phrase);
      const confidence = scoreMatch(normalizedTranscript, normalizedPhrase);
      if (!confidence) {
        continue;
      }

      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = {
          intent,
          confidence,
          matchedPhrase: phrase,
          requiresConfirmation: Boolean(definition.requiresConfirmation),
        };
      }
    }
  }

  if (!bestMatch) {
    return {
      kind: "unknown",
      transcript: input.transcript,
      normalizedTranscript,
      stateId: input.stateId,
      confidence: 0,
    };
  }

  if (bestMatch.confidence < LOW_CONFIDENCE_THRESHOLD) {
    return {
      kind: "low_confidence",
      transcript: input.transcript,
      normalizedTranscript,
      stateId: input.stateId,
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      matchedPhrase: bestMatch.matchedPhrase,
    };
  }

  return {
    kind: "matched",
    transcript: input.transcript,
    normalizedTranscript,
    stateId: input.stateId,
    intent: bestMatch.intent,
    confidence: bestMatch.confidence,
    requiresConfirmation: bestMatch.requiresConfirmation,
    matchedPhrase: bestMatch.matchedPhrase,
  };
}

export type { ResolveAclsVoiceIntentInput, ResolvedAclsVoiceIntent };
export {
  LOW_CONFIDENCE_THRESHOLD,
  normalizeVoiceTranscript,
  resolveAclsVoiceIntent,
};
