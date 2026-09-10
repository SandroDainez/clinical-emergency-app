#!/usr/bin/env node
/**
 * TRAVA DO HISTÓRICO — ⚠️ **janela de auditoria**, ⛔ e ⛔ **⛔ não** segunda
 * fonte da verdade — D-134.
 *
 * PROMETE: que o histórico ⛔ agrupe ⛔ **⛔ o que já está na trilha** — ⛔ uma
 *   linha por instância, ⛔ na ordem em que foram medidas, ⛔ com a última
 *   marcada como atual; que ⛔ **⛔ correção**, ⛔ na mesma instância, ⛔ **⛔ não**
 *   crie linha nova ⛔ e ⛔ **⛔ preserve o valor originalmente registrado**;
 *   que ⛔ `0` ⛔ apareça ⛔ como ⛔ **⛔ dado**, ⛔ e ⛔ não como ausência; que
 *   ⛔ **⛔ nenhum id interno** de instância ⛔ saia daqui; ⛔ e — ⛔ a mais
 *   importante — ⛔ que ⛔ **⛔ nenhum módulo de derivação clínica ⛔ o importe**.
 *
 * NÃO PROMETE: nada sobre ⛔ **⛔ como a tela desenha**. ⛔ Isso é
 *   `e2e/avc-historico-de-afericoes.spec.ts`, ⛔ com gesto real.
 *
 * UNIVERSO: `avc/nucleo/instancia.ts` ⛔ e ⛔ os módulos de derivação de `avc/`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ELA IMPEDE ─────────────────────────────────────────────
 *
 * ⛔ Decisão do autor, 2026-09-10: *"histórico visível ⛔ não pode virar
 * «segunda fonte da verdade». ⛔ Ele é uma ⛔ **janela de auditoria** sobre os
 * fatos ⛔ já existentes. ⛔ O motor clínico ⛔ continua derivando ⛔ exatamente
 * como deriva hoje. ⛔ Isso evita ⛔ criar uma arquitetura paralela ⛔ só para
 * mostrar o passado."*
 *
 * ⚠️ ⛔ O dia em que ⛔ uma derivação ⛔ ler ⛔ `historicoDeAfericoes` ⛔ para
 * decidir conduta, ⛔ o app passa a ter ⛔ **⛔ dois caminhos** ⛔ até o mesmo
 * fato — ⛔ e ⛔ os dois ⛔ vão divergir.
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

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-hist-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "instancia.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tempDir, "relogio.js"));
const E = require(path.join(tempDir, "estado.js"));
const I = require(path.join(tempDir, "instancia.js"));

const medida = (campo, valor, instancia) => ({ campo, valor, instancia, tipo: "medida" });

/* ══ ⚠️⚠️⚠️ 1 · DUAS MEDIDAS, DUAS LINHAS, A ÚLTIMA É A ATUAL ════════════ */

{
  const rel = R.relogioControlado(1_000_000);
  let e = E.abrirAtendimento(rel);
  e = E.registrarFato(e, medida("pas", 183, "pa_1"), rel);
  e = E.registrarFato(e, medida("pad", 111, "pa_1"), rel);
  rel.avancar(900_000);
  e = E.registrarFato(e, medida("pas", 168, "pa_2"), rel);
  e = E.registrarFato(e, medida("pad", 92, "pa_2"), rel);

  const h = I.historicoDeAfericoes(e, "pa");
  confere("⚠️ duas aferições ⛔ = ⛔ duas linhas", h.length === 2, `⛔ ${h.length} linha(s)`);
  confere("⚠️ a ÚLTIMA é a atual", h[1].atual === true && h[0].atual === false,
    "⛔ sem isso, o médico ⛔ não sabe qual número está valendo");
  confere("⚠️⚠️ ⛔ a aferição que motivou a conduta ⛔ continua legível",
    h[0].valores.find((v) => v.campo === "pas").valor === 183
    && h[0].valores.find((v) => v.campo === "pad").valor === 111,
    "⛔ o 183/111 sumiu — e é ele que explica por que se tratou");
  confere("⚠️ cada linha traz o instante de REGISTRO",
    typeof h[0].registradaEm === "number" && h[0].registradaEm < h[1].registradaEm,
    "⛔ sem hora, duas medidas ⛔ não têm ordem no tempo para quem lê");
}

/* ══ ⚠️⚠️⚠️ 2 · CORREÇÃO ⛔ NÃO É MEDIDA NOVA ═══════════════════════════ */

