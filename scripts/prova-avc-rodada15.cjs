#!/usr/bin/env node
/**
 * PROVA · 15ª RODADA DO AVC — AC-81, AC-82, AC-83 (instrução NIH), AC-85 (dois desfechos),
 * AC-88 (resultado das transversais ⛔ trava de via oral), defeitos das capturas da 14ª rodada
 * ⛔ caminho hemorrágico (A07). Decisões do autor, 2026-09-13 (`docs/decisoes.md`, 15ª rodada).
 *
 * PROMETE:
 *  · AC-81: tipo «Outra»/«Não sei» → cabeçalho "(tipo não determinado)".
 *  · AC-82: sem horário da via aérea ⛔ há exame basal, ⛔ e há pendência "informe o horário
 *    da via aérea para recuperar o exame basal".
 *  · AC-83: sedação = não → "com via aérea avançada, sem sedação": exame vale; só o item 10 é
 *    UN (D-PEND-13 por ele); 1b = 1 aceito, 1b = UN rejeitado; lembrete literal da instrução
 *    NIH no 1b. Sedação sim ⛔ não sei → "sob sedação" (contexto, ⛔ critério).
 *  · AC-85: caminho sem reperfusão só com desfecho negativo de IVT (motivo + horário) E de EVT
 *    (motivo + horário); com um pendente, ⛔ abre ⛔ e a pendência nomeia o que falta; a
 *    decisão global registra os dois ⛔ e abre; o evento avulso saiu.
 *  · AC-88: transversais registram resultado (aprovada · reprovada · não realizada · não sei);
 *    deglutição ≠ aprovada mantém a trava "nada por via oral".
 *  · Capturas: intervalo longo dito em horas ("23 h 59 min"), ⛔ em minutos.
 *  · A07: hemorragia na imagem abre o caminho hemorrágico (estabilização, neurológico, imagem,
 *    destino), bloqueia IVT ⛔ e EVT com motivo; tipo, anticoagulante (do Paciente) ⛔ marcos
 *    de neurocirurgia; toda conduta "conteúdo pendente de validação" com fonte candidata;
 *    hemorragia depois de trombólise iniciada leva ao mesmo caminho ⛔ pede o registro da
 *    interrupção, que fica na trilha.
 * NÃO PROMETE: o gesto a 375 px, a troca de idioma ⛔ e ES (`e2e/avc-rodada15.spec.ts`); ⛔ valida
 *   conteúdo clínico — ⛔ há dose, alvo ⛔ ou indicação nova.
 * UNIVERSO: `avc/conteudo/{via-aerea-externa,plano-48h,caminho-hemorragico}.ts`,
 *   `avc/nucleo/{via-aerea-externa,derivacoes-b,derivacoes-f,plano-48h,caminho-hemorragico,
 *   transferencia}.ts`, `components/avc/{avc-modulo-screen,plano-48h,superficie-f,superficie-g,
 *   campo-de-escala,caminho-hemorragico}.tsx`, `docs/avc/revisao/hemorragia.md`.
 * FONTE: `docs/decisoes.md` — 15ª rodada; `protocols/fontes-verbatim/nih-nihss-2024.md` p. 2.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada15-"));
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
  arq("avc", "nucleo", "plano-48h.ts"), arq("avc", "nucleo", "transferencia.ts"), arq("avc", "nucleo", "portao-ivt.ts"),
  arq("avc", "nucleo", "veredito-da-trombectomia.ts"), arq("avc", "nucleo", "problemas-ativos.ts"),
  arq("avc", "conteudo", "campos.ts"), arq("avc", "conteudo", "campo.ts"), arq("avc", "conteudo", "nihss.ts"),
  arq("avc", "conteudo", "superficie-c.ts"), arq("avc", "conteudo", "superficie-f.ts"), arq("avc", "conteudo", "plano-48h.ts"),
  arq("lib", "nihss.ts")];
for (const novo of [arq("avc", "nucleo", "caminho-hemorragico.ts"), arq("avc", "conteudo", "caminho-hemorragico.ts")]) {
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
const P = emT("avc", "nucleo", "plano-48h.js");
const T = emT("avc", "nucleo", "transferencia.js");
const PI = emT("avc", "nucleo", "portao-ivt.js");
const VE = emT("avc", "nucleo", "veredito-da-trombectomia.js");
const PA = emT("avc", "nucleo", "problemas-ativos.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const NI = emT("avc", "conteudo", "nihss.js");
const LN = emT("lib", "nihss.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const CP = emT("avc", "conteudo", "plano-48h.js");
const H = emT("avc", "nucleo", "caminho-hemorragico.js");
const CH = emT("avc", "conteudo", "caminho-hemorragico.js");

const MIN = 60_000;
const HORA = 60 * MIN;
const T0 = 1_800_000_000_000;
const tenta = (fn, padrao) => { try { return fn(); } catch (err) { return padrao === undefined ? `⛔ ${err.message}` : padrao; } };
const EVT = SF?.RECOMENDACOES?.find((r) => r.criterios?.nihss?.min === 6 && r.terapia === "evt");

/** ⚠️ Um exame NIHSS inteiro como a tela grava: itens, justificativa do UN ⛔ total. */
function exame(e, rel, pontos, un = []) {
  let x = e;
  let total = 0;
  for (const item of NI.ITENS_NIHSS) {
    if (un.includes(item.id)) {
      x = E.registrarFato(x, { campo: NI.CAMPO_DE_ITEM(item.id), valor: NI.NAO_TESTAVEL }, rel);
      x = E.registrarFato(x, { campo: NI.CAMPO_DA_JUSTIFICATIVA(item.id), valor: "intubado" }, rel);
    } else {
      const p = pontos[item.id] ?? 0;
      total += p;
      x = E.registrarFato(x, { campo: NI.CAMPO_DE_ITEM(item.id), valor: p }, rel);
    }
  }
  return E.registrarFato(x, { campo: "nihss_calculado", valor: total }, rel);
}
const comVia = (rel, sedacao, observado = T0) =>
  VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo: "Intubação orotraqueal", observado, ...(sedacao === undefined ? {} : { sedacao }) }, rel);

