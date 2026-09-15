#!/usr/bin/env node
/**
 * PROVA · AC-13 REABERTO (autor, 2026-09-14; `docs/decisoes.md`, seção "AC-13 reaberto", §1 a §9).
 *
 * PROMETE: item a item, na ordem de implementação 1 → 2 → 5 → 6 → 3 → 4 → 7:
 *  · item 1 — a exposição ao trombolítico é triestado (`exposta`, `nao_exposta`, `desconhecida`), com a
 *    agregação decidida pelo autor, e todo consumidor clínico que depende dela declara `desconhecida`
 *    em vez de devolver, calado, a saída de "sem trombólise". A conduta atual de cada consumidor é
 *    preservada: a conduta clínica final diante de `desconhecida` NÃO é decidida aqui (§9).
 *  · item 2 — «Limpar» e a correção por engano são linhas próprias da trilha; nenhuma linha é vigente quando o
 *    valor atual da instância está vazio; «Limpar» mantém a exposição já registrada e só a correção explícita,
 *    com motivo, a retira; a retomada pelo log devolve a mesma trilha.
 *  · item 5 — na trombólise, o estado que contraria a ordem causal decidida é detectado sem gravar nada; confirmado,
 *    entra como correção explícita do registro com que conflita, sem motivo, sem retirar exposição, e a trilha o
 *    marca fora da ordem. Correções fica fora da regra nesta rodada (§9).
 *  · item 6 — na trombólise, o núcleo ignora a transição idêntica repetida (mesma instância, mesmo valor, mesmo
 *    horário clínico, último fato do campo sendo registro) sem gerar evento; marcar, limpar ou corrigir, e marcar
 *    de novo, continua registrando; outros campos e Correções não mudam.
 *  · item 5, complemento (§10) — Cancelada, Interrompida e Administrada/concluída são terminais distintos: sair
 *    de um deles para outro estado pede confirmação e entra como correção explícita; o terminal reaberto por
 *    correção confirmada deixa de pedir confirmação para os registros seguintes.
 *  · item 3 (§11, E-49 aprovada) — horário clínico separado do horário do registro: Iniciada lê só ivt_inicio;
 *    Administrada/concluída e Interrompida pedem resolução documental por fato ligado à transição; Prescrita,
 *    Preparada e Cancelada aceitam horário opcional; Indicada e Decidida sem horário; o caminho hemorrágico não usa
 *    o horário do registro. Regressões E-49: o veredito da EVT e o portão da IVT não mudam com a ausência do horário
 *    (marca 6), e a última dose de DOAC nunca é inferida dele (marca 7).
 *  · item 4 (§10) — autoria: nome de exibição de `full_name`, senão `nome`, nunca do e-mail; a tela diz «Registrado
 *    por:» com o nome ou «Autoria não identificada», nunca um identificador; o evento v4 guarda o nome e os
 *    eventos antigos migram sem nome; o nome é snapshot gravado no evento no momento do registro, nunca
 *    recalculado a partir do perfil atual da conta.
 * NÃO PROMETE: que a conduta diante de `desconhecida` esteja certa. Ela ainda não foi decidida.
 * UNIVERSO: `avc/nucleo/{derivacoes-f,derivacoes-g,alvo-pressorico,caminho-hemorragico,plano-48h,
 *   sintese-do-caso,transicoes-da-acao,correcao-da-acao,ordem-da-acao,horario-clinico}.ts`, `avc/persistencia/{log,autoria,tipos}.ts`.
 * FONTE: `docs/decisoes.md`, AC-13 reaberto, §1 e §9.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ac13-reaberto-"));
const entradas = [
  "avc/nucleo/portao-ivt.ts", "avc/nucleo/derivacoes-f.ts", "avc/nucleo/derivacoes-g.ts", "avc/nucleo/alvo-pressorico.ts",
  "avc/nucleo/caminho-hemorragico.ts", "avc/nucleo/plano-48h.ts", "avc/nucleo/sintese-do-caso.ts", "avc/nucleo/transicoes-da-acao.ts",
  "avc/nucleo/correcao-da-acao.ts",
  "avc/nucleo/ordem-da-acao.ts",
  "avc/nucleo/horario-clinico.ts", "avc/nucleo/veredito-da-trombectomia.ts", "avc/nucleo/derivacoes-d.ts",
  "avc/nucleo/problemas-ativos.ts",
  "avc/persistencia/autoria.ts", "avc/persistencia/tipos.ts",
  "avc/persistencia/log.ts", "avc/conteudo/campos.ts", "avc/conteudo/superficies.ts", "design-system/estados-clinicos.ts",
];
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--moduleResolution", "node",
    "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...entradas.map((f) => path.join(appDir, f))], { cwd: appDir, stdio: "pipe" });
} catch { /* erro de tipo em dependência não impede a emissão */ }
const emT = (p) => { try { return require(path.join(tmp, p)); } catch { return undefined; } };

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const J = (x) => JSON.stringify(x);

const R = emT("avc/nucleo/relogio.js");
const E = emT("avc/nucleo/estado.js");
const I = emT("avc/nucleo/instancia.js");
const CAMPOS = emT("avc/conteudo/campos.js");
const SC = emT("avc/conteudo/superficie-c.js");
const SF = emT("avc/conteudo/superficie-f.js");
const DF = emT("avc/nucleo/derivacoes-f.js");
const DG = emT("avc/nucleo/derivacoes-g.js");
const AP = emT("avc/nucleo/alvo-pressorico.js");
const CH = emT("avc/nucleo/caminho-hemorragico.js");
const PL = emT("avc/nucleo/plano-48h.js");
const SIN = emT("avc/nucleo/sintese-do-caso.js");
const LOG = emT("avc/persistencia/log.js");

const AGORA = 1_800_000_000_000;
const MIN = 60_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const regI = (e, inst, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);

/** ⚠️ Cada argumento é UMA instância de trombólise: a lista de situações registradas nela, em ordem. Lista vazia = instância aberta sem situação. */
function atendimento(...instancias) {
  let e = vazio;
  for (const situacoes of instancias) {
    e = I.abrirNovaInstancia(e, SF.TROMBOLISE_IV, rel);
    const inst = I.instanciasDe(e, SF.TROMBOLISE_IV).slice(-1)[0];
    for (const s of situacoes) e = regI(e, inst, "ivt_estado", s);
  }
  return e;
}
function comHemorragia(e) {
  const est = I.nomeDaInstancia(SC.ESTUDO, 1);
  let x = regI(e, est, "estudo_modalidade", SC.MODALIDADE.tcSemContraste);
  x = regI(x, est, "estudo_hora", AGORA - 10 * MIN);
  return regI(x, est, "estudo_resultado", SC.RESULTADO_TC.hemorragia);
}
const tenta = (fn) => { try { return fn(); } catch (err) { return { erro: String(err && err.message).slice(0, 120) }; } };
const certeza = (e) => tenta(() => DF.certezaDaExposicaoAoTrombolitico(e));

/* ══ ITEM 1 · a exposição é triestado ═══════════════════════════════════════ */

/* 1a · a classificação de cada instância */
{
  const porForma = {
    exposta: atendimento(["Iniciada"]),
    nao_exposta_cancelada: atendimento(["Cancelada"]),
    nao_exposta_antes_do_inicio: atendimento(["Preparada"]),
    desconhecida_nao_sei: atendimento(["nao_sei"]),
    desconhecida_em_aberto: atendimento([]),
  };
  const lida = Object.fromEntries(Object.entries(porForma).map(([k, e]) => [k, tenta(() => DF.certezaDaInstancia(DF.exposicaoAoTrombolitico(e)))]));
  conf("1a · cada forma de exposição tem a sua certeza: exposta · não exposta · desconhecida",
    lida.exposta === "exposta" && lida.nao_exposta_cancelada === "nao_exposta" && lida.nao_exposta_antes_do_inicio === "nao_exposta"
      && lida.desconhecida_nao_sei === "desconhecida" && lida.desconhecida_em_aberto === "desconhecida",
    `⛔ ${J(lida)}`);
  conf("1a · sem nenhuma instância de trombólise → não exposta", certeza(vazio) === "nao_exposta", `⛔ ${J(certeza(vazio))}`);
}

