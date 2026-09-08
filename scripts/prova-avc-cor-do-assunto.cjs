#!/usr/bin/env node
/**
 * TRAVA DA COR POR ASSUNTO — ⚠️ **uma tabela só**, ⛔ e ⛔ nenhuma cor que
 * signifique *"resolvido"*.
 *
 * PROMETE:
 *   · que `ASSUNTO_DO_BLOCO` seja a **única** casa da cor de bloco do módulo —
 *     ⛔ e que as tabelas locais que viviam em `superficie-a.tsx` ⛔ **não**
 *     tenham voltado;
 *   · que ⛔ **⛔ nenhum bloco seja verde**: `success` é a cor de *"favorável ·
 *     atendido"* nos sete estados, ⛔ e um bloco verde diria que o bloco está
 *     resolvido ⛔ antes de ⛔ alguém responder ⛔ nada;
 *   · que ⛔ todo ícone declarado **exista** no vocabulário `ICONE` — ⛔ nome
 *     inexistente ⛔ não quebra o build: ⛔ ele desenha um **quadrado vazio**;
 *   · que ⛔ toda entrada aponte para um **bloco que existe** — ⛔ entrada órfã
 *     é cor que ⛔ ninguém vê, ⛔ e ⛔ ela envelhece em silêncio;
 *   · que ⛔ toda cor seja um **acento do tema**, ⛔ e ⛔ não hexadecimal novo.
 *
 * NÃO PROMETE: que a cor **chegue à tela**. ⛔ Uma tabela certa ⛔ e um `style`
 *   que ⛔ não aplica é ⛔ exatamente o defeito que já apareceu seis vezes neste
 *   módulo — ⛔ quem mede isso é `e2e/avc-cor-do-assunto.spec.ts`, ⛔ que lê a
 *   **cor renderizada**.
 *
 * UNIVERSO: `components/avc/ui/index.tsx` × `components/avc/superficie-a.tsx` ×
 *   os grupos declarados em `avc/conteudo/`.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA ──────────────────────────────────────
 *
 * ⛔ ⛔ A correção existia ⛔ e ⛔ não alcançava. Em **2026-09-06** o autor disse
 * *"tudo muito cinza ainda, tudo fica parecido ⛔ e confunde"*, ⛔ e a resposta
 * foi `COR_DO_GRUPO` + `ICONE_DO_GRUPO` — ⛔ **dentro de `superficie-a.tsx`**.
 * ⚠️ Em **2026-09-08** ele voltou com o mesmo relato — *"está tudo da mesma
 * cor"* — ⛔ olhando **outra** superfície.
 *
 * ⚠️⚠️ ⛔ Uma regra trancada num arquivo ⛔ não é regra do app: ⛔ é exceção de
 * uma tela. ⛔ Esta trava existe para que ⛔ ela ⛔ não volte a se trancar.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const ler = (...p) => fs.readFileSync(path.join(appDir, ...p), "utf8");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const ui = ler("components", "avc", "ui", "index.tsx");

/* ══ ⚠️ 1 · O VOCABULÁRIO ⛔ E A TABELA, LIDOS DA FONTE ═══════════════════ */

const iconesDeclarados = new Set(
  [...ui.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*): "([a-z-]+)",$/gm)].map((m) => m[1])
);
conf(
  "⚠️ o vocabulário `ICONE` foi lido, ⛔ e ⛔ não presumido",
  iconesDeclarados.size >= 20,
  `⛔ ${iconesDeclarados.size} ícones lidos — a leitura do arquivo quebrou`
);

const corpoDaTabela = (() => {
  const i = ui.indexOf("export const ASSUNTO_DO_BLOCO");
  const f = ui.indexOf("\n};", i);
  return i === -1 ? "" : ui.slice(i, f);
})();
const entradas = [...corpoDaTabela.matchAll(
  /^\s{2}"?([A-Za-z][A-Za-z0-9_-]*)"?:\s*\{\s*icone:\s*"([A-Za-z]+)",\s*cor:\s*"([a-z]+)"\s*\}/gm
)].map((m) => ({ bloco: m[1], icone: m[2], cor: m[3] }));

conf(
  "⚠️⚠️ `ASSUNTO_DO_BLOCO` existe ⛔ e tem entradas",
  entradas.length >= 15,
  `⛔ ${entradas.length} entradas lidas — ⛔ a tabela sumiu ⛔ ou mudou de forma`
);

/* ══ ⚠️⚠️⚠️ 2 · ⛔ NENHUM BLOCO É VERDE ══════════════════════════════════ */

/**
 * ⚠️⚠️ ⛔ ESTA É A ÚNICA REGRA ⛔ **CLÍNICA** DESTE ARQUIVO.
 *
 * ⛔ ⛔ `success` ⛔ não é *"uma cor bonita a mais"*: ⛔ ele é o verde de
 * `favoravel` nos sete estados — *"a fonte diz que este critério está
 * atendido"*. ⚠️ Um bloco verde ⛔ antes de ⛔ qualquer resposta afirmaria
 * ⛔ exatamente o que o módulo inteiro se recusa a afirmar (**E-31**).
 */
{
  const verdes = entradas.filter((e) => e.cor === "success");
  conf(
    "⚠️⚠️⚠️ ⛔ NENHUM bloco usa `success` — ⛔ verde diria *«resolvido»*",
    verdes.length === 0,
    `⛔ ${verdes.map((e) => e.bloco).join(", ")}`
  );
}

/* ══ ⚠️⚠️ 3 · TODA COR É ACENTO DO TEMA ═════════════════════════════════ */

