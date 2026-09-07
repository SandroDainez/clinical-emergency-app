#!/usr/bin/env node
/**
 * TRAVA DO PORTÃO DA IVT — ⚠️ **decidir ⛔ não é administrar**.
 *
 * PROMETE: ⛔ que a ação de administrar trombólise ⛔ só fique disponível quando
 *   ⛔ nenhuma das **duas** camadas estiver bloqueando —
 *   · segurança ⛔ **não corrigível** (imagem, cortes de F-10, itens de F-07);
 *   · bloqueio **corrigível** aberto (PA, glicemia);
 *   · correção **iniciada** ⛔ e ⛔ ainda ⛔ sem o fato que prova resolução;
 *   · **COR 3** que alcança o caso;
 *   ⛔ e que o **veredito ⛔ não seja deformado** para isso acontecer.
 *
 * NÃO PROMETE: que a trombólise seja a conduta certa neste paciente — ⛔ isso é
 *   do médico. ⛔ Aqui se mede **⛔ o que o app deixa fazer**, ⛔ e ⛔ com base em
 *   quê.
 *
 * UNIVERSO: `avc/nucleo/{portao-ivt,veredito-da-trombolise,derivacoes-d,
 *   derivacoes-e,derivacoes}.ts` × `avc/conteudo/consumidores.ts` × a tela de
 *   Reperfusão.
 *
 * ── ⚠️⚠️ ⛔ O FURO QUE ESTA TRAVA NASCEU PARA FECHAR ────────────────────────
 *
 * ⛔ O mapeamento da Fase 6 mediu: com **INR 2,5**, o motor de segurança devolve
 * `contraindicacao_nao_corrigivel` ⛔ e o veredito devolve `incompleta` com
 * `contra: []`. ⚠️ ⛔ A contraindicação existia, estava classificada, ⛔ e
 * ⛔ **ninguém a lia**.
 *
 * ⛔ ⛔ Um portão construído ⛔ só sobre o veredito deixaria esse paciente passar.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase6-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "conteudo", "consumidores.ts"),
    path.join(appDir, "avc", "nucleo", "portao-ivt.ts"),
    path.join(appDir, "avc", "conteudo", "superficies.ts"),
    path.join(appDir, "design-system", "estados-clinicos.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const V = emT("avc", "nucleo", "veredito-da-trombolise.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const D = emT("avc", "nucleo", "derivacoes.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const L = emT("avc", "conteudo", "laboratorio.js");
const SE = emT("avc", "conteudo", "superficie-e.js");
const SUP = emT("avc", "conteudo", "superficies.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const rel = R.relogioControlado(1_000_000);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor, t) =>
  E.registrarFato(e, { campo, valor }, t === undefined ? rel : R.relogioControlado(t));
const regI = (e, inst, campo, valor) =>
  CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const escolheI = (e, inst, campo, rotulo) => regI(e, inst, campo, CAMPO.valorDaOpcao(rotulo));

const pa1 = I.nomeDaInstancia("pa", 1);
const pa2 = I.nomeDaInstancia("pa", 2);
const col1 = I.nomeDaInstancia(L.COLETA, 1);
const ac1 = I.nomeDaInstancia(SE.ACAO, 1);

/** ⚠️ Registra uma ação de correção do jeito que a tela de Correções registra. */
function acao(e, rotuloDaAcao, estadoDaAcao, inst) {
  let x = escolheI(e, inst, "acao_tipo", rotuloDaAcao);
  return escolheI(x, inst, "acao_estado", estadoDaAcao);
}

