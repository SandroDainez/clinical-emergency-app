#!/usr/bin/env node
/**
 * PROMETE: que a Superfície G traga **⛔ só o que a fonte sustenta**, que
 *   autoridade de recomendação ⛔ não seja fabricada, e — acima de tudo — que
 *   **⛔ NENHUM fato operacional de G alcance a avaliação clínica da F**.
 *
 * NÃO PROMETE: que os destinos sejam clinicamente completos. ⛔ Eles ⛔ não são:
 *   a fonte auditada traz **um** destino graduado ⛔ e **uma** linha de tabela.
 *   Transferência e regulação ⛔ não existem aqui de propósito.
 *
 * UNIVERSO: `avc/conteudo/superficie-g.ts` e `avc/nucleo/derivacoes-g.ts`,
 *   CARREGADOS E EXECUTADOS; mais `avc/nucleo/derivacoes-f.ts` — lido SEM
 *   COMENTÁRIO (R-92) **e executado** com estado real, porque a barreira G → F
 *   é comportamento, ⛔ e ⛔ não texto.
 *
 * ── ⚠️⚠️ A PONTE QUE ESTA TRAVA EXISTE PARA IMPEDIR ─────────────────────────
 *
 * ⛔ *"⛔ Não há centro EVT aqui"* satisfazendo *"cannot receive EVT"* faria o
 * app **recomendar trombólise estendida por geografia**. F-31 permanece aberta,
 * ⛔ e ⛔ nada em G a fecha.
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-g-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", path.join(appDir, "avc"), "--moduleResolution", "node",
  "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"),
  path.join(appDir, "avc", "conteudo", "campo.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
], { cwd: appDir, stdio: "pipe" });

const G = require(path.join(tmp, "conteudo", "superficie-g.js"));
const DG = require(path.join(tmp, "nucleo", "derivacoes-g.js"));
const DF = require(path.join(tmp, "nucleo", "derivacoes-f.js"));
const E = require(path.join(tmp, "nucleo", "estado.js"));
const CAMPO = require(path.join(tmp, "conteudo", "campo.js"));
const SF = require(path.join(tmp, "conteudo", "superficie-f.js"));
const SA = require(path.join(tmp, "conteudo", "superficie-a.js"));
/** ⚠️ O tipo de instância vem do CONTEÚDO — ⛔ e ⛔ não escrito à mão aqui. */
const TROMB = SF.TROMBOLISE_IV;

const fonteF = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"));
const fonteAF = lerFonte(path.join(appDir, "avc", "nucleo", "apresentacao-f.ts"));
const fonteG = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"));
const fonteTela = lerFonte(path.join(appDir, "components", "avc", "superficie-g.tsx"));

/** ⚠️ Estado gravado como a TELA grava — ⛔ o rótulo ⛔ nunca chega ao estado. */
function com(fatos) {
  let e = E.estadoInicial ? E.estadoInicial() : { fatos: [] };
  for (const [campo, valor, instancia] of fatos) {
    const gravado = typeof valor === "string" ? CAMPO.valorDaOpcao(valor) : valor;
    e = {
      ...e,
      fatos: [...e.fatos, { id: String(e.fatos.length + 1), campo, valor: gravado, instancia }],
    };
  }
  return e;
}

/** ⚠️ Uma instância da ação de trombólise — ⛔ o `instancia` é campo do FATO. */
const INST = (n) => `${TROMB}_${n}`;

// ── ⚠️ 0 · O UNIVERSO EXISTE (R-1) ───────────────────────────────────────
confere("há catálogo, regras e fatos operacionais a conferir",
  G.DESTINOS_RECOMENDADOS.length > 0 && G.REGRAS_DE_DESTINO.length > 0
  && G.FATOS_OPERACIONAIS.length === 3,
  "⛔ trava que roda sobre lista vazia fica verde sem medir nada");

