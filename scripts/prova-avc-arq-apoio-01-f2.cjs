#!/usr/bin/env node
/**
 * PROVA · ARQ-APOIO-01 · F2 — Limpar por instância, AP-5 + textos D, AP-6/dose, D-139-3 por completude.
 *
 * PROMETE:
 *  · «Limpar» de exame: resultado de imagem ou laboratório que sustenta retenção ou alerta crítico só sai por correção
 *    auditada («toque errado»), apontando o fato da instância TOCADA; com dois exames ou duas coletas, a outra fica
 *    completamente intocada (trava por identidade da instância, autor, 2026-09-15);
 *  · AP-5: a Reperfusão fica na barra do caminho hemorrágico;
 *  · tela D: >10 microssangramentos diz «Benefício da trombólise incerto — requer decisão clínica registrada», sem
 *    «não fica bloqueada»; o grupo não diz «a fonte diz para não administrar»; a tradução de «should be considered as
 *    benefit likely outweighs risk» atribui à fonte; o portão não diz «A diretriz não recomenda…»;
 *  · dose e AP-6: origem «Medido» existe, as antigas continuam, sem «Importado»; peso numérico basta para calcular (a
 *    origem qualifica); teto aplicado é marcado;
 *  · D-139-3 por COMPLETUDE, não por idade (autor, 2026-09-15): «Prosseguir» incompleto não libera e requer
 *    revalidação; «Prosseguir» completo libera; «Não prosseguir» incompleto continua impedindo, marcado incompleto;
 *    nenhum fato antigo é reescrito; a tela nunca afirma «legada».
 * NÃO PROMETE: AP-4 (população) nem desfechos negativos (F3); a tela é medida em `e2e/avc-arq-apoio-01-f2.spec.ts`.
 * UNIVERSO: `avc/nucleo/{limpar-auditado,portao-ivt,derivacoes-d,derivacoes-f,decisao-medica}.ts`,
 *   `avc/conteudo/{caminho-hemorragico,superficie-d,paciente}.ts`, `components/avc/{avc-modulo-screen,superficie-d,superficie-f}.tsx`.
 * FONTE: decisões do autor de 2026-09-15 (F2a, AP-6, D-139-3 por completude); `docs/avc/revisao/ARQ-APOIO-01-mapa.md`.
 *
 * VERMELHAS_DECLARADAS: a prova passa só se as vermelhas observadas forem exatamente as declaradas — cada uma sai da
 * lista no commit que a torna verde (mesmo mecanismo do AC-15).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arq-apoio-01-f2-"));
const fontes = [
  ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "nucleo", "portao-ivt.ts"], ["avc", "nucleo", "decisao-medica.ts"],
  ["avc", "nucleo", "derivacoes-d.ts"], ["avc", "nucleo", "derivacoes-f.ts"], ["avc", "nucleo", "limpar-auditado.ts"], ["avc", "nucleo", "instancia.ts"],
  ["avc", "conteudo", "campos.ts"], ["avc", "conteudo", "campo.ts"], ["avc", "conteudo", "superficie-c.ts"], ["avc", "conteudo", "superficie-d.ts"],
  ["avc", "conteudo", "superficie-f.ts"], ["avc", "conteudo", "caminho-hemorragico.ts"], ["avc", "conteudo", "paciente.ts"], ["avc", "conteudo", "laboratorio.ts"],
].map((p) => path.join(appDir, ...p));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const DM = emT("avc", "nucleo", "decisao-medica.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const DF = emT("avc", "nucleo", "derivacoes-f.js");
const L = emT("avc", "nucleo", "limpar-auditado.js");
const I = emT("avc", "nucleo", "instancia.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const SD = emT("avc", "conteudo", "superficie-d.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const CH = emT("avc", "conteudo", "caminho-hemorragico.js");
const PAC = emT("avc", "conteudo", "paciente.js");
const LAB = emT("avc", "conteudo", "laboratorio.js");

const linhas = new Map();
function conf(id, nome, cond, porque) {
  const l = linhas.get(id) ?? { ok: 0, falhas: [] };
  if (cond) l.ok++; else l.falhas.push(`${nome} — ${porque}`);
  linhas.set(id, l);
}
function bloco(id, nome, fn) {
  try { fn(); } catch (e) { conf(id, nome, false, `exceção: ${String(e && e.message).slice(0, 180)}`); }
}

const H = 3_600_000;
const AGORA = 1_800_000_000_000;
const rel = R.relogioControlado(AGORA);
const vazio = () => E.abrirAtendimento(rel);
const reg = (e, c, v) => E.registrarFato(e, { campo: c, valor: v }, rel);
const regI = (e, inst, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, inst);
const comTc = (e, resultado, hora = AGORA - 1 * H) => {
  const inst = I.proximaInstancia(e, SC.ESTUDO);
  let x = regI(e, inst, "estudo_modalidade", CAMPO.valorDaOpcao("Tomografia de crânio sem contraste"));
  x = regI(x, inst, "estudo_hora", hora);
  return { e: regI(x, inst, "estudo_resultado", CAMPO.valorDaOpcao(resultado)), inst };
};
const portao = (e) => P.estadoDoPortaoIVT(e, AGORA);
const motivo = (e, id) => portao(e).motivos.find((m) => m.id === id);
const vigenteNa = (e, campo, inst) => {
  const corrigidos = new Set(e.fatos.map((f) => f.corrigeFatoId));
  return [...e.fatos].reverse().find((f) => f.campo === campo && f.instancia === inst && !corrigidos.has(f.id));
};
/** A outra instância fica COMPLETAMENTE intocada: nenhum fato novo nela, nenhum fato dela corrigido, o vigente igual. */
const intocada = (antes, depois, campo, inst) => {
  const novos = depois.fatos.slice(antes.fatos.length);
  const idsDela = new Set(antes.fatos.filter((f) => f.instancia === inst).map((f) => f.id));
  return novos.every((f) => f.instancia !== inst && !idsDela.has(f.corrigeFatoId))
    && vigenteNa(depois, campo, inst)?.id === vigenteNa(antes, campo, inst)?.id;
};
const ultimo = (e, campo, inst) => [...e.fatos].reverse().find((f) => f.campo === campo && (inst === undefined || f.instancia === inst));

