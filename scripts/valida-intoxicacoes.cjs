#!/usr/bin/env node
/**
 * PROMETE
 *   Que o LAST exista com a conduta completa e chegue às superfícies onde o
 *   anestésico local é administrado; que o flumazenil mantenha os DOIS tetos
 *   separados e que o nó dos antídotos não volte a usar o da sedação
 *   consciente; que o "não sei o agente" continue separado do "sei a
 *   substância", cada um com o seu caminho; que exista a saída de NÃO tratar; e
 *   que nenhum bloco longo apareça duplicado na mesma tela.
 *
 * NÃO PROMETE
 *   Cobertura da toxicologia — o módulo é fluxo de toxidrome com apêndice de
 *   consulta, e antídoto de agente raro não é lacuna dele. Primeira trava do
 *   módulo, nascida depois da auditoria (R-21).
 *
 * UNIVERSO
 *   A árvore de intoxicações compilada, lib/last-emulsao-lipidica.ts e as
 *   superfícies que passaram a consumir o ponteiro do LAST.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ──────────────────────────────────────────────
 *
 * 1. D-29 — EMULSÃO LIPÍDICA NÃO EXISTIA NO APP. `grep` por "emulsão
 *    lipídica", "Intralipid" e "LAST" retornava ZERO arquivos. Antídoto único,
 *    time-critical, sem substituto, para a complicação que a anestesia
 *    regional produz — num app mantido por anestesiologista.
 *
 * 2. DOIS TETOS DE FLUMAZENIL, E O NÓ DOS ANTÍDOTOS USAVA O ERRADO. O texto
 *    escrito à mão dizia "0,2 mg IV (máx 1 mg)" — o teto da REVERSÃO DE SEDAÇÃO
 *    CONSCIENTE — dentro do módulo de INTOXICAÇÃO, onde o teto é 3 mg.
 *    ⚠️ Mesma família do defeito da naloxona (uma dose para dois cenários), e
 *    sobreviveu à correção dela porque FICOU FORA DA FONTE ÚNICA: o que está
 *    fora não recebe as correções, e ninguém percebe porque o texto ao lado
 *    está certo.
 *
 * 3. UM RÓTULO PARA DOIS ESTADOS EPISTÊMICOS OPOSTOS. "Indefinido / substância
 *    conhecida" somava "não faço ideia" com "sei exatamente qual" — e nenhum
 *    dos dois tinha conduta. R-48 refinado na direção INVERSA à do abdome
 *    agudo: lá sobrava conteúdo no nó do "não sei"; aqui o nó não existia.
 *
 * 4. TODAS AS SAÍDAS TERMINAVAM EM FAZER ALGO. Não havia caminho para a
 *    exposição que não precisa de tratamento — que é uma fatia enorme do que
 *    chega ao pronto-socorro.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-tox-"));
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "poisoning-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "poisoning-decision-tree.js")).poisoningDecisionTree;
} catch (erro) {
  falhas.push(`a árvore de intoxicações não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

const { textosDoNo } = require("./lib/textos-do-no.cjs");

/**
 * TODO o texto do nó, e o dos nós alcançados a partir dele.
 *
 * ⚠️ POR QUE MUDOU (2026-08-17). Lia só `node.actions`, o que bastava enquanto
 * `tox_last` era UM nó de 6.179 caracteres com o protocolo inteiro em texto
 * corrido. No dia em que ele virou uma TRILHA de cinco nós, as conferências deste
 * bloco reprovaram todas — e nenhum caractere havia saído do app.
 *
 * O nome do nó era um PROXY do que elas garantem: que a conduta do LAST está
 * COMPLETA no caminho que o médico percorre. O proxy quebrou quando a estrutura
 * melhorou. R-87: generalize a asserção, não afrouxe o critério.
 */
/**
 * ⚠️ A SUBÁRVORE DO COLINÉRGICO TEM ARESTA DE VOLTA (`coli_alvo` → `tox_colinergico`),
 * porque o ciclo da atropina é um laço real: dobra a cada 5 min até três sinais.
 * `vistos` impede a recursão infinita; a profundidade cobre os quatro nós.
 */
function subarvore(id, prof = 5, vistos = new Set()) {
  if (!arvore?.nodes?.[id] || vistos.has(id) || prof < 0) return [];
  vistos.add(id);
  const no = arvore.nodes[id];
  const filhos = [];
  for (const o of no.options ?? []) if (typeof o?.next === "string") filhos.push(o.next);
  // ⚠️ só desce por `next` que continua o MESMO sub-fluxo — sem isto, `tox_last`
  // alcançaria `uti` e metade do módulo, e qualquer frase passaria por existir
  // em qualquer lugar.
  // ⚠️ O PREFIXO É O QUE DELIMITA O SUB-FLUXO. Sem ele, `tox_last` alcançaria
  // `uti` e metade do módulo, e qualquer frase passaria por existir em qualquer
  // lugar. Cada trilha nomeia os seus nós com o próprio prefixo — é o que faz o
  // limite ser derivado, e não uma lista.
  if (typeof no.next === "string" && /^(last_|coli_)/.test(no.next)) filhos.push(no.next);
  return [no, ...filhos.flatMap((f) => subarvore(f, prof - 1, vistos))];
}

const acoesDe = (id) =>
  subarvore(id).flatMap((n) => textosDoNo(n)).filter((t) => typeof t === "string");

