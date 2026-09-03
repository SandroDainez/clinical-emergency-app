#!/usr/bin/env node
/**
 * PROMETE
 *   Que os alvos do TCE saiam de UMA fonte, medido pelo TEXTO QUE A ÁRVORE
 *   PRODUZ e não pelo import; que a meta de PAS continue vindo estratificada
 *   de lib/pas-no-tce.ts e nunca lisa; que o bloco das causas EXTRACRANIANAS
 *   venha ANTES da osmoterapia; que as etapas 2 e 3 da HIC morem na superfície
 *   de AÇÃO; e que a hiperventilação de 3ª linha traga a monitorização como
 *   CONDIÇÃO e o piso de 30.
 *
 * NÃO PROMETE
 *   Cobertura do módulo inteiro. É a primeira trava do TCE, e ela nasce depois
 *   da auditoria (R-21). Não confere se os NÚMEROS clínicos estão certos —
 *   confere que eles têm dono e que a ordem da conduta é a que o texto afirma.
 *
 * UNIVERSO
 *   A árvore do TCE compilada, lib/alvos-tce.ts e lib/pas-no-tce.ts.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ──────────────────────────────────────────────
 *
 * 1. `ALVOS_TCE.pas = "≥ 110 mmHg"` — a meta LISA, sem a estratificação da
 *    BTF, declarada e não consumida por ninguém. Era a D-1 conservada em
 *    formol: no dia em que alguém consumisse, o defeito voltava inteiro por
 *    uma porta que a trava do politrauma não vigia. Esta trava impede que ela
 *    renasça.
 *
 * 2. "⚠️ ANTES de escalar terapia: checar as causas EXTRACRANIANAS" era o
 *    DÉCIMO item de doze, depois de osmoterapia, hiperventilação e
 *    neurocirurgia. A frase sabia o lugar dela; a tela não obedecia. Ordem é
 *    conduta, e por isso ela é conferida por POSIÇÃO.
 *
 * 3. As etapas 2 e 3 da HIC refratária viviam nos `exitCriteria` do nó `uti`,
 *    entre profilaxia de TVP e nutrição enteral — superfície de CONSULTA para
 *    conteúdo de AÇÃO (R-48).
 *
 * 4. Dois PaCO₂ de hiperventilação no mesmo módulo (30–35 na ponte, 25–34 na
 *    3ª etapa) sem dizer que são coisas diferentes — e o 25–34 atravessa o
 *    piso que a literatura aberta declara. O número não mudou (R-5); o que
 *    passou a existir foi a CONDIÇÃO. É a condição que esta trava vigia.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

// ── Compila e carrega: o que se confere é o texto PRODUZIDO ────────────────
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-tce-"));
let arvore = null;
let ALVOS = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node16", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "tce-decision-tree.ts"),
      path.join(appDir, "lib/alvos-tce.ts"),
      path.join(appDir, "lib/pas-no-tce.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "tce-decision-tree.js")).tceDecisionTree;
  ALVOS = require(path.join(tempDir, "lib/alvos-tce.js")).ALVOS_TCE;
} catch (erro) {
  falhas.push(`a árvore do TCE não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

/**
 * ⚠️ TODO o texto do nó — via helper canônico, não por lista de campos.
 *
 * A versão anterior listava campos à mão e ficava cega para os demais. Seis
 * vezes numa sessão isso produziu conclusão errada, a pior delas declarando
 * "beco sem conteúdo" um nó cuja conduta vivia em `exitCriteria` e `targets`.
 * O helper deriva do objeto: campo novo entra sozinho (R-73, D-15).
 */
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const textosDe = (id) => textosDoNo(arvore?.nodes?.[id]);
const todos = arvore ? Object.keys(arvore.nodes).flatMap(textosDe) : [];

