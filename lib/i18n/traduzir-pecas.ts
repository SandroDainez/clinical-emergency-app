/**
 * Traduz PEÇA POR PEÇA e junta depois — nunca o contrário.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ────────────────────────────────────
 *
 * Três campos de tela eram definidos assim:
 *
 *     caution: [ "frase 1", CONSTANTE_A, CONSTANTE_B ].join(" ")
 *
 * e renderizados com `tr(drug.caution)`. O `tr()` recebia a frase JÁ COLADA —
 * 1.260, 1.122 e 831 caracteres — e nenhuma dessas somas é chave de dicionário.
 * Resultado: conteúdo clínico em PORTUGUÊS com o app em espanhol, em
 * `farmacologia-acls` e `pcr-gestacao-acls`.
 *
 * ⚠️ E CADA PEÇA, SOZINHA, JÁ TINHA TRADUÇÃO. Nenhuma palavra de espanhol
 * precisou ser escrita para corrigir: bastou traduzir antes de juntar.
 *
 * ── POR QUE NENHUMA DAS OUTRAS TRAVAS VIA ──────────────────────────────────
 *
 *   `test:i18n`              lê o FONTE, onde os literais estão separados e cada
 *                            um TEM a sua chave. Passava, e com razão.
 *   `test:frase-composta`    procura template literal com `${}`. Isto é
 *                            `.join(" ")`, que ela não vê.
 *   `test:traducao-runtime`  lê `lib/` e as árvores compiladas. Isto vive em
 *                            `components/protocol-screen/*.tsx`.
 *
 * Quem pega é `e2e/tela-em-espanhol.spec.ts`, que lê a TELA. R-82.
 *
 * ── A REGRA ────────────────────────────────────────────────────────────────
 *
 * Campo de texto que se compõe de partes é declarado como `string[]` e chega
 * aqui. Juntar na definição destrói a chave de cada parte, e a destruição é
 * silenciosa: em português a tela fica idêntica.
 */
export function traduzirPecas(
  tr: (pt: string) => string,
  valor: string | string[] | undefined,
  separador = " "
): string {
  if (valor === undefined) return "";
  const pecas = Array.isArray(valor) ? valor : [valor];
  return pecas.map((pedaco) => tr(pedaco)).join(separador);
}
