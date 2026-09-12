#!/usr/bin/env node
/**
 * PROVA ADVERSARIAL DOS CRÍTICOS DO AVC — ⚠️ nasceu **vermelha por construção**
 * (commit 1) ⛔ e, desde o commit 11 (2026-09-12), é **regressão permanente**
 * no `test:all`: ⛔ vermelho aqui é crítico reaberto.
 *
 * PROMETE: que os onze achados validados como *release blockers*
 *   (AVC-01 · 02 · 03 · 04 · 05 · 06 · 07 · 08 · 09 · 12 · 13) ⛔ não voltem, ⛔ e
 *   que as invariantes que eles violavam sejam medidas **por execução** do
 *   núcleo — ⛔ nunca por texto.
 *
 * NÃO PROMETE: que a trombólise seja a conduta certa. ⛔ Mede o que o app
 *   conclui ⛔ e o que ele libera, ⛔ e com base em quê.
 *
 * UNIVERSO: `avc/nucleo/{portao-ivt,veredito-da-trombolise,veredito-da-
 *   trombectomia,derivacoes-c,derivacoes-d,derivacoes-f,derivacoes-g,
 *   sintese-do-caso,estado}.ts` × `avc/conteudo/{superficie-e,superficie-f}.ts`.
 *
 * ── ⚠️⚠️ POR QUE ELA NASCE VERMELHA ─────────────────────────────────────
 *
 * ⚠️ Decisão do autor (plano aprovado, 2026-09-12): *"Commit 1 — testes
 * adversariais que reproduzem o comportamento errado."* ⛔ As expectativas
 * abaixo são o comportamento **correto**; ⛔ o que está vermelho hoje é o
 * defeito, ⛔ e cada bloco diz **em qual commit** deve ficar verde.
 *
 * ⛔ Ela ⛔ NÃO entra em `test:all` até o commit 11 — ⛔ deixá-la lá antes
 * derrubaria a suíte inteira entre passos ⛔ sem medir ⛔ nada de novo.
 *
 * ── ⚠️⚠️ FUNÇÃO QUE ⛔ AINDA ⛔ NÃO EXISTE CONTA COMO FALHA, ⛔ E ⛔ NÃO COMO
 *    ERRO DE SCRIPT ─────────────────────────────────────────────────────────
 *
 * ⛔ Um `TypeError` no meio da prova esconderia os demais casos. ⚠️ `ausente()`
 * transforma a ausência da API em uma falha nomeada ⛔ e segue.
 *
 * Mapa commit → casos:
 *   C2  barreira de classe ............ 1, 4 (EVT), 5, 6, 17
 *   C3  agora obrigatório + ms ........ 8, 9
 *   C4  domínios agente/posologia ...... 10, 11
 *   C5  janela como critério IVT ....... 7
 *   C6  composição D1 .................. 2, 3, 4 (IVT), 24, 25
 *   C7  incerteza tipada ............... 12, 13, 14, 15, 16
 *   C8  Interrompida + exposição ....... 18, 19, 20, 22, 26
 *   C9  imagens pós-IVT ................ 21
 *   C10 marco canônico ................. 23
 *   C12 DOAC hora não perguntada ....... 27 (red-team C40)
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "criticos-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "portao-ivt.ts"),
    path.join(appDir, "avc", "nucleo", "veredito-da-trombectomia.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"),
    path.join(appDir, "avc", "nucleo", "sintese-do-caso.ts"),
    path.join(appDir, "avc", "conteudo", "campos.ts"),
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
const VE = emT("avc", "nucleo", "veredito-da-trombectomia.js");
const DC = emT("avc", "nucleo", "derivacoes-c.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const DF = emT("avc", "nucleo", "derivacoes-f.js");
const DG = emT("avc", "nucleo", "derivacoes-g.js");
const SIN = emT("avc", "nucleo", "sintese-do-caso.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const L = emT("avc", "conteudo", "laboratorio.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const SE = emT("avc", "conteudo", "superficie-e.js");
const SF = emT("avc", "conteudo", "superficie-f.js");

let ok = 0;
let falhas = 0;
const vermelhos = [];
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  vermelhos.push(nome);
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
/** ⚠️ API ⛔ ainda ⛔ não existe ⇒ falha nomeada, ⛔ e a prova segue. */
function ausente(nome, fn) {
  try { return fn(); } catch (e) {
    conf(nome, false, `⛔ ${String(e && e.message).slice(0, 140)}`);
    return undefined;
  }
}

