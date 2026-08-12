/**
 * Ressalva de peso não aferido.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ──────────────────────────────────────────────
 *
 * O campo `pesoOrigem` era perguntado em NOVE módulos e lido por NENHUM. Nove
 * perguntas ao médico, em emergência, para um dado que nenhuma linha consumia —
 * atrito puro no exato lugar onde o app promete reduzir atrito.
 *
 * A saída não foi apagar o campo: foi fazê-lo informar a decisão. Os nove
 * módulos calculam dose por peso — alteplase, tenecteplase, insulina, heparina,
 * manitol, salina hipertônica, cristaloide, sedativos, bloqueadores. O erro do
 * peso passa integralmente para a dose, e em vários deles existe teto absoluto.
 *
 * ── O QUE O TEXTO NÃO DIZ, DE PROPÓSITO ──────────────────────────────────────
 *
 * Não diz "estimado por inspeção". O app NÃO SABE como o peso foi estimado —
 * pode ser referido pelo paciente, informado por acompanhante ou inspeção
 * visual, e cada um erra de um jeito. Afirmar o método seria o app inventando
 * um dado que não tem.
 *
 * Não diz "confirmar o peso quando possível". Em emergência frequentemente não
 * é possível, e instrução impossível vira ruído. O acionável é o que fazer
 * ENQUANTO não se pesa — daí a faixa terapêutica e o teto.
 */

// Uma linha só, sem concatenação: a varredura de tradução extrai LITERAIS, e
// texto costurado com `+` vira três entradas soltas no dicionário — cada uma
// traduzida sem enxergar as outras.
// eslint-disable-next-line prettier/prettier
export const PESO_NAO_AFERIDO = "⚠️ Peso não aferido — as doses abaixo foram calculadas sobre peso informado como estimado. O erro do peso passa integralmente para a dose. Onde houver faixa terapêutica, considerar o limite inferior; conferir teto absoluto antes de administrar; aferir o peso assim que o atendimento permitir.";

export const PESO_AFERIDO = "Peso informado como aferido (pesado).";

/** Valores aceitos pelo campo `pesoOrigem`. Domínio fechado — ver R-9. */
export const ORIGENS_DE_PESO = ["estimado", "real"] as const;
export type OrigemDePeso = (typeof ORIGENS_DE_PESO)[number];

export function normalizarOrigemDePeso(v: string | undefined | null): OrigemDePeso | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "estimado") return "estimado";
  if (s === "real" || s === "aferido" || s === "pesado") return "real";
  return null;
}

/**
 * A linha de ressalva para interpolar no nó da dose.
 *
 * Devolve SEMPRE texto — nunca string vazia. Token vazio deixaria um item de
 * lista em branco na tela, e item em branco é ruído que ensina a ignorar a
 * região onde o aviso mora.
 */
export function avisoDePeso(pesoOrigem: string | undefined | null): string {
  return normalizarOrigemDePeso(pesoOrigem) === "estimado" ? PESO_NAO_AFERIDO : PESO_AFERIDO;
}
