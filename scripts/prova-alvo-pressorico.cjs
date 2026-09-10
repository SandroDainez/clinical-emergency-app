#!/usr/bin/env node
/**
 * TRAVA DO ALVO PRESSÓRICO APLICÁVEL — ⚠️ **o alvo da FASE**, ⛔ e ⛔ não o mais
 * famoso.
 *
 * PROMETE: que ⛔ sem trombólise registrada ⛔ o alvo seja ⛔ o de **antes da
 *   IVT**; que ⛔ com trombólise ⛔ dentro das 24 h ⛔ o alvo seja ⛔ o
 *   **pós-IVT**; que ⛔ passadas as 24 h ⛔ a lista fique ⛔ **⛔ vazia** — ⛔ a
 *   fonte ⛔ não publica alvo ⛔ para essa fase, ⛔ e ⛔ inventar seria E-31; que
 *   ⛔ mais de um aplicável ⛔ apareça ⛔ **⛔ inteiro**, ⛔ sem precedência
 *   inventada; ⛔ e que ⛔ os alvos ⛔ **⛔ fora de alcance** ⛔ estejam
 *   ⛔ **⛔ declarados ⛔ com motivo**.
 *
 * NÃO PROMETE: que os alvos de trombectomia funcionem — ⛔ eles ⛔ **⛔ não são
 *   deriváveis** ⛔ hoje (**D-135**), ⛔ e ⛔ esta trava ⛔ conferе ⛔ que ⛔ eles
 *   ⛔ **⛔ continuam fora**, ⛔ com o motivo escrito.
 *
 * UNIVERSO: `avc/nucleo/alvo-pressorico.ts` ⛔ e `avc/conteudo/antihipertensivos.ts`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ELA FECHA ──────────────────────────────────────
 *
 * ⛔ ⛔ O alvo « principal » era ⛔ **⛔ fixo**: *"Abaixo de 185/110 — antes de
 * iniciar a trombólise"*. ⚠️ ⛔ O médico que ⛔ **⛔ já trombolisou** ⛔ via, como
 * principal, ⛔ um número ⛔ **⛔ de antes** — ⛔ e ⛔ tinha de expandir ⛔ seis
 * outros ⛔ para achar ⛔ o dele.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-alvo-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "alvo-pressorico.ts"),
  path.join(appDir, "avc", "conteudo", "antihipertensivos.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const A = require(path.join(tmp, "avc", "nucleo", "alvo-pressorico.js"));
const C = require(path.join(tmp, "avc", "conteudo", "antihipertensivos.js"));

const T0 = 1_000_000_000;
const novo = () => {
  const rel = R.relogioControlado(T0);
  return { rel, est: E.abrirAtendimento(rel) };
};
/** ⚠️ Registra a trombólise como a tela registra: instância + estado + início. */
function comTrombolise(est, rel, { inicioMs }) {
  let e = E.registrarFato(est, {
    campo: "trombolise_iv_nova_medida", valor: "trombolise_iv_1",
    instancia: "trombolise_iv_1", tipo: "medida",
  }, rel);
  e = E.registrarFato(e, {
    /**
     * ⚠️⚠️ ⛔ O VOCABULÁRIO É ⛔ **⛔ « Realizada »**, ⛔ com maiúscula — ⛔ é o
     * rótulo que a tela grava (`ESTADO_DA_ACAO`). ⛔ Escrevi « realizada »
     * ⛔ minúsculo ⛔ na primeira versão ⛔ e ⛔ **⛔ os quatro cenários viraram
     * « sem trombólise »**: ⛔ a trava deu ⛔ **⛔ 14/14 ⛔ medindo ⛔ um caso só**.
     */
    campo: "ivt_estado", valor: "Realizada", instancia: "trombolise_iv_1", tipo: "medida",
  }, rel);
  if (inicioMs !== undefined) {
    e = E.registrarFato(e, {
      campo: "ivt_inicio", valor: inicioMs, instancia: "trombolise_iv_1", tipo: "medida",
    }, rel);
  }
  return e;
}

/* ══ ⚠️⚠️⚠️ 1 · SEM TROMBÓLISE → O ALVO É O DE ANTES ════════════════════ */

{
  const { est } = novo();
  const ids = A.alvosPressoricosAplicaveis(est, T0);
  confere("⚠️ sem trombólise registrada, o alvo é o de ANTES da IVT",
    ids.length === 1 && ids[0] === "antes_ivt",
    `⛔ devolveu [${ids}] — a pergunta que o médico está fazendo é a de antes`);
}

/* ══ ⚠️⚠️⚠️ 2 · O CONTEÚDO NÃO ELEGE MAIS UM PRINCIPAL FIXO ════════════ */

{
  const fonte = lerFonte(path.join(appDir, "avc", "conteudo", "antihipertensivos.ts"));
  confere("⚠️⚠️ ⛔ `principal: true` ⛔ **⛔ não decide mais** qual alvo aparece",
    !/ALVOS_PRESSORICOS[\s\S]*principal:\s*true/.test(fonte)
      || !/filter\(\(a\) => a\.principal\)/.test(lerFonte(path.join(appDir, "components", "avc", "conduta-da-fonte.tsx"))),
    "⛔ a tela voltou a eleger um alvo fixo — e o alvo depende da FASE");
}

