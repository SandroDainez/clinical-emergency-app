/**
 * LER FONTE PARA MEDIR — sem comentário.
 *
 * ⚠️ COMENTÁRIO NÃO RENDERIZA NADA. Uma trava que busca um termo no texto de um
 * arquivo `.ts` e encontra esse termo DENTRO DE UM COMENTÁRIO passa verde sobre
 * um defeito real: o médico não lê comentário.
 *
 * ── POR QUE ISTO É UMA FUNÇÃO E NÃO UM PARÁGRAFO DE DOCUMENTAÇÃO ────────────
 *
 * Porque já foi um parágrafo e não bastou. `valida-paleta.cjs` documentava o
 * defeito desde que foi escrita — «⚠️ COMENTÁRIO NÃO PINTA NADA — e contar hex
 * dentro dele cobra pedágio por comentar» — e em 2026-08-18 a conferência nova
 * do tranexâmico em `valida-politrauma.cjs` caiu exatamente nele: a mutação
 * removeu a linha DA TELA, a trava continuou verde, e o que a satisfazia era o
 * comentário que eu havia escrito para explicar a própria conferência.
 *
 * É o R-92 numa forma nova: documentação que ninguém é obrigado a consultar tem
 * o mesmo efeito de um aviso que não reprova. A correção não é escrever o aviso
 * numa terceira trava — é não haver outro caminho.
 *
 *   const { lerFonte } = require("./lib/fonte.cjs");
 *   const texto = lerFonte(path.join(appDir, "politrauma-decision-tree.ts"));
 *
 * ── QUANDO O COMENTÁRIO É O OBJETO ──────────────────────────────────────────
 *
 * Há travas cujo universo VIVE em comentário — `valida-ausencias-declaradas`
 * deriva as ausências de marcas `DECLARACAO` escritas ali. Essas usam `lerCru`,
 * e o nome existe para que a escolha seja explícita em vez de acidental.
 */
const fs = require("fs");

/** Tira comentários de bloco e de linha. Preserva as posições de linha. */
function semComentario(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p) => p);
}

/** Lê um arquivo-fonte para MEDIR o que a tela mostra: sem comentários. */
function lerFonte(caminho) {
  return semComentario(fs.readFileSync(caminho, "utf8"));
}

/** Lê o arquivo COM comentários — só quando o comentário é o objeto da medida. */
function lerCru(caminho) {
  return fs.readFileSync(caminho, "utf8");
}

module.exports = { lerFonte, lerCru, semComentario };