/* 1b · a agregação decidida pelo autor */
{
  const casos = [
    ["«não sei» sozinho", [["nao_sei"]], "desconhecida"],
    ["cancelada + «não sei»", [["Cancelada"], ["nao_sei"]], "desconhecida"],
    ["«não sei» + cancelada", [["nao_sei"], ["Cancelada"]], "desconhecida"],
    ["preparada + «não sei»", [["Preparada"], ["nao_sei"]], "desconhecida"],
    ["iniciada + «não sei»", [["Iniciada"], ["nao_sei"]], "exposta"],
    ["administrada + cancelada", [["Administrada/concluída"], ["Cancelada"]], "exposta"],
    ["cancelada + preparada", [["Cancelada"], ["Preparada"]], "nao_exposta"],
    ["instância aberta vazia", [[]], "desconhecida"],
    /** ⚠️ Abrir instância reaproveita a última se ela estiver vazia (A17): a vazia só existe DEPOIS de uma com situação. */
    ["cancelada + nova instância aberta vazia", [["Cancelada"], []], "desconhecida"],
    ["iniciada + nova instância aberta vazia", [["Iniciada"], []], "exposta"],
    ["«não sei» depois de iniciada, na mesma instância", [["Iniciada", "nao_sei"]], "exposta"],
  ];
  for (const [nome, inst, esperado] of casos) {
    const obtido = certeza(atendimento(...inst));
    conf(`1b · ${nome} → ${esperado}`, obtido === esperado, `⛔ ${J(obtido)}`);
  }
  const x = tenta(() => DF.exposicaoAoTrombolitico(atendimento(["Cancelada"], ["nao_sei"])));
  conf("1b · a exposição detalhada do atendimento segue a agregação: cancelada ⛔ não esconde a «não sei»",
    x && x.estado === "situacao_desconhecida", `⛔ ${J(x)}`);
}

/* 1c · todo consumidor clínico declara `desconhecida` */
for (const [nome, e] of [["«não sei» sozinho", atendimento(["nao_sei"])], ["cancelada + «não sei»", atendimento(["Cancelada"], ["nao_sei"])]]) {
  const p = tenta(() => DG.pertinenciaDaMonitorizacao(e));
  conf(`1c · ${nome} · monitorização declara a exposição desconhecida`,
    p && p.certeza === "desconhecida" && p.motivo === "exposicao_desconhecida", `⛔ ${J(p)}`);
  const f = tenta(() => DG.faseDaMonitorizacao(e, AGORA));
  conf(`1c · ${nome} · fase da monitorização declara a exposição desconhecida`, f && f.tipo === "exposicao_desconhecida", `⛔ ${J(f)}`);
  const pa = tenta(() => DG.estadoPressoricoPosIvt(e, AGORA));
  conf(`1c · ${nome} · PA pós-trombólise declara a exposição desconhecida`, pa && pa.estado === "exposicao_desconhecida", `⛔ ${J(pa && pa.estado)}`);
  const at = tenta(() => DG.estadoAntitromboticoPosIvt(e, AGORA));
  conf(`1c · ${nome} · antitrombóticos declaram a exposição desconhecida, com aspirina IV indeterminada`,
    at && at.estado === "exposicao_desconhecida" && at.aspirinaIvNosNoventaMin === undefined, `⛔ ${J(at && [at.estado, at.aspirinaIvNosNoventaMin])}`);
  const alvos = tenta(() => AP.leituraDosAlvosPressoricos(e, AGORA));
  conf(`1c · ${nome} · alvos pressóricos declaram a exposição desconhecida`, alvos && alvos.exposicao === "desconhecida", `⛔ ${J(alvos)}`);
  const c = tenta(() => CH.caminhoHemorragico(comHemorragia(e)));
  conf(`1c · ${nome} · caminho hemorrágico declara a infusão desconhecida`, c && c.infusao === "desconhecida", `⛔ ${J(c && c.infusao)}`);
  const d = tenta(() => PL.desfechosNegativos(e));
  conf(`1c · ${nome} · desfechos negativos declaram a exposição desconhecida`, d && d.exposicaoIvt === "desconhecida", `⛔ ${J(d)}`);
  const plano = tenta(() => PL.planoAte48h(e, AGORA));
  conf(`1c · ${nome} · plano até 48 h declara o caminho da trombólise como incerto`,
    plano && Array.isArray(plano.incertezas) && plano.incertezas.some((x) => x.caminho === "ivt"), `⛔ ${J(plano && plano.incertezas)}`);
  const s = tenta(() => SIN.sinteseDoCaso(e, rel, []));
  conf(`1c · ${nome} · síntese declara a situação da trombólise desconhecida`,
    s && Array.isArray(s.situacao) && s.situacao.some((l) => l.id === "trombolise-desconhecida"), `⛔ ${J(s && s.situacao)}`);
  const snap = tenta(() => LOG.conclusoesDo(e, AGORA));
  conf(`1c · ${nome} · conclusão gravada no log carrega a certeza`, snap && snap.exposicao_trombolitico_certeza === "desconhecida", `⛔ ${J(snap)}`);
}

/* 1d · a conduta atual é PRESERVADA diante de `desconhecida` (§9: conduta final não é decidida agora) */
{
  const e = atendimento(["nao_sei"]);
  const p = tenta(() => DG.pertinenciaDaMonitorizacao(e));
  conf("1d · «não sei» · a monitorização pós-trombólise continua não aplicada", p && p.pertinente === false, `⛔ ${J(p)}`);
  const antigos = tenta(() => AP.alvosPressoricosAplicaveis(e, AGORA));
  const alvos = tenta(() => AP.leituraDosAlvosPressoricos(e, AGORA));
  conf("1d · «não sei» · os alvos aplicados continuam os de antes da trombólise",
    J(antigos) === J(["antes_ivt"]) && alvos && J(alvos.aplicaveis) === J(["antes_ivt"]), `⛔ ${J([antigos, alvos])}`);
  const c = tenta(() => CH.caminhoHemorragico(comHemorragia(e)));
  conf("1d · «não sei» · o caminho hemorrágico ⛔ ganha pendência de interromper infusão",
    c && Array.isArray(c.pendencias) && !c.pendencias.some((x) => x.id === "registrar_interrupcao_da_infusao"), `⛔ ${J(c && c.pendencias)}`);
  const d = tenta(() => PL.desfechosNegativos(e));
  conf("1d · «não sei» · a trombólise ⛔ passa a contar como exposta", d && d.ivtExposta === false, `⛔ ${J(d)}`);
  conf("1d · «não sei» · nenhuma administração é contada", DF.administracoesRegistradas(e) === 0, `⛔ ${DF.administracoesRegistradas(e)}`);
}

/* 1e · não regressão: exposta e não exposta continuam como eram */
{
  const exp = atendimento(["Iniciada"]);
  const naoExp = atendimento(["Cancelada"]);
  const pe = tenta(() => DG.pertinenciaDaMonitorizacao(exp));
  const pn = tenta(() => DG.pertinenciaDaMonitorizacao(naoExp));
  conf("1e · exposta · monitorização pertinente, certeza exposta", pe && pe.pertinente === true && pe.certeza === "exposta", `⛔ ${J(pe)}`);
  conf("1e · não exposta · monitorização não pertinente, motivo sem administração, certeza não exposta",
    pn && pn.pertinente === false && pn.motivo === "sem_administracao_registrada" && pn.certeza === "nao_exposta", `⛔ ${J(pn)}`);
  conf("1e · não exposta · antitrombóticos fora do contexto pós-IVT",
    tenta(() => DG.estadoAntitromboticoPosIvt(naoExp, AGORA).estado) === "fora_do_contexto_pos_ivt", "⛔");
  conf("1e · não exposta · caminho hemorrágico sem trombólise",
    tenta(() => CH.caminhoHemorragico(comHemorragia(naoExp)).infusao) === "sem_trombolise", "⛔");
  conf("1e · exposta · caminho hemorrágico com infusão em curso",
    tenta(() => CH.caminhoHemorragico(comHemorragia(exp)).infusao) === "em_curso", "⛔");
  const an = tenta(() => AP.leituraDosAlvosPressoricos(naoExp, AGORA));
  conf("1e · não exposta · alvos de antes da trombólise, exposição não exposta",
    an && J(an.aplicaveis) === J(["antes_ivt"]) && an.exposicao === "nao_exposta", `⛔ ${J(an)}`);
  conf("1e · sem nenhuma instância · plano sem incerteza da trombólise",
    tenta(() => (PL.planoAte48h(vazio, AGORA).incertezas || []).length) === 0, "⛔");
}

/* ══ ITEM 2 · a trilha fiel: desfazer e corrigir são eventos próprios ═══════ */
/**
 * Decisão do autor (AC-13 reaberto, §2 e §9): «Limpar» não apaga a consequência clínica de uma exposição
 * já registrada; a exposição só sai por correção explícita do registro que a originou, com motivo e
 * trilha; o estado vigente vem do estado reconstruído atual, e nunca da última linha listada.
 */
/** ⚠️ Uma exceção dentro de um bloco vira vermelho contado, ⛔ interrompe a prova. */
const bloco = (nome, fn) => {
  try { fn(); } catch (err) { conf(`${nome} · a conferência terminou sem exceção`, false, `⛔ ${String(err && err.message).slice(0, 160)}`); }
};
const TA = emT("avc/nucleo/transicoes-da-acao.js");
const CA = emT("avc/nucleo/correcao-da-acao.js");
const SE2 = emT("avc/conteudo/superficie-e.js");
const inst1 = (e) => I.instanciasDe(e, SF.TROMBOLISE_IV)[0];
const trilha = (e, inst = inst1(e), campo = "ivt_estado") => tenta(() => TA.transicoesDoEstadoDaAcao(e, inst, campo));
/** ⚠️ O gesto «Limpar» da tela: correção sem motivo, que devolve o campo a vazio. */
const limpar = (e, inst = inst1(e), campo = "ivt_estado") => CAMPOS.corrigirNaInstancia(e, { campo, valor: "nao_perguntado" }, rel, inst);
const corrigirEngano = (e, fatoId) => tenta(() => CA.corrigirRegistroDaAcaoPorEngano(e, fatoId, rel));
const idDoRegistro = (e, rotulo, inst = inst1(e), campo = "ivt_estado") =>
  (I.fatosDaInstancia(e, inst).filter((f) => f.campo === campo && f.valor === rotulo).slice(-1)[0] || {}).id;

