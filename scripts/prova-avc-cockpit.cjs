#!/usr/bin/env node
/**
 * TRAVA DO COCKPIT — ⚠️ **progresso ⛔ NÃO é estado clínico**.
 *
 * PROMETE:
 *   · que *"concluir eixo"* seja **workflow**, ⛔ e ⛔ nunca fato clínico;
 *   · que concluir **⛔ não** torne o eixo favorável;
 *   · que eixo alterado **continue alterado** depois de concluído;
 *   · que reabrir **⛔ não apague ⛔ nada**;
 *   · que ⛔ **nenhuma derivação** leia o progresso.
 *
 * NÃO PROMETE: que a tela esteja bonita ⛔ nem que os cortes clínicos estejam
 *   certos — ⛔ isso é das provas de superfície ⛔ e do e2e.
 *
 * UNIVERSO: `avc/nucleo/estado.ts` × `avc/nucleo/ameacas-imediatas.ts`.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ISTO EXISTE PARA IMPEDIR ─────────────────────────
 *
 * > *"⛔ Nunca usar 'concluído' como sinônimo de 'normal'."* — autor, 2026-09-07
 *
 * ⛔ ⛔ É a tentação mais barata da tela: o médico marcou que avaliou, ⛔ então
 * pinta-se ✓ ⛔ e a lista fica limpa. ⚠️ ⛔ É a **mesma família** do defeito que
 * o autor apontou dois dias antes — ⛔ a PA 80/46 desenhada com ✓ —, ⛔ e ⛔ o
 * dano é o mesmo: o app afirmando ausência de problema que ⛔ ninguém afirmou.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cockpit-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "ameacas-imediatas.ts"),
    path.join(appDir, "avc", "nucleo", "problemas-ativos.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const nucleo = (f) => require(path.join(tmp, "avc", "nucleo", f));
const E = nucleo("estado.js");
const R = nucleo("relogio.js");
const A = nucleo("ameacas-imediatas.js");
const P = nucleo("problemas-ativos.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const relogio = R.relogioControlado(1_000_000);
const novo = () => E.abrirAtendimento(relogio);
const com = (e, campo, valor) => E.registrarFato(e, { campo, valor }, relogio);
const eixo = (e, id) => A.ameacasImediatas(e).find((x) => x.id === id);

/* ══ ⚠️ 1 · O ATENDIMENTO NASCE ⛔ SEM PROGRESSO ═══════════════════════ */
conf(
  "⚠️ atendimento novo ⛔ não tem eixo concluído — ⛔ e vazio ⛔ não é 'tudo normal'",
  Array.isArray(novo().eixosConcluidos) && novo().eixosConcluidos.length === 0,
  `⛔ ${JSON.stringify(novo().eixosConcluidos)}`
);

/* ══ ⚠️⚠️ 2 · CONCLUIR ⛔ NÃO ESCREVE FATO ═════════════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ A CONFERÊNCIA CENTRAL DESTE ARQUIVO. ⛔ Se *"concluí o B"* virasse
   * fato, ⛔ ele apareceria na **auditoria clínica** como se fosse achado — ⛔ e
   * a trilha é o que o app usa para dizer o que aconteceu com o paciente.
   */
  const antes = com(novo(), "hipoxia", "sim");
  const depois = E.concluirEixo(antes, "respiracao");
  conf(
    "⚠️⚠️ concluir um eixo ⛔ NÃO acrescenta ⛔ nenhum fato à trilha",
    JSON.stringify(depois.fatos) === JSON.stringify(antes.fatos),
    `⛔ ${antes.fatos.length} fato(s) antes · ${depois.fatos.length} depois — progresso ⛔ não é achado`
  );
  conf(
    "⚠️ ⛔ e o progresso fica registrado fora da trilha",
    depois.eixosConcluidos.includes("respiracao"),
    `⛔ ${JSON.stringify(depois.eixosConcluidos)}`
  );
  conf(
    "⚠️ concluir duas vezes ⛔ não duplica",
    E.concluirEixo(depois, "respiracao").eixosConcluidos.length === 1,
    "⛔ idempotente — ⛔ senão a lista cresce a cada toque"
  );
}

