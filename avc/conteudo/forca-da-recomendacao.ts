/**
 * FORÇA DA RECOMENDAÇÃO, TRADUZIDA (AC-108; autor, 2026-09-14, 17ª rodada).
 *
 * ⚠️ A tela mostra a FORÇA traduzida da classe (COR); o verbo ⛔ o verbatim em inglês moram só no ⓘ.
 * ⚠️ É o rótulo da classe, ⛔ uma tradução do verbo: "not recommended" ⛔ vira "contraindicado" (E-45) —
 * a classe 3 diz "Sem benefício" ⛔ "Potencialmente danoso", como a própria classe declara.
 * ⚠️ Aceita as duas grafias do repositório ("COR 2a" ⛔ "2a"); classe ausente ("—") ⛔ tem rótulo.
 */

export function classeCurta(cor: string): string {
  return cor.replace(/^COR\s+/, "").replace(/:\s*(No Benefit|Harm)$/, "");
}

export function rotuloDaForca(cor: string): string | undefined {
  const c = cor.replace(/^COR\s+/, "");
  if (c === "1") return "Recomendado";
  if (c === "2a") return "Razoável";
  if (c === "2b") return "Pode ser considerado";
  if (c === "3: No Benefit") return "Sem benefício";
  if (c === "3: Harm") return "Potencialmente danoso";
  return undefined;
}

/** ⚠️ Classe 3 carrega a direção em inglês ("No Benefit"/"Harm"): o rótulo traduzido acompanha o número, ⛔ some. */
export function forcaDaClasse3(cor: string): string | undefined {
  return /^(COR\s+)?3:/.test(cor) ? rotuloDaForca(cor) : undefined;
}

