/**
 * CONSUMO DE CONSTANTE — "import não é consumo", virado helper.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * A lição apareceu SETE vezes nesta auditoria e continuava sendo reescrita à
 * mão em cada trava. A última: a conferência de que a SCA consome
 * `CI_COMUM_HEMORRAGIA_INTRACRANIANA` procurava o nome no arquivo inteiro —
 * a mutação trocou o consumo por texto literal e PASSOU, porque a linha do
 * `import` continuava lá.
 *
 * ⚠️ TRÊS COISAS PARECEM CONSUMO E NÃO SÃO:
 *
 *   1. o `import { X } from ...` — declara, não usa;
 *   2. a menção em COMENTÁRIO — narra, não executa (R-15 item 13);
 *   3. o uso em OUTRO nó do mesmo arquivo — a constante chega à tela errada.
 *
 * É o mesmo movimento do `textos-do-no.cjs`: a lição vira HELPER em vez de
 * virar nota que se relê. Toda trava futura chama daqui.
 */

const fs = require("node:fs");
const path = require("node:path");

/** Remove comentários — o que eles dizem não é executado. */
function semComentarios(texto) {
  return texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

/** Remove as declarações de import — declarar não é usar. */
function semImports(texto) {
  return texto
    .replace(/^import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^import\s*\{[\s\S]*?\}\s*from\s*["'][^"']+["'];?\s*$/gm, "");
}

/**
 * O bloco de um nó dentro do arquivo da árvore — do `id: {` até o fecho no
 * mesmo nível de indentação.
 *
 * Devolve string vazia quando o nó não existe, e quem chama trata isso como
 * falha (nó sumido é regressão, não "sem consumo").
 */
function blocoDoNo(fonte, idDoNo) {
  const i = fonte.indexOf(`    ${idDoNo}: {`);
  if (i < 0) return "";
  const j = fonte.indexOf("\n    },", i);
  return fonte.slice(i, j < 0 ? undefined : j);
}

/**
 * A constante é REALMENTE consumida?
 *
 * @param {object} opcoes
 * @param {string} opcoes.arquivo    caminho do arquivo (absoluto ou relativo à raiz)
 * @param {string} opcoes.constante  nome da constante
 * @param {string} [opcoes.no]       id do nó — quando dado, o consumo tem de estar NELE
 * @returns {{ consome: boolean, usos: number, motivo?: string }}
 */
function consomeConstante({ arquivo, constante, no }) {
  if (!fs.existsSync(arquivo)) {
    return { consome: false, usos: 0, motivo: `arquivo não encontrado: ${arquivo}` };
  }
  const bruto = fs.readFileSync(arquivo, "utf8");
  const util = semImports(semComentarios(bruto));

  if (no) {
    const bloco = blocoDoNo(util, no);
    if (!bloco) {
      return { consome: false, usos: 0, motivo: `o nó \`${no}\` não existe (ou mudou de nome) em ${path.basename(arquivo)}` };
    }
    const usos = (bloco.match(new RegExp(`\\b${constante}\\b`, "g")) ?? []).length;
    return {
      consome: usos > 0,
      usos,
      motivo: usos ? undefined : `\`${constante}\` não é usada dentro de \`${no}\` — import e comentário não contam`,
    };
  }

  const usos = (util.match(new RegExp(`\\b${constante}\\b`, "g")) ?? []).length;
  return {
    consome: usos > 0,
    usos,
    motivo: usos ? undefined : `\`${constante}\` aparece no arquivo mas não é USADA — só import ou comentário`,
  };
}

/** Açúcar para o caso mais comum: falha com mensagem pronta. */
function exigeConsumo(falhas, { arquivo, constante, no, porque }) {
  const r = consomeConstante({ arquivo, constante, no });
  if (!r.consome) {
    falhas.push(
      `${r.motivo}.\n` +
      (porque ? `      ⚠️ ${porque}\n` : "") +
      `      Lembrete: import não é consumo, comentário não é consumo, e uso em outro nó não é consumo.`
    );
    return false;
  }
  return true;
}

module.exports = { consomeConstante, exigeConsumo, blocoDoNo, semComentarios, semImports };