/** Só o nó — para conferências sobre a MESMA TELA. */
const soDoNo = (id) =>
  (arvore?.nodes?.[id] ? textosDoNo(arvore.nodes[id]) : []).filter((t) => typeof t === "string");
const semImports = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

// ── A. D-29: o LAST existe, e com a conduta inteira ──────────────────────
{
  const last = acoesDe("tox_last").join("\n");
  if (!last) {
    falhas.push("o nó `tox_last` sumiu — a D-29 reabriu, e o app volta a não ter o antídoto do LAST em lugar nenhum.");
  } else {
    for (const [nome, padrao, porque] of [
      ["a dose acima de 70 kg", /bolus de 100 mL em 2–3 min/, "é a dose FIXA, e ela existe para ninguém calcular na urgência"],
      ["a dose abaixo de 70 kg", /1,5 mL\/kg em 2–3 min/, "abaixo de 70 kg o esquema é por peso"],
      ["a infusão de manutenção", /200–250 mL em 15–20 min/, "bolus sem infusão não sustenta o efeito"],
      ["o que fazer se não estabilizar", /repetir o bolus OU dobrar a infusão/i, "é a conduta quando a primeira dose não basta"],
      ["o teto de 12 mL/kg", /12 mL\/kg/, "e ele vem com a ressalva de que doses menores são a norma"],
      ["a apresentação do frasco", /frasco de 500 mL/, "a dose se prescreve em mL direto do frasco (R-48)"],
      ["o acionamento da circulação extracorpórea", /CIRCULAÇÃO EXTRACORPÓREA/, "a ASRA moveu isso para junto do pedido de ajuda: montar leva tempo que não existe depois do colapso"],
      ["a adrenalina em dose reduzida", /MENOR QUE 1 mcg\/kg/, "a dose convencional do ACLS piora a troca gasosa e a função cardíaca no LAST"],
      ["a lista do que evitar", /VASOPRESSINA, BLOQUEADOR DE CANAL DE CÁLCIO e BETABLOQUEADOR/, "são exclusões explícitas da ASRA"],
      ["o propofol que NÃO substitui", /PROPOFOL NÃO É EMULSÃO LIPÍDICA TERAPÊUTICA/, "é o atalho que a urgência produz: propofol é branco, lipídico e está na sala"],
      ["as DUAS razões do propofol, separadas", /ESTA RAZÃO É DIFERENTE DA DE EVITÁ-LO NA CONVULSÃO/, "uma é que ele agrava a hemodinâmica; a outra é que ele NÃO TRATA — juntar as duas apaga a segunda"],
      ["o atraso", /ATÉ 30 MINUTOS DEPOIS/, "a sala é considerada segura assim que o bloqueio dá certo, e é aí que o LAST lento aparece"],
      ["a inversão da regra da amiodarona", /REGRA QUE SE INVERTE AQUI/, "o módulo manda EVITAR amiodarona na intoxicação por bloqueador de canal de sódio; no LAST ela é a preferida"],
      ["a ressuscitação que difere do ACLS", /DIFERENTE DO ACLS PADRÃO/, "conduzir como ACLS de rotina deixa de dar o que funciona"],
      ["a vigilância depois de estabilizar", /A VIGILÂNCIA CONTINUA/, "a recorrência após melhora está descrita"],
    ]) {
      if (!padrao.test(last)) {
        falhas.push(`LAST: ${nome} sumiu — ${porque}.`);
      } else ok++;
    }

    // ⚠️ A janela de horas é ausência DECLARADA: a fonte primária não abriu.
    // Se alguém escrever um número, ou abriu a fonte (e então atualiza este
    // teste) ou inventou (R-5).
    if (/\b(12|24|4|6)\s*(a|–|-)\s*\d+\s*h\b/.test(last) && !/NÃO fixa o número de horas/.test(last)) {
      falhas.push(
        "LAST: apareceu uma janela de observação em horas sem a declaração de que o app não fixa o número. " +
        "Os tempos da ASRA são estratificados por gravidade e estão no gráfico do checklist, que não foi " +
        "aberto em sessão; uma fonte secundária diz 12–24 h sem confirmação na primária (R-5)."
      );
    } else ok++;
  }
}

