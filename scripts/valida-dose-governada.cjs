#!/usr/bin/env node
/**
 * PROMETE: que nenhuma dose acionável de nitrato ou betabloqueador seja
 *   apresentada num nó que não tenha o veredito correspondente governando; que
 *   os dados necessários para liberar cada fármaco sejam perguntados ANTES da
 *   primeira oferta possível; e que dúvida nunca seja convertida em ausência de
 *   contraindicação — nem pela ajuda.
 * NÃO PROMETE: que as doses estejam clinicamente certas (test:coronarias,
 *   test:farmacos) nem que os vereditos avaliem bem (test:vereditos-sca).
 * UNIVERSO: a árvore da SCA compilada.
 *
 * ── A REGRA, NA FORMULAÇÃO DO AUTOR (2026-08-26) ────────────────────────────
 *
 * "Nenhuma dose acionável de medicamento pode ser apresentada antes de o app
 * ter avaliado e liberado as contraindicações relevantes para aquele
 * medicamento."
 *
 * ⚠️ E ELA NÃO É "A PALAVRA DOSE SÓ PODE EXISTIR DENTRO DE UM NÓ VEREDITO" —
 * essa formulação literal congelaria a arquitetura. O que se proíbe é dose
 * SOLTA e não governada; no desenho atual da SCA, `Veredito` é o mecanismo que
 * governa, e é ele que esta trava mede. Se um dia outro mecanismo formal do
 * motor autorizar uma ação, a regra continua valendo e a trava é que muda.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O autor percorreu o módulo no celular e viu a tela de contraindicações
 * ("antes de nitrato e betabloqueador") aparecer no PASSO 10 — depois de o app
 * já ter mandado dar nitrato nos passos 4 e 5. E no passo 17 a dose era
 * impressa de novo, sem veredito nenhum.
 *
 * Os vereditos existiam em UM nó. Os outros quatro continuavam imprimindo dose
 * como antes — exatamente o que eles foram feitos para eliminar.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "coronary-decision-tree.ts";
const falhas = [];
const linhas = [];
let ok = 0;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dose-gov-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, ARVORE),
], { cwd: appDir, stdio: "pipe" });
const arv = Object.values(require(path.join(tmp, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);

/** O que caracteriza uma DOSE ACIONÁVEL — número + unidade + fármaco. */
const PADROES = {
  nitrato: /(DINITRATO DE ISOSSORBIDA|NITROGLICERINA)[^.]{0,60}\d/i,
  betabloqueador: /Betabloqueador\s+—\s+SÓ EM PACIENTE SELECIONADO|Via ORAL, precoce/i,
};

// ── A. TODA DOSE ESTÁ GOVERNADA ────────────────────────────────────────────
for (const [id, n] of Object.entries(arv.nodes)) {
  const texto = [...(n.actions ?? [])].join(" \n ");
  const vereditos = (n.vereditos ?? []).map((v) => v.id);
  for (const [farmaco, padrao] of Object.entries(PADROES)) {
    if (!padrao.test(texto)) continue;
    // ⚠️ TER O VEREDITO NÃO BASTA — E ESTE FURO SÓ APARECEU NA MUTAÇÃO. A
    // primeira versão aceitava dose em `actions` desde que o nó tivesse o
    // veredito correspondente. Mas `actions` é renderizada INDEPENDENTEMENTE
    // do veredito: a dose apareceria igual no vermelho, ao lado do bloqueio,
    // que é exatamente o defeito. A dose tem de viver em `Veredito.instrucao`,
    // que só é exibida no verde.
    falhas.push(
      `\`${id}\` mostra dose de ${farmaco} em \`actions\`${vereditos.includes(farmaco) ? " (mesmo tendo o veredito)" : ""}.\n` +
      `      ⚠️ A dose apareceria mesmo com a contraindicação presente — o app estaria mandando\n` +
      `      administrar antes de saber se pode. A dose pertence a \`Veredito.instrucao\`, que só a\n` +
      `      mostra no verde.`
    );
  }
}
linhas.push(`  A. nenhuma dose solta em \`actions\` — ${Object.keys(arv.nodes).length} nós varridos`);

