#!/usr/bin/env node
/**
 * PROVA · «PACIENTE PIOROU» GLOBAL (AC-10, A11) ⛔ E TRANSFERÊNCIA/TELESTROKE (T07, A12, A08)
 * — pedido do autor e ajuste de rota, 2026-09-13 (`docs/decisoes.md`, 10ª rodada).
 *
 * PROMETE:
 *  · «Paciente piorou» grava UM evento (campo `paciente_piorou`, horário, texto livre
 *    opcional), ⛔ não apaga ⛔ nada da trilha, reabre TODOS os eixos da Estabilização ⛔ e
 *    cria a tarefa «reavaliar agora», que fica em PRIMEIRO na lista de problemas ⛔ no
 *    mesmo instante (A11: ⛔ sem esperar tarefa agendada); a tarefa ⛔ não traz número
 *    nem conduta; concluir de novo os cinco eixos a resolve ⛔ e o evento continua na trilha.
 *  · Transferência: estados como fatos com horário; a linha do tempo é a trilha real;
 *    estimativa sai marcada como estimativa; aceite ⛔ nunca é presumido (marco posterior
 *    sem aceite registrado é dito); recusa com motivo entra na linha do tempo ⛔ e, sem
 *    motivo, vira pendência.
 *  · A12: sem recurso (transferência inviável) ⛔ ou recusa/cancelamento sem nova tentativa
 *    → situação "plano local" ⛔ e tarefa de revisão do acesso; o portão da IVT ⛔ e o
 *    veredito da EVT ficam idênticos (⛔ nenhuma terapia substituta).
 *  · A08: IVT impedida (coagulação «Sim» sem exame) com transferência em curso → portão ⛔ e
 *    veredito da EVT idênticos aos do mesmo caso sem transferência.
 *  · Telestroke: parecer registrado (texto + autor + horário) aparece na síntese ⛔ só como
 *    "Avaliação especializada registrada" ⛔ e ⛔ não altera portão nem veredito.
 *  · Piora durante a espera: o estado da transferência ⛔ não muda ⛔ e a piora entra na
 *    mesma linha do tempo.
 *  · A tela: o botão global mora FORA da rolagem (cabeçalho fixo), ⛔ e a gravação passa por
 *    `registrarPiora`.
 * NÃO PROMETE: visibilidade a 375 px em todas as superfícies, autor carimbado ⛔ e ES na tela
 *   (isso é `e2e/avc-paciente-piorou.spec.ts` ⛔ e `e2e/avc-transferencia.spec.ts`).
 * UNIVERSO: `avc/nucleo/{deterioracao,transferencia,problemas-ativos,sintese-do-caso}.ts`,
 *   `avc/conteudo/superficie-g.ts`, `components/avc/avc-modulo-screen.tsx`.
 * FONTE: `docs/decisoes.md` — pedido T07/A12 ⛔ e ajuste de rota "Paciente piorou" global.
 *   ⛔ Nenhum critério de transferência ⛔ nem centro de destino é afirmado.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "piora-transferencia-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const nucleo = (n) => path.join(appDir, "avc", "nucleo", n);
const fontes = ["estado.ts", "relogio.ts", "portao-ivt.ts", "problemas-ativos.ts", "sintese-do-caso.ts", "veredito-da-trombectomia.ts"].map(nucleo);
for (const novo of ["deterioracao.ts", "transferencia.ts"]) if (fs.existsSync(nucleo(novo))) fontes.push(nucleo(novo));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => require(path.join(tmp, ...p));
const opcional = (...p) => (fs.existsSync(path.join(tmp, ...p)) ? require(path.join(tmp, ...p)) : undefined);
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const PA = emT("avc", "nucleo", "problemas-ativos.js");
const S = emT("avc", "nucleo", "sintese-do-caso.js");
const VT = emT("avc", "nucleo", "veredito-da-trombectomia.js");
const D = opcional("avc", "nucleo", "deterioracao.js");
const T = opcional("avc", "nucleo", "transferencia.js");

conf("o módulo de deterioração existe ⛔ e exporta o evento, a leitura ⛔ e a tarefa",
  D !== undefined && typeof D.registrarPiora === "function" && typeof D.eventosDePiora === "function"
    && typeof D.reavaliacaoPendente === "function" && D.CAMPO_PACIENTE_PIOROU === "paciente_piorou",
  "⛔ avc/nucleo/deterioracao.ts ausente ou incompleto");
conf("o módulo de transferência existe ⛔ e exporta leitura, linha do tempo ⛔ e pendências",
  T !== undefined && typeof T.leituraDaTransferencia === "function" && typeof T.linhaDoTempoDoCaso === "function"
    && typeof T.pendenciasDoDestino === "function" && typeof T.avaliacaoEspecializadaRegistrada === "function",
  "⛔ avc/nucleo/transferencia.ts ausente ou incompleto");

const EIXOS = ["via_aerea", "respiracao", "pressao", "glicemia", "exposicao"];
const rel = R.relogioControlado(1_800_000_000_000);
const reg = (e, campo, valor, extra = {}) => E.registrarFato(e, { campo, valor, ...extra }, rel);
const vazio = () => E.abrirAtendimento(rel);
const agora = rel.agora();
const chavesDoPortao = (e) => JSON.stringify(P.estadoDoPortaoIVT(e, agora).motivos.map((m) => `${m.id}|${m.efeito ?? m.camada}`).sort());
const leituraEvt = (e) => { const v = VT.vereditoDaTrombectomia(e, agora); return JSON.stringify({ ...v, retencaoDiagnostica: undefined }); };
const concluirTodos = (e) => EIXOS.reduce((x, eixo) => E.concluirEixo(x, eixo), e);
const semNumeroNemConduta = (t) => !/\d/.test(t) && !/\b(mg|ml|bolus|infus|administr|iniciar|suspender|intubar)/i.test(t);

if (D !== undefined) {
  /* ── A11 · deterioração após tratamento ── */
  let tratado = reg(vazio(), "ivt_estado", "Realizada", { instancia: "trombolise_iv_1" });
  tratado = concluirTodos(tratado);
  const piorou = D.registrarPiora(tratado, "  rebaixou o nível de consciência  ", rel);
  /**
   * ⚠️ 11ª rodada (AC-67): ao lado do evento entra um fato auxiliar com os eixos que
   * estavam concluídos, para a correção por engano poder devolvê-los.
   */
  const evento = piorou.fatos.find((f) => f.campo === "paciente_piorou");
  conf("A11 · o evento grava campo, horário clínico ⛔ e o texto livre (aparado)",
    evento.campo === "paciente_piorou" && evento.horaClinica === agora && evento.valor === "rebaixou o nível de consciência",
    `⛔ ${JSON.stringify(evento)}`);
  conf("A11 · a trilha anterior fica intacta (histórico preservado)",
    JSON.stringify(piorou.fatos.slice(0, tratado.fatos.length)) === JSON.stringify(tratado.fatos)
      && piorou.fatos.slice(tratado.fatos.length).map((f) => f.campo).join(",") === "paciente_piorou,paciente_piorou_eixos_reabertos",
    "⛔ fatos anteriores alterados ou evento a mais");
  conf("A11 · a avaliação de ameaças é reaberta (nenhum eixo segue concluído)",
    EIXOS.every((x) => !piorou.eixosConcluidos.includes(x)), `⛔ ${piorou.eixosConcluidos}`);
  const tarefa = D.reavaliacaoPendente(piorou);
  conf("A11 · a tarefa «reavaliar agora» existe NO MESMO INSTANTE, dona Estabilização, com campo alcançável",
    tarefa !== undefined && tarefa.id === "reavaliar_apos_piora" && tarefa.dono === "estabilizacao" && typeof tarefa.campo === "string" && tarefa.campo.length > 0,
    `⛔ ${JSON.stringify(tarefa)}`);
  const problemas = PA.problemasAtivos(piorou);
  conf("A11 · ela é o PRIMEIRO problema do atendimento (Prioridade)",
    problemas.length > 0 && problemas[0].id === "reavaliar_apos_piora", `⛔ ${problemas.map((p) => p.id).join(" · ")}`);
  conf("A11 · a tarefa entra nas pendências do caso (síntese)",
    PA.pendenciasDoCaso(piorou).some((p) => p.id === "reavaliar_apos_piora"), "⛔ ausente");
  conf("A11 · a tarefa ⛔ não traz limiar nem conduta",
    tarefa !== undefined && semNumeroNemConduta(`${tarefa.rotulo} ${tarefa.resolvePor}`), `⛔ ${tarefa && `${tarefa.rotulo} · ${tarefa.resolvePor}`}`);
  conf("A11 · ela ⛔ existia antes da piora (controle)", D.reavaliacaoPendente(tratado) === undefined, "⛔ tarefa sem evento");
  const reavaliado = concluirTodos(piorou);
  conf("A11 · concluir de novo os cinco eixos resolve a tarefa ⛔ e o evento continua na trilha",
    D.reavaliacaoPendente(reavaliado) === undefined && D.eventosDePiora(reavaliado).length === 1,
    `⛔ ${JSON.stringify(D.reavaliacaoPendente(reavaliado))} · ${D.eventosDePiora(reavaliado).length}`);
  conf("A11 · o evento ⛔ não mexe no portão da IVT", chavesDoPortao(piorou) === chavesDoPortao(tratado), "⛔ portão mudou");

  const semTexto = D.registrarPiora(vazio(), "   ", rel);
  const ev = D.eventosDePiora(semTexto);
  conf("texto livre é opcional: sem texto, o evento existe ⛔ e ⛔ não inventa descrição",
    ev.length === 1 && ev[0].descricao === undefined && typeof ev[0].quando === "number", `⛔ ${JSON.stringify(ev)}`);
  const duas = D.registrarPiora(concluirTodos(semTexto), "de novo", rel);
  conf("uma segunda piora reabre de novo ⛔ e a trilha guarda as duas",
    D.eventosDePiora(duas).length === 2 && D.reavaliacaoPendente(duas) !== undefined, "⛔");
}