// ── A. A meta de PAS é a estratificada, e não existe cópia lisa ────────────
{
  const fonteAlvos = limpo("lib/alvos-tce.ts");
  if (/^\s*pas:/m.test(fonteAlvos)) {
    falhas.push(
      "lib/alvos-tce.ts voltou a declarar `pas` — a meta de PAS no TCE tem UM dono, lib/pas-no-tce.ts, " +
      "porque ela é ESTRATIFICADA POR IDADE. Um `pas: \"≥ 110 mmHg\"` liso aqui é a D-1 renascendo: " +
      "cobra 110 de quem a BTF cobra 100."
    );
  } else ok++;

  const comPas = todos.filter((t) => /PAS\s*≥\s*110/.test(t));
  if (!comPas.length) {
    falhas.push(
      "nenhuma frase do TCE declara a meta de PAS — ou o assunto sumiu, ou mudou de forma. Trava que " +
      "não vê nada aprova tudo (R-15 item 9): corrigir o cenário, não remover a conferência."
    );
  } else ok++;
  for (const t of comPas) {
    if (!/BTF/.test(t) || !/≥\s*100\s*(mmHg\s*)?para\s*50–69/.test(t)) {
      falhas.push(
        `frase com PAS ≥ 110 sem a estratificação da BTF: « ${t.slice(0, 90)}… » — o paciente de 60 anos ` +
        `com PAS 105 está na meta, e o texto liso o marca como hipotenso.`
      );
    } else ok++;
  }
}

// ── B. Fonte única por CONSUMO: o texto produzido repete os números ────────
//
// Import não é consumo (R-15 item 10). O que se confere é que o texto que a
// árvore ENTREGA carrega os valores do objeto — se alguém reescrever um alvo à
// mão com outro número, o texto deixa de casar e a trava acusa.
{
  const paresObrigatorios = [
    ["pic", /PIC/],
    ["ppc", /PPC/],
    ["paco2", /PaCO₂/],
    ["spo2", /SpO₂/],
  ];
  for (const [chave, assunto] of paresObrigatorios) {
    const valor = ALVOS?.[chave];
    if (!valor) {
      falhas.push(`ALVOS_TCE.${chave} sumiu da fonte única.`);
      continue;
    }
    const frases = todos.filter((t) => assunto.test(t) && /mmHg|%/.test(t));
    const divergentes = frases.filter((t) => {
      // Só cobra a frase que declara META desse alvo (traz "Metas" ou "manter").
      if (!/Metas|manter|Manter/.test(t)) return false;
      return !t.includes(valor);
    });
    for (const t of divergentes) {
      falhas.push(
        `frase de meta que não usa ALVOS_TCE.${chave} ("${valor}"): « ${t.slice(0, 90)}… » — cinco lugares ` +
        `com três PaCO₂ diferentes é como esta fonte única nasceu.`
      );
    }
    if (!divergentes.length && frases.length) ok++;
  }
}

// ── C. Ordem: causas extracranianas ANTES da osmoterapia ──────────────────
{
  const acoes = arvore?.nodes?.conduta_hic?.actions ?? [];
  const iExtra = acoes.findIndex((a) => /causas EXTRACRANIANAS/.test(a));
  const iOsmo = acoes.findIndex((a) => /Terapia hiperosmolar/.test(a));
  if (iExtra < 0 || iOsmo < 0) {
    falhas.push(
      "não achei o bloco das causas extracranianas ou a osmoterapia em `conduta_hic` — a conferência de " +
      "ORDEM não rodou sobre nada."
    );
  } else if (iExtra > iOsmo) {
    falhas.push(
      `as causas EXTRACRANIANAS estão na posição ${iExtra + 1} e a osmoterapia na ${iOsmo + 1}. O próprio ` +
      `texto diz "ANTES de escalar terapia" — febre, assincronia, crise, colar apertado e bexigoma ` +
      `resolvem muita PIC sem osmoterapia, e custam segundos para checar. Ordem é conduta.`
    );
  } else ok++;
}

// ── D. As etapas 2 e 3 na superfície de AÇÃO, não na de consulta (R-48) ────
{
  const acoes = (arvore?.nodes?.conduta_hic?.actions ?? []).join("\n");
  const uti = (arvore?.nodes?.uti?.exitCriteria ?? []).join("\n");
  for (const [nome, padrao] of [
    ["a 2ª etapa", /2ª ETAPA/],
    ["a 3ª etapa", /3ª ETAPA/],
  ]) {
    if (!padrao.test(acoes)) {
      falhas.push(
        `${nome} da HIC refratária saiu da superfície de AÇÃO. Quem está com o paciente herniando não vai ` +
        `à lista de rotina da UTI procurar a escalada (R-48).`
      );
    } else ok++;
  }
  if (/tiopental/.test(uti)) {
    falhas.push(
      "o tiopental voltou para os exitCriteria da UTI — medida de resgate é AÇÃO, e ali ela fica entre " +
      "profilaxia de TVP e nutrição enteral."
    );
  } else ok++;
  if (!/escalada em etapas está no passo de conduta/.test(uti)) {
    falhas.push("a UTI perdeu o ponteiro para onde a escalada mora — quem chega pela UTI fica sem o caminho.");
  } else ok++;
}

