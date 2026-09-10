#!/usr/bin/env node
/**
 * TRAVA DA INSTÂNCIA DE GLICEMIA — ⚠️ **nova medida ⛔ ≠ correção** — D-133.
 *
 * PROMETE: que uma **nova glicemia** abra ⛔ **⛔ instância nova**, ⛔ deixando a
 *   anterior ⛔ intacta na trilha; que **corrigir** ⛔ permaneça ⛔ gesto
 *   separado, ⛔ na ⛔ **⛔ mesma** instância; que ⛔ a leitura corrente ⛔ siga
 *   sendo ⛔ a última medida; ⛔ e que ⛔ **⛔ zero** ⛔ continue ⛔ sendo ⛔ valor
 *   ⛔ registrável.
 *
 * NÃO PROMETE: que a hiperglicemia ganhe ciclo — ⛔ ela ⛔ **⛔ não bloqueia** a
 *   trombólise (**F-06**), ⛔ e ⛔ instância ⛔ não é ⛔ bloqueio. ⛔ Promete ⛔ só
 *   que ⛔ ela pode ser ⛔ **⛔ remedida** ⛔ sem apagar ⛔ a medida anterior.
 *
 * UNIVERSO: `avc/nucleo/estado.ts`, `avc/nucleo/instancia.ts` ⛔ e a declaração
 *   `instanciaDe` do campo `glicemia` em `avc/conteudo/superficie-a.ts`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ELA FECHA ──────────────────────────────────────
 *
 * ⛔ ⛔ `F-06` manda tratar abaixo de 60, ⛔ e a ação de correção declara que o
 * bloqueio cai por ⛔ *"Uma nova glicemia"*. ⛔ Só que ⛔ o campo ⛔ **⛔ não tinha
 * instância**: ⛔ « nova glicemia » ⛔ e ⛔ « corrigir a glicemia » ⛔ eram
 * ⛔ **⛔ o mesmo gesto**.
 *
 * ⚠️⚠️ ⛔ Consequência clínica: ⛔ o app ⛔ destravaria ⛔ a trombólise ⛔ sobre um
 * número ⛔ que ⛔ **⛔ apagou** ⛔ o 38 ⛔ que motivou ⛔ a correção — ⛔ e ⛔ a
 * trilha ⛔ diria ⛔ que ⛔ a glicemia ⛔ **⛔ sempre foi** 96.
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

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-glic-"));
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

/* ══ ⚠️⚠️⚠️ 1 · A DECLARAÇÃO NASCE NO CONTEÚDO ═══════════════════════════ */

{
  const fonte = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-a.ts"));
  /**
   * ⚠️ ⛔ `lerFonte` **⛔ apaga o comentário ⛔ mas mantém o espaço** — ⛔ uma
   * janela curta ⛔ cai inteira ⛔ dentro do branco ⛔ e ⛔ a trava ⛔ acusa
   * ausência ⛔ de algo ⛔ que está lá. ⛔ Já me pegou ⛔ uma vez ⛔ nesta sessão.
   */
  const ini = fonte.indexOf('id: "glicemia"');
  const bloco = fonte.slice(ini, ini + 3000);
  confere(
    "⚠️ o campo `glicemia` declara `instanciaDe` no CONTEÚDO",
    /instanciaDe:\s*"glicemia"/.test(bloco),
    "⛔ a decisão de ter instância tem de nascer no conteúdo/modelo, ⛔ e ⛔ não na tela"
  );
}

/* ══ ⚠️⚠️⚠️ 2 · NOVA MEDIDA ⛔ NÃO APAGA A ANTERIOR ══════════════════════ */

