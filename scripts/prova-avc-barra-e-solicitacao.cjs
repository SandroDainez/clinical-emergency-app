#!/usr/bin/env node
/**
 * TRAVA DA BARRA E DO PEDIDO DE IMAGEM — as duas coisas novas de 2026-09-06.
 *
 * PROMETE:
 *   · que **arrastar a barra** ⛔ não escreva fato antes de o dedo sair dela,
 *     ⛔ não invente valor de partida ⛔ e respeite faixa ⛔ e passo;
 *   · que **registrar a solicitação** da imagem ⛔ NÃO faça o app afirmar que o
 *     exame foi feito.
 *
 * NÃO PROMETE: que a barra seja o controle certo para cada grandeza, ⛔ nem que
 *   os cortes de PA ⛔ e glicemia estejam corretos — ⛔ isso é F-04 ⛔ e F-06.
 *
 * UNIVERSO: `avc/nucleo/rascunho-numerico.ts` ⛔ e `avc/nucleo/derivacoes-c.ts`.
 *
 * ── ⚠️⚠️ O RISCO QUE ELA VIGIA ────────────────────────────────────────────
 *
 * ⛔ **A barra:** ⛔ um `onValueChange` no lugar de `onSlidingComplete` escreve
 * ⛔ um fato **por pixel**. ⚠️ Numa arrastada de glicemia de 20 a 300 isso são
 * ~280 fatos numa trilha append-only (§3.1) — ⛔ e ⛔ nenhum deles é a medida:
 * ⛔ são o **caminho** até ela. ⛔ A auditoria leria 280 glicemias.
 *
 * ⛔ **O pedido:** ⛔ se ⛔ ele virasse uma **instância de estudo**,
 * `situacaoDaTcSemContraste()` o classificaria como
 * `realizada_resultado_pendente` — ⛔ e a tela diria *"Tomografia registrada,
 * resultado ⛔ ainda ⛔ não informado"* sobre um exame que ⛔ **⛔ ninguém fez**.
 * ⚠️ ⛔ Isso é afirmação sobre o mundo tirada de silêncio: **E-23**.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "barra-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "rascunho-numerico.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

function achar(nome) {
  const pilha = [tmp];
  while (pilha.length > 0) {
    const dir = pilha.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const alvo = path.join(dir, e.name);
      if (e.isDirectory()) pilha.push(alvo);
      else if (e.name === nome) return alvo;
    }
  }
  throw new Error(`⛔ compilado ⛔ não encontrado: ${nome}`);
}

const R = require(achar("rascunho-numerico.js"));
const C = require(achar("derivacoes-c.js"));
const E = require(achar("estado.js"));
const I = require(achar("instancia.js"));

const relogio = { agora: () => 1000000 };

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️ A BARRA ═════════════════════════════════════════════════════════ */

const PA = { min: 40, max: 300, passo: 1 };
const arrastar = (valor, extra = {}) =>
  R.proximoPasso({
    modo: "direto",
    faixa: PA,
    gravado: undefined,
    rascunho: undefined,
    gesto: { tipo: "arrastou", valor },
    ...extra,
  });

{
  const p = arrastar(186);
  conf(
    "⚠️ soltar a barra em 186 grava 186",
    p.efeito.tipo === "medir" && p.efeito.valor === 186 && p.rascunho === undefined,
    `⛔ efeito=${JSON.stringify(p.efeito)} · rascunho=${JSON.stringify(p.rascunho)}`
  );
}

{
  /**
   * ⚠️⚠️ SOLTAR NO PISO **É** UMA MEDIDA — ⛔ e ⛔ isso ⛔ não contradiz §0.2.
   *
   * ⛔ §0.2 proíbe o campo **intocado** valer o piso. ⚠️ Aqui o médico
   * arrastou ⛔ e soltou: ⛔ ele **declarou**. ⛔ É o mesmo defeito que o
   * `NumericStepper` corrigiu em 2026-08-16 — *"⛔ não informado"* ⛔ e
   * *"informado, ⛔ e igual ao padrão"* são **opostos**.
   */
  const p = arrastar(PA.min);
  conf(
    "⚠️⚠️ soltar no piso GRAVA o piso — ⛔ e ⛔ não fica 'não informado'",
    p.efeito.tipo === "medir" && p.efeito.valor === PA.min,
    `⛔ efeito=${JSON.stringify(p.efeito)} — sem isso, quem arrasta até o mínimo continua marcado como não informado`
  );
}

{
  const p = arrastar(9999);
  conf(
    "⚠️ a barra ⛔ não escapa do teto da faixa",
    p.efeito.tipo === "medir" && p.efeito.valor === PA.max,
    `⛔ efeito=${JSON.stringify(p.efeito)}`
  );
}