// ── E. A hiperventilação de 3ª linha: a CONDIÇÃO, não só o número ─────────
{
  const terceira = todos.find((t) => /3ª LINHA/.test(t)) ?? "";
  if (!terceira) {
    falhas.push("a hiperventilação de 3ª linha sumiu — e com ela a condição que torna o 25–34 defensável.");
  } else {
    for (const [nome, padrao, porque] of [
      ["o número do protocolo institucional", /PaCO₂ 25–34 mmHg/, "o número não muda sem reabrir a fonte (R-5) — e a conferência exige \"PaCO₂ … mmHg\" junto, porque a constante repete o 25–34 mais adiante e a menção não é a declaração do alvo"],
      [
        "a monitorização como CONDIÇÃO",
        /SÓ COM MONITORIZAÇÃO ADICIONAL/,
        "sem ela o 25–34 vira permissão de descer abaixo de 30 sem nada para ver isquemia",
      ],
      ["o piso de 30 quando não há monitorização", /o piso é 30 mmHg/, "é o limite que a literatura aberta declara"],
      [
        "o MOTIVO do piso",
        /VASOCONSTRIÇÃO CEREBRAL/,
        "sem o mecanismo, alguém desce \"só um pouco mais\" quando a PIC não cede",
      ],
      [
        "a separação da ponte da herniação",
        /NÃO é a hiperventilação-ponte/,
        "dois PaCO₂ diferentes no mesmo módulo sem rótulo é convite a usar o mais agressivo",
      ],
      [
        "a procedência da literatura aberta",
        /never decrease below PaCO2 values of 30/,
        "cada limite tem de dizer de onde vem",
      ],
    ]) {
      if (!padrao.test(terceira)) {
        falhas.push(`hiperventilação de 3ª linha: ${nome} sumiu — ${porque}.`);
      } else ok++;
    }
  }
  const ponte = todos.find((t) => /ponte para herniação iminente/.test(t)) ?? "";
  if (!/30–35 mmHg/.test(ponte)) {
    falhas.push("a hiperventilação-ponte perdeu o 30–35 — é o alvo do resgate, e não é o mesmo da 3ª linha.");
  } else ok++;
}

// ── F. D-18: a leitura da evidência com POPULAÇÃO e números ───────────────
{
  const tc = todos.find((t) => /SOBRE A TC DE ROTINA/.test(t)) ?? "";
  if (!tc) {
    falhas.push("a leitura da evidência sobre TC de rotina sumiu — o médico volta a não ter os números.");
  } else {
    for (const [nome, padrao] of [
      ["o gatilho clínico", /gatilho que manda é o CLÍNICO/],
      ["o rendimento cirúrgico de 3,5%", /3,5%/],
      ["o 0,7% do anticoagulado", /0,7%/],
      ["a POPULAÇÃO a que os números não se aplicam", /NÃO VALEM PARA O TCE MODERADO OU GRAVE/],
      ["a assimetria de dano", /hematoma tardio não visto custa o paciente/],
    ]) {
      if (!padrao.test(tc)) {
        falhas.push(
          `TC de rotina: ${nome} sumiu. Sem população e sem a assimetria, o texto vira permissão para ` +
          `afrouxar a TC no TCE grave — que é exatamente o que a evidência NÃO sustenta.`
        );
      } else ok++;
    }
  }
  if (!todos.some((t) => /Repetir TC IMEDIATAMENTE se houver deterioração neurológica/.test(t))) {
    falhas.push("a repetição imediata da TC diante de deterioração neurológica sumiu — o gatilho clínico continua obrigatório.");
  } else ok++;
  if (!todos.some((t) => /individualizar TC seriada conforme tipo\/tamanho da lesão/.test(t))) {
    falhas.push("a política explícita de TC seriada individualizada sumiu — retirar a janela fixa não pode virar ausência de reavaliação por imagem.");
  } else ok++;
}

