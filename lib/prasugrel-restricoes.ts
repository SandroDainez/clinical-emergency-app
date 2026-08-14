/**
 * Prasugrel — três restrições com TRÊS FORÇAS DIFERENTES (fonte única).
 *
 * ── O DEFEITO ────────────────────────────────────────────────────────────────
 *
 * A árvore trazia "evitar prasugrel se AVC/AIT prévio, > 75a ou < 60 kg" — três
 * restrições coladas com um verbo só. E "evitar" é errado em duas delas:
 *
 *   AVC/AIT prévio  → CONTRAINDICADO. No TRITON-TIMI 38 houve DANO LÍQUIDO.
 *   ≥ 75 anos       → NÃO RECOMENDADO, com escape: se o prescritor julgar
 *                     necessário após avaliação individual, ataque de 60 mg e
 *                     MANUTENÇÃO REDUZIDA a 5 mg.
 *   < 60 kg         → NÃO se evita: REDUZ a manutenção para 5 mg.
 *
 * Nivelar as três em "evitar" é conservador só na aparência: nega prasugrel a
 * quem podia recebê-lo com dose ajustada, e — pior — sugere que o AVC prévio é
 * negociável como os outros dois. O erro tem direções opostas na mesma linha.
 *
 * Fonte: TRITON-TIMI 38 (subanálise: >75 anos e <60 kg sem benefício líquido;
 * AVC/AIT prévio com dano líquido) e bula do prasugrel (Effient/genéricos —
 * contraindicação, advertência e ajuste de manutenção a 5 mg).
 */

export const PRASUGREL_RESTRICOES =
  "PRASUGREL — três restrições, e as forças são diferentes: (1) AVC OU AIT PRÉVIO é CONTRAINDICAÇÃO — no TRITON-TIMI 38 houve dano líquido, não apenas ausência de benefício; (2) 75 ANOS OU MAIS: não recomendado de rotina — se ainda assim for escolhido após avaliação individual, manutenção REDUZIDA de 5 mg; (3) PESO < 60 kg: não se evita a droga, REDUZ-SE a manutenção para 5 mg. Nivelar as três em «evitar» nega a droga a quem podia recebê-la ajustada e faz o AVC prévio parecer negociável como os outros dois.";
