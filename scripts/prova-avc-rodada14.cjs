#!/usr/bin/env node
/**
 * PROVA · 14ª RODADA DO AVC — via aérea avançada (AC-76), NIHSS sob sedação como contexto
 * (AC-77), marca de sedação no Glasgow (AC-78), os dois caminhos do cartão A04, leve ≠
 * incapacitante ⛔ e o plano até 48 h (T08, C08). Decisões do autor, 2026-09-13
 * (`docs/decisoes.md`, 14ª rodada).
 *
 * PROMETE:
 *  · AC-76: o campo é "via aérea avançada instalada"; o TIPO define se é definitiva
 *    (intubação orotraqueal ⛔ e cirúrgica = sim; supraglótico = não; outra/não sei =
 *    indeterminada); cabeçalho por tipo; marca de sedação ⛔ e item 10 para todos os tipos.
 *  · AC-77: NIHSS sob sedação ⛔ é critério. Sem exame anterior, a regra dependente (piso de
 *    EVT) fica "inconclusivo — exame sob sedação; avaliação especializada"; com "sedação
 *    suspensa para o exame = sim" o exame vale (satisfaz ⛔ ou contradiz) ⛔ e fica marcado.
 *  · AC-78: o Glasgow recebe a mesma marca.
 *  · A04: o cartão oferece §4.6.3 rec. 1 (DWI/FLAIR) ⛔ e rec. 2 (perfusão automatizada),
 *    cada um com os dados que exige.
 *  · Leve ⛔ e incapacitante são perguntas ⛔ e fatos distintos.
 *  · Plano até 48 h: um caminho por evento REAL (início da trombólise, fim da trombectomia,
 *    decisão de não reperfundir, hemorragia confirmada), cada tarefa com evento de origem,
 *    prazo ⛔ ou condição ⛔ e critério de conclusão; tempo ⛔ autoriza (A15); atraso;
 *    deterioração antecipa; cancelamento encerra o caminho; fuso ⛔ muda instantes;
 *    quatro caminhos com agendas diferentes; transversais como "conteúdo pendente de
 *    validação" com fontes listadas em `docs/avc/revisao/plano-48h.md`.
 * NÃO PROMETE: o gesto a 375 px ⛔ e ES (isso é `e2e/avc-rodada14.spec.ts`); ⛔ valida conteúdo
 *   clínico — ⛔ há dose, intervalo ⛔ ou limiar novo.
 * UNIVERSO: `avc/conteudo/{via-aerea-externa,plano-48h,superficie-b,superficie-f}.ts`,
 *   `avc/nucleo/{via-aerea-externa,derivacoes-b,derivacoes-f,plano-48h}.ts`,
 *   `components/avc/{superficie-a,superficie-b,superficie-g,plano-48h}.tsx`,
 *   `docs/avc/revisao/plano-48h.md`.
 * FONTE: `docs/decisoes.md` — 14ª rodada.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada14-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const arq = (...p) => path.join(appDir, ...p);
const fontes = [arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "derivacoes-b.ts"),
  arq("avc", "nucleo", "derivacoes-f.ts"), arq("avc", "nucleo", "via-aerea-externa.ts"), arq("avc", "nucleo", "instancia.ts"),
  arq("avc", "nucleo", "deterioracao.ts"), arq("avc", "conteudo", "campos.ts"), arq("avc", "conteudo", "campo.ts"),
  arq("avc", "conteudo", "superficie-b.ts"), arq("avc", "conteudo", "superficie-c.ts"), arq("avc", "conteudo", "superficie-f.ts"),
  arq("avc", "conteudo", "via-aerea-externa.ts")];
for (const novo of [arq("avc", "nucleo", "plano-48h.ts"), arq("avc", "conteudo", "plano-48h.ts")]) {
  if (fs.existsSync(novo)) fontes.push(novo);
}
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const B = emT("avc", "nucleo", "derivacoes-b.js");
const F = emT("avc", "nucleo", "derivacoes-f.js");
const VA = emT("avc", "nucleo", "via-aerea-externa.js");
const I = emT("avc", "nucleo", "instancia.js");
const D = emT("avc", "nucleo", "deterioracao.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SB = emT("avc", "conteudo", "superficie-b.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const CVA = emT("avc", "conteudo", "via-aerea-externa.js");
const P = emT("avc", "nucleo", "plano-48h.js");
const CP = emT("avc", "conteudo", "plano-48h.js");

const MIN = 60_000;
const H = 60 * MIN;
const T0 = 1_800_000_000_000;
const tenta = (fn, padrao) => { try { return fn(); } catch (err) { return padrao === undefined ? `⛔ ${err.message}` : padrao; } };

/* ══ 1 · AC-76 · VIA AÉREA AVANÇADA, DEFINITIVA PELO TIPO ═════════════════ */
{
  const ids = (CVA?.CAMPOS_DA_VIA_AEREA_EXTERNA ?? []).map((c) => c.id);
  const avancada = (CVA?.CAMPOS_DA_VIA_AEREA_EXTERNA ?? []).find((c) => c.id === "va_avancada");
  conf("o campo é «Via aérea avançada instalada» (sim · não · não sei)", avancada !== undefined && avancada.rotulo === "Via aérea avançada instalada",
    `⛔ campos ${ids}`);
  conf("⛔ existe mais o campo «Via aérea definitiva» respondido pela equipe", !ids.includes("va_definitiva"), "⛔ va_definitiva ainda é pergunta");
  const leitura = (tipo) => tenta(() => {
    const rel = R.relogioControlado(T0);
    return VA.leituraDaViaAereaExterna(VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo, observado: T0 }, rel));
  }, {});
  conf("intubação orotraqueal ⛔ e via aérea cirúrgica = definitiva", leitura("Intubação orotraqueal").definitiva === "sim" && leitura("Via aérea cirúrgica").definitiva === "sim",
    `⛔ ${leitura("Intubação orotraqueal").definitiva} · ${leitura("Via aérea cirúrgica").definitiva}`);
  conf("dispositivo supraglótico = NÃO definitiva", leitura("Dispositivo supraglótico").definitiva === "nao", `⛔ ${leitura("Dispositivo supraglótico").definitiva}`);
  conf("outra ⛔ e não sei = definitiva indeterminada (⛔ presumida)", leitura("Outra").definitiva === "indeterminada" && leitura("Não sei").definitiva === "indeterminada",
    `⛔ ${leitura("Outra").definitiva} · ${leitura("Não sei").definitiva}`);
  const cabecalho = (tipo) => tenta(() => {
    const rel = R.relogioControlado(T0);
    return VA.suporteAtivo(VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo, observado: T0 }, rel))[0] ?? {};
  }, {});
  conf("cabeçalho: IOT → «intubado às»", cabecalho("Intubação orotraqueal").rotulo === "intubado às" && cabecalho("Intubação orotraqueal").hora === T0, `⛔ ${JSON.stringify(cabecalho("Intubação orotraqueal"))}`);
  conf("cabeçalho: cirúrgica → «via aérea cirúrgica às»", cabecalho("Via aérea cirúrgica").rotulo === "via aérea cirúrgica às", `⛔ ${JSON.stringify(cabecalho("Via aérea cirúrgica"))}`);
  conf("cabeçalho: supraglótico → «dispositivo supraglótico às» ⛔ «(não definitiva)»",
    cabecalho("Dispositivo supraglótico").rotulo === "dispositivo supraglótico às" && cabecalho("Dispositivo supraglótico").sufixo === "(não definitiva)",
    `⛔ ${JSON.stringify(cabecalho("Dispositivo supraglótico"))}`);
  const supra = tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo: "Dispositivo supraglótico", observado: T0 }, rel);
    rel.avancar(10 * MIN);
    e = E.registrarFato(e, { campo: "nihss_calculado", valor: 7 }, rel);
    return { marca: VA.examesNihss(e)[0]?.marca, un: VA.itensNihssSugeridosComoNaoTestaveis(e) };
  }, {});
  conf("supraglótico também marca «sob sedação» ⛔ e sugere o item 10", supra.marca === "sob_sedacao" && JSON.stringify(supra.un) === JSON.stringify(["10"]), `⛔ ${JSON.stringify(supra)}`);
}