// ══ ⚠️⚠️ 1 · A BARREIRA G → F ═════════════════════════════════════════════
{
  /**
   * ⚠️⚠️ A PROVA QUE IMPORTA É **COMPORTAMENTAL**.
   *
   * ⛔ Conferir que o texto de F ⛔ não cita os ids pega o descuido; ⛔ não pega
   * o caminho indireto. ⚠️ Preencher TODOS os fatos operacionais ⛔ e exigir que
   * as leituras da F sejam **idênticas** às do estado vazio pega qualquer
   * caminho, direto ou não.
   */
  const vazio = com([]);
  const todosPreenchidos = com(G.IDS_OPERACIONAIS.map((id) => [id, "Não"]));

  confere("⚠️⚠️ preencher TODO o contexto operacional ⛔ NÃO muda ⛔ NADA na F",
    JSON.stringify(DF.recomendacoesDoEstado(todosPreenchidos)) ===
      JSON.stringify(DF.recomendacoesDoEstado(vazio)),
    "⛔ é a fronteira inteira: geografia ⛔ não pode virar critério clínico");

  const comSim = com(G.IDS_OPERACIONAIS.map((id) => [id, "Sim"]));
  confere("⚠️⚠️ ⛔ e responder SIM ⛔ também ⛔ não muda",
    JSON.stringify(DF.recomendacoesDoEstado(comSim)) ===
      JSON.stringify(DF.recomendacoesDoEstado(vazio)),
    "⛔ a barreira ⛔ não pode valer só para um dos lados da resposta");

  /** ⚠️⚠️ E o insumo travado por F-31 segue `undefined` — ⛔ com tudo respondido. */
  confere("⚠️⚠️ F-31 continua ABERTA ⛔ com o contexto operacional inteiro preenchido",
    DF.valorDoInsumo(todosPreenchidos, "nao_elegivel_a_evt") === undefined
    && DF.valorDoInsumo(comSim, "nao_elegivel_a_evt") === undefined,
    "⛔ 'cannot receive EVT' ⛔ não se satisfaz por ausência de recurso — F-03 §12");

  const travadas = DF.recomendacoesDoEstado(todosPreenchidos)
    .filter((r) => r.correspondencia === "nao_avaliavel");
  confere("⚠️ ⛔ e as recomendações travadas por F-31 seguem ⛔ NÃO AVALIÁVEIS",
    travadas.length === 2 && travadas.every((r) => r.travadaPor === "F-31"),
    "⛔ destravá-las por disponibilidade é o defeito que esta trava nasceu para impedir");

  /** ⚠️ A conferência de texto continua — ela pega o descuido mais cedo. */
  confere("⚠️ ⛔ nenhum id operacional aparece nas derivações da F",
    G.IDS_OPERACIONAIS.every((id) => !fonteF.includes(id) && !fonteAF.includes(id)),
    "⛔ citar o id já é a ponte meio construída");

  /**
   * ⚠️⚠️ A BARREIRA É **DIRECIONAL**, ⛔ e ⛔ não uma proibição de import.
   *
   * ⚠️ G **lê** de F a ação de trombólise — é exatamente o que o autor pediu, ⛔ e
   * reimplementar a leitura aqui daria duas verdades sobre o mesmo fato (I6).
   * ⛔ O que ⛔ não pode existir é o caminho **inverso**, ⛔ e ele é provado por
   * execução mais acima.
   *
   * ⚠️⚠️ E há um segundo limite: G lê a **ação**, ⛔ e ⛔ NÃO a correspondência
   * clínica. ⛔ Deixar G consumir `recomendacoesDoEstado` faria o destino
   * depender da indicação — ⛔ e uma recomendação aplicável ⛔ não é uma infusão
   * correndo.
   */
  confere("⚠️⚠️ G lê a AÇÃO de F, ⛔ e ⛔ NÃO a correspondência clínica",
    /acoesDeTrombolise/.test(fonteG)
    && !/recomendacoesDoEstado|valorDoInsumo|correspondenciaDe|leiturasDasRecomendacoes/.test(fonteG),
    "⛔ destino que depende da indicação confunde 'deveria receber' com 'recebeu'");

  confere("⚠️ todo fato operacional declara que gera NO MÁXIMO indisponibilidade",
    G.FATOS_OPERACIONAIS.every((f) => f.geraNoMaximo === "indisponibilidade_operacional"),
    "⛔ o teto é declarado no dado — 'não indicado' ⛔ não é um valor possível");

  confere("⚠️ ⛔ e a leitura ⛔ NÃO admite outro rótulo para a ausência",
    DG.contextoOperacional(todosPreenchidos)
      .every((l) => l.quandoAusente === "indisponibilidade_operacional"),
    "⛔ um único rótulo possível impede a tela de chamar isso de contraindicação");

  /**
   * ⚠️⚠️ O QUE SE PROÍBE É A **AFIRMAÇÃO**, ⛔ e ⛔ NÃO A PALAVRA.
   *
   * ⚠️ A primeira versão varria o arquivo inteiro ⛔ e reprovava a nota *"⛔ Não
   * torna o paciente inelegível"* — que é exatamente a frase que o médico
   * precisa ler. ⛔ Proibir a palavra proibiria a negação dela junto.
   *
   * ⚠️ Então a conferência mede os campos que a tela renderiza como **afirmação**
   * (rótulo, texto, população, verbo, teto do fato), ⛔ e ⛔ não a prosa
   * explicativa, cuja função é justamente negar.
   */
  const afirmacoes = [
    ...G.DESTINOS_RECOMENDADOS.flatMap((d) => [d.rotulo, d.verbo, d.populacao]),
    ...G.REGRAS_DE_DESTINO.flatMap((r) => [r.texto, r.populacao]),
    ...G.FATOS_OPERACIONAIS.flatMap((f) => [f.rotulo, f.geraNoMaximo]),
    G.LACUNA_POS_EVT.texto,
  ].join(" | ");
  confere("⚠️⚠️ ⛔ NENHUMA afirmação de G diz 'inelegível' ⛔ ou 'contraindicad'",
    !/inelegív|contraindicad|não indicad/i.test(afirmacoes),
    "⛔ ausência de recurso ⛔ não é veredito clínico");

  /** ⚠️⚠️ ⛔ E a DERIVAÇÃO ⛔ não produz esse vocabulário por caminho ⛔ nenhum. */
  confere("⚠️⚠️ ⛔ e a derivação de G ⛔ NÃO produz veredito de elegibilidade",
    !/inelegív|contraindicad|elegiv|elegív/i.test(fonteG),
    "⛔ a palavra na derivação é o veredito a um passo de existir");
}

