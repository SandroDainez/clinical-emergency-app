/**
 * TODO o texto de um nó — derivado do objeto, nunca listado à mão.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-16) ─────────────────────────────────────
 *
 * Seis vezes nesta sessão uma sonda leu um SUBCONJUNTO dos campos e concluiu
 * errado. A pior: medi `dx_distributivo_outro` do Choque somando
 * `title + summary + actions + evidence`, obtive 87 caracteres e o declarei um
 * "beco sem conteúdo". O nó guarda a conduta em `exitCriteria` e o
 * encaminhamento em `targets` — campos que a sonda não somava —, incluindo a
 * lista de causas e a hidrocortisona na suspeita de insuficiência adrenal.
 *
 * ⚠️ E O ERRO NÃO PAROU NO RELATÓRIO: virou uma decisão do autor, que voltou
 * como ordem de aplicar. Instrumento que erra no LEVANTAMENTO propaga o erro
 * para quem decide, e a decisão chega carimbada como aprovada.
 *
 * ── POR QUE DERIVAR, E NÃO LISTAR ───────────────────────────────────────────
 *
 * Listar campos é o D-15 aplicado a campos em vez de a arquivos: a lista fica
 * incompleta em silêncio, e o dia em que o tipo do nó ganhar um campo novo,
 * toda sonda escrita antes fica cega para ele — sem aviso, porque a ausência
 * tem a mesma aparência do vazio.
 *
 * Aqui o universo vem do OBJETO: percorre-se tudo o que existe e recolhe-se
 * toda string. Campo novo entra sozinho.
 *
 * ── O QUE É EXCLUÍDO, E POR QUÊ ─────────────────────────────────────────────
 *
 * Só as chaves que são IDENTIFICADOR ou LIGAÇÃO — nunca texto de tela. A lista
 * é curta de propósito e está declarada: qualquer coisa fora dela é tratada
 * como texto, porque o custo de incluir um identificador numa busca é um falso
 * positivo visível, e o de excluir uma conduta é um falso negativo invisível.
 */

/** Chaves que nomeiam ou ligam, e nunca aparecem como frase para o médico. */
const CHAVES_TECNICAS = new Set([
  "id",
  "type",
  "kind",
  "next",
  "value",
  "moduleId",
  "protocolId",
  "disposition",
  "testID",
  "icon",
  "customKeyboard",
  "unit",
]);

/**
 * Recolhe recursivamente todo texto de um nó (ou de qualquer subárvore dele).
 *
 * @param {unknown} alvo  nó da árvore, ou um pedaço dele
 * @param {{ incluirTecnicos?: boolean }} [opcoes]
 * @returns {string[]} strings na ordem em que aparecem
 */
function textosDoNo(alvo, opcoes = {}) {
  const { incluirTecnicos = false } = opcoes;
  const fora = [];

  const anda = (valor, chave) => {
    if (valor == null) return;
    if (typeof valor === "string") {
      if (!incluirTecnicos && chave && CHAVES_TECNICAS.has(chave)) return;
      const limpo = valor.trim();
      if (limpo) fora.push(limpo);
      return;
    }
    if (Array.isArray(valor)) {
      for (const item of valor) anda(item, chave);
      return;
    }
    if (typeof valor === "object") {
      for (const [k, v] of Object.entries(valor)) {
        // Função (o `escolher` do next dinâmico) não tem texto.
        if (typeof v === "function") continue;
        anda(v, k);
      }
    }
  };

  anda(alvo, undefined);
  return fora;
}

/** O mesmo, já concatenado — para quem só quer testar um padrão. */
function textoDoNo(alvo, opcoes) {
  return textosDoNo(alvo, opcoes).join("\n");
}

/**
 * Quais campos de texto este nó tem, na prática. Serve para conferir se uma
 * sonda antiga está lendo tudo — e foi assim que as seis cegueiras apareceram.
 */
function camposDeTextoDoNo(no) {
  const campos = new Set();
  for (const [k, v] of Object.entries(no ?? {})) {
    if (typeof v === "function") continue;
    if (CHAVES_TECNICAS.has(k)) continue;
    if (textosDoNo(v, {}).length) campos.add(k);
  }
  return [...campos];
}

module.exports = { textosDoNo, textoDoNo, camposDeTextoDoNo, CHAVES_TECNICAS };