/* 2a · «Limpar» vira linha própria, nada fica vigente, e a exposição fica */
bloco("2a", () => {
  const e = limpar(atendimento(["Iniciada"]));
  const t = trilha(e);
  conf("2a · «Limpar» depois de «Iniciada» → a trilha tem o registro e a limpeza, na ordem",
    Array.isArray(t) && t.length === 2 && t[0].tipo === "registro" && t[0].estado === "iniciado"
      && t[1].tipo === "limpeza" && t[1].corrigeFatoId === t[0].fatoId, `⛔ ${J(t)}`);
  conf("2a · depois de «Limpar», nenhuma linha é a situação vigente", Array.isArray(t) && t.every((x) => x.vigente === false), `⛔ ${J(t)}`);
  conf("2a · «Limpar» ⛔ apaga a exposição já registrada (decisão do autor)", certeza(e) === "exposta", `⛔ ${J(certeza(e))}`);
  for (const rotulo of ["Administrada/concluída", "Interrompida"]) {
    const x = limpar(atendimento([rotulo]));
    conf(`2a · «Limpar» depois de «${rotulo}» → a exposição continua`, certeza(x) === "exposta", `⛔ ${J(certeza(x))}`);
  }
});

/* 2b · correção explícita por engano: o registro é invalidado, com motivo, e a exposição sai */
bloco("2b", () => {
  const base = atendimento(["Iniciada"]);
  const e = corrigirEngano(base, idDoRegistro(base, "Iniciada"));
  const t = trilha(e);
  conf("2b · correção por engano → o registro corrigido fica marcado como invalidado por correção",
    Array.isArray(t) && t.length === 2 && t[0].tipo === "registro" && t[0].invalidadaPorCorrecao === true
      && t[1].tipo === "correcao_por_engano" && t[1].corrigeFatoId === t[0].fatoId && t[1].motivo === "registrado por engano", `⛔ ${J(t)}`);
  conf("2b · depois da correção, nenhuma linha é a situação vigente", Array.isArray(t) && t.every((x) => x.vigente === false), `⛔ ${J(t)}`);
  conf("2b · a correção explícita retira a exposição: a instância volta a não ter situação, e a certeza é desconhecida",
    certeza(e) === "desconhecida" && tenta(() => DF.exposicaoDaInstancia(e, inst1(e)).estado) === "registro_em_aberto", `⛔ ${J([certeza(e), tenta(() => DF.exposicaoDaInstancia(e, inst1(e)))])}`);
  const depois = regI(e, inst1(e), "ivt_estado", "Cancelada");
  const x = tenta(() => DF.exposicaoAoTrombolitico(depois));
  conf("2b · corrigida por engano e depois «Cancelada» → não exposta, sem contradição, com «Cancelada» vigente",
    certeza(depois) === "nao_exposta" && x && x.estado === "cancelada_antes_do_inicio"
      && (trilha(depois) || []).filter((y) => y.vigente).map((y) => y.estado).join() === "cancelado", `⛔ ${J([certeza(depois), x, trilha(depois)])}`);
  const dupla = corrigirEngano(e, idDoRegistro(base, "Iniciada"));
  conf("2b · corrigir de novo o mesmo registro ⛔ cria segunda correção",
    dupla && Array.isArray(dupla.fatos) && dupla.fatos.length === e.fatos.length, `⛔ ${dupla && dupla.fatos && dupla.fatos.length} × ${e.fatos.length}`);
  const t0 = trilha(e) || [];
  const daCorrecao = t0.find((y) => y.tipo === "correcao_por_engano");
  const sobreCorrecao = daCorrecao ? corrigirEngano(e, daCorrecao.fatoId) : undefined;
  conf("2b · uma correção ⛔ pode ser corrigida por engano como se fosse registro",
    sobreCorrecao && sobreCorrecao.fatos && sobreCorrecao.fatos.length === e.fatos.length, `⛔ ${J(sobreCorrecao && sobreCorrecao.fatos && sobreCorrecao.fatos.length)}`);
});

/* 2c · só o registro corrigido perde a validade */
bloco("2c", () => {
  const base = atendimento(["Iniciada", "Interrompida"]);
  const e = corrigirEngano(base, idDoRegistro(base, "Interrompida"));
  const x = tenta(() => DF.exposicaoAoTrombolitico(e));
  conf("2c · «Iniciada» → «Interrompida» corrigida por engano → continua exposta, na fase iniciada",
    x && x.estado === "exposta" && x.fase === "iniciada", `⛔ ${J(x)}`);
});

/* 2c · a hora da interrupção lida pelo caminho hemorrágico ignora a interrupção corrigida por engano */
bloco("2c", () => {
  let e = atendimento(["Iniciada"]);
  const inst = inst1(e);
  e = CAMPOS.registrarComInstancia(e, { campo: "ivt_estado", valor: "Interrompida", horaClinica: AGORA - 30 * MIN }, rel, inst);
  e = CAMPOS.registrarComInstancia(e, { campo: "ivt_estado", valor: "Interrompida", horaClinica: AGORA - 5 * MIN }, rel, inst);
  const x = corrigirEngano(e, idDoRegistro(e, "Interrompida"));
  const c = tenta(() => CH.caminhoHemorragico(comHemorragia(x)));
  conf("2c · segunda «Interrompida» corrigida por engano → o caminho hemorrágico lê a hora da primeira",
    c && c.infusao === "interrompida" && c.interrompidaEm === AGORA - 30 * MIN, `⛔ ${J(c && [c.infusao, c.interrompidaEm])}`);
});

/* 2d · propriedade: a linha vigente é sempre a do estado reconstruído atual */
bloco("2d", () => {
  let semente = 20260914;
  const sorteio = (n) => { semente = (semente * 1103515245 + 12345) % 2147483648; return semente % n; };
  const ROTULOS = ["Indicada", "Decidida", "Prescrita", "Preparada", "Iniciada", "Administrada/concluída", "Interrompida", "Cancelada", "nao_sei"];
  const violacoes = [];
  for (let seq = 0; seq < 150 && violacoes.length < 3; seq++) {
    let e = atendimento([]);
    const passos = [];
    for (let k = 0; k < 7; k++) {
      const acao = sorteio(3);
      if (acao === 0) { const r = ROTULOS[sorteio(ROTULOS.length)]; e = regI(e, inst1(e), "ivt_estado", r); passos.push(r); }
      else if (acao === 1) { e = limpar(e); passos.push("limpar"); }
      else {
        const validos = (trilha(e) || []).filter((t) => t.tipo === "registro" && !t.invalidadaPorCorrecao);
        if (validos.length > 0) { const alvo = validos[sorteio(validos.length)]; e = corrigirEngano(e, alvo.fatoId); passos.push(`engano:${alvo.estado ?? "nao_sei"}`); }
      }
      const t = trilha(e);
      const fatos = I.fatosDaInstancia(e, inst1(e)).filter((f) => f.campo === "ivt_estado");
      const atual = I.valorNaInstancia(e, inst1(e), "ivt_estado");
      const vigentes = Array.isArray(t) ? t.filter((x) => x.vigente) : null;
      const atualValido = atual !== undefined && String(atual.valor) !== "nao_perguntado";
      const ok = Array.isArray(t) && t.length === fatos.length && t.every((x, i) => x.fatoId === fatos[i].id)
        && vigentes.length === (atualValido ? 1 : 0)
        && (!atualValido || vigentes[0].fatoId === atual.id);
      if (!ok) { violacoes.push({ passos: [...passos], trilha: t && t.map((x) => [x.tipo, x.estado, x.vigente]) }); break; }
    }
  }
  conf("2d · propriedade: todo fato do campo aparece uma vez, e a vigente é sempre o valor atual da instância (150 sequências)",
    violacoes.length === 0, `⛔ ${J(violacoes[0])}`);
});

/* 2e · a retomada pelo log devolve a mesma trilha, com limpeza e correção */
bloco("2e", () => {
  let ids = 0;
  const ctx = () => ({ casoId: "caso-ac13-item2", autor: "local:prova", origemDoAutor: "aparelho", agora: rel.agora(), gerarId: () => `ev-${++ids}` });
  let est = vazio;
  const eventos = [...LOG.eventosDeAbertura(est, ctx())];
  const passos = [
    (e) => I.abrirNovaInstancia(e, SF.TROMBOLISE_IV, rel),
    (e) => regI(e, inst1(e), "ivt_estado", "Iniciada"),
    (e) => limpar(e),
    (e) => regI(e, inst1(e), "ivt_estado", "Prescrita"),
    (e) => corrigirEngano(e, idDoRegistro(e, "Prescrita")),
  ];
  for (const p of passos) { const prox = p(est); eventos.push(...LOG.eventosDaTransicao(est, prox, ctx())); est = prox; }
  const rec = tenta(() => LOG.reconstruirEstado(JSON.parse(J(eventos))));
  conf("2e · a retomada devolve a mesma trilha e a mesma exposição",
    rec && !rec.erro && J(trilha(rec, inst1(rec))) === J(trilha(est)) && certeza(rec) === certeza(est), `⛔ ${J([trilha(rec, rec && inst1(rec)), trilha(est)])}`);
});