// ══ ⚠️⚠️ 2 · AUTORIDADE ⛔ NÃO SE FABRICA ══════════════════════════════════
{
  confere("⚠️⚠️ TODO destino recomendado tem COR ⛔ E LOE da fonte",
    G.DESTINOS_RECOMENDADOS.every((d) =>
      typeof d.cor === "string" && d.cor.length > 0
      && typeof d.loe === "string" && d.loe.length > 0
      && typeof d.verbo === "string" && d.verbo.length > 0),
    "⛔ destino sem grau ⛔ não é deste tipo — é RegraOperacional");

  confere("⚠️⚠️ TODA regra operacional declara `cor: null` ⛔ e `loe: null`",
    G.REGRAS_DE_DESTINO.every((r) => r.cor === null && r.loe === null
      && r.semGrauNaFonte === true),
    "⛔ E-48: a Table 7 ⛔ não carrega COR/LOE, ⛔ e inventar grau falsifica a fonte");

  confere("⚠️⚠️ `null` é EXPLÍCITO, ⛔ e ⛔ não campo ausente",
    G.REGRAS_DE_DESTINO.every((r) => "cor" in r && "loe" in r),
    "⛔ campo ausente ⛔ não distingue 'a fonte ⛔ não deu' de '⛔ ninguém preencheu'");

  confere("⚠️ a monitorização ⛔ também declara a ausência de grau",
    G.MONITORIZACAO_POS_IVT.cor === null && G.MONITORIZACAO_POS_IVT.loe === null
    && G.MONITORIZACAO_POS_IVT.semGrauNaFonte === true,
    "⛔ ela é Table 7 — ⛔ mesma tabela, ⛔ mesma ausência de autoridade");

  confere("⚠️⚠️ ⛔ NENHUM id vive nas duas listas",
    G.DESTINOS_RECOMENDADOS.every((d) => !G.REGRAS_DE_DESTINO.some((r) => r.id === d.id)),
    "⛔ o mesmo enunciado com e sem grau é contagem dupla de autoridade");

  /** ⚠️⚠️ O "ou" da fonte — ⛔ e ⛔ não "UTI obrigatória". */
  const internacao = G.REGRAS_DE_DESTINO.find((r) => r.id === "internacao_para_monitorizacao");
  confere("⚠️⚠️ o \"OU\" da Table 7 é PRESERVADO",
    /\bOU\b/.test(internacao.texto) && !/obrigat/i.test(internacao.texto),
    "⛔ *\"intensive care OR stroke unit\"* — exigir UTI pediria recurso mais escasso que o enunciado");
}

// ══ ⚠️⚠️ 3 · ⛔ SÓ O QUE A FONTE SUSTENTA ══════════════════════════════════
{
  const tudo = JSON.stringify([...G.DESTINOS_RECOMENDADOS, ...G.REGRAS_DE_DESTINO]);
  confere("⚠️⚠️ ⛔ G ⛔ NÃO INVENTA transferência ⛔ nem regulação",
    !/transfer|regula|encaminha|centro ideal|capacidade obrigat/i.test(tudo),
    "⛔ a fonte auditada ⛔ não traz recomendação de transferência — ela nascerá em slot próprio");

  confere("⚠️ ⛔ e ⛔ não inventa destino pós-EVT ⛔ nem permanência",
    !/pós-EVT|pos_evt|permanência|permanencia/i.test(tudo),
    "⛔ a fonte ⛔ não publica tabela pós-EVT — copiar por analogia é o que E-31 proíbe");

  confere("⚠️ todo destino aponta um slot que existe",
    [...G.DESTINOS_RECOMENDADOS, ...G.REGRAS_DE_DESTINO]
      .every((d) => /^F-\d+$/.test(d.slot) && d.localizacao.length > 8),
    "⛔ E-30: a fonte é propriedade da afirmação");
}

