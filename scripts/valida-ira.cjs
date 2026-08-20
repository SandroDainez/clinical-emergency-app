#!/usr/bin/env node
/**
 * PROMETE: que o módulo de injúria renal aguda mantenha as decisões de ESCOPO e
 *   de DESENHO que o autorizaram — os dois eixos do KDIGO com o contraste
 *   meta × critério, a obstrução PRIMEIRA na exclusão, as perguntas pelo
 *   observável (nunca pela classificação), a saída do "não sei a base" com
 *   conteúdo próprio, e a fronteira da diálise COM alternativa.
 * NÃO PROMETE: que os números clínicos estejam certos — isso é a fonte (KDIGO
 *   2012, aberta em sessão). Nem que o módulo cubra nefrologia: ele declara três
 *   exclusões.
 * UNIVERSO: a árvore compilada `ira-decision-tree.ts` e as constantes de
 *   `lib/injuria-renal-aguda.ts`, derivadas do próprio arquivo.
 *
 * ── POR QUE ESTA TRAVA É DIFERENTE DAS OUTRAS ───────────────────────────────
 *
 * ⚠️ NÃO HÁ DEFEITO DE ORIGEM. O módulo é NOVO — foi o primeiro escrito nesta
 * auditoria —, então não existe mutação que "devolva" um defeito histórico.
 *
 * O que ela vigia são as DECISÕES QUE PODERIAM SER DESFEITAS por quem revisar o
 * módulo com boa intenção e sem o contexto: transformar as perguntas em
 * classificação (porque parece mais organizado), tirar o contraste da diurese
 * (porque parece redundante com os 30 nós que já usam o número), mover a
 * obstrução para depois (porque a ordem "pré-renal, renal, pós-renal" é a dos
 * livros), ou apagar a alternativa ao nefrologista (porque "é obvio que se
 * transfere").
 *
 * Cada uma dessas quatro tem mutação abaixo.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { consomeConstante } = require("./lib/consumo.cjs");
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "ira-decision-tree.ts";
const LIB = "lib/injuria-renal-aguda.ts";
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ira-"));
let arv = null;
let lib = null;
try {
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, ARVORE),
  ], { cwd: appDir, stdio: "pipe" });
  arv = Object.values(require(path.join(tempDir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
  lib = require(path.join(tempDir, "lib/injuria-renal-aguda.js"));
} catch (erro) {
  falhas.push(`a árvore da IRA não compilou — NADA foi conferido: ${String(erro).slice(0, 200)}`);
}

const nos = arv ? arv.nodes : {};
const tudo = arv ? textosDoNo(nos).join("\n") : "";

if (Object.keys(nos).length < 10) {
  falhas.push(`só ${Object.keys(nos).length} nós — esperado 12+. A varredura pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;

// ── 1. OS DOIS EIXOS, E O CONTRASTE QUE ENSINA ─────────────────────────────
//
// ⚠️ O CONTRASTE É A FRASE MENOS INTUITIVA DO MÓDULO, e a mais fácil de alguém
// apagar por parecer redundante: o app já usa `< 0,5 mL/kg/h` em 30 nós. A
// diferença é que lá é META e aqui é CRITÉRIO — e ninguém junta as duas coisas
// sozinho (D-46).
{
  const pecas = [
    ["o contraste meta × critério", /MESMO NÚMERO QUE VOCÊ PERSEGUE COMO META/i],
    ["que o estágio é o PIOR dos dois eixos", /PIOR DOS DOIS EIXOS/i],
    // ⚠️ A ÂNCORA ERA A VINHETA. Casava "um paciente ANÚRICO HÁ 12 HORAS já é
    // estágio 3" — e a frase foi reescrita por VARIÁVEIS justamente porque
    // descrever gente inventada é pressuposição disfarçada de didática. A peça
    // que a trava protege é o CASO (anúria fecha estágio 3 com creatinina
    // intacta), não a redação com sujeito.
    ["o caso da anúria com creatinina normal", /AN[ÚU]RIA de 12 horas j[áa] [ée] est[áa]gio 3/i],
    ["os limiares de creatinina", /1,5 a 1,9 vezes a base/i],
    ["os limiares de diurese", /0,3 mL\/kg\/h por 24 h/i],
  ].filter(([, re]) => !re.test(tudo));
  if (pecas.length) {
    falhas.push(
      `os dois eixos do KDIGO perderam ${pecas.length} peça(s): ${pecas.map((x) => x[0]).join(" · ")}.\n` +
      `      ⚠️ Sem o CONTRASTE, o módulo informa um limiar que o app já usa em 30 nós como meta de ` +
      `perfusão, e ninguém percebe que o mesmo número sustentado DIAGNOSTICA. É a frase que ensina, ` +
      `não a que informa.`
    );
  } else ok++;

  // A revisão em curso, com as três coisas na ordem — e SEM virar fonte.
  const rev = lib?.IRA_REVISAO_EM_CURSO ?? "";
  const revPecas = [
    ["que existe revisão em curso", /revis[ãa]o em curso/i],
    // ⚠️ A REGEX MEDIA MENÇÃO, NÃO AFIRMAÇÃO — e a mutação provou.
    //
    // A primeira versão era /RASCUNHO/i. A palavra aparece TRÊS vezes na
    // constante ("está em RASCUNHO", "do rascunho são idênticos", "o rascunho
    // acrescenta"), então trocar a AFIRMAÇÃO por "revisão publicada" deixava as
    // outras duas e a trava passava — sobre um texto que agora dava ao rascunho
    // a autoridade de diretriz publicada.
    //
    // O que se exige é a DECLARAÇÃO: que o documento ESTÁ em rascunho, e que ele
    // diz isso de si mesmo.
    ["que é RASCUNHO, declarado", /est[áa] em RASCUNHO/i],
    ["que o próprio documento se declara assim", /declara de si mesmo/i],
    ["que os limiares NÃO mudam", /LIMIARES NÃO MUDAM/i],
    ["que o eixo novo é biomarcador indisponível", /biomarcador de dano renal/i],
  ].filter(([, re]) => !re.test(rev));
  if (revPecas.length) {
    falhas.push(
      `a nota sobre a KDIGO 2026 perdeu ${revPecas.length} elemento(s): ${revPecas.map((x) => x[0]).join(" · ")}.\n` +
      `      ⚠️ Ela existe para responder "o app está velho?" — e a resposta tem três partes NESSA ordem: ` +
      `há revisão, os limiares não mudam, o eixo novo é indisponível. Sem "rascunho" declarado, o app ` +
      `dá autoridade a um documento que diz não tê-la.`
    );
  } else ok++;
}

// ── 2. AS PERGUNTAS PELO OBSERVÁVEL, NUNCA PELA CLASSIFICAÇÃO ──────────────
//
// ⚠️ ESTA É A CONFERÊNCIA CENTRAL DO DESENHO. "É pré-renal, renal ou
// obstrutivo?" pede a conclusão ao usuário — o defeito das toxidromes e dos
// padrões do abdome. Quem revisar o módulo tenderá a "organizá-lo" assim.
{
  const decisoes = Object.entries(nos).filter(([, n]) => n.type === "decision");
  if (decisoes.length < 3) {
    falhas.push(`só ${decisoes.length} nós de decisão — o fluxo perdeu bifurcações.`);
  } else ok++;

  const CLASSIFICA = /pr[ée].renal|p[óo]s.renal|intr[íi]nsec/i;
  const pedeClassificacao = decisoes.filter(([, n]) =>
    CLASSIFICA.test(n.question ?? "") || (n.options ?? []).some((o) => CLASSIFICA.test(o.label ?? "")));
  if (pedeClassificacao.length) {
    falhas.push(
      `${pedeClassificacao.length} nó(s) passaram a pedir a CLASSIFICAÇÃO em vez do observável: ` +
      `${pedeClassificacao.map(([id]) => id).join(", ")}.\n` +
      `      ⚠️ "É pré-renal, renal ou obstrutivo?" devolve ao usuário a conclusão que o app deveria ` +
      `tirar. É o mesmo defeito das toxidromes ("qual toxidrome?") e dos padrões do abdome — e a ` +
      `correção é a mesma: pergunte o que se VÊ.`
    );
  } else ok++;

  // E os rótulos seguem SINAIS PRIMEIRO, NOME DEPOIS (PD-5).
  const NOMES_NO_INICIO = /^(Pr[ée].renal|Renal|Obstrutivo|Hipovol[êe]mico|Nefrot[óo]xico)\b/i;
  const invertidos = decisoes.flatMap(([id, n]) =>
    (n.options ?? []).filter((o) => NOMES_NO_INICIO.test(o.label ?? "")).map((o) => `${id}: « ${o.label} »`));
  if (invertidos.length) {
    falhas.push(
      `${invertidos.length} rótulo(s) voltaram a começar pelo NOME da categoria:\n` +
      invertidos.map((x) => `        ${x}`).join("\n") + "\n" +
      `      ⚠️ O achado vem antes do termo (PD-5). Quem não domina a taxonomia para na palavra.`
    );
  } else ok++;
}

// ── 3. A OBSTRUÇÃO É A PRIMEIRA DA EXCLUSÃO ────────────────────────────────
//
// ⚠️ A ORDEM É CLÍNICA, NÃO ESTÉTICA: a obstrução é a única reversível em
// MINUTOS, e estava ausente do app inteiro (zero menções a sonda vesical, globo
// ou bexigoma nas 17 árvores anteriores). A ordem dos livros — pré, renal,
// pós-renal — colocaria a única reversível no fim.
{
  // Derivado do grafo: a partir da ENTRADA REAL da árvore, todo caminho passa
  // por `obstrucao_check` ANTES de `volume_check` e de `nefrotoxico_check`.
  //
  // ⚠️ A ÂNCORA ERA `base_check`, E ELE DEIXOU DE EXISTIR (2026-08-18): a §6 da
  // especificação o substituiu por `sobre_drc`, com quatro saídas em vez de
  // três. A trava media a coisa certa — a ORDEM — a partir de um lugar que
  // sumiu, e passou a devolver Infinity para os três, o que reprova sem
  // informar. Agora a âncora é `entryNodeId`, derivada da própria árvore: ela
  // não pode ficar obsoleta de novo.
  const ordem = (alvo) => {
    const fila = [[arv.entryNodeId, 0]];
    const visto = new Set();
    while (fila.length) {
      const [id, d] = fila.shift();
      if (!id || visto.has(id)) continue;
      visto.add(id);
      if (id === alvo) return d;
      const n = nos[id];
      if (!n) continue;
      for (const o of n.options ?? []) fila.push([o.next, d + 1]);
      if (n.next) fila.push([n.next, d + 1]);
    }
    return Infinity;
  };
  const dObst = ordem("obstrucao_check");
  const dVol = ordem("volume_check");
  const dNef = ordem("nefrotoxico_check");
  if (!(dObst < dVol && dObst < dNef)) {
    falhas.push(
      `a obstrução deixou de ser a PRIMEIRA da exclusão (obstrução ${dObst}, volume ${dVol}, nefrotóxico ${dNef}).\n` +
      `      ⚠️ Ela é a única causa reversível em MINUTOS, e a única que estava ausente do app inteiro. ` +
      `A ordem dos livros (pré-renal, renal, pós-renal) põe a reversível no fim — e é por isso que ela ` +
      `se esquece.`
    );
  } else ok++;

  // E a conduta da obstrução tem de trazer a sonda como DIAGNÓSTICA e a
  // diurese pós-obstrutiva, que é o efeito colateral que surpreende.
  const pecas = [
    ["a sonda como exame diagnóstico", /A SONDA VESICAL É BARATA, RÁPIDA E DIAGNÓSTICA/i],
    ["a diurese pós-obstrutiva", /DIURESE PÓS-OBSTRUTIVA/i],
    ["que sonda que não drena NÃO exclui", /NÃO EXCLUI OBSTRUÇÃO|n[ãa]o exclui obstru/i],
    ["a obstrução acima da bexiga", /ACIMA da bexiga/i],
  ].filter(([, re]) => !re.test(tudo));
  if (pecas.length) {
    falhas.push(`a conduta da obstrução perdeu ${pecas.length} peça(s): ${pecas.map((x) => x[0]).join(" · ")}.`);
  } else ok++;

  // ⚠️ E O "NÃO SEI" DA OBSTRUÇÃO NÃO PODE PULAR PARA O VOLUME.
  const naoSei = (nos.obstrucao_check?.options ?? []).find((o) => o.id === "nao_sei");
  if (!naoSei) {
    falhas.push("o nó da obstrução perdeu a saída para quem não conseguiu examinar a bexiga.");
  } else if (naoSei.next !== "obstrucao_conduta") {
    falhas.push(
      `quem não sabe se há obstrução passou a ir para "${naoSei.next}".\n` +
      `      ⚠️ A dúvida tem de levar à SONDA, não ao próximo diagnóstico: passar sonda é barato e ` +
      `diagnóstico, e a obstrução não examinada é a que se perde.`
    );
  } else ok++;
}

// ── 4. A BASE DE CREATININA, E A SAÍDA DO "NÃO SEI" COM CONTEÚDO ───────────
{
  // ⚠️ O NÓ MUDOU DE NOME E GANHOU UMA SAÍDA (2026-08-18): `base_check` virou
  // `sobre_drc` (§6), e quem sabe que a base era normal mas não tem o valor
  // ganhou destino próprio — `sem_valor` → `sem_base`. O que a trava protege
  // continua sendo o mesmo: que essa saída EXISTA e tenha conteúdo próprio,
  // porque ela é o caso COMUM.
  const base = nos.sobre_drc;
  const naoSei = (base?.options ?? []).find((o) => o.next === "sem_base");
  if (!base || !naoSei) {
    falhas.push("o nó da creatinina de base, ou a saída de quem não a tem, desapareceu.");
  } else if (naoSei.next !== "sem_base") {
    falhas.push(
      `quem não sabe a base passou a ir para "${naoSei.next}" em vez de \`sem_base\`.\n` +
      `      ⚠️ Sem destino próprio, a saída vira atalho e o médico perde o conteúdo que existe ` +
      `exatamente para ele — e essa saída é o CASO COMUM, não a exceção.`
    );
  } else ok++;

  const semBase = textosDoNo(nos.sem_base ?? {}).join("\n");
  // ⚠️ AS PISTAS DE CRONICIDADE MUDARAM DE LUGAR, E A TRAVA MUDOU COM ELAS.
  //
  // Elas viviam como TEXTO no `porque` de `sem_base` — e ali afirmavam sobre um
  // paciente que o app nunca examinou (nenhuma delas era perguntada em caminho
  // nenhum). Viraram o ramo de descoberta de `sobre_drc`, como PERGUNTA.
  //
  // A razão da trava sobrevive à mudança de contexto (R-93): o conteúdo não pode
  // sumir. O que muda é ONDE ele tem de estar — e exigir que continuasse em
  // `sem_base` seria exigir a volta do defeito.
  const pistas = textosDoNo(nos.drc_pistas ?? {}).join("\n");
  const pecas = [
    ["a palavra PRESUMIDO, que é da diretriz", /PRESUMIDO/i, semBase],
    ["as duas janelas (48 h e 7 dias)", /48 HORAS/i, semBase],
    ["a janela de 7 dias", /7 DIAS/i, semBase],
    ["tratar como agudo até prova em contrário", /AGUDO AT[ÉE] PROVA EM CONTR[ÁA]RIO/i, semBase],
    ["o volume mais cauteloso", /VOLUME MAIS CAUTELOSO/i, semBase],
    ["as pistas de cronicidade, agora como pergunta", /RINS PEQUENOS/i, pistas],
    ["o sinal de beira de leito, agora como pergunta", /lúcido, comendo e sem falta de ar/i, pistas],
    ["a honestidade sobre o que exige exame", /EXIGE ULTRASSOM/i, pistas],
  ].filter(([, re, onde]) => !re.test(onde));
  if (pecas.length) {
    falhas.push(
      `a saída "não sei a base" perdeu ${pecas.length} peça(s): ${pecas.map((x) => x[0]).join(" · ")}.\n` +
      `      ⚠️ A palavra PRESUMIDO é da própria diretriz, e é ela que AUTORIZA agir sem histórico. ` +
      `Sem ela o app estaria improvisando permissão; com ela, tem procedência.`
    );
  } else ok++;
}

// ── 5. A FRONTEIRA DA DIÁLISE — COM ALTERNATIVA (R-23) ─────────────────────
//
// ⚠️ "CHAME O NEFROLOGISTA" SEM ALTERNATIVA É BECO. Sob PD-5 o usuário pode
// estar num serviço sem nefrologista — e a própria diretriz não dá número que o
// app possa oferecer em substituição, o que torna a alternativa obrigatória.
{
  const acionar = textosDoNo(nos.acionar ?? {}).join("\n");
  const pecas = [
    ["a categoria da diretriz (volume, eletrólito, ácido-base)", /VOLUME, ELETR[ÓO]LITO ou [ÁA]CIDO-BASE/i],
    ["que a diretriz RECUSA limiar isolado", /RECUSA EXPLICITAMENTE/i],
    ["que o app não escolhe modalidade nem momento", /N[ÃA]O ESCOLHE MODALIDADE/i],
    ["acionar quem existe", /acione quem existe/i],
    ["a transferência EM PARALELO", /EM PARALELO/i],
    ["que pedir vaga não é desistir de tratar", /n[ãa]o é desistir de tratar/i],
    // ⚠️ MEDIA A FRASE, NÃO A CONDUTA. Era o cabeçalho de um parágrafo de 841
    // caracteres («O QUE VOCÊ SUSTENTA ENQUANTO ISSO É O QUE ESTE APP SABE
    // FAZER: hipercalemia…»). Em 2026-08-18 o parágrafo virou cinco AÇÕES
    // visíveis, e o cabeçalho deixou de existir — a conduta que ele anunciava
    // está mais visível do que nunca. A trava passa a exigir a conduta.
    ["sustentar a hipercalemia enquanto isso", /trate a hipercalemia pelo módulo/i],
    ["sustentar acidose e oxigenação", /acidose e oxigena[çc][ãa]o pelo suporte/i],
    ["manter nefrotóxico suspenso", /nefrot[óo]xico suspenso/i],
  ].filter(([, re]) => !re.test(acionar));
  if (pecas.length) {
    falhas.push(
      `a fronteira da diálise perdeu ${pecas.length} peça(s): ${pecas.map((x) => x[0]).join(" · ")}.\n` +
      `      ⚠️ Duas coisas se protegem aqui. A PRIMEIRA é a modéstia da fonte: KDIGO 5.1.1 dá uma ` +
      `CATEGORIA e 5.1.2 recusa limiar de ureia/creatinina — chamar de "as cinco indicações" seria ` +
      `inventar precisão que ela nega. A SEGUNDA é o R-23: sem alternativa para quem não tem ` +
      `nefrologista, "acione agora" é beco.`
    );
  } else ok++;
}

// ── 6. AS TRÊS EXCLUSÕES, DECLARADAS E NÃO CONDUZIDAS ──────────────────────
{
  const pecas = [
    ["síndrome hepatorrenal", /HEPATORRENAL/i],
    ["nefrite intersticial", /NEFRITE INTERSTICIAL/i],
    ["doença glomerular", /GLOMERULAR/i],
    ["a declaração de que não as conduz", /NOMEIA E NÃO CONDUZ/i],
  ].filter(([, re]) => !re.test(tudo));
  if (pecas.length) {
    falhas.push(
      `as exclusões declaradas perderam ${pecas.length} item(ns): ${pecas.map((x) => x[0]).join(" · ")}.\n` +
      `      ⚠️ Nomear sem conduzir é a decisão de escopo (molde do PD-4): reconhecer que o caso NÃO ` +
      `cabe nas três causas comuns já é a informação que faz chamar o nefrologista mais cedo.`
    );
  } else ok++;
}

// ── 7. O QUE NÃO FAZER — os erros correntes ────────────────────────────────
{
  const pecas = [
    ["não usar diurético para \"melhorar o rim\"", /NÃO USE DIURÉTICO PARA/i],
    ["que furosemida não muda desfecho", /sem melhorar fun[çc][ãa]o nem desfecho/i],
    ["não usar dopamina em dose renal", /NÃO USE DOPAMINA EM DOSE RENAL/i],
    ["não esperar a creatinina", /NÃO ESPERE A CREATININA/i],
  ].filter(([, re]) => !re.test(tudo));
  if (pecas.length) {
    falhas.push(`a lista do que NÃO fazer perdeu ${pecas.length} item(ns): ${pecas.map((x) => x[0]).join(" · ")}.`);
  } else ok++;
}

// ── 8. CONSUMO — as constantes chegam à árvore ──────────────────────────────
{
  const fonte = lerFonte(path.join(appDir, LIB));
  const constantes = [...fonte.matchAll(/^export const (IRA_\w+) =/gm)].map((m) => m[1]);
  if (constantes.length < 12) {
    falhas.push(`só ${constantes.length} constantes lidas de ${LIB} — o parser pode ter quebrado.`);
  } else ok++;
  const mortas = constantes.filter((c) =>
    !consomeConstante({ arquivo: path.join(appDir, ARVORE), constante: c }).consome);
  if (mortas.length) {
    falhas.push(
      `${mortas.length} constante(s) de ${LIB} NÃO chegam à árvore: ${mortas.join(", ")}.\n` +
      `      ⚠️ Import não é consumo — e constante que só aparece no import é conteúdo APAGADO, não ` +
      `movido (R-15 item 12).`
    );
  } else ok++;
}

// ── 9. ALCANÇABILIDADE — nenhum nó órfão ───────────────────────────────────
{
  const alcanca = new Set();
  // ⚠️ O `next` PODE SER UM ROTEAMENTO, E A VERSÃO ANTERIOR NÃO ANDAVA NELE.
  //
  // `anda(nos[id].next)` com um objeto `{possiveis, escolher}` caía no `!nos[id]`
  // e voltava calado. Enquanto todo destino derivado também era alcançável por
  // uma opção, ninguém percebeu — a trava dizia "todos alcançáveis" medindo
  // menos do que prometia. O primeiro nó acessível SÓ por roteamento (retenção
  // urinária, no ramo da diurese) apareceu como órfão, e o órfão era a trava.
  const anda = (id) => {
    if (!id || alcanca.has(id) || !nos[id]) return;
    alcanca.add(id);
    for (const o of nos[id].options ?? []) anda(o.next);
    const prox = nos[id].next;
    if (typeof prox === "string") anda(prox);
    else if (prox && Array.isArray(prox.possiveis)) for (const p of prox.possiveis) anda(p);
  };
  anda(arv?.entryNodeId);
  const orfaos = Object.keys(nos).filter((id) => !alcanca.has(id));
  if (orfaos.length) {
    falhas.push(`${orfaos.length} nó(s) inalcançáveis do início: ${orfaos.join(", ")} — conteúdo escrito que ninguém vê.`);
  } else ok++;
}

console.log("\nInjúria renal aguda — dois eixos, obstrução primeiro, e a diálise com alternativa\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${Object.keys(nos).length} nós, todos alcançáveis, escopo e desenho preservados\n`);
process.exit(0);
