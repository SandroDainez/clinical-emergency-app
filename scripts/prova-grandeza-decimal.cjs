/**
 * PROMETE: que uma grandeza com **passo decimal** seja representável sem erro de
 *   ponto flutuante — que `1,4` fique `1,4` na trilha, que os degraus ⛔ não saiam
 *   com dezesseis casas, e que o número exibido use **vírgula**; e que o **zero**
 *   ⛔ nunca seja usado como sinônimo de "⛔ não informado".
 * NÃO PROMETE: que as faixas dos campos sejam clinicamente adequadas — elas são
 *   **limite técnico de entrada** (ver `Faixa`), e ⛔ não afirmação clínica. ⛔ Também
 *   ⛔ não mede tela: o comportamento do controle é `e2e/avc-superficie-a`.
 * UNIVERSO: os helpers de `avc/nucleo/formato.ts` exercitados sobre os passos
 *   realmente usados no módulo, mais TODOS os campos de grandeza das quatro
 *   casas — contados, com piso.
 *
 * ── POR QUE ESTA TRAVA NASCEU (2026-08-30) ─────────────────────────────────
 *
 * Laboratório traz os dois primeiros campos com casa decimal do módulo — INR e
 * TP. Todo o resto (peso, PA, glicemia, ASPECTS, NIHSS) é inteiro, e a camada do
 * AVC assumia isso: `0,1 × 10` saía `1.0000000000000002` no rótulo do degrau, no
 * `testID` **e no valor gravado**.
 *
 * ⚠️⚠️ E o autor fixou a regra que a acompanha: ⛔ **`0` ⛔ nunca é sentinela de
 * ausência**. *"⛔ Não informado é estado; zero é número."* Plaqueta 0 é resultado
 * possível, e um campo que ⛔ não o registra fabrica ausência onde há informação —
 * **E-52** reaparecendo pelo componente numérico.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-decimal-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "formato.ts"),
  path.join(appDir, "avc", "conteudo", "campos.ts"),
], { cwd: appDir, stdio: "pipe" });

const F = require(path.join(tmp, "avc", "nucleo", "formato.js"));
const CAMPOS = require(path.join(tmp, "avc", "conteudo", "campos.js"));

// ── 0 · O UNIVERSO ────────────────────────────────────────────────────────
const grandezas = CAMPOS.todosOsCampos().filter((c) => c.tipo === "grandeza" || c.tipo === "escala");
{
  confere("há grandezas a conferir",
    grandezas.length >= 8,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  confere("toda grandeza declara faixa com passo positivo",
    grandezas.every((c) => c.faixa && c.faixa.passo > 0 && c.faixa.max > c.faixa.min),
    "passo zero ou negativo torna o arredondamento indefinido");
}

// ── 1 · O PASSO DEFINE A PRECISÃO ────────────────────────────────────────
{
  confere("casas do passo: 1 → 0 · 0,1 → 1 · 0,01 → 2",
    F.casasDoPasso(1) === 0 && F.casasDoPasso(0.1) === 1 && F.casasDoPasso(0.01) === 2,
    "é o passo que define a precisão do campo, e ⛔ não uma constante global");
}

// ── 2 · ⛔ NENHUM ERRO DE PONTO FLUTUANTE CHEGA À TRILHA ──────────────────
{
  /**
   * ⚠️⚠️ O CASO-SENTINELA DO INR: `1,4` é o valor do caso que o autor montou
   * para Laboratório, e ele precisa sobreviver a soma e subtração.
   */
  confere("1,4 + 0,1 é 1,5, e ⛔ não 1.5000000000000002",
    F.arredondaAoPasso(1.4 + 0.1, 0.1) === 1.5,
    "o número não arredondado entraria na trilha como MEDIDA que ninguém digitou");
  confere("0,1 × 10 é 1, e ⛔ não 1.0000000000000002",
    F.arredondaAoPasso(0.1 * 10, 0.1) === 1,
    "saía assim no rótulo do degrau, no testID e no valor gravado");
  confere("0,3 − 0,1 é 0,2",
    F.arredondaAoPasso(0.3 - 0.1, 0.1) === 0.2,
    "o clássico do ponto flutuante, num campo que a Superfície D compara com um corte");
  confere("o arredondamento ⛔ não estraga inteiros",
    F.arredondaAoPasso(78, 1) === 78 && F.arredondaAoPasso(198, 1) === 198,
    "peso e PA ⛔ não podem mudar por causa de um campo novo");

  /** ⚠️ VARREDURA: cem somas seguidas, no passo de cada grandeza do módulo. */
  const acumulados = grandezas.filter((c) => {
    let v = c.faixa.min;
    for (let i = 0; i < 100; i += 1) v = F.arredondaAoPasso(v + c.faixa.passo, c.faixa.passo);
    return String(v).replace("-", "").split(".")[1]?.length > F.casasDoPasso(c.faixa.passo);
  });
  confere("cem somas seguidas ⛔ não acumulam casa nenhuma, em ⛔ nenhuma grandeza",
    acumulados.length === 0,
    `erro de ponto flutuante acumula em silêncio — ${acumulados.map((c) => c.id).join(", ")}`);
}