/* ── fixtures ─────────────────────────────────────────────────────────── */
const H = 3_600_000;
const MIN = 60_000;
const AGORA = 1_800_000_000_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const regI = (e, inst, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const opc = (e, inst, campo, rotulo) => regI(e, inst, campo, CAMPO.valorDaOpcao(rotulo));

const col = (n) => I.nomeDaInstancia(L.COLETA, n);
const est = (n) => I.nomeDaInstancia(SC.ESTUDO, n);
const tiv = (n) => I.nomeDaInstancia(SF.TROMBOLISE_IV, n);
const TC = SC.MODALIDADE.tcSemContraste;
const HEM = SC.RESULTADO_TC.hemorragia;
const SEM = SC.RESULTADO_TC.semHemorragia;

const tcSem = (e, n, horaMs) => {
  let x = regI(e, est(n), "estudo_modalidade", TC);
  if (horaMs !== undefined) x = regI(x, est(n), "estudo_hora", horaMs);
  return regI(x, est(n), "estudo_resultado", SEM);
};
const tcCom = (e, n, horaMs) => {
  let x = regI(e, est(n), "estudo_modalidade", TC);
  if (horaMs !== undefined) x = regI(x, est(n), "estudo_hora", horaMs);
  return regI(x, est(n), "estudo_resultado", HEM);
};

const ivt = (e) => ({ v: V.vereditoDaTrombolise(e, AGORA), p: P.estadoDoPortaoIVT(e, AGORA) });
const evt = (e) => VE.vereditoDaTrombectomia(e, AGORA);
const ids = (xs) => (xs ?? []).map((m) => m.id);

/** ⚠️ Candidato IVT COMPLETO pela composição D1 — o caso positivo de referência. */
function candidatoIvt(e = vazio) {
  let x = reg(e, "incapacitante_assumido", "Incapacitante");
  x = reg(x, "hora_inicio_observado", AGORA - 2 * H);
  x = tcSem(x, 1, AGORA - 1 * H);
  /** ⚠️ O juízo da rec. 10 respondido (HR-3): sem motivo para suspeitar ⇒ E-47, ⛔ e ⛔ não pendência. */
  return reg(x, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
}
/** ⚠️ O mesmo candidato **sem** o juízo da rec. 10 — ⛔ para medir HR-3. */
function candidatoSemJuizo(e = vazio) {
  let x = reg(e, "incapacitante_assumido", "Incapacitante");
  x = reg(x, "hora_inicio_observado", AGORA - 2 * H);
  return tcSem(x, 1, AGORA - 1 * H);
}
/** ⚠️ Candidato EVT COMPLETO pela seleção (rec. 1 de §4.7.2). */
function candidatoEvt(e = vazio, dtMs = 1 * H) {
  let x = reg(e, "sitio_oclusao", "M1 da artéria cerebral média");
  x = reg(x, "nihss_informado", 12);
  x = reg(x, "mrs_previo", "0 · assintomático");
  x = reg(x, "aspects", 8);
  return reg(x, "hora_inicio_observado", AGORA - dtMs);
}

/* ══ 1 · ATENDIMENTO VAZIO ═══════════════════════════════════════════════ */
ausente("1 · vazio (API)", () => {
  const { v, p } = ivt(vazio);
  conf("1 · vazio → veredito IVT `incompleta`", v.tipo === "incompleta", `⛔ ${v.tipo}`);
  conf("1 · vazio → portão ⛔ não liberado", p.liberado === false, `⛔ ${p.estado}`);
  const b = DC.barreiraDeReperfusao(vazio);
  conf("1 · vazio → barreira de classe `retida` por `sem_imagem`",
    b.estado === "retida" && b.motivo === "sem_imagem", `⛔ ${JSON.stringify(b)}`);
  const ve = evt(vazio);
  /** ⚠️ Vazio ⇒ toda recomendação é *potencial* ⇒ `incompleta`, nomeando o que falta (E-26). */
  conf("1 · vazio → EVT `incompleta` ⛔ e classe retida",
    ve.tipo === "incompleta" && ve.classe && ve.classe.estado === "retida",
    `⛔ tipo=${ve.tipo} classe=${JSON.stringify(ve.classe)}`);
});

/* ══ 2 · SOMENTE PESO ════════════════════════════════════════════════════ */
ausente("2 · só peso (API)", () => {
  const e = reg(vazio, "peso", 70);
  const { v, p } = ivt(e);
  conf("2 · só peso → ⛔ NÃO `indicada`", v.tipo === "incompleta", `⛔ ${v.tipo} sustentam=${ids(v.sustentam)}`);
  conf("2 · só peso → portão ⛔ não liberado", p.liberado === false, `⛔ ${p.estado}`);
  const faltantes = (v.criteriosAvaliados ?? []).filter((c) => c.estado === "ausente").map((c) => c.papel);
  conf("2 · ⛔ e a falta NOMEIA elegibilidade clínica, tempo ⛔ e imagem",
    ["elegibilidade_clinica", "temporal", "classe_imagem"].every((x) => faltantes.includes(x)),
    `⛔ ausentes=${JSON.stringify(faltantes)} — peso ≠ elegibilidade`);
});

/* ══ 3 · SOMENTE DÉFICIT INCAPACITANTE ═══════════════════════════════════ */
ausente("3 · só incapacitante (API)", () => {
  const e = reg(vazio, "incapacitante_assumido", "Incapacitante");
  const { v, p } = ivt(e);
  conf("3 · só «Incapacitante» → ⛔ NÃO `indicada`", v.tipo === "incompleta", `⛔ ${v.tipo} sustentam=${ids(v.sustentam)}`);
  conf("3 · só «Incapacitante» → portão ⛔ não liberado", p.liberado === false, `⛔ ${p.estado}`);
  conf("3 · ⛔ e o critério de elegibilidade clínica está `satisfeito`, os outros ⛔ não",
    (v.criteriosAvaliados ?? []).some((c) => c.papel === "elegibilidade_clinica" && c.estado === "satisfeito")
    && (v.criteriosAvaliados ?? []).some((c) => c.papel === "temporal" && c.estado === "ausente"),
    `⛔ ${JSON.stringify((v.criteriosAvaliados ?? []).map((c) => [c.papel, c.estado]))}`);
});

/* ══ 4 · IMAGEM AUSENTE, DEMAIS CRITÉRIOS COMPLETOS ══════════════════════ */
ausente("4 · imagem ausente (API)", () => {
  let e = reg(vazio, "incapacitante_assumido", "Incapacitante");
  e = reg(e, "hora_inicio_observado", AGORA - 2 * H);
  const { v, p } = ivt(e);
  conf("4 · sem TC → IVT `incompleta` (falta exclusão de hemorragia)",
    v.tipo === "incompleta" && (v.criteriosAvaliados ?? []).some((c) => c.papel === "classe_imagem" && c.estado === "ausente"),
    `⛔ ${v.tipo} · ${JSON.stringify((v.criteriosAvaliados ?? []).map((c) => [c.papel, c.estado]))}`);
  conf("4 · sem TC → portão ⛔ não liberado", p.liberado === false, `⛔ ${p.estado}`);
  const ve = evt(candidatoEvt());
  conf("4 · EVT sem imagem → seleção fecha ⛔ E classe retida (avaliar ≠ executar)",
    ve.tipo === "recomendada" && ve.classe && ve.classe.estado === "retida" && ve.classe.motivo === "sem_imagem",
    `⛔ tipo=${ve.tipo} classe=${JSON.stringify(ve.classe)}`);
});

/* ══ 5 · HEMORRAGIA PRESENTE ═════════════════════════════════════════════ */
ausente("5 · hemorragia (API)", () => {
  const e = tcCom(candidatoIvt(), 2, AGORA - 30 * MIN);
  const { v, p } = ivt(e);
  conf("5 · TC com hemorragia → IVT `retida`", v.tipo === "retida", `⛔ ${v.tipo}`);
  conf("5 · TC com hemorragia → portão `bloqueado_seguranca`", p.estado === "bloqueado_seguranca", `⛔ ${p.estado}`);
  const ve = evt(tcCom(candidatoEvt(), 1, AGORA - 30 * MIN));
  conf("5 · TC com hemorragia → EVT classe `retida` por `hemorragia_presente`",
    ve.classe && ve.classe.estado === "retida" && ve.classe.motivo === "hemorragia_presente",
    `⛔ tipo=${ve.tipo} classe=${JSON.stringify(ve.classe)}`);
  conf("5 · ⛔ e o destino hemorrágico está armado",
    DC.destinoDaImagem(e) && DC.destinoDaImagem(e).saida === "hemorragia_intracraniana", "⛔ PD-36");
});

/* ══ 6 · IMAGEM DIVERGENTE ═══════════════════════════════════════════════ */
ausente("6 · divergente (API)", () => {
  const e = tcCom(candidatoIvt(), 2, AGORA - 30 * MIN); // est_1 sem · est_2 com
  conf("6 · duas TCs discordantes → C lê `divergente`", DC.exclusaoDeHemorragia(e).exclusao === "divergente", "⛔");
  const { v, p } = ivt(e);
  conf("6 · divergente → IVT `retida` ⛔ e portão ⛔ não liberado", v.tipo === "retida" && p.liberado === false, `⛔ ${v.tipo}/${p.estado}`);
  const ve = evt(tcCom(tcSem(candidatoEvt(), 1, AGORA - 50 * MIN), 2, AGORA - 30 * MIN));
  conf("6 · divergente → EVT classe `retida` por `divergente`",
    ve.classe && ve.classe.estado === "retida" && ve.classe.motivo === "divergente", `⛔ ${JSON.stringify(ve.classe)}`);
  /** ⚠️ Corrigir o laudo errado NA MESMA instância resolve — ⛔ e ⛔ nada de eleger. */
  const corrigido = CAMPOS.corrigirNaInstancia(e, { campo: "estudo_resultado", valor: SEM }, rel, est(2));
  conf("6 · corrigir o laudo na instância → barreira `liberada`",
    DC.barreiraDeReperfusao(corrigido).estado === "liberada", `⛔ ${JSON.stringify(DC.barreiraDeReperfusao(corrigido))}`);
});

/* ══ 7 · INÍCIO HÁ 72 h ══════════════════════════════════════════════════ */
ausente("7 · 72 h (API)", () => {
  let e = reg(vazio, "incapacitante_assumido", "Incapacitante");
  e = reg(e, "hora_inicio_observado", AGORA - 72 * H);
  e = tcSem(e, 1, AGORA - 1 * H);
  const { v, p } = ivt(e);
  conf("7 · início há 72 h → ⛔ NÃO `indicada`", v.tipo !== "indicada", `⛔ ${v.tipo}`);
  conf("7 · ⛔ e ⛔ NÃO `nao_recomendada` (fora da janela ≠ contraindicação, E-37)", v.tipo !== "nao_recomendada", `⛔ ${v.tipo}`);
  conf("7 · ⛔ e o critério temporal está `contradito`, ⛔ não ausente",
    (v.criteriosAvaliados ?? []).some((c) => c.papel === "temporal" && c.estado === "contradito"),
    `⛔ ${JSON.stringify((v.criteriosAvaliados ?? []).map((c) => [c.papel, c.estado]))}`);
  conf("7 · portão ⛔ não liberado", p.liberado === false, `⛔ ${p.estado}`);
  /** ⚠️ ⛔ E o candidato completo dentro da janela É indicado — a composição fecha. */
  const ref = ivt(candidatoIvt());
  conf("7 · referência: candidato completo a 2 h → `indicada` ⛔ e portão liberado",
    ref.v.tipo === "indicada" && ref.p.liberado === true, `⛔ ${ref.v.tipo}/${ref.p.estado} motivos=${ids(ref.p.motivos)}`);
});

/* ══ 8 · LIMITE EXATO DA JANELA ══════════════════════════════════════════ */
ausente("8 · limite exato (API)", () => {
  const limite = (dt) => { let e = reg(vazio, "incapacitante_assumido", "Incapacitante"); e = reg(e, "hora_inicio_observado", AGORA - dt); e = reg(e, "motivo_para_suspeitar_alteracao_coagulacao", "nao"); return ivt(tcSem(e, 1, AGORA - 30 * MIN)).v.tipo; };
  conf("8 · IVT em exatamente 4,5 h → dentro (`indicada`)", limite(4.5 * H) === "indicada", `⛔ ${limite(4.5 * H)}`);
  conf("8 · EVT em exatamente 6 h → rec. 1 ⛔ e rec. 2 alcançam (fronteira da fonte, ⛔ não harmonizada)",
    evt(candidatoEvt(vazio, 6 * H)).tipo === "recomendada", `⛔ ${evt(candidatoEvt(vazio, 6 * H)).tipo}`);
  conf("8 · EVT em exatamente 24 h → dentro", evt(candidatoEvt(vazio, 24 * H)).tipo === "recomendada", `⛔ ${evt(candidatoEvt(vazio, 24 * H)).tipo}`);
});

/* ══ 9 · LIMITE + 1 ms (⛔ sem arredondar antes de comparar) ═════════════ */
ausente("9 · limite + 1 ms (API)", () => {
  const limite = (dt) => { let e = reg(vazio, "incapacitante_assumido", "Incapacitante"); e = reg(e, "hora_inicio_observado", AGORA - dt); e = reg(e, "motivo_para_suspeitar_alteracao_coagulacao", "nao"); return ivt(tcSem(e, 1, AGORA - 30 * MIN)).v.tipo; };
  conf("9 · IVT em 4,5 h + 1 ms → fora", limite(4.5 * H + 1) !== "indicada", `⛔ ${limite(4.5 * H + 1)}`);
  conf("9 · IVT em 4,5 h − 1 ms → dentro", limite(4.5 * H - 1) === "indicada", `⛔ ${limite(4.5 * H - 1)}`);
  conf("9 · EVT em 24 h + 1 ms → fora", evt(candidatoEvt(vazio, 24 * H + 1)).tipo !== "recomendada", `⛔ ${evt(candidatoEvt(vazio, 24 * H + 1)).tipo}`);
  conf("9 · EVT em 24 h + 24 s → fora (AVC-18: ⛔ arredondar ⛔ não decide)",
    evt(candidatoEvt(vazio, 24 * H + 24_000)).tipo !== "recomendada", `⛔ ${evt(candidatoEvt(vazio, 24 * H + 24_000)).tipo}`);
  conf("9 · EVT em 24 h − 1 ms → dentro", evt(candidatoEvt(vazio, 24 * H - 1)).tipo === "recomendada", `⛔ ${evt(candidatoEvt(vazio, 24 * H - 1)).tipo}`);
});

/* ══ 10 · TNK 0,25 mg/kg ═════════════════════════════════════════════════ */
ausente("10 · TNK (API)", () => {
  const e = reg(reg(candidatoIvt(), "peso", 70), "agente_trombolitico", "Tenecteplase");
  const { v, p } = ivt(e);
  conf("10 · candidato + TNK em consideração → ⛔ NÃO `nao_recomendada`", v.tipo !== "nao_recomendada", `⛔ ${v.tipo} contra=${ids(v.contra)}`);
  conf("10 · candidato + TNK → `indicada` ⛔ e portão liberado", v.tipo === "indicada" && p.liberado === true, `⛔ ${v.tipo}/${p.estado}`);
  const d = DF.doseDerivada("tenecteplase", 70, "medido");
  conf("10 · dose de TNK = 0,25 mg/kg, teto 25 mg", d && d.mgPorKg === 0.25 && d.maximoMg === 25 && d.totalMg === 17.5, `⛔ ${JSON.stringify(d)}`);
});

/* ══ 11 · REGRA DE 0,4 mg/kg ═════════════════════════════════════════════ */
ausente("11 · 0,4 (API)", () => {
  const comTnk = reg(reg(candidatoIvt(), "peso", 70), "agente_trombolitico", "Tenecteplase");
  const comAlt = reg(reg(candidatoIvt(), "peso", 70), "agente_trombolitico", "Alteplase");
  const neg = (e) => DF.alertasNegativos(DF.recomendacoesDoEstado(e, AGORA)).map((l) => l.id);
  conf("11 · TNK em consideração → o alerta de 0,4 mg/kg SEGUE visível", neg(comTnk).includes("ivt_tnk_04"), `⛔ ${neg(comTnk)}`);
  conf("11 · alteplase → ⛔ sem alerta de 0,4", !neg(comAlt).includes("ivt_tnk_04"), `⛔ ${neg(comAlt)}`);
  const r = SF.RECOMENDACOES.find((x) => x.id === "ivt_tnk_04");
  conf("11 · `ivt_tnk_04` ⛔ NÃO é domínio de elegibilidade", r && r.dominio !== "elegibilidade", `⛔ dominio=${r && r.dominio}`);
  const a = SF.RECOMENDACOES.find((x) => x.id === "ivt_agente");
  conf("11 · `ivt_agente` ⛔ NÃO é domínio de elegibilidade", a && a.dominio !== "elegibilidade", `⛔ dominio=${a && a.dominio}`);
  const rap = SF.RECOMENDACOES.find((x) => x.id === "ivt_rapidez");
  conf("11 · `ivt_rapidez` permanece no catálogo ⛔ e ⛔ NÃO é elegibilidade", rap && rap.dominio !== "elegibilidade", `⛔ ${rap && rap.dominio}`);
  /** ⚠️ E-50 — o regime do IAM continua inalcançável. */
  conf("11 · E-50: ⛔ nenhuma dose de 30/35/40/45/50 mg é alcançável",
    [50, 65, 75, 85, 95].every((kg) => ![30, 35, 40, 45, 50].includes(DF.doseDerivada("tenecteplase", kg, "medido").totalMg)), "⛔");
});

/* ══ 12 · INR ALTO + NORMAL ══════════════════════════════════════════════ */
ausente("12 · INR alto→normal (API)", () => {
  const base = candidatoIvt();
  const so25 = regI(base, col(1), "inr", 2.5);
  conf("12 · INR 2,5 → `bloqueado_seguranca`", ivt(so25).p.estado === "bloqueado_seguranca", `⛔ ${ivt(so25).p.estado}`);
  const e = regI(so25, col(2), "inr", 1.0);
  const { p } = ivt(e);
  conf("12 · INR 2,5 depois 1,0 → ⛔ NÃO liberado", p.liberado === false, `⛔ ${p.estado}`);
  conf("12 · ⛔ e o estado é `reconciliacao_pendente`", p.estado === "reconciliacao_pendente", `⛔ ${p.estado} motivos=${ids(p.motivos)}`);
  conf("12 · ⛔ e o motivo tem efeito `impede_ate_reconciliar`",
    p.motivos.some((m) => m.efeito === "impede_ate_reconciliar" && /INR/i.test(m.rotulo)), `⛔ ${JSON.stringify(p.motivos.map((m) => [m.id, m.efeito]))}`);
  /** ⚠️ Corrigir o laudo errado na coleta 1 resolve — ⛔ nada de eleger. */
  const corrigido = CAMPOS.corrigirNaInstancia(e, { campo: "inr", valor: 1.1 }, rel, col(1));
  conf("12 · corrigir a coleta errada → reconciliação some ⛔ e o portão volta a liberar",
    ivt(corrigido).p.liberado === true, `⛔ ${ivt(corrigido).p.estado}`);
});

/* ══ 13 · INR NORMAL + ALTO (ordem inversa) ⛔ e demais analitos ═════════ */
ausente("13 · INR normal→alto (API)", () => {
  const base = candidatoIvt();
  const e = regI(regI(base, col(1), "inr", 1.0), col(2), "inr", 2.5);
  conf("13 · INR 1,0 depois 2,5 → `reconciliacao_pendente` (⛔ a ordem de registro ⛔ não decide)",
    ivt(e).p.estado === "reconciliacao_pendente", `⛔ ${ivt(e).p.estado}`);
  for (const [campo, baixo, alto] of [["aptt", 30, 55], ["tp", 12, 20]]) {
    const x = regI(regI(base, col(1), campo, alto), col(2), campo, baixo);
    conf(`13 · ${campo} alto + normal → ⛔ não liberado`, ivt(x).p.liberado === false, `⛔ ${ivt(x).p.estado}`);
  }
  let pl = regI(regI(base, col(1), "plaquetas", 80), col(1), "plaquetas_unidade", "mil/mm³");
  pl = regI(regI(pl, col(2), "plaquetas", 150), col(2), "plaquetas_unidade", "mil/mm³");
  conf("13 · plaquetas 80 mil + 150 mil → ⛔ não liberado", ivt(pl).p.liberado === false, `⛔ ${ivt(pl).p.estado}`);
  const semUnidade = regI(base, col(1), "plaquetas", 80);
  conf("13 · plaquetas com valor ⛔ e sem unidade → ⛔ não liberado (`impede_ate_reconciliar`)",
    ivt(semUnidade).p.liberado === false && ivt(semUnidade).p.motivos.some((m) => m.efeito === "impede_ate_reconciliar"),
    `⛔ ${ivt(semUnidade).p.estado} ${JSON.stringify(ivt(semUnidade).p.motivos.map((m) => [m.id, m.efeito]))}`);
});

/* ══ 14 · VARFARINA COM INR PENDENTE ═════════════════════════════════════ */
ausente("14 · varfarina (API)", () => {
  const e = reg(candidatoIvt(), "anticoagulante_em_uso", "Varfarina ou outro antagonista da vitamina K");
  const { p } = ivt(e);
  conf("14 · varfarina + INR pendente → ⛔ NÃO liberado", p.liberado === false, `⛔ ${p.estado}`);
  conf("14 · ⛔ e o estado é `resultado_pendente` (`impede_ate_resultado`)",
    p.estado === "resultado_pendente" && p.motivos.some((m) => m.efeito === "impede_ate_resultado"), `⛔ ${p.estado} ${JSON.stringify(p.motivos.map((m) => [m.id, m.efeito]))}`);
  /** ⚠️ Table 8 fala de *"coagulation test results"* — INR, PT ⛔ e PTT; ⛔ nenhum mapeamento por agente é inventado. */
  const soInr = regI(e, col(1), "inr", 1.2);
  conf("14 · varfarina + só o INR registrado → ⛔ ainda pendente (PT ⛔ e aPTT faltam)", ivt(soInr).p.estado === "resultado_pendente", `⛔ ${ivt(soInr).p.estado}`);
  const comCoag = regI(regI(soInr, col(1), "tp", 12), col(1), "aptt", 30);
  conf("14 · varfarina + INR, PT ⛔ e aPTT registrados → o pendente sai", ivt(comCoag).p.estado !== "resultado_pendente", `⛔ ${ivt(comCoag).p.estado}`);
  const hep = reg(candidatoIvt(), "anticoagulante_em_uso", "Heparina ou heparina de baixo peso molecular");
  conf("14 · heparina + coagulograma pendente → ⛔ não liberado", ivt(hep).p.liberado === false, `⛔ ${ivt(hep).p.estado}`);
});

/* ══ 15 · DOAC COM HORÁRIO DESCONHECIDO ══════════════════════════════════ */
ausente("15 · DOAC (API)", () => {
  let e = reg(candidatoIvt(), "anticoagulante_em_uso", "Anticoagulante oral direto (DOAC)");
  e = reg(e, "doac_ultima_dose", "nao_sei");
  const { p } = ivt(e);
  conf("15 · DOAC hora desconhecida → ⛔ NÃO `bloqueado_seguranca` (fonte: «may be considered»)",
    p.estado !== "bloqueado_seguranca", `⛔ ${p.estado}`);
  conf("15 · DOAC hora desconhecida → ⛔ NÃO liberado automaticamente (HR-4)", p.liberado === false, `⛔ ${p.estado}`);
  conf("15 · ⛔ e o estado é `julgamento_individual_pendente`", p.estado === "julgamento_individual_pendente", `⛔ ${p.estado}`);
  conf("15 · ⛔ e o motivo tem efeito `exige_julgamento`, ⛔ nunca `impede`",
    p.motivos.some((m) => m.efeito === "exige_julgamento") && !p.motivos.some((m) => m.efeito === "impede"),
    `⛔ ${JSON.stringify(p.motivos.map((m) => [m.id, m.efeito]))}`);
  conf("15 · F-30 continua sem cálculo de janela", DD.exposicaoADoac(e).janelaClassificada === false, "⛔");
  conf("15 · ⛔ e ⛔ nenhuma palavra «contraindica» no motivo",
    !p.motivos.some((m) => /contraindic/i.test(`${m.rotulo} ${m.oQueFalta}`)), `⛔ ${JSON.stringify(p.motivos.map((m) => m.rotulo))}`);
});

/* ══ 16 · SUSPEITA DE COAGULOPATIA ═══════════════════════════════════════ */
ausente("16 · suspeita (API)", () => {
  const sim = reg(candidatoSemJuizo(), "motivo_para_suspeitar_alteracao_coagulacao", "sim");
  conf("16 · suspeita = sim, sem exame → `resultado_pendente`", ivt(sim).p.estado === "resultado_pendente", `⛔ ${ivt(sim).p.estado}`);
  const nao = reg(candidatoSemJuizo(), "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  conf("16 · suspeita = não, sem varfarina/heparina → liberado, com E-47 visível",
    ivt(nao).p.liberado === true && ivt(nao).p.motivos.some((m) => m.efeito === "condicao_resolutiva"),
    `⛔ ${ivt(nao).p.estado} ${JSON.stringify(ivt(nao).p.motivos.map((m) => [m.id, m.efeito]))}`);
  const np = candidatoSemJuizo();
  conf("16 · suspeita ⛔ NÃO perguntada → ⛔ não vira negativo ⛔ nem contraindicação (HR-3): `informacao_incompleta` nomeando o juízo",
    ivt(np).p.estado === "informacao_incompleta" && ivt(np).p.motivos.some((m) => m.campo === "motivo_para_suspeitar_alteracao_coagulacao"),
    `⛔ ${ivt(np).p.estado} ${JSON.stringify(ivt(np).p.motivos.map((m) => [m.id, m.campo]))}`);
  /** ⚠️ ⛔ E o candidato de referência (caso 7) responde «não» — ⛔ coagulograma ⛔ não é universal. */
  conf("16 · ⛔ e ⛔ nenhuma pendência de coagulograma nasce sem suspeita",
    !DD.pendenciasDaSeguranca(nao).some((x) => x.id === "coagulograma"), "⛔ 🚫 marca 2");
});

/* ══ 17 · CONTRAINDICAÇÃO IVT COM EVT AINDA POSSÍVEL ═════════════════════ */
ausente("17 · independência (API)", () => {
  const cand = tcSem(candidatoEvt(), 1, AGORA - 30 * MIN);
  const semInr = evt(cand);
  const comInr = evt(regI(cand, col(1), "inr", 2.5));
  conf("17 · INR 2,5 → portão IVT `bloqueado_seguranca`", ivt(regI(cand, col(1), "inr", 2.5)).p.estado === "bloqueado_seguranca", "⛔");
  conf("17 · ⛔ e o veredito EVT é IDÊNTICO com ⛔ e sem o INR (byte a byte)",
    JSON.stringify(semInr) === JSON.stringify(comInr), `⛔ ${JSON.stringify(semInr.tipo)} vs ${JSON.stringify(comInr.tipo)}`);
  conf("17 · ⛔ e continua `recomendada` com classe liberada", comInr.tipo === "recomendada" && comInr.classe.estado === "liberada", `⛔ ${comInr.tipo}/${JSON.stringify(comInr.classe)}`);
  /** ⚠️ Propriedade: fatos de D/E/A ⛔ não alteram EVT. */
  const perturbacoes = [["glicemia", 42], ["pas", 198], ["motivo_para_suspeitar_alteracao_coagulacao", "sim"], ["anticoagulante_em_uso", "Varfarina ou outro antagonista da vitamina K"]];
  const iguais = perturbacoes.every(([c, v]) => JSON.stringify(evt(reg(cand, c, v))) === JSON.stringify(semInr));
  conf("17 · propriedade: glicemia, PA, suspeita ⛔ e varfarina ⛔ não mudam ⛔ nenhum byte da EVT", iguais, "⛔ EVT herdou algo de IVT");
});

/* ══ 18 · IVT INICIADA → INTERROMPIDA ════════════════════════════════════ */
ausente("18 · interrompida (API)", () => {
  conf("18 · o vocabulário tem `Interrompida`", SE.ESTADO_DA_ACAO.interrompida === "Interrompida" && SE.OPCOES_ESTADO_DA_ACAO.includes("Interrompida"),
    `⛔ ${JSON.stringify(SE.OPCOES_ESTADO_DA_ACAO)}`);
  conf("18 · ⛔ e `Interrompida` NUNCA resolve bloqueio", SE.ESTADOS_QUE_NAO_RESOLVEM.includes("Interrompida"), "⛔ trava do autor");
  const T0 = AGORA - 3 * H;
  let e = regI(regI(vazio, tiv(1), "ivt_estado", "Iniciada"), tiv(1), "ivt_inicio", T0);
  e = regI(e, tiv(1), "ivt_estado", "Interrompida");
  const x = DF.exposicaoAoTrombolitico(e);
  conf("18 · iniciada → interrompida = `exposta` com fase `interrompida`", x.estado === "exposta" && x.fase === "interrompida", `⛔ ${JSON.stringify(x)}`);
  conf("18 · ⛔ e a monitorização SEGUE pertinente", DG.pertinenciaDaMonitorizacao(e).pertinente === true, `⛔ ${JSON.stringify(DG.pertinenciaDaMonitorizacao(e))}`);
  conf("18 · ⛔ e a fase da Table 7 é calculada (3 h → 30 em 30 min)",
    DG.faseDaMonitorizacao(e, AGORA) && DG.faseDaMonitorizacao(e, AGORA).tipo === "fase" && DG.faseDaMonitorizacao(e, AGORA).aCadaMin === 30,
    `⛔ ${JSON.stringify(DG.faseDaMonitorizacao(e, AGORA))}`);
  conf("18 · ⛔ e a PA pós-IVT tem contexto", DG.estadoPressoricoPosIvt(e, AGORA) !== undefined, "⛔");
  const s = SIN.sinteseDoCaso(e, rel, []);
  conf("18 · ⛔ e a síntese mostra a conduta como interrompida, ⛔ nunca «indicada»",
    s.condutas.length === 1 && s.condutas[0].natureza === "interrompida", `⛔ ${JSON.stringify(s.condutas)}`);
});

/* ══ 19 · CANCELADA ANTES DE INICIAR ═════════════════════════════════════ */
ausente("19 · cancelada (API)", () => {
  const e = regI(vazio, tiv(1), "ivt_estado", "Cancelada");
  const x = DF.exposicaoAoTrombolitico(e);
  conf("19 · cancelada sem início → `cancelada_antes_do_inicio`", x.estado === "cancelada_antes_do_inicio", `⛔ ${JSON.stringify(x)}`);
  conf("19 · ⛔ e ⛔ nada pertinente", DG.pertinenciaDaMonitorizacao(e).pertinente === false, "⛔");
  conf("19 · ⛔ e a síntese ⛔ não lista conduta", SIN.sinteseDoCaso(e, rel, []).condutas.length === 0, "⛔");
});

/* ══ 20 · IVT COM HORÁRIO DESCONHECIDO ═══════════════════════════════════ */
ausente("20 · sem hora (API)", () => {
  const naoPerg = regI(vazio, tiv(1), "ivt_estado", "Iniciada");
  const naoSei = regI(naoPerg, tiv(1), "ivt_inicio", "nao_sei");
  for (const [nome, e, tipoInicio] of [["não perguntado", naoPerg, "nao_perguntado"], ["«sem essa informação»", naoSei, "desconhecido_declarado"]]) {
    const x = DF.exposicaoAoTrombolitico(e);
    conf(`20 · iniciada, hora ${nome} → exposta, início \`${tipoInicio}\``,
      x.estado === "exposta" && x.inicio && x.inicio.tipo === tipoInicio, `⛔ ${JSON.stringify(x)}`);
    const a = DG.estadoAntitromboticoPosIvt(e, AGORA);
    conf(`20 · hora ${nome} → antitrombótico \`sem_horario_ivt\` (⛔ nunca «fora do contexto»)`, a.estado === "sem_horario_ivt", `⛔ ${a.estado}`);
    conf(`20 · hora ${nome} → aspirina IV dos 90 min INDETERMINADA (⛔ nunca false)`, a.aspirinaIvNosNoventaMin === undefined, `⛔ ${JSON.stringify(a.aspirinaIvNosNoventaMin)}`);
    conf(`20 · hora ${nome} → fase \`sem_horario\``, DG.faseDaMonitorizacao(e, AGORA) && DG.faseDaMonitorizacao(e, AGORA).tipo === "sem_horario", "⛔");
  }
});

/* ══ 21 · TC PRECOCE NORMAL → EXAME POSTERIOR HEMORRÁGICO ═══════════════ */
ausente("21 · imagens pós-IVT (API)", () => {
  const T0 = AGORA - 26 * H;
  const base = regI(regI(vazio, tiv(1), "ivt_estado", "Iniciada"), tiv(1), "ivt_inicio", T0);
  const ordemA = tcCom(tcSem(base, 1, T0 + 1 * H), 2, T0 + 25 * H);
  const ordemB = tcSem(tcCom(base, 1, T0 + 25 * H), 2, T0 + 1 * H);
  for (const [nome, e] of [["normal→hemorrágica", ordemA], ["hemorrágica→normal (inserção invertida)", ordemB]]) {
    const im = DG.imagensAposIvt(e, T0);
    conf(`21 · ${nome} → achado presente ⛔ e discordante (C lê; G consome)`,
      im.estado === "com_resultado" && im.achadoPresente === true && im.discordante === true, `⛔ ${JSON.stringify(im)}`);
    const a = DG.estadoAntitromboticoPosIvt(e, AGORA);
    conf(`21 · ${nome} → o antitrombótico ⛔ NUNCA diz «sem hemorragia»`,
      a.resultado !== SEM && a.estado !== "resultado_disponivel", `⛔ ${a.estado} · ${a.resultado}`);
    conf(`21 · ${nome} → estado próprio de achado pós-IVT`, a.estado === "resultado_disponivel_com_achado" && a.resultado === HEM, `⛔ ${a.estado}`);
  }
  const concordam = tcSem(tcSem(base, 1, T0 + 1 * H), 2, T0 + 25 * H);
  conf("21 · duas posteriores sem hemorragia → com resultado, ⛔ sem achado",
    DG.imagensAposIvt(concordam, T0).estado === "com_resultado" && DG.imagensAposIvt(concordam, T0).achadoPresente === false, `⛔ ${JSON.stringify(DG.imagensAposIvt(concordam, T0))}`);
  const basal = tcSem(base, 1, T0 - 1 * H);
  conf("21 · estudo ANTERIOR à IVT ⛔ não é posterior", DG.imagensAposIvt(basal, T0).estado === "nenhuma_posterior", `⛔ ${JSON.stringify(DG.imagensAposIvt(basal, T0))}`);
});

/* ══ 22 · ABRIR FORMULÁRIO DE ADMINISTRAÇÃO VAZIO ═══════════════════════ */
ausente("22 · formulário vazio (API)", () => {
  const e = E.registrarFato(vazio, {
    campo: `${SF.TROMBOLISE_IV}_nova_medida`, valor: tiv(1), instancia: tiv(1), motivo: "Nova aferição aberta pelo médico",
  }, rel);
  const x = DF.exposicaoAoTrombolitico(e);
  conf("22 · instância vazia → `registro_em_aberto`, ⛔ nunca exposição", x.estado === "registro_em_aberto", `⛔ ${JSON.stringify(x)}`);
  conf("22 · ⛔ e a síntese ⛔ NÃO diz «Trombólise indicada»", SIN.sinteseDoCaso(e, rel, []).condutas.length === 0, `⛔ ${JSON.stringify(SIN.sinteseDoCaso(e, rel, []).condutas)}`);
  conf("22 · ⛔ e a monitorização ⛔ não é pertinente", DG.pertinenciaDaMonitorizacao(e).pertinente === false, "⛔");
  conf("22 · ⛔ e ⛔ nenhuma administração conta para discrepância", DF.administracoesRegistradas(e) === 0, `⛔ ${DF.administracoesRegistradas && DF.administracoesRegistradas(e)}`);
  /** ⚠️ Escolher o agente também ⛔ não é conduta. */
  const comAgente = reg(e, "agente_trombolitico", "Tenecteplase");
  conf("22 · escolher o agente ⛔ não cria conduta", SIN.sinteseDoCaso(comAgente, rel, []).condutas.length === 0, "⛔ selecionado ≠ indicado");
});

/* ══ 23 · LKW CONHECIDO → DESCONHECIDO → CORRIGIDO ══════════════════════ */
ausente("23 · LKW (API)", () => {
  const conhecido = reg(vazio, "hora_ultima_vez_bem", AGORA - 2 * H);
  conf("23 · LKW registrado como FATO → decorrido 120 min (⛔ sem escrita dupla)",
    E.decorridoEmMinutos(conhecido, "ultima_vez_bem", rel) === 120, `⛔ ${E.decorridoEmMinutos(conhecido, "ultima_vez_bem", rel)}`);
  conf("23 · ⛔ e a síntese mostra o tempo", SIN.sinteseDoCaso(conhecido, rel, []).situacao.some((l) => l.id === "tempo"), "⛔");
  const naoSei = reg(conhecido, "hora_ultima_vez_bem", "nao_sei");
  conf("23 · LKW → «sem essa informação» → decorrido `undefined`",
    E.decorridoEmMinutos(naoSei, "ultima_vez_bem", rel) === undefined, `⛔ ${E.decorridoEmMinutos(naoSei, "ultima_vez_bem", rel)}`);
  conf("23 · ⛔ e a síntese ⛔ não mostra «há 2 h»", !SIN.sinteseDoCaso(naoSei, rel, []).situacao.some((l) => l.id === "tempo"), `⛔ ${JSON.stringify(SIN.sinteseDoCaso(naoSei, rel, []).situacao)}`);
  const corrigido = reg(naoSei, "hora_ultima_vez_bem", AGORA - 3 * H);
  conf("23 · LKW corrigido para 3 h → decorrido 180", E.decorridoEmMinutos(corrigido, "ultima_vez_bem", rel) === 180, `⛔ ${E.decorridoEmMinutos(corrigido, "ultima_vez_bem", rel)}`);
  conf("23 · ⛔ e o t₀ operacional continua no atendimento", E.decorridoEmMinutos(vazio, "t0_operacional", rel) === 0, "⛔");
});

/* ══ 24 · VEREDITO EXPLICÁVEL (D1) ═══════════════════════════════════════ */
ausente("24 · D1 (API)", () => {
  const { v } = ivt(candidatoIvt());
  conf("24 · `indicada` carrega critérios com papel, estado ⛔ e fonte",
    Array.isArray(v.criteriosAvaliados) && v.criteriosAvaliados.length >= 4 && v.criteriosAvaliados.every((c) => c.papel && c.estado && c.fonte),
    `⛔ ${JSON.stringify(v.criteriosAvaliados)}`);
  conf("24 · ⛔ e todos os critérios estão `satisfeito` no caso positivo",
    (v.criteriosAvaliados ?? []).every((c) => c.estado === "satisfeito"), `⛔ ${JSON.stringify((v.criteriosAvaliados ?? []).map((c) => [c.papel, c.estado]))}`);
  conf("24 · ⛔ e o veredito se declara derivação nível 3 do aplicativo", v.nivelDeConstrucao === 3, `⛔ ${v.nivelDeConstrucao}`);
  conf("24 · ⛔ e a ressalva continua dentro do veredito", typeof v.ressalva === "string" && /decisão é do médico/i.test(v.ressalva), "⛔");
  conf("24 · ⛔ e ⛔ nenhuma recomendação isolada é apontada como autora da frase",
    (v.sustentam ?? []).length === 0 || v.criteriosAvaliados.length > 1, "⛔");
});

/* ══ 25 · PROPRIEDADES DO PORTÃO ═════════════════════════════════════════ */
ausente("25 · propriedades (API)", () => {
  const casos = [
    vazio, reg(vazio, "peso", 70), candidatoIvt(), tcCom(candidatoIvt(), 2, AGORA - 30 * MIN),
    regI(candidatoIvt(), col(1), "inr", 2.5), regI(regI(candidatoIvt(), col(1), "inr", 2.5), col(2), "inr", 1.0),
    reg(candidatoIvt(), "anticoagulante_em_uso", "Varfarina ou outro antagonista da vitamina K"),
    reg(reg(candidatoIvt(), "anticoagulante_em_uso", "Anticoagulante oral direto (DOAC)"), "doac_ultima_dose", "nao_sei"),
    reg(candidatoIvt(), "glicemia", 42),
  ];
  const quebra = casos.filter((e) => {
    const p = P.estadoDoPortaoIVT(e, AGORA);
    const b = DC.barreiraDeReperfusao(e);
    return p.liberado && (b.estado !== "liberada" || p.motivos.some((m) => String(m.efeito).startsWith("impede")));
  });
  conf("25 · liberado ⇒ barreira liberada ∧ ∄ motivo `impede*`", quebra.length === 0, `⛔ ${quebra.length} caso(s)`);
  const julg = casos.flatMap((e) => P.estadoDoPortaoIVT(e, AGORA).motivos).filter((m) => m.efeito === "exige_julgamento");
  conf("25 · `exige_julgamento` nunca coexiste com `impede` no mesmo motivo", julg.every((m) => m.efeito !== "impede"), "⛔");
  /** ⚠️ Permutar ordem de registro ⛔ não muda saída. */
  const a = regI(regI(candidatoIvt(), col(1), "inr", 2.5), col(2), "inr", 1.0);
  const b = regI(regI(candidatoIvt(), col(1), "inr", 1.0), col(2), "inr", 2.5);
  conf("25 · permutar a ordem de registro das coletas ⛔ não muda o portão",
    P.estadoDoPortaoIVT(a, AGORA).estado === P.estadoDoPortaoIVT(b, AGORA).estado, "⛔");
  /** ⚠️ ⛔ Nenhuma saída é gravada. */
  const antes = candidatoIvt().fatos.length;
  ivt(candidatoIvt()); evt(candidatoEvt()); DF.exposicaoAoTrombolitico(candidatoIvt());
  conf("25 · ⛔ nenhuma derivação grava fato", candidatoIvt().fatos.length === antes, "⛔ E-43");
});

/* ══ 26 · TRILHA LEGADA: INICIADA → CANCELADA (HR-5) ════════════════════ */
ausente("26 · legado (API)", () => {
  const T0 = AGORA - 3 * H;
  let e = regI(regI(vazio, tiv(1), "ivt_estado", "Iniciada"), tiv(1), "ivt_inicio", T0);
  e = regI(e, tiv(1), "ivt_estado", "Cancelada");
  const x = DF.exposicaoAoTrombolitico(e);
  conf("26 · iniciada → cancelada (legado) PRESERVA a exposição", x.estado === "exposta", `⛔ ${JSON.stringify(x)}`);
  conf("26 · ⛔ e sinaliza a contradição", x.contraditoria === true, `⛔ ${JSON.stringify(x)}`);
  conf("26 · ⛔ e a monitorização segue pertinente", DG.pertinenciaDaMonitorizacao(e).pertinente === true, "⛔");
});

/* ══ 27 · DOAC NOMEADO COM HORA ⛔ NÃO PERGUNTADA (red-team C40 · 2026-09-12) ═ */
/**
 * ⚠️⚠️ O ataque C40 do red-team pós-correção: DOAC **nomeado** ⛔ e a hora da
 * última dose ⛔ nunca perguntada abria o portão, ⛔ enquanto *"não sei"*
 * exigia julgamento. ⛔ Um degrau a menos de evidência valia como um degrau a
 * mais (E-23; regra do estado intermediário). ⚠️ Esperado: pendência
 * explícita (`aguarda_juizo`) nomeando a **hora** — ⛔ nunca contraindicação,
 * ⛔ nunca conversão silenciosa em `nao_sei`, ⛔ nunca cálculo de 48 h.
 */
ausente("27 · DOAC hora não perguntada (API)", () => {
  const DOAC = "Anticoagulante oral direto (DOAC)";
  const np = reg(candidatoIvt(), "anticoagulante_em_uso", DOAC);
  const r = ivt(np);
  conf("27 · DOAC nomeado + hora ⛔ não perguntada + juízo «não» → ⛔ NÃO liberado", r.p.liberado === false, `⛔ ${r.p.estado}`);
  conf("27 · ⛔ e o veredito ⛔ não é `indicada`", r.v.tipo !== "indicada", `⛔ ${r.v.tipo}`);
  conf("27 · ⛔ e ⛔ não é contraindicação (`bloqueado_seguranca`)", r.p.estado !== "bloqueado_seguranca", `⛔ ${r.p.estado}`);
  conf("27 · ⛔ e ⛔ não vira `nao_sei` em silêncio (segue `julgamento_individual_pendente` ⛔ só com «não sei»)",
    r.p.estado !== "julgamento_individual_pendente" && DD.exposicaoADoac(np).exposicao === "nao_perguntado",
    `⛔ ${r.p.estado} · exposição ${DD.exposicaoADoac(np).exposicao}`);
  const motivo = r.p.motivos.find((m) => m.campo === "doac_ultima_dose");
  conf("27 · pendência explícita `aguarda_juizo` apontando `doac_ultima_dose`",
    motivo !== undefined && motivo.efeito === "aguarda_juizo",
    `⛔ ${JSON.stringify(r.p.motivos.map((m) => [m.id, m.efeito, m.campo]))}`);
  conf("27 · ⛔ e `oQueFalta` fala da **hora da última dose**",
    motivo !== undefined && /hora da última dose/i.test(motivo.oQueFalta), `⛔ ${motivo && motivo.oQueFalta}`);
  conf("27 · ⛔ e o portão é `informacao_incompleta`", r.p.estado === "informacao_incompleta", `⛔ ${r.p.estado}`);

  /** ⚠️ Com **todos** os demais critérios completos (peso, agente, TNK) — ⛔ continua ⛔ não indicada. */
  const completo = reg(reg(np, "peso", 70), "agente_trombolitico", "Tenecteplase");
  const rc = ivt(completo);
  const seg = rc.v.criteriosAvaliados.find((c) => c.papel === "seguranca");
  conf("27 · demais critérios completos → veredito ⛔ ≠ `indicada`, segurança ⛔ ≠ `satisfeito`",
    rc.v.tipo !== "indicada" && rc.p.liberado === false && (seg === undefined || seg.estado !== "satisfeito"),
    `⛔ ${rc.v.tipo} / ${rc.p.estado} / ${seg && seg.estado}`);

  /** ⚠️ Transições. */
  const ns = reg(np, "doac_ultima_dose", "nao_sei");
  conf("27 · transição não perguntada → «não sei»: `julgamento_individual_pendente` + `exige_julgamento`",
    ivt(ns).p.estado === "julgamento_individual_pendente" && ivt(ns).p.motivos.some((m) => m.efeito === "exige_julgamento"),
    `⛔ ${ivt(ns).p.estado}`);
  conf("27 · ⛔ e F-30 segue sem janela", DD.exposicaoADoac(ns).janelaClassificada === false, "⛔");
  const hc = reg(np, "doac_ultima_dose", AGORA - 3 * H);
  conf("27 · transição não perguntada → hora conhecida: `julgamento_individual_pendente`, ⛔ sem cálculo de 48 h",
    ivt(hc).p.estado === "julgamento_individual_pendente" && DD.exposicaoADoac(hc).janelaClassificada === false,
    `⛔ ${ivt(hc).p.estado} · janelaClassificada ${DD.exposicaoADoac(hc).janelaClassificada}`);
  const hc10d = reg(np, "doac_ultima_dose", AGORA - 10 * 24 * H);
  conf("27 · hora conhecida há 10 dias: ⛔ mesmo estado (o app ⛔ não classifica 48 h)",
    ivt(hc10d).p.estado === ivt(hc).p.estado, `⛔ ${ivt(hc10d).p.estado}`);

  /**
   * ⚠️⚠️ PROPRIEDADE: ⛔ preencher **menos** ⛔ jamais torna o portão ⛔ mais
   * permissivo. ⛔ Para cada juízo da rec. 10, a hora ⛔ não perguntada ⛔ não
   * pode ser mais permissiva que «não sei», ⛔ e «não sei» ⛔ não pode ser mais
   * permissiva que a hora conhecida. ⛔ E com DOAC nomeado o portão ⛔ nunca abre.
   */
  const PERM = { liberado: 3, julgamento_individual_pendente: 2 };
  const perm = (e) => { const s = ivt(e).p.estado; return s === "bloqueado_seguranca" ? 0 : (PERM[s] ?? 1); };
  const juizos = [undefined, "nao", "sim", "nao_sei"];
  const horas = [undefined, "nao_sei", AGORA - 3 * H];
  const base = reg(candidatoSemJuizo(), "anticoagulante_em_uso", DOAC);
  const com = (j, h) => { let e = base; if (j !== undefined) e = reg(e, "motivo_para_suspeitar_alteracao_coagulacao", j); if (h !== undefined) e = reg(e, "doac_ultima_dose", h); return e; };
  const violacoes = [];
  for (const j of juizos) {
    const [pNp, pNs, pHc] = horas.map((h) => perm(com(j, h)));
    if (!(pNp <= pNs && pNs <= pHc)) violacoes.push({ juizo: j ?? "não perguntado", pNp, pNs, pHc });
    for (const h of horas) if (ivt(com(j, h)).p.liberado) violacoes.push({ juizo: j ?? "não perguntado", hora: h ?? "não perguntada", liberado: true });
  }
  conf("27 · propriedade: menos informação ⛔ nunca é mais permissivo; DOAC nomeado ⛔ nunca libera (12 combinações)",
    violacoes.length === 0, `⛔ ${JSON.stringify(violacoes)}`);
});

/* ── resultado ─────────────────────────────────────────────────────────── */
console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA ADVERSARIAL DOS CRÍTICOS — ${ok} verde(s) · ${falhas} vermelho(s)`);
if (falhas > 0) {
  console.log(`\n   Vermelhos: ${falhas}. ⛔ Desde o commit 11 esta prova é regressão permanente: um vermelho é um crítico da auditoria reaberto (ver o mapa commit → casos no cabeçalho).`);
  process.exit(1);
}
