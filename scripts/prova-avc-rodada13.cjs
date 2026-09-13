#!/usr/bin/env node
/**
 * PROVA · 13ª RODADA DO AVC — contrato de navegação com destinos indisponíveis (C05),
 * via aérea como conduta externa (A09) ⛔ e "Sem essa informação" por marco (A04).
 * Decisão do autor, 2026-09-13 (`docs/decisoes.md`, 13ª rodada, opção A).
 *
 * PROMETE:
 *  · Contrato: chamar um módulo grava a chamada com `encounterId`, destino ⛔ e origem
 *    (superfície, campo, rolagem); a pilha é derivada da trilha (sobrevive a fechar ⛔
 *    reabrir); só o topo retorna; o retorno devolve o mesmo `encounterId`, a origem, os
 *    eventos REALMENTE registrados na chamada, o suporte ativo, a resposta (⛔ medida no
 *    módulo) ⛔ e as pendências; cancelar retorna sem apagar o que foi registrado.
 *  · Destinos: via aérea, ventilação ⛔ e sedoanalgesia são INDISPONÍVEIS neste app; via
 *    aérea oferece os outros dois como cuidados associados; ⛔ nenhum destino declara ação
 *    que execute intervenção.
 *  · Conduta externa: seis campos (definitiva, tipo, horário, quem, sedação, ventilação),
 *    registro de equipe; ⛔ fármaco, dose ⛔ nem parâmetro; «não sei» em cada campo mantém
 *    pendência; com definitiva = sim: suporte ativo "intubado às HH:MM · sedação em
 *    curso", eixo A com intervenção registrada ⛔ e reavaliação pendente até nova medida.
 *  · Exame neurológico: NIHSS anterior ao horário da intubação = "anterior à sedação —
 *    basal preservado"; posterior = "sob sedação — confundidor"; o exame novo sob sedação
 *    ⛔ substitui o basal no valor que as regras leem; UN por intubação é SUGERIDO, ⛔ nunca
 *    gravado.
 *  · Cronologia: cada marco tem o próprio «Sem essa informação» (chegada ⛔ e última vez
 *    bem); última vez bem desconhecida mostra o caminho de início desconhecido (A04).
 * NÃO PROMETE: o gesto a 375 px, a rolagem restaurada, o reabrir de verdade ⛔ e ES (isso é
 *   `e2e/avc-rodada13.spec.ts`); ⛔ nem valida conteúdo clínico — ⛔ há conteúdo novo.
 * UNIVERSO: `avc/conteudo/{modulos-chamaveis,via-aerea-externa,superficie-b}.ts`,
 *   `avc/nucleo/{chamadas,via-aerea-externa,derivacoes-b,problemas-ativos}.ts`,
 *   `components/avc/{avc-modulo-screen,modulo-indisponivel,superficie-b,campos-clinicos,
 *   campo-de-escala}.tsx`, `components/avc/ui/index.tsx`.
 * FONTE: `docs/decisoes.md` — 13ª rodada.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada13-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const arq = (...p) => path.join(appDir, ...p);
const fontes = [arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "derivacoes-b.ts"),
  arq("avc", "nucleo", "problemas-ativos.ts"), arq("avc", "conteudo", "campos.ts"), arq("avc", "conteudo", "superficie-b.ts")];
for (const novo of [arq("avc", "nucleo", "chamadas.ts"), arq("avc", "nucleo", "via-aerea-externa.ts"),
  arq("avc", "conteudo", "modulos-chamaveis.ts"), arq("avc", "conteudo", "via-aerea-externa.ts")]) {
  if (fs.existsSync(novo)) fontes.push(novo);
}
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => require(path.join(tmp, ...p));
const opcional = (...p) => (fs.existsSync(path.join(tmp, ...p)) ? require(path.join(tmp, ...p)) : undefined);
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const B = emT("avc", "nucleo", "derivacoes-b.js");
const PA = emT("avc", "nucleo", "problemas-ativos.js");
const K = emT("avc", "conteudo", "campos.js");
const CB = emT("avc", "conteudo", "superficie-b.js");
const CH = opcional("avc", "nucleo", "chamadas.js");
const VA = opcional("avc", "nucleo", "via-aerea-externa.js");
const MC = opcional("avc", "conteudo", "modulos-chamaveis.js");
const CVA = opcional("avc", "conteudo", "via-aerea-externa.js");
const MIN = 60_000;

/* ══ 1 · CONTRATO DE NAVEGAÇÃO ══════════════════════════════════════════ */
conf("os módulos do contrato existem (destinos ⛔ e chamadas)",
  MC !== undefined && Array.isArray(MC.MODULOS_CHAMAVEIS) && CH !== undefined
    && ["chamarModulo", "pilhaDeChamadas", "retornarDoModulo", "retornoDaChamada"].every((n) => typeof CH[n] === "function"),
  "⛔ avc/conteudo/modulos-chamaveis.ts ou avc/nucleo/chamadas.ts ausente/incompleto");