// ── A2. A TRILHA DO LAST — a forma que a conversão criou (PD-8) ───────────
//
// `tox_last` era UM nó de 6.179 caracteres com o protocolo inteiro em texto
// corrido. Virou trilha de cinco nós, e estas conferências protegem o que a
// medição decidiu — não a estética.
{
  const n = (id) => arvore?.nodes?.[id];

  // ⚠️ A AJUDA E A CEC FICAM NO PRIMEIRO NÓ, junto do reconhecimento.
  // Elas não são passo de leitura: são AÇÃO PARALELA. A ASRA subiu o aviso à
  // equipe de CEC para o alto do checklist porque montar circuito leva tempo que
  // não existe depois do colapso — pô-las numa tela seguinte inverte o motivo.
  const primeiro = soDoNo("tox_last").join("\n");
  if (!/CIRCULA[ÇC][ÃA]O EXTRACORP[ÓO]REA|\bCEC\b/i.test(primeiro)) {
    falhas.push(
      "o acionamento da equipe de CEC saiu do PRIMEIRO nó do LAST. Ele é ação PARALELA ao " +
      "reconhecimento — a ASRA o subiu no checklist porque montar circuito leva tempo que não " +
      "existe depois do colapso. Numa tela seguinte, ele chega tarde por construção."
    );
  } else ok++;

  // ⚠️ A TELA DA DOSE É A MAIS LIMPA DAS SEIS, e isso é medido: ela é a fase mais
  // densa em DECISÃO por caractere do protocolo (3 decisões e 3 prazos em 786 ch),
  // e é onde o médico age. Teto de DOIS itens.
  const emulsao = n("last_emulsao");
  if (!emulsao) {
    falhas.push("o nó `last_emulsao` sumiu — a dose do antídoto voltou a dividir tela com o resto do protocolo.");
  } else {
    ok++;
    const itens = (emulsao.actions ?? []).length;
    if (itens > 2) {
      falhas.push(
        `\`last_emulsao\` tem ${itens} itens. É a tela onde o médico AGE, e a mais densa em decisão por ` +
        `caractere do protocolo: ela fica com a DOSE e o aviso do propofol, e nada mais. ` +
        `O nó de origem tinha nove.`
      );
    } else ok++;
  }

  // ⚠️ O CORTE É UMA DECISÃO, NÃO A METADE DA LISTA. As fases da ressuscitação são
  // CONTINGENTES à parada: quem estabilizou com a emulsão nunca precisa delas.
  const parada = n("last_parada");
  if (parada?.type !== "decision") {
    falhas.push(
      "`last_parada` deixou de ser decisão. A ressuscitação modificada é contingente à PARADA — " +
      "sem a pergunta, quem estabilizou lê três telas que não são dele, e o protocolo volta a ser lista."
    );
  } else ok++;
  if (!/parada|convuls/i.test(parada?.question ?? "")) {
    falhas.push("a pergunta de `last_parada` não é a da parada/convulsão — é ela que separa os dois ramos.");
  } else ok++;

  // ⚠️ A VIGILÂNCIA É COMUM AOS DOIS RAMOS. Quem não parou também precisa dela: a
  // recorrência depois da melhora está descrita.
  // ⚠️ CADA RAMO É CONFERIDO SOZINHO. A primeira versão desta asserção usava `&&`
  // entre os dois ramos, e a mutação passou: mandei o "NÃO" direto para `uti` e o
  // ramo da parada continuava chegando à vigilância, satisfazendo a condição
  // inteira. Conferência que aceita "um dos dois" não protege nenhum.
  const alcanca = (id, alvo, prof = 3) => {
    if (!id || prof < 0) return false;
    if (id === alvo) return true;
    const no = n(id);
    if (!no) return false;
    if (no.next === alvo) return true;
    return (no.options ?? []).some((o) => alcanca(o.next, alvo, prof - 1)) ||
      (typeof no.next === "string" && alcanca(no.next, alvo, prof - 1));
  };
  for (const [rotulo, opcao] of [["NÃO parou", "last_nao"], ["parou", "last_sim"]]) {
    const destino = (parada?.options ?? []).find((o) => o.id === opcao)?.next;
    if (!alcanca(destino, "last_vigilancia")) {
      falhas.push(
        `o ramo "${rotulo}" do LAST não chega mais à VIGILÂNCIA. A recorrência depois da melhora está ` +
        `descrita e o anestésico continua sendo liberado do tecido — a vigilância é dos DOIS ramos, ` +
        `e quem estabilizou é justamente quem parece não precisar dela.`
      );
    } else ok++;
  }
}

