#!/usr/bin/env node
/**
 * PROVA · AUDITORIA APPEND-ONLY — correção ESTRUTURAL do incidente `9b3c45e` (autor,
 * 2026-09-13, 12ª rodada).
 *
 * ⚠️ Duas vezes um script abriu `docs/avc/auditoria-vs-spec.md` (1.300+ linhas, reescrito
 * a cada rodada) para escrita ⛔ e o destruiu; na segunda, o arquivo truncado foi para o
 * remoto. ⚠️ O modo de falha estava no desenho: agora cada seção é UM arquivo em
 * `docs/avc/auditoria/`, ⛔ um arquivo de histórico ⛔ é reescrito — só criado — ⛔ e o
 * `auditoria-vs-spec.md` é índice gerado.
 *
 * PROMETE:
 *  · a migração ⛔ perdeu nada: a concatenação dos 24 arquivos migrados é IGUAL, byte a
 *    byte, ao `auditoria-vs-spec.md` de `1e27700` (1.446 linhas);
 *  · todo arquivo da pasta é append-only na história do git: cada versão commitada começa
 *    com a anterior, ⛔ e a cópia de trabalho começa com a última commitada;
 *  · o índice está em dia com a pasta (gerado de novo em memória, comparado);
 *  · ⛔ nenhum script do repositório grava na pasta; o gerador grava ⛔ só o índice;
 *  · o `test:all` roda esta prova.
 * NÃO PROMETE: impedir um editor humano de reescrever um arquivo — ⛔ isso a verificação de
 *   história REPROVA depois do commit, ⛔ não antes; ⛔ nem cobrir `docs/status.md` ⛔ ou
 *   `docs/decisoes.md`, que ⛔ são arquivos de seção.
 * UNIVERSO: `docs/avc/auditoria/`, `docs/avc/auditoria-vs-spec.md`,
 *   `scripts/gerar-indice-auditoria.cjs`, `scripts/*.cjs`, `package.json`.
 * FONTE: `docs/decisoes.md` — decisões da 12ª rodada, Entrega 0.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const pasta = path.join(appDir, "docs", "avc", "auditoria");
const indice = path.join(appDir, "docs", "avc", "auditoria-vs-spec.md");
const gerador = path.join(appDir, "scripts", "gerar-indice-auditoria.cjs");
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const git = (...a) => execFileSync("git", a, { cwd: appDir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** ⚠️ Os 24 arquivos da migração, NA ORDEM do arquivo original. ⛔ Lista fixa de propósito. */
const MIGRADOS = [
  "0-introducao.md", "1-achados.md", "2-requisitos.md", "3-casos-de-aceite.md", "4-errata.md",
  "5-commits-de-12-09.md", "6-nao-verificado.md", "7.00-fechamentos-2026-09-13.md",
  "7.01-ac-01-nihss-nao-testavel.md", "7.02-regras-a-jusante-do-nihss.md", "7.03-ac-03-portao-de-populacao.md",
  "7.04-suite-e-envio.md", "7.05-entrega-1-ac-29-d-pend-13-14.md", "7.06-entrega-2-persistencia.md",
  "7.07-decisoes-rodada-3.md", "7.08-rodada-3.md", "7.09-rodada-4.md", "7.10-limpeza-visual.md",
  "7.11-rodada-6.md", "7.12-rodada-7.md", "7.13-rodada-8.md", "7.14-rodada-9.md", "7.15-rodada-10.md",
  "7.16-rodada-11.md",
];
const ORIGEM_DA_MIGRACAO = "1e27700";

/* ── 1 · a pasta ⛔ a migração ── */
conf("a pasta de seções existe", fs.existsSync(pasta), "⛔ docs/avc/auditoria/ ausente");
const arquivos = fs.existsSync(pasta) ? fs.readdirSync(pasta).filter((f) => f.endsWith(".md")).sort() : [];
conf("todo arquivo segue o nome «<seção>-<assunto>.md»", arquivos.length > 0 && arquivos.every((f) => /^\d+(\.\d{2})?-[a-z0-9-]+\.md$/.test(f)),
  `⛔ ${arquivos.filter((f) => !/^\d+(\.\d{2})?-[a-z0-9-]+\.md$/.test(f)).join(" · ") || "pasta vazia"}`);
