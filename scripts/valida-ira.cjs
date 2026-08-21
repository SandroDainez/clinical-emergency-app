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
      `      ⚠️ Esta saída existe porque não saber a base é o caso COMUM. Ela não pode perder ` +
      `a conduta — o que ela perdeu, em 2026-08-21, foi a ATRIBUIÇÃO à diretriz (conferência abaixo).`
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
  // ⚠️ A MODÉSTIA DA FONTE MUDOU DE LUGAR, E DE GUARDIÃO (2026-08-21).
  //
  // Esta conferência exigia, AQUI, que o `acionar` repetisse a categoria da
  // 5.1.1 e a recusa de limiar da 5.1.2. As duas saíram: elas já estão SELADAS
  // onde decidem — 5.1.1 em `trata_acidose`, 5.1.2 em `trata_uremia` —, com
  // número e grau NA TELA. Eram terceira e segunda cópia da mesma afirmação, e
  // afirmação duplicada é como duas partes do app divergem (R-95).
  //
  // ⚠️ E O GUARDIÃO FICOU MAIS FORTE, não mais fraco: a modéstia agora é
  // conferida contra o VERBATIM da KDIGO — a checagem de grau exige que alguém
  // cite a 5.1.1 e a 5.1.2 com o grau que o arquivo de fontes registra ("Not
  // Graded"), e reprova se ninguém as citar. Antes, bastava a redação bater
  // dentro de um nó; agora o grau bate contra o texto da diretriz.
  const pecas = [
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
      `      ⚠️ O que se protege aqui é o R-23: sem alternativa para quem não tem nefrologista, ` +
      `"acione agora" é beco. (A modéstia da fonte — 5.1.1 dá uma CATEGORIA, 5.1.2 recusa limiar ` +
      `isolado — mudou de guardião: agora é conferida contra o VERBATIM, na checagem de grau.)`
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

// ── A ATRIBUIÇÃO QUE SÓ VOLTA COM O TEXTO ──────────────────────────────────
{
  // ⚠️ ESTA CONFERÊNCIA É UMA AUSÊNCIA, E DE PROPÓSITO. O nó `sem_base` dizia na
  // tela que "a diretriz autoriza seguir" e que a palavra "presumido" era dela.
  // Ninguém tinha lido a diretriz: a KDIGO 2012 trata basal desconhecida nas
  // TABELAS 8 E 9, que não estão transcritas no repositório. Isso é "não
  // consegui olhar", não "não há" — e enquanto for, a conduta fica e a citação
  // não. No dia em que alguém transcrever as tabelas, esta trava sai do caminho
  // sozinha: ela só exige a ausência ENQUANTO o texto estiver ausente.
  const semBase = textosDoNo(nos.sem_base ?? {}).join("\n");
  const VERBATIM = path.join(appDir, "protocols", "fontes-verbatim", "kdigo-2012-aki.md");
  const temTabelas =
    fs.existsSync(VERBATIM) && /##[^\n]*Tabela[s]?\s*8\b/i.test(fs.readFileSync(VERBATIM, "utf8"));

  if (temTabelas) {
    ok++; // o texto chegou — a atribuição passa a ser assunto de conteúdo, não desta trava
  } else {
    const atribuicoes = [
      ["\"a diretriz autoriza\"", /a diretriz autoriza|a pr[óo]pria diretriz (resolve|autoriza)/i],
      ["\"a palavra é dela\"", /a palavra [ée] dela/i],
      ["a permissão vinda da diretriz", /diretriz[^.]{0,40}(autoriza|permite) (seguir|agir)/i],
    ].filter(([, re]) => re.test(semBase));
    if (atribuicoes.length) {
      falhas.push(
        `a saída "não sei a base" voltou a ATRIBUIR à diretriz o que ninguém leu: ${atribuicoes.map((x) => x[0]).join(" · ")}.\n` +
        `      ⚠️ ALVO NOMEADO: KDIGO 2012, Tabelas 8 e 9. Transcreva para \`protocols/fontes-verbatim/kdigo-2012-aki.md\`\n` +
        `      (uma seção \`## ... Tabelas 8 ...\`) e a atribuição volta a ter lastro. Até lá, presumir base normal\n` +
        `      é conduta NOSSA, defensável — e é assim que a tela precisa dizer.`
      );
    } else ok++;
  }
}

// ── 7. O QUE NÃO FAZER — os erros correntes ────────────────────────────────
{
  // ⚠️ ESTA CONFERÊNCIA FOI REESCRITA (R-87): ela ancorava na REDAÇÃO —
  // /NÃO USE DIURÉTICO PARA/ e /sem melhorar função nem desfecho/ — e reprovou
  // quando o texto MELHOROU, ao virar constante única da família. Redação é
  // proxy do conteúdo; o que importa é que a armadilha exista numa fonte só e
  // chegue aos DOIS lugares: o ponto da tentação e a recapitulação.
  const familia = [
    ["volume pela creatinina", "ARMADILHA_VOLUME_PELA_CREATININA", "pre_renal"],
    ["diurético para o rim", "ARMADILHA_DIURETICO_PARA_O_RIM", "alca_congesto"],
    ["diurético para PREVENIR", "ARMADILHA_DIURETICO_PARA_PREVENIR", null],
    ["a exceção da sobrecarga", "ALCA_QUANDO_HA_SOBRECARGA", "alca_congesto"],
    ["dopamina em dose renal", "ARMADILHA_DOPAMINA_RENAL", null],
  ];
  const libTexto = lerFonte(path.join(appDir, LIB));
  for (const [nome, constante, tentacao] of familia) {
    if (!new RegExp(`^export const ${constante} =`, "m").test(libTexto)) {
      falhas.push(`a armadilha "${nome}" não existe como constante única em ${LIB} — voltou a ser texto solto.`);
      continue;
    }
    // ⚠️ CONTA O VALOR, NÃO O NOME: `tudo` é a árvore COMPILADA — o nome da
    // constante já não existe lá, só o texto que ela carrega. Contar o nome
    // daria 0 e leria como "sumiu", que é falso negativo carimbado de vermelho.
    const valor = lib?.[constante];
    if (typeof valor !== "string") {
      falhas.push(`a armadilha "${nome}" não exporta texto de ${LIB} — nada a conferir.`);
      continue;
    }
    const usos = tudo.split(valor).length - 1;
    // Recapitulação (`nao_faca`) + ponto da tentação = 2. A dopamina tem só a
    // recapitulação: o ponto em que ela é tentadora é a tela de choque, que é
    // de OUTRO módulo — e mexer no comportamento de outro módulo está vedado.
    const esperado = tentacao ? 2 : 1;
    if (usos < esperado) {
      falhas.push(
        `a armadilha "${nome}" aparece ${usos}× na árvore, esperado ${esperado}` +
        (tentacao ? ` (recapitulação + ponto da tentação em \`${tentacao}\`).` : " (recapitulação).")
      );
    }
  }
  // A afirmação que sustenta as três — "não muda desfecho" — precisa sobreviver
  // em ALGUM lugar da família, seja qual for a frase.
  if (!/desfecho/i.test(libTexto)) {
    falhas.push('a família das armadilhas perdeu a razão: nada nela diz que o diurético não muda DESFECHO.');
  }
  // ⚠️ PREVENIR E TRATAR NÃO PODEM VOLTAR A SER UMA LINHA SÓ. São duas
  // recomendações, com graus diferentes — e a que estava na tela era a MAIS
  // FRACA. Cada grau é conferido contra o arquivo verbatim, não contra memória.
  const VERB = path.join(appDir, "protocols", "fontes-verbatim", "kdigo-2012-aki.md");
  if (!fs.existsSync(VERB)) {
    falhas.push(
      `${path.relative(appDir, VERB)} não existe — sem o TEXTO da diretriz, os graus na tela ` +
      `não têm contra o que ser conferidos. Referência bibliográfica não é fonte.`
    );
  } else {
    const verbatim = fs.readFileSync(VERB, "utf8");
    // ⚠️ TODO GRAU CITADO NA ÁRVORE É CONFERIDO CONTRA O VERBATIM. Inclui
    // "Not Graded", que é GRAU LITERAL da KDIGO — categoria própria, que diz "a
    // diretriz faz esta afirmação E não a graduou". Trocá-lo por 1A inventaria
    // uma força que a diretriz não deu; rebaixá-lo para prática aceita apagaria
    // que a diretriz a faz. As duas perdas são silenciosas.
    for (const [num, grau] of [["3.4.1", "1B"], ["3.4.2", "2C"], ["3.5.1", "1A"], ["3.1.1", "2B"], ["5.1.1", "Not Graded"], ["5.1.2", "Not Graded"]]) {
      if (!new RegExp(`${num.replace(/\./g, "\\.")}[^\n]*${grau}`).test(verbatim)) {
        falhas.push(`o verbatim da KDIGO perdeu a ${num} (${grau}) — a fonte do grau sumiu.`);
      }
      // ⚠️ CONFERE O TEXTO DA CONSTANTE, NÃO A ÁRVORE INTEIRA. A primeira versão
      // desta checagem procurava "3.4.2 … 2C" em `tudo` e passou VERDE com o
      // grau do AVISO trocado para 1A — porque o `classeOuGrau` do SELO de
      // `nao_faca` já contém "3.4.2 (2C)", e ele casava sozinho. O selo é proxy
      // do item; o que o usuário lê na linha é o item (R-87).
      const dono = { "3.4.1": "ARMADILHA_DIURETICO_PARA_PREVENIR", "3.4.2": "ARMADILHA_DIURETICO_PARA_O_RIM", "3.5.1": "ARMADILHA_DOPAMINA_RENAL" }[num];
      // A 3.1.1 e a 5.1.1 não vivem no texto do aviso: vivem no SELO
      // (`procedencia.classeOuGrau`). Conferidas ali, contra o mesmo verbatim.
      if (!dono) {
        const selos = [];
        for (const n of Object.values(nos)) {
          for (const pr of [n.procedencia, ...(n.declaracoes ?? []).map((d) => d.procedencia)]) {
            // ⚠️ SÓ CONTA QUEM CITA A RECOMENDAÇÃO COMO SUA FONTE. Um selo de
            // PRÁTICA ACEITA pode nomear o número para dizer o contrário — é o
            // caso de `trata_uremia`, cuja segunda afirmação cita a 5.1.2 para
            // registrar que ela NÃO nomeia pericardite. Tratar essa menção como
            // citação de grau seria ler a prosa e concluir o oposto do que ela diz.
            if (pr?.forca === "recomendacao_formal" && pr?.fonte?.includes(num)) {
              selos.push({ id: n.id, grau: pr.classeOuGrau });
            }
          }
        }
        if (!selos.length) {
          falhas.push(`nenhum nó cita a KDIGO ${num} — a recomendação saiu da árvore sem o verbatim sair do arquivo.`);
        }
        for (const sel of selos) {
          if (sel.grau !== grau) {
            falhas.push(
              `${sel.id}: cita a KDIGO ${num} com grau "${sel.grau}", e o verbatim diz "${grau}".\n` +
              `        ⚠️ Grau não se corrige de memória. "Not Graded" é categoria da própria KDIGO — trocá-lo\n` +
              `        por uma classe inventa força; rebaixá-lo para prática aceita apaga que a diretriz o afirma.`
            );
          }
        }
        continue;
      }
      const texto = lib?.[dono] ?? "";
      if (!new RegExp(`${num.replace(/\./g, "\\.")}[^\n]{0,20}${grau}`).test(texto)) {
        falhas.push(
          `\`${dono}\` não diz mais QUAL recomendação a sustenta: falta "${num} … ${grau}" NO PRÓPRIO AVISO.\n` +
          `        ⚠️ Prevenir (3.4.1, 1B) e tratar (3.4.2, 2C) são afirmações DIFERENTES. Uma linha só esconde a mais forte.\n` +
          `        « ${texto.slice(0, 110)}… »`
        );
      }
    }
  }
  // ── PROXIMIDADE: O NEGATIVO E A SUA EXCEÇÃO NÃO SE SEPARAM ────────────────
  //
  // ⚠️ ISTO NÃO É ESTILO, É A ASSERÇÃO. A 3.4.2 tem duas faces — "não use para
  // tratar a lesão" E "exceto no manejo da sobrecarga de volume". Um card com só
  // a primeira produz um FALSO ABSOLUTO: o médico lê "não use diurético na IRA" e
  // não vê a sobrecarga, que é justamente a indicação que resta e a que ele tem na
  // frente com o paciente congesto. Não basta as duas estarem no mesmo nó: a
  // exceção tem de ser o item IMEDIATAMENTE seguinte, porque quem lê uma lista
  // pára no primeiro item que responde à pergunta dele.
  {
    const negativo = lib?.ARMADILHA_DIURETICO_PARA_O_RIM;
    const excecao = lib?.ALCA_QUANDO_HA_SOBRECARGA;
    if (!negativo || !excecao) {
      falhas.push("as duas faces da 3.4.2 não existem como constantes — a proximidade não tem o que conferir.");
    } else {
      let cards = 0;
      for (const n of Object.values(nos)) {
        const itens = n.actions ?? [];
        const i = itens.indexOf(negativo);
        if (i < 0) continue;
        cards += 1;
        if (itens[i + 1] !== excecao) {
          falhas.push(
            `${n.id}: o "não use para tratar a lesão" (3.4.2) aparece SEM a sua exceção logo depois.\n` +
            `        ⚠️ FALSO ABSOLUTO. O leitor conclui "não use diurético na IRA" e perde a sobrecarga,\n` +
            `        que é a única indicação que a própria 3.4.2 preserva. Separar não omite — muda a asserção.\n` +
            `        ➜ item seguinte hoje: ${itens[i + 1] ? `« ${itens[i + 1].slice(0, 80)}… »` : "(nenhum — é o último do card)"}`
          );
        }
      }
      if (!cards) falhas.push("o negativo da 3.4.2 sumiu de todos os cards — não há proximidade a conferir.");
    }
  }
  // ── A RESSALVA DA 3.1.1 ANDA COLADA (regra C) ────────────────────────────
  //
  // ⚠️ "Na ausência de choque hemorrágico" É a condição da recomendação, não um
  // adorno. Separada, sobra "use cristaloide, não coloide" — que num choque
  // hemorrágico é o conselho ERRADO. A conferência é a mesma dos avisos: conta o
  // VALOR da constante na árvore compilada, então partir em duas linhas quebra.
  {
    const cristaloide = lib?.PRE_RENAL_CRISTALOIDE;
    if (typeof cristaloide !== "string") {
      falhas.push("PRE_RENAL_CRISTALOIDE não existe — a escolha do fluido (3.1.1) saiu do módulo.");
    } else {
      if (!/hemorr[áa]gico/i.test(cristaloide)) {
        falhas.push(
          "a recomendação da 3.1.1 perdeu a ressalva do CHOQUE HEMORRÁGICO.\n" +
          "        ⚠️ FALSO ABSOLUTO: sem ela sobra \"cristaloide em vez de coloide\", que no choque hemorrágico\n" +
          "        é o conselho errado. A ressalva é a condição da recomendação, e anda no MESMO item."
        );
      }
      // ⚠️ CONTA NAS AÇÕES, NÃO EM `tudo`: a declaração por afirmação repete o
      // texto do item de propósito (é assim que ela diz qual linha cobre), e
      // contar as duas daria 2 onde o certo é 1. O objeto aqui é a LINHA DA
      // TELA — é ela que não pode ser partida.
      const nasAcoes = Object.values(nos).reduce(
        (n, no) => n + (no.actions ?? []).filter((i) => i === cristaloide).length, 0);
      if (nasAcoes !== 1) {
        falhas.push(
          `a linha da 3.1.1 aparece ${nasAcoes}× nas AÇÕES da árvore, esperado 1 — em item ÚNICO e inteiro.\n` +
          "        ⚠️ Partir a recomendação da sua ressalva em duas linhas é o que esta contagem impede."
        );
      }
    }
  }

  // ── A EXCLUSÃO DA RABDOMIÓLISE FICA REGISTRADA ───────────────────────────
  //
  // ⚠️ ESTE REGISTRO EXISTE PARA IMPEDIR UMA INVENÇÃO FUTURA. A KDIGO 2012
  // excluiu rabdomiólise do escopo, por escrito. Sem a anotação, alguém "acha"
  // uma justificativa KDIGO para a linha da CPK daqui a um ano — o módulo inteiro
  // cita KDIGO, e a vizinhança convence. É a procedência herdada por vizinhança,
  // desta vez prevenida em vez de corrigida.
  if (fs.existsSync(VERB) && !/rhabdomyolysis/i.test(fs.readFileSync(VERB, "utf8"))) {
    falhas.push(
      "o registro da EXCLUSÃO da rabdomiólise sumiu do verbatim da KDIGO.\n" +
      "        ⚠️ Ele não é curiosidade: é o que impede alguém carimbar KDIGO na linha da CPK alta\n" +
      "        daqui a um ano. A diretriz diz, na metodologia, que excluiu esses estudos."
    );
  }

  // ── LINHA RECOLHIDA REPETIDA EM MAIS DE UM NÓ ────────────────────────────
  //
  // ⚠️ ESTA CONFERÊNCIA NASCEU DE UMA MUTAÇÃO QUE PASSOU VERDE (2026-08-21). A
  // tabela de estadiamento vivia em DOIS nós — `fazer_agora`, recolhida e sem
  // selo, e `estagio_kdigo`, que é o canônico e tem o selo de definição. Ao
  // desfazer a duplicação, testei devolvê-la: NENHUMA trava reprovou. Duplicar
  // afirmação clínica é o mecanismo pelo qual duas partes do app divergem — e o
  // repositório já tinha prova disso, porque as duas cópias JÁ diferiam na nota
  // da calculadora.
  //
  // ⚠️ REPETIÇÃO NEM SEMPRE É DEFEITO, e por isso a lista é declarada em vez de
  // proibida: um aviso pode caber legitimamente em dois caminhos que o usuário
  // percorre alternativamente. O que a trava impede é repetição NOVA entrar sem
  // ninguém decidir — que é como a divergência começa.
  {
    const REPETICOES_DECLARADAS = [
      // [texto que se repete, por quê] — os quatro medidos em 2026-08-21.
      ["pseudo-hipercalemia", "o mesmo aviso serve a quem NÃO tem o valor e a quem já está tratando"],
      ["BEXIGA CHEIA NÃO É ANÚRIA", "é a mesma armadilha em dois pontos do fluxo, e o segundo é onde se age"],
      ["Presumir base normal é o erro mais seguro dos dois", "as duas saídas do \"não sei\" chegam à mesma decisão"],
      ["a prova de volume que ajudaria um pré-renal congestiona um crônico", "idem — mesma ressalva, dois caminhos"],
    ];
    const mapa = new Map();
    for (const n of Object.values(nos)) {
      for (const x of [...(n.porque ?? []), ...(n.evidence ?? [])]) {
        if (!mapa.has(x)) mapa.set(x, new Set());
        mapa.get(x).add(n.id);
      }
    }
    const novas = [];
    for (const [txt, ids] of mapa) {
      if (ids.size < 2) continue;
      if (REPETICOES_DECLARADAS.some(([marca]) => txt.includes(marca))) continue;
      novas.push({ txt, ids: [...ids] });
    }
    if (novas.length) {
      falhas.push(
        `${novas.length} linha(s) recolhida(s) repetida(s) em mais de um nó, sem declaração:\n` +
        novas.map((n) => `        [${n.ids.join(", ")}] « ${n.txt.slice(0, 90)}… »`).join("\n") + "\n" +
        `      ⚠️ Duplicar afirmação é como duas partes do app divergem: a cópia que ninguém relê é a que\n` +
        `      envelhece errado. Se a afirmação tem selo em algum nó, o outro APONTA — não copia. Se a\n` +
        `      repetição for legítima, declare-a em REPETICOES_DECLARADAS com o motivo.`
      );
    }
  }

  // ── O RAMO DO "NÃO SEI" DA ACIDOSE NÃO PODE TER NÚMERO ───────────────────
  //
  // ⚠️ É O BURACO QUE O R-97 MANDA NÃO PREENCHER. O `pH < 7,0` saiu como limiar
  // e NADA entrou no lugar — nem 7,20, que é critério de INCLUSÃO do BICARICU-2
  // (ensaio negativo), não limiar de conduta. O ramo guiado existe justamente
  // para responder "grave ou refratária?" SEM número: ele pergunta o que se pode
  // VER, não o que se pode medir.
  //
  // ⚠️ E A TENTAÇÃO É DE SIMETRIA: tirar um número deixa um buraco, e buraco pede
  // número. Esta conferência é o que impede o próximo a mexer aqui de "completar"
  // o ramo com um corte plausível.
  {
    const RAMO = [
      "ACIDOSE_GRAVE_DEFINICAO", "ACIDOSE_REFRATARIA_DEFINICAO", "ACIDOSE_GUIADA_INTRO",
      "ACIDOSE_SEM_LIMIAR",
    ];
    const guiado = require(path.join(tempDir, "lib/descoberta-guiada-renal.js"));
    const textos = [];
    for (const k of RAMO) {
      if (typeof guiado?.[k] !== "string") {
        falhas.push(`${k} sumiu de lib/descoberta-guiada-renal.ts — o ramo do "não sei" da acidose perdeu uma peça.`);
        continue;
      }
      textos.push([k, guiado[k]]);
    }
    for (const campo of guiado?.CAMPOS_DE_ACIDOSE_GUIADA ?? []) {
      textos.push([`campo ${campo.id}`, campo.label]);
      for (const p of campo.presets ?? []) textos.push([`preset ${campo.id}`, p.label]);
    }
    if (!(guiado?.CAMPOS_DE_ACIDOSE_GUIADA ?? []).length) {
      falhas.push('CAMPOS_DE_ACIDOSE_GUIADA vazio — o ramo do "não sei" da acidose não existe, e isto não é "nenhum número".');
    }
    // Números com casa decimal, unidade de gasometria, ou comparação com pH/BE.
    const NUMERO = /\d+[,.]\d+|\bpH\s*[<>≤≥=]|\bBE\b|base\s*excess\s*[<>≤≥]|bicarbonato\s*[<>≤≥]|\b\d+\s*(mEq|mmol|mg\/dL)\b/i;
    for (const [onde, txt] of textos) {
      if (NUMERO.test(txt)) {
        falhas.push(
          `${onde}: entrou NÚMERO no ramo guiado da acidose — « ${String(txt).slice(0, 90)}… »\n` +
          `      ⚠️ R-97: o ramo pergunta o que se pode VER, não o que se pode medir. Nem pH, nem BE,\n` +
          `      nem bicarbonato, nem decimal. "Não temos limiar" é informação verdadeira; preencher\n` +
          `      o buraco com o primeiro número plausível é o defeito que este ramo existe para evitar.`
        );
      }
    }
  }

  // ── A TERCEIRA SAÍDA DA PERGUNTA DE JULGAMENTO ───────────────────────────
  //
  // ⚠️ TODA DECISÃO TEM "NÃO SEI", e esta tela nasceu sem. Trocar um limiar falso
  // por uma pergunta de julgamento transfere o julgamento inteiro para o usuário
  // — e o usuário-alvo deste app é exatamente quem não o tem. Sem ramo, a tela
  // vira beco, e a saída provável é chutar ou abandonar.
  {
    const guiado = require(path.join(tempDir, "lib/descoberta-guiada-renal.js"));
    const campo = (guiado?.CAMPO_DE_JULGAMENTO_ACIDOSE ?? [])[0];
    const temNaoSei = (campo?.presets ?? []).some((p) => p.value === "nao_sei");
    if (!temNaoSei) {
      falhas.push(
        'a pergunta "grave ou refratária?" perdeu a saída "não sei".\n' +
        "      ⚠️ Ela vira BECO para quem não tem o julgamento — que é o usuário-alvo. A terceira\n" +
        "      saída abre RAMO, com perguntas de beira de leito; nunca texto explicativo."
      );
    }
    if (!nos.acid_descobrir) {
      falhas.push('o nó `acid_descobrir` sumiu — a saída "não sei" da acidose deixou de ter para onde ir.');
    }
  }

  const restantes = [
    ["não esperar a creatinina", /NÃO ESPERE A CREATININA/i],
  ].filter(([, re]) => !re.test(tudo));
  if (restantes.length) {
    falhas.push(`a lista do que NÃO fazer perdeu ${restantes.length} item(ns): ${restantes.map((x) => x[0]).join(" · ")}.`);
  }
  if (!falhas.length) ok++;
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