/* ══ 2 · AC-77 · NIHSS SOB SEDAÇÃO É CONTEXTO, ⛔ CRITÉRIO ════════════════ */
const EVT = SF?.RECOMENDACOES?.find((r) => r.criterios?.nihss?.min === 6 && r.terapia === "evt");
{
  conf("existe recomendação de EVT com piso de NIHSS (≥ 6) para medir", EVT !== undefined, "⛔ sem piso de EVT");
  const cenario = (total, suspensa, horaConhecida = true) => tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo: "Intubação orotraqueal", observado: horaConhecida ? T0 : "nao_sei", sedacao: "sim" }, rel);
    rel.avancar(15 * MIN);
    e = E.registrarFato(e, { campo: "nihss_calculado", valor: total }, rel);
    const exame = VA.examesNihss(e)[0];
    if (suspensa !== undefined) e = VA.registrarSedacaoSuspensa(e, exame.fatoId, suspensa, rel);
    return {
      piso: F.valorDoInsumoNaRecomendacao(e, EVT, "nihss", rel.agora()),
      motivo: F.motivoDoInsumoInconclusivo?.(e, "nihss"),
      calculado: B.nihssCalculado(e),
      inconclusivo: B.nihssInconclusivoPorSedacao?.(e),
      exame: VA.examesNihss(e)[0],
      leitura: B.nihssRegistrado(e),
    };
  }, {});
  const so = cenario(8);
  conf("⚠️ piso de EVT com ÚNICO NIHSS sob sedação (8 ≥ 6) → inconclusivo, ⛔ satisfaz", so.piso === "inconclusivo", `⛔ ${so.piso}`);
  conf("… ⛔ nenhuma regra recebe o número", so.calculado === undefined && so.inconclusivo === true, `⛔ calculado ${so.calculado} · inconclusivo ${so.inconclusivo}`);
  conf("… motivo dito: «inconclusivo — exame sob sedação; avaliação especializada»",
    typeof so.motivo === "string" && /inconclusivo — exame sob sedação; avaliação especializada/.test(so.motivo), `⛔ ${so.motivo}`);
  conf("… a leitura do NIHSS diz «sob sedação», ⛔ «ainda não registrado»",
    so.leitura?.conclusao === "sim" && /sob sedação/.test(so.leitura?.curto ?? ""), `⛔ ${JSON.stringify(so.leitura)}`);
  const baixo = cenario(3);
  conf("⚠️ nem limite superior: NIHSS 3 sob sedação ⛔ contradiz o piso", baixo.piso === "inconclusivo", `⛔ ${baixo.piso}`);
  const sim = cenario(8, "sim");
  conf("⚠️ «sedação suspensa para o exame = sim» → avaliado: 8 ≥ 6 satisfaz", sim.piso === "satisfaz" && sim.calculado === 8, `⛔ ${sim.piso} · ${sim.calculado}`);
  conf("… ⛔ o exame fica marcado «sedação suspensa»", sim.exame?.marca === "sedacao_suspensa" && sim.exame?.valeParaRegras === true, `⛔ ${JSON.stringify(sim.exame)}`);
  const simBaixo = cenario(3, "sim");
  conf("… ⛔ avaliado nos dois sentidos: 3 com sedação suspensa contradiz", simBaixo.piso === "contradiz", `⛔ ${simBaixo.piso}`);
  const nao = cenario(8, "nao");
  conf("«sedação suspensa = não» mantém inconclusivo", nao.piso === "inconclusivo" && nao.exame?.valeParaRegras === false, `⛔ ${nao.piso} · ${JSON.stringify(nao.exame)}`);
  const semHora = cenario(8, undefined, false);
  conf("horário da via aérea desconhecido: exame ⛔ separável da sedação → inconclusivo", semHora.piso === "inconclusivo", `⛔ ${semHora.piso}`);
  const basal = tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = E.registrarFato(E.abrirAtendimento(rel), { campo: "nihss_calculado", valor: 4 }, rel);
    rel.avancar(10 * MIN);
    e = VA.registrarViaAereaExterna(e, { avancada: "sim", tipo: "Intubação orotraqueal", observado: rel.agora() }, rel);
    rel.avancar(10 * MIN);
    e = E.registrarFato(e, { campo: "nihss_calculado", valor: 12 }, rel);
    return { calc: B.nihssCalculado(e), inc: B.nihssInconclusivoPorSedacao?.(e), piso: F.valorDoInsumoNaRecomendacao(e, EVT, "nihss", rel.agora()) };
  }, {});
  conf("com basal anterior à sedação, as regras leem o basal (4 → contradiz), ⛔ o exame sob sedação",
    basal.calc === 4 && basal.inc === false && basal.piso === "contradiz", `⛔ ${JSON.stringify(basal)}`);
}