/* ══ 1 · AC-81 ══════════════════════════════════════════════════════════════ */
{
  const partes = tenta(() => {
    const rel = R.relogioControlado(T0);
    return VA.suporteAtivo(VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { avancada: "sim", tipo: "Outra", observado: T0 }, rel));
  }, []);
  conf("AC-81: «Outra» → «via aérea avançada às» ⛔ «(tipo não determinado)»",
    partes[0]?.rotulo === "via aérea avançada às" && partes[0]?.sufixo === "(tipo não determinado)", `⛔ ${JSON.stringify(partes[0])}`);
}

/* ══ 2 · AC-82 ══════════════════════════════════════════════════════════════ */
{
  const pend = (hora, comExame) => tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = comVia(rel, "sim", hora);
    rel.avancar(10 * MIN);
    if (comExame) e = exame(e, rel, { "1a": 1 });
    return PA.pendenciasDoCaso(e).map((p) => [p.id, p.rotulo]);
  }, []);
  const semHora = pend("nao_sei", true);
  conf("AC-82: horário desconhecido + exame → pendência «informe o horário da via aérea para recuperar o exame basal»",
    semHora.some(([id, r]) => id === "recuperar_basal_va_hora" && /informe o horário da via aérea para recuperar o exame basal/i.test(r)), `⛔ ${JSON.stringify(semHora)}`);
  conf("… ⛔ aparece com horário conhecido", !pend(T0, true).some(([id]) => id === "recuperar_basal_va_hora"), "⛔ pendência com horário");
  conf("… ⛔ aparece sem exame registrado", !pend("nao_sei", false).some(([id]) => id === "recuperar_basal_va_hora"), "⛔ pendência sem exame");
}