/* ══ ⚠️⚠️ 3 · CONCLUÍDO ⛔ NÃO É FAVORÁVEL ═════════════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ *"⛔ Nunca usar 'concluído' como sinônimo de 'normal'"* — ⛔ e ⛔ este
   * é o caso que o autor escreveu: **B avaliado, hipoxemia ativa**.
   */
  const e = E.concluirEixo(com(novo(), "hipoxia", "sim"), "respiracao");
  const b = eixo(e, "respiracao");
  conf(
    "⚠️⚠️ B **concluído** com hipoxemia continua **⛔ ameaça**",
    b.estado === "ameaca",
    `⛔ estado="${b.estado}" — concluir a avaliação ⛔ não trata o paciente`
  );
  conf(
    "⚠️ ⛔ e o problema ativo dele **⛔ não some** ao concluir",
    P.problemasAtivos(e).some((p) => p.id === "respiracao"),
    "⛔ o problema fecha quando o paciente melhora, ⛔ e ⛔ não quando o médico marca uma caixa"
  );

  /** ⚠️ ⛔ E o inverso: eixo ⛔ NÃO concluído com achado negativo é favorável. */
  const semAmeaca = com(novo(), "hipoxia", "nao");
  conf(
    "⚠️ ⛔ e um eixo **⛔ não concluído** já pode ser favorável",
    eixo(semAmeaca, "respiracao").estado === "sem_ameaca"
    && semAmeaca.eixosConcluidos.length === 0,
    "⛔ progresso ⛔ e estado clínico são **independentes** nos dois sentidos"
  );
}

/* ══ ⚠️⚠️ 4 · REABRIR ⛔ NÃO APAGA ⛔ NADA ═════════════════════════════ */
{
  const comDado = com(com(novo(), "hipoxia", "sim"), "spo2", 88);
  const concluido = E.concluirEixo(comDado, "respiracao");
  const reaberto = E.reabrirEixo(concluido, "respiracao");
  conf(
    "⚠️⚠️ reabrir preserva **todos** os fatos",
    JSON.stringify(reaberto.fatos) === JSON.stringify(comDado.fatos),
    `⛔ ${comDado.fatos.length} → ${reaberto.fatos.length} — a trilha é append-only (§3.1)`
  );
  conf(
    "⚠️ ⛔ e ⛔ só a marca de progresso sai",
    !reaberto.eixosConcluidos.includes("respiracao"),
    `⛔ ${JSON.stringify(reaberto.eixosConcluidos)}`
  );
  conf(
    "⚠️ ⛔ e o estado clínico ⛔ não muda ao reabrir",
    eixo(reaberto, "respiracao").estado === eixo(concluido, "respiracao").estado,
    "⛔ reabrir é gesto de tela — ⛔ ele ⛔ não toca no paciente"
  );
}

/* ══ ⚠️ 5 · UM EIXO ⛔ NÃO CONTAMINA OS OUTROS ════════════════════════ */
{
  const base = com(novo(), "glicemia", 48);
  const depois = E.concluirEixo(E.concluirEixo(base, "via_aerea"), "pressao");
  const antesDe = (e) => A.ameacasImediatas(e).map((x) => `${x.id}=${x.estado}`).join("|");
  conf(
    "⚠️ concluir A ⛔ e C ⛔ não altera o estado clínico de ⛔ nenhum eixo",
    antesDe(depois) === antesDe(base),
    `⛔ ${antesDe(base)}\n      ⛔ ${antesDe(depois)}`
  );
  conf(
    "⚠️ ⛔ e ⛔ nenhuma ordem é imposta: C conclui ⛔ sem A estar concluído",
    E.concluirEixo(novo(), "pressao").eixosConcluidos.includes("pressao"),
    "*\"se chegar um paciente com choque evidente, deve poder acessar C imediatamente\"*"
  );
}

/* ══ ⚠️⚠️ 6 · ⛔ NENHUMA DERIVAÇÃO LÊ O PROGRESSO ═════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ *"⛔ Não usar conclusão como entrada do motor"* — ⛔ e ⛔ esta é a
   * conferência que o impede. ⛔ Uma derivação que lesse `eixosConcluidos`
   * passaria a emitir conduta a partir de um **gesto de tela**.
   */
  const dir = path.join(appDir, "avc", "nucleo");
  const leem = fs.readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && f !== "estado.ts")
    .filter((f) => lerFonte(path.join(dir, f)).includes("eixosConcluidos"));
  conf(
    "⚠️⚠️ ⛔ NENHUMA derivação lê `eixosConcluidos`",
    leem.length === 0,
    `⛔ ${leem.join(" · ")} — conclusão é workflow, ⛔ e ⛔ nunca insumo de conduta`
  );
}

