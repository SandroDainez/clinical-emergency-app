#!/usr/bin/env node
/**
 * GERADOR DO ÍNDICE DA AUDITORIA DO AVC — 12ª rodada (autor, 2026-09-13).
 *
 * ⚠️ A auditoria mora em `docs/avc/auditoria/`, UMA seção por arquivo, append-only: um
 * arquivo de seção ⛔ é reescrito, só criado. ⚠️ Este script é o ÚNICO que grava algo
 * ligado a ela, ⛔ e grava só o ÍNDICE (`docs/avc/auditoria-vs-spec.md`), que é derivado:
 * reescrevê-lo ⛔ perde nada, porque ele é refeito da pasta.
 *
 * PROMETE: gerar o índice só a partir dos arquivos da pasta (título = primeiro cabeçalho de
 *   cada arquivo), em ordem de seção, com o total de linhas.
 * NÃO PROMETE: validar o conteúdo das seções; ⛔ nem ler outro lugar.
 * UNIVERSO: `docs/avc/auditoria/*.md` → `docs/avc/auditoria-vs-spec.md`.
 * Prova: `scripts/prova-auditoria-append-only.cjs` (índice em dia, gravação única).
 * Uso: `node scripts/gerar-indice-auditoria.cjs`.
 */
const fs = require("node:fs");
const path = require("node:path");

const PASTA = path.resolve(__dirname, "..", "docs", "avc", "auditoria");
const INDICE = path.resolve(__dirname, "..", "docs", "avc", "auditoria-vs-spec.md");

/** "7.16-rodada-11.md" → [7, 16]; "3-casos.md" → [3, -1]. */
function chave(nome) {
  const m = nome.match(/^(\d+)(?:\.(\d+))?-/);
  return m ? [Number(m[1]), m[2] === undefined ? -1 : Number(m[2])] : [Infinity, Infinity];
}

function gerarIndice(pasta = PASTA) {
  const arquivos = fs.readdirSync(pasta).filter((f) => f.endsWith(".md"))
    .sort((a, b) => chave(a)[0] - chave(b)[0] || chave(a)[1] - chave(b)[1] || a.localeCompare(b));
  let total = 0;
  const linhas = arquivos.map((f) => {
    const texto = fs.readFileSync(path.join(pasta, f), "utf8");
    total += texto.split("\n").length - (texto.endsWith("\n") ? 1 : 0);
    const titulo = (texto.split("\n").find((l) => /^#{1,3} /.test(l)) ?? f).replace(/^#{1,3} /, "");
    const recuo = chave(f)[1] >= 1 ? "  " : "";
    return `${recuo}- [${titulo}](auditoria/${f})`;
  });
  return [
    "# Auditoria do AVC existente contra a especificação (PDF v1.1) · índice",
    "",
    "> ⚠️ **Arquivo gerado** por `scripts/gerar-indice-auditoria.cjs` — ⛔ não edite à mão.",
    "> Cada seção é **um arquivo** em `docs/avc/auditoria/`, **append-only**: uma rodada nova CRIA um arquivo;",
    "> ⛔ nenhum script reescreve arquivo de seção (`scripts/prova-auditoria-append-only.cjs`, no `test:all`).",
    "> Referências antigas a \"`auditoria-vs-spec.md` §7.x\" apontam para o arquivo `7.xx-*.md` correspondente.",
    "",
    `**Seções:** ${arquivos.length} · **linhas:** ${total}`,
    "",
    ...linhas,
    "",
  ].join("\n");
}

module.exports = { gerarIndice };

if (require.main === module) {
  fs.writeFileSync(INDICE, gerarIndice(PASTA));
  console.log(`✅ índice da auditoria gerado: ${path.relative(process.cwd(), INDICE)}`);
}