// ── B. OS NÓS QUE OFERECEM CADA FÁRMACO TÊM O VEREDITO DELE ────────────────
{
  const comVeredito = (f) =>
    Object.entries(arv.nodes).filter(([, n]) => (n.vereditos ?? []).some((v) => v.id === f)).map(([id]) => id);
  // ⚠️ NOMINAL, NÃO CONTAGEM. Contar deixa passar a remoção de um nó desde que
  // outro seja acrescentado — e a mutação que tirou o veredito de
  // `estabilizacao_ramo` passou por isso. Cada nó que oferece o fármaco é
  // nomeado aqui: quem quiser tirar um precisa dizer por quê.
  const ESPERADOS = {
    nitrato: ["estabilizacao_ramo", "coronariana_isquemia_em_curso", "terapia_vereditos", "stemi_meds", "nste_meds"],
    betabloqueador: ["terapia_vereditos", "stemi_meds", "nste_meds"],
    aas: ["aas_liberado"],
  };
  for (const [f, esperados] of Object.entries(ESPERADOS)) {
    const nos = comVeredito(f);
    const faltando = esperados.filter((e) => !nos.includes(e));
    if (faltando.length) {
      falhas.push(
        `estes nós oferecem \`${f}\` e deixaram de governá-lo: ${faltando.join(", ")}.\n` +
        `      ⚠️ Um veredito que vive num nó só é uma ilha: os outros pontos que oferecem o mesmo ` +
        `fármaco voltam a imprimir dose sem checagem.`
      );
    } else ok++;
    linhas.push(`  B. ${f}: governado em ${nos.length} nó(s) — todos os esperados presentes`);
  }
}

// ── C. O DADO CHEGA ANTES DA PRIMEIRA OFERTA ───────────────────────────────
//
// ⚠️ É A METADE QUE FALTAVA. Ter o veredito no nó não basta se o dado que ele
// precisa só é perguntado depois: o veredito bloquearia sempre, e o médico
// veria "não verificado" sem ter tido a chance de responder.
{
  const dist = { [arv.entryNodeId]: 0 };
  const fila = [arv.entryNodeId];
  while (fila.length) {
    const id = fila.shift();
    const n = arv.nodes[id];
    if (!n) continue;
    const nx = n.type === "decision" ? n.options.map((o) => o.next)
      : typeof n.next === "string" ? [n.next] : (n.next?.possiveis ?? []);
    for (const d of nx) if (dist[d] === undefined) { dist[d] = dist[id] + 1; fila.push(d); }
  }
  const ondePergunta = (campo) => {
    const nos = Object.entries(arv.nodes)
      .filter(([, n]) => (n.fields ?? []).some((f) => f.id === campo))
      .map(([id]) => dist[id]).filter((d) => d !== undefined);
    return nos.length ? Math.min(...nos) : Infinity;
  };
  const primeiraOferta = (f) => {
    const nos = Object.entries(arv.nodes)
      .filter(([, n]) => (n.vereditos ?? []).some((v) => v.id === f))
      .map(([id]) => dist[id]).filter((d) => d !== undefined);
    return nos.length ? Math.min(...nos) : Infinity;
  };

  // ⚠️ DOMINÂNCIA, NÃO DISTÂNCIA. Comparar "passo da pergunta" com "passo da
  // oferta" mede a rota mais curta e deixa passar qualquer ATALHO que alcance
  // a oferta por outro caminho — e este módulo tem cinco atalhos no menu de
  // entrada. O que prova a promessa é remover o nó da pergunta e exigir que
  // NENHUMA oferta continue alcançável.
  const nosQuePerguntam = Object.entries(arv.nodes)
    .filter(([, n]) => (n.fields ?? []).some((f) => f.id === "pde5_recente")).map(([id]) => id);
  const nosQueOferecem = Object.entries(arv.nodes)
    .filter(([, n]) => (n.vereditos ?? []).some((v) => v.id === "nitrato")).map(([id]) => id);

  // ⚠️ PERGUNTAR EM VÁRIOS NÓS NÃO É REPERGUNTAR. O módulo tem cinco atalhos
  // no menu de entrada, e três deles pulam a Tela 1 — por esses caminhos a
  // pergunta precisa existir de novo, ou o veredito bloqueia por um dado que o
  // médico nunca teve chance de dar. Quem veio pelo fluxo completo encontra o
  // campo JÁ PREENCHIDO: o motor guarda o valor e a tela avisa que foi
  // aproveitado.
  //
  // O que se mede, então, não é "quantos perguntam" — é se ALGUMA pergunta
  // precede TODA oferta.
  if (!nosQuePerguntam.length) {
    falhas.push("ninguém pergunta `pde5_recente` — o veredito do nitrato bloquearia para sempre.");
  } else ok++;

  const alcanca = (de, alvo, sem) => {
    const vistos = new Set();
    const pilha = [de];
    while (pilha.length) {
      const id = pilha.pop();
      if (!id || id === sem || vistos.has(id)) continue;
      vistos.add(id);
      if (id === alvo) return true;
      const n = arv.nodes[id];
      if (!n) continue;
      const nx = n.type === "decision" ? n.options.map((o) => o.next)
        : typeof n.next === "string" ? [n.next] : (n.next?.possiveis ?? []);
      nx.forEach((d) => pilha.push(d));
    }
    return false;
  };
  // Remove TODAS as portas de uma vez: se ainda houver rota até uma oferta, há
  // um caminho em que a dose é considerada sem o dado.
  const alcancaSemPortas = (alvo) => {
    const vistos = new Set(nosQuePerguntam);
    const pilha = [arv.entryNodeId];
    while (pilha.length) {
      const id = pilha.pop();
      if (!id || vistos.has(id)) continue;
      vistos.add(id);
      if (id === alvo) return true;
      const n = arv.nodes[id];
      if (!n) continue;
      const nx = n.type === "decision" ? n.options.map((o) => o.next)
        : typeof n.next === "string" ? [n.next] : (n.next?.possiveis ?? []);
      nx.forEach((d) => pilha.push(d));
    }
    return false;
  };
  const escapam = nosQueOferecem.filter((alvo) => alcancaSemPortas(alvo));
  if (escapam.length) {
    falhas.push(
      `estes nós oferecem nitrato SEM passar pela pergunta do PDE-5: ${escapam.join(", ")}.\n` +
      `      ⚠️ Por esse caminho o veredito bloquearia por falta do dado, e o médico veria "não\n` +
      `      verificado" sem ter tido chance de responder — o app diria "não posso" em vez de perguntar.`
    );
  } else ok++;
  linhas.push(`  C. PDE-5 perguntado em ${nosQuePerguntam.length} nós · ${nosQueOferecem.length} oferecem nitrato, nenhum alcançável sem passar por uma pergunta`);
}