if (T !== undefined) {
  /* ── transferência: ciclo e linha do tempo ── */
  let tr = T.registrarMarco(vazio(), "Solicitada", rel.agora(), rel);
  tr = T.registrarMarco(tr, "Contato realizado", rel.agora(), rel);
  tr = reg(tr, "transf_previsao", agora + 40 * 60_000, { horaClinica: agora + 40 * 60_000 });
  const linha = T.linhaDoTempoDoCaso(tr);
  conf("linha do tempo: cada marco é um item com horário real",
    linha.filter((i) => i.ator === "transferencia" && !i.estimativa).length === 2 && linha.every((i) => typeof i.quando === "number"),
    `⛔ ${JSON.stringify(linha)}`);
  conf("estimativa sai marcada como estimativa", linha.some((i) => i.estimativa === true), "⛔ previsão sem marca");
  conf("em espera ⛔ e sem aceite: a leitura diz em espera, ⛔ sem aceite presumido",
    T.leituraDaTransferencia(tr).emEspera === true && T.leituraDaTransferencia(tr).aceiteRegistrado === false, `⛔ ${JSON.stringify(T.leituraDaTransferencia(tr))}`);

  const semAceite = T.registrarMarco(tr, "Transporte confirmado", rel.agora(), rel);
  const sSem = S.sinteseDoCaso(semAceite, rel, []);
  conf("aceite ⛔ nunca presumido: transporte confirmado sem aceite → a síntese diz «aceite não registrado»",
    sSem.situacao.some((l) => l.id === "aceite-nao-registrado") && T.leituraDaTransferencia(semAceite).aceiteRegistrado === false,
    `⛔ ${JSON.stringify(sSem.situacao)}`);
  const comAceite = T.registrarMarco(T.registrarMarco(tr, "Aceite", rel.agora(), rel), "Transporte confirmado", rel.agora(), rel);
  conf("controle: com aceite registrado, ⛔ não há o aviso", !S.sinteseDoCaso(comAceite, rel, []).situacao.some((l) => l.id === "aceite-nao-registrado"), "⛔");
  conf("a síntese carrega a linha do tempo real", Array.isArray(S.sinteseDoCaso(comAceite, rel, []).linhaDoTempo) && S.sinteseDoCaso(comAceite, rel, []).linhaDoTempo.length === 5,
    `⛔ ${JSON.stringify(S.sinteseDoCaso(comAceite, rel, []).linhaDoTempo)}`);

  /* ── recusa registrada ── */
  const recusa = T.registrarMarco(tr, "Recusa", rel.agora(), rel);
  conf("recusa sem motivo → pendência de registrar o motivo",
    T.pendenciasDoDestino(recusa).some((p) => p.id === "motivo_da_recusa" && p.campo === "transf_recusa_motivo"), `⛔ ${JSON.stringify(T.pendenciasDoDestino(recusa))}`);
  const recusaMotivo = reg(recusa, "transf_recusa_motivo", "sem leito");
  const itemRecusa = T.linhaDoTempoDoCaso(recusaMotivo).find((i) => i.texto === "Recusa registrada");
  conf("recusa com motivo → item «Recusa registrada» com o motivo; pendência do motivo some",
    itemRecusa !== undefined && itemRecusa.detalhe === "sem leito" && !T.pendenciasDoDestino(recusaMotivo).some((p) => p.id === "motivo_da_recusa"),
    `⛔ ${JSON.stringify(T.linhaDoTempoDoCaso(recusaMotivo))}`);
  conf("recusa ⛔ não vira aceite nem espera", T.leituraDaTransferencia(recusaMotivo).aceiteRegistrado === false && T.leituraDaTransferencia(recusaMotivo).emEspera === false, "⛔");

  /* ── A12 · sem recurso ou sem aceite ── */
  const semRecurso = reg(vazio(), "transferencia_possivel", "nao");
  const sA12 = S.sinteseDoCaso(semRecurso, rel, T.pendenciasDoDestino(semRecurso));
  conf("A12 · sem recurso → situação «plano local» ⛔ e tarefa de revisão do acesso",
    sA12.situacao.some((l) => l.id === "plano-local") && T.pendenciasDoDestino(semRecurso).some((p) => p.id === "revisar_acesso_transferencia" && p.dono === "destino"),
    `⛔ ${JSON.stringify(sA12.situacao)} · ${JSON.stringify(T.pendenciasDoDestino(semRecurso))}`);
  conf("A12 · recusa sem nova tentativa → a mesma tarefa", T.pendenciasDoDestino(recusaMotivo).some((p) => p.id === "revisar_acesso_transferencia"), "⛔");
  conf("A12 · nova solicitação depois da recusa → a tarefa sai", !T.pendenciasDoDestino(T.registrarMarco(recusaMotivo, "Solicitada", rel.agora(), rel)).some((p) => p.id === "revisar_acesso_transferencia"), "⛔");
  conf("A12 · «Incerto» ⛔ não é ausente: ⛔ não cria a tarefa", !T.pendenciasDoDestino(reg(vazio(), "transferencia_possivel", "nao_sei")).some((p) => p.id === "revisar_acesso_transferencia"), "⛔");
  conf("A12 · a tarefa ⛔ não traz limiar nem conduta",
    T.pendenciasDoDestino(semRecurso).every((p) => semNumeroNemConduta(`${p.rotulo} ${p.resolvePor}`)), "⛔");
  conf("A12 · ⛔ nenhuma terapia substituta: portão ⛔ e EVT idênticos com ⛔ e sem recurso",
    chavesDoPortao(semRecurso) === chavesDoPortao(vazio()) && leituraEvt(semRecurso) === leituraEvt(vazio()), "⛔ derivação clínica mudou");
  conf("A12 · a tarefa entra na lista de problemas", PA.problemasAtivos(semRecurso).some((p) => p.id === "revisar_acesso_transferencia"), "⛔");

  /* ── A08 · IVT impedida, EVT viável, transferência em curso ── */
  const COAG = "motivo_para_suspeitar_alteracao_coagulacao";
  const impedida = reg(vazio(), COAG, "sim");
  const impedidaEmTransf = T.registrarMarco(T.registrarMarco(impedida, "Solicitada", rel.agora(), rel), "Aceite", rel.agora(), rel);
  conf("A08 · controle: coagulação «Sim» sem exame gera motivo restritivo", chavesDoPortao(impedida).includes("coagulograma|"), `⛔ ${chavesDoPortao(impedida)}`);
  conf("A08 · a transferência em curso ⛔ não mexe no portão da IVT", chavesDoPortao(impedidaEmTransf) === chavesDoPortao(impedida), "⛔ portão mudou");
  conf("A08 · ⛔ nem no veredito da EVT", leituraEvt(impedidaEmTransf) === leituraEvt(impedida), "⛔ EVT mudou");
  conf("A08 · a IVT impedida ⛔ não impede registrar a transferência", T.leituraDaTransferencia(impedidaEmTransf).estado === "Aceite", `⛔ ${JSON.stringify(T.leituraDaTransferencia(impedidaEmTransf))}`);

  /* ── telestroke ── */
  let tele = reg(vazio(), "tele_estado", "Solicitada");
  tele = reg(tele, "tele_estado", "Parecer registrado");
  conf("parecer ⛔ sem texto ⛔ não é presumido: sem a linha de avaliação especializada",
    !S.sinteseDoCaso(tele, rel, []).situacao.some((l) => l.id === "avaliacao-especializada"), "⛔ parecer presumido");
  tele = reg(tele, "tele_parecer", "texto do parecer");
  tele = reg(tele, "tele_parecer_autor", "Dra. Neuro");
  tele = reg(tele, "tele_parecer_hora", agora - 5 * 60_000, { horaClinica: agora - 5 * 60_000 });
  const linhaEsp = S.sinteseDoCaso(tele, rel, []).situacao.find((l) => l.id === "avaliacao-especializada");
  conf("parecer registrado → a síntese diz exatamente «Avaliação especializada registrada», ⛔ sem conclusão",
    linhaEsp !== undefined && linhaEsp.texto === "Avaliação especializada registrada", `⛔ ${JSON.stringify(linhaEsp)}`);
  const esp = T.avaliacaoEspecializadaRegistrada(tele);
  conf("o parecer guarda texto, autor ⛔ e horário", esp !== undefined && esp.texto === "texto do parecer" && esp.autor === "Dra. Neuro" && esp.quando === agora - 5 * 60_000, `⛔ ${JSON.stringify(esp)}`);
  conf("o parecer ⛔ altera regras: portão ⛔ e EVT idênticos", chavesDoPortao(tele) === chavesDoPortao(vazio()) && leituraEvt(tele) === leituraEvt(vazio()), "⛔ derivação clínica mudou");
  conf("a teleconsulta entra na linha do tempo", T.linhaDoTempoDoCaso(tele).some((i) => i.ator === "teleconsulta" && i.texto === "Avaliação especializada registrada"), `⛔ ${JSON.stringify(T.linhaDoTempoDoCaso(tele))}`);
  conf("«Não disponível» entra como marco", T.linhaDoTempoDoCaso(reg(vazio(), "tele_estado", "Não disponível")).some((i) => i.texto === "Teleconsulta não disponível"), "⛔");

  /* ── piora durante a espera ── */
  if (D !== undefined) {
    const espera = T.registrarMarco(T.registrarMarco(vazio(), "Solicitada", rel.agora(), rel), "Aceite", rel.agora(), rel);
    const piorouNaEspera = D.registrarPiora(espera, "", rel);
    conf("espera · a piora ⛔ muda o estado da transferência", T.leituraDaTransferencia(piorouNaEspera).estado === "Aceite" && T.leituraDaTransferencia(piorouNaEspera).emEspera === true, "⛔");
    conf("espera · a piora entra na mesma linha do tempo", T.linhaDoTempoDoCaso(piorouNaEspera).some((i) => i.ator === "piora"), `⛔ ${JSON.stringify(T.linhaDoTempoDoCaso(piorouNaEspera))}`);
    conf("espera · a tarefa «reavaliar agora» nasce ⛔ e é a primeira", PA.problemasAtivos(piorouNaEspera)[0]?.id === "reavaliar_apos_piora", "⛔");
  }

  /* ── corrigido ⛔ não é marco ── */
  const errado = T.registrarMarco(vazio(), "Aceite", rel.agora(), rel);
  /** ⚠️ 11ª rodada: marco ⛔ se «limpa» — corrige por engano, marco a marco. */
  const corrigido = T.marcoPorEngano(errado, T.marcosDaTransferencia(errado)[0].fatoId, rel);
  conf("um marco corrigido («Limpar») sai da linha do tempo ⛔ e ⛔ deixa aceite", T.linhaDoTempoDoCaso(corrigido).length === 0 && T.leituraDaTransferencia(corrigido).aceiteRegistrado === false,
    `⛔ ${JSON.stringify(T.linhaDoTempoDoCaso(corrigido))}`);
}

/* ── a tela ── */
const tela = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));
/** ⚠️ `<ScrollView` JSX, ⛔ e ⛔ não o genérico `useRef<ScrollView | null>` (que vem antes). */
const inicioDaRolagem = tela.search(/<ScrollView\s+ref=/);
const antesDaRolagem = tela.slice(0, Math.max(0, inicioDaRolagem));
conf("a tela: o botão global «Paciente piorou» mora FORA da rolagem (cabeçalho/contexto fixo)",
  /testID="avc-piorou"/.test(antesDaRolagem) || /<BotaoPacientePiorou/.test(antesDaRolagem), "⛔ botão ausente ou dentro do ScrollView");
conf("a tela: a confirmação grava por `registrarPiora`", /registrarPiora\(/.test(tela), "⛔");
conf("a tela: a linha de prioridade «reavaliar agora» é desenhada", /avc-prioridade-reavaliar/.test(tela), "⛔");

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · PACIENTE PIOROU ⛔ E TRANSFERÊNCIA — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
