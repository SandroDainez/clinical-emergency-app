import { getActiveLocale } from "../../lib/locale";
import { ES_STRINGS } from "./es-419/strings";
import { ES_STRINGS_GENERATED } from "./es-419/strings-generated";
import { ES_SPEECH_CUES } from "./es-419/speech-cues";
import { ES_VOICE_PHRASES, type VoicePhraseEntry } from "./es-419/voice-phrases";

export { formatOrdinal } from "./format";
export type { VoicePhraseEntry };

/**
 * Traduz uma string de português para o idioma ativo.
 * Se não houver tradução (ou se o idioma for pt-BR), retorna o próprio PT.
 * Mantém o app byte-idêntico em PT.
 */
export function tr(pt: string, locale?: string): string {
  // `locale` opcional: quando passado (ex.: do useLanguage durante o render), evita
  // que o minificador "congele"/hoist as chamadas tr("literal") para fora do render
  // (bug em que o cabeçalho ficava preso no idioma inicial). Sem ele, lê o ativo.
  const loc = locale ?? getActiveLocale();
  if (loc !== "es-419") return pt;
  // Dicionário principal (curado) tem precedência; depois o gerado (árvores/telas).
  return ES_STRINGS[pt] ?? ES_STRINGS_GENERATED[pt] ?? pt;
}

/** Texto de áudio/fala (cue) no idioma ativo; cai no PT (fallback) se faltar. */
export function trSpeech(cueKey: string, ptText: string): string {
  if (getActiveLocale() !== "es-419") return ptText;
  return ES_SPEECH_CUES[cueKey] ?? ptText;
}

/** Frases de voz (ES) para um intent, ou null se o idioma não for ES. */
export function getEsVoicePhrases(intentId: string): VoicePhraseEntry | null {
  if (getActiveLocale() !== "es-419") return null;
  return ES_VOICE_PHRASES[intentId] ?? null;
}
