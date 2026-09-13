#!/usr/bin/env node
/**
 * PROVA — PERSISTÊNCIA LOCAL-FIRST DO ATENDIMENTO · AC-02 · D-PEND-02 · D-PEND-03.
 *
 * PROMETE: que o atendimento vira um LOG DE EVENTOS append-only atrás de uma
 * interface de armazenamento, e que dele se reconstrói o mesmo estado — fatos,
 * relógios, eixos, superfície e a trombólise registrada (A13); que um toque
 * duplo abre UMA administração, com ID de evento (A17); que dado novo cria nova
 * versão da conclusão e preserva a anterior (A14); que a correção de um fato é
 * nova versão com autor e motivo, sem sobrescrever; que a segunda abertura do
 * mesmo caso no mesmo dispositivo é recusada (D-PEND-03); que o schema tem
 * número de versão e migra v1 → v2 a partir de dados gravados por v1; que o
 * rascunho mora separado do fato confirmado; e que cada fato leva horário
 * observado e horário registrado.
 * NÃO PROMETE: persistência no navegador de verdade (isso é o e2e), cota,
 * sobrevivência a limpeza de dados, backup ou sincronização — ver
 * `docs/avc/persistencia.md`.
 * UNIVERSO: `avc/persistencia/*.ts`, `avc/nucleo/{estado,instancia}.ts`.
 * FONTE: `docs/decisoes.md` D-PEND-02 e D-PEND-03; `docs/spec-avc.md` p.11 e A13,
 * A14, A17.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { lerFonte } = require("./lib/fonte.cjs");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "persistencia-"));
const alvos = [
  ["avc", "persistencia", "tipos.ts"],
  ["avc", "persistencia", "log.ts"],
  ["avc", "persistencia", "armazenamento-memoria.ts"],
  ["avc", "persistencia", "trava.ts"],
  ["avc", "nucleo", "estado.ts"],
  ["avc", "nucleo", "relogio.ts"],
  ["avc", "nucleo", "instancia.ts"],
  ["avc", "nucleo", "derivacoes-f.ts"],
  ["avc", "nucleo", "populacao.ts"],
  ["avc", "conteudo", "campos.ts"],
  ["avc", "conteudo", "campo.ts"],
  ["avc", "conteudo", "superficie-f.ts"],
].map((p) => path.join(appDir, ...p)).filter((p) => fs.existsSync(p));
execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...alvos],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
function carregar(nome, ...p) {
  try { return emT(...p); } catch (e) {
    conf(`${nome} existe`, false, `⛔ ${String(e && e.message).slice(0, 120)}`);
    return undefined;
  }
}

const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const DF = emT("avc", "nucleo", "derivacoes-f.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const T = carregar("avc/persistencia/tipos.ts", "avc", "persistencia", "tipos.js");
const LOG = carregar("avc/persistencia/log.ts", "avc", "persistencia", "log.js");
const MEM = carregar("avc/persistencia/armazenamento-memoria.ts", "avc", "persistencia", "armazenamento-memoria.js");
const TR = carregar("avc/persistencia/trava.ts", "avc", "persistencia", "trava.js");
const pronto = T && LOG && MEM && TR;

(async () => {
  const T0 = 1_800_000_000_000;
  const rel = R.relogioControlado(T0);
  const AUTOR = "local:prova";
  let seq = 0;
  let idN = 0;
  const ctx = () => ({ casoId: "caso-1", autor: AUTOR, agora: rel.agora(), proximoSeq: () => ++seq, gerarId: () => `ev-${++idN}` });

  /* ══ A13 · o log reconstrói o estado, com a trombólise registrada ═════════ */
  if (pronto) {
    const arm = MEM.criarArmazenamentoEmMemoria();
    let estado = E.abrirAtendimento(rel);
    await arm.anexarEventos("caso-1", LOG.eventosDeAbertura(estado, ctx()));
    const passo = async (proximo) => {
      await arm.anexarEventos("caso-1", LOG.eventosDaTransicao(estado, proximo, ctx()));
      estado = proximo;
    };
    const opc = (e, campo, rotulo) => E.registrarFato(e, { campo, valor: CAMPO.valorDaOpcao(rotulo) }, rel);
    await passo(opc(estado, "faixa_etaria", "18 anos ou mais"));
    await passo(opc(estado, "gestacao_puerperio", "Não gestante e não puérpera"));
    await passo(E.registrarFato(estado, { campo: "peso", valor: 70 }, rel));
    await passo(I.abrirNovaInstancia(estado, SF.TROMBOLISE_IV, rel));
    const inst = I.instanciasDe(estado, SF.TROMBOLISE_IV)[0];
    await passo(CAMPOS.registrarComInstancia(estado, { campo: "ivt_estado", valor: "Realizada" }, rel, inst));
    await passo(CAMPOS.registrarComInstancia(estado, { campo: "ivt_inicio", valor: T0 - 60_000 }, rel, inst));
    await passo(E.concluirEixo(estado, "respiracao"));
    await passo(E.verSuperficie(estado, "destino"));

    const rec = LOG.reconstruirEstado(await arm.lerEventos("caso-1"));
    conf("A13 · os fatos voltam iguais, na mesma ordem", JSON.stringify(rec.fatos) === JSON.stringify(estado.fatos), `⛔ ${rec.fatos.length} × ${estado.fatos.length}`);
    conf("A13 · relógios, eixos, superfície e abertura voltam iguais",
      JSON.stringify([rec.abertoEm, rec.relogiosClinicos, rec.eixosConcluidos, rec.superficieVista])
      === JSON.stringify([estado.abertoEm, estado.relogiosClinicos, estado.eixosConcluidos, estado.superficieVista]), "⛔");
    conf("A13 · a trombólise registrada continua EXPOSTA depois de reabrir", DF.exposicaoAoTrombolitico(rec).estado === "exposta", `⛔ ${DF.exposicaoAoTrombolitico(rec).estado}`);
    conf("A13 · ⛔ nenhuma administração duplicada ao reabrir", DF.administracoesRegistradas(rec) === 1, `⛔ ${DF.administracoesRegistradas(rec)}`);
    const eventos = await arm.lerEventos("caso-1");
    conf("A13 · cada fato leva horário registrado ⛔ e o observado quando houver",
      eventos.filter((e) => e.tipo === "fato").every((e) => typeof e.registradoEm === "number" && "observadoEm" in e), "⛔");
    conf("A13 · a interface ⛔ não permite reescrever: anexar o mesmo ID de novo ⛔ duplica nada",
      await (async () => { const a = eventos.length; await arm.anexarEventos("caso-1", [eventos[1]]); return (await arm.lerEventos("caso-1")).length === a; })(), "⛔");
    conf("A13 · recuperação: o caso mais recente ⛔ não encerrado", (await arm.casoMaisRecenteNaoEncerrado()) === "caso-1", "⛔");
    await arm.encerrarCaso("caso-1", rel.agora());
    conf("A13 · encerrado, ⛔ não é recuperado", (await arm.casoMaisRecenteNaoEncerrado()) === undefined, "⛔");
  }

  /* ══ A17 · toque duplo abre UMA administração, com ID de evento ═══════════ */
  if (pronto) {
    const e0 = E.abrirAtendimento(rel);
    const e1 = I.abrirNovaInstancia(e0, SF.TROMBOLISE_IV, rel);
    const e2 = I.abrirNovaInstancia(e1, SF.TROMBOLISE_IV, rel);
    conf("A17 · o segundo toque ⛔ não abre outra instância", e2 === e1 && I.instanciasDe(e2, SF.TROMBOLISE_IV).length === 1, `⛔ ${I.instanciasDe(e2, SF.TROMBOLISE_IV).length}`);
    const evs = LOG.eventosDaTransicao(e0, e2, ctx());
    conf("A17 · um evento, com ID", evs.filter((e) => e.tipo === "fato").length === 1 && typeof evs[0].id === "string" && evs[0].id.length > 0, `⛔ ${JSON.stringify(evs)}`);
  }

  /* ══ A14 · dado novo: nova versão da conclusão, a anterior preservada ═════ */
  if (pronto) {
    const arm = MEM.criarArmazenamentoEmMemoria();
    let estado = E.abrirAtendimento(rel);
    await arm.anexarEventos("caso-2", LOG.eventosDeAbertura(estado, { ...ctx(), casoId: "caso-2" }));
    const passo = async (proximo) => {
      await arm.anexarEventos("caso-2", LOG.eventosDaTransicao(estado, proximo, { ...ctx(), casoId: "caso-2" }));
      estado = proximo;
    };
    await passo(E.registrarFato(estado, { campo: "faixa_etaria", valor: CAMPO.valorDaOpcao("18 anos ou mais") }, rel));
    await passo(E.registrarFato(estado, { campo: "gestacao_puerperio", valor: CAMPO.valorDaOpcao("Não gestante e não puérpera") }, rel));
    const versoes = LOG.versoesDaConclusao(await arm.lerEventos("caso-2"), "populacao");
    conf("A14 · duas versões da conclusão de população, na ordem", versoes.length === 2 && versoes[0].valor === "pergunta_pendente" && versoes[1].valor === "adulto_validado", `⛔ ${JSON.stringify(versoes)}`);
    conf("A14 · a versão anterior ⛔ foi preservada com o seu evento", versoes.length === 2 && versoes[0].eventoId !== versoes[1].eventoId && versoes[0].versao === 1, "⛔");
    conf("A14 · conclusão persistida é HISTÓRICO: ⛔ a reconstrução ⛔ não a lê como fato",
      LOG.reconstruirEstado(await arm.lerEventos("caso-2")).fatos.every((f) => !String(f.campo).startsWith("conclusao")), "⛔");
  }

  /* ══ Correção: nova versão com autor e motivo, ⛔ sem sobrescrever ═════════ */
  if (pronto) {
    const e0 = E.abrirAtendimento(rel);
    const e1 = E.registrarFato(e0, { campo: "peso", valor: 70 }, rel);
    const alvo = e1.fatos[e1.fatos.length - 1];
    const e2 = E.corrigirFato(e1, { campo: "peso", valor: 80, corrigeFatoId: alvo.id, motivo: "Peso conferido na balança" }, rel);
    const evs = LOG.eventosDaTransicao(e1, e2, ctx());
    const ev = evs.find((e) => e.tipo === "fato");
    conf("correção vira evento próprio com autor ⛔ e motivo", ev !== undefined && ev.autor === AUTOR && ev.dados.fato.motivo === "Peso conferido na balança" && ev.dados.fato.corrigeFatoId === alvo.id, `⛔ ${JSON.stringify(ev)}`);
    const recon = LOG.reconstruirEstado([...LOG.eventosDeAbertura(e0, ctx()), ...LOG.eventosDaTransicao(e0, e1, ctx()), ...evs]);
    conf("⛔ o valor anterior continua na trilha", recon.fatos.some((f) => f.valor === 70) && E.valorAtual(recon, "peso").valor === 80, "⛔");
    /**
     * ⚠️ Motivo AUSENTE ⛔ não é motivo inventado: `corrigirFato` registra a decisão do
     * autor de 2026-08-30 de ⛔ não exigir motivo. O log ⛔ recusa nada ⛔ e ⛔ preenche
     * nada — ⛔ e o autor continua sendo gravado. (Conflito com "com autor e motivo"
     * da instrução de 2026-09-13: registrado como achado para o autor decidir.)
     */
    const semMotivo = LOG.eventosDaTransicao(e1, E.corrigirFato(e1, { campo: "peso", valor: 81, corrigeFatoId: alvo.id }, rel), ctx())
      .find((e) => e.tipo === "fato");
    conf("correção ⛔ sem motivo: autor gravado, motivo ausente, ⛔ nada inventado",
      semMotivo !== undefined && semMotivo.autor === AUTOR && semMotivo.dados.fato.motivo === undefined,
      `⛔ ${JSON.stringify(semMotivo)}`);
  }

  /* ══ ORDEM DE GRAVAÇÃO · quem atribui `seq` é o armazenamento, no append ══ */
  if (pronto) {
    const arm = MEM.criarArmazenamentoEmMemoria();
    const e0 = E.abrirAtendimento(rel);
    const e1 = E.registrarFato(e0, { campo: "peso", valor: 70 }, rel);
    const alvo = e1.fatos[e1.fatos.length - 1];
    const e2 = E.corrigirFato(e1, { campo: "peso", valor: 80, corrigeFatoId: alvo.id, motivo: "Peso conferido na balança" }, rel);
    const c = { ...ctx(), casoId: "caso-ordem" };
    /** ⚠️ Produzidos FORA de ordem: a correção nasce antes do fato que ela corrige. */
    const evCorrecao = LOG.eventosDaTransicao(e1, e2, c);
    const evAbertura = LOG.eventosDeAbertura(e0, c);
    const evFato = LOG.eventosDaTransicao(e0, e1, c);
    conf("ordem · o produtor ⛔ não atribui ordem: evento produzido ⛔ não tem `seq`",
      [...evCorrecao, ...evAbertura, ...evFato].every((e) => !("seq" in e)),
      `⛔ seq do produtor: ${JSON.stringify([...evCorrecao, ...evAbertura, ...evFato].map((e) => e.seq))}`);
    await arm.anexarEventos("caso-ordem", evAbertura);
    await arm.anexarEventos("caso-ordem", evFato);
    await arm.anexarEventos("caso-ordem", evCorrecao);
    const gravados = await arm.lerEventos("caso-ordem");
    conf("ordem · o armazenamento atribui `seq` no append, na ordem de gravação (1, 2, 3…)",
      gravados.every((e, i) => e.seq === i + 1),
      `⛔ ${JSON.stringify(gravados.map((e) => [e.tipo, e.seq]))}`);
    const recOrdem = LOG.reconstruirEstado(gravados);
    conf("ordem · a reconstrução segue a gravação: 70, depois a correção para 80",
      recOrdem.fatos.map((f) => f.valor).join(",") === "70,80" && E.valorAtual(recOrdem, "peso").valor === 80,
      `⛔ ${recOrdem.fatos.map((f) => f.valor).join(",")}`);
  }

  /* ══ Correção ⛔ sem motivo: VISÍVEL na linha do tempo ════════════════════ */
  if (pronto) {
    const inst = I.nomeDaInstancia("glicemia", 1);
    let semM = CAMPOS.registrarComInstancia(E.abrirAtendimento(rel), { campo: "glicemia", valor: 96 }, rel, inst);
    semM = CAMPOS.corrigirNaInstancia(semM, { campo: "glicemia", valor: 69 }, rel, inst);
    const linhaSem = I.historicoDeAfericoes(semM, "glicemia")[0]?.valores.find((v) => v.campo === "glicemia");
    conf("linha do tempo · correção ⛔ sem motivo é marcada como tal (`motivoDaCorrecao === null`)",
      linhaSem !== undefined && linhaSem.valorOriginal === 96 && linhaSem.motivoDaCorrecao === null,
      `⛔ ${JSON.stringify(linhaSem)}`);
    let comM = CAMPOS.registrarComInstancia(E.abrirAtendimento(rel), { campo: "glicemia", valor: 96 }, rel, inst);
    comM = CAMPOS.corrigirNaInstancia(comM, { campo: "glicemia", valor: 69, motivo: "Erro de digitação" }, rel, inst);
    const linhaCom = I.historicoDeAfericoes(comM, "glicemia")[0]?.valores.find((v) => v.campo === "glicemia");
    conf("linha do tempo · correção com motivo traz o motivo",
      linhaCom !== undefined && linhaCom.motivoDaCorrecao === "Erro de digitação",
      `⛔ ${JSON.stringify(linhaCom)}`);
    const telaA = lerFonte(path.join(appDir, "components", "avc", "superficie-a.tsx"));
    conf("linha do tempo · a tela escreve «sem motivo informado», ⛔ e ⛔ não silêncio",
      /sem motivo informado/.test(telaA) && /motivoDaCorrecao/.test(telaA),
      "⛔ components/avc/superficie-a.tsx não mostra o motivo da correção");

    /**
     * ⚠️ O gesto REAL de correção mora no Laboratório ⛔ e na Imagem ("Corrigir
     * resultado"): a leitura do campo corrigido tem de dizer o valor substituído
     * ⛔ e o motivo — ou "sem motivo informado".
     */
    const col = "coleta-1";
    let lab = CAMPOS.registrarComInstancia(E.abrirAtendimento(rel), { campo: "inr", valor: 1.4 }, rel, col);
    conf("leitura · valor ⛔ nunca corrigido ⛔ não mostra linha de correção",
      I.correcaoNaInstancia(lab, col, "inr") === undefined, "⛔ linha de correção sem correção");
    lab = CAMPOS.corrigirNaInstancia(lab, { campo: "inr", valor: 1.5 }, rel, col);
    const cSem = I.correcaoNaInstancia(lab, col, "inr");
    conf("leitura · correção ⛔ sem motivo: valor substituído 1,4 ⛔ e motivo `null`",
      cSem !== undefined && cSem.valorOriginal === 1.4 && cSem.motivo === null, `⛔ ${JSON.stringify(cSem)}`);
    const labCom = CAMPOS.corrigirNaInstancia(lab, { campo: "inr", valor: 1.6, motivo: "Laudo reemitido" }, rel, col);
    const cCom = I.correcaoNaInstancia(labCom, col, "inr");
    conf("leitura · correção com motivo traz o motivo ⛔ e o valor que ela substituiu",
      cCom !== undefined && cCom.valorOriginal === 1.5 && cCom.motivo === "Laudo reemitido", `⛔ ${JSON.stringify(cCom)}`);
    for (const arq of ["campos-clinicos.tsx", path.join("ui", "index.tsx")]) {
      const t = lerFonte(path.join(appDir, "components", "avc", arq));
      conf(`leitura · ${arq} escreve «sem motivo informado» na linha de correção`,
        /sem motivo informado/.test(t) && /avc-correcao-/.test(t), `⛔ ${arq}`);
    }
    for (const arq of ["superficie-laboratorio.tsx", "superficie-c.tsx"]) {
      const t = lerFonte(path.join(appDir, "components", "avc", arq));
      conf(`leitura · ${arq} entrega a correção vigente à leitura`,
        /correcao=\{correcaoNaInstancia\(/.test(t), `⛔ ${arq}`);
    }
  }

  /* ══ D-PEND-03 · segunda abertura do mesmo caso, no mesmo dispositivo ═════ */
  if (pronto) {
    const travas = TR.criarRegistroDeTravasEmMemoria();
    const t1 = await travas.adquirir("avc:caso-1");
    const t2 = await travas.adquirir("avc:caso-1");
    conf("a primeira abertura adquire a trava", t1 !== undefined, "⛔");
    conf("⛔ a segunda abertura do MESMO caso é recusada", t2 === undefined, "⛔ duas abas escreveriam o mesmo log");
    await t1.liberar();
    conf("liberada a trava, o caso abre de novo", (await travas.adquirir("avc:caso-1")) !== undefined, "⛔");
    conf("existe o aviso para a aba bloqueada", typeof TR.MENSAGEM_CASO_ABERTO_EM_OUTRA_ABA === "string" && /outra aba/i.test(TR.MENSAGEM_CASO_ABERTO_EM_OUTRA_ABA), `⛔ ${TR.MENSAGEM_CASO_ABERTO_EM_OUTRA_ABA}`);
  }

  /* ══ Schema versionado · migração v1 → v2 com dados gravados por v1 ═══════ */
  if (pronto) {
    conf("o schema declara número de versão 3 (AC-40: origem do autor)", T.VERSAO_DO_SCHEMA === 3, `⛔ ${T.VERSAO_DO_SCHEMA}`);
    const v1 = {
      casos: [{ casoId: "caso-v1", abertoEm: T0, encerradoEm: null }],
      eventos: [
        { id: "v1-a", casoId: "caso-v1", seq: 1, tipo: "caso_aberto", registradoEm: T0, dados: { abertoEm: T0, relogiosClinicos: { t0_operacional: T0 }, superficieVista: "paciente", eixosConcluidos: [] } },
        { id: "v1-b", casoId: "caso-v1", seq: 2, tipo: "fato", registradoEm: T0 + 1, dados: { fato: { id: "f1", campo: "peso", valor: 70, horaRegistro: T0 + 1 } } },
      ],
    };
    const migrados = v1.eventos.map(T.migrarEventoDeV1);
    conf("v1 → schema atual: todo evento ganha versão do schema ⛔ e autor declarado", migrados.every((e) => e.versaoDoSchema === T.VERSAO_DO_SCHEMA && typeof e.autor === "string" && e.autor.length > 0), `⛔ ${JSON.stringify(migrados)}`);
    conf("v1 → schema atual: ⛔ nenhum dado clínico muda na migração", JSON.stringify(migrados.map((e) => e.dados)) === JSON.stringify(v1.eventos.map((e) => e.dados)), "⛔");
    const arm = MEM.criarArmazenamentoEmMemoria({ dumpV1: v1 });
    const recV1 = LOG.reconstruirEstado(await arm.lerEventos("caso-v1"));
    conf("dados gravados por v1 são recuperados no schema atual", E.valorAtual(recV1, "peso")?.valor === 70 && (await arm.casoMaisRecenteNaoEncerrado()) === "caso-v1", "⛔");
  }

  /* ══ Rascunho separado de fato confirmado ═════════════════════════════════ */
  if (pronto) {
    const arm = MEM.criarArmazenamentoEmMemoria();
    const e0 = E.abrirAtendimento(rel);
    await arm.anexarEventos("caso-3", LOG.eventosDeAbertura(e0, { ...ctx(), casoId: "caso-3" }));
    const antes = (await arm.lerEventos("caso-3")).length;
    await arm.gravarRascunho({ casoId: "caso-3", chave: "nihss_escala", valor: { "1a": 1 }, atualizadoEm: T0 });
    conf("rascunho ⛔ não vira evento", (await arm.lerEventos("caso-3")).length === antes, "⛔");
    conf("rascunho é lido à parte", (await arm.lerRascunhos("caso-3")).length === 1, "⛔");
    conf("⛔ a reconstrução ignora o rascunho", LOG.reconstruirEstado(await arm.lerEventos("caso-3")).fatos.length === 0, "⛔");
  }

  console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA DE PERSISTÊNCIA DO ATENDIMENTO — ${ok} verde(s) · ${falhas} vermelho(s)`);
  process.exit(falhas === 0 ? 0 : 1);
})();