/* ══ 3 · AC-83 · instrução NIH ═════════════════════════════════════════════ */
{
  const cenario = (sedacao, pontos, un) => tenta(() => {
    const rel = R.relogioControlado(T0);
    let e = comVia(rel, sedacao);
    rel.avancar(15 * MIN);
    e = exame(e, rel, pontos, un);
    return { e, exame: VA.examesNihss(e)[0], leitura: B.leituraDoNihssCalculado(e), piso: F.valorDoInsumoNaRecomendacao(e, EVT, "nihss", rel.agora()), inc: B.nihssInconclusivoPorSedacao(e) };
  }, {});
  const alto = cenario("nao", { "1a": 1, "1b": 1, "5a": 4 }, ["10"]);
  conf("AC-83: sedação = não → marca «com via aérea avançada, sem sedação» ⛔ o exame vale",
    alto.exame?.marca === "com_via_aerea_sem_sedacao" && alto.exame?.valeParaRegras === true && alto.inc === false, `⛔ ${JSON.stringify(alto.exame)} · inc ${alto.inc}`);
  conf("… 1b = 1 aceito ⛔ 10 = UN aceito: soma 6 com o 10 fora (D-PEND-13 só pelo 10)",
    alto.leitura?.soma === 6 && JSON.stringify(alto.leitura?.naoTestaveis) === JSON.stringify(["10"]), `⛔ ${JSON.stringify(alto.leitura)}`);
  conf("… piso de EVT ≥ 6 com soma 6 (limite inferior) → satisfaz", alto.piso === "satisfaz", `⛔ ${alto.piso}`);
  const baixo = cenario("nao", { "1b": 1, "5a": 2 }, ["10"]);
  conf("… soma 3 com UN no 10 → inconclusivo pela D-PEND-13, ⛔ «sob sedação»", baixo.piso === "inconclusivo" && baixo.inc === false, `⛔ ${baixo.piso} · inc ${baixo.inc}`);
  const soma1b = tenta(() => LN.somaDoNihssDe(["1b", "10"], { "1b": LN.NAO_TESTAVEL ?? NI.NAO_TESTAVEL, "10": LN.NAO_TESTAVEL ?? NI.NAO_TESTAVEL }, { "1b": "intubado", "10": "intubado" }), {});
  conf("… 1b = UN REJEITADO pela instrução NIH (inválido), 10 = UN aceito",
    Array.isArray(soma1b.invalidos) && soma1b.invalidos.includes("1b") && !soma1b.invalidos.includes("10") && soma1b.naoTestaveis.includes("10"), `⛔ ${JSON.stringify(soma1b)}`);
  const un1b = cenario("nao", { "5a": 4 }, ["1b", "10"]);
  conf("… exame com 1b = UN ⛔ vira leitura (escala incompleta)", un1b.leitura === undefined, `⛔ ${JSON.stringify(un1b.leitura)}`);
  const sim = cenario("sim", { "1a": 1, "5a": 4 }, ["10"]);
  const naoSei = cenario("nao_sei", { "1a": 1, "5a": 4 }, ["10"]);
  conf("… sedação = sim ⛔ não sei → «sob sedação» (contexto, ⛔ critério)",
    sim.exame?.marca === "sob_sedacao" && naoSei.exame?.marca === "sob_sedacao" && sim.piso === "inconclusivo" && naoSei.piso === "inconclusivo",
    `⛔ ${sim.exame?.marca}/${sim.piso} · ${naoSei.exame?.marca}/${naoSei.piso}`);
  const lembrete = tenta(() => VA.lembreteNihss1b(comVia(R.relogioControlado(T0), "nao")), undefined);
  conf("… lembrete literal da instrução NIH no 1b («intubado que não fala recebe 1»)",
    typeof lembrete === "string" && /intubado que não fala recebe 1/.test(lembrete), `⛔ ${lembrete}`);
  conf("… sem via aérea avançada ⛔ há lembrete", tenta(() => VA.lembreteNihss1b(E.abrirAtendimento(R.relogioControlado(T0))), "x") === undefined, "⛔ lembrete sem via aérea");
  conf("… só o item 10 é sugerido como não testável", JSON.stringify(tenta(() => VA.itensNihssSugeridosComoNaoTestaveis(comVia(R.relogioControlado(T0), "nao")), [])) === JSON.stringify(["10"]), "⛔ sugestão diferente de [10]");
}

