/**
 * GLASGOW NO AVC — ⚠️ **a escala que já existe**, ⛔ e ⛔ nenhuma cópia.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE ESTE ARQUIVO É TÃO CURTO ────────────────────────────
 *
 * ⛔ ⛔ A calculadora de Glasgow **⛔ já existia** em
 * `clinical-calculators-engine.ts` (`CALC_TOOLS`, id `glasgow`), com E, V ⛔ e M,
 * os pontos de cada opção ⛔ e a referência — **Teasdale & Jennett, Lancet
 * 1974**. ⚠️ ⛔ Este módulo ⛔ **⛔ não redigita ⛔ nada**: ⛔ ele aponta.
 *
 * ⚠️ ⛔ É o mesmo caminho de `nihss.ts`, ⛔ e ⛔ pelo mesmo motivo: ⛔ uma segunda
 * tabela de pontos divergiria da primeira no dia em que ⛔ alguém corrigisse
 * ⛔ só uma delas.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ESTE MÓDULO ⛔ **⛔ NÃO** TRAZ ──────────────────────────
 *
 * ⛔ ⛔ **A interpretação.** ⚠️ A ferramenta original diz coisas como *"GCS 8 —
 * limiar clássico de proteção de via aérea"* ⛔ e *"GCS ≤ 7 — grave"*. ⛔ Essas
 * frases pertencem às fontes **daquele** módulo.
 *
 * ⚠️⚠️ ⛔ O motor do AVC declara o contrário, ⛔ e por escrito
 * (`ameacas-imediatas.ts`): *"Glasgow ⛔ não entra no julgamento — ⛔ **⛔ nenhuma
 * fonte deste módulo lhe dá corte** (**E-31**)"*. ⚠️ ⛔ Trazer a interpretação
 * junto com o número seria conduta da fonte de outro módulo entrando ⛔ aqui.
 *
 * ⚠️ Decisão do autor, 2026-09-08: *"⛔ não criar interpretação clínica nova"*.
 * ⛔ **⛔ Vem o número, ⛔ e ⛔ não o juízo.**
 */
import { CALC_TOOLS, type ScoreTool, type ScoreVar } from "../../clinical-calculators-engine";

const ESCALA = CALC_TOOLS.find((t) => t.id === "glasgow");

/**
 * ⚠️ ⛔ Falha **alto ⛔ e cedo**: ⛔ a escala sumir do catálogo ⛔ e este módulo
 * seguir com uma lista vazia daria uma calculadora ⛔ sem itens, ⛔ e ⛔ sem erro.
 */
if (!ESCALA || ESCALA.kind !== "score") {
  throw new Error("avc/conteudo/glasgow: a escala Glasgow não foi encontrada nas calculadoras");
}

export const GLASGOW: ScoreTool = ESCALA as ScoreTool;

/** ⚠️ ⛔ Os três componentes, ⛔ na ordem do exame: **E · V · M**. */
export const ITENS_GLASGOW: readonly ScoreVar[] = GLASGOW.vars;

/**
 * ⚠️ O prefixo dos componentes na trilha — ⛔ **um fato por componente**, ⛔ como
 * o NIHSS faz desde 2026-08-29 (§3.1).
 *
 * ⚠️⚠️ ⛔ E ⛔ eles ⛔ **⛔ não** são `Campo` declarados: ⛔ ninguém os desenha
 * como pergunta solta, ⛔ e ⛔ ninguém os lê no núcleo. ⛔ São o **registro de
 * como se chegou ao total** — ⛔ exatamente o papel de `nihss_<id>`.
 */
export const CAMPO_DE_ITEM_GLASGOW = (id: string) => `glasgow_${id}`;

/**
 * ── ⚠️⚠️⚠️ A ORIGEM DO TOTAL — exigência do autor, 2026-09-08 ─────────────
 *
 * ⛔ ⛔ *"A trilha deve permitir saber se o valor veio de cálculo ⛔ ou foi
 * informado diretamente"*, ⛔ e *"⛔ não misturar origens silenciosamente"*.
 *
 * ⚠️ ⛔ Ela é **fato**, ⛔ e ⛔ não dedução: ⛔ deduzir *"calculado"* de
 * `E+V+M === total` mentiria no caso em que o médico calcula 11 ⛔ e depois
 * digita 11 — ⛔ o número bate, ⛔ e a procedência ⛔ não.
 *
 * ⚠️ É o mesmo princípio de `peso_origem`: **origem muda a confiança ⛔ sem
 * mudar o número** (**E-14**).
 */
export const CAMPO_DA_ORIGEM_DO_GLASGOW = "glasgow_origem";

export const ORIGEM_DO_GLASGOW = {
  calculado: "Calculado pelos componentes",
  informado: "Informado diretamente",
} as const;

/**
 * ⚠️ A soma dos três — ⛔ e ⛔ ela ⛔ só existe com os **três**: ⛔ um Glasgow
 * pela metade ⛔ não é um Glasgow, ⛔ e o mínimo da escala é **3**, ⛔ e ⛔ não 0.
 */
export function totalDoGlasgow(
  pontos: Readonly<Record<string, number>>
): number | undefined {
  const faltando = ITENS_GLASGOW.some((v) => pontos[v.id] === undefined);
  return faltando ? undefined : ITENS_GLASGOW.reduce((s, v) => s + pontos[v.id], 0);
}
