#!/usr/bin/env node
/**
 * TRAVA DA COMPOSIÇÃO DA FASE 4 — ⚠️ **compor ⛔ não é mover**.
 *
 * PROMETE: ⛔ que os fatos críticos mapeados em 2026-09-07 sigam inteiros —
 *   · `deficit_focal` intacto — id, casa, tipo ⛔ e **série temporal**;
 *   · `hora_ultima_vez_bem` intacto — ⛔ e o **vínculo com o relógio clínico**;
 *   · **dois** NIHSS, ⛔ e ⛔ nenhum corrigindo o outro;
 *   · `mrs_previo` **⛔ apenas emprestado** — a casa continua Paciente;
 *   · os **onze** `t4_*` preservados, ⛔ e ⛔ sem virar *"exame neurológico"*;
 *   · `incapacitante_assumido` preservado.
 *
 * NÃO PROMETE: que a tela esteja bonita ⛔ nem que a ordem visual agrade —
 *   ⛔ isso é do e2e ⛔ e do olho do autor.
 *
 * UNIVERSO: `avc/conteudo/*.ts` × `avc/nucleo/*.ts`.
 *
 * ── ⚠️⚠️ A REGRA DA FASE, NAS PALAVRAS DO AUTOR (2026-09-07) ──────────────
 *
 * > *"Composição visual pode atravessar casas; fonte de verdade ⛔ não."*
 *
 * ⚠️ ⛔ Esta trava existe para ser rodada **antes** de a interface antiga sair
 * — ⛔ e ⛔ ela é o que autoriza removê-la.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase4-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-b.ts"),
    path.join(appDir, "avc", "nucleo", "sintese-do-caso.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (p) => require(path.join(tmp, ...p));
const K = emT(["avc", "conteudo", "campos.js"]);
const A = emT(["avc", "conteudo", "superficie-a.js"]);
const B = emT(["avc", "conteudo", "superficie-b.js"]);
const P = emT(["avc", "conteudo", "paciente.js"]);
const CAMPO = emT(["avc", "conteudo", "campo.js"]);
const E = emT(["avc", "nucleo", "estado.js"]);
const R = emT(["avc", "nucleo", "relogio.js"]);
const D = emT(["avc", "nucleo", "derivacoes.js"]);
const DB = emT(["avc", "nucleo", "derivacoes-b.js"]);

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const campos = K.todosOsCampos();
const acha = (id) => campos.find((c) => c.id === id);

/* ══ ⚠️⚠️ 1 · `deficit_focal` — ID, CASA, TIPO ⛔ E SÉRIE ══════════════ */
{
  const c = acha("deficit_focal");
  conf(
    "⚠️ `deficit_focal` continua sendo escolha sim/⛔ não/incerto na casa neurologico",
    c !== undefined && c.tipo === "escolha" && c.casa === "neurologico"
    && c.temporalidade === "afericao",
    `⛔ ${JSON.stringify(c && { tipo: c.tipo, casa: c.casa, temporalidade: c.temporalidade })}`
  );

  /**
   * ── ⚠️⚠️ ⛔ OS QUATRO CASOS TEMPORAIS QUE O AUTOR PEDIU ─────────────────
   *
   * ⛔ `deficit_focal` participa de `estadoDaReavaliacao()`, ⛔ que distingue
   * exame **antes** ⛔ e **depois** da correção metabólica. ⚠️ É a leitura mais
   * frágil do módulo: ⛔ ela lê a **ordem** dos fatos, ⛔ e ⛔ não o vigente.
   */
  const relogio = R.relogioControlado(1_000_000);
  const vazio = E.abrirAtendimento(relogio);
  const glic = (e, v, t) => E.registrarFato(e, { campo: "glicemia", valor: v }, R.relogioControlado(t));
  const exame = (e, t) => E.registrarFato(e, { campo: "deficit_focal", valor: "sim" }, R.relogioControlado(t));

  /** ⚠️ 1 · déficit ANTES da correção — ⛔ e a glicemia ⛔ ainda alterada. */
  const antes = glic(exame(vazio, 1_000_100), 48, 1_000_200);
  conf(
    "⚠️⚠️ CASO 1 · exame antes, glicemia alterada agora → **alterada_agora**",
    D.estadoDaReavaliacao(antes) === "alterada_agora",
    `⛔ "${D.estadoDaReavaliacao(antes)}"`
  );

  /** ⚠️ 2 · corrigiu a glicemia ⛔ e ⛔ NÃO reexaminou. */
  const corrigiuSemExame = glic(antes, 110, 1_000_300);
  conf(
    "⚠️⚠️ CASO 2 · corrigida ⛔ SEM novo exame → **corrigida_sem_exame**",
    D.estadoDaReavaliacao(corrigiuSemExame) === "corrigida_sem_exame",
    `⛔ "${D.estadoDaReavaliacao(corrigiuSemExame)}" — ⛔ o exame ANTERIOR ⛔ não responde: ⛔ ele descreve o paciente de antes`
  );

  /** ⚠️ 3 · reexaminou DEPOIS da correção. */
  const reexaminou = exame(corrigiuSemExame, 1_000_400);
  conf(
    "⚠️⚠️ CASO 3 · novo exame DEPOIS da correção → **reavaliado**",
    D.estadoDaReavaliacao(reexaminou) === "reavaliado",
    `⛔ "${D.estadoDaReavaliacao(reexaminou)}" — ⛔ é a ORDEM que fecha esta leitura`
  );

  /** ⚠️⚠️ 4 · PIORA depois da correção — ⛔ e ⛔ ela ⛔ não pode ler "resolvido". */
  const piorou = glic(reexaminou, 42, 1_000_500);
  conf(
    "⚠️⚠️ CASO 4 · piora depois da correção → **alterada_agora**, ⛔ e ⛔ nunca 'reavaliado'",
    D.estadoDaReavaliacao(piorou) === "alterada_agora",
    `⛔ "${D.estadoDaReavaliacao(piorou)}" — ⛔ ordenar a série por VALOR diria "resolvido" num paciente que piorou`
  );
}