// ══ ⚠️⚠️ 4 · A LACUNA PÓS-EVT ═════════════════════════════════════════════
{
  confere("⚠️⚠️ a lacuna se declara como LACUNA DE FONTE",
    G.LACUNA_POS_EVT.ehLacunaDeFonte === true
    && G.LACUNA_POS_EVT.ehDadoFaltanteDoPaciente === false,
    "⛔ ⛔ não é dado que ⛔ alguém deixou de colher — é o estado da diretriz");

  confere("⚠️⚠️ ⛔ e ela ⛔ NÃO traz conduta ⛔ nenhuma",
    !/\d+\s*(min|h|hora)|frequ|a cada/i.test(G.LACUNA_POS_EVT.texto),
    "⛔ número ⛔ nenhum: a nota informa a ausência, ⛔ e ⛔ não a preenche");

  confere("⚠️ a nota é COMPACTA — ⛔ e ⛔ não um cartão de dívida",
    G.LACUNA_POS_EVT.texto.length < 160,
    "⛔ ⛔ nada aqui espera por ação de ⛔ ninguém");
}

// ══ ⚠️⚠️ 5 · A MONITORIZAÇÃO PÓS-IVT ══════════════════════════════════════
{
  const M = G.MONITORIZACAO_POS_IVT;

  confere("⚠️⚠️ as três fases da Table 7, ⛔ e a primeira começa em ZERO",
    M.fases.length === 3 && M.fases[0].deHoras === 0
    && M.fases[0].aCadaMin === 15 && M.fases[0].ateHoras === 2,
    "⛔ *\"during AND after the IVT for 2 h\"* — começar no fim perderia duas horas de vigilância");

  confere("⚠️ ⛔ e as fases ⛔ NÃO têm buraco ⛔ nem sobreposição",
    M.fases.every((f, i) => i === 0 || f.deHoras === M.fases[i - 1].ateHoras),
    "⛔ intervalo descoberto é hora sem regra de medida");

  confere("⚠️ mede PA **E** exame neurológico — os dois",
    M.oQueSeMede.length === 2,
    "⛔ a fonte pede os dois; medir só a PA cumpre metade da tabela");

  confere("⚠️⚠️ a imagem de controle preserva a ORDEM — ANTES do antitrombótico",
    /ANTES de iniciar anticoagulante ou antiagregante/.test(M.imagemDeControle.texto),
    "⛔ \"TC em 24 h\" sozinho perde a razão de ser da regra");

  confere("⚠️ o adiamento de procedimentos preserva a CONDIÇÃO da fonte",
    /Se o paciente puder ser manejado com segurança/.test(M.adiar.condicao),
    "⛔ *\"if it can be safely\"* — adiar incondicionalmente inventaria proibição");

  /** ⚠️⚠️ ⛔ ELA ⛔ NÃO É CRITÉRIO DE DESTINO ⛔ NEM DE ELEGIBILIDADE. */
  confere("⚠️⚠️ a monitorização ⛔ NÃO aparece sem administração registrada",
    DG.monitorizacaoPosIvt(com([])) === undefined
    && DG.monitorizacaoPosIvt(com([["agente_trombolitico", "Tenecteplase"]])) === undefined,
    "⛔ escolher o agente ⛔ não é administrar — a Table 7 começa na administração");

  /**
   * ⚠️⚠️ AS DEZ PROVAS DA CADEIA — decisão → ação → monitorização.
   *
   * ⛔ Cada elo tem que falhar sozinho. ⚠️ Provar só o fim da cadeia deixaria
   * qualquer atalho no meio passar verde.
   */
  const acao = (campos) => com(campos.map(([c, v]) => [c, v, INST(1)]));

  // 1 · escolher TNK ⛔ não dispara
  confere("⚠️⚠️ 1 · escolher o agente ⛔ NÃO dispara a monitorização",
    DG.pertinenciaDaMonitorizacao(com([["agente_trombolitico", "Tenecteplase"]])).pertinente === false
    && DG.pertinenciaDaMonitorizacao(com([["agente_trombolitico", "Alteplase"]])).pertinente === false,
    "⛔ decidir ⛔ não é agir — F-09, e a distinção já custou um defeito");

  // 2 · recomendação aplicável ⛔ não dispara
  {
    const comCriterios = com([
      ["sitio_oclusao", "M1"], ["nihss", 14], ["mrs_previo", 0], ["aspects", 8],
      ["incapacitante_assumido", "Incapacitante"],
    ]);
    const aplicaveis = DF.recomendacoesDoEstado(comCriterios)
      .filter((r) => r.correspondencia === "aplicavel");
    confere("⚠️⚠️ 2 · recomendação APLICÁVEL ⛔ NÃO dispara a monitorização",
      aplicaveis.length > 0 && DG.pertinenciaDaMonitorizacao(comCriterios).pertinente === false,
      "⛔ inferir a ação a partir da indicação é a fabricação mais fácil de ⛔ não perceber");
  }

  // 3 · cancelada ⛔ não é administração
  confere("⚠️⚠️ 3 · ação CANCELADA ⛔ NÃO equivale a administração",
    DG.pertinenciaDaMonitorizacao(acao([["ivt_estado", "Cancelada"], ["ivt_agente_administrado", "Alteplase"]]))
      .pertinente === false,
    "⛔ a regra de E vale inteira: cancelada ⛔ nunca é desfecho favorável");

  // 4 · iniciada dispara — "during and after"
  confere("⚠️⚠️ 4 · ação INICIADA torna a monitorização pertinente",
    DG.pertinenciaDaMonitorizacao(acao([["ivt_estado", "Iniciada"]])).pertinente === true,
    "⛔ esperar 'realizada' atrasaria a vigilância que deve ocorrer DURANTE a infusão");

  // 5 · realizada mantém
  confere("⚠️ 5 · ação REALIZADA mantém a pertinência",
    DG.pertinenciaDaMonitorizacao(acao([["ivt_estado", "Realizada"]])).pertinente === true,
    "⛔ a monitorização segue até 24 h — terminar a infusão ⛔ não a encerra");

  // 6 · hora da escolha ⛔ não substitui o início
  confere("⚠️⚠️ 6 · a hora da ESCOLHA do agente ⛔ NUNCA substitui o início",
    DG.faseDaMonitorizacao(
      com([["agente_trombolitico", "Tenecteplase"], ["ivt_estado", "Iniciada", INST(1)]]),
      3_600_000
    ).tipo === "sem_horario",
    "⛔ deslocaria a fase da Table 7 para uma hora que ⛔ ninguém observou");

  // 7 · ausência do início ⛔ não vira "agora"
  {
    const f = DG.faseDaMonitorizacao(acao([["ivt_estado", "Iniciada"]]), 99_000_000);
    confere("⚠️⚠️ 7 · ausência do início ⛔ NÃO vira o horário atual",
      f.tipo === "sem_horario" && f.campo === "ivt_inicio",
      "⛔ E-52: assumir 'agora' fabricaria a fase 15 min para quem talvez esteja em 8 h");
  }

  // 8 · sem início, ⛔ nenhuma fase calculada
  confere("⚠️⚠️ 8 · ⛔ SEM início conhecido, ⛔ NENHUMA fase 15/30/60 é calculada",
    DG.faseDaMonitorizacao(acao([["ivt_estado", "Iniciada"]]), 0).tipo === "sem_horario",
    "⛔ pertinência ⛔ não é fase: G sabe que se aplica ⛔ e ⛔ não sabe onde o paciente está");

  /** ⚠️ E COM o início, a fase é calculada — ⛔ senão a trava mede só o negativo. */
  {
    const t0 = 1_000_000_000;
    const comHora = com([
      ["ivt_estado", "Iniciada", INST(1)],
      ["ivt_inicio", t0, INST(1)],
    ]);
    const f1 = DG.faseDaMonitorizacao(comHora, t0 + 30 * 60_000);
    const f2 = DG.faseDaMonitorizacao(comHora, t0 + 5 * 3_600_000);
    const f3 = DG.faseDaMonitorizacao(comHora, t0 + 12 * 3_600_000);
    confere("⚠️⚠️ COM o início, as três fases da Table 7 são calculadas",
      f1.aCadaMin === 15 && f2.aCadaMin === 30 && f3.aCadaMin === 60,
      "⛔ trava só com o lado negativo aceita uma função que ⛔ nunca acerta");
    /**
     * ⚠️⚠️ 24 h ENCERRAM A TABELA, ⛔ E ⛔ NÃO A PERTINÊNCIA.
     *
     * ⛔ Este é o erro perigoso que a separação existe para impedir: o app
     * ⛔ **desistir** de mostrar que o paciente está em contexto pós-trombólise
     * ⛔ só porque a tabela acabou — ⛔ ou porque o horário falta.
     */
    const depois = com([
      ["ivt_estado", "Iniciada", INST(1)],
      ["ivt_inicio", t0, INST(1)],
    ]);
    confere("⚠️ depois de 24 h sai da janela DA TABELA, ⛔ sem inventar fase",
      DG.faseDaMonitorizacao(depois, t0 + 30 * 3_600_000).tipo === "fora_da_janela_da_tabela",
      "⛔ a fonte ⛔ não publica duração além de 24 h — inventar uma seria E-31");

    confere("⚠️⚠️ ⛔ e 24 h ⛔ NUNCA produzem `pertinencia: false`",
      DG.pertinenciaDaMonitorizacao(depois).pertinente === true
      && DG.pertinenciaDaMonitorizacao(com([
        ["ivt_estado", "Realizada", INST(1)],
        ["ivt_inicio", t0, INST(1)],
      ])).pertinente === true,
      "⛔ quem recebeu trombólise continua tendo recebido — o tempo ⛔ não desfaz a ação");

    confere("⚠️⚠️ a pertinência ⛔ NÃO depende do relógio, em ⛔ NENHUM instante",
      [0, 1, 12, 24, 30, 100, 1000].every((h) =>
        DG.pertinenciaDaMonitorizacao(depois).pertinente === true),
      "⛔ ela responde se HOUVE IVT — ⛔ e ⛔ não há instante em que isso deixe de ser verdade");

    confere("⚠️⚠️ ⛔ e ⛔ sem horário a pertinência CONTINUA verdadeira",
      DG.pertinenciaDaMonitorizacao(acao([["ivt_estado", "Iniciada"]])).pertinente === true
      && DG.faseDaMonitorizacao(acao([["ivt_estado", "Iniciada"]]), t0).tipo === "sem_horario",
      "⛔ faltar o horário ⛔ não pode fazer o app esquecer que houve trombólise");
  }

  // 9 e 10 · G lê a ação, ⛔ e ⛔ não escreve ⛔ nem corrige
  confere("⚠️⚠️ 9 · G LÊ a ação de F, ⛔ e ⛔ não a reimplementa",
    /acoesDeTrombolise/.test(fonteG) && !/instanciasDe|valorNaInstancia/.test(fonteG),
    "⛔ reimplementar a leitura daria duas verdades sobre o mesmo fato (I6)");

  confere("⚠️⚠️ 10 · G ⛔ NÃO ESCREVE ⛔ nem corrige ⛔ nada",
    !/registrarFato|registrarComInstancia|corrigirNaInstancia|proximaInstancia/.test(fonteG),
    "⛔ G é leitura: escrever daqui deixaria a ação com duas fontes de verdade");

  /**
   * ⚠️⚠️ O AGENTE DA AÇÃO TEM **DOIS** VALORES — ⛔ e "Indefinido" ⛔ não é um.
   *
   * ⛔ Quem iniciou a infusão iniciou com **algum** agente. ⚠️ ⛔ Não saber qual
   * é ausência de resposta, ⛔ e ⛔ não um terceiro agente — admitir
   * "Indefinido" aqui deixaria a trilha dizer que se administrou o indefinido.
   */
  {
    const campos = SF.ACAO_DE_TROMBOLISE;
    const agente = campos.find((c) => c.id === "ivt_agente_administrado");
    confere("⚠️⚠️ o agente ADMINISTRADO ⛔ NÃO admite 'Indefinido'",
      agente.opcoes.length === 2 && !agente.opcoes.includes("Indefinido"),
      "⛔ decidir ⛔ não escolher é decisão; administrar o indefinido ⛔ não existe");

    /** ⚠️⚠️ E o início tem RELÓGIO PRÓPRIO — ⛔ e ⛔ não o de outro marco. */
    const inicio = campos.find((c) => c.id === "ivt_inicio");
    confere("⚠️⚠️ o início da administração tem RELÓGIO PRÓPRIO",
      inicio.tipo === "hora" && inicio.relogio === "inicio_ivt",
      "⛔ apontar para outro relógio contaria a Table 7 a partir de um marco que ⛔ não é o dela");

    confere("⚠️ ⛔ e ⛔ NENHUM outro campo do módulo usa esse relógio",
      SA.TODOS_OS_CAMPOS_A.every((c) => c.relogio !== "inicio_ivt"),
      "⛔ dois campos no mesmo relógio fundem duas contagens");

    confere("⚠️ 'ninguém anotou a hora' é RESPOSTA no início da administração",
      inicio.aceitaDesconhecido === true,
      "⛔ E-02: a infusão pode ter começado ⛔ sem ⛔ ninguém anotar o horário");

    confere("⚠️ a ação tem os TRÊS atributos, ⛔ e ⛔ nenhum a mais",
      campos.length === 3 && campos.every((c) => c.instanciaDe === TROMB),
      "⛔ atributo sem fonte que o sustente é objeto completado por completar");
  }

  /** ⚠️⚠️ E os DOIS agentes ⛔ não se sobrescrevem — a trilha guarda a divergência. */
  {
    const divergente = com([
      ["agente_trombolitico", "Tenecteplase"],
      ["ivt_agente_administrado", "Alteplase", INST(1)],
      ["ivt_estado", "Iniciada", INST(1)],
    ]);
    confere("⚠️⚠️ decisão e ação podem DIVERGIR, ⛔ e as duas sobrevivem",
      DF.acoesDeTrombolise(divergente)[0].agente === "Alteplase"
      && E.valorAtual(divergente, "agente_trombolitico").valor === "Tenecteplase",
      "⛔ um campo só obrigaria a sobrescrever a decisão anterior, ⛔ e a trilha perderia que ela existiu");
  }
}