/* ══ LIMPAR · resultado de exame que sustenta alerta ════════════════════════ */
bloco("LIMPAR-TC", "TC com hemorragia", () => {
  const { e, inst } = comTc(vazio(), "Hemorragia intracraniana identificada");
  const achado = ultimo(e, "estudo_resultado", inst);
  conf("LIMPAR-TC", "controle: a hemorragia sustenta o alerta crítico", motivo(e, "imagem")?.critico === true, "⛔ sem alerta");
  conf("LIMPAR-TC", "o resultado de imagem sustenta retenção (pede «Foi engano?»)",
    L.campoSustentaRetencaoOuBloqueio(e, "estudo_resultado", rel, inst) === true, "⛔ false");
  const limpo = L.limparComCorrecaoAuditada(e, "estudo_resultado", rel, inst);
  const correcao = limpo.fatos.slice(e.fatos.length).find((f) => f.campo === "estudo_resultado");
  conf("LIMPAR-TC", "correção auditada: aponta o achado, na mesma instância, motivo «toque errado»",
    correcao?.corrigeFatoId === achado.id && correcao?.instancia === inst && correcao?.motivo === "toque errado", `⛔ ${JSON.stringify(correcao)}`);
  conf("LIMPAR-TC", "o achado anterior continua na trilha", limpo.fatos.some((f) => f.id === achado.id && f.valor === achado.valor), "⛔ sumiu");
});
bloco("LIMPAR-INR", "INR crítico", () => {
  const col = I.nomeDaInstancia(LAB.COLETA, 1);
  const e = regI(vazio(), col, "inr", 3);
  const achado = ultimo(e, "inr", col);
  conf("LIMPAR-INR", "controle: INR 3 gera o corte crítico", motivo(e, "corte-inr")?.critico === true, `⛔ ${JSON.stringify(portao(e).motivos.map((m) => m.id))}`);
  conf("LIMPAR-INR", "o INR sustenta retenção (pede «Foi engano?»)", L.campoSustentaRetencaoOuBloqueio(e, "inr", rel, col) === true, "⛔ false");
  const limpo = L.limparComCorrecaoAuditada(e, "inr", rel, col);
  const correcao = limpo.fatos.slice(e.fatos.length).find((f) => f.campo === "inr");
  conf("LIMPAR-INR", "correção auditada apontando o INR, na coleta, motivo «toque errado»",
    correcao?.corrigeFatoId === achado.id && correcao?.instancia === col && correcao?.motivo === "toque errado", `⛔ ${JSON.stringify(correcao)}`);
  conf("LIMPAR-INR", "o INR anterior continua na trilha", limpo.fatos.some((f) => f.id === achado.id), "⛔ sumiu");
});
/**
 * ⚠️ Ajuste de instrumento (antes de implementar): com UM exame, LIMPAR-TC ⛔ LIMPAR-INR passavam no HEAD por acaso — a
 * correção sem instância cai no único exame aberto. O defeito é o gesto ⛔ levar a instância: com DOIS exames, limpar o
 * primeiro tem de corrigir aquele fato, ⛔ o do exame mais recente.
 */
