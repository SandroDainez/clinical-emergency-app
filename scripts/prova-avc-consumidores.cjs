#!/usr/bin/env node
/**
 * TRAVA DOS CONSUMIDORES — ⚠️ **dependência declarada, ⛔ ou ⛔ não existe**.
 *
 * PROMETE:
 *   · que **⛔ nenhum campo de escopo `global`** seja lido por uma derivação do
 *     núcleo ⛔ sem estar declarado em `CONSUMIDORES`;
 *   · que **altura ⛔ não influencie ⛔ nada** no AVC — ⛔ nem derivação, ⛔ nem
 *     problema ativo, ⛔ nem pendência;
 *   · que **valor visual ⛔ não vire fato**: campo intocado devolve `undefined`,
 *     ⛔ e ⛔ o cálculo por peso ⛔ não consome fantasma.
 *
 * NÃO PROMETE: que a leitura seja clinicamente correta — ⛔ isso é das provas
 *   de superfície. ⛔ Aqui se mede **quem lê o quê**, ⛔ e ⛔ não como.
 *
 * UNIVERSO: `avc/conteudo/consumidores.ts` × `avc/nucleo/*.ts`.
 *
 * ── ⚠️⚠️ A REGRA, ⛔ E ⛔ POR QUE ⛔ NÃO É *"global ⛔ não se lê"* ────────────
 *
 * ⛔ Minha primeira proposta era travar *"⛔ nenhuma derivação do AVC lê campo
 * global"*. ⚠️ O autor apontou o furo em 2026-09-07: ⛔ isso proibiria **o peso
 * de alimentar a dose do trombolítico**, ⛔ que é ⛔ exatamente para o que ⛔ ele
 * existe.
 *
 * ⚠️ A regra dele: *"um campo só pode influenciar uma derivação clínica se essa
 * dependência estiver explicitamente declarada ⛔ e testada"*. ⛔ Escopo diz **de
 * quem é o dado**; ⛔ a lista diz **quem pode lê-lo**.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "consumidores-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "conteudo", "consumidores.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const K = require(path.join(tmp, "avc", "conteudo", "campos.js"));
const CONS = require(path.join(tmp, "avc", "conteudo", "consumidores.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const F = require(path.join(tmp, "avc", "nucleo", "derivacoes-f.js"));

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const campos = K.todosOsCampos();
const globais = campos.filter((c) => c.escopo === "global");

/* ══ ⚠️ O UNIVERSO EXISTE ══════════════════════════════════════════════ */
conf(
  "⚠️ há campos de escopo global a conferir",
  globais.length >= 4,
  `⛔ ${globais.length} campo(s) global(is) — trava sobre lista vazia fica verde ⛔ sem medir ⛔ nada`
);

conf(
  "⚠️ todo campo global tem consumidores DECLARADOS (ainda que ⛔ nenhum)",
  globais.every((c) => Array.isArray(CONS.CONSUMIDORES[c.id])),
  `⛔ ${globais.filter((c) => !Array.isArray(CONS.CONSUMIDORES[c.id])).map((c) => c.id).join(" · ")} — ⛔ lista ausente ⛔ não é "⛔ nenhum": é decisão ⛔ não tomada`
);