// ══ ⚠️⚠️ 6 · G LÊ, ⛔ E ⛔ NÃO REDECLARA ═══════════════════════════════════
{
  confere("⚠️⚠️ a saída de fluxo REUSA `destinoDaImagem` de C",
    /destinoDaImagem/.test(fonteG),
    "⛔ reimplementar daria duas respostas para a mesma pergunta, ⛔ e elas divergiriam (I6)");

  confere("⚠️⚠️ ⛔ e G ⛔ NÃO decide se há hemorragia",
    !/hemorragia|hsa|suspeita_hsa/i.test(fonteG),
    "⛔ quem lê imagem é C — G ⛔ não pergunta de novo o que C já perguntou");

  /** ⚠️⚠️ Os únicos fatos que nascem em G são OPERACIONAIS. */
  const idsClinicos = ["nihss", "aspects", "mrs_previo", "sitio_oclusao", "peso", "glicemia", "pas"];
  confere("⚠️⚠️ ⛔ G ⛔ NÃO redeclara fato clínico de ⛔ nenhuma outra superfície",
    G.FATOS_OPERACIONAIS.every((f) => !idsClinicos.includes(f.id)),
    "⛔ um fato tem UMA casa semântica; duas casas é duas verdades");

  confere("⚠️ os fatos operacionais moram na casa DESTINO",
    G.CASA_DOS_FATOS_OPERACIONAIS === "destino",
    "⛔ casa errada é o fato aparecendo onde ⛔ ninguém o procura");

  /** ⚠️⚠️ E a lista que a trava lê é DERIVADA — ⛔ não uma cópia à mão (D-15). */
  confere("⚠️⚠️ a lista protegida é DERIVADA do catálogo",
    G.IDS_OPERACIONAIS.length === G.FATOS_OPERACIONAIS.length
    && G.IDS_OPERACIONAIS.every((id, i) => id === G.FATOS_OPERACIONAIS[i].id),
    "⛔ fato operacional novo tem que nascer JÁ protegido, ⛔ e ⛔ não se alguém lembrar");
}