// ── A3. A TRILHA DO COLINÉRGICO — e o CICLO como decisão ──────────────────
//
// Segundo protocolo servido como parágrafo (3.658 ch). ⚠️ A forma NÃO é a do
// LAST: aqui há um CICLO — dobrar a atropina a cada 5 min até três sinais —, e
// não se pode enumerar como o ACLS faz com os choques, porque NÃO EXISTE DOSE
// MÁXIMA: o limite é o aparecimento de toxicidade por atropina.
//
// O ciclo virou uma REAVALIAÇÃO com aresta de volta. Estas conferências protegem
// justamente o que um laço numa trilha linear costuma perder.
{
  const n = (id) => arvore?.nodes?.[id];
  const alvo = n("coli_alvo");

  if (alvo?.type !== "decision") {
    falhas.push(
      "`coli_alvo` deixou de ser decisão. O ciclo da atropina VOLTA a perguntar a cada 5 min — " +
      "como instrução dentro de um parágrafo, ele vira uma frase que se lê uma vez e não se repete."
    );
  } else ok++;

  // ⚠️ A VOLTA AO PASSO DO ATAQUE É O CICLO. Se ela sumir, "dobrar a cada 5 min"
  // fica sem quem execute: o médico segue para a manutenção sem ter atropinizado.
  const volta = (alvo?.options ?? []).some((o) => o.next === "tox_colinergico");
  if (!volta) {
    falhas.push(
      "a trilha do colinérgico perdeu a VOLTA ao passo do ataque. O regime é DOBRAR a cada 5 minutos " +
      "até os três sinais — sem a aresta de volta, o ciclo não existe e a atropinização vira dose única."
    );
  } else ok++;

  // ⚠️ AS TRÊS SAÍDAS, e a terceira é a que separa atropinizado de INTOXICADO.
  // Sem ela, quem vê taquicardia grave e delírio não tem para onde ir — ou volta
  // a dobrar a dose, que é o erro que mata.
  const saidas = [
    ["atropinizou (as três presentes)", /^SIM/i],
    ["ainda não atropinizou", /^N[ÃA]O/i],
    ["toxicidade POR atropina", /peristalse|hipertermia|del[íi]rio|reten[çc][ãa]o/i],
  ];
  for (const [nome, padrao] of saidas) {
    if (!(alvo?.options ?? []).some((o) => padrao.test(String(o.label ?? "")))) {
      falhas.push(
        `a saída "${nome}" sumiu de \`coli_alvo\`. ⚠️ São TRÊS: atropinizou, ainda não, e ` +
        `intoxicou-se pela atropina — e a terceira é a que impede continuar dobrando em quem já passou do ponto.`
      );
    } else ok++;
  }

  // ⚠️ A TAQUICARDIA ISOLADA NÃO INTERROMPE — este é o item que desfaz a leitura
  // errada, e ele tem de estar NA TELA DA DECISÃO, não noutra.
  const textoAlvo = soDoNo("coli_alvo").join("\n");
  if (!/taquicardia isolada n[ãa]o interrompe/i.test(textoAlvo)) {
    falhas.push(
      "a tela da decisão do colinérgico perdeu que TAQUICARDIA ISOLADA NÃO INTERROMPE a atropinização. " +
      "⚠️ É o item que desfaz a leitura errada, e ele decide justamente nesta pergunta: quem lê taquicardia " +
      "como toxicidade para a atropina cedo, e o paciente volta a secretar."
    );
  } else ok++;

  // ⚠️ A PRALIDOXIMA NÃO É FASE. Se ela virar um nó da trilha, passa a ser passo
  // obrigatório — o oposto do que se decidiu: a atropina não depende dela.
  const idsTrilha = Object.keys(arvore?.nodes ?? {}).filter((k) => /^coli_/.test(k));
  const virouFase = idsTrilha.some((k) => /pralidoxima|oxima/i.test(k) || /pralidoxima/i.test(String(n(k)?.title ?? "")));
  if (virouFase) {
    falhas.push(
      "a pralidoxima virou uma FASE da trilha do colinérgico. ⚠️ Ela é decisão PARALELA e controversa — " +
      "as três posições existem para que o médico decida —, e como etapa ela vira passo obrigatório. " +
      "A ATROPINA é o tratamento e não depende desta decisão."
    );
  } else ok++;
}

// ── B. O LAST chega onde o anestésico local é administrado ───────────────
{
  const SUPERFICIES = [
    ["rsi-decision-tree.ts", "a topização da via aérea usa volume grande em mucosa, que absorve rápido"],
    ["anaphylaxis-decision-tree.ts", "colapso em bloqueio é diferencial de anafilaxia ao antibiótico profilático — e a adrenalina em dose padrão PIORA o LAST"],
  ];
  for (const [rel, porque] of SUPERFICIES) {
    // Import não é consumo (R-15 item 10).
    if (!/LAST_PONTEIRO_CURTO/.test(semImports(rel))) {
      falhas.push(`${rel}: não consome o ponteiro do LAST — ${porque}.`);
    } else ok++;
  }

  const causas = lerFonte(path.join(appDir, "lib/causas-reversiveis-detalhe.ts"));
  for (const [nome, padrao] of [
    ["o LAST no T de tóxicos", /ANESTÉSICO LOCAL \(LAST\)/],
    ["a dose da emulsão inline", /bolus de 100 mL em 2–3 min/],
    ["o propofol que não substitui", /PROPOFOL NÃO SUBSTITUI/],
  ]) {
    if (!padrao.test(causas)) {
      falhas.push(
        `causas-reversiveis-detalhe: ${nome} sumiu. ⚠️ Este é o único antídoto da toxicologia que vai INLINE na ` +
        `parada, e a exceção é deliberada: o resto é agente-específico e virou ponteiro; o LAST é único, ` +
        `executável e o cenário É a parada.`
      );
    } else ok++;
  }
}

// ── C. Flumazenil: dois tetos, e o certo em cada lugar ───────────────────
{
  const antidoto = acoesDe("antidoto").join("\n");
  // ⚠️ SEM COMENTÁRIOS — e a primeira versão desta trava provou por que.
  //
  // Ela lia o arquivo cru e acusou na primeira execução: a string "Flumazenil
  // 0,2 mg IV (máx 1 mg)" ainda existia… dentro do COMENTÁRIO que narra o
  // defeito corrigido. A trava casou a string certa no PAPEL errado — R-15
  // item 13, ao vivo, no mesmo dia em que a regra foi escrita.
  const arquivo = semImports("poisoning-decision-tree.ts");

  if (/Flumazenil 0,2 mg IV \(máx 1 mg\)/.test(arquivo)) {
    falhas.push(
      "o nó dos antídotos voltou a usar o teto de 1 mg. Esse é o teto da REVERSÃO DE SEDAÇÃO CONSCIENTE; " +
      "na SUPERDOSAGEM o teto cumulativo é 3 mg. Parar em 1 mg na intoxicação é parar no terço do caminho."
    );
  } else ok++;

  if (!/TETO CUMULATIVO DE 3 mg/.test(antidoto)) {
    falhas.push("o nó dos antídotos deixou de trazer o teto da superdosagem — a distinção existe no app desde a auditoria da duração de ação.");
  } else ok++;

  for (const [nome, padrao] of [
    ["a ressedação", /RESSEDAÇÃO/],
    ["as contraindicações", /NÃO usar flumazenil se/],
  ]) {
    if (!padrao.test(antidoto)) falhas.push(`nó antidoto: ${nome} sumiu.`);
    else ok++;
  }
}

