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

const LOW_CONFIDENCE_THRESHOLD = 0.70;

// Stop words do PT-BR que o STT frequentemente insere e que não fazem parte
// das frases canônicas — removê-las melhora o match sem alterar o sentido.
const PT_STOP_WORDS = new Set([
  "o", "a", "os", "as", "um", "uma", "uns", "umas",
  "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "ao", "aos", "a", "para", "por", "com", "que", "se", "e", "ou",
  "ja", "so", "ai", "la", "ca", "le", "li",
]);

function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((t) => t.length > 1 && !PT_STOP_WORDS.has(t));
}

function normalizeVoiceTranscript(value: string) {
  // Passo 1: normalização base — sem expansões em cadeia para evitar duplicações.
  let s = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Passo 2: contrações — formas longas → chave curta canônica.
  // Ordem: mais específico primeiro, para evitar matches parciais incorretos.
  s = s
    // Formas de choque → chave "choque aplicado"
    .replace(/\bchoque dado\b/g, "choque aplicado")
    .replace(/\bchoque feito\b/g, "choque aplicado")
    .replace(/\bchoque realizado\b/g, "choque aplicado")
    .replace(/\bdesfibrilacao realizada\b/g, "choque aplicado")
    .replace(/\bdesfibrilacao aplicada\b/g, "choque aplicado")
    // Ritmo
    .replace(/\bnao chocavel\b/g, "ritmo nao chocavel")
    .replace(/\bchecar ritmo\b/g, "avaliar ritmo")
    .replace(/\bver ritmo\b/g, "avaliar ritmo")
    // Pulso / ausência de circulação
    .replace(/\bcontinua sem pulso\b/g, "sem pulso")
    .replace(/\bseguindo sem pulso\b/g, "sem pulso")
    .replace(/\bsem rosc\b/g, "sem pulso")
    // Iniciar RCP — agrupa todas as formas verbais em "iniciar rcp"
    .replace(/\biniciar reanimacao cardiopulmonar\b/g, "iniciar rcp")
    .replace(/\biniciar compressoes cardiacas\b/g, "iniciar rcp")
    .replace(/\biniciar compressoes\b/g, "iniciar rcp")
    .replace(/\biniciar reanimacao\b/g, "iniciar rcp")
    // Retomar RCP — agrupa em "retomar rcp"
    .replace(/\bretomar reanimacao cardiopulmonar\b/g, "retomar rcp")
    .replace(/\breiniciar reanimacao cardiopulmonar\b/g, "retomar rcp")
    .replace(/\bretomar reanimacao\b/g, "retomar rcp")
    .replace(/\breiniciar reanimacao\b/g, "retomar rcp")
    .replace(/\bretomar compressoes\b/g, "retomar rcp")
    // Abreviações de palavras isoladas (apenas quando não fazem parte de outra expansão)
    .replace(/\bepi\b/g, "epinefrina")
    .replace(/\badren\b/g, "adrenalina")
    .replace(/\badrenalina\b/g, "epinefrina")
    .replace(/\brosc\b/g, "retorno da circulacao espontanea")
    .replace(/\bfv\b/g, "fibrilacao ventricular")
    .replace(/\btv\b/g, "taquicardia ventricular")
    .replace(/\baesp\b/g, "atividade eletrica sem pulso")
    .replace(/\brcp\b/g, "rcp");          // mantém "rcp" canônico

  return s;
}

function scoreMatch(transcript: string, phrase: string) {
  // 1. Correspondência exata
  if (transcript === phrase) {
    return 1.0;
  }

  // 2. Um contém o outro (STT pode adicionar palavras antes/depois)
  if (transcript.includes(phrase) || phrase.includes(transcript)) {
    return 0.95;
  }

  const transcriptTokens = transcript.split(" ").filter(Boolean);
  const phraseTokens = phrase.split(" ").filter(Boolean);

  // 3. Todos os tokens da frase presentes no transcript (após stop words) → alta confiança
  const transcriptSet = new Set(transcriptTokens);
  const phraseKey = removeStopWords(phraseTokens);
  const transcriptKey = removeStopWords(transcriptTokens);
  const transcriptKeySet = new Set(transcriptKey);

  const allKeyTokensMatch =
    phraseKey.length > 0 &&
    phraseKey.every((t) => transcriptSet.has(t) || transcriptKeySet.has(t));

  if (allKeyTokensMatch) {
    return 0.92;
  }

  // 4. Correspondência parcial: maioria dos tokens chave presentes
  if (phraseKey.length >= 2) {
    const matchedKeyTokens = phraseKey.filter(
      (t) => transcriptSet.has(t) || transcriptKeySet.has(t)
    ).length;
    const ratio = matchedKeyTokens / phraseKey.length;
    if (ratio >= 0.6) {
      return 0.72 + 0.1 * ratio;  // 0.72–0.82 dependendo da proporção
    }
  }

  // 5. Pelo menos um token chave e o transcript é curto (comando de uma palavra)
  if (transcriptTokens.length <= 2 && phraseKey.length <= 2) {
    const singleMatch = phraseKey.some(
      (t) => transcriptSet.has(t) || transcriptKeySet.has(t)
    );
    if (singleMatch) {
      return 0.80;
    }
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