// ══ ⚠️⚠️ 7 · ESTADO INICIAL ⛔ NÃO INFORMADO ═══════════════════════════════
{
  confere("⚠️⚠️ ⛔ NENHUM fato operacional nasce respondido",
    DG.contextoOperacional(com([])).every((l) => l.estado === undefined),
    "⛔ E-52: presumir capacidade do serviço é fabricar fato sobre o hospital");

  confere("⚠️⚠️ ⛔ e ⛔ NÃO se infere de nada já respondido",
    DG.contextoOperacional(com([
      ["estudo_modalidade", "Tomografia de perfusão"],
      ["sitio_oclusao", "M1"],
      ["hora_chegada", 1],
    ])).every((l) => l.estado === undefined),
    "⛔ ter feito uma perfusão ⛔ não prova que o serviço a tem disponível agora");

  /** ⚠️⚠️ E-37: os TRÊS vazios continuam distinguíveis. */
  confere("⚠️⚠️ 'Incerto' ⛔ NÃO é o mesmo que ⛔ não perguntado",
    DG.contextoOperacional(com([["centro_evt_disponivel", "Incerto"]]))
      .find((l) => l.id === "centro_evt_disponivel").estado === "incerto",
    "⛔ colapsar os dois apagaria que a pergunta já foi feita");

  confere("⚠️ e 'Não' é INDISPONÍVEL, ⛔ e ⛔ não incerto",
    DG.contextoOperacional(com([["centro_evt_disponivel", "Não"]]))
      .find((l) => l.id === "centro_evt_disponivel").estado === "indisponivel",
    "⛔ E-02: responder ⛔ não é deixar em branco");
}

