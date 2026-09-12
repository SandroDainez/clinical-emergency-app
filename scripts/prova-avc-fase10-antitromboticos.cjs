#!/usr/bin/env node
/**
 * TRAVA DOS ANTITROMBÓTICOS PÓS-IVT — ⚠️ **a ordem, a exceção e o dano são
 * três coisas**, ⛔ e ⛔ elas ⛔ não se fundem.
 *
 * PROMETE: que o app diga **em que ponto do fluxo pós-trombólise o caso está**,
 *   ⛔ sem transformar ⛔ nenhum degrau em conclusão:
 *
 *   · a **ordem** da Table 7 — imagem de controle em 24 h **antes** de iniciar
 *     anticoagulante ⛔ ou antiagregante — continua sendo ⛔ só ordem;
 *   · a **exceção** de §4.8 rec. 2 (**COR 2b · LOE B-NR**) aparece com o
 *     *"risco incerto"* da fonte, ⛔ e ⛔ nunca como rotina ⛔ nem como proibição;
 *   · a **aspirina IV nos 90 min** (§4.8 rec. 17 · **COR 3: Harm**) vive
 *     separada, ⛔ e ⛔ não é absorvida pela regra das 24 h;
 *   · resultado ⛔ sem hemorragia ⛔ **⛔ não** inicia ⛔ nada.
 *
 * NÃO PROMETE: que a conduta antitrombótica esteja certa neste paciente —
 *   ⛔ isso é do médico. ⛔ E ⛔ **⛔ não** promete ⛔ nenhum esquema terapêutico:
 *   ⛔ agente, dose, horário ⛔ e regime ⛔ **⛔ não existem** neste módulo, ⛔ e a
 *   Table 7 ⛔ não os sustenta.
 *
 *   ⛔ ⛔ E ⛔ **⛔ NÃO** promete ⛔ nada sobre **anticoagulação**: §4.9 tem seis
 *   recomendações, ⛔ com forças opostas (2a para FA selecionada · 3: No
 *   Benefit para anticoagulação precoce indiferenciada). ⚠️ ⛔ Incorporar
 *   ⛔ **metade** delas seria pior do que ⛔ nenhuma — a tela diria *"⛔ não
 *   recomendada"* a um paciente com FA em quem a fonte diz *"is reasonable"*.
 *
 * UNIVERSO: `avc/conteudo/superficie-g.ts` × `avc/nucleo/derivacoes-g.ts` ×
 *   a instância de estudo da Superfície C.
 *
 * ── ⚠️⚠️ ⛔ O QUE ESTA FASE **⛔ NÃO** CRIOU, ⛔ E ⛔ POR QUÊ ────────────────
 *
 * ⛔ ⛔ **⛔ Nenhum campo novo de imagem.** ⚠️ O mapeamento por execução mostrou
 * que a instância de **estudo** já existe, com `estudo_modalidade`,
 * `estudo_hora` ⛔ e `estudo_resultado` — ⛔ e a escada *solicitado ≠ realizado
 * ≠ resultado* ⛔ já foi provada na Fase 5. ⛔ A imagem de controle ⛔ não é um
 * exame de outra espécie: ⛔ é **um estudo posterior ao início da trombólise**.
 *
 * ⚠️ ⛔ É a regra do projeto executada: **antes de declarar dívida, verificar
 * por execução se o conteúdo já existe, ⛔ onde está ⛔ e quem o consome**.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase10-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const SG = emT("avc", "conteudo", "superficie-g.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const SE = emT("avc", "conteudo", "superficie-e.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const DG = emT("avc", "nucleo", "derivacoes-g.js");
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const I = emT("avc", "nucleo", "instancia.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const AGORA = 2_000_000_000;
const H = 3_600_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const reg = (e, c, v) => E.registrarFato(e, { campo: c, valor: v }, rel);
const regI = (e, inst, c, v) => CAMPOS.registrarComInstancia(e, { campo: c, valor: v }, rel, inst);
const opc = (e, inst, c, rotulo) => regI(e, inst, c, CAMPO.valorDaOpcao(rotulo));

/** ⚠️ A trombólise **administrada**, do jeito que a Superfície F a registra. */
function comIvt(e, hDesde) {
  const ivt = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
  let x = opc(e, ivt, "ivt_estado", "Realizada");
  return regI(x, ivt, "ivt_inicio", AGORA - hDesde * H);
}