/* ══ 4 · AC-85 · dois desfechos ═════════════════════════════════════════════ */
if (P?.planoAte48h !== undefined && CP !== undefined) {
  const rel = R.relogioControlado(T0);
  const reg = (e, c, v, extra = {}) => E.registrarFato(e, { campo: c, valor: v, ...extra }, rel);
  const vazio = E.abrirAtendimento(rel);
  const ids = (e) => P.planoAte48h(e, T0 + HORA).caminhos.map((c) => c.id);
  const motivos = CP.MOTIVOS_DE_DESFECHO_NEGATIVO ?? [];
  conf("AC-85: motivos incluem impedida, sem indicação, indisponível, recusada, decisão da equipe ⛔ recusa do paciente/família",
    ["Impedida", "Sem indicação", "Indisponível", "Recusada", "Decisão da equipe / limitação terapêutica", "Recusa do paciente ou família"].every((m) => motivos.includes(m)), `⛔ ${motivos}`);
  conf("… o evento avulso «Decisão de não reperfundir» saiu", !(CP.CAMPOS_DO_PLANO_48H ?? []).some((c) => c.id === "nao_reperfundir_hora") && !K.todosOsCampos().some((c) => c.id === "nao_reperfundir_hora"), "⛔ ainda existe");
  const ivtNeg = reg(reg(vazio, "ivt_nao_prosseguir_motivo", "Sem indicação"), "ivt_nao_prosseguir_hora", T0, { horaClinica: T0 });
  const pendIvt = tenta(() => P.pendenciasDoPlano(ivtNeg), []);
  conf("⚠️ IVT negativa com EVT pendente ⛔ abre o caminho", !ids(ivtNeg).includes("sem_reperfusao"), `⛔ ${ids(ivtNeg)}`);
  conf("… ⛔ a pendência nomeia a trombectomia", pendIvt.some((p) => /trombectomia/i.test(p.rotulo)) && PA.pendenciasDoCaso(ivtNeg).some((p) => /trombectomia/i.test(p.rotulo)), `⛔ ${JSON.stringify(pendIvt)}`);
  const evtNeg = reg(reg(vazio, "evt_desfecho_motivo", "Indisponível"), "evt_desfecho_hora", T0, { horaClinica: T0 });
  conf("… EVT negativa com IVT pendente ⛔ abre ⛔ e nomeia a trombólise",
    !ids(evtNeg).includes("sem_reperfusao") && tenta(() => P.pendenciasDoPlano(evtNeg), []).some((p) => /trombólise/i.test(p.rotulo)), `⛔ ${ids(evtNeg)}`);
  const semHora = reg(reg(vazio, "ivt_nao_prosseguir_motivo", "Impedida"), "evt_desfecho_motivo", "Impedida");
  conf("… motivo sem horário ⛔ fecha desfecho: pendência pede o horário", !ids(semHora).includes("sem_reperfusao")
    && tenta(() => P.pendenciasDoPlano(semHora), []).some((p) => /horário/i.test(p.rotulo)), `⛔ ${JSON.stringify(tenta(() => P.pendenciasDoPlano(semHora), []))}`);
  rel.definir(T0 + 10 * MIN);
  const ambos = reg(reg(ivtNeg, "evt_desfecho_motivo", "Indisponível"), "evt_desfecho_hora", T0 + 10 * MIN, { horaClinica: T0 + 10 * MIN });
  const pAmbos = P.planoAte48h(ambos, T0 + HORA);
  conf("IVT ⛔ EVT negativas, cada uma com horário → caminho sem reperfusão abre, origem = o último desfecho",
    pAmbos.caminhos.some((c) => c.id === "sem_reperfusao" && c.origem.instante === T0 + 10 * MIN) && tenta(() => P.pendenciasDoPlano(ambos), [1]).length === 0,
    `⛔ ${JSON.stringify(pAmbos.caminhos.map((c) => [c.id, c.origem]))}`);
  const global = tenta(() => P.registrarDecisaoGlobalDeNaoReperfundir(vazio, "Decisão da equipe / limitação terapêutica", T0, rel), vazio);
  conf("⚠️ decisão global registra os dois desfechos com um gesto ⛔ abre o caminho",
    E.valorAtual(global, "ivt_nao_prosseguir_motivo")?.valor === "Decisão da equipe / limitação terapêutica"
      && E.valorAtual(global, "evt_desfecho_motivo")?.valor === "Decisão da equipe / limitação terapêutica"
      && ids(global).includes("sem_reperfusao"), `⛔ ${ids(global)}`);
  const exposta = (() => {
    const ivt = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
    let x = K.registrarComInstancia(ambos, { campo: "ivt_estado", valor: CAMPO.valorDaOpcao("Realizada") }, rel, ivt);
    return K.registrarComInstancia(x, { campo: "ivt_inicio", valor: T0 }, rel, ivt);
  })();
  conf("… com trombólise administrada, «não prosseguir» ⛔ vale: ⛔ abre sem reperfusão", !ids(exposta).includes("sem_reperfusao") && ids(exposta).includes("ivt"), `⛔ ${ids(exposta)}`);
  rel.definir(T0);
}

