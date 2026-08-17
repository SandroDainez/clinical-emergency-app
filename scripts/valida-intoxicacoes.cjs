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

const acoesDe = (id) => (arvore?.nodes?.[id]?.actions ?? []).filter((t) => typeof t === "string");
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

  const causas = fs.readFileSync(path.join(appDir, "lib/causas-reversiveis-detalhe.ts"), "utf8");
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
    const textos = acoesDe(id);
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