{
  const rel = R.relogioControlado(1_000_000);
  let e = E.abrirAtendimento(rel);

  e = E.registrarFato(e, { campo: "glicemia", valor: 38, instancia: "glicemia_1", tipo: "medida" }, rel);
  rel.avancar(600_000);
  /** ⚠️ A nova aferição é ⛔ **⛔ outra instância** — o gesto do médico. */
  e = E.registrarFato(e, {
    campo: "glicemia_nova_medida", valor: "glicemia_2", instancia: "glicemia_2",
    tipo: "medida", motivo: "Nova aferição aberta pelo médico",
  }, rel);
  e = E.registrarFato(e, { campo: "glicemia", valor: 96, instancia: "glicemia_2", tipo: "medida" }, rel);

  const instancias = I.instanciasDe(e, "glicemia");
  confere(
    "⚠️⚠️ ⛔ duas glicemias ⛔ = ⛔ **duas instâncias**",
    instancias.length === 2,
    `⛔ ${instancias.length} instância(s) — ⛔ a segunda medida ⛔ sobrescreveu a primeira`
  );

  const trinta8 = e.fatos.filter((f) => f.campo === "glicemia" && f.valor === 38);
  confere(
    "⚠️⚠️⚠️ ⛔ o **38** ⛔ continua na trilha ⛔ depois da nova medida",
    trinta8.length === 1,
    "⛔ a hipoglicemia que MOTIVOU a correção sumiu do caso — a trilha passou a mentir"
  );

  confere(
    "⚠️ a leitura corrente ⛔ é a ÚLTIMA medida",
    E.valorAtual(e, "glicemia")?.valor === 96,
    "⛔ o portão leria um valor que ⛔ não é o mais recente"
  );
}

/* ══ ⚠️⚠️⚠️ 3 · CORRIGIR ⛔ É OUTRO GESTO, ⛔ NA MESMA INSTÂNCIA ══════════ */

{
  const rel = R.relogioControlado(2_000_000);
  let e = E.abrirAtendimento(rel);
  e = E.registrarFato(e, { campo: "glicemia", valor: 38, instancia: "glicemia_1", tipo: "medida" }, rel);
  rel.avancar(1000);
  /** ⚠️ ⛔ Erro de digitação: ⛔ era 88, ⛔ e ⛔ o 38 ⛔ nunca foi verdade. */
  const alvo = e.fatos[e.fatos.length - 1];
  e = E.corrigirFato(e, {
    campo: "glicemia", valor: 88, instancia: alvo.instancia, corrigeFatoId: alvo.id,
  }, rel);

  confere(
    "⚠️ corrigir ⛔ **⛔ não** abre instância nova",
    I.instanciasDe(e, "glicemia").length === 1,
    "⛔ uma correção virou uma segunda aferição — o caso passa a ter duas medidas que ⛔ nunca existiram"
  );
  confere(
    "⚠️⚠️ ⛔ e o valor errado ⛔ **⛔ permanece** na trilha, marcado",
    e.fatos.some((f) => f.valor === 38),
    "⛔ apagar o valor errado ⛔ esconde que houve erro (§3.4)"
  );
  confere(
    "⚠️ a leitura corrente passa a ser o valor corrigido",
    E.valorAtual(e, "glicemia")?.valor === 88,
    "⛔ a correção ⛔ não chegou à leitura"
  );
}

/* ══ ⚠️⚠️⚠️ 4 · ZERO CONTINUA SENDO VALOR ═══════════════════════════════ */

{
  const rel = R.relogioControlado(3_000_000);
  let e = E.abrirAtendimento(rel);
  e = E.registrarFato(e, { campo: "glicemia", valor: 0, instancia: "glicemia_1", tipo: "medida" }, rel);
  confere(
    "⚠️⚠️ ⛔ **zero** ⛔ é valor registrado, ⛔ e ⛔ não ausência",
    E.valorAtual(e, "glicemia")?.valor === 0,
    "⛔ zero virou `undefined` — ⛔ e ⛔ ausência ⛔ e ⛔ medida ⛔ são coisas diferentes (E-23)"
  );
}

if (falhas.length > 0) {
  console.log(`\n❌ INSTÂNCIA DE GLICEMIA — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ INSTÂNCIA DE GLICEMIA — ${ok}/${ok} conferências · nova medida ≠ correção · o 38 sobrevive\n`);