/* 2f · a mesma trilha vale para a ação corretiva de Correções */
bloco("2f", () => {
  let e = I.abrirNovaInstancia(vazio, SE2.ACAO, rel);
  const inst = I.instanciasDe(e, SE2.ACAO)[0];
  e = regI(e, inst, "acao_tipo", "Correção glicêmica");
  e = regI(e, inst, "acao_estado", "Iniciada");
  e = limpar(e, inst, "acao_estado");
  const t = trilha(e, inst, "acao_estado");
  conf("2f · Correções · «Limpar» na situação da ação vira linha de limpeza, sem vigente",
    Array.isArray(t) && t.length === 2 && t[1].tipo === "limpeza" && t.every((x) => !x.vigente), `⛔ ${J(t)}`);
  const comRegistro = regI(e, inst, "acao_estado", "Iniciada");
  const idDaAcao = I.fatosDaInstancia(comRegistro, inst).filter((f) => f.campo === "acao_estado").slice(-1)[0].id;
  const tentativa = corrigirEngano(comRegistro, idDaAcao);
  conf("2f · Correções · a correção por engano ⛔ vale para a ação corretiva nesta rodada («Ações corretivas: nenhuma mudança», §9)",
    tentativa && Array.isArray(tentativa.fatos) && tentativa.fatos.length === comRegistro.fatos.length, `⛔ ${J(tentativa && tentativa.fatos && tentativa.fatos.length)} × ${comRegistro.fatos.length}`);
});

/* ══ ITEM 5 · retrocesso: permitido, confirmado e gravado como correção explícita ═══ */
/**
 * Decisão do autor (AC-13 reaberto, §5 e §9, opção B): ordem de referência indicado < decidido < prescrito <
 * preparado < iniciado < administrado/concluído; `cancelado` só antes de `iniciado`; `interrompido` só depois de
 * `iniciado`. O movimento contrário é tecnicamente permitido, exige confirmação e entra como correção explícita.
 * Os estados terminais, decididos depois (§10), são conferidos no bloco 5d.
 */
const violacao = (e, rotulo, inst, campo = "ivt_estado") => tenta(() => CA.violacaoAoRegistrar(e, inst ?? inst1(e), campo, rotulo));
const regraDe = (v) => (v === undefined ? "nenhuma" : v && v.erro ? `erro: ${v.erro}` : v.regra);
const foraDaOrdem = (e, rotulo, inst) => tenta(() => CA.registrarForaDaOrdemComoCorrecao(e, inst ?? inst1(e), "ivt_estado", rotulo, rel));

/* 5a · o que viola a ordem decidida */
bloco("5a", () => {
  const violacoes = [
    [["Iniciada"], "Prescrita", "retrocesso"],
    [["Administrada/concluída"], "Indicada", "retrocesso"],
    [["Administrada/concluída"], "Iniciada", "retrocesso"],
    [["Interrompida"], "Preparada", "retrocesso"],
    [["Prescrita", "nao_sei"], "Decidida", "retrocesso"],
    [["Preparada"], "Interrompida", "interrompida_sem_inicio"],
    [[], "Interrompida", "interrompida_sem_inicio"],
    [["Iniciada"], "Cancelada", "cancelada_depois_do_inicio"],
    [["Administrada/concluída"], "Cancelada", "cancelada_depois_do_inicio"],
  ];
  for (const [antes, novo, esperado] of violacoes) {
    const v = violacao(atendimento(antes), novo);
    conf(`5a · ${antes.join(" → ") || "instância vazia"} → «${novo}» viola a ordem (${esperado})`, regraDe(v) === esperado, `⛔ ${J(v)}`);
  }
  const avancos = [
    [[], "Indicada"], [["Indicada"], "Decidida"], [["Decidida"], "Prescrita"], [["Prescrita"], "Preparada"],
    [["Preparada"], "Iniciada"], [["Iniciada"], "Administrada/concluída"], [["Iniciada"], "Interrompida"],
    [["Prescrita"], "Cancelada"], [["Iniciada"], "nao_sei"], [["Iniciada", "nao_sei"], "Administrada/concluída"],
  ];
  for (const [antes, novo] of avancos) {
    const v = violacao(atendimento(antes), novo);
    conf(`5a · ${antes.join(" → ") || "instância vazia"} → «${novo}» ⛔ viola a ordem`, regraDe(v) === "nenhuma", `⛔ ${J(v)}`);
  }
  const base = atendimento(["Iniciada"]);
  const v = violacao(base, "Prescrita");
  conf("5a · o retrocesso aponta o registro com que conflita", v && v.referencia && v.referencia.fatoId === idDoRegistro(base, "Iniciada") && v.referencia.estado === "iniciado", `⛔ ${J(v)}`);
  conf("5a · detectar ⛔ grava fato", base.fatos.length === atendimento(["Iniciada"]).fatos.length, "⛔");
  const corrigida = corrigirEngano(base, idDoRegistro(base, "Iniciada"));
  conf("5a · o registro corrigido por engano ⛔ conta para a ordem", regraDe(violacao(corrigida, "Prescrita")) === "nenhuma", `⛔ ${J(violacao(corrigida, "Prescrita"))}`);
  const limpa = limpar(base);
  conf("5a · o registro limpo continua contando para a ordem (limpar ⛔ apaga o que houve)", regraDe(violacao(limpa, "Prescrita")) === "retrocesso", `⛔ ${J(violacao(limpa, "Prescrita"))}`);
});

/* 5b · confirmado, entra como correção explícita; a exposição fica; a trilha marca */
bloco("5b", () => {
  const base = atendimento(["Iniciada"]);
  const e = foraDaOrdem(base, "Prescrita");
  const ultimo = e.fatos[e.fatos.length - 1];
  conf("5b · o retrocesso confirmado é correção do registro com que conflita, sem motivo inventado",
    e.fatos.length === base.fatos.length + 1 && ultimo.tipo === "correcao" && ultimo.valor === "Prescrita"
      && ultimo.corrigeFatoId === idDoRegistro(base, "Iniciada") && ultimo.motivo === undefined, `⛔ ${J(ultimo)}`);
  conf("5b · a exposição já registrada continua", certeza(e) === "exposta", `⛔ ${J(certeza(e))}`);
  const t = trilha(e);
  conf("5b · a linha nova é a vigente, marcada fora da ordem causal e registrada como correção; a anterior segue válida e na ordem",
    Array.isArray(t) && t.length === 2 && t[1].tipo === "registro" && t[1].vigente === true && t[1].foraDaOrdemCausal === true
      && t[1].registradaComoCorrecao === true && t[0].foraDaOrdemCausal === false && t[0].invalidadaPorCorrecao === false, `⛔ ${J(t)}`);
  const semAnterior = foraDaOrdem(atendimento([]), "Interrompida");
  const ts = trilha(semAnterior);
  conf("5b · «Interrompida» sem registro anterior: ⛔ há o que corrigir, entra como registro marcado fora da ordem",
    Array.isArray(ts) && ts.length === 1 && ts[0].foraDaOrdemCausal === true && ts[0].registradaComoCorrecao === false, `⛔ ${J(ts)}`);
  const cancelada = foraDaOrdem(atendimento(["Iniciada"]), "Cancelada");
  const x = tenta(() => DF.exposicaoAoTrombolitico(cancelada));
  conf("5b · «Cancelada» depois de «Iniciada», confirmada: continua exposta e a contradição da HR-5 continua dita",
    x && x.estado === "exposta" && x.contraditoria === true, `⛔ ${J(x)}`);
  const avanco = foraDaOrdem(atendimento(["Preparada"]), "Iniciada");
  const ua = avanco.fatos[avanco.fatos.length - 1];
  conf("5b · sem violação, o mesmo gravador grava registro comum", ua.tipo === undefined && ua.valor === "Iniciada" && ua.corrigeFatoId === undefined, `⛔ ${J(ua)}`);
  const trilhaAvanco = trilha(atendimento(["Indicada", "Decidida", "Prescrita", "Preparada", "Iniciada", "Administrada/concluída"]));
  conf("5b · a sequência na ordem ⛔ tem linha marcada", Array.isArray(trilhaAvanco) && trilhaAvanco.every((y) => y.foraDaOrdemCausal === false), `⛔ ${J(trilhaAvanco)}`);
});