// ── D. Duplicata na mesma tela ───────────────────────────────────────────
//
// `ANTIDOTO_NAO_CRUZA_DE_CLASSE` aparecia DUAS VEZES no mesmo nó — o mesmo
// parágrafo longo repetido, o que treina o leitor a pular bloco longo.
{
  for (const id of Object.keys(arvore?.nodes ?? {})) {
    // ⚠️ AQUI É `soDoNo`, NÃO `acoesDe`. Esta conferência é sobre a MESMA TELA —
    // o mesmo parágrafo duas vezes no mesmo nó. Com o leitor de subárvore ela
    // passou a ver o caminho inteiro e acusou `identificar`, que alcança
    // `tox_sedativo` e `antidoto`: dois nós DIFERENTES, cada um com a sua cópia
    // legítima do bloco do flumazenil.
    //
    // Generalizar o leitor certo e o errado juntos é como o R-87 sai pela culatra:
    // a asserção "duplicado na mesma tela" perde o sentido se "tela" virar "rota".
    const textos = soDoNo(id);
    const vistos = new Map();
    for (const t of textos) {
      if (t.length < 80) continue; // repetir uma linha curta pode ser deliberado
      vistos.set(t, (vistos.get(t) ?? 0) + 1);
    }
    for (const [texto, n] of vistos) {
      if (n > 1) {
        falhas.push(
          `nó \`${id}\`: o mesmo bloco longo aparece ${n} vezes na mesma tela — « ${texto.slice(0, 70)}… ». ` +
          `Parágrafo repetido treina o leitor a pular parágrafo longo.`
        );
      }
    }
  }
  ok++;
}

// ── C-bis. ATROPINIZAÇÃO — O PISO E O TETO SÃO COISAS SEPARADAS ──────────
//
// ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17): o nó dizia "Endpoint da
// atropinização é a AUSCULTA PULMONAR LIMPA — NÃO a frequência cardíaca nem a
// pupila". A diretriz Conitec 2018 define atropinização por TRÊS critérios:
// "frequência cardíaca acima de 80 bpm; pressão arterial sistólica acima de
// 80 mmHg; ausculta pulmonar limpa". O app negava um deles.
//
// O que a frase queria dizer era verdadeiro — taquicardia não é motivo para
// PARAR — e estava mal formulado, porque misturava o ALVO com o LIMITE. As
// conferências abaixo mantêm os dois separados, que é a única forma de a frase
// não voltar a se fundir.
//
// ⚠️ E O RISCO REAL DESTE NÓ É SUBDOSAR. Quem lê "taquicardia" como sinal de
// parar interrompe a atropina num paciente que ainda está secretando — que é
// a causa de morte desta intoxicação.
{
  const col = acoesDe("tox_colinergico").join("\n");
  const sum = arvore?.nodes?.tox_colinergico?.summary ?? "";
  const tudo = `${sum}\n${col}`;

  if (!col) {
    falhas.push("o nó `tox_colinergico` ficou sem ações — o módulo perdeu a intoxicação que mais mata por broncorreia no Brasil.");
  } else ok++;

  // 1. OS TRÊS CRITÉRIOS DO ALVO, juntos. Um só não é atropinização.
  const criterios = [
    ["ausculta limpa", /ausculta pulmonar limpa/i],
    ["FC acima de 80", /(frequência cardíaca|fc)[^.]{0,30}80/i],
    ["PAS acima de 80", /(press[ãa]o sist[óo]lica|pas)[^.]{0,30}80/i],
  ].filter(([, re]) => !re.test(tudo));
  if (criterios.length) {
    falhas.push(
      `o alvo da atropinização perdeu ${criterios.length} critério(s): ${criterios.map((c) => c[0]).join(", ")}.\n` +
      `      ⚠️ A Conitec 2018 define atropinização pelos TRÊS ao mesmo tempo. Deixar um de fora ` +
      `devolve o defeito de origem — parar cedo num paciente que ainda secreta.`
    );
  } else ok++;

  // 2. O TETO NÃO PODE VIRAR O PISO. A frase da taquicardia tem de existir E
  //    tem de vir acompanhada dos sinais que REALMENTE marcam toxicidade.
  if (!/TAQUICARDIA ISOLADA NÃO INTERROMPE/i.test(tudo)) {
    falhas.push(
      "sumiu a frase de que a taquicardia isolada não interrompe a atropinização.\n" +
      "      ⚠️ Sem ela, os três critérios do alvo se leem como \"pare quando a FC passar de 80\", " +
      "que é o erro oposto e igualmente fatal."
    );
  } else ok++;
  const toxicidade = [
    ["peristalse ausente", /perist[aá]lse ausente|aus[êe]ncia de ru[íi]dos/i],
    ["hipertermia", /hipertermia/i],
    ["delírio", /del[íi]rio/i],
    ["retenção urinária", /reten[çc][ãa]o urin[áa]ria/i],
  ].filter(([, re]) => !re.test(tudo));
  if (toxicidade.length) {
    falhas.push(
      `os sinais de toxicidade POR atropina perderam: ${toxicidade.map((t) => t[0]).join(", ")}.\n` +
      `      ⚠️ Não existe dose máxima de atropina; o limite É esta lista. Sem ela o texto diz ` +
      `"não tem teto" sem dizer como reconhecer que passou dele.`
    );
  } else ok++;

  // 3. A MANUTENÇÃO — o que decide as horas seguintes, e o que faltava.
  if (!/10 a 20%|10-20%|10–20%/.test(tudo) || !/infus[ãa]o cont[íi]nua/i.test(tudo)) {
    falhas.push(
      "sumiu a infusão de manutenção (10 a 20% da dose total de atropinização, por hora).\n" +
      "      ⚠️ Atropinizar e parar é recair. Esta linha é a que separa o bolus inicial do " +
      "tratamento — e ela não existia no app até 2026-08-17."
    );
  } else ok++;
  if (!/volta|reapare|recome[çc]/i.test(tudo)) {
    falhas.push(
      "sumiu a conduta de RETORNO dos sinais colinérgicos (recomeçar bolus e aumentar a infusão em 20%/h)."
    );
  } else ok++;

  // 4. A PUPILA continua fora do critério — e agora com a razão da fonte.
  if (!/pupila/i.test(tudo)) {
    falhas.push("sumiu a advertência sobre a pupila não servir de guia da atropinização.");
  } else ok++;
}

