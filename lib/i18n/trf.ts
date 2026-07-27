/**
 * Tradução de frases montadas em runtime.
 *
 * Problema: strings construídas com template literal misturam prosa e valores
 * calculados, então o texto final nunca é o mesmo e não pode ser chave de
 * dicionário:
 *
 *   `Dose sugerida: ${dose} mEq de KCl (${ml} mL).`   ← não traduzível
 *
 * Solução: a chave passa a ser a frase com marcadores {0}, {1}… e os valores
 * entram depois da tradução:
 *
 *   trf(tr, "Dose sugerida: {0} mEq de KCl ({1} mL).", [dose, ml])
 *
 * `tr` vem por parâmetro (e não por import) porque as funções de cálculo vivem
 * fora do componente, onde não existe hook — e porque o `tr` ligado ao render
 * é o que evita o minificador congelar a tradução (ver lib/use-tr.ts).
 */
export function trf(
  tr: (pt: string) => string,
  pt: string,
  values: (string | number)[]
): string {
  let out = tr(pt);
  values.forEach((v, i) => {
    out = out.split(`{${i}}`).join(String(v));
  });
  return out;
}