/* ══ ⚠️ 7 · O EIXO E, COMPLETO, ⛔ NÃO CRIA AMEAÇA ═══════════════════ */
{
  const e = E.concluirEixo(com(novo(), "temperatura", 39), "exposicao");
  conf(
    "⚠️ completar **E** ⛔ não cria ameaça, ⛔ nem concluído",
    eixo(e, "exposicao").estado === "medido"
    && P.problemasAtivos(e).every((p) => p.id !== "exposicao"),
    `⛔ estado="${eixo(e, "exposicao").estado}" — ⛔ sem corte transcrito, ⛔ o app ⛔ não julga`
  );
}

/* ══ ⚠️⚠️ A FRASE DO EIXO CONCLUÍDO ⛔ SEM DADO ════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ POR QUE ISTO TEM TRAVA PRÓPRIA ──────────────────────────────
   *
   * ⛔ Um eixo **concluído** ⛔ e **⛔ sem dado** mostrava *"⛔ Não avaliado"*
   * ⛔ e *"Avaliação concluída"* juntos, ⛔ e o autor pediu uma frase mais
   * clara (2026-09-07). ⚠️⚠️ ⛔ E ⛔ **é ⛔ exatamente aí que uma frase melhor
   * vira uma frase ⛔ falsa**.
   *
   * ⛔ *"⛔ Sem alterações"*, *"avaliado ⛔ sem achados"*, *"⛔ nada a relatar"* —
   * ⛔ ⛔ todas soam melhor, ⛔ e ⛔ **⛔ todas afirmam** algo sobre o paciente
   * que ⛔ ninguém afirmou. ⚠️ ⛔ É a mesma família do defeito da **PA 80/46
   * desenhada com ✓**, ⛔ que o autor apontou em 09-06 ⛔ e que ⛔ nenhuma
   * trava tinha pego.
   *
   * ⚠️ A frase legítima fala do **registro** — ⛔ e ⛔ não do paciente.
   */
  const tela = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));

  conf(
    "⚠️ a frase do eixo concluído ⛔ sem dado existe na tela",
    tela.includes("Sem dados clínicos registrados"),
    "⛔ ⛔ sem ela, o card volta a dizer '⛔ Não avaliado' ⛔ e 'Avaliação concluída' juntos"
  );

  /**
   * ⚠️ ⛔ As formulações que **afirmam ausência de alteração**. ⛔ Nenhuma pode
   * aparecer na tela do módulo.
   */
  const AFIRMAM = [
    /sem altera[çc]/i,
    /sem achado/i,
    /nada a relatar/i,
    /dentro da normalidade/i,
    /avaliado,? sem/i,
    /tudo (certo|normal|bem)/i,
  ];
  const encontradas = AFIRMAM.filter((r) => r.test(tela)).map((r) => String(r));
  conf(
    "⚠️⚠️ ⛔ NENHUMA frase afirma ausência de alteração",
    encontradas.length === 0,
    `⛔ ${encontradas.join(" · ")} — a frase pode falar do REGISTRO, ⛔ e ⛔ nunca do paciente (**E-23**)`
  );

  /**
   * ⚠️⚠️ ⛔ E O ESSENCIAL: ⛔ a troca é **⛔ só de palavra**. ⛔ O estado clínico
   * do eixo concluído ⛔ sem dado continua `nao_avaliado` no motor.
   */
  const concluidoVazio = E.concluirEixo(novo(), "via_aerea");
  conf(
    "⚠️⚠️ ⛔ e o MOTOR continua dizendo `nao_avaliado`",
    eixo(concluidoVazio, "via_aerea").estado === "nao_avaliado",
    `⛔ estado="${eixo(concluidoVazio, "via_aerea").estado}" — ⛔ a frase é apresentação, ⛔ e ⛔ não semântica`
  );
}

if (falhas > 0) {
  console.log(`\n❌ COCKPIT — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ COCKPIT — ${ok}/${ok} conferências · progresso ≠ estado clínico`);
