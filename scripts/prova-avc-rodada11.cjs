#!/usr/bin/env node
/**
 * PROVA · 11ª RODADA DO AVC — «Preciso de ajuda» global (fecha AC-10), piora por engano
 * (AC-67), eixos reabertos com a última avaliação, marcos da transferência como linha do
 * tempo com dois horários (AC-69) ⛔ e texto livre que confirma ao sair (AC-68).
 * Decisões do autor, 2026-09-13 (`docs/decisoes.md`, 11ª rodada).
 *
 * PROMETE:
 *  · «Preciso de ajuda» tem as cinco opções do PDF; cada uma, menos «paciente piorou»,
 *    tem ao menos um caminho para superfície ⛔ E registro de conduta externa (⛔ beco sem
 *    saída); «paciente piorou» chama o mecanismo existente; as opções sem conteúdo no
 *    módulo DIZEM isso ⛔ e ⛔ sugerem substituto; a conduta externa vira fato com horário ⛔ e
 *    entra na linha do tempo como registro da equipe.
 *  · Piora por engano: correção com motivo "registrado por engano" apontando o evento; o
 *    evento continua na trilha; sem reavaliação depois dele, a tarefa cai ⛔ e os eixos que
 *    estavam concluídos voltam; com reavaliação começada entre a piora ⛔ e a correção, a
 *    tarefa fica ⛔ e nada é desfeito; com reavaliação completa, ela fica.
 *  · Eixos reabertos: a avaliação de antes da piora (estado, valor, hora) é lida da trilha
 *    até o evento; fato novo depois ⛔ a sobrescreve; eixo sem dado diz que ⛔ havia dado.
 *  · Marcos: registrados com horário observado; o horário de registro é preservado mesmo
 *    depois de corrigir o observado; ordem ⛔ e estado atual pelo observado; correção por
 *    engano atinge ⛔ só aquele marco; chegada sem saída é tolerada ⛔ e a síntese avisa; o
 *    campo antigo de "estado" sumiu.
 *  · AC-68: o campo de texto ⛔ grava por alteração; grava ao sair ou em «Registrar».
 *  · A tela: «Preciso de ajuda» fora da rolagem, faixa de retorno, correção da piora ⛔ e
 *    avaliação anterior ligadas.
 * NÃO PROMETE: 375 px, retorno com a rolagem restaurada, ES ⛔ e o gesto real (isso é
 *   `e2e/avc-preciso-de-ajuda.spec.ts` ⛔ e `e2e/avc-rodada11.spec.ts`); a porta 4173
 *   (`prova-porta-e2e.cjs`).
 * UNIVERSO: `avc/conteudo/ajuda.ts`, `avc/nucleo/{ajuda,deterioracao,avaliacao-anterior,
 *   transferencia,sintese-do-caso}.ts`, `components/avc/{avc-modulo-screen,campos-clinicos}.tsx`.
 * FONTE: `docs/decisoes.md` — decisões da 11ª rodada. ⛔ Nenhum conteúdo clínico novo.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada11-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const arq = (...p) => path.join(appDir, ...p);
const fontes = [arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "ameacas-imediatas.ts"),
  arq("avc", "nucleo", "sintese-do-caso.ts"), arq("avc", "nucleo", "deterioracao.ts"), arq("avc", "nucleo", "transferencia.ts"),
  arq("avc", "conteudo", "campos.ts")];
for (const novo of [arq("avc", "nucleo", "ajuda.ts"), arq("avc", "nucleo", "avaliacao-anterior.ts"), arq("avc", "conteudo", "ajuda.ts")]) {
  if (fs.existsSync(novo)) fontes.push(novo);
}
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => require(path.join(tmp, ...p));
const opcional = (...p) => (fs.existsSync(path.join(tmp, ...p)) ? require(path.join(tmp, ...p)) : undefined);
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const AM = emT("avc", "nucleo", "ameacas-imediatas.js");
const S = emT("avc", "nucleo", "sintese-do-caso.js");
const D = emT("avc", "nucleo", "deterioracao.js");
const T = emT("avc", "nucleo", "transferencia.js");
const K = emT("avc", "conteudo", "campos.js");
const AJ = opcional("avc", "nucleo", "ajuda.js");
const CAJ = opcional("avc", "conteudo", "ajuda.js");
const AA = opcional("avc", "nucleo", "avaliacao-anterior.js");

const MIN = 60_000;
/** ⚠️ Ajuste consciente (autor, 2026-09-15): ⛔ há eixo E. */
const EIXOS = ["via_aerea", "respiracao", "pressao", "glicemia"];