/* ══ ⚠️⚠️ 2 · `hora_ultima_vez_bem` ⛔ E O VÍNCULO COM O RELÓGIO ═══════ */
{
  /**
   * ⚠️⚠️ ⛔ **DOIS IDENTIFICADORES, ⛔ E ⛔ ELES JÁ ⛔ NÃO CASARAM UMA VEZ.**
   *
   * ⛔ O comentário de `tipos.ts` registra o defeito de 2026-08-28: a pendência
   * procurava um campo chamado `ultima_vez_bem`, ⛔ o campo da tela chamava-se
   * `hora_ultima_vez_bem`, ⛔ e a pendência ficava aberta **para sempre**.
   *
   * ⚠️ O que liga os dois é a declaração `relogio:` no campo — ⛔ e mover a
   * apresentação para a Fase 4 ⛔ não pode rompê-la.
   */
  const c = acha("hora_ultima_vez_bem");
  conf(
    "⚠️⚠️ o campo declara o relógio clínico `ultima_vez_bem`",
    c !== undefined && c.relogio === "ultima_vez_bem" && c.casa === "estabilizacao",
    `⛔ ${JSON.stringify(c && { relogio: c.relogio, casa: c.casa })} — ⛔ sem o vínculo, o cabeçalho para de ver o horário`
  );

  /**
   * ── ⚠️⚠️ ⛔ O VÍNCULO É EXECUTADO PELA **TELA** — ⛔ e ⛔ isto eu descobri
   * ⛔ escrevendo esta prova, ⛔ e ⛔ muda o risco da migração ─────────────────
   *
   * ⛔ `registrarFato` **⛔ não** acende relógio ⛔ nenhum. ⚠️ Quem acende é a
   * tela, em **dois passos**: `registrarFato` ⛔ e depois
   * `definirRelogioClinico` — ⛔ e ⛔ ela só sabe qual relógio porque o campo o
   * **declara** ⛔ e ⛔ ela passa `campo.relogio` adiante.
   *
   * ⚠️⚠️ ⛔ **ENTÃO O PERIGO DA FASE 4 É ⛔ EXATAMENTE ESTE**: ⛔ se a nova
   * composição desenhar o horário ⛔ e esquecer de repassar `campo.relogio`, o
   * fato é gravado, ⛔ o relógio **⛔ não acende**, ⛔ e o cabeçalho para de
   * mostrar a última vez bem — ⛔ **em silêncio**, ⛔ com o valor ⛔ ainda
   * visível na fase que o coletou.
   *
   * ⛔ ⛔ É o parente do defeito de 2026-08-28, ⛔ quando os dois
   * identificadores ⛔ não casaram ⛔ e a pendência ficou aberta para sempre.
   */
  const relogio = R.relogioControlado(2_000_000);
  const gravado = E.registrarFato(
    E.abrirAtendimento(relogio),
    { campo: "hora_ultima_vez_bem", valor: 1_900_000, horaClinica: 1_900_000 },
    relogio
  );
  const aceso = E.definirRelogioClinico(gravado, "ultima_vez_bem", 1_900_000);
  conf(
    "⚠️⚠️ acesa a via completa, o **relógio** responde — ⛔ e ⛔ é ⛔ ele que o cabeçalho lê",
    E.decorridoEmMinutos(aceso, "ultima_vez_bem", relogio) !== undefined,
    "⛔ o cabeçalho ⛔ e a síntese leem `ultima_vez_bem`, ⛔ e ⛔ não o campo"
  );
  conf(
    "⚠️ ⛔ e ⛔ NENHUMA cópia local do valor foi criada",
    aceso.fatos.filter((f) => String(f.campo).includes("ultima_vez_bem")).length === 1,
    `⛔ ${aceso.fatos.map((f) => f.campo).join(" · ")} — **⛔ uma** fonte de verdade`
  );

  /**
   * ⚠️⚠️ ⛔ **A TRAVA QUE PROTEGE A MIGRAÇÃO**: ⛔ toda tela que desenha campo
   * de hora tem de **repassar `campo.relogio`**. ⛔ Sem isso, o horário é
   * gravado ⛔ e o relógio fica apagado.
   */
  const telasDeHora = ["superficie-a.tsx", "superficie-b.tsx", "campos-clinicos.tsx"];
  const semRepasse = telasDeHora.filter((f) => {
    const caminho = path.join(appDir, "components", "avc", f);
    if (!fs.existsSync(caminho)) return false;
    const fonte = lerFonte(caminho);
    /** ⚠️ ⛔ Só cobra de quem desenha hora. */
    if (!/tipo === "hora"|CampoDeHora|SeletorDeHora/.test(fonte)) return false;
    return !/campo\.relogio|relogio: campo\.relogio/.test(fonte);
  });
  conf(
    "⚠️⚠️ toda tela que desenha HORA repassa `campo.relogio`",
    semRepasse.length === 0,
    `⛔ ${semRepasse.join(" · ")} — ⛔ o fato grava ⛔ e o relógio ⛔ não acende: o cabeçalho apaga **em silêncio**`
  );
}