/** ⚠️ Um estudo, com hora — ⛔ e a hora é o que o torna *de controle*. */
function comEstudo(e, n, hDesde, modalidade, resultado) {
  const inst = I.nomeDaInstancia(SC.ESTUDO, n);
  let x = opc(e, inst, "estudo_modalidade", modalidade);
  x = regI(x, inst, "estudo_hora", AGORA - hDesde * H);
  return resultado === undefined ? x : opc(x, inst, "estudo_resultado", resultado);
}

const TC = "Tomografia de crânio sem contraste";
const SEM_HEMORRAGIA = "Sem hemorragia intracraniana identificada";
const COM_HEMORRAGIA = "Hemorragia intracraniana identificada";

/* ══ ⚠️⚠️ 1 · O CONTEÚDO EXISTE, ⛔ E É VERBATIM ══════════════════════════ */
{
  const A = SG.ANTITROMBOTICOS_POS_IVT;
  conf(
    "⚠️ o catálogo antitrombótico pós-IVT existe",
    A !== undefined && Array.isArray(A.recomendacoes) && A.recomendacoes.length >= 3,
    `⛔ ${JSON.stringify(Object.keys(A ?? {}))} — trava sobre lista vazia fica verde ⛔ sem medir`
  );

  const por = (id) => (A?.recomendacoes ?? []).find((r) => r.id === id);

  /**
   * ⚠️⚠️ §4.8 rec. 1 — ⛔ o pano de fundo, ⛔ e ⛔ ele ⛔ **⛔ não** é pós-IVT:
   * conta de **48 h do início do AVC**, ⛔ e ⛔ não da trombólise.
   */
  const r1 = por("aas_48h");
  conf(
    "⚠️⚠️ §4.8 rec. 1 · aspirina em 48 h — **COR 1 · LOE A**, verbatim",
    r1 !== undefined && r1.cor === "1" && r1.loe === "A"
    && /within 48 hours after stroke onset/.test(r1.verbatim)
    && /reduce risk of death and dependency/.test(r1.verbatim),
    `⛔ ${JSON.stringify(r1)}`
  );

  /**
   * ⚠️⚠️⚠️ §4.8 rec. 2 — ⛔ **A EXCEÇÃO**, ⛔ e ⛔ o verbo dela é *"is
   * uncertain"*. ⛔ Ela ⛔ **⛔ não** proíbe ⛔ e ⛔ **⛔ não** libera.
   */
  const r2 = por("antiagregante_24h_pos_ivt");
  conf(
    "⚠️⚠️⚠️ §4.8 rec. 2 · primeiras 24 h pós-IVT — **COR 2b · LOE B-NR**",
    r2 !== undefined && r2.cor === "2b" && r2.loe === "B-NR"
    && /the risk of antiplatelet therapy in the first 24 hours after IVT/.test(r2.verbatim)
    && /is uncertain/.test(r2.verbatim)
    && /might be considered/.test(r2.verbatim)
    && /substantial benefit/.test(r2.verbatim)
    && /substantial risk/.test(r2.verbatim),
    `⛔ ${JSON.stringify(r2)}`
  );
  /** ⚠️ ⛔ E o *"com ⛔ ou ⛔ sem trombectomia"* da fonte ⛔ não se perde. */
  conf(
    "⚠️ ⛔ e ⛔ ela vale *«with or without mechanical thrombectomy»*",
    r2 !== undefined && /with or without mechanical thrombectomy/.test(r2.verbatim),
    "⛔ a exceção ⛔ não muda por ter havido trombectomia"
  );

  /**
   * ⚠️⚠️⚠️ §4.8 rec. 17 — ⛔ **DANO**, ⛔ e ⛔ não *"No Benefit"*.
   *
   * ⛔ ⛔ A rec. 18, logo abaixo dela na fonte, é `3: No Benefit`. ⚠️ ⛔ Achatar
   * as duas em *"COR 3"* apagaria a diferença entre **⛔ não ajuda** ⛔ e
   * **faz mal**.
   */
  const r17 = por("aspirina_iv_90min");
  conf(
    "⚠️⚠️⚠️ §4.8 rec. 17 · aspirina IV nos 90 min — **COR 3: Harm · LOE B-R**",
    r17 !== undefined && r17.cor === "3: Harm" && r17.loe === "B-R"
    && /within 90 minutes after the start of IVT/.test(r17.verbatim)
    && /given the risk of hemorrhage/.test(r17.verbatim),
    `⛔ ${JSON.stringify(r17)}`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ ela ⛔ NÃO é *«No Benefit»* — ⛔ dano ⛔ e ausência de benefício ⛔ são coisas diferentes",
    r17 !== undefined && !/No Benefit/i.test(r17.cor),
    `⛔ ${r17 && r17.cor}`
  );

  /**
   * ⚠️⚠️ ⛔ AS TRÊS SÃO **TRÊS**, ⛔ e ⛔ nenhuma absorve a outra: janelas
   * diferentes (48 h · 24 h · 90 min), marcos diferentes (início do AVC ·
   * início da IVT · início da IVT) ⛔ e forças diferentes.
   */
  const janelas = (A?.recomendacoes ?? []).map((r) => `${r.janela?.minutos}@${r.janela?.marco}`);
  conf(
    "⚠️⚠️ ⛔ as três têm JANELAS ⛔ e MARCOS distintos — ⛔ nenhuma absorve a outra",
    new Set(janelas).size === janelas.length && janelas.length >= 3,
    `⛔ ${janelas.join(" · ")}`
  );
  conf(
    "⚠️⚠️ ⛔ e a de 90 min conta do **início da IVT**, ⛔ e a de 48 h ⛔ NÃO",
    r17?.janela?.marco === "inicio_ivt" && r1?.janela?.marco === "inicio_avc"
    && r17?.janela?.minutos === 90 && r1?.janela?.minutos === 48 * 60,
    `⛔ 90min=${JSON.stringify(r17 && r17.janela)} · 48h=${JSON.stringify(r1 && r1.janela)}`
  );

  /** ⚠️⚠️ ⛔ E ⛔ NENHUM ESQUEMA TERAPÊUTICO — ⛔ a fonte desta fase ⛔ não o dá. */
  const fonteG = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-g.ts"));
  const inventado = [
    ["dose em mg", /\b\d+\s*mg\b/],
    ["agente nomeado", /clopidogrel|ticagrelor|enoxaparin|heparina de baixo|varfarina|rivaroxaban|apixaban/i],
    ["posologia", /\b\d+\s*x\s*ao dia|de \d+\/\d+ ?h\b/i],
  ].filter(([, re]) => re.test(fonteG)).map(([n]) => n);
  conf(
    "⚠️⚠️⚠️ ⛔ NENHUM agente, dose ⛔ ou regime foi inventado",
    inventado.length === 0,
    `⛔ ${inventado.join(" · ")} — a Table 7 sustenta a ORDEM, ⛔ e ⛔ não um esquema`
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ **⛔ NENHUMA** RECOMENDAÇÃO DE ANTICOAGULAÇÃO ENTROU.
   *
   * ⛔ §4.9 tem seis, ⛔ com forças **opostas**: `2a · A` para FA selecionada
   * ⛔ e `3: No Benefit · A` para anticoagulação precoce indiferenciada.
   * ⚠️ ⛔ Meia transcrição faria a tela dizer *"⛔ não recomendada"* a um
   * paciente com FA em quem a fonte diz *"is reasonable"*.
   */
  const anticoag = (A?.recomendacoes ?? []).filter((r) => /anticoag/i.test(r.id + r.verbatim));
  conf(
    "⚠️⚠️⚠️ ⛔ NENHUMA recomendação de anticoagulação foi meio-transcrita",
    anticoag.length === 0,
    `⛔ ${anticoag.map((r) => r.id).join(" · ")} — §4.9 entra inteira, ⛔ ou ⛔ não entra`
  );
  conf(
    "⚠️ ⛔ e a lacuna está **declarada**, ⛔ e ⛔ não silenciosa",
    A?.lacunaDaAnticoagulacao !== undefined
    && /4\.9/.test(A.lacunaDaAnticoagulacao.referencia ?? "")
    && A.lacunaDaAnticoagulacao.ehLacunaDeFonte === false,
    `⛔ ${JSON.stringify(A && A.lacunaDaAnticoagulacao)} — ⛔ ela ⛔ não é falta de fonte: é **decisão de escopo**`
  );
}

/* ══ ⚠️⚠️ 2 · A ORDEM DA TABLE 7 CONTINUA INTACTA ═══════════════════════ */
{
  const m = SG.MONITORIZACAO_POS_IVT;
  conf(
    "⚠️⚠️ a ordem *imagem em 24 h ANTES do antitrombótico* ⛔ NÃO foi mexida",
    m.imagemDeControle.prazoHoras === 24
    && /ANTES de iniciar anticoagulante ou antiagregante/i.test(m.imagemDeControle.texto),
    `⛔ ${JSON.stringify(m.imagemDeControle)}`
  );
  /** ⚠️ ⛔ E ⛔ ela continua **sem grau** — ⛔ a Table 7 ⛔ não publica COR/LOE. */
  conf(
    "⚠️ ⛔ e a Table 7 segue **sem grau**, ⛔ e ⛔ ninguém lhe atribuiu um",
    m.semGrauNaFonte === true && m.cor === null && m.loe === null,
    `⛔ cor=${m.cor} loe=${m.loe}`
  );
}

/* ══ ⚠️⚠️⚠️ 3 · OS SEIS ESTADOS, POR EXECUÇÃO ═════════════════════════ */
{
  const est = (e) => DG.estadoAntitromboticoPosIvt(e, AGORA);

  /** ⚠️⚠️ ⛔ SEM TROMBÓLISE, ⛔ a regra ⛔ NÃO se aplica — ⛔ e ⛔ não é "faltando". */
  conf(
    "⚠️⚠️ ⛔ SEM IVT registrada → `fora_do_contexto_pos_ivt`",
    est(vazio)?.estado === "fora_do_contexto_pos_ivt",
    `⛔ ${est(vazio)?.estado} — aplicar a ordem pós-IVT a quem ⛔ não trombolisou é usar a regra fora do contexto`
  );

  /** ⚠️ IVT há 2 h, ⛔ nenhum estudo depois dela. */
  const cedo = comIvt(vazio, 2);
  conf(
    "⚠️⚠️ IVT há 2 h, ⛔ sem imagem de controle → `antes_da_imagem_controle`",
    est(cedo)?.estado === "antes_da_imagem_controle",
    `⛔ ${est(cedo)?.estado}`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ PASSADAS AS 24 h ⛔ SEM ESTUDO, a pendência **muda de nome** —
   * ⛔ e ⛔ isso ⛔ não é cosmético: ⛔ antes do prazo ⛔ nada está atrasado.
   */
  const tarde = comIvt(vazio, 26);
  conf(
    "⚠️⚠️ IVT há 26 h, ⛔ sem imagem → `imagem_pendente`",
    est(tarde)?.estado === "imagem_pendente",
    `⛔ ${est(tarde)?.estado}`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ ESTUDO **ANTERIOR** À IVT ⛔ NÃO É IMAGEM DE CONTROLE.
   *
   * ⛔ ⛔ A TC que excluiu hemorragia **antes** de trombolisar ⛔ não responde
   * a pergunta do pós-IVT. ⚠️ Contá-la seria dar por cumprida uma imagem que
   * ⛔ ninguém fez.
   */
  const soAntes = comEstudo(comIvt(vazio, 26), 1, 27, TC, SEM_HEMORRAGIA);
  conf(
    "⚠️⚠️⚠️ ⛔ a TC que precedeu a trombólise ⛔ NÃO conta como imagem de controle",
    est(soAntes)?.estado === "imagem_pendente",
    `⛔ ${est(soAntes)?.estado} — ⛔ um exame de 27 h atrás ⛔ não avalia uma infusão de 26 h atrás`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ ESTUDO **SEM HORA** ⛔ NÃO CONTA — ⛔ e ⛔ isto é *"imagem
   * solicitada ≠ imagem realizada"* na modelagem: ⛔ sem data, o app ⛔ não
   * sabe se aquele exame é anterior ⛔ ou posterior à infusão.
   *
   * ⛔ ⛔ Assumir daria por cumprida uma imagem de controle que ⛔ ninguém datou
   * (**E-23**).
   */
  const semHora = opc(comIvt(vazio, 26), I.nomeDaInstancia(SC.ESTUDO, 1), "estudo_modalidade", TC);
  conf(
    "⚠️⚠️⚠️ ⛔ estudo SEM HORA ⛔ NÃO conta como imagem de controle",
    est(semHora)?.estado === "imagem_pendente",
    `⛔ ${est(semHora)?.estado} — ⛔ exame ⛔ sem data ⛔ não se sabe de que lado da trombólise está`
  );
  /** ⚠️ ⛔ E ⛔ nem mesmo com laudo: ⛔ o laudo ⛔ não data o exame. */
  const semHoraComLaudo = opc(semHora, I.nomeDaInstancia(SC.ESTUDO, 1), "estudo_resultado", SEM_HEMORRAGIA);
  conf(
    "⚠️⚠️ ⛔ e ⛔ nem com laudo — ⛔ o laudo ⛔ NÃO data o exame",
    est(semHoraComLaudo)?.estado === "imagem_pendente",
    `⛔ ${est(semHoraComLaudo)?.estado}`
  );

  /** ⚠️⚠️ Estudo **posterior** à IVT, ⛔ ainda ⛔ sem laudo. */
  const semLaudo = comEstudo(comIvt(vazio, 26), 1, 1, TC);
  conf(
    "⚠️⚠️ imagem realizada depois da IVT, ⛔ sem resultado → `imagem_realizada_sem_resultado`",
    est(semLaudo)?.estado === "imagem_realizada_sem_resultado",
    `⛔ ${est(semLaudo)?.estado} — ⛔ exame feito ⛔ não é laudo lido`
  );

  /** ⚠️⚠️ Com laudo. */
  const comLaudo = comEstudo(comIvt(vazio, 26), 1, 1, TC, SEM_HEMORRAGIA);
  const r = est(comLaudo);
  conf(
    "⚠️⚠️ com resultado → `resultado_disponivel`, ⛔ e o resultado vem junto",
    r?.estado === "resultado_disponivel" && r?.resultado === SEM_HEMORRAGIA,
    `⛔ ${r?.estado} · resultado=${r?.resultado}`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ **⛔ SEM HEMORRAGIA ⛔ NÃO É ⛔ «PODE INICIAR»**.
   *
   * ⛔ ⛔ Este é o degrau que a fase inteira existe para ⛔ não pular. ⚠️ O
   * estado diz que **o resultado está disponível** — ⛔ e ⛔ nada além disso.
   */
  conf(
    "⚠️⚠️⚠️ ⛔ e ⛔ NENHUM estado se chama *liberado*, *pode_iniciar* ⛔ ou *indicado*",
    !/liberad|pode_iniciar|indicado|autorizad/i.test(String(r?.estado)),
    `⛔ ${r?.estado}`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUMA conduta é emitida junto com o resultado",
    r !== undefined && r.conduta === undefined && r.agente === undefined
    && r.iniciar === undefined,
    `⛔ ${JSON.stringify(r)} — ⛔ a decisão terapêutica é do médico`
  );
  /** ⚠️ ⛔ E hemorragia no controle ⛔ não vira veredito aqui: é **resultado**. */
  const comSangue = comEstudo(comIvt(vazio, 26), 1, 1, TC, COM_HEMORRAGIA);
  /**
   * ⚠️ Desde o commit 9 (2026-09-12, AVC-06) o achado tem **estado próprio**
   * (`resultado_disponivel_com_achado`) — ⛔ para ⛔ nunca ser vencido por uma
   * posterior normal —, ⛔ e continua sendo ⛔ **só resultado**: ⛔ nenhum verbo
   * de conduta, ⛔ nenhum *"liberado"*.
   */
  conf(
    "⚠️ ⛔ e o resultado COM hemorragia também é ⛔ só resultado",
    est(comSangue)?.estado === "resultado_disponivel_com_achado"
    && est(comSangue)?.resultado === COM_HEMORRAGIA
    && !/inici|suspend|administr|liberad/i.test(String(est(comSangue)?.frase)),
    `⛔ ${JSON.stringify(est(comSangue))}`
  );
}

/* ══ ⚠️⚠️⚠️ 4 · A EXCEÇÃO DAS 24 h ═══════════════════════════════════ */
{
  const est = (e) => DG.estadoAntitromboticoPosIvt(e, AGORA);

  /**
   * ⚠️⚠️ ⛔ ELA ⛔ SÓ APARECE COM O JULGAMENTO **REGISTRADO** — ⛔ e ⛔ nunca
   * por padrão. ⛔ Uma exceção oferecida a todo paciente vira rotina.
   */
  const dentro = comIvt(vazio, 2);
  conf(
    "⚠️⚠️ ⛔ sem o julgamento registrado, a exceção ⛔ NÃO nasce",
    est(dentro)?.estado === "antes_da_imagem_controle"
    && est(dentro)?.excecao === undefined,
    `⛔ ${JSON.stringify(est(dentro))}`
  );

  const comCondicao = reg(dentro, "condicao_concomitante_antiagregante", CAMPO.valorDaOpcao("Sim"));
  const x = est(comCondicao);
  conf(
    "⚠️⚠️⚠️ com condição concomitante registrada → `excecao_precoce_pode_ser_considerada`",
    x?.estado === "excecao_precoce_pode_ser_considerada",
    `⛔ ${x?.estado}`
  );
  conf(
    "⚠️⚠️⚠️ ⛔ e ⛔ ela carrega **COR 2b · LOE B-NR** ⛔ e o *«risco incerto»*",
    x?.cor === "2b" && x?.loe === "B-NR"
    && /is uncertain/.test(x?.verbatim ?? "")
    && /might be considered/.test(x?.verbatim ?? ""),
    `⛔ cor=${x?.cor} loe=${x?.loe}`
  );
  /**
   * ⚠️⚠️⚠️ ⛔ E ⛔ **⛔ NENHUMA** PALAVRA DE ROTINA ⛔ NEM DE PROIBIÇÃO.
   *
   * ⛔ Autor: *"⛔ Não chamar de: seguro; recomendado rotineiramente; liberado;
   * contraindicado."*
   */
  const PROIBIDAS = /seguro|rotineir|liberad|contraindicad|indicado|recomendado/i;
  conf(
    "⚠️⚠️⚠️ ⛔ e a frase exibida ⛔ NÃO diz seguro, rotina, liberado ⛔ nem contraindicado",
    x !== undefined && !PROIBIDAS.test(`${x.frase ?? ""} ${x.ressalva ?? ""}`),
    `⛔ "${x?.frase}" · "${x?.ressalva}"`
  );

  /** ⚠️ ⛔ *"Não"* ⛔ e *"Incerto"* ⛔ NÃO destravam a exceção (**E-02**). */
  for (const resposta of ["Não", "Incerto"]) {
    const e2 = reg(dentro, "condicao_concomitante_antiagregante", CAMPO.valorDaOpcao(resposta));
    conf(
      `⚠️ ⛔ *«${resposta}»* ⛔ NÃO faz a exceção nascer`,
      est(e2)?.estado !== "excecao_precoce_pode_ser_considerada",
      `⛔ ${est(e2)?.estado}`
    );
  }

  /**
   * ⚠️⚠️ ⛔ E ⛔ PASSADAS AS 24 h ⛔ A EXCEÇÃO ⛔ NÃO SE APLICA MAIS — ⛔ ela é
   * *"in the **first 24 hours** after IVT"*.
   */
  const depois = reg(comIvt(vazio, 26), "condicao_concomitante_antiagregante", CAMPO.valorDaOpcao("Sim"));
  conf(
    "⚠️⚠️ ⛔ depois de 24 h a exceção ⛔ NÃO se aplica — ⛔ a janela é da fonte",
    est(depois)?.estado !== "excecao_precoce_pode_ser_considerada",
    `⛔ ${est(depois)?.estado}`
  );
}

/* ══ ⚠️⚠️⚠️ 5 · A ASPIRINA IV DOS 90 min É OUTRA REGRA ════════════════ */
{
  const est = (e) => DG.estadoAntitromboticoPosIvt(e, AGORA);
  const A = SG.ANTITROMBOTICOS_POS_IVT;

  /**
   * ⚠️⚠️⚠️ ⛔ ELA ⛔ NÃO É A REGRA DAS 24 h, ⛔ e ⛔ o app ⛔ não pode fundi-las:
   * ⛔ **COR 3: Harm** contra **COR 2b**, ⛔ 90 minutos contra 24 horas, ⛔ via
   * **intravenosa** contra *"antiplatelet therapy"* em geral.
   */
  const r17 = A.recomendacoes.find((r) => r.id === "aspirina_iv_90min");
  const r2 = A.recomendacoes.find((r) => r.id === "antiagregante_24h_pos_ivt");
  conf(
    "⚠️⚠️⚠️ ⛔ as duas são objetos DIFERENTES, ⛔ com verbatins diferentes",
    r17 !== r2 && r17.verbatim !== r2.verbatim
    && r17.cor !== r2.cor && r17.janela.minutos !== r2.janela.minutos,
    "⛔ fundi-las daria a uma delas a força da outra"
  );
  /** ⚠️ ⛔ E ⛔ ela é de **via IV**, ⛔ e ⛔ isso está dito. */
  conf(
    "⚠️⚠️ ⛔ e a dos 90 min é explicitamente **IV**",
    /IV aspirin/.test(r17.verbatim) && /intravenosa|\bIV\b/i.test(r17.frase ?? ""),
    `⛔ "${r17.frase}"`
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ ELA APARECE DENTRO DA JANELA DELA, ⛔ e ⛔ não da outra:
   * ⛔ IVT há 30 minutos.
   */
  const recente = est(comIvt(vazio, 0.5));
  conf(
    "⚠️⚠️ IVT há 30 min → o alerta dos 90 min está ativo",
    recente?.aspirinaIvNosNoventaMin === true,
    `⛔ ${JSON.stringify(recente?.aspirinaIvNosNoventaMin)}`
  );
  const passou = est(comIvt(vazio, 3));
  conf(
    "⚠️⚠️ ⛔ IVT há 3 h → o alerta dos 90 min ⛔ NÃO está mais ativo…",
    passou?.aspirinaIvNosNoventaMin === false,
    `⛔ ${JSON.stringify(passou?.aspirinaIvNosNoventaMin)}`
  );
  conf(
    "⚠️⚠️⚠️ …⛔ e ⛔ MESMO ASSIM o caso ⛔ ainda está dentro das 24 h",
    passou?.estado === "antes_da_imagem_controle",
    `⛔ ${passou?.estado} — ⛔ as duas janelas correm juntas, ⛔ e ⛔ uma ⛔ não encerra a outra`
  );
}

/* ══ ⚠️⚠️ 6 · ⛔ NENHUM SLUG, ⛔ E ⛔ NENHUMA CONCLUSÃO PERSISTIDA ═════ */
{
  const est = (e) => DG.estadoAntitromboticoPosIvt(e, AGORA);
  const casos = [
    vazio,
    comIvt(vazio, 2),
    comIvt(vazio, 26),
    comEstudo(comIvt(vazio, 26), 1, 1, TC),
    comEstudo(comIvt(vazio, 26), 1, 1, TC, SEM_HEMORRAGIA),
    reg(comIvt(vazio, 2), "condicao_concomitante_antiagregante", CAMPO.valorDaOpcao("Sim")),
  ];
  const comSlug = [];
  for (const c of casos) {
    const x = est(c);
    for (const campo of ["frase", "ressalva", "rotulo"]) {
      const t = x?.[campo];
      if (typeof t === "string" && /[a-z]+_[a-z]+/.test(t)) comSlug.push(`${x.estado}.${campo}="${t}"`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM identificador interno vaza para a linguagem exibida",
    comSlug.length === 0,
    `⛔ ${comSlug.join(" · ")}`
  );

  /**
   * ⚠️⚠️ ⛔ E A DERIVAÇÃO É **PURA** — ⛔ chamá-la duas vezes ⛔ não muda o
   * estado, ⛔ e ⛔ nada é gravado (**E-43**).
   */
  const antes = JSON.stringify(comIvt(vazio, 2));
  const c = comIvt(vazio, 2);
  est(c); est(c);
  conf(
    "⚠️⚠️ ⛔ e a derivação ⛔ NÃO grava ⛔ nada — o estado é o mesmo depois de lê-la",
    JSON.stringify(c) === antes,
    "⛔ conclusão persistida vira fato, ⛔ e fato ⛔ não se recalcula (**E-43**)"
  );
}

/* ══ ⚠️⚠️ 7 · O CAMPO DO JULGAMENTO ⛔ NÃO É FATO OPERACIONAL ═════════ */
{
  const campo = CAMPOS.campoDoModulo("condicao_concomitante_antiagregante");
  conf(
    "⚠️ o campo do julgamento existe, ⛔ e é respondível",
    campo !== undefined && campo.tipo === "escolha"
    && campo.opcoes.includes("Sim") && campo.opcoes.includes("Incerto"),
    `⛔ ${JSON.stringify(campo)}`
  );
  /**
   * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO ENTRA EM `FATOS_OPERACIONAIS`: ⛔ aqueles são
   * **disponibilidade do serviço**, ⛔ com barreira G → F. ⚠️ ⛔ Este é
   * julgamento **clínico** do episódio.
   */
  conf(
    "⚠️⚠️ ⛔ e ⛔ ele ⛔ NÃO foi declarado como fato operacional",
    !SG.IDS_OPERACIONAIS.includes("condicao_concomitante_antiagregante"),
    "⛔ disponibilidade do serviço ⛔ e julgamento clínico ⛔ não moram na mesma lista"
  );
  /** ⚠️ ⛔ E ⛔ ele ⛔ não bloqueia terapia ⛔ nenhuma. */
  conf(
    "⚠️ ⛔ e ⛔ ele ⛔ NÃO bloqueia terapia",
    campo?.bloqueiaTerapia === false,
    `⛔ bloqueiaTerapia=${campo?.bloqueiaTerapia}`
  );
}

if (falhas > 0) {
  console.log(`\n❌ ANTITROMBÓTICOS PÓS-IVT — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ ANTITROMBÓTICOS PÓS-IVT — ${ok}/${ok} conferências · ordem, exceção e dano separados`);