/* ══ ⚠️⚠️⚠️ 3 · OS FORA DE ALCANCE ESTÃO DECLARADOS COM MOTIVO ═════════ */

{
  const fora = Object.keys(A.FORA_DE_ALCANCE);
  for (const id of ["antes_evt", "durante_evt", "harm_pos_recanalizacao"]) {
    confere(`⚠️⚠️ ⛔ « ${id} » ⛔ está declarado FORA DE ALCANCE, ⛔ com motivo`,
      fora.includes(id) && String(A.FORA_DE_ALCANCE[id]).length > 20,
      "⛔ alvo que depende de trombectomia feita/recanalização ⛔ NÃO é derivável: " +
      "elegível ⛔ não é feito, e presumir seria conduta nascendo na tela (E-31)");
  }
  const todos = C.ALVOS_PRESSORICOS.map((a) => a.id);
  confere("⚠️ e todo id declarado fora de alcance EXISTE no conteúdo",
    fora.every((id) => todos.includes(id)),
    `⛔ ids fantasmas em FORA_DE_ALCANCE: ${fora.filter((id) => !todos.includes(id))}`);
}

/* ══ ⚠️⚠️⚠️ 3b · OS CENÁRIOS DE TROMBÓLISE ⛔ SÃO MESMO TROMBÓLISE ══════ */

/**
 * ⚠️⚠️⚠️ ⛔ SEM ISTO, ⛔ A CONFERÊNCIA 4 ⛔ PASSARIA ⛔ **⛔ VAZIA**.
 *
 * ⛔ ⛔ Se o helper montasse ⛔ um estado ⛔ que o motor ⛔ **⛔ não lê** ⛔ como
 * trombólise, ⛔ todos os cenários ⛔ virariam ⛔ « sem trombólise » ⛔ — ⛔ e a
 * trava ⛔ diria ⛔ verde ⛔ sobre ⛔ um universo ⛔ de ⛔ um caso só.
 */
{
  const { rel, est } = novo();
  const dentro = A.alvosPressoricosAplicaveis(
    comTrombolise(est, rel, { inicioMs: T0 - 2 * 3_600_000 }), T0);
  confere("⚠️⚠️ ⛔ trombólise há 2 h ⛔ **⛔ muda** o alvo para o pós-IVT",
    dentro.includes("apos_ivt") && !dentro.includes("antes_ivt"),
    `⛔ devolveu [${dentro}] — quem já trombolisou ⛔ não pode ver o alvo de ANTES`);

  const semHora = A.alvosPressoricosAplicaveis(comTrombolise(est, rel, {}), T0);
  confere("⚠️ trombólise sem horário ⛔ também sai do alvo de antes",
    semHora.includes("apos_ivt"),
    `⛔ devolveu [${semHora}] — a trombólise aconteceu, ⛔ e é isso que se sabe`);

  const fora = A.alvosPressoricosAplicaveis(
    comTrombolise(est, rel, { inicioMs: T0 - 30 * 3_600_000 }), T0);
  confere("⚠️⚠️ passadas as 24 h, ⛔ a lista fica ⛔ **⛔ vazia**",
    fora.length === 0,
    `⛔ devolveu [${fora}] — a fonte ⛔ não publica alvo de fase além de 24 h, e inventar é E-31`);
}

/* ══ ⚠️⚠️⚠️ 4 · NENHUM ALVO FORA DE ALCANCE É DEVOLVIDO ════════════════ */

{
  const { rel, est } = novo();
  const cenarios = [
    ["sem trombólise", est],
    ["trombólise sem horário", comTrombolise(est, rel, {})],
    ["trombólise há 2 h", comTrombolise(est, rel, { inicioMs: T0 - 2 * 3_600_000 })],
    ["trombólise há 30 h", comTrombolise(est, rel, { inicioMs: T0 - 30 * 3_600_000 })],
  ];
  for (const [nome, e] of cenarios) {
    const ids = A.alvosPressoricosAplicaveis(e, T0);
    confere(`⚠️ « ${nome} » ⛔ não devolve alvo fora de alcance`,
      ids.every((id) => !(id in A.FORA_DE_ALCANCE)),
      `⛔ devolveu [${ids}] — inclui alvo que o estado ⛔ não sabe sustentar`);
    confere(`⚠️ « ${nome} » ⛔ só devolve ids que existem no conteúdo`,
      ids.every((id) => C.ALVOS_PRESSORICOS.some((a) => a.id === id)),
      `⛔ id inexistente em [${ids}]`);
  }
}

if (falhas.length > 0) {
  console.log(`\n❌ ALVO PRESSÓRICO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ ALVO PRESSÓRICO — ${ok}/${ok} conferências · o alvo é o da fase · o não-derivável fica declarado\n`);
