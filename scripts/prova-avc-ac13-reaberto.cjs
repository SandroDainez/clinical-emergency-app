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
 * NÃO PROMETE: que a conduta diante de `desconhecida` esteja certa. Ela ainda não foi decidida.
 * UNIVERSO: `avc/nucleo/{derivacoes-f,derivacoes-g,alvo-pressorico,caminho-hemorragico,plano-48h,
 *   sintese-do-caso,transicoes-da-acao,correcao-da-acao,ordem-da-acao}.ts`, `avc/persistencia/log.ts`.
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
 * ⛔ Não se conferem aqui os movimentos que o autor não decidiu (sair de «Cancelada»; trocar administrada/concluída
 * por interrompida ou o inverso).
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

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · AC-13 REABERTO — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