{
  const ACENTOS = new Set(["primary", "info", "critical", "warning", "debt"]);
  const foraDoTema = entradas.filter((e) => !ACENTOS.has(e.cor));
  conf(
    "⚠️⚠️ toda cor é **acento do tema** — ⛔ e ⛔ nenhum hexadecimal novo",
    foraDoTema.length === 0,
    `⛔ ${foraDoTema.map((e) => `${e.bloco}=${e.cor}`).join(", ")}`
  );
}

/* ══ ⚠️⚠️⚠️ 4 · TODO ÍCONE EXISTE ═══════════════════════════════════════ */

/**
 * ⚠️ ⛔ Ícone inexistente ⛔ **⛔ não quebra o build** — ⛔ o Feather desenha um
 * quadrado vazio. ⛔ É falha silenciosa, ⛔ e ⛔ é a razão desta conferência.
 */
{
  const semNome = entradas.filter((e) => !iconesDeclarados.has(e.icone));
  conf(
    "⚠️⚠️ ⛔ todo ícone declarado **existe** em `ICONE`",
    semNome.length === 0,
    `⛔ ${semNome.map((e) => `${e.bloco}→${e.icone}`).join(", ")}`
  );
}

/* ══ ⚠️⚠️ 5 · A CASA ÚNICA — ⛔ AS TABELAS LOCAIS ⛔ NÃO VOLTARAM ════════ */

{
  const a = ler("components", "avc", "superficie-a.tsx");
  conf(
    "⚠️⚠️⚠️ `superficie-a.tsx` ⛔ NÃO declara mais cor ⛔ nem ícone de bloco",
    !/const\s+(COR|ICONE)_DO_GRUPO/.test(a),
    "⛔ a tabela local voltou — ⛔ e com ela volta a divergência entre telas"
  );
  /**
   * ⚠️ ⛔ E ⛔ nenhuma **outra** superfície pode abrir a sua própria: ⛔ a
   * segunda cópia é como a primeira nasceu.
   */
  const comTabelaPropria = fs
    .readdirSync(path.join(appDir, "components", "avc"))
    .filter((f) => f.endsWith(".tsx"))
    .filter((f) => /const\s+(COR|ICONE)_DO_GRUPO/.test(ler("components", "avc", f)));
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUMA superfície declara tabela própria de cor de bloco",
    comTabelaPropria.length === 0,
    `⛔ ${comTabelaPropria.join(", ")}`
  );
}

/* ══ ⚠️⚠️⚠️ 6 · ⛔ NENHUMA ENTRADA ÓRFÃ ═════════════════════════════════ */

/**
 * ⚠️⚠️ ⛔ ENTRADA ÓRFÃ É COR QUE ⛔ NINGUÉM VÊ.
 *
 * ⛔ ⛔ Ela ⛔ não quebra ⛔ nada — ⛔ e é ⛔ por isso que ⛔ ela sobrevive a
 * renomeações ⛔ e vira lixo com aparência de decisão. ⚠️ ⛔ É a mesma classe do
 * `evt_tecnica_stent_retriever_distal` com `exige: []`.
 */
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cor-assunto-"));
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020",
      "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
      "--rootDir", appDir, "--outDir", tmp,
      path.join(appDir, "avc", "conteudo", "paciente.ts"),
      path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
      path.join(appDir, "avc", "conteudo", "superficie-b.ts"),
      path.join(appDir, "avc", "conteudo", "superficie-d.ts"),
    ],
    { cwd: appDir, stdio: "inherit" }
  );
  const emT = (...p) => require(path.join(tmp, ...p));
  const grupos = new Set([
    ...emT("avc", "conteudo", "paciente.js").GRUPOS_P.map((g) => g.id),
    ...emT("avc", "conteudo", "superficie-a.js").GRUPOS_A.map((g) => g.id),
    ...emT("avc", "conteudo", "superficie-b.js").GRUPOS_B.map((g) => g.id),
    ...emT("avc", "conteudo", "superficie-d.js").GRUPOS_D.map((g) => g.id),
    /** ⚠️ A coleta ⛔ não é grupo declarado: ⛔ ela é instância do laboratório. */
    "coleta",
  ]);
  const orfas = entradas.filter((e) => !grupos.has(e.bloco));
  conf(
    "⚠️⚠️⚠️ ⛔ NENHUMA entrada aponta para bloco que ⛔ não existe",
    orfas.length === 0,
    `⛔ ${orfas.map((e) => e.bloco).join(", ")} — ⛔ cor declarada que ⛔ nenhuma tela desenha`
  );
}

/* ══ ⚠️ 7 · O SELO ⛔ NUNCA VAI SOZINHO (E-15) ══════════════════════════ */

/**
 * ⚠️ ⛔ Cor ⛔ e forma sozinhas ⛔ não são leitura. ⛔ O selo desenha ⛔ ao lado do
 * título, ⛔ e ⛔ os dois cabeçalhos do módulo têm de fazer o mesmo.
 */
{
  const campos = ler("components", "avc", "campos-clinicos.tsx");
  conf(
    "⚠️⚠️ os **dois** cabeçalhos leem a mesma tabela",
    /assuntoDoBloco\(assunto\)/.test(ui) && /assuntoDoBloco\(assunto\)/.test(campos),
    "⛔ um dos cabeçalhos parou de consultar `ASSUNTO_DO_BLOCO`"
  );
}

console.log(
  falhas === 0
    ? `\n✅ cor por assunto — ${ok} conferências, ${entradas.length} blocos declarados\n`
    : `\n❌ ${falhas} falha(s) · ${ok} ok\n`
);
process.exit(falhas === 0 ? 0 : 1);