/* ══ ⚠️⚠️ 3 · OS DOIS NIHSS ═══════════════════════════════════════════ */
{
  conf(
    "⚠️ os DOIS produtores existem, ⛔ e ⛔ nenhum foi fundido",
    acha("nihss_calculado") !== undefined && acha("nihss_informado") !== undefined,
    "⛔ um exame de fora ⛔ e um exame aqui podem divergir legitimamente"
  );
  conf(
    "⚠️ ⛔ e o informado carrega **origem ⛔ e horário**",
    acha("nihss_informado_origem") !== undefined && acha("nihss_informado_hora") !== undefined,
    "⛔ número ⛔ sem procedência ⛔ não se audita"
  );

  const relogio = R.relogioControlado(3_000_000);
  let e = E.abrirAtendimento(relogio);
  e = E.registrarFato(e, { campo: "nihss_informado", valor: 7 }, relogio);
  e = E.registrarFato(e, { campo: "nihss_calculado", valor: 8 }, relogio);
  const l = DB.nihssRegistrado(e);
  conf(
    "⚠️⚠️ com os dois registrados, a leitura diz que **⛔ os dois convivem**",
    l.conclusao === "sim" && /informado/i.test(l.curto) && /calculado/i.test(l.curto),
    `⛔ "${l.curto}" — ⛔ nenhum corrige o outro, ⛔ e apagar um apagaria a evolução`
  );
  conf(
    "⚠️ ⛔ e os dois valores continuam legíveis, separados",
    DB.nihssCalculado(e) === 8 && DB.nihssInformado(e) === 7,
    `⛔ calculado=${DB.nihssCalculado(e)} · informado=${DB.nihssInformado(e)}`
  );
}

