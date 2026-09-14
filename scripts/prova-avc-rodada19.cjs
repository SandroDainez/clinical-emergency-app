#!/usr/bin/env node
/**
 * PROVA · 19ª RODADA DO AVC — Lote 1 das decisões do dossiê de revisão (autor, 2026-09-14;
 * `docs/decisoes.md`, 19ª rodada e complemento D1/D3/D8). Cada seção nasce vermelha antes da
 * alteração que ela mede, e entra num commit próprio.
 *
 * PROMETE:
 *  · D-139-4 (opção C): nas rotas de janela estendida, «não incapacitante» registrado impede;
 *    «Incerto» ⛔ não perguntado ⛔ viram incapacitante ⛔ nem liberam a IVT — a saída nomeia o
 *    déficit que falta; «Incapacitante» continua sustentando.
 *  · AC-06 (C5): a tenecteplase ⛔ exibe volume ⛔ nem concentração sem documento regulatório brasileiro;
 *    dose em mg; Table 7 como conferência em mg; alteplase mantém 1 mg/mL da bula.
 *  · D-139-2 (C6): varfarina/VKA pede só INR; heparina (HNF e HBPM no mesmo campo) sem mudança; DOAC em regra própria.
 *  · D-139-3 (C7, D8): julgamento individual registrado (prosseguir · não prosseguir) resolve o DOAC; «não
 *    prosseguir» impede; mudança é novo registro; >10 microssangramentos retêm como benefício incerto até decisão
 *    clínica; itens relativos classificados pelo verbo da fonte.
 * NÃO PROMETE: que a conduta esteja clinicamente validada; nenhum limiar novo; a tela é medida
 *   pelos e2e existentes.
 * UNIVERSO: `avc/nucleo/{veredito-da-trombolise,portao-ivt,derivacoes-f,derivacoes-d}.ts`, `avc/conteudo/{campos,superficie-f,superficie-d}.ts`,
 *   `components/avc/superficie-f.tsx`.
 * FONTE: `docs/decisoes.md` — 19ª rodada (§6 D-139-4) e complemento; pacote
 *   `docs/avc/revisao/D-139-4-deficit-incapacitante.md`.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada19-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "portao-ivt.ts"), path.join(appDir, "avc", "conteudo", "campos.ts"), path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"), path.join(appDir, "avc", "nucleo", "derivacoes-d.ts")],
  { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const V = emT("avc", "nucleo", "veredito-da-trombolise.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const SC = emT("avc", "conteudo", "superficie-c.js");

const H = 3_600_000;
const AGORA = 1_800_000_000_000;
const rel = R.relogioControlado(AGORA);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const regI = (e, inst, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const est = (n) => I.nomeDaInstancia(SC.ESTUDO, n);
const tcSem = (e, n, horaMs) => {
  let x = regI(e, est(n), "estudo_modalidade", SC.MODALIDADE.tcSemContraste);
  x = regI(x, est(n), "estudo_hora", horaMs);
  return regI(x, est(n), "estudo_resultado", SC.RESULTADO_TC.semHemorragia);
};
const ivt = (e) => ({ v: V.vereditoDaTrombolise(e, AGORA), p: P.estadoDoPortaoIVT(e, AGORA) });

/* ══ D-139-4 · déficit incapacitante nas rotas estendidas (opção C) ═══════ */
{
  /** Rota estendida que de fato sustenta hoje: RM com início desconhecido (§4.6.3 rec. 1). */
  let rm = tcSem(vazio, 1, AGORA - 1 * H);
  rm = regI(rm, est(2), "estudo_modalidade", SC.MODALIDADE.rm);
  rm = regI(rm, est(2), "dwi_menor_que_um_terco", "sim");
  rm = regI(rm, est(2), "flair_sem_alteracao_marcada", "sim");
  rm = reg(rm, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  rm = reg(rm, "hora_reconhecimento", AGORA - 2 * H);
  rm = reg(rm, "hora_inicio_observado", "nao_sei");

  const naoPerguntado = ivt(rm);
  conf("D-139-4 · déficit NÃO perguntado + rota estendida completa → ⛔ «indicada»", naoPerguntado.v.tipo !== "indicada", `⛔ ${naoPerguntado.v.tipo}`);
  conf("… ⛔ e o portão ⛔ libera", naoPerguntado.p.liberado === false, `⛔ ${naoPerguntado.p.estado}`);
  conf("… a saída nomeia o déficit incapacitante como o que falta", (naoPerguntado.v.faltam ?? []).includes("deficit_incapacitante"), `⛔ ${JSON.stringify(naoPerguntado.v.faltam)}`);

  const incerto = ivt(reg(rm, "incapacitante_assumido", "Incerto"));
  conf("D-139-4 · «Incerto» + rota estendida completa → ⛔ «indicada» (⛔ vira incapacitante)", incerto.v.tipo !== "indicada", `⛔ ${incerto.v.tipo}`);
  conf("… ⛔ e o portão ⛔ libera", incerto.p.liberado === false, `⛔ ${incerto.p.estado}`);
  conf("… a saída nomeia o déficit incapacitante", (incerto.v.faltam ?? []).includes("deficit_incapacitante"), `⛔ ${JSON.stringify(incerto.v.faltam)}`);

  const naoIncap = ivt(reg(rm, "incapacitante_assumido", "Não incapacitante"));
  conf("D-139-4 · «Não incapacitante» registrado → sem indicação neste caminho (AC-47 preservado)",
    naoIncap.v.tipo === "nao_sustentada" && /não incapacitante/i.test(naoIncap.v.frase ?? "") && naoIncap.p.liberado === false, `⛔ ${naoIncap.v.tipo} · ${naoIncap.v.frase}`);

  const incap = ivt(reg(rm, "incapacitante_assumido", "Incapacitante"));
  conf("D-139-4 · «Incapacitante» + rota estendida completa → indicada pela rota estendida",
    incap.v.tipo === "indicada" && incap.v.sustentam.some((m) => m.id === "ivt_inicio_desconhecido"), `⛔ ${incap.v.tipo}`);

  conf("D-139-4 · desconhecido, negativo ⛔ não avaliado ⛔ se confundem: três saídas distintas",
    new Set([naoPerguntado.v.tipo + (naoPerguntado.v.faltam ?? []).join(), naoIncap.v.tipo, incap.v.tipo]).size === 3
      && E.valorAtual(reg(rm, "incapacitante_assumido", "Incerto"), "incapacitante_assumido")?.valor !== "Incapacitante",
    "⛔ saídas colapsadas");
}

/* ══ AC-06 · C5 · volume da tenecteplase sem documento regulatório brasileiro ═══ */
{
  const SF = emT("avc", "conteudo", "superficie-f.js");
  const DF = emT("avc", "nucleo", "derivacoes-f.js");
  const tnk = (kg) => DF?.doseDerivada?.("tenecteplase", kg, "estimado");
  const alt = (kg) => DF?.doseDerivada?.("alteplase", kg, "estimado");
  conf("AC-06 · C5 · a tenecteplase ⛔ declara concentração (bula brasileira de Metalyse 25 mg ⛔ arquivada)",
    SF?.DOSES?.tenecteplase !== undefined && SF.DOSES.tenecteplase.concentracaoMgPorMl === undefined, `⛔ ${JSON.stringify(SF?.DOSES?.tenecteplase)}`);
  conf("… 70 kg → 17,5 mg, ⛔ sem volume ⛔ nem concentração",
    tnk(70)?.totalMg === 17.5 && tnk(70)?.volumeMl === undefined && tnk(70)?.concentracaoMgPorMl === undefined, `⛔ ${JSON.stringify(tnk(70))}`);
  conf("… 100 kg e 120 kg → 25 mg (teto), ⛔ sem volume", tnk(100)?.totalMg === 25 && tnk(120)?.totalMg === 25 && tnk(120)?.volumeMl === undefined, "⛔");
  conf("… a Table 7 continua como conferência documental, só em mg", tnk(70)?.conferenciaTable7?.mg === 20 && /Table 7/.test(tnk(70)?.conferenciaTable7?.fonte ?? ""), `⛔ ${JSON.stringify(tnk(70)?.conferenciaTable7)}`);
  conf("… a alteplase mantém 1 mg/mL (bula Actilyse I23-01, p. 7): 70 kg → 63 mL", alt(70)?.volumeMl === 63 && alt(70)?.concentracaoMgPorMl === 1, `⛔ ${JSON.stringify(alt(70))}`);
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("… a situação regulatória da tenecteplase continua visível", /avc-f-dose-regulatorio/.test(tela), "⛔");
}

/* ══ D-139-2 · C6 · VKA/varfarina: INR como parâmetro principal ═══════════════ */
{
  const DD = emT("avc", "nucleo", "derivacoes-d.js");
  const PAC = emT("avc", "conteudo", "paciente.js");
  const L = emT("avc", "conteudo", "laboratorio.js");
  const col = (n) => I.nomeDaInstancia(L.COLETA, n);
  const base = () => {
    let x = reg(vazio, "incapacitante_assumido", "Incapacitante");
    x = reg(x, "hora_inicio_observado", AGORA - 2 * H);
    x = tcSem(x, 1, AGORA - 1 * H);
    return reg(x, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  };
  const coag = (e) => (DD?.impedimentosDeSeguranca?.(e) ?? []).find((i) => i.id === "coagulograma");
  const vka = reg(base(), "anticoagulante_em_uso", PAC.ANTICOAGULANTE.varfarina);
  conf("D-139-2 · VKA sem INR → aguarda o INR (o resultado pertinente)", coag(vka)?.efeito === "impede_ate_resultado" && coag(vka)?.campo === "inr", `⛔ ${JSON.stringify(coag(vka))}`);
  const vkaComInr = regI(vka, col(1), "inr", 1.0);
  conf("⚠️ D-139-2 · VKA com INR registrado, SEM PT ⛔ aPTT → ⛔ aguarda PT/aPTT (teste sem pertinência ⛔ é exigido)",
    coag(vkaComInr) === undefined, `⛔ ${JSON.stringify(coag(vkaComInr))}`);
  const hep = reg(base(), "anticoagulante_em_uso", PAC.ANTICOAGULANTE.heparina);
  const hepComInr = regI(hep, col(1), "inr", 1.0);
  conf("D-139-2 · heparina (HNF e HBPM no mesmo campo) ⛔ muda nesta rodada: com INR só, continua aguardando (Lote 2 sem fonte)",
    coag(hepComInr)?.efeito === "impede_ate_resultado", `⛔ ${JSON.stringify(coag(hepComInr))}`);
  const doac = reg(base(), "anticoagulante_em_uso", PAC.ANTICOAGULANTE.doac);
  conf("D-139-2 · DOAC mantém a regra própria (⛔ entra no coagulograma de VKA)", coag(doac)?.dado !== "Varfarina ou heparina em uso", `⛔ ${JSON.stringify(coag(doac))}`);
}

/* ══ D-139-3 · C7 e D8 · julgamento individual registrado ═══════════════════════ */
{
  const DD = emT("avc", "nucleo", "derivacoes-d.js");
  const PAC = emT("avc", "conteudo", "paciente.js");
  const L = emT("avc", "conteudo", "laboratorio.js");
  const col = (n) => I.nomeDaInstancia(L.COLETA, n);
  /** Candidato completo à IVT pela rota padrão, com coagulograma registrado. */
  const base = () => {
    let x = reg(vazio, "incapacitante_assumido", "Incapacitante");
    x = reg(x, "hora_inicio_observado", AGORA - 2 * H);
    x = tcSem(x, 1, AGORA - 1 * H);
    x = reg(x, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
    /**
     * ⚠️ Ajuste de instrumento (vermelho da seção D-139-3, antes de implementar): plaquetas sem unidade deixavam o
     * portão em «reconciliação pendente» e escondiam o julgamento. Agora: 200 mil/mm³ com a unidade declarada.
     */
    for (const [c, v] of [["inr", 1.0], ["aptt", 30], ["tp", 12], ["plaquetas", 200], ["plaquetas_unidade", "mil/mm³ (×10³/µL)"]]) x = regI(x, col(1), c, v);
    return x;
  };
  /**
   * ⚠️ Ajuste de instrumento (antes de implementar): o rascunho gravava «prosseguir»/«nao_prosseguir» crus na instância
   * «doac». A tela grava o RÓTULO da opção, e a instância segue a convenção `<tipo>_<alvo>` (`instanciasDe`). O
   * instrumento passa a usar as constantes do conteúdo — ⛔ o valor que a derivação lê é o que a tela grava.
   */
  const SF = emT("avc", "conteudo", "superficie-f.js");
  const julgar = (e, alvo, decisao) => regI(e, SF?.instanciaDoJulgamento?.(alvo) ?? alvo, "julgamento_individual_registrado",
    decisao === "prosseguir" ? SF?.DECISAO_DO_JULGAMENTO?.prosseguir : SF?.DECISAO_DO_JULGAMENTO?.naoProsseguir);
  const imp = (e, id) => (DD?.impedimentosDeSeguranca?.(e) ?? []).find((i) => i.id === id);

  /* DOAC <48 h: julgamento individual obrigatório (Table 8, p. e365) */
  const doac = reg(reg(base(), "anticoagulante_em_uso", PAC.ANTICOAGULANTE.doac), "doac_ultima_dose", "nao_sei");
  conf("D-139-3 · existe o campo `julgamento_individual_registrado` (prosseguir · não prosseguir)",
    CAMPOS?.todosOsCampos?.().some((c) => c.id === "julgamento_individual_registrado"), "⛔ campo ausente");
  conf("D-139-3 · DOAC individualizado sem julgamento → portão em julgamento pendente, ⛔ liberado",
    ivt(doac).p.estado === "julgamento_individual_pendente" && ivt(doac).p.liberado === false, `⛔ ${ivt(doac).p.estado}`);
  const doacSim = julgar(doac, "doac", "prosseguir");
  conf("⚠️ D-139-3 · DOAC + julgamento «prosseguir» registrado → o julgamento deixa de estar pendente",
    imp(doacSim, "doac") === undefined && ivt(doacSim).p.estado !== "julgamento_individual_pendente", `⛔ ${ivt(doacSim).p.estado} · ${JSON.stringify(imp(doacSim, "doac"))}`);
  /**
   * ⚠️ Ajuste de instrumento (depois de implementar): o cenário anterior (juízo «sim» com INR, PT, aPTT ⛔ plaquetas
   * normais já registrados) ⛔ tinha outro impedimento — passava no vermelho só porque o próprio DOAC retinha. Agora
   * o outro impedimento é real: >10 microssangramentos sem decisão clínica.
   */
  const doacSimComPendencia = julgar(reg(doac, "informacao_previa_cmb", "Ressonância prévia com mais de 10 microssangramentos"), "doac", "prosseguir");
  conf("… «prosseguir» ⛔ libera se outro impedimento existe (ex.: >10 microssangramentos sem decisão)",
    ivt(doacSimComPendencia).p.liberado === false && imp(doacSimComPendencia, "cmb") !== undefined,
    `⛔ ${ivt(doacSimComPendencia).p.estado}`);
  const doacNao = julgar(doac, "doac", "nao_prosseguir");
  conf("⚠️ D-139-3 · «não prosseguir» registrado → impede a IVT neste episódio",
    imp(doacNao, "doac")?.efeito === "impede" && ivt(doacNao).p.liberado === false, `⛔ ${JSON.stringify(imp(doacNao, "doac"))}`);
  const mudou = julgar(doacNao, "doac", "prosseguir");
  conf("… mudar a decisão é NOVO registro: a trilha guarda os dois (⛔ sobrescrita)",
    mudou.fatos.filter((f) => f.campo === "julgamento_individual_registrado").length === 2 && imp(mudou, "doac") === undefined, "⛔ sobrescrita ou leitura antiga");

  /* Microssangramentos >10: benefício incerto, retém até decisão clínica (COR 2b, p. e354) */
  const cmb = reg(base(), "informacao_previa_cmb", "Ressonância prévia com mais de 10 microssangramentos");
  conf("⚠️ D-139-3 · >10 microssangramentos → `beneficio_ivt_incerto_requer_decisao_clinica`, ⛔ «julgamento individual»",
    imp(cmb, "cmb")?.efeito === "beneficio_ivt_incerto_requer_decisao_clinica", `⛔ ${JSON.stringify(imp(cmb, "cmb"))}`);
  conf("… retém a IVT até a decisão clínica registrada", ivt(cmb).p.liberado === false, `⛔ ${ivt(cmb).p.estado}`);
  conf("… ⛔ atribui à fonte «individual basis» (a recomendação ⛔ usa)", !/individual/i.test(`${imp(cmb, "cmb")?.oQueFalta} ${imp(cmb, "cmb")?.rotulo}`), `⛔ ${imp(cmb, "cmb")?.oQueFalta}`);
  conf("… decisão clínica «prosseguir» registrada → deixa de reter por este motivo",
    imp(julgar(cmb, "cmb", "prosseguir"), "cmb") === undefined, "⛔");

  /* Itens relativos: classificação pelo verbo da fonte (D8) */
  const SD = emT("avc", "conteudo", "superficie-d.js");
  const explicitos = (SD?.ITENS_DE_SEGURANCA ?? []).filter((i) => i.estado === "situacao_individualizada");
  conf("D-139-3 · todo item «situação individualizada» cita individualização no verbo da fonte, exceto os declarados",
    explicitos.every((i) => /individual/i.test(i.verbo) || i.opcao === "Traumatismo craniano moderado a grave entre 14 dias e 3 meses"),
    `⛔ ${explicitos.filter((i) => !/individual/i.test(i.verbo)).map((i) => i.opcao).join(" · ")}`);
  const seguranca = (SD?.ITENS_DE_SEGURANCA ?? []).filter((i) => i.estado === "informacao_insuficiente").map((i) => i.opcao);
  conf("… os de «segurança desconhecida» ⛔ viram julgamento obrigatório (continuam informação, AC-48)",
    seguranca.length >= 2, `⛔ ${seguranca.join(" · ")}`);
  const imps = (e) => DD?.impedimentosDeSeguranca?.(e) ?? [];
  const puncao = reg(base(), "procedimentos_recentes", "Punção dural nos últimos 7 dias");
  const idPuncao = "item-Punção dural nos últimos 7 dias";
  conf("⚠️ D-139-3 · D8 · item com individualização explícita no verbo («in individual cases») aceita o julgamento registrado",
    imp(puncao, idPuncao)?.efeito === "exige_julgamento" && imp(julgar(puncao, idPuncao, "prosseguir"), idPuncao) === undefined,
    `⛔ ${JSON.stringify(imps(julgar(puncao, idPuncao, "prosseguir")).map((i) => [i.id, i.efeito]))}`);
  const tce = reg(base(), "procedimentos_recentes", "Traumatismo craniano moderado a grave entre 14 dias e 3 meses");
  const idTce = "item-Traumatismo craniano moderado a grave entre 14 dias e 3 meses";
  /**
   * ⚠️ Decisão do autor (2026-09-14, conclusão do D-139-3, item 1): a Table 8 diz que a IVT pode ser considerada após
   * avaliação cuidadosa do tipo e da gravidade do trauma, com neurocirurgia e neurointensivismo. ⛔ Contraindicação,
   * ⛔ «individual basis» (⛔ é o verbo literal): avaliação de risco e benefício obrigatória, retida até a decisão.
   * Substitui a conferência anterior («o julgamento ⛔ o resolve»), que media o comportamento sinalizado ao autor.
   */
  const semTermo = (i) => !/individual|contraindica/i.test(`${i?.oQueFalta} ${i?.rotulo} ${i?.dado ?? ""}`);
  conf("⚠️ D-139-3 · TCE moderado a grave entre 14 dias e 3 meses → `avaliacao_risco_beneficio_obrigatoria`, ⛔ «individual» ⛔ contraindicação",
    imp(tce, idTce)?.efeito === "avaliacao_risco_beneficio_obrigatoria" && semTermo(imp(tce, idTce)), `⛔ ${JSON.stringify(imp(tce, idTce))}`);
  conf("… retém o portão (`avaliacao_risco_beneficio_pendente`) até a decisão clínica",
    ivt(tce).p.estado === "avaliacao_risco_beneficio_pendente" && ivt(tce).p.liberado === false, `⛔ ${ivt(tce).p.estado}`);
  conf("… «prosseguir» registrado deixa de reter por ele; «não prosseguir» impede",
    imp(julgar(tce, idTce, "prosseguir"), idTce) === undefined && imp(julgar(tce, idTce, "nao_prosseguir"), idTce)?.efeito === "impede",
    `⛔ ${JSON.stringify(imp(julgar(tce, idTce, "prosseguir"), idTce))}`);

  /* O portão nomeia cada situação sem chamá-la de contraindicação */
  conf("⚠️ D-139-3 · CMB >10 sem decisão → portão `decisao_clinica_pendente` (⛔ julgamento individual)",
    ivt(cmb).p.estado === "decisao_clinica_pendente", `⛔ ${ivt(cmb).p.estado}`);
  conf("… CMB «não prosseguir» → impede", imp(julgar(cmb, "cmb", "nao_prosseguir"), "cmb")?.efeito === "impede", "⛔");
  conf("⚠️ D-139-3 · «não prosseguir» registrado (sem outro impeditivo) → portão `decisao_de_nao_prosseguir`, ⛔ «contraindicação de segurança»",
    ivt(doacNao).p.estado === "decisao_de_nao_prosseguir", `⛔ ${ivt(doacNao).p.estado}`);
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  const titulo = (telaF.match(/decisao_de_nao_prosseguir:\s*"([^"]+)"/) ?? [])[1] ?? "";
  conf("… o título desse estado ⛔ diz contraindicação", titulo !== "" && !/contraindica/i.test(titulo), `⛔ «${titulo}»`);
  conf("… a tela oferece os dois gestos do julgamento no motivo do portão",
    /avc-f-julgamento-\$\{m\.id\}-/.test(telaF) && /DECISAO_DO_JULGAMENTO/.test(telaF), "⛔ sem gesto na tela");

  /* Decisão do autor, item 3: «não prosseguir» vigente é o motivo principal */
  const ids = (e) => ivt(e).p.motivos.map((m) => m.id);
  const doacSemTc = reg(reg(vazio, "anticoagulante_em_uso", PAC.ANTICOAGULANTE.doac), "doac_ultima_dose", "nao_sei");
  const semTcNao = julgar(doacSemTc, "doac", "nao_prosseguir");
  conf("⚠️ D-139-3 · «não prosseguir» vigente é o MOTIVO PRINCIPAL; a TC ⛔ registrada segue visível como adicional",
    ids(semTcNao)[0] === "doac" && ids(semTcNao).length > 1, `⛔ ${JSON.stringify(ids(semTcNao))}`);
  const semTcSim = julgar(semTcNao, "doac", "prosseguir");
  conf("… novo registro «prosseguir» (⛔ sobrescrita): o principal volta à hierarquia dos impedimentos restantes",
    !ids(semTcSim).includes("doac") && ids(semTcSim)[0] === ids(vazio)[0]
      && semTcSim.fatos.filter((f) => f.campo === "julgamento_individual_registrado").length === 2,
    `⛔ ${JSON.stringify(ids(semTcSim))} × ${JSON.stringify(ids(vazio))}`);

  /* Decisão do autor, item 2: decisão vigente + autor + data/hora visíveis, na trilha */
  const trilha = DD?.julgamentosRegistrados?.(mudou) ?? [];
  conf("⚠️ D-139-3 · a trilha dos julgamentos guarda os dois registros — alvo, decisão, hora, fato ⛔ qual é o vigente",
    trilha.length === 2
      && trilha[0].decisao === SF?.DECISAO_DO_JULGAMENTO?.naoProsseguir && trilha[0].vigente === false
      && trilha[1].decisao === SF?.DECISAO_DO_JULGAMENTO?.prosseguir && trilha[1].vigente === true
      && trilha.every((t) => t.alvo === "doac" && typeof t.horaRegistro === "number" && typeof t.fatoId === "string" && typeof t.rotuloDoAlvo === "string" && t.rotuloDoAlvo !== ""),
    `⛔ ${JSON.stringify(trilha)}`);
  conf("… a tela mostra a trilha em detalhe expansível, com a autoria do fato (AC-40)",
    /avc-f-julgamentos/.test(telaF) && /julgamentosRegistrados/.test(telaF) && /useAutoriaDoAtendimento/.test(telaF), "⛔ sem trilha na tela");
}

console.log(`\nprova-avc-rodada19: ${ok} ok · ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
