import type { AppLocale } from "../../lib/locale";

/**
 * Formata o ordinal de uma dose conforme o idioma.
 * PT: "1ª", "2ª", "3ª" (mantém saída byte-idêntica à versão original).
 * ES: palavra feminina ("primera", "segunda"…) com fallback "{n}.ª".
 */
const ES_ORDINALS = [
  "",
  "primera",
  "segunda",
  "tercera",
  "cuarta",
  "quinta",
  "sexta",
];

export function formatOrdinal(n: number, locale: AppLocale): string {
  if (locale === "es-419") {
    return ES_ORDINALS[n] ?? `${n}.ª`;
  }
  return `${n}ª`;
}