if (MC !== undefined) {
  const ids = MC.MODULOS_CHAMAVEIS.map((m) => m.id);
  conf("os três destinos: via aérea, ventilação, sedoanalgesia", ["via_aerea", "ventilacao", "sedoanalgesia"].every((id) => ids.includes(id)), `⛔ ${ids}`);
  conf("⛔ nenhum destino é declarado disponível (⛔ há módulo implementado)", MC.MODULOS_CHAMAVEIS.every((m) => m.disponivel === false), "⛔ destino disponível");
  const va = MC.MODULOS_CHAMAVEIS.find((m) => m.id === "via_aerea");
  conf("via aérea oferece ventilação ⛔ e sedoanalgesia como cuidados associados",
    va !== undefined && ["ventilacao", "sedoanalgesia"].every((id) => va.cuidadosAssociados.includes(id)), `⛔ ${JSON.stringify(va)}`);
  const verbos = JSON.stringify(MC.MODULOS_CHAMAVEIS);
  conf("⛔ nenhum texto de destino simula execução", !/\b(intubar|iniciar|executar|administrar|aplicar|sedar)\b/i.test(verbos), `⛔ ${verbos.slice(0, 300)}`);
}
if (CH !== undefined && VA !== undefined) {
  const rel = R.relogioControlado(1_800_000_000_000);
  const ENC = "caso-teste-123";
  let e = E.abrirAtendimento(rel);
  e = CH.chamarModulo(e, { encounterId: ENC, destino: "via_aerea", origem: { modulo: "avc", superficie: "estabilizacao", campo: "consciencia_rebaixada", rolagem: 912 } }, rel);
  let pilha = CH.pilhaDeChamadas(e);
  conf("chamar grava a chamada: pilha com 1, encounterId ⛔ e origem completa",
    pilha.length === 1 && pilha[0].destino === "via_aerea" && pilha[0].encounterId === ENC
      && pilha[0].origem.superficie === "estabilizacao" && pilha[0].origem.campo === "consciencia_rebaixada" && pilha[0].origem.rolagem === 912,
    `⛔ ${JSON.stringify(pilha)}`);
  const via = pilha[0].chamadaId;
  rel.avancar(MIN);
  e = VA.registrarViaAereaExterna(e, { definitiva: "sim", tipo: "Intubação orotraqueal", observado: rel.agora(), quem: "Dr. Plantão", sedacao: "sim", ventilacao: "sim" }, rel, via);
  e = CH.chamarModulo(e, { encounterId: ENC, destino: "ventilacao", origem: { modulo: "via_aerea", rolagem: 0 } }, rel);
  pilha = CH.pilhaDeChamadas(e);
  conf("retorno aninhado: pilha com 2 (via aérea › ventilação)", pilha.map((c) => c.destino).join("›") === "via_aerea›ventilacao", `⛔ ${pilha.map((c) => c.destino)}`);
  conf("⛔ só o topo retorna: retornar a de baixo com outra aberta ⛔ muda nada",
    CH.retornarDoModulo(e, via, rel).fatos.length === e.fatos.length, "⛔ retornou fora da ordem");
  const cancelado = CH.retornarDoModulo(e, pilha[1].chamadaId, rel, true);
  conf("cancelar a de cima volta para via aérea (pilha 1) ⛔ e o retorno diz cancelado",
    CH.pilhaDeChamadas(cancelado).length === 1 && CH.retornoDaChamada(cancelado, pilha[1].chamadaId).cancelado === true, "⛔");
  const reaberto = { ...cancelado, fatos: [...cancelado.fatos] };
  conf("fechar ⛔ reabrir: a pilha sai da trilha (mesmo resultado com a trilha recarregada)",
    JSON.stringify(CH.pilhaDeChamadas(reaberto)) === JSON.stringify(CH.pilhaDeChamadas(cancelado)), "⛔ pilha em memória");
  const final = CH.retornarDoModulo(cancelado, via, rel);
  const ret = CH.retornoDaChamada(final, via);
  conf("retorno: mesmo encounterId, origem, ⛔ cancelado", ret !== undefined && ret.encounterId === ENC && ret.origem.rolagem === 912 && ret.cancelado === false,
    `⛔ ${JSON.stringify(ret)}`);
  const idsDaChamada = final.fatos.filter((f) => f.instancia === via && ["va_definitiva", "va_tipo", "va_hora", "va_quem", "va_sedacao", "va_ventilacao"].includes(f.campo)).map((f) => f.id);
  conf("retorno transporta os eventos REALMENTE registrados na chamada", ret !== undefined && idsDaChamada.length === 6 && idsDaChamada.every((id) => ret.eventos.includes(id)),
    `⛔ ${JSON.stringify(ret && ret.eventos)} × ${idsDaChamada}`);
  conf("retorno transporta suporte ativo, resposta ⛔ medida ⛔ e pendência de reavaliação",
    ret !== undefined && ["via_aerea_definitiva", "sedacao_em_curso", "ventilacao_mecanica"].every((s) => ret.suporteAtivo.includes(s))
      && ret.resposta === "nao_medida" && ret.pendencias.includes("reavaliar_via_aerea"), `⛔ ${JSON.stringify(ret)}`);
  conf("pilha vazia depois do retorno", CH.pilhaDeChamadas(final).length === 0, "⛔");
}