bloco("LIMPAR-DOIS-EXAMES", "duas TCs · limpar uma", () => {
  const um = comTc(vazio(), "Hemorragia intracraniana identificada", AGORA - 2 * H);
  const dois = comTc(um.e, "Hemorragia intracraniana identificada", AGORA - 1 * H);
  const achado = ultimo(dois.e, "estudo_resultado", um.inst);
  const limpo = L.limparComCorrecaoAuditada(dois.e, "estudo_resultado", rel, um.inst);
  const correcao = limpo.fatos.slice(dois.e.fatos.length).find((f) => f.campo === "estudo_resultado");
  conf("LIMPAR-DOIS-EXAMES", "a correção aponta o resultado da PRIMEIRA TC, na instância dela",
    correcao?.corrigeFatoId === achado.id && correcao?.instancia === um.inst, `⛔ ${JSON.stringify(correcao)} · esperado ${achado.id}/${um.inst}`);
  conf("LIMPAR-DOIS-EXAMES", "a segunda TC fica completamente intocada", intocada(dois.e, limpo, "estudo_resultado", dois.inst), "⛔ corrigiu o exame errado");
  conf("LIMPAR-DOIS-EXAMES", "a hemorragia da segunda TC continua sustentando o alerta crítico", motivo(limpo, "imagem")?.critico === true, `⛔ ${JSON.stringify(motivo(limpo, "imagem"))}`);
  const limpoDois = L.limparComCorrecaoAuditada(dois.e, "estudo_resultado", rel, dois.inst);
  conf("LIMPAR-DOIS-EXAMES", "simétrico: limpar a segunda deixa a primeira intocada", intocada(dois.e, limpoDois, "estudo_resultado", um.inst), "⛔ corrigiu o exame errado");
});
bloco("LIMPAR-DIVERGENTES", "TC com hemorragia e TC sem · limpar a com hemorragia", () => {
  const um = comTc(vazio(), "Hemorragia intracraniana identificada", AGORA - 2 * H);
  const dois = comTc(um.e, "Sem hemorragia intracraniana identificada", AGORA - 1 * H);
  conf("LIMPAR-DIVERGENTES", "o resultado da primeira sustenta o alerta (pede «Foi engano?»)",
    L.campoSustentaRetencaoOuBloqueio(dois.e, "estudo_resultado", rel, um.inst) === true, "⛔ false");
  const limpo = L.limparComCorrecaoAuditada(dois.e, "estudo_resultado", rel, um.inst);
  conf("LIMPAR-DIVERGENTES", "a TC sem hemorragia fica completamente intocada", intocada(dois.e, limpo, "estudo_resultado", dois.inst), "⛔ corrigiu o exame errado");
  conf("LIMPAR-DIVERGENTES", "o achado corrigido continua na trilha", limpo.fatos.some((f) => f.id === ultimo(dois.e, "estudo_resultado", um.inst).id), "⛔ sumiu");
});
bloco("LIMPAR-DUAS-COLETAS", "duas coletas · limpar o INR de uma", () => {
  const c1 = I.nomeDaInstancia(LAB.COLETA, 1);
  const c2 = I.nomeDaInstancia(LAB.COLETA, 2);
  const e = regI(regI(vazio(), c1, "inr", 3), c2, "inr", 3.2);
  const achado = ultimo(e, "inr", c1);
  const limpo = L.limparComCorrecaoAuditada(e, "inr", rel, c1);
  const correcao = limpo.fatos.slice(e.fatos.length).find((f) => f.campo === "inr");
  conf("LIMPAR-DUAS-COLETAS", "a correção aponta o INR da primeira coleta", correcao?.corrigeFatoId === achado.id && correcao?.instancia === c1, `⛔ ${JSON.stringify(correcao)} · esperado ${achado.id}/${c1}`);
  conf("LIMPAR-DUAS-COLETAS", "a segunda coleta fica completamente intocada", intocada(e, limpo, "inr", c2), "⛔ corrigiu a coleta errada");
  conf("LIMPAR-DUAS-COLETAS", "o INR da segunda coleta continua sustentando o corte crítico", motivo(limpo, "corte-inr")?.critico === true, `⛔ ${JSON.stringify(portao(limpo).motivos.map((m) => m.id))}`);
  conf("LIMPAR-DUAS-COLETAS", "simétrico: limpar a segunda deixa a primeira intocada", intocada(e, L.limparComCorrecaoAuditada(e, "inr", rel, c2), "inr", c1), "⛔ corrigiu a coleta errada");
  const discordantes = regI(regI(vazio(), c1, "inr", 3), c2, "inr", 1.0);
  conf("LIMPAR-DUAS-COLETAS", "coletas discordantes: o INR crítico sustenta (pede «Foi engano?»)", L.campoSustentaRetencaoOuBloqueio(discordantes, "inr", rel, c1) === true, "⛔ false");
  conf("LIMPAR-DUAS-COLETAS", "coletas discordantes: limpar a primeira deixa a segunda intocada", intocada(discordantes, L.limparComCorrecaoAuditada(discordantes, "inr", rel, c1), "inr", c2), "⛔ corrigiu a coleta errada");
});
bloco("LIMPAR-TELA", "a tela", () => {
  const tela = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));
  const trecho = (tela.match(/function desfazerNaInstancia\([^)]*\)\s*\{[\s\S]*?\n  \}/) || [""])[0];
  conf("LIMPAR-TELA", "o «Limpar» de exame consulta a regra auditada, na instância tocada, antes de corrigir", /campoSustentaRetencaoOuBloqueio\(estado, campo, relogio, coleta\)/.test(trecho), `⛔ ${trecho.slice(0, 160)}`);
  conf("LIMPAR-TELA", "a confirmação grava a correção na instância do pedido", /limparComCorrecaoAuditada\(e, alvo\.campo, relogio, alvo\.instancia\)/.test(tela), "⛔ a confirmação perde a instância");
});

