#!/usr/bin/env node
/**
 * PROVA · ACHADOS VISTOS SÓ POR LEITURA NA 3ª RODADA — AC-46, AC-47, AC-48.
 *
 * PROMETE: (AC-46) que, com varfarina registrada e INR, TP e TTPa registrados, a
 * condição resolutiva do coagulograma ⛔ diz «sem varfarina ou heparina
 * registradas»; (AC-47) que déficit registrado como «não incapacitante» ⛔ sai
 * «indicada» por rota de janela estendida — nem pela de perfusão (cenário pedido
 * pelo autor), nem pela de RM com início desconhecido — e que a saída diz o
 * motivo; (AC-48) que os quatro itens relativos que a fonte chama de «segurança
 * desconhecida» aparecem entre os impedimentos, como informação, ⛔ sem reter a
 * trombólise.
 * NÃO PROMETE: que a conduta diante desses cenários esteja clinicamente validada;
 * nenhum limiar novo é criado ⛔ nem provado; a tela é conferida por outros e2e.
 * UNIVERSO: `avc/nucleo/{derivacoes-d,veredito-da-trombolise,portao-ivt}.ts`.
 * FONTE: `docs/avc/auditoria-vs-spec.md` §7.8 (AC-46, AC-47, AC-48); pedido do autor
 * de 2026-09-13 (4ª rodada, Entrega 1).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "achados-leitura-"));
execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "portao-ivt.ts"),
    path.join(appDir, "avc", "conteudo", "campos.ts")],
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
const nota = (t) => console.log(`  · ${t}`);

const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const V = emT("avc", "nucleo", "veredito-da-trombolise.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const DF = emT("avc", "nucleo", "derivacoes-f.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const L = emT("avc", "conteudo", "laboratorio.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const PAC = emT("avc", "conteudo", "paciente.js");

const H = 3_600_000;
const AGORA = 1_800_000_000_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const regI = (e, inst, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const col = (n) => I.nomeDaInstancia(L.COLETA, n);
const est = (n) => I.nomeDaInstancia(SC.ESTUDO, n);
const tcSem = (e, n, horaMs) => {
  let x = regI(e, est(n), "estudo_modalidade", SC.MODALIDADE.tcSemContraste);
  x = regI(x, est(n), "estudo_hora", horaMs);
  return regI(x, est(n), "estudo_resultado", SC.RESULTADO_TC.semHemorragia);
};
const ivt = (e) => ({ v: V.vereditoDaTrombolise(e, AGORA), p: P.estadoDoPortaoIVT(e, AGORA) });
function candidatoIvt(e = vazio) {
  let x = reg(e, "incapacitante_assumido", "Incapacitante");
  x = reg(x, "hora_inicio_observado", AGORA - 2 * H);
  x = tcSem(x, 1, AGORA - 1 * H);
  return reg(x, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
}

/* ══ AC-46 · varfarina registrada ⛔ não pode ler «sem varfarina» ═════════ */
{
  const semAnticoag = regI(regI(regI(candidatoIvt(), col(1), "inr", 1.0), col(1), "tp", 12), col(1), "aptt", 30);
  const comVarfarina = reg(semAnticoag, "anticoagulante_em_uso", PAC.ANTICOAGULANTE.varfarina);
  const cr = (e) => DD.impedimentosDeSeguranca(e).find((i) => i.id === "condicao_resolutiva_coagulograma");
  conf("AC-46 · controle: o cenário (INR, TP, TTPa registrados, plaquetas ⛔ não) alcança a condição resolutiva",
    cr(comVarfarina) !== undefined, `⛔ ${JSON.stringify(DD.impedimentosDeSeguranca(comVarfarina).map((i) => i.id))}`);
  conf("AC-46 · com VARFARINA registrada, o texto ⛔ diz «sem varfarina ou heparina registradas»",
    cr(comVarfarina) !== undefined && !/sem varfarina ou heparina registradas/.test(cr(comVarfarina).dado ?? ""),
    `⛔ dado="${cr(comVarfarina) && cr(comVarfarina).dado}"`);
  conf("AC-46 · controle: SEM anticoagulante registrado, o texto continua dizendo «sem varfarina ou heparina registradas»",
    cr(semAnticoag) !== undefined && /sem varfarina ou heparina registradas/.test(cr(semAnticoag).dado ?? ""),
    `⛔ dado="${cr(semAnticoag) && cr(semAnticoag).dado}"`);
}