/* 5c · Correções fica fora da ordem causal nesta rodada («Ações corretivas: nenhuma mudança», §9) */
bloco("5c", () => {
  let e = I.abrirNovaInstancia(vazio, SE2.ACAO, rel);
  const inst = I.instanciasDe(e, SE2.ACAO)[0];
  e = regI(e, inst, "acao_tipo", "Correção glicêmica");
  e = regI(e, inst, "acao_estado", "Iniciada");
  conf("5c · Correções · «Iniciada» → «Indicada» ⛔ pede confirmação nesta rodada", regraDe(violacao(e, "Indicada", inst, "acao_estado")) === "nenhuma", `⛔ ${J(violacao(e, "Indicada", inst, "acao_estado"))}`);
  conf("5c · outro campo ⛔ passa pela regra", regraDe(violacao(e, "Correção glicêmica", inst, "acao_tipo")) === "nenhuma", "⛔");
});

/* ══ ITEM 6 · idempotência também no núcleo ═══════════════════════════════════════ */
/**
 * Decisão do autor (AC-13 reaberto, §6 e §9): a mesma transição idêntica, na mesma instância, no mesmo estado, sem
 * mudança de contexto, é ignorada. Marcar, limpar ou corrigir, e marcar de novo, não é duplicação.
 * Aplicado aqui: mesmo campo de situação da trombólise, mesma instância, mesmo valor, mesmo horário clínico, e o
 * último fato desse campo na instância é um registro (não limpeza nem correção). Correções fica fora (§9).
 */
const doCampo = (e, inst, campo = "ivt_estado") => I.fatosDaInstancia(e, inst ?? inst1(e)).filter((f) => f.campo === campo);
const comHora = (e, valor, horaClinica) => CAMPOS.registrarComInstancia(e, { campo: "ivt_estado", valor, horaClinica }, rel, inst1(e));
const ctx6 = () => ({ casoId: "caso-ac13-item6", autor: "local:prova", origemDoAutor: "aparelho", agora: rel.agora(), gerarId: () => "ev-6" });

/* 6a · a repetição idêntica é ignorada no núcleo */
bloco("6a", () => {
  const um = atendimento(["Iniciada"]);
  const dois = regI(um, inst1(um), "ivt_estado", "Iniciada");
  conf("6a · «Iniciada» registrada de novo, sem nada entre → ignorada: o mesmo estado volta", dois === um && doCampo(dois).length === 1, `⛔ ${doCampo(dois).length} fato(s)`);
  const ns = atendimento(["nao_sei"]);
  const ns2 = regI(ns, inst1(ns), "ivt_estado", "nao_sei");
  conf("6a · «Não sei» repetido → ignorado", doCampo(ns2).length === 1, `⛔ ${doCampo(ns2).length} fato(s)`);
  const hc = comHora(atendimento([]), "Iniciada", AGORA - 20 * MIN);
  conf("6a · mesmo valor e mesmo horário clínico → ignorado", doCampo(comHora(hc, "Iniciada", AGORA - 20 * MIN)).length === 1, "⛔");
  conf("6a · mesmo valor com OUTRO horário clínico → registra", doCampo(comHora(hc, "Iniciada", AGORA - 10 * MIN)).length === 2, "⛔");
  conf("6a · mesmo valor, um com horário clínico e outro sem → registra (não são idênticos)", doCampo(regI(hc, inst1(hc), "ivt_estado", "Iniciada")).length === 2, "⛔");
  const eventos = tenta(() => LOG.eventosDaTransicao(um, dois, ctx6()));
  conf("6a · a repetição ignorada ⛔ gera evento no log", Array.isArray(eventos) && eventos.length === 0, `⛔ ${J(eventos && eventos.length)}`);
  const outroCampoEntre = regI(regI(um, inst1(um), "ivt_inicio", AGORA - 5 * MIN), inst1(um), "ivt_estado", "Iniciada");
  conf("6a · outro campo registrado entre os dois ⛔ muda a situação: a repetição continua ignorada", doCampo(outroCampoEntre).length === 1, `⛔ ${doCampo(outroCampoEntre).length}`);
});

/* 6b · o que não é duplicação continua registrando */
bloco("6b", () => {
  const base = atendimento(["Iniciada"]);
  const limpo = regI(limpar(base), inst1(base), "ivt_estado", "Iniciada");
  conf("6b · marcar, limpar e marcar de novo → três fatos, todos na trilha", doCampo(limpo).length === 3 && (trilha(limpo) || []).length === 3, `⛔ ${doCampo(limpo).length}`);
  const engano = regI(corrigirEngano(base, idDoRegistro(base, "Iniciada")), inst1(base), "ivt_estado", "Iniciada");
  conf("6b · marcar, corrigir por engano e marcar de novo → três fatos", doCampo(engano).length === 3, `⛔ ${doCampo(engano).length}`);
  const idaEVolta = regI(regI(base, inst1(base), "ivt_estado", "Interrompida"), inst1(base), "ivt_estado", "Iniciada");
  conf("6b · outro estado entre os dois → registra", doCampo(idaEVolta).length === 3, `⛔ ${doCampo(idaEVolta).length}`);
  const duas = atendimento(["Iniciada"], ["Iniciada"]);
  const [i1, i2] = I.instanciasDe(duas, SF.TROMBOLISE_IV);
  conf("6b · a mesma situação em OUTRA instância → registra", doCampo(duas, i1).length === 1 && doCampo(duas, i2).length === 1, "⛔");
});

/* 6c · outros campos não mudam */
bloco("6c", () => {
  const base = atendimento(["Iniciada"]);
  const hora = regI(regI(base, inst1(base), "ivt_inicio", AGORA - 5 * MIN), inst1(base), "ivt_inicio", AGORA - 5 * MIN);
  conf("6c · o horário de início repetido continua registrando (a regra é só da situação)", doCampo(hora, undefined, "ivt_inicio").length === 2, `⛔ ${doCampo(hora, undefined, "ivt_inicio").length}`);
  let e = I.abrirNovaInstancia(vazio, SE2.ACAO, rel);
  const inst = I.instanciasDe(e, SE2.ACAO)[0];
  e = regI(regI(regI(e, inst, "acao_tipo", "Correção glicêmica"), inst, "acao_estado", "Iniciada"), inst, "acao_estado", "Iniciada");
  conf("6c · Correções · situação da ação repetida continua registrando nesta rodada (§9)", doCampo(e, inst, "acao_estado").length === 2, `⛔ ${doCampo(e, inst, "acao_estado").length}`);
});

/* ══ ITEM 5 · complemento · estados terminais distintos (§10) ═══════════════════════ */
/**
 * Decisão do autor (AC-13 reaberto, §10): `Cancelada`, `Interrompida` e `Administrada/concluída` são terminais
 * distintos. Sair de um deles para outro estado só vale como correção ou reabertura explícita, com confirmação.
 */
bloco("5d", () => {
  const saidas = [
    [["Cancelada"], "Iniciada"],
    [["Cancelada"], "Indicada"],
    [["Cancelada"], "Prescrita"],
    [["Administrada/concluída"], "Interrompida"],
    [["Interrompida"], "Administrada/concluída"],
    [["Iniciada", "Interrompida"], "Iniciada"],
  ];
  for (const [antes, novo] of saidas) {
    const v = violacao(atendimento(antes), novo);
    conf(`5d · ${antes.join(" → ")} → «${novo}» sai de estado terminal`, regraDe(v) === "saida_de_estado_terminal", `⛔ ${J(v)}`);
  }
  const base = atendimento(["Cancelada"]);
  const v = violacao(base, "Iniciada");
  conf("5d · a saída aponta o terminal de onde sai", v && v.referencia && v.referencia.fatoId === idDoRegistro(base, "Cancelada") && v.referencia.estado === "cancelado", `⛔ ${J(v)}`);
  conf("5d · repetir o mesmo terminal não é saída", regraDe(violacao(atendimento(["Cancelada"]), "Cancelada")) === "nenhuma", `⛔ ${J(violacao(atendimento(["Cancelada"]), "Cancelada"))}`);
  conf("5d · «não sei» depois de terminal não passa pela regra (não é estado)", regraDe(violacao(atendimento(["Administrada/concluída"]), "nao_sei")) === "nenhuma", "⛔");
  conf("5d · as regras anteriores continuam dando o nome: «Administrada/concluída» → «Cancelada» segue cancelada_depois_do_inicio",
    regraDe(violacao(atendimento(["Administrada/concluída"]), "Cancelada")) === "cancelada_depois_do_inicio", "⛔");
  const reaberta = foraDaOrdem(base, "Iniciada");
  const ultimo = reaberta.fatos[reaberta.fatos.length - 1];
  conf("5d · confirmada, a reabertura é correção explícita do terminal", ultimo.tipo === "correcao" && ultimo.corrigeFatoId === idDoRegistro(base, "Cancelada") && ultimo.valor === "Iniciada", `⛔ ${J(ultimo)}`);
  conf("5d · depois da reabertura confirmada, o registro seguinte na ordem não pede confirmação de novo",
    regraDe(violacao(reaberta, "Administrada/concluída")) === "nenhuma", `⛔ ${J(violacao(reaberta, "Administrada/concluída"))}`);
  const t = trilha(regI(reaberta, inst1(reaberta), "ivt_estado", "Administrada/concluída"));
  conf("5d · na trilha, só a reabertura fica marcada fora da ordem",
    Array.isArray(t) && t.length === 3 && t.map((x) => x.foraDaOrdemCausal).join() === "false,true,false", `⛔ ${J(t && t.map((x) => [x.estado, x.foraDaOrdemCausal]))}`);
  const trilhaSemConfirmar = trilha(regI(atendimento(["Administrada/concluída"]), undefined, "ivt_estado", "Interrompida"));
  conf("5d · pela API, a saída gravada sem confirmação continua marcada na trilha",
    Array.isArray(trilhaSemConfirmar) && trilhaSemConfirmar.length === 2 && trilhaSemConfirmar[1].foraDaOrdemCausal === true, `⛔ ${J(trilhaSemConfirmar)}`);
});