/* ══ ⚠️⚠️ QUEM LÊ, LEU PORQUE FOI DECLARADO ═══════════════════════════ */
{
  const dirNucleo = path.join(appDir, "avc", "nucleo");
  const arquivos = fs.readdirSync(dirNucleo).filter((f) => f.endsWith(".ts"));

  const violacoes = [];
  for (const c of globais) {
    const permitidos = CONS.CONSUMIDORES[c.id] ?? [];
    for (const arq of arquivos) {
      /**
       * ⚠️ **⛔ SEM COMENTÁRIO** — ⛔ e ⛔ isso ⛔ não é detalhe: metade dos
       * arquivos deste núcleo cita o nome de um campo em prosa explicando por
       * que ⛔ **não** o lê. ⛔ Contar comentário como leitura reprovaria
       * ⛔ exatamente quem documentou a decisão certa.
       */
      const fonte = lerFonte(path.join(dirNucleo, arq));
      /** ⚠️ A leitura de um fato é sempre por `"<id>"` entre aspas. */
      if (!fonte.includes(`"${c.id}"`)) continue;
      if (permitidos.includes(arq)) continue;
      violacoes.push(`${c.id} lido em ${arq}`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM campo global é lido fora do que foi DECLARADO",
    violacoes.length === 0,
    `⛔ ${violacoes.join(" · ")} — declare o consumidor **antes** do código que lê`
  );
}

/* ══ ⚠️⚠️ ALTURA ⛔ NÃO INFLUENCIA ⛔ NADA ═════════════════════════════ */
{
  const dirNucleo = path.join(appDir, "avc", "nucleo");
  const citam = fs.readdirSync(dirNucleo)
    .filter((f) => f.endsWith(".ts"))
    .filter((f) => lerFonte(path.join(dirNucleo, f)).includes('"altura"'));
  conf(
    "⚠️⚠️ ⛔ NENHUMA derivação do AVC lê `altura`",
    CONS.CONSUMIDORES.altura.length === 0 && citam.length === 0,
    `⛔ ${citam.join(" · ")} — *"⛔ não altera ⛔ nenhuma derivação atual do AVC"* (autor, 2026-09-07)`
  );

  const campoAltura = campos.find((c) => c.id === "altura");
  conf(
    "⚠️ altura existe, é global, ⛔ e ⛔ não bloqueia terapia",
    campoAltura !== undefined
      && campoAltura.escopo === "global"
      && campoAltura.bloqueiaTerapia === false,
    `⛔ ${JSON.stringify(campoAltura && { escopo: campoAltura.escopo, bloqueia: campoAltura.bloqueiaTerapia })}`
  );
}

/* ══ ⚠️⚠️ O VALOR FANTASMA ⛔ NÃO É FATO ══════════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O QUE ISTO IMPEDE ────────────────────────────────────────────
   *
   * ⛔ A barra ⛔ e o `NumericStepper` precisam de **um número para desenhar** o
   * polegar. ⚠️ Esse número ⛔ **⛔ não é uma medida** — ⛔ e se ⛔ ele virasse
   * fato, a dose do trombolítico sairia calculada sobre um peso que ⛔ ninguém
   * mediu (§0.2).
   *
   * ⚠️ ⛔ A garantia mora em `numero()`: ⛔ sem **fato** na trilha, ⛔ não há
   * valor. ⛔ A tela ⛔ não tem como contornar isso — ⛔ ela ⛔ não escreve
   * estado, ⛔ ela chama `registrarFato`.
   */
  const relogio = R.relogioControlado(1_000_000);
  const vazio = E.abrirAtendimento(relogio);

  for (const campo of ["peso", "altura"]) {
    conf(
      `⚠️⚠️ \`${campo}\` intocado devolve **undefined**, ⛔ e ⛔ não o piso da faixa`,
      E.valorAtual(vazio, campo) === undefined,
      `⛔ devolveu ${JSON.stringify(E.valorAtual(vazio, campo))} — valor visual ⛔ não cria fato`
    );
  }

  /**
   * ⚠️⚠️ ⛔ A PRIMEIRA VERSÃO DESTA CONFERÊNCIA PASSAVA POR **VACUIDADE**.
   *
   * ⛔ Ela chamava `F.insumoDoCalculo`, que **⛔ não existe** — ⛔ e a guarda
   * `=== undefined ||` deixava a expressão verdadeira ⛔ sem medir ⛔ nada.
   * ⚠️ A função real é `valorDoInsumo`, ⛔ e ⛔ ela devolve `"satisfaz"` ⛔ só
   * quando há **fato** com número positivo.
   */
  conf(
    "⚠️ a prova aponta para a função que EXISTE",
    typeof F.valorDoInsumo === "function",
    "⛔ asserção sobre função inexistente é verde ⛔ sem medida — R-1"
  );
  conf(
    "⚠️⚠️ o cálculo do trombolítico ⛔ NÃO consome peso fantasma",
    F.valorDoInsumo(vazio, "peso") === undefined,
    `⛔ devolveu ${JSON.stringify(F.valorDoInsumo(vazio, "peso"))} — dose por quilo sobre peso ⛔ não medido é a semente de uma dose errada três telas adiante`
  );

  /** ⚠️ ⛔ E o gesto **explícito** cria o fato — ⛔ senão a trava seria vacuidade. */
  const comPeso = E.registrarFato(vazio, { campo: "peso", valor: 82 }, relogio);
  conf(
    "⚠️ ⛔ e a interação CRIA o fato — a trava ⛔ não cega o caminho legítimo",
    E.valorAtual(comPeso, "peso")?.valor === 82
    && F.valorDoInsumo(comPeso, "peso") === "satisfaz",
    `⛔ ${JSON.stringify(E.valorAtual(comPeso, "peso"))} · insumo=${JSON.stringify(F.valorDoInsumo(comPeso, "peso"))}`
  );
}

if (falhas > 0) {
  console.log(`\n❌ CONSUMIDORES — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ CONSUMIDORES — ${ok}/${ok} conferências · ${globais.length} campo(s) global(is)`);