/* ══ 1 · «PRECISO DE AJUDA» ══════════════════════════════════════════════ */
conf("os módulos de ajuda existem (conteúdo ⛔ e registro)",
  CAJ !== undefined && Array.isArray(CAJ.OPCOES_DE_AJUDA) && AJ !== undefined
    && typeof AJ.registrarCondutaExterna === "function" && typeof AJ.condutasExternas === "function",
  "⛔ avc/conteudo/ajuda.ts ou avc/nucleo/ajuda.ts ausente");
if (CAJ !== undefined && AJ !== undefined) {
  const ops = CAJ.OPCOES_DE_AJUDA;
  const PDF = ["nao_sei_avaliar", "sem_medicamento", "sem_equipamento", "nao_melhorou", "paciente_piorou"];
  conf("as cinco opções do PDF, na ordem", JSON.stringify(ops.map((o) => o.id)) === JSON.stringify(PDF), `⛔ ${ops.map((o) => o.id)}`);
  const piorou = ops.find((o) => o.id === "paciente_piorou");
  conf("«paciente piorou» chama o mecanismo existente", piorou !== undefined && piorou.abrePiora === true, `⛔ ${JSON.stringify(piorou)}`);
  const SUPERFICIES = new Set(["paciente", "estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino", "laboratorio", "correcoes"]);
  for (const o of ops.filter((x) => x.id !== "paciente_piorou")) {
    conf(`${o.id} · ⛔ beco sem saída: ao menos um caminho válido ⛔ e registro de conduta externa`,
      Array.isArray(o.caminhos) && o.caminhos.length > 0 && o.caminhos.every((c) => SUPERFICIES.has(c.superficie) && c.rotulo)
        && o.registraCondutaExterna === true && typeof o.texto === "string" && o.texto.length > 0,
      `⛔ ${JSON.stringify(o)}`);
  }
  for (const id of ["sem_medicamento", "sem_equipamento", "nao_melhorou"]) {
    const o = ops.find((x) => x.id === id);
    conf(`${id} · diz que o módulo ⛔ tem conteúdo ⛔ e ⛔ sugere substituto`,
      o !== undefined && /não tem conteúdo/i.test(o.texto) && !/\d|\bmg\b|use |administr/i.test(o.texto),
      `⛔ ${o && o.texto}`);
  }
  const rel = R.relogioControlado(1_800_000_000_000);
  const e0 = E.abrirAtendimento(rel);
  conf("conduta externa vazia ⛔ registra nada", AJ.registrarCondutaExterna(e0, "sem_medicamento", "   ", rel).fatos.length === 0, "⛔ fato vazio");
  const e1 = AJ.registrarCondutaExterna(e0, "sem_medicamento", " acionada farmácia de outro hospital ", rel);
  const cx = AJ.condutasExternas(e1);
  conf("conduta externa vira fato com horário, opção ⛔ e texto aparado",
    cx.length === 1 && cx[0].opcao === "sem_medicamento" && cx[0].texto === "acionada farmácia de outro hospital" && cx[0].quando === rel.agora(),
    `⛔ ${JSON.stringify(cx)}`);
  const item = T.linhaDoTempoDoCaso(e1).find((i) => i.ator === "ajuda");
  conf("… ⛔ e entra na linha do tempo como registro da equipe, ⛔ não como execução do app",
    item !== undefined && /Conduta externa registrada/.test(item.texto) && item.detalhe === "acionada farmácia de outro hospital",
    `⛔ ${JSON.stringify(T.linhaDoTempoDoCaso(e1))}`);
}