/* ══ AC-47 · «não incapacitante» ⛔ sai «indicada» por janela estendida ═══ */
{
  /** Cenário 1 — pedido do autor: rota de janela estendida com perfusão favorável. */
  let perf = reg(vazio, "incapacitante_assumido", "Não incapacitante");
  perf = reg(perf, "hora_ultima_vez_bem", AGORA - 6 * H);
  perf = reg(perf, "hora_inicio_observado", AGORA - 6 * H);
  perf = tcSem(perf, 1, AGORA - 1 * H);
  perf = regI(perf, est(1), "penumbra_por_perfusao_automatizada", "sim");
  perf = reg(perf, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  const leituraPerf = DF.recomendacoesDoEstado(perf, AGORA).find((l) => l.id === "ivt_wakeup_ou_45_9");
  nota(`AC-47 · cenário perfusão: rota ivt_wakeup_ou_45_9 = ${leituraPerf && leituraPerf.correspondencia} (travadaPor ${leituraPerf && leituraPerf.travadaPor}) · veredito = ${ivt(perf).v.tipo}`);
  conf("AC-47 · perfusão favorável + «não incapacitante» → ⛔ «indicada»", ivt(perf).v.tipo !== "indicada", `⛔ ${ivt(perf).v.tipo}`);

  /** Cenário 2 — a rota estendida que de fato sustenta: RM com início desconhecido. */
  let rm = tcSem(vazio, 1, AGORA - 1 * H);
  rm = regI(rm, est(2), "estudo_modalidade", SC.MODALIDADE.rm);
  rm = regI(rm, est(2), "dwi_menor_que_um_terco", "sim");
  rm = regI(rm, est(2), "flair_sem_alteracao_marcada", "sim");
  rm = reg(rm, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  rm = reg(rm, "hora_reconhecimento", AGORA - 2 * H);
  rm = reg(rm, "hora_inicio_observado", "nao_sei");
  conf("AC-47 · controle: RM com início desconhecido, SEM registrar déficit → indicada pela rota estendida",
    ivt(rm).v.tipo === "indicada", `⛔ ${ivt(rm).v.tipo}`);
  const naoIncap = reg(rm, "incapacitante_assumido", "Não incapacitante");
  nota(`AC-47 · cenário RM: veredito com «não incapacitante» = ${ivt(naoIncap).v.tipo} · "${ivt(naoIncap).v.frase}"`);
  conf("AC-47 · RM com início desconhecido + «não incapacitante» → ⛔ «indicada»", ivt(naoIncap).v.tipo !== "indicada", `⛔ ${ivt(naoIncap).v.tipo}`);
  conf("AC-47 · a saída diz o motivo: sem indicação neste caminho, déficit não incapacitante",
    /sem indicação neste caminho/i.test(ivt(naoIncap).v.frase ?? "") && /não incapacitante/i.test(ivt(naoIncap).v.frase ?? ""),
    `⛔ frase="${ivt(naoIncap).v.frase}"`);
  conf("AC-47 · ⛔ e o portão ⛔ libera", ivt(naoIncap).p.liberado === false, `⛔ ${ivt(naoIncap).p.estado}`);
  const incap = reg(rm, "incapacitante_assumido", "Incapacitante");
  conf("AC-47 · controle: com «Incapacitante», a rota estendida continua sustentando", ivt(incap).v.tipo === "indicada", `⛔ ${ivt(incap).v.tipo}`);
  const incerto = reg(rm, "incapacitante_assumido", "Incerto");
  conf("AC-47 · controle: «Incerto» ⛔ muda a rota estendida (só o registro «não incapacitante» fecha)", ivt(incerto).v.tipo === "indicada", `⛔ ${ivt(incerto).v.tipo}`);
}

/* ══ AC-48 · «segurança desconhecida» ⛔ some do portão ═════════════════ */
{
  const itens = [
    ["antecedentes_intracranianos", "Malformação vascular intracraniana não rota"],
    ["antecedentes_intracranianos", "Dissecção arterial intracraniana"],
    ["antecedentes_cardio_sistemicos", "Neoplasia sistêmica ativa"],
    ["procedimentos_recentes", "Punção arterial em vaso não compressível nos últimos 7 dias"],
  ];
  const base = candidatoIvt();
  const portaoBase = ivt(base).p;
  for (const [campo, opcao] of itens) {
    const e = reg(base, campo, opcao);
    const lido = DD.itensComModificacao(e).filter((i) => i.estado === "informacao_insuficiente");
    conf(`AC-48 · controle: «${opcao}» é lido como segurança desconhecida`, lido.length === 1, `⛔ ${JSON.stringify(lido.map((i) => i.estado))}`);
    const imp = DD.impedimentosDeSeguranca(e).filter((i) => i.id.startsWith("item-"));
    conf(`AC-48 · «${opcao}» aparece entre os impedimentos, como INFORMAÇÃO`,
      imp.length === 1 && imp[0].efeito === "informa", `⛔ ${JSON.stringify(imp.map((i) => [i.id, i.efeito]))}`);
    conf(`AC-48 · «${opcao}» ⛔ retém a trombólise (nenhum bloqueio novo)`,
      ivt(e).p.liberado === portaoBase.liberado && ivt(e).p.estado === portaoBase.estado, `⛔ ${portaoBase.estado} → ${ivt(e).p.estado}`);
  }
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · ACHADOS POR LEITURA (AC-46/47/48) — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