/* ══ AP-5 · Reperfusão no caminho hemorrágico ══════════════════════════════ */
bloco("AP5", "barra", () => {
  conf("AP5", "a Reperfusão fica na barra do caminho hemorrágico", (CH.SUPERFICIES_DO_CAMINHO_HEMORRAGICO ?? []).includes("reperfusao"), `⛔ ${JSON.stringify(CH.SUPERFICIES_DO_CAMINHO_HEMORRAGICO)}`);
});

/* ══ Tela D ════════════════════════════════════════════════════════════════ */
bloco("D-CMB", ">10 microssangramentos", () => {
  const r = DD.microssangramentos(reg(vazio(), "informacao_previa_cmb", "Ressonância prévia com mais de 10 microssangramentos"));
  const texto = `${r.curto} ${r.texto}`;
  conf("D-CMB", "⛔ «não fica bloqueada»", !/não fica bloqueada/i.test(texto), `⛔ ${texto}`);
  conf("D-CMB", "«Benefício da trombólise incerto» ⛔ «requer decisão clínica registrada»",
    /Benefício da trombólise incerto/.test(texto) && /requer decisão clínica registrada/i.test(texto), `⛔ ${texto}`);
});
bloco("D-TITULO", "título do grupo", () => {
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-d.tsx"));
  conf("D-TITULO", "o grupo com «likely contraindicated» ⛔ diz «a fonte diz para não administrar»", !/A fonte diz para não administrar/.test(tela), "⛔ título mais forte que a fonte");
});
bloco("D-GLOSA", "tradução atribuída", () => {
  const t = SD.FORMULACAO_PT?.["should be considered as benefit likely outweighs risk"] ?? "";
  conf("D-GLOSA", "«deve ser considerado» atribuído à fonte", /a fonte diz/.test(t), `⛔ ${t}`);
});
bloco("D-PORTAO", "motivo COR 3", () => {
  const src = lerFonte(path.join(appDir, "avc", "nucleo", "portao-ivt.ts"));
  conf("D-PORTAO", "o portão ⛔ diz «A diretriz não recomenda a trombólise neste caso»", !/A diretriz não recomenda a trombólise neste caso/.test(src), "⛔ sem «segundo a fonte»");
});