conf("os 24 arquivos da migração estão lá", MIGRADOS.every((f) => arquivos.includes(f)), `⛔ faltam: ${MIGRADOS.filter((f) => !arquivos.includes(f)).join(" · ")}`);
if (MIGRADOS.every((f) => arquivos.includes(f))) {
  const original = git("show", `${ORIGEM_DA_MIGRACAO}:docs/avc/auditoria-vs-spec.md`);
  const concatenado = MIGRADOS.map((f) => fs.readFileSync(path.join(pasta, f), "utf8")).join("");
  const linhas = (t) => t.split("\n").length - (t.endsWith("\n") ? 1 : 0);
  conf(`migração sem perda: concatenação == original de ${ORIGEM_DA_MIGRACAO} (byte a byte)`,
    concatenado === original, `⛔ ${linhas(concatenado)} linhas / ${concatenado.length} bytes × ${linhas(original)} linhas / ${original.length} bytes`);
  conf("… ⛔ e as linhas batem (1.446)", linhas(original) === 1446 && linhas(concatenado) === 1446, `⛔ original ${linhas(original)} · migrado ${linhas(concatenado)}`);
}

/* ── 2 · append-only na história ── */
{
  const violacoes = [];
  for (const f of arquivos) {
    const rel = `docs/avc/auditoria/${f}`;
    let commits = [];
    try { commits = git("log", "--format=%H", "--", rel).split("\n").filter(Boolean).reverse(); } catch { /* sem git */ }
    let anterior = "";
    for (const c of commits) {
      let versao = "";
      try { versao = git("show", `${c}:${rel}`); } catch { versao = ""; }
      if (!versao.startsWith(anterior)) violacoes.push(`${f} reescrito em ${c.slice(0, 7)}`);
      anterior = versao;
    }
    const trabalho = fs.readFileSync(path.join(pasta, f), "utf8");
    if (!trabalho.startsWith(anterior)) violacoes.push(`${f} reescrito na cópia de trabalho`);
  }
  conf("⚠️⚠️ todo arquivo de seção é APPEND-ONLY (história ⛔ cópia de trabalho)", violacoes.length === 0, `⛔ ${violacoes.join(" · ")}`);
}

/* ── 3 · o índice gerado ── */
conf("o gerador do índice existe", fs.existsSync(gerador), "⛔ scripts/gerar-indice-auditoria.cjs ausente");
if (fs.existsSync(gerador)) {
  const G = require(gerador);
  conf("o gerador exporta a função pura", typeof G.gerarIndice === "function", "⛔ gerarIndice ausente");
  if (typeof G.gerarIndice === "function") {
    conf("o índice está em dia com a pasta (⛔ edite o índice: rode o gerador)",
      fs.readFileSync(indice, "utf8") === G.gerarIndice(pasta), "⛔ docs/avc/auditoria-vs-spec.md difere do gerado");
  }
  const fonteDoGerador = fs.readFileSync(gerador, "utf8");
  conf("o gerador grava UMA vez, ⛔ e ⛔ na pasta de seções",
    (fonteDoGerador.match(/writeFileSync|appendFileSync|createWriteStream/g) ?? []).length === 1 && /writeFileSync\(INDICE,/.test(fonteDoGerador),
    "⛔ gravação fora do índice");
}

/* ── 4 · ⛔ nenhum outro script grava na pasta ⛔ ou no índice ── */
{
  const dir = path.join(appDir, "scripts");
  const suspeitos = fs.readdirSync(dir)
    .filter((f) => /\.(c?js|mjs|ts|sh|py)$/.test(f) && f !== "gerar-indice-auditoria.cjs" && f !== "prova-auditoria-append-only.cjs")
    .filter((f) => {
      const t = fs.readFileSync(path.join(dir, f), "utf8");
      /** ⚠️ A pasta `auditoria/` da RAIZ (índice de travas, inventário) é outra coisa — ⛔ entra. */
      return /docs\/avc\/auditoria|["']avc["'],\s*["']auditoria|auditoria-vs-spec/.test(t)
        && /writeFileSync|appendFileSync|createWriteStream|open\([^)]*['"]w/.test(t);
    });
  conf("⛔ nenhum script além do gerador lê e grava a auditoria", suspeitos.length === 0, `⛔ ${suspeitos.join(" · ")}`);
}

/* ── 5 · no test:all ── */
{
  const pkg = JSON.parse(fs.readFileSync(path.join(appDir, "package.json"), "utf8"));
  conf("o test:all roda esta prova", (pkg.scripts["test:all"] ?? "").includes("npm run test:auditoria-append-only")
    && /prova-auditoria-append-only\.cjs/.test(pkg.scripts["test:auditoria-append-only"] ?? ""), "⛔ fora do test:all");
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · AUDITORIA APPEND-ONLY — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