/* ══ ITEM 3 · horário clínico separado do horário do registro (E-49 aprovada) ═══════ */
/**
 * Decisões do autor (AC-13 reaberto, §9, §10 e §11): Iniciada lê só `ivt_inicio`; Administrada/concluída e Interrompida
 * exigem resolução documental (informar ou declarar desconhecido) por fato ligado explicitamente à transição;
 * Prescrita, Preparada e Cancelada aceitam horário opcional, sem pendência; Indicada e Decidida sem horário no V1. O
 * horário do registro nunca preenche o clínico. E-49: marcas 6 e 7 viram regressões.
 */
const HC = emT("avc/nucleo/horario-clinico.js");
const VT = emT("avc/nucleo/veredito-da-trombectomia.js");
const PI = emT("avc/nucleo/portao-ivt.js");
const DD = emT("avc/nucleo/derivacoes-d.js");
const PA = emT("avc/nucleo/problemas-ativos.js");
const fatoDoRegistro = (e, rotulo) => e.fatos.find((f) => f.id === idDoRegistro(e, rotulo));
const horario = (e, rotulo) => tenta(() => HC.horarioClinicoDaTransicao(e, fatoDoRegistro(e, rotulo)));
const tipoH = (e, rotulo) => { const h = horario(e, rotulo); return h && (h.tipo || `erro: ${h.erro}`); };
const informar = (e, rotulo, valor) => tenta(() => CA.registrarHorarioClinicoDaTransicao(e, idDoRegistro(e, rotulo), valor, rel));
const pendHorario = (e) => { const p = tenta(() => HC.pendenciasDoHorarioClinico(e)); return Array.isArray(p) ? p : []; };
const comInicio = (e, valor) => regI(e, inst1(e), "ivt_inicio", valor);
const tamanho = (e) => (e && Array.isArray(e.fatos) ? e.fatos.length : -1);

/* 3a · exigência por estado */
bloco("3a", () => {
  const esperado = {
    indicado: "nao_pedido", decidido: "nao_pedido", prescrito: "opcional", preparado: "opcional",
    iniciado: "obrigatorio", administrado_concluido: "obrigatorio", interrompido: "obrigatorio", cancelado: "opcional",
  };
  conf("3a · a exigência do horário clínico por estado é a decidida", HC && J(HC.EXIGENCIA_DO_HORARIO_CLINICO) === J(esperado), `⛔ ${J(HC && HC.EXIGENCIA_DO_HORARIO_CLINICO)}`);
  for (const r of ["Indicada", "Decidida"]) {
    conf(`3a · «${r}» sem horário clínico no V1`, tipoH(atendimento([r]), r) === "nao_pedido", `⛔ ${tipoH(atendimento([r]), r)}`);
  }
});

/* 3b · Iniciada: ivt_inicio é a única fonte */
bloco("3b", () => {
  const e = atendimento(["Iniciada"]);
  conf("3b · «Iniciada» sem ivt_inicio → horário clínico não informado (o horário do registro não entra)", tipoH(e, "Iniciada") === "nao_informado", `⛔ ${J(horario(e, "Iniciada"))}`);
  const h = horario(comInicio(e, AGORA - 40 * MIN), "Iniciada");
  conf("3b · com ivt_inicio informado → conhecido, pela fonte ivt_inicio, no mesmo instante", h && h.tipo === "conhecido" && h.ms === AGORA - 40 * MIN && h.fonte === "ivt_inicio", `⛔ ${J(h)}`);
  conf("3b · ivt_inicio declarado desconhecido → desconhecido declarado", tipoH(comInicio(e, "nao_sei"), "Iniciada") === "desconhecido_declarado", "⛔");
  const vazia = atendimento([]);
  const comHoraNoRegistro = CAMPOS.registrarComInstancia(vazia, { campo: "ivt_estado", valor: "Iniciada", horaClinica: AGORA - 5 * MIN }, rel, inst1(vazia));
  conf("3b · «Iniciada» não ganha segundo horário: horário no próprio registro não substitui ivt_inicio", tipoH(comHoraNoRegistro, "Iniciada") === "nao_informado", `⛔ ${J(horario(comHoraNoRegistro, "Iniciada"))}`);
  conf("3b · o gesto de horário da trilha não se aplica a «Iniciada»", tenta(() => HC.aceitaGestoDeHorarioClinico(e, fatoDoRegistro(e, "Iniciada"))) === false, "⛔");
  conf("3b · horário ligado a «Iniciada» é recusado sem gravar fato", tamanho(informar(e, "Iniciada", AGORA - 3 * MIN)) === tamanho(e), "⛔");
  const p = pendHorario(e);
  conf("3b · «Iniciada» sem ivt_inicio gera pendência documental resolvida por ivt_inicio", p.length === 1 && p[0].campo === "ivt_inicio" && p[0].dono === "reperfusao", `⛔ ${J(p)}`);
  conf("3b · ivt_inicio declarado desconhecido resolve a pendência", pendHorario(comInicio(e, "nao_sei")).length === 0, "⛔");
  conf("3b · ivt_inicio informado resolve a pendência", pendHorario(comInicio(e, AGORA - 40 * MIN)).length === 0, "⛔");
});

/* 3c · Administrada/concluída e Interrompida: resolução documental ligada à transição */
bloco("3c", () => {
  for (const r of ["Administrada/concluída", "Interrompida"]) {
    const e = comInicio(atendimento(["Iniciada", r]), AGORA - 60 * MIN);
    conf(`3c · «${r}» sem horário → não informado`, tipoH(e, r) === "nao_informado", `⛔ ${J(horario(e, r))}`);
    const p = pendHorario(e);
    conf(`3c · «${r}» sem horário → pendência documental ligada à transição`, p.length === 1 && p[0].campo === "ivt_horario_clinico" && p[0].id.endsWith(String(idDoRegistro(e, r))), `⛔ ${J(p)}`);
    const inf = informar(e, r, AGORA - 20 * MIN);
    const ult = inf && inf.fatos ? inf.fatos[inf.fatos.length - 1] : undefined;
    conf(`3c · «${r}» · informar horário grava fato ligado explicitamente à transição, sem ser correção dela`,
      ult && ult.campo === "ivt_horario_clinico" && ult.referenteAoFatoId === idDoRegistro(e, r) && ult.valor === AGORA - 20 * MIN
        && ult.horaClinica === AGORA - 20 * MIN && ult.instancia === inst1(e) && ult.corrigeFatoId === undefined, `⛔ ${J(ult)}`);
    const h = horario(inf, r);
    conf(`3c · «${r}» · informado → conhecido pelo horário informado`, h && h.tipo === "conhecido" && h.ms === AGORA - 20 * MIN && h.fonte === "horario_informado", `⛔ ${J(h)}`);
    conf(`3c · «${r}» · informado, a pendência fecha`, pendHorario(inf).length === 0, "⛔");
    const desc = informar(e, r, "nao_sei");
    const ud = desc && desc.fatos ? desc.fatos[desc.fatos.length - 1] : undefined;
    conf(`3c · «${r}» · «Horário desconhecido» fecha a pendência sem gravar instante`, tipoH(desc, r) === "desconhecido_declarado" && pendHorario(desc).length === 0 && ud && ud.horaClinica === undefined, `⛔ ${J(ud)}`);
    const corr = informar(inf, r, AGORA - 25 * MIN);
    const uc = corr && corr.fatos ? corr.fatos[corr.fatos.length - 1] : undefined;
    conf(`3c · «${r}» · informar de novo corrige o horário anterior da mesma transição`, uc && uc.tipo === "correcao" && uc.corrigeFatoId === ult.id && (horario(corr, r) || {}).ms === AGORA - 25 * MIN, `⛔ ${J(uc)}`);
    conf(`3c · «${r}» · repetir o mesmo horário não grava`, tamanho(informar(inf, r, AGORA - 20 * MIN)) === tamanho(inf), "⛔");
    const limpo = tenta(() => CA.limparHorarioClinicoDaTransicao(desc, idDoRegistro(desc, r), rel));
    conf(`3c · «${r}» · limpar o horário volta a não informado e reabre a pendência`, tipoH(limpo, r) === "nao_informado" && pendHorario(limpo).length === 1, `⛔ ${J(horario(limpo, r))}`);
    conf(`3c · «${r}» · o horário do registro da transição segue separado e intacto`, (fatoDoRegistro(inf, r) || {}).horaRegistro === (fatoDoRegistro(e, r) || {}).horaRegistro, "⛔");
  }
  const base = comInicio(atendimento(["Iniciada", "Administrada/concluída"]), AGORA - 60 * MIN);
  const engano = corrigirEngano(base, idDoRegistro(base, "Administrada/concluída"));
  conf("3c · transição corrigida por engano não gera pendência de horário", pendHorario(engano).length === 0, `⛔ ${J(pendHorario(engano))}`);
});