/* ══ 2 · CONDUTA EXTERNA DE VIA AÉREA ════════════════════════════════════ */
conf("conteúdo ⛔ leitura da via aérea externa existem",
  CVA !== undefined && Array.isArray(CVA.CAMPOS_DA_VIA_AEREA_EXTERNA) && VA !== undefined
    && ["registrarViaAereaExterna", "leituraDaViaAereaExterna", "suporteAtivo", "intervencaoDeViaAereaPendente", "examesNihss", "itensNihssSugeridosComoNaoTestaveis"].every((n) => typeof VA[n] === "function"),
  "⛔ avc/conteudo/via-aerea-externa.ts ou avc/nucleo/via-aerea-externa.ts ausente/incompleto");
if (CVA !== undefined) {
  const ids = CVA.CAMPOS_DA_VIA_AEREA_EXTERNA.map((c) => c.id);
  conf("exatamente os seis campos pedidos", JSON.stringify(ids) === JSON.stringify(["va_definitiva", "va_tipo", "va_hora", "va_quem", "va_sedacao", "va_ventilacao"]), `⛔ ${ids}`);
  const tipo = CVA.CAMPOS_DA_VIA_AEREA_EXTERNA.find((c) => c.id === "va_tipo");
  conf("tipo: IOT · supraglótico · cirúrgica · outra · não sei",
    tipo !== undefined && JSON.stringify(tipo.opcoes) === JSON.stringify(["Intubação orotraqueal", "Dispositivo supraglótico", "Via aérea cirúrgica", "Outra", "Não sei"]), `⛔ ${JSON.stringify(tipo && tipo.opcoes)}`);
  const texto = JSON.stringify(CVA.CAMPOS_DA_VIA_AEREA_EXTERNA);
  conf("⛔ fármaco, dose ⛔ nem parâmetro ventilatório", !/\b(mg|mcg|ml|dose|fentanil|propofol|midazolam|cetamina|rocur|succinil|etomidato|peep|fio2|volume corrente|frequência respiratória)\b/i.test(texto), `⛔ ${texto.slice(0, 200)}`);
  conf("os campos estão no registro do módulo", ids.every((id) => K.todosOsCampos().some((c) => c.id === id)), "⛔ fora de todosOsCampos");
}
if (VA !== undefined) {
  const rel = R.relogioControlado(1_800_000_000_000);
  const t0 = rel.agora();
  /* basal */
  let e = E.registrarFato(E.abrirAtendimento(rel), { campo: "nihss_calculado", valor: 4 }, rel);
  rel.avancar(10 * MIN);
  const tIot = rel.agora();
  e = VA.registrarViaAereaExterna(e, { definitiva: "sim", tipo: "Intubação orotraqueal", observado: tIot, quem: "Dr. Plantão", sedacao: "sim", ventilacao: "sim" }, rel);
  const partes = VA.suporteAtivo(e);
  conf("suporte ativo: «intubado às» HH:MM · «sedação em curso» · «ventilação mecânica»",
    partes.length === 3 && partes[0].rotulo === "intubado às" && partes[0].hora === tIot && partes[1].rotulo === "sedação em curso" && partes[2].rotulo === "ventilação mecânica",
    `⛔ ${JSON.stringify(partes)}`);
  conf("eixo A: intervenção registrada · reavaliação pendente", VA.intervencaoDeViaAereaPendente(e) === true, "⛔");
  const comMedida = E.registrarFato(e, { campo: "consciencia_rebaixada", valor: "sim" }, rel);
  conf("eixo A: nova medida da via aérea tira a pendência de reavaliação", VA.intervencaoDeViaAereaPendente(comMedida) === false, "⛔ continuou pendente");
  conf("NIHSS basal preservado depois de registrar a intubação", B.nihssCalculado(e) === 4, `⛔ ${B.nihssCalculado(e)}`);
  rel.avancar(20 * MIN);
  const sob = E.registrarFato(e, { campo: "nihss_calculado", valor: 12 }, rel);
  conf("⚠️ exame novo SOB SEDAÇÃO ⛔ substitui o basal no valor que as regras leem", B.nihssCalculado(sob) === 4, `⛔ ${B.nihssCalculado(sob)}`);
  const exames = VA.examesNihss(sob);
  conf("marcas: basal «anterior à sedação», novo «sob sedação»",
    exames.length === 2 && exames[0].total === 4 && exames[0].marca === "anterior_a_sedacao" && exames[0].quando === t0
      && exames[1].total === 12 && exames[1].marca === "sob_sedacao", `⛔ ${JSON.stringify(exames)}`);
  const soSob = E.registrarFato(VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { definitiva: "sim", observado: rel.agora() - MIN }, rel), { campo: "nihss_calculado", valor: 9 }, rel);
  conf("sem exame basal, o único exame fica marcado «sob sedação» (⛔ some)",
    VA.examesNihss(soSob).length === 1 && VA.examesNihss(soSob)[0].marca === "sob_sedacao" && B.nihssCalculado(soSob) === 9, `⛔ ${JSON.stringify(VA.examesNihss(soSob))}`);
  conf("UN por intubação é SUGERIDO (item de barreira à fala) ⛔ e ⛔ gravado",
    JSON.stringify(VA.itensNihssSugeridosComoNaoTestaveis(e)) === JSON.stringify(["10"]) && !e.fatos.some((f) => f.campo === "nihss_10"),
    `⛔ ${JSON.stringify(VA.itensNihssSugeridosComoNaoTestaveis(e))}`);
  conf("sem via aérea definitiva ⛔ há sugestão ⛔ nem marca", VA.itensNihssSugeridosComoNaoTestaveis(E.abrirAtendimento(rel)).length === 0 && VA.examesNihss(E.registrarFato(E.abrirAtendimento(rel), { campo: "nihss_calculado", valor: 3 }, rel)).every((x) => x.marca === undefined), "⛔");

  /* «não sei» mantém pendência */
  const naoSei = VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { definitiva: "nao_sei", tipo: "nao_sei", observado: "nao_sei", sedacao: "nao_sei", ventilacao: "nao_sei" }, rel);
  const pend = VA.leituraDaViaAereaExterna(naoSei).pendencias.map((p) => p.campo);
  conf("«não sei» em cada campo mantém pendência (definitiva, tipo, horário, sedação, ventilação)",
    ["va_definitiva", "va_tipo", "va_hora", "va_sedacao", "va_ventilacao"].every((c) => pend.includes(c)), `⛔ ${pend}`);
  conf("… ⛔ e as pendências aparecem na lista do atendimento", ["va_definitiva", "va_tipo", "va_hora", "va_sedacao", "va_ventilacao"].every((c) => PA.pendenciasDoCaso(naoSei).some((p) => p.campo === c)),
    `⛔ ${PA.pendenciasDoCaso(naoSei).map((p) => p.campo)}`);
  const resolvido = VA.registrarViaAereaExterna(naoSei, { tipo: "Intubação orotraqueal" }, rel);
  conf("responder o campo tira só aquela pendência", !VA.leituraDaViaAereaExterna(resolvido).pendencias.some((p) => p.campo === "va_tipo") && VA.leituraDaViaAereaExterna(resolvido).pendencias.some((p) => p.campo === "va_sedacao"), "⛔");
  const horaNaoSei = VA.registrarViaAereaExterna(E.abrirAtendimento(rel), { definitiva: "sim", observado: "nao_sei" }, rel);
  conf("horário da intubação desconhecido: exame ⛔ é classificado (⛔ inventa basal)",
    VA.examesNihss(E.registrarFato(horaNaoSei, { campo: "nihss_calculado", valor: 5 }, rel)).every((x) => x.marca === "sem_referencia"), "⛔ classificou sem horário");
}