/* ══ Dose ⛔ AP-6 ═══════════════════════════════════════════════════════════ */
bloco("AP6-OPCOES", "opções de origem", () => {
  const op = K.campoDoModulo("peso_origem")?.opcoes ?? [];
  conf("AP6-OPCOES", "«Medido» é opção", op.includes("Medido"), `⛔ ${JSON.stringify(op)}`);
  conf("AP6-OPCOES", "controle: as antigas continuam", ["Informado pelo paciente ou família", "Estimado pela equipe"].every((x) => op.includes(x)), `⛔ ${JSON.stringify(op)}`);
  conf("AP6-OPCOES", "controle: ⛔ «Importado»", !op.some((x) => /import/i.test(x)), `⛔ ${JSON.stringify(op)}`);
});
bloco("AP6-CALCULO", "peso basta para calcular", () => {
  const d = DF.doseDerivada("alteplase", 70, undefined);
  conf("AP6-CALCULO", "70 kg sem origem → dose calculada (63 mg)", d !== undefined && d.totalMg === 63, `⛔ ${JSON.stringify(d)}`);
});
bloco("DOSE-TETO", "teto aplicado", () => {
  const alto = DF.doseDerivada("alteplase", 108, "medido");
  const baixo = DF.doseDerivada("alteplase", 70, "medido");
  conf("DOSE-TETO", "108 kg → 90 mg com `tetoAplicado: true`", alto?.totalMg === 90 && alto?.tetoAplicado === true, `⛔ ${JSON.stringify(alto && { totalMg: alto.totalMg, tetoAplicado: alto.tetoAplicado })}`);
  conf("DOSE-TETO", "70 kg → `tetoAplicado: false`", baixo?.tetoAplicado === false, `⛔ ${baixo?.tetoAplicado}`);
});

/* ══ D-139-3 · política de COMPLETUDE, não de idade (autor, 2026-09-15) ═══════
 * O dado não distingue com segurança um julgamento antigo de uma decisão incompleta criada por chamada direta: a regra é
 * pela completude. «Prosseguir» incompleto não libera e requer revalidação; «Prosseguir» completo libera; «Não
 * prosseguir» incompleto continua impedindo, marcado incompleto; nenhum fato antigo é reescrito. */