// ══ ⚠️⚠️ 8 · ⛔ NENHUM DESTINO É AUTOMÁTICO ════════════════════════════════
{
  const L = DG.leituraDaSuperficieG(com([]));
  confere("⚠️⚠️ os destinos aparecem ⛔ SEM depender de dado ⛔ nenhum",
    L.recomendados.length === G.DESTINOS_RECOMENDADOS.length,
    "⛔ §5.1 vale para AVC isquêmico agudo ⛔ sem critério adicional — filtrar estreitaria uma COR 1");

  confere("⚠️⚠️ ⛔ e a leitura ⛔ NÃO produz veredito de encaminhamento",
    !("encaminhar" in L) && !("destinoEscolhido" in L) && !("vaiPara" in L),
    "⛔ a fonte RECOMENDA a unidade; ⛔ ela ⛔ não encaminha ⛔ ninguém");

  confere("⚠️ a dívida documental da §1.10 está DECLARADA",
    G.DIVIDA_DOCUMENTAL.estado === "nao_disponivel_no_repositorio"
    && G.DIVIDA_DOCUMENTAL.citadaEm.length >= 2
    && G.DIVIDA_DOCUMENTAL.construidaApenasDeFontesAuditadas === true,
    "⛔ reconstruir a lista de memória seria inventar destino com cara de decisão antiga");
}