{
  const rel = R.relogioControlado(2_000_000);
  let e = E.abrirAtendimento(rel);
  e = E.registrarFato(e, medida("glicemia", 38, "glicemia_1"), rel);
  rel.avancar(600_000);
  e = E.registrarFato(e, medida("glicemia", 96, "glicemia_2"), rel);
  rel.avancar(1000);
  const alvo = e.fatos[e.fatos.length - 1];
  e = E.corrigirFato(e, {
    campo: "glicemia", valor: 69, instancia: "glicemia_2", corrigeFatoId: alvo.id,
  }, rel);

  const h = I.historicoDeAfericoes(e, "glicemia");
  confere("⚠️⚠️ corrigir ⛔ **⛔ não** cria uma terceira linha", h.length === 2,
    `⛔ ${h.length} linhas — o caso passa a ter uma medida que o paciente ⛔ nunca teve`);
  const atual = h[1].valores.find((v) => v.campo === "glicemia");
  confere("⚠️ a linha atual mostra o valor CORRIGIDO", atual.valor === 69,
    "⛔ a correção ⛔ não chegou ao histórico");
  confere("⚠️⚠️⚠️ ⛔ e ⛔ **⛔ o valor originalmente registrado ⛔ continua visível**",
    atual.valorOriginal === 96,
    "⛔ mostrar só o corrigido ⛔ esconde que houve erro — §3.4, e a trilha é append-only");
  confere("⚠️ a linha se declara corrigida", h[1].corrigida === true,
    "⛔ o leitor ⛔ não sabe distinguir uma medida limpa de uma retificada");
  confere("⚠️ a linha ⛔ NÃO corrigida ⛔ não inventa valor original",
    h[0].valores[0].valorOriginal === undefined,
    "⛔ « corrigido de » ⛔ apareceria ⛔ onde ⛔ ninguém corrigiu nada");
}

/* ══ ⚠️⚠️⚠️ 3 · ZERO É DADO ═════════════════════════════════════════════ */

{
  const rel = R.relogioControlado(3_000_000);
  let e = E.abrirAtendimento(rel);
  e = E.registrarFato(e, medida("nihss", 12, "nihss_1"), rel);
  rel.avancar(1000);
  e = E.registrarFato(e, medida("nihss", 0, "nihss_2"), rel);

  const h = I.historicoDeAfericoes(e, "nihss");
  confere("⚠️⚠️ ⛔ **zero** aparece como ⛔ **⛔ dado** no histórico",
    h.length === 2 && h[1].valores[0].valor === 0,
    "⛔ zero virou ausência — e ⛔ ausência ⛔ e ⛔ medida ⛔ são coisas diferentes (E-23)");
}

/* ══ ⚠️⚠️⚠️ 4 · ⛔ NENHUM ID INTERNO SAI DAQUI ══════════════════════════ */

{
  const rel = R.relogioControlado(4_000_000);
  let e = E.abrirAtendimento(rel);
  e = E.registrarFato(e, medida("pas", 150, "pa_1"), rel);
  const h = I.historicoDeAfericoes(e, "pa");
  const bruto = JSON.stringify(h);
  confere("⚠️ ⛔ o nome da instância (`pa_1`) ⛔ **⛔ não** vaza para quem lê",
    !bruto.includes("pa_1"),
    "⛔ `pa_1` é nome de máquina — o que o médico lê é ORDEM: 1ª, 2ª, atual");
  confere("⚠️ e a ordem é dita em número", h[0].ordem === 1, "⛔ sem ordem, ⛔ não há como nomear a linha");
}

/* ══ ⚠️⚠️⚠️ 5 · ⛔ NENHUMA DERIVAÇÃO CLÍNICA O IMPORTA ══════════════════ */

{
  const dir = path.join(appDir, "avc", "nucleo");
  const derivacoes = fs.readdirSync(dir).filter((f) => /^(derivacoes|portao|ameacas|veredito)/.test(f));
  const infratores = derivacoes.filter((f) => /historicoDeAfericoes/.test(lerFonte(path.join(dir, f))));
  confere(
    "⚠️⚠️⚠️ ⛔ **⛔ nenhum módulo de derivação ⛔ lê o histórico**",
    infratores.length === 0,
    `⛔ ${infratores.join(", ")} — ⛔ o histórico é JANELA, ⛔ e ⛔ não fonte. ` +
      "⛔ Duas rotas até o mesmo fato ⛔ divergem, ⛔ e a clínica passa a depender de qual foi lida"
  );
  confere(
    "⚠️ e há derivações no universo (⛔ senão a conferência acima ⛔ não vale)",
    derivacoes.length >= 3,
    `⛔ só ${derivacoes.length} arquivo(s) — a varredura ficou cega`
  );
}

if (falhas.length > 0) {
  console.log(`\n❌ HISTÓRICO DE AFERIÇÕES — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ HISTÓRICO DE AFERIÇÕES — ${ok}/${ok} conferências · janela, não fonte · o 183 sobrevive\n`);