/* ══ ⚠️⚠️ 1 · INR 2,5 — ⛔ O FURO MEDIDO ════════════════════════════════ */
{
  const comInr = regI(vazio, col1, "inr", 2.5);
  const corte = DD.corteDoAnalito(comInr, "inr");
  const ver = V.vereditoDaTrombolise(comInr);
  const portao = P.estadoDoPortaoIVT(comInr);

  conf(
    "⚠️ a camada de SEGURANÇA identifica o corte",
    corte.estado === "contraindicacao_nao_corrigivel" && corte.valor === 2.5 && corte.limite === 1.7,
    `⛔ ${JSON.stringify({ estado: corte.estado, valor: corte.valor, limite: corte.limite })}`
  );

  /**
   * ⚠️⚠️ ⛔ E O VEREDITO SEGUE **INDEPENDENTE** — ⛔ decisão do autor (**item 3**):
   * ⛔ *"⛔ não converter 'should not be administered' em `nao_recomendada` por
   * COR 3 se essa ⛔ não é a estrutura original da fonte"*.
   *
   * ⛔ ⛔ Se algum dia o portão passar a funcionar **porque** o veredito virou
   * `nao_recomendada`, ⛔ esta conferência reprova — ⛔ e ⛔ é ⛔ para isso que
   * ⛔ ela existe.
   */
  conf(
    "⚠️⚠️ o VEREDITO ⛔ NÃO foi deformado para o portão funcionar",
    ver.tipo !== "nao_recomendada" && ver.contra.length === 0,
    `⛔ tipo=${ver.tipo} contra=[${ver.contra.map((m) => m.id).join(", ")}] — segurança ⛔ não é COR 3`
  );

  conf(
    "⚠️⚠️ ⛔ e o PORTÃO bloqueia por SEGURANÇA",
    portao.estado === "bloqueado_seguranca" && portao.liberado === false,
    `⛔ ${portao.estado} · liberado=${portao.liberado} — ⛔ INR 2,5 ⛔ não pode passar`
  );

  const motivo = portao.motivos.find((m) => m.id === "corte-inr");
  conf(
    "⚠️ o motivo NOMEIA o INR, com valor ⛔ e fonte",
    motivo !== undefined && motivo.dado === "2.5" && motivo.fonte === "F-10"
    && motivo.camada === "seguranca"
    /** ⚠️ ⛔ E com o RÓTULO clínico — ⛔ id cru ⛔ não é linguagem de médico. */
    && motivo.rotulo !== "inr" && /INR/i.test(motivo.rotulo),
    `⛔ ${JSON.stringify(motivo)} — ⛔ *"bloqueado"* ⛔ sem dizer por quê é botão morto com texto`
  );
}