/* ══ 3 · AC-78 · MARCA DE SEDAÇÃO NO GLASGOW ══════════════════════════════ */
{
  const g = tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = E.registrarFato(E.abrirAtendimento(rel), { campo: "glasgow", valor: 14 }, rel);
    rel.avancar(5 * MIN);
    e = VA.registrarViaAereaExterna(e, { avancada: "sim", tipo: "Intubação orotraqueal", observado: rel.agora() }, rel);
    rel.avancar(5 * MIN);
    e = E.registrarFato(e, { campo: "glasgow", valor: 8 }, rel);
    return VA.examesGlasgow(e);
  }, []);
  conf("Glasgow anterior = «anterior à sedação»; posterior = «sob sedação»",
    Array.isArray(g) && g.length === 2 && g[0].total === 14 && g[0].marca === "anterior_a_sedacao" && g[1].total === 8 && g[1].marca === "sob_sedacao",
    `⛔ ${JSON.stringify(g)}`);
  const a = lerFonte(arq("components", "avc", "superficie-a.tsx"));
  conf("a Estabilização mostra a marca no Glasgow", /avc-a-exames-glasgow/.test(a) && /examesGlasgow\(/.test(a), "⛔ sem marca no Glasgow");
}

/* ══ 4 · A04 · OS DOIS CAMINHOS DE §4.6.3 ═════════════════════════════════ */
{
  const r1 = SF?.RECOMENDACOES?.find((r) => r.id === "ivt_inicio_desconhecido");
  const r2 = SF?.RECOMENDACOES?.find((r) => r.id === "ivt_wakeup_ou_45_9");
  conf("§4.6.3 rec. 1 ⛔ e rec. 2 estão transcritas", r1?.localizacao?.startsWith("§4.6.3 rec. 1") && r2?.localizacao?.startsWith("§4.6.3 rec. 2"),
    `⛔ ${r1?.localizacao} · ${r2?.localizacao}`);
  const b = lerFonte(arq("components", "avc", "superficie-b.tsx"));
  conf("o cartão A04 oferece os DOIS caminhos (DWI/FLAIR ⛔ e perfusão automatizada)",
    /CAMINHOS_DE_INICIO_DESCONHECIDO/.test(b) && /"ivt_inicio_desconhecido"/.test(b) && /"ivt_wakeup_ou_45_9"/.test(b) && /avc-b-caminho-\$\{/.test(b),
    "⛔ só um caminho");
  conf("⛔ «segundo caminho pendente de transcrição» (a rec. 2 ESTÁ transcrita)", !/pendente de transcrição/.test(b), "⛔ marcou pendente com a fonte transcrita");
}

/* ══ 5 · LEVE ≠ INCAPACITANTE ══════════════════════════════════════════════ */
{
  const leve = SB?.DECISAO_B?.find((c) => c.id === "deficit_leve");
  const inc = SB?.DECISAO_B?.find((c) => c.id === "incapacitante_assumido");
  conf("duas perguntas com rótulos distintos", leve !== undefined && inc !== undefined && leve.rotulo !== inc.rotulo && /leve/i.test(leve.rotulo) && !/leve/i.test(inc.rotulo),
    `⛔ ${leve?.rotulo} · ${inc?.rotulo}`);
  conf("… opções disjuntas exceto «Incerto»", leve && inc && leve.opcoes.filter((o) => o !== "Incerto").every((o) => !inc.opcoes.includes(o)), "⛔ opções compartilhadas");
  const rel = R.relogioControlado(T0);
  const op = (e, c, v) => E.registrarFato(e, { campo: c, valor: CAMPO.valorDaOpcao(v) }, rel);
  const soLeve = op(E.abrirAtendimento(rel), "deficit_leve", "Leve");
  conf("registrar «Leve» ⛔ grava nada em «incapacitante»", !soLeve.fatos.some((f) => f.campo === "incapacitante_assumido"), "⛔ fato cruzado");
  conf("… ⛔ e ⛔ decide «incapacitante» (continua indeterminado)", F.valorDoInsumo(soLeve, "deficit_incapacitante") === undefined, `⛔ ${F.valorDoInsumo(soLeve, "deficit_incapacitante")}`);
  conf("«leve ⛔ e não incapacitante» exige as DUAS respostas", F.valorDoInsumo(soLeve, "deficit_leve_nao_incapacitante") === undefined
    && F.valorDoInsumo(op(soLeve, "incapacitante_assumido", "Não incapacitante"), "deficit_leve_nao_incapacitante") === "satisfaz", "⛔ um eixo bastou");
  const cruzado = op(op(E.abrirAtendimento(rel), "deficit_leve", "Leve"), "incapacitante_assumido", "Incapacitante");
  conf("leve ⛔ e incapacitante coexistem como fatos distintos (incapacitante satisfaz; leve-não-incapacitante contradiz)",
    F.valorDoInsumo(cruzado, "deficit_incapacitante") === "satisfaz" && F.valorDoInsumo(cruzado, "deficit_leve_nao_incapacitante") === "contradiz", "⛔ fundiu");
}

/* ══ 6 · PLANO ATÉ 48 H ════════════════════════════════════════════════════ */
conf("o plano existe (conteúdo ⛔ núcleo)", P?.planoAte48h !== undefined && CP?.CAMPOS_DO_PLANO_48H !== undefined, "⛔ plano ausente");
if (P?.planoAte48h !== undefined && CP !== undefined) {
  const rel = R.relogioControlado(T0);
  const reg = (e, c, v, extra = {}) => E.registrarFato(e, { campo: c, valor: v, ...extra }, rel);
  const regI = (e, inst, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, inst);
  const opc = (e, inst, c, rotulo) => regI(e, inst, c, CAMPO.valorDaOpcao(rotulo));
  const comIvt = (e, inicio, estadoIvt = "Realizada") => {
    const ivt = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
    const x = opc(e, ivt, "ivt_estado", estadoIvt);
    return inicio === undefined ? x : regI(x, ivt, "ivt_inicio", inicio);
  };
  const comEstudo = (e, hora, resultado) => {
    const inst = I.nomeDaInstancia(SC.ESTUDO, 1);
    let x = opc(e, inst, "estudo_modalidade", "Tomografia de crânio sem contraste");
    x = regI(x, inst, "estudo_hora", hora);
    return resultado === undefined ? x : opc(x, inst, "estudo_resultado", resultado);
  };
  const vazio = E.abrirAtendimento(rel);
  const plano = (e, agora) => P.planoAte48h(e, agora);
  const ids = (p) => p.caminhos.map((c) => c.id);
  const tarefasDe = (p, caminho) => (p.caminhos.find((c) => c.id === caminho)?.tarefas ?? []);

  const ivt = comIvt(vazio, T0);
  const evt = reg(vazio, "evt_fim", T0, { horaClinica: T0 });
  const semRep = reg(vazio, "nao_reperfundir_hora", T0, { horaClinica: T0 });
  const hem = comEstudo(vazio, T0, "Hemorragia intracraniana identificada");

  conf("sem evento real ⛔ há caminho (⛔ plano inventado)", plano(vazio, T0).caminhos.length === 0, `⛔ ${ids(plano(vazio, T0))}`);
  conf("quatro eventos → quatro caminhos próprios",
    ids(plano(ivt, T0 + MIN)).join() === "ivt" && ids(plano(evt, T0 + MIN)).join() === "evt"
      && ids(plano(semRep, T0 + MIN)).join() === "sem_reperfusao" && ids(plano(hem, T0 + MIN)).join() === "hemorragia",
    `⛔ ${ids(plano(ivt, T0 + MIN))} · ${ids(plano(evt, T0 + MIN))} · ${ids(plano(semRep, T0 + MIN))} · ${ids(plano(hem, T0 + MIN))}`);
  const assinatura = (p, c) => tarefasDe(p, c).map((t) => `${t.id}:${t.quando.tipo}`).join("|");
  const quatro = [assinatura(plano(ivt, T0 + MIN), "ivt"), assinatura(plano(evt, T0 + MIN), "evt"),
    assinatura(plano(semRep, T0 + MIN), "sem_reperfusao"), assinatura(plano(hem, T0 + MIN), "hemorragia")];
  conf("⚠️ quatro caminhos com AGENDAS DIFERENTES", new Set(quatro).size === 4 && quatro.every((s) => s.length > 0), `⛔ ${quatro.join(" ⁄ ")}`);
  conf("só a trombólise tem intervalo de reavaliação transcrito (Table 7); os outros ⛔ inventam",
    plano(ivt, T0 + MIN).proximaReavaliacao?.tipo === "horario"
      && ["evt", "sem_reperfusao", "hemorragia"].every((c) => plano(c === "evt" ? evt : c === "sem_reperfusao" ? semRep : hem, T0 + MIN).proximaReavaliacao?.tipo === "sem_intervalo"),
    `⛔ ${JSON.stringify(plano(evt, T0 + MIN).proximaReavaliacao)}`);

  const todas = [ivt, evt, semRep, hem].flatMap((e) => { const p = plano(e, T0 + MIN); return [...p.caminhos.flatMap((c) => c.tarefas), ...p.transversais]; });
  conf("cada tarefa declara evento de origem, prazo ⛔ ou condição, ⛔ e critério de conclusão",
    todas.length > 0 && todas.every((t) => t.eventoDeOrigem && t.quando?.tipo && typeof t.criterioDeConclusao === "string" && t.criterioDeConclusao.length > 10),
    `⛔ ${JSON.stringify(todas.find((t) => !(t.eventoDeOrigem && t.quando?.tipo && t.criterioDeConclusao)))}`);

  /* A15 */
  const a15 = plano(ivt, T0 + 26 * H);
  const anti = tarefasDe(a15, "ivt").find((t) => t.id === "ivt_antitromboticos");
  const img = tarefasDe(a15, "ivt").find((t) => t.id === "ivt_imagem_controle");
  conf("⚠️ A15: 26 h sem imagem de controle → terapia dependente RETIDA", anti?.estado === "retida", `⛔ ${JSON.stringify(anti)}`);
  conf("… ⛔ a imagem de controle aparece atrasada (prazo de 24 h da fonte)", img?.estado === "atrasada" && img?.quando?.instante === T0 + 24 * H, `⛔ ${JSON.stringify(img)}`);
  const comLaudo = plano(comEstudo(ivt, T0 + 20 * H, "Sem hemorragia intracraniana identificada"), T0 + 26 * H);
  const antiLaudo = tarefasDe(comLaudo, "ivt").find((t) => t.id === "ivt_antitromboticos");
  conf("… com laudo, a condição fica atendida ⛔ e o app ⛔ libera (decisão da equipe)",
    antiLaudo?.estado === "condicao_atendida" && !/liberad|pode iniciar|autorizad/i.test(JSON.stringify(comLaudo)), `⛔ ${JSON.stringify(antiLaudo)}`);
  conf("⛔ nenhuma tarefa de caminho algum conclui só pela passagem do tempo",
    [26, 47, 72].every((h) => [ivt, evt, semRep, hem].every((e) => plano(e, T0 + h * H).caminhos.flatMap((c) => c.tarefas).every((t) => t.estado !== "concluida"))),
    "⛔ tempo concluiu tarefa");

  /* atraso ⛔ reavaliação real */
  const atraso = plano(ivt, T0 + 40 * MIN).proximaReavaliacao;
  conf("atraso: sem reavaliação, a próxima era às +15 min ⛔ está 25 min atrasada", atraso?.instante === T0 + 15 * MIN && atraso?.atrasoMin === 25, `⛔ ${JSON.stringify(atraso)}`);
  rel.definir(T0 + 40 * MIN);
  const pa = I.nomeDaInstancia("pa", 1);
  let reav = regI(regI(ivt, pa, "pas", 150), pa, "pad", 85);
  reav = reg(reav, "nihss_calculado", 4);
  const depois = plano(reav, T0 + 41 * MIN).proximaReavaliacao;
  conf("PA completa ⛔ exame neurológico registrados → próxima = próximo horário da tabela (+45 min)", depois?.instante === T0 + 45 * MIN && (depois?.atrasoMin ?? 0) === 0, `⛔ ${JSON.stringify(depois)}`);
  const soPa = plano(regI(regI(ivt, pa, "pas", 150), pa, "pad", 85), T0 + 41 * MIN).proximaReavaliacao;
  conf("⛔ meia reavaliação ⛔ conclui: só PA mantém a de +15 min", soPa?.instante === T0 + 15 * MIN, `⛔ ${JSON.stringify(soPa)}`);
  const piora = plano(D.registrarPiora(reav, "rebaixou", rel), T0 + 41 * MIN).proximaReavaliacao;
  conf("⚠️ deterioração ANTECIPA: próxima reavaliação = agora, por piora", piora?.tipo === "agora" && piora?.motivo === "piora", `⛔ ${JSON.stringify(piora)}`);
  const pioraEvt = plano(D.registrarPiora(evt, "rebaixou", rel), T0 + 41 * MIN).proximaReavaliacao;
  conf("… também no caminho sem intervalo transcrito", pioraEvt?.tipo === "agora", `⛔ ${JSON.stringify(pioraEvt)}`);
  rel.definir(T0);

  /* cancelamento */
  const cancelada = plano(comIvt(vazio, undefined, "Cancelada"), T0 + MIN);
  conf("cancelamento: trombólise cancelada antes do início ⛔ abre caminho ⛔ e o encerramento é dito",
    !ids(cancelada).includes("ivt") && cancelada.encerrados.some((x) => x.caminho === "ivt"), `⛔ ${JSON.stringify(cancelada)}`);
  const desfeito = E.corrigirFato(evt, { campo: "evt_fim", valor: "nao_perguntado", corrigeFatoId: E.valorAtual(evt, "evt_fim").id }, rel);
  const pDesfeito = plano(desfeito, T0 + MIN);
  conf("cancelamento: fim da trombectomia corrigido → caminho encerrado, agenda sem as tarefas dele",
    !ids(pDesfeito).includes("evt") && pDesfeito.encerrados.some((x) => x.caminho === "evt") && !pDesfeito.agenda.some((a) => a.caminho === "evt"),
    `⛔ ${JSON.stringify(pDesfeito)}`);
  const semHora = plano(reg(vazio, "evt_fim", "nao_sei"), T0 + MIN);
  conf("evento sem horário: caminho existe, ⛔ e ⛔ nenhum prazo é calculado", ids(semHora).includes("evt") && semHora.agenda.length === 0
    && tarefasDe(semHora, "evt").every((t) => t.quando.instante === undefined), `⛔ ${JSON.stringify(semHora.agenda)}`);

  /* transversais */
  const tv = plano(ivt, T0 + MIN).transversais;
  const TV = ["degluticao", "glicemia", "temperatura", "mobilizacao", "tev", "dispositivos"];
  conf("seis transversais, todas «conteúdo pendente de validação»", JSON.stringify(tv.map((t) => t.id)) === JSON.stringify(TV) && tv.every((t) => t.conteudo === "pendente_de_validacao"),
    `⛔ ${JSON.stringify(tv.map((t) => [t.id, t.conteudo]))}`);
  const deg = tv.find((t) => t.id === "degluticao");
  conf("deglutição é TRAVA antes de via oral (retida até a triagem registrada)", deg?.estado === "retida" && /via oral/i.test(deg?.rotulo + deg?.criterioDeConclusao), `⛔ ${JSON.stringify(deg)}`);
  const degOk = plano(reg(ivt, "plano_degluticao", CAMPO.valorDaOpcao("Realizada")), T0 + MIN).transversais.find((t) => t.id === "degluticao");
  conf("… triagem registrada conclui a trava", degOk?.estado === "concluida", `⛔ ${JSON.stringify(degOk)}`);
  rel.definir(T0 + 30 * MIN);
  const gl = I.nomeDaInstancia("glicemia", 1);
  const glic = plano(regI(ivt, gl, "glicemia", 130), T0 + 31 * MIN).transversais.find((t) => t.id === "glicemia");
  conf("glicemia registrada DEPOIS do evento de origem conclui a tarefa (critério real)", glic?.estado === "concluida", `⛔ ${JSON.stringify(glic)}`);
  const glicAntes = plano(comIvt(regI(vazio, gl, "glicemia", 130), T0 + 60 * MIN), T0 + 61 * MIN).transversais.find((t) => t.id === "glicemia");
  conf("… glicemia ANTERIOR ao evento ⛔ conclui", glicAntes?.estado !== "concluida", `⛔ ${JSON.stringify(glicAntes)}`);
  rel.definir(T0);

  /* fuso */
  const script = `
    const P = require(${JSON.stringify(path.join(tmp, "avc", "nucleo", "plano-48h.js"))});
    const estado = ${JSON.stringify(ivt)};
    const p = P.planoAte48h(estado, ${T0 + 40 * MIN});
    process.stdout.write(JSON.stringify({ agenda: p.agenda, proxima: p.proximaReavaliacao }));
  `;
  const emFuso = (tz) => tenta(() => execFileSync(process.execPath, ["-e", script], { env: { ...process.env, TZ: tz }, encoding: "utf8" }), "erro");
  const sp = emFuso("America/Sao_Paulo");
  const tk = emFuso("Asia/Tokyo");
  conf("⚠️ fuso: São Paulo ⛔ e Tóquio dão os MESMOS instantes na agenda", sp !== "erro" && sp === tk && sp.includes(String(T0 + 15 * MIN)), `⛔ SP ${sp.slice(0, 160)} · TK ${tk.slice(0, 160)}`);

  /* conteúdo ⛔ docs */
  const texto = JSON.stringify(CP);
  conf("⛔ dose, fármaco ⛔ ou intervalo novo no conteúdo do plano", !/\b(mg|mcg|UI|heparina|enoxaparina|insulina|paracetamol|dipirona|a cada \d+)\b/i.test(texto), "⛔ conteúdo clínico novo");
  const doc = fs.existsSync(arq("docs", "avc", "revisao", "plano-48h.md")) ? fs.readFileSync(arq("docs", "avc", "revisao", "plano-48h.md"), "utf8") : "";
  conf("pacote docs/avc/revisao/plano-48h.md lista R5/R6 ⛔ e AHA 2026 por tarefa transversal",
    TV.every((id) => { const sec = doc.split(/\n### /).find((s) => s.startsWith(`\`${id}\``)) ?? ""; return /R5|R6/.test(sec) && /AHA 2026/.test(sec); }),
    "⛔ fontes por tarefa ausentes");
  conf("… ⛔ notificação em segundo plano documentada como ⛔ confiável", /segundo plano/i.test(doc) && /não confiáve/i.test(doc), "⛔ sem a limitação");
  const tela = fs.existsSync(arq("components", "avc", "plano-48h.tsx")) ? lerFonte(arq("components", "avc", "plano-48h.tsx")) : "";
  conf("a tela mostra a agenda com «Próxima reavaliação» ⛔ e o aviso de notificação", /avc-plano-proxima-reavaliacao/.test(tela) && /avc-plano-agenda/.test(tela) && /avc-plano-sem-notificacao/.test(tela), "⛔ tela sem agenda");
  conf("… ⛔ desenhada na Destino", /<PlanoAte48h/.test(lerFonte(arq("components", "avc", "superficie-g.tsx"))), "⛔ fora da Destino");
}

console.log(`\nprova-avc-rodada14: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