// ── C-ter. PRALIDOXIMA — O APP APRESENTA, NÃO ESCOLHE (PD-5) ─────────────
//
// ⚠️ ESTE É UM APP GENÉRICO, PARA USUÁRIO GERAL — não é protocolo
// institucional. Onde as fontes divergem, ele apresenta e atribui; escolher
// por um serviço que não conhece é assumir um protocolo alheio.
//
// A tentação era converter a diretriz nacional em posição do app ("é
// brasileiro, a diretriz é brasileira"). E o outro extremo, apagar a droga,
// seria pior: a prática é corrente e o mesilato de pralidoxima está na RENAME —
// o médico pode ter a ampola na mão, e omitir o deixa sem saber o que fazer
// com ela (R-45).
{
  const { consomeConstante } = require("./lib/consumo.cjs");
  const arq = path.join(appDir, "poisoning-decision-tree.ts");
  const col = acoesDe("tox_colinergico").join("\n");

  // ⚠️ O NÓ MUDOU DE NOME, E A ASSERÇÃO NÃO É SOBRE O NOME (R-87).
  //
  // A pralidoxima vivia em `tox_colinergico` quando ele era um nó único. Com a
  // trilha, ela ficou em `coli_manutencao` — de propósito: ela NÃO é fase do
  // protocolo, é decisão PARALELA e controversa, e enterrá-la numa etapa a
  // transformaria em passo obrigatório. A ATROPINA é o tratamento e não depende
  // dessa decisão.
  //
  // O que a conferência protege é que ela seja CONSUMIDA em algum nó da trilha do
  // colinérgico — não em qual deles.
  const NOS_COLINERGICO = ["tox_colinergico", "coli_alvo", "coli_toxicidade", "coli_manutencao"];
  for (const c of ["PRALIDOXIMA_TRES_POSICOES", "PRALIDOXIMA_O_QUE_FAZER"]) {
    const onde = NOS_COLINERGICO.filter(
      (no) => consomeConstante({ arquivo: arq, constante: c, no }).consome
    );
    if (!onde.length) {
      falhas.push(
        `\`${c}\` não é consumida em nenhum nó da trilha do colinérgico ` +
        `(${NOS_COLINERGICO.join(", ")}). ⚠️ Import não é consumo, comentário não é consumo.`
      );
    } else ok++;
  }

  // 1. AS TRÊS POSIÇÕES, NOMEADAS — nenhuma pode desaparecer, porque é a
  //    ausência de uma delas que transforma "apresentar" em "escolher".
  const posicoes = [
    ["Conitec recomenda contra", /Conitec\/MS 2018\) RECOMENDA CONTRA/],
    ["que é recomendação CONDICIONAL", /recomenda[çc][ãa]o CONDICIONAL contra/i],
    ["contraindicação no carbamato", /CONTRAINDICADAS NO CARBAMATO/],
    ["OMS mantém", /A OMS MANT[ÉE]M/],
    ["a advertência do bolus rápido", /NUNCA EM BOLUS R[ÁA]PIDO/],
    ["a meta-análise sem benefício", /META-AN[ÁA]LISE DE ENSAIOS RANDOMIZADOS/],
  ].filter(([, re]) => !re.test(col));
  if (posicoes.length) {
    falhas.push(
      `a controvérsia da pralidoxima perdeu ${posicoes.length} elemento(s): ${posicoes.map((x) => x[0]).join(", ")}.\n` +
      `      ⚠️ Com uma posição de menos, o app deixa de APRESENTAR e passa a ESCOLHER — e escolhe pelo ` +
      `serviço de quem está lendo, que ele não conhece (PD-5). A qualidade declarada da evidência é ` +
      `parte da posição: "condicional, muito baixa" não pode virar "não use".`
    );
  } else ok++;

  // 2. A ATROPINA NÃO ESPERA A DECISÃO SOBRE A OXIMA.
  if (!/não a atrase esperando oxima/i.test(col)) {
    falhas.push(
      "sumiu a frase de que a ATROPINA não espera a decisão sobre a oxima.\n" +
      "      ⚠️ Sem ela, apresentar uma controvérsia num nó de emergência pode paralisar: o médico fica " +
      "decidindo sobre a droga que talvez não sirva, enquanto a que salva não foi dada."
    );
  } else ok++;

  // 3. ⚠️ AS "24–48 h" NÃO PODEM VOLTAR.
  //
  // O número não tem fonte aberta, e o defeito não é a imprecisão: é a falsa
  // tranquilidade. Quem lê "até 48 h" adia o que as fontes sugerem fazer em
  // horas. A trava vigia a janela em horas E exige a declaração de ausência.
  if (/24[–-]48\s*h|48\s*horas/i.test(col)) {
    falhas.push(
      "a janela de 24–48 h voltou ao texto da pralidoxima.\n" +
      "      ⚠️ Não tem fonte aberta, e o dano não é a imprecisão: é a falsa tranquilidade. O " +
      "envelhecimento da enzima é rápido e ESPECÍFICO DE CADA COMPOSTO — quem lê \"até 48 h\" adia o " +
      "que deveria estar correndo."
    );
  } else ok++;
  if (!/CIN[ÉE]TICA POR COMPOSTO NÃO FOI VERIFICADA/i.test(col)) {
    falhas.push(
      "sumiu a declaração de que a cinética de envelhecimento por composto NÃO foi verificada.\n" +
      "      ⚠️ Tirar um número sem fonte e não declarar a lacuna deixa o leitor livre para usar a " +
      "janela que ele lembrar de outro lugar — inclusive a que estava aqui."
    );
  } else ok++;
}