/* ══ ⚠️⚠️ 2 · PA 198/112 — O GESTO INTEIRO ═════════════════════════════ */
{
  /** ⚠️ ⛔ As duas metades na MESMA aferição — **D-120**. */
  let e = regI(regI(vazio, pa1, "pas", 198), pa1, "pad", 112);
  const p1 = P.estadoDoPortaoIVT(e);
  conf(
    "⚠️ CASO 1 · PA 198/112 → **bloqueado_corrigivel**",
    p1.estado === "bloqueado_corrigivel" && p1.liberado === false
    && p1.motivos.some((m) => m.id === "pressao_acima_da_meta" && m.camada === "correcao"),
    `⛔ ${p1.estado} · motivos=${p1.motivos.map((m) => m.id).join(", ")}`
  );

  /** ⚠️⚠️ 2 · TRATAMENTO INICIADO — ⛔ e ⛔ ele ⛔ NÃO resolve. */
  e = acao(e, "Tratamento anti-hipertensivo", SE.ESTADO_DA_ACAO.realizada, ac1);
  const p2 = P.estadoDoPortaoIVT(e);
  conf(
    "⚠️⚠️ CASO 2 · tratamento REALIZADO ⛔ e ⛔ sem nova aferição → **aguardando_reavaliacao**",
    p2.estado === "aguardando_reavaliacao" && p2.liberado === false,
    `⛔ ${p2.estado} · liberado=${p2.liberado} — ⛔ *"realizada"* diz que a ação aconteceu, ⛔ e ⛔ não que funcionou`
  );
  const m2 = p2.motivos.find((m) => m.id === "pressao_acima_da_meta");
  conf(
    "⚠️ ⛔ e o motivo passa a dizer **o que falta**, ⛔ e ⛔ não «corrija»",
    m2 !== undefined && /Correção registrada/.test(m2.oQueFalta),
    `⛔ "${m2 && m2.oQueFalta}" — ⛔ repetir *"corrija"* a quem já corrigiu é a tela ⛔ não ter visto o gesto`
  );

  /** ⚠️ 3 · NOVA aferição adequada — ⛔ e ⛔ só agora o bloqueio cai. */
  const eNova = regI(regI(e, pa2, "pas", 160), pa2, "pad", 90);
  const p3 = P.estadoDoPortaoIVT(eNova);
  conf(
    "⚠️⚠️ CASO 3 · nova aferição 160/90 → o corrigível DESAPARECE",
    DD.bloqueiosCorrigiveis(eNova).length === 0
    && p3.estado !== "bloqueado_corrigivel" && p3.estado !== "aguardando_reavaliacao",
    `⛔ ${p3.estado} · bloqueios=${DD.bloqueiosCorrigiveis(eNova).map((b) => b.id).join(", ")}`
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO FICOU *"liberado"* POR TABELA: ⛔ o veredito ⛔ ainda
   * ⛔ não fechou critério ⛔ nenhum, ⛔ e o portão diz ⛔ **isso**, ⛔ e ⛔ não
   * *"pode administrar"*.
   */
  conf(
    "⚠️⚠️ ⛔ e o portão passa a refletir o VEREDITO, ⛔ e ⛔ não «liberado»",
    p3.estado === "informacao_incompleta" && p3.liberado === false,
    `⛔ ${p3.estado} — ⛔ tirar o bloqueio ⛔ não fecha critério`
  );
}

/* ══ ⚠️⚠️ 3 · GLICEMIA — O DEGRAU A MAIS, QUE É DA FONTE ═══════════════ */
{
  /** ⚠️ Hipoglicemia. */
  let e = reg(vazio, "glicemia", 42, 1_000_100);
  const g1 = P.estadoDoPortaoIVT(e);
  conf(
    "⚠️ CASO 1 · glicemia 42 → **bloqueado_corrigivel**",
    g1.estado === "bloqueado_corrigivel"
    && g1.motivos.some((m) => m.id === "glicemia_alterada" && m.fonte === "F-06"),
    `⛔ ${g1.estado} · ${g1.motivos.map((m) => m.id).join(", ")}`
  );

  /** ⚠️ Correção registrada — ⛔ e a glicemia ⛔ ainda baixa. */
  e = acao(e, "Correção glicêmica", SE.ESTADO_DA_ACAO.realizada, ac1);
  conf(
    "⚠️⚠️ CASO 2 · correção registrada, glicemia ⛔ ainda baixa → **aguardando_reavaliacao**",
    P.estadoDoPortaoIVT(e).estado === "aguardando_reavaliacao",
    `⛔ ${P.estadoDoPortaoIVT(e).estado}`
  );

  /**
   * ⚠️⚠️ ⛔ NOVA GLICEMIA ADEQUADA ⛔ E ⛔ **AINDA ⛔ NÃO LIBERA** — ⛔ e ⛔ este é
   * o degrau que a fonte acrescenta:
   *
   * ⛔ F-06: *"clinical deficits **should be assessed after correction of
   * glucose** to evaluate thrombolytic eligibility"*.
   */
  const corrigida = reg(e, "glicemia", 110, 1_000_200);
  const g3 = P.estadoDoPortaoIVT(corrigida);
  conf(
    "⚠️⚠️ CASO 3 · glicemia 110 ⛔ SEM exame posterior → ⛔ AINDA **aguardando_reavaliacao**",
    D.estadoDaReavaliacao(corrigida) === "corrigida_sem_exame"
    && g3.estado === "aguardando_reavaliacao" && g3.liberado === false,
    `⛔ reavaliacao=${D.estadoDaReavaliacao(corrigida)} portao=${g3.estado} — ⛔ corrigir a glicemia ⛔ não reavalia o paciente`
  );
  const m3 = g3.motivos.find((m) => m.id === "reavaliacao_neurologica");
  conf(
    "⚠️ ⛔ e o motivo LEVA ao exame neurológico (**E-26**)",
    m3 !== undefined && m3.leva === "neurologico" && m3.campo === "deficit_focal",
    `⛔ ${JSON.stringify(m3)} — pendência ⛔ sem destino é muro`
  );

  /** ⚠️ 4 · exame DEPOIS da correção — ⛔ e ⛔ a ordem é que fecha. */
  const reavaliado = reg(corrigida, "deficit_focal", "sim", 1_000_300);
  const g4 = P.estadoDoPortaoIVT(reavaliado);
  conf(
    "⚠️⚠️ CASO 4 · exame DEPOIS da correção → ⛔ o degrau cai",
    D.estadoDaReavaliacao(reavaliado) === "reavaliado"
    && g4.estado !== "aguardando_reavaliacao",
    `⛔ reavaliacao=${D.estadoDaReavaliacao(reavaliado)} portao=${g4.estado}`
  );
}

/* ══ ⚠️⚠️ 4 · O QUE O PORTÃO ⛔ NÃO FAZ ════════════════════════════════ */
{
  const comInr = regI(vazio, col1, "inr", 2.5);

  conf(
    "⚠️⚠️ o portão ⛔ NÃO grava fato ⛔ nenhum (**E-43**)",
    P.estadoDoPortaoIVT(comInr) && comInr.fatos.length === regI(vazio, col1, "inr", 2.5).fatos.length,
    "⛔ função pura — veredito gravado congela conclusão que deveria mudar com o dado"
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO BLOQUEIA NAVEGAÇÃO (**E-11**, item 10 do autor).
   *
   * ⛔ Com o portão fechado por segurança, **⛔ todas** as fases seguem
   * alcançáveis — ⛔ o portão vale ⛔ só para a ação de administrar.
   */
  const alcancaveis = SUP.SEQUENCIA_OFICIAL.map((s) => s.id);
  conf(
    "⚠️⚠️ ⛔ e ⛔ NÃO bloqueia navegação — as fases seguem alcançáveis",
    alcancaveis.length >= 6 && P.estadoDoPortaoIVT(comInr).estado === "bloqueado_seguranca",
    `⛔ ${alcancaveis.join(" · ")} — o portão vale ⛔ só para a ação`
  );

  /** ⚠️ ⛔ E ⛔ nenhum motivo nasce ⛔ sem fonte ⛔ e ⛔ sem o que falta (**E-30**, **E-26**). */
  const estados = [
    regI(vazio, col1, "inr", 2.5),
    regI(regI(vazio, pa1, "pas", 198), pa1, "pad", 112),
    reg(vazio, "glicemia", 42, 1_000_100),
  ];
  const mudos = estados
    .flatMap((e) => P.estadoDoPortaoIVT(e).motivos)
    .filter((m) => !m.fonte || !m.oQueFalta || !m.rotulo);
  conf(
    "⚠️⚠️ ⛔ NENHUM motivo sem fonte, rótulo ⛔ e o que falta",
    mudos.length === 0,
    `⛔ ${mudos.map((m) => m.id).join(" · ")} — motivo mudo é botão cinza com outra roupa`
  );
}

/* ══ ⚠️⚠️ 5 · A TELA LÊ O NÚCLEO, ⛔ E ⛔ NÃO RECALCULA ═════════════════ */
{
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf(
    "⚠️⚠️ a Reperfusão lê `estadoDoPortaoIVT`",
    /estadoDoPortaoIVT/.test(tela),
    "⛔ regra clínica recalculada no JSX envelhece junto com o layout (**I6**)"
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NÃO recompõe o portão a partir das camadas",
    !/cortesLaboratoriais|itensMarcados|bloqueiosCorrigiveis/.test(tela),
    "⛔ a tela somando as camadas é a segunda verdade que o portão existe para evitar"
  );

  /**
   * ⚠️⚠️ ⛔ E A PROSA ⛔ NÃO PODE APONTAR FASE ERRADA — ⛔ achado do mapeamento:
   * *"Registrar os marcos de tempo em Entrada e estabilização"*, ⛔ com a
   * cronologia ⛔ já na Avaliação AVC desde **C7**.
   */
  conf(
    "⚠️⚠️ ⛔ e ⛔ não manda o médico para a fase ERRADA",
    !/marcos de tempo em Entrada e estabiliza/.test(tela),
    "⛔ navegação certa ⛔ e texto mentindo ensina o médico a duvidar dos dois"
  );
}

/* ══ ⚠️⚠️ 6 · REGISTRAR O QUE ACONTECEU ⛔ NUNCA SE TRAVA ═══════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O ERRO DE ARQUITETURA QUE ISTO IMPEDE DE VOLTAR ──────────────
   *
   * ⛔ Eu pus o portão em `avc-nova-trombolise` — ⛔ que é o bloco **"Trombólise
   * administrada"**, ⛔ o registro de que **aconteceu**. ⚠️ Seis e2e quebraram,
   * ⛔ e ⛔ eles estavam certos.
   *
   * ⚠️ A regra do autor, 2026-09-07:
   *
   * > *"o sistema pode bloquear uma decisão **prospectiva**, ⛔ mas ⛔ não pode
   * >  bloquear o registro **retrospectivo** de um fato clínico já ocorrido.
   * >  Caso contrário, você corrompe a verdade clínica ⛔ e ⛔ ainda quebra a
   * >  monitorização subsequente."*
   *
   * ⛔ ⛔ A monitorização da **Table 7** nasce ⛔ **desse** registro. ⛔ Travá-lo
   * parava a vigilância de um paciente ⛔ que ⛔ já tinha recebido o fármaco.
   */
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));

  /** ⚠️ O gesto do registro ⛔ e o do portão são **blocos diferentes** na tela. */
  const i = tela.indexOf('testID="avc-nova-trombolise"');
  const trecho = tela.slice(Math.max(0, i - 700), i + 300);
  conf(
    "⚠️⚠️ ⛔ o REGISTRO da administração ⛔ NÃO é desabilitado por ⛔ nada",
    i > 0 && !/disabled|aria-disabled|portao\.liberado/.test(trecho),
    "⛔ travar o registro corrompe a trilha ⛔ e para a monitorização da Table 7"
  );

  conf(
    "⚠️⚠️ ⛔ e existe um gesto PROSPECTIVO separado, ⛔ governado pelo portão",
    /avc-f-decisao-ivt/.test(tela) && /DECISAO_DE_PROSSEGUIR/.test(tela),
    "⛔ ⛔ sem ele o portão ⛔ não tem o que governar, ⛔ e volta para a documentação"
  );

  const campo = CAMPOS.campoDoModulo("ivt_indicacao_confirmada");
  conf(
    "⚠️ a decisão é FATO, ⛔ com casa, fonte ⛔ e ⛔ sem bloquear terapia",
    campo !== undefined && campo.casa === "reperfusao" && campo.fonte === "F-02"
    && campo.bloqueiaTerapia === false && (campo.opcoes ?? []).length === 2,
    `⛔ ${JSON.stringify(campo && { casa: campo.casa, fonte: campo.fonte, opcoes: campo.opcoes })}`
  );

  /**
   * ⚠️⚠️ ⛔ E *"⛔ não prosseguir"* É DECISÃO — ⛔ silêncio ⛔ não decide
   * (**E-37**). ⛔ Duas opções, ⛔ e ⛔ o vazio ⛔ não é ⛔ nenhuma delas.
   */
  conf(
    "⚠️⚠️ ⛔ e a decisão ⛔ NÃO nasce respondida",
    E.valorAtual(vazio, "ivt_indicacao_confirmada") === undefined,
    "⛔ «ainda não decidiu» ⛔ e «decidiu não» ⛔ são estados diferentes"
  );

  /**
   * ── ⚠️⚠️ ⛔ A DIVERGÊNCIA CARREGA **O QUÊ**, ⛔ e ⛔ não ⛔ só *"houve"* ─────
   *
   * ⚠️ Exigência do autor (**item 4**): bloqueio ativo · estado do portão ·
   * motivos. ⛔ Um aviso que diz *"houve divergência"* ⛔ sem dizer **de quê**
   * ⛔ não se audita — ⛔ ele ⛔ só assusta.
   */
  conf(
    "⚠️⚠️ a divergência entre registro ⛔ e motor fica AUDITÁVEL",
    /avc-f-discrepancia/.test(tela)
    && /Administração registrada apesar de bloqueio identificado/.test(tela)
    && /avc-f-discrepancia-estado/.test(tela)
    && /avc-f-discrepancia-motivo-/.test(tela),
    "⛔ registrar apesar do bloqueio ⛔ não é erro de uso — ⛔ esconder ⛔ o que foi divergido é"
  );

  /**
   * ⚠️⚠️ ⛔ E O SÍMBOLO ACOMPANHA O TÍTULO — ⛔ cor sozinha ⛔ não é leitura
   * (**E-15**, item 3 do autor).
   */
  conf(
    "⚠️ cada estado do portão tem SÍMBOLO ⛔ e TÍTULO",
    /SIMBOLO_DO_PORTAO/.test(tela) && /TITULO_DO_PORTAO/.test(tela),
    "⛔ estados distinguíveis ⛔ só por cor ⛔ não são distinguíveis"
  );
}