/* ══ 2 · PIORA POR ENGANO (AC-67) ════════════════════════════════════════ */
conf("a correção da piora existe", typeof D.corrigirPioraPorEngano === "function", "⛔ corrigirPioraPorEngano ausente");
if (typeof D.corrigirPioraPorEngano === "function") {
  const rel = R.relogioControlado(1_800_000_000_000);
  const base = E.concluirEixo(E.concluirEixo(E.abrirAtendimento(rel), "via_aerea"), "pressao");
  const piorou = D.registrarPiora(base, "", rel);
  const evento = D.eventosDePiora(piorou)[0];

  /* A · sem reavaliação depois */
  const semReav = D.corrigirPioraPorEngano(piorou, evento.fatoId, rel);
  const correcao = semReav.fatos[semReav.fatos.length - 1];
  conf("A · correção com motivo «registrado por engano» apontando o evento",
    correcao.corrigeFatoId === evento.fatoId && correcao.motivo === "registrado por engano", `⛔ ${JSON.stringify(correcao)}`);
  const evs = D.eventosDePiora(semReav);
  conf("A · o evento ⛔ some: continua na trilha marcado como engano", evs.length === 1 && evs[0].engano === true, `⛔ ${JSON.stringify(evs)}`);
  conf("A · sem reavaliação depois → a tarefa cai", D.reavaliacaoPendente(semReav) === undefined, "⛔ tarefa ficou");
  conf("A · ⛔ e os eixos concluídos antes voltam", ["via_aerea", "pressao"].every((x) => semReav.eixosConcluidos.includes(x)), `⛔ ${semReav.eixosConcluidos}`);
  const linhaA = T.linhaDoTempoDoCaso(semReav).find((i) => i.ator === "piora");
  conf("A · a linha do tempo mostra a piora COM a correção", linhaA !== undefined && linhaA.nota === "registrado por engano", `⛔ ${JSON.stringify(linhaA)}`);

  /* B · reavaliação começada entre a piora ⛔ e a correção */
  const comReav = E.registrarFato(piorou, { campo: "hipoxia", valor: "nao" }, rel);
  const corrB = D.corrigirPioraPorEngano(comReav, evento.fatoId, rel);
  conf("B · reavaliação começada → a tarefa fica", D.reavaliacaoPendente(corrB) !== undefined, "⛔ tarefa caiu");
  conf("B · ⛔ nada é desfeito: o fato da reavaliação fica ⛔ e os eixos ⛔ voltam a concluídos",
    corrB.fatos.some((f) => f.campo === "hipoxia") && !corrB.eixosConcluidos.includes("via_aerea"), `⛔ ${corrB.eixosConcluidos}`);
  const depois = E.registrarFato(semReav, { campo: "hipoxia", valor: "nao" }, rel);
  conf("B · fato de estabilização DEPOIS da correção ⛔ ressuscita a tarefa", D.reavaliacaoPendente(depois) === undefined, "⛔ tarefa voltou");

  /* C · reavaliação completa */
  const completa = EIXOS.reduce((x, eixo) => E.concluirEixo(x, eixo), piorou);
  const corrC = D.corrigirPioraPorEngano(completa, evento.fatoId, rel);
  conf("C · reavaliação completa → fica: eixos concluídos ⛔ e ⛔ tarefa", EIXOS.every((x) => corrC.eixosConcluidos.includes(x)) && D.reavaliacaoPendente(corrC) === undefined, "⛔");
  conf("uma piora ⛔ corrigida continua gerando a tarefa (controle)", D.reavaliacaoPendente(piorou) !== undefined, "⛔");
}