// ── D-bis. O NÓ `identificar` NA LÍNGUA DE QUEM CHEGA ────────────────────
//
// ⚠️ AS TRÊS CONFERÊNCIAS ABAIXO VIGIAM FORMA, NÃO CONTEÚDO — e a razão é que
// o conteúdo já estava certo. A medição de densidade (2026-08-17) achou os
// sinais discriminantes JÁ presentes nos rótulos; o que faltava era ordem de
// leitura. Três defeitos, três conferências.
{
  const no = arvore?.nodes?.identificar;
  const opcoes = no?.options ?? [];

  // ── 1. O MÉTODO NÃO PODE VOLTAR PARA `evidence` ────────────────────────
  //
  // O nó pergunta "qual conjunto de sinais predomina?" e o COMO procurar esse
  // conjunto vivia atrás do "Ver critérios", que renderiza recolhido — R-75 no
  // nó exato da pergunta. Quem não sabe o nome da síndrome é justamente quem
  // precisa da lista de onde olhar.
  //
  // A conferência exige a PUPILA e a PELE nomeadas no summary: são os dois
  // sinais que, no conteúdo deste módulo, separam pares inteiros.
  const summary = typeof no?.summary === "string" ? no.summary : "";
  if (!summary) {
    falhas.push(
      "o nó `identificar` ficou sem `summary` — o visível volta a ser só título, pergunta e os 11 rótulos, " +
      "e nada diz ONDE PROCURAR o \"conjunto de sinais\" que a pergunta pede."
    );
  } else if (!/pupila/i.test(summary) || !/pele/i.test(summary)) {
    falhas.push(
      "o `summary` de `identificar` deixou de nomear PUPILA e/ou PELE.\n" +
      "      ⚠️ São os dois sinais que separam pares inteiros neste módulo (opioide × sedativo; " +
      "anticolinérgico × simpaticomimético). Sem eles a frase vira lista genérica de exame."
    );
  } else ok++;

  // ── 2. SINAL PRIMEIRO, NOME DEPOIS ─────────────────────────────────────
  //
  // ⚠️ ESTA É A CONFERÊNCIA QUE PEGA A REGRESSÃO MAIS PROVÁVEL: alguém
  // "arrumando" os rótulos os devolve à forma «Nome — sinais», que é a que
  // parece organizada. Era a forma que fazia o médico bater numa palavra
  // desconhecida e parar ANTES de chegar aos sinais.
  const NOMES = ["Opioide", "Colinérgico", "Anticolinérgico", "Simpaticomimético",
    "Sedativo", "Serotoninérgico", "Alucinógeno", "Álcool tóxico", "Anestésico local"];
  const invertidos = opcoes.filter((o) =>
    NOMES.some((n) => new RegExp(`^${n}\\b`, "i").test(o.label ?? "")));
  if (invertidos.length) {
    falhas.push(
      `${invertidos.length} rótulo(s) de \`identificar\` voltaram a começar pelo NOME da síndrome:\n` +
      invertidos.map((o) => `        ${o.id}: « ${o.label} »`).join("\n") + "\n" +
      `      ⚠️ O nome vai no FIM, em caixa alta. Quem o domina continua achando — está na linha; ` +
      `quem não o domina lê os sinais primeiro, em vez de parar na palavra (R-70 aplicado à opção).`
    );
  } else ok++;

  // ── 3. O EIXO DA PELE TEM DE SER COMPARÁVEL ────────────────────────────
  //
  // Antes: "pele seca" no anticolinérgico e "sudorese" no simpaticomimético —
  // palavras de FAMÍLIAS diferentes para o mesmo eixo. O leitor precisava
  // saber que eram comparáveis para compará-las, que é pedir o conhecimento
  // que ele veio buscar. É a mesma correção do "SUDOREBA", nos botões.
  const anti = opcoes.find((o) => o.id === "anticolinergico")?.label ?? "";
  const simp = opcoes.find((o) => o.id === "simpaticomimetico")?.label ?? "";
  if (!/pele SECA/.test(anti) || !/pele ÚMIDA/.test(simp)) {
    falhas.push(
      "o par anticolinérgico × simpaticomimético perdeu o eixo comparável da PELE.\n" +
      `        anticolinérgico:   « ${anti} »\n` +
      `        simpaticomimético: « ${simp} »\n` +
      `      ⚠️ Os dois compartilham midríase, agitação e taquicardia; o que os separa à beira do ` +
      `leito é a pele. Escrever "pele SECA" de um lado e "sudorese" do outro obriga o leitor a saber ` +
      `que são o mesmo eixo — e é justamente isso que ele não sabe.`
    );
  } else ok++;

  // ── 4. A PALAVRA QUE O MÉDICO NÃO DOMINA NÃO PODE GUARDAR A PORTA ──────
  //
  // O rótulo do "não sei" dizia "quadro sem toxidrome definida": quem não sabe
  // o que a palavra significa também não sabe dizer se o quadro tem uma.
  for (const id of ["nao_sei", "sei_a_substancia"]) {
    const o = opcoes.find((x) => x.id === id);
    if (o && /toxidrome|toxíndrome/i.test(o.label ?? "")) {
      falhas.push(
        `o rótulo de \`${id}\` voltou a usar a palavra "toxidrome": « ${o.label} ».\n` +
        `      ⚠️ É a saída de quem NÃO reconheceu a síndrome — não pode exigir o vocabulário ` +
        `da síndrome para ser escolhida. Pergunte pelo que o médico consegue responder.`
      );
    } else ok++;
  }
}

