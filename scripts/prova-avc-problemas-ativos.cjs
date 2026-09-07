#!/usr/bin/env node
/**
 * TRAVA DOS PROBLEMAS ATIVOS — ⚠️ **⛔ uma** lista, ⛔ e a ordem é clínica.
 *
 * PROMETE:
 *   · que ameaças, bloqueios ⛔ e pendências cheguem à tela numa **⛔ única**
 *     lista, ordenada por urgência ⛔ e origem;
 *   · que **todo** problema diga onde se resolve (**E-26**);
 *   · que o alfabeto de estados seja o do app, ⛔ e ⛔ não um símbolo local;
 *   · que a síntese do Destino continue recebendo **pendências**, ⛔ e ⛔ não a
 *     lista unificada.
 *
 * NÃO PROMETE: que os cortes clínicos estejam certos — ⛔ isso é das provas de
 *   superfície, ⛔ e este módulo ⛔ não decide medicina ⛔ nenhuma.
 *
 * UNIVERSO: `avc/nucleo/problemas-ativos.ts`.
 *
 * ── ⚠️⚠️ O QUE ORIGINOU ────────────────────────────────────────────────────
 *
 * ⛔ A montagem vivia num `useMemo` de trinta linhas **dentro do JSX**, com a
 * ordem clínica escrita em comentário. ⚠️⚠️ ⛔ Regra que mora no JSX ⛔ não pode
 * ser executada por trava ⛔ nenhuma — ⛔ e foi exatamente assim que a leitura
 * das ameaças se perdeu ⛔ uma vez neste módulo, afirmando o negativo numa via
 * aérea comprometida.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "problemas-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tmp, path.join(appDir, "avc", "nucleo", "problemas-ativos.ts"),
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

const P = require(achar("problemas-ativos.js"));
const E = require(achar("estado.js"));
const I = require(achar("instancia.js"));
/**
 * ⚠️ ⛔ A **semântica** dos estados mudou de casa em 2026-09-07: ⛔ ela saiu do
 * `design-system/` (onde eu a havia posto, acoplando o núcleo ao desenho) ⛔ e
 * foi para `lib/clinico/estados`. ⛔ O símbolo ⛔ e a cor ficaram lá.
 */
const EST = require(achar("estados.js"));

const relogio = { agora: () => 1000000 };
const novo = () => E.abrirAtendimento(relogio);
const com = (e, campo, valor) => E.registrarFato(e, { campo, valor }, relogio);

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️ ATENDIMENTO VAZIO ═══════════════════════════════════════════════ */
{
  const lista = P.problemasAtivos(novo());
  conf(
    "⚠️ atendimento vazio já tem o que responder, ⛔ e ⛔ nada 'aberto' por ameaça",
    lista.length > 0 && lista.every((p) => p.estado === "verificar"),
    `⛔ ${lista.map((p) => `${p.id}=${p.estado}`).slice(0, 6).join(" · ")}`
  );
}

/* ══ ⚠️⚠️ A ORDEM É CLÍNICA, ⛔ E ⛔ NÃO ALFABÉTICA ═══════════════════════ */
{
  /**
   * ⚠️ Um paciente com via aérea ameaçada ⛔ e PA acima do corte pré-IVT: ⛔ a
   * **ameaça** tem de vir antes do **bloqueio**, ⛔ e os dois antes de qualquer
   * campo por responder.
   */
  let e = com(novo(), "consciencia_rebaixada", "sim");
  const inst = I.instanciaParaRegistrar(e, "pa");
  e = E.registrarFato(e, { campo: "pas", valor: 198, instancia: inst }, relogio);
  e = E.registrarFato(e, { campo: "pad", valor: 112, instancia: inst }, relogio);

  const lista = P.problemasAtivos(e);
  const primeiroDe = (origem) => lista.findIndex((p) => p.origem === origem);

  /**
   * ⚠️⚠️ ⛔ PELA **ORIGEM**, ⛔ e ⛔ não pelo prefixo do `id`.
   *
   * ⛔ A primeira versão lia `id.startsWith("ameaca-")`, ⛔ e a mutação que
   * trocava a ordem clínica por `localeCompare` **passava verde** — `a` < `b` <
   * `p` dava a mesma ordem por acaso. ⚠️ A prova media uma coincidência de
   * letras, ⛔ e ⛔ não a regra.
   */
  conf(
    "⚠️⚠️ a AMEAÇA vem antes do BLOQUEIO, ⛔ e o bloqueio antes das pendências",
    primeiroDe("ameaca") >= 0
      && primeiroDe("bloqueio") > primeiroDe("ameaca")
      && primeiroDe("derivada") > primeiroDe("bloqueio"),
    `⛔ ameaça=${primeiroDe("ameaca")} · bloqueio=${primeiroDe("bloqueio")} · derivada=${primeiroDe("derivada")}`
  );

  /** ⚠️⚠️ ⛔ E a urgência do ESTADO manda sobre tudo: a lista ⛔ nunca "sobe". */
  {
    const posicoes = lista.map((p) => EST.ORDEM_DOS_ESTADOS.indexOf(p.estado));
    const inversoes = posicoes.filter((v, i) => i > 0 && v < posicoes[i - 1]);
    conf(
      "⚠️⚠️ a lista está em ordem NÃO-DECRESCENTE de urgência",
      inversoes.length === 0,
      `⛔ ${inversoes.length} inversão(ões) — ${lista.map((p) => p.estado).join(" → ")}`
    );
  }

  conf(
    "⚠️ o bloqueio de PA leva a **Correções**, ⛔ e ⛔ não ao campo da PA",
    lista.find((p) => p.id === "pressao_acima_da_meta")?.dono === "correcoes",
    "⛔ quem tem conduta registrada leva a onde a conduta está (E-09)"
  );
}