/* 3d · Prescrita, Preparada e Cancelada: opcional, sem pendência */
bloco("3d", () => {
  for (const r of ["Prescrita", "Preparada", "Cancelada"]) {
    const e = atendimento([r]);
    conf(`3d · «${r}» sem horário → não informado e sem pendência`, tipoH(e, r) === "nao_informado" && pendHorario(e).length === 0, `⛔ ${J(pendHorario(e))}`);
    conf(`3d · «${r}» aceita horário clínico opcional`, tipoH(informar(e, r, AGORA - 10 * MIN), r) === "conhecido", "⛔");
  }
  const ind = atendimento(["Indicada"]);
  conf("3d · «Indicada» não aceita horário clínico", tenta(() => HC.aceitaGestoDeHorarioClinico(ind, fatoDoRegistro(ind, "Indicada"))) === false && tamanho(informar(ind, "Indicada", AGORA)) === tamanho(ind), "⛔");
});

/* 3e · caminho hemorrágico: sem fallback para o horário do registro */
bloco("3e", () => {
  const e = atendimento(["Iniciada", "Interrompida"]);
  const c = tenta(() => CH.caminhoHemorragico(comHemorragia(e)));
  conf("3e · interrupção sem horário clínico → sem hora; o horário do registro não entra", c && c.infusao === "interrompida" && c.interrompidaEm === undefined && c.horarioDaInterrupcao === "nao_informado", `⛔ ${J(c && [c.infusao, c.interrompidaEm, c.horarioDaInterrupcao])}`);
  const d = tenta(() => CH.caminhoHemorragico(comHemorragia(informar(e, "Interrompida", "nao_sei"))));
  conf("3e · horário da interrupção declarado desconhecido continua desconhecido", d && d.interrompidaEm === undefined && d.horarioDaInterrupcao === "desconhecido", `⛔ ${J(d && [d.interrompidaEm, d.horarioDaInterrupcao])}`);
  const i = tenta(() => CH.caminhoHemorragico(comHemorragia(informar(e, "Interrompida", AGORA - 15 * MIN))));
  conf("3e · horário da interrupção informado → hora clínica", i && i.interrompidaEm === AGORA - 15 * MIN && i.horarioDaInterrupcao === "conhecido", `⛔ ${J(i && [i.interrompidaEm, i.horarioDaInterrupcao])}`);
  const viaCaminho = tenta(() => CH.caminhoHemorragico(CH.registrarInterrupcaoDaInfusao(comHemorragia(atendimento(["Iniciada"])), AGORA - 2 * MIN, rel)));
  conf("3e · interrupção registrada pelo caminho, com horário clínico, continua lida", viaCaminho && viaCaminho.interrompidaEm === AGORA - 2 * MIN, `⛔ ${J(viaCaminho && viaCaminho.interrompidaEm)}`);
});

/* 3f · E-49 · marca 6: nunca participa do veredito da EVT nem cria espera para observar resposta à IVT */
bloco("3f", () => {
  const ver = (x) => J(tenta(() => VT.vereditoDaTrombectomia(x, AGORA)));
  const port = (x) => J(tenta(() => PI.estadoDoPortaoIVT(x, AGORA)));
  for (const r of ["Administrada/concluída", "Interrompida"]) {
    const e = comInicio(atendimento(["Iniciada", r]), AGORA - 60 * MIN);
    const [sem, desc, inf] = [e, informar(e, r, "nao_sei"), informar(e, r, AGORA - 30 * MIN)];
    conf(`3f · E-49 marca 6 · «${r}»: o veredito da EVT é idêntico sem horário clínico, com horário desconhecido e com horário informado`,
      !ver(sem).includes("\"erro\"") && ver(sem) === ver(desc) && ver(desc) === ver(inf), `⛔ ${ver(sem).slice(0, 160)} × ${ver(inf).slice(0, 160)}`);
    conf(`3f · E-49 marca 6 · «${r}»: o veredito da EVT não carrega a pendência de horário clínico`, !ver(sem).includes("horario_clinico"), "⛔");
    conf(`3f · E-49 · «${r}»: o portão da IVT é idêntico nas três variantes`, !port(sem).includes("\"erro\"") && port(sem) === port(desc) && port(desc) === port(inf), "⛔");
  }
  const semInicio = atendimento(["Iniciada"]);
  conf("3f · E-49 marca 6 · «Iniciada»: o veredito da EVT é idêntico sem ivt_inicio e com ivt_inicio declarado desconhecido",
    ver(semInicio) === ver(comInicio(semInicio, "nao_sei")), "⛔");
});

/* 3g · E-49 · marca 7: ausência de horário clínico nunca vira horário de última dose de DOAC */
bloco("3g", () => {
  const e = comInicio(atendimento(["Iniciada", "Administrada/concluída"]), AGORA - 60 * MIN);
  const variantes = [
    ["sem horário clínico", e],
    ["horário clínico informado", informar(e, "Administrada/concluída", AGORA - 20 * MIN)],
    ["horário clínico desconhecido", informar(e, "Administrada/concluída", "nao_sei")],
    ["ivt_inicio desconhecido", comInicio(atendimento(["Iniciada"]), "nao_sei")],
    ["ivt_inicio ausente", atendimento(["Iniciada"])],
  ];
  for (const [nome, x] of variantes) {
    const d = tenta(() => DD.exposicaoADoac(x));
    conf(`3g · E-49 marca 7 · ${nome}: a última dose de DOAC continua não perguntada`, d && d.exposicao === "nao_perguntado", `⛔ ${J(d && d.exposicao)}`);
    conf(`3g · E-49 marca 7 · ${nome}: nenhum fato de última dose de DOAC é gravado ou inferido`, x && E.valorAtual(x, "doac_ultima_dose") === undefined, "⛔");
  }
});

/* 3h · persistência e pendências do caso */
bloco("3h", () => {
  let ids = 0;
  const ctx = () => ({ casoId: "caso-ac13-item3", autor: "local:prova", origemDoAutor: "aparelho", agora: rel.agora(), gerarId: () => `ev3-${++ids}` });
  let est = vazio;
  const eventos = [...LOG.eventosDeAbertura(est, ctx())];
  const passos = [
    (x) => I.abrirNovaInstancia(x, SF.TROMBOLISE_IV, rel),
    (x) => regI(x, inst1(x), "ivt_estado", "Iniciada"),
    (x) => regI(x, inst1(x), "ivt_inicio", AGORA - 60 * MIN),
    (x) => regI(x, inst1(x), "ivt_estado", "Administrada/concluída"),
    (x) => CA.registrarHorarioClinicoDaTransicao(x, idDoRegistro(x, "Administrada/concluída"), AGORA - 10 * MIN, rel),
  ];
  for (const p of passos) { const prox = p(est); eventos.push(...LOG.eventosDaTransicao(est, prox, ctx())); est = prox; }
  const rec = tenta(() => LOG.reconstruirEstado(JSON.parse(J(eventos))));
  conf("3h · a retomada pelo log devolve o horário clínico ligado à mesma transição",
    rec && !rec.erro && J(horario(rec, "Administrada/concluída")) === J(horario(est, "Administrada/concluída")) && tipoH(rec, "Administrada/concluída") === "conhecido", `⛔ ${J(horario(rec, "Administrada/concluída"))}`);
  const aberto = comInicio(atendimento(["Iniciada", "Administrada/concluída"]), AGORA - 60 * MIN);
  const doCaso = tenta(() => PA.pendenciasDoCaso(aberto));
  conf("3h · a pendência de horário clínico entra nas pendências do caso", Array.isArray(doCaso) && doCaso.some((p) => p.campo === "ivt_horario_clinico"), `⛔ ${J(doCaso)}`);
  conf("3h · registrar a situação sem horário clínico sempre grava o estado", tamanho(atendimento(["Iniciada", "Administrada/concluída"])) > tamanho(atendimento(["Iniciada"])), "⛔");
});