// ── D. A AJUDA NUNCA APAGA A DÚVIDA ────────────────────────────────────────
//
// ⚠️ A TELA DE AJUDA SÓ EXISTE PARA QUEM NÃO SABE — e a primeira versão dela
// oferecia apenas "Sim" e "Não". Quem continuasse sem conseguir avaliar era
// obrigado a escolher, e "Não" LIBERAVA o betabloqueador. A ajuda virava a
// porta que apaga a dúvida.
{
  for (const [id, campo] of [["bb_ajuda_pr", "bb_bav"]]) {
    const n = arv.nodes[id];
    if (!n) { falhas.push(`\`${id}\` sumiu.`); continue; }
    const valores = (n.options ?? []).map((o) => o.grava?.valor);
    if (!valores.includes("nao_sei")) {
      falhas.push(
        `\`${id}\` não tem saída que preserve a dúvida (grava: ${valores.join(", ")}).\n` +
        `      ⚠️ Quem entra nesta tela é exatamente quem não sabe. Sem a terceira saída, ela força uma\n` +
        `      resposta falsa — e "não" LIBERA o fármaco.`
      );
    } else ok++;
    if ((n.options ?? []).length < 3) {
      falhas.push(`\`${id}\` tem ${(n.options ?? []).length} saídas, esperado ao menos 3.`);
    } else ok++;
  }
  linhas.push("  D. a ajuda do BAV/PR preserva `nao_sei` — dúvida não vira liberação");
}

// ── E. Vacuidade ───────────────────────────────────────────────────────────
if (Object.keys(arv.nodes).length < 50) falhas.push("a árvore veio pequena demais — pode ter rodado sobre nada (R-15 item 9).");
if (linhas.length < 5) falhas.push(`só ${linhas.length} linhas de evidência (R-15 item 9).`);

console.log("\nDose governada — nada é oferecido antes de o app poder autorizar\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — nenhuma dose aparece antes da autorização\n`);
process.exit(0);