// ══ ⚠️⚠️ 9 · AS QUATRO DECISÕES DE UI ═════════════════════════════════════
{
  /** ⚠️⚠️ 1 · A ORDEM DOS BLOCOS — o operacional por último, ⛔ sempre. */
  const ordem = ["avc-g-recomendados", "avc-g-operacionais", "avc-g-monitorizacao",
    "avc-g-lacuna-pos-evt", "avc-g-saida", "avc-g-contexto-operacional"];
  const posicoes = ordem.map((id) => fonteTela.indexOf(`testID="${id}"`));
  confere("⚠️⚠️ os seis blocos aparecem NA ORDEM aprovada",
    posicoes.every((p, i) => p > 0 && (i === 0 || p > posicoes[i - 1])),
    "⛔ o contexto operacional por último é deliberado: é o menos clínico da tela");

  /**
   * ⚠️⚠️ 2 · O SELO DA TABELA, REPETIDO NOS DOIS BLOCOS.
   *
   * ⛔ A repetição ⛔ não é ruído: os dois enunciados vêm da MESMA tabela
   * operacional, ⛔ e o médico ⛔ não pode inferir que um ganhou grau por estar
   * mais destacado.
   */
  confere("⚠️⚠️ o selo TABLE 7 é usado na regra E na monitorização",
    (fonteTela.match(/<SeloDaTabela \/>/g) ?? []).length === 2,
    "⛔ um selo só deixaria o outro enunciado parecendo graduado");

  confere("⚠️⚠️ ⛔ e o selo DIZ a ausência, ⛔ não a sugere com estilo",
    /a fonte não atribui COR\/LOE/.test(fonteTela),
    "⛔ estilo mais fraco lê como recomendação menor; texto lê como categoria diferente");

  confere("⚠️⚠️ ⛔ NENHUM COR/LOE é fabricado para a tabela",
    !/cor:\s*"|loe:\s*"/.test(fonteTela)
    && !/n\/a|—\s*·\s*LOE|sem grau atribuído/i.test(fonteTela),
    "⛔ preencher grau ausente — ⛔ nem com traço ⛔ nem com 'n/a' — falsifica a fonte");

  /** ⚠️⚠️ 3 · AS TRÊS FASES SEMPRE VISÍVEIS. */
  confere("⚠️⚠️ as três fases são renderizadas SEM condicional",
    /tabela\.fases\.map/.test(fonteTela) && !/fases\.filter/.test(fonteTela),
    "⛔ ver 15 → 30 → 60 ajuda a antecipar o que vem — filtrar esconderia o futuro");

  confere("⚠️ ⛔ e ⛔ sem horário ⛔ NENHUMA fica ativa",
    /const ativa = fase\?\.tipo === "fase" && fase\.deHoras === f\.deHoras;/.test(fonteTela),
    "⛔ marcar uma fase sem horário conhecido inventaria onde o paciente está");

  /** ⚠️⚠️ 4 · GATILHOS EM LISTA, ⛔ e ⛔ não em parágrafo. */
  confere("⚠️⚠️ os sinais de deterioração são LISTA, ⛔ e ⛔ não parágrafo",
    /deterioracao\.sinais\.map/.test(fonteTela)
    && !/sinais\.join/.test(fonteTela),
    "⛔ em texto corrido o olho passa por cima, ⛔ e isto é conteúdo de resposta rápida");

  confere("⚠️⚠️ a consequência fica SEPARADA dos sinais",
    /condutas\.map/.test(fonteTela)
    && fonteTela.indexOf("condutas") > fonteTela.indexOf("sinais.map"),
    "⛔ misturar sinal e ação faz o médico ler cinco itens ⛔ sem saber quais são conduta");

  confere("⚠️ ⛔ e o alerta ⛔ NÃO é permanente",
    /pertinencia\.pertinente && tabela \?/.test(fonteTela),
    "⛔ ⛔ sem contexto pós-IVT ⛔ não há o que alertar — a Table 7 ⛔ não é conduta geral do AVC");

  /** ⚠️⚠️ E A FRONTEIRA, NA TELA. */
  confere("⚠️⚠️ a frase da fronteira fica NO TOPO do bloco operacional",
    /Não altera indicação clínica nem elegibilidade a nenhuma terapia/.test(fonteTela),
    "⛔ escondê-la numa nota deixaria o bloco parecendo critério clínico");

  confere("⚠️⚠️ ⛔ e a tela ⛔ NÃO produz veredito de elegibilidade",
    !/inelegív|contraindicad|não indicad/i.test(
      fonteTela.replace(/nota=\{[^}]*\}/g, "")),
    "⛔ ausência de recurso ⛔ não é veredito clínico");

  confere("⚠️⚠️ a tela ⛔ NÃO escreve cor em hexadecimal",
    !/#[0-9a-fA-F]{3,8}\b/.test(fonteTela),
    "⛔ cor fora do design system é a duplicação que a trava de paleta impede");

  confere("⚠️⚠️ ⛔ e a tela ⛔ NÃO decide correspondência ⛔ nem grava fase",
    !/correspondenciaDe|valorDoInsumo|recomendacoesDoEstado/.test(fonteTela),
    "⛔ destino que depende da indicação confunde 'deveria receber' com 'recebeu'");
}

// ── relatório ────────────────────────────────────────────────────────────
fs.rmSync(tmp, { recursive: true, force: true });
if (falhas.length > 0) {
  console.error(`\n❌ SUPERFÍCIE G — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`✅ SUPERFÍCIE G — ${ok}/${ok} conferências · ${G.DESTINOS_RECOMENDADOS.length} destino graduado · ${G.REGRAS_DE_DESTINO.length} regra operacional`);