/* 3i · «Limpar» não invalida a transição: a pendência de horário fica; só a correção por engano ou o horário resolvido a fecham */
bloco("3i", () => {
  const e = atendimento(["Iniciada"]);
  const limpo = limpar(e);
  const pl = pendHorario(limpo);
  conf("3i · «Iniciada» → «Limpar»: a exposição continua", certeza(limpo) === "exposta", `⛔ ${J(certeza(limpo))}`);
  conf("3i · «Iniciada» → «Limpar»: a pendência do horário clínico continua", pl.length === 1 && pl[0].campo === "ivt_inicio", `⛔ ${J(pl)}`);
  const engano = corrigirEngano(e, idDoRegistro(e, "Iniciada"));
  const te = trilha(engano);
  conf("3i · «Iniciada» → correção explícita por engano: a transição deixa de valer e a pendência correspondente sai",
    Array.isArray(te) && te[0].invalidadaPorCorrecao === true && pendHorario(engano).length === 0 && certeza(engano) !== "exposta",
    `⛔ ${J([te, pendHorario(engano), certeza(engano)])}`);
  const adm = comInicio(atendimento(["Iniciada", "Administrada/concluída"]), AGORA - 60 * MIN);
  const admLimpo = limpar(adm);
  conf("3i · «Administrada/concluída» → «Limpar»: a exposição e a pendência do horário clínico continuam",
    certeza(admLimpo) === "exposta" && pendHorario(admLimpo).some((p) => p.campo === "ivt_horario_clinico"), `⛔ ${J(pendHorario(admLimpo))}`);
  const desc = informar(adm, "Administrada/concluída", "nao_sei");
  const ultimo = desc && desc.fatos ? desc.fatos[desc.fatos.length - 1] : undefined;
  conf("3i · «Horário desconhecido» resolve a pendência sem criar horário",
    pendHorario(desc).length === 0 && ultimo && ultimo.valor === "nao_sei" && ultimo.horaClinica === undefined
      && (horario(desc, "Administrada/concluída") || {}).ms === undefined
      && !desc.fatos.some((f) => f.campo === "ivt_horario_clinico" && typeof f.valor === "number"), `⛔ ${J(ultimo)}`);
  const inicioDesc = comInicio(atendimento(["Iniciada"]), "nao_sei");
  conf("3i · «Iniciada» · início declarado desconhecido resolve a pendência sem criar horário",
    pendHorario(inicioDesc).length === 0 && (horario(inicioDesc, "Iniciada") || {}).ms === undefined
      && !inicioDesc.fatos.some((f) => f.campo === "ivt_inicio" && typeof f.valor === "number"), `⛔ ${J(horario(inicioDesc, "Iniciada"))}`);
});

/* ══ ITEM 4 · autoria: nome de exibição ou «Autoria não identificada» ═════════════ */
/**
 * Decisão do autor (AC-13 reaberto, §10): nome de exibição `full_name`, senão `nome`; nunca derivado de e-mail;
 * IndexedDB na v4 com o nome no evento; eventos antigos e registros sem conta ficam «Autoria não identificada».
 */
const AUT = emT("avc/persistencia/autoria.js");
const TIP = emT("avc/persistencia/tipos.js");
const NAO_IDENTIFICADA = J({ tipo: "nao_identificada", rotulo: "Autoria não identificada" });

/* 4a · de onde vem o nome e o que a tela diz */
bloco("4a", () => {
  const N = (m) => tenta(() => AUT.nomeDeExibicaoDosMetadados(m));
  conf("4a · nome de exibição: `full_name`", N({ full_name: "Dra. Ana Souza", nome: "Ana" }) === "Dra. Ana Souza", `⛔ ${J(N({ full_name: "Dra. Ana Souza", nome: "Ana" }))}`);
  conf("4a · sem `full_name`, `nome`", N({ nome: "Dr. Bruno Lima" }) === "Dr. Bruno Lima", `⛔ ${J(N({ nome: "Dr. Bruno Lima" }))}`);
  conf("4a · `full_name` em branco cai para `nome`", N({ full_name: "  ", nome: "Dr. Bruno Lima" }) === "Dr. Bruno Lima", "⛔");
  conf("4a · só e-mail → nenhum nome (nunca derivado do e-mail)", N({ email: "ana.souza@hospital.org" }) === undefined, `⛔ ${J(N({ email: "ana.souza@hospital.org" }))}`);
  conf("4a · sem metadados → nenhum nome", N(undefined) === undefined && N(null) === undefined, "⛔");
  const R = (a) => J(tenta(() => AUT.rotuloDeAutoria(a)));
  const comNome = tenta(() => AUT.autoriaDoEvento({ userId: "u-1", anonima: false, nomeDeExibicao: "Dra. Ana Souza" }, "local:ap-1"));
  const semNome = tenta(() => AUT.autoriaDoEvento({ userId: "u-1", anonima: false }, "local:ap-1"));
  const semConta = tenta(() => AUT.autoriaDoEvento(undefined, "local:ap-1"));
  conf("4a · conta com nome → «Registrado por:» com o nome", R(comNome) === J({ tipo: "nome", rotulo: "Registrado por:", nome: "Dra. Ana Souza" }), `⛔ ${R(comNome)}`);
  conf("4a · conta sem nome → «Autoria não identificada», nunca o id", R(semNome) === NAO_IDENTIFICADA && !R(semNome).includes("u-1"), `⛔ ${R(semNome)}`);
  conf("4a · sem conta → «Autoria não identificada», nunca o id do aparelho", R(semConta) === NAO_IDENTIFICADA && !R(semConta).includes("local:"), `⛔ ${R(semConta)}`);
  conf("4a · autoria ainda não lida do log → «Autoria não identificada»", R(undefined) === NAO_IDENTIFICADA, `⛔ ${R(undefined)}`);
  conf("4a · o texto de autoria nunca usa «responsável»", ![R(comNome), R(semNome), R(semConta)].some((x) => /respons/i.test(x)), "⛔");
});

/* 4b · o evento v4 guarda o nome; eventos antigos migram sem nome */
bloco("4b", () => {
  conf("4b · o schema do evento é v4", TIP && TIP.VERSAO_DO_SCHEMA === 4, `⛔ ${TIP && TIP.VERSAO_DO_SCHEMA}`);
  const e0 = vazio;
  const e1 = E.registrarFato(e0, { campo: "peso", valor: 70 }, rel);
  let n = 0;
  const ctx = (extra) => ({ casoId: "caso-ac13-item4", autor: "u-1", origemDoAutor: "sessao", agora: rel.agora(), gerarId: () => `ev4-${++n}`, ...extra });
  const comNome = tenta(() => LOG.eventosDaTransicao(e0, e1, ctx({ nomeDoAutor: "Dra. Ana Souza" })));
  conf("4b · com nome, todo evento grava `nomeDoAutor` no schema v4",
    Array.isArray(comNome) && comNome.length > 0 && comNome.every((x) => x.nomeDoAutor === "Dra. Ana Souza" && x.versaoDoSchema === 4), `⛔ ${J(comNome)}`);
  const semNome = tenta(() => LOG.eventosDaTransicao(e0, e1, ctx({})));
  conf("4b · sem nome, `nomeDoAutor` fica declarado como null", Array.isArray(semNome) && semNome.every((x) => x.nomeDoAutor === null), `⛔ ${J(semNome)}`);
  const v3 = {
    id: "v3-a", casoId: "caso-v3", seq: 1, tipo: "fato", registradoEm: AGORA, observadoEm: null, autor: "u-9", origemDoAutor: "sessao",
    versaoDoSchema: 3, dados: { fato: { id: "fato-v3", campo: "peso", valor: 70, horaRegistro: AGORA } },
  };
  const m3 = tenta(() => TIP.migrarEvento(v3));
  conf("4b · v3 → v4: evento antigo fica sem nome (null), com autor, origem e `dados` intactos",
    m3 && m3.versaoDoSchema === 4 && m3.nomeDoAutor === null && m3.autor === "u-9" && m3.origemDoAutor === "sessao" && J(m3.dados) === J(v3.dados), `⛔ ${J(m3)}`);
  const idNovo = e1.fatos[e1.fatos.length - 1].id;
  const porFato = tenta(() => AUT.autoriaPorFatoDoLog([m3, ...(Array.isArray(comNome) ? comNome : [])]));
  conf("4b · evento antigo → «Autoria não identificada»; evento novo com nome → «Registrado por:»",
    porFato && J(tenta(() => AUT.rotuloDeAutoria(porFato["fato-v3"]))) === NAO_IDENTIFICADA
      && J(tenta(() => AUT.rotuloDeAutoria(porFato[idNovo]))) === J({ tipo: "nome", rotulo: "Registrado por:", nome: "Dra. Ana Souza" }), `⛔ ${J(porFato)}`);
  const e2 = E.registrarFato(e1, { campo: "peso", valor: 72 }, rel);
  const idSeguinte = e2.fatos[e2.fatos.length - 1].id;
  const depois = tenta(() => LOG.eventosDaTransicao(e1, e2, ctx({ nomeDoAutor: "Dr. Carlos Nunes" })));
  const porFato2 = tenta(() => AUT.autoriaPorFatoDoLog([...(Array.isArray(comNome) ? comNome : []), ...(Array.isArray(depois) ? depois : [])]));
  conf("4b · o nome é snapshot gravado no evento: o fato anterior mantém o nome da época, mesmo com outro nome na sessão depois",
    porFato2 && (porFato2[idNovo] || {}).nomeDeExibicao === "Dra. Ana Souza" && (porFato2[idSeguinte] || {}).nomeDeExibicao === "Dr. Carlos Nunes", `⛔ ${J(porFato2)}`);
});

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · AC-13 REABERTO — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