// ── 2b · O PASSO É INCREMENTO DE AJUSTE, E ⛔ NÃO GRADE DE VALORES ────────
{
  /**
   * ⚠️⚠️ O DEFEITO QUE ISTO FECHA, achado na revisão visual de 2026-08-30:
   * digitar **80** num campo de passo `1000` virava **0**. O componente
   * **apagava um resultado verdadeiro** e punha outro número no lugar, com cara
   * de medida — **E-52** pelo componente numérico.
   *
   * ⚠️ A distinção: quem **digita** 80 informou 80; quem toca `+` pediu "mais um
   * passo". `arredondaCasas` serve o primeiro; `arredondaAoPasso`, o segundo.
   */
  confere("80 digitado num campo de passo 1000 continua 80",
    F.arredondaCasas(80, 1000) === 80,
    "`arredondaAoPasso(80, 1000)` é 0 — e zero seria um resultado que ninguém digitou");
  confere("e o valor digitado ⛔ não é preso à grade do passo",
    F.arredondaCasas(1.45, 0.1) === 1.5 || F.arredondaCasas(1.45, 0.1) === 1.4
      ? F.arredondaCasas(87_432, 1000) === 87_432
      : false,
    "o passo normaliza CASAS, e ⛔ não move o valor para o múltiplo mais próximo");
  confere("as casas continuam sendo normalizadas",
    F.arredondaCasas(1.4000000000000001, 0.1) === 1.4
    && F.arredondaCasas(78.0000001, 1) === 78,
    "erro de ponto flutuante ⛔ não pode chegar à trilha, mesmo sem prender à grade");
}

// ── 3 · VÍRGULA, E ⛔ NÃO PONTO ───────────────────────────────────────────
{
  confere("o número exibido usa vírgula",
    F.numeroCurto(1.4, 0.1) === "1,4" && F.numeroCurto(78, 1) === "78",
    "o app é PT-BR e ES, e `1.4` ⛔ não é como se escreve um INR em ⛔ nenhum dos dois");
  confere("e o passo decide as casas exibidas",
    F.numeroCurto(1, 0.1) === "1,0" && F.numeroCurto(1, 1) === "1",
    "INR 1,0 e peso 1 ⛔ não se escrevem igual");
}

// ── 4 · ⛔ ZERO ⛔ NUNCA É SENTINELA DE AUSÊNCIA ───────────────────────────
{
  /**
   * ⚠️⚠️ A REGRA DO AUTOR, 2026-08-30: *"⛔ não informado é estado; zero é
   * número"*. E o critério para a porta do zero existir passou a ser **zero é
   * possível para a grandeza** — e ⛔ nunca *"na prática ⛔ não chega a zero"*.
   *
   * ⛔ *Raro* ⛔ não é *impossível*: plaqueta 0 é resultado que laboratório
   * reporta, e um campo sem porta o tornaria irregistrável — E-52 reaparecendo
   * pelo componente numérico.
   */
  const semPorta = grandezas.filter((c) => c.faixa.min === 0 && !c.zeroValido);
  confere("⛔ nenhuma grandeza que começa em zero fica sem a porta do zero",
    semPorta.length === 0,
    `com o polegar no mínimo o − nasce desabilitado e o + sobe: sem porta, o zero ⛔ não é registrável — ${semPorta.map((c) => c.id).join(", ")}`);

  confere("a porta do zero é declarada no CONTEÚDO, e ⛔ não deduzida na tela",
    grandezas.filter((c) => c.zeroValido).every((c) => c.faixa.min === 0),
    "declarar zero válido num campo cujo mínimo ⛔ não é zero é declaração sem efeito");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DA GRANDEZA DECIMAL — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DA GRANDEZA DECIMAL — ${ok}/${ok} conferências · ${grandezas.length} grandezas`);
