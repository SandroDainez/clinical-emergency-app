/**
 * CONSUMIDORES DECLARADOS — ⚠️ **quem pode influenciar o quê**.
 *
 * ── ⚠️⚠️ A REGRA, NAS PALAVRAS DO AUTOR (2026-09-07) ──────────────────────
 *
 * > *"Um campo só pode influenciar uma derivação clínica se essa dependência
 * >  estiver **explicitamente declarada ⛔ e testada**."*
 *
 * ── ⚠️⚠️ ⛔ ELA CORRIGE UMA PROPOSTA MINHA QUE ESTAVA ERRADA ───────────────
 *
 * ⛔ Eu ia travar *"⛔ nenhuma derivação do AVC lê campo global"*. ⚠️ O autor
 * apontou o furo: ⛔ isso proibiria **o peso de alimentar a dose do
 * trombolítico** — ⛔ que é ⛔ exatamente para o que ⛔ ele existe.
 *
 * ⚠️ Escopo diz **de quem é o dado**; ⛔ e ⛔ quem pode lê-lo é **isto aqui**.
 *
 * ── ⚠️ O QUE ESTA LISTA ⛔ NÃO É ───────────────────────────────────────────
 *
 * ⛔ **⛔ Não é documentação.** ⚠️ `prova-avc-consumidores` a **executa**: varre
 *    o núcleo ⛔ e reprova quem lê um campo global ⛔ sem estar declarado aqui.
 * ⛔ **⛔ Não decide medicina.** ⚠️ Ela ⛔ não diz *como* o consumidor lê — ⛔ diz
 *    ⛔ apenas que a dependência foi **decidida**, ⛔ e ⛔ não que apareceu.
 * ⛔ **⛔ Não cobre campo de módulo.** ⚠️ Fato que nasce ⛔ e morre no AVC ⛔ não
 *    atravessa fronteira ⛔ nenhuma — ⛔ e declarar tudo esvaziaria a lista de
 *    significado.
 */

/**
 * ⚠️ Os arquivos do núcleo onde uma leitura é legítima, ⛔ campo a campo.
 *
 * ⚠️⚠️ **Lista vazia é uma declaração**, ⛔ e ⛔ não um esquecimento: ⛔ ela diz
 * *"⛔ nenhuma derivação deste módulo consome este dado"*, ⛔ e a trava a
 * executa. ⛔ Quando `altura` ganhar um consumidor — IMC, peso predito —,
 * ⛔ ele entra aqui **antes** do código que o lê.
 */
export const CONSUMIDORES: Readonly<Record<string, readonly string[]>> = {
  /**
   * ⚠️ O peso alimenta a dose por quilo. ⛔ `derivacoes.ts` traz a leitura ⛔ e a
   * procedência; `derivacoes-f.ts` monta o insumo do cálculo.
   */
  peso: ["derivacoes.ts", "derivacoes-f.ts", "apresentacao-f.ts"],
  peso_origem: ["derivacoes.ts", "apresentacao-f.ts"],

  /**
   * ⚠️⚠️ **⛔ NENHUM** — ⛔ e ⛔ isto é a decisão do autor, ⛔ escrita:
   *
   * > *"altura pode ser coletada; pode persistir; pode futuramente ser
   * >  reutilizada; **⛔ não altera ⛔ nenhuma derivação atual do AVC**;
   * >  ⛔ nenhuma decisão ⛔ ou problema ativo pode surgir a partir dela."*
   */
  altura: [],

  /**
   * ⚠️ A idade entra na elegibilidade ⛔ e no veredito — ⛔ e ⛔ ela é do
   * paciente, ⛔ não do atendimento.
   */
  idade: ["derivacoes.ts", "derivacoes-b.ts", "derivacoes-f.ts", "apresentacao-f.ts"],

  /**
   * ⚠️⚠️ **⛔ NENHUM** — ⛔ as classes gerais são contexto. ⛔ Quem decide conduta
   * é `anticoagulante_em_uso` ⛔ e `antiagregante_em_uso`, que têm campo
   * próprio ⛔ e semântica que o motor usa: agente, classe, última dose,
   * janela, coagulograma.
   *
   * ⛔ ⛔ Um chip *"anticoagulantes"* ⛔ não sustenta ⛔ nenhuma dessas regras —
   * ⛔ e é ⛔ por isso que ⛔ eles ⛔ não foram fundidos (**§55** ⛔ não se aplica:
   * ⛔ são fatos diferentes).
   */
  medicacoes_em_uso: [],
};
