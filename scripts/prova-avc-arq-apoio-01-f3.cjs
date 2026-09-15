#!/usr/bin/env node
/**
 * PROVA · ARQ-APOIO-01 · F3 — desfechos negativos e frases da ordem temporal (autor, 2026-09-15).
 *
 * PROMETE:
 *  (as linhas não marcadas como controle nasceram vermelhas no HEAD 242825a)
 *  · 5c: motivo + hora conhecida = desfecho completo; motivo + hora EXPLICITAMENTE desconhecida = desfecho completo, sem
 *    instante; motivo sem hora respondida = incompleto. Hora declarada desconhecida some da pendência, abre o caminho
 *    sem reperfusão e nenhum prazo é calculado a partir dela. Com uma hora conhecida e outra desconhecida, ⛔ se fabrica
 *    horário global: a origem do caminho fica sem instante, e cada desfecho guarda a sua própria hora;
 *  · 5b (controle): o desfecho é registro de evento — completa sem médico nem CRM/UF, sem o formulário da F1;
 *  · 5d (controle): o «Não prosseguir» do julgamento do portão ⛔ preenche o desfecho da IVT, ⛔ e o desfecho ⛔ vira decisão
 *    médica — sem unificação, sem migração, sem inferência;
 *  · `ivt_indicacao_confirmada` fica: nenhuma derivação o lê (controle), ⛔ a tela diz que ele ⛔ altera veredito,
 *    elegibilidade ⛔ exposição;
 *  · a frase da ordem temporal indeterminada entre trombolítico e hemorragia é a do autor.
 * NÃO PROMETE: AP-4, formulário médico nos desfechos, unificação dos dois «não prosseguir»; a tela é medida em
 *   `e2e/avc-arq-apoio-01-f3.spec.ts`.
 * UNIVERSO: `avc/nucleo/{plano-48h,caminho-hemorragico,decisao-medica,derivacoes-d}.ts`, `avc/conteudo/{plano-48h,superficie-f}.ts`,
 *   `components/avc/{desfecho-negativo,plano-48h,superficie-f}.tsx`.
 * FONTE: decisões do autor de 2026-09-15 (F3: 5b, 5c, 5d, `ivt_indicacao_confirmada`, frase temporal).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arq-apoio-01-f3-"));
const fontes = [
  ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "nucleo", "plano-48h.ts"], ["avc", "nucleo", "instancia.ts"],
  ["avc", "nucleo", "decisao-medica.ts"], ["avc", "nucleo", "derivacoes-d.ts"], ["avc", "nucleo", "caminho-hemorragico.ts"],
  ["avc", "conteudo", "campos.ts"], ["avc", "conteudo", "campo.ts"], ["avc", "conteudo", "superficie-f.ts"], ["avc", "conteudo", "plano-48h.ts"],
  ["avc", "conteudo", "paciente.ts"],
].map((p) => path.join(appDir, ...p));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const P = emT("avc", "nucleo", "plano-48h.js");
const I = emT("avc", "nucleo", "instancia.js");
const DM = emT("avc", "nucleo", "decisao-medica.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const PAC = emT("avc", "conteudo", "paciente.js");

const linhas = new Map();
function conf(id, nome, cond, porque) {
  const l = linhas.get(id) ?? { ok: 0, falhas: [] };
  if (cond) l.ok++; else l.falhas.push(`${nome} — ${porque}`);
  linhas.set(id, l);
}
function bloco(id, nome, fn) {
  try { fn(); } catch (e) { conf(id, nome, false, `exceção: ${String(e && e.message).slice(0, 180)}`); }
}

const MIN = 60_000;
const T0 = 1_800_000_000_000;
const rel = R.relogioControlado(T0);
const vazio = () => E.abrirAtendimento(rel);
const reg = (e, c, v, extra = {}) => E.registrarFato(e, { campo: c, valor: v, ...extra }, rel);
/** hora: número (conhecida) · "nao_sei" (explicitamente desconhecida) · undefined (⛔ respondida). */
const hora = (e, campo, h) => (h === undefined ? e : typeof h === "number" ? reg(e, campo, h, { horaClinica: h }) : reg(e, campo, h));
const ivt = (e, motivo, h) => hora(motivo === undefined ? e : reg(e, "ivt_nao_prosseguir_motivo", motivo), "ivt_nao_prosseguir_hora", h);
const evt = (e, motivo, h) => hora(motivo === undefined ? e : reg(e, "evt_desfecho_motivo", motivo), "evt_desfecho_hora", h);
const plano = (e) => P.planoAte48h(e, T0 + 60 * MIN);
const semReperfusao = (e) => plano(e).caminhos.find((c) => c.id === "sem_reperfusao");
const pend = (e) => P.pendenciasDoPlano(e);