const candidatoDoac = () => {
  let x = reg(vazio(), "incapacitante_assumido", "Incapacitante");
  x = reg(x, "hora_inicio_observado", AGORA - 2 * H);
  x = comTc(x, "Sem hemorragia intracraniana identificada").e;
  x = reg(x, "motivo_para_suspeitar_alteracao_coagulacao", "nao");
  const col = I.nomeDaInstancia(LAB.COLETA, 1);
  for (const [c, v] of [["inr", 1.0], ["aptt", 30], ["tp", 12], ["plaquetas", 200], ["plaquetas_unidade", "mil/mm³ (×10³/µL)"]]) x = regI(x, col, c, v);
  return reg(reg(x, "anticoagulante_em_uso", PAC.ANTICOAGULANTE.doac), "doac_ultima_dose", "nao_sei");
};
const legado = (e, alvo, valor) => regI(e, SF.instanciaDoJulgamento(alvo), "julgamento_individual_registrado", valor);
const completa = (e, alvo, decisao, extra = {}) => DM.registrarDecisaoMedica(e, alvo, {
  decisao, justificativa: "", medico: "Dra. Teste", registroProfissional: "CRM 12345/SP", identificacao: "atestacao",
  criterios: [{ id: alvo, rotulo: "DOAC", categoria: "alerta", critico: false }], ...extra,
}, rel);
const soValor = (e, alvo, valor) => regI(e, SF.instanciaDoJulgamento(alvo), "julgamento_individual_registrado", valor);
const decisaoNoPortao = (e, alvo) => (portao(e).decisoesMedicas ?? []).filter((d) => d.alvo === alvo && d.vigente).pop();
bloco("D1393-NAO-INCOMPLETO", "«Não prosseguir» incompleto", () => {
  const base = candidatoDoac();
  const e = soValor(base, "doac", SF.DECISAO_DO_JULGAMENTO.naoProsseguir);
  conf("D1393-NAO-INCOMPLETO", "continua impedindo (`decisao_de_nao_prosseguir`)", portao(e).estado === "decisao_de_nao_prosseguir", `⛔ ${portao(e).estado}`);
  const d = decisaoNoPortao(e, "doac");
  conf("D1393-NAO-INCOMPLETO", "marcado como decisão incompleta", d !== undefined && d.completa === false, `⛔ ${JSON.stringify(d)}`);
  conf("D1393-NAO-INCOMPLETO", "o fato antigo não é reescrito", JSON.stringify(e.fatos) === JSON.stringify(soValor(base, "doac", SF.DECISAO_DO_JULGAMENTO.naoProsseguir).fatos) && portao(e) && e.fatos.length === base.fatos.length + 1, "⛔");
});
bloco("D1393-SIM-SO-VALOR", "«Prosseguir» só com o valor", () => {
  const base = candidatoDoac();
  conf("D1393-SIM-SO-VALOR", "controle do cenário: DOAC sem julgamento → pendente", portao(base).estado === "julgamento_individual_pendente", `⛔ ${portao(base).estado}`);
  const e = soValor(base, "doac", SF.DECISAO_DO_JULGAMENTO.prosseguir);
  const antes = JSON.stringify(e.fatos);
  conf("D1393-SIM-SO-VALOR", "não libera: o portão continua em julgamento pendente", portao(e).estado === "julgamento_individual_pendente", `⛔ ${portao(e).estado}`);
  const m = motivo(e, "doac");
  conf("D1393-SIM-SO-VALOR", "o motivo continua, com a decisão incompleta marcada para revalidação",
    m !== undefined && m.decisaoMedica?.completa === false && m.decisaoMedica?.requerRevalidacao === true, `⛔ ${JSON.stringify(m?.decisaoMedica)}`);
  conf("D1393-SIM-SO-VALOR", "derivar não reescreve a trilha", JSON.stringify(e.fatos) === antes, "⛔");
});
bloco("D1393-SIM-INCOMPLETO", "«Prosseguir» novo incompleto", () => {
  const e = completa(candidatoDoac(), "doac", "prosseguir", { registroProfissional: "" });
  conf("D1393-SIM-INCOMPLETO", "atestação sem CRM não libera", portao(e).estado === "julgamento_individual_pendente", `⛔ ${portao(e).estado}`);
  conf("D1393-SIM-INCOMPLETO", "e é marcada para revalidação", motivo(e, "doac")?.decisaoMedica?.requerRevalidacao === true, `⛔ ${JSON.stringify(motivo(e, "doac")?.decisaoMedica)}`);
});
bloco("D1393-SIM-COMPLETO", "«Prosseguir» completo", () => {
  const velho = soValor(candidatoDoac(), "doac", SF.DECISAO_DO_JULGAMENTO.prosseguir);
  const e = completa(velho, "doac", "prosseguir");
  conf("D1393-SIM-COMPLETO", "controle: a revalidação completa libera o motivo", motivo(e, "doac") === undefined, `⛔ ${portao(e).estado}`);
  conf("D1393-SIM-COMPLETO", "controle: a revalidação é novo registro; o anterior continua na trilha, intacto",
    e.fatos.filter((f) => f.campo === "julgamento_individual_registrado").length === 2 && velho.fatos.every((f, i) => JSON.stringify(e.fatos[i]) === JSON.stringify(f)), "⛔");
});
bloco("D1393-TELA", "a tela", () => {
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("D1393-TELA", "a tela diz «Decisão médica incompleta — requer revalidação»", /Decisão médica incompleta — requer revalidação/.test(telaF), "⛔ ausente");
  conf("D1393-TELA", "a tela nunca afirma «Decisão legada» (o dado não prova a idade)", !/Decisão legada/.test(telaF), "⛔ afirma o que o dado não prova");
});