/* ══ ⚠️⚠️ 4 · mRS ⛔ APENAS EMPRESTADO ════════════════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ *"Composição visual pode atravessar casas; fonte de verdade ⛔ não."*
   *
   * ⛔ O mRS é **desenhado** em Neurológico ⛔ e **mora** em Paciente. ⚠️ A
   * diferença entre as duas listas é ⛔ exatamente isso: `TODOS_OS_CAMPOS_B` é
   * *"de quem é o fato"*; `CAMPOS_NA_TELA_B` é *"o que o médico vê aqui"*.
   */
  conf(
    "⚠️⚠️ `mrs_previo` mora em **Paciente**",
    acha("mrs_previo")?.casa === "paciente",
    `⛔ casa="${acha("mrs_previo")?.casa}"`
  );
  conf(
    "⚠️ ⛔ e ⛔ NÃO é campo próprio de Neurológico",
    B.TODOS_OS_CAMPOS_B.every((c) => c.id !== "mrs_previo"),
    "⛔ contado como próprio, ⛔ ele teria **duas casas** — a duplicação com outro nome"
  );
  conf(
    "⚠️ ⛔ e ⛔ ele **É** desenhado lá, por empréstimo",
    B.CAMPOS_NA_TELA_B.some((c) => c.id === "mrs_previo"),
    "⛔ ler ⛔ não é coletar — ⛔ e compor ⛔ não é mover"
  );
}

/* ══ ⚠️⚠️ 5 · OS ONZE `t4_*` ═════════════════════════════════════════ */
{
  const t4 = campos.filter((c) => c.id.startsWith("t4_"));
  conf(
    "⚠️ os ONZE itens da Table 4 continuam existindo",
    t4.length === 11,
    `⛔ ${t4.length} — ⛔ eles são itens de **déficit incapacitante**, ⛔ e ⛔ não descrição do exame`
  );
  conf(
    "⚠️ ⛔ e todos apontam para **F-17**",
    t4.every((c) => c.fonte === "F-17"),
    `⛔ ${t4.filter((c) => c.fonte !== "F-17").map((c) => c.id).join(" · ")}`
  );

  /**
   * ⚠️⚠️ ⛔ **⛔ NENHUMA INFERÊNCIA NOVA** — decisão do autor (**item 4**):
   * ⛔ *"⛔ Não fazer automaticamente `t4_* marcado → deficit_focal = sim`"*.
   * ⛔ São fatos diferentes, ⛔ e ⛔ ligá-los inventaria regra clínica.
   */
  const relogio = R.relogioControlado(4_000_000);
  const so = E.registrarFato(
    E.abrirAtendimento(relogio),
    { campo: "t4_afasia_grave", valor: "sim" },
    relogio
  );
  conf(
    "⚠️⚠️ marcar um `t4_*` ⛔ NÃO responde `deficit_focal`",
    E.valorAtual(so, "deficit_focal") === undefined,
    `⛔ ${JSON.stringify(E.valorAtual(so, "deficit_focal"))} — ⛔ são perguntas diferentes (**E-23**)`
  );
}

/* ══ ⚠️ 6 · DÉFICIT INCAPACITANTE ════════════════════════════════════ */
{
  const c = acha("incapacitante_assumido");
  conf(
    "⚠️ `incapacitante_assumido` continua na casa neurologico, ⛔ e ⛔ sem bloquear",
    c !== undefined && c.casa === "neurologico" && c.bloqueiaTerapia === false,
    `⛔ ${JSON.stringify(c && { casa: c.casa, bloqueia: c.bloqueiaTerapia })}`
  );

  /** ⚠️⚠️ ⛔ E ⛔ ele ⛔ NÃO se deduz do NIHSS — ⛔ decisão antiga do autor. */
  const relogio = R.relogioControlado(5_000_000);
  const alto = E.registrarFato(
    E.abrirAtendimento(relogio),
    { campo: "nihss_informado", valor: 22 },
    relogio
  );
  conf(
    "⚠️⚠️ NIHSS 22 ⛔ NÃO responde o déficit incapacitante",
    E.valorAtual(alto, "incapacitante_assumido") === undefined,
    "⛔ *\"déficit clinicamente relevante com NIHSS baixo continua sendo incapacitante\"* — ⛔ e o inverso ⛔ também ⛔ não se deduz"
  );
}

if (falhas > 0) {
  console.log(`\n❌ COMPOSIÇÃO DA FASE 4 — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ COMPOSIÇÃO DA FASE 4 — ${ok}/${ok} conferências · 5 fatos críticos`);