/* ══ 5c · horário conhecido, explicitamente desconhecido, ⛔ respondido ══════ */
bloco("F3-CONHECIDA", "controle", () => {
  const d = P.desfechosNegativos(ivt(vazio(), "Sem indicação", T0));
  conf("F3-CONHECIDA", "controle: motivo + hora conhecida → desfecho da IVT completo, com o instante", d.ivt.completo === true && d.ivt.instante === T0, `⛔ ${JSON.stringify(d.ivt)}`);
});
bloco("F3-DESCONHECIDA-IVT", "IVT", () => {
  const d = P.desfechosNegativos(ivt(vazio(), "Sem indicação", "nao_sei"));
  conf("F3-DESCONHECIDA-IVT", "motivo + «Horário desconhecido» → desfecho da IVT completo, sem instante, marcado desconhecido",
    d.ivt.completo === true && d.ivt.instante === undefined && d.ivt.horaDesconhecida === true, `⛔ ${JSON.stringify(d.ivt)}`);
});
bloco("F3-DESCONHECIDA-EVT", "EVT", () => {
  const d = P.desfechosNegativos(evt(vazio(), "Indisponível", "nao_sei"));
  conf("F3-DESCONHECIDA-EVT", "motivo + «Horário desconhecido» → desfecho da EVT completo, sem instante, marcado desconhecido",
    d.evt.completo === true && d.evt.instante === undefined && d.evt.horaDesconhecida === true, `⛔ ${JSON.stringify(d.evt)}`);
});
bloco("F3-NAO-RESPONDIDA", "controle", () => {
  const d = P.desfechosNegativos(ivt(evt(vazio(), undefined, "nao_sei"), "Impedida", undefined));
  conf("F3-NAO-RESPONDIDA", "controle: motivo sem hora respondida → incompleto", d.ivt.completo === false, `⛔ ${JSON.stringify(d.ivt)}`);
  conf("F3-NAO-RESPONDIDA", "controle: hora desconhecida sem motivo → incompleto", d.evt.completo === false, `⛔ ${JSON.stringify(d.evt)}`);
});
bloco("F3-PENDENCIA", "a pendência", () => {
  const ambos = evt(ivt(vazio(), "Sem indicação", "nao_sei"), "Indisponível", "nao_sei");
  conf("F3-PENDENCIA", "as duas horas declaradas desconhecidas → nenhuma pendência pede horário", pend(ambos).length === 0, `⛔ ${JSON.stringify(pend(ambos).map((p) => p.rotulo))}`);
  const soIvt = ivt(vazio(), "Sem indicação", "nao_sei");
  const rotulo = pend(soIvt).map((p) => p.rotulo).join(" | ");
  conf("F3-PENDENCIA", "IVT com hora desconhecida ⛔ EVT pendente → pede só o desfecho da trombectomia", /trombectomia/i.test(rotulo) && !/trombólise/i.test(rotulo), `⛔ ${rotulo}`);
  const semHora = evt(ivt(vazio(), "Impedida", undefined), "Impedida", undefined);
  conf("F3-PENDENCIA", "controle: motivo sem hora respondida → a pendência continua pedindo o horário", pend(semHora).some((p) => /horário/i.test(p.rotulo)), `⛔ ${JSON.stringify(pend(semHora))}`);
});
bloco("F3-CAMINHO-DESCONHECIDO", "caminho sem reperfusão", () => {
  const c = semReperfusao(evt(ivt(vazio(), "Sem indicação", "nao_sei"), "Indisponível", "nao_sei"));
  conf("F3-CAMINHO-DESCONHECIDO", "as duas horas desconhecidas → o caminho sem reperfusão abre, sem instante, marcado desconhecido",
    c !== undefined && c.origem.instante === undefined && c.origem.horaDesconhecida === true, `⛔ ${JSON.stringify(c?.origem)}`);
  conf("F3-CAMINHO-DESCONHECIDO", "… ⛔ nenhuma tarefa ganha prazo calculado a partir de hora desconhecida",
    c !== undefined && c.tarefas.every((t) => t.quando.instante === undefined), `⛔ ${JSON.stringify(c?.tarefas.map((t) => [t.id, t.quando]))}`);
});
bloco("F3-CAMINHO-MISTO", "uma conhecida, outra desconhecida", () => {
  const e = evt(ivt(vazio(), "Sem indicação", T0), "Indisponível", "nao_sei");
  const c = semReperfusao(e);
  conf("F3-CAMINHO-MISTO", "o caminho abre ⛔ ⛔ fabrica horário global: origem sem instante, marcada desconhecida",
    c !== undefined && c.origem.instante === undefined && c.origem.horaDesconhecida === true, `⛔ ${JSON.stringify(c?.origem)}`);
  const d = P.desfechosNegativos(e);
  conf("F3-CAMINHO-MISTO", "… cada desfecho guarda a sua hora: IVT com o instante conhecido, EVT desconhecida",
    d.ivt.instante === T0 && d.evt.instante === undefined && d.evt.horaDesconhecida === true, `⛔ ${JSON.stringify(d)}`);
});
bloco("F3-NUMERICO", "controle", () => {
  const e = evt(ivt(vazio(), "Sem indicação", T0), "Indisponível", T0 + 10 * MIN);
  const c = semReperfusao(e);
  conf("F3-NUMERICO", "controle: as duas horas conhecidas → origem = o último desfecho, sem pendência",
    c?.origem.instante === T0 + 10 * MIN && c?.origem.horaDesconhecida === false && pend(e).length === 0, `⛔ ${JSON.stringify(c?.origem)}`);
});
bloco("F3-GLOBAL", "controle", () => {
  const e = P.registrarDecisaoGlobalDeNaoReperfundir(vazio(), "Recusa do paciente ou família", T0, rel);
  conf("F3-GLOBAL", "controle: a decisão global grava motivo ⛔ horário nos dois ⛔ abre o caminho com o horário",
    semReperfusao(e)?.origem.instante === T0 && pend(e).length === 0, `⛔ ${JSON.stringify(semReperfusao(e)?.origem)}`);
});
bloco("F3-CORRIGIDO", "correção", () => {
  const completo = evt(ivt(vazio(), "Sem indicação", "nao_sei"), "Indisponível", "nao_sei");
  const corrigido = K.corrigirNaInstancia(completo, { campo: "ivt_nao_prosseguir_hora", valor: "nao_perguntado" }, rel);
  const p = plano(corrigido);
  conf("F3-CORRIGIDO", "desfecho completo com hora desconhecida, hora limpa depois → caminho encerrado «Desfecho negativo corrigido»",
    !p.caminhos.some((c) => c.id === "sem_reperfusao") && p.encerrados.some((x) => x.caminho === "sem_reperfusao"), `⛔ ${JSON.stringify({ caminhos: p.caminhos.map((c) => c.id), encerrados: p.encerrados })}`);
});
bloco("F3-EXPOSTA", "controle", () => {
  const inst = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
  let e = evt(ivt(vazio(), "Sem indicação", "nao_sei"), "Indisponível", "nao_sei");
  e = K.registrarComInstancia(e, { campo: "ivt_estado", valor: CAMPO.valorDaOpcao("Iniciada") }, rel, inst);
  e = K.registrarComInstancia(e, { campo: "ivt_inicio", valor: T0 }, rel, inst);
  conf("F3-EXPOSTA", "controle: com trombólise administrada ⛔ abre sem reperfusão", semReperfusao(e) === undefined && pend(e).length === 0, `⛔ ${JSON.stringify(plano(e).caminhos.map((c) => c.id))}`);
});