/* ══ ⚠️⚠️ TODO PROBLEMA TEM PORTA (E-26) ═══════════════════════════════ */
{
  let e = com(novo(), "consciencia_rebaixada", "sim");
  e = com(e, "hipoxia", "sim");
  e = com(e, "glicemia", 579);
  const lista = P.problemasAtivos(e);
  const semPorta = lista.filter(
    (p) => typeof p.dono !== "string" || p.dono.length === 0
      || typeof p.resolvePor !== "string" || p.resolvePor.length === 0
  );
  conf(
    "⚠️⚠️ ⛔ NENHUM problema fica ⛔ sem dono ⛔ e ⛔ sem o que o resolve",
    lista.length > 0 && semPorta.length === 0,
    `⛔ ${semPorta.map((p) => p.id).join(" · ")} — pendência ⛔ sem porta é muro, ⛔ e ⛔ não tarefa`
  );
}

/* ══ ⚠️ O ALFABETO É O DO APP ══════════════════════════════════════════ */
{
  const e = com(novo(), "glicemia", 40);
  const lista = P.problemasAtivos(e);
  const forasteiros = lista.filter((p) => !EST.ORDEM_DOS_ESTADOS.includes(p.estado));
  conf(
    "⚠️ todo estado pertence ao alfabeto único",
    forasteiros.length === 0,
    `⛔ ${forasteiros.map((p) => `${p.id}=${p.estado}`).join(" · ")}`
  );
  conf(
    "⚠️ ⛔ e são SETE estados na ordem de urgência, ⛔ nem mais ⛔ nem menos (C2)",
    EST.ORDEM_DOS_ESTADOS.length === 7
    && new Set(EST.ORDEM_DOS_ESTADOS).size === 7,
    `⛔ ordem com ${EST.ORDEM_DOS_ESTADOS.length} · ${EST.ORDEM_DOS_ESTADOS.join(" → ")}`
  );
}

/* ══ ⚠️⚠️ A SÍNTESE DO DESTINO RECEBE **PENDÊNCIAS** ═══════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ AS DUAS LISTAS ⛔ NÃO SÃO A MESMA COISA, ⛔ e confundi-las poria uma
   * ameaça de via aérea na síntese do caso como se fosse campo por responder.
   *
   * ⛔ E ⛔ elas ⛔ **não** podem ser duas apurações: ⛔ é a mesma
   * `familiasDePendencia`, ⛔ lida duas vezes (**I6**).
   */
  const e = com(novo(), "consciencia_rebaixada", "sim");
  const pend = P.pendenciasDoCaso(e);
  const probs = P.problemasAtivos(e);

  conf(
    "⚠️⚠️ as pendências do caso ⛔ NÃO carregam a ameaça de via aérea",
    probs.some((p) => p.origem === "ameaca") && !pend.some((p) => p.id === "via_aerea"),
    `⛔ ${pend.map((p) => p.id).join(" · ")}`
  );
  conf(
    "⚠️ ⛔ e a lista unificada contém TODAS as pendências, ⛔ sem perder ⛔ nenhuma",
    pend.every((p) => probs.some((x) => x.id === p.id && x.origem !== "ameaca")),
    `⛔ ${pend.length} pendência(s) · ${probs.filter((x) => x.origem === "derivada" || x.origem === "campo").length} na lista`
  );
}

/* ══ ⚠️ A CONTAGEM POR SUPERFÍCIE ══════════════════════════════════════ */
{
  const e = com(novo(), "consciencia_rebaixada", "sim");
  const conta = P.problemasPorSuperficie(e);
  const total = Object.values(conta).reduce((a, b) => a + b, 0);
  conf(
    "⚠️ a contagem por fase soma exatamente a lista",
    total === P.problemasAtivos(e).length,
    `⛔ soma=${total} · lista=${P.problemasAtivos(e).length}`
  );
}

if (falhas > 0) {
  console.log(`\n❌ PROBLEMAS ATIVOS — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ PROBLEMAS ATIVOS — ${ok}/${ok} conferências · 7 estados`);