/* ══ 3 · EIXOS REABERTOS COM A ÚLTIMA AVALIAÇÃO ═════════════════════════ */
conf("a leitura da avaliação anterior existe", AA !== undefined && typeof AA.avaliacaoAntesDaPiora === "function", "⛔ avc/nucleo/avaliacao-anterior.ts ausente");
if (AA !== undefined) {
  const rel = R.relogioControlado(1_800_000_000_000);
  const t0 = rel.agora();
  let e = E.registrarFato(E.abrirAtendimento(rel), { campo: "consciencia_rebaixada", valor: "nao" }, rel);
  rel.avancar(MIN);
  e = E.registrarFato(e, { campo: "hipoxia", valor: "sim" }, rel);
  const antes = AM.ameacasImediatas(e);
  conf("sem piora ⛔ há avaliação anterior", AA.avaliacaoAntesDaPiora(e) === undefined, "⛔");
  rel.avancar(10 * MIN);
  e = D.registrarPiora(e, "", rel);
  rel.avancar(MIN);
  e = E.registrarFato(e, { campo: "hipoxia", valor: "nao" }, rel);
  const ant = AA.avaliacaoAntesDaPiora(e);
  const resp = ant && ant.find((x) => x.id === "respiracao");
  const via = ant && ant.find((x) => x.id === "via_aerea");
  const expo = ant && ant.find((x) => x.id === "glicemia");
  conf("respiração · estado ⛔ e hora de ANTES da piora", resp !== undefined && resp.estado === antes.find((x) => x.id === "respiracao").estado && resp.quando === t0 + MIN,
    `⛔ ${JSON.stringify(resp)}`);
  conf("⛔ o fato novo depois da piora ⛔ sobrescreve a avaliação anterior",
    resp !== undefined && AM.ameacasImediatas(e).find((x) => x.id === "respiracao").estado !== resp.estado, `⛔ ${JSON.stringify(AM.ameacasImediatas(e).find((x) => x.id === "respiracao"))}`);
  conf("via aérea · hora do registro anterior", via !== undefined && via.quando === t0, `⛔ ${JSON.stringify(via)}`);
  conf("eixo sem dado antes da piora diz ⛔ sem dado (⛔ vazio silencioso)", expo !== undefined && expo.quando === undefined && expo.semDados === true, `⛔ ${JSON.stringify(expo)}`);
  conf("os quatro eixos estão na leitura", ant !== undefined && EIXOS.every((x) => ant.some((a) => a.id === x)), `⛔ ${ant && ant.map((a) => a.id)}`);
}

/* ══ 4 · MARCOS DA TRANSFERÊNCIA (AC-69) ═════════════════════════════════ */
conf("as ações dos marcos existem", ["registrarMarco", "corrigirHorarioDoMarco", "marcoPorEngano", "marcosDaTransferencia"].every((n) => typeof T[n] === "function"),
  `⛔ ${["registrarMarco", "corrigirHorarioDoMarco", "marcoPorEngano", "marcosDaTransferencia"].filter((n) => typeof T[n] !== "function")}`);
conf("o campo de ESTADO da transferência sumiu (⛔ seletor)", !K.todosOsCampos().some((c) => c.id === "transf_estado") && K.todosOsCampos().some((c) => c.id === "transf_marco"),
  "⛔ transf_estado ainda existe ou transf_marco ausente");