/* ══ 5b · evento, ⛔ decisão médica (controle) ═════════════════════════════ */
bloco("F3-EVENTO", "sem formulário médico", () => {
  const e = evt(ivt(vazio(), "Recusa do paciente ou família", T0), "Centro de referência recusou", T0);
  conf("F3-EVENTO", "controle: completa sem médico, identificação nem CRM/UF", P.desfechosNegativos(e).ivt.completo && P.desfechosNegativos(e).evt.completo
    && !e.fatos.some((f) => /^decisao_/.test(f.campo)), "⛔ exige algo além de motivo e hora");
  const nucleo = lerFonte(path.join(appDir, "avc", "nucleo", "plano-48h.ts"));
  const tela = lerFonte(path.join(appDir, "components", "avc", "desfecho-negativo.tsx"));
  conf("F3-EVENTO", "controle: o desfecho ⛔ passa pelo formulário nem pela regra de completude da F1",
    !/decisao-medica|requisitosFaltantes|faltaNaDecisao/.test(nucleo) && !/RegistroDeDecisaoMedica|CAMPOS_DA_DECISAO_MEDICA/.test(tela), "⛔ formulário médico no desfecho");
});

/* ══ 5d · os dois «não prosseguir» ⛔ se inferem (controle) ═══════════════ */
bloco("F3-SEM-UNIFICACAO", "julgamento × desfecho", () => {
  let x = reg(vazio(), "anticoagulante_em_uso", PAC.ANTICOAGULANTE.doac);
  x = reg(x, "doac_ultima_dose", "nao_sei");
  const julgado = K.registrarComInstancia(x, { campo: "julgamento_individual_registrado", valor: SF.DECISAO_DO_JULGAMENTO.naoProsseguir }, rel, SF.instanciaDoJulgamento("doac"));
  const d = P.desfechosNegativos(julgado);
  conf("F3-SEM-UNIFICACAO", "controle: «Não prosseguir» do julgamento ⛔ preenche o desfecho da IVT ⛔ abre sem reperfusão",
    d.ivt.motivo === undefined && d.ivt.completo === false && semReperfusao(julgado) === undefined && pend(julgado).length === 0, `⛔ ${JSON.stringify(d.ivt)}`);
  const desfecho = ivt(vazio(), "Decisão da equipe / limitação terapêutica", T0);
  conf("F3-SEM-UNIFICACAO", "controle: o desfecho da IVT ⛔ vira decisão médica ⛔ julgamento registrado",
    DM.decisoesMedicasRegistradas(desfecho).length === 0 && DD.julgamentoRegistrado(desfecho, "doac") === undefined
      && !desfecho.fatos.some((f) => f.campo === "julgamento_individual_registrado"), "⛔ inferência entre os dois");
});