{
  /** ⚠️ Plaquetas: passo 1000 — ⛔ a barra ⛔ não pode entregar 137.437. */
  const faixa = { min: 0, max: 800000, passo: 1000 };
  const p = R.proximoPasso({
    modo: "direto", faixa, gravado: undefined, rascunho: undefined,
    gesto: { tipo: "arrastou", valor: 137437.6 },
  });
  conf(
    "⚠️ a barra entrega valor NA GRADE do passo",
    p.efeito.tipo === "medir" && p.efeito.valor === 137000,
    `⛔ efeito=${JSON.stringify(p.efeito)}`
  );
}

{
  const p = arrastar(186, { gravado: 186 });
  conf(
    "⚠️ soltar no MESMO número já gravado ⛔ não escreve fato novo",
    p.efeito.tipo === "nada",
    `⛔ efeito=${JSON.stringify(p.efeito)} — seria uma 'correção' de um valor para ele mesmo`
  );
}

{
  /**
   * ⚠️⚠️ ⛔ EM CORREÇÃO, ARRASTAR ⛔ NÃO GRAVA — ⛔ é a mesma regra do `+`.
   *
   * ⛔ Sem isso, corrigir um ASPECTS arrastando de 1 a 7 escreveria uma
   * correção por parada do dedo, ⛔ e a auditoria leria várias correções onde
   * houve **⛔ uma**.
   */
  const p = R.proximoPasso({
    modo: "comConfirmacao", faixa: PA, gravado: 120, rascunho: undefined,
    gesto: { tipo: "arrastou", valor: 186 },
  });
  conf(
    "⚠️⚠️ em CORREÇÃO, arrastar move o rascunho ⛔ e ⛔ NÃO a trilha",
    p.efeito.tipo === "nada" && p.rascunho === "186",
    `⛔ efeito=${JSON.stringify(p.efeito)} · rascunho=${JSON.stringify(p.rascunho)}`
  );
}

/* ══ ⚠️⚠️ O PEDIDO DA IMAGEM ════════════════════════════════════════════ */

const novo = () => E.abrirAtendimento(relogio);

{
  const e = novo();
  conf(
    "⚠️ atendimento vazio ⛔ não tem pedido de imagem",
    C.imagemSolicitadaEm(e) === undefined,
    `⛔ devolveu ${JSON.stringify(C.imagemSolicitadaEm(e))}`
  );
}

{
  const e = E.registrarFato(novo(), { campo: "hora_solicitacao_imagem", valor: 990000 }, relogio);
  conf(
    "⚠️ horário registrado É um pedido",
    C.imagemSolicitadaEm(e) === 990000,
    `⛔ devolveu ${JSON.stringify(C.imagemSolicitadaEm(e))}`
  );
  /* ══ ⚠️⚠️ E AQUI ESTÁ O QUE MAIS IMPORTA ═════════════════════════════ */
  conf(
    "⚠️⚠️ pedir a imagem ⛔ NÃO faz o app dizer que a tomografia foi feita",
    C.situacaoDaTcSemContraste(e) === "nenhuma_registrada",
    `⛔ situação="${C.situacaoDaTcSemContraste(e)}" — se virasse "realizada_resultado_pendente", a tela afirmaria um exame que ninguém fez (E-23)`
  );
}

{
  /** ⚠️ **E-37**: ignorância declarada sobre o horário ⛔ não é um horário. */
  const e = E.registrarFato(
    novo(),
    { campo: "hora_solicitacao_imagem", valor: "desconhecido" },
    relogio
  );
  conf(
    '⚠️ "sem essa informação" ⛔ NÃO vira pedido registrado',
    C.imagemSolicitadaEm(e) === undefined,
    `⛔ devolveu ${JSON.stringify(C.imagemSolicitadaEm(e))}`
  );
}

{
  /**
   * ⚠️ ⛔ E o caminho verdadeiro continua funcionando: uma TC **de verdade**,
   * ⛔ sem resultado, continua sendo *"realizada, resultado pendente"*.
   */
  let e = novo();
  const inst = I.instanciaParaRegistrar(e, "estudo");
  e = E.registrarFato(e, { campo: "estudo_modalidade", valor: "Tomografia de crânio sem contraste", instancia: inst }, relogio);
  conf(
    "⚠️ um exame REGISTRADO continua sendo lido como realizado",
    C.situacaoDaTcSemContraste(e) === "realizada_resultado_pendente",
    `⛔ situação="${C.situacaoDaTcSemContraste(e)}" — a trava ⛔ não pode cegar o caminho legítimo`
  );
}

if (falhas > 0) {
  console.log(`\n❌ BARRA E SOLICITAÇÃO — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ BARRA E SOLICITAÇÃO — ${ok}/${ok} conferências`);