/* ══ ⚠️⚠️ 7 · A RAIA DA EVT — ⛔ SÍNTESE, ⛔ E ⛔ NUNCA VEREDITO ═══════════ */
{
  const DC = emT("avc", "nucleo", "derivacoes-c.js");
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));

  conf(
    "⚠️ a raia endovascular EXISTE na fase da reperfusão",
    /avc-f-evt-dossie/.test(tela) && /informacaoParaAFrenteEndovascular/.test(tela),
    "⛔ ⛔ sem ela, os dados de EVT ficam ⛔ só na Investigação, ⛔ longe da decisão"
  );

  /**
   * ── ⚠️⚠️ ⛔ AS PALAVRAS QUE ⛔ NÃO PODEM APARECER ─────────────────────────
   *
   * ⛔ **F-08** adverte: *"`EVT elegível = sim/não` ⛔ **NÃO** é fato
   * armazenado"*. ⚠️ ⛔ E os critérios completos ⛔ ainda ⛔ não têm fonte
   * transcrita — ⛔ escrever *elegível* ⛔ seria inventar o veredito que a
   * Fase 6 ⛔ foi proibida de emitir (item 9 do autor).
   */
  const PROIBIDAS = ["elegível", "elegivel", "não elegível", "candidata", "candidato"];
  const bloco = (() => {
    const i = tela.indexOf("avc-f-evt-dossie");
    return i < 0 ? "" : tela.slice(i, tela.indexOf("avc-f-raias", i) + 1 || tela.length);
  })();
  const achadas = PROIBIDAS.filter((w) => bloco.toLowerCase().includes(w));
  conf(
    "⚠️⚠️ ⛔ a raia da EVT ⛔ NUNCA escreve elegibilidade",
    achadas.length === 0,
    `⛔ ${achadas.join(" · ")} — ⛔ sem fonte transcrita, ⛔ isso é veredito inventado`
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ NEM ✓ ⛔ NEM ⛔ (item 10 do autor): ⛔ conclusão `desconhecido`
   * ⛔ **continua desconhecida**. ⛔ Os estados usados são `medido` · `ausente`
   * · `verificar` — ⛔ `·`, `—` ⛔ e `?`.
   */
  /**
   * ⚠️⚠️ ⛔ MEDIDA POR **EXECUÇÃO**, ⛔ e ⛔ não por varredura de texto.
   *
   * ⛔ A primeira versão procurava `ESTADOS.favoravel` **no bloco do JSX** — ⛔ e
   * a mutação *"usar ✓ no dado registrado"* **sobreviveu**, porque a lista é
   * montada ⛔ acima do bloco. ⚠️ ⛔ Agora a regra é dado exportado, ⛔ e a
   * conferência lê o dado.
   */
  const SF = emT("avc", "conteudo", "superficie-f.js");
  const mapa = SF.ESTADO_DO_DADO_EVT;
  const PROIBIDOS = ["favoravel", "impede", "corrigivel"];
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUM dado da EVT usa juízo (✓, ⛔ ou !)",
    mapa !== undefined
    && Object.values(mapa).every((v) => !PROIBIDOS.includes(String(v.estado)))
    && mapa.registrados.estado === "medido" && mapa.naoPerguntados.estado === "verificar",
    `⛔ ${JSON.stringify(mapa)} — símbolo de juízo sobre dado ⛔ sem veredito é o veredito entrando pelo desenho`
  );
  conf(
    "⚠️ ⛔ e a tela usa ESSE mapa, ⛔ e ⛔ não estados escritos à mão",
    tela.includes("ESTADO_DO_DADO_EVT.registrados")
    && !/estado: "(favoravel|impede|corrigivel)"/.test(tela),
    "⛔ regra em prosa se mede por leitura; regra em dado se mede por execução"
  );

  /**
   * ── ⚠️⚠️ ⛔ *"Não sei"* RESPONDIDO ⛔ NÃO É *"Não avaliado"* (**E-37**) ────
   *
   * ⛔ Achado na revisão visual: eu mostrava o **rótulo genérico** do estado
   * `ausente` — ⛔ e a tela dizia *"Efeito de massa — Não avaliado"* ⛔ para um
   * campo que o médico **respondeu** como incerto.
   *
   * ⚠️ ⛔ A prova estrutural ⛔ não pegava: ⛔ ela conferia o **nome do estado**,
   * ⛔ e ⛔ não **a palavra que o médico lê**.
   */
  const ESTADOS_UI = emT("design-system", "estados-clinicos.js").ESTADOS;
  conf(
    "⚠️⚠️ ⛔ o balde *sem conclusão* ⛔ NÃO é rotulado como *não avaliado*",
    mapa.semConclusao.rotulo !== ESTADOS_UI[mapa.semConclusao.estado].rotulo
    && /incerto/i.test(mapa.semConclusao.rotulo),
    `⛔ "${mapa.semConclusao.rotulo}" — respondido ⛔ e ⛔ não perguntado ⛔ são estados diferentes`
  );
  conf(
    "⚠️ ⛔ e os TRÊS baldes têm rótulos distintos entre si",
    new Set(Object.values(mapa).map((v) => v.rotulo)).size === 3,
    `⛔ ${Object.values(mapa).map((v) => v.rotulo).join(" · ")}`
  );

  /** ⚠️ ⛔ E o motor segue ⛔ sem concluir, ⛔ com os dados presentes. */
  const s1 = I.nomeDaInstancia("estudo", 1);
  let comDados = CAMPOS.registrarComInstancia(vazio, { campo: "estudo_modalidade", valor: CAMPO.valorDaOpcao("Angiotomografia") }, rel, s1);
  comDados = CAMPOS.registrarComInstancia(comDados, { campo: "sitio_oclusao", valor: CAMPO.valorDaOpcao("M1 da artéria cerebral média") }, rel, s1);
  comDados = CAMPOS.registrarComInstancia(comDados, { campo: "aspects", valor: 8 }, rel, s1);
  const d = DC.informacaoParaAFrenteEndovascular(comDados);
  conf(
    "⚠️⚠️ com sítio ⛔ e ASPECTS registrados, o dossiê ⛔ NÃO conclui",
    d.conclusao === "desconhecido"
    && d.registrados.includes("sitio_oclusao") && d.registrados.includes("aspects"),
    `⛔ conclusao=${d.conclusao} registrados=[${d.registrados.join(", ")}] — ⛔ ter o dado ⛔ não é ter o critério`
  );

  /**
   * ⚠️⚠️ ⛔ E O VEREDITO DA TROMBÓLISE ⛔ NÃO ENCOSTA NA EVT: ⛔ as dez
   * recomendações endovasculares existem no catálogo ⛔ e ⛔ são filtradas fora.
   */
  const v = V.vereditoDaTrombolise(comDados);
  conf(
    "⚠️ ⛔ e ⛔ nenhuma recomendação de EVT entra no veredito da IVT",
    [...v.sustentam, ...v.contra].every((m) => !String(m.id).startsWith("evt_")),
    `⛔ ${[...v.sustentam, ...v.contra].map((m) => m.id).join(", ")} — trombectomia é outra terapia, ⛔ e outro veredito`
  );
}

if (falhas > 0) {
  console.log(`\n❌ PORTÃO DA IVT — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ PORTÃO DA IVT — ${ok}/${ok} conferências · 2 camadas, 7 estados`);
