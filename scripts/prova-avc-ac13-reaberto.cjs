#!/usr/bin/env node
/**
 * PROVA · AC-13 REABERTO (autor, 2026-09-14; `docs/decisoes.md`, seção "AC-13 reaberto", §1 a §9).
 *
 * PROMETE: item a item, na ordem de implementação 1 → 2 → 5 → 6 → 3 → 4 → 7:
 *  · item 1 — a exposição ao trombolítico é triestado (`exposta`, `nao_exposta`, `desconhecida`), com a
 *    agregação decidida pelo autor, e todo consumidor clínico que depende dela declara `desconhecida`
 *    em vez de devolver, calado, a saída de "sem trombólise". A conduta atual de cada consumidor é
 *    preservada: a conduta clínica final diante de `desconhecida` NÃO é decidida aqui (§9).
 * NÃO PROMETE: que a conduta diante de `desconhecida` esteja certa. Ela ainda não foi decidida.
 * UNIVERSO: `avc/nucleo/{derivacoes-f,derivacoes-g,alvo-pressorico,caminho-hemorragico,plano-48h,
 *   sintese-do-caso}.ts`, `avc/persistencia/log.ts`.
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

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · AC-13 REABERTO — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