// ── E. "Não sei o agente" separado de "sei a substância" ─────────────────
{
  const opcoes = arvore?.nodes?.identificar?.options ?? [];
  const rotulos = opcoes.map((o) => `${o.id}|${o.label}`).join("\n");

  if (/Indefinido \/ substância conhecida/.test(rotulos)) {
    falhas.push(
      "a opção voltou a somar \"não sei o agente\" com \"sei a substância\" — um rótulo para dois estados " +
      "epistêmicos OPOSTOS, e nenhum dos dois com conduta própria."
    );
  } else ok++;

  const naoSei = opcoes.find((o) => o.id === "nao_sei");
  const sei = opcoes.find((o) => o.id === "sei_a_substancia");
  if (!naoSei || !sei) {
    falhas.push("as duas saídas do agente indefinido sumiram — o médico sem toxidrome definida fica sem caminho.");
  } else if (naoSei.next === sei.next) {
    falhas.push(
      `as duas saídas voltaram a levar ao mesmo lugar ("${naoSei.next}"). Separá-las no rótulo e juntá-las no ` +
      `destino é a mesma fusão com outra aparência.`
    );
  } else ok++;

  const desconhecido = acoesDe("agente_desconhecido");
  if (!desconhecido.length) {
    falhas.push("o nó `agente_desconhecido` sumiu — R-48 refinado: o médico que admitiu não saber é quem mais precisa de conduta.");
  } else {
    for (const [nome, padrao] of [
      ["o ECG como o exame que aponta agente", /ECG É O EXAME QUE MAIS APONTA AGENTE/],
      ["paracetamol e salicilato em todos", /DOSAR PARACETAMOL E SALICILATO EM TODOS/],
      ["o CIATox", /CIATox/],
      ["o que imita intoxicação", /NÃO FECHE EM INTOXICAÇÃO SEM DESCARTAR/],
      ["a lembrança do LAST", /LAST/],
    ]) {
      if (!padrao.test(desconhecido.join("\n"))) falhas.push(`agente desconhecido: ${nome} sumiu.`);
      else ok++;
    }
  }
}

// ── F. A saída de NÃO tratar ─────────────────────────────────────────────
{
  const sem = acoesDe("sem_indicacao");
  if (!sem.length) {
    falhas.push(
      "o nó `sem_indicacao` sumiu — todas as saídas do módulo voltam a terminar em FAZER alguma coisa, e a " +
      "exposição que não precisa de tratamento volta a ser empurrada para a via do intoxicado grave."
    );
  } else {
    const texto = sem.join("\n");
    for (const [nome, padrao, porque] of [
      ["os critérios de não indicação", /dose abaixo da tóxica para o peso/, "sem critério, \"não tratar\" vira impressão"],
      ["quem confirma", /CIATox/, "dose tóxica e tempo de risco variam por produto — \"parece pouco\" não é critério"],
      ["o tempo de observação pela farmacocinética", /TEMPO DE RISCO DA SUBSTÂNCIA/, "liberação prolongada e ação longa esticam a janela"],
      ["as exceções que parecem benignas", /paracetamol e salicilato/, "são silenciosos, e \"assintomático agora\" não autoriza alta"],
      ["a avaliação psiquiátrica", /AVALIAÇÃO PSIQUIÁTRICA/, "ausência de toxicidade não é ausência de risco"],
    ]) {
      if (!padrao.test(texto)) falhas.push(`não tratar: ${nome} sumiu — ${porque}.`);
      else ok++;
    }
  }
}

console.log("\nIntoxicações — o LAST que faltava, os dois tetos do flumazenil, o agente desconhecido e a saída de não tratar\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — antídoto único onde ele é executável, tetos separados e o "não sei" com caminho\n`);
process.exit(0);