/* ══ `ivt_indicacao_confirmada` · mantido, ⛔ dito ══════════════════════════ */
bloco("F3-INDICACAO", "registro da decisão de prosseguir", () => {
  const leitores = fs.readdirSync(path.join(appDir, "avc", "nucleo")).filter((f) => f.endsWith(".ts"))
    .filter((f) => /ivt_indicacao_confirmada/.test(lerFonte(path.join(appDir, "avc", "nucleo", f))));
  conf("F3-INDICACAO", "controle: nenhuma derivação lê `ivt_indicacao_confirmada` (⛔ altera veredito, elegibilidade ⛔ exposição)", leitores.length === 0, `⛔ ${leitores.join(", ")}`);
  const campo = K.campoDoModulo("ivt_indicacao_confirmada");
  conf("F3-INDICACAO", "controle: o campo continua (os fatos antigos seguem legíveis)", campo !== undefined && (campo.opcoes ?? []).length === 2, "⛔ campo removido");
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("F3-INDICACAO", "a tela diz, visível junto do gesto, que o registro ⛔ altera veredito, elegibilidade ⛔ exposição",
    /avc-f-decisao-ivt-nota/.test(telaF)
      && /Registro da decisão médica de prosseguir\. Não altera o veredito, não cria elegibilidade e não significa administração\./.test(telaF), "⛔ só a nota antiga, atrás do ⓘ");
});