const ordem = ["LIMPAR-TC", "LIMPAR-INR", "LIMPAR-DOIS-EXAMES", "LIMPAR-DIVERGENTES", "LIMPAR-DUAS-COLETAS", "LIMPAR-TELA",
  "AP5", "D-CMB", "D-TITULO", "D-GLOSA", "D-PORTAO", "AP6-OPCOES", "AP6-CALCULO", "DOSE-TETO",
  "D1393-NAO-INCOMPLETO", "D1393-SIM-SO-VALOR", "D1393-SIM-INCOMPLETO", "D1393-SIM-COMPLETO", "D1393-TELA"];
const VERMELHAS_DECLARADAS = {
  AP5: "commit 2 · AP-5 contextual",
  "D-CMB": "commit 2 · textos D",
  "D-TITULO": "commit 2 · textos D",
  "D-GLOSA": "commit 2 · textos D",
  "D-PORTAO": "commit 2 · textos D",
  "AP6-OPCOES": "commit 3 · AP-6",
  "AP6-CALCULO": "commit 3 · AP-6",
  "DOSE-TETO": "commit 3 · dose",
  "D1393-SIM-SO-VALOR": "commit 4 · D-139-3 por completude",
  "D1393-SIM-INCOMPLETO": "commit 4 · D-139-3 por completude",
  "D1393-TELA": "commit 4 · D-139-3 por completude",
};
let verdes = 0, declaradas = 0, divergencias = 0;
for (const id of Object.keys(VERMELHAS_DECLARADAS)) {
  if (!ordem.includes(id)) { divergencias++; console.log(`✗ ${id} declarada vermelha, mas a linha não existe`); }
}
for (const id of ordem) {
  const l = linhas.get(id) ?? { ok: 0, falhas: ["linha sem asserção"] };
  const vermelha = l.falhas.length > 0;
  const declarada = Object.prototype.hasOwnProperty.call(VERMELHAS_DECLARADAS, id);
  if (vermelha && declarada) { declaradas++; console.log(`🔴 ${id.padEnd(22)} vermelha declarada · ${VERMELHAS_DECLARADAS[id]}`); }
  else if (!vermelha && !declarada) { verdes++; console.log(`🟢 ${id.padEnd(22)} ${l.ok} ok`); }
  else if (vermelha) { divergencias++; console.log(`✗  ${id.padEnd(22)} VERMELHA NÃO DECLARADA`); }
  else { divergencias++; console.log(`✗  ${id.padEnd(22)} VERDE, mas declarada vermelha — remova da lista (${VERMELHAS_DECLARADAS[id]})`); }
  if (vermelha) for (const f of l.falhas) console.log(`      ✗ ${f}`);
}
console.log(`\n${divergencias === 0 ? "✅" : "❌"} PROVA · ARQ-APOIO-01 · F2 — ${verdes} verde(s) · ${declaradas} vermelha(s) declarada(s) · ${divergencias} divergência(s)`);
process.exit(divergencias === 0 ? 0 : 1);