// ── G. PD-4 · A EXCLUSÃO DO TCE PENETRANTE, DECLARADA ────────────────────
//
// ⚠️ A ÚLTIMA CONFERÊNCIA DESTE BLOCO É A MAIS VALIOSA, e vigia o defeito no
// modo como ele NASCEU: por ACRÉSCIMO. A menção a "ferimento penetrante
// craniano" entrou um dia como sinal de gravidade, sozinha — e menção solta
// num app em que tudo o mais tem conduta SUGERE que o assunto está tratado.
// Se amanhã alguém acrescentar outra, numa lista de mecanismos ou num
// critério de imagem, ela nasce igualmente órfã.
//
// Por isso não basta conferir que a exclusão existe: confere-se que NENHUMA
// ocorrência de "penetrante" no módulo está longe dela.
{
  const FRONTEIRA = /SE A CONDUTA DEPENDE DA TRAJETÓRIA, DO OBJETO OU DA DURA/;

  for (const no of ["estabilizacao", "neurocirurgia"]) {
    if (!textosDe(no).some((t) => FRONTEIRA.test(t))) {
      falhas.push(
        `\`${no}\`: sumiu a fronteira de escopo do TCE penetrante. Ela está nas DUAS superfícies de ` +
        `propósito — o gatilho aparece NA PORTA, não depois da tomografia (PD-4).`
      );
    } else ok++;
  }

  const fronteira = todos.find((t) => FRONTEIRA.test(t)) ?? "";
  if (!fronteira) {
    falhas.push("a fronteira do TCE penetrante sumiu do módulo — a exclusão voltou a ser presumida (R-60).");
  } else {
    for (const [nome, padrao, porque] of [
      ["o critério operacional", /SE DEPENDE DE PRESSÃO, PIC, VIA AÉREA E COAGULAÇÃO, ESTÁ AQUI/, "cinco eixos ninguém decora sob pressão; o critério de três palavras, sim"],
      ["o que NÃO muda", /O QUE VOCÊ JÁ ESTÁ FAZENDO NÃO MUDA/, "fronteira e não muro — interromper conduta correta é o único erro que a ressalva pode causar"],
      ["o eixo do antibiótico SEM esquema", /nomeia o eixo e não prescreve esquema/, "meia-cobertura de antibiótico é pior que nenhuma"],
      ["o objeto encravado", /NÃO SE REMOVE fora do centro cirúrgico/, "ele pode estar tamponando o vaso que ele mesmo lesou"],
      ["a saída nomeada", /Penetrating Traumatic Brain Injury, 2ª edição \(2025\)/, "exclusão sem ponteiro é abandono (R-60)"],
    ]) {
      if (!padrao.test(fronteira)) falhas.push(`escopo penetrante: ${nome} sumiu — ${porque}.`);
      else ok++;
    }

    if (!todos.some((t) => /continua sendo GATILHO DE ACIONAMENTO IMEDIATO/.test(t))) {
      falhas.push(
        "sumiu a ressalva de leitura: sem ela, alguém entende que \"penetrante\" agora só serve para mandar " +
        "o médico embora. Acionar a neurocirurgia sem esperar o laudo é conduta DESTE módulo, e permanece."
      );
    } else ok++;
  }

  // ⚠️ NENHUMA MENÇÃO ÓRFÃ — a conferência que impede o renascimento.
  for (const id of Object.keys(arvore?.nodes ?? {})) {
    const textos = textosDe(id);
    const mencoes = textos.filter((t) => /penetrante/i.test(t) && !FRONTEIRA.test(t) && !/GATILHO DE ACIONAMENTO IMEDIATO/.test(t));
    if (!mencoes.length) continue;
    if (!textos.some((t) => FRONTEIRA.test(t))) {
      falhas.push(
        `\`${id}\`: menção a "penetrante" SEM a fronteira de escopo no mesmo nó — « ${mencoes[0].slice(0, 80)}… ». ` +
        `⚠️ É assim que o defeito nasceu: menção solta, num app em que tudo o mais tem conduta, sugere que o ` +
        `assunto está tratado. Ou a menção vem com a fronteira, ou não vem.`
      );
    } else ok++;
  }
}

console.log("\nTCE — alvos com um dono, a ordem da escalada e o piso de 30 com a condição que o sustenta\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — fonte única por consumo, causas extracranianas primeiro, resgate rotulado\n`);
process.exit(0);