/* ══ 3 · CRONOLOGIA POR MARCO ⛔ A04 ═════════════════════════════════════ */
{
  const chegada = CB.CRONOLOGIA_B.find((c) => c.id === "hora_chegada");
  conf("«não sei quando chegou» é resposta própria (chegada aceita desconhecido)", chegada !== undefined && chegada.aceitaDesconhecido === true, "⛔ chegada sem «Sem essa informação»");
  const cc = lerFonte(arq("components", "avc", "campos-clinicos.tsx"));
  conf("o «Sem essa informação» mora DENTRO do marco (rodapé do LinhaDeRelogio)", /rodape=\{campo\.aceitaDesconhecido \? botaoDesconhecido/.test(cc), "⛔ botão fora do marco");
  const ui = lerFonte(arq("components", "avc", "ui", "index.tsx"));
  conf("o marco tem container próprio com testID", /testID=\{`avc-marco-\$\{campo\}`\}/.test(ui) && /rodape\?:\s*ReactNode/.test(ui), "⛔ LinhaDeRelogio sem container/rodapé");
  const b = lerFonte(arq("components", "avc", "superficie-b.tsx"));
  conf("A04: última vez bem desconhecida mostra o caminho de início desconhecido",
    /avc-b-caminho-inicio-desconhecido/.test(b) && /avc-b-abrir-inicio-desconhecido/.test(b), "⛔ sem caminho A04");
}

/* ══ 4 · A TELA ══════════════════════════════════════════════════════════ */
{
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  conf("a tela: painel de módulo indisponível ⛔ chamada ⛔ retorno ligados",
    /<ModuloIndisponivel/.test(tela) && /chamarModulo\(/.test(tela) && /retornarDoModulo\(/.test(tela), "⛔");
  conf("a tela: encounterId = id do caso persistido", /encounterId:\s*atendimento\.casoId/.test(tela), "⛔ encounterId ⛔ vem do caso");
  conf("a tela: suporte ativo no topo fixo", /avc-suporte-ativo/.test(tela.slice(0, Math.max(0, tela.search(/<ScrollView\s+ref=/)))), "⛔ fora do topo");
  const painel = fs.existsSync(arq("components", "avc", "modulo-indisponivel.tsx")) ? lerFonte(arq("components", "avc", "modulo-indisponivel.tsx")) : "";
  conf("o painel diz «indisponível neste app» ⛔ e ⛔ tem verbo de execução",
    /indisponível neste app/.test(painel) && !/tr\("(Intubar|Iniciar|Executar|Administrar|Sedar)/.test(painel), "⛔ painel ausente ou com execução simulada");
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · 13ª RODADA — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