if (["registrarMarco", "corrigirHorarioDoMarco", "marcoPorEngano", "marcosDaTransferencia"].every((n) => typeof T[n] === "function")) {
  const rel = R.relogioControlado(1_800_000_000_000);
  const t = rel.agora();
  let e = T.registrarMarco(E.abrirAtendimento(rel), "Solicitada", t - 30 * MIN, rel);
  rel.avancar(2 * MIN);
  const registroDaChegada = rel.agora();
  e = T.registrarMarco(e, "Chegada", t - 5 * MIN, rel);
  let m = T.marcosDaTransferencia(e);
  conf("marcos com observado ⛔ e registrado distintos", m.length === 2 && m[1].tipo === "Chegada" && m[1].observado === t - 5 * MIN && m[1].registradoEm === registroDaChegada,
    `⛔ ${JSON.stringify(m)}`);
  const s = S.sinteseDoCaso(e, rel, []);
  conf("chegada sem saída é tolerada ⛔ e a síntese avisa", s.situacao.some((l) => l.id === "saida-nao-registrada"), `⛔ ${JSON.stringify(s.situacao)}`);
  rel.avancar(3 * MIN);
  const chegadaId = m[1].fatoId;
  e = T.corrigirHorarioDoMarco(e, chegadaId, t - 8 * MIN, rel);
  m = T.marcosDaTransferencia(e);
  const chegada = m.find((x) => x.tipo === "Chegada");
  conf("corrigir o observado preserva o horário de registro original", chegada !== undefined && chegada.observado === t - 8 * MIN && chegada.registradoEm === registroDaChegada,
    `⛔ ${JSON.stringify(m)}`);
  const item = T.linhaDoTempoDoCaso(e).find((i) => i.texto === "Chegada ao destino");
  conf("linha do tempo: hora real ⛔ e «registrado às» (dois horários)", item !== undefined && item.quando === t - 8 * MIN && item.registradoEm === registroDaChegada,
    `⛔ ${JSON.stringify(item)}`);
  e = T.registrarMarco(e, "Saída", t - 20 * MIN, rel);
  conf("ordem ⛔ e estado atual pelo horário OBSERVADO, ⛔ pela ordem de registro",
    T.marcosDaTransferencia(e).map((x) => x.tipo).join(">") === "Solicitada>Saída>Chegada" && T.leituraDaTransferencia(e).estado === "Chegada",
    `⛔ ${T.marcosDaTransferencia(e).map((x) => x.tipo)} · ${T.leituraDaTransferencia(e).estado}`);
  const solicitadaId = T.marcosDaTransferencia(e).find((x) => x.tipo === "Solicitada").fatoId;
  const eng = T.marcoPorEngano(e, solicitadaId, rel);
  const ultimo = eng.fatos[eng.fatos.length - 1];
  conf("engano por marco: correção auditada ⛔ só naquele marco",
    ultimo.corrigeFatoId === solicitadaId && ultimo.motivo === "registrado por engano"
      && T.marcosDaTransferencia(eng).map((x) => x.tipo).join(">") === "Saída>Chegada",
    `⛔ ${JSON.stringify(ultimo)} · ${T.marcosDaTransferencia(eng).map((x) => x.tipo)}`);
}

/* ══ 5 · AC-68 · TEXTO LIVRE CONFIRMA AO SAIR ═══════════════════════════ */
{
  const cc = lerFonte(arq("components", "avc", "campos-clinicos.tsx"));
  /** ⚠️ Fim da função = `}` sozinho na linha (a assinatura tem `}) {`, ⛔ que ⛔ é o fim). */
  const bloco = (cc.match(/export function CampoDeTexto\([\s\S]*?\n\}\n/) || [""])[0];
  const aoMudar = (bloco.match(/onChangeText=\{([^}]*)\}/) || [, ""])[1];
  conf("AC-68 · ⛔ grava por alteração: onChangeText existe ⛔ e ⛔ chama onEscrever/onDesfazer",
    aoMudar !== "" && !/onEscrever|onDesfazer/.test(aoMudar), `⛔ onChangeText = «${aoMudar}»`);
  conf("AC-68 · grava ao sair do campo", /onBlur=\{/.test(bloco), "⛔ sem onBlur");
  conf("AC-68 · ⛔ e em «Registrar»", /avc-texto-registrar-/.test(bloco), "⛔ sem botão Registrar");
}

/* ══ 6 · A TELA ══════════════════════════════════════════════════════════ */
{
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  const antesDaRolagem = tela.slice(0, Math.max(0, tela.search(/<ScrollView\s+ref=/)));
  conf("a tela: «Preciso de ajuda» mora FORA da rolagem", /<BotaoPrecisoDeAjuda/.test(antesDaRolagem), "⛔");
  conf("a tela: faixa de retorno ao ponto de origem", /avc-ajuda-retorno/.test(tela), "⛔");
  conf("a tela: correção da piora por engano ligada", /corrigirPioraPorEngano\(/.test(tela), "⛔");
  conf("a tela: eixos reabertos leem a avaliação anterior", /avaliacaoAntesDaPiora\(/.test(tela) && /avc-ameaca-anterior-/.test(tela), "⛔");
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · 11ª RODADA — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