/* ══ frase da ordem temporal (item 9) ══════════════════════════════════════ */
bloco("F3-FRASE-INDETERMINADA", "ordem indeterminável", () => {
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("F3-FRASE-INDETERMINADA", "a frase do autor",
    /tr\("Administração de trombolítico registrada; hemorragia identificada na imagem\. Os horários disponíveis não permitem determinar qual ocorreu primeiro\."\)/.test(telaF), "⛔ ausente");
  conf("F3-FRASE-INDETERMINADA", "a redação anterior saiu", !/os horários registrados não permitem ordenar os dois/.test(telaF), "⛔ ainda presente");
});
bloco("F3-FRASE-POSTERIOR", "hemorragia comprovadamente posterior", () => {
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("F3-FRASE-POSTERIOR", "«Hemorragia identificada após a administração do trombolítico.» (autor, 2026-09-15)",
    /tr\("Hemorragia identificada após a administração do trombolítico\."\)/.test(telaF), "⛔ ainda «… hemorragia identificada posteriormente»");
});

bloco("F3-FRASE-BLOQUEIO", "bloqueio já conhecido antes da administração", () => {
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  conf("F3-FRASE-BLOQUEIO", "«Administração de trombolítico registrada após identificação do bloqueio.» (autor, 2026-09-15: sequência, ⛔ julgamento)",
    /sequenciaComHemorragia === "apesar_de_bloqueio"\s*\? tr\("Administração de trombolítico registrada após identificação do bloqueio\."\)/.test(telaF), "⛔ ainda «apesar de bloqueio»");
});

const ordem = ["F3-CONHECIDA", "F3-DESCONHECIDA-IVT", "F3-DESCONHECIDA-EVT", "F3-NAO-RESPONDIDA", "F3-PENDENCIA", "F3-CAMINHO-DESCONHECIDO",
  "F3-CAMINHO-MISTO", "F3-NUMERICO", "F3-GLOBAL", "F3-CORRIGIDO", "F3-EXPOSTA", "F3-EVENTO", "F3-SEM-UNIFICACAO", "F3-INDICACAO",
  "F3-FRASE-INDETERMINADA", "F3-FRASE-POSTERIOR", "F3-FRASE-BLOQUEIO"];
let verdes = 0, vermelhas = 0;
for (const id of ordem) {
  const l = linhas.get(id) ?? { ok: 0, falhas: ["linha sem asserção"] };
  if (l.falhas.length === 0) { verdes++; console.log(`🟢 ${id.padEnd(24)} ${l.ok} ok`); }
  else { vermelhas++; console.log(`🔴 ${id.padEnd(24)} ${l.ok} ok · ${l.falhas.length} falha(s)`); for (const f of l.falhas) console.log(`      ✗ ${f}`); }
}
console.log(`\n${vermelhas === 0 ? "✅" : "❌"} PROVA · ARQ-APOIO-01 · F3 — ${verdes} linha(s) verde(s) · ${vermelhas} linha(s) vermelha(s)`);
process.exit(vermelhas === 0 ? 0 : 1);