/* ══ 5 · AC-88 · resultado ⛔ trava de via oral ══════════════════════════════ */
if (P?.planoAte48h !== undefined && CP !== undefined) {
  const rel = R.relogioControlado(T0);
  const reg = (e, c, v) => E.registrarFato(e, { campo: c, valor: CAMPO.valorDaOpcao(v) }, rel);
  const ivt = (() => {
    const inst = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
    const x = K.registrarComInstancia(E.abrirAtendimento(rel), { campo: "ivt_estado", valor: "Realizada" }, rel, inst);
    return K.registrarComInstancia(x, { campo: "ivt_inicio", valor: T0 }, rel, inst);
  })();
  const deg = (CP.CAMPOS_DO_PLANO_48H ?? []).find((c) => c.id === "plano_degluticao");
  conf("AC-88: resultado = aprovada · reprovada · não realizada · não sei", JSON.stringify(deg?.opcoes) === JSON.stringify(["Aprovada", "Reprovada", "Não realizada", "Não sei"]), `⛔ ${JSON.stringify(deg?.opcoes)}`);
  conf("… as quatro transversais por registro usam o mesmo resultado", ["plano_mobilizacao", "plano_tev", "plano_dispositivos"].every((id) => JSON.stringify((CP.CAMPOS_DO_PLANO_48H ?? []).find((c) => c.id === id)?.opcoes) === JSON.stringify(["Aprovada", "Reprovada", "Não realizada", "Não sei"])), "⛔ opções diferentes");
  const trava = (e) => tenta(() => P.travaDeViaOral(e), "erro");
  conf("sem caminho aberto ⛔ há trava no cabeçalho", trava(E.abrirAtendimento(rel)) === undefined, `⛔ ${JSON.stringify(trava(E.abrirAtendimento(rel)))}`);
  conf("caminho aberto ⛔ triagem sem registro → trava «nada por via oral»", trava(ivt)?.motivo === "sem_registro", `⛔ ${JSON.stringify(trava(ivt))}`);
  conf("⚠️ deglutição REPROVADA → trava mantida", trava(reg(ivt, "plano_degluticao", "Reprovada"))?.motivo === "reprovada", `⛔ ${JSON.stringify(trava(reg(ivt, "plano_degluticao", "Reprovada")))}`);
  conf("⚠️ deglutição NÃO REALIZADA → trava mantida", trava(reg(ivt, "plano_degluticao", "Não realizada"))?.motivo === "nao_realizada", "⛔");
  conf("deglutição «não sei» → trava mantida", trava(reg(ivt, "plano_degluticao", "Não sei"))?.motivo === "nao_sei", "⛔");
  conf("deglutição APROVADA → sem trava", trava(reg(ivt, "plano_degluticao", "Aprovada")) === undefined, "⛔ trava com aprovada");
  const tv = (e, id) => P.planoAte48h(e, T0 + MIN).transversais.find((t) => t.id === id);
  conf("a tarefa leva o resultado registrado ⛔ reprovada ⛔ conclui a trava", tv(reg(ivt, "plano_degluticao", "Reprovada"), "degluticao")?.resultado === "Reprovada" && tv(reg(ivt, "plano_degluticao", "Reprovada"), "degluticao")?.estado === "retida", `⛔ ${JSON.stringify(tv(reg(ivt, "plano_degluticao", "Reprovada"), "degluticao"))}`);
  conf("mobilização reprovada = resultado registrado (concluída, com o resultado)", tv(reg(ivt, "plano_mobilizacao", "Reprovada"), "mobilizacao")?.estado === "concluida" && tv(reg(ivt, "plano_mobilizacao", "Reprovada"), "mobilizacao")?.resultado === "Reprovada", "⛔");
  conf("«não realizada» ⛔ conclui", tv(reg(ivt, "plano_tev", "Não realizada"), "tev")?.estado !== "concluida", "⛔");
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  conf("a trava aparece no cabeçalho de suporte", /avc-trava-via-oral/.test(tela) && /travaDeViaOral\(/.test(tela), "⛔ cabeçalho sem trava");
}

/* ══ 6 · defeitos das capturas da 14ª rodada ═══════════════════════════════ */
{
  conf("intervalo longo dito em horas: 1439 min → «23 h 59 min»", tenta(() => P.textoDoIntervalo(1439), "") === "23 h 59 min" && tenta(() => P.textoDoIntervalo(14), "") === "14 min", `⛔ ${tenta(() => P.textoDoIntervalo(1439), "")}`);
  const tela = fs.existsSync(arq("components", "avc", "plano-48h.tsx")) ? lerFonte(arq("components", "avc", "plano-48h.tsx")) : "";
  conf("AC-89 (defeito): a agenda recalcula com a tela parada (relógio próprio)", /setInterval\(/.test(tela) && /clearInterval\(/.test(tela), "⛔ agenda parada");
  conf("a tarefa ⛔ repete o evento de origem (dito no título do caminho)", !/t\.eventoDeOrigem/.test(tela), "⛔ repetição");
}

/* ══ 7 · A07 · caminho hemorrágico ══════════════════════════════════════════ */
conf("o caminho hemorrágico existe (conteúdo ⛔ núcleo)", H?.caminhoHemorragico !== undefined && CH?.SUPERFICIES_DO_CAMINHO_HEMORRAGICO !== undefined, "⛔ ausente");
if (H?.caminhoHemorragico !== undefined && CH !== undefined) {
  const rel = R.relogioControlado(T0);
  const regI = (e, inst, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, inst);
  const opc = (e, inst, c, rotulo) => regI(e, inst, c, CAMPO.valorDaOpcao(rotulo));
  const comTc = (e, hora, resultado) => {
    const inst = I.proximaInstancia(e, SC.ESTUDO);
    let x = opc(e, inst, "estudo_modalidade", "Tomografia de crânio sem contraste");
    x = regI(x, inst, "estudo_hora", hora);
    return opc(x, inst, "estudo_resultado", resultado);
  };
  const vazio = E.abrirAtendimento(rel);
  conf("sem hemorragia ⛔ há caminho hemorrágico", H.caminhoHemorragico(comTc(vazio, T0, "Sem hemorragia intracraniana identificada")).ativo === false, "⛔ ativo sem hemorragia");
  const hem = comTc(vazio, T0, "Hemorragia intracraniana identificada");
  const c = H.caminhoHemorragico(hem);
  conf("A07: hemorragia na imagem (saída da T04) abre o caminho próprio", c.ativo === true && c.desde === T0, `⛔ ${JSON.stringify(c)}`);
  conf("… superfícies reduzidas: estabilização, neurológico, imagem, destino",
    JSON.stringify(CH.SUPERFICIES_DO_CAMINHO_HEMORRAGICO) === JSON.stringify(["estabilizacao", "neurologico", "imagem", "destino"]), `⛔ ${CH.SUPERFICIES_DO_CAMINHO_HEMORRAGICO}`);
  conf("… IVT ⛔ EVT isquêmicas bloqueadas com motivo", c.bloqueio?.ivt === true && c.bloqueio?.evt === true && /hemorragia/i.test(c.bloqueio?.motivo ?? ""), `⛔ ${JSON.stringify(c.bloqueio)}`);
  conf("… o portão da IVT ⛔ a classe da EVT confirmam o bloqueio",
    tenta(() => PI.estadoDoPortaoIVT(hem, T0 + MIN).estado, "") === "bloqueado_seguranca" && /* ⚠️ ajuste de instrumento: a classe usa `estado`, ⛔ `tipo` */ tenta(() => VE.vereditoDaTrombectomia(hem, T0 + MIN).classe?.estado, "") === "retida",
    `⛔ ${tenta(() => PI.estadoDoPortaoIVT(hem, T0 + MIN).estado, "")} · ${JSON.stringify(tenta(() => VE.vereditoDaTrombectomia(hem, T0 + MIN).classe, {}))}`);
  conf("… tipo: intraparenquimatosa · subaracnóidea · subdural · outra · não sei",
    JSON.stringify(CH.TIPOS_DE_HEMORRAGIA) === JSON.stringify(["Intraparenquimatosa", "Subaracnóidea", "Subdural", "Outra", "Não sei"]), `⛔ ${JSON.stringify(CH.TIPOS_DE_HEMORRAGIA)}`);
  const comTipo = E.registrarFato(hem, { campo: "hem_tipo", valor: "Subdural" }, rel);
  conf("… tipo registrado é lido", H.caminhoHemorragico(comTipo).tipo === "Subdural", `⛔ ${H.caminhoHemorragico(comTipo).tipo}`);
  const comAnticoag = E.registrarFato(hem, { campo: "anticoagulante_em_uso", valor: "Varfarina ou outro antagonista da vitamina K" }, rel);
  conf("… anticoagulante vem do campo do Paciente (⛔ campo novo)", !K.todosOsCampos().some((x) => x.id !== "anticoagulante_em_uso" && /anticoag/.test(x.id) && x.casa === "destino")
    && H.caminhoHemorragico(comAnticoag).anticoagulante?.campo === "anticoagulante_em_uso", `⛔ ${JSON.stringify(H.caminhoHemorragico(comAnticoag).anticoagulante)}`);
  conf("… sem anticoagulante registrado → pendência", H.caminhoHemorragico(hem).pendencias.some((p) => p.campo === "anticoagulante_em_uso"), `⛔ ${JSON.stringify(H.caminhoHemorragico(hem).pendencias)}`);
  const neuro = tenta(() => T.registrarMarcoDeNeurocirurgia(hem, "Contatada", T0 + 5 * MIN, rel), hem);
  conf("… neurocirurgia contatada por marcos (como a teleconsulta)", tenta(() => T.marcosDaNeurocirurgia(neuro), []).some((m) => m.tipo === "Contatada" && m.observado === T0 + 5 * MIN), "⛔ sem marco");
  conf("… parecer da neurocirurgia exige texto ⛔ autor", tenta(() => T.registrarMarcoDeNeurocirurgia(hem, "Parecer registrado", T0, rel, { texto: "", autor: "" }), null) === hem, "⛔ parecer vazio entrou");
  const condutas = CH.CONDUTAS_DO_CAMINHO_HEMORRAGICO ?? [];
  conf("… condutas: reversão, alvo pressórico, indicação cirúrgica — todas «conteúdo pendente de validação» com fonte candidata",
    ["reversao_anticoagulante", "alvo_pressorico", "indicacao_cirurgica"].every((id) => condutas.some((x) => x.id === id && x.conteudo === "pendente_de_validacao" && x.fontesCandidatas.length > 0)),
    `⛔ ${JSON.stringify(condutas.map((x) => [x.id, x.conteudo]))}`);
  conf("… ⛔ dose, alvo numérico ⛔ ou limiar no conteúdo do caminho", !/\d+\s*(mg|UI|U\/kg|mmHg|mL|%)/i.test(JSON.stringify(CH)), "⛔ número clínico");
  conf("HSA suspeita sem hemorragia na imagem ⛔ abre o caminho hemorrágico", H.caminhoHemorragico(E.registrarFato(vazio, { campo: "suspeita_hsa", valor: "sim" }, rel)).ativo === false, "⛔ abriu por suspeita");

  /* complicação depois de trombólise iniciada */
  const ivt = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
  let iniciada = opc(vazio, ivt, "ivt_estado", "Iniciada");
  iniciada = regI(iniciada, ivt, "ivt_inicio", T0);
  rel.definir(T0 + 30 * MIN);
  const comp = comTc(iniciada, T0 + 30 * MIN, "Hemorragia intracraniana identificada");
  const cc = H.caminhoHemorragico(comp);
  conf("⚠️ hemorragia depois de trombólise iniciada → o mesmo caminho", cc.ativo === true, `⛔ ${JSON.stringify(cc)}`);
  conf("… infusão em curso pede o registro da interrupção (⛔ gravada sozinha)", cc.infusao === "em_curso" && cc.pendencias.some((p) => p.id === "registrar_interrupcao_da_infusao")
    && !comp.fatos.some((f) => f.campo === "ivt_estado" && f.valor === "Interrompida"), `⛔ ${cc.infusao} · ${JSON.stringify(cc.pendencias)}`);
  const interrompida = tenta(() => H.registrarInterrupcaoDaInfusao(comp, T0 + 32 * MIN, rel), comp);
  const ci = H.caminhoHemorragico(interrompida);
  conf("… interrupção registrada fica na trilha com horário ⛔ a exposição é preservada",
    ci.infusao === "interrompida" && ci.interrompidaEm === T0 + 32 * MIN && F.exposicaoAoTrombolitico(interrompida).estado === "exposta"
      && F.exposicaoAoTrombolitico(interrompida).fase === "interrompida" && !ci.pendencias.some((p) => p.id === "registrar_interrupcao_da_infusao"),
    `⛔ ${ci.infusao} · ${ci.interrompidaEm} · ${JSON.stringify(F.exposicaoAoTrombolitico(interrompida))}`);
  rel.definir(T0);

  const doc = fs.existsSync(arq("docs", "avc", "revisao", "hemorragia.md")) ? fs.readFileSync(arq("docs", "avc", "revisao", "hemorragia.md"), "utf8") : "";
  conf("pacote docs/avc/revisao/hemorragia.md lista fonte candidata por conduta",
    ["reversao_anticoagulante", "alvo_pressorico", "indicacao_cirurgica"].every((id) => { const s = doc.split(/\n### /).find((x) => x.startsWith(`\`${id}\``)) ?? ""; return /AHA\/ASA 2022/.test(s) && /AHA\/ASA 2023/.test(s); }),
    "⛔ pacote sem fonte por item");
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  conf("a tela reduz as abas no caminho hemorrágico", /SUPERFICIES_DO_CAMINHO_HEMORRAGICO/.test(tela) && /caminhoHemorragico\(/.test(tela), "⛔ abas iguais");
  conf("⚠️ captura do A07: com o caminho aberto, o título ⛔ diz «AVC isquêmico agudo»",
    /caminhoHemorragico\(estado\)\.ativo \? "Hemorragia intracraniana" : "AVC isquêmico agudo"/.test(tela), "⛔ título isquêmico no caminho hemorrágico");
  conf("a Destino desenha o caminho hemorrágico", /<CaminhoHemorragico/.test(lerFonte(arq("components", "avc", "superficie-g.tsx"))), "⛔ fora da Destino");
}

console.log(`\nprova-avc-rodada15: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
